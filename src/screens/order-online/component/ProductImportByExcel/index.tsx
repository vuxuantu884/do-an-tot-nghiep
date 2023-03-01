import { CloseOutlined, DeleteOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Col, Modal, Progress, Row, Space, Typography, Upload } from "antd";
import { UploadFile } from "antd/lib/upload/interface";
import React, { useCallback, useEffect, useState } from "react";
import { StyledComponent } from "./styled";
import * as XLSX from "xlsx";
import { DISCOUNT_TYPE, EnumOrderType } from "utils/Constants";
import {
  createItem,
  DISCOUNT_TYPES,
  ERROR,
  FILE_DOWNLOAD,
  handleFileExcel,
  isValidDiscountGreaterPrice,
  isValidObjKeys,
} from "./helper";
import { showWarning } from "utils/ToastUtils";
import { searchVariantsApi } from "service/product/product.service";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { isFetchApiSuccessful } from "utils/AppUtils";
import { OrderLineItemRequest } from "model/request/order.request";

interface ImportFileProduct {
  sku: string | null;
  quantity: number | null;
  promotion: number | null;
  discountType: string | null;
}

interface FlowImportData {
  total: number;
  processed: number;
  percent: number;
  success: number;
  error: number;
}

type Props = {
  title: string;
  visible?: boolean;
  setVisible?: (v: boolean) => void;
  onOK?: () => void;
  onCancel?: () => void;
  storeId?: number | null;
  items?: OrderLineItemRequest[];
  handleItems?: (items: OrderLineItemRequest[]) => void;
  orderType?: string;
};

const flowImportDataDefault = {
  total: 0,
  processed: 0,
  percent: 0,
  success: 0,
  error: 0,
};

