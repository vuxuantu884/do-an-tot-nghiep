import CustomTable from "component/table/CustomTable";
import { OrderStatus } from "model/dashboard/dashboard.model";
import React from "react";

type Props = {
  data: OrderStatus[];
};

function OrderStatusTable({ data }: Props) {
  return (
    <CustomTable
      pagination={false}
      dataSource={data}
      columns={[
        {
          title: "Trạng thái đơn hàng",
          dataIndex: "name",
        },
        { title: "SL", dataIndex: "quantity" },
        {
          title: "Doanh thu",
          dataIndex: "income",
        },
        {
          title: "Tỉ lệ",
          dataIndex: "rate",
        },
      ]}
    />
  );
}

export default OrderStatusTable;
