import { Button, Col, List, Modal, Progress, Row, Typography, Upload } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import excelIcon from "assets/icon/icon-excel.svg";
import { DeleteOutlined, PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import { VariantResponse } from "model/product/product.model";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { UploadFile } from "antd/lib/upload/interface";
import { beforeUploadFile, EXCEL_FILE_TYPE_XLS, EXCEL_FILE_TYPE_XLSX, ImportStatuses } from "screens/inventory/helper";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { uploadFileApi } from "service/core/import.service";
import { HttpStatus } from "config/http-status.config";
import Text from "antd/lib/typography/Text";
import { ImportResponse } from "model/other/files/export-model";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import { showError, showWarning } from "utils/ToastUtils";

export interface ModalImportProps {
  visible?: boolean;
  onOk: (res: any) => void;
  onCancel: () => void;
  title: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  dataTable?: Array<VariantResponse>;
}

const ImportExcel: React.FC<ModalImportProps> = (props: ModalImportProps) => {
  const { visible, onOk, onCancel, title } = props;
  const [file, setFile] = useState<UploadFile | null>(null);
  const [url, setUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompletedImport, setIsCompletedImport] = useState<boolean>(false);
  const [dataProcess, setDataProcess] = useState<ImportResponse | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [dataError, setDataError] = useState<any>(null);
  const [dataUploadError, setDataUploadError] = useState<any>(null);

  const onChangeFile = useCallback((info) => {
    setFile(info.file);
  }, []);

  const onRemoveFile = () => {
    setFile(null);
    setUrl("");
  };

  const onCustomUpdateRequest = (options: UploadRequestOption) => {
    const { file } = options;
    let files: Array<File> = [];

    if (file instanceof File) {
      files.push(file);

      uploadFileApi(files, "import-transfer").then((res: any) => {
        if (res.code === HttpStatus.SUCCESS) {
          setUrl(res.data[0]);
        }
      });
    }
  };

  const downloadErrorDetail = (dataUploadError: any) => {
    if (!dataUploadError) return;
    let newDataUploadError = "";

    dataUploadError.forEach((item: any) => {
      newDataUploadError = newDataUploadError + item + "\n";
    });
    const downloadableLink = document.createElement("a");
    downloadableLink.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(newDataUploadError),
    );
    downloadableLink.download = "Log.txt";
    document.body.appendChild(downloadableLink);
    downloadableLink.click();
    document.body.removeChild(downloadableLink);
  };

  const checkImportFile = () => {
    BaseAxios.get(`${ApiConfig.IMPORT_EXPORT}/importing/v2/jobs/${fileId}`).then(
      (res: any) => {
        if (res.code !== HttpStatus.SUCCESS) {
          setFileId(null);
          if (res.errors?.length > 0) {
            showError(res.errors[0]);
          }
          return;
        }
        if (!res.data) {
          setFileId(null);
          return;
        }

        setData(res.data);
        setDataProcess(res.data);

        const newDataUpdateError =
          !res.data.messages || (res.data.messages && res.data.messages.length === 0)
            ? null
            : res.data.messages;
        downloadErrorDetail(newDataUpdateError);
        setDataUploadError(newDataUpdateError);
        if (res.data.status === ImportStatuses.ERROR) {
          setFileId(null);
          setIsLoading(false);
          return;
        }
        if (res.data.status !== ImportStatuses.FINISH) return;

        setIsLoading(false);
        setIsCompletedImport(true);
        setFileId(null);
      },
    );
  };

  useEffect(() => {
    if (!fileId) return;

    const getFileInterval = setInterval(checkImportFile, 2000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const importFile = () => {
    setIsLoading(true);
    if (!file) {
      setIsLoading(false);
      showWarning("Vui lòng chọn ít nhất một file.");
      return;
    }
    BaseAxios.post(`${ApiConfig.IMPORT_EXPORT}/importing/v2/jobs`, {
      type: "normal",
      module: "inventory_transfer",
      url
    })
      .then((res: any) => {
        if (res) {
          setDataError(res);
          setFileId(res.data);

          const newDataUpdateError =
            !res.data?.errors || (res.data?.errors && res.data?.errors.length === 0)
              ? null
              : res.data?.errors;

          downloadErrorDetail(newDataUpdateError);
          setDataUploadError(newDataUpdateError);
          setDataUploadError(newDataUpdateError);

          if (res.code !== HttpStatus.SUCCESS) {
            setIsLoading(false);
          }
        }
      })
      .catch((err) => {
        showError(err);
      });
  };

  const resetModal = () => {
    setIsLoading(false);
    setFile(null);
    setIsCompletedImport(false);
    setDataProcess(null);
    setFileId(null);
    setData(null);
    setDataError(null);
    setDataUploadError(null);
  };

  const importData = () => {
    onOk(data.job_data);
    resetModal();
  };

  return (
    <Modal
      onCancel={() => {
        resetModal();
        onCancel();
      }}
      onOk={() => isCompletedImport ? importData() : importFile()}
      width={650}
      centered
      visible={visible}
      title={title}
      okText={isCompletedImport ? "Xác nhận" : "Nhập file"}
      cancelText="Hủy bỏ"
      okButtonProps={{ disabled: isLoading, loading: isLoading }}
    >
      <StyledProgressDownloadModal>
        <Row gutter={24}>
          <Col span={12}>
            <div style={{ marginBottom: "5px" }}>
              <b>Tải file lên</b>
            </div>
            <Row>
              <Upload
                onChange={onChangeFile}
                multiple={false}
                showUploadList={false}
                beforeUpload={beforeUploadFile}
                customRequest={onCustomUpdateRequest}
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              >
                <Button icon={<UploadOutlined />}>Chọn file</Button>
              </Upload>
            </Row>
            {file && (
              <div className="mt-10">
                <span className="margin-right-10">
                  <PaperClipOutlined />
                </span>
                <span title={url} className="margin-right-10 file-name">
                  {file?.name}
                </span>
              <span onClick={() => onRemoveFile()}><DeleteOutlined /></span>
            </div>)}
          </Col>
          <Col span={12}>
            <div className="font-weight-500">File excel mẫu</div>
            <List>
              <List.Item>
                <Typography.Text>
                  {" "}
                  <img src={excelIcon} alt="" />{" "}
                  <a href={EXCEL_FILE_TYPE_XLS} download="Import_Transfer">
                    Ấn để tải xuống (excel 2003)
                  </a>{" "}
                </Typography.Text>
              </List.Item>
              <List.Item>
                <Typography.Text>
                  {" "}
                  <img src={excelIcon} alt="" />{" "}
                  <a href={EXCEL_FILE_TYPE_XLSX} download="Import_Transfer">
                    Ấn để tải xuống (excel 2007)
                  </a>{" "}
                </Typography.Text>
              </List.Item>
            </List>
          </Col>
        </Row>
        <Row className="status">
          <Col span={6}>
            <div>
              <Text>Tổng cộng</Text>
            </div>
            <div>
              <b>{dataProcess?.total}</b>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <Text>Đã xử lí</Text>
            </div>
            <div>
              <b>{dataProcess?.processed}</b>
            </div>
          </Col>
          <Col span={6}>
            <div>
              <Text>Thành công</Text>
            </div>
            <div>
              <Text type="success">
                <b>{dataProcess?.success}</b>
              </Text>
            </div>
          </Col>
          <Col span={6}>
            <div>Lỗi</div>
            <div>
              <Text type="danger">
                <b>{dataProcess?.error}</b>
              </Text>
            </div>
          </Col>

          <Row className="status">
            <Progress percent={dataProcess?.percent} />
          </Row>
        </Row>

        <Row className="import-info">
          <div className="title">
            <b>Chi tiết: </b>
          </div>
          <div className="content">
            <ul>
              {dataUploadError ? (
                <li>
                  <span className="danger">&#8226;</span>
                  <Text type="danger">Nhập file thất bại</Text>
                </li>
              ) : (
                <>
                  {!data ? (
                    <>
                      {dataError?.errors && dataError?.errors.length > 0 && dataError?.errors.map((i: any) => (
                        (
                          <li>
                            <span className="danger">&#8226;</span>
                            <Text type="danger">
                              {i}
                            </Text>
                          </li>
                        )
                      ))}
                    </>
                  ) : (
                    <li>
                      <div>
                        <span className="success">&#8226;</span>
                        <Text type="success">
                          Đang đọc file...({dataProcess?.reading_percent}%)
                        </Text>
                      </div>
                      <div>
                        <span className="success">&#8226;</span>
                        <Text type="success">
                          Đang xử lý...({dataProcess?.percent}%)
                        </Text>
                      </div>
                      <div>
                        {data?.status === ImportStatuses.FINISH && (
                          <>
                            <span className="success">&#8226;</span>
                            <Text type="success">
                              Thành công
                            </Text>
                          </>
                        )}
                      </div>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </Row>
      </StyledProgressDownloadModal>
    </Modal>
  );
};

export default ImportExcel;
