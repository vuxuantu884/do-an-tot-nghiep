import { Row, Col, Progress } from "antd";
import { MinusCircleFilled } from "@ant-design/icons";
type POProgressViewProps = {
  received: number;
  total: number;
};
const POProgressView: React.FC<POProgressViewProps> = (
  props: POProgressViewProps
) => {
  const { received, total } = props;
  return (
    <Row
      align="middle"
      className="padding-left-20 margin-top-20"
      style={{ border: "1px solid #E5E5E5" }}
    >
      <Col
        span={18}
        style={{ borderRight: "1px solid #E5E5E5", paddingRight: 20 }}
      >
        <div className="progress-view">
          <Progress
            // style={{ width: "100%" }}
            style={{ flex: 1 }}
            type="line"
            percent={Math.round((received / total) * 100)}
            showInfo={false}
            strokeWidth={21}
            strokeColor="#B2B2E4"
            trailColor="#ECEFFA"
          />
          <div className="progress-view-info">
            <div className="progress-view-receipt">
              <span>ĐÃ NHẬN: {received ? received : 0}</span>
            </div>
          </div>
          <div className="progress-view-order">
            <span>TỔNG: {total ? total : 0}</span>
          </div>
        </div>
      </Col>
      <Col span={6}>
        <div className="padding-left-20" style={{ textAlign: "left" }}>
          <span>
            <MinusCircleFilled style={{ color: "#E24343", marginRight: 4 }} />
            SL CÒN LẠI:{" "}
            <span style={{ color: "#E24343" }}>{total - received}</span>
          </span>
        </div>
      </Col>
    </Row>
  );
};

export default POProgressView;
