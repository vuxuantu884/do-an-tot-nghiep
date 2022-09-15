import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { DailyRevenueDetailModel } from "model/order/daily-revenue.model";
import moment from "moment";
import { useEffect, useState } from "react";
import { dailyRevenueStatus } from "screens/DailyRevenue/helper";
import { DATE_FORMAT } from "utils/DateUtils";
import { getArrayFromObject } from "utils/OrderUtils";
// import { FulFillmentStatus } from "utils/Constants";
import { StyledComponent } from "./styles";

type PropTypes = {
  dailyRevenueDetail?: DailyRevenueDetailModel;
};

function DailyRevenueProgressBar(props: PropTypes) {
  const { dailyRevenueDetail } = props;

  const formatDate = DATE_FORMAT.fullDate;

  const dailyRevenuePaymentStatusArr = getArrayFromObject(dailyRevenueStatus);

  const getDate = (status: string) => {
    if (!dailyRevenueDetail) {
      return null;
    }
    const main = {
      [dailyRevenueStatus.draft.value]: dailyRevenueDetail.created_at,
      [dailyRevenueStatus.paying.value]: dailyRevenueDetail.paying_at,
      [dailyRevenueStatus.paid.value]: dailyRevenueDetail.opened_at,
      [dailyRevenueStatus.finished.value]: dailyRevenueDetail.closed_at,
      default: "",
    };
    return main[status]
      ? // ? moment(main[status], formatDate)
        moment(main[status]).format(formatDate)
      : main.default;
  };

  const resultDailyRevenuePaymentStatusArr = dailyRevenuePaymentStatusArr.map((status) => {
    return {
      ...status,
      active: dailyRevenueDetail?.state === status.value,
      date: getDate(status.value),
    };
  });

  console.log("resultDailyRevenuePaymentStatusArr", resultDailyRevenuePaymentStatusArr);

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const getCurrentStep = () => {
      if (!dailyRevenueDetail) {
        return 0;
      }

      return dailyRevenuePaymentStatusArr.findIndex(
        (status) => status.value === dailyRevenueDetail.state,
      );
    };
    setCurrentStep(getCurrentStep());
  }, [dailyRevenueDetail, dailyRevenuePaymentStatusArr]);

  const progressDot = (dot: any, { status, index }: any) => (
    <div className="ant-steps-icon-dot">
      {(status === "process" || status === "finish") && <CheckOutlined />}
    </div>
  );

  return (
    <StyledComponent>
      <Steps
        progressDot={progressDot}
        size="small"
        current={currentStep}
        className="create-bill-step"
      >
        {resultDailyRevenuePaymentStatusArr.map((single) => {
          return (
            <Steps.Step
              key={single.value}
              title={single.title}
              description={single.date}
              className={single.active ? "active" : ""}
            />
          );
        })}
      </Steps>
    </StyledComponent>
  );
}

export default DailyRevenueProgressBar;
