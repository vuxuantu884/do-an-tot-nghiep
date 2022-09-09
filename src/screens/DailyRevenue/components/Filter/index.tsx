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
import { formatCurrency } from "utils/AppUtils";

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
  value: JSX.Element | null;
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

    if (initialValues.opened_at_min || initialValues.opened_at_max) {
      let textDate =
        (initialValues.opened_at_min
          ? moment(initialValues.opened_at_min).format(dateFormat)
          : "??") +
        " ~ " +
        (initialValues.opened_at_max
          ? moment(initialValues.opened_at_max).format(dateFormat)
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
          ? moment(initialValues.closed_at_min).format(dateFormat)
          : "??") +
        " ~ " +
        (initialValues.closed_at_max
          ? moment(initialValues.closed_at_max).format(dateFormat)
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
      let textRemaining =
        (initialValues.remaining_amount_min
          ? formatCurrency(initialValues.remaining_amount_min)
          : "??") +
        " ~ " +
        (initialValues.remaining_amount_max
          ? formatCurrency(initialValues.remaining_amount_max)
          : "??");
      list.push({
        key: "remaining_amount",
        name: "Chênh lệch",
        value: <React.Fragment>{textRemaining}</React.Fragment>,
      });
    }

    return list;
  }, [
    accountData,
    initialValues.closed_at_max,
    initialValues.closed_at_min,
    initialValues.closed_bys,
    initialValues.created_at_max,
    initialValues.created_at_min,
    initialValues.ids,
    initialValues.opened_at_max,
    initialValues.opened_at_min,
    initialValues.opened_bys,
    initialValues.remaining_amount_max,
    initialValues.remaining_amount_min,
    initialValues.states,
    initialValues?.store_ids,
    stores,
  ]);

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
        "remaining_amount_max"
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
    console.log(formSearchValue);
    console.log(formSearchExtendValue);
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
                <Input placeholder="ID phiếu" prefix={<img src={search} alt="" />} />
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
          width={400}
        >
          <StyledComponent>
            <Form onFinish={onFinish} layout="vertical" ref={formSearchExtendRef}>
              <Row gutter={12} className="ant-form-item-custom">
                <Col span={24}>
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
              </Row>

              <Row gutter={12} className="ant-form-item-custom">
                <Col span={24}>
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
              </Row>

              <Row gutter={12} className="ant-form-item-custom">
                <Col span={24}>
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

              <Row gutter={24} className="ant-form-item-custom">
                <Col span={24}>
                  <div className="ant-form-item-label">
                    <label>Chênh lệch</label>
                  </div>
                  <DiffNumberInputCustom
                    fieldNameFrom="remaining_amount_min"
                    fieldNameTo="remaining_amount_max"
                    formRef={formSearchExtendRef}
                  />
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
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
              </Row>
              <Row gutter={24}>
                <Col span={24}>
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
