import React, { createContext, useState, ReactNode } from "react";
import { VariantResponse } from "model/product/product.model";

type StockInOutCreateAction = {
  variantsResult: Array<VariantResponse>;
  setVariantsResult: React.Dispatch<React.SetStateAction<Array<VariantResponse>>>;
  storeID: number | undefined;
  setStoreID: React.Dispatch<React.SetStateAction<number | undefined>>;
};

export const StockInOutCreateContext = createContext<StockInOutCreateAction>(
  {} as StockInOutCreateAction,
);

export const StockInOutCreateProvider = (props: { children: ReactNode }) => {
  const [variantsResult, setVariantsResult] = useState<Array<VariantResponse>>([]);
  const [storeID, setStoreID] = useState<number | undefined>();

  return (
    <StockInOutCreateContext.Provider
      {...props}
      value={{
        variantsResult,
        setVariantsResult,
        storeID,
        setStoreID,
      }}
    />
  );
};
