import { Row, Col, Progress } from "antd";
import { MinusCircleFilled, PlusCircleOutlined } from "@ant-design/icons";
import { ReactNode, useMemo } from "react";
import { formatCurrency } from "utils/AppUtils";
type POProgressViewProps = {
  receivedTitle: string;
  remainTitle: string;
  received: number;
  total: number;
  extra?: ReactNode;
};
const POProgressView: React.FC<POProgressViewProps> = (props: POProgressViewProps) => {
  const { received, total, extra, receivedTitle, remainTitle } = props;
  const percent = useMemo(() => {
    if (received && total) {
      return Math.round((received / total) * 100);
    }
    return 0;
  }, [received, total]);
  return (
    <Row className="padding-left-20 margin-top-20" style={{ border: "1px solid #E5E5E5" }}>
      <Col span={18} style={{ borderRight: "1px solid #E5E5E5", paddingRight: 20 }}>
        <div className="progress-view">
          <Progress
            // style={{ width: "100%" }}
            style={{ flex: 1 }}
            type="line"
            percent={percent}
            showInfo={false}
            strokeWidth={21}
            strokeColor="#B2B2E4"
            trailColor="#ECEFFA"
          />
          <div className="progress-view-info">
            <div className="progress-view-receipt">
              <span>
                {receivedTitle}: {received ? formatCurrency(received) : 0}
              </span>
            </div>
          </div>
          <div className="progress-view-order">
            <span>TỔNG: {total ? formatCurrency(total) : 0}</span>
          </div>
        </div>
        <div className="margin-bottom-20">{extra}</div>
      </Col>
      <Col span={6} flex="auto">
        <div className="padding-left-20" style={{ textAlign: "left", marginTop: 25 }}>
          <span>
            {total - received >= 0 ? (
              <>
                <MinusCircleFilled style={{ color: "#E24343", marginRight: 4 }} />
                {`${remainTitle}: `}
                <span style={{ color: "#E24343" }}>{formatCurrency(total - received)}</span>
              </>
            ) : (
              <>
                <PlusCircleOutlined style={{ color: "#27ae60", marginRight: 4 }} />
                {`${remainTitle}: `}
                <span style={{ color: "#27ae60" }}>
                  {formatCurrency(Math.abs(total - received))}
                </span>
              </>
            )}
          </span>
        </div>
      </Col>
    </Row>
  );
};

export default POProgressView;
