/**
 * Skills rows and language levels exactly as the CV layout prints them, shared with the
 * JSON Resume export so the downloaded file always matches what the CV shows.
 */

import { groupSkills } from '@/utilities/index'
import { t } from '@/i18n'

type Lang = 'vi' | 'en'
type Skill = { name?: string; group?: string }

const SKILL_LABELS = {
    vi: { mainSkills: 'Kỹ năng chính', familiarSkills: 'Kỹ năng quen thuộc', professionalSkills: 'Kỹ năng chuyên môn', personalSkills: 'Kỹ năng cá nhân' },
    en: { mainSkills: 'Main skills', familiarSkills: 'Familiar skills', professionalSkills: 'Professional skills', personalSkills: 'Personal skills' },
}

const names = (list?: Skill[]) => (list || []).map(s => s?.name).filter((n): n is string => !!n)

/** Skills rows of `generalInformation` (main, familiar, one per professional group, personal), rows with no names dropped. */
export const skillRows = (gi: Record<string, any>, lang: Lang): { label: string; names: string[] }[] => {
    const labels = lang === 'en' ? SKILL_LABELS.en : SKILL_LABELS.vi
    const main = names(gi.mainSkills)
    const familiar = names(gi.familiarSkills)
    // a professional skill already picked as main/familiar is left out of its group
    const picked = new Set([...main, ...familiar])
    const groups = groupSkills<Skill>(gi.professionalSkills || [], gi.professionalSkillsGroup || []).map(g => ({
        label: g.name ?? labels.professionalSkills,
        names: names(g.skills).filter(n => !picked.has(n)),
    }))
    return [{ label: labels.mainSkills, names: main }, { label: labels.familiarSkills, names: familiar }, ...groups, { label: labels.personalSkills, names: names(gi.personalSkills) }].filter(
        r => r.names.length,
    )
}

const LANGUAGE_LEVELS = ['basic', 'intermediate', 'advanced', 'expert']

/** A known language level in the CV's language; a legacy free-text level as stored. */
export const languageLevel = (level: string | undefined, lang: Lang): string | undefined =>
    level && LANGUAGE_LEVELS.includes(level) ? t(`option.languageLevel.${level}`, {}, { locale: lang }) : level
