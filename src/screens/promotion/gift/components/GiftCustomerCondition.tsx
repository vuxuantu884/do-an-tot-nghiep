import { Card, Col, DatePicker, Form, FormInstance, Row, Select, Space, Switch } from "antd";
import { CustomerGroups } from "domain/actions/customer/customer.action";
import { LoyaltyRankSearch } from "domain/actions/loyalty/rank/loyalty-rank.action";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { Gender } from "model/promotion/price-rules.model";
import { LoyaltyRankResponse } from "model/response/loyalty/ranking/loyalty-rank.response";
import React, { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import CustomNumberInput from "component/custom/customNumberInput";
import { formatCurrencyNotDefaultValue, isNullOrUndefined } from "utils/AppUtils";
import rightArrow from "assets/icon/right-arrow.svg";
import { GiftCustomerConditionStyled } from "screens/promotion/gift/gift.style";
import moment from "moment";
const { Option } = Select;

interface Props {
  form: FormInstance;
  isAllCustomer?: boolean;
}
export enum CustomerConditionField {
  customer_selection = "customer_selection",
  starts_birthday = "starts_birthday",
  ends_birthday = "ends_birthday",
  starts_wedding_day = "starts_wedding_day",
  ends_wedding_day = "ends_wedding_day",
  prerequisite_genders = "prerequisite_genders",
  prerequisite_customer_loyalty_level_ids = "prerequisite_customer_loyalty_level_ids",
  prerequisite_customer_group_ids = "prerequisite_customer_group_ids",
  prerequisite_total_money_spend_from = "prerequisite_total_money_spend_from",
  prerequisite_total_money_spend_to = "prerequisite_total_money_spend_to",
  prerequisite_total_finished_order_from = "prerequisite_total_finished_order_from",
  prerequisite_total_finished_order_to = "prerequisite_total_finished_order_to",
}

const genderOptions = [
  {
    label: "Nam",
    value: Gender.MALE,
  },
  {
    label: "Nữ",
    value: Gender.FEMALE,
  },
  {
    label: "Khác",
    value: Gender.OTHER,
  },
];

export default function GiftCustomerCondition(props: Props): ReactElement {
  const { form, isAllCustomer } = props;
  const dispatch = useDispatch();

  const [checkedAll, setCheckedAll] = React.useState<boolean>(true);
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [rankingList, setRankingList] = React.useState<Array<LoyaltyRankResponse>>([]);

  const rankFiltered = useMemo(() => {
    return rankingList.filter((rank) => rank.status === "ACTIVE");
  }, [rankingList]);

  const resetError = useCallback(() => {
    form.setFields(
      Object.values(CustomerConditionField).map((field) => ({
        name: field,
        errors: [],
      })),
    );
  }, [form]);

  const validateAll = (rule: any, value: any, callback: any) => {
    const customerFields = _.cloneDeep(form.getFieldsValue(Object.values(CustomerConditionField)));

    delete customerFields[CustomerConditionField.customer_selection];
    if (
      Object.values(customerFields).every(
        (field: any) => isNullOrUndefined(field) || field?.length === 0,
      )
    ) {
      form.setFields(
        Object.values(CustomerConditionField).map((field) => ({
          name: field,
          errors: ["Vui lòng tạo ít nhất 1 điều kiện áp dụng"],
        })),
      );
      callback("Vui lòng tạo ít nhất 1 điều kiện áp dụng");
    } else {
      resetError();
      callback();
    }
  };
  const handleCheckedAll = (value: boolean) => {
    setCheckedAll(value);

    if (value) {
      resetError();
      form.setFieldsValue({
        [CustomerConditionField.prerequisite_genders]: [],
        [CustomerConditionField.starts_birthday]: null,
        [CustomerConditionField.ends_birthday]: null,
        [CustomerConditionField.starts_wedding_day]: null,
        [CustomerConditionField.ends_wedding_day]: null,
        [CustomerConditionField.prerequisite_customer_group_ids]: [],
        [CustomerConditionField.prerequisite_customer_loyalty_level_ids]: [],
        [CustomerConditionField.prerequisite_total_money_spend_from]: null,
        [CustomerConditionField.prerequisite_total_money_spend_to]: null,
        [CustomerConditionField.prerequisite_total_finished_order_from]: null,
        [CustomerConditionField.prerequisite_total_finished_order_to]: null,
      });
    }
  };

  useEffect(() => {
    setCheckedAll(typeof isAllCustomer === "boolean" ? isAllCustomer : true);
  }, [isAllCustomer]);

  useEffect(() => {
    dispatch(CustomerGroups(setGroups));
    dispatch(
      LoyaltyRankSearch({}, (data: PageResponse<LoyaltyRankResponse>) => {
        setRankingList(data.items);
      }),
    );
  }, [dispatch]);

  return (
    <Card title={<span>Đối tượng khách hàng áp dụng</span>}>
      {/* Đối tượng khách hàng áp dụng: */}
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item name={CustomerConditionField.customer_selection}>
            <Space direction="horizontal">
              <Switch checked={checkedAll} onChange={(e) => handleCheckedAll(e)} />
              {"Áp dụng toàn bộ khách hàng"}
            </Space>
          </Form.Item>

          {!checkedAll && (
            <GiftCustomerConditionStyled>
              <Form.Item
                label="Giới tính"
                name={CustomerConditionField.prerequisite_genders}
                rules={[
                  {
                    validator: validateAll,
                  },
                ]}
                help={false}
                colon={false}
                labelCol={{ span: 24 }}
              >
                <Select
                  id={CustomerConditionField.prerequisite_genders}
                  placeholder="Chọn giới tính"
                  showArrow
                  mode="multiple"
                  showSearch={false}
                  style={{ height: "auto" }}
                >
                  {genderOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={6}>
                <Col span={24}>
                  <div
                    className="ant-form-item-label-no-colon"
                    style={{ width: "100%", textAlign: "left", height: "32px" }}
                  >
                    <label
                      htmlFor={CustomerConditionField.starts_birthday}
                      style={{ fontWeight: 500, color: "black" }}
                    >
                      Ngày sinh
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={CustomerConditionField.starts_birthday}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                    help={false}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Từ ngày"
                      showTime={{ format: DATE_FORMAT.DDMM }}
                      format={DATE_FORMAT.DDMM}
                      showNow={false}
                      disabledDate={(currentDate) => {
                        const cur = currentDate.set({
                          hour: 12,
                        });
                        const endDay = form
                          .getFieldValue(CustomerConditionField.ends_birthday)
                          ?.set({
                            hour: 0,
                          });
                        return cur > endDay;
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={CustomerConditionField.ends_birthday}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                    help={false}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Đến ngày"
                      showTime={{ format: DATE_FORMAT.DDMM }}
                      format={DATE_FORMAT.DDMM}
                      disabledDate={(currentDate) => {
                        const cur = currentDate.set({
                          hour: 0,
                        });

                        const start = form
                          .getFieldValue(CustomerConditionField.starts_birthday)
                          ?.set({
                            hour: 12,
                          });
                        return cur && cur < moment(start).subtract(1, "d");
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={6}>
                <Col span={24}>
                  <div
                    className="ant-form-item-label-no-colon"
                    style={{ width: "100%", textAlign: "left", height: "32px" }}
                  >
                    <label
                      style={{ fontWeight: 500, color: "black" }}
                      htmlFor={CustomerConditionField.starts_wedding_day}
                    >
                      Ngày cưới
                    </label>
                  </div>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={CustomerConditionField.starts_wedding_day}
                    help={false}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Từ ngày"
                      showTime={{ format: DATE_FORMAT.DDMM }}
                      format={DATE_FORMAT.DDMM}
                      showNow={false}
                      disabledDate={(currentDate) => {
                        const cur = currentDate.set({
                          hour: 12,
                        });
                        const endDay = form
                          .getFieldValue(CustomerConditionField.ends_wedding_day)
                          ?.set({
                            hour: 0,
                          });
                        return cur > endDay;
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={CustomerConditionField.ends_wedding_day}
                    help={false}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Đến ngày"
                      showTime={{ format: DATE_FORMAT.DDMM }}
                      format={DATE_FORMAT.DDMM}
                      showNow={false}
                      disabledDate={(currentDate) => {
                        const cur = currentDate.set({
                          hour: 0,
                        });
                        const start = form
                          .getFieldValue(CustomerConditionField.starts_wedding_day)
                          ?.set({
                            hour: 12,
                          });

                        return cur && cur < moment(start).subtract(1, "d");
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="Nhóm khách hàng"
                name={CustomerConditionField.prerequisite_customer_group_ids}
                rules={[
                  {
                    validator: validateAll,
                  },
                ]}
                help={false}
                labelCol={{ span: 24 }}
              >
                <Select
                  placeholder="Chọn nhóm khách hàng"
                  showArrow
                  autoClearSearchValue={false}
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  mode="multiple"
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                  }
                >
                  {groups.map((group) => (
                    <Option key={group.id} value={group.id}>
                      {group.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Hạng khách hàng"
                name={CustomerConditionField.prerequisite_customer_loyalty_level_ids}
                rules={[
                  {
                    validator: validateAll,
                  },
                ]}
                help={false}
                labelCol={{ span: 24 }}
              >
                <Select
                  autoClearSearchValue={false}
                  mode="multiple"
                  placeholder="Chọn hạng khách hàng"
                  showArrow
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option?.children.toLowerCase().indexOf(input.toLowerCase().trim()) >= 0
                  }
                >
                  {rankFiltered.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <div>
                <div className="form-item-title">Tiền tích lũy</div>
                <div className={"form-item-scope"}>
                  <Form.Item
                    name={CustomerConditionField.prerequisite_total_money_spend_from}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                    help={false}
                  >
                    <CustomNumberInput
                      id={CustomerConditionField.prerequisite_total_money_spend_from}
                      style={{ textAlign: "left" }}
                      format={(a: string) => formatCurrencyNotDefaultValue(a)}
                      placeholder="Từ"
                      maxLength={15}
                    />
                  </Form.Item>

                  <img style={{ margin: "0 4px" }} src={rightArrow} alt="" />

                  <Form.Item
                    name={CustomerConditionField.prerequisite_total_money_spend_to}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                    help={false}
                  >
                    <CustomNumberInput
                      style={{ textAlign: "left" }}
                      format={(a: string) => formatCurrencyNotDefaultValue(a)}
                      placeholder="Đến"
                      maxLength={15}
                    />
                  </Form.Item>
                </div>
              </div>

              <div>
                <div className="form-item-title">Tổng đơn hàng</div>
                <div className={"form-item-scope"}>
                  <Form.Item
                    name={CustomerConditionField.prerequisite_total_finished_order_from}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                    help={false}
                  >
                    <CustomNumberInput
                      id={CustomerConditionField.prerequisite_total_finished_order_from}
                      style={{ textAlign: "left" }}
                      format={(a: string) => formatCurrencyNotDefaultValue(a)}
                      placeholder="Từ"
                      maxLength={13}
                    />
                  </Form.Item>

                  <img style={{ margin: "0 4px" }} src={rightArrow} alt="" />

                  <Form.Item
                    name={CustomerConditionField.prerequisite_total_finished_order_to}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                    help={false}
                  >
                    <CustomNumberInput
                      style={{ textAlign: "left" }}
                      format={(a: string) => formatCurrencyNotDefaultValue(a)}
                      placeholder="Đến"
                      maxLength={13}
                    />
                  </Form.Item>
                </div>
              </div>
            </GiftCustomerConditionStyled>
          )}
        </Col>
      </Row>
    </Card>
  );
}
