import { redirect } from 'next/navigation'

type PageProps = {
  params: Promise<{ slug: string[] }>
}

export default async function WikiAliasArticle({ params }: PageProps) {
  const { slug } = await params
  redirect(`/turboisp/wiki/${slug.join('/')}`)
}
