import { Card, Select } from "antd";
import {
	getListSubStatusAction,
	setSubStatusAction
} from "domain/actions/order/order.action";
import {
	FulFillmentResponse,
	OrderResponse,
	OrderSubStatusResponse
} from "model/response/order/order.response";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { scrollAndFocusToDomElement } from "utils/AppUtils";
import { OrderStatus, ShipmentMethod } from "utils/Constants";
import { showError } from "utils/ToastUtils";

type PropType = {
	subStatusCode?: string | undefined;
	status?: string | null;
	orderId?: number;
	fulfillments?: FulFillmentResponse[] | null;
	OrderDetailAllFulfillment?: OrderResponse | null;
	handleUpdateSubStatus: () => void;
	setReload: (value: boolean) => void;
};

function SubStatusOrder(props: PropType): React.ReactElement {
	const { status, orderId, fulfillments, OrderDetailAllFulfillment, subStatusCode, handleUpdateSubStatus, setReload } = props;
	console.log('OrderDetailAllFullfilment', OrderDetailAllFulfillment)

	const dispatch = useDispatch();
	const [initOrderSubStatus, setInitOrderSubStatus] = useState<OrderSubStatusResponse[]>(
		[]
	);
	const [listOrderSubStatus, setListOrderSubStatus] = useState<OrderSubStatusResponse[]>(
		[]
	);
	const [valueSubStatusCode, setValueSubStatusCode] = useState<string | undefined>(undefined);

	const handleOrderSubStatus = useCallback((sub_status_code: string) => {
		console.log('sub_status_code', sub_status_code)
		const STATUS_ORDER_PARTNER = [
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l1",
				list: ["goi_dien_l1", "goi_dien_l2", "goi_dien_l3"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l2",
				list: ["goi_dien_l2", "goi_dien_l3"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l3",
				list: ["goi_dien_l3"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "cho_van_don_xac_nhan",
				list: ["cho_van_don_xac_nhan", "van_don_da_xac_nhan", "cho_sale_xac_nhan_lai", "doi_kho_hang"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "dang_nhat_hang",
				list: ["dang_nhat_hang", "doi_kho_hang"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "cho_thu_gom",
				list: ["cho_thu_gom"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "dang_van_chuyen",
				list: ["dang_van_chuyen"]
			},
			{
				orderStatus: OrderStatus.FINISHED,
				now: "giao_hang_thanh_cong",
				list: ["giao_hang_thanh_cong"]
			},
			{
				orderStatus: OrderStatus.CANCELLED,
				now: "huy_don",
				list: ["huy_don"]
			},
		]
		const STATUS_ORDER_AT_STORE = [
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l1",
				list: ["goi_dien_l1", "goi_dien_l2", "goi_dien_l3"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l2",
				list: ["goi_dien_l2", "goi_dien_l3"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l3",
				list: ["goi_dien_l3"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "cho_van_don_xac_nhan",
				list: ["cho_van_don_xac_nhan", "van_don_da_xac_nhan", "cho_sale_xac_nhan_lai", "doi_kho_hang"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "dang_nhat_hang",
				// fulfillment: FulFillmentStatus.PICKED,
				list: ["dang_nhat_hang", "doi_kho_hang"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "da_dong_goi",
				list: ["da_dong_goi", "doi_kho_hang"]
			},
			{
				orderStatus: OrderStatus.FINISHED,
				now: "giao_hang_thanh_cong",
				list: ["giao_hang_thanh_cong"]
			},
			{
				orderStatus: OrderStatus.CANCELLED,
				now: "huy_don",
				list: ["huy_don"]
			},
		]
		const STATUS_ORDER_OTHER = [
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l1",
				list: ["goi_dien_l1", "goi_dien_l2", "goi_dien_l3"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l2",
				list: ["goi_dien_l2", "goi_dien_l3"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "goi_dien_l3",
				list: ["goi_dien_l3"]
			},
		]
		const filterStatus = (arr: any[]) => {
			let result: OrderSubStatusResponse[] = [...initOrderSubStatus];
			const foundStatus = arr.find((single) => {
				return single.now === sub_status_code && single.orderStatus === status
					&& (single.fulfillment && fulfillments ? single.fulfillment === fulfillments[0].status : true)
			})
			console.log('foundStatus', foundStatus);
			if (foundStatus) {
				let ddd = initOrderSubStatus.filter(single => foundStatus.list.includes(single.code))
				result = ddd;
			}
			return result;
		};
		if (!OrderDetailAllFulfillment?.fulfillments) {
			return;
		}
		let result = [...initOrderSubStatus];
		console.log('fulfillments', fulfillments)
		switch (OrderDetailAllFulfillment?.fulfillments[0]?.shipment?.delivery_service_provider_type) {
			// giao hàng hvc, tự giao hàng
			case ShipmentMethod.EXTERNAL_SERVICE:
			case ShipmentMethod.EMPLOYEE:
				result = filterStatus(STATUS_ORDER_PARTNER);
				break;
			// nhận tại cửa hàng
			case ShipmentMethod.PICK_AT_STORE:
				result = filterStatus(STATUS_ORDER_AT_STORE);
				break
			default:
				result = filterStatus(STATUS_ORDER_OTHER);
				break;
		}
		console.log('result', result)
		setListOrderSubStatus(result)
	}, [OrderDetailAllFulfillment?.fulfillments, fulfillments, initOrderSubStatus, status]);

	const handleChange = (sub_status_code: string) => {
		if (sub_status_code === "van_don_da_xac_nhan") {
			if (fulfillments?.length === 0) {
				showError("Chưa có hình thức vận chuyển!");
				const element = document.getElementsByClassName("orders-update-shipment")[0] as HTMLElement;
				if (element) {
					scrollAndFocusToDomElement(element)
				}
				return;
			}
		}
		if (orderId) {
			setValueSubStatusCode(sub_status_code);
			dispatch(setSubStatusAction(orderId, sub_status_code, () => {
				handleUpdateSubStatus();
				setReload(true)
			}));
		}
	};

	useEffect(() => {
		const listFulfillmentMapSubStatus = {
			packed: {
				fulfillmentStatus: "packed",
				subStatus: "packed",
			},
			finalized: {
				fulfillmentStatus: "shipping",
				subStatus: "shipping",
			},
		};
		if (status) {
			let resultStatus = status;
			if (status === OrderStatus.FINALIZED && fulfillments && fulfillments.length > 0) {
				switch (fulfillments[0].status) {
					case listFulfillmentMapSubStatus.packed.fulfillmentStatus:
						resultStatus = listFulfillmentMapSubStatus.packed.subStatus;
						break;
					case listFulfillmentMapSubStatus.finalized.fulfillmentStatus:
						resultStatus = listFulfillmentMapSubStatus.finalized.subStatus;
						break;
					default:
						break;
				}
			}
			dispatch(
				getListSubStatusAction(resultStatus, (data: OrderSubStatusResponse[]) => {
					setInitOrderSubStatus(data);
				})
			);
		}
	}, [dispatch, fulfillments, status]);

	useEffect(() => {
		if (valueSubStatusCode) {
			console.log('valueSubStatusCode', valueSubStatusCode)
			console.log('fulfillments', fulfillments)
			handleOrderSubStatus(valueSubStatusCode)
		} else {
			setListOrderSubStatus(initOrderSubStatus)
		}
	}, [handleOrderSubStatus, valueSubStatusCode, OrderDetailAllFulfillment?.fulfillments, fulfillments, initOrderSubStatus])

	useEffect(() => {
		if (subStatusCode) {
			setValueSubStatusCode(subStatusCode);
		}
	}, [subStatusCode]);

	return (
		<Card title="Xử lý đơn hàng">
			<Select
				showSearch
				style={{ width: "100%" }}
				placeholder="Chọn trạng thái phụ"
				optionFilterProp="children"
				filterOption={(input, option) =>
					option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
				}
				onChange={handleChange}
				notFoundContent="Không tìm thấy trạng thái phụ"
				value={valueSubStatusCode}
				key={Math.random()}
			>
				{listOrderSubStatus &&
					listOrderSubStatus.map((single) => {
						return (
							<Select.Option value={single.code} key={single.code}>
								{single.sub_status}
							</Select.Option>
						);
					})}
			</Select>
		</Card>
	);
}

export default SubStatusOrder;
