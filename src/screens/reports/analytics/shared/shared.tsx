import Color from "assets/css/export-variable.module.scss"
import { HiChevronDoubleRight, HiOutlineChevronDoubleDown } from "react-icons/hi"
const { primary } = Color
type LabelCheckboxCollapseProps = {
    checked: boolean;
}
export const IconCheckboxCollapse = ({ checked, }: LabelCheckboxCollapseProps) => {
    return <div>
        {checked ? (
            <HiOutlineChevronDoubleDown color={primary} />
        ) : (
            <HiChevronDoubleRight color={primary} />
        )}
    </div>
}