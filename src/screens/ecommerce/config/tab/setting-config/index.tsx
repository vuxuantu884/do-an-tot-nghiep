import { StyledConfig } from "./styles";
import { Row, Col, Form, Select, Button } from "antd";
import React, { useEffect, useState } from "react";
import CustomSelect from "component/custom/select.custom";
import shopeeIcon from "assets/icon/e-shopee.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import disconnectIcon from "assets/icon/e-disconnect.svg";
import saveIcon from "assets/icon/e-save-config.svg";
import { StoreResponse } from "model/core/store.model";
import { AccountResponse } from "model/account/account.model";
import { EcommerceResponse } from "model/response/ecommerce/ecommerce.response";
import {
  EcommerceRequest,
  EcommerceShopInventoryDto,
} from "model/request/ecommerce.request";
import {
  ecommerceConfigUpdateAction,
  ecommerceConfigCreateAction,
} from "domain/actions/ecommerce/ecommerce.actions";
import { useDispatch } from "react-redux";
import { showSuccess } from "utils/ToastUtils";
import { useHistory } from "react-router-dom";
import CustomInput from "screens/customer/common/customInput";

const iconMap: any = {
  shopee: shopeeIcon,
  lazada: lazadaIcon,
  tiki: tikiIcon,
  sendo: sendoIcon,
};

const { Option } = Select;

