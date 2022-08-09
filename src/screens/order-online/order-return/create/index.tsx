import { Button, Card, Col, Form, FormInstance, Modal, Row } from "antd";
import { RefSelectProps } from "antd/lib/select";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import ModalConfirm from "component/modal/ModalConfirm";
import OrderCreateProduct from "component/order/OrderCreateProduct";
import OrderCreateShipment from "component/order/OrderCreateShipment";
import CreateOrderSidebarOrderExtraInformation from "component/order/Sidebar/CreateOrderSidebarOrderExtraInformation/CreateOrderSidebarOrderExtraInformation";
import CreateOrderSidebarOrderInformation from "component/order/Sidebar/CreateOrderSidebarOrderInformation";
import SidebarOrderDetailExtraInformation from "component/order/Sidebar/SidebarOrderDetailExtraInformation";
import SidebarOrderDetailInformation from "component/order/Sidebar/SidebarOrderDetailInformation";
import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import {
  getListStoresSimpleAction,
  StoreDetailAction,
  StoreDetailCustomAction,
} from "domain/actions/core/store.action";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { inventoryGetDetailVariantIdsExt } from "domain/actions/inventory/inventory.action";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { getLoyaltyPoint, getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import {
  actionCreateOrderExchange,
  actionCreateOrderReturn,
  actionGetOrderReturnReasons,
} from "domain/actions/order/order-return.action";
import {
  changeOrderCustomerAction,
  changeSelectedStoreBankAccountAction,
  changeShippingServiceConfigAction,
  changeStoreDetailAction,
  getStoreBankAccountNumbersAction,
  orderConfigSaga,
  OrderDetailAction,
  PaymentMethodGetList,
  setIsShouldSetDefaultStoreBankAccountAction,
} from "domain/actions/order/order.action";
import { actionListConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import purify from "dompurify";
import useCheckIfCanCreateMoneyRefund from "hook/order/useCheckIfCanCreateMoneyRefund";
import useFetchStores from "hook/useFetchStores";
import useGetStoreIdFromLocalStorage from "hook/useGetStoreIdFromLocalStorage";
import { cloneDeep } from "lodash";
import { StoreResponse } from "model/core/store.model";
import { InventoryResponse } from "model/inventory";
import { RefundModel } from "model/order/return.model";
import { thirdPLModel } from "model/order/shipment.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  BillingAddressRequestModel,
  ExchangeRequest,
  FulFillmentRequest,
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ReturnRequest,
  ShipmentRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  OrderLineItemResponse,
  OrderReasonModel,
  OrderResponse,
  ReturnProductModel,
  ShippingAddress,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import {
  OrderConfigResponseModel,
  ShippingServiceConfigDetailResponseModel,
} from "model/response/settings/order-settings.response";
import React, { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TiWarningOutline } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useReactToPrint } from "react-to-print";
import CustomerCard from "screens/order-online/component/order-detail/CardCustomer";
import useHandleMomoCreateShipment from "screens/order-online/hooks/useHandleMomoCreateShipment";
import {
  getPrintOrderReturnContentService,
  getStoreBankAccountNumbersService,
} from "service/order/order.service";
import {
  checkIfOrderCanBeReturned,
  formatCurrency,
  getAmountPayment,
  getAmountPaymentRequest,
  getListItemsCanReturn,
  getTotalAmountAfterDiscount,
  getTotalOrderDiscount,
  handleDelayActionWhenInsertTextInSearchInput,
  handleFetchApiError,
  isFetchApiSuccessful,
  isOrderFromPOS,
  reCalculateOrderItem,
  replaceFormatString,
  scrollAndFocusToDomElement,
  totalAmount,
} from "utils/AppUtils";
import {
  ADMIN_ORDER,
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
import {
  ORDER_PAYMENT_STATUS,
  PAYMENT_METHOD_ENUM,
  RETURN_MONEY_TYPE,
  RETURN_TYPE_VALUES,
} from "utils/Order.constants";
import { findPaymentMethodByCode } from "utils/OrderUtils";
import { showError } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardReturnMoneyPageCreate from "../components/CardReturnMoney/CardReturnMoneyPageCreate";
import CardReturnMoneyPageCreateReturn from "../components/CardReturnMoney/CardReturnMoneyPageCreate/CardReturnMoneyPageCreateReturn";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";
import CardReturnProductContainer from "../components/containers/CardReturnProductContainer";
import ReturnBottomBar from "../components/ReturnBottomBar";
import OrderReturnReason from "../components/Sidebar/OrderReturnReason";

type PropTypes = {
  id?: string;
};

let typeButton = "";
let isPrint = false;
var barcode = "";

const ScreenReturnCreate = (props: PropTypes) => {
  const isUserCanCreateOrder = useRef(true);
  const printType = {
    return: "order_return",
    returnAndExchange: "order_exchange",
  };
  const isShouldSetDefaultStoreBankAccount = useSelector(
    (state: RootReducerType) => state.orderReducer.orderStore.isShouldSetDefaultStoreBankAccount,
  );
  const [form] = Form.useForm();
  const [customerChange, setCustomerChange] = useState(false);

  const productReturnAutoCompleteRef = createRef<RefSelectProps>();
  const [searchVariantInputValue, setSearchVariantInputValue] = useState("");
  const [isError, setError] = useState(false);
  const [isOrderFinished, setIsOrderFinished] = useState(false);
  const [isExchange, setIsExchange] = useState(false);
  const [isFetchData, setIsFetchData] = useState(false);
  const [itemGifts, setItemGift] = useState<Array<OrderLineItemRequest>>([]);
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] = useState(false);
  const history = useHistory();
  const query = useQuery();
  let queryOrderID = query.get("orderID");
  let queryOrderReturnType = query.get("type"); // trả hàng online hay offline
  const listStores = useFetchStores();
  const [inventoryResponse, setInventoryResponse] = useState<Array<InventoryResponse> | null>(null);

  let orderId = queryOrderID ? parseInt(queryOrderID) : undefined;
  let orderReturnType = queryOrderReturnType ? queryOrderReturnType.toUpperCase() : "";

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const isPaymentAlreadyChanged = useSelector(
    (state: RootReducerType) => state.orderReducer.orderPayment.isAlreadyChanged,
  );

  const [storeId, setStoreId] = useState<number | null>(null);

  // const [listStores, setListStores] = useState<Array<StoreResponse>>([]);

  const [discountRate, setDiscountRate] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [totalAmountReturnProducts, setTotalAmountReturnProducts] = useState(0);
  // console.log("totalAmountReturnProducts", totalAmountReturnProducts);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [tags, setTags] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<BillingAddressRequestModel | null>(null);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);

  const dispatch = useDispatch();

  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [listReturnProducts, setListReturnProducts] = useState<ReturnProductModel[]>([]);
  const [listItemCanBeReturn, setListItemCanBeReturn] = useState<OrderLineItemResponse[]>([]);
  const [listOrderProductsResult, setListOrderProductsResult] = useState<OrderLineItemResponse[]>(
    [],
  );

  const [listPaymentMethods, setListPaymentMethods] = useState<Array<PaymentMethodResponse>>([]);

  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);

  const [listExchangeProducts, setListExchangeProducts] = useState<OrderLineItemRequest[]>([]);

  const [shipmentMethod, setShipmentMethod] = useState<number>(ShipmentMethodOption.DELIVER_LATER);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();

  const [isReturnAll, setIsReturnAll] = useState(true);

  const [isAlreadyShowWarningPoint, setIsAlreadyShowWarningPoint] = useState(false);

  const [thirdPL, setThirdPL] = useState<thirdPLModel>({
    delivery_service_provider_code: "",
    delivery_service_provider_id: null,
    insurance_fee: null,
    delivery_service_provider_name: "",
    delivery_transport_type: "",
    service: "",
    shipping_fee_paid_to_three_pls: null,
  });
  const [shippingFeeInformedToCustomer, setShippingFeeInformedToCustomer] = useState<number | null>(
    0,
  );
  // console.log('shippingFeeInformedToCustomer', shippingFeeInformedToCustomer)
  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<number>(PaymentMethodOption.PREPAYMENT);
  const [orderReturnReasonResponse, setOrderReturnReasonResponse] =
    useState<OrderReasonModel | null>(null);
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [isVisibleModalWarningPointRefund, setIsVisibleModalWarningPointRefund] =
    useState<boolean>(false);
  const [returnMoneyType, setReturnMoneyType] = useState(RETURN_MONEY_TYPE.return_now);

  const [refund, setRefund] = useState<RefundModel>({
    moneyRefund: 0,
    pointRefund: 0,
  });

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<Array<LoyaltyUsageResponse>>([]);
  const [countFinishingUpdateCustomer, setCountFinishingUpdateCustomer] = useState(0);
  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);

  //Store
  const [storeReturn, setStoreReturn] = useState<StoreResponse | null>(null);
  const [listStoreReturn, setListStoreReturn] = useState<StoreResponse[]>([]);

  const [coupon, setCoupon] = useState<string>("");
  const [promotion, setPromotion] = useState<OrderDiscountRequest | null>(null);

  const [isShowSelectOrderSources, setIsShowSelectOrderSources] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingAddressesSecondPhone, setShippingAddressesSecondPhone] = useState<string>();
  // const [orderSourceId, setOrderSourceId] = useState<number | null>(null);
  const [shippingServiceConfig, setShippingServiceConfig] = useState<
    ShippingServiceConfigDetailResponseModel[]
  >([]);

  const printElementRef = useRef(null);
  const [printContent, setPrintContent] = useState("");
  const printerContentHtml = () => {
    return `<div class='printerContent'>${printContent}<div>`;
  };
  const handlePrint = useReactToPrint({
    content: () => printElementRef.current,
  });

  const canCreateMoneyRefund = useCheckIfCanCreateMoneyRefund(
    isReceivedReturnProducts,
    OrderDetail,
  );

  const recentAccountCode = useMemo(() => {
    return {
      accountCode: userReducer.account?.code,
      accountFullName: userReducer.account?.full_name,
    };
  }, [userReducer.account?.code, userReducer.account?.full_name]);

  const initialForm: OrderRequest = useMemo(() => {
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
      assignee_code: null,
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
    };
  }, [userReducer.account?.code]);

  const [returnPaymentMethodCode, setReturnPaymentMethodCode] = useState(PaymentMethodCode.CASH);

  const initialFormValueWithReturn = useMemo(() => {
    return {
      ...initialForm,
      returnMoneyField: [
        {
          returnMoneyMethod: returnPaymentMethodCode,
          returnMoneyNote: undefined,
          returnMoneyAmount: 0,
        },
      ],
      account_code: recentAccountCode.accountCode,
      assignee_code: isExchange ? recentAccountCode.accountCode : OrderDetail?.assignee_code,
      marketer_code: OrderDetail?.marketer_code || null,
      coordinator_code: OrderDetail?.coordinator_code,
      note: OrderDetail?.note,
      customer_note: OrderDetail?.customer_note,
    };
  }, [
    OrderDetail?.assignee_code,
    OrderDetail?.coordinator_code,
    OrderDetail?.customer_note,
    OrderDetail?.marketer_code,
    OrderDetail?.note,
    initialForm,
    isExchange,
    recentAccountCode.accountCode,
    returnPaymentMethodCode,
  ]);

  // console.log("initialFormValueWithReturn", initialFormValueWithReturn);

  const getTotalPrice = (listProducts: OrderLineItemRequest[]) => {
    let total = 0;
    listProducts.forEach((a) => {
      total = total + a.line_amount_after_line_discount;
    });
    return total;
  };

  const totalAmountExchange = Math.round(getTotalPrice(listExchangeProducts));

  console.log("totalAmountExchange", totalAmountExchange);

  const totalAmountExchangePlusShippingFee = useMemo(() => {
    return (
      totalAmountExchange + (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0)
    );
  }, [shippingFeeInformedToCustomer, totalAmountExchange]);

  const totalAmountExchangeFinal = useMemo(() => {
    return (
      totalAmountExchange +
      (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
      (promotion?.amount || 0)
    );
  }, [promotion?.amount, shippingFeeInformedToCustomer, totalAmountExchange]);

  // console.log("totalAmountExchangeFinal", totalAmountExchangeFinal);
  // console.log("totalAmountExchange", totalAmountExchange);
  // console.log("shippingFeeInformedToCustomer", shippingFeeInformedToCustomer);

  /**
   * tổng giá trị đơn hàng = giá đơn hàng + phí ship - giảm giá
   */
  const totalAmountOrder = useMemo(() => {
    return (
      orderAmount +
      (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
      (promotion?.amount || 0)
    );
  }, [orderAmount, promotion?.amount, shippingFeeInformedToCustomer]);

  // console.log("totalAmountOrder", totalAmountOrder);

  const totalAmountPayment = getAmountPayment(payments);

  /**
   * if return > exchange: positive
   * else negative
   */
  let totalAmountCustomerNeedToPay = useMemo(() => {
    let result = Math.round(totalAmountOrder - totalAmountReturnProducts);
    return result;
  }, [totalAmountOrder, totalAmountReturnProducts]);

  let totalAmountOrderAfterPayments = useMemo(() => {
    let result = Math.round(totalAmountCustomerNeedToPay - totalAmountPayment);
    return result;
  }, [totalAmountCustomerNeedToPay, totalAmountPayment]);

  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
    setIsFetchData(true);
    if (!data) {
      setError(true);
    } else {
      const _data = { ...data };
      _data.fulfillments = _data.fulfillments?.filter(
        (f) =>
          f.status !== FulFillmentStatus.CANCELLED &&
          f.status !== FulFillmentStatus.RETURNED &&
          f.status !== FulFillmentStatus.RETURNING,
      );
      setOrderDetail(_data);
      if (checkIfOrderCanBeReturned(_data)) {
        setIsOrderFinished(true);
      }
      let listItemCanReturn = getListItemsCanReturn(_data);
      if (listItemCanReturn.length > 0) {
        setIsReturnAll(false);
      }
      setListItemCanBeReturn(reCalculateOrderItem(listItemCanReturn));
      let returnProduct: ReturnProductModel[] = listItemCanReturn.map((single) => {
        return {
          ...single,
          maxQuantityCanBeReturned: single.quantity,
          quantity: 0,
          discount_items: single.discount_items.map((discount) => {
            return {
              ...discount,
              amount: 0,
            };
          }),
        };
      });
      // console.log('returnProduct', returnProduct)
      setListReturnProducts(returnProduct);
      setStoreId(_data.store_id);
      setBillingAddress(_data.billing_address);
      if (_data.tags) {
        setTags(_data.tags);
      }
      if (_data.discounts) {
        let totalDiscount = 0;
        _data.discounts.forEach((single) => {
          if (single.amount) {
            totalDiscount += single.amount;
          }
        });
        setDiscountValue(totalDiscount);
        if (_data.discounts) {
          let discountRate = 0;
          _data.discounts.forEach((single) => {
            const singleDiscountRate = single.rate || 0;
            discountRate += singleDiscountRate;
          });
          setDiscountRate(discountRate);
        }
      }
      // dispatch(StoreDetailAction(_data.store_id ? _data.store_id : 0, setStoreReturn))
    }
  }, []);

  const ChangeShippingFeeInformedToCustomer = (value: number | null) => {
    form.setFieldsValue({ shipping_fee_informed_to_customer: value });
    setShippingFeeInformedToCustomer(value);
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

  const onChangeInfoProduct = (
    _items: Array<OrderLineItemRequest>,
    _promotion?: OrderDiscountRequest | null,
  ) => {
    setListExchangeProducts(_items);
    let amount = totalAmount(_items);
    setOrderAmount(amount);
    if (_promotion !== undefined) {
      setPromotion(_promotion);
    }
  };

  // ko dùng useCallback trường hợp tính sai do máy cấu hình yếu: test
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRecalculateOriginDiscount = (itemsResult: any) => {
    return (
      OrderDetail?.discounts?.map((singleDiscount) => {
        let value = Math.round(
          ((singleDiscount?.rate || 0) / 100) * getTotalAmountAfterDiscount(itemsResult),
        );
        return {
          ...singleDiscount,
          value: value,
          amount: value,
        };
      }) || null
    );
  };

  const handlePrintOrderReturnOrExchange = useCallback(
    (orderId: number, printType: string) => {
      const orderIds = [orderId];
      return new Promise((resolve, reject) => {
        getPrintOrderReturnContentService(orderIds, printType)
          .then((response) => {
            if (isFetchApiSuccessful(response)) {
              // console.log("response", response);
              setPrintContent(response.data[0].html_content);
              if (handlePrint) {
                handlePrint();
              }
            } else {
              handleFetchApiError(response, "Lấy dữ liệu hóa đơn trả", dispatch);
            }
          })
          .finally(() => {
            resolve("");
          });
      });
    },
    [dispatch, handlePrint],
  );

  /**
   * Lấy channel ID đơn trả
   * Đơn gốc online: trả tại quầy: POS, còn lại là channel_id gốc
   * Đơn gốc offline: POS
   */
  const getChannelIdReturn = useCallback(
    (OrderDetail: OrderResponse) => {
      if (isOrderFromPOS(OrderDetail)) {
        return POS.channel_id;
      } else {
        if (orderReturnType === RETURN_TYPE_VALUES.offline) {
          return POS.channel_id;
        } else {
          return OrderDetail.channel_id;
        }
      }
    },
    [orderReturnType],
  );

  /**
   * Lấy channel ID đơn đổi
   * Đơn gốc online: trả tại quầy: POS, còn lại là channel_id gốc
   * Đơn gốc offline: POS
   */
  const getChannelIdExchange = useCallback(
    (OrderDetail: OrderResponse) => {
      if (isOrderFromPOS(OrderDetail)) {
        return POS.channel_id;
      } else {
        if (orderReturnType === RETURN_TYPE_VALUES.offline) {
          return POS.channel_id;
        } else {
          return OrderDetail.channel_id;
        }
      }
    },
    [orderReturnType],
  );

  const returnItems = useMemo(() => {
    let items = listReturnProducts.map((single) => {
      const { maxQuantityCanBeReturned, ...rest } = single;
      return rest;
    });
    return items.filter((single) => {
      return single.quantity > 0;
    });
  }, [listReturnProducts]);

  /**
   * trả hàng online thì ko show hoàn tiền
   */
  const checkIfNotShowMoneyRefund = useMemo(() => {
    return orderReturnType === RETURN_TYPE_VALUES.online;
  }, [orderReturnType]);

  const isReturnAndNotShowMoneyRefund = !isExchange && checkIfNotShowMoneyRefund;

  // console.log("refund", refund);

  const getFormReturnMoneyValues = useCallback(() => {
    let formValues = form.getFieldsValue();
    // console.log("formValues", formValues);

    const formValuePayment = formValues?.returnMoneyField ? formValues?.returnMoneyField[0] : {};
    return formValuePayment;
  }, [form]);

  // truyền giá trị đơn đổi
  const addReturnAmountToPayments = useCallback(
    (result: OrderPaymentRequest[]) => {
      const moneyPayment = findPaymentMethodByCode(listPaymentMethods, PaymentMethodCode.CASH);
      const paidAmount = Math.round(totalAmountExchangeFinal);
      if (moneyPayment) {
        result.push({
          payment_method_id: PAYMENT_METHOD_ENUM.exchange.id,
          payment_method: PAYMENT_METHOD_ENUM.exchange.name,
          payment_method_code: PAYMENT_METHOD_ENUM.exchange.code,
          amount: paidAmount,
          reference: "",
          source: "",
          paid_amount: paidAmount,
          return_amount: 0,
          status: ORDER_PAYMENT_STATUS.paid,
          customer_id: customer?.id || null,
          type: "",
          note: "",
          code: "",
        });
      }
    },
    [customer?.id, listPaymentMethods, totalAmountExchangeFinal],
  );

  // giá trị trả thêm
  const addExtraPaymentAmountToPayments = useCallback(
    (result: OrderPaymentRequest[]) => {
      // console.log('payments', payments)
      const newResult = result.concat([...payments]);
      return newResult;
    },
    [payments],
  );

  // giá trị đơn trả
  const addReturnPaymentAmountToPayments = useCallback(
    (result: OrderPaymentRequest[]) => {
      const moneyPayment = findPaymentMethodByCode(listPaymentMethods, PaymentMethodCode.CASH);
      const paidAmount = Math.round(totalAmountReturnProducts);
      if (moneyPayment) {
        result.push({
          payment_method_id: PAYMENT_METHOD_ENUM.exchange.id,
          payment_method: PAYMENT_METHOD_ENUM.exchange.name,
          payment_method_code: PAYMENT_METHOD_ENUM.exchange.code,
          amount: paidAmount,
          reference: "",
          source: "",
          paid_amount: paidAmount,
          return_amount: 0,
          status: ORDER_PAYMENT_STATUS.paid,
          customer_id: customer?.id || null,
          type: "",
          note: "",
          code: "",
        });
      }
    },
    [customer?.id, listPaymentMethods, totalAmountReturnProducts],
  );

  // truyền giá trị trong form
  const addFormAmountToPayments = useCallback(
    (result: OrderPaymentRequest[]) => {
      const formValuePayment = getFormReturnMoneyValues();
      let returnMoneyMethod = listPaymentMethods.find((single) => {
        return single.code === formValuePayment?.returnMoneyMethod;
      });
      let returnMoneyAmount = formValuePayment?.returnMoneyAmount
        ? formValuePayment?.returnMoneyAmount
        : 0;
      if (returnMoneyMethod) {
        result.push({
          payment_method_id: returnMoneyMethod.id,
          amount: returnMoneyAmount,
          return_amount: 0,
          status: ORDER_PAYMENT_STATUS.paid,
          payment_method: returnMoneyMethod.name,
          payment_method_code: returnMoneyMethod.code,
          reference: "",
          source: "",
          paid_amount: returnMoneyAmount,
          customer_id: customer?.id || null,
          type: "",
          note: formValuePayment.note || "",
          code: "",
        });
      }
    },
    [customer?.id, getFormReturnMoneyValues, listPaymentMethods],
  );

  /**
   * tính tiền đơn trả của đơn đổi trả
   */
  const getPaymentOfReturnInExchange = useCallback(() => {
    let result: OrderPaymentRequest[] = [];
    if (returnMoneyType === RETURN_MONEY_TYPE.return_now) {
      //

      if (totalAmountCustomerNeedToPay < 0) {
        // truyền giá trị đơn đổi
        addReturnAmountToPayments(result);
        // truyền giá trị trong form
        addFormAmountToPayments(result);
      } else {
        // giá trị đơn trả
        addReturnPaymentAmountToPayments(result);
      }
      // tạm thời ko hoàn điểm
    } else {
      // trả tiền sau
    }
    return result;
  }, [
    addFormAmountToPayments,
    addReturnAmountToPayments,
    addReturnPaymentAmountToPayments,
    returnMoneyType,
    totalAmountCustomerNeedToPay,
  ]);

  /**
   * tính tiền đơn đổi của đơn đổi trả
   */
  const getPaymentOfExchangeInExchange = useCallback(() => {
    let result: OrderPaymentRequest[] = [];
    // trả tiền trước
    if (returnMoneyType === RETURN_MONEY_TYPE.return_now) {
      if (totalAmountCustomerNeedToPay < 0) {
        // truyền giá trị đơn đổi
        addReturnAmountToPayments(result);
      } else {
        // giá trị trả thêm
        result = addExtraPaymentAmountToPayments(result);
        // giá trị đơn trả
        addReturnPaymentAmountToPayments(result);
      }
      // tạm thời ko hoàn điểm
    } else {
      // trả tiền sau
    }
    return result;
  }, [
    addExtraPaymentAmountToPayments,
    addReturnAmountToPayments,
    addReturnPaymentAmountToPayments,
    returnMoneyType,
    totalAmountCustomerNeedToPay,
  ]);

  /**
   * lấy payment của đơn trả cho trường hợp chỉ trả ko đổi
   */
  const getPaymentOfReturnInReturn = useCallback(() => {
    let result: OrderPaymentRequest[] = [];

    // trả tiền

    // trả tiền trước
    if (returnMoneyType === RETURN_MONEY_TYPE.return_now) {
      const formValuePayment = getFormReturnMoneyValues();
      let returnMoneyAmount = formValuePayment?.returnMoneyAmount
        ? formValuePayment?.returnMoneyAmount
        : 0;
      const moneyPayment = findPaymentMethodByCode(
        listPaymentMethods,
        formValuePayment.returnMoneyMethod,
      );
      if (moneyPayment) {
        result.push({
          payment_method_id: moneyPayment.id,
          payment_method: moneyPayment.name,
          payment_method_code: moneyPayment.code,
          amount: returnMoneyAmount,
          reference: "",
          source: "",
          paid_amount: returnMoneyAmount,
          return_amount: 0,
          status: ORDER_PAYMENT_STATUS.paid,
          customer_id: customer?.id || null,
          type: "",
          note: "",
          code: "",
        });
      }

      // tạm thời ko hoàn điểm
    } else {
      // trả tiền sau
    }

    return result;
  }, [customer?.id, getFormReturnMoneyValues, listPaymentMethods, returnMoneyType]);

  const handleReturnCallback = useCallback(
    (response: any) => {
      setListReturnProducts([]);
      dispatch(hideLoading());
      setTimeout(() => {
        history.push(`${UrlConfig.ORDERS_RETURN}/${response.id}`);
      }, 500);
    },
    [dispatch, history],
  );

  const handleSubmitFormReturn = useCallback(() => {
    if (OrderDetail && listReturnProducts) {
      // tính toán lại discount
      // console.log('returnItems', returnItems)
      let discounts = handleRecalculateOriginDiscount(returnItems);
      // console.log('getTotalAmountAfterDiscount(returnItems)', getTotalAmountAfterDiscount(returnItems))
      // console.log('getTotalOrderDiscount(discounts)', getTotalOrderDiscount(discounts))

      let orderDetailResult: ReturnRequest = {
        ...OrderDetail,
        source_id: OrderDetail.source_id, // nguồn đơn gốc, ghi lại cho chắc
        store_id: storeReturn ? storeReturn.id : null,
        store: storeReturn ? storeReturn.name : "",
        store_code: storeReturn ? storeReturn.code : "",
        store_full_address: storeReturn ? storeReturn.address : "",
        store_phone_number: storeReturn ? storeReturn.hotline : "",
        action: "",
        delivery_service_provider_id: null,
        delivery_fee: null,
        shipper_code: "",
        shipper_name: "",
        shipping_fee_paid_to_three_pls: null,
        requirements: null,
        items: returnItems,
        fulfillments: [],
        payments: getPaymentOfReturnInReturn(),
        reason_id: orderReturnReasonResponse?.id || 0,
        reason_name:
          orderReturnReasonResponse?.sub_reasons.find(
            (single) => single.id === form.getFieldValue("reason_id"),
          )?.name || "",
        reason: form.getFieldValue("reason"),
        sub_reason_id: form.getFieldValue("sub_reason_id") || null,
        received: isReceivedReturnProducts,
        order_returns: [],
        automatic_discount: form.getFieldValue("automatic_discount"),
        discounts: discounts,
        total: Math.round(
          getTotalAmountAfterDiscount(returnItems) - getTotalOrderDiscount(discounts),
        ),
        total_discount: Math.round(getTotalOrderDiscount(discounts)),
        total_line_amount_after_line_discount: Math.round(getTotalAmountAfterDiscount(returnItems)),
        account_code: recentAccountCode.accountCode,
        assignee_code: OrderDetail?.assignee_code,
        // clear giá trị
        reference_code: "",
        customer_note: form.getFieldValue("customer_note"),
        note: form.getFieldValue("note"),
        url: form.getFieldValue("url") || "",
        tags: tags,
        type: orderReturnType,
        //channel
        channel_id: getChannelIdReturn(OrderDetail),
        // thêm money refund
        money_refund: Math.round(refund.moneyRefund),
        // channel_id: orderReturnType === RETURN_TYPE_VALUES.offline ? POS.channel_id : ADMIN_ORDER.channel_id,
        currency: AppConfig.currency,
      };
      // console.log("orderDetailResult", orderDetailResult);
      // return;
      dispatch(showLoading());
      dispatch(
        actionCreateOrderReturn(
          orderDetailResult,
          (response) => {
            setTimeout(() => {
              isUserCanCreateOrder.current = true;
            }, 1000);
            if (isPrint) {
              handlePrintOrderReturnOrExchange(response.id, printType.return).then(() => {
                handleReturnCallback(response);
              });
            } else {
              handleReturnCallback(response);
            }
          },
          () => {
            dispatch(hideLoading());
          },
        ),
      );
    }
  }, [
    OrderDetail,
    dispatch,
    form,
    getChannelIdReturn,
    getPaymentOfReturnInReturn,
    handlePrintOrderReturnOrExchange,
    handleRecalculateOriginDiscount,
    handleReturnCallback,
    isReceivedReturnProducts,
    listReturnProducts,
    orderReturnReasonResponse?.id,
    orderReturnReasonResponse?.sub_reasons,
    orderReturnType,
    printType.return,
    recentAccountCode.accountCode,
    refund.moneyRefund,
    returnItems,
    storeReturn,
    tags,
  ]);

  const checkIfHasReturnProduct = listReturnProducts.some((single) => {
    return single.quantity > 0;
  });

  const onReturn = useCallback(() => {
    if (!storeReturn) {
      showError("Vui lòng chọn cửa hàng để trả!");
      const element: any = document.getElementById("selectStoreReturn");
      scrollAndFocusToDomElement(element);
      return;
    }
    if (!checkIfHasReturnProduct) {
      showError("Vui lòng chọn ít nhất 1 sản phẩm trả!");
      const element: any = document.getElementById("search_product_return");
      scrollAndFocusToDomElement(element);
      return;
    }
    form
      .validateFields()
      .then(() => {
        if (isReceivedReturnProducts || orderReturnType === RETURN_TYPE_VALUES.online) {
          handleSubmitFormReturn();
        } else {
          setIsVisibleModalWarning(true);
        }
      })
      .catch((error) => {
        if (error.errorFields && error.errorFields[0]) {
          const element: any = document.getElementById(error.errorFields[0].name.join(""));
          scrollAndFocusToDomElement(element);
        }
      });
  }, [
    checkIfHasReturnProduct,
    form,
    handleSubmitFormReturn,
    isReceivedReturnProducts,
    orderReturnType,
    storeReturn,
  ]);

  const getOrderSource = useCallback(
    (form: FormInstance<any>) => {
      let result = null;
      result = form.getFieldValue("source_id")
        ? form.getFieldValue("source_id")
        : OrderDetail
        ? OrderDetail.source_id
        : null;
      return result;
    },
    [OrderDetail],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkPointFocus = (value: any) => {
    let pointFocus = payments.find((p) => p.code === "point");

    if (!pointFocus) return true;

    let discount = 0;
    value.items.forEach((p: any) => (discount = discount + p.discount_amount * p.quantity));

    let rank = loyaltyUsageRules.find(
      (x) =>
        x.rank_id ===
        (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id),
    );

    if (!loyaltyPoint) {
      showError("Khách hàng chưa tồn tại trên hệ thống Loyalty");
      return false;
    }
    if (rank?.block_order_have_discount === true && (discount > 0 || discountValue)) {
      showError("Khách hàng không được áp dụng tiêu điểm cho đơn hàng có chiết khấu");
      return false;
    }
    return true;
  };

  const handleExchangeCallback = useCallback(
    (value: OrderResponse) => {
      setTimeout(() => {
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      }, 500);
    },
    [history],
  );

  const createOrderExchangeCallback = useCallback(
    (value: OrderResponse) => {
      if (!value.order_return_origin?.id) {
        return;
      }
      setTimeout(() => {
        isUserCanCreateOrder.current = true;
      }, 1000);
      if (isPrint) {
        handlePrintOrderReturnOrExchange(
          value.order_return_origin.id,
          printType.returnAndExchange,
        ).then(() => {
          handleExchangeCallback(value);
        });
      } else {
        handleExchangeCallback(value);
      }
    },
    [handleExchangeCallback, handlePrintOrderReturnOrExchange, printType.returnAndExchange],
  );

  const createShipmentRequest = useCallback(
    (value: OrderRequest) => {
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
            shipping_fee_informed_to_customer: null, // không gửi phí ship báo khách trong ffm
            service: thirdPL.service,
            shipping_fee_paid_to_three_pls: thirdPL.shipping_fee_paid_to_three_pls,
          };

        case ShipmentMethodOption.SELF_DELIVER:
          return {
            ...objShipment,
            delivery_service_provider_type: thirdPL.delivery_service_provider_code,
            service: thirdPL.service,
            shipper_code: value.shipper_code,
            shipping_fee_informed_to_customer: null, // không gửi phí ship báo khách trong ffm
            shipping_fee_paid_to_three_pls: thirdPL.shipping_fee_paid_to_three_pls,
            cod:
              totalAmountExchange +
              (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
              getAmountPaymentRequest(payments) -
              discountValue,
          };

        case ShipmentMethodOption.PICK_AT_STORE:
          objShipment.delivery_service_provider_type = ShipmentMethod.PICK_AT_STORE;
          let newCod = totalAmountExchange;
          if (shippingFeeInformedToCustomer !== null) {
            if (
              totalAmountExchange +
                shippingFeeInformedToCustomer -
                getAmountPaymentRequest(payments) >
              0
            ) {
              newCod =
                totalAmountExchange +
                shippingFeeInformedToCustomer -
                getAmountPaymentRequest(payments);
            }
          } else {
            if (totalAmountExchange - getAmountPaymentRequest(payments) > 0) {
              newCod = totalAmountExchange - getAmountPaymentRequest(payments);
            }
          }
          return {
            ...objShipment,
            delivery_service_provider_type: ShipmentMethod.PICK_AT_STORE,
            cod: newCod,
          };

        case ShipmentMethodOption.DELIVER_LATER:
          return null;

        default:
          break;
      }
    },
    [
      discountValue,
      form,
      payments,
      shipmentMethod,
      shippingFeeInformedToCustomer,
      storeId,
      thirdPL.delivery_service_provider_code,
      thirdPL.delivery_service_provider_id,
      thirdPL.delivery_service_provider_name,
      thirdPL.delivery_transport_type,
      thirdPL.service,
      thirdPL.shipping_fee_paid_to_three_pls,
      totalAmountExchange,
    ],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkIfNotHavePaymentsWhenReceiveAtStorePOS = () => {
    const methods = [ShipmentMethodOption.PICK_AT_STORE];
    if (
      totalAmountOrderAfterPayments > 0 &&
      methods.includes(shipmentMethod) &&
      isOrderFromPOS(OrderDetail)
    ) {
      return true;
    }
    return false;
  };

  const createFulFillmentRequest = useCallback(
    (value: OrderRequest) => {
      let shipmentRequest = createShipmentRequest(value);
      let request: FulFillmentRequest = {
        store_id: value.store_id,
        account_code: userReducer.account?.code,
        assignee_code: value.assignee_code,
        delivery_type: "",
        stock_location_id: null,
        payment_status: "",
        total: totalAmountExchange,
        total_tax: null,
        total_discount: null,
        total_quantity: null,
        discount_rate: discountRate,
        discount_value: discountValue,
        discount_amount: null,
        total_line_amount_after_line_discount: null,
        shipment: shipmentRequest,
        items: listExchangeProducts.concat(itemGifts),
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
        request.delivery_type = ShipmentMethod.PICK_AT_STORE;
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
    },
    [
      createShipmentRequest,
      discountRate,
      discountValue,
      itemGifts,
      listExchangeProducts,
      paymentMethod,
      shipmentMethod,
      totalAmountExchange,
      userReducer.account?.code,
    ],
  );

  const createDiscountRequest = useCallback(() => {
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
  }, [coupon, promotion]);

  const onFinish = useCallback(
    (values: OrderRequest) => {
      setTimeout(() => {
        isUserCanCreateOrder.current = true;
      }, 3000);

      if (!isUserCanCreateOrder.current) {
        showError("Không được thao tác liên tiếp! Vui lòng đợi 5 giây!");
        return;
      }
      isUserCanCreateOrder.current = false;
      let lstFulFillment = createFulFillmentRequest(values);
      let lstDiscount = createDiscountRequest();
      let total_line_amount_after_line_discount = Math.round(
        getTotalAmountAfterDiscount(listExchangeProducts),
      );
      values.fulfillments = lstFulFillment;
      values.action = OrderStatus.FINALIZED;
      values.total = Math.round(totalAmountOrder);
      if (
        values?.fulfillments &&
        values.fulfillments.length > 0 &&
        values.fulfillments[0].shipment
      ) {
        let priceToShipper =
          totalAmountOrder -
          getAmountPaymentRequest(payments) -
          (totalAmountReturnProducts ? totalAmountReturnProducts : 0);
        values.fulfillments[0].shipment.cod = priceToShipper > 0 ? priceToShipper : 0;
      }
      values.tags = tags;
      // values.items = listExchangeProducts;
      values.items = listExchangeProducts.concat(itemGifts);
      values.discounts = lstDiscount;
      let _shippingAddressRequest: any = {
        ...shippingAddress,
        second_phone: shippingAddressesSecondPhone,
      };
      values.shipping_address = _shippingAddressRequest;
      values.billing_address = billingAddress;
      values.customer_id = customer?.id;
      values.total_line_amount_after_line_discount = total_line_amount_after_line_discount;
      values.total_discount = promotion?.amount || 0;
      values.assignee_code = OrderDetail ? OrderDetail.assignee_code : null;
      // values.currency = OrderDetail ? OrderDetail.currency : null;
      values.currency = AppConfig.currency;
      values.account_code = OrderDetail ? OrderDetail.account_code : null;
      values.source_id =
        OrderDetail?.source?.toLocaleLowerCase() === POS.source.toLocaleLowerCase()
          ? getOrderSource(form)
          : OrderDetail?.source_id;
      // values.channel_id = !isShowSelectOrderSources ? POS.channel_id :ADMIN_ORDER.channel_id
      values.channel_id =
        orderReturnType === RETURN_TYPE_VALUES.offline ? POS.channel_id : ADMIN_ORDER.channel_id;
      values.coordinator_code = OrderDetail ? OrderDetail.coordinator_code : null;
      values.marketer_code = OrderDetail ? OrderDetail.marketer_code : null;
      values.url = OrderDetail ? OrderDetail.url : null;
      values.reference_code = OrderDetail ? OrderDetail.reference_code : null;

      return values;
    },

    [
      OrderDetail,
      billingAddress,
      createDiscountRequest,
      createFulFillmentRequest,
      customer?.id,
      form,
      getOrderSource,
      itemGifts,
      listExchangeProducts,
      orderReturnType,
      payments,
      promotion?.amount,
      shippingAddress,
      shippingAddressesSecondPhone,
      tags,
      totalAmountOrder,
      totalAmountReturnProducts,
    ],
  );

  const handleCancel = () => {
    history.push(`${UrlConfig.ORDER}/${orderId}`);
  };

  const handleCustomer = (_objCustomer: CustomerResponse | null) => {
    setCustomer(_objCustomer);
  };

  const onChangeShippingAddress = (_objShippingAddress: ShippingAddress | null) => {
    setShippingAddress(_objShippingAddress);
  };

  const onChangeBillingAddress = (_objBillingAddress: BillingAddressRequestModel | null) => {
    setBillingAddress(_objBillingAddress);
  };

  const renderHtml = (text: string) => {
    if (text === "") {
      return "";
    }
    let result = text;
    return result;
  };

  const onChangeTag = useCallback(
    (value: []) => {
      const strTag = value.join(",");
      setTags(strTag);
    },
    [setTags],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCreateOrderExchangeByValue = (valuesExchange: ExchangeRequest) => {
    dispatch(showLoading());
    dispatch(
      actionCreateOrderExchange(
        valuesExchange,
        (data) => {
          createOrderExchangeCallback(data);
        },
        () => {
          dispatch(hideLoading());
        },
      ),
    );
  };

  const handleSubmitFormReturnAndExchange = useCallback(() => {
    let checkIfHasExchangeProduct = listExchangeProducts.some((single) => {
      return single.quantity > 0;
    });
    if (!checkIfHasReturnProduct) {
      showError("Vui lòng chọn ít nhất 1 sản phẩm để trả!");
      const element: any = document.getElementById("search_product_return");
      scrollAndFocusToDomElement(element);
      return;
    }
    if (!storeReturn) {
      showError("Vui lòng chọn cửa hàng để trả!");
      const element: any = document.getElementById("selectStoreReturn");
      scrollAndFocusToDomElement(element);
      return;
    }
    if (listExchangeProducts.length === 0 || !checkIfHasExchangeProduct) {
      showError("Vui lòng chọn ít nhất 1 sản phẩm mua!");
      const element: any = document.getElementById("search_product");
      const offsetY = element?.getBoundingClientRect()?.top + window.pageYOffset + -200;
      window.scrollTo({ top: offsetY, behavior: "smooth" });
      element?.focus();
      return;
    }
    if (shipmentMethod !== ShipmentMethodOption.PICK_AT_STORE && !shippingAddress) {
      showError("Vui lòng cập nhật địa chỉ giao hàng!");
      const element: any = document.getElementById(
        "customer_update_shipping_addresses_full_address",
      );
      scrollAndFocusToDomElement(element);
      return;
    }
    if (checkIfNotHavePaymentsWhenReceiveAtStorePOS()) {
      const element: any = document.getElementsByClassName(
        "create-order-payment",
      )[0] as HTMLElement;
      scrollAndFocusToDomElement(element);
      showError("Vui lòng thanh toán đủ số tiền!");
      return;
    }

    if (OrderDetail && listReturnProducts) {
      let items = listReturnProducts.map((single) => {
        const { maxQuantityCanBeReturned, ...rest } = single;
        return rest;
      });
      let itemsResult = items.filter((single) => {
        return single.quantity > 0;
      });
      let discounts = handleRecalculateOriginDiscount(itemsResult);

      const origin_order_id = OrderDetail.id;
      let orderDetailResult: ReturnRequest = {
        ...cloneDeep(OrderDetail),
        source_id: OrderDetail.source_id, // nguồn đơn gốc, ghi lại cho chắc
        store_id: storeReturn ? storeReturn.id : null,
        store: storeReturn ? storeReturn.name : "",
        store_code: storeReturn ? storeReturn.code : "",
        store_full_address: storeReturn ? storeReturn.address : "",
        store_phone_number: storeReturn ? storeReturn.hotline : "",
        action: "",
        delivery_service_provider_id: null,
        delivery_fee: null,
        shipper_code: "",
        shipper_name: "",
        shipping_fee_paid_to_three_pls: null,
        requirements: null,
        items: itemsResult,
        fulfillments: [],
        payments: [],
        reason_id: orderReturnReasonResponse?.id || 0,
        reason_name:
          orderReturnReasonResponse?.sub_reasons.find(
            (single) => single.id === form.getFieldValue("reason_id"),
          )?.name || "",
        reason: form.getFieldValue("reason"),
        sub_reason_id: form.getFieldValue("sub_reason_id") || null,
        // received: isReceivedReturnProducts,
        received: orderReturnType === RETURN_TYPE_VALUES.online ? true : isReceivedReturnProducts,
        discounts: handleRecalculateOriginDiscount(itemsResult),
        account_code: recentAccountCode.accountCode,
        assignee_code: OrderDetail.assignee_code || null,
        total: Math.floor(
          getTotalAmountAfterDiscount(itemsResult) - getTotalOrderDiscount(discounts),
        ),
        total_discount: Math.round(getTotalOrderDiscount(discounts)),
        total_line_amount_after_line_discount: Math.floor(getTotalAmountAfterDiscount(itemsResult)),
        // clear giá trị
        reference_code: "",
        customer_note: "",
        note: "",
        url: "",
        tags: null,
        type: orderReturnType,
        // channel
        channel_id: getChannelIdReturn(OrderDetail),
        // thêm money refund
        money_refund: Math.round(refund.moneyRefund),
        currency: AppConfig.currency,

        // channel_id: orderReturnType === RETURN_TYPE_VALUES.offline ? POS.channel_id : ADMIN_ORDER.channel_id
      };

      const order_return = cloneDeep(orderDetailResult);
      order_return.fulfillments = [];
      order_return.items = itemsResult;
      order_return.payments = getPaymentOfReturnInExchange();

      let values: OrderRequest = form.getFieldsValue();
      let order_exchange = onFinish(values);
      // const bb = cloneDeep(OrderDetail);
      // let order_exchange:any = {
      //   ...bb,
      //   ...abc
      // };
      if (!order_exchange) {
        return;
      }
      order_exchange.channel_id = getChannelIdExchange(OrderDetail);
      order_exchange.company_id = DEFAULT_COMPANY.company_id;
      order_exchange.account_code = form.getFieldValue("account_code");
      order_exchange.assignee_code = form.getFieldValue("assignee_code");
      order_exchange.coordinator_code = form.getFieldValue("coordinator_code");
      order_exchange.marketer_code = form.getFieldValue("marketer_code");
      order_exchange.reference_code = form.getFieldValue("reference_code");
      order_exchange.url = form.getFieldValue("url");
      order_exchange.fulfillments = createFulFillmentRequest(values);
      order_exchange.items = listExchangeProducts.concat(itemGifts);
      order_exchange.payments = getPaymentOfExchangeInExchange();

      // phí ship báo khách truyền trong đơn đổi
      order_exchange.shipping_fee_informed_to_customer = shippingFeeInformedToCustomer;
      const valuesExchange = {
        origin_order_id,
        order_return,
        order_exchange,
      };
      // console.log("valuesExchange", valuesExchange);
      // return;
      if (checkPointFocus(order_exchange)) {
        if (!order_exchange?.customer_id) {
          showError("Vui lòng chọn khách hàng và nhập địa chỉ giao hàng!");
          const element: any = document.getElementById("search_customer");
          element?.focus();
        } else {
          if (listExchangeProducts.length === 0) {
            showError("Vui lòng chọn ít nhất 1 sản phẩm");
            const element: any = document.getElementById("search_product");
            element?.focus();
          } else {
            if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
              if (order_exchange?.delivery_service_provider_id === null) {
                showError("Vui lòng chọn đối tác giao hàng!");
              } else {
                handleCreateOrderExchangeByValue(valuesExchange);
              }
            } else {
              if (shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && !thirdPL.service) {
                showError("Vui lòng chọn đơn vị vận chuyển!");
                const element = document.getElementsByClassName(
                  "orders-shipment",
                )[0] as HTMLElement;
                scrollAndFocusToDomElement(element);
              } else {
                handleCreateOrderExchangeByValue(valuesExchange);
              }
            }
          }
        }
      }
    }
  }, [
    OrderDetail,
    checkIfHasReturnProduct,
    checkIfNotHavePaymentsWhenReceiveAtStorePOS,
    checkPointFocus,
    createFulFillmentRequest,
    form,
    getChannelIdExchange,
    getChannelIdReturn,
    getPaymentOfExchangeInExchange,
    getPaymentOfReturnInExchange,
    handleCreateOrderExchangeByValue,
    handleRecalculateOriginDiscount,
    isReceivedReturnProducts,
    itemGifts,
    listExchangeProducts,
    listReturnProducts,
    onFinish,
    orderReturnReasonResponse?.id,
    orderReturnReasonResponse?.sub_reasons,
    orderReturnType,
    recentAccountCode.accountCode,
    refund.moneyRefund,
    shipmentMethod,
    shippingAddress,
    shippingFeeInformedToCustomer,
    storeReturn,
    thirdPL.service,
  ]);

  const onReturnAndExchange = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        if (isReceivedReturnProducts || orderReturnType === RETURN_TYPE_VALUES.online) {
          handleSubmitFormReturnAndExchange();
        } else {
          setIsVisibleModalWarning(true);
        }
      })
      .catch((error) => {
        console.log("error", error);
        const element: any =
          document.getElementById(error.errorFields[0].name.join("")) ||
          document.getElementById(error.errorFields[0].name.join("_"));
        if (element) {
          scrollAndFocusToDomElement(element);
        }
      });
  }, [form, handleSubmitFormReturnAndExchange, isReceivedReturnProducts, orderReturnType]);

  /**
   * theme context data
   */
  const createOrderReturnContextData = {
    orderDetail: OrderDetail,
    return: {
      listItemCanBeReturn,
      listOrderProductsResult,
      listReturnProducts,
      setListReturnProducts,
      setTotalAmountReturnProducts,
      refund,
      setRefund,
      totalAmountReturnProducts,
      totalAmountExchange,
      totalAmountCustomerNeedToPay,
      setStoreReturn,
      storeReturn,
      listExchangeProducts,
    },
    isExchange,
    listStoreReturn,
  };
  // console.log("totalAmountCustomerNeedToPay", totalAmountCustomerNeedToPay);

  useEffect(() => {
    let initMoneyAmount =
      totalAmountCustomerNeedToPay < 0 ? Math.round(Math.abs(totalAmountCustomerNeedToPay)) : 0;
    // console.log('isReturnAndNotShowMoneyRefund', isReturnAndNotShowMoneyRefund)
    // console.log("initMoneyAmount111", initMoneyAmount);
    form.setFieldsValue({
      returnMoneyField: [
        {
          ...initialFormValueWithReturn.returnMoneyField[0],
          returnMoneyMethod: returnPaymentMethodCode,
          returnMoneyAmount: isReturnAndNotShowMoneyRefund ? 0 : initMoneyAmount,
        },
      ],
    });
  }, [
    form,
    initialFormValueWithReturn.returnMoneyField,
    isReturnAndNotShowMoneyRefund,
    returnPaymentMethodCode,
    totalAmountCustomerNeedToPay,
  ]);

  const renderIfOrderNotFinished = () => {
    return <div>Đơn hàng chưa hoàn tất! Vui lòng kiểm tra lại</div>;
  };

  // console.log("orderReturnType", orderReturnType);

  const renderIfOrderFinished = () => {
    if (isReturnAll) {
      return <p>Đơn hàng đã đổi trả hết!</p>;
    }
    return (
      <React.Fragment>
        <div className="orders">
          <Form
            layout="vertical"
            initialValues={initialFormValueWithReturn}
            form={form}
            onFinish={onFinish}
          >
            <Row gutter={24} style={{ marginBottom: "70px" }}>
              <Col md={18}>
                {!isShowSelectOrderSources && (
                  <UpdateCustomerCard
                    OrderDetail={OrderDetail}
                    customerDetail={customer}
                    loyaltyPoint={loyaltyPoint}
                    loyaltyUsageRules={loyaltyUsageRules}
                    // isShowSelectOrderSources={false}
                  />
                )}

                {isShowSelectOrderSources && (
                  <CustomerCard
                    customer={customer}
                    handleCustomer={handleCustomer}
                    loyaltyPoint={loyaltyPoint}
                    loyaltyUsageRules={loyaltyUsageRules}
                    ShippingAddressChange={onChangeShippingAddress}
                    shippingAddress={shippingAddress}
                    billingAddress={billingAddress}
                    setBillingAddress={onChangeBillingAddress}
                    isVisibleCustomer={true}
                    modalAction={"edit"}
                    levelOrder={3}
                    OrderDetail={OrderDetail}
                    shippingAddressesSecondPhone={shippingAddressesSecondPhone}
                    setShippingAddressesSecondPhone={setShippingAddressesSecondPhone}
                    form={form}
                    // setOrderSourceId={setOrderSourceId}
                    //isDisableSelectSource={true}
                    initialForm={initialForm}
                    updateOrder
                    initDefaultOrderSourceId={OrderDetail?.source_id}
                    isAutoDefaultOrderSource={false}
                    customerChange={customerChange}
                    setCustomerChange={setCustomerChange}
                    // handleOrderBillRequest={()=>{}}
                    // initOrderBillRequest={undefined}
                  />
                )}

                <CardReturnProductContainer
                  discountRate={discountRate}
                  orderId={orderId}
                  setIsVisibleModalWarningPointRefund={setIsVisibleModalWarningPointRefund}
                  listStores={listStores}
                  autoCompleteRef={productReturnAutoCompleteRef}
                  searchVariantInputValue={searchVariantInputValue}
                  setSearchVariantInputValue={setSearchVariantInputValue}
                  setListOrderProductsResult={setListOrderProductsResult}
                  isAlreadyShowWarningPoint={isAlreadyShowWarningPoint}
                  listPaymentMethods={listPaymentMethods}
                />

                <OrderCreateProduct
                  orderAmount={orderAmount}
                  totalAmountOrder={totalAmountOrder}
                  changeInfo={onChangeInfoProduct}
                  setStoreId={(value) => {
                    setStoreId(value);
                    form.setFieldsValue({ store_id: value });
                  }}
                  storeId={storeId}
                  shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
                  setItemGift={setItemGift}
                  form={form}
                  items={listExchangeProducts}
                  setItems={setListExchangeProducts}
                  inventoryResponse={inventoryResponse}
                  setInventoryResponse={setInventoryResponse}
                  totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                  returnOrderInformation={{
                    totalAmountReturn: totalAmountReturnProducts,
                    totalAmountExchangePlusShippingFee,
                  }}
                  orderConfig={orderConfig}
                  coupon={coupon}
                  setCoupon={setCoupon}
                  promotion={promotion}
                  setPromotion={setPromotion}
                  customer={customer}
                  loyaltyPoint={loyaltyPoint}
                  countFinishingUpdateCustomer={countFinishingUpdateCustomer}
                  isCreateReturn
                  isExchange={isExchange}
                  shipmentMethod={shipmentMethod}
                  listStores={listStores}
                  isReturnOffline={orderReturnType === RETURN_TYPE_VALUES.offline}
                />
                {/* hiện tại đang ẩn cái hoàn tiền khi trả */}
                {/* {!isExchange && ( */}
                {!isExchange && !isReturnAndNotShowMoneyRefund && canCreateMoneyRefund && (
                  <CardReturnMoneyPageCreateReturn
                    listPaymentMethods={listPaymentMethods}
                    totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                    returnMoneyType={returnMoneyType}
                    setReturnMoneyType={setReturnMoneyType}
                    returnPaymentMethodCode={returnPaymentMethodCode}
                    setReturnPaymentMethodCode={setReturnPaymentMethodCode}
                    canCreateMoneyRefund={canCreateMoneyRefund}
                  />
                )}

                {isExchange && (
                  <CardReturnMoneyPageCreate
                    listPaymentMethods={listPaymentMethods}
                    payments={payments}
                    setPayments={setPayments}
                    totalAmountOrder={totalAmountOrder}
                    totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                    isExchange={isExchange}
                    returnMoneyType={returnMoneyType}
                    setReturnMoneyType={setReturnMoneyType}
                    returnOrderInformation={{
                      totalAmountReturn: totalAmountReturnProducts,
                    }}
                    shipmentMethod={shipmentMethod}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    isDisablePostPayment={isDisablePostPayment}
                    isOrderReturnFromPOS={isOrderFromPOS(OrderDetail)}
                    returnPaymentMethodCode={returnPaymentMethodCode}
                    setReturnPaymentMethodCode={setReturnPaymentMethodCode}
                    canCreateMoneyRefund // đơn đổi có thể tạo trả tiền
                  />
                )}
                {isExchange && (
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
                      shipmentMethod={
                        isOrderFromPOS(OrderDetail)
                          ? ShipmentMethodOption.PICK_AT_STORE
                          : shipmentMethod
                      }
                      orderPrice={orderAmount}
                      storeDetail={storeDetail}
                      customer={customer}
                      items={listExchangeProducts}
                      isCancelValidateDelivery={false}
                      totalAmountCustomerNeedToPay={totalAmountOrderAfterPayments}
                      setShippingFeeInformedToCustomer={ChangeShippingFeeInformedToCustomer}
                      onSelectShipment={onSelectShipment}
                      thirdPL={thirdPL}
                      setThirdPL={setThirdPL}
                      form={form}
                      shippingServiceConfig={shippingServiceConfig}
                      orderConfig={orderConfig}
                      isOrderReturnFromPOS={isOrderFromPOS(OrderDetail)}
                      payments={payments}
                    />
                  </Card>
                )}
                {orderReturnType === RETURN_TYPE_VALUES.offline && (
                  <CardReturnReceiveProducts
                    isDetailPage={false}
                    isReceivedReturnProducts={isReceivedReturnProducts}
                    handleReceivedReturnProducts={setIsReceivedReturnProducts}
                  />
                )}
              </Col>

              <Col md={6}>
                <SidebarOrderDetailInformation OrderDetail={OrderDetail} />
                <CreateOrderSidebarOrderInformation
                  form={form}
                  orderDetail={OrderDetail}
                  storeId={storeId}
                  updateOrder
                  isOrderReturn
                  isExchange={isExchange}
                />
                <OrderReturnReason
                  orderReturnReasonResponse={orderReturnReasonResponse}
                  form={form}
                />
                <SidebarOrderDetailExtraInformation OrderDetail={OrderDetail} />
                <Card title="THÔNG TIN BỔ SUNG CẬP NHẬT">
                  <CreateOrderSidebarOrderExtraInformation
                    onChangeTag={onChangeTag}
                    tags={tags}
                    isExchange={isExchange}
                    isReturn
                  />
                </Card>
              </Col>
            </Row>
          </Form>
        </div>
        <ReturnBottomBar
          onReturn={() => {
            isPrint = false;
            onReturn();
          }}
          onReturnAndPrint={() => {
            isPrint = true;
            onReturn();
          }}
          onReturnAndExchange={() => {
            isPrint = false;
            onReturnAndExchange();
          }}
          onReturnAndExchangeAndPrint={() => {
            isPrint = true;
            onReturnAndExchange();
          }}
          onCancel={() => handleCancel()}
          isExchange={isExchange}
        />
        <ModalConfirm
          onCancel={() => {
            setIsVisibleModalWarning(false);
          }}
          onOk={() => {
            setIsVisibleModalWarning(false);
            if (!isExchange) {
              handleSubmitFormReturn();
            } else {
              handleSubmitFormReturnAndExchange();
            }
          }}
          okText="Đồng ý"
          cancelText="Hủy"
          title={`Chưa nhận hàng trả lại, bạn có muốn tiếp tục không?`}
          subTitle=""
          visible={isVisibleModalWarning}
        />
        <Modal
          width="35%"
          className="modal-confirm"
          okText={"Đồng ý"}
          visible={isVisibleModalWarningPointRefund}
          onCancel={() => {
            setIsVisibleModalWarningPointRefund(false);
          }}
          onOk={() => {
            setIsVisibleModalWarningPointRefund(false);
          }}
          footer={
            <Button
              type="primary"
              onClick={() => {
                setIsAlreadyShowWarningPoint(true);
                setIsVisibleModalWarningPointRefund(false);
              }}
            >
              Đồng ý
            </Button>
          }
        >
          <div className="modal-confirm-container">
            <div>
              <div
                style={{
                  color: "#FFFFFF",
                  backgroundColor: "#FCAF17",
                  fontSize: "45px",
                }}
                className="modal-confirm-icon"
              >
                <TiWarningOutline />
              </div>
            </div>
            <div className="modal-confirm-right margin-left-20">
              <div className="modal-confirm-title">{"Chú ý"}</div>
              <div className="modal-confirm-sub-title">
                Đơn gốc có thể đồng bộ từ nhanh về, có tiêu điểm, nên có thể bị lỗi điểm hoàn và
                tiền hoàn lại cho khách!
              </div>
            </div>
          </div>
        </Modal>
        <div style={{ display: "none" }}>
          <div className="printContent333" ref={printElementRef}>
            <div
              dangerouslySetInnerHTML={{
                // __html: renderHtml(printerContentHtml()),
                __html: purify.sanitize(renderHtml(printerContentHtml())),
              }}
            ></div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const eventFunctional = useCallback((event: KeyboardEvent) => {
    if (["F9", "F10"].indexOf(event.key) !== -1) {
      event.preventDefault();
      event.stopPropagation();
    }

    switch (event.key) {
      case "F9":
        const btnFinishReturnElement = document.getElementById("btn-return");
        btnFinishReturnElement?.click();
        break;
      case "F10":
        const btnFinishReturnPrintElement = document.getElementById("btn-return-print");
        btnFinishReturnPrintElement?.click();
        break;
    }
  }, []);

  const eventKeydown = useCallback(
    (event: KeyboardEvent) => {
      const handleProductReturn = (keyCode: string, Code: string) => {
        // console.log("keyCode", keyCode);
        if (keyCode === "Enter") {
          // console.log("Code", Code);
          // console.log("listItemCanBeReturn", listItemCanBeReturn);
          setSearchVariantInputValue("");
          setListOrderProductsResult([]);
          if (listItemCanBeReturn && listReturnProducts && Code) {
            const selectedVariant = listItemCanBeReturn.find((single) => {
              return single.variant_barcode === Code;
            });

            // console.log("selectedVariant", selectedVariant);

            if (selectedVariant) {
              let selectedVariantWithMaxQuantity: ReturnProductModel = {
                ...selectedVariant,
                maxQuantityCanBeReturned: selectedVariant.quantity,
              };

              let indexSelectedVariant = listReturnProducts.findIndex((single) => {
                return single.variant_id === selectedVariantWithMaxQuantity.variant_id;
              });

              let result = [...listReturnProducts];

              if (indexSelectedVariant === -1) {
                selectedVariantWithMaxQuantity.quantity = 1;
                result = [selectedVariantWithMaxQuantity, ...listReturnProducts];
              } else {
                let selectedVariant = result[indexSelectedVariant];
                if (
                  selectedVariant.maxQuantityCanBeReturned &&
                  selectedVariant.quantity < selectedVariant.maxQuantityCanBeReturned
                ) {
                  selectedVariant.quantity += 1;
                }
              }
              setListReturnProducts(result);
            }
            barcode = "";
          } else {
            barcode = barcode + event.key;
          }
        }
        // else if(event.key!=="Enter"){
        //   const searchProductReturnElement:any= document.getElementById("search_product_return");
        //   const txtSearchProductReturn=searchProductReturnElement?.value;
        //   if (txtSearchProductReturn && txtSearchProductReturn.length>=3) {
        //     let result = listItemCanBeReturn.filter((single) => {
        //       return (
        //         fullTextSearch(searchVariantInputValue, single.variant) ||
        //         fullTextSearch(searchVariantInputValue, single.sku)
        //       );
        //     });

        //     setListOrderProductsResult(result);
        //   }
        // }
      };

      if (event.target instanceof HTMLInputElement) {
        if (event.target.id === "search_product_return") {
          if (event.key !== "Enter") barcode = barcode + event.key;
          // console.log("barcode", barcode);
          handleDelayActionWhenInsertTextInSearchInput(
            productReturnAutoCompleteRef,
            () => handleProductReturn(event.key, barcode),
            200,
          );
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listItemCanBeReturn, listReturnProducts],
  );

  useHandleMomoCreateShipment(setShipmentMethod, payments);

  useEffect(() => {
    if (storeId != null) {
      dispatch(
        StoreDetailCustomAction(storeId, (data: StoreCustomResponse) => {
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
  }, [dispatch, storeId, isShouldSetDefaultStoreBankAccount]);

  useEffect(() => {
    dispatch(setIsShouldSetDefaultStoreBankAccountAction(true));
  }, [dispatch]);

  useEffect(() => {
    setShippingFeeInformedToCustomer(0);
    if (queryOrderID) {
      dispatch(OrderDetailAction(queryOrderID, onGetDetailSuccess));
    } else {
      setError(true);
    }
  }, [dispatch, queryOrderID, onGetDetailSuccess]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(
        getCustomerDetailAction(OrderDetail?.customer_id, (data) => {
          setCustomer(data);
          dispatch(changeOrderCustomerAction(data));
        }),
      );
      setShippingAddressesSecondPhone(OrderDetail?.shipping_address?.second_phone || "");
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (customer) {
      dispatch(
        getLoyaltyPoint(customer.id, (data) => {
          setLoyaltyPoint(data);
          setCountFinishingUpdateCustomer((prev) => prev + 1);
        }),
      );
      if (customer.shipping_addresses) {
        let shipping_addresses_index: number = customer.shipping_addresses.findIndex(
          (x) => x.default === true,
        );
        let shipping_addresses =
          shipping_addresses_index !== -1
            ? customer.shipping_addresses[shipping_addresses_index]
            : null;
        onChangeShippingAddress(shipping_addresses);
      } else onChangeShippingAddress(null);
      // if (customer.billing_addresses) {
      //   let billing_addresses_index = customer.billing_addresses.findIndex(
      //     (x) => x.default === true
      //   );
      //   onChangeBillingAddress(
      //     billing_addresses_index !== -1
      //       ? customer.billing_addresses[billing_addresses_index]
      //       : null
      //   );
      // } else onChangeBillingAddress(null);
    } else {
      setLoyaltyPoint(null);
      setCountFinishingUpdateCustomer((prev) => prev + 1);
    }
  }, [dispatch, customer]);

  useEffect(() => {
    dispatch(
      actionGetOrderReturnReasons((response) => {
        setOrderReturnReasonResponse(response);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        // let result = response.filter((single) => single.code !== PaymentMethodCode.CARD);
        // update: ko bỏ quẹt thẻ nữa
        // update bỏ momo và vn pay khi đổi trả offline
        let result = response.filter((single) => {
          if (orderReturnType === RETURN_TYPE_VALUES.offline) {
            return (
              single.code &&
              single.code !== PaymentMethodCode.MOMO &&
              single.code !== PaymentMethodCode.VN_PAY
            );
          }
          return single.code;
        });
        setListPaymentMethods(result);
      }),
    );
  }, [customer?.id, dispatch, orderReturnType]);

  useEffect(() => {
    let cash = listPaymentMethods.find((single) => single.code === PaymentMethodCode.CASH);
    if (cash && !isPaymentAlreadyChanged) {
      setPayments([
        {
          amount: Math.round(totalAmountCustomerNeedToPay),
          customer_id: customer?.id || null,
          name: cash.name,
          note: "",
          paid_amount: Math.round(totalAmountCustomerNeedToPay),
          payment_method: "Tiền mặt",
          payment_method_code: PaymentMethodCode.CASH,
          payment_method_id: cash.id,
          reference: "",
          return_amount: 0,
          source: "",
          status: "paid",
          type: "",
        },
      ]);
    }
  }, [customer?.id, isPaymentAlreadyChanged, listPaymentMethods, totalAmountCustomerNeedToPay]);

  // console.log("totalAmountCustomerNeedToPay", totalAmountCustomerNeedToPay);

  useEffect(() => {
    /**
     * lấy cấu hình bán tồn kho
     */
    dispatch(
      orderConfigSaga((data: OrderConfigResponseModel) => {
        setOrderConfig(data);
      }),
    );
  }, [dispatch]);

  /**
   * orderSettings
   */
  // useEffect(() => {
  //   setOrderSettings({
  //     chonCuaHangTruocMoiChonSanPham: true,
  //     cauHinhInNhieuLienHoaDon: 3,
  //   });
  // }, []);
  useEffect(() => {
    dispatch(
      actionListConfigurationShippingServiceAndShippingFee((response) => {
        setShippingServiceConfig(response);
        dispatch(changeShippingServiceConfigAction(response));
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((data: StoreResponse[]) => {
        setListStoreReturn(data);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    const shipmentMethodsToSelectSource = [
      ShipmentMethodOption.DELIVER_PARTNER,
      ShipmentMethodOption.SELF_DELIVER,
      ShipmentMethodOption.DELIVER_LATER,
    ];
    //isOrderFromPOS(OrderDetail) &&
    if (shipmentMethodsToSelectSource.includes(shipmentMethod)) {
      setIsShowSelectOrderSources(true);
      form.setFieldsValue({
        source_id: OrderDetail?.source_id,
      });
    } else {
      setIsShowSelectOrderSources(false);
      form.setFieldsValue({
        source_id: undefined,
      });
    }
  }, [OrderDetail, OrderDetail?.source_id, form, shipmentMethod]);

  useEffect(() => {
    if (listExchangeProducts && listExchangeProducts != null && listExchangeProducts?.length > 0) {
      let variant_id: Array<number> = [];
      listExchangeProducts.forEach((element) => variant_id.push(element.variant_id));
      dispatch(inventoryGetDetailVariantIdsExt(variant_id, null, setInventoryResponse));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, listExchangeProducts?.length]);

  useEffect(() => {
    setShipmentMethod(ShipmentMethodOption.PICK_AT_STORE);
  }, []);

  useEffect(() => {
    if (listExchangeProducts.length > 0) {
      setIsExchange(true);
    } else {
      setIsExchange(false);
    }
  }, [listExchangeProducts.length]);

  const storeIdLogin = useGetStoreIdFromLocalStorage();

  useEffect(() => {
    if (storeIdLogin) {
      dispatch(StoreDetailAction(storeIdLogin, setStoreReturn));
    }
  }, [dispatch, storeIdLogin]);

  useEffect(() => {
    if (isExchange) {
      form.setFieldsValue({
        assignee_codes: initialFormValueWithReturn.assignee_code,
      });
    }
  }, [form, initialFormValueWithReturn, isExchange]);

  useEffect(() => {
    window.addEventListener("keydown", eventKeydown);
    window.addEventListener("keydown", eventFunctional);
    return () => {
      window.removeEventListener("keydown", eventFunctional);
      window.removeEventListener("keydown", eventKeydown);
    };
  }, [eventFunctional, eventKeydown]);

  useEffect(() => {
    /**
     * đơn đổi trả online thì mặc định chưa nhận hàng
     */
    if (orderReturnType === RETURN_TYPE_VALUES.online) {
      setIsReceivedReturnProducts(false);
    } else {
      setIsReceivedReturnProducts(true);
    }
  }, [orderReturnType]);

  const checkIfWrongPath = () => {
    const checkIfOnline = () => {
      return (
        orderReturnType !== RETURN_TYPE_VALUES.online &&
        orderReturnType !== RETURN_TYPE_VALUES.offline
      );
    };
    const checkIfOffline = () => {
      return orderReturnType !== RETURN_TYPE_VALUES.offline;
    };
    if (isOrderFromPOS(OrderDetail)) {
      return checkIfOffline();
    } else {
      return checkIfOnline();
    }
  };

  if (checkIfWrongPath()) {
    return <p style={{ marginTop: 20 }}>Vui lòng kiểm tra đường dẫn!</p>;
  }

  return (
    <CreateOrderReturnContext.Provider value={createOrderReturnContextData}>
      <ContentContainer
        isError={isError}
        title="Trả hàng cho đơn hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: `${UrlConfig.HOME}`,
          },
          {
            name: isOrderFromPOS(OrderDetail)
              ? `Danh sách đơn trả hàng offline`
              : `Danh sách đơn trả hàng online`,
            path: isOrderFromPOS(OrderDetail)
              ? `${UrlConfig.OFFLINE_ORDERS}${UrlConfig.ORDERS_RETURN}`
              : `${UrlConfig.ORDER}${UrlConfig.ORDERS_RETURN}`,
          },
          {
            name: `Tạo đơn trả hàng cho đơn hàng ${orderId}`,
          },
        ]}
      >
        {!isFetchData
          ? "Loading ..."
          : isOrderFinished
          ? renderIfOrderFinished()
          : renderIfOrderNotFinished()}
      </ContentContainer>
    </CreateOrderReturnContext.Provider>
  );
};

export default ScreenReturnCreate;
