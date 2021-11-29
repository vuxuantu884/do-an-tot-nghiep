import { Card, Col, Form, FormInstance, Input, Row } from "antd";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import CreateOrderSidebar from "component/order/CreateOrder/CreateOrderSidebar";
import OrderCreatePayments from "component/order/OrderCreatePayments";
import OrderCreateProduct from "component/order/OrderCreateProduct";
import OrderCreateShipment from "component/order/OrderCreateShipment";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { inventoryGetDetailVariantIdsExt } from "domain/actions/inventory/inventory.action";
import {
  getLoyaltyPoint,
  getLoyaltyRate,
  getLoyaltyUsage
} from "domain/actions/loyalty/loyalty.action";
import {
  configOrderSaga,
  DeliveryServicesGetList,
  orderCreateAction,
  OrderDetailAction,
  PaymentMethodGetList
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";
import { modalActionType } from "model/modal/modal.model";
import { thirdPLModel } from "model/order/shipment.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  BillingAddress,
  FulFillmentRequest,
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ShipmentRequest,
  ShippingAddress
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  DeliveryServiceResponse, OrderConfig,
  OrderResponse,
  StoreCustomResponse
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  getAmountPaymentRequest,
  getTotalAmountAfferDiscount,
  scrollAndFocusToDomElement
} from "utils/AppUtils";
import {
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  ShipmentMethod,
  ShipmentMethodOption,
  TaxTreatment
} from "utils/Constants";
import { DEFAULT_CHANNEL_ID } from "utils/Order.constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardCustomer from "./component/order-detail/CardCustomer";
import SaveAndConfirmOrder from "./modal/save-confirm.modal";

let typeButton = "";

