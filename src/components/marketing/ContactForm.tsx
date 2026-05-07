'use client'

import { useState } from 'react'
import { Mail, MessageCircle, Shield } from 'lucide-react'

const RANGES = ['₹1L – ₹10L', '₹10L – ₹50L', '₹50L+', 'Just exploring']

const INPUT_CLASS =
  'w-full bg-transparent text-[#F0EDE6] text-[14px] font-sans font-light py-3 outline-none placeholder:text-[#4A4438] transition-colors'
const LABEL_CLASS = 'block text-[#8A8070] text-[11px] font-sans uppercase tracking-[0.12em] mb-2'

export function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    range: '',
    message: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = encodeURIComponent(
      `Hi Wealthon Capital Ventures, I visited wealthonventures.com and I'd like to learn more about capital partnership opportunities.\n\nName: ${form.name}\nWhatsApp: ${form.phone}\nInvestment range: ${form.range}\nMessage: ${form.message}`
    )
    window.open(`https://wa.me/919035373664?text=${text}`, '_blank')
  }

  const borderBottom = { borderBottom: '1px solid rgba(255,255,255,0.15)' }
  const borderBottomFocus = 'focus-within:[border-bottom-color:#F5A623]'

  return (
    <section id="contact" className="bg-[#0F0F0F] py-[120px] lg:py-[60px]">
      <div className="max-w-[1200px] mx-auto px-10 md:px-5">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-20 lg:gap-12">
          {/* Left — form */}
          <div className="fade-up" data-delay="0">
            <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3">
              Get In Touch
            </p>
            <h2 className="font-serif text-[40px] md:text-[32px] font-semibold text-[#F0EDE6] leading-[1.2] mb-4">
              Start a conversation.
            </h2>
            <p className="text-[#8A8070] text-base font-sans font-light mb-10">
              No commitment. No pressure. Just an honest conversation about whether this makes
              sense for you.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
              {/* Name */}
              <div>
                <label className={LABEL_CLASS}>Your name</label>
                <div style={borderBottom} className={borderBottomFocus}>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={set('name')}
                    className={INPUT_CLASS}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={LABEL_CLASS}>WhatsApp number</label>
                <div style={borderBottom} className={borderBottomFocus}>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={form.phone}
                    onChange={set('phone')}
                    className={INPUT_CLASS}
                    required
                  />
                </div>
              </div>

              {/* Range */}
              <div>
                <label className={LABEL_CLASS}>Investment range</label>
                <div style={borderBottom} className={borderBottomFocus}>
                  <select
                    value={form.range}
                    onChange={set('range')}
                    className={`${INPUT_CLASS} cursor-pointer`}
                    style={{ appearance: 'none', WebkitAppearance: 'none' }}
                    required
                  >
                    <option value="" disabled style={{ background: '#111111' }}>
                      Select range
                    </option>
                    {RANGES.map((r) => (
                      <option key={r} value={r} style={{ background: '#111111' }}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className={LABEL_CLASS}>Brief message</label>
                <div style={borderBottom} className={borderBottomFocus}>
                  <textarea
                    rows={3}
                    placeholder="Tell us a bit about yourself and what you're looking for..."
                    value={form.message}
                    onChange={set('message')}
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </div>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-gold text-[#080808] text-[14px] font-sans tracking-[0.05em] py-3.5 rounded-[4px] hover:bg-gold-secondary transition-colors cursor-pointer border-none"
                >
                  Send via WhatsApp →
                </button>
                <p className="text-[#4A4438] text-[11px] font-sans font-light text-center mt-2">
                  You will be redirected to WhatsApp
                </p>
              </div>
            </form>
          </div>

          {/* Right — contact details */}
          <div className="flex flex-col justify-center gap-8 fade-up" data-delay="160">
            <a
              href="mailto:hello@wealthonventures.com"
              className="flex items-start gap-4 group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ border: '1px solid rgba(245,166,35,0.3)' }}
              >
                <Mail size={16} className="text-gold" />
              </div>
              <div>
                <p className="text-[#4A4438] text-[11px] font-sans uppercase tracking-[0.1em] mb-1">
                  Email
                </p>
                <p className="text-[#F0EDE6] text-[15px] font-sans font-light group-hover:text-gold transition-colors">
                  hello@wealthonventures.com
                </p>
              </div>
            </a>

            <a
              href="https://wa.me/919035373664"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ border: '1px solid rgba(245,166,35,0.3)' }}
              >
                <MessageCircle size={16} className="text-gold" />
              </div>
              <div>
                <p className="text-[#4A4438] text-[11px] font-sans uppercase tracking-[0.1em] mb-1">
                  WhatsApp
                </p>
                <p className="text-[#F0EDE6] text-[15px] font-sans font-light group-hover:text-gold transition-colors">
                  +91 90353 73664
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ border: '1px solid rgba(245,166,35,0.15)' }}
              >
                <Shield size={16} className="text-[#4A4438]" />
              </div>
              <p className="text-[#4A4438] text-[13px] font-sans font-light leading-[1.7]">
                Your information is safe with us. We respect your privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
