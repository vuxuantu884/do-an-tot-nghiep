import { Button, Card, Row } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useState } from "react";
import { StyledComponent } from "./styled";
import AddShiftModal from "./component/AddShiftModal";

const WorkShiftScheduleDetail: React.FC = () => {
  const [visibleShiftModal, setVisibleShiftModal] = useState(false);
  return (
    <>
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
          {
            name: "Lịch làm việc Yody Nguyễn Tuân",
          },
        ]}
      >
        <StyledComponent>
          <div className="page-header">
            <Row className="page-header-content">
              <Card>
                <Row>
                  <div className="text-revenue-plan">
                    Doanh thu thực tế/ kế hoạch tuần
                    <div className="text-revenue-plan-number">
                      <div className="text-revenue-plan-number-left"></div>
                      <div className="text-revenue-plan-number-right">0 / 210.000.000</div>
                    </div>
                  </div>
                </Row>
              </Card>
              <Card>
                <Row>
                  <div className="text-working-hour-quota">
                    Giờ công sử dụng/ định mức tuần (h)
                    <div className="text-working-hour-quota-number">
                      <div className="text-working-hour-quota-number-left">0/ 420h</div>
                      <div className="text-working-hour-quota-number-right">dư 420h</div>
                    </div>
                  </div>
                </Row>
              </Card>
              <Button type="primary">Xuất excel</Button>
              <Button type="primary" onClick={() => setVisibleShiftModal(true)}>
                Thêm ca làm theo vị trí
              </Button>
              <Button type="primary">Đẩy lịch làm việc lên 1Office</Button>
            </Row>
          </div>
          <Card>Bảng Lịch phân ca</Card>
        </StyledComponent>
      </ContentContainer>
      <AddShiftModal visible={visibleShiftModal} onCancel={() => setVisibleShiftModal(false)} />
    </>
  );
};
export default WorkShiftScheduleDetail;
