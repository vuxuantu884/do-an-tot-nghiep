import { KeyDriverTarget } from "model/report";
import React from "react";
import { keyDriverOfflineTemplateData } from "../constant/key-driver-offline-template-data";

type KeyDriverOfflineProviderValue = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  kdTarget: KeyDriverTarget[];
  setKDTarget: React.Dispatch<React.SetStateAction<KeyDriverTarget[]>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
};

export const KeyDriverOfflineContext = React.createContext<KeyDriverOfflineProviderValue>(
  {} as KeyDriverOfflineProviderValue,
);

function KeyDriverOfflineProvider(props: { children: React.ReactNode }) {
  const [data, setData] = React.useState<any>(
    JSON.parse(JSON.stringify(keyDriverOfflineTemplateData)),
  );
  const [kdTarget, setKDTarget] = React.useState<KeyDriverTarget[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>("");

  return (
    <KeyDriverOfflineContext.Provider
      {...props}
      value={{
        data,
        setData,
        kdTarget,
        setKDTarget,
        selectedDate,
        setSelectedDate,
      }}
    />
  );
}

export default KeyDriverOfflineProvider;
