import {
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Card,
  InputNumber,
  Space,
  Switch,
  Collapse,
} from "antd";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  DistrictGetByCountryAction,
  WardGetByDistrictAction,
} from "domain/actions/content/content.action";
import {
  CustomerGroups,
  CustomerLevels,
  CustomerTypes,
} from "domain/actions/customer/customer.action";
import { CountryResponse } from "model/content/country.model";
import { WardResponse } from "model/content/ward.model";
import { CustomerModel } from "model/request/customer.request";
import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { RegUtil } from "utils/RegUtils";
import ContactForm from "./contact";
import "./customer.scss";
import RenderCardContact from "./render/card.contact";

const { Option } = Select;
const { Panel } = Collapse;

const GeneralInformation = (props: any) => {
  const { form } = props;
  const history = useHistory();
  const dispatch = useDispatch();
  const [companies, setCompanies] = React.useState<Array<any>>([]);
  const [levels, setLevels] = React.useState<Array<any>>([]);
  const [countries, setCountries] = React.useState<Array<CountryResponse>>([]);
  const [areas, setAreas] = React.useState<Array<any>>([]);
  const [wards, setWards] = React.useState<Array<WardResponse>>([]);
  const [countryId, setCountryId] = React.useState<number>(233);
  const [districtId, setDistrictId] = React.useState<any>(null);
  const [status, setStatus] = React.useState<string>("active");

  const statuses = [
    { name: "Hoạt động", key: "1", value: "active" },
    { name: "Không hoạt động", key: "2", value: "inactive" },
  ];

  React.useEffect(() => {
    dispatch(DistrictGetByCountryAction(countryId, setAreas));
  }, [dispatch, countryId]);
  const handleChangeArea = (districtId: string) => {
    if (districtId) {
      setDistrictId(districtId);
      let area = areas.find((area) => area.id === districtId);
      let value = form?.getFieldValue();
      value.city_id = area.city_id;
      value.city = area.city_name;
      value.district_id = districtId;
      value.district = area.name;
      value.ward_id = null;
      value.ward = "";
      form?.setFieldsValue({ name: value });
    }
  };
  React.useEffect(() => {
    if (districtId) {
      dispatch(WardGetByDistrictAction(districtId, setWards));
    }
  }, [dispatch, districtId]);
  React.useEffect(() => {
    dispatch(CountryGetAllAction(setCountries));
    dispatch(CustomerLevels(setLevels));
  }, [dispatch]);
  return (
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
            <Col span={12}>
              <Form.Item
                name="email"
                label={<b>Email:</b>}
                rules={[
                  { required: true, message: "Vui lòng nhập thư điện tử" },
                ]}
              >
                <Input
                  maxLength={255}
                  type="email"
                  placeholder="Nhập thư điện tử"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<b>Giới tính:</b>}
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
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
                rules={[{ required: true, message: "Vui lòng nhập ngày sinh" }]}
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
                <Col span={12}>
                  <Form.Item name="status" label={<b>Trạng thái:</b>}>
                    <Select placeholder="Trạng thái">
                      {statuses.map((status) => (
                        <Option key={status.key} value={status.value}>
                          {status.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={<b>Mã số thuế:</b>} name="tax_code">
                    <Input maxLength={255} placeholder="Mã số thuế" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="company" label={<b>Tên đơn vị:</b>}>
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
            {/* 
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
                  {props.groups &&
                    props.groups.map((group: any) => (
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
                  {props.accounts &&
                    props.accounts.map((c: any) => (
                      <Option key={c.id} value={c.code}>
                        {c.full_name + " - " + c.code}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label={<b>Mô tả:</b>} name="description">
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
