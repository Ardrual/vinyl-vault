"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Camera, X, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

function ExtractedRecordReview({
  data,
  previewUrl,
  onSave,
  onBack,
  isLoading,
}: {
  data: any
  previewUrl: string | null
  onSave: (data: any) => void
  onBack: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState(data)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Extracted Information</CardTitle>
        <CardDescription>Please review and edit the extracted record information before saving.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {previewUrl && (
            <div>
              <img src={previewUrl || "/placeholder.svg"} alt="Album cover" className="w-full rounded-lg shadow-lg" />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Artist *</label>
              <input
                type="text"
                value={formData.artist || ""}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <input
                  type="number"
                  value={formData.year || ""}
                  onChange={(e) => setFormData({ ...formData, year: Number.parseInt(e.target.value) || null })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <select
                  value={formData.condition || ""}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select condition</option>
                  <option value="Mint">Mint</option>
                  <option value="Near Mint">Near Mint</option>
                  <option value="Very Good Plus">Very Good Plus</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good Plus">Good Plus</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <input
                type="text"
                value={formData.genre || ""}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                Back to Upload
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Save Record"}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

export function PhotoUpload() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)

      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    },
    [toast],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsExtracting(true)
    try {
      const formData = new FormData()
      formData.append("image", selectedFile)

      const response = await fetch("/api/extract-record", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to extract record information")
      }

      const result = await response.json()
      setExtractedData(result.data)

      toast({
        title: "Record information extracted!",
        description: "Please review and edit the details below.",
      })
    } catch (error) {
      toast({
        title: "Extraction failed",
        description: "Please try again or enter the information manually.",
        variant: "destructive",
      })
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSaveRecord = async (recordData: any) => {
    setIsUploading(true)
    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      })

      if (!response.ok) {
        throw new Error("Failed to save record")
      }

      toast({
        title: "Record saved successfully!",
        description: "Your record has been added to your collection.",
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
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
            <h1 className="text-3xl font-bold">Scan Album Cover</h1>
          </div>

          {extractedData ? (
            <ExtractedRecordReview
              data={extractedData}
              previewUrl={previewUrl}
              onSave={handleSaveRecord}
              onBack={() => setExtractedData(null)}
              isLoading={isUploading}
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Upload Album Photo
                  </CardTitle>
                  <CardDescription>
                    Take a photo or upload an image of your album cover. Our AI will extract the record information
                    automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedFile ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragOver
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25 hover:border-muted-foreground/50"
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-muted">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-lg font-medium mb-2">Drop your album photo here</p>
                          <p className="text-muted-foreground mb-4">or click to browse files</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInput}
                            className="hidden"
                            id="file-input"
                          />
                          <label htmlFor="file-input">
                            <Button variant="outline" className="cursor-pointer bg-transparent">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Choose File
                            </Button>
                          </label>
                        </div>
                        <p className="text-sm text-muted-foreground">Supports JPG, PNG, WebP up to 10MB</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={previewUrl! || "/placeholder.svg"}
                          alt="Album cover preview"
                          className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                        />
                        <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={clearFile}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-center">
                        <p className="font-medium mb-1">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" onClick={clearFile} className="flex-1 bg-transparent">
                          Choose Different Photo
                        </Button>
                        <Button onClick={handleUpload} disabled={isExtracting} className="flex-1">
                          {isExtracting ? "Extracting..." : "Extract Record Info"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Tips for Best Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Ensure the album cover is well-lit and clearly visible</li>
                    <li>• Try to capture the entire front cover in the frame</li>
                    <li>• Avoid glare or reflections on the album surface</li>
                    <li>• Higher resolution images provide better extraction accuracy</li>
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
