import { useState } from "react";
import { Modal } from "antd";
import CustomTable from "component/table/CustomTable";

type ConfirmConnectProductModalProps = {
  isVisible: boolean;
  isLoading: boolean;
  dataSource: any;
  okConfirmConnectModal: () => void;
  cancelConfirmConnectModal: () => void;
};


const ConfirmConnectProductModal: React.FC<ConfirmConnectProductModalProps> = (
  props: ConfirmConnectProductModalProps
) => {
  
  const {
    isVisible,
    isLoading,
    dataSource,
    okConfirmConnectModal,
    cancelConfirmConnectModal,
  } = props;

  const onOk = () => {
    okConfirmConnectModal();
  }

  const onCancel = () => {
    cancelConfirmConnectModal();
  };

  const [columns] = useState<any>([
    {
      title: "STT",
      align: "center",
      width: "13%",
      key: "1",
      render: (l: any, v: any, i: any) => {
        return (
          <div>{i + 1}</div>
        );
      },
    },
    {
      title: "Nội dung",
      key: "2",
      render: (item: any, v: any, i: any) => {
        return (
          <div>
            Sản phẩm <b>{item.core_variant}</b> lệch giá
          </div>
        );
      },
    }
  ]);

  return (
    <Modal
      width="600px"
      visible={isVisible}
      title="Cảnh báo"
      okText="Tiếp tục"
      cancelText="Thoát"
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={isLoading}
      cancelButtonProps={{ disabled: isLoading }}
      closable={!isLoading}
      maskClosable={false}
    >
      <CustomTable
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ y: 300 }}
      />
    </Modal>
  );
};

export default ConfirmConnectProductModal;
