import { PriceRule, ReleasePromotionListType } from "model/promotion/price-rules.model";
import React, { createContext, ReactNode, useState } from "react";
import { AllOrExcludeProductEnum, DiscountUnitType } from "screens/promotion/constants";

type IssueAction = {
  isSetFormValues: boolean;
  setIsSetFormValues: (isSetFormValues: boolean) => void;
  isAllProduct: boolean; // need to remove
  setIsAllProduct: (discountData: boolean) => void; // need to remove
  priceRuleData: PriceRule;
  setPriceRuleData: (discountData: PriceRule) => void;
  isLimitUsagePerCustomer?: boolean;
  setIsLimitUsagePerCustomer: (discountData: boolean) => void;
  isLimitUsage?: boolean;
  setIsLimitUsage: (discountData: boolean) => void;
  registerWithMinistry: boolean;
  setRegisterWithMinistry: (item: boolean) => void;
  typeSelectPromotion: string;
  setTypeSelectPromotion: (item: string) => void;
  valueChangePromotion: number;
  setValueChangePromotion: (item: number) => void;
  promotionType: string;
  setPromotionType: (item: string) => void;
  releasePromotionListType: string;
  setReleasePromotionListType: (item: string) => void;
  releaseWithExcludeOrAllProduct: string;
  setReleaseWithExcludeOrAllProduct: (item: string) => void;
  listProductSelectImportNotExclude: any[];
  setListProductSelectImportNotExclude: (item: any) => void;
  listProductSelectImportHaveExclude: any[];
  setListProductSelectImportHaveExclude: (item: any) => void;
  isGettingProduct: boolean;
  setIsGettingProduct: (isGettingProduct: boolean) => void;
  isSmsVoucher: boolean;
  setIsSmsVoucher: (isGettingProduct: boolean) => void;
};

export const IssueContext = createContext<IssueAction>({} as IssueAction);

function IssueProvider(props: { children: ReactNode }) {
  const [isSetFormValues, setIsSetFormValues] = useState<boolean>(false);
  const [isAllProduct, setIsAllProduct] = useState<boolean>(false);
  const [priceRuleData, setPriceRuleData] = useState<PriceRule>({} as PriceRule);
  const [isLimitUsagePerCustomer, setIsLimitUsagePerCustomer] = useState(false);
  const [isLimitUsage, setIsLimitUsage] = useState(false);
  const [registerWithMinistry, setRegisterWithMinistry] = useState<boolean>(false);
  const [typeSelectPromotion, setTypeSelectPromotion] = useState<string>(DiscountUnitType.PERCENTAGE.value);
  const [valueChangePromotion, setValueChangePromotion] = useState<number>(0);
  const [promotionType, setPromotionType] = useState<string>("");
  const [releasePromotionListType, setReleasePromotionListType] = useState<string>(ReleasePromotionListType.EQUALS);
  const [releaseWithExcludeOrAllProduct, setReleaseWithExcludeOrAllProduct] = useState<string>(AllOrExcludeProductEnum.ALL);
  const [listProductSelectImportNotExclude, setListProductSelectImportNotExclude] = useState<any[]>([]);
  const [listProductSelectImportHaveExclude, setListProductSelectImportHaveExclude] = useState<any[]>([]);
  const [isGettingProduct, setIsGettingProduct] = useState<boolean>(false);
  const [isSmsVoucher, setIsSmsVoucher] = useState<boolean>(false);

  return (
    <IssueContext.Provider
      {...props}
      value={{
        isSetFormValues,
        setIsSetFormValues,
        isAllProduct,
        setIsAllProduct,
        priceRuleData,
        setPriceRuleData,
        isLimitUsagePerCustomer,
        setIsLimitUsagePerCustomer,
        isLimitUsage,
        setIsLimitUsage,
        registerWithMinistry,
        setRegisterWithMinistry,
        typeSelectPromotion,
        setTypeSelectPromotion,
        valueChangePromotion,
        setValueChangePromotion,
        promotionType,
        setPromotionType,
        releasePromotionListType,
        setReleasePromotionListType,
        releaseWithExcludeOrAllProduct,
        setReleaseWithExcludeOrAllProduct,
        listProductSelectImportNotExclude,
        setListProductSelectImportNotExclude,
        listProductSelectImportHaveExclude,
        setListProductSelectImportHaveExclude,
        isGettingProduct,
        setIsGettingProduct,
        isSmsVoucher,
        setIsSmsVoucher,
      }}
    />
  );
}

export default IssueProvider;
