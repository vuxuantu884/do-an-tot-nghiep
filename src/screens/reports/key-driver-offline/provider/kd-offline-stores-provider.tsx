import { KeyDriverTarget } from 'model/report';
import React from 'react';
import { keyDriverOfflineTemplateData } from '../constant/key-driver-offline-template-data';

type KDOfflineStoresProviderValue = {
    data: any;
    setData: React.Dispatch<React.SetStateAction<any>>;
    targetMonth: KeyDriverTarget[];
    setTargetMonth: React.Dispatch<React.SetStateAction<KeyDriverTarget[]>>;
    selectedStores: string[];
    setSelectedStores: React.Dispatch<React.SetStateAction<string[]>>;
    selectedAsm: string[];
    setSelectedAsm: React.Dispatch<React.SetStateAction<string[]>>;
}

export const KDOfflineStoresContext = React.createContext<KDOfflineStoresProviderValue>({} as KDOfflineStoresProviderValue);

function KDOfflineStoresProvider(props: { children: React.ReactNode }) {
    const [data, setData] = React.useState<any>(keyDriverOfflineTemplateData);
    const [targetMonth, setTargetMonth] = React.useState<KeyDriverTarget[]>([]);
    const [selectedStores, setSelectedStores] = React.useState<string[]>([]);
    const [selectedAsm, setSelectedAsm] = React.useState<string[]>([]);

    return (
        <KDOfflineStoresContext.Provider
            {...props}
            value={{
                data,
                setData,
                targetMonth,
                setTargetMonth,
                selectedAsm,
                setSelectedAsm,
                selectedStores,
                setSelectedStores
            }}
        />
    )
}

export default KDOfflineStoresProvider