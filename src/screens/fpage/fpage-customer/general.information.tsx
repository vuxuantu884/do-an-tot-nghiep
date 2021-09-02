import { Input, Form, Row, Col, DatePicker, Select, Card, Tag } from "antd";
import { RegUtil } from "utils/RegUtils";
import "./customer.scss";
import CustomInput from "./customInput";
import React from "react";
import arrowDown from "assets/icon/arrow-down.svg";
import XCloseBtn from "assets/icon/X_close.svg";
const { Option } = Select;

const GeneralInformation = (props: any) => {
  const {
    form,
    areas,
    countries,
    wards,
    handleChangeArea,
    AccountChangeSearch,
    phones,
    setPhones,
    getCustomerWhenPhoneChange,
  } = props;
  const [showDetail, setShowDetail] = React.useState<boolean>(true);

  const clickPhone = (p: any) => {
    form.setFieldsValue({ phone: p });
    getCustomerWhenPhoneChange(p)
  };
  const deletePhone = (p: any, e: any) => {
    e.stopPropagation();
    let _phones = [...phones];
    const index: any = _phones.indexOf(p);
    console.log(index);
    _phones.splice(index, 1);
    setPhones(_phones);
  };
  return (
    <Row gutter={24}>
      <Col span={24}>
        <Card style={{ padding: "12px" }}>
          <Col span={24}>
            <CustomInput
              name="full_name"
              label={
                <span className="customer-field-label">Tên khách hàng:</span>
              }
              form={form}
              message="Vui lòng nhập họ tên khách hàng"
              placeholder="Nhập họ và tên khách hàng"
              isRequired={true}
              maxLength={255}
            />
          </Col>
          <Col span={24}>
            <Form.Item
              name="birthday"
              label={<span className="customer-field-label">Ngày sinh:</span>}
              // rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Chọn ngày sinh"
                format={"DD/MM/YYYY"}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="phone"
              label={
                <span className="customer-field-label">Số điện thoại:</span>
              }
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
                style={{ borderRadius: 5 }}
                minLength={9}
                maxLength={15}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
            {phones.length > 0 && (
              <Row
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginBottom: 10,
                }}
              >
                <Col span={16}>
                  {phones && phones.map((p: any, index: any) => (
                    <Tag
                      key={index}
                      style={{ cursor: "pointer" }}
                      onClick={() => clickPhone(p)}
                    >
                      {p}
                      <img
                        alt="delete"
                        onClick={(e: any) => deletePhone(p, e)}
                        style={{ width: 16, marginBottom: 2 }}
                        src={XCloseBtn}
                      ></img>
                    </Tag>
                  ))}
                </Col>
              </Row>
            )}
          </Col>
          <Row hidden={showDetail} style={{ padding: "0 12px" }}>
            <Col span={24}>
              <Form.Item
                name="email"
                label={<span className="customer-field-label">Email:</span>}
                rules={[
                  {
                    pattern: RegUtil.EMAIL_NO_SPECIAL_CHAR,
                    message: "Vui lòng nhập đúng định dạng email",
                  },
                ]}
              >
                <Input maxLength={255} type="text" placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="gender"
                label={<span className="customer-field-label">Giới tính:</span>}
                // rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value={"male"}>Nam</Option>
                  <Option value={"female"}>Nữ</Option>
                  <Option value={"other"}>Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                hidden
                name="website"
                label={
                  <span className="customer-field-label">
                    Website/Facebook:
                  </span>
                }
                rules={[
                  {
                    pattern: RegUtil.WEBSITE_URL_2,
                    message: "Website/Facebook chưa đúng định dạng",
                  },
                ]}
              >
                <Input maxLength={255} placeholder="Nhập Website/facebook" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                hidden
                name="wedding_date"
                label={<span className="customer-field-label">Ngày cưới:</span>}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày cưới"
                  format={"DD/MM/YYYY"}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                hidden
                name="company"
                label={
                  <span className="customer-field-label">Tên đơn vị:</span>
                }
              >
                <Input maxLength={255} placeholder="Nhập tên đơn vị" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                hidden
                label={
                  <span className="customer-field-label">Mã số thuế:</span>
                }
                name="tax_code"
                rules={[
                  {
                    pattern: RegUtil.NUMBERREG,
                    message: "Mã số thuế chỉ được phép nhập số",
                  },
                ]}
              >
                <Input maxLength={255} placeholder="Mã số thuế" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                hidden
                label={<span className="customer-field-label">Quốc gia:</span>}
                name="country_id"
                initialValue={233}
              >
                <Select
                  placeholder="Quốc gia"
                  disabled
                  // onChange={handleChangeCountry}
                  showSearch
                  allowClear
                  optionFilterProp="children"
                >
                  {countries.map((country: any) => (
                    <Option key={country.id} value={country.id}>
                      {country.name + ` - ${country.code}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={<span className="customer-field-label">Khu vực:</span>}
                name="district_id"
              >
                <Select
                  showSearch
                  placeholder="Chọn khu vực"
                  onChange={handleChangeArea}
                  allowClear
                  optionFilterProp="children"
                >
                  {areas.map((area: any) => (
                    <Option key={area.id} value={area.id}>
                      {area.city_name + ` - ${area.name}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Form.Item label="city" name="city_id" hidden>
              <Input />
            </Form.Item>
            <Col span={24}>
              <Form.Item
                label={
                  <span className="customer-field-label">Phường/ Xã:</span>
                }
                name="ward_id"
              >
                <Select
                  showSearch
                  allowClear
                  optionFilterProp="children"
                  placeholder="Chọn phường/xã"
                  // onChange={handleChangeWard}
                >
                  {wards.map((ward: any) => (
                    <Option key={ward.id} value={ward.id}>
                      {ward.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <CustomInput
                name="full_address"
                label={
                  <span className="customer-field-label">
                    Địa chỉ chi tiết:
                  </span>
                }
                form={form}
                message="Vui lòng nhập địa chỉ"
                placeholder="Nhập địa chỉ chi tiết"
                maxLength={500}
                isRequired={false}
              />
            </Col>
          </Row>
          <Row
            style={{
              padding: "0px 15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Col span={7} style={{ cursor: "pointer" }}>
              <div
                style={{ flex: 1 }}
                onClick={() => {
                  setShowDetail(!showDetail);
                }}
              >
                <img
                  alt="arrow down"
                  src={arrowDown}
                  style={
                    !showDetail
                      ? { marginBottom: "3px", transform: "rotate(180deg)" }
                      : { marginBottom: "3px" }
                  }
                ></img>
                <span style={{ marginLeft: "5px" }}>
                  {showDetail ? "Xem thêm" : "Thu gọn"}
                </span>
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
        </Card>
      </Col>
      <Col span={24}>
        <Card>
          <Row gutter={12} style={{ padding: "16px" }}>
            <Col span={24}>
              <Form.Item label={<b>Ghi chú:</b>} name="note">
                <Input.TextArea maxLength={500} placeholder="Nhập ghi chú" />
              </Form.Item>
            </Col>
          </Row>
          <Row hidden gutter={12} style={{ padding: "16px" }}>
            <Col span={24}>
              <Form.Item
                name="customer_type_id"
                label={
                  <span className="customer-field-label">Loại khách hàng:</span>
                }
                // rules={[
                //   {
                //     required: true,
                //     message: "Vui lòng chọn loại khách hàng",
                //   },
                // ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn loại khách hàng"
                  allowClear
                  optionFilterProp="children"
                >
                  {props.types &&
                    props.types.map((type: any) => (
                      <Option key={type.id} value={type.id}>
                        {type.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="customer_group_id"
                label={
                  <span className="customer-field-label">Nhóm khách hàng:</span>
                }
                // rules={[
                //   {
                //     required: true,
                //     message: "Vui lòng chọn nhóm khách hàng",
                //   },
                // ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn nhóm khách hàng"
                  allowClear
                  optionFilterProp="children"
                >
                  {props.groups &&
                    props.groups.map((group: any) => (
                      <Option key={group.id} value={group.id}>
                        {group.name}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="responsible_staff_code"
                label={
                  <span className="customer-field-label">
                    Nhân viên phụ trách:
                  </span>
                }

                // rules={[
                //   {
                //     required: true,
                //     message: "Vui lòng chọn cấp độ khách hàng",
                //   },
                // ]}
              >
                <Select
                  showSearch
                  placeholder="Chọn nv phụ trách"
                  allowClear
                  optionFilterProp="children"
                  onSearch={(value) => AccountChangeSearch(value)}
                >
                  {props.accounts &&
                    props.accounts.map((c: any) => (
                      <Option key={c.id} value={c.code}>
                        {`${c.code} - ${c.full_name}`}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={<span className="customer-field-label">Mô tả:</span>}
                name="description"
              >
                <Input.TextArea maxLength={500} placeholder="Nhập mô tả" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default GeneralInformation;
