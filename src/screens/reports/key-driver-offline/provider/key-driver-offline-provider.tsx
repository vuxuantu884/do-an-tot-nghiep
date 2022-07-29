import { KeyDriverTarget } from "model/report";
import React from "react";
import { keyDriverOfflineTemplateData } from "../constant/key-driver-offline-template-data";

type KeyDriverOfflineProviderValue = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  targetMonth: KeyDriverTarget[];
  setTargetMonth: React.Dispatch<React.SetStateAction<KeyDriverTarget[]>>;
};

export const KeyDriverOfflineContext = React.createContext<KeyDriverOfflineProviderValue>(
  {} as KeyDriverOfflineProviderValue,
);

function KeyDriverOfflineProvider(props: { children: React.ReactNode }) {
  const [data, setData] = React.useState<any>(keyDriverOfflineTemplateData);
  const [targetMonth, setTargetMonth] = React.useState<KeyDriverTarget[]>([]);

  return (
    <KeyDriverOfflineContext.Provider
      {...props}
      value={{
        data,
        setData,
        targetMonth,
        setTargetMonth,
      }}
    />
  );
}

export default KeyDriverOfflineProvider;
