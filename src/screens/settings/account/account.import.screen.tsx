import { Button, Card, Col, Form, Modal, Progress, Row, Typography, Upload } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useCallback, useEffect, useState } from "react";
import excelIcon from "assets/icon/icon-excel.svg";
import { useHistory } from "react-router";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { ConAcceptImport, STATUS_IMPORT_EXPORT } from "utils/Constants";
import { exportFileV2, getFileV2, importFileV2 } from "service/other/import.inventory.service";
import { HttpStatus } from "config/http-status.config";
import { showError, showSuccess } from "utils/ToastUtils";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch } from "react-redux";
import { uploadFileApi } from "service/core/import.service";

const ConExportImportUser = {
  EXPORT: "TYPE_DOWNLOAD_FILE_IMPORT_ACCOUNT",
  IMPORT: "TYPE_IMPORT_ACCOUNT",
};

type process = {
  total: number;
  processed: number;
  success: number;
  error: number;
  percent: number;
};

const AccountImportScreen: React.FC = () => {
  const [fileList, setFileList] = useState<Array<File>>([]);
  const [errorData, setErrorData] = useState<Array<any>>([]);
  const [statusExport, setStatusExport] = useState<number>(STATUS_IMPORT_EXPORT.NONE);
  const [statusImport, setStatusImport] = useState<number>(STATUS_IMPORT_EXPORT.NONE);
  const [listExportFile, setListExportFile] = useState<Array<string>>([]);
  const [listImportFile, setListImportFile] = useState<Array<string>>([]);
  const [exporting, setExporting] = useState<boolean>(false);
  const [urlFileError, setUrlFileError] = useState<string>("");
  const [progressData, setProgressData] = useState<process>({
    processed: 0,
    success: 0,
    error: 0,
    total: 0,
    percent: 0,
  });
  const dispatch = useDispatch();

  const resetFile = () => {
    setUrlFileError("");
    setErrorData([]);
    setFileList([]);
    setProgressData({
      processed: 0,
      success: 0,
      error: 0,
      total: 0,
      percent: 0,
    });
  };

  const onRemoveFile = () => {
    resetFile();
  };
  const history = useHistory();
  const backAction = () => {
    history.push(UrlConfig.ACCOUNTS);
  };

  const ActionImport = {
    Ok: useCallback(async () => {
      const res = await callApiNative(
        { isShowLoading: false },
        dispatch,
        uploadFileApi,
        fileList,
        "stock-transfer",
      );
      if (res && res.length > 0) {
        importFileV2({
          url: res[0],
          type: ConExportImportUser.IMPORT,
        })
          .then((res) => {
            setStatusImport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
            if (res.code === HttpStatus.SUCCESS) {
              setListImportFile([...listImportFile, res.data.code]);
            }
          })
          .catch((e: any) => {
            setStatusImport(STATUS_IMPORT_EXPORT.ERROR);
            showError("Có lỗi xảy ra, vui lòng thử lại sau");
          });
      } else {
        showError("Import không thành công");
      }

      resetFile();
    }, [dispatch, fileList, listImportFile]),
    Cancel: useCallback(() => {
      setStatusExport(STATUS_IMPORT_EXPORT.NONE);
      setExporting(false);
      resetFile();
    }, []),
    ExportTemplate: useCallback(() => {
      setStatusExport(STATUS_IMPORT_EXPORT.DEFAULT);
      setExporting(true);
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
          setExporting(false);
          showError("Có lỗi xảy ra, vui lòng thử lại sau");
        });
    }, [listExportFile]),
  };

  const checkExportFile = useCallback(() => {
    setStatusExport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
    let getFilePromises = listExportFile.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.status === "FINISH") {
            showSuccess("Tải file mẫu thành công");
            setStatusExport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            setExporting(false);
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
            setExporting(false);
            if (response.data.message) {
              setErrorData(JSON.parse(response.data.message));
            }
          }
        }
      });
    });
  }, [listExportFile]);

  const checkImportFile = useCallback(() => {
    setStatusImport(STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS);
    let getFilePromises = listImportFile.map((code) => {
      return getFileV2(code);
    });
    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          //TODO: set process
          const percent = Math.floor(
            ((response.data.processed ?? 1) / (response.data.total ?? 1)) * 100,
          );
          setProgressData({
            processed: response.data.processed,
            success: response.data.success,
            total: response.data.total,
            error: response.data.error,
            percent: percent,
          });
          if (response.data && response.data.status === "FINISH") {
            setUrlFileError(response.data.url);
            setStatusImport(STATUS_IMPORT_EXPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListImportFile = listImportFile.filter((item) => {
              return item !== fileCode;
            });
            setListImportFile(newListImportFile);
            showSuccess("Nhập file người dùng thành công");
            if (response.data.message) {
              const mess = JSON.parse(response.data.message);
              mess.forEach((e: string) => {
                showSuccess(e);
              });
            }
          } else if (response.data && response.data.status === "ERROR") {
            setStatusImport(STATUS_IMPORT_EXPORT.ERROR);
            setUrlFileError(response.data.url);
            if (response.data.message) {
              setErrorData(JSON.parse(response.data.message));
            }
          }
        }
      });
    });
  }, [listImportFile]);

  const uploadProps = {
    beforeUpload: () => false,
    onChange: (obj: any) => {
      resetFile();
      const typeExcel = obj.file.type === ConAcceptImport;
      if (!typeExcel) {
        showError("Chỉ chọn file excel");
        return;
      }

      setFileList([obj.file]);
    },
    customRequest: () => false,
  };

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

  useEffect(() => {
    if (
      listImportFile.length === 0 ||
      statusImport === STATUS_IMPORT_EXPORT.JOB_FINISH ||
      statusImport === STATUS_IMPORT_EXPORT.ERROR
    )
      return;
    checkImportFile();

    const getFileInterval = setInterval(checkImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [checkImportFile, listImportFile, listImportFile.length, statusImport]);

  return (
    <ContentContainer
      title="Nhập file người dùng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý người dùng",
          path: UrlConfig.ACCOUNTS,
        },
        {
          name: "Nhập file",
        },
      ]}
    >
      <Form layout="vertical" scrollToFirstError>
        <Row gutter={25}>
          <Col span={18}>
            <Card title="THÔNG TIN NHẬP FILE">
              <Row>
                <div>
                  <b>Tải file lên</b>
                  <span style={{ marginLeft: "20px" }}>
                    <Upload
                      onRemove={onRemoveFile}
                      maxCount={1}
                      {...uploadProps}
                      accept={ConAcceptImport}
                    >
                      <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                  </span>
                </div>
              </Row>
              <Row style={{ marginTop: 20 }}>
                <Col span={24}>
                  <Button
                    type="primary"
                    onClick={ActionImport.Ok}
                    disabled={fileList && fileList.length > 0 ? false : true}
                  >
                    Nhập file
                  </Button>
                </Col>
              </Row>
              {statusImport !== STATUS_IMPORT_EXPORT.NONE && (
                <StyledProgressDownloadModal>
                  <div>
                    <div className="progress-body" style={{ marginTop: "30px" }}>
                      <Progress
                        status={`${progressData.percent === 100 ? "normal" : "active"}`}
                        percent={progressData.percent}
                        style={{ marginTop: 20 }}
                        strokeColor="#2A2A86"
                      />
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
                      {urlFileError === "" ? (
                        ""
                      ) : (
                        <div className="title">
                          Chi tiết:
                          <Typography.Text>
                            <img src={excelIcon} alt="" /> <a href={urlFileError}>file đã nhập</a>
                          </Typography.Text>
                        </div>
                      )}
                    </div>
                    {errorData?.length ? (
                      <div className="error-orders">
                        <div className="error_message">
                          <div
                            style={{
                              backgroundColor: "#F5F5F5",
                              padding: "20px 30px",
                            }}
                          >
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
                </StyledProgressDownloadModal>
              )}
            </Card>
          </Col>
          <Col span={6}>
            <Card title="FILE EXCEL MẪU">
              <Typography.Text>
                <img src={excelIcon} alt="" />{" "}
                <a
                  href="/"
                  onClick={(e: any) => {
                    e.preventDefault();
                    ActionImport.ExportTemplate();
                  }}
                >
                  Ấn để tải file xuống (.xlsx)
                </a>
              </Typography.Text>
            </Card>
          </Col>
        </Row>
        <Modal
          width={650}
          centered
          visible={exporting}
          title="Xuất file mẫu"
          footer={false}
          maskClosable={false}
          onCancel={ActionImport.Cancel}
        >
          {statusExport !== STATUS_IMPORT_EXPORT.CREATE_JOB_SUCCESS ? (
            ""
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
        </Modal>

        <BottomBarContainer back="Quay lại" backAction={backAction} />
      </Form>
    </ContentContainer>
  );
};

export default AccountImportScreen;
