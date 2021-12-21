
import { DiscountMethod } from "model/promotion/discount.create.model";
import { DiscountResponse } from "model/response/promotion/discount/list-discount.response";
import React, { createContext, ReactNode, useState } from "react";

type DiscountUpdateAction = {
  selectedVariant: Array<any[]>;
  setSelectedVariant: (selectedVariant: Array<any[]>) => void;
  discountMethod: DiscountMethod | string;
  setDiscountMethod: (discountMethod: DiscountMethod | string) => void;
  discountData: DiscountResponse;
  setDiscountData: (discountData: DiscountResponse) => void;
};

export const DiscountUpdateContext = createContext<DiscountUpdateAction>(
  {} as DiscountUpdateAction
);


function DiscountUpdateProvider(props: { children: ReactNode }) {
  const [discountData, setDiscountData] = useState<DiscountResponse>({} as DiscountResponse);
  const [selectedVariant, setSelectedVariant] = useState<Array<any[]>>([]);
  const [discountMethod, setDiscountMethod] = useState<DiscountMethod | string>(DiscountMethod.FIXED_PRICE);

  return (
    <DiscountUpdateContext.Provider
      {...props}
      value={{
        selectedVariant,
        setSelectedVariant,
        discountMethod,
        setDiscountMethod,
        discountData,
        setDiscountData

      }}
    />
  );
}

export default DiscountUpdateProvider;
