// Client profile fills the window fully with no padding — manages its own chrome
export default function ClientProfileLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-full">{children}</div>
}
