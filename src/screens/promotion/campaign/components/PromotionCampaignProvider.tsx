import React, { createContext, ReactNode, useState } from "react";
import { PROMOTION_TYPE } from "screens/promotion/constants";

type PromotionCampaignProviderVariable = {
  tempPromotionSelectedList: any;
  setTempPromotionSelectedList: (item: any) => void;
  tempSelectedRowKeys: any;
  setTempSelectedRowKeys: (item: any) => void;
  promotionSelectedList: any;
  setPromotionSelectedList: (item: any) => void;
  selectedRowKeys: any;
  setSelectedRowKeys: (item: any) => void;
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
};

export const PromotionCampaignContext = createContext<PromotionCampaignProviderVariable>({} as PromotionCampaignProviderVariable);

function PromotionCampaignProvider(props: { children: ReactNode }) {
  const [tempPromotionSelectedList, setTempPromotionSelectedList] = useState<any>([]);
  const [tempSelectedRowKeys, setTempSelectedRowKeys] = useState<any>([]);
  const [promotionSelectedList, setPromotionSelectedList] = useState<any>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [activeTab, setActiveTab] = useState<string>(PROMOTION_TYPE.DISCOUNT);

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
        selectedRowKeys,
        setSelectedRowKeys,
        activeTab,
        setActiveTab,
      }}
    />
  );
}

export default PromotionCampaignProvider;
