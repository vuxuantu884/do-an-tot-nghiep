import { TOP_CHARTS_KEY, TOP_SALES_BY_SHOP_OFFLINE } from 'config/dashboard';
import { DashboardShowMyData, DashboardTopSale } from 'model/dashboard/dashboard.model';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getDataOneQueryDashboard } from 'utils/DashboardUtils';
import { showErrorReport } from 'utils/ReportUtils';
import { DashboardContext } from '../provider/dashboard-provider';


function useFetchTotalSaleByStore() {
    const dispatch = useDispatch();
    const { setTopSale } = React.useContext(DashboardContext);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    useEffect(() => {
        const fetchFetchTotalSaleByStore = async () => {
            setIsFetching(true);
            const response = await getDataOneQueryDashboard(dispatch, {} as DashboardShowMyData, [], TOP_SALES_BY_SHOP_OFFLINE)
            setIsFetching(false);

            if (!response) {
                showErrorReport("Lỗi lấy dữ liệu doanh thu theo cửa hàng");
                return;
            }

            const storeSales = response.result.data.reduce((res, item) => {
                if (item) {
                    const itemTmp = {
                        label: item[0],
                        totalSales: item[1],
                    }
                    return [...res, itemTmp];
                }
                return res;
            }, []);

            setTopSale((prevState: Map<string, DashboardTopSale[]>) => {
                const newState = new Map(prevState);
                newState.set(TOP_CHARTS_KEY.STORE_SALES, storeSales);
                return newState;
            });

        }

        fetchFetchTotalSaleByStore();

    }, [dispatch, setTopSale]);
    return { isFetching }
}

export default useFetchTotalSaleByStore