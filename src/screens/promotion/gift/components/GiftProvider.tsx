import { GIFT_METHOD_ENUM, GiftVariant, PromotionGift } from "model/promotion/gift.model";
import React, { createContext, ReactNode, useState } from "react";


type GiftProviderVariable = {
  giftMethod: GIFT_METHOD_ENUM;
  setGiftMethod: (giftMethod: GIFT_METHOD_ENUM) => void;
  giftDetailData: PromotionGift;
  setGiftDetailData: (giftDetailData: PromotionGift) => void;
  giftVariantList: GiftVariant;
  setGiftVariantList: (giftDetailData: GiftVariant) => void;
};

export const GiftContext = createContext<GiftProviderVariable>({} as GiftProviderVariable);

function GiftProvider(props: { children: ReactNode }) {
  const [giftMethod, setGiftMethod] = useState<GIFT_METHOD_ENUM>(GIFT_METHOD_ENUM.QUANTITY);
  const [giftDetailData, setGiftDetailData] = useState<PromotionGift>({} as PromotionGift);
  const [giftVariantList, setGiftVariantList] = useState<GiftVariant>({} as GiftVariant);

  return (
    <GiftContext.Provider
      {...props}
      value={{
        giftMethod,
        setGiftMethod,
        giftDetailData,
        setGiftDetailData,
        giftVariantList,
        setGiftVariantList,
      }}
    />
  );
}

export default GiftProvider;