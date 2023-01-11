import { Alert, Card, Table } from "antd";
import ContentContainer from "component/container/content.container";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import InventoryBalanceFilter from "../common/component/inventory-balance-filter";
import { inventoryBalanceColumns } from "../common/constant/inventory-balance/inventory-balance-columns";
import { fetchInventoryBalanceList } from "../common/services/fetch-inventory-balance-list";
import { InventoryBalanceStyle } from "../common/styles/inventory-balance.style";

function InventoryBalance() {
  const dispatch = useDispatch();
  const [conditionFilter, setConditionFilter] = useState<any>();
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [emptyMessage, setEmptyMessage] = useState<string>(
    "Vui lòng chọn điều kiện lọc để xem dữ liệu báo cáo",
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

  return (
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
  );
}

export default InventoryBalance;
