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
import { getListSourceRequest } from "domain/actions/product/source.action";
import { StoreResponse } from "model/core/store.model";
import { SourceResponse } from "model/response/order/source.response";
import { ChannelResponse } from "model/response/product/channel.response";
import moment from "moment";
import React, { ReactElement, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { DATE_FORMAT } from "utils/DateUtils";
import { getDayOptions } from "utils/PromotionUtils";
import { dayOfWeekOptions } from "../constants/index";
import { CustomerContitionFormlStyle } from "./condition.style";
import CustomerFilter from "./cusomer-condition.form";

const { Option } = Select;
const TimeRangePicker = TimePicker.RangePicker;

interface Props {
  form: FormInstance;
  isAllStore?: boolean;
  isAllChannel?: boolean;
  isAllSource?: boolean;
  isAllCustomer?: boolean;
}

function GeneralConditionForm({
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
    dispatch(getListSourceRequest(setListSource));
    dispatch(getListChannelRequest(setListChannel));
  }, [dispatch]);
  return (
    <CustomerContitionFormlStyle>
      <Card
        title={
          <span>
            Thời gian áp dụng <span className="required-field">*</span>
          </span>
        }
      >
        <Row gutter={6}>
          <Col span={12}>
            <Form.Item
              name="starts_date"
              rules={[{ required: true, message: "Vui lòng chọn thời gian áp dụng" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Từ ngày"
                showTime={{ format: "HH:mm" }}
                format={DATE_FORMAT.DDMMYY_HHmm}
                disabledDate={(currentDate) => {
                  currentDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
                  console.log('currentDate', currentDate);
                  return currentDate.isBefore(moment().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })) ||
                    (form.getFieldValue("ends_date")
                      ? currentDate.valueOf() > form.getFieldValue("ends_date")
                      : false)
                }
                }
                showNow={true}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="ends_date">
              <DatePicker
                showTime={{ format: "HH:mm" }}
                format={DATE_FORMAT.DDMMYY_HHmm}
                style={{ width: "100%" }}
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

        </Row>
        {showTimeAdvance ? (
          <Row gutter={12}>
            <Col span={24}>
              <Form.Item
                label={<b>Chỉ áp dụng trong các khung giờ:</b>}
                name="prerequisite_time"
              >
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
                    <Option value={day.key} key={day.value}>{day.value}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        ) : null}
      </Card>
      <Card title="Cửa hàng áp dụng">
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item name="prerequisite_store_ids" rules={[{ required: !allStore, message: "Vui lòng chọn cửa hàng áp dụng" }]}>
              <TreeStore
                form={form}
                name="prerequisite_store_ids"
                placeholder="Chọn cửa hàng"
                listStore={listStore}
                style={{ width: "100%" }}
                disabled={allStore}
              />
            </Form.Item>
            <Form.Item>
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
            </Form.Item>
          </Col>
        </Row>
      </Card>
      <Card title="Kênh bán hàng áp dụng">
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name="prerequisite_sales_channel_names"
              rules={[
                { required: !allChannel, message: "Vui lòng chọn kênh bán hàng áp dụng" },
              ]}
            >
              <Select
                disabled={allChannel}
                placeholder="Chọn kênh bán hàng"
                mode="multiple"
                className="ant-select-selector-min-height"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase().trim()) >=
                  0
                }
              >
                {listChannel?.map((channel: any) => (
                  <Option value={channel.name} key={channel.name}>{channel.name}</Option>
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
        </Row>
      </Card>
      <Card title="Nguồn đơn hàng áp dụng">
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name="prerequisite_order_source_ids"
              rules={[
                { required: !allSource, message: "Vui lòng chọn nguồn bán hàng áp dụng" },
              ]}
            >
              <Select
                disabled={allSource}
                placeholder="Chọn nguồn đơn hàng"
                mode="multiple"
                className="ant-select-selector-min-height"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase().trim()) >=
                  0
                }
              >
                {listSource?.map((source: any) => (
                  <Option value={source.id} key={source.name}>{source.name}</Option>
                ))}
              </Select>
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
        </Row>
      </Card>
      {/* Đối tượng khách hàng áp dụng */}
      <CustomerFilter form={form} isAllCustomer={isAllCustomer} />
    </CustomerContitionFormlStyle>
  );
}

export default GeneralConditionForm;
