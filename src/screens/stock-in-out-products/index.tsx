import { Button, Card, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
// import RenderTabBar from "component/table/StickyTabBar";
import UrlConfig from "config/url.config";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
// import TabCurrent from "./tabs/TabCurrent";
// import TabSevenDays from "./tabs/TabSevenDays";
import { GoPlus } from "react-icons/go";
import AuthWrapper from "component/authorization/AuthWrapper";
import { StockInOutOthersPermission } from "config/permissions/stock-in-out.permission";
import StockInOutOtherList from "./StockInOutOtherList";

const InventoryImportExportScreen: React.FC<RouteComponentProps> = (props) => {
  const history = useHistory();
  // const path = history.location.pathname;

  return (
    <ContentContainer
      title="Danh sách phiếu nhập xuất khác"
      breadcrumb={[
        {
          name: "Kho hàng",
          path: UrlConfig.HOME,
        },
        {
          name: "Nhập xuất khác",
        },
      ]}
      extra={
        <Row>
          <Space>
            <AuthWrapper acceptPermissions={[StockInOutOthersPermission.create]}>
            <Button
              type="primary"
              className="ant-btn-primary"
              size={"large"}
              icon={<GoPlus style={{ marginRight: "0.2em" }} />}
              onClick={() => history.push(`${UrlConfig.STOCK_IN_OUT_OTHERS}/create-stock-in`)}
            >
              Nhập khác
            </Button>
            </AuthWrapper>
            <AuthWrapper acceptPermissions={[StockInOutOthersPermission.create]}>
            <Button
              type="primary"
              className="ant-btn-primary"
              size={"large"}
              icon={<GoPlus style={{ marginRight: "0.2em" }} />}
              onClick={() => history.push(`${UrlConfig.STOCK_IN_OUT_OTHERS}/create-stock-out`)}
            >
              Xuất khác
            </Button>
            </AuthWrapper>
          </Space>
        </Row>
      }
    >
      <Card className="card-tab">
        <StockInOutOtherList />
      </Card>
    </ContentContainer>
  );
};

export default InventoryImportExportScreen;
