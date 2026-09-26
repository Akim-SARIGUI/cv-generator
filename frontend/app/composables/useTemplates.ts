import type { TemplateMeta } from '~/utils/cv-templates'
import { getTemplateMeta } from '~/utils/cv-templates'

type TemplatesResponse = {
  total: number
  families: string[]
  items: TemplateMeta[]
}

export function useTemplates() {
  const { api } = useApi()
  const templates = useState<TemplateMeta[]>('cv-templates-catalog', () => [])
  const total = useState('cv-templates-total', () => 0)
  const loaded = useState('cv-templates-loaded', () => false)
  const loading = useState('cv-templates-loading', () => false)
  const error = useState<string | null>('cv-templates-error', () => null)

  async function loadTemplates(force = false) {
    if (loaded.value && !force && templates.value.length) return templates.value
    loading.value = true
    error.value = null
    try {
      const data = await api<TemplatesResponse>('/templates')
      templates.value = data.items || []
      total.value = data.total || templates.value.length
      loaded.value = true
      return templates.value
    } catch {
      error.value = 'Impossible de charger les modèles'
      return templates.value
    } finally {
      loading.value = false
    }
  }

  function findTemplate(id?: string | null) {
    return getTemplateMeta(id, templates.value)
  }

  return {
    templates,
    total,
    loaded,
    loading,
    error,
    loadTemplates,
    findTemplate,
  }
}
