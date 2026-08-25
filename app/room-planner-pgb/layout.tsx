import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Room Planner (PGB)',
  description: 'Drag-and-drop furniture layout planner',
  openGraph: {
    title: 'Room Planner (PGB)',
    description: 'Drag-and-drop furniture layout planner',
    images: [],
  },
  twitter: {
    title: 'Room Planner (PGB)',
    description: 'Drag-and-drop furniture layout planner',
    card: 'summary',
  },
}

export default function RoomPlannerPgbLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'white',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}
