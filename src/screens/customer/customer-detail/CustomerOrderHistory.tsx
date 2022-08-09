import { Button, Col, Form, FormInstance, Input, Row, Spin, Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderHistorySearch } from "model/order/order.model";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  CustomerOrderHistoryResponse,
  DeliveryServiceResponse,
  ShipmentResponse,
  TrackingLogFulfillmentResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getOrderHistoryService } from "service/order/order.service";
import {
  checkIfOrderCanBeReturned,
  copyTextToClipboard,
  formatCurrency,
  getOrderTotalPaymentAmount,
  getTotalQuantity,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import { COD, OrderStatus, PaymentMethodCode, POS, ShipmentMethod } from "utils/Constants";
import { dangerColor, primaryColor, yellowColor } from "utils/global-styles/variables";
import { ORDER_SUB_STATUS, PAYMENT_METHOD_ENUM } from "utils/Order.constants";
import {
  nameQuantityWidth,
  StyledPurchaseHistory,
} from "screens/customer/customer-detail/customerDetailStyled";
import UrlConfig from "config/url.config";
import ButtonCreateOrderReturn from "screens/order-online/component/ButtonCreateOrderReturn";
import EditNote from "screens/order-online/component/edit-note";
import {
  getFulfillmentActive,
  getLink,
  getReturnMoneyStatusColor,
  getReturnMoneyStatusText,
  getTotalAmountBeforeDiscount,
} from "utils/OrderUtils";
import { showSuccess } from "utils/ToastUtils";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";
import { RootReducerType } from "model/reducers/RootReducerType";
import { DATE_FORMAT } from "utils/DateUtils";
import { DeliveryServicesGetList, updateOrderPartial } from "domain/actions/order/order.action";
import "assets/css/order-status.scss";
import SearchProductComponent from "component/search-product";
import { VariantResponse } from "model/product/product.model";

import iconShippingFeeInformedToCustomer from "screens/order-online/component/OrderList/ListTable/images/iconShippingFeeInformedToCustomer.svg";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import iconWeight from "screens/order-online/component/OrderList/ListTable/images/iconWeight.svg";
import search from "assets/img/search.svg";
import iconShippingFeePay3PL from "screens/order-online/component/OrderList/ListTable/images/iconShippingFeePay3PL.svg";
import IconPaymentBank from "assets/icon/payment/chuyen-khoan.svg";
import IconPaymentQRCode from "assets/icon/payment/qr.svg";
import IconPaymentSwipeCard from "assets/icon/payment/quet-the.svg";
import IconPaymentCod from "assets/icon/payment/cod.svg";
import IconPaymentCash from "assets/icon/payment/tien-mat.svg";
import IconPaymentReturn from "assets/icon/payment/tien-hoan.svg";
import IconPaymentPoint from "assets/icon/payment/YD Coin.svg";
import IconPaymentMOMO from "assets/icon/payment/momo.svg";
import IconPaymentVNPay from "assets/icon/payment/vnpay.svg";
import iconWarranty from "assets/icon/icon-warranty-menu.svg";
import IconStore from "screens/order-online/component/OrderList/ListTable/images/store.svg";
import DeliveryProgress from "component/order/DeliveryProgress";

type Props = {
  customer?: CustomerResponse;
};

var customerHistoryData: PageResponse<CustomerOrderHistoryResponse> = {
  metadata: {
    limit: 10,
    page: 1,
    total: 0,
  },
  items: [],
};

const PAYMENT_ICON = [
  {
    payment_method_code: PaymentMethodCode.BANK_TRANSFER,
    icon: IconPaymentBank,
    tooltip: "Đã chuyển khoản",
  },
  {
    payment_method_code: PaymentMethodCode.QR_CODE,
    icon: IconPaymentQRCode,
    tooltip: "Mã QR",
  },
  {
    payment_method_code: PaymentMethodCode.CARD,
    icon: IconPaymentSwipeCard,
    tooltip: "Đã quẹt thẻ",
  },
  {
    payment_method_code: PaymentMethodCode.CASH,
    icon: IconPaymentCash,
    tooltip: "Tiền khách đưa",
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
  {
    payment_method_code: PaymentMethodCode.MOMO,
    icon: IconPaymentMOMO,
    Tooltip: "MOMO",
  },
  {
    payment_method_code: PaymentMethodCode.VN_PAY,
    icon: IconPaymentVNPay,
    Tooltip: "VNPay",
  },
];

const initOrderSearchingQuery: OrderHistorySearch = {
  limit: 30,
  page: 1,
  sort_type: "desc",
};

const CustomerOrderHistory: React.FC<Props> = (props: Props) => {
  const { customer } = props;
  const dispatch = useDispatch();
  const formSearchRef = createRef<FormInstance>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderHistoryQueryParams, setOrderHistoryQueryParams] =
    useState<OrderHistorySearch>(initOrderSearchingQuery);
  const [keySearchVariant, setKeySearchVariant] = useState("");

  const [purchaseHistoryData, setPurchaseHistoryData] = useState<
    PageResponse<CustomerOrderHistoryResponse>
  >({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [deliveryServices, setDeliveryServices] = useState<Array<DeliveryServiceResponse>>([]);

  const subStatuses = useGetOrderSubStatuses();
  const status_order = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.order_status,
  );

  useEffect(() => {
    if (customer?.id) {
      const query: OrderHistorySearch = {
        ...orderHistoryQueryParams,
        customer_ids: customer?.id,
      };
      setIsLoading(true);
      getOrderHistoryService(query)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setPurchaseHistoryData(response.data);
            customerHistoryData = { ...response.data };
          } else {
            handleFetchApiError(response, "Danh sách lịch sử đơn hàng", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [customer?.id, orderHistoryQueryParams, dispatch]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      }),
    );
  }, [dispatch]);

  const setTrackingOrderData = (orderId: number, data: TrackingLogFulfillmentResponse[] | null) => {
    const index = customerHistoryData.items?.findIndex((single) => single.id === orderId);
    if (index !== -1) {
      customerHistoryData.items[index].tracking_log = data;
      customerHistoryData.items[index].is_show_tracking_log = true;
      setPurchaseHistoryData({ ...customerHistoryData });
    }
  };

  const renderOrderTotalPayment = useCallback((orderDetail: any) => {
    const isOfflineOrder = orderDetail?.channel_id === POS.channel_id;
    const totalPayment = getOrderTotalPaymentAmount(orderDetail?.payments);

    return (
      <React.Fragment>
        {isOfflineOrder ? null : (
          <div className="orderTotalLeftAmount">
            <Tooltip title="Tiền còn thiếu">
              {formatCurrency(orderDetail.total - totalPayment)}
            </Tooltip>
          </div>
        )}
      </React.Fragment>
    );
  }, []);

  const renderOrderPaymentMethods = useCallback((orderDetail: any) => {
    return orderDetail?.payments?.map((payment: any, index: number) => {
      const selectedPayment = PAYMENT_ICON.find((single) => {
        if (single.payment_method_code === "cod") {
          return single.payment_method_code === payment.payment_method;
        } else if (!single.payment_method_code) {
          return payment.payment_method === PAYMENT_METHOD_ENUM.exchange.name;
        } else {
          return single.payment_method_code === payment.payment_method_code;
        }
      });
      return (
        <div
          className={`singlePayment ${
            payment.payment_method_code === PaymentMethodCode.POINT ? "ydPoint" : null
          }`}
          key={index}
        >
          <Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
            <img src={selectedPayment?.icon} alt="" />
            {payment.payment_method_code === PaymentMethodCode.POINT ? (
              <span className="amount">{formatCurrency(payment.point)}</span>
            ) : (
              <span className="amount">{formatCurrency(payment.paid_amount)}</span>
            )}
          </Tooltip>
        </div>
      );
    });
  }, []);

  const renderOrderReturn = useCallback((orderDetail: any) => {
    let returnAmount = 0;
    orderDetail.payments.forEach((payment: any) => {
      if (payment.return_amount > 0) {
        returnAmount = returnAmount + payment.return_amount;
      }
    });
    if (returnAmount > 0) {
      return (
        <Tooltip title={"Tiền hoàn lại"}>
          <strong className="amount" style={{ color: yellowColor }}>
            {formatCurrency(returnAmount)}
          </strong>
        </Tooltip>
      );
    }
    return null;
  }, []);

  const renderOrderPayments = useCallback(
    (orderDetail: any) => {
      return (
        <React.Fragment>
          {renderOrderTotalPayment(orderDetail)}
          {renderOrderPaymentMethods(orderDetail)}
          {renderOrderReturn(orderDetail)}
        </React.Fragment>
      );
    },
    [renderOrderPaymentMethods, renderOrderReturn, renderOrderTotalPayment],
  );

  const renderOrderReturnPayments = useCallback((record: any) => {
    return (
      <React.Fragment>
        {record.point_refund ? (
          <Tooltip title="Hoàn điểm">
            <div>
              <img src={IconPaymentPoint} alt="" />
              <NumberFormat
                value={record.point_refund}
                className="foo"
                displayType={"text"}
                thousandSeparator={true}
                style={{ fontWeight: 500, color: "#fcaf17", paddingLeft: 5 }}
              />
            </div>
          </Tooltip>
        ) : (
          <></>
        )}

        <Tooltip title="Tiền trả khách" placement="topLeft">
          <div style={{ fontWeight: 500 }}>
            <img src={IconPaymentReturn} alt="" />
            <NumberFormat
              value={record.money_refund || 0}
              className="foo"
              displayType={"text"}
              thousandSeparator={true}
              style={{ paddingLeft: 5 }}
            />
          </div>
        </Tooltip>
      </React.Fragment>
    );
  }, []);

  const renderTrackingCode = (shipment: ShipmentResponse) => {
    const trackingCode = shipment?.tracking_code;
    if (!trackingCode) {
      return null;
    }
    let html: string | null = null;
    let stringReverse = trackingCode.split("").reverse().join("");
    const dot = ".";
    const index = stringReverse.indexOf(dot);
    if (index > 0) {
      html = stringReverse.substring(0, index).split("").reverse().join("");
    } else {
      html = trackingCode;
    }
    const linkText = shipment?.delivery_service_provider_code
      ? getLink(shipment.delivery_service_provider_code, trackingCode)
      : "";
    return (
      <span
        onClick={(e) => {
          if (html) {
            copyTextToClipboard(e, html);
            showSuccess("Đã copy mã vận đơn!");
          }
        }}
      >
        {linkText ? (
          <a href={linkText} target="_blank" title={linkText} rel="noreferrer">
            {html}
          </a>
        ) : (
          html
        )}
        <Tooltip title="Click để copy mã vận đơn">
          <img
            onClick={(e) => {
              copyTextToClipboard(e, html);
              showSuccess("Đã copy mã vận đơn!");
            }}
            src={copyFileBtn}
            alt=""
            style={{ width: 18, cursor: "pointer" }}
          />
        </Tooltip>
      </span>
    );
  };

  const onSuccessEditNote = useCallback((newNote, noteType, orderID) => {
    const indexOrder = customerHistoryData.items.findIndex((item: any) => item.id === orderID);
    if (indexOrder > -1) {
      if (noteType === "note") {
        customerHistoryData.items[indexOrder].note = newNote;
      } else if (noteType === "customer_note") {
        customerHistoryData.items[indexOrder].customer_note = newNote;
      }
    }
    setPurchaseHistoryData(customerHistoryData);
  }, []);

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
        updateOrderPartial(params, orderID, () => {
          onSuccessEditNote(newNote, noteType, orderID);
        }),
      );
    },
    [dispatch, onSuccessEditNote],
  );

  const checkIfOrderReturn = (record: CustomerOrderHistoryResponse) => {
    return record.order_id ? true : false;
  };

  const columnsPurchaseHistory: Array<ICustomTableColumType<CustomerOrderHistoryResponse>> =
    useMemo(
      () => [
        {
          title: "Khách hàng",
          visible: true,
          fixed: "left",
          width: 75,
          render: (item: any) => {
            return (
              <div>
                <div>
                  <b>{item.code_order_return ? item.customer_name : item.customer}</b>
                </div>
                <div>{item.customer_phone_number}</div>
              </div>
            );
          },
        },
        {
          title: "ID đơn hàng",
          visible: true,
          fixed: "left",
          className: "custom-shadow-td",
          width: 110,
          render: (item: CustomerOrderHistoryResponse) => {
            const isOrderReturn = checkIfOrderReturn(item);
            return (
              <div>
                <div className="noWrap">
                  {isOrderReturn ? (
                    <>
                      <Tooltip title="Mã đơn trả hàng">
                        <Link to={`${UrlConfig.ORDERS_RETURN}/${item.id}`} target="_blank">
                          {item.code}
                        </Link>
                      </Tooltip>
                      <Tooltip title="Click để copy">
                        <img
                          onClick={(e) => {
                            copyTextToClipboard(e, item.code.toString());
                            showSuccess("Đã copy mã đơn hàng!");
                          }}
                          src={copyFileBtn}
                          alt=""
                          style={{ width: 18, cursor: "pointer" }}
                        />
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Mã đơn hàng">
                        <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">
                          {item.code}
                        </Link>
                      </Tooltip>
                      <Tooltip title="Click để copy">
                        <img
                          onClick={(e) => {
                            copyTextToClipboard(e, item.code.toString());
                            showSuccess("Đã copy mã đơn hàng!");
                          }}
                          src={copyFileBtn}
                          alt=""
                          style={{ width: 18, cursor: "pointer" }}
                        />
                      </Tooltip>
                    </>
                  )}
                </div>
                <div style={{ fontSize: "12px", color: "#666666" }}>
                  <div>
                    {moment(item.created_date).format(DATE_FORMAT.HHmm_DDMMYYYY)}
                    <Tooltip title="Cửa hàng">
                      <div>{item.store}</div>
                    </Tooltip>
                  </div>
                </div>

                {item.channel_id === POS.channel_id ? null : (
                  <div className="textSmall single">
                    <Tooltip title="Nguồn">{item.source}</Tooltip>
                  </div>
                )}
                {item.channel_id === POS.channel_id ? (
                  <React.Fragment>
                    <div className="textSmall single mainColor">
                      <Tooltip title="Chuyên gia tư vấn">
                        <Link to={`${UrlConfig.ACCOUNTS}/${item.assignee_code}`}>
                          <strong>CGTV: </strong>
                          {item.assignee_code} - {item.assignee}
                        </Link>
                      </Tooltip>
                    </div>
                    <div className="textSmall single mainColor">
                      <Tooltip title="Thu ngân">
                        <Link to={`${UrlConfig.ACCOUNTS}/${item.account_code}`}>
                          <strong>Thu ngân: </strong>
                          {item.account_code} - {item.account}
                        </Link>
                      </Tooltip>
                    </div>
                  </React.Fragment>
                ) : null}
                {item.channel_id !== POS.channel_id && item.source && (
                  <React.Fragment>
                    <div className="textSmall single mainColor">
                      <Tooltip title="Nhân viên bán hàng">
                        <Link to={`${UrlConfig.ACCOUNTS}/${item.assignee_code}`}>
                          <strong>NV bán hàng: </strong>
                          {item.assignee_code} - {item.assignee}
                        </Link>
                      </Tooltip>
                    </div>
                  </React.Fragment>
                )}
                <div className="textSmall single">
                  <strong>Tổng SP: {getTotalQuantity(item.items)}</strong>
                </div>

                <div style={{ display: "flex" }}>
                  {isOrderReturn ? (
                    <div style={{ display: "block" }}>
                      <div className="textSmall">
                        <span style={{ fontWeight: "bold" }}>Đơn gốc: </span>
                        <Tooltip title="Mã đơn gốc">
                          <Link to={`${UrlConfig.ORDER}/${item.order_id}`} target="_blank">
                            {item.order_code}
                          </Link>
                        </Tooltip>
                      </div>
                      <div className="textSmall 5" style={{ color: "red", fontWeight: "bold" }}>
                        Trả hàng
                      </div>
                    </div>
                  ) : !isOrderReturn && checkIfOrderCanBeReturned(item) ? (
                    <div style={{ marginRight: 5 }}>
                      <ButtonCreateOrderReturn orderDetail={item} />
                    </div>
                  ) : null}
                  {(item.status === OrderStatus.FINISHED ||
                    item.status === OrderStatus.COMPLETED) &&
                  !isOrderReturn ? (
                    <div className="actionButton">
                      <Link
                        to={`${UrlConfig.WARRANTY}/create?orderID=${item.id}`}
                        title="Tạo bảo hành"
                        target="_blank"
                      >
                        <img
                          alt=""
                          src={iconWarranty}
                          className="iconReturn"
                          style={{ filter: "brightness(0.5)" }}
                        />
                      </Link>
                    </div>
                  ) : null}
                </div>
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
          key: "productNameQuantityPrice",
          className: "productNameQuantityPrice",
          visible: true,
          align: "left",
          width: nameQuantityWidth,
          render: (data: any) => {
            return (
              <div className="items">
                {data.items.map((item: any) => {
                  return (
                    <div className="custom-td" key={item.variant_id}>
                      <div className="product productNameWidth 2">
                        <div className="inner">
                          <Link
                            target="_blank"
                            to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                          >
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

                          {item?.discount_items && item.discount_items[0]?.value ? (
                            <div>
                              <Tooltip
                                title={
                                  "Chiết khấu sản phẩm: " +
                                  Math.round(item.discount_items[0]?.rate * 100) / 100 +
                                  "%"
                                }
                              >
                                <div className="discount">
                                  {"-" + formatCurrency(item.discount_items[0]?.value)}
                                </div>
                              </Tooltip>
                              <Tooltip title="Khuyến mại sản phẩm (%)">
                                <div className="discount">
                                  {" "}
                                  -{" "}
                                  {Math.round((item.discount_items[0].value / item.price) * 10000) /
                                    100}
                                  %
                                </div>
                              </Tooltip>
                              <Tooltip title="Giá sau chiết khấu">
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    textAlign: "right",
                                  }}
                                >
                                  {formatCurrency(item.price - item.discount_items[0].value)}
                                </div>
                              </Tooltip>
                            </div>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          },
        },
        {
          title: "Thành tiền",
          key: "customer.amount_money",
          visible: true,
          align: "right",
          width: 65,
          render: (record: CustomerOrderHistoryResponse) => {
            const isOrderReturn = checkIfOrderReturn(record);
            return (
              <>
                {/*Đơn hàng*/}
                {!isOrderReturn && (
                  <React.Fragment>
                    <div className="original-price">
                      <Tooltip title="Tổng tiền khi sản phẩm còn nguyên giá">
                        <span>{formatCurrency(getTotalAmountBeforeDiscount(record.items))}</span>
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip title="Tổng tiền">
                        <strong>{formatCurrency(record.total || 0)}</strong>
                      </Tooltip>
                    </div>
                    {record.total_discount ? (
                      <div>
                        <Tooltip title="Tổng tiền chiết khấu">
                          <strong style={{ color: "#EF5B5B" }}>
                            -{formatCurrency(record.total_discount)}
                          </strong>
                        </Tooltip>
                      </div>
                    ) : null}
                    {record.shipping_fee_informed_to_customer ? (
                      <div>
                        <Tooltip title="Phí ship báo khách">
                          {formatCurrency(record.shipping_fee_informed_to_customer)}
                        </Tooltip>
                      </div>
                    ) : null}
                    {/* <Tooltip title="Tổng tiền">
                      <NumberFormat
                        value={record.total_line_amount_after_line_discount}
                        className="foo"
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </Tooltip>

                    <Tooltip
                      title={
                        "Chiết khấu đơn hàng: " +
                        (discountAmount
                          ? Math.round(
                              (record.discounts[0]?.rate ? record.discounts[0]?.rate : 0) * 100,
                            ) / 100
                          : 0) +
                        "%"
                      }
                    >
                      <div style={{ color: "#EF5B5B" }}>
                        <div>
                          <span>-</span>
                          <NumberFormat
                            value={discountAmount || 0}
                            className="foo"
                            displayType={"text"}
                            thousandSeparator={true}
                          />
                        </div>
                      </div>
                    </Tooltip>

                    <Tooltip title="Tiền khách cần trả">
                      <div style={{ fontWeight: "bold" }}>
                        <NumberFormat
                          value={record.total}
                          className="foo"
                          displayType={"text"}
                          thousandSeparator={true}
                        />
                      </div>
                    </Tooltip> */}
                  </React.Fragment>
                )}

                {/*Đơn trả hàng*/}
                {isOrderReturn && (
                  <React.Fragment>
                    {record.discounts?.length > 0 ? (
                      <Tooltip title="Khuyến mại đơn hàng">
                        <div style={{ color: dangerColor }}>
                          <span> - {formatCurrency(record.discounts[0].value || 0)}</span>
                        </div>
                      </Tooltip>
                    ) : null}

                    <Tooltip title="Tổng tiền hoàn">
                      <NumberFormat
                        value={record.total || 0}
                        className="foo"
                        displayType={"text"}
                        thousandSeparator={true}
                        style={{ fontWeight: "bold" }}
                      />
                    </Tooltip>
                  </React.Fragment>
                )}
              </>
            );
          },
        },
        {
          title: "Thanh toán",
          key: "payment_status",
          visible: true,
          align: "right",
          width: 65,
          render: (record: CustomerOrderHistoryResponse) => {
            const isOrderReturn = checkIfOrderReturn(record);
            return (
              <React.Fragment>
                {/*Đơn hàng*/}
                {!isOrderReturn && record.payments && renderOrderPayments(record)}

                {/*Đơn trả*/}
                {isOrderReturn && renderOrderReturnPayments(record)}
              </React.Fragment>
            );
          },
        },
        {
          title: "Điểm",
          key: "customer.amount_money",
          visible: true,
          align: "left",
          width: 60,
          render: (record: CustomerOrderHistoryResponse) => {
            const isOrderReturn = checkIfOrderReturn(record);

            return (
              <React.Fragment>
                {isOrderReturn ? (
                  <div>
                    <div className="plus-point">{`Trừ Tích: ${
                      record.change_point?.subtract ? record.change_point?.subtract : 0
                    }`}</div>
                    <div className="minus-point">{`Hoàn Tiêu: ${
                      record.change_point?.add ? record.change_point?.add : 0
                    }`}</div>
                  </div>
                ) : (
                  <div>
                    <div className="plus-point">{`Tích: ${
                      record.change_point?.add ? record.change_point?.add : 0
                    }`}</div>
                    <div className="minus-point">{`Tiêu: ${
                      record.change_point?.subtract ? record.change_point?.subtract : 0
                    }`}</div>
                    {record.status === OrderStatus.CANCELLED && (
                      <div className="minus-point">{`Hoàn tiêu: ${
                        record.change_point?.subtract ? record.change_point?.subtract : 0
                      }`}</div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          },
        },
        {
          title: "Trạng thái",
          dataIndex: "status",
          key: "status",
          className: "orderStatus",
          render: (value: string, record: CustomerOrderHistoryResponse) => {
            const isOrderReturn = checkIfOrderReturn(record);

            if (!record || !status_order) {
              return null;
            }
            if (isOrderReturn) {
              let textResult = getReturnMoneyStatusText(record?.payment_status || "");
              let textColor = getReturnMoneyStatusColor(record?.payment_status || "");
              return (
                <React.Fragment>
                  <div className="text-return-status 111">
                    <span style={{ color: textColor }}>{textResult}</span>
                  </div>
                </React.Fragment>
              );
            }
            let className =
              record.sub_status_code === ORDER_SUB_STATUS.fourHour_delivery
                ? "fourHour_delivery"
                : record.sub_status_code
                ? record.sub_status_code
                : "";

            return (
              <div className="orderStatus">
                <div className="inner">
                  <div className="single">
                    <div>
                      <strong>Xử lý đơn: </strong>
                    </div>

                    {subStatuses ? (
                      <div className={`status-order ${className}`}>
                        {subStatuses.find((p) => p.code === record.sub_status_code)?.sub_status}
                      </div>
                    ) : undefined}
                  </div>
                  <div className="single">
                    <div className="coordinator-item">
                      <strong>NV điều phối: </strong>
                      {record.coordinator ? (
                        <React.Fragment>
                          <Link
                            to={`${UrlConfig.ACCOUNTS}/${record.coordinator_code}`}
                            style={{ fontWeight: 500 }}
                          >
                            {record.coordinator_code}
                          </Link>
                          <Link
                            to={`${UrlConfig.ACCOUNTS}/${record.coordinator_code}`}
                            style={{ fontWeight: 500 }}
                          >
                            {record.coordinator}
                          </Link>
                        </React.Fragment>
                      ) : (
                        "N/a"
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          },
          visible: true,
          align: "left",
          width: 110,
          isHideInOffline: true,
        },
        {
          title: "Ghi chú",
          className: "notes",
          key: "note",
          visible: true,
          align: "left",
          width: 110,
          render: (record: CustomerOrderHistoryResponse) => {
            const isOrderReturn = checkIfOrderReturn(record);
            const orderReturnReason = record.return_reason?.name || record.reason?.name || ""; // cập nhật lại khi BE thay đổi theo SO
            return (
              <div className="orderNotes">
                {isOrderReturn ? (
                  <div className="order-reason">
                    <span className="order-reason-heading">{"Lý do trả: "}</span>
                    <span className="order-reason-content">{orderReturnReason}</span>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            );
          },
        },
        {
          title: "Vận chuyển",
          key: "shipment.type",
          className: "shipmentType",
          visible: true,
          width: 110,
          align: "left",
          render: (value: string, record: CustomerOrderHistoryResponse) => {
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

            const fulfillment = getFulfillmentActive(record.fulfillments);
            if (!fulfillment) {
              return "";
            }
            if (!fulfillment.shipment) {
              return "";
            }

            switch (fulfillment.shipment.delivery_service_provider_type) {
              case ShipmentMethod.EXTERNAL_SERVICE:
                const thirdPLId = fulfillment.shipment.delivery_service_provider_id;
                const service = deliveryServices.find((service) => service.id === thirdPLId);

                return (
                  <React.Fragment>
                    {service && (
                      <React.Fragment>
                        <div className="single">
                          <img src={service.logo ? service.logo : ""} alt="" />
                        </div>
                        <Tooltip title="Tổng khối lượng">
                          <div className="single">
                            <img src={iconWeight} alt="" />
                            <span>{record.total_weight || 0} gr</span>
                          </div>
                        </Tooltip>
                        <Tooltip title="Phí ship báo khách">
                          <div className="single">
                            <img src={iconShippingFeeInformedToCustomer} alt="" />
                            <span>
                              {formatCurrency(record.shipping_fee_informed_to_customer || 0)}
                            </span>
                          </div>
                        </Tooltip>

                        <Tooltip title="Phí vận chuyển">
                          <div className="single">
                            <img src={iconShippingFeePay3PL} alt="" className="iconShipping" />
                            {formatCurrency(
                              fulfillment.shipment?.shipping_fee_paid_to_three_pls || 0,
                            )}
                          </div>
                        </Tooltip>

                        {fulfillment.shipment?.tracking_code ? (
                          <div className="single trackingCode">
                            {renderTrackingCode(fulfillment.shipment)}
                          </div>
                        ) : null}

                        {fulfillment.code ? (
                          <div className="single">
                            {true && (
                              <DeliveryProgress
                                fulfillments={record.fulfillments || []}
                                setTrackingOrderData={(data) => {
                                  setTrackingOrderData(record.id, data);
                                }}
                              />
                            )}
                          </div>
                        ) : null}
                      </React.Fragment>
                    )}
                  </React.Fragment>
                );
              case ShipmentMethod.EMPLOYEE:
              case ShipmentMethod.EXTERNAL_SHIPPER:
                return (
                  <React.Fragment>
                    <div className="single">
                      {fulfillment.shipment?.service === "4h_delivery"
                        ? "Đơn giao 4H"
                        : "Đơn giao thường"}
                      {" - "}
                      <span style={{ color: primaryColor }}>
                        {fulfillment.shipment?.shipper_code}-{fulfillment.shipment?.shipper_name}
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
                        <img src={iconShippingFeeInformedToCustomer} alt="" />
                        <span>{formatCurrency(record.shipping_fee_informed_to_customer || 0)}</span>
                      </div>
                    </Tooltip>

                    <Tooltip title="Phí vận chuyển">
                      <div className="single">
                        <img src={iconShippingFeePay3PL} alt="" />
                        {formatCurrency(fulfillment.shipment?.shipping_fee_paid_to_three_pls || 0)}
                      </div>
                    </Tooltip>
                  </React.Fragment>
                );
              case ShipmentMethod.PICK_AT_STORE:
                return (
                  <React.Fragment>
                    <div className="single">
                      <strong className="textSmall">Nhận tại {" - "}</strong>
                      <Link to={`${UrlConfig.STORE}/${record?.store_id}`}>{record.store}</Link>
                    </div>
                    <Tooltip title="Tổng khối lượng">
                      <div className="single">
                        <img src={iconWeight} alt="" />
                        <span>{record.total_weight || 0} gr</span>
                      </div>
                    </Tooltip>
                    <Tooltip title="Phí ship báo khách">
                      <div className="single">
                        <img src={iconShippingFeeInformedToCustomer} alt="" />
                        <span>{formatCurrency(record.shipping_fee_informed_to_customer || 0)}</span>
                      </div>
                    </Tooltip>

                    <Tooltip title="Phí vận chuyển">
                      <div className="single">
                        <img src={iconShippingFeePay3PL} alt="" />
                        {formatCurrency(fulfillment.shipment?.shipping_fee_paid_to_three_pls || 0)}
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
                        <img src={iconShippingFeeInformedToCustomer} alt="" />
                        <span>{formatCurrency(record.shipping_fee_informed_to_customer || 0)}</span>
                      </div>
                    </Tooltip>

                    <Tooltip title="Phí vận chuyển">
                      <div className="single">
                        <img src={iconShippingFeePay3PL} alt="" />
                        {formatCurrency(fulfillment.shipment?.shipping_fee_paid_to_three_pls || 0)}
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
                        <img src={iconShippingFeeInformedToCustomer} alt="" />
                        <span>{formatCurrency(record.shipping_fee_informed_to_customer || 0)}</span>
                      </div>
                    </Tooltip>

                    <Tooltip title="Phí vận chuyển">
                      <div className="single">
                        <img src={iconShippingFeePay3PL} alt="" />
                        {formatCurrency(fulfillment.shipment.shipping_fee_paid_to_three_pls || 0)}
                      </div>
                    </Tooltip>
                  </React.Fragment>
                );
            }
          },
        },
      ],
      [
        deliveryServices,
        editNote,
        renderOrderPayments,
        renderOrderReturnPayments,
        status_order,
        subStatuses,
      ],
    );

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...orderHistoryQueryParams, page, limit };
      setOrderHistoryQueryParams(newParams);
    },
    [orderHistoryQueryParams],
  );

  const onFinish = useCallback(
    (value) => {
      console.log(value);
      const newParams: OrderHistorySearch = {
        ...orderHistoryQueryParams,
        page: 1,
        search_term: value.search_term,
        search_product: keySearchVariant,
      };
      setOrderHistoryQueryParams(newParams);
    },
    [keySearchVariant, orderHistoryQueryParams],
  );

  const handleSelectProduct = useCallback(
    (v?: VariantResponse) => {
      if (v) {
        const newParams: OrderHistorySearch = {
          ...orderHistoryQueryParams,
          page: 1,
          search_product: v.sku,
        };
        setOrderHistoryQueryParams(newParams);
      }
    },
    [orderHistoryQueryParams],
  );

  return (
    <React.Fragment>
      <StyledPurchaseHistory>
        <Spin spinning={isLoading}>
          <Row className="customer-order-history-filter">
            <Col md={24}>
              <Form
                onFinish={onFinish}
                ref={formSearchRef}
                layout="inline"
                className="customer-order-history-filter-form"
              >
                <Form.Item name="search_term" style={{ width: "calc(100% - 534px)" }}>
                  <Input
                    prefix={<img src={search} alt="" />}
                    placeholder="Tìm kiếm theo mã đơn trả hàng, tên, sđt khách hàng"
                    onBlur={(e) => {
                      formSearchRef?.current?.setFieldsValue({
                        search_term: e.target.value.trim(),
                      });
                    }}
                  />
                </Form.Item>

                <Form.Item style={{ width: "450px" }}>
                  <SearchProductComponent
                    keySearch={keySearchVariant}
                    setKeySearch={setKeySearchVariant}
                    onSelect={handleSelectProduct}
                    id="search_product"
                  />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Lọc
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <CustomTable
            bordered
            showColumnSetting={true}
            scroll={{ x: 1550 }}
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            pagination={{
              pageSize: purchaseHistoryData.metadata?.limit,
              total: purchaseHistoryData.metadata?.total,
              current: purchaseHistoryData.metadata?.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            isShowPaginationAtHeader
            dataSource={purchaseHistoryData.items}
            columns={columnsPurchaseHistory}
            rowKey={(item: any) => item.id}
          />
        </Spin>
      </StyledPurchaseHistory>
    </React.Fragment>
  );
};

export default CustomerOrderHistory;
