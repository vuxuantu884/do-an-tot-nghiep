import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { YDConfirmModalStyled } from "./style";
import Modal, { ModalProps } from "antd/lib/modal/Modal";
import React, { forwardRef, ReactNode, useImperativeHandle, useState } from "react";
import { EnumConfirmModalType } from "utils/Constants";

type CustomModalProps = {
  subTitle?: string;
  description: string | ReactNode;
  type?: "success" | "warning" | "error" | "info";
};

type YDConfirmModalProps = CustomModalProps & ModalProps;

export type YDConfirmHandle = {
  openModal: () => void;
  closeModal: () => void;
};

const YDConfirmModal: React.ForwardRefRenderFunction<YDConfirmHandle, YDConfirmModalProps> = (
  props,
  ref,
) => {
  const { subTitle, description, type, ...rest } = props;
  const [isVisible, setIsVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    openModal() {
      setIsVisible(true);
    },
    closeModal() {
      setIsVisible(false);
    },
  }));

  const renderIconByType = (type: string | undefined) => {
    let icon;
    switch (type) {
      case EnumConfirmModalType.SUCCESS:
        icon = <CheckCircleOutlined />;
        break;
      case EnumConfirmModalType.WARNING:
        icon = <WarningOutlined />;
        break;
      case EnumConfirmModalType.INFO:
        icon = <BellOutlined />;
        break;
      case EnumConfirmModalType.ERROR:
        icon = <CloseCircleOutlined />;
        break;
      default:
        icon = <BellOutlined />;
        break;
    }
    return icon;
  };

  return (
    <Modal width={500} centered visible={isVisible} cancelText={`Hủy`} okText={`Đồng ý`} {...rest}>
      <YDConfirmModalStyled type={type}>
        <div className="modal-body">
          <div className="modal-icon">{renderIconByType(type)}</div>
          <div>
            <div className="modal-subtitle">
              <b>{subTitle}</b>
            </div>
            <div>{description}</div>
          </div>
        </div>
      </YDConfirmModalStyled>
    </Modal>
  );
};

export default forwardRef(YDConfirmModal);
