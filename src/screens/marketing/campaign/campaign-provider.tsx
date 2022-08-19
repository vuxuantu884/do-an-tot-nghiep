import React, { createContext, ReactNode, useState } from "react";

type CampaignAction = {
  data: any;
  setData: (campaignData: any) => void;
};

export const CampaignContext = createContext<CampaignAction>({} as CampaignAction);

function CampaignProvider(props: { children: ReactNode }) {
  const [data, setData] = useState<any>();

  return (
    <CampaignContext.Provider
      {...props}
      value={{
        data,
        setData,
      }}
    />
  );
}

export default CampaignProvider;
