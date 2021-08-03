import { PlusOutlined } from "@ant-design/icons";
import { Input, Form, Row, Col, DatePicker, Select, Button, Card } from "antd";
import {
  CountryGetAllAction,
  GroupGetAction,
} from "domain/actions/content/content.action";
import {
  CustomerLevels,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model"
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
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
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [levels, setLevels] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  React.useEffect(() => {
    dispatch(GroupGetAction(setGroups));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(CustomerTypes(setTypes));
    dispatch(CustomerLevels(setLevels));
  }, [dispatch]);
  const handleSubmit = (values: any) => {
    console.log("Success:", values);
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
                  name="fullname"
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
                  rules={[
                    { required: true, message: "Vui lòng nhập ngày sinh" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Ngày sinh"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={12}>
                  <Col span={8}>
                    <Form.Item name="description">
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
              <Col span={6}>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn loại khách hàng",
                    },
                  ]}
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
              <Col span={6}>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn nhóm khách hàng",
                    },
                  ]}
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
              <Col span={6}>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn cấp độ khách hàng",
                    },
                  ]}
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
            <RenderCardAdress name="billing_addresses" component={AddressForm} title="ĐỊA CHỈ NHẬN HÓA ĐƠN " countries={countries} />
        </Col>
        <Col span={24} style={{ marginTop: "1.2rem" }}>
            <RenderCardAdress name="shipping_addresses" component={AddressForm} title="ĐỊA CHỈ GIAO HÀNG" countries={countries} />
        </Col>
        <Col span={24} style={{ marginTop: "1.2rem" }}>
            <RenderCardContact component={ContactForm} title="LIÊN HỆ" name="contacts" />
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
