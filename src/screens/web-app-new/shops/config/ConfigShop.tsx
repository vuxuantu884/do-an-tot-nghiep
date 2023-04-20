import { Button, Col, Form, Row, Select } from "antd";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import CustomInput from "component/custom/custom-input";
import CustomSelect from "component/custom/select.custom";
import { EcommerceConfigPermission } from "config/permissions/ecommerce.permission";
import { AccountSearchAction } from "domain/actions/account/account.action";
import useAuthorization from "hook/useAuthorization";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { StoreResponse } from "model/core/store.model";
import { WebAppShopInventoryDto } from "model/query/web-app.query";
import { WebAppResponse } from "model/response/web-app/ecommerce.response";
import { StyledConfig } from "../styles";
import disconnectIcon from "assets/icon/e-disconnect.svg";
import saveIcon from "assets/icon/e-save-config.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { webAppUpdateConfigAction } from "domain/actions/web-app/web-app.actions";
import { showSuccess } from "utils/ToastUtils";
import { getListStoresSimpleAction } from "domain/actions/core/store.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import { SourceResponse } from "model/response/order/source.response";

type ConfigShopProps = {
  shopList: Array<WebAppResponse>;
  showDeleteModal: (value: WebAppResponse) => void;
  id: string;
};

const ConfigShop = (props: ConfigShopProps) => {
  const { shopList, showDeleteModal, id } = props;

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  //permisson
  const shopsReadPermission = [EcommerceConfigPermission.shops_read];
  const shopsUpdatePermission = [EcommerceConfigPermission.shops_update];
  const shopsDeletePermission = [EcommerceConfigPermission.shops_delete];
  const [allowShopsUpdate] = useAuthorization({
    acceptPermissions: shopsUpdatePermission,
    not: false,
  });
  const [allowShopsDelete] = useAuthorization({
    acceptPermissions: shopsDeletePermission,
    not: false,
  });

  //state
  const [configDetail, setConfigDetail] = useState<WebAppResponse | undefined>(undefined);
  const [storeList, setStoreList] = useState<Array<StoreResponse>>([]);
  const [accountList, setAccountList] = useState<Array<AccountResponse>>([]);
  const [sourceList, setSourceList] = useState<Array<SourceResponse>>([]);
  const [inventories, setInventories] = useState<Array<WebAppShopInventoryDto>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //get account list
  useEffect(() => {
    handleSearchAccount("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleSearchAccount = (searchValue: string) => {
    setAccountList([]);
    let request = {
      info: searchValue,
      status: "active",
    };
    dispatch(AccountSearchAction(request, updateAccountData));
  };
  const updateAccountData = (response: PageResponse<AccountResponse> | false) => {
    if (response) {
      setAccountList(response.items);
    }
  };

  //get store list
  useEffect(() => {
    dispatch(
      getListStoresSimpleAction((stores) => {
        setStoreList(stores);
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //get source list
  const handleSearchingSource = debounce((value: string) => {
    dispatch(getListAllSourceRequest(setSourceList));
  }, 800);
  useEffect(() => {
    handleSearchingSource("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //handle shop
  useEffect(() => {
    if (shopList && shopList.length > 0) {
      const shopInfo = shopList.find((a) => a.id === parseFloat(id));
      if (shopInfo) {
        setConfigDetail(shopInfo);
      }
    }
  }, [id, shopList]);
  const handleShopChange = (id: number) => {
    if (shopList && shopList.length > 0) {
      const shopInfo = shopList.find((a) => a.id === id);
      if (shopInfo) {
        setConfigDetail(shopInfo);
      }
    }
  };

  //store
  const handleStoreChange = (event: any) => {
    let _inventories = [];
    for (let id of event) {
      const _store = storeList.find((store) => store.id === id);
      if (_store) {
        _inventories.push({
          store: _store.name,
          store_id: id,
        });
      }
    }
    setInventories(_inventories);
  };

  //handle setting
  const handleConfigSetting = (value: any) => {
    if (configDetail) {
      let request = {
        ...configDetail,
        ...value,
        inventories: inventories,
        assign_account:
          accountList?.find((item) => item.code === value.assign_account_code)?.full_name || "",
        source: sourceList?.find((item) => item.id === value.source_id)?.name || "",
        store: storeList?.find((item) => item.id === value.store_id)?.name || "",
      };
      setIsLoading(true);
      dispatch(
        webAppUpdateConfigAction(request.id, request, (result: WebAppResponse) => {
          setIsLoading(false);
          if (result) {
            showSuccess("Cập nhật cấu hình thành công");
          }
        }),
      );
    }
  };

  //init form
  useEffect(() => {
    if (configDetail) {
      const _inventories = configDetail.inventories?.filter((item: any) => !item.deleted);
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
        source_id: configDetail.source_id
          ? configDetail.source_id.split(",").map((item: any) => parseFloat(item))
          : [],
        inventories: _inventories?.map((item: any) => item.store_id),
      });
    } else {
      form.resetFields();
      setInventories([]);
    }
  }, [configDetail, form]);

  const renderComponent = () => {
    return (
      <StyledConfig className="padding-20">
        <Form form={form} layout="vertical" onFinish={(value) => handleConfigSetting(value)}>
          <Row>
            <Col span={8}>
              <Form.Item
                name="id"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn gian hàng",
                  },
                ]}
              >
                <CustomSelect
                  onChange={handleShopChange}
                  showArrow
                  showSearch
                  placeholder="Chọn gian hàng"
                  notFoundContent="Không tìm thấy kết quả"
                  disabled={!allowShopsUpdate}
                  filterOption={(input, option) => {
                    if (option) {
                      return option.children[1].toLowerCase().indexOf(input.toLowerCase()) >= 0;
                    }
                    return false;
                  }}
                >
                  {shopList &&
                    shopList?.map((item: any) => (
                      <CustomSelect.Option style={{ width: "100%" }} key={item.id} value={item.id}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                </CustomSelect>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <span className="description-name">{`Thông tin của gian hàng`}</span>
            </Col>
            <Col span={12}>
              <div className="ecommerce-user-detail">
                <Row>
                  <Col span={5}>Tên gian hàng</Col>
                  <Col span={19}>
                    <span className="fw-500">: {configDetail?.name || "---"}</span>
                  </Col>
                </Row>
                <Row>
                  <Col span={5}>ID gian hàng</Col>
                  <Col span={19}>
                    <span className="fw-500">: {configDetail?.id || "---"}</span>
                  </Col>
                </Row>
                {configDetail?.email && (
                  <Row>
                    <Col span={5}>Email</Col>
                    <Col span={19}>
                      <span className="fw-500">: {configDetail.email}</span>
                    </Col>
                  </Row>
                )}
              </div>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <span className="description-name">Đặt tên gian hàng</span>
              <ul className="description">
                <li>
                  <span style={{ padding: "0 10px" }}>
                    Tên viết tắt của gian hàng trên Yody giúp nhận biết và phân biệt các gian hàng
                    với nhau
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
              <span className="description-name">Cấu hình nhân viên, cửa hàng</span>
              <ul className="description">
                <li>
                  <span>Chọn cửa hàng để ghi nhận doanh số và trừ tốn kho tại cửa hàng.</span>
                </li>
                <li>
                  <span>Chọn nhân viên bán hàng để ghi nhận doanh số và nhân viên phụ trách.</span>
                </li>
                <li>
                  <span>Chọn nguồn đơn hàng để ghi nhận nguồn cho đơn hàng khi tải đơn về.</span>
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
                >
                  {storeList &&
                    storeList?.map((item, index) => (
                      <Select.Option
                        style={{ width: "100%" }}
                        key={index.toString()}
                        value={item.id}
                      >
                        {item.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Nhân viên bán hàng"
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
                  onSearch={(value) => handleSearchAccount(value.trim() || "")}
                  onClear={() => handleSearchAccount("")}
                  notFoundContent="Không có dữ liệu"
                >
                  {accountList?.map((account) => (
                    <Select.Option key={account.id} value={account.code}>
                      {`${account.code} - ${account.full_name}`}
                    </Select.Option>
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
                  mode="multiple"
                  maxTagCount="responsive"
                  optionFilterProp="children"
                  onSearch={(value) => handleSearchingSource(value.trim() || "")}
                  onClear={() => handleSearchingSource("")}
                  notFoundContent="Không có dữ liệu"
                >
                  {sourceList?.map((source: any) => (
                    <Select.Option key={source.id} value={source.id}>
                      {`${source.name}`}
                    </Select.Option>
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
                    Chọn kho để đồng bộ tồn từ admin lên shop của bạn, có thể chọn nhiều kho, tồn sẽ
                    là tổng các kho.{" "}
                  </span>
                </li>
                <li>
                  <span>
                    Chọn kiểu đồng bộ tồn kho tự động nghĩa là khi có bất kỳ thay đổi tồn từ các kho
                    đã chọn thì sẽ được đồng bộ realtime lên shop (trừ các trường hợp lỗi hoặc
                    flashsale).
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
                  maxTagCount="responsive"
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
                  {storeList?.map((item) => (
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
                  <Select.Option value={"auto"}>Tự động</Select.Option>
                  <Select.Option value={"manual"}>Thủ công</Select.Option>
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
                    Kiểu đồng bộ đơn hàng để xác định khi có đơn hàng mới sẽ được tải về "Tự động"
                    hay "Thủ công".{" "}
                  </span>
                </li>
                <li>
                  <span>
                    Kiểu đồng bộ sản phẩm khi tải đơn là hệ thống sẽ đợi người dùng ghép nối hết sản
                    phẩm mới trong đơn hàng rồi mới tạo đơn hàng trên hệ thống.
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
                  <Select.Option value={"auto"}>Tự động</Select.Option>
                  <Select.Option value={"manual"}>Thủ công</Select.Option>
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
                  <Select.Option value={"manual"}>
                    <span>Đợi ghép nối</span>
                  </Select.Option>
                  <Select.Option value={"auto"}>
                    <span>Tự động ghép nối</span>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <div className="config-setting-footer">
            {configDetail && allowShopsDelete ? (
              <Button
                className="delete-shop-btn"
                icon={<img src={disconnectIcon} alt="" />}
                type="ghost"
                onClick={() => showDeleteModal(configDetail)}
                disabled={isLoading}
              >
                Xóa gian hàng
              </Button>
            ) : (
              <div />
            )}

            {allowShopsUpdate && (
              <Button
                type="primary"
                htmlType="submit"
                disabled={!configDetail || isLoading}
                icon={<img src={saveIcon} alt="" />}
              >
                {configDetail ? "Lưu cấu hình" : "Tạo cấu hình"}
              </Button>
            )}
          </div>
        </Form>
      </StyledConfig>
    );
  };
  return (
    <AuthWrapper acceptPermissions={shopsReadPermission} passThrough>
      {(allowed: boolean) => (allowed ? renderComponent() : <NoPermission />)}
    </AuthWrapper>
  );
};
export default ConfigShop;
