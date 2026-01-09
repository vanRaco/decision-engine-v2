"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { PlaybookDetail } from "@/components/playbooks/playbook-detail"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPlaybookById } from "@/lib/playbooks"
import { ArrowLeft } from "lucide-react"

export default function PlaybookDetailPage() {
  const params = useParams()
  const playbookId = params.id as string
  const playbook = getPlaybookById(playbookId)

  if (!playbook) {
    return (
      <AppLayout title="Playbook Detail" subtitle="Playbook not found">
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            <div className="text-sm text-muted-foreground">We could not find that playbook.</div>
            <Button variant="outline" className="bg-transparent" asChild>
              <Link href="/playbooks">Return to Playbook Library</Link>
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Playbook Detail" subtitle={playbook.name}>
      <div className="space-y-4">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href="/playbooks">
            <ArrowLeft className="h-4 w-4" />
            Back to library
          </Link>
        </Button>
        <PlaybookDetail playbook={playbook} />
      </div>
    </AppLayout>
  )
}
