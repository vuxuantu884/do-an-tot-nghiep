//#region Import
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  DatePicker,
  Divider,
  Form,
  FormInstance,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import calendarOutlined from "assets/icon/calendar_outline.svg";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import deliveryIcon from "assets/icon/delivery.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import eyeOutline from "assets/icon/eye_outline.svg";
import selfdeliver from "assets/icon/self_shipping.svg";
import shoppingBag from "assets/icon/shopping_bag.svg";
import wallClock from "assets/icon/wall_clock.svg";
import AlertIcon from "assets/icon/ydAlertIcon.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import storeBluecon from "assets/img/storeBlue.svg";
import NumberInput from "component/custom/number-input.custom";
import CustomSelect from "component/custom/select.custom";
import UrlConfig from "config/url.config";
import { ShipperGetListAction } from "domain/actions/account/account.action";
import {
  DeliveryServicesGetList,
  getTrackingLogFulfillmentAction,
  InfoGHTKAction,
  UpdateFulFillmentStatusAction,
  UpdateShipmentAction,
} from "domain/actions/order/order.action";
import { AccountResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
  ShippingGHTKRequest,
  UpdateFulFillmentRequest,
  UpdateFulFillmentStatusRequest,
  UpdateLineFulFillment,
  UpdateShipmentRequest,
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
  DeliveryServiceResponse,
  OrderResponse,
  ShippingGHTKResponse,
  TrackingLogFulfillmentResponse,
} from "model/response/order/order.response";
import moment from "moment";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { setTimeout } from "timers";
import {
  checkPaymentStatusToShow,
  CheckShipmentType,
  formatCurrency,
  getAmountPayment,
  getServiceName,
  getShippingAddressDefault,
  InfoServiceDeliveryDetail,
  replaceFormatString,
  SumWeightResponse,
  TrackingCode,
} from "utils/AppUtils";
import {
  FulFillmentStatus,
  MoneyPayThreePls,
  OrderStatus,
  PaymentMethodOption,
  ShipmentMethodOption,
  TRANSPORTS,
} from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import CancelFullfilmentModal from "../modal/cancel-fullfilment.modal";
import GetGoodsBack from "../modal/get-goods-back.modal";
import SaveAndConfirmOrder from "../modal/save-confirm.modal";
import FulfillmentStatusTag from "./order-detail/FulfillmentStatusTag";
import PrintShippingLabel from "./order-detail/PrintShippingLabel";

const { Panel } = Collapse;
const { Link } = Typography;
//#endregion
type UpdateShipmentCardProps = {
  shippingFeeInformedCustomer: (value: number | null) => void;
  setVisibleUpdatePayment: (value: boolean) => void;
  setShipmentMethod: (value: number) => void;
  setPaymentType: (value: number) => void;
  setVisibleShipping: (value: boolean) => void;
  setOfficeTime: (value: boolean) => void;
  OrderDetail: OrderResponse | null;
  storeDetail?: StoreResponse;
  stepsStatusValue?: string;
  totalPaid?: number;
  officeTime: boolean | undefined;
  shipmentMethod: number | null;
  isVisibleShipping: boolean | null;
  paymentType: number | null;
  customerDetail: CustomerResponse | null;
  OrderDetailAllFullfilment: OrderResponse | null;
  orderSettings?: OrderSettingsModel;
};

