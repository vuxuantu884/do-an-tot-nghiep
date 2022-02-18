/* eslint-disable eqeqeq */
import { Modal, Input, Form } from "antd";
import CustomSelect from "component/custom/select.custom";
import { useCallback, useState } from "react";

type CancelOrderModalProps = {
  visible: boolean;
  orderCode?: string | undefined;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (reason_id: string, sub_reason_id: string, reason: string) => void;
  reasons: any;
};

const CancelOrderModal: React.FC<CancelOrderModalProps> = (
  props: CancelOrderModalProps
) => {
  const { visible, orderCode, onCancel, onOk, reasons } =
    props;
  const [reasonID, setReasonID] = useState<string>('1');
  // const [reasonSubs, setReasonSubs] = useState<any[]>([]);
  const [reasonSubID, setReasonSubID] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [reasonSubs, setReasonSubs] = useState<any[]>([]);

  const onChangeReasonID = useCallback((value) => {
    setReasonID(value)
    setReason('')
    const reasonDetails = reasons.find((reason: any) => reason.id == value)
    if (reasonDetails && reasonDetails.sub_reasons.length) {
      setReasonSubID(reasonDetails.sub_reasons[0].id.toString())
      setReasonSubs(reasonDetails.sub_reasons)
    } else {
      setReasonSubID('')
      setReasonSubs([])
    }
  }, [reasons])
  return (
    <Modal
      title={`Huỷ đơn hàng ${orderCode}`}
      onCancel={onCancel}
      onOk={() => onOk(reasonID, reasonSubID, reason)}
      visible={visible}
      centered
      okText="Xác nhận huỷ đơn"
      cancelText="Huỷ"
      width={600}
    >
      <div>
        <Form.Item label="Chọn lý do" labelCol={{span: 6}} style={{alignItems:"center"}}>
          <CustomSelect
            showSearch placeholder="Chọn lý do"
            notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
            optionFilterProp="children" showArrow
            getPopupContainer={trigger => trigger.parentNode}
            onSelect={(value) => onChangeReasonID(value)}
            value={reasonID}
          >
            {reasons.map((reason: any) => (
              <CustomSelect.Option key={reason.id} value={reason.id.toString()}>
                {reason.name}
              </CustomSelect.Option>
            ))}
          </CustomSelect>
        </Form.Item>
        {reasonSubs.length > 0 &&
        <Form.Item label="Chọn lý do chi tiết" labelCol={{span: 6}} style={{alignItems:"center"}}>
          <CustomSelect
            showSearch placeholder="Chọn lý do chi tiết"
            notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
            optionFilterProp="children" showArrow
            getPopupContainer={trigger => trigger.parentNode}
            onSelect={(value) => {
              setReasonSubID(value)
            }}
            value={reasonSubID}
          >
            {reasonSubs.map((reasonSub: any) => (
              <CustomSelect.Option key={reasonSub.id} value={reasonSub.id.toString()}>
                {reasonSub.name}
              </CustomSelect.Option>
            ))}
          </CustomSelect>
        </Form.Item>}
        {!(reasonSubs.length > 0) && (
        <Form.Item label="Lý do khác" labelCol={{span: 6}}>
          <Input.TextArea
            onChange={(e) => setReason(e.target.value)}
            style={{ width: "100%", height: '80px' }}
            placeholder="Nhập lý do huỷ đơn hàng"
          />
        </Form.Item>)}
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
