import React from "react";
import { keyDriverOnlineTemplateData } from "../constant/key-driver-online-template-data";

type KeyDriverOnlineProviderValue = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
};

export const KeyDriverOfflineContext = React.createContext<KeyDriverOnlineProviderValue>(
  {} as KeyDriverOnlineProviderValue,
);

function KeyDriverOnlineProvider(props: { children: React.ReactNode }) {
  const [data, setData] = React.useState<any>(keyDriverOnlineTemplateData);
  return (
    <KeyDriverOfflineContext.Provider
      {...props}
      value={{
        data,
        setData,
      }}
    />
  );
}

export default KeyDriverOnlineProvider;
