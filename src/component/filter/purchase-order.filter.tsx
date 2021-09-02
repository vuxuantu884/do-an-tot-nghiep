import { Button, Form, Input, Collapse, Tag, Space } from "antd";

import { MenuAction } from "component/table/ActionButton";
import { useCallback, useLayoutEffect, useState, useEffect } from "react";
import moment from "moment";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import CustomFilter from "component/table/custom.filter";
import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import CustomRangepicker from "component/filter/component/range-picker.custom";
import CustomSelect from "component/custom/select.custom";
import { AccountResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { POStatus, ProcumentStatus, PoPaymentStatus } from "utils/Constants";
import { DATE_FORMAT, getDateFromNow } from "utils/DateUtils";
import { FilterOutlined } from "@ant-design/icons";
import HashTag from "component/custom/hashtag";
import CustomSelectOne from "./component/select-one.custom";
import CustomSelectMany from "./component/select-many.custom";

const { Panel } = Collapse;
const { Item } = Form;

type PurchaseOrderFilterProps = {
  params: PurchaseOrderQuery;
  listSupplierAccount?: Array<AccountResponse>;
  listRdAccount?: Array<AccountResponse>;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: PurchaseOrderQuery) => void;
  onClearFilter?: () => void;
};

const listPOStatus = {
  [POStatus.DRAFT]: "Đặt hàng",
  [POStatus.FINALIZED]: "Đã xác nhận",
  [POStatus.COMPLETED]: "Đã hoàn thành",
  [POStatus.FINISHED]: "Đã kết thúc",
  [POStatus.CANCELLED]: "Đã hủy",
};
const listProcumentStatus = {
  [ProcumentStatus.NOT_RECEIVED]: "Chưa nhận hàng",
  [ProcumentStatus.PARTIAL_RECEIVED]: "Nhận hàng 1 phần",
  [ProcumentStatus.RECEIVED]: "Đã nhận hàng",
};
const listPaymentStatus = {
  [PoPaymentStatus.UNPAID]: "Chưa thanh toán",
  [PoPaymentStatus.PARTIAL_PAID]: "Thanh toán 1 phần",
  [PoPaymentStatus.PAID]: "Đã thanh toán",
};

const filterFields = {
  order_date: "order_date",
  activated_date: "activated_date",
  completed_date: "completed_date",
  cancelled_date: "cancelled_date",
  status: "status",
  receive_status: "receive_status",
  financial_status: "financial_status",
  merchandiser: "merchandiser",
  qc: "qc",
  // cost_included: "cost_included",
  tax_included: "tax_included",
  expected_import_date: "expected_import_date",
  expected_store: "expected_store",
  note: "note",
  supplier_note: "supplier_note",
  tags: "tags",
  reference: "reference",
};

const allStatus: any = {
  [filterFields.status]: listPOStatus,
  [filterFields.receive_status]: listProcumentStatus,
  [filterFields.financial_status]: listPaymentStatus,
};

const filterFieldsMapping: any = {
  [filterFields.order_date]: "Ngày tạo đơn",
  [filterFields.activated_date]: "Ngày duyệt đơn",
  [filterFields.completed_date]: "Ngày hoàn tất đơn",
  [filterFields.cancelled_date]: "Ngày hủy đơn",
  [filterFields.status]: "Trạng thái đơn",
  [filterFields.receive_status]: "Nhập kho",
  [filterFields.financial_status]: "Thanh toán",
  [filterFields.merchandiser]: "Merchandiser",
  [filterFields.qc]: "QC",
  // [filterFields.cost_included]: "Chi phí",
  [filterFields.tax_included]: "VAT",
  [filterFields.expected_import_date]: "Ngày nhận hàng dự kiến",
  [filterFields.expected_store]: "Kho nhận hàng dự kiến",
  [filterFields.note]: "Ghi chú nội bộ",
  [filterFields.supplier_note]: "Ghi chú nhà cung cấp",
  [filterFields.tags]: "Tag",
  [filterFields.reference]: "Mã tham chiếu",
};

type FilterHeaderProps = {
  title?: string;
};
const FilterHeader = ({ title }: FilterHeaderProps) => {
  return <span>{title?.toUpperCase()}</span>;
};

