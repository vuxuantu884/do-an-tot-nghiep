
import { DASHBOARD_CONFIG } from 'config/dashboard';
import { TOP_SALES_PRODUCT_TEMPLATE } from 'config/dashboard/product-rank-config';
import { DashboardTopProduct } from 'model/dashboard/dashboard.model';
import { AnalyticDataQuery } from 'model/report/analytics.model';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { executeAnalyticsQueryService } from 'service/report/analytics.service';
import { callApiNative } from 'utils/ApiUtils';
import { setDepartmentQuery } from 'utils/DashboardUtils';
import { generateRQuery } from 'utils/ReportUtils';
import { showError } from 'utils/ToastUtils';
import { DashboardContext } from '../provider/dashboard-provider';


function useFetchTopProduct() {
    const dispatch = useDispatch();
    const { setDataSrcTopProduct, deparmentIdList } = React.useContext(DashboardContext);

    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const fetchTopProduct = async () => {
            setIsFetching(true);
            TOP_SALES_PRODUCT_TEMPLATE.query.conditions = setDepartmentQuery(deparmentIdList, DASHBOARD_CONFIG.locationQueryField);
            const q = generateRQuery(TOP_SALES_PRODUCT_TEMPLATE.query);
            const response: AnalyticDataQuery = await callApiNative({ notifyAction: "HIDE_ALL" },
                dispatch, executeAnalyticsQueryService, { q });
            setIsFetching(false);
            if (!response) {
                showError("Lỗi lấy dữ liệu doanh thu theo sản phẩm");
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
    }, [dispatch, setDataSrcTopProduct, deparmentIdList]);

    return { isFetching }
}

export default useFetchTopProduct