export default function Order() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isSaveDraft, setIsSaveDraft] = useState(false);
  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [itemGifts, setItemGifts] = useState<Array<OrderLineItemRequest>>([]);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [orderSourceId, setOrderSourceId] = useState<number | null>(null);
  const [shipmentMethod, setShipmentMethod] = useState<number>(
    ShipmentMethodOption.DELIVER_LATER
  );
  const [paymentMethod, setPaymentMethod] = useState<number>(
    PaymentMethodOption.POSTPAYMENT
  );
  const [deliveryServices, setDeliveryServices] = useState<DeliveryServiceResponse[]>([]);
  console.log('deliveryServices', deliveryServices)

  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);
  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();

  const [thirdPL, setThirdPL] = useState<thirdPLModel>({
    delivery_service_provider_code: "",
    delivery_service_provider_id: null,
    insurance_fee: null,
    delivery_service_provider_name: "",
    delivery_transport_type: "",
    service: "",
    shipping_fee_paid_to_three_pls: null,
  });
  console.log("items333", items);
  const [creating, setCreating] = useState(false);
  const [shippingFeeInformedToCustomer, setShippingFeeInformedToCustomer] = useState<
    number | null
  >(0);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [tags, setTags] = useState<string>("");
  const formRef = createRef<FormInstance>();
  const [form] = Form.useForm();
  const [isVisibleSaveAndConfirm, setIsVisibleSaveAndConfirm] = useState<boolean>(false);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  // const [listOrderConfigs, setListOrderConfigs] =
  //   useState<OrderConfigResponseModel | null>(null);

  const [listPaymentMethod, setListPaymentMethod] = useState<
    Array<PaymentMethodResponse>
  >([]);

  // const [shippingServiceConfig, setShippingServiceConfig] = useState<
  //   ShippingServiceConfigDetailResponseModel[]
  // >([]);

  const [inventoryResponse, setInventoryResponse] =
    useState<Array<InventoryResponse> | null>(null);
  const [configOrder, setConfigOrder] = useState<OrderConfig | null>(null);

  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [modalAction, setModalAction] = useState<modalActionType>("edit");

  const queryParams = useQuery();
  const actionParam = queryParams.get("action") || null;
  const cloneIdParam = queryParams.get("cloneId") || null;
  const typeParam = queryParams.get("type") || null;
  const handleCustomer = (_objCustomer: CustomerResponse | null) => {
    setCustomer(_objCustomer);
  };
  const onChangeShippingAddress = (_objShippingAddress: ShippingAddress | null) => {
    setShippingAddress(_objShippingAddress);
  };

  const onChangeBillingAddress = (_objBillingAddress: BillingAddress | null) => {
    setBillingAddress(_objBillingAddress);
  };

  const ChangeShippingFeeCustomer = (value: number | null) => {
    form.setFieldsValue({shipping_fee_informed_to_customer: value});
    setShippingFeeInformedToCustomer(value);
  };

  const [coupon, setCoupon] = useState<string>("");
  const [promotionId, setPromotionId] = useState<number|null>(null);

  const onChangeInfoProduct = (
    _items: Array<OrderLineItemRequest>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => {
    setItems(_items);
    setDiscountRate(discount_rate);
    setDiscountValue(discount_value);
    setOrderAmount(amount);
  };

  const handlePaymentMethod = (value: number) => {
    setPaymentMethod(value);
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

  const [isLoadForm, setIsLoadForm] = useState(false);

  let initialRequest: OrderRequest = {
    action: "", //finalized
    store_id: null,
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
    currency: "VNĐ",
    items: [],
    discounts: [],
    fulfillments: [],
    shipping_address: null,
    billing_address: null,
    payments: [],
    channel_id: null,
  };
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
    [setTags]
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
      total: orderAmount,
      total_tax: null,
      total_discount: null,
      total_quantity: null,
      discount_rate: discountRate,
      discount_value: discountValue,
      discount_amount: null,
      total_line_amount_after_line_discount: null,
      shipment: shipmentRequest,
      items: items,
    };

    let listFulfillmentRequest = [];
    if (
      paymentMethod !== PaymentMethodOption.POSTPAYMENT ||
      shipmentMethod === ShipmentMethodOption.SELF_DELIVER ||
      shipmentMethod === ShipmentMethodOption.PICK_AT_STORE
    ) {
      listFulfillmentRequest.push(request);
    }

    if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE) {
      request.delivery_type = "pick_at_store";
    }

    if (
      paymentMethod === PaymentMethodOption.POSTPAYMENT &&
      shipmentMethod === ShipmentMethodOption.DELIVER_LATER &&
      typeButton === OrderStatus.FINALIZED
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
          shipping_fee_informed_to_customer: shippingFeeInformedToCustomer,
          service: thirdPL.service,
          shipping_fee_paid_to_three_pls: thirdPL.shipping_fee_paid_to_three_pls,
        };

      case ShipmentMethodOption.SELF_DELIVER:
        return {
          ...objShipment,
          delivery_service_provider_type: "Shipper",
          shipper_code: value.shipper_code,
          shipping_fee_informed_to_customer: shippingFeeInformedToCustomer,
          shipping_fee_paid_to_three_pls: value.shipping_fee_paid_to_three_pls,
          cod:
            orderAmount +
            (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
            getAmountPaymentRequest(payments) -
            discountValue,
        };

      case ShipmentMethodOption.PICK_AT_STORE:
        objShipment.delivery_service_provider_type = "pick_at_store";
        let newCod = orderAmount;
        if (shippingFeeInformedToCustomer !== null) {
          if (
            orderAmount +
              shippingFeeInformedToCustomer -
              getAmountPaymentRequest(payments) >
            0
          ) {
            newCod =
              orderAmount +
              shippingFeeInformedToCustomer -
              getAmountPaymentRequest(payments);
          }
        } else {
          if (orderAmount - getAmountPaymentRequest(payments) > 0) {
            newCod = orderAmount - getAmountPaymentRequest(payments);
          }
        }
        return {
          ...objShipment,
          delivery_service_provider_type: "pick_at_store",
          cod: newCod,
        };

      case ShipmentMethodOption.DELIVER_LATER:
        return null;

      default:
        break;
    }
  };

  const createDiscountRequest = () => {
    let objDiscount: OrderDiscountRequest = {
      rate: discountRate,
      value: discountValue,
      amount: discountValue,
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
          rate: discountRate,
        value: discountValue,
        amount: discountValue,
        promotion_id: null,
        reason: "",
        source: "",
        order_id: null,
      });
    } else if(promotionId) {
      listDiscountRequest.push({
        discount_code: null,
        rate: discountRate,
        value: discountValue,
        amount: discountValue,
        promotion_id: promotionId,
        reason: "",
        source: "",
        order_id: null,
      });
    }  else if (discountRate === 0 && discountValue === 0) {
      return null;
    } else {
      listDiscountRequest.push(objDiscount);
    }
    
    return listDiscountRequest;
  };

  const createOrderCallback = useCallback(
    (value: OrderResponse) => {
      setIsSaveDraft(false);
      setCreating(false);
      if (value.fulfillments && value.fulfillments.length > 0) {
        showSuccess("Đơn được lưu và duyệt thành công!");
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      } else {
        showSuccess("Đơn được lưu nháp thành công!");
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      }
    },
    [history]
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
  const onFinish = (values: OrderRequest) => {
    values.channel_id = DEFAULT_CHANNEL_ID;
    const element2: any = document.getElementById("save-and-confirm");
    element2.disable = true;
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount = getTotalAmountAfferDiscount(items);

    //Nếu là lưu nháp Fulfillment = [], payment = []
    if (typeButton === OrderStatus.DRAFT) {
      values.fulfillments = [];
      // thêm payment vào đơn nháp
      // values.payments = [];
      values.payments = payments.filter((payment) => payment.amount > 0);

      values.shipping_fee_informed_to_customer = 0;
      values.action = OrderStatus.DRAFT;
      values.total = orderAmount;
      values.shipping_fee_informed_to_customer = 0;
    } else {
      //Nếu là đơn lưu và xác nhận
      values.shipping_fee_informed_to_customer = shippingFeeInformedToCustomer;
      values.fulfillments = lstFulFillment;
      values.action = OrderStatus.FINALIZED;
      values.payments = payments.filter((payment) => payment.amount > 0);
      values.total = orderAmount;
      if (
        values?.fulfillments &&
        values.fulfillments.length > 0 &&
        values.fulfillments[0].shipment
      ) {
        values.fulfillments[0].shipment.cod =
          orderAmount +
          (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
          getAmountPaymentRequest(payments) -
          discountValue;
      }
    }
    values.tags = tags;
    values.items = items.concat(itemGifts);
    values.discounts = lstDiscount;
    values.shipping_address = shippingAddress;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.customer_ward = customer?.ward;
    values.customer_district = customer?.district;
    values.customer_city = customer?.city;
    values.total_line_amount_after_line_discount = total_line_amount_after_line_discount;
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
        if( shipmentMethod !== ShipmentMethodOption.PICK_AT_STORE && !shippingAddress) {
          showError("Vui lòng nhập địa chỉ giao hàng!");
          const element: any = document.getElementById("shippingAddress_update_full_address");
          scrollAndFocusToDomElement(element);
          return;
        }
        if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
          if (typeButton === OrderStatus.DRAFT) {
            setIsSaveDraft(true);
          } else {
            setCreating(true);
          }
          if (
            values.delivery_service_provider_id === null &&
            typeButton !== OrderStatus.DRAFT
          ) {
            showError("Vui lòng chọn đối tác giao hàng");
            setCreating(false);
          } else {
            (async () => {
              try {
                await dispatch(orderCreateAction(values, createOrderCallback, () => {
                  // on error
                  setCreating(false);
                  setIsSaveDraft(false);
                }));
              } catch {
                setCreating(false);
                setIsSaveDraft(false);
              }
            })();
            // dispatch(orderCreateAction(values, createOrderCallback));
          }
        } else {
          if (
            shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER &&
            !thirdPL.service
          ) {
            showError("Vui lòng chọn đơn vị vận chuyển!");
            setCreating(false);
          } else {
            if (typeButton === OrderStatus.DRAFT) {
              setIsSaveDraft(true);
            } else {
              setCreating(true);
            }
            if (checkInventory()) {
              let isPointFocus = checkPointFocus(values);
              if (isPointFocus) {
                (async () => {
                  console.log('values', values);
                  try {
                    await dispatch(orderCreateAction(values, createOrderCallback, () => {
                      // on error
                      setCreating(false);
                      setIsSaveDraft(false);
                    }));
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
  const scroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
    }
  }, [dispatch, storeId]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      })
    );
  }, [dispatch, setDataAccounts]);

  //windows offset
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
        setListPaymentMethod(result);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      if (isCloneOrder && cloneIdParam) {
        dispatch(
          OrderDetailAction(cloneIdParam, async (response) => {
            const {customer_id} = response;

            if (customer_id) {
              dispatch(
                getCustomerDetailAction(customer_id, (responseCustomer) => {
                  setCustomer(responseCustomer);

                  responseCustomer.shipping_addresses.forEach((item) => {
                    if (item.default === true) {
                      setShippingAddress(item);
                    }
                  });
                })
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
                    product_code: item.product_code,
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
                    discount_items: item.discount_items,
                    discount_rate: item.discount_rate,
                    discount_value: item.discount_value,
                    discount_amount: item.discount_amount,
                    position: item.position,
                    gifts: giftResponse,
                    available: item.available,
                  };
                });
              setItems(responseItems);

              setShippingFeeInformedToCustomer(
                response.shipping_fee_informed_to_customer
              );
              if (response.store_id) {
                setStoreId(response.store_id);
              }
              if (response.tags) {
                setTags(response.tags);
              }
              if (response?.discounts && response?.discounts[0]) {
                if (response.discounts[0].value) {
                  setDiscountValue(response.discounts[0].value);
                }
                if (response.discounts[0].rate) {
                  setDiscountRate(response.discounts[0].rate);
                }
              }
              let newDatingShip = initialForm.dating_ship;
              let newShipperCode = initialForm.shipper_code;
              let new_payments = initialForm.payments;

              if (response.fulfillments && response.fulfillments[0]) {
                if (response?.fulfillments[0]?.shipment) {
                  if (response.fulfillments[0]?.shipment?.expected_received_date) {
                    newDatingShip = moment(
                      response.fulfillments[0]?.shipment?.expected_received_date
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
                shipping_fee_informed_to_customer:
                  response.shipping_fee_informed_to_customer,
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
                setPaymentMethod(PaymentMethodOption.PREPAYMENT);
                new_payments = response.payments;
                console.log("new_payments", new_payments);
                setPayments(new_payments);
              }

              setOrderAmount(response.total_line_amount_after_line_discount);

              let newShipmentMethod = ShipmentMethodOption.DELIVER_LATER;
              if (
                response.fulfillments &&
                response.fulfillments[0] &&
                response?.fulfillments[0]?.shipment?.delivery_service_provider_type
              ) {
                switch (
                  response.fulfillments[0].shipment?.delivery_service_provider_type
                ) {
                  case ShipmentMethod.SHIPPER:
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
                      delivery_transport_type:
                        shipmentDeliverPartner.delivery_transport_type,
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
                if (
                  response.fulfillments[0] &&
                  response.fulfillments[0]?.shipment?.office_time
                ) {
                  setOfficeTime(true);
                }
              }
            }
          })
        );
      } else {
        await setInitialForm({
          ...initialRequest,
        });
        setCustomer(null);
        setItems([]);
        setItemGifts([]);
        setPayments([]);
        setOfficeTime(false);
        setStoreId(null);
        setTags("");
        setIsLoadForm(true);
        setShippingFeeInformedToCustomer(0);
        setDiscountRate(0);
        setDiscountValue(0);
        setOfficeTime(false);
        setShipmentMethod(ShipmentMethodOption.DELIVER_LATER);
        form.resetFields();
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneIdParam, dispatch, isCloneOrder]);

  useEffect(() => {
    if (customer) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
      setVisibleCustomer(true);
      let shippingAddressItem = customer.shipping_addresses.find(
        (p: any) => p.default === true
      );
      if (shippingAddressItem) onChangeShippingAddress(shippingAddressItem);
    } else {
      setLoyaltyPoint(null);
    }
  }, [dispatch, customer]);

  useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch]);
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

  const checkPointFocus = useCallback(
    (value: any) => {
      let pointFocus = payments.find((p) => p.code === "point");

      if (!pointFocus) return true;

      let discount = 0;
      value.items.forEach((p: any) => (discount = discount + p.discount_amount));

      let rank = loyaltyUsageRules.find(
        (x) =>
          x.rank_id ===
          (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id)
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
        discountValue; //tổng tiền phải trả

      let usageRate =
        loyaltyRate === null || loyaltyRate === undefined ? 0 : loyaltyRate.usage_rate;

      let enableUsingPoint =
        loyaltyRate === null || loyaltyRate === undefined
          ? false
          : loyaltyRate.enable_using_point;

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
      if (rank?.block_order_have_discount === true && (discount > 0 || discountValue)) {
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
      discountValue,
      orderAmount,
      shippingFeeInformedToCustomer,
      loyaltyRate,
    ]
  );

  const checkInventory = () => {
    let status:boolean = true;

    if (items && items != null) {
      items.forEach(function (value) {
        let available = value.available === null ? 0 : value.available;
        if (available <= 0 && configOrder?.sellable_inventory !== true) {
          status = false;
          //setCreating(false);
        }
      });
      if(!status) showError(`Không thể bán sản phẩm đã hết hàng trong kho`);
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
    if (items && items != null && items?.length > 0) {
      let variant_id: Array<number> = [];
      items.forEach((element) => variant_id.push(element.variant_id));
      dispatch(inventoryGetDetailVariantIdsExt(variant_id, null, setInventoryResponse));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, items?.length]);

  useEffect(() => {
    dispatch(
      configOrderSaga((data: OrderConfig) => {
        setConfigOrder(data);
      })
    );
  }, [dispatch]);

  // khách cần trả
  const getAmountPayment = (items: Array<OrderPaymentRequest> | null) => {
    let value = 0;
    if (items !== null) {
      if (items.length > 0) {
        items.forEach((a) => (value = value + a.paid_amount));
      }
    }
    return value;
  };

  /**
   * tổng số tiền đã trả
   */
  const totalAmountPayment = getAmountPayment(payments);

  /**
   * tổng giá trị đơn hàng = giá đơn hàng + phí ship - giảm giá
   */
  const totalAmountOrder = useMemo(() => {
    return (
      orderAmount +
      (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
      discountValue
    );
  }, [discountValue, orderAmount, shippingFeeInformedToCustomer]);

  console.log('orderAmount', orderAmount)

  /**
   * số tiền khách cần trả: nếu âm thì là số tiền trả lại khách
   */
  const totalAmountCustomerNeedToPay = useMemo(() => {
    return totalAmountOrder - totalAmountPayment;
  }, [totalAmountOrder, totalAmountPayment]);

  return (
    <React.Fragment>
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
                onFinishFailed={({errorFields}: any) => {
                  const element: any = document.getElementById(
                    errorFields[0].name.join("")
                  );
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
                <Row gutter={20} style={{marginBottom: "70px"}}>
                  <Col md={18}>
                    <CardCustomer
                      customer={customer}
                      handleCustomer={handleCustomer}
                      loyaltyPoint={loyaltyPoint}
                      loyaltyUsageRules={loyaltyUsageRules}
                      ShippingAddressChange={onChangeShippingAddress}
                      shippingAddress={shippingAddress}
                      BillingAddressChange={onChangeBillingAddress}
                      isVisibleCustomer={isVisibleCustomer}
                      setVisibleCustomer={setVisibleCustomer}
                      modalAction={modalAction}
                      setModalAction={setModalAction}
                      setOrderSourceId={setOrderSourceId}
                    />
                    <OrderCreateProduct
                      changeInfo={onChangeInfoProduct}
                      setStoreId={(value) => {
                        setStoreId(value);
                        form.setFieldsValue({store_id: value});
                      }}
                      storeId={storeId}
                      shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
                      setItemGift={setItemGifts}
                      form={form}
                      items={items}
                      setItems={setItems}
                      discountRate={discountRate}
                      setDiscountRate={setDiscountRate}
                      discountValue={discountValue}
                      coupon={coupon}
                      setCoupon={setCoupon}
                      setDiscountValue={setDiscountValue}
                      setPromotionId={setPromotionId}
                      inventoryResponse={inventoryResponse}
                      customer={customer}
                      setInventoryResponse={setInventoryResponse}
                      totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                      orderConfig={null}
                      orderSourceId={orderSourceId}
                      configOrder={configOrder}
                    />
                    <Card title="THANH TOÁN">
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

                    <Card title="ĐÓNG GÓI VÀ GIAO HÀNG">
                      <OrderCreateShipment
                        shipmentMethod={shipmentMethod}
                        orderPrice={orderAmount}
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
                      />
                    </Card>
                  </Col>
                  <Col md={6}>
                    <CreateOrderSidebar
                      accounts={accounts}
                      tags={tags}
                      onChangeTag={onChangeTag}
                      customerId={customer?.id}
                    />
                  </Col>
                </Row>
                {isShowBillStep && (
                  <OrderDetailBottomBar
                    formRef={formRef}
                    handleTypeButton={handleTypeButton}
                    isVisibleGroupButtons={true}
                    showSaveAndConfirmModal={showSaveAndConfirmModal}
                    creating={creating}
                    isSaveDraft={isSaveDraft}
                  />
                )}
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
    </React.Fragment>
  );
}
