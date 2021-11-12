import {Button, Card, Row, Space, Tabs} from "antd";
import exportIcon from "assets/icon/export.svg";
import importIcon from "assets/icon/import.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import {StickyUnderNavbar} from "component/container/sticky-under-navbar";
import ButtonCreate from "component/header/ButtonCreate";
import {ProductPermission} from "config/permissions/product.permission";
import UrlConfig from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import React, {useEffect, useState} from "react";
import {Link, useHistory, useParams} from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import {ProductTabId} from "utils/Constants";
import TabHistoryInfo from "../tab/TabHistoryInfo";
import TabHistoryPrice from "../tab/TabHistoryPrice";
import TabProduct from "../tab/TabProduct";
import TabProductWrapper from "../tab/TabProductWrapper";
const {TabPane} = Tabs;

// const renderTabBar = (props: any, DefaultTabBar: React.ComponentType) => (
//   <StickyUnderNavbar>
//     <DefaultTabBar {...props} />
//   </StickyUnderNavbar>
// );

const ListProductScreen: React.FC = () => {
  const [canReadHistories] = useAuthorization({
    acceptPermissions: [ProductPermission.read_histories],
  });
  const [canReadVariants] = useAuthorization({
    acceptPermissions: [ProductPermission.read_variant],
  });
  const [canReadProducts] = useAuthorization({
    acceptPermissions: [ProductPermission.read],
  });
  const [activeTab, setActiveTab] = useState<string>(ProductTabId.VARIANTS);
  const history = useHistory();
  let {tabId} = useParams<{tabId: string}>();
  console.log(tabId);

  useEffect(() => {
    if (!tabId || !Object.values(ProductTabId).includes(tabId)) {
      if (canReadVariants) {
        setActiveTab(ProductTabId.VARIANTS);
        return;
      }
      if (canReadProducts) {
        setActiveTab(ProductTabId.PARENT_LIST);
        return;
      }
      if (canReadHistories) {
        setActiveTab(ProductTabId.PRODUCT_HISTORY);
        return;
      }
    }

    if (tabId === ProductTabId.VARIANTS && canReadVariants) {
      setActiveTab(ProductTabId.VARIANTS);
    }

    if (tabId === ProductTabId.PARENT_LIST && canReadProducts) {
      setActiveTab(ProductTabId.PARENT_LIST);
    }

    if (canReadHistories) {
      if (tabId === ProductTabId.PRODUCT_HISTORY) {
        setActiveTab(ProductTabId.PRODUCT_HISTORY);
      }
      if (tabId === ProductTabId.PRICE_HISTORY) {
        setActiveTab(ProductTabId.PRICE_HISTORY);
      }
    }
  }, [tabId, canReadHistories, canReadVariants, canReadProducts]);

  const defaultTabs = [
    {
      name: "Danh sách sản phẩm",
      key: ProductTabId.VARIANTS,
      component: <TabProduct />,
      isShow: canReadVariants,
    },
    {
      name: "Danh sách cha",
      key: ProductTabId.PARENT_LIST,
      component: <TabProductWrapper />,
      isShow: canReadProducts,
    },
    {
      name: "Lịch sử sản phẩm",
      key: ProductTabId.PRODUCT_HISTORY,
      component: <TabHistoryInfo />,
      isShow: canReadHistories,
    },
    {
      name: "Lịch sử giá",
      key: ProductTabId.PRICE_HISTORY,
      component: <TabHistoryPrice />,
      isShow: canReadHistories,
    },
  ];
  const tabs = defaultTabs.filter((tab) => tab.isShow);

  return (
    <ContentContainer
      title="Quản lý sản phẩm"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Sản phẩm",
        },
      ]}
      extra={
        <Row>
          <Space>
            <AuthWrapper acceptPermissions={[ProductPermission.import_excel]}>
              <Link to={`${UrlConfig.PRODUCT}/import`}>
                <Button
                  className="light"
                  size="large"
                  icon={<img src={importIcon} style={{marginRight: 8}} alt="" />}
                >
                  Nhập file
                </Button>
              </Link>
            </AuthWrapper>
            <Button
              className="light"
              size="large"
              icon={<img src={exportIcon} style={{marginRight: 8}} alt="" />}
              onClick={() => {}}
            >
              Xuất file
            </Button>
            <AuthWrapper acceptPermissions={[ProductPermission.create]}>
              {" "}
              <ButtonCreate path={`${UrlConfig.PRODUCT}/create`} />{" "}
            </AuthWrapper>
          </Space>
        </Row>
      }
    >
      <Card className="card-tab">
        <Tabs
          style={{overflow: "initial"}}
          activeKey={activeTab}
          onChange={(active) => {
            const targetUrl = UrlConfig.PRODUCT + "/" + active + "/tabs";
            history.replace(targetUrl);
          }}
          // renderTabBar={renderTabBar}
        >
          {tabs.map((tab) => {
            if (tab.isShow) {
              return (
                <TabPane tab={tab.name} key={tab.key}>
                  {tab.component}
                </TabPane>
              );
            } else {
              return <NoPermission />;
            }
          })}
        </Tabs>
      </Card>
    </ContentContainer>
  );
};

export default ListProductScreen;
