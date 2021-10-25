import React, {
  FC,
  useCallback,
  useEffect,
  useState,
} from "react";
import { StyledWrapper } from "./styles";
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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import BottomBarContainer from "component/container/bottom-bar.container";
import arrowLeft from "assets/icon/arrow-back.svg";
import { useDispatch } from "react-redux";
import {
  inventoryGetSenderStoreAction,
} from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import {
  InventoryTransferDetailItem,
  Store,
} from "model/inventory/transfer";

import { useParams } from "react-router";
import { InventoryParams } from "../DetailTicket";
import BaseAxios from "base/base.axios";
import { ApiConfig } from "config/api.config";

const { Option } = Select;

const UpdateTicket: FC = () => {
  const [form] = Form.useForm();
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);

  const { id } = useParams<InventoryParams>();
  const idNumber = parseInt(id);

  const dispatch = useDispatch();

  const onResult = useCallback(
    (result: InventoryTransferDetailItem | false) => {
      
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
    console.log('data', data);
  
    const ImportInventoryExcel = (config: any) => {
      BaseAxios.post(`${ApiConfig.INVENTORY_TRANSFER}/inventory-transfers/import`, data, config)
    }

    ImportInventoryExcel({
      onDownloadProgress: (progressEvent: any) => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log('percentage', percentage);
      }
    });
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
            path: `${UrlConfig.INVENTORY_TRANSFER}`,
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
                      >
                        <Button icon={<UploadOutlined />}>Chọn file</Button>
                      </Upload>
                    </Form.Item>
                  </Row>
                </Card>
              </Col>
              <Col span={6}>
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
                  >
                    Import
                  </Button>
                </Space>
              }
            />
          </Form>
      </ContentContainer>
    </StyledWrapper>
  );
};

export default UpdateTicket;
