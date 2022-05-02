import { DownOutlined, EyeOutlined, PhoneOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Input, Popover, Row, Select, Tooltip } from "antd";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import iconPrint from "assets/icon/Print.svg";
// import { display } from "html2canvas/dist/types/css/property-descriptors/display";
// import 'assets/css/_sale-order.scss';
import search from "assets/img/search.svg";
import SubStatusChange from "component/order/SubStatusChange/SubStatusChange";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  getTrackingLogFulfillmentAction, updateOrderPartial
} from "domain/actions/order/order.action";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { BaseMetadata, PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { AllInventoryProductInStore, InventoryVariantListQuery } from "model/inventory";
import { OrderExtraModel, OrderModel, OrderTypeModel } from "model/order/order.model";
import { FilterConfig } from "model/other";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import {
  DeliveryServiceResponse,
  OrderLineItemResponse, ShipmentResponse
} from "model/response/order/order.response";
import moment from "moment";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { inventoryGetApi } from "service/inventory";
import {
  checkIfFulfillmentCanceled,
  checkIfOrderCanBeReturned,
  copyTextToClipboard,
  formatCurrency,
  getOrderTotalPaymentAmount,
  getTotalQuantity, handleFetchApiError,
  isFetchApiSuccessful,
  isNormalTypeVariantItem,
  isOrderFromPOS, sortFulfillments
} from "utils/AppUtils";
import {
  COD, COLUMN_CONFIG_TYPE, DELIVERY_SERVICE_PROVIDER_CODE, FACEBOOK,
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  POS,
  ShipmentMethod,
  SHOPEE
} from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { dangerColor, primaryColor, yellowColor } from "utils/global-styles/variables";
import { ORDER_SUB_STATUS, ORDER_TYPES } from "utils/Order.constants";
import { fullTextSearch } from "utils/StringUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import ButtonCreateOrderReturn from "../../ButtonCreateOrderReturn";
import EditNote from "../../edit-note";
import TrackingLog from "../../TrackingLog/TrackingLog";
import IconPaymentBank from "./images/chuyen-khoan.svg";
import IconPaymentCod from "./images/cod.svg";
import IconFacebook from "./images/facebook.svg";
import iconShippingFeeInformedToCustomer from "./images/iconShippingFeeInformedToCustomer.svg";
import iconShippingFeePay3PL from "./images/iconShippingFeePay3PL.svg";
import IconTrackingCode from "./images/iconTrackingCode.svg";
import iconWeight from "./images/iconWeight.svg";
import IconPaymentCard from "./images/paymentCard.svg";
import IconPaymentPoint from "./images/paymentPoint.svg";
import IconShopee from "./images/shopee.svg";
import IconStore from "./images/store.svg";
import IconPaymentReturn from "./images/tien-hoan.svg";
import IconPaymentCash from "./images/tien-mat.svg";
import InventoryTable from "./InventoryTable";
// import IconWebsite from "./images/website.svg";
import { nameQuantityWidth, StyledComponent } from "./OrdersTable.styles";

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
  orderType: OrderTypeModel;
  tableColumnConfigs: FilterConfig[];
  subStatuses: OrderProcessingStatusModel[];
};

type dataExtra = PageResponse<OrderExtraModel>;

