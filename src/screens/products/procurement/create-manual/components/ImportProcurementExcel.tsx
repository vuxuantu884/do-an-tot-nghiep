import { Button, Modal, Typography, Upload } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { showError } from "utils/ToastUtils";
import excelIcon from "assets/icon/icon-excel.svg";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import { StyledProgressDownloadModal } from "screens/ecommerce/common/commonStyle";
import { PurchaseProcumentLineItemManual } from "model/purchase-order/purchase-procument";
import { cloneDeep } from "lodash";

export interface ModalImportProps {
  visible?: boolean;
  onOk: (res: any) => void;
  onCancel: (res: any) => void;
  title: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  dataTable?: Array<PurchaseProcumentLineItemManual>;
}

type ImportProps = {
  sku: string;
  quantity: number;
  lineNumber: number | undefined;
};

type Process = {
  total: number;
  processed: number;
  success: number;
  error: number;
};

let firstLoad = true;

const ImportProcurementExcel: React.FC<ModalImportProps> = (props: ModalImportProps) => {
  const { visible, onOk, onCancel, title, dataTable } = props;
  const [fileList, setFileList] = useState<Array<any>>([]);
  const [data, setData] = useState<Array<PurchaseProcumentLineItemManual>>(
    dataTable ? [...dataTable] : [],
  );
  const [preData, setPreData] = useState<Array<PurchaseProcumentLineItemManual>>(
    dataTable ? [...dataTable] : [],
  );
  const [errorData, setErrorData] = useState<Array<any>>([]);
  const [progressData, setProgressData] = useState<Process>({
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
    firstLoad = true;
  };

  const onRemoveFile = () => {
    resetFile();
  };
  const ActionImport = {
    Ok: useCallback(() => {
      resetFile();
      onOk(data);
    }, [onOk, data]),
    Cancel: useCallback(() => {
      resetFile();
      onCancel(preData);
    }, [onCancel, preData]),
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      resetFile();
      const typeExcel =
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (!typeExcel) {
        showError("Chỉ chọn file excel");
      }
      setFileList([file]);
      return typeExcel || Upload.LIST_IGNORE;
    },
    onChange: useCallback(
      async (e: any) => {
        if (!firstLoad || (e.file && e.file.status === "removed")) {
          return;
        }

        firstLoad = false;
        const file = e.file;
        const dataExcel = await file.originFileObj.arrayBuffer();
        const workbook = XLSX.read(dataExcel);

        const workSheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData: any = XLSX.utils.sheet_to_json(workSheet);

        let range = XLSX.utils.sheet_to_json(workSheet, {
          range: workSheet["!ref"],
          blankrows: true,
        });

        if (range && range.length > 0) {
          jsonData = [];
          let lineNumber = 1;
          for (let i = 0; i < range.length; i++) {
            const item: any = range[i];

            if (Object.values(item)[0]) {
              jsonData.push({
                sku: Object.values(item)[0],
                quantity: Object.values(item)[1] ?? 1,
                lineNumber: lineNumber,
              });
            }
            lineNumber += 1;
          }
        }
        let process: Process = {
          processed: 0,
          success: 0,
          error: 0,
          total: 0,
        };
        let error = [];

        if (jsonData && data && data.length > 0) {
          let convertData: Array<ImportProps> = [];
          process.total = jsonData.length;
          for (let i = 0; i < jsonData.length; i++) {
            process.processed += 1;
            const element = jsonData[i];

            const findIndex = convertData.findIndex(
              (e) => e.sku && e.sku.toString().trim() === element.sku.toString().trim(),
            );
            if (findIndex >= 0) {
              convertData[findIndex].quantity += element.quantity ?? 1;
            } else {
              convertData.push({
                sku: element.sku,
                quantity: element.quantity ?? 1,
                lineNumber: element.lineNumber,
              });
            }
          }

          if (convertData && convertData.length > 0) {
            for (let i = 0; i < convertData.length; i++) {
              const element = convertData[i];
              const fi = data?.findIndex(
                (e: PurchaseProcumentLineItemManual) =>
                  e.sku.toString().trim() === element.sku.toString().trim(),
              );

              if (
                element.quantity &&
                (typeof element.quantity !== "number" || element.quantity % 1 !== 0)
              ) {
                error.push(`Dòng ${element.lineNumber}: Số lượng chỉ được nhập kiểu số nguyên`);
                process.error += 1;
                continue;
              }

              if (fi >= 0) {
                data[fi].real_quantity = element.quantity;
                data[fi].fake_real_quantity = element.quantity;
                data[fi].accepted_quantity = element.quantity;
                data[fi].line_item_id = fi;
                delete data[fi].code;
                process.success += 1;
              } else {
                error.push(`${element.sku}: Sản phẩm không tồn tại trên đơn đặt hàng`);
                process.error += 1;
              }
            }
          }
        }

        setProgressData({ ...process });
        setErrorData([...error]);
      },
      [data],
    ),
  };

  const exportTemplate = (e: any) => {
    let worksheet = XLSX.utils.json_to_sheet([
      {
        "Mã sản phẩm": null,
        "Số lượng": null,
      },
    ]);
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "data");
    //XLSX.writeFile(workbook, `import_so_luong_thuc_nhan.xlsx`);
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, `import_so_luong_thuc_nhan` + fileExtension);
    e.preventDefault();
  };

  const checkDisableOkButton = useCallback(() => {
    return !fileList.length;
  }, [fileList.length]);

  useEffect(() => {
    setData(dataTable ? [...dataTable] : []);
  }, [dataTable]);

  useEffect(() => {
    // fix khi hủy thì hủy luôn dữ liệu cũ procument_item
    const datClone = cloneDeep(data);
    setPreData(datClone);
  }, [data, visible]);

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
          <a href="/" onClick={exportTemplate}>
            file import thực nhận mẫu (.xlsx)
          </a>
        </Typography.Text>
        <div style={{ marginTop: "20px", marginBottom: "5px" }}>
          <b>Tải file lên</b>
        </div>
        <Upload
          onRemove={onRemoveFile}
          fileList={fileList}
          maxCount={1}
          {...uploadProps}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        >
          <Button icon={<UploadOutlined />}>Chọn file</Button>
        </Upload>

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

export default ImportProcurementExcel;
