/* eslint-disable */

type Theme = 'dark' | 'light' | 'system'

type Locale = 'en' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'zh'

type SearchParams = {
  [key: string]: string | string[] | undefined
}

type PageProps<T extends { [key: string]: string } = {}> = {
  params: Promise<T>
  searchParams: Promise<SearchParams>
}
