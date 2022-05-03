import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Button, Col, Form, Tooltip} from "antd";
import CustomTable, {ICustomTableColumType,} from "component/table/CustomTable";
import NumberFormat from "react-number-format";
import {Link, useHistory, useLocation} from "react-router-dom";
import UrlConfig from "config/url.config";
import {ConvertUtcToLocalDate, DATE_FORMAT} from "utils/DateUtils";
import {convertItemToArray, checkIfOrderCanBeReturned, formatCurrency, generateQuery, getOrderTotalPaymentAmount} from "utils/AppUtils";
import {PageResponse} from "model/base/base-metadata.response";
import moment from "moment";
import {DeliveryServiceResponse} from "model/response/order/order.response";
import {dangerColor, primaryColor, yellowColor} from "utils/global-styles/variables";
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
import {
  getCustomerOrderHistoryAction,
  getCustomerOrderReturnHistoryAction
} from "../../../domain/actions/customer/customer.action";
import { getVariantApi, searchVariantsApi } from "service/product/product.service";
import DebounceSelect from "component/filter/component/debounce-select";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import queryString from "query-string";
import ButtonCreateOrderReturn from "screens/order-online/component/ButtonCreateOrderReturn";
import _ from "lodash";
import {RootReducerType} from "../../../model/reducers/RootReducerType";


