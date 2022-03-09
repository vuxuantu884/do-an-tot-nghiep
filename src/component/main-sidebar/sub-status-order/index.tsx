import { Card, Select } from "antd";
import { getListSubStatusAction, setSubStatusAction } from "domain/actions/order/order.action";
import {
  FulFillmentResponse,
  OrderResponse,
  OrderSubStatusResponse,
} from "model/response/order/order.response";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { sortFulfillments } from "utils/AppUtils";
import { FulFillmentStatus, OrderStatus, ShipmentMethod, SHIPPING_TYPE } from "utils/Constants";
import { showError } from "utils/ToastUtils";

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
  const ORDER_SUB_STATUS = {
    first_call_attempt: "first_call_attempt",
    second_call_attempt: "second_call_attempt",
    third_call_attempt: "third_call_attempt",
    awaiting_coordinator_confirmation: "awaiting_coordinator_confirmation",
    awaiting_saler_confirmation: "awaiting_saler_confirmation",
    coordinator_confirmed: "coordinator_confirmed",
    merchandise_picking: "merchandise_picking",
    require_warehouse_change: "require_warehouse_change",
    awaiting_shipper: "awaiting_shipper",
    shipping: "shipping",
    shipped: "shipped",
    canceled: "canceled",
    fourHour_delivery: "4h_delivery",
    order_return: "order_return",
  };
  const ORDER_RETURN_SUB_STATUS = {
    returning: {
      code: "returning",
    },
    returned: {
      code: "returned",
    },
  };
  const {
    status,
    orderId,
    fulfillments,
    subStatusCode,
    handleUpdateSubStatus,
    setReload,
    OrderDetailAllFulfillment,
  } = props;
  const dispatch = useDispatch();
  const [initOrderSubStatus, setInitOrderSubStatus] = useState<OrderSubStatusResponse[]>([]);
  const [listOrderSubStatus, setListOrderSubStatus] = useState<OrderSubStatusResponse[]>([]);
  const [valueSubStatusCode, setValueSubStatusCode] = useState<string | undefined>(undefined);

  const sortedFulfillments = useMemo(() => {
    if (!OrderDetailAllFulfillment?.fulfillments) {
      return [];
    } else {
      return sortFulfillments(OrderDetailAllFulfillment?.fulfillments);
    }
  }, [OrderDetailAllFulfillment?.fulfillments]);

  const handleOrderSubStatus = useCallback(
    (sub_status_code: string) => {
      const removeReturnInListIfOrderFinalize = (arr: OrderSubStatusResponse[]) => {
        console.log("sub_status_code", sub_status_code);
        console.log("status", status);
        if (
          status === OrderStatus.FINALIZED &&
          sub_status_code !== ORDER_RETURN_SUB_STATUS.returning.code &&
          sub_status_code !== ORDER_RETURN_SUB_STATUS.returned.code
        ) {
          console.log("333333333");
          return arr.filter(
            (status) =>
              status.code !== ORDER_RETURN_SUB_STATUS.returning.code &&
              status.code !== ORDER_RETURN_SUB_STATUS.returned.code
          );
        }
        return arr;
      };

      const STATUS_ORDER_PARTNER = [
        // tạo nháp
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.first_call_attempt,
          list: [
            ORDER_SUB_STATUS.first_call_attempt,
            ORDER_SUB_STATUS.second_call_attempt,
            ORDER_SUB_STATUS.third_call_attempt,
          ],
        },
        // gọi điện lần 2
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.second_call_attempt,
          list: [ORDER_SUB_STATUS.second_call_attempt, ORDER_SUB_STATUS.third_call_attempt],
        },
        // gọi điện lần 3
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.third_call_attempt,
          list: [ORDER_SUB_STATUS.third_call_attempt],
        },
        // duyệt đơn hàng
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
          list: [
            ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
            ORDER_SUB_STATUS.awaiting_saler_confirmation,
            ORDER_SUB_STATUS.coordinator_confirmed,
            ORDER_SUB_STATUS.fourHour_delivery,
          ],
        },
        // chờ sale xác nhận lại
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.awaiting_saler_confirmation,
          list: [
            ORDER_SUB_STATUS.awaiting_saler_confirmation,
            ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
          ],
        },
        // đã xác nhận
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.coordinator_confirmed,
          list: [
            ORDER_SUB_STATUS.coordinator_confirmed,
            ORDER_SUB_STATUS.merchandise_picking,
            ORDER_SUB_STATUS.require_warehouse_change,
          ],
        },
        // giao 4h
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.fourHour_delivery,
          list: [
            ORDER_SUB_STATUS.fourHour_delivery,
            ORDER_SUB_STATUS.merchandise_picking,
            ORDER_SUB_STATUS.require_warehouse_change,
          ],
        },
        //đổi kho hàng
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.require_warehouse_change,
          list: [
            ORDER_SUB_STATUS.require_warehouse_change,
            ORDER_SUB_STATUS.coordinator_confirmed,
            ORDER_SUB_STATUS.awaiting_saler_confirmation,
          ],
        },
        // đang nhặt hàng
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.merchandise_picking,
          list: [ORDER_SUB_STATUS.merchandise_picking, ORDER_SUB_STATUS.require_warehouse_change],
        },
        // đã đóng gói
        {
          orderStatus: OrderStatus.FINALIZED,
          now: "merchandise_packed",
          list: ["merchandise_packed", ORDER_SUB_STATUS.awaiting_shipper],
        },
        // chờ thu gom
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.awaiting_shipper,
          list: [ORDER_SUB_STATUS.awaiting_shipper],
        },
        // đang chuyển
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.shipping,
          list: [ORDER_SUB_STATUS.shipping],
        },
        // hvc cập nhật thành công
        {
          orderStatus: OrderStatus.FINISHED,
          now: ORDER_SUB_STATUS.shipped,
          list: [ORDER_SUB_STATUS.shipped],
        },
        // hủy đơn
        {
          orderStatus: OrderStatus.CANCELLED,
          now: "cancelled",
          list: ["cancelled"],
        },
        // đang hoàn
        {
          orderStatus: OrderStatus.FINALIZED,
          now: "returning",
          list: ["returning", "returned"],
        },
        // đã hoàn
        {
          orderStatus: OrderStatus.FINALIZED,
          now: "returned",
          list: ["returned"],
        },
      ];
      const STATUS_ORDER_AT_STORE = [
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.first_call_attempt,
          list: [
            ORDER_SUB_STATUS.first_call_attempt,
            ORDER_SUB_STATUS.second_call_attempt,
            ORDER_SUB_STATUS.third_call_attempt,
          ],
        },
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.second_call_attempt,
          list: [ORDER_SUB_STATUS.second_call_attempt, ORDER_SUB_STATUS.third_call_attempt],
        },
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.third_call_attempt,
          list: [ORDER_SUB_STATUS.third_call_attempt],
        },
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
          list: [
            ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
            ORDER_SUB_STATUS.awaiting_saler_confirmation,
            ORDER_SUB_STATUS.coordinator_confirmed,
            ORDER_SUB_STATUS.fourHour_delivery,
          ],
        },
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.merchandise_picking,
          list: [ORDER_SUB_STATUS.merchandise_picking, ORDER_SUB_STATUS.require_warehouse_change],
        },
        // chờ sale xác nhận lại
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.awaiting_saler_confirmation,
          list: [
            ORDER_SUB_STATUS.awaiting_saler_confirmation,
            ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
          ],
        },
        // đã xác nhận
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.coordinator_confirmed,
          list: [
            ORDER_SUB_STATUS.coordinator_confirmed,
            ORDER_SUB_STATUS.merchandise_picking,
            ORDER_SUB_STATUS.require_warehouse_change,
          ],
        },
        //đổi kho hàng
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.require_warehouse_change,
          list: [
            ORDER_SUB_STATUS.require_warehouse_change,
            ORDER_SUB_STATUS.coordinator_confirmed,
            ORDER_SUB_STATUS.awaiting_saler_confirmation,
          ],
        },
        {
          orderStatus: OrderStatus.FINALIZED,
          now: "merchandise_packed",
          list: ["merchandise_packed"],
        },
        {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.shipping,
          list: [ORDER_SUB_STATUS.shipping],
        },
        {
          orderStatus: OrderStatus.FINISHED,
          now: ORDER_SUB_STATUS.shipped,
          list: [ORDER_SUB_STATUS.shipped],
        },
        {
          orderStatus: OrderStatus.CANCELLED,
          now: "cancelled",
          list: ["cancelled"],
        },
      ];
      const STATUS_ORDER_OTHER = [
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.first_call_attempt,
          list: [
            ORDER_SUB_STATUS.first_call_attempt,
            ORDER_SUB_STATUS.second_call_attempt,
            ORDER_SUB_STATUS.third_call_attempt,
          ],
        },
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.second_call_attempt,
          list: [ORDER_SUB_STATUS.second_call_attempt, ORDER_SUB_STATUS.third_call_attempt],
        },
        {
          orderStatus: OrderStatus.DRAFT,
          now: ORDER_SUB_STATUS.third_call_attempt,
          list: [ORDER_SUB_STATUS.third_call_attempt],
        },
				 // chờ sale xác nhận lại
				 {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.awaiting_saler_confirmation,
          list: [
            ORDER_SUB_STATUS.awaiting_saler_confirmation,
            ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
          ],
        },
				 //đổi kho hàng
				 {
          orderStatus: OrderStatus.FINALIZED,
          now: ORDER_SUB_STATUS.require_warehouse_change,
          list: [
            ORDER_SUB_STATUS.require_warehouse_change,
            ORDER_SUB_STATUS.coordinator_confirmed,
            ORDER_SUB_STATUS.awaiting_saler_confirmation,
          ],
        },
      ];
      const filterStatus = (arr: any[], arrOrderSubStatus: OrderSubStatusResponse[]) => {
        let result: OrderSubStatusResponse[] = [...arrOrderSubStatus];
        const foundStatus = arr.find((single) => {
          return single.now === sub_status_code && single.orderStatus === status;
        });
        if (foundStatus) {
          let arrResult: OrderSubStatusResponse[] = [];
          foundStatus.list.forEach((single: any) => {
            let mapStatuses = arrOrderSubStatus.find((status) => status.code === single);
            if (mapStatuses) {
              arrResult.push(mapStatuses);
            }
          });
          result = arrResult;
          console.log("arrResult", arrResult);
        }
        return result;
      };
      // console.log('OrderDetailAllFulfillment', OrderDetailAllFulfillment)
      if (!OrderDetailAllFulfillment?.fulfillments) {
        return;
      }
      let result = [...initOrderSubStatus];
      result = removeReturnInListIfOrderFinalize(result);

      switch (sortedFulfillments[0]?.shipment?.delivery_service_provider_type) {
        // giao hàng hvc, tự giao hàng
        case ShipmentMethod.EXTERNAL_SERVICE:
        case ShipmentMethod.EMPLOYEE:
          result = filterStatus(STATUS_ORDER_PARTNER, result);
          break;
        // nhận tại cửa hàng
        case ShipmentMethod.PICK_AT_STORE:
          result = filterStatus(STATUS_ORDER_AT_STORE, result);
          break;
        default:
          result = filterStatus(STATUS_ORDER_OTHER, result);
          break;
      }
      setListOrderSubStatus(result);
    },
    [
      ORDER_RETURN_SUB_STATUS.returned.code,
      ORDER_RETURN_SUB_STATUS.returning.code,
      ORDER_SUB_STATUS.awaiting_coordinator_confirmation,
      ORDER_SUB_STATUS.awaiting_saler_confirmation,
      ORDER_SUB_STATUS.awaiting_shipper,
      ORDER_SUB_STATUS.coordinator_confirmed,
      ORDER_SUB_STATUS.first_call_attempt,
      ORDER_SUB_STATUS.fourHour_delivery,
      ORDER_SUB_STATUS.merchandise_picking,
      ORDER_SUB_STATUS.require_warehouse_change,
      ORDER_SUB_STATUS.second_call_attempt,
      ORDER_SUB_STATUS.shipped,
      ORDER_SUB_STATUS.shipping,
      ORDER_SUB_STATUS.third_call_attempt,
      OrderDetailAllFulfillment?.fulfillments,
      initOrderSubStatus,
      sortedFulfillments,
      status,
    ]
  );

  const changeSubStatusCode = (sub_status_code: string) => {
    if (orderId) {
      dispatch(
        setSubStatusAction(orderId, sub_status_code, () => {
          setValueSubStatusCode(sub_status_code);
          handleUpdateSubStatus();
          setReload(true);
        })
      );
    }
  };

  const handleIfOrderStatusWithPartner = (sub_status_code: string) => {
    // changeSubStatusCode(sub_status_code);
  };

  const handleIfOrderStatusPickAtStore = (sub_status_code: string) => {
    // changeSubStatusCode(sub_status_code);
  };

  const handleIfOrderStatusOther = (sub_status_code: string) => {
    let isChange = true;
    switch (sub_status_code) {
      case ORDER_SUB_STATUS.awaiting_saler_confirmation: {
        const cancelStatus = [FulFillmentStatus.RETURNED, FulFillmentStatus.RETURNING];
        if (sortedFulfillments[0].status && cancelStatus.includes(sortedFulfillments[0].status)) {
          isChange = true;
        } else {
          isChange = false;
          showError("Bạn chưa hủy đơn giao hàng!");
        }
        break;
      }
      case ORDER_SUB_STATUS.coordinator_confirmed: {
        const cancelStatus = [FulFillmentStatus.RETURNED, FulFillmentStatus.RETURNING];
        if (
          (sortedFulfillments[0].status && cancelStatus.includes(sortedFulfillments[0].status)) ||
          !sortedFulfillments[0].shipment
        ) {
          isChange = false;
          showError("Chưa có hình thức vận chuyển!");
        } else {
          isChange = true;
        }
        break;
      }
      case ORDER_SUB_STATUS.fourHour_delivery: {
        if (sortedFulfillments[0].shipment?.service !== SHIPPING_TYPE.DELIVERY_4H) {
          isChange = false;
          showError("Chưa chọn giao hàng 4h!");
        } else {
          isChange = true;
        }
        break;
      }
      default:
        break;
    }
    if (isChange) {
      changeSubStatusCode(sub_status_code);
    }
  };

  const handleChange = (sub_status_code: string) => {
    if (!orderId) {
      return;
    }
    handleIfOrderStatusOther(sub_status_code);
    switch (sortedFulfillments[0]?.shipment?.delivery_service_provider_type) {
      // giao hàng hvc, tự giao hàng
      case ShipmentMethod.EXTERNAL_SERVICE:
      case ShipmentMethod.EMPLOYEE:
        handleIfOrderStatusWithPartner(sub_status_code);
        break;
      // nhận tại cửa hàng
      case ShipmentMethod.PICK_AT_STORE:
        handleIfOrderStatusPickAtStore(sub_status_code);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const listFulfillmentMapSubStatus = {
      packed: {
        fulfillmentStatus: "packed",
        subStatus: "packed",
      },
      finalized: {
        fulfillmentStatus: ORDER_SUB_STATUS.shipping,
        subStatus: ORDER_SUB_STATUS.shipping,
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
  }, [ORDER_SUB_STATUS.shipping, dispatch, fulfillments, status]);

  useEffect(() => {
    if (valueSubStatusCode) {
      handleOrderSubStatus(valueSubStatusCode);
    } else {
      setListOrderSubStatus(initOrderSubStatus);
    }
  }, [
    handleOrderSubStatus,
    valueSubStatusCode,
    OrderDetailAllFulfillment?.fulfillments,
    fulfillments,
    initOrderSubStatus,
  ]);

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
        key={Math.random()}>
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
