import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Modal,
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Space,
} from "antd";
import {
  CountryGetAllAction,
  GroupGetAction,
} from "domain/actions/content/content.action";
import { CountryResponse } from "model/content/country.model";
import { GroupResponse } from "model/content/group.model";
import React from "react";
import { useDispatch } from "react-redux";
import AddressForm from "./address";
import "./customer.scss";

interface CustomerAddProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const { Option } = Select;

const CustomerAdd = ({ visible, setVisible }: CustomerAddProps) => {
  const [customerForm] = Form.useForm();
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
    <Modal
      title="Thêm khách hàng"
      visible={visible}
      footer={null}
      // onOk={handleSubmit}
      onCancel={() => setVisible(false)}
      width={1200}
    >
      <Form
        form={customerForm}
        name="customer_add"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
        style={{maxHeight: '700px', overflowY: 'scroll',  overflowX: 'hidden',  position: 'relative'}}
      >
        <Row gutter={12}>
          <Col span={24}>
            <h5>Thông tin khách hàng</h5>
            <Row gutter={12}>
              <Col span={6}>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên khách hàng" },
                  ]}
                >
                  <Input placeholder="Tên khách hàng" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại" },
                  ]}
                >
                  <Input placeholder="Số điện thoại" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="pass_no"
                  rules={[
                    { required: true, message: "Vui lòng nhập số CMT/CCCD" },
                  ]}
                >
                  <Input placeholder="CMT/CCCD" />
                </Form.Item>
              </Col>
              <Col span={6}>
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
              <Col span={6}>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập thư điện tử" },
                  ]}
                >
                  <Input type="email" placeholder="Thư điện tử" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: ".75rem",
                  }}
                >
                  <h5>Địa chỉ giao hàng</h5>
                  {/* <Button type="primary" onClick={() => customerForm.setFieldsValue({addresses: []})}>Thêm địa chỉ</Button> */}
                </div>
                <Form.List name="addresses">
                  {(fields, { add, remove }, { errors }) => (
                    <>
                      {fields.map((field, index) => (
                        <div
                          key={field.key}
                          style={{width: '100%'}}
                        >
                          <Form.Item noStyle shouldUpdate={true}>
                            {() => (
                                <AddressForm index={index + 1} countries={countries} remove={remove} field={field} />
                            )}
                          </Form.Item>
                        </div>
                      ))}
                      <Form.Item>
                        <Button type="primary" size={'small'} icon={<PlusOutlined />} onClick={() => add()}>
                          Thêm địa chỉ
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <h5>Phân loại</h5>
            <Row gutter={15}>
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
          </Col>
        </Row>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <Button type="primary" htmlType="submit">Lưu</Button>
            <Button onClick={() => setVisible(false)} style={{marginLeft: '.75rem'}} type="ghost">Đóng</Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CustomerAdd;
