import { Button, Col, Form, FormInstance, Row } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import CustomSelect from "component/custom/select.custom";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import React, { useState, useEffect, useCallback, createRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { StyledComponent } from "./styled";
import { StaffQuery } from "model/staff/staff.model";

type Props = {
  params?: StaffQuery;
  onFilter?: (values: any | Object) => void;
};
const StaffListFilter: React.FC<Props> = (props: Props) => {
  const { params, onFilter } = props;
  const dispatch = useDispatch();
  const formSearchRef = createRef<FormInstance>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);

  const initialValues = useMemo(() => {
    return {
      key1: params?.key1 ? (Array.isArray(params?.key1) ? params?.key1 : [params?.key1]) : [],
      key2: params?.key2 || null,
    };
  }, [params]);

  const onFinish = useCallback(() => {
    const formSearchValue = formSearchRef.current?.getFieldsValue();

    onFilter && onFilter(formSearchValue);
  }, [formSearchRef, onFilter]);

  useEffect(() => {
    dispatch(
      searchAccountPublicAction({ limit: 30 }, (data) => {
        setAccounts(data.items || []);
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    formSearchRef.current?.setFieldsValue({
      ...initialValues,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  console.log("initialValues", initialValues, accountData);
  return (
    <StyledComponent>
      <div className="page-filter">
        <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues}>
          <Row className="page-filter-content">
            <Col span={6}>
              <Form.Item name="key1">
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
              <Form.Item name="key2">
                <CustomSelect
                  showSearch
                  showArrow
                  allowClear
                  optionFilterProp="children"
                  placeholder="Lọc theo vị trí"
                >
                  <CustomSelect.Option key={1} value={"1"}>
                    vị trí 1
                  </CustomSelect.Option>
                  <CustomSelect.Option key={2} value={"2"}>
                    vị trí 2
                  </CustomSelect.Option>
                  <CustomSelect.Option key={3} value={"3"}>
                    vị trí 3
                  </CustomSelect.Option>
                  <CustomSelect.Option key={4} value={"4"}>
                    vị trí 4
                  </CustomSelect.Option>
                  <CustomSelect.Option key={5} value={"5"}>
                    vị trí 5
                  </CustomSelect.Option>
                </CustomSelect>
              </Form.Item>
            </Col>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Form.Item>
          </Row>
        </Form>
      </div>
    </StyledComponent>
  );
};

export default StaffListFilter;
