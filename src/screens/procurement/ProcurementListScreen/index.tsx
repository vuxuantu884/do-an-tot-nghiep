import { Button, Card, Row, Space, Tabs } from "antd";
import ContentContainer from "component/container/content.container";
import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig, { ProcurementTabUrl } from "config/url.config";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { Link, useHistory } from "react-router-dom";
import AuthWrapper from "component/authorization/AuthWrapper";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import { GoPlus } from "react-icons/go";
import exportIcon from "assets/icon/export.svg";
import { StyledComponent as ProcurementStyleWrapper } from "./styles";
const TabCurrent = React.lazy(() =>
  import("../tabs").then((module) => ({ default: module.TabCurrent })),
);
const TabList = React.lazy(() => import("../tabs").then((module) => ({ default: module.TabList })));
const TabProducts = React.lazy(() =>
  import("../tabs").then((module) => ({ default: module.TabProducts })),
);
const TabLogs = React.lazy(() => import("../tabs").then((module) => ({ default: module.TabLogs })));

const { TabPane } = Tabs;
const ProcurementListScreen: React.FC<RouteComponentProps> = () => {
  const history = useHistory();
  const path = history.location.pathname;

  const [activeTab, setActiveTab] = useState<string>(ProcurementTabUrl.ALL);
  const [isShowExportDetailProcurement, setIsShowExportDetailProcurement] = useState(false);

  useEffect(() => {
    if (Object.values(ProcurementTabUrl).includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab(ProcurementTabUrl.ALL);
    }
  }, [path]);

  return (
    <ProcurementStyleWrapper>
      <ContentContainer
        title="Danh sách phiếu nhập kho"
        breadcrumb={[
          {
            name: "Nhà cung cấp",
            path: UrlConfig.HOME,
          },
          {
            name: "Phiếu nhập kho",
          },
        ]}
        extra={
          <Row>
            <Space>
              {activeTab === ProcurementTabUrl.ALL && (
                <Button
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                  onClick={() => {
                    setIsShowExportDetailProcurement(true);
                  }}
                >
                  Xuất file chi tiết
                </Button>
              )}
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.procurements_create]}>
                <Button
                  type="primary"
                  className="ant-btn-primary"
                  size={"large"}
                  icon={<GoPlus style={{ marginRight: "0.2em" }} />}
                  onClick={() => history.push(`${UrlConfig.PROCUREMENT}/create`)}
                >
                  Nhập kho bằng tải file
                </Button>
              </AuthWrapper>
              <AuthWrapper acceptPermissions={[PurchaseOrderPermission.procurements_create]}>
                <Button
                  type="primary"
                  className="ant-btn-primary"
                  size={"large"}
                  icon={<GoPlus style={{ marginRight: "0.2em" }} />}
                  onClick={() => history.push(`${UrlConfig.PROCUREMENT}/create-manual`)}
                >
                  Nhập kho thủ công
                </Button>
              </AuthWrapper>
            </Space>
          </Row>
        }
      >
        <Card className="card-tab">
          <Tabs
            style={{ overflow: "initial" }}
            activeKey={activeTab}
            renderTabBar={RenderTabBar}
            onChange={(active) => {
              history.replace(active);
            }}
          >
            <TabPane
              tab={<Link to={ProcurementTabUrl.ALL}>Danh sách phiếu nhập kho</Link>}
              key={ProcurementTabUrl.ALL}
            >
              <TabList
                isShowExportDetailProcurement={isShowExportDetailProcurement}
                setIsShowExportDetailProcurement={setIsShowExportDetailProcurement}
              />
            </TabPane>
            <TabPane
              tab={<Link to={ProcurementTabUrl.TODAY}>Nhập kho hôm nay</Link>}
              key={ProcurementTabUrl.TODAY}
            >
              <TabCurrent />
            </TabPane>
            <TabPane
              tab={<Link to={ProcurementTabUrl.PRODUCTS}>Danh sách sản phẩm nhập kho</Link>}
              key={ProcurementTabUrl.PRODUCTS}
            >
              <TabProducts />
            </TabPane>
            <TabPane
              tab={<Link to={ProcurementTabUrl.LOGS}>Lịch sử phiếu nhập kho</Link>}
              key={ProcurementTabUrl.LOGS}
            >
              <TabLogs />
            </TabPane>
          </Tabs>
        </Card>
      </ContentContainer>
    </ProcurementStyleWrapper>
  );
};

export default ProcurementListScreen;
