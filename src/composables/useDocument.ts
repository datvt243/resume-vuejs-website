/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { ref, reactive, toValue, onBeforeMount, watch } from 'vue'
import { confirmDelete } from '@/lib/swal.lib'
import { handleBase } from '@/services/base'
import { useHelper } from '@/composables/useHelper'

import type { Response } from '@/types/api.type'
import type { modelItem } from '@/types/model.type'

interface Props {
    fields: modelItem[]
    collection: string
    loading?: any
    toast?: any
}
interface Document {
    [key: string]: any
}
export const useDocument = (props: Props) => {
    const documentInterface = reactive<Document>({})
    const document = reactive<Document>({})

    const collection = ref(props.collection)

    /**
     *
     */
    const fields = ref(props.fields)
    watch(fields, val => {
        getValue(val)
    })

    const { loading, toast } = useHelper()

    onBeforeMount(() => {
        getValue(fields.value)
    })
    /* for (const f of fields.value) {
        documentInterface[`${f.name}`] = f.default || ''
        document[`${f.name}`] = f.default || ''
    } */

    /**
     *
     */
    function getValue(values: modelItem[]) {
        for (const f of values) {
            documentInterface[`${f.name}`] = f.default || ''
            document[`${f.name}`] = f.default || ''
        }
    }

    /**
     * Create or Update document
     * @param values
     * @param callback
     */
    async function updateDoc(values: ReturnType<typeof documentInterface.value>, callback: (_res: Response) => void, onError?: (_err: any) => boolean) {
        /**
         *
         */
        let _method = 'put',
            _action = 'update'

        if (!values?._id) {
            values._id = null
            _method = 'post'
            _action = 'create'
        }

        const axiosOpt = (() => {
            return {
                method: _method,
                url: `${toValue(collection)}/${_action}`,
                data: values,
            }
        })()

        await handleBase(axiosOpt, { loading, toast, onError }, (res: Response) => {
            /**
             *
             */
            callback?.(res)
        })
    }

    async function updatePatchDoc(values: { _id: string; [key: string]: any }, callback: (_res: Response) => void) {
        const axiosOpt = (() => {
            return {
                method: 'patch',
                url: `${toValue(collection)}/update`,
                data: values,
            }
        })()
        await handleBase(axiosOpt, { loading, toast }, (res: Response) => {
            /**
             *
             */
            callback?.(res)
        })
    }

    /**
     * Function Delete
     * @param doc
     * @param props
     */
    async function deleteDoc(
        doc: ReturnType<typeof documentInterface.value>,
        name: string,
        callback: (_res: Response) => void,
    ): Promise<void> {
        const { [name]: _name, _id } = doc

        confirmDelete({
            getHtml: () => {
                return `${_name}`
            },
            callback: async () => {
                const opt = {
                    method: 'delete',
                    url: `${toValue(collection)}/delete/${_id}`,
                }

                await handleBase(opt, { loading, toast }, (res: Response) => {
                    res.data = { _id }
                    callback?.(res)
                })
            },
        })
    }

    return {
        documentInterface,
        document,
        updateDoc,
        deleteDoc,
        updatePatchDoc,
    }
}
