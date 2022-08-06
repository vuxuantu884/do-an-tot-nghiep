import { Card, Col, Form, FormInstance, Input, Row } from "antd";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import CreateBillStep from "component/header/create-bill-step";
import OrderCreatePayments from "component/order/OrderCreatePayments";
import OrderCreateProduct from "component/order/OrderCreateProduct";
import OrderCreateShipment from "component/order/OrderCreateShipment";
import CreateOrderSidebar from "component/order/Sidebar/CreateOrderSidebar";
import { AppConfig } from "config/app.config";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { inventoryGetDetailVariantIdsExt } from "domain/actions/inventory/inventory.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  getLoyaltyPoint,
  getLoyaltyRate,
  getLoyaltyUsage,
} from "domain/actions/loyalty/loyalty.action";
import {
  changeOrderCustomerAction,
  changeOrderLineItemsAction,
  changeOrderThirdPLAction,
  changeSelectedStoreBankAccountAction,
  changeStoreDetailAction,
  getStoreBankAccountNumbersAction,
  orderCreateAction,
  OrderDetailAction,
  setIsExportBillAction,
  setIsShouldSetDefaultStoreBankAccountAction,
} from "domain/actions/order/order.action";
import useFetchStores from "hook/useFetchStores";
import { InventoryResponse } from "model/inventory";
import { modalActionType } from "model/modal/modal.model";
import { thirdPLModel } from "model/order/shipment.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  BillingAddressRequestModel,
  FulFillmentRequest,
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ShipmentRequest,
  ShippingAddress,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  OrderLineItemResponse,
  OrderPaymentResponse,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import useFetchOrderConfig from "screens/order-online/hooks/useFetchOrderConfig";
