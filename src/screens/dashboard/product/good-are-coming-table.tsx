import CustomTable from "component/table/CustomTable";
import { GoodsAreComing, GoodsAreComingItem } from "model/dashboard/dashboard.model";
import React from "react";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";

function GoodAreComingTable({ data, total }: GoodsAreComing) {
  return (
    <CustomTable
      style={{ marginTop: "50px" }}
      pagination={false}
      dataSource={data}
      columns={[
        {
          title: (
            <div>
              Hàng sắp chuyển về{" "}
              <a href="/" target="_blank" rel="noopener noreferrer">
                ({total})
              </a>
            </div>
          ),
          dataIndex: "to",
          render: (text, record: GoodsAreComingItem) => {
            return (
              <div>
                <Link to={"/"}>{record.from.name}</Link> <FiArrowRight /> <Link to={"/"}>{record.to.name}</Link>
              </div>
            );
          },
        },
        { title: "Thời gian", dataIndex: "time" },
        { title: "SL", dataIndex: "quantity" },
        {
          title: "Giá trị",
          dataIndex: "price",
          render: (text) => {
            return formatCurrency(text) + "đ";
          },
        },
      ]}
    />
  );
}

export default GoodAreComingTable;
