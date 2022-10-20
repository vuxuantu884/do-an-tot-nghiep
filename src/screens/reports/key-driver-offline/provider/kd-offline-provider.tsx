import { KeyDriverDimension, KeyDriverTarget, LocalStorageKey } from "model/report";
import React from "react";
import { kdOfflineTemplateData } from "../constant/kd-offline-template";

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
  displayColumns: any[];
  setDisplayColumns: React.Dispatch<React.SetStateAction<any[]>>;
};

export const KDOfflineContext = React.createContext<KDOfflineProviderValue>(
  {} as KDOfflineProviderValue,
);

function KDOfflineProvider(props: { children: React.ReactNode; dimension: KeyDriverDimension }) {
  const defaultData = kdOfflineTemplateData.filter((item: any) => {
    return !item.allowedDimension || item.allowedDimension.includes(props.dimension);
  });
  const [data, setData] = React.useState<any>(JSON.parse(JSON.stringify(defaultData)));
  const [kdTarget, setKDTarget] = React.useState<KeyDriverTarget[]>([]);
  const [selectedStores, setSelectedStores] = React.useState<string[]>([]);
  const [selectedAsm, setSelectedAsm] = React.useState<string[]>([]);
  const [selectedStaffs, setSelectedStaffs] = React.useState<string[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>("");
  const [selectedStoreRank, setSelectedStoreRank] = React.useState<number | undefined>(undefined);
  const [selectedAllStores, setSelectedAllStores] = React.useState<boolean>(true);
  const getColumns = localStorage.getItem(LocalStorageKey.KDOfflineColumnsV1);
  const [displayColumns, setDisplayColumns] = React.useState<any[]>(
    getColumns
      ? JSON.parse(getColumns)
      : [
          {
            title: "Mục tiêu tháng",
            name: "_month",
            index: 0,
            visible: true,
          },
          {
            title: "Luỹ kế",
            name: "_accumulatedMonth",
            index: 1,
            visible: true,
            fixed: true,
          },
          {
            title: "Tỉ lệ",
            name: "_rateMonth",
            index: 2,
            visible: true,
          },
          {
            title: "Dự kiến đạt",
            name: "_targetMonth",
            index: 3,
            visible: true,
          },
          {
            title: "Mục tiêu ngày",
            name: "_day",
            index: 4,
            visible: true,
          },
          {
            title: "Thực đạt",
            name: "_actualDay",
            index: 5,
            visible: true,
            fixed: true,
          },
          {
            title: "Tỉ lệ",
            name: "_rateDay",
            index: 6,
            visible: true,
          },
        ],
  );

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
        displayColumns,
        setDisplayColumns,
      }}
    />
  );
}

export default KDOfflineProvider;
