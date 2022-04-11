import {
  Button,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Collapse,
  Tag,
  InputNumber,
} from "antd";

import {MenuAction} from "component/table/ActionButton";
import React, {createRef, useCallback, useMemo, useState} from "react";
import search from "assets/img/search.svg";
import {AccountResponse} from "model/account/account.model";
import {SettingOutlined, FilterOutlined} from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import {OrderSearchQuery} from "model/order/order.model";
import moment from "moment";
import BaseFilter from "component/filter/base.filter";
import {
  INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY,
  STATUS_INVENTORY_ADJUSTMENT_ARRAY,
} from "../../constants";
import {InventoryAdjustmentSearchQuery} from "model/inventoryadjustment";
import {StoreResponse} from "model/core/store.model";
import "./styles.scss";
import ButtonSetting from "component/table/ButtonSetting";
import {DATE_FORMAT} from "utils/DateUtils";
import {INVENTORY_AUDIT_TYPE_CONSTANTS} from "screens/inventory-adjustment/constants";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";

const {Panel} = Collapse;
type InventoryAdjustmentFilterProps = {
  params: InventoryAdjustmentSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: Boolean;
  accounts: Array<AccountResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  stores?: Array<StoreResponse>;
};

const {Item} = Form;
const {Option} = Select;

