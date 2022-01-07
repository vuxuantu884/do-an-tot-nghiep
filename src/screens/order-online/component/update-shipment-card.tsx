import {
	Badge,
	Button,
	Card,
	Col,
	Collapse,
	Form,
	Row,
	Space,
	Tag,
	Typography
} from "antd";
import calendarOutlined from "assets/icon/calendar_outline.svg";
import copyFileBtn from "assets/icon/copyfile_btn.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import AlertIcon from "assets/icon/ydAlertIcon.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import storeBluecon from "assets/img/storeBlue.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import OrderCreateShipment from "component/order/OrderCreateShipment";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
import {
	DeliveryServicesGetList,
	getTrackingLogFulfillmentAction,
	UpdateFulFillmentStatusAction,
	UpdateShipmentAction
} from "domain/actions/order/order.action";
import useAuthorization from "hook/useAuthorization";
import { StoreResponse } from "model/core/store.model";
import { thirdPLModel } from "model/order/shipment.model";
import { OrderSettingsModel } from "model/other/order/order-model";
import { RootReducerType } from "model/reducers/RootReducerType";
import {
	UpdateFulFillmentRequest,
	UpdateFulFillmentStatusRequest,
	UpdateLineFulFillment,
	UpdateShipmentRequest
} from "model/request/order.request";
import { CustomerResponse } from "model/response/customer/customer.response";
import {
	DeliveryServiceResponse,
	FulFillmentResponse,
	OrderResponse,
	ShipmentResponse,
	TrackingLogFulfillmentResponse
} from "model/response/order/order.response";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { setTimeout } from "timers";
import {
	checkIfOrderHasReturnedAll,
	checkPaymentStatusToShow,
	CheckShipmentType,
	formatCurrency,
	getAmountPayment, getShippingAddressDefault, SumWeight,
	SumWeightResponse,
	TrackingCode
} from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus, ShipmentMethod, ShipmentMethodOption } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { dangerColor } from "utils/global-styles/variables";
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
	shippingFeeInformedCustomer: number;
	setShippingFeeInformedCustomer: (value: number) => void;
	setVisibleUpdatePayment: (value: boolean) => void;
	setShipmentMethod: (value: number) => void;
	setVisibleShipping: (value: boolean) => void;
	setOfficeTime: (value: boolean) => void;
	onReload?: () => void;
	disabledActions?: (type: string) => void;
	OrderDetail: OrderResponse | null;
	storeDetail?: StoreResponse;
	stepsStatusValue?: string;
	totalPaid?: number;
	officeTime: boolean | undefined;
	shipmentMethod: number;
	isVisibleShipping: boolean | null;
	customerDetail: CustomerResponse | null;
	OrderDetailAllFullfilment: OrderResponse | null;
	orderSettings?: OrderSettingsModel;
	disabledBottomActions?: boolean;
	reasons?: any[];
	isEcommerceOrder?: boolean;
};

