import { Button, Card, Dropdown, Menu, Row, Space, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import UrlConfig, { InventoryTransferTabUrl } from "config/url.config";
import React, { useEffect, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";
import HistoryInventoryTransferTab from "./ListTicketTab/HistoryInventoryTransfer";
import InventoryTransferTab from "./ListTicketTab/InventoryTransfer";
import { ListTicketStylesWrapper } from "./Styles";
import AuthWrapper from "component/authorization/AuthWrapper";
import { InventoryTransferPermission } from "config/permissions/inventory-transfer.permission";
import importIcon from "assets/icon/import.svg";
import { AccountResponse } from "model/account/account.model";
import { callApiNative } from "utils/ApiUtils";
import { searchAccountPublicApi } from "service/accounts/account.service";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import queryString from "query-string";
import exportIcon from "assets/icon/export.svg";
import { RootReducerType } from "model/reducers/RootReducerType";
import ExportImportTab from "./ListTicketTab/ExportImportTransfer";
import {
  getListInventoryTransferApi,
  getStoreApi
} from "service/inventory/transfer/index.service";
import { StoreResponse } from "model/core/store.model";
import { InventoryTransferSearchQuery } from "model/inventory/transfer";
import { initQuery } from "../helper";
import { InventoryType } from "domain/types/inventory.type";
import { STATUS_INVENTORY_TRANSFER } from "../constants";
import { PageResponse } from "model/base/base-metadata.response";

const { TabPane } = Tabs;

const InventoryListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [stores, setStores] = useState<Array<StoreResponse>>([] as Array<StoreResponse>);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [defaultAccountProps, setDefaultAccountProps] = useState<PageResponse<AccountResponse>>();
  const [accountStores, setAccountStores] = useState<Array<StoreResponse> | null>(null);
  const history = useHistory();
  const { path } = useRouteMatch();
  const dispatch = useDispatch();
  const [vExportTransfer, setVExportTransfer] = useState(false);
  const [vExportDetailTransfer, setVExportDetailTransfer] = useState(false);
  const isFirstLoadSender = useSelector(
    (state: RootReducerType) => state.inventoryReducer.isFirstLoadSender,
  );
  const isFirstLoadReceive = useSelector(
    (state: RootReducerType) => state.inventoryReducer.isFirstLoadReceive,
  );
  const countTransferIn = useSelector(
    (state: RootReducerType) => state.inventoryReducer.countTransferIn,
  );
  const countTransferOut = useSelector(
    (state: RootReducerType) => state.inventoryReducer.countTransferOut,
  );

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
    const res = await callApiNative({ isShowLoading: false }, dispatch, getStoreApi, { status: "active", simple: true });
    if (res) {
      setStores(res);
    }
  };

  useEffect(() => {
    let codes = "";

    if (queryParamsParsed.created_by) {
      codes = queryParamsParsed.created_by;
    }
    if (queryParamsParsed.updated_by) {
      codes = codes + "," + queryParamsParsed.updated_by;
    }
    if (queryParamsParsed.received_by) {
      codes = codes + "," + queryParamsParsed.received_by;
    }
    if (queryParamsParsed.transfer_by) {
      codes = codes + "," + queryParamsParsed.transfer_by;
    }
    if (queryParamsParsed.cancel_by) {
      codes = codes + "," + queryParamsParsed.cancel_by;
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

    const newMyStores = userReducer.account?.account_stores && userReducer.account?.account_stores.length > 0
      ? userReducer.account?.account_stores.map((item) => {
      const storeFiltered = stores.filter((store) => store.id === item.store_id);
      return storeFiltered[0];
      }).filter((item => item)) : [];
    setAccountStores(newMyStores);
  }, [stores, userReducer.account?.account_stores]);

  const menuItems = [
    {
      name: "1 bao hàng cho 1 kho",
      url: `${UrlConfig.INVENTORY_TRANSFERS}/import`
    },
    {
      name: "Nhiều bao hàng cho 1 kho",
      url: `${UrlConfig.INVENTORY_TRANSFERS}/import-multiple-file-one-store`
    },
    {
      name: "1 danh sách hàng cho nhiều kho",
      url: `${UrlConfig.INVENTORY_TRANSFERS}/import-multiple-from-store`
    },
    {
      name: "Nhiều bao hàng cho nhiều kho",
      url: `${UrlConfig.INVENTORY_TRANSFERS}/import-multiple`
    },
  ];

  const menuExportItems = [
    {
      name: "Xuất file danh sách",
      action: "EXPORT_LIST"
    },
    {
      name: "Xuất file chi tiết",
      action: "EXPORT_DETAIL"
    },
  ];

  const menu = (
    <Menu>
      {menuItems.map((i, index) => (
        <Menu.Item key={index}>
          <div onClick={() => history.push(i.url)}>
            <img className="mr-15" src={importIcon} style={{ marginRight: 8 }} alt="" />
            {i.name}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  const menuExport = (
    <Menu>
      {menuExportItems.map((i, index) => (
        <Menu.Item key={index}>
          <div onClick={() => i.action === "EXPORT_DETAIL" ? setVExportDetailTransfer(true) : setVExportTransfer(true)}>
            <img className="mr-15" src={exportIcon} style={{ marginRight: 8 }} alt="" />
            {i.name}
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  const renderExtraContainer = () => {
    if (
      activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER ||
      activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE ||
      activeTab === `${InventoryTransferTabUrl.LIST}/`
    ) {
      return (
        <Row>
          <Space>
            <Dropdown.Button
              className="dropdown"
              onClick={() => setVExportDetailTransfer(true)}
              overlay={menuExport}
            >
              <img src={exportIcon} style={{ marginRight: 8 }} alt="" /> Xuất file
            </Dropdown.Button>
            <AuthWrapper acceptPermissions={[InventoryTransferPermission.import]}>
              <Dropdown.Button
                className="dropdown"
                onClick={() => history.push(`${UrlConfig.INVENTORY_TRANSFERS}/import`)}
                overlay={menu}
              >
                <img src={importIcon} style={{ marginRight: 8 }} alt="" /> Chuyển hàng nâng cao
              </Dropdown.Button>
            </AuthWrapper>
            {/*<AuthWrapper acceptPermissions={[InventoryTransferPermission.request]}>*/}
            {/*  <ButtonCreate children="Yêu cầu" path={`${UrlConfig.INVENTORY_TRANSFERS}/request`} />*/}
            {/*</AuthWrapper>*/}
            <AuthWrapper acceptPermissions={[InventoryTransferPermission.create]}>
              <ButtonCreate path={`${UrlConfig.INVENTORY_TRANSFERS}/create`} />
            </AuthWrapper>
          </Space>
        </Row>
      );
    } else if (activeTab === InventoryTransferTabUrl.LIST_EXPORT_IMPORT) {
      return (
        <Button
          className="light"
          size="large"
          icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
          onClick={() => {
            setVExportDetailTransfer(true);
          }}
        >
          Xuất file chi tiết
        </Button>
      );
    } else {
      return "";
    }
  };

  const getListTransferByCondition = async (status: string[], tab: string) => {
    let params: InventoryTransferSearchQuery = {
      ...initQuery,
      status
    }

    const accountStoreSelected =
      accountStores && accountStores.length > 0 ? accountStores.map((i) => i.id).join(',') : null;

    switch (tab) {
      case InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER:
        params = {
          ...params,
          from_store_id: params.from_store_id
            ? (Array.isArray(params.from_store_id) && params.from_store_id.length) > 0
              ? params.from_store_id
              : accountStoreSelected
            : accountStoreSelected || null,
        };
        const countTransferOutRes = await getListInventoryTransferApi(params);
        dispatch({
          type: InventoryType.COUNT_TRANSFER_OUT,
          payload: {
            countTransferOut: countTransferOutRes.data.metadata.total,
          },
        });
        dispatch({
          type: InventoryType.IS_FIRST_LOAD_SENDER,
          payload: {
            isFirstLoadSender: false,
          },
        });
        break;
      case InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE:
        params = {
          ...params,
          to_store_id: params.to_store_id
            ? (Array.isArray(params.to_store_id) && params.to_store_id.length) > 0
              ? params.to_store_id
              : accountStoreSelected
            : accountStoreSelected || null,
        };
        const countTransferInRes = await getListInventoryTransferApi(params);
        dispatch({
          type: InventoryType.COUNT_TRANSFER_IN,
          payload: {
            countTransferIn: countTransferInRes.data.metadata.total,
          },
        });
        dispatch({
          type: InventoryType.IS_FIRST_LOAD_RECEIVE,
          payload: {
            isFirstLoadReceive: false,
          },
        });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (!accountStores) return;
    if (path !== InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER && isFirstLoadSender) {
      getListTransferByCondition(
        [STATUS_INVENTORY_TRANSFER.TRANSFERRING.status, STATUS_INVENTORY_TRANSFER.CONFIRM.status],
        InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER).then();
    }
    // eslint-disable-next-line
  }, [isFirstLoadSender, accountStores, path]);

  useEffect(() => {
    if (!accountStores) return;
    if (path !== InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE && isFirstLoadReceive) {
      getListTransferByCondition([STATUS_INVENTORY_TRANSFER.TRANSFERRING.status], InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE).then();
    }
    // eslint-disable-next-line
  }, [isFirstLoadReceive, accountStores, path]);

  return (
    <ListTicketStylesWrapper>
      <ContentContainer
        title="Chuyển hàng"
        breadcrumb={[
          {
            name: "Kho hàng",
          },
          {
            name: "Chuyển hàng",
          },
        ]}
        extra={renderExtraContainer()}
      >
        <Card>
          <Tabs style={{ overflow: "initial" }} activeKey={activeTab}>
            <TabPane
              tab={<Link to={InventoryTransferTabUrl.LIST}>Danh sách phiếu</Link>}
              key={`${UrlConfig.INVENTORY_TRANSFERS}/`}
            >
              {activeTab === `${UrlConfig.INVENTORY_TRANSFERS}/` && (
                <InventoryTransferTab
                  activeTab={activeTab}
                  vExportTransfer={vExportTransfer}
                  setVExportTransfer={setVExportTransfer}
                  vExportDetailTransfer={vExportDetailTransfer}
                  setVExportDetailTransfer={setVExportDetailTransfer}
                  stores={stores}
                  accounts={accounts}
                  defaultAccountProps={defaultAccountProps}
                  accountStores={accountStores}
                  setAccounts={(value) => setAccounts([...value, ...accounts])}
                />
              )}
            </TabPane>
            <TabPane
              tab={<Link to={InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER}>Chuyển đi <span className="count-number">({countTransferOut})</span></Link>}
              key={InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER}
            >
              {activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER && (
                <InventoryTransferTab
                  activeTab={activeTab}
                  vExportTransfer={vExportTransfer}
                  setVExportTransfer={setVExportTransfer}
                  vExportDetailTransfer={vExportDetailTransfer}
                  setVExportDetailTransfer={setVExportDetailTransfer}
                  stores={stores}
                  accounts={accounts}
                  defaultAccountProps={defaultAccountProps}
                  setCountTransferOut={(value) => dispatch({
                    type: InventoryType.COUNT_TRANSFER_OUT,
                    payload: {
                      countTransferOut: value,
                    },
                  })}
                  accountStores={accountStores}
                  setAccounts={(value) => setAccounts([...value, ...accounts])}
                />
              )}
            </TabPane>
            <TabPane
              tab={<Link to={InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE}>Chuyển đến <span className="count-number">({countTransferIn})</span></Link>}
              key={InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE}
            >
              {activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE && (
                <InventoryTransferTab
                  activeTab={activeTab}
                  vExportTransfer={vExportTransfer}
                  setVExportTransfer={setVExportTransfer}
                  vExportDetailTransfer={vExportDetailTransfer}
                  setVExportDetailTransfer={setVExportDetailTransfer}
                  stores={stores}
                  accounts={accounts}
                  defaultAccountProps={defaultAccountProps}
                  setCountTransferIn={(value) => dispatch({
                    type: InventoryType.COUNT_TRANSFER_IN,
                    payload: {
                      countTransferIn: value,
                    },
                  })}
                  accountStores={accountStores}
                  setAccounts={(value) => setAccounts([...value, ...accounts])}
                />
              )}
            </TabPane>
            <TabPane
              tab={<Link to={InventoryTransferTabUrl.LIST_EXPORT_IMPORT}>Sản phẩm chuyển kho</Link>}
              key={InventoryTransferTabUrl.LIST_EXPORT_IMPORT}
            >
              {activeTab === InventoryTransferTabUrl.LIST_EXPORT_IMPORT && (
                <ExportImportTab
                  activeTab={activeTab}
                  stores={stores}
                  accounts={accounts}
                  defaultAccountProps={defaultAccountProps}
                  vExportDetailTransfer={vExportDetailTransfer}
                  setVExportDetailTransfer={setVExportDetailTransfer}
                  accountStores={userReducer.account?.account_stores}
                  setAccounts={(value) => setAccounts([...value, ...accounts])}
                />
              )}
            </TabPane>
            <TabPane
              tab={<Link to={InventoryTransferTabUrl.HISTORIES}>Lịch sử phiếu</Link>}
              key={InventoryTransferTabUrl.HISTORIES}
            >
              <HistoryInventoryTransferTab
                stores={stores}
                accounts={accounts}
                defaultAccountProps={defaultAccountProps}
                accountStores={accountStores}
                setAccounts={(value) => setAccounts([...value, ...accounts])}
              />
            </TabPane>
          </Tabs>
        </Card>
      </ContentContainer>
    </ListTicketStylesWrapper>
  );
};
export default InventoryListScreen;
