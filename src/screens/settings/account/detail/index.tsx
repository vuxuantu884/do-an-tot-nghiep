import { Card, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig from "config/url.config";
import { AccountGetByCodeAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import React, { useCallback, useContext, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router";
import { AccountDetailStyle } from "../account.detail.style";
import AccountDetailProvider, {
  AccountDetailContext
} from "../provider/account.detail.provider";
import AccountPermissionTab from "./account.permission.tab";
import AccountViewTab from "./account.view.tab";

const {TabPane} = Tabs;

enum TabName {
  DETAIL_TAB = "DETAIL_TAB",
  PERMISSION_TAB = "PERMISSION_TAB",
}

function AccountDetail() {
  const dispatch = useDispatch();
  const {code} = useParams<{code: string}>();
  const detailContext = useContext(AccountDetailContext);
  const {setAccountInfo, setUserCode, accountInfo} = detailContext;

  const AccountStatus = () => {
    let Status = <></>
    if (accountInfo?.status?.toLocaleLowerCase() === "active") {
      Status = <span className="text-success">Hoạt động</span>
    } else {
      Status = <span className="text-error">Ngừng hoạt động</span>
    }
    return <div className="account-title">Trạng thái: &nbsp;<b>{Status}</b></div>;
  }

  useEffect(() => {
    setUserCode && setUserCode(code);
  }, [setUserCode, code]);

  const setAccount = useCallback(
    (data: AccountResponse) => {
      setAccountInfo && setAccountInfo(data);
    },
    [setAccountInfo]
  );

  const getAccountData = useCallback(() => {
    dispatch(AccountGetByCodeAction(code, setAccount));
  }, [dispatch, code, setAccount]);

  useEffect(() => {
    getAccountData();
  }, [getAccountData]);

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
          <Tabs style={{overflow: "initial"}} 
          renderTabBar={RenderTabBar}
          tabBarExtraContent={<AccountStatus/>}
          >
            <TabPane tab="Thông tin cơ bản" key={TabName.DETAIL_TAB}>
              <AccountViewTab />
            </TabPane>
            <TabPane tab="Thông tin phân quyền" key={TabName.PERMISSION_TAB}>
              <AccountPermissionTab getAccountData={getAccountData}/>
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
