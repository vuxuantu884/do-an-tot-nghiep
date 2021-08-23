import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { StyledComponent } from "./styles";
import IconHVC1 from "./images/hvc1.svg";
import IconHVC2 from "./images/hvc2.svg";
import IconHVC3 from "./images/hvc3.svg";
import IconEdit from "./images/edit.svg";
import IconConnect from "./images/connect.svg";
import { Card, Row } from "antd";

const ThirdPartyLogisticsIntegration: React.FC = () => {
  const listThirdPartyLogistics = [
    {
      name: "Giao hàng nhanh",
      image: IconHVC1,
    },
  ];
  return (
    <StyledComponent>
      <ContentContainer
        title="Kết nối hãng vận chuyển"
        breadcrumb={[
          {
            name: "Tổng quan",
            path: UrlConfig.HOME,
          },
          {
            name: "Cài đặt",
            path: UrlConfig.ACCOUNTS,
          },
          {
            name: "Kết nối hãng vận chuyển",
          },
        ]}
      >
        <Card style={{ padding: "35px 15px" }}>
          <Row></Row>
        </Card>
        third-party-logistics-integration
      </ContentContainer>
    </StyledComponent>
  );
};

export default ThirdPartyLogisticsIntegration;
