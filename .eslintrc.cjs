/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    extends: ['plugin:vue/vue3-essential', 'eslint:recommended'],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    overrides: [
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
        },
        {
            files: ['*.vue'],
            parserOptions: {
                parser: '@typescript-eslint/parser',
            },
        },
    ],
    rules: {
        // `const { unwanted, ...rest } = obj` là idiom "omit key" cố ý trong
        // codebase này (vd VeeForm.vue tách `valid` khỏi field trước khi
        // render) — không phải biến chết thật.
        // `_`-prefix cho tham số hàm không dùng tới (thường gặp ở chữ ký
        // kiểu TS thuần tuý, vd `(res: Response) => void`, nơi tên tham số
        // chỉ để tài liệu hoá, không có giá trị thật để "dùng").
        'no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
        // Global/layout component trong dự án này cố ý đặt tên 1 từ
        // (Button, Heading, Box...) — xem CLAUDE.md → Global Components.
        // Đổi tên file sẽ kéo theo sửa hàng loạt nơi dùng, không đáng so
        // với lợi ích của rule này ở 1 dự án cá nhân.
        'vue/multi-word-component-names': [
            'error',
            {
                ignores: [
                    'Modal',
                    'Navbar',
                    'Spinner',
                    'Toasts',
                    'Box',
                    'Button',
                    'Dropdown',
                    'Heading',
                    'Tabs',
                    'Footer',
                    'Header',
                    'Main',
                ],
            },
        ],
    },
}
