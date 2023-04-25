import {
  Card,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Row,
  Select,
  Space,
  Switch,
  TimePicker,
} from "antd";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import _ from "lodash";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import moment from "moment";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TreeStore from "component/CustomTreeSelect";
import { DATE_FORMAT } from "utils/DateUtils";
import { getDayOptions } from "utils/PromotionUtils";
import { dayOfWeekOptions } from "screens/promotion/constants";
import TreeSource from "component/treeSource";
import { CustomerContitionFormlStyle } from "screens/promotion/shared/condition.style";
import PromotionCampaignCustomerCondition from "./PromotionCampaignCustomerCondition";

const { Option } = Select;
const TimeRangePicker = TimePicker.RangePicker;

interface Props {
  form: FormInstance;
  isAllStore?: boolean;
  isAllChannel?: boolean;
  isAllSource?: boolean;
  isAllCustomer?: boolean;
}

function PromotionCampaignConditionForm({
  form,
  isAllChannel,
  isAllSource,
  isAllStore,
  isAllCustomer,
}: Props): ReactElement {
  const dispatch = useDispatch();

  const [showTimeAdvance] = useState<boolean>(false);
  const [allStore, setAllStore] = useState<boolean>(true);
  const [allChannel, setAllChannel] = useState<boolean>(true);
  const [allSource, setAllSource] = useState<boolean>(true);

  const [listStore, setStore] = useState<Array<StoreResponse>>([]);
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([]);

  useEffect(() => {
    setAllStore(typeof isAllStore === "boolean" ? isAllStore : true);
    setAllChannel(typeof isAllChannel === "boolean" ? isAllChannel : true);
    setAllSource(typeof isAllSource === "boolean" ? isAllSource : true);
  }, [isAllChannel, isAllSource, isAllStore]);

  useEffect(() => {
    dispatch(StoreGetListAction(setStore));
    dispatch(getListAllSourceRequest(setListSource));
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch]);
  
  const handleOnClickEndDate = useCallback(() => {
    // set time default 23:59
    const startDate = form.getFieldValue("starts_date");
    const endDate = form.getFieldValue("ends_date");
    const startDateValue = startDate?.format(DATE_FORMAT.DDMMYYY);
    const todayValue = moment().format(DATE_FORMAT.DDMMYYY);
    if (!endDate && startDateValue === todayValue) {
      form.setFieldsValue({
        ends_date: moment().set({ hour: 23, minute: 59 }),
      });
    }
  }, [form]);
  
  return (
    <CustomerContitionFormlStyle>
      <Card
        title={
          <span>
            Thời gian áp dụng
          </span>
        }
      >
        <Row gutter={6}>
          <Col span={6} style={{ marginTop: "8px" }}>Bắt đầu: <span className="required-field">*</span></Col>
          <Col span={18}>
            <Form.Item
              name="starts_date"
              rules={[
                { required: true, message: "Vui lòng chọn thời gian áp dụng" },
                () => ({
                  validator(rule, value) {
                    const endsDateValue = form.getFieldValue("ends_date");
                    if (!endsDateValue) return Promise.resolve();
                    if (value > endsDateValue) {
                      return Promise.reject(new Error("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc"));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                id={"starts_date"}
                style={{ width: "100%" }}
                placeholder="Từ ngày"
                showTime={{ format: "HH:mm" }}
                format={DATE_FORMAT.DDMMYY_HHmm}
                disabledDate={(date) => {
                  const currentDate = _.cloneDeep(date);
                  return (
                    currentDate.isBefore(moment()) ||
                    (form.getFieldValue("ends_date")
                      ? currentDate.valueOf() > form.getFieldValue("ends_date")
                      : false)
                  );
                }}
                showNow={true}
              />
            </Form.Item>
          </Col>

          <Col span={6} style={{ marginTop: "8px" }}>Kết thúc:</Col>
          <Col span={18}>
            <Form.Item name="ends_date">
              <DatePicker
                id={"ends_date"}
                showTime={{ format: "HH:mm" }}
                format={DATE_FORMAT.DDMMYY_HHmm}
                style={{ width: "100%" }}
                placeholder="Đến ngày"
                disabledDate={(date) => {
                  const currentDate = _.cloneDeep(date);
                  return (
                    currentDate.isBefore(moment()) ||
                    (form.getFieldValue("starts_date") &&
                      currentDate.isBefore(moment(form.getFieldValue("starts_date"))))
                  );
                }}
                showNow={false}
                onClick={handleOnClickEndDate}
                onChange={() => {
                  form.validateFields(["starts_date"]).then();
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        {showTimeAdvance ? (
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item label={<b>Chỉ áp dụng trong các khung giờ:</b>} name="prerequisite_time">
                <TimeRangePicker placeholder={["Từ", "Đến"]} style={{ width: "100%" }} />
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
                style={{ marginBottom: "5px" }}
              >
                <Select placeholder="Chọn ngày" mode="multiple">
                  {getDayOptions().map((day) => (
                    <Option value={day.key} key={day.value}>
                      {day.value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        ) : null}
      </Card>

      <Card title="Phạm vi áp dụng">
        <Row gutter={24}>
          <Col span={24} style={{ marginBottom: "8px", fontWeight: "bold" }}>Kênh áp dụng:</Col>
          <Col span={24}>
            <Form.Item
              name="prerequisite_sales_channel_names"
              rules={[
                {
                  required: !allChannel,
                  message: "Vui lòng chọn kênh bán hàng áp dụng",
                },
              ]}
              style={{ marginBottom: "12px" }}
            >
              <Select
                id="prerequisite_sales_channel_names"
                autoClearSearchValue={false}
                disabled={allChannel}
                placeholder="Chọn kênh bán hàng"
                mode="multiple"
                className="ant-select-selector-min-height"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                }
              >
                {listChannel?.map((channel: any) => (
                  <Option value={channel.code} key={channel.code}>
                    {channel.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Space direction="horizontal">
              <Switch
                checked={allChannel}
                onChange={(value) => {
                  form.setFieldsValue({
                    prerequisite_sales_channel_names: [],
                  });
                  form.validateFields(["prerequisite_sales_channel_names"]);
                  setAllChannel(value);
                }}
              />
              {"Áp dụng toàn bộ"}
            </Space>
          </Col>

          <Col span={24} style={{ marginBottom: "8px", marginTop: "24px", fontWeight: "bold" }}>
            Nguồn đơn hàng áp dụng:
          </Col>
          <Col span={24} id="prerequisite_order_source_ids">
            <Form.Item
              name="prerequisite_order_source_ids"
              rules={[
                {
                  required: !allSource,
                  message: "Vui lòng chọn nguồn bán hàng áp dụng",
                },
              ]}
              style={{ marginBottom: "12px" }}
            >
              <TreeSource
                form={form}
                name="prerequisite_order_source_ids"
                placeholder="Chọn nguồn đơn hàng"
                listSource={listSource}
                style={{ width: "100%" }}
                disabled={allSource}
              />
            </Form.Item>
            <Space direction="horizontal">
              <Switch
                checked={allSource}
                onChange={(value) => {
                  form.validateFields(["prerequisite_order_source_ids"]);
                  form.setFieldsValue({
                    prerequisite_order_source_ids: [],
                  });
                  setAllSource(value);
                }}
              />
              {"Áp dụng toàn bộ"}
            </Space>
          </Col>

          <Col span={24} style={{ marginBottom: "8px", marginTop: "24px", fontWeight: "bold" }}>
            Cửa hàng áp dụng:
          </Col>
          <Col span={24} id="prerequisite_store_ids">
            <Form.Item
              name="prerequisite_store_ids"
              rules={[
                {
                  required: !allStore,
                  message: "Vui lòng chọn cửa hàng áp dụng",
                },
              ]}
              style={{ marginBottom: "12px" }}
            >
              <TreeStore
                placeholder="Chọn cửa hàng"
                storeByDepartmentList={listStore as unknown as StoreByDepartment[]}
                style={{ width: "100%" }}
                disabled={allStore}
              />
            </Form.Item>
            <Space direction="horizontal">
              <Switch
                checked={allStore}
                onChange={(value) => {
                  setAllStore(value);
                  form.setFieldsValue({
                    prerequisite_store_ids: [],
                  });
                  form.validateFields(["prerequisite_store_ids"]);
                }}
              />
              {" Áp dụng toàn bộ"}
            </Space>
          </Col>

          {/* Đối tượng khách hàng áp dụng */}
          <PromotionCampaignCustomerCondition form={form} isAllCustomer={isAllCustomer} />
        </Row>
      </Card>
    </CustomerContitionFormlStyle>
  );
}

export default PromotionCampaignConditionForm;
