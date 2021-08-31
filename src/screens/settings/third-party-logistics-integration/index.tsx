import { Button, Card, Col, Row } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";
import { DeliveryServicesGetList } from "domain/actions/order/order.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import IconConnect from "./images/connect.svg";
import IconEdit from "./images/edit.svg";
import { StyledComponent } from "./styles";

interface DeliveryServiceResponseFormatted extends DeliveryServiceResponse {
  isConnect?: boolean;
  slug?: string;
}

const ThirdPartyLogisticsIntegration: React.FC = () => {
  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<
    DeliveryServiceResponseFormatted[]
  >([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        console.log("response", response);
        let formattedData: DeliveryServiceResponseFormatted[] = [...response];
        formattedData.forEach((single) => {
          switch (single.code) {
            case "ghtk":
              single.isConnect = true;
              single.slug = "giao-hang-tiet-kiem";
              break;
            case "ghn":
              single.isConnect = true;
              single.slug = "giao-hang-nhanh";
              break;
            case "vtp":
              single.isConnect = false;
              single.slug = "viettel-post";
              break;
            case "dhl":
              single.isConnect = true;
              single.slug = "dhl";
              break;

            default:
              break;
          }
        });
        setListThirdPartyLogistics(formattedData);
      })
    );
  }, [dispatch]);
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
                          <Link
                            to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.slug}`}
                          >
                            <img
                              src={single.logo}
                              alt=""
                              style={{ width: 126 }}
                            />
                          </Link>
                        </div>
                        <h3 className="singleThirdParty__title">
                          <Link
                            to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.slug}`}
                          >
                            {single.name}
                          </Link>
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
