import { Modal } from "antd";

type ConfirmConnectProductModalProps = {
  isVisible: boolean;
  isLoading: boolean;
  okConfirmConnectModal: () => void;
  cancelConfirmConnectModal: () => void;
};


const ConfirmConnectProductModal: React.FC<ConfirmConnectProductModalProps> = (
  props: ConfirmConnectProductModalProps
) => {
  
  const {
    isVisible,
    isLoading,
    okConfirmConnectModal,
    cancelConfirmConnectModal,
  } = props;


  const onOk = () => {
    okConfirmConnectModal();
  }

  const onCancel = () => {
    cancelConfirmConnectModal();
  };
  

  return (
    <Modal
      width="600px"
      visible={isVisible}
      title="Xác nhận ghép nối sản phẩm"
      okText="Đồng ý"
      cancelText="Hủy"
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={isLoading}
    >
      <div>
        <div>Giá bán sàn và giá bán Yody đang chênh lệch.</div>
        <div>Bạn có chắc chắn muốn ghép nối sản phẩm không?</div>
      </div>
    </Modal>
  );
};

export default ConfirmConnectProductModal;
