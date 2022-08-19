import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { showSuccess, showWarning } from "utils/ToastUtils";
import excelIcon from "assets/icon/icon-excel.svg";
import { isNullOrUndefined } from "utils/AppUtils";
import BaseResponse from "base/base.response";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

import { importFileAction } from "domain/actions/marketing/marketing.action";
import { getImportFileProgressService } from "service/marketing/marketing.service";
import ProgressImportFileModal from "screens/marketing/campaign/campaign-create/ProgressImportFileModal";

type CampaignImportFileType = {
  importFileTemplate: string;
  campaignDetail: any;
  onCancel: () => void;
  onOk: () => void;
};

const CampaignImportFile: React.FC<CampaignImportFileType> = (props: CampaignImportFileType) => {
  const { importFileTemplate, campaignDetail, onOk, onCancel } = props;

  const dispatch = useDispatch();

  const [isVisibleImportModal, setIsVisibleImportModal] = useState(true);
  const [fileList, setFileList] = useState<Array<File>>([]);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState<boolean>(false);
  const [importProgressPercent, setImportProgressPercent] = useState<number>(0);
  const [processCode, setProcessCode] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isVisibleExitImportCustomerModal, setIsVisibleExitImportCustomerModal] =
    useState<boolean>(false);


  /** upload customer file */
  const beforeUploadFile = useCallback((file) => {
    const isExcelFile =
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    if (!isExcelFile) {
      showWarning("Vui lòng chọn đúng định dạng file excel .xlsx .xls");
      return Upload.LIST_IGNORE;
    } else {
      setFileList([file]);
      return false;
    }
  }, []);

  const onRemoveFile = (file: any) => {
    setFileList([]);
  };

  const ImportFileCallback = (response: any) => {
    setIsVisibleImportModal(false);
    if (response && response.process_id) {
      setProcessCode(response.process_id);
      setIsVisibleProgressModal(true);
      setIsDownloading(true);
    } else {
      onCancel && onCancel();
    }
  };

  const onOkImportModal = () => {
    if (fileList?.length) {
      const queryParams: any = {
        file: fileList[0],
        campaignId: campaignDetail.id,
      };
      dispatch(importFileAction(queryParams, ImportFileCallback));
    } else {
      showWarning("Vui lòng chọn file!");
    }
  };

  const onCancelImportModal = () => {
    setIsVisibleImportModal(false);
    onCancel && onCancel();
  };

  const resetProgress = () => {
    setProcessCode(null);
    setImportProgressPercent(0);
    setProgressData(null);
  };

  const getProgressImportFile = useCallback(() => {
    let getImportProgressPromise: Promise<BaseResponse<any>> =
      getImportFileProgressService(processCode);

    Promise.all([getImportProgressPromise]).then((responses) => {
      responses.forEach((response: any) => {
        if (!isNullOrUndefined(response.total)) {
          const processData = response;
          const progressCount = processData.total_created + processData.total_error;
          setProgressData(processData);
          if (processData.finish) {
            setImportProgressPercent(100);
            setProcessCode(null);
            setIsDownloading(false);
            showSuccess("Tải file lên thành công!");
            // lỗi api
            // if (!processData.api_error){
            //   showSuccess("Tải file lên thành công!");
            // } else {
            //   resetProgress();
            //   setIsVisibleProgressModal(false);
            //   showError(processData.api_error);
            // }
          } else {
            const percent = Math.floor((progressCount / processData.total) * 100);
            setImportProgressPercent(percent);
          }
        }
      });
    });
  }, [processCode]);

  useEffect(() => {
    if (importProgressPercent === 100 || !processCode) {
      return;
    }
    getProgressImportFile();
    const getFileInterval = setInterval(getProgressImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [getProgressImportFile, importProgressPercent, processCode]);

  const onOKProgressImportCustomer = () => {
    resetProgress();
    setIsVisibleProgressModal(false);
    onOk && onOk();
  };

  const onCancelProgressImportCustomer = () => {
    setIsVisibleExitImportCustomerModal(true);
  };

  const onCancelExitImportCustomerModal = () => {
    setIsVisibleExitImportCustomerModal(false);
  };

  const onOkExitImportCustomerModal = () => {
    setIsVisibleExitImportCustomerModal(false);
    onOKProgressImportCustomer();
  };

  const checkDisableOkButton = useCallback(() => {
    return !fileList.length;
  }, [fileList.length]);
  // end upload customer file
  /** upload customer file */

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
            <div>
              <div><b>File mẫu: </b></div>
              <a href={importFileTemplate} download="Import_Transfer">
                <img src={excelIcon} alt="" style={{ paddingRight: 4 }} />
                {"Tải file danh sách khách hàng mẫu (.xlsx)"}
              </a>
            </div>
          </Typography.Text>
          <div style={{ marginTop: "20px", marginBottom: "5px" }}>
            <b>Tải file lên</b>
          </div>
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

      {isVisibleProgressModal && (
        <ProgressImportFileModal
          visible={isVisibleProgressModal}
          onCancel={onCancelProgressImportCustomer}
          onOk={onOKProgressImportCustomer}
          progressData={progressData}
          progressPercent={importProgressPercent}
          isDownloading={isDownloading}
        />
      )}

      {isVisibleExitImportCustomerModal && (
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
              <strong style={{ fontSize: 16 }}>
                Bạn có chắc chắn muốn hủy tải file lên không?
              </strong>
              <div style={{ fontSize: 14 }}>
                Hệ thống sẽ dừng việc tải file khách hàng lên. <br /> Các khách hàng đã tải thành
                công sẽ được thêm vào danh sách khách hàng"
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CampaignImportFile;
