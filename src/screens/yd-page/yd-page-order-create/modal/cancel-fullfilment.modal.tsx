/* eslint-disable eqeqeq */
import { Modal, Button, Form, Input } from "antd";
import CustomSelect from "component/custom/select.custom";
import { useCallback, useState } from "react";

type cancelFullfilmentModalProps = {
  shipping: boolean;
  visible: boolean;
  order_id?: number | null;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (reason_id: string, sub_reason_id: string, reason: string) => void;
  onOkandMore: (reason_id: string, sub_reason_id: string, reason: string) => void;
  text: string;
  title: string;
  icon: string;
  cancelText: string;
  okText: string;
  isCanceling?: boolean;
  reasons: any[];
};

const CancelFullfilmentModal: React.FC<cancelFullfilmentModalProps> = (
  props: cancelFullfilmentModalProps
) => {
  const {
    shipping, visible, onCancel, onOk, text,
    title, icon, okText, isCanceling,
    cancelText, reasons, onOkandMore
  } = props;
  const [reasonID, setReasonID] = useState<string>('1');
  // const [reasonSubs, setReasonSubs] = useState<any[]>([]); 
  const [reasonSubID, setReasonSubID] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [reasonSubs, setReasonSubs] = useState<any[]>([]); 
  
  const onChangeReasonID = useCallback((value) => {
    setReasonID(value)
    setReason('')
    const reasonDetails = reasons.find(reason => reason.id == value)

    if (reasonDetails && reasonDetails.sub_reasons.length) {
      setReasonSubID(reasonDetails.sub_reasons[0].id.toString())
      setReasonSubs(reasonDetails.sub_reasons)
    } else {
      setReasonSubID('')
      setReasonSubs([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reasonID, reasons])

  return (
    <Modal
      onCancel={onCancel}
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
            <span
              style={
                title ? { fontWeight: 400 } : { fontWeight: 600, fontSize: 16 }
              }
            >
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
          onClick={() => onOk(reasonID, reasonSubID, reason)}
          loading={isCanceling}
        >
          {okText}
        </Button>,
        <Button
          key="cancel-and-goods-back"
          type="primary" style={{ display: shipping ? 'inline' : 'none'}}
          onClick={() => onOkandMore(reasonID, reasonSubID, reason)}>
          Hủy giao và nhận lại hàng
        </Button>,
      ]}
    >
      <div style={{ padding: '24px' }}>
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

export default CancelFullfilmentModal;
