import { Card, Form, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import SubStatusChange from "component/order/SubStatusChange/SubStatusChange";
import { setSubStatusAction } from "domain/actions/order/order.action";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";
import { StoreResponse } from "model/core/store.model";
import { OrderResponse, OrderReturnReasonDetailModel } from "model/response/order/order.response";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { getOrderReasonService } from "service/order/return.service";
import { handleFetchApiError, isFetchApiSuccessful, isOrderFinishedOrCancel } from "utils/AppUtils";
import { ORDER_SUB_STATUS } from "utils/Order.constants";
import { checkIfOrderHasNotFinishPaymentMomo, getFulfillmentActive } from "utils/OrderUtils";
import { showError, showWarning } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

type PropTypes = {
  setOrderDetail?: (data: OrderResponse | null) => void;
  subStatusCode?: string | undefined;
  orderId?: number;
  handleUpdateSubStatus: () => void;
  setReload: (value: boolean) => void;
  OrderDetailAllFulfillment?: OrderResponse | null;
  isDisableUpdate?: boolean;
  currentStores?: StoreResponse[];
};

function SubStatusOrder(props: PropTypes): React.ReactElement {
  const {
    setOrderDetail,
    orderId,
    subStatusCode,
    handleUpdateSubStatus,
    OrderDetailAllFulfillment,
    setReload,
    isDisableUpdate = false,
    currentStores,
  } = props;
  const dispatch = useDispatch();
  const [toSubStatusCode, setToSubStatusCode] = useState<string | undefined>(undefined);
  const [valueSubStatusCode, setValueSubStatusCode] = useState<string | undefined>(undefined);

  const [isShowReason, setIsShowReason] = useState(false);

  const [subReasonRequireWarehouseChange, setSubReasonRequireWarehouseChange] = useState<
    number | undefined
  >(undefined);

  const [reasonId, setReasonId] = useState<number | undefined>(undefined);

  const [subReasonsRequireWarehouseChange, setSubReasonsRequireWarehouseChange] = useState<
    OrderReturnReasonDetailModel[]
  >([]);

  const returnedStore = useMemo(() => {
    const fulfillment = getFulfillmentActive(OrderDetailAllFulfillment?.fulfillments);
    const result = currentStores?.find((p) => p.id === fulfillment?.returned_store_id);
    return result;
  }, [OrderDetailAllFulfillment, currentStores]);

  // console.log("OrderDetailAllFulfillment",OrderDetailAllFulfillment)
  const subStatuses = useGetOrderSubStatuses();

  const changeSubStatusCode = (sub_status_code: string, reasonId?: number, subReason?: number) => {
    if (orderId) {
      dispatch(
        setSubStatusAction(
          orderId,
          sub_status_code,
          (data: OrderResponse) => {
            setValueSubStatusCode(sub_status_code);
            handleUpdateSubStatus();
            setOrderDetail && setOrderDetail(data);
            if (data.sub_reason_id) setSubReasonRequireWarehouseChange(data.sub_reason_id);
            else setSubReasonRequireWarehouseChange(undefined);
          },
          undefined,
          reasonId,
          subReason,
        ),
      );
    }
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
    setSubReasonRequireWarehouseChange(undefined);
    return;
  };

  const handleChange = (sub_status_code: string) => {
    if (!orderId) {
      return;
    }
    if (sub_status_code === ORDER_SUB_STATUS.require_warehouse_change) {
      handleIfRequireWareHouseChange(sub_status_code);
    } else {
      if (subStatusCode === sub_status_code) {
        setValueSubStatusCode(subStatusCode);
        setIsShowReason(false);
        return;
      }
      setToSubStatusCode(sub_status_code);
    }
  };

  const changeSubStatusCallback = (value: string) => {
    setValueSubStatusCode(value);
    setReload(true);
  };

  const checkIfIsDisableUpdateSubStatus = () => {
    return (
      isOrderFinishedOrCancel(OrderDetailAllFulfillment) ||
      isDisableUpdate ||
      checkIfOrderHasNotFinishPaymentMomo(OrderDetailAllFulfillment)
    );
  };

  const renderShowReason = () => {
    if (isShowReason) {
      return (
        <div className="selectReason">
          <Form.Item
            className="selectReason__label"
            label={
              <div>
                <span>Chọn lý do đổi kho hàng chi tiết </span>
                <span className="text-error">*</span>
              </div>
            }
          >
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
                if (!value) {
                  showError("Vui lòng chọn lý do đổi kho hàng chi tiết!");
                  return;
                }
                //setSubReasonRequireWarehouseChange(value);
                changeSubStatusCode(ORDER_SUB_STATUS.require_warehouse_change, reasonId, value);
              }}
              disabled={
                isOrderFinishedOrCancel(OrderDetailAllFulfillment) ||
                checkIfIsDisableUpdateSubStatus()
              }
              value={subReasonRequireWarehouseChange}
              notFoundContent="Không tìm thấy lý do đổi kho hàng"
            >
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
      );
    }
  };

  useEffect(() => {
    if (subStatusCode) {
      setValueSubStatusCode(subStatusCode);
    }
  }, [subStatusCode]);

  useEffect(() => {
    const code = [ORDER_SUB_STATUS.change_depot];
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
    if (subStatusCode === ORDER_SUB_STATUS.require_warehouse_change) {
      setIsShowReason(true);
      setSubReasonRequireWarehouseChange(OrderDetailAllFulfillment?.sub_reason_id);
    } else {
      setIsShowReason(false);
    }
  }, [OrderDetailAllFulfillment?.sub_reason_id, subStatusCode]);

  // console.log("subStatusCode",subStatusCode)
  // console.log("toSubStatusCode",toSubStatusCode)
  // console.log("subReasonsRequireWarehouseChange",subReasonsRequireWarehouseChange)

  return (
    <StyledComponent>
      <Card title={<span className="98">Xử lý đơn hàng</span>}>
        <CustomSelect
          showSearch
          style={{ width: "100%" }}
          placeholder="Chọn trạng thái phụ"
          optionFilterProp="children"
          onChange={handleChange}
          notFoundContent="Không tìm thấy trạng thái phụ"
          value={valueSubStatusCode}
          disabled={checkIfIsDisableUpdateSubStatus()}
          listHeight={300}
          key={Math.random()}
        >
          {subStatuses &&
            subStatuses.map((single) => {
              return (
                <Select.Option value={single.code} key={single.code}>
                  {single.sub_status}
                </Select.Option>
              );
            })}
        </CustomSelect>

        {renderShowReason()}

        <SubStatusChange
          orderId={orderId}
          toSubStatus={toSubStatusCode}
          setToSubStatusCode={setToSubStatusCode}
          changeSubStatusCallback={changeSubStatusCallback}
          setOrderDetail={setOrderDetail}
          returnStore={returnedStore}
        />
      </Card>
    </StyledComponent>
  );
}

export default SubStatusOrder;
