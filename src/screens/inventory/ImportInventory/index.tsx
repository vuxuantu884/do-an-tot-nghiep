import React, {
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";
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
  Modal,
  Typography,
  List,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import BottomBarContainer from "component/container/bottom-bar.container";
import arrowLeft from "assets/icon/arrow-back.svg";
import excelIcon from "assets/icon/icon-excel.svg";
import { useDispatch } from "react-redux";
import {
  inventoryGetSenderStoreAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {
  InventoryProcessImport,
  InventoryTransferDetailItem,
  Store,
} from "model/inventory/transfer";

import { useHistory, useParams } from "react-router";
import { InventoryParams } from "../DetailTicket";
import { ApiConfig } from "config/api.config";
import BaseAxios from "base/base.axios";
import { showError } from "utils/ToastUtils";

const { Option } = Select;
const { Text } = Typography;

const UpdateTicket: FC = () => {
  const [form] = Form.useForm();
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);

  const [data, setData] = useState<InventoryTransferDetailItem | null>(null);
  const [dataProcess, setDataProcess] = useState<InventoryProcessImport | null>(null);
  const [dataUploadError, setDataUploadError] = useState<Array<string> | null>(null);
  const dispatch = useDispatch();
  const history = useHistory();

  const onResult = useCallback(
    (result: InventoryTransferDetailItem | false) => {
      
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const dataFileExcel = ['https://yody-file.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_40262b05-2164-4e50-9763-3b7807e8ecb9_original.xls',
  'https://yody-file.s3.ap-southeast-1.amazonaws.com/yody-file/stock-transfer_63f04682-c041-4d14-9d8c-5fe24b4fe7f2_original.xlsx']

  // get store
  useEffect(() => {
    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );
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

  const onFinish = useCallback((data: any) => {
    setIsLoading(true);
    if (stores) {
      stores.forEach((store) => {
        if (store.id === Number(data.from_store_id)) {
          data.storeTransfer = {
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
        if (store.id === Number(data.to_store_id)) {
          data.storeReceive = {
            store_id: store.id,
            hotline: store.hotline,
            address: store.address,
            name: store.name,
            code: store.code,
          };
        }
      });
    }
    data.fileUpload = data.fileUpload.file;
    delete data.from_store_id;
    delete data.to_store_id;

    const formData = new FormData();
    formData.append('fileUpload', data.fileUpload);
    formData.append('storeTransfer',JSON.stringify(data.storeTransfer));
    formData.append('storeReceive',JSON.stringify(data.storeReceive));
    formData.append('note', data.note ? data.note : '');
    
    BaseAxios.post(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/import`, formData ).then((res: any) => {
      if (res) {
      setIsLoading(false);

        setIsStatusModalVisible(true);
        setDataProcess(res.process);
        setDataUploadError(res.errors);
      }
      if (res.data) {
        setData(res.data);
        setDataProcess(res.process);
        setDataUploadError(res.errors);
      }
    }).catch( err => {
      showError(err);
    })

  },[stores]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StyledWrapper>
      <ContentContainer
        title="Nhập file"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Chuyển hàng",
            path: `${UrlConfig.INVENTORY_TRANSFERS}`,
          },
          {
            name: `Nhập file`,
          },
        ]}
      >
          <Form form={form} onFinish={onFinish} scrollToFirstError={true}>
            <Row gutter={24}>
              <Col span={18}>
                <Card
                  title="Hướng dẫn import"
                  bordered={false}
                >
                  <div className="guide">
                    <div>
                      <span>Bước 1:</span> <span><b>Chọn kho gửi và kho nhận.</b></span>
                    </div>
                    <div>
                      <span>Bước 2:</span> <span><b>Tải file mẫu, điền mã sản phẩm và số lượng.</b></span>
                    </div>
                    <div>
                      <span>Bước 3:</span> <span><b>Upload file excel đã điền và xác nhận phiếu chuyển kho.</b></span>
                    </div> 
                  </div>
                </Card>
                <Card
                  title="Thông tin import"
                  bordered={false}
                  className={"inventory-selectors"}
                >
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        name="from_store_id"
                        label={<b>Kho gửi</b>}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn kho gửi",
                          },
                          {
                            validator: validateStore,
                          },
                        ]}
                        labelCol={{ span: 24, offset: 0 }}
                      >
                        <Select
                          placeholder="Chọn kho gửi"
                          showArrow
                          showSearch
                          optionFilterProp="children"
                        >
                          {Array.isArray(stores) &&
                            stores.length > 0 &&
                            stores.map((item, index) => (
                              <Option
                                key={"from_store_id" + index}
                                value={item.id}
                              >
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
                        >
                          {Array.isArray(stores) &&
                            stores.length > 0 &&
                            stores.map((item, index) => (
                              <Option
                                key={"to_store_id" + index}
                                value={item.id}
                              >
                                {item.name}
                              </Option>
                            ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Form.Item
                      labelCol={{ span: 24, offset: 0 }}
                      label={<b>File excel:</b>}
                      colon={false}
                      name="fileUpload"
                    >
                      <Upload
                        beforeUpload={() => false}
                      >
                        <Button icon={<UploadOutlined />}>Chọn file</Button>
                      </Upload>
                    </Form.Item>
                  </Row>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  title={"Link file Excel mẫu"}
                  bordered={false}
                  className={"inventory-note"}
                >
                  <List>
                    <List.Item>
                      <Typography.Text> <img src={excelIcon} alt="" /> <a href={dataFileExcel[0]} download="Import_Transfer">Excel 2003 (.xls)</a> </Typography.Text>
                    </List.Item>
                    <List.Item>
                      <Typography.Text> <img src={excelIcon} alt="" /> <a href={dataFileExcel[1]} download="Import_Transfer">Excel 2007 (.xlsx)</a> </Typography.Text>
                    </List.Item>
                  </List>
                </Card>
                <Card
                  title={"GHI CHÚ"}
                  bordered={false}
                  className={"inventory-note"}
                >
                  <Form.Item
                    name={"note"}
                    label={<b>Ghi chú nội bộ:</b>}
                    colon={false}
                    labelCol={{ span: 24, offset: 0 }}
                  >
                    <TextArea
                      maxLength={250}
                      placeholder=" "
                      autoSize={{ minRows: 4, maxRows: 6 }}
                    />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
            <BottomBarContainer
              leftComponent = {
                <div style={{ cursor: "pointer" }}>
                  <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
                  {"Quay lại danh sách"}
                </div>
              }
              rightComponent={
                <Space>
                  <Button >Huỷ</Button>
                  <Button
                    htmlType={"submit"}
                    type="primary"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Import
                  </Button>
                </Space>
              }
            />
          </Form>
      </ContentContainer>
      {
        isStatusModalVisible && (
          <Modal 
            title="Nhập file"
            visible={isStatusModalVisible}
            centered
            onCancel={() => {setIsStatusModalVisible(false)}}
            footer={[
              <Button key="back" onClick={() => {setIsStatusModalVisible(false)}}>
                Huỷ
              </Button>,
              <Button 
                disabled={!!dataUploadError}
                type="primary"
                onClick={() => {
                  history.push(`${UrlConfig.INVENTORY_TRANSFERS}/createImport`, data);
                }}>
                Xác nhận
              </Button>,
            ]}
          >
            <ImportStatusWrapper>
              <Row className="status">
                <Col span={6}>
                  <div><Text>Tổng cộng</Text></div>
                  <div><b>{dataProcess?.total_process}</b></div>
                </Col>
                <Col span={6}>
                  <div><Text>Đã xử lí</Text></div>
                  <div><b>{dataProcess?.processed}</b></div>
                </Col>
                <Col span={6}>
                  <div><Text>Thành công</Text></div>
                  <div><Text type="success"><b>{dataProcess?.success}</b></Text></div>
                </Col>
                <Col span={6}>
                  <div>Lỗi</div>
                  <div><Text type="danger"><b>{dataProcess?.error}</b></Text></div>
                </Col>
              </Row>
              <Row className="import-info">
                <div className="title"><b>Chi tiết: </b></div>
                <div className="content">
                  <ul>
                    {
                      dataUploadError ? dataUploadError.map( item => {
                        return <li><span className="danger">&#8226;</span><Text type="danger">{item}</Text></li>
                      }) : (
                        <li><span className="success">&#8226;</span><Text type="success">Thành công</Text></li>
                      )
                    }
                  </ul>
                </div>
              </Row>

            </ImportStatusWrapper>
          </Modal>
        )
      }
    </StyledWrapper>
  );
};

export default UpdateTicket;