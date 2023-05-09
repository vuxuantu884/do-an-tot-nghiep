import React, { useCallback, useEffect, useState } from "react";
import { Button } from "antd";
import { WORK_SHIFT_LIST } from "screens/work-shift/work-shift-helper";
import { WorkHour, WorkShiftCellResponse } from "model/work-shift/work-shift.model";
import UserFilled from "component/icon/UserFilled";
import { ClockCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { StyledComponent } from "screens/work-shift/work-shift-schedule-detail/component/UserShiftTable/styled";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";
import { Tooltip } from "antd";
import iconDelete from "assets/icon/deleteIcon.svg";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  addWorkShiftAssignmentService,
  deleteWorkShiftAssignmentService,
} from "service/work-shift/work-shift.service";
import { showError, showSuccess } from "utils/ToastUtils";
import { useDispatch } from "react-redux";

type Props = {
  WorkShiftCells: WorkShiftCellResponse[] | null;
  dateFilter: Array<string> | [];
  dataQuery: any;
  fetchDataWorkShiftCell: (dataQuery: any) => void;
};

const defaultShift = () => {
  let workShiftList: Array<number> = [];
  for (let i = 0; i < 14; i++) {
    workShiftList.push(0);
  }
  return workShiftList;
};

const UserShiftTable: React.FC<Props> = (props: Props) => {
  const dispatch = useDispatch();
  const { WorkShiftCells, dateFilter, fetchDataWorkShiftCell, dataQuery } = props;

  const [workShiftUserData, setWorkShiftUserData] = useState<any>();
  const [workShiftList, setWorkShiftList] = useState<WorkHour[]>([]);

  const getAllFilterDate = (dateFilter: string[]) => {
    const startDate = moment(dateFilter[0]);
    const endDate = moment(dateFilter[1]);
    const allDateFilled = [];
    while (startDate <= endDate) {
      allDateFilled.push(startDate.format("YYYY-MM-DD"));
      startDate.add(1, "day");
    }

    return allDateFilled;
  };
  const getShiftNumber = (workHourName: string) => {
    const temp = workHourName.replace(/\D/g, "");
    return parseInt(temp);
  };
  const getWeekday = (issuedDate: string) => {
    // Convert issued_date to a Date object
    const newIssuedDate = new Date(issuedDate);
    // Get the weekday as a string (e.g. "Chủ nhật")
    return newIssuedDate.toLocaleDateString("vi-VN", { weekday: "long" });
  };

  const getDateMonth = (issuedDate: string) => {
    const newDateObj = moment(issuedDate);
    return newDateObj.format(DATE_FORMAT.DDMM);
  };

  const convertShiftDataToUser = useCallback((shiftCellData: any, dateFilter: string[]) => {
    const allDateFilter = getAllFilterDate(dateFilter);
    let userData: any[] = [];
    shiftCellData?.forEach((shiftCell: any) => {
      const shiftNumber = getShiftNumber(shiftCell.work_hour_name);
      shiftCell?.assignments?.forEach((workShiftAssignment: any) => {
        const userAssigned = userData?.find(
          (item) => item.assignedTo === workShiftAssignment.assigned_to,
        );
        if (userAssigned) {
          const workingSchedule = userAssigned.userWorkingSchedule?.find(
            (item: any) => item.issuedDate === shiftCell.issued_date,
          );
          if (workingSchedule) {
            workingSchedule.shift[shiftNumber - 1] = shiftNumber;
            const workingScheduleIndex = userAssigned.userWorkingSchedule?.findIndex(
              (item: any) => item.issuedDate === shiftCell.issued_date,
            );
            if (workingScheduleIndex !== -1) {
              userAssigned.userWorkingSchedule[workingScheduleIndex] = workingSchedule;
            }

            userAssigned.workingTime = userAssigned.workingTime + 1;

            const userDataIndex = userData?.findIndex(
              (userItem: any) => userItem.assignedTo === workShiftAssignment.assigned_to,
            );
            if (userDataIndex !== -1) {
              userData[userDataIndex] = userAssigned;
            }
          }
        } else {
          const userWorkingScheduleList = allDateFilter?.map((dateValue) => {
            const shiftList = defaultShift();
            if (dateValue === shiftCell.issued_date) {
              shiftList[shiftNumber - 1] = shiftNumber;
            }
            return {
              issuedDate: dateValue,
              weekday: getWeekday(dateValue),
              date: getDateMonth(dateValue),
              shift: shiftList,
            };
          });

          const newUserAssigned = {
            id: workShiftAssignment.id,
            workShiftCellId: workShiftAssignment.work_shift_cell_id,
            assignedName: workShiftAssignment.assigned_name,
            assignedTo: workShiftAssignment.assigned_to,
            role: workShiftAssignment.role,
            workingTime: 1,
            userWorkingSchedule: userWorkingScheduleList,
          };
          userData.push(newUserAssigned);
        }
      });
    });

    return userData;
  }, []);

  useEffect(() => {
    const _workShiftUserData = convertShiftDataToUser(WorkShiftCells, dateFilter);
    setWorkShiftUserData(_workShiftUserData);
  }, [WorkShiftCells, convertShiftDataToUser, dateFilter]);

  const reloadPage = () => {
    // window.location.reload();
    fetchDataWorkShiftCell(dataQuery);
    let element: any = document.getElementById("user-work-shift-icon");
    debugger;
    element?.focus();
    element?.click();
    element?.onClick();
  };

  const handleAddWorkShiftAssignment = (shiftUserData: any) => {
    const addStaffRequest = {
      assigned_name: shiftUserData.assignedName,
      assigned_to: shiftUserData.assignedTo,
      role: shiftUserData.role,
      work_shift_cell_id: shiftUserData.workShiftCellId,
    };
    dispatch(showLoading());
    addWorkShiftAssignmentService(shiftUserData.id, addStaffRequest)
      .then(() => {
        showSuccess("Thêm nhân sự trong ca thành công.");
        reloadPage();
      })
      .catch((error) => {
        dispatch(hideLoading());
        console.log("error.response", error.response);
        if (error?.response?.data?.errors) {
          showError(error?.response?.data?.errors);
        }
      });
  };
  const handleDeleteWorkShiftAssignment = (shiftUserData: any) => {
    const deleteStaffRequest = {
      assigned_name: shiftUserData.assignedName,
      assigned_to: shiftUserData.assignedTo,
      role: shiftUserData.role,
      work_shift_cell_id: shiftUserData.workShiftCellId,
      note: "",
    };
    dispatch(showLoading());
    deleteWorkShiftAssignmentService(shiftUserData.id, deleteStaffRequest)
      .then((response) => {
        dispatch(hideLoading());
        if (response?.data) {
          showSuccess(response?.data);
        } else {
          showSuccess("Xóa phân ca thành công.");
        }
        reloadPage();
      })
      .catch((error) => {
        dispatch(hideLoading());
        console.log("error.response", error.response);
        if (error?.response?.data?.errors) {
          showError(error?.response?.data?.errors);
        }
      });
  };

  useEffect(() => {
    (async () => {
      const res = await WORK_SHIFT_LIST();
      setWorkShiftList(res);
    })();
  }, []);
  return (
    <StyledComponent>
      <div className="user-shift-table">
        <table className="table-header">
          <thead>
            <tr className="table-group">
              <th className="user">Nhân viên </th>
              <div className="shift-group">
                <th className="shift-date">Thứ</th>
                <th className="shift-date">Ngày</th>
                {workShiftList.map((shift) => (
                  <th key={shift.id} className="shift">
                    {shift.title}
                  </th>
                ))}
              </div>
            </tr>
          </thead>
        </table>

        <table className="table-body">
          <tbody>
            {workShiftUserData?.map((shiftUserData: any, index: number) => (
              <tr
                key={`shiftUser${index}`}
                className="table-group"
                style={{ backgroundColor: `${index % 2 === 0 ? "#F5F5F5" : ""}` }}
              >
                <td className="user">
                  <div className="assigned-name fw-600">{shiftUserData.assignedName}</div>
                  <div className="role fw-400">{shiftUserData.role}</div>
                  <div className="working-time">
                    <ClockCircleOutlined className="working-time-icon yellow-gold" />
                    <div className="working-time-text fw-600">{shiftUserData.workingTime}h</div>
                  </div>
                </td>

                <div className="user-shift-group">
                  {shiftUserData?.userWorkingSchedule?.map(
                    (workingScheduleItem: any, index: number) => (
                      <tr
                        key={`userWorkingSchedule${index}`}
                        className="shift-group"
                        style={{ height: `${100 / shiftUserData?.userWorkingSchedule?.length}%` }}
                      >
                        <td className="shift-date">{workingScheduleItem.weekday}</td>
                        <td className="shift-date">{workingScheduleItem.date}</td>
                        {workingScheduleItem?.shift?.map((shiftItem: any, index: number) => (
                          <Tooltip
                            title={
                              shiftItem > 0 ? (
                                <Button
                                  type={"text"}
                                  icon={
                                    <img
                                      alt=""
                                      style={{ marginRight: 8, color: "#F5222D" }}
                                      src={iconDelete}
                                    />
                                  }
                                  onClick={() => handleDeleteWorkShiftAssignment(shiftUserData)}
                                  style={{ fontWeight: 600, color: "#F5222D", padding: 0 }}
                                >
                                  Xóa ca làm việc
                                </Button>
                              ) : (
                                <Button
                                  type={"text"}
                                  icon={
                                    <PlusOutlined
                                      style={{ width: "19px", height: "19px", color: "#262626" }}
                                    />
                                  }
                                  onClick={() => handleAddWorkShiftAssignment(shiftUserData)}
                                  style={{ fontWeight: 600, color: "#262626", padding: 0 }}
                                >
                                  Thêm ca làm việc
                                </Button>
                              )
                            }
                            trigger={["click"]}
                            placement={"bottom"}
                            color={"white"}
                            overlayClassName={"shift-action"}
                          >
                            <td key={`shiftItem${index}`} className="shift shift-item">
                              {shiftItem ? <UserFilled /> : <></>}
                            </td>
                          </Tooltip>
                        ))}
                      </tr>
                    ),
                  )}
                </div>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StyledComponent>
  );
};

export default UserShiftTable;
