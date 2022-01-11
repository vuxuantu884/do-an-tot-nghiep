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

	const removeValuesBeforeSubStatus = (sub_status_code: string, list: OrderSubStatusResponse[] ) => {
		if(!sub_status_code) {
			return list;
		}
		const subStatusCodes = list.map(single=>single.code);
		const index = subStatusCodes.indexOf(sub_status_code);
		if(index > -1) {
			let clone = [...list];
			clone.splice(0, index);
			return clone;
		} else {
			return list;
		}
	};

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
		if(!OrderDetailAllFulfillment?.fulfillments) {
			return;
		}
		console.log('fulfillments', fulfillments)
		switch (OrderDetailAllFulfillment?.fulfillments[0]?.shipment?.delivery_service_provider_type) {
			case ShipmentMethod.EXTERNAL_SERVICE:
				const abc = STATUS_ORDER_PARTNER.find((single) => {
					return single.now === sub_status_code && single.orderStatus===status
				})
				console.log('abc', abc);
				if(abc) {
					let ddd = initOrderSubStatus.filter(single=>single.code === abc.now)
					setListOrderSubStatus(ddd)
				}
				break;
		
			default:
				break;
		}
	}, [OrderDetailAllFulfillment?.fulfillments, fulfillments, initOrderSubStatus, status]);
	
  const handleChange = (sub_status_code: string) => {
    
    if (orderId) {
      setValueSubStatusCode(sub_status_code);
      dispatch(setSubStatusAction(orderId, sub_status_code, ()=>{
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
					if(valueSubStatusCode) {
						const result = removeValuesBeforeSubStatus(valueSubStatusCode, data);
						setInitOrderSubStatus(result);

					} else {
						setInitOrderSubStatus(data);

					}
        })
      );
    }
  }, [dispatch, fulfillments, status, subStatusCode, valueSubStatusCode]);

	useEffect(() => {
		if(valueSubStatusCode) {
			console.log('valueSubStatusCode', valueSubStatusCode)
			console.log('fulfillments', fulfillments)
			handleOrderSubStatus(valueSubStatusCode)

		}
	}, [handleOrderSubStatus, valueSubStatusCode, OrderDetailAllFulfillment?.fulfillments, fulfillments])

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