let itemResult:OrderModel[] = [];
let metadataResult:BaseMetadata = {
  limit: 0,
  page: 0,
  total: 0
};

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
    orderType,
    tableColumnConfigs,
    subStatuses,
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

  const [toSubStatusCode, setToSubStatusCode] = useState<string | undefined>(undefined);

  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);

  const [typeAPi, setTypeAPi] = useState("");

  const [items, setItems] = useState(data.items);
  const [metadata, setMetaData] = useState(data.metadata);
  // const [isVisiblePopup, setIsVisiblePopup] =
  // useState(false);

  // console.log('isVisiblePopup', isVisiblePopup)

  
  console.log('subStatuses', subStatuses)

  itemResult = data.items;
  metadataResult = data.metadata;

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
  ];
  const onSuccessEditNote = useCallback(
    (newNote, noteType, orderID) => {
      console.log('itemResult', itemResult)
      const indexOrder = itemResult.findIndex((item: any) => item.id === orderID);
      if (indexOrder > -1) {
        if (noteType === "note") {
          itemResult[indexOrder].note = newNote;
        } else if (noteType === "customer_note") {
          itemResult[indexOrder].customer_note = newNote;
        }
      }
      setItems(itemResult);
      setMetaData(metadataResult);
      setData({
        metadata: metadataResult,
        items: itemResult,
      })
    },
    [setData]
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
        <div className="orderSource actionButton">
          <Tooltip title="Đơn hàng tại quầy">
            <img src={IconStore} alt="" />
          </Tooltip>
        </div>
      );
    } else {
      switch (orderDetail.channel_id) {
        case SHOPEE.channel_id:
          html = (
            <div className="orderSource actionButton">
              <Tooltip title="Đơn hàng tại Shopee">
                <img src={IconShopee} alt="" />
              </Tooltip>
            </div>
          );
          break;
        case FACEBOOK.channel_id:
          html = (
            <div className="orderSource actionButton">
              <Tooltip title="Đơn hàng từ Facebook">
                <img src={IconFacebook} alt="" />
              </Tooltip>
            </div>
          );
          break;
        default:
          break;
      }
    }
    return html;
  };

  const renderOrderTotalPayment = useCallback(
    (orderDetail: OrderModel) => {
      const totalPayment = getOrderTotalPaymentAmount(orderDetail.payments);
      return (
        <React.Fragment>
          {/* <div className="orderTotalPaymentAmount">
            <Tooltip title="Tổng tiền thanh toán">
              {formatCurrency(totalPayment)}
            </Tooltip>
          </div> */}
          {orderType === ORDER_TYPES.online ? (
            <div className="orderTotalLeftAmount">
              <Tooltip title="Tiền còn thiếu">
                {formatCurrency(orderDetail.total - totalPayment)}
              </Tooltip>
            </div>
          ) : null}
        </React.Fragment>
      );
    },
    [orderType],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderOrderPaymentMethods = (orderDetail: OrderModel) => {
    let html = null;
    html = orderDetail.payments.map((payment) => {
      // if (!payment.amount) {
      //   return null;
      // }
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
        <div className={`singlePayment ${payment.payment_method_code === PaymentMethodCode.POINT ? 'ydPoint' : null}`} key={payment.id}>
          <Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
              <img src={selectedPayment?.icon} alt="" />
              <span className="amount">{formatCurrency(payment.paid_amount)}</span>
            </Tooltip>
        </div>
      );
    });
    return html;
  };

  const renderOrderReturn = useCallback(
    (orderDetail: OrderModel) => {
      let returnAmount = 0
      orderDetail.payments.forEach(payment => {
        if(payment.return_amount > 0) {
          returnAmount = returnAmount + payment.return_amount
        }
      })
      if(returnAmount > 0) {
        return (
          <Tooltip title={"Tiền hoàn lại"} className="singlePayment">
            <span className="amount" style={{color: yellowColor}}>
              {formatCurrency(returnAmount)}
            </span>
          </Tooltip>
        );
      }
      return null
    },
    []
  );

  const renderOrderPayments = useCallback(
    (orderDetail: OrderModel) => {
      return (
        <React.Fragment>
          {renderOrderTotalPayment(orderDetail)}
          {renderOrderPaymentMethods(orderDetail)}
          {renderOrderReturn(orderDetail)}
        </React.Fragment>
      );
    },
    [renderOrderPaymentMethods, renderOrderReturn, renderOrderTotalPayment]
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
        html = tagsArr.map((tag, index) => {
          if(tag) {
            return (
              <div key={index}>
                <span className="textSmall">{tag}</span>
              </div>

            )
          }
          return null
        })
      }
    }
    return html
  };

  const getLink = (providerCode: string, trackingCode: string) => {
    switch (providerCode) {
      case DELIVERY_SERVICE_PROVIDER_CODE.ghn:
        return `https://donhang.ghn.vn/?order_code=${trackingCode}`
      case DELIVERY_SERVICE_PROVIDER_CODE.ghtk:
        return `https://i.ghtk.vn/${trackingCode}`
      case DELIVERY_SERVICE_PROVIDER_CODE.vtp:
        return `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/`
      default:
        break;
    }
  };

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
    const linkText = shipment?.delivery_service_provider_code ? getLink(shipment.delivery_service_provider_code, trackingCode) : ""
    return (
      <span
        onClick={(e) => {
          if (html) {
            copyTextToClipboard(e, html);
            showSuccess("Đã copy mã vận đơn!");
          }
        }}>
        {linkText ? (
          <a href={linkText} target="_blank" title={linkText} rel="noreferrer">
            {html}
          </a>
        ) : html }
        <Tooltip title="Click để copy mã vận đơn">
          <img
            onClick={(e) => {
              copyTextToClipboard(e, html)
              showSuccess("Đã copy mã vận đơn!")
            }}
            src={copyFileBtn}
            alt=""
            style={{ width: 18, cursor: "pointer" }}
          />
        </Tooltip>
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

  const renderTypeIfOrderReturn = (order: OrderModel) => {
    if(order?.order_return_origin?.code) {
      return (
        <div title="Đơn có đổi trả" className="isReturn">
          <strong>[D]</strong>
        </div>
      )
    }
  };

  const changeSubStatusCallback = (value: string) => {
    const index = data.items?.findIndex(
      (single) => single.id === selectedOrder?.id
    );
    if (index > -1) {
      let dataResult: dataExtra = { ...data };
      // selected = value;
      dataResult.items[index].sub_status_code = value;
      dataResult.items[index].sub_status = subStatuses?.find(
        (single) => single.code === value
      )?.sub_status;
      setData(dataResult);
    }
  };

  const checkIfOrderCannotChangeToWarehouseChange = (orderDetail: OrderExtraModel) => {
    const checkIfOrderHasNoFFM = (orderDetail: OrderExtraModel) => {
      return (
        !orderDetail.fulfillments?.some(single => {
          return single.shipment && !checkIfFulfillmentCanceled(single)
        }
      ))
    }
    const checkIfOrderIsNew = (orderDetail: OrderExtraModel) => {
      return (
        orderDetail.sub_status_code === ORDER_SUB_STATUS.awaiting_coordinator_confirmation
      )
    }
    const checkIfOrderIsConfirm = (orderDetail: OrderExtraModel) => {
      return (
        orderDetail.sub_status_code === ORDER_SUB_STATUS.coordinator_confirming
      )
    }
    const checkIfOrderIsAwaitSaleConfirm= (orderDetail: OrderExtraModel) => {
      return (
        orderDetail.sub_status_code === ORDER_SUB_STATUS.awaiting_saler_confirmation
      )
    }
    return  (checkIfOrderIsNew(orderDetail) && checkIfOrderHasNoFFM(orderDetail)) || (checkIfOrderIsConfirm(orderDetail) && checkIfOrderHasNoFFM(orderDetail)) || (checkIfOrderIsAwaitSaleConfirm(orderDetail) && checkIfOrderHasNoFFM(orderDetail))
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
              {orderType === ORDER_TYPES.offline ? null : (
                <div className="textSmall single">
                  <Tooltip title="Nguồn">{i.source}</Tooltip>
                </div>
              )}
              { orderType === ORDER_TYPES.offline ? (
                <React.Fragment>
                  <div className="textSmall single mainColor">
                    <Tooltip title="Chuyên gia tư vấn">
                      <Link to={`${UrlConfig.ACCOUNTS}/${i.assignee_code}`}>
                        <strong>CGTV: </strong>{i.assignee}
                      </Link>
                    </Tooltip>
                  </div>
                  <div className="textSmall single mainColor">
                    <Tooltip title="Thu ngân">
                      <Link to={`${UrlConfig.ACCOUNTS}/${i.account_code}`}>
                        <strong>Thu ngân: </strong>{i.account}
                      </Link>
                    </Tooltip>
                  </div>
                </React.Fragment>
              ) :null}
              { orderType === ORDER_TYPES.online && i.source && (
                <div className="textSmall single">
                  <Tooltip title="Nhân viên bán hàng">{i.assignee}</Tooltip>
                </div>
              )}
              <div className="textSmall single">
                <strong>Tổng SP: {getTotalQuantity(i.items)}</strong>
              </div>
              {renderTypeIfOrderReturn(i)}
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
                  <div className="item custom-td" key={i}>
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
        title: "Chiết khấu",
        // dataIndex: "",
        render: (record: any) => (
          <React.Fragment>
            {record?.discounts && record.discounts[0] && record.discounts[0]?.amount ? (
              <React.Fragment>
                <div>
                  <span style={{ color: "#EF5B5B" }}>
                    <NumberFormat
                      value={record.discounts[0]?.amount}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </span>

                </div>
                <div className="textSmall">
                  <span style={{ color: "#EF5B5B" }}>
                    -{Math.round(record.discounts[0]?.amount * 100 / record.total_line_amount_after_line_discount * 100) / 100}%
                  </span>
                </div>

              </React.Fragment>
            ) : null}
          </React.Fragment>
        ),
        key: "customer.discount",
        visible: true,
        align: "right",
        width: 70,
      },
      {
        title: "Tổng tiền",
        // dataIndex: "",
        render: (record: any) => (
          <React.Fragment>
            <Tooltip title="Tổng tiền">
              <NumberFormat
                value={record.total}
                className="orderTotal"
                displayType={"text"}
                thousandSeparator={true}
              />
            </Tooltip>
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
                              {renderTrackingCode(sortedFulfillments[0]?.shipment)}
                            </div>
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
        visible: orderType === ORDER_TYPES.online,
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
          //const status = status_order.find((status) => status.value === record.status);
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
                  {subStatuses ? (
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Chọn trạng thái xử lý đơn"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      notFoundContent="Không tìm thấy trạng thái xử lý đơn"
                      value={record.sub_status_code}
                      onClick={() => {
                        setTypeAPi(type.subStatus);
                        setSelectedOrder(record);
                      }}
                      className={className}
                      onChange={(value) => {
                        if (value === ORDER_SUB_STATUS.require_warehouse_change && checkIfOrderCannotChangeToWarehouseChange(record)) {
                          showError("Bạn không thể đổi sang trạng thái khác!")
                          return;
                        }
                        if (selected !== ORDER_SUB_STATUS.require_warehouse_change && value === ORDER_SUB_STATUS.require_warehouse_change) {
                          showError("Vui lòng vào chi tiết đơn chọn lý do đổi kho hàng!")
                          return;
                        }
                        // let isChange = isOrderFromSaleChannel(selectedOrder) ? true : getValidateChangeOrderSubStatus(record, value);
                        // if (!isChange) {
                        //   return;
                        // }
                        setToSubStatusCode(value);
                      }}>
                      {subStatuses &&
                        subStatuses.map((single: any, index: number) => {
                          return (
                            <Select.Option value={single.code} key={index}>
                              {single.sub_status}
                            </Select.Option>
                          );
                        })}
                    </Select>
                  ) : "-"}
                </div>
                <div className="single">
                  <div className="coordinator-item">
                    <strong>NV điều phối: </strong>
                    {record.coordinator?(
                      <React.Fragment>
                        <Link to={`${UrlConfig.ACCOUNTS}/${record.coordinator_code}`} style={{ fontWeight: 500 }}>{record.coordinator_code}ssssss</Link>
                        <Link to={`${UrlConfig.ACCOUNTS}/${record.coordinator_code}`} style={{ fontWeight: 500 }}>{record.coordinator}ssssss</Link>
                      </React.Fragment>
                    ):"N/a"}
                  </div>
                  {/* {record.status === OrderStatus.DRAFT && (
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
                  )} */}
                </div>
              </div>
            </div>
          );
        },
        visible: orderType === ORDER_TYPES.online,
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
      // {
      //   title:"NV điều phối",
      //   key:"coordinator",
      //   visible: !isShowOfflineOrder,
      //   width: 80,
      //   align: "left",
      //   render: (value, record: OrderModel) => record.coordinator_code && (
      //     <Link to={`${UrlConfig.ACCOUNTS}/${record.coordinator_code}`}>
      //       {`${record.coordinator_code} - ${record.coordinator}`}
      //     </Link>
      //   ),
      // },
      {
        title: orderType === ORDER_TYPES.online ? "NV bán hàng" : "Chuyên gia tư vấn",
        render: (value, record: OrderModel) => (
          <Link to={`${UrlConfig.ACCOUNTS}/${record.assignee_code}`}>
            {`${record.assignee_code} - ${record.assignee}`}
          </Link>
        ),
        key: "assignee",
        visible: orderType === ORDER_TYPES.online,
        align: "center",
        width: 80,
      },
      {
        title: orderType === ORDER_TYPES.online ? "NV tạo đơn" : "Thu ngân",
        render: (value, record: OrderModel) => (
          <Link to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}>
            {`${record.account_code} - ${record.account}`}
          </Link>
        ),
        key: "account",
        visible: orderType === ORDER_TYPES.online,
        align: "center",
        width: 80,
      },
      {
        title: "Biên bản bàn giao",
        dataIndex: "goods_receipt_id",
        key: "goods_receipt_id",
        align: "center",
        render: (value, record: OrderModel) => {
          let result: ReactNode = (
            <span>-</span>
          );
          let arr = record.goods_receipts;
          if(arr && arr.length > 0) {
            result = arr.map((single, index) => {
              return (
                <React.Fragment key={index}>
                  <Link to={`${UrlConfig.DELIVERY_RECORDS}/${single.id}`}>
                    {single.id}
                  </Link>
                  {arr &&index < arr.length -1 && ", "}
                </React.Fragment>
              )
            })
          } 
          return result;
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
      <React.Fragment>
        {checkIfOrderCanBeReturned(record) ? (
          <div className="actionButton">
            <ButtonCreateOrderReturn orderDetail={record} />
          </div>
        ) : null}
        {(record.status === OrderStatus.FINISHED || record.status === OrderStatus.COMPLETED) ? (
          <div className="actionButton">
            <Link
              to={`${UrlConfig.ORDER}/print-preview?action=print&ids=${record.id}&print-type=order&print-dialog=true`}
              title="In hóa đơn"
              target = "_blank"
            >
              <img alt="" src={iconPrint} className="iconReturn"/>
            </Link>
          </div>
        ) : null}
      </React.Fragment>
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
        <div className="actionButton">
          {originNode}
        </div>
        {renderOrderSource(record)}
        <div className="actionButton">
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
            <Button type="link" className="checkInventoryButton" icon={<EyeOutlined style={{ color: "rgb(252, 175, 23)" }} />} style={{ padding: 0 }} title="Kiểm tra tồn kho"></Button>
          </Popover>
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

  //cột của bảng
  const columnConfigType = orderType === ORDER_TYPES.offline ? COLUMN_CONFIG_TYPE.orderOffline : COLUMN_CONFIG_TYPE.orderOnline
  useSetTableColumns(columnConfigType, tableColumnConfigs, initColumns, setColumns)

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

  useEffect(() => {
    setMetaData(data.metadata)
  }, [data.metadata])

  if(!subStatuses || subStatuses.length === 0) {
    return <span>Đang tải dữ liệu ...</span>;
  }

  return (
    <StyledComponent>
      <CustomTable
        isRowSelection
        isLoading={tableLoading}
        showColumnSetting={true}
        scroll={{ x: (2200 * columnFinal.length) / (columns.length ? columns.length : 1) }}
        sticky={{ offsetScroll: 10, offsetHeader: 55 }}
        pagination={{
          pageSize: metadata?.limit,
          total: metadata?.total,
          current: metadata?.page,
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
      <SubStatusChange
        orderId={selectedOrder?.id}
        toSubStatus={toSubStatusCode}
        setToSubStatusCode={setToSubStatusCode}
        changeSubStatusCallback={changeSubStatusCallback}
      />
    </StyledComponent>
  );
}
export default OrdersTable;
