import { Button, Col, Modal, Progress, Row, Typography, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import excelIcon from "assets/icon/icon-excel.svg";
import { utils, write } from "xlsx";
import * as FileSaver from "file-saver";
import { UploadChangeParam, UploadFile } from "antd/es/upload/interface";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { uploadFileApi } from "service/core/import.service";
import { cloneDeep } from "lodash";
import { HttpStatus } from "config/http-status.config";
import { ModalImportWrapper } from "./styles";
import { FormInstance } from "antd/es/form/Form";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";
import { showError } from "utils/ToastUtils";
import { CreateBinLocationItems } from "model/bin-location";
import { ImportStatuses } from "screens/inventory/helper";
import { MAX_ITEMS, addBinProducts } from "screens/bin-location/helper";
const { Text } = Typography;

export interface ModalImportProps {
  formCreate: FormInstance;
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  dataTable: Array<CreateBinLocationItems>;
  setDataTable: (data: Array<CreateBinLocationItems>) => void;
}

type ImportBinLocation = {
  error: number;
  percent: number;
  processed: number;
  reading_percent?: number;
  success: number;
  total: number;
};

const ImportModal: React.FC<ModalImportProps> = (props) => {
  const { formCreate, isVisible, setIsVisible, dataTable, setDataTable } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [dataProcess, setDataProcess] = useState<ImportBinLocation>();
  const [dataUploadError, setDataUploadError] = useState<any>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const exportTemplate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    let worksheet = utils.json_to_sheet([
      {
        [`Mã sản phẩm`]: null,
        [`Số lượng`]: null,
      },
    ]);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "data");
    const excelBuffer = write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `import_so_luong_san_pham` + fileExtension);
    e.preventDefault();
  };

  const onRemoveFile = () => {
    setFileList([]);
  };

  const onCustomUpdateRequest = (options: UploadRequestOption) => {
    const { file } = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      files.push(file);
      setIsLoading(true);
      uploadFileApi(files, "bin-location").then((res: any) => {
        let newFileList = cloneDeep(fileList);
        if (res.code === HttpStatus.SUCCESS) {
          newFileList[0].status = "done";
          setFileList(newFileList);
          importFile(res.data[0]);
        } else {
          newFileList[0].status = "error";
          setIsLoading(false);
          setFileList(newFileList);
        }
      });
    }
  };

  const importFile = (fileUrl: string) => {
    BaseAxios.post(`${ApiConfig.IMPORT_EXPORT}/importing/v2/jobs`, {
      type: "normal",
      module: "bin_transfer",
      url: fileUrl,
    })
      .then((res: any) => {
        if (res.data) {
          setFileId(res.data);
          const newDataUpdateError =
            !res.errors || (res.errors && res.errors.length === 0) ? null : res.data.errors;
          setDataUploadError(newDataUpdateError);
        } else {
          showError(res.errors);
        }
      })
      .catch((err) => {
        showError(err);
      });
  };

  const onChangeFile = (info: UploadChangeParam) => {
    setFileList(info.fileList);
  };

  const cancelImport = () => {
    setIsVisible(false);
  };

  const checkImportFile = () => {
    BaseAxios.get(`${ApiConfig.IMPORT_EXPORT}/importing/v2/jobs/${fileId}`).then((res: any) => {
      if (res.code !== HttpStatus.SUCCESS) {
        setFileId(null);
        setIsLoading(false);
        setIsDisable(true);
        if (res.errors?.length > 0) {
          showError(res.errors[0]);
        }
        return;
      }
      setData(res.data);
      setDataProcess({
        error: res.data.error,
        percent: res.data.percent,
        processed: res.data.processed,
        reading_percent: res.data.reading_percent,
        success: res.data.success,
        total: res.data.total,
      });

      const newDataUpdateError =
        !res.data.messages || (res.data.messages && res.data.messages.length === 0)
          ? null
          : res.data.messages;
      setDataUploadError(newDataUpdateError);
      if (res.data.status === ImportStatuses.ERROR) {
        setFileId(null);
        setIsLoading(false);
        setIsDisable(true);
        return;
      }
      if (res.data.status !== ImportStatuses.FINISH) return;
      setIsDisable(false);
      setFileId(null);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (!fileId) return;

    const checkFileInterval = setInterval(checkImportFile, 2000);
    return () => clearInterval(checkFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  const importProduct = () => {
    if (!data) return;
    const newDataTable = addBinProducts(dataTable, data.job_data);
    if (newDataTable.length > MAX_ITEMS) {
      showError("Tổng số lượng sản phẩm vượt quá 200, vui lòng bỏ bớt sản phẩm để import lại");
      return;
    }
    setDataTable(newDataTable);
    formCreate.setFieldsValue({ items: newDataTable });
    setIsVisible(false);
  };

  return (
    <Modal
      title="Import số lượng sản phẩm"
      onCancel={cancelImport}
      visible={isVisible}
      width={650}
      footer={[
        <Button key="back" onClick={cancelImport}>
          Huỷ
        </Button>,
        <Button loading={isLoading} disabled={isDisable} type="primary" onClick={importProduct}>
          Xác nhận
        </Button>,
      ]}
    >
      <ModalImportWrapper>
        <Row>
          <Col span={12}>
            <Upload
              onRemove={onRemoveFile}
              multiple={false}
              maxCount={1}
              fileList={fileList}
              customRequest={onCustomUpdateRequest}
              onChange={onChangeFile}
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              showUploadList={{ showRemoveIcon: false }}
            >
              <div className="sample-title-link">Tải file lên</div>
              <Button disabled={isLoading} icon={<UploadOutlined />}>
                <span id="bin_location_file" className="btn-upload">
                  Nhập file sản phẩm
                </span>
              </Button>
            </Upload>
          </Col>
          <Col className="sample-title" span={12}>
            <div className="sample-title-link">Link file excel mẫu:</div>
            <div className="sample-title-template">
              <img src={excelIcon} alt="" />{" "}
              <a href="/" onClick={exportTemplate}>
                Mẫu file vị trí bin(.xlsx)
              </a>
            </div>
          </Col>
        </Row>
        {dataProcess && (
          <Row className="status">
            <Col span={6}>
              <div>
                <Text>Tổng cộng</Text>
              </div>
              <div>
                <b>{dataProcess.total}</b>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text>Đã xử lí</Text>
              </div>
              <div>
                <b>{dataProcess.processed}</b>
              </div>
            </Col>
            <Col span={6}>
              <div>
                <Text>Thành công</Text>
              </div>
              <div>
                <Text type="success">
                  <b>{dataProcess.success}</b>
                </Text>
              </div>
            </Col>
            <Col span={6}>
              <div>Lỗi</div>
              <div>
                <Text type="danger">
                  <b>{dataProcess.error}</b>
                </Text>
              </div>
            </Col>
            <Row className="status">
              <Progress percent={dataProcess.percent} />
            </Row>
          </Row>
        )}
        {(dataProcess || dataUploadError) && (
          <Row className="import-info">
            <div className="title">
              <b>Chi tiết: </b>
            </div>
            <div className="content">
              <ul>
                {dataUploadError ? (
                  dataUploadError.map((item: any) => {
                    return (
                      <li>
                        <span className="danger">&#8226;</span>
                        <Text type="danger">{item}</Text>
                      </li>
                    );
                  })
                ) : (
                  <li>
                    <span className="success">&#8226;</span>
                    <Text type="success">
                      {data?.status === ImportStatuses.FINISH ? "Thành công" : "Đang xử lý..."}
                    </Text>
                  </li>
                )}
              </ul>
            </div>
          </Row>
        )}
      </ModalImportWrapper>
    </Modal>
  );
};

export default ImportModal;
