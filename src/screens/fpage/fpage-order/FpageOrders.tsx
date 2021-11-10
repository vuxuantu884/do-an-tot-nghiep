import { Col, Form, FormInstance, Input, Row, Button } from "antd";
import React, {
  createRef,
  useCallback,
  useEffect,
  // useMemo,
  useState,
} from "react";
import CreateBillStep from "component/header/create-bill-step";
import { Type } from "config/type.config";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { inventoryGetDetailVariantIdsSaga } from "domain/actions/inventory/inventory.action";
import { getLoyaltyRate } from "domain/actions/loyalty/loyalty.action";
import {
  configOrderSaga,
  orderFpageCreateAction,
  OrderDetailAction,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { InventoryResponse } from "model/inventory";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  FulFillmentRequest,
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ShipmentRequest,
} from "model/request/order.request";
import { BillingAddress, ShippingAddress } from "model/response/customer/customer.response";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import {
  FulFillmentResponse,
  OrderConfig,
  // OrderLineItemResponse,
  OrderResponse,
  StoreCustomResponse,
} from "model/response/order/order.response";
import moment from "moment";

import { useDispatch, useSelector } from "react-redux";
import {
  // formatCurrency,
  getAmountPaymentRequest,
  getTotalAmountAfferDiscount,
} from "utils/AppUtils";
import {
  MoneyPayThreePls,
  OrderStatus,
  PaymentMethodOption,
  ShipmentMethod,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
// import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardCustomer from "./component/order-detail/CardCustomer";
import CardPayments from "./component/order-detail/CardPayments";
import CardProduct from "./component/order-detail/CardProduct";
import CardShipment from "./component/order-detail/CardShipment";
import OrderDetailSidebar from "./component/order-detail/Sidebar";
import { FpagePermissions } from "config/permissions/fpage.permission";
import useAuthorization from "hook/useAuthorization";
// import SaveAndConfirmOrder from "./modal/save-confirm.modal";



const createOrderPermission = [FpagePermissions.CREATE_ORDER];

let typeButton = "";

export default function FpageOrders(props: any) {
  const {
    customer,
    setCustomer,
    setActiveTabKey,
    setIsClearOrderTab,
    loyaltyPoint,
    loyaltyUsageRules,
    handleCustomerById,
    fbId,
    pageId,
  } = props;

  const dispatch = useDispatch();

  const [allowCreateOrder] = useAuthorization({
    acceptPermissions: createOrderPermission,
    not: false,
  });

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] =
    useState<BillingAddress | null>(null);
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [itemGifts, setItemGifts] = useState<Array<OrderLineItemRequest>>([]);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [shipmentMethod, setShipmentMethod] = useState<number>(
    ShipmentMethodOption.DELIVER_LATER
  );
  const [paymentMethod, setPaymentMethod] = useState<number>(
    PaymentMethodOption.POSTPAYMENT
  );
  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();

  const [hvc, setHvc] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  const [shippingFeeCustomer, setShippingFeeCustomer] = useState<number | null>(null);
  const [shippingFeeCustomerHVC, setShippingFeeCustomerHVC] = useState<number | null>(
    null
  );
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [fulfillments, setFulfillments] = useState<Array<FulFillmentResponse>>([]);
  const [tags, setTag] = useState<string>("");
  const formRef = createRef<FormInstance>();
  // const [isVisibleSaveAndConfirm, setIsVisibleSaveAndConfirm] =
  //   useState<boolean>(false);
  // const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [serviceType, setServiceType] = useState<string>();
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
    chonCuaHangTruocMoiChonSanPham: false,
    cauHinhInNhieuLienHoaDon: 1,
  });
  const [inventoryResponse, setInventoryResponse] =
    useState<Array<InventoryResponse> | null>(null);
  const [configOrder, setConfigOrder] = useState<OrderConfig | null>(null);
  const [loadingCreateButton, setLoadingCreateButton] = useState<boolean>(false);
  const queryParams = useQuery();
  const actionParam = queryParams.get("action") || null;
  const cloneIdParam = queryParams.get("cloneId") || null;
  const ChangeShippingFeeCustomer = (value: number | null) => {
    setShippingFeeCustomer(value);
  };
  const ChangeShippingFeeCustomerHVC = (value: number | null) => {
    setShippingFeeCustomerHVC(value);
  };

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
  const onStoreSelect = (storeId: number) => {
    setStoreId(storeId);
  };

  const handlePaymentMethod = (value: number) => {
    setPaymentMethod(value);
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };
  const onShipmentSelect = (value: number) => {
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
    dating_ship: moment(),
    requirements: null,
    source_id: null,
    note: "",
    tags: "",
    customer_note: "",
    account_code: userReducer.account?.code,
    assignee_code: userReducer?.account?.code || null,
    customer_id: null,
    reference_code: `fb_${fbId}_${pageId}`,
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
      const strTag = value.join(", ");
      setTag(strTag);
    },
    [setTag]
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
          delivery_service_provider_id: hvc,
          delivery_service_provider_type: "external_service",
          sender_address_id: storeId,
          shipping_fee_informed_to_customer: value.shipping_fee_informed_to_customer,
          service: serviceType!,
          shipping_fee_paid_to_three_pls: hvc === 1 ? fee : MoneyPayThreePls.VALUE,
        };

      case ShipmentMethodOption.SELF_DELIVER:
        return {
          ...objShipment,
          delivery_service_provider_type: "Shipper",
          shipper_code: value.shipper_code,
          shipping_fee_informed_to_customer: value.shipping_fee_informed_to_customer,
          shipping_fee_paid_to_three_pls: value.shipping_fee_paid_to_three_pls,
          cod:
            orderAmount +
            (shippingFeeCustomer ? shippingFeeCustomer : 0) -
            getAmountPaymentRequest(payments) -
            discountValue,
        };

      case ShipmentMethodOption.PICK_AT_STORE:
        objShipment.delivery_service_provider_type = "pick_at_store";
        let newCod = orderAmount;
        if (shippingFeeCustomer !== null) {
          if (orderAmount + shippingFeeCustomer - getAmountPaymentRequest(payments) > 0) {
            newCod =
              orderAmount + shippingFeeCustomer - getAmountPaymentRequest(payments);
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
    };
    let listDiscountRequest = [];
    if (discountRate === 0 && discountValue === 0) {
      return null;
    } else {
      listDiscountRequest.push(objDiscount);
    }
    return listDiscountRequest;
  };

  const createOrderCallback = useCallback(
    (value: OrderResponse) => {
      if (value) {
        showSuccess("Đơn được lưu và duyệt thành công");
        setIsClearOrderTab(true);
        setActiveTabKey("1");
        handleCustomerById(customer && customer.id);
      } else {
        showError("Tạo đơn hàng thất bại");
      }
    },
    [setActiveTabKey, setIsClearOrderTab, customer, handleCustomerById]
  );

  const onFinish = (values: OrderRequest) => {
    const element2: any = document.getElementById("save-and-confirm");
    element2.disable = true;
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount =
      getTotalAmountAfferDiscount(items);

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
      //Nếu là đơn lưu và duyệt
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
          (shippingFeeCustomer ? shippingFeeCustomer : 0) -
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
    values.total_line_amount_after_line_discount =
      total_line_amount_after_line_discount;
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
        if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
          if (values.delivery_service_provider_id === null) {
            showError("Vui lòng chọn đối tác giao hàng");
          } else {
            setLoadingCreateButton(true);
            dispatch(
              orderFpageCreateAction(values, createOrderCallback, setLoadingCreateButton)
            );
          }
        } else {
          if (
            shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER &&
            !serviceType
          ) {
            showError("Vui lòng chọn đơn vị vận chuyển");
          } else {
            if (checkInventory()) {
              let bolCheckPointfocus = checkPointfocus(values);
              if (bolCheckPointfocus) {
                setLoadingCreateButton(true);
                dispatch(
                  orderFpageCreateAction(
                    values,
                    createOrderCallback,
                    setLoadingCreateButton
                  )
                );
              }
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

  const handleCardItems = (cardItems: Array<OrderLineItemRequest>) => {
    setItems(cardItems);
  };

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
    }
  }, [dispatch, storeId]);

  useEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  /**
   * orderSettings
   */
  useEffect(() => {
    setOrderSettings({
      chonCuaHangTruocMoiChonSanPham: true,
      cauHinhInNhieuLienHoaDon: 3,
    });
  }, []);

  useEffect(() => {
    const fetchData = () => {
      if (isCloneOrder && cloneIdParam) {
        dispatch(
          OrderDetailAction(cloneIdParam, (response) => {
            const { customer_id } = response;

            if (customer_id) {
              dispatch(
                CustomerDetail(customer_id, (responseCustomer) => {
                  setCustomer(responseCustomer);
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
                    available: item.available
                  };
                });
              let newDatingShip = initialForm.dating_ship;
              let newShipperCode = initialForm.shipper_code;
              let new_payments = initialForm.payments;

              if (response.fulfillments && response.fulfillments[0]) {
                if (response?.fulfillments[0]?.shipment) {
                  newDatingShip = moment(
                    response.fulfillments[0]?.shipment?.expected_received_date
                  );
                  newShipperCode = response.fulfillments[0]?.shipment?.shipper_code;
                }
              }
              if (response.fulfillments && response.fulfillments[0].shipment?.cod) {
                setPaymentMethod(PaymentMethodOption.COD);
              } else if (response.payments && response.payments?.length > 0) {
                setPaymentMethod(PaymentMethodOption.PREPAYMENT);
                new_payments = response.payments;
                setPayments(new_payments);
              }
              setItems(responseItems);
              setOrderAmount(
                response.total - (response.shipping_fee_informed_to_customer || 0)
              );
              setInitialForm({
                ...initialForm,
                customer_note: response.customer_note,
                source_id: response.source_id,
                assignee_code: response.assignee_code,
                store_id: response.store_id,
                items: responseItems,
                dating_ship: newDatingShip,
                shipper_code: newShipperCode,
                shipping_fee_informed_to_customer:
                  response.shipping_fee_informed_to_customer,
                payments: new_payments,
                reference_code: response.reference_code,
                url: response.url,
                note: response.note,
                tags: response.tags,
              });
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
                    break;
                  case ShipmentMethod.PICK_AT_STORE:
                    newShipmentMethod = ShipmentMethodOption.PICK_AT_STORE;
                    break;
                  default:
                    newShipmentMethod = ShipmentMethodOption.DELIVER_LATER;
                    break;
                }
                setShipmentMethod(newShipmentMethod);
                setFulfillments(response.fulfillments);
                setShippingFeeCustomer(response.shipping_fee_informed_to_customer);
                if (response.store_id) {
                  setStoreId(response.store_id);
                }
                if (response.tags) {
                  setTag(response.tags);
                }
                if (response?.discounts && response?.discounts[0]) {
                  if (response.discounts[0].value) {
                    setDiscountValue(response.discounts[0].value);
                  }
                  if (response.discounts[0].rate) {
                    setDiscountRate(response.discounts[0].rate);
                  }
                }
                if (
                  response.fulfillments[0] &&
                  response.fulfillments[0]?.shipment?.office_time
                ) {
                  setOfficeTime(true);
                }
                setIsLoadForm(true);
              }
            }
          })
        );
      } else {
        setCustomer(null);
        setItems([]);
        setItemGifts([]);
        setPayments([]);
        setInitialForm({
          ...initialRequest,
        });
        setOfficeTime(false);
        setStoreId(null);
        setTag("");
        setIsLoadForm(true);
        setShippingFeeCustomer(0);
        setDiscountRate(0);
        setDiscountValue(0);
        setOfficeTime(false);
        setShipmentMethod(ShipmentMethodOption.DELIVER_LATER);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneIdParam, dispatch, isCloneOrder]);

  useEffect(() => {
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch, customer]);

  const checkPointfocus = useCallback(
    (value: any) => {
      let Pointfocus = payments.find((p) => p.code === "point");
      if (!Pointfocus) return true;
      let discount = 0;
      value.items.forEach((p: any) => (discount = discount + p.discount_amount));

      let rank = loyaltyUsageRules.find(
        (x: any) =>
          x.rank_id ===
          (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id)
      );

      // let curenPoint = !loyaltyPoint
      //   ? 0
      //   : loyaltyPoint.point === null
      //   ? 0
      //   : loyaltyPoint.point;
      let point = !Pointfocus ? 0 : Pointfocus.point === undefined ? 0 : Pointfocus.point;

      let totalAmountPayable =
        orderAmount + (shippingFeeCustomer ? shippingFeeCustomer : 0) - discountValue; //tổng tiền phải trả

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
      shippingFeeCustomer,
      loyaltyRate,
    ]
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
            (productItem ? productItem?.quantity : 0) >
            (value.available ? value.available : 0)) &&
          configOrder?.sellable_inventory !== true
        ) {
          status = false;
          showError(`${value.name} không còn đủ số lượng tồn trong kho`);
        }
      });
    }
    return status;
  };

  useEffect(() => {
    formRef.current?.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneIdParam, isCloneOrder]);

  const getInventory = useCallback(
    (value: any) => {
      if (value && value.length > 0) {
        let variant_id: Array<number> = [];
        value.forEach((element: any) => variant_id.push(element.variant_id));
        dispatch(
          inventoryGetDetailVariantIdsSaga(variant_id, null, setInventoryResponse)
        );
      }
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(
      configOrderSaga((data: OrderConfig) => {
        setConfigOrder(data);
      })
    );
  }, [dispatch]);

  const setStoreForm = useCallback(
    (id: number | null) => {
      formRef.current?.setFieldsValue({ store_id: id });
      // setInitialForm({
      //   ...initialForm,
      //   store_id: id
      // });
    },
    [formRef]
  );
  return (
    <div className="fpage-order" style={{ marginTop: 56 }}>
      {isLoadForm && (
        <Form
          layout="vertical"
          initialValues={initialForm}
          ref={formRef}
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
          <Row gutter={20} style={{ marginBottom: "70px" }}>
            <Col span={24}>
              <CardCustomer
                customer={customer}
                setCustomer={setCustomer}
                loyaltyPoint={loyaltyPoint}
                loyaltyUsageRules={loyaltyUsageRules}
                setShippingAddress={setShippingAddress}
                setBillingAddress={setBillingAddress}
                handleCustomerById={handleCustomerById}
                shippingAddress={shippingAddress}
                billingAddress={billingAddress}
              />
              <CardProduct
                getInventory={getInventory}
                changeInfo={onChangeInfoProduct}
                selectStore={onStoreSelect}
                storeId={storeId}
                shippingFeeCustomer={shippingFeeCustomer}
                setItemGift={setItemGifts}
                orderSettings={orderSettings}
                formRef={formRef}
                items={items}
                handleCardItems={handleCardItems}
                isCloneOrder={isCloneOrder}
                discountRateParent={discountRate}
                discountValueParent={discountValue}
                inventoryResponse={inventoryResponse}
                setInventoryResponse={setInventoryResponse}
                setStoreForm={setStoreForm}
              />
              <OrderDetailSidebar
                accounts={accounts}
                tags={tags}
                isCloneOrder={isCloneOrder}
                onChangeTag={onChangeTag}
              />
              <CardShipment
                setShipmentMethodProps={onShipmentSelect}
                shipmentMethod={shipmentMethod}
                storeDetail={storeDetail}
                setShippingFeeInformedCustomer={ChangeShippingFeeCustomer}
                setShippingFeeInformedCustomerHVC={ChangeShippingFeeCustomerHVC}
                amount={orderAmount}
                setPaymentMethod={setPaymentMethod}
                paymentMethod={paymentMethod}
                shippingFeeCustomer={shippingFeeCustomer}
                shippingFeeCustomerHVC={shippingFeeCustomerHVC}
                customerInfo={customer}
                items={items}
                discountValue={discountValue}
                setOfficeTime={setOfficeTime}
                officeTime={officeTime}
                setServiceType={setServiceType}
                setHVC={setHvc}
                setFee={setFee}
                payments={payments}
                onPayments={onPayments}
                fulfillments={fulfillments}
                isCloneOrder={isCloneOrder}
              />
              <CardPayments
                setSelectedPaymentMethod={handlePaymentMethod}
                payments={payments}
                setPayments={onPayments}
                paymentMethod={paymentMethod}
                shipmentMethod={shipmentMethod}
                amount={
                  orderAmount +
                  (shippingFeeCustomer ? shippingFeeCustomer : 0) -
                  discountValue
                }
                isCloneOrder={isCloneOrder}
                loyaltyRate={loyaltyRate}
              />
            </Col>
          </Row>
          <Row className="footer" gutter={24}>
            <Col className="order-step" md={12}>
              <CreateBillStep status="draff" orderDetail={null} />
            </Col>

            {allowCreateOrder &&
              <Col className="customer-bottom-button" md={8}>
                <Button
                  className="order-button-width"
                  onClick={() => window.location.reload()}
                >
                  Hủy
                </Button>

                <Button
                  loading={loadingCreateButton}
                  type="primary"
                  className="order-button-width"
                  id="save-and-confirm"
                  onClick={() => {
                    typeButton = OrderStatus.FINALIZED;
                    formRef.current?.submit();
                  }}
                >
                  Tạo đơn hàng
                </Button>
              </Col>
            }
            
          </Row>
        </Form>
      )}
    </div>
  );
}
