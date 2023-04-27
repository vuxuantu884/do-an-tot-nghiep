import React from "react";
import { Card } from "antd";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import { WorkShiftScheduleStyled } from "screens/work-shift/work-shift-styled";
const WorkShiftSchedule = () => {
  return (
    <WorkShiftScheduleStyled>
      <ContentContainer
        title="Phân ca"
        breadcrumb={[
          {
            name: "Phân ca",
            path: UrlConfig.WORK_SHIFT,
          },
          {
            name: "Lịch phân ca",
          },
        ]}
      >
        <div>
          <Card>Lịch phân ca</Card>
        </div>
      </ContentContainer>
    </WorkShiftScheduleStyled>
  );
};

export default WorkShiftSchedule;
