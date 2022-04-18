import { MAX_TOP_RANK, TOP_CHARTS_KEY, TOP_SALES_BY_SHOP_OFFLINE, TOP_SALES_BY_SHOP_ONLINE } from 'config/dashboard';
import { DashboardTopSale } from 'model/dashboard/dashboard.model';
import { AnalyticDataQuery, AnalyticQueryMany, AnalyticSampleQuery } from 'model/report/analytics.model';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { executeManyAnalyticsQueryService } from 'service/report/analytics.service';
import { callApiNative } from 'utils/ApiUtils';
import { generateRQuery } from 'utils/ReportUtils';
import { showError } from 'utils/ToastUtils';
import { DashboardContext } from '../provider/dashboard-provider';


function useFetchTopSaleByShop() {
    const dispatch = useDispatch();
    const { setTopSale } = React.useContext(DashboardContext);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    useEffect(() => {
        const fetchFetchTopSaleByShop = async () => {
            setIsFetching(true);

            const params: AnalyticQueryMany = { q: [], options: [] };
            [TOP_SALES_BY_SHOP_ONLINE, TOP_SALES_BY_SHOP_OFFLINE].forEach((item: AnalyticSampleQuery) => {
                const q = generateRQuery(item.query);
                params.q.push(q);
                params.options.push(item.options || "");
            })
            const response: Array<AnalyticDataQuery> = await callApiNative({ isShowError: true }, dispatch, executeManyAnalyticsQueryService, params);

            setIsFetching(false);
            if (!response) {
                showError("Lỗi lấy dữ liệu doanh thu theo nhân viên");
                return;
            }


            let listTopSale: Array<DashboardTopSale> = [];
            response.forEach((data: AnalyticDataQuery) => {
                for (let index = 0; index < MAX_TOP_RANK; index++) {
                    const item = data.result.data[index];
                    if (item) {
                        listTopSale.push({
                            label: item[0],
                            totalSales: item[1],
                            averageOrder: item[2]
                        })
                    }

                }
            })
            
            listTopSale = listTopSale.sort((a, b) => {
                if (b.totalSales && a.totalSales) {
                    return b.totalSales - a.totalSales
                } else {
                    return 0;
                }
            }).slice(0, MAX_TOP_RANK);

            if(listTopSale.length){
                listTopSale[0].top = 1;
            }

            setTopSale((prevState: Map<string, DashboardTopSale[]>) => {
                const newState = new Map(prevState);
                newState.set(TOP_CHARTS_KEY.TOP_SHOP_SALES, listTopSale);
                return newState;
            });

        }

        fetchFetchTopSaleByShop();

    }, [dispatch, setTopSale]);
    return { isFetching }
}

export default useFetchTopSaleByShop