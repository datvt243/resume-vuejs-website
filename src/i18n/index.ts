/**
 * UI language. Follows the CV language chosen in the header (`useCvLang`),
 * so one VI | EN switch controls both. Untranslated screens keep their
 * hard-coded Vietnamese text.
 */
import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import { useCvLang } from '@/composables/useCvLang'

const vi = {
    header: {
        account: 'Tài khoản',
        login: 'Đăng nhập',
        register: 'Đăng ký',
        language: 'Ngôn ngữ',
        languageInfoLabel: 'Ngôn ngữ này áp dụng cho những gì?',
        languageInfo: 'Áp dụng cho cả giao diện và ngôn ngữ CV: xem trước, link CV công khai và file PDF tải về.',
        themeLight: 'Chuyển sang giao diện sáng',
        themeDark: 'Chuyển sang giao diện tối',
        openNav: 'Mở menu điều hướng',
        downloadCv: 'Tải CV',
        viewApi: 'Xem API',
        logout: 'Đăng xuất',
    },
    nav: {
        main: 'Điều hướng chính',
        overview: 'Tổng quan',
        profile: 'Hồ sơ',
        tools: 'Công cụ',
        dashboard: 'Dashboard',
        visits: 'Lượt truy cập',
        information: 'Thông tin cơ bản',
        generalInformation: 'Thông tin chung',
        education: 'Học vấn',
        experience: 'Kinh nghiệm',
        project: 'Dự án',
        award: 'Giải thưởng',
        certificate: 'Chứng chỉ',
        reference: 'Người tham khảo',
        application: 'Ứng tuyển',
        importCv: 'Nhập CV',
        atsCheck: 'Kiểm tra ATS',
        cvProfile: 'Profile CV',
        preview: 'Xem trước / Xuất PDF',
        accountSettings: 'Cài đặt tài khoản',
    },
}

const en: typeof vi = {
    header: {
        account: 'Account',
        login: 'Log in',
        register: 'Sign up',
        language: 'Language',
        languageInfoLabel: 'What does this language apply to?',
        languageInfo: 'Applies to both the interface and your CV language: the preview, the public CV link and the downloaded PDF.',
        themeLight: 'Switch to light theme',
        themeDark: 'Switch to dark theme',
        openNav: 'Open navigation menu',
        downloadCv: 'Download CV',
        viewApi: 'View API',
        logout: 'Log out',
    },
    nav: {
        main: 'Main navigation',
        overview: 'Overview',
        profile: 'Profile',
        tools: 'Tools',
        dashboard: 'Dashboard',
        visits: 'Visits',
        information: 'Basic information',
        generalInformation: 'General information',
        education: 'Education',
        experience: 'Experience',
        project: 'Projects',
        award: 'Awards',
        certificate: 'Certificates',
        reference: 'References',
        application: 'Applications',
        importCv: 'Import CV',
        atsCheck: 'ATS check',
        cvProfile: 'CV profiles',
        preview: 'Preview / Export PDF',
        accountSettings: 'Account settings',
    },
}

const { selectedLang } = useCvLang()

export const i18n = createI18n({
    legacy: false,
    locale: selectedLang.value,
    fallbackLocale: 'vi',
    messages: { vi, en },
})

watch(
    selectedLang,
    lang => {
        i18n.global.locale.value = lang
        document.documentElement.lang = lang
    },
    { immediate: true },
)
