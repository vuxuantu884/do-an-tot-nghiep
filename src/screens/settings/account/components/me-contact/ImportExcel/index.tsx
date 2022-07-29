import { Button, Col, Modal, Row, Typography, Upload } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { showError } from "utils/ToastUtils";
import excelIcon from "assets/icon/icon-excel.svg";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { ConAcceptImport, STATUS_IMPORT_EXPORT } from "utils/Constants";
import { exportFileV2, getFileV2 } from "service/other/import.inventory.service";
import { HttpStatus } from "config/http-status.config";

export interface ModalImportProps {
  visible?: boolean;
  onOk: () => void;
  onCancel: () => void;
  title: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
}

const ConExportImportUser = {
  EXPORT: "TYPE_DOWNLOAD_FILE_IMPORT_ACCOUNT",
  IMPORT: "TYPE_DOWNLOAD_FILE_IMPORT_ACCOUNT",
};

type process = {
  total: number;
  processed: number;
  success: number;
  error: number;
};

const ImportExcel: React.FC<ModalImportProps> = (props: ModalImportProps) => {
  const { visible, onOk, onCancel, title } = props;
  const [fileList, setFileList] = useState<Array<File>>([]);
  const [errorData, setErrorData] = useState<Array<any>>([]);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.NONE);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [progressData, setProgressData] = useState<process>({
    processed: 0,
    success: 0,
    error: 0,
    total: 0,
  });

  const resetFile = () => {
    setFileList([]);
    setProgressData({
      processed: 0,
      success: 0,
      error: 0,
      total: 0,
    });
    setErrorData([]);
  };

  const onRemoveFile = () => {
    resetFile();
  };

  const ActionImport = {
    Ok: useCallback(() => {
      resetFile();
      onOk();
    }, [onOk]),
    Cancel: useCallback(() => {
      setStatusExport(STATUS_IMPORT_EXPORT.NONE);
      resetFile();
      onCancel();
    }, [onCancel]),
    ExportTemplate: useCallback(
      (e: any) => {
        setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
        e.preventDefault();
        exportFileV2({
          type: ConExportImportUser.EXPORT,
        })
          .then((res) => {
            setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            if (res.code === HttpStatus.SUCCESS) {
              setListExportFile([...listExportFile, res.data.code]);
            }
          })
          .catch((e: any) => {
            setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
            showError("Có lỗi xảy ra, vui lòng thử lại sau");
          });
      },
      [listExportFile],
    ),
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      resetFile();
      const typeExcel = file.type === ConAcceptImport;
      if (!typeExcel) {
        showError("Chỉ chọn file excel");
      }
      setFileList([file]);
      return typeExcel || Upload.LIST_IGNORE;
    },
  };

  const checkDisableOkButton = useCallback(() => {
    return !fileList.length;
  }, [fileList.length]);

  const checkExportFile = useCallback(() => {
    setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
    let getFilePromises = listExportFile.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "FINISH") {
            setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = listExportFile.filter((item) => {
              return item !== fileCode;
            });
            var downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";

            downLoad.click();
            setListExportFile(newListExportFile);
          } else if (response.data && response.data.status === "ERROR") {
            setStatusExport(STATUS_IMPORT_EXPORT.ERROR);
            showError(response.data.message);
          }
        }
      });
    });
  }, [listExportFile]);

  useEffect(() => {
    if (
      listExportFile.length === 0 ||
      statusExport === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusExport === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [checkExportFile, listExportFile.length, statusExport]);

  return (
    <Modal
      onCancel={ActionImport.Cancel}
      onOk={ActionImport.Ok}
      width={650}
      centered
      visible={visible}
      title={title}
      okText="Nhập file"
      cancelText="Hủy bỏ"
      okButtonProps={{ disabled: checkDisableOkButton() }}
    >
      <StyledProgressDownloadModal>
        <Typography.Text>
          <img src={excelIcon} alt="" />{" "}
          <a href="/" onClick={ActionImport.ExportTemplate}>
            file import người dùng mẫu (.xlsx)
          </a>
        </Typography.Text>
        {statusExport !== STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS ? (
          <div>
            <div style={{ marginTop: "20px", marginBottom: "5px" }}>
              <b>Tải file lên</b>
            </div>
            <Upload onRemove={onRemoveFile} maxCount={1} {...uploadProps} accept={ConAcceptImport}>
              <Button icon={<UploadOutlined />}>Chọn file</Button>
            </Upload>
          </div>
        ) : (
          <Row justify={"center"}>
            <Col span={24}>
              <Row justify={"center"}>
                <LoadingOutlined style={{ fontSize: "78px", color: "#E24343" }} />
              </Row>
              <Row justify={"center"}>
                <h2 style={{ padding: "10px 30px" }}>Đang tải file...</h2>
              </Row>
            </Col>
          </Row>
        )}
        {fileList.length > 0 && (
          <div>
            <div className="progress-body" style={{ marginTop: "30px" }}>
              <div className="progress-count">
                <div>
                  <div>Tổng cộng</div>
                  <div className="total-count">
                    {isNullOrUndefined(progressData?.total) ? (
                      "--"
                    ) : (
                      <NumberFormat
                        value={progressData?.total}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <div>Đã xử lý</div>
                  <div style={{ fontWeight: "bold" }}>
                    {isNullOrUndefined(progressData?.processed) ? (
                      "--"
                    ) : (
                      <NumberFormat
                        value={progressData?.processed}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <div>Thành công</div>
                  <div className="total-updated">
                    {isNullOrUndefined(progressData?.success) ? (
                      "--"
                    ) : (
                      <NumberFormat
                        value={progressData?.success}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    )}
                  </div>
                </div>

                <div>
                  <div>Lỗi</div>
                  <div className="total-error">
                    {isNullOrUndefined(progressData?.error) ? (
                      "--"
                    ) : (
                      <NumberFormat
                        value={progressData?.error}
                        displayType={"text"}
                        thousandSeparator={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            {errorData?.length ? (
              <div className="error-orders">
                <div className="title">Chi tiết lỗi:</div>
                <div className="error_message">
                  <div style={{ backgroundColor: "#F5F5F5", padding: "20px 30px" }}>
                    <ul style={{ color: "#E24343" }}>
                      {errorData.map((error, index) => (
                        <li key={index} style={{ marginBottom: "5px" }}>
                          <span style={{ fontWeight: 500 }}>{error.split(":")[0]}</span>
                          <span>:</span>
                          <span>{error.split(":")[1]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}
      </StyledProgressDownloadModal>
    </Modal>
  );
};

export default ImportExcel;
