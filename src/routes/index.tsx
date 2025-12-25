import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="flex items-center flex-col min-h-screen justify-center gap-2">
      <div className="text-3xl font-bold">Image Background Remover</div>
      <div className="text-2xl">
        The Best Image Background Remover on The Web.
      </div>
      <Button asChild>
        <Link to="/projects">Get Started Free</Link>
      </Button>
    </div>
  )
}
