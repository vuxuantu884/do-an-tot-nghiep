import React, {useCallback,useState} from "react";
import { Button, Modal, Typography, Upload,} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {showWarning} from "utils/ToastUtils";
import excelIcon from "assets/icon/icon-excel.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import ProgressImportCustomerIntoAdjustmentModal from "./ProgressImportCustomerIntoAdjustmentModal";

type ImportCustomerIntoAdjustmentFileType = {
  isVisibleImportModal: boolean;
  onOkImportModal: () => void;
  onCancelImportModal: () => void;
  onOKProgressModal: () => void;
  setFileImportCustomerAdjustment: (file: any) => void;
  progressData: any;
  isVisibleProgressModal: boolean;
  importProgressPercent: number;
  isDownloading: boolean;
};

const exampleCustomerFile = 'https://yody-prd-media.s3.ap-southeast-1.amazonaws.com/files/loyalty-import/PointAdjustmentExample.xlsx';

const ImportCustomerIntoAdjustmentFile: React.FC<ImportCustomerIntoAdjustmentFileType> = (
  props: ImportCustomerIntoAdjustmentFileType
) => {
  const {
    isVisibleImportModal,
    onOkImportModal,
    onCancelImportModal,
    onOKProgressModal,
    setFileImportCustomerAdjustment,
    progressData,
    isVisibleProgressModal,
    importProgressPercent,
    isDownloading,
  } = props;

  // handle upload customer adjustment file
  const [uploadedFileList, setUploadedFileList] = useState<Array<File>>([]);
  const [isVisibleExitImportCustomerModal, setIsVisibleExitImportCustomerModal] = useState<boolean>(false);

  const beforeUploadFile = useCallback((file) => {
    const isExcelFile = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
    if (!isExcelFile) {
      showWarning('Vui lòng chọn đúng định dạng file excel .xlsx .xls');
      return Upload.LIST_IGNORE;
    } else {
      setUploadedFileList([file]);
      return false;
    }
  }, []);

  const onRemoveFile = (file: any) => {
    setUploadedFileList([]);
  }
  // end handle upload customer adjustment file

  // handle import modal
  const handleOkImportModal = () => {
    setFileImportCustomerAdjustment(uploadedFileList);
    onOkImportModal && onOkImportModal();
  }

  const handleCancelImportModal = () => {
    onCancelImportModal && onCancelImportModal();
  }

  const checkDisableOkButton = useCallback(() => {
    return uploadedFileList.length === 0;
  }, [uploadedFileList.length]);
  // end handle import modal

  // handle cancel process
  const onCancelProgressImportCustomer = () => {
    setIsVisibleExitImportCustomerModal(true);
  }

  const onCancelExitImportCustomerModal = () => {
    setIsVisibleExitImportCustomerModal(false);
  }

  const onOkExitImportCustomerModal = () => {
    setIsVisibleExitImportCustomerModal(false);
    onOKProgressModal && onOKProgressModal();
  }
  

  return (
    <div>
      <Modal
        width="600px"
        centered
        visible={isVisibleImportModal}
        title="Nhập file"
        maskClosable={false}
        okText="Nhập file"
        cancelText="Hủy"
        onOk={handleOkImportModal}
        okButtonProps={{ disabled: checkDisableOkButton() }}
        onCancel={handleCancelImportModal}
      >
        <div>
          <Typography.Text>
            <strong>File mẫu: </strong>
            <img src={excelIcon} alt="" /> <a href={exampleCustomerFile} download="Import_Transfer">PointAdjustmentExample(.xlsx)</a>
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

      {isVisibleProgressModal &&
        <ProgressImportCustomerIntoAdjustmentModal
          visible={isVisibleProgressModal}
          onCancel={onCancelProgressImportCustomer}
          onOk={onOKProgressModal}
          progressData={progressData}
          progressPercent={importProgressPercent}
          isDownloading={isDownloading}
        />
      }

      {isVisibleExitImportCustomerModal &&
        <Modal
          width="600px"
          centered
          visible={isVisibleExitImportCustomerModal}
          title=""
          maskClosable={false}
          onCancel={onCancelExitImportCustomerModal}
          okText="Đồng ý"
          cancelText="Hủy"
          onOk={onOkExitImportCustomerModal}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={DeleteIcon} alt="" />
            <div style={{ marginLeft: 15 }}>
              <strong style={{ fontSize: 16 }}>Bạn có chắc chắn muốn hủy điều chỉnh điểm cho các khách hàng theo file tải lên không?</strong>
            </div>
          </div>
        </Modal>
      }
    </div>
  );
};

export default ImportCustomerIntoAdjustmentFile;
