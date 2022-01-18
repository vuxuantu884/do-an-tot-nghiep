import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, Progress, Typography, Upload,} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { showSuccess, showWarning } from "utils/ToastUtils";
import { importCustomerAction } from "domain/actions/customer/customer.action";
import excelIcon from "assets/icon/icon-excel.svg";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { isNullOrUndefined } from "utils/AppUtils";
import NumberFormat from "react-number-format";


type ImportCustomerFileType = {
  onCancel: () => void;
  onOk: () => void;
};

const exampleCustomerFile = 'https://np.cdn.yody.io/files/customer.xlsx';

const ImportCustomerFile: React.FC<ImportCustomerFileType> = (
  props: ImportCustomerFileType
) => {
  const { onOk, onCancel } = props;
  
  const dispatch = useDispatch();

  const [isVisibleImportModal, setIsVisibleImportModal] = useState(true);
  const [fileList, setFileList] = useState<Array<File>>([]);
  const [isVisibleResultModal, setIsVisibleResultModal] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>();
  const [errorData, setErrorData] = useState<Array<any>>([]);

  // upload customer file
  const beforeUploadFile = useCallback((file) => {
    const isExcelFile = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
    if (!isExcelFile) {
      showWarning('Vui lòng chọn đúng định dạng file excel .xlsx .xls');
      return Upload.LIST_IGNORE;
    } else {
      setFileList([file]);
      return false;
    }
  }, []);

  const onRemoveFile = (file: any) => {
    setFileList([]);
  }

  const callbackImportCustomer = (response: any) => {
    setIsVisibleImportModal(false);
    if (!!response) {
      showSuccess("Tải file lên thành công!");
      setUploadResult(response.process);
      setErrorData(response.errors);
      setIsVisibleResultModal(true);
    } else {
      onCancel && onCancel();
    }
  }
  
  const onOkImportModal = () => {
    if (fileList?.length) {
      dispatch(importCustomerAction(fileList[0], callbackImportCustomer));
    } else {
      showWarning("Vui lòng chọn file!")
    }
  }

  const onCancelImportModal = () => {
    setIsVisibleImportModal(false);
    onCancel && onCancel();
  }
  
  const checkDisableOkButton = useCallback(() => {
    return !fileList.length;
  }, [fileList.length]);
  // end upload customer file

  // result upload customer file
  const onCloseResultModal = () => {
    setIsVisibleResultModal(false);
    if (uploadResult.error === uploadResult.total_process) {
      onCancel && onCancel();
    } else {
      onOk && onOk();
    }
  }

  // end result upload customer file


  return (
    <div>
      <Modal
        width="600px"
        centered
        visible={isVisibleImportModal}
        title="Nhập file"
        maskClosable={false}
        okText="Tải file lên"
        cancelText="Hủy"
        onOk={onOkImportModal}
        okButtonProps={{ disabled: checkDisableOkButton() }}
        onCancel={onCancelImportModal}
      >
        <div>
          <Typography.Text>
            <img src={excelIcon} alt="" /> <a href={exampleCustomerFile} download="Import_Transfer">file import khách hàng mẫu (.xlsx)</a>
          </Typography.Text>
          <div style={{ marginTop: "20px", marginBottom: "5px" }}><b>Tải file lên</b></div>
          <Upload
            beforeUpload={beforeUploadFile}
            onRemove={onRemoveFile}
            maxCount={1}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </div>
      </Modal>

      <Modal
        width="600px"
        centered
        visible={isVisibleResultModal}
        title="Nhập file"
        maskClosable={false}
        okText="Xác nhận"
        cancelText="Hủy"
        onOk={onCloseResultModal}
        onCancel={onCloseResultModal}
      >
        <StyledProgressDownloadModal>
          <div className="progress-body">
            <div className="progress-count">
              <div>
                <div>Tổng cộng</div>
                <div className="total-count">
                  {isNullOrUndefined(uploadResult?.total_process) ?
                    "--" :
                    <NumberFormat
                      value={uploadResult?.total_process}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  }
                </div>
              </div>
              
              <div>
                <div>Đã xử lý</div>
                <div className="total-count">
                  {isNullOrUndefined(uploadResult?.processed) ?
                    "--" :
                    <NumberFormat
                      value={uploadResult?.processed}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  }
                </div>
              </div>
              
              <div>
                <div>Thành công</div>
                <div className="total-updated">
                  {isNullOrUndefined(uploadResult?.success) ?
                    "--" :
                    <NumberFormat
                      value={uploadResult?.success}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  }
                </div>
              </div>
              
              <div>
                <div>Lỗi</div>
                <div className="total-error">
                  {isNullOrUndefined(uploadResult?.error) ?
                    "--" :
                    <NumberFormat
                      value={uploadResult?.error}
                      displayType={"text"}
                      thousandSeparator={true}
                    />
                  }
                </div>
              </div>
            </div>

            <Progress
              status="normal"
              percent={uploadResult ?
                ((uploadResult.success + uploadResult.error) / uploadResult.total_process * 100)
                : 100
              }
              style={{ marginTop: 20 }}
            />
          </div>

          {errorData.length ?
            <div className="error-orders">
              <div className="title">Chi tiết lỗi:</div>
              <ul style={{ backgroundColor: "#F5F5F5", padding: "20px 30px", color: "#E24343" }}>
                {errorData.map((error, index) => (
                  <li key={index} style={{ marginBottom: "5px"}}>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
            : <></>
          }
        </StyledProgressDownloadModal>
      </Modal>
    </div>
  );
};

export default ImportCustomerFile;
