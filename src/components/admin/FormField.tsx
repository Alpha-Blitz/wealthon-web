interface FormFieldProps {
  label:    string
  error?:   string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="form-field flex flex-col gap-1.5">
      <label className="text-[11px] font-sans font-normal uppercase tracking-[0.12em] text-[#F5A623]">
        {label}{required && <span className="ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>
      )}
    </div>
  )
}

const BASE: React.CSSProperties = {
  background:   'transparent',
  border:       'none',
  borderBottom: '1px solid rgba(245,166,35,0.25)',
  borderRadius: '0',
  color:        '#F0EDE6',
  fontSize:     '14px',
  fontFamily:   'var(--font-inter)',
  fontWeight:   300,
  width:        '100%',
  outline:      'none',
  padding:      '10px 0',
}

export const inputCls  = 'w-full text-[14px] font-sans text-[#F0EDE6] py-2.5 outline-none transition-colors border-b border-white/15 bg-transparent rounded-none focus:border-gold'
export const inputStyle: React.CSSProperties  = { ...BASE }
export const selectStyle: React.CSSProperties = { ...BASE, paddingRight: '34px', cursor: 'pointer' }
export const textareaStyle: React.CSSProperties = {
  background:   'transparent',
  border:       '1px solid rgba(245,166,35,0.25)',
  borderRadius: '4px',
  color:        '#F0EDE6',
  fontSize:     '14px',
  fontFamily:   'var(--font-inter)',
  fontWeight:   300,
  width:        '100%',
  outline:      'none',
  padding:      '10px 12px',
  resize:       'vertical',
}

export const inputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.currentTarget.tagName === 'TEXTAREA') {
      e.currentTarget.style.borderColor = '#F5A623'
    } else {
      e.currentTarget.style.borderBottom = '1px solid #F5A623'
    }
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.currentTarget.tagName === 'TEXTAREA') {
      e.currentTarget.style.borderColor = 'rgba(245,166,35,0.25)'
    } else {
      e.currentTarget.style.borderBottom = '1px solid rgba(245,166,35,0.25)'
    }
  },
}
