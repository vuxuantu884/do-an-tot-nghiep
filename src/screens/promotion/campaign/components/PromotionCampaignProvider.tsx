import React, { createContext, ReactNode, useState } from "react";
import { PROMOTION_TYPE } from "screens/promotion/constants";
import {
  CAMPAIGN_STEPS_LIST,
  PromotionCampaignStep,
} from "screens/promotion/campaign/campaign.helper";

type PromotionCampaignProviderVariable = {
  tempPromotionSelectedList: any;
  setTempPromotionSelectedList: (item: any) => void;
  tempSelectedRowKeys: any;
  setTempSelectedRowKeys: (item: any) => void;
  promotionSelectedList: any;
  setPromotionSelectedList: (item: any) => void;
  originalSelectedRowKeys: any;
  setOriginalSelectedRowKeys: (item: any) => void;
  selectedRowKeys: any;
  setSelectedRowKeys: (item: any) => void;
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
  currentStep: PromotionCampaignStep;
  setCurrentStep: (currentStep: PromotionCampaignStep) => void;
};

export const PromotionCampaignContext = createContext<PromotionCampaignProviderVariable>(
  {} as PromotionCampaignProviderVariable,
);

function PromotionCampaignProvider(props: { children: ReactNode }) {
  const [tempPromotionSelectedList, setTempPromotionSelectedList] = useState<any>([]);
  const [tempSelectedRowKeys, setTempSelectedRowKeys] = useState<any>([]);
  const [promotionSelectedList, setPromotionSelectedList] = useState<any>([]);
  const [originalSelectedRowKeys, setOriginalSelectedRowKeys] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [activeTab, setActiveTab] = useState<string>(PROMOTION_TYPE.DISCOUNT);
  const [currentStep, setCurrentStep] = useState(CAMPAIGN_STEPS_LIST[0]);

  return (
    <PromotionCampaignContext.Provider
      {...props}
      value={{
        tempPromotionSelectedList,
        setTempPromotionSelectedList,
        tempSelectedRowKeys,
        setTempSelectedRowKeys,
        promotionSelectedList,
        setPromotionSelectedList,
        originalSelectedRowKeys,
        setOriginalSelectedRowKeys,
        selectedRowKeys,
        setSelectedRowKeys,
        activeTab,
        setActiveTab,
        currentStep,
        setCurrentStep,
      }}
    />
  );
}

export default PromotionCampaignProvider;
