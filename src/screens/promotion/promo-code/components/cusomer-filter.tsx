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
import {PageResponse} from "model/base/base-metadata.response";
import {LoyaltyRankResponse} from "model/response/loyalty/ranking/loyalty-rank.response";
import React, {ReactElement, useEffect, useMemo} from "react";
import {useDispatch} from "react-redux";
import {DATE_FORMAT} from "utils/DateUtils";
const {Option} = Select;

interface Props {
  form: FormInstance;
}
export enum CustomerFilterField {
  apply_to_all_customers = "apply_to_all_customers",
  starts_wedding_day = "starts_wedding_day",
  ends_wedding_day = "ends_wedding_day",
  starts_birthday = "starts_birthday",
  ends_birthday = "ends_birthday",
  prerequisite_genders = "prerequisite_genders",
  prerequisite_customer_loyalty_level_ids = "prerequisite_customer_loyalty_level_ids",
  prerequisite_customer_group_ids = "prerequisite_customer_group_ids",
  staff =  "staff"
}

const genderOptions = [
  {
    label: "Nam",
    value: "MALE",
  },
  {
    label: "Nữ",
    value: "FEMALE",
  },
  {
    label: "Khác",
    value: "OTHER",
  },
];

export default function CustomerFilter(props: Props): ReactElement {
  // const {form} = props;
  const dispatch = useDispatch();

  const [checkedAll, setCheckedAll] = React.useState<boolean>(false);
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [rankingList, setRankingList] = React.useState<Array<LoyaltyRankResponse>>([]);

  const rankFiltered = useMemo(() => {
    return rankingList.filter((rank) => rank.status === "ACTIVE");
  }, [rankingList]);

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
      <Row gutter={12} style={{padding: "0px 16px"}}>
        <Col span={24}>
          <Form.Item
            label={<b>Đối tượng khách hàng áp dụng:</b>}
            name={CustomerFilterField.apply_to_all_customers}
          >
            <Space direction="horizontal">
              <Switch defaultChecked={checkedAll} onChange={(e) => setCheckedAll(e)} />
              {"Áp dụng toàn bộ khách hàng"}
            </Space>
          </Form.Item>

          {!checkedAll && (
            <>
              <Form.Item
                label="Giới tính"
                name={CustomerFilterField.prerequisite_genders}
              >
                <Select placeholder="Chọn giới tính" showArrow mode="multiple">
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
                    name="starts_birthday"
                    rules={[{required: true, message: "Vui lòng chọn thời gian áp dụng"}]}
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
                  <Form.Item name="ends_birthday">
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
                    name="starts_wedding"
                    rules={[{required: true, message: "Vui lòng chọn thời gian áp dụng"}]}
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
                  <Form.Item name="ends_birthday">
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
              <Form.Item label="Nhóm khách hàng" name="prerequisite_customer_group_ids">
                <Select
                  placeholder="Chọn nhóm khách hàng"
                  showArrow
                  optionFilterProp="children"
                  showSearch
                  allowClear
                  mode="multiple"
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
                name="prerequisite_customer_loyalty_level_ids"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn hạng khách hàng"
                  showArrow
                  optionFilterProp="children"
                  showSearch
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
                name={CustomerFilterField.staff}
              />
            </>
          )}
        </Col>
      </Row>
    </Card>
  );
}
