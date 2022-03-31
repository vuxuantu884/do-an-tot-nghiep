import { Modal } from "antd";
import { useEffect, useState } from "react";
import './error-logs.scss';
import successIcon from 'assets/icon/success.svg';
import errorIcon from 'assets/icon/error.svg';

type ModalProps = {
  visible?: boolean
  onOk?: () => void
  okText?: string;
  errors: string | undefined
  onCancel?: () => void
  success: number
  fail: number
};

const ErrorLogs = (props: ModalProps) => {
  const { visible, onOk, okText, errors, onCancel, success, fail } = props
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
      width="600px"
      okText={okText ? okText : "Thoát"}
      visible={visible}
      onOk={onOk}
      cancelButtonProps={{ style: { display: 'none' } }}
      title="Danh sách lỗi"
      onCancel={onCancel}
      className="error-logs-modal"
    >
      <div className="error-logs-body">
        <div className="error-summary">
          <img src={successIcon} style={{marginRight: '6px'}} alt="success" /><span>Có {success} mã thẻ thành công</span>
        </div>
        <div className="error-summary">
          <img src={errorIcon} style={{marginRight: '6px'}} alt="success" /><span>Có {fail} mã thẻ bị lỗi</span>
        </div>
        <div className="error-logs-body__header">
          <div className="ordinal-number">STT</div>
          <div className="error-content">Nội dung lỗi</div>
        </div>
        <div className="error-logs-body__body">
          {
            errorObject && errorObject.length > 0 && errors?.split("\n").map((error, idx) => {
                // eslint-disable-next-line array-callback-return
              if (error === "") return;
              return (
                  <div className="release-error" key={idx}>
                    <div className="ordinal-number">{idx}</div>
                    <div style={{color: "red"}} className="error-content">{error}</div>
                  </div>
              )
              })
          }
          {
            (!errorObject || errorObject.length === 0) && (
              <div className="no-error">Không có bản ghi nào</div>
            )
          }
        </div>
        {/*<div style={{fontSize: 16, fontWeight: "bold", color: "#222222"}}>Nội dung lỗi</div>*/}
        {/*<div>*/}
        {/*{errors?.split("\n").map((item, index) => {*/}
        {/*  return <div>*/}
        {/*    <span>{index + 1}</span>*/}
        {/*    <span>{item}</span>*/}
        {/*  </div>;*/}
        {/*})}*/}
        {/*</div>*/}
      </div>
    </Modal>
  )
}

export default ErrorLogs;