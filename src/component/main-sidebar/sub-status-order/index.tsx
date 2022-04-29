import { Card, Form, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import SubStatusChange from "component/order/SubStatusChange/SubStatusChange";
import { setSubStatusAction } from "domain/actions/order/order.action";
import useGetOrderSubStatuses from "hook/useGetOrderSubStatuses";
import { OrderResponse, OrderReturnReasonDetailModel } from "model/response/order/order.response";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getOrderReasonService } from "service/order/return.service";
import { handleFetchApiError, isFetchApiSuccessful, isOrderFinishedOrCancel } from "utils/AppUtils";
import { ORDER_SUB_STATUS, SUB_STATUS_CANCEL_CODE } from "utils/Order.constants";
import { showError, showWarning } from "utils/ToastUtils";

type PropTypes = {
  subStatusCode?: string | undefined;
  status?: string | null;
  orderId?: number;
  handleUpdateSubStatus: () => void;
  setReload: (value: boolean) => void;
  OrderDetailAllFulfillment?: OrderResponse | null;
};

function SubStatusOrder(props: PropTypes): React.ReactElement {
  const {
    // status,
    orderId,
    subStatusCode,
    handleUpdateSubStatus,
    OrderDetailAllFulfillment,
    setReload
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

  const subStatuses = useGetOrderSubStatuses();

  const changeSubStatusCode = (
    sub_status_code: string,
    reasonId?: number,
    subReasonRequireWarehouseChange?: number
  ) => {
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
          subReasonRequireWarehouseChange
        )
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
    return;
  };

  const handleChange = (sub_status_code: string) => {
    if (!orderId) {
      return;
    }
    if (sub_status_code === ORDER_SUB_STATUS.require_warehouse_change) {
      handleIfRequireWareHouseChange(sub_status_code);
    } else {
      setToSubStatusCode(sub_status_code);
    }
  };

  const RELOAD_STATUSES = [
    ...SUB_STATUS_CANCEL_CODE,
    ORDER_SUB_STATUS.out_of_stock,
  ]

  const changeSubStatusCallback = (value: string) => {
    setValueSubStatusCode(value);
    if(RELOAD_STATUSES.includes(value)) {
      setReload(true)
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
    }
  }, [OrderDetailAllFulfillment?.sub_reason_id, subStatusCode]);

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
        disabled={isOrderFinishedOrCancel(OrderDetailAllFulfillment)}
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
                if (!value) {
                  showError("Vui lòng chọn lý do đổi kho hàng chi tiết!");
                  return;
                }
                setSubReasonRequireWarehouseChange(value);
                changeSubStatusCode(ORDER_SUB_STATUS.require_warehouse_change, reasonId, value);
              }}
              disabled={isOrderFinishedOrCancel(OrderDetailAllFulfillment)}
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

      <SubStatusChange
        orderId={orderId}
        toSubStatus={toSubStatusCode}
        setToSubStatusCode={setToSubStatusCode}
        changeSubStatusCallback={changeSubStatusCallback}
      />
    </Card>
  );
}

export default SubStatusOrder;
