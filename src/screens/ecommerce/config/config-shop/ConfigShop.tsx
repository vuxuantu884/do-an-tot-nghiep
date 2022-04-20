
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { showSuccess } from "utils/ToastUtils";
import { useHistory } from "react-router-dom";
import CustomSelect from "component/custom/select.custom";
import {Button, Col, Form, Row, Select, Spin} from "antd";

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

import AuthWrapper from "component/authorization/AuthWrapper";
import NoPermission from "screens/no-permission.screen";
import { EcommerceConfigPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import disconnectIcon from "assets/icon/e-disconnect.svg";
import saveIcon from "assets/icon/e-save-config.svg";
import { ECOMMERCE_ICON } from "screens/ecommerce/common/commonAction";
import { StyledConfig } from "screens/ecommerce/config/config-shop/StyledConfigShop";
import { debounce } from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { actionFetchListOrderSources } from "domain/actions/settings/order-sources.action";
import { SourceResponse } from "model/response/order/source.response";
import { SourceSearchQuery } from "model/request/source.request";
import { getSourcesWithParamsService } from "service/order/order.service";
import { handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import { searchAccountPublicApi } from "service/accounts/account.service";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";

const { Option } = Select;

const shopsReadPermission = [EcommerceConfigPermission.shops_read];
const shopsUpdatePermission = [EcommerceConfigPermission.shops_update];
const shopsDeletePermission = [EcommerceConfigPermission.shops_delete];

type ConfigShopProps = {
  listStores: Array<StoreResponse>;
  storeChangeSearch: (value: string) => void;
  form: any;
  configData: Array<EcommerceResponse>;
  configToView: EcommerceResponse | undefined;
  reloadConfigData: () => void;
  setConfigToView: (value: any) => void;
  configFromEcommerce: any | undefined;
  setConfigFromEcommerce: (value: any) => void;
  showDeleteModal: (value: EcommerceResponse) => void;
};

const ConfigShop: React.FC<ConfigShopProps> = (
  props: ConfigShopProps
) => {
  const {
    listStores,
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
  const [configDetail, setConfigDetail] = useState<EcommerceResponse | undefined>(undefined);
  const [inventories, setInventories] = React.useState<Array<EcommerceShopInventoryDto>>([]);
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

  // handle account
  const [initAssigneeAccountData, setInitAssigneeAccountData] = useState<Array<AccountResponse>>([]);
  const [initValueAssigneeCode, setInitValueAssigneeCode] = useState("");
  const [assigneeAccountData, setAssigneeAccountData] = useState<Array<AccountResponse>>([]);

  useEffect(() => {
    if (!configDetail?.store_id) {
      return;
    }

    const pushCurrentValueToDataAccount = (fieldName: string, fieldNameValue: any, storeAccountData: AccountResponse[]) => {
      if (fieldNameValue) {
        switch (fieldName) {
          case "assign_account_code":
            setInitValueAssigneeCode(fieldNameValue);
            break;
          default:
            break;
        }
        if (storeAccountData.some((single) => single.code === fieldNameValue)) {
          setAssigneeAccountData(storeAccountData);
        } else {
          searchAccountPublicApi({condition: fieldNameValue})
            .then((response) => {
              if (isFetchApiSuccessful(response)) {
                if (response.data.items.length === 0) {
                  return;
                }
                const result = response.data.items.concat([...storeAccountData]);
                switch (fieldName) {
                  case "assign_account_code":
                    setInitAssigneeAccountData(result);
                    setAssigneeAccountData(result);
                    break;
                  default:
                    break;
                }
              } else {
                handleFetchApiError(response, "Danh sách tài khoản", dispatch)
              }
            })
            .catch((error) => {
              console.log("error", error);
            });
        }
      }
    };

    searchAccountPublicApi({store_ids: [configDetail?.store_id]})
      .then((response) => {
        if (isFetchApiSuccessful(response)) {
          setInitAssigneeAccountData(response.data.items);
          pushCurrentValueToDataAccount("assign_account_code", configDetail.assign_account_code, response.data.items);
        } else {
          handleFetchApiError(response, "Danh sách tài khoản", dispatch)
        }
      })
      .catch((error) => {
        console.log("error", error);
      })
  }, [configDetail?.assign_account_code, configDetail?.store_id, dispatch])
  // end handle search account

  // handle source
  const [initSourceList, setInitSourceList] = useState<SourceResponse[]>([]);
  const [sourceList, setSourceList] = useState<SourceResponse[]>([]);
  const [sourceSearching, setSourceSearching] = React.useState<boolean>(false);

  const handleSetInitSourceList = useCallback(() => {
    setSourceList(initSourceList);
  }, [initSourceList]);

  const updateSourceData = useCallback(
    (response: PageResponse<any>) => {
      setSourceSearching(false);
      if (response) {
        setSourceList(response.items);
      }
    },
    []
  );

  const handleSearchingSource = useCallback(
    (searchValue: string) => {
      if (searchValue) {
        setSourceSearching(true);
        dispatch(
          actionFetchListOrderSources({name: searchValue}, updateSourceData)
        );
      } else {
        handleSetInitSourceList();
      }
    }, [dispatch, handleSetInitSourceList, updateSourceData]
  );

  const onSearchSource = debounce((value: string) => {
    handleSearchingSource(value);
  }, 800);

  //get init source
  useEffect(() => {
    const getInitSourceList = async () => {
      let sourceList: SourceResponse[] = [];
      const query: SourceSearchQuery = {
        page: 1,
        limit: 1000,
        active: true,
      }
      await getSourcesWithParamsService(query).then((responseSource) => {
        if (isFetchApiSuccessful(responseSource)) {
          sourceList = responseSource.data.items;
        } else {
          handleFetchApiError(responseSource, "Nguồn đơn hàng", dispatch)
        }
      })
      return sourceList;
    };

    const addSourceIntoInitSourceList = async (sourceList: any) => {
      let newInitSourceList: SourceResponse[] = sourceList;

      if (configDetail?.source_id && sourceList?.length && !sourceList.find((item: any) => item.id === configDetail?.source_id)) {
        const query: SourceSearchQuery = {
          ids: [configDetail?.source_id],
        }
        await getSourcesWithParamsService(query).then((responseSource) => {
          if (isFetchApiSuccessful(responseSource)) {
            newInitSourceList = responseSource.data.items.concat(sourceList);
          } else {
            handleFetchApiError(responseSource, "Nguồn đơn hàng", dispatch)
          }
        })
      }
      return newInitSourceList;
    };

    const handleGetInitSource = async () => {
      let sourceList: SourceResponse[];
      sourceList = await getInitSourceList();
      sourceList = await addSourceIntoInitSourceList(sourceList);
      setInitSourceList(sourceList);
      setSourceList(sourceList);
    };
    if (configDetail?.source_id) {
      handleGetInitSource();
    }
  }, [configDetail?.source_id, dispatch]);
  // end handle source

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
            assigneeAccountData?.find((item) => item.code === value.assign_account_code)?.full_name || "",
          source:
            sourceList?.find((item) => item.id === value.source_id)?.name || "",
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
      assigneeAccountData,
      configData,
      sourceList,
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
                      style={{width: "100%"}}
                      key={configFromEcommerce.id}
                      value={configFromEcommerce.id}
                    >
                      {
                        <img
                          style={{marginRight: 8, paddingBottom: 4}}
                          src={ECOMMERCE_ICON[configFromEcommerce.ecommerce.toLowerCase()]}
                          alt=""
                        />
                      }
                      {configFromEcommerce.name}
                    </CustomSelect.Option>
                  ) : (
                    configData &&
                    configData?.map((item: any) => (
                      <CustomSelect.Option
                        style={{width: "100%"}}
                        key={item.id}
                        value={item.id}
                      >
                        {
                          <img
                            style={{marginRight: 8, paddingBottom: 4}}
                            src={ECOMMERCE_ICON[item.ecommerce.toLowerCase()]}
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
                  <span style={{padding: "0 10px"}}>
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
                        style={{width: "100%"}}
                        key={index.toString()}
                        value={item.id}
                      >
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Nhân viên bán hàng"
                name="assign_account_code"
              >
                <AccountCustomSearchSelect
                  disabled={!configDetail || !allowShopsUpdate}
                  placeholder="Tìm theo họ tên hoặc mã nhân viên"
                  initValue={initValueAssigneeCode}
                  dataToSelect={assigneeAccountData}
                  setDataToSelect={setAssigneeAccountData}
                  initDataToSelect={initAssigneeAccountData}
                />
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
                  onSearch={(value) => onSearchSource(value.trim())}
                  loading={sourceSearching}
                  onClear={handleSetInitSourceList}
                  notFoundContent={sourceSearching ? <Spin size="small"/> : "Không có dữ liệu"}
                >
                  {sourceList?.map((source: any) => (
                    <Option key={source.id} value={source.id}>
                      {`${source.name}`}
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
                    tải về "Tự động" hay "Thủ công".{" "}
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
                icon={<img src={disconnectIcon} alt=""/>}
                type="ghost"
                onClick={() => handleDisconnectEcommerce()}
                disabled={isLoading}
              >
                Xóa gian hàng
              </Button>
              : <div/>
            }

            {allowShopsUpdate &&
              <Button
                type="primary"
                htmlType="submit"
                disabled={!configDetail || isLoading}
                icon={<img src={saveIcon} alt=""/>}
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
      {(allowed: boolean) => (allowed ? renderComponent() : <NoPermission/>)}
    </AuthWrapper>
  );
};

export default ConfigShop;
