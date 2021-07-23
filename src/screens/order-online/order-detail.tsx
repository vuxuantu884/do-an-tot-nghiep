//#region Import
import {
  Button,
  Card,
  Row,
  Col,
  Form,
  Space,
  Typography,
  Popover,
  Divider,
  Checkbox,
  Tooltip,
  Table,
  Avatar,
  Tag,
  Collapse,
  DatePicker,
  FormInstance,
  Select,
} from "antd";
import UpdatePaymentCard from "./update-payment-card";
import {
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  useEffect,
  createRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  OrderPaymentRequest,
  UpdateFulFillmentRequest,
  UpdateFulFillmentStatusRequest,
  UpdateLineFulFillment,
  UpdateShipmentRequest,
} from "model/request/order.request";
import { AccountResponse } from "model/account/account.model";
import {
  AccountSearchAction,
  ShipperGetListAction,
} from "domain/actions/account/account.action";
import { PageResponse } from "model/base/base-metadata.response";
import {
  OrderDetailAction,
  UpdateFulFillmentStatusAction,
  UpdateShipmentAction,
} from "domain/actions/order/order.action";
import AddAddressModal from "./modal/addAddressModal";
import EditCustomerModal from "./modal/editCustomerModal";
import bithdayIcon from "assets/img/bithday.svg";
import editBlueIcon from "assets/img/editBlue.svg";
import pointIcon from "assets/img/point.svg";
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import deleteIcon from "assets/icon/delete.svg";
import giftIcon from "assets/icon/gift.svg";
import storeBluecon from "assets/img/storeBlue.svg";
import addressIcon from "assets/img/user-pin.svg";
import noteCustomer from "assets/img/note-customer.svg";
import deliveryIcon from "assets/icon/delivery.svg";
import selfdeliver from "assets/icon/self_shipping.svg";
import shoppingBag from "assets/icon/shopping_bag.svg";
import wallClock from "assets/icon/wall_clock.svg";
import eyeOutline from "assets/icon/eye_outline.svg";
import calendarOutlined from "assets/icon/calendar_outline.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import { useParams } from "react-router-dom";
import ContentContainer from "component/container/content.container";
import CreateBillStep from "component/header/create-bill-step";
import { Link } from "react-router-dom";
import {
  OrderLineItemResponse,
  OrderResponse,
} from "model/response/order/order.response";
import { CustomerDetail } from "domain/actions/customer/customer.action";
import { CustomerResponse } from "model/response/customer/customer.response";
import moment from "moment";
import {
  checkPaymentAll,
  checkPaymentStatusToShow,
  formatCurrency,
  getAmountPayment,
  getDateLastPayment,
  getTotalQuantity,
  replaceFormatString,
} from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { StoreDetailAction } from "domain/actions/core/store.action";
import { StoreResponse } from "model/core/store.model";
import {
  FulFillmentStatus,
  OrderStatus,
  ShipmentMethodOption,
  PaymentMethodOption,
} from "utils/Constants";
import UrlConfig from "config/UrlConfig";
import CustomSelect from "component/custom/select.custom";
import SaveAndConfirmOrder from "./modal/SaveAndConfirmOrder";
import NumberInput from "component/custom/number-input.custom";
import { setTimeout } from "timers";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
const { Panel } = Collapse;
//#endregion

type OrderParam = {
  id: string;
};

