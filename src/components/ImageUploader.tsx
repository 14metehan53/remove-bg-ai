import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/shadcn-io/dropzone'
import { useUploadImage } from '@/lib/query'
import { useNavigate } from '@tanstack/react-router'
import { FileCheck, FileWarning } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Spinner } from './ui/spinner'

export const ImageUploader = () => {
  const { mutateAsync, status, error, reset } = useUploadImage()
  const navigate = useNavigate()
  const handleDrop = async (files: File[]) => {
    const file = files[0]
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    mutateAsync({
      data: {
        file: uint8Array,
        contenType: file.type,
      },
    }).then((name) => navigate({ to: '/projects/$name', params: { name } }))
  }
  return (
    <div className="max-w-lg mx-auto">
      {status === 'idle' && (
        <Dropzone
          className="aspect-video"
          accept={{ 'image/*': [] }}
          onDrop={handleDrop}
          onError={console.error}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      )}
      {status === 'pending' && (
        <Card className="flex items-center justify-center aspect-video">
          <Spinner className="size-12" />
          Uploading...
        </Card>
      )}
      {status === 'success' && (
        <Card className="flex items-center justify-center aspect-video">
          <FileCheck className="size-12" />
          Successfully uploaded image.
        </Card>
      )}
      {status === 'error' && (
        <Card className="flex items-center justify-center aspect-video">
          <FileWarning className="size-12" />
          Error while uploading the image.
          <pre className="whitespace-pre-wrap mx-4 bg-muted p-2 rounded">
            {error?.message}
          </pre>
          <Button onClick={reset}>Retry</Button>
        </Card>
      )}
    </div>
  )
}
