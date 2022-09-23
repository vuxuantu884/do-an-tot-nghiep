import { Button, Card, Dropdown, Menu, Row, Space, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import UrlConfig, { InventoryTransferTabUrl } from "config/url.config";
import { useCallback, useEffect, useState } from "react";
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
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { inventoryGetSenderStoreAction } from "domain/actions/inventory/stock-transfer/stock-transfer.action";
import { Store } from "model/inventory/transfer";
import { PageResponse } from "model/base/base-metadata.response";
import { Link, useLocation } from "react-router-dom";
import queryString from "query-string";
import exportIcon from "assets/icon/export.svg";
import { RootReducerType } from "model/reducers/RootReducerType";
import ExportImportTab from "./ListTicketTab/ExportImportTransfer";
import { getTransferRecordNumberApi } from "service/inventory/transfer/index.service";

const { TabPane } = Tabs;

const InventoryListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("");
  const [countTransferIn, setCountTransferIn] = useState<number>(0);
  const [countTransferOut, setCountTransferOut] = useState<number>(0);
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const history = useHistory();
  const { path } = useRouteMatch();
  const dispatch = useDispatch();
  const [vExportTransfer, setVExportTransfer] = useState(false);
  const [vExportDetailTransfer, setVExportDetailTransfer] = useState(false);

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
  };

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);

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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getRecordNumber = async () => {
    const res = await callApiNative({ isShowLoading: false }, dispatch, getTransferRecordNumberApi);
    if (res) {
      setCountTransferIn(res.count_transfer_in);
      setCountTransferOut(res.count_transfer_out);
    }
  };

  useEffect(() => {
    dispatch(searchAccountPublicAction({}, setDataAccounts));
    dispatch(inventoryGetSenderStoreAction({ status: "active", simple: true }, setStores));
    getRecordNumber().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, setDataAccounts]);

  const menuItems = [
    {
      name: "Nhập file 1 kho nhận",
      url: `${UrlConfig.INVENTORY_TRANSFERS}/import`
    },
    {
      name: "Nhập nhiều file 1 kho nhận",
      url: `${UrlConfig.INVENTORY_TRANSFERS}/import-multiple-file-one-store`
    },
    {
      name: "Nhập file nhiều kho nhận",
      url: `${UrlConfig.INVENTORY_TRANSFERS}/import-multiple`
    },
  ];

  const menuExportItems = [
    {
      name: "Nhập file danh sách",
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
                <img src={importIcon} style={{ marginRight: 8 }} alt="" /> Nhập file
              </Dropdown.Button>
            </AuthWrapper>
            <AuthWrapper acceptPermissions={[InventoryTransferPermission.request]}>
              <ButtonCreate children="Yêu cầu" path={`${UrlConfig.INVENTORY_TRANSFERS}/request`} />
            </AuthWrapper>
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
        <Card className="card-transfer">
          <div className="transferring-receive" style={{ fontSize: String(countTransferIn).length > 3 ? 8 : 9 }}>{countTransferIn}</div>
          <div className="transferring-sender" style={{ fontSize: String(countTransferOut).length > 3 ? 8 : 9 }}>{countTransferOut}</div>
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
                  accountStores={userReducer.account?.account_stores}
                  setAccounts={(value) => setAccounts([...value, ...accounts])}
                />
              )}
            </TabPane>
            <TabPane
              tab={<Link to={InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER}>Chuyển đi</Link>}
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
                  accountStores={userReducer.account?.account_stores}
                  setAccounts={(value) => setAccounts([...value, ...accounts])}
                />
              )}
            </TabPane>
            <TabPane
              tab={<Link to={InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE}>Chuyển đến</Link>}
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
                  accountStores={userReducer.account?.account_stores}
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
                accountStores={userReducer.account?.account_stores}
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
