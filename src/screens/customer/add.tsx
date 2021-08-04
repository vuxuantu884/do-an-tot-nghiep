import { Input, Form, Row, Col, DatePicker, Select, Button, Card } from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  CreateCustomer,
  CustomerGroups,
  CustomerLevels,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import { CustomerModel } from "model/request/customer.request";
import moment from "moment";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { showSuccess } from "utils/ToastUtils";
import AddressForm from "./address";
import ContactForm from "./contact";
import "./customer.scss";
import NoteForm from "./note";
import RenderCardAdress from "./render/card.address";
import RenderCardContact from "./render/card.contact";
import RenderCardNote from "./render/card.note";

const { Option } = Select;

const CustomerAdd = (props: any) => {
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [companies, setCompanies] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [levels, setLevels] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  React.useEffect(() => {
    //dispatch(CustomerGroups(setGroups));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(CustomerTypes(setTypes));
    dispatch(CustomerLevels(setLevels));
  }, [dispatch]);
  React.useEffect(() => {
    customerForm.setFieldsValue(new CustomerModel());
  }, []);
  const setResult = React.useCallback((result) => {
    if (result) {
      showSuccess("Thêm khách hàng thành công");
      history.goBack();
    }
  }, []);
  const handleSubmit = (values: any) => {
    console.log("Success:", values);
    let piece = {
      ...values,
      birthday: moment(new Date(values.birthday), "YYYY-MM-DD").format(
        "YYYY-MM-DD"
      ),
      wedding_date: values.wedding_date
        ? new Date(values.wedding_date).toISOString()
        : null,
    };
    dispatch(CreateCustomer({ ...new CustomerModel(), ...piece }, setResult));
  };
  const handleSubmitFail = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <Form
      form={customerForm}
      name="customer_add"
      onFinish={handleSubmit}
      onFinishFailed={handleSubmitFail}
      layout="vertical"
    >
      <Row gutter={24}>
        <Col span={24}>
          <Card
            title={
              <div className="d-flex">
                <span className="title-card">THÔNG TIN KHÁCH HÀNG</span>
              </div>
            }
          >
            <Row gutter={16} style={{ padding: "16px" }}>
              <Col span={4}>
                <Form.Item
                  name="full_name"
                  label="Tên khách hàng"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên khách hàng" },
                  ]}
                >
                  <Input placeholder="Tên khách hàng" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input placeholder="Số điện thoại" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Vui lòng nhập thư điện tử" },
                  ]}
                >
                  <Input type="email" placeholder="Thư điện tử" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="gender"
                  label="Giới tính"
                  rules={[
                    { required: true, message: "Vui lòng chọn giới tính" },
                  ]}
                >
                  <Select placeholder="Giới tính">
                    <Option value={"male"}>Nam</Option>
                    <Option value={"female"}>Nữ</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="birthday"
                  label="Ngày sinh"
                  rules={[
                    { required: true, message: "Vui lòng nhập ngày sinh" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Ngày sinh"
                    format={"YYYY-MM-DD"}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={12}>
                  <Col span={4}>
                    <Form.Item name="company_id" label="Công ty">
                      <Select placeholder="Công ty">
                        {companies.map((company) => (
                          <Option key={company.id} value={company.id}>
                            {company.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="wedding_date" label="Ngày cưới">
                      <DatePicker
                        style={{ width: "100%" }}
                        placeholder="Ngày cưới"
                        format={"YYYY-MM-DD"}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="website" label="Website">
                      <Input placeholder="Website" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="description" label="Mô tả">
                      <Input.TextArea placeholder="Mô tả" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24} style={{ marginTop: "1.2rem" }}>
          <Card
            title={
              <div className="d-flex">
                <span className="title-card">PHÂN LOẠI</span>
              </div>
            }
          >
            <Row gutter={12} style={{ padding: "16px" }}>
              <Col span={4}>
                <Form.Item
                  name="customer_type_id"
                  label="Loại khách hàng"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Vui lòng chọn loại khách hàng",
                  //   },
                  // ]}
                >
                  <Select placeholder="Phân loại khách hàng">
                    {types.map((type) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="customer_group_id"
                  label="Nhóm khách hàng"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Vui lòng chọn nhóm khách hàng",
                  //   },
                  // ]}
                >
                  <Select placeholder="Phân loại nhóm khách hàng">
                    {groups.map((group) => (
                      <Option key={group.id} value={group.id}>
                        {group.name + ` - ${group.code}`}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="customer_level_id"
                  label="Cấp độ khách hàng"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Vui lòng chọn cấp độ khách hàng",
                  //   },
                  // ]}
                >
                  <Select placeholder="Phân loại cấp độ khách hàng">
                    {levels.map((level) => (
                      <Option key={level.id} value={level.id}>
                        {level.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24} style={{ marginTop: "1.2rem" }}>
          <RenderCardAdress
            name="billing_addresses"
            component={AddressForm}
            title="ĐỊA CHỈ NHẬN HÓA ĐƠN "
            countries={countries}
            isEdit={false}
            form={customerForm}
          />
        </Col>
        <Col span={24} style={{ marginTop: "1.2rem" }}>
          <RenderCardAdress
            name="shipping_addresses"
            component={AddressForm}
            title="ĐỊA CHỈ GIAO HÀNG"
            countries={countries}
            isEdit={false}
            form={customerForm}
          />
        </Col>
        <Col span={24} style={{ marginTop: "1.2rem" }}>
          <RenderCardContact
            component={ContactForm}
            title="LIÊN HỆ"
            name="contacts"
            isEdit={false}
            form={customerForm}
          />
        </Col>
        <Col span={24} style={{ marginTop: "1.2rem" }}>
          <RenderCardNote component={NoteForm} title="GHI CHÚ" name="notes" />
        </Col>
      </Row>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: ".75rem",
        }}
      >
        <Button type="primary" htmlType="submit">
          Lưu
        </Button>
        <Button
          onClick={() => history.goBack()}
          style={{ marginLeft: ".75rem" }}
          type="ghost"
        >
          Hủy
        </Button>
      </div>
    </Form>
  );
};

export default CustomerAdd;
