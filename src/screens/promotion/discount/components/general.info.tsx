import {
  Card, Col, Row, InputNumber,
  Form, Switch, Space, Select,
  DatePicker, Divider, Checkbox,
  TimePicker
} from "antd";
import "../discount.scss"
import moment from 'moment';
import CustomInput from "../../../customer/common/customInput";
import React, {useEffect, useMemo, useState} from "react";
import FixedPriceSelection from "./FixedPriceSelection";

const TimeRangePicker = TimePicker.RangePicker;
const Option = Select.Option


const GeneralInfo = (props: any) => {
  const {
    form,
    listStore,
    listSource,
    listChannel
    // customerAdvanceMsg
  } = props;

  const [showTimeAdvance] = useState(false)
  // const [showCustomerAdvance, setShowCustomerAdvance] = useState(false)
  const [allStore, setAllStore] = useState(false)
  const [allChannel, setAllChannel] = useState(false)
  const [allSource, setAllSource] = useState(false)
  const [allCustomer] = useState(false)
  const [unlimitedUsage, setUnlimitedUsage] = useState(false)
  const [disabledEndDate, setDisabledEndDate] = useState(true)
  const [discountMethod, setDiscountMethod] = useState('FIXED_PRICE')

  useMemo(() => {
    form.setFieldsValue({
      customer_selection: allCustomer
    })
  }, [allCustomer, form])

  useEffect(() => {
    form.resetFields(['entitlements'])
  }, [discountMethod, form])

  const getDays = () => {
    let days = [];
    for (let i = 1; i <= 31; i++) {
      days.push({key: `${i}`, value: `Ngày ${i}`})
    }
    return days;
  }

  const renderSelection = () => {
    return <FixedPriceSelection form={form} discountMethod={discountMethod}/>;
  }

  return (
    <Row gutter={24} className="general-info">
      <Col span={18}>
        <Card
          title={
            <div className="d-flex">
              <span className="title-card">
                THÔNG TIN CHUNG
              </span>
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
                    { pattern: /^DI([0-9])+$/, message: 'Mã khuyến mại sai định dạng' }
                  ]
                }}
              />
            </Col>
            <Col span={12}>
              <Row gutter={30}>
                <Col span={12}>
                  <Form.Item
                    label={<b>Số lượng áp dụng:</b>}
                    name="usage_limit"
                    rules={[{required: !unlimitedUsage, message: "Vui lòng nhập số lượng áp dụng"}]}
                  >
                    <InputNumber
                      disabled={unlimitedUsage}
                      style={{borderRadius: "5px"}}
                      placeholder="Nhập số lượng khuyến mại"
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label=" "
                    name="usage_limit"
                  >
                    <Space>
                      <Switch onChange={value => {
                        form.validateFields(['usage_limit'])
                        form.setFieldsValue({
                          usage_limit: null
                        });
                        setUnlimitedUsage(value);
                      }}/>
                      {"Không giới hạn"}
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={30}>
                <Col span={24}>
                  <Form.Item
                    label={<b>Mức độ ưu tiên:</b>}
                    name="priority"
                  >
                    <Select placeholder="Chọn mức độ ưu tiên" >
                      <Option value={1}>Số 1 (cao nhất)</Option>
                      <Option value={2}>Số 2</Option>
                      <Option value={3}>Số 3</Option>
                      <Option value={4}>Số 4</Option>
                      <Option value={5}>Số 5</Option>
                      <Option value={6}>Số 6</Option>
                      <Option value={7}>Số 7</Option>
                      <Option value={8}>Số 8</Option>
                      <Option value={9}>Số 9</Option>
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
              <Form.Item
                name="entitled_method"
                label={<b>Phương thức chiết khấu</b>}
              >
                <Select defaultValue={"FIXED_PRICE"} onChange={value => setDiscountMethod(value)}>
                  <Option value="FIXED_PRICE">Đồng giá</Option>
                  <Option value="QUANTITY">Chiết khấu theo từng sản phẩm</Option>
                </Select>
              </Form.Item>
            </Col>
            {renderSelection()}
          </Row>
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Row gutter={6} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <div className="ant-col ant-form-item-label" style={{width: '100%'}}>
                <label htmlFor="discount_add_starts_date" className="ant-form-item-required">
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
                  showNow
                  showTime={{ format: 'HH:mm' }}
                  onChange={(date, dateString) => {
                    !disabledEndDate && form.setFieldsValue({
                      ends_date: moment(date).add(30, 'd')
                    })
                  }}
                  disabledDate={(currentDate) => disabledEndDate && currentDate >= moment().subtract(1, "days")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ends_date">
                <DatePicker
                  disabled={disabledEndDate}
                  style={{width: "100%"}}
                  placeholder="Đến ngày"
                  showTime={{ format: 'HH:mm' }}
                  disabledDate={(currentDate) => currentDate.valueOf() < form.getFieldValue("starts_date")}
                />
              </Form.Item>
            </Col>
            <Space direction="horizontal">
              <Switch 
                defaultChecked={true}
                onChange={value => {
                  if (value) {
                    form.resetFields(["ends_date"]);
                  } else {
                    form.setFieldsValue({
                      ends_date: moment(form.getFieldValue("starts_date")).add(30, 'd')
                    })
                  }
                  setDisabledEndDate(value);
                }} 
              />
              {"Không cần ngày kết thúc"}
            </Space>
            <Divider/>
            <Space direction="horizontal">
              <Checkbox
                defaultChecked={false}
                // onChange={(value) => setShowTimeAdvance(value.target.checked)}
                style={{paddingBottom: "20px"}}
              >
                Hiển thị nâng cao
              </Checkbox>
            </Space>
          </Row>
          {showTimeAdvance ? <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                label={<b>Chỉ áp dụng trong các khung giờ:</b>}
                name="prerequisite_time"
              >
                <TimeRangePicker placeholder={["Từ", "Đến"]} style={{width: "100%"}}/>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label={<b>Chỉ áp dụng các ngày trong tuần:</b>}
                name="prerequisite_weekdays"
              >
                <Select placeholder="Chọn ngày" mode="multiple">
                  <Option value={"SUN"}>Chủ nhật</Option>
                  <Option value={"MON"}>Thứ 2</Option>
                  <Option value={"TUE"}>Thứ 3</Option>
                  <Option value={"WED"}>Thứ 4</Option>
                  <Option value={"THU"}>Thứ 5</Option>
                  <Option value={"FRI"}>Thứ 6</Option>
                  <Option value={"SAT"}>Thứ 7</Option>
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
                  {getDays().map(day => <Option value={day.key}>{day.value}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row> : null}
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
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {listStore?.map((store: any) => <Option value={store.id}>{store.name}</Option>)}
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  form.setFieldsValue({
                    prerequisite_store_ids: undefined
                  });
                  form.validateFields(['prerequisite_store_ids'])
                  setAllStore(value)
                }}/>
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
                rules={[{required: !allChannel, message: "Vui lòng chọn kênh bán hàng áp dụng"}]}
              >
                <Select
                  disabled={allChannel}
                  placeholder="Chọn kênh bán hàng"
                  mode="multiple"
                  className="ant-select-selector-min-height"
                >
                  {listChannel?.map((source: any) => <Option value={source.id}>{source.name}</Option>)}
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  form.setFieldsValue({
                    prerequisite_sales_channel_names: undefined
                  });
                  form.validateFields(['prerequisite_sales_channel_names'])
                  setAllChannel(value)
                }}/>
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
        <Card>
          <Row gutter={12} style={{padding: "0px 16px"}}>
            <Col span={24}>
              <Form.Item
                name="prerequisite_order_sources_ids"
                label={<b>Nguồn đơn hàng áp dụng:</b>}
                rules={[{required: !allSource, message: "Vui lòng chọn nguồn bán hàng áp dụng"}]}
              >
                <Select
                  disabled={allSource}
                  placeholder="Chọn nguồn đơn hàng"
                  mode="multiple"
                  className="ant-select-selector-min-height"
                >
                  {listSource?.map((source: any) => <Option value={source.id}>{source.name}</Option>)}
                </Select>
              </Form.Item>
              <Space direction="horizontal">
                <Switch onChange={value => {
                  form.validateFields(['prerequisite_order_sources_ids'])
                  form.setFieldsValue({
                    prerequisite_order_sources_ids: undefined
                  })
                  setAllSource(value)
                }}/>
                {"Áp dụng toàn bộ"}
              </Space>
            </Col>
          </Row>
        </Card>
        {/*<Card>*/}
        {/*  <Row gutter={12} style={{padding: "0px 16px"}}>*/}
        {/*    <Col span={24}>*/}
        {/*      <Form.Item*/}
        {/*        label={<b>Đối tượng khách hàng áp dụng:</b>}*/}
        {/*        name="customer_selection"*/}
        {/*      >*/}
        {/*        <Space direction="horizontal">*/}
        {/*          <Switch onChange={value => {*/}
        {/*            setAllCustomer(value)*/}
        {/*            if (!value) {*/}
        {/*              setShowCustomerAdvance(value)*/}
        {/*            }*/}
        {/*          }} defaultChecked={false}/>*/}
        {/*          {"Áp dụng toàn bộ khách hàng"}*/}
        {/*        </Space>*/}
        {/*      </Form.Item>*/}
        {/*    </Col>*/}
        {/*    <Col span={24}>*/}
        {/*      <Checkbox*/}
        {/*        disabled={allCustomer}*/}
        {/*        defaultChecked={false}*/}
        {/*        style={{paddingBottom: "30px"}}*/}
        {/*        onChange={value => setShowCustomerAdvance(value.target.checked)}*/}
        {/*        value={showCustomerAdvance}*/}
        {/*      >*/}
        {/*        Hiển thị tuỳ chọn*/}
        {/*      </Checkbox>*/}
        {/*    </Col>*/}
        {/*    {showCustomerAdvance && !allCustomer ? (*/}
        {/*      <div style={{width: "100%"}}>*/}
        {/*        <Col span={24}>*/}
        {/*          <Form.Item*/}
        {/*            name="prerequisite_genders"*/}
        {/*            label={"Giới tính:"}*/}
        {/*          >*/}
        {/*            <Select placeholder="Chọn giới tính" mode="multiple">*/}
        {/*              <Option value="MALE">Nam</Option>*/}
        {/*              <Option value="FEMALE">Nữ</Option>*/}
        {/*              <Option value="UNISEX">Unisex</Option>*/}
        {/*            </Select>*/}
        {/*          </Form.Item>*/}
        {/*        </Col>*/}
        {/*        <Col span={24}>*/}
        {/*          <Form.Item*/}
        {/*            name="prerequisite_customer_birthday"*/}
        {/*            label={"Ngày sinh:"}*/}
        {/*          >*/}
        {/*            <DateRangePicker placeholder={["Từ ngày", "Đến ngày"]} style={{width: "100%"}}/>*/}
        {/*          </Form.Item>*/}
        {/*        </Col>*/}
        {/*        <Col span={24}>*/}
        {/*          <Form.Item*/}
        {/*            name="prerequisite_customer_marriage_day"*/}
        {/*            label={"Ngày cưới:"}*/}
        {/*          >*/}
        {/*            <DateRangePicker placeholder={["Từ ngày", "Đến ngày"]} style={{width: "100%"}}/>*/}
        {/*          </Form.Item>*/}
        {/*        </Col>*/}
        {/*        <Col span={24}>*/}
        {/*          <Form.Item*/}
        {/*            name="prerequisite_customer_group_ids"*/}
        {/*            label={"Nhóm khách hàng:"}*/}
        {/*          >*/}
        {/*            <Select placeholder="Chọn nhóm khách hàng" mode="multiple">*/}
        {/*              <Option value="CT1">Nhóm KH1</Option>*/}
        {/*              <Option value="CT2">Nhóm KH2</Option>*/}
        {/*              <Option value="CT3">Nhóm KH3</Option>*/}
        {/*            </Select>*/}
        {/*          </Form.Item>*/}
        {/*        </Col>*/}
        {/*        <Col span={24}>*/}
        {/*          <Form.Item*/}
        {/*            name="prerequisite_customer_level_ids"*/}
        {/*            label={"Hạng khách hàng:"}*/}
        {/*          >*/}
        {/*            <Select placeholder="Chọn hạng khách hàng" mode="multiple">*/}
        {/*              <Option value="VIP1">VIP 1</Option>*/}
        {/*              <Option value="VIP2">VIP 2</Option>*/}
        {/*              <Option value="VIP3">VIP 3</Option>*/}
        {/*            </Select>*/}
        {/*          </Form.Item>*/}
        {/*        </Col>*/}
        {/*        <Col span={24}>*/}
        {/*          <Form.Item*/}
        {/*            name="prerequisite_customer_type_ids"*/}
        {/*            label={"Loại khách hàng:"}*/}
        {/*          >*/}
        {/*            <Select placeholder="Chọn loại khách hàng" mode="multiple">*/}
        {/*              <Option value="T1">Học sinh</Option>*/}
        {/*              <Option value="T2">Công sở</Option>*/}
        {/*              <Option value="T3">Ca sĩ</Option>*/}
        {/*              <Option value="T3">Diễn viên</Option>*/}
        {/*            </Select>*/}
        {/*          </Form.Item>*/}
        {/*        </Col>*/}
        {/*        <Col span={24}>*/}
        {/*          <Form.Item*/}
        {/*            name="prerequisite_assigned_user_ids"*/}
        {/*            label={"Nhân viên phụ trách:"}*/}
        {/*          >*/}
        {/*            <Select placeholder="Chọn nhân viên phụ trách" mode="multiple">*/}
        {/*              <Option value="E1">Nguyễn Văn A</Option>*/}
        {/*              <Option value="E2">Nguyễn Văn B</Option>*/}
        {/*              <Option value="E3">Nguyễn Văn C</Option>*/}
        {/*              <Option value="E4">Nguyễn Văn D</Option>*/}
        {/*            </Select>*/}
        {/*          </Form.Item>*/}
        {/*        </Col>*/}
        {/*      </div>*/}
        {/*    ) : null}*/}
        {/*    <div style={{color: '#ff4d4f'}}>{customerAdvanceMsg}</div>*/}
        {/*  </Row>*/}
        {/*</Card>*/}
      </Col>
    </Row>
  )
}

export default GeneralInfo;
