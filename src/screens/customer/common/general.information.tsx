import { createRef, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
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
  AutoComplete,
} from "antd";
import { RefSelectProps } from "antd/lib/select";
import { RegUtil } from "utils/RegUtils";
import CustomInput from "./customInput";
import "moment/locale/vi";
import { LoyaltyCardSearch } from "domain/actions/loyalty/card/loyalty-card.action";
import { SearchOutlined } from "@ant-design/icons";

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

  const dispatch = useDispatch();
  
  const autoCompleteRef = createRef<RefSelectProps>();
  
  const [keySearchCard, setKeySearchCard] = useState("");
  const [isInputSearchCardFocus, setIsInputSearchCardFocus] = useState(false);

  const [resultSearchVariant, setResultSearchVariant] = useState<any>(
    {
      metadata: {
        limit: 0,
        page: 1,
        total: 0,
      },
      items: [],
    }
  );
  
  const customerCardParams = {
    status: "ACTIVE",
    card_number: "",
  }


  const onSelectCard = (cardSelected: any) => {
    setIsInputSearchCardFocus(false);
    autoCompleteRef.current?.blur();
  };

  const updateLoyaltyCard = (result: any) => {
    setResultSearchVariant(result);
  };

  const onChangeCardSearch = (value: string) => {
    setKeySearchCard(value);
    if (value && Number(value) && value.length >= 3) {
      customerCardParams.card_number = value;
      dispatch(LoyaltyCardSearch(customerCardParams, updateLoyaltyCard));
    }
  };

  const convertResultSearchCard = useMemo(() => {
    let options: any[] = [];
    resultSearchVariant.items.forEach(
      (item: any, index: number) => {
        options.push({
          label: item.card_number,
          value: item.card_number,
        });
      }
    );
    return options;
  }, [resultSearchVariant]);

  const onInputSearchCardFocus = () => {
    setIsInputSearchCardFocus(true);
  };

  const onInputSearchCardBlur = () => {
    setIsInputSearchCardFocus(false);
  };

  const getNotFoundContent = () => {
    let content = undefined;
    if (Number(keySearchCard) && keySearchCard.length >= 3) {
      content = "Không tìm thấy thẻ khách hàng";
    }
    return content;
  };

  const handleDateChange = (e: any) => {};
  return (
    <Row gutter={24}>
      <Col span={18}>
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
            <Col span={12}>
              <CustomInput
                name="full_name"
                label={<b>Họ tên khách hàng:</b>}
                form={form}
                message="Vui lòng nhập họ tên khách hàng"
                placeholder="Nhập họ và tên khách hàng"
                isRequired={true}
                maxLength={255}
              />
            </Col>
            <Col span={12}>
              <Form.Item
                label={<b>Thẻ khách hàng:</b>}
                name="card_number"
              >
                <AutoComplete
                  notFoundContent={getNotFoundContent()}
                  id="search_card"
                  value={keySearchCard}
                  ref={autoCompleteRef}
                  onSelect={onSelectCard}
                  dropdownClassName="search-layout dropdown-search-header"
                  dropdownMatchSelectWidth={360}
                  onSearch={onChangeCardSearch}
                  options={convertResultSearchCard}
                  maxLength={255}
                  open={isInputSearchCardFocus}
                  onFocus={onInputSearchCardFocus}
                  onBlur={onInputSearchCardBlur}
                  dropdownRender={(menu) => <div style={{padding: 10}}>{menu}</div>}
                >
                  <Input
                    maxLength={255}
                    placeholder="Nhập thẻ khách hàng"
                    prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
                    allowClear
                  />
                </AutoComplete>
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
                  {
                    pattern: RegUtil.EMAIL_NO_SPECIAL_CHAR,
                    message: "Vui lòng nhập đúng định dạng email",
                  },
                ]}
              >
                <Input maxLength={255} type="text" placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label={<b>Giới tính:</b>}
                // rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value={"male"}>Nam</Option>
                  <Option value={"female"}>Nữ</Option>
                  <Option value={"other"}>Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="birthday"
                label={<b>Ngày sinh:</b>}
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
                <Col span={12}>
                  <Form.Item
                    name="website"
                    label={<b>Facebook:</b>}
                    rules={[
                      {
                        pattern: RegUtil.WEBSITE_URL_2,
                        message: "Facebook chưa đúng định dạng",
                      },
                    ]}
                  >
                    <Input maxLength={255} placeholder="Nhập Facebook" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="wedding_date" label={<b>Ngày cưới:</b>}>
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày cưới"
                      format={"DD/MM/YYYY"}
                      onChange={handleDateChange}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item name="company" label={<b>Tên đơn vị:</b>}>
                    <Input maxLength={255} placeholder="Nhập tên đơn vị" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<b>Mã số thuế:</b>}
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
                <Col span={12}>
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
                      {countries.map((country: any) => (
                        <Option key={country.id} value={country.id}>
                          {country.name + ` - ${country.code}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<b>Khu vực:</b>}
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
                <Col span={12}>
                  <Form.Item
                    label={<b>Phường/ Xã:</b>}
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
                <Col span={12}>
                  <CustomInput
                    name="full_address"
                    label={<b>Địa chỉ chi tiết:</b>}
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

