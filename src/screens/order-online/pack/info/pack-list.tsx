import { Button, Card, Popconfirm } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { OrderPackContext } from "contexts/order-pack/order-pack-context";
import { OrderResponse, PackFulFillmentResponse } from "model/response/order/order.response";
import { useSelector } from "react-redux";
import { RootReducerType } from "model/reducers/RootReducerType";
import { DeleteOutlined } from "@ant-design/icons";
import { PackModel, PackModelDefaultValue } from "model/pack/pack.model";
import { setPackInfo } from "utils/LocalStorageUtils";

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

const resultPagingDefault: ResultPaging={
  currentPage: 1,
  lastPage: 1,
  perPage: 5,
  total: 0,
  result: []
}

interface OrderResponseTable extends PackFulFillmentResponse {
  key: number;
}

function PackList() {

  const loading = useSelector((state: RootReducerType) => state.loadingReducer);

  const orderPackContextData = useContext(OrderPackContext);
  const setIsFulFillmentPack = orderPackContextData?.setIsFulFillmentPack;
  const isFulFillmentPack = orderPackContextData?.isFulFillmentPack;
  const packModel = orderPackContextData?.packModel;
  const setPackModel = orderPackContextData?.setPackModel;
  const orderData: OrderResponseTable[] | undefined = useMemo(() => {
    let order = orderPackContextData?.packModel?.order;
    let result = order?.map((p, index) => ({ ...p, key: index }));

    return result
  }, [orderPackContextData]);

  const [pagingParam, setPagingParam] = useState<PagingParam>({
    currentPage: resultPagingDefault.currentPage,
    perPage: resultPagingDefault.perPage
  });
  const [resultPaging, setResultPaging] = useState<ResultPaging>(resultPagingDefault);

  const removeOrderPacked = useCallback((code: string) => {
    if (packModel && packModel.order) {
      let order = [...packModel.order];
      const index = order.findIndex(p => p.code === code)
      console.log("order", order)
      order.splice(index, 1)
      let packData: PackModel = {
        ...new PackModelDefaultValue(),
        ...packModel,
        order: [...order]
      }

      setPackModel(packData);
      setPackInfo(packData);
    }

  }, [packModel, setPackModel])

  useEffect(() => {
    if (!orderData || (orderData && orderData.length <= 0)) {
      setResultPaging(resultPagingDefault)
    }
    else {
      let total: number = orderData.length;
      let totalPage: number = Math.ceil(total / pagingParam.perPage);

      if (pagingParam.currentPage > total)
        pagingParam.currentPage = totalPage;

      let start: number = (pagingParam.currentPage - 1) * pagingParam.perPage;
      let end: number = start + pagingParam.perPage;
      let orderDataCopy = orderData.slice(start, end);

      let result: ResultPaging = {
        currentPage: pagingParam.currentPage,
        lastPage: totalPage,
        perPage: pagingParam.perPage,
        total: total,
        result: orderDataCopy
      }

      setResultPaging(result);
    }

  }, [orderData, pagingParam])


  const columnsOrderPack: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      dataIndex: "key",
      visible: true,
      align: "center",
      width:"70px",
      render: (value: any, record: any, index: number) => <div>{value + 1}</div>
    },
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
      title: "Mã đơn giao",
      dataIndex: "code",
      visible: true,
      align: "center",
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
      title: "Cửa hàng",
      visible: true,
      align: "center",
      render: (value, row, index) => {
        return <div>{row.store}</div>;
      },
    },
    {
      title: "Hãng vận chuyển",
      visible: true,
      align: "center",
      render: (value, row, index) => {
        return <div>{row.shipment?.delivery_service_provider_name ? row.shipment.delivery_service_provider_name : "Tự giao hàng"}</div>;
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
    {
      visible: true,
      align: "center",
      width: "40px",
      render: (value, row: OrderResponseTable, index) => {
        return <div>
          <Popconfirm
            style={{height:"20px"}}
            //visible={visible}
            onConfirm={() => {
              row?.code && removeOrderPacked(row.code)
            }}
            title={"Bạn chắc chắn muốn xóa"}
            okText="đồng ý"
            cancelText="bỏ"
            placement="leftTop"
          >
            <Button icon={<DeleteOutlined style={{ color: "red" }} />} style={{ width: 30, height: 30, padding: 0 }}></Button>
          </Popconfirm>

        </div>;
      },
    },
  ];

  const onSelectedChange = (selectedRow: OrderResponse[], selected?: boolean, changeRow?: any[]) => {
    console.log(changeRow)
    let isFulFillmentPackCopy = [...isFulFillmentPack];

    if (selected === true) {
      changeRow?.forEach((data, index) => {
        let indexItem = isFulFillmentPack.findIndex((p) => p === data.order_code)
        if (indexItem === -1) {
          isFulFillmentPackCopy.push(data.order_code);
        }
      })
    }
    else {
      isFulFillmentPack.forEach((data, index) => {
        let indexItem = changeRow?.findIndex((p) => p.order_code === data);
        if (indexItem !== -1) {
          let i = isFulFillmentPackCopy.findIndex((p) => p === data);
          isFulFillmentPackCopy.splice(i, 1);
        }
      })
    }

    setIsFulFillmentPack([...isFulFillmentPackCopy]);
    console.log("code", isFulFillmentPackCopy);
  };

  // console.log("isFulFillmentPack",isFulFillmentPack)

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
              setPagingParam({ perPage: size || 10, currentPage: page })
            },
            onShowSizeChange: (page, size) => {
              setPagingParam({ perPage: size || 10, currentPage: page })
            },
          }}
          onSelectedChange={(selectedRows, selected, changeRow) => onSelectedChange(selectedRows, selected, changeRow)}
          selectedRowKey={isFulFillmentPack}
          dataSource={resultPaging.result}
          columns={columnsOrderPack}
          rowKey={(item: any) => item.order_code}
          className="ecommerce-order-list"
        />
      </div>
    </Card>
  );
}

export default PackList;
