import { PriceRuleMethod, PriceRule } from "model/promotion/price-rules.model";
import React, { createContext, ReactNode, useState } from "react";

type DiscountAction = {
  discountMethod: PriceRuleMethod;
  setDiscountMethod: (discountMethod: PriceRuleMethod) => void;
  discountData: PriceRule;
  setDiscountData: (discountData: PriceRule) => void;
  discountAllProduct: boolean;
  setDiscountAllProduct: (item: boolean) => void;
  discountProductHaveExclude: boolean;
  setDiscountProductHaveExclude: (item: boolean) => void;
  registerWithMinistry: boolean;
  setRegisterWithMinistry: (item: boolean) => void;
};

export const DiscountContext = createContext<DiscountAction>({} as DiscountAction);

function DiscountProvider(props: { children: ReactNode }) {
  const [discountData, setDiscountData] = useState<PriceRule>({} as PriceRule);
  const [discountMethod, setDiscountMethod] = useState<PriceRuleMethod>(
    PriceRuleMethod.FIXED_PRICE,
  );
  const [discountAllProduct, setDiscountAllProduct] = useState<boolean>(false);
  const [discountProductHaveExclude, setDiscountProductHaveExclude] = useState<boolean>(false);

  const [registerWithMinistry, setRegisterWithMinistry] = useState<boolean>(false);

  return (
    <DiscountContext.Provider
      {...props}
      value={{
        discountMethod,
        setDiscountMethod,
        discountData,
        setDiscountData,
        discountAllProduct,
        setDiscountAllProduct,
        discountProductHaveExclude,
        setDiscountProductHaveExclude,
        registerWithMinistry,
        setRegisterWithMinistry,
      }}
    />
  );
}

export default DiscountProvider;