type SettingConfigProps = {
  listStores: Array<StoreResponse>;
  storeChangeSearch: (value: string) => void;
  accounts: Array<AccountResponse>;
  form: any;
  configData: Array<EcommerceResponse>;
  configToView: EcommerceResponse | undefined;
  accountChangeSearch: (value: string) => void;
  reloadConfigData: () => void;
  setConfigToView: (value: any) => void;
  configFromEcommerce: any | undefined;
  setConfigFromEcommerce: (value: any) => void;
  showDeleteModal: (value: EcommerceResponse) => void;
};
const SettingConfig: React.FC<SettingConfigProps> = (
  props: SettingConfigProps
) => {
  const {
    listStores,
    accountChangeSearch,
    accounts,
    form,
    configToView,
    configData,
    reloadConfigData,
    setConfigToView,
    configFromEcommerce,
    setConfigFromEcommerce,
    showDeleteModal, storeChangeSearch
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const [configDetail, setConfigDetail] = useState<
    EcommerceResponse | undefined
  >(undefined);
  const [inventories, setInventories] = React.useState<
    Array<EcommerceShopInventoryDto>
  >([]);

  useEffect(() => {
    if (configFromEcommerce) {
      const _existConfig = configData?.find(
        (item) => item.id === configFromEcommerce.id
      );
      if (_existConfig) {
        setConfigDetail(_existConfig);
      } else {
        setConfigDetail(configFromEcommerce);
      }
    } else {
      setConfigDetail(configToView);
    }
  }, [configToView, setConfigDetail, configFromEcommerce, configData]);

  const handleConfigCallback = React.useCallback(
    (value: EcommerceResponse) => {
      if (value) {
        setConfigToView(null);
        setConfigDetail(undefined);
        setConfigFromEcommerce(undefined);
        showSuccess("Cập nhật cấu hình thành công");
        history.replace(`${history.location.pathname}#sync`);
        reloadConfigData();
      }
    },
    [history, reloadConfigData, setConfigToView, setConfigFromEcommerce]
  );
  const handleCreateConfigCallback = React.useCallback(
    (value: EcommerceResponse) => {
      if (value) {
        setConfigToView(null);
        setConfigDetail(undefined);
        setConfigFromEcommerce(undefined);
        showSuccess("Đồng bộ cấu hình thành công");
        history.replace(`${history.location.pathname}#sync`);
        reloadConfigData();
      }
    },
    [history, reloadConfigData, setConfigToView, setConfigFromEcommerce]
  );
  const handleConfigSetting = React.useCallback(
    (value: EcommerceRequest) => {
      if (configDetail) {
        const id = configDetail?.id;
        const index = configData && configData?.find((item) => item.id === id);
        let request = {
          ...configDetail,
          ...value,
          inventories: inventories,
          assign_account:
            accounts?.find((item) => item.code === value.assign_account_code)
              ?.full_name || "",
        };
        if (index) {
          dispatch(
            ecommerceConfigUpdateAction(id, request, handleConfigCallback)
          );
        } else {
          dispatch(
            ecommerceConfigCreateAction(request, handleCreateConfigCallback)
          );
        }
      }
    },
    [
      dispatch,
      handleConfigCallback,
      handleCreateConfigCallback,
      configDetail,
      inventories,
      accounts,
      configData,
    ]
  );

  const handleDisconnectEcommerce = () => {
    if(configToView) showDeleteModal(configToView)
  };

  const handleStoreChange = (event: any) => {
    let _inventories = [];
    for (let id of event) {
      const _store = listStores.find((store) => store.id === id);
      if (_store) {
        _inventories.push({
          store: _store.name,
          store_id: id,
        });
      }
    }
    setInventories(_inventories);
  };

  React.useEffect(() => {
    if (configDetail) {
      const _inventories = configDetail.inventories?.filter(
        (item: any) => !item.deleted
      );
      setInventories(_inventories);
      form.setFieldsValue({
        id: configDetail.id,
        name: configDetail.name,
        store_id: configDetail.store_id,
        assign_account_code: configDetail.assign_account_code,
        order_sync: configDetail.order_sync,
        product_sync: configDetail.product_sync,
        inventory_sync: configDetail.inventory_sync,
        store: configDetail.store,
        inventories: _inventories?.map((item: any) => item.store_id),
      });
    } else {
      form.resetFields();
      setInventories([]);
    }
  }, [configDetail, form, setInventories]);

  const handleShopChange = React.useCallback(
    (id: any) => {
      let _configData = [...configData];
      const data = _configData?.find((item) => item.id === id);
      setConfigDetail(data);
    },
    [configData, setConfigDetail]
  );

  const convertToCapitalizedString = () => {
    if (configDetail) {
      return (
        configDetail.ecommerce?.charAt(0).toUpperCase() +
        configDetail.ecommerce?.slice(1)
      );
    }
  };
  return (
    <StyledConfig className="padding-20">
      <Form form={form} onFinish={(value) => handleConfigSetting(value)}>
        <Row>
          <Col span={8}>
            <Form.Item
              name="id"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn cửa hàng",
                },
              ]}
            >
              <CustomSelect
                onChange={handleShopChange}
                showArrow
                showSearch
                placeholder="Chọn cửa hàng"
                notFoundContent="Không tìm thấy kết quả"
                filterOption={(input, option) => {
                  if (option) {
                    return (
                      option.children[1]
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    );
                  }
                  return false;
                }}
              >
                {configFromEcommerce ? (
                  <CustomSelect.Option
                    style={{ width: "100%" }}
                    key={configFromEcommerce.id}
                    value={configFromEcommerce.id}
                  >
                    {
                      <img
                        style={{ marginRight: 8, paddingBottom: 4 }}
                        src={iconMap[configFromEcommerce.ecommerce]}
                        alt=""
                      />
                    }
                    {configFromEcommerce.name}
                  </CustomSelect.Option>
                ) : (
                  configData &&
                  configData?.map((item: any, index) => (
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key={item.id}
                      value={item.id}
                    >
                      {
                        <img
                          style={{ marginRight: 8, paddingBottom: 4 }}
                          src={iconMap[item.ecommerce]}
                          alt=""
                        />
                      }
                      {item.name}
                    </CustomSelect.Option>
                  ))
                )}
              </CustomSelect>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">{`Thông tin của shop trên ${
              convertToCapitalizedString() || "sàn"
            }`}</span>
            {/* <span className="description">
              Tên viết tắt của gian hàng trên Yody giúp nhận biết và phân biệt
              các gian hàng với nhau
            </span> */}
          </Col>
          <Col span={12}>
            <div className="ecommerce-user-detail">
              <Row>
                <Col span={5}>Tên Shop</Col>
                <Col span={19}>
                  <span className="fw-500">
                    : {configDetail?.ecommerce_shop || "---"}
                  </span>
                </Col>
              </Row>
              <Row>
                <Col span={5}>ID Shop</Col>
                <Col span={19}>
                  <span className="fw-500">: {configDetail?.id || "---"}</span>
                </Col>
              </Row>
              {/* <Row>
                <Col span={5}>Username</Col>
                <Col span={19}>
                  <span className="fw-500">
                    : {configDetail?.assign_account || "---"}
                  </span>
                </Col>
              </Row> */}
            </div>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">Đặt tên gian hàng</span>
            <span className="description">
              Tên viết tắt của gian hàng trên Yody giúp nhận biết và phân biệt
              các gian hàng với nhau
            </span>
          </Col>
          <Col span={12}>
            {/* <Form.Item
              label={<span>Tên gian hàng</span>}
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn gian hàng",
                },
              ]}
            >
              <Input
                maxLength={255}
                placeholder="Nhập tên gian hàng"
                disabled={configDetail ? false : true}
              ></Input>
            </Form.Item> */}
            <CustomInput
              name="name"
              label={<span>Tên gian hàng</span>}
              form={form}
              message="Vui lòng chọn gian hàng"
              placeholder="Nhập tên gian hàng"
              maxLength={255}
              isRequired={true}
              disabled={configDetail ? false : true}
            />
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">
              Cấu hình nhân viên, cửa hàng
            </span>
            <span className="description">
              Lựa chọn cửa hàng và nhân viên bán hàng để ghi nhận doanh số
            </span>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span>Cửa hàng</span>}
              name="store"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn cửa hàng",
                },
              ]}
            >
              <Select
              showSearch
                placeholder="Chọn cửa hàng"
                disabled={configDetail ? false : true}
                allowClear
                  optionFilterProp="children"
                  onSearch={(value) => storeChangeSearch(value)}
              >
                {listStores &&
                  listStores?.map((item, index) => (
                    <Option
                      style={{ width: "100%" }}
                      key={index.toString()}
                      value={item.name}
                    >
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span>Nhân viên bán hàng</span>}
              name="assign_account_code"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn nhân viên bán hàng",
                },
              ]}
            >
              <Select
                disabled={configDetail ? false : true}
                showSearch
                placeholder="Chọn nhân viên bán hàng"
                allowClear
                optionFilterProp="children"
                onSearch={(value) => accountChangeSearch(value)}
              >
                {accounts &&
                  accounts?.map((c: any) => (
                    <Option key={c.id} value={c.code}>
                      {`${c.code} - ${c.full_name}`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">Cấu hình tồn kho</span>
            <span className="description">
              Khi có bất khì thay đổi gì về tồn trong kho được chọn thì hệ thống
              sẽ “tự động” cập nhật lên shop của bạn trên sàn. Trừ một số trường
              hợp lỗi api, lỗi hệ thống sàn, hệ thống admin YODY, Flash Sale thì
              sẽ không thể cập nhật Realtime
            </span>
          </Col>
          <Col span={12}>
            <Form.Item
              name="inventories"
              label={<span>Kho đồng bộ tồn</span>}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kho đồng bộ tồn",
                },
              ]}
            >
              <CustomSelect
                disabled={configDetail ? false : true}
                onChange={handleStoreChange}
                mode="multiple"
                className="dropdown-rule"
                showArrow
                showSearch
                placeholder="Chọn kho đồng bộ tồn"
                notFoundContent="Không tìm thấy kết quả"
                style={{
                  width: "100%",
                }}
                optionFilterProp="children"
                getPopupContainer={(trigger) => trigger.parentNode}
              >
                {listStores?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.id}>
                    {item.name}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Form.Item>

            <Form.Item
              label={<span>Kiểu đồng bộ tồn kho</span>}
              name="inventory_sync"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kiểu đồng bộ tồn kho",
                },
              ]}
            >
              <Select
                placeholder="Chọn kiểu đồng bộ tồn kho"
                disabled={configDetail ? false : true}
              >
                <Option value={"auto"}>
                  <span style={{ color: "#27AE60" }}>Tự động</span>
                </Option>
                <Option value={"manual"}>Thủ công</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={12}>
            <span className="description-name">Cấu hình đơn hàng</span>
            <span className="description" style={{ height: "auto" }}>
              Khi có đơn hàng mới trên sàn thì hệ thống sẽ tự động tải về admin
              để xử lý.
            </span>
            <span className="description">
              Trường hợp trong đơn hàng tải về hệ thống sẽ đợi người dùng ghép
              nối sản phẩm trước khi tải đơn thành công.
            </span>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span>Kiểu đồng bộ đơn hàng</span>}
              name="order_sync"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kiểu đồng bộ đơn hàng",
                },
              ]}
            >
              <Select
                placeholder="Chọn kiểu đồng bộ đơn hàng"
                disabled={configDetail ? false : true}
              >
                <Option value={"auto"}>
                  <span style={{ color: "#27AE60" }}>Tự động</span>
                </Option>
                <Option value={"manual"}>Thủ công</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={<span>Kiểu đồng bộ sản phẩm khi tải đơn về</span>}
              name="product_sync"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn kiểu đồng bộ sản phẩm",
                },
              ]}
            >
              <Select
                placeholder="Chọn kiểu đồng bộ sản phẩm"
                disabled={configDetail ? false : true}
              >
                <Option value={"auto"}>{`Luôn lấy sản phẩm từ ${
                  convertToCapitalizedString() || "sàn"
                } về`}</Option>
                <Option value={"manual"}>
                  <span style={{ color: "#27AE60" }}>Đợi ghép nối</span>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <div className="customer-bottom-button">
          <Button
            className="disconnect-btn"
            icon={<img src={disconnectIcon} alt="" />}
            style={{ border: "1px solid #E24343", background: "#FFFFFF" }}
            type="ghost"
            onClick={() => handleDisconnectEcommerce()}
          >
            Ngắt kết nối
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            icon={<img src={saveIcon} alt="" />}
          >
            Lưu cấu hình
          </Button>
        </div>
      </Form>
    </StyledConfig>
  );
};

export default SettingConfig;
