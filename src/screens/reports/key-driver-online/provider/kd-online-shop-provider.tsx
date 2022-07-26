import React from 'react';
import { keyDriverOnlineTemplateData } from '../constant/key-driver-online-template-data';

type KDOnlineShopProviderValue = {
    data: any;
    setData: React.Dispatch<React.SetStateAction<any>>;
    selectedShops: string[];
    setSelectedShops: React.Dispatch<React.SetStateAction<string[]>>;
    selectedCN: string[];
    setSelectedCN: React.Dispatch<React.SetStateAction<string[]>>;
}

export const KDOnlineShopContext = React.createContext<KDOnlineShopProviderValue>({} as KDOnlineShopProviderValue);

function KDOnlineShopProvider(props: { children: React.ReactNode }) {
    const [data, setData] = React.useState<any>(keyDriverOnlineTemplateData);
    const [selectedShops, setSelectedShops] = React.useState<string[]>([]);
    const [selectedCN, setSelectedCN] = React.useState<string[]>([]);

    return (
        <KDOnlineShopContext.Provider
            {...props}
            value={{
                data,
                setData,
                selectedShops,
                setSelectedShops,
                selectedCN,
                setSelectedCN,
            }}
        />
    )
}

export default KDOnlineShopProvider
