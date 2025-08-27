"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Disc3, Plus, Camera, LogIn } from "lucide-react"
import { RecordCard } from "./record-card"
import type { Record } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@stackframe/stack"
import Link from "next/link"
import { isDevelopment, createGuestUser } from "@/lib/auth-utils"

export function CollectionBrowser() {
  const [records, setRecords] = useState<Record[]>([])
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const stackUser = useUser()

  const user = isDevelopment && !stackUser ? createGuestUser() : stackUser

  // Fetch records on component mount
  useEffect(() => {
    if (user) {
      fetchRecords()
    } else {
      setIsLoading(false)
    }
  }, [user])

  // Filter and sort records when filters change
  useEffect(() => {
    let filtered = [...records]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.album?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.genre?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply genre filter
    if (genreFilter !== "all") {
      filtered = filtered.filter((record) => record.genre === genreFilter)
    }

    // Apply condition filter
    if (conditionFilter !== "all") {
      filtered = filtered.filter((record) => record.condition === conditionFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "artist":
          return a.artist.localeCompare(b.artist)
        case "year":
          return (b.year || 0) - (a.year || 0)
        default:
          return 0
      }
    })

    setFilteredRecords(filtered)
  }, [records, searchTerm, genreFilter, conditionFilter, sortBy])

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/records")
      if (!response.ok) {
        if (response.status === 401) {
          setRecords([])
          return
        }
        throw new Error("Failed to fetch records")
      }
      const data = await response.json()

      if (data.records && Array.isArray(data.records)) {
        setRecords(data.records)
      } else if (Array.isArray(data)) {
        setRecords(data)
      } else {
        console.error("[v0] API returned non-array data:", data)
        setRecords([])
        toast({
          title: "Error loading records",
          description: "Invalid data format received from server.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching records:", error)
      setRecords([])
      toast({
        title: "Error loading records",
        description: "Please try refreshing the page.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecord = async (id: number) => {
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete record")

      setRecords((prev) => prev.filter((record) => record.id !== id))
      toast({
        title: "Record deleted",
        description: "The record has been removed from your collection.",
      })
    } catch (error) {
      toast({
        title: "Error deleting record",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Get unique genres and conditions for filters
  const uniqueGenres = [...new Set(records.map((r) => r.genre).filter(Boolean))].sort()
  const uniqueConditions = [...new Set(records.map((r) => r.condition))].sort()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Disc3 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading your collection...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Collection</CardTitle>
          <CardDescription>Sign in to view and manage your vinyl records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <LogIn className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Sign in to access your collection</p>
            <p className="mb-6">Create an account to start cataloging your vinyl records!</p>
            <div className="flex gap-3 justify-center">
              <Link href="/handler/sign-in">
                <Button>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/handler/sign-up">
                <Button variant="outline" className="bg-transparent">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Collection</CardTitle>
          <CardDescription>
            {isDevelopment && user.id === "guest-user"
              ? "Browse and manage your vinyl records (Development Mode)"
              : "Browse and manage your vinyl records"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Disc3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No records in your collection yet</p>
            <p className="mb-6">Add your first record to get started!</p>
            <div className="flex gap-3 justify-center">
              <Link href="/add-record">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </Link>
              <Link href="/upload-photo">
                <Button variant="outline" className="bg-transparent">
                  <Camera className="h-4 w-4 mr-2" />
                  Scan Cover
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Disc3 className="h-5 w-5" />
            Your Collection ({records.length} records)
            {isDevelopment && user.id === "guest-user" && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Dev Mode</span>
            )}
          </CardTitle>
          <CardDescription>Browse and manage your vinyl records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, album, or genre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  {uniqueGenres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  {uniqueConditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="artist">Artist A-Z</SelectItem>
                  <SelectItem value="year">Year (Newest)</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || genreFilter !== "all" || conditionFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setGenreFilter("all")
                    setConditionFilter("all")
                  }}
                  className="bg-transparent"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No records match your filters</p>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecords.map((record) => (
            <RecordCard key={record.id} record={record} onDelete={handleDeleteRecord} />
          ))}
        </div>
      )}
    </div>
  )
}
