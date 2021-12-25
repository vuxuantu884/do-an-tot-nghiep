
import React, { createContext, ReactNode, useState } from "react";

type IssuingAction = {

  isAllProduct: boolean;
  setIsAllProduct: (discountData: boolean) => void;
};

export const ReleaseContext = createContext<IssuingAction>(
  {} as IssuingAction
);

function IssuingProvider(props: { children: ReactNode }) {
  const [isAllProduct, setIsAllProduct] = useState<boolean>(false);

  return (
    <ReleaseContext.Provider
      {...props}
      value={{
        isAllProduct,
        setIsAllProduct,
      }}
    />
  );
}

export default IssuingProvider;