const InventoryAdjustmentFilters: React.FC<InventoryAdjustmentFilterProps> = (
  props: InventoryAdjustmentFilterProps
) => {
  const {
    params,
    isLoading,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
    stores,
    accounts,
  } = props;
  const initialValues = useMemo(() => {
    return {
      ...params,
      status: Array.isArray(params.status) ? params.status : [params.status],
      created_name: Array.isArray(params.created_name)
        ? params.created_name
        : [params.created_name],
    };
  }, [params]);

  const [visible, setVisible] = useState(false);
  const [isFromCreatedDate, setIsFromCreatedDate] = useState(
    initialValues.from_created_date
      ? moment(initialValues.from_created_date, DATE_FORMAT.DDMMYYY)
      : null
  );
  const [isToCreatedDate, setIsToCreatedDate] = useState(
    initialValues.to_created_date
      ? moment(initialValues.to_created_date, DATE_FORMAT.DDMMYYY)
      : null
  );
  const [isFromAuditedDate, setIsFromAuditedDate] = useState(
    initialValues.from_audited_date
      ? moment(initialValues.from_audited_date, DATE_FORMAT.DDMMYYY)
      : null
  );
  const [isToAuditedDate, setIsToAuditedDate] = useState(
    initialValues.to_audited_date
      ? moment(initialValues.to_audited_date, DATE_FORMAT.DDMMYYY)
      : null
  );
  const [isFromAdjustedBy, setIsFromAdjustedBy] = useState(
    initialValues.from_adjusted_date
      ? moment(initialValues.from_adjusted_date, DATE_FORMAT.DDMMYYY)
      : null
  );
  const [isToAdjustedBy, setIsToAdjustedBy] = useState(
    initialValues.to_adjusted_date
      ? moment(initialValues.to_adjusted_date, DATE_FORMAT.DDMMYYY)
      : null
  );

  const loadingFilter = useMemo(() => {
    return isLoading ? true : false;
  }, [isLoading]);

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const [createDateClick, setCreateDateClick] = useState("");
  const [auditedDateClick, setAuditedDateClickClick] = useState("");
  const [adjustmentDateClick, setAdjustmentDateClick] = useState("");

  const onChangeRangeDate = useCallback((dates, dateString, type) => {

    let fromDateString = null;
    let toDateString = null;

    if (dates) {
      fromDateString = dates[0].hours(0).minutes(0).seconds(0) ?? null;
      toDateString = dates[1].hours(23).minutes(59).seconds(59) ?? null;
    }
    switch (type) {
      case "create_date":
        setCreateDateClick("");
        setIsFromCreatedDate(fromDateString);
        setIsToCreatedDate(toDateString);
        break;
      case "adjusted_date":
        setAdjustmentDateClick("");
        setIsFromAdjustedBy(fromDateString);
        setIsToAdjustedBy(toDateString);
        break;
      case "audited_date":
        setAuditedDateClickClick("");
        setIsFromAuditedDate(fromDateString);
        setIsToAuditedDate(toDateString);
        break;
    }
  }, []);

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);

  const onClearFilterClick = useCallback(() => {
    onClearFilter && onClearFilter();

    setCreateDateClick("");
    setIsFromCreatedDate(null);
    setIsToCreatedDate(null);
    setAdjustmentDateClick("");
    setIsFromAdjustedBy(null);
    setIsToAdjustedBy(null);
    setAuditedDateClickClick("");
    setIsFromAuditedDate(null);
    setIsToAuditedDate(null);

    formSearchRef?.current?.setFieldsValue({
      code: "",
      adjusted_store_id: "",
    });

    setVisible(false);
  }, [formSearchRef, onClearFilter]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const clickOptionDate = useCallback(
    (type, value) => {
      let minValue = null;
      let maxValue = null;

      switch (value) {
        case "today":
          minValue = moment().startOf("day");
          maxValue = moment().endOf("day");
          break;
        case "yesterday":
          minValue = moment().startOf("day").subtract(1, "days");
          maxValue = moment().endOf("day").subtract(1, "days");
          break;
        case "thisweek":
          minValue = moment().startOf("week");
          maxValue = moment().endOf("week");
          break;
        case "lastweek":
          minValue = moment().startOf("week").subtract(1, "weeks");
          maxValue = moment().endOf("week").subtract(1, "weeks");
          break;
        case "thismonth":
          minValue = moment().startOf("month");
          maxValue = moment().endOf("month");
          break;
        case "lastmonth":
          minValue = moment().startOf("month").subtract(1, "months");
          maxValue = moment().endOf("month").subtract(1, "months");
          break;
        default:
          break;
      }

      switch (type) {
        case "create_date":
          if (createDateClick === value) {
            setCreateDateClick("");
            setIsFromCreatedDate(null);
            setIsToCreatedDate(null);
          } else {
            setCreateDateClick(value);
            setIsFromCreatedDate(moment(minValue, DATE_FORMAT.DDMMYYY));
            setIsToCreatedDate(moment(maxValue, DATE_FORMAT.DDMMYYY));
          }
          break;
        case "audited_date":
          if (auditedDateClick === value) {
            setAuditedDateClickClick("");
            setIsFromAuditedDate(null);
            setIsToAuditedDate(null);
          } else {
            setAuditedDateClickClick(value);
            setIsFromAuditedDate(moment(minValue, DATE_FORMAT.DDMMYYY));
            setIsToAuditedDate(moment(maxValue, DATE_FORMAT.DDMMYYY));
          }
          break;
        case "adjusted_date":
          if (adjustmentDateClick === value) {
            setAdjustmentDateClick("");
            setIsFromAdjustedBy(null);
            setIsToAdjustedBy(null);
          } else {
            setAdjustmentDateClick(value);
            setIsFromAdjustedBy(moment(minValue, DATE_FORMAT.DDMMYYY));
            setIsToAdjustedBy(moment(maxValue, DATE_FORMAT.DDMMYYY));
          }
          break;
        default:
          break;
      }
    },
    [createDateClick, auditedDateClick, adjustmentDateClick]
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "status":
          onFilter && onFilter({...params, status: []});
          break;
        case "total_variant":
          onFilter &&
            onFilter({...params, from_total_variant: null, to_total_variant: null});
          break;
        case "total_quantity":
          onFilter &&
            onFilter({...params, from_total_quantity: null, to_total_quantity: null});
          break;
        case "total_amount":
          onFilter &&
            onFilter({...params, from_total_amount: null, to_total_amount: null});
          break;
        case "created_name":
          onFilter && onFilter({...params, created_name: []});
          break;
        case "created_date":
          setCreateDateClick("");
          setIsFromCreatedDate(null);
          setIsToCreatedDate(null);
          onFilter &&
            onFilter({...params, from_created_date: null, to_created_date: null});
          break;
        case "audited_date":
          setAuditedDateClickClick("");
          setIsFromAuditedDate(null);
          setIsToAuditedDate(null);
          onFilter &&
            onFilter({
              ...params,
              from_audited_date: null,
              to_audited_date: null,
            });
          break;
        case "adjusted_date":
          setAdjustmentDateClick("");
          setIsFromAdjustedBy(null);
          setIsToAdjustedBy(null);
          onFilter &&
            onFilter({
              ...params,
              from_adjusted_date: null,
              to_adjusted_date: null,
            });
          break;
        default:
          break;
      }
    },
    [onFilter, params]
  );

  const onFinish = useCallback(
    (values) => {
      if (values?.from_total_variant > values?.to_total_variant) {
        values = {
          ...values,
          from_total_variant: values?.to_total_variant,
          to_total_variant: values?.from_total_variant,
        };
      }
      if (values?.from_total_quantity > values?.to_total_quantity) {
        values = {
          ...values,
          from_total_quantity: values?.to_total_quantity,
          to_total_quantity: values?.from_total_quantity,
        };
      }
      if (values?.from_total_amount > values?.to_total_amount) {
        values = {
          ...values,
          from_total_amount: values?.to_total_amount,
          to_total_amount: values?.from_total_amount,
        };
      }
      const valuesForm = {
        ...values,
        code: values.code ? values.code.trim() : null,
        from_created_date: isFromCreatedDate ? moment(isFromCreatedDate) : null,
        to_created_date: isToCreatedDate ? moment(isToCreatedDate) : null,
        from_adjusted_date: isFromAdjustedBy ? moment(isFromAdjustedBy) : null,
        to_adjusted_date: isToAdjustedBy ? moment(isToAdjustedBy) : null,
        from_audited_date: isFromAuditedDate ? moment(isFromAuditedDate) : null,
        to_audited_date: isToAuditedDate ? moment(isToAuditedDate) : null,
      };
      onFilter && onFilter(valuesForm);
    },
    [
      isFromCreatedDate,
      isToCreatedDate,
      isFromAdjustedBy,
      isToAdjustedBy,
      isFromAuditedDate,
      isToAuditedDate,
      onFilter,
    ]
  );

  let filters = useMemo(() => {
    let list = [];
    if (initialValues?.status?.length) {
      let textStatus = "";

      if (initialValues.status.length > 1) {

        initialValues.status.forEach((statusValue) => {
          const status = STATUS_INVENTORY_ADJUSTMENT_ARRAY?.find(
            (status) => status.value === statusValue
          );
          textStatus = status ? textStatus + status.name + "; " : textStatus;
        });

      } else if (initialValues.status.length === 1) {

        initialValues.status.forEach((statusValue) => {
          const status = STATUS_INVENTORY_ADJUSTMENT_ARRAY?.find(
            (status) => status.value === statusValue
          );
          textStatus = status ? textStatus + status.name : textStatus;
        });
      }

      list.push({
        key: "status",
        name: "Trạng thái",
        value: textStatus,
      });
    }
    if (initialValues?.audit_type?.length) {
      let auditTypeName = "";

      if (initialValues.audit_type.length > 1) {

        initialValues.audit_type.forEach((value) => {
          const auditType = INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY?.find(
            (auditType) => auditType.value === value
          );
          auditTypeName = auditType ? auditTypeName + auditType.name + "; " : auditTypeName;
        });

      } else if (initialValues.audit_type.length === 1) {

        initialValues.audit_type.forEach((value) => {
          const auditType = INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY?.find(
            (auditType) => auditType.value === value
          );
          auditTypeName = auditType ? auditTypeName + auditType.name : auditTypeName;
        });
      }

      list.push({
        key: "audit_type",
        name: "Loại kiểm",
        value: auditTypeName,
      });
    }
    if (initialValues.from_total_quantity || initialValues.to_total_quantity) {
      let textTotalQuantity =
        (initialValues.from_total_quantity ? initialValues.from_total_quantity : " ?? ") +
        " ~ " +
        (initialValues.to_total_quantity ? initialValues.to_total_quantity : " ?? ");
      list.push({
        key: "total_quantity",
        name: "Số lượng",
        value: textTotalQuantity,
      });
    }
    if (initialValues.created_name.length) {
      let textAccount = ""
      if (initialValues.created_name.length > 1) {
        initialValues.created_name.forEach((i) => {
          const findAccount = accounts?.find(item => item.code === i)
            textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
        })
      } else if (initialValues.created_name.length === 1) {

        initialValues.created_name.forEach((i) => {
          const findAccount = accounts?.find(item => item.code === i)
          textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code : textAccount
        })
      }
      list.push({
        key: 'created_name',
        name: 'Người tạo',
        value: textAccount
      })
    }
    if (initialValues.from_created_date || initialValues.to_created_date) {
      let textCreatedDate =
        (initialValues.from_created_date
          ? moment(initialValues.from_created_date).format("DD-MM-YYYY")
          : "??") +
        " ~ " +
        (initialValues.to_created_date
          ? moment(initialValues.to_created_date).format("DD-MM-YYYY")
          : "??");
      list.push({
        key: "created_date",
        name: "Ngày tạo",
        value: textCreatedDate,
      });
    }
    if (initialValues.from_audited_date || initialValues.to_audited_date) {
      let textInventoryAuditedDate =
        (initialValues.from_audited_date
          ? moment(initialValues.from_audited_date).format("DD-MM-YYYY")
          : "??") +
        " ~ " +
        (initialValues.to_audited_date
          ? moment(initialValues.to_audited_date).format("DD-MM-YYYY")
          : "??");
      list.push({
        key: "audited_date",
        name: "Ngày kiểm",
        value: textInventoryAuditedDate,
      });
    }

    if (initialValues.from_adjusted_date || initialValues.to_adjusted_date) {
      let textInventoryAdjustmentDate =
        (initialValues.from_adjusted_date
          ? moment(initialValues.from_adjusted_date).format("DD-MM-YYYY")
          : "??") +
        " ~ " +
        (initialValues.to_adjusted_date
          ? moment(initialValues.to_adjusted_date).format("DD-MM-YYYY")
          : "??");
      list.push({
        key: "adjusted_date",
        name: "Ngày cân bằng",
        value: textInventoryAdjustmentDate,
      });
    }

    return list;
  }, [initialValues, accounts]);

  return (
    <>
      <div className="adjustment-filter">
        <Form
          onFinish={onFinish}
          ref={formSearchRef}
          initialValues={initialValues}
          layout="inline"
        >
          <Item name="adjusted_store_id">
            <CustomSelect
              style={{
                width: 150,
              }}
              allowClear={true}
              placeholder="Chọn kho kiểm"
              showArrow
              showSearch
              optionFilterProp="children"
              onClear={() => formSearchRef?.current?.submit()}
            >
              {Array.isArray(stores) &&
                stores.length > 0 &&
                stores.map((item, index) => (
                  <Option key={"adjusted_store_id" + index} value={item.id.toString()}>
                    {item.name}
                  </Option>
                ))}
            </CustomSelect>
          </Item>
          <Item style={{flex: 1}} name="code" className="input-search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo mã phiếu kiểm"
              onBlur={(e) => {
                formSearchRef?.current?.setFieldsValue({
                  code: e.target.value.trim(),
                });
              }}
            />
          </Item>
          <Item>
            <Button type="primary" loading={loadingFilter} htmlType="submit">
              Lọc
            </Button>
          </Item>
          <Item>
            <Button icon={<FilterOutlined />} onClick={openFilter}>
              Thêm bộ lọc
            </Button>
          </Item>
          <ButtonSetting onClick={onShowColumnSetting} />
        </Form>

        <BaseFilter
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          width={500}
        >
          {visible && (
            <Form
              onFinish={onFinish}
              ref={formRef}
              initialValues={params}
              layout="vertical"
            >
              <>
                <Row gutter={12} style={{marginTop: "10px"}}>
                  <Col span={24}>
                    <Collapse
                      defaultActiveKey={initialValues?.status?.length ? ["1"] : []}
                    >
                      <Panel header="Trạng thái" key="1" className="header-filter">
                        <Item name="status" style={{margin: "10px 0px"}}>
                          <CustomSelect
                            mode="multiple"
                            showArrow
                            placeholder="Chọn trạng thái"
                            notFoundContent="Không tìm thấy kết quả"
                            optionFilterProp="children"
                            style={{width: "100%"}}
                            getPopupContainer={(trigger) => trigger.parentNode}
                          >
                            {STATUS_INVENTORY_ADJUSTMENT_ARRAY.map((item, index) => (
                              <CustomSelect.Option
                                style={{width: "100%"}}
                                key={index.toString()}
                                value={item.value}
                              >
                                {item.name}
                              </CustomSelect.Option>
                            ))}
                          </CustomSelect>
                        </Item>
                      </Panel>
                    </Collapse>
                  </Col>
                </Row>
                <Row gutter={12} style={{marginTop: "10px"}} className="price">
                  <Col span={24}>
                    <Collapse
                      defaultActiveKey={
                        initialValues.from_total_quantity ||
                        initialValues.to_total_quantity
                          ? ["1"]
                          : []
                      }
                    >
                      <Panel header="Số lượng" key="1" className="header-filter">
                        <Input.Group compact>
                          <Item
                            name="from_total_quantity"
                            style={{width: "45%", textAlign: "center"}}
                          >
                            <InputNumber
                              className="price_min"
                              placeholder="Từ"
                              min="0"
                              max="100000000"
                            />
                          </Item>

                          <Input
                            className="site-input-split"
                            style={{
                              width: "10%",
                              borderLeft: 0,
                              borderRight: 0,
                              pointerEvents: "none",
                            }}
                            placeholder="~"
                            readOnly
                          />
                          <Item
                            name="to_total_quantity"
                            style={{width: "45%", textAlign: "center"}}
                          >
                            <InputNumber
                              className="site-input-right price_max"
                              placeholder="Đến"
                              min="0"
                              max="1000000000"
                            />
                          </Item>
                        </Input.Group>
                      </Panel>
                    </Collapse>
                  </Col>
                </Row>
                <Row gutter={12} style={{marginTop: "10px"}}>
                  <Col span={24}>
                    <Collapse
                      defaultActiveKey={
                        initialValues.from_created_date && initialValues.to_created_date
                          ? ["1"]
                          : []
                      }
                    >
                      <Panel header="Ngày tạo" key="1" className="header-filter">
                        <div className="date-option">
                          <Button
                            onClick={() => clickOptionDate("create_date", "yesterday")}
                            className={
                              createDateClick === "yesterday" ? "active" : "deactive"
                            }
                          >
                            Hôm qua
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("create_date", "today")}
                            className={
                              createDateClick === "today" ? "active" : "deactive"
                            }
                          >
                            Hôm nay
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("create_date", "thisweek")}
                            className={
                              createDateClick === "thisweek" ? "active" : "deactive"
                            }
                          >
                            Tuần này
                          </Button>
                        </div>
                        <div className="date-option">
                          <Button
                            onClick={() => clickOptionDate("create_date", "lastweek")}
                            className={
                              createDateClick === "lastweek" ? "active" : "deactive"
                            }
                          >
                            Tuần trước
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("create_date", "thismonth")}
                            className={
                              createDateClick === "thismonth" ? "active" : "deactive"
                            }
                          >
                            Tháng này
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("create_date", "lastmonth")}
                            className={
                              createDateClick === "lastmonth" ? "active" : "deactive"
                            }
                          >
                            Tháng trước
                          </Button>
                        </div>
                        <p>
                          <SettingOutlined style={{marginRight: "10px"}} />
                          Tuỳ chọn khoảng thời gian:
                        </p>
                        <DatePicker.RangePicker
                          format={DATE_FORMAT.DDMMYYY}
                          style={{width: "100%"}}
                          value={[
                            isFromCreatedDate
                              ? moment(isFromCreatedDate, DATE_FORMAT.DDMMYYY)
                              : null,
                            isToCreatedDate
                              ? moment(isToCreatedDate, DATE_FORMAT.DDMMYYY)
                              : null,
                          ]}
                          onChange={(date, dateString) =>
                            onChangeRangeDate(date, dateString, "create_date")
                          }
                        />
                      </Panel>
                    </Collapse>
                  </Col>
                </Row>
                <Row gutter={12} style={{marginTop: "10px"}}>
                  <Col span={24}>
                    <Collapse
                      defaultActiveKey={initialValues?.created_name?.length ? ["1"] : []}
                    >
                      <Panel header="Người tạo" key="1" className="header-filter">
                        <Item name="created_name">
                          <AccountSearchPaging placeholder="Chọn người tạo" mode="multiple"/>
                        </Item>
                      </Panel>
                    </Collapse>
                  </Col>
                </Row>
                <Row gutter={12} style={{marginTop: "10px"}}>
                  <Col span={24}>
                    <Collapse
                      defaultActiveKey={
                        initialValues.from_audited_date && initialValues.to_audited_date
                          ? ["1"]
                          : []
                      }
                    >
                      <Panel header="Ngày kiểm" key="1" className="header-filter">
                        <div className="date-option">
                          <Button
                            onClick={() => clickOptionDate("audited_date", "yesterday")}
                            className={
                              auditedDateClick === "yesterday" ? "active" : "deactive"
                            }
                          >
                            Hôm qua
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("audited_date", "today")}
                            className={
                              auditedDateClick === "today" ? "active" : "deactive"
                            }
                          >
                            Hôm nay
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("audited_date", "thisweek")}
                            className={
                              auditedDateClick === "thisweek" ? "active" : "deactive"
                            }
                          >
                            Tuần này
                          </Button>
                        </div>
                        <div className="date-option">
                          <Button
                            onClick={() => clickOptionDate("audited_date", "lastweek")}
                            className={
                              auditedDateClick === "lastweek" ? "active" : "deactive"
                            }
                          >
                            Tuần trước
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("audited_date", "thismonth")}
                            className={
                              auditedDateClick === "thismonth" ? "active" : "deactive"
                            }
                          >
                            Tháng này
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("audited_date", "lastmonth")}
                            className={
                              auditedDateClick === "lastmonth" ? "active" : "deactive"
                            }
                          >
                            Tháng trước
                          </Button>
                        </div>
                        <p>
                          <SettingOutlined style={{marginRight: "10px"}} />
                          Tuỳ chọn khoảng thời gian:
                        </p>
                        <DatePicker.RangePicker
                          format={DATE_FORMAT.DDMMYYY}
                          style={{width: "100%"}}
                          value={[
                            isFromAuditedDate
                              ? moment(isFromAuditedDate, DATE_FORMAT.DDMMYYY)
                              : null,
                            isToAuditedDate
                              ? moment(isToAuditedDate, DATE_FORMAT.DDMMYYY)
                              : null,
                          ]}
                          onChange={(date, dateString) =>
                            onChangeRangeDate(date, dateString, "audited_date")
                          }
                        />
                      </Panel>
                    </Collapse>
                  </Col>
                </Row>
                <Row gutter={12} style={{marginTop: "10px"}}>
                  <Col span={24}>
                    <Collapse
                      defaultActiveKey={
                        initialValues.from_adjusted_date && initialValues.to_adjusted_date
                          ? ["1"]
                          : []
                      }
                    >
                      <Panel header="Ngày cân bằng" key="1" className="header-filter">
                        <div className="date-option">
                          <Button
                            onClick={() => clickOptionDate("adjusted_date", "yesterday")}
                            className={
                              adjustmentDateClick === "yesterday" ? "active" : "deactive"
                            }
                          >
                            Hôm qua
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("adjusted_date", "today")}
                            className={
                              adjustmentDateClick === "today" ? "active" : "deactive"
                            }
                          >
                            Hôm nay
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("adjusted_date", "thisweek")}
                            className={
                              adjustmentDateClick === "thisweek" ? "active" : "deactive"
                            }
                          >
                            Tuần này
                          </Button>
                        </div>
                        <div className="date-option">
                          <Button
                            onClick={() => clickOptionDate("adjusted_date", "lastweek")}
                            className={
                              adjustmentDateClick === "lastweek" ? "active" : "deactive"
                            }
                          >
                            Tuần trước
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("adjusted_date", "thismonth")}
                            className={
                              adjustmentDateClick === "thismonth" ? "active" : "deactive"
                            }
                          >
                            Tháng này
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("adjusted_date", "lastmonth")}
                            className={
                              adjustmentDateClick === "lastmonth" ? "active" : "deactive"
                            }
                          >
                            Tháng trước
                          </Button>
                        </div>
                        <p>
                          <SettingOutlined style={{marginRight: "10px"}} />
                          Tuỳ chọn khoảng thời gian:
                        </p>
                        <DatePicker.RangePicker
                          format={DATE_FORMAT.DDMMYYY}
                          style={{width: "100%"}}
                          value={[
                            isFromAdjustedBy
                              ? moment(isFromAdjustedBy, DATE_FORMAT.DDMMYYY)
                              : null,
                            isToAdjustedBy
                              ? moment(isToAdjustedBy, DATE_FORMAT.DDMMYYY)
                              : null,
                          ]}
                          onChange={(date, dateString) =>
                            onChangeRangeDate(date, dateString, "adjusted_date")
                          }
                        />
                      </Panel>
                    </Collapse>
                  </Col>
                </Row>
                <Row gutter={12} style={{marginTop: "10px"}}>
                  <Col span={24}>
                    <Collapse
                      defaultActiveKey={initialValues?.audit_type?.length ? ["1"] : []}
                    >
                      <Panel header="Loại kiểm kho" key="1" className="header-filter">
                        <Item name="audit_type" style={{margin: "10px 0px"}}>
                          <CustomSelect
                            mode="multiple"
                            showSearch
                            showArrow
                            maxTagCount="responsive"
                            placeholder="Chọn loại kiểm kho"
                            notFoundContent="Không tìm thấy kết quả"
                            optionFilterProp="children"
                            style={{width: "100%"}}
                            getPopupContainer={(trigger) => trigger.parentNode}
                          >
                            {INVENTORY_ADJUSTMENT_AUDIT_TYPE_ARRAY.map((item, index) => {
                              if (item.value === INVENTORY_AUDIT_TYPE_CONSTANTS.PARTLY) {
                                return (
                                  <CustomSelect.Option
                                    style={{width: "100%"}}
                                    key={index.toString()}
                                    value={item.value}
                                  >
                                    {item.name}
                                  </CustomSelect.Option>
                                );
                              } else {
                                return null;
                              }
                            })}
                          </CustomSelect>
                        </Item>
                      </Panel>
                    </Collapse>
                  </Col>
                </Row>
              </>
            </Form>
          )}
        </BaseFilter>
      </div>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index) => {
            return (
              <Tag style={{ marginBottom: 20 }} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </>
  );
};

export default InventoryAdjustmentFilters;
