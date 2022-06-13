import {
	Card, Collapse,
	Form,
	Row,
	Space,
	Tag
} from "antd";
import calendarOutlined from "assets/icon/calendar_outline.svg";
import doubleArrow from "assets/icon/double_arrow.svg";
import AlertIcon from "assets/icon/ydAlertIcon.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import WarningIcon from "assets/icon/ydWarningIcon.svg";
import OrderCreateShipment from "component/order/OrderCreateShipment";
import { ODERS_PERMISSIONS } from "config/permissions/order.permission";
import UrlConfig from "config/url.config";
// import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
	DeliveryServicesGetList,
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
	DeliveryServiceResponse, OrderResponse,

	OrderReturnReasonDetailModel
} from "model/response/order/order.response";
import { OrderConfigResponseModel, ShippingServiceConfigDetailResponseModel } from "model/response/settings/order-settings.response";
import moment from "moment";
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { getTrackingLogFulFillment } from "service/order/order.service";
import {
	checkPaymentStatusToShow, formatCurrency,
	getAmountPayment, isOrderFromPOS, scrollAndFocusToDomElement, sortFulfillments
} from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus, ShipmentMethod, ShipmentMethodOption } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";
import { checkIfFulfillmentCancelled } from "utils/OrderUtils";
// import { ORDER_SUB_STATUS } from "utils/Order.constants";
import { showError, showSuccess } from "utils/ToastUtils";
import CancelFulfillmentModal from "../modal/cancel-fullfilment.modal";
import GetGoodsBack from "../modal/get-goods-back.modal";
import SaveAndConfirmOrder from "../modal/save-confirm.modal";
import OrderFulfillmentActionButton from "./OrderPackingAndShippingDetail/OrderFulfillmentActionButton";
import OrderFulfillmentCancelledShowDate from "./OrderPackingAndShippingDetail/OrderFulfillmentCancelledShowDate";
import OrderFulfillmentDetail from "./OrderPackingAndShippingDetail/OrderFulfillmentDetail";
import OrderFulfillmentHeader from "./OrderPackingAndShippingDetail/OrderFulfillmentHeader";
import OrderFulfillmentReceiveGoods from "./OrderPackingAndShippingDetail/OrderFulfillmentReceiveGoods";
import OrderFulfillmentShowFulfillment from "./OrderPackingAndShippingDetail/OrderFulfillmentShowFulfillment";
import OrderFulfillmentShowProduct from "./OrderPackingAndShippingDetail/OrderFulfillmentShowProduct";

const { Panel } = Collapse;
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
	shippingServiceConfig: ShippingServiceConfigDetailResponseModel[];
	OrderDetail: OrderResponse | null;
	storeDetail?: StoreResponse;
	orderConfig: OrderConfigResponseModel | null;
	stepsStatusValue?: string;
	totalPaid?: number;
	customerNeedToPayValue? : number;
	officeTime: boolean | undefined;
	shipmentMethod: number;
	isVisibleShipping: boolean | null;
	customerDetail: CustomerResponse | null;
	OrderDetailAllFullfilment: OrderResponse | null;
	orderSettings?: OrderSettingsModel;
	disabledBottomActions?: boolean;
	reasons?: {
		title: string;
		value: string;
	}[];
	subReasons?: OrderReturnReasonDetailModel[] | null;
	isEcommerceOrder?: boolean;
	ref: React.MutableRefObject<any>;
};

