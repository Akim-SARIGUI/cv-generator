import type {
  Education,
  Experience,
  ExtraEntry,
  ExtractedCvDraft,
  PersonalInfo,
  Resume,
  Skill,
} from '~/types/cv'
import {
  normalizeSections,
  packSections,
  sectionOrder,
  type SectionKey,
} from '~/utils/sections'

export function useResume() {
  const { api } = useApi()
  const resume = useState<Resume | null>('current-resume', () => null)
  const localizedResume = useState<Resume | null>('localized-resume', () => null)
  const localizing = useState('resume-localizing', () => false)
  const loading = useState('resume-loading', () => false)
  const saving = useState('resume-saving', () => false)
  const error = useState<string | null>('resume-error', () => null)
  let localizeSeq = 0

  function syncLivePreview() {
    publishPreview()
    void refreshLocalized()
  }

  function publishPreview() {
    if (!resume.value) {
      localizedResume.value = null
      return
    }
    localizedResume.value = {
      ...resume.value,
      experiences: [...(resume.value.experiences || [])],
      educations: [...(resume.value.educations || [])],
      skills: [...(resume.value.skills || [])],
      extras: [...(resume.value.extras || [])],
    }
  }

  async function refreshLocalized() {
    if (!resume.value?.id) {
      localizedResume.value = null
      return null
    }
    const seq = ++localizeSeq
    const resumeId = resume.value.id
    localizing.value = true
    try {
      const localized = await api<Resume>(
        `/resumes/${resume.value.id}/generate/localized`,
      )
      if (seq !== localizeSeq || resume.value?.id !== resumeId) {
        return localizedResume.value
      }
      localizedResume.value = {
        ...resume.value,
        ...localized,
        template: resume.value.template,
        locale: resume.value.locale,
        sections: resume.value.sections,
        personal: localized.personal
          ? {
              ...localized.personal,
              photoUrl:
                resume.value.personal?.photoUrl ??
                localized.personal.photoUrl ??
                null,
            }
          : resume.value.personal,
      }
      return localizedResume.value
    } catch {
      publishPreview()
      return localizedResume.value
    } finally {
      if (seq === localizeSeq) localizing.value = false
    }
  }

  async function loadDefault() {
    loading.value = true
    error.value = null
    try {
      resume.value = await api<Resume>('/resumes/default')
      await refreshLocalized()
      return resume.value
    } catch (e: unknown) {
      error.value = 'RESUME_LOAD'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadById(id: string) {
    loading.value = true
    error.value = null
    try {
      resume.value = await api<Resume>(`/resumes/${id}`)
      await refreshLocalized()
      return resume.value
    } finally {
      loading.value = false
    }
  }

  async function updateResume(
    payload: Partial<Pick<Resume, 'title' | 'template' | 'locale' | 'isDefault'>> & {
      sections?: ReturnType<typeof packSections>
    },
  ) {
    if (!resume.value) return
    saving.value = true
    try {
      resume.value = await api<Resume>(`/resumes/${resume.value.id}`, {
        method: 'PATCH',
        body: payload,
      })
      syncLivePreview()
      return resume.value
    } finally {
      saving.value = false
    }
  }

  async function savePersonal(payload: Partial<PersonalInfo>) {
    if (!resume.value) return
    saving.value = true
    try {
      const personal = await api<PersonalInfo>(
        `/resumes/${resume.value.id}/personal`,
        { method: 'PUT', body: payload },
      )
      resume.value = { ...resume.value, personal }
      syncLivePreview()
      return personal
    } finally {
      saving.value = false
    }
  }

  async function uploadPhoto(file: File) {
    if (!resume.value) return
    saving.value = true
    try {
      const body = new FormData()
      body.append('photo', file)
      const personal = await api<PersonalInfo>(
        `/resumes/${resume.value.id}/personal/photo`,
        { method: 'POST', body },
      )
      resume.value = { ...resume.value, personal }
      publishPreview()
      return personal
    } finally {
      saving.value = false
    }
  }

  async function removePhoto() {
    if (!resume.value) return
    saving.value = true
    try {
      const personal = await api<PersonalInfo>(
        `/resumes/${resume.value.id}/personal/photo`,
        { method: 'DELETE' },
      )
      resume.value = { ...resume.value, personal }
      publishPreview()
      return personal
    } finally {
      saving.value = false
    }
  }

  async function ensureSection(key: SectionKey) {
    if (!resume.value) return
    const sections = normalizeSections(resume.value.sections)
    if (sections[key]) return
    await updateResume({
      sections: packSections(
        { ...sections, [key]: true },
        sectionOrder(resume.value.sections),
      ),
    })
  }

  async function reorderEntries(
    kind: 'experiences' | 'educations' | 'skills' | 'extras',
    orderedIds: string[],
  ) {
    if (!resume.value) return
    const current = resume.value[kind] || []
    const byId = new Map(current.map((item) => [item.id, item]))
    const next = orderedIds
      .map((id) => byId.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item, index) => ({ ...item, sortOrder: index }))
    for (const item of current) {
      if (!next.some((row) => row.id === item.id)) {
        next.push({ ...item, sortOrder: next.length })
      }
    }
    resume.value = { ...resume.value, [kind]: next }
    publishPreview()
    await Promise.all(
      next.map((item) =>
        api(`/resumes/${resume.value!.id}/${kind}/${item.id}`, {
          method: 'PATCH',
          body: { sortOrder: item.sortOrder },
        }),
      ),
    )
    void refreshLocalized()
  }

  async function addExperience(payload: Partial<Experience>) {
    if (!resume.value) return
    await ensureSection('experience')
    const created = await api<Experience>(
      `/resumes/${resume.value.id}/experiences`,
      { method: 'POST', body: payload },
    )
    resume.value = {
      ...resume.value,
      experiences: [...(resume.value.experiences || []), created],
    }
    syncLivePreview()
    return created
  }

  async function updateExperience(id: string, payload: Partial<Experience>) {
    if (!resume.value) return
    const updated = await api<Experience>(
      `/resumes/${resume.value.id}/experiences/${id}`,
      { method: 'PATCH', body: payload },
    )
    resume.value = {
      ...resume.value,
      experiences: (resume.value.experiences || []).map((item) =>
        item.id === id ? updated : item,
      ),
    }
    syncLivePreview()
    return updated
  }

  async function removeExperience(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/experiences/${id}`, {
      method: 'DELETE',
    })
    resume.value = {
      ...resume.value,
      experiences: (resume.value.experiences || []).filter((item) => item.id !== id),
    }
    syncLivePreview()
  }

  async function addEducation(payload: Partial<Education>) {
    if (!resume.value) return
    await ensureSection('education')
    const created = await api<Education>(
      `/resumes/${resume.value.id}/educations`,
      { method: 'POST', body: payload },
    )
    resume.value = {
      ...resume.value,
      educations: [...(resume.value.educations || []), created],
    }
    syncLivePreview()
    return created
  }

  async function updateEducation(id: string, payload: Partial<Education>) {
    if (!resume.value) return
    const updated = await api<Education>(
      `/resumes/${resume.value.id}/educations/${id}`,
      { method: 'PATCH', body: payload },
    )
    resume.value = {
      ...resume.value,
      educations: (resume.value.educations || []).map((item) =>
        item.id === id ? updated : item,
      ),
    }
    syncLivePreview()
    return updated
  }

  async function removeEducation(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/educations/${id}`, {
      method: 'DELETE',
    })
    resume.value = {
      ...resume.value,
      educations: (resume.value.educations || []).filter((item) => item.id !== id),
    }
    syncLivePreview()
  }

  async function addSkill(payload: Partial<Skill>) {
    if (!resume.value) return
    await ensureSection('skills')
    const created = await api<Skill>(`/resumes/${resume.value.id}/skills`, {
      method: 'POST',
      body: payload,
    })
    resume.value = {
      ...resume.value,
      skills: [...(resume.value.skills || []), created],
    }
    syncLivePreview()
    return created
  }

  async function updateSkill(id: string, payload: Partial<Skill>) {
    if (!resume.value) return
    const updated = await api<Skill>(
      `/resumes/${resume.value.id}/skills/${id}`,
      { method: 'PATCH', body: payload },
    )
    resume.value = {
      ...resume.value,
      skills: (resume.value.skills || []).map((item) =>
        item.id === id ? updated : item,
      ),
    }
    syncLivePreview()
    return updated
  }

  async function removeSkill(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/skills/${id}`, { method: 'DELETE' })
    resume.value = {
      ...resume.value,
      skills: (resume.value.skills || []).filter((item) => item.id !== id),
    }
    syncLivePreview()
  }

  async function addExtra(payload: Partial<ExtraEntry>) {
    if (!resume.value) return
    const sectionByKind: Partial<Record<ExtraEntry['kind'], SectionKey>> = {
      CERTIFICATION: 'certifications',
      AWARD: 'awards',
      PROJECT: 'projects',
      INTEREST: 'interests',
      REFERENCE: 'references',
      LANGUAGE: 'languages',
    }
    const section = payload.kind ? sectionByKind[payload.kind] : undefined
    if (section) await ensureSection(section)
    const created = await api<ExtraEntry>(
      `/resumes/${resume.value.id}/extras`,
      { method: 'POST', body: payload },
    )
    resume.value = {
      ...resume.value,
      extras: [...(resume.value.extras || []), created],
    }
    syncLivePreview()
    return created
  }

  async function updateExtra(id: string, payload: Partial<ExtraEntry>) {
    if (!resume.value) return
    const updated = await api<ExtraEntry>(
      `/resumes/${resume.value.id}/extras/${id}`,
      { method: 'PATCH', body: payload },
    )
    resume.value = {
      ...resume.value,
      extras: (resume.value.extras || []).map((item) =>
        item.id === id ? updated : item,
      ),
    }
    syncLivePreview()
    return updated
  }

  async function removeExtra(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/extras/${id}`, { method: 'DELETE' })
    resume.value = {
      ...resume.value,
      extras: (resume.value.extras || []).filter((item) => item.id !== id),
    }
    syncLivePreview()
  }

  async function downloadPdf(localeOverride?: string) {
    if (!resume.value) return
    const locale =
      localeOverride === 'en' || localeOverride === 'fr'
        ? localeOverride
        : resume.value.locale
    if (locale && locale !== resume.value.locale) {
      await updateResume({ locale })
    }
    const blob = await api<Blob>(
      `/resumes/${resume.value.id}/generate/pdf`,
      {
        method: 'POST',
        body: { locale },
        responseType: 'blob',
      },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const suffix = locale === 'en' ? '-en' : '-fr'
    a.download = `${resume.value.personal?.fullName || 'cv'}${suffix}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function parseImportedCv(file: File) {
    if (!resume.value) return null
    const form = new FormData()
    form.append('file', file)
    return api<ExtractedCvDraft>(`/resumes/${resume.value.id}/import/parse`, {
      method: 'POST',
      body: form,
    })
  }

  async function applyImportedCv(draft: ExtractedCvDraft, replaceExisting = true) {
    if (!resume.value) return null
    saving.value = true
    try {
      resume.value = await api<Resume>(`/resumes/${resume.value.id}/import/apply`, {
        method: 'POST',
        body: {
          personal: draft.personal || {},
          experiences: draft.experiences || [],
          educations: draft.educations || [],
          skills: draft.skills || [],
          extras: draft.extras || [],
          replaceExisting,
        },
      })
      await refreshLocalized()
      return resume.value
    } finally {
      saving.value = false
    }
  }

  return {
    resume,
    localizedResume,
    localizing,
    loading,
    saving,
    error,
    loadDefault,
    loadById,
    updateResume,
    refreshLocalized,
    savePersonal,
    uploadPhoto,
    removePhoto,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addExtra,
    updateExtra,
    removeExtra,
    reorderEntries,
    downloadPdf,
    parseImportedCv,
    applyImportedCv,
  }
}
