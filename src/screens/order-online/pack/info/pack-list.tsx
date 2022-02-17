import { Card, Table } from "antd";
import { ICustomTableColumType } from "component/table/CustomTable";
import emptyProduct from "assets/icon/empty_products.svg";
//import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";

function PackList(props: any) {
  const { data } = props;
  // const [dataPack, setDataPack]=useState([])
  // useEffect(() => {
  //   if (data.items.length > 0) {
  //     setDataPack(data.items);
  //   }
  // }, [data])


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
      />
      </div>
    </Card>
  );
}

export default PackList;
