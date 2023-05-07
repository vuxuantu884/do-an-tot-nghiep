import { Button, Card, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyledComponent } from "./styled";
import AddShiftModal from "./component/AddShiftModal";
import WorkShiftScheduleDetailFilter from "./component/Filter";
import CalendarShiftTable from "./component/CalendarShiftTable";
import { useHistory, useParams } from "react-router-dom";
import queryString from "query-string";
import {
  WorkShiftCellQuery,
  WorkShiftCellRequest,
  WorkShiftCellResponse,
  WorkShiftTableResponse,
} from "model/work-shift/work-shift.model";
import { generateQuery } from "utils/AppUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import { EnumSelectedFilter, convertWorkShiftCellQuery } from "../work-shift-helper";
import UserShiftTable from "./component/UserShiftTable";
import {
  getByIdWorkShiftTableService,
  getWorkShiftCellsService,
  putWorkShiftCellsService,
} from "service/work-shift/work-shift.service";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { useDispatch } from "react-redux";
import { showError } from "utils/ToastUtils";

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
  const dispatch = useDispatch();
  const { id } = useParams<WorkShiftCellParamModel>();

  const queryParamsParsed: any = queryString.parse(window.location.search);
  const history = useHistory();

  const [isLoading, setIsLoading] = useState(true);
  const [params, setPrams] = useState<WorkShiftCellQuery>({
    ...initQueryDefault,
  });
  const [visibleShiftModal, setVisibleShiftModal] = useState(false);
  const [workShiftTableResponse, setWorkShiftTableResponse] =
    useState<WorkShiftTableResponse | null>(null);

  const [WorkShiftCellsResponse, setWorkShiftCellsResponse] = useState<
    WorkShiftCellResponse[] | null
  >(null);

  const [dateFilter, setDateFilter] = useState<Array<string>>([]);
  const [dataQuery, setDataQuery] = useState<any>();

  const initialValue = useMemo(() => {
    return workShiftTableResponse
      ? {
          location_id: workShiftTableResponse.location_id,
          issued_date_to: workShiftTableResponse.to_date,
          issued_date_from: workShiftTableResponse.from_date,
          suggest_method: 1,
        }
      : null;
  }, [workShiftTableResponse]);

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

  const fetchDataWorkShiftable = (_id: number) => {
    (async () => {
      if (!_id) {
        return;
      }
      try {
        const response = await getByIdWorkShiftTableService(Number(_id));
        setWorkShiftTableResponse(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
      }
    })();
  };

  const fetchDataWorkShiftCell = (query: WorkShiftCellQuery) => {
    (async () => {
      try {
        dispatch(showLoading());
        const customQuery = convertWorkShiftCellQuery(query);
        const response = await getWorkShiftCellsService(customQuery);
        dispatch(hideLoading());
        setWorkShiftCellsResponse(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log(e);
        dispatch(hideLoading());
      }
    })();
  };

  const handleAddEmployeeToShift = useCallback(
    (_v: WorkShiftCellRequest) => {
      (async () => {
        if (!initialValue) return;

        const request: WorkShiftCellRequest = {
          ...initialValue,
          ..._v,
        };

        console.log("request", request);
        try {
          const response = await putWorkShiftCellsService(request);
          console.log(response);
          if (response && response.status === 200) {
            setWorkShiftCellsResponse(response.data);
          } else {
          }
        } catch (e) {
          console.log(e);
          showError("Có lỗi xảy ra, vui lòng thử lại");
        }
      })();
    },
    [initialValue],
  );

  useEffect(() => {
    if (queryParamsParsed && workShiftTableResponse) {
      let paramDefault: WorkShiftCellQuery = getQueryParamsFromQueryString(
        queryParamsParsed,
      ) as WorkShiftCellQuery;

      let dataQuery: WorkShiftCellQuery = {
        ...initQueryDefault,
        ...paramDefault,
        location_id: workShiftTableResponse.location_id,
      };
      setPrams(dataQuery);

      if (
        !dataQuery.issued_date ||
        (dataQuery.issued_date && dataQuery.issued_date.length === 0) ||
        (dataQuery.issued_date && !dataQuery.issued_date.some((p) => p))
      ) {
        dataQuery.issued_date = [
          workShiftTableResponse.from_date || "",
          workShiftTableResponse.to_date || "",
        ];
      }
      setDateFilter(dataQuery.issued_date);
      setDataQuery(dataQuery);
      fetchDataWorkShiftCell(dataQuery);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, window.location.search, workShiftTableResponse]);

  useEffect(() => {
    if (id) {
      fetchDataWorkShiftable(Number(id));
    }
  }, [id]);

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
            path: UrlConfig.WORK_SHIFT,
          },
          {
            name: `${workShiftTableResponse?.title}`,
          },
        ]}
        isLoading={isLoading}
        extra={
          <StyledComponent>
            <Space className="extra-option">
              <Button className="text-dark-Blue"> Xuất excel</Button>
              <Button className="text-dark-Blue"> Đẩy lịch làm việc lên 1Office</Button>
            </Space>
          </StyledComponent>
        }
      >
        <StyledComponent>
          <div className="page-header">
            <Row className="page-header-content">
              <Card>
                <Row>
                  <div className="text-revenue-plan">
                    Doanh thu thực tế / kế hoạch (đồng)
                    <div className="text-revenue-plan-number">
                      <div className="text-revenue-plan-number-left">0 / 210.000.000</div>
                      <div className="text-revenue-plan-number-right"></div>
                    </div>
                  </div>
                </Row>
              </Card>
              <Card>
                <Row>
                  <div className="text-working-hour-quota">
                    Giờ công sử dụng / định mức (h)
                    <div className="text-working-hour-quota-number">
                      <div className="text-working-hour-quota-number-left">0/ 420h</div>
                      {/* <div className="text-working-hour-quota-number-right">dư 420h</div> */}
                    </div>
                  </div>
                </Row>
              </Card>
              {/* <Button className="text-dark-Blue">Nhân viên cửa hàng</Button> */}
              {/* <Button type="primary" onClick={() => setVisibleShiftModal(true)}>
                Thêm ca làm theo vị trí
              </Button> */}
              <div className="shift-scheduler">
                <Button type="primary" onClick={() => setVisibleShiftModal(true)}>
                  Thêm ca làm
                </Button>
                <Button type="primary">Lịch sử phân ca</Button>
              </div>
            </Row>
          </div>
          <Card className="page-content">
            <WorkShiftScheduleDetailFilter
              params={params}
              onFilter={onFilter}
              validStartDate={workShiftTableResponse?.from_date}
              validEndDate={workShiftTableResponse?.to_date}
            />

            {params.select_query === EnumSelectedFilter.calendar &&
              WorkShiftCellsResponse &&
              WorkShiftCellsResponse.length !== 0 && (
                <CalendarShiftTable WorkShiftCells={WorkShiftCellsResponse} />
              )}
            {params.select_query === EnumSelectedFilter.user && (
              <UserShiftTable
                WorkShiftCells={WorkShiftCellsResponse}
                dateFilter={dateFilter}
                dataQuery={dataQuery}
                fetchDataWorkShiftCell={fetchDataWorkShiftCell}
              />
            )}
          </Card>
        </StyledComponent>
      </ContentContainer>
      <AddShiftModal
        visible={visibleShiftModal}
        onCancel={() => setVisibleShiftModal(false)}
        onOK={handleAddEmployeeToShift}
      />
    </>
  );
};
export default WorkShiftScheduleDetail;
