import {Button, Card, Row, Space, Tabs } from "antd";
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
import { AccountResponse } from "../../../model/account/account.model";
import { callApiNative } from "../../../utils/ApiUtils";
import { searchAccountPublicApi } from "../../../service/accounts/account.service";
import { useDispatch, useSelector } from "react-redux";
import { searchAccountPublicAction } from "../../../domain/actions/account/account.action";
import { inventoryGetSenderStoreAction } from "../../../domain/actions/inventory/stock-transfer/stock-transfer.action";
import { Store } from "../../../model/inventory/transfer";
import { PageResponse } from "model/base/base-metadata.response";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import exportIcon from "assets/icon/export.svg";
import { RootReducerType } from "../../../model/reducers/RootReducerType";

const { TabPane } = Tabs;

const InventoryListScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('');
  const [stores, setStores] = useState<Array<Store>>([] as Array<Store>);
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const history = useHistory();
  const {path} = useRouteMatch();
  const dispatch = useDispatch();
  const [vExportTransfer,setVExportTransfer] = useState(false);
  const [vExportDetailTransfer,setVExportDetailTransfer] = useState(false);

  useEffect(() => {
    let redirectUrl = path;
    if (redirectUrl) {
      setActiveTab(redirectUrl);
    }
  }, [history, path]);

  const location = useLocation()

  const queryParamsParsed: any = queryString.parse(
    location.search
  );

  const getAccounts = async (codes: string) => {
    const initSelectedResponse = await callApiNative(
      { isShowError: true },
      dispatch,
      searchAccountPublicApi,
      {
        codes
      }
    );

    setAccounts((accounts) => {
      return [
        ...initSelectedResponse.items,
        ...accounts
      ];
    });
  }

  const userReducer = useSelector((state: RootReducerType) => state.userReducer);

  console.log(userReducer)

  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse> | false) => {
      if (!data) {
        return;
      }
      setAccounts(data.items);

      if (queryParamsParsed.created_by || queryParamsParsed.updated_by) {
        getAccounts(queryParamsParsed.created_by || queryParamsParsed.updated_by).then();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    dispatch(searchAccountPublicAction({}, setDataAccounts));
    dispatch(
      inventoryGetSenderStoreAction(
        { status: "active", simple: true },
        setStores
      )
    );
  }, [dispatch, setDataAccounts]);

  return (
    <ListTicketStylesWrapper>
      <ContentContainer
        title="Chuyển hàng"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Chuyển hàng",
          },
        ]}
        extra={
          (activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER || activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE
            || activeTab === InventoryTransferTabUrl.LIST) && (
            <Row>
              <Space>
              <Button
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
                  onClick={() => {setVExportTransfer(true)}}
                >
                  Xuất file danh sách
              </Button>
              <Button
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
                  onClick={() => {setVExportDetailTransfer(true)}}
                >
                  Xuất file chi tiết
              </Button>
                <AuthWrapper acceptPermissions={[InventoryTransferPermission.import]}>
                  <Button
                   className="light"
                   size="large"
                   icon={<img src={importIcon} style={{marginRight: 8}} alt="" />}
                    onClick={() =>
                      history.push(`${UrlConfig.INVENTORY_TRANSFERS}/import`)
                    }
                    type="ghost"
                  >
                    Nhập file
                  </Button>
                </AuthWrapper>
                <AuthWrapper acceptPermissions={[InventoryTransferPermission.create]}>
                  <ButtonCreate path={`${UrlConfig.INVENTORY_TRANSFERS}/create`} />
                </AuthWrapper>
              </Space>
            </Row>
          )
        }
      >
        <Card>
          <Tabs
            style={{overflow: "initial"}}
            activeKey={activeTab}
            onChange={(active) => history.replace(active)}
          >
            <TabPane tab="Danh sách phiếu" key={InventoryTransferTabUrl.LIST}>
              {activeTab === InventoryTransferTabUrl.LIST && (
                <InventoryTransferTab
                  activeTab={activeTab}
                  vExportTransfer={vExportTransfer} setVExportTransfer={setVExportTransfer}
                  vExportDetailTransfer={vExportDetailTransfer} setVExportDetailTransfer={setVExportDetailTransfer}
                  stores={stores}
                  accounts={accounts}
                  accountStores={userReducer.account?.account_stores}
                  setAccounts={(value) => setAccounts([
                    ...value,
                    ...accounts
                  ])}
                />
              )}
            </TabPane>
            <TabPane tab="Chuyển đi" key={InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER}>
              {activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER && (
                <InventoryTransferTab
                  activeTab={activeTab}
                  vExportTransfer={vExportTransfer} setVExportTransfer={setVExportTransfer}
                  vExportDetailTransfer={vExportDetailTransfer} setVExportDetailTransfer={setVExportDetailTransfer}
                  stores={stores}
                  accounts={accounts}
                  accountStores={userReducer.account?.account_stores}
                  setAccounts={(value) => setAccounts([
                    ...value,
                    ...accounts
                  ])}
                />
              )}
            </TabPane>
            <TabPane tab="Chuyển đến" key={InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE}>
              {activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE && (
                <InventoryTransferTab
                  activeTab={activeTab}
                  vExportTransfer={vExportTransfer} setVExportTransfer={setVExportTransfer}
                  vExportDetailTransfer={vExportDetailTransfer} setVExportDetailTransfer={setVExportDetailTransfer}
                  stores={stores}
                  accounts={accounts}
                  accountStores={userReducer.account?.account_stores}
                  setAccounts={(value) => setAccounts([
                    ...value,
                    ...accounts
                  ])}
                />
              )}
            </TabPane>
            <TabPane tab="Lịch sử phiếu" key={InventoryTransferTabUrl.HISTORIES}>
              <HistoryInventoryTransferTab
                stores={stores}
                accounts={accounts}
                accountStores={userReducer.account?.account_stores}
                setAccounts={(value) => setAccounts([
                  ...value,
                  ...accounts
                ])}
              />
            </TabPane>
          </Tabs>
        </Card>
      </ContentContainer>
    </ListTicketStylesWrapper>
  );
};
export default InventoryListScreen;
