"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DiscogsLookup } from "@/components/discogs-lookup"

const CONDITIONS = ["Mint", "Near Mint", "Very Good Plus", "Very Good", "Good", "Fair", "Poor"]

export function RecordForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    year: "",
    genre: "",
    label: "",
    catalog_number: "",
    condition: "Good",
    notes: "",
    image_url: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDiscogsSelect = (record: any) => {
    setFormData((prev) => ({
      ...prev,
      title: record.album || prev.title,
      artist: record.artist || prev.artist,
      album: record.album || prev.album,
      year: record.year ? record.year.toString() : prev.year,
      genre: record.genre || prev.genre,
      label: record.label || prev.label,
      catalog_number: record.catalog_number || prev.catalog_number,
      image_url: record.image_url || prev.image_url,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          year: formData.year ? Number.parseInt(formData.year) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add record")
      }

      toast({
        title: "Record added successfully!",
        description: `${formData.title} by ${formData.artist} has been added to your collection.`,
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Error adding record",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Add New Record</h1>
          </div>

          <div className="mb-6">
            <DiscogsLookup onSelectRecord={handleDiscogsSelect} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Record Details</CardTitle>
              <CardDescription>
                Fill in the information for your vinyl record or use Discogs lookup above
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Song or album title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) => handleInputChange("artist", e.target.value)}
                      placeholder="Artist or band name"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="album">Album</Label>
                    <Input
                      id="album"
                      value={formData.album}
                      onChange={(e) => handleInputChange("album", e.target.value)}
                      placeholder="Album name (if different from title)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                      placeholder="Release year"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) => handleInputChange("genre", e.target.value)}
                      placeholder="Rock, Jazz, Classical, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDITIONS.map((condition) => (
                          <SelectItem key={condition} value={condition}>
                            {condition}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="label">Record Label</Label>
                    <Input
                      id="label"
                      value={formData.label}
                      onChange={(e) => handleInputChange("label", e.target.value)}
                      placeholder="Columbia, Atlantic, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catalog_number">Catalog Number</Label>
                    <Input
                      id="catalog_number"
                      value={formData.catalog_number}
                      onChange={(e) => handleInputChange("catalog_number", e.target.value)}
                      placeholder="Catalog or matrix number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange("image_url", e.target.value)}
                    placeholder="https://example.com/album-cover.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Any additional notes about this record..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Adding Record..." : "Add Record"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
