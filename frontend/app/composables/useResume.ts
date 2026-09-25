import type {
  Education,
  Experience,
  PersonalInfo,
  Resume,
  Skill,
} from '~/types/cv'

export function useResume() {
  const { api } = useApi()
  const resume = useState<Resume | null>('current-resume', () => null)
  const loading = useState('resume-loading', () => false)
  const saving = useState('resume-saving', () => false)
  const error = useState<string | null>('resume-error', () => null)

  async function loadDefault() {
    loading.value = true
    error.value = null
    try {
      resume.value = await api<Resume>('/resumes/default')
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
      return resume.value
    } finally {
      loading.value = false
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

  async function addExperience(payload: Partial<Experience>) {
    if (!resume.value) return
    const created = await api<Experience>(
      `/resumes/${resume.value.id}/experiences`,
      { method: 'POST', body: payload },
    )
    resume.value.experiences = [...(resume.value.experiences || []), created]
    return created
  }

  async function updateExperience(id: string, payload: Partial<Experience>) {
    if (!resume.value) return
    const updated = await api<Experience>(
      `/resumes/${resume.value.id}/experiences/${id}`,
      { method: 'PATCH', body: payload },
    )
    resume.value.experiences = (resume.value.experiences || []).map((item) =>
      item.id === id ? updated : item,
    )
    return updated
  }

  async function removeExperience(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/experiences/${id}`, {
      method: 'DELETE',
    })
    resume.value.experiences = (resume.value.experiences || []).filter(
      (item) => item.id !== id,
    )
  }

  async function addEducation(payload: Partial<Education>) {
    if (!resume.value) return
    const created = await api<Education>(
      `/resumes/${resume.value.id}/educations`,
      { method: 'POST', body: payload },
    )
    resume.value.educations = [...(resume.value.educations || []), created]
    return created
  }

  async function updateEducation(id: string, payload: Partial<Education>) {
    if (!resume.value) return
    const updated = await api<Education>(
      `/resumes/${resume.value.id}/educations/${id}`,
      { method: 'PATCH', body: payload },
    )
    resume.value.educations = (resume.value.educations || []).map((item) =>
      item.id === id ? updated : item,
    )
    return updated
  }

  async function removeEducation(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/educations/${id}`, {
      method: 'DELETE',
    })
    resume.value.educations = (resume.value.educations || []).filter(
      (item) => item.id !== id,
    )
  }

  async function addSkill(payload: Partial<Skill>) {
    if (!resume.value) return
    const created = await api<Skill>(`/resumes/${resume.value.id}/skills`, {
      method: 'POST',
      body: payload,
    })
    resume.value.skills = [...(resume.value.skills || []), created]
    return created
  }

  async function updateSkill(id: string, payload: Partial<Skill>) {
    if (!resume.value) return
    const updated = await api<Skill>(
      `/resumes/${resume.value.id}/skills/${id}`,
      { method: 'PATCH', body: payload },
    )
    resume.value.skills = (resume.value.skills || []).map((item) =>
      item.id === id ? updated : item,
    )
    return updated
  }

  async function removeSkill(id: string) {
    if (!resume.value) return
    await api(`/resumes/${resume.value.id}/skills/${id}`, { method: 'DELETE' })
    resume.value.skills = (resume.value.skills || []).filter(
      (item) => item.id !== id,
    )
  }

  async function downloadPdf() {
    if (!resume.value) return
    const blob = await api<Blob>(
      `/resumes/${resume.value.id}/generate/pdf`,
      { method: 'POST', responseType: 'blob' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${resume.value.personal?.fullName || 'cv'}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    resume,
    loading,
    saving,
    error,
    loadDefault,
    loadById,
    savePersonal,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    updateSkill,
    removeSkill,
    downloadPdf,
  }
}
