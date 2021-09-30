import { Col, Form, Row } from "antd";
import ContentContainer from "component/container/content.container";
import ModalConfirm from "component/modal/ModalConfirm";
import UrlConfig from "config/url.config";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import {
  getLoyaltyPoint,
  getLoyaltyUsage,
} from "domain/actions/loyalty/loyalty.action";
import {
  actionCreateOrderExchange,
  actionCreateOrderReturn,
  actionGetOrderReturnReasons,
} from "domain/actions/order/order-return.action";
import {
  OrderDetailAction,
  PaymentMethodGetList,
} from "domain/actions/order/order.action";
import { OrderSettingsModel } from "model/other/order/order-model";
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
  ShipmentRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
  FulFillmentResponse,
  OrderLineItemResponse,
  OrderResponse,
  OrderReturnReasonModel,
  ReturnProductModel,
  StoreCustomResponse,
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import CardShipment from "screens/order-online/component/order-detail/CardShipment";
import {
  formatCurrency,
  getAmountPaymentRequest,
  getTotalAmountAfferDiscount,
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  MoneyPayThreePls,
  OrderStatus,
  PaymentMethodCode,
  PaymentMethodOption,
  ShipmentMethodOption,
  TaxTreatment,
} from "utils/Constants";
import { RETURN_MONEY_TYPE } from "utils/Order.constants";
import { showError } from "utils/ToastUtils";
import { useQuery } from "utils/useQuery";
import UpdateCustomerCard from "../../component/update-customer-card";
import CardExchangeProducts from "../components/CardExchangeProducts";
import CardReturnMoneyPageCreate from "../components/CardReturnMoney/CardReturnMoneyPageCreate";
import CardReturnMoneyPageCreateReturn from "../components/CardReturnMoney/CardReturnMoneyPageCreate/CardReturnMoneyPageCreateReturn";
import CardReturnOrder from "../components/CardReturnOrder";
import CardReturnProducts from "../components/CardReturnProducts";
import CardReturnReceiveProducts from "../components/CardReturnReceiveProducts";
import ReturnBottomBar from "../components/ReturnBottomBar";
import OrderMoreDetails from "../components/Sidebar/OrderMoreDetails";
import OrderReturnReason from "../components/Sidebar/OrderReturnReason";
import OrderShortDetails from "../components/Sidebar/OrderShortDetails";

type PropType = {
  id?: string;
};

let typeButton = "";
let order_return_id: number = 0;

