import { MAX_TOP_RANK, TOP_CHARTS_KEY, TOP_SALES_BY_STAFF } from 'config/dashboard';
import { DashboardShowMyData, DashboardTopSale } from 'model/dashboard/dashboard.model';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getDataOneQueryDashboard } from 'utils/DashboardUtils';
import { showErrorReport } from 'utils/ReportUtils';
import { DashboardContext } from '../provider/dashboard-provider';


function useFetchTopSaleByStaff() {
    const dispatch = useDispatch();
    const { setTopSale, deparmentIdList } = React.useContext(DashboardContext);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    useEffect(() => {
        const fetchTopSaleByStaff = async () => {
            
            setIsFetching(true);
            const response = await getDataOneQueryDashboard(dispatch, {} as DashboardShowMyData, deparmentIdList, TOP_SALES_BY_STAFF);
            setIsFetching(false);

            if (!response) {
                showErrorReport("Lỗi lấy dữ liệu doanh thu theo nhân viên");
                return;
            }
            
            const listTopSale: Array<DashboardTopSale> = [];

            for (let index = 0; index < MAX_TOP_RANK; index++) {
                const item = response.result.data[index];
                if (item) {
                    listTopSale.push({
                        label: item[0],
                        totalSales: item[2],
                        averageOrder: item[3],
                        description: item[1],
                        top: index + 1
                    })
                }

            }

            setTopSale((prevState: Map<string, DashboardTopSale[]>) => {
                const newState = new Map(prevState);
                newState.set(TOP_CHARTS_KEY.TOP_STAFF_SALES, listTopSale);
                return newState;
            });

        }
        fetchTopSaleByStaff()
    }, [dispatch, setTopSale, deparmentIdList]);
    return { isFetching }
}

export default useFetchTopSaleByStaff