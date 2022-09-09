import { Card, Col, Row } from "antd";
import UrlConfig from "config/url.config";
import { StoreCustomResponse } from "model/response/order/order.response";
import { Link } from "react-router-dom";
import { StyledComponent } from "./styles";

type PropTypes = {
  storeDetail: StoreCustomResponse | undefined;
};

function RevenueShopDetail(props: PropTypes) {
  const { storeDetail } = props;

  const detailArr = [
    {
      title: "Cửa hàng",
      value: (
        <Link
          target="_blank"
          to={`${UrlConfig.ORDER}?page=1&limit=30&store_ids=${storeDetail?.id}`}
        >
          {storeDetail?.name}
        </Link>
      ),
    },
    {
      title: "SĐT",
      value: storeDetail?.hotline ? <span>{storeDetail?.hotline}</span> : "-",
    },
    {
      title: "Địa chỉ",
      value: storeDetail?.address || "-",
    },
  ];

  return (
    <StyledComponent>
      <Card title="Thông tin cửa hàng">
        {detailArr.map((single, index) => {
          if (single.title && single.value) {
            return (
              <Row className="rowDetail" gutter={5} key={index}>
                <Col span={10}>{single.title}:</Col>
                <Col span={14} className="rowDetail__value">
                  {single.value}
                </Col>
              </Row>
            );
          }
          return null;
        })}
      </Card>
    </StyledComponent>
  );
}

export default RevenueShopDetail;
