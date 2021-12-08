import {  Row, Space } from "antd";
import AuthWrapper from "component/authorization/AuthWrapper";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import { InventoryAdjustmentPermission } from "config/permissions/inventory-adjustment.permission";
import UrlConfig from "config/url.config";
import InventoryAdjustment from "./InventoryAdjustment";
import { StylesWrapper } from "./styles";

const ListInventoryAdjustments: React.FC = () => {

  return (
    <StylesWrapper>
      <ContentContainer 
        title="Kiểm kho"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Kho hàng",
            path: UrlConfig.HOME,
          },
          {
            name: "Kiểm kho",
          },
        ]}
        extra={
          <Row>
            <Space>
              <AuthWrapper
                acceptPermissions={[InventoryAdjustmentPermission.create]}
              >
                <ButtonCreate child="Thêm phiếu kiểm" path={`${UrlConfig.INVENTORY_ADJUSTMENTS}/create`} />
              </AuthWrapper>
            </Space>
          </Row>
        }
      >
        {/* Nội dung chính */}
        <InventoryAdjustment />
      </ContentContainer>
    </StylesWrapper>
  );
};
export default ListInventoryAdjustments;
