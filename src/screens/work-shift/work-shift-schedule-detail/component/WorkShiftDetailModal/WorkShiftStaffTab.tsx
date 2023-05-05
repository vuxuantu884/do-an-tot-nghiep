import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Spin, Select } from "antd";
import { WorkShiftStaffTabStyled } from "screens/work-shift/work-shift-schedule-detail/component/WorkShiftDetailModal/styled";
import {
  AddWorkShiftAssignmentRequest,
  DeleteWorkShiftAssignmentRequest,
  SearchStaffActivityManagerLocationParams,
  StaffActivityManagerResponse,
  WorkShiftAssignmentModel,
  WorkShiftCellResponse,
} from "model/work-shift/work-shift.model";
import { showError } from "utils/ToastUtils";
import { ICustomTableColumType } from "component/table/CustomTable";
import TextArea from "antd/es/input/TextArea";
import { getStaffActivityManagerLocationService } from "service/work-shift/work-shift.service";

import { debounce } from "lodash";
const expandIconId = "staff-expand-icon-";
const { Option } = Select;

type WorkShiftStaffTabProps = {
  workShiftDetailData: WorkShiftCellResponse | null;
  onAddStaff: (addStaffRequest: AddWorkShiftAssignmentRequest, callback: () => void) => void;
  onDeleteStaff: (
    workShiftAssignmentId: number,
    deleteStaffRequest: DeleteWorkShiftAssignmentRequest,
  ) => void;
};

