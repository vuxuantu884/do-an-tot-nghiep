import {  Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
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
            name: "Tổng quản",
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
              <ButtonCreate child="Thêm phiếu kiểm" path={`${UrlConfig.INVENTORY_ADJUSTMENTS}/create`} />
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
