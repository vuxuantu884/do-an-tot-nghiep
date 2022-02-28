import { Card, Table } from "antd";
import { ICustomTableColumType } from "component/table/CustomTable";
import emptyProduct from "assets/icon/empty_products.svg";
//import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { useContext, useMemo, useState } from "react";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { OrderResponse } from "model/response/order/order.response";

interface OrderPackSuccessTable extends OrderResponse {
  key: number;
  stt: number;
}

function PackList() {

  const orderPackContextData = useContext(OrderPackContext);
  // const isFulFillmentPack = orderPackContextData?.isFulFillmentPack;
  const setIsFulFillmentPack = orderPackContextData?.setIsFulFillmentPack;
  const data: OrderPackSuccessTable[] = useMemo(() => {
    let packSuccessTable: OrderPackSuccessTable[] = [];
    orderPackContextData?.data?.forEach((i: OrderResponse, index) => {
      packSuccessTable.push({ ...i, key: index, stt: index + 1 });
    })
    console.log("packSuccessTable", packSuccessTable);

    return packSuccessTable;
  }, [orderPackContextData?.data]);

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
        return <div>{row.shipment.delivery_service_provider_name}</div>;
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
    onSelect: (item: any, selected: boolean, selectedRow: any[]) => {
      let code = selectedRow.map((p: any) => p.code);
      setIsFulFillmentPack([...code]);
    },
    onSelectAll: (selected: any, selectedRow: any[], changeRow: any[]) => {
      let code = selectedRow.map((p: any) => p.code);
      setIsFulFillmentPack([...code]);
    }
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
          dataSource={data}
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
          //key={Math.random()}
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
