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
import {createRef, useCallback, useMemo, useState} from "react";
import search from "assets/img/search.svg";
import {AccountResponse} from "model/account/account.model";
import {SettingOutlined, FilterOutlined} from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import {OrderSearchQuery} from "model/order/order.model";
import moment from "moment";
import BaseFilter from "component/filter/base.filter";
import {STATUS_INVENTORY_ADJUSTMENT_ARRAY} from "../../constants";
import {InventoryAdjustmentSearchQuery} from "model/inventoryadjustment";
import {StoreResponse} from "model/core/store.model";
import "./styles.scss";
import ButtonSetting from "component/table/ButtonSetting";

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
      created_by: Array.isArray(params.created_by)
        ? params.created_by
        : [params.created_by],
    };
  }, [params]);

  const [visible, setVisible] = useState(false);
  const [isFromCreatedDate, setIsFromCreatedDate] = useState(
    initialValues.from_created_date
      ? moment(initialValues.from_created_date, "DD-MM-YYYY")
      : null
  );
  const [isToCreatedDate, setIsToCreatedDate] = useState(
    initialValues.to_created_date
      ? moment(initialValues.to_created_date, "DD-MM-YYYY")
      : null
  );
  const [isFromInventoryAdjustmentDate, setIsFromInventoryAdjustmentDate] = useState(
    initialValues.from_inventoryadjustment_date
      ? moment(initialValues.from_inventoryadjustment_date, "DD-MM-YYYY")
      : null
  );
  const [isToInventoryAdjustmentDate, setIsToInventoryAdjustmentDate] = useState(
    initialValues.to_inventoryadjustment_date
      ? moment(initialValues.to_inventoryadjustment_date, "DD-MM-YYYY")
      : null
  );

  const loadingFilter = useMemo(() => {
    return isLoading ? true : false;
  }, [isLoading]);

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const onChangeRangeDate = useCallback((dates, dateString, type) => {
    switch (type) {
      case "create_date":
          setCreateDateClick("");
          setIsFromCreatedDate(dateString[0]);
          setIsToCreatedDate(dateString[1]);
        break;
        case "adjustment_date":
          setAdjustmentDateClick("");
          setIsFromInventoryAdjustmentDate(dateString[0]);
          setIsToInventoryAdjustmentDate(dateString[1]);
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
    setIsFromInventoryAdjustmentDate(null);
    setIsToInventoryAdjustmentDate(null);

    formSearchRef?.current?.setFieldsValue({
      condition: "",
      adjusted_store_id: '',
    })

    setVisible(false);
  }, [formSearchRef, onClearFilter]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const [createDateClick, setCreateDateClick] = useState("");
  const [adjustmentDateClick, setAdjustmentDateClick] = useState("");

  const clickOptionDate = useCallback(
    (type, value) => {
      let minValue = null;
      let maxValue = null;

      switch (value) {
        case "today":
          minValue = moment().startOf("day").format("DD-MM-YYYY");
          maxValue = moment().endOf("day").format("DD-MM-YYYY");
          break;
        case "yesterday":
          minValue = moment().startOf("day").subtract(1, "days").format("DD-MM-YYYY");
          maxValue = moment().endOf("day").subtract(1, "days").format("DD-MM-YYYY");
          break;
        case "thisweek":
          minValue = moment().startOf("week").format("DD-MM-YYYY");
          maxValue = moment().endOf("week").format("DD-MM-YYYY");
          break;
        case "lastweek":
          minValue = moment().startOf("week").subtract(1, "weeks").format("DD-MM-YYYY");
          maxValue = moment().endOf("week").subtract(1, "weeks").format("DD-MM-YYYY");
          break;
        case "thismonth":
          minValue = moment().startOf("month").format("DD-MM-YYYY");
          maxValue = moment().endOf("month").format("DD-MM-YYYY");
          break;
        case "lastmonth":
          minValue = moment().startOf("month").subtract(1, "months").format("DD-MM-YYYY");
          maxValue = moment().endOf("month").subtract(1, "months").format("DD-MM-YYYY");
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
            setIsFromCreatedDate(moment(minValue, "DD-MM-YYYY"));
            setIsToCreatedDate(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        case "audited_date":
          if (adjustmentDateClick === value) {
            setAdjustmentDateClick("");
            setIsFromInventoryAdjustmentDate(null);
            setIsToInventoryAdjustmentDate(null);
          } else {
            setAdjustmentDateClick(value);
            setIsFromInventoryAdjustmentDate(moment(minValue, "DD-MM-YYYY"));
            setIsToInventoryAdjustmentDate(moment(maxValue, "DD-MM-YYYY"));
          }
          break;
        default:
          break;
      }
    },
    [createDateClick, adjustmentDateClick]
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
        case "created_by":
          onFilter && onFilter({...params, created_by: []});
          break;
        case "created_date":
          setCreateDateClick("");
          setIsFromCreatedDate(null);
          setIsToCreatedDate(null);
          onFilter &&
            onFilter({...params, form_created_date: null, to_created_date: null});
          break;
        case "audited_date":
          setAdjustmentDateClick("");
          setIsFromInventoryAdjustmentDate(null);
          setIsToInventoryAdjustmentDate(null);
          onFilter &&
            onFilter({
              ...params,
              from_inventory_adjustment_date: null,
              to_inventory_adjustment_date: null,
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
        from_created_date: isFromCreatedDate
          ? moment(isFromCreatedDate, "DD-MM-YYYY")?.format("DD-MM-YYYY")
          : null,
        to_created_date: isToCreatedDate
          ? moment(isToCreatedDate, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
        from_inventory_adjustment_date: isFromInventoryAdjustmentDate
          ? moment(isFromInventoryAdjustmentDate, "DD-MM-YYYY")?.format("DD-MM-YYYY")
          : null,
        to_inventory_adjustment_date: isToInventoryAdjustmentDate
          ? moment(isToInventoryAdjustmentDate, "DD-MM-YYYY").format("DD-MM-YYYY")
          : null,
      };
      onFilter && onFilter(valuesForm);
    },
    [
      isFromCreatedDate,
      isFromInventoryAdjustmentDate,
      isToInventoryAdjustmentDate,
      isToCreatedDate,
      onFilter,
    ]
  );

  let filters = useMemo(() => {
    let list = [];
    if (initialValues.status.length) {
      let textStatus = "";
      initialValues.status.forEach((statusValue) => {
        const status = STATUS_INVENTORY_ADJUSTMENT_ARRAY?.find(
          (status) => status.value === statusValue
        );
        textStatus = status ? textStatus + status.name + ";" : textStatus;
      });
      list.push({
        key: "status",
        name: "Trạng thái",
        value: textStatus,
      });
    }
    if (initialValues.from_total_variant || initialValues.to_total_variant) {
      let textTotalVariant =
        (initialValues.from_total_variant ? initialValues.from_total_variant : " ?? ") +
        " ~ " +
        (initialValues.to_total_variant ? initialValues.to_total_variant : " ?? ");
      list.push({
        key: "total_variant",
        name: "Sản phẩm",
        value: textTotalVariant,
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
    if (initialValues.created_by.length) {
      let textAccount = "";
      initialValues.created_by.forEach((i) => {
        const findAccount = accounts?.find((item) => item.code === i);
        textAccount = findAccount
          ? textAccount + findAccount.full_name + " - " + findAccount.code + "; "
          : textAccount;
      });
      list.push({
        key: "created_by",
        name: "Người tạo",
        value: textAccount,
      });
    }
    if (initialValues.from_created_date || initialValues.to_created_date) {
      let textCreatedDate =
        (initialValues.from_created_date ? initialValues.from_created_date : "??") +
        " ~ " +
        (initialValues.to_created_date ? initialValues.to_created_date : "??");
      list.push({
        key: "created_date",
        name: "Ngày tạo",
        value: textCreatedDate,
      });
    }
    if (
      initialValues.from_inventoryadjustment_date ||
      initialValues.to_inventoryadjustment_date
    ) {
      let textInventoryAdjustmentDate =
        (initialValues.from_inventoryadjustment_date
          ? initialValues.from_inventoryadjustment_date
          : "??") +
        " ~ " +
        (initialValues.to_inventoryadjustment_date
          ? initialValues.to_inventoryadjustment_date
          : "??");
      list.push({
        key: "audited_date",
        name: "Ngày kiểm",
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
              placeholder="Chọn kho kiểm"
              showArrow
              showSearch
              optionFilterProp="children"
            >
              <Option value={""}>Chọn kho kiểm</Option>
              {Array.isArray(stores) &&
                stores.length > 0 &&
                stores.map((item, index) => (
                  <Option key={"adjusted_store_id" + index} value={item.id.toString()}>
                    {item.name}
                  </Option>
                ))}
            </CustomSelect>
          </Item>
          <Item style={{flex: 1}} name="condition" className="input-search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo ID phiếu kiểm, tên kho kiểm,..."
              onBlur={(e) => {
                formSearchRef?.current?.setFieldsValue({
                  condition: e.target.value.trim(),
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
                    <Collapse defaultActiveKey={initialValues.status.length ? ["1"] : []}>
                      <Panel header="Trạng thái" key="1" className="header-filter">
                        <Item name="status" style={{margin: "10px 0px"}}>
                          <CustomSelect
                            mode="multiple"
                            style={{width: "100%"}}
                            showArrow
                            placeholder="Chọn trạng thái"
                            notFoundContent="Không tìm thấy kết quả"
                            optionFilterProp="children"
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
                      defaultActiveKey={initialValues.created_by.length ? ["1"] : []}
                    >
                      <Panel header="Người tạo" key="1" className="header-filter">
                        <Item name="created_by">
                          <Select
                            mode="multiple"
                            showSearch
                            placeholder="Chọn người tạo"
                            notFoundContent="Không tìm thấy kết quả"
                            style={{width: "100%"}}
                            optionFilterProp="children"
                            getPopupContainer={(trigger) => trigger.parentNode}
                          >
                            {accounts.map((item, index) => (
                              <Option
                                style={{width: "100%"}}
                                key={index.toString()}
                                value={item.code.toString()}
                              >
                                {`${item.full_name} - ${item.code}`}
                              </Option>
                            ))}
                          </Select>
                        </Item>
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
                          format="DD-MM-YYYY"
                          style={{width: "100%"}}
                          value={[
                            isFromCreatedDate
                              ? moment(isFromCreatedDate, "DD-MM-YYYY")
                              : null,
                            isToCreatedDate
                              ? moment(isToCreatedDate, "DD-MM-YYYY")
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
                      defaultActiveKey={
                        initialValues.from_inventoryadjustment_date &&
                        initialValues.to_inventoryadjustment_date
                          ? ["1"]
                          : []
                      }
                    >
                      <Panel header="Ngày kiểm" key="1" className="header-filter">
                        <div className="date-option">
                          <Button
                            onClick={() => clickOptionDate("audited_date", "yesterday")}
                            className={
                              adjustmentDateClick === "yesterday" ? "active" : "deactive"
                            }
                          >
                            Hôm qua
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("audited_date", "today")}
                            className={
                              adjustmentDateClick === "today" ? "active" : "deactive"
                            }
                          >
                            Hôm nay
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("audited_date", "thisweek")}
                            className={
                              adjustmentDateClick === "thisweek" ? "active" : "deactive"
                            }
                          >
                            Tuần này
                          </Button>
                        </div>
                        <div className="date-option">
                          <Button
                            onClick={() =>
                              clickOptionDate(
                                "inventoryaudited_dateadjustment_date",
                                "lastweek"
                              )
                            }
                            className={
                              adjustmentDateClick === "lastweek" ? "active" : "deactive"
                            }
                          >
                            Tuần trước
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("audited_date", "thismonth")}
                            className={
                              adjustmentDateClick === "thismonth" ? "active" : "deactive"
                            }
                          >
                            Tháng này
                          </Button>
                          <Button
                            onClick={() => clickOptionDate("audited_date", "lastmonth")}
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
                          format="DD-MM-YYYY"
                          style={{width: "100%"}}
                          value={[
                            isFromInventoryAdjustmentDate
                              ? moment(isFromInventoryAdjustmentDate, "DD-MM-YYYY")
                              : null,
                            isToInventoryAdjustmentDate
                              ? moment(isToInventoryAdjustmentDate, "DD-MM-YYYY")
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
              </>
            </Form>
          )}
        </BaseFilter>
      </div>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index) => {
            return (
              <Tag className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </>
  );
};

export default InventoryAdjustmentFilters;
