import React, { ReactElement, useContext } from "react";
import { Steps } from "antd";
import { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import {
  CAMPAIGN_STATUS_ENUM,
  CAMPAIGN_STEPS_LIST,
} from "screens/promotion/campaign/campaign.helper";
import { PromotionCampaignStepStyled } from "../campaign.style";

function PromotionCampaignStep(): ReactElement {
  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const { currentStep } = promotionCampaignContext;

  return (
    <PromotionCampaignStepStyled>
      <Steps
        type="navigation"
        current={currentStep.value}
        className="promotion-campaign-step"
        style={{ marginBottom: 20 }}
        status={currentStep.key === CAMPAIGN_STATUS_ENUM.ACTIVED ? "finish" : "process"}
      >
        {CAMPAIGN_STEPS_LIST.map((item, index) => (
          <Steps.Step key={item.key} title={item.title} />
        ))}
      </Steps>
    </PromotionCampaignStepStyled>
  );
}
export default PromotionCampaignStep;
