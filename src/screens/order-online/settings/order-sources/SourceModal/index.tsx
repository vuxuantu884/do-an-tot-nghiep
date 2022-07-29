import { Button, Form, Modal } from "antd";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { CustomModalType } from "model/modal/modal.model";
import React, { useEffect, useState } from "react";
import { StyledComponent } from "./styles";

const SourceModal = (props: CustomModalType) => {
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
    createText,
    updateText,
    ...args
  } = props;
  const [form] = Form.useForm();
  const isCreateModal = modalAction === "create";
  const isOnlyEdit = modalAction === "onlyedit";
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const [visibleForm, setVisibleForm] = useState(false);
  const formAction = {
    exit: () => {
      setVisibleForm(false);
      onCancel(form.getFieldsValue());
    },
    delete: () => {
      setVisibleForm(false);
      onDelete(form.getFieldsValue());
      setIsShowConfirmDelete(false);
    },
  };

  useEffect(() => {
    if (visible) {
      setVisibleForm(visible);
    }
  }, [visible]);

  const renderModalFooter = () => {
    const content = () => {
      if (isCreateModal) {
        return (
          <div className="footer footer__create">
            <Button key="exit" type="default" onClick={() => formAction.exit()}>
              Thoát
            </Button>
            <Button key="submit" type="primary" onClick={() => form.submit()}>
              {createText ?? "Thêm"}
            </Button>
          </div>
        );
      }
      return (
        <div className="footer footer__edit">
          <div className="footer__left">
            {!isOnlyEdit && (
              <Button
                key="delete"
                type="primary"
                danger
                onClick={() => setIsShowConfirmDelete(true)}
              >
                Xóa
              </Button>
            )}
          </div>
          <div className="footer__right">
            <Button key="exit" type="default" onClick={() => formAction.exit()}>
              Đóng
            </Button>
            <Button key="save" type="primary" onClick={() => form.submit()}>
              {updateText ?? "Lưu"}
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
          Bạn có chắc chắn muốn xóa "<strong className="break-word">{deletedItemTitle}</strong>" ?
        </React.Fragment>
      );
    }
  };

  return (
    <Modal
      width="680px"
      className="modal-confirm"
      visible={visible}
      okText="Thêm"
      cancelText="Thoát"
      title={isCreateModal ? `Thêm ${modalTypeText}` : `Cập nhật ${modalTypeText}`}
      footer={renderModalFooter()}
      onCancel={formAction.exit}
    >
      <StyledComponent>
        <ComponentForm
          formItem={formItem}
          modalAction={modalAction}
          form={form}
          visible={visibleForm}
          onEdit={onEdit}
          onCreate={onCreate}
          setVisibleForm={setVisibleForm}
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

export default SourceModal;
