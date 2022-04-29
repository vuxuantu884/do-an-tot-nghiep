
import { TOP_SALES_PRODUCT_TEMPLATE } from 'config/dashboard/product-rank-config';
import { DashboardTopProduct } from 'model/dashboard/dashboard.model';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getDataOneQueryDashboard } from 'utils/DashboardUtils';
import { showErrorReport } from 'utils/ReportUtils';
import { DashboardContext } from '../provider/dashboard-provider';


function useFetchTopProduct() {
    const dispatch = useDispatch();
    const { setDataSrcTopProduct, deparmentIdList, showMyData } = React.useContext(DashboardContext);

    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const fetchTopProduct = async () => {
            setIsFetching(true);
            const response = await getDataOneQueryDashboard(dispatch, showMyData, deparmentIdList, TOP_SALES_PRODUCT_TEMPLATE);
            setIsFetching(false);
            if (!response) {
                showErrorReport("Lỗi lấy dữ liệu doanh thu theo sản phẩm");
                return;
            }
            const listTopSale: Array<DashboardTopProduct> = [];
            response.result.data.forEach((item, index) => {
                if (item) {
                    listTopSale.push({
                        label: item[0],
                        total_sales: Number(item[1]),
                        net_quantity: Number(item[2])
                    })
                }
            });
            setDataSrcTopProduct(listTopSale);
        }
        fetchTopProduct();
    }, [dispatch, setDataSrcTopProduct, deparmentIdList, showMyData]);

    return { isFetching }
}

export default useFetchTopProduct