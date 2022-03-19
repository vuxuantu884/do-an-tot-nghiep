/* eslint-disable eqeqeq */
import { Button, Form, Input, Modal } from "antd";
import CustomSelect from "component/custom/select.custom";
import { OrderReturnReasonDetailModel } from "model/response/order/order.response";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getOrderReasonService } from "service/order/return.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { showError } from "utils/ToastUtils";

type cancelFulfillmentModalProps = {
  shipping: boolean;
  visible: boolean;
  order_id?: number | null;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (reason_id: string, sub_reason_id: string, reason: string) => void;
  onOkAndMore: (reason_id: string, sub_reason_id: string, reason: string) => void;
  text: string;
  title: string;
  icon: string;
  cancelText: string;
  okText: string;
  isCanceling?: boolean;
  reasons?: {
    title: string;
    value: string;
  }[];
};

function CancelFulfillmentModal(props: cancelFulfillmentModalProps)  {
  const {
    shipping,
    visible,
    onCancel,
    onOk,
    text,
    title,
    icon,
    okText,
    isCanceling,
    cancelText,
    reasons,
    onOkAndMore,
  } = props;
  const onOkAndMoreType = "onOkAndMore";
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
        if(type === onOkAndMoreType) {
          onOkAndMore(reasonID, reasonSub || "", reasonOtherDescription);
        } else {
          onOk(reasonID, reasonSub || "", reasonOtherDescription);
        }
        setReason(undefined)
        setReasonSub(undefined)
      };
      if(reasonID === otherReasonId) {
        if(!reasonOtherDescription) {
          showError("Vui lòng nhập lý do khác!");
          focusElementById("cancelFulfillmentOtherReasonDescriptionId");
        } else {
          handleSuccess();
        }
      } else {
        if(!reasonSub) {
          showError("Vui lòng nhập chi tiết lý do!");
          focusElementById("selectFulfillmentCancelSubReasonId");
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
      onCancel={(e) => {
        onCancel(e);
        setReason(undefined);
        setReasonSub(undefined)
        setReasonOtherDescription("")
      }}
      // onOk={onOk}
      visible={visible}
      centered
      okText={okText}
      cancelText={cancelText}
      title={[
        <div className="title">
          <img src={icon} alt="" />
          <div>
            <h4>{title}</h4>
            <span style={title ? { fontWeight: 400 } : { fontWeight: 600, fontSize: 16 }}>
              {text}
            </span>
          </div>
        </div>,
      ]}
      width={600}
      className="saleorder-modal-config"
      footer={[
        <Button key="back" onClick={onCancel}>
          {cancelText}
        </Button>,
        <Button
          key="cancel"
          type="primary"
          className="create-button-custom ant-btn-outline fixed-button"
          onClick={() => {
            onSubmit(reasonID, reasonSub, reasonOtherDescription);
          }}
          loading={isCanceling}>
          {okText}
        </Button>,
        <Button
          key="cancel-and-goods-back"
          type="primary"
          style={{ display: shipping ? "inline" : "none" }}
          onClick={() => {
            if (reasonID && reasonSub) {
              onSubmit(reasonID, reasonSub, reasonOtherDescription, onOkAndMoreType);
            } else {
              showError("Vui lòng chọn lý do!")
            }
          }}>
          Hủy giao và nhận lại hàng
        </Button>,
      ]}>
      <div style={{ padding: "24px" }}>
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
              id="selectFulfillmentCancelSubReasonId"
            >
              {reasonSubs && reasonSubs.map((reasonSub: any) => (
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
              id="cancelFulfillmentOtherReasonDescriptionId"
              value={reasonOtherDescription}
            />
          </Form.Item>
        )}
      </div>
    </Modal>
  );
};

export default CancelFulfillmentModal;
