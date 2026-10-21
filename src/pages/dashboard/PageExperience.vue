<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import Modal from '@/components/Modal.vue'
import ExperienceItem from '@/components/experience/ExperienceItem.vue'

import { ref, computed } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'
import { useManualOrder } from '@/composables/useManualOrder'
import { localizedToForm, localizedFromForm, formatDate, getLocalizedText, sanitizeHtml } from '@/utilities/index'
import { t } from '@/i18n'

import model, { experienceTitle, careerBreakPayload, CAREER_BREAK_TYPES } from '@/models/experience.model.ts'

const { experiences: dataList, removeRecordById, addRecordToList } = useCandidate({ field: 'experiences' })

// Sắp xếp thủ công (issue #57) — chỉ lưu ở trình duyệt (localStorage),
// KHÔNG đồng bộ server (backend chưa có field order — xem comment đầu
// `useManualOrder.ts`).
const { orderedItems, reorder } = useManualOrder('experience', dataList)
const dragId = ref(null)
function onDragStart(id) {
    dragId.value = id
}
function onDrop(targetId) {
    if (dragId.value === null || dragId.value === targetId) return
    const list = [...orderedItems.value]
    const fromIndex = list.findIndex(e => e._id === dragId.value)
    const toIndex = list.findIndex(e => e._id === targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const [moved] = list.splice(fromIndex, 1)
    list.splice(toIndex, 0, moved)
    reorder(list)
    dragId.value = null
}

/**
 *
 */
const { document, updateDoc, deleteDoc } = useDocument({ collection: 'experience', fields: model })

/**
 *  modal
 */
const refModal = ref()
const refVeeForm = ref()
// null = the "experience or career break?" chooser shown before a new entry's form
const isCareerBreak = ref(null)
// the type is picked up front, so the checkbox is hidden and its default follows the choice
const formFields = computed(() =>
    model.map(f => {
        if (f.name === 'isCareerBreak') return { ...f, default: !!isCareerBreak.value, showIf: () => false }
        if (f.name === 'isCurrent' && isCareerBreak.value) return { ...f, label: 'field.isOnBreak' }
        return f
    }),
)
const modalTitle = computed(() => {
    if (isCareerBreak.value === null) return t('crud.experience.chooseType')
    const name = experienceTitle(document)
    if (isDuplicating.value) return t('form.duplicateTitle', { name })
    if (document._id) return t('form.editTitle', { name })
    return t(isCareerBreak.value ? 'crud.experience.addBreak' : 'crud.experience.add')
})

// Nhân bản (issue #60): giữ `document._id` = id của bản ghi gốc (KHÔNG
// để rỗng) trong lúc modal mở — VeeForm.vue có watch(document) tự
// reset() form về default nếu `_id` falsy, nên xoá `_id` ngay từ đầu sẽ
// làm mất luôn dữ liệu vừa copy. Thay vào đó chỉ đánh dấu qua cờ này,
// rồi xoá `_id` ngay trước khi gọi updateDoc để tạo bản ghi MỚI (POST)
// thay vì ghi đè bản ghi gốc (PUT).
const isDuplicating = ref(false)

/**
 *
 * Method
 */
async function handleUpdate(values) {
    /**
     * re-format data
     */
    const data = (val => {
        val.startDate = +new Date(val.startDate)
        val.endDate = +new Date(val.endDate)
        !val.isCurrent && (val.isCurrent = false)
        return localizedFromForm(careerBreakPayload(val), ['description'])
    })({ ...values })

    if (isDuplicating.value) {
        data._id = null
        isDuplicating.value = false
    }

    await updateDoc(data, res => {
        const { data } = res
        addRecordToList(data)
        refVeeForm.value?.markSaved()
    })
}

async function handleDelete(doc) {
    deleteDoc({ ...doc, company: experienceTitle(doc) }, 'company', res => {
        const { data } = res
        removeRecordById(data._id)
    })
}

function showModalEditDoc(doc) {
    isDuplicating.value = false
    isCareerBreak.value = !!doc.isCareerBreak
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }
    Object.assign(document, localizedToForm(doc, ['description']))

    refModal.value?.show()
}

function showModalCreateDoc() {
    isDuplicating.value = false
    isCareerBreak.value = null
    refModal.value?.show()
}

function chooseType(careerBreak) {
    isCareerBreak.value = careerBreak
    for (const k of formFields.value) {
        document[k.name] = k.default
    }
    refVeeForm.value?.reset()
}

const TYPE_OPTIONS = [
    { careerBreak: false, icon: 'fa-solid fa-briefcase', key: 'typeExperience' },
    { careerBreak: true, icon: 'fa-solid fa-mug-hot', key: 'typeBreak' },
]

/**
 *  view details (read-only)
 */
const refViewModal = ref()
const viewDoc = ref({})
const viewDate = computed(() => {
    const { startDate, endDate, isCurrent } = viewDoc.value
    return `${formatDate(startDate, 'MM/YYYY')} - ${isCurrent ? t('common.present') : formatDate(endDate, 'MM/YYYY')}`
})
const viewDescription = computed(() => sanitizeHtml(getLocalizedText(viewDoc.value.description)))

function showModalViewDoc(doc) {
    viewDoc.value = doc
    refViewModal.value?.show()
}

function editFromView() {
    refViewModal.value?.hide()
    showModalEditDoc(viewDoc.value)
}

