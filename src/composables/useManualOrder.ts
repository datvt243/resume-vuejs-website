/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description: Thứ tự hiển thị tùy chỉnh (kéo-thả) — issue #57. Backend
 * (`resume-nodejs-api`) không có field `order`/`sortIndex` trên bất kỳ
 * model CV section nào (education/experience/project/award/certificate/
 * reference) — issue tự thừa nhận cần "thay đổi nhỏ ở backend", ngoài
 * phạm vi repo này. Một reorder kéo-thả mà âm thầm reset lại đúng thứ
 * tự cũ ở lần fetch kế tiếp còn TỆ hơn không có tính năng (trông như đã
 * lưu, rồi tự huỷ) — nên KHÔNG giả vờ đồng bộ server. Thay vào đó lưu
 * thứ tự vào `localStorage`, theo từng candidate + từng collection —
 * thật (sống sót qua reload/đóng tab, đúng trên chính máy/trình duyệt
 * đó), chỉ không đồng bộ nhiều thiết bị — công khai rõ ràng, không giả
 * là tính năng server-side.
 */

import { ref, computed, type Ref } from 'vue'
import { candidateStore } from '@/stores/candidate'

interface ItemWithId {
    _id: string
    [key: string]: any
}

function readSavedOrder(key: string): string[] {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function writeSavedOrder(key: string, ids: string[]) {
    try {
        localStorage.setItem(key, JSON.stringify(ids))
    } catch {
        // localStorage không dùng được (private mode / hết quota) — im
        // lặng bỏ qua, thứ tự chỉ đơn giản là không được lưu, không phải
        // lỗi cứng làm hỏng trang
    }
}

export const useManualOrder = (collection: string, items: Ref<ItemWithId[]>) => {
    const candidate = candidateStore()
    const storageKey = computed(() => `cv-manual-order:${collection}:${candidate.getId || 'anonymous'}`)

    const savedOrder = ref<string[]>(readSavedOrder(storageKey.value))

    const orderedItems = computed(() => {
        if (!savedOrder.value.length) return items.value

        const byId = new Map(items.value.map(item => [item._id, item]))
        const ordered: ItemWithId[] = []
        for (const id of savedOrder.value) {
            const item = byId.get(id)
            if (item) {
                ordered.push(item)
                byId.delete(id)
            }
        }
        // Bản ghi mới thêm sau lần sắp xếp gần nhất (chưa có trong
        // savedOrder) -> xếp cuối, giữ nguyên thứ tự tự nhiên giữa
        // chúng với nhau
        ordered.push(...Array.from(byId.values()))
        return ordered
    })

    function reorder(newOrderedList: ItemWithId[]) {
        const ids = newOrderedList.map(item => item._id)
        savedOrder.value = ids
        writeSavedOrder(storageKey.value, ids)
    }

    return { orderedItems, reorder }
}
