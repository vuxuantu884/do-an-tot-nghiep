import { Col, Form, Modal, Row } from "antd";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { getLoyaltyPoint, getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import { actionSetIsReceivedOrderReturn } from "domain/actions/order/order-return.action";
import {
  cancelOrderRequest,
  confirmDraftOrderAction,
  OrderDetailAction,
  PaymentMethodGetList,
  UpdatePaymentAction,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  OrderPaymentRequest,
  UpdateOrderPaymentRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { OrderResponse, StoreCustomResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { FulFillmentStatus, OrderStatus, PaymentMethodCode } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardOnlyShowPayments from "./component/order-detail/CardOnlyShowPayments";
import CardReturnMoney from "./component/order-detail/CardReturnMoney";
import ActionHistory from "./component/order-detail/Sidebar/ActionHistory";
import SidebarOrderDetailExtraInformation from "./component/order-detail/Sidebar/SidebarOrderDetailExtraInformation";
import SidebarOrderDetailInformation from "./component/order-detail/Sidebar/SidebarOrderDetailInformation";
import UpdateCustomerCard from "./component/update-customer-card";
import UpdateProductCard from "./component/update-product-card";
import UpdateShipmentCard from "./component/update-shipment-card";
import CardReturnReceiveProducts from "./order-return/components/CardReturnReceiveProducts";
import CardShowReturnProducts from "./order-return/components/CardShowReturnProducts";

type PropType = {
  id?: string;
};
type OrderParam = {
  id: string;
};

const OrderDetail = (props: PropType) => {
  let { id } = useParams<OrderParam>();
  const history = useHistory();
  if (!id && props.id) {
    id = props.id;
  }
  let OrderId = parseInt(id);
  const isFirstLoad = useRef(true);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [paymentType, setPaymentType] = useState<number>(3);
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
  console.log("totalAmountReturnProducts", totalAmountReturnProducts);
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] = useState(false);

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);

  // xác nhận đơn
  const [isShowConfirmOrderButton, setIsShowConfirmOrderButton] = useState(false);
  const [subStatusId, setSubStatusId] = useState<number | undefined>(undefined);

  const onPaymentSelect = (paymentType: number) => {
    if (paymentType === 1) {
      setVisibleShipping(true);
    }
    setPaymentType(paymentType);
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
      console.log("request", request);
      if (OrderDetail?.id) {
        dispatch(UpdatePaymentAction(request, OrderDetail?.id, onUpdateSuccess));
      }
    });
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    // setPayments(value);
  };
  const changeShippingFeeInformedCustomer = (value: number | null) => {
    if (value !== null) {
      setShippingFeeInformedCustomer(value);
    }
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
      if (OrderDetail.fulfillments === undefined || OrderDetail.fulfillments === null) {
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

  const handleReload = () => {
    window.location.reload();
  };

  const handleReceivedReturnProducts = () => {
    setIsReceivedReturnProducts(true);
    if (OrderDetail?.order_return_origin?.id) {
      dispatch(
        actionSetIsReceivedOrderReturn(OrderDetail?.order_return_origin?.id, () => {
          dispatch(OrderDetailAction(OrderId, onGetDetailSuccess));
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
      let _data = { ...data };
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
      if (_data.status === OrderStatus.DRAFT) {
        setIsShowConfirmOrderButton(true);
      }
    }
  }, []);

  const handleUpdateSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  const handleCancelOrder = useCallback(
    (id: any) => {
      dispatch(cancelOrderRequest(id));
      // dispatch(cancelOrderRequest(id));
    },
    [dispatch]
  );

  const cancelModal = useCallback(
    (type) => {
      console.log("OrderDetail", OrderDetail);
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
            onCancel: () => console.log("cancel"),
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
            onCancel: () => console.log("cancel"),
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
          handleReload();
        })
      );
    }
  };

  useEffect(() => {
    if (isFirstLoad.current || reload) {
      if (!Number.isNaN(OrderId)) {
        dispatch(OrderDetailAction(OrderId, onGetDetailSuccess));
      } else {
        setError(true);
      }
    }
    isFirstLoad.current = false;
    setReload(false);
    setVisibleShipping(false);
    setShowPaymentPartialPayment(false);
  }, [dispatch, OrderId, onGetDetailSuccess, reload]);

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
  const customerNeedToPay = () => {
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
    } else {
      return 0;
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
    returnMoneyField: [{ returnMoneyMethod: undefined, returnMoneyNote: undefined }],
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
          name: `Đơn hàng ${id}`,
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
          <Row gutter={20} style={{ marginBottom: "70px" }}>
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

              <CardOnlyShowPayments
                OrderDetail={OrderDetail}
                customerNeedToPayValue={customerNeedToPayValue}
                isShowPaymentPartialPayment={isShowPaymentPartialPayment}
                isVisibleUpdatePayment={isVisibleUpdatePayment}
                onPaymentSelect={onPaymentSelect}
                onPayments={onPayments}
                paymentType={paymentType}
                setReload={setReload}
                setShowPaymentPartialPayment={setShowPaymentPartialPayment}
                setTotalPaid={setTotalPaid}
                setVisibleUpdatePayment={setVisibleUpdatePayment}
                shipmentMethod={shipmentMethod}
                shippingFeeInformedCustomer={shippingFeeInformedCustomer}
                stepsStatusValue={stepsStatusValue}
              />

              {/*--- shipment ---*/}
              <UpdateShipmentCard
                shippingFeeInformedCustomer={changeShippingFeeInformedCustomer}
                setVisibleUpdatePayment={setVisibleUpdatePayment}
                setShipmentMethod={setShipmentMethod}
                setPaymentType={setPaymentType}
                setOfficeTime={setOfficeTime}
                setVisibleShipping={setVisibleShipping}
                OrderDetail={OrderDetail}
                customerDetail={customerDetail}
                storeDetail={storeDetail}
                stepsStatusValue={stepsStatusValue}
                totalPaid={totalPaid}
                officeTime={officeTime}
                shipmentMethod={shipmentMethod}
                isVisibleShipping={isVisibleShipping}
                paymentType={paymentType}
                OrderDetailAllFullfilment={OrderDetailAllFullfilment}
                orderSettings={orderSettings}
                onReload={() => setReload(true)}
              />
              {/*--- end shipment ---*/}

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
                orderId={id}
                countChangeSubStatus={countChangeSubStatus}
                reload={reload}
              />
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
          />
        </Form>
      </div>
    </ContentContainer>
  );
};

export default OrderDetail;
