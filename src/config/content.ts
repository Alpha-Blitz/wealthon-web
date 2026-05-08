import { COMPANY_EMAIL, COMPANY_NAME } from './constants'

export const CONTENT = {
  login: {
    eyebrow: 'Partner Portal',
    heading: 'Welcome back.',
    subheading: 'Sign in to access your partner dashboard.',
    emailPlaceholder: 'Email address',
    passwordPlaceholder: 'Password',
    forgotPassword: 'Forgot password? →',
    signIn: 'Sign in →',
    notPartner: 'Not a partner yet? Start a conversation →',
    securityNote: 'Secure access. All data is encrypted and protected with bank-grade security.',
    signingIn: 'Signing in…',
  },

  nav: {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    pnl: 'P&L',
    securities: 'Securities',
    profile: 'Profile',
    logout: 'Logout',
    partner: 'Partner',
  },

  dashboard: {
    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },
    subtitle: "Here's your portfolio overview.",
    metrics: {
      totalInvested: 'TOTAL INVESTED',
      totalInvestedSub: 'Across all markets',
      currentPnl: 'CURRENT P&L',
      distribution: "THIS QUARTER'S DISTRIBUTION",
      nextPayout: 'NEXT PAYOUT DATE',
      daysPrefix: 'In',
      daysSuffix: 'days',
    },
    chart: {
      title: 'Quarterly Performance',
      yearLabel: 'This Year',
      legend: 'Profit (Rs.)',
      bestMonth: 'Best Month',
      worstMonth: 'Worst Month',
      avgMonthly: 'Avg Monthly P&L',
      positiveMonths: 'Positive Months',
    },
    activity: {
      title: 'Recent Activity',
      viewAll: 'View all transactions →',
    },
    trust: {
      agreement: 'Your capital is protected by a signed Capital Partnership Agreement.',
      disclaimer: 'All performance is market-linked. No fixed or guaranteed returns.',
      viewAgreement: 'View Agreement →',
    },
  },

  transactions: {
    title: 'Transactions',
    totalInvested: 'Total Invested',
    totalDistributed: 'Total Distributed',
    netPnl: 'Net P&L',
    exportCsv: 'Export CSV',
    allTypes: 'All Types',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    transactionsLabel: 'transactions',
    columns: {
      date: 'DATE',
      type: 'TYPE',
      amount: 'AMOUNT',
      status: 'STATUS',
      notes: 'NOTES',
    },
  },

  pnl: {
    title: 'P&L Report',
    totalPnl: 'Total P&L',
    realizedPnl: 'Realized P&L',
    unrealizedPnl: 'Unrealized P&L',
    winRate: 'Win Rate',
    cumulative: 'Cumulative',
    monthly: 'Monthly',
    chartTitle: 'Cumulative P&L Trend',
    monthlyBreakdown: 'Monthly P&L Breakdown',
    allStrategies: 'All Strategies',
    strategyPerformance: 'Strategy Performance',
    allocationTitle: 'Asset Allocation',
    totalLabel: 'Total',
  },

  securities: {
    title: 'Securities & Documents',
    agreementTitle: 'Capital Partnership Agreement',
    agreementMou: 'MoU Reference',
    agreementSigned: 'Signed',
    agreementPartner: 'Partner',
    downloadPdf: 'Download Agreement PDF',
    documentPending: `Document will be available once uploaded by admin. Contact ${COMPANY_EMAIL}`,
    securityTitle: 'Security / Collateral Details',
    chequeAmount: 'Cheque Amount',
    chequeDate: 'Cheque Date',
    chequeRef: 'Reference',
    viewDetails: 'View Details',
    historyTitle: 'Document History',
    columns: {
      document: 'DOCUMENT',
      date: 'DATE',
      type: 'TYPE',
      download: 'DOWNLOAD',
    },
  },

  profile: {
    title: 'Profile',
    name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    tier: 'Tier',
    entryDate: 'Entry Date',
    status: 'Status',
    editButton: 'Edit Profile',
    editNote: `To update your details, contact ${COMPANY_EMAIL}`,
  },

  pending: {
    heading: 'Account setup in progress.',
    body: `Your partner account is being configured. Please contact ${COMPANY_EMAIL} if you need assistance.`,
    logout: 'Sign out',
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    authFailed: 'Invalid email or password.',
    notFound: 'Record not found.',
    retry: 'Retry',
  },
} as const

export const APP_NAME = COMPANY_NAME
