// فهرست «عنوان: مقدار» با خط جداکننده. rows = [[عنوان, مقدار], ...]
export default function InfoRows({ rows }) {
  return (
    <dl className="space-y-3 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
          <dt className="shrink-0 text-muted">{label}</dt>
          <dd className="min-w-0">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
