import { Button, Form, Popover, Tooltip } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  getTrackingLogFulfillmentAction,
  updateOrderPartial,
} from "domain/actions/order/order.action";
import { PageResponse } from "model/base/base-metadata.response";
import { ShipmentResponse } from "model/response/order/order.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import NumberFormat from "react-number-format";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import {
  nameQuantityWidth,
  StyledPurchaseHistory,
} from "screens/customer/customer-detail/customerDetailStyled";
import EditNote from "screens/order-online/component/edit-note";
import {
  checkIfOrderCanBeReturned,
  convertItemToArray,
  copyTextToClipboard,
  formatCurrency,
  generateQuery,
  getOrderTotalPaymentAmount,
  getTotalQuantity,
} from "utils/AppUtils";
import { COD, OrderStatus, PaymentMethodCode, POS, ShipmentMethod } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { dangerColor, primaryColor, yellowColor } from "utils/global-styles/variables";

import "assets/css/order-status.scss";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import IconTrackingCode from "assets/img/iconTrackingCode.svg";
import DebounceSelect from "component/filter/component/debounce-select";
import TrackingLog from "component/order/DeliveryProgress/TrackingLog/TrackingLog";
import SubStatusChange from "component/order/SubStatusChange/SubStatusChange";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";
import _ from "lodash";
import { OrderExtraModel, OrderModel } from "model/order/order.model";
import queryString from "query-string";
import ButtonCreateOrderReturn from "screens/order-online/component/ButtonCreateOrderReturn";
import iconShippingFeeInformedToCustomer from "screens/order-online/component/OrderList/ListTable/images/iconShippingFeeInformedToCustomer.svg";
import iconShippingFeePay3PL from "screens/order-online/component/OrderList/ListTable/images/iconShippingFeePay3PL.svg";
import iconWeight from "screens/order-online/component/OrderList/ListTable/images/iconWeight.svg";
import IconStore from "screens/order-online/component/OrderList/ListTable/images/store.svg";
import { getVariantApi, searchVariantsApi } from "service/product/product.service";
import { ORDER_SUB_STATUS, PAYMENT_METHOD_ENUM } from "utils/Order.constants";
import {
  checkIfMomoTypePayment,
  getFulfillmentActive,
  getLink,
  getReturnMoneyStatusColor,
  getReturnMoneyStatusText,
} from "utils/OrderUtils";
import { showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import {
  getCustomerOrderHistoryAction,
  getCustomerOrderReturnHistoryAction,
} from "../../../domain/actions/customer/customer.action";
import { RootReducerType } from "../../../model/reducers/RootReducerType";

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
import { promotionUtils } from "component/order/promotion.utils";
import useFetchDeliverServices from "screens/order-online/hooks/useFetchDeliverServices";

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

type PurchaseHistoryProps = {
  customer: any;
};

const initOrderSearchingQuery: any = {
  limit: 10,
  page: 1,
  variant_ids: [],
};

type dataExtra = PageResponse<OrderExtraModel>;

function PurchaseHistory(props: PurchaseHistoryProps) {
  const { customer } = props;
  const history = useHistory();
  const location = useLocation();
  const queryParamsParsed: any = queryString.parse(location.search);
  const status_order = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.order_status,
  );
  const [formOrderHistoryFilter] = Form.useForm();

  const dispatch = useDispatch();

  const subStatuses = useGetOrderSubStatuses();

  const type = {
    trackingCode: "trackingCode",
    subStatus: "subStatus",
    setSubStatus: "setSubStatus",
  };

  const deliveryServices = useFetchDeliverServices();

  //handle get purchase history
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [orderHistoryQueryParams, setOrderHistoryQueryParams] =
    useState<any>(initOrderSearchingQuery);
  const [optionsVariant, setOptionsVariant] = useState<{ label: string; value: string }[]>([]);
  const [rerenderSearchVariant, setRerenderSearchVariant] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderModel | null>(null);
  const [typeAPi, setTypeAPi] = useState("");
  const [toSubStatusCode, setToSubStatusCode] = useState<string | undefined>(undefined);

  const [purchaseHistoryData, setPurchaseHistoryData] = useState<PageResponse<any>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  // handle order returned history
  const [orderReturnedList, setOrderReturnedList] = useState<Array<any>>([]);

  const updateOrderReturnedList = useCallback((data: any) => {
    setTableLoading(false);
    if (data) {
      setOrderReturnedList(data.items);
    }
  }, []);

  useEffect(() => {
    if (customer?.id) {
      setTableLoading(true);
      dispatch(getCustomerOrderReturnHistoryAction(customer?.id, updateOrderReturnedList));
    }
  }, [customer?.id, dispatch, updateOrderReturnedList]);
  // end order returned history

  // handle order history
  const [orderHistoryData, setOrderHistoryData] = useState<PageResponse<any>>({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  async function handleSearchVariantAndBarCode(value: any) {
    try {
      const result = await searchVariantsApi({ info: value });
      return result.data.items.map((item) => {
        return {
          label: item.name,
          value: item.id.toString(),
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (orderHistoryQueryParams.variant_ids && orderHistoryQueryParams.variant_ids.length) {
      setRerenderSearchVariant(false);
      let variant_ids = convertItemToArray(orderHistoryQueryParams.variant_ids);
      (async () => {
        let variants: any = [];
        await Promise.all(
          variant_ids.map(async (variant_id: any) => {
            try {
              const result = await getVariantApi(variant_id);

              variants.push({
                label: result.data.name,
                value: result.data.id.toString(),
              });
            } catch {}
          }),
        );
        setOptionsVariant(variants);
        if (variants?.length > 0) {
          setRerenderSearchVariant(true);
        }
      })();
    } else {
      setRerenderSearchVariant(true);
    }
  }, [orderHistoryQueryParams.variant_ids]);

  // handle get customer order history
  const updateOrderHistoryData = useCallback((data: any) => {
    setTableLoading(false);
    if (data) {
      setOrderHistoryData(data);
    }
  }, []);

  const getCustomerOrderHistory = useCallback(
    (params: any) => {
      if (customer?.id) {
        const newParams = {
          ...params,
          variant_ids: convertItemToArray(params.variant_ids),
          customer_id: customer?.id,
        };
        setTableLoading(true);
        dispatch(getCustomerOrderHistoryAction(newParams, updateOrderHistoryData));
      }
    },
    [customer?.id, dispatch, updateOrderHistoryData],
  );

  useEffect(() => {
    const dataQuery: any = {
      ...initOrderSearchingQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setOrderHistoryQueryParams(dataQuery);
    getCustomerOrderHistory(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, getCustomerOrderHistory, location.search]);
  // end handle get customer order history

  // update form fields value
  useEffect(() => {
    formOrderHistoryFilter.setFieldsValue({
      variant_ids: orderHistoryQueryParams.variant_ids,
    });
  }, [formOrderHistoryFilter, orderHistoryQueryParams.variant_ids]);

  const onFinish = useCallback(
    (values: any) => {
      const newParams = { ...orderHistoryQueryParams, ...values, page: 1 };
      const queryParam = generateQuery(newParams);
      const currentParam = generateQuery(orderHistoryQueryParams);
      if (currentParam !== queryParam) {
        history.push(`${location.pathname}?${queryParam}`);
      } else {
        getCustomerOrderHistory(newParams);
      }
    },
    [getCustomerOrderHistory, history, location.pathname, orderHistoryQueryParams],
  );

  const handleClearSearchOrderCustomer = () => {
    let queryParam = generateQuery(initOrderSearchingQuery);
    history.push(`${location.pathname}?${queryParam}`);
  };

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...orderHistoryQueryParams, page, limit };
      let queryParam = generateQuery(newParams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, orderHistoryQueryParams],
  );
  // end handle order history

  // update purchase history data
  useEffect(() => {
    if (orderHistoryQueryParams.variant_ids && orderHistoryQueryParams.variant_ids.length > 0) {
      setPurchaseHistoryData(orderHistoryData);
    } else {
      let newPurchaseHistoryData = _.cloneDeep(orderHistoryData);
      newPurchaseHistoryData.items = newPurchaseHistoryData.items.concat(orderReturnedList);
      newPurchaseHistoryData.items.sort((a, b) => {
        return b.created_date < a.created_date ? -1 : b.created_date > a.created_date ? 1 : 0;
      });
      setPurchaseHistoryData(newPurchaseHistoryData);
    }
  }, [
    formOrderHistoryFilter,
    orderHistoryData,
    orderHistoryQueryParams.variant_ids,
    orderReturnedList,
  ]);

  // handle payment column
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
      if (checkIfMomoTypePayment(payment) && selectedPayment?.tooltip) {
        selectedPayment.tooltip = "Momo QR";
      }
      return (
        <div
          className={`singlePayment ${
            payment.payment_method_code === PaymentMethodCode.POINT ? "ydPoint" : null
          }`}
          key={index}
        >
          <Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
            <img src={selectedPayment?.icon} alt="" />
            <span className="amount">{formatCurrency(payment.paid_amount)}</span>
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
  // end handle payment column

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
    [orderHistoryData, setOrderHistoryData],
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
        updateOrderPartial(params, orderID, () => onSuccessEditNote(newNote, noteType, orderID)),
      );
    },
    [dispatch, onSuccessEditNote],
  );

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

  const renderOrderTrackingLog = (record: OrderExtraModel) => {
    // let html: ReactNode= "aaaaaaaaaa";
    // if(!trackingLogFulfillment) {
    //   return html;
    // }
    if (!record?.fulfillments || !record.isShowTrackingLog) {
      return;
    }
    const trackingLogFulfillment = record?.trackingLog;
    const fulfillment = getFulfillmentActive(record?.fulfillments);
    const trackingCode = fulfillment?.shipment?.tracking_code;
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

  const changeSubStatusCallback = (value: string) => {
    const index = purchaseHistoryData.items?.findIndex((single) => single.id === selectedOrder?.id);
    if (index > -1) {
      let dataResult: dataExtra = { ...purchaseHistoryData };
      // selected = value;
      dataResult.items[index].sub_status_code = value;
      dataResult.items[index].sub_status = subStatuses?.find(
        (single) => single.code === value,
      )?.sub_status;
      setPurchaseHistoryData(dataResult);
    }
  };

  useEffect(() => {
    if (!purchaseHistoryData?.items) {
      return;
    }
    if (typeAPi === type.trackingCode) {
      if (selectedOrder && selectedOrder.fulfillments) {
        const fulfillment = getFulfillmentActive(selectedOrder.fulfillments);
        if (!fulfillment?.code) {
          return;
        }
        dispatch(
          getTrackingLogFulfillmentAction(fulfillment?.code, (response) => {
            // setIsVisiblePopup(true)
            const index = purchaseHistoryData.items?.findIndex(
              (single) => single.id === selectedOrder.id,
            );
            if (index > -1) {
              let dataResult: dataExtra = { ...purchaseHistoryData };
              dataResult.items[index].trackingLog = response;
              dataResult.items[index].isShowTrackingLog = true;
              setPurchaseHistoryData(dataResult);
            }
          }),
        );
      }
    } else if (typeAPi === type.setSubStatus) {
    }
    //xóa data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, selectedOrder, setPurchaseHistoryData, type.subStatus, type.trackingCode, typeAPi]);

  const columnsPurchaseHistory: Array<ICustomTableColumType<any>> = useMemo(
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
        render: (item: any) => {
          return (
            <div>
              <div className="noWrap">
                {item.code_order_return ? (
                  <>
                    <Tooltip title="Mã đơn trả hàng">
                      <Link to={`${UrlConfig.ORDERS_RETURN}/${item.id}`} target="_blank">
                        {item.code_order_return}
                      </Link>
                    </Tooltip>
                    <Tooltip title="Click để copy">
                      <img
                        onClick={(e) => {
                          copyTextToClipboard(e, item.code_order_return.toString());
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
                {item.code_order_return ? (
                  <div style={{ display: "block" }}>
                    <div className="textSmall">
                      <span style={{ fontWeight: "bold" }}>Đơn gốc: </span>
                      <Tooltip title="Mã đơn gốc">
                        <Link to={`${UrlConfig.ORDER}/${item.order_id}`} target="_blank">
                          {item.code_order}
                        </Link>
                      </Tooltip>
                    </div>
                    <div className="textSmall" style={{ color: "red", fontWeight: "bold" }}>
                      Trả hàng
                    </div>
                  </div>
                ) : !item.code_order_return && checkIfOrderCanBeReturned(item) ? (
                  <div style={{ marginRight: 5 }}>
                    <ButtonCreateOrderReturn orderDetail={item} />
                  </div>
                ) : null}
                {item.status === OrderStatus.FINISHED || item.status === OrderStatus.COMPLETED ? (
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
                              <div
                                style={{
                                  color: dangerColor,
                                  textAlign: "right",
                                }}
                              >
                                {"-" + formatCurrency(item.discount_items[0]?.value)}
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
        render: (record: any) => {
          const discountAmount = record.discounts && record.discounts[0]?.amount;
          return (
            <>
              {/*Đơn hàng*/}
              {!record.code_order_return && (
                <React.Fragment>
                  <Tooltip title="Tổng tiền">
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
                  </Tooltip>
                </React.Fragment>
              )}

              {/*Đơn trả hàng*/}
              {record.code_order_return && (
                <React.Fragment>
                  {record.discounts?.length > 0 ? (
                    <Tooltip title="Khuyến mại đơn hàng">
                      <div style={{ color: dangerColor }}>
                        <span> - {formatCurrency(record.discounts[0].value)}</span>
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
        align: "left",
        width: 65,
        render: (data: any) => {
          return (
            <React.Fragment>
              {/*Đơn hàng*/}
              {!data.code_order_return && data.payments && renderOrderPayments(data)}

              {/*Đơn trả*/}
              {data.code_order_return && renderOrderReturnPayments(data)}
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
        render: (data: any) => (
          <>
            {data.code_order_return ? (
              <div>
                <div className="plus-point">{`Trừ Tích: ${
                  data.change_point?.subtract ? data.change_point?.subtract : 0
                }`}</div>
                <div className="minus-point">{`Hoàn Tiêu: ${
                  data.change_point?.add ? data.change_point?.add : 0
                }`}</div>
              </div>
            ) : (
              <div>
                <div className="plus-point">{`Tích: ${
                  data.change_point?.add ? data.change_point?.add : 0
                }`}</div>
                <div className="minus-point">{`Tiêu: ${
                  data.change_point?.subtract ? data.change_point?.subtract : 0
                }`}</div>
                {data.status === OrderStatus.CANCELLED && (
                  <div className="minus-point">{`Hoàn tiêu: ${
                    data.change_point?.subtract ? data.change_point?.subtract : 0
                  }`}</div>
                )}
              </div>
            )}
          </>
        ),
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
          if (record.code_order_return) {
            let textResult = getReturnMoneyStatusText(record?.payment_status);
            let textColor = getReturnMoneyStatusColor(record?.payment_status);
            return (
              <React.Fragment>
                <div className="text-return-status 111">
                  <span style={{ color: textColor }}>{textResult}</span>
                </div>
              </React.Fragment>
            );
          }
          //const status = status_order.find((status) => status.value === record.status);
          let recordStatuses = record?.statuses;
          if (!recordStatuses) {
            recordStatuses = [];
          }
          let selected = record.sub_status_code ? record.sub_status_code : "finished";
          if (!recordStatuses.some((single: any) => single.code === selected)) {
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
        render: (data: any, record: OrderModel) => {
          const orderReturnReason = data.return_reason?.name || data.reason || ""; // cập nhật lại khi BE thay đổi theo SO
          return (
            <div className="orderNotes">
              {data.code_order_return ? (
                <div className="order-reason">
                  <span className="order-reason-heading">{"Lý do trả: "}</span>
                  <span className="order-reason-content">{orderReturnReason}</span>
                </div>
              ) : (
                <>
                  <div className="single order-note">
                    <EditNote
                      note={data.customer_note}
                      title="Khách hàng: "
                      color={primaryColor}
                      onOk={(newNote) => {
                        editNote(newNote, "customer_note", data.id);
                      }}
                      isDisable={data.status === OrderStatus.FINISHED}
                    />
                  </div>
                  <div className="single order-note">
                    <EditNote
                      note={promotionUtils.getPrivateNoteFromResponse(record.note || "")}
                      title="Nội bộ: "
                      color={primaryColor}
                      onOk={(newNote) => {
                        editNote(newNote, "note", data.id);
                      }}
                      isDisable={data.status === OrderStatus.FINISHED}
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
        render: (value: string, record: any) => {
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
                            <Popover
                              placement="left"
                              content={renderOrderTrackingLog(record)}
                              trigger="click"
                            >
                              <Tooltip title="Tiến trình giao hàng">
                                <img
                                  src={IconTrackingCode}
                                  alt=""
                                  className="trackingCodeImg"
                                  onClick={() => {
                                    setTypeAPi(type.trackingCode);
                                    setSelectedOrder(record);
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
      // {
      //   title: "NV bán hàng",
      //   key: "assignee",
      //   visible: true,
      //   align: "center",
      //   width: 136,
      //   render: (record: any) => (
      //     <Link
      //       target="_blank"
      //       to={`${UrlConfig.ACCOUNTS}/${record.assignee_code}`}>
      //       {`${record.assignee_code} - ${record.assignee}`}
      //     </Link>
      //   ),
      // },
      // {
      //   title: "NV tạo đơn",
      //   key: "account",
      //   visible: true,
      //   align: "center",
      //   width: 130,
      //   render: (record: any) => (
      //     <Link
      //       target="_blank"
      //       to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}
      //     >
      //       {record.account && record.account_code &&
      //         `${record.account_code} - ${record.account}`
      //       }
      //     </Link>
      //   ),
      // },
      // {
      //   title: "Ngày hoàn tất đơn",
      //   key: "finished_on",
      //   visible: true,
      //   align: "center",
      //   width: 150,
      //   render: (data: any) => <div>{ConvertUtcToLocalDate(data.finished_on)}</div>,
      // },
      // {
      //   title: "Ngày huỷ đơn",
      //   key: "cancelled_on",
      //   visible: true,
      //   align: "center",
      //   width: 150,
      //   render: (data: any) => <div>{ConvertUtcToLocalDate(data.cancelled_on)}</div>,
      // },
      // {
      //   title: "Biên bản bàn giao",
      //   key: "goods_receipt_id",
      //   align: "center",
      //   visible: false,
      //   width: 160,
      //   render: (data: any) => {
      //     if (data.goods_receipt_id) {
      //       return (
      //         <Link to={`${UrlConfig.PACK_SUPPORT}/${data.goods_receipt_id}`}>
      //           {data.goods_receipt_id}
      //         </Link>
      //       );
      //     } else {
      //       return "-";
      //     }
      //   },
      // },
      // {
      //   title: "Mã Afilliate",
      //   key: "Mã Afilliate",
      //   visible: true,
      //   render: () => null,
      //   // width: 160,
      // },
      // {
      //   title: "Ghi chú hóa đơn",
      //   key: "Ghi chú hóa đơn",
      //   visible: true,
      //   render: () => null,
      //   // width: 190,
      // },
      // {
      //   title: "Tag",
      //   key: "tags",
      //   visible: true,
      //   align: "left",
      //   width: 150,
      //   render: (data: any) => {
      //     let result: React.ReactNode = null;
      //     if (data?.tags) {
      //       const listTags = data?.tags.split(",");
      //       if (listTags && listTags.length > 0) {
      //         result = (
      //           <ul>
      //             {listTags.map((tag: any, index: number) => {
      //               return <li key={index}>{tag}</li>;
      //             })}
      //           </ul>
      //         );
      //       }
      //     }
      //     return result;
      //   },
      // },
      // {
      //   title: "Mã tham chiếu",
      //   key: "reference_code",
      //   visible: true,
      //   width: 150,
      //   render: (data: any) => {
      //     let result: React.ReactNode = null;
      //     if (data?.url) {
      //       result = <a href={data?.url}>{data.reference_code}</a>;
      //     }
      //     if (data?.linked_order_code) {
      //       return (
      //         <Link to={`${UrlConfig.ORDER}/${data.linked_order_code}`} target="_blank">
      //           {data?.linked_order_code}
      //         </Link>
      //       );
      //     } else {
      //       result = data.reference_code;
      //     }
      //     return result;
      //   },
      // },
    ],
    [
      deliveryServices,
      editNote,
      renderOrderPayments,
      renderOrderReturnPayments,
      status_order,
      subStatuses,
      type.trackingCode,
    ],
  );

  console.log("purchaseHistoryData", purchaseHistoryData.items);
  return (
    <StyledPurchaseHistory>
      <Form onFinish={onFinish} form={formOrderHistoryFilter} layout="inline">
        <div className={"filter-line"}>
          <Form.Item name="variant_ids" className={"search-variant"}>
            {rerenderSearchVariant && (
              <DebounceSelect
                mode="multiple"
                showArrow
                maxTagCount="responsive"
                placeholder="Tìm kiếm theo Tên/Mã/Barcode sản phẩm"
                allowClear
                fetchOptions={handleSearchVariantAndBarCode}
                optionsVariant={optionsVariant}
                onClear={handleClearSearchOrderCustomer}
              />
            )}
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
        </div>
      </Form>
      <CustomTable
        bordered
        isLoading={tableLoading}
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
      <SubStatusChange
        orderId={selectedOrder?.id}
        toSubStatus={toSubStatusCode}
        setToSubStatusCode={setToSubStatusCode}
        changeSubStatusCallback={changeSubStatusCallback}
      />
    </StyledPurchaseHistory>
  );
}

export default PurchaseHistory;
