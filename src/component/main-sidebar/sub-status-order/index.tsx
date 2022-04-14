import { Card, Form, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import { setSubStatusAction } from "domain/actions/order/order.action";
import useChangeOrderSubStatus from "hook/subStatus/useChangeOrderSubStatus";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";
import {
  FulFillmentResponse,
  OrderResponse,
  OrderReturnReasonDetailModel
} from "model/response/order/order.response";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { getOrderReasonService } from "service/order/return.service";
import { handleFetchApiError, isFetchApiSuccessful, isOrderFinishedOrCancel, sortFulfillments } from "utils/AppUtils";
import { FulFillmentStatus, SHIPPING_TYPE } from "utils/Constants";
import { showError, showWarning } from "utils/ToastUtils";

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
    merchandise_packed: "merchandise_packed",
    awaiting_shipper: "awaiting_shipper",
    shipping: "shipping",
    shipped: "shipped",
    canceled: "canceled",
    fourHour_delivery: "4h_delivery",
    order_return: "order_return",
  };
  const {
    // status,
    orderId,
    fulfillments,
    subStatusCode,
    handleUpdateSubStatus,
    OrderDetailAllFulfillment,
  } = props;
  const dispatch = useDispatch();
  const [valueSubStatusCode, setValueSubStatusCode] = useState<string | undefined>(undefined);

  const [isShowReason, setIsShowReason] = useState(false);
  
  const [subReasonRequireWarehouseChange, setSubReasonRequireWarehouseChange] = useState<
    number | undefined
  >(undefined);

  const [reasonId, setReasonId] = useState<
    number | undefined
  >(undefined);

  const [subReasonsRequireWarehouseChange, setSubReasonsRequireWarehouseChange] = useState<
    OrderReturnReasonDetailModel[]
  >([]);
  const [isShouldChangeSubStatus, setIsShouldChangeSubStatus] = useState(false)

  const getChangeOrderSubStatus =useChangeOrderSubStatus(orderId || 0, valueSubStatusCode||"", isShouldChangeSubStatus, () => {}, () => {})

  const subStatuses = useGetOrderSubStatuses()

  const {isShowModalConfirmCancel, isShowModalConfirmOutOfStock} = getChangeOrderSubStatus
  console.log('isShowModalConfirmCancel', isShowModalConfirmCancel)
  console.log('isShowModalConfirmOutOfStock', isShowModalConfirmOutOfStock)

  const sortedFulfillments = useMemo(() => {
    if (!OrderDetailAllFulfillment?.fulfillments) {
      return [];
    } else {
      const returnStatus = [
        FulFillmentStatus.RETURNED,
        FulFillmentStatus.CANCELLED,
        FulFillmentStatus.RETURNING,
      ];
      let sort = sortFulfillments(OrderDetailAllFulfillment?.fulfillments);
      // bỏ trạng thái fulfillment đã hủy
      return sort.filter((single) => single.status && !returnStatus.includes(single.status));
    }
  }, [OrderDetailAllFulfillment?.fulfillments]);

  const changeSubStatusCode = (sub_status_code: string, reasonId?: number, subReasonRequireWarehouseChange?: number) => {
    if (orderId) {
      dispatch(
        setSubStatusAction(
          orderId,
          sub_status_code,
          () => {
            setValueSubStatusCode(sub_status_code);
            handleUpdateSubStatus();
            // setReload(true);
            setIsShowReason(false);
            setSubReasonRequireWarehouseChange(undefined);
          },
          undefined,
          reasonId,
          subReasonRequireWarehouseChange,
        )
      );
    }
  };

  const handleIfOrderStatusWithPartner = (sub_status_code: string) => {
    let isChange = true;
    return isChange;
  };

  const handleIfOrderStatusPickAtStore = (sub_status_code: string) => {
    let isChange = true;
    return isChange;
  };

  const handleIfOrderStatusOther = (sub_status_code: string) => {
    let isChange = true;
    switch (sub_status_code) {
      case ORDER_SUB_STATUS.awaiting_saler_confirmation: {
        const cancelStatus = [FulFillmentStatus.RETURNED, FulFillmentStatus.RETURNING];
        if (
          !sortedFulfillments[0]?.shipment ||
          (sortedFulfillments[0]?.status && cancelStatus.includes(sortedFulfillments[0]?.status))
        ) {
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
          (sortedFulfillments[0]?.status && cancelStatus.includes(sortedFulfillments[0]?.status)) ||
          !sortedFulfillments[0]?.shipment
        ) {
          isChange = false;
          showError("Chưa có hình thức vận chuyển!");
        } else {
          isChange = true;
        }
        break;
      }
      case ORDER_SUB_STATUS.fourHour_delivery: {
        if (sortedFulfillments[0]?.shipment?.service !== SHIPPING_TYPE.DELIVERY_4H) {
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
    return isChange;
  };

  // xử lý khi đổi kho hàng
  const handleIfRequireWareHouseChange = (sub_status_code: string) => {
    setIsShowReason(true);
    showWarning("Vui lòng chọn lý do đổi kho hàng chi tiết!");
    setTimeout(() => {
      const element = document.getElementById("requireWarehouseChangeId");
      element?.focus();
    }, 500);
    setValueSubStatusCode(sub_status_code);
    return;
  };

  const handleChange = (sub_status_code: string) => {
    if (!orderId) {
      return;
    }
    setIsShouldChangeSubStatus(true)
    setValueSubStatusCode(sub_status_code);
  };

  useEffect(() => {
    if (subStatusCode) {
      setValueSubStatusCode(subStatusCode);
    }
  }, [subStatusCode]);

  useEffect(() => {
    const code = ["change_depot"];
    getOrderReasonService(code).then((response) => {
      if (isFetchApiSuccessful(response)) {
        setSubReasonsRequireWarehouseChange(response.data[0].sub_reasons);
        setReasonId(response.data[0].id);
      } else {
        handleFetchApiError(response, "Danh sách lý do đổi kho hàng", dispatch);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if(subStatusCode === ORDER_SUB_STATUS.require_warehouse_change) {
      setIsShowReason(true);
      setSubReasonRequireWarehouseChange(OrderDetailAllFulfillment?.sub_reason_id)
    }
  }, [ORDER_SUB_STATUS.require_warehouse_change, OrderDetailAllFulfillment?.sub_reason_id, subStatusCode]);
  

  return (
    <Card title="Xử lý đơn hàng">
      <CustomSelect
        showSearch
        style={{ width: "100%" }}
        placeholder="Chọn trạng thái phụ"
        optionFilterProp="children"
        onChange={handleChange}
        notFoundContent="Không tìm thấy trạng thái phụ"
        value={valueSubStatusCode}
				disabled = {isOrderFinishedOrCancel(OrderDetailAllFulfillment)}
        key={Math.random()}>
        {subStatuses &&
          subStatuses.map((single) => {
            return (
              <Select.Option value={single.code} key={single.code}>
                {single.sub_status}
              </Select.Option>
            );
          })}
      </CustomSelect>
      {isShowReason ? (
        <div style={{ marginTop: 15 }}>
          <Form.Item
            style={{ marginBottom: 0 }}
            label={
              <div>
                <span>Chọn lý do đổi kho hàng chi tiết </span>
                <span className="text-error">*</span>
              </div>
            }>
            <Select
              id="requireWarehouseChangeId"
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn lý do đổi kho hàng"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={(value: number) => {
                if(!value) {
                  showError("Vui lòng chọn lý do đổi kho hàng chi tiết!");
                  return;
                }
                setSubReasonRequireWarehouseChange(value);
                changeSubStatusCode(ORDER_SUB_STATUS.require_warehouse_change, reasonId, value);
              }}
							disabled = {isOrderFinishedOrCancel(OrderDetailAllFulfillment)}
              value={subReasonRequireWarehouseChange}
              notFoundContent="Không tìm thấy lý do đổi kho hàng">
              {subReasonsRequireWarehouseChange &&
                subReasonsRequireWarehouseChange.map((single) => {
                  return (
                    <Select.Option value={single.id} key={single.id}>
                      {single.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
        </div>
      ) : null}
    </Card>
  );
}

export default SubStatusOrder;
