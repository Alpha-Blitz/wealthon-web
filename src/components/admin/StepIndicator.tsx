interface StepIndicatorProps {
  steps:       readonly string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const done    = i < currentStep
        const active  = i === currentStep
        const pending = i > currentStep
        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-sans font-medium flex-shrink-0"
                style={{
                  background: done    ? '#F5A623'
                            : active  ? 'rgba(245,166,35,0.15)'
                            : 'rgba(255,255,255,0.06)',
                  border: active ? '1px solid #F5A623' : 'none',
                  color:  done    ? '#080808'
                        : active  ? '#F5A623'
                        : '#9A9080',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className="text-[13px] font-sans whitespace-nowrap"
                style={{ color: active ? '#F0EDE6' : pending ? '#9A9080' : '#F5A623' }}
              >
                {step}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className="h-px flex-1 mx-4"
                style={{
                  width: 48,
                  background: i < currentStep
                    ? '#F5A623'
                    : 'rgba(255,255,255,0.08)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
