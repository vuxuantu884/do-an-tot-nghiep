import { Card, Col, Divider, Form, FormInstance, Input, Modal, Row, Table, Tooltip } from "antd";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import { Type } from "config/type.config";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";

import {
  changeShippingServiceConfigAction,
  orderConfigSaga,
  orderCreateAction,
  OrderDetailAction,
  PaymentMethodGetList,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";
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
import {
  OrderLineItemResponse,
  OrderPaymentResponse,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  formatCurrency,
  getAmountPaymentRequest,
  getTotalAmount,
  getTotalAmountAfterDiscount,
  getTotalQuantity,
  isNullOrUndefined,
  scrollAndFocusToDomElement,
  totalAmount,
} from "utils/AppUtils";
import {
  DEFAULT_COMPANY,
  FACEBOOK,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  ShipmentMethod,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";

import OrderDetailBottomBar from "./component/OrderCreateBottomBar";
import CardCustomer from "./component/OrderCreateCustomer";
import SaveAndConfirmOrder from "./modal/save-confirm.modal";
import CreateOrderSidebar from "./component/CreateOrderSidebar";
import OrderCreatePayments from "./component/OrderCreatePayments";
import OrderCreateProduct from "./component/OrderCreateProduct";
import OrderCreateShipment from "./component/OrderCreateShipment";
import { YDpagePermission } from "config/permissions/fpage.permission";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { LoyaltyPoint } from "../../../model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import { inventoryGetDetailVariantIdsExt } from "domain/actions/inventory/inventory.action";
import { YDpageCustomerRequest } from "model/request/customer.request";
import {
  getLoyaltyPoint,
  getLoyaltyRate,
  getLoyaltyUsage,
} from "domain/actions/loyalty/loyalty.action";
import { modalActionType } from "model/modal/modal.model";
import _ from "lodash";
import "./styles.scss";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import useFetchStores from "hook/useFetchStores";
import { dangerColor, yellowColor } from "utils/global-styles/variables";
import NumberFormat from "react-number-format";
import { AppConfig } from "config/app.config";
import { actionListConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { SourceResponse } from "model/response/order/source.response";

let typeButton = "";

type OrdersCreatePermissionProps = {
  customerGroups: Array<any>;
  areaList: Array<any>;
  customer: CustomerResponse | null;
  newCustomerInfo?: YDpageCustomerRequest;
  setCustomer: (items: CustomerResponse | null) => void;
  setShippingAddress: (items: ShippingAddress | null) => void;
  setBillingAddress: (items: BillingAddressRequestModel | null) => void;
  setActiveTabKey: (items: string) => void;
  setVisibleCustomer: (item: boolean) => void;
  setIsClearOrderTab: (item: boolean) => void;
  handleCustomerById: (item: number | null) => void;
  setCustomerPhone: (item: string | null) => void;
  fbCustomerId: string | null;
  fbPageId: string | null;
  defaultSourceId: number | null;
  defaultStoreId: number | null;
  fbAdsId: string;
  campaignId: string;
  userId: string | null;
  levelOrder?: number;
  updateOrder?: boolean;
  isVisibleCustomer: boolean;
  shippingAddress: ShippingAddress | any;
  billingAddress: BillingAddressRequestModel | any;
};

const ordersCreatePermission = [YDpagePermission.orders_create];

export default function Order(props: OrdersCreatePermissionProps) {
  const {
    customerGroups,
    areaList,
    customer,
    newCustomerInfo,
    setCustomer,
    setActiveTabKey,
    // setIsClearOrderTab,
    handleCustomerById,
    fbCustomerId,
    fbPageId,
    userId,
    setShippingAddress,
    setBillingAddress,
    shippingAddress,
    billingAddress,
    isVisibleCustomer,
    setVisibleCustomer,
    defaultStoreId,
    defaultSourceId,
    fbAdsId,
    campaignId,
  } = props;
  const dispatch = useDispatch();

  const [marketerCodeValue, setMarketerCodeValue] = useState<string>("");
  const [isShowTextNote, setIsShowTextNote] = useState<boolean>(false);
  const [orderSource, setOrderSource] = useState<SourceResponse | null>(null);
  const [isSaveDraft, setIsSaveDraft] = useState(false);
  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [itemGifts, setItemGifts] = useState<Array<OrderLineItemRequest>>([]);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [shipmentMethod, setShipmentMethod] = useState<number>(
    ShipmentMethodOption.DELIVER_PARTNER,
  );
  const [paymentMethod, setPaymentMethod] = useState<number>(PaymentMethodOption.COD);
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<Array<LoyaltyUsageResponse>>([]);
  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();

  const [countFinishingUpdateCustomer, setCountFinishingUpdateCustomer] = useState(0);

  const [thirdPL, setThirdPL] = useState<any>({
    delivery_service_provider_code: "",
    delivery_service_provider_id: null,
    insurance_fee: null,
    delivery_service_provider_name: "",
    delivery_transport_type: "",
    service: "",
    shipping_fee_paid_to_three_pls: null,
  });
  const [creating, setCreating] = useState(false);
  const [shippingFeeInformedToCustomer, setShippingFeeInformedToCustomer] = useState<number | null>(
    0,
  );
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [tags, setTags] = useState<string>("");
  const formRef = createRef<FormInstance>();
  const [form] = Form.useForm();
  const [isVisibleSaveAndConfirm, setIsVisibleSaveAndConfirm] = useState<boolean>(false);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  // const [listOrderConfigs, setListOrderConfigs] =
  //   useState<OrderConfigResponseModel | null>(null);

  const [listPaymentMethod, setListPaymentMethod] = useState<Array<PaymentMethodResponse>>([]);

  const [newOrderData, setNewOrderData] = useState<any>();

  // const [shippingServiceConfig, setShippingServiceConfig] = useState<
  //   ShippingServiceConfigDetailResponseModel[]
  // >([]);

  const [inventoryResponse, setInventoryResponse] = useState<Array<InventoryResponse> | null>(null);
  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);

  const [isCheckSplitLine, setCheckSplitLine] = useState(false);

  const [isShowOrderModal, setIsShowOrderModal] = useState(false);

  const [modalAction, setModalAction] = useState<modalActionType>("edit");
  const queryParams = useQuery();
  const actionParam = queryParams.get("action") || null;
  const cloneIdParam = queryParams.get("cloneId") || null;
  const typeParam = queryParams.get("type") || null;

  const ChangeShippingFeeCustomer = (value: number | null) => {
    form.setFieldsValue({ shipping_fee_informed_to_customer: value });
    setShippingFeeInformedToCustomer(value);
  };

  const [coupon, setCoupon] = useState<string>("");
  const [promotion, setPromotion] = useState<OrderDiscountRequest | null>(null);

  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);

  const listStores = useFetchStores();

  const onChangeInfoProduct = (
    _items: Array<OrderLineItemRequest>,
    _promotion?: OrderDiscountRequest | null,
  ) => {
    setItems(_items);
    let amount = totalAmount(_items);
    setOrderAmount(amount);
    if (_promotion !== undefined) {
      setPromotion(_promotion);
    } else {
      setPromotion(null);
    }
  };

  const handlePaymentMethod = (value: number) => {
    setPaymentMethod(value);
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

  const [isLoadForm, setIsLoadForm] = useState(false);

  let initialRequest: OrderRequest = useMemo(() => {
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
      reference_code: `fb_${fbCustomerId}_${fbPageId}_${userId}`,
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
    };
  }, [fbCustomerId, fbPageId, userId, userReducer.account?.code]);

  const [initialForm, setInitialForm] = useState<OrderRequest>({
    ...initialRequest,
  });

  useEffect(() => {
    if (customer?.id) {
      dispatch(
        getLoyaltyPoint(customer.id, (data) => {
          setLoyaltyPoint(data);
          setCountFinishingUpdateCustomer((prev) => prev + 1);
        }),
      );
      /* order screen */
      // setVisibleCustomer(true);
      // if (customer.shipping_addresses) {
      //   let shipping_addresses_index: number = customer.shipping_addresses.findIndex(x => x.default === true);
      //   let item = shipping_addresses_index !== -1 ? customer.shipping_addresses[shipping_addresses_index] : null;
      //   onChangeShippingAddress(item);
      // }
      // else
      //   onChangeShippingAddress(null)
      // if (customer.billing_addresses) {
      //   let billing_addresses_index = customer.billing_addresses.findIndex(x => x.default === true);
      //   onChangeBillingAddress(billing_addresses_index !== -1 ? customer.billing_addresses[billing_addresses_index] : null);
      // }
      // else
      //   onChangeBillingAddress(null)
    } else {
      setLoyaltyPoint(null);
      setCountFinishingUpdateCustomer((prev) => prev + 1);
    }
  }, [customer?.id, dispatch]);

  useEffect(() => {
    if (
      isNullOrUndefined(customer) &&
      newCustomerInfo &&
      (newCustomerInfo.full_name || newCustomerInfo.phone)
    ) {
      setModalAction("create");
      setVisibleCustomer(true);
    } else {
      setModalAction("edit");
      setVisibleCustomer(false);
    }
  }, [customer, newCustomerInfo, setVisibleCustomer]);

  let isCloneOrder = false;
  if (actionParam === "clone" && cloneIdParam) {
    isCloneOrder = true;
  }

  const onChangeTag = useCallback(
    (value: string[]) => {
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
      account_code: userReducer.account?.code,
      assignee_code: value.assignee_code,
      delivery_type: "",
      stock_location_id: null,
      payment_status: "",
      total: totalAmountOrder,
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
      cod: null,
      cancel_reason: "",
      tracking_code: "",
      tracking_url: "",
      received_date: "",
      sender_address_id: null,
      note_to_shipper: "",
      requirements: value.requirements,
      sender_address: null,
      office_time: officeTime,
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
          service: thirdPL.service,
          shipper_code: value.shipper_code,
          shipping_fee_paid_to_three_pls: thirdPL.shipping_fee_paid_to_three_pls,
          cod: totalAmountCustomerNeedToPay,
        };

      case ShipmentMethodOption.PICK_AT_STORE:
        return {
          ...objShipment,
          delivery_service_provider_type: ShipmentMethod.PICK_AT_STORE,
          cod: totalAmountCustomerNeedToPay,
        };

      case ShipmentMethodOption.DELIVER_LATER:
        return null;

      default:
        break;
    }
  };

  const createDiscountRequest = () => {
    if (!promotion || !promotion.amount || !promotion.value) {
      return [];
    } else {
      const _promotion: OrderDiscountRequest = {
        ...promotion,
        type: promotion.sub_type || DiscountValueType.FIXED_AMOUNT,
      };
      return [_promotion];
    }
  };

  const handleRefreshInfoOrderSuccess = () => {
    form.resetFields();
    setItems([]);
    setPayments([]);
    setPaymentMethod(PaymentMethodOption.COD);
    setOrderAmount(0);
    setCheckSplitLine(false);
    setThirdPL({
      delivery_service_provider_code: "",
      delivery_service_provider_id: null,
      insurance_fee: null,
      delivery_service_provider_name: "",
      delivery_transport_type: "",
      service: "",
      shipping_fee_paid_to_three_pls: null,
    });
    setShippingFeeInformedToCustomer(null);
  };

  const createOrderCallback = useCallback(
    (value: OrderResponse) => {
      setNewOrderData(value);
      setIsSaveDraft(false);
      setCreating(false);
      if (value.fulfillments && value.fulfillments.length > 0) {
        showSuccess("Đơn được lưu và duyệt thành công");
        handleCustomerById(customer && customer.id);
        setActiveTabKey("1");
        setIsShowOrderModal(true);
        handleRefreshInfoOrderSuccess();
      } else {
        showSuccess("Đơn được lưu nháp thành công");
        handleCustomerById(customer && customer.id);
        setActiveTabKey("1");
        setIsShowOrderModal(true);
        handleRefreshInfoOrderSuccess();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customer, handleCustomerById, setActiveTabKey],
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

  const reCalculatePaymentReturn = (payments: OrderPaymentRequest[]) => {
    if (totalAmountCustomerNeedToPay < 0) {
      let returnAmount = Math.abs(totalAmountCustomerNeedToPay);
      let _payments = _.cloneDeep(payments);
      let paymentCashIndex = _payments.findIndex(
        (payment) => payment.payment_method_code === PaymentMethodCode.CASH,
      );
      if (paymentCashIndex > -1) {
        _payments[paymentCashIndex].paid_amount = payments[paymentCashIndex].amount;
        _payments[paymentCashIndex].amount = payments[paymentCashIndex].paid_amount - returnAmount;
        _payments[paymentCashIndex].return_amount = returnAmount;
      } else {
        let newPaymentCash: OrderPaymentRequest | undefined;
        newPaymentCash = {
          code: PaymentMethodCode.CASH,
          payment_method_id:
            listPaymentMethod.find((single) => single.code === PaymentMethodCode.CASH)?.id || 0,
          amount: -returnAmount,
          paid_amount: 0,
          return_amount: returnAmount,
          status: "",
          payment_method:
            listPaymentMethod.find((single) => single.code === PaymentMethodCode.CASH)?.name || "",
          reference: "",
          source: "",
          customer_id: 1,
          note: "",
          type: "",
        };
        _payments.push(newPaymentCash);
      }
      return _payments;
    }
    return payments;
  };

  const checkIfNotCustomerAddress = () => {
    return (
      !shippingAddress?.phone ||
      !shippingAddress?.district_id ||
      !shippingAddress?.ward_id ||
      !shippingAddress?.full_address
    );
  };

  const getTagsValue = () => {
    let mergedTags = tags;
    if (fbAdsId) {
      const fbAdsIdTag = mergedTags !== "" ? `,ad_id: ${fbAdsId}` : `ad_id: ${fbAdsId}`;
      mergedTags = mergedTags + fbAdsIdTag;
    }
    if (campaignId) {
      const campaignIdTag =
        mergedTags !== "" ? `,campaign_id: ${campaignId}` : `campaign_id: ${campaignId}`;
      mergedTags = mergedTags + campaignIdTag;
    }
    if (fbPageId) {
      const fbPageIdTag = mergedTags !== "" ? `,page_id: ${fbPageId}` : `page_id: ${fbPageId}`;
      mergedTags = mergedTags + fbPageIdTag;
    }

    return mergedTags;
  };

  const onFinish = (values: OrderRequest) => {
    values.channel_id = FACEBOOK.channel_id;
    values.company_id = DEFAULT_COMPANY.company_id;
    values.reference_code = `fb_${fbCustomerId}_${fbPageId}_${userId}`;
    const element2: any = document.getElementById("save-and-confirm");
    element2.disable = true;
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount = getTotalAmountAfterDiscount(items);

    values.tags = getTagsValue();
    const _item = items.concat(itemGifts);
    values.items = _item.map((p) => {
      let _discountItems = p.discount_items[0];
      if (_discountItems) {
        _discountItems.type = _discountItems.sub_type || DiscountValueType.FIXED_AMOUNT;
      }
      return p;
    });
    values.discounts = lstDiscount;
    values.shipping_address = {
      ...shippingAddress,
      id: null,
    };
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.total_line_amount_after_line_discount = total_line_amount_after_line_discount;
    values.customer_ward = customer?.ward;
    values.customer_district = customer?.district;
    values.customer_city = customer?.city;
    values.shipping_fee_informed_to_customer = shippingFeeInformedToCustomer;

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
      //Nếu là đơn lưu và duyệt
      values.fulfillments = lstFulFillment;
      values.action = OrderStatus.FINALIZED;
      values.payments = payments.filter((payment) => payment.amount !== 0);
      values.total = totalAmountOrder;
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
      if (items.length === 0) {
        showError("Vui lòng chọn ít nhất 1 sản phẩm");
        const element: any = document.getElementById("search_product");
        element?.focus();
      } else {
        if (shipmentMethod !== ShipmentMethodOption.PICK_AT_STORE && checkIfNotCustomerAddress()) {
          showError("Vui lòng cập nhật địa chỉ giao hàng!");
          const element: any = document.getElementById(
            "customer_update_shipping_addresses_full_address",
          );
          scrollAndFocusToDomElement(element);
          return;
        }
        let valuesCalculateReturnAmount = {
          ...values,
          payments: reCalculatePaymentReturn(payments).filter(
            (payment) => payment.amount !== 0 || payment.paid_amount !== 0,
          ),
        };
        if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
          if (checkIfNotCustomerAddress()) {
            form.validateFields();
            showError("Vui lòng nhập đầy đủ thông tin chỉ giao hàng");
            setCreating(false);
            return;
          }
          if (typeButton === OrderStatus.DRAFT) {
            setIsSaveDraft(true);
          } else {
            setCreating(true);
          }
          if (values.delivery_service_provider_id === null && typeButton !== OrderStatus.DRAFT) {
            showError("Vui lòng chọn đối tác giao hàng");
            setCreating(false);
          } else {
            (async () => {
              try {
                await dispatch(
                  orderCreateAction(valuesCalculateReturnAmount, createOrderCallback, () => {
                    // on error
                    setCreating(false);
                    setIsSaveDraft(false);
                  }),
                );
              } catch {
                setCreating(false);
                setIsSaveDraft(false);
              }
            })();
            // dispatch(orderCreateAction(values, createOrderCallback));
          }
        } else {
          if (shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && !thirdPL.service) {
            showError("Vui lòng chọn đơn vị vận chuyển!");
            const element = document.getElementsByClassName("orders-shipment")[0] as HTMLElement;
            scrollAndFocusToDomElement(element);
            setCreating(false);
          } else {
            if (checkIfNotCustomerAddress()) {
              form.validateFields();
              showError("Vui lòng nhập đầy đủ thông tin chỉ giao hàng");
              return;
            }
            if (typeButton === OrderStatus.DRAFT) {
              setIsSaveDraft(true);
            } else {
              setCreating(true);
            }
            if (checkInventory()) {
              let isPointFocus = checkPointFocus(values);
              if (isPointFocus) {
                (async () => {
                  try {
                    await dispatch(
                      orderCreateAction(valuesCalculateReturnAmount, createOrderCallback, () => {
                        // on error
                        setCreating(false);
                        setIsSaveDraft(false);
                      }),
                    );
                  } catch {
                    setCreating(false);
                    setIsSaveDraft(false);
                  }
                })();
              }
              // dispatch(orderCreateAction(values, createOrderCallback));
            }
          }
        }
      }
    }
  };

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    setAccounts(data.items);
  }, []);

  const mergePaymentData = (payments: OrderPaymentResponse[]) => {
    let result: OrderPaymentResponse[] = [];
    payments.forEach((payment) => {
      let existing = result.filter(function (v) {
        return v.payment_method_code === payment.payment_method_code;
      });
      if (existing.length) {
        let existingIndex = result.indexOf(existing[0]);
        if (result[existingIndex].payment_method_code === PaymentMethodCode.POINT) {
          result[existingIndex].point = (result[existingIndex]?.point || 0) + (payment?.point || 0);
        }
        result[existingIndex].paid_amount = result[existingIndex].paid_amount + payment.paid_amount;
        result[existingIndex].amount = result[existingIndex].amount + payment.amount;
        result[existingIndex].return_amount =
          result[existingIndex].return_amount + payment.return_amount;
      } else {
        result.push(payment);
      }
    });
    return result;
  };

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
    }
  }, [dispatch, storeId]);

  useEffect(() => {
    dispatch(searchAccountPublicAction({}, setDataAccounts));
    dispatch(getLoyaltyRate(setLoyaltyRate));
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    // dispatch(
    //   DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
    //     setDeliveryServices(response);
    //   })
    // );
  }, [dispatch, setDataAccounts]);

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        let result = response.filter((single) => single.code !== PaymentMethodCode.CARD);
        setListPaymentMethod(result);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      if (isCloneOrder && cloneIdParam) {
        dispatch(
          OrderDetailAction(cloneIdParam, async (response) => {
            const { customer_id } = response;

            if (customer_id) {
              dispatch(
                getCustomerDetailAction(customer_id, (responseCustomer) => {
                  setCustomer(responseCustomer);

                  responseCustomer.shipping_addresses.forEach((item) => {
                    if (item.default) {
                      setShippingAddress(item);
                    }
                  });
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
                    gifts: giftResponse,
                    available: item.available,
                  };
                });
              setItems(responseItems);

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
                    newDatingShip = moment(
                      response.fulfillments[0]?.shipment?.expected_received_date,
                    );
                  }
                  newShipperCode = response.fulfillments[0]?.shipment?.shipper_code;
                }
              }
              await setInitialForm({
                ...initialForm,
                customer_note: response.customer_note,
                source_id: response.source_id,
                assignee_code: response.assignee_code,
                marketer_code: response.marketer_code,
                coordinator_code: response.coordinator_code,
                store_id: response.store_id,
                items: responseItems,
                dating_ship: newDatingShip,
                shipper_code: newShipperCode,
                shipping_fee_informed_to_customer: response.shipping_fee_informed_to_customer,
                payments: new_payments,
                reference_code:
                  typeParam === "split-order"
                    ? response.code
                      ? response.code
                      : ""
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

              if (response.payments && response.payments?.length > 0) {
                setPaymentMethod(PaymentMethodOption.PRE_PAYMENT);
                // clone có tiền thừa thì xóa
                new_payments = mergePaymentData(
                  response.payments.map((payment) => {
                    if (payment.return_amount) {
                      return {
                        ...payment,
                        amount: payment.paid_amount,
                        return_amount: 0,
                      };
                    }
                    return { ...payment };
                  }),
                );
                setPayments(new_payments);
              }

              setOrderAmount(response.total_line_amount_after_line_discount);

              let newShipmentMethod = ShipmentMethodOption.DELIVER_LATER;
              if (
                response.fulfillments &&
                response.fulfillments[0] &&
                response?.fulfillments[0]?.shipment?.delivery_service_provider_type
              ) {
                switch (response.fulfillments[0].shipment?.delivery_service_provider_type) {
                  case ShipmentMethod.EMPLOYEE:
                  case ShipmentMethod.EXTERNAL_SHIPPER:
                    newShipmentMethod = ShipmentMethodOption.SELF_DELIVER;
                    break;
                  case ShipmentMethod.EXTERNAL_SERVICE:
                    newShipmentMethod = ShipmentMethodOption.DELIVER_PARTNER;
                    const shipmentDeliverPartner = response?.fulfillments[0]?.shipment;
                    setThirdPL({
                      delivery_service_provider_code:
                        shipmentDeliverPartner.delivery_service_provider_code,
                      delivery_service_provider_id:
                        shipmentDeliverPartner.delivery_service_provider_id,
                      insurance_fee: shipmentDeliverPartner.insurance_fee,
                      delivery_service_provider_name:
                        shipmentDeliverPartner.delivery_service_provider_name,
                      delivery_transport_type: shipmentDeliverPartner.delivery_transport_type,
                      service: shipmentDeliverPartner.service,
                      shipping_fee_paid_to_three_pls:
                        shipmentDeliverPartner.shipping_fee_paid_to_three_pls,
                    });
                    break;
                  case ShipmentMethod.PICK_AT_STORE:
                    newShipmentMethod = ShipmentMethodOption.PICK_AT_STORE;
                    break;
                  default:
                    newShipmentMethod = ShipmentMethodOption.DELIVER_LATER;
                    break;
                }
                setShipmentMethod(newShipmentMethod);
                if (response.fulfillments[0] && response.fulfillments[0]?.shipment?.office_time) {
                  setOfficeTime(true);
                }
              }
            }
          }),
        );
      } else {
        await setInitialForm({
          ...initialRequest,
        });
        // setCustomer(null);
        setItems([]);
        setItemGifts([]);
        setPayments([]);
        setOfficeTime(false);
        setStoreId(null);
        setTags("");
        setIsLoadForm(true);
        setShippingFeeInformedToCustomer(0);
        setPromotion(null);
        setOfficeTime(false);
        setShipmentMethod(ShipmentMethodOption.DELIVER_PARTNER);
        form.resetFields();
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneIdParam, dispatch, isCloneOrder, userReducer?.account?.code]);

  // useEffect(() => {
  //   if (customer) {
  //     dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
  //     setVisibleCustomer(true);
  //     let shippingAddressItem = customer.shipping_addresses.find(
  //       (p: any) => p.default === true
  //     );
  //     if (shippingAddressItem) onChangeShippingAddress(shippingAddressItem);
  //   } else {
  //     setLoyaltyPoint(null);
  //   }
  // }, [dispatch, customer]);

  /**
   * orderSettings
   */
  // useEffect(() => {
  //   dispatch(
  //     actionGetOrderConfig((response) => {
  //       setListOrderConfigs(response);
  //     })
  //   );
  // }, [dispatch]);

  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
        dispatch(changeShippingServiceConfigAction(response));
      }),
    );
  }, [dispatch]);

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
        orderAmount +
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

      if (!enableUsingPoint) {
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
      loyaltyPoint,
      loyaltyUsageRules,
      payments,
      promotion,
      orderAmount,
      shippingFeeInformedToCustomer,
      loyaltyRate,
    ],
  );

  const checkInventory = () => {
    let status: boolean = true;

    if (items) {
      items.forEach(function (value) {
        let available = value.available === null ? 0 : value.available;
        if (available <= 0 && orderConfig?.sellable_inventory !== true) {
          status = false;
          //setCreating(false);
        }
      });
      if (!status) showError(`Không thể bán sản phẩm đã hết hàng trong kho!`);
    }

    return status;
  };

  useEffect(() => {
    formRef.current?.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneIdParam, isCloneOrder]);

  // useEffect(() => {
  //   dispatch(
  //     actionListConfigurationShippingServiceAndShippingFee((response) => {
  //       setShippingServiceConfig(response);
  //     })
  //   );
  // }, [dispatch]);

  useEffect(() => {
    if (items && items.length > 0) {
      let variant_id: Array<number> = [];
      items.forEach((element) => variant_id.push(element.variant_id));
      dispatch(inventoryGetDetailVariantIdsExt(variant_id, null, setInventoryResponse));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, items?.length]);

  useEffect(() => {
    dispatch(
      orderConfigSaga((data: OrderConfigResponseModel) => {
        setOrderConfig(data);
      }),
    );
  }, [dispatch]);

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPayment = getAmountPaymentRequest(payments);

  /**
   * tổng giá trị đơn hàng = giá đơn hàng + phí ship - giảm giá
   */
  const totalAmountOrder = useMemo(() => {
    return Math.round(
      orderAmount +
        (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
        (promotion?.value || 0),
    );
  }, [orderAmount, promotion?.value, shippingFeeInformedToCustomer]);

  /**
   * số tiền khách cần trả: nếu âm thì là số tiền trả lại khách
   */
  const totalAmountCustomerNeedToPay = useMemo(() => {
    return Math.round(totalAmountOrder - totalAmountPayment);
  }, [totalAmountOrder, totalAmountPayment]);

  //handle create info order
  const getFulfillmentShippingAddress = (OrderDetail: OrderResponse | null) => {
    let result = "";
    let shippingAddress = OrderDetail?.shipping_address;
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
      result = addressArrResult.join(" - ");
    }
    return result;
  };

  const getNewOrderDetail = () => {
    if (newOrderData) {
      return [
        {
          name: "Mã đơn hàng:",
          value: (
            <Link target="_blank" to={`${UrlConfig.ORDER}/${newOrderData.id}`}>
              {newOrderData.code}
            </Link>
          ),
          key: "code",
        },
        {
          name: "Trạng thái:",
          value: newOrderData.sub_status,
          key: "sub_status",
        },
        {
          name: "Ngày giao hàng:",
          value: ConvertUtcToLocalDate(
            newOrderData.fulfillments &&
              newOrderData.fulfillments[0]?.shipment?.expected_received_date,
            DATE_FORMAT.DDMMYYY,
          ),
          key: "expected_received_date",
        },
        {
          name: "Nhân viên bán hàng:",
          value: (
            <Link target="_blank" to={`${UrlConfig.ACCOUNTS}/${newOrderData.assignee_code}`}>
              {`${newOrderData.assignee_code} - ${newOrderData.assignee}`}
            </Link>
          ),
          key: "assignee_code",
        },
        {
          name: "Nhân viên Marketing:",
          value: (
            <span>
              {newOrderData.marketer_code && newOrderData.marketer
                ? `${newOrderData.marketer_code} - ${newOrderData.marketer}`
                : "_-_"}
            </span>
          ),
          key: "marketer",
        },
        {
          name: "Khách hàng:",
          value: (
            <Link target="_blank" to={`${UrlConfig.CUSTOMER}/${newOrderData.customer_id}`}>
              {`${newOrderData.customer} - ${newOrderData.customer_phone_number}`}
            </Link>
          ),
          key: "customer",
        },
        {
          name: "Địa chỉ:",
          value: getFulfillmentShippingAddress(newOrderData),
          key: "full_address",
        },
      ];
    } else {
      return [];
    }
  };

  const ProductColumn = {
    title: () => <div style={{ textAlign: "center" }}>Sản phẩm</div>,
    render: (data: OrderLineItemResponse) => {
      return (
        <div
          style={{
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div>
            <Link
              target="_blank"
              to={`${UrlConfig.PRODUCT}/${data.product_id}/variants/${data.variant_id}`}
            >
              {data.sku}
            </Link>
          </div>

          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <Tooltip title={data.variant} placement="topLeft">
              <span>{data.variant}</span>
            </Tooltip>
          </div>
        </div>
      );
    },
  };

  const PriceColumn = {
    title: () => <div style={{ color: "#222222", textAlign: "center" }}>Đơn giá</div>,
    width: "76px",
    align: "right",
    render: (item: OrderLineItemResponse) => {
      return (
        <div>
          <Tooltip title="Giá sản phẩm">
            <span>{formatCurrency(item.price)}</span>
          </Tooltip>

          {item?.discount_items && item.discount_items[0]?.value && (
            <Tooltip title="Khuyến mại sản phẩm">
              <div style={{ color: dangerColor, textAlign: "right" }}>
                {"- "}
                {formatCurrency(item.discount_items[0]?.value)}
              </div>
            </Tooltip>
          )}
        </div>
      );
    },
  };

  const QuantityColumn = {
    title: () => <div style={{ textAlign: "center" }}>SL</div>,
    align: "right",
    width: "40px",
    render: (data: OrderLineItemResponse) => {
      return <NumberFormat value={data.quantity} displayType={"text"} thousandSeparator={true} />;
    },
  };

  const TotalPriceColumn = {
    title: () => <div style={{ textAlign: "center" }}>Thành tiền</div>,
    align: "right",
    width: "80px",
    render: (data: OrderLineItemResponse) => {
      const discountItem = (data?.discount_items && data.discount_items[0]?.value) || 0;
      return <div>{formatCurrency((data.price - discountItem) * data.quantity)}</div>;
    },
  };

  const columns = [ProductColumn, PriceColumn, QuantityColumn, TotalPriceColumn];

  const onCloseOrderCreatedModal = () => {
    setIsShowOrderModal(false);
  };

  return (
    <div className="yd-page-order" style={{ marginTop: 30 }}>
      <AuthWrapper acceptPermissions={ordersCreatePermission} passThrough>
        {(allowed: boolean) =>
          allowed ? (
            isLoadForm && (
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
                <Row gutter={20} style={{ marginBottom: "70px" }}>
                  <Col span={24}>
                    <CardCustomer
                      customerGroups={customerGroups}
                      areaList={areaList}
                      customer={customer}
                      newCustomerInfo={newCustomerInfo}
                      setCustomer={setCustomer}
                      loyaltyPoint={loyaltyPoint}
                      loyaltyUsageRules={loyaltyUsageRules}
                      setShippingAddress={setShippingAddress}
                      shippingAddress={shippingAddress}
                      setBillingAddress={setBillingAddress}
                      isVisibleCustomer={isVisibleCustomer}
                      setVisibleCustomer={setVisibleCustomer}
                      modalAction={modalAction}
                      setModalAction={setModalAction}
                      setOrderSource={setOrderSource}
                      defaultSourceId={defaultSourceId}
                      form={form}
                      setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                    />
                    <OrderCreateProduct
                      changeInfo={onChangeInfoProduct}
                      setStoreId={(value) => {
                        setStoreId(value);
                        form.setFieldsValue({ store_id: value });
                      }}
                      storeId={storeId}
                      defaultStoreId={defaultStoreId}
                      shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
                      setShippingFeeInformedToCustomer={setShippingFeeInformedToCustomer}
                      shippingServiceConfig={shippingServiceConfig}
                      setItemGift={setItemGifts}
                      form={form}
                      items={items}
                      setItems={setItems}
                      orderAmount={orderAmount}
                      totalAmountOrder={totalAmountOrder}
                      promotion={promotion}
                      setPromotion={setPromotion}
                      inventoryResponse={inventoryResponse}
                      customer={customer}
                      setInventoryResponse={setInventoryResponse}
                      totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                      orderConfig={orderConfig}
                      orderSource={orderSource}
                      coupon={coupon}
                      setCoupon={setCoupon}
                      loyaltyPoint={null}
                      isCheckSplitLine={isCheckSplitLine}
                      setCheckSplitLine={setCheckSplitLine}
                      countFinishingUpdateCustomer={countFinishingUpdateCustomer}
                      shipmentMethod={shipmentMethod}
                      listStores={listStores}
                    />

                    {/* Không cần thanh toán và vận chuyển */}
                    <Card>
                      <OrderCreatePayments
                        setPaymentMethod={handlePaymentMethod}
                        payments={payments}
                        setPayments={setPayments}
                        paymentMethod={paymentMethod}
                        shipmentMethod={shipmentMethod}
                        totalAmountOrder={totalAmountOrder}
                        loyaltyRate={loyaltyRate}
                        isDisablePostPayment={isDisablePostPayment}
                        listPaymentMethod={listPaymentMethod}
                      />
                    </Card>

                    <Card>
                      <OrderCreateShipment
                        shipmentMethod={shipmentMethod}
                        payments={payments}
                        orderPrice={orderAmount}
                        storeDetail={storeDetail}
                        customer={customer}
                        items={items}
                        isCancelValidateDelivery={false}
                        totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                        setShippingFeeInformedToCustomer={ChangeShippingFeeCustomer}
                        shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
                        onSelectShipment={onSelectShipment}
                        thirdPL={thirdPL}
                        setThirdPL={setThirdPL}
                        form={form}
                        shippingServiceConfig={shippingServiceConfig}
                      />
                    </Card>
                  </Col>
                  <Col span={24}>
                    <CreateOrderSidebar
                      form={form}
                      storeId={storeId}
                      accounts={accounts}
                      tags={tags}
                      onChangeTag={onChangeTag}
                      customerId={customer?.id}
                      orderSource={orderSource}
                      marketerCodeValue={marketerCodeValue}
                      setMarketerCodeValue={setMarketerCodeValue}
                      isShowTextNote={isShowTextNote}
                      setIsShowTextNote={setIsShowTextNote}
                    />
                  </Col>
                </Row>
                <OrderDetailBottomBar
                  formRef={formRef}
                  handleTypeButton={handleTypeButton}
                  isVisibleGroupButtons={true}
                  showSaveAndConfirmModal={showSaveAndConfirmModal}
                  creating={creating}
                  isSaveDraft={isSaveDraft}
                  orderSource={orderSource}
                  setMarketerCodeValue={setMarketerCodeValue}
                  setIsShowTextNote={setIsShowTextNote}
                />
              </Form>
            )
          ) : (
            <NoPermission />
          )
        }
      </AuthWrapper>

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

      <Modal
        title="Đơn hàng đã được tạo thành công"
        visible={isShowOrderModal}
        okText="Thoát"
        onOk={onCloseOrderCreatedModal}
        onCancel={onCloseOrderCreatedModal}
        cancelButtonProps={{ style: { display: "none" } }}
      >
        <Row
          justify="space-between"
          align="middle"
          className="order-info"
          style={{ width: "100%" }}
        >
          {getNewOrderDetail()?.map((order) => (
            <div key={order.key} className="order-info-customer">
              <span className="order-info-customer-title">{order.name}</span>
              <span className={"order-info-customer-content"}>
                {order.value ? order.value : "_-_"}
              </span>
            </div>
          ))}
        </Row>

        <Table
          bordered
          className="create-order-table"
          rowKey={(record) => record.id}
          columns={columns}
          dataSource={newOrderData?.items}
          tableLayout="fixed"
          pagination={false}
        />

        {newOrderData && (
          <div style={{ padding: "12px", alignItems: "center" }}>
            <Row gutter={24}>
              <Col span={14}>Tổng tiền:</Col>
              <Col span={10} style={{ textAlign: "right" }}>
                <span>{formatCurrency(newOrderData.total_line_amount_after_line_discount)}</span>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={14} style={{ paddingLeft: 12 }}>
                Chiết khấu đơn hàng:
              </Col>
              <Col span={10} style={{ textAlign: "right" }}>
                <div style={{ color: "#EF5B5B" }}>
                  <div>
                    <span>- </span>
                    <NumberFormat
                      value={(newOrderData.discounts && newOrderData.discounts[0]?.amount) || 0}
                      className="foo"
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  </div>
                </div>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={14} style={{ paddingLeft: 12 }}>
                Phí ship báo khách:
              </Col>
              <Col span={10} style={{ textAlign: "right" }}>
                <span className="t-result-blue">
                  {newOrderData.shipping_fee_informed_to_customer
                    ? formatCurrency(newOrderData.shipping_fee_informed_to_customer)
                    : "--"}
                </span>
              </Col>
            </Row>

            <Divider style={{ margin: "2px 0" }} />

            <Row gutter={24}>
              <Col span={14}>Khách cần trả:</Col>
              <Col span={10} style={{ color: "#2a2a86", textAlign: "right" }}>
                <span className="t-result-blue">{formatCurrency(newOrderData.total)}</span>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={14}> Đã thanh toán: </Col>
              <Col span={10} style={{ color: "#2a2a86", textAlign: "right" }}>
                <span style={{ color: yellowColor }}>
                  {formatCurrency(getAmountPaymentRequest(newOrderData.payments))}
                </span>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={14}>Còn phải trả:</Col>
              <Col span={10} style={{ textAlign: "right" }}>
                {newOrderData.fulfillments && newOrderData.fulfillments[0]?.shipment?.cod ? (
                  <span style={{ color: dangerColor }}>
                    {formatCurrency(newOrderData.fulfillments[0]?.shipment?.cod)}
                  </span>
                ) : (
                  <span>{"--"}</span>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
