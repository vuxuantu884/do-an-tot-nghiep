import {
  Card,
  Col,
  DatePicker,
  Form,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  TimePicker,
} from "antd";
import {DiscountFormModel, DiscountMethod} from "model/promotion/discount.create.model";
import moment from "moment";
import React, {useEffect, useMemo, useState} from "react";
import CustomerFilter from "screens/promotion/shared/cusomer-condition.form";
import {DATE_FORMAT} from "../../../../utils/DateUtils";
import CustomInput from "../../../customer/common/customInput";
import "../discount.scss";
import FixedPriceSelection from "./FixedPriceSelection";

const TimeRangePicker = TimePicker.RangePicker;
const Option = Select.Option;

const priorityOptions = [
  {
    value: 1,
    label: "Số 1 (cao nhất)",
  },
  {
    value: 2,
    label: "Số 2",
  },
  {
    value: 3,
    label: "Số 3",
  },
  {
    value: 4,
    label: "Số 4",
  },
  {
    value: 5,
    label: "Số 5",
  },
  {
    value: 6,
    label: "Số 6",
  },
  {
    value: 7,
    label: "Số 7",
  },
  {
    value: 8,
    label: "Số 8",
  },
  {
    value: 9,
    label: "Số 9",
  },
];

const dayOfWeekOptions = [
  {
    value: "SUN",
    label: "Chủ nhật",
  },
  {
    value: "MON",
    label: "Thứ 2",
  },
  {
    value: "TUE",
    label: "Thứ 3",
  },
  {
    value: "WED",
    label: "Thứ 4",
  },
  {
    value: "THU",
    label: "Thứ 5",
  },
  {
    value: "FRI",
    label: "Thứ 6",
  },
  {
    value: "SAT",
    label: "Thứ 7",
  },
];
const GeneralInfo = (props: any) => {
  const {
    form,
    listStore,
    listSource,
    listChannel,
    // customerAdvanceMsg
  } = props;

  const [showTimeAdvance] = useState<boolean>(false);
  // const [showCustomerAdvance, setShowCustomerAdvance] = useState(false)
  const [allStore, setAllStore] = useState<boolean>(true);
  const [allChannel, setAllChannel] = useState<boolean>(true);
  const [allSource, setAllSource] = useState<boolean>(true);
  const [allCustomer] = useState<boolean>(false);
  const [unlimitedUsage, setUnlimitedUsage] = useState<boolean>(true);
  const [disabledEndDate, setDisabledEndDate] = useState<boolean>(false);
  const [discountMethod, setDiscountMethod] = useState<DiscountMethod>(
    DiscountMethod.FIXED_PRICE
  );

  useMemo(() => {
    form.setFieldsValue({
      customer_selection: allCustomer,
    });
  }, [allCustomer, form]);

  useEffect(() => {
    form.resetFields(["entitlements"]);
  }, [discountMethod, form]);

  const getDays = () => {
    let days = [];
    for (let i = 1; i <= 31; i++) {
      days.push({key: `${i}`, value: `Ngày ${i}`});
    }
    return days;
  };

  return (
    <Row gutter={24} className="general-info">
      <Col span={18}>
        <Card
          title={
            <div className="d-flex">
              <span className="title-card">THÔNG TIN CHUNG</span>
            </div>
          }
        >
          <Row gutter={30} style={{padding: "16px 16px"}}>
            <Col span={12}>
              <CustomInput
                name="title"
                label={<b>Tên khuyến mại: </b>}
                form={form}
                message="Cần nhập tên khuyến mại"
                placeholder="Nhập tên khuyến mại"
                isRequired={true}
                maxLength={255}
              />
            </Col>
            <Col span={12}>
              <CustomInput
                name="discount_code"
                label={<b>Mã khuyến mại: </b>}
                form={form}
                placeholder="Nhập mã khuyến mại"
                maxLength={20}
                upperCase={true}
                disabled={true}
                restFormItem={{
                  rules: [
                    // { required: true, message: 'Vui lòng nhập mã khuyến mại' },
                    {pattern: /^DI([0-9])+$/, message: "Mã khuyến mại sai định dạng"},
                  ],
                }}
              />
            </Col>
            <Col span={12}>
              <Row gutter={30}>
                <Col span={12}>
                  <Form.Item
                    label={<b>Số lượng áp dụng:</b>}
                    name="usage_limit"
                    rules={[
                      {
                        required: !unlimitedUsage,
                        message: "Vui lòng nhập số lượng áp dụng",
                      },
                    ]}
                  >
                    <InputNumber
                      disabled={unlimitedUsage}
                      style={{borderRadius: "5px"}}
                      placeholder="Nhập số lượng khuyến mại"
                      min={0}
                      maxLength={6}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label=" " name="usage_limit">
                    <Space>
                      <Switch
                        defaultChecked={unlimitedUsage}
                        onChange={(value) => {
                          form.validateFields(["usage_limit"]);
                          form.setFieldsValue({
                            usage_limit: null,
                          });
                          setUnlimitedUsage(value);
                        }}
                      />
                      {"Không giới hạn"}
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={30}>
                <Col span={24}>
                  <Form.Item label={<b>Mức độ ưu tiên:</b>} name="priority">
                    <Select placeholder="Chọn mức độ ưu tiên">
                      {priorityOptions.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.label}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <CustomInput
                type="textarea"
                name="description"
                label={<b>Mô tả: </b>}
                form={form}
                placeholder="Nhập mô tả cho khuyến mại"
                maxLength={500}
              />
            </Col>
          </Row>
        </Card>
        <Card>
          <Row gutter={30} style={{padding: "16px 16px"}}>
            <Col span={24}>
              <Form.Item name="entitled_method" label={<b>Phương thức chiết khấu</b>}>
                <Select
                  defaultValue={DiscountMethod.FIXED_PRICE}
                  onChange={(value) => {
                    setDiscountMethod(value);
                    if (value === DiscountMethod.FIXED_PRICE) {
                      const formData = form.getFieldsValue(true);
                      formData.entitlements.forEach((item: DiscountFormModel) => {
                        item["prerequisite_quantity_ranges.value_type"] = "FIXED_AMOUNT";
                      });
                    }
                  }}
                >
                  <Option value={DiscountMethod.FIXED_PRICE}>Đồng giá</Option>
                  <Option value={DiscountMethod.QUANTITY}>
                    Chiết khấu theo từng sản phẩm
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            {/* Phương thức chiết khấu */}
            <FixedPriceSelection form={form} discountMethod={discountMethod} />
          </Row>
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Row gutter={6} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <div className="ant-col ant-form-item-label" style={{width: "100%"}}>
                <label
                  htmlFor="discount_add_starts_date"
                  className="ant-form-item-required"
                >
                  <b>Thời gian áp dụng:</b>
                </label>
              </div>
            </Col>

            <Col span={12}>
              <Form.Item
                name="starts_date"
                rules={[{required: true, message: "Vui lòng chọn thời gian áp dụng"}]}
              >
                <DatePicker
                  style={{width: "100%"}}
                  placeholder="Từ ngày"
                  showTime={{format: "HH:mm"}}
                  format={DATE_FORMAT.DDMMYY_HHmm}
                  disabledDate={(currentDate) =>
                    currentDate.isBefore(moment()) ||
                    (form.getFieldValue("ends_date")
                      ? currentDate.valueOf() > form.getFieldValue("ends_date")
                      : false)
                  }
                  showNow={true}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ends_date">
                <DatePicker
                  disabled={disabledEndDate}
                  showTime={{format: "HH:mm"}}
                  format={DATE_FORMAT.DDMMYY_HHmm}
                  style={{width: "100%"}}
                  placeholder="Đến ngày"
                  disabledDate={(currentDate) =>
                    currentDate.isBefore(moment()) ||
                    (form.getFieldValue("starts_date") &&
                      currentDate.isBefore(moment(form.getFieldValue("starts_date"))))
                  }
                  showNow={false}
                />
              </Form.Item>
            </Col>
            <Space direction="horizontal">
              <Switch
                onChange={(value) => {
                  if (value) {
                    form.resetFields(["ends_date"]);
                  }
                  setDisabledEndDate(value);
                }}
              />
              {"Không cần ngày kết thúc"}
            </Space>
            {/* <Divider />
            <Space direction="horizontal">
              <Checkbox
                defaultChecked={false}
                // onChange={(value) => setShowTimeAdvance(value.target.checked)}
                style={{paddingBottom: "20px"}}
              >
                Hiển thị nâng cao
              </Checkbox>
            </Space> */}
          </Row>
          {showTimeAdvance ? (
            <Row gutter={12} style={{padding: "0px 16px"}}>
              <Col span={24}>
                <Form.Item
                  label={<b>Chỉ áp dụng trong các khung giờ:</b>}
                  name="prerequisite_time"
                >
                  <TimeRangePicker placeholder={["Từ", "Đến"]} style={{width: "100%"}} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={<b>Chỉ áp dụng các ngày trong tuần:</b>}
                  name="prerequisite_weekdays"
                >
                  <Select placeholder="Chọn ngày" mode="multiple">
                    {dayOfWeekOptions.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label={<b>Chỉ áp dụng các ngày trong tháng:</b>}
                  name="prerequisite_days"
                  style={{marginBottom: "5px"}}
                >
                  <Select placeholder="Chọn ngày" mode="multiple">
                    {getDays().map((day) => (
                      <Option value={day.key}>{day.value}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          ) : null}
        </Card>
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_store_ids"
                label={<b>Cửa hàng áp dụng:</b>}
                rules={[{required: !allStore, message: "Vui lòng chọn cửa hàng áp dụng"}]}
              >
                <Select
                  disabled={allStore}
                  placeholder="Chọn chi nhánh"
                  mode="multiple"
                  className="ant-select-selector-min-height"
                  optionFilterProp="children"
                >
                  {listStore?.map((store: any) => (
                    <Option value={store.id}>{store.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch
                  defaultChecked={allStore}
                  onChange={(value) => {
                    form.setFieldsValue({
                      prerequisite_store_ids: undefined,
                    });
                    form.validateFields(["prerequisite_store_ids"]);
                    setAllStore(value);
                  }}
                />
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_sales_channel_names"
                label={<b>Kênh bán hàng áp dụng:</b>}
                rules={[
                  {required: !allChannel, message: "Vui lòng chọn kênh bán hàng áp dụng"},
                ]}
              >
                <Select
                  disabled={allChannel}
                  placeholder="Chọn kênh bán hàng"
                  mode="multiple"
                  className="ant-select-selector-min-height"
                >
                  {listChannel?.map((channel: any) => (
                    <Option value={channel.name}>{channel.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch
                  defaultChecked={allChannel}
                  onChange={(value) => {
                    form.setFieldsValue({
                      prerequisite_sales_channel_names: undefined,
                    });
                    form.validateFields(["prerequisite_sales_channel_names"]);
                    setAllChannel(value);
                  }}
                />
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_order_source_ids"
                label={<b>Nguồn đơn hàng áp dụng:</b>}
                rules={[
                  {required: !allSource, message: "Vui lòng chọn nguồn bán hàng áp dụng"},
                ]}
              >
                <Select
                  disabled={allSource}
                  placeholder="Chọn nguồn đơn hàng"
                  mode="multiple"
                  className="ant-select-selector-min-height"
                >
                  {listSource?.map((source: any) => (
                    <Option value={source.id}>{source.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch
                  defaultChecked={allSource}
                  onChange={(value) => {
                    form.validateFields(["prerequisite_order_source_ids"]);
                    form.setFieldsValue({
                      prerequisite_order_source_ids: undefined,
                    });
                    setAllSource(value);
                  }}
                />
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
        {/* Đối tượng khách hàng áp dụng */}
        <CustomerFilter form={form} />
      </Col>
    </Row>
  );
};

export default GeneralInfo;
