import { EditRecordForm } from "@/components/edit-record-form"

interface EditRecordPageProps {
  params: { id: string }
}

export default function EditRecordPage({ params }: EditRecordPageProps) {
  return <EditRecordForm recordId={params.id} />
}
