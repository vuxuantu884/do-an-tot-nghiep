import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { StyledComponent } from "./styles";
import IconHVC1 from "./images/hvc1.svg";
import IconHVC2 from "./images/hvc2.svg";
import IconHVC3 from "./images/hvc3.svg";
import IconEdit from "./images/edit.svg";
import IconNote from "./images/iconNote.svg";
import IconConnect from "./images/connect.svg";
import { Button, Card, Col, Row } from "antd";
import { Link } from "react-router-dom";

const ThirdPartyLogisticsIntegration: React.FC = () => {
  const listThirdPartyLogistics = [
    {
      id: 1,
      slug: "giao-hang-nhanh",
      name: "Giao hàng nhanh",
      image: IconHVC1,
      isConnect: true,
    },
    {
      id: 2,
      slug: "giao-hang-nhanh",
      name: "Hãng DHL",
      image: IconHVC2,
      isConnect: true,
    },
    {
      id: 3,
      slug: "giao-hang-nhanh",
      name: "Giao hàng tiết kiệm",
      image: IconHVC3,
      isConnect: false,
    },
    {
      id: 4,
      slug: "giao-hang-nhanh",
      name: "Giao hàng nhanh",
      image: IconHVC1,
      isConnect: true,
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
          <Row>
            {listThirdPartyLogistics &&
              listThirdPartyLogistics.length > 0 &&
              listThirdPartyLogistics.map((single) => {
                return (
                  <Col span={12} key={single.id}>
                    <div className="singleThirdParty">
                      <div className="singleThirdParty__info">
                        <img src={single.image} alt="" />
                        <h3 className="singleThirdParty__title">
                          {single.name}
                        </h3>
                        <div className="singleThirdParty__info-instruction">
                          <Link to={"/"}>
                            <img src={IconNote} alt="" />
                            Xem hướng dẫn kết nối
                          </Link>
                        </div>
                      </div>
                      <div className="singleThirdParty__connect">
                        {single.isConnect ? (
                          <Button>
                            <Link
                              to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.slug}`}
                            >
                              <img src={IconEdit} alt="" />
                              Sửa
                            </Link>
                          </Button>
                        ) : (
                          <Button>
                            <img src={IconConnect} alt="" />
                            Kết nối
                          </Button>
                        )}
                      </div>
                    </div>
                  </Col>
                );
              })}
          </Row>
        </Card>
      </ContentContainer>
    </StyledComponent>
  );
};

export default ThirdPartyLogisticsIntegration;
