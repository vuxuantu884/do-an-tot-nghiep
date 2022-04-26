import { Form, FormInstance, Modal, ModalProps } from "antd";
import CustomDatePicker from "component/custom/date-picker.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { WarrantyItemModel } from "model/warranty/warranty.model";
import React from "react";
import { DATE_FORMAT } from "utils/DateUtils";

export type initialFormModalWarrantiesAppointmentType = {
  appointment_date?: moment.Moment | undefined;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalWarrantiesAppointmentType;
  record: WarrantyItemModel | undefined;
};

function AppointmentDateModal(props: PropTypes) {
  const { onCancel, onOk, form, handleOk, handleCancel, initialFormValues, record, ...rest } =
    props;

  return (
    <Modal
      title={`Cập nhật ngày hẹn trả khách id "${record?.id}"`}
      onCancel={handleCancel}
      onOk={handleOk}
      {...rest}
    >
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item name="appointment_date">
          <CustomDatePicker
            format={DATE_FORMAT.DD_MM_YYYY}
            placeholder="Chọn ngày hẹn trả khách"
            style={{
              width: "100%",
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(AppointmentDateModal);
