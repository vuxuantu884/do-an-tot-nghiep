import { Table } from "antd";
import { TOP_CHARTS_KEY } from "config/dashboard";
import React, { useContext } from "react";
import { formatCurrency } from "utils/AppUtils";
import useFetchTotalSaleByStore from "../hooks/useFetchTotalSaleByStore";
import { DashboardContext } from "../provider/dashboard-provider";

function TotalSalesByStoreTable() {
  const { topSale } = useContext(DashboardContext);
  const { isFetching } = useFetchTotalSaleByStore();
  return (
    <Table
      loading={isFetching}
      pagination={{defaultPageSize: 10, showSizeChanger: false }}
      columns={[
        {
          title: "Cửa hàng",
          dataIndex: "label",
          render: (text: string) => {
            return (
              <div className="name-row">
                <span>{text}</span>
              </div>
            );
          },
        },
        {
          title: "Doanh thu",
          dataIndex: "totalSales",
          align: "center",
          render: (value: number) => {
            return (
              <div className="value-row">
                <div>{formatCurrency(value, ".") + "đ"}</div>
              </div>
            );
          },
        },
      ]}
      dataSource={topSale.get(TOP_CHARTS_KEY.STORE_SALES) || []}
      rowClassName={"income-row"}
    />
  );
}

export default TotalSalesByStoreTable;
