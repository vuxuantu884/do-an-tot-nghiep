import {Button, Card, Col, Collapse, Divider, Form, Modal, Row, Space, Tag} from "antd";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import {OrderDetailContext} from "contexts/order-online/order-detail-context";
import {AccountSearchAction} from "domain/actions/account/account.action";
import {StoreDetailAction} from "domain/actions/core/store.action";
import {CustomerDetail} from "domain/actions/customer/customer.action";
import {getLoyaltyPoint, getLoyaltyUsage} from "domain/actions/loyalty/loyalty.action";
import {actionSetIsReceivedOrderReturn} from "domain/actions/order/order-return.action";
import {
  cancelOrderRequest,
  confirmDraftOrderAction,
  OrderDetailAction,
  PaymentMethodGetList,
  UpdatePaymentAction,
} from "domain/actions/order/order.action";
import {AccountResponse} from "model/account/account.model";
import {PageResponse} from "model/base/base-metadata.response";
import {OrderSettingsModel} from "model/other/order/order-model";
import {RootReducerType} from "model/reducers/RootReducerType";
import {
  OrderPaymentRequest,
  UpdateOrderPaymentRequest,
} from "model/request/order.request";
import {CustomerResponse} from "model/response/customer/customer.response";
import {LoyaltyPoint} from "model/response/loyalty/loyalty-points.response";
import {LoyaltyUsageResponse} from "model/response/loyalty/loyalty-usage.response";
import {OrderResponse, StoreCustomResponse} from "model/response/order/order.response";
import {PaymentMethodResponse} from "model/response/order/paymentmethod.response";
import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useHistory, useParams} from "react-router-dom";
import {
  checkPaymentAll,
  checkPaymentStatusToShow,
  formatCurrency,
  getAmountPayment,
  SumCOD,
} from "utils/AppUtils";
import {FulFillmentStatus, OrderStatus, PaymentMethodCode, PaymentMethodOption, ShipmentMethodOption} from "utils/Constants";
import {ConvertUtcToLocalDate} from "utils/DateUtils";
import {showSuccess} from "utils/ToastUtils";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardReturnMoney from "./component/order-detail/CardReturnMoney";
import ActionHistory from "./component/order-detail/Sidebar/ActionHistory";
import SidebarOrderDetailExtraInformation from "./component/order-detail/Sidebar/SidebarOrderDetailExtraInformation";
import SidebarOrderDetailInformation from "./component/order-detail/Sidebar/SidebarOrderDetailInformation";
import SidebarOrderHistory from "./component/order-detail/Sidebar/SidebarOrderHistory";
import UpdateCustomerCard from "./component/update-customer-card";
import UpdatePaymentCard from "./component/update-payment-card";
import UpdateProductCard from "./component/update-product-card";
import UpdateShipmentCard from "./component/update-shipment-card";
import CardReturnReceiveProducts from "./order-return/components/CardReturnReceiveProducts";
import CardShowReturnProducts from "./order-return/components/CardShowReturnProducts";
import CardShipment from "./component/order-detail/CardShipment";
import OrderCreateShipment from "component/order/OrderCreateShipment";
const {Panel} = Collapse;

type PropType = {
  id?: string;
};
type OrderParam = {
  id: string;
};

