import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import { Tooltip} from "antd";
import CustomTable, {ICustomTableColumType,} from "component/table/CustomTable";
import {OrderModel} from "model/order/order.model";
import NumberFormat from "react-number-format";
import {Link} from "react-router-dom";
import UrlConfig from "config/url.config";
import {ConvertUtcToLocalDate, DATE_FORMAT} from "utils/DateUtils";
import {formatCurrency} from "utils/AppUtils";
import {PageResponse} from "model/base/base-metadata.response";
import moment from "moment";
import {DeliveryServiceResponse, OrderLineItemResponse,} from "model/response/order/order.response";
import {dangerColor, primaryColor} from "utils/global-styles/variables";
import {nameQuantityWidth, StyledPurchaseHistory,} from "screens/customer/customer-detail/customerDetailStyled";
import EditNote from "screens/order-online/component/edit-note";
import {
  COD,
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  PoPaymentStatus,
  POS,
  ShipmentMethod,
} from "utils/Constants";
import {DeliveryServicesGetList, updateOrderPartial,} from "domain/actions/order/order.action";

import iconShippingFeeInformedToCustomer
  from "screens/order-online/component/OrderList/ListTable/images/iconShippingFeeInformedToCustomer.svg";
import iconShippingFeePay3PL from "screens/order-online/component/OrderList/ListTable/images/iconShippingFeePay3PL.svg";
import iconWeight from "screens/order-online/component/OrderList/ListTable/images/iconWeight.svg";
import IconPaymentBank from "screens/order-online/component/OrderList/ListTable/images/chuyen-khoan.svg";
import IconPaymentCard from "screens/order-online/component/OrderList/ListTable/images/paymentCard.svg";
import IconPaymentCod from "screens/order-online/component/OrderList/ListTable/images/cod.svg";
import IconPaymentReturn from "screens/order-online/component/OrderList/ListTable/images/tien-hoan.svg";
import IconPaymentCash from "screens/order-online/component/OrderList/ListTable/images/tien-mat.svg";
import IconPaymentPoint from "screens/order-online/component/OrderList/ListTable/images/paymentPoint.svg";
import IconStore from "screens/order-online/component/OrderList/ListTable/images/store.svg";
import {ReturnModel} from "model/order/return.model";
import {
  getCustomerOrderHistoryAction,
  getCustomerOrderReturnHistoryAction
} from "../../../domain/actions/customer/customer.action";
import iconReturn from "assets/icon/return.svg";

type PurchaseHistoryProps = {
  customer: any;
};

