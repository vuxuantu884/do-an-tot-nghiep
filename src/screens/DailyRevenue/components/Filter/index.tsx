import { Button, Col, Form, FormInstance, Input, Row, Select, Tag } from "antd";
import { MenuAction } from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import { StyledComponent } from "./style";
import search from "assets/img/search.svg";
import BaseFilter from "component/filter/base.filter";
import FilterArrayToString from "./filter-array-to-string";
import { FilterModel } from "./model";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import { RevenueSearchQuery } from "model/revenue";
import { StoreResponse } from "model/core/store.model";
import CustomSelect from "component/custom/select.custom";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import moment from "moment";
import { REVENUE_STATE } from "utils/Constants";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import { AccountResponse } from "model/account/account.model";
import { formatDateTimeOrderFilter } from "utils/OrderUtils";
import DiffNumberInputCustom from "../DiffNumberInputCustom";
import { FilterOutlined } from "@ant-design/icons";
import { filterNumberDiff } from "screens/DailyRevenue/helper";
import NumberInput from "component/custom/number-input.custom";

const dateFormat = DATE_FORMAT.DD_MM_YYYY;
const dateTimeFormat = DATE_FORMAT.DD_MM_YY_HHmmss;
const timeFormat = DATE_FORMAT.HH_mm;

type Props = {
  stores: StoreResponse[];
  accounts: AccountResponse[];
  params?: RevenueSearchQuery;
  actions?: MenuAction[];
  onFilter?: (values: any | Object) => void;
  onClearFilter?: () => void;
  menuActionClick: (id: number) => void;
};

type ListFilterTagTypes = {
  key: string;
  name: string;
  value: JSX.Element | string | null;
  isExpand?: boolean;
};