const PAYMENT_ICON = [
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

type PurchaseHistoryProps = {
  customer: any;
};

const initOrderSearchingQuery: any = {
  limit: 10,
  page: 1,
  variant_ids: [],
}

function PurchaseHistory(props: PurchaseHistoryProps) {
  const { customer } = props;
  const history = useHistory()
  const location = useLocation()
  const queryParamsParsed: any = queryString.parse(
    location.search
  );
  const status_order = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.order_status
  );
  const [formOrderHistoryFilter] = Form.useForm()

  const dispatch = useDispatch();

  const [deliveryServices, setDeliveryServices] = useState<
    Array<DeliveryServiceResponse>
    >([]);

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      })
    );
  }, [dispatch]);

  //handle get purchase history
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [orderHistoryQueryParams, setOrderHistoryQueryParams] = useState<any>(initOrderSearchingQuery);
  const [optionsVariant, setOptionsVariant] = useState<{ label: string; value: string }[]>([]);
  const [rerenderSearchVariant, setRerenderSearchVariant] = useState(false);

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

  const updateOrderReturnedList = useCallback(
    (data: any) => {
      setTableLoading(false);
      if (data) {
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
  // end order returned history

  // handle order history
  const [orderHistoryData, setOrderHistoryData] = useState<
    PageResponse<any>
  >({
    metadata: {
      limit: 10,
      page: 1,
      total: 0,
    },
    items: [],
  });

  async function handleSearchVariantAndBarCode (value: any){
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
          })
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
  const updateOrderHistoryData = useCallback(
    (data: any) => {
      setTableLoading(false);
      if (data) {
        setOrderHistoryData(data);
      }
    },
    []
  );

  const getCustomerOrderHistory = useCallback((params: any) => {
    if (customer?.id) {
      const newParams = {
        ...params,
        variant_ids: convertItemToArray(params.variant_ids),
        customer_id: customer?.id,
      }
      setTableLoading(true);
      dispatch(getCustomerOrderHistoryAction(newParams, updateOrderHistoryData));
    }
  }, [customer?.id, dispatch, updateOrderHistoryData]);

  useEffect(() => {
    const dataQuery: any = {
      ...initOrderSearchingQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    }
    setOrderHistoryQueryParams(dataQuery);
    getCustomerOrderHistory(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, getCustomerOrderHistory, location.search]);
  // end handle get customer order history

  // update form fields value
  useEffect(() => {
    formOrderHistoryFilter.setFieldsValue({
      variant_ids: orderHistoryQueryParams.variant_ids,
    })
  }, [formOrderHistoryFilter, orderHistoryQueryParams.variant_ids]);

  const onFinish = useCallback((values: any) => {
    const newParams = { ...orderHistoryQueryParams, ...values, page: 1 }
    const queryParam = generateQuery(newParams);
    const currentParam = generateQuery(orderHistoryQueryParams);
    if (currentParam !== queryParam) {
      history.push(`${location.pathname}?${queryParam}`);
    } else {
      getCustomerOrderHistory(newParams);
    }
  }, [getCustomerOrderHistory, history, location.pathname, orderHistoryQueryParams])

  const handleClearSearchOrderCustomer = () => {
    let queryParam = generateQuery(initOrderSearchingQuery);
    history.push(`${location.pathname}?${queryParam}`);
  }

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...orderHistoryQueryParams, page, limit }
      let queryParam = generateQuery(newParams);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, orderHistoryQueryParams]
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
        return (b.created_date < a.created_date) ? -1 : ((b.created_date > a.created_date) ? 1 : 0);
      });
      setPurchaseHistoryData(newPurchaseHistoryData);
    }
  }, [formOrderHistoryFilter, orderHistoryData, orderHistoryQueryParams.variant_ids, orderReturnedList]);

  // handle payment column
  const renderOrderTotalPayment = useCallback(
    (orderDetail: any) => {
      const isOfflineOrder = orderDetail?.channel_id === POS.channel_id;
      const totalPayment = getOrderTotalPaymentAmount(orderDetail?.payments);

      return (
        <React.Fragment>
          {isOfflineOrder ? null :
            <div className="orderTotalLeftAmount">
              <Tooltip title="Tiền còn thiếu">
                {formatCurrency(orderDetail.total - totalPayment)}
              </Tooltip>
            </div>
          }
        </React.Fragment>
      );
    },
    [],
  )

  const renderOrderPaymentMethods = useCallback((orderDetail: any) => {
    return (
      orderDetail?.payments?.map((payment: any, index: number) => {
        const selectedPayment = PAYMENT_ICON.find(
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
          <div
            className={`singlePayment ${payment.payment_method_code === PaymentMethodCode.POINT ? 'ydPoint' : null}`}
            key={index}
          >
            <Tooltip title={selectedPayment?.tooltip || payment.payment_method}>
              <img src={selectedPayment?.icon} alt="" />
              <span className="amount">{formatCurrency(payment.paid_amount)}</span>
            </Tooltip>
          </div>
        );
      })
    )
  }, []);

  const renderOrderReturn = useCallback(
    (orderDetail: any) => {
      let returnAmount = 0
      orderDetail.payments.forEach((payment: any) => {
        if(payment.return_amount > 0) {
          returnAmount = returnAmount + payment.return_amount
        }
      })
      if(returnAmount > 0) {
        return (
          <Tooltip title={"Tiền hoàn lại"}>
            <strong className="amount" style={{color: yellowColor}}>
              {formatCurrency(returnAmount)}
            </strong>
          </Tooltip>
        );
      }
      return null
    },
    []
  );

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
    [renderOrderPaymentMethods, renderOrderReturn, renderOrderTotalPayment]
  );

  const renderOrderReturnPayments = useCallback(
    (record: any) => {
      return (
        <React.Fragment>
          {record.change_point?.add &&
            <Tooltip title="Hoàn điểm">
              <div>
                <img src={IconPaymentPoint} alt="" />
                <NumberFormat
                  value={record.change_point?.add}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                  style={{ fontWeight: 500, color: "#fcaf17", paddingLeft: 5 }}
                />
              </div>
            </Tooltip>
          }

          {record.total &&
            <Tooltip title="Tiền trả khách">
              <div style={{ fontWeight: 500 }}>
                <NumberFormat
                  value={record.total || 0}
                  className="foo"
                  displayType={"text"}
                  thousandSeparator={true}
                />
              </div>
            </Tooltip>
          }
        </React.Fragment>
      );
    },
    []
  );
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
        checkIfOrderCanBeReturned(item) ? (
          <div style={{marginTop: 5}}>
          <ButtonCreateOrderReturn orderDetail={item} />
        </div>
        ) : null
      )
    }
  };

  const columnsPurchaseHistory: Array<ICustomTableColumType<any>> = useMemo(() =>
    [
      {
        title: "ID đơn hàng",
        visible: true,
        fixed: "left",
        className: "custom-shadow-td",
        width: 170,
        render: (item: any) => {
          return (
            <div>
              {item.code_order_return ?
                <Link to={`${UrlConfig.ORDERS_RETURN}/${item.id}`} target="_blank">{item.code_order_return}</Link>
                :
                <Link to={`${UrlConfig.ORDER}/${item.id}`} target="_blank">{item.code}</Link>
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
              </div>

              {item.code_order_return ?
                <div style={{ color: "red", fontWeight: "bold" }}>Trả hàng</div>
                :
                renderReturn(item)
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

                        {item?.discount_items && item.discount_items[0]?.value && (
                          <Tooltip title="Khuyến mại sản phẩm">
                            <div style={{ color: dangerColor, textAlign: "right" }}>
                              <div>{"- "}{formatCurrency(item.discount_items[0]?.value)}</div>
                              <div>({Math.round(item.discount_items[0]?.rate * 100) / 100}%)</div>
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
      },
      {
        title: "Thành tiền",
        key: "customer.amount_money",
        visible: true,
        align: "right",
        width: 100,
        render: (record: any) => {
          let orderReturnAmount = record.total_amount || 0;
          if (record.code_order_return && record.discounts?.length > 0) {
            orderReturnAmount = orderReturnAmount - record.discounts[0].amount;
          }
          const discountAmount = record.discounts && record.discounts[0]?.amount;
          return (
            <>
              {/*Đơn hàng*/}
              {!record.code_order_return &&
                <React.Fragment>
                  <Tooltip title="Tổng tiền">
                    <NumberFormat
                      value={record.total_line_amount_after_line_discount}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </Tooltip>

                  <Tooltip title="Chiết khấu đơn hàng">
                    <div style={{color: "#EF5B5B"}}>
                      <div>
                        <span>- </span>
                        <NumberFormat
                          value={discountAmount || 0}
                          className="foo"
                          displayType={"text"}
                          thousandSeparator={true}
                        />
                      </div>
                      {record.discounts && record.discounts[0]?.rate &&
                        <div>({Math.round(record.discounts[0]?.rate * 100) / 100}%)</div>
                      }
                    </div>
                  </Tooltip>

                  <Tooltip title="Tiền khách cần trả">
                    <div style={{fontWeight: "bold"}}>
                      <NumberFormat
                        value={record.total}
                        className="foo"
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    </div>
                  </Tooltip>
                </React.Fragment>
              }

              {/*Đơn trả hàng*/}
              {record.code_order_return &&
                <React.Fragment>
                  <Tooltip title="Tổng tiền">
                    <NumberFormat
                      value={orderReturnAmount}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                      style={{ fontWeight: "bold" }}
                    />
                  </Tooltip>
                </React.Fragment>
              }
            </>
          )
        },
      },
      {
        title: "Thanh toán",
        key: "payment_status",
        visible: true,
        align: "left",
        width: 120,
        render: (data: any) => {
          return (
            <React.Fragment>
              {!data.code_order_return && data.payments && renderOrderPayments(data)}
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
        width: 130,
        render: (data: any) => (
          <>
            {data.code_order_return ?
              <div className="order-point-screen">
                <span style={{ color: "#27AE60" }}>{`Trừ Tích: ${data.change_point?.subtract ? data.change_point?.subtract : 0}`}</span>
                <span style={{ color: "#E24343" }}>{`Hoàn Tiêu: ${data.change_point?.add ? data.change_point?.add : 0}`}</span>
              </div>
              :
              <div className="order-point-column order-point-screen">
                <span style={{ color: "#27AE60" }}>{`Tích: ${data.change_point?.add ? data.change_point?.add : 0}`}</span>
                <span style={{ color: "#E24343" }}>{`Tiêu: ${data.change_point?.subtract ? data.change_point?.subtract : 0}`}</span>
              </div>
            }
          </>
        ),
      },
      {
        title: "Ghi chú",
        className: "notes",
        key: "note",
        visible: true,
        align: "left",
        width: 160,
        render: (data: any) => {
          const orderReturnReason = data.return_reason?.name || data.reason || "";    // cập nhật lại khi BE thay đổi theo SO
          return (
            <div className="orderNotes">
              {data.code_order_return ?
                <div className="order-reason">
                  <span className="order-reason-heading">{"Lý do trả: "}</span>
                  <span className="order-reason-content">{orderReturnReason}</span>
                </div>
                :
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
                      note={data.note}
                      title="Nội bộ: "
                      color={primaryColor}
                      onOk={(newNote) => {
                        editNote(newNote, "note", data.id);
                      }}
                      isDisable={data.status === OrderStatus.FINISHED}
                    />
                  </div>
                </>
              }
            </div>
          );
        },
      },
      {
        title: "Trạng thái",
        key: "status",
        className: "orderStatus",
        visible: true,
        align: "left",
        width: 120,
        render: (record: any) => {
          if (!record || !status_order) {
            return null;
          }
          const status = status_order.find((status) => status.value === record.status);

          const received = {
            text: record.received ? "Đã nhận" : "Chưa nhận",
            color: record.received ? "#27AE60" : "#E24343",
          };

          const payment_status = {
            text: record.payment_status === PoPaymentStatus.PAID ? "Đã hoàn" : "Chưa hoàn",
            color: record.payment_status === PoPaymentStatus.PAID ? "#27AE60" : "#E24343",
          };

          return (
            <>
              {!record.code_order_return &&
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

              {record.code_order_return &&
                <div style={{ paddingLeft: 10 }}>
                  <div>
                    <div>
                      <strong>Hàng: </strong>
                      <span style={{ color: `${received.color}` }}>{received.text}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#666666" }}>
                      {record.receive_date
                        ? moment(record.receive_date).format(DATE_FORMAT.HHmm_DDMMYYYY)
                        : ""}
                    </div>
                  </div>

                  <div>
                    <strong>Tiền: </strong>
                    <span style={{ color: `${payment_status.color}` }}>{payment_status.text}</span>
                  </div>
                </div>
              }
            </>
          );
        },
      },
      {
        title: "Vận chuyển",
        key: "shipment.type",
        className: "shipmentType",
        visible: true,
        width: 120,
        align: "left",
        render: (value: string, record: any) => {
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
      },
      {
        title: "NV bán hàng",
        key: "assignee",
        visible: true,
        align: "center",
        width: 136,
        render: (record: any) => (
          <Link
            target="_blank"
            to={`${UrlConfig.ACCOUNTS}/${record.assignee_code}`}>
            {`${record.assignee_code} - ${record.assignee}`}
          </Link>
        ),
      },
      {
        title: "NV tạo đơn",
        key: "account",
        visible: true,
        align: "center",
        width: 130,
        render: (record: any) => (
          <Link
            target="_blank"
            to={`${UrlConfig.ACCOUNTS}/${record.account_code}`}
          >
            {record.account && record.account_code &&
              `${record.account_code} - ${record.account}`
            }
          </Link>
        ),
      },
      {
        title: "Ngày hoàn tất đơn",
        key: "finished_on",
        visible: true,
        align: "center",
        width: 150,
        render: (data: any) => <div>{ConvertUtcToLocalDate(data.finished_on)}</div>,
      },
      {
        title: "Ngày huỷ đơn",
        key: "cancelled_on",
        visible: true,
        align: "center",
        width: 150,
        render: (data: any) => <div>{ConvertUtcToLocalDate(data.cancelled_on)}</div>,
      },
      {
        title: "Biên bản bàn giao",
        key: "goods_receipt_id",
        align: "center",
        visible: false,
        width: 160,
        render: (data: any) => {
          if (data.goods_receipt_id) {
            return (
              <Link to={`${UrlConfig.PACK_SUPPORT}/${data.goods_receipt_id}`}>
                {data.goods_receipt_id}
              </Link>
            );
          } else {
            return "-";
          }
        },
      },
      {
        title: "Mã Afilliate",
        key: "Mã Afilliate",
        visible: true,
        render: () => null,
        // width: 160,
      },
      {
        title: "Ghi chú hóa đơn",
        key: "Ghi chú hóa đơn",
        visible: true,
        render: () => null,
        // width: 190,
      },
      {
        title: "Tag",
        key: "tags",
        visible: true,
        align: "left",
        width: 150,
        render: (data: any) => {
          let result: React.ReactNode = null;
          if (data?.tags) {
            const listTags = data?.tags.split(",");
            if (listTags && listTags.length > 0) {
              result = (
                <ul>
                  {listTags.map((tag: any, index: number) => {
                    return <li key={index}>{tag}</li>;
                  })}
                </ul>
              );
            }
          }
          return result;
        },
      },
      {
        title: "Mã tham chiếu",
        key: "reference_code",
        visible: true,
        width: 150,
        render: (data: any) => {
          let result: React.ReactNode = null;
          if (data?.url) {
            result = <a href={data?.url}>{data.reference_code}</a>;
          }
          if (data?.linked_order_code) {
            return (
              <Link to={`${UrlConfig.ORDER}/${data.linked_order_code}`} target="_blank">
                {data?.linked_order_code}
              </Link>
            );
          } else {
            result = data.reference_code;
          }
          return result;
        },
      },
    ],
  [deliveryServices, editNote, renderOrderPayments, renderOrderReturnPayments, status_order]
  );

  return (
    <StyledPurchaseHistory>
      <Form
       onFinish={onFinish}
       form={formOrderHistoryFilter}
       layout="inline"
      >
        <Col span={22} style={{ paddingBottom: "20px" }}>
            <Form.Item name="variant_ids">
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
        </Col>

        <Col span={2}>
          <Button type="primary" htmlType="submit">
            Lọc
          </Button>
        </Col>
      </Form>
      <CustomTable
        bordered
        isLoading={tableLoading}
        showColumnSetting={true}
        scroll={{ x: 2800 }}
        sticky={{ offsetScroll: 10, offsetHeader: 55 }}
        pagination={{
          pageSize: purchaseHistoryData.metadata?.limit,
          total: purchaseHistoryData.metadata?.total,
          current: purchaseHistoryData.metadata?.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        dataSource={purchaseHistoryData.items}
        columns={columnsPurchaseHistory}
        rowKey={(item: any) => item.id}
      />
    </StyledPurchaseHistory>
  );
}

export default PurchaseHistory;
