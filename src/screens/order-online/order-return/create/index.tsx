import { Card, Col, Form, FormInstance, Row } from "antd";
import ContentContainer from "component/container/content.container";
import ModalConfirm from "component/modal/ModalConfirm";
import OrderCreateProduct from "component/order/OrderCreateProduct";
import OrderCreateShipment from "component/order/OrderCreateShipment";
import CreateOrderSidebarOrderInformation from "component/order/Sidebar/CreateOrderSidebarOrderInformation";
import SidebarOrderDetailExtraInformation from "component/order/Sidebar/SidebarOrderDetailExtraInformation";
import SidebarOrderDetailInformation from "component/order/Sidebar/SidebarOrderDetailInformation";
import UrlConfig from "config/url.config";
import { CreateOrderReturnContext } from "contexts/order-return/create-order-return";
import { getListStoresSimpleAction, StoreDetailAction, StoreDetailCustomAction } from "domain/actions/core/store.action";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { inventoryGetDetailVariantIdsExt } from "domain/actions/inventory/inventory.action";
import { hideLoading } from "domain/actions/loading.action";
import { getLoyaltyPoint, getLoyaltyUsage } from "domain/actions/loyalty/loyalty.action";
import {
  actionCreateOrderExchange,
  actionCreateOrderReturn,
  actionGetOrderReturnReasons
} from "domain/actions/order/order-return.action";
import { changeOrderCustomerAction, changeSelectedStoreBankAccountAction, changeShippingServiceConfigAction, changeStoreDetailAction, getStoreBankAccountNumbersAction, orderConfigSaga, OrderDetailAction, PaymentMethodGetList, setIsShouldSetDefaultStoreBankAccountAction } from "domain/actions/order/order.action";
import { actionListConfigurationShippingServiceAndShippingFee } from "domain/actions/settings/order-settings.action";
import purify from "dompurify";
import useFetchStores from "hook/useFetchStores";
import useGetStoreIdFromLocalStorage from "hook/useGetStoreIdFromLocalStorage";
import _ from "lodash";
import { StoreResponse } from "model/core/store.model";
import { InventoryResponse } from "model/inventory";
import { thirdPLModel } from "model/order/shipment.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  BillingAddress,
  ExchangeRequest,
  FulFillmentRequest,
  OrderDiscountRequest,
  OrderLineItemRequest,
  OrderPaymentRequest,
  OrderRequest,
  ReturnRequest,
  ShipmentRequest
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  OrderLineItemResponse, OrderReasonModel, OrderResponse, ReturnProductModel,
  ShippingAddress,
  StoreCustomResponse
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { OrderConfigResponseModel, ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { useReactToPrint } from "react-to-print";
import CustomerCard from "screens/order-online/component/order-detail/CardCustomer";
import { getPrintOrderReturnContentService, getStoreBankAccountNumbersService } from "service/order/order.service";
import {

  getAmountPayment,
  getAmountPaymentRequest,
  getListItemsCanReturn,
  getTotalAmountAfterDiscount,
  getTotalOrderDiscount,
  handleFetchApiError,
  isFetchApiSuccessful,
  isOrderFromPOS,
  scrollAndFocusToDomElement,
  totalAmount
} from "utils/AppUtils";
import {
  ADMIN_ORDER,
  DEFAULT_COMPANY,
  FulFillmentStatus,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption, POS, ShipmentMethod,
  ShipmentMethodOption,
  TaxTreatment
} from "utils/Constants";
import { RETURN_MONEY_TYPE } from "utils/Order.constants";
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
let order_return_id: number = 0;

const ScreenReturnCreate = (props: PropTypes) => {
  const isUserCanCreateOrder = useRef(true);
  const printType =  {
    return: "order_return",
    returnAndExchange: "order_exchange",

  }
  const isShouldSetDefaultStoreBankAccount = useSelector(
    (state: RootReducerType) => state.orderReducer.orderStore.isShouldSetDefaultStoreBankAccount
  )	
  const [form] = Form.useForm();
  const [isError, setError] = useState(false);
  const [isOrderFinished, setIsOrderFinished] = useState(false);
  const [isExchange, setIsExchange] = useState(false);
  const [isFetchData, setIsFetchData] = useState(false);
  const [isErrorExchange, setIsErrorExchange] = useState(false);
  const [orderReturnId, setOrderReturnId] = useState<number>(0);
  const [isCanExchange, setIsCanExchange] = useState(false);
  const [isStepExchange, setIsStepExchange] = useState(false); // đang bị thừa
  const [itemGifts, setItemGift] = useState<Array<OrderLineItemRequest>>([]);
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] = useState(true);
  const history = useHistory();
  const query = useQuery();
  let queryOrderID = query.get("orderID");
  const listStores = useFetchStores();
  const [inventoryResponse, setInventoryResponse] =
  useState<Array<InventoryResponse> | null>(null);

  let orderId = queryOrderID ? parseInt(queryOrderID) : undefined;

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const [storeId, setStoreId] = useState<number | null>(null);

  // const [listStores, setListStores] = useState<Array<StoreResponse>>([]);

  const [discountRate, setDiscountRate] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [totalAmountReturnProducts, setTotalAmountReturnProducts] = useState(0);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [tags, setTag] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);

  const dispatch = useDispatch();

  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [listReturnProducts, setListReturnProducts] = useState<ReturnProductModel[]>([]);
  const [listItemCanBeReturn, setListItemCanBeReturn] = useState<OrderLineItemResponse[]>(
    []
  );

  const [listPaymentMethods, setListPaymentMethods] = useState<
    Array<PaymentMethodResponse>
  >([]);

  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);

  const [listExchangeProducts, setListExchangeProducts] = useState<
    OrderLineItemRequest[]
  >([]);

  const [shipmentMethod, setShipmentMethod] = useState<number>(
    ShipmentMethodOption.DELIVER_LATER
  );
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();

  const [isReturnAll, setIsReturnAll] = useState(true)

  const [thirdPL, setThirdPL] = useState<thirdPLModel>({
    delivery_service_provider_code: "",
    delivery_service_provider_id: null,
    insurance_fee: null,
    delivery_service_provider_name: "",
    delivery_transport_type: "",
    service: "",
    shipping_fee_paid_to_three_pls: null,
  });
  const [shippingFeeInformedToCustomer, setShippingFeeInformedToCustomer] = useState<
    number | null
  >(0);
 const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<number>(
    PaymentMethodOption.PREPAYMENT
  );
  const [orderReturnReasonResponse, setOrderReturnReasonResponse] = useState<
  OrderReasonModel|null
  >(null);
  const [isVisibleModalWarning, setIsVisibleModalWarning] = useState<boolean>(false);
  const [returnMoneyType, setReturnMoneyType] = useState(RETURN_MONEY_TYPE.return_now);

  const [moneyRefund, setMoneyRefund] = useState(0);

  // const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
  //   chonCuaHangTruocMoiChonSanPham: false,
  //   cauHinhInNhieuLienHoaDon: 1,
  // });

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);
  const [countFinishingUpdateCustomer, setCountFinishingUpdateCustomer] = useState(0);
  const [orderConfig, setOrderConfig] = useState<OrderConfigResponseModel | null>(null);

  //Store
  const [storeReturn, setStoreReturn] = useState<StoreResponse | null>(null);
  const [listStoreReturn, setListStoreReturn] = useState<StoreResponse[]>([]);

  const [coupon, setCoupon] = useState<string>("");
  const [promotion, setPromotion] = useState<OrderDiscountRequest | null>(null);

  const [isShowSelectOrderSources, setIsShowSelectOrderSources] = useState(false)

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [shippingAddressesSecondPhone, setShippingAddressesSecondPhone]= useState<string>();
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
      currency: "VNĐ",
      items: [],
      discounts: [],
      fulfillments: [],
      shipping_address: null,
      billing_address: null,
      payments: [],
      channel_id: null,
      automatic_discount: true,
    }
  }, [userReducer.account?.code])

  let listPaymentMethodsReturnToCustomer = listPaymentMethods.find((single) => {
    return single.code === PaymentMethodCode.CASH;
  });

  const initialFormValueWithReturn = useMemo(() => {
    return {
      ...initialForm,
      returnMoneyField: [
        {
          returnMoneyMethod: listPaymentMethodsReturnToCustomer?.id,
          returnMoneyNote: undefined,
        },
      ],
      account_code: OrderDetail?.account_code,
      assignee_code: OrderDetail?.assignee_code || null,
      marketer_code: OrderDetail?.marketer_code || null,
      coordinator_code: OrderDetail?.coordinator_code,
    }
  }, [OrderDetail?.account_code, OrderDetail?.assignee_code, OrderDetail?.coordinator_code, OrderDetail?.marketer_code, initialForm, listPaymentMethodsReturnToCustomer?.id])

  const getTotalPrice = (listProducts: OrderLineItemRequest[]) => {
    let total = 0;
    listProducts.forEach((a) => {
      total = total + a.line_amount_after_line_discount;
    });
    return total;
  };

  const totalAmountExchange = getTotalPrice(listExchangeProducts);

  const totalAmountExchangePlusShippingFee =
    totalAmountExchange + (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0);

  /**
   * tổng giá trị đơn hàng = giá đơn hàng + phí ship - giảm giá
   */
  const totalAmountOrder = useMemo(() => {
    return (
      orderAmount +
      (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
      (promotion?.value || 0)
    );
  }, [orderAmount, promotion?.value, shippingFeeInformedToCustomer]);

  const totalAmountPayment = getAmountPayment(payments);

  /**
   * if return > exchange: positive
   * else negative
   */
  let totalAmountCustomerNeedToPay = useMemo(() => {
    let result = totalAmountOrder - totalAmountReturnProducts;
    return result;
  }, [totalAmountOrder, totalAmountReturnProducts]);

  let totalAmountOrderAfterPayments = useMemo(() => {
    let result = totalAmountCustomerNeedToPay - totalAmountPayment;
    return result;
  }, [totalAmountCustomerNeedToPay, totalAmountPayment]);

  console.log('storeId', storeId)

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
          f.status !== FulFillmentStatus.RETURNING
      );
      setOrderDetail(_data);
      const returnCondition =
        _data.status === OrderStatus.FINISHED || _data.status === OrderStatus.COMPLETED;
      if (returnCondition) {
        setIsOrderFinished(true);
      }
      let listItemCanReturn = getListItemsCanReturn(_data);
      if (listItemCanReturn.length > 0) {
        setIsReturnAll(false);
      }
      setListItemCanBeReturn(listItemCanReturn);
      let returnProduct: ReturnProductModel[] = listItemCanReturn.map((single) => {
        return {
          ...single,
          maxQuantityCanBeReturned: single.quantity,
          quantity: 0,
          discount_items: single.discount_items.map((discount) => {
            return {
              ...discount,
              amount: 0,
            }
          })
        };
      });
      setListReturnProducts(returnProduct);
      setStoreId(_data.store_id);
      setBillingAddress(_data.billing_address);
      if (_data.tags) {
        setTag(_data.tags);
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

  const handleRecalculateOriginDiscount = (itemsResult: any) => {
    return OrderDetail?.discounts?.map(singleDiscount => {
      let value = (singleDiscount?.rate || 0) /100 * getTotalAmountAfterDiscount(itemsResult) 
      return {
        ...singleDiscount,
        value: value,
        amount: value,
      }
    }) || null
  };

  const handlePrintOrderReturnOrExchange = useCallback((orderId: number, printType: string) => {
    const orderIds = [orderId];
  
    getPrintOrderReturnContentService(orderIds, printType).then(response => {
      if (isFetchApiSuccessful(response)) {
        console.log('response', response)
        setPrintContent(response.data[0].html_content);
        handlePrint();
      } else {
        handleFetchApiError(response, "Lấy dữ liệu hóa đơn trả", dispatch)
      }
    })
   
  }, [dispatch, handlePrint]);

  const handleSubmitFormReturn = () => {
    let formValue = form.getFieldsValue();

    if (OrderDetail && listReturnProducts) {

      let items = listReturnProducts.map((single) => {
        const { maxQuantityCanBeReturned, ...rest } = single;
        return rest;
      });
      let itemsResult = items.filter((single) => {
        return single.quantity > 0;
      });
      let payments: OrderPaymentRequest[] | null = [];
      // tính toán lại discount
      let discounts = handleRecalculateOriginDiscount(itemsResult);
      if (returnMoneyType === RETURN_MONEY_TYPE.return_now) {
        const formReturnMoney = formValue.returnMoneyField[0];
        let returnMoneyMethod = listPaymentMethods.find((single) => {
          return single.id === formReturnMoney.returnMoneyMethod;
        });
        if (returnMoneyMethod) {
          payments = [
            {
              payment_method_id: returnMoneyMethod.id,
              payment_method: returnMoneyMethod.name,
              amount: Math.abs(totalAmountCustomerNeedToPay),
              reference: "",
              source: "",
              paid_amount: Math.abs(totalAmountCustomerNeedToPay),
              return_amount: 0.0,
              status: "paid",
              customer_id: customer?.id || null,
              type: "",
              note: formReturnMoney.returnMoneyNote || "",
              code: "",
            },
          ];
        }
      }
      let orderDetailResult: ReturnRequest = {
        ...OrderDetail,
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
        payments: payments,
        reason_id: orderReturnReasonResponse?.id || 0,
        reason_name: orderReturnReasonResponse?.sub_reasons.find((single) => single.id === form.getFieldValue("reason_id"))?.name || "",
        reason: form.getFieldValue("reason"),
        sub_reason_id: form.getFieldValue("sub_reason_id") || null,
        received: isReceivedReturnProducts,
        order_returns: [],
        automatic_discount: form.getFieldValue("automatic_discount"),
        discounts: discounts,
        total: totalAmountReturnProducts,
        total_discount: getTotalOrderDiscount(discounts),
        total_line_amount_after_line_discount: getTotalAmountAfterDiscount(itemsResult),
      };
      // return;
      dispatch(
        actionCreateOrderReturn(orderDetailResult, (response) => {
          setTimeout(() => {
            isUserCanCreateOrder.current = true;
          }, 1000);
          handlePrintOrderReturnOrExchange(response.id, printType.return);
          setListReturnProducts([]);
          setTimeout(() => {
            history.push(`${UrlConfig.ORDERS_RETURN}/${response.id}`);
          }, 1000);
        })
      );
    }
  };

  const checkIfHasReturnProduct = listReturnProducts.some((single) => {
    return single.quantity > 0;
  });

  const onReturn = () => {
    if (!storeReturn) {
      showError("Vui lòng chọn cửa hàng để trả!");
      const element: any = document.getElementById("selectStoreReturn");
      scrollAndFocusToDomElement(element);
      return;
    }
    if (!checkIfHasReturnProduct) {
      showError("Vui lòng chọn ít nhất 1 sản phẩm!");
      const element: any = document.getElementById("search_product");
      scrollAndFocusToDomElement(element);
      return;
    }

    form
      .validateFields()
      .then(() => {
        if (isReceivedReturnProducts) {
          handleSubmitFormReturn();
        } else {
          setIsVisibleModalWarning(true);
        }
      })
      .catch((error) => {
        const element: any = document.getElementById(error.errorFields[0].name.join(""));
        scrollAndFocusToDomElement(element);
      });
  };

  const handleDispatchReturnAndExchange = (orderDetailResult: ReturnRequest) => {
    return new Promise((resolve, reject) => {
      dispatch(
        actionCreateOrderReturn(orderDetailResult, (response) => {
          resolve(response)
        })
      );
    })
  };

  const reCalculatePaymentReturn = (payments: OrderPaymentRequest[]) => {
    // khách cần trả
    /**
     * tổng số tiền đã trả
     */
    if (totalAmountOrderAfterPayments < 0) {
      let returnAmount = Math.abs(totalAmountOrderAfterPayments);
      let _payments = _.cloneDeep(payments);
      let paymentCashIndex = _payments.findIndex(payment => payment.code === PaymentMethodCode.CASH);
      if (paymentCashIndex > -1) {
        _payments[paymentCashIndex].paid_amount = payments[paymentCashIndex].amount;
				_payments[paymentCashIndex].amount = payments[paymentCashIndex].paid_amount - returnAmount;
				_payments[paymentCashIndex].return_amount = returnAmount;
      } else {
        let newPaymentCash: OrderPaymentRequest | undefined = undefined;
        newPaymentCash = {
          code: PaymentMethodCode.CASH,
          payment_method_code: PaymentMethodCode.CASH,
          payment_method_id: listPaymentMethods.find(single => single.code === PaymentMethodCode.CASH)?.id || 0,
          amount: 0,
					paid_amount: -returnAmount,
          return_amount: 0,
          status: "",
          payment_method: listPaymentMethods.find(single => single.code === PaymentMethodCode.CASH)?.name || "",
          reference: '',
          source: '',
          customer_id: 1,
          note: '',
          type: '',
        };
        _payments.push(newPaymentCash)
      }
      return _payments;
    }
    return payments;
  };

  const checkIfNotHavePaymentsWhenReceiveAtStorePOS = () => {
    const methods = [ShipmentMethodOption.PICK_AT_STORE]
    if (totalAmountOrderAfterPayments > 0 && methods.includes(shipmentMethod) && isOrderFromPOS(OrderDetail)) {
      return true
    }
    return false
  };

  const onReturnAndExchange = async () => {
    form
      .validateFields()
      .then(() => {
        let checkIfHasExchangeProduct = listExchangeProducts.some((single) => {
          return single.quantity > 0;
        });
        if (!checkIfHasReturnProduct) {
          showError("Vui lòng chọn ít nhất 1 sản phẩm!");
          const element: any = document.getElementById("search_product");
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
          const offsetY =
            element?.getBoundingClientRect()?.top + window.pageYOffset + -200;
          window.scrollTo({ top: offsetY, behavior: "smooth" });
          element?.focus();
          return;
        }
				if (shipmentMethod !== ShipmentMethodOption.PICK_AT_STORE && !shippingAddress) {
					showError("Vui lòng cập nhật địa chỉ giao hàng!");
					const element: any = document.getElementById("customer_update_shipping_addresses_full_address");
					scrollAndFocusToDomElement(element);
					return;
				}
        if (checkIfNotHavePaymentsWhenReceiveAtStorePOS()) {
          const element: any = document.getElementsByClassName("create-order-payment")[0] as HTMLElement;
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
          let payments: OrderPaymentRequest[] | null = [];
          if (
            totalAmountCustomerNeedToPay < 0 &&
            returnMoneyType === RETURN_MONEY_TYPE.return_now
          ) {
            let formValue = form.getFieldsValue();
            const formReturnMoney = formValue.returnMoneyField[0];
            let returnMoneyMethod = listPaymentMethods.find((single) => {
              return single.id === formReturnMoney.returnMoneyMethod;
            });
            if (returnMoneyMethod) {
              payments = [
                {
                  payment_method_id: returnMoneyMethod.id,
                  payment_method: returnMoneyMethod.name,
                  amount: -Math.abs(totalAmountCustomerNeedToPay),
                  reference: "",
                  source: "",
                  paid_amount: -Math.abs(totalAmountCustomerNeedToPay),
                  return_amount: 0.0,
                  status: "paid",
                  customer_id: customer?.id || null,
                  type: "",
                  note: formReturnMoney.returnMoneyNote || "",
                  code: "",
                },
              ];
            }
          }
          let orderDetailResult: ReturnRequest = {
            ...OrderDetail,
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
            payments: payments,
            reason_id: orderReturnReasonResponse?.id || 0,
            reason_name: orderReturnReasonResponse?.sub_reasons.find((single) => single.id === form.getFieldValue("reason_id"))?.name || "",
            reason: form.getFieldValue("reason"),
            sub_reason_id: form.getFieldValue("sub_reason_id") || null,
            received: isReceivedReturnProducts,
            discounts: handleRecalculateOriginDiscount(itemsResult),
          };

          let values: ExchangeRequest = form.getFieldsValue();
          let valuesResult = onFinish(values);
          valuesResult.channel_id = !isShowSelectOrderSources ? POS.channel_id :ADMIN_ORDER.channel_id
          values.company_id = DEFAULT_COMPANY.company_id;
          values.account_code = form.getFieldValue("account_code") || OrderDetail.account_code;
          values.assignee_code = form.getFieldValue("assignee_code") || OrderDetail.assignee_code;
          values.coordinator_code = form.getFieldValue("coordinator_code") || OrderDetail.coordinator_code;
          values.marketer_code = form.getFieldValue("marketer_code") || OrderDetail.marketer_code;
          values.reference_code = form.getFieldValue("reference_code") || OrderDetail.reference_code;
          values.url = form.getFieldValue("url") || OrderDetail.url;
          if (checkPointFocus(values)) {
            const handleCreateOrderExchangeByValue = (valuesResult: ExchangeRequest) => {
              valuesResult.order_return_id = orderReturnId;
              valuesResult.payments = valuesResult.payments ? reCalculatePaymentReturn(valuesResult.payments).filter((payment) => (payment.amount !== 0 || payment.paid_amount !== 0)) : null;
              valuesResult.items = listExchangeProducts.concat(itemGifts);
              if (isErrorExchange) {
                // showWarning("Đã tạo đơn đổi hàng không thành công!");
                dispatch(
                  actionCreateOrderExchange(
                    valuesResult,
                    (data) => {
                      createOrderExchangeCallback(data, order_return_id)
                    },
                    () => {
                      setIsErrorExchange(true);
                      dispatch(hideLoading())
                    }
                  )
                );
                return;
              }
              console.log('orderDetailResult', orderDetailResult)
              handleDispatchReturnAndExchange(orderDetailResult).then((response: any) => {
                valuesResult.order_return_id = response.id;
                let lstDiscount = createDiscountRequest();
                valuesResult.discounts = lstDiscount;
                setOrderReturnId(response.id);
                console.log('valuesResult', valuesResult)
                dispatch(
                  actionCreateOrderExchange(
                    valuesResult,
                    (data => {
                      createOrderExchangeCallback(data, response.id)
                    }),
                    () => {
                      setIsErrorExchange(true);
                      dispatch(hideLoading())
                    }
                  )
                );
              })
            };
            if (!values.customer_id) {
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
                  if (valuesResult.delivery_service_provider_id === null) {
                    showError("Vui lòng chọn đối tác giao hàng!");
                  } else {
                    handleCreateOrderExchangeByValue(valuesResult);
                  }
                } else {
                  if (
                    shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER &&
                    !thirdPL.service
                  ) {
                    showError("Vui lòng chọn đơn vị vận chuyển!");
                    const element = document.getElementsByClassName("orders-shipment")[0] as HTMLElement;
                    scrollAndFocusToDomElement(element)
                  } else {
                    handleCreateOrderExchangeByValue(valuesResult);
                  }
                }
              }
            }
          }
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
  };

	const getOrderSource = (form:FormInstance<any>) => {
		let result = null;
		result = form.getFieldValue("source_id") ? form.getFieldValue("source_id") : OrderDetail ? OrderDetail.source_id : null;
		return result;
	};

  const onFinish = (values: ExchangeRequest) => {
    if(!isUserCanCreateOrder.current) {
			setTimeout(() => {
				isUserCanCreateOrder.current = true
			}, 5000);
			return values
		}
		isUserCanCreateOrder.current = false;
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount =
      getTotalAmountAfterDiscount(listExchangeProducts);
    values.fulfillments = lstFulFillment;
    values.action = OrderStatus.FINALIZED;
    if (totalAmountCustomerNeedToPay > 0) {
      values.payments = payments.filter((payment) => payment.amount > 0);
    } else {
      values.payments = [];
    }
    values.total = totalAmountExchange;
    if (
      values?.fulfillments &&
      values.fulfillments.length > 0 &&
      values.fulfillments[0].shipment
    ) {
      let priceToShipper =
        totalAmountExchange +
        (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
        getAmountPaymentRequest(payments) -
        discountValue -
        (totalAmountReturnProducts ? totalAmountReturnProducts : 0);
      values.fulfillments[0].shipment.cod = priceToShipper > 0 ? priceToShipper : 0;
    }
    values.tags = tags;
    // values.items = listExchangeProducts;
    values.discounts = lstDiscount;
    let _shippingAddressRequest:any={
			...shippingAddress,
			second_phone:shippingAddressesSecondPhone
		}
		values.shipping_address = _shippingAddressRequest;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.total_line_amount_after_line_discount = total_line_amount_after_line_discount;
    values.assignee_code = OrderDetail ? OrderDetail.assignee_code : null;
    values.currency = OrderDetail ? OrderDetail.currency : null;
    values.account_code = OrderDetail ? OrderDetail.account_code : null;
    values.source_id =OrderDetail?.source?.toLocaleLowerCase() === POS.source.toLocaleLowerCase()?getOrderSource(form):OrderDetail?.source_id;
    values.channel_id = !isShowSelectOrderSources ? POS.channel_id :ADMIN_ORDER.channel_id
    values.order_return_id = order_return_id;
    values.coordinator_code = OrderDetail ? OrderDetail.coordinator_code : null;
    values.marketer_code = OrderDetail ? OrderDetail.marketer_code : null;
    values.url = OrderDetail ? OrderDetail.url : null;
    values.reference_code = OrderDetail ? OrderDetail.reference_code : null;
    values.note = OrderDetail ? OrderDetail.note : null;
    values.customer_note = OrderDetail ? OrderDetail.customer_note : null;

    return values;
  };

  const checkPointFocus = (value: any) => {
    let pointFocus = payments.find((p) => p.code === "point");

    if (!pointFocus) return true;

    let discount = 0;
    value.items.forEach(
      (p: any) => (discount = discount + p.discount_amount * p.quantity)
    );

    let rank = loyaltyUsageRules.find(
      (x) =>
        x.rank_id ===
        (loyaltyPoint?.loyalty_level_id === null ? 0 : loyaltyPoint?.loyalty_level_id)
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

  const createOrderExchangeCallback = useCallback(
    (value: OrderResponse, order_return_id: number) => {
      setTimeout(() => {
				isUserCanCreateOrder.current = true;
			}, 1000);
      dispatch(hideLoading());
      handlePrintOrderReturnOrExchange(order_return_id, printType.returnAndExchange);
      setTimeout(() => {
        history.push(`${UrlConfig.ORDER}/${value.id}`);
      }, 1000);
    },
    [dispatch, handlePrintOrderReturnOrExchange, history, printType.returnAndExchange]
  );

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
          shipping_fee_informed_to_customer: shippingFeeInformedToCustomer,
          service: thirdPL.service,
          shipping_fee_paid_to_three_pls: thirdPL.shipping_fee_paid_to_three_pls,
        };
      
      case ShipmentMethodOption.SELF_DELIVER:
        return {
          ...objShipment,
          delivery_service_provider_type: thirdPL.delivery_service_provider_code,
          service: thirdPL.service,
          shipper_code: value.shipper_code,
          shipping_fee_informed_to_customer: shippingFeeInformedToCustomer,
          shipping_fee_paid_to_three_pls: thirdPL.shipping_fee_paid_to_three_pls,
          cod:
            totalAmountExchange +
            (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) -
            getAmountPaymentRequest(payments) -
            discountValue
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
  };

  const createFulFillmentRequest = (value: OrderRequest) => {
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
      items: listExchangeProducts,
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
  };

  const createDiscountRequest = () => {
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
      return null;
    } else {
      listDiscountRequest.push(objDiscount);
    }

    return listDiscountRequest;
  };

  const handleCancel = () => {
    history.push(`${UrlConfig.ORDER}/${orderId}`);
  };

  const handleCustomer = (_objCustomer: CustomerResponse | null) => {
    setCustomer(_objCustomer);
  };

  const onChangeShippingAddress = (_objShippingAddress: ShippingAddress | null) => {
    setShippingAddress(_objShippingAddress);
  };

  const onChangeBillingAddress = (_objBillingAddress: BillingAddress | null) => {
    setBillingAddress(_objBillingAddress);
  };

  const renderHtml = (text: string) => {
    if (text === "") {
      return "";
    }
    let result = text;
    return result;
  };

  /**
   * theme context data
   */
  const createOrderReturnContextData = {
    orderDetail: OrderDetail,
    return: {
      listItemCanBeReturn,
      listReturnProducts,
      setListReturnProducts,
      setTotalAmountReturnProducts,
      moneyRefund,
      setMoneyRefund,
      totalAmountReturnProducts,
      totalAmountExchange,
      totalAmountCustomerNeedToPay,
      setStoreReturn,
      storeReturn,
      listExchangeProducts,
    },
    isExchange,
    isStepExchange,
    listStoreReturn
  };

  const renderIfOrderNotFinished = () => {
    return <div>Đơn hàng chưa hoàn tất! Vui lòng kiểm tra lại</div>;
  };

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
                {!isShowSelectOrderSources  && (
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
                    BillingAddressChange={onChangeBillingAddress}
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
                    isAutoDefaultOrderSource= {false}
                  />
                )}
                
                <CardReturnProductContainer
                  discountRate={discountRate}
                  isDetailPage={false}
                  orderId={orderId}
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
                    totalAmountExchangePlusShippingFee
                  }}
                  orderConfig={orderConfig}
                  coupon={coupon}
                  setCoupon={setCoupon}
                  promotion={promotion}
                  setPromotion={setPromotion}
                  customer={customer}
                  loyaltyPoint={loyaltyPoint}
                  countFinishingUpdateCustomer = {countFinishingUpdateCustomer}
                  isCreateReturn
                  shipmentMethod={shipmentMethod}
                  listStores={listStores}
                />
                {!isExchange && (
                  <CardReturnMoneyPageCreateReturn
                    listPaymentMethods={listPaymentMethods}
                    totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                    returnMoneyType={returnMoneyType}
                    setReturnMoneyType={setReturnMoneyType}
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
                      totalAmountReturn: totalAmountReturnProducts
                    }}
                    shipmentMethod={shipmentMethod}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    isDisablePostPayment={isDisablePostPayment}
                  />
                )}
                {isExchange && (
                  <Card title="ĐÓNG GÓI VÀ GIAO HÀNG">
                    <OrderCreateShipment
                      shipmentMethod={isOrderFromPOS(OrderDetail) ? ShipmentMethodOption.PICK_AT_STORE : shipmentMethod}
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
                      isOrderReturnFromPOS = {isOrderFromPOS(OrderDetail)}
                    />
                  </Card>
                )}
                <CardReturnReceiveProducts
                  isDetailPage={false}
                  isReceivedReturnProducts={isReceivedReturnProducts}
                  handleReceivedReturnProducts={setIsReceivedReturnProducts}
                />
              </Col>

              <Col md={6}>
                <SidebarOrderDetailInformation OrderDetail={OrderDetail} />
                <CreateOrderSidebarOrderInformation form={form} orderDetail={OrderDetail} storeId={storeId} updateOrder isOrderReturn isExchange = {isExchange} />
                <OrderReturnReason orderReturnReasonResponse={orderReturnReasonResponse} form={form} />
                <SidebarOrderDetailExtraInformation OrderDetail={OrderDetail} />
              </Col>
            </Row>
          </Form>
        </div>
        <ReturnBottomBar
          onReturn={onReturn}
          onReturnAndExchange={() => onReturnAndExchange()}
          onCancel={() => handleCancel()}
          isCanExchange={isCanExchange}
          isExchange={isExchange}
        />
        <ModalConfirm
          onCancel={() => {
            setIsVisibleModalWarning(false);
          }}
          onOk={() => {
            if (!isExchange) {
              handleSubmitFormReturn();
            } else {
              if (isStepExchange) {
                onReturnAndExchange();
              } else {
                setIsStepExchange(true);
                setTimeout(() => {
                  const element: any = document.getElementById("store_id");
                  scrollAndFocusToDomElement(element);
                }, 500);
              }
            }
            setIsVisibleModalWarning(false);
          }}
          okText="Đồng ý"
          cancelText="Hủy"
          title={`Chưa nhận hàng trả lại, bạn có muốn tiếp tục không?`}
          subTitle=""
          visible={isVisibleModalWarning}
        />
        <div style={{display: "none"}}>
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

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, (data: StoreCustomResponse) => {
        setStoreDetail(data);
        dispatch(changeStoreDetailAction(data))
      }));
      getStoreBankAccountNumbersService({
				store_ids: [storeId]
			}).then((response) => {
				if (isFetchApiSuccessful(response)) {
					dispatch(getStoreBankAccountNumbersAction(response.data.items))
          const selected = response.data.items.find(single => single.default && single.status);
					if(isShouldSetDefaultStoreBankAccount) {
						if(selected) {
							dispatch(changeSelectedStoreBankAccountAction(selected.account_number))
						} else {
							let paymentsResult = [...payments]
							let bankPaymentIndex = paymentsResult.findIndex((payment)=>payment.payment_method_code===PaymentMethodCode.BANK_TRANSFER);
							if(bankPaymentIndex > -1) {
								paymentsResult[bankPaymentIndex].paid_amount = 0;
								paymentsResult[bankPaymentIndex].amount = 0;
								paymentsResult[bankPaymentIndex].return_amount = 0;
							}
							setPayments(paymentsResult);
							dispatch(changeSelectedStoreBankAccountAction(undefined))
						}

					}
				} else {
					dispatch(getStoreBankAccountNumbersAction([]))
					handleFetchApiError(response, "Danh sách số tài khoản ngân hàng của cửa hàng", dispatch)
				}
			}).catch((error) => {
				console.log('error', error)
			})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, storeId, isShouldSetDefaultStoreBankAccount]);

  useEffect(() => {
    dispatch(setIsShouldSetDefaultStoreBankAccountAction(true))
  }, [dispatch])

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
      dispatch(getCustomerDetailAction(OrderDetail?.customer_id, (data) => {
        setCustomer(data);
        dispatch(changeOrderCustomerAction(data));
      }));
      setShippingAddressesSecondPhone(OrderDetail?.shipping_address?.second_phone||'');
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (customer) {
      dispatch(getLoyaltyPoint(customer.id, (data) => {
				setLoyaltyPoint(data);
				setCountFinishingUpdateCustomer(prev => prev + 1);
			}));
      if (customer.shipping_addresses) {
        let shipping_addresses_index: number = customer.shipping_addresses.findIndex(x => x.default === true);
        let shipping_addresses=shipping_addresses_index !== -1 ? customer.shipping_addresses[shipping_addresses_index] : null
        onChangeShippingAddress(shipping_addresses);
      }
      else
        onChangeShippingAddress(null)
      if (customer.billing_addresses) {
        let billing_addresses_index = customer.billing_addresses.findIndex(x => x.default === true);
        onChangeBillingAddress(billing_addresses_index !== -1 ? customer.billing_addresses[billing_addresses_index] : null);
      }
      else
        onChangeBillingAddress(null)
    } else {
      setLoyaltyPoint(null);
      setCountFinishingUpdateCustomer(prev => prev + 1);
    }
  }, [dispatch, customer]);

  useEffect(() => {
    if (isStepExchange && listExchangeProducts.length > 0) {
      setIsCanExchange(true);
    }
  }, [isStepExchange, listExchangeProducts.length]);

  useEffect(() => {
    dispatch(
      actionGetOrderReturnReasons((response) => {
        setOrderReturnReasonResponse(response);
      })
    );
  }, [dispatch])

  useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch])

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        let result = response.filter((single) => single.code !== PaymentMethodCode.CARD);
        setListPaymentMethods(result);
        let cash = response.find(single => single.code === PaymentMethodCode.CASH);
        if(cash) {
          setPayments([{
            amount: 0,
            customer_id: customer?.id || null,
            name: cash.name,
            note: "",
            paid_amount: 0,
            payment_method: "Tiền mặt",
            payment_method_code: PaymentMethodCode.CASH,
            payment_method_id: cash.id,
            reference: "",
            return_amount: 0,
            source: "",
            status: "paid",
            type: "",
          }])
        }
      })
    );
    
  }, [customer?.id, dispatch]);

  useEffect(() => {
    let cash = listPaymentMethods.find(single => single.code === PaymentMethodCode.CASH);
    if(cash) {
      setPayments([{
        amount: 0,
        customer_id: customer?.id || null,
        name: cash.name,
        note: "",
        paid_amount: 0,
        payment_method: "Tiền mặt",
        payment_method_code: PaymentMethodCode.CASH,
        payment_method_id: cash.id,
        reference: "",
        return_amount: 0,
        source: "",
        status: "paid",
        type: "",
      }])
    }
  }, [customer?.id, listPaymentMethods])

  useEffect(() => {
    /**
    * lấy cấu hình bán tồn kho
    */
     dispatch(
      orderConfigSaga((data: OrderConfigResponseModel) => {
        setOrderConfig(data);
      })
    );
  }, [dispatch])
  

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
        dispatch(changeShippingServiceConfigAction(response))
			})
		);
	}, [dispatch]);

  useEffect(() => {
    dispatch(getListStoresSimpleAction((data: StoreResponse[]) => {
      setListStoreReturn(data);
    }))
  }, [dispatch])

  useEffect(() => {
    const shipmentMethodsToSelectSource = [
      ShipmentMethodOption.DELIVER_PARTNER,
      ShipmentMethodOption.SELF_DELIVER,
      ShipmentMethodOption.DELIVER_LATER,
    ]
    //isOrderFromPOS(OrderDetail) &&
    if (shipmentMethodsToSelectSource.includes(shipmentMethod)) {
      setIsShowSelectOrderSources(true);
      form.setFieldsValue({
        source_id: OrderDetail?.source_id
      })
    } else {
      setIsShowSelectOrderSources(false);
      form.setFieldsValue({
        source_id: undefined
      })
    }
  }, [OrderDetail, OrderDetail?.source_id, form, isStepExchange, shipmentMethod])

  useEffect(() => {
		if (listExchangeProducts && listExchangeProducts != null && listExchangeProducts?.length > 0) {
			let variant_id: Array<number> = [];
			listExchangeProducts.forEach((element) => variant_id.push(element.variant_id));
			dispatch(inventoryGetDetailVariantIdsExt(variant_id, null, setInventoryResponse));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch, listExchangeProducts?.length]);

  useEffect(() => {
    if(isOrderFromPOS(OrderDetail)) {
      setShipmentMethod(ShipmentMethodOption.PICK_AT_STORE)
    }
  }, [OrderDetail])
  
  useEffect(() => {
    if(listExchangeProducts.length > 0) {
      setIsExchange(true)
    } else {
      setIsExchange(false)
    }
  }, [listExchangeProducts.length])

  const storeIdLogin = useGetStoreIdFromLocalStorage()

  useEffect(() => {
    if(storeIdLogin) {
      dispatch(StoreDetailAction(storeIdLogin, setStoreReturn))
    }
  }, [dispatch, storeIdLogin])
  

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
            name: "Đơn hàng",
          },
          {
            name: "Trả hàng",
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
