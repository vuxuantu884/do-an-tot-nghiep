import { Col, Form, Input, Modal, Radio, Row, Select } from "antd";
import { AppConfig } from "config/AppConfig";
import { AccountSearchAction } from "domain/actions/account/account.action";
import { WardGetByDistrictAction } from "domain/actions/content/content.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { DistrictResponse } from "model/content/district.model";
import { WardResponse } from "model/content/ward.model";
import { SupplierCreateRequest } from "model/core/supplier.model";
import { PurchaseAddress } from "model/purchase-order/purchase-address.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { VietNamId } from "utils/Constants";
import { RegUtil } from "utils/RegUtils";

type SupplierAddModalProps = {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
};
const { Item } = Form;
const { Option } = Select;
const initRequest: SupplierCreateRequest = {
  address: "",
  bank_brand: "",
  bank_name: "",
  bank_number: "",
  beneficiary_name: "",
  certifications: [],
  city_id: null,
  country_id: VietNamId,
  contact_name: "",
  debt_time: null,
  debt_time_unit: null,
  district_id: null,
  website: null,
  email: "",
  fax: "",
  goods: [],
  person_in_charge: null,
  moq: null,
  note: "",
  name: "",
  phone: "",
  scorecard: null,
  status: "active",
  tax_code: "",
  type: "",
};
const SupplierAddModal: React.FC<SupplierAddModalProps> = (
  props: SupplierAddModalProps
) => {
  const dispatch = useDispatch();
  const [formSupplierAdd] = Form.useForm();
  const { visible, onCancel, onOk } = props;

  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const supplier_type = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.supplier_type
  );
  const goods = useSelector(
    (state: RootReducerType) => state.bootstrapReducer.data?.goods
  );
  const currentUserCode = useSelector(
    (state: RootReducerType) => state.userReducer?.account?.code
  );
  const setDataAccounts = useCallback(
    (data: PageResponse<AccountResponse>) => {
      let listWinAccount = data.items;
      console.log(listWinAccount);
      setAccounts(listWinAccount);
      let checkUser = listWinAccount.findIndex(
        (val) => val.code === currentUserCode
      );
      if (checkUser !== -1 && currentUserCode !== undefined) {
        formSupplierAdd.setFieldsValue({
          person_in_charge: [currentUserCode],
        });
      }
    },
    [currentUserCode, formSupplierAdd]
  );

  const onFinish = useCallback(() => {
    onOk();
  }, [onOk]);
  const onOkPress = useCallback(() => {
    // onOk();
    formSupplierAdd.submit();
  }, [formSupplierAdd]);
  const handleCancel = () => {
    formSupplierAdd.resetFields();
    onCancel();
  };

  useEffect(() => {
    dispatch(
      AccountSearchAction(
        { department_ids: [AppConfig.WIN_DEPARTMENT] },
        setDataAccounts
      )
    );
    return ()=>{
    formSupplierAdd.resetFields();

    }
  }, [dispatch, formSupplierAdd, setDataAccounts]);

  return (
    <Modal
      title="Thêm mới nhà cung cấp"
      visible={visible}
      centered
      okText="Thêm mới"
      cancelText="Hủy"
      className="update-customer-modal"
      onOk={onOkPress}
      width={700}
      onCancel={handleCancel}
    >
      <Form
        form={formSupplierAdd}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initRequest}
        scrollToFirstError
      >
        <Row gutter={24}>
          <Col xs={24} lg={12}>
            <Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại nhà cung cấp",
                },
              ]}
              label="Loại nhà cung cấp"
              name="type"
            >
              <Radio.Group>
                {supplier_type?.map((item) => (
                  <Radio value={item.value} key={item.value}>
                    {item.name}
                  </Radio>
                ))}
              </Radio.Group>
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item
              rules={[{ required: true, message: "Vui lòng chọn ngành hàng" }]}
              name="goods"
              label="Ngành hàng"
            >
              <Select
                mode="multiple"
                className="selector"
                placeholder="Chọn ngành hàng"
                showArrow
                // defaultValue="fashion"
              >
                {goods?.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item label="Mã nhà cung cấp" name="code">
              <Input disabled placeholder="Mã nhà cung cấp" />
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên nhà cung cấp",
                },
              ]}
              name="name"
              label="Tên nhà cung cấp"
            >
              <Input placeholder="Nhập tên nhà cung cấp" maxLength={255} />
            </Item>
          </Col>

          <Col xs={24} lg={12}>
            <Item
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọ nhân viên phụ trách",
                },
              ]}
              name="person_in_charge"
              label="Nhân viên phụ trách"
            >
              <Select
                placeholder="Chọn nhân viên phụ trách"
                className="selector"
                allowClear
                // defaultValue={personInCharge}
              >
                {accounts.map((item) => (
                  <Option key={item.code} value={item.code}>
                    {item.full_name}
                  </Option>
                ))}
              </Select>
            </Item>
          </Col>
          <Col xs={24} lg={12}>
            <Item
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: RegUtil.PHONE,
                  message: "Số điện thoại chưa đúng định dạng",
                },
              ]}
              name="phone"
              label="Số điện thoại"
            >
              <Input placeholder="Nhập số điện thoại" />
            </Item>
          </Col>
          <Col xs={24} lg={24}>
            <Item
              label="Địa chỉ"
              name="address"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập địa chỉ",
                },
              ]}
            >
              <Input placeholder="Nhập địa chỉ" maxLength={255} />
            </Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default SupplierAddModal;
