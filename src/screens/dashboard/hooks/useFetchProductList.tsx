
import { PRODUCT_LIST_CONFIG } from 'config/dashboard/product-list-config';
import { DashboardProductList } from 'model/dashboard/dashboard.model';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getDataOneQueryDashboard, mapOnHandByVariantSkusIntoProducts } from 'utils/DashboardUtils';
import { showErrorReport } from 'utils/ReportUtils';
import { DashboardContext } from '../provider/dashboard-provider';


function useFetchProductList() {
    const dispatch = useDispatch();
    const { setDataProductList, deparmentIdList, showMyData } = React.useContext(DashboardContext);

    const [isFetching, setIsFetching] = useState<boolean>(false);

    useEffect(() => {
        const fetchProductList = async () => {
            setIsFetching(true);
            const response = await getDataOneQueryDashboard(dispatch, showMyData, deparmentIdList, PRODUCT_LIST_CONFIG);
            setIsFetching(false);
            if (!response) {
                showErrorReport("Lỗi lấy dữ liệu doanh thu, số lượng theo sản phẩm");
                return;
            }
            let productList: Array<DashboardProductList> = [];
            response.result.data.filter(item => item && item[1] && (item[1].substr(0, 1).toUpperCase() !== 'Z')).forEach((item) => {
                if (item) {
                    productList.push({
                        label: `${item[1]} - ${item[0]}`,
                        totalSales: Number(item[3]),
                        netQuantity: Number(item[4]),
                        onHand: '-',
                        variantSku: item[1]
                    })
                }
            });
            productList = await mapOnHandByVariantSkusIntoProducts(productList, dispatch, 1, deparmentIdList);
            
            setDataProductList(productList);
        }
        fetchProductList();
    }, [dispatch, setDataProductList, deparmentIdList, showMyData]);

    return { isFetching }
}

export default useFetchProductList