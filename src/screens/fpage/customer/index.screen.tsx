import {
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Card,
  Collapse,
  Button,
} from "antd";
import arrowDown from "assets/icon/arrow-down.svg";
import { useState } from "react";
import { RegUtil } from "utils/RegUtils";
import "./customer.scss";
const { Panel } = Collapse;

const { Option } = Select;

const GeneralInformation = (props: any) => {
  const [showDetail, setShowDetail] = useState<boolean>(false);

  return (
    <Row gutter={24}>
      <Col span={24}>
        <Card>
          <Row style={{ padding: "8px 15px" }}>
            <Col span={7}>
              <Form.Item
                name="name"
                label={<b>Tên KH</b>}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ tên khách hàng",
                  },
                ]}
              ></Form.Item>
            </Col>
            <Col span={17}>
              <Input
                style={{ borderRadius: 5, width: "100%" }}
                minLength={9}
                maxLength={15}
                placeholder="Nhập họ tên khách hàng"
              />
            </Col>
          </Row>

          <Row style={{ padding: "8px 15px" }}>
            <Col span={7}>
              <Form.Item
                name="birthday"
                label={<b>Ngày sinh:</b>}
                // rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
              ></Form.Item>
            </Col>
            <Col span={17}>
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày sinh"
                format={"DD/MM/YYYY"}
              />
            </Col>
          </Row>
          <Row style={{ padding: "8px 15px" }}>
            <Col span={7}>
              <Form.Item
                name="phone"
                label={<b>SĐT:</b>}
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
              ></Form.Item>
            </Col>

            <Col span={17}>
              <Input
                style={{ borderRadius: 5, width: "100%" }}
                minLength={9}
                maxLength={15}
                placeholder="Nhập số điện thoại"
              />
            </Col>
          </Row>

          <Row
            style={{
              padding: "8px 15px",
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
                style={{ width: "100%", height: 1, backgroundColor: "#E5E5E5" }}
              ></div>
            </Col>
          </Row>
          <div style={{ display: showDetail ? "block" : "none" }}>
            <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  name="email"
                  label={<b>Email:</b>}
                  rules={[
                    {
                      pattern: RegUtil.EMAIL_NO_SPECIAL_CHAR,
                      message: "Vui lòng nhập đúng định dạng email",
                    },
                  ]}
                ></Form.Item>
              </Col>
              <Col span={17}>
                <Input maxLength={255} type="text" placeholder="Nhập email" />
              </Col>
            </Row>
            <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  name="gender"
                  label={<b>Giới tính:</b>}
                  // rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                ></Form.Item>
              </Col>
              <Col span={17}>
                <Select placeholder="Chọn giới tính" style={{ width: "100%" }}>
                  <Option value={"male"}>Nam</Option>
                  <Option value={"female"}>Nữ</Option>
                  <Option value={"other"}>Khác</Option>
                </Select>
              </Col>
            </Row>
            {/* <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  name="website"
                  label={<b>Website/Facebook:</b>}
                  rules={[
                    {
                      pattern: RegUtil.WEBSITE_URL_2,
                      message: "Website/Facebook chưa đúng định dạng",
                    },
                  ]}
                ></Form.Item>
              </Col>
              <Col span={17}>
                <Input maxLength={255} placeholder="Nhập Website/facebook" />
              </Col>
            </Row> */}
            {/* <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  name="wedding_date"
                  label={<b>Ngày cưới:</b>}
                ></Form.Item>
              </Col>
              <Col span={17}>
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày cưới"
                  format={"DD/MM/YYYY"}
                />
              </Col>
            </Row> */}
            {/* <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  name="company"
                  label={<b>Tên đơn vị:</b>}
                ></Form.Item>
              </Col>
              <Col span={17}>
                <Input maxLength={255} placeholder="Nhập tên đơn vị" />
              </Col>
            </Row> */}
            {/* <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  label={<b>Mã số thuế:</b>}
                  name="tax_code"
                  rules={[
                    {
                      pattern: RegUtil.NUMBERREG,
                      message: "Mã số thuế chỉ được phép nhập số",
                    },
                  ]}
                ></Form.Item>
              </Col>
              <Col span={17}>
                <Input maxLength={255} placeholder="Mã số thuế" />
              </Col>
            </Row> */}
            {/* <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  label={<b>Quốc gia:</b>}
                  name="country_id"
                  initialValue={233}
                ></Form.Item>
              </Col>
              <Col span={17}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Quốc gia"
                  disabled
                  // onChange={handleChangeCountry}
                  showSearch
                  allowClear
                  optionFilterProp="children"
                > */}
            {/* {countries.map((country: any) => (
                          <Option key={country.id} value={country.id}>
                            {country.name + ` - ${country.code}`}
                          </Option>
                        ))} */}
            {/* <Option key={"233"} value={"233"}>
                    Việt nam
                  </Option>
                </Select>
              </Col>
            </Row> */}
            <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  label={<b>Khu vực:</b>}
                  name="district_id"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Vui lòng chọn khu vực",
                  //   },
                  // ]}
                ></Form.Item>
              </Col>
              <Col span={17}>
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
              </Col>
            </Row>
            <Form.Item label="city" name="city_id" hidden>
              <Input />
            </Form.Item>
            <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  label={<b>Phường/ Xã:</b>}
                  name="ward_id"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Vui lòng chọn xã/phường",
                  //   },
                  // ]}
                ></Form.Item>
              </Col>
              <Col span={17}>
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
              </Col>
            </Row>
            <Row style={{ padding: "8px 15px" }}>
              <Col span={7}>
                <Form.Item
                  label={<b>Địa chỉ chi tiết:</b>}
                  name="full_address"
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Vui lòng nhập địa chỉ",
                  //   },
                  // ]}
                ></Form.Item>
              </Col>
              <Col span={17}>
                <Input maxLength={500} placeholder="Nhập địa chỉ chi tiết" />
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
                  style={{ width: "100%", height: 1, backgroundColor: "#E5E5E5" }}
                ></div>
              </Col>
            </Row>
            
          </div>
          <Row style={{padding: "0px 15px", float:"right"}}>
              <Button type="primary" htmlType="submit">
                Lưu khách hàng
              </Button>
            </Row>
          <Row style={{padding: "8px 15px", clear:"both"}}>
            <div style={{ width: "100%", height: 1, backgroundColor: "#E5E5E5" }}></div>
          </Row>
          <Row style={{padding: "8px 15px"}}>
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
