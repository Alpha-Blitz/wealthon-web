import type { SupabaseClient } from '@supabase/supabase-js'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export interface Article {
  id:          string
  company_id:  string
  title:       string
  slug:        string
  author:      string
  category:    string
  body:        string
  status:      'draft' | 'published'
  published_at: string | null
  created_by:  string | null
  created_at:  string
  updated_at:  string
}

export type ArticleInput = Omit<Article, 'id' | 'company_id' | 'created_at' | 'updated_at' | 'published_at'>

export async function getArticles(supabase: SupabaseClient): Promise<Result<Article[]>> {
  const { data, error } = await supabase
    .from(TABLE.ARTICLES)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('created_at', { ascending: false })
  if (error) return err(error.message)
  return ok(data as Article[])
}

export async function createArticle(
  supabase: SupabaseClient,
  input: ArticleInput
): Promise<Result<Article>> {
  const { data, error } = await supabase
    .from(TABLE.ARTICLES)
    .insert({ ...input, company_id: MOCK_COMPANY_ID })
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'article.create', 'article', data.id, { after: data })
  return ok(data as Article)
}

export async function updateArticle(
  supabase: SupabaseClient,
  id: string,
  input: Partial<ArticleInput>
): Promise<Result<Article>> {
  const { data: before } = await supabase.from(TABLE.ARTICLES).select('*').eq('id', id).single()
  const { data, error } = await supabase
    .from(TABLE.ARTICLES)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'article.update', 'article', id, { before, after: data })
  return ok(data as Article)
}

export async function publishArticle(
  supabase: SupabaseClient,
  id: string
): Promise<Result<Article>> {
  return updateArticle(supabase, id, {
    status:      'published',
    published_at: new Date().toISOString(),
  } as Partial<ArticleInput>)
}

export async function getPublishedArticles(supabase: SupabaseClient): Promise<Article[]> {
  const { data } = await supabase
    .from(TABLE.ARTICLES)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  return (data ?? []) as Article[]
}

export async function getArticleBySlugFromDb(
  supabase: SupabaseClient,
  slug: string
): Promise<Article | null> {
  const { data } = await supabase
    .from(TABLE.ARTICLES)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  return data ?? null
}

export async function deleteArticle(supabase: SupabaseClient, id: string): Promise<Result<void>> {
  const { data: before } = await supabase.from(TABLE.ARTICLES).select('*').eq('id', id).single()
  const { error } = await supabase
    .from(TABLE.ARTICLES)
    .delete()
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
  if (error) return err(error.message)
  await logAction(supabase, 'article.delete', 'article', id, { before })
  return ok(undefined)
}
