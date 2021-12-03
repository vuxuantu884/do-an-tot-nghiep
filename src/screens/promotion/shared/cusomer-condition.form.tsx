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
} from "antd";
import AccountSearchSelect from "component/custom/select-search/account-select";
import {CustomerGroups} from "domain/actions/customer/customer.action";
import {LoyaltyRankSearch} from "domain/actions/loyalty/rank/loyalty-rank.action";
import _ from "lodash";
import {PageResponse} from "model/base/base-metadata.response";
import {LoyaltyRankResponse} from "model/response/loyalty/ranking/loyalty-rank.response";
import { Gender } from "model/response/promotion/discount/list-discount.response";
import React, {ReactElement, useCallback, useEffect, useMemo} from "react";
import {useDispatch} from "react-redux";
import {DATE_FORMAT} from "utils/DateUtils";
const {Option} = Select;

interface Props {
  form: FormInstance;
}
export enum CustomerFilterField {
  customer_selection = "customer_selection",
  starts_birthday = "starts_birthday",
  ends_birthday = "ends_birthday",
  starts_wedding_day = "starts_wedding_day",
  ends_wedding_day = "ends_wedding_day",
  prerequisite_genders = "prerequisite_genders",
  prerequisite_customer_loyalty_level_ids = "prerequisite_customer_loyalty_level_ids",
  prerequisite_customer_group_ids = "prerequisite_customer_group_ids",
  prerequisite_assignee_codes = "prerequisite_assignee_codes",
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

export default function CustomerFilter(props: Props): ReactElement {
  const {form} = props;
  const dispatch = useDispatch();

  const [checkedAll, setCheckedAll] = React.useState<boolean>(true);
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [rankingList, setRankingList] = React.useState<Array<LoyaltyRankResponse>>([]);

  const rankFiltered = useMemo(() => {
    return rankingList.filter((rank) => rank.status === "ACTIVE");
  }, [rankingList]);

  const resetError = useCallback(() => {
    form.setFields(
      Object.values(CustomerFilterField).map((field) => ({
        name: field,
        errors: [],
      }))
    );
  }, [form]);

  const validateAll = (rule: any, value: any, callback: any) => {
    const customerFields = _.cloneDeep(
      form.getFieldsValue(Object.values(CustomerFilterField))
    );
    console.log("customerFields", customerFields);

    delete customerFields[CustomerFilterField.customer_selection];
    if (
      Object.values(customerFields).every((field: any) => !field || field?.length === 0)
    ) {
      form.setFields(
        Object.values(CustomerFilterField).map((field) => ({
          name: field,
          errors: ["Vui lòng chọn ít nhất 1 điều kiện"],
        }))
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
    }
  };

  useEffect(() => {
    dispatch(CustomerGroups(setGroups));
    dispatch(
      LoyaltyRankSearch({}, (data: PageResponse<LoyaltyRankResponse>) => {
        setRankingList(data.items);
      })
    );
  }, [dispatch]);

  return (
    <Card>
      {/* Đối tượng khách hàng áp dụng: */}
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item
            label={<b>Đối tượng khách hàng áp dụng:</b>}
            name={CustomerFilterField.customer_selection}
          >
            <Space direction="horizontal">
              <Switch defaultChecked={checkedAll} onChange={(e) => handleCheckedAll(e)} />
              {"Áp dụng toàn bộ khách hàng"}
            </Space>
          </Form.Item>

          {!checkedAll && (
            <>
              <Form.Item
                label="Giới tính"
                name={CustomerFilterField.prerequisite_genders}
                rules={[
                  {
                    validator: validateAll,
                  },
                ]}
                help={false}
              >
                <Select placeholder="Chọn giới tính" showArrow mode="multiple" maxTagCount="responsive">
                  {genderOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Row gutter={6}>
                <Col span={24}>
                  <div className=" ant-form-item-label" style={{width: "100%"}}>
                    <label>Ngày sinh:</label>
                  </div>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={CustomerFilterField.starts_birthday}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                    help={false}
                  >
                    <DatePicker
                      style={{width: "100%"}}
                      placeholder="Từ ngày"
                      showTime={{format: DATE_FORMAT.DDMM}}
                      format={DATE_FORMAT.DDMM}
                      // disabledDate={(currentDate) =>
                      //   currentDate.isBefore(moment()) ||
                      //   (form.getFieldValue("ends_date") ? currentDate.valueOf() > form.getFieldValue("ends_date") : false)
                      // }
                      showNow={false}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={CustomerFilterField.ends_birthday}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                    help={false}
                  >
                    <DatePicker
                      // disabled={disabledEndDate}
                      style={{width: "100%"}}
                      placeholder="Đến ngày"
                      showTime={{format: DATE_FORMAT.DDMM}}
                      format={DATE_FORMAT.DDMM}
                      // disabledDate={(currentDate) =>
                      //   currentDate.isBefore(moment()) ||
                      //   (form.getFieldValue("starts_date") && currentDate.isBefore(moment(form.getFieldValue("starts_date"))))
                      // }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={6}>
                <Col span={24}>
                  <div className=" ant-form-item-label" style={{width: "100%"}}>
                    <label>Ngày cướI:</label>
                  </div>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={CustomerFilterField.starts_wedding_day}
                    help={false}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                  >
                    <DatePicker
                      style={{width: "100%"}}
                      placeholder="Từ ngày"
                      showTime={{format: DATE_FORMAT.DDMM}}
                      format={DATE_FORMAT.DDMM}
                      // disabledDate={(currentDate) =>
                      //   currentDate.isBefore(moment()) ||
                      //   (form.getFieldValue("ends_date") ? currentDate.valueOf() > form.getFieldValue("ends_date") : false)
                      // }
                      showNow={false}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={CustomerFilterField.ends_wedding_day}
                    help={false}
                    rules={[
                      {
                        validator: validateAll,
                      },
                    ]}
                  >
                    <DatePicker
                      // disabled={disabledEndDate}
                      style={{width: "100%"}}
                      placeholder="Đến ngày"
                      showTime={{format: DATE_FORMAT.DDMM}}
                      format={DATE_FORMAT.DDMM}
                      // disabledDate={(currentDate) =>
                      //   currentDate.isBefore(moment()) ||
                      //   (form.getFieldValue("starts_date") && currentDate.isBefore(moment(form.getFieldValue("starts_date"))))
                      // }
                      showNow={false}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                label="Nhóm khách hàng"
                name={CustomerFilterField.prerequisite_customer_group_ids}
                rules={[
                  {
                    validator: validateAll,
                  },
                ]}
                help={false}
              >
                <Select
                  placeholder="Chọn nhóm khách hàng"
                  showArrow
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  mode="multiple"
                  maxTagCount="responsive"
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
                name={CustomerFilterField.prerequisite_customer_loyalty_level_ids}
                rules={[
                  {
                    validator: validateAll,
                  },
                ]}
                help={false}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn hạng khách hàng"
                  showArrow
                  optionFilterProp="children"
                  showSearch
                  maxTagCount="responsive"
                  allowClear
                >
                  {rankFiltered.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <AccountSearchSelect
                label="Nhân viên phụ trách"
                placeholder="Chọn nhân viên phụ trách"
                name={CustomerFilterField.prerequisite_assignee_codes}
                mode="multiple"
                rules={[
                  {
                    validator: validateAll,
                  },
                ]}
                help={false}
              />
            </>
          )}
        </Col>
      </Row>
    </Card>
  );
}
