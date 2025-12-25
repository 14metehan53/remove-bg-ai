import { ImageUploader } from '@/components/ImageUploader'
import { PreviousUploadCard } from '@/components/PreviousUploadCard'
import { useUploads } from '@/lib/query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_authed/projects/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useUploads()
  return (
    <div className="p-4 space-y-2">
      <ImageUploader />
      Recent Uploads
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {data?.map((entry) => (
          <PreviousUploadCard key={entry.id} name={entry.name} />
        ))}
      </div>
    </div>
  )
}
