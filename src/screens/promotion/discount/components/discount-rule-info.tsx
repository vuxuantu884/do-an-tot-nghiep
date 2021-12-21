import { DiscountResponse } from 'model/response/promotion/discount/list-discount.response'
import React, { ReactElement } from 'react'
import "../discount.scss";

interface Props {
    dataDiscount: DiscountResponse
}

function DiscountRuleInfo({ dataDiscount }: Props): ReactElement {
    return (
        <div>
            <h3 className="rule-discount__info">Chiết khấu
                <span className="rule-discount__condition">{` ${dataDiscount.rule?.value}${dataDiscount.rule?.value_type === "FIXED_AMOUNT" ? "đ" : "%"} `}
                </span> cho đơn hàng thoả mãn
                <span className="rule-discount__condition">{dataDiscount.rule?.group_operator === "AND" ? " tất cả" : " 1 trong"}</span> các điều kiện</h3>
        </div>
    )
}

export default DiscountRuleInfo