const OrderDetail = () => {
  const { id } = useParams<OrderParam>();
  let OrderId = parseInt(id);
  const isFirstLoad = useRef(true);
  const formRef = createRef<FormInstance>();
  const copyRef = createRef<any>();

  //#region state
  const dispatch = useDispatch();
  const [payments, setPayments] = useState<Array<OrderPaymentRequest>>([]);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [paymentType, setPaymentType] = useState<number>(3);
  const [isVisibleBilling, setVisibleBilling] = useState(true);
  const [isVisibleCustomer, setVisibleCustomer] = useState(false);
  const [isVisibleAddress, setVisibleAddress] = useState(false);
  const [isVisibleShipping, setVisibleShipping] = useState(false);
  const [visibleShippingAddress, setVisibleShippingAddress] = useState(false);
  const [visibleBillingAddress, setVisibleBillingAddress] = useState(false);
  const [isError, setError] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [shipmentMethod, setShipmentMethod] = useState<number>(4);
  const [storeDetail, setStoreDetail] = useState<StoreResponse>();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(
    null
  );
  const [amount, setAmount] = useState<number>(0);
  const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
    useState<number>(0);
  const [isvibleShippedConfirm, setIsvibleShippedConfirm] =
    useState<boolean>(false);
  const [requirementName, setRequirementName] = useState<string | null>(null);
  const [takeMoneyHelper, setTakeMoneyHelper] = useState<number | null>(null);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  //#endregion
  //#region Orther
  const ShowAddressModal = () => {
    setVisibleAddress(true);
    setVisibleShippingAddress(false);
    setVisibleBillingAddress(false);
  };

  const handleVisibleBillingAddressChange = (value: boolean) => {
    setVisibleBillingAddress(value);
  };

  const ShowShipping = () => {
    setVisibleShipping(true);
  };

  const onPaymentSelect = (paymentType: number) => {
    if (paymentType === 1) {
      setVisibleShipping(true);
    }

    setPaymentType(paymentType);
  };

  const CancleConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const OkConfirmAddress = useCallback(() => {
    setVisibleAddress(false);
  }, []);

  const CancleConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const OkConfirmCustomer = useCallback(() => {
    setVisibleCustomer(false);
  }, []);

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
  };

  const ShowBillingAddress = () => {
    setVisibleBilling(!isVisibleBilling);
  };

  const [isShowPaymentPartialPayment, setShowPaymentPartialPayment] =
    useState(false);

  //#endregion

  //#region Master
  const shipping_requirements = useSelector(
    (state: RootReducerType) =>
      state.bootstrapReducer.data?.shipping_requirement
  );
  const stepsStatus = () => {
    console.log(OrderDetail, FulFillmentStatus);
    if (OrderDetail?.status === OrderStatus.DRAFT) {
      return OrderStatus.DRAFT;
    }
    if (OrderDetail?.status === OrderStatus.FINALIZED) {
      if (
        OrderDetail.fulfillments === undefined ||
        OrderDetail.fulfillments === null
      ) {
        return OrderStatus.FINALIZED;
      } else {
        if (
          OrderDetail.fulfillments !== undefined &&
          OrderDetail.fulfillments !== null
        ) {
          if (
            OrderDetail.fulfillments[0].status === FulFillmentStatus.UNSHIPPED
          ) {
            return OrderStatus.FINALIZED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.PICKED) {
            return FulFillmentStatus.PICKED;
          }
          if (OrderDetail.fulfillments[0].status === FulFillmentStatus.PACKED) {
            return FulFillmentStatus.PACKED;
          }
          if (
            OrderDetail.fulfillments[0].status === FulFillmentStatus.SHIPPING
          ) {
            return FulFillmentStatus.SHIPPING;
          }
          if (
            OrderDetail.fulfillments[0].status === FulFillmentStatus.SHIPPED
          ) {
            return FulFillmentStatus.SHIPPED;
          }
        }
      }
    }
  };

  // tag status
  let stepsStatusValue = stepsStatus();

  interface statusTagObj {
    name: string;
    status: string;
    color: string;
    backgroundColor: string;
  }
  const shipmentStatusTag: Array<statusTagObj> = [
    {
      name: "Chưa giao hàng",
      status: FulFillmentStatus.UNSHIPPED,
      color: "#FCAF17",
      backgroundColor: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đã nhặt hàng",
      status: FulFillmentStatus.PICKED,
      color: "#FCAF17",
      backgroundColor: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đã đóng gói",
      status: FulFillmentStatus.PACKED,
      color: "#FCAF17",
      backgroundColor: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Đang giao hàng",
      status: FulFillmentStatus.SHIPPING,
      color: "#FCAF17",
      backgroundColor: "rgba(252, 175, 23, 0.1)",
    },
    {
      name: "Giao thành công",
      status: FulFillmentStatus.SHIPPED,
      color: "#27AE60",
      backgroundColor: "rgba(39, 174, 96, 0.1)",
    },
  ];
  // copy button
  const copyOrderID = (e: any) => {
    e.stopPropagation();
    e.target.style.width = "82%";
    const decWidth = setTimeout(() => {
      e.target.style.width = "77%";
    }, 500);
    clearTimeout(decWidth);
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(copyRef?.current);
    selection && selection.removeAllRanges();
    selection && selection.addRange(range);
    document.execCommand("Copy");
  };
  //#region Product
  const setDataAccounts = useCallback((data: PageResponse<AccountResponse>) => {
    setAccounts(data.items);
  }, []);

  const ShipMethodOnChange = (value: number) => {
    setShipmentMethod(value);
    if (
      OrderDetail !== null &&
      value === ShipmentMethodOption.SELFDELIVER &&
      checkPaymentStatusToShow(OrderDetail) !== 1
    ) {
      setPaymentType(PaymentMethodOption.COD);
    }
  };

  const onDeleteItem = (index: number) => {
    if (OrderDetail != null) {
      let _items = OrderDetail;
      let _amount =
        amount - _items.items[index].line_amount_after_line_discount;
      setAmount(_amount);
      _items.items.splice(index, 1);
      setOrderDetail(_items);
    }
  };
  //#endregion
  const onGetDetailSuccess = useCallback((data: false | OrderResponse) => {
    setLoadingData(false);
    if (!data) {
      setError(true);
    } else {
      setOrderDetail(data);
    }
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      if (!Number.isNaN(OrderId)) {
        dispatch(OrderDetailAction(OrderId, onGetDetailSuccess));
      } else {
        setError(true);
      }
    }
    isFirstLoad.current = false;
  }, [dispatch, OrderId]);

  useLayoutEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  const ProductColumn = {
    title: () => (
      <div className="text-center">
        <div>Sản phẩm</div>
        <span style={{ color: "#0080FF" }}></span>
      </div>
    ),
    width: "35%",
    className: "yody-pos-name",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div className="w-100" style={{ overflow: "hidden" }}>
          <div className="d-flex align-items-center">
            <div style={{ width: "calc(100% - 32px)", marginLeft: "15px" }}>
              <div className="yody-pos-sku">
                <Typography.Link>{l.sku}</Typography.Link>
              </div>
              <div className="yody-pos-varian">
                <Tooltip title={l.variant} className="yody-pos-varian-name">
                  <span>{l.variant}</span>
                </Tooltip>
              </div>
            </div>
          </div>
          {l.gifts?.map((a, index1) => (
            <div key={index1} className="yody-pos-addition yody-pos-gift">
              <div>
                <img src={giftIcon} alt="" /> {a.variant}{" "}
                <span>({a.quantity})</span>
              </div>
            </div>
          ))}
        </div>
      );
    },
  };

  const AmountColumnt = {
    title: () => (
      <div className="text-center">
        <div>Số lượng</div>
        <span style={{ color: "#0080FF" }}>
          (
          {OrderDetail?.items !== undefined &&
            getTotalQuantity(OrderDetail?.items)}
          )
        </span>
      </div>
    ),
    className: "yody-pos-quantity text-center",
    width: "15%",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return <div className="yody-pos-qtt">{l.quantity}</div>;
    },
  };

  const PriceColumnt = {
    title: "Đơn giá",
    className: "yody-pos-price text-right",
    width: "15%",
    align: "right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return <div className="yody-pos-price">{formatCurrency(l.price)}</div>;
    },
  };

  const DiscountColumnt = {
    title: "Chiết khấu",
    align: "center",
    width: "20%",
    className: "yody-table-discount text-right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div className="site-input-group-wrapper saleorder-input-group-wrapper">
          {l.discount_rate !== null
            ? l.discount_rate
            : l.discount_value !== null
            ? formatCurrency(l.discount_value)
            : 0}
        </div>
      );
    },
  };

  const TotalPriceColumn = {
    title: "Tổng tiền",
    width: "20%",
    className: "yody-table-total-money text-right",
    render: (l: OrderLineItemResponse, item: any, index: number) => {
      return (
        <div style={{ textAlign: "left" }}>{formatCurrency(l.amount)}</div>
      );
    },
  };

  const columns = [
    ProductColumn,
    AmountColumnt,
    PriceColumnt,
    DiscountColumnt,
    TotalPriceColumn,
  ];
  //#endregion

  let customerBirthday = moment(customerDetail?.birthday).format("DD/MM/YYYY");

  //#region Update Fulfillment Status
  let timeout = 1000;
  const onUpdateSuccess = (value: OrderResponse) => {
    showSuccess("Tạo đơn giao hàng thành công");
    setTimeout(() => {
      window.location.reload();
    }, timeout);
  };

  const onPickSuccess = (value: OrderResponse) => {
    showSuccess("Nhặt hàng thành công");
    setTimeout(() => {
      window.location.reload();
    }, timeout);
  };

  const onPackSuccess = (value: OrderResponse) => {
    showSuccess("Đóng gói thành công");
    setTimeout(() => {
      window.location.reload();
    }, timeout);
  };

  const onShippingSuccess = (value: OrderResponse) => {
    showSuccess("Xuất kho thành công");
    setTimeout(() => {
      window.location.reload();
    }, timeout);
  };

  const onShipedSuccess = (value: OrderResponse) => {
    showSuccess("Hoàn tất đơn hàng");
    setTimeout(() => {
      window.location.reload();
    }, timeout);
  };

  //fulfillmentTypeOrderRequest
  const fulfillmentTypeOrderRequest = (type: number) => {
    let value: UpdateFulFillmentStatusRequest = {
      order_id: null,
      fulfillment_id: null,
      status: "",
    };
    value.order_id = OrderDetail?.id;
    let fulfillment_id =
      OrderDetail?.fulfillments !== undefined &&
      OrderDetail?.fulfillments !== null
        ? OrderDetail?.fulfillments[0].id
        : null;
    value.fulfillment_id = fulfillment_id;

    switch (type) {
      case 1:
        value.status = FulFillmentStatus.PICKED;
        dispatch(UpdateFulFillmentStatusAction(value, onPickSuccess));
        break;
      case 2:
        value.status = FulFillmentStatus.PACKED;
        dispatch(UpdateFulFillmentStatusAction(value, onPackSuccess));
        break;
      case 3:
        value.status = FulFillmentStatus.SHIPPING;
        dispatch(UpdateFulFillmentStatusAction(value, onShippingSuccess));
        break;
      case 4:
        value.status = FulFillmentStatus.SHIPPED;
        dispatch(UpdateFulFillmentStatusAction(value, onShipedSuccess));
        break;
      default:
        return;
    }
  };
  // shipping confirm
  const [isvibleShippingConfirm, setIsvibleShippingConfirm] =
    useState<boolean>(false);

  const onOkShippingConfirm = () => {
    if (
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED
    ) {
      fulfillmentTypeOrderRequest(1);
    } else if (stepsStatusValue === FulFillmentStatus.PICKED) {
      fulfillmentTypeOrderRequest(2);
    } else if (stepsStatusValue === FulFillmentStatus.PACKED) {
      fulfillmentTypeOrderRequest(3);
    } else if (stepsStatusValue === FulFillmentStatus.SHIPPING) {
      fulfillmentTypeOrderRequest(4);
    }
  };
  //#endregion

  //#region shiment
  let initialFormUpdateShipment: UpdateShipmentRequest = {
    order_id: null,
    code: "",
    delivery_service_provider_id: null, //id người shipper
    delivery_service_provider_type: "", //shipper
    shipper_code: null,
    shipper_name: "",
    handover_id: null,
    service: null,
    fee_type: "",
    fee_base_on: "",
    delivery_fee: null,
    shipping_fee_paid_to_three_pls: null,
    cod: null,
    expected_received_date: "",
    reference_status: "",
    shipping_fee_informed_to_customer: null,
    reference_status_explanation: "",
    cancel_reason: "",
    tracking_code: "",
    tracking_url: "",
    received_date: "",
    sender_address_id: null,
    note_to_shipper: "",
    requirements: null,
    requirements_name: null,
    fulfillment_id: "",
  };

  let FulFillmentRequest: UpdateFulFillmentRequest = {
    id: null,
    order_id: null,
    store_id: OrderDetail?.store_id,
    account_code: OrderDetail?.account_code,
    assignee_code: OrderDetail?.assignee_code,
    delivery_type: "",
    stock_location_id: null,
    payment_status: "",
    total: null,
    total_tax: null,
    total_discount: null,
    total_quantity: null,
    discount_rate: null,
    discount_value: null,
    discount_amount: null,
    total_line_amount_after_line_discount: null,
    shipment: null,
    items: OrderDetail?.items,
    shipping_fee_informed_to_customer: null,
  };

  const onFinishUpdateFulFillment = (value: UpdateShipmentRequest) => {
    value.expected_received_date = value.dating_ship?.utc().format();
    value.requirements_name = requirementName;
    if (OrderDetail?.fulfillments !== undefined && OrderDetail?.fulfillments) {
      value.delivery_service_provider_type = "Shipper";
    }
    if (OrderDetail != null) {
      FulFillmentRequest.order_id = OrderDetail.id;
      if (
        OrderDetail.fulfillments !== undefined &&
        OrderDetail.fulfillments !== null &&
        OrderDetail.fulfillments.length !== 0
      ) {
        FulFillmentRequest.id = OrderDetail.fulfillments[0].id;
      }
    }
    if (
      OrderDetail &&
      checkPaymentStatusToShow(OrderDetail) === 1 &&
      value.shipping_fee_informed_to_customer !== null
    ) {
      value.cod =
        OrderDetail.total +
        value.shipping_fee_informed_to_customer -
        getAmountPayment(OrderDetail.payments);
    } else {
      if (takeHelperValue > 0) {
        value.cod = takeHelperValue;
      }
    }
    FulFillmentRequest.shipment = value;
    if (shippingFeeInformedCustomer !== null) {
      FulFillmentRequest.shipping_fee_informed_to_customer =
        shippingFeeInformedCustomer;
    }
    if (shippingFeeInformedCustomer !== null) {
      FulFillmentRequest.total =
        OrderDetail?.total_line_amount_after_line_discount &&
        OrderDetail?.total_line_amount_after_line_discount +
          shippingFeeInformedCustomer;
    } else {
      FulFillmentRequest.total =
        OrderDetail?.total_line_amount_after_line_discount;
    }

    let UpdateLineFulFillment: UpdateLineFulFillment = {
      order_id: FulFillmentRequest.order_id,
      fulfillment: FulFillmentRequest,
    };

    dispatch(UpdateShipmentAction(UpdateLineFulFillment, onUpdateSuccess));
  };

  const getRequirementName = () => {
    if (
      OrderDetail !== null &&
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0
    ) {
      let requirement =
        OrderDetail?.fulfillments[0].shipment?.requirements?.toString();
      const reqObj = shipping_requirements?.find(
        (r) => r.value === requirement
      );
      setRequirementName(reqObj ? reqObj?.name : "");
    }
  };

  useEffect(() => {
    if (OrderDetail != null) {
      dispatch(CustomerDetail(OrderDetail.customer_id, setCustomerDetail));
    }
  }, [dispatch, OrderDetail]);

  useEffect(() => {
    if (OrderDetail?.store_id != null) {
      dispatch(StoreDetailAction(OrderDetail?.store_id, setStoreDetail));
    }

    getRequirementName();
  }, [dispatch, OrderDetail?.store_id]);
  // shipment button action
  interface ShipmentButtonModel {
    name: string | null;
    value: number;
    icon: string | undefined;
  }

  const shipmentButton: Array<ShipmentButtonModel> = [
    {
      name: "Chuyển đối tác giao hàng",
      value: 1,
      icon: deliveryIcon,
    },
    {
      name: "Tự giao hàng",
      value: 2,
      icon: selfdeliver,
    },
    {
      name: "Nhận tại cửa hàng",
      value: 3,
      icon: shoppingBag,
    },
    {
      name: "Giao hàng sau",
      value: 4,
      icon: wallClock,
    },
  ];

  const setRequirementNameCallback = useCallback(
    (value) => {
      const reqObj = shipping_requirements?.find((r) => r.value === value);
      setRequirementName(reqObj ? reqObj?.name : "");
    },
    [setRequirementName, shipping_requirements]
  );
  //windows offset
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  });
  //#endregion
  
  // Thu hộ
  const takeHelper:any = () => {
    if (takeMoneyHelper) {
      return takeMoneyHelper;
    }else if (totalPaid && OrderDetail?.total) {
      return totalPaid === OrderDetail?.total
        ? shippingFeeInformedCustomer
        : (OrderDetail?.total ? OrderDetail?.total : 0) - totalPaid + shippingFeeInformedCustomer;
    } else if (
      OrderDetail?.total_line_amount_after_line_discount &&
      shippingFeeInformedCustomer
    ) {
      return OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) ===
        0
        ? shippingFeeInformedCustomer
        : shippingFeeInformedCustomer +
            OrderDetail?.total_line_amount_after_line_discount -
            (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0);
    } else if (
      OrderDetail?.total_paid &&
      OrderDetail?.total_line_amount_after_line_discount
    ) {
      return (
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        OrderDetail?.total_paid
      );
    } else if (OrderDetail?.total_line_amount_after_line_discount) {
      return OrderDetail?.total_line_amount_after_line_discount;
    }
  };
  let takeHelperValue: any = takeHelper();
  const showTakeHelper = () => {
    if(OrderDetail?.total && totalPaid){
      return OrderDetail?.total - totalPaid + shippingFeeInformedCustomer !== 0
    } else if (paymentType === 1 && takeHelperValue !== 0) {
      return true;
    } else if (shippingFeeInformedCustomer) {
      takeHelperValue = shippingFeeInformedCustomer;
      return true;
    } else if (takeHelperValue === 0) {
      return false;
    } else if (paymentType === 1) {
      return true;
    }
  };
  const isShowTakeHelper = showTakeHelper();
  // khách cần trả
  const customerNeedToPay: any = () => {
    if(!shippingFeeInformedCustomer && OrderDetail?.total_discount && OrderDetail?.total){
     return OrderDetail?.total
    }
    if (
      OrderDetail &&
      OrderDetail?.total_line_amount_after_line_discount &&
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
    ) {
      return (
        OrderDetail?.total_line_amount_after_line_discount +
        OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
      );
    } else if (OrderDetail?.total_line_amount_after_line_discount) {
      return (
        OrderDetail?.total_line_amount_after_line_discount +
        (shippingFeeInformedCustomer !== null ? shippingFeeInformedCustomer : 0)
      );
    } else if (
      OrderDetail &&
      OrderDetail?.total_line_amount_after_line_discount &&
      OrderDetail?.shipping_fee_informed_to_customer
    ) {
      return (
        OrderDetail?.total_line_amount_after_line_discount +
        OrderDetail?.shipping_fee_informed_to_customer
      );
    }
  };
  const customerNeedToPayValue = customerNeedToPay();
  // end
  return (
    <ContentContainer
      isLoading={loadingData}
      isError={isError}
      title="Đơn hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: `${UrlConfig.HOME}`,
        },
        {
          name: "Đơn hàng",
        },
        {
          name: "Đơn hàng " + id,
        },
      ]}
      extra={
        <CreateBillStep status={stepsStatusValue} orderDetail={OrderDetail} />
      }
    >
      <div className="orders">
        <Row gutter={24} style={{ marginBottom: "70px" }}>
          <Col xs={24} lg={18}>
            {/*--- customer ---*/}
            <Card
              className="card-block card-block-customer"
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN KHÁCH HÀNG</span>
                </div>
              }
              extra={
                <div className="d-flex align-items-center form-group-with-search">
                  <span
                    style={{
                      float: "left",
                      lineHeight: "40px",
                    }}
                  >
                    <span style={{ marginRight: "10px" }}>Nguồn:</span>
                    <span className="text-error">
                      <span style={{ color: "red" }}>
                        {OrderDetail?.source}
                      </span>
                    </span>
                  </span>
                </div>
              }
            >
              <div>
                <Row
                  align="middle"
                  justify="space-between"
                  className="row-customer-detail padding-custom"
                >
                  <Space>
                    <Avatar size={32}>A</Avatar>
                    <Link to="#">{customerDetail?.full_name}</Link>
                    <Tag className="orders-tag orders-tag-vip">
                      <b>{customerDetail?.customer_level}</b>
                    </Tag>
                  </Space>
                  <Space className="customer-detail-phone">
                    <span className="customer-detail-icon">
                      <img
                        src={callIcon}
                        alt=""
                        className="icon-customer-info"
                      />
                    </span>
                    <span className="customer-detail-text">
                      {customerDetail?.phone}
                    </span>
                  </Space>

                  <Space className="customer-detail-point">
                    <span className="customer-detail-icon">
                      <img src={pointIcon} alt="" />
                    </span>
                    <span className="customer-detail-text">
                      Tổng điểm{" "}
                      <Typography.Text
                        type="success"
                        style={{ color: "#0080FF" }}
                        strong
                      >
                        {customerDetail?.loyalty === undefined
                          ? "0"
                          : customerDetail?.loyalty}
                      </Typography.Text>
                    </span>
                  </Space>

                  <Space className="customer-detail-birthday">
                    <span className="customer-detail-icon">
                      <img src={bithdayIcon} alt="" />
                    </span>
                    <span className="customer-detail-text">
                      {customerBirthday}
                    </span>
                  </Space>
                </Row>
                <Divider
                  className="margin-0"
                  style={{ padding: 0, marginBottom: 0 }}
                />
                <div className="padding-lef-right">
                  <Row gutter={24}>
                    <Col
                      xs={24}
                      lg={12}
                      style={{
                        borderRight: "1px solid #E5E5E5",
                        paddingTop: "14px",
                      }}
                      className="font-weight-500 customer-info-left"
                    >
                      <div className="title-address">
                        <img
                          src={addressIcon}
                          alt=""
                          style={{
                            width: "24px",
                            height: "24px",
                            marginRight: "10px",
                          }}
                        />
                        Địa chỉ giao hàng:
                      </div>
                      <Row className="customer-row-info">
                        <span>{OrderDetail?.shipping_address?.name}</span>
                      </Row>
                      <Row className="customer-row-info">
                        <span>{OrderDetail?.shipping_address?.phone}</span>
                      </Row>
                      <Row className="customer-row-info">
                        <span>
                          {OrderDetail?.shipping_address?.full_address}
                        </span>
                      </Row>
                      <Row>
                        <Popover
                          placement="bottomLeft"
                          title={
                            <Row
                              justify="space-between"
                              align="middle"
                              className="change-shipping-address-title"
                            >
                              <div style={{ color: "#4F687D" }}>
                                Thay đổi địa chỉ
                              </div>
                              <Button type="link" onClick={ShowAddressModal}>
                                Thêm địa chỉ mới
                              </Button>
                            </Row>
                          }
                          content={
                            <div className="change-shipping-address-content">
                              <div className="shipping-address-row">
                                <div className="shipping-address-name">
                                  Địa chỉ 1{" "}
                                  <Button
                                    type="text"
                                    onClick={ShowAddressModal}
                                    className="p-0"
                                  >
                                    <img src={editBlueIcon} alt="" />
                                  </Button>
                                </div>
                                <div className="shipping-customer-name">
                                  Do Van A
                                </div>
                                <div className="shipping-customer-mobile">
                                  0987654321
                                </div>
                                <div className="shipping-customer-address">
                                  Ha Noi
                                </div>
                              </div>
                            </div>
                          }
                          trigger="click"
                          visible={visibleShippingAddress}
                          onVisibleChange={handleVisibleBillingAddressChange}
                          className="change-shipping-address"
                        >
                          <Button type="link" className="btn-style">
                            Thay đổi địa chỉ giao hàng
                          </Button>
                        </Popover>
                      </Row>
                    </Col>
                    <Col
                      xs={24}
                      lg={12}
                      style={{ paddingLeft: "34px", marginTop: "14px" }}
                    >
                      <div className="form-group form-group-with-search">
                        <div>
                          <label className="title-address">
                            <img
                              src={noteCustomer}
                              alt=""
                              style={{
                                width: "20px",
                                height: "20px",
                                marginRight: "10px",
                              }}
                            />
                            Ghi chú của khách:
                          </label>
                        </div>
                        <span style={{ marginTop: "10px" }}>
                          {OrderDetail?.customer_note !== ""
                            ? OrderDetail?.customer_note
                            : "Không có ghi chú"}
                        </span>
                      </div>
                    </Col>
                  </Row>
                  <Divider style={{ padding: 0, margin: 0 }} />

                  <div className="send-order-box">
                    <Row style={{ marginTop: 15 }}>
                      <Checkbox
                        className="checkbox-style"
                        onChange={ShowBillingAddress}
                        style={{ marginLeft: "3px" }}
                      >
                        Gửi hoá đơn
                      </Checkbox>
                    </Row>

                    <Row gutter={24} hidden={isVisibleBilling}>
                      <Col
                        xs={24}
                        lg={12}
                        style={{
                          borderRight: "1px solid #E5E5E5",
                          paddingTop: "14px",
                        }}
                        className="font-weight-500 customer-info-left"
                      >
                        <div className="title-address">
                          <img
                            src={addressIcon}
                            alt=""
                            style={{
                              width: "24px",
                              height: "24px",
                              marginRight: "10px",
                            }}
                          />
                          Địa chỉ nhận hóa đơn:
                        </div>
                        <Row className="customer-row-info">
                          <span>{OrderDetail?.billing_address?.name}</span>
                        </Row>
                        <Row className="customer-row-info">
                          <span>{OrderDetail?.billing_address?.phone}</span>
                        </Row>
                        <Row className="customer-row-info">
                          <span>
                            {OrderDetail?.billing_address?.full_address}
                          </span>
                        </Row>
                        <Row>
                          <Popover
                            placement="bottomLeft"
                            title={
                              <Row
                                justify="space-between"
                                align="middle"
                                className="change-shipping-address-title"
                              >
                                <div style={{ color: "#4F687D" }}>
                                  Thay đổi địa chỉ
                                </div>
                                <Button type="link" onClick={ShowAddressModal}>
                                  Thêm địa chỉ mới
                                </Button>
                              </Row>
                            }
                            content={
                              <div className="change-shipping-address-content">
                                <div className="shipping-address-row">
                                  <div className="shipping-address-name">
                                    Địa chỉ 1{" "}
                                    <Button
                                      type="text"
                                      onClick={ShowAddressModal}
                                      className="p-0"
                                    >
                                      <img src={editBlueIcon} alt="" />
                                    </Button>
                                  </div>
                                  <div className="shipping-customer-name">
                                    Do Van A
                                  </div>
                                  <div className="shipping-customer-mobile">
                                    0987654321
                                  </div>
                                  <div className="shipping-customer-address">
                                    Ha Noi
                                  </div>
                                </div>
                              </div>
                            }
                            trigger="click"
                            visible={visibleBillingAddress}
                            onVisibleChange={handleVisibleBillingAddressChange}
                            className="change-shipping-address"
                          >
                            <Button type="link" className="btn-style">
                              Thay đổi địa chỉ gửi hóa đơn
                            </Button>
                          </Popover>
                        </Row>
                      </Col>
                      <Col xs={24} lg={12} className="font-weight-500">
                        <div className="form-group form-group-with-search">
                          <div>
                            <label htmlFor="" className="">
                              Email hoá đơn đến
                            </label>
                          </div>
                          <span>{OrderDetail?.billing_address?.email}</span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>

              <AddAddressModal
                visible={isVisibleAddress}
                onCancel={CancleConfirmAddress}
                onOk={OkConfirmAddress}
              />
              <EditCustomerModal
                visible={isVisibleCustomer}
                onCancel={CancleConfirmCustomer}
                onOk={OkConfirmCustomer}
              />
            </Card>
            {/*--- end customer ---*/}

            {/*--- product ---*/}
            <Card
              className="margin-top-20"
              title={
                <div className="d-flex">
                  <span className="title-card">SẢN PHẨM</span>
                </div>
              }
              extra={
                <Row>
                  <Space>
                    <div className="view-inventory-box">
                      <Button
                        type="link"
                        className="p-0"
                        style={{ color: "#0080ff" }}
                      >
                        <Space>
                          <img src={storeBluecon} alt="" />
                          YODY Kho Online
                        </Space>
                      </Button>
                    </div>
                  </Space>
                </Row>
              }
            >
              <div style={{ padding: "10px 0 24px 0" }}>
                <Row className="sale-product-box" justify="space-between">
                  <Table
                    locale={{
                      emptyText: (
                        <Button
                          type="text"
                          className="font-weight-500"
                          style={{
                            color: "#2A2A86",
                            background: "rgba(42,42,134,0.05)",
                            borderRadius: 5,
                            padding: 8,
                            height: "auto",
                            marginTop: 15,
                            marginBottom: 15,
                          }}
                        >
                          Thêm sản phẩm ngay (F3)
                        </Button>
                      ),
                    }}
                    rowKey={(record) => record.id}
                    columns={columns}
                    dataSource={OrderDetail?.items}
                    className="sale-product-box-table w-100"
                    tableLayout="fixed"
                    pagination={false}
                  />
                </Row>

                <Row
                  className="sale-product-box-payment padding-24"
                  gutter={24}
                  style={{ paddingTop: "30px" }}
                >
                  <Col xs={24} lg={12}>
                    <div className="payment-row">
                      <Checkbox
                        className="margin-bottom-15"
                        onChange={() => console.log(1)}
                      >
                        Bỏ chiết khấu tự động
                      </Checkbox>
                    </div>
                    <div className="payment-row">
                      <Checkbox
                        className="margin-bottom-15"
                        onChange={() => console.log(1)}
                      >
                        Không tính thuế VAT
                      </Checkbox>
                    </div>
                    <div className="payment-row">
                      <Checkbox
                        className="margin-bottom-15"
                        onChange={() => console.log(1)}
                      >
                        Bỏ tích điểm tự động
                      </Checkbox>
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Row className="payment-row" justify="space-between">
                      <strong className="font-size-text">Tổng tiền</strong>
                      <strong className="font-size-text">
                        {OrderDetail?.total_line_amount_after_line_discount !==
                          undefined &&
                          OrderDetail?.total_line_amount_after_line_discount !==
                            null &&
                          formatCurrency(
                            OrderDetail?.total_line_amount_after_line_discount
                          )}
                      </strong>
                    </Row>

                    <Row
                      className="payment-row"
                      justify="space-between"
                      align="middle"
                      style={{ marginTop: "5px" }}
                    >
                      <Space align="center">
                        <Typography.Link
                          className="font-weight-500"
                          style={{
                            borderBottom: "1px solid #5D5D8A",
                            color: "#5D5D8A",
                          }}
                        >
                          Chiết khấu
                        </Typography.Link>
                        {OrderDetail?.order_discount_rate !== null && (
                          <span>{OrderDetail?.order_discount_rate} %</span>
                        )}
                      </Space>
                      <div className="font-weight-500 ">
                        {OrderDetail?.total_discount !== null
                          ? OrderDetail?.total_discount
                          : 0}
                      </div>
                    </Row>
                    <Row
                      className="payment-row"
                      justify="space-between"
                      align="middle"
                      style={{ marginTop: "5px" }}
                    >
                      <Space align="center">
                        <Typography.Link
                          className="font-weight-500"
                          style={{
                            borderBottom: "1px solid #5D5D8A",
                            color: "#5D5D8A",
                          }}
                        >
                          Mã giảm giá
                        </Typography.Link>
                      </Space>
                      <div className="font-weight-500 ">0</div>
                    </Row>

                    <Row
                      className="payment-row padding-top-10"
                      justify="space-between"
                    >
                      <div className="font-weight-500">Phí ship báo khách</div>
                      <div className="font-weight-500 payment-row-money">
                        {(OrderDetail !== null &&
                          OrderDetail !== undefined &&
                          OrderDetail?.fulfillments !== null &&
                          OrderDetail?.fulfillments !== undefined &&
                          OrderDetail?.fulfillments.length > 0 &&
                          OrderDetail?.fulfillments[0].shipment !== undefined &&
                          OrderDetail?.fulfillments[0].shipment !== null &&
                          OrderDetail?.fulfillments[0].shipment
                            .shipping_fee_informed_to_customer !== undefined &&
                          OrderDetail?.fulfillments[0].shipment
                            .shipping_fee_informed_to_customer !== null &&
                          formatCurrency(
                            OrderDetail?.fulfillments[0].shipment
                              .shipping_fee_informed_to_customer
                          )) ||
                          (shippingFeeInformedCustomer !== null &&
                            formatCurrency(shippingFeeInformedCustomer)) ||
                          (OrderDetail?.shipping_fee_informed_to_customer !==
                            null &&
                            OrderDetail?.shipping_fee_informed_to_customer !==
                              undefined &&
                            formatCurrency(
                              OrderDetail?.shipping_fee_informed_to_customer
                            )) ||
                          0}
                      </div>
                    </Row>
                    <Divider className="margin-top-5 margin-bottom-5" />
                    <Row className="payment-row" justify="space-between">
                      <strong className="font-size-text">Khách cần trả</strong>
                      <strong className="text-success font-size-text">
                        {formatCurrency(customerNeedToPayValue)}
                      </strong>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Card>
            {/*--- end product ---*/}

            {/*--- shipment ---*/}
            {OrderDetail !== null &&
            OrderDetail?.fulfillments !== undefined &&
            OrderDetail?.fulfillments !== null &&
            OrderDetail?.fulfillments.length > 0 &&
            OrderDetail?.fulfillments[0].shipment !== null ? (
              <Card
                className="margin-top-20"
                title={
                  <Space>
                    <div className="d-flex" style={{ marginTop: "5px" }}>
                      <span className="title-card">ĐÓNG GÓI VÀ GIAO HÀNG</span>
                    </div>
                    {shipmentStatusTag.map((statusTag) => {
                      return (
                        statusTag.status ===
                          (OrderDetail &&
                            OrderDetail?.fulfillments &&
                            OrderDetail?.fulfillments[0].status) && (
                          <Tag
                            className="orders-tag text-menu"
                            style={{
                              color: `${statusTag.color}`,
                              backgroundColor: `${statusTag.backgroundColor}`,
                            }}
                          >
                            {statusTag.name}
                          </Tag>
                        )
                      );
                    })}
                  </Space>
                }
                extra={
                  <Space size={26}>
                    <div className="text-menu">
                      <img
                        src={calendarOutlined}
                        style={{ marginRight: 9.5 }}
                        alt=""
                      ></img>
                      <span style={{ color: "#222222", lineHeight: "16px" }}>
                        {OrderDetail?.fulfillments !== null &&
                          OrderDetail?.fulfillments !== undefined &&
                          OrderDetail?.fulfillments.map((item, index) =>
                            moment(item.shipment?.created_date).format(
                              "DD/MM/YYYY"
                            )
                          )}
                      </span>
                      <span
                        style={{
                          marginLeft: 6,
                          color: "#737373",
                          fontSize: "14px",
                        }}
                      >
                        (Giờ hành chính)
                      </span>
                    </div>
                    <div className="text-menu">
                      <img src={eyeOutline} alt="eye"></img>
                      <span style={{ marginLeft: "5px" }}>
                        {requirementName}
                      </span>
                    </div>
                  </Space>
                }
              >
                <div className="padding-24" style={{ paddingTop: 6 }}>
                  <Collapse
                    className="saleorder_shipment_order_colapse"
                    defaultActiveKey={["1"]}
                    expandIcon={({ isActive }) => (
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
                  >
                    <Panel
                      className="orders-timeline-custom"
                      header={
                        <Row gutter={24}>
                          <Col style={{ padding: 0 }}>
                            <p
                              ref={copyRef}
                              className="text-field"
                              style={{ color: "#2A2A86", fontWeight: 500 }}
                            >
                              {OrderDetail?.fulfillments !== null &&
                                OrderDetail?.fulfillments !== undefined &&
                                OrderDetail?.fulfillments.map(
                                  (item, index) => item.id
                                )}
                            </p>
                          </Col>
                          <Col
                            style={{
                              padding: 0,
                              marginLeft: 6,
                              marginBottom: 8,
                              width: 30,
                              height: 30,
                            }}
                          >
                            <img
                              onClick={(e) => copyOrderID(e)}
                              src={copyFileBtn}
                              alt=""
                              style={{ marginTop: "5px", width: "77%" }}
                            />
                          </Col>
                        </Row>
                      }
                      key="1"
                    >
                      <Row gutter={24}>
                        <Col md={6}>
                          <Col span={24}>
                            <p className="text-field">Đối tác giao hàng:</p>
                          </Col>
                          <Col span={24}>
                            <b>
                              {OrderDetail?.fulfillments !== null &&
                                OrderDetail?.fulfillments !== undefined &&
                                OrderDetail.fulfillments[0].shipment
                                  ?.shipper_name}
                            </b>
                          </Col>
                        </Col>

                        <Col md={6}>
                          <Col span={24}>
                            <p className="text-field">Phí ship báo khách:</p>
                          </Col>
                          <Col span={24}>
                            <b className="text-field">
                              {OrderDetail?.fulfillments !== null &&
                                OrderDetail?.fulfillments !== undefined &&
                                OrderDetail.fulfillments[0].shipment
                                  ?.shipping_fee_informed_to_customer}
                            </b>
                          </Col>
                        </Col>

                        <Col md={6}>
                          <Col span={24}>
                            <p className="text-field">Phí ship trả đối tác:</p>
                          </Col>
                          <Col span={24}>
                            <b className="text-field">
                              {OrderDetail?.fulfillments !== null &&
                                OrderDetail?.fulfillments !== undefined &&
                                OrderDetail.fulfillments[0].shipment
                                  ?.shipping_fee_paid_to_three_pls}
                            </b>
                          </Col>
                        </Col>
                      </Row>
                      <Row gutter={24} style={{marginTop: 6}}>
                      <Col span={24}>
                          <p className="text-field" style={{padding: "0px 12px"}}>{OrderDetail?.items.reduce((a: any, b:any) => a + b.quantity, 0)} Sản phẩm giao hàng</p>
                          </Col>
                      </Row>
                    </Panel>
                  </Collapse>
                </div>
                <Divider style={{ margin: "0px" }} />
                <div className="padding-24 text-right">
                  <Button
                    type="default"
                    className="create-button-custom ant-btn-outline fixed-button saleorder_shipment_cancel_btn"
                    style={{ color: "#737373", border: "1px solid #E5E5E5" }}
                    hidden={stepsStatusValue === FulFillmentStatus.SHIPPED}
                  >
                    Hủy
                  </Button>

                  {stepsStatusValue === OrderStatus.FINALIZED && (
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={onOkShippingConfirm}
                    >
                      Nhặt hàng
                    </Button>
                  )}

                  {stepsStatusValue === FulFillmentStatus.PICKED && (
                    <Button
                      type="primary"
                      className="create-button-custom ant-btn-outline fixed-button"
                      style={{ marginLeft: "10px" }}
                      onClick={onOkShippingConfirm}
                    >
                      Đóng gói
                    </Button>
                  )}
                  {stepsStatusValue === FulFillmentStatus.PACKED && (
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={() => setIsvibleShippingConfirm(true)}
                    >
                      Xuất kho
                    </Button>
                  )}
                  {stepsStatusValue === FulFillmentStatus.SHIPPING && (
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={() => setIsvibleShippedConfirm(true)}
                    >
                      Đã giao hàng
                    </Button>
                  )}
                  {stepsStatusValue === FulFillmentStatus.SHIPPED && (
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      // onClick={onOkShippingConfirm}
                    >
                      Đổi trả hàng
                    </Button>
                  )}
                </div>
              </Card>
            ) : (
              <Card
                className="margin-top-20"
                title={
                  <Space>
                    <div className="d-flex" style={{ marginTop: "5px" }}>
                      <span className="title-card">ĐÓNG GÓI VÀ GIAO HÀNG</span>
                    </div>
                    <Tag
                      className="orders-tag text-menu"
                      style={{
                        color: "#FCAF17",
                        backgroundColor: "rgba(252, 175, 23, 0.1)",
                      }}
                    >
                      {OrderDetail?.fulfillment_status !== null
                        ? OrderDetail?.fulfillment_status
                        : "Chưa giao hàng"}
                    </Tag>
                  </Space>
                }
              >
                {isVisibleShipping === true && (
                  <div className="padding-24">
                    <Form
                      initialValues={initialFormUpdateShipment}
                      ref={formRef}
                      onFinish={onFinishUpdateFulFillment}
                      layout="vertical"
                    >
                      <Row
                        gutter={24}
                        style={{ justifyContent: "space-between" }}
                      >
                        <Col md={9}>
                          <span
                            style={{
                              float: "left",
                              lineHeight: "40px",
                              marginRight: "10px",
                            }}
                          >
                            Hẹn giao:
                          </span>
                          <Form.Item name="dating_ship">
                            <DatePicker
                              format="DD/MM/YYYY HH:mm A"
                              style={{ width: "100%" }}
                              className="r-5 w-100 ip-search"
                              placeholder="Chọn ngày giao"
                            />
                          </Form.Item>
                        </Col>

                        <Col md={6}>
                          <Form.Item>
                            <Checkbox style={{ marginTop: "8px" }}>
                              Giờ hành chính
                            </Checkbox>
                          </Form.Item>
                        </Col>
                        <Col md={9}>
                          <span
                            style={{
                              float: "left",
                              lineHeight: "40px",
                              marginRight: "10px",
                            }}
                          >
                            Yêu cầu:
                          </span>
                          <Form.Item name="requirements">
                            <Select
                              onChange={(value) =>
                                setRequirementNameCallback(value)
                              }
                              className="select-with-search"
                              showSearch
                              showArrow
                              notFoundContent="Không tìm thấy kết quả"
                              style={{ width: "100%" }}
                              placeholder="Chọn yêu cầu"
                              filterOption={(input, option) => {
                                if (option) {
                                  return (
                                    option.children
                                      .toLowerCase()
                                      .indexOf(input.toLowerCase()) >= 0
                                  );
                                }
                                return false;
                              }}
                            >
                              {shipping_requirements?.map((item, index) => (
                                <Select.Option
                                  style={{ width: "100%" }}
                                  key={index.toString()}
                                  value={item.value}
                                >
                                  {item.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row>
                        <div
                          className="saleorder_shipment_method_btn"
                          style={
                            shipmentMethod === ShipmentMethodOption.DELIVERLATER
                              ? { border: "none" }
                              : { borderBottom: "1px solid #2A2A86" }
                          }
                        >
                          <Space size={10}>
                            {shipmentButton.map((button) => (
                              <div>
                                {shipmentMethod !== button.value ? (
                                  <div
                                    className="saleorder_shipment_button"
                                    key={button.value}
                                    onClick={() =>
                                      ShipMethodOnChange(button.value)
                                    }
                                  >
                                    <img src={button.icon} alt="icon"></img>
                                    <span>{button.name}</span>
                                  </div>
                                ) : (
                                  <div
                                    className={
                                      shipmentMethod ===
                                      ShipmentMethodOption.DELIVERLATER
                                        ? "saleorder_shipment_button saleorder_shipment_button_border"
                                        : "saleorder_shipment_button_active"
                                    }
                                    key={button.value}
                                  >
                                    <img src={button.icon} alt="icon"></img>
                                    <span>{button.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </Space>
                        </div>
                      </Row>
                      <div hidden={shipmentMethod !== 2}>
                        <Row gutter={24}>
                          <Col md={12}>
                            
                            <Form.Item
                              label="Đối tác giao hàng"
                              name="shipper_code"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn đối tác giao hàng",
                                },
                              ]}
                            >
                              <CustomSelect
                                className="select-with-search"
                                showSearch
                                style={{ width: "100%" }}
                                notFoundContent="Không tìm thấy kết quả"
                                placeholder="Chọn đối tác giao hàng"
                                // suffix={
                                //   <Button
                                //     style={{ width: 36, height: 36 }}
                                //     icon={<PlusOutlined />}
                                //   />
                                // }
                                filterOption={(input, option) => {
                                  if (option) {
                                    return (
                                      option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                    );
                                  }
                                  return false;
                                }}
                              >
                                {shipper?.map((item, index) => (
                                  <CustomSelect.Option
                                    style={{ width: "100%" }}
                                    key={index.toString()}
                                    value={item.code}
                                  >
                                    {`${item.full_name} - ${item.mobile}`}
                                  </CustomSelect.Option>
                                ))}
                              </CustomSelect>
                            </Form.Item>
                            {isShowTakeHelper && (
                              <Form.Item label="Tiền thu hộ">
                                <NumberInput
                                  format={(a: string) => formatCurrency(a)}
                                  replace={(a: string) =>
                                    replaceFormatString(a)
                                  }
                                  placeholder="0"
                                  style={{
                                    textAlign: "right",
                                    width: "100%",
                                    color: "#222222",
                                  }}
                                  maxLength={15}
                                  minLength={0}
                                  value={takeMoneyHelper || takeHelperValue}
                                  onChange={(value) =>
                                    setTakeMoneyHelper(value)
                                  }
                                />
                              </Form.Item>
                            )}
                          </Col>
                          <Col md={12}>
                            <Form.Item
                              name="shipping_fee_paid_to_three_pls"
                              label="Phí ship trả đối tác giao hàng"
                            >
                              <NumberInput
                                format={(a: string) => formatCurrency(a)}
                                replace={(a: string) => replaceFormatString(a)}
                                placeholder="0"
                                style={{
                                  textAlign: "right",
                                  width: "100%",
                                  color: "#222222",
                                }}
                                maxLength={15}
                                minLength={0}
                                onChange={() => {}}
                              />
                            </Form.Item>
                            <Form.Item
                              name="shipping_fee_informed_to_customer"
                              label="Phí ship báo khách"
                            >
                              <NumberInput
                                format={(a: string) => formatCurrency(a)}
                                replace={(a: string) => replaceFormatString(a)}
                                placeholder="0"
                                style={{
                                  textAlign: "right",
                                  width: "100%",
                                  color: "#222222",
                                }}
                                maxLength={15}
                                minLength={0}
                                onChange={(e: any) =>
                                  setShippingFeeInformedCustomer(e)
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col md={24}>
                            <div>
                              <Button
                                type="primary"
                                className="ant-btn-outline fixed-button text-right"
                                style={{ float: "right" }}
                                htmlType="submit"
                              >
                                Tạo đơn giao hàng
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Form>
                    {/*--- Nhận tại cửa hàng ----*/}
                    <div
                      className="receive-at-store"
                      hidden={shipmentMethod !== 3}
                    >
                      <Row style={{ marginBottom: "10px" }}>
                        Nhận tại cửa hàng
                      </Row>
                      <Row className="row-info">
                        <Space>
                          <div className="row-info-icon">
                            <img src={storeBluecon} alt="" width="20px" />
                          </div>
                          <div className="row-info-title">Cửa hàng</div>
                          <div className="row-info-content">
                            <Typography.Link>
                              {storeDetail?.name}
                            </Typography.Link>
                          </div>
                        </Space>
                      </Row>
                      <Row className="row-info">
                        <Space>
                          <div className="row-info-icon">
                            <img src={callIcon} alt="" width="18px" />
                          </div>
                          <div className="row-info-title">Điện thoại</div>
                          <div className="row-info-content">
                            {storeDetail?.hotline}
                          </div>
                        </Space>
                      </Row>
                      <Row className="row-info">
                        <Space>
                          <div className="row-info-icon">
                            <img src={locationIcon} alt="" width="18px" />
                          </div>
                          <div className="row-info-title">Địa chỉ</div>
                          <div className="row-info-content">
                            {storeDetail?.address}
                          </div>
                        </Space>
                      </Row>
                    </div>

                    {/*--- Giao hàng sau ----*/}
                    <Row
                      className="ship-later-box"
                      hidden={shipmentMethod !== 4}
                    ></Row>
                  </div>
                )}

                {isVisibleShipping === false && (
                  <div
                    className="padding-lef-right"
                    style={{ paddingTop: "20px" }}
                  >
                    <label
                      className="text-left"
                      style={{ marginTop: "20px", lineHeight: "40px" }}
                    >
                      <i>Chưa tạo đơn giao hàng</i>{" "}
                    </label>
                    <Button
                      type="primary"
                      className="ant-btn-outline fixed-button text-right"
                      style={{ float: "right", marginBottom: "20px" }}
                      onClick={ShowShipping}
                    >
                      Giao hàng
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/*--- end shipment ---*/}

            {/*--- payment ---*/}
            {OrderDetail !== null &&
              OrderDetail.payments !== null &&
              OrderDetail.payments?.length > 0 && (
                <Card
                  className="margin-top-20"
                  title={
                    <Space>
                      <div className="d-flex" style={{ marginTop: "5px" }}>
                        <span className="title-card">THANH TOÁN</span>
                      </div>
                      {checkPaymentStatusToShow(OrderDetail) === -1 && (
                        <Tag className="orders-tag orders-tag-danger">
                          Chưa thanh toán
                        </Tag>
                      )}
                      {checkPaymentStatusToShow(OrderDetail) === 0 && (
                        <Tag className="orders-tag orders-tag-warrning">
                          Thanh toán 1 phần
                        </Tag>
                      )}
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
                  <div className="padding-24">
                    <Row>
                      <Col span={12}>
                        <span className="text-field margin-right-40">
                          Đã thanh toán:
                        </span>
                        <b>
                          {(OrderDetail?.fulfillments &&
                            OrderDetail?.fulfillments[0].status === "shipped" &&
                            formatCurrency(customerNeedToPayValue)) ||
                            formatCurrency(
                              getAmountPayment(OrderDetail.payments)
                            )}
                        </b>
                      </Col>
                      <Col span={12}>
                        <span className="text-field margin-right-40">
                          Còn phải trả
                        </span>
                        <span className="text-success">
                          {/* {formatCurrency(
                            OrderDetail.total -
                              getAmountPayment(OrderDetail.payments)
                          )} */}
                          {OrderDetail?.fulfillments &&
                          OrderDetail?.fulfillments[0].status !== "shipped"
                            ? formatCurrency(
                                customerNeedToPayValue -
                                  (OrderDetail?.total_paid
                                    ? OrderDetail?.total_paid
                                    : 0)
                              )
                            : 0}
                        </span>
                      </Col>
                    </Row>
                  </div>

                  {OrderDetail?.payments !== null && (
                    <div>
                      <div style={{ padding: "0 24px 24px 24px" }}>
                        <Collapse
                          className="orders-timeline"
                          expandIcon={({ isActive }) => (
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
                        >
                          <Panel
                            className="orders-timeline-custom success-collapse"
                            header={
                              <span style={{ color: "#222222" }}>
                                Đã thanh toán:
                                <b>
                                  {OrderDetail?.payments !== null &&
                                    OrderDetail?.payments.map(
                                      (item, index) =>
                                        item.payment_method + ", "
                                    )}
                                </b>
                              </span>
                            }
                            key="1"
                            extra={
                              <>
                                {OrderDetail?.payments !== null && (
                                  <div>
                                    <span className="fixed-time text-field">
                                      {ConvertUtcToLocalDate(getDateLastPayment(OrderDetail), "DD/MM/YYYY HH:mm")}
                                    </span>
                                  </div>
                                )}
                              </>
                            }
                          >
                            <Row gutter={24}>
                              {OrderDetail?.payments !== null &&
                                OrderDetail?.payments.map((item, index) => (
                                  <Col span={12}>
                                    <p style={{ color: "#737373" }}>
                                      {item.payment_method}
                                    </p>
                                    <b>{formatCurrency(item.paid_amount)}</b>
                                  </Col>
                                ))}
                            </Row>
                          </Panel>
                          {/* <Panel key="2" showArrow={false} header="COD" /> */}

                          {OrderDetail &&
                            OrderDetail.fulfillments &&
                            OrderDetail.fulfillments.length > 0 &&
                            OrderDetail.fulfillments[0].shipment &&
                            OrderDetail.fulfillments[0].shipment?.cod !==
                              null && (
                              <Panel
                                className="orders-timeline-custom"
                                showArrow={false}
                                header={
                                  <span>
                                    COD
                                    <b style={{ marginLeft: "200px" }}>
                                      {OrderDetail !== null &&
                                      OrderDetail.fulfillments !== undefined &&
                                      OrderDetail.fulfillments !== null
                                        ? formatCurrency(
                                            OrderDetail.fulfillments[0].shipment
                                              ?.cod
                                          )
                                        : 0}
                                    </b>
                                  </span>
                                }
                                key="2"
                              ></Panel>
                            )}
                        </Collapse>
                      </div>{" "}
                    </div>
                  )}
                  {isShowPaymentPartialPayment && OrderDetail !== null && (
                    <UpdatePaymentCard
                      setSelectedPaymentMethod={onPaymentSelect}
                      setPayments={onPayments}
                      paymentMethod={paymentType}
                      showPartialPayment={true}
                      amount={
                        OrderDetail.total -
                        getAmountPayment(OrderDetail.payments)
                      }
                      order_id={OrderDetail.id}
                      orderDetail={OrderDetail}
                      setTotalPaid={setTotalPaid}
                    />
                  )}
                  {checkPaymentAll(OrderDetail) !== 1 &&
                    isShowPaymentPartialPayment === false && (
                      <div className="padding-24 text-right">
                        <Divider style={{ margin: "10px 0" }} />
                        <Button
                          type="primary"
                          className="ant-btn-outline fixed-button"
                          onClick={() => setShowPaymentPartialPayment(true)}
                        >
                          Thanh toán
                        </Button>
                      </div>
                    )}
                </Card>
              )}

            {/* COD toàn phần */}
            {OrderDetail &&
              OrderDetail.fulfillments &&
              OrderDetail.fulfillments.length > 0 &&
              OrderDetail.fulfillments[0].shipment &&
              OrderDetail.fulfillments[0].shipment?.cod ===
                OrderDetail.total && (
                <Card
                  className="margin-top-20"
                  title={
                    <Space>
                      <div className="d-flex" style={{ marginTop: "5px" }}>
                        <span className="title-card">THANH TOÁN</span>
                      </div>
                      {checkPaymentStatusToShow(OrderDetail) === -1 && (
                        <Tag className="orders-tag orders-tag-danger">
                          Chưa thanh toán
                        </Tag>
                      )}
                      {checkPaymentStatusToShow(OrderDetail) === 0 && (
                        <Tag className="orders-tag orders-tag-warrning">
                          Thanh toán 1 phần
                        </Tag>
                      )}
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
                  <div className="padding-24">
                    <Row>
                      <Col span={12}>
                        <span className="text-field margin-right-40">
                          Đã thanh toán:
                        </span>
                        <span>0</span>
                      </Col>
                      <Col span={12}>
                        <span className="text-field margin-right-40">
                          Còn phải trả
                        </span>
                        <span className="text-success">
                          {OrderDetail && OrderDetail?.fulfillments
                            ? formatCurrency(
                                OrderDetail.fulfillments[0].shipment?.cod
                              )
                            : 0}
                        </span>
                      </Col>
                    </Row>
                  </div>
                  <Divider style={{ margin: "0px" }} />
                  <div className="padding-24">
                    <Collapse
                      className="orders-timeline"
                      defaultActiveKey={["1"]}
                      ghost
                    >
                      <Panel
                        className="orders-timeline-custom"
                        showArrow={false}
                        header={
                          <span>
                            COD
                            <b style={{ marginLeft: "200px" }}>
                              {OrderDetail !== null &&
                              OrderDetail.fulfillments !== undefined &&
                              OrderDetail.fulfillments !== null
                                ? formatCurrency(
                                    OrderDetail.fulfillments[0].shipment?.cod
                                  )
                                : 0}
                            </b>
                          </span>
                        }
                        key="1"
                      >
                        <Row gutter={24}>
                          {OrderDetail?.payments !== null &&
                            OrderDetail?.payments.map((item, index) => (
                              <Col span={12}>
                                <p className="text-field">
                                  {item.payment_method}
                                </p>
                                <p>{formatCurrency(item.paid_amount)}</p>
                              </Col>
                            ))}
                        </Row>
                      </Panel>
                    </Collapse>
                  </div>

                  <div className="padding-24 text-right">
                    {OrderDetail?.payments !== null
                      ? OrderDetail?.payments.map(
                          (item, index) =>
                            OrderDetail.total !== null &&
                            OrderDetail.total - item.paid_amount !== 0 && (
                              <Button
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

            {/* Chưa thanh toán đơn nháp*/}
            {OrderDetail !== null &&
              OrderDetail.payments?.length === 0 &&
              (OrderDetail.fulfillments?.length === 0 ||
                (OrderDetail.fulfillments !== undefined &&
                  OrderDetail.fulfillments !== null &&
                  OrderDetail.fulfillments[0].shipment === null)) && (
                <UpdatePaymentCard
                  setSelectedPaymentMethod={onPaymentSelect}
                  setPayments={onPayments}
                  paymentMethod={paymentType}
                  amount={OrderDetail.total + shippingFeeInformedCustomer}
                  order_id={OrderDetail.id}
                  orderDetail={OrderDetail}
                  showPartialPayment={false}
                  setTotalPaid={setTotalPaid}
                />
              )}

            {/*--- end payment ---*/}
          </Col>

          <Col xs={24} lg={6}>
            <Card
              className="card-block card-block-normal"
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN ĐƠN HÀNG</span>
                </div>
              }
            >
              <div className="padding-24">
                <Row className="" gutter={5}>
                  <Col span={9}>Cửa hàng</Col>
                  <Col span={15}>
                    <span className="text-focus">{OrderDetail?.store}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Điện thoại</Col>
                  <Col span={15}>
                    <span>{OrderDetail?.customer_phone_number}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Địa chỉ</Col>
                  <Col span={15}>
                    <span>{OrderDetail?.shipping_address?.full_address}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>NVBH</Col>
                  <Col span={15}>
                    <span className="text-focus">{OrderDetail?.assignee}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Người tạo</Col>
                  <Col span={15}>
                    <span className="text-focus">{OrderDetail?.account}</span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Thời gian</Col>
                  <Col span={15}>
                    <span>
                      {OrderDetail?.fulfillments !== null &&
                        OrderDetail?.fulfillments !== undefined &&
                        OrderDetail?.fulfillments.map((item, index) =>
                          moment(item.shipment?.created_date).format(
                            "DD/MM/YYYY HH:mm a"
                          )
                        )}
                    </span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Đường dẫn</Col>
                  <Col span={15}>
                    <span className="text-focus">
                      {OrderDetail?.url !== undefined
                        ? OrderDetail?.url
                        : "Không"}
                    </span>
                  </Col>
                </Row>
              </div>
            </Card>

            <Card
              className="margin-top-20"
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN BỔ SUNG</span>
                </div>
              }
            >
              <div className="padding-24">
                <Row className="" gutter={5}>
                  <Col span={9}>Ghi chú</Col>
                  <Col span={15}>
                    <span className="text-focus">
                      {OrderDetail?.note !== ""
                        ? OrderDetail?.note
                        : "Không có ghi chú"}
                    </span>
                  </Col>
                </Row>

                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Tags</Col>
                  <Col span={15}>
                    <span className="text-focus">
                      {OrderDetail?.tags !== ""
                        ? OrderDetail?.tags
                        : "Không có tags"}
                    </span>
                  </Col>
                </Row>
              </div>
            </Card>
            <Card className="margin-top-20">
              <div className="padding-24">
                <span className="text-focus">Lịch sử thao tác đơn hàng</span>
              </div>
            </Card>
          </Col>
        </Row>
        <Row
          gutter={24}
          className="margin-top-10"
          style={{
            position: "fixed",
            textAlign: "right",
            width: "100%",
            height: "55px",
            bottom: "0%",
            backgroundColor: "#FFFFFF",
            marginLeft: "-31px",
            display: `${isShowBillStep ? "" : "none"}`,
          }}
        >
          <Col
            md={10}
            style={{ marginLeft: "-20px", marginTop: "3px", padding: "3px" }}
          >
            <CreateBillStep status={stepsStatusValue} orderDetail={null} />
          </Col>
        </Row>
      </div>
      <SaveAndConfirmOrder
        onCancel={() => setIsvibleShippingConfirm(false)}
        onOk={onOkShippingConfirm}
        visible={isvibleShippingConfirm}
        title="Thông báo"
        text={`Bạn có chắc chắn đơn hàng đã “Xuất kho” ? `}
      />
      <SaveAndConfirmOrder
        onCancel={() => setIsvibleShippedConfirm(false)}
        onOk={onOkShippingConfirm}
        visible={isvibleShippedConfirm}
        title="Thông báo"
        text={`Bạn có chắc chắn đơn hàng đã “Giao thành công” ? `}
      />
    </ContentContainer>
  );
};

export default OrderDetail;


// ${
//   customerNeedToPayValue -
//   (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
//     ? `với tiền thu hộ là: ` +
//       formatCurrency(
//         customerNeedToPayValue -
//           (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
//       )
//     : ""
// } không?`

// ${
//   customerNeedToPayValue -
//   (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
//     ? ` với tiền thu hộ là: ` +
//       formatCurrency(
//         customerNeedToPayValue -
//           (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0)
//       )
//     : ""
// } không?