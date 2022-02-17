import { Col, Row, Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { updateOrderPartial } from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  DeliveryServiceResponse,
  OrderLineItemResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { ReactNode, useCallback, useEffect, useMemo } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { formatCurrency, isOrderFromPOS } from "utils/AppUtils";
import {
  COD,
  FACEBOOK,
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  POS,
  ShipmentMethod,
  SHOPEE,
} from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { dangerColor, primaryColor } from "utils/global-styles/variables";
import EditNote from "../../edit-note";
import iconShippingFeeInformedToCustomer from "./images/iconShippingFeeInformedToCustomer.svg";
import iconShippingFeePay3PL from "./images/iconShippingFeePay3PL.svg";
import iconWeight from "./images/iconWeight.svg";
import IconPaymentBank from "./images/paymentBank.svg";
import IconPaymentCard from "./images/paymentCard.svg";
import IconPaymentCod from "./images/paymentCod.svg";
import IconPaymentCash from "./images/paymentMoney.svg";
import IconPaymentPoint from "./images/paymentPoint.svg";
import IconShopee from "./images/shopee.svg";
import IconStore from "./images/store.svg";
// import IconWebsite from "./images/website.svg";
import { nameQuantityWidth, StyledComponent } from "./OrdersTable.styles";

type PropTypes = {
  tableLoading: boolean;
  data: PageResponse<OrderModel>;
  columns: ICustomTableColumType<OrderModel>[];
  deliveryServices: DeliveryServiceResponse[];
  setColumns: (columns: ICustomTableColumType<OrderModel>[]) => void;
  setData: (data: PageResponse<OrderModel>) => void;
  onPageChange: (page: any, size: any) => void;
  onSelectedChange: (selectedRow: any) => void;
  setShowSettingColumn: (value: boolean) => void;
};

function OrdersTable(props: PropTypes) {
  const {
    tableLoading,
    data,
    columns,
    deliveryServices,
    onPageChange,
    onSelectedChange,
    setShowSettingColumn,
    setColumns,
    setData,
  } = props;

  const dispatch = useDispatch();
  const status_order = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.order_status
  );

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
      icon: IconPaymentCash,
      tooltip: null,
    },
    {
      payment_method_code: PaymentMethodCode.POINT,
      icon: IconPaymentPoint,
      tooltip: "Tiêu điểm",
    },
  ];

  const onSuccessEditNote = useCallback(
    (newNote, noteType, orderID) => {
      console.log("ok ok");
      const newItems = [...data.items];
      const indexOrder = newItems.findIndex((item: any) => item.id === orderID);
      if (indexOrder > -1) {
        if (noteType === "note") {
          newItems[indexOrder].note = newNote;
        } else if (noteType === "customer_note") {
          newItems[indexOrder].customer_note = newNote;
        }
      }
      const newData = {
        ...data,
        items: newItems,
      };
      setData(newData);
    },
    [data, setData]
  );

  const editNote = useCallback(
    (newNote, noteType, orderID) => {
      console.log("newNote, noteType, orderID", newNote, noteType, orderID);
      let params: any = {};
      if (noteType === "note") {
        params.note = newNote;
      }
      if (noteType === "customer_note") {
        params.customer_note = newNote;
      }
      dispatch(
        updateOrderPartial(params, orderID, () => onSuccessEditNote(newNote, noteType, orderID))
      );
    },
    [dispatch, onSuccessEditNote]
  );

  const renderOrderSource = (orderDetail: OrderModel) => {
    let html = null;
    if (orderDetail.channel_code === POS.channel_code) {
      html = (
        <Tooltip title="Đơn hàng tại quầy">
          <img src={IconStore} alt="" />
        </Tooltip>
      );
    } else {
      switch (orderDetail.channel_id) {
        case SHOPEE.channel_id:
          html = (
            <Tooltip title="Đơn hàng tại Shopee">
              <img src={IconShopee} alt="" />
            </Tooltip>
          );
          break;
        case FACEBOOK.channel_id:
          html = (
            <Tooltip title="Đơn hàng từ Facebook">
              <img src={IconShopee} alt="" />
            </Tooltip>
          );
          break;
        default:
          break;
      }
    }
    return html;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderOrderPaymentMethods = (orderDetail: OrderModel) => {
    let html = null;
    html = orderDetail.payments.map((payment) => {
      if (!payment.amount) {
        return null;
      }
      let selectedPayment = paymentIcons.find(
        (single) => single.payment_method_code === payment.payment_method_code
      );
      return (
        <div className="singlePayment">
          {payment.paid_amount < 0 ? (
            <Tooltip title="Hoàn tiền">
              <img src={selectedPayment?.icon} alt="" />
              <span className="amount">{formatCurrency(payment.paid_amount)}</span>
            </Tooltip>
          ) : (
            <Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
              <img src={selectedPayment?.icon} alt="" />
              <span className="amount">{formatCurrency(payment.paid_amount)}</span>
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

  const renderShippingAddress = (orderDetail: OrderModel) => {
    let result = "";
    let shippingAddress = orderDetail?.shipping_address;
    if (!shippingAddress) {
      return "";
    }
    result = `${shippingAddress.name} - ${shippingAddress.phone} - ${shippingAddress.full_address} - ${shippingAddress.ward} - ${shippingAddress.district}`;
    return <React.Fragment>{result}</React.Fragment>;
  };

  const initColumns: ICustomTableColumType<OrderModel>[] = useMemo(() => {
    return [
      {
        title: "ID đơn hàng",
        dataIndex: "code",
        key: "code",
        render: (value: string, i: OrderModel) => {
          return (
            <React.Fragment>
              <Link target="_blank" to={`${UrlConfig.ORDER}/${i.id}`} style={{ fontWeight: 500 }}>
                {value}
              </Link>
              <div style={{ fontSize: "0.86em" }}>
                {moment(i.created_date).format(DATE_FORMAT.fullDate)}
              </div>
              <div style={{ fontSize: "0.86em", marginTop: 5 }}>
                <Tooltip title="Cửa hàng">
                  <Link target="_blank" to={`${UrlConfig.STORE}/${i?.store_id}`}>
                    {i.store}
                  </Link>
                </Tooltip>
              </div>
              {i.source && (
                <div style={{ fontSize: "0.86em", marginTop: 5 }}>
                  <Tooltip title="Nguồn đơn hàng">{i.source}</Tooltip>
                </div>
              )}
            </React.Fragment>
          );
        },
        visible: true,
        fixed: "left",
        className: "custom-shadow-td",
        width: 115,
      },
      {
        title: "Khách hàng",
        render: (record: OrderModel) => (
          <div className="customer custom-td">
            <div className="name p-b-3" style={{ color: "#2A2A86" }}>
              <Link
                target="_blank"
                to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
                className="primary">
                {record.customer}
              </Link>{" "}
            </div>
            {/* <div className="p-b-3">{record.shipping_address.phone}</div>
						<div className="p-b-3">{record.shipping_address.full_address}</div> */}
            {record.customer_phone_number && (
              <div className="p-b-3">
                <a href={`tel:${record.customer_phone_number}`}>{record.customer_phone_number}</a>
              </div>
            )}
            <div className="p-b-3">{renderShippingAddress(record)}</div>
          </div>
        ),
        key: "customer",
        visible: true,
        width: 130,
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
                  <div className="item custom-td" key={item.variant_id}>
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

                        {item?.discount_items && item.discount_items[0]?.value ? (
                          <Tooltip title="Khuyến mại sản phẩm">
                            <div className="itemDiscount" style={{ color: dangerColor }}>
                              <span> - {formatCurrency(item.discount_items[0].value)}</span>
                            </div>
                          </Tooltip>
                        ) : null}
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
      // {
      //   title: "Kho cửa hàng",
      //   dataIndex: "store",
      //   key: "store",
      //   visible: true,
      //   align: "center",
      // },
      {
        title: "Thành tiền",
        // dataIndex: "",
        render: (record: any) => (
          <React.Fragment>
            <Tooltip title="Thành tiền">
              <NumberFormat
                value={record.total}
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
        render: (value: string, record: OrderModel) => {
          return <React.Fragment>{renderOrderPayments(record)}</React.Fragment>;
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
          const sortedFulfillments = record.fulfillments?.sort((a: any, b: any) => b.id - a.id);
          if (isOrderFromPOS(record)) {
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
                <img src={iconShippingFeePay3PL} alt="" className="iconShipping" />
                Đã hủy vận chuyển
              </div>
            );
          }
          if (sortedFulfillments) {
            if (sortedFulfillments[0]?.shipment) {
              switch (sortedFulfillments[0]?.shipment?.delivery_service_provider_type) {
                case ShipmentMethod.EXTERNAL_SERVICE:
                  const thirdPLId = sortedFulfillments[0]?.shipment?.delivery_service_provider_id;
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
                                {formatCurrency(
                                  sortedFulfillments[0]?.status !== FulFillmentStatus.CANCELLED
                                    ? sortedFulfillments[0]?.shipment
                                        .shipping_fee_informed_to_customer || 0
                                    : 0
                                )}
                              </span>
                            </div>
                          </Tooltip>

                          <Tooltip title="Phí vận chuyển">
                            <div className="single">
                              <img src={iconShippingFeePay3PL} alt="" className="iconShipping" />
                              {formatCurrency(
                                sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0
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
                        {sortedFulfillments[0]?.shipment?.service === "4h_delivery"
                          ? "Đơn giao 4H"
                          : "Đơn giao thường"}
                        {" - "}
                        <span style={{ color: primaryColor }}>
                          {sortedFulfillments[0]?.shipment?.shipper_code}-
                          {sortedFulfillments[0]?.shipment?.shipper_name}
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
                          <span>
                            {formatCurrency(
                              sortedFulfillments[0]?.shipment?.shipping_fee_informed_to_customer || 0
                            )}
                          </span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img src={iconShippingFeePay3PL} alt="" />
                          {formatCurrency(
                            sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0
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
                        <Link target="_blank" to={`${UrlConfig.STORE}/${record?.store_id}`}>
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
                          <img src={iconShippingFeeInformedToCustomer} alt="" />
                          <span>
                            {formatCurrency(
                              sortedFulfillments[0]?.shipment?.shipping_fee_informed_to_customer || 0
                            )}
                          </span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img src={iconShippingFeePay3PL} alt="" />
                          {formatCurrency(
                            sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0
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
                          <img src={iconShippingFeeInformedToCustomer} alt="" />
                          <span>
                            {formatCurrency(
                              sortedFulfillments[0]?.shipment?.shipping_fee_informed_to_customer || 0
                            )}
                          </span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img src={iconShippingFeePay3PL} alt="" />
                          {formatCurrency(
                            sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0
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
                          <img src={iconShippingFeeInformedToCustomer} alt="" />
                          <span>
                            {formatCurrency(
                              sortedFulfillments[0]?.shipment.shipping_fee_informed_to_customer || 0
                            )}
                          </span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img src={iconShippingFeePay3PL} alt="" />
                          {formatCurrency(
                            sortedFulfillments[0]?.shipment.shipping_fee_paid_to_three_pls || 0
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
        width: 110,
        align: "left",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        className: "orderStatus",
        render: (value: string, record: OrderModel) => {
          if (!record || !status_order) {
            return null;
          }
          const status = status_order.find((status) => status.value === record.status);
          return (
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
          );
        },
        visible: true,
        align: "left",
        width: 120,
      },
      {
        title: "Tổng SLSP",
        dataIndex: "total_quantity",
        key: "total_quantity",
        visible: true,
        align: "center",
        width: 80,
      },
      {
        title: "Ghi chú",
        className: "notes",
        render: (value: string, record: OrderModel) => (
          <div className="orderNotes">
            <div className="inner">
              <div className="single">
                <EditNote
                  note={record.customer_note}
                  title="Khách hàng: "
                  color={primaryColor}
                  onOk={(newNote) => {
                    console.log("newNote", newNote);
                    editNote(newNote, "customer_note", record.id);
                  }}
                  isDisable={record.status === OrderStatus.FINISHED}
                />
              </div>
              <div className="single">
                <EditNote
                  note={record.note}
                  title="Nội bộ: "
                  color={primaryColor}
                  onOk={(newNote) => {
                    console.log("newNote", newNote);
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
        title: "NV bán hàng",
        render: (value, record: OrderModel) => (
          <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.assignee_code}`}>
            {`${record.assignee_code} - ${record.assignee}`}
          </Link>
        ),
        key: "assignee",
        visible: true,
        align: "center",
        width: 130,
      },
      {
        title: "NV tạo đơn",
        render: (value, record: OrderModel) => (
          <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}>
            {`${record.account_code} - ${record.account}`}
          </Link>
        ),
        key: "account",
        visible: true,
        align: "center",
        width: 130,
      },
      {
        title: "Biên bản bàn giao",
        dataIndex: "Biên bản bàn giao",
        key: "Biên bản bàn giao",
        render: (value) => null,
        visible: true,
        width: 160,
      },
      {
        title: "Mã Afilliate",
        dataIndex: "Mã Afilliate",
        key: "Mã Afilliate",
        render: (value) => null,
        visible: true,
        width: 160,
      },
      {
        title: "Ghi chú hóa đơn",
        dataIndex: "Ghi chú hóa đơn",
        key: "Ghi chú hóa đơn",
        render: (value) => null,
        visible: true,
        width: 190,
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
        width: 120,
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
              <Link to={`${UrlConfig.ORDER}/${record.linked_order_code}`} target="_blank">
                {record?.linked_order_code}
              </Link>
            );
          } else {
            result = value;
          }
          return result;
        },
        visible: true,
        width: 120,
      },
    ];
  }, [deliveryServices, editNote, renderOrderPayments, status_order]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const rowSelectionRenderCell = (
    checked: boolean,
    record: OrderModel,
    index: number,
    originNode: ReactNode
  ) => {
    return (
      <React.Fragment>
        {originNode}
        <div className="orderSource">{renderOrderSource(record)}</div>
      </React.Fragment>
    );
  };

  const getTotalQuantity = () => {
    let result = 0;
    data.items.forEach((item) => {
      result = result + item.total_quantity;
    });
    return result;
  };

  const getTotalAmount = () => {
    let result = 0;
    data.items.forEach((item) => {
      result = result + item.total;
    });
    return result;
  };

  const getPaymentItem = (item: OrderModel) => {
    let result = 0;
    item.payments.forEach((single) => {
      result = result + single.amount;
    });
    return result;
  };

  const getTotalPayment = () => {
    let result = 0;
    data.items.forEach((item) => {
      let itemPayment = getPaymentItem(item);
      result = result + itemPayment;
    });
    return result;
  };

  const getTotalShippingFeeInformedToCustomer = () => {
    let result = 0;
    data.items.forEach((item) => {
      const sortedFulfillments = item.fulfillments?.sort((a: any, b: any) => b.id - a.id);
      if (sortedFulfillments && sortedFulfillments[0]?.status !== FulFillmentStatus.CANCELLED) {
        result = result + (sortedFulfillments[0]?.shipment?.shipping_fee_informed_to_customer || 0);
      }
    });
    return result;
  };

	const getTotalShippingPay3PL = () => {
    let result = 0;
    data.items.forEach((item) => {
      const sortedFulfillments = item.fulfillments?.sort((a: any, b: any) => b.id - a.id);
      if (sortedFulfillments && sortedFulfillments[0]?.status !== FulFillmentStatus.CANCELLED) {
        result = result + (sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0);
      }
    });
    return result;
  };

  const renderFooter = () => {
    let html: ReactNode = null;
    if(data?.items.length > 0) {
      html = (
        <div className="tableFooter">
          <Row>
            <Col md={12}>
              <Row gutter={30}>
                <Col span={10}>
                  <p className="text-field">TỔNG SỐ LƯỢNG SẢN PHẨM:</p>
                </Col>
                <Col span={14}>
                  <b className="text-field">{formatCurrency(getTotalQuantity())}</b>
                </Col>
              </Row>
            </Col>
            <Col md={12}>
              <Row gutter={30}>
                <Col span={10}>
                  <p className="text-field">TỔNG TIỀN ĐƠN HÀNG:</p>
                </Col>
                <Col span={14}>
                  <b className="text-field">{formatCurrency(getTotalAmount())}</b>
                </Col>
              </Row>
            </Col>
            <Col md={12}>
              <Row gutter={30}>
                <Col span={10}>
                  <p className="text-field">TỔNG TIỀN THANH TOÁN:</p>
                </Col>
                <Col span={14}>
                  <div>
                    <b className="text-field">{formatCurrency(getTotalPayment())}</b>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col md={12}>
              <Row gutter={30}>
                <Col span={10}>
                  <p className="text-field">TỔNG VẬN CHUYỂN:</p>
                </Col>
                <Col span={14}>
                  <div>
                    <b className="text-field hasIcon">
                      <Tooltip title="Tổng phí ship báo khách">
                        <img src={iconShippingFeeInformedToCustomer} alt="" className="iconShippingFeeInformedToCustomer"/>
                        {formatCurrency(getTotalShippingFeeInformedToCustomer())}
                      </Tooltip>
                    </b>
                  </div>
                  <div>
                    <b className="text-field hasIcon">
                      <Tooltip title="Tổng phí vận chuyển">
                        <img src={iconShippingFeePay3PL} alt="" />
                        {formatCurrency(getTotalShippingPay3PL())}
                      </Tooltip>
                    </b>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      );
    }
    return html;
  };

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns, setColumns]);

  return (
    <StyledComponent>
      <CustomTable
        isRowSelection
        isLoading={tableLoading}
        showColumnSetting={true}
        scroll={{ x: (2400 * columnFinal.length) / (columns.length ? columns.length : 1) }}
        sticky={{ offsetScroll: 10, offsetHeader: 55 }}
        pagination={{
          pageSize: data.metadata?.limit,
          total: data.metadata?.total,
          current: data.metadata?.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        rowSelectionRenderCell={rowSelectionRenderCell}
        onSelectedChange={(selectedRows) => onSelectedChange(selectedRows)}
        onShowColumnSetting={() => setShowSettingColumn(true)}
        dataSource={data.items}
        columns={columnFinal}
        rowKey={(item: OrderModel) => item.id}
        className="order-list"
        footer={() => renderFooter()}
      />
    </StyledComponent>
  );
}
export default OrdersTable;
