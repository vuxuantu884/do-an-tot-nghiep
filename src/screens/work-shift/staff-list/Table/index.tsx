import { Button, Space, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import React from "react";
import { StyledComponent } from "./styled";

type Props = {};
const StaffListTable: React.FC<Props> = (props: Props) => {
  interface DataType {
    key: string;
    ten_nhan_vien: string;
    chuc_vu: number;
  }

  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Thao tác",
      key: "action",
      width: "200px",
      className: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" className="transfer">
            Điều chuyển
          </Button>
          <Button type="text" className="pause">
            Tạm ngưng
          </Button>
        </Space>
      ),
    },
  ];

  const data: DataType[] = [
    {
      key: "1",
      ten_nhan_vien: "John Brown",
      chuc_vu: 32,
    },
    {
      key: "2",
      ten_nhan_vien: "Jim Green",
      chuc_vu: 42,
    },
    {
      key: "3",
      ten_nhan_vien: "Joe Black",
      chuc_vu: 32,
    },
  ];
  return (
    <StyledComponent>
      <Table className="staff-list-table" columns={columns} dataSource={data} />
    </StyledComponent>
  );
};

export default StaffListTable;
