import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig from "config/url.config";
import { AccountGetByCodeAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Link, useRouteMatch } from "react-router-dom";
import { AccountDetailStyle } from "../account.detail.style";
import AccountDetailProvider, { AccountDetailContext } from "../provider/account.detail.provider";
import AccountPermissionTab from "./account.permission.tab";
import AccountViewTab from "./account.view.tab";
const { TabPane } = Tabs;

function AccountDetail() {
  const { url } = useRouteMatch();
  const dispatch = useDispatch();
  const { code } = useParams<{ code: string }>();
  const [activeTab, setActiveTab] = useState<string>("");
  const detailContext = useContext(AccountDetailContext);
  const { setAccountInfo, setUserCode, accountInfo } = detailContext;

  const userDetailUrl = `${UrlConfig.ACCOUNTS}/${code}`;
  const userPermissionUrl = `${UrlConfig.ACCOUNTS}/${code}/permissions`;

  const AccountStatus = () => {
    let Status = <></>;
    if (accountInfo?.status?.toLocaleLowerCase() === "active") {
      Status = <span className="text-success">Hoạt động</span>;
    } else {
      Status = <span className="text-error">Ngừng hoạt động</span>;
    }
    return (
      <div className="account-title">
        Trạng thái: &nbsp;<b>{Status}</b>
      </div>
    );
  };

  const setAccount = useCallback(
    (data: AccountResponse) => {
      setAccountInfo && setAccountInfo(data);
    },
    [setAccountInfo],
  );

  const getAccountData = useCallback(() => {
    setUserCode?.(code);
    dispatch(AccountGetByCodeAction(code, setAccount));
  }, [dispatch, code, setAccount, setUserCode]);

  useEffect(() => {
    getAccountData();
  }, [getAccountData]);

  useEffect(() => {
    if (url) {
      setActiveTab(url);
    }
  }, [url]);

  return (
    <ContentContainer
      title="Thông tin người dùng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Quản lý người dùng",
          path: UrlConfig.ACCOUNTS,
        },
        {
          name: "Thông tin người dùng",
        },
      ]}
    >
      <AccountDetailStyle>
        <Card className="card-tab">
          <Tabs
            style={{ overflow: "initial" }}
            renderTabBar={RenderTabBar}
            tabBarExtraContent={<AccountStatus />}
            activeKey={activeTab}
          >
            <TabPane tab={<Link to={userDetailUrl}>Thông tin cơ bản</Link>} key={userDetailUrl}>
              <AccountViewTab />
            </TabPane>
            <TabPane
              tab={<Link to={userPermissionUrl}>Thông tin phân quyền</Link>}
              key={userPermissionUrl}
            >
              <AccountPermissionTab getAccountData={getAccountData} />
            </TabPane>
          </Tabs>
        </Card>
      </AccountDetailStyle>
    </ContentContainer>
  );
}
const AccountDetailProvide = () => (
  <AccountDetailProvider>
    <AccountDetail />
  </AccountDetailProvider>
);
export default AccountDetailProvide;
