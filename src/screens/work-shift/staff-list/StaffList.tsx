import React from "react";
import { Card } from "antd";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import { StaffListStyled } from "screens/work-shift/work-shift-styled";
const StaffList = () => {
  return (
    <StaffListStyled>
      <ContentContainer
        title="Phân ca"
        breadcrumb={[
          {
            name: "Phân ca",
            path: UrlConfig.WORK_SHIFT,
          },
          {
            name: "Danh sách nhân viên",
          },
        ]}
      >
        <div>
          <Card>Danh sách nhân viên</Card>
        </div>
      </ContentContainer>
    </StaffListStyled>
  );
};

export default StaffList;
