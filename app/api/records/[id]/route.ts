import { getUserRecord, updateUserRecord } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { stackServerApp } from "@/stack"
import { sql } from "@/lib/db"
import { getEffectiveUser } from "@/lib/auth-utils"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stackUser = await stackServerApp.getUser()
    const user = getEffectiveUser(stackUser)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 })
    }

    const record = await getUserRecord(id, user.id)

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("Error fetching record:", error)
    return NextResponse.json({ error: "Failed to fetch record" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stackUser = await stackServerApp.getUser()
    const user = getEffectiveUser(stackUser)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM records WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Record deleted successfully" })
  } catch (error) {
    console.error("Error deleting record:", error)
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const stackUser = await stackServerApp.getUser()
    const user = getEffectiveUser(stackUser)

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid record ID" }, { status: 400 })
    }

    const body = await request.json()

    const updatedRecord = await updateUserRecord(id, body, user.id)

    if (!updatedRecord) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error("Error updating record:", error)
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 })
  }
}
