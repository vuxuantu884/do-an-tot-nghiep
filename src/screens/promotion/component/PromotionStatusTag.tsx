import React from "react";
import { PromotionStatusStyle } from "screens/promotion/component/styled";
import { PriceRuleState } from "model/promotion/price-rules.model";
import { CAMPAIGN_STATUS_ENUM } from "screens/promotion/campaign/campaign.helper";

type PromotionStatusProps = {
  status: string;
  children: React.ReactNode;
};
const PromotionStatusTag = (props: PromotionStatusProps) => {
  const { status, children } = props;
  let statusClassName: string;
  switch (status?.toUpperCase()) {
    case PriceRuleState.ACTIVE:
    case CAMPAIGN_STATUS_ENUM.ACTIVED:
      statusClassName = "active";
      break;
    case PriceRuleState.DISABLED:
      statusClassName = "disabled";
      break;
    case PriceRuleState.DRAFT:
    case CAMPAIGN_STATUS_ENUM.APPROVED:
      statusClassName = "draft";
      break;
    case PriceRuleState.CANCELLED:
      statusClassName = "cancelled";
      break;
    case CAMPAIGN_STATUS_ENUM.REGISTERED:
    case CAMPAIGN_STATUS_ENUM.SET_UP:
      statusClassName = "registered";
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
