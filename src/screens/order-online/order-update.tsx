import {
	Badge,
	Button,
	Card,
	Col,
	Collapse,
	Divider,
	Form,
	FormInstance,
	Input,
	Row,
	Space,
	Tag,
	Typography
} from "antd";
import calendarOutlined from "assets/icon/calendar_outline.svg";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import eyeOutline from "assets/icon/eye_outline.svg";
import storeBluecon from "assets/img/storeBlue.svg";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import OrderCreatePayments from "component/order/OrderCreatePayments";
import OrderCreateProduct from "component/order/OrderCreateProduct";
import OrderCreateShipment from "component/order/OrderCreateShipment";
import CreateOrderSidebar from "component/order/Sidebar/CreateOrderSidebar";
import { Type } from "config/type.config";
import UrlConfig from "config/url.config";
import {
	ShipperGetListAction
} from "domain/actions/account/account.action";
import { StoreDetailCustomAction } from "domain/actions/core/store.action";
import { getCustomerDetailAction } from "domain/actions/customer/customer.action";
import { inventoryGetDetailVariantIdsSaga } from "domain/actions/inventory/inventory.action";
import {
	getLoyaltyPoint,
	getLoyaltyRate,
	getLoyaltyUsage
} from "domain/actions/loyalty/loyalty.action";
import {
	configOrderSaga,
	DeliveryServicesGetList,
	getListSubStatusAction,
	getTrackingLogFulfillmentAction,
	OrderDetailAction,
	orderUpdateAction,
	PaymentMethodGetList
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { InventoryResponse } from "model/inventory";
import { modalActionType } from "model/modal/modal.model";
import { thirdPLModel } from "model/order/shipment.model";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
	BillingAddress,
	FulFillmentRequest,
	OrderDiscountRequest,
	OrderLineItemRequest,
	OrderPaymentRequest,
	OrderRequest,
	ShipmentRequest
} from "model/request/order.request";
import {
	CustomerResponse,
	ShippingAddress
} from "model/response/customer/customer.response";
import { LoyaltyPoint } from "model/response/loyalty/loyalty-points.response";
import { LoyaltyRateResponse } from "model/response/loyalty/loyalty-rate.response";
import { LoyaltyUsageResponse } from "model/response/loyalty/loyalty-usage.response";
import {
	DeliveryServiceResponse,
	FulFillmentResponse, OrderResponse,
	OrderSubStatusResponse,
	StoreCustomResponse,
	TrackingLogFulfillmentResponse
} from "model/response/order/order.response";
import { PaymentMethodResponse } from "model/response/order/paymentmethod.response";
import { OrderConfigResponseModel } from "model/response/settings/order-settings.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import {
	checkPaymentStatus,
	checkPaymentStatusToShow,
	CheckShipmentType,
	formatCurrency, getAccountCodeFromCodeAndName, getAmountPaymentRequest,
	getTotalAmountAfterDiscount,
	SumCOD,
	SumWeightResponse,
	TrackingCode
} from "utils/AppUtils";
import {
	DEFAULT_COMPANY, FulFillmentStatus, OrderStatus,
	PaymentMethodCode,
	PaymentMethodOption,
	ShipmentMethodOption,
	TaxTreatment
} from "utils/Constants";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import OrderDetailBottomBar from "./component/order-detail/BottomBar";
import CardCustomer from "./component/order-detail/CardCustomer";
// import CardProduct from "./component/order-detail/CardProduct";
import FulfillmentStatusTag from "./component/order-detail/FulfillmentStatusTag";
import PrintShippingLabel from "./component/order-detail/PrintShippingLabel";

