import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Col, Form, Modal, Row } from "antd";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import SubStatusOrder from "component/main-sidebar/sub-status-order";
import { promotionUtils } from "component/order/promotion.utils";
import ActionHistory from "component/order/Sidebar/ActionHistory";
import SidebarOrderDetailExtraInformation from "component/order/Sidebar/SidebarOrderDetailExtraInformation";
import SidebarOrderDetailInformation from "component/order/Sidebar/SidebarOrderDetailInformation";
import SidebarOrderDetailUtm from "component/order/Sidebar/SidebarOrderDetailUtm";
import SidebarOrderHistory from "component/order/Sidebar/SidebarOrderHistory";
import UrlConfig from "config/url.config";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getLoyaltyPoint, getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import { actionSetIsReceivedOrderReturn } from "domain/actions/order/order-return.action";
import {
  cancelOrderRequest,
  changeOrderCustomerAction,
  changeSelectedStoreBankAccountAction,
  changeShippingServiceConfigAction,
  changeStoreDetailAction,
  confirmDraftOrderAction,
  getStoreBankAccountNumbersAction,
  orderConfigSaga,
  OrderDetailAction,
  PaymentMethodGetList,
  updateOrderPartial,
  UpdatePaymentAction,
} from "domain/actions/order/order.action";
import { actionListConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import useCheckIfCanCreateMoneyRefund from "hook/order/useCheckIfCanCreateMoneyRefund";
import useFetchStores from "hook/useFetchStores";
import { HandoverResponse } from "model/handover/handover.response";
import { OrderPageTypeModel } from "model/order/order.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  EcommerceId,
  EcommerceOrderList,
  EcommerceOrderStatus,
  EcommerceOrderStatusRequest,
} from "model/request/ecommerce.request";
import { UpdateOrderPaymentRequest } from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { EcommerceChangeOrderStatusReponse } from "model/response/ecommerce/ecommerce.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  OrderReasonModel,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { ECOMMERCE_CHANNEL } from "screens/ecommerce/common/commonAction";
import CannotUpdateOrderWithWalletWarningInformation from "screens/order-online/component/CannotUpdateOrderWithWalletWarningInformation";
import CardShowReturnProducts from "screens/order-online/order-return/components/CardShowReturnProducts";
import { searchHandoverService } from "service/handover/handover.service";
import {
  deleteOrderService,
  getOrderDetail,
  getStoreBankAccountNumbersService,
} from "service/order/order.service";
import {
  generateQuery,
  getAmountPayment,
  handleFetchApiError,
  isFetchApiSuccessful,
  isOrderFromPOS,
  sortFulfillments,
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  POS,
  ShipmentMethodOption,
} from "utils/Constants";
import { ORDER_PAYMENT_STATUS } from "utils/Order.constants";
import {
  checkIfExpiredOrCancelledPayment,
  checkIfFinishedPayment,
  checkIfMomoPayment,
  checkIfOrderHasNotFinishPaymentMomo,
  isDeliveryOrderReturned,
} from "utils/OrderUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import {
  changeEcommerceOrderStatus,
  getEcommerceStoreAddress,
} from "../../../domain/actions/ecommerce/ecommerce.actions";
import {
  EcommerceAddressQuery,
  EcommerceStoreAddress,
} from "../../../model/ecommerce/ecommerce.model";
import LogisticConfirmModal from "../../ecommerce/orders/component/LogisticConfirmModal";
import OrderDetailBottomBar from "../component/order-detail/BottomBar";
import UpdateProductCard from "../component/order-detail/CardProduct";
import CardReturnMoney from "../component/order-detail/CardReturnMoney";
import CardShowOrderPayments from "../component/order-detail/CardShowOrderPayments";
import UpdateCustomerCard from "../component/update-customer-card";
import UpdateShipmentCard from "../component/UpdateShipmentCard";
import useGetDefaultReturnOrderReceivedStore from "../hooks/useGetDefaultReturnOrderReceivedStore";
import CancelOrderModal from "../modal/cancel-order.modal";
import CardReturnReceiveProducts from "../order-return/components/CardReturnReceiveProducts";
import { StyledComponent, UniformText } from "./styles";

