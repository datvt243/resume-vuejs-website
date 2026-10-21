<script setup>
/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import VeeForm from '@/components/veevalidate/VeeForm.vue'
import Modal from '@/components/Modal.vue'
import ItemTemplate from '@/components/global/ItemTemplate.vue'

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCandidate } from '@/composables/useCandidate'
import { useDocument } from '@/composables/useDocument'
import { candidateStore } from '@/stores/candidate'
import { API } from '@/config/api.config'

import model from '@/models/application.model.ts'

import { formatDate } from '@/utilities/index'
import { buttonClass } from '@/lib/button.lib'
import { t } from '@/i18n'

const { applications: dataList, removeRecordById, addRecordToList } = useCandidate({
    field: 'applications',
    collection: 'application',
})

const { document, updateDoc, deleteDoc } = useDocument({ collection: 'application', fields: model })

/**
 *  modal
 */
const refModal = ref()
const refVeeForm = ref()
const { profiles } = useCandidate({ field: 'profiles', collection: 'profile' })
const formFields = computed(() =>
  model.map(f => (f.name === 'profileId' ? { ...f, options: profiles.value.map(p => ({ text: p.name, value: p._id })) } : f)),
)

const router = useRouter()
const candidate = candidateStore()
const _host = window.location.host === 'localhost' ? 'http://localhost:3001/' : API

/**
 * Public CV link and PDF for the profile an application was sent with.
 * shortcut: both go through the public endpoints, so they only work while the CV is public;
 * the owner's `download-pdf` ignores `?profile=` — switch the PDF to it once the backend supports that.
 */
function getProfileLinks(item) {
  const profile = profiles.value.find(p => p._id === item.profileId)
  const identifier = candidate.getCandidate?.slug || candidate.getCandidate?.email || ''
  if (!profile || !identifier) return null
  return {
    name: profile.name,
    publicLink: router.resolve({ name: 'public-resume', params: { slug: identifier }, query: { profile: profile._id } }).href,
    pdfLink: `${_host}api/me/${encodeURIComponent(identifier)}/download-pdf?template=ats&profile=${profile._id}`,
  }
}

// Nhân bản: giữ `document._id` = id của bản ghi gốc (KHÔNG để rỗng) trong
// lúc modal mở — VeeForm.vue có watch(document) tự reset() form về default
// nếu `_id` falsy, nên xoá `_id` ngay từ đầu sẽ làm mất luôn dữ liệu vừa
// copy. Thay vào đó chỉ đánh dấu qua cờ này, rồi xoá `_id` ngay trước khi
// gọi updateDoc để tạo bản ghi MỚI (POST) thay vì ghi đè bản ghi gốc (PUT).
const isDuplicating = ref(false)

// DESIGN.md §5.6 badges
const badgeBase = 'inline-flex h-5 items-center gap-1.5 rounded-sm px-2 text-xs font-medium'
const statusMeta = {
  applied: { text: 'option.applicationStatus.applied', badge: 'bg-surface-2 text-fg-2', dot: 'bg-fg-3' },
  interview: { text: 'option.applicationStatus.interview', badge: 'bg-warning-subtle text-warning', dot: 'bg-warning' },
  offer: { text: 'option.applicationStatus.offer', badge: 'bg-success-subtle text-success', dot: 'bg-success' },
  rejected: { text: 'option.applicationStatus.rejected', badge: 'bg-danger-subtle text-danger', dot: 'bg-danger' },
}
const linkBtn = buttonClass({ variant: 'ghost', iconOnly: true })
function getStatusMeta(status) {
  return statusMeta[status] || statusMeta.applied
}

/**
 *
 * Method
 */
async function handleUpdate(values) {
  const data = (val => {
    val.appliedDate = +new Date(val.appliedDate)
    return val
  })({ ...values })

  // A since-deleted profile would 400; omitting the field makes the backend keep the stored link.
  if (data.profileId && !profiles.value.some(p => p._id === data.profileId)) {
    delete data.profileId
  }

  if (isDuplicating.value) {
    data._id = null
    isDuplicating.value = false
  }

  await updateDoc(data, res => {
    const { data } = res
    addRecordToList(data)
  })
}

