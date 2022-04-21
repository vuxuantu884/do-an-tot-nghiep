import { MAX_TOP_RANK, TOP_CHARTS_KEY, TOP_SALES_BY_SHOP_OFFLINE, TOP_SALES_BY_SHOP_ONLINE } from 'config/dashboard';
import { DashboardShowMyData, DashboardTopSale } from 'model/dashboard/dashboard.model';
import { AnalyticDataQuery } from 'model/report/analytics.model';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getDataManyQueryDashboard } from 'utils/DashboardUtils';
import { showErrorReport } from 'utils/ReportUtils';
import { DashboardContext } from '../provider/dashboard-provider';


function useFetchTopSaleByShop() {
    const dispatch = useDispatch();
    const { setTopSale } = React.useContext(DashboardContext);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    useEffect(() => {
        const fetchFetchTopSaleByShop = async () => {
            setIsFetching(true);

            const response = await getDataManyQueryDashboard(dispatch, {} as DashboardShowMyData, [],
                [TOP_SALES_BY_SHOP_ONLINE, TOP_SALES_BY_SHOP_OFFLINE])

            setIsFetching(false);
            if (!response) {
                showErrorReport("Lỗi lấy dữ liệu doanh thu theo shop/cửa hàng");
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
                    return Number(b.totalSales) - Number(a.totalSales)
                } else {
                    return 0;
                }
            }).slice(0, MAX_TOP_RANK);

            if (listTopSale.length) {
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