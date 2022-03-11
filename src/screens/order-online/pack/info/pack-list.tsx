import { Card } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { useContext, useEffect, useMemo, useState } from "react";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { OrderResponse } from "model/response/order/order.response";
import { useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";

interface PagingParam {
  currentPage: number;
  perPage: number;
}
interface ResultPaging {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  result: any;
}

function PackList() {

  const loading = useSelector((state: RootReducerType) => state.loadingReducer);

  const orderPackContextData = useContext(OrderPackContext);
  const setIsFulFillmentPack = orderPackContextData?.setIsFulFillmentPack;

  const orderData: OrderResponse[] | undefined = useMemo(() =>
    orderPackContextData?.packModel?.order?.reverse(), [orderPackContextData?.packModel]);

  const [pagingParam, setPagingParam] = useState<PagingParam>({
    currentPage: 1,
    perPage: 10
  });
  const [resultPaging, setResultPaging] = useState<ResultPaging>({
    currentPage: pagingParam.currentPage,
    lastPage: 1,
    perPage: pagingParam.perPage,
    total: 0,
    result: []
  });

  useEffect(() => {
    if (!orderData) return;
    let total: number = orderData.length;
    let totalPage: number = Math.ceil(total / pagingParam.perPage);

    if (pagingParam.currentPage > total)
      pagingParam.currentPage = totalPage;

    let start: number = (pagingParam.currentPage - 1) * pagingParam.perPage;
    let end: number = start + pagingParam.perPage;
    let orderDataReverse = orderData.reverse();
    let orderDataCopy = orderDataReverse.slice(start, end);

    let result: ResultPaging = {
      currentPage: pagingParam.currentPage,
      lastPage: totalPage,
      perPage: pagingParam.perPage,
      total: total,
      result: orderDataCopy
    }
    // console.log("pagingParam", pagingParam)
    // console.log("resultPaging", result)

    setResultPaging(result);
  }, [orderData, pagingParam])


  const columnsOrderPack: Array<ICustomTableColumType<any>> = [
    // {
    //   title: "STT",
    //   dataIndex: "",
    //   align: "center",
    //   visible: true,
    //   width: window.screen.width <= 1600 ? "7%" : "5%",
    //   render: (value: any, row: any, index: number) => {
    //     return <span>{index + 1}</span>;
    //   },
    // },
    {
      title: "Đơn hàng",
      dataIndex: "order_code",
      visible: true,
      align: "center",
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
      align: "center",
      render: (value, row, index) => {
        return <div>{row.shipment.delivery_service_provider_name ? row.shipment.delivery_service_provider_name : "Tự giao hàng"}</div>;
      },
    },
    {
      title: "Khách hàng",
      visible: true,
      align: "center",
      render: (value, row, index) => {
        return <div>{row.customer}</div>;
      },
    },
    {
      title: "Sản phẩm",
      visible: true,
      align: "center",
      render: (value, row, index) => {
        return <div>{row.items?.length}</div>;
      },
    },
  ];

  const onSelectedChange = (selectedRow: OrderResponse[]) => {
    let code: string[] = [];

    selectedRow.forEach((row: any) => {
      if (row) code.push(row.code);
    });

    setIsFulFillmentPack([...code]);
    console.log("code", code);
  };

  // console.log("pagingParam", pagingParam)
  // // console.log("resultPaging",resultPaging)
  // console.log("orderData", orderData)
  return (
    <Card
      title="Đơn đã đóng gói "
      bordered={false}
      className="pack-success-card"
    >
      <div className="yody-pack-row">

        <CustomTable
          isRowSelection
          isLoading={loading.isVisible}
          showColumnSetting={true}
          pagination={{
            pageSize: resultPaging.perPage,
            total: resultPaging.total,
            current: resultPaging.currentPage,
            showSizeChanger: true,
            onChange: (page, size) => {
              console.log("page", page, size);
              setPagingParam({ perPage: size || 10, currentPage: page })
            },
            onShowSizeChange: (page, size) => {
              console.log("page", page, size);
              setPagingParam({ perPage: size || 10, currentPage: page })
            },
          }}
          onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
          dataSource={resultPaging.result}
          columns={columnsOrderPack}
          rowKey={(item: any) => item.code}
          className="ecommerce-order-list"
        />
      </div>
    </Card>
  );
}

export default PackList;
