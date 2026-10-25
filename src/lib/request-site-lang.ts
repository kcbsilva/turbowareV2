import { headers } from 'next/headers'
import { matchSiteLang, type SiteLang } from './locale-copy'

export async function requestSiteLang(): Promise<SiteLang> {
  const headerList = await headers()
  return matchSiteLang(headerList.get('accept-language'))
}
