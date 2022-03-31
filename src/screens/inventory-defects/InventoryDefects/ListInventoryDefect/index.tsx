import { Row, Space } from "antd"
import AuthWrapper from "component/authorization/AuthWrapper"
import ContentContainer from "component/container/content.container"
import ButtonCreate from "component/header/ButtonCreate"
import { InventoryDefectsPermission } from "config/permissions/inventory-defects.permission"
import UrlConfig from "config/url.config"
import ListInventoryDefect from './ListInventoryDefect'


const InventoryDefects: React.FC = () => {
    return (
        <ContentContainer 
        title="Hàng lỗi"
        breadcrumb={[
          {
            name: "Kho hàng",
            path: UrlConfig.HOME,
          },
          {
            name: "Hàng lỗi",
            path: UrlConfig.INVENTORY_DEFECTS,
          },
        ]}
        extra={
          <Row>
            <Space>
              <AuthWrapper
                acceptPermissions={[InventoryDefectsPermission.create]}
              >
                <ButtonCreate child="Thêm hàng lỗi" path={`${UrlConfig.INVENTORY_DEFECTS}/create`} />
              </AuthWrapper>
            </Space>
          </Row>
        }
      > 
        <ListInventoryDefect />
      </ContentContainer>
    )
}

export default InventoryDefects