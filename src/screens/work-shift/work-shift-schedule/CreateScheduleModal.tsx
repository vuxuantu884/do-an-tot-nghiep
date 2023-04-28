import React, { useState } from "react";
import { Modal, Select, DatePicker } from "antd";
import { CreateScheduleModalStyled } from "screens/work-shift/work-shift-styled";
import moment from "moment/moment";
import { WorkShiftTableRequest } from "model/work-shift/work-shift.model";
import "screens/promotion/campaign/components/promotion-list-modal/promotionListModalStyle.scss";

type CreateScheduleModalProps = {
  visible: boolean;
  onCloseModal: () => void;
  onOkModal: (params: WorkShiftTableRequest) => void;
  locationName: string;
  locationId: number;
};

const CreateScheduleModal = (props: CreateScheduleModalProps) => {
  const { visible, onCloseModal, onOkModal, locationId, locationName } = props;

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const onChangeRangeDate = (dates: any, dateString: Array<string>) => {
    const _startDate = dates?.[0]?.format("YYYY-MM-DD");
    const _endDate = dates?.[1]?.format("YYYY-MM-DD");
    setStartDate(_startDate || "");
    setEndDate(_endDate || "");
  };

  const handleOnOk = () => {
    const createScheduleParams: WorkShiftTableRequest = {
      location_id: locationId,
      location_name: locationName,
      from_date: startDate,
      to_date: endDate,
    };
    onOkModal && onOkModal(createScheduleParams);
  };

  return (
    <Modal
      visible={visible}
      maskClosable={false}
      centered
      width={400}
      title="Thêm lịch làm việc"
      okText="Thêm"
      onOk={handleOnOk}
      okButtonProps={{
        disabled: !startDate || !endDate || !locationName,
      }}
      cancelText="Hủy"
      onCancel={onCloseModal}
    >
      <CreateScheduleModalStyled>
        <Select showArrow={false} value={locationName} open={false} />

        <DatePicker.RangePicker
          format="DD/MM/YYYY"
          style={{ width: "100%" }}
          onChange={onChangeRangeDate}
          disabledDate={(current: any) => moment().subtract(1, "days") >= current}
        />
      </CreateScheduleModalStyled>
    </Modal>
  );
};
export default CreateScheduleModal;
