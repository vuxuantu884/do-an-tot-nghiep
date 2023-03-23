import React, { FC, useCallback, useEffect, useState } from "react";
import { ImportStatusWrapper, StyledWrapper } from "./styles";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Select,
  Space,
  Upload,
  Typography,
  List,
  Modal,
  Progress,
} from "antd";
import { DeleteOutlined, PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import BottomBarContainer from "component/container/bottom-bar.container";
import arrowLeft from "assets/icon/arrow-back.svg";
import excelIcon from "assets/icon/icon-excel.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  inventoryGetSenderStoreAction
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { InventoryTransferDetailItem, StockTransferSubmit, Store } from "model/inventory/transfer";

import { useHistory, useParams } from "react-router";
import { InventoryParams } from "../DetailTicket";
import { ApiConfig } from "config/api.config";
import BaseAxios from "base/base.axios";
import { showError, showWarning } from "utils/ToastUtils";
import { strForSearch } from "utils/StringUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ImportResponse } from "model/other/files/export-model";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { uploadFileApi } from "service/core/import.service";
import { HttpStatus } from "config/http-status.config";
import { UploadFile } from "antd/lib/upload/interface";
import { AccountStoreResponse } from "model/account/account.model";
import { EXCEL_FILE_TYPE_XLS, EXCEL_FILE_TYPE_XLSX, ImportStatuses } from "../helper";
import ModalConfirm from "component/modal/ModalConfirm";
import { createInventoryTransfer } from "service/inventory/transfer/index.service";

const { Option } = Select;
const { Text } = Typography;

const UpdateTicket: FC = () => {
  const [form] = Form.useForm();
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [myStoreActive, setMyStoreActive] = useState<any>([] as Array<Store>);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleModalConfirm, setIsVisibleModalConfirm] = useState(false);
  const [isProcessingCreate, setIsProcessingCreate] = useState(false);
  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [dataProcess, setDataProcess] = useState<ImportResponse | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [recordCreated, setRecordCreated] = useState<InventoryTransferDetailItem[]>([]);
  const [dataToCreate, setDataToCreate] = useState<any>(null);
  const [dataError, setDataError] = useState<any>(null);
  const [dataUploadError, setDataUploadError] = useState<any>(null);
  const [url, setUrl] = useState<string>("");
  const [file, setFile] = useState<UploadFile | null>(null);
  const [totalRecord, setTotalRecord] = useState<number>(0);
  const [processedRecord, setProcessedRecord] = useState<number>(0);
  const [failedRecord, setFailedRecord] = useState<number>(0);
  const dispatch = useDispatch();
  const history = useHistory();

  const onChangeFile = useCallback((info) => {
    setFile(info.file);
  }, []);

  const onRemoveFile = () => {
    setFile(null);
    setUrl("");
  };

  useEffect(() => {
    if (stores.length === 0) return;
    const newMyStore = myStores.length > 0 ? myStores.filter((myStore: any) => {
      const storeFiltered = stores.filter((store) => Number(store.id) === Number(myStore.store_id))[0];
      return !!storeFiltered
    }) : [];
    setMyStoreActive(newMyStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores]);

  const onResult = useCallback(
    () => {},
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // get store
  useEffect(() => {
    dispatch(inventoryGetSenderStoreAction({ status: "active", simple: true }, setStores));
  }, [dispatch, idNumber, onResult]);

  // validate
  const validateStore = (rule: any, value: any, callback: any): void => {
    if (value) {
      const from_store_id = form.getFieldValue("from_store_id");
      const to_store_id = form.getFieldValue("to_store_id");
      if (from_store_id === to_store_id) {
        callback(`Kho gửi không được trùng với kho nhận`);
      } else {
        callback();
      }
    } else {
      callback();
    }
  };

  const checkImportFile = () => {
    BaseAxios.get(`${ApiConfig.IMPORT_EXPORT}/importing/v2/jobs/${fileId}`).then(
      (res: any) => {
        if (res.code !== HttpStatus.SUCCESS) {
          setFileId(null);
          setIsStatusModalVisible(false);
          if (res.errors?.length > 0) {
            showError(res.errors[0]);
          }
          setIsLoading(false);
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
          return;
        }
        if (res.data.status !== ImportStatuses.FINISH) return;

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

  const onFinish = useCallback(
    (data: any) => {
      setIsLoading(true);
      if (!file) {
        setIsLoading(false);
        showWarning("Vui lòng chọn ít nhất một file.");
        return;
      }
      if (!data.from_store_id || !data.to_store_id || data.to_store_id.length === 0) {
        setIsLoading(false);
        showWarning("Vui lòng chọn kho gửi và kho nhận.");
        return;
      }
      if (stores && stores.length > 0) {
        const dataFromStoreFiltered = stores.filter((store) => Number(store.id) === Number(data.from_store_id));
        if (dataFromStoreFiltered.length > 0) {
          const { id, hotline, address, name, code } = dataFromStoreFiltered[0];
          data.store_transfer = {
            store_id: id,
            hotline,
            address,
            name,
            code,
          };
        }

        data.store_receive = [];

        data.to_store_id.forEach((fromStoreId: any) => {
          const dataToStoreFiltered = stores.filter((store) => Number(store.id) === Number(fromStoreId));

          if (dataToStoreFiltered.length > 0) {
            const { id, hotline, address, name, code } = dataToStoreFiltered[0];
            data.store_receive = [
              ...data.store_receive,
              {
                store_id: id,
                hotline,
                address,
                name,
                code,
              }
            ];
          }
        })
      }

      const newBody = {
        ...data,
        url,
      }

      setDataToCreate(newBody);
      setTotalRecord(data.store_receive.length);

      BaseAxios.post(`${ApiConfig.IMPORT_EXPORT}/importing/v2/jobs`, {
        type: "normal",
        module: "inventory_transfer",
        url
      })
        .then((res: any) => {
          if (res) {
            setDataError(res);
            setFileId(res.data);
            setIsStatusModalVisible(true);
            const newDataUpdateError =
              !res.data.errors || (res.data.errors && res.data.errors.length === 0)
                ? null
                : res.data.errors;
            downloadErrorDetail(newDataUpdateError);
            setDataUploadError(newDataUpdateError);
            setDataUploadError(newDataUpdateError);
          }
        })
        .catch((err) => {
          showError(err);
        });
    },
    [file, stores, url],
  );

  const myStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  useEffect(() => {
    if (stores.length === 0) return;
    if (myStores?.length === 1) {
      stores.forEach((element) => {
        if (element.id === myStores[0].store_id) {
          form.setFieldsValue({
            from_store_id: element.id,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores]);

  const createTransferTicket = async () => {
    const newDataToCreate: any = {
      store_transfer: dataToCreate.store_transfer,
      store_receive: dataToCreate.store_receive[processedRecord],
      line_items: data.job_data,
      note: form.getFieldValue("note")
    };

    const newFormatDataToCreate: StockTransferSubmit = {
      from_store_id: newDataToCreate.store_transfer.store_id,
      from_store_phone: newDataToCreate.store_transfer.hotline,
      from_store_address: newDataToCreate.store_transfer.address,
      from_store_code: newDataToCreate.store_transfer.code,
      from_store_name: newDataToCreate.store_transfer.name,
      to_store_id: newDataToCreate.store_receive.store_id,
      to_store_phone: newDataToCreate.store_receive.hotline,
      to_store_address: newDataToCreate.store_receive.address,
      to_store_code: newDataToCreate.store_receive.code,
      to_store_name: newDataToCreate.store_receive.name,
      line_items: data.job_data,
      note: form.getFieldValue("note")
    }

    createInventoryTransfer(newFormatDataToCreate).then((res: any) => {
      if (res.code === HttpStatus.SUCCESS) {
        setRecordCreated((recordCreated: any) => {
          return [
            ...recordCreated,
            res.data
          ];
        });
        window.open(`${process.env.PUBLIC_URL}${UrlConfig.INVENTORY_TRANSFERS}/${res.data.id}`, "_blank")
        setProcessedRecord((processedRecord) => {
          return processedRecord + failedRecord < totalRecord ? processedRecord + 1 : processedRecord;
        });
        return;
      }

      setRecordCreated((recordCreated: any) => {
        return [
          ...recordCreated,
          {
            errors: res.errors
          }
        ];
      });

      setFailedRecord((failedRecord) => {
        return failedRecord + 1;
      });
    })
  }

  useEffect(() => {
    if (!isProcessingCreate) return;

    if (processedRecord + failedRecord < totalRecord) {
      createTransferTicket().then();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessingCreate, processedRecord, failedRecord]);

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

  const beforeUploadFile = useCallback((file) => {
    const isExcelFile =
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";
    if (!isExcelFile) {
      showWarning("Vui lòng chọn đúng định dạng file excel .xlsx .xls");
      return Upload.LIST_IGNORE;
    } else {
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        showWarning("Cần chọn ảnh nhỏ hơn 5mb");
      }
      return isExcelFile && isLt5M;
    }
  }, []);

  const resetModal = () => {
    setIsProcessingCreate(false)
    setIsStatusModalVisible(false);
    setIsLoading(false);
    setDataProcess(null);
    setData(null);
    setRecordCreated([]);
    setDataToCreate(null);
    setTotalRecord(0);
    setProcessedRecord(0);
    setFailedRecord(0);
  }

  return (
    <StyledWrapper>
      <ContentContainer
        title="1 danh sách hàng cho nhiều kho"
        breadcrumb={[
          {
            name: "Kho hàng",
            path: UrlConfig.HOME,
          },
          {
            name: "Chuyển hàng nâng cao",
            path: `${UrlConfig.INVENTORY_TRANSFERS}`,
          },
          {
            name: `1 danh sách hàng cho nhiều kho`,
          },
        ]}
      >
        <Form form={form} onFinish={onFinish} scrollToFirstError={true}>
          <Row gutter={24}>
            <Col span={18}>
              <Card title="Hướng dẫn Nhập file" bordered={false}>
                <div className="guide">
                  <div>
                    <span>Bước 1:</span>{" "}
                    <span>
                      <b>Chọn kho gửi và kho nhận.</b>
                    </span>
                  </div>
                  <div>
                    <span>Bước 2:</span>{" "}
                    <span>
                      <b>Tải file mẫu, điền mã sản phẩm và số lượng.</b>
                    </span>
                  </div>
                  <div>
                    <span>Bước 3:</span>{" "}
                    <span>
                      <b>Upload file excel đã điền và xác nhận phiếu chuyển kho.</b>
                    </span>
                  </div>
                </div>
              </Card>
              <Card title="Thông tin nhập file" bordered={false} className={"inventory-selectors"}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="from_store_id"
                      label={<b>Kho gửi</b>}
                      rules={
                        [
                          {
                            required: true,
                            message: "Vui lòng chọn kho gửi",
                          },
                        ]
                      }
                      labelCol={{ span: 24, offset: 0 }}
                    >
                      <Select
                        placeholder="Chọn kho gửi"
                        showArrow
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input: String, option: any) => {
                          if (option.props.value) {
                            return strForSearch(option.props.children).includes(
                              strForSearch(input),
                            );
                          }

                          return false;
                        }}
                      >
                        {myStoreActive.length > 0 ? myStores?.map((store: AccountStoreResponse) =>
                          store?.store_id ? (
                            <Select.Option value={store.store_id} key={"store_id" + store.store_id}>
                              {store.store}
                            </Select.Option>
                          ) : null,
                        ) : stores.map((item, index) => (
                          <Option key={"store_id" + index} value={item.id.toString()}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="to_store_id"
                      label={<b>Kho nhận</b>}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn kho nhận",
                        },
                        {
                          validator: validateStore,
                        },
                      ]}
                      labelCol={{ span: 24, offset: 0 }}
                    >
                      <Select
                        placeholder="Chọn kho nhận"
                        showArrow
                        showSearch
                        mode="multiple"
                        maxTagCount="responsive"
                        optionFilterProp="children"
                        filterOption={(input: String, option: any) => {
                          if (option.props.value) {
                            return strForSearch(option.props.children).includes(
                              strForSearch(input),
                            );
                          }

                          return false;
                        }}
                      >
                        {stores.map((item, index) => (
                          <Option key={"store_id" + index} value={item.id.toString()}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
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
                  </div>
                )}
              </Card>
            </Col>
            <Col span={6}>
              <Card title={"Link file Excel mẫu"} bordered={false} className={"inventory-note"}>
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
              </Card>
              <Card title={"GHI CHÚ"} bordered={false} className={"inventory-note"}>
                <Form.Item
                  name={"note"}
                  label={<b>Ghi chú nội bộ:</b>}
                  colon={false}
                  labelCol={{ span: 24, offset: 0 }}
                >
                  <TextArea maxLength={250} placeholder=" " autoSize={{ minRows: 4, maxRows: 6 }} />
                </Form.Item>
              </Card>
            </Col>
          </Row>
          <BottomBarContainer
            leftComponent={
              <div
                style={{ cursor: "pointer" }}
                onClick={() => history.push(`${UrlConfig.INVENTORY_TRANSFERS}`)}
              >
                <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                {"Quay lại danh sách"}
              </div>
            }
            rightComponent={
              <Space>
                <Button>Huỷ</Button>
                <Button htmlType={"submit"} type="primary" disabled={isLoading} loading={isLoading}>
                  Nhập file
                </Button>
              </Space>
            }
          />
        </Form>
      </ContentContainer>
      {isStatusModalVisible && (
        <Modal
          title="Nhập file"
          centered
          onCancel={() => {
            resetModal();
          }}
          visible={isStatusModalVisible}
          footer={[
            <Button
              key="back"
              onClick={() => {
                resetModal();
              }}
            >
              Huỷ
            </Button>,
            failedRecord + processedRecord < totalRecord && <Button
              disabled={(data?.status !== ImportStatuses.FINISH && data?.status !== ImportStatuses.ERROR) || (isProcessingCreate && (processedRecord + failedRecord < totalRecord))}
              loading={(data?.status !== ImportStatuses.FINISH && data?.status !== ImportStatuses.ERROR) || (isProcessingCreate && (processedRecord + failedRecord < totalRecord))}
              type="primary"
              onClick={() => isProcessingCreate || data?.status === ImportStatuses.ERROR ? resetModal() : setIsVisibleModalConfirm(true)}
            >
              Xác nhận
            </Button>,
          ]}
        >
          <ImportStatusWrapper>
            {isProcessingCreate && (
              <Row className="status">
                <Col span={8}>
                  <div>
                    <Text>Tổng phiếu</Text>
                  </div>
                  <div className="text-centert">
                    <b>{totalRecord}</b>
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <Text>Thành công</Text>
                  </div>
                  <div className="text-centert">
                    <Text type="success">
                      <b>{processedRecord}</b>
                    </Text>
                  </div>
                </Col>
                <Col span={8}>
                  <div>Lỗi</div>
                  <div className="text-centert">
                    <Text type="danger">
                      <b>{failedRecord}</b>
                    </Text>
                  </div>
                </Col>

                <Row className="status">
                  <Progress percent={Number(((processedRecord + failedRecord) / totalRecord * 100).toFixed(0))} />
                </Row>
              </Row>
            )}
            {!isProcessingCreate && (
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
            )}
            {isProcessingCreate ? (
              <Row className="import-info">
                <div className="title">
                  <b>Danh sách phiếu đã tạo: </b>
                </div>
                <div className="content">
                  <ul>
                    {recordCreated.length > 0 && recordCreated.map((item: any) => {
                      return (
                        <li>
                          <span className={item.errors ? "danger" : "success"}>&#8226;</span>
                          {item.errors ? (
                            <Text type="danger">
                              {item.errors[0]}
                            </Text>
                          ) : (
                            <Text type="success" style={{ cursor: "pointer" }} onClick={() => window.open(`${process.env.PUBLIC_URL}${UrlConfig.INVENTORY_TRANSFERS}/${item.id}`, "_blank")}>
                              {item.code}
                            </Text>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                  {processedRecord + failedRecord !== totalRecord && (
                    <div style={{ marginLeft: 15, color: "#27ae60" }}>Đang xử lý...</div>
                  )}
                </div>
              </Row>
            ) : (<Row className="import-info">
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
                          {dataError.errors && dataError.errors.length > 0 && dataError.errors.map((i: any) => (
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
            </Row>)}
          </ImportStatusWrapper>
        </Modal>
      )}

      {isVisibleModalConfirm && (
        <ModalConfirm
          onCancel={() => {
            setIsVisibleModalConfirm(false);
          }}
          onOk={() => {
            setIsProcessingCreate(true);
            setIsVisibleModalConfirm(false);
          }}
          okText="Đồng ý"
          cancelText="Hủy"
          title={`Bạn có muốn tạo phiếu hàng loạt`}
          subTitle="Tạo phiếu hàng loạt sẽ không kiểm tra trùng lặp phiếu chuyển. Xác nhận tạo?"
          visible={isVisibleModalConfirm}
        />
      )}
    </StyledWrapper>
  );
};

export default UpdateTicket;
