import "./customer.scss";
import { RegUtil } from "utils/RegUtils";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import arrowDown from "assets/icon/arrow-down.svg";
import { CustomerSearchQuery } from "model/query/customer.query";
import { CustomerSearchByPhone } from "domain/actions/customer/customer.action";
import { Input, Form, Row, Col, DatePicker, Select, Card, Button, Tag } from "antd";



const GeneralInformation = (props: any) => {
  const { Option } = Select;
  const dispatch = useDispatch();
  const [customerForm] = Form.useForm();
  const [customer, setCustomer] = useState<any>({});
  const [showDetail, setShowDetail] = useState<boolean>(false);
  
  const phones = ["0987654321", "0123456789", "+84987654321"];
  

  const clickPhone = (e: any) => {
    let customerPhone: CustomerSearchQuery = {
      request: null,
      gender: null,
      from_birthday: null,
      to_birthday: null,
      company: null,
      from_wedding_date: null,
      to_wedding_date: null,
      customer_type_id: null,
      customer_group_id: null,
      customer_level_id: null,
      responsible_staff_code: null,
      phone: e.target.innerHTML,
    };
    dispatch(CustomerSearchByPhone(customerPhone, setCustomer));
  };

  const deletePhone = (e:string) => {
    console.log(e)
  }
  useEffect(() => {
    customerForm.setFieldsValue({
      name: customer.full_name,
      phone: customer.phone,
      // birthday: customer.birthday,
      email: customer.email,
      gender: customer.gender,
      city_id: customer.city_id,
      district_id: customer.district_id,
      ward_id: customer.ward_id,
      full_address: customer.full_address,
    });
  }, [customer, customerForm]);
  return (
    <Row gutter={24}>
      <Col span={24}>
        <Card>
          <Form form={customerForm}>
            <Row
              style={{
                paddingTop: "15px",
                paddingLeft: "15px",
                paddingRight: "15px",
              }}
            >
              <Col span={7}>
                <span>
                  <b>Tên KH:</b>
                </span>
              </Col>
              <Col span={17}>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên khách hàng",
                    },
                  ]}
                >
                  <Input
                    style={{ borderRadius: 5, width: "100%" }}
                    minLength={9}
                    maxLength={15}
                    placeholder="Nhập họ tên khách hàng"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row style={{ padding: "0px 15px" }}>
              <Col span={7}>
                <span>
                  <b>Ngày sinh:</b>
                </span>
              </Col>
              <Col span={17}>
                <Form.Item name="birthday">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Chọn ngày sinh"
                    format={"DD/MM/YYYY"}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row
              style={{
                marginBottom: "-5px",
                paddingTop: "0px",
                paddingLeft: "15px",
                paddingRight: "15px",
              }}
            >
              <Col span={7}>
                <span>
                  <b>SĐT:</b>
                </span>
              </Col>

              <Col span={17}>
                <Form.Item
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
                  ]}
                >
                  <Input
                    style={{ borderRadius: 5, width: "100%" }}
                    minLength={9}
                    maxLength={15}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ padding: "0px 15px" }}>
              <Col span={7}></Col>
              <Col span={17}>
                {phones.map((p) => (
                  <Tag  closable style={{ cursor: "pointer" }} onClick={clickPhone} onClose={(e)=>deletePhone}>
                    {p}
                  </Tag>
                ))}
              </Col>
            </Row>
            <Row
              style={{
                padding: "0px 15px",
                display: !showDetail ? "flex" : "none",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Col span={7} style={{ cursor: "pointer" }}>
                {" "}
                <div
                  style={{ flex: 1 }}
                  onClick={() => {
                    setShowDetail(!showDetail);
                  }}
                >
                  <img
                    alt="arrow down"
                    src={arrowDown}
                    style={{ marginBottom: "3px", marginRight: "5px" }}
                  ></img>
                  <span> Xem thêm</span>
                </div>
              </Col>
              <Col
                span={17}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    backgroundColor: "#E5E5E5",
                  }}
                ></div>
              </Col>
            </Row>
            <div style={{ display: showDetail ? "block" : "none" }}>
              <Row
                style={{
                  paddingTop: "10px",
                  paddingLeft: "15px",
                  paddingRight: "15px",
                }}
              >
                <Col span={7}>
                  <span>
                    <b>Email:</b>
                  </span>
                </Col>
                <Col span={17}>
                  <Form.Item name="email">
                    <Input
                      style={{ borderRadius: 5, width: "100%" }}
                      minLength={9}
                      maxLength={15}
                      placeholder="Nhập email"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ padding: "0px 15px" }}>
                <Col span={7}>
                  <span>
                    <b>Giới tính:</b>
                  </span>
                </Col>
                <Col span={17}>
                  <Form.Item name="gender">
                    <Select
                      placeholder="Chọn giới tính"
                      style={{ width: "100%" }}
                    >
                      <Option value={"male"}>Nam</Option>
                      <Option value={"female"}>Nữ</Option>
                      <Option value={"other"}>Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row style={{ padding: "0px 15px" }}>
                <Col span={7}>
                  <span>
                    <b>Khu vực:</b>
                  </span>
                </Col>
                <Col span={17}>
                  <Form.Item name="district_id">
                    <Select
                      style={{ width: "100%" }}
                      showSearch
                      placeholder="Chọn khu vực"
                      // onChange={handleChangeArea}
                      allowClear
                      optionFilterProp="children"
                    >
                      {/* {areas.map((area: any) => (
                          <Option key={area.id} value={area.id}>
                            {area.city_name + ` - ${area.name}`}
                          </Option>
                        ))} */}
                      <Option key={1} value={1}>
                        Hà Nội
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="city" name="city_id" hidden>
                <Input />
              </Form.Item>
              <Row style={{ padding: "0px 15px" }}>
                <Col span={7}>
                  <span>
                    <b>Phường/Xã:</b>
                  </span>
                </Col>
                <Col span={17}>
                  <Form.Item name="ward_id">
                    <Select
                      style={{ width: "100%" }}
                      showSearch
                      allowClear
                      optionFilterProp="children"
                      placeholder="Chọn phường/xã"
                      // onChange={handleChangeWard}
                    >
                      {/* {wards.map((ward: any) => (
                          <Option key={ward.id} value={ward.id}>
                            {ward.name}
                          </Option>
                        ))} */}
                      <Option key={1} value={1}>
                        Đống Đa
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ padding: "0px 15px" }}>
                <Col span={7}>
                  <span>
                    <b>Địa chỉ chi tiết:</b>
                  </span>
                </Col>
                <Col span={17}>
                  <Form.Item name="full_address">
                    <Input
                      maxLength={500}
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row
                style={{
                  padding: "5px 15px",
                  display: showDetail ? "flex" : "none",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Col span={7} style={{ cursor: "pointer" }}>
                  {" "}
                  <div
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowDetail(!showDetail);
                    }}
                  >
                    <img
                      alt="arrow down"
                      src={arrowDown}
                      style={{
                        marginBottom: "3px",
                        marginRight: "5px",
                        transform: "rotate(180deg)",
                      }}
                    ></img>
                    <span> Thu gọn</span>
                  </div>
                </Col>
                <Col
                  span={17}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      margin: "10px",
                      width: "100%",
                      height: 1,
                      backgroundColor: "#E5E5E5",
                    }}
                  ></div>
                </Col>
              </Row>
            </div>
            <Row style={{ padding: "0px 15px", float: "right" }}>
              <Button type="primary" htmlType="submit">
                Lưu khách hàng
              </Button>
            </Row>
          </Form>
          <Row style={{ padding: "0px 15px", clear: "both" }}>
            <div
              style={{ width: "100%", height: 1, backgroundColor: "#E5E5E5" }}
            ></div>
          </Row>
          <Row style={{ padding: "0px 15px" }}>
            <Col span={7}>
              <Form.Item
                label={<b>Ghi chú:</b>}
                name="full_address"
              ></Form.Item>
            </Col>
            <Col span={17}>
              <Input maxLength={500} placeholder="Nhập ghi chú" />
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default GeneralInformation;
