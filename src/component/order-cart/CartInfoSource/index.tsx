import { Card, Col, Row } from "antd";
import UrlConfig from "config/url.config";
import moment from "moment";
import { Link } from "react-router-dom";
import { DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./styles";

type PropType = {
  utm: any | null;
};

/**
 * Input: OrderDetail
 */
function CartInfoSource(props: PropType) {
  const { utm } = props;
  return (
    <StyledComponent>
      <Card className="card-block card-block-normal" title="Thông tin nguồn">
        <Row className="rowDetail" gutter={5}>
          <Col span={10}>utm_source:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {utm?.utm_source}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={10}>utm_medium:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {utm?.utm_medium}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={10}>utm_campain:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {utm?.utm_campaign}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={10}>utm_term:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {utm?.utm_term}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={10}>utm_id:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {utm?.utm_id}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={10}>utm_content:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {utm?.utm_content}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={10}>affilate:</Col>
          <Col span={14}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {utm?.affiliate}
            </span>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default CartInfoSource;
