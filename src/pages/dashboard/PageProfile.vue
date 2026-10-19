<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: issue #116 — manage CV "profiles" (named subsets of
 * Education/Experience/Project/Certificate/Award/Reference, by _id
 * reference — no data duplication), matching backend
 * `resume-nodejs-api#133`. Only `name` goes through `VeeForm` (see
 * `models/profile.model.ts` for why); the 6 id-array fields are a custom
 * checkbox checklist against data every other dashboard page already
 * loads via `useCandidate`, merged into the submit payload in
 * `handleUpdate`. Picking which profile is ACTIVE for the public
 * link/PDF export lives in `PageInformation.vue`/`PagePreview.vue`
 * (`useActiveProfile`) — this page is CRUD-only, matching the pattern of
 * every other dashboard section.
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import Modal from '@/components/Modal.vue'
import ItemTemplate from '@/components/global/ItemTemplate.vue'

import { reactive, ref, shallowRef, computed } from 'vue'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'

import model from '@/models/profile.model'

const { profiles: dataList, removeRecordById, addRecordToList } = useCandidate({
    field: 'profiles',
    collection: 'profile',
})

// Same cached lists every other dashboard page already loads — no extra
// endpoint, just reused here to build the checklist options.
const { educations } = useCandidate({ field: 'educations', collection: 'education' })
const { experiences } = useCandidate({ field: 'experiences' })
const { projects } = useCandidate({ field: 'projects' })
const { certificates } = useCandidate({ field: 'certificates' })
const { awards } = useCandidate({ field: 'awards' })
const { references } = useCandidate({ field: 'references' })

const sections = computed(() => [
    { key: 'educationIds', label: 'Học vấn', items: educations.value, title: i => i.school, subTitle: i => i.major },
    { key: 'experienceIds', label: 'Kinh nghiệm', items: experiences.value, title: i => i.company, subTitle: i => i.position },
    { key: 'projectIds', label: 'Dự án', items: projects.value, title: i => i.name, subTitle: i => i.position },
    { key: 'certificateIds', label: 'Chứng chỉ', items: certificates.value, title: i => i.name, subTitle: i => i.organization },
    { key: 'awardIds', label: 'Giải thưởng', items: awards.value, title: i => i.name, subTitle: i => i.organization },
    { key: 'referenceIds', label: 'Người tham khảo', items: references.value, title: i => i.fullName, subTitle: i => i.company },
])

const { document, updateDoc, deleteDoc } = useDocument({ collection: 'profile', fields: model })

const selectedIds = reactive({
    educationIds: [],
    experienceIds: [],
    projectIds: [],
    certificateIds: [],
    awardIds: [],
    referenceIds: [],
})

function resetSelectedIds(doc = {}) {
    for (const s of sections.value) {
        selectedIds[s.key] = [...(doc[s.key] || [])]
    }
}

function toggleId(key, id) {
    const list = selectedIds[key]
    const idx = list.indexOf(id)
    if (idx > -1) {
        list.splice(idx, 1)
    } else {
        list.push(id)
    }
}

function selectAll(key) {
    const s = sections.value.find(e => e.key === key)
    selectedIds[key] = (s?.items || []).map(i => i._id)
}

function clearAll(key) {
    selectedIds[key] = []
}

function countSelected(item) {
    return sections.value.reduce((sum, s) => sum + (item[s.key]?.length || 0), 0)
}

function summarize(item) {
    return sections.value
        .map(s => ({ label: s.label, count: item[s.key]?.length || 0 }))
        .filter(s => s.count > 0)
        .map(s => `${s.count} ${s.label.toLowerCase()}`)
        .join(' · ')
}

/**
 *  modal
 */
const refModal = ref()
const refVeeForm = ref()
const formFields = shallowRef(model)

// Nhân bản: giữ document._id = id bản ghi gốc trong lúc modal mở (VeeForm
// tự reset() nếu _id falsy) — xoá _id ngay trước khi gọi updateDoc để tạo
// bản ghi MỚI thay vì ghi đè, cùng pattern với PageApplication.vue.
const isDuplicating = ref(false)

async function handleUpdate(values) {
    const data = { ...values, ...selectedIds }

    if (isDuplicating.value) {
        data._id = null
        isDuplicating.value = false
    }

    await updateDoc(data, res => {
        const { data } = res
        addRecordToList(data)
    })
}

