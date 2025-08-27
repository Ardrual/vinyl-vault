import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const DiscogsSearchSchema = z.object({
  catno: z.string().min(1, "Catalog number is required"),
})

interface DiscogsRelease {
  id: number
  title: string
  year?: number
  genre?: string[]
  style?: string[]
  label?: string[]
  catno?: string
  format?: string[]
  country?: string
  thumb?: string
  cover_image?: string
}

interface DiscogsSearchResponse {
  results: DiscogsRelease[]
  pagination: {
    items: number
    page: number
    pages: number
    per_page: number
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const catno = searchParams.get("catno")

    // Validate input
    const validation = DiscogsSearchSchema.safeParse({ catno })
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid catalog number", details: validation.error.errors }, { status: 400 })
    }

    console.log("[v0] Searching Discogs for catalog number:", catno)

    // Call Discogs API
    const discogsUrl = `https://api.discogs.com/database/search?catno=${encodeURIComponent(catno!)}&type=release&per_page=10`

    const response = await fetch(discogsUrl, {
      headers: {
        "User-Agent": "RecordCollectionApp/1.0 +https://v0.app",
        Accept: "application/vnd.discogs.v2.plaintext+json",
      },
    })

    if (!response.ok) {
      console.error("[v0] Discogs API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to search Discogs database" }, { status: response.status })
    }

    const data: DiscogsSearchResponse = await response.json()
    console.log("[v0] Discogs search results:", data.results.length, "releases found")

    // Transform the results to match our record format
    const transformedResults = data.results.map((release) => ({
      id: release.id,
      title: release.title,
      artist: release.title.split(" - ")[0] || "", // Extract artist from title
      album: release.title.split(" - ")[1] || release.title, // Extract album from title
      year: release.year || null,
      genre: release.genre?.[0] || "",
      label: release.label?.[0] || "",
      catalog_number: release.catno || catno,
      format: release.format?.[0] || "",
      country: release.country || "",
      image_url: release.cover_image || release.thumb || "",
      discogs_id: release.id,
    }))

    return NextResponse.json({
      success: true,
      results: transformedResults,
      total: data.pagination.items,
    })
  } catch (error) {
    console.error("[v0] Error in Discogs lookup:", error)
    return NextResponse.json({ error: "Internal server error during Discogs lookup" }, { status: 500 })
  }
}
