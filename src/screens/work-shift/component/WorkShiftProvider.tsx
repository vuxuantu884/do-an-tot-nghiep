import React, { createContext, ReactNode, useState } from "react";
import { AccountStoreResponse } from "model/account/account.model";

type WorkShiftProviderVariable = {
  accountStores: Array<AccountStoreResponse>;
  setAccountStores: (accountStores: Array<AccountStoreResponse>) => void;
};

export const WorkShiftContext = createContext<WorkShiftProviderVariable>(
  {} as WorkShiftProviderVariable,
);

function WorkShiftProvider(props: { children: ReactNode }) {
  const [accountStores, setAccountStores] = useState<Array<AccountStoreResponse>>([]);

  return (
    <WorkShiftContext.Provider
      {...props}
      value={{
        accountStores,
        setAccountStores,
      }}
    />
  );
}

export default WorkShiftProvider;
