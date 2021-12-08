import {Checkbox, Col, Form, Input, Modal, Row, Select} from "antd";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import {SupplierAddress, SupplierAddressResposne} from "model/core/supplier.model";
import { useCallback, useEffect } from "react";

type SupplierAddressModalProps = {
  visible: boolean;
  onCancle: () => void;
  data: SupplierAddressResposne | null;
  onSave: (addressId: number|undefined|null, request: SupplierAddress) => void;
  countries: Array<CountryResponse>;
  listDistrict: Array<DistrictResponse>;
  confirmLoading: boolean;
};

const SupplierAddressModal: React.FC<SupplierAddressModalProps> = (
  props: SupplierAddressModalProps
) => {
  const {visible, onCancle, data, onSave, countries, listDistrict, confirmLoading} = props;
  const [form] = Form.useForm();
  const onSelectDistrict = useCallback(
    (value: number) => {
      let cityId = -1;
      listDistrict.forEach((item) => {
        if (item.id === value) {
          cityId = item.city_id;
        }
      });
      if (cityId !== -1) {
        form.setFieldsValue({
          city_id: cityId,
        })
      }
    },
    [form, listDistrict]
  );

  const onFinish = useCallback((value: SupplierAddress) => {
    onSave(value.id, value);
  }, [onSave]);
  useEffect(() => {
    if(visible && form) {
      form.resetFields();
    }
  }, [form, visible]);
  return (
    <Modal
      maskClosable={false}
      onCancel={onCancle}
      confirmLoading={confirmLoading}
      closable={false}
      title={data === null ? "Thêm địa chỉ" : "Sửa địa chỉ"}
      visible={visible}
      okText={"Lưu lại"}
      onOk={() => {
        form.submit();
      }}
    >
      <Form
        onFinish={onFinish}
        form={form}
        layout="vertical" 
        initialValues={
          data === null ? {
            country_id: 233,
            city_id: null,
            district_id: null,
            address: '',
            is_default: false,
          } : data
        }
      >
        <Row gutter={50}>
          <Form.Item name="supplier_id" hidden noStyle>
            <Input />
          </Form.Item>
          <Form.Item name="id" hidden noStyle>
            <Input />
          </Form.Item>
          <Col span={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Quốc gia không được để trống",
                },
              ]}
              label="Quốc gia"
              name="country_id"
            >
              <Select placeholder="Chọn quốc gia">
                {countries?.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Khu vực" name="district_id">
              <Select
                showSearch
                onSelect={(value: number) => onSelectDistrict(value)}
                placeholder="Chọn khu vực"
                optionFilterProp="children"
                allowClear
              >
                {listDistrict?.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.city_name} - {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item hidden name="city_id">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={50}>
          <Col span={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ",
                },
              ]}
              label="Địa chỉ"
              name="address"
            >
              <Input placeholder="Nhập địa chỉ" maxLength={100} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              valuePropName="checked"
              name="is_default"
            >
              <Checkbox disabled={data && data.id && data.is_default ? true : false} >Đặt làm mặc định</Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default SupplierAddressModal;
