import React, { useState } from "react";
import { Button, Modal, Typography, Upload,} from "antd";

import excelIcon from "assets/icon/icon-excel.svg";
import { UploadOutlined } from "@ant-design/icons";
import { showSuccess } from "utils/ToastUtils";
import { useDispatch } from "react-redux";
import { importCustomerAction } from "domain/actions/customer/customer.action";


type ImportCustomerFileType = {
  isVisibleImportCustomerFile: boolean;
  setIsVisibleImportCustomerFile: (visible: boolean) => void;
  onOk?: () => void;
  onCancel?: () => void;
};

const ImportCustomerFile: React.FC<ImportCustomerFileType> = (
  props: ImportCustomerFileType
) => {
  const { onOk, onCancel } = props;
  
  const dispatch = useDispatch();

  const [isVisibleImportModal, setIsVisibleImportModal] = useState(true);
  const [uploadFile, setUploadFile] = useState<File>();

  const exampleExcelFile = 'https://np.cdn.yody.io/files/customer.xlsx';

  const onUploadFile = (upload: any) => {
    setUploadFile(upload?.file);
  }

  const callbackImportCustomer = (data: any) => {
    console.log("callbackImportCustomer: ", data);
    showSuccess("Tải file lên thành công!")
    setIsVisibleImportModal(false);
    onOk && onOk();
  }
  
  const onOkImportModal = () => {
    dispatch(importCustomerAction(uploadFile, callbackImportCustomer));
  }

  const onCancelImportModal = () => {
    setIsVisibleImportModal(false);
    onCancel && onCancel();
  }
  

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
        okButtonProps={{ disabled: !uploadFile }}
        onCancel={onCancelImportModal}
      >
        <div>
          <Typography.Text> <img src={excelIcon} alt="" /> <a href={exampleExcelFile} download="Import_Transfer">file import khách hàng mẫu (.xls)</a> </Typography.Text>
          <div style={{ marginTop: "20px", marginBottom: "5px" }}><b>Tải file lên</b></div>
          <Upload
            beforeUpload={() => false}
            onChange={onUploadFile}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </div>
      </Modal>
    </div>
  );
};

export default ImportCustomerFile;
