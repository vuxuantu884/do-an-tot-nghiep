import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import { StickyUnderNavbar } from "component/container/sticky-under-navbar";
import UrlConfig from "config/url.config";
import { AccountGetByIdtAction } from "domain/actions/account/account.action";
import {
  AccountResponse
} from "model/account/account.model";
import React, { useCallback, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { AccountDetailStyle } from "../account.detail.style";
import AccountDetailProvider, {
  AccountDetailContext
} from "../provider/account.detail.provider";
import AccountPermissionTab from "./account.permission.tab";
import AccountViewTab from "./account.view.tab";

const { TabPane } = Tabs;

enum TabName {
  DETAIL_TAB = "DETAIL_TAB",
  PERMISSION_TAB = "PERMISSION_TAB",
}

function AccountDetail() {
  const dispatch = useDispatch();
  const { code } = useParams<{ code: string }>();
  const detailContext = useContext(AccountDetailContext);
  const { setAccountInfo, setUserCode, setRoleName } = detailContext;

  useEffect(() => {
    setUserCode && setUserCode(code);
  }, [setUserCode, code]);

  const setAccount = useCallback(
    (data: AccountResponse) => {
      
      // if (data?.account_roles) {
      //   setRoleName && setRoleName(data.account_roles.map((role) => role.role_name).join(", "));
      // } else {
      //   setRoleName && setRoleName("");
      // }
      setRoleName && setRoleName(data?.permissions.role[0].name); // dumy for demo 
      setAccountInfo && setAccountInfo(data);
    },
    [setAccountInfo, setRoleName]
  );

  useEffect(() => {
    dispatch(AccountGetByIdtAction(code, setAccount));
  }, [code, setAccount, dispatch]);

  const renderTabBar = (props: any, DefaultTabBar: React.ComponentType) => (
    <StickyUnderNavbar>
      <DefaultTabBar {...props} />
    </StickyUnderNavbar>
  );

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
            // activeKey={activeTab}
            // onChange={(active) =>
            //   history.replace(`${history.location.pathname}#${active}`)
            // }
            renderTabBar={renderTabBar}
          >
            <TabPane tab="Thông tin cơ bản" key={TabName.DETAIL_TAB}>
              <AccountViewTab />
            </TabPane>
            <TabPane tab="Thông tin phân quyền" key={TabName.PERMISSION_TAB}>
              <AccountPermissionTab />
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
