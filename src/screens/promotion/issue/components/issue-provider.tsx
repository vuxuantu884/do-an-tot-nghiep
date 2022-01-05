
import React, { createContext, ReactNode, useState } from "react";

type IssueAction = {

  isAllProduct: boolean;
  setIsAllProduct: (discountData: boolean) => void;
};

export const IssueContext = createContext<IssueAction>(
  {} as IssueAction
);

function IssueProvider(props: { children: ReactNode }) {
  const [isAllProduct, setIsAllProduct] = useState<boolean>(false);

  return (
    <IssueContext.Provider
      {...props}
      value={{
        isAllProduct,
        setIsAllProduct,
      }}
    />
  );
}

export default IssueProvider;
