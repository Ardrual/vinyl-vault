"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Disc3 } from "lucide-react"
import type { Record } from "@/lib/db"
import Link from "next/link"

interface RecordCardProps {
  record: Record
  onDelete?: (id: number) => void
}

export function RecordCard({ record, onDelete }: RecordCardProps) {
  const handleDelete = () => {
    if (onDelete && confirm("Are you sure you want to delete this record?")) {
      onDelete(record.id)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
          {record.image_url ? (
            <img
              src={record.image_url || "/placeholder.svg"}
              alt={`${record.title} by ${record.artist}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc3 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{record.title}</h3>
          <p className="text-muted-foreground font-medium">{record.artist}</p>
          {record.album && record.album !== record.title && (
            <p className="text-sm text-muted-foreground">{record.album}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {record.year && <span>{record.year}</span>}
            {record.genre && (
              <>
                {record.year && <span>•</span>}
                <Badge variant="secondary" className="text-xs">
                  {record.genre}
                </Badge>
              </>
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {record.condition}
          </Badge>
        </div>

        {record.label && (
          <p className="text-xs text-muted-foreground mb-3">
            {record.label}
            {record.catalog_number && ` • ${record.catalog_number}`}
          </p>
        )}

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/record/${record.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDelete} className="bg-transparent">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
