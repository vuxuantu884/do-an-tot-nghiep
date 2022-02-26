import { Col, Form, Input, Modal, Row, Select } from "antd";
import { WardGetByDistrictAction } from "domain/actions/content/content.action";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { WardResponse } from "model/content/ward.model";
import { PurchaseAddress } from "model/purchase-order/purchase-address.model";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { VietNamId } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";

type EditAddressModalProps = {
  visible: boolean;
  listCountry: Array<CountryResponse>;
  listDistrict: Array<DistrictResponse>;
  addressInfo?: PurchaseAddress;
  addressType?: string;
  onCancel: () => void;
  onOk: (addressUpdate: PurchaseAddress, addressType?: string) => void;
};
const { Item } = Form;
const { Option } = Select;

const EditAddressModal: React.FC<EditAddressModalProps> = (props: EditAddressModalProps) => {
  const dispatch = useDispatch();
  const { visible, listCountry, listDistrict, onCancel, onOk, addressInfo } = props;
  const [formAddress] = Form.useForm();
  const [listWard, setListWard] = useState<Array<WardResponse>>([]);
  const [loadWard, setloadWard] = useState<boolean>(false);
  const getListWardCallback = useCallback(
    (results: Array<WardResponse>) => {
      formAddress.setFieldsValue({
        ward_id: undefined,
        ward: "",
      });
      setListWard(results);
      setloadWard(false);
    },
    [formAddress]
  );
  const onChangeDistrict = useCallback(
    (value: number) => {
      setloadWard(true);
      let cityId = -1;
      let city_name = "";
      let district_name = "";
      listDistrict.forEach((item) => {
        if (item.id === value) {
          cityId = item.city_id;
          city_name = item.city_name;
          district_name = item.name;
        }
      });
      if (cityId !== -1) {
        formAddress.setFieldsValue({
          city_id: cityId,
          city: city_name,
          district: district_name,
        });
      }
      dispatch(WardGetByDistrictAction(value, getListWardCallback));
    },
    [dispatch, formAddress, getListWardCallback, listDistrict]
  );
  const onChangeWard = useCallback(
    (value: number) => {
      let ward_name = "";
      listWard.forEach((item) => {
        if (item.id === value) {
          ward_name = item.name;
        }
      });
      if (ward_name !== "") {
        formAddress.setFieldsValue({
          ward: ward_name,
        });
      }
    },
    [formAddress, listWard]
  );

  const onAddressFormFinish = (values: PurchaseAddress) => onOk(values);

  useEffect(() => {
    if (addressInfo?.district_id !== null && addressInfo?.district_id !== undefined) {
      dispatch(WardGetByDistrictAction(addressInfo?.district_id, getListWardCallback));
    }
  }, [addressInfo?.district_id, dispatch, getListWardCallback]);
  useEffect(() => {
    if (visible) {
      formAddress.setFieldsValue(addressInfo);
    }
  }, [addressInfo, formAddress, visible]);
  return (
    <Modal
      title="Chỉnh sửa thông tin địa chỉ"
      visible={visible}
      centered
      okText="Lưu"
      cancelText="Hủy"
      className="update-customer-modal"
      onOk={() => formAddress.submit()}
      width={700}
      onCancel={onCancel}>
      <Form layout="vertical" form={formAddress} scrollToFirstError onFinish={onAddressFormFinish}>
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Item name="name" label="Người liên hệ">
              <Input placeholder="Người liên hệ" maxLength={255} />
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item
              name="phone"
              label=" Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: RegUtil.PHONE,
                  message: "Số điện thoại chưa đúng định dạng",
                },
              ]}>
              <Input placeholder=" Số điện thoại" maxLength={255} />
            </Item>
          </Col>

          <Col xs={24} lg={12}>
            <Item name="country_id" label="Quốc gia">
              <Select
                defaultValue={VietNamId}
                showSearch
                placeholder="Chọn quốc gia"
                allowClear
                optionFilterProp="children"
                disabled>
                {listCountry?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item label="Khu vực" name="district_id">
              <Select
                showSearch
                onSelect={onChangeDistrict}
                className="selector"
                placeholder="Chọn khu vực"
                allowClear
                optionFilterProp="children">
                {listDistrict?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.city_name} - {item.name}
                  </Option>
                ))}
              </Select>
            </Item>
            <Item hidden name="city_id">
              <Input />
            </Item>
            <Item hidden name="city">
              <Input />
            </Item>
            <Item hidden name="district">
              <Input />
            </Item>
            <Item hidden name="ward">
              <Input />
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item label="Phường xã" name="ward_id">
              <Select
                showSearch
                onSelect={onChangeWard}
                className="selector"
                placeholder="Chọn phường xã"
                allowClear
                optionFilterProp="children"
                loading={loadWard}>
                {listWard?.map((item) => (
                  <Option key={item.id} value={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Item>
          </Col>
          <Col xs={24} lg={24}>
            <Item name="full_address" label="Địa chỉ">
              <Input placeholder="Địa chỉ" maxLength={255} />
            </Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditAddressModal;
