import {Button, Card, Row, Space, Tabs} from "antd";
import exportIcon from "assets/icon/export.svg";
import importIcon from "assets/icon/import.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import RenderTabBar from "component/table/StickyTabBar";
import {ProductPermission} from "config/permissions/product.permission";
import UrlConfig, {ProductTabUrl} from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import React, {useEffect, useState} from "react";
import {Link, useHistory, useRouteMatch} from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import TabHistoryInfo from "../tab/TabHistoryInfo";
import TabHistoryPrice from "../tab/TabHistoryPrice";
import TabProduct from "../tab/TabProduct";
import TabProductWrapper from "../tab/TabProductWrapper";
const {TabPane} = Tabs;

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
  const [activeTab, setActiveTab] = useState<string>(ProductTabUrl.VARIANTS);
  const history = useHistory();
  let match = useRouteMatch();
  const {path} = match;

  useEffect(() => {
    let redirectUrl = path;
    if (!path || !Object.values(ProductTabUrl).includes(path)) {
      if (canReadVariants) {
        history.replace(ProductTabUrl.VARIANTS);
        return;
      }
      if (canReadProducts) {
        history.replace(ProductTabUrl.PRODUCTS);
        return;
      }
      if (canReadHistories) {
        history.replace(ProductTabUrl.PRODUCT_HISTORIES);
        return;
      }
    }

    if (redirectUrl === ProductTabUrl.VARIANTS && canReadVariants) {
      setActiveTab(ProductTabUrl.VARIANTS);
    } else if (redirectUrl === ProductTabUrl.VARIANTS) {
      redirectUrl = ProductTabUrl.PRODUCTS;
    }

    if (redirectUrl === ProductTabUrl.PRODUCTS && canReadProducts) {
      history.replace(redirectUrl);
      setActiveTab(ProductTabUrl.PRODUCTS);
    } else if (redirectUrl === ProductTabUrl.PRODUCTS) {
      redirectUrl = ProductTabUrl.PRODUCT_HISTORIES;
    }

    if (canReadHistories) {
      if (redirectUrl === ProductTabUrl.PRODUCT_HISTORIES) {
        history.replace(redirectUrl);
        setActiveTab(ProductTabUrl.PRODUCT_HISTORIES);
      }
      if (redirectUrl === ProductTabUrl.HISTORY_PRICES) {
        history.replace(redirectUrl);
        setActiveTab(ProductTabUrl.HISTORY_PRICES);
      }
    }
  }, [path, canReadHistories, canReadVariants, canReadProducts, history]);

  const defaultTabs = [
    {
      name: "Danh sách sản phẩm",
      key: ProductTabUrl.VARIANTS,
      component: <TabProduct />,
      isShow: canReadVariants,
    },
    {
      name: "Danh sách cha",
      key: ProductTabUrl.PRODUCTS,
      component: <TabProductWrapper />,
      isShow: canReadProducts,
    },
    {
      name: "Lịch sử sản phẩm",
      key: ProductTabUrl.PRODUCT_HISTORIES,
      component: <TabHistoryInfo />,
      isShow: canReadHistories,
    },
    {
      name: "Lịch sử giá",
      key: ProductTabUrl.HISTORY_PRICES,
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
              <ButtonCreate currentPage={true} child="Thêm sản phẩm" path={`${UrlConfig.PRODUCT}/create`} />{" "}
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
            history.replace(active);
          }}
          renderTabBar={RenderTabBar}
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
