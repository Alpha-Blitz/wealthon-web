export interface Article {
  slug: string
  title: string
  category: string
  author: string
  authorInitials: string
  authorPhoto?: string
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
    authorPhoto: '/suhan.jpeg',
    date: '02 May 2025',
    readTime: '6 min read',
    featured: true,
    excerpt:
      "Profit-sharing aligns interests. You grow with the firm, not just the promise. Here's how it works, what to watch for, and the questions every investor should ask before they commit.",
  },
  {
    slug: 'your-fd-is-not-beating-inflation',
    title: 'Your FD is not beating inflation',
    category: 'Wealth Education',
    author: 'Prathik R.N.',
    authorInitials: 'PR',
    authorPhoto: '/pratik.jpeg',
    date: '24 Apr 2025',
    readTime: '5 min read',
    excerpt:
      'Most people open a Fixed Deposit and feel responsible. But the real numbers tell a different story about what your money is actually doing.',
  },
  {
    slug: 'algorithms-and-ai-in-trading',
    title: 'Algorithms and AI: the new force reshaping financial markets',
    category: 'Trading Notes',
    author: 'Sumanth Hegde',
    authorInitials: 'SH',
    authorPhoto: '/sumanth.jpeg',
    date: '18 Apr 2025',
    readTime: '7 min read',
    excerpt:
      'From rule-based systems to machine learning models, AI has fundamentally changed how modern markets are traded — and what that means for everyone in the game.',
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}
