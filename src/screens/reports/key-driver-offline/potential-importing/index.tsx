import { UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Radio, Row, Select, Space, Upload } from "antd";
import BottomBarContainer from "component/container/bottom-bar.container";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { StoreGetListAction } from "domain/actions/core/store.action";
import { AccountStoreResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import { PotentialImportingForm, PotentialImportingSource } from "model/report";
import {
  uploadPotentialBoughtFile,
  uploadPotentialRegistedFile,
} from "service/report/key-driver.service";
import { callApiNative } from "utils/ApiUtils";
import { strForSearch } from "utils/StringUtils";
import { showError, showSuccess } from "utils/ToastUtils";
import { StyledWrapper } from "./styles";

const { Option } = Select;

const PotentialImporting: FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<string>(PotentialImportingSource.REGIST);
  const [listStore, setStore] = useState<Array<StoreResponse>>([]);
  const [fileList, setFileList] = useState<any>([]);
  const dispatch = useDispatch();

  const myStores: AccountStoreResponse[] | undefined = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores,
  );

  const myAccount = useSelector((state: RootReducerType) => state.userReducer.account);

  const assignedStores: StoreResponse[] = useMemo(() => {
    if (Array.isArray(myStores) && myStores.length === 0) {
      return listStore;
    }
    let stores: StoreResponse[] = [];
    myStores?.forEach((store: AccountStoreResponse) => {
      const s = listStore.find((item) => item.id === store.store_id);
      if (s) {
        stores.push(s);
      }
    });

    return stores;
  }, [listStore, myStores]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const getBase64 = (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result ? reader.result?.toString().replace(/^data:(.*,)?/, "") : "";
        if (encoded && encoded.length % 4 > 0) {
          encoded += "=".repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const onFinish = useCallback(
    async (data: any) => {
      setIsLoading(true);
      const { fileUpload, store } = data;
      const storeData = JSON.parse(store);

      const { name: file_name, size: file_size } = fileUpload[0];
      const {
        id: store_id,
        name: store_name,
        department_h3: department_lv2_name,
        department_h3_id: department_lv2_id,
      } = storeData;
      const fileTobase64 = await getBase64(fileUpload[0].originFileObj);
      const params = {
        file_name,
        file_size,
        store_id,
        store_name,
        department_lv2_name,
        department_lv2_id,
        reported_by: myAccount?.code,
        reported_name: myAccount?.full_name,
        base64: fileTobase64,
      };
      let api: any;
      switch (source) {
        case PotentialImportingSource.REGIST:
          api = uploadPotentialRegistedFile;
          break;
        case PotentialImportingSource.BOUGHT:
          api = uploadPotentialBoughtFile;
          break;
      }
      const response = await callApiNative({ isShowError: true }, dispatch, api, params);
      if (response) {
        showSuccess(
          `Nhập file ${
            source === PotentialImportingSource.REGIST
              ? "Dữ liệu khách hàng đăng ký đến nhận quà"
              : "Dữ liệu mua từ bên khác"
          } thành công`,
        );
      } else {
        showError(
          `Nhập file ${
            source === PotentialImportingSource.REGIST
              ? "Dữ liệu khách hàng đăng ký đến nhận quà"
              : "Dữ liệu mua từ bên khác"
          } không thành công`,
        );
      }
      setIsLoading(false);
    },
    [dispatch, myAccount?.code, myAccount?.full_name, source],
  );

  const onCancel = () => {
    form.setFieldsValue({
      [PotentialImportingForm.Store]: undefined,
      [PotentialImportingForm.FileUpload]: undefined,
    });
    setFileList([]);
  };

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
  }, [dispatch]);

  return (
    <StyledWrapper>
      <ContentContainer
        title="Nhập file khách hàng tiềm năng"
        breadcrumb={[
          {
            name: "Báo cáo kết quả kinh doanh Offline",
            path: `${UrlConfig.KEY_DRIVER_OFFLINE}`,
          },
          {
            name: `Nhập file khách hàng tiềm năng`,
          },
        ]}
      >
        <Form form={form} onFinish={onFinish} scrollToFirstError={true}>
          <Row gutter={24}>
            <Col span={24}>
              <Card title="Hướng dẫn Nhập file" bordered={false}>
                <div className="guide">
                  <div>
                    <span>Bước 1:</span>{" "}
                    <span>
                      <b>
                        Chọn nguồn dữ liệu khách hàng tiềm năng(Dữ liệu khách hàng đăng ký đến nhận
                        quà và Dữ liệu mua từ bên khác).
                      </b>
                    </span>
                  </div>
                  <div>
                    <span>Bước 2:</span>{" "}
                    <span>
                      <b>Chọn cửa hàng sở hữu dữ liệu khách hàng tiềm năng này.</b>
                    </span>
                  </div>
                  <div>
                    <span>Bước 3:</span>{" "}
                    <span>
                      <b>Chọn file excel dữ liệu khách hàng tiềm năng lên(định dạng .xlsx).</b>
                    </span>
                  </div>
                  <div>
                    <span>Bước 4:</span>{" "}
                    <span>
                      <b>Click Nhập file.</b>
                    </span>
                  </div>
                </div>
              </Card>
              <Card title="Thông tin nhập file" bordered={false} className={"inventory-selectors"}>
                <Row gutter={24}>
                  <Col span={24}>
                    <Radio.Group value={source} onChange={(e) => setSource(e.target.value)}>
                      <Radio value={PotentialImportingSource.REGIST}>
                        Dữ liệu khách hàng đăng ký đến nhận quà
                      </Radio>
                      <Radio value={PotentialImportingSource.BOUGHT}>Dữ liệu mua từ bên khác</Radio>
                    </Radio.Group>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      name={PotentialImportingForm.Store}
                      label={<b>Cửa hàng</b>}
                      labelCol={{ span: 24, offset: 0 }}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn cửa hàng",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn cửa hàng"
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
                        {assignedStores.map((item, index) => (
                          <Option key={"store_id" + index} value={JSON.stringify(item)}>
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
                    name={PotentialImportingForm.FileUpload}
                    getValueFromEvent={normFile}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn file",
                      },
                    ]}
                  >
                    <Upload
                      beforeUpload={() => false}
                      fileList={fileList}
                      onChange={({ fileList }) => {
                        setFileList(fileList);
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                  </Form.Item>
                </Row>
              </Card>
            </Col>
          </Row>
          <BottomBarContainer
            leftComponent={<div></div>}
            rightComponent={
              <Space>
                <Button disabled={isLoading} loading={isLoading} onClick={() => onCancel()}>
                  Huỷ
                </Button>
                <Button htmlType={"submit"} type="primary" disabled={isLoading} loading={isLoading}>
                  Nhập file
                </Button>
              </Space>
            }
          />
        </Form>
      </ContentContainer>
    </StyledWrapper>
  );
};

export default PotentialImporting;
