export interface Article {
  slug: string
  title: string
  category: string
  author: string
  authorInitials: string
  date: string
  readTime: string
  featured?: boolean
  excerpt: string
}

export const articles: Article[] = [
  {
    slug: 'profit-sharing-vs-fixed-returns',
    title: 'What is profit-sharing and how is it different from fixed returns?',
    category: 'Wealth Education',
    author: 'Suhan S.K.',
    authorInitials: 'SK',
    date: '02 May 2025',
    readTime: '6 min read',
    featured: true,
    excerpt:
      'Profit-sharing aligns interests. You grow with the firm, not just the promise. Here\'s how it works, what to watch for, and the questions every investor should ask before they commit.',
  },
  {
    slug: 'how-we-trade',
    title: 'How we trade: our approach to Forex, Commodities and Crypto',
    category: 'Trading Notes',
    author: 'Prathik R.N.',
    authorInitials: 'PR',
    date: '24 Apr 2025',
    readTime: '7 min read',
    excerpt:
      'Inside our systematic process, market selection, strategy design and risk controls.',
  },
  {
    slug: 'first-capital-partnership',
    title: 'Your first capital partnership — what to expect before you sign',
    category: 'Wealth Education',
    author: 'Sumanth Hegde',
    authorInitials: 'SH',
    date: '18 Apr 2025',
    readTime: '5 min read',
    excerpt:
      'A step-by-step guide to our partnership process, agreements and protections.',
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}
