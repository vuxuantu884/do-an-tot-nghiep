
import { PriceRule } from "model/promotion/price-rules.model";
import React, { createContext, ReactNode, useState } from "react";

type IssueAction = {

  isAllProduct: boolean;// need to remove
  setIsAllProduct: (discountData: boolean) => void;// need to remove
  priceRuleData: PriceRule;
  setPriceRuleData: (discountData: PriceRule) => void;
  isLimitUsagePerCustomer?: boolean;
  setIsLimitUsagePerCustomer: (discountData: boolean) => void;
  isLimitUsage?: boolean;
  setIsLimitUsage: (discountData: boolean) => void;
};

export const IssueContext = createContext<IssueAction>(
  {} as IssueAction
);

function IssueProvider(props: { children: ReactNode }) {
  const [isAllProduct, setIsAllProduct] = useState<boolean>(false);
  const [priceRuleData, setPriceRuleData] = useState<PriceRule>({} as PriceRule);
  const [isLimitUsagePerCustomer, setIsLimitUsagePerCustomer] = useState(false);
  const [isLimitUsage, setIsLimitUsage] = useState(false);

  return (
    <IssueContext.Provider
      {...props}
      value={{
        isAllProduct,
        setIsAllProduct,
        priceRuleData,
        setPriceRuleData,
        isLimitUsagePerCustomer,
        setIsLimitUsagePerCustomer,
        isLimitUsage,
        setIsLimitUsage
      }}
    />
  );
}

export default IssueProvider;