const checkFixedDate = (from: any, to: any) => {
  let fixedDate = null;
  let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY);
  let formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
  type CheckDateType = {
    distance: number;
    unit: "day" | "week" | "month";
    display: any;
  };

  let checkDates: Array<CheckDateType> = [
    {
      distance: 0,
      unit: "day",
      display: "Hôm nay",
    },
    {
      distance: 1,
      unit: "day",
      display: "Hôm qua",
    },
    {
      distance: 0,
      unit: "week",
      display: "Tuần này",
    },
    {
      distance: 1,
      unit: "week",
      display: "Tuần trước",
    },
    {
      distance: 0,
      unit: "month",
      display: "Tháng này",
    },
    {
      distance: 1,
      unit: "month",
      display: "Tháng trước",
    },
  ];
  for (let i = 0; i < checkDates.length; i++) {
    const checkDate = checkDates[i],
      { distance, unit, display } = checkDate;
    let searchUnit: any = unit;
    if (searchUnit === "week") searchUnit = "isoWeek";

    let dateFrom = getDateFromNow(distance, unit),
      dateTo = getDateFromNow(distance, unit);
    if (
      from === dateFrom.startOf(searchUnit).utc().format() &&
      to === dateTo.endOf(searchUnit).utc().format()
    ) {
      if (unit === "day") fixedDate = `${display} (${formatedFrom})`;
      else fixedDate = `${display} (${formatedFrom} - ${formatedTo})`;
      return fixedDate;
    }
  }
};
const FilterList = ({ filters, resetField }: any) => {
  let filtersKeys = Object.keys(filters);
  let renderTxt = null;
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return null;
        if (!filterFieldsMapping[filterKey]) return null;
        switch (filterKey) {
          case filterFields.order_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.cancelled_date:
          case filterFields.expected_import_date:
            let [from, to] = value;
            let formatedFrom = moment(from).format(DATE_FORMAT.DDMMYYY),
              formatedTo = moment(to).format(DATE_FORMAT.DDMMYYY);
            let fixedDate = checkFixedDate(from, to);
            if (fixedDate)
              renderTxt = `${filterFieldsMapping[filterKey]} : ${fixedDate}`;
            else
              renderTxt = `${filterFieldsMapping[filterKey]} : ${formatedFrom} - ${formatedTo}`;
            break;
          case filterFields.status:
          case filterFields.receive_status:
          case filterFields.financial_status:
            let listStatus = allStatus[filterKey];
            if (!(value instanceof Array)) value = [value];
            let listStatusValue = value?.map((key: string) => {
              return listStatus[key];
            });
            renderTxt = `${filterFieldsMapping[filterKey]} : ${listStatusValue}`;
            break;
          // case filterFields.cost_included:
          //   let costTxt = "Có chi phí";
          //   if (value === "false") costTxt = "Không chi phí";
          //   renderTxt = `${filterFieldsMapping[filterKey]} : ${costTxt}`;
          //   break;
          case filterFields.tax_included:
            let taxTxt = "Có VAT";
            if (value === "false") taxTxt = "Không VAT";
            renderTxt = `${filterFieldsMapping[filterKey]} : ${taxTxt}`;
            break;
          default:
            renderTxt = `${filterFieldsMapping[filterKey]} : ${value}`;
        }
        return (
          <Tag
            onClose={() => resetField(filterKey)}
            key={filterKey}
            className="fade"
            closable
          >{`${renderTxt}`}</Tag>
        );
      })}
    </Space>
  );
};

function tagRender(props: any) {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      className="primary-bg"
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
    >
      {label}
    </Tag>
  );
}

type AdvanceFormItemProps = {
  listSupplierAccount: PurchaseOrderFilterProps["listSupplierAccount"];
  listRdAccount: PurchaseOrderFilterProps["listRdAccount"];
  listStore: PurchaseOrderFilterProps["listStore"];
  tempAdvanceFilters: any;
};

