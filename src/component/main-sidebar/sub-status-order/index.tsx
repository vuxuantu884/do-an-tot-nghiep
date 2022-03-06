import { Card, Select } from "antd";
import {
  getListSubStatusAction,
  setSubStatusAction,
} from "domain/actions/order/order.action";
import {
  FulFillmentResponse,
  OrderResponse,
  OrderSubStatusResponse,
} from "model/response/order/order.response";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { sortFulfillments } from "utils/AppUtils";
import { OrderStatus, ShipmentMethod } from "utils/Constants";

type PropType = {
  subStatusCode?: string | undefined;
  status?: string | null;
  orderId?: number;
  fulfillments?: FulFillmentResponse[] | null;
  handleUpdateSubStatus: () => void;
	setReload: (value: boolean) => void;
  OrderDetailAllFulfillment?: OrderResponse | null;
};

function SubStatusOrder(props: PropType): React.ReactElement {
  const { status, orderId, fulfillments, subStatusCode, handleUpdateSubStatus, setReload, OrderDetailAllFulfillment } = props;
  const dispatch = useDispatch();
  const [initOrderSubStatus, setInitOrderSubStatus] = useState<OrderSubStatusResponse[]>(
		[]
	);
  const [listOrderSubStatus, setListOrderSubStatus] = useState<OrderSubStatusResponse[]>(
    []
  );
  const [valueSubStatusCode, setValueSubStatusCode] = useState<string | undefined>(undefined);

	const sortedFulfillments = useMemo(() => {
		if(!OrderDetailAllFulfillment?.fulfillments) {
			return  []
		}
		return sortFulfillments(OrderDetailAllFulfillment?.fulfillments)
	}, [OrderDetailAllFulfillment])

  const handleOrderSubStatus = useCallback((sub_status_code: string) => {
		// giao hàng hvc, tự giao hàng
		const STATUS_ORDER_PARTNER = [
			// tạo nháp
			{
				orderStatus: OrderStatus.DRAFT,
				now: "first_call_attempt",
				list: ["first_call_attempt", "second_call_attempt", "third_call_attempt"]
			},
			// gọi điện lần 2
			{
				orderStatus: OrderStatus.DRAFT,
				now: "second_call_attempt",
				list: ["second_call_attempt", "third_call_attempt"]
			},
			// gọi điện lần 3 
			{
				orderStatus: OrderStatus.DRAFT,
				now: "third_call_attempt",
				list: ["third_call_attempt"]
			},
			// duyệt đơn hàng	
      {
				orderStatus: OrderStatus.FINALIZED,
				now: "awaiting_coordinator_confirmation",
				list: ["awaiting_coordinator_confirmation", "awaiting_saler_confirmation","coordinator_confirmed", "4h_delivery"]
			},
			// chờ sale xác nhận lại	
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "awaiting_saler_confirmation",
				list: ["awaiting_saler_confirmation", "awaiting_coordinator_confirmation"]
			},
			// đã xác nhận
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "coordinator_confirmed",
				list: ["coordinator_confirmed", "merchandise_picking","require_warehouse_change"]
			},
			// giao 4h
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "4h_delivery",
				list: ["4h_delivery", "merchandise_picking","require_warehouse_change"]
			},
			//đổi kho hàng
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "require_warehouse_change",
				list: ["require_warehouse_change", "coordinator_confirmed","awaiting_saler_confirmation"]
			},
			// đang nhặt hàng
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "merchandise_picking",
				list: ["merchandise_picking", "require_warehouse_change"]
			},
			// đã đóng gói
      {
				orderStatus: OrderStatus.FINALIZED,
				now: "merchandise_packed",
				list: ["merchandise_packed", "awaiting_shipper"]
			},
			// chờ thu gom
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "awaiting_shipper",
				list: ["awaiting_shipper"]
			},
			// đang chuyển
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "shipping",
				list: ["shipping"]
			},
			// hvc cập nhật thành công
			{
				orderStatus: OrderStatus.FINISHED,
				now: "shipped",
				list: ["shipped"]
			},
			// hủy đơn
			{
				orderStatus: OrderStatus.CANCELLED,
				now: "cancelled",
				list: ["cancelled"]
			},
			// đang hoàn
			{
				orderStatus: OrderStatus.FINISHED,
				now: "returning",
				list: ["returning", "returned"]
			},
			// đã hoàn
			{
				orderStatus: OrderStatus.FINISHED,
				now: "returned",
				list: ["returned"]
			},
		]
		const STATUS_ORDER_AT_STORE = [
			{
				orderStatus: OrderStatus.DRAFT,
				now: "first_call_attempt",
				list: ["first_call_attempt", "second_call_attempt", "third_call_attempt"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "second_call_attempt",
				list: ["second_call_attempt", "third_call_attempt"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "third_call_attempt",
				list: ["third_call_attempt"]
			},
      {
				orderStatus: OrderStatus.FINALIZED,
				now: "awaiting_coordinator_confirmation",
				list: ["awaiting_coordinator_confirmation", "coordinator_confirmed", "merchandise_picking", "require_warehouse_change"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "merchandise_picking",
				list: ["merchandise_picking", "require_warehouse_change"]
			},
      {
				orderStatus: OrderStatus.FINALIZED,
				now: "merchandise_packed",
				list: ["merchandise_packed"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "shipping",
				list: ["shipping"]
			},
			{
				orderStatus: OrderStatus.FINISHED,
				now: "shipped",
				list: ["shipped"]
			},
			{
				orderStatus: OrderStatus.CANCELLED,
				now: "cancelled",
				list: ["cancelled"]
			},
		]
		const STATUS_ORDER_OTHER = [
			{
				orderStatus: OrderStatus.DRAFT,
				now: "first_call_attempt",
				list: ["first_call_attempt", "second_call_attempt", "third_call_attempt"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "second_call_attempt",
				list: ["second_call_attempt", "third_call_attempt"]
			},
			{
				orderStatus: OrderStatus.DRAFT,
				now: "third_call_attempt",
				list: ["third_call_attempt"]
			},
      {
				orderStatus: OrderStatus.FINALIZED,
				now: "awaiting_coordinator_confirmation",
				list: ["awaiting_coordinator_confirmation", "awaiting_saler_confirmation","coordinator_confirmed", "require_warehouse_change", "4h_delivery"]
			},
		]
		const filterStatus = (arr: any[]) => {
			let result: OrderSubStatusResponse[] = [...initOrderSubStatus];
			const foundStatus = arr.find((single) => {
				return single.now === sub_status_code && single.orderStatus === status
					
			})
			if (foundStatus) {
        let arr: OrderSubStatusResponse[] = [];
        foundStatus.list.forEach((single:any) => {
          let mapStatuses = initOrderSubStatus.find(aa => aa.code === single)
          if(mapStatuses) {
            arr.push(mapStatuses)
          }
        })
				result = arr;
			}
			return result;
		};
		if (!OrderDetailAllFulfillment?.fulfillments) {
			return;
		}
		let result = [...initOrderSubStatus];

		switch (sortedFulfillments[0]?.shipment?.delivery_service_provider_type) {
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
		setListOrderSubStatus(result)
	}, [OrderDetailAllFulfillment?.fulfillments, initOrderSubStatus, sortedFulfillments, status]);

  const handleChange = (sub_status_code: string) => {
    
    if (orderId) {
      dispatch(setSubStatusAction(orderId, sub_status_code, ()=>{
        setValueSubStatusCode(sub_status_code);
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
