import React, { useCallback, useEffect, useState } from "react";
import { WORK_SHIFT_LIST } from "screens/work-shift/work-shift-helper";
import { WorkShiftCellResponse } from "model/work-shift/work-shift.model";
import UserFilled from "component/icon/UserFilled";
import { ClockCircleOutlined } from "@ant-design/icons";
import { StyledComponent } from "screens/work-shift/work-shift-schedule-detail/component/UserShiftTable/styled";
import moment from "moment";
import { DATE_FORMAT } from "utils/DateUtils";

type Props = {
  WorkShiftCells: WorkShiftCellResponse[] | null;
};

const defaultShift = () => {
  let workShiftList: Array<number> = [];
  for (let i = 0; i < 14; i++) {
    workShiftList.push(0);
  }
  return workShiftList;
};

const UserShiftTable: React.FC<Props> = (props: Props) => {
  const { WorkShiftCells } = props;

  const [workShiftUserData, setWorkShiftUserData] = useState<any>();

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

  const convertShiftDataToUser = useCallback((shiftCellData: any) => {
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
            const shiftList = workingSchedule.shift;
            shiftList[shiftNumber - 1] = shiftNumber;
            const _workingSchedule = {
              ...workingSchedule,
              shift: shiftList,
            };

            const newWorkingSchedule = userAssigned.userWorkingSchedule?.filter(
              (item: any) => item.issuedDate !== shiftCell.issued_date,
            );
            newWorkingSchedule.push(_workingSchedule);

            const newUserAssigned = {
              ...userAssigned,
              workingTime: userAssigned.workingTime + 1,
              userWorkingSchedule: newWorkingSchedule,
            };

            userData = userData.filter(
              (item) => item.assignedTo !== workShiftAssignment.assigned_to,
            );
            userData.push(newUserAssigned);
          } else {
            const shiftList = defaultShift();
            shiftList[shiftNumber - 1] = shiftNumber;
            const newWorkingSchedule = {
              issuedDate: shiftCell.issued_date,
              weekday: getWeekday(shiftCell.issued_date),
              date: getDateMonth(shiftCell.issued_date),
              shift: shiftList,
            };

            const newUserAssigned = {
              ...userAssigned,
              workingTime: userAssigned.workingTime + 1,
              userWorkingSchedule: [...userAssigned.userWorkingSchedule, newWorkingSchedule],
            };

            userData = userData.filter(
              (item) => item.assignedTo !== workShiftAssignment.assigned_to,
            );
            userData.push(newUserAssigned);
          }
        } else {
          const shiftList = defaultShift();
          shiftList[shiftNumber - 1] = shiftNumber;
          const newWorkingSchedule = {
            issuedDate: shiftCell.issued_date,
            weekday: getWeekday(shiftCell.issued_date),
            date: getDateMonth(shiftCell.issued_date),
            shift: shiftList,
          };
          const newUserAssigned = {
            userName: workShiftAssignment.assigned_name,
            assignedTo: workShiftAssignment.assigned_to,
            role: workShiftAssignment.role,
            workingTime: 1,
            userWorkingSchedule: [newWorkingSchedule],
          };
          userData.push(newUserAssigned);
        }
      });
    });

    return userData;
  }, []);

  useEffect(() => {
    const _workShiftUserData = convertShiftDataToUser(WorkShiftCells);
    setWorkShiftUserData(_workShiftUserData);
  }, [WorkShiftCells, convertShiftDataToUser]);

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
                {WORK_SHIFT_LIST().map((shift) => (
                  <th key={shift.value} className="shift">
                    {shift.name}
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
                  <div className="name fw-600">{shiftUserData.userName}</div>
                  <div className="role fw-400">{shiftUserData.role}</div>
                  <div className="working-time">
                    <ClockCircleOutlined className="working-time-icon yellow-gold" />
                    <div className="working-time-text fw-600">{shiftUserData.workingTime}h</div>
                  </div>
                </td>

                <div className="user-shift-group">
                  {shiftUserData?.userWorkingSchedule?.map((item: any, index: number) => (
                    <tr
                      key={`userWorkingSchedule${index}`}
                      className="shift-group"
                      style={{ height: `${100 / shiftUserData?.userWorkingSchedule?.length}%` }}
                    >
                      <td className="shift-date">{item.weekday}</td>
                      <td className="shift-date">{item.date}</td>
                      {item?.shift?.map((shiftItem: any, index: number) => (
                        <td key={`shiftItem${index}`} className="shift">
                          {shiftItem ? <UserFilled /> : <></>}
                        </td>
                      ))}
                    </tr>
                  ))}
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
