interface FormFieldProps {
  label:    string
  error?:   string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#9A9080]">
        {label}{required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>
      )}
    </div>
  )
}

const BASE: React.CSSProperties = {
  background:    'transparent',
  border:        'none',
  borderBottom:  '1px solid rgba(255,255,255,0.15)',
  borderRadius:  '0',
  color:         '#F0EDE6',
  fontSize:      '14px',
  fontFamily:    'var(--font-inter)',
  width:         '100%',
  outline:       'none',
  padding:       '10px 0',
}

const FOCUS: React.CSSProperties = { borderBottom: '1px solid #F5A623' }

export const inputCls  = 'w-full text-[14px] font-sans text-[#F0EDE6] py-2.5 outline-none transition-colors border-b border-white/15 bg-transparent rounded-none focus:border-gold'
export const inputStyle: React.CSSProperties  = { ...BASE }
export const selectStyle: React.CSSProperties = { ...BASE, paddingRight: '34px', cursor: 'pointer' }

export const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    Object.assign(e.currentTarget.style, FOCUS)
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderBottom = BASE.borderBottom as string
  },
}
