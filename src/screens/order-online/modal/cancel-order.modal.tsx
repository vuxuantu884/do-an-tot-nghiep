/* eslint-disable eqeqeq */
import { Form, Input, Modal } from "antd";
import CustomSelect from "component/custom/select.custom";
import { OrderReturnReasonDetailModel } from "model/response/order/order.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getOrderReasonService } from "service/order/return.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";

type PropTypes = {
  visible: boolean;
  orderCode?: string | undefined;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (reason_id: string, sub_reason_id: string, reason: string) => void;
  reasons?: {
    title: string;
    value: string;
  }[];
};

function CancelOrderModal (props: PropTypes)  {
  const { visible, orderCode, onCancel, onOk, reasons } =
    props;
    const otherReasonId = "1";
    const dispatch = useDispatch();
    const [reasonID, setReasonID] = useState<string | undefined>(undefined);
    const [reason, setReason] = useState<string | undefined>(undefined);
    const [reasonSub, setReasonSub] = useState<string | undefined>(undefined);
    const [reasonSubs, setReasonSubs] = useState<OrderReturnReasonDetailModel[]>([]);
    const [reasonOtherDescription, setReasonOtherDescription] = useState<string>("");

  const onChangeReason = useCallback((value) => {
    setReason(value);
    if (!value) {
      setReasonSubs([]);
      setReasonID(undefined);
    }
    setReasonSub(undefined)
  }, []);

  const focusElementById = (id: string) => {
    const element = document.getElementById(id);
    element?.focus();
  };

  const onSubmit = (reasonID: string|undefined, reasonSub: string|undefined, reasonOtherDescription: string, type?: string) => {
    if(!reasonID) {
      showError("Vui lòng chọn lý do!");
      const element = document.getElementById("selectFulfillmentCancelReasonId");
      element?.focus()
    } else {
      const handleSuccess = () => {
        onOk(reasonID, reasonSub || "", reasonOtherDescription);
        setReason(undefined)
        setReasonSub(undefined)
      };
      if(reasonID === otherReasonId) {
        if(!reasonOtherDescription) {
          showError("Vui lòng nhập lý do khác!");
          focusElementById("cancelOrderOtherReasonDescriptionId");
        } else {
          handleSuccess();
        }
      } else {
        if(!reasonSub) {
          showError("Vui lòng nhập chi tiết lý do!");
          focusElementById("cancelOrderSelectSubReasonId");
        } else {
          handleSuccess();
        }
      }
    }
  };

  useEffect(() => {
    if (reason) {
      const code = [reason];
      getOrderReasonService(code).then((response) => {
        if (isFetchApiSuccessful(response)) {
          setReasonID(response.data[0].id.toString());
          setReasonSubs(response.data[0].sub_reasons);
        } else {
          handleFetchApiError(response, "Danh sách lý do hủy", dispatch);
        }
      });
    }
  }, [dispatch, reason]);
  
  return (
    <Modal
      title={`Huỷ đơn hàng ${orderCode}`}
      onCancel={(e) => {
        onCancel(e);
        setReason(undefined);
        setReasonSub(undefined)
        setReasonOtherDescription("")
      }}
      onOk={() => onSubmit(reasonID, reasonSub, reasonOtherDescription)}
      visible={visible}
      centered
      okText="Xác nhận huỷ đơn"
      cancelText="Huỷ"
      width={600}
    >
      <div>
      <Form.Item label="Chọn lý do" labelCol={{ span: 6 }} style={{ alignItems: "center" }}>
          <CustomSelect
            allowClear
            showSearch
            placeholder="Chọn lý do"
            notFoundContent="Không tìm thấy kết quả"
            style={{ width: "100%" }}
            optionFilterProp="children"
            showArrow
            getPopupContainer={(trigger) => trigger.parentNode}
            onChange={(value) => onChangeReason(value)}
            value={reason}
            id="selectFulfillmentCancelReasonId"
          >
            {reasons &&
              reasons?.map((reason) => (
                <CustomSelect.Option key={reason.value} value={reason.value?.toString()}>
                  {reason.title}
                </CustomSelect.Option>
              ))}
          </CustomSelect>
        </Form.Item>
        {reasonID !== otherReasonId ? (
          <Form.Item
            label="Chọn lý do chi tiết"
            labelCol={{ span: 6 }}
            style={{ alignItems: "center" }}>
            <CustomSelect
              allowClear
              showSearch
              placeholder="Chọn lý do chi tiết"
              notFoundContent="Không tìm thấy kết quả"
              style={{ width: "100%" }}
              optionFilterProp="children"
              showArrow
              getPopupContainer={(trigger) => trigger.parentNode}
              onChange={(value) => {
                setReasonSub(value);
              }}
              value={reasonSub}
              id="cancelOrderSelectSubReasonId"
            >
              {reasonSubs.map((reasonSub: any) => (
                <CustomSelect.Option key={reasonSub.id} value={reasonSub.id.toString()}>
                  {reasonSub.name}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          </Form.Item>
        ) : (
          <Form.Item label="Lý do khác" labelCol={{ span: 6 }}>
            <Input.TextArea
              onChange={(e) => setReasonOtherDescription(e.target.value)}
              style={{ width: "100%", height: "80px" }}
              placeholder="Nhập lý do huỷ đơn hàng"
              id="cancelOrderOtherReasonDescriptionId"
              value={reasonOtherDescription}
            />
          </Form.Item>
        )}
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
