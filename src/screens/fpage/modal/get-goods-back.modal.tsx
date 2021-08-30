import { Modal, Select } from "antd";

type GetGoodsBackModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  setCancelReason: (value: string) => void;
  text: string;
  title: string;
  icon: string;
  cancelText: string;
  okText: string;
};

const GetGoodsBack: React.FC<GetGoodsBackModalProps> = (
  props: GetGoodsBackModalProps
) => {
  const {
    visible,
    onCancel,
    onOk,
    text,
    title,
    icon,
    okText,
    cancelText,
    setCancelReason,
  } = props;

  //mock api, delete when api avaiable
  const reasons = [
    "Khách không thích",
    "Không đúng size",
    "Văn vở vl",
    "Không giao được",
  ];
  //

  const handleReasonSelected = (value: any) => {
    setCancelReason(value);
  };
  return (
    <Modal
      onCancel={onCancel}
      onOk={onOk}
      visible={visible}
      centered
      okText={okText}
      cancelText={cancelText}
      title={[
        <div key="1">
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
            <div
              className="orders-cancel-option"
              style={{ margin: 0, padding: 0 }}
            >
              <span>Vui lòng chọn lý do hủy giao hàng</span>
              <Select
                placeholder="Lý do trả hàng"
                onChange={(value) => handleReasonSelected(value)}
              >
                {reasons?.map((reason, index) => (
                  <Select.Option key={index} value={reason}>
                    {reason}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>,
      ]}
      width={600}
      className="saleorder-modal-config"
    ></Modal>
  );
};

export default GetGoodsBack;
