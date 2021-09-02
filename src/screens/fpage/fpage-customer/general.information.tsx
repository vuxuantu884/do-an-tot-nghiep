import {
  Input,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Card,
  Space,
  Switch,
} from "antd";
import { RegUtil } from "utils/RegUtils";
import "./customer.scss";
import CustomInput from "./customInput";

const { Option } = Select;

const GeneralInformation = (props: any) => {
  const {
    form,
    status,
    setStatus,
    areas,
    countries,
    wards,
    handleChangeArea,
    isEdit,
    AccountChangeSearch,
  } = props;

  return (
    <Row gutter={24}>
      <Col span={24}>
        <Card
          title={
            <div className="d-flex">
              <span className="title-card">THÔNG TIN CHUNG</span>
            </div>
          }
          extra={[
            <Space key="status" size={15} style={{ marginRight: "10px" }}>
              {isEdit && (
                <>
                  <label className="text-default">Trạng thái</label>
                  <Switch
                    className="ant-switch-success"
                    checked={status === "active"}
                    onChange={(checked) => {
                      setStatus(checked ? "active" : "inactive");
                    }}
                  />
                  <label
                    className={
                      status === "active" ? "text-success" : "text-error"
                    }
                  >
                    {status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                  </label>
                </>
              )}
            </Space>,
          ]}
        >
          <Row gutter={30} style={{ padding: "16px 30px" }}>
            <Col span={24}>
              <CustomInput
                name="full_name"
                label={
                  <span className="customer-field-label">
                   Tên khách hàng:
                  </span>
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
                name="phone"
                label={<span className="customer-field-label">
                Số điện thoại:
              </span>}
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
              <Row gutter={30}>
                <Col span={24}>
                  <Form.Item
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
                      maxLength={255}
                      placeholder="Nhập Website/facebook"
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="wedding_date" label={<span className="customer-field-label">Ngày cưới:</span>}>
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày cưới"
                      format={"DD/MM/YYYY"}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item name="company" label={<span className="customer-field-label">Tên đơn vị:</span>}>
                    <Input maxLength={255} placeholder="Nhập tên đơn vị" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    label={<span className="customer-field-label">Mã số thuế:</span>}
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
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Vui lòng chọn khu vực",
                    //   },
                    // ]}
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
                    label={<span className="customer-field-label">Phường/ Xã:</span>}
                    name="ward_id"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Vui lòng chọn xã/phường",
                    //   },
                    // ]}
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
                  {/* <Form.Item
                    label={<b>Địa chỉ chi tiết:</b>}
                    name="full_address"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Vui lòng nhập địa chỉ",
                    //   },
                    // ]}
                  >
                    <Input
                      maxLength={500}
                      placeholder="Nhập địa chỉ chi tiết"
                    />
                  </Form.Item> */}
                  <CustomInput
                    name="full_address"
                    label={<span className="customer-field-label">Địa chỉ chi tiết:</span>}
                    form={form}
                    message="Vui lòng nhập địa chỉ"
                    placeholder="Nhập địa chỉ chi tiết"
                    maxLength={500}
                    isRequired={false}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={24}>
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
                label={<span className="customer-field-label">Loại khách hàng:</span>}
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
                label={<span className="customer-field-label">Nhân viên phụ trách:</span>}

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
              <Form.Item label={<span className="customer-field-label">Mô tả:</span>} name="description">
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
