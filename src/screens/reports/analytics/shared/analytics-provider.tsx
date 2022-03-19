/**
 * Dùng để lưu metadata và data của báo cáo để các component khác sử dụng nhanh
 */
import { AnalyticDataQuery, AnalyticMetadata } from 'model/report/analytics.model';
import React, { ReactNode, useState } from 'react';

type Props = {
    metadata?: AnalyticMetadata;
    dataQuery?: AnalyticDataQuery;
    setMetadata: (metadata: AnalyticMetadata) => void;
    setDataQuery: (dataQuery: AnalyticDataQuery) => void;
    cubeRef: React.MutableRefObject<string>; 
}

export const AnalyticsContext = React.createContext<Props>({} as Props)

function AnalyticsProvider(props: { children: ReactNode }) {
    const [metadata, setMetadata] = useState<AnalyticMetadata>()
    const [dataQuery, setDataQuery] = useState<AnalyticDataQuery>();
    const cubeRef = React.useRef<string>('');
    return (
        <AnalyticsContext.Provider
            {...props}
            value={{
                metadata,
                setMetadata,
                dataQuery,
                setDataQuery,
                cubeRef, 
            }}
        />
    )
}

export default AnalyticsProvider