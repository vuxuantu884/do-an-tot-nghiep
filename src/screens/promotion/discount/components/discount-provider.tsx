
import { PriceRuleMethod, PriceRule } from "model/promotion/price-rules.model"; 
import React, { createContext, ReactNode, useState } from "react";

type DiscountAction = {
  discountMethod: PriceRuleMethod ;
  setDiscountMethod: (discountMethod: PriceRuleMethod ) => void;
  discountData: PriceRule;
  setDiscountData: (discountData: PriceRule) => void;
};

export const DiscountContext = createContext<DiscountAction>(
  {} as DiscountAction
);


function DiscountProvider(props: { children: ReactNode }) {
  const [discountData, setDiscountData] = useState<PriceRule>({} as PriceRule);
  const [discountMethod, setDiscountMethod] = useState<PriceRuleMethod >(PriceRuleMethod.FIXED_PRICE);

  return (
    <DiscountContext.Provider
      {...props}
      value={{
        discountMethod,
        setDiscountMethod,
        discountData,
        setDiscountData

      }}
    />
  );
}

export default DiscountProvider;
