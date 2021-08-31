import { Button, Card, Col, Row } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { Link } from "react-router-dom";
import IconConnect from "./images/connect.svg";
import IconEdit from "./images/edit.svg";
import IconDHL from "./images/iconDHL.svg";
import IconGiaoHangNhanh from "./images/iconGiaoHangNhanh.svg";
import IconGiaoHangTietKiem from "./images/iconGiaoHangTietKiem.svg";
import IconViettelPost from "./images/iconViettelPost.svg";
import { StyledComponent } from "./styles";

const ThirdPartyLogisticsIntegration: React.FC = () => {
  const listThirdPartyLogistics = [
    {
      id: 1,
      slug: "giao-hang-nhanh",
      name: "Giao hàng nhanh",
      image: IconGiaoHangNhanh,
      isConnect: true,
    },
    {
      id: 2,
      slug: "viettel-post",
      name: "Viettel Post",
      image: IconViettelPost,
      isConnect: true,
    },
    {
      id: 3,
      slug: "giao-hang-tiet-kiem",
      name: "Giao hàng tiết kiệm",
      image: IconGiaoHangTietKiem,
      isConnect: false,
    },
    {
      id: 4,
      slug: "dhl",
      name: "DHL",
      image: IconDHL,
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
                        <div className="singleThirdParty__logo">
                          <img src={single.image} alt="" />
                        </div>
                        <h3 className="singleThirdParty__title">
                          {single.name}
                        </h3>
                        <div className="singleThirdParty__info-instruction">
                          <Link to={"/"}>Xem hướng dẫn kết nối</Link>
                        </div>
                      </div>
                      <div className="singleThirdParty__connect">
                        {single.isConnect ? (
                          <Button>
                            <Link
                              to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.slug}`}
                            >
                              <img
                                src={IconEdit}
                                alt=""
                                style={{ marginRight: 5 }}
                              />
                              Sửa
                            </Link>
                          </Button>
                        ) : (
                          <Button>
                            <img
                              src={IconConnect}
                              alt=""
                              style={{ marginRight: 5 }}
                            />
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
