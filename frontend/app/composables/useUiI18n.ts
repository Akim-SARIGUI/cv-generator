import { resolveLocale, type CvLocale } from '~/utils/cv-templates'

const messages = {
  fr: {
    language: 'Langue',
    loading: 'Chargement…',
    cancel: 'Annuler',
    download: 'Télécharger',
    downloadPdf: 'Télécharger PDF',
    preview: 'Aperçu',
    backEditor: 'Retour éditeur',
    editorTitle: 'Éditeur de CV',
    previewTitle: 'Aperçu',
    translating: 'traduction…',
    modelLabel: 'Modèle',
    navEditor: 'Éditeur',
    navPreview: 'Aperçu',
    navLogin: 'Connexion',
    navRegister: 'Créer un compte',
    navLogout: 'Déconnexion',
    homeEyebrow: 'CV Studio',
    homeTitle: 'Un CV clair, soigné, prêt à envoyer.',
    homeSubtitle:
      'Renseignez vos infos, choisissez parmi 100+ modèles, prévisualisez en direct, téléchargez un PDF professionnel.',
    homeCtaContinue: 'Continuer mon CV',
    homeCtaStart: 'Commencer gratuitement',
    homeLogin: 'Se connecter',
    homeFeatEditTitle: 'Édition guidée',
    homeFeatEditText: 'Sections claires : profil, expériences, formations et compétences.',
    homeFeatPreviewTitle: 'Aperçu fidèle',
    homeFeatPreviewText: 'Visualisez le rendu avant export, avec vos vraies données.',
    homeFeatPdfTitle: 'Export PDF',
    homeFeatPdfText: 'Téléchargez un PDF propre, prêt pour les candidatures.',
    tabStructure: 'Structure',
    tabModel: 'Modèle & langue',
    tabProfile: 'Profil',
    tabExperience: 'Expériences',
    tabEducation: 'Formations',
    tabSkills: 'Compétences',
    tabLanguages: 'Langues',
    tabCertifications: 'Certifications',
    tabAwards: 'Attestations',
    tabProjects: 'Projets',
    tabInterests: 'Intérêts',
    tabReferences: 'Références',
    templatesTitle: 'Choisir un modèle',
    templatesHint:
      'Parcourez par type, sélectionnez un modèle : l’aperçu se met à jour à droite.',
    templatesCount: '{total} modèles · {shown} affichés',
    templatesSearch: 'Rechercher un modèle…',
    templatesEmpty: 'Aucun modèle ne correspond à vos filtres.',
    templatesLoadError: 'Impossible de charger les modèles',
    templatesLivePreview: 'Aperçu en direct',
    templatesSelected: 'Sélectionné',
    templatesNoPhoto: 'Sans photo',
    templatesApplying: 'Application du modèle…',
    structureTitle: 'Structure du CV',
    structureHint:
      'Activez uniquement les blocs à afficher. Les titres suivent la langue FR/EN.',
    familyAll: 'Tous les types',
    familyClassic: 'Classique',
    familyAts: 'ATS',
    familySidebar: 'Sidebar',
    familyMinimal: 'Minimal',
    familyBanner: 'Banner',
    familyExecutive: 'Executive',
    familyTimeline: 'Timeline',
    familyTwocol: '2 colonnes',
    familyElegant: 'Élégant',
    familyClassicDesc: 'Structure internationale claire',
    familyAtsDesc: 'Optimisé recrutement, sans photo',
    familySidebarDesc: 'Bandeau latéral contemporain',
    familyMinimalDesc: 'Aéré et typographique',
    familyBannerDesc: 'En-tête fort et impactant',
    familyExecutiveDesc: 'Style direction / senior',
    familyTimelineDesc: 'Chronologie visuelle',
    familyTwocolDesc: 'Mise en page deux colonnes',
    familyElegantDesc: 'Rendu raffiné et élégant',
    downloadTitle: 'Télécharger le PDF',
    downloadHint:
      'Choisissez la langue des libellés et du contenu traduit dans le PDF.',
    french: 'Français',
    english: 'English',
  },
  en: {
    language: 'Language',
    loading: 'Loading…',
    cancel: 'Cancel',
    download: 'Download',
    downloadPdf: 'Download PDF',
    preview: 'Preview',
    backEditor: 'Back to editor',
    editorTitle: 'CV editor',
    previewTitle: 'Preview',
    translating: 'translating…',
    modelLabel: 'Template',
    navEditor: 'Editor',
    navPreview: 'Preview',
    navLogin: 'Sign in',
    navRegister: 'Create account',
    navLogout: 'Sign out',
    homeEyebrow: 'CV Studio',
    homeTitle: 'A clear, polished CV — ready to send.',
    homeSubtitle:
      'Fill in your details, pick from 100+ templates, preview live, download a professional PDF.',
    homeCtaContinue: 'Continue my CV',
    homeCtaStart: 'Get started free',
    homeLogin: 'Sign in',
    homeFeatEditTitle: 'Guided editing',
    homeFeatEditText: 'Clear sections: profile, experience, education and skills.',
    homeFeatPreviewTitle: 'Faithful preview',
    homeFeatPreviewText: 'See the real render before export, with your own data.',
    homeFeatPdfTitle: 'PDF export',
    homeFeatPdfText: 'Download a clean PDF ready for applications.',
    tabStructure: 'Structure',
    tabModel: 'Template & language',
    tabProfile: 'Profile',
    tabExperience: 'Experience',
    tabEducation: 'Education',
    tabSkills: 'Skills',
    tabLanguages: 'Languages',
    tabCertifications: 'Certifications',
    tabAwards: 'Awards',
    tabProjects: 'Projects',
    tabInterests: 'Interests',
    tabReferences: 'References',
    templatesTitle: 'Choose a template',
    templatesHint:
      'Browse by type, select a template — the live preview updates on the right.',
    templatesCount: '{total} templates · {shown} shown',
    templatesSearch: 'Search a template…',
    templatesEmpty: 'No template matches your filters.',
    templatesLoadError: 'Unable to load templates',
    templatesLivePreview: 'Live preview',
    templatesSelected: 'Selected',
    templatesNoPhoto: 'No photo',
    templatesApplying: 'Applying template…',
    structureTitle: 'CV structure',
    structureHint:
      'Enable only the blocks you want to show. Titles follow the FR/EN language.',
    familyAll: 'All types',
    familyClassic: 'Classic',
    familyAts: 'ATS',
    familySidebar: 'Sidebar',
    familyMinimal: 'Minimal',
    familyBanner: 'Banner',
    familyExecutive: 'Executive',
    familyTimeline: 'Timeline',
    familyTwocol: '2 columns',
    familyElegant: 'Elegant',
    familyClassicDesc: 'Clear international structure',
    familyAtsDesc: 'Recruiter-friendly, no photo',
    familySidebarDesc: 'Contemporary colored sidebar',
    familyMinimalDesc: 'Airy typographic layout',
    familyBannerDesc: 'Strong impactful header',
    familyExecutiveDesc: 'Leadership / senior style',
    familyTimelineDesc: 'Visual timeline layout',
    familyTwocolDesc: 'Two-column composition',
    familyElegantDesc: 'Refined elegant look',
    downloadTitle: 'Download PDF',
    downloadHint:
      'Choose the language used for labels and translated content in the PDF.',
    french: 'Français',
    english: 'English',
  },
} as const

