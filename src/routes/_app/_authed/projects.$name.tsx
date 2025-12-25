import { Button } from '@/components/ui/button'
import {
  Comparison,
  ComparisonHandle,
  ComparisonItem,
} from '@/components/ui/shadcn-io/comparison'
import { Spinner } from '@/components/ui/spinner'
import {
  useImageUrl,
  useImageWithoutBgUrl,
  useRemoveImageBackground,
} from '@/lib/query'
import { createFileRoute } from '@tanstack/react-router'
import { CircleCheck, Download, Wand } from 'lucide-react'

export const Route = createFileRoute('/_app/_authed/projects/$name')({
  component: RouteComponent,
})

function RouteComponent() {
  const { name } = Route.useParams()
  const { data } = useImageUrl(name)
  const { data: imageWithoutBgUrl } = useImageWithoutBgUrl(name)
  const removeBgMutation = useRemoveImageBackground()

  const download = async () => {
    if (!imageWithoutBgUrl) return
    const fileUrl = imageWithoutBgUrl
    const fileName = 'no-bg-' + name

    const response = await fetch(fileUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 space-y-2">
      {!imageWithoutBgUrl ? (
        <img src={data} className="aspect-video rounded-lg" />
      ) : (
        <Comparison className="aspect-video bg-muted rounded-lg">
          <ComparisonItem position="left">
            <img src={imageWithoutBgUrl} className="aspect-video" />
          </ComparisonItem>
          <ComparisonItem position="right">
            <img src={data} className="aspect-video" />
          </ComparisonItem>
          <ComparisonHandle />
        </Comparison>
      )}
      {removeBgMutation.error && <p>error: {removeBgMutation.error.message}</p>}
      <div className="flex justify-center">
        {!imageWithoutBgUrl && (
          <Button
            size="lg"
            onClick={() => removeBgMutation.mutate({ data: { name } })}
          >
            {removeBgMutation.isPending ? (
              <Spinner />
            ) : removeBgMutation.isSuccess ? (
              <CircleCheck />
            ) : (
              <Wand />
            )}
            Remove Bg
          </Button>
        )}

        {imageWithoutBgUrl && (
          <Button size={'lg'} onClick={download}>
            <Download />
            Download Image
          </Button>
        )}
      </div>
    </div>
  )
}
