import { Card, Space, Form, Input, Button } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import search from "assets/img/search.svg";
import "component/filter/order.filter.scss";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { showWarning } from "utils/ToastUtils";
import { GoodsReceiptsInfoOrderModel, VariantModel } from "model/pack/pack.model";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import { OrderConcernGoodsReceiptsResponse } from "model/response/pack/pack.response";
import { AddReportHandOverContext } from "contexts/order-pack/add-report-hand-over-context";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { formatCurrency } from "utils/AppUtils";
import { dangerColor } from "utils/global-styles/variables";
import { getFulfillmentActive } from "utils/OrderUtils";
import { PagingParam, ResultPaging } from "model/paging";
import { flatDataPaging } from "utils/Paging";
import ButtonWarningHandover from "../component/button-warning-handover";
import { StoreResponse } from "model/core/store.model";

type AddOrderInReportProps = {
  menu?: Array<MenuAction>;
  orderListResponse: Array<OrderConcernGoodsReceiptsResponse>;
  setOrderListResponse: (item: Array<OrderConcernGoodsReceiptsResponse>) => void;
  onMenuClick?: (index: number) => void;
  handleAddOrder: (code: string) => void;
  formSearchOrderRef: any;
  goodsReceiptForm: any;
  stores: StoreResponse[];
};
const { Item } = Form;

const resultPagingDefault: ResultPaging = {
  currentPage: 1,
  lastPage: 1,
  perPage: 5,
  total: 0,
  result: [],
};

