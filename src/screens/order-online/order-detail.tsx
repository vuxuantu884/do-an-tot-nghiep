//#region Import
import {
  Button,
  Card,
  Row,
  Col,
  Form,
  Space,
  Typography,
  Divider,
  Checkbox,
  Tag,
  Collapse,
  DatePicker,
  FormInstance,
  Select,
} from "antd";
import UpdatePaymentCard from "./component/update-payment-card";
import React, {
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
import callIcon from "assets/img/call.svg";
import locationIcon from "assets/img/location.svg";
import storeBluecon from "assets/img/storeBlue.svg";
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
import {
  OrderResponse,
  StoreCustomResponse,
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
  replaceFormatString,
  SumCOD,
} from "utils/AppUtils";
import { showSuccess } from "utils/ToastUtils";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
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
import SaveAndConfirmOrder from "./modal/save-confirm.modal";
import NumberInput from "component/custom/number-input.custom";
import { setTimeout } from "timers";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import UpdateProductCard from "./component/update-product-card";
import UpdateCustomerCard from "./component/update-customer-card";
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
  const [isVisibleShipping, setVisibleShipping] = useState(false);
  const [isError, setError] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [OrderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [shipmentMethod, setShipmentMethod] = useState<number>(4);
  const [storeDetail, setStoreDetail] = useState<StoreCustomResponse>();
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [customerDetail, setCustomerDetail] = useState<CustomerResponse | null>(
    null
  );
  const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
    useState<number>(0);
  const [isvibleShippedConfirm, setIsvibleShippedConfirm] =
    useState<boolean>(false);
  const [requirementName, setRequirementName] = useState<string | null>(null);
  const [takeMoneyHelper, setTakeMoneyHelper] = useState<number | null>(null);
  const [isShowBillStep, setIsShowBillStep] = useState<boolean>(false);
  const [totalPaid, setTotalPaid] = useState<number>(0);
  const [isArrowRotation, setIsArrowRotation] = useState<boolean>(false);
  const [isVisibleUpdatePayment, setVisibleUpdatePayment] = useState(false);
  //#endregion
  //#region Orther
  const ShowShipping = () => {
    setVisibleShipping(true);
  };

  const onPaymentSelect = (paymentType: number) => {
    if (paymentType === 1) {
      setVisibleShipping(true);
    }
    setPaymentType(paymentType);
  };

  const onPayments = (value: Array<OrderPaymentRequest>) => {
    setPayments(value);
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
    e.target.style.width = "26px";
    const decWidth = setTimeout(() => {
      e.target.style.width = "23px";
    }, 100);
    clearTimeout(decWidth);
    let selection = window.getSelection();
    let range = document.createRange();
    range.selectNodeContents(copyRef?.current);
    selection && selection.removeAllRanges();
    selection && selection.addRange(range);
    document.execCommand("Copy");
  };
  //#region Product
  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);
    },
    []
  );

  const ShipMethodOnChange = (value: number) => {
    setShipmentMethod(value);
    if (
      OrderDetail !== null &&
      value === ShipmentMethodOption.SELFDELIVER &&
      checkPaymentStatusToShow(OrderDetail) !== 1
    ) {
      setPaymentType(PaymentMethodOption.COD);
      setVisibleUpdatePayment(true);
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
  }, [dispatch, OrderId, onGetDetailSuccess]);

  useLayoutEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);

  useLayoutEffect(() => {
    dispatch(AccountSearchAction({}, setDataAccounts));
  }, [dispatch, setDataAccounts]);

  //#endregion

  //#region Update Fulfillment Status
  let timeout = 500;
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
    let fulfillment_id = OrderDetail?.fulfillments
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
  console.log(OrderDetail);
  const onOkShippingConfirm = () => {
    if (
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED &&
      OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type != "pick_at_store"
    ) {
      fulfillmentTypeOrderRequest(1);
    } else if (stepsStatusValue === FulFillmentStatus.PICKED || (OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED
      && OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type == "pick_at_store")) {
      fulfillmentTypeOrderRequest(2);
    } else if (stepsStatusValue === FulFillmentStatus.PACKED && 
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type !== "pick_at_store") {
      fulfillmentTypeOrderRequest(3);
    } else if (stepsStatusValue === FulFillmentStatus.SHIPPING || (OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].status === FulFillmentStatus.PACKED && 
      OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type == "pick_at_store")) {
      fulfillmentTypeOrderRequest(4);
    }
  };
  //#endregion
  const confirmExportAndFinishValue = () => {
    if (takeMoneyHelper) {
      return takeMoneyHelper;
    } 
    else if(
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].shipment.delivery_service_provider_type=="pick_at_store"
    ){
      let money =  OrderDetail.total
      OrderDetail?.payments?.map(p=>{
        money = money-p.paid_amount
      })
      return money
    }
    else if (
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
    ) {
      return (
        OrderDetail?.fulfillments[0].shipment
          .shipping_fee_informed_to_customer +
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) -
        (OrderDetail?.discounts &&
        OrderDetail?.discounts.length > 0 &&
        OrderDetail?.discounts[0].amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    } else if (OrderDetail?.total && OrderDetail?.total_paid) {
      return (
        OrderDetail?.total +
        shippingFeeInformedCustomer -
        OrderDetail?.total_paid
      );
    } else if (
      OrderDetail &&
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].shipment.cod
    ) {
      return OrderDetail?.fulfillments[0].shipment.cod;
    }
  };
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
    if (OrderDetail?.fulfillments) {
      if(shipmentMethod==4){
      value.delivery_service_provider_type = "Shipper";
      }else if(shipmentMethod==3){
        value.delivery_service_provider_type = "pick_at_store";
      }
    }
    if (OrderDetail != null) {
      FulFillmentRequest.order_id = OrderDetail.id;
      if (OrderDetail.fulfillments && OrderDetail.fulfillments.length !== 0) {
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
    if (
      OrderDetail?.status === "draft" &&
      customerNeedToPayValue === totalPaid
    ) {
      value.cod = customerNeedToPayValue;
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
  const getRequirementName = useCallback(() => {
    if (
      OrderDetail &&
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
  }, [OrderDetail, shipping_requirements]);

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
  }, [dispatch, OrderDetail?.store_id, getRequirementName]);

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

  //#endregion

  // Thu hộ
  const takeHelper: any = () => {
    if (
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].total
    ) {
      return (
        (OrderDetail?.fulfillments[0].total
          ? OrderDetail?.fulfillments[0].total
          : 0) +
        shippingFeeInformedCustomer -
        totalPaid -
        (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) -
        (OrderDetail?.total_discount ? OrderDetail?.total_discount : 0)
      );
    } else if (OrderDetail?.total_line_amount_after_line_discount) {
      return (
        (OrderDetail?.total_line_amount_after_line_discount
          ? OrderDetail?.total_line_amount_after_line_discount
          : 0) +
        shippingFeeInformedCustomer -
        totalPaid -
        (OrderDetail?.total_paid ? OrderDetail?.total_paid : 0) -
        (OrderDetail?.discounts &&
        OrderDetail?.discounts.length > 0 &&
        OrderDetail?.discounts[0].amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    }
  };
  let takeHelperValue: any = takeHelper();
  const showTakeHelper = () => {
    if (OrderDetail?.total_line_amount_after_line_discount) {
      return (
        OrderDetail?.total_line_amount_after_line_discount -
          totalPaid +
          shippingFeeInformedCustomer -
          (OrderDetail?.discounts &&
          OrderDetail?.discounts.length > 0 &&
          OrderDetail?.discounts[0].amount
            ? OrderDetail?.discounts[0].amount
            : 0) !==
        0
      );
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
    if (
      OrderDetail?.fulfillments &&
      OrderDetail?.fulfillments.length > 0 &&
      OrderDetail?.fulfillments[0].shipment &&
      OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
    ) {
      return (
        OrderDetail?.fulfillments[0].shipment
          .shipping_fee_informed_to_customer +
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.discounts &&
        OrderDetail?.discounts.length > 0 &&
        OrderDetail?.discounts[0].amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    } else if (OrderDetail?.total_line_amount_after_line_discount) {
      return (
        OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (OrderDetail?.discounts &&
        OrderDetail?.discounts.length > 0 &&
        OrderDetail?.discounts[0].amount
          ? OrderDetail?.discounts[0].amount
          : 0)
      );
    }
  };

  const customerNeedToPayValue = customerNeedToPay();
  // end
  const scroll = useCallback(() => {
    if (window.pageYOffset > 100) {
      setIsShowBillStep(true);
    } else {
      setIsShowBillStep(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
    };
  }, [scroll]);

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
          <Col md={18}>
            {/*--- customer ---*/}
            <UpdateCustomerCard
              OrderDetail={OrderDetail}
              customerDetail={customerDetail}
            />
            {/*--- end customer ---*/}

            {/*--- product ---*/}
            <UpdateProductCard
              OrderDetail={OrderDetail}
              shippingFeeInformedCustomer={shippingFeeInformedCustomer}
              customerNeedToPayValue={customerNeedToPayValue}
            />
            {/*--- end product ---*/}

            {/*--- shipment ---*/}
            {OrderDetail?.fulfillments &&
            OrderDetail.fulfillments.length > 0 &&
            OrderDetail?.fulfillments[0].shipment !== null ? (
              <Card
                className="margin-top-20 orders-update-shipment"
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
                            key={statusTag.name}
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
                <div
                  className="padding-24"
                  style={{ paddingTop: 6, paddingBottom: 4 }}
                >
                  <Collapse
                    className="saleorder_shipment_order_colapse payment_success"
                    defaultActiveKey={["1"]}
                    onChange={() => setIsArrowRotation(!isArrowRotation)}
                    ghost
                  >
                    <Panel
                      className="orders-timeline-custom"
                      showArrow={false}
                      header={
                        <Row>
                          <Col>
                            <p
                              ref={copyRef}
                              className="text-field"
                              style={{
                                color: "#2A2A86",
                                fontWeight: 500,
                                fontSize: 18,
                              }}
                            >
                              {OrderDetail?.fulfillments &&
                                OrderDetail?.fulfillments.map(
                                  (item, index) => item.code
                                )}
                            </p>
                            <div style={{ width: 30, padding: "0 4px" }}>
                              <img
                                onClick={(e) => copyOrderID(e)}
                                src={copyFileBtn}
                                alt=""
                                style={{ width: 23 }}
                              />
                            </div>
                            <img
                              src={doubleArrow}
                              alt=""
                              style={{
                                transform: `${
                                  isArrowRotation
                                    ? "rotate(270deg)"
                                    : "rotate(0deg)"
                                }`,
                              }}
                            />
                          </Col>
                          <Col>
                            <span
                              style={{ color: "#000000d9", marginRight: 6 }}
                            >
                              Ngày tạo:
                            </span>
                            <span style={{ color: "#000000d9" }}>
                              {OrderDetail?.fulfillments &&
                                OrderDetail?.fulfillments.map((item, index) =>
                                  moment(item.shipment?.created_date).format(
                                    "DD/MM/YYYY"
                                  )
                                )}
                            </span>
                          </Col>
                        </Row>
                      }
                      key="1"
                    >
                      {OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type == "pick_at_store"?

                    (
                      <React.Fragment>
                          <Row gutter={24}>
                          <Col md={24}>
                          <Col span={24}>
                            <b><img src={storeBluecon} alt="" /> NHẬN TẠI CỬA HÀNG</b>
                            </Col>
                          </Col>
                          </Row>
                      <Row gutter={24} style={{paddingTop:"15px"}}>

                        <Col md={6}>
                          <Col span={24}>
                            <p className="text-field">Tên cửa hàng:</p>
                          </Col>
                          <Col span={24}>
                            <b>
                              {OrderDetail?.store}
                            </b>
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
                      </React.Fragment>
                      ):


                      (<Row gutter={24}>
                        <Col md={6}>
                          <Col span={24}>
                            <p className="text-field">Đối tác giao hàng:</p>
                          </Col>
                          <Col span={24}>
                            <b>
                              {OrderDetail?.fulfillments &&
                                OrderDetail.fulfillments.length &&
                                shipper &&
                                shipper.find(
                                  (s) =>
                                    OrderDetail.fulfillments &&
                                    OrderDetail.fulfillments[0].shipment
                                      ?.shipper_code === s.code
                                )?.full_name}
                            </b>
                          </Col>
                        </Col>

                        <Col md={6}>
                          <Col span={24}>
                            <p className="text-field">Phí ship báo khách:</p>
                          </Col>
                          <Col span={24}>
                            <b className="text-field">
                              {OrderDetail?.fulfillments &&
                                OrderDetail?.fulfillments.length > 0 &&
                                formatCurrency(
                                  OrderDetail.fulfillments[0].shipment
                                    ?.shipping_fee_informed_to_customer
                                    ? OrderDetail.fulfillments[0].shipment
                                        ?.shipping_fee_informed_to_customer
                                    : 0
                                )}
                            </b>
                          </Col>
                        </Col>

                        <Col md={6}>
                          <Col span={24}>
                            <p className="text-field">Phí ship trả đối tác:</p>
                          </Col>
                          <Col span={24}>
                            <b className="text-field">
                              {OrderDetail?.fulfillments &&
                                formatCurrency(
                                  OrderDetail.fulfillments[0].shipment
                                    ?.shipping_fee_paid_to_three_pls
                                    ? OrderDetail.fulfillments[0].shipment
                                        ?.shipping_fee_paid_to_three_pls
                                    : 0
                                )}
                            </b>
                          </Col>
                        </Col>
                      </Row>)

                      }
                      <Row
                        gutter={24}
                        style={{ marginTop: 12, marginBottom: 0 }}
                      >
                        <Col span={24}>
                          <p className="text-field">
                            {OrderDetail?.items.reduce(
                              (a: any, b: any) => a + b.quantity,
                              0
                            )}{" "}
                            Sản phẩm giao hàng
                          </p>
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

                  {stepsStatusValue === OrderStatus.FINALIZED && OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type == "pick_at_store" &&(
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={onOkShippingConfirm}
                    >
                      Nhặt hàng và đóng gói
                    </Button>
                  )}

                  {stepsStatusValue === OrderStatus.FINALIZED&& OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type != "pick_at_store" && (
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
                  {stepsStatusValue === FulFillmentStatus.PACKED && OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type != "pick_at_store" && (
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={() => setIsvibleShippingConfirm(true)}
                    >
                      Xuất kho
                    </Button>
                  )}

                  {stepsStatusValue === FulFillmentStatus.PACKED && OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type == "pick_at_store" && (
                    <Button
                      type="primary"
                      style={{ marginLeft: "10px" }}
                      className="create-button-custom ant-btn-outline fixed-button"
                      onClick={() => setIsvibleShippedConfirm(true)}
                    >
                      Xuất kho và giao hàng
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
                    {OrderDetail?.fulfillments &&
                      OrderDetail?.fulfillments.length > 0 && (
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
                      )}
                  </Space>
                }
              >
                {isVisibleShipping === true && (
                  <div className="padding-24">
                    <Form
                      initialValues={initialFormUpdateShipment}
                      ref={formRef}
                      onFinishFailed={({ errorFields }: any) => {
                        const element: any = document.getElementById(
                          errorFields[0].name.join("")
                        );
                        element?.focus();
                        const y =
                          element?.getBoundingClientRect()?.top +
                          window.pageYOffset +
                          -250;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }}
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
                              placeholder="dd/mm/yyyy"
                              disabledDate={(current: any) =>
                                current && current.valueOf() < Date.now()
                              }
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
                              <div key={button.value}>
                                {shipmentMethod !== button.value ? (
                                  <div
                                    className="saleorder_shipment_button"
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
                                  required: shipmentMethod==2,
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
                                  value={takeHelperValue}
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
                          
                        </Row>
                      </div>
                      
                    {/*--- Nhận tại cửa hàng ----*/}
                    <div
                      className="receive-at-store"
                      hidden={shipmentMethod !== 3}
                    >
                      <b><img src={storeBluecon} alt="" /> THÔNG TIN CỬA HÀNG</b>
          
          <Row style={{paddingTop:"19px"}}>
  
              
              {/* <div className="row-info-icon">
                <img src={storeBluecon} alt="" width="20px" />
              </div> */}
              <Col md={2}>
              <div>Tên cửa hàng:</div>
              </Col>
              <b className="row-info-content">
                <Typography.Link>{storeDetail?.name}</Typography.Link>
              </b>
        
          </Row>
          <Row className="row-info padding-top-10">
              {/* <div className="row-info-icon">
                <img src={callIcon} alt="" width="18px" />
              </div> */}
              <Col md={2}>
              <div>Số điện thoại:</div>
              </Col>
              <b className="row-info-content">
                {storeDetail?.hotline}
              </b>
            
          </Row>
          <Row className="row-info padding-top-10">
              {/* <div className="row-info-icon">
                <img src={locationIcon} alt="" width="18px" />
              </div> */}
              <Col md={2}>
              <div>Địa chỉ:</div>
              </Col>
              <b className="row-info-content">
                {storeDetail?.full_address}
              </b>
          </Row>
          



                    </div>
                    <Col md={24}>
                            <div>
                              <Button
                                type="primary"
                                className="create-button-custom"
                                style={{ float: "right" }}
                                htmlType="submit"
                              >
                                Lưu
                              </Button>
                              <Button
                                className="ant-btn-outline fixed-button cancle-button create-button-custom"
                                onClick={() => window.location.reload()}
                                style={{ float: "right" }}
                              >
                                Huỷ
                              </Button>
                            </div>
                          </Col>
                    </Form>

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
              OrderDetail.payments &&
              OrderDetail.payments?.length > 0 && (
                <Card
                  className="margin-top-20"
                  title={
                    <Space>
                      <div className="d-flex" style={{ marginTop: "5px" }}>
                        <span className="title-card">THANH TOÁN</span>
                      </div>
                      {checkPaymentStatusToShow(OrderDetail) === -1 && (
                        <Tag className="orders-tag orders-tag-default">
                          Chưa thanh toán
                        </Tag>
                      )}
                      {checkPaymentStatusToShow(OrderDetail) === 0 && (
                        <Tag className="orders-tag orders-tag-warning">
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
                          Còn phải trả:
                        </span>
                        <b style={{ color: "red" }}>
                          {OrderDetail?.fulfillments &&
                          OrderDetail?.fulfillments[0].status !== "shipped"
                            ? formatCurrency(
                                customerNeedToPayValue -
                                  (OrderDetail?.total_paid
                                    ? OrderDetail?.total_paid
                                    : 0)
                              )
                            : 0}
                        </b>
                      </Col>
                    </Row>
                  </div>

                  {OrderDetail?.payments && (
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
                          {OrderDetail.total === SumCOD(OrderDetail) &&
                          OrderDetail.total === OrderDetail.total_paid ? (
                            ""
                          ) : (
                            <Panel
                              className="orders-timeline-custom success-collapse"
                              header={
                                <span style={{ color: "#222222" }}>
                                  <b>
                                    {OrderDetail?.payments &&
                                      OrderDetail?.payments
                                        .filter(
                                          (payment, index) =>
                                            payment.payment_method !== "cod" &&
                                            payment.amount
                                        )
                                        .map(
                                          (item, index) =>
                                            item.payment_method +
                                            (index ===
                                            (OrderDetail?.payments &&
                                            OrderDetail?.payments.length > 0
                                              ? OrderDetail?.payments.length
                                              : 0) -
                                              1
                                              ? ""
                                              : ", ")
                                        )}
                                  </b>
                                </span>
                              }
                              key="1"
                              extra={
                                <>
                                  {OrderDetail?.payments && (
                                    <div>
                                      <span
                                        className="fixed-time text-field"
                                        style={{ color: "#737373" }}
                                      >
                                        {ConvertUtcToLocalDate(
                                          getDateLastPayment(OrderDetail),
                                          "DD/MM/YYYY HH:mm"
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </>
                              }
                            >
                              <Row gutter={24}>
                                {OrderDetail?.payments &&
                                  OrderDetail?.payments
                                    .filter(
                                      (payment) =>
                                        payment.payment_method !== "cod" &&
                                        payment.amount
                                    )
                                    .map((item, index) => (
                                      <Col span={6} key={item.code}>
                                        <>
                                          <p
                                            style={{
                                              color: "#737373",
                                              marginBottom: 10,
                                            }}
                                          >
                                            {item.payment_method}
                                          </p>
                                          <b>
                                            {formatCurrency(item.paid_amount)}
                                          </b>
                                        </>
                                        {item.payment_method_id === 3 && (
                                          <p>FA18TAMFIXCUNG</p>
                                        )}
                                        {item.payment_method_id === 5 && (
                                          <p>
                                            {Math.round(item.amount / 1000)}{" "}
                                            điểm
                                          </p>
                                        )}
                                      </Col>
                                    ))}
                              </Row>
                            </Panel>
                          )}

                          {OrderDetail &&
                            OrderDetail.fulfillments &&
                            OrderDetail.fulfillments.length > 0 &&
                            OrderDetail.fulfillments[0].shipment &&
                            OrderDetail.fulfillments[0].shipment?.cod !==
                              null && (
                              <Panel
                                className={
                                  OrderDetail?.fulfillments[0].status !==
                                  "shipped"
                                    ? "orders-timeline-custom orders-dot-status"
                                    : "orders-timeline-custom"
                                }
                                showArrow={false}
                                header={
                                  <>
                                    <b
                                      style={{
                                        paddingLeft: "4px",
                                        color: "#222222",
                                      }}
                                    >
                                      COD
                                    </b>
                                    <b
                                      style={{
                                        marginLeft: "200px",
                                        color: "#222222",
                                      }}
                                    >
                                      {OrderDetail !== null &&
                                      OrderDetail.fulfillments
                                        ? formatCurrency(
                                            OrderDetail.fulfillments[0].shipment
                                              ?.cod
                                          )
                                        : 0}
                                    </b>
                                  </>
                                }
                                extra={
                                  <>
                                    {OrderDetail?.fulfillments[0].status ===
                                      "shipped" && (
                                      <div>
                                        <span
                                          className="fixed-time text-field"
                                          style={{ color: "#737373" }}
                                        >
                                          {ConvertUtcToLocalDate(
                                            getDateLastPayment(OrderDetail),
                                            "DD/MM/YYYY HH:mm"
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </>
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
                        OrderDetail.total_line_amount_after_line_discount -
                        getAmountPayment(OrderDetail.payments) -
                        (OrderDetail?.discounts &&
                        OrderDetail?.discounts.length > 0 &&
                        OrderDetail?.discounts[0].amount
                          ? OrderDetail?.discounts[0].amount
                          : 0)
                      }
                      order_id={OrderDetail.id}
                      orderDetail={OrderDetail}
                      setTotalPaid={setTotalPaid}
                      isVisibleUpdatePayment={isVisibleUpdatePayment}
                      setVisibleUpdatePayment={setVisibleUpdatePayment}
                    />
                  )}
                  {(OrderDetail?.fulfillments &&
                    OrderDetail?.fulfillments.length > 0 &&
                    OrderDetail?.fulfillments[0].shipment &&
                    OrderDetail?.fulfillments[0].shipment.cod !== null) ||
                    (checkPaymentAll(OrderDetail) !== 1 &&
                      isShowPaymentPartialPayment === false &&
                      checkPaymentStatusToShow(OrderDetail) !== 1 && (
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
                      ))}
                </Card>
              )}

            {/* COD toàn phần */}
            {OrderDetail &&
              OrderDetail.fulfillments &&
              OrderDetail.fulfillments.length > 0 &&
              OrderDetail.fulfillments[0].shipment &&
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
                      <div className="d-flex" style={{ marginTop: "5px" }}>
                        <span className="title-card">THANH TOÁN</span>
                      </div>
                      {/* {checkPaymentStatusToShow(OrderDetail) === -1 && (
                        <Tag className="orders-tag orders-tag-default">
                          Chưa thanh toán
                        </Tag>
                      )}
                      {checkPaymentStatusToShow(OrderDetail) === 0 && (
                        <Tag className="orders-tag orders-tag-warning">
                          Thanh toán 1 phần
                        </Tag>
                      )} */}
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
                          Còn phải trả:
                        </span>
                        <b style={{ color: "red" }}>
                          {OrderDetail && OrderDetail?.fulfillments
                            ? formatCurrency(
                                OrderDetail.fulfillments[0].shipment?.cod
                              )
                            : 0}
                        </b>
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
                        className={
                          OrderDetail?.fulfillments[0].status !== "shipped"
                            ? "orders-timeline-custom orders-dot-status orders-dot-fullCod-status"
                            : "orders-timeline-custom orders-dot-fullCod-status"
                        }
                        showArrow={false}
                        header={
                          <b style={{ color: "#222222" }}>
                            COD
                            <Tag
                              className="orders-tag orders-tag-warning"
                              style={{ marginLeft: 10 }}
                            >
                              Đang chờ thu
                            </Tag>
                            <b
                              style={{ marginLeft: "200px", color: "#222222" }}
                            >
                              {OrderDetail.fulfillments
                                ? formatCurrency(
                                    OrderDetail.fulfillments[0].shipment?.cod
                                  )
                                : 0}
                            </b>
                          </b>
                        }
                        key="1"
                      >
                        <Row gutter={24}>
                          {OrderDetail?.payments &&
                            OrderDetail?.payments.map((item, index) => (
                              <Col span={12} key={item.id}>
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

            {/* Chưa thanh toán đơn nháp*/}
            {OrderDetail &&
              OrderDetail.payments?.length === 0 &&
              (OrderDetail.fulfillments?.length === 0 ||
                (OrderDetail?.fulfillments &&
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
                  isVisibleUpdatePayment={isVisibleUpdatePayment}
                  setVisibleUpdatePayment={setVisibleUpdatePayment}
                />
              )}

            {/*--- end payment ---*/}
          </Col>

          <Col md={6}>
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
                      {moment(OrderDetail?.created_date).format(
                        "DD/MM/YYYY HH:mm a"
                      )}
                    </span>
                  </Col>
                </Row>
                <Row className="margin-top-10" gutter={5}>
                  <Col span={9}>Đường dẫn</Col>
                  <Col span={15}>
                    <span className="text-focus">
                      {OrderDetail?.url ? OrderDetail?.url : "Không"}
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
        icon={WarningIcon}
        title="Xác nhận xuất kho"
        text={`Bạn có chắc xuất kho đơn giao hàng này ${
          confirmExportAndFinishValue()
            ? "với tiền thu hộ là " +
              formatCurrency(confirmExportAndFinishValue()!)
            : ""
        } không?`}
      />
      <SaveAndConfirmOrder
        onCancel={() => setIsvibleShippedConfirm(false)}
        onOk={onOkShippingConfirm}
        visible={isvibleShippedConfirm}
        icon={WarningIcon}
        title="Xác nhận giao hàng thành công"
        text={`Bạn có chắc đã giao đơn giao hàng này ${
          confirmExportAndFinishValue()
            ? "với tiền thu hộ là " +
              formatCurrency(confirmExportAndFinishValue()!)
            : ""
        } không?`}
      />
    </ContentContainer>
  );
};

export default OrderDetail;
