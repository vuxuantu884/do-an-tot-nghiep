import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Alert, Col, Form, Modal, Row } from "antd";
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
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getLoyaltyPoint, getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import { actionSetIsReceivedOrderReturn } from "domain/actions/order/order-return.action";
import {
  cancelOrderRequest, changeOrderCustomerAction, changeSelectedStoreBankAccountAction, changeShippingServiceConfigAction, changeStoreDetailAction, confirmDraftOrderAction, getStoreBankAccountNumbersAction, orderConfigSaga, OrderDetailAction,
  PaymentMethodGetList,
  updateOrderPartial,
  UpdatePaymentAction
} from "domain/actions/order/order.action";
import { actionListConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { EcommerceId, EcommerceOrderList, EcommerceOrderStatus, EcommerceOrderStatusRequest } from "model/request/ecommerce.request";
import {
  UpdateOrderPaymentRequest
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { EcommerceChangeOrderStatusReponse } from "model/response/ecommerce/ecommerce.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { OrderReasonModel, OrderResponse, StoreCustomResponse } from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { OrderConfigResponseModel, ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { ECOMMERCE_CHANNEL } from "screens/ecommerce/common/commonAction";
import { deleteOrderService, getOrderDetail, getStoreBankAccountNumbersService } from "service/order/order.service";
import {
  generateQuery,
  getAmountPayment,
  handleFetchApiError,
  isFetchApiSuccessful,
  isOrderFromPOS,
  sortFulfillments
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  POS,
  ShipmentMethodOption
} from "utils/Constants";
import { ORDER_PAYMENT_STATUS } from "utils/Order.constants";
import { isDeliveryOrderReturned } from "utils/OrderUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { changeEcommerceOrderStatus, getEcommerceStoreAddress } from "../../domain/actions/ecommerce/ecommerce.actions";
import { EcommerceAddressQuery, EcommerceStoreAddress } from "../../model/ecommerce/ecommerce.model";
import LogisticConfirmModal from "../ecommerce/orders/component/LogisticConfirmModal";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardReturnMoney from "./component/order-detail/CardReturnMoney";
import CardShowOrderPayments from "./component/order-detail/CardShowOrderPayments";
import UpdateCustomerCard from "./component/update-customer-card";
import UpdateProductCard from "./component/update-product-card";
import UpdateShipmentCard from "./component/update-shipment-card";
import CancelOrderModal from "./modal/cancel-order.modal";
import CardReturnReceiveProducts from "./order-return/components/CardReturnReceiveProducts";
import CardShowReturnProducts from "./order-return/components/CardShowReturnProducts";


type PropType = {
  id?: string;
};
type OrderParam = {
  id: string;
};

let numberReloadGetTrackingCodeGHTK = 1;
let maxNumberReloadGetTrackingCodeGHTK = 10;
let isRequest = true;

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
  OrderReasonModel|null
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [totalAmountReturnProducts, setTotalAmountReturnProducts] = useState<number>(0);
  console.log('totalAmountReturnProducts', totalAmountReturnProducts)
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

  const [returnPaymentMethodCode, setReturnPaymentMethodCode] = useState(PaymentMethodCode.CASH)

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
        return single.code === formReturnMoney.returnMoneyMethod;
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

  // const onPayments = (value: Array<OrderPaymentRequest>) => {
  //   // setPayments(value);
  // };

  const [isShowPaymentPartialPayment, setShowPaymentPartialPayment] = useState(false);

  const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
    chonCuaHangTruocMoiChonSanPham: false,
    cauHinhInNhieuLienHoaDon: 1,
  });

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
    if(isDeliveryOrderReturned(OrderDetailAllFulfillment?.fulfillments) && OrderDetailAllFulfillment?.fulfillments) {
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
          const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
          if (sortedFulfillments[0]?.status === FulFillmentStatus.UNSHIPPED || sortedFulfillments[0]?.status === FulFillmentStatus.CANCELLED) {
            return OrderStatus.FINALIZED;
          }
          if (sortedFulfillments[0]?.status === FulFillmentStatus.PICKED) {
            return FulFillmentStatus.PICKED;
          }
          if (sortedFulfillments[0]?.status === FulFillmentStatus.PACKED) {
            return FulFillmentStatus.PACKED;
          }
          if (sortedFulfillments[0]?.status === FulFillmentStatus.SHIPPING) {
            return FulFillmentStatus.SHIPPING;
          }
          if (sortedFulfillments[0]?.status === FulFillmentStatus.SHIPPED) {
            return FulFillmentStatus.SHIPPED;
          }
        }
      }
    } else if (OrderDetail?.status === OrderStatus.FINISHED) {
      return FulFillmentStatus.SHIPPED;
    }
    return "";
  }, [OrderDetail?.fulfillments, OrderDetail?.status, OrderDetailAllFulfillment?.fulfillments]);

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
      setShippingFeeInformedCustomer(_data.shipping_fee_informed_to_customer ? _data.shipping_fee_informed_to_customer : 0);
      form.setFieldsValue({shipping_fee_informed_to_customer: _data.shipping_fee_informed_to_customer ? _data.shipping_fee_informed_to_customer : 0})
      setOrderDetailAllFulfillment(data);
      setIsReceivedReturnProducts(_data.order_return_origin?.received ? true : false);
      if (_data.sub_status_code) {
        setSubStatusCode(_data.sub_status_code);
      }
      if (
        _data.status === OrderStatus.DRAFT &&
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
  }, [form]);
  

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
      if(!OrderDetail?.id) {
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
      const convertShopId: any = OrderDetail?.ecommerce_shop_id
      const ecommerceAddressQuery: EcommerceAddressQuery = {
        order_sn: OrderDetail.reference_code,
        shop_id: convertShopId?.toString(),
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
      const convertShopId: any = OrderDetail?.ecommerce_shop_id
      const orderRequest: EcommerceOrderList = {
        order_sn: OrderDetail.reference_code,
        shop_id: convertShopId?.toString(),
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
    if(updateShipmentCardRef.current) {
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
          if(OrderDetail?.order_return_origin?.id) {
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
          setReload(true);
        })
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
  
    const deleteOrderComfirm = () => {
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
              }`
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
        <React.Fragment>
          <div className="yody-modal-confirm-list-code">
            Bạn có chắc chắn xóa:
            <div className="yody-modal-confirm-item-code">
              <p>{OrderDetail?.code}</p>
            </div>
          </div>
          <p style={{ textAlign: "justify", color: "#ff4d4f" }}>
            Lưu ý: Đối với đơn ở trạng thái Thành công, khi thực hiện xoá, sẽ xoá
            luôn cả đơn trả liên quan. Bạn cần cân nhắc kĩ trước khi thực hiện xoá
            đơn ở trạng thái Thành công
          </p>
        </React.Fragment>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: deleteOrderComfirm,
    });
  }, [OrderDetail, dispatch, history]);

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
    const trackingCode =  sortedFulfillments[0]?.shipment?.tracking_code;
    const pushingStatus =  sortedFulfillments[0]?.shipment?.pushing_status;
    let getTrackingCode = setInterval(()=> {
      if (numberReloadGetTrackingCodeGHTK < maxNumberReloadGetTrackingCodeGHTK && isRequest && !trackingCode && stepsStatusValue === FulFillmentStatus.PACKED && pushingStatus !== "failed" && sortedFulfillments[0]?.shipment?.delivery_service_provider_code === "ghtk") {
        getOrderDetail(id).then(response => {
          numberReloadGetTrackingCodeGHTK = numberReloadGetTrackingCodeGHTK + 1;
          const sortedFulfillments = sortFulfillments(response.data?.fulfillments);
          if (sortedFulfillments && sortedFulfillments[0]?.shipment?.tracking_code) {
            onGetDetailSuccess(response.data);
            isRequest = false;
            showSuccess("Lấy mã vận đơn thành công!")
            clearInterval(getTrackingCode);
          }
        })
      } else {
        clearInterval(getTrackingCode);
      }
    }, 2500)
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
  const customerNeedToPayValue = useMemo(()=> {
    return (OrderDetail?.total || 0);
  }, [OrderDetail?.total]);

  const totalPaid = OrderDetail?.payments && OrderDetail?.payments?.length > 0 ? getAmountPayment(OrderDetail.payments) : 0;
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

  const editNote = useCallback(
    (note, customer_note, orderID) => {
      let params: any = {
        note,
        customer_note
      };
      dispatch(
        updateOrderPartial(params, orderID, (success?:boolean) => {
          if(success && OrderDetail)
          {
            let orderDetailCopy= {...OrderDetail};
            orderDetailCopy.note=note;
            orderDetailCopy.customer_note=customer_note;
            console.log("orderDetailCopy",orderDetailCopy)
            setOrderDetail(orderDetailCopy);
            showSuccess("Cập nhật ghi chú thành công")
          }
        })
      );
    },
    [OrderDetail, dispatch]
  );

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

  const eventKeyboardFunction=useCallback((event:KeyboardEvent)=>{
    console.log(event.key);
    if(event.key==="F9")
    {
      event.preventDefault();
      event.stopPropagation();
    }
    switch(event.key){
      case "F9":
        const btnOrderUpdateElement:any= document.getElementById("btn-order-edit");
        btnOrderUpdateElement?.click();
        break;
      default: break;
    }
  },[])

  useEffect(()=>{
    window.addEventListener("keydown",eventKeyboardFunction)
    return ()=>{
      window.removeEventListener("keydown",eventKeyboardFunction)
    }
  },[eventKeyboardFunction])

  return (
    <ContentContainer
      isLoading={loadingData}
      isError={isError}
      title= {isOrderFromPOS(OrderDetail) ? `Đơn hàng offline` : `Đơn hàng online`}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: `${UrlConfig.HOME}`,
        },
        {
          name: isOrderFromPOS(OrderDetail) ? `Danh sách đơn hàng offline` : `Danh sách đơn hàng online`,
          path: isOrderFromPOS(OrderDetail) ? UrlConfig.OFFLINE_ORDERS :  UrlConfig.ORDER,
        },
        {
          name: OrderDetail?.code
            ? `Đơn hàng ${OrderDetail?.code}`
            : "Đang tải dữ liệu...",
        },
      ]}
      extra={isOrderFromPOS(OrderDetail) ? undefined :
        <CreateBillStep orderDetail={OrderDetailAllFulfillment} status={stepsStatusValue} />
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

              {/* chi tiết đơn trả có điểm thì cần call api tính điểm hoàn, chi tiết đơn đổi thì ko cần */}
              {OrderDetail?.order_return_origin?.items && (
                <CardShowReturnProducts
                  listReturnProducts={OrderDetail?.order_return_origin?.items}
                  pointUsing={OrderDetail.order_return_origin.point_refund}
                  totalAmountReturnToCustomer={
                    OrderDetail?.order_return_origin.money_amount
                  }
                  OrderDetail={OrderDetail}
                />
              )}

              {/*--- product ---*/}
              <UpdateProductCard
                OrderDetail={OrderDetail}
                shippingFeeInformedCustomer={shippingFeeInformedCustomer}
                customerNeedToPayValue={customerNeedToPayValue}
                totalAmountReturnProducts={OrderDetail?.order_return_origin?.money_amount}
              />
              {/*--- end product ---*/}

              {/* ko hiển thị hoàn tiền ở chi tiết đơn đổi */}
              {OrderDetail?.order_return_origin?.payment_status && OrderDetail?.order_return_origin?.payment_status !== ORDER_PAYMENT_STATUS.paid && false && (
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
                    returnPaymentMethodCode={returnPaymentMethodCode}
                    setReturnPaymentMethodCode={setReturnPaymentMethodCode}
                  />
                )}
              
              <CardShowOrderPayments 
                OrderDetail={OrderDetail}
                disabledActions={disabledActions}
                disabledBottomActions={disabledBottomActions}
                form={form}
                isDisablePostPayment={isDisablePostPayment}
                isShowPaymentPartialPayment={isShowPaymentPartialPayment}
                isVisibleUpdatePayment={isVisibleUpdatePayment}
                onPaymentSelect={onPaymentSelect}
                paymentMethod={paymentMethod}
                paymentMethods={listPaymentMethods}
                setReload={setReload}
                setShowPaymentPartialPayment={setShowPaymentPartialPayment}
                setVisibleUpdatePayment={setVisibleUpdatePayment}
                shipmentMethod={shipmentMethod}
                stepsStatusValue={stepsStatusValue}
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

              {OrderDetail?.order_return_origin?.items && (
                <CardReturnReceiveProducts
                  handleReceivedReturnProducts={handleReceivedReturnProducts}
                  isReceivedReturnProducts={isReceivedReturnProducts}
                  isDetailPage
                />
              )}
              {OrderDetailAllFulfillment?.fulfillments?.some((p)=>(p.status===FulFillmentStatus.SHIPPING && p.return_status===FulFillmentStatus.RETURNING) 
              || (p.status===FulFillmentStatus.CANCELLED && p.return_status===FulFillmentStatus.RETURNED && p.status_before_cancellation===FulFillmentStatus.SHIPPING)) && (
              <Alert
                message={
                  <React.Fragment>
                    <div style={{lineHeight:"10px",fontWeight:"500", fontSize:"15px"}}>
                      <p>Lưu ý : Đối với đơn ở trạng thái đang hoàn</p>
                      <ul style={{lineHeight:"18px"}}>
                        <li>Nếu chọn nhận hàng: Hệ thống sẽ chuyển trạng thái đơn hàng thành Đã hoàn và cộng tồn đã hoàn cho các sản phẩm thuộc đơn hàng về kho</li>
                        <li>Nếu chọn đã giao hàng: Hệ thống sẽ chuyển trạng thái đơn hàng thành công</li>
                      </ul>
                    </div>
                  </React.Fragment>
                }
                type="warning"
                closable
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
                handleUpdateSubStatus={handleUpdateSubStatus}
                setReload={setReload}
                OrderDetailAllFulfillment={OrderDetailAllFulfillment}
              />
              <SidebarOrderDetailExtraInformation OrderDetail={OrderDetail} editNote={editNote}/>
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
  );
};

export default OrderDetail;
