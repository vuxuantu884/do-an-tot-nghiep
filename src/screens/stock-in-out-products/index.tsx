import { Button, Card, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { RouteComponentProps } from "react-router";
import { useHistory } from "react-router-dom";
import AuthWrapper from "component/authorization/AuthWrapper";
import { StockInOutOthersPermission } from "config/permissions/stock-in-out.permission";
import StockInOutOtherList from "./StockInOutOtherList";
import exportIcon from "assets/icon/export.svg";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import { ExportModal } from "component";

const InventoryImportExportScreen: React.FC<RouteComponentProps> = (props) => {
  const history = useHistory();
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <ContentContainer
      title="Danh sách phiếu nhập xuất khác"
      breadcrumb={[
        {
          name: "Kho hàng",
          // path: UrlConfig.HOME,
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
                className="light"
                size="large"
                icon={<img src={exportIcon} style={{ marginRight: 8 }} alt="" />}
                onClick={() => {
                  setShowExportModal(true);
                }}
              >
                Xuất file chi tiết
              </Button>
            </AuthWrapper>
            <AuthWrapper acceptPermissions={[StockInOutOthersPermission.create]}>
              <Button
                type="primary"
                className="ant-btn-primary"
                size={"large"}
                icon={<PlusOutlined style={{ paddingTop: 2 }} />}
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
                icon={<PlusOutlined style={{ paddingTop: 2 }} />}
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
        <StockInOutOtherList
          showExportModal={showExportModal}
          setShowExportModal={setShowExportModal}
        />
      </Card>
    </ContentContainer>
  );
};

export default InventoryImportExportScreen;