const UpdateShipmentCard: React.FC<UpdateShipmentCardProps> = (
	props: UpdateShipmentCardProps
) => {
	// props destructuring
	const {
		isVisibleShipping,
		shipmentMethod,
		setVisibleShipping,
		setShipmentMethod,
		onReload,
		disabledActions,
		OrderDetail,
		orderSettings,
		disabledBottomActions,
		isEcommerceOrder,
	} = props;

	const history = useHistory();
	// node dom
	const [form] = Form.useForm();
	// action
	const dispatch = useDispatch();

	//handle create a new fulfillment for ecommerce order
	const latestFulfillment = useMemo(() => {
		const fulfillment = props.OrderDetailAllFullfilment?.fulfillments
			? props.OrderDetailAllFullfilment.fulfillments[0]
			: null;
		return fulfillment;
	}, [props.OrderDetailAllFullfilment]);

	const initSelfDelivery = useMemo(() => {
		const selfDelivery = {
			shipper_code: (isEcommerceOrder && latestFulfillment && latestFulfillment.shipment) ? latestFulfillment.shipment.shipper_code : null,
			shipping_fee_paid_to_three_pls: (isEcommerceOrder && latestFulfillment && latestFulfillment.shipment) ? latestFulfillment.shipment.shipping_fee_paid_to_three_pls : null,
			shipping_fee_informed_to_customer: (isEcommerceOrder && latestFulfillment && latestFulfillment.shipment) ? latestFulfillment.shipment.shipping_fee_informed_to_customer : null,
		};

		return selfDelivery;
	}, [isEcommerceOrder, latestFulfillment]);

	// ffm asc id
	const newFulfillments = useMemo(() => {
		const ffm = props.OrderDetailAllFullfilment?.fulfillments
			? [...props.OrderDetailAllFullfilment.fulfillments.reverse()]
			: [];
		return ffm;
	}, [props.OrderDetailAllFullfilment]);
	// state
	// const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
	//   useState<number>(0);
	const [isvibleShippedConfirm, setIsvibleShippedConfirm] = useState<boolean>(false);
	const [requirementNameView, setRequirementNameView] = useState<string | null>(null);
	const [updateShipment, setUpdateShipment] = useState(false);
	const [cancelShipment, setCancelShipment] = useState(false);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [takeMoneyHelper, setTakeMoneyHelper] = useState<number | null>(null);
	console.log(setTakeMoneyHelper)

	const [trackingLogFulfillment, setTrackingLogFulfillment] =
		useState<Array<TrackingLogFulfillmentResponse> | null>(null);
	const [deliveryServices, setDeliveryServices] = useState<DeliveryServiceResponse[]>([]);
	const shipping_requirements = useSelector(
		(state: RootReducerType) => state.bootstrapReducer.data?.shipping_requirement
	);

	const [allowCreatePacked] = useAuthorization({
		acceptPermissions: [ODERS_PERMISSIONS.CREATE_PACKED],
		not: false,
	});

	const [allowCreateShipping] = useAuthorization({
		acceptPermissions: [ODERS_PERMISSIONS.CREATE_SHIPPING],
		not: false,
	});
	const [allowCreatePicked] = useAuthorization({
		acceptPermissions: [ODERS_PERMISSIONS.CREATE_PICKED],
		not: false,
	});

	const [thirdPL, setThirdPL] = useState<thirdPLModel>({
		delivery_service_provider_code: "",
		delivery_service_provider_id: null,
		insurance_fee: null,
		delivery_service_provider_name: "",
		delivery_transport_type: "",
		service: "",
		shipping_fee_paid_to_three_pls: null,
	});
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
		navigator.clipboard.writeText(data ? data : "").then(() => { });
	};

	const [reload, setReload] = useState(false);
	useEffect(() => {
		if (TrackingCode(props.OrderDetail) !== "Đang xử lý" || reload) {
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
		setReload(false);
	}, [dispatch, props.OrderDetail, reload]); //logne

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

	const sortedFulfillments = useMemo(() => {
		return OrderDetail?.fulfillments?.sort((a, b) => b.id - a.id)
	}, [OrderDetail?.fulfillments])

	const totalPaid = OrderDetail?.payments ? getAmountPayment(OrderDetail.payments) : 0;

	//#region Update Fulfillment Status
	// let timeout = 500;
	const onUpdateSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		setReload(true);
		showSuccess("Tạo đơn giao hàng thành công");
		onReload && onReload();
	};
	const onPickSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		setReload(true);
		showSuccess("Nhặt hàng thành công");
		onReload && onReload();
	};

	const onPackSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		setReload(true);
		showSuccess("Đóng gói thành công");
		onReload && onReload();
	};

	const onShippingSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		setReload(true);
		showSuccess("Xuất kho thành công");
		setIsvibleShippingConfirm(false);
		// onReload && onReload();
		window.location.reload();
	};

	const onShipedSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		setReload(true);
		showSuccess("Hoàn tất đơn hàng");
		setIsvibleShippedConfirm(false);
		onReload && onReload();
	};

	const onCancelSuccess = (value: OrderResponse) => {
		setCancelShipment(false);
		setReload(true);
		showSuccess(
			`Bạn đã hủy đơn giao hàng ${props.OrderDetail?.fulfillments &&
			props.OrderDetail?.fulfillments.length > 0 &&
			props.OrderDetail?.fulfillments.filter(
				(fulfillment) =>
					fulfillment.status !== FulFillmentStatus.CANCELLED &&
					fulfillment.status !== FulFillmentStatus.RETURNING &&
					fulfillment.status !== FulFillmentStatus.RETURNED
			)[0].id
			} thành công`
		);
		setIsvibleCancelFullfilment(false);
		onReload && onReload();
	};
	const onError = (error: boolean) => {
		// console.log('error');
		setUpdateShipment(false);
		setCancelShipment(false);
		setIsvibleShippingConfirm(false);
		setIsvibleCancelFullfilment(false);
		setIsvibleGoodsReturn(false);
		setIsvibleShippedConfirm(false);
	};
	const onReturnSuccess = (value: OrderResponse) => {
		setCancelShipment(false);
		setReload(true);
		showSuccess(
			`Bạn đã nhận hàng trả lại của đơn giao hàng ${fullfilmentIdGoodReturn}`
		);
		setIsvibleGoodsReturn(false);
		onReload && onReload();
	};

	//fulfillmentTypeOrderRequest
	const fulfillmentTypeOrderRequest = (type: number, dataCancelFFM: any = {}) => {
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
		(async () => {
			switch (type) {
				case 1:
					value.status = FulFillmentStatus.PICKED;
					value.action = FulFillmentStatus.PICKED;
					setUpdateShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, onPickSuccess, onError));
					break;
				case 2:
					value.status = FulFillmentStatus.PACKED;
					value.action = FulFillmentStatus.PACKED;
					setUpdateShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, onPackSuccess, onError));

					break;
				case 3:
					value.status = FulFillmentStatus.SHIPPING;
					value.action = FulFillmentStatus.SHIPPING;
					setUpdateShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, onShippingSuccess, onError));
					break;
				case 4:
					value.status = FulFillmentStatus.SHIPPED;
					value.action = FulFillmentStatus.SHIPPED;
					setUpdateShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, onShipedSuccess, onError));
					break;
				case 5:
					console.log('dataCancelFFM', dataCancelFFM);

					value.status = FulFillmentStatus.CANCELLED;
					value.action = FulFillmentStatus.CANCELLED;
					value.cancel_reason_id = dataCancelFFM.reasonID
					value.sub_cancel_reason_id = dataCancelFFM.reasonSubID
					value.reason = dataCancelFFM.reason
					setCancelShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, onCancelSuccess, onError));
					break;
				case 6:
					value.status = FulFillmentStatus.RETURNING;
					value.action = FulFillmentStatus.RETURNING;
					setUpdateShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, onCancelSuccess, onError));
					break;
				case 7:
					console.log('dataCancelFFM', dataCancelFFM);
					value.status = FulFillmentStatus.RETURNED;
					value.action = FulFillmentStatus.RETURNED;
					value.cancel_reason_id = dataCancelFFM.reasonID
					value.sub_cancel_reason_id = dataCancelFFM.reasonSubID
					value.reason = dataCancelFFM.reason
					setCancelShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, onCancelSuccess, onError));
					break;
				default:
					return;
			}
		})();
	};
	// shipping confirm
	const [isvibleShippingConfirm, setIsvibleShippingConfirm] = useState<boolean>(false);
	const onOkShippingConfirm = () => {
		if (
			props.OrderDetail?.fulfillments &&
			props.OrderDetail?.fulfillments.length > 0 &&
			props.OrderDetail?.fulfillments[0].shipment &&
			props.OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED &&
			props.OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type !==
			ShipmentMethod.PICK_AT_STORE
		) {
			fulfillmentTypeOrderRequest(1);
		} else if (
			props.stepsStatusValue === FulFillmentStatus.PICKED ||
			(props.OrderDetail?.fulfillments &&
				props.OrderDetail?.fulfillments.length > 0 &&
				props.OrderDetail?.fulfillments[0].shipment &&
				props.OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED &&
				props.OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type ===
				ShipmentMethod.PICK_AT_STORE)
		) {
			fulfillmentTypeOrderRequest(2);
		} else if (
			props.stepsStatusValue === FulFillmentStatus.PACKED &&
			props.OrderDetail?.fulfillments &&
			props.OrderDetail?.fulfillments.length > 0 &&
			props.OrderDetail?.fulfillments[0].shipment &&
			props.OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type !==
			ShipmentMethod.PICK_AT_STORE
		) {
			fulfillmentTypeOrderRequest(3);
		} else if (
			props.stepsStatusValue === FulFillmentStatus.SHIPPING ||
			(props.OrderDetail?.fulfillments &&
				props.OrderDetail?.fulfillments.length > 0 &&
				props.OrderDetail?.fulfillments[0].shipment &&
				props.OrderDetail?.fulfillments[0].status === FulFillmentStatus.PACKED &&
				props.OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type ===
				ShipmentMethod.PICK_AT_STORE)
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
			props.OrderDetail?.fulfillments[0].shipment.delivery_service_provider_type ===
			ShipmentMethod.PICK_AT_STORE
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
			props.OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer
		) {
			return (
				props.OrderDetail?.fulfillments[0].shipment.shipping_fee_informed_to_customer +
				props.OrderDetail?.total_line_amount_after_line_discount +
				props.shippingFeeInformedCustomer -
				totalPaid -
				(props.OrderDetail?.discounts &&
					props.OrderDetail?.discounts.length > 0 &&
					props.OrderDetail?.discounts[0].amount
					? props.OrderDetail?.discounts[0].amount
					: 0)
			);
		} else if (props.OrderDetail?.total && totalPaid) {
			return (
				props.OrderDetail?.total +
				props.shippingFeeInformedCustomer -
				totalPaid
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
		delivery_service_provider_code: "",
		delivery_service_provider_name: "",
		delivery_transport_type: "",
		shipper_code: initSelfDelivery.shipper_code,
		shipper_name: "",
		handover_id: null,
		service: null,
		fee_type: "",
		fee_base_on: "",
		delivery_fee: null,
		shipping_fee_paid_to_three_pls: initSelfDelivery.shipping_fee_paid_to_three_pls,
		cod: null,
		expected_received_date: "",
		reference_status: "",
		shipping_fee_informed_to_customer: initSelfDelivery.shipping_fee_informed_to_customer,
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
		value.shipping_fee_informed_to_customer = props.shippingFeeInformedCustomer;
		value.expected_received_date = value.dating_ship?.utc().format();
		let requirement = form.getFieldValue("requirements");
		const reqObj = shipping_requirements?.find((r) => r.value === requirement);
		value.requirements_name = reqObj?.name || null;

		value.office_time = props.officeTime;
		if (props.OrderDetail?.fulfillments) {
			if (shipmentMethod === ShipmentMethodOption.SELF_DELIVER) {
				value.delivery_service_provider_type = thirdPL.delivery_service_provider_code;
				value.service = thirdPL.service;
			}
			if (shipmentMethod === ShipmentMethodOption.PICK_AT_STORE) {
				value.delivery_service_provider_type = ShipmentMethod.PICK_AT_STORE;
			}

			if (shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER) {
				value.delivery_service_provider_id = thirdPL.delivery_service_provider_id;
				value.delivery_service_provider_type = ShipmentMethod.EXTERNAL_SERVICE;
				value.delivery_service_provider_code = thirdPL.delivery_service_provider_code;
				value.delivery_service_provider_name = thirdPL.delivery_service_provider_name;
				// delivery_transport_type = serviceName
				value.delivery_transport_type = thirdPL.delivery_transport_type;
				value.sender_address_id = props.OrderDetail.store_id;
				value.service = thirdPL.service;
				value.shipping_fee_informed_to_customer = props.shippingFeeInformedCustomer;
				value.shipping_fee_paid_to_three_pls = thirdPL.shipping_fee_paid_to_three_pls;
			}
		}
		if (props.OrderDetail != null) {
			FulFillmentRequest.order_id = props.OrderDetail.id;
			if (props.OrderDetail.fulfillments && props.OrderDetail.fulfillments.length !== 0) {
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
			console.log('takeHelperValue', takeHelperValue)
			if (takeHelperValue > 0) {
				value.cod = takeHelperValue;
			}
		}
		if (
			props.OrderDetail?.status === "draft" &&
			totalAmountCustomerNeedToPay === props.totalPaid
		) {
			value.cod = totalAmountCustomerNeedToPay;
		}

		FulFillmentRequest.shipment = value;

		if (props.shippingFeeInformedCustomer !== null) {
			FulFillmentRequest.shipping_fee_informed_to_customer =
				props.shippingFeeInformedCustomer;
		}
		if (props.shippingFeeInformedCustomer !== null) {
			FulFillmentRequest.total =
				props.OrderDetail?.total_line_amount_after_line_discount &&
				props.OrderDetail?.total_line_amount_after_line_discount +
				props.shippingFeeInformedCustomer;
		} else {
			FulFillmentRequest.total = props.OrderDetail?.total_line_amount_after_line_discount;
		}

		let UpdateLineFulFillment: UpdateLineFulFillment = {
			order_id: FulFillmentRequest.order_id,
			fulfillment: FulFillmentRequest,
			action: OrderStatus.FINALIZED,
		};

		if (shipmentMethod === ShipmentMethodOption.DELIVER_PARTNER && !thirdPL.service) {
			showError("Vui lòng chọn đơn vị vận chuyển!");
		} else {
			setUpdateShipment(true);
			(async () => {
				try {
					await dispatch(
						UpdateShipmentAction(UpdateLineFulFillment, onUpdateSuccess, onError)
					);
				} catch { }
			})();
			// setUpdateShipment(false);
		}
	};
	// get req to view
	const getRequirementName = useCallback(() => {
		if (
			props.OrderDetail &&
			props.OrderDetail?.fulfillments &&
			props.OrderDetail?.fulfillments.length > 0
		) {
			let requirement =
				props.OrderDetail?.fulfillments[0].shipment?.requirements?.toString();
			const reqObj = shipping_requirements?.find((r) => r.value === requirement);
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
					: 0) -
				props.totalPaid!
			);
		} else if (props.OrderDetail?.total_line_amount_after_line_discount) {
			return (
				(props.OrderDetail?.total_line_amount_after_line_discount
					? props.OrderDetail?.total_line_amount_after_line_discount
					: 0) +
				props.shippingFeeInformedCustomer -
				props.totalPaid!
			);
		}
	};
	let takeHelperValue: any = takeHelper();
	// const showTakeHelper = () => {
	//   if (props.OrderDetail?.total_line_amount_after_line_discount) {
	//     return (
	//       props.OrderDetail?.total_line_amount_after_line_discount -
	//         props.totalPaid! +
	//         props.shippingFeeInformedCustomer -
	//         (props.OrderDetail?.discounts &&
	//         props.OrderDetail?.discounts.length > 0 &&
	//         props.OrderDetail?.discounts[0].amount
	//           ? props.OrderDetail?.discounts[0].amount
	//           : 0) !==
	//       0
	//     );
	//   } else if (paymentType === 1 && takeHelperValue !== 0) {
	//     return true;
	//   } else if (props.shippingFeeInformedCustomer) {
	//     takeHelperValue = props.shippingFeeInformedCustomer;
	//     return true;
	//   } else if (takeHelperValue === 0) {
	//     return false;
	//   } else if (paymentType === 1) {
	//     return true;
	//   }
	// };

	// const isShowTakeHelper = showTakeHelper();
	// khách cần trả
	const totalAmountCustomerNeedToPay =
		(props.OrderDetail?.total
			? props.OrderDetail?.total
			: 0) +
		(props.shippingFeeInformedCustomer ? props.shippingFeeInformedCustomer : 0) -
		(props.totalPaid ? props.totalPaid : 0);
	// totalAmountPaid() -
	// (totalAmountReturnProducts ? totalAmountReturnProducts : 0))

	// Cancel fulfillments
	const [isvibleCancelFullfilment, setIsvibleCancelFullfilment] =
		useState<boolean>(false);
	const [isShipping, setIsShipping] = useState<boolean>(false);
	const [isvibleGoodsReturn, setIsvibleGoodsReturn] = useState<boolean>(false);
	const [fullfilmentIdGoodReturn, setFullfilmentIdGoodReturn] = useState<number | null>(
		null
	);

	const cancelFullfilment = useCallback(() => {
		if (
			props.OrderDetail?.fulfillments &&
			props.OrderDetail?.fulfillments.length > 0 &&
			props.OrderDetail?.fulfillments[0].status !== FulFillmentStatus.SHIPPING
		) {
			setIsShipping(false);
			setIsvibleCancelFullfilment(true);
		} else {
			setIsShipping(true);
			setIsvibleCancelFullfilment(true);
		}
	}, [props.OrderDetail]);

	const onOKCancelFullfilment = (reasonID: string, reasonSubID: string, reason: string) => {
		fulfillmentTypeOrderRequest(5, { reasonID, reasonSubID, reason });
		setIsvibleCancelFullfilment(false);
	};
	// cancel fulfillment 3 button modal
	const onOkCancelAndGetGoodsBack = (reasonID: string, reasonSubID: string, reason: string) => {
		fulfillmentTypeOrderRequest(7, { reasonID, reasonSubID, reason });
		setIsvibleCancelFullfilment(false);
	};
	// return goods
	const onOKGoodsReturn = () => {
		setIsvibleGoodsReturn(false);
		let value: UpdateFulFillmentStatusRequest = {
			order_id: null,
			fulfillment_id: null,
			status: "",
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
	const [addressError, setAddressError] = useState<string>("");
	console.log(addressError)
	// end

	const onPrint = () => {
		onOkShippingConfirm();
		setReload(true);
	};

	const renderPushingStatusWhenDeliverPartnerFailed = () => {
		if (!OrderDetail || !OrderDetail.fulfillments) {
			return;
		}
		if (OrderDetail.fulfillments[0]?.shipment?.delivery_service_provider_type === ShipmentMethod.EXTERNAL_SERVICE) {
			let failedFulfillment = OrderDetail.fulfillments.find((singleFulfillment) => {
				return singleFulfillment.shipment?.pushing_status === "failed"
			})
			if (failedFulfillment && failedFulfillment?.shipment?.pushing_note) {
				return (
					<Col md={12}>
						<Row gutter={30}>
							<Col span={10}>
								<p className="text-field">Trạng thái:</p>
							</Col>
							<Col span={14}>
								<b className="text-field" style={{ color: dangerColor }}>
									{failedFulfillment?.shipment.pushing_note}
								</b>
							</Col>
						</Row>
					</Col>
				)
			}
		}
	};
	useEffect(() => {
		if (!props.storeDetail) {
			setAddressError("Thiếu thông tin địa chỉ cửa hàng");
		}
		if (
			props.customerDetail &&
			props.storeDetail &&
			(getShippingAddressDefault(props.customerDetail)?.city_id ||
				getShippingAddressDefault(props.customerDetail)?.district_id) &&
			getShippingAddressDefault(props.customerDetail)?.ward_id &&
			getShippingAddressDefault(props.customerDetail)?.full_address
		) {
			let request = {
				from_city_id: props.storeDetail?.city_id,
				from_city: props.storeDetail?.city_name,
				from_district_id: props.storeDetail?.district_id,
				from_district: props.storeDetail?.district_name,
				from_ward_id: props.storeDetail?.ward_id,
				to_country_id: getShippingAddressDefault(props.customerDetail)?.country_id,
				to_city_id: getShippingAddressDefault(props.customerDetail)?.city_id,
				to_city: getShippingAddressDefault(props.customerDetail)?.city,
				to_district_id: getShippingAddressDefault(props.customerDetail)?.district_id,
				to_district: getShippingAddressDefault(props.customerDetail)?.district,
				to_ward_id: getShippingAddressDefault(props.customerDetail)?.ward_id,
				from_address: props.storeDetail?.address,
				to_address: getShippingAddressDefault(props.customerDetail)?.full_address,
				price: OrderDetail?.total_line_amount_after_line_discount,
				quantity: 1,
				weight: SumWeight(OrderDetail?.items),
				length: 0,
				height: 0,
				width: 0,
				service_id: 0,
				service: "",
				option: "",
				insurance: 0,
				coupon: "",
				cod: 0,
			};
			console.log("request", request);
			setAddressError("");
		} else {
			setAddressError("Thiếu thông tin địa chỉ chi tiết khách hàng");
		}
	}, [
		props.customerDetail,
		dispatch,
		props.storeDetail,
		OrderDetail?.total_line_amount_after_line_discount,
		OrderDetail?.items,
	]);

	useEffect(() => {
		getRequirementName();
		dispatch(
			DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
				setDeliveryServices(response);
			})
		);
	}, [dispatch, getRequirementName]);

	useEffect(() => {
		if (updateShipment || cancelShipment) {
			// console.log('updateShipment cancelShipment ok ok');
			// disabled orther actions
			disabledActions && disabledActions("shipment");
		} else {
			// console.log('updateShipment cancelShipment');
			disabledActions && disabledActions("none");
		}
	}, [updateShipment, cancelShipment, disabledActions]);

	// todo thai: update khi có logo các đối tác giao hàng
	const renderDeliveryPartner = (shipment: ShipmentResponse) => {
		const delivery = deliveryServices?.find(delivery => delivery.code === shipment.delivery_service_provider_code);
		if (delivery && delivery.logo) {
			return (
				<img
					style={{ width: "112px", height: 25 }}
					src={delivery?.logo}
					alt=""
				/>
			)
		} else {
			return (
				<span>{shipment.delivery_service_provider_name}</span>
			)
		}
	}

	const isFulfillmentCancelled = (fulfillment: FulFillmentResponse) => {
		if (fulfillment.status === FulFillmentStatus.CANCELLED ||
			fulfillment.status === FulFillmentStatus.RETURNING ||
			fulfillment.status === FulFillmentStatus.RETURNED) {
			return true
		}
		return false
	};

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
							props.OrderDetail?.fulfillments[0].status === FulFillmentStatus.SHIPPED && (
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
							// props.OrderDetail?.fulfillments[0].shipment?.expected_received_date && 
							(
								<div className="text-menu">
									{props.OrderDetail?.fulfillments[0].shipment?.expected_received_date && (
										<React.Fragment>
											<img src={calendarOutlined} style={{ marginRight: 9.5 }} alt=""></img>
											<span style={{ color: "#222222", lineHeight: "16px" }}>
												{props.OrderDetail?.fulfillments &&
													props.OrderDetail?.fulfillments.length > 0 &&
													props.OrderDetail?.fulfillments[0].shipment?.expected_received_date
													? moment(
														props.OrderDetail?.fulfillments[0].shipment
															?.expected_received_date
													).format("DD/MM/YYYY")
													: ""}
											</span>
										</React.Fragment>
									)}
									{props.OrderDetail?.fulfillments &&
										props.OrderDetail?.fulfillments.length > 0 &&
										props.OrderDetail?.fulfillments[0].shipment?.office_time && (
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
						{/* {requirementNameView && (
              <div className="text-menu">
                <img src={eyeOutline} alt="eye"></img>
                <span style={{marginLeft: "5px", fontWeight: 500}}>
                  {requirementNameView}
                </span>
              </div>
            )} */}
						{/* {newFulfillments[0].shipment?.office_time ? "Giờ hành chính" : ""} */}
					</Space>
				}
			>
				{newFulfillments.map(
					(fulfillment) =>
						fulfillment.shipment && (
							<div
								key={fulfillment.id}
								style={{ paddingTop: 0, paddingBottom: 20, marginTop: -12 }}
							>
								<Collapse
									className="saleorder_shipment_order_colapse payment_success"
									defaultActiveKey={[
										isFulfillmentCancelled(fulfillment) ? "0" : "1",
									]}
									// onChange={(e) => console.log(e[0])}
									expandIcon={({ isActive }) => (
										<div className="saleorder-header-arrow 2" style={{ justifyContent: "flex-start" }}>
											<img
												alt=""
												src={doubleArrow}
												style={{
													transform: `${!isActive ? "rotate(270deg)" : "rotate(0deg)"}`,
												}}
											/>
										</div>
									)}
									ghost
								>
									<Panel
										className={
											isFulfillmentCancelled(fulfillment)
												? "orders-timeline-custom order-shipment-dot-cancelled"
												: fulfillment.status === FulFillmentStatus.SHIPPED
													? "orders-timeline-custom order-shipment-dot-active"
													: "orders-timeline-custom order-shipment-dot-default"
										}
										showArrow={true}
										header={
											<div className="saleorder-header-content" style={{ display: "flex", width: "100%", padding: 0 }}>
												<div className="saleorder-header-content__info" style={{ display: "flex", width: "100%" }}>
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
															onClick={(e) => copyOrderID(e, fulfillment.code)}
															src={copyFileBtn}
															alt=""
															style={{ width: 23 }}
														/>
													</div>
													<FulfillmentStatusTag fulfillment={fulfillment} />
													{!(fulfillment.status === FulFillmentStatus.CANCELLED ||
														fulfillment.status === FulFillmentStatus.RETURNING ||
														fulfillment.status === FulFillmentStatus.RETURNED ||
														fulfillment.status === FulFillmentStatus.SHIPPING ||
														fulfillment.status === FulFillmentStatus.SHIPPED ||
														(sortedFulfillments && sortedFulfillments[0]?.shipment?.delivery_service_provider_type === ShipmentMethod.PICK_AT_STORE)) &&
														<PrintShippingLabel
															fulfillment={fulfillment}
															orderSettings={orderSettings}
															orderId={OrderDetail?.id}
															onPrint={onPrint}
														/>}
												</div>
												<div className="saleorder-header-content__date" style={{display: "none", width: "100%", alignItems: "center"}}>
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
                                ).format("DD/MM/YYYY HH:mm") : ''}
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
										{fulfillment.shipment?.delivery_service_provider_type ===
											ShipmentMethod.PICK_AT_STORE ? (
											<div>
												<Row gutter={24}>
													<Col md={12}>
														<b>
															<img style={{ marginRight: 12 }} src={storeBluecon} alt="" />
															NHẬN TẠI CỬA HÀNG
														</b>
													</Col>
												</Row>
												<Row gutter={24} style={{ paddingTop: "15px" }}>
													<Col md={12}>
														<Row gutter={30}>
															<Col span={10}>
																<p className="text-field">Tên cửa hàng:</p>
															</Col>
															<Col span={14}>
																<b>{props.OrderDetail?.store}</b>
															</Col>
														</Row>
													</Col>

													<Col md={12}>
														<Row gutter={30}>
															<Col span={10}>
																<p className="text-field">Số điện thoại:</p>
															</Col>
															<Col span={14}>
																<b className="text-field">
																	{props.OrderDetail?.store_phone_number}
																</b>
															</Col>
														</Row>
													</Col>

													<Col md={12}>
														<Row gutter={30}>
															<Col span={10}>
																<p className="text-field">Địa chỉ:</p>
															</Col>
															<Col span={14}>
																<b className="text-field">
																	{props.OrderDetail?.store_full_address}
																</b>
															</Col>
														</Row>
													</Col>
												</Row>
											</div>
										) : (
											<Row gutter={24}>
												<Col md={12}>
													<Row gutter={30}>
														<Col span={10}>
															<p className="text-field">Đối tác giao hàng:</p>
														</Col>
														<Col span={14}>
															<b>
																{/* Lấy ra đối tác */}
																{(fulfillment.shipment?.delivery_service_provider_type === ShipmentMethod.EXTERNAL_SERVICE
																	|| fulfillment.shipment?.delivery_service_provider_type === "shopee") && (
																		renderDeliveryPartner(fulfillment.shipment)
																		// <img
																		//   style={{ width: "112px", height: 25 }}
																		//   src={InfoServiceDeliveryDetail(
																		//     delivery_service,
																		//     fulfillment.shipment.delivery_service_provider_id
																		//   )}
																		//   alt=""
																		// ></img>
																	)}

																{(fulfillment.shipment?.delivery_service_provider_type === ShipmentMethod.EMPLOYEE ||
																	fulfillment.shipment?.delivery_service_provider_type === ShipmentMethod.EXTERNAL_SHIPPER) &&
																	fulfillment.shipment?.info_shipper}
															</b>
														</Col>
													</Row>
												</Col>

												{CheckShipmentType(props.OrderDetail!) === ShipmentMethod.EXTERNAL_SERVICE && (
													<Col md={12}>
														<Row gutter={30}>
															<Col span={10}>
																<p className="text-field">Dịch vụ:</p>
															</Col>
															<Col span={14}>
																<b className="text-field">
																	{/* {getServiceName(props.OrderDetail!)} */}
																	{fulfillment.shipment?.delivery_transport_type}
																</b>
															</Col>
														</Row>
													</Col>
												)}

												<Col md={12}>
													<Row gutter={30}>
														<Col span={10}>
															<p className="text-field">
																{fulfillment.shipment?.delivery_service_provider_type === ShipmentMethod.EXTERNAL_SERVICE
																	? 'Phí ship trả HVC:' : 'Phí ship trả đối tác:'}</p>
														</Col>
														<Col span={14}>
															<b className="text-field">
																{props.OrderDetail?.fulfillments &&
																	formatCurrency(
																		fulfillment.shipment?.shipping_fee_paid_to_three_pls
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
															<p className="text-field">Phí ship báo khách:</p>
														</Col>
														<Col span={14}>
															<b className="text-field">
																{formatCurrency(
																	fulfillment.shipment?.shipping_fee_informed_to_customer
																		? fulfillment.shipment
																			?.shipping_fee_informed_to_customer
																		: 0
																)}
															</b>
														</Col>
													</Row>
												</Col>
												<Col md={12}>
													<Row gutter={30}>
														<Col span={10}>
															<p className="text-field">Loại đơn giao hàng:</p>
														</Col>
														<Col span={14}>
															<b className="text-field" style={{ color: fulfillment.shipment?.service === '4h_delivery' ? '#E24343' : '' }}>
																{fulfillment.shipment?.service === '4h_delivery' ? 'Đơn giao 4H' : 'Đơn giao bình thường'}
															</b>
														</Col>
													</Row>
												</Col>
												{renderPushingStatusWhenDeliverPartnerFailed()}
												{CheckShipmentType(props.OrderDetail!) === ShipmentMethod.EXTERNAL_SERVICE && (
													<Col md={12}>
														<Row gutter={30}>
															<Col span={10}>
																<p className="text-field">Trọng lượng:</p>
															</Col>
															<Col span={14}>
																<b className="text-field">
																	{props.OrderDetail?.fulfillments &&
																		props.OrderDetail?.fulfillments.length > 0 &&
																		formatCurrency(
																			props.OrderDetail.items &&
																			SumWeightResponse(props.OrderDetail.items)
																		)}
																	g
																</b>
															</Col>
														</Row>
													</Col>
												)}

												<Col md={12}>
													<Row gutter={30}>
														<Col span={10}>
															<p className="text-field">{!isFulfillmentCancelled(fulfillment) ? "Ngày tạo" : "Ngày hủy"}:</p>
														</Col>
														<Col span={14}>
															<b className="text-field">
																{!isFulfillmentCancelled(fulfillment) ? ConvertUtcToLocalDate(fulfillment.shipment?.created_date, DATE_FORMAT.fullDate) : ConvertUtcToLocalDate(fulfillment?.cancel_date, DATE_FORMAT.fullDate)
																}
															</b>
														</Col>
													</Row>
												</Col>

												{requirementNameView && (	
													<Col md={12}>
														<Row gutter={30}>
															<Col span={10}>
																<p className="text-field">Yêu cầu:</p>
															</Col>
															<Col span={14}>
															<b className="text-field">
																{requirementNameView}
															</b>
															</Col>
														</Row>
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
														<div className="orders-shipment-item-view" key={index}>
															<div className="orders-shipment-item-view-wrap">
																<div className="orders-shipment-item-name">
																	<div>
																		<Link style={{ color: "#2A2A86" }}>{item.sku}</Link>
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
										{(CheckShipmentType(props.OrderDetail!) === ShipmentMethod.EXTERNAL_SERVICE ||
											CheckShipmentType(props.OrderDetail!) === "shopee") &&
											fulfillment.status !== FulFillmentStatus.CANCELLED &&
											fulfillment.status !== FulFillmentStatus.RETURNING &&
											fulfillment.status !== FulFillmentStatus.RETURNED && (
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
															<Panel
																header={
																	<Row>
																		<Col style={{ display: "flex", width: "100%", alignItems: "center" }}>
																			<span
																				style={{
																					marginRight: "10px",
																					color: "#222222",
																				}}
																			>
																				Mã vận đơn:
																			</span>
																			<Link
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
																	{trackingLogFulfillment?.map((item, index) => (
																		<Panel
																			className={`orders-timeline-custom orders-dot-status ${index === 0 ? "currentTimeline" : ""} ${item.status === "failed" ? "hasError" : ""}`}
																			header={
																				<React.Fragment>
																					<b
																						style={{
																							paddingLeft: "14px",
																							color: "#222222",
																						}}
																					>
																						{item.shipping_status ? item.shipping_status : item.partner_note}
																					</b>
																					<i
																						className="icon-dot"
																						style={{
																							fontSize: "4px",
																							margin: "10px 10px 10px 10px",
																							color: "#737373",
																							position: "relative",
																							top: -2,
																						}}
																					></i>{" "}
																					<span style={{ color: "#737373" }}>
																						{moment(item.created_date).format(
																							"DD/MM/YYYY HH:mm"
																						)}
																					</span>
																				</React.Fragment>
																			}
																			key={index}
																			showArrow={false}
																		></Panel>
																	))}
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
														{ConvertUtcToLocalDate(fulfillment?.created_date, DATE_FORMAT.fullDate)}
													</span>
												</div>
												{fulfillment.status_before_cancellation ===
													FulFillmentStatus.SHIPPING && (
														<div
															className={
																fulfillment.status === FulFillmentStatus.RETURNED
																	? "saleorder-steps-two saleorder-steps dot-active hide-steps-two-line"
																	: "saleorder-steps-two saleorder-steps dot-active"
															}
														>
															<span>Ngày hủy</span>
															<span>
																{ConvertUtcToLocalDate(fulfillment?.cancel_date, DATE_FORMAT.fullDate)}
															</span>
														</div>
													)}
												{fulfillment.status_before_cancellation !==
													FulFillmentStatus.SHIPPING && (
														<div className="saleorder-steps-three saleorder-steps dot-active">
															<span>Ngày nhận lại</span>
															<span>
																{ConvertUtcToLocalDate(fulfillment?.cancel_date, DATE_FORMAT.fullDate)}
															</span>
														</div>
													)}
												{fulfillment.status_before_cancellation ===
													FulFillmentStatus.SHIPPING &&
													fulfillment.status === FulFillmentStatus.RETURNED && (
														<div className="saleorder-steps-three saleorder-steps dot-active">
															<span>Ngày nhận lại</span>
															<span>
																{ConvertUtcToLocalDate(fulfillment?.receive_cancellation_on, DATE_FORMAT.fullDate)}
															</span>
														</div>
													)}
											</div>
										) : null}
										{fulfillment.return_status === FulFillmentStatus.RETURNING ? (
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
					}}
				>
					{props.stepsStatusValue === FulFillmentStatus.SHIPPED ? (
						<React.Fragment>
							{!checkIfOrderHasReturnedAll(OrderDetail) ? (
								<AuthWrapper acceptPermissions={[ODERS_PERMISSIONS.CREATE_RETURN]} passThrough>
									{(isPassed: boolean) =>
										<Button
											type="primary"
											style={{ margin: "0 10px", padding: "0 25px" }}
											className="create-button-custom ant-btn-outline fixed-button"
											onClick={() => {
												history.push(
													`${UrlConfig.ORDERS_RETURN}/create?orderID=${OrderDetail?.id}`
												);
											}}
											disabled={!isPassed}
										>
											Đổi trả hàng
										</Button>}
								</AuthWrapper>

							) : (
								<Button
									type="primary"
									style={{ margin: "0 10px", padding: "0 25px" }}
									className="create-button-custom ant-btn-outline fixed-button"
									disabled
								>
									Đơn hàng đã đổi trả hàng hết!
								</Button>
							)
							}
						</React.Fragment>
					) : (
						<React.Fragment>
							{checkIfOrderHasReturnedAll(OrderDetail) ? null :
								props.OrderDetail?.fulfillments &&
									props.OrderDetail?.fulfillments.length > 0 &&
									props.OrderDetail?.fulfillments[0].shipment &&
									props.OrderDetail?.fulfillments[0].shipment
										.delivery_service_provider_type === ShipmentMethod.PICK_AT_STORE && !checkIfOrderHasReturnedAll(OrderDetail) ? (
									<Button
										onClick={cancelFullfilment}
										loading={cancelShipment}
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
											loading={cancelShipment}
											disabled={updateShipment}
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
						</React.Fragment>
					)}
					{props.stepsStatusValue === OrderStatus.FINALIZED &&
						props.OrderDetail?.fulfillments &&
						props.OrderDetail?.fulfillments.length > 0 &&
						props.OrderDetail.fulfillments[0].shipment &&
						props.OrderDetail.fulfillments[0].shipment?.delivery_service_provider_type !==
						ShipmentMethod.PICK_AT_STORE && (
							<Button
								type="primary"
								style={{ marginLeft: "10px", padding: "0 25px" }}
								className="create-button-custom ant-btn-outline fixed-button"
								id="btn-go-to-pack"
								onClick={onOkShippingConfirm}
								loading={updateShipment}
								disabled={cancelShipment || !allowCreatePicked}
							>
								Nhặt hàng
							</Button>
						)}

					{props.stepsStatusValue === OrderStatus.FINALIZED &&
						props.OrderDetail?.fulfillments &&
						props.OrderDetail?.fulfillments.length > 0 &&
						props.OrderDetail.fulfillments[0].shipment?.delivery_service_provider_type ===
						ShipmentMethod.PICK_AT_STORE && (
							<Button
								type="primary"
								style={{ marginLeft: "10px" }}
								className="create-button-custom ant-btn-outline fixed-button"
								onClick={onOkShippingConfirm}
								loading={updateShipment}
								disabled={cancelShipment || !(allowCreatePicked || allowCreatePacked)}
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
							loading={updateShipment}
							disabled={cancelShipment || !allowCreatePacked}
						>
							Đóng gói
						</Button>
					)}
					{props.stepsStatusValue === FulFillmentStatus.PACKED &&
						props.OrderDetail?.fulfillments &&
						props.OrderDetail?.fulfillments.length > 0 &&
						props.OrderDetail.fulfillments[0].shipment?.delivery_service_provider_type !==
						ShipmentMethod.PICK_AT_STORE && (
							<Button
								type="primary"
								style={{ marginLeft: "10px", padding: "0 25px" }}
								className="create-button-custom ant-btn-outline fixed-button"
								onClick={() => setIsvibleShippingConfirm(true)}
								loading={updateShipment}
								disabled={cancelShipment || !allowCreateShipping}
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
							loading={updateShipment}
							disabled={cancelShipment}
						>
							Đã giao hàng
						</Button>
					)}

					{props.stepsStatusValue === FulFillmentStatus.PACKED &&
						props.OrderDetail?.fulfillments &&
						props.OrderDetail?.fulfillments.length > 0 &&
						props.OrderDetail.fulfillments[0].shipment?.delivery_service_provider_type ===
						ShipmentMethod.PICK_AT_STORE && (
							<Button
								type="primary"
								style={{ marginLeft: "10px", padding: "0 25px" }}
								className="create-button-custom ant-btn-outline fixed-button"
								onClick={() => setIsvibleShippedConfirm(true)}
								loading={updateShipment}
								disabled={cancelShipment || !allowCreateShipping}
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
								loading={updateShipment}
								disabled={
									props.stepsStatusValue === OrderStatus.CANCELLED ||
									props.stepsStatusValue === FulFillmentStatus.SHIPPED ||
									cancelShipment ||
									disabledBottomActions
								}
							>
								Giao hàng
							</Button>
						)}
				</div>
				{isVisibleShipping === true && (
					<div>
						<Form
							initialValues={initialFormUpdateShipment}
							form={form}
							onFinishFailed={({ errorFields }: any) => {
								const element: any = document.getElementById(
									errorFields[0].name.join("")
								);
								element?.focus();
								const y =
									element?.getBoundingClientRect()?.top + window.pageYOffset + -250;
								window.scrollTo({ top: y, behavior: "smooth" });
							}}
							onFinish={onFinishUpdateFulFillment}
							layout="vertical"
						>
							<OrderCreateShipment
								shipmentMethod={shipmentMethod}
								orderPrice={OrderDetail?.total_line_amount_after_line_discount}
								storeDetail={props.storeDetail}
								customer={props.customerDetail}
								items={OrderDetail?.items}
								isCancelValidateDelivery={false}
								totalAmountCustomerNeedToPay={totalAmountCustomerNeedToPay}
								setShippingFeeInformedToCustomer={props.setShippingFeeInformedCustomer}
								onSelectShipment={setShipmentMethod}
								thirdPL={thirdPL}
								setThirdPL={setThirdPL}
								form={form}
								isShowButtonCreateShipment
								handleCreateShipment={() => form.submit()}
								creating={updateShipment}
								handleCancelCreateShipment={() => setVisibleShipping(false)}
								isEcommerceOrder={isEcommerceOrder}
								initSelfDelivery={initSelfDelivery}
							/>
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
				updateShipment={updateShipment}
				icon={WarningIcon}
				okText="Đồng ý"
				cancelText="Hủy"
				title=""
				text={`Bạn có chắc xuất kho đơn giao hàng này ${confirmExportAndFinishValue()
					? "với tiền thu hộ là " + formatCurrency(confirmExportAndFinishValue()!)
					: ""
					} không?`}
			/>
			<SaveAndConfirmOrder
				onCancel={() => setIsvibleShippedConfirm(false)}
				onOk={onOkShippingConfirm}
				visible={isvibleShippedConfirm}
				updateShipment={updateShipment}
				icon={WarningIcon}
				okText="Xác nhận thanh toán"
				cancelText="Hủy"
				title=""
				text={`Vui lòng xác nhận ${confirmExportAndFinishValue()
					? "thanh toán " + formatCurrency(confirmExportAndFinishValue()!)
					: ""
					} để giao hàng thành công?`}
			/>
			{/* Huy fulfillment pick, pack, unship */}
			<CancelFullfilmentModal
				shipping={isShipping}
				onCancel={() => setIsvibleCancelFullfilment(false)}
				onOk={onOKCancelFullfilment}
				onOkandMore={onOkCancelAndGetGoodsBack}
				visible={isvibleCancelFullfilment}
				isCanceling={cancelShipment}
				icon={DeleteIcon}
				okText="Hủy đơn giao"
				cancelText="Thoát"
				title="Bạn có chắc chắn hủy đơn giao hàng này không?"
				text="Tiền thu hộ nếu có cũng sẽ bị hủy"
				reasons={props.reasons ? props.reasons : []}
			/>

			{/* Nhận hàng trả lại */}
			<GetGoodsBack
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
