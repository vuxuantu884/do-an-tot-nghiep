import { Modal } from "antd";

type ModalConfirmProps = {
  visible?: boolean,
  onOk?: () => void,
  onCancel?: () => void,
  title?: string|React.ReactNode,
  subTitle?: string|React.ReactNode,
  icon?: React.ReactNode,
  okText?: string,
  cancelText?: string,
  bgIcon?: string,
  colorIcon?: string,
}

const ModalConfirm: React.FC<ModalConfirmProps> = (props: ModalConfirmProps) => {
  const {visible, onOk, onCancel, title, subTitle, icon, okText, cancelText, colorIcon, bgIcon} = props;
  return (
    <Modal width="35%" className="modal-confirm" okText={okText?okText:"Có"} cancelText={cancelText?cancelText:"Không"} visible={visible} onOk={onOk} onCancel={onCancel}>
      <div className="modal-confirm-container">
        <div>
          {icon && (
            <div style={{color: colorIcon, background: bgIcon}} className="modal-confirm-icon">
              {icon}
            </div>
          )}
        </div>
        <div className="modal-confirm-right margin-left-20">
          <div className="modal-confirm-title">{title}</div>
          <i className="modal-confirm-sub-title">{subTitle}</i>
        </div>
      </div>
    </Modal>
  )
}

export default ModalConfirm;
