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
  Radio,
} from "antd";
import { DeleteOutlined, PaperClipOutlined, UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import BottomBarContainer from "component/container/bottom-bar.container";
import arrowLeft from "assets/icon/arrow-back.svg";
import excelIcon from "assets/icon/icon-excel.svg";
import { useDispatch, useSelector } from "react-redux";
import { inventoryGetSenderStoreAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { Store } from "model/inventory/transfer";

import { useHistory, useParams } from "react-router";
import { InventoryParams } from "../DetailTicket";
import { ApiConfig } from "config/api.config";
import BaseAxios from "base/base.axios";
import { showError, showWarning } from "utils/ToastUtils";
import { strForSearch } from "utils/StringUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { ImportResponse } from "model/other/files/export-model";
import { InventoryType } from "domain/types/inventory.type";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { uploadFileApi } from "../../../service/core/import.service";
import { HttpStatus } from "../../../config/http-status.config";
import { UploadFile } from "antd/lib/upload/interface";
import { AccountStoreResponse } from "model/account/account.model";

const { Option } = Select;
const { Text } = Typography;

const UpdateTicket: FC = () => {
  const [form] = Form.useForm();
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [myStoreActive, setMyStoreActive] = useState<any>([] as Array<Store>);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [dataProcess, setDataProcess] = useState<ImportResponse>();
  const [fileId, setFileId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [dataError, setDataError] = useState<any>(null);
  const [createType, setCreateType] = useState<string>("CREATE");
  const [dataUploadError, setDataUploadError] = useState<any>(null);
  const [url, setUrl] = useState<string>("");
  const [file, setFile] = useState<UploadFile | null>(null);
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

  const dataFileExcel = [
    "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_327a5d28-35ad-4bd1-a78f-1a7e34a53645_original.xls",
    "https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_d51d5a2c-0470-4ff4-854b-afa19e709ff9_original.xlsx",
  ];

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
    BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/import/${fileId}`).then(
      (res: any) => {
        if (!res.data) return;
        stores.forEach((store) => {
          if (store.id === Number(form.getFieldValue("from_store_id"))) {
            res.data.data.store_transfer = {
              store_id: store.id,
              hotline: store.hotline,
              address: store.address,
              name: store.name,
              code: store.code,
            };
          }
          if (store.id === Number(form.getFieldValue("to_store_id"))) {
            res.data.data.store_receive = {
              store_id: store.id,
              hotline: store.hotline,
              address: store.address,
              name: store.name,
              code: store.code,
            };
          }
        });
        setData(res.data);
        setDataProcess(res.data.process);

        const newDataUpdateError =
          !res.data.errors || (res.data.errors && res.data.errors.length === 0)
            ? null
            : res.data.errors;
        downloadErrorDetail(newDataUpdateError);
        setDataUploadError(newDataUpdateError);
        if (res.data.status !== "FINISH") return;
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
      if (!file) {
        setIsLoading(false);
        showWarning("Vui lòng chọn ít nhất một file.");
        return;
      }
      setIsLoading(true);
      if (stores) {
        stores.forEach((store) => {
          if (store.id === Number(data.from_store_id)) {
            data.store_transfer = {
              store_id: store.id,
              hotline: store.hotline,
              address: store.address,
              name: store.name,
              code: store.code,
            };
          }
          if (store.id === Number(data.to_store_id)) {
            data.store_receive = {
              store_id: store.id,
              hotline: store.hotline,
              address: store.address,
              name: store.name,
              code: store.code,
            };
          }
        });
      }
      delete data.from_store_id;
      delete data.to_store_id;
      const newBody = {
        ...data,
        url,
        can_write: false
      }

      BaseAxios.post(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/import`, newBody)
        .then((res: any) => {
          if (res) {
            setDataError(res);
            setFileId(res.data);
            setIsStatusModalVisible(true);
            setDataProcess(res.process);
            const newDataUpdateError =
              !res.data.errors || (res.data.errors && res.data.errors.length === 0)
                ? null
                : res.data.errors;
            downloadErrorDetail(newDataUpdateError);
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

  return (
    <StyledWrapper>
      <ContentContainer
        title="Nhập file chuyển hàng 1 kho nhận"
        breadcrumb={[
          {
            name: "Kho hàng",
            path: UrlConfig.HOME,
          },
          {
            name: "Chuyển hàng",
            path: `${UrlConfig.INVENTORY_TRANSFERS}`,
          },
          {
            name: `Nhập file 1 kho nhận`,
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
                  <Col span={24}>
                    <Radio.Group value={createType} onChange={(e) => setCreateType(e.target.value)}>
                      <Radio value="CREATE">Tạo phiếu</Radio>
                      <Radio value="REQUEST">Tạo yêu cầu</Radio>
                    </Radio.Group>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="from_store_id"
                      label={<b>Kho gửi</b>}
                      rules={
                        createType === "CREATE"
                          ? [
                              {
                                required: true,
                                message: "Vui lòng chọn kho gửi",
                              },
                              {
                                validator: validateStore,
                              },
                            ]
                          : []
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
                      <a href={dataFileExcel[0]} download="Import_Transfer">
                        Ấn để tải xuống (excel 2003)
                      </a>{" "}
                    </Typography.Text>
                  </List.Item>
                  <List.Item>
                    <Typography.Text>
                      {" "}
                      <img src={excelIcon} alt="" />{" "}
                      <a href={dataFileExcel[1]} download="Import_Transfer">
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
            setIsStatusModalVisible(false);
            setIsLoading(false);
          }}
          visible={isStatusModalVisible}
          footer={
            createType === "CREATE"
              ? [
                  <Button
                    key="back"
                    onClick={() => {
                      setIsStatusModalVisible(false);
                      setIsLoading(false);
                    }}
                  >
                    Huỷ
                  </Button>,
                  <Button
                    disabled={!!dataUploadError || data?.status !== "FINISH"}
                    type="primary"
                    onClick={() => {
                      history.push(`${UrlConfig.INVENTORY_TRANSFERS}/createImport`, data.data);
                    }}
                  >
                    Xác nhận
                  </Button>,
                  <Button
                    disabled={!!dataUploadError || data?.status !== "FINISH"}
                    type="primary"
                    onClick={() => {
                      dispatch({
                        type: InventoryType.CHANGE_IS_CONTINUE_CREATE_IMPORT,
                        payload: {
                          isContinueCreateImport: true,
                        },
                      });
                      history.push(`${UrlConfig.INVENTORY_TRANSFERS}/createImport`, {
                        data: data.data,
                        isFastCreate: true,
                      });
                    }}
                  >
                    Tạo và xác nhận
                  </Button>,
                ]
              : [
                  <Button
                    key="back"
                    onClick={() => {
                      setIsStatusModalVisible(false);
                    }}
                  >
                    Huỷ
                  </Button>,
                  <Button
                    disabled={!!dataUploadError || data?.status !== "FINISH"}
                    type="primary"
                    onClick={() => {
                      history.push(`${UrlConfig.INVENTORY_TRANSFERS}/createImport`, {
                        data: data.data,
                        isCreateRequest: true,
                      });
                    }}
                  >
                    Yêu cầu
                  </Button>,
                ]
          }
        >
          <ImportStatusWrapper>
            <Row className="status">
              <Col span={6}>
                <div>
                  <Text>Tổng cộng</Text>
                </div>
                <div>
                  <b>{dataProcess?.total_process}</b>
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
                          <span className="success">&#8226;</span>
                          <Text type="success">
                            {data?.status === "FINISH" ? "Thành công" : "Đang xử lý..."}
                          </Text>
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
            </Row>
          </ImportStatusWrapper>
        </Modal>
      )}
    </StyledWrapper>
  );
};

export default UpdateTicket;
