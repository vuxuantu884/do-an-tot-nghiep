import { Card, Col, Row } from "antd";
import { HandoverResponse } from "model/handover/handover.response";
import moment from "moment";
import { getDisplayHandoverType } from "../../handover.config";
import { DetailStyle } from "./detail.styles";
interface DetailHandoverComponentProps {
  data: HandoverResponse;
}

const DetailHandoverComponent: React.FC<DetailHandoverComponentProps> = (
  props: DetailHandoverComponentProps,
) => {
  const { data } = props;
  const rowDetail = (title: string, view: any) => {
    return (
      <Col className="col-detail" span={12}>
        <Row>
          <Col span={9} className="bold title">
            {title}
          </Col>
          <Col span={15} className="bold value">
            {view}
          </Col>
        </Row>
      </Col>
    );
  };
  return (
    <DetailStyle>
      <Card title="THÔNG TIN BIÊN BẢN BÀN GIAO">
        <Row>
          {rowDetail("Ngày:", moment(data.created_date).format("DD/MM/YYYY"))}
          {rowDetail("Cửa hàng:", data.store)}
        </Row>
        <Row>
          {rowDetail("Loại:", getDisplayHandoverType(data.type))}
          {rowDetail("Hãng vận chuyển:", data.delivery_service_provider)}
        </Row>
        <Row>
          {rowDetail("Số lượng đơn", data.total)}
          {rowDetail("Biên bản sàn:", data.channel)}
        </Row>
      </Card>
    </DetailStyle>
  );
};

export default DetailHandoverComponent;
