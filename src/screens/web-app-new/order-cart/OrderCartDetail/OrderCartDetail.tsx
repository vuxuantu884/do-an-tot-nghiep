import { useState, useEffect } from "react";

import { Col, Row } from "antd";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import timeCreate from "assets/icon/Union.svg";
import timeUpdate from "assets/icon/update-cart.svg";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { OrderCartDetailWrapper } from "./OrderCartDetail.style";
import InfoDevice from "../../../../component/order-cart/InfoDevice";
import CartInfoSource from "component/order-cart/CartInfoSource";
import ProductInfo from "component/order-cart/ProductInfo";
import { DetailAbandonCartAction } from "domain/actions/web-app/web-app.actions";
import InfoCustomer from "./InfoCustomer/InfoCustomer";
import moment from "moment";

type PropTypes = {
  id?: string;
};
type OrderParam = {
  id: string;
};

const OrderCartDetail = (props: PropTypes) => {
  let { id } = useParams<OrderParam>();
  if (!id && props.id) {
    id = props.id;
  }

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [abandonDetail, setAbandonDetail] = useState<any>(null);

  useEffect(() => {
    if (!!id) {
      setIsLoading(true);
      dispatch(
        DetailAbandonCartAction(id, (data: any) => {
          setAbandonDetail(data);
          setIsLoading(false);
        }),
      );
    }
  }, [dispatch, id]);

  return (
    <OrderCartDetailWrapper>
      <ContentContainer
        isLoading={isLoading}
        title="Danh sách giỏ hàng"
        breadcrumb={[
          {
            name: "Web/App",
            path: `${UrlConfig.WEB_APP}`,
          },
          {
            name: "Danh sách giỏ hàng",
            path: `${UrlConfig.WEB_APP}-cart`,
          },
          {
            name: `Chi tiết giỏ hàng ${id}`,
          },
        ]}
        extra={
          <div className="header-page-right">
            <div className="time-icon" style={{ marginBottom: "5px" }}>
              <div className="title">
                <img src={timeCreate} alt="timeCreate" />
                <div>Thời điểm tạo giỏ hàng:</div>
              </div>
              <div className="time">
                {moment(abandonDetail?.created_date).format("DD/MM/YYYY HH:mm")}
              </div>
            </div>
            <div className="time-icon">
              <div className="title">
                <img src={timeUpdate} alt="timeUpdate" />
                <div>Thời điểm update giỏ hàng lần cuối:</div>
              </div>
              <div className="time">
                {moment(abandonDetail?.updated_date).format("DD/MM/YYYY HH:mm")}
              </div>
            </div>
          </div>
        }
      >
        <div className="orders-cart">
          <Row gutter={24} style={{ marginBottom: "70px" }}>
            <Col md={18}>
              <InfoCustomer customerDetail={abandonDetail?.customer}></InfoCustomer>
              <ProductInfo
                listProducts={abandonDetail?.line_items}
                totalDetail={abandonDetail}
              ></ProductInfo>
            </Col>
            <Col md={6}>
              <CartInfoSource utm={abandonDetail?.utm}></CartInfoSource>
              <InfoDevice InfoDeviceDetail={abandonDetail?.customer_device}></InfoDevice>
            </Col>
          </Row>
        </div>
      </ContentContainer>
    </OrderCartDetailWrapper>
  );
};
export default OrderCartDetail;