export type UiMessageKey = keyof typeof messages.fr

export function useUiI18n() {
  const { resume } = useResume()
  const uiLocale = useState<CvLocale>('ui-locale', () => 'fr')

  const locale = computed<CvLocale>(() => {
    if (resume.value?.locale) return resolveLocale(resume.value.locale)
    return uiLocale.value
  })

  const dict = computed(() => messages[locale.value])

  function setUiLocale(next: CvLocale) {
    uiLocale.value = next
  }

  function t(key: UiMessageKey, vars?: Record<string, string | number>) {
    let text: string = dict.value[key] || messages.fr[key] || key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }

  return { locale, uiLocale, setUiLocale, t }
}

export const FAMILY_KEYS: {
  id: 'all' | import('~/utils/cv-templates').LayoutId
  label: UiMessageKey
  desc: UiMessageKey
}[] = [
  { id: 'all', label: 'familyAll', desc: 'templatesHint' },
  { id: 'classic', label: 'familyClassic', desc: 'familyClassicDesc' },
  { id: 'ats', label: 'familyAts', desc: 'familyAtsDesc' },
  { id: 'sidebar', label: 'familySidebar', desc: 'familySidebarDesc' },
  { id: 'minimal', label: 'familyMinimal', desc: 'familyMinimalDesc' },
  { id: 'banner', label: 'familyBanner', desc: 'familyBannerDesc' },
  { id: 'executive', label: 'familyExecutive', desc: 'familyExecutiveDesc' },
  { id: 'timeline', label: 'familyTimeline', desc: 'familyTimelineDesc' },
  { id: 'twocol', label: 'familyTwocol', desc: 'familyTwocolDesc' },
  { id: 'elegant', label: 'familyElegant', desc: 'familyElegantDesc' },
]
