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
const POProgressViewInVenTory: React.FC<POProgressViewProps> = (props: POProgressViewProps) => {
  const { received, total, extra, receivedTitle, remainTitle } = props;
  const percent = useMemo(() => {
    if (received && total) {
      return Math.round((received / total) * 100);
    }
    return 0;
  }, [received, total]);
  return (
    <div>
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
    </div>
  );
};

export default POProgressViewInVenTory;
