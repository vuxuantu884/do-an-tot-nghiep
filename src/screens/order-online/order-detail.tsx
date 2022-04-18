import { Button, Card, Col, Collapse, Divider, Form, Row, Space, Tag } from "antd";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import ActionHistory from "component/order/Sidebar/ActionHistory";
import SidebarOrderDetailExtraInformation from "component/order/Sidebar/SidebarOrderDetailExtraInformation";
import SidebarOrderDetailInformation from "component/order/Sidebar/SidebarOrderDetailInformation";
import SidebarOrderDetailUtm from "component/order/Sidebar/SidebarOrderDetailUtm";
import SidebarOrderHistory from "component/order/Sidebar/SidebarOrderHistory";
import UrlConfig from "config/url.config";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { getLoyaltyPoint, getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import { actionSetIsReceivedOrderReturn } from "domain/actions/order/order-return.action";
import {
  cancelOrderRequest,
  orderConfigSaga,
  confirmDraftOrderAction,
  OrderDetailAction,
  PaymentMethodGetList,
  UpdatePaymentAction,
  changeSelectedStoreBankAccountAction,
  getStoreBankAccountNumbersAction,
  changeShippingServiceConfigAction,
  changeOrderCustomerAction,
  changeStoreDetailAction,
} from "domain/actions/order/order.action";
import { actionListConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  OrderPaymentRequest,
  UpdateOrderPaymentRequest
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { OrderReasonModel, OrderResponse, StoreCustomResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { OrderConfigResponseModel, ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { ECOMMERCE_CHANNEL } from "screens/ecommerce/common/commonAction";
import { getOrderDetail, getStoreBankAccountNumbersService } from "service/order/order.service";
import {
  // checkPaymentAll,
  checkPaymentStatusToShow,
  formatCurrency,
  generateQuery,
  getAmountPayment,
  handleFetchApiError,
  isFetchApiSuccessful,
  sortFulfillments,
  SumCOD
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  POS,
  ShipmentMethodOption
} from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { yellowColor } from "utils/global-styles/variables";
import { showSuccess, showError } from "utils/ToastUtils";
import { getEcommerceStoreAddress, changeEcommerceOrderStatus } from "../../domain/actions/ecommerce/ecommerce.actions";
import { EcommerceAddressQuery, EcommerceStoreAddress } from "../../model/ecommerce/ecommerce.model";
import LogisticConfirmModal from "../ecommerce/orders/component/LogisticConfirmModal";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardReturnMoney from "./component/order-detail/CardReturnMoney";
import UpdateCustomerCard from "./component/update-customer-card";
import UpdatePaymentCard from "./component/update-payment-card";
import UpdateProductCard from "./component/update-product-card";
import UpdateShipmentCard from "./component/update-shipment-card";
import CancelOrderModal from "./modal/cancel-order.modal";
import CardReturnReceiveProducts from "./order-return/components/CardReturnReceiveProducts";
import CardShowReturnProducts from "./order-return/components/CardShowReturnProducts";
import { EcommerceId, EcommerceOrderList, EcommerceOrderStatus, EcommerceOrderStatusRequest } from "model/request/ecommerce.request";
import { EcommerceChangeOrderStatusReponse } from "model/response/ecommerce/ecommerce.response";
import moment from "moment";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import useAuthorization from "hook/useAuthorization";

const { Panel } = Collapse;

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
  // let OrderId = parseInt(id);
  const isFirstLoad = useRef(true);
  const isEcommerceOrder = useRef(false);
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

  const showOrderDetailUtm = useMemo(() => {
    return OrderDetail?.utm_tracking?.utm_campaign || OrderDetail?.utm_tracking?.utm_content
      || OrderDetail?.utm_tracking?.utm_medium || OrderDetail?.utm_tracking?.utm_source
      || OrderDetail?.utm_tracking?.utm_term || OrderDetail?.utm_tracking?.affiliate
  }, [OrderDetail]);
  const [OrderDetailAllFulfillment, setOrderDetailAllFulfillment] =
    useState<OrderResponse | null>(null);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(null);
  const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
    useState<number>(0);
  // const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);
  const [visibleCancelModal, setVisibleCancelModal] = useState<boolean>(false);
  const [visibleLogisticConfirmModal, setVisibleLogisticConfirmModal] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderCancelFulfillmentReasonResponse, setOrderCancelFulfillmentReasonResponse] = useState<
    OrderReasonModel | null
  >(null);

  const orderCancelFulfillmentReasonArr = [
    {
      title: "Khách hàng hủy",
      value: "customer_cancel",
    },
    {
      title: "Hệ thống hủy",
      value: "order_error",
    },
    {
      title: "Hãng vận chuyển hủy",
      value: "dsp_cancel",
    },
    {
      title: "Lý do khác ",
      value: "other",
    },
  ]
  // đổi hàng
  // const [totalAmountReturnProducts, setTotalAmountReturnProducts] =
  //   useState<number>(0);
  const [totalAmountReturnProducts, setTotalAmountReturnProducts] = useState<number>(0);
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] = useState(false);

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);
  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);

  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);

  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);
  // xác nhận đơn
  const [isShowConfirmOrderButton, setIsShowConfirmOrderButton] = useState(false);
  const [subStatusCode, setSubStatusCode] = useState<string | undefined>(undefined);

  const updateShipmentCardRef = useRef<any>();

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
              totalPaid
            ),
            reference: "",
            source: "",
            paid_amount: -Math.abs(
              customerNeedToPayValue -
              totalPaid
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
      if (OrderDetail?.id) {
        dispatch(UpdatePaymentAction(request, OrderDetail?.id, onUpdateSuccess));
      }
    });
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    // setPayments(value);
  };

  const [isShowPaymentPartialPayment, setShowPaymentPartialPayment] = useState(false);

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

  const stepsStatusValue = useMemo(() => {
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
          const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
          if (sortedFulfillments[0].status === FulFillmentStatus.UNSHIPPED || sortedFulfillments[0].status === FulFillmentStatus.CANCELLED) {
            return OrderStatus.FINALIZED;
          }
          if (sortedFulfillments[0].status === FulFillmentStatus.PICKED) {
            return FulFillmentStatus.PICKED;
          }
          if (sortedFulfillments[0].status === FulFillmentStatus.PACKED) {
            return FulFillmentStatus.PACKED;
          }
          if (sortedFulfillments[0].status === FulFillmentStatus.SHIPPING) {
            return FulFillmentStatus.SHIPPING;
          }
          if (sortedFulfillments[0].status === FulFillmentStatus.SHIPPED) {
            return FulFillmentStatus.SHIPPED;
          }
        }
      }
    } else if (OrderDetail?.status === OrderStatus.FINISHED) {
      return FulFillmentStatus.SHIPPED;
    }
    return "";
  }, [OrderDetail?.fulfillments, OrderDetail?.status]);

  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
    setLoadingData(false);
    if (!data) {
      setError(true);
    } else {
      const orderChannel = data.channel?.toLowerCase() || "";
      isEcommerceOrder.current = ECOMMERCE_CHANNEL.includes(orderChannel);

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
      // setOrderDetail({
      //   ..._data,
      //   affiliate: '123',
      //   utm_source: '123',
      //   utm_medium: '123',
      //   utm_campaign: '123',
      //   utm_term: '123',
      //   utm_content: '123',
      // });
      setOrderDetailAllFulfillment(data);
      setIsReceivedReturnProducts(_data.order_return_origin?.received ? true : false);
      if (_data.sub_status_code) {
        setSubStatusCode(_data.sub_status_code);
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
      if (_data.order_return_origin?.total) {
        setTotalAmountReturnProducts(_data.order_return_origin?.total);
      }
    }
  }, []);

  const handleUpdateSubStatus = () => {
    setCountChangeSubStatus(countChangeSubStatus + 1);
  };

  const onSuccessCancel = () => {
    setReload(true);
    setVisibleCancelModal(false);
  };

  const onError = () => {
    // setReload(true)
    setVisibleCancelModal(false);
  };

  const handleCancelOrder = useCallback(
    (reason_id: string, sub_reason_id: string, reason: string) => {
      if (!OrderDetail?.id) {
        return;
      }
      dispatch(
        cancelOrderRequest(
          OrderDetail?.id,
          Number(reason_id),
          Number(sub_reason_id),
          reason,
          onSuccessCancel,
          onError
        )
      );
    },
    [OrderDetail?.id, dispatch]
  );

  const handleConfirmToEcommerce = () => {

  }

  const cancelPrepareGoodsModal = () => {
    setVisibleLogisticConfirmModal(false);
  }

  const [ecommerceStoreAddress, setEcommerceStoreAddress] = useState<Array<EcommerceStoreAddress>>([]);

  const handleEcommerceStoreAddress = useCallback(() => {
    if (OrderDetail) {
      const ecommerceAddressQuery: EcommerceAddressQuery = {
        order_sn: OrderDetail.reference_code,
        shop_id: OrderDetail.ecommerce_shop_id,
      }
      dispatch(getEcommerceStoreAddress(ecommerceAddressQuery, ecommerceStoreAddressCallback));
    }
  }, [OrderDetail, dispatch])

  const changeLazadaOrderStatus = useCallback((status: EcommerceOrderStatus) => {
    let ecommerceOrderStatusRequest: EcommerceOrderStatusRequest = {
      status: status,
      ecommerce_id: EcommerceId.LAZADA,
      items: []
    };
    let order_list: Array<EcommerceOrderList> = [];
    if (OrderDetail && OrderDetail.reference_code && OrderDetail.ecommerce_shop_id) {
      const orderRequest: EcommerceOrderList = {
        order_sn: OrderDetail.reference_code,
        shop_id: OrderDetail.ecommerce_shop_id
      };
      order_list.push(orderRequest);
    }

    ecommerceOrderStatusRequest.items = order_list;
    dispatch(changeEcommerceOrderStatus(ecommerceOrderStatusRequest, (data: EcommerceChangeOrderStatusReponse) => {
      if (data === null) {
        let errorMessage = status === EcommerceOrderStatus.PACKED ? "Có lỗi xảy ra khi tạo gói hàng Lazada" : status === EcommerceOrderStatus.READY_TO_SHIP ? "Có lỗi xảy ra khi báo Lazada sẵn sàng giao" : "Có lỗi xảy ra khi chuyển trạng thái";
        showError(errorMessage);
      } else {
        if (data.success_list && data.success_list.length > 0) {
          let successMessage = status === EcommerceOrderStatus.PACKED ? "Tạo gói hàng Lazada thành công" : status === EcommerceOrderStatus.READY_TO_SHIP ? "Báo Lazada sẵn sàng giao thành công" : "Chuyển trạng thái thành công";
          showSuccess(successMessage);
        } else if (data.error_list && data.error_list.length > 0) {
          showError(data.error_list[0].error_message);
        } else {
          showError("Có lỗi xảy ra");
        }
      }
    }))
  }, [OrderDetail, dispatch]);

  const ecommerceStoreAddressCallback = (data: any) => {
    if (data) {
      setVisibleLogisticConfirmModal(true);
      setEcommerceStoreAddress(data)
    }
  }

  const cancelFulfillmentAndUpdateFromRef = useCallback(() => {
    if (updateShipmentCardRef.current) {
      updateShipmentCardRef.current.handleCancelFulfillmentAndUpdate()
    }
  }, []);

  const orderActionsClick = useCallback(
    (type) => {
      switch (type) {
        case "cancel":
          setVisibleCancelModal(true);
          break;
        case "update":
          history.push(`${UrlConfig.ORDER}/${id}/update`);
          break;
        case "clone":
          // history.push(`${UrlConfig.ORDER}/create?action=clone&cloneId=${id}`);
          const newTab = window.open(
            `/admin${UrlConfig.ORDER}/create?action=clone&cloneId=${id}`,
            "_blank"
          );
          newTab?.focus();
          break;
        case "print":
          let params = {
            action: "print",
            ids: [OrderDetail?.id],
            "print-type": "order",
            "print-dialog": true,
          };
          if (OrderDetail?.order_return_origin?.id) {
            params = {
              action: "print",
              ids: [OrderDetail?.order_return_origin?.id],
              "print-type": "order_exchange",
              "print-dialog": true,
            }
          }
          const queryParam = generateQuery(params);
          const printPreviewOrderUrl = `${process.env.PUBLIC_URL}${UrlConfig.ORDER}/print-preview?${queryParam}`;
          window.open(printPreviewOrderUrl);
          break;
        case "confirm":
          handleEcommerceStoreAddress();
          break;
        case "change_status_packed":
          changeLazadaOrderStatus(EcommerceOrderStatus.PACKED);
          break;
        case "change_status_rts":
          changeLazadaOrderStatus(EcommerceOrderStatus.READY_TO_SHIP);
          break;
        case "cancelFulfillmentAndUpdate":
          cancelFulfillmentAndUpdateFromRef();
          break;
        default:
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [OrderDetail?.id, handleEcommerceStoreAddress, history, id]
  );

  /**
   * xác nhận đơn
   */
  const onConfirmOrder = () => {
    if (!OrderDetail?.id) {
      return;
    }
    if (userReducer.account?.full_name && userReducer.account?.user_name) {
      const params = {
        updated_by: userReducer.account.full_name,
        updated_name: userReducer.account.user_name,
      };
      dispatch(
        confirmDraftOrderAction(OrderDetail.id, params, (response) => {
          // handleReload();
          setReload(true);
        })
      );
    }
  };

  const [disabledBottomActions, setDisabledBottomActions] = useState(false);

  const disabledActions = useCallback(
    (type: string) => {
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
    []
  );

  const renderBankAccount = (payment: any) => {
    let arr = [payment.bank_account_number, payment.bank_account_holder];
    let arrResult = arr.filter(single => single);
    if (arrResult.length > 0) {
      return ` (${arrResult.join(" - ")})`
    }
  };

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

  // mã vận đơn: đối với ghtk, đến bước đóng gói sẽ load lại để lấy mã vận đơn
  useEffect(() => {
    if (!OrderDetail?.fulfillments || OrderDetail.fulfillments.length === 0) {
      return;
    }
    const trackingCode = OrderDetail?.fulfillments[0].shipment?.tracking_code;
    const pushingStatus = OrderDetail?.fulfillments[0].shipment?.pushing_status;
    let isRequest = true;
    const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
    let getTrackingCode = setInterval(() => {
      if (isRequest && !trackingCode && stepsStatusValue === FulFillmentStatus.PACKED && pushingStatus !== "failed" && sortedFulfillments[0]?.shipment?.delivery_service_provider_code === "ghtk") {
        getOrderDetail(id).then(response => {
          if (response.data?.fulfillments && response.data?.fulfillments[0].shipment?.tracking_code) {
            onGetDetailSuccess(response.data);
            clearInterval(getTrackingCode);
            isRequest = false;
            showSuccess("Lấy mã vận đơn thành công!")
          }
        })
      } else {
        clearInterval(getTrackingCode);
      }
    }, 2000)
    return () => {
      clearInterval(getTrackingCode)
    }
  }, [OrderDetail?.fulfillments, id, onGetDetailSuccess, stepsStatusValue])

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
        dispatch(changeShippingServiceConfigAction(response))
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(getCustomerDetailAction(OrderDetail?.customer_id, (data) => {
        setCustomerDetail(data);
        dispatch(changeOrderCustomerAction(data));
      }));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (customerDetail != null) {
      dispatch(getLoyaltyPoint(customerDetail.id, setLoyaltyPoint));
    } else {
      setLoyaltyPoint(null);
    }
  }, [dispatch, customerDetail]);

  useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch]);

  useEffect(() => {
    if (OrderDetail?.store_id != null) {
      dispatch(StoreDetailAction(OrderDetail?.store_id, (data) => {
        setStoreDetail(data);
        dispatch(changeStoreDetailAction(data));
      }));
      getStoreBankAccountNumbersService({
        store_ids: [OrderDetail?.store_id]
      }).then((response) => {
        if (isFetchApiSuccessful(response)) {
          dispatch(getStoreBankAccountNumbersAction(response.data.items))
          const selected = response.data.items.find(single => single.default && single.status);
          if (selected) {
            dispatch(changeSelectedStoreBankAccountAction(selected.account_number))
          } else {
            dispatch(changeSelectedStoreBankAccountAction(undefined))
          }
        } else {
          dispatch(getStoreBankAccountNumbersAction([]))
          handleFetchApiError(response, "Danh sách số tài khoản ngân hàng của cửa hàng", dispatch)
        }
      }).catch((error) => {
        console.log('error', error)
      })
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
          OrderDetail?.discounts[0]?.amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    } else if (OrderDetail?.total_line_amount_after_line_discount) {
      return (
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.discounts &&
          OrderDetail?.discounts.length > 0 &&
          OrderDetail?.discounts[0]?.amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    }
    return 0;
  };

  const customerNeedToPayValue = customerNeedToPay();
  const totalPaid = OrderDetail?.payments ? getAmountPayment(OrderDetail.payments) : 0;
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

  useEffect(() => {
    dispatch(
      orderConfigSaga((data: OrderConfigResponseModel) => {
        setOrderConfig(data);
      })
    );
  }, [dispatch]);

  const [allowUpdatePayment] = useAuthorization({
    //
    acceptPermissions: [ODERS_PERMISSIONS.UPDATE_PAYMENT],
  });

  const checkIsPaymentUpdate = useMemo(() => {
    let fromDate = moment(new Date()).format("yyyy-MM-DD 07:00");
    let toDate =moment(new Date().setHours(24)).format("yyyy-MM-DD 07:01");
    let orderdate = moment(OrderDetail?.finished_on);

    console.log("checkTodate", toDate, fromDate, orderdate);

    if(!allowUpdatePayment) 
    {
      if (moment(fromDate) >= orderdate || moment(toDate) <= orderdate) return false;
      if(OrderDetail?.source_code !== POS.source_code && OrderDetail?.status=== OrderStatus.FINISHED) return false;
    }
    
    return true;
    
  }, [OrderDetail?.finished_on, OrderDetail?.source_code, OrderDetail?.status, allowUpdatePayment])

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
          name: "Danh sách đơn hàng",
          path: `${UrlConfig.ORDER}`,
        },
        {
          name: OrderDetail?.code
            ? `Đơn hàng ${OrderDetail?.code}`
            : "Đang tải dữ liệu...",
        },
      ]}
      extra={
        <CreateBillStep
          status={stepsStatusValue}
          orderDetail={OrderDetailAllFulfillment}
        />
      }
    >
      <div className="orders">
        <Form layout="vertical" initialValues={initialFormValue} form={form}>
          <Row gutter={24} style={{ marginBottom: "70px" }}>
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
                    OrderDetail?.order_return_origin.total
                  }
                  OrderDetail={OrderDetail}
                />
              )}

              {/*--- product ---*/}
              <UpdateProductCard
                OrderDetail={OrderDetail}
                shippingFeeInformedCustomer={shippingFeeInformedCustomer}
                // shippingFeeInformedCustomer={form.getFieldValue("shipping_fee_informed_to_customer")}
                customerNeedToPayValue={customerNeedToPayValue}
                totalAmountReturnProducts={totalAmountReturnProducts}
              />
              {/*--- end product ---*/}

              {OrderDetail?.order_return_origin?.items &&
                customerNeedToPayValue -
                totalPaid <
                0 && (
                  <CardReturnMoney
                    listPaymentMethods={listPaymentMethods}
                    payments={[]}
                    returnMoneyAmount={(
                      customerNeedToPayValue -
                      totalPaid
                    )}
                    isShowPaymentMethod={true}
                    setIsShowPaymentMethod={() => { }}
                    handleReturnMoney={handleReturnMoney}
                  />
                )}

              {/*--- payment ---*/}
              {OrderDetail !== null &&
                ((OrderDetail?.payments && OrderDetail?.payments?.length > 0) ||
                  (OrderDetail.fulfillments &&
                    OrderDetail.fulfillments[0]?.shipment?.cod !== 0 && OrderDetail.fulfillments[0]?.shipment?.cod !== undefined)) && (
                  <Card
                    title={
                      <Space>
                        <div className="d-flex">
                          <span className="title-card">THANH TOÁNss</span>
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
                    <div style={{ marginBottom: 20 }}>
                      <Row>
                        <Col span={8}>
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
                        <Col span={8}>
                          <span className="text-field margin-right-40">
                            Còn phải trả:
                          </span>
                          <b style={{ color: "red" }}>
                            {formatCurrency(
                              customerNeedToPayValue - totalPaid > 0 ? customerNeedToPayValue - totalPaid : 0
                            )}
                          </b>
                        </Col>
                        {customerNeedToPayValue - totalPaid < 0 ? (
                          <Col span={8}>
                            <span className="text-field margin-right-40">
                              Đã hoàn tiền cho khách:
                            </span>
                            <b style={{ color: yellowColor }}>
                              {formatCurrency(
                                Math.abs(
                                  customerNeedToPayValue - totalPaid
                                )
                              )}
                            </b>
                          </Col>
                        ) : null}
                      </Row>
                    </div>

                    {OrderDetail?.payments && (
                      <div>
                        <div style={{ padding: "0 24px" }}>
                          <Collapse
                            className="orders-timeline"
                            defaultActiveKey={["100"]}
                            ghost
                          >
                            {OrderDetail.total === SumCOD(OrderDetail) &&
                              OrderDetail.total === totalPaid ? (
                              ""
                            ) : (
                              <React.Fragment>
                                {OrderDetail?.payments
                                  .filter((payment) => {
                                    // nếu là đơn trả thì tính cả cod
                                    // if (OrderDetail.order_return_origin) {
                                    //   return true;
                                    // }
                                    return (
                                      payment.payment_method_code !== PaymentMethodCode.COD
                                      // && payment.amount
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
                                              <span style={{ marginLeft: 12 }}>
                                                {payment.reference}
                                              </span>
                                              {payment.bank_account_number ? renderBankAccount(payment) : null}
                                              {payment.payment_method_id === 5 && (
                                                <span style={{ marginLeft: 10 }}>
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
                              </React.Fragment>
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
                                    setPaymentMethod={onPaymentSelect}
                                    setVisibleUpdatePayment={setVisibleUpdatePayment}
                                    setShowPaymentPartialPayment={
                                      setShowPaymentPartialPayment
                                    }
                                    setPayments={onPayments}
                                    // setTotalPaid={setTotalPaid}
                                    orderDetail={OrderDetail}
                                    paymentMethod={paymentMethod}
                                    shipmentMethod={shipmentMethod}
                                    order_id={OrderDetail.id}
                                    showPartialPayment={true}
                                    isVisibleUpdatePayment={isVisibleUpdatePayment}
                                    amount={
                                      OrderDetail.total_line_amount_after_line_discount
                                    }
                                    disabled={
                                      stepsStatusValue === OrderStatus.CANCELLED ||
                                      stepsStatusValue === FulFillmentStatus.SHIPPED
                                    }
                                    reload={() => {
                                      setReload(true);
                                    }}
                                    disabledActions={disabledActions}
                                    listPaymentMethods={listPaymentMethods}
                                    form={form}
                                    isDisablePostPayment={isDisablePostPayment}
                                    orderPayment={OrderDetail.payments}
                                  />
                                )}
                              </Panel>
                            )}
                            {OrderDetail?.fulfillments &&
                              OrderDetail?.fulfillments.length > 0 &&
                              OrderDetail?.fulfillments[0].shipment &&
                              OrderDetail?.fulfillments[0].shipment.cod > 0 && (
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
                                                style={{ marginLeft: 10 }}
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
                    {isShowPaymentPartialPayment === false && OrderDetail?.source !== "ShopeePay Balance" && checkIsPaymentUpdate && (
                      <div className="text-right">
                        <Divider style={{ margin: "10px 0" }} />
                        <Button
                          type="primary"
                          className="ant-btn-outline fixed-button"
                          onClick={() => setShowPaymentPartialPayment(true)}
                          style={{ marginTop: 10 }}
                        // Cho sửa thanh toán đơn hàng ngay cả khi thành công
                        // Cho sửa thanh toán đơn hàng ngay cả khi thành công
                        // Cho sửa thanh toán đơn hàng ngay cả khi thành công
                        >
                          Thanh toán
                        </Button>
                      </div>
                    )}

                    {/* {(OrderDetail?.fulfillments &&
                      OrderDetail?.fulfillments.length > 0 &&
                      OrderDetail?.fulfillments[0].shipment &&
                      OrderDetail?.fulfillments[0].shipment.cod !== null) ||
                      (checkPaymentAll(OrderDetail) !== 1 &&
                        isShowPaymentPartialPayment === false &&
                        checkPaymentStatusToShow(OrderDetail) !== 1 && (
                          <div className="text-right">
                            <Divider style={{ margin: "10px 0" }} />
                            <Button
                              type="primary"
                              className="ant-btn-outline fixed-button"
                              onClick={() => setShowPaymentPartialPayment(true)}
                              style={{ marginTop: 10 }}
                              // đơn hàng nhận ở cửa hàng là hoàn thành nhưng vẫn cho thanh toán tiếp
                              disabled={
                                OrderDetail.source_code !== "POS" &&
                                (stepsStatusValue === OrderStatus.CANCELLED ||
                                  stepsStatusValue === FulFillmentStatus.SHIPPED ||
                                  disabledBottomActions)
                              }
                            >
                              Thanh toán
                            </Button>
                          </div>
                        ))} */}
                  </Card>
                )}

              {/* Chưa thanh toán đơn nháp*/}
              {OrderDetail &&
                OrderDetail.payments?.length === 0 &&
                (OrderDetail.fulfillments?.length === 0 ||
                  (OrderDetail?.fulfillments &&
                    OrderDetail.fulfillments[0].shipment === null)) && (
                  <UpdatePaymentCard
                    setPaymentMethod={onPaymentSelect}
                    setPayments={onPayments}
                    paymentMethod={paymentMethod}
                    shipmentMethod={shipmentMethod}
                    amount={OrderDetail.total + shippingFeeInformedCustomer}
                    order_id={OrderDetail.id}
                    orderDetail={OrderDetail}
                    showPartialPayment={false}
                    // setTotalPaid={setTotalPaid}
                    isVisibleUpdatePayment={isVisibleUpdatePayment}
                    setVisibleUpdatePayment={setVisibleUpdatePayment}
                    // đơn POS vẫn cho thanh toán tiếp khi chưa thanh toán đủ
                    disabled={
                      OrderDetail.source_code !== "POS" &&
                      (stepsStatusValue === OrderStatus.CANCELLED ||
                        stepsStatusValue === FulFillmentStatus.SHIPPED ||
                        disabledBottomActions)
                    }
                    reload={() => {
                      setReload(true);
                    }}
                    disabledActions={disabledActions}
                    listPaymentMethods={listPaymentMethods}
                    form={form}
                  />
                )}

              {/*--- end payment ---*/}

              {/*--- shipment ---*/}
              <UpdateShipmentCard
                shippingFeeInformedCustomer={shippingFeeInformedCustomer}
                setShippingFeeInformedCustomer={setShippingFeeInformedCustomer}
                setVisibleUpdatePayment={setVisibleUpdatePayment}
                setShipmentMethod={onSelectShipment}
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
                OrderDetailAllFullfilment={OrderDetailAllFulfillment}
                orderSettings={orderSettings}
                onReload={() => setReload(true)}
                disabledActions={disabledActions}
                disabledBottomActions={disabledBottomActions}
                reasons={orderCancelFulfillmentReasonArr}
                subReasons={orderCancelFulfillmentReasonResponse?.sub_reasons}
                isEcommerceOrder={isEcommerceOrder.current}
                shippingServiceConfig={shippingServiceConfig}
                orderConfig={orderConfig}
                ref={updateShipmentCardRef}
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
              {showOrderDetailUtm && <SidebarOrderDetailUtm OrderDetail={OrderDetail} />}
              <SidebarOrderDetailInformation OrderDetail={OrderDetail} />
              <SubStatusOrder
                subStatusCode={subStatusCode}
                status={OrderDetail?.status}
                orderId={OrderDetail?.id}
                fulfillments={OrderDetail?.fulfillments}
                handleUpdateSubStatus={handleUpdateSubStatus}
                setReload={setReload}
                OrderDetailAllFulfillment={OrderDetailAllFulfillment}
              />
              <SidebarOrderDetailExtraInformation OrderDetail={OrderDetail} />
              <ActionHistory
                orderId={OrderDetail?.id}
                countChangeSubStatus={countChangeSubStatus}
                reload={reload}
              />
              {customerDetail?.id && (
                <SidebarOrderHistory customerId={customerDetail?.id} />
              )}
            </Col>
          </Row>
          <OrderDetailBottomBar
            isVisibleGroupButtons={false}
            isVisibleActionsButtons={true}
            stepsStatusValue={stepsStatusValue}
            orderActionsClick={orderActionsClick}
            orderDetail={OrderDetailAllFulfillment}
            onConfirmOrder={onConfirmOrder}
            isShowConfirmOrderButton={isShowConfirmOrderButton}
            disabledBottomActions={disabledBottomActions}
          />
        </Form>
      </div>
      <CancelOrderModal
        visible={visibleCancelModal}
        orderCode={OrderDetail?.code}
        onCancel={() => setVisibleCancelModal(false)}
        onOk={(reason_id: string, sub_reason_id: string, reason: string) =>
          handleCancelOrder(reason_id, sub_reason_id, reason)
        }
        reasons={orderCancelFulfillmentReasonArr}
      />
      <LogisticConfirmModal
        visible={visibleLogisticConfirmModal}
        ecommerceStoreAddress={ecommerceStoreAddress}
        onOk={handleConfirmToEcommerce}
        onCancel={cancelPrepareGoodsModal}
        OrderDetail={OrderDetail}
      />
    </ContentContainer>
  );
};

export default OrderDetail;
