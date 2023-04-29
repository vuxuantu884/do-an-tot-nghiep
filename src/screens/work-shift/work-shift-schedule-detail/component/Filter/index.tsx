import React, { useEffect, useState } from "react";
import { StyledComponent } from "./styled";
import { Button, Col, DatePicker, Form, Row } from "antd";
import CustomSelect from "component/custom/select.custom";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import { useDispatch } from "react-redux";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { EnumSelectedFilter } from "screens/work-shift/work-shift-helper";

const { RangePicker } = DatePicker;

type Props = {};
const WorkShiftScheduleDetailFilter: React.FC<Props> = (props: Props) => {
  const {} = props;
  const dispatch = useDispatch();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);

  useEffect(() => {
    dispatch(
      searchAccountPublicAction({ limit: 30 }, (data) => {
        setAccounts(data.items || []);
      }),
    );
  }, [dispatch]);

  return (
    <StyledComponent>
      <div className="page-filter">
        <Row className="page-filter-content">
          <Row className="page-filter-content-left">
            <Col span={6}>
              <Form.Item>
                <RangePicker style={{ width: "100%" }} placeholder={["Từ ngày", "Đến ngày"]} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item>
                <CustomSelect
                  style={{ width: "100%" }}
                  showSearch
                  showArrow
                  allowClear
                  optionFilterProp="children"
                  placeholder="Chọn ca"
                ></CustomSelect>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="nhan_vien">
                <AccountCustomSearchSelect
                  placeholder="Tìm kiếm nhân viên"
                  dataToSelect={accountData}
                  setDataToSelect={setAccountData}
                  initDataToSelect={accounts}
                  mode="multiple"
                  getPopupContainer={(trigger: any) => trigger.parentNode}
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row className="page-filter-content-right">
            <Button icon={<CalendarOutlined />} className="btn-calendar"></Button>
            <Button icon={<UserOutlined />} type="primary" className="btn-user"></Button>
          </Row>
        </Row>
      </div>
    </StyledComponent>
  );
};

export default WorkShiftScheduleDetailFilter;
