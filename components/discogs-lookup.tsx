"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, ExternalLink } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DiscogsResult {
  id: number
  title: string
  artist: string
  album: string
  year: number | null
  genre: string
  label: string
  catalog_number: string
  format: string
  country: string
  image_url: string
  discogs_id: number
}

interface DiscogsLookupProps {
  onSelectRecord: (record: Partial<DiscogsResult>) => void
}

export function DiscogsLookup({ onSelectRecord }: DiscogsLookupProps) {
  const [catalogNumber, setCatalogNumber] = useState("")
  const [results, setResults] = useState<DiscogsResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!catalogNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a catalog number",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/discogs-lookup?catno=${encodeURIComponent(catalogNumber)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search Discogs")
      }

      setResults(data.results || [])

      if (data.results?.length === 0) {
        toast({
          title: "No results",
          description: "No releases found for this catalog number",
        })
      } else {
        toast({
          title: "Success",
          description: `Found ${data.results.length} release(s)`,
        })
      }
    } catch (error) {
      console.error("Discogs lookup error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search Discogs",
        variant: "destructive",
      })
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectRecord = (record: DiscogsResult) => {
    onSelectRecord({
      artist: record.artist,
      album: record.album,
      year: record.year,
      genre: record.genre,
      label: record.label,
      catalog_number: record.catalog_number,
      format: record.format,
      country: record.country,
      image_url: record.image_url,
    })

    toast({
      title: "Record selected",
      description: "Form has been filled with Discogs data",
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Discogs Catalog Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter catalog number (e.g., WARP-001)"
              value={catalogNumber}
              onChange={(e) => setCatalogNumber(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading} className="shrink-0">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {hasSearched && (
        <div className="space-y-3">
          {results.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold">Search Results</h3>
              {results.map((record) => (
                <Card key={record.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {record.image_url && (
                        <img
                          src={record.image_url || "/placeholder.svg"}
                          alt={record.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-semibold">{record.artist}</h4>
                          <p className="text-muted-foreground">{record.album}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {record.year && <Badge variant="secondary">{record.year}</Badge>}
                          {record.genre && <Badge variant="outline">{record.genre}</Badge>}
                          {record.format && <Badge variant="outline">{record.format}</Badge>}
                          {record.label && <Badge variant="outline">{record.label}</Badge>}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Cat#: {record.catalog_number}</span>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleSelectRecord(record)}>
                              Use This Record
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(`https://www.discogs.com/release/${record.discogs_id}`, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                No releases found for catalog number "{catalogNumber}"
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
