'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { Article } from '@/lib/articles'

const CATEGORIES = ['All', 'Wealth Education', 'Trading Notes']

interface Props {
  featured: Article | undefined
  rest: Article[]
}

export function InsightsClient({ featured, rest }: Props) {
  const [active, setActive] = useState('All')

  const filteredFeatured =
    active === 'All' || featured?.category === active ? featured : undefined

  const filteredRest =
    active === 'All' ? rest : rest.filter((a) => a.category === active)

  return (
    <>
      {/* Category pills */}
      <div className="flex flex-wrap gap-3 mb-12">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className="text-[12px] font-sans uppercase tracking-[0.1em] px-4 py-1.5 rounded-full border transition-colors cursor-pointer bg-transparent"
            style={
              active === cat
                ? { border: '1px solid #F5A623', color: '#F5A623' }
                : { border: '1px solid rgba(245,166,35,0.2)', color: '#9A9080' }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured article */}
      {filteredFeatured && (
        <div className="mb-12">
          <Link href={`/insights/${filteredFeatured.slug}`}>
            <div
              className="rounded-[8px] p-8 lg:p-10 hover:border-[rgba(245,166,35,0.4)] transition-all duration-200 group"
              style={{ background: '#111111', border: '1px solid rgba(245,166,35,0.15)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="text-[10px] font-sans uppercase tracking-[0.1em] px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(245,166,35,0.1)',
                    color: '#F5A623',
                    border: '1px solid rgba(245,166,35,0.3)',
                  }}
                >
                  Featured
                </span>
                <span className="text-[#6B6152] text-[11px] font-sans uppercase tracking-[0.08em]">
                  {filteredFeatured.category}
                </span>
              </div>

              <h2 className="font-serif text-[24px] lg:text-[32px] text-[#F0EDE6] leading-[1.3] mb-4 max-w-[700px] group-hover:text-gold transition-colors">
                {filteredFeatured.title}
              </h2>
              <p className="text-[#9A9080] text-[15px] font-sans font-light leading-[1.7] max-w-[600px] mb-6">
                {filteredFeatured.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AuthorAvatar article={filteredFeatured} size={32} textSize="12px" />
                  <div>
                    <p className="text-[#F0EDE6] text-[13px] font-sans">{filteredFeatured.author}</p>
                    <p className="text-[#6B6152] text-[11px] font-sans">
                      {filteredFeatured.date} · {filteredFeatured.readTime}
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-gold opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Article grid */}
      {filteredRest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRest.map((article) => (
            <Link key={article.slug} href={`/insights/${article.slug}`}>
              <div
                className="rounded-[8px] p-6 h-full flex flex-col hover:border-[rgba(245,166,35,0.4)] hover:-translate-y-0.5 transition-all duration-200 group"
                style={{
                  background: '#111111',
                  border: '1px solid rgba(245,166,35,0.15)',
                  borderTopColor: '#F5A623',
                  borderTopWidth: '2px',
                }}
              >
                <p className="text-[#6B6152] text-[10px] font-sans uppercase tracking-[0.1em] mb-3">
                  {article.category}
                </p>
                <h3 className="font-serif text-[20px] text-[#F0EDE6] leading-[1.3] mb-3 group-hover:text-gold transition-colors">
                  {article.title}
                </h3>
                <p className="text-[#9A9080] text-[13px] font-sans font-light leading-[1.7] mb-6 flex-1">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3">
                    <AuthorAvatar article={article} size={28} textSize="11px" />
                    <div>
                      <p className="text-[#F0EDE6] text-[12px] font-sans">{article.author}</p>
                      <p className="text-[#6B6152] text-[10px] font-sans">
                        {article.date} · {article.readTime}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gold opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!filteredFeatured && filteredRest.length === 0 && (
        <p className="text-[#6B6152] text-[14px] font-sans font-light">
          No articles in this category yet.
        </p>
      )}
    </>
  )
}

function AuthorAvatar({ article, size, textSize }: { article: Article; size: number; textSize: string }) {
  if (article.authorPhoto) {
    return (
      <div
        className="rounded-full overflow-hidden border border-[rgba(245,166,35,0.4)] flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={article.authorPhoto}
          alt={article.author}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  return (
    <div
      className="rounded-full bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.3)] flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="font-serif text-gold" style={{ fontSize: textSize }}>
        {article.authorInitials}
      </span>
    </div>
  )
}
