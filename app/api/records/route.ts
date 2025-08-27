import { createUserRecord, getUserRecords } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { recordSchema } from "@/lib/validation"
import { rateLimit } from "@/lib/rate-limit"
import { stackServerApp } from "@/stack"
import { getEffectiveUser } from "@/lib/auth-utils"
import { getClientIP } from "@/lib/security-utils"

export async function POST(request: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser()
    const user = getEffectiveUser(stackUser)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`create-record:${clientIP}`, 5, 60000) // 5 requests per minute

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        },
      )
    }

    const body = await request.json()

    const validationResult = recordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 },
      )
    }

    const validatedData = validationResult.data

    const newRecord = await createUserRecord(validatedData, user.id)

    return NextResponse.json(newRecord, {
      status: 201,
      headers: {
        "X-RateLimit-Limit": "5",
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
      },
    })
  } catch (error) {
    console.error("Error adding record:", error)
    if (error instanceof Error && error.message.includes("duplicate key")) {
      return NextResponse.json({ error: "A record with this information already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to add record. Please try again." }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const stackUser = await stackServerApp.getUser()
    const user = getEffectiveUser(stackUser)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const clientIP = getClientIP(request)
    const rateLimitResult = rateLimit(`fetch-records:${clientIP}`, 30, 60000) // 30 requests per minute

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    const records = await getUserRecords(user.id)

    return NextResponse.json({
      records,
      pagination: {
        page: 1,
        limit: records.length,
        total: records.length,
        totalPages: 1,
      },
    })
  } catch (error) {
    console.error("Error fetching records:", error)
    return NextResponse.json({ error: "Failed to fetch records. Please try again." }, { status: 500 })
  }
}
