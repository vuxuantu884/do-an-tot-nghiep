import { Col, Form, Row, Select } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import CustomSelect from "component/custom/select.custom";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { StyledComponent } from "./styled";

type Props = {};
const StaffListFilter: React.FC<Props> = (props: Props) => {
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
  for (let i = 0; i < 5; i++) {
    console.log(i);
  }
  return (
    <StyledComponent>
      <div className="page-filter">
        <Row className="page-filter-heading">
          <Col span={6}>
            <Form.Item name="opened_bys">
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
          <Col span={6}>
            <CustomSelect
              showSearch
              showArrow
              allowClear
              optionFilterProp="children"
              placeholder="Lọc theo vị trí"
            >
              <CustomSelect.Option key={1} value={1}>
                vị trí 1
              </CustomSelect.Option>
              <CustomSelect.Option key={2} value={2}>
                vị trí 2
              </CustomSelect.Option>
              <CustomSelect.Option key={3} value={3}>
                vị trí 3
              </CustomSelect.Option>
              <CustomSelect.Option key={4} value={4}>
                vị trí 4
              </CustomSelect.Option>
              <CustomSelect.Option key={5} value={5}>
                vị trí 5
              </CustomSelect.Option>
            </CustomSelect>
          </Col>
        </Row>
      </div>
    </StyledComponent>
  );
};

export default StaffListFilter;