const UpdateShipmentCard = forwardRef((props: UpdateShipmentCardProps, ref) => {
	// props destructuring
	const {
		isVisibleShipping,
		shipmentMethod,
		shippingServiceConfig,
		setVisibleShipping,
		setShipmentMethod,
		onReload,
		disabledActions,
		OrderDetail,
		OrderDetailAllFullfilment,
		orderSettings,
		disabledBottomActions,
		isEcommerceOrder,
		orderConfig,
		totalPaid = 0,
		customerNeedToPayValue = 0,
	} = props;

	const dateFormat = DATE_FORMAT.DDMMYYY
	const history = useHistory();
	// node dom
	const [form] = Form.useForm();
	// action
	const dispatch = useDispatch();

	//handle create a new fulfillment for ecommerce order
	const [ecommerceShipment, setEcommerceShipment] = useState<any>();

	useEffect(() => {
		// set ecommerce shipment
		const fulfillmentsHasShipment = OrderDetailAllFullfilment?.fulfillments?.filter((item: any) => !!item.shipment);
		const fulfillment = (fulfillmentsHasShipment && fulfillmentsHasShipment.length > 0) ? fulfillmentsHasShipment[0] : null;

    if (isEcommerceOrder && fulfillment && fulfillment.shipment) {
      const shipment = fulfillment.shipment;
      let newEcommerceShipment = {
        cod: shipment.cod,
        shipping_fee_paid_to_three_pls: shipment.shipping_fee_paid_to_three_pls,
        delivery_service_provider_code: shipment.delivery_service_provider_code,
        delivery_service_provider_id: shipment.delivery_service_provider_id,
        delivery_service_provider_name: shipment.delivery_service_provider_name,
        delivery_service_provider_type: shipment.delivery_service_provider_type,
        delivery_transport_type: shipment.delivery_transport_type,
        office_time: shipment.office_time,
        requirements: shipment.requirements,
        requirements_name: shipment.requirements_name,
        sender_address: shipment.sender_address,
        sender_address_id: shipment.sender_address_id,
        service: shipment.service,
        tracking_code: shipment.tracking_code,
				recipient_sort_code: shipment.recipient_sort_code,
      }

			setEcommerceShipment(newEcommerceShipment);
		}
	}, [isEcommerceOrder, OrderDetailAllFullfilment?.fulfillments]);

	const [newFulfillments, setNewFulfillments] = useState<any[]>([]);

	// state
	// const [shippingFeeInformedCustomer, setShippingFeeInformedCustomer] =
	//   useState<number>(0);
	const [isvibleShippedConfirm, setIsvibleShippedConfirm] = useState<boolean>(false);
	const [requirementNameView, setRequirementNameView] = useState<string | null>(null);
	const [updateShipment, setUpdateShipment] = useState(false);
	const [cancelShipment, setCancelShipment] = useState(false);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [takeMoneyHelper] = useState<number | null>(null);

	// const [trackingLogFulfillment, setTrackingLogFulfillment] =
	// 	useState<Array<TrackingLogFulfillmentResponse> | null>(null);
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

	const sortedFulfillments = sortFulfillments(OrderDetail?.fulfillments);
	useEffect(() => {
		if (OrderDetailAllFullfilment && OrderDetailAllFullfilment.fulfillments && OrderDetailAllFullfilment.fulfillments.length > 0) {
			let ffms = OrderDetailAllFullfilment?.fulfillments
			? [...OrderDetailAllFullfilment.fulfillments.reverse()]
			: [];
			(async () => {
				let tracking_logs: any = [];
				// get all tracking log
				await Promise.all(
					ffms.map(async (ffm) => {
						if (ffm.code) {
							try {
								const result = await getTrackingLogFulFillment(ffm.code)

								tracking_logs.push({
									code: ffm.code,
									tracking_log: result.data.reverse()
								})
							} catch { }
						}
					})
				);
				// map tracking log 
				const newffms = ffms.map((ffm) => {
					let log = tracking_logs.find((i:any) => ffm.code === i.code);
					return {
						...ffm,
						tracking_log: log ? log.tracking_log : []
					}
				});
				setNewFulfillments(newffms);
			})();
		}
	}, [OrderDetailAllFullfilment]);

	// const totalPaid = OrderDetail?.payments ? getAmountPayment(OrderDetail.payments) : 0;

	//#region Update Fulfillment Status
	// let timeout = 500;
	const onUpdateSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		showSuccess("Tạo đơn giao hàng thành công");
		onReload && onReload();
	};
	const onPickSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		showSuccess("Nhặt hàng thành công");
		onReload && onReload();
	};

	const onPackSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		showSuccess("Đóng gói thành công");
		onReload && onReload();
	};

	const onShippingSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		showSuccess("Xuất kho thành công");
		setIsvibleShippingConfirm(false);
		// onReload && onReload();
		window.location.reload();
	};

	const onShipedSuccess = (value: OrderResponse) => {
		setUpdateShipment(false);
		showSuccess("Hoàn tất đơn hàng");
		setIsvibleShippedConfirm(false);
		onReload && onReload();
	};

	const onCancelSuccess = (value: OrderResponse, isGoToUpdate = false) => {
		setCancelShipment(false);
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
		if (isGoToUpdate) {
			history.push(
				`${UrlConfig.ORDER}/${OrderDetail?.id}/update`
			);
		} else {
			onReload && onReload();
		}
	};
	const onError = (error: boolean) => {
		setUpdateShipment(false);
		setCancelShipment(false);
		setIsvibleShippingConfirm(false);
		setIsvibleCancelFullfilment(false);
		setIsvibleGoodsReturn(false);
		setIsvibleShippedConfirm(false);
	};
	const onReturnSuccess = (value: OrderResponse) => {
		setCancelShipment(false);
		showSuccess(
			`Bạn đã nhận hàng trả lại của đơn giao hàng ${fullfilmentIdGoodReturn}`
		);
		setIsvibleGoodsReturn(false);
		onReload && onReload();
	};

	//fulfillmentTypeOrderRequest

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const fulfillmentTypeOrderRequest = (type: number, dataCancelFFM: any = {}, isGoToUpdate = false) => {
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
					value.status = FulFillmentStatus.CANCELLED;
					value.action = FulFillmentStatus.CANCELLED;
					value.cancel_reason_id = dataCancelFFM.reasonID
					value.sub_cancel_reason_id = dataCancelFFM.reasonSubID
					value.reason = dataCancelFFM.reason;
					if (value.cancel_reason_id === "1") {
						value.reason = "";
						value.other_reason = dataCancelFFM.reason
					}
					setCancelShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, (data) => {
						onCancelSuccess(data, isGoToUpdate);
					}, onError));
					break;
				case 6:
					value.status = FulFillmentStatus.RETURNING;
					value.action = FulFillmentStatus.RETURNING;
					setUpdateShipment(true);
					dispatch(UpdateFulFillmentStatusAction(value, onCancelSuccess, onError));
					break;
				case 7:
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
	//#region shiment
	let initialFormUpdateShipment: UpdateShipmentRequest = {
		order_id: null,
		code: "",
		delivery_service_provider_id: null, //id người shipper
		delivery_service_provider_type: "", //shipper
		delivery_service_provider_code: "",
		delivery_service_provider_name: "",
		delivery_transport_type: "",
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

		FulFillmentRequest.shipment = (isEcommerceOrder && ecommerceShipment) ? ecommerceShipment : value;

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
			const element = document.getElementsByClassName("orders-shipment")[0] as HTMLElement;
			scrollAndFocusToDomElement(element)
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
			if(sortedFulfillments[0]) {
				
			}
			let requirement =
				props.OrderDetail?.fulfillments[0].shipment?.requirements?.toString();
			const reqObj = shipping_requirements?.find((r) => r.value === requirement);
			setRequirementNameView(reqObj ? reqObj?.name : "");
		}
	}, [props.OrderDetail, shipping_requirements, sortedFulfillments]);

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

	const onOKCancelFullfilment = useCallback((reasonID: string, reasonSubID: string, reason: string, isGotoUpdate: boolean = false) => {
		fulfillmentTypeOrderRequest(5, { reasonID, reasonSubID, reason }, isGotoUpdate);
		setIsvibleCancelFullfilment(false);

	}, [fulfillmentTypeOrderRequest])

	// cancel fulfillment 3 button modal
	const onOkCancelAndGetGoodsBack = useCallback((reasonID: string, reasonSubID: string, reason: string) => {
		fulfillmentTypeOrderRequest(7, { reasonID, reasonSubID, reason });
		setIsvibleCancelFullfilment(false);

	}, [fulfillmentTypeOrderRequest]);

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
	// end

	const onPrint = () => {
		if (
			props.OrderDetail?.fulfillments &&
			props.OrderDetail?.fulfillments.length > 0 &&
			props.OrderDetail?.fulfillments[0].shipment &&
			props.OrderDetail?.fulfillments[0].status === FulFillmentStatus.UNSHIPPED &&
			props.OrderDetail?.fulfillments[0].shipment?.delivery_service_provider_type !==
			ShipmentMethod.PICK_AT_STORE
		) {
			fulfillmentTypeOrderRequest(1);
		}
	};

	useImperativeHandle(ref, () => ({
		handleCancelFulfillmentAndUpdate() {
			const otherReasonId = "1";
			onOKCancelFullfilment(otherReasonId, "", "Hủy đơn giao và sửa đơn hàng", true)
		}
	}), [onOKCancelFullfilment]);

	useEffect(() => {
		getRequirementName();
	}, [getRequirementName]);

	useEffect(() => {
		dispatch(
			DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
				setDeliveryServices(response);
			})
		);
	}, [dispatch]);

	useEffect(() => {
		if (updateShipment || cancelShipment) {
			// disabled orther actions
			disabledActions && disabledActions("shipment");
		} else {
			disabledActions && disabledActions("none");
		}
	}, [updateShipment, cancelShipment, disabledActions]);

	return (
		<div>
			<Card
				className="margin-top-20 orders-update-shipment "
				title={
					<Space>
						<div className="d-flex">
							<span className="title-card">ĐÓNG GÓI VÀ GIAO HÀNG</span>
						</div>
						{OrderDetailAllFullfilment?.fulfillment_status === FulFillmentStatus.SHIPPED && (
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
									{sortedFulfillments[0]?.shipment?.expected_received_date && (
										<React.Fragment>
											<img src={calendarOutlined} style={{ marginRight: 9.5 }} alt=""></img>
											<span style={{ color: "#222222", lineHeight: "16px" }}>
												{sortedFulfillments[0]?.shipment?.expected_received_date
													? moment(sortedFulfillments[0]?.shipment?.expected_received_date).format(dateFormat)
													: ""}
											</span>
										</React.Fragment>
									)}
									{sortedFulfillments[0]?.shipment?.office_time && (
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
					</Space>
				}
			>
				{/* xét trường hợp nữa đơn hàng từ POS */}
				{newFulfillments.map(
					(fulfillment) =>
						(fulfillment.shipment || isOrderFromPOS(OrderDetailAllFullfilment)) && (
							<React.Fragment>
								<div
									key={fulfillment.id}
									style={{ paddingTop: 0, paddingBottom: 20, marginTop: -12 }}
								>
									<Collapse
										className="saleorder_shipment_order_colapse payment_success"
										defaultActiveKey={[
											checkIfFulfillmentCancelled(fulfillment) ? "0" : "1",
										]}
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
												checkIfFulfillmentCancelled(fulfillment)
													? "orders-timeline-custom order-shipment-dot-cancelled"
													: fulfillment.status === FulFillmentStatus.SHIPPED
														? "orders-timeline-custom order-shipment-dot-active"
														: "orders-timeline-custom order-shipment-dot-default"
											}
											showArrow={true}
											header={
												<OrderFulfillmentHeader 
													fulfillment={fulfillment}
													onPrint={onPrint}
													orderSettings={orderSettings}
													orderDetail={OrderDetail}
												/>
											}
											key="1"
										>
											<OrderFulfillmentDetail 
												deliveryServices={deliveryServices}
												fulfillment={fulfillment}
												requirementNameView={requirementNameView}
												orderDetail={OrderDetail}
												isUpdateOrder={false}
											/>
											<OrderFulfillmentShowProduct orderDetail={OrderDetail} />
											<OrderFulfillmentShowFulfillment 
												fulfillment={fulfillment}
											/>
											<OrderFulfillmentCancelledShowDate fulfillment={fulfillment} />
											<OrderFulfillmentReceiveGoods 
												fulfillment={fulfillment}
												goodsReturnCallback={goodsReturnCallback}
											/>
										</Panel>
									</Collapse>
								</div>
							</React.Fragment>
							
						)
				)}
				<OrderFulfillmentActionButton 
					OrderDetailAllFulfillment={OrderDetailAllFullfilment}
					ShowShipping={ShowShipping}
					allowCreatePacked={allowCreatePacked}
					allowCreatePicked={allowCreatePicked}
					allowCreateShipping={allowCreateShipping}
					cancelFulfillment={cancelFullfilment}
					cancelShipment={cancelShipment}
					disabledBottomActions={disabledBottomActions}
					isVisibleShipping={isVisibleShipping}
					onOkShippingConfirm={onOkShippingConfirm}
					setIsvibleShippedConfirm={setIsvibleShippedConfirm}
					setIsvibleShippingConfirm={setIsvibleShippingConfirm}
					stepsStatusValue={props.stepsStatusValue}
					updateShipment={updateShipment}

				/>
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
								totalAmountCustomerNeedToPay={customerNeedToPayValue}
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
								ecommerceShipment={ecommerceShipment}
								OrderDetail={OrderDetail}
								shippingServiceConfig={shippingServiceConfig}
								orderConfig={orderConfig}
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
				text={`Bạn có chắc xuất kho đơn giao hàng này với tiền thu hộ là ${formatCurrency(customerNeedToPayValue - totalPaid)} không?`}
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
				text={`Vui lòng xác nhận thanh toán ${formatCurrency(customerNeedToPayValue)} để giao hàng thành công?`}
			/>
			{/* Huy fulfillment pick, pack, unship */}
			<CancelFulfillmentModal
				shipping={isShipping}
				onCancel={() => setIsvibleCancelFullfilment(false)}
				onOk={onOKCancelFullfilment}
				onOkAndMore={onOkCancelAndGetGoodsBack}
				visible={isvibleCancelFullfilment}
				isCanceling={cancelShipment}
				icon={DeleteIcon}
				okText="Hủy đơn giao"
				cancelText="Thoát"
				title="Bạn có chắc chắn hủy đơn giao hàng này không?"
				text="Tiền thu hộ nếu có cũng sẽ bị hủy"
				reasons={props.reasons}
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
});

export default UpdateShipmentCard;
