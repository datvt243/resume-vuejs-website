/**
 * Author: Đạt Võ - https://github.com/datvt243
 * Date: `--/--`
 * Description:
 */

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faUserSecret,
    faXmark,
    faCheck,
    faEye,
    faEyeSlash,
    faTrash,
    faSquarePen,
    faCalendar,
    faPlus,
    faGraduationCap,
    faBuilding,
    faCode,
    faCertificate,
    faAward,
    faRepeat,
    faArrowRightFromBracket,
    faDownload,
    faTimes,
    faEnvelope,
    faLock,
    faFileLines,
    faGauge,
    faSun,
    faMoon,
    faUser,
    faPaperclip,
    faCircleCheck,
    faCircleXmark,
    faBriefcase,
    faGripVertical,
    faCopy,
    faCamera,
} from '@fortawesome/free-solid-svg-icons'

export default {
    install(app) {
        /**
         *
         */
        library.add(
            faUserSecret,
            faXmark,
            faCheck,
            faEye,
            faEyeSlash,
            faTrash,
            faSquarePen,
            faCalendar,
            faPlus,
            faGraduationCap,
            faBuilding,
            faCode,
            faCertificate,
            faAward,
            faRepeat,
            faArrowRightFromBracket,
            faDownload,
            faTimes,
            faEnvelope,
            faLock,
            faFileLines,
            faGauge,
            faSun,
            faMoon,
            faUser,
            faPaperclip,
            faCircleCheck,
            faCircleXmark,
            faBriefcase,
            faGripVertical,
            faCopy,
            faCamera,
        )

        app.component('FontAwesomeIcon', FontAwesomeIcon)
    },
}
