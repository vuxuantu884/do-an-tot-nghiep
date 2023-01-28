import {
  DownOutlined,
  EyeOutlined,
  PhoneOutlined,
  PictureOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Col, Image, Input, Popover, Row, Select, Tag, Tooltip } from "antd";
import iconWarranty from "assets/icon/icon-warranty-menu.svg";
import IconPaymentBank from "assets/icon/payment/chuyen-khoan.svg";
import IconPaymentCod from "assets/icon/payment/cod.svg";
import IconPaymentMOMO from "assets/icon/payment/momo.svg";
import IconPaymentQRCode from "assets/icon/payment/qr.svg";
import IconPaymentSwipeCard from "assets/icon/payment/quet-the.svg";
import IconPaymentReturn from "assets/icon/payment/tien-hoan.svg";
import IconPaymentCash from "assets/icon/payment/tien-mat.svg";
import IconPaymentVNPay from "assets/icon/payment/vnpay.svg";
import IconPaymentPoint from "assets/icon/payment/YD Coin.svg";
import iconPrint from "assets/icon/Print.svg";
// import iconDeliveryProgress from 'assets/icon/delivery/tientrinhgiaohang.svg';
import search from "assets/img/search.svg";
import DeliveryProgress from "component/order/DeliveryProgress";
import { promotionUtils } from "component/order/promotion.utils";
import SubStatusChange from "component/order/SubStatusChange/SubStatusChange";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { updateOrderPartial } from "domain/actions/order/order.action";
import useSetTableColumns from "hook/table/useSetTableColumns";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { AllInventoryProductInStore, InventoryVariantListQuery } from "model/inventory";
import { OrderExtraModel, OrderModel, OrderTypeModel } from "model/order/order.model";
import { SpecialOrderResponseModel } from "model/order/special-order.model";
import { FilterConfig } from "model/other";
import { RootReducerType } from "model/reducers/RootReducerType";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import {
  DeliveryServiceResponse,
  OrderLineItemResponse,
  ShipmentResponse,
  TrackingLogFulfillmentResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import CopyIcon from "screens/order-online/component/CopyIcon";
import { inventoryGetApi } from "service/inventory";
import { getVariantApi } from "service/product/product.service";
import {
  checkIfOrderCanBeReturned,
  copyTextToClipboard,
  findVariantAvatar,
  formatCurrency,
  formatNumber,
  getOrderTotalPaymentAmount,
  getTotalQuantity,
  handleFetchApiError,
  isFetchApiSuccessful,
  isNormalTypeVariantItem,
  isOrderFromPOS,
  sortFulfillments,
} from "utils/AppUtils";
import {
  COD,
  COLUMN_CONFIG_TYPE,
  FACEBOOK,
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  POS,
  ShipmentMethod,
  SHIPPING_TYPE,
  SHOPEE,
} from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { FulfillmentStatus } from "utils/FulfillmentStatus.constant";
import { primaryColor } from "utils/global-styles/variables";
import {
  ORDER_PAYMENT_STATUS,
  ORDER_SUB_STATUS,
  ORDER_TYPES,
  PAYMENT_METHOD_ENUM,
} from "utils/Order.constants";
import {
  checkIfFulfillmentCancelled,
  checkIfMomoTypePayment,
  checkIfOrderHasNotFinishedPaymentMomo,
  getFulfillmentActive,
  getLink,
  getReturnStoreFromOrderActiveFulfillment,
  getTotalAmountBeforeDiscount,
} from "utils/OrderUtils";
import { fullTextSearch } from "utils/StringUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { getLoyaltyPoint } from "../../../../../../domain/actions/loyalty/loyalty.action";
import { LoyaltyPoint } from "../../../../../../model/response/loyalty/loyalty-points.response";
import ButtonCreateOrderReturn from "../../../ButtonCreateOrderReturn";
import EditNote from "../../../EditOrderNote";
import EditSpecialOrder from "../../../EditSpecialOrder";
import InventoryTable from "../InventoryTable";
import IconFacebook from "./images/facebook.svg";
import iconShippingFeeInformedToCustomer from "./images/iconShippingFeeInformedToCustomer.svg";
import iconShippingFeePay3PL from "./images/iconShippingFeePay3PL.svg";
import iconWeight from "./images/iconWeight.svg";
import IconShopee from "./images/shopee.svg";
import IconStore from "./images/store.svg";
import OrderMapHandOver from "./order-map-hand-over";
import { nameQuantityWidth, StyledComponent } from "./styles";
import giftIcon from "assets/icon/gift.svg";

type PropTypes = {
  tableLoading: boolean;
  data: PageResponse<OrderModel>;
  columns: ICustomTableColumType<OrderModel>[];
  deliveryServices: DeliveryServiceResponse[];
  selectedRowKeys: number[];
  stores: Array<StoreResponse> | undefined;
  setColumns: (columns: ICustomTableColumType<OrderModel>[]) => void;
  setData: (data: PageResponse<OrderModel>) => void;
  onPageChange: (page: any, size: any) => void;
  onSelectedChange: (selectedRows: any[], selected?: boolean, changeRow?: any[]) => void;
  setShowSettingColumn: (value: boolean) => void;
  onFilterPhoneCustomer: (value: string) => void;
  orderType: OrderTypeModel;
  tableColumnConfigs: FilterConfig[];
  subStatuses: OrderProcessingStatusModel[];
  currentStores: StoreResponse[];
};

type dataExtra = PageResponse<OrderExtraModel>;

type ICustomTableColumTypeExtra = (ICustomTableColumType<OrderModel> & {
  isHideInOffline?: boolean;
})[];

let itemResult: OrderModel[] = [];
let dataResult: PageResponse<OrderModel> = {
  metadata: {
    limit: 30,
    page: 1,
    total: 0,
  },
  items: [],
};

function OrdersTable(props: PropTypes) {
  const {
    tableLoading,
    data,
    columns,
    deliveryServices,
    selectedRowKeys,
    stores,
    onPageChange,
    onSelectedChange,
    setShowSettingColumn,
    setColumns,
    setData,
    onFilterPhoneCustomer,
    orderType,
    tableColumnConfigs,
    subStatuses,
    currentStores,
  } = props;

  const copyIconSize = 18;

  const formatDate = DATE_FORMAT.fullDate;

  const dispatch = useDispatch();
  const status_order = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.order_status,
  );

  // const type = {
  //   trackingCode: "trackingCode",
  //   subStatus: "subStatus",
  //   setSubStatus: "setSubStatus",
  // };

  const [toSubStatusCode, setToSubStatusCode] = useState<string | undefined>(undefined);
  const [defaultReceiveReturnStore, setDefaultReceiveReturnStore] =
    useState<StoreResponse | null>();

  const [customerLoyalty, setCustomerLoyalty] = useState<LoyaltyPoint | null>(null);
  const [isCompleteLoadingCustomerLoyalty, setIsCompleteLoadingCustomerLoyalty] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);

  // const [typeAPi, setTypeAPi] = useState("");

  const [countForceRerenderTable, setCountForceRerenderTable] = useState<number>(0);

  const items = useMemo(() => {
    return data.items ? data.items : [];
  }, [data]);

  itemResult = data.items;
  dataResult = data;

  const metadata = useMemo(() => {
    return data.metadata
      ? data.metadata
      : {
          limit: 0,
          page: 0,
          total: 0,
        };
  }, [data]);

  const paymentIcons = [
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

  // ảnh hiển thị
  const [isVisiblePreviewProduct, setIsVisiblePreviewProduct] = useState(false);
  const [variantPreviewUrl, setVariantPreviewUrl] = useState("");

  const onSuccessEditNote = useCallback(
    (note, customer_note, orderID) => {
      showSuccess(`${orderID} Cập nhật ghi chú thành công`);

      const indexOrder = itemResult.findIndex((item: any) => item.id === orderID);
      if (indexOrder > -1) {
        itemResult[indexOrder].note = note;
        itemResult[indexOrder].customer_note = customer_note;
      }
      setData({
        ...dataResult,
        items: itemResult,
      });
    },
    [setData],
  );

  const editNote = useCallback(
    (note, customer_note, orderID, record: OrderModel) => {
      let params: any = {
        note,
        customer_note,
      };
      dispatch(
        updateOrderPartial(params, orderID, () => onSuccessEditNote(note, customer_note, orderID)),
      );
    },
    [dispatch, onSuccessEditNote],
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
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderOrderPaymentMethods = (orderDetail: OrderModel) => {
    let html = null;
    html = orderDetail.payments.map((payment) => {
      let selectedPayment = paymentIcons.find((single) => {
        if (single.payment_method_code === PaymentMethodCode.COD) {
          return single.payment_method_code === payment.payment_method_code;
        } else if (!single.payment_method_code) {
          return payment.payment_method === PAYMENT_METHOD_ENUM.exchange.name;
        } else {
          return single.payment_method_code === payment.payment_method_code;
        }
      });
      if (checkIfMomoTypePayment(payment) && selectedPayment?.tooltip) {
        selectedPayment.tooltip = "Momo QR";
      }
      if (payment.status !== ORDER_PAYMENT_STATUS.paid) {
        return null;
      }
      return (
        <div
          className={`singlePayment ${
            payment.payment_method_code === PaymentMethodCode.POINT ? "ydPoint" : null
          }`}
          key={payment.id}
        >
          <Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
            <img src={selectedPayment?.icon} alt="" />
            <span className="amount">{formatCurrency(payment.paid_amount)}</span>
          </Tooltip>
        </div>
      );
    });
    return html;
  };

  const renderOrderReturn = useCallback((orderDetail: OrderModel) => {
    let returnAmount = 0;
    orderDetail.payments.forEach((payment) => {
      if (payment.return_amount > 0 && payment.status === ORDER_PAYMENT_STATUS.paid) {
        returnAmount = returnAmount + payment.return_amount;
      }
    });
    if (returnAmount > 0) {
      return (
        <Tooltip title={"Tiền hoàn lại"} className="singlePayment">
          <span className="amount returnAmount">{formatCurrency(returnAmount)}</span>
        </Tooltip>
      );
    }
    return null;
  }, []);

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
    [renderOrderPaymentMethods, renderOrderReturn, renderOrderTotalPayment],
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
          if (tag) {
            return (
              <div key={index}>
                <span className="textSmall">{tag}</span>
              </div>
            );
          }
          return null;
        });
      }
    }
    return html;
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
          <CopyIcon copiedText={html} informationText="Đã copy mã vận đơn!" size={copyIconSize} />
        </Tooltip>
      </span>
    );
  };

  const setTrackingOrderData = (
    orderId: number,
    _data: TrackingLogFulfillmentResponse[] | null,
  ) => {
    const index = itemResult?.findIndex((single) => single.id === orderId);
    if (index > -1) {
      let result: dataExtra = { ...dataResult };
      result.items[index].trackingLog = _data;
      result.items[index].isShowTrackingLog = true;
      setData(result);
    }
  };

  const renderTypeIfOrderReturn = (order: OrderModel) => {
    if (order?.order_return_origin?.code) {
      return (
        <div title="Đơn có đổi trả" className="isReturn">
          <strong>[D]</strong>
        </div>
      );
    }
  };

  const changeSubStatusCallback = (value: string, response?: any) => {
    const index = items?.findIndex((single) => single.id === selectedOrder?.id);
    if (index > -1) {
      let dataResult: dataExtra = { ...data };
      dataResult.items[index].sub_status_code = value;
      dataResult.items[index].sub_status = subStatuses?.find(
        (single) => single.code === value,
      )?.sub_status;
      dataResult.items[index].coordinator = response?.coordinator;
      dataResult.items[index].coordinator_code = response?.coordinator_code;
      dataResult.items[index] = response;
      setData(dataResult);
      setCountForceRerenderTable(countForceRerenderTable + 1);
    }
  };

  const checkIfOrderCannotChangeToWarehouseChange = (orderDetail: OrderExtraModel) => {
    const checkIfOrderHasNoFFM = (orderDetail: OrderExtraModel) => {
      return !orderDetail.fulfillments?.some((single) => {
        return single.shipment && !checkIfFulfillmentCancelled(single);
      });
    };
    const checkIfOrderIsNew = (orderDetail: OrderExtraModel) => {
      return orderDetail.sub_status_code === ORDER_SUB_STATUS.awaiting_coordinator_confirmation;
    };
    const checkIfOrderIsConfirm = (orderDetail: OrderExtraModel) => {
      return orderDetail.sub_status_code === ORDER_SUB_STATUS.coordinator_confirming;
    };
    const checkIfOrderIsAwaitSaleConfirm = (orderDetail: OrderExtraModel) => {
      return orderDetail.sub_status_code === ORDER_SUB_STATUS.awaiting_saler_confirmation;
    };
    return (
      (checkIfOrderIsNew(orderDetail) && checkIfOrderHasNoFFM(orderDetail)) ||
      (checkIfOrderIsConfirm(orderDetail) && checkIfOrderHasNoFFM(orderDetail)) ||
      (checkIfOrderIsAwaitSaleConfirm(orderDetail) && checkIfOrderHasNoFFM(orderDetail))
    );
  };

  const handleShowVariantImage = (variantId: number) => {
    dispatch(showLoading());
    getVariantApi(variantId.toString())
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          const defaultVariantImageUrl = findVariantAvatar(response.data.variant_images);
          if (defaultVariantImageUrl) {
            setVariantPreviewUrl(defaultVariantImageUrl);
            setIsVisiblePreviewProduct(true);
          } else {
            showWarning("Không tìm thấy ảnh sản phẩm");
          }
        } else {
          handleFetchApiError(response, "Tìm ảnh sản phẩm", dispatch);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

  const renderCoordinator = (record: any) => {
    return (
      <div className="single coordinator">
        <div className="coordinator-item">
          <strong>NV điều phối: </strong>
          {record.coordinator ? (
            <React.Fragment>
              <Link
                to={`${UrlConfig.ACCOUNTS}/${record.coordinator_code}`}
                className="coordinatorCode"
              >
                {record.coordinator_code} - {record.coordinator}
              </Link>
            </React.Fragment>
          ) : (
            "-"
          )}
        </div>
      </div>
    );
  };

  const onEditSpecialOrderSuccess = useCallback(
    (orderID, specialOrder?: SpecialOrderResponseModel) => {
      const indexOrder = itemResult.findIndex((item: any) => item.id === orderID);
      if (indexOrder > -1) {
        itemResult[indexOrder].special_order = specialOrder;
      }
      setData({
        ...dataResult,
        items: itemResult,
      });
    },
    [setData],
  );

  const initColumnsDefault: ICustomTableColumTypeExtra = useMemo(() => {
    return [
      {
        title: "ID đơn hàng",
        dataIndex: "code",
        key: "code",
        render: (value: string, i: OrderModel) => {
          return (
            <React.Fragment>
              <div className="noWrap">
                <Link to={`${UrlConfig.ORDER}/${i.id}`} title="Chi tiết đơn" className="orderCode">
                  {value}
                </Link>
                <span title="Click để copy">
                  <CopyIcon
                    copiedText={i.code.toString()}
                    informationText="Đã copy mã đơn hàng!"
                    size={copyIconSize}
                  />
                </span>
              </div>
              <div className="textSmall" title="Ngày tạo đơn">
                {moment(i.created_date).format(formatDate)}
              </div>
              <div className="textSmall">
                <Link to={`${UrlConfig.STORE}/${i?.store_id}`} title="Cửa hàng">
                  {i.store}
                </Link>
              </div>
              {orderType === ORDER_TYPES.offline ? null : (
                <div className="textSmall single" title="Nguồn">
                  {i.source}
                </div>
              )}
              {orderType === ORDER_TYPES.offline ? (
                <React.Fragment>
                  <div className="textSmall single mainColor">
                    <Link to={`${UrlConfig.ACCOUNTS}/${i.assignee_code}`} title="Chuyên gia tư vấn">
                      <strong>CGTV: </strong>
                      {i.assignee_code} - {i.assignee}
                    </Link>
                  </div>
                  <div className="textSmall single mainColor">
                    <Link to={`${UrlConfig.ACCOUNTS}/${i.account_code}`}>
                      <strong>Thu ngân: </strong>
                      {i.account_code} - {i.account}
                    </Link>
                  </div>
                </React.Fragment>
              ) : null}
              {orderType === ORDER_TYPES.online && i.source && (
                <React.Fragment>
                  <div className="textSmall single mainColor">
                    <Link to={`${UrlConfig.ACCOUNTS}/${i.assignee_code}`}>
                      <strong>NV bán hàng: </strong>
                      {i.assignee_code} - {i.assignee}
                    </Link>
                  </div>
                  <div className="textSmall single mainColor">
                    <Link to={`${UrlConfig.ACCOUNTS}/${i.account_code}`}>
                      <strong>Người tạo: </strong>
                      {i.account_code} - {i.account}
                    </Link>
                  </div>
                  <div className="textSmall single mainColor">
                    {i.marketer_code ? (
                      <Link to={`${UrlConfig.ACCOUNTS}/${i.marketer_code}`}>
                        <strong>NV marketing: </strong>
                        {i.marketer_code} - {i.marketer}
                      </Link>
                    ) : (
                      <React.Fragment>
                        <strong>NV marketing: </strong>-
                      </React.Fragment>
                    )}
                  </div>
                </React.Fragment>
              )}
              <div className="textSmall single">
                <strong>Tổng SP: {getTotalQuantity(i.items)}</strong>
              </div>
              {i?.uniform && (
                <div className="single uniformText">
                  <strong>Đơn đồng phục</strong>
                </div>
              )}

              {renderTypeIfOrderReturn(i)}
            </React.Fragment>
          );
        },
        visible: true,
        fixed: "left",
        className: "orderId custom-shadow-td",
        width: 120,
      },
      {
        title: "Khách hàng",
        render: (record: OrderModel) => {
          const handleClickChange = (open: boolean) => {
            if (open) {
              if (record) {
                setIsCompleteLoadingCustomerLoyalty(false);
                dispatch(
                  getLoyaltyPoint(record.customer_id, (data) => {
                    setIsCompleteLoadingCustomerLoyalty(true);
                    setCustomerLoyalty(data);
                  }),
                );
              } else {
                setIsCompleteLoadingCustomerLoyalty(true);
                setCustomerLoyalty(null);
              }
            } else {
              setIsCompleteLoadingCustomerLoyalty(false);
              setCustomerLoyalty(null);
            }
          };
          return (
            <div className="customer custom-td">
              {record.customer_phone_number && (
                <div className="columnBody__customer">
                  <div
                    className="columnBody__customer-inner"
                    onClick={() => {
                      onFilterPhoneCustomer(
                        record.customer_phone_number ? record.customer_phone_number : "",
                      );
                    }}
                  >
                    {record.customer_phone_number}
                    <span title="Click để copy">
                      <CopyIcon
                        copiedText={record?.customer_phone_number || ""}
                        informationText="Đã copy số điện thoại!"
                        size={copyIconSize}
                      />
                    </span>
                  </div>
                  <Popover
                    placement="bottomLeft"
                    style={{ width: 500 }}
                    onVisibleChange={handleClickChange}
                    content={
                      <StyledComponent>
                        <div className="popover-to-fast">
                          <div>
                            <Tag className="orders-tag orders-tag-vip">
                              <b>
                                {!isCompleteLoadingCustomerLoyalty
                                  ? "Đang tải ..."
                                  : !customerLoyalty?.loyalty_level
                                  ? "Không có hạng"
                                  : customerLoyalty.loyalty_level}
                              </b>
                            </Tag>
                          </div>
                          <Button
                            className="btn-to-fast"
                            type="link"
                            icon={<img src={search} alt="" />}
                            onClick={() =>
                              onFilterPhoneCustomer(
                                record.customer_phone_number ? record.customer_phone_number : "",
                              )
                            }
                          >
                            Lọc đơn của khách
                          </Button>
                          <Button
                            className="btn-to-fast"
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              let pathname = `${process.env.PUBLIC_URL}${UrlConfig.CUSTOMER}/${record.customer_id}`;
                              window.open(pathname, "_blank");
                            }}
                          >
                            Thông tin khách hàng
                          </Button>
                          <Button
                            className="btn-to-fast"
                            type="link"
                            icon={<PlusOutlined />}
                            onClick={() => {
                              let pathname = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/create?customer=${record.customer_id}`;
                              window.open(pathname, "_blank");
                            }}
                          >
                            Tạo đơn cho khách
                          </Button>
                          <Button
                            className="btn-to-fast"
                            type="link"
                            icon={<PhoneOutlined />}
                            onClick={() => {
                              window.location.href = `tel:${record.customer_phone_number}`;
                            }}
                          >
                            Gọi điện cho khách
                          </Button>
                        </div>
                      </StyledComponent>
                    }
                    trigger="click"
                  >
                    <Button
                      type="link"
                      className="trigger__button"
                      icon={<DownOutlined className="trigger__icon" />}
                    ></Button>
                  </Popover>
                </div>
              )}
              <div className="name">
                <Link
                  target="_blank"
                  to={`${UrlConfig.CUSTOMER}/${record.customer_id}`}
                  title="Chi tiết khách hàng"
                  className="primary"
                >
                  {record.customer}
                </Link>{" "}
              </div>
              <div className="textSmall">{renderShippingAddress(record)}</div>
              {record?.tags?.length && record?.tags?.length > 0 ? (
                <div className="customTags">{renderTag(record)}</div>
              ) : null}
            </div>
          );
        },
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
            <div className="items columnBody__items">
              {items.map((item, i) => {
                return (
                  <div className="item custom-td" key={i}>
                    <div className="product productNameWidth 2">
                      <div className="inner">
                        <PictureOutlined
                          onClick={() => handleShowVariantImage(item.variant_id)}
                          className="previewImage"
                          title="Click để hiển thị ảnh sản phẩm"
                        />
                        <Link
                          to={`${UrlConfig.PRODUCT}/${item.product_id}/variants/${item.variant_id}`}
                        >
                          {item.sku}
                        </Link>
                        <br />
                        <div className="productNameText textSmall" title={item.variant}>
                          {item.variant}
                        </div>
                      </div>
                    </div>
                    <div className="quantity quantityWidth">{formatNumber(item.quantity)}</div>
                    <div className="price priceWidth">
                      <div>
                        <Tooltip title="Giá sản phẩm">
                          <span>{formatCurrency(item.price)}</span>
                        </Tooltip>

                        {item?.discount_items && item.discount_items[0]?.value ? (
                          <React.Fragment>
                            <Tooltip title="Khuyến mại sản phẩm (đ)">
                              <div className="itemDiscountValue">
                                <span> - {formatCurrency(item.discount_items[0].value)}</span>
                              </div>
                            </Tooltip>
                            <Tooltip title="Khuyến mại sản phẩm (%)">
                              <div className="itemDiscountValue">
                                <span>
                                  {" "}
                                  -{" "}
                                  {Math.round((item.discount_items[0].value / item.price) * 10000) /
                                    100}
                                  %
                                </span>
                              </div>
                            </Tooltip>
                          </React.Fragment>
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
      {
        title: "Tổng tiền",
        render: (record: any) => (
          <div className="columnBody__discountAmount">
            <div className="originalPrice">
              <Tooltip title="Tổng tiền khi sản phẩm còn nguyên giá">
                <span>{formatCurrency(getTotalAmountBeforeDiscount(record.items))}</span>
              </Tooltip>
            </div>
            <div>
              <Tooltip title="Tổng tiền">
                <strong>{formatCurrency(record.total)}</strong>
              </Tooltip>
            </div>
            {record.total_discount ? (
              <div>
                <Tooltip title="Tổng tiền chiết khấu">
                  <strong className="totalDiscountValue">
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
          </div>
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
        title: "Biên bản bàn giao",
        key: "goods_receipt",
        render: (value, record: OrderModel, index) => {
          if (record.handOvers) {
            return <OrderMapHandOver handOvers={record.handOvers} />;
          } else {
            return <span>-</span>;
          }
        },
        visible: true,
        width: 120,
        isHideInOffline: true,
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
                                {formatCurrency(record.shipping_fee_informed_to_customer || 0)}
                              </span>
                            </div>
                          </Tooltip>

                          <Tooltip title="Phí vận chuyển">
                            <div className="single">
                              <img src={iconShippingFeePay3PL} alt="" className="iconShipping" />
                              {formatCurrency(
                                sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls ||
                                  0,
                              )}
                            </div>
                          </Tooltip>

                          {sortedFulfillments[0]?.shipment?.tracking_code ? (
                            <div className="single trackingCode">
                              {renderTrackingCode(sortedFulfillments[0]?.shipment)}
                            </div>
                          ) : null}

                          {sortedFulfillments[0]?.code ? (
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
                      {renderCoordinator(record)}
                    </React.Fragment>
                  );
                case ShipmentMethod.EMPLOYEE:
                case ShipmentMethod.EXTERNAL_SHIPPER:
                  return (
                    <React.Fragment>
                      <div className="single">
                        {sortedFulfillments[0]?.shipment?.service === SHIPPING_TYPE.DELIVERY_4H
                          ? "Đơn giao 4H"
                          : "Đơn giao thường"}
                        {" - "}
                        <span className="shipper">
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
                            {formatCurrency(record.shipping_fee_informed_to_customer || 0)}
                          </span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img src={iconShippingFeePay3PL} alt="" />
                          {formatCurrency(
                            sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0,
                          )}
                        </div>
                      </Tooltip>
                      {renderCoordinator(record)}
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
                          <span>
                            {formatCurrency(record.shipping_fee_informed_to_customer || 0)}
                          </span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img src={iconShippingFeePay3PL} alt="" />
                          {formatCurrency(
                            sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0,
                          )}
                        </div>
                      </Tooltip>
                      {renderCoordinator(record)}
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
                            {formatCurrency(record.shipping_fee_informed_to_customer || 0)}
                          </span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img src={iconShippingFeePay3PL} alt="" />
                          {formatCurrency(
                            sortedFulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || 0,
                          )}
                        </div>
                      </Tooltip>
                      {renderCoordinator(record)}
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
                            {formatCurrency(record.shipping_fee_informed_to_customer || 0)}
                          </span>
                        </div>
                      </Tooltip>

                      <Tooltip title="Phí vận chuyển">
                        <div className="single">
                          <img src={iconShippingFeePay3PL} alt="" />
                          {formatCurrency(
                            sortedFulfillments[0]?.shipment.shipping_fee_paid_to_three_pls || 0,
                          )}
                        </div>
                      </Tooltip>
                      {renderCoordinator(record)}
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
        isHideInOffline: true,
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
          let className =
            record.sub_status_code === ORDER_SUB_STATUS.fourHour_delivery
              ? "fourHour_delivery"
              : record.sub_status_code
              ? record.sub_status_code
              : "";
          const returnedStore = stores?.find(
            (p) => p.id === getFulfillmentActive(record?.fulfillments)?.returned_store_id,
          );
          return (
            <div className="orderStatus">
              <div className="inner">
                <div className="single">
                  <div>
                    <strong>Xử lý đơn: </strong>
                  </div>
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
                        // setTypeAPi(type.subStatus);
                        setSelectedOrder(record);
                      }}
                      className={className}
                      dropdownStyle={{ minWidth: 200 }}
                      listHeight={300}
                      disabled={checkIfOrderHasNotFinishedPaymentMomo(record)}
                      onChange={(value) => {
                        if (
                          value === ORDER_SUB_STATUS.require_warehouse_change &&
                          checkIfOrderCannotChangeToWarehouseChange(record)
                        ) {
                          showError("Bạn không thể đổi sang trạng thái khác!");
                          return;
                        }
                        if (
                          selected !== ORDER_SUB_STATUS.require_warehouse_change &&
                          value === ORDER_SUB_STATUS.require_warehouse_change
                        ) {
                          showError("Vui lòng vào chi tiết đơn chọn lý do đổi kho hàng!");
                          return;
                        }
                        let defaultReceiveReturnStore = getReturnStoreFromOrderActiveFulfillment(
                          record?.fulfillments,
                          currentStores,
                        );
                        setDefaultReceiveReturnStore(defaultReceiveReturnStore);
                        setToSubStatusCode(value);
                      }}
                    >
                      {subStatuses &&
                        subStatuses.map((single: any, index: number) => {
                          return (
                            <Select.Option value={single.code} key={index}>
                              {single.sub_status}
                            </Select.Option>
                          );
                        })}
                    </Select>
                  ) : (
                    "-"
                  )}
                </div>
                {record?.sub_status_code === FulfillmentStatus.RETURNED && (
                  <div className="single">
                    <div className="coordinator-item">
                      <strong>Kho nhận hàng hoàn: </strong>
                      {returnedStore ? (
                        <React.Fragment>
                          <Link
                            to={`${UrlConfig.STORE}/${returnedStore?.id}`}
                            className="coordinatorCode"
                          >
                            {returnedStore?.name}
                          </Link>
                        </React.Fragment>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
        visible: orderType === ORDER_TYPES.online,
        align: "left",
        width: 105,
        isHideInOffline: true,
      },
      {
        title: "Ghi chú",
        className: "notes",
        render: (value: string, record: OrderModel) => {
          const privateNote = promotionUtils.getPrivateNoteFromResponse(record.note || "");
          const noteFormValue = {
            note: privateNote,
            customer_note: record.customer_note,
          };

          const promotionText = promotionUtils.getAllPromotionTitle(record);
          return (
            <div className="orderNotes">
              <div className="inner">
                <div className="single">
                  <EditNote
                    note={record.customer_note}
                    title="Khách hàng: "
                    color={primaryColor}
                    onOk={(values) => {
                      editNote(values.note, values.customer_note, record.id, record);
                    }}
                    noteFormValue={noteFormValue}
                  />
                </div>
                <div className="single">
                  <EditNote
                    // note={record.note}
                    note={privateNote}
                    title="Nội bộ: "
                    color={primaryColor}
                    onOk={(values) => {
                      editNote(values.note, values.customer_note, record.id, record);
                    }}
                    noteFormValue={noteFormValue}
                  />
                </div>
                {promotionText ? (
                  <div className="single">
                    <span className="promotionText" title="Chương trình khuyến mại">
                      <img src={giftIcon} alt="" className="iconGift" />
                      {promotionText}.
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        },
        key: "note",
        visible: true,
        align: "left",
        width: 120,
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
      {
        title: "Loại đơn hàng",
        className: "",
        isHideInOffline: true,
        render: (value: string, record: OrderModel) => {
          if (isOrderFromPOS(record)) {
            return;
          }
          return (
            <div className="orderNotes">
              <div className="inner">
                <div className="single">
                  <EditSpecialOrder
                    title="Loại: "
                    specialOrder={record.special_order}
                    orderId={record.id}
                    onEditSpecialOrderSuccess={onEditSpecialOrderSuccess}
                  />
                </div>
              </div>
            </div>
          );
        },
        key: "specialOrder",
        visible: true,
        align: "left",
        width: 120,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, deliveryServices, editNote, status_order, stores, customerLoyalty]);

  const initColumns = useMemo(() => {
    if (orderType === ORDER_TYPES.online) {
      return initColumnsDefault;
    } else {
      return initColumnsDefault.filter((single) => !single.isHideInOffline);
    }
  }, [initColumnsDefault, orderType]);
  const columnFinal = useMemo(() => columns.filter((item) => item.visible === true), [columns]);

  const [inventoryData, setInventoryData] = useState<AllInventoryProductInStore[]>([]);
  const [storeInventory, setStoreInventory] = useState<StoreResponse[]>([]);

  const onSearchInventory = useCallback(
    (value: string) => {
      let _item: StoreResponse[] | any = stores?.filter(
        (x) => fullTextSearch(value.toLowerCase().trim(), x.name.toLowerCase()) === true,
      );
      setStoreInventory(_item);
    },
    [stores],
  );

  const handleInventoryData = useCallback(
    (variantIds: number[]) => {
      if (stores) setStoreInventory([...stores]);
      let inventoryQuery: InventoryVariantListQuery = {
        is_detail: true,
        variant_ids: variantIds,
        store_ids: stores?.map((p) => p.id),
      };

      inventoryGetApi(inventoryQuery)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            setInventoryData(response.data);
          } else {
            handleFetchApiError(response, "Danh sách tồn kho", dispatch);
          }
        })
        .catch((e) => {
          console.log(e);
        });
    },
    [dispatch, stores],
  );

  const renderActionButton = (record: OrderModel) => {
    return (
      <React.Fragment>
        {checkIfOrderCanBeReturned(record) ? (
          <div className="actionButton">
            <ButtonCreateOrderReturn orderDetail={record} />
          </div>
        ) : null}
        {record.status === OrderStatus.FINISHED || record.status === OrderStatus.COMPLETED ? (
          <div className="actionButton">
            <Link
              to={`${UrlConfig.ORDER}/print-preview?action=print&ids=${record.id}&print-type=order&print-dialog=true`}
              title="In hóa đơn"
              target="_blank"
            >
              <img alt="" src={iconPrint} className="iconReturn" />
            </Link>
          </div>
        ) : null}
        {record.status === OrderStatus.FINISHED || record.status === OrderStatus.COMPLETED ? (
          <div className="actionButton">
            <Link
              to={`${UrlConfig.WARRANTY}/create?orderID=${record.id}`}
              title="Tạo bảo hành"
              target="_blank"
            >
              <img alt="" src={iconWarranty} className="createWarrantyIcon" />
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
    originNode: ReactNode,
  ) => {
    return (
      <React.Fragment>
        <div className="actionButton">{originNode}</div>
        {renderOrderSource(record)}
        <div className="actionButton">
          <Popover
            placement="right"
            overlayStyle={{ zIndex: 1000, top: "150px", maxWidth: "60%" }}
            title={
              <Row justify="space-between" align="middle">
                <Input.Search placeholder="Tìm kiếm kho" allowClear onSearch={onSearchInventory} />
              </Row>
            }
            content={
              <InventoryTable
                inventoryData={inventoryData}
                storeId={record.store_id || 0}
                items={record.items}
                listStore={storeInventory}
              />
            }
            trigger="click"
            onVisibleChange={(visible) => {
              visible === true && handleInventoryData(record.items.map((p) => p.variant_id));
            }}
          >
            <Button
              type="link"
              className="checkInventoryButton"
              icon={<EyeOutlined className="checkInventoryButton__icon" />}
              title="Kiểm tra tồn kho"
            ></Button>
          </Popover>
        </div>
        {renderActionButton(record)}
        {record?.order_returns && record?.order_returns?.length > 0 ? (
          <div className="actionButton" title="Đơn hàng có đổi trả">
            <b>[Đ]</b>
          </div>
        ) : null}
      </React.Fragment>
    );
  };

  const getTotalQuantityPerPage = () => {
    let result = 0;
    items.forEach((item) => {
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
    items.forEach((item) => {
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
    items.forEach((item) => {
      let itemPayment = getPaymentItem(item);
      result = result + itemPayment;
    });
    return result;
  };

  // - Doanh số = Tổng giá trị hóa đơn bán - Tổng giá trị hóa đơn trả hàng.
  // - Doanh thu = Doanh số - Chiết khấu - Sử dụng điểm.
  // - Do total đã trừ chiết khấu nên Doanh thu = Tổng giá trị hóa đơn bán - Tổng giá trị hóa đơn trả hàng - Sử dụng điểm

  // - Tạm thời bỏ hàng trả - doanh thu sau chiết khấu trừ tiêu điểm
  const getTotalRevenue = () => {
    let result = 0;
    items.forEach((item) => {
      let pointAmount = 0;
      item.payments.forEach((single) => {
        if (single.payment_method_code === PaymentMethodCode.POINT) {
          pointAmount = pointAmount + single.amount;
        }
      });
      result = result + (item.total - pointAmount);
    });
    return result;
  };

  const getTotalShippingFeeInformedToCustomer = () => {
    let result = 0;
    items.forEach((item) => {
      const sortedFulfillments = item?.fulfillments ? sortFulfillments(item.fulfillments) : [];
      if (
        sortedFulfillments[0]?.status &&
        sortedFulfillments[0]?.status !== FulFillmentStatus.CANCELLED
      ) {
        result = result + (item.shipping_fee_informed_to_customer || 0);
      }
    });
    return result;
  };

  const getTotalShippingPay3PL = () => {
    let result = 0;
    items.forEach((item) => {
      const sortedFulfillments = item?.fulfillments ? sortFulfillments(item.fulfillments) : [];
      if (
        sortedFulfillments[0]?.status &&
        sortedFulfillments[0]?.status !== FulFillmentStatus.CANCELLED
      ) {
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
                  <p className="text-field">TỔNG DOANH THU SAU CHIẾT KHẤU TRỪ TIÊU ĐIỂM:</p>
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
  const columnConfigType =
    orderType === ORDER_TYPES.offline
      ? COLUMN_CONFIG_TYPE.orderOffline
      : COLUMN_CONFIG_TYPE.orderOnline;

  useSetTableColumns(columnConfigType, tableColumnConfigs, initColumns, setColumns);

  useEffect(() => {
    if (columns.length === 0) {
      setColumns(initColumns);
    }
  }, [columns, initColumns, setColumns]);

  useEffect(() => {
    if (!data?.items) {
      return;
    }
    // if (typeAPi === type.trackingCode) {
    //   if (selectedOrder && selectedOrder.fulfillments) {
    //     const sortedFulfillments = sortFulfillments(selectedOrder.fulfillments);
    //     if (!sortedFulfillments[0]?.code) {
    //       return;
    //     }
    //     dispatch(
    //       getTrackingLogFulfillmentAction(sortedFulfillments[0]?.code, (response) => {
    //         // setIsVisiblePopup(true)
    //         const index = data.items?.findIndex((single) => single.id === selectedOrder.id);
    //         if (index > -1) {
    //           let dataResult: dataExtra = { ...data };
    //           dataResult.items[index].trackingLog = response;
    //           dataResult.items[index].isShowTrackingLog = true;
    //           setData(dataResult);
    //         }
    //       })
    //     );
    //   }
    // } else if (typeAPi === type.setSubStatus) {
    // }
    //xóa data
  }, [data?.items]);

  if (!subStatuses || subStatuses.length === 0) {
    return <span>Đang tải dữ liệu ...</span>;
  }

  return (
    <StyledComponent>
      <CustomTable
        isRowSelection
        isLoading={tableLoading}
        showColumnSetting={true}
        scroll={{
          x: (2200 * columnFinal.length) / (columns.length ? columns.length : 1),
        }}
        sticky={{ offsetScroll: 10, offsetHeader: 55 }}
        pagination={{
          pageSize: metadata.limit,
          total: metadata.total,
          current: metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        rowSelectionRenderCell={rowSelectionRenderCell}
        onSelectedChange={(selectedRows: any[], selected?: boolean, changeRow?: any[]) =>
          onSelectedChange(selectedRows, selected, changeRow)
        }
        onShowColumnSetting={() => setShowSettingColumn(true)}
        dataSource={items}
        columns={columnFinal}
        selectedRowKey={selectedRowKeys}
        rowKey={(item: OrderModel) => item.id}
        className="order-list"
        footer={() => renderFooter()}
        isShowPaginationAtHeader
        rowSelectionWidth={30}
        key={countForceRerenderTable}
      />
      <SubStatusChange
        orderId={selectedOrder?.id}
        toSubStatus={toSubStatusCode}
        setToSubStatusCode={setToSubStatusCode}
        changeSubStatusCallback={changeSubStatusCallback}
        stores={stores}
        defaultReceiveReturnStore={defaultReceiveReturnStore}
      />
      {/* hiển thị image ảnh sản phẩm */}
      <Image
        width={200}
        style={{ display: "none" }}
        src={variantPreviewUrl}
        preview={{
          visible: isVisiblePreviewProduct,
          src: variantPreviewUrl,
          onVisibleChange: (value) => {
            setIsVisiblePreviewProduct(value);
            if (!value) {
              setVariantPreviewUrl("");
            }
          },
        }}
      />
    </StyledComponent>
  );
}

export default OrdersTable;
