import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import PurchaseOrderFilter from "component/filter/purchase-order.filter";
import ButtonCreate from "component/header/ButtonCreate";
import { MenuAction } from "component/table/ActionButton";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/UrlConfig";
import { SupplierGetAllAction } from "domain/actions/core/supplier.action";
import { SupplierResponse } from "model/core/supplier.model";
import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { generateQuery } from "utils/AppUtils";
import { getQueryParams, useQuery } from "utils/useQuery";

const PurchaseOrderListScreen: React.FC = () => {
  const query = useQuery();
  const history = useHistory();
  const dispatch = useDispatch();
  const [tableLoading, setTableLoading] = useState(true);
  const [listSupplier, setSupplier] = useState<Array<SupplierResponse>>();
  let initQuery: PurchaseOrderQuery = {
    info: "",
  };

  let dataQuery: PurchaseOrderQuery = {
    ...initQuery,
    ...getQueryParams(query),
  };
  let [params, setPrams] = useState<PurchaseOrderQuery>(dataQuery);
  const onMenuClick = useCallback((index: number) => {}, []);
  let actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Xóa",
    },
    {
      id: 2,
      name: "Export",
    },
  ];
  const onFilter = useCallback(
    (values) => {
      let newPrams = { ...params, ...values, page: 1 };
      setPrams(newPrams);
      let queryParam = generateQuery(newPrams);
      history.push(`${UrlConfig.PURCHASE_ORDER}?${queryParam}`);
    },
    [history, params]
  );

  useEffect(() => {
    dispatch(SupplierGetAllAction(setSupplier));
  }, [dispatch]);
  return (
    <ContentContainer
      title="Quản lý đơn đặt hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDER}`,
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.PURCHASE_ORDER}/create`} />}
    >
      <Card>
        <PurchaseOrderFilter
          onMenuClick={onMenuClick}
          actions={actions}
          onFilter={onFilter}
          listSupplier={listSupplier}
        />
        {/* <CustomTable
          isLoading={tableLoading}
          showColumnSetting={true}
          scroll={{ x: 1080 }}
          pagination={{
            pageSize: data.metadata.limit,
            total: data.metadata.total,
            current: data.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          onShowColumnSetting={() => setShowSettingColumn(true)}
          dataSource={data.items}
          columns={columnFinal}
          rowKey={(item: VariantResponse) => item.id}
        /> */}
      </Card>
    </ContentContainer>
  );
};
export default PurchaseOrderListScreen;
