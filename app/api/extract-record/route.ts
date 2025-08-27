import { type NextRequest, NextResponse } from "next/server"
import { xai } from "@ai-sdk/xai"
import { generateObject } from "ai"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"
import { imageUploadSchema } from "@/lib/validation"
import { stackServerApp } from "@/stack"
import { getEffectiveUser } from "@/lib/auth-utils"

const recordSchema = z.object({
  title: z.string().describe("The album title"),
  artist: z.string().describe("The artist or band name"),
  year: z.number().optional().describe("Release year if visible"),
  genre: z.string().optional().describe("Music genre if determinable"),
  label: z.string().optional().describe("Record label if visible"),
  catalog_number: z.string().optional().describe("Catalog number if visible"),
  condition: z
    .enum(["Mint", "Near Mint", "Very Good Plus", "Very Good", "Good Plus", "Good", "Fair", "Poor"])
    .optional()
    .describe("Visual condition assessment"),
  notes: z.string().optional().describe("Any additional notes about the record"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting record extraction API")

    const stackUser = await stackServerApp.getUser()
    const user = getEffectiveUser(stackUser)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const clientIP = request.ip || request.headers.get("x-forwarded-for") || "anonymous"
    const rateLimitResult = rateLimit(`extract-record:${clientIP}`, 3, 300000) // 3 requests per 5 minutes

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many extraction requests. Please wait before trying again." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      )
    }

    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      console.log("[v0] No image file provided")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const fileValidation = imageUploadSchema.safeParse({ file })
    if (!fileValidation.success) {
      return NextResponse.json(
        {
          error: "Invalid file",
          details: fileValidation.error.errors.map((err) => err.message),
        },
        { status: 400 },
      )
    }

    console.log("[v0] Processing image file:", file.name, file.type, file.size)

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 413 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("[v0] Image converted to base64, calling AI model")

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("AI processing timeout")), 30000),
    )

    const aiPromise = generateObject({
      model: xai("grok-2-vision-1212"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this vinyl record image and extract all visible information. Look for the album title, artist name, release year, record label, catalog number, and assess the visual condition. If any information is not clearly visible, leave those fields empty. Be as accurate as possible.",
            },
            {
              type: "image",
              image: dataUrl,
            },
          ],
        },
      ],
      schema: recordSchema,
    })

    const result = await Promise.race([aiPromise, timeoutPromise])

    console.log("[v0] AI extraction successful:", result.object)

    return NextResponse.json(
      { data: result.object },
      {
        headers: {
          "X-RateLimit-Limit": "3",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error extracting record info:", error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        return NextResponse.json(
          { error: "AI processing took too long. Please try with a smaller or clearer image." },
          { status: 408 },
        )
      }
      if (error.message.includes("rate limit") || error.message.includes("quota")) {
        return NextResponse.json(
          { error: "AI service temporarily unavailable. Please try again later." },
          { status: 503 },
        )
      }
    }

    return NextResponse.json(
      {
        error: "Failed to extract record information. Please ensure the image is clear and try again.",
        details:
          process.env.NODE_ENV === "development" ? (error instanceof Error ? error.message : String(error)) : undefined,
      },
      { status: 500 },
    )
  }
}