// let typeButton = "";
type PropType = {
  id?: string;
  isCloneOrder?: boolean;
};
type OrderParam = {
  id: string;
};
export default function Order(props: PropType) {
  const dispatch = useDispatch();
  const history = useHistory();
  let {id} = useParams<OrderParam>();
  const [customer, setCustomer] = useState<CustomerResponse | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [items, setItems] = useState<Array<OrderLineItemRequest>>([]);
  const [itemGifts, setItemGifts] = useState<Array<OrderLineItemRequest>>([]);
  const [orderAmount, setOrderAmount] = useState<number>(0);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [storeId, setStoreId] = useState<number | null>(null);
  const [orderSourceId, setOrderSourceId] = useState<number | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [shipmentMethod, setShipmentMethod] = useState<number>(
    ShipmentMethodOption.DELIVER_LATER
  );
  const [paymentMethod, setPaymentMethod] = useState<number>(
    PaymentMethodOption.POSTPAYMENT
  );
  const [updating, setUpdating] = useState(false);
  const [loyaltyPoint, setLoyaltyPoint] = useState<LoyaltyPoint | null>(null);
  const [loyaltyUsageRules, setLoyaltyUsageRuless] = useState<
    Array<LoyaltyUsageResponse>
  >([]);
  const [shippingFeeInformedToCustomer, setShippingFeeInformedToCustomer] = useState<number | null>(null);
  const [listPaymentMethod, setListPaymentMethod] = useState<
  Array<PaymentMethodResponse>
>([]);
  // const [shippingFeeInformedToCustomerHVC, setShippingFeeCustomerHVC] = useState<number | null>(
  //   null
  // );
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [fulfillments, setFulfillments] = useState<Array<FulFillmentResponse>>([]);
  const [tags, setTag] = useState<string>("");
  const formRef = createRef<FormInstance>();
  const [form] = Form.useForm();
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [officeTime, setOfficeTime] = useState<boolean>(false);
  const [deliveryServices, setDeliveryServices] = useState<DeliveryServiceResponse[]>([]);
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const [orderSettings, setOrderSettings] = useState<OrderSettingsModel>({
    chonCuaHangTruocMoiChonSanPham: false,
    cauHinhInNhieuLienHoaDon: 1,
  });

  const [inventoryResponse, setInventoryResponse] =
    useState<Array<InventoryResponse> | null>(null);
  const [configOrder, setConfigOrder] = useState<OrderConfigResponseModel | null>(null);

  const [isVisibleCustomer, setVisibleCustomer] = useState(true);
  const [modalAction, setModalAction] = useState<modalActionType>("edit");

  const handleCustomer = (_objCustomer: CustomerResponse | null) => {
    setCustomer(_objCustomer);
  };
  const onChangeShippingAddress = (_objShippingAddress: ShippingAddress | null) => {
    setShippingAddress(_objShippingAddress);
  };

  const onChangeBillingAddress = (_objBillingAddress: BillingAddress | null) => {
    setBillingAddress(_objBillingAddress);
  };

  const [listOrderSubStatus, setListOrderSubStatus] = useState<OrderSubStatusResponse[]>(
    []
  );

  const [coupon, setCoupon] = useState<string>("");
  const [promotion, setPromotion] = useState<OrderDiscountRequest | null>(null);

  const onChangeInfoProduct = (
    _items: Array<OrderLineItemRequest>,
    amount: number,
    discount_rate: number,
    discount_value: number
  ) => {
    // console.log("itemmm", _items);

    setItems(_items);
    setDiscountRate(discount_rate);
    setDiscountValue(discount_value);
    setOrderAmount(amount);
  };

  // const onStoreSelect = (storeId: number) => {
  //   setStoreId(storeId);
  // };

  const [isLoadForm, setIsLoadForm] = useState(false);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);

  const stepsStatus = () => {
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
      if (OrderDetail.fulfillments === undefined || OrderDetail.fulfillments === null) {
        return OrderStatus.FINALIZED;
      } else {
        if (
          OrderDetail.fulfillments !== undefined &&
          OrderDetail.fulfillments !== null &&
          OrderDetail.fulfillments.length > 0
        ) {
          if (OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED) {
            return OrderStatus.FINALIZED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.PICKED) {
            return FulFillmentStatus.PICKED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.PACKED) {
            return FulFillmentStatus.PACKED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.SHIPPING) {
            return FulFillmentStatus.SHIPPING;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.SHIPPED) {
            return FulFillmentStatus.SHIPPED;
          }
        }
      }
    } else if (OrderDetail?.status === OrderStatus.FINISHED) {
      return FulFillmentStatus.SHIPPED;
    }
    return "";
  };

  let stepsStatusValue = stepsStatus();

  const setLevelOrder = useCallback(() => {
    // console.log("OrderDetail 111", OrderDetail);
    switch (OrderDetail?.status) {
      case OrderStatus.DRAFT:
        return 1;
      case OrderStatus.CANCELLED:
        return 5;
      case OrderStatus.FINISHED:
        return 5;
      case OrderStatus.FINALIZED:
        if (
          OrderDetail.fulfillments === undefined ||
          OrderDetail.fulfillments === null ||
          !OrderDetail.fulfillments.length ||
          OrderDetail.fulfillments[0].shipment === null
        ) {
          if (!OrderDetail.payment_status || OrderDetail.payment_status === "unpaid") {
            return 2;
          } else {
            return 3;
          }
        } else {
          if (
            OrderDetail.fulfillments[0].status === FulFillmentStatus.RETURNED
            || OrderDetail.fulfillments[0].status === FulFillmentStatus.CANCELLED
            || OrderDetail.fulfillments[0].status === FulFillmentStatus.RETURNING
            // || OrderDetail.fulfillments[0].status === FulFillmentStatus.UNSHIPPED
          ) {
            // return 1
            if (!OrderDetail.payment_status || OrderDetail.payment_status === "unpaid") {
              return 2;
            } else {
              return 3;
            }
          }
          return 4;
        }
      default:
        return undefined;
    }
  }, [OrderDetail]);
  let levelOrder = setLevelOrder();
  // console.log("levelOrder", levelOrder);

  let initialRequest: OrderRequest = {
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
    currency: "VNĐ",
    items: [],
    discounts: [],
    fulfillments: [],
    shipping_address: null,
    billing_address: null,
    payments: [],
    channel_id: null,
    finalized: false,
		automatic_discount: true,
  };
  const [initialForm, setInitialForm] = useState<OrderRequest>({
    ...initialRequest,
  });

	console.log('setInitialForm', setInitialForm)

  const onChangeTag = useCallback(
    (value: []) => {
      const strTag = value.join(", ");
      setTag(strTag);
    },
    [setTag]
  );

  const getImageDeliveryService = useCallback(
    (service_code) => {
      const service = deliveryServices.find((item) => item.code === service_code);
      return service?.logo;
    },
    [deliveryServices]
  );

  const copyOrderID = (e: any, data: string | null) => {
    e.stopPropagation();
    e.target.style.width = "26px";
    const decWidth = setTimeout(() => {
      e.target.style.width = "23px";
    }, 100);
    clearTimeout(decWidth);
    navigator.clipboard.writeText(data ? data : "").then(() => {});
  };
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
    if (OrderDetail?.fulfillments && OrderDetail?.fulfillments.length) {
      request.id = OrderDetail?.fulfillments[0].id;
    }
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
          if (orderAmount + shippingFeeInformedToCustomer - getAmountPaymentRequest(payments) > 0) {
            newCod =
              orderAmount + shippingFeeInformedToCustomer - getAmountPaymentRequest(payments);
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

  const shipping_requirements = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.shipping_requirement
  );
  const [requirementNameView, setRequirementNameView] = useState<string | null>(null);

  const getRequirementName = useCallback(() => {
    if (
      OrderDetail &&
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0
    ) {
      let requirement = OrderDetail?.fulfillments[0].shipment?.requirements?.toString();
      const reqObj = shipping_requirements?.find((r) => r.value === requirement);
      setRequirementNameView(reqObj ? reqObj?.name : "");
    }
  }, [OrderDetail, shipping_requirements]);

  useEffect(() => {
    getRequirementName();
  }, [getRequirementName]);

  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  useEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setDeliveryServices(response);
      })
    );
  }, [dispatch]);

  const [trackingLogFulfillment, setTrackingLogFulfillment] =
    useState<Array<TrackingLogFulfillmentResponse> | null>(null);

  useEffect(() => {
    if (TrackingCode(OrderDetail) !== "Đang xử lý") {
      if (
        OrderDetail &&
        OrderDetail.fulfillments &&
        OrderDetail.fulfillments.length > 0 &&
        OrderDetail.fulfillments[0].code
      ) {
        dispatch(
          getTrackingLogFulfillmentAction(
            OrderDetail.fulfillments[0].code,
            setTrackingLogFulfillment
          )
        );
      }
    }
    if (OrderDetail?.status) {
      let resultStatus = OrderDetail.status;
      if (OrderDetail.status === OrderStatus.FINALIZED && OrderDetail.fulfillments && OrderDetail.fulfillments.length > 0) {
        switch (OrderDetail.fulfillments[0].status) {
          case 'packed':
            resultStatus = 'packed';
            break;
          case 'shipping':
            resultStatus = 'shipping';
            break;
          default:
            break;
        }
        
      }
      dispatch(
        getListSubStatusAction(resultStatus, (data: OrderSubStatusResponse[]) => {
          setListOrderSubStatus(data);
        })
      );
    }
  }, [dispatch, OrderDetail]); //logne

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

  const updateOrderCallback = useCallback(
    (value: OrderResponse) => {
      setUpdating(false);
      showSuccess("Đơn được cập nhật thành công");
      history.push(`${UrlConfig.ORDER}/${value.id}`);
    },
    [history]
  );
  const updateAndConfirmOrderCallback = useCallback(
    (value: OrderResponse) => {
      setUpdatingConfirm(false);
      showSuccess("Đơn được cập nhật và xác nhận thành công");
      history.push(`${UrlConfig.ORDER}/${value.id}`);
    },
    [history]
  );
  // type  = update and confirm
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const [updatingConfirm, setUpdatingConfirm] = useState<boolean>(false);

  const handleTypeButton = (type: string) => {
    if (type === OrderStatus.FINALIZED) {
      setIsFinalized(true)
    }
  };
 

  const onFinish = (values: OrderRequest) => {
    if (!OrderDetail) return;
		values.assignee_code = getAccountCodeFromCodeAndName(values.assignee_code);
		values.marketer_code = getAccountCodeFromCodeAndName(values.marketer_code);
		values.coordinator_code = getAccountCodeFromCodeAndName(values.coordinator_code);
    const element2: any = document.getElementById("save-and-confirm");
    element2.disable = true;
    let lstFulFillment = createFulFillmentRequest(values);
    let lstDiscount = createDiscountRequest();
    let total_line_amount_after_line_discount = getTotalAmountAfterDiscount(items);

    //Nếu là lưu nháp Fulfillment = [], payment = []

    //Nếu là đơn lưu và duyệt
    values.shipping_fee_informed_to_customer = shippingFeeInformedToCustomer;
    values.fulfillments = lstFulFillment;
    values.action = OrderStatus.FINALIZED;
    values.payments = payments.filter((payment) => payment.amount > 0);
    values.total = orderAmount;
    values.finalized = isFinalized
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
    values.channel_id = OrderDetail.channel_id;
    values.company_id = DEFAULT_COMPANY.company_id;
    // console.log("onFinish onFinish", values);
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
            if (!isFinalized) {
              setUpdating(true);
            } else {
              setUpdatingConfirm(true);
            }
            (async () => {
              try {
                dispatch(
                  orderUpdateAction(OrderDetail.id, values, isFinalized ? updateAndConfirmOrderCallback : updateOrderCallback, () =>
                  isFinalized ? setUpdatingConfirm(false) : setUpdating(false)
                  )
                );
              } catch {
                isFinalized ? setUpdatingConfirm(false) : setUpdating(false)
              }
            })();
            // dispatch(orderUpdateAction(id, values, createOrderCallback));
          }
        } else {
          if (
            shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER &&
            !thirdPL.service
          ) {
            showError("Vui lòng chọn đơn vị vận chuyển");
          } else {
            if (checkInventory()) {
              let bolCheckPointfocus = checkPointfocus(values);
              if (bolCheckPointfocus) {
                if (!isFinalized) {
                  setUpdating(true);
                } else {
                  setUpdatingConfirm(true);
                }
                
                (async () => {
                  try {
                    dispatch(
                      orderUpdateAction(OrderDetail.id, values, isFinalized ? updateAndConfirmOrderCallback : updateOrderCallback, () =>
                        isFinalized ? setUpdatingConfirm(false) : setUpdating(false)
                      )
                    );
                  } catch {
                    isFinalized ? setUpdatingConfirm(false) : setUpdating(false);
                  }
                })();
                // dispatch(orderUpdateAction(id, values, createOrderCallback));
              }
            }
          }
        }
      }
    }
  };
  const scroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);
  const [isDisablePostPayment, setIsDisablePostPayment] = useState(false);
  // console.log(setIsDisablePostPayment);
  // console.log("isDisablePostPayment", isDisablePostPayment);

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

  // const [totalPaid, setTotalPaid] = useState(0);
  // console.log("totalPaid", totalPaid);
  // console.log("setTotalPaid", setTotalPaid);

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

    /**
   * số tiền khách cần trả: nếu âm thì là số tiền trả lại khách
   */
     const totalAmountCustomerNeedToPay = useMemo(() => {
      return totalAmountOrder - totalAmountPayment;
    }, [totalAmountOrder, totalAmountPayment]);

  // const onPayments = (value: Array<OrderPaymentRequest>) => {
  //   setPayments(value);
  //   let total = 0;
  //   value.forEach((p) => (total = total + p.amount));
  //   setTotalPaid(total);
  // };
  useEffect(() => {
    dispatch(getLoyaltyUsage(setLoyaltyUsageRuless));
    dispatch(getLoyaltyRate(setLoyaltyRate));
  }, [dispatch]);

  const [loyaltyRate, setLoyaltyRate] = useState<LoyaltyRateResponse>();
  // console.log("loyaltyRate", loyaltyRate);
  const [thirdPL, setThirdPL] = useState<thirdPLModel>({
    delivery_service_provider_code: "",
    delivery_service_provider_id: null,
    insurance_fee: null,
    delivery_service_provider_name: "",
    delivery_transport_type: "",
    service: "",
    shipping_fee_paid_to_three_pls: null,
  });

  // const handleCardItems = (cardItems: Array<OrderLineItemRequest>) => {
  //   setItems(cardItems);
  // };

  const updateCancelClick = useCallback(() => {
    history.push(`${UrlConfig.ORDER}/${id}`);
  }, [history, id]);

  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  // console.log("storeDetail", storeDetail);

  const ChangeShippingFeeCustomer = (value: number | null) => {
    formRef.current?.setFieldsValue({shipping_fee_informed_to_customer: value});
    setShippingFeeInformedToCustomer(value);
  };

  useEffect(() => {
    if (storeId != null) {
      dispatch(StoreDetailCustomAction(storeId, setStoreDetail));
    }
  }, [dispatch, storeId]);

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

  /**
   * orderSettings
   */
  useEffect(() => {
    setOrderSettings({
      chonCuaHangTruocMoiChonSanPham: true,
      cauHinhInNhieuLienHoaDon: 3,
    });
  }, []);

  const fetchData = () =>  {
    dispatch(
      OrderDetailAction(id, async (res) => {
        const response = {
          ...res,
          // ffm des id
          fulfillments: res.fulfillments?.sort((a, b) => b.id - a.id),
        };
        const {customer_id} = response;
        setOrderDetail(response);
        if (customer_id) {
          dispatch(
            getCustomerDetailAction(customer_id, (responseCustomer) => {
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
                discount_items: item.discount_items,
                discount_rate: item.discount_rate,
                discount_value: item.discount_value,
                discount_amount: item.discount_amount,
                position: item.position,
                gifts: giftResponse,
                available: item.available,
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
            if (response.fulfillments[0].shipment?.cod) {
              // setPaymentMethod(PaymentMethodOption.COD);
            } else if (response.payments && response.payments?.length > 0) {
              setPaymentMethod(PaymentMethodOption.PREPAYMENT);
              new_payments = response.payments;
              setPayments(new_payments);
            }
          }

          setItems(responseItems);
          setOrderAmount(
            response.total_line_amount_after_line_discount - (response.shipping_fee_informed_to_customer || 0)
          );
					form.setFieldsValue({
						...initialForm,
            customer_note: response.customer_note,
            source_id: response.source_id,
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
						coordinator_code: response.coordinator_code ? response.coordinator_code :null,
            sub_status_code: response.sub_status_code,
						automatic_discount: response.automatic_discount,
					});
          let newShipmentMethod = ShipmentMethodOption.DELIVER_LATER;
          if (
            response.fulfillments &&
            response.fulfillments[0] &&
            response?.fulfillments[0]?.shipment?.delivery_service_provider_type
          ) {
            setShipmentMethod(newShipmentMethod);
            const newFulfillments = [...response.fulfillments];
            setFulfillments(newFulfillments.reverse());
            setShippingFeeInformedToCustomer(response.shipping_fee_informed_to_customer);

            if (
              response.fulfillments[0] &&
              response.fulfillments[0]?.shipment?.office_time
            ) {
              setOfficeTime(true);
            }
          }
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
          setIsLoadForm(true);
          if(response?.discounts && response.discounts[0]?.discount_code) {
            setCoupon(response.discounts[0].discount_code)
          }
					if(response?.discounts) {
            setPromotion({
							promotion_id: response.discounts[0]?.promotion_id,
							value: response.discounts[0]?.value,
							amount: response.discounts[0]?.amount,
							rate: response.discounts[0]?.rate,
						})
          }
        }
      })
    );
  };
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, dispatch]);

  useEffect(() => {
    if (customer) {
      dispatch(getLoyaltyPoint(customer.id, setLoyaltyPoint));
      let shippingAddressItem = customer.shipping_addresses.find(
        (p: any) => p.default === true
      );
      if (shippingAddressItem) onChangeShippingAddress(shippingAddressItem);
    } else {
      setLoyaltyPoint(null);
      onChangeShippingAddress(null);
    }
  }, [dispatch, customer]);

  const checkPointfocus = useCallback(
    (value: any) => {
      let Pointfocus = payments.find((p) => p.code === "point");

      if (!Pointfocus) return true;

      let discount = 0;
      value.items.forEach((p: any) => (discount = discount + p.discount_amount));

      let rank = loyaltyUsageRules.find(
        (x) =>
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
        orderAmount + (shippingFeeInformedToCustomer ? shippingFeeInformedToCustomer : 0) - discountValue; //tổng tiền phải trả
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
      if (rank?.block_order_have_discount === true && (discount > 0 || discountValue)) {
        showError("Khách hàng không được áp dụng tiêu điểm cho đơn hàng có chiết khấu");
        return false;
      }

      if (point > limitAmountPointFocus) {
        showError(`Số điểm tiêu tối đa là ${formatCurrency(limitAmountPointFocus)}`);
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
          //showError(`${value.name} không còn đủ số lượng tồn trong kho`);
        }
      });
      if(!status) showError(`Không thể bán sản phẩm đã hết hàng trong kho`);
    }
    
    return status;
  };

  useEffect(() => {
    formRef.current?.resetFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (items && items != null) {
      let variant_id: Array<number> = [];
      items.forEach((element) => variant_id.push(element.variant_id));
      dispatch(inventoryGetDetailVariantIdsSaga(variant_id, null, setInventoryResponse));
    }
  }, [dispatch, items]);

  const checkIfOrderCanBeSplit = useMemo(() => {
    // có tách đơn, có shipment trong fulfillments, trường hợp giao hàng sau vẫn có fulfillment mà ko có shipment
    if (OrderDetail?.linked_order_code || (OrderDetail?.fulfillments && OrderDetail.fulfillments.find((single) => single.shipment))) {
      return false;
    }
    if (OrderDetail?.items.length === 1 && OrderDetail.items[0].quantity === 1) {
      return false;
    }
    return true;
  }, [OrderDetail?.fulfillments, OrderDetail?.items, OrderDetail?.linked_order_code]);

  // console.log(inventoryResponse)

  useEffect(() => {
    dispatch(
      configOrderSaga((data) => {
        setConfigOrder(data);
      })
    );
  }, [dispatch]);

  // const setStoreForm = useCallback(
  //   (id: number | null) => {
  //     formRef.current?.setFieldsValue({store_id: id});
  //   },
  //   [formRef]
  // );

  return (
    <React.Fragment>
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
        extra={<CreateBillStep  orderDetail={OrderDetail} status={stepsStatusValue} />}
      >
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
                element?.focus();
                const y =
                  element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
                window.scrollTo({top: y, behavior: "smooth"});
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
                    BillingAddressChange={onChangeBillingAddress}
                    levelOrder={levelOrder}
                    updateOrder={true}
                    isVisibleCustomer={isVisibleCustomer}
                    setVisibleCustomer={setVisibleCustomer}
                    shippingAddress={shippingAddress}
                    modalAction={modalAction}
                    setModalAction={setModalAction}
                    setOrderSourceId={setOrderSourceId}
                  />
                  {/* <CardProduct
                    orderId={id}
                    changeInfo={onChangeInfoProduct}
                    selectStore={onStoreSelect}
                    storeId={storeId}
                    shippingFeeInformedToCustomer={shippingFeeInformedToCustomer}
                    setItemGift={setItemGifts}
                    formRef={formRef}
                    items={items}
                    handleCardItems={handleCardItems}
                    isCloneOrder={true}
                    discountRate={discountRate}
                    setDiscountRate={setDiscountRate}
                    discountValue={discountValue}
                    setDiscountValue={setDiscountValue}
                    inventoryResponse={inventoryResponse}
                    setInventoryResponse={setInventoryResponse}
                    setStoreForm={setStoreForm}
                    levelOrder={levelOrder}
                    updateOrder={true}
                    isSplitOrder={checkIfOrderCanBeSplit}
                    orderDetail={OrderDetail}
                    fetchData={fetchData}
                    orderConfig={configOrder}
                  /> */}
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
                    isSplitOrder={checkIfOrderCanBeSplit}
                    setItems={setItems}
                    inventoryResponse={inventoryResponse}
                    customer={customer}
                    setInventoryResponse={setInventoryResponse}
                    totalAmountCustomerNeedToPay={totalAmountOrder}
                    orderConfig={null}
                    orderSourceId={orderSourceId}
                    levelOrder={levelOrder}
                    coupon={coupon}
                    setCoupon={setCoupon}
										promotion={promotion}
										setPromotion={setPromotion}
                    orderDetail={OrderDetail}
                    configOrder={configOrder}
                    loyaltyPoint={loyaltyPoint}
                  />

                  {OrderDetail !== null &&
                    OrderDetail?.payments &&
                    OrderDetail?.payments?.length > 0 && (
                      <Card
                        className="margin-top-20"
                        title={
                          <Space>
                            <div className="d-flex">
                              <span className="title-card">THANH TOÁN</span>
                            </div>
                            {checkPaymentStatus(OrderDetail.payments, totalAmountOrder) === -1 && (
                              <Tag className="orders-tag orders-tag-default">
                                Chưa thanh toán
                              </Tag>
                            )}
                            {checkPaymentStatus(OrderDetail.payments, totalAmountOrder) === 0 && (
                              <Tag className="orders-tag orders-tag-warning">
                                Thanh toán 1 phần
                              </Tag>
                            )}
                            {checkPaymentStatus(OrderDetail.payments, totalAmountOrder) === 1 && (
                              <Tag
                                className="orders-tag orders-tag-success"
                                style={{
                                  backgroundColor: "rgba(39, 174, 96, 0.1)",
                                  color: "#27AE60",
                                }}
                              >
                                Đã thanh toán
                              </Tag>
                            )}
                          </Space>
                        }
                      >
                        <div style={{marginBottom: 20}}>
                          <Row>
                            <Col span={12}>
                              <span className="text-field margin-right-40">
                                Đã thanh toán:
                              </span>
                              <b>
                                {(OrderDetail?.fulfillments &&
                                  OrderDetail?.fulfillments.length > 0 &&
                                  OrderDetail?.fulfillments[0].status === "shipped" &&
                                  formatCurrency(totalAmountCustomerNeedToPay)) ||
                                  formatCurrency(getAmountPayment(OrderDetail.payments))}
                              </b>
                            </Col>
                            <Col span={12}>
                              <span className="text-field margin-right-40">
                                {totalAmountCustomerNeedToPay >= 0
                                  ? `Còn phải trả:`
                                  : `Hoàn tiền cho khách:`}
                              </span>
                              <b style={{color: "red"}}>
                                {OrderDetail?.fulfillments &&
                                OrderDetail?.fulfillments.length > 0 &&
                                OrderDetail?.fulfillments[0].status !== "returned" &&
                                OrderDetail?.fulfillments[0].shipment?.cod
                                  ? 0
                                  : formatCurrency(
                                      Math.abs(totalAmountCustomerNeedToPay)
                                    )}
                              </b>
                            </Col>
                          </Row>
                        </div>
                        {OrderDetail?.payments && (
                          <div>
                            <div style={{padding: "0 24px 24px 24px"}}>
                              <Collapse
                                className="orders-timeline"
                                defaultActiveKey={["100"]}
                                ghost
                              >
                                {OrderDetail.total === SumCOD(OrderDetail) &&
                                OrderDetail.total === OrderDetail.total_paid ? (
                                  ""
                                ) : (
                                  <>
                                    {OrderDetail?.payments
                                      .filter((payment) => {
                                        // nếu là đơn trả thì tính cả cod
                                        if (OrderDetail.order_return_origin) {
                                          return true;
                                        }
                                        return (
                                          payment.payment_method !== "cod" &&
                                          payment.amount
                                        );
                                      })
                                      .map((payment: any, index: number) => (
                                        <Collapse.Panel
                                          showArrow={false}
                                          className="orders-timeline-custom success-collapse"
                                          header={
                                            <div className="orderPaymentItem">
                                              <div className="orderPaymentItem__left">
                                                <div>
                                                  {/* <b>{payment.payment_method}</b> */}
                                                  {/* trường hợp số tiền âm là hoàn lại tiền */}
                                                  <b>
                                                    {payment.paid_amount < 0
                                                      ? "Hoàn tiền cho khách"
                                                      : payment.payment_method}
                                                  </b>
                                                  <span>{payment.reference}</span>
                                                  {payment.payment_method_id === 5 && (
                                                    <span style={{marginLeft: 10}}>
                                                      {payment.amount / 1000} điểm
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="amount">
                                                  {formatCurrency(
                                                    Math.abs(payment.paid_amount)
                                                  )}
                                                </span>
                                              </div>
                                              <div className="orderPaymentItem__right">
                                                <span className="date">
                                                  {ConvertUtcToLocalDate(
                                                    payment.created_date,
                                                    "DD/MM/YYYY HH:mm"
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          }
                                          key={index}
                                        ></Collapse.Panel>
                                      ))}
                                  </>
                                )}

                                {OrderDetail?.fulfillments &&
                                  OrderDetail?.fulfillments.length > 0 &&
                                  OrderDetail?.fulfillments[0].shipment &&
                                  OrderDetail?.fulfillments[0].status !==
                                    FulFillmentStatus.RETURNED &&
                                  OrderDetail?.fulfillments[0].shipment.cod && (
                                    <Collapse.Panel
                                      className={
                                        OrderDetail?.fulfillments[0].status !== "shipped"
                                          ? "orders-timeline-custom orders-dot-status"
                                          : "orders-timeline-custom "
                                      }
                                      showArrow={false}
                                      header={
                                        <>
                                          <div className="orderPaymentItem">
                                            <div className="orderPaymentItem__left">
                                              <b>
                                                COD
                                                {OrderDetail.fulfillments[0].status !==
                                                "shipped" ? (
                                                  <Tag
                                                    className="orders-tag orders-tag-warning"
                                                    style={{marginLeft: 10}}
                                                  >
                                                    Đang chờ thu
                                                  </Tag>
                                                ) : (
                                                  <Tag
                                                    className="orders-tag orders-tag-success"
                                                    style={{
                                                      backgroundColor:
                                                        "rgba(39, 174, 96, 0.1)",
                                                      color: "#27AE60",
                                                      marginLeft: 10,
                                                    }}
                                                  >
                                                    Đã thu COD
                                                  </Tag>
                                                )}
                                              </b>
                                              <span className="amount">
                                                {OrderDetail !== null &&
                                                OrderDetail?.fulfillments
                                                  ? formatCurrency(
                                                      OrderDetail.fulfillments[0].shipment
                                                        ?.cod
                                                    )
                                                  : 0}
                                              </span>
                                            </div>
                                            <div className="orderPaymentItem__right">
                                              {OrderDetail?.fulfillments[0].status ===
                                                "shipped" && (
                                                <div>
                                                  <span className="date">
                                                    {ConvertUtcToLocalDate(
                                                      OrderDetail?.updated_date,
                                                      "DD/MM/YYYY HH:mm"
                                                    )}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </>
                                      }
                                      key="100"
                                    ></Collapse.Panel>
                                  )}
                              </Collapse>
                            </div>{" "}
                          </div>
                        )}
                      </Card>
                    )}
                  {/* COD toàn phần */}
                  {OrderDetail &&
                    OrderDetail.fulfillments &&
                    OrderDetail.fulfillments.length > 0 &&
                    OrderDetail.fulfillments[0].shipment &&
                    // OrderDetail.fulfillments[0].status !== "cancelled" &&
                    !(OrderDetail.fulfillments[0].status === "cancelled" ||
                    OrderDetail.fulfillments[0].status === "returning" ||
                    OrderDetail.fulfillments[0].status === "returned") &&
                    OrderDetail.fulfillments[0].shipment?.cod ===
                      (OrderDetail?.fulfillments[0].shipment
                        .shipping_fee_informed_to_customer
                        ? OrderDetail?.fulfillments[0].shipment
                            .shipping_fee_informed_to_customer
                        : 0) +
                        OrderDetail?.total_line_amount_after_line_discount -
                        (OrderDetail?.discounts &&
                        OrderDetail?.discounts.length > 0 &&
                        OrderDetail?.discounts[0].amount
                          ? OrderDetail?.discounts[0].amount
                          : 0) &&
                    checkPaymentStatusToShow(OrderDetail) !== 1 && (
                      <Card
                        className="margin-top-20"
                        title={
                          <Space>
                            <div className="d-flex">
                              <span className="title-card">THANH TOÁN</span>
                            </div>
                            {checkPaymentStatusToShow(OrderDetail) === 1 && (
                              <Tag
                                className="orders-tag orders-tag-success"
                                style={{
                                  backgroundColor: "rgba(39, 174, 96, 0.1)",
                                  color: "#27AE60",
                                }}
                              >
                                Đã thanh toán
                              </Tag>
                            )}
                          </Space>
                        }
                      >
                        <div style={{paddingBottom: 20}}>
                          <Row>
                            <Col span={12}>
                              <span className="text-field margin-right-40">
                                Đã thanh toán:
                              </span>
                              <b>0</b>
                            </Col>
                            <Col span={12}>
                              <span className="text-field margin-right-40">
                                Còn phải trả:
                              </span>
                              <b style={{color: "red"}}>0</b>
                            </Col>
                          </Row>
                        </div>
                        <Divider style={{margin: "0px"}} />
                        <div style={{padding: "20px 20px 0 20px"}}>
                          <Collapse
                            className="orders-timeline"
                            defaultActiveKey={["1"]}
                            ghost
                          >
                            <Collapse.Panel
                              className={
                                OrderDetail?.fulfillments[0].status !== "shipped"
                                  ? "orders-timeline-custom orders-dot-status orders-dot-fullCod-status"
                                  : "orders-timeline-custom orders-dot-fullCod-status"
                              }
                              showArrow={false}
                              header={
                                <div
                                  style={{
                                    color: "#222222",
                                    paddingTop: 4,
                                    fontWeight: 500,
                                  }}
                                >
                                  COD
                                  <Tag
                                    className="orders-tag orders-tag-warning"
                                    style={{marginLeft: 10}}
                                  >
                                    Đang chờ thu
                                  </Tag>
                                  <b
                                    style={{
                                      marginLeft: "200px",
                                      color: "#222222",
                                    }}
                                  >
                                    {OrderDetail.fulfillments
                                      ? formatCurrency(
                                          OrderDetail.fulfillments[0].shipment?.cod
                                        )
                                      : 0}
                                  </b>
                                </div>
                              }
                              key="1"
                            >
                              <Row gutter={24}>
                                {OrderDetail?.payments &&
                                  OrderDetail?.payments.map((item, index) => (
                                    <Col span={12} key={item.id}>
                                      <p className="text-field">{item.payment_method}</p>
                                      <p>{formatCurrency(item.paid_amount)}</p>
                                    </Col>
                                  ))}
                              </Row>
                            </Collapse.Panel>
                          </Collapse>
                        </div>
                        <div className="text-right">
                        {OrderDetail?.payments !== null
                          ? OrderDetail?.payments.map(
                              (item, index) =>
                                OrderDetail.total !== null &&
                                OrderDetail.total - item.paid_amount !== 0 && (
                                  <Button
                                    key={index}
                                    type="primary"
                                    className="ant-btn-outline fixed-button"
                                  >
                                    Thanh toán
                                  </Button>
                                )
                            )
                          : "Chưa thanh toán"}
                      </div>
                      </Card>
                    )}
                  {(!OrderDetail?.payments || !OrderDetail?.payments.length) &&
                    (!(
                      OrderDetail?.fulfillments?.length &&
                      OrderDetail.fulfillments[0].shipment?.cod
                    ) ||
                      fulfillments[0].status === FulFillmentStatus.CANCELLED ||
                      fulfillments[0].status === FulFillmentStatus.RETURNING ||
                      fulfillments[0].status === FulFillmentStatus.RETURNED) && (
                      <Card title="THANH TOÁN">
                        <OrderCreatePayments
                          setPaymentMethod={setPaymentMethod}
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
                    )}
                  {!fulfillments.length && (
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
                  )}
                  {fulfillments.length > 0 && (
                    <Card
                      className="orders-update-shipment "
                      title={
                        <Space>
                          <div className="d-flex">
                            <span className="title-card">ĐÓNG GÓI VÀ GIAO HÀNG</span>
                          </div>
                          {OrderDetail?.fulfillments &&
                            OrderDetail?.fulfillments.length > 0 &&
                            OrderDetail?.fulfillments[0].status ===
                              FulFillmentStatus.SHIPPED && (
                              <Tag
                                className="orders-tag text-menu"
                                style={{
                                  color: "#27AE60",
                                  backgroundColor: "rgba(39, 174, 96, 0.1)",
                                }}
                              >
                                Giao thành công
                              </Tag>
                            )}
                        </Space>
                      }
                      extra={
                        <Space size={26}>
                          {OrderDetail?.fulfillments &&
                            OrderDetail?.fulfillments.length > 0 &&
                            OrderDetail?.fulfillments[0].shipment
                              ?.expected_received_date && (
                              <div className="text-menu">
                                <img
                                  src={calendarOutlined}
                                  style={{marginRight: 9.5}}
                                  alt=""
                                ></img>
                                <span style={{color: "#222222", lineHeight: "16px"}}>
                                  {OrderDetail?.fulfillments &&
                                  OrderDetail?.fulfillments.length > 0 &&
                                  OrderDetail?.fulfillments[0].shipment
                                    ?.expected_received_date
                                    ? moment(
                                        OrderDetail?.fulfillments[0].shipment
                                          ?.expected_received_date
                                      ).format("DD/MM/YYYY")
                                    : ""}
                                </span>
                                {OrderDetail?.fulfillments &&
                                  OrderDetail?.fulfillments.length > 0 &&
                                  OrderDetail?.fulfillments[0].shipment?.office_time && (
                                    <span
                                      style={{
                                        marginLeft: 6,
                                        color: "#737373",
                                        fontSize: "14px",
                                      }}
                                    >
                                      (Giờ hành chính)
                                    </span>
                                  )}
                              </div>
                            )}
                          {requirementNameView && (
                            <div className="text-menu">
                              <img src={eyeOutline} alt="eye"></img>
                              <span style={{marginLeft: "5px", fontWeight: 500}}>
                                {requirementNameView}
                              </span>
                            </div>
                          )}
                        </Space>
                      }
                    >
                      {fulfillments &&
                        fulfillments.length > 0 &&
                        fulfillments.map(
                          (fulfillment) =>
                            fulfillment.shipment && (
                              <div
                                key={fulfillment.id}
                                style={{marginTop: -12}}
                              >
                                <Collapse
                                  className="saleorder_shipment_order_colapse payment_success"
                                  defaultActiveKey={[
                                    fulfillment.status === FulFillmentStatus.RETURNED || fulfillment.status === FulFillmentStatus.CANCELLED ||
                                    fulfillment.status === FulFillmentStatus.RETURNING ? "0" : "1",
                                  ]}
                                  onChange={(e) => {}}
                                  expandIcon={({isActive}) => (
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
                                      fulfillment.status ===
                                        FulFillmentStatus.CANCELLED ||
                                      fulfillment.status ===
                                        FulFillmentStatus.RETURNING ||
                                      fulfillment.status === FulFillmentStatus.RETURNED
                                        ? "orders-timeline-custom order-shipment-dot-cancelled"
                                        : fulfillment.status === FulFillmentStatus.SHIPPED
                                        ? "orders-timeline-custom order-shipment-dot-active"
                                        : "orders-timeline-custom order-shipment-dot-default"
                                    }
                                    showArrow={true}
                                    header={
                                      <div className="saleorder-header-content" style={{display: "flex", width: "100%", padding: 0}}>
                                        <div className="saleorder-header-content__info" style={{display: "flex", width: "100%"}}>
                                          <span
                                            className="text-field"
                                            style={{
                                              color: "#2A2A86",
                                              fontWeight: 500,
                                              fontSize: 18,
                                              marginRight: 11,
                                            }}
                                          >
                                            {fulfillment.code}
                                          </span>
                                          <div
                                            style={{
                                              width: 35,
                                              padding: "0 4px",
                                              marginRight: 10,
                                              marginBottom: 2,
                                            }}
                                          >
                                            <img
                                              onClick={(e) =>
                                                copyOrderID(e, fulfillment.code)
                                              }
                                              src={copyFileBtn}
                                              alt=""
                                              style={{width: 23}}
                                            />
                                          </div>
                                          <FulfillmentStatusTag
                                            fulfillment={fulfillment}
                                          />
                                          {!(fulfillment.status === FulFillmentStatus.CANCELLED ||
                                            fulfillment.status === FulFillmentStatus.RETURNING ||
                                            fulfillment.status === FulFillmentStatus.RETURNED) &&
                                            <PrintShippingLabel
                                              fulfillment={fulfillment}
                                              orderSettings={orderSettings}
                                              orderId={OrderDetail?.id}
                                            />}
                                        </div>

                                        <div className="saleorder-header-content__date" style={{display: "flex", width: "100%", alignItems: "center"}}>
                                          {(fulfillment.status === FulFillmentStatus.CANCELLED ||
                                            fulfillment.status === FulFillmentStatus.RETURNING ||
                                            fulfillment.status === FulFillmentStatus.RETURNED) ?
                                            <span>
                                              <span
                                                style={{
                                                  color: "#000000d9",
                                                  marginRight: 6,
                                                }}
                                              >
                                                Ngày huỷ:
                                              </span>
                                              <span style={{color: "#000000d9"}}>
                                                {fulfillment.cancel_date ? moment(
                                                  fulfillment.cancel_date
                                                ).format("DD/MM/YYYY") : ''}
                                              </span>
                                            </span> : 
                                            <span>
                                              <span
                                                style={{
                                                  color: "#000000d9",
                                                  marginRight: 6,
                                                }}
                                              >
                                                Ngày tạo:
                                              </span>
                                              <span style={{color: "#000000d9"}}>
                                                {moment(
                                                  fulfillment.shipment?.created_date
                                                ).format("DD/MM/YYYY")}
                                              </span>
                                            </span>}
                                        </div>
                                      </div>
                                    }
                                    key="1"
                                  >
                                    {fulfillment.shipment
                                      ?.delivery_service_provider_type ===
                                    "pick_at_store" ? (
                                      <div>
                                        <Row gutter={24}>
                                          <Col md={24}>
                                            <Col span={24}>
                                              <b>
                                                <img
                                                  style={{marginRight: 12}}
                                                  src={storeBluecon}
                                                  alt=""
                                                />
                                                NHẬN TẠI CỬA HÀNG
                                              </b>
                                            </Col>
                                          </Col>
                                        </Row>
                                        <Row gutter={24} style={{paddingTop: "15px"}}>
                                          <Col md={6}>
                                            <Col span={24}>
                                              <p className="text-field">Tên cửa hàng:</p>
                                            </Col>
                                            <Col span={24}>
                                              <b>{OrderDetail?.store}</b>
                                            </Col>
                                          </Col>

                                          <Col md={6}>
                                            <Col span={24}>
                                              <p className="text-field">Số điện thoại:</p>
                                            </Col>
                                            <Col span={24}>
                                              <b className="text-field">
                                                {OrderDetail?.store_phone_number}
                                              </b>
                                            </Col>
                                          </Col>

                                          <Col md={6}>
                                            <Col span={24}>
                                              <p className="text-field">Địa chỉ:</p>
                                            </Col>
                                            <Col span={24}>
                                              <b className="text-field">
                                                {OrderDetail?.store_full_address}
                                              </b>
                                            </Col>
                                          </Col>
                                        </Row>
                                      </div>
                                    ) : (
                                      <Row gutter={24}>
                                        <Col md={12}>
                                          <Row gutter={30}>
                                            <Col span={10}>
                                              <p className="text-field">
                                                Đối tác giao hàng: 1
                                              </p>
                                            </Col>
                                            <Col span={14}>
                                              <b>
                                                {/* Lấy ra đối tác */}
                                                {(fulfillment.shipment
                                                  ?.delivery_service_provider_type ===
                                                  "external_service" ||
                                                  fulfillment.shipment
                                                    ?.delivery_service_provider_type ===
                                                    "shopee") && (
                                                  <img
                                                    style={{
                                                      width: "112px",
                                                      height: 25,
                                                    }}
                                                    src={getImageDeliveryService(
                                                      fulfillment.shipment
                                                        .delivery_service_provider_code
                                                    )}
                                                    alt=""
                                                  ></img>
                                                )}

                                                {fulfillment.shipment
                                                  ?.delivery_service_provider_type ===
                                                  "shipper" &&
                                                  shipper &&
                                                  shipper.find(
                                                    (s) =>
                                                      fulfillment.shipment
                                                        ?.shipper_code === s.code
                                                  )?.full_name}
                                              </b>
                                            </Col>
                                          </Row>
                                        </Col>
                                        {CheckShipmentType(OrderDetail!) ===
                                          "external_service" && (
                                          <Col md={12}>
                                            <Row gutter={30}>
                                              <Col span={10}>
                                                <p className="text-field">Dịch vụ:</p>
                                              </Col>
                                              <Col span={14}>
                                                <b className="text-field">
                                                  {/* {getServiceName(OrderDetail!)} */}
                                                  {
                                                    fulfillment.shipment
                                                      ?.delivery_transport_type
                                                  }
                                                </b>
                                              </Col>
                                            </Row>
                                          </Col>
                                        )}

                                        <Col md={12}>
                                          <Row gutter={30}>
                                            <Col span={10}>
                                              <p className="text-field">
                                                Phí ship trả HVC:
                                              </p>
                                            </Col>
                                            <Col span={14}>
                                              <b className="text-field">
                                                {OrderDetail?.fulfillments &&
                                                  formatCurrency(
                                                    fulfillment.shipment
                                                      ?.shipping_fee_paid_to_three_pls
                                                      ? fulfillment.shipment
                                                          ?.shipping_fee_paid_to_three_pls
                                                      : 0
                                                  )}
                                              </b>
                                            </Col>
                                          </Row>
                                        </Col>

                                        <Col md={12}>
                                          <Row gutter={30}>
                                            <Col span={10}>
                                              <p className="text-field">
                                                Phí ship báo khách:
                                              </p>
                                            </Col>
                                            <Col span={14}>
                                              <b className="text-field">
                                                {formatCurrency(
                                                  fulfillment.shipment
                                                    ?.shipping_fee_informed_to_customer
                                                    ? fulfillment.shipment
                                                        ?.shipping_fee_informed_to_customer
                                                    : 0
                                                )}
                                              </b>
                                            </Col>
                                          </Row>
                                        </Col>

                                        {CheckShipmentType(OrderDetail!) ===
                                          "external_service" && (
                                          <Col md={12}>
                                            <Row gutter={30}>
                                              <Col span={10}>
                                                <p className="text-field">Trọng lượng:</p>
                                              </Col>
                                              <Col span={14}>
                                                <b className="text-field">
                                                  {OrderDetail?.fulfillments &&
                                                    OrderDetail?.fulfillments.length >
                                                      0 &&
                                                    formatCurrency(
                                                      OrderDetail.items &&
                                                        SumWeightResponse(
                                                          OrderDetail.items
                                                        )
                                                    )}
                                                  g
                                                </b>
                                              </Col>
                                            </Row>
                                          </Col>
                                        )}
                                      </Row>
                                    )}
                                    <Row className="orders-shipment-item">
                                      <Collapse ghost>
                                        <Collapse.Panel
                                          header={
                                            <Row>
                                              <Col style={{alignItems: "center"}}>
                                                <b
                                                  style={{
                                                    marginRight: "10px",
                                                    color: "#222222",
                                                  }}
                                                >
                                                  {OrderDetail?.items.reduce(
                                                    (a: any, b: any) => a + b.quantity,
                                                    0
                                                  )}{" "}
                                                  SẢN PHẨM
                                                </b>
                                              </Col>
                                            </Row>
                                          }
                                          key="1"
                                        >
                                          {OrderDetail?.items.map((item, index) => (
                                            <div
                                              className="orders-shipment-item-view"
                                              key={index}
                                            >
                                              <div className="orders-shipment-item-view-wrap">
                                                <div className="orders-shipment-item-name">
                                                  <div>
                                                    <Typography.Link
                                                      style={{
                                                        color: "#2A2A86",
                                                      }}
                                                    >
                                                      {item.sku}
                                                    </Typography.Link>
                                                  </div>
                                                  <Badge
                                                    status="default"
                                                    text={item.variant}
                                                    style={{marginLeft: 7}}
                                                  />
                                                </div>
                                                <div
                                                  style={{
                                                    width: "30%",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                  }}
                                                >
                                                  {item.type === "gift" ? (
                                                    <span>Quà tặng</span>
                                                  ) : (
                                                    <div></div>
                                                  )}
                                                  <span style={{marginRight: 10}}>
                                                    {item.quantity >= 10
                                                      ? item.quantity
                                                      : "0" + item.quantity}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </Collapse.Panel>
                                      </Collapse>
                                    </Row>
                                    {CheckShipmentType(OrderDetail!) ===
                                      "external_service" &&
                                      fulfillment.status !==
                                        FulFillmentStatus.CANCELLED &&
                                      fulfillment.status !==
                                        FulFillmentStatus.RETURNING &&
                                      fulfillment.status !==
                                        FulFillmentStatus.RETURNED && (
                                        <Row
                                          gutter={24}
                                          style={{
                                            marginTop: 12,
                                            marginBottom: 0,
                                            padding: "0 12px 0 0",
                                          }}
                                        >
                                          <Col span={24}>
                                            <Collapse ghost>
                                              <Collapse.Panel
                                                header={
                                                  <Row>
                                                    <Col style={{display: "flex", width: "100%", alignItems: "center"}}>
                                                      <span
                                                        style={{
                                                          marginRight: "10px",
                                                          color: "#222222",
                                                        }}
                                                      >
                                                        Mã vận đơn:
                                                      </span>
                                                      <Typography.Link
                                                        className="text-field"
                                                        style={{
                                                          color: "#2A2A86",
                                                          fontWeight: 500,
                                                          fontSize: 16,
                                                        }}
                                                      >
                                                        {TrackingCode(OrderDetail)}
                                                      </Typography.Link>
                                                      <div
                                                        style={{
                                                          width: 30,
                                                          padding: "0 4px",
                                                        }}
                                                      >
                                                        <img
                                                          onClick={(e) =>
                                                            copyOrderID(
                                                              e,
                                                              TrackingCode(OrderDetail)!
                                                            )
                                                          }
                                                          src={copyFileBtn}
                                                          alt=""
                                                          style={{width: 23}}
                                                        />
                                                      </div>
                                                    </Col>
                                                    <Col>
                                                      <span
                                                        style={{
                                                          color: "#000000d9",
                                                          marginRight: 6,
                                                        }}
                                                      ></span>
                                                    </Col>
                                                  </Row>
                                                }
                                                key="1"
                                                className="custom-css-collapse"
                                              >
                                                <Collapse
                                                  className="orders-timeline"
                                                  expandIcon={({isActive}) => (
                                                    <img
                                                      src={doubleArrow}
                                                      alt=""
                                                      style={{
                                                        transform: isActive
                                                          ? "rotate(0deg)"
                                                          : "rotate(270deg)",
                                                        float: "right",
                                                      }}
                                                    />
                                                  )}
                                                  ghost
                                                  defaultActiveKey={["0"]}
                                                >
                                                  {trackingLogFulfillment?.map(
                                                    (item, index) => (
                                                      <Collapse.Panel
                                                        className="orders-timeline-custom orders-dot-status"
                                                        header={
                                                          <div>
                                                            <b
                                                              style={{
                                                                paddingLeft: "14px",
                                                                color: "#222222",
                                                              }}
                                                            >
                                                              {item.message}
                                                            </b>
                                                            <i
                                                              className="icon-dot"
                                                              style={{
                                                                fontSize: "4px",
                                                                margin:
                                                                  "16px 10px 10px 10px",
                                                                color: "#737373",
                                                              }}
                                                            ></i>{" "}
                                                            <span
                                                              style={{
                                                                color: "#737373",
                                                              }}
                                                            >
                                                              {moment(
                                                                item.created_date
                                                              ).format(
                                                                "DD/MM/YYYY HH:mm"
                                                              )}
                                                            </span>
                                                          </div>
                                                        }
                                                        key={index}
                                                        showArrow={false}
                                                      />
                                                    )
                                                  )}
                                                </Collapse>
                                              </Collapse.Panel>
                                            </Collapse>
                                          </Col>
                                        </Row>
                                      )}
                                    {fulfillment.status === FulFillmentStatus.CANCELLED ||
                                    fulfillment.status === FulFillmentStatus.RETURNING ||
                                    fulfillment.status === FulFillmentStatus.RETURNED ? (
                                      <div className="saleorder-custom-steps">
                                        <div className="saleorder-steps-one saleorder-steps dot-active">
                                          <span>Ngày tạo</span>
                                          <span>
                                            {moment(fulfillment?.created_date).format(
                                              "DD/MM/YYYY HH:mm"
                                            )}
                                          </span>
                                        </div>
                                        {fulfillment.status_before_cancellation ===
                                          FulFillmentStatus.SHIPPING && (
                                          <div
                                            className={
                                              fulfillment.status ===
                                              FulFillmentStatus.RETURNED
                                                ? "saleorder-steps-two saleorder-steps dot-active hide-steps-two-line"
                                                : "saleorder-steps-two saleorder-steps dot-active"
                                            }
                                          >
                                            <span>Ngày hủy</span>
                                            <span>
                                              {moment(fulfillment?.cancel_date).format(
                                                "DD/MM/YYYY HH:mm"
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        {fulfillment.status_before_cancellation !==
                                          FulFillmentStatus.SHIPPING && (
                                          <div className="saleorder-steps-three saleorder-steps dot-active">
                                            <span>Ngày nhận lại</span>
                                            <span>
                                              {moment(fulfillment?.cancel_date).format(
                                                "DD/MM/YYYY HH:mm"
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        {fulfillment.status_before_cancellation ===
                                          FulFillmentStatus.SHIPPING &&
                                          fulfillment.status ===
                                            FulFillmentStatus.RETURNED && (
                                            <div className="saleorder-steps-three saleorder-steps dot-active">
                                              <span>Ngày nhận lại</span>
                                              <span>
                                                {moment(
                                                  fulfillment?.receive_cancellation_on
                                                ).format("DD/MM/YYYY HH:mm")}
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    ) : null}
                                  </Collapse.Panel>
                                </Collapse>
                              </div>
                            )
                        )}
                    </Card>
                  )}
                </Col>
                <Col md={6}>
                  <CreateOrderSidebar
                    tags={tags}
                    onChangeTag={onChangeTag}
                    customerId={customer?.id}
                    listOrderSubStatus={listOrderSubStatus}
										form={form}
                    storeId={storeId}
                  />
                </Col>
              </Row>
              {isShowBillStep && (
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
                />
              )}
            </Form>
          )}
        </div>
      </ContentContainer>
    </React.Fragment>
  );
}