type PropTypes = {
  id?: string;
  setTitle: (value?: string) => void;
};
type OrderParam = {
  id: string;
};

let numberReloadGetTrackingCodeGHTK = 1;
let numberReloadGetMomoLink = 1;
let maxNumberReload = 10;
let isRequest = true;

const OrderDetail = (props: PropTypes) => {
  let { id } = useParams<OrderParam>();
  const history = useHistory();
  if (!id && props.id) {
    id = props.id;
  }
  const { setTitle } = props;
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

  const stores = useFetchStores();

  const showOrderDetailUtm = useMemo(() => {
    return (
      OrderDetail?.utm_tracking?.utm_campaign ||
      OrderDetail?.utm_tracking?.utm_content ||
      OrderDetail?.utm_tracking?.utm_medium ||
      OrderDetail?.utm_tracking?.utm_source ||
      OrderDetail?.utm_tracking?.utm_term ||
      OrderDetail?.utm_tracking?.affiliate
    );
  }, [OrderDetail]);
  const [OrderDetailAllFulfillment, setOrderDetailAllFulfillment] = useState<OrderResponse | null>(
    null,
  );
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(null);
  const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] = useState<number>(0);
  const [countChangeSubStatus, setCountChangeSubStatus] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [paymentMethods, setListPaymentMethods] = useState<Array<PaymentMethodResponse>>([]);
  const [visibleCancelModal, setVisibleCancelModal] = useState<boolean>(false);
  const [visibleLogisticConfirmModal, setVisibleLogisticConfirmModal] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderCancelFulfillmentReasonResponse, setOrderCancelFulfillmentReasonResponse] =
    useState<OrderReasonModel | null>(null);

  const [orderDetailHandover, setOrderDetailHandover] = useState<HandoverResponse[] | null>(null);

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
  ];
  // đổi hàng
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalAmountReturnProducts, setTotalAmountReturnProducts] = useState<number>(0);
  // console.log('totalAmountReturnProducts', totalAmountReturnProducts)
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] = useState(false);

  const canCreateMoneyRefund = useCheckIfCanCreateMoneyRefund(
    isReceivedReturnProducts,
    OrderDetail,
  );

  const currentStores = useFetchStores();

  const defaultReceiveReturnStore = useGetDefaultReturnOrderReceivedStore({
    currentStores,
    OrderDetail,
    fulfillments: OrderDetail?.fulfillments,
  });
  console.log("defaultReceiveReturnStore", defaultReceiveReturnStore);

  const [isShowReceiveProductConfirmModal, setIsShowReceiveProductConfirmModal] = useState(false);

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<Array<LoyaltyUsageResponse>>([]);
  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);

  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);

  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);
  // xác nhận đơn
  const [isShowConfirmOrderButton, setIsShowConfirmOrderButton] = useState(false);
  const [subStatusCode, setSubStatusCode] = useState<string | undefined>(undefined);

  const [returnPaymentMethodCode, setReturnPaymentMethodCode] = useState(PaymentMethodCode.CASH);

  const updateShipmentCardRef = useRef<any>();

  /**
   * tổng số tiền đã trả, cần lấy theo OrderDetailAllFulfillment
   */
  const totalAmountPayment =
    OrderDetailAllFulfillment?.payments && OrderDetailAllFulfillment?.payments?.length > 0
      ? getAmountPayment(OrderDetailAllFulfillment.payments)
      : 0;

  /**
   * tổng giá trị đơn hàng
   */
  const totalOrderAmount = OrderDetailAllFulfillment?.total || 0;

  /**
   * số tiền khách cần trả: nếu âm thì là số tiền trả lại khách
   */
  const totalAmountCustomerNeedToPay = useMemo(() => {
    return totalOrderAmount - totalAmountPayment;
  }, [totalOrderAmount, totalAmountPayment]);

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
      let returnMoneyMethod = paymentMethods.find((single) => {
        return single.code === formReturnMoney.returnMoneyMethod;
      });
      if (returnMoneyMethod) {
        payments = [
          {
            payment_method_id: returnMoneyMethod.id,
            payment_method: returnMoneyMethod.name,
            amount: -Math.abs(customerNeedToPayValue),
            reference: "",
            source: "",
            paid_amount: -Math.abs(customerNeedToPayValue),
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

  // const onPayments = (value: Array<OrderPaymentRequest>) => {
  //   // setPayments(value);
  // };

  const [isShowPaymentPartialPayment, setShowPaymentPartialPayment] = useState(false);

  const handleReceivedReturnProductsToStore = () => {
    if (OrderDetail?.order_return_origin?.id) {
      const returned_store_id: number = form.getFieldValue("orderReturn_receive_return_store_id");
      console.log("returned_store_id ", returned_store_id);
      dispatch(
        actionSetIsReceivedOrderReturn(
          OrderDetail?.order_return_origin?.id,
          returned_store_id,
          () => {
            setIsReceivedReturnProducts(true);
            dispatch(OrderDetailAction(id, onGetDetailSuccess));
          },
        ),
      );
    }
  };

  const stepsStatusValue = useMemo(() => {
    if (
      isDeliveryOrderReturned(OrderDetailAllFulfillment?.fulfillments) &&
      OrderDetailAllFulfillment?.fulfillments
    ) {
      return FulFillmentStatus.CANCELLED;
    }
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
          const sortedFulfillments = OrderDetail?.fulfillments;
          switch (sortedFulfillments[0]?.status) {
            case FulFillmentStatus.UNSHIPPED:
              return OrderStatus.FINALIZED;
            case FulFillmentStatus.PICKED:
              return FulFillmentStatus.PICKED;
            case FulFillmentStatus.PACKED:
              return FulFillmentStatus.PACKED;
            case FulFillmentStatus.SHIPPING:
              return FulFillmentStatus.SHIPPING;
            case FulFillmentStatus.SHIPPED:
              return FulFillmentStatus.SHIPPED;
            default:
              return OrderStatus.FINALIZED;
          }
        }
      }
    } else if (OrderDetail?.status === OrderStatus.FINISHED) {
      return FulFillmentStatus.SHIPPED;
    }
    return "";
  }, [OrderDetail?.fulfillments, OrderDetail?.status, OrderDetailAllFulfillment?.fulfillments]);

  const onGetDetailSuccess = useCallback(
    (data: false | OrderResponse) => {
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
            f.status !== FulFillmentStatus.RETURNING,
        );
        setTitle(`Đơn hàng ${_data.code}`);
        setOrderDetail(_data);
        setShippingFeeInformedCustomer(
          _data.shipping_fee_informed_to_customer ? _data.shipping_fee_informed_to_customer : 0,
        );
        form.setFieldsValue({
          shipping_fee_informed_to_customer: _data.shipping_fee_informed_to_customer
            ? _data.shipping_fee_informed_to_customer
            : 0,
        });
        setOrderDetailAllFulfillment(data);
        setIsReceivedReturnProducts(_data.order_return_origin?.received ? true : false);
        if (_data.sub_status_code) {
          setSubStatusCode(_data.sub_status_code);
        }
        if (_data.status === OrderStatus.DRAFT && _data.payments?.length === 0) {
          setIsShowConfirmOrderButton(true);
        } else {
          setIsShowConfirmOrderButton(false);
        }
        if (_data.order_return_origin?.total) {
          setTotalAmountReturnProducts(_data.order_return_origin?.total);
        }
      }
    },
    [form, setTitle],
  );

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
          onError,
        ),
      );
    },
    [OrderDetail?.id, dispatch],
  );

  const handleConfirmToEcommerce = () => {};

  const cancelPrepareGoodsModal = () => {
    setVisibleLogisticConfirmModal(false);
  };

  const [ecommerceStoreAddress, setEcommerceStoreAddress] = useState<Array<EcommerceStoreAddress>>(
    [],
  );

  const handleEcommerceStoreAddress = useCallback(() => {
    if (OrderDetail) {
      const convertShopId: any = OrderDetail?.ecommerce_shop_id;
      const ecommerceAddressQuery: EcommerceAddressQuery = {
        order_sn: OrderDetail.reference_code,
        shop_id: convertShopId?.toString(),
      };
      dispatch(getEcommerceStoreAddress(ecommerceAddressQuery, ecommerceStoreAddressCallback));
    }
  }, [OrderDetail, dispatch]);

  const changeLazadaOrderStatus = useCallback(
    (status: EcommerceOrderStatus) => {
      let ecommerceOrderStatusRequest: EcommerceOrderStatusRequest = {
        status: status,
        ecommerce_id: EcommerceId.LAZADA,
        items: [],
      };
      let order_list: Array<EcommerceOrderList> = [];
      if (OrderDetail && OrderDetail.reference_code && OrderDetail.ecommerce_shop_id) {
        const convertShopId: any = OrderDetail?.ecommerce_shop_id;
        const orderRequest: EcommerceOrderList = {
          order_sn: OrderDetail.reference_code,
          shop_id: convertShopId?.toString(),
        };
        order_list.push(orderRequest);
      }

      ecommerceOrderStatusRequest.items = order_list;
      dispatch(
        changeEcommerceOrderStatus(
          ecommerceOrderStatusRequest,
          (data: EcommerceChangeOrderStatusReponse) => {
            if (data === null) {
              let errorMessage =
                status === EcommerceOrderStatus.PACKED
                  ? "Có lỗi xảy ra khi tạo gói hàng Lazada"
                  : status === EcommerceOrderStatus.READY_TO_SHIP
                  ? "Có lỗi xảy ra khi báo Lazada sẵn sàng giao"
                  : "Có lỗi xảy ra khi chuyển trạng thái";
              showError(errorMessage);
            } else {
              if (data.success_list && data.success_list.length > 0) {
                let successMessage =
                  status === EcommerceOrderStatus.PACKED
                    ? "Tạo gói hàng Lazada thành công"
                    : status === EcommerceOrderStatus.READY_TO_SHIP
                    ? "Báo Lazada sẵn sàng giao thành công"
                    : "Chuyển trạng thái thành công";
                showSuccess(successMessage);
              } else if (data.error_list && data.error_list.length > 0) {
                showError(data.error_list[0].error_message);
              } else {
                showError("Có lỗi xảy ra");
              }
            }
          },
        ),
      );
    },
    [OrderDetail, dispatch],
  );

  const ecommerceStoreAddressCallback = (data: any) => {
    if (data) {
      setVisibleLogisticConfirmModal(true);
      setEcommerceStoreAddress(data);
    }
  };

  const cancelFulfillmentAndUpdateFromRef = useCallback(() => {
    if (updateShipmentCardRef.current) {
      updateShipmentCardRef.current.handleCancelFulfillmentAndUpdate();
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
          const newTab = window.open(
            `/admin${UrlConfig.ORDER}/create?action=clone&cloneId=${id}`,
            "_blank",
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
            };
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
    [OrderDetail?.id, handleEcommerceStoreAddress, history, id],
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
          setReload(true);
        }),
      );
    }
  };

  /**
   * xóa đơn
   */
  const handleDeleteOrderClick = useCallback(() => {
    if (!OrderDetail) {
      showError("Có lỗi xảy ra, Không tìm thấy mã đơn trả");
      return;
    }

    const deleteOrderConfirm = () => {
      let ids: number[] = [OrderDetail.id];

      dispatch(showLoading());
      deleteOrderService(ids)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            history.push(
              `${
                OrderDetail.channel === POS.channel_code
                  ? UrlConfig.OFFLINE_ORDERS
                  : UrlConfig.ORDER
              }`,
            );
          } else {
            handleFetchApiError(response, "Xóa đơn hàng", dispatch);
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    };

    Modal.confirm({
      title: "Xác nhận xóa",
      icon: <ExclamationCircleOutlined />,
      content: (
        <StyledComponent>
          <div className="yody-modal-confirm-list-code">
            Bạn có chắc chắn xóa:
            <div className="yody-modal-confirm-item-code">
              <p>{OrderDetail?.code}</p>
            </div>
          </div>
          <p className="deleteOrderConfirm__note">
            Lưu ý: Đối với đơn ở trạng thái Thành công, khi thực hiện xoá, sẽ xoá luôn cả đơn trả
            liên quan. Bạn cần cân nhắc kĩ trước khi thực hiện xoá đơn ở trạng thái Thành công
          </p>
        </StyledComponent>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: deleteOrderConfirm,
    });
  }, [OrderDetail, dispatch, history]);

  const handleStatusOrder = useCallback(
    (data: OrderResponse | null) => {
      if (!OrderDetail || !data) return;
      let orderDetailCopy = { ...OrderDetail };
      orderDetailCopy.sub_status = data.sub_status;
      orderDetailCopy.sub_status_code = data.sub_status_code;
      orderDetailCopy.sub_status_id = data.sub_status_id;

      orderDetailCopy.sub_reason_id = data.sub_reason_id;
      orderDetailCopy.sub_reason_name = data.sub_reason_name;

      // console.log("orderDetailCopy",orderDetailCopy)

      onGetDetailSuccess(orderDetailCopy);
    },
    [OrderDetail, onGetDetailSuccess],
  );

  const [disabledBottomActions, setDisabledBottomActions] = useState(false);

  const disabledActions = useCallback((type: string) => {
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
  }, []);

  const createPaymentCallback = () => {
    numberReloadGetMomoLink = 1;
  };

  // shipping fee
  // const { handleChangeShippingFeeApplyOrderSettings, setIsShippingFeeAlreadyChanged } =
  //   useCalculateShippingFee(totalOrderAmount, form, setShippingFeeInformedToCustomer, false);

  const handleChangeShippingFeeApplyOrderSettings = () => {};

  useEffect(() => {
    if (isFirstLoad.current || reload) {
      if (id) {
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

    const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
    const trackingCode = sortedFulfillments[0]?.shipment?.tracking_code;
    const pushingStatus = sortedFulfillments[0]?.shipment?.pushing_status;
    let getTrackingCode = setInterval(() => {
      if (
        numberReloadGetTrackingCodeGHTK < maxNumberReload &&
        isRequest &&
        !trackingCode &&
        stepsStatusValue === FulFillmentStatus.PACKED &&
        pushingStatus !== "failed" &&
        sortedFulfillments[0]?.shipment?.delivery_service_provider_code === "ghtk"
      ) {
        getOrderDetail(id).then((response) => {
          numberReloadGetTrackingCodeGHTK = numberReloadGetTrackingCodeGHTK + 1;
          const sortedFulfillments = sortFulfillments(response.data?.fulfillments);
          if (sortedFulfillments && sortedFulfillments[0]?.shipment?.tracking_code) {
            onGetDetailSuccess(response.data);
            isRequest = false;
            showSuccess("Lấy mã vận đơn thành công!");
            clearInterval(getTrackingCode);
          }
        });
      } else {
        clearInterval(getTrackingCode);
      }
    }, 2500);
    return () => {
      clearInterval(getTrackingCode);
    };
  }, [OrderDetail?.fulfillments, id, onGetDetailSuccess, stepsStatusValue]);

  // link momo: sẽ load lại để lấy link momo
  useEffect(() => {
    if (!OrderDetail?.payments || OrderDetail.payments.length === 0) {
      return;
    }

    const momoPayments = OrderDetail?.payments.filter((single) => checkIfMomoPayment(single));
    if (!momoPayments || momoPayments?.length === 0) {
      return;
    }
    let getMomoPaymentShortLinkUrl = setInterval(() => {
      if (
        numberReloadGetMomoLink < maxNumberReload &&
        momoPayments.some(
          (momoPayment) =>
            !momoPayment.short_link &&
            !checkIfExpiredOrCancelledPayment(momoPayment) &&
            !checkIfFinishedPayment(momoPayment),
        )
      ) {
        getOrderDetail(id).then((response) => {
          numberReloadGetMomoLink = numberReloadGetMomoLink + 1;
          if (!response?.data?.payments) {
            return;
          }
          const momoPaymentsResponse = response.data?.payments.filter((single) =>
            checkIfMomoPayment(single),
          );
          if (
            !momoPaymentsResponse.some((single) => {
              return !(checkIfExpiredOrCancelledPayment(single) || single.short_link);
            })
          ) {
            onGetDetailSuccess(response.data);
            showSuccess("Lấy link Momo thành công!");
            clearInterval(getMomoPaymentShortLinkUrl);
          }
        });
      } else {
        clearInterval(getMomoPaymentShortLinkUrl);
      }
    }, 2500);
    return () => {
      clearInterval(getMomoPaymentShortLinkUrl);
    };
  }, [OrderDetail?.payments, id, onGetDetailSuccess]);

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
        dispatch(changeShippingServiceConfigAction(response));
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(
        getCustomerDetailAction(OrderDetail?.customer_id, (data) => {
          setCustomerDetail(data);
          dispatch(changeOrderCustomerAction(data));
        }),
      );
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
      dispatch(
        StoreDetailAction(OrderDetail?.store_id, (data) => {
          setStoreDetail(data);
          dispatch(changeStoreDetailAction(data));
        }),
      );
      getStoreBankAccountNumbersService({
        store_ids: [OrderDetail?.store_id],
      })
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            dispatch(getStoreBankAccountNumbersAction(response.data.items));
            const selected = response.data.items.find((single) => single.default && single.status);
            if (selected) {
              dispatch(changeSelectedStoreBankAccountAction(selected.account_number));
            } else {
              dispatch(changeSelectedStoreBankAccountAction(undefined));
            }
          } else {
            dispatch(getStoreBankAccountNumbersAction([]));
            handleFetchApiError(
              response,
              "Danh sách số tài khoản ngân hàng của cửa hàng",
              dispatch,
            );
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  }, [dispatch, OrderDetail?.store_id]);

  const totalPaid =
    OrderDetailAllFulfillment?.payments && OrderDetailAllFulfillment?.payments?.length > 0
      ? getAmountPayment(OrderDetailAllFulfillment.payments)
      : 0;

  // khách cần trả nguyên giá
  const totalOrder = OrderDetailAllFulfillment?.total || 0;

  // số tiền khách cần trả
  const customerNeedToPayValue = totalOrder - totalPaid;

  console.log("totalPaid", totalPaid);
  console.log("totalOrder", totalOrder);
  // end

  const initialFormValue = {
    returnMoneyField: [{ returnMoneyMethod: undefined, returnMoneyNote: undefined }],
    orderReturn_receive_return_store_id: defaultReceiveReturnStore?.id,
    ffm_receive_return_store_id: undefined,
  };

  const onSelectShipment = (value: number) => {
    if (value === ShipmentMethodOption.DELIVER_PARTNER) {
      setIsDisablePostPayment(true);
      if (paymentMethod === PaymentMethodOption.POST_PAYMENT) {
        setPaymentMethod(PaymentMethodOption.COD);
      }
    } else {
      setIsDisablePostPayment(false);
    }
    setShipmentMethod(value);
  };

  const editNote = useCallback(
    (note, customer_note, orderID) => {
      if (promotionUtils.checkIfPrivateNoteHasPromotionText(OrderDetail?.note || "")) {
        let promotionText = promotionUtils.getPromotionTextFromResponse(OrderDetail?.note || "");
        note = promotionUtils.combinePrivateNoteAndPromotionTitle(note, promotionText);
      }
      let params: any = {
        note,
        customer_note,
      };
      dispatch(
        updateOrderPartial(params, orderID, (success?: boolean) => {
          if (success && OrderDetail) {
            let orderDetailCopy = { ...OrderDetail };
            orderDetailCopy.note = note;
            orderDetailCopy.customer_note = customer_note;
            // console.log("orderDetailCopy",orderDetailCopy)
            setOrderDetail(orderDetailCopy);
            showSuccess("Cập nhật ghi chú thành công");
          }
        }),
      );
    },
    [OrderDetail, dispatch],
  );

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        let result = response.filter((single) => single.code !== PaymentMethodCode.CARD);
        setListPaymentMethods(result);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      orderConfigSaga((data: OrderConfigResponseModel) => {
        setOrderConfig(data);
      }),
    );
  }, [dispatch]);

  const eventKeyboardFunction = useCallback((event: KeyboardEvent) => {
    console.log(event.key);
    if (event.key === "F9") {
      event.preventDefault();
      event.stopPropagation();
    }
    switch (event.key) {
      case "F9":
        const btnOrderUpdateElement: any = document.getElementById("btn-order-edit");
        btnOrderUpdateElement?.click();
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", eventKeyboardFunction);
    return () => {
      window.removeEventListener("keydown", eventKeyboardFunction);
    };
  }, [eventKeyboardFunction]);

  useEffect(() => {
    const resetCountReload = () => {
      numberReloadGetTrackingCodeGHTK = 1;
      numberReloadGetMomoLink = 1;
    };
    resetCountReload();
  }, []);

  useEffect(() => {
    if (!OrderDetail?.code) {
      return;
    }
    const order_codes = OrderDetail?.code;
    const params = {
      order_codes,
    };
    searchHandoverService(params).then((response) => {
      if (isFetchApiSuccessful(response)) {
        setOrderDetailHandover(response.data.items);
      } else {
        handleFetchApiError(response, "Chi tiết biên bản bàn giao", dispatch);
      }
    });
  }, [OrderDetail?.code, dispatch]);

  useEffect(() => {
    form.setFieldsValue({
      ffm_receive_return_store_id: defaultReceiveReturnStore?.id,
    });
  }, [defaultReceiveReturnStore?.id, form]);

  return (
    <StyledComponent>
      <ContentContainer
        isLoading={loadingData}
        isError={isError}
        title={OrderDetail?.code ? `Đơn hàng ${OrderDetail?.code}` : "Đang tải dữ liệu..."}
        breadcrumb={
          OrderDetail
            ? [
                {
                  name: isOrderFromPOS(OrderDetail) ? `Đơn hàng offline` : `Đơn hàng online`,
                  path: isOrderFromPOS(OrderDetail) ? UrlConfig.OFFLINE_ORDERS : UrlConfig.ORDER,
                },
                {
                  name: `Danh sách đơn hàng ${isOrderFromPOS(OrderDetail) ? "offline" : "online"}`,
                  path: isOrderFromPOS(OrderDetail) ? UrlConfig.OFFLINE_ORDERS : UrlConfig.ORDER,
                },
                {
                  name: (
                    <span>
                      {OrderDetail?.code ? (
                        <>
                          Đơn hàng {OrderDetail?.code}{" "}
                          {OrderDetail?.uniform && <UniformText>(ĐƠN ĐỒNG PHỤC)</UniformText>}
                        </>
                      ) : (
                        "Đang tải dữ liệu..."
                      )}
                    </span>
                  ),
                },
              ]
            : undefined
        }
        extra={
          isOrderFromPOS(OrderDetail) ? undefined : (
            <CreateBillStep orderDetail={OrderDetailAllFulfillment} status={stepsStatusValue} />
          )
        }
      >
        <div className="orders">
          <Form layout="vertical" initialValues={initialFormValue} form={form}>
            <Row gutter={24} className="mainSection">
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
                    totalAmountReturnToCustomer={OrderDetail?.order_return_origin.money_amount}
                    OrderDetail={OrderDetail}
                  />
                )}

                {/*--- product ---*/}
                <UpdateProductCard
                  OrderDetail={OrderDetail}
                  shippingFeeInformedCustomer={shippingFeeInformedCustomer}
                  totalAmountReturnProducts={OrderDetail?.order_return_origin?.money_amount}
                  paymentMethods={paymentMethods}
                />
                {/*--- end product ---*/}

                {/* ko hiển thị hoàn tiền ở chi tiết đơn đổi */}
                {OrderDetail?.order_return_origin?.payment_status &&
                  OrderDetail?.order_return_origin?.payment_status !== ORDER_PAYMENT_STATUS.paid &&
                  false && (
                    <CardReturnMoney
                      paymentMethods={paymentMethods}
                      payments={[]}
                      returnMoneyAmount={customerNeedToPayValue}
                      isShowPaymentMethod={true}
                      setIsShowPaymentMethod={() => {}}
                      handleReturnMoney={handleReturnMoney}
                      returnPaymentMethodCode={returnPaymentMethodCode}
                      setReturnPaymentMethodCode={setReturnPaymentMethodCode}
                      canCreateMoneyRefund={canCreateMoneyRefund}
                    />
                  )}

                <CardShowOrderPayments
                  OrderDetail={OrderDetailAllFulfillment}
                  setOrderDetail={setOrderDetailAllFulfillment}
                  disabledActions={disabledActions}
                  disabledBottomActions={disabledBottomActions}
                  form={form}
                  isDisablePostPayment={isDisablePostPayment}
                  isShowPaymentPartialPayment={isShowPaymentPartialPayment}
                  isVisibleUpdatePayment={isVisibleUpdatePayment}
                  onPaymentSelect={onPaymentSelect}
                  paymentMethod={paymentMethod}
                  paymentMethods={paymentMethods}
                  setReload={setReload}
                  setShowPaymentPartialPayment={setShowPaymentPartialPayment}
                  setVisibleUpdatePayment={setVisibleUpdatePayment}
                  shipmentMethod={shipmentMethod}
                  stepsStatusValue={stepsStatusValue}
                  createPaymentCallback={createPaymentCallback}
                  totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                  payments={OrderDetail?.payments}
                  setExtraPayments={() => {}} //chú ý phải set
                  orderPageType={OrderPageTypeModel.orderDetail}
                />

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
                  customerNeedToPayValue={customerNeedToPayValue}
                  officeTime={officeTime}
                  shipmentMethod={shipmentMethod}
                  isVisibleShipping={isVisibleShipping}
                  OrderDetailAllFulfillment={OrderDetailAllFulfillment}
                  onReload={() => setReload(true)}
                  disabledActions={disabledActions}
                  disabledBottomActions={disabledBottomActions}
                  reasons={orderCancelFulfillmentReasonArr}
                  subReasons={orderCancelFulfillmentReasonResponse?.sub_reasons}
                  isEcommerceOrder={isEcommerceOrder.current}
                  shippingServiceConfig={shippingServiceConfig}
                  orderConfig={orderConfig}
                  ref={updateShipmentCardRef}
                  orderPageType={OrderPageTypeModel.orderDetail}
                  // currentStores={currentStores}
                  form={form}
                  // isShowReceiveProductConfirmModal={isShowReceiveProductConfirmModal}
                  // setIsShowReceiveProductConfirmModal={setIsShowReceiveProductConfirmModal}
                  // defaultReceiveReturnStore={defaultReceiveReturnStore}
                  handleChangeShippingFeeApplyOrderSettings={
                    handleChangeShippingFeeApplyOrderSettings
                  }
                  setIsShippingFeeAlreadyChanged={() => {}}
                />
                {/*--- end shipment ---*/}

                {OrderDetail?.order_return_origin?.items && (
                  <CardReturnReceiveProducts
                    handleReceivedReturnProductsToStore={handleReceivedReturnProductsToStore}
                    isReceivedReturnProducts={isReceivedReturnProducts}
                    isDetailPage
                    currentStores={currentStores}
                    isShowReceiveProductConfirmModal={isShowReceiveProductConfirmModal}
                    setIsShowReceiveProductConfirmModal={setIsShowReceiveProductConfirmModal}
                    form={form}
                    OrderDetail={OrderDetail}
                  />
                )}
                {/*--- end product ---*/}

                {checkIfOrderHasNotFinishPaymentMomo(OrderDetailAllFulfillment) && (
                  <CannotUpdateOrderWithWalletWarningInformation />
                )}
              </Col>

              <Col md={6}>
                {showOrderDetailUtm && <SidebarOrderDetailUtm OrderDetail={OrderDetail} />}
                <SidebarOrderDetailInformation
                  OrderDetail={OrderDetailAllFulfillment}
                  orderDetailHandover={orderDetailHandover}
                  currentStores={currentStores}
                />
                <SubStatusOrder
                  setOrderDetail={handleStatusOrder}
                  subStatusCode={subStatusCode}
                  orderId={OrderDetail?.id}
                  handleUpdateSubStatus={handleUpdateSubStatus}
                  setReload={setReload}
                  OrderDetailAllFulfillment={OrderDetailAllFulfillment}
                  stores={stores}
                  defaultReceiveReturnStore={defaultReceiveReturnStore}
                />
                <SidebarOrderDetailExtraInformation OrderDetail={OrderDetail} editNote={editNote} />
                <ActionHistory
                  orderId={OrderDetail?.id}
                  countChangeSubStatus={countChangeSubStatus}
                  reload={reload}
                />
                {customerDetail?.id && <SidebarOrderHistory customerId={customerDetail?.id} />}
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
              deleteOrderClick={handleDeleteOrderClick}
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
    </StyledComponent>
  );
};

export default OrderDetail;
