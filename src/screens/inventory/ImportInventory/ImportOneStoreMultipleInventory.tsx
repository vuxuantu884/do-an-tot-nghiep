import React, { FC, useCallback, useEffect, useState } from "react";
import { ImportStatusWrapper, StyledWrapper } from "./styles";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  List,
  Modal,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
} from "antd";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PaperClipOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import BottomBarContainer from "component/container/bottom-bar.container";
import arrowLeft from "assets/icon/arrow-back.svg";
import excelIcon from "assets/icon/icon-excel.svg";
import { useDispatch, useSelector } from "react-redux";
import {
  creatInventoryTransferAction,
  creatInventoryTransferRequestAction,
  inventoryGetSenderStoreAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { InventoryTransferDetailItem, Store } from "model/inventory/transfer";

import { useHistory, useParams } from "react-router";
import { InventoryParams } from "../DetailTicket";
import { ApiConfig } from "config/api.config";
import BaseAxios from "base/base.axios";
import { showError, showSuccess, showWarning } from "utils/ToastUtils";
import { strForSearch } from "utils/StringUtils";
import { RootReducerType } from "model/reducers/RootReducerType";
import { UploadFile } from "antd/lib/upload/interface";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { uploadFileApi } from "service/core/import.service";
import { HttpStatus } from "config/http-status.config";
import { Link } from "react-router-dom";
import { AccountStoreResponse } from "model/account/account.model";

const { Option } = Select;
const { Text } = Typography;

const ImportOneStoreMultipleInventory: FC = () => {
  const [form] = Form.useForm();
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [myStoreActive, setMyStoreActive] = useState<any>([] as Array<Store>);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);
  const [processingDetail, setProcessingDetail] = useState<any>(null);
  const [, setFileId] = useState<string | null>(null);
  const [, setData] = useState<any>(null);
  const [createType, setCreateType] = useState<string>("CREATE");
  const [messageError, setMessageError] = useState<string>("");

  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const dispatch = useDispatch();
  const history = useHistory();

  const onChangeFile = useCallback((info) => {
    setFileList([
      ...fileList,
      ...info.fileList,
    ]);
  }, [fileList]);

  const onRemoveFile = () => {
    setFileList([]);
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

  const deleteFile = (file: any) => {
    setDataTable((dataTable) => {
      const newDataTable = new Map([...dataTable]);
      newDataTable.delete(file.uid);
      return newDataTable;
    });
  };

  const updateNote = (file: any, note: string) => {
    setDataTable((dataTable) => {
      const newDataTable = new Map([...dataTable]);

      newDataTable.set(file.uid, {
        ...newDataTable.get(file.uid),
        note: <Input
          onChange={(e) => updateNote(file, e.target.value)}
          placeholder="Nhập ghi chú..."
          value={note}
        />,
        noteValue: note,
      });

      return newDataTable;
    })
  };

  const onCustomUpdateRequest = (options: UploadRequestOption) => {
    if (disabled) return;
    const { file } = options;
    let files: Array<File> = [];
    if (file instanceof File) {
      files.push(file);

      setLoadingTable(true);

      uploadFileApi(files, "import-transfer").then((res: any) => {
        setLoadingTable(false);
        if (res.code === HttpStatus.SUCCESS) {
          setDataTable((dataTable: any) => {
            const newDatatable = new Map([[file.uid, {
              url: res.data[0],
              fileAttr: file,
              file: <span className="file-attached">
                <span className="margin-right-10">
                  <PaperClipOutlined />
                </span>
                <span title={res.data[0]} className="margin-right-10 file-name">
                  {file.name}
                </span>
                <span onClick={() => deleteFile(file)}><DeleteOutlined /></span>
              </span>,
              note: <Input
                onChange={(e) => updateNote(file, e.target.value)}
                placeholder="Nhập ghi chú..."
              />,
            }], ...dataTable]);

            return new Map([...newDatatable.entries()].sort(function(a: any, b: any) {
              if (!a[1].fileAttr || !b[1].fileAttr) return 0;
              const keyA = a[1].fileAttr.name.toLowerCase(),
                keyB = b[1].fileAttr.name.toLowerCase();
              if (keyA < keyB) return -1;
              if (keyA > keyB) return 1;
              return 0;
            }));
          });
        }
      });
    }
  };

  const initDataTable: any = {
    file: <Upload
      beforeUpload={beforeUploadFile}
      onRemove={onRemoveFile}
      multiple
      fileList={fileList}
      customRequest={onCustomUpdateRequest}
      showUploadList={false}
      accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
      onChange={onChangeFile}
    >
      <Button disabled={disabled} icon={<UploadOutlined />}>Chọn file</Button>
    </Upload>,
  };

  const initialColumns: any = [
    {
      dataIndex: "file",
      title: "File",
      width: 250,
    },
    {
      dataIndex: "note",
      title: "Ghi chú",
    },
  ];

  const [dataTable, setDataTable] = useState(new Map().set(null, initDataTable));
  const [columns, setColumns] = useState(initialColumns);

  const onResult = useCallback(
    () => {
    },
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

  const antIcon = <LoadingOutlined style={{ fontSize: 14 }} spin />;

  const antIconSuccess = useCallback(() => (
    <CheckCircleOutlined style={{ fontSize: 14 }} />
  ), []);

  const viewProcessingDetail = (fileAttr: any, processingDetailTemp: any) => {
    setIsStatusModalVisible(true);
    if (!processingDetailTemp.data) {
      setProcessingDetail({
        errorsFile: processingDetailTemp.errors,
        fileName: fileAttr.name,
        uid: fileAttr.uid,
      });
      return;
    }

    setProcessingDetail({
      ...processingDetailTemp.data,
      fileName: fileAttr.name,
      uid: fileAttr.uid,
    });
  };

  const checkImportFile = (fileAttr: any, fileId: any) => {
    BaseAxios.get(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/${fileId}/import`).then(
      (res: any) => {
        if (!res.data) return;
        setData(res.data);
        const percent = res.data.process.percent;
        const code = res.data.code;
        setIsStatusModalVisible((isStatusModalVisible) => {
          setProcessingDetail((processingDetail: any) => {
            if (isStatusModalVisible && fileAttr.uid === processingDetail?.uid) {
              return {
                ...res.data,
                fileName: fileAttr.name,
                uid: fileAttr.uid,
              };
            }
            return processingDetail;
          });
          return isStatusModalVisible;
        });

        if (percent === 100 && code === HttpStatus.CREATED) {
          window.open(`${process.env.PUBLIC_URL}${UrlConfig.INVENTORY_TRANSFERS}/${res.data.data.id}`, "_blank");
        }

        setDataTable((dataTable) => {
          const newDataTable = new Map([...dataTable]);
          newDataTable.set(fileAttr.uid, {
            ...newDataTable.get(fileAttr.uid),
            status: <div style={{ display: "flex", alignItems: "center" }}>
              {percent < 100 && res.data.status === "PROCESSING" ? "Đang xử lý" : code === HttpStatus.CREATED
                ? <span className="text-success">Thành công</span>
                : code === HttpStatus.BAD_REQUEST ? <span style={{ color: "#FF9100FF" }}>Trùng phiếu chuyển</span> :
                  <span className="text-error">Lỗi</span>}
              <span className="margin-left-10">{percent}%</span>
              {percent < 100 ? <Spin style={{ marginLeft: 10 }} indicator={antIcon} /> : antIconSuccess}
              {percent === 100 && code === HttpStatus.CREATED ? <Button style={{ marginLeft: "auto" }} type="default">
                <Link target="_blank" to={`${UrlConfig.INVENTORY_TRANSFERS}/${res.data.data.id}`}>Phiếu chuyển
                  hàng</Link>
              </Button> : <Button style={{ marginLeft: "auto" }} type="default"
                                  onClick={() => viewProcessingDetail(fileAttr, res)}>
                Xem chi tiết
              </Button>}
            </div>,
          });
          return newDataTable;
        });
        if (res.data.status === "PROCESSING") return;
        setFileId(null);
      },
    );
  };

  const importFile = (body: any, count: number) => {
    if (count === [...dataTable.values()].length - 1) return;
    const item = [...dataTable.values()][count];
    const newBody = {
      ...body,
      note: item.noteValue,
      url: item.url,
      can_write: true
    };
    BaseAxios.post(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/import`, newBody)
      .then((res: any) => {
        if (res) {
          setFileId(res.data);

          const newColumns: any = [
            {
              dataIndex: "file",
              title: "File",
              width: "25%",
            },
            {
              dataIndex: "status",
              title: "Trạng thái xử lý",
              width: "50%",
            },
            {
              dataIndex: "note",
              title: "Ghi chú",
              width: "25%",
            },
          ];

          setColumns(newColumns);

          setDataTable((dataTable) => {
            const newDataTable = new Map([...dataTable]);
            newDataTable.delete(null);
            [...newDataTable.values()].forEach((i) => {
              newDataTable.set(i.fileAttr.uid, {
                ...newDataTable.get(i.fileAttr.uid),
                file: <span className="file-attached">
                  <span className="margin-right-10">
                    <PaperClipOutlined />
                  </span>
                  <span title={res.data ? res.data[0] : ''} className="margin-right-10 file-name">
                    {i.fileAttr.name}
                  </span>
                </span>,
                note: newDataTable.get(i.fileAttr.uid).noteValue,
              });
            });

            newDataTable.set(item.fileAttr.uid, {
              ...newDataTable.get(item.fileAttr.uid),
              status: <div style={{ lineHeight: "38px" }}>
                Đang xử lý: 0% <Spin style={{ marginLeft: 15 }} indicator={antIcon} />
              </div>,
            });

            return newDataTable;
          });

          let interval = setInterval(function() {
            setFileId((fileId) => {

              if (!fileId) {
                if (!res.errors) {
                  clearInterval(interval);
                  importFile(newBody, count + 1);
                  return fileId;
                }

                setDataTable((dataTable) => {
                  const newDataTable = new Map([...dataTable]);
                  newDataTable.set(item.fileAttr.uid, {
                    ...newDataTable.get(item.fileAttr.uid),
                    status: <div style={{ display: "flex", alignItems: "center" }}>
                      <span className="text-error">Lỗi</span>
                      <span className="margin-left-10">100%</span>
                      <Button style={{ marginLeft: "auto" }} type="default"
                              onClick={() => viewProcessingDetail(item.fileAttr, res)}>
                        Xem chi tiết
                      </Button>
                    </div>,
                    note: <>
                      {newDataTable.get(item.fileAttr.uid).noteValue}
                    </>,
                  });
                  return newDataTable;
                });

                clearInterval(interval);
                importFile(newBody, count + 1);
              }
              checkImportFile(item.fileAttr, res.data);
              return fileId;
            });
          }, 2000);
        }
      })
      .catch((err) => {
        showError(err);
      });
  }

  const onFinish = useCallback(
    (data: any) => {
      if ([...dataTable.values()].length === 1) {
        showWarning("Vui lòng chọn ít nhất một file.");
        return;
      }
      if (messageError !== "") {
        showWarning("Kho gửi không được trùng với kho nhận");
        return;
      }
      setDisabled(true);
      if (stores) {
        stores.forEach((store) => {
          if (store?.id === Number(data.from_store_id)) {
            data.from_store_id = store?.id;
            data.from_store_phone = store?.hotline;
            data.from_store_address = store?.address;
            data.from_store_code = store?.code;
            data.from_store_name = store?.name;
          }
          if (store?.id === Number(data.to_store_id)) {
            data.to_store_id = store?.id;
            data.to_store_phone = store?.hotline;
            data.to_store_address = store?.address;
            data.to_store_code = store?.code;
            data.to_store_name = store?.name;
          }
        });
      }
      data.is_transfer_request = JSON.stringify(createType === "REQUEST");

      let count: number = 0;
      importFile(data, count);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [createType, dataTable, stores],
  );

  const myStores: any = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  useEffect(() => {
    if (stores.length === 0) return;
    const newMyStore = myStores.length > 0 ? myStores.filter((myStore: any) => {
      const storeFiltered = stores.filter((store) => Number(store.id) === Number(myStore.store_id))[0];
      return !!storeFiltered
    }) : [];
    setMyStoreActive(newMyStore);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores]);

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

  const createCallback = useCallback(
    (result: InventoryTransferDetailItem) => {
      if (result) {
        showSuccess("Thêm mới dữ liệu thành công");
        setIsStatusModalVisible(false);
        window.open(`${process.env.PUBLIC_URL}${UrlConfig.INVENTORY_TRANSFERS}/${result.id}`, "_blank");
        setDataTable((dataTable) => {
          const newDataTable = new Map([...dataTable]);
          newDataTable.set(processingDetail?.uid, {
            ...newDataTable.get(processingDetail?.uid),
            status: <div style={{ display: "flex", alignItems: "center" }}>
              <span className="text-success">Thành công</span>
              <span className="margin-left-10">100%</span>
              <span style={{ marginLeft: 10 }}>{antIconSuccess()}</span>
              <Button type="default" style={{ marginLeft: "auto" }}>
                <Link target="_blank" to={`${UrlConfig.INVENTORY_TRANSFERS}/${result.id}`}>Phiếu chuyển hàng</Link>
              </Button>
            </div>,
          });

          return newDataTable;
        });
      }
    },

    [antIconSuccess, processingDetail?.uid],
  );

  return (
    <StyledWrapper>
      <ContentContainer
        title="Nhiều bao hàng cho 1 kho"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Chuyển hàng nâng cao",
            path: `${UrlConfig.INVENTORY_TRANSFERS}`,
          },
          {
            name: `Nhiều bao hàng cho 1 kho`,
          },
        ]}
      >
        <Form form={form} onFinish={onFinish} scrollToFirstError={true}>
          <Row gutter={24}>
            <Col span={24}>
              <Card title="Hướng dẫn Nhập file" bordered={false}>
                <Row>
                  <Col span={12}>
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
                      <div>
                        <span>Bước 4:</span>{" "}
                        <span>
                          <b>Nếu bạn muốn upload lại file vui lần ấn F5.</b>
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
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
                  </Col>
                </Row>
              </Card>
              <Card title="Thông tin nhập file" bordered={false} className={"inventory-selectors"}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Radio.Group value={createType} onChange={(e) => setCreateType(e.target.value)}>
                      <Radio value="CREATE">Tạo phiếu</Radio>
                      {/*<Radio value="REQUEST">Tạo yêu cầu</Radio>*/}
                    </Radio.Group>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name="from_store_id"
                      style={{ marginBottom: 15 }}
                      label={<b>Kho gửi</b>}
                      rules={
                        createType === "CREATE"
                          ? [
                            {
                              required: true,
                              message: "Vui lòng chọn kho gửi",
                            },
                          ]
                          : []
                      }
                      labelCol={{ span: 24, offset: 0 }}
                    >
                      <Select
                        disabled={disabled}
                        placeholder="Chọn kho gửi"
                        showArrow
                        showSearch
                        optionFilterProp="children"
                        onChange={(value: number) => {
                          const to_store_id = form.getFieldValue("to_store_id");
                          setMessageError(to_store_id === value ? "Kho gửi không được trùng với kho nhận" : "")
                        }}
                        filterOption={(input: String, option: any) => {
                          if (option.props.value) {
                            return strForSearch(option.props.children).includes(
                              strForSearch(input),
                            );
                          }

                          return false;
                        }}
                      >
                        {myStoreActive.length > 0 && createType === "CREATE" ? myStoreActive?.map((store: AccountStoreResponse) =>
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
                      style={{ marginBottom: 15 }}
                      label={<b>Kho nhận</b>}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn kho nhận",
                        },
                      ]}
                      labelCol={{ span: 24, offset: 0 }}
                    >
                      <Select
                        disabled={disabled}
                        placeholder="Chọn kho nhận"
                        showArrow
                        showSearch
                        optionFilterProp="children"
                        onChange={(value: number) => {
                          const from_store_id = form.getFieldValue("from_store_id");
                          setMessageError(from_store_id === value ? "Kho gửi không được trùng với kho nhận" : "")
                        }}
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
                {messageError !== "" && <div className="message-error mb-10">{messageError}</div>}
                <Table
                  loading={loadingTable}
                  bordered
                  columns={columns}
                  dataSource={[...dataTable.values()]}
                  pagination={false}
                />
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
                <Button disabled={disabled} htmlType={"submit"} type="primary">
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
          }}
          visible={isStatusModalVisible}
          footer={
            processingDetail?.code === HttpStatus.BAD_REQUEST
              ? [
                <Button
                  key="back"
                  onClick={() => {
                    setIsStatusModalVisible(false);
                  }}
                >
                  Huỷ
                </Button>,
                <Button
                  type="primary"
                  onClick={() => {
                    dispatch(createType === "REQUEST"
                      ? creatInventoryTransferRequestAction(processingDetail?.data, createCallback)
                      : creatInventoryTransferAction(processingDetail?.data, createCallback));
                  }}
                >
                  Xác nhận tạo
                </Button>,
              ]
              : []
          }
        >
          <ImportStatusWrapper>
            <Row className="status">
              <Col span={6}>
                <div>
                  <Text>Tổng cộng</Text>
                </div>
                <div>
                  <b>{processingDetail?.process?.total_process}</b>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <Text>Đã xử lí</Text>
                </div>
                <div>
                  <b>{processingDetail?.process?.processed}</b>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <Text>Thành công</Text>
                </div>
                <div>
                  <Text type="success">
                    <b>{processingDetail?.process?.success}</b>
                  </Text>
                </div>
              </Col>
              <Col span={6}>
                <div>Lỗi</div>
                <div>
                  <Text type="danger">
                    <b>{processingDetail?.process?.error}</b>
                  </Text>
                </div>
              </Col>

              <Row className="status">
                <Progress percent={processingDetail?.process?.percent} />
              </Row>
            </Row>
            <Row className="import-info">
              <div className="content">
                <span className="margin-right-10">
                  <PaperClipOutlined />
                </span>
                <span style={{ color: "#2A2A86" }}>{processingDetail.fileName}</span>
              </div>
              <ul className="mt-10" style={{ maxHeight: "300px", overflow: "auto" }}>
                {processingDetail?.errorsFile?.map((i: any, index: number) => {
                  return (
                    <li key={index}>
                      <Text type="danger">{i.code ? i.code : i}</Text>
                    </li>
                  );
                })}
                {!processingDetail?.errorsFile && (
                  <>
                    {processingDetail.code === HttpStatus.BAD_REQUEST && (
                      <>
                        {processingDetail?.errors?.map((i: any, index: number) => {
                          return (
                            <li key={index}>
                              <Text type="danger">
                                <Link style={{ cursor: "pointer", color: "#E24343" }} target="_blank"
                                      to={`${UrlConfig.INVENTORY_TRANSFERS}/${i.id}`}>
                                  Trùng phiếu chuyển {i.code}
                                </Link>
                              </Text>
                            </li>
                          );
                        })}
                      </>
                    )}
                    {processingDetail.code !== HttpStatus.BAD_REQUEST
                    && processingDetail?.errors?.length > 0 && (
                      <>
                        {processingDetail?.errors?.map((i: any, index: number) => {
                          return (
                            <li key={index}>
                              <Text type="danger">{i}</Text>
                            </li>
                          );
                        })}
                      </>
                    )}
                    {processingDetail.code !== HttpStatus.BAD_REQUEST && processingDetail?.errors?.length === 0 && (
                      <li>
                        <Text type="danger">{processingDetail?.message}</Text>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </Row>
          </ImportStatusWrapper>
        </Modal>
      )}
    </StyledWrapper>
  );
};

export default ImportOneStoreMultipleInventory;
