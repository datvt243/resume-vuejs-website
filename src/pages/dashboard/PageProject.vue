<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import Modal from '@/components/Modal.vue'

import ProjectItem from '@/components/project/ProjectItem.vue'

import { ref, shallowRef, computed } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'
import { useManualOrder } from '@/composables/useManualOrder'
import { useFormLang } from '@/composables/useFormLang'
import { localizedToForm, localizedFromForm, formatDate, getLocalizedText, sanitizeHtml } from '@/utilities/index'
import { t } from '@/i18n'

import model from '@/models/project.model.ts'

const { projects: dataList, removeRecordById, addRecordToList, loadError, getData } = useCandidate({ field: 'projects' })

// Sắp xếp thủ công (issue #57) — chỉ lưu ở trình duyệt (localStorage),
// KHÔNG đồng bộ server (backend chưa có field order — xem comment đầu
// `useManualOrder.ts`).
const { orderedItems, reorder } = useManualOrder('project', dataList)
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
const { document, updateDoc, deleteDoc } = useDocument({ collection: 'project', fields: model })

/**
 *  modal
 */
const refModal = ref()
const refVeeForm = ref()
const formFields = shallowRef(model)

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
        val.endDate = val.isWorking ? null : +new Date(val.endDate)
        val.technology = val.technology?.split(',').map(s => s.trim()).filter(Boolean)

        !val.isWorking && (val.isWorking = false)
        return localizedFromForm(val, ['description'])
    })({ ...values })

    if (isDuplicating.value) {
        data._id = null
        isDuplicating.value = false
    }

    await updateDoc(data, res => {
        const { data } = res
        addRecordToList(data)
        refModal.value?.hide()
    })
}

async function handleDelete(doc) {
    deleteDoc({ ...doc }, 'name', res => {
        const { data } = res
        removeRecordById(data._id)
    })
}

function showModalEditDoc(doc) {
    isDuplicating.value = false
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }

    document.technology = document.technology?.join(', ')
    Object.assign(document, localizedToForm(doc, ['description']))

    refModal.value?.show()
}

function showModalCreateDoc() {
    isDuplicating.value = false
    for (const k of formFields.value) {
        document[k.name] = k.default
    }
    refModal.value?.show()
    refVeeForm.value?.reset()
}

/**
 *  view details (read-only)
 */
const refViewModal = ref()
const viewDoc = ref({})
const viewDate = computed(() => {
    const { startDate, endDate, isWorking } = viewDoc.value
    return `${formatDate(startDate, 'MM/YYYY')} - ${isWorking ? t('common.present') : formatDate(endDate, 'MM/YYYY')}`
})
// shares the forms' VI | EN toggle, so the view and the forms stay on one language
const { formLang } = useFormLang()
const VIEW_LANGS = ['vi', 'en']
const viewDescription = computed(() => sanitizeHtml(getLocalizedText(viewDoc.value.description, formLang.value)))

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
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }

    document.technology = document.technology?.join(', ')
    Object.assign(document, localizedToForm(doc, ['description']))

    refModal.value?.show()
}
</script>

<template>
    <div>
        <Heading :level="1" :text="$t('nav.project')">
            <Button type="primary" icon="fa-solid fa-plus" :text="$t('crud.project.add')" @click="showModalCreateDoc()" />
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
                        <ProjectItem
                            :model-value="edu"
                            icon="fa-code"
                            @on-view="showModalViewDoc"
                            @on-edit="showModalEditDoc"
                            @on-delete="handleDelete"
                            @on-duplicate="showModalDuplicateDoc"
                        >
                            <template #sub>
                                <p v-if="edu.technology?.length" class="m-0 mt-0.5 text-xs text-fg-2">{{ $t('crud.project.technologies', { list: edu.technology.join(', ') }) }}</p>
                            </template>
                        </ProjectItem>
                    </div>
                </li>
            </ListTransition>
        </div>
        <LoadingGate v-else :error="loadError" @retry="getData">
            <NoData :title="$t('crud.project.empty')" :description="$t('crud.project.emptyDescription')">
                <Button icon="fa-solid fa-plus" action="add" :text="$t('crud.project.add')" @click="showModalCreateDoc()" />
            </NoData>
        </LoadingGate>
    </div>

    <Modal
        ref="refModal"
        :title="isDuplicating ? $t('form.duplicateTitle', { name: document.name }) : document._id ? $t('form.editTitle', { name: document.name }) : $t('crud.project.add')"
        is-hidden-footer
    >
        <div class="block-container">
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

    <Modal ref="refViewModal" :title="viewDoc.name">
        <div class="mb-4 inline-flex rounded bg-surface-2 p-0.5" role="radiogroup" :aria-label="$t('form.contentLang')">
            <button
                v-for="l in VIEW_LANGS"
                :key="l"
                type="button"
                role="radio"
                :aria-checked="formLang === l ? 'true' : 'false'"
                class="inline-flex h-7 items-center rounded-sm px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                :class="formLang === l ? 'bg-accent-subtle font-semibold text-accent shadow-sm' : 'text-fg-2 hover:text-fg'"
                :data-lang="l"
                @click="formLang = l"
            >
                {{ l.toUpperCase() }}
            </button>
        </div>
        <dl class="m-0 grid gap-x-4 gap-y-3 sm:grid-cols-4">
            <dt class="text-sm text-fg-3">{{ $t('field.projectName') }}</dt>
            <dd class="m-0 sm:col-span-3 text-sm text-fg">{{ viewDoc.name }}</dd>
            <dt class="text-sm text-fg-3">{{ $t('field.position') }}</dt>
            <dd class="m-0 sm:col-span-3 text-sm text-fg">{{ viewDoc.position || '—' }}</dd>
            <dt class="text-sm text-fg-3">{{ $t('field.technology') }}</dt>
            <dd class="m-0 sm:col-span-3 text-sm text-fg">{{ viewDoc.technology?.join(', ') || '—' }}</dd>
            <dt class="text-sm text-fg-3">{{ $t('field.startDate') }} - {{ $t('field.endDate') }}</dt>
            <dd class="m-0 sm:col-span-3 text-sm tabular-nums text-fg">{{ viewDate }}</dd>
            <dt class="text-sm text-fg-3">{{ $t('field.link') }}</dt>
            <dd class="m-0 sm:col-span-3 break-all text-sm text-fg">
                <a v-if="/^https?:\/\//i.test(viewDoc.link)" class="text-accent hover:underline" :href="viewDoc.link" target="_blank" rel="noopener">{{ viewDoc.link }}</a>
                <template v-else>{{ viewDoc.link || '—' }}</template>
            </dd>
            <dt class="text-sm text-fg-3">{{ $t('field.description') }}</dt>
            <dd class="post-content m-0 sm:col-span-3 break-words text-sm text-fg" v-html="viewDescription"></dd>
        </dl>
        <template #footer>
            <Button action="update" icon="fa-solid fa-square-pen" :text="$t('common.edit')" @click="editFromView" />
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
