import { h } from 'vue'

const Table = (props, { slots }) => {
    return h('table', {}, slots?.default && slots.default())
}

Table.props = {}
Table.slots = ['default']

export default Table