const ScreenReturnCreate = (props: PropType) => {
  const [form] = Form.useForm();
  const [isError, setError] = useState(false);
  const [isCanReturnOrExchange, setIsCanReturnOrExchange] = useState(false);
  const [isExchange, setIsExchange] = useState(false);
  const [isFetchData, setIsFetchData] = useState(false);
  const [isCanExchange, setIsCanExchange] = useState(false);
  const [isStepExchange, setIsStepExchange] = useState(false);
  const [isReceivedReturnProducts, setIsReceivedReturnProducts] =
    useState(false);
  const history = useHistory();
  const query = useQuery();
  let queryOrderID = query.get("orderID");

  let orderId = queryOrderID ? parseInt(queryOrderID) : undefined;
  const [shippingFeeCustomer, setShippingFeeCustomer] = useState<number | null>(
    null
  );

  const userReducer = useSelector(
    (state: RootReducerType) => state.userReducer
  );

  const [storeId, setStoreId] = useState<number | null>(null);

  const [discountRate, setDiscountRate] = useState<number>(0);
  const [totalAmountReturnProducts, setTotalAmountReturnProducts] = useState(0);
  const [tags, setTag] = useState<string>("");
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(
    null
  );
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);

  const dispatch = useDispatch();

  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [listReturnProducts, setListReturnProducts] = useState<
    ReturnProductModel[]
  >([]);
  const [listOrderProducts, setListOrderProducts] = useState<
    OrderLineItemResponse[]
  >([]);

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
  const [shippingFeeInformedCustomerHVC, setShippingFeeInformedCustomerHVC] =
    useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<number>(
    PaymentMethodOption.PREPAYMENT
  );
  console.log("paymentMethod", paymentMethod);
  const [listOrderReturnReason, setListOrderReturnReason] = useState<
    OrderReturnReasonModel[]
  >([]);
  const [discountValue, setDisCountValue] = useState<number>(0);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [isVisibleModalWarning, setIsVisibleModalWarning] =
    useState<boolean>(false);
  const [serviceType, setServiceType] = useState<string>();
  console.log("serviceType", serviceType);
  const [hvc, setHvc] = useState<number | null>(null);
  const [fee, setFee] = useState<number | null>(null);
  console.log("fee", fee);
  const [fulfillments] = useState<Array<FulFillmentResponse>>([]);
  const [returnMoneyType, setReturnMoneyType] = useState(
    RETURN_MONEY_TYPE.return_later
  );

  const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
    chonCuaHangTruocMoiChonSanPham: false,
    cauHinhInNhieuLienHoaDon: 1,
  });

  //loyalty
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);

  const initialForm: OrderRequest = {
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
  };

  let initialFormValueWithReturn = {
    ...initialForm,
    returnMoneyField: [
      { returnMoneyMethod: undefined, returnMoneyNote: undefined },
    ],
  };

  const getTotalPrice = (listProducts: OrderLineItemRequest[]) => {
    let total = 0;
    listProducts.forEach((a) => {
      let discountAmount = a.discount_items[0].value;
      total = total + a.quantity * (a.price - discountAmount);
    });
    return total;
  };

  const orderAmount = getTotalPrice(listExchangeProducts);

  /**
   * if return > exchange: positive
   * else negative
   */
  let totalAmountCustomerNeedToPay =
    getTotalPrice(listExchangeProducts) +
    (shippingFeeCustomer ? shippingFeeCustomer : 0) -
    totalAmountReturnProducts;

  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
    setIsFetchData(true);
    if (!data) {
      setError(true);
    } else {
      let _data = { ...data };
      _data.fulfillments = _data.fulfillments?.filter(
        (f) =>
          f.status !== FulFillmentStatus.CANCELLED &&
          f.status !== FulFillmentStatus.RETURNED &&
          f.status !== FulFillmentStatus.RETURNING
      );
      setOrderDetail(_data);
      let returnFulfillment = data.fulfillments?.find((singleFulfillment) => {
        return (
          singleFulfillment.status === FulFillmentStatus.SHIPPED ||
          singleFulfillment.status === FulFillmentStatus.UNSHIPPED
        );
      });
      if (returnFulfillment) {
        setIsCanReturnOrExchange(true);
      }
      let returnProduct: ReturnProductModel[] = _data.items.map((single) => {
        return {
          ...single,
          maxQuantity: single.quantity,
          quantity: 0,
        };
      });
      setListReturnProducts(returnProduct);
      setListOrderProducts(_data.items);
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
        setDisCountValue(totalDiscount);
        if (_data.discounts) {
          let discountRate = 0;
          _data.discounts.forEach((single) => {
            const singleDiscountRate = single.rate || 0;
            discountRate += singleDiscountRate;
          });
          setDiscountRate(discountRate);
        }
      }
    }
  }, []);

  const handleListExchangeProducts = (
    listExchangeProducts: OrderLineItemRequest[]
  ) => {
    setListExchangeProducts(listExchangeProducts);
  };

  const handleSubmitFormReturn = () => {
    let formValue = form.getFieldsValue();
    console.log("formValue", formValue);

    if (OrderDetail && listReturnProducts) {
      let items = listReturnProducts.map((single) => {
        const { maxQuantity, ...rest } = single;
        return rest;
      });
      let itemsResult = items.filter((single) => {
        return single.quantity > 0;
      });
      let payments: OrderPaymentRequest[] | null = [];
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
        reason_id: form.getFieldValue("reason_id"),
        received: isReceivedReturnProducts,
        order_returns: [],
      };
      console.log("orderDetailResult", orderDetailResult);
      dispatch(
        actionCreateOrderReturn(orderDetailResult, (response) => {
          history.push(`${UrlConfig.ORDERS_RETURN}/${response.id}`);
        })
      );
    }
  };

  const focusOnElement = (element: HTMLElement | null) => {
    if (element) {
      console.log("element", element);
      element?.focus();
      const offsetY =
        element?.getBoundingClientRect()?.top + window.pageYOffset + -200;
      window.scrollTo({ top: offsetY, behavior: "smooth" });
    }
  };

  const onReturn = () => {
    let checkIfHasReturnProduct = listReturnProducts.some((single) => {
      return single.quantity > 0;
    });
    if (!checkIfHasReturnProduct) {
      showError("Vui lòng chọn ít nhất 1 sản phẩm");
      const element: any = document.getElementById("search_product");
      focusOnElement(element);
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
        const element: any = document.getElementById(
          error.errorFields[0].name.join("")
        );
        focusOnElement(element);
      });
  };

  const handleIsStepExchange = (value: boolean) => {
    form
      .validateFields()
      .then(() => {
        let checkIfHasReturnProduct = listReturnProducts.some((single) => {
          return single.quantity > 0;
        });
        console.log("checkIfHasReturnProduct", checkIfHasReturnProduct);
        if (!checkIfHasReturnProduct) {
          showError("Vui lòng chọn ít nhất 1 sản phẩm");
          const element: any = document.getElementById("search_product");
          focusOnElement(element);
          return;
        } else {
          if (isReceivedReturnProducts) {
            setIsStepExchange(value);
            setTimeout(() => {
              const element: any = document.getElementById("store_id");
              focusOnElement(element);
            }, 500);
          } else {
            setIsVisibleModalWarning(true);
          }
        }
      })
      .catch((error) => {
        const element: any = document.getElementById(
          error.errorFields[0].name.join("")
        );
        element?.focus();
        const offsetY =
          element?.getBoundingClientRect()?.top + window.pageYOffset + -200;
        window.scrollTo({ top: offsetY, behavior: "smooth" });
      });
  };

  const onReturnAndExchange = async () => {
    form
      .validateFields()
      .then(() => {
        let checkIfHasExchangeProduct = listExchangeProducts.some((single) => {
          return single.quantity > 0;
        });
        if (listExchangeProducts.length === 0 || !checkIfHasExchangeProduct) {
          showError("Vui lòng chọn ít nhất 1 sản phẩm mua");
          const element: any = document.getElementById("search_product");
          const offsetY =
            element?.getBoundingClientRect()?.top + window.pageYOffset + -200;
          window.scrollTo({ top: offsetY, behavior: "smooth" });
          element?.focus();
          return;
        }
        if (OrderDetail && listReturnProducts) {
          let items = listReturnProducts.map((single) => {
            const { maxQuantity, ...rest } = single;
            return rest;
          });
          let itemsResult = items.filter((single) => {
            return single.quantity > 0;
          });
          let payments: OrderPaymentRequest[] | null = [];
          if (returnMoneyType === RETURN_MONEY_TYPE.return_now) {
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
            reason_id: form.getFieldValue("reason_id"),
            received: isReceivedReturnProducts,
          };

          console.log("orderDetailResult", orderDetailResult);

          let values: ExchangeRequest = form.getFieldsValue();
          let valuesResult = onFinish(values);
          if (checkPointfocus(values)) {
            if (!values.customer_id) {
              showError("Vui lòng chọn khách hàng và nhập địa chỉ giao hàng");
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
                    showError("Vui lòng chọn đối tác giao hàng");
                  } else {
                    console.log("valuesResult", valuesResult);
                    dispatch(
                      actionCreateOrderReturn(orderDetailResult, (response) => {
                        valuesResult.order_return_id = response.id;
                        dispatch(
                          actionCreateOrderExchange(
                            valuesResult,
                            createOrderExchangeCallback
                          )
                        );
                      })
                    );
                  }
                } else {
                  if (
                    shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER &&
                    !serviceType
                  ) {
                    showError("Vui lòng chọn đơn vị vận chuyển");
                  } else {
                    console.log("valuesResult", valuesResult);
                    dispatch(
                      actionCreateOrderReturn(orderDetailResult, (response) => {
                        valuesResult.order_return_id = response.id;
                        dispatch(
                          actionCreateOrderExchange(
                            valuesResult,
                            createOrderExchangeCallback
                          )
                        );
                      })
                    );
                  }
                }
              }
            }
          }
        }
      })
      .catch((error) => {
        const element: any = document.getElementById(
          error.errorFields[0].name.join("")
        );
        element?.focus();
        const offsetY =
          element?.getBoundingClientRect()?.top + window.pageYOffset + -200;
        window.scrollTo({ top: offsetY, behavior: "smooth" });
      });
  };

  const onFinish = (values: ExchangeRequest) => {
    console.log("values", values);
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount =
      getTotalAmountAfferDiscount(listExchangeProducts);

    values.fulfillments = lstFulFillment;
    values.action = OrderStatus.FINALIZED;
    values.payments = payments.filter((payment) => payment.amount > 0);
    values.total = orderAmount;
    if (
      values?.fulfillments &&
      values.fulfillments.length > 0 &&
      values.fulfillments[0].shipment
    ) {
      let priceToShipper =
        orderAmount +
        (shippingFeeCustomer ? shippingFeeCustomer : 0) -
        getAmountPaymentRequest(payments) -
        discountValue -
        (totalAmountReturnProducts ? totalAmountReturnProducts : 0);
      values.fulfillments[0].shipment.cod =
        priceToShipper > 0 ? priceToShipper : 0;
    }
    values.tags = tags;
    values.items = listExchangeProducts;
    values.discounts = lstDiscount;
    values.shipping_address = OrderDetail?.shipping_address || null;
    values.billing_address = billingAddress;
    values.customer_id = customer?.id;
    values.total_line_amount_after_line_discount =
      total_line_amount_after_line_discount;
    values.assignee_code = OrderDetail ? OrderDetail.assignee_code : null;
    values.currency = OrderDetail ? OrderDetail.currency : null;
    values.account_code = OrderDetail ? OrderDetail.account_code : null;
    values.store_id = OrderDetail ? OrderDetail.store_id : null;
    values.source_id = OrderDetail ? OrderDetail.source_id : null;
    values.order_return_id = order_return_id;
    console.log("values", values);

    return values;
  };

  const checkPointfocus = (value: any) => {
    let Pointfocus = payments.find((p) => p.code === "point");

    if (!Pointfocus) return true;

    let discount = 0;
    value.items.forEach(
      (p: any) => (discount = discount + p.discount_amount * p.quantity)
    );

    let rank = loyaltyUsageRules.find(
      (x) =>
        x.rank_id ===
        (loyaltyPoint?.loyalty_level_id === null
          ? 0
          : loyaltyPoint?.loyalty_level_id)
    );

    let curenPoint = !loyaltyPoint
      ? 0
      : loyaltyPoint.point === null
      ? 0
      : loyaltyPoint.point;
    let point = !Pointfocus
      ? 0
      : Pointfocus.point === undefined
      ? 0
      : Pointfocus.point;

    // let totalAmountPayable = totalAmountCustomerNeedToPay; //tổng tiền phải trả
    // let limitAmountPointFocus = !rank
    //   ? 0
    //   : !rank.limit_order_percent
    //   ? totalAmountPayable
    //   : (rank.limit_order_percent * totalAmountPayable) / 100;
    // //limitAmountPointFocus= Math.floor(limitAmountPointFocus/1000);//số điểm tiêu tối đa cho phép
    // limitAmountPointFocus = Math.round(limitAmountPointFocus / 1000); //số điểm tiêu tối đa cho phép

    if (!loyaltyPoint) {
      showError("Khách hàng chưa tồn tại trên hệ thống Loyalty");
      return false;
    }
    if (
      rank?.block_order_have_discount === true &&
      (discount > 0 || discountValue)
    ) {
      showError(
        "Khách hàng không được áp dụng tiêu điểm cho đơn hàng có chiết khấu"
      );
      return false;
    }

    if (point > curenPoint) {
      showError("Số điểm tiêu phải nhỏ hơn hoặc bằng số điểm hiện có");
      return false;
    }
    return true;
  };

  const createOrderExchangeCallback = useCallback(
    (value: OrderResponse) => {
      console.log("value22", value);
      history.push(`${UrlConfig.ORDER}/${value.id}`);
    },
    [history]
  );

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
          shipping_fee_informed_to_customer:
            value.shipping_fee_informed_to_customer,
          service: serviceType!,
          shipping_fee_paid_to_three_pls:
            hvc === 1 ? fee : MoneyPayThreePls.VALUE,
        };

      case ShipmentMethodOption.SELF_DELIVER:
        return {
          ...objShipment,
          delivery_service_provider_type: "Shipper",
          shipper_code: value.shipper_code,
          shipping_fee_informed_to_customer:
            value.shipping_fee_informed_to_customer,
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
          if (
            orderAmount +
              shippingFeeCustomer -
              getAmountPaymentRequest(payments) >
            0
          ) {
            newCod =
              orderAmount +
              shippingFeeCustomer -
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

  const createFulFillmentRequest = (value: OrderRequest) => {
    console.log("value111", value);
    let shipmentRequest = createShipmentRequest(value);
    console.log("shipmentRequest", shipmentRequest);
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

  const handleCancel = () => {
    history.push("/");
  };

  const renderIfCannotReturn = () => {
    return <div>Đơn hàng không thể đổi trả!</div>;
  };

  const renderIfCanReturn = () => {
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
                <UpdateCustomerCard
                  OrderDetail={OrderDetail}
                  customerDetail={customer}
                  loyaltyPoint={loyaltyPoint}
                  loyaltyUsageRules={loyaltyUsageRules}
                />
                <CardReturnOrder
                  isDetailPage={false}
                  isExchange={isExchange}
                  handleIsExchange={setIsExchange}
                  isStepExchange={isStepExchange}
                />
                <CardReturnProducts
                  discountRate={discountRate}
                  listReturnProducts={listReturnProducts}
                  handleReturnProducts={(
                    listReturnProducts: ReturnProductModel[]
                  ) => setListReturnProducts(listReturnProducts)}
                  listOrderProducts={listOrderProducts}
                  isDetailPage={false}
                  isExchange={isExchange}
                  isStepExchange={isStepExchange}
                  setTotalAmountReturnProducts={setTotalAmountReturnProducts}
                />
                {isExchange && isStepExchange && (
                  <CardExchangeProducts
                    orderSettings={orderSettings}
                    form={form}
                    items={listExchangeProducts}
                    handleCardItems={handleListExchangeProducts}
                    shippingFeeCustomer={shippingFeeCustomer}
                    amountReturn={totalAmountReturnProducts}
                    totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                  />
                )}
                {!isExchange && (
                  <CardReturnMoneyPageCreateReturn
                    listPaymentMethods={listPaymentMethods}
                    totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                    payments={payments}
                    returnMoneyType={returnMoneyType}
                    setReturnMoneyType={setReturnMoneyType}
                  />
                )}

                {isExchange && isStepExchange && (
                  <CardShipment
                    setShipmentMethodProps={setShipmentMethod}
                    shipmentMethod={shipmentMethod}
                    storeDetail={storeDetail}
                    setShippingFeeInformedCustomer={setShippingFeeCustomer}
                    setShippingFeeInformedCustomerHVC={
                      setShippingFeeInformedCustomerHVC
                    }
                    amount={orderAmount}
                    setPaymentMethod={setPaymentMethod}
                    paymentMethod={paymentMethod}
                    shippingFeeCustomer={shippingFeeCustomer}
                    shippingFeeCustomerHVC={shippingFeeInformedCustomerHVC}
                    customerInfo={customer}
                    items={listExchangeProducts}
                    discountValue={discountValue}
                    setOfficeTime={setOfficeTime}
                    officeTime={officeTime}
                    setServiceType={setServiceType}
                    setHVC={setHvc}
                    setFee={setFee}
                    payments={payments}
                    onPayments={setPayments}
                    fulfillments={fulfillments}
                    isCloneOrder={false}
                    totalAmountReturnProducts={totalAmountReturnProducts}
                  />
                  // <CardReturnShipment
                  //   setShipmentMethod={setShipmentMethod}
                  //   shipmentMethod={shipmentMethod}
                  //   storeDetail={storeDetail}
                  //   setShippingFeeInformedCustomer={setShippingFeeCustomer}
                  //   setShippingFeeInformedCustomerHVC={
                  //     setShippingFeeInformedCustomerHVC
                  //   }
                  //   amount={getTotalPrice(listExchangeProducts)}
                  //   setPaymentMethod={setPaymentMethod}
                  //   paymentMethod={paymentMethod}
                  //   shippingFeeCustomer={shippingFeeCustomer}
                  //   shippingFeeCustomerHVC={shippingFeeInformedCustomerHVC}
                  //   customerInfo={customer}
                  //   items={listExchangeProducts}
                  //   discountValue={discountValue}
                  //   setOfficeTime={setOfficeTime}
                  //   officeTime={officeTime}
                  //   setServiceType={setServiceType}
                  //   setHVC={setHvc}
                  //   setFee={setFee}
                  //   payments={payments}
                  //   onPayments={setPayments}
                  //   fulfillments={fulfillments}
                  //   isCloneOrder={false}
                  //   totalAmountReturnProducts={totalAmountReturnProducts}
                  // />
                )}
                {isExchange && (
                  <CardReturnMoneyPageCreate
                    listPaymentMethods={listPaymentMethods}
                    payments={payments}
                    handlePayments={setPayments}
                    totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
                    isExchange={isExchange}
                    isStepExchange={isStepExchange}
                    returnMoneyType={returnMoneyType}
                    setReturnMoneyType={setReturnMoneyType}
                  />
                )}
                <CardReturnReceiveProducts
                  isDetailPage={false}
                  isReceivedReturnProducts={isReceivedReturnProducts}
                  handleReceivedReturnProducts={setIsReceivedReturnProducts}
                />
              </Col>

              <Col md={6}>
                <OrderShortDetails OrderDetail={OrderDetail} />
                <OrderReturnReason
                  listOrderReturnReason={listOrderReturnReason}
                />
                <OrderMoreDetails OrderDetail={OrderDetail} />
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
          isStepExchange={isStepExchange}
          // handleIsStepExchange={setIsStepExchange}
          handleIsStepExchange={(value: boolean) => handleIsStepExchange(value)}
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
                  focusOnElement(element);
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
      </React.Fragment>
    );
  };

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
    }
  }, [dispatch, storeId]);

  useEffect(() => {
    setShippingFeeCustomer(0);
    if (orderId) {
      dispatch(OrderDetailAction(orderId, onGetDetailSuccess));
    } else {
      setError(true);
    }
  }, [dispatch, orderId, onGetDetailSuccess]);

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail?.customer_id, setCustomer));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (customer != null) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
    } else {
      setLoyaltyPoint(null);
    }
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
  }, [dispatch, customer]);

  useEffect(() => {
    if (isStepExchange && listExchangeProducts.length > 0) {
      setIsCanExchange(true);
    }
  }, [isStepExchange, listExchangeProducts.length]);

  useEffect(() => {
    dispatch(
      actionGetOrderReturnReasons((response) => {
        setListOrderReturnReason(response);
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      PaymentMethodGetList((response) => {
        let result = response.filter(
          (single) => single.code !== PaymentMethodCode.CARD
        );
        setListPaymentMethods(result);
      })
    );
  }, [dispatch]);

  /**
   * orderSettings
   */
  useEffect(() => {
    setOrderSettings({
      chonCuaHangTruocMoiChonSanPham: true,
      cauHinhInNhieuLienHoaDon: 3,
    });
  }, []);

  return (
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
        : isCanReturnOrExchange
        ? renderIfCanReturn()
        : renderIfCannotReturn()}
    </ContentContainer>
  );
};

export default ScreenReturnCreate;
