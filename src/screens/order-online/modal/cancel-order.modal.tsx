import { Modal, Input, Form } from "antd";
import CustomSelect from "component/custom/select.custom";
import { useState } from "react";

type CancelOrderModalProps = {
  visible: boolean;
  orderCode?: string | undefined;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (reasonID: number, reason: string) => void;
  reasons: any;
};

const CancelOrderModal: React.FC<CancelOrderModalProps> = (
  props: CancelOrderModalProps
) => {
  const { visible, orderCode, onCancel, onOk, reasons } =
    props;
  const [reasonID, setReasonID] = useState<string>('2');
  const [reason, setReason] = useState<string>('');
  return (
    <Modal
      title={`Huỷ đơn hàng ${orderCode}`}
      onCancel={onCancel}
      onOk={() => onOk(Number(reasonID), reason)}
      visible={visible}
      centered
      okText="Xác nhận huỷ đơn"
      cancelText="Huỷ"
      width={600}
    >
      <div>
        <Form.Item label="Chọn lý do" labelCol={{span: 4}} style={{alignItems:"center"}}>
          <CustomSelect
            showSearch placeholder="Chọn lý do huỷ đơn"
            notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
            optionFilterProp="children" showArrow
            getPopupContainer={trigger => trigger.parentNode}
            onSelect={(value) => {
              console.log('aaaa', value, reasonID);
              setReasonID(value)
            }}
            value={reasonID}
          >
            {reasons.map((reason: any) => (
              <CustomSelect.Option key={reason.id.toString()} value={reason.id.toString()}>
                {reason.name}
              </CustomSelect.Option>
            ))}
          </CustomSelect>
        </Form.Item>
        {(reasonID === '1') && (
        <Form.Item label="Lý do khác" labelCol={{span: 4}}>
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