const UpdateShipmentCard: React.FC<UpdateShipmentCardProps> = (
  props: UpdateShipmentCardProps
) => {
  // props destructuring
  const {
    paymentType,
    isVisibleShipping,
    shipmentMethod,
    setVisibleShipping,
    setPaymentType,
    setShipmentMethod,
    OrderDetail,
    orderSettings,
  } = props;

  const history = useHistory();
  // node dom
  const formRef = createRef<FormInstance>();
  // action
  const dispatch = useDispatch();

  // state
  const [shipper, setShipper] = useState<Array<AccountResponse> | null>(null);
  const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
    useState<number>(0);
  const [isvibleShippedConfirm, setIsvibleShippedConfirm] =
    useState<boolean>(false);
  const [requirementName, setRequirementName] = useState<string | null>(null);
  const [requirementNameView, setRequirementNameView] = useState<string | null>(
    null
  );
  const [takeMoneyHelper, setTakeMoneyHelper] = useState<number | null>(null);
  const [deliveryServices, setDeliveryServices] =
    useState<Array<DeliveryServiceResponse> | null>(null);
  const [trackingLogFulfillment, setTrackingLogFulfillment] =
    useState<Array<TrackingLogFulfillmentResponse> | null>(null);
  // const [errorLogFulfillment, setErrorLogFulfillment] =
  //   useState<Array<ErrorLogResponse> | null>(null);
  const [infoGHTK, setInfoGHTK] = useState<Array<ShippingGHTKResponse>>([]);
  const [hvc, setHvc] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState<string>();
  const [feeGhtk, setFeeGhtk] = useState<number>(0);
  const [cancelReason, setCancelReason] = useState<string>("");
  useEffect(() => {
    dispatch(DeliveryServicesGetList(setDeliveryServices));
  }, [dispatch]);
  const shipping_requirements = useSelector(
    (state: RootReducerType) =>
      state.bootstrapReducer.data?.shipping_requirement
  );
  //#endregion
  // show shipping
  const ShowShipping = () => {
    setVisibleShipping(true);
  };
  //#endregion
  //#region Master

  // copy button
  const copyOrderID = (e: any, data: string | null) => {
    e.stopPropagation();
    e.target.style.width = "26px";
    const decWidth = setTimeout(() => {
      e.target.style.width = "23px";
    }, 100);
    clearTimeout(decWidth);
    navigator.clipboard.writeText(data ? data : "").then(() => {});
  };
  //#region Product
  const ShipMethodOnChange = (value: number) => {
    setShipmentMethod(value);
    if (
      props.OrderDetail !== null &&
      value === ShipmentMethodOption.SELF_DELIVER &&
      checkPaymentStatusToShow(props.OrderDetail) !== 1
    ) {
      props.setVisibleUpdatePayment(true);
      setPaymentType(PaymentMethodOption.COD);
    }

    if (value === ShipmentMethodOption.DELIVER_PARTNER) {
      getInfoDeliveryGHTK(TRANSPORTS.ROAD);
      getInfoDeliveryGHTK(TRANSPORTS.FLY);
      setPaymentType(PaymentMethodOption.COD);
      props.setVisibleUpdatePayment(true);
    }
    if (
      value === ShipmentMethodOption.PICK_AT_STORE ||
      value === ShipmentMethodOption.DELIVER_LATER
    ) {
      props.shippingFeeInformedCustomer(0);
    } else {
      props.shippingFeeInformedCustomer(shippingFeeInformedCustomer);
    }
  };

  const changeShippingFeeInformedCustomer = (value: any) => {
    setShippingFeeInformedCustomer(value);
    props.shippingFeeInformedCustomer(value);
  };

  const getInfoDeliveryGHTK = useCallback(
    (type: string) => {
      let request: ShippingGHTKRequest = {
        pick_address: props.storeDetail?.address,
        pick_province: props.storeDetail?.city_name,
        pick_district: props.storeDetail?.district_name,
        province: getShippingAddressDefault(props.customerDetail)?.city,
        district: getShippingAddressDefault(props.customerDetail)?.district,
        address: getShippingAddressDefault(props.customerDetail)?.full_address,
        weight: props.OrderDetail && SumWeightResponse(props.OrderDetail.items),
        value: props.OrderDetail?.total,
        transport: "",
      };

      if (
        request.pick_address &&
        request.pick_district &&
        request.pick_province &&
        request.address &&
        request.province &&
        request.weight &&
        request.district
      ) {
        dispatch(InfoGHTKAction(request, setInfoGHTK));
      }
    },
    [dispatch, props.OrderDetail, props.customerDetail, props.storeDetail]
  );

  const changeServiceType = (
    id: number,
    code: string,
    item: any,
    fee: number
  ) => {
    setHvc(id);
    setServiceType(item);
    setFeeGhtk(fee);
  };

  //#endregion
  useEffect(() => {
    dispatch(ShipperGetListAction(setShipper));
  }, [dispatch]);

  useEffect(() => {
    if (TrackingCode(props.OrderDetail) !== "Đang xử lý") {
      if (
        props.OrderDetail &&
        props.OrderDetail.fulfillments &&
        props.OrderDetail.fulfillments.length > 0 &&
        props.OrderDetail.fulfillments[0].code
      ) {
        dispatch(
          getTrackingLogFulfillmentAction(
            props.OrderDetail.fulfillments[0].code,
            setTrackingLogFulfillment
          )
        );
      }
    }
  }, [dispatch, props.OrderDetail]); //logne

  useEffect(() => {
    if (
      props.OrderDetail &&
      props.OrderDetail.fulfillments &&
      props.OrderDetail.fulfillments.length > 0 &&
      props.OrderDetail.fulfillments[0].code &&
      props.OrderDetail.fulfillments[0].shipment &&
      props.OrderDetail.fulfillments[0].shipment.pushing_status === "failed"
    ) {
      // dispatch(
      //   getTrackingLogError(
      //     props.OrderDetail.fulfillments[0].code,
      //     setErrorLogFulfillment
      //   )
      // );
    }
  }, [dispatch, props.OrderDetail]);
  //#endregion

  //#region Update Fulfillment Status
  let timeout = 500;
  const onUpdateSuccess = (value: OrderResponse) => {
    showSuccess("Tạo đơn giao hàng thành công");
    // setTimeout(() => {
    //   window.location.reload();
    // }, timeout);
  };
  const onPickSuccess = (value: OrderResponse) => {
    showSuccess("Nhặt hàng thành công");
    // setTimeout(() => {
    //   window.location.reload();
    // }, timeout);
  };

  const onPackSuccess = (value: OrderResponse) => {
    showSuccess("Đóng gói thành công");
    // setTimeout(() => {
    //   window.location.reload();
    // }, timeout);
  };

  const onShippingSuccess = (value: OrderResponse) => {
    showSuccess("Xuất kho thành công");
    // setTimeout(() => {
    //   window.location.reload();
    // }, timeout);
  };

  const onShipedSuccess = (value: OrderResponse) => {
    showSuccess("Hoàn tất đơn hàng");
    // setTimeout(() => {
    //   window.location.reload();
    // }, timeout);
  };
  const onCancelSuccess = (value: OrderResponse) => {
    showSuccess(
      `Bạn đã hủy đơn giao hàng ${
        props.OrderDetail?.fulfillments &&
        props.OrderDetail?.fulfillments.length > 0 &&
        props.OrderDetail?.fulfillments.filter(
          (fulfillment) =>
            fulfillment.status !== FulFillmentStatus.CANCELLED &&
            fulfillment.status !== FulFillmentStatus.RETURNING &&
            fulfillment.status !== FulFillmentStatus.RETURNED
        )[0].id
      } thành công`
    );
    setTimeout(() => {
      window.location.reload();
    }, timeout);
  };
  const onReturnSuccess = (value: OrderResponse) => {
    showSuccess(
      `Bạn đã nhận hàng trả lại của đơn giao hàng ${
        value.fulfillments &&
        value.fulfillments.length > 0 &&
        value.fulfillments.filter(
          (fulfillment) => fulfillment.id === fullfilmentIdGoodReturn
        )[0].id
      }`
    );
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
    value.order_id = props.OrderDetail?.id;
    let fulfillment_id = props.OrderDetail?.fulfillments
      ? props.OrderDetail?.fulfillments[0].id
      : null;
    value.fulfillment_id = fulfillment_id;

    switch (type) {
      case 1:
        value.status = FulFillmentStatus.PICKED;
        value.action = FulFillmentStatus.PICKED;
        dispatch(UpdateFulFillmentStatusAction(value, onPickSuccess));
        break;
      case 2:
        value.status = FulFillmentStatus.PACKED;
        value.action = FulFillmentStatus.PACKED;
        dispatch(UpdateFulFillmentStatusAction(value, onPackSuccess));
        break;
      case 3:
        value.status = FulFillmentStatus.SHIPPING;
        value.action = FulFillmentStatus.SHIPPING;
        dispatch(UpdateFulFillmentStatusAction(value, onShippingSuccess));
        break;
      case 4:
        value.status = FulFillmentStatus.SHIPPED;
        value.action = FulFillmentStatus.SHIPPED;
        dispatch(UpdateFulFillmentStatusAction(value, onShipedSuccess));
        break;
      case 5:
        value.status = FulFillmentStatus.CANCELLED;
        value.action = FulFillmentStatus.CANCELLED;
        dispatch(UpdateFulFillmentStatusAction(value, onCancelSuccess));
        break;
      case 6:
        value.status = FulFillmentStatus.RETURNING;
        value.action = FulFillmentStatus.RETURNING;
        dispatch(UpdateFulFillmentStatusAction(value, onCancelSuccess));
        break;
      case 7:
        value.status = FulFillmentStatus.RETURNED;
        value.action = FulFillmentStatus.RETURNED;
        dispatch(UpdateFulFillmentStatusAction(value, onCancelSuccess));
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
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0 &&
      props.OrderDetail?.fulfillments[0].shipment &&
      props.OrderDetail?.fulfillments[0].status ===
        FulFillmentStatus.UNSHIPPED &&
      props.OrderDetail?.fulfillments[0].shipment
        ?.delivery_service_provider_type !== "pick_at_store"
    ) {
      fulfillmentTypeOrderRequest(1);
    } else if (
      props.stepsStatusValue === FulFillmentStatus.PICKED ||
      (props.OrderDetail?.fulfillments &&
        props.OrderDetail?.fulfillments.length > 0 &&
        props.OrderDetail?.fulfillments[0].shipment &&
        props.OrderDetail?.fulfillments[0].status ===
          FulFillmentStatus.UNSHIPPED &&
        props.OrderDetail?.fulfillments[0].shipment
          ?.delivery_service_provider_type === "pick_at_store")
    ) {
      fulfillmentTypeOrderRequest(2);
    } else if (
      props.stepsStatusValue === FulFillmentStatus.PACKED &&
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0 &&
      props.OrderDetail?.fulfillments[0].shipment &&
      props.OrderDetail?.fulfillments[0].shipment
        ?.delivery_service_provider_type !== "pick_at_store"
    ) {
      fulfillmentTypeOrderRequest(3);
    } else if (
      props.stepsStatusValue === FulFillmentStatus.SHIPPING ||
      (props.OrderDetail?.fulfillments &&
        props.OrderDetail?.fulfillments.length > 0 &&
        props.OrderDetail?.fulfillments[0].shipment &&
        props.OrderDetail?.fulfillments[0].status ===
          FulFillmentStatus.PACKED &&
        props.OrderDetail?.fulfillments[0].shipment
          ?.delivery_service_provider_type === "pick_at_store")
    ) {
      fulfillmentTypeOrderRequest(4);
    }
  };
  //#endregion
  const confirmExportAndFinishValue = () => {
    if (takeMoneyHelper) {
      return takeMoneyHelper;
    } else if (
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0 &&
      props.OrderDetail?.fulfillments[0].shipment &&
      props.OrderDetail?.fulfillments[0].shipment
        .delivery_service_provider_type === "pick_at_store"
    ) {
      let money = props.OrderDetail.total;
      props.OrderDetail?.payments?.forEach((p) => {
        money = money - p.paid_amount;
      });
      return money;
    } else if (
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0 &&
      props.OrderDetail?.fulfillments[0].shipment &&
      props.OrderDetail?.fulfillments[0].shipment
        .shipping_fee_informed_to_customer
    ) {
      return (
        props.OrderDetail?.fulfillments[0].shipment
          .shipping_fee_informed_to_customer +
        props.OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (props.OrderDetail?.total_paid ? props.OrderDetail?.total_paid : 0) -
        (props.OrderDetail?.discounts &&
        props.OrderDetail?.discounts.length > 0 &&
        props.OrderDetail?.discounts[0].amount
          ? props.OrderDetail?.discounts[0].amount
          : 0)
      );
    } else if (props.OrderDetail?.total && props.OrderDetail?.total_paid) {
      return (
        props.OrderDetail?.total +
        shippingFeeInformedCustomer -
        props.OrderDetail?.total_paid
      );
    } else if (
      props.OrderDetail &&
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0 &&
      props.OrderDetail?.fulfillments[0].shipment &&
      props.OrderDetail?.fulfillments[0].shipment.cod
    ) {
      return props.OrderDetail?.fulfillments[0].shipment.cod;
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
    office_time: null,
  };

  let FulFillmentRequest: UpdateFulFillmentRequest = {
    id: null,
    order_id: null,
    store_id: props.OrderDetail?.store_id,
    account_code: props.OrderDetail?.account_code,
    assignee_code: props.OrderDetail?.assignee_code,
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
    items: props.OrderDetail?.items,
    shipping_fee_informed_to_customer: null,
  };

  const onFinishUpdateFulFillment = (value: UpdateShipmentRequest) => {
    value.expected_received_date = value.dating_ship?.utc().format();
    value.requirements_name = requirementName;
    value.office_time = props.officeTime;
    if (props.OrderDetail?.fulfillments) {
      if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
        value.delivery_service_provider_type = "Shipper";
      }
      if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE) {
        value.delivery_service_provider_type = "pick_at_store";
      }

      if (shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER) {
        value.delivery_service_provider_id = hvc;
        value.delivery_service_provider_type = "external_service";
        value.sender_address_id = props.OrderDetail.store_id;
        value.service = serviceType!;
        value.shipping_fee_informed_to_customer = shippingFeeInformedCustomer;
        if (hvc === 1) {
          value.shipping_fee_paid_to_three_pls = feeGhtk;
        } else {
          value.shipping_fee_paid_to_three_pls = MoneyPayThreePls.VALUE; //mặc định 20k
        }
      }
    }
    if (props.OrderDetail != null) {
      FulFillmentRequest.order_id = props.OrderDetail.id;
      if (
        props.OrderDetail.fulfillments &&
        props.OrderDetail.fulfillments.length !== 0
      ) {
        FulFillmentRequest.id = props.OrderDetail.fulfillments[0].id;
      }
    }
    if (
      props.OrderDetail &&
      checkPaymentStatusToShow(props.OrderDetail) === 1 &&
      value.shipping_fee_informed_to_customer !== null
    ) {
      value.cod =
        props.OrderDetail.total +
        value.shipping_fee_informed_to_customer -
        getAmountPayment(props.OrderDetail.payments);
    } else {
      if (takeHelperValue > 0) {
        value.cod = takeHelperValue;
      }
    }
    if (
      props.OrderDetail?.status === "draft" &&
      customerNeedToPayValue === props.totalPaid
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
        props.OrderDetail?.total_line_amount_after_line_discount &&
        props.OrderDetail?.total_line_amount_after_line_discount +
          shippingFeeInformedCustomer;
    } else {
      FulFillmentRequest.total =
        props.OrderDetail?.total_line_amount_after_line_discount;
    }

    let UpdateLineFulFillment: UpdateLineFulFillment = {
      order_id: FulFillmentRequest.order_id,
      fulfillment: FulFillmentRequest,
      action: OrderStatus.FINALIZED,
    };
    if (
      shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER &&
      !serviceType
    ) {
      showError("Vui lòng chọn đơn vị vận chuyển");
    } else {
      dispatch(UpdateShipmentAction(UpdateLineFulFillment, onUpdateSuccess));
    }
  };

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

  //set req to request
  const setRequirementNameCallback = useCallback(
    (value) => {
      const reqObj = shipping_requirements?.find((r) => r.value === value);
      setRequirementName(reqObj ? reqObj?.name : "");
    },
    [setRequirementName, shipping_requirements]
  );
  // get req to view
  const getRequirementName = useCallback(() => {
    if (
      props.OrderDetail &&
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0
    ) {
      let requirement =
        props.OrderDetail?.fulfillments[0].shipment?.requirements?.toString();
      const reqObj = shipping_requirements?.find(
        (r) => r.value === requirement
      );
      setRequirementNameView(reqObj ? reqObj?.name : "");
    }
  }, [props.OrderDetail, shipping_requirements]);

  // Thu hộ
  const takeHelper: any = () => {
    if (
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0 &&
      props.OrderDetail?.fulfillments[0].total
    ) {
      return (
        (props.OrderDetail?.fulfillments[0].total
          ? props.OrderDetail?.fulfillments[0].total
          : 0) +
        shippingFeeInformedCustomer -
        props.totalPaid! -
        (props.OrderDetail?.total_paid ? props.OrderDetail?.total_paid : 0) -
        (props.OrderDetail?.total_discount
          ? props.OrderDetail?.total_discount
          : 0)
      );
    } else if (props.OrderDetail?.total_line_amount_after_line_discount) {
      return (
        (props.OrderDetail?.total_line_amount_after_line_discount
          ? props.OrderDetail?.total_line_amount_after_line_discount
          : 0) +
        shippingFeeInformedCustomer -
        props.totalPaid! -
        (props.OrderDetail?.total_paid ? props.OrderDetail?.total_paid : 0) -
        (props.OrderDetail?.discounts &&
        props.OrderDetail?.discounts.length > 0 &&
        props.OrderDetail?.discounts[0].amount
          ? props.OrderDetail?.discounts[0].amount
          : 0)
      );
    }
  };
  let takeHelperValue: any = takeHelper();
  const showTakeHelper = () => {
    if (props.OrderDetail?.total_line_amount_after_line_discount) {
      return (
        props.OrderDetail?.total_line_amount_after_line_discount -
          props.totalPaid! +
          shippingFeeInformedCustomer -
          (props.OrderDetail?.discounts &&
          props.OrderDetail?.discounts.length > 0 &&
          props.OrderDetail?.discounts[0].amount
            ? props.OrderDetail?.discounts[0].amount
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
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0 &&
      props.OrderDetail?.fulfillments[0].shipment &&
      props.OrderDetail?.fulfillments[0].shipment
        .shipping_fee_informed_to_customer
    ) {
      return (
        props.OrderDetail?.fulfillments[0].shipment
          .shipping_fee_informed_to_customer +
        props.OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (props.OrderDetail?.discounts &&
        props.OrderDetail?.discounts.length > 0 &&
        props.OrderDetail?.discounts[0].amount
          ? props.OrderDetail?.discounts[0].amount
          : 0)
      );
    } else if (props.OrderDetail?.total_line_amount_after_line_discount) {
      return (
        props.OrderDetail?.total_line_amount_after_line_discount +
        shippingFeeInformedCustomer -
        (props.OrderDetail?.discounts &&
        props.OrderDetail?.discounts.length > 0 &&
        props.OrderDetail?.discounts[0].amount
          ? props.OrderDetail?.discounts[0].amount
          : 0)
      );
    }
  };

  const customerNeedToPayValue = customerNeedToPay();
  // Cancel fulfillments
  const [isvibleCancelFullfilment, setIsvibleCancelFullfilment] =
    useState<boolean>(false);
  const [isvibleCancelandGetGoodsBack, setIsvibleCancelandGetGoodsBack] =
    useState<boolean>(false);
  const [isvibleGoodsReturn, setIsvibleGoodsReturn] = useState<boolean>(false);
  const [fullfilmentIdGoodReturn, setFullfilmentIdGoodReturn] = useState<
    number | null
  >(null);

  const cancelFullfilment = useCallback(() => {
    if (
      props.OrderDetail?.fulfillments &&
      props.OrderDetail?.fulfillments.length > 0 &&
      props.OrderDetail?.fulfillments[0].status !== FulFillmentStatus.SHIPPING
    ) {
      setIsvibleCancelFullfilment(true);
    } else {
      setIsvibleCancelandGetGoodsBack(true);
    }
  }, [setIsvibleCancelFullfilment, props.OrderDetail]);

  const onOKCancelFullfilment = () => {
    fulfillmentTypeOrderRequest(5);
    setIsvibleCancelandGetGoodsBack(false);
  };
  // cancel fulfillment 3 button modal
  const onOkCancelAndGetGoodsBack = () => {
    fulfillmentTypeOrderRequest(7);
    setIsvibleCancelandGetGoodsBack(false);
  };
  // return goods
  const onOKGoodsReturn = () => {
    setIsvibleGoodsReturn(false);
    let value: UpdateFulFillmentStatusRequest = {
      order_id: null,
      fulfillment_id: null,
      status: "",
      cancel_reason: cancelReason,
    };
    value.order_id = props.OrderDetail?.id;
    value.fulfillment_id = fullfilmentIdGoodReturn;
    value.status = FulFillmentStatus.RETURNED;
    dispatch(UpdateFulFillmentStatusAction(value, onReturnSuccess));
  };
  const goodsReturnCallback = useCallback(
    (id: number | null) => {
      setFullfilmentIdGoodReturn(id);
      setIsvibleGoodsReturn(true);
    },
    [setFullfilmentIdGoodReturn, setIsvibleGoodsReturn]
  );

  // end
  useEffect(() => {
    getRequirementName();
  }, [getRequirementName]);

  return (
    <div>
      <Card
        className="margin-top-20 orders-update-shipment "
        title={
          <Space>
            <div className="d-flex">
              <span className="title-card">ĐÓNG GÓI VÀ GIAO HÀNG</span>
            </div>
            {props.OrderDetail?.fulfillments &&
              props.OrderDetail?.fulfillments.length > 0 &&
              props.OrderDetail?.fulfillments[0].status ===
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
            {props.OrderDetail?.fulfillments &&
              props.OrderDetail?.fulfillments.length > 0 &&
              props.OrderDetail?.fulfillments[0].shipment
                ?.expected_received_date && (
                <div className="text-menu">
                  <img
                    src={calendarOutlined}
                    style={{ marginRight: 9.5 }}
                    alt=""
                  ></img>
                  <span style={{ color: "#222222", lineHeight: "16px" }}>
                    {props.OrderDetail?.fulfillments &&
                    props.OrderDetail?.fulfillments.length > 0 &&
                    props.OrderDetail?.fulfillments[0].shipment
                      ?.expected_received_date
                      ? moment(
                          props.OrderDetail?.fulfillments[0].shipment
                            ?.expected_received_date
                        ).format("DD/MM/YYYY")
                      : ""}
                  </span>
                  {props.OrderDetail?.fulfillments &&
                    props.OrderDetail?.fulfillments.length > 0 &&
                    props.OrderDetail?.fulfillments[0].shipment
                      ?.office_time && (
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
                <span style={{ marginLeft: "5px", fontWeight: 500 }}>
                  {requirementNameView}
                </span>
              </div>
            )}
          </Space>
        }
      >
        {props.OrderDetailAllFullfilment?.fulfillments &&
          props.OrderDetailAllFullfilment?.fulfillments.length > 0 &&
          props.OrderDetailAllFullfilment?.fulfillments.map(
            (fulfillment) =>
              fulfillment.shipment && (
                <div
                  key={fulfillment.id}
                  className="padding-24"
                  style={{ paddingTop: 6, paddingBottom: 4 }}
                >
                  <Collapse
                    className="saleorder_shipment_order_colapse payment_success"
                    defaultActiveKey={[
                      fulfillment.status !== FulFillmentStatus.RETURNED
                        ? "1"
                        : "",
                    ]}
                    onChange={(e) => console.log(e[0])}
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
                    <Panel
                      className={
                        fulfillment.status === FulFillmentStatus.CANCELLED ||
                        fulfillment.status === FulFillmentStatus.RETURNING ||
                        fulfillment.status === FulFillmentStatus.RETURNED
                          ? "orders-timeline-custom order-shipment-dot-cancelled"
                          : fulfillment.status === FulFillmentStatus.SHIPPED
                          ? "orders-timeline-custom order-shipment-dot-active"
                          : "orders-timeline-custom order-shipment-dot-default"
                      }
                      showArrow={true}
                      header={
                        <div className="saleorder-header-content">
                          <div className="saleorder-header-content__info">
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
                                style={{ width: 23 }}
                              />
                            </div>
                            <FulfillmentStatusTag fulfillment={fulfillment} />
                            <PrintShippingLabel
                              fulfillment={fulfillment}
                              orderSettings={orderSettings}
                              orderId={OrderDetail?.id}
                            />
                          </div>

                          <div className="saleorder-header-content__date">
                            <span
                              style={{ color: "#000000d9", marginRight: 6 }}
                            >
                              Ngày tạo:
                            </span>
                            <span style={{ color: "#000000d9" }}>
                              {moment(
                                fulfillment.shipment?.created_date
                              ).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        </div>
                      }
                      key="1"
                    >
                      {fulfillment.shipment?.delivery_service_provider_type ===
                      "pick_at_store" ? (
                        <div>
                          <Row gutter={24}>
                            <Col md={24}>
                              <Col span={24}>
                                <b>
                                  <img
                                    style={{ marginRight: 12 }}
                                    src={storeBluecon}
                                    alt=""
                                  />
                                  NHẬN TẠI CỬA HÀNG
                                </b>
                              </Col>
                            </Col>
                          </Row>
                          <Row gutter={24} style={{ paddingTop: "15px" }}>
                            <Col md={6}>
                              <Col span={24}>
                                <p className="text-field">Tên cửa hàng:</p>
                              </Col>
                              <Col span={24}>
                                <b>{props.OrderDetail?.store}</b>
                              </Col>
                            </Col>

                            <Col md={6}>
                              <Col span={24}>
                                <p className="text-field">Số điện thoại:</p>
                              </Col>
                              <Col span={24}>
                                <b className="text-field">
                                  {props.OrderDetail?.store_phone_number}
                                </b>
                              </Col>
                            </Col>

                            <Col md={6}>
                              <Col span={24}>
                                <p className="text-field">Địa chỉ:</p>
                              </Col>
                              <Col span={24}>
                                <b className="text-field">
                                  {props.OrderDetail?.store_full_address}
                                </b>
                              </Col>
                            </Col>
                          </Row>
                        </div>
                      ) : (
                        <Row gutter={24}>
                          <Col md={5}>
                            <Col span={24}>
                              <p className="text-field">
                                Đối tác giao hàng: 33
                              </p>
                            </Col>
                            <Col span={24}>
                              <b>
                                {/* Lấy ra đối tác */}
                                {fulfillment.shipment
                                  ?.delivery_service_provider_type ===
                                  "external_service" && (
                                  <img
                                    style={{ width: "112px", height: 25 }}
                                    src={InfoServiceDeliveryDetail(
                                      deliveryServices,
                                      fulfillment.shipment
                                        .delivery_service_provider_id
                                    )}
                                    alt=""
                                  ></img>
                                )}

                                {fulfillment.shipment
                                  ?.delivery_service_provider_type ===
                                  "Shipper" &&
                                  shipper &&
                                  shipper.find(
                                    (s) =>
                                      fulfillment.shipment?.shipper_code ===
                                      s.code
                                  )?.full_name}
                              </b>
                            </Col>
                          </Col>
                          {CheckShipmentType(props.OrderDetail!) ===
                            "external_service" && (
                            <Col md={5}>
                              <Col span={24}>
                                <p className="text-field">Dịch vụ:</p>
                              </Col>
                              <Col span={24}>
                                <b className="text-field">
                                  {getServiceName(props.OrderDetail!)}
                                </b>
                              </Col>
                            </Col>
                          )}

                          <Col md={5}>
                            <Col span={24}>
                              <p className="text-field">Phí ship trả HVC:</p>
                            </Col>
                            <Col span={24}>
                              <b className="text-field">
                                {props.OrderDetail?.fulfillments &&
                                  formatCurrency(
                                    fulfillment.shipment
                                      ?.shipping_fee_paid_to_three_pls
                                      ? fulfillment.shipment
                                          ?.shipping_fee_paid_to_three_pls
                                      : 0
                                  )}
                              </b>
                            </Col>
                          </Col>

                          <Col md={5}>
                            <Col span={24}>
                              <p className="text-field">Phí ship báo khách:</p>
                            </Col>
                            <Col span={24}>
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
                          </Col>

                          {CheckShipmentType(props.OrderDetail!) ===
                            "external_service" && (
                            <Col md={4}>
                              <Col span={24}>
                                <p className="text-field">Trọng lượng:</p>
                              </Col>
                              <Col span={24}>
                                <b className="text-field">
                                  {props.OrderDetail?.fulfillments &&
                                    props.OrderDetail?.fulfillments.length >
                                      0 &&
                                    formatCurrency(
                                      props.OrderDetail.items &&
                                        SumWeightResponse(
                                          props.OrderDetail.items
                                        )
                                    )}
                                  g
                                </b>
                              </Col>
                            </Col>
                          )}
                        </Row>
                      )}
                      <Row className="orders-shipment-item">
                        <Collapse ghost>
                          <Panel
                            header={
                              <Row>
                                <Col style={{ alignItems: "center" }}>
                                  <b
                                    style={{
                                      marginRight: "10px",
                                      color: "#222222",
                                    }}
                                  >
                                    {props.OrderDetail?.items.reduce(
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
                            {props.OrderDetail?.items.map((item, index) => (
                              <div
                                className="orders-shipment-item-view"
                                key={index}
                              >
                                <div className="orders-shipment-item-view-wrap">
                                  <div className="orders-shipment-item-name">
                                    <div>
                                      <Link style={{ color: "#2A2A86" }}>
                                        {item.sku}
                                      </Link>
                                    </div>
                                    <Badge
                                      status="default"
                                      text={item.variant}
                                      style={{ marginLeft: 7 }}
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
                                    <span style={{ marginRight: 10 }}>
                                      {item.quantity >= 10
                                        ? item.quantity
                                        : "0" + item.quantity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </Panel>
                        </Collapse>
                      </Row>
                      {CheckShipmentType(props.OrderDetail!) ===
                        "external_service" &&
                        fulfillment.status !== FulFillmentStatus.CANCELLED &&
                        fulfillment.status !== FulFillmentStatus.RETURNING &&
                        fulfillment.status !== FulFillmentStatus.RETURNED && (
                          <Row
                            gutter={24}
                            style={{
                              marginTop: 12,
                              marginBottom: 0,
                              padding: "0 12px",
                            }}
                          >
                            <Col span={24}>
                              <Collapse ghost>
                                <Panel
                                  header={
                                    <Row>
                                      <Col style={{ alignItems: "center" }}>
                                        <span
                                          style={{
                                            marginRight: "10px",
                                            color: "#222222",
                                          }}
                                        >
                                          Mã vận đơn:
                                        </span>
                                        <Link
                                          href={`https://i.ghtk.vn/${
                                            props.OrderDetail?.fulfillments &&
                                            props.OrderDetail?.fulfillments[0]
                                              .shipment?.tracking_code
                                          }`}
                                          className="text-field"
                                          style={{
                                            color: "#2A2A86",
                                            fontWeight: 500,
                                            fontSize: 16,
                                          }}
                                        >
                                          {TrackingCode(props.OrderDetail)}
                                        </Link>
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
                                                TrackingCode(props.OrderDetail)!
                                              )
                                            }
                                            src={copyFileBtn}
                                            alt=""
                                            style={{ width: 23 }}
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
                                    defaultActiveKey={["0"]}
                                  >
                                    {trackingLogFulfillment?.map(
                                      (item, index) => (
                                        <Panel
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
                                                  margin: "16px 10px 10px 10px",
                                                  color: "#737373",
                                                }}
                                              ></i>{" "}
                                              <span
                                                style={{ color: "#737373" }}
                                              >
                                                {moment(
                                                  item.created_date
                                                ).format("DD/MM/YYYY HH:mm")}
                                              </span>
                                            </div>
                                          }
                                          key={index}
                                          showArrow={false}
                                        ></Panel>
                                      )
                                    )}
                                  </Collapse>
                                </Panel>
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
                      {(fulfillment.status_before_cancellation ===
                        FulFillmentStatus.SHIPPING &&
                        fulfillment.status === FulFillmentStatus.CANCELLED) ||
                      fulfillment.status === FulFillmentStatus.RETURNING ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            padding: "14px 0 7px 0",
                          }}
                        >
                          <Button
                            key={fulfillment.id}
                            type="primary"
                            className="ant-btn-outline fixed-button text-right"
                            style={{
                              padding: "0 25px",
                            }}
                            onClick={() => goodsReturnCallback(fulfillment.id)}
                          >
                            Nhận hàng
                          </Button>
                        </div>
                      ) : null}
                    </Panel>
                  </Collapse>
                </div>
              )
          )}

        <div
          className=""
          style={{
            display: "flex",
            justifyContent: "flex-end",
            margin: "14px 25px 19px 0",
          }}
        >
          {props.stepsStatusValue === FulFillmentStatus.SHIPPED ? (
            <Button
              type="primary"
              style={{ marginLeft: "10px", padding: "0 25px" }}
              className="create-button-custom ant-btn-outline fixed-button"
              onClick={() => {
                history.push(
                  `${UrlConfig.ORDER}/order-return/create?orderID=${OrderDetail?.id}`
                );
              }}
            >
              Đổi trả hàng
            </Button>
          ) : (
            <>
              {props.OrderDetail?.fulfillments &&
              props.OrderDetail?.fulfillments.length > 0 &&
              props.OrderDetail?.fulfillments[0].shipment &&
              props.OrderDetail?.fulfillments[0].shipment
                .delivery_service_provider_type === "pick_at_store" ? (
                <Button
                  onClick={cancelFullfilment}
                  type="default"
                  className="create-button-custom ant-btn-outline fixed-button saleorder_shipment_cancel_btn"
                  style={{
                    // color: "#737373",
                    border: "1px solid #E5E5E5",
                    padding: "0 25px",
                  }}
                >
                  Hủy
                </Button>
              ) : (
                props.OrderDetail?.fulfillments &&
                props.OrderDetail?.fulfillments.length > 0 &&
                props.OrderDetail?.fulfillments[0].shipment && (
                  <Button
                    onClick={cancelFullfilment}
                    type="default"
                    className="create-button-custom ant-btn-outline fixed-button saleorder_shipment_cancel_btn"
                    style={{
                      border: "1px solid #E5E5E5",
                      padding: "0 25px",
                    }}
                  >
                    Hủy đơn giao
                  </Button>
                )
              )}
            </>
          )}
          {props.stepsStatusValue === OrderStatus.FINALIZED &&
            props.OrderDetail?.fulfillments &&
            props.OrderDetail?.fulfillments.length > 0 &&
            props.OrderDetail.fulfillments[0].shipment &&
            props.OrderDetail.fulfillments[0].shipment
              ?.delivery_service_provider_type !== "pick_at_store" && (
              <Button
                type="primary"
                style={{ marginLeft: "10px", padding: "0 25px" }}
                className="create-button-custom ant-btn-outline fixed-button"
                id="btn-go-to-pack"
                onClick={onOkShippingConfirm}
              >
                Nhặt hàng
              </Button>
            )}

          {props.stepsStatusValue === OrderStatus.FINALIZED &&
            props.OrderDetail?.fulfillments &&
            props.OrderDetail?.fulfillments.length > 0 &&
            props.OrderDetail.fulfillments[0].shipment
              ?.delivery_service_provider_type === "pick_at_store" && (
              <Button
                type="primary"
                style={{ marginLeft: "10px" }}
                className="create-button-custom ant-btn-outline fixed-button"
                onClick={onOkShippingConfirm}
              >
                Nhặt hàng & đóng gói
              </Button>
            )}

          {props.stepsStatusValue === FulFillmentStatus.PICKED && (
            <Button
              type="primary"
              className="create-button-custom ant-btn-outline fixed-button"
              style={{ marginLeft: "10px" }}
              onClick={onOkShippingConfirm}
            >
              Đóng gói
            </Button>
          )}
          {props.stepsStatusValue === FulFillmentStatus.PACKED &&
            props.OrderDetail?.fulfillments &&
            props.OrderDetail?.fulfillments.length > 0 &&
            props.OrderDetail.fulfillments[0].shipment
              ?.delivery_service_provider_type !== "pick_at_store" && (
              <Button
                type="primary"
                style={{ marginLeft: "10px", padding: "0 25px" }}
                className="create-button-custom ant-btn-outline fixed-button"
                onClick={() => setIsvibleShippingConfirm(true)}
              >
                Xuất kho
              </Button>
            )}
          {props.stepsStatusValue === FulFillmentStatus.SHIPPING && (
            <Button
              type="primary"
              style={{ marginLeft: "10px" }}
              className="create-button-custom ant-btn-outline fixed-button"
              onClick={() => setIsvibleShippedConfirm(true)}
            >
              Đã giao hàng
            </Button>
          )}

          {props.stepsStatusValue === FulFillmentStatus.PACKED &&
            props.OrderDetail?.fulfillments &&
            props.OrderDetail?.fulfillments.length > 0 &&
            props.OrderDetail.fulfillments[0].shipment
              ?.delivery_service_provider_type === "pick_at_store" && (
              <Button
                type="primary"
                style={{ marginLeft: "10px", padding: "0 25px" }}
                className="create-button-custom ant-btn-outline fixed-button"
                onClick={() => setIsvibleShippedConfirm(true)}
              >
                Xuất kho & giao hàng
              </Button>
            )}

          {isVisibleShipping === false &&
            props.OrderDetailAllFullfilment?.fulfillments &&
            !props.OrderDetailAllFullfilment?.fulfillments.some(
              (fulfillment) =>
                fulfillment.status !== FulFillmentStatus.CANCELLED &&
                fulfillment.status !== FulFillmentStatus.RETURNING &&
                fulfillment.status !== FulFillmentStatus.RETURNED &&
                fulfillment?.shipment?.delivery_service_provider_type
            ) && (
              <Button
                type="primary"
                className="ant-btn-outline fixed-button text-right"
                style={{
                  float: "right",
                  padding: "0 25px",
                }}
                onClick={ShowShipping}
              >
                Giao hàng
              </Button>
            )}
        </div>
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
              <Row gutter={24} style={{ justifyContent: "space-between" }}>
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
                        moment().add(-1, "days") >= current
                      }
                    />
                  </Form.Item>
                </Col>

                <Col md={6}>
                  <Form.Item>
                    <Checkbox
                      style={{ marginTop: "8px" }}
                      checked={props.officeTime}
                      onChange={(e) => props.setOfficeTime(e.target.checked)}
                    >
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
                      onChange={(value) => setRequirementNameCallback(value)}
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
                    shipmentMethod === ShipmentMethodOption.DELIVER_LATER
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
                            onClick={() => ShipMethodOnChange(button.value)}
                          >
                            <img src={button.icon} alt="icon"></img>
                            <span>{button.name}</span>
                          </div>
                        ) : (
                          <div
                            className={
                              shipmentMethod ===
                              ShipmentMethodOption.DELIVER_LATER
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
              {/*--- Chuyển hãng vận chuyển ----*/}
              {shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && (
                <>
                  <Row gutter={24}>
                    <Col md={12}>
                      <Form.Item label="Tiền thu hộ:">
                        <NumberInput
                          format={(a: string) => formatCurrency(a)}
                          replace={(a: string) => replaceFormatString(a)}
                          placeholder="0"
                          // value={customerNeedToPayValue}
                          value={
                            customerNeedToPayValue -
                            (OrderDetail?.total_paid
                              ? OrderDetail?.total_paid
                              : 0)
                          }
                          onChange={(value: any) => setTakeMoneyHelper(value)}
                          style={{
                            textAlign: "right",
                            width: "100%",
                            color: "#222222",
                          }}
                          maxLength={999999999999}
                          minLength={0}
                        />
                      </Form.Item>
                    </Col>
                    <Col md={12}>
                      <Form.Item
                        label="Phí ship báo khách"
                        name="shipping_fee_informed_to_customer"
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
                            changeShippingFeeInformedCustomer(e)
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <div className="ant-table ant-table-bordered custom-table">
                    <div className="ant-table-container">
                      <div className="ant-table-content">
                        <table
                          className="table-bordered"
                          style={{ width: "100%", tableLayout: "auto" }}
                        >
                          <thead className="ant-table-thead">
                            <tr>
                              <th className="ant-table-cell">
                                Hãng vận chuyển
                              </th>
                              <th className="ant-table-cell">
                                Dịch vụ chuyển phát
                              </th>
                              <th
                                className="ant-table-cell"
                                style={{ textAlign: "right" }}
                              >
                                Cước phí
                              </th>
                            </tr>
                          </thead>
                          <tbody className="ant-table-tbody">
                            {deliveryServices &&
                              deliveryServices.map((single, index) => {
                                return (
                                  <React.Fragment key={index}>
                                    <tr>
                                      <td>
                                        <img
                                          src={single.logo ? single.logo : ""}
                                          alt=""
                                          style={{
                                            width: "184px",
                                            height: "41px",
                                          }}
                                        />
                                      </td>
                                      <td style={{ padding: 0 }}>
                                        {single.code === "ghtk" ? (
                                          <div>
                                            <label className="radio-container">
                                              <input
                                                type="radio"
                                                name="tt"
                                                className="radio-delivery"
                                                value="standard"
                                                onChange={(e) =>
                                                  changeServiceType(
                                                    single.id,
                                                    single.code,
                                                    "standard",
                                                    infoGHTK.length > 1
                                                      ? infoGHTK[0].fee
                                                      : 0
                                                  )
                                                }
                                              />
                                              <span className="checkmark"></span>
                                              Đường bộ
                                            </label>
                                            <Divider
                                              style={{ margin: "8px 0" }}
                                            />
                                            <label className="radio-container">
                                              <input
                                                type="radio"
                                                name="tt"
                                                className="radio-delivery"
                                                value="express"
                                                onChange={(e) =>
                                                  changeServiceType(
                                                    single.id,
                                                    single.code,
                                                    "express",
                                                    infoGHTK.length > 1
                                                      ? infoGHTK[1].fee
                                                      : 0
                                                  )
                                                }
                                              />
                                              <span className="checkmark"></span>
                                              Đường bay
                                            </label>
                                          </div>
                                        ) : (
                                          <label className="radio-container">
                                            <input
                                              type="radio"
                                              name="tt"
                                              className="radio-delivery"
                                              value={`${single.code}_standard`}
                                              onChange={(e) =>
                                                changeServiceType(
                                                  single.id,
                                                  single.code,
                                                  "standard",
                                                  0
                                                )
                                              }
                                            />
                                            <span className="checkmark"></span>
                                            Chuyển phát nhanh PDE
                                          </label>
                                        )}
                                      </td>
                                      <td
                                        style={{
                                          padding: 0,
                                          textAlign: "right",
                                        }}
                                      >
                                        {single.code === "ghtk" ? (
                                          <div>
                                            <div
                                              style={{ padding: "8px 16px" }}
                                              className="custom-table__has-border-bottom custom-table__has-select-radio"
                                            >
                                              {infoGHTK && infoGHTK.length > 0
                                                ? formatCurrency(
                                                    infoGHTK[0].fee
                                                  )
                                                : 0}
                                            </div>
                                            <div
                                              style={{ padding: "8px 16px" }}
                                              className="custom-table__has-border-bottom custom-table__has-select-radio"
                                            >
                                              {infoGHTK && infoGHTK.length > 1
                                                ? formatCurrency(
                                                    infoGHTK[1].fee
                                                  )
                                                : 0}
                                            </div>
                                          </div>
                                        ) : (
                                          <div
                                            style={{ padding: "8px 16px" }}
                                            className="custom-table__has-border-bottom custom-table__has-select-radio"
                                          >
                                            100.000
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <Col
                    md={24}
                    style={{ margin: "20px 0", padding: "20px 0 25px 0" }}
                  >
                    <div>
                      <Button
                        type="primary"
                        className="create-button-custom"
                        style={{
                          float: "right",
                          padding: "0 25px",
                          letterSpacing: "0.2px",
                        }}
                        htmlType="submit"
                      >
                        Tạo đơn giao hàng 1
                      </Button>
                      <Button
                        className="ant-btn-outline fixed-button cancle-button create-button-custom"
                        onClick={() => window.location.reload()}
                        style={{
                          float: "right",
                          padding: "0 25px",
                          letterSpacing: "0.2px",
                        }}
                      >
                        Huỷ
                      </Button>
                    </div>
                  </Col>
                </>
              )}

              {/* Tự vận chuyển */}
              {shipmentMethod === ShipmentMethodOption.SELF_DELIVER && (
                <div>
                  <Row gutter={24}>
                    <Col md={12}>
                      <Form.Item
                        label="Đối tác giao hàng 12"
                        name="shipper_code"
                        rules={[
                          {
                            required: shipmentMethod === 2,
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
                            replace={(a: string) => replaceFormatString(a)}
                            placeholder="0"
                            style={{
                              textAlign: "right",
                              width: "100%",
                              color: "#222222",
                            }}
                            maxLength={15}
                            minLength={0}
                            value={takeHelperValue}
                            onChange={(value) => setTakeMoneyHelper(value)}
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
                            changeShippingFeeInformedCustomer(e)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col md={24}>
                      <div>
                        <Button
                          type="primary"
                          className="create-button-custom"
                          style={{ float: "right" }}
                          htmlType="submit"
                        >
                          Tạo đơn giao hàng 2
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
                  </Row>
                </div>
              )}
              {/*--- Nhận tại cửa hàng ----*/}
              {shipmentMethod === ShipmentMethodOption.PICK_AT_STORE && (
                <div className="receive-at-store">
                  <b>
                    <img
                      style={{ marginRight: 12 }}
                      src={storeBluecon}
                      alt=""
                    />{" "}
                    THÔNG TIN CỬA HÀNG
                  </b>

                  <Row style={{ paddingTop: "19px" }}>
                    <Col md={3} lg={2}>
                      <div>Tên cửa hàng:</div>
                    </Col>
                    <b className="row-info-content">
                      <Typography.Link style={{ color: "#222222" }}>
                        {props.storeDetail?.name}
                      </Typography.Link>
                    </b>
                  </Row>
                  <Row className="row-info padding-top-10">
                    <Col md={3} lg={2}>
                      <div>Số điện thoại:</div>
                    </Col>
                    <b className="row-info-content">
                      {props.storeDetail?.hotline}
                    </b>
                  </Row>
                  <Row className="row-info padding-top-10">
                    <Col md={3} lg={2}>
                      <div>Địa chỉ:</div>
                    </Col>
                    <b className="row-info-content">
                      {props.storeDetail?.address}
                    </b>
                  </Row>
                  <Row>
                    <Col md={24}>
                      <div>
                        <Button
                          type="primary"
                          className="create-button-custom"
                          style={{ float: "right" }}
                          htmlType="submit"
                        >
                          Tạo đơn giao hàng 3
                        </Button>
                        <Button
                          className="ant-btn-outline fixed-button cancle-button create-button-custom"
                          onClick={() => window.location.reload()}
                          style={{ float: "right" }}
                        >
                          Hủy
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}
            </Form>
            {/*--- Giao hàng sau ----*/}
            <Row className="ship-later-box" hidden={shipmentMethod !== 4}></Row>
          </div>
        )}
      </Card>

      <SaveAndConfirmOrder
        onCancel={() => setIsvibleShippingConfirm(false)}
        onOk={onOkShippingConfirm}
        visible={isvibleShippingConfirm}
        icon={WarningIcon}
        okText="Đồng ý"
        cancelText="Hủy"
        title=""
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
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
        title=""
        text={`Vui lòng xác nhận ${
          confirmExportAndFinishValue()
            ? "thanh toán " + formatCurrency(confirmExportAndFinishValue()!)
            : ""
        } để giao hàng thành công?`}
      />
      {/* Huy fulfillment pick, pack, unship */}
      <SaveAndConfirmOrder
        onCancel={() => setIsvibleCancelFullfilment(false)}
        onOk={onOKCancelFullfilment}
        visible={isvibleCancelFullfilment}
        icon={DeleteIcon}
        okText="Hủy đơn giao"
        cancelText="Thoát"
        title="Bạn có chắc chắn hủy đơn giao hàng này không?"
        text="Tiền thu hộ nếu có cũng sẽ bị hủy"
      />
      {/* Huy fulfillment shiping */}
      <CancelFullfilmentModal
        onCancel={() => setIsvibleCancelandGetGoodsBack(false)}
        onOk={onOKCancelFullfilment}
        onOkandMore={onOkCancelAndGetGoodsBack}
        visible={isvibleCancelandGetGoodsBack}
        icon={DeleteIcon}
        okText="Hủy đơn giao"
        cancelText="Thoát"
        title="Bạn có chắc chắn hủy đơn giao hàng này không?"
        text="Tiền thu hộ nếu có cũng sẽ bị hủy"
      />

      {/* Nhận hàng trả lại */}
      <GetGoodsBack
        setCancelReason={setCancelReason}
        onCancel={() => setIsvibleGoodsReturn(false)}
        onOk={onOKGoodsReturn}
        visible={isvibleGoodsReturn}
        icon={AlertIcon}
        okText="Nhận hàng trả lại"
        cancelText="Thoát"
        title=""
        text="Bạn có chắc chắn nhận hàng trả lại của đơn giao hàng này không?"
      />
    </div>
  );
};

export default UpdateShipmentCard;
