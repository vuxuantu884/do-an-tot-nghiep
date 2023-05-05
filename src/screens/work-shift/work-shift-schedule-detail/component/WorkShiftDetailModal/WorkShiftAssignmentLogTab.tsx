import React, { useEffect, useState } from "react";
import { WorkShiftAssignmentLogTabStyled } from "screens/work-shift/work-shift-schedule-detail/component/WorkShiftDetailModal/styled";
import { WorkShiftAssignmentLogResponse } from "model/work-shift/work-shift.model";
import moment from "moment/moment";
import { DATE_FORMAT } from "utils/DateUtils";

type WorkShiftStaffTabProps = {
  workShiftAssignmentLogData: Array<WorkShiftAssignmentLogResponse>;
};

const WorkShiftAssignmentLogTab = (props: WorkShiftStaffTabProps) => {
  const { workShiftAssignmentLogData } = props;

  const [workShiftAssignmentLogList, setWorkShiftAssignmentLogList] = useState<
    Array<WorkShiftAssignmentLogResponse>
  >([]);

  useEffect(() => {
    if (workShiftAssignmentLogData) {
      const _workShiftAssignmentLogList = workShiftAssignmentLogData.map((assignmentLog) => {
        const newDate = moment(assignmentLog?.action_date);
        const actionDate = newDate.format(DATE_FORMAT.HHmm_DDMMYYYY);
        return {
          ...assignmentLog,
          action_date: actionDate,
        };
      });
      setWorkShiftAssignmentLogList(_workShiftAssignmentLogList);
    }
  }, [workShiftAssignmentLogData]);

  return (
    <WorkShiftAssignmentLogTabStyled>
      <ul className="assignment-log-list">
        {workShiftAssignmentLogList?.map((AssignmentLog) => (
          <li key={AssignmentLog.id} className="assignment-log-item">
            <div>
              <span className="action-by">{AssignmentLog.action_by}</span>
              <span>{AssignmentLog.action_date}</span>
            </div>
            <div>{AssignmentLog.action}</div>
            <div>Lý do: {AssignmentLog.note}</div>
          </li>
        ))}
      </ul>
    </WorkShiftAssignmentLogTabStyled>
  );
};
export default WorkShiftAssignmentLogTab;
