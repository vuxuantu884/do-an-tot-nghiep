import { Card, Table } from "antd";
import { ICustomTableColumType } from "component/table/CustomTable";
import emptyProduct from "assets/icon/empty_products.svg";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { useContext, useMemo } from "react";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { OrderResponse } from "model/response/order/order.response";
import { useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";

interface OrderPackSuccessTable extends OrderResponse {
  key?: number;
  stt: number;
}

function PackList() {
  //const loading = useSelector((state: RootReducerType) => state.loadingReducer);
  const orderPackContextData = useContext(OrderPackContext);
  // const isFulFillmentPack = orderPackContextData?.isFulFillmentPack;
  const setIsFulFillmentPack = orderPackContextData?.setIsFulFillmentPack;
  const data: OrderPackSuccessTable[] = useMemo(() => {
    let packSuccessTable: OrderPackSuccessTable[] = [];
    orderPackContextData?.packModel?.order?.forEach((i: OrderResponse, index) => {
      packSuccessTable.push({ ...i, stt: index + 1 });
    })

    return packSuccessTable;
  }, [orderPackContextData?.packModel]);

  const columnsOrderPack: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      dataIndex: "",
      align: "center",
      visible: true,
      width: window.screen.width <= 1600 ? "7%" : "5%",
      render: (value: any, row: any, index: number) => {
        return <span>{index + 1}</span>;
      },
    },
    {
      title: "Đơn hàng",
      dataIndex: "order_code",
      visible: true,
      render: (value: any, row: any, index: any) => {
        return (
          <Link
            target="_blank"
            to={`${UrlConfig.ORDER}/${row.order_id}`}
          >
            {row.order_code}
          </Link>
        );
      },
    },
    {
      title: "Hãng vận chuyển",
      visible: true,
      render: (value, row, index) => {
        return <div>{row.shipment.delivery_service_provider_name ? row.shipment.delivery_service_provider_name : "Tự giao hàng"}</div>;
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
      let code: string[] = [];
      selectedRow.forEach((p) => {
        if (p) code.push(p.order_code);
      })
      console.log("code", code);
      setIsFulFillmentPack([...code]);
    },
    onSelectAll: (selected: any, selectedRow: any[], changeRow: any[]) => {

      let code: string[] = [];
      selectedRow.forEach((p) => {
        if (p) code.push(p.order_code);
      })
      console.log("code", code);
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
          //loading={loading.isVisible}
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
          rowKey={(item: any) => item.code}
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