const WorkShiftStaffTab = (props: WorkShiftStaffTabProps) => {
  const { workShiftDetailData, onAddStaff, onDeleteStaff } = props;

  const [isOverWorkingHour, setIsOverWorkingHour] = useState<boolean>(false);
  const [workShiftAssignmentList, setWorkShiftAssignmentList] = useState<
    Array<WorkShiftAssignmentModel>
  >([]);

  const [staffList, setStaffList] = useState<Array<StaffActivityManagerResponse>>([]);
  const [staffSearching, setStaffSearching] = React.useState<boolean>(false);
  const [staffInputValue, setStaffInputValue] = React.useState<string>();
  const [staffSelected, setStaffSelected] = useState<StaffActivityManagerResponse>();

  useEffect(() => {
    setWorkShiftAssignmentList(workShiftDetailData?.assignments || []);
    if (
      !workShiftDetailData?.quota_by_hours ||
      workShiftDetailData.quota_by_hours <= workShiftDetailData?.assignments?.length
    ) {
      setIsOverWorkingHour(true);
    }
  }, [workShiftDetailData]);

  const columns: Array<ICustomTableColumType<any>> = useMemo(
    () => [
      {
        title: "",
        render: (item) => {
          return (
            <div style={{ marginLeft: "-50px", color: "#262626" }}>
              <span>{item.assigned_to} - </span>
              <span>{item.assigned_name}</span>
            </div>
          );
        },
      },
      {
        title: "",
        align: "center",
        render: (item) => {
          return <div>{item.role}</div>;
        },
      },
      {
        title: "",
        width: 50,
        render: (item) => {
          const _expandIconId = `${expandIconId}${item.id}`;
          return (
            <span
              className={"delete-staff-button"}
              onClick={() => handleExpandStaffItem(_expandIconId)}
            >
              Xóa
            </span>
          );
        },
      },
    ],
    [],
  );

  /** Xử lý xóa nhân viên **/
  const handleExpandStaffItem = (expandIconId: string) => {
    let expandIconElement = document.getElementById(expandIconId);
    expandIconElement?.click();
  };
  const onCancelExpand = (staffItem: any) => {
    const _expandIconId = `${expandIconId}${staffItem.id}`;
    handleExpandStaffItem(_expandIconId);
  };
  const handleDeleteStaff = (staffItem: any, deleteReason: string) => {
    const deleteStaffRequest: DeleteWorkShiftAssignmentRequest = {
      work_shift_cell_id: staffItem.work_shift_cell_id,
      assigned_to: staffItem.assigned_to,
      assigned_name: staffItem.assigned_name,
      role: staffItem.role,
      note: deleteReason,
    };
    onDeleteStaff && onDeleteStaff(staffItem.id, deleteStaffRequest);
  };
  /** ** **/

  /** Xử lý thêm nhân viên **/
  const handleAddStaff = () => {
    if (!staffSelected) {
      showError("Vui lòng chọn nhân viên");
      return;
    }

    const addStaffRequest: AddWorkShiftAssignmentRequest = {
      work_shift_cell_id: workShiftDetailData?.id || 0,
      assigned_to: staffSelected.code || "",
      assigned_name: staffSelected.full_name || "",
      role: staffSelected.role || "",
    };
    onAddStaff && onAddStaff(addStaffRequest, onClearStaffList);
  };
  const onSelectStaffList = (staffId: string | number, option: any) => {
    const _staffSelected = staffList.find((account) => Number(account.id) === Number(staffId));
    setStaffSelected(_staffSelected);
    setStaffInputValue(option.children);
  };
  const onClearStaffList = () => {
    setStaffList([]);
    setStaffSelected(undefined);
    setStaffInputValue(undefined);
  };
  const getStaffActivityManagerLocation = (params: SearchStaffActivityManagerLocationParams) => {
    (async () => {
      try {
        const response = await getStaffActivityManagerLocationService(params);
        setStaffSearching(false);
        if (response?.data) {
          setStaffList(response.data);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  };
  const handleSearchingSource = (searchValue: string) => {
    if (searchValue) {
      setStaffSearching(true);
      const query = {
        locationId: workShiftDetailData?.location_id || 26, //@Todo: fake location_id = 26
        name: searchValue.trim(),
      };
      getStaffActivityManagerLocation(query);
    } else {
      onClearStaffList();
    }
  };
  const onSearchStaff = debounce((value: string) => {
    handleSearchingSource(value);
    setStaffInputValue(value);
  }, 800);
  /** ** **/

  return (
    <WorkShiftStaffTabStyled>
      <div className="add-staff">
        <div className="description">Thêm nhân sự:</div>
        <div className="select-staff">
          <Select
            showSearch
            allowClear
            placeholder="Chọn nhân viên"
            loading={staffSearching}
            onClear={onClearStaffList}
            onSelect={onSelectStaffList}
            value={staffInputValue}
            onSearch={(value) => onSearchStaff(value.trim())}
            optionFilterProp="children"
            getPopupContainer={(trigger: any) => trigger.parentElement}
            notFoundContent={
              staffSearching ? <Spin size="small" /> : "Không tìm thấy nhân viên trong cửa hàng"
            }
          >
            {staffList?.map((staff: any) => (
              <Option key={staff.id} value={staff.id}>
                {`${staff.code} - ${staff.full_name} - ${staff.role}`}
              </Option>
            ))}
          </Select>

          {isOverWorkingHour && staffSelected && (
            <div className="select-staff-warning">Chú ý: Đã quá số giờ định mức sử dụng</div>
          )}
        </div>
        <Button type="primary" size="middle" onClick={handleAddStaff} disabled={!staffSelected}>
          Xác nhận
        </Button>
      </div>

      <Table
        pagination={false}
        dataSource={workShiftAssignmentList}
        columns={columns}
        rowKey={(data) => data.id}
        className={"staff-table"}
        expandable={{
          expandIcon: ({ expanded, onExpand, record }) => {
            return (
              <div
                key={record.id}
                id={`${expandIconId}${record.id}`}
                className={"expand-icon"}
                onClick={(event) => onExpand(record, event)}
              />
            );
          },
          expandedRowRender: (record, index, indent, expanded) => {
            let deleteReason: string = "";
            const onChangeReasonDelete = (inputValue: string) => {
              deleteReason = inputValue;
            };

            return (
              <>
                {expanded && (
                  <div key={index} className="delete-staff-expand">
                    <TextArea
                      allowClear
                      placeholder="Lý do xóa nhân viên"
                      autoSize={{ minRows: 1, maxRows: 5 }}
                      defaultValue={""}
                      onChange={(e) => onChangeReasonDelete(e.target.value)}
                    />
                    <div className="delete-button-group">
                      <Button style={{ marginRight: 15 }} onClick={() => onCancelExpand(record)}>
                        Hủy
                      </Button>

                      <Button
                        type="primary"
                        onClick={() => handleDeleteStaff(record, deleteReason)}
                      >
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                )}
              </>
            );
          },
        }}
      />
    </WorkShiftStaffTabStyled>
  );
};
export default WorkShiftStaffTab;
