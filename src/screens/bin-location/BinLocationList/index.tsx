import { Button, Card, Form, Modal, Row, Select, Space, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router";
import BinLocationListTab from "./BinLocationTabs/BinLocationTab";
import { BinLocationStylesWrapper } from "./styles";
import { AccountResponse, AccountStoreResponse } from "model/account/account.model";
import { callApiNative } from "utils/ApiUtils";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import queryString from "query-string";
import { RootReducerType } from "model/reducers/RootReducerType";
import { getStoreApi } from "service/inventory/transfer/index.service";
import { StoreResponse } from "model/core/store.model";
import { BinLocationTabUrl } from "../helper";
import { PageResponse } from "model/base/base-metadata.response";
import ButtonCreate from "../../../component/header/ButtonCreate";
import BinHistoriesListTab from "./BinLocationTabs/BinHistoriesListTab";
import AuthWrapper from "../../../component/authorization/AuthWrapper";
import { strForSearch } from "utils/StringUtils";
import { DownloadOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const InventoryListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [stores, setStores] = useState<Array<StoreResponse>>([] as Array<StoreResponse>);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [defaultAccountProps, setDefaultAccountProps] = useState<PageResponse<AccountResponse>>();
  const [accountStores, setAccountStores] = useState<Array<StoreResponse> | null>(null);
  const { path } = useRouteMatch();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [isVisible, setIsVisible] = useState(false);
  const [storeIdSelected, setStoreIdSelected] = useState<number | null>(null);
  const [storeSelected, setStoreSelected] = useState<StoreResponse | string>("");
  const [storeNameSelected, setStoreNameSelected] = useState<string>(" ");
  const [isExportBinList, setIsExportBinList] = useState(false);

  const myStores: Array<AccountStoreResponse> = useSelector(
    (state: RootReducerType) => state.userReducer.account?.account_stores ?? [],
  );

  useEffect(() => {
    if (!stores) return;

    const storeInLocalStorage = localStorage.getItem("storeBinLocation");

    if (storeInLocalStorage) {
      const storeInLocalStorageParse = JSON.parse(storeInLocalStorage);
      if (storeInLocalStorageParse.store_id) {
        if (myStores.length > 0) {
          setStoreSelected(storeInLocalStorage);
          setStoreIdSelected(JSON.parse(storeInLocalStorage).store_id);
          setStoreNameSelected(JSON.parse(storeInLocalStorage).store);
        } else {
          const storeSelected = stores.filter(
            (store) => store.id === storeInLocalStorageParse.store_id,
          );
          if (storeSelected.length > 0) {
            setStoreSelected(JSON.stringify(storeSelected[0]));
            setStoreIdSelected(storeSelected[0].id);
            setStoreNameSelected(storeSelected[0].name);
          }
        }
      } else {
        if (myStores.length > 0) {
          const storeSelected = myStores.filter(
            (store) => store.store_id === Number(storeInLocalStorageParse.id),
          );
          if (storeSelected.length > 0) {
            setStoreSelected(JSON.stringify(storeSelected[0]));
          } else {
            setStoreSelected("");
            form.setFieldsValue({
              store_id: null,
            });
          }
        } else {
          setStoreSelected(storeInLocalStorage);
          setStoreIdSelected(JSON.parse(storeInLocalStorage).id);
          setStoreNameSelected(JSON.parse(storeInLocalStorage).name);
        }
      }
      return;
    }

    if (myStores.length > 0) {
      form.setFieldsValue({
        store_id: JSON.stringify(myStores[0]),
      });
    }
    setIsVisible(true);
  }, [form, myStores, stores]);

  useEffect(() => {
    if (path) {
      setActiveTab(path);
    }
  }, [path]);

  const location = useLocation();

  const queryParamsParsed: any = queryString.parse(location.search);

  const getAccounts = async (codes: string) => {
    const initSelectedResponse = await callApiNative(
      { isShowError: true },
      dispatch,
      searchAccountPublicApi,
      {
        codes,
      },
    );

    setAccounts((accounts) => {
      return [...initSelectedResponse.items, ...accounts];
    });
    setDefaultAccountProps(initSelectedResponse);
  };

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const getStores = async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getStoreApi, {
      status: "active",
      simple: true,
    });
    if (res) {
      setStores(res);
    }
  };

  useEffect(() => {
    let codes = "";

    if (queryParamsParsed.created_by) {
      codes = queryParamsParsed.created_by;
    }

    getAccounts(codes).then();
    if (codes !== "") {
      getAccounts("").then();
    }
    getStores().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stores.length === 0) return;

    const newMyStores =
      userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0
        ? userReducer.account?.account_stores
            .map((item) => {
              const storeFiltered = stores.filter((store) => store.id === item.store_id);
              return storeFiltered[0];
            })
            .filter((item) => item)
        : [];
    setAccountStores(newMyStores);
  }, [stores, userReducer.account?.account_stores]);
  //
  // const menuItems = [
  //   {
  //     name: "1 bao hàng cho 1 kho",
  //     url: `${UrlConfig.INVENTORY_TRANSFERS}/import`,
  //   },
  // ];

  // const menu = (
  //   <Menu>
  //     {menuItems.map((i, index) => (
  //       <Menu.Item key={index}>
  //         <div onClick={() => history.push(i.url)}>
  //           <img className="mr-15" src={importIcon} style={{ marginRight: 8 }} alt="" />
  //           {i.name}
  //         </div>
  //       </Menu.Item>
  //     ))}
  //   </Menu>
  // );

  const renderExtraContainer = () => {
    return (
      <Row>
        <Space>
          <AuthWrapper acceptPermissions={[]}>
            <Button
              onClick={() => {
                setIsVisible(true);
                form.setFieldsValue({
                  store_id: storeSelected,
                });
              }}
              style={{ minWidth: 150 }}
            >
              <EnvironmentOutlined style={{ color: "#40a9ff" }} /> {`${storeNameSelected} `}
            </Button>
          </AuthWrapper>
          {/*<AuthWrapper acceptPermissions={[]}>*/}
          {/*  <Dropdown.Button*/}
          {/*    className="dropdown"*/}
          {/*    onClick={() => history.push(`${UrlConfig.INVENTORY_TRANSFERS}/import`)}*/}
          {/*    overlay={menu}*/}
          {/*  >*/}
          {/*    <img src={importIcon} style={{ marginRight: 8 }} alt="" /> Cất hàng vào kho lưu trữ*/}
          {/*  </Dropdown.Button>*/}
          {/*</AuthWrapper>*/}
          {/*<AuthWrapper acceptPermissions={[]}>*/}
          {/*  <Dropdown.Button*/}
          {/*    className="dropdown"*/}
          {/*    onClick={() => history.push(`${UrlConfig.INVENTORY_TRANSFERS}/import`)}*/}
          {/*    overlay={menu}*/}
          {/*  >*/}
          {/*    <img src={importIcon} alt="" /> Chuyển ra sàn trưng bày*/}
          {/*  </Dropdown.Button>*/}
          {/*</AuthWrapper>*/}
          {activeTab === `${BinLocationTabUrl.LIST}` && (
            <Button
              className="light"
              size="large"
              icon={<DownloadOutlined />}
              onClick={() => setIsExportBinList(true)}
            >
              Xuất file
            </Button>
          )}
          <AuthWrapper acceptPermissions={[]}>
            <ButtonCreate
              child="Chuyển vị trí"
              path={`${UrlConfig.BIN_LOCATION}/${storeIdSelected}/create`}
            />
          </AuthWrapper>
        </Space>
      </Row>
    );
  };

  const saveStoreSelected = (values: any) => {
    const value = form.getFieldValue("store_id");

    if (!value) return;

    setStoreSelected(value);
    setStoreIdSelected(myStores.length > 0 ? JSON.parse(value).store_id : JSON.parse(value).id);
    setStoreNameSelected(myStores.length > 0 ? JSON.parse(value).store : JSON.parse(value).name);
    localStorage.setItem("storeBinLocation", value);
    setIsVisible(false);
  };

  return (
    <BinLocationStylesWrapper>
      <ContentContainer
        title="Quản lý vị trí BIN"
        breadcrumb={[
          {
            name: "Kho hàng",
          },
          {
            name: "Vị trí BIN",
          },
        ]}
        extra={renderExtraContainer()}
      >
        <Card>
          <Tabs style={{ overflow: "initial" }} activeKey={activeTab}>
            <TabPane
              tab={<Link to={BinLocationTabUrl.LIST}>Danh sách vị trí sản phẩm</Link>}
              key={`${BinLocationTabUrl.LIST}`}
            >
              {activeTab === `${BinLocationTabUrl.LIST}` && (
                <BinLocationListTab
                  activeTab={activeTab}
                  isExportBinList={isExportBinList}
                  setIsExportBinList={setIsExportBinList}
                  stores={stores}
                  accounts={accounts}
                  storeIdSelected={storeIdSelected}
                  defaultAccountProps={defaultAccountProps}
                  accountStores={accountStores}
                />
              )}
            </TabPane>
            <TabPane
              tab={<Link to={BinLocationTabUrl.HISTORIES}>Lịch sử chuyển vị trí</Link>}
              key={BinLocationTabUrl.HISTORIES}
            >
              <BinHistoriesListTab
                stores={stores}
                storeIdSelected={storeIdSelected}
                accounts={accounts}
                defaultAccountProps={defaultAccountProps}
                accountStores={accountStores}
              />
            </TabPane>
          </Tabs>
        </Card>
      </ContentContainer>

      <Modal
        width={600}
        visible={isVisible}
        cancelText={() => setIsVisible(false)}
        onOk={() => form.submit()}
        onCancel={() => {
          if (!storeIdSelected) return;
          setIsVisible(false);
        }}
        title="Chọn cửa hàng"
        okText="Lưu"
      >
        <Form form={form} layout="vertical" onFinish={saveStoreSelected}>
          <Form.Item
            label="Cửa hàng"
            name="store_id"
            className="select-item"
            rules={[
              {
                required: true,
                message: "Cửa hàng không được để trống.",
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
                  return strForSearch(option.props.children).includes(strForSearch(input));
                }

                return false;
              }}
            >
              {Array.isArray(myStores) && myStores.length > 0
                ? myStores.map((item, index) => (
                    <Select.Option key={"store" + index} value={JSON.stringify(item)}>
                      {item.store}
                    </Select.Option>
                  ))
                : Array.isArray(stores) &&
                  stores.length > 0 &&
                  stores.map((item, index) => (
                    <Select.Option key={"store" + index} value={JSON.stringify(item)}>
                      {item.name}
                    </Select.Option>
                  ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </BinLocationStylesWrapper>
  );
};
export default InventoryListScreen;
