import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Row, Space, Tabs } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import RenderTabBar from "component/table/StickyTabBar";
import { ProductPermission } from "config/permissions/product.permission";
import UrlConfig, { ProductTabUrl } from "config/url.config";
import useAuthorization from "hook/useAuthorization";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GoPlus } from "react-icons/go";
import { Link, useHistory, useRouteMatch } from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import { StyledComponent } from "../tab/style";
import "./index.scss"
const { TabPane } = Tabs;

const TabProduct = React.lazy(() => import("../tab/TabProduct"));
const TabProductWrapper = React.lazy(() => import("../tab/TabProductWrapper"));
const TabHistoryInfo = React.lazy(() => import("../tab/TabHistoryInfo"));
const TabHistoryPrice = React.lazy(() => import("../tab/TabHistoryPrice"));
const TabHistoryInStamp = React.lazy(() => import("../tab/TabHistoryInStamp"));

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
  const [activeTab, setActiveTab] = useState<string | "">("");
  const [visiblePickManyModal, setVisiblePickManyModal] = useState(false);
  const history = useHistory();
  let match = useRouteMatch();
  const { path } = match;
  const [vExportProduct, setVExportProduct] = useState(false);

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
      setActiveTab(ProductTabUrl.PRODUCTS);
    } else if (redirectUrl === ProductTabUrl.PRODUCTS) {
      redirectUrl = ProductTabUrl.PRODUCT_HISTORIES;
    }

    if (canReadHistories) {
      if (redirectUrl === ProductTabUrl.PRODUCT_HISTORIES) {
        setActiveTab(ProductTabUrl.PRODUCT_HISTORIES);
      }
      if (redirectUrl === ProductTabUrl.HISTORY_PRICES) {
        setActiveTab(ProductTabUrl.HISTORY_PRICES);
      }
      if (redirectUrl === ProductTabUrl.STAMP_PRINTING_HISTORY) {
        setActiveTab(ProductTabUrl.STAMP_PRINTING_HISTORY);
      }
    }
  }, [path, canReadHistories, canReadVariants, canReadProducts, history]);

  const onTogglePickManyModal = useCallback(() => {
    history.push(`${UrlConfig.PRODUCT}/barcode`);
  }, []);

  const defaultTabs = useMemo(() => {
    return [
      {
        name: "Danh sách sản phẩm",
        key: ProductTabUrl.VARIANTS,
        component: (
          <TabProduct vExportProduct={vExportProduct} setVExportProduct={setVExportProduct} />
        ),
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
      {
        name: "Lịch sử in tem",
        key: ProductTabUrl.STAMP_PRINTING_HISTORY,
        component: (
          <TabHistoryInStamp
            setVExportProduct={setVExportProduct}
            vExportProduct={vExportProduct}
            onTogglePickManyModal={onTogglePickManyModal}
            visiblePickManyModal={visiblePickManyModal}
          />
        ),
        isShow: canReadHistories,
      },
    ];
  }, [
    canReadHistories,
    canReadVariants,
    canReadProducts,
    vExportProduct,
    onTogglePickManyModal,
    visiblePickManyModal,
  ]);
  const tabs = useMemo(() => defaultTabs.filter((tab) => tab.isShow), [defaultTabs]);

  return (
    <ContentContainer
      title="Quản lý sản phẩm"
      breadcrumb={[
        {
          name: "Sản phẩm",
        },
        {
          name: "Quản lý sản phẩm",
        },
      ]}
      extra={
        <Row>
          <Space>
            <AuthWrapper acceptPermissions={[ProductPermission.import_excel]}>
              <Link to={`${UrlConfig.PRODUCT}/import`}>
                <Button
                  className="btn-view"
                  size="large"
                  icon={<UploadOutlined className="btn-view-icon"/>}
                >
                  Nhập file
                </Button>
              </Link>
            </AuthWrapper>
            {(activeTab === UrlConfig.VARIANTS ||
              activeTab === ProductTabUrl.STAMP_PRINTING_HISTORY) && (
              <AuthWrapper acceptPermissions={[ProductPermission.export_excel]}>
                <Button
                  className="btn-view"
                  size="large"
                  icon={<DownloadOutlined className="btn-view-icon"/>}
                  onClick={() => {
                    setVExportProduct(true);
                  }}
                >
                  Xuất file
                </Button>
              </AuthWrapper>
            )}
            {(activeTab === UrlConfig.PRODUCT || activeTab === UrlConfig.VARIANTS) && (
              <AuthWrapper acceptPermissions={[ProductPermission.create]}>
                {" "}
                <ButtonCreate child="Thêm sản phẩm" path={`${UrlConfig.PRODUCT}/create`} />{" "}
              </AuthWrapper>
            )}
            {activeTab === ProductTabUrl.STAMP_PRINTING_HISTORY && (
              <Button
                onClick={onTogglePickManyModal}
                size="large"
                type="primary"
                icon={<GoPlus style={{ marginRight: "0.2em" }} />}
              >
                In mã vạch
              </Button>
            )}
          </Space>
        </Row>
      }
    >
      <StyledComponent>
        <Card className="card-tab">
          <Tabs
            style={{ overflow: "initial" }}
            activeKey={activeTab}
            onChange={(active) => {
              setActiveTab(active);
              history.replace(active);
            }}
            renderTabBar={RenderTabBar}
          >
            {tabs.map((tab) => {
              if (tab.isShow) {
                return (
                  <TabPane tab={<Link to={`${tab.key}`}>{tab.name}</Link>} key={tab.key}>
                    {activeTab === tab.key && tab.component}
                  </TabPane>
                );
              } else {
                return <NoPermission />;
              }
            })}
          </Tabs>
        </Card>
      </StyledComponent>
    </ContentContainer>
  );
};

export default ListProductScreen;