function showModalCreateDoc() {
    isDuplicating.value = false
    for (const k of formFields.value) {
        document[k.name] = k.default
    }
    resetSelectedIds()
    refModal.value?.show()
    refVeeForm.value?.reset()
}

function showModalEditDoc(doc) {
    isDuplicating.value = false
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }
    resetSelectedIds(doc)
    refModal.value?.show()
}

function showModalDuplicateDoc(doc) {
    isDuplicating.value = true
    const fields = formFields.value.map(e => e.name)
    for (const f of new Set(['_id', ...fields])) {
        document[f] = doc[f]
    }
    resetSelectedIds(doc)
    refModal.value?.show()
}
</script>

<template>
    <div>
        <Heading :level="1" text="Profile CV" description="Mỗi profile chọn một phần dữ liệu để tạo CV cho từng vị trí ứng tuyển.">
          <Button type="primary" icon="fa-solid fa-plus" text="Thêm profile" @click="showModalCreateDoc()" />
        </Heading>

        <div v-if="dataList.length">
            <ListTransition class="m-0 list-none divide-y divide-line rounded-md border border-line bg-surface p-0">
                <li v-for="item in dataList" :key="item._id">
                    <ItemTemplate :model-value="{
                        title: item.name,
                        subTitle: `${countSelected(item)} mục đã chọn`,
                        date: () => '',
                        description: summarize(item),
                    }" icon="fa-layer-group">
                        <ItemActions :label="item.name" @edit="showModalEditDoc({ ...item })" @duplicate="showModalDuplicateDoc({ ...item })"
                @delete="deleteDoc({ ...item }, 'name', res => removeRecordById(res.data._id))" />
                    </ItemTemplate>
                </li>
            </ListTransition>
        </div>
        <div v-else class="rounded-md border border-line bg-surface">
            <NoData title="Chưa có profile nào" description="Tạo profile để có CV riêng cho từng vị trí ứng tuyển.">
                <Button icon="fa-solid fa-plus" text="Thêm profile" @click="showModalCreateDoc()" />
            </NoData>
        </div>
    </div>

    <Modal ref="refModal" size="modal-xl"
        :title="isDuplicating ? `Nhân bản: ${document.name}` : document._id ? `Chỉnh sửa: ${document.name}` : 'Thêm profile'"
        is-hidden-footer>
        <div class="block-container">
            <!--
                Checklist lives OUTSIDE VeeForm on purpose: VeeForm.vue has
                no default slot (only #button — see its template), so
                content passed as its default slot is silently dropped,
                never rendered. `selectedIds` is plain component state, not
                part of vee-validate's own form values — VeeForm only owns
                `name`; `handleUpdate` (VeeForm's submit-fn) merges both
                before calling updateDoc.
            -->
            <div v-for="s in sections" :key="s.key" class="profile-section mb-4">
                <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p class="m-0 text-sm font-medium text-fg">
                        {{ s.label }} <span class="tabular-nums text-fg-3">{{ selectedIds[s.key].length }}/{{ s.items.length }}</span>
                    </p>
                    <div class="flex gap-1">
                        <Button text="Chọn tất cả" type="ghost" size="sm" @click="selectAll(s.key)" />
                        <Button text="Bỏ chọn" type="ghost" size="sm" @click="clearAll(s.key)" />
                    </div>
                </div>
                <p v-if="!s.items.length" class="m-0 text-sm text-fg-3">Chưa có mục nào.</p>
                <div v-else class="profile-checklist">
                    <label v-for="opt in s.items" :key="opt._id" class="form-check profile-checklist-item">
                        <input class="form-check-input" type="checkbox" :checked="selectedIds[s.key].includes(opt._id)"
                            @change="toggleId(s.key, opt._id)" />
                        <span class="form-check-label">
                            {{ s.title(opt) }}
                            <span v-if="s.subTitle(opt)" class="text-fg-3"> — {{ s.subTitle(opt) }}</span>
                        </span>
                    </label>
                </div>
            </div>

            <VeeForm ref="refVeeForm" :fields="formFields" :document="document" :submit-fn="handleUpdate"
                submit-text="Lưu" button-position="end">
                <template #cancel>
                    <Button text="Hủy" type="ghost" data-bs-dismiss="modal" />
                </template>
            </VeeForm>
        </div>
    </Modal>
</template>

<style scoped>
.profile-checklist {
    max-height: 12rem;
    overflow-y: auto;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
}
.profile-checklist-item {
    display: block;
    padding: 0.125rem 0;
}
</style>
