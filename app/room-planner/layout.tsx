export default function RoomPlannerLayout({ children }: { children: React.ReactNode }) {
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
