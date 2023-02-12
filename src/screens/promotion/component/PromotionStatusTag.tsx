import React from "react";
import { PromotionStatusStyle } from "screens/promotion/component/styled";
import { PriceRuleState } from "model/promotion/price-rules.model";

type PromotionStatusProps = {
  status: string;
  children: React.ReactNode;
};
const PromotionStatusTag = (props: PromotionStatusProps) => {
  const { status, children } = props;
  let statusClassName = "";
  switch (status?.toUpperCase()) {
    case PriceRuleState.ACTIVE:
      statusClassName = "active";
      break;
    case PriceRuleState.DISABLED:
      statusClassName = "disabled";
      break;
    case PriceRuleState.DRAFT:
      statusClassName = "draft";
      break;
    case PriceRuleState.CANCELLED:
      statusClassName = "cancelled";
      break;
    case PriceRuleState.PENDING:
    default:
      statusClassName = "pending";
      break;
  }

  return (
    <PromotionStatusStyle>
      <div className={`promotion-status ${statusClassName}`}>{children}</div>
    </PromotionStatusStyle>
  );
}

export default PromotionStatusTag;
