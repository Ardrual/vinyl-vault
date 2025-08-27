import { z } from "zod"

export const recordSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  artist: z.string().min(1, "Artist is required").max(200, "Artist too long"),
  album: z.string().max(200, "Album name too long").optional(),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional(),
  genre: z.string().max(100, "Genre too long").optional(),
  label: z.string().max(100, "Label too long").optional(),
  catalog_number: z.string().max(50, "Catalog number too long").optional(),
  condition: z
    .enum(["Mint", "Near Mint", "Very Good Plus", "Very Good", "Good Plus", "Good", "Fair", "Poor"])
    .optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
  purchase_price: z.number().min(0).optional(),
  purchase_date: z.string().optional(),
  purchase_location: z.string().max(200, "Purchase location too long").optional(),
})

export const imageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 10 * 1024 * 1024, "File size must be less than 10MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "File must be a JPEG, PNG, or WebP image",
    ),
})

export type RecordInput = z.infer<typeof recordSchema>
