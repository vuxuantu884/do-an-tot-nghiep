import React, { useCallback, useEffect, useState } from "react";
import { Button, Modal, Tabs } from "antd";
import { WorkShiftDetailModalStyled } from "./styled";
import {
  AddWorkShiftAssignmentRequest,
  DeleteWorkShiftAssignmentRequest,
  WorkShiftAssignmentLogRequest,
  WorkShiftAssignmentLogResponse,
  WorkShiftCellResponse,
} from "model/work-shift/work-shift.model";
import {
  addWorkShiftAssignmentService,
  deleteWorkShiftAssignmentService,
  getWorkShiftAssignmentLogService,
  getWorkShiftCellsService,
} from "service/work-shift/work-shift.service";
import WorkShiftStaffTab from "./WorkShiftStaffTab";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { showError, showSuccess } from "utils/ToastUtils";
import { useDispatch } from "react-redux";
import WorkShiftAssignmentLogTab from "./WorkShiftAssignmentLogTab";

const { TabPane } = Tabs;

type WorkShiftDetailModalProps = {
  visible: boolean;
  onCloseModal: () => void;
  workShiftDetailId: number;
};

const WorkShiftDetailModal = (props: WorkShiftDetailModalProps) => {
  const dispatch = useDispatch();

  const { visible, onCloseModal, workShiftDetailId } = props;

  const [workShiftDetailData, setWorkShiftDetailData] = useState<WorkShiftCellResponse | null>(
    null,
  );
  const [workShiftAssignmentLogData, setWorkShiftAssignmentLogData] = useState<
    Array<WorkShiftAssignmentLogResponse>
  >([]);

  const getWorkShiftDetailById = useCallback(
    (workShiftDetailId: number) => {
      (async () => {
        try {
          dispatch(showLoading());
          const workShiftCellQuery = {
            "id.equals": workShiftDetailId,
          };
          const response = await getWorkShiftCellsService(workShiftCellQuery);
          dispatch(hideLoading());
          if (response?.data?.length > 0) {
            const _workShiftDetailData = response?.data[0];
            setWorkShiftDetailData(_workShiftDetailData);
          }
        } catch (e) {
          dispatch(hideLoading());
          console.log(e);
        }
      })();
    },
    [dispatch],
  );

  const getWorkShiftAssignmentLog = useCallback(
    (workShiftCellId: number) => {
      (async () => {
        try {
          dispatch(showLoading());
          const request: WorkShiftAssignmentLogRequest = {
            workShiftCellId: workShiftCellId,
          };
          const response = await getWorkShiftAssignmentLogService(request);
          dispatch(hideLoading());
          if (response?.data) {
            setWorkShiftAssignmentLogData(response?.data);
          }
        } catch (e) {
          dispatch(hideLoading());
          console.log(e);
        }
      })();
    },
    [dispatch],
  );

  const getWorkShiftDetailData = useCallback(() => {
    if (workShiftDetailId) {
      getWorkShiftDetailById(Number(workShiftDetailId));
      getWorkShiftAssignmentLog(Number(workShiftDetailId));
    }
  }, [getWorkShiftAssignmentLog, getWorkShiftDetailById, workShiftDetailId]);

  useEffect(() => {
    getWorkShiftDetailData();
  }, [getWorkShiftDetailData]);

  const onAddStaff = (
    workShiftAssignmentId: number,
    addStaffRequest: AddWorkShiftAssignmentRequest,
    callback: () => void,
  ) => {
    dispatch(showLoading());
    addWorkShiftAssignmentService(workShiftAssignmentId, addStaffRequest)
      .then(() => {
        showSuccess("Thêm nhân sự trong ca thành công.");
        getWorkShiftDetailData();
        callback();
      })
      .catch((error) => {
        dispatch(hideLoading());
        console.log("error.response", error.response);
        if (error?.response?.data?.errors) {
          showError(error?.response?.data?.errors);
        }
      });
  };

  const onDeleteStaff = (
    workShiftAssignmentId: number,
    deleteStaffRequest: DeleteWorkShiftAssignmentRequest,
  ) => {
    dispatch(showLoading());
    deleteWorkShiftAssignmentService(workShiftAssignmentId, deleteStaffRequest)
      .then((response) => {
        if (response?.data) {
          showSuccess(response?.data);
        } else {
          showSuccess("Xóa nhân sự trong ca thành công.");
        }
        getWorkShiftDetailData();
      })
      .catch((error) => {
        dispatch(hideLoading());
        console.log("error.response", error.response);
        if (error?.response?.data?.errors) {
          showError(error?.response?.data?.errors);
        }
      });
  };

  return (
    <Modal
      visible={visible}
      maskClosable={false}
      centered
      width={650}
      title="Chi tiết ca"
      onCancel={onCloseModal}
      footer={[<Button onClick={onCloseModal}>Đóng</Button>]}
    >
      <WorkShiftDetailModalStyled>
        <div className="work-shift-info">
          <div className="work-shift-col left-item">
            <div className="description">Doanh thu thực tế / định mức ca (đồng)</div>
            <div className="value">0 / {workShiftDetailData?.target_revenue || 0}</div>
          </div>
          <div className="work-shift-col">
            <div className="description">Số giờ định mức sử dụng</div>
            <div className="value">
              {`${workShiftDetailData?.assignments?.length || 0} / ${
                workShiftDetailData?.quota_by_hours || 0
              }h`}
            </div>
          </div>
        </div>

        <Tabs className="work-shift-tabs-list">
          <TabPane tab="Nhân sự trong ca" key="staff">
            <WorkShiftStaffTab
              workShiftDetailData={workShiftDetailData}
              onDeleteStaff={onDeleteStaff}
              onAddStaff={onAddStaff}
            />
          </TabPane>

          <TabPane tab="Lịch sử thay đổi" key="activity-log">
            <WorkShiftAssignmentLogTab workShiftAssignmentLogData={workShiftAssignmentLogData} />
          </TabPane>
        </Tabs>
      </WorkShiftDetailModalStyled>
    </Modal>
  );
};

export default WorkShiftDetailModal;
