import { KeyDriverTarget } from "model/report";
import React from "react";
import { keyDriverOfflineTemplateData } from "../constant/key-driver-offline-template-data";

type KDOfflineProviderValue = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  kdTarget: KeyDriverTarget[];
  setKDTarget: React.Dispatch<React.SetStateAction<KeyDriverTarget[]>>;
  selectedStores: string[];
  setSelectedStores: React.Dispatch<React.SetStateAction<string[]>>;
  selectedAsm: string[];
  setSelectedAsm: React.Dispatch<React.SetStateAction<string[]>>;
  selectedStaffs: string[];
  setSelectedStaffs: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  selectedStoreRank: number | undefined;
  setSelectedStoreRank: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedAllStores: boolean;
  setSelectedAllStores: React.Dispatch<React.SetStateAction<boolean>>;
};

export const KDOfflineContext = React.createContext<KDOfflineProviderValue>(
  {} as KDOfflineProviderValue,
);

function KDOfflineProvider(props: { children: React.ReactNode }) {
  const [data, setData] = React.useState<any>(
    JSON.parse(JSON.stringify(keyDriverOfflineTemplateData)),
  );
  const [kdTarget, setKDTarget] = React.useState<KeyDriverTarget[]>([]);
  const [selectedStores, setSelectedStores] = React.useState<string[]>([]);
  const [selectedAsm, setSelectedAsm] = React.useState<string[]>([]);
  const [selectedStaffs, setSelectedStaffs] = React.useState<string[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [selectedStoreRank, setSelectedStoreRank] = React.useState<number | undefined>(undefined);
  const [selectedAllStores, setSelectedAllStores] = React.useState<boolean>(true);

  return (
    <KDOfflineContext.Provider
      {...props}
      value={{
        data,
        setData,
        kdTarget,
        setKDTarget,
        selectedAsm,
        setSelectedAsm,
        selectedStores,
        setSelectedStores,
        selectedStaffs,
        setSelectedStaffs,
        selectedDate,
        setSelectedDate,
        selectedStoreRank,
        setSelectedStoreRank,
        selectedAllStores,
        setSelectedAllStores,
      }}
    />
  );
}

export default KDOfflineProvider;
