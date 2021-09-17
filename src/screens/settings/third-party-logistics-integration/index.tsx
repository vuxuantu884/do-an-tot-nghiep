import { Button, Card, Col, Row } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import {
  DeliveryServicesGetList,
  updateDeliveryConfigurationAction,
} from "domain/actions/order/order.action";
import { DeliveryServiceResponse } from "model/response/order/order.response";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { DELIVER_SERVICE_STATUS } from "utils/Order.constants";
import IconConnect from "./images/connect.svg";
import IconEdit from "./images/edit.svg";
import { StyledComponent } from "./styles";

function ThirdPartyLogisticsIntegration() {
  const [listThirdPartyLogistics, setListThirdPartyLogistics] = useState<
    DeliveryServiceResponse[]
  >([]);
  const dispatch = useDispatch();

  const handleConnect = (thirdPartyLogisticId: number | undefined) => {
    if (!thirdPartyLogisticId) {
      return;
    }
    const params = {
      external_service_id: thirdPartyLogisticId,
      status: DELIVER_SERVICE_STATUS.active,
    };
    dispatch(
      updateDeliveryConfigurationAction(params, () => {
        dispatch(
          DeliveryServicesGetList(
            (response: Array<DeliveryServiceResponse>) => {
              setListThirdPartyLogistics(response);
            }
          )
        );
      })
    );
  };

  useEffect(() => {
    dispatch(
      DeliveryServicesGetList((response: Array<DeliveryServiceResponse>) => {
        setListThirdPartyLogistics(response);
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
                        <div className="singleThirdParty__info-instruction">
                          <Link to={"/"}>Xem hướng dẫn kết nối</Link>
                        </div>
                      </div>
                      <div className="singleThirdParty__connect">
                        {single.status === DELIVER_SERVICE_STATUS.active ? (
                          <Button>
                            <Link
                              to={`${UrlConfig.THIRD_PARTY_LOGISTICS_INTEGRATION}/${single.code}`}
                            >
                              <img src={IconEdit} alt="" />
                              Sửa
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            type="primary"
                            onClick={() => handleConnect(single.id)}
                          >
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
}

export default ThirdPartyLogisticsIntegration;
