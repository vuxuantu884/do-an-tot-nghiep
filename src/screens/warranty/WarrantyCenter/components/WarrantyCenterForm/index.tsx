import { Col, Form, FormInstance, Input, Row, Select } from "antd";
import CustomSelect from "component/custom/select.custom";
import { DistrictResponse } from "model/content/district.model";
import { FormValueCreateCenterType } from "model/warranty/warranty.model";
import React, { useEffect } from "react";
import { RegUtil } from "utils/RegUtils";

type PropTypes = {
  initialFormValues: FormValueCreateCenterType;
  form: FormInstance<any>;
  setSelectedCityId: (value: number | null) => void;
  cities: DistrictResponse[];
  districts: DistrictResponse[];
};

function WarrantyCenterForm(props: PropTypes) {
  const { initialFormValues, form, setSelectedCityId, cities, districts } = props;

  useEffect(() => {
    if (initialFormValues?.city_id) {
      setSelectedCityId(initialFormValues?.city_id);
    }
  }, [form, initialFormValues?.city_id, setSelectedCityId]);

  return (
    <Form
      form={form}
      name="form-order-processing-status"
      layout="horizontal"
      initialValues={initialFormValues}>
      <Row gutter={30}>
        <Col span={12}>
          <Form.Item
            label={"Tên trung tâm bảo hành"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="name"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên trung tâm bảo hành",
              },
            ]}>
            <Input placeholder="Nhập tên trung tâm bảo hành" />
          </Form.Item>
          <Form.Item
            label={"Số điện thoại"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="phone"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại",
              },
              {
                pattern: RegUtil.PHONE,
                message: "Số điện thoại chưa đúng định dạng",
              },
            ]}>
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label={"Tỉnh/TP"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="city_id"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn tỉnh/TP",
              },
            ]}>
            <CustomSelect
              showSearch
              placeholder="Chọn tỉnh/TP"
              optionFilterProp="children"
              onChange={(value) => {
                setSelectedCityId(+value);
              }}
              onSelect={() => {
                form.setFieldsValue({
                  district_id: undefined,
                });
              }}>
              {cities?.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </CustomSelect>
          </Form.Item>
          <Form.Item
            label={"Quận/huyện"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="district_id"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn quận/huyện",
              },
            ]}>
            <CustomSelect showSearch placeholder="Chọn quận/huyện" optionFilterProp="children">
              {districts?.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.name}
                </Select.Option>
              ))}
            </CustomSelect>
          </Form.Item>
          <Form.Item
            label={"Địa chỉ"}
            labelCol={{ span: 8 }}
            labelAlign={"left"}
            name="address"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ",
              },
            ]}>
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default WarrantyCenterForm;
