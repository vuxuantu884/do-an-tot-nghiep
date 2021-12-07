
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showSuccess } from "utils/ToastUtils";
import { useHistory } from "react-router-dom";
import CustomSelect from "component/custom/select.custom";
import { Row, Col, Form, Select, Button } from "antd";

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
import CustomInput from "screens/customer/common/customInput";
import { getListSourceRequest } from "domain/actions/product/source.action";
import { SourceResponse } from "model/response/order/source.response";

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { EcommerceConfigPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import disconnectIcon from "assets/icon/e-disconnect.svg";
import saveIcon from "assets/icon/e-save-config.svg";
import iconMap from "screens/ecommerce/common/ecommerce-icon";
import { StyledConfig } from "screens/ecommerce/config/tab/setting-config/styles";

const { Option } = Select;

const shopsReadPermission = [EcommerceConfigPermission.shops_read];
const shopsUpdatePermission = [EcommerceConfigPermission.shops_update];
const shopsDeletePermission = [EcommerceConfigPermission.shops_delete];

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
    showDeleteModal,
    storeChangeSearch,
  } = props;
  const dispatch = useDispatch();
  const history = useHistory();
  const [configDetail, setConfigDetail] = useState<
    EcommerceResponse | undefined
  >(undefined);
  const [inventories, setInventories] = React.useState<
    Array<EcommerceShopInventoryDto>
  >([]);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [isConfigExist, setIsConfigExist] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  
  const [allowShopsUpdate] = useAuthorization({
    acceptPermissions: shopsUpdatePermission,
    not: false,
  });

  const [allowShopsDelete] = useAuthorization({
    acceptPermissions: shopsDeletePermission,
    not: false,
  });


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

  useEffect(() => {
    const id = configDetail?.id;
    const _isExist = configData && configData?.some((item) => item.id === id);
    if (_isExist) {
      setIsConfigExist(true);
    } else {
      setIsConfigExist(false);
    }
  }, [configDetail, configData]);
  const handleConfigCallback = React.useCallback(
    (value: EcommerceResponse) => {
      setIsLoading(false);
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
      setIsLoading(false);
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
        const _isExist =
          configData && configData?.some((item) => item.id === id);
        let request = {
          ...configDetail,
          ...value,
          inventories: inventories,
          assign_account:
            accounts?.find((item) => item.code === value.assign_account_code)
              ?.full_name || "",
          source:
            listSource?.find((item) => item.id === value.source_id)?.name || "",
          store:
            listStores?.find((item) => item.id === value.store_id)?.name || "",
        };

        setIsLoading(true);
        if (_isExist) {
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
      listSource,
      listStores,
    ]
  );
  const handleDisconnectEcommerce = () => {
    if (configDetail) showDeleteModal(configDetail);
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
        source_id: configDetail.source_id,
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
      setConfigToView(data);
    },
    [configData, setConfigToView]
  );

  const convertToCapitalizedString = () => {
    if (configDetail) {
      return (
        configDetail.ecommerce?.charAt(0).toUpperCase() +
        configDetail.ecommerce?.slice(1)
      );
    }
  };
  const listSources = React.useMemo(() => {
    return listSource.filter((item) => item.code !== "POS");
  }, [listSource]);
  React.useEffect(() => {
    dispatch(getListSourceRequest(setListSource));
  }, [dispatch]);

  const renderComponent = () => {
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
                  disabled={!allowShopsUpdate}
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
                          src={iconMap[configFromEcommerce.ecommerce.toLowerCase()]}
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
                            src={iconMap[item.ecommerce.toLowerCase()]}
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
                {configDetail?.email &&
                  <Row>
                    <Col span={5}>Email</Col>
                    <Col span={19}>
                      <span className="fw-500">: {configDetail.email}</span>
                    </Col>
                  </Row>
                }
              </div>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <span className="description-name">Đặt tên gian hàng</span>
              <ul className="description">
                <li>
                  <span style={{ padding: "0 10px" }}>
                    Tên viết tắt của gian hàng trên Yody giúp nhận biết và phân
                    biệt các gian hàng với nhau
                  </span>
                </li>
              </ul>
            </Col>
            <Col span={12}>
              <CustomInput
                name="name"
                label={<span>Tên gian hàng</span>}
                form={form}
                message="Vui lòng chọn gian hàng"
                placeholder="Nhập tên gian hàng"
                maxLength={255}
                isRequired={true}
                disabled={!configDetail || !allowShopsUpdate}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <span className="description-name">
                Cấu hình nhân viên, cửa hàng
              </span>
              <ul className="description">
                <li>
                  <span>
                    Chọn cửa hàng để ghi nhận doanh số và trừ tốn kho tại cửa hàng.
                  </span>
                </li>
                <li>
                  <span>
                    Chọn nhân viên bán hàng để ghi nhận doanh số và nhân viên phụ trách.
                  </span>
                </li>
                <li>
                  <span>
                    Chọn nguồn đơn hàng để ghi nhận nguồn cho đơn hàng khi tải đơn về.
                  </span>
                </li>
              </ul>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span>Cửa hàng</span>}
                name="store_id"
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
                  disabled={!configDetail || !allowShopsUpdate}
                  allowClear
                  optionFilterProp="children"
                  onSearch={(value) => storeChangeSearch(value)}
                >
                  {listStores &&
                    listStores?.map((item, index) => (
                      <Option
                        style={{ width: "100%" }}
                        key={index.toString()}
                        value={item.id}
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
                  disabled={!configDetail || !allowShopsUpdate}
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

              <Form.Item
                label={<span>Nguồn đơn hàng</span>}
                name="source_id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn nguồn đơn hàng",
                  },
                ]}
              >
                <Select
                  disabled={!configDetail || !allowShopsUpdate}
                  showSearch
                  placeholder="Chọn nguồn đơn hàng"
                  allowClear
                  optionFilterProp="children"
                  onSearch={(value) => accountChangeSearch(value)}
                >
                  {listSources &&
                    listSources?.map((c: any) => (
                      <Option key={c.id} value={c.id}>
                        {`${c.name}`}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <span className="description-name">Cấu hình tồn kho</span>
              <ul className="description">
                <li>
                  <span>
                    Chọn kho để đồng bộ tồn từ admin lên shop của bạn, có thể chọn
                    nhiều kho, tồn sẽ là tổng các kho.{" "}
                  </span>
                </li>
                <li>
                  <span>
                    Chọn kiểu đồng bộ tồn kho tự động nghĩa là khi có bất kỳ thay
                    đổi tồn từ các kho đã chọn thì sẽ được đồng bộ realtime lên
                    shop (trừ các trường hợp lỗi hoặc flashsale).
                  </span>
                </li>
              </ul>
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
                  disabled={!configDetail || !allowShopsUpdate}
                  onChange={handleStoreChange}
                  mode="multiple"
                  maxTagCount='responsive'
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
                  disabled={!configDetail || !allowShopsUpdate}
                >
                  <Option value={"auto"}>Tự động</Option>
                  <Option value={"manual"}>Thủ công</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <span className="description-name">Cấu hình đơn hàng</span>
              <ul className="description">
                <li>
                  <span>
                    Kiểu đồng bộ đơn hàng để xác định khi có đơn hàng mới sẽ được
                    tải về “Tự động” hay “Thủ công”.{" "}
                  </span>
                </li>
                <li>
                  <span>
                    Kiểu đồng bộ sản phẩm khi tải đơn là hệ thống sẽ đợi người
                    dùng ghép nối hết sản phẩm mới trong đơn hàng rồi mới tạo đơn
                    hàng trên hệ thống.
                  </span>
                </li>
              </ul>
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
                  disabled={!configDetail || !allowShopsUpdate}
                >
                  <Option value={"auto"}>Tự động</Option>
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
                  disabled={!configDetail || !allowShopsUpdate}
                >
                  <Option value={"manual"}>
                    <span>Đợi ghép nối</span>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="config-setting-footer">
            {(isConfigExist && allowShopsDelete) ?
              <Button
                className="delete-shop-btn"
                icon={<img src={disconnectIcon} alt="" />}
                type="ghost"
                onClick={() => handleDisconnectEcommerce()}
                disabled={isLoading}
              >
                Xóa gian hàng
              </Button>
              : <div></div>
            }

            {allowShopsUpdate &&
              <Button
                type="primary"
                htmlType="submit"
                disabled={!configDetail || isLoading}
                icon={<img src={saveIcon} alt="" />}
              >
                {isConfigExist ? "Lưu cấu hình" : "Tạo cấu hình"}
              </Button>
            }
          </div>
        </Form>
      </StyledConfig>
    )
  }

  return (
    <AuthWrapper acceptPermissions={shopsReadPermission} passThrough>
      {(allowed: boolean ) => (allowed ? renderComponent() : <NoPermission/>)}
    </AuthWrapper>
  );
};

export default SettingConfig;
