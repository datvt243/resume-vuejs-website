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

const { applications: dataList, removeRecordById, addRecordToList, getData } = useCandidate({
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

const statusMeta = {
  applied: { text: 'Đã nộp', badge: 'text-bg-secondary' },
  interview: { text: 'Phỏng vấn', badge: 'text-bg-warning' },
  offer: { text: 'Offer', badge: 'text-bg-success' },
  rejected: { text: 'Từ chối', badge: 'text-bg-danger' },
}
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
  <div class="mb-[1.5rem]">
    <Heading text="Ứng tuyển">
      <div class="btn-group">
        <Button @click="showModalCreateDoc()" icon="fa-solid fa-plus" type="outline-success" size="sm"></Button>
        <Button @click="getData?.()" icon="fa-solid fa-repeat" type="outline-info" size="sm"></Button>
      </div>
    </Heading>

    <div v-if="dataList.length" class="clearfix">
      <ListTransition>
        <li v-for="item in dataList" :key="item._id">
          <ItemTemplate :model-value="{
            title: item.company,
            subTitle: item.position,
            date: () => formatDate(item.appliedDate, 'DD/MM/YYYY'),
            description: item.note,
          }" icon="fa-briefcase">
            <div class="flex items-center gap-[0.5rem]">
              <span class="badge rounded-pill" :class="getStatusMeta(item.status).badge">{{ getStatusMeta(item.status).text }}</span>
              <template v-if="getProfileLinks(item)">
                <span class="badge rounded-pill text-bg-info">{{ getProfileLinks(item).name }}</span>
                <a class="btn btn-sm btn-outline-secondary icon" :href="getProfileLinks(item).publicLink" target="_blank" rel="noopener" title="Xem CV public theo profile">
                  <FontAwesomeIcon icon="fa-solid fa-eye"></FontAwesomeIcon>
                </a>
                <a class="btn btn-sm btn-outline-secondary icon" :href="getProfileLinks(item).pdfLink" target="_blank" rel="noopener" title="Tải PDF (ATS) theo profile">
                  <FontAwesomeIcon icon="fa-solid fa-download"></FontAwesomeIcon>
                </a>
              </template>
              <a v-if="item.jobLink" class="btn btn-sm btn-outline-secondary icon" :href="item.jobLink" target="_blank" rel="noopener">
                <FontAwesomeIcon icon="fa-solid fa-arrow-up-right-from-square"></FontAwesomeIcon>
              </a>
              <div class="btn-group">
                <a class="btn btn-sm btn-outline-danger icon" href="javascript:void(0)" @click="
                  () => {
                    deleteDoc({ ...item }, 'company', res => {
                      const { data } = res
                      removeRecordById(data._id)
                    })
                  }
                ">
                  <FontAwesomeIcon icon="fa-solid fa-trash"></FontAwesomeIcon>
                </a>
                <a class="btn btn-sm btn-outline-warning icon" href="javascript:void(0)"
                  @click="showModalEditDoc({ ...item })">
                  <FontAwesomeIcon icon="fa-solid fa-square-pen"></FontAwesomeIcon>
                </a>
                <a class="btn btn-sm btn-outline-primary icon" href="javascript:void(0)"
                  @click="showModalDuplicateDoc({ ...item })">
                  <FontAwesomeIcon icon="fa-solid fa-copy"></FontAwesomeIcon>
                </a>
              </div>
            </div>
          </ItemTemplate>
        </li>
      </ListTransition>
    </div>
    <NoData v-else />
  </div>

  <Modal ref="refModal"
    :title="isDuplicating ? `Nhân bản: ${document.company}` : document._id ? `Chỉnh sửa: ${document.company}` : 'Thêm mới Ứng tuyển'"
    is-hidden-footer>
    <div class="block-container">
      <VeeForm ref="refVeeForm" :fields="formFields" :document="document" :submit-fn="handleUpdate"
        :submit-text="isDuplicating ? 'Nhân bản' : document._id ? 'Cập nhật' : 'Thêm mới'" buttonPosition="end">
        <template #button>
          <button type="button" class="btn btn-secondary mx-[1rem]" data-bs-dismiss="modal">Đóng</button>
        </template>
      </VeeForm>
    </div>
  </Modal>
</template>
