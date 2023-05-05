import React, { useCallback, useEffect, useState } from "react";
import { Button, Card } from "antd";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import { WorkShiftScheduleStyled } from "screens/work-shift/work-shift-styled";
import { PlusOutlined } from "@ant-design/icons";
import CreateScheduleModal from "screens/work-shift/work-shift-schedule/CreateScheduleModal";
import { WorkShiftTableRequest } from "model/work-shift/work-shift.model";
import {
  getWorkShiftTableService,
  postWorkShiftTableService,
} from "service/work-shift/work-shift.service";
import { useDispatch } from "react-redux";
import arrowDown from "assets/icon/arrow-down.svg";
import { showError, showSuccess } from "utils/ToastUtils";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { Link } from "react-router-dom";
const WorkShiftSchedule = () => {
  const dispatch = useDispatch();

  const [isVisibleCreateScheduleModal, setIsVisibleCreateScheduleModal] = useState<boolean>(false);
  const [locationId, setLocationId] = useState<number>(1);
  const [locationName, setLocationName] = useState<string>("Yody Nguyễn Tuân");
  const [workShiftData, setWorkShiftData] = useState<any>();

  const groupWorkShiftByMonth = (data: Array<any>) => {
    // Group the data by month and year using reduce() and Object.entries().
    const groupedData = Object.entries(
      data.reduce((acc, curr) => {
        const month = curr.from_date.slice(0, 7); // Extract the month and year from the from_date field
        if (!acc[month]) {
          acc[month] = []; // Create a new key for the month if it doesn't exist
        }
        acc[month].push(curr); // Add the current item to the array for the corresponding month
        return acc;
      }, {}),
    );

    // Map the grouped data into an array of objects with month and data properties.
    const formattedData = groupedData.map(([key, value]) => ({
      month: new Date(key + "-01").toLocaleDateString("en-US", {
        month: "2-digit",
        year: "numeric",
      }), // Format the month string as "mm/yyyy"
      data: value,
    }));

    // Sort the formatted data in descending order by month using sort() and localeCompare().
    const sortedData: any = formattedData.sort((a, b) => b.month.localeCompare(a.month));

    // Sort the 'data' field of each object in the given array by 'from_date' in descending order
    for (let i = 0; i < sortedData?.length; i++) {
      sortedData[i]?.data?.sort((a: any, b: any) => {
        const dateA: any = new Date(a.from_date);
        const dateB: any = new Date(b.from_date);
        return dateB - dateA;
      });
    }

    setWorkShiftData(sortedData);
  };

  const getWorkShiftTableData = useCallback(
    (request: any) => {
      dispatch(showLoading());
      getWorkShiftTableService(request)
        .then((response) => {
          if (response?.data) {
            groupWorkShiftByMonth(response.data);
          } else {
            showError("Có lỗi xảy ra.");
          }
        })
        .catch((error) => {
          console.log("error.response", error.response);
          if (error?.response?.data?.errors) {
            showError(error?.response?.data?.errors);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    },
    [dispatch],
  );

  useEffect(() => {
    getWorkShiftTableData({});
  }, [getWorkShiftTableData]);

  const handleCreateSchedule = () => {
    setIsVisibleCreateScheduleModal(true);
  };
  const onCloseCreateScheduleModal = () => {
    setIsVisibleCreateScheduleModal(false);
  };

  const onOkCreateScheduleModal = (request: WorkShiftTableRequest) => {
    dispatch(showLoading());
    postWorkShiftTableService(request)
      .then((response) => {
        console.log("postWorkShiftTableService: ", response);
        if (response?.data) {
          setIsVisibleCreateScheduleModal(false);
          getWorkShiftTableData({});
          showSuccess("Thêm lịch làm việc thành công.");
        } else {
          showError("Có lỗi xảy ra. Thêm lịch làm việc thất bại.");
        }
      })
      .catch((error) => {
        console.log("error.response", error.response);
        if (error?.response?.data?.errors) {
          showError(error?.response?.data?.errors);
        }
      })
      .finally(() => {
        dispatch(hideLoading());
      });
  };

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
        extra={
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateSchedule}
          >
            Thêm lịch làm việc
          </Button>
        }
      >
        <div className={"work-shift-list"}>
          <Card>
            {workShiftData?.map((workShift: any) => {
              return (
                <div className={"work-shift-group"}>
                  <div className={"work-shift-group-name"}>Tháng {workShift.month}</div>
                  {workShift?.data?.map((workShiftItem: any) => {
                    return (
                      <div className={"work-shift-item"}>
                        <div>{workShiftItem.title}</div>
                        <Link to={`${UrlConfig.WORK_SHIFT}/${workShiftItem.id}`}>
                          <img
                            src={arrowDown}
                            alt=""
                            style={{
                              transform: "rotate(270deg)",
                            }}
                          />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </Card>
        </div>
      </ContentContainer>

      {isVisibleCreateScheduleModal && (
        <CreateScheduleModal
          visible={isVisibleCreateScheduleModal}
          onOkModal={onOkCreateScheduleModal}
          onCloseModal={onCloseCreateScheduleModal}
          locationId={locationId}
          locationName={locationName}
        />
      )}
    </WorkShiftScheduleStyled>
  );
};

export default WorkShiftSchedule;
