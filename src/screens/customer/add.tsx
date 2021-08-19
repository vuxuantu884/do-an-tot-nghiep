import {
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Card,
  InputNumber,
} from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  CreateCustomer,
  CustomerGroups,
  CustomerLevels,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import { WardResponse } from "model/content/ward.model";
import { CustomerModel } from "model/request/customer.request";
import arrowLeft from "../../assets/icon/arrow-left.svg";
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
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/UrlConfig";

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
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [countryId, setCountryId] = React.useState<number>(233);
  const [districtId, setDistrictId] = React.useState<any>(null);

  const statuses = [
    { name: "Hoạt động", key: "1", value: "active" },
    { name: "Không hoạt động", key: "2", value: "inactive" },
  ];

  React.useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);

  const handleChangeArea = (districtId: string) => {
    setDistrictId(districtId);
  };
  React.useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);

  React.useEffect(() => {
    dispatch(CustomerGroups(setGroups));
    dispatch(CountryGetAllAction(setCountries));
    dispatch(CustomerTypes(setTypes));
    dispatch(CustomerLevels(setLevels));
  }, [dispatch]);
  React.useEffect(() => {
    customerForm.setFieldsValue(new CustomerModel());
  }, [customerForm]);
  const setResult = React.useCallback(
    (result) => {
      if (result) {
        showSuccess("Thêm khách hàng thành công");
        history.goBack();
      }
    },
    [history]
  );
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
      billing_addresses: values.billing_addresses.map((b: any) => {
        return { ...b, is_default: b.default };
      }),
      shipping_addresses: values.shipping_addresses.map((b: any) => {
        return { ...b, is_default: b.default };
      }),
    };
    dispatch(CreateCustomer({ ...new CustomerModel(), ...piece }, setResult));
  };
  const handleSubmitFail = (errorInfo: any) => {
    console.error("Failed:", errorInfo);
  };
  return (
    <ContentContainer
      title="Thêm khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `/customer`,
        },
        {
          name: "Thêm khách hàng",
        },
      ]}
    >
      <Form
        form={customerForm}
        name="customer_add"
        onFinish={handleSubmit}
        onFinishFailed={handleSubmitFail}
        layout="vertical"
      >
        <Row gutter={24}>
          <Col span={18}>
            <Card
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN KHÁCH HÀNG</span>
                </div>
              }
            >
              <Row gutter={30} style={{ padding: "16px 30px" }}>
                <Col span={24}>
                  <Form.Item
                    name="full_name"
                    label={<b>Tên khách hàng:</b>}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên khách hàng",
                      },
                    ]}
                  >
                    <Input maxLength={255} placeholder="Nhập tên khách hàng" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label={<b>Số điện thoại:</b>}
                    rules={[
                      {
                        type: "number",
                        min: 0,
                        max: 999999999999999,
                        message: "Không đúng định dạng số điện thoại",
                      },
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ borderRadius: 5, width: "100%" }}
                      minLength={9}
                      maxLength={15}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label={<b>Email:</b>}
                    rules={[
                      { required: true, message: "Vui lòng nhập thư điện tử" },
                    ]}
                  >
                    <Input maxLength={255} type="email" placeholder="Nhập thư điện tử" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="gender"
                    label={<b>Giới tính:</b>}
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
                <Col span={12}>
                  <Form.Item
                    name="birthday"
                    label={<b>Ngày sinh:</b>}
                    rules={[
                      { required: true, message: "Vui lòng nhập ngày sinh" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="dd/mm/yyy"
                      format={"DD-MM-YYYY"}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Row gutter={30}>
                    <Col span={12}>
                      <Form.Item name="facebook_link" label={<b>Facebook:</b>}>
                        <Input maxLength={255} placeholder="Nhập link facebook" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="wedding_date" label={<b>Ngày cưới:</b>}>
                        <DatePicker
                          style={{ width: "100%" }}
                          placeholder="dd/mm/yyyy"
                          format={"DD-MM-YYYY"}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="company_id" label={<b>Tên đơn vị:</b>}>
                      <Input maxLength={255} placeholder="Nhập tên đơn vị" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={<b>Quốc gia:</b>}
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
                          {countries.map((country) => (
                            <Option key={country.id} value={country.id}>
                              {country.name + ` - ${country.code}`}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={<b>Thành phố/Quận - Huyện:</b>}
                        name="district_id"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn khu vực",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          placeholder="Khu vực"
                          onChange={handleChangeArea}
                          allowClear
                          optionFilterProp="children"
                        >
                          {areas.map((area) => (
                            <Option key={area.id} value={area.id}>
                              {area.city_name + ` - ${area.name}`}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label={<b>Phường/ Xã:</b>}
                        name="ward_id"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn xã/phường",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          allowClear
                          optionFilterProp="children"
                          placeholder="Xã/Phường"
                          // onChange={handleChangeWard}
                        >
                          {wards.map((ward) => (
                            <Option key={ward.id} value={ward.id}>
                              {ward.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label={<b>Địa chỉ chi tiết:</b>}
                        name="full_address"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập địa chỉ",
                          },
                        ]}
                      >
                        <Input maxLength={255} placeholder="Địa chỉ" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
                {/* <Col span={4}>
                  <Form.Item name="status" label="Trạng thái">
                    <Select placeholder="Trạng thái" disabled>
                      {statuses.map((status) => (
                        <Option key={status.key} value={status.value}>
                          {status.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Row gutter={12}>
                    <Col span={8}>
                      <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Mô tả" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col> */}
              </Row>
            </Card>
            <RenderCardContact
              component={ContactForm}
              title="THÔNG TIN LIÊN HỆ"
              name="contacts"
              isEdit={false}
              form={customerForm}
            />
          </Col>
          <Col span={6}>
            <Card
              title={
                <div className="d-flex">
                  <span className="title-card">THÔNG TIN KHÁC</span>
                </div>
              }
            >
              <Row gutter={12} style={{ padding: "16px" }}>
                <Col span={24}>
                  <Form.Item
                    name="customer_type_id"
                        label={<b>Loại khách hàng:</b>}
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Vui lòng chọn loại khách hàng",
                    //   },
                    // ]}
                  >
                    <Select
                      showSearch
                      placeholder="Phân loại khách hàng"
                      allowClear
                      optionFilterProp="children"
                    >
                      {types.map((type) => (
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
                    label={<b>Nhóm khách hàng:</b>}
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Vui lòng chọn nhóm khách hàng",
                    //   },
                    // ]}
                  >
                    <Select
                      showSearch
                      placeholder="Phân loại nhóm khách hàng"
                      allowClear
                      optionFilterProp="children"
                    >
                      {groups.map((group) => (
                        <Option key={group.id} value={group.id}>
                          {group.name + ` - ${group.code}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {/* <Col span={24}>
                  <Form.Item
                    name="customer_level_id"
                    label={<b>Cấp độ khách hàng:</b>}

                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Vui lòng chọn cấp độ khách hàng",
                    //   },
                    // ]}
                  >
                    <Select
                      showSearch
                      placeholder="Phân loại cấp độ khách hàng"
                      allowClear
                      optionFilterProp="children"
                    >
                      {levels.map((level) => (
                        <Option key={level.id} value={level.id}>
                          {level.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col> */}
                <Col span={24}>
                  <Form.Item
                    name="responsible_staff_code"
                    label={<b>Nhân viên phụ trách:</b>}
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
                    >
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
        </Row>
        <Row>
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
            <RenderCardNote component={NoteForm} title="GHI CHÚ" name="notes" />
          </Col>
        </Row>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: ".75rem",
            marginLeft: -30,
            height: 55,
            width: "100%",
            boxShadow: "0px -1px 8px rgba(0, 0, 0, 0.1)",
            alignItems: "center",
            padding: "0 32px",
            position: "fixed",
            bottom: "0px",
            backgroundColor: "white",
            zIndex: 99,
            paddingRight: 280,
          }}
        >
          <div onClick={() => history.goBack()} style={{ cursor: "pointer" }}>
            <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
            Quay lại danh sách khách hàng
          </div>
          <div>
            <Button
              onClick={() => history.goBack()}
              style={{ marginLeft: ".75rem", marginRight: ".75rem" }}
              type="ghost"
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu khách hàng
            </Button>
          </div>
        </div>
      </Form>
    </ContentContainer>
  );
};

export default CustomerAdd;
