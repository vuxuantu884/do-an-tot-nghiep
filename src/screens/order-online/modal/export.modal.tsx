import { Modal } from "antd";
import { useMemo } from "react";

type ExportModalProps = {
  visible: boolean;
  onCancel: (e: React.MouseEvent<HTMLElement>) => void;
  onOk: (e: React.MouseEvent<HTMLElement>) => void;
  type: string;
};

const ExportModal: React.FC<ExportModalProps> = (
  props: ExportModalProps
) => {
  const { visible, onCancel, onOk, type } = props;
  
  const text = useMemo(
    () => {
      switch (type) { 
        case "orders":
          return "đơn hàng"
        case "shipments":
          return "đơn giao hàng"
        case "returns":
          return "đơn trả hàng"
        default: break
      }
    },
    [type]
  );
  // const fields = useMemo(
  //   () => {
  //     switch (type) { 
  //       case "orders":
  //         return ['1', '2']
  //       case "shipments":
  //         return ['1', '2', '3']
  //       case "returns":
  //         return ['1', '2', '3', '4']
  //       default: break
  //     }
  //   },
  //   [type]
  // );
  return (
    <Modal
      onCancel={onCancel}
      onOk={onOk}
      visible={visible}
      centered
      okText="Xuất file"
      cancelText="Thoát"
      title={[
        <span style={{fontWeight: 600, fontSize: 16}}>Xuất file danh sách {text}</span>
      ]}
      width={600}
    >
        ok bae
    </Modal>
  );
};

export default ExportModal;