function showModalDuplicateDoc(doc) {
    isDuplicating.value = true
    isCareerBreak.value = !!doc.isCareerBreak
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }
    Object.assign(document, localizedToForm(doc, ['description']))

    refModal.value?.show()
}
</script>

<template>
    <div>
        <Heading :level="1" :text="$t('crud.experience.title')">
            <Button type="primary" icon="fa-solid fa-plus" :text="$t('crud.experience.add')" @click="showModalCreateDoc()" />
        </Heading>

        <div v-if="dataList.length">
            <p class="mb-2 mt-0 text-xs text-fg-3">{{ $t('common.dragToSort') }}</p>
            <ListTransition class="m-0 list-none divide-y divide-line rounded-md border border-line bg-surface p-0">
                <li
                    v-for="edu in orderedItems"
                    :key="edu._id"
                    class="draggable-item flex items-start gap-1 ps-2"
                    draggable="true"
                    @dragstart="onDragStart(edu._id)"
                    @dragover.prevent
                    @drop="onDrop(edu._id)"
                >
                    <span class="drag-handle" aria-hidden="true"><FontAwesomeIcon icon="fa-solid fa-grip-vertical" /></span>
                    <div class="min-w-0 grow">
                        <ExperienceItem
                            :model-value="edu"
                            :icon="edu.isCareerBreak ? 'fa-mug-hot' : 'fa-building'"
                            @on-view="showModalViewDoc"
                            @on-edit="showModalEditDoc"
                            @on-delete="handleDelete"
                            @on-duplicate="showModalDuplicateDoc"
                        />
                    </div>
                </li>
            </ListTransition>
        </div>
        <LoadingGate v-else>
            <div class="rounded-md border border-line bg-surface">
                <NoData :title="$t('crud.experience.empty')" :description="$t('crud.experience.emptyDescription')">
                    <Button icon="fa-solid fa-plus" :text="$t('crud.experience.add')" @click="showModalCreateDoc()" />
                </NoData>
            </div>
        </LoadingGate>
    </div>

    <Modal
        ref="refModal"
        :title="modalTitle"
        is-hidden-footer
    >
        <div v-if="isCareerBreak === null" class="grid gap-3 sm:grid-cols-2">
            <button
                v-for="opt in TYPE_OPTIONS"
                :key="opt.key"
                type="button"
                class="flex flex-col items-start gap-2 rounded-md border border-line bg-surface p-4 text-start transition-colors hover:border-accent hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                :data-type="opt.key"
                @click="chooseType(opt.careerBreak)"
            >
                <span class="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2 text-fg-2" aria-hidden="true"><FontAwesomeIcon :icon="opt.icon" /></span>
                <span class="text-sm font-semibold text-fg">{{ $t(`crud.experience.${opt.key}`) }}</span>
                <span class="text-sm text-fg-2">{{ $t(`crud.experience.${opt.key}Description`) }}</span>
            </button>
        </div>
        <div v-show="isCareerBreak !== null" class="block-container">
            <VeeForm
                ref="refVeeForm"
                :fields="formFields"
                :document="document"
                :submit-fn="handleUpdate"
                button-position="end"
            >
                <template #cancel>
                    <Button :text="$t('common.cancel')" type="ghost" data-bs-dismiss="modal" />
                </template>
            </VeeForm>
        </div>
    </Modal>

    <Modal ref="refViewModal" :title="viewDoc.position || experienceTitle(viewDoc)">
        <dl class="m-0 grid gap-x-4 gap-y-3 sm:grid-cols-4">
            <template v-if="viewDoc.isCareerBreak">
                <dt class="text-sm text-fg-3">{{ $t('field.careerBreakType') }}</dt>
                <dd class="m-0 sm:col-span-3 text-sm text-fg">{{ CAREER_BREAK_TYPES[viewDoc.careerBreakType]?.[$i18n.locale] || '—' }}</dd>
            </template>
            <template v-else>
                <dt class="text-sm text-fg-3">{{ $t('field.position') }}</dt>
                <dd class="m-0 sm:col-span-3 text-sm text-fg">{{ viewDoc.position }}</dd>
                <dt class="text-sm text-fg-3">{{ $t('field.companyName') }}</dt>
                <dd class="m-0 sm:col-span-3 text-sm text-fg">{{ viewDoc.company }}</dd>
            </template>
            <dt class="text-sm text-fg-3">{{ $t('field.startDate') }} - {{ $t('field.endDate') }}</dt>
            <dd class="m-0 sm:col-span-3 text-sm tabular-nums text-fg">{{ viewDate }}</dd>
            <dt class="text-sm text-fg-3">{{ $t('field.description') }}</dt>
            <dd class="post-content m-0 sm:col-span-3 break-words text-sm text-fg" v-html="viewDescription"></dd>
        </dl>
        <template #footer>
            <Button type="primary" icon="fa-solid fa-square-pen" :text="$t('common.edit')" @click="editFromView" />
        </template>
    </Modal>
</template>

<style scoped>
.draggable-item {
    cursor: grab;
}
.draggable-item:active {
    cursor: grabbing;
}
.drag-handle {
    @apply flex h-14 w-6 shrink-0 items-center justify-center text-fg-3;
}
/* the handle already gives the row its left inset */
.draggable-item :deep(.item) {
    @apply ps-0;
}
</style>
