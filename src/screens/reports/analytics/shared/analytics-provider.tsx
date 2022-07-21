/**
 * Dùng để lưu metadata và data của báo cáo để các component khác sử dụng nhanh
 */
import { AnalyticDataQuery, AnalyticMetadata, PermissionViewReport } from 'model/report/analytics.model';
import React, { ReactNode, useState } from 'react';

type Props = {
    metadata?: AnalyticMetadata;
    dataQuery?: AnalyticDataQuery;
    setMetadata: (metadata: AnalyticMetadata) => void;
    setDataQuery: (dataQuery: AnalyticDataQuery) => void;
    permissionViewReport: PermissionViewReport;
    setPermissionViewReport: (permissionViewReport: PermissionViewReport | any) => void;
    chartDataQuery?: AnalyticDataQuery;
    setChartDataQuery: (chartDataQuery: AnalyticDataQuery) => void;
    chartColumnSelected?: string[],
    setChartColumnSelected: (chartColumnSelected: string[]) => void;
    activeFilters: Map<string, any>,
    setActiveFilters: (activeFilters: Map<string, any> | any) => void;
    rowsInQuery: string[];
    setRowsInQuery: (rowsInQuery: string[] | any) => void;
    isMyReport: boolean;
    setIsMyReport: (isMyReport: boolean) => void;
    loadingChart: boolean;
    setLoadingChart: (loadingChart: boolean | any) => void;
    permissionStores: string[];
    setPermissionStores: (permissionStores: string[] | any) => void;
}

export const AnalyticsContext = React.createContext<Props>({} as Props)

function AnalyticsProvider(props: { children: ReactNode }) {
    const [metadata, setMetadata] = useState<AnalyticMetadata>()
    const [dataQuery, setDataQuery] = useState<AnalyticDataQuery>();
    const [chartDataQuery, setChartDataQuery] = useState<AnalyticDataQuery>();
    const [chartColumnSelected, setChartColumnSelected] = useState<string[]>();
    const [activeFilters, setActiveFilters] = useState<Map<string, any>>(new Map<string, any>());
    const [rowsInQuery, setRowsInQuery] = useState<string[]>([]);
    const [isMyReport, setIsMyReport] = useState<boolean>(true);
    const [loadingChart, setLoadingChart] = useState<boolean>(false);
    const [permissionViewReport, setPermissionViewReport] = useState<PermissionViewReport>({ isPermission: '' });
    const [permissionStores, setPermissionStores] = useState<string[]>([]);
    return (
        <AnalyticsContext.Provider
            {...props}
            value={{
                metadata,
                setMetadata,
                dataQuery,
                setDataQuery,
                chartDataQuery,
                setChartDataQuery,
                chartColumnSelected,
                setChartColumnSelected,
                activeFilters,
                setActiveFilters,
                rowsInQuery,
                setRowsInQuery,
                isMyReport,
                setIsMyReport,
                loadingChart,
                setLoadingChart,
                permissionViewReport,
                setPermissionViewReport,
                permissionStores,
                setPermissionStores
            }}
        />
    )
}

export default AnalyticsProvider