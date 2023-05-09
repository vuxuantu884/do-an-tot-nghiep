import React, { useEffect, useState, createRef, useMemo, useCallback } from "react";
import { StyledComponent } from "./styled";
import { Button, Col, DatePicker, Form, FormInstance, Row, Tooltip } from "antd";
import CustomSelect from "component/custom/select.custom";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import { useDispatch } from "react-redux";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";
import { EnumSelectedFilter } from "screens/work-shift/work-shift-helper";
import { WorkHour, WorkShiftCellQuery } from "model/work-shift/work-shift.model";
import moment from "moment";
import { WORK_SHIFT_LIST } from "screens/work-shift/work-shift-helper";

const { RangePicker } = DatePicker;

type Props = {
  params?: WorkShiftCellQuery;
  onFilter?: (values: any | Object) => void;
  validStartDate?: string | null;
  validEndDate?: string | null;
};
const WorkShiftScheduleDetailFilter: React.FC<Props> = (props: Props) => {
  const { params, onFilter, validStartDate, validEndDate } = props;
  const dispatch = useDispatch();
  const formSearchRef = createRef<FormInstance>();
  const [accounts, setAccounts] = useState<Array<AccountResponse>>([]);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);

  const [selectQuery, setSelectQuery] = useState(EnumSelectedFilter.calendar);
  const [workShiftList, setWorkShiftList] = useState<WorkHour[]>([]);

  const initialValues = useMemo(() => {
    return {
      select_query: params?.select_query || EnumSelectedFilter.calendar,
      work_hour_name: params?.work_hour_name,
      assigned_to: params?.assigned_to,
      issued_date:
        params?.issued_date && Array.isArray(params?.issued_date)
          ? params?.issued_date.map((p) => {
              const v = p ? moment(p) : moment("2023-05-01");
              return v;
            })
          : [],
    };
  }, [params]);

  const handleError = useCallback(() => {
    let error = false;
    formSearchRef?.current?.getFieldsError(["issued_date"]).forEach((field) => {
      if (field.errors.length) {
        error = true;
      }
    });

    return error;
  }, [formSearchRef]);

  const checkValueSelectQuery = (_v: string) => {
    return _v === EnumSelectedFilter.calendar || _v === EnumSelectedFilter.user;
  };

  const onFinish = useCallback(
    (selectedQuery?: string) => {
      const error = handleError();
      if (error) return;

      const formSearchValue = formSearchRef.current?.getFieldsValue();

      let query: WorkShiftCellQuery = {
        ...formSearchValue,
        select_query: selectQuery,
      };

      if (formSearchValue.issued_date && formSearchValue.issued_date.length !== 0) {
        query.issued_date = formSearchValue.issued_date.map((p: any) => {
          const v = moment(p).format("YYYY-MM-DD");

          return v;
        });
      }

      if (selectedQuery && checkValueSelectQuery(selectedQuery)) {
        query.select_query = selectedQuery;
      }

      if (
        !selectQuery ||
        selectQuery === EnumSelectedFilter.calendar ||
        selectedQuery === EnumSelectedFilter.calendar
      )
        query.assigned_to = null;
      onFilter && onFilter(query);
    },
    [formSearchRef, handleError, onFilter, selectQuery],
  );

  // Tạo ngày bắt đầu và ngày kết thúc cho khoảng thời gian không được phép chọn

  const disabledDate = (current: any) => {
    const disabledStartDate = (startValue: any) => {
      if (!validStartDate) return false;
      const _validStartDate = moment(validStartDate).startOf("day");
      if (!startValue || !_validStartDate) {
        return false;
      }
      return startValue.valueOf() < _validStartDate;
    };

    const disabledEndDate = (endValue: any) => {
      if (!validEndDate) return false;
      const _validEndDate = moment(validEndDate).endOf("day");
      if (!endValue || !_validEndDate) {
        return false;
      }
      return endValue.valueOf() >= _validEndDate;
    };

    return disabledStartDate(current) || disabledEndDate(current);
  };

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
    if (initialValues.select_query && checkValueSelectQuery(initialValues.select_query))
      setSelectQuery(initialValues.select_query as EnumSelectedFilter);
  }, [formSearchRef, initialValues]);

  useEffect(() => {
    (async () => {
      const res = await WORK_SHIFT_LIST();
      setWorkShiftList(res);
    })();
  }, []);

  return (
    <StyledComponent>
      <div className="page-filter">
        <Row className="page-filter-content">
          <Form
            className="page-filter-form"
            onFinish={onFinish}
            // onValuesChange={onFinish}
            ref={formSearchRef}
            initialValues={initialValues}
          >
            <Row className="page-filter-content-left">
              <Col span={6}>
                <Form.Item name="issued_date">
                  <RangePicker
                    style={{ width: "100%" }}
                    placeholder={["Từ ngày", "Đến ngày"]}
                    disabledDate={(current) => disabledDate(current)}
                    format="DD/MM/YYYY"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="work_hour_name">
                  <CustomSelect
                    style={{ width: "100%" }}
                    showSearch
                    showArrow
                    allowClear
                    optionFilterProp="children"
                    placeholder="Chọn ca"
                  >
                    {workShiftList.map((value, index: number) => {
                      return (
                        <CustomSelect.Option key={index} value={value.name}>
                          {value.title}
                        </CustomSelect.Option>
                      );
                    })}
                  </CustomSelect>
                </Form.Item>
              </Col>
              <Col span={6} hidden={selectQuery === EnumSelectedFilter.calendar}>
                <Form.Item name="assigned_to">
                  <AccountCustomSearchSelect
                    placeholder="Tìm kiếm nhân viên"
                    dataToSelect={accountData}
                    setDataToSelect={setAccountData}
                    initDataToSelect={accounts}
                    // mode="multiple"
                    getPopupContainer={(trigger: any) => trigger.parentNode}
                    maxTagCount="responsive"
                  />
                </Form.Item>
              </Col>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Form.Item>
            </Row>
          </Form>

          <Row className="page-filter-content-right">
            <Tooltip placement="left" title={"Xem theo lịch"}>
              <Button
                icon={<CalendarOutlined />}
                type={selectQuery === EnumSelectedFilter.calendar ? "primary" : "default"}
                className={selectQuery !== EnumSelectedFilter.calendar ? "btn-calendar" : ""}
                onClick={() => {
                  setSelectQuery(EnumSelectedFilter.calendar);
                  onFinish(EnumSelectedFilter.calendar);
                }}
              ></Button>
            </Tooltip>
            <Tooltip placement="bottom" title={"Xem theo nhân viên"}>
              <Button
                icon={<UserOutlined />}
                type={selectQuery === EnumSelectedFilter.user ? "primary" : "default"}
                className="btn-user"
                onClick={() => {
                  setSelectQuery(EnumSelectedFilter.user);
                  onFinish(EnumSelectedFilter.user);
                }}
              ></Button>
            </Tooltip>
          </Row>
        </Row>
      </div>
    </StyledComponent>
  );
};

export default WorkShiftScheduleDetailFilter;
