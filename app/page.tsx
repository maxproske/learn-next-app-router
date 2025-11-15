import { setTimeout } from 'node:timers/promises'
import { Suspense } from 'react'
import Chat from './chat'

async function getTitleFromDatabase() {
  // { setTimeout } from 'node:timers/promises' allows you to call timeout
  // with a number instead of a function
  await setTimeout(1000)

  return 'Hello world!'
}

async function Title() {
  const title = await getTitleFromDatabase()

  return <h1>{title}</h1>
}

export default async function Page() {
  return (
    <div>
      <Suspense fallback={<h1>Loading...</h1>}>
        <Title />
      </Suspense>

      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Chat />
      </Suspense>
    </div>
  )
}
