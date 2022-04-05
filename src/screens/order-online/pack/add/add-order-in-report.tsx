import { Card, Space, Table, Form, Input, Button } from "antd";
import ActionButton, { MenuAction } from "component/table/ActionButton";
import search from "assets/img/search.svg";
import "component/filter/order.filter.scss";
import { useCallback, useContext, useEffect, useState } from "react";
import { showWarning } from "utils/ToastUtils";
import { GoodsReceiptsInfoOrderModel, VariantModel } from "model/pack/pack.model";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import emptyProduct from "assets/icon/empty_products.svg";
import { OrderConcernGoodsReceiptsResponse } from "model/response/pack/pack.response";
import { AddReportHandOverContext } from "contexts/order-pack/add-report-hand-over-context";
import { ICustomTableColumType } from "component/table/CustomTable";

type AddOrderInReportProps = {
  menu?: Array<MenuAction>;
  orderListResponse: Array<OrderConcernGoodsReceiptsResponse>;
  setOrderListResponse: (item: Array<OrderConcernGoodsReceiptsResponse>) => void;
  onMenuClick?: (index: number) => void;
  handleAddOrder: (code: string) => void;
  formSearchOrderRef: any;
};
const { Item } = Form;

const AddOrderInReport: React.FC<AddOrderInReportProps> = (
  props: AddOrderInReportProps
) => {
  const { menu, orderListResponse, handleAddOrder, formSearchOrderRef } = props;

  //const [orderResponse, setOrderResponse] = useState<OrderResponse>();
  const [packOrderProductList, setPackOrderProductList] =
    useState<GoodsReceiptsInfoOrderModel[]>();

  const [isOrderPack, setIsOrderPack] = useState<string[]>([]);

  const addReportHandOverContextData = useContext(AddReportHandOverContext);
  // const orderListResponse= addReportHandOverContextData?.orderListResponse;
  const setOrderListResponse = addReportHandOverContextData?.setOrderListResponse;
  //
  // const handleSearchOrder = useCallback(() => {
  //   formSearchOrderRef.current?.validateFields(["search_term"]);
  //   let search_term: any = formSearchOrderRef.current?.getFieldValue(["search_term"]);
  //   if (search_term) {
  //     formSearchOrderRef.current?.resetFields();
  //     handleAddOrder(search_term);
  //   }
  //   else {
  //     showWarning("Vui lòng nhập mã đơn hàng");
  //   }
  // }, [formSearchOrderRef, handleAddOrder]);

  const handSubmit = useCallback((value: any) => {
    console.log(value)
    if (value.search_term && value.search_term.length > 0) {
      //formSearchOrderRef.current?.resetFields();
      handleAddOrder(value.search_term?.toUpperCase());
    }
    else {
      showWarning("Vui lòng nhập mã đơn hàng");
    }
  }, [handleAddOrder])

  const onMenuClickExt = useCallback(
    (index: number) => {
      switch (index) {
        case 1:
          if (isOrderPack && isOrderPack.length <= 0) {
            showWarning("Vui lòng chọn đơn hàng cần xóa");
            break;
          }
          let orderListResponseCopy = [...orderListResponse];
          console.log("orderListResponseCopy1", orderListResponseCopy)
          isOrderPack.forEach((value) => {
            console.log(value);
            let indexOrder = orderListResponseCopy.findIndex((p) => p.code === value);
            if (indexOrder !== -1) orderListResponseCopy.splice(indexOrder, 1);
          })
          console.log("orderListResponseCopy2", orderListResponseCopy)
          setOrderListResponse([...orderListResponseCopy]);
          setIsOrderPack([]);
          break;
        default:
          break;
      }
    },
    [setOrderListResponse, setIsOrderPack, isOrderPack, orderListResponse]
  );

  console.log("isOrderPack", isOrderPack)

  useEffect(() => {
    if (orderListResponse.length > 0) {
      let result: Array<GoodsReceiptsInfoOrderModel> = [];
      orderListResponse.forEach(function (order, index) {
        let fulfillmentPacked = order.fulfillments.filter((ffm) =>
          ffm.status !== 'returned' && ffm.status !== 'returning'
          && ffm.status !== 'cancelled' && ffm.status !== 'splitted');
        // console.log('fulfillmentPacked', fulfillmentPacked)
        if (fulfillmentPacked.length > 0) {
          let product: VariantModel[] = [];
          let ship_price = 0;
          let total_price = 0;
          fulfillmentPacked.forEach(function (fulfillment) {
            //if (fulfillment.status === 'packed') {
              ship_price =
                ship_price +
                (fulfillment?.shipment?.shipping_fee_informed_to_customer
                  ? fulfillment.shipment.shipping_fee_informed_to_customer
                  : 0);
              total_price = total_price + (fulfillment.total ? fulfillment.total : 0);

              fulfillment.items.forEach(function (itemProduct) {
                product.push({
                  sku: itemProduct.sku,
                  product_id: itemProduct.product_id,
                  product: itemProduct.product,
                  variant_id: itemProduct.variant_id,
                  variant: itemProduct.variant,
                  variant_barcode: itemProduct.variant_barcode,
                  quantity: itemProduct.quantity,
                  price: itemProduct.price
                });
              });
            //}

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
    }
  }, [orderListResponse]);

  const columns: Array<ICustomTableColumType<GoodsReceiptsInfoOrderModel>> = [
    {
      title: "ID",
      align: "center",
      render: (l: GoodsReceiptsInfoOrderModel, item: any, index: number) => {
        return (
          <Link target="_blank" to={`${UrlConfig.ORDER}/${l.order_id}`} style={{whiteSpace:"nowrap"}}>
            {l.order_code}
          </Link>
        );
      },
    },
    {
      title: "Người nhận",
      dataIndex: "customer_name",
      key: "customer_name",
      align: "center"
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
                <div className="item custom-td">
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
                    <span>{item.price}</span>
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
    // {
    //   title: "Sản phẩm",
    //   render: (l: GoodsReceiptsInfoOrderModel, item: any, index: number) => {
    //     return (
    //       <div
    //         className="w-100"
    //         style={{
    //           overflow: "hidden",
    //           display: "flex",
    //           flexDirection: "column",
    //         }}
    //       >
    //         <div className="d-flex align-items-center">
    //           <div
    //             style={{
    //               width: "calc(100% - 32px)",
    //               float: "left",
    //             }}
    //           >
    //             <div className="yody-pos-sku">
    //               <Link
    //                 target="_blank"
    //                 to={`${UrlConfig.PRODUCT}/${l.product}/variants/${l.variant_id}`}
    //               >
    //                 {l.sku}
    //               </Link>
    //             </div>
    //             <div className="yody-pos-varian">
    //               <Tooltip title={l.product} className="yody-pos-varian-name">
    //                 <span>{l.product}</span>
    //               </Tooltip>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     );
    //   },
    // },
    // {
    //   title: "Giá",
    //   key: "price",
    //   dataIndex: "price",
    // },
    // {
    //   title: "Số lượng",
    //   dataIndex: "quantity",
    //   key: "quantity",
    // },
    {
      title: "Cước phí",
      dataIndex: "ship_price",
      key: "ship_price",
      align: "center"
    },
    {
      title: "Tổng thu",
      dataIndex: "total_price",
      key: "total_price",
      align: "center"
    },
  ];

  const rowSelection = {
    selectedRowKeys: isOrderPack,
    onChange: (selectedRowKeys: React.Key[], selectedRows: GoodsReceiptsInfoOrderModel[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      let order_code: string[] = selectedRows.map((p) => p.order_code);
      setIsOrderPack(order_code);
    }
  };

  return (
    <Card title="Danh sách đơn hàng trong biên bản" className="pack-card">
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
          <Table
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
            rowKey={(item: any) => item.order_code}
          />
        </div>

      )}
    </Card>
  );
};
export default AddOrderInReport;
