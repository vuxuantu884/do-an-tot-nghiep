import { Card, Col, Row } from "antd";
import UrlConfig from "config/url.config";
import moment from "moment";
import { Link } from "react-router-dom";
import { DATE_FORMAT } from "utils/DateUtils";
import { StyledComponent } from "./styles";

type PropType = {
  InfoDeviceDetail: any | null;
};

/**
 * Input: OrderDetail
 */
function InfoDevice(props: PropType) {
  const { InfoDeviceDetail } = props;
  return (
    <StyledComponent>
      <Card className="card-block card-block-normal" title="Thông tin thiết bị">
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>FCM:</Col>
          <Col span={15}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {InfoDeviceDetail?.device_token}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Hệ điều hành:</Col>
          <Col span={15}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {InfoDeviceDetail?.operation_system_version}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>phiên bản:</Col>
          <Col span={15}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {InfoDeviceDetail?.app_version}
            </span>
          </Col>
        </Row>
        <Row className="rowDetail" gutter={5}>
          <Col span={9}>Loại máy:</Col>
          <Col span={15}>
            <span style={{ fontWeight: 500, color: "#2A2A86" }} className="text-focus">
              {InfoDeviceDetail?.kind_of_device}
            </span>
          </Col>
        </Row>
      </Card>
    </StyledComponent>
  );
}

export default InfoDevice;
