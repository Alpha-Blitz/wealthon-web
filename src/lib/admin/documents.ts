import type { SupabaseClient } from '@supabase/supabase-js'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

const BUCKET = 'partner-documents'

export type DocumentType = 'agreement' | 'security'

function storagePath(partnerId: string, type: DocumentType): string {
  return `${partnerId}/${type}.pdf`
}

export async function uploadDocument(
  supabase: SupabaseClient,
  partnerId: string,
  file: File,
  type: DocumentType
): Promise<Result<string>> {
  const path = storagePath(partnerId, type)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: 'application/pdf' })
  if (error) return err(error.message)

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600)
  if (!signed?.signedUrl) return err('Upload succeeded but could not generate URL')

  await logAction(supabase, 'document.upload', 'document', null, {
    after: { partner_id: partnerId, type, path },
  })
  return ok(signed.signedUrl)
}

export async function deleteDocument(
  supabase: SupabaseClient,
  partnerId: string,
  type: DocumentType
): Promise<Result<void>> {
  const path = storagePath(partnerId, type)
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) return err(error.message)
  await logAction(supabase, 'document.delete', 'document', null, {
    after: { partner_id: partnerId, type },
  })
  return ok(undefined)
}

export async function getDocumentUrl(
  supabase: SupabaseClient,
  partnerId: string,
  type: DocumentType
): Promise<Result<string | null>> {
  const path = storagePath(partnerId, type)
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600)
  if (error || !data?.signedUrl) return ok(null)
  return ok(data.signedUrl)
}
