import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set")
}

const sql = neon(process.env.DATABASE_URL)

export { sql }

export type Record = {
  id: number
  title: string
  artist: string
  album?: string
  year?: number
  genre?: string
  label?: string
  catalog_number?: string
  condition?: string
  notes?: string
  image_url?: string
  user_id?: string // Added user_id field for user association
  created_at: string
  updated_at: string
}

export async function getUserRecords(userId: string): Promise<Record[]> {
  const records = await sql`
    SELECT * FROM records 
    WHERE user_id = ${userId} 
    ORDER BY created_at DESC
  `
  return records as Record[]
}

export async function createUserRecord(
  record: Omit<Record, "id" | "created_at" | "updated_at">,
  userId: string,
): Promise<Record> {
  const [newRecord] = await sql`
    INSERT INTO records (
      title, artist, album, year, genre, label, catalog_number, 
      condition, notes, image_url, user_id
    ) VALUES (
      ${record.title}, ${record.artist}, ${record.album}, ${record.year}, 
      ${record.genre}, ${record.label}, ${record.catalog_number}, 
      ${record.condition}, ${record.notes}, ${record.image_url}, ${userId}
    )
    RETURNING *
  `
  return newRecord as Record
}

export async function getUserRecord(recordId: number, userId: string): Promise<Record | null> {
  const [record] = await sql`
    SELECT * FROM records 
    WHERE id = ${recordId} AND user_id = ${userId}
  `
  return (record as Record) || null
}

export async function updateUserRecord(
  recordId: number,
  record: Partial<Omit<Record, "id" | "created_at" | "updated_at" | "user_id">>,
  userId: string,
): Promise<Record | null> {
  const [updatedRecord] = await sql`
    UPDATE records SET
      title = COALESCE(${record.title}, title),
      artist = COALESCE(${record.artist}, artist),
      album = COALESCE(${record.album}, album),
      year = COALESCE(${record.year}, year),
      genre = COALESCE(${record.genre}, genre),
      label = COALESCE(${record.label}, label),
      catalog_number = COALESCE(${record.catalog_number}, catalog_number),
      condition = COALESCE(${record.condition}, condition),
      notes = COALESCE(${record.notes}, notes),
      image_url = COALESCE(${record.image_url}, image_url),
      updated_at = NOW()
    WHERE id = ${recordId} AND user_id = ${userId}
    RETURNING *
  `
  return (updatedRecord as Record) || null
}
