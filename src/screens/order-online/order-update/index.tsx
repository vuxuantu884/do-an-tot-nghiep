import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Card, Col, Collapse, Form, FormInstance, Input, Modal, Row, Space, Tag } from "antd";
import calendarOutlined from "assets/icon/calendar_outline.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import CreateBillStep from "component/header/create-bill-step";
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
import { getLoyaltyPoint, getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import {
  changeOrderCustomerAction,
  changeSelectedStoreBankAccountAction,
  getStoreBankAccountNumbersAction,
  OrderDetailAction,
  orderUpdateAction,
  setIsExportBillAction,
  setIsShouldSetDefaultStoreBankAccountAction,
} from "domain/actions/order/order.action";
import useFetchStores from "hook/useFetchStores";
import { InventoryResponse } from "model/inventory";
import { modalActionType } from "model/modal/modal.model";
import { OrderPageTypeModel } from "model/order/order.model";
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
} from "model/request/order.request";
import { CustomerResponse, ShippingAddress } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  FulFillmentResponse,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import CannotUpdateOrderWithWalletWarningInformation from "screens/order-online/component/CannotUpdateOrderWithWalletWarningInformation";
import OrderFulfillmentHeader from "screens/order-online/component/OrderPackingAndShippingDetail/OrderFulfillmentHeader";
import useFetchDeliverServices from "screens/order-online/hooks/useFetchDeliverServices";
import useFetchOrderConfig from "screens/order-online/hooks/useFetchOrderConfig";
import useFetchPaymentMethods from "screens/order-online/hooks/useFetchPaymentMethods";
import useFetchShippingServiceConfig from "screens/order-online/hooks/useFetchShippingServiceConfig";
import { deleteOrderService, getStoreBankAccountNumbersService } from "service/order/order.service";
import {
  formatCurrency,
  getAccountCodeFromCodeAndName,
  getAmountPayment,
  getTotalAmountAfterDiscount,
  handleFetchApiError,
  isFetchApiSuccessful,
  replaceFormatString,
  sortFulfillments,
  totalAmount,
} from "utils/AppUtils";
import {
  DEFAULT_COMPANY,
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  POS,
  ShipmentMethod,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { ORDER_PAYMENT_STATUS } from "utils/Order.constants";
import {
  canCreateShipment,
  checkIfFulfillmentCancelled,
  checkIfOrderCancelled,
  checkIfOrderHasNoPayment,
  checkIfOrderHasNotFinishPaymentMomo,
  checkIfOrderHasShipmentCod,
} from "utils/OrderUtils";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import { ECOMMERCE_CHANNEL } from "../../ecommerce/common/commonAction";
import CardCustomer from "../component/CardCustomer";
import OrderDetailBottomBar from "../component/order-detail/BottomBar";
import CardShowOrderPayments from "../component/order-detail/CardShowOrderPayments";
import OrderFulfillmentCancelledShowDate from "../component/OrderPackingAndShippingDetail/OrderFulfillmentCancelledShowDate";
import OrderFulfillmentDetail from "../component/OrderPackingAndShippingDetail/OrderFulfillmentDetail";
import OrderFulfillmentShowFulfillment from "../component/OrderPackingAndShippingDetail/OrderFulfillmentShowFulfillment";
import OrderFulfillmentShowProduct from "../component/OrderPackingAndShippingDetail/OrderFulfillmentShowProduct";
import useHandleMomoCreateShipment from "../hooks/useHandleMomoCreateShipment";
import { StyledComponent } from "./styles";

type PropTypes = {
  id?: string;
  isCloneOrder?: boolean;
};
type OrderParam = {
  id: string;
};
export default function Order(props: PropTypes) {
  const dispatch = useDispatch();
  const dateFormat = DATE_FORMAT.DDMMYY_HHmm;
  const history = useHistory();
  let { id } = useParams<OrderParam>();
  const queryParams = useQuery();
  const isSplit = queryParams.get("isSplit") || null;
  const isShouldSetDefaultStoreBankAccount = useSelector(
    (state: RootReducerType) => state.orderReducer.orderStore.isShouldSetDefaultStoreBankAccount,
  );
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [customerChange, setCustomerChange] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingAddressesSecondPhone, setShippingAddressesSecondPhone] = useState<string>();
  const [billingAddress, setBillingAddress] = useState<BillingAddressRequestModel | null>(null);
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [itemGifts, setItemGifts] = useState<Array<OrderLineItemRequest>>([]);
  const [orderProductsAmount, setOrderProductsAmount] = useState<number>(0);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [orderSourceId, setOrderSourceId] = useState<number | null>(null);
  const [shipmentMethod, setShipmentMethod] = useState<number>(ShipmentMethodOption.DELIVER_LATER);
  const [paymentMethod, setPaymentMethod] = useState<number>(PaymentMethodOption.POST_PAYMENT);
  const [updating, setUpdating] = useState(false);
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<Array<LoyaltyUsageResponse>>([]);
  const [countFinishingUpdateCustomer, setCountFinishingUpdateCustomer] = useState(0);
  const [shippingFeeInformedToCustomer, setShippingFeeInformedToCustomer] = useState<number | null>(
    null,
  );

  const paymentMethods = useFetchPaymentMethods();

  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [extraPayments, setExtraPayments] = useState<Array<OrderPaymentRequest>>([]);

  const totalPaymentsIncludePaymentUpdate = [...payments, ...extraPayments];
  console.log("payments", payments);
  console.log("extraPayments", extraPayments);
  console.log("totalPaymentsIncludePaymentUpdate", totalPaymentsIncludePaymentUpdate);
  const [tags, setTag] = useState<string>("");
  const formRef = createRef<FormInstance>();
  const [form] = Form.useForm();

  const deliveryServices = useFetchDeliverServices();

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [isShowPaymentPartialPayment, setShowPaymentPartialPayment] = useState(false);

  const [inventoryResponse, setInventoryResponse] = useState<Array<InventoryResponse> | null>(null);

  const orderConfig = useFetchOrderConfig();

  const [isVisibleCustomer, setVisibleCustomer] = useState(true);
  const [modalAction, setModalAction] = useState<modalActionType>("edit");
  const isFirstLoad = useRef(true);
  const handleCustomer = (_objCustomer: CustomerResponse | null) => {
    setCustomer(_objCustomer);
    if (_objCustomer) {
      const shippingAddressItem = _objCustomer.shipping_addresses.find(
        (p: any) => p.default === true,
      );
      shippingAddressItem && setShippingAddress(shippingAddressItem);
    }
  };

  const onChangeBillingAddress = (_objBillingAddress: BillingAddressRequestModel | null) => {
    setBillingAddress(_objBillingAddress);
  };

  const shippingServiceConfig = useFetchShippingServiceConfig();

  const [coupon, setCoupon] = useState<string>("");
  const [promotion, setPromotion] = useState<OrderDiscountRequest | null>(null);
  // console.log('promotion33', promotion)
  // console.log('coupon', coupon)
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
    }
  };

  const [isLoadForm, setIsLoadForm] = useState(false);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);

  const [reload, setReload] = useState(false);

  const [isDisableSelectSource, setIsDisableSelectSource] = useState(false);

  const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sortedFulfillmentsIncludeHideFulfillment = OrderDetail?.fulfillments
    ? OrderDetail?.fulfillments.sort((a, b) => b.id - a.id)
    : [];

  const activeSortedFulfillments = sortedFulfillments.filter(
    (fulfillment) => !checkIfFulfillmentCancelled(fulfillment),
  );

  const stepsStatusValue = useMemo(() => {
    switch (OrderDetail?.status) {
      case OrderStatus.DRAFT:
        return OrderStatus.DRAFT;
      case OrderStatus.CANCELLED:
        return OrderStatus.CANCELLED;
      case OrderStatus.FINISHED:
        return FulFillmentStatus.SHIPPED;
      case OrderStatus.FINALIZED:
        if (sortedFulfillments.length === 0) {
          return OrderStatus.FINALIZED;
        } else {
          switch (sortedFulfillments[0]?.status) {
            case FulFillmentStatus.UNSHIPPED:
            case FulFillmentStatus.CANCELLED:
            case FulFillmentStatus.RETURNED:
            case FulFillmentStatus.RETURNING:
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
      default:
        return OrderStatus.FINALIZED;
    }
  }, [OrderDetail?.status, sortedFulfillments]);

  const setLevelOrder = useCallback(() => {
    switch (OrderDetail?.status) {
      case OrderStatus.DRAFT:
        return 1;
      case OrderStatus.CANCELLED:
        return 5;
      case OrderStatus.FINISHED:
        return 5;
      case OrderStatus.FINALIZED:
        if (!sortedFulfillments.length || sortedFulfillments[0].shipment === null) {
          if (
            !OrderDetail.payment_status ||
            OrderDetail.payment_status === ORDER_PAYMENT_STATUS.unpaid
          ) {
            return 2;
          } else {
            return 3;
          }
        } else {
          if (
            sortedFulfillments[0].status === FulFillmentStatus.RETURNED ||
            sortedFulfillments[0].status === FulFillmentStatus.CANCELLED ||
            sortedFulfillments[0].status === FulFillmentStatus.RETURNING
          ) {
            if (
              !OrderDetail.payment_status ||
              OrderDetail.payment_status === ORDER_PAYMENT_STATUS.unpaid
            ) {
              return 2;
            } else {
              return 3;
            }
          }
          return 4;
        }
      default:
        return 1;
    }
  }, [OrderDetail?.payment_status, OrderDetail?.status, sortedFulfillments]);
  let levelOrder = setLevelOrder();

  let initialForm: OrderRequest = useMemo(() => {
    return {
      action: "", //finalized
      store_id: null,
      company_id: DEFAULT_COMPANY.company_id,
      price_type: "retail_price", //giá bán lẻ giá bán buôn
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
      finalized: false,
      uniform:false,
      // automatic_discount: true,
      automatic_discount: false, // sửa đơn hàng ko mặc định bật chiết khấu tự động
    };
  }, [userReducer.account?.code]);

  const onChangeTag = useCallback(
    (value: []) => {
      const strTag = value.join(", ");
      setTag(strTag);
    },
    [setTag],
  );

  //Fulfillment Request
  const createFulFillmentRequest = (
    fulfillments: FulFillmentResponse[] | null | undefined,
    value: OrderRequest,
  ) => {
    if (!fulfillments) {
      return null;
    }
    let shipmentRequest = createShipmentRequest(value);
    let hideFulFillment = fulfillments?.find((fulfillment) => !fulfillment.shipment);
    let request: FulFillmentRequest = {
      id: hideFulFillment?.id,
      store_id: value.store_id,
      account_code: OrderDetail?.account_code,
      assignee_code: value.assignee_code,
      delivery_type: "",
      stock_location_id: null,
      payment_status: "",
      total: orderProductsAmount,
      total_tax: null,
      total_discount: null,
      total_quantity: null,
      discount_rate: promotion?.rate || null,
      discount_value: promotion?.value || null,
      discount_amount: null,
      total_line_amount_after_line_discount: null,
      shipment: shipmentRequest,
      items: [...items, ...itemGifts].map((item) => {
        let index = sortedFulfillmentsIncludeHideFulfillment[0]?.items.findIndex(
          (single) => single?.order_line_item_id === item.id,
        );
        if (index > -1) {
          return {
            ...item,
            id: sortedFulfillmentsIncludeHideFulfillment[0]?.items[index]?.id,
          };
        }
        return {
          ...item,
        };
      }),
    };
    if (
      sortedFulfillmentsIncludeHideFulfillment &&
      sortedFulfillmentsIncludeHideFulfillment.length
    ) {
      const ffm = sortedFulfillmentsIncludeHideFulfillment.filter(
        (i) =>
          i.status !== FulFillmentStatus.CANCELLED &&
          i.status !== FulFillmentStatus.RETURNING &&
          i.status !== FulFillmentStatus.RETURNED,
      );
      request.id =
        shipmentMethod === ShipmentMethodOption.DELIVER_LATER || (ffm.length && !ffm[0].shipment)
          ? ffm[0]?.id
          : null;
    }
    let listFulfillmentRequest = [];
    if (
      paymentMethod !== PaymentMethodOption.POST_PAYMENT ||
      shipmentMethod === ShipmentMethodOption.SELF_DELIVER ||
      shipmentMethod === ShipmentMethodOption.PICK_AT_STORE
    ) {
      listFulfillmentRequest.push(request);
    }

    if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE) {
      request.delivery_type = ShipmentMethod.PICK_AT_STORE;
    }

    if (
      paymentMethod === PaymentMethodOption.POST_PAYMENT &&
      shipmentMethod === ShipmentMethodOption.DELIVER_LATER
      // && typeButton === OrderStatus.FINALIZED
    ) {
      request.shipment = null;
      listFulfillmentRequest.push(request);
    }
    return listFulfillmentRequest;
  };

  const createShipmentRequest = (value: OrderRequest) => {
    let objShipment: ShipmentRequest = {
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
      cod: totalAmountCustomerNeedToPayIncludePaymentUpdate,
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

    switch (shipmentMethod) {
      case ShipmentMethodOption.DELIVER_PARTNER:
        return {
          ...objShipment,
          delivery_service_provider_id: thirdPL.delivery_service_provider_id,
          delivery_service_provider_type: "external_service",
          delivery_transport_type: thirdPL.delivery_transport_type,
          delivery_service_provider_code: thirdPL.delivery_service_provider_code,
          delivery_service_provider_name: thirdPL.delivery_service_provider_name,
          sender_address_id: storeId,
          service: thirdPL.service,
          shipping_fee_paid_to_three_pls: thirdPL.shipping_fee_paid_to_three_pls,
        };

      case ShipmentMethodOption.SELF_DELIVER:
        return {
          ...objShipment,
          delivery_service_provider_type: thirdPL.delivery_service_provider_code,
          shipper_code: value.shipper_code,
          shipping_fee_paid_to_three_pls: value.shipping_fee_paid_to_three_pls,
          service: thirdPL.service,
        };

      case ShipmentMethodOption.PICK_AT_STORE:
        objShipment.delivery_service_provider_type = ShipmentMethod.PICK_AT_STORE;
        return {
          ...objShipment,
          delivery_service_provider_type: ShipmentMethod.PICK_AT_STORE,
        };

      case ShipmentMethodOption.DELIVER_LATER:
        return null;

      default:
        break;
    }
  };

  const shipping_requirements = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.shipping_requirement,
  );
  const [requirementNameView, setRequirementNameView] = useState<string | null>(null);

  const getRequirementName = useCallback(() => {
    if (activeSortedFulfillments.length > 0) {
      let requirement = activeSortedFulfillments[0].shipment?.requirements?.toString();
      const reqObj = shipping_requirements?.find((r) => r.value === requirement);
      setRequirementNameView(reqObj ? reqObj?.name : "");
    }
  }, [activeSortedFulfillments, shipping_requirements]);

  useEffect(() => {
    getRequirementName();
  }, [getRequirementName]);

  const createDiscountRequest = () => {
    if (!promotion || !promotion?.value) {
      return [];
    }
    let objDiscount: OrderDiscountRequest = {
      rate: promotion?.rate,
      value: promotion?.value,
      amount: promotion?.value,
      promotion_id: null,
      reason: "",
      source: "",
      discount_code: coupon,
      order_id: null,
    };
    let listDiscountRequest = [];
    if (coupon) {
      listDiscountRequest.push({
        discount_code: coupon,
        rate: promotion?.rate,
        value: promotion?.value,
        amount: promotion?.value,
        promotion_id: null,
        reason: "",
        source: "",
        order_id: null,
      });
    } else if (promotion?.promotion_id) {
      listDiscountRequest.push({
        discount_code: null,
        rate: promotion?.rate,
        value: promotion?.value,
        amount: promotion?.value,
        promotion_id: promotion?.promotion_id,
        reason: promotion.reason,
        source: "",
        order_id: null,
      });
    } else if (!promotion) {
      return [];
    } else {
      listDiscountRequest.push(objDiscount);
    }

    return listDiscountRequest;
  };

  const updateOrderCallback = useCallback(
    (value: OrderResponse) => {
      setUpdating(false);
      showSuccess("Đơn được cập nhật thành công");
      history.push(`${UrlConfig.ORDER}/${value.id}`);
    },
    [history],
  );
  const updateAndConfirmOrderCallback = useCallback(
    (value: OrderResponse) => {
      setUpdatingConfirm(false);
      showSuccess("Đơn được cập nhật và xác nhận thành công");
      history.push(`${UrlConfig.ORDER}/${value.id}`);
    },
    [history],
  );
  // type  = update and confirm
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const [updatingConfirm, setUpdatingConfirm] = useState<boolean>(false);

  const handleTypeButton = (type: string) => {
    if (type === OrderStatus.FINALIZED) {
      setIsFinalized(true);
    }
  };

  const handleUpdateOrder = (valuesCalculateReturnAmount: OrderRequest) => {
    console.log("valuesCalculateReturnAmount", valuesCalculateReturnAmount);
    // return;
    dispatch(showLoading());
    try {
      if (!isFinalized) {
        setUpdating(true);
      } else {
        setUpdatingConfirm(true);
      }
      dispatch(
        orderUpdateAction(
          OrderDetail?.id || 0,
          valuesCalculateReturnAmount,
          isFinalized ? updateAndConfirmOrderCallback : updateOrderCallback,
          () => {
            setUpdating(false);
            setUpdatingConfirm(false);
            dispatch(hideLoading());
          },
        ),
      );
    } catch {
      isFinalized ? setUpdatingConfirm(false) : setUpdating(false);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      () => {
        dispatch(hideLoading());
        setUpdating(false);
        setUpdatingConfirm(false);
      };
    }
  };

  const onFinish = (values: OrderRequest) => {
    if (!OrderDetail) return;
    values.assignee_code = getAccountCodeFromCodeAndName(values.assignee_code);
    values.marketer_code = getAccountCodeFromCodeAndName(values.marketer_code);
    values.coordinator_code = getAccountCodeFromCodeAndName(values.coordinator_code);
    const element2: any = document.getElementById("btn-save-order-update");
    element2.disable = true;
    let lstFulFillment = createFulFillmentRequest(OrderDetail.fulfillments, values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount = getTotalAmountAfterDiscount(items);

    values.shipping_fee_informed_to_customer = shippingFeeInformedToCustomer;
    values.fulfillments = lstFulFillment;
    values.action = OrderStatus.FINALIZED;
    values.total = orderProductsAmount;
    values.finalized = isFinalized;

    if (isEcommerceOrder) {
      values.ecommerce_shop_id = OrderDetail.ecommerce_shop_id; //thêm ecommerce_shop_id khi cập nhật đơn hàng sàn
      if (ecommerceShipment && values?.fulfillments && values.fulfillments.length > 0) {
        values.fulfillments[0].shipment = ecommerceShipment;
      }
    }

    values.tags = tags;
    values.items = items.concat(itemGifts);
    values.discounts = lstDiscount;
    values.shipping_address =
      shippingAddress && levelOrder <= 3
        ? { ...shippingAddress, second_phone: shippingAddressesSecondPhone }
        : OrderDetail.shipping_address
        ? {
            ...OrderDetail.shipping_address,
            second_phone: shippingAddressesSecondPhone,
          }
        : null;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.customer_ward = customer?.ward;
    values.customer_district = customer?.district;
    values.customer_city = customer?.city;
    values.total_line_amount_after_line_discount = total_line_amount_after_line_discount;
    values.channel_id = OrderDetail.channel_id;
    values.company_id = DEFAULT_COMPANY.company_id;

    values.export_bill = billingAddress?.tax_code ? true : false;
    if (!values.customer_id) {
      showError("Vui lòng chọn khách hàng và nhập địa chỉ giao hàng");
      const element: any = document.getElementById("search_customer");
      element?.focus();
    } else {
      if (customerChange) {
        showWarning("Chưa lưu thông tin địa chỉ giao hàng");
      }
      if (items.length === 0) {
        showError("Vui lòng chọn ít nhất 1 sản phẩm");
        const element: any = document.getElementById("search_product");
        element?.focus();
      } else {
        let valuesCalculateReturnAmount = {
          ...values,
          payments: totalPaymentsIncludePaymentUpdate.filter(
            (payment) => payment.amount !== 0 || payment.paid_amount !== 0,
          ),
        };
        if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
          if (values.delivery_service_provider_id === null) {
            showError("Vui lòng chọn đối tác giao hàng");
          } else {
            (async () => {
              handleUpdateOrder(valuesCalculateReturnAmount);
            })();
          }
        } else {
          if (shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && !thirdPL.service) {
            showError("Vui lòng chọn đơn vị vận chuyển");
          } else {
            if (checkInventory()) {
              let bolCheckpointFocus = checkPointFocus(values);
              if (bolCheckpointFocus) {
                (async () => {
                  handleUpdateOrder(valuesCalculateReturnAmount);
                })();
              }
            }
          }
        }
      }
    }
  };

  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);

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

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPaymentPaid =
    OrderDetail?.payments && OrderDetail?.payments?.length > 0
      ? getAmountPayment(OrderDetail.payments)
      : 0;

  const totalAmountPaymentIncludePaymentUpdate = getAmountPayment(
    totalPaymentsIncludePaymentUpdate,
  );
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
    return totalOrderAmount - totalAmountPaymentPaid;
  }, [totalOrderAmount, totalAmountPaymentPaid]);

  const totalAmountCustomerNeedToPayIncludePaymentUpdate =
    totalOrderAmount - totalAmountPaymentIncludePaymentUpdate;

  console.log("totalOrderAmount", totalOrderAmount);
  console.log("totalAmountPaymentPaid", totalAmountPaymentPaid);
  console.log("totalAmountCustomerNeedToPay", totalAmountCustomerNeedToPay);
  console.log(
    "totalAmountCustomerNeedToPayIncludePaymentUpdate",
    totalAmountCustomerNeedToPayIncludePaymentUpdate,
  );

  useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch]);

  const [thirdPL, setThirdPL] = useState<thirdPLModel>({
    delivery_service_provider_code: "",
    delivery_service_provider_id: null,
    insurance_fee: null,
    delivery_service_provider_name: "",
    delivery_transport_type: "",
    service: "",
    shipping_fee_paid_to_three_pls: null,
  });

  const updateCancelClick = useCallback(() => {
    history.push(`${UrlConfig.ORDER}/${id}`);
  }, [history, id]);

  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();

  const ChangeShippingFeeCustomer = (value: number | null) => {
    formRef.current?.setFieldsValue({
      shipping_fee_informed_to_customer: value,
    });
    setShippingFeeInformedToCustomer(value);
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
        <React.Fragment>
          <div className="yody-modal-confirm-list-code">
            Bạn có chắc chắn xóa:
            <div className="yody-modal-confirm-item-code">
              <p>{OrderDetail?.code}</p>
            </div>
          </div>
          <p style={{ textAlign: "justify", color: "#ff4d4f" }}>
            Lưu ý: Đối với đơn ở trạng thái Thành công, khi thực hiện xoá, sẽ xoá luôn cả đơn trả
            liên quan. Bạn cần cân nhắc kĩ trước khi thực hiện xoá đơn ở trạng thái Thành công
          </p>
        </React.Fragment>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: deleteOrderConfirm,
    });
  }, [OrderDetail, dispatch, history]);

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
      getStoreBankAccountNumbersService({
        store_ids: [storeId],
      })
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            dispatch(getStoreBankAccountNumbersAction(response.data.items));
            const selected = response.data.items.find((single) => single.default && single.status);
            if (isShouldSetDefaultStoreBankAccount && checkIfShowCreatePayment()) {
              if (selected) {
                dispatch(changeSelectedStoreBankAccountAction(selected.account_number));
              } else {
                let paymentsResult = [...payments];
                let bankPaymentIndex = paymentsResult.findIndex(
                  (payment) => payment.payment_method_code === PaymentMethodCode.BANK_TRANSFER,
                );
                // sàn tài trợ cũng đang lấy PaymentMethodCode.BANK_TRANSFER, nên phải check name
                if (
                  bankPaymentIndex > -1 &&
                  paymentsResult[bankPaymentIndex].payment_method !== "Sàn Tài trợ"
                ) {
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
  }, [dispatch, isShouldSetDefaultStoreBankAccount, storeId]);

  // handle for ecommerce order
  const [isEcommerceOrder, setIsEcommerceOrder] = useState(false);
  const [ecommerceShipment, setEcommerceShipment] = useState<any>();

  const handleEcommerceOrder = (orderData: any) => {
    const orderChannel = orderData?.channel?.toLowerCase() || "";
    const isEcommerce = ECOMMERCE_CHANNEL.includes(orderChannel);
    setIsEcommerceOrder(isEcommerce);

    // set ecommerce shipment
    const fulfillmentsHasShipment = orderData?.fulfillments?.filter((item: any) => !!item.shipment);
    const fulfillment = fulfillmentsHasShipment ? fulfillmentsHasShipment[0] : null;

    if (isEcommerce && fulfillment && fulfillment.shipment) {
      const shipment = fulfillment.shipment;
      let newEcommerceShipment = {
        cod: shipment.cod,
        shipping_fee_paid_to_three_pls: shipment.shipping_fee_paid_to_three_pls,
        delivery_service_provider_code: shipment.delivery_service_provider_code,
        delivery_service_provider_id: shipment.delivery_service_provider_id,
        delivery_service_provider_name: shipment.delivery_service_provider_name,
        delivery_service_provider_type: shipment.delivery_service_provider_type,
        delivery_transport_type: shipment.delivery_transport_type,
        office_time: shipment.office_time,
        requirements: shipment.requirements,
        requirements_name: shipment.requirements_name,
        sender_address: shipment.sender_address,
        sender_address_id: shipment.sender_address_id,
        service: shipment.service,
        tracking_code: shipment.tracking_code,
        recipient_sort_code: shipment.recipient_sort_code,
      };

      setEcommerceShipment(newEcommerceShipment);
    }
  };
  // end handle for ecommerce order

  console.log("OrderDetail", OrderDetail);

  const fetchOrderDetailData = () => {
    dispatch(
      OrderDetailAction(id, async (response) => {
        const { customer_id } = response;
        setOrderDetail(response);
        handleEcommerceOrder(response);
        if (customer_id) {
          dispatch(
            getCustomerDetailAction(customer_id, (responseCustomer) => {
              setCustomer(responseCustomer);
              dispatch(changeOrderCustomerAction(responseCustomer));
            }),
          );
        }
        if (response) {
          let giftResponse = response.items.filter((item) => {
            return item.type === Type.GIFT;
          });
          let responseItems: OrderLineItemRequest[] = response.items
            .filter((item) => {
              return item.type !== Type.GIFT;
            })
            .map((item) => {
              return {
                id: item.id,
                sku: item.sku,
                variant_id: item.variant_id,
                variant: item.variant,
                show_note: item.show_note,
                variant_barcode: item.variant_barcode,
                product_id: item.product_id,
                product_type: item.product_type,
                product_code: item.product_code,
                quantity: item.quantity,
                price: item.price,
                amount: item.amount,
                note: item.note,
                type: item.type,
                variant_image: item.variant_image,
                unit: item.unit,
                weight: item.weight,
                weight_unit: item.weight_unit,
                warranty: item.warranty,
                tax_rate: item.tax_rate,
                tax_include: item.tax_include,
                composite: false,
                product: item.product,
                is_composite: false,
                line_amount_after_line_discount: item.line_amount_after_line_discount,
                discount_items: item.discount_items.filter(
                  (single) => single.amount && single.value,
                ),
                discount_rate: item.discount_rate,
                discount_value: item.discount_value,
                discount_amount: item.discount_amount,
                position: item.position,
                gifts: giftResponse.filter((single) => single.position === item.position),
                available: item.available,
              };
            });
          let newDatingShip = initialForm.dating_ship;
          let newShipperCode = initialForm.shipper_code;
          let new_payments = initialForm.payments;
          if (activeSortedFulfillments && activeSortedFulfillments[0]) {
            if (activeSortedFulfillments[0]?.shipment) {
              newDatingShip = activeSortedFulfillments[0]?.shipment?.expected_received_date
                ? moment(activeSortedFulfillments[0]?.shipment?.expected_received_date)
                : undefined;
              newShipperCode = activeSortedFulfillments[0]?.shipment?.shipper_code;
            }
            if (activeSortedFulfillments[0].shipment?.cod) {
              // setPaymentMethod(PaymentMethodOption.COD);
            } else if (response.payments && response.payments?.length > 0) {
              setPaymentMethod(PaymentMethodOption.PRE_PAYMENT);
              new_payments = response.payments;
              setPayments(new_payments);
            }
          }

          setItems(responseItems);
          setOrderProductsAmount(response.total_line_amount_after_line_discount);
          form.setFieldsValue({
            ...initialForm,
            customer_note: response.customer_note,
            source_id: response.source_id,
            account_code: response.account_code,
            assignee_code: response.assignee_code,
            store_id: response.store_id,
            items: responseItems,
            dating_ship: newDatingShip,
            shipper_code: newShipperCode,
            shipping_fee_informed_to_customer: response.shipping_fee_informed_to_customer,
            payments: new_payments,
            reference_code: response.reference_code,
            url: response.url,
            note: response.note,
            tags: response.tags,
            marketer_code: response.marketer_code ? response.marketer_code : null,
            coordinator_code: response.coordinator_code ? response.coordinator_code : null,
            sub_status_code: response.sub_status_code,
            // automatic_discount: response.automatic_discount,
            automatic_discount: false, // sửa đơn hàng ko mặc định bật chiết khấu tự động
            uniform:response.uniform,
          });
          setShippingFeeInformedToCustomer(response.shipping_fee_informed_to_customer);

          if (!canCreateShipment(response.fulfillments)) {
            setShipmentMethod(0);
          }
          if (response.store_id) {
            setStoreId(response.store_id);
          }
          if (response.tags) {
            setTag(response.tags);
          }
          if (response?.discounts && response?.discounts[0]) {
            setPromotion(response?.discounts[0]);
            if (response.discounts[0].discount_code) {
              setCoupon(response.discounts[0].discount_code);
            }
          }
          setIsLoadForm(true);
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
              order_id: response.id,
            });
          }
          if (response?.payments) {
            setPayments(response.payments);
          }
        }
      }),
    );
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

      let point = !pointFocus ? 0 : pointFocus.point === undefined ? 0 : pointFocus.point;

      let totalAmountPayable =
        orderProductsAmount +
        (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
        (promotion?.value || 0); //tổng tiền phải trả
      let limitAmountPointFocus = !rank
        ? 0
        : !rank.limit_order_percent
        ? totalAmountPayable
        : (rank.limit_order_percent * totalAmountPayable) / 100;
      //limitAmountPointFocus= Math.floor(limitAmountPointFocus/1000);//số điểm tiêu tối đa cho phép
      limitAmountPointFocus = Math.round(limitAmountPointFocus / 1000); //số điểm tiêu tối đa cho phép

      if (!loyaltyPoint || limitAmountPointFocus === 0) {
        showError("Khách hàng đang không được áp dụng chương trình tiêu điểm");
        return false;
      }
      if (rank?.block_order_have_discount === true && (discount > 0 || promotion)) {
        showError("Khách hàng không được áp dụng tiêu điểm cho đơn hàng có chiết khấu");
        return false;
      }

      if (point > limitAmountPointFocus) {
        showError(`Số điểm tiêu tối đa là ${formatCurrency(limitAmountPointFocus)}`);
        return false;
      }

      return true;
    },
    [
      payments,
      loyaltyUsageRules,
      orderProductsAmount,
      shippingFeeInformedToCustomer,
      promotion,
      loyaltyPoint,
    ],
  );

  const checkInventory = () => {
    let status = true;
    if (inventoryResponse && inventoryResponse.length && items && items != null) {
      let productItem = null;
      let newData: Array<InventoryResponse> = [];
      newData = inventoryResponse.filter((store) => store.store_id === storeId);
      newData.forEach(function (value) {
        productItem = items.find((x: any) => x.variant_id === value.variant_id);
        if (
          ((value.available ? value.available : 0) <= 0 ||
            (productItem ? productItem?.quantity : 0) > (value.available ? value.available : 0)) &&
          orderConfig?.sellable_inventory !== true
        ) {
          status = false;
          //showError(`${value.name} không còn đủ số lượng tồn trong kho`);
        }
      });
      if (!status) showError(`Không thể bán sản phẩm đã hết hàng trong kho`);
    }

    return status;
  };

  const checkIfShowCreatePayment = () => {
    return (
      checkIfOrderHasNoPayment(OrderDetail) &&
      (!checkIfOrderHasShipmentCod(OrderDetail) || checkIfOrderCancelled(OrderDetail))
    );
  };

  // const handleOrderBillRequest = (values:OrderBillRequestFormModel,  orderBillId: number | null) => {
  // 	if(OrderDetail?.id) {
  //     let request: OrderBillRequestModel = {
  //       ...values,
  //       order_id: OrderDetail?.id,
  //     }
  //     dispatch(showLoading());
  //     if(orderBillId) {
  //       updateOrderBillService(orderBillId, request).then(response => {
  //         console.log('response', response)
  //         if (isFetchApiSuccessful(response)) {
  //           showSuccess("Cập nhật yêu cầu xuất hóa đơn thành công!")
  //         } else {
  //           handleFetchApiError(response, "Cập nhật yêu cầu xuất hóa đơn", dispatch);
  //         }
  //       }).finally(() => {
  //         dispatch(hideLoading())
  //       })

  //     } else {
  //       createOrderBillService(request).then(response => {
  //         console.log('response', response)
  //         if (isFetchApiSuccessful(response)) {
  //           showSuccess("Tạo yêu cầu xuất hóa đơn thành công!")
  //         } else {
  //           handleFetchApiError(response, "Tạo yêu cầu xuất hóa đơn", dispatch);
  //         }
  //       }).finally(() => {
  //         dispatch(hideLoading())
  //       })
  //     }
  //   }
  // };
  const eventKeyBoardFunction = useCallback((event: KeyboardEvent) => {
    if (event.key === "F9" || event.key === "F4") {
      event.preventDefault();
      event.stopPropagation();
    }

    switch (event.key) {
      case "F9":
        const btnSaveOrderUpdateElement = document.getElementById("btn-save-order-update");
        btnSaveOrderUpdateElement?.click();
        break;
      case "F4":
        const btnSaveOrderCancelElement = document.getElementById("btn-order-cancel");
        btnSaveOrderCancelElement?.click();
        break;
      default:
        break;
    }
  }, []);

  //xử lý shipment khi có momo
  useHandleMomoCreateShipment(setShipmentMethod, totalPaymentsIncludePaymentUpdate);

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
      getStoreBankAccountNumbersService({
        store_ids: [storeId],
      })
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            dispatch(getStoreBankAccountNumbersAction(response.data.items));
            const selected = response.data.items.find((single) => single.default && single.status);
            if (isShouldSetDefaultStoreBankAccount && checkIfShowCreatePayment()) {
              if (selected) {
                dispatch(changeSelectedStoreBankAccountAction(selected.account_number));
              } else {
                let paymentsResult = [...payments];
                let bankPaymentIndex = paymentsResult.findIndex(
                  (payment) => payment.payment_method_code === PaymentMethodCode.BANK_TRANSFER,
                );
                // sàn tài trợ cũng đang lấy PaymentMethodCode.BANK_TRANSFER, nên phải check name
                if (
                  bankPaymentIndex > -1 &&
                  paymentsResult[bankPaymentIndex].payment_method !== "Sàn Tài trợ"
                ) {
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
  }, [dispatch, isShouldSetDefaultStoreBankAccount, storeId]);

  useEffect(() => {
    formRef.current?.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchOrderDetailData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch, userReducer.account?.code, isSplit, reload]);

  useEffect(() => {
    if (customer) {
      dispatch(
        getLoyaltyPoint(customer.id, (data) => {
          setLoyaltyPoint(data);
          setCountFinishingUpdateCustomer((prev) => prev + 1);
        }),
      );
      const shippingAddressItem = customer.shipping_addresses.find((p: any) => p.default === true);
      if (isFirstLoad.current) {
        if (
          OrderDetail?.shipping_address &&
          OrderDetail?.shipping_address.city_id &&
          OrderDetail?.shipping_address.district_id &&
          OrderDetail?.shipping_address.ward_id &&
          OrderDetail?.shipping_address.full_address &&
          shippingAddressItem
        ) {
          // nếu order có địa chỉ giao hàng đúng thì gán vào form hiển thị thành địa chỉ khách hàng
          setShippingAddress({
            ...shippingAddressItem,
            ...OrderDetail?.shipping_address,
            id: shippingAddressItem.id,
          });
          // nếu những địa chỉ khách hàng đã có không có địa chỉ của đơn hàng
          const shippingAddressCustomerSameShippingAddressOrder = customer.shipping_addresses.find(
            (p: any) =>
              p.name === OrderDetail?.shipping_address?.name &&
              p.phone === OrderDetail?.shipping_address?.phone &&
              // p.country_id === OrderDetail?.shipping_address?.country_id &&
              p.city_id === OrderDetail?.shipping_address?.city_id &&
              p.district_id === OrderDetail?.shipping_address?.district_id &&
              p.ward_id === OrderDetail?.shipping_address?.ward_id &&
              p.full_address === OrderDetail?.shipping_address?.full_address,
          );
          if (!shippingAddressCustomerSameShippingAddressOrder) {
            setCustomerChange(true);
            showWarning("Địa chỉ giao hàng của đơn hàng và khách hàng chưa đồng bộ!!!");
          }
        } else {
          if (shippingAddressItem) setShippingAddress(shippingAddressItem);
        }
        isFirstLoad.current = false;
      }
    } else {
      setLoyaltyPoint(null);
      setCountFinishingUpdateCustomer((prev) => prev + 1);
      setShippingAddress(null);
    }
  }, [dispatch, customer, OrderDetail?.shipping_address]);

  useEffect(() => {
    if (items && items.length !== 0 && OrderDetail?.store_id) {
      let variant_id: Array<number> = [];
      items.forEach((element) => variant_id.push(element.variant_id));
      // let store_id=OrderDetail?.store_id;
      dispatch(inventoryGetDetailVariantIdsExt(variant_id, null, setInventoryResponse));
    }
  }, [OrderDetail?.store_id, dispatch, items]);

  // const checkIfOrderCanBeSplit = useMemo(() => {
  // 	// có tách đơn, có shipment trong fulfillments, trường hợp giao hàng sau vẫn có fulfillment mà ko có shipment
  // 	if (OrderDetail?.linked_order_code || (OrderDetail?.fulfillments && OrderDetail.fulfillments.find((single) => single.shipment && !(single.status && [FulFillmentStatus.CANCELLED, FulFillmentStatus.RETURNED, FulFillmentStatus.RETURNING].includes(single.status))))) {
  // 		return false;
  // 	}
  // 	if (OrderDetail?.items.length === 1 && OrderDetail.items[0].quantity === 1) {
  // 		return false;
  // 	}
  // 	// đơn nháp không cho tách
  // 	if (OrderDetail?.status === OrderStatus.DRAFT) {
  // 		return false;
  // 	}
  // 	return true;
  // }, [OrderDetail?.fulfillments, OrderDetail?.items, OrderDetail?.linked_order_code, OrderDetail?.status]);

  useEffect(() => {
    if (OrderDetail?.status === OrderStatus.DRAFT) {
      return;
    }
    if (sortedFulfillments && sortedFulfillments[0]) {
      setIsDisableSelectSource(true);
    }
  }, [sortedFulfillments, OrderDetail?.status]);

  useEffect(() => {
    setShippingAddressesSecondPhone(OrderDetail?.shipping_address?.second_phone || "");
  }, [OrderDetail?.shipping_address]);

  useEffect(() => {
    window.addEventListener("keydown", eventKeyBoardFunction);
    return () => {
      window.removeEventListener("keydown", eventKeyBoardFunction);
    };
  }, [eventKeyBoardFunction]);

  useEffect(() => {
    const getCodAmount = () => {
      let cod = 0;
      let sortedActiveFulfillmentsIncludeHideFulfillment =
        sortedFulfillmentsIncludeHideFulfillment.filter(
          (fulfillment) => !checkIfFulfillmentCancelled(fulfillment),
        );
      if (
        sortedActiveFulfillmentsIncludeHideFulfillment[0] &&
        sortedActiveFulfillmentsIncludeHideFulfillment[0]?.shipment &&
        sortedActiveFulfillmentsIncludeHideFulfillment[0].shipment?.cod
      ) {
        cod = sortedActiveFulfillmentsIncludeHideFulfillment[0].shipment?.cod;
      }
      return cod;
    };

    const cod = getCodAmount();
    console.log("totalAmountCustomerNeedToPay - cod ", totalAmountCustomerNeedToPay - cod);
    console.log("totalAmountCustomerNeedToPay ", totalAmountCustomerNeedToPay);
    console.log("cod ", cod);
    if (totalAmountCustomerNeedToPay - cod > 0) {
      setShowPaymentPartialPayment(true);
    } else {
      setShowPaymentPartialPayment(false);
    }
  }, [sortedFulfillmentsIncludeHideFulfillment, totalAmountCustomerNeedToPay]);

  if (checkIfOrderHasNotFinishPaymentMomo(OrderDetail)) {
    return <CannotUpdateOrderWithWalletWarningInformation />;
  }

  return (
    <StyledComponent>
      <ContentContainer
        title="Sửa đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: `${UrlConfig.HOME}`,
          },
          {
            name: "Đơn hàng",
          },
          {
            name: `Sửa đơn hàng ${id}`,
          },
        ]}
        extra={<CreateBillStep orderDetail={OrderDetail} status={stepsStatusValue} />}
      >
        <div className="orders">
          {isLoadForm && (
            <Form
              layout="vertical"
              initialValues={initialForm}
              ref={formRef}
              form={form}
              onFinishFailed={({ errorFields }: any) => {
                const element: any = document.getElementById(errorFields[0].name.join(""));
                element?.focus();
                const y = element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
                window.scrollTo({ top: y, behavior: "smooth" });
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
                    ShippingAddressChange={(address) => {
                      setShippingAddress(address);
                    }}
                    billingAddress={billingAddress}
                    setBillingAddress={onChangeBillingAddress}
                    levelOrder={levelOrder}
                    updateOrder={true}
                    isVisibleCustomer={isVisibleCustomer}
                    setVisibleCustomer={setVisibleCustomer}
                    shippingAddress={shippingAddress}
                    modalAction={modalAction}
                    setModalAction={setModalAction}
                    setOrderSourceId={setOrderSourceId}
                    isDisableSelectSource={isDisableSelectSource}
                    OrderDetail={OrderDetail}
                    shippingAddressesSecondPhone={shippingAddressesSecondPhone}
                    setShippingAddressesSecondPhone={setShippingAddressesSecondPhone}
                    form={form}
                    setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                    customerChange={customerChange}
                    setCustomerChange={setCustomerChange}
                    isOrderUpdate
                    // handleOrderBillRequest = {handleOrderBillRequest}
                    // initOrderBillRequest={undefined}
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
                    inventoryResponse={inventoryResponse}
                    customer={customer}
                    setInventoryResponse={setInventoryResponse}
                    totalAmountCustomerNeedToPay={totalOrderAmount}
                    orderSourceId={orderSourceId}
                    levelOrder={levelOrder}
                    coupon={coupon}
                    setCoupon={setCoupon}
                    promotion={promotion}
                    setPromotion={setPromotion}
                    orderDetail={OrderDetail}
                    orderConfig={orderConfig}
                    loyaltyPoint={loyaltyPoint}
                    setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                    countFinishingUpdateCustomer={countFinishingUpdateCustomer}
                    shipmentMethod={shipmentMethod}
                    stores={stores}
                    isPageOrderUpdate
                  />
                  <CardShowOrderPayments
                    OrderDetail={OrderDetail}
                    setOrderDetail={setOrderDetail}
                    // disabledActions={disabledActions}
                    disabledActions={() => {}}
                    // disabledBottomActions={disabledBottomActions}
                    disabledBottomActions={false}
                    form={form}
                    isDisablePostPayment={isDisablePostPayment}
                    isShowPaymentPartialPayment={isShowPaymentPartialPayment}
                    // isShowPaymentPartialPayment={false}
                    // isVisibleUpdatePayment={isVisibleUpdatePayment}
                    isVisibleUpdatePayment={false}
                    // onPaymentSelect={onPaymentSelect}
                    onPaymentSelect={() => {}}
                    paymentMethod={paymentMethod}
                    paymentMethods={paymentMethods}
                    setReload={setReload}
                    setShowPaymentPartialPayment={setShowPaymentPartialPayment}
                    // setShowPaymentPartialPayment={()=>{}}
                    // setVisibleUpdatePayment={setVisibleUpdatePayment}
                    setVisibleUpdatePayment={() => {}}
                    shipmentMethod={shipmentMethod}
                    stepsStatusValue={stepsStatusValue}
                    totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                    payments={payments}
                    setExtraPayments={setExtraPayments}
                    orderPageType={OrderPageTypeModel.orderUpdate}
                  />
                  <Card
                    className="orders-update-shipment 66"
                    title={
                      <Space>
                        <div className="d-flex">
                          <span className="title-card">ĐÓNG GÓI VÀ GIAO HÀNG</span>
                        </div>
                        {activeSortedFulfillments.length > 0 &&
                          activeSortedFulfillments[0].status === FulFillmentStatus.SHIPPED && (
                            <Tag className="orders-tag text-menu successTag">Giao thành công</Tag>
                          )}
                      </Space>
                    }
                    extra={
                      <Space size={26}>
                        {activeSortedFulfillments.length > 0 && (
                          // OrderDetail?.fulfillments[0].shipment?.expected_received_date &&
                          <div className="text-menu expectReceivedDate 33">
                            {activeSortedFulfillments[0]?.shipment?.expected_received_date && (
                              <React.Fragment>
                                <img src={calendarOutlined} alt=""></img>
                                <span>
                                  {activeSortedFulfillments[0]?.shipment?.expected_received_date
                                    ? moment(
                                        activeSortedFulfillments[0]?.shipment
                                          ?.expected_received_date,
                                      ).format(dateFormat)
                                    : ""}
                                </span>
                              </React.Fragment>
                            )}
                            {activeSortedFulfillments[0]?.shipment?.office_time && (
                              <span className="officeTime">(Giờ hành chính)</span>
                            )}
                          </div>
                        )}
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
                            disabled={
                              levelOrder > 3 ||
                              shipmentMethod === ShipmentMethodOption.PICK_AT_STORE
                            }
                          />
                        </Form.Item>
                      </Space>
                    }
                  >
                    {activeSortedFulfillments.length > 0 &&
                      activeSortedFulfillments.map(
                        (fulfillment) =>
                          fulfillment.shipment && (
                            <div className="activeFulfillment" key={fulfillment.id}>
                              <Collapse
                                className={`saleorder_shipment_order_colapse payment_success ${
                                  checkIfFulfillmentCancelled(fulfillment)
                                    ? "cancelledFulfillment"
                                    : ""
                                }`}
                                defaultActiveKey={[
                                  checkIfFulfillmentCancelled(fulfillment) ? "0" : "1",
                                ]}
                                onChange={(e) => {}}
                                expandIcon={({ isActive }) => (
                                  <div className="saleorder-header-arrow">
                                    <img
                                      alt=""
                                      src={doubleArrow}
                                      style={{
                                        transform: `${
                                          !isActive ? "rotate(270deg)" : "rotate(0deg)"
                                        }`,
                                      }}
                                    />
                                  </div>
                                )}
                                ghost
                              >
                                <Collapse.Panel
                                  className={
                                    checkIfFulfillmentCancelled(fulfillment)
                                      ? "orders-timeline-custom order-shipment-dot-cancelled"
                                      : fulfillment.status === FulFillmentStatus.SHIPPED
                                      ? "orders-timeline-custom order-shipment-dot-active"
                                      : "orders-timeline-custom order-shipment-dot-default"
                                  }
                                  showArrow={true}
                                  header={
                                    <OrderFulfillmentHeader
                                      fulfillment={fulfillment}
                                      orderDetail={OrderDetail}
                                    />
                                  }
                                  key="1"
                                >
                                  <OrderFulfillmentDetail
                                    deliveryServices={deliveryServices}
                                    fulfillment={fulfillment}
                                    requirementNameView={requirementNameView}
                                    orderDetail={OrderDetail}
                                    orderPageType={OrderPageTypeModel.orderUpdate}
                                  />
                                  <OrderFulfillmentShowProduct orderDetail={OrderDetail} />
                                  <OrderFulfillmentShowFulfillment fulfillment={fulfillment} />
                                  <OrderFulfillmentCancelledShowDate fulfillment={fulfillment} />
                                </Collapse.Panel>
                              </Collapse>
                            </div>
                          ),
                      )}
                    {canCreateShipment(sortedFulfillments) && (
                      <OrderCreateShipment
                        shipmentMethod={shipmentMethod}
                        orderProductsAmount={orderProductsAmount}
                        storeDetail={storeDetail}
                        customer={customer}
                        items={items}
                        isCancelValidateDelivery={false}
                        totalAmountCustomerNeedToPay={
                          totalAmountCustomerNeedToPayIncludePaymentUpdate
                        }
                        setShippingFeeInformedToCustomer={ChangeShippingFeeCustomer}
                        shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
                        onSelectShipment={onSelectShipment}
                        thirdPL={thirdPL}
                        setThirdPL={setThirdPL}
                        form={form}
                        shippingServiceConfig={shippingServiceConfig}
                        orderConfig={orderConfig}
                        OrderDetail={OrderDetail}
                        isEcommerceOrder={isEcommerceOrder}
                        ecommerceShipment={ecommerceShipment}
                        payments={totalPaymentsIncludePaymentUpdate}
                        orderPageType={OrderPageTypeModel.orderUpdate}
                      />
                    )}
                  </Card>
                </Col>
                <Col md={6}>
                  <CreateOrderSidebar
                    tags={tags}
                    onChangeTag={onChangeTag}
                    customerId={customer?.id}
                    form={form}
                    storeId={storeId}
                    orderDetail={OrderDetail}
                    updateOrder
                    setReload={setReload}
                  />
                </Col>
              </Row>
              <OrderDetailBottomBar
                isVisibleUpdateButtons={true}
                stepsStatusValue={stepsStatusValue}
                formRef={formRef}
                handleTypeButton={handleTypeButton}
                orderDetail={OrderDetail}
                isVisibleGroupButtons={false}
                updateCancelClick={updateCancelClick}
                showSaveAndConfirmModal={() => {}}
                updating={updating}
                updatingConfirm={updatingConfirm}
                deleteOrderClick={handleDeleteOrderClick}
              />
            </Form>
          )}
        </div>
      </ContentContainer>
    </StyledComponent>
  );
}
