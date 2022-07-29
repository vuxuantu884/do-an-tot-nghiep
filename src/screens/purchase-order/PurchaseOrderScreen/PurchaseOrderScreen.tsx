import { Button, Card, Row, Space, Tabs } from "antd";
import exportIcon from "assets/icon/export.svg";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import RenderTabBar from "component/table/StickyTabBar";
import { PurchaseOrderPermission } from "config/permissions/purchase-order.permission";
import UrlConfig from "config/url.config";
import { useEffect, useState } from "react";
import { Link, RouteComponentProps, useHistory } from "react-router-dom";
import { PurchaseOrderTabUrl } from "../helper";
import PurchaseOrderListScreen from "../purchase-order-list.screen";
import PurchaseOrderReturnList from "../tab/PurchaseOrderReturn/PurchaseOrderReturn";
import { PurchaseOrderStyleWrapper } from "./style";

const { TabPane } = Tabs;
const PurchaseOrderScreen: React.FC<RouteComponentProps> = (props) => {
  const history = useHistory();
  const path = history.location.pathname;

  const [activeTab, setActiveTab] = useState<string>(PurchaseOrderTabUrl.LIST);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isError, setError] = useState(false);

  useEffect(() => {
    if (Object.values(PurchaseOrderTabUrl).includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab(PurchaseOrderTabUrl.LIST);
    }
  }, [path]);
  return (
    <PurchaseOrderStyleWrapper>
      <ContentContainer
        isError={isError}
        title="Quản lý đơn đặt hàng"
        breadcrumb={[
          {
            name: "Nhà cung cấp",
            path: UrlConfig.HOME,
          },
          {
            name: "Đơn đặt hàng",
          },
        ]}
        extra={
          path === PurchaseOrderTabUrl.LIST && (
            <Row>
              <Space>
                <Button
                  hidden
                  className="light"
                  size="large"
                  icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                  onClick={() => {
                    setShowExportModal(true);
                  }}
                >
                  Xuất file
                </Button>
                <AuthWrapper acceptPermissions={[PurchaseOrderPermission.create]}>
                  <ButtonCreate
                    child="Thêm đơn đặt hàng"
                    path={`${UrlConfig.PURCHASE_ORDERS}/create`}
                  />
                </AuthWrapper>
              </Space>
            </Row>
          )
        }
      >
        <Card className="card-tab">
          <Tabs style={{ overflow: "initial" }} activeKey={activeTab} renderTabBar={RenderTabBar}>
            <TabPane
              tab={<Link to={PurchaseOrderTabUrl.LIST}>Danh sách đơn đặt hàng</Link>}
              key={PurchaseOrderTabUrl.LIST}
            >
              <PurchaseOrderListScreen
                showExportModal={showExportModal}
                setShowExportModal={setShowExportModal}
                setError={setError}
              />
            </TabPane>
            <TabPane
              tab={<Link to={PurchaseOrderTabUrl.RETURN}>Danh sách phiếu trả hàng</Link>}
              key={PurchaseOrderTabUrl.RETURN}
            >
              <PurchaseOrderReturnList />
            </TabPane>
          </Tabs>
        </Card>
      </ContentContainer>
    </PurchaseOrderStyleWrapper>
  );
};

export default PurchaseOrderScreen;
