import { Button, Card, Col, Row } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import IconConnect from "./images/connect.svg";
import IconEdit from "./images/edit.svg";
import { StyledComponent } from "./styles";

function ThirdPartyLogisticsIntegration() {
  const [thirdPartyLogistics, setThirdPartyLogistics] = useState<
    DeliveryServiceResponse[]
  >([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setThirdPartyLogistics(response);
      })
    );
  }, [dispatch]);
  return (
    <StyledComponent>
      <ContentContainer
        title="Kết nối hãng vận chuyển"
        breadcrumb={[
          {
            name: "Kết nối hãng vận chuyển",
          },
        ]}
      >
        <Card>
          <Row>
            {thirdPartyLogistics &&
              thirdPartyLogistics.length > 0 &&
              thirdPartyLogistics.map((single) => {
                return (
                  <Col span={12} key={single.id}>
                    <div className="singleThirdParty">
                      <div className="singleThirdParty__info">
                        <div className="singleThirdParty__logo">
                          <Link
                            to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.code}`}
                          >
                            <img
                              src={single.logo}
                              alt=""
                              style={{ width: 145, maxHeight: 45 }}
                            />
                          </Link>
                        </div>
                        <h3 className="singleThirdParty__title">
                          <Link
                            to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.code}`}
                          >
                            {single.name}
                          </Link>
                        </h3>
                        {/* <div className="singleThirdParty__info-instruction">
                          <Link to={"/"}>Xem hướng dẫn kết nối</Link>
                        </div> */}
                      </div>
                      <div className="singleThirdParty__connect">
                        {single.active ? (
                          <Button>
                            <Link
                              to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.code}`}
                            >
                              <img src={IconEdit} alt="" />
                              Sửa
                            </Link>
                          </Button>
                        ) : (
                          <Button type="primary">
                            <Link
                              to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.code}`}
                            >
                              <img src={IconConnect} alt="" />
                              Kết nối
                            </Link>
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
}

export default ThirdPartyLogisticsIntegration;
