import ClientHeader from '../components/clientheader'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #060c1a 0%, #0a1428 40%, #071020 70%, #060c1a 100%)' }}
    >
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(252,163,17,0.07) 1px, transparent 1px)',
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
