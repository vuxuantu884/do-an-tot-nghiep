import { Form, FormInstance, Modal, ModalProps, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import withWarrantyModalForm from "HOCs/warranty/withWarrantyModalForm";
import { DistrictResponse } from "model/content/district.model";
import {
  WarrantyCenterModel,
  WarrantyCenterValueUpdateGetModel,
} from "model/warranty/warranty.model";
import React from "react";

export type initialFormModalCenterCityDistrictType = {
  city_id: number;
  district_id: number;
};

type PropTypes = ModalProps & {
  form: FormInstance<any>;
  handleOk: (values: any) => void;
  handleCancel: () => void;
  initialFormValues: initialFormModalCenterCityDistrictType;
  cities?: DistrictResponse[];
  districts?: DistrictResponse[];
  setSelectedCityId?: (value: number | null) => void;
  selectedCityId?: number | null;
  selectedData?: WarrantyCenterValueUpdateGetModel;
  setSelectedData?: (data: WarrantyCenterValueUpdateGetModel) => void;
  record?: WarrantyCenterModel | undefined;
};

function ModalWarrantyCenterCityDistrict(props: PropTypes) {
  const {
    form,
    initialFormValues,
    handleOk,
    handleCancel,
    cities,
    districts,
    setSelectedCityId,
    selectedCityId,
    setSelectedData,
    selectedData,
    record,
    ...rest
  } = props;

  console.log("selectedData", selectedData);

  return (
    <Modal
      title={`Cập nhật tỉnh/thành phố và quận/huyện trung tâm "${record?.name}"`}
      onCancel={handleCancel}
      onOk={handleOk}
      {...rest}
    >
      <Form form={form} layout="horizontal" initialValues={initialFormValues}>
        <Form.Item
          name="city_id"
          label="Tỉnh/Thành phố"
          labelCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Vui lòng chọn tỉnh/thành phố",
            },
          ]}
        >
          <CustomSelect
            showSearch
            showArrow
            allowClear
            onChange={(value) => {
              setSelectedData &&
                setSelectedData({
                  ...selectedData,
                  city_id: value,
                  district_id: undefined,
                });
              setSelectedCityId && setSelectedCityId(value);
            }}
            optionFilterProp="children"
            placeholder="Chọn tỉnh/thành phố"
          >
            {cities &&
              cities.length > 0 &&
              cities.map((reason) => (
                <Select.Option key={reason.id} value={reason.id}>
                  {`${reason.name}`}
                </Select.Option>
              ))}
          </CustomSelect>
        </Form.Item>
        <Form.Item
          name="district_id"
          label="Quận/huyện"
          labelCol={{ span: 24 }}
          rules={[
            {
              required: true,
              message: "Vui lòng chọn quận/huyện",
            },
          ]}
        >
          <CustomSelect
            showSearch
            showArrow
            allowClear
            optionFilterProp="children"
            placeholder="Chọn quận/huyện"
          >
            {districts &&
              districts.length > 0 &&
              districts.map((reason) => (
                <Select.Option key={reason.id} value={reason.id}>
                  {`${reason.name}`}
                </Select.Option>
              ))}
          </CustomSelect>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default withWarrantyModalForm(ModalWarrantyCenterCityDistrict);
