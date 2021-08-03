import { PlusOutlined } from "@ant-design/icons";
import { Input, Form, Row, Col, DatePicker, Select, Button, Card } from "antd";
import {
  CountryGetAllAction,
  GroupGetAction,
} from "domain/actions/content/content.action";
import { CountryResponse } from "model/content/country.model";
import { GroupResponse } from "model/content/group.model";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import AddressForm from "./address";
import "./customer.scss";

const { Option } = Select;

const CustomerEdit = (props: any) => {
  const [customerForm] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const [groups, setGroups] = React.useState<Array<GroupResponse>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  React.useEffect(() => {
    dispatch(GroupGetAction(setGroups));
    dispatch(CountryGetAllAction(setCountries));
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
                    <Form.Item
                      name="note"
                    >
                        <Input.TextArea placeholder="Ghi chú" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              {/* <Col span={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: ".75rem",
                }}
              >
                <h5>Địa chỉ giao hàng</h5>
              </div>
              <Form.List name="addresses">
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map((field, index) => (
                      <div key={field.key} style={{ width: "100%" }}>
                        <Form.Item noStyle shouldUpdate={true}>
                          {() => (
                            <AddressForm
                              index={index + 1}
                              countries={countries}
                              remove={remove}
                              field={field}
                            />
                          )}
                        </Form.Item>
                      </div>
                    ))}
                    <Form.Item>
                      <Button
                        type="primary"
                        size={"small"}
                        icon={<PlusOutlined />}
                        onClick={() => add()}
                      >
                        Thêm địa chỉ
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Col> */}
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
                  <Select placeholder="Phân loại khách hàng" />
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
                  <Select placeholder="Phân loại cấp độ khách hàng" />
                </Form.Item>
              </Col>
            </Row>
          </Card>
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

export default CustomerEdit;
