import React, { useContext, useState } from "react";
import { Modal, Select, DatePicker } from "antd";
import { CreateScheduleModalStyled } from "screens/work-shift/work-shift-styled";
import moment from "moment/moment";
import { WorkShiftTableRequest } from "model/work-shift/work-shift.model";
import { WorkShiftContext } from "../component/WorkShiftProvider";
import { showError } from "utils/ToastUtils";
import { AccountStoreResponse } from "model/account/account.model";

type CreateScheduleModalProps = {
  visible: boolean;
  onCloseModal: () => void;
  onOkModal: (params: WorkShiftTableRequest) => void;
};

const CreateScheduleModal = (props: CreateScheduleModalProps) => {
  const { visible, onCloseModal, onOkModal } = props;
  const workShiftContext = useContext(WorkShiftContext);
  const { accountStores } = workShiftContext;

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [storeSelected, setStoreSelected] = useState<AccountStoreResponse>();

  const onChangeRangeDate = (dates: any, dateString: Array<string>) => {
    const _startDate = dates?.[0]?.format("YYYY-MM-DD");
    const _endDate = dates?.[1]?.format("YYYY-MM-DD");
    setStartDate(_startDate || "");
    setEndDate(_endDate || "");
  };

  const onSelectStore = (value: number) => {
    const _storeSelected = accountStores.find((store) => store.store_id === value);
    setStoreSelected(_storeSelected);
  };

  const handleOnOk = () => {
    if (!storeSelected) {
      showError("Cửa hàng không tồn tại. Vui lòng chọn lại.");
      return;
    }
    if (!startDate || !endDate) {
      showError("Vui lòng chọn thời gian.");
      return;
    }
    const createScheduleParams: WorkShiftTableRequest = {
      location_id: storeSelected.store_id || 0,
      location_name: storeSelected.store_name || "",
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
        disabled: !startDate || !endDate || !storeSelected,
      }}
      cancelText="Hủy"
      onCancel={onCloseModal}
    >
      <CreateScheduleModalStyled>
        <Select
          showSearch
          optionFilterProp="children"
          placeholder="Chọn cửa hàng"
          onSelect={onSelectStore}
        >
          {accountStores?.map((item: any) => (
            <Select.Option key={item.store_id} value={item.store_id}>
              {item.store_name}
            </Select.Option>
          ))}
        </Select>

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
