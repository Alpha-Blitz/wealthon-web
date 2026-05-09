export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-[4px] animate-pulse"
      style={{ height, background: 'rgba(255,255,255,0.04)' }}
    />
  )
}
