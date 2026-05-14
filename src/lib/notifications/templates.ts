import { formatINR } from '@/lib/utils'

/**
 * WhatsApp / SMS message templates. Plain text, single message body.
 * All amounts are paise; templates format to INR.
 */

export function capitalReceivedMessage(
  name: string,
  amountPaise: number,
  firstPayoutDate: string,
): string {
  return `Hi ${name}, your capital contribution of ${formatINR(amountPaise)} has been received by Wealthon Capital Ventures. Your partnership is now active. Your first payout is expected on ${firstPayoutDate}. View your dashboard: wealthonventures.com/dashboard`
}

export function distributionPaidMessage(
  name: string,
  amountPaise: number,
  quarter: number,
  year: number,
  bankLast4: string,
): string {
  return `Hi ${name}, your Q${quarter} ${year} profit distribution of ${formatINR(amountPaise)} has been processed to your account ending ${bankLast4}. View your dashboard: wealthonventures.com/dashboard`
}

export function reinvestConfirmedMessage(
  name: string,
  profitPaise: number,
  newCapitalPaise: number,
): string {
  return `Hi ${name}, your profit of ${formatINR(profitPaise)} has been reinvested. Your new capital base is ${formatINR(newCapitalPaise)}. View your dashboard: wealthonventures.com/dashboard`
}

/**
 * Build a wa.me link with a pre-filled message body. Phone numbers must include
 * country code, no '+', no spaces. We strip these defensively.
 */
export function whatsappLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '')
  const text = encodeURIComponent(message)
  return `https://wa.me/${cleaned}?text=${text}`
}