const DailyRevenueFilter: React.FC<Props> = (props: Props) => {
  const { params, onFilter, onClearFilter, stores, accounts, actions, menuActionClick } = props;
  const formSearchRef = createRef<FormInstance>();
  const formSearchExtendRef = createRef<FormInstance>();

  const [visible, setVisible] = useState(false);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);

  const initialValues = useMemo(() => {
    return {
      ...params,
      ids: params?.ids
        ? Array.isArray(params?.ids)
          ? params?.ids.map((i) => Number(i))
          : [Number(params?.ids)]
        : null,
      store_ids: Array.isArray(params?.store_ids)
        ? params?.store_ids.map((i) => Number(i))
        : [Number(params?.store_ids)],
      states: Array.isArray(params?.states) ? params?.states : [params?.states],
      created_at_min: params?.created_at_min ? moment(params?.created_at_min) : undefined,
      created_at_max: params?.created_at_max ? moment(params?.created_at_max) : undefined,

      update_at_min: formatDateFilter(params?.update_at_min || undefined),
      update_at_max: formatDateFilter(params?.update_at_max || undefined),

      opened_at_min: formatDateFilter(params?.opened_at_min || undefined),
      opened_at_max: formatDateFilter(params?.opened_at_max || undefined),

      closed_at_min: formatDateFilter(params?.closed_at_min || undefined),
      closed_at_max: formatDateFilter(params?.closed_at_max || undefined),

      opened_bys: params?.opened_bys
        ? Array.isArray(params?.opened_bys)
          ? params?.opened_bys
          : [params?.opened_bys]
        : undefined,
      closed_bys: params?.closed_bys
        ? Array.isArray(params?.closed_bys)
          ? params?.closed_bys
          : [params?.closed_bys]
        : undefined,
      remaining_amount_min: params?.remaining_amount_min || 0,
      remaining_amount_max: params?.remaining_amount_max || 0,

      other_cost_min: params?.other_cost_min || 0,
      other_cost_max: params?.other_cost_max || 0,

      other_payment_min: params?.other_payment_min || 0,
      other_payment_max: params?.other_payment_max || 0,

      total_payment_min: params?.total_payment_min || 0,
      total_payment_max: params?.total_payment_max || 0,
    };
  }, [params]);

  const filters: ListFilterTagTypes[] = useMemo(() => {
    let list: ListFilterTagTypes[] = [];
    if (initialValues?.store_ids && initialValues?.store_ids.length) {
      const storesCopy = stores.filter((p) =>
        initialValues?.store_ids?.some((single: number) => Number(single) === p.id),
      );
      const filterModel: FilterModel[] = storesCopy.map((p) => {
        return {
          id: p.id,
          code: p.code,
          value: (
            <>
              <Link to={`${UrlConfig.STORE}/${p.id}`} target="_blank">
                {p.name}
              </Link>
            </>
          ),
          path: undefined,
        };
      });
      list.push({
        key: "store_ids",
        name: "Cửa hàng",
        value: <FilterArrayToString data={filterModel} />,
      });
    }

    if (initialValues.ids && initialValues.ids.length) {
      list.push({
        key: "ids",
        name: "Id Phiếu",
        value: <>{initialValues.ids[0]}</>,
      });
    }

    if (initialValues.states && initialValues.states.length) {
      const stateSearch = REVENUE_STATE.filter((p) =>
        initialValues.states?.some((p1) => p1 === p.code),
      );
      const filterModelState: FilterModel[] = stateSearch.map((p) => {
        return {
          code: p.code,
          value: <>{p.name}</>,
          path: undefined,
        };
      });
      list.push({
        key: "states",
        name: "Trạng thái",
        value: <FilterArrayToString data={filterModelState} />,
      });
    }

    if (initialValues.created_at_min || initialValues.created_at_max) {
      let textDate =
        (initialValues.created_at_min
          ? moment(initialValues.created_at_min).format(dateFormat)
          : "??") +
        " ~ " +
        (initialValues.created_at_max
          ? moment(initialValues.created_at_max).format(dateFormat)
          : "??");
      list.push({
        key: "created_at",
        name: "Ngày tạo phiếu",
        value: <React.Fragment>{textDate}</React.Fragment>,
      });
    }

    if (initialValues.update_at_min || initialValues.update_at_max) {
      let textDate =
        (initialValues.update_at_min
          ? moment(initialValues.update_at_min).format(dateTimeFormat)
          : "??") +
        " ~ " +
        (initialValues.update_at_max
          ? moment(initialValues.update_at_max).format(dateTimeFormat)
          : "??");
      list.push({
        key: "update_at",
        name: "Ngày cập nhật",
        value: <React.Fragment>{textDate}</React.Fragment>,
      });
    }

    if (initialValues.opened_at_min || initialValues.opened_at_max) {
      let textDate =
        (initialValues.opened_at_min
          ? moment(initialValues.opened_at_min).format(dateTimeFormat)
          : "??") +
        " ~ " +
        (initialValues.opened_at_max
          ? moment(initialValues.opened_at_max).format(dateTimeFormat)
          : "??");
      list.push({
        key: "opened_at",
        name: "Ngày nộp tiền",
        value: <React.Fragment>{textDate}</React.Fragment>,
      });
    }

    if (initialValues.closed_at_min || initialValues.closed_at_max) {
      let textDate =
        (initialValues.closed_at_min
          ? moment(initialValues.closed_at_min).format(dateTimeFormat)
          : "??") +
        " ~ " +
        (initialValues.closed_at_max
          ? moment(initialValues.closed_at_max).format(dateTimeFormat)
          : "??");
      list.push({
        key: "closed_at",
        name: "Ngày xác nhận",
        value: <React.Fragment>{textDate}</React.Fragment>,
      });
    }

    if (initialValues.opened_bys && initialValues.opened_bys.length !== 0) {
      const openedBySearch = accountData.filter((p) =>
        initialValues.opened_bys?.some((p1) => p1 === p.code),
      );
      const filterModelState: FilterModel[] = openedBySearch.map((p) => {
        return {
          code: p.code,
          value: (
            <>
              <Link to={`${UrlConfig.ACCOUNTS}/${p.code}`} target="_blank">
                {p.code} - {p.full_name}
              </Link>
            </>
          ),
        };
      });
      list.push({
        key: "opened_bys",
        name: "Nhân viên tạo đơn",
        value: <FilterArrayToString data={filterModelState} />,
      });
    }

    if (initialValues.closed_bys && initialValues.closed_bys.length !== 0) {
      const openedBySearch = accountData.filter((p) =>
        initialValues.closed_bys?.some((p1) => p1 === p.code),
      );
      const filterModelState: FilterModel[] = openedBySearch.map((p) => {
        return {
          code: p.code,
          value: (
            <>
              <Link to={`${UrlConfig.ACCOUNTS}/${p.code}`} target="_blank">
                {p.code} - {p.full_name}
              </Link>
            </>
          ),
        };
      });
      list.push({
        key: "closed_bys",
        name: "Kế toán xác nhận",
        value: <FilterArrayToString data={filterModelState} />,
      });
    }

    if (initialValues.remaining_amount_min || initialValues.remaining_amount_max) {
      let item = filterNumberDiff(
        "Chênh lệch",
        "remaining_amount",
        "remaining_amount_min",
        "remaining_amount_max",
        initialValues,
      );
      list.push(item);
    }

    if (initialValues.other_cost_min || initialValues.other_cost_max) {
      let item = filterNumberDiff(
        "Chi phí",
        "other_cost",
        "other_cost_min",
        "other_cost_max",
        initialValues,
      );
      list.push(item);
    }

    if (initialValues.other_payment_min || initialValues.other_payment_max) {
      let item = filterNumberDiff(
        "Phụ thu",
        "other_payment",
        "other_payment_min",
        "other_payment_max",
        initialValues,
      );
      list.push(item);
    }

    if (initialValues.total_payment_min || initialValues.total_payment_max) {
      let item = filterNumberDiff(
        "Doanh thu",
        "total_payment",
        "total_payment_min",
        "total_payment_max",
        initialValues,
      );
      list.push(item);
    }
    return list;
  }, [accountData, initialValues, stores]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "store_ids":
          onFilter && onFilter({ ...params, store_ids: [] });
          break;
        case "ids":
          onFilter && onFilter({ ...params, ids: [] });
          break;
        case "states":
          onFilter && onFilter({ ...params, states: [] });
          break;
        case "date":
          onFilter && onFilter({ ...params, date: undefined });
          break;
        case "created_at":
          onFilter && onFilter({ ...params, created_at_min: undefined, created_at_max: undefined });
          break;
        case "update_at":
          onFilter && onFilter({ ...params, update_at_min: undefined, update_at_max: undefined });
          break;
        case "opened_at":
          onFilter && onFilter({ ...params, opened_at_min: undefined, opened_at_max: undefined });
          break;
        case "closed_at":
          onFilter && onFilter({ ...params, closed_at_min: undefined, closed_at_max: undefined });
          break;
        case "opened_bys":
          onFilter && onFilter({ ...params, opened_bys: [] });
          break;
        case "closed_bys":
          onFilter && onFilter({ ...params, closed_bys: [] });
          break;
        case "remaining_amount":
          onFilter &&
            onFilter({
              ...params,
              remaining_amount_min: undefined,
              remaining_amount_max: undefined,
            });
          break;
        case "other_cost":
          onFilter &&
            onFilter({
              ...params,
              other_cost_min: undefined,
              other_cost_max: undefined,
            });
          break;
        case "other_payment":
          onFilter &&
            onFilter({
              ...params,
              other_payment_min: undefined,
              other_payment_max: undefined,
            });
          break;
        case "total_payment":
          onFilter &&
            onFilter({
              ...params,
              total_payment_min: undefined,
              total_payment_max: undefined,
            });
          break;
        default:
          break;
      }
    },
    [onFilter, params],
  );

  const handleError = useCallback(() => {
    let error = false;
    formSearchExtendRef?.current
      ?.getFieldsError([
        "created_at_min",
        "created_at_max",
        "opened_at_min",
        "opened_at_max",
        "closed_at_min",
        "closed_at_max",
        "remaining_amount_min",
        "remaining_amount_max",
        "other_cost_min",
        "other_cost_max",
        "other_payment_min",
        "other_payment_max",
        "total_payment_min",
        "total_payment_max",
        "update_at_min",
        "update_at_max",
      ])
      .forEach((field) => {
        if (field.errors.length) {
          error = true;
        }
      });

    return error;
  }, [formSearchExtendRef]);

  const onFinish = useCallback(() => {
    const error = handleError();
    if (error) return;
    const formSearchValue = formSearchRef.current?.getFieldsValue();
    const formSearchExtendValue = formSearchExtendRef.current?.getFieldsValue();

    if (formSearchExtendValue) {
      formSearchExtendValue.created_at_min = formSearchExtendValue.created_at_min
        ? moment(formSearchExtendValue.created_at_min, DATE_FORMAT.DD_MM_YYYY).format(
            DATE_FORMAT.YYYY_MM_DD,
          )
        : undefined;
      formSearchExtendValue.created_at_max = formSearchExtendValue.created_at_max
        ? moment(formSearchExtendValue.created_at_max, DATE_FORMAT.DD_MM_YYYY).format(
            DATE_FORMAT.YYYY_MM_DD,
          )
        : undefined;

      formSearchExtendValue.update_at_min = formatDateTimeOrderFilter(
        formSearchExtendValue.update_at_min,
        dateTimeFormat,
      );
      formSearchExtendValue.update_at_max = formatDateTimeOrderFilter(
        formSearchExtendValue.update_at_max,
        dateTimeFormat,
      );

      formSearchExtendValue.opened_at_min = formatDateTimeOrderFilter(
        formSearchExtendValue.opened_at_min,
        dateTimeFormat,
      );
      formSearchExtendValue.opened_at_max = formatDateTimeOrderFilter(
        formSearchExtendValue.opened_at_max,
        dateTimeFormat,
      );
      formSearchExtendValue.closed_at_min = formatDateTimeOrderFilter(
        formSearchExtendValue.closed_at_min,
        dateTimeFormat,
      );
      formSearchExtendValue.closed_at_max = formatDateTimeOrderFilter(
        formSearchExtendValue.closed_at_max,
        dateTimeFormat,
      );

      formSearchExtendValue.remaining_amount_min =
        formSearchExtendValue?.remaining_amount_min || null;
      formSearchExtendValue.remaining_amount_max =
        formSearchExtendValue?.remaining_amount_max || null;

      formSearchExtendValue.other_cost_min = formSearchExtendValue?.other_cost_min || null;
      formSearchExtendValue.other_cost_max = formSearchExtendValue?.other_cost_max || null;

      formSearchExtendValue.other_payment_min = formSearchExtendValue?.other_payment_min || null;
      formSearchExtendValue.other_payment_max = formSearchExtendValue?.other_payment_max || null;

      formSearchExtendValue.total_payment_min = formSearchExtendValue?.total_payment_min || null;
      formSearchExtendValue.total_payment_max = formSearchExtendValue?.total_payment_max || null;
    }

    onFilter && onFilter({ ...formSearchValue, ...formSearchExtendValue });
    setVisible(false);
  }, [formSearchExtendRef, formSearchRef, handleError, onFilter]);

  const renderFilterTag = (filter: ListFilterTagTypes) => {
    if (filter.isExpand) {
      return;
    }
    return <React.Fragment>{filter.value}</React.Fragment>;
  };

  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setVisible(false);
  };

  const onCancelFilter = () => {
    setVisible(false);
  };

  const onFilterClick = useCallback(() => {
    formSearchExtendRef.current?.submit();
  }, [formSearchExtendRef]);

  useEffect(() => {
    formSearchRef.current?.setFieldsValue({
      ...initialValues,
    });
    formSearchExtendRef.current?.setFieldsValue({
      ...initialValues,
    });
  }, [formSearchExtendRef, formSearchRef, initialValues]);

  useEffect(() => {
    if (accounts) {
      setAccountData(accounts);
    }
  }, [accounts]);
  return (
    <React.Fragment>
      <StyledComponent>
        <CustomFilter menu={actions} onMenuClick={menuActionClick}>
          <Form
            layout="inline"
            ref={formSearchRef}
            initialValues={initialValues}
            onFinish={onFinish}
          >
            <div className="daily-revenue-filter">
              <Form.Item name="store_ids" style={{ width: "25%" }}>
                <CustomSelect
                  placeholder="Cửa hàng"
                  allowClear
                  showArrow
                  mode="multiple"
                  maxTagCount="responsive"
                  showSearch
                >
                  {stores.map((item) => (
                    <CustomSelect.Option key={item.id} value={item.id}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Form.Item>
              <Form.Item name="states" style={{ width: "25%" }}>
                <Select
                  placeholder="Trạng thái"
                  allowClear
                  showArrow
                  mode="multiple"
                  maxTagCount="responsive"
                  showSearch
                >
                  {REVENUE_STATE.map((p, index) => (
                    <Select.Option key={index} value={p.code}>
                      {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="ids" style={{ width: "25%" }}>
                <NumberInput placeholder="ID phiếu" prefix={<img src={search} alt="" />} min={0} />
              </Form.Item>

              <Button htmlType="submit" type="primary">
                Lọc
              </Button>
              <Button icon={<FilterOutlined />} onClick={() => setVisible(true)}>
                Thêm bộ lọc
              </Button>
              {/* <Button icon={<SettingOutlined className="btn-icon-center" />} onClick={() => {}} /> */}
            </div>
          </Form>
        </CustomFilter>
        <BaseFilter
          visible={visible}
          onClearFilter={() => clearFilter()}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          className="revenue-filter-drawer"
          width={1000}
        >
          <StyledComponent>
            <Form onFinish={onFinish} layout="vertical" ref={formSearchExtendRef}>
              <Row gutter={12} className="ant-form-item-custom">
                <Col span={12}>
                  <div className="ant-form-item-label">
                    <label>Ngày tạo phiếu</label>
                  </div>
                  <CustomFilterDatePicker
                    fieldNameFrom="created_at_min"
                    fieldNameTo="created_at_max"
                    activeButton={""}
                    setActiveButton={() => {}}
                    format={dateFormat}
                    formRef={formSearchExtendRef}
                  />
                </Col>
                <Col span={12}>
                  <div className="ant-form-item-label">
                    <label>Ngày cập nhật</label>
                  </div>
                  <CustomFilterDatePicker
                    fieldNameFrom="update_at_min"
                    fieldNameTo="update_at_max"
                    activeButton={""}
                    setActiveButton={() => {}}
                    format={dateTimeFormat}
                    formRef={formSearchExtendRef}
                    showTime={{ format: timeFormat }}
                  />
                </Col>
              </Row>

              <Row gutter={12} className="ant-form-item-custom">
                <Col span={12}>
                  <div className="ant-form-item-label">
                    <label>Ngày nộp tiền</label>
                  </div>
                  <CustomFilterDatePicker
                    fieldNameFrom="opened_at_min"
                    fieldNameTo="opened_at_max"
                    activeButton={""}
                    setActiveButton={() => {}}
                    format={dateTimeFormat}
                    formRef={formSearchExtendRef}
                    showTime={{ format: timeFormat }}
                  />
                </Col>
                <Col span={12}>
                  <div className="ant-form-item-label">
                    <label>Ngày xác nhận</label>
                  </div>
                  <CustomFilterDatePicker
                    fieldNameFrom="closed_at_min"
                    fieldNameTo="closed_at_max"
                    activeButton={""}
                    setActiveButton={() => {}}
                    format={dateTimeFormat}
                    formRef={formSearchExtendRef}
                    showTime={{ format: timeFormat }}
                  />
                </Col>
              </Row>

              <Row gutter={12} className="ant-form-item-custom">
                <Col span={12}>
                  <div className="ant-form-item-label">
                    <label>Chênh lệch</label>
                  </div>
                  <DiffNumberInputCustom
                    fieldNameFrom="remaining_amount_min"
                    fieldNameTo="remaining_amount_max"
                    formRef={formSearchExtendRef}
                  />
                </Col>
                <Col span={12}>
                  <div className="ant-form-item-label">
                    <label>Chi phí</label>
                  </div>
                  <DiffNumberInputCustom
                    fieldNameFrom="other_cost_min"
                    fieldNameTo="other_cost_max"
                    formRef={formSearchExtendRef}
                    min={0}
                  />
                </Col>
              </Row>
              <Row gutter={12} className="ant-form-item-custom">
                <Col span={12}>
                  <div className="ant-form-item-label">
                    <label>Phụ thu</label>
                  </div>
                  <DiffNumberInputCustom
                    fieldNameFrom="other_payment_min"
                    fieldNameTo="other_payment_max"
                    formRef={formSearchExtendRef}
                    min={0}
                  />
                </Col>
                <Col span={12}>
                  <div className="ant-form-item-label">
                    <label>Doanh thu</label>
                  </div>
                  <DiffNumberInputCustom
                    fieldNameFrom="total_payment_min"
                    fieldNameTo="total_payment_max"
                    formRef={formSearchExtendRef}
                    min={0}
                  />
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name="opened_bys" label="Nhân viên tạo đơn">
                    <AccountCustomSearchSelect
                      placeholder="Tìm theo họ tên hoặc mã nhân viên"
                      dataToSelect={accountData}
                      setDataToSelect={setAccountData}
                      initDataToSelect={accounts}
                      mode="multiple"
                      getPopupContainer={(trigger: any) => trigger.parentNode}
                      maxTagCount="responsive"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="closed_bys" label="Kế toán xác nhận">
                    <AccountCustomSearchSelect
                      placeholder="Tìm theo họ tên hoặc mã nhân viên"
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
            </Form>
          </StyledComponent>
        </BaseFilter>
        {filters && filters.length > 0 && (
          <div className="revenue-filter-tags">
            {filters.map((filter, index) => {
              return (
                <Tag key={index} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                  <span className="tagLabel 3">{filter.name}:</span> {renderFilterTag(filter)}
                </Tag>
              );
            })}
          </div>
        )}
      </StyledComponent>
    </React.Fragment>
  );
};

export default DailyRevenueFilter;