const ProductImportByExcel: React.FC<Props> = (props: Props) => {
  const { title, visible, onCancel, storeId, handleItems, items } = props;
  const [file, setFile] = useState<UploadFile | null>(null);
  const [fileDatas, setFileDatas] = useState<ImportFileProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string[]>([]);
  const [flowImportData, setFlowImportData] = useState<FlowImportData>(flowImportDataDefault);

  const handleRemoveFile = useCallback(() => {
    setFileDatas([]);
    setFile(null);
  }, []);
  const handleClearState = useCallback(() => {
    setFileDatas([]);
    setFile(null);
    setIsLoading(false);
    setFileError([]);
    setFlowImportData(flowImportDataDefault);
  }, []);

  const onChangeFile = useCallback(
    async (e) => {
      if (e.file && e.file.status === "removed") {
        return;
      }
      setIsLoading(true);
      const file = e.file;
      const dataExcel = await file.originFileObj.arrayBuffer();
      const workbook = XLSX.read(dataExcel);

      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      let range: any = XLSX.utils.sheet_to_json(workSheet);
      // let range = XLSX.utils.sheet_to_json(workSheet, {
      //   range: workSheet["!ref"],
      //   blankrows: true,
      // });

      if (!range || (range && range.length === 0)) {
        setFileError([ERROR.notFoundRecordInFile]);
        setIsLoading(false);
        return;
      }

      if (!isValidObjKeys(range)) {
        setFileError([ERROR.templateIsNotIncorrectFormat]);
        setIsLoading(false);
        return;
      }

      const { errorDatas, jsonDatas } = await handleFileExcel(range);
      if (errorDatas && errorDatas.length !== 0) {
        setIsLoading(false);
        setFileError(errorDatas);
        handleRemoveFile();
        return;
      }
      setFileError([]);
      setFileDatas(jsonDatas);
      setFile(file);
      setIsLoading(false);
      setFlowImportData({
        total: jsonDatas.length,
        processed: 0,
        percent: 0,
        success: 0,
        error: 0,
      });
    },
    [handleRemoveFile],
  );

  const beforeUploadFile = (file: any) => {
    const typeExcel =
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    if (!typeExcel) {
      showWarning(ERROR.selectFileIsNotIncorrectFormat);
    }
    return typeExcel || Upload.LIST_IGNORE;
  };

  const handleCreateItem = (
    variant: VariantResponse,
    quantity: number,
    discountType: string,
    discountValue: number,
    position: number,
    isWholesale?: boolean,
  ) =>
    new Promise<OrderLineItemRequest>((resolve, reject) => {
      const lineItem: OrderLineItemRequest = createItem(
        variant,
        quantity,
        discountType,
        discountValue,
        position,
        isWholesale,
      );
      resolve(lineItem);
    });

  const handleImportData = useCallback(async () => {
    if (fileDatas.length === 0 || !items) return;
    let flowImport: FlowImportData = {
      ...flowImportDataDefault,
      total: fileDatas.length,
    };
    let error: string[] = [];
    let _items: OrderLineItemRequest[] = [...items];
    const totalIndex = fileDatas.length;
    let firstIndex = 0;

    const handleProduct = (index: number) => {
      const discountType =
        fileDatas[index].discountType === DISCOUNT_TYPES[1]
          ? DISCOUNT_TYPE.PERCENT
          : DISCOUNT_TYPE.MONEY;
      const quantity = fileDatas[index].quantity ?? 0;

      const initQueryVariant: VariantSearchQuery = {
        limit: 10,
        page: 1,
        saleable: true,
        active: true,
        info: fileDatas[index].sku || "",
        store_ids: storeId,
      };
      searchVariantsApi(initQueryVariant)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            if (response.data.items.length !== 1) {
              flowImport.error += 1;
              error.push(`${fileDatas[index].sku} - dòng ${index + 2}: ${ERROR.notFoundProduct}`);
            } else if (
              discountType === DISCOUNT_TYPE.MONEY &&
              !isValidDiscountGreaterPrice(
                response.data.items[0],
                fileDatas[index].promotion ?? 0,
                fileDatas[index].quantity ?? 0,
              )
            ) {
              flowImport.error += 1;
              error.push(
                `${fileDatas[index].sku} - dòng ${index + 2}: ${ERROR.discountBiggerProductValue}`,
              );
            } else {
              flowImport.success += 1;
              handleCreateItem(
                response.data.items[0],
                quantity,
                discountType,
                fileDatas[index].promotion ?? 0,
                index + 1,
                props.orderType === EnumOrderType.b2b,
              ).then((response_i) => {
                _items.unshift(response_i);
              });
            }
          } else {
            flowImport.error += 1;
            response?.errors?.forEach((e: any) =>
              error.push(`${fileDatas[index].sku} - dòng ${index + 2}: ${e}`),
            );
          }

          flowImport.processed = index + 1;
          flowImport.percent = Math.round((flowImport.processed / flowImport.total) * 100);
        })
        .finally(() => {
          setFlowImportData({ ...flowImport });
          setFileError(error);
          if (index + 1 < totalIndex) {
            setTimeout(() => {
              handleProduct(index + 1);
            }, 1000);
          } else {
            setIsLoading(false);
            setFileDatas([]);
            handleItems && handleItems(_items);
          }
        });
    };
    setIsLoading(true);
    handleProduct(firstIndex);
  }, [fileDatas, items, storeId, handleItems, props.orderType]);

  useEffect(() => {
    handleClearState();
  }, [visible, handleClearState]);

  return (
    <Modal
      title={title}
      visible={visible}
      onOk={handleImportData}
      onCancel={onCancel}
      width={600}
      okText="Nhập file"
      cancelText="Hủy bỏ"
      confirmLoading={isLoading}
      cancelButtonProps={{ loading: isLoading }}
      okButtonProps={{ disabled: fileDatas.length === 0 }}
      maskClosable={false}
    >
      <StyledComponent>
        <Row gutter={24}>
          <Col md={12}>
            <Space direction="vertical">
              <Typography.Title level={5}>Tải File</Typography.Title>
              <Upload
                onChange={onChangeFile}
                multiple={false}
                showUploadList={false}
                beforeUpload={beforeUploadFile}
                customRequest={() => {}}
                accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              >
                <Button icon={<UploadOutlined />} className="btn-import-file" loading={isLoading}>
                  Chọn file
                </Button>
              </Upload>
              {file && (
                <div className="file-name-import">
                  <Typography.Text>{file.name}</Typography.Text>{" "}
                  <DeleteOutlined
                    onClick={() => {
                      setFlowImportData(flowImportDataDefault);
                      handleRemoveFile();
                    }}
                    hidden={isLoading}
                  />
                </div>
              )}
            </Space>
          </Col>
          <Col md={12}>
            <Space direction="vertical">
              <Typography.Title level={5}>File excel mẫu</Typography.Title>
              <Typography.Link href={FILE_DOWNLOAD} className="download-file-color">
                {" "}
                Ấn để tải xuống file mẫu <DownloadOutlined />
              </Typography.Link>
            </Space>
          </Col>
        </Row>
        {flowImportData.total !== 0 && (
          <Row gutter={24} style={{ paddingTop: 15, paddingBottom: 15 }}>
            <Col md={24}>
              <Space direction="horizontal" className="info-import-file">
                <Typography.Text>
                  {"Tổng cộng "}
                  <span className="total-color">({flowImportData.total})</span>
                </Typography.Text>
                <Typography.Text>
                  {"Đã xử lí "}
                  <span className="processed-color">({flowImportData.processed})</span>
                </Typography.Text>
                <Typography.Text>
                  {"Thành công "}
                  <span className="success-color">({flowImportData.success})</span>
                </Typography.Text>
                <Typography.Text>
                  {"Lỗi "}
                  <span className="error-color">({flowImportData.error})</span>
                </Typography.Text>
              </Space>
              <div className="progress-import-file">
                <Progress percent={flowImportData.percent} />
              </div>
            </Col>
          </Row>
        )}
        {fileError && fileError.length !== 0 && (
          <Row gutter={24} className="error-import-file">
            <CloseOutlined
              className="remove-error-file"
              onClick={() => {
                setFileError([]);
              }}
            />
            <Col md={24}>
              <Space direction="vertical">
                {fileError.map((p) => (
                  <Typography.Text type="danger">{p}</Typography.Text>
                ))}
              </Space>
            </Col>
          </Row>
        )}
      </StyledComponent>
    </Modal>
  );
};

export default ProductImportByExcel;
