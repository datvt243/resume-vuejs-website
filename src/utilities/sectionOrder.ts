/**
 * Display order of CV list sections: the backend's manual `order`
 * first, then (projects only) company before personal, then newest first.
 */

type Entry = Record<string, any>

// awards only have issueDate, applications only appliedDate
const dateOf = (e: Entry) => e.startDate ?? e.issueDate ?? e.appliedDate ?? 0
// entries never placed by a drag have no `order` and go after the ordered ones
const orderOf = (e: Entry) => (typeof e.order === 'number' ? e.order : Infinity)
// a legacy project without `type` counts as personal
const typeRank = (e: Entry) => (e.type === 'company' ? 0 : 1)

const byOrder = (a: Entry, b: Entry) => {
    const diff = orderOf(a) - orderOf(b)
    return Number.isNaN(diff) ? 0 : diff
}
const byDate = (a: Entry, b: Entry) => dateOf(b) - dateOf(a)

export const compareEntries = (a: Entry, b: Entry) => byOrder(a, b) || byDate(a, b)

export const compareProjects = (a: Entry, b: Entry) => byOrder(a, b) || typeRank(a) - typeRank(b) || byDate(a, b)
