import { Form, FormInstance, Select } from "antd";
import Modal from "antd/lib/modal/Modal";
import CustomDatePicker from "component/custom/new-date-picker.custom";
import { OrderReturnReasonDetailModel } from "model/response/order/order.response";
import React, { useEffect, useMemo } from "react";
import { DATE_FORMAT } from "utils/DateUtils";
import { formModalShow } from "../sub-status-order";

type PropTypes = {
  title: string;
  formType: string | null;
  subReasonsRequireWarehouseChange: OrderReturnReasonDetailModel[];
  formModal: FormInstance<any>;
  isVisible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
};

function ModalSubStatus(props: PropTypes): React.ReactElement {
  const {
    title,
    formType,
    subReasonsRequireWarehouseChange,
    formModal,
    isVisible,
    onCancel,
    onOk,
  } = props;

  const handleSubmit = () => {
    formModal.validateFields().then(() => {
      const values = formModal.getFieldsValue();
      onOk(values);
    });
  };

  const initialValues = useMemo(() => {
    return {
      finished_on: undefined,
      subReasonsRequireWarehouseChange: undefined,
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      formModal.resetFields();
    }
  }, [formModal, isVisible]);

  return (
    <Modal
      title={title}
      visible={isVisible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Xác nhận"
      cancelText="Hủy bỏ"
    >
      <Form form={formModal} initialValues={initialValues} layout="vertical">
        {formType === formModalShow.selectOrderSuccessDate && (
          <Form.Item
            name="finished_on"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập ngày thành công!",
              },
            ]}
          >
            <CustomDatePicker
              format={DATE_FORMAT.DDMMYY_HHmm}
              placeholder="Chọn ngày thành công"
              style={{
                width: "100%",
              }}
              showTime
            />
          </Form.Item>
        )}
        {formType === formModalShow.subReasonRequireWarehouseChange && (
          <Form.Item
            name="subReasonsRequireWarehouseChange"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn lý do đổi kho hàng!",
              },
            ]}
          >
            <Select
              id="requireWarehouseChangeId"
              showSearch
              allowClear
              style={{ width: "100%" }}
              placeholder="Chọn lý do đổi kho hàng"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              notFoundContent="Không tìm thấy lý do đổi kho hàng"
            >
              {subReasonsRequireWarehouseChange &&
                subReasonsRequireWarehouseChange.map((single) => {
                  return (
                    <Select.Option value={single.id} key={single.id}>
                      {single.name}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}

export default ModalSubStatus;