function showModalEditDoc(doc) {
  isDuplicating.value = false
  const fields = formFields.value.map(e => e.name)
  for (const f of new Set(['_id', ...fields])) {
    document[f] = doc[f]
  }
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

function showModalDuplicateDoc(doc) {
  isDuplicating.value = true
  const fields = formFields.value.map(e => e.name)
  for (const f of new Set(['_id', ...fields])) {
    document[f] = doc[f]
  }
  refModal.value?.show()
}
</script>

<template>
  <div>
    <Heading :level="1" :text="t('nav.application')">
      <Button type="primary" icon="fa-solid fa-plus" :text="t('crud.application.add')" @click="showModalCreateDoc()" />
    </Heading>

    <div v-if="dataList.length">
      <ListTransition class="m-0 list-none divide-y divide-line rounded-md border border-line bg-surface p-0">
        <li v-for="item in dataList" :key="item._id">
          <ItemTemplate :model-value="{
            title: item.company,
            subTitle: item.position,
            date: () => formatDate(item.appliedDate, 'DD/MM/YYYY'),
            description: item.note,
          }" icon="fa-briefcase">
            <div class="flex flex-wrap items-center gap-1">
              <span :class="[badgeBase, getStatusMeta(item.status).badge]">
                <span class="h-1.5 w-1.5 rounded-full" :class="getStatusMeta(item.status).dot" aria-hidden="true"></span>
                {{ t(getStatusMeta(item.status).text) }}
              </span>
              <template v-if="getProfileLinks(item)">
                <span :class="[badgeBase, 'bg-surface-2 text-fg-2']">
                  <FontAwesomeIcon icon="fa-solid fa-layer-group" aria-hidden="true" />{{ getProfileLinks(item).name }}
                </span>
                <a :class="linkBtn" :href="getProfileLinks(item).publicLink" target="_blank" rel="noopener" :aria-label="t('crud.application.viewPublicCv')" :title="t('crud.application.viewPublicCvShort')">
                  <FontAwesomeIcon icon="fa-solid fa-eye" aria-hidden="true" />
                </a>
                <a :class="linkBtn" :href="getProfileLinks(item).pdfLink" target="_blank" rel="noopener" :aria-label="t('crud.application.downloadPdf')" :title="t('crud.application.downloadPdfShort')">
                  <FontAwesomeIcon icon="fa-solid fa-download" aria-hidden="true" />
                </a>
              </template>
              <a v-if="item.jobLink" :class="linkBtn" :href="item.jobLink" target="_blank" rel="noopener" :aria-label="t('crud.application.openJob')" :title="t('crud.application.openJob')">
                <FontAwesomeIcon icon="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
              </a>
              <ItemActions :label="item.company" @edit="showModalEditDoc({ ...item })" @duplicate="showModalDuplicateDoc({ ...item })"
                @delete="deleteDoc({ ...item }, 'company', res => removeRecordById(res.data._id))" />
            </div>
          </ItemTemplate>
        </li>
      </ListTransition>
    </div>
    <LoadingGate v-else>
      <div class="rounded-md border border-line bg-surface">
        <NoData :title="t('crud.application.empty')" :description="t('crud.application.emptyDescription')">
          <Button icon="fa-solid fa-plus" :text="t('crud.application.add')" @click="showModalCreateDoc()" />
        </NoData>
      </div>
    </LoadingGate>
  </div>

  <Modal ref="refModal"
    :title="isDuplicating ? t('form.duplicateTitle', { name: document.company }) : document._id ? t('form.editTitle', { name: document.company }) : t('crud.application.add')"
    is-hidden-footer>
    <div class="block-container">
      <VeeForm ref="refVeeForm" :fields="formFields" :document="document" :submit-fn="handleUpdate"
        button-position="end">
        <template #cancel>
          <Button :text="t('common.cancel')" type="ghost" data-bs-dismiss="modal" />
        </template>
      </VeeForm>
    </div>
  </Modal>
</template>
