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
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
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


  const handleOrderSubStatus = useCallback((sub_status_code: string) => {
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
				now: "awaiting_coordinator_confirmation",
				list: ["awaiting_coordinator_confirmation", "cho_sale_xac_nhan_lai","coordinator_confirmed", "doi_kho_hang"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "merchandise_picking",
				list: ["merchandise_picking", "doi_kho_hang"]
			},
      {
				orderStatus: OrderStatus.FINALIZED,
				now: "merchandise_packed",
				list: ["merchandise_packed", "awaiting_shipper"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "shipping",
				list: ["shipping"]
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
				now: "awaiting_coordinator_confirmation",
				list: ["awaiting_coordinator_confirmation", "coordinator_confirmed", "merchandise_picking", "doi_kho_hang"]
			},
			{
				orderStatus: OrderStatus.FINALIZED,
				now: "merchandise_picking",
				list: ["merchandise_picking", "doi_kho_hang"]
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
      {
				orderStatus: OrderStatus.FINALIZED,
				now: "awaiting_coordinator_confirmation",
				list: ["awaiting_coordinator_confirmation", "cho_sale_xac_nhan_lai","coordinator_confirmed", "doi_kho_hang"]
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
		setListOrderSubStatus(result)
	}, [OrderDetailAllFulfillment?.fulfillments, initOrderSubStatus, status]);

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