const AddOrderInReport: React.FC<AddOrderInReportProps> = (props: AddOrderInReportProps) => {
  const { menu, orderListResponse, handleAddOrder, formSearchOrderRef, goodsReceiptForm, stores } =
    props;

  //const [orderResponse, setOrderResponse] = useState<OrderResponse>();
  const [packOrderProductList, setPackOrderProductList] = useState<GoodsReceiptsInfoOrderModel[]>();

  const [pagingParam, setPagingParam] = useState<PagingParam>({
    currentPage: resultPagingDefault.currentPage,
    perPage: resultPagingDefault.perPage,
  });
  const [resultPaging, setResultPaging] = useState<ResultPaging>(resultPagingDefault);

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const addReportHandOverContextData = useContext(AddReportHandOverContext);
  const setOrderListResponse = addReportHandOverContextData?.setOrderListResponse;

  const handSubmit = useCallback(
    (value: any) => {
      if (value.search_term && value.search_term.length > 0) {
        handleAddOrder(value.search_term?.toUpperCase());
      } else {
        showWarning("Vui lòng nhập mã đơn hàng");
      }
    },
    [handleAddOrder],
  );

  const onMenuClickExt = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          if (selectedRowKeys && selectedRowKeys.length <= 0) {
            showWarning("Vui lòng chọn đơn hàng cần xóa");
            break;
          }
          let orderListResponseCopy = [...orderListResponse];
          selectedRowKeys.forEach((value) => {
            let indexOrder = orderListResponseCopy.findIndex((p) => p.code === value);
            if (indexOrder !== -1) {
              orderListResponseCopy.splice(indexOrder, 1);
            }
          });
          setOrderListResponse([...orderListResponseCopy]);
          setSelectedRowKeys([]);
          break;
        default:
          break;
      }
    },
    [selectedRowKeys, orderListResponse, setOrderListResponse],
  );

  useEffect(() => {
    if (orderListResponse.length > 0) {
      let result: Array<GoodsReceiptsInfoOrderModel> = [];
      //let receiptTypeId = goodsReceiptForm.getFieldValue('receipt_type_id');
      orderListResponse.forEach((order, index) => {
        // let fulfillments = order.fulfillments?.filter(ffm => {
        //   if (receiptTypeId === 1) {
        //     return ffm.status === FulFillmentStatus.PACKED
        //   }
        //   return ffm.status === FulFillmentStatus.SHIPPING && ffm.return_status === FulFillmentStatus.RETURNING
        // });

        let fulfillment = getFulfillmentActive(order.fulfillments);
        if (fulfillment) {
          let product: VariantModel[] = [];
          let ship_price = fulfillment?.shipment?.shipping_fee_informed_to_customer || 0;
          let total_price = fulfillment.total || 0;

          fulfillment.items.forEach(function (itemProduct) {
            product.push({
              sku: itemProduct.sku,
              product_id: itemProduct.product_id,
              product: itemProduct.product,
              variant_id: itemProduct.variant_id,
              variant: itemProduct.variant,
              variant_barcode: itemProduct.variant_barcode,
              quantity: itemProduct.quantity,
              price: itemProduct.price,
            });
          });

          let resultItem: GoodsReceiptsInfoOrderModel = {
            key: index,
            order_id: order.id ? order.id : 0,
            order_code: order.code ? order.code : "",
            customer_id: 1,
            customer_name: order.customer ? order.customer : "",
            customer_phone: "",
            customer_address: "api chua tra ra du lieu",
            product: product,
            ship_price: ship_price,
            total_price: total_price,
          };

          result.push(resultItem);
        }
      });
      setPackOrderProductList(result);
      formSearchOrderRef.current?.resetFields();
    }
  }, [formSearchOrderRef, goodsReceiptForm, orderListResponse]);

  const columns: Array<ICustomTableColumType<GoodsReceiptsInfoOrderModel>> = [
    {
      title: "STT",
      width: "60px",
      align: "center",
      render: (l: GoodsReceiptsInfoOrderModel, item: any, index: number) => {
        return <>{l.key + 1}</>;
      },
    },
    {
      title: "ID",
      align: "center",
      render: (l: GoodsReceiptsInfoOrderModel, item: any, index: number) => {
        return (
          <Link
            target="_blank"
            to={`${UrlConfig.ORDER}/${l.order_id}`}
            style={{ whiteSpace: "nowrap" }}
          >
            {l.order_code}
          </Link>
        );
      },
    },
    {
      title: "Người nhận",
      dataIndex: "customer_name",
      key: "customer_name",
      align: "center",
    },

    {
      title: (
        <div className="productNameQuantityHeader">
          <span className="productNameWidth">Sản phẩm</span>
          <span className="quantity quantityWidth">
            <span>SL</span>
          </span>
          <span className="price priceWidth">
            <span>Giá</span>
          </span>
        </div>
      ),
      dataIndex: "product",
      key: "product",
      className: "productNameQuantity",
      render: (items: Array<VariantModel>) => {
        return (
          <div className="items">
            {items.map((item, i) => {
              return (
                <div key={i.toString()} className="item custom-td">
                  <div className="product productNameWidth">
                    <Link
                      target="_blank"
                      to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                    >
                      {item.variant}
                    </Link>
                  </div>
                  <div className="quantity quantityWidth">
                    <span>{item.quantity}</span>
                  </div>
                  <div className="price priceWidth">
                    <span>{formatCurrency(item.price ? item.price : 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        );
      },
      visible: true,
      align: "left",
      width: "25%",
    },
    {
      title: "Cước phí",
      dataIndex: "ship_price",
      key: "ship_price",
      align: "center",
      render: (value) => formatCurrency(value),
    },
    {
      title: "Tổng thu",
      dataIndex: "total_price",
      key: "total_price",
      align: "center",
      render: (value) => formatCurrency(value),
    },
  ];

  const onSelectedChange = (
    selectedRow: GoodsReceiptsInfoOrderModel[],
    selected?: boolean,
    changeRow?: any[],
  ) => {
    let selectedRowKeysCopy: string[] = [...selectedRowKeys];

    if (selected === true) {
      changeRow?.forEach((data, index) => {
        let indexItem = selectedRowKeys.findIndex((p) => p === data.order_code);
        if (indexItem === -1) {
          selectedRowKeysCopy.push(data.order_code);
        }
      });
    } else {
      selectedRowKeys.forEach((data, index) => {
        let indexItem = changeRow?.findIndex((p) => p.order_code === data);

        if (indexItem !== -1) {
          let i = selectedRowKeysCopy.findIndex((p) => p === data);
          selectedRowKeysCopy.splice(i, 1);
        }
      });
    }

    // console.log("selectedRowKeysCopy",selectedRowKeysCopy)
    setSelectedRowKeys([...selectedRowKeysCopy]);
  };

  useEffect(() => {
    if (!packOrderProductList || (packOrderProductList && packOrderProductList.length <= 0)) {
      setResultPaging(resultPagingDefault);
    } else {
      let result = flatDataPaging(packOrderProductList, pagingParam);
      setResultPaging(result);
    }
  }, [packOrderProductList, pagingParam]);

  return (
    <Card
      title={
        <React.Fragment>
          <div style={{ display: "flex" }}>
            Danh sách đơn hàng trong biên bản
            <div style={{ color: dangerColor, paddingLeft: 7 }}>
              ({packOrderProductList ? packOrderProductList.length : 0})
            </div>
          </div>
        </React.Fragment>
      }
      className="pack-card"
      extra={<ButtonWarningHandover stores={stores} isHiddenCreate={true} />}
    >
      <div className="order-filter yody-pack-row">
        <div className="page-filter">
          <div className="page-filter-heading">
            <div className="page-filter-left">
              <ActionButton menu={menu} onMenuClick={onMenuClickExt} />
            </div>
            <div className="page-filter-right" style={{ width: "60%" }}>
              <Space size={4}>
                <Form layout="inline" ref={formSearchOrderRef} onFinish={handSubmit}>
                  <Item name="search_term" style={{ width: "calc(95% - 142px)" }}>
                    <Input
                      style={{ width: "100%" }}
                      prefix={<img src={search} alt="" />}
                      placeholder="ID đơn hàng/Mã vận đơn"
                    />
                  </Item>

                  <Item style={{ width: "142px", marginLeft: 10, marginRight: 0 }}>
                    <Button type="primary" htmlType="submit">
                      Thêm đơn hàng
                    </Button>
                  </Item>
                </Form>
              </Space>
            </div>
          </div>
        </div>
      </div>
      {orderListResponse && orderListResponse.length > 0 && (
        <div className="yody-pack-row">
          <CustomTable
            bordered
            isRowSelection
            pagination={{
              pageSize: resultPaging.perPage,
              total: resultPaging.total,
              current: resultPaging.currentPage,
              showSizeChanger: true,
              onChange: (page, size) => {
                // console.log("size", size)
                setPagingParam({ perPage: size || 10, currentPage: page });
              },
              onShowSizeChange: (page, size) => {
                setPagingParam({ perPage: size || 10, currentPage: page });
              },
            }}
            onSelectedChange={(selectedRows, selected, changeRow) =>
              onSelectedChange(selectedRows, selected, changeRow)
            }
            selectedRowKey={selectedRowKeys}
            dataSource={resultPaging.result}
            columns={columns}
            rowKey={(item: any) => item.order_code}
          />
          {/* <Table
            columns={columns}
            dataSource={packOrderProductList}
            key={Math.random()}
            locale={{
              emptyText: (
                <div className="sale_order_empty_product">
                  <img src={emptyProduct} alt="empty product"></img>
                  <p>Không có dữ liệu!</p>
                </div>
              ),
            }}
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            rowKey={(item) => item.order_code}
          /> */}
        </div>
      )}
    </Card>
  );
};
export default AddOrderInReport;
