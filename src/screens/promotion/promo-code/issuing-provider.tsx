
import React, { createContext, ReactNode, useState } from "react";

type IssuingAction = {

  isAllProduct: boolean;
  setIsAllProduct: (discountData: boolean) => void;
};

export const IssuingContext = createContext<IssuingAction>(
  {} as IssuingAction
);

function IssuingProvider(props: { children: ReactNode }) {
  const [isAllProduct, setIsAllProduct] = useState<boolean>(false);

  return (
    <IssuingContext.Provider
      {...props}
      value={{
        isAllProduct,
        setIsAllProduct,
      }}
    />
  );
}

export default IssuingProvider;
