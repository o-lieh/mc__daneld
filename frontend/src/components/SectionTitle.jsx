// عنوان بخش با خط کمرنگ دو طرف
export default function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 pt-3 text-sm text-muted">
      <span className="h-px flex-1 bg-line" />
      {children}
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}
