import { Button, Modal, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import React, { useState } from "react";
import { borderColor } from "utils/global-styles/variables";
import { StyledComponent } from "./change-order-status.moda.styles";

type PropTypes = {
  visible: boolean;
  onCancelChangeStatusModal: () => void;
  handleConfirmOk: (status: string|undefined) => void;
  listOrderProcessingStatus: OrderProcessingStatusModel[];
  changeOrderStatusHtml: JSX.Element | undefined
};

function ChangeOrderStatusModal(props: PropTypes) {
  const { visible, onCancelChangeStatusModal, listOrderProcessingStatus, handleConfirmOk, changeOrderStatusHtml } = props;
  const [selectedStatus, setSelectedStatus] = useState<string|undefined>(undefined);

  return (
    <StyledComponent>
      <Modal visible={visible} onCancel={onCancelChangeStatusModal} footer={null}>
        <div style={{marginBottom: 10}}>Chọn trạng thái cần chuyển</div>
        <CustomSelect
          showSearch
          allowClear
          style={{ width: "100%" }}
          placeholder="Chọn trạng thái muốn chuyển"
          notFoundContent="Không tìm thấy kết quả"
          onChange={(value?: string) => {
            setSelectedStatus(value);
            console.log("value", value);
          }}>
          {listOrderProcessingStatus.map((item, index) => (
            <Select.Option key={index} value={item.code}>
              {item.sub_status}
            </Select.Option>
          ))}
        </CustomSelect>
        <div style={{textAlign: "right", marginTop: 10, marginBottom: 10}}>
          <Button type="primary" onClick={() => handleConfirmOk(selectedStatus)}>Xác nhận</Button>

        </div>
        {changeOrderStatusHtml ? (
          <div className="resultBlock" style={{border: `1px solid ${borderColor}`, padding: "20px 30px"}}>{changeOrderStatusHtml}</div>
        ) : null}
      </Modal>
    </StyledComponent>
  );
}

export default ChangeOrderStatusModal;
