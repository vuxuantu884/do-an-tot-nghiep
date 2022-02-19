import { Card, Table } from "antd";
import { ICustomTableColumType } from "component/table/CustomTable";
import emptyProduct from "assets/icon/empty_products.svg";
//import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";

function PackList(props: any) {
  const { data } = props;

  const columnsOrderPack: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: "10%",
      render: (value: any, row: any, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Đơn hàng",
      dataIndex: "code",
      visible: true,
      render: (value: any, row: any, index: any) => {
        return (
          <Link
            target="_blank"
            to={`${UrlConfig.ORDER}/${row.order_id}`}
          >
            {row.code}
          </Link>
        );
      },
    },
    {
      title: "Hãng vận chuyển",
      visible: true,
      render: (value, row, index) => {
        return <div>{row.shipment}</div>;
      },
    },
    {
      title: "Khách hàng",
      visible: true,
      render: (value, row, index) => {
        return <div>{row.customer}</div>;
      },
    },
    {
      title: "Sản phẩm",
      visible: true,
      render: (value, row, index) => {
        return <div>{row.items?.length}</div>;
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  return (
    <Card
      title="Đơn đã đóng gói "
      bordered={false}
      className="pack-success-card"
    >
      <div>
      <Table 
        columns={columnsOrderPack}
        dataSource={data.items} 
        locale={{
          emptyText: (
            <div className="sale_order_empty_product">
              <img src={emptyProduct} alt="empty product"></img>
              <p>Không có dữ liệu!</p>
            </div>
          ),
        }}
        className="ecommerce-order-list"
        //rowKey={(item: any) => item.code}
        key={Math.random()}
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
        }}
      />
      </div>
    </Card>
  );
}

export default PackList;
