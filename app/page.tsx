import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Camera, Disc3 } from "lucide-react"
import { CollectionBrowser } from "@/components/collection-browser"
import { AuthNav } from "@/components/auth-nav"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Disc3 className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Vinyl Vault</h2>
          </div>
          <AuthNav />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-balance mb-4">Your Record Collection</h1>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Your personal vinyl record collection manager. Add records manually or scan album covers with AI-powered
            recognition.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Record Manually
              </CardTitle>
              <CardDescription>Enter record details by hand with our comprehensive form</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/add-record">
                <Button className="w-full">Start Adding Records</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scan Album Cover
              </CardTitle>
              <CardDescription>Take a photo and let AI extract the record information</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/upload-photo">
                <Button variant="outline" className="w-full bg-transparent">
                  Upload Photo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Collection Browser */}
        <div className="max-w-7xl mx-auto">
          <CollectionBrowser />
        </div>
      </div>
    </div>
  )
}
