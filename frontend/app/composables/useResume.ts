import type {
  Education,
  Experience,
  ExtraEntry,
  ExtractedCvDraft,
  PersonalInfo,
  Resume,
  Skill,
} from '~/types/cv'

export function useResume() {
  const { api } = useApi()
  const resume = useState<Resume | null>('current-resume', () => null)
  const localizedResume = useState<Resume | null>('localized-resume', () => null)
  const localizing = useState('resume-localizing', () => false)
  const loading = useState('resume-loading', () => false)
  const saving = useState('resume-saving', () => false)
  const error = useState<string | null>('resume-error', () => null)

  async function refreshLocalized() {
    if (!resume.value?.id) {
      localizedResume.value = null
      return null
    }
    localizing.value = true
    try {
      const localized = await api<Resume>(
        `/resumes/${resume.value.id}/generate/localized`,
      )
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
                localized.personal.photoUrl ??
                resume.value.personal?.photoUrl ??
                null,
            }
          : resume.value.personal,
      }
      return localizedResume.value
    } finally {
      localizing.value = false
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
      error.value = 'Impossible de charger le CV'
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
    payload: Partial<Pick<Resume, 'title' | 'template' | 'locale' | 'isDefault' | 'sections'>>,
  ) {
    if (!resume.value) return
    saving.value = true
    try {
      resume.value = await api<Resume>(`/resumes/${resume.value.id}`, {
        method: 'PATCH',
        body: payload,
      })
      if (payload.locale != null || payload.template != null) {
        await refreshLocalized()
      }
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
      return personal
    } finally {
      saving.value = false
    }
  }

  async function addExperience(payload: Partial<Experience>) {
    if (!resume.value) return
    const created = await api<Experience>(
      `/resumes/${resume.value.id}/experiences`,
      { method: 'POST', body: payload },
    )
    resume.value = {
      ...resume.value,
      experiences: [...(resume.value.experiences || []), created],
    }
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
  }

  async function addEducation(payload: Partial<Education>) {
    if (!resume.value) return
    const created = await api<Education>(
      `/resumes/${resume.value.id}/educations`,
      { method: 'POST', body: payload },
    )
    resume.value = {
      ...resume.value,
      educations: [...(resume.value.educations || []), created],
    }
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
  }

  async function addSkill(payload: Partial<Skill>) {
    if (!resume.value) return
    const created = await api<Skill>(`/resumes/${resume.value.id}/skills`, {
      method: 'POST',
      body: payload,
    })
    resume.value = {
      ...resume.value,
      skills: [...(resume.value.skills || []), created],
    }
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
    return updated
  }

  async function removeSkill(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/skills/${id}`, { method: 'DELETE' })
    resume.value = {
      ...resume.value,
      skills: (resume.value.skills || []).filter((item) => item.id !== id),
    }
  }

  async function addExtra(payload: Partial<ExtraEntry>) {
    if (!resume.value) return
    const created = await api<ExtraEntry>(
      `/resumes/${resume.value.id}/extras`,
      { method: 'POST', body: payload },
    )
    resume.value = {
      ...resume.value,
      extras: [...(resume.value.extras || []), created],
    }
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
    return updated
  }

  async function removeExtra(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/extras/${id}`, { method: 'DELETE' })
    resume.value = {
      ...resume.value,
      extras: (resume.value.extras || []).filter((item) => item.id !== id),
    }
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
    downloadPdf,
    parseImportedCv,
    applyImportedCv,
  }
}