const AdvanceFormItems = ({
  listSupplierAccount,
  listRdAccount,
  listStore,
  tempAdvanceFilters,
}: AdvanceFormItemProps) => {
  return (
    <Space className="po-filter" direction="vertical" style={{ width: "100%" }}>
      {Object.keys(filterFields).map((field) => {
        let collapseChildren = null;
        switch (field) {
          case filterFields.order_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.cancelled_date:
          case filterFields.expected_import_date:
            collapseChildren = <CustomRangepicker />;
            break;
          case filterFields.status:
            collapseChildren = (
              <CustomSelect
                showArrow
                placeholder="Chọn 1 hoặc nhiều trạng thái"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                notFoundContent="Không tìm thấy kết quả"
                style={{
                  width: "100%",
                }}
                maxTagCount="responsive"
              >
                {Object.keys(listPOStatus)?.map((key) => (
                  <CustomSelect.Option key={key} value={key}>
                    {listPOStatus[key]}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            );
            break;
          case filterFields.receive_status:
            collapseChildren = (
              // <CustomSelect
              //   showArrow
              //   placeholder="Chọn 1 hoặc nhiều trạng thái"
              //   mode="multiple"
              //   allowClear
              //   tagRender={tagRender}
              //   notFoundContent="Không tìm thấy kết quả"
              //   style={{
              //     width: "100%",
              //   }}
              //   maxTagCount="responsive"
              // >
              //   {Object.keys(listProcumentStatus)?.map((key) => (
              //     <CustomSelect.Option key={key} value={key}>
              //       {listProcumentStatus[key]}
              //     </CustomSelect.Option>
              //   ))}
              // </CustomSelect>
              <CustomSelectMany span={8} data={listProcumentStatus} />
            );
            break;
          case filterFields.financial_status:
            collapseChildren = (
              // <CustomSelect
              //   showArrow
              //   placeholder="Chọn 1 hoặc nhiều trạng thái"
              //   mode="multiple"
              //   allowClear
              //   tagRender={tagRender}
              //   notFoundContent="Không tìm thấy kết quả"
              //   style={{
              //     width: "100%",
              //   }}
              //   maxTagCount="responsive"
              // >
              //   {Object.keys(listPaymentStatus).map((key) => (
              //     <CustomSelect.Option key={key} value={key}>
              //       {listPaymentStatus[key]}
              //     </CustomSelect.Option>
              //   ))}
              // </CustomSelect>
              <CustomSelectMany data={listPaymentStatus} span={8} />
            );
            break;
          case filterFields.merchandiser:
            collapseChildren = (
              <CustomSelect
                showArrow
                placeholder="Chọn 1 hoặc nhiều merchandiser"
                mode="multiple"
                allowClear
                optionFilterProp="children"
                tagRender={tagRender}
                style={{
                  width: "100%",
                }}
                notFoundContent="Không tìm thấy kết quả"
                maxTagCount="responsive"
              >
                {listSupplierAccount?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.full_name}>
                    {`${item.code} - ${item.full_name}`}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            );
            break;
          case filterFields.qc:
            collapseChildren = (
              <CustomSelect
                showArrow
                placeholder="Chọn 1 hoặc nhiều qc"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                style={{
                  width: "100%",
                }}
                optionFilterProp="children"
                notFoundContent="Không tìm thấy kết quả"
                maxTagCount="responsive"
              >
                {listRdAccount?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.full_name}>
                    {`${item.code} - ${item.full_name}`}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            );
            break;
          // case filterFields.cost_included:
          //   collapseChildren = (
          //     <CustomSelect
          //       showArrow
          //       placeholder="Chọn 1 trong 2 đk"
          //       tagRender={tagRender}
          //       style={{
          //         width: "100%",
          //       }}
          //       notFoundContent="Không tìm thấy kết quả"
          //     >
          //       <CustomSelect.Option key="1" value="true">
          //         Có chi phí
          //       </CustomSelect.Option>
          //       <CustomSelect.Option key="2" value="false">
          //         Không chi phí
          //       </CustomSelect.Option>
          //     </CustomSelect>
          //   );
          //   break;
          case filterFields.tax_included:
            collapseChildren = (
              // <CustomSelect
              //   showArrow
              //   placeholder="Chọn 1 trong 2 đk"
              //   tagRender={tagRender}
              //   style={{
              //     width: "100%",
              //   }}
              //   notFoundContent="Không tìm thấy kết quả"
              // >
              //   <CustomSelect.Option key="1" value="true">
              //     Có VAT
              //   </CustomSelect.Option>
              //   <CustomSelect.Option key="2" value="false">
              //     Không VAT
              //   </CustomSelect.Option>
              // </CustomSelect>
              <CustomSelectOne span={12} data={{"true": "Có VAT", "false": "Không VAT"}} />
            );
            break;
          case filterFields.expected_store:
            collapseChildren = (
              <CustomSelect
                showArrow
                placeholder="Kho nhận hàng dự kiến"
                style={{
                  width: "100%",
                }}
                tagRender={tagRender}
                notFoundContent="Không tìm thấy kết quả"
                mode="multiple"
                allowClear
                maxTagCount="responsive"
              >
                {listStore?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.name}>
                    {item.name}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            );
            break;
          case filterFields.note:
            collapseChildren = (
              <Input placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
            );
            break;
          case filterFields.supplier_note:
            collapseChildren = (
              <Input placeholder="Tìm kiếm theo nội dung ghi chú nhà cung cấp" />
            );
            break;
          case filterFields.tags:
            collapseChildren = <HashTag placeholder="Tìm kiếm theo tag" />;
            break;
          case filterFields.reference:
            collapseChildren = (
              <Input placeholder="Tìm kiếm theo mã tham chiếu" />
            );
            break;
          default:
            collapseChildren = null;
        }
        return (
          <Collapse key={field}>
            <Panel
              className={tempAdvanceFilters[field] ? "active" : ""}
              header={<FilterHeader title={filterFieldsMapping[field]} />}
              key="1"
            >
              <Item name={field}>{collapseChildren}</Item>
            </Panel>
          </Collapse>
        );
      })}
    </Space>
  );
};

const PurchaseOrderFilter: React.FC<PurchaseOrderFilterProps> = (
  props: PurchaseOrderFilterProps
) => {
  const {
    params,
    actions,
    listSupplierAccount,
    listRdAccount,
    listStore,
    onMenuClick,
    // onClearFilter,
    onFilter,
  } = props;
  const [visible, setVisible] = useState(false);

  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();

  let [advanceFilters, setAdvanceFilters] = useState({});
  const [tempAdvanceFilters, setTempAdvanceFilters] = useState({});

  const resetField = useCallback(
    (field: string) => {
      formBaseFilter.setFieldsValue({
        ...formBaseFilter.getFieldsValue(true),
        [field]: undefined,
      });
      formAdvanceFilter.setFieldsValue({
        ...formAdvanceFilter.getFieldsValue(true),
        [field]: undefined,
      });
      formBaseFilter.submit();
    },
    [formBaseFilter, formAdvanceFilter]
  );

  const onBaseFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      let data = formBaseFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formBaseFilter, onFilter]
  );
  const onAdvanceFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      let data = formAdvanceFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formAdvanceFilter, onFilter]
  );
  const onFilterClick = useCallback(() => {
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    formAdvanceFilter.resetFields();
    setTempAdvanceFilters({ ...advanceFilters });
    setVisible(false);
  }, [formAdvanceFilter, advanceFilters]);
  const onResetFilter = useCallback(() => {
    // debugger;
    let fields = formAdvanceFilter.getFieldsValue(true);
    for (let key in fields) {
      fields[key] = null;
    }
    formAdvanceFilter.setFieldsValue(fields);
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  useEffect(() => {
    formBaseFilter.setFieldsValue({ ...advanceFilters });
    formAdvanceFilter.setFieldsValue({ ...advanceFilters });
    setTempAdvanceFilters(advanceFilters);
  }, [advanceFilters, formAdvanceFilter, formBaseFilter]);
  useEffect(() => {
    setAdvanceFilters({ ...params });
  }, [params]);
  useLayoutEffect(() => {
    // if (visible) {
    //   formBaseFilter.resetFields();
    //   formAdvanceFilter.resetFields();
    // }
    // return () => {
    //   formBaseFilter.resetFields();
    //   formAdvanceFilter.resetFields();
    // };
  }, [formAdvanceFilter, formBaseFilter, visible]);
  return (
    <div className="purchase-order-form">
      <Form.Provider
        onFormFinish={(name, { values, forms }) => {
          const { formBaseFilter, formAdvanceFilter } = forms;
          let baseValues = formBaseFilter.getFieldsValue(true);
          let advanceValues = formAdvanceFilter?.getFieldsValue(true);
          let data = { ...baseValues, ...advanceValues };
          let orderDate = data[filterFields.order_date],
            activatedDate = data[filterFields.activated_date],
            completedDate = data[filterFields.completed_date],
            cancelledDate = data[filterFields.cancelled_date],
            expectedImportDate = data[filterFields.expected_import_date];
          const [from_order_date, to_order_date] = orderDate
              ? orderDate
              : [undefined, undefined],
            [from_activated_date, to_activated_date] = activatedDate
              ? activatedDate
              : [undefined, undefined],
            [from_completed_date, to_completed_date] = completedDate
              ? completedDate
              : [undefined, undefined],
            [from_cancelled_date, to_cancelled_date] = cancelledDate
              ? cancelledDate
              : [undefined, undefined],
            [from_expect_import_date, to_expect_import_date] =
              expectedImportDate ? expectedImportDate : [undefined, undefined];
          for (let key in data) {
            if (data[key] instanceof Array) {
              if (data[key].length === 0) data[key] = undefined;
            }
          }
          data = {
            ...data,
            from_order_date,
            to_order_date,
            from_activated_date,
            to_activated_date,
            from_completed_date,
            to_completed_date,
            from_cancelled_date,
            to_cancelled_date,
            from_expect_import_date,
            to_expect_import_date,
          };
          formBaseFilter.setFieldsValue({ ...data });
          formAdvanceFilter?.setFieldsValue({
            ...data,
          });
        }}
      >
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            form={formBaseFilter}
            name="formBaseFilter"
            onFinish={onBaseFinish}
            initialValues={advanceFilters}
            layout="inline"
          >
            <Item name="info">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 350 }}
                placeholder="Tìm kiếm theo ID đơn mua, Tên, SĐT nhà cung cấp"
              />
            </Item>
            <Item name={filterFields.merchandiser}>
              <CustomSelect
                showArrow
                placeholder="Merchandise"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                style={{
                  width: 150,
                }}
                notFoundContent="Không tìm thấy kết quả"
                maxTagCount="responsive"
              >
                {listSupplierAccount?.map((item) => (
                  <CustomSelect.Option key={item.id} value={item.full_name}>
                    {`${item.code} - ${item.full_name}`}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Item>
            <Item name={filterFields.status}>
              <CustomSelect
                showArrow
                placeholder="Trạng thái đặt hàng"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: 200 }}
                maxTagCount="responsive"
              >
                {Object.keys(listPOStatus)?.map((key) => (
                  <CustomSelect.Option key={key} value={key}>
                    {listPOStatus[key]}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Item>
            <Item>
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
              </Button>
            </Item>
          </Form>
        </CustomFilter>
        <FilterList filters={advanceFilters} resetField={resetField} />
        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          width={500}
        >
          <Form
            form={formAdvanceFilter}
            name="formAdvanceFilter"
            onFinish={onAdvanceFinish}
            initialValues={advanceFilters}
            layout="vertical"
            onFieldsChange={(changedFields: any, allFields: any) => {
              let fieldNames =
                changedFields &&
                changedFields.length > 0 &&
                changedFields[0].name;
              if (!fieldNames) return;
              let filtersSelected: any = {};
              fieldNames.forEach((fieldName: any) => {
                filtersSelected[fieldName] = true;
              });
              setTempAdvanceFilters({
                ...filtersSelected,
                ...tempAdvanceFilters,
              });
            }}
          >
            <AdvanceFormItems
              listSupplierAccount={listSupplierAccount}
              listStore={listStore}
              listRdAccount={listRdAccount}
              tempAdvanceFilters={tempAdvanceFilters}
            />
          </Form>
        </BaseFilter>
      </Form.Provider>
    </div>
  );
};

export default PurchaseOrderFilter;
