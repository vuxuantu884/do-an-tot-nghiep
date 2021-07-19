import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import ButtonCreate from "component/header/ButtonCreate";
import UrlConfig from "config/UrlConfig";

const PurchaseOrderListScreen: React.FC = () => {
  return (
    <ContentContainer
      title="Quản lý đơn đặt hàng"
      breadcrumb={[
        {
          name: "Tổng quản",
          path: UrlConfig.HOME,
        },
        {
          name: "Đặt hàng",
          path: `${UrlConfig.PURCHASE_ORDER}`,
        },
      ]}
      extra={<ButtonCreate path={`${UrlConfig.PURCHASE_ORDER}/create`} />}
    >
      <Card>
      </Card>
    </ContentContainer>
  );
};

export default PurchaseOrderListScreen;
