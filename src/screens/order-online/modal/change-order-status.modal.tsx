import { Button, Form, Modal, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import { OrderProcessingStatusModel } from "model/response/order-processing-status.response";
import React from "react";
import { borderColor } from "utils/global-styles/variables";
import { ORDER_SUB_STATUS } from "utils/Order.constants";
import { StyledComponent } from "./change-order-status.moda.styles";

type PropTypes = {
  visible: boolean;
  onCancelChangeStatusModal: () => void;
  handleConfirmOk: (status: string | undefined) => void;
  listOrderProcessingStatus: OrderProcessingStatusModel[];
  changeOrderStatusHtml: JSX.Element | undefined;
};

function ChangeOrderStatusModal(props: PropTypes) {
  const {
    visible,
    onCancelChangeStatusModal,
    listOrderProcessingStatus,
    handleConfirmOk,
    changeOrderStatusHtml,
  } = props;

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    handleConfirmOk(values.selected_status);
  };

  return (
    <StyledComponent>
      <Modal
        visible={visible}
        onCancel={onCancelChangeStatusModal}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <div style={{ marginBottom: 10 }}>Chọn trạng thái cần chuyển</div>

          <Form.Item
            name="selected_status"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn trạng thái",
              },
              {
                validator: async (_, value) => {
                  if (value === ORDER_SUB_STATUS.require_warehouse_change) {
                    return Promise.reject(
                      new Error(
                        "Trạng thái đổi kho hàng cần vào chi tiết đơn để thực hiện!",
                      ),
                    );
                  }
                },
              },
            ]}
          >
            <CustomSelect
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn trạng thái muốn chuyển"
              notFoundContent="Không tìm thấy kết quả"
            >
              {listOrderProcessingStatus.map((item, index) => (
                <Select.Option key={index} value={item.code}>
                  {item.sub_status}
                </Select.Option>
              ))}
            </CustomSelect>
          </Form.Item>
          <div style={{ textAlign: "right", marginTop: 10, marginBottom: 10 }}>
            <Button type="primary" onClick={() => form.submit()}>
              Xác nhận
            </Button>
          </div>
          {changeOrderStatusHtml ? (
            <div
              className="resultBlock"
              style={{
                border: `1px solid ${borderColor}`,
                padding: "20px 30px",
              }}
            >
              {changeOrderStatusHtml}
            </div>
          ) : null}
        </Form>
      </Modal>
    </StyledComponent>
  );
}

export default ChangeOrderStatusModal;
