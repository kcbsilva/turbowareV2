import ClientHeader from '../components/clientheader'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col bg-black"
    >
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <ClientHeader />
      <div className="relative z-10 flex-1">
        {children}
      </div>
    </div>
  )
}