import useFetchPaymentMethods from "screens/order-online/hooks/useFetchPaymentMethods";
import useFetchShippingServiceConfig from "screens/order-online/hooks/useFetchShippingServiceConfig";
import { getStoreBankAccountNumbersService } from "service/order/order.service";
import {
  formatCurrency,
  getAmountPaymentRequest,
  getTotalAmount,
  getTotalAmountAfterDiscount,
  getTotalQuantity,
  handleFetchApiError,
  isFetchApiSuccessful,
  isOrderFromPOS,
  replaceFormatString,
  scrollAndFocusToDomElement,
  sortFulfillments,
  totalAmount,
} from "utils/AppUtils";
import {
  ADMIN_ORDER,
  DEFAULT_COMPANY,
  FACEBOOK,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  ShipmentMethod,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import { ORDER_PAYMENT_STATUS } from "utils/Order.constants";
import { checkIfMomoPayment } from "utils/OrderUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import OrderDetailBottomBar from "../component/order-detail/BottomBar";
import CardCustomer from "../component/order-detail/CardCustomer";
import useHandleMomoCreateShipment from "../hooks/useHandleMomoCreateShipment";
import SaveAndConfirmOrder from "../modal/save-confirm.modal";
import { StyledComponent } from "./styles";

let typeButton = "";

export default function Order() {
  const isUserCanCreateOrder = useRef(true);
  const dispatch = useDispatch();
  const history = useHistory();
  // const isExportBill = useSelector(
  // 	(state: RootReducerType) => state.orderReducer.orderDetail.isExportBill
  // );
  const isShouldSetDefaultStoreBankAccount = useSelector(
    (state: RootReducerType) => state.orderReducer.orderStore.isShouldSetDefaultStoreBankAccount,
  );
  const isLoadingDiscount = useSelector(
    (state: RootReducerType) => state.orderReducer.isLoadingDiscount,
  );

  const [isSaveDraft, setIsSaveDraft] = useState(false);
  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [customerChange, setCustomerChange] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingAddressesSecondPhone, setShippingAddressesSecondPhone] = useState<string>();
  const [billingAddress, setBillingAddress] = useState<BillingAddressRequestModel | null>(null);
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [itemGifts, setItemGifts] = useState<Array<OrderLineItemRequest>>([]);
  const [orderProductsAmount, setOrderProductsAmount] = useState(0);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [orderSourceId, setOrderSourceId] = useState<number | null>(null);
  const [shipmentMethod, setShipmentMethod] = useState<number>(ShipmentMethodOption.DELIVER_LATER);
  // console.log('billingAddress', billingAddress)
  const [paymentMethod, setPaymentMethod] = useState<number>(PaymentMethodOption.POST_PAYMENT);

  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRules] = useState<Array<LoyaltyUsageResponse>>([]);
  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();

  const [countFinishingUpdateCustomer, setCountFinishingUpdateCustomer] = useState(0);

  const [thirdPL, setThirdPL] = useState<thirdPLModel>({
    delivery_service_provider_code: "",
    delivery_service_provider_id: null,
    insurance_fee: null,
    delivery_service_provider_name: "",
    delivery_transport_type: "",
    service: "",
    shipping_fee_paid_to_three_pls: null,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [shippingFeeInformedToCustomer, setShippingFeeInformedToCustomer] = useState<number | null>(
    0,
  );
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [tags, setTags] = useState<string>("");
  const formRef = createRef<FormInstance>();
  const [form] = Form.useForm();
  const [isVisibleSaveAndConfirm, setIsVisibleSaveAndConfirm] = useState<boolean>(false);
  const [visibleBillStep, setVisibleBillStep] = useState({
    isShow: false,
    isAlreadyShow: false,
  });
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();

  console.log("payments", payments);

  // const [orderBillRequest, setOrderBillRequest] = useState<OrderBillRequestFormModel | undefined>(undefined);

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  // const [listOrderConfigs, setListOrderConfigs] =
  //   useState<OrderConfigResponseModel | null>(null);

  const paymentMethods = useFetchPaymentMethods();

  // const [shippingServiceConfig, setShippingServiceConfig] = useState<
  //   ShippingServiceConfigDetailResponseModel[]
  // >([]);

  const [inventoryResponse, setInventoryResponse] = useState<Array<InventoryResponse> | null>(null);
  const orderConfig = useFetchOrderConfig();

  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [modalAction, setModalAction] = useState<modalActionType>("edit");

  const queryParams = useQuery();
  const customerParam = queryParams.get("customer") || null;
  const actionParam = queryParams.get("action") || null;
  const cloneIdParam = queryParams.get("cloneId") || null;
  const typeParam = queryParams.get("type") || null;

  const [isCloneOrderFromPOS, setIsCloneOrderFromPOS] = useState(false);

  const handleCustomer = (_objCustomer: CustomerResponse | null) => {
    setCustomer(_objCustomer);
  };
  const onChangeShippingAddress = (_objShippingAddress: ShippingAddress | null) => {
    setShippingAddress(_objShippingAddress);
  };

  const ChangeShippingFeeCustomer = (value: number | null) => {
    form.setFieldsValue({ shipping_fee_informed_to_customer: value });
    setShippingFeeInformedToCustomer(value);
  };

  const [coupon, setCoupon] = useState<string>("");
  const [promotion, setPromotion] = useState<OrderDiscountRequest | null>(null);

  const shippingServiceConfig = useFetchShippingServiceConfig();

  const stores = useFetchStores();

  const onChangeInfoProduct = (
    _items: Array<OrderLineItemRequest>,
    _promotion?: OrderDiscountRequest | null,
  ) => {
    setItems(_items);
    let amount = totalAmount(_items);
    setOrderProductsAmount(amount);
    if (_promotion !== undefined) {
      setPromotion(_promotion);
    } else {
      setPromotion(null);
    }
  };

  const onSelectShipment = (value: number) => {
    setShipmentMethod(value);
    if (value === ShipmentMethodOption.DELIVER_PARTNER) {
      setIsDisablePostPayment(true);
      if (paymentMethod === PaymentMethodOption.POST_PAYMENT) {
        setPaymentMethod(PaymentMethodOption.COD);
      }
    } else {
      setIsDisablePostPayment(false);
    }
  };

  const [isLoadForm, setIsLoadForm] = useState(false);

  let initialRequest: OrderRequest = useMemo(() => {
    return {
      action: "", //finalized
      store_id: null,
      company_id: DEFAULT_COMPANY.company_id,
      price_type: AppConfig.price_type, //giá bán lẻ giá bán buôn
      tax_treatment: TaxTreatment.INCLUSIVE,
      delivery_service_provider_id: null,
      shipper_code: null,
      shipper_name: "",
      delivery_fee: null,
      shipping_fee_informed_to_customer: null,
      shipping_fee_paid_to_three_pls: null,
      dating_ship: undefined,
      requirements: null,
      source_id: null,
      note: "",
      tags: "",
      customer_note: "",
      account_code: userReducer.account?.code,
      assignee_code: userReducer.account?.code || null,
      marketer_code: null,
      coordinator_code: null,
      customer_id: null,
      reference_code: "",
      url: "",
      total_line_amount_after_line_discount: null,
      total: null,
      total_tax: "",
      total_discount: null,
      currency: AppConfig.currency,
      items: [],
      discounts: [],
      fulfillments: [],
      shipping_address: null,
      billing_address: null,
      payments: [],
      channel_id: null,
      automatic_discount: true,
      export_bill: false,
    };
  }, [userReducer.account?.code]);

  const [initialForm, setInitialForm] = useState<OrderRequest>({
    ...initialRequest,
  });

  let isCloneOrder = false;
  if (actionParam === "clone" && cloneIdParam) {
    isCloneOrder = true;
  }

  const onChangeTag = useCallback(
    (value: []) => {
      const strTag = value.join(",");
      setTags(strTag);
    },
    [setTags],
  );
  //Fulfillment Request
  const createFulFillmentRequest = (value: OrderRequest) => {
    let shipmentRequest = createShipmentRequest(value);
    let request: FulFillmentRequest = {
      store_id: value.store_id,
      account_code: `${userReducer.account?.code}`,
      assignee_code: value.assignee_code,
      delivery_type: "",
      stock_location_id: null,
      payment_status: "",
      total: totalOrderAmount,
      total_tax: null,
      total_discount: promotion?.value || null,
      total_quantity: getTotalQuantity(items),
      discount_rate: promotion?.rate || null,
      discount_value: promotion?.value || null,
      discount_amount: null,
      total_line_amount_after_line_discount: getTotalAmountAfterDiscount(items),
      shipment: shipmentRequest,
      items: [...items, ...itemGifts],
    };

    let fulfillmentRequests = [];
    if (
      paymentMethod !== PaymentMethodOption.POST_PAYMENT ||
      shipmentMethod === ShipmentMethodOption.SELF_DELIVER ||
      shipmentMethod === ShipmentMethodOption.PICK_AT_STORE
    ) {
      fulfillmentRequests.push(request);
    }

    if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE) {
      request.delivery_type = ShipmentMethod.PICK_AT_STORE;
    }

    if (
      paymentMethod === PaymentMethodOption.POST_PAYMENT &&
      shipmentMethod === ShipmentMethodOption.DELIVER_LATER &&
      typeButton === OrderStatus.FINALIZED
    ) {
      request.shipment = null;
      fulfillmentRequests.push(request);
    }
    return fulfillmentRequests;
  };

  const createShipmentRequest = (value: OrderRequest) => {
    let initialShipment: ShipmentRequest = {
      delivery_service_provider_id: null, //id đối tác vận chuyển
      delivery_service_provider_type: "", //shipper
      delivery_transport_type: "",
      shipper_code: "",
      shipper_name: "",
      handover_id: null,
      service: null,
      fee_type: "",
      fee_base_on: "",
      delivery_fee: null,
      shipping_fee_paid_to_three_pls: null,
      expected_received_date: value.dating_ship?.utc().format(),
      reference_status: "",
      shipping_fee_informed_to_customer: null,
      reference_status_explanation: "",
      cod: null,
      cancel_reason: "",
      tracking_code: "",
      tracking_url: "",
      received_date: "",
      sender_address_id: null,
      note_to_shipper: "",
      requirements: value.requirements,
      sender_address: null,
      office_time: form.getFieldValue("office_time"),
    };

    const {
      delivery_service_provider_id,
      delivery_transport_type,
      delivery_service_provider_code,
      delivery_service_provider_name,
      service,
      shipping_fee_paid_to_three_pls,
    } = thirdPL;

    const shipmentValue = {
      [ShipmentMethodOption.DELIVER_PARTNER]: {
        ...initialShipment,
        delivery_service_provider_id,
        delivery_service_provider_type: ShipmentMethod.EXTERNAL_SERVICE,
        delivery_transport_type,
        delivery_service_provider_code,
        delivery_service_provider_name,
        sender_address_id: storeId,
        service,
        shipping_fee_paid_to_three_pls,
      },
      [ShipmentMethodOption.SELF_DELIVER]: {
        ...initialShipment,
        delivery_service_provider_type: thirdPL.delivery_service_provider_code,
        service,
        shipper_code: value.shipper_code,
        shipping_fee_paid_to_three_pls,
        cod: totalAmountCustomerNeedToPay,
      },
      [ShipmentMethodOption.PICK_AT_STORE]: {
        ...initialShipment,
        delivery_service_provider_type: ShipmentMethod.PICK_AT_STORE,
        cod: totalAmountCustomerNeedToPay,
      },
      [ShipmentMethodOption.DELIVER_LATER]: null,
      default: null,
    };

    return shipmentValue[shipmentMethod] || shipmentValue.default;
  };

  const createDiscountRequest = () => {
    if (!promotion || !promotion.amount || !promotion.value) {
      return [];
    } else {
      return [promotion];
    }
  };

  const createOrderCallback = useCallback(
    (value: OrderResponse) => {
      setTimeout(() => {
        isUserCanCreateOrder.current = true;
      }, 1000);
      if (value.fulfillments && value.fulfillments.length > 0) {
        showSuccess("Đơn được lưu và duyệt thành công!");
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      } else {
        showSuccess("Đơn được lưu nháp thành công!");
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      }
    },
    [history],
  );

  const handleTypeButton = (type: string) => {
    typeButton = type;
  };

  //show modal save and confirm order ?
  const onCancelSaveAndConfirm = () => {
    setIsVisibleSaveAndConfirm(false);
  };

  const onOkSaveAndConfirm = () => {
    typeButton = OrderStatus.DRAFT;
    formRef.current?.submit();
    setIsVisibleSaveAndConfirm(false);
  };

  const showSaveAndConfirmModal = () => {
    if (shipmentMethod !== ShipmentMethodOption.DELIVER_LATER || paymentMethod !== 3) {
      setIsVisibleSaveAndConfirm(true);
    } else {
      typeButton = OrderStatus.DRAFT;
      formRef.current?.submit();
    }
  };

  const checkIfNotCustomerAddress = () => {
    return (
      !shippingAddress?.phone ||
      !shippingAddress?.district_id ||
      !shippingAddress?.ward_id ||
      !shippingAddress?.full_address
    );
  };

  if (!isUserCanCreateOrder.current) {
    setTimeout(() => {
      isUserCanCreateOrder.current = true;
    }, 3000);
  }

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPayment = getAmountPaymentRequest(payments);

  /**
   * tổng giá trị đơn hàng = giá đơn hàng + phí ship - giảm giá
   */
  const totalOrderAmount = useMemo(() => {
    return Math.round(
      orderProductsAmount +
        (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
        (promotion?.value || 0),
    );
  }, [orderProductsAmount, promotion?.value, shippingFeeInformedToCustomer]);
  /**
   * số tiền khách cần trả: nếu âm thì là số tiền trả lại khách
   */
  const totalAmountCustomerNeedToPay = useMemo(() => {
    return Math.round(totalOrderAmount - totalAmountPayment);
  }, [totalOrderAmount, totalAmountPayment]);

  const handleCreateOrder = async (values: OrderRequest) => {
    // console.log("values", values);
    // return;
    dispatch(showLoading());
    if (typeButton === OrderStatus.DRAFT) {
      setIsSaveDraft(true);
    } else {
      setIsCreating(true);
    }
    try {
      await dispatch(
        orderCreateAction(values, createOrderCallback, () => {
          dispatch(hideLoading());
          setIsCreating(false);
          setIsSaveDraft(false);
        }),
      );
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        dispatch(hideLoading());
        setIsSaveDraft(false);
        setIsCreating(false);
      };
    }
  };

  const onFinish = (values: OrderRequest) => {
    if (!isUserCanCreateOrder.current) {
      return;
    }
    isUserCanCreateOrder.current = false;
    values.channel_id = ADMIN_ORDER.channel_id;
    values.company_id = DEFAULT_COMPANY.company_id;
    const element2: any = document.getElementById("save-and-confirm");
    element2.disable = true;
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount = getTotalAmountAfterDiscount(items);
    values.tags = tags;
    values.items = items.concat(itemGifts);
    values.discounts = lstDiscount;
    let _shippingAddressRequest: any = {
      ...shippingAddress,
      second_phone: shippingAddressesSecondPhone,
    };
    values.shipping_address = _shippingAddressRequest;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.customer_ward = customer?.ward;
    values.customer_district = customer?.district;
    values.customer_city = customer?.city;
    values.total_line_amount_after_line_discount = total_line_amount_after_line_discount;
    values.export_bill = billingAddress?.tax_code ? true : false;
    values.shipping_fee_informed_to_customer = shippingFeeInformedToCustomer;
    // values.bill = orderBillRequest;

    //Nếu là lưu nháp Fulfillment = [], payment = []
    if (typeButton === OrderStatus.DRAFT) {
      if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE && checkIfNotCustomerAddress()) {
        showError("Vui lòng cập nhật địa chỉ giao hàng!");
        const element: any = document.getElementById(
          "customer_update_shipping_addresses_full_address",
        );
        scrollAndFocusToDomElement(element);
        return;
      }
      values.fulfillments = [];
      // thêm payment vào đơn nháp
      // values.payments = [];
      values.payments = payments.filter((payment) => payment.amount > 0);

      values.action = OrderStatus.DRAFT;
      values.total = getTotalAmount(values.items);
    } else {
      //Nếu là đơn lưu và xác nhận
      values.fulfillments = lstFulFillment;
      values.action = OrderStatus.FINALIZED;
      values.payments = payments.filter((payment) => payment.amount !== 0);
      values.total = totalOrderAmount;
      if (
        values?.fulfillments &&
        values.fulfillments.length > 0 &&
        values.fulfillments[0].shipment
      ) {
        values.fulfillments[0].shipment.cod = totalAmountCustomerNeedToPay;
      }
    }

    if (!values.customer_id) {
      showError("Vui lòng chọn khách hàng và nhập địa chỉ giao hàng");
      const element: any = document.getElementById("search_customer");
      element?.focus();
    } else {
      if (customerChange) {
        showWarning("Bạn chưa lưu thông tin địa chỉ giao hàng");
      }
      if (items.length === 0) {
        showError("Vui lòng chọn ít nhất 1 sản phẩm");
        const element: any = document.getElementById("search_product");
        element?.focus();
      } else {
        if (totalAmountPayment > totalOrderAmount) {
          showError("Vui lòng không nhập thừa tiền !");
          const element: any = document.getElementsByClassName("create-order-payment ")[0];
          scrollAndFocusToDomElement(element);
          return;
        }
        if (shipmentMethod !== ShipmentMethodOption.PICK_AT_STORE && checkIfNotCustomerAddress()) {
          showError("Vui lòng cập nhật địa chỉ giao hàng!");
          const element: any = document.getElementById(
            "customer_update_shipping_addresses_full_address",
          );
          scrollAndFocusToDomElement(element);
          return;
        }
        if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
          if (checkIfNotCustomerAddress()) {
            form.validateFields();
            showError("Vui lòng nhập đầy đủ thông tin chỉ giao hàng");
            setIsCreating(false);
            return;
          }
          if (values.delivery_service_provider_id === null && typeButton !== OrderStatus.DRAFT) {
            showError("Vui lòng chọn đối tác giao hàng");
            setIsCreating(false);
          } else {
            (async () => {
              handleCreateOrder(values);
            })();
            // dispatch(orderCreateAction(values, createOrderCallback));
          }
        } else {
          if (shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && !thirdPL.service) {
            showError("Vui lòng chọn đơn vị vận chuyển!");
            const element = document.getElementsByClassName("orders-shipment")[0] as HTMLElement;
            scrollAndFocusToDomElement(element);
            setIsCreating(false);
          } else {
            if (checkIfNotCustomerAddress()) {
              form.validateFields();
              showError("Vui lòng nhập đầy đủ thông tin chỉ giao hàng");
              return;
            }
            if (checkInventory()) {
              let isPointFocus = checkPointFocus(values);
              if (isPointFocus) {
                (async () => {
                  handleCreateOrder(values);
                })();
              }
            }
          }
        }
      }
    }
  };
  const handleScroll = useCallback(() => {
    const pageYOffsetToShow = 100;
    if (
      (window.pageYOffset > pageYOffsetToShow || visibleBillStep.isAlreadyShow) &&
      !visibleBillStep.isShow
    ) {
      setVisibleBillStep({
        isShow: true,
        isAlreadyShow: true,
      });
    }
  }, [visibleBillStep]);

  const mergePaymentData = (payments: OrderPaymentResponse[]) => {
    let result: OrderPaymentResponse[] = [];
    payments.forEach((payment) => {
      let existPayment = result.filter(function (single) {
        return single.payment_method_code === payment.payment_method_code;
      });
      if (existPayment.length) {
        let existPaymentIndex = result.indexOf(existPayment[0]);
        if (result[existPaymentIndex].payment_method_code === PaymentMethodCode.POINT) {
          result[existPaymentIndex].point =
            (result[existPaymentIndex]?.point || 0) + (payment?.point || 0);
        }
        result[existPaymentIndex].paid_amount =
          result[existPaymentIndex].paid_amount + payment.paid_amount;

        result[existPaymentIndex].amount = result[existPaymentIndex].amount + payment.amount;

        result[existPaymentIndex].return_amount =
          result[existPaymentIndex].return_amount + payment.return_amount;
      } else {
        result.push(payment);
      }
    });
    return result;
  };

  const checkPointFocus = useCallback(
    (value: any) => {
      let pointFocus = payments.find((p) => p.code === "point");

      if (!pointFocus) return true;

      let discount = 0;
      value.items.forEach((p: any) => (discount = discount + p.discount_amount));

      let rank = loyaltyUsageRules.find(
        (x) =>
          x.rank_id ===
          (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id),
      );

      // let currentPoint = !loyaltyPoint
      //   ? 0
      //   : loyaltyPoint.point === null
      //   ? 0
      //   : loyaltyPoint.point;
      let point = !pointFocus ? 0 : pointFocus.point === undefined ? 0 : pointFocus.point;

      let totalAmountPayable =
        orderProductsAmount +
        (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
        (promotion?.value || 0); //tổng tiền phải trả

      let usageRate =
        loyaltyRate === null || loyaltyRate === undefined ? 0 : loyaltyRate.usage_rate;

      let enableUsingPoint =
        loyaltyRate === null || loyaltyRate === undefined ? false : loyaltyRate.enable_using_point;

      let limitOrderPercent = !rank
        ? 0
        : !rank.limit_order_percent
        ? 100
        : rank.limit_order_percent; // % tối đa giá trị đơn hàng.

      let limitAmount = point * usageRate;

      let amountLimitOrderPercent = (totalAmountPayable * limitOrderPercent) / 100;

      if (enableUsingPoint === false) {
        showError("Chương trình tiêu điểm đang tạm dừng hoạt động");
        return false;
      }

      if (!loyaltyPoint || limitOrderPercent === 0) {
        showError("Khách hàng đang không được áp dụng chương trình tiêu điểm");
        return false;
      }
      if (rank?.block_order_have_discount === true && (discount > 0 || promotion)) {
        showError("Khách hàng không được áp dụng tiêu điểm cho đơn hàng có chiết khấu");
        return false;
      }

      if (limitAmount > amountLimitOrderPercent) {
        showError(`Số điểm tiêu vượt quá ${limitOrderPercent}% giá trị đơn hàng`);
        return false;
      }

      // if (point > curenPoint) {
      //   showError("Số điểm tiêu phải nhỏ hơn hoặc bằng số điểm hiện có");
      //   return false;
      // }
      return true;
    },
    [
      payments,
      loyaltyUsageRules,
      orderProductsAmount,
      shippingFeeInformedToCustomer,
      promotion,
      loyaltyRate,
      loyaltyPoint,
    ],
  );

  const checkInventory = () => {
    let status: boolean = true;

    if (items && items != null) {
      items.forEach(function (value) {
        let available = value.available === null ? 0 : value.available;
        if (available <= 0 && orderConfig?.sellable_inventory !== true) {
          status = false;
          setIsCreating(false);
        }
      });
      if (!status) showError(`Không thể bán sản phẩm đã hết hàng trong kho`);
    }

    return status;
  };

  const eventFunctional = useCallback(
    (event: KeyboardEvent) => {
      if (["F6", "F9"].indexOf(event.key) !== -1) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (isCreating || isLoadingDiscount || isSaveDraft) return;
      const btnSaveAndConfirm = document.getElementById("save-and-confirm");
      const btnSaveDraftConfirm = document.getElementById("save-draft-confirm");
      switch (event.key) {
        case "F6":
          btnSaveDraftConfirm?.click();
          break;
        case "F9":
          btnSaveAndConfirm?.click();
          break;
        default:
          break;
      }
    },
    [isCreating, isLoadingDiscount, isSaveDraft],
  );

  //xử lý shipment khi có momo
  useHandleMomoCreateShipment(setShipmentMethod, payments);

  useEffect(() => {
    if (storeId) {
      dispatch(
        StoreDetailCustomAction(storeId, (data) => {
          setStoreDetail(data);
          dispatch(changeStoreDetailAction(data));
        }),
      );
      getStoreBankAccountNumbersService({
        store_ids: [storeId],
      })
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            dispatch(getStoreBankAccountNumbersAction(response.data.items));
            const selected = response.data.items.find((single) => single.default && single.status);
            if (isShouldSetDefaultStoreBankAccount) {
              if (selected) {
                dispatch(changeSelectedStoreBankAccountAction(selected.account_number));
              } else {
                let paymentsResult = [...payments];
                let bankPaymentIndex = paymentsResult.findIndex(
                  (payment) => payment.payment_method_code === PaymentMethodCode.BANK_TRANSFER,
                );
                if (bankPaymentIndex > -1) {
                  paymentsResult[bankPaymentIndex].paid_amount = 0;
                  paymentsResult[bankPaymentIndex].amount = 0;
                  paymentsResult[bankPaymentIndex].return_amount = 0;
                }
                setPayments(paymentsResult);
                dispatch(changeSelectedStoreBankAccountAction(undefined));
              }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, storeId]);

  //windows offset
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (customerParam) {
      // console.log("customerParam", customerParam)
      dispatch(getCustomerDetailAction(+customerParam, setCustomer));
    }
  }, [customerParam, dispatch]);

  useEffect(() => {
    const handleResponseItems = (
      response: OrderResponse,
      responseItems: OrderLineItemRequest[],
    ) => {
      let getGiftResponse = (itemNormal: OrderLineItemResponse) => {
        return response.items.filter((item) => {
          return item.type === Type.GIFT && item.position === itemNormal.position;
        });
      };
      responseItems = response.items
        .filter((item) => {
          return item.type !== Type.GIFT;
        })
        .map((item) => {
          return {
            ...item,
            discount_items: item.discount_items.filter((single) => single.amount && single.value),
            gifts: getGiftResponse(item),
          };
        });
      // console.log('responseItems', responseItems)
      setItems(responseItems);
      dispatch(changeOrderLineItemsAction(responseItems));
      return responseItems;
    };

    const handleResponsePayments = (
      response: OrderResponse,
      new_payments: OrderPaymentRequest[] | null,
    ) => {
      if (response.payments && response.payments?.length > 0) {
        setPaymentMethod(PaymentMethodOption.PRE_PAYMENT);
        // clone có tiền thừa thì xóa
        new_payments = mergePaymentData(
          response.payments
            .filter((single) => single.status === ORDER_PAYMENT_STATUS.paid)
            .map((payment) => {
              let result = {
                ...payment,
                status: ORDER_PAYMENT_STATUS.unpaid,
                expired_at: null,
                pay_url: "",
                short_link: "",
                ref_transaction_code: "",
              };
              if (payment.return_amount) {
                result = {
                  ...result,
                  amount: payment.paid_amount,
                  return_amount: 0,
                };
              }
              return result;
            }),
        );
        setPayments(new_payments);
      }
    };

    const handleResponseShipmentMethod = (response: OrderResponse) => {
      if (
        response.payments?.some((payment) => {
          return payment.paid_amount > 0 && checkIfMomoPayment(payment);
        })
      ) {
        setShipmentMethod(ShipmentMethodOption.DELIVER_LATER);
      } else {
        let newShipmentMethod = ShipmentMethodOption.DELIVER_LATER;
        if (response.fulfillments) {
          const sortedFulfillments = sortFulfillments(response.fulfillments);

          const handleShipmentMethod = {
            [ShipmentMethod.EMPLOYEE]: () => {
              newShipmentMethod = ShipmentMethodOption.SELF_DELIVER;
              const shipmentEmployee = sortedFulfillments[0]?.shipment;
              if (shipmentEmployee) {
                const {
                  delivery_service_provider_code,
                  delivery_service_provider_id,
                  insurance_fee,
                  delivery_service_provider_name,
                  delivery_transport_type,
                  service,
                  shipping_fee_paid_to_three_pls,
                } = shipmentEmployee;
                const thirdPLResponse = {
                  delivery_service_provider_code,
                  delivery_service_provider_id,
                  insurance_fee,
                  delivery_service_provider_name,
                  delivery_transport_type,
                  service,
                  shipping_fee_paid_to_three_pls,
                };
                dispatch(changeOrderThirdPLAction(thirdPLResponse));
                setThirdPL(thirdPLResponse);
              }
            },
            [ShipmentMethod.EXTERNAL_SHIPPER]: () => {
              newShipmentMethod = ShipmentMethodOption.SELF_DELIVER;
            },
            [ShipmentMethod.EXTERNAL_SERVICE]: () => {
              newShipmentMethod = ShipmentMethodOption.DELIVER_PARTNER;
              const shipmentDeliverPartner = sortedFulfillments[0]?.shipment;
              if (shipmentDeliverPartner) {
                const {
                  delivery_service_provider_code,
                  delivery_service_provider_id,
                  insurance_fee,
                  delivery_service_provider_name,
                  delivery_transport_type,
                  service,
                  shipping_fee_paid_to_three_pls,
                } = shipmentDeliverPartner;
                const thirdPLResponse = {
                  delivery_service_provider_code,
                  delivery_service_provider_id,
                  insurance_fee,
                  delivery_service_provider_name,
                  delivery_transport_type,
                  service,
                  shipping_fee_paid_to_three_pls,
                };
                dispatch(changeOrderThirdPLAction(thirdPLResponse));
                setThirdPL(thirdPLResponse);
              }
            },
            [ShipmentMethod.PICK_AT_STORE]: () => {
              newShipmentMethod = ShipmentMethodOption.PICK_AT_STORE;
            },
            default: () => {
              newShipmentMethod = ShipmentMethodOption.DELIVER_LATER;
            },
          };
          handleShipmentMethod[
            sortedFulfillments[0]?.shipment?.delivery_service_provider_type || "default"
          ]();

          setShipmentMethod(newShipmentMethod);
        }
      }
    };

    const handleResponseCloneOrder = async (response: OrderResponse) => {
      if (response) {
        // console.log('response', response)
        const isFBOrder = response.channel_id === FACEBOOK.channel_id;
        let responseItems: OrderLineItemRequest[] = response.items;
        handleResponseItems(response, responseItems);
        setShippingFeeInformedToCustomer(response.shipping_fee_informed_to_customer);
        if (response.store_id) {
          setStoreId(response.store_id);
        }
        if (response.tags) {
          setTags(response.tags);
        }
        if (response?.discounts && response?.discounts[0]) {
          setPromotion(response?.discounts[0]);
          if (response.discounts[0].discount_code) {
            setCoupon(response.discounts[0].discount_code);
          }
        }
        let newDatingShip = initialForm.dating_ship;
        let newShipperCode = initialForm.shipper_code;
        let new_payments = initialForm.payments;

        if (response.fulfillments && response.fulfillments[0]) {
          if (response?.fulfillments[0]?.shipment) {
            if (response.fulfillments[0]?.shipment?.expected_received_date) {
              newDatingShip = moment(response.fulfillments[0]?.shipment?.expected_received_date);
            }
            newShipperCode = response.fulfillments[0]?.shipment?.shipper_code;
          }
        }

        handleResponsePayments(response, new_payments);

        await setInitialForm({
          ...initialForm,
          account_code: userReducer?.account?.code,
          customer_note: response.customer_note,
          source_id: response.source_id,
          assignee_code: response?.assignee_code || null,
          marketer_code: response?.marketer_code || undefined,
          coordinator_code: undefined, // sao chép đơn hàng ko sao chép nhân viên điều phối
          store_id: response.store_id,
          items: responseItems,
          dating_ship: newDatingShip,
          shipper_code: newShipperCode,
          shipping_fee_paid_to_three_pls: response?.fulfillments
            ? response?.fulfillments[0]?.shipment?.shipping_fee_paid_to_three_pls || null
            : null,
          shipping_fee_informed_to_customer: response.shipping_fee_informed_to_customer,
          payments: new_payments,
          reference_code:
            typeParam === "split-order"
              ? response.code || ""
              : isFBOrder
              ? ""
              : response.reference_code,
          url: response.url,
          note: response.note,
          tags: response.tags,
          channel_id: response.channel_id,
          automatic_discount: response.automatic_discount,
        });
        form.resetFields();
        // load lại form sau khi set initialValue
        setIsLoadForm(true);
        if (
          response.fulfillments &&
          response.fulfillments.length > 0 &&
          response.fulfillments[0].shipment?.cod
        ) {
          setPaymentMethod(PaymentMethodOption.COD);
        }

        setOrderProductsAmount(response.total_line_amount_after_line_discount);

        handleResponseShipmentMethod(response);

        if (response.export_bill) {
          dispatch(setIsExportBillAction(true));
        } else {
          dispatch(setIsExportBillAction(false));
        }
        const bankPayment = response.payments?.find(
          (single) =>
            single.payment_method_code === PaymentMethodCode.BANK_TRANSFER &&
            single.bank_account_number,
        );
        if (bankPayment) {
          dispatch(changeSelectedStoreBankAccountAction(bankPayment.bank_account_number));
        } else {
          dispatch(setIsShouldSetDefaultStoreBankAccountAction(true));
        }
        if (response.billing_address) {
          setBillingAddress({
            ...response.billing_address,
            order_id: undefined,
          });
        }
      }
    };

    const handleResetCloneOrder = async () => {
      await setInitialForm({
        ...initialRequest,
      });
      setCustomer(null);
      setItems([]);
      setItemGifts([]);
      setPayments([]);
      setStoreId(null);
      setTags("");
      setIsLoadForm(true);
      setShippingFeeInformedToCustomer(0);
      setPromotion(null);
      setShipmentMethod(ShipmentMethodOption.DELIVER_LATER);
      form.resetFields();
    };

    const fetchCloneOrderData = () => {
      if (isCloneOrder && cloneIdParam) {
        dispatch(
          OrderDetailAction(cloneIdParam, (response) => {
            if (isOrderFromPOS(response)) {
              setIsCloneOrderFromPOS(true);
              return;
            }
            const { customer_id } = response;

            if (customer_id) {
              dispatch(
                getCustomerDetailAction(customer_id, (responseCustomer) => {
                  setCustomer(responseCustomer);
                  dispatch(changeOrderCustomerAction(responseCustomer));
                  responseCustomer.shipping_addresses.forEach((item) => {
                    if (item.default === true) {
                      setShippingAddress(item);
                    }
                  });
                }),
              );
            }
            handleResponseCloneOrder(response);
          }),
        );
      } else {
        handleResetCloneOrder();
      }
    };
    fetchCloneOrderData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneIdParam, dispatch, isCloneOrder, userReducer?.account?.code]);

  useEffect(() => {
    if (!isCloneOrder) {
      dispatch(setIsShouldSetDefaultStoreBankAccountAction(true));
    }
  }, [dispatch, isCloneOrder]);

  useEffect(() => {
    if (customer) {
      dispatch(
        getLoyaltyPoint(customer.id, (data) => {
          setLoyaltyPoint(data);
          setCountFinishingUpdateCustomer((prev) => prev + 1);
        }),
      );
      setVisibleCustomer(true);
      if (customer.shipping_addresses) {
        let shipping_addresses_index: number = customer.shipping_addresses.findIndex(
          (x) => x.default === true,
        );
        let item =
          shipping_addresses_index !== -1
            ? customer.shipping_addresses[shipping_addresses_index]
            : null;
        onChangeShippingAddress(item);
      } else onChangeShippingAddress(null);
      // if (customer.billing_addresses) {
      // 	let billing_addresses_index = customer.billing_addresses.findIndex(x => x.default === true);
      // 	setBillingAddress(billing_addresses_index !== -1 ? customer.billing_addresses[billing_addresses_index] : null);
      // }
      // else
      // setBillingAddress(null)
    } else {
      setLoyaltyPoint(null);
      setCountFinishingUpdateCustomer((prev) => prev + 1);
    }
  }, [dispatch, customer, userReducer]);

  useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRules));
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch]);

  useEffect(() => {
    formRef.current?.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneIdParam, isCloneOrder]);

  useEffect(() => {
    if (items && items != null && items?.length > 0) {
      let variant_id: Array<number> = [];
      items.forEach((element) => variant_id.push(element.variant_id));
      dispatch(inventoryGetDetailVariantIdsExt(variant_id, null, setInventoryResponse));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, items?.length]);

  useEffect(() => {
    window.addEventListener("keydown", eventFunctional);
    return () => {
      window.removeEventListener("keydown", eventFunctional);
    };
  }, [eventFunctional]);

  if (isCloneOrderFromPOS) {
    return <div className="cannotClone">Đơn hàng offline không thể sao chép</div>;
  }

  return (
    <StyledComponent>
      <ContentContainer
        title="Tạo mới đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: "/",
          },
          {
            name: "Đơn hàng",
          },
          {
            name: "Tạo mới đơn hàng",
          },
        ]}
        extra={<CreateBillStep orderDetail={null} />}
      >
        <React.Fragment>
          <div className="orders">
            {isLoadForm && (
              <Form
                layout="vertical"
                initialValues={initialForm}
                ref={formRef}
                form={form}
                onFinishFailed={({ errorFields }: any) => {
                  const element: any = document.getElementById(errorFields[0].name.join(""));
                  scrollAndFocusToDomElement(element);
                }}
                onFinish={onFinish}
              >
                <Form.Item noStyle hidden name="action">
                  <Input />
                </Form.Item>
                <Form.Item noStyle hidden name="currency">
                  <Input />
                </Form.Item>
                <Form.Item noStyle hidden name="account_code">
                  <Input />
                </Form.Item>
                <Form.Item noStyle hidden name="tax_treatment">
                  <Input />
                </Form.Item>
                <Form.Item noStyle hidden name="tags">
                  <Input />
                </Form.Item>
                <Row gutter={20} className="mainSection">
                  <Col md={18}>
                    <CardCustomer
                      customer={customer}
                      handleCustomer={handleCustomer}
                      loyaltyPoint={loyaltyPoint}
                      loyaltyUsageRules={loyaltyUsageRules}
                      ShippingAddressChange={onChangeShippingAddress}
                      shippingAddress={shippingAddress}
                      billingAddress={billingAddress}
                      setBillingAddress={setBillingAddress}
                      isVisibleCustomer={isVisibleCustomer}
                      setVisibleCustomer={setVisibleCustomer}
                      modalAction={modalAction}
                      setModalAction={setModalAction}
                      setOrderSourceId={setOrderSourceId}
                      shippingAddressesSecondPhone={shippingAddressesSecondPhone}
                      setShippingAddressesSecondPhone={setShippingAddressesSecondPhone}
                      form={form}
                      initialForm={initialForm}
                      updateOrder
                      setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                      customerChange={customerChange}
                      setCustomerChange={setCustomerChange}
                      // handleOrderBillRequest={setOrderBillRequest}
                      // initOrderBillRequest = {orderBillRequest}
                    />
                    <OrderCreateProduct
                      orderProductsAmount={orderProductsAmount}
                      totalOrderAmount={totalOrderAmount}
                      changeInfo={onChangeInfoProduct}
                      setStoreId={(value) => {
                        setStoreId(value);
                        form.setFieldsValue({ store_id: value });
                      }}
                      storeId={storeId}
                      shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
                      setItemGift={setItemGifts}
                      form={form}
                      items={items}
                      setItems={setItems}
                      coupon={coupon}
                      setCoupon={setCoupon}
                      promotion={promotion}
                      setPromotion={setPromotion}
                      inventoryResponse={inventoryResponse}
                      customer={customer}
                      setInventoryResponse={setInventoryResponse}
                      totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                      orderConfig={orderConfig}
                      orderSourceId={orderSourceId}
                      loyaltyPoint={loyaltyPoint}
                      setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                      countFinishingUpdateCustomer={countFinishingUpdateCustomer}
                      shipmentMethod={shipmentMethod}
                      stores={stores}
                    />
                    <Card title="THANH TOÁN">
                      <OrderCreatePayments
                        setPaymentMethod={setPaymentMethod}
                        payments={payments}
                        setPayments={setPayments}
                        paymentMethod={paymentMethod}
                        shipmentMethod={shipmentMethod}
                        totalOrderAmount={totalOrderAmount}
                        loyaltyRate={loyaltyRate}
                        isDisablePostPayment={isDisablePostPayment}
                        paymentMethods={paymentMethods}
                      />
                    </Card>

                    <Card
                      title="ĐÓNG GÓI VÀ GIAO HÀNG"
                      extra={
                        <Form.Item
                          label="Phí ship báo khách:"
                          name="shipping_fee_informed_to_customer"
                          className="shipping_fee_customer"
                        >
                          <NumberInput
                            format={(a: string) => formatCurrency(a)}
                            replace={(a: string) => replaceFormatString(a)}
                            placeholder="0"
                            className="formInputAmount"
                            maxLength={9}
                            minLength={0}
                            onChange={(value) => {
                              if (value) {
                                setShippingFeeInformedToCustomer(value);
                              } else {
                                setShippingFeeInformedToCustomer(0);
                              }
                            }}
                          />
                        </Form.Item>
                      }
                    >
                      <OrderCreateShipment
                        shipmentMethod={shipmentMethod}
                        orderProductsAmount={orderProductsAmount}
                        storeDetail={storeDetail}
                        customer={customer}
                        items={items}
                        isCancelValidateDelivery={false}
                        totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                        setShippingFeeInformedToCustomer={ChangeShippingFeeCustomer}
                        onSelectShipment={onSelectShipment}
                        thirdPL={thirdPL}
                        setThirdPL={setThirdPL}
                        form={form}
                        shippingServiceConfig={shippingServiceConfig}
                        orderConfig={orderConfig}
                        payments={payments}
                      />
                    </Card>
                  </Col>
                  <Col md={6}>
                    <CreateOrderSidebar
                      tags={tags}
                      onChangeTag={onChangeTag}
                      customerId={customer?.id}
                      form={form}
                      storeId={storeId}
                      setReload={() => {}}
                    />
                  </Col>
                </Row>
                <OrderDetailBottomBar
                  //isShow={!visibleBillStep.isShow}
                  isShow={false}
                  formRef={formRef}
                  handleTypeButton={handleTypeButton}
                  isVisibleGroupButtons={true}
                  showSaveAndConfirmModal={showSaveAndConfirmModal}
                  isCreating={isCreating}
                  isSaveDraft={isSaveDraft}
                />
              </Form>
            )}
          </div>
          <SaveAndConfirmOrder
            onCancel={onCancelSaveAndConfirm}
            onOk={onOkSaveAndConfirm}
            visible={isVisibleSaveAndConfirm}
            okText="Đồng ý"
            cancelText="Hủy"
            title="Bạn có chắc chắn lưu nháp đơn hàng này không?"
            text="Đơn hàng này sẽ bị xóa thông tin giao hàng hoặc thanh toán nếu có"
            icon={WarningIcon}
          />
        </React.Fragment>
      </ContentContainer>
    </StyledComponent>
  );
}
