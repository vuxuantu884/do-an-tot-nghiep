import { Button, Col, Form, FormInstance, Row } from "antd";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import CustomSelect from "component/custom/select.custom";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { AccountResponse } from "model/account/account.model";
import React, { useState, useEffect, useCallback, createRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { StyledComponent } from "./styled";
import { StaffQuery } from "model/staff/staff.model";
import { WorkShiftRoleResponse } from "model/work-shift/work-shift.model";
import { getWorkShiftRoleService } from "service/work-shift/work-shift.service";

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
  const [workShiftRole, setWorkShiftRole] = useState<WorkShiftRoleResponse[]>([]);

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
    (async () => {
      try {
        const response = await getWorkShiftRoleService();
        if (response.status === 200) {
          setWorkShiftRole(response.data);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);

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
                  {workShiftRole.map((value, index) => (
                    <CustomSelect.Option key={index} value={value.name}>
                      {value.name}
                    </CustomSelect.Option>
                  ))}
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
