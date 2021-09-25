import { Modal } from "antd";
import { useEffect, useState } from "react";
import './error-logs.scss';

type ModalProps = {
  visible?: boolean;
  onOk?: () => void;
  okText?: string;
  errors: string | undefined
  onCancel?: () => void;
};

const ErrorLogs = (props: ModalProps) => {
  const { visible, onOk, okText, errors, onCancel } = props
  const [errorObject, setErrorObject] = useState<Array<string>>([])

  useEffect(() => {
    if (errors) {
      try {
        setErrorObject(JSON.parse(errors))
      } catch (error) {
        try {
          setErrorObject([errors])
        } catch (error) {
        }
      }
    } else {
      setErrorObject([])
    }
  }, [errors])

  return (
    <Modal
      width="35%"
      okText={okText ? okText : "Có"}
      visible={visible}
      onOk={onOk}
      cancelButtonProps={{ style: { display: 'none' } }}
      title="Danh sách lỗi"
      onCancel={onCancel}
    >
      <div className="error-logs-modal">
        {
          errorObject.map((error, idx) => (
            <div style={{margin: '8px'}} key={idx}>{error}</div>
          ))
        }
      </div>
    </Modal>
  )
}

export default ErrorLogs;