function PurchaseHistory(props: PurchaseHistoryProps) {
  const { customer } = props;

  // const orderPointSpend = (order: any) => {
  //   if (order) {
  //     let _pointPayment = order?.payments?.filter(
  //       (item: any) => item.payment_method_id === 1
  //     );
  //     let totalPoint = _pointPayment?.reduce(
  //       (acc: any, curr: any) => acc + curr.point,
  //       0
  //     );
  //     return totalPoint;
  //   }
  // };

  // const orderPointCollected = (order: any) => {
  //   return 0;
  // };

  const status_order = React.useMemo(
    () => [
      {
        name: "Nháp",
        value: "draft",
        color: "#FCAF17",
        background: "rgba(252, 175, 23, 0.1)",
      },
      {
        name: "Đóng gói",
        value: "packed",
        color: "#FCAF17",
        background: "rgba(252, 175, 23, 0.1)",
      },
      {
        name: "Xuất kho",
        value: "shipping",
        color: "#FCAF17",
        background: "rgba(252, 175, 23, 0.1)",
      },
      {
        name: "Đã xác nhận",
        value: "finalized",
        color: "#FCAF17",
        background: "rgba(252, 175, 23, 0.1)",
      },
      {
        name: "Hoàn thành",
        value: "completed",
        color: "#27AE60",
        background: "rgba(39, 174, 96, 0.1)",
      },
      {
        name: "Kết thúc",
        value: "finished",
        color: "#27AE60",
        background: "rgba(39, 174, 96, 0.1)",
      },
      {
        name: "Đã huỷ",
        value: "cancelled",
        color: "#ae2727",
        background: "rgba(223, 162, 162, 0.1)",
      },
      {
        name: "Đã hết hạn",
        value: "expired",
        color: "#ae2727",
        background: "rgba(230, 171, 171, 0.1)",
      },
    ],
    []
  );

  const [deliveryServices, setDeliveryServices] = useState<
    Array<DeliveryServiceResponse>
  >([]);

  const dispatch = useDispatch();

  // get order returned
  const [orderReturnedList, setOrderReturnedList] = useState<any>([]);

  const updateOrderReturnedList = useCallback(
    (data: PageResponse<ReturnModel> | false) => {
      setTableLoading(false);
      if (!!data) {
        setOrderReturnedList(data.items);
      }
    },
    []
  );

  useEffect(() => {
    if (customer?.id) {
      setTableLoading(true);
      dispatch(getCustomerOrderReturnHistoryAction(customer?.id, updateOrderReturnedList));
    }
  }, [customer?.id, dispatch, updateOrderReturnedList]);
  // end get order returned

  // handle get purchase history
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [orderHistoryQueryParams, setOrderHistoryQueryParams] = useState<any>({
    limit: 10,
    page: 1,
    customer_id: null,
  });

  const [orderHistoryData, setOrderHistoryData] = useState<
    PageResponse<OrderModel>
  >({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const onPageChange = useCallback(
    (page, limit) => {
      orderHistoryQueryParams.page = page;
      orderHistoryQueryParams.limit = limit;
      setOrderHistoryQueryParams({ ...orderHistoryQueryParams });
    },
    [orderHistoryQueryParams, setOrderHistoryQueryParams]
  );

  const updateOrderHistoryData = useCallback(
    (data: PageResponse<OrderModel> | false) => {
      setTableLoading(false);
      if (data) {
        setOrderHistoryData(data);
      }
    },
    []
  );

  useEffect(() => {
    if (customer?.id) {
      orderHistoryQueryParams.customer_id = customer?.id;
      setTableLoading(true);
      dispatch(getCustomerOrderHistoryAction(orderHistoryQueryParams, updateOrderHistoryData));
    }
  }, [customer?.id, dispatch, orderHistoryQueryParams, updateOrderHistoryData]);

  const orderHistoryList = useCallback(() => {

    const newOrderHistoryList = orderReturnedList.map((order: any) => {
      const unifiedCode = order.code ? order.code : order.code_order_return
      const unifiedTotalAmount = order.total_line_amount_after_line_discount 
      ? order.total_line_amount_after_line_discount 
      : order.total_amount

      return {
        ...order,
        code: unifiedCode,
        total_line_amount_after_line_discount: unifiedTotalAmount,
      }
    })

    const orderMapOrderHistory : Array<any> = orderHistoryData?.items.concat(newOrderHistoryList)

    orderMapOrderHistory.length && orderMapOrderHistory.sort((a, b) => {
      return (b.created_date < a.created_date) ? -1 : ((b.created_date > a.created_date) ? 1 : 0);
    });
 
    return orderMapOrderHistory;
  }, [orderHistoryData?.items, orderReturnedList]);
  // end handle get purchase history

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      })
    );
  }, [dispatch]);

  const paymentIcons = [
    {
      payment_method_code: PaymentMethodCode.BANK_TRANSFER,
      icon: IconPaymentBank,
      tooltip: "Đã chuyển khoản",
    },
    {
      payment_method_code: PaymentMethodCode.QR_CODE,
      icon: IconPaymentBank,
      tooltip: "Mã QR",
    },
    {
      payment_method_code: PaymentMethodCode.CARD,
      icon: IconPaymentCard,
      tooltip: "Đã quẹt thẻ",
    },
    {
      payment_method_code: PaymentMethodCode.CASH,
      icon: IconPaymentCash,
      tooltip: "Đã thanh toán tiền mặt",
    },
    {
      payment_method_code: COD.code,
      icon: IconPaymentCod,
      tooltip: "Thu người nhận",
    },
    {
      payment_method_code: null,
      icon: IconPaymentReturn,
      tooltip: null,
    },
    {
      payment_method_code: PaymentMethodCode.POINT,
      icon: IconPaymentPoint,
      tooltip: "Tiêu điểm",
    },
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderOrderPaymentMethods = (orderDetail: OrderModel) => {
    let html = null;
    html = orderDetail.payments.map((payment, index) => {
      if (!payment.amount) {
        return null;
      }
      let selectedPayment = paymentIcons.find(
        (single) => {
          if(single.payment_method_code === "cod") {
            return single.payment_method_code === payment.payment_method
          } else if(!single.payment_method_code ){
            return payment.payment_method=== "Hàng đổi"
          } else {
            return single.payment_method_code === payment.payment_method_code
          }
        }
      );
      return (
        <div  className={`singlePayment ${payment.payment_method_code === PaymentMethodCode.POINT ? 'ydPoint' : null}`} key={index}>
          {payment.paid_amount < 0 ? (
            <Tooltip title="Hoàn tiền">
              <img src={selectedPayment?.icon} alt="" />
              <span className="amount">
                {formatCurrency(payment.paid_amount)}
              </span>
            </Tooltip>
          ) : (
            <Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
              <img src={selectedPayment?.icon} alt="" />
              <span className="amount">
                {formatCurrency(payment.paid_amount)}
              </span>
            </Tooltip>
          )}
        </div>
      );
    });
    return html;
  };

  const renderOrderPayments = useCallback(
    (orderDetail: OrderModel) => {
      return (
        <React.Fragment>
          {renderOrderPaymentMethods(orderDetail)}
          {/* {orderDetail.total_discount ? (
						<Tooltip title="Chiết khấu đơn hàng">
							<div className="totalDiscount" style={{ color: dangerColor }}>
								<span>
									{" "}
									-
									<NumberFormat
										value={orderDetail.total_discount}
										className="foo"
										displayType={"text"}
										thousandSeparator={true}
									/>
								</span>
							</div>
						</Tooltip>

					) : null} */}
        </React.Fragment>
      );
    },
    [renderOrderPaymentMethods]
  );

  const onSuccessEditNote = useCallback(
    (newNote, noteType, orderID) => {
      const newItems = [...orderHistoryData.items];
      const indexOrder = newItems.findIndex((item: any) => item.id === orderID);
      if (indexOrder > -1) {
        if (noteType === "note") {
          newItems[indexOrder].note = newNote;
        } else if (noteType === "customer_note") {
          newItems[indexOrder].customer_note = newNote;
        }
      }
      const newData = {
        ...orderHistoryData,
        items: newItems,
      };
      setOrderHistoryData(newData);
    },
    [orderHistoryData, setOrderHistoryData]
  );

  const editNote = useCallback(
    (newNote, noteType, orderID) => {
      let params: any = {};
      if (noteType === "note") {
        params.note = newNote;
      }
      if (noteType === "customer_note") {
        params.customer_note = newNote;
      }
      dispatch(
        updateOrderPartial(params, orderID, () =>
          onSuccessEditNote(newNote, noteType, orderID)
        )
      );
    },
    [dispatch, onSuccessEditNote]
  );

  const renderReturn = (item: any) => {
    if (!item.code_order_return) {
      return (
        <div style={{marginTop: 5}}>
          <Tooltip title="Đổi trả hàng">
            <Link
              to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${item.id}`}
            >
              <img alt="" src={iconReturn} style={{width: 20}} />
            </Link>
          </Tooltip>
        </div>
      )
    }
  };

  const columnsOrderHistory: Array<ICustomTableColumType<OrderModel>> =
    React.useMemo(
      () => [
        {
          title: "ID đơn hàng",
          dataIndex: "code",
          visible: true,
          fixed: "left",
          className: "custom-shadow-td",
          width: 170,
          render: (value: string, item: any) => {
            return (
              <div>
                {
                  !item.code_order_return
                  ?  
                  <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">
                   {value}
                  </Link>
                  :
                  <Link to={`${UrlConfig.ORDERS_RETURN}/${item.id}`} target="_blank">
                  {value}
                 </Link>
                }
                <div style={{ fontSize: "12px", color: "#666666" }}>
                  <div>
                    {moment(item.created_date).format(
                      DATE_FORMAT.HHmm_DDMMYYYY
                    )}
                    <Tooltip title="Cửa hàng">
                      <div>{item.store}</div>
                    </Tooltip>
                  </div>
                  {item.source && (
                    <div style={{ fontSize: "12px" }}>
                      <strong style={{ color: "#000000" }}>Nguồn: </strong>
                      <span
                        style={{ color: "#222222", wordBreak: "break-all" }}>
                        {item.source}
                      </span>
                    </div>
                  )}
                  {renderReturn(item)}
                </div>
                {
                  item.code_order_return !== undefined
                  && <span style={{ color: "red" }}>Trả hàng</span>
                }
              </div>
            );
          },
        },
        {
          title: (
            <div className="productNameQuantityPriceHeader">
              <span className="productNameWidth">
                Sản phẩm
                <span className="separator">, </span>
              </span>
              <span className="quantity quantityWidth">
                <span>
                  SL
                  <span className="separator">, </span>
                </span>
              </span>
              <span className="price priceWidth">
                <span>Giá </span>
              </span>
            </div>
          ),
          dataIndex: "items",
          key: "productNameQuantityPrice",
          className: "productNameQuantityPrice",
          render: (items: Array<OrderLineItemResponse>) => {
            return (
              <div className="items">
                {items.map((item, i) => {
                  return (
                    <div className="custom-td" key={item.variant_id}>
                      <div className="product productNameWidth 2">
                        <div className="inner">
                          <Link
                            target="_blank"
                            to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}>
                            {item.sku}
                          </Link>
                          <br />
                          <div className="productNameText" title={item.variant}>
                            {item.variant}
                          </div>
                        </div>
                      </div>
                      <div className="quantity quantityWidth">
                        <NumberFormat
                          value={item.quantity}
                          displayType={"text"}
                          thousandSeparator={true}
                        />
                      </div>
                      <div className="price priceWidth">
                        <div>
                          <Tooltip title="Giá sản phẩm">
                            <span>{formatCurrency(item.price)}</span>
                          </Tooltip>

                          {item?.discount_items &&
                            item.discount_items[0]?.value && (
                              <Tooltip title="Khuyến mại sản phẩm">
                                <div
                                  className="itemDiscount"
                                  style={{ color: dangerColor }}>
                                  <span>
                                    {" "}
                                    -{" "}
                                    {formatCurrency(
                                      Math.round(
                                        item.discount_items[0].rate * 100
                                      ) / 100
                                    )}
                                    %
                                  </span>
                                </div>
                              </Tooltip>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          },
          visible: true,
          align: "left",
          width: nameQuantityWidth,
        },

        {
          title: "Thành tiền",
          render: (record: any) => (
            <React.Fragment>
              <Tooltip title="Thành tiền">
                <NumberFormat
                  value={record.total_line_amount_after_line_discount}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </Tooltip>
              {record.total_discount ? (
                <React.Fragment>
                  <br />
                  <Tooltip title="Chiết khấu đơn hàng">
                    <span style={{ color: "#EF5B5B" }}>
                      {" "}
                      -
                      <NumberFormat
                        value={record.total_discount}
                        className="foo"
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </span>
                  </Tooltip>
                </React.Fragment>
              ) : null}
            </React.Fragment>
          ),
          key: "customer.amount_money",
          visible: true,
          align: "right",
          width: 100,
        },
        {
          title: "Thanh toán",
          dataIndex: "payment_status",
          key: "payment_status",
          render: (value: string, record: any) => {
            return (
              <React.Fragment>
                {record.payments &&  renderOrderPayments(record)}
              </React.Fragment>
            );
          },
          visible: true,
          align: "left",
          width: 120,
        },
        {
          title: "Điểm",
          dataIndex: "",
          render: (record: any) => (
            <>
              {
                !record.code_order_return
                ?
                <div className="order-point-column">
                  <span style={{ color: "#27AE60" }}>{`Tích: ${record.change_point?.add ? record.change_point?.add : 0}`}</span>
                  <span style={{ color: "#E24343" }}>{`Tiêu: ${record.change_point?.subtract ? record.change_point?.subtract : 0}`}</span>
                </div>
                :
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ color: "#27AE60" }}>{`Trừ Tích: ${record.change_point?.subtract ? record.change_point?.subtract : 0}`}</span>
                  <span style={{ color: "#E24343" }}>{`Hoàn Tiêu: ${record.change_point?.add ? record.change_point?.add : 0}`}</span>
                </div>

              }
            </>
          ),
          key: "customer.amount_money",
          visible: true,
          align: "left",
          width: 120,
        },

        {
          title: "Ghi chú",
          className: "notes",
          render: (value: string, record: any) => (
            <div className="orderNotes">
              <div className="inner">
                {
                  record.code_order_return
                  &&  
                  <div className="order-reason">
                   <span className="order-reason-heading">Lý do trả</span>
                   <span className="order-reason-content">{record.reason}</span>
                  </div>
                  
                }
                <div className="single order-note">
                  <EditNote
                    note={record.customer_note}
                    title="Khách hàng: "
                    color={primaryColor}
                    onOk={(newNote) => {
                      editNote(newNote, "customer_note", record.id);
                    }}
                    isDisable={record.status === OrderStatus.FINISHED}
                  />
                </div>
                <div className="single order-note">
                  <EditNote
                    note={record.note}
                    title="Nội bộ: "
                    color={primaryColor}
                    onOk={(newNote) => {
                      editNote(newNote, "note", record.id);
                    }}
                    isDisable={record.status === OrderStatus.FINISHED}
                  />
                </div>
              </div>
            </div>
          ),
          key: "note",
          visible: true,
          align: "left",
          width: 150,
        },

        {
          title: "Trạng thái",
          dataIndex: "status",
          key: "status",
          className: "orderStatus",
          render: (value: string, record: any) => {
            if (!record || !status_order) {
              return null;
            }
            const status = status_order.find(
              (status) => status.value === record.status
            );

            const received = {
              text: record.received ? "Đã nhận" : "Chưa nhận",
              color: record.received ? "#27AE60" : "#E24343",
            };
            const payment_status = {
              text:
                record.payment_status === PoPaymentStatus.PAID
                  ? "Đã hoàn"
                  : "Chưa hoàn",
              color:
                record.payment_status === PoPaymentStatus.PAID
                  ? "#27AE60"
                  : "#E24343",
            };
    
            return (
              <>
              {
                !record.code_order_return
                &&
                <div className="orderStatus">
                <div className="inner">
                  <div className="single">
                    <div>
                      <strong>Xử lý đơn: </strong>
                    </div>
                    {record.sub_status ? record.sub_status : "-"}
                  </div>
                  <div className="single">
                    <div>
                      <strong>Đơn hàng: </strong>
                    </div>
                    {record.status === OrderStatus.DRAFT && (
                      <div
                        style={{
                          color: "#737373",
                        }}>
                        {status?.name}
                      </div>
                    )}

                    {record.status === OrderStatus.FINALIZED && (
                      <div
                        style={{
                          color: "#FCAF17",
                        }}>
                        {status?.name}
                      </div>
                    )}

                    {record.status === OrderStatus.FINISHED && (
                      <div
                        style={{
                          color: "#27AE60",
                        }}>
                        {status?.name}
                      </div>
                    )}

                    {record.status === OrderStatus.CANCELLED && (
                      <div
                        style={{
                          color: "#E24343",
                        }}>
                        {status?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              }

              {
                record.code_order_return
                &&  
                <div>
                  <div>
                    <div>
                    <strong>Hàng: </strong>
                    <span style={{ color: `${received.color}` }}>
                      {received.text}
                    </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#666666" }}>
                    {record.receive_date
                      ? moment(record.receive_date).format(DATE_FORMAT.HHmm_DDMMYYYY)
                      : ""}
                    </div>
                  </div>
                  
                  <div>
                    <strong>Tiền: </strong>
                    <span style={{ color: `${payment_status.color}` }}>
                    {payment_status.text}
                    </span>
                  </div>
                </div>
              }
              </>
            );
          },
          visible: true,
          align: "left",
          width: 120,
        },
        
        {
          title: "Vận chuyển",
          key: "shipment.type",
          className: "shipmentType",
          render: (value: string, record: OrderModel) => {
            const sortedFulfillments = record.fulfillments?.sort(
              (a: any, b: any) => b.id - a.id
            );
            if (record.source_id === POS.source_id) {
              return (
                <React.Fragment>
                  <div className="single">
                    <img src={IconStore} alt="" className="icon" />
                    Bán tại quầy
                  </div>
                </React.Fragment>
              );
            }
            if (
              record?.fulfillments &&
              record.fulfillments[0]?.status === FulFillmentStatus.CANCELLED
            ) {
              return (
                <div className="single">
                  <img
                    src={iconShippingFeePay3PL}
                    alt=""
                    className="iconShipping"
                  />
                  Đã hủy vận chuyển
                </div>
              );
            }
            if (sortedFulfillments) {
              if (sortedFulfillments[0]?.shipment) {
                switch (
                  sortedFulfillments[0].shipment?.delivery_service_provider_type
                ) {
                  case ShipmentMethod.EXTERNAL_SERVICE:
                    const thirdPLId =
                      sortedFulfillments[0].shipment
                        .delivery_service_provider_id;
                    const service = deliveryServices.find(
                      (service) => service.id === thirdPLId
                    );
                    return (
                      <React.Fragment>
                        {service && (
                          <React.Fragment>
                            <div className="single">
                              <img
                                src={service.logo ? service.logo : ""}
                                alt=""
                              />
                            </div>
                            <Tooltip title="Tổng khối lượng">
                              <div className="single">
                                <img src={iconWeight} alt="" />
                                <span>{record.total_weight || 0} gr</span>
                              </div>
                            </Tooltip>
                            <Tooltip title="Phí ship báo khách">
                              <div className="single">
                                <img
                                  src={iconShippingFeeInformedToCustomer}
                                  alt=""
                                />
                                <span>
                                  {formatCurrency(
                                    sortedFulfillments[0].shipment
                                      .shipping_fee_informed_to_customer || 0
                                  )}
                                </span>
                              </div>
                            </Tooltip>

                            <Tooltip title="Phí vận chuyển">
                              <div className="single">
                                <img
                                  src={iconShippingFeePay3PL}
                                  alt=""
                                  className="iconShipping"
                                />
                                {formatCurrency(
                                  sortedFulfillments[0].shipment
                                    .shipping_fee_paid_to_three_pls || 0
                                )}
                              </div>
                            </Tooltip>
                          </React.Fragment>
                        )}
                      </React.Fragment>
                    );
                  case ShipmentMethod.EMPLOYEE:
                  case ShipmentMethod.EXTERNAL_SHIPPER:
                    return (
                      <React.Fragment>
                        <div className="single">
                          Đối tác {" - "}
                          <span style={{ color: primaryColor }}>
                            {sortedFulfillments[0].shipment.shipper_code}-
                            {sortedFulfillments[0].shipment.shipper_name}
                          </span>
                        </div>
                        <Tooltip title="Tổng khối lượng">
                          <div className="single">
                            <img src={iconWeight} alt="" />
                            <span>{record.total_weight || 0} gr</span>
                          </div>
                        </Tooltip>
                        <Tooltip title="Phí ship báo khách">
                          <div className="single">
                            <img
                              src={iconShippingFeeInformedToCustomer}
                              alt=""
                            />
                            <span>
                              {formatCurrency(
                                sortedFulfillments[0].shipment
                                  .shipping_fee_informed_to_customer || 0
                              )}
                            </span>
                          </div>
                        </Tooltip>

                        <Tooltip title="Phí vận chuyển">
                          <div className="single">
                            <img src={iconShippingFeePay3PL} alt="" />
                            {formatCurrency(
                              sortedFulfillments[0].shipment
                                .shipping_fee_paid_to_three_pls || 0
                            )}
                          </div>
                        </Tooltip>
                      </React.Fragment>
                    );
                  case ShipmentMethod.PICK_AT_STORE:
                    return (
                      <React.Fragment>
                        <div className="single">
                          Nhận tại {" - "}
                          <Link
                            target="_blank"
                            to={`${UrlConfig.STORE}/${record?.store_id}`}>
                            {record.store}
                          </Link>
                        </div>
                        <Tooltip title="Tổng khối lượng">
                          <div className="single">
                            <img src={iconWeight} alt="" />
                            <span>{record.total_weight || 0} gr</span>
                          </div>
                        </Tooltip>
                        <Tooltip title="Phí ship báo khách">
                          <div className="single">
                            <img
                              src={iconShippingFeeInformedToCustomer}
                              alt=""
                            />
                            <span>
                              {formatCurrency(
                                sortedFulfillments[0].shipment
                                  .shipping_fee_informed_to_customer || 0
                              )}
                            </span>
                          </div>
                        </Tooltip>

                        <Tooltip title="Phí vận chuyển">
                          <div className="single">
                            <img src={iconShippingFeePay3PL} alt="" />
                            {formatCurrency(
                              sortedFulfillments[0].shipment
                                .shipping_fee_paid_to_three_pls || 0
                            )}
                          </div>
                        </Tooltip>
                      </React.Fragment>
                    );
                  case ShipmentMethod.SHOPEE:
                    return (
                      <React.Fragment>
                        <div className="single">Shopee</div>
                        <Tooltip title="Tổng khối lượng">
                          <div className="single">
                            <img src={iconWeight} alt="" />
                            <span>{record.total_weight || 0} gr</span>
                          </div>
                        </Tooltip>
                        <Tooltip title="Phí ship báo khách">
                          <div className="single">
                            <img
                              src={iconShippingFeeInformedToCustomer}
                              alt=""
                            />
                            <span>
                              {formatCurrency(
                                sortedFulfillments[0].shipment
                                  .shipping_fee_informed_to_customer || 0
                              )}
                            </span>
                          </div>
                        </Tooltip>

                        <Tooltip title="Phí vận chuyển">
                          <div className="single">
                            <img src={iconShippingFeePay3PL} alt="" />
                            {formatCurrency(
                              sortedFulfillments[0].shipment
                                .shipping_fee_paid_to_three_pls || 0
                            )}
                          </div>
                        </Tooltip>
                      </React.Fragment>
                    );
                  default:
                    return (
                      <React.Fragment>
                        <Tooltip title="Tổng khối lượng">
                          <div className="single">
                            <img src={iconWeight} alt="" />
                            <span>{record.total_weight || 0} gr</span>
                          </div>
                        </Tooltip>
                        <Tooltip title="Phí ship báo khách">
                          <div className="single">
                            <img
                              src={iconShippingFeeInformedToCustomer}
                              alt=""
                            />
                            <span>
                              {formatCurrency(
                                sortedFulfillments[0].shipment
                                  .shipping_fee_informed_to_customer || 0
                              )}
                            </span>
                          </div>
                        </Tooltip>

                        <Tooltip title="Phí vận chuyển">
                          <div className="single">
                            <img src={iconShippingFeePay3PL} alt="" />
                            {formatCurrency(
                              sortedFulfillments[0].shipment
                                .shipping_fee_paid_to_three_pls || 0
                            )}
                          </div>
                        </Tooltip>
                      </React.Fragment>
                    );
                }
              }
            }
            return "";
          },
          visible: true,
          width: 120,
          align: "left",
        },

        {
          title: "NV bán hàng",
          render: (value, record: OrderModel) => (
            <Link
              target="_blank"
              to={`${UrlConfig.ACCOUNTS}/${record.assignee_code}`}>
              {`${record.assignee_code} - ${record.assignee}`}
            </Link>
          ),
          key: "assignee",
          visible: true,
          align: "center",
          width: 136,
        },
        {
          title: "NV tạo đơn",
          render: (value, record: OrderModel) => (
            <Link
              target="_blank"
              to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}>
              {record.account 
                && record.account_code 
                && `${record.account_code} - ${record.account}`
              }
            </Link>
          ),
          key: "account",
          visible: true,
          align: "center",
          width: 130,
        },
        {
          title: "Ngày hoàn tất đơn",
          dataIndex: "finished_on",
          render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
          key: "finished_on",
          visible: true,
          align: "center",
          width: 150,
        },
        {
          title: "Ngày huỷ đơn",
          dataIndex: "cancelled_on",
          render: (value: string) => <div>{ConvertUtcToLocalDate(value)}</div>,
          key: "cancelled_on",
          visible: true,
          align: "center",
          width: 150,
        },
        {
          title: "Biên bản bàn giao",
          dataIndex: "Biên bản bàn giao",
          key: "Biên bản bàn giao",
          render: (value) => null,
          visible: true,
          // width: 160,
        },
        {
          title: "Mã Afilliate",
          dataIndex: "Mã Afilliate",
          key: "Mã Afilliate",
          render: (value) => null,
          visible: true,
          // width: 160,
        },
        {
          title: "Ghi chú hóa đơn",
          dataIndex: "Ghi chú hóa đơn",
          key: "Ghi chú hóa đơn",
          render: (value) => null,
          visible: true,
          // width: 190,
        },
        {
          title: "Tag",
          dataIndex: "tags",
          render: (values, record: OrderModel) => {
            let result: React.ReactNode = null;
            if (record?.tags) {
              const listTags = record?.tags.split(",");
              if (listTags && listTags.length > 0) {
                result = (
                  <ul>
                    {listTags.map((tag, index) => {
                      return <li key={index}>{tag}</li>;
                    })}
                  </ul>
                );
              }
            }
            return result;
          },
          key: "tags",
          visible: true,
          align: "left",
          width: 150,
        },
        {
          title: "Mã tham chiếu",
          dataIndex: "reference_code",
          key: "reference_code",
          render: (value, record: OrderModel) => {
            let result: React.ReactNode = null;
            if (record?.url) {
              result = <a href={record?.url}>{value}</a>;
            }
            if (record?.linked_order_code) {
              return (
                <Link
                  to={`${UrlConfig.ORDER}/${record.linked_order_code}`}
                  target="_blank">
                  {record?.linked_order_code}
                </Link>
              );
            } else {
              result = value;
            }
            return result;
          },
          visible: true,
          width: 150,
        },
      ],
      [deliveryServices, editNote, renderOrderPayments, status_order]
    );

  return (
    <StyledPurchaseHistory>
      <CustomTable
        bordered
        isLoading={tableLoading}
        showColumnSetting={true}
        scroll={{ x: 2800 }}
        sticky={{ offsetScroll: 10, offsetHeader: 55 }}
        pagination={{
          pageSize: orderHistoryData.metadata.limit,
          total: orderHistoryData.metadata.total,
          current: orderHistoryData.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        dataSource={orderHistoryList()}
        columns={columnsOrderHistory}
        rowKey={(item: OrderModel) => item.id}
      />
    </StyledPurchaseHistory>
  );
}

export default PurchaseHistory;