const OrderDetail = (props: PropType) => {
  let {id} = useParams<OrderParam>();
  const history = useHistory();
  if (!id && props.id) {
    id = props.id;
  }
  let OrderId = parseInt(id);
  const isFirstLoad = useRef(true);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [paymentMethod, setPaymentMethod] = useState<number>(3);
  const [isVisibleUpdatePayment, setVisibleUpdatePayment] = useState(false);

  const [shipmentMethod, setShipmentMethod] = useState<number>(4);
  const [isVisibleShipping, setVisibleShipping] = useState(false);
  const [reload, setReload] = useState(false);
  const [isError, setError] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [OrderDetailAllFullfilment, setOrderDetailAllFullfilment] =
    useState<OrderResponse | null>(null);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(null);
  const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
    useState<number>(0);
  // const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);

  // đổi hàng
  // const [totalAmountReturnProducts, setTotalAmountReturnProducts] =
  //   useState<number>(0);
  const [totalAmountReturnProducts] = useState<number>(0);
  // console.log("totalAmountReturnProducts", totalAmountReturnProducts);
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] = useState(false);

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);
  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);

  // xác nhận đơn
  const [isShowConfirmOrderButton, setIsShowConfirmOrderButton] = useState(false);
  const [subStatusId, setSubStatusId] = useState<number | undefined>(undefined);

  const onPaymentSelect = (paymentMethod: number) => {
    if (paymentMethod === 1) {
      setVisibleShipping(true);
    }
    setPaymentMethod(paymentMethod);
  };

  const onUpdateSuccess = useCallback((value: OrderResponse) => {
    showSuccess("Thanh toán thành công!");
    window.location.reload();
  }, []);

  const handleReturnMoney = () => {
    form.validateFields().then(() => {
      let fulfillment = OrderDetail?.fulfillments;
      let formValue = form.getFieldsValue();
      let payments: UpdateOrderPaymentRequest[] = [];
      const formReturnMoney = formValue.returnMoneyField[0];
      let returnMoneyMethod = listPaymentMethods.find((single) => {
        return single.id === formReturnMoney.returnMoneyMethod;
      });
      if (returnMoneyMethod) {
        payments = [
          {
            payment_method_id: returnMoneyMethod.id,
            payment_method: returnMoneyMethod.name,
            amount: -Math.abs(
              customerNeedToPayValue -
                (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
            ),
            reference: "",
            source: "",
            paid_amount: -Math.abs(
              customerNeedToPayValue -
                (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
            ),
            return_amount: 0.0,
            status: "paid",
            type: "",
            note: formReturnMoney.returnMoneyNote || "",
            code: "",
            order_id: OrderDetail?.id ? OrderDetail?.id : null,
            customer_id: customerDetail?.id || null,
          },
        ];
      }

      let request = {
        payments: payments,
        fulfillments: fulfillment,
      };
      // console.log("request", request);
      if (OrderDetail?.id) {
        dispatch(UpdatePaymentAction(request, OrderDetail?.id, onUpdateSuccess));
      }
    });
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    // setPayments(value);
  };

  const [isShowPaymentPartialPayment, setShowPaymentPartialPayment] = useState(false);

  const stepsStatus = () => {
    if (OrderDetail?.status === OrderStatus.DRAFT) {
      return OrderStatus.DRAFT;
    }

    if (OrderDetail?.status === OrderStatus.CANCELLED) {
      return OrderStatus.CANCELLED;
    }
    if (OrderDetail?.status === OrderStatus.FINISHED) {
      return FulFillmentStatus.SHIPPED;
    }
    if (OrderDetail?.status === OrderStatus.FINALIZED) {
      if (
        OrderDetail.fulfillments === undefined ||
        OrderDetail.fulfillments === null ||
        OrderDetail.fulfillments.length === 0
      ) {
        return OrderStatus.FINALIZED;
      } else {
        if (
          OrderDetail.fulfillments !== undefined &&
          OrderDetail.fulfillments !== null &&
          OrderDetail.fulfillments.length > 0
        ) {
          if (OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED) {
            return OrderStatus.FINALIZED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.PICKED) {
            return FulFillmentStatus.PICKED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.PACKED) {
            return FulFillmentStatus.PACKED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.SHIPPING) {
            return FulFillmentStatus.SHIPPING;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.SHIPPED) {
            return FulFillmentStatus.SHIPPED;
          }
        }
      }
    } else if (OrderDetail?.status === OrderStatus.FINISHED) {
      return FulFillmentStatus.SHIPPED;
    }
    return "";
  };

  const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
    chonCuaHangTruocMoiChonSanPham: false,
    cauHinhInNhieuLienHoaDon: 1,
  });

  // const handleReload = () => {
  //   window.location.reload();
  // };

  const handleReceivedReturnProducts = () => {
    setIsReceivedReturnProducts(true);
    if (OrderDetail?.order_return_origin?.id) {
      dispatch(
        actionSetIsReceivedOrderReturn(OrderDetail?.order_return_origin?.id, () => {
          dispatch(OrderDetailAction(id, onGetDetailSuccess));
        })
      );
    }
  };

  let stepsStatusValue = stepsStatus();

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    // setAccounts(data.items);
  }, []);
  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
    setLoadingData(false);
    if (!data) {
      setError(true);
    } else {
      let _data = {
        ...data,
        fulfillments: data.fulfillments?.sort((a, b) => b.id - a.id),
      };
      _data.fulfillments = _data.fulfillments?.filter(
        (f) =>
          f.status !== FulFillmentStatus.CANCELLED &&
          f.status !== FulFillmentStatus.RETURNED &&
          f.status !== FulFillmentStatus.RETURNING
      );

      setOrderDetail(_data);
      setOrderDetailAllFullfilment(data);
      setIsReceivedReturnProducts(_data.order_return_origin?.received ? true : false);
      if (_data.sub_status_id) {
        setSubStatusId(_data.sub_status_id);
      }
      if (
        _data.status === OrderStatus.DRAFT &&
        // _data.fulfillments?.length === 0 &&
        _data.payments?.length === 0
      ) {
        setIsShowConfirmOrderButton(true);
      } else {
        setIsShowConfirmOrderButton(false);
      }
    }
  }, []);

  const handleUpdateSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  const onSuccessCancel = () => {
    setReload(true);
  };

  const onError = () => {
    // setReload(true)
  };

  const handleCancelOrder = useCallback(
    (id: any) => {
      // dispatch(cancelOrderRequest(id, onSuccessCancel, onError));
      // dispatch(cancelOrderRequest(id));
    },
    [dispatch]
  );

  const cancelModal = useCallback(
    (type) => {
      // console.log("OrderDetail", OrderDetail);
      switch (type) {
        case 1:
          Modal.confirm({
            title: `Xác nhận huỷ đơn hàng`,
            content: (
              <div>
                <p>
                  Bạn chắc chắn muốn huỷ đơn hàng <b>{OrderDetail?.code}</b>? Thao tác này
                  không thể khôi phục và tác động:
                </p>
                <p>- Thay đổi thông số kho các sản phẩm trong đơn hàng</p>
                <p>
                  - Huỷ các chứng từ liên quan: vận đơn, phiếu thu thanh toán đơn hàng,
                  phiếu thu đặt cọc shipper
                </p>
                <p>- Cập nhật công nợ khách hàng, công nợ đối tác vận chuyển</p>
                <p>- Cập nhật lịch sử khuyến mãi, lịch sử tích điểm</p>
              </div>
            ),
            maskClosable: true,
            width: "600px",
            onOk: () => handleCancelOrder(OrderDetail?.id),
            onCancel: () => {},
            okText: "Xác nhận",
            cancelText: "Huỷ",
          });
          break;
        case 2:
          Modal.confirm({
            title: `Xác nhận huỷ đơn hàng`,
            content: (
              <div>
                <p>
                  Bạn chắc chắn muốn huỷ đơn hàng <b>{OrderDetail?.code}</b>?
                </p>
              </div>
            ),
            maskClosable: true,
            width: "600px",
            onOk: () => handleCancelOrder(OrderDetail?.id),
            onCancel: () => {},
            okText: "Xác nhận",
            cancelText: "Huỷ",
          });
          break;
        default:
          break;
      }
      // setTimeout(() => {
      //   window.location.reload();
      // }, 500);
    },
    [OrderDetail, handleCancelOrder]
  );

  const orderActionsClick = useCallback(
    (type) => {
      switch (type) {
        case "cancel":
          if (OrderDetail?.fulfillments && OrderDetail?.fulfillments[0]?.export_on) {
            cancelModal(1);
          } else {
            cancelModal(2);
          }

          break;
        case "update":
          history.push(`${UrlConfig.ORDER}/${id}/update`);
          break;
        case "clone":
          // history.push(`${UrlConfig.ORDER}/create?action=clone&cloneId=${id}`);
          const newTab = window.open(
            `/unicorn/admin${UrlConfig.ORDER}/create?action=clone&cloneId=${id}`,
            "_blank"
          );
          newTab?.focus();
          break;
        default:
          break;
      }
    },
    [OrderDetail?.fulfillments, cancelModal, history, id]
  );

  /**
   * xác nhận đơn
   */
  const onConfirmOrder = () => {
    if (userReducer.account?.full_name && userReducer.account?.user_name) {
      const params = {
        updated_by: userReducer.account.full_name,
        updated_name: userReducer.account.user_name,
      };
      dispatch(
        confirmDraftOrderAction(OrderId, params, (response) => {
          console.log("response", response);
          // handleReload();
          setReload(true);
        })
      );
    }
  };

  const [disabledBottomActions, setDisabledBottomActions] = useState(false);

  const disabledActions = useCallback(
    (type: string) => {
      console.log("disabledActions", type);
      console.log("setShowPaymentPartialPayment", isShowPaymentPartialPayment);
      switch (type) {
        case "shipment":
          setShowPaymentPartialPayment(false);
          setDisabledBottomActions(true);
          break;
        case "payment":
          setVisibleShipping(false);
          setDisabledBottomActions(true);
          break;
        case "none":
          setDisabledBottomActions(false);
          break;
        default:
          break;
      }
    },
    [isShowPaymentPartialPayment]
  );

  useEffect(() => {
    if (isFirstLoad.current || reload) {
      // if (!Number.isNaN(OrderId)) {
      if (id) {
        setShipmentMethod(4);
        setShippingFeeInformedCustomer(0);
        dispatch(OrderDetailAction(id, onGetDetailSuccess));
      } else {
        setError(true);
      }
    }
    isFirstLoad.current = false;
    setReload(false);
    setVisibleShipping(false);
    setShowPaymentPartialPayment(false);
    setPaymentMethod(2);
  }, [dispatch, onGetDetailSuccess, reload, OrderDetail, id]);

  useLayoutEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail?.customer_id, setCustomerDetail));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (customerDetail != null) {
      dispatch(getLoyaltyPoint(customerDetail.id, setLoyaltyPoint));
    } else {
      setLoyaltyPoint(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch, customerDetail]);

  useEffect(() => {
    if (OrderDetail?.store_id != null) {
      dispatch(StoreDetailAction(OrderDetail?.store_id, setStoreDetail));
    }
  }, [dispatch, OrderDetail?.store_id]);

  useEffect(() => {
    setOrderSettings({
      chonCuaHangTruocMoiChonSanPham: true,
      cauHinhInNhieuLienHoaDon: 3,
    });
  }, []);

  // khách cần trả
  const customerNeedToPay: any = () => {
    if (
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
    ) {
      return (
        OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer +
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.discounts &&
        OrderDetail?.discounts.length > 0 &&
        OrderDetail?.discounts[0].amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    } else if (OrderDetail?.total_line_amount_after_line_discount) {
      return (
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.discounts &&
        OrderDetail?.discounts.length > 0 &&
        OrderDetail?.discounts[0].amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    }
  };

  const customerNeedToPayValue = customerNeedToPay();
  // end
  const scroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      // setIsShowBillStep(true);
    } else {
      // setIsShowBillStep(false);
    }
  }, []);

  const initialFormValue = {
    returnMoneyField: [{returnMoneyMethod: undefined, returnMoneyNote: undefined}],
  };

  const totalAmountCustomerNeedToPay = useMemo(() => {
    return (
      (OrderDetail?.total_line_amount_after_line_discount || 0) +
      shippingFeeInformedCustomer
    );
  }, [OrderDetail?.total_line_amount_after_line_discount, shippingFeeInformedCustomer]);

  /**
   * theme context data
   */
  const orderDetailContextData = {
    storeDetail,
    orderDetail: OrderDetail,
    customerDetail,
    price: {
      fee: 0,
      totalOrderAmount: 0,
      setFee: (value: number) => {},
      setTotalOrderAmount: (value: number) => {},
    },
    fulfillment: {
      hvc: null,
      fee: 0,
      serviceType: undefined,
      shippingFeeInformedToCustomer: 0,
      setHvc: (value: number) => {},
      setFee: (value: number) => {},
      setServiceType: (value: string | undefined) => {},
      setShippingFeeInformedToCustomer: (value: number | null) => {},
    },
    payment: {
      payments: [],
      setPayments: (payments: OrderPaymentRequest[]) => {},
    },
  };

  const onSelectShipment = (value: number) => {
    if (value === ShipmentMethodOption.DELIVER_PARTNER) {
      setIsDisablePostPayment(true);
      if (paymentMethod === PaymentMethodOption.POSTPAYMENT) {
        setPaymentMethod(PaymentMethodOption.COD);
      }
    } else {
      setIsDisablePostPayment(false);
    }
    setShipmentMethod(value);
  };

  const renderShipment = () => {
    if (true) {
      return (
        <Card title="ĐÓNG GÓI VÀ GIAO HÀNG 253">
          <OrderCreateShipment
            shipmentMethod={shipmentMethod}
            orderPrice={OrderDetail?.total_line_amount_after_line_discount}
            storeDetail={storeDetail}
            customer={customerDetail}
            items={OrderDetail?.items}
            isCancelValidateDelivery={false}
            totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
            setShippingFeeInformedToCustomer={setShippingFeeInformedCustomer}
            onSelectShipment={onSelectShipment}
            thirdPL={undefined}
            setThirdPL={() => {}}
            form={form}
          />
        </Card>
      );
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
    };
  }, [scroll]);

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        let result = response.filter((single) => single.code !== PaymentMethodCode.CARD);
        setListPaymentMethods(result);
      })
    );
  }, [dispatch]);

  return (
    <OrderDetailContext.Provider value={orderDetailContextData}>
      <ContentContainer
        isLoading={loadingData}
        isError={isError}
        title="Đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: `${UrlConfig.HOME}`,
          },
          {
            name: "Đơn hàng",
          },
          {
            name: `Đơn hàng ${OrderDetail?.code}`,
          },
        ]}
        extra={
          <CreateBillStep
            status={stepsStatusValue}
            orderDetail={OrderDetailAllFullfilment}
          />
        }
      >
        <div className="orders">
          <Form layout="vertical" initialValues={initialFormValue} form={form}>
            <Row gutter={24} style={{marginBottom: "70px"}}>
              <Col md={18}>
                {/*--- customer ---*/}
                <UpdateCustomerCard
                  OrderDetail={OrderDetail}
                  customerDetail={customerDetail}
                  loyaltyPoint={loyaltyPoint}
                  loyaltyUsageRules={loyaltyUsageRules}
                />
                {/*--- end customer ---*/}

                {OrderDetail?.order_return_origin?.items && (
                  <CardShowReturnProducts
                    listReturnProducts={OrderDetail?.order_return_origin?.items}
                    pointUsing={OrderDetail.order_return_origin.point_refund}
                    totalAmountReturnToCustomer={
                      OrderDetail?.order_return_origin.money_refund
                    }
                  />
                )}

                {/*--- product ---*/}
                <UpdateProductCard
                  OrderDetail={OrderDetail}
                  shippingFeeInformedCustomer={shippingFeeInformedCustomer}
                  customerNeedToPayValue={customerNeedToPayValue}
                  totalAmountReturnProducts={totalAmountReturnProducts}
                />
                {/*--- end product ---*/}

                {OrderDetail?.order_return_origin?.items &&
                  customerNeedToPayValue -
                    (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) <
                    0 && (
                    <CardReturnMoney
                      listPaymentMethods={listPaymentMethods}
                      payments={[]}
                      returnMoneyAmount={Math.abs(
                        customerNeedToPayValue -
                          (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
                      )}
                      isShowPaymentMethod={true}
                      setIsShowPaymentMethod={() => {}}
                      handleReturnMoney={handleReturnMoney}
                    />
                  )}

                {/*--- payment ---*/}
                {OrderDetail !== null &&
                  OrderDetail?.payments &&
                  OrderDetail?.payments?.length > 0 && (
                    <Card
                      title={
                        <Space>
                          <div className="d-flex">
                            <span className="title-card">THANH TOÁN</span>
                          </div>
                          {checkPaymentStatusToShow(OrderDetail) === -1 && (
                            <Tag className="orders-tag orders-tag-default">
                              Chưa thanh toán
                            </Tag>
                          )}
                          {checkPaymentStatusToShow(OrderDetail) === 0 && (
                            <Tag className="orders-tag orders-tag-warning">
                              Thanh toán 1 phần
                            </Tag>
                          )}
                          {checkPaymentStatusToShow(OrderDetail) === 1 && (
                            <Tag
                              className="orders-tag orders-tag-success"
                              style={{
                                backgroundColor: "rgba(39, 174, 96, 0.1)",
                                color: "#27AE60",
                              }}
                            >
                              Đã thanh toán
                            </Tag>
                          )}
                        </Space>
                      }
                    >
                      <div style={{marginBottom: 20}}>
                        <Row>
                          <Col span={12}>
                            <span className="text-field margin-right-40">
                              Đã thanh toán:
                            </span>
                            <b>
                              {(OrderDetail?.fulfillments &&
                                OrderDetail?.fulfillments.length > 0 &&
                                OrderDetail?.fulfillments[0].status === "shipped" &&
                                formatCurrency(customerNeedToPayValue)) ||
                                formatCurrency(getAmountPayment(OrderDetail.payments))}
                            </b>
                          </Col>
                          <Col span={12}>
                            <span className="text-field margin-right-40">
                              {customerNeedToPayValue -
                                (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) >=
                              0
                                ? `Còn phải trả:`
                                : `Hoàn tiền cho khách:`}
                            </span>
                            <b style={{color: "red"}}>
                              {OrderDetail?.fulfillments &&
                              OrderDetail?.fulfillments.length > 0 &&
                              OrderDetail?.fulfillments[0].shipment?.cod
                                ? 0
                                : formatCurrency(
                                    Math.abs(
                                      customerNeedToPayValue -
                                        (OrderDetail?.total_paid
                                          ? OrderDetail?.total_paid
                                          : 0)
                                    )
                                  )}
                            </b>
                          </Col>
                        </Row>
                      </div>

                      {OrderDetail?.payments && (
                        <div>
                          <div style={{padding: "0 24px"}}>
                            <Collapse
                              className="orders-timeline"
                              defaultActiveKey={["100"]}
                              ghost
                            >
                              {OrderDetail.total === SumCOD(OrderDetail) &&
                              OrderDetail.total === OrderDetail.total_paid ? (
                                ""
                              ) : (
                                <>
                                  {OrderDetail?.payments
                                    .filter((payment) => {
                                      // nếu là đơn trả thì tính cả cod
                                      if (OrderDetail.order_return_origin) {
                                        return true;
                                      }
                                      return (
                                        payment.payment_method !== "cod" && payment.amount
                                      );
                                    })
                                    .map((payment: any, index: number) => (
                                      <Panel
                                        showArrow={false}
                                        className="orders-timeline-custom success-collapse"
                                        header={
                                          <div className="orderPaymentItem">
                                            <div className="orderPaymentItem__left">
                                              <div>
                                                {/* <b>{payment.payment_method}</b> */}
                                                {/* trường hợp số tiền âm là hoàn lại tiền */}
                                                <b>
                                                  {payment.paid_amount < 0
                                                    ? "Hoàn tiền cho khách"
                                                    : payment.payment_method}
                                                </b>
                                                <span>{payment.reference}</span>
                                                {payment.payment_method_id === 5 && (
                                                  <span style={{marginLeft: 10}}>
                                                    {payment.amount / 1000} điểm
                                                  </span>
                                                )}
                                              </div>
                                              <span className="amount">
                                                {formatCurrency(
                                                  Math.abs(payment.paid_amount)
                                                )}
                                              </span>
                                            </div>
                                            <div className="orderPaymentItem__right">
                                              <span className="date">
                                                {ConvertUtcToLocalDate(
                                                  payment.created_date,
                                                  "DD/MM/YYYY HH:mm"
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        }
                                        key={index}
                                      ></Panel>
                                    ))}
                                </>
                              )}
                              {isShowPaymentPartialPayment && OrderDetail !== null && (
                                <Panel
                                  className="orders-timeline-custom orders-dot-status"
                                  showArrow={false}
                                  header={
                                    <b
                                      style={{
                                        paddingLeft: "14px",
                                        color: "#222222",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      Lựa chọn 1 hoặc nhiều phương thức thanh toán
                                    </b>
                                  }
                                  key="100"
                                >
                                  {isShowPaymentPartialPayment && OrderDetail !== null && (
                                    <UpdatePaymentCard
                                      setSelectedPaymentMethod={onPaymentSelect}
                                      setVisibleUpdatePayment={setVisibleUpdatePayment}
                                      setPayments={onPayments}
                                      setTotalPaid={setTotalPaid}
                                      orderDetail={OrderDetail}
                                      paymentMethod={paymentMethod}
                                      shipmentMethod={shipmentMethod}
                                      order_id={OrderDetail.id}
                                      showPartialPayment={true}
                                      isVisibleUpdatePayment={isVisibleUpdatePayment}
                                      amount={
                                        OrderDetail.total_line_amount_after_line_discount -
                                        getAmountPayment(OrderDetail.payments) -
                                        (OrderDetail?.discounts &&
                                        OrderDetail?.discounts.length > 0 &&
                                        OrderDetail?.discounts[0].amount
                                          ? OrderDetail?.discounts[0].amount
                                          : 0)
                                      }
                                      disabled={
                                        stepsStatusValue === OrderStatus.CANCELLED ||
                                        stepsStatusValue === FulFillmentStatus.SHIPPED
                                      }
                                      reload={() => {
                                        setReload(true);
                                      }}
                                      disabledActions={disabledActions}
                                    />
                                  )}
                                </Panel>
                              )}
                              {OrderDetail?.fulfillments &&
                                OrderDetail?.fulfillments.length > 0 &&
                                OrderDetail?.fulfillments[0].shipment &&
                                OrderDetail?.fulfillments[0].shipment.cod && (
                                  <Panel
                                    className={
                                      OrderDetail?.fulfillments[0].status !== "shipped"
                                        ? "orders-timeline-custom orders-dot-status"
                                        : "orders-timeline-custom "
                                    }
                                    showArrow={false}
                                    header={
                                      <>
                                        <div className="orderPaymentItem">
                                          <div className="orderPaymentItem__left">
                                            <b>
                                              COD
                                              {OrderDetail.fulfillments[0].status !==
                                              "shipped" ? (
                                                <Tag
                                                  className="orders-tag orders-tag-warning"
                                                  style={{marginLeft: 10}}
                                                >
                                                  Đang chờ thu
                                                </Tag>
                                              ) : (
                                                <Tag
                                                  className="orders-tag orders-tag-success"
                                                  style={{
                                                    backgroundColor:
                                                      "rgba(39, 174, 96, 0.1)",
                                                    color: "#27AE60",
                                                    marginLeft: 10,
                                                  }}
                                                >
                                                  Đã thu COD
                                                </Tag>
                                              )}
                                            </b>
                                            <span className="amount">
                                              {OrderDetail !== null &&
                                              OrderDetail?.fulfillments
                                                ? formatCurrency(
                                                    OrderDetail.fulfillments[0].shipment
                                                      ?.cod
                                                  )
                                                : 0}
                                            </span>
                                          </div>
                                          <div className="orderPaymentItem__right">
                                            {OrderDetail?.fulfillments[0].status ===
                                              "shipped" && (
                                              <div>
                                                <span className="date">
                                                  {ConvertUtcToLocalDate(
                                                    OrderDetail?.updated_date,
                                                    "DD/MM/YYYY HH:mm"
                                                  )}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    }
                                    key="100"
                                  ></Panel>
                                )}
                            </Collapse>
                          </div>{" "}
                        </div>
                      )}

                      {(OrderDetail?.fulfillments &&
                        OrderDetail?.fulfillments.length > 0 &&
                        OrderDetail?.fulfillments[0].shipment &&
                        OrderDetail?.fulfillments[0].shipment.cod !== null) ||
                        (checkPaymentAll(OrderDetail) !== 1 &&
                          isShowPaymentPartialPayment === false &&
                          checkPaymentStatusToShow(OrderDetail) !== 1 && (
                            <div className="text-right">
                              <Divider style={{margin: "10px 0"}} />
                              <Button
                                type="primary"
                                className="ant-btn-outline fixed-button"
                                onClick={() => setShowPaymentPartialPayment(true)}
                                style={{marginTop: 10}}
                                disabled={
                                  stepsStatusValue === OrderStatus.CANCELLED ||
                                  stepsStatusValue === FulFillmentStatus.SHIPPED ||
                                  disabledBottomActions
                                }
                              >
                                Thanh toán
                              </Button>
                            </div>
                          ))}
                    </Card>
                  )}

                {/* COD toàn phần */}
                {OrderDetail &&
                  OrderDetail.fulfillments &&
                  OrderDetail.fulfillments.length > 0 &&
                  OrderDetail.fulfillments[0].shipment &&
                  OrderDetail.fulfillments[0].shipment?.cod ===
                    (OrderDetail?.fulfillments[0].shipment
                      .shipping_fee_informed_to_customer
                      ? OrderDetail?.fulfillments[0].shipment
                          .shipping_fee_informed_to_customer
                      : 0) +
                      OrderDetail?.total_line_amount_after_line_discount -
                      (OrderDetail?.discounts &&
                      OrderDetail?.discounts.length > 0 &&
                      OrderDetail?.discounts[0].amount
                        ? OrderDetail?.discounts[0].amount
                        : 0) &&
                  checkPaymentStatusToShow(OrderDetail) !== 1 && (
                    <Card
                      title={
                        <Space>
                          <div className="d-flex">
                            <span className="title-card">THANH TOÁN</span>
                          </div>
                          {checkPaymentStatusToShow(OrderDetail) === 1 && (
                            <Tag
                              className="orders-tag orders-tag-success"
                              style={{
                                backgroundColor: "rgba(39, 174, 96, 0.1)",
                                color: "#27AE60",
                              }}
                            >
                              Đã thanh toán
                            </Tag>
                          )}
                        </Space>
                      }
                    >
                      <div style={{marginBottom: 20}}>
                        <Row>
                          <Col span={12}>
                            <span className="text-field margin-right-40">
                              Đã thanh toán:
                            </span>
                            <b>0</b>
                          </Col>
                          <Col span={12}>
                            <span className="text-field margin-right-40">
                              Còn phải trả:
                            </span>
                            <b style={{color: "red"}}>0</b>
                          </Col>
                        </Row>
                      </div>
                      <Divider style={{margin: "0px"}} />
                      <div style={{padding: "20px 20px 0 20px"}}>
                        <Collapse
                          className="orders-timeline"
                          defaultActiveKey={["1"]}
                          ghost
                        >
                          <Panel
                            className={
                              OrderDetail?.fulfillments[0].status !== "shipped"
                                ? "orders-timeline-custom orders-dot-status orders-dot-fullCod-status"
                                : "orders-timeline-custom orders-dot-fullCod-status"
                            }
                            showArrow={false}
                            header={
                              <div
                                style={{
                                  color: "#222222",
                                  paddingTop: 4,
                                  fontWeight: 500,
                                }}
                              >
                                COD
                                <Tag
                                  className="orders-tag orders-tag-warning"
                                  style={{marginLeft: 10}}
                                >
                                  Đang chờ thu
                                </Tag>
                                <b
                                  style={{
                                    marginLeft: "200px",
                                    color: "#222222",
                                  }}
                                >
                                  {OrderDetail.fulfillments
                                    ? formatCurrency(
                                        OrderDetail.fulfillments[0].shipment?.cod
                                      )
                                    : 0}
                                </b>
                              </div>
                            }
                            key="1"
                          >
                            <Row gutter={24}>
                              {OrderDetail?.payments &&
                                OrderDetail?.payments.map((item, index) => (
                                  <Col span={12} key={item.id}>
                                    <p className="text-field">{item.payment_method}</p>
                                    <p>{formatCurrency(item.paid_amount)}</p>
                                  </Col>
                                ))}
                            </Row>
                          </Panel>
                        </Collapse>
                      </div>
                      {OrderDetail?.payments !== null
                        ? OrderDetail?.payments.map(
                            (item, index) =>
                              OrderDetail.total !== null &&
                              OrderDetail.total - item.paid_amount !== 0 && (
                                <div className="padding-24 text-right">
                                  <Button
                                    key={index}
                                    type="primary"
                                    className="ant-btn-outline fixed-button"
                                    disabled={
                                      stepsStatusValue === OrderStatus.CANCELLED ||
                                      stepsStatusValue === FulFillmentStatus.SHIPPED ||
                                      disabledBottomActions
                                    }
                                  >
                                    Thanh toán
                                  </Button>
                                </div>
                              )
                          )
                        : "Chưa thanh toán"}
                    </Card>
                  )}

                {/* Chưa thanh toán đơn nháp*/}
                {OrderDetail &&
                  OrderDetail.payments?.length === 0 &&
                  (OrderDetail.fulfillments?.length === 0 ||
                    (OrderDetail?.fulfillments &&
                      OrderDetail.fulfillments[0].shipment === null)) && (
                    <UpdatePaymentCard
                      setSelectedPaymentMethod={onPaymentSelect}
                      setPayments={onPayments}
                      paymentMethod={paymentMethod}
                      shipmentMethod={shipmentMethod}
                      amount={OrderDetail.total + shippingFeeInformedCustomer}
                      order_id={OrderDetail.id}
                      orderDetail={OrderDetail}
                      showPartialPayment={false}
                      setTotalPaid={setTotalPaid}
                      isVisibleUpdatePayment={isVisibleUpdatePayment}
                      setVisibleUpdatePayment={setVisibleUpdatePayment}
                      disabled={
                        stepsStatusValue === OrderStatus.CANCELLED ||
                        stepsStatusValue === FulFillmentStatus.SHIPPED
                      }
                      reload={() => {
                        setReload(true);
                      }}
                      disabledActions={disabledActions}
                    />
                  )}

                {/*--- end payment ---*/}

                {/*--- shipment ---*/}
                <UpdateShipmentCard
                  shippingFeeInformedCustomer={shippingFeeInformedCustomer}
                  setShippingFeeInformedCustomer={setShippingFeeInformedCustomer}
                  setVisibleUpdatePayment={setVisibleUpdatePayment}
                  setShipmentMethod={setShipmentMethod}
                  setOfficeTime={setOfficeTime}
                  setVisibleShipping={setVisibleShipping}
                  OrderDetail={OrderDetail}
                  customerDetail={customerDetail}
                  storeDetail={storeDetail}
                  stepsStatusValue={stepsStatusValue}
                  totalPaid={
                    OrderDetail?.total_paid
                      ? OrderDetail?.total_paid
                      : paymentMethod === 2
                      ? totalPaid
                      : 0
                  }
                  officeTime={officeTime}
                  shipmentMethod={shipmentMethod}
                  isVisibleShipping={isVisibleShipping}
                  OrderDetailAllFullfilment={OrderDetailAllFullfilment}
                  orderSettings={orderSettings}
                  onReload={() => setReload(true)}
                  disabledActions={disabledActions}
                  disabledBottomActions={disabledBottomActions}
                />
                {/*--- end shipment ---*/}

                {/* <CardShipment
                  shipmentMethod={shipmentMethod}
                  orderPrice={OrderDetail?.total_line_amount_after_line_discount}
                  storeDetail={storeDetail}
                  customer={customerDetail}
                  items={OrderDetail?.items}
                  isCancelValidateDelivery={false}
                  totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                  setShippingFeeInformedToCustomer={setShippingFeeInformedCustomer}
                  setShipmentMethod={setShipmentMethod}
                  setHVC={setHvc}
                  form={form}
                  serviceType3PL={serviceType3PL}
                  setServiceType3PL={setServiceType3PL}
                /> */}

                {/* {renderShipment()} */}

                {OrderDetail?.order_return_origin?.items && (
                  <CardReturnReceiveProducts
                    handleReceivedReturnProducts={handleReceivedReturnProducts}
                    isReceivedReturnProducts={isReceivedReturnProducts}
                    isDetailPage
                  />
                )}
              </Col>

              <Col md={6}>
                <SidebarOrderDetailInformation OrderDetail={OrderDetail} />
                <SubStatusOrder
                  subStatusId={subStatusId}
                  status={OrderDetail?.status}
                  orderId={OrderId}
                  fulfillments={OrderDetail?.fulfillments}
                  handleUpdateSubStatus={handleUpdateSubStatus}
                />
                <SidebarOrderDetailExtraInformation OrderDetail={OrderDetail} />
                <ActionHistory
                  orderId={OrderDetail?.id}
                  countChangeSubStatus={countChangeSubStatus}
                  reload={reload}
                />
                <SidebarOrderHistory customerId={customerDetail?.id} />
              </Col>
            </Row>
            <OrderDetailBottomBar
              isVisibleGroupButtons={false}
              isVisibleActionsButtons={true}
              stepsStatusValue={stepsStatusValue}
              orderActionsClick={orderActionsClick}
              orderDetail={OrderDetailAllFullfilment}
              onConfirmOrder={onConfirmOrder}
              isShowConfirmOrderButton={isShowConfirmOrderButton}
              disabledBottomActions={disabledBottomActions}
            />
          </Form>
        </div>
      </ContentContainer>
    </OrderDetailContext.Provider>
  );
};

export default OrderDetail;
