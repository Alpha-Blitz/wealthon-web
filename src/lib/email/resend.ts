import { Resend } from 'resend'
import { ok, err, type Result } from '@/lib/admin/index'

const FROM_DEFAULT = 'Wealthon Capital Ventures <noreply@wealthonventures.com>'
const REPLY_TO     = 'hello@wealthonventures.com'

export interface EmailAttachment {
  filename: string
  content:  Buffer | string
}

export interface SendEmailParams {
  to:           string
  subject:      string
  html:         string
  attachments?: EmailAttachment[]
  from?:        string
}

let _client: Resend | null = null

function getClient(): Resend | null {
  if (_client) return _client
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  _client = new Resend(key)
  return _client
}

export async function sendEmail(params: SendEmailParams): Promise<Result<{ id: string | null }>> {
  const client = getClient()
  if (!client) {
    // Graceful no-op: in environments without RESEND_API_KEY, log and return success
    console.warn('[email] RESEND_API_KEY not set; skipping send to', params.to, '|', params.subject)
    return ok({ id: null })
  }

  try {
    const { data, error } = await client.emails.send({
      from:     params.from ?? FROM_DEFAULT,
      to:       [params.to],
      replyTo:  REPLY_TO,
      subject:  params.subject,
      html:     params.html,
      attachments: params.attachments?.map(a => ({
        filename: a.filename,
        content:  typeof a.content === 'string' ? a.content : a.content.toString('base64'),
      })),
    })
    if (error) return err(error.message ?? 'Email send failed')
    return ok({ id: data?.id ?? null })
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Email send threw')
  }
}
