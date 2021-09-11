import { Card } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { useQuery } from "utils/useQuery";
import { StyledComponent } from "./styles";

type PropType = {};

function OrderPrint(props: PropType) {

  const query = useQuery();

  console.log('query', query)
  return <StyledComponent>
  <ContentContainer
    title="Xử lý đơn hàng"
    breadcrumb={[
      {
        name: "Tổng quan",
        path: UrlConfig.HOME,
      },
      {
        name: "Đơn hàng",
        path: UrlConfig.ORDER,
      },
      {
        name: "Xem mẫu in",
      },
    ]}
  >
      <Card style={{ padding: "35px 15px" }}>
        Print
      </Card>
  </ContentContainer>
</StyledComponent>;
}

export default OrderPrint;
