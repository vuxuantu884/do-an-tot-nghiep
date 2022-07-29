import { AccountJobResponse, AccountResponse } from "model/account/account.model";
import React, { createContext, ReactNode, useState } from "react";

type AccountDetailAction = {
  userCode: string;
  setUserCode: (code: string) => void;
  accountInfo: AccountResponse;
  setAccountInfo: (acc: AccountResponse) => void;
  accountJobs: Array<AccountJobResponse>;
  setAccountJobs: (jobs: Array<AccountJobResponse>) => void;
};
export const AccountDetailContext = createContext<Partial<AccountDetailAction>>(
  {} as AccountDetailAction,
);
AccountDetailProvider.defaultProps = {};
function AccountDetailProvider(props: { children: ReactNode }) {
  const [userCode, setUserCode] = useState<string>();
  const [accountInfo, setAccountInfo] = useState<AccountResponse>({} as AccountResponse);
  const [accountJobs, setAccountJobs] = useState<Array<AccountJobResponse>>(
    [] as Array<AccountJobResponse>,
  );

  return (
    <AccountDetailContext.Provider
      {...props}
      value={{
        accountInfo,
        setAccountInfo,
        accountJobs,
        setAccountJobs,
        userCode,
        setUserCode,
      }}
    />
  );
}

export default AccountDetailProvider;
