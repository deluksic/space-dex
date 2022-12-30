import { CreateSpaceForm } from '~/components/CreateSpaceForm'
import ui from './index.module.css'

export default function Home() {
  return (
    <main class={ui.container}>
      <h1 class={ui.welcome}>Welcome to SpaceDex!</h1>
      <CreateSpaceForm />
    </main>
  )
}
