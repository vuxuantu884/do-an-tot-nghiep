import { Button, Card, Row } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useCallback, useEffect, useState } from "react";
import { StyledComponent } from "./styled";
import AddShiftModal from "./component/AddShiftModal";
import WorkShiftScheduleDetailFilter from "./component/Filter";
import CalendarShiftTable from "./component/CalendarShiftTable";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import queryString from "query-string";
import { WorkShiftCellQuery } from "model/work-shift/work-shift.model";
import { generateQuery } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import { EnumSelectedFilter } from "../work-shift-helper";
import UserShiftTable from "./component/UserShiftTable";

const initQueryDefault: WorkShiftCellQuery = {
  select_query: EnumSelectedFilter.calendar,
  issued_date: [],
  work_hour_name: null,
  assigned_to: null,
};
type WorkShiftCellParamModel = {
  id: string;
};
const WorkShiftScheduleDetail: React.FC = () => {
  const { id } = useParams<WorkShiftCellParamModel>();

  const queryParamsParsed: any = queryString.parse(window.location.search);
  const dispatch = useDispatch();
  const history = useHistory();

  const [params, setPrams] = useState<WorkShiftCellQuery>({
    ...initQueryDefault,
  });
  const [visibleShiftModal, setVisibleShiftModal] = useState(false);

  const onFilter = useCallback(
    (values: any) => {
      let newPrams = { ...params, ...values };
      let queryParam = generateQuery(newPrams);

      if (queryParam) {
        history.replace(`${UrlConfig.WORK_SHIFT}/${id}?${queryParam}`);
        setPrams({ ...newPrams });
      }
    },
    [history, params, id],
  );

  const fetchData = useCallback((query: WorkShiftCellQuery) => {
    console.log("fetchData", query);
  }, []);

  useEffect(() => {
    if (queryParamsParsed) {
      let paramDefault: WorkShiftCellQuery = getQueryParamsFromQueryString(
        queryParamsParsed,
      ) as WorkShiftCellQuery;
      let dataQuery: WorkShiftCellQuery = {
        ...initQueryDefault,
        ...paramDefault,
      };
      setPrams(dataQuery);
      fetchData(dataQuery);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, window.location.search, fetchData]);

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
              <Button className="text-dark-Blue">Nhân viên cửa hàng</Button>
              <Button type="primary" onClick={() => setVisibleShiftModal(true)}>
                Thêm ca làm theo vị trí
              </Button>
              <Button type="primary">Đẩy lịch làm việc lên 1Office</Button>
            </Row>
          </div>
          <Card className="page-content">
            <WorkShiftScheduleDetailFilter
              params={params}
              onFilter={onFilter}
              validStartDate={"2023-05-01"}
              validEndDate={"2023-05-11"}
            />

            {params.select_query === EnumSelectedFilter.calendar && <CalendarShiftTable />}
            {params.select_query === EnumSelectedFilter.user && <UserShiftTable />}
          </Card>
        </StyledComponent>
      </ContentContainer>
      <AddShiftModal visible={visibleShiftModal} onCancel={() => setVisibleShiftModal(false)} />
    </>
  );
};
export default WorkShiftScheduleDetail;
