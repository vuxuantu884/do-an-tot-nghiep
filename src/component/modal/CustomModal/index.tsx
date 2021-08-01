import { Button, Form, Modal } from "antd";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { CustomModalType } from "model/modal/modal.model";
import React, { useState } from "react";
import { StyledComponent } from "./styles";

const CustomModal = (props: CustomModalType) => {
  const {
    visible,
    onCreate,
    onEdit,
    onDelete,
    onCancel,
    modalAction,
    deletedItemTitle,
    formItem,
    modalTypeText,
    componentForm: ComponentForm,
    ...args
  } = props;
  const [form] = Form.useForm();
  const isCreateModal = modalAction === "create";
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const formAction = {
    exit: () => {
      onCancel(form.getFieldsValue());
    },
    create: () => {
      onCreate(form.getFieldsValue());
    },
    delete: () => {
      onDelete(form.getFieldsValue());
    },
    edit: () => {
      onEdit(form.getFieldsValue());
    },
  };
  const renderModalFooter = () => {
    const content = () => {
      if (isCreateModal) {
        return (
          <div className="footer footer__create">
            <Button key="exit" type="default" onClick={() => formAction.exit()}>
              Thoát
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={() => formAction.create()}
            >
              Thêm
            </Button>
          </div>
        );
      }
      return (
        <div className="footer footer__edit">
          <div className="footer__left">
            <Button
              key="delete"
              type="primary"
              danger
              onClick={() => setIsShowConfirmDelete(true)}
            >
              Xóa
            </Button>
          </div>
          <div className="footer__right">
            <Button key="exit" type="default" onClick={() => formAction.exit()}>
              Thoát
            </Button>
            <Button key="save" type="primary" onClick={() => formAction.edit()}>
              Lưu
            </Button>
          </div>
        </div>
      );
    };
    return <StyledComponent>{content()}</StyledComponent>;
  };
  const renderConfirmDeleteSubtitle = () => {
    if (deletedItemTitle) {
      return (
        <React.Fragment>
          Bạn có chắc chắn muốn xóa "<strong>{deletedItemTitle}</strong>" ?
        </React.Fragment>
      );
    }
  };

  return (
    <Modal
      width="600px"
      className="modal-confirm"
      visible={visible}
      okText="Thêm"
      cancelText="Thoát"
      title={
        isCreateModal
          ? `Thêm mới ${modalTypeText}`
          : `Cập nhật ${modalTypeText}`
      }
      footer={renderModalFooter()}
      onCancel={onCancel}
    >
      <StyledComponent>
        <ComponentForm
          formItem={formItem}
          modalAction={modalAction}
          form={form}
          {...args}
        />
        <ModalDeleteConfirm
          visible={isShowConfirmDelete}
          onOk={() => formAction.delete()}
          onCancel={() => setIsShowConfirmDelete(false)}
          title="Xác nhận"
          subTitle={renderConfirmDeleteSubtitle()}
        />
      </StyledComponent>
    </Modal>
  );
};

export default CustomModal;
