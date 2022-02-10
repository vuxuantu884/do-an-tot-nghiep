import { Button, Form, Modal } from "antd";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import React, { useEffect, useState } from "react";
import { StyledComponent } from "./styles";

import { FormInstance } from "antd";
import { CustomerGroupPermission } from "config/permissions/customer.permission";
import useAuthorization from "hook/useAuthorization";

export type modalActionType = "create" | "edit" | "delete" | "onlyedit";

export interface CustomModalFormModel {
  visible: boolean;
  modalAction: modalActionType;
  formItem: any;
  form: FormInstance<any>;
  moreFormArguments?: any;
}
export interface CustomModalType {
  createBtnTitle: string | null;
  visible: boolean;
  onCreate: (formValue: any) => void;
  onEdit: (formValue: any) => void;
  onDelete: (formValue: any) => void;
  onCancel: (formValue: any) => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  modalAction: modalActionType;
  modalTypeText: string;
  deletedItemTitle?: string;
  updateBtnTitle?: string;
  componentForm: React.FC<CustomModalFormModel>;
  formItem: any;
  moreFormArguments?: any;
}


const updateCustomerGroupPermission = [CustomerGroupPermission.groups_update];

const CustomModal = (props: CustomModalType) => {
  const {
    createBtnTitle,
    visible,
    onCreate,
    onEdit,
    onDelete,
    onCancel,
    modalAction,
    deletedItemTitle,
    updateBtnTitle,
    formItem,
    modalTypeText,
    componentForm: ComponentForm,
    ...args
  } = props;
  const [form] = Form.useForm();

  const [allowUpdateCustomerGroup] = useAuthorization({
    acceptPermissions: updateCustomerGroupPermission,
    not: false,
  });

  const isCreateModal = modalAction === "create";
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const [visibleForm, setVisibleForm] = useState(false);
  const formAction = {
    exit: () => {
      setVisibleForm(false);
      onCancel(form.getFieldsValue());
    },
    create: () => {
      form.validateFields().then(() => {
        setVisibleForm(false);
        onCreate(form.getFieldsValue());
      });
    },
    delete: () => {
      setVisibleForm(false);
      onDelete(form.getFieldsValue());
      setIsShowConfirmDelete(false);
    },
    edit: () => {
      form.validateFields().then(() => {
        setVisibleForm(false);
        onEdit(form.getFieldsValue());
      });
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
            <Button
              key="submit"
              type="primary"
              onClick={() => formAction.create()}
            >
              {createBtnTitle}
            </Button>
          </div>
        );
      }
      return (
        <div className="footer footer__edit">
          <div className="footer__left">
            {/* <Button
              key="delete"
              type="primary"
              danger
              onClick={() => setIsShowConfirmDelete(true)}
            >
              Xóa
            </Button> */}
          </div>

          <div className="footer__right">
            <Button key="exit" type="default" onClick={() => formAction.exit()}>
              Thoát
            </Button>
            {allowUpdateCustomerGroup &&
              <Button
                key="save"
                type="primary"
                onClick={() => formAction.edit()}
              >
                {updateBtnTitle}
              </Button>
            }
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
      width="600px"
      className="modal-confirm-customer"
      visible={visible}
      okText="Thêm"
      cancelText="Thoát"
      title={
        isCreateModal
          ? `Thêm mới ${modalTypeText}`
          : `Cập nhật ${modalTypeText}`
      }
      footer={renderModalFooter()}
      onCancel={formAction.exit}
    >
      <StyledComponent>
        <ComponentForm
          formItem={formItem}
          modalAction={modalAction}
          form={form}
          visible={visibleForm}
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
