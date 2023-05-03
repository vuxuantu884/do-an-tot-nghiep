import { Button, Space, Table, Tag } from "antd";
import { ColumnsType } from "antd/lib/table";
import React from "react";
import { StyledComponent } from "./styled";
import ButtonTransfer from "../ButtonTransfer";
import ButtonPause from "../ButtonPause";

type Props = {};
const StaffListTable: React.FC<Props> = (props: Props) => {
  interface DataType {
    key: string;
    ten_nhan_vien: string;
    chuc_vu: number;
  }

  const columns: ColumnsType<DataType> = [
    {
      title: "Tên nhân viên",
      dataIndex: "ten_nhan_vien",
      key: "ten_nhan_vien",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Chức vụ",
      dataIndex: "chuc_vu",
      key: "chuc_vu",
    },
    {
      title: "Thao tác",
      key: "action",
      width: "200px",
      className: "action",
      render: (_, record) => (
        <Space size="middle">
          <ButtonTransfer className="transfer dark-blue">Điều chuyển</ButtonTransfer>
          <ButtonPause className="pause orange-red">Tạm ngưng</ButtonPause>
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
