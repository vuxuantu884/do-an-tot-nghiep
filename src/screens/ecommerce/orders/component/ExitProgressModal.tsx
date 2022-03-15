import React from "react";
import { Modal,} from "antd";

type ExitProgressModalType = {
  visible: boolean;
  onOk: (data: any) => void;
  onCancel: () => void;
  exitProgressContent: any;
};


const ExitProgressModal: React.FC<ExitProgressModalType> = (
  props: ExitProgressModalType
) => {
  const { visible, onOk, onCancel, exitProgressContent } = props;


  return (
    <Modal
      width="600px"
      centered
      visible={visible}
      title=""
      maskClosable={false}
      onCancel={onCancel}
      okText="Đồng ý"
      cancelText="Hủy"
      onOk={onOk}
    >
      <>
        {exitProgressContent}
      </>
    </Modal>
    
  );
};

export default ExitProgressModal;
