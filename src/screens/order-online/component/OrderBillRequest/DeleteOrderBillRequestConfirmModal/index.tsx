import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";

type PropTypes = {
  isVisibleDeleteOrderBillRequestConfirmModal: boolean;
  handleCancel: () => void;
  handleDeleteExportRequest: () => void;
};

function DeleteOrderBillRequestConfirmModal(props: PropTypes) {
  const { isVisibleDeleteOrderBillRequestConfirmModal, handleCancel, handleDeleteExportRequest } =
    props;

  return (
    <ModalDeleteConfirm
      visible={isVisibleDeleteOrderBillRequestConfirmModal}
      onOk={() => {
        handleDeleteExportRequest();
      }}
      onCancel={() => handleCancel()}
      title="Bạn có chắc chắn muốn xóa “Thông tin xuất hóa đơn”?"
      subTitle="Toàn bộ thông tin xuất hóa đơn sẽ bị xóa và bạn có thể phải thêm lại."
      okText="Đồng ý"
      cancelText="Hủy"
    />
  );
}

export default DeleteOrderBillRequestConfirmModal;
