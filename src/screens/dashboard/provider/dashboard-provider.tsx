import { BusinessResultCartItem, DashboardShowMyData, DashboardTopProduct, DashboardTopSale, DayTotalSale } from 'model/dashboard/dashboard.model';
import React from 'react';

type DashboardProviderValue = {
    deparmentIdList: Array<string | number>;
    setDeparmentIdList: React.Dispatch<React.SetStateAction<Array<string | number>>>;
    dataSrcBusinessResultCard: Map<string, BusinessResultCartItem>;
    setDataSrcBusinessResultCard: React.Dispatch<React.SetStateAction<Map<string, BusinessResultCartItem>>>;
    dataSrcChartBusinessResult: DayTotalSale[];
    setDataSrcChartBusinessResult: React.Dispatch<React.SetStateAction<DayTotalSale[]>>;
    totalSalesToday: number;
    setTotalSalesToday: React.Dispatch<React.SetStateAction<number>>;
    topSale: Map<string, DashboardTopSale[]>;
    setTopSale: React.Dispatch<React.SetStateAction<Map<string, DashboardTopSale[]>>>;
    dataSrcTopProduct: DashboardTopProduct[];
    setDataSrcTopProduct: React.Dispatch<React.SetStateAction<DashboardTopProduct[]>>;
    showMyData: DashboardShowMyData;
    setShowMyData: React.Dispatch<React.SetStateAction<DashboardShowMyData>>;
}

export const DashboardContext = React.createContext<DashboardProviderValue>({} as DashboardProviderValue);

function DashboardPrivider(props: { children: React.ReactNode }) {
    const [deparmentIdList, setDeparmentIdList] = React.useState<Array<string | number>>([]);
    const [dataSrcBusinessResultCard, setDataSrcBusinessResultCard] = React.useState<Map<string, BusinessResultCartItem>>(new Map());
    const [dataSrcChartBusinessResult, setDataSrcChartBusinessResult] = React.useState<Array<DayTotalSale>>([]);
    const [totalSalesToday, setTotalSalesToday] = React.useState<number>(0);

    // Lưu data cho rank chart
    const [topSale, setTopSale] = React.useState<Map<string, Array<DashboardTopSale>>>(new Map());

    // Lưu data cho bảng top doanh thu và số lượng sản phẩm
    const [dataSrcTopProduct, setDataSrcTopProduct] = React.useState<Array<DashboardTopProduct>>([]);

    const [showMyData, setShowMyData] = React.useState<DashboardShowMyData>({ isSeeMyData: false });
    return (
        <DashboardContext.Provider
            {...props}
            value={{
                deparmentIdList,
                setDeparmentIdList,
                dataSrcBusinessResultCard,
                setDataSrcBusinessResultCard,
                dataSrcChartBusinessResult,
                setDataSrcChartBusinessResult,
                totalSalesToday,
                setTotalSalesToday,
                topSale,
                setTopSale,
                dataSrcTopProduct,
                setDataSrcTopProduct,
                showMyData,
                setShowMyData,
            }}
        />
    )
}

export default DashboardPrivider