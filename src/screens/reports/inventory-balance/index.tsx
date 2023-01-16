import { Alert, Card, Table } from "antd";
import ContentContainer from "component/container/content.container";
import { ReportPermissions } from "config/permissions/report.permisstion";
import { RootReducerType } from "model/reducers/RootReducerType";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NoPermission from "screens/no-permission.screen";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import InventoryBalanceFilter from "../common/component/inventory-balance-filter";
import { inventoryBalanceColumns } from "../common/constant/inventory-balance/inventory-balance-columns";
import { usersViewInventoryBalance } from "../common/constant/inventory-balance/users-view-inventory-balance";
import { fetchInventoryBalanceList } from "../common/services/fetch-inventory-balance-list";
import { InventoryBalanceStyle } from "../common/styles/inventory-balance.style";

function InventoryBalance() {
  const dispatch = useDispatch();
  const [conditionFilter, setConditionFilter] = useState<any>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>(
    "Vui lòng chọn điều kiện lọc để xem dữ liệu báo cáo",
  );

  const currentUsername = useSelector(
    (state: RootReducerType) => state.userReducer.account?.user_name,
  );
  const allPermissions = useSelector(
    (state: RootReducerType) => state.permissionReducer?.permissions,
  );

  const initTable = useCallback(async () => {
    if (!conditionFilter) {
      return;
    }
    const response = await fetchInventoryBalanceList({ ...conditionFilter }, dispatch);
    if (!response.data.length) {
      setEmptyMessage("Không có kết quả phù hợp với điều kiện lọc");
    }
    response.data.forEach((item: any, index: number) => {
      item.no = index + 1;
    });
    const { data, summary } = response;
    response.data = [
      { ...summary, no: "TỔNG", colSpan: 12, className: "font-weight-bold" },
      ...data,
    ];
    setDataSource(response.data);
  }, [conditionFilter, dispatch]);

  useEffect(() => {
    initTable();
  }, [initTable]);

  return allPermissions.includes(ReportPermissions.reports_view_report_xnt) ||
    usersViewInventoryBalance.includes(currentUsername?.toUpperCase() as string) ? (
    <ContentContainer
      title={`Báo cáo xuất - nhập - tồn (Kế toán)`}
      breadcrumb={[
        { name: "Danh sách báo cáo tài chính", path: "/analytics/finance" },
        { name: "Báo cáo xuất - nhập - tồn (Kế toán)" },
      ]}
    >
      <InventoryBalanceFilter applyFilter={setConditionFilter}></InventoryBalanceFilter>
      <InventoryBalanceStyle>
        <Card>
          <Alert
            message="Dữ liệu được cập nhật hàng ngày lúc 7:00"
            type="warning"
            showIcon
            className="mb-2"
          />
          <Table
            locale={{ emptyText: emptyMessage }}
            dataSource={dataSource}
            columns={inventoryBalanceColumns}
            bordered
            scroll={{ x: "max-content" }}
            sticky={{
              offsetScroll: 55,
              offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
            }}
            pagination={{
              defaultPageSize: 50,
              pageSizeOptions: ["10", "20", "30", "50"],
            }}
          />
        </Card>
      </InventoryBalanceStyle>
    </ContentContainer>
  ) : (
    <NoPermission></NoPermission>
  );
}

export default InventoryBalance;
