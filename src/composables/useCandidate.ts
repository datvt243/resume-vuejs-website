/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import type { Response } from '@/types/api.type'
import { ref, onBeforeMount, toValue, computed } from 'vue'
import { candidateStore } from '@/stores/candidate'
import { handleBase } from '@/services/base'
import { useHelper } from '@/composables/useHelper'
import { compareEntries, compareProjects } from '@/utilities/sectionOrder'

interface Props {
    field: string
    collection?: string | null
}
type Result = Record<string, any>[] | Record<string, any>
export const useCandidate = (props: Props) => {
    const candidate = candidateStore()
    const field = ref(props.field)
    const collection = props.collection || (field.value.endsWith('s') ? field.value.slice(0, -1) : field.value)

    const result = ref<Result>([])
    // a failed load must not read as an empty list (LoadingGate shows an error + retry)
    const loadError = ref(false)

    const candidateId = computed(() => candidate.getId)
    const { loading, toast } = useHelper()

    onBeforeMount(async () => {
        let _result: Result = candidate.getCandidateByField(toValue(field))
        // "fetched" is the field being set at all — an empty list is a valid cached answer, not a reason to refetch
        const hasCachedData = (candidate.getCandidate as any)?.[toValue(field)] != null

        if (!hasCachedData) {
            await getData()
        } else {
            result.value = sortData(_result)
        }
    })

    async function getData() {
        let _data: Result = []
        let loaded = false
        await handleBase(
            {
                method: 'get',
                url: `${collection}/`,
            },
            { loading: loading, toast: null, toastError: toast },
            (res: Response) => {
                const { data = [] } = res
                _data = data
                loaded = true
                candidate.setCandidateByField({
                    [`${field.value}`]: data,
                })
            },
        )

        loadError.value = !loaded
        result.value = sortData(_data)
        /* return _data */
    }

    function removeRecordById(_id: string) {
        result.value = (result.value as Record<string, any>[]).filter(e => e._id !== _id)

        candidate.setCandidateByField({
            [field.value]: toValue(result),
        })
    }
    function addRecordToList(data: { _id: string; [key: string]: any }) {
        const { _id = null } = data
        const list = result.value as Record<string, any>[]
        const _findIndex = _id ? list.findIndex(e => e._id === _id) : -1

        if (_findIndex > -1) {
            // the update response has no `order`, keep the entry's place
            list[_findIndex] = { ...data, order: data.order ?? list[_findIndex].order }
        } else {
            list.push(data)
        }
        result.value = sortData(list)

        candidate.setCandidateByField({
            [field.value]: toValue(result),
        })
    }
    let reordering = false
    // saves a dragged list order (Education, Project); a failed save puts the old order back
    async function reorder(list: Record<string, any>[]) {
        // a second drop while the first save is in flight could land in the wrong order
        if (reordering) return
        reordering = true
        const previous = result.value
        result.value = list
        const shown = result.value
        let saved = false
        try {
            await handleBase(
                { method: 'put', url: `${collection}/reorder`, data: { ids: list.map(e => e._id) } },
                { loading: loading, toast: null, toastError: toast },
                () => {
                    saved = true
                },
            )
        } finally {
            reordering = false
        }
        // an entry saved meanwhile already replaced the shown list — keep that one
        if (!saved) {
            if (result.value === shown) result.value = previous
            return
        }
        const position = new Map(list.map((e, i) => [e._id, i]))
        result.value = sortData((result.value as Record<string, any>[]).map(e => (position.has(e._id) ? { ...e, order: position.get(e._id) } : e)))
        candidate.setCandidateByField({
            [field.value]: toValue(result),
        })
    }
    function updateField(props: { field: string; values: String | Record<string, any> | Record<string, any>[] }) {
        const { field, values } = props
        const _f = field

        if (_f !== '')
            candidate.setCandidateByField({
                [_f]: values,
            })
    }
    function updateGeneralInformationByField(value: Record<string, any>) {
        candidate.setGeneralInformation(value)
    }

    function sortData(data: any) {
      if (Array.isArray(data)) {
        return [...data].sort(field.value === 'projects' ? compareProjects : compareEntries)
      }
      return data
    }

    return {
        candidateId,
        [toValue(field)]: result,
        removeRecordById,
        addRecordToList,
        reorder,
        updateField,
        updateGeneralInformationByField,
        getData,
        loadError,
    }
}
