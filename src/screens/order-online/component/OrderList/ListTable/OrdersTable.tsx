import { DownOutlined, EyeOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Input, Popover, Row, Select, Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  getListSubStatusAction,
  getTrackingLogFulfillmentAction,
  setSubStatusAction,
  updateOrderPartial,
} from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { AllInventoryProductInStore, InventoryVariantListQuery } from "model/inventory";
import { OrderExtraModel, OrderModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  DeliveryServiceResponse,
  OrderLineItemResponse,
  OrderPaymentResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { inventoryGetApi } from "service/inventory";
import {
  copyTextToClipboard,
  formatCurrency,
  getOrderTotalPaymentAmount,
  getTotalQuantity,
  getValidateChangeOrderSubStatus,
  handleFetchApiError,
  isFetchApiSuccessful,
  isNormalTypeVariantItem,
  isOrderFromPOS,
  isOrderFromSaleChannel,
  sortFulfillments,
} from "utils/AppUtils";
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
import { dangerColor, primaryColor, successColor } from "utils/global-styles/variables";
import { ORDER_SUB_STATUS } from "utils/OrderSubStatusUtils";
import { fullTextSearch } from "utils/StringUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import EditNote from "../../edit-note";
import TrackingLog from "../../TrackingLog/TrackingLog";
import IconFacebook from "./images/facebook.svg";
import iconShippingFeeInformedToCustomer from "./images/iconShippingFeeInformedToCustomer.svg";
import iconShippingFeePay3PL from "./images/iconShippingFeePay3PL.svg";
import IconTrackingCode from "./images/iconTrackingCode.svg";
import iconWeight from "./images/iconWeight.svg";
import IconPaymentBank from "./images/paymentBank.svg";
import IconPaymentCard from "./images/paymentCard.svg";
import IconPaymentCod from "./images/paymentCod.svg";
import IconPaymentCash from "./images/paymentMoney.svg";
import IconPaymentPoint from "./images/paymentPoint.svg";
import IconShopee from "./images/shopee.svg";
import IconStore from "./images/store.svg";
import InventoryTable from "./InventoryTable";
import search from "assets/img/search.svg";
// import IconWebsite from "./images/website.svg"; 
import { nameQuantityWidth, StyledComponent } from "./OrdersTable.styles";
// import { display } from "html2canvas/dist/types/css/property-descriptors/display";
// import 'assets/css/_sale-order.scss';
import iconReturn from "assets/icon/return.svg";
import copyFileBtn from "assets/icon/copyfile_btn.svg";

type PropTypes = {
  tableLoading: boolean;
  data: PageResponse<OrderModel>;
  columns: ICustomTableColumType<OrderModel>[];
  deliveryServices: DeliveryServiceResponse[];
  selectedRowKeys: number[];
  listStore: Array<StoreResponse> | undefined;
  setColumns: (columns: ICustomTableColumType<OrderModel>[]) => void;
  setData: (data: PageResponse<OrderModel>) => void;
  onPageChange: (page: any, size: any) => void;
  onSelectedChange: (selectedRows: any[], selected?: boolean, changeRow?: any[]) => void;
  setShowSettingColumn: (value: boolean) => void;
  onFilterPhoneCustomer: (value: string) => void;
};

type dataExtra = PageResponse<OrderExtraModel>;

let itemResult:OrderModel[] = []

function OrdersTable(props: PropTypes) {
  const {
    tableLoading,
    data,
    columns,
    deliveryServices,
    selectedRowKeys,
    listStore,
    onPageChange,
    onSelectedChange,
    setShowSettingColumn,
    setColumns,
    setData,
    onFilterPhoneCustomer,
  } = props;

  const dispatch = useDispatch();
  // const history = useHistory();
  const status_order = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.order_status
  );

  const type = {
    trackingCode: "trackingCode",
    subStatus: "subStatus",
    setSubStatus: "setSubStatus",
  };
  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);

  const [typeAPi, setTypeAPi] = useState("");

  const [items, setItems] = useState(data.items);
  // const [isVisiblePopup, setIsVisiblePopup] =
  // useState(false);

  // console.log('isVisiblePopup', isVisiblePopup)

  itemResult = data.items;

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
      const indexOrder = itemResult.findIndex((item: any) => item.id === orderID);
      if (indexOrder > -1) {
        if (noteType === "note") {
          itemResult[indexOrder].note = newNote;
        } else if (noteType === "customer_note") {
          itemResult[indexOrder].customer_note = newNote;
        }
      }
      setItems(itemResult);
    },
    []
  );

  const editNote = useCallback(
    (newNote, noteType, orderID, record: OrderModel) => {
      let params: any = {};
      if (noteType === "note") {
        params.note = newNote;
      }
      if (noteType === "customer_note") {
        params.customer_note = newNote;
      }
      dispatch(
        updateOrderPartial(params, orderID, () => onSuccessEditNote(newNote, noteType, orderID, ))
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
              <img src={IconFacebook} alt="" />
            </Tooltip>
          );
          break;
        default:
          break;
      }
    }
    return html;
  };

  const renderOrderTotalPayment = (payments: OrderPaymentResponse[]) => {
    return (
      <div className="orderTotalPaymentAmount">
        <Tooltip title="Tổng tiền thanh toán">
          {formatCurrency(getOrderTotalPaymentAmount(payments))}
        </Tooltip>
      </div>
    );
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderOrderPaymentMethods = (orderDetail: OrderModel) => {
    let html = null;
    html = orderDetail.payments.map((payment) => {
      // if (!payment.amount) {
      //   return null;
      // }
      let selectedPayment = paymentIcons.find(
        (single) => single.payment_method_code === payment.payment_method_code
      );
      return (
        <div className={`singlePayment ${payment.payment_method_code === PaymentMethodCode.POINT ? 'ydPoint' : null}`}>
          {payment.amount < 0 ? (
            <Tooltip title="Hoàn tiền">
              <img src={selectedPayment?.icon} alt="" />
              <span className="amount">{formatCurrency(payment.amount)}</span>
            </Tooltip>
          ) : (
            <Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
              <img src={selectedPayment?.icon} alt="" />
              <span className="amount">{formatCurrency(payment.amount)}</span>
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
          {renderOrderTotalPayment(orderDetail.payments)}
          {renderOrderPaymentMethods(orderDetail)}
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
    const addressArr = [
      shippingAddress.name,
      shippingAddress.phone,
      shippingAddress.full_address,
      shippingAddress.ward,
      shippingAddress.district,
      shippingAddress.city,
    ];
    const addressArrResult = addressArr.filter((address) => address);
    if (addressArrResult.length > 0) {
      result = addressArrResult.join(" -- ");
    }
    return <React.Fragment>{result}</React.Fragment>;
  };

  const renderTag = (record: OrderModel) => {
    let html = null;
    if (record?.tags) {
      const tagsArr = record?.tags.split(",");
      if (tagsArr.length > 0) {
        html = tagsArr.map((tag, index) => (
          <div key={index}>
            <span className="textSmall">{tag}</span>
          </div>
        ))
      }
    }
    return html
  };

  const renderTrackingCode = (trackingCode?: string) => {
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
    return (
      <span
        onClick={(e) => {
          if (html) {
            copyTextToClipboard(e, html);
            showSuccess("Đã copy mã vận đơn!");
          }
        }}>
        {html}
      </span>
    );
  };

  const renderOrderTrackingLog = (record: OrderExtraModel) => {
    // let html: ReactNode= "aaaaaaaaaa";
    // if(!trackingLogFulfillment) {
    //   return html;
    // }
    if (!record?.fulfillments || !record.isShowTrackingLog) {
      return;
    }
    const trackingLogFulfillment = record?.trackingLog;
    const sortedFulfillments = sortFulfillments(record?.fulfillments);
    const trackingCode = sortedFulfillments[0]?.shipment?.tracking_code;
    if (!trackingCode) {
      return " Không có mã vận đơn!";
    }
    if (!trackingLogFulfillment) {
      return " Không có log tiến trình đơn hàng!";
    }
    let html = null;
    if (trackingLogFulfillment) {
      html = (
        <TrackingLog trackingLogFulfillment={trackingLogFulfillment} trackingCode={trackingCode} />
      );
    }
    return html;
  };

  const initColumns: ICustomTableColumType<OrderModel>[] = useMemo(() => {
    if (data.items.length === 0) {
      return [];
    }
    return [
      {
        title: "ID đơn hàng",
        dataIndex: "code",
        key: "code",
        render: (value: string, i: OrderModel) => {
          return (
            <React.Fragment>
              <div>
                <Link to={`${UrlConfig.ORDER}/${i.id}`} style={{ fontWeight: 500 }}>
                  {value}
                </Link>
                <Tooltip title="Click để copy">
                  <img
                    onClick={(e) => {
                      copyTextToClipboard(e, i.code.toString())
                      showSuccess("Đã copy mã đơn hàng!")
                    }}
                    src={copyFileBtn}
                    alt=""
                    style={{ width: 18, cursor: "pointer" }}
                  />
                </Tooltip>
              </div>
              <div className="textSmall">{moment(i.created_date).format(DATE_FORMAT.fullDate)}</div>
              <div className="textSmall">
                <Tooltip title="Cửa hàng">
                  <Link to={`${UrlConfig.STORE}/${i?.store_id}`}>
                    {i.store}
                  </Link>
                </Tooltip>
              </div>
              <div className="textSmall single">
                <Tooltip title="Nguồn">{i.source}</Tooltip>
              </div>
              {i.source && (
                <div className="textSmall single">
                  <Tooltip title="Nhân viên bán hàng">{i.assignee}</Tooltip>
                </div>
              )}
              <div className="textSmall single">
                <strong>Tổng SP: {getTotalQuantity(i.items)}</strong>
              </div>
            </React.Fragment>
          );
        },
        visible: true,
        fixed: "left",
        className: "orderId custom-shadow-td",
        width: 90,
      },
      {
        title: "Khách hàng",
        render: (record: OrderModel) => (
          <div className="customer custom-td">
            {record.customer_phone_number && (
              <div style={{ color: "#2A2A86" ,display:"flex" }}>
                <div
                  style={{ padding: "0px", fontWeight: 500, cursor: "pointer", fontSize: "0.9em" }}
                  onClick={() => {
                    onFilterPhoneCustomer(
                      record.customer_phone_number ? record.customer_phone_number : ""
                    );
                  }
                  }>
                  {record.customer_phone_number}
                  <Tooltip title="Click để copy">
                    <img
                      onClick={(e) => {
                        copyTextToClipboard(e, (record?.customer_phone_number || "").toString())
                        showSuccess("Đã copy số điện thoại!")
                      }}
                      src={copyFileBtn}
                      alt=""
                      style={{ width: 18, cursor: "pointer" }}
                    />
                  </Tooltip>
                 
                </div>
                <Popover placement="bottomLeft" content={
                  <div className="poppver-to-fast">
                    <Button 
                      className="btn-to-fast" 
                      style={{padding: "0px", display:"block", height:"30px"}} 
                      type="link" 
                      icon={<img src={search} alt="" style={{paddingRight:"18px"}}/> }
                      onClick={() =>
                        onFilterPhoneCustomer(
                          record.customer_phone_number ? record.customer_phone_number : ""
                        )
                      }
                    >
                      Lọc đơn của khách
                    </Button>
                    <Button className="btn-to-fast"
                      style={{padding: "0px", display:"block", height:"30px"}}
                      type="link"
                       icon={<EyeOutlined style={{paddingRight:"10px"}} /> } 
                      onClick={()=>{
                        let pathname = `${process.env.PUBLIC_URL}${UrlConfig.CUSTOMER}/${record.customer_id}`;
                        window.open(pathname,"_blank");
                      }}
                    >
                      Thông tin khách hàng
                    </Button>
                    <Button
                     className="btn-to-fast" 
                     style={{padding: "0px", display:"block", height:"30px"}} 
                     type="link" 
                     icon={<PlusOutlined style={{paddingRight:"10px"}}/> } 
                     onClick={()=>{
                       let pathname = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/create?customer=${record.customer_id}`;
                       window.open(pathname,"_blank");
                    }}
                    >
                      Tạo đơn cho khách
                    </Button>
                    <Button 
                      className="btn-to-fast" 
                      style={{padding: "0px", display:"block", height:"30px"}} 
                      type="link" 
                      icon={<PhoneOutlined style={{paddingRight:"10px"}}/>} 
                      onClick={()=>{
                        window.location.href=`tel:${record.customer_phone_number}`;
                      }}
                    >
                      Gọi điện cho khách
                    </Button>
                  </div>
                } trigger="click">
                  <Button type="link" style={{ width: "25px", padding: "0px", paddingTop:2}} icon={<DownOutlined style={{fontSize:"12px"}}/>}></Button>
                </Popover>
                {/* <Button  type="link" onClick={()=>{
                    onFilterPhoneCustomer(record.customer_phone_number)
                  }}>{record.customer_phone_number}</Button> */}
              </div>
            )}
            <div className="name" style={{ color: "#2A2A86" }}>
              <Link
                target="_blank"
                to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
                className="primary">
                {record.customer}
              </Link>{" "}

            </div>
            {/* <div className="p-b-3">{record.shipping_address.phone}</div>
						<div className="p-b-3">{record.shipping_address.full_address}</div> */}
            <div className="textSmall">{renderShippingAddress(record)}</div>
            {record?.tags?.length && record?.tags?.length > 0 ? (
              <div className="customTags">
                {renderTag(record)}
              </div>
            ) : null}
          </div>
        ),
        key: "customer",
        visible: true,
        width: 100,
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
                          to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}>
                          {item.sku}
                        </Link>
                        <br />
                        <div className="productNameText textSmall" title={item.variant}>
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
        width: nameQuantityWidth - 80,
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
        width: 70,
      },
      {
        title: "Thanh toán",
        dataIndex: "payment_status",
        key: "payment_status",
        render: (value: string, record: OrderModel) => {
          return <React.Fragment>{renderOrderPayments(record)}</React.Fragment>;
        },
        visible: true,
        align: "right",
        width: 75,
      },
      {
        title: "Vận chuyển",
        key: "shipment.type",
        className: "shipmentType",
        render: (value: string, record: OrderExtraModel) => {
          if (!record?.fulfillments) {
            return "";
          }
          const sortedFulfillments = sortFulfillments(record?.fulfillments);
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
          // if (
          //   record?.fulfillments &&
          //   record.fulfillments[0]?.status === FulFillmentStatus.CANCELLED
          // ) {
          //   return (
          //     <div className="single">
          //       <img src={iconShippingFeePay3PL} alt="" className="iconShipping" />
          //       Đã hủy vận chuyển
          //     </div>
          //   );
          // }
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

                          {sortedFulfillments[0]?.shipment?.tracking_code ? (
                            <Tooltip title="Mã vận đơn">
                              <div className="single trackingCode">
                                {/* <div
                                  onClick={(e) => {
                                    if (sortedFulfillments[0]?.shipment?.tracking_code) {
                                      copyTextToClipboard(
                                        e,
                                        sortedFulfillments[0]?.shipment?.tracking_code
                                      );
                                      showSuccess("Đã copy mã vận đơn!")
                                    }
                                  }}>
                                  {sortedFulfillments[0]?.shipment?.tracking_code}
                                </div> */}
                                {renderTrackingCode(sortedFulfillments[0]?.shipment?.tracking_code)}
                              </div>
                            </Tooltip>
                          ) : null}

                          {sortedFulfillments[0].code ? (
                            <div className="single">
                              {/* <FileTextOutlined  color="red"
                                      onClick={() => {
                                        if(!sortedFulfillments[0].code) {
                                          return;
                                        }
                                        setSelectedOrder(record)
                                        dispatch(
                                          getTrackingLogFulfillmentAction(
                                            sortedFulfillments[0].code,
                                            (data => {
                                              setTrackingLogFulfillment(data)
                                              setRerender((prev) => prev+1)
                                            })
                                          )
                                        );
                                      }} 
                                    /> */}
                              {true && (
                                <Popover
                                  placement="left"
                                  content={renderOrderTrackingLog(record)}
                                  // visible={isVisiblePopup}
                                  trigger="click">
                                  <Tooltip title="Tiến trình giao hàng">
                                    <img
                                      src={IconTrackingCode}
                                      alt=""
                                      className="trackingCodeImg"
                                      onClick={() => {
                                        // if(!sortedFulfillments[0].code) {
                                        //   return;
                                        // }
                                        setTypeAPi(type.trackingCode);
                                        setSelectedOrder(record);
                                        // dispatch(
                                        //   getTrackingLogFulfillmentAction(
                                        //     sortedFulfillments[0].code,
                                        //     (data => {
                                        //       setTrackingLogFulfillment(data)

                                        //     })
                                        //   )
                                        // );
                                      }}
                                    />
                                  </Tooltip>
                                </Popover>
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
                              sortedFulfillments[0]?.shipment?.shipping_fee_informed_to_customer ||
                              0
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
                        <strong className="textSmall">
                          Nhận tại {" - "}
                        </strong>
                        <Link to={`${UrlConfig.STORE}/${record?.store_id}`}>
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
                              sortedFulfillments[0]?.shipment?.shipping_fee_informed_to_customer ||
                              0
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
                              sortedFulfillments[0]?.shipment?.shipping_fee_informed_to_customer ||
                              0
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
        width: 80,
        align: "left",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        className: "orderStatus",
        render: (value: string, record: OrderExtraModel) => {
          if (!record || !status_order) {
            return null;
          }
          const status = status_order.find((status) => status.value === record.status);
          let recordStatuses = record?.statuses;
          if (!recordStatuses) {
            recordStatuses = [];
          }
          let selected = record.sub_status_code ? record.sub_status_code : "finished";
          if (!recordStatuses.some((single) => single.code === selected)) {
            recordStatuses.push({
              name: record.sub_status,
              code: record.sub_status_code,
            });
          }
          let className = record.sub_status_code === ORDER_SUB_STATUS.fourHour_delivery ? "fourHour_delivery" : record.sub_status_code ? record.sub_status_code : "";
          return (
            <div className="orderStatus">
              <div className="inner">
                <div className="single">
                  <div>
                    <strong>Xử lý đơn: </strong>
                  </div>

                  {/* {record.sub_status ? record.sub_status : "-"} */}
                  {record.sub_status_code ? (
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Chọn trạng thái xử lý đơn"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent="Không tìm thấy trạng thái xử lý đơn"
                      value={selected}
                      onClick={() => {
                        setTypeAPi(type.subStatus);
                        setSelectedOrder(record);
                      }}
                      className={className}
                      onChange={(value) => {
                        if (selected !== ORDER_SUB_STATUS.require_warehouse_change && value === ORDER_SUB_STATUS.require_warehouse_change) {
                          showError("Vui lòng vào chi tiết đơn chọn lý do đổi kho hàng!")
                          return;
                        }
                        let isChange = isOrderFromSaleChannel(selectedOrder) ? true : getValidateChangeOrderSubStatus(record, value);
                        if (!isChange) {
                          return;
                        }
                        dispatch(
                          setSubStatusAction(record.id, value, () => {
                            const index = data.items?.findIndex(
                              (single) => single.id === record.id
                            );
                            if (index > -1) {
                              let dataResult: dataExtra = { ...data };
                              // selected = value;
                              dataResult.items[index].sub_status_code = value;
                              dataResult.items[index].sub_status = recordStatuses?.find(
                                (single) => single.code === value
                              )?.name;
                              setData(dataResult);
                            }
                          })
                        );
                      }}>
                      {recordStatuses &&
                        recordStatuses.map((single: any, index: number) => {
                          return (
                            <Select.Option value={single.code} key={index}>
                              {single.name}
                            </Select.Option>
                          );
                        })}
                    </Select>
                  ) : "-"}
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
                        color: successColor,
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
        width: 95,
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
                    editNote(newNote, "customer_note", record.id, record);
                  }}
                // isDisable={record.status === OrderStatus.FINISHED}
                />
              </div>
              <div className="single">
                <EditNote
                  note={record.note}
                  title="Nội bộ: "
                  color={primaryColor}
                  onOk={(newNote) => {
                    editNote(newNote, "note", record.id, record);
                  }}
                // isDisable={record.status === OrderStatus.FINISHED}
                />
              </div>
            </div>
          </div>
        ),
        key: "note",
        visible: true,
        align: "left",
        width: 120,
      },
      {
        title: "NV bán hàng",
        render: (value, record: OrderModel) => (
          <Link to={`${UrlConfig.ACCOUNTS}/${record.assignee_code}`}>
            {`${record.assignee_code} - ${record.assignee}`}
          </Link>
        ),
        key: "assignee",
        visible: true,
        align: "center",
        width: 80,
      },
      {
        title: "NV tạo đơn",
        render: (value, record: OrderModel) => (
          <Link to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}>
            {`${record.account_code} - ${record.account}`}
          </Link>
        ),
        key: "account",
        visible: true,
        align: "center",
        width: 80,
      },
      {
        title: "Biên bản bàn giao",
        dataIndex: "goods_receipt_id",
        key: "goods_receipt_id",
        align: "center",
        render: (value, record: OrderModel) => {
          if (value) {
            return (
              <Link to={`${UrlConfig.PACK_SUPPORT}/${value}`}>
                {value}
              </Link>
            );
          } else {
            return "-";
          }
        },
        visible: false,
        width: 160,
      },
      {
        title: "Mã Afilliate",
        dataIndex: "Mã Afilliate",
        key: "Mã Afilliate",
        render: (value) => null,
        visible: false,
        width: 160,
      },
      {
        title: "Ghi chú hóa đơn",
        dataIndex: "Ghi chú hóa đơn",
        key: "Ghi chú hóa đơn",
        render: (value) => null,
        visible: false,
        width: 190,
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
        visible: false,
        width: 120,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.items.length, deliveryServices, editNote, status_order]);

  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const [inventoryData, setInventoryData] = useState<AllInventoryProductInStore[]>([]);
  const [storeInventory, setStoreInventory] = useState<StoreResponse[]>([]);

  const onSearchInventory = useCallback((value: string) => {
    let _item: StoreResponse[] | any = listStore?.filter(x => fullTextSearch(value.toLowerCase().trim(), x.name.toLowerCase()) === true);
    setStoreInventory(_item);
  }, [listStore]);

  const handleInventoryData = useCallback((
    variantIds: number[],
  ) => {
    if (listStore) setStoreInventory([...listStore]);
    let inventoryQuery: InventoryVariantListQuery = {
      is_detail: true,
      variant_ids: variantIds,
      store_ids: listStore?.map((p) => p.id)
    }

    inventoryGetApi(inventoryQuery).then((response) => {
      if (isFetchApiSuccessful(response)) {
        console.log(response)

        setInventoryData(response.data);

      } else {
        handleFetchApiError(response, "Danh sách tồn kho", dispatch)
      }
    })
      .catch((e) => {
        console.log(e)
      })
  }, [dispatch, listStore]);

  const renderActionButton = (record: OrderModel) => {
    return (
      <div>
        <Tooltip title="Đổi trả hàng">
          <Link
            to={`${UrlConfig.ORDERS_RETURN}/create?orderID=${record.id}`}
          >
            <img alt="" src={iconReturn} className="iconReturn"/>
          </Link>
        </Tooltip>
      </div>
    );
  };

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
        <div>
          <Tooltip title="Kiểm tra tồn kho">
            <Popover
              placement="right"
              overlayStyle={{ zIndex: 1000, top: "150px" }}
              title={
                <Row
                  justify="space-between"
                  align="middle"
                  style={{ width: "100%" }}
                >
                  <Input.Search
                    placeholder="Tìm kiếm kho"
                    allowClear
                    onSearch={onSearchInventory}
                  />
                </Row>
              }
              content={<InventoryTable
                inventoryData={inventoryData}
                storeId={record.store_id || 0}
                items={record.items}
                listStore={storeInventory}
              />
              }
              trigger="click"
              onVisibleChange={(visible) => { visible === true && (handleInventoryData(record.items.map((p) => p.variant_id))) }}
            >
              <Button type="link" className="checkInventoryButton" icon={<EyeOutlined style={{ color: "rgb(252, 175, 23)" }} />} style={{ padding: 0 }}></Button>
            </Popover>
          </Tooltip>
        </div>
        {renderActionButton(record)}
      </React.Fragment>
    );
  };

  const getTotalQuantityPerPage = () => {
    let result = 0;
    data.items.forEach((item) => {
      let eachItemQuantity = 0;
      item.items.forEach((single) => {
        if (isNormalTypeVariantItem(single)) {
          eachItemQuantity = eachItemQuantity + single.quantity;
        }
      });
      result = result + eachItemQuantity;
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

  // - Doanh số = Tổng giá trị hóa đơn bán - Tổng giá trị hóa đơn trả hàng.
  // - Doanh thu = Doanh số - Chiết khấu - Sử dụng điểm. 
  // - Do total đã trừ chiết khấu nên Doanh thu = Tổng giá trị hóa đơn bán - Tổng giá trị hóa đơn trả hàng - Sử dụng điểm
  const getTotalRevenue = () => {
    let result = 0;
    data.items.forEach((item) => {
      let returnAmount = 0;
      let pointAmount = 0;
      item.payments.forEach((single) => {
        if(single.payment_method === "Hàng đổi") {
          returnAmount = returnAmount + single.amount;
        }
        if(single.payment_method_code === PaymentMethodCode.POINT) {
          pointAmount = pointAmount + single.amount;
        }
      });
      result = result + (item.total - returnAmount - pointAmount)
    });
    return result;
  };

  const getTotalShippingFeeInformedToCustomer = () => {
    let result = 0;
    data.items.forEach((item) => {
      const sortedFulfillments = item?.fulfillments ? sortFulfillments(item.fulfillments) : [];
      if (sortedFulfillments[0]?.status && sortedFulfillments[0]?.status !== FulFillmentStatus.CANCELLED) {
        result = result + (sortedFulfillments[0]?.shipment?.shipping_fee_informed_to_customer || 0);
      }
    });
    return result;
  };

  const getTotalShippingPay3PL = () => {
    let result = 0;
    data.items.forEach((item) => {
      const sortedFulfillments = item?.fulfillments ? sortFulfillments(item.fulfillments) : [];
      if (sortedFulfillments[0]?.status && sortedFulfillments[0]?.status !== FulFillmentStatus.CANCELLED) {
        result = result + (sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0);
      }
    });
    return result;
  };

  const renderFooter = () => {
    let html: ReactNode = null;
    if (data?.items.length > 0) {
      html = (
        <div className="tableFooter">
          <Row>
            <Col md={12}>
              <Row gutter={30}>
                <Col span={10}>
                  <p className="text-field">TỔNG SỐ LƯỢNG SẢN PHẨM:</p>
                </Col>
                <Col span={14}>
                  <b className="text-field">{formatCurrency(getTotalQuantityPerPage())}</b>
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
                  <p className="text-field">TỔNG DOANH THU:</p>
                </Col>
                <Col span={14}>
                  <div>
                    <b className="text-field">{formatCurrency(getTotalRevenue())}</b>
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
                        <img
                          src={iconShippingFeeInformedToCustomer}
                          alt=""
                          className="iconShippingFeeInformedToCustomer"
                        />
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

  useEffect(() => {
    if (!data?.items) {
      return;
    }
    if (typeAPi === type.trackingCode) {
      if (selectedOrder && selectedOrder.fulfillments) {
        const sortedFulfillments = sortFulfillments(selectedOrder.fulfillments);
        if (!sortedFulfillments[0].code) {
          return;
        }
        dispatch(
          getTrackingLogFulfillmentAction(sortedFulfillments[0].code, (response) => {
            // setIsVisiblePopup(true)
            const index = data.items?.findIndex((single) => single.id === selectedOrder.id);
            if (index > -1) {
              let dataResult: dataExtra = { ...data };
              dataResult.items[index].trackingLog = response;
              dataResult.items[index].isShowTrackingLog = true;
              setData(dataResult);
            }
          })
        );
      }
    } else if (typeAPi === type.subStatus) {
      if (selectedOrder) {
        const orderId = selectedOrder.id;
        const statusCode = selectedOrder.status;
        if (!statusCode) {
          return;
        }
        if (orderId) {
          const listFulfillmentMapSubStatus = {
            packed: {
              fulfillmentStatus: "packed",
              subStatus: "packed",
            },
            finalized: {
              fulfillmentStatus: ORDER_SUB_STATUS.shipping,
              subStatus: ORDER_SUB_STATUS.shipping,
            },
          };
          let resultStatus = statusCode;
          if (statusCode) {
            if (statusCode === OrderStatus.FINALIZED && selectedOrder?.fulfillments && selectedOrder?.fulfillments?.length > 0) {
              const sortedFulfillments = sortFulfillments(selectedOrder?.fulfillments);
              switch (sortedFulfillments[0].status) {
                case listFulfillmentMapSubStatus.packed.fulfillmentStatus:
                  resultStatus = listFulfillmentMapSubStatus.packed.subStatus;
                  break;
                case listFulfillmentMapSubStatus.finalized.fulfillmentStatus:
                  resultStatus = listFulfillmentMapSubStatus.finalized.subStatus;
                  break;
                default:
                  break;
              }
            }
          }
          dispatch(showLoading())
          dispatch(
            getListSubStatusAction(resultStatus, (response) => {
              const index = data.items?.findIndex((single) => single.id === selectedOrder.id);
              if (index > -1) {
                let dataResult: dataExtra = { ...data };
                dataResult.items[index].statuses = response
                  .map((single) => {
                    return {
                      name: single.sub_status,
                      code: single.code,
                    };
                  });
                setData(dataResult);
                dispatch(hideLoading())
              }
            },
              () => dispatch(hideLoading())
            )
          );
        }
      }
    } else if (typeAPi === type.setSubStatus) {
    }
    //xóa data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedOrder, setData, type.subStatus, type.trackingCode, typeAPi]);

  useEffect(() => {
    setData({
      ...data, 
      items,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, setData])

  return (
    <StyledComponent>
      <CustomTable
        isRowSelection
        isLoading={tableLoading}
        showColumnSetting={true}
        scroll={{ x: (2200 * columnFinal.length) / (columns.length ? columns.length : 1) }}
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
        onSelectedChange={(selectedRows: any[], selected?: boolean, changeRow?: any[]) =>
          onSelectedChange(selectedRows, selected, changeRow)
        }
        onShowColumnSetting={() => setShowSettingColumn(true)}
        dataSource={data.items}
        columns={columnFinal}
        selectedRowKey={selectedRowKeys}
        rowKey={(item: OrderModel) => item.id}
        className="order-list"
        footer={() => renderFooter()}
        isShowPaginationAtHeader
        rowSelectionWidth = {30}
      />
    </StyledComponent>
  );
}
export default OrdersTable;
