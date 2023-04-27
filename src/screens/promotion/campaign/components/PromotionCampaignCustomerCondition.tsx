import { Col, DatePicker, Form, FormInstance, Row, Select, Space, Switch } from "antd";
import { CustomerGroups } from "domain/actions/customer/customer.action";
import { LoyaltyRankSearch } from "domain/actions/loyalty/rank/loyalty-rank.action";
import _ from "lodash";
import { PageResponse } from "model/base/base-metadata.response";
import { CustomerSelectionOption } from "model/promotion/price-rules.model";
import { LoyaltyRankResponse } from "model/response/loyalty/ranking/loyalty-rank.response";
import React, { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { DATE_FORMAT } from "utils/DateUtils";
import { CustomerConditionStyled } from "screens/promotion/discount/discount-style";
import moment from "moment";
import { CustomerConditionFields, genderOptions } from "screens/promotion/campaign/campaign.helper";
const { Option } = Select;

interface Props {
  form: FormInstance;
  isAllCustomer?: boolean;
}

export default function PromotionCampaignCustomerCondition(props: Props): ReactElement {
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
      Object.values(CustomerConditionFields).map((field) => ({
        name: field,
        errors: [],
      })),
    );
  }, [form]);

  const validateAll = (rule: any, value: any, callback: any) => {
    const customerFields = _.cloneDeep(form.getFieldsValue(Object.values(CustomerConditionFields)));

    delete customerFields[CustomerConditionFields.customer_selection];
    if (Object.values(customerFields).every((field: any) => !field || field?.length === 0)) {
      form.setFields(
        Object.values(CustomerConditionFields).map((field) => ({
          name: field,
          errors: ["Vui lòng chọn ít nhất 1 điều kiện"],
        })),
      );
      callback("Vui lòng chọn ít nhất 1 điều kiện");
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
        [CustomerConditionFields.prerequisite_genders]: undefined,
        [CustomerConditionFields.starts_birthday]: undefined,
        [CustomerConditionFields.ends_birthday]: undefined,
        [CustomerConditionFields.starts_wedding_day]: undefined,
        [CustomerConditionFields.ends_wedding_day]: undefined,
        [CustomerConditionFields.prerequisite_customer_group_ids]: undefined,
        [CustomerConditionFields.prerequisite_customer_loyalty_level_ids]: undefined,
        [CustomerConditionFields.customer_selection]: CustomerSelectionOption.ALL
      });
    } else {
      form.setFieldsValue({[CustomerConditionFields.customer_selection]: CustomerSelectionOption.PREREQUISITE });
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
    <>
      <Col span={24} style={{ marginTop: "24px", fontWeight: "bold" }}>Khách hàng áp dụng:</Col>
      <Col span={24}>
        <Form.Item name={CustomerConditionFields.customer_selection}>
          <Space direction="horizontal">
            <Switch checked={checkedAll} onChange={(e) => handleCheckedAll(e)} />
            {"Áp dụng toàn bộ khách hàng"}
          </Space>
        </Form.Item>

        {!checkedAll && (
          <CustomerConditionStyled>
            <Form.Item
              label={<strong>Giới tính</strong>}
              name={CustomerConditionFields.prerequisite_genders}
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
                id={CustomerConditionFields.prerequisite_genders}
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
                    htmlFor={CustomerConditionFields.starts_birthday}
                    style={{ fontWeight: 500, color: "black" }}
                  >
                    Ngày sinh
                  </label>
                </div>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={CustomerConditionFields.starts_birthday}
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
                    format={DATE_FORMAT.DDMM}
                    disabledDate={(currentDate) => {
                      const cur = currentDate.set({ hour: 12 });
                      const endDay = form.getFieldValue(CustomerConditionFields.ends_birthday)?.set({
                        hour: 0,
                      });

                      if (endDay) {
                        return cur > moment(endDay).add(1, "d");
                      } else {
                        return false;
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={CustomerConditionFields.ends_birthday}
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
                    format={DATE_FORMAT.DDMM}
                    disabledDate={(currentDate) => {
                      const cur = currentDate.set({ hour: 0 });
                      const start = form.getFieldValue(CustomerConditionFields.starts_birthday)?.set({
                        hour: 12,
                      });

                      if (start) {
                        return cur && cur < moment(start).subtract(1, "d");
                      } else {
                        return false;
                      }
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
                    htmlFor={CustomerConditionFields.starts_wedding_day}
                  >
                    Ngày cưới
                  </label>
                </div>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={CustomerConditionFields.starts_wedding_day}
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
                    format={DATE_FORMAT.DDMM}
                    disabledDate={(currentDate) => {
                      const cur = currentDate.set({ hour: 12 });
                      const endDay = form.getFieldValue(CustomerConditionFields.ends_wedding_day)?.set({
                        hour: 0,
                      });

                      if (endDay) {
                        return cur > moment(endDay).add(1, "d");
                      } else {
                        return false;
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={CustomerConditionFields.ends_wedding_day}
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
                    format={DATE_FORMAT.DDMM}
                    disabledDate={(currentDate) => {
                      const cur = currentDate.set({ hour: 0 });
                      const start = form.getFieldValue(CustomerConditionFields.starts_wedding_day)?.set({
                        hour: 12,
                      });

                      if (start) {
                        return cur && cur < moment(start).subtract(1, "d");
                      } else {
                        return false;
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label={<strong>Nhóm khách hàng</strong>}
              name={CustomerConditionFields.prerequisite_customer_group_ids}
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
                placeholder="Chọn nhóm khách hàng"
                showArrow
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
              label={<strong>Hạng khách hàng</strong>}
              name={CustomerConditionFields.prerequisite_customer_loyalty_level_ids}
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
          </CustomerConditionStyled>
        )}
      </Col>
    </>
  );
}
