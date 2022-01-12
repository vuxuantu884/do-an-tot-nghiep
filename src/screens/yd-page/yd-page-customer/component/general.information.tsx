import { Input, Form, Row, Col, DatePicker, Select, Card, Tag, Button } from "antd";
import { BarcodeOutlined, CalendarOutlined } from "@ant-design/icons";
import { RegUtil } from "utils/RegUtils";
import "../customer.scss";
import CustomInput from "../common/customInput";
import React, { Fragment, useEffect } from "react";
import arrowDown from "assets/icon/arrow-down.svg";
import XCloseBtn from "assets/icon/X_close.svg";
import moment from "moment";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import phonePlus from "assets/icon/phone-plus.svg";
import AddPhoneModal from "../AddPhoneModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";

const { Option } = Select;

const GeneralInformation = (props: any) => {
  const {
    form,
    areas,
    countries,
    wards,
    handleChangeArea,
    AccountChangeSearch,
    getCustomerWhenPhoneChange,
    customerId,
    notes,
    handleNote,
    customer,
    loyaltyPoint,
    loyaltyUsageRules,
    customerPhone,
    customerPhones,
    addFpPhone,
    deleteFpPhone,
    setFpDefaultPhone,
    isDisable,
  } = props;
  const [showDetail, setShowDetail] = React.useState<boolean>(true);

  const [visiblePhoneModal, setVisiblePhoneModal] = React.useState<boolean>(false);

  const [visibleDeletePhoneModal, setVisibleDeletePhoneModal] =
    React.useState<boolean>(false);

  const [doDeletePhone, setDoDeletePhone] = React.useState<() => void>(() => () => { });

  const showPhoneModal = () => {
    setVisiblePhoneModal(true);
  };

  const hidePhoneModal = () => {
    setVisiblePhoneModal(false);
  };

  useEffect(() => {
    let phoneValue = form.getFieldValue("phone");
    if (!phoneValue) {
      form.setFieldsValue({ phone: customerPhone });
      getCustomerWhenPhoneChange(customerPhone);
    }
  }, [customerPhone, form, getCustomerWhenPhoneChange]);

  const clickPhone = (p: any) => {
    form.setFieldsValue({ phone: p });
    getCustomerWhenPhoneChange(p);
  };

  const addNote = (e: any) => {
    e.preventDefault();
    handleNote.create(e.target.value);
    form.setFieldsValue({ note: "" });
  };

  const deleteNote = (note: any) => {
    handleNote.delete(note, customerId);
  };

  const showConfirmDeletePhone = (p: string) => {
    setVisibleDeletePhoneModal(true);
    setDoDeletePhone(() => () => {
      deleteFpPhone(p);
      setVisibleDeletePhoneModal(false);
    });
  };

  return (
    <Fragment>
      <Row gutter={24}>
        <Col span={24}>
          <Card style={{ padding: "20px 8px" }}>
            <Col span={24}>
              <CustomInput
                name="full_name"
                label={<span className="customer-field-label">Tên KH:</span>}
                form={form}
                customer={customer}
                loyaltyPoint={loyaltyPoint}
                loyaltyUsageRules={loyaltyUsageRules}
                message="Nhập tên khách hàng"
                placeholder="Nhập tên khách hàng"
                isRequired={true}
                maxLength={255}
                isDisable={isDisable}
              />
            </Col>
            <Col span={24}>
              <Form.Item
                name="birthday"
                label={<span className="customer-field-label">Ngày sinh:</span>}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={isDisable}
                  placeholder="Nhập ngày sinh"
                  format={"DD/MM/YYYY"}
                  suffixIcon={
                    <div
                      style={{
                        display: "flex",
                        width: "100px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <CalendarOutlined />
                      <span style={{ color: "#2a2a86", fontWeight: 500, marginLeft: 10 }}>
                        {customer?.birthday &&
                          `${moment().diff(
                            ConvertUtcToLocalDate(customer?.birthday, "MM/DD/YYYY"),
                            "years"
                          )} Tuổi`}
                      </span>
                    </div>
                  }
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <div className="phone-container">
                <div className="ant-col ant-form-item-label">
                  <span className="customer-field-label">SĐT: <span style={{ color: "#E24343" }}>*</span></span>
                </div>
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
                    style={{ borderRadius: 5 }}
                    disabled={isDisable}
                    minLength={9}
                    maxLength={15}
                    placeholder="Nhập số điện thoại"
                    className="phone-input"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  disabled={isDisable}
                  className="p-0 ant-btn-custom"
                  icon={<img src={phonePlus} alt="" />}
                  onClick={showPhoneModal}
                  style={{ borderRadius: 3 }}
                />
              </div>
              {customerPhones && customerPhones.length > 0 && (
                <Row
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginBottom: 10,
                  }}
                >
                  <Col span={20}>
                    {customerPhones &&
                      customerPhones.map((p: any, index: any) => (
                        <Tag
                          key={index}
                          style={{ cursor: "pointer" }}
                          onClick={() => clickPhone(p)}
                        >
                          {p}
                          <img
                            alt="delete"
                            onClick={(e: any) => {
                              e.stopPropagation();
                              showConfirmDeletePhone(p);
                            }}
                            style={{ width: 16, marginBottom: 2 }}
                            src={XCloseBtn}
                          />
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
                  <Input
                    disabled={isDisable}
                    maxLength={255}
                    type="text"
                    placeholder="Nhập email"
                  />
                </Form.Item>
                <Col span={24}>
                  <Form.Item name="card_number"
                    label={<span className="customer-field-label">Thẻ KH:</span>}>
                    <Input
                      placeholder="Nhập mã thẻ"
                      prefix={<BarcodeOutlined style={{ color: "#71767B" }} />}
                    />
                  </Form.Item>
                </Col>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="gender"
                  label={<span className="customer-field-label">Giới tính:</span>}
                // rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
                >
                  <Select placeholder="Chọn giới tính" disabled={isDisable}>
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
                  label={<span className="customer-field-label">Website/Facebook:</span>}
                  rules={[
                    {
                      pattern: RegUtil.WEBSITE_URL_2,
                      message: "Website/Facebook chưa đúng định dạng",
                    },
                  ]}
                >
                  <Input
                    disabled={isDisable}
                    maxLength={255}
                    placeholder="Nhập Website/facebook"
                  />
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
                    disabled={isDisable}
                    placeholder="Chọn ngày cưới"
                    format={"DD/MM/YYYY"}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  hidden
                  name="company"
                  label={<span className="customer-field-label">Tên đơn vị:</span>}
                >
                  <Input
                    disabled={isDisable}
                    maxLength={255}
                    placeholder="Nhập tên đơn vị"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  hidden
                  label={<span className="customer-field-label">Mã số thuế:</span>}
                  name="tax_code"
                  rules={[
                    {
                      pattern: RegUtil.NUMBERREG,
                      message: "Mã số thuế chỉ được phép nhập số",
                    },
                  ]}
                >
                  <Input disabled={isDisable} maxLength={255} placeholder="Mã số thuế" />
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
                    {countries &&
                      countries.map((country: any) => (
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
                    disabled={isDisable}
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
                <Input disabled={isDisable} />
              </Form.Item>
              <Col span={24}>
                <Form.Item
                  label={<span className="customer-field-label">Phường/ Xã:</span>}
                  name="ward_id"
                >
                  <Select
                    showSearch
                    disabled={isDisable}
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
                  isDisable={isDisable}
                  label={<span className="customer-field-label">Địa chỉ chi tiết:</span>}
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
                  />
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
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={24} hidden={!customer}>
          <Card>
            <Row
              gutter={12}
              style={{
                padding: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Col span={24}>
                <Form.Item label={<b>Ghi chú:</b>} name="note">
                  <Input.TextArea
                    disabled={isDisable}
                    maxLength={500}
                    placeholder="Viết ghi chú"
                    onPressEnter={(e) => addNote(e)}
                  />
                </Form.Item>
              </Col>
              <Col
                style={{
                  width: "70%",
                  paddingLeft: 0,
                  maxHeight: 150,
                  overflowY: "scroll",
                }}
              >
                <div>
                  {notes &&
                    notes.map((note: any, index: number) => (
                      <div className="customer-note-item" key={index}>
                        <span key={note.id}>{note.content}</span>
                        {!isDisable && (
                          <img
                            alt="delete"
                            onClick={() => deleteNote(note)}
                            style={{
                              width: 20,
                              float: "right",
                              cursor: "pointer",
                              marginLeft: 4,
                            }}
                            src={XCloseBtn}
                          />
                        )}
                      </div>
                    ))}
                </div>
              </Col>
            </Row>
            <Row hidden gutter={12} style={{ padding: "16px" }}>
              <Col span={24}>
                <Form.Item
                  name="customer_type_id"
                  label={<span className="customer-field-label">Loại khách hàng:</span>}
                >
                  <Select
                    disabled={isDisable}
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
                  label={<span className="customer-field-label">Nhóm khách hàng:</span>}
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
                    <span className="customer-field-label">Nhân viên phụ trách:</span>
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
      <AddPhoneModal
        visible={visiblePhoneModal}
        customerPhone={customerPhone}
        addFpPhone={addFpPhone}
        deleteFpPhone={showConfirmDeletePhone}
        setFpDefaultPhone={setFpDefaultPhone}
        customerPhones={customerPhones}
        onOk={hidePhoneModal}
        onCancel={hidePhoneModal}
      />

      <ModalDeleteConfirm
        width="400px"
        visible={visibleDeletePhoneModal}
        onOk={() => doDeletePhone()}
        onCancel={() => setVisibleDeletePhoneModal(false)}
        title="Thông báo"
        subTitle="Bạn có chắc chắn muốn xóa số điện thoại này"
      />
    </Fragment>
  );
};

export default GeneralInformation;
