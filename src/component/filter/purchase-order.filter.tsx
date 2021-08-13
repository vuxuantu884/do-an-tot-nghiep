import { Button, Row, Col, Form, Input, Collapse, Tag, Space } from "antd";

import { MenuAction } from "component/table/ActionButton";
import {
  useCallback,
  useLayoutEffect,
  useState,
  useEffect,
  useMemo,
  Fragment,
} from "react";
import moment from "moment";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import CustomFilter from "component/table/custom.filter";
import { PurchaseOrderQuery } from "model/purchase-order/purchase-order.model";
import CustomRangepicker from "component/filter/component/range-picker.custom";
import CustomSelect from "component/custom/select.custom";
import { AccountResponse } from "model/account/account.model";
import { StoreResponse } from "model/core/store.model";
import { SwapRightOutlined } from "@ant-design/icons";
import { POStatus, ProcumentStatus, PoPaymentStatus } from "utils/Constants";
import { DATE_FORMAT } from "utils/DateUtils";

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

const listPOStatus = [
  {
    key: POStatus.DRAFT,
    value: "Nháp",
  },
  {
    key: POStatus.FINALIZED,
    value: "Đã xác nhận",
  },
  {
    key: POStatus.COMPLETED,
    value: "Đã hoàn thành",
  },
  {
    key: POStatus.FINISHED,
    value: "Đã kết thúc",
  },
  {
    key: POStatus.CANCELLED,
    value: "Đã hủy",
  },
];
const listProcumentStatus = [
  {
    key: ProcumentStatus.NOT_RECEIVED,
    value: "Chưa nhận hàng",
  },
  {
    key: ProcumentStatus.PARTIAL_RECEIVED,
    value: "Nhận hàng 1 phần",
  },
  {
    key: ProcumentStatus.RECEIVED,
    value: "Đã nhận hàng",
  },
];
const listPaymentStatus = [
  {
    key: PoPaymentStatus.UNPAID,
    value: "Chưa thanh toán",
  },
  {
    key: PoPaymentStatus.PARTIAL_PAID,
    value: "Thanh toán 1 phần",
  },
  {
    key: PoPaymentStatus.PAID,
    value: "Đã thanh toán",
  },
];

const filterFields = {
  order_date: "order_date",
  activated_date: "activated_date",
  completed_date: "completed_date",
  cancelled_date: "cancelled_date_range",
  status: "status",
  receive_status: "receive_status",
  financial_status: "financial_status",
  merchandiser: "merchandiser",
  qc: "qc",
  cost_included: "cost_included",
  tax_included: "tax_included",
  expected_import_date: "expected_import_date",
  expected_import_store: "expected_import_store",
  note: "note",
  supllier_note: "supplier_note",
  tags: "tags",
  reference: "reference",
};

const listStatus = {
  [filterFields.status]: listPOStatus,
  [filterFields.receive_status]: listProcumentStatus,
  [filterFields.financial_status]: listPaymentStatus
};

const filterFieldsMapping: any = {
  [filterFields.order_date]: "Ngày nhập kho",
  [filterFields.activated_date]: "Ngày duyệt đơn",
  [filterFields.completed_date]: "Ngày hoàn tất đơn",
  [filterFields.cancelled_date]: "Ngày hủy đơn",
  [filterFields.status]: "Trạng thái đơn",
  [filterFields.receive_status]: "Nhập kho",
  [filterFields.financial_status]: "Thanh toán",
  [filterFields.merchandiser]: "Merchandiser",
  [filterFields.qc]: "qc",
  [filterFields.cost_included]: "Chi phí",
  [filterFields.tax_included]: "VAT",
  [filterFields.expected_import_date]: "Ngày nhận hàng dự kiên",
  [filterFields.expected_import_store]: "Kho nhận hàng dự kiên",
  [filterFields.note]: "Ghi chú nội bộ",
  [filterFields.supllier_note]: "Ghi chú nhà cung cấp",
  [filterFields.tags]: "Tag",
  [filterFields.reference]: "Mã tham chiếu",
};

type FilterHeaderProps = {
  title?: string;
};
const FilterHeader = ({ title }: FilterHeaderProps) => {
  return <span>{title}</span>;
};

const FilterList = ({ filters, resetField }: any) => {
  let filtersKeys = Object.keys(filters);
  return (
    <Space wrap={true} style={{ marginBottom: 20 }}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return;
        if (!filterFieldsMapping[filterKey]) return;
        switch (filterKey) {
          case filterFields.order_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.cancelled_date:
          case filterFields.expected_import_date:
            let [from, to] = value;
            from = moment.utc(from).format(DATE_FORMAT.DDMMYYY);
            to = moment.utc(to).format(DATE_FORMAT.DDMMYYY);
            return (
              <Tag
                onClose={() => resetField(filterKey)}
                key={filterKey}
                className="fade"
                closable
              >{`${filterFieldsMapping[filterKey]} : ${from} - ${to}`}</Tag>
            );
          case filterFields.status:
          case filterFields.receive_status:
          case filterFields.financial_status:
            let listStt = listStatus[filterKey];
            let status = listStt.find((stt) => {
              return stt.key = value;
            });
            return (
              <Tag
                onClose={() => resetField(filterKey)}
                key={filterKey}
                className="fade"
                closable
              >{`${filterFieldsMapping[filterKey]} : ${status?.value}`}</Tag>
            );
          case filterFields.cost_included:
            let costTxt = "Có chi phí";
            if (value === "false") costTxt = "Không chi phí"
            return (
              <Tag
                onClose={() => resetField(filterKey)}
                key={filterKey}
                className="fade"
                closable
              >{`${filterFieldsMapping[filterKey]} : ${costTxt}`}</Tag>
            );
          case filterFields.tax_included:
            let taxTxt = "Có VAT";
            if (value === "false") taxTxt = "Không VAT"
            return (
              <Tag
                onClose={() => resetField(filterKey)}
                key={filterKey}
                className="fade"
                closable
              >{`${filterFieldsMapping[filterKey]} : ${taxTxt}`}</Tag>
            );
          default:
            return (
              <Tag
                onClose={() => resetField(filterKey)}
                key={filterKey}
                className="fade"
                closable
              >{`${filterFieldsMapping[filterKey]} : ${value}`}</Tag>
            );
        }
      })}
    </Space>
  );
};

function tagRender(props: any) {
  const { label, value, closable, onClose } = props;
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

const AdvanceFormItems = ({
  listSupplierAccount,
  listRdAccount,
  listStore,
}: Partial<PurchaseOrderFilterProps>) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {Object.keys(filterFields).map((field) => {
        switch (field) {
          case filterFields.order_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.cancelled_date:
          case filterFields.expected_import_date:
            return (
              <Collapse key={field}>
                <Panel
                  header={<FilterHeader title={filterFieldsMapping[field]} />}
                  key="1"
                >
                  <Item name={field}>
                    <CustomRangepicker />
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.merchandiser:
            return (
              <Collapse key={field}>
                <Panel header={<FilterHeader title="MERCHANDISER" />} key="1">
                  <Item name={field}>
                    <CustomSelect
                      placeholder="Chọn 1 hoặc nhiều merchandiser"
                      mode="multiple"
                      allowClear
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
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.qc:
            return (
              <Collapse key={field}>
                <Panel header={<FilterHeader title="QC" />} key="1">
                  <Item name={field}>
                    <CustomSelect
                      placeholder="Chọn 1 hoặc nhiều qc"
                      mode="multiple"
                      allowClear
                      tagRender={tagRender}
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                      maxTagCount="responsive"
                    >
                      {listRdAccount?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.full_name}>
                          {`${item.code} - ${item.full_name}`}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.cost_included:
            return (
              <Collapse key={field}>
                <Panel header={<FilterHeader title="CHI PHÍ" />} key="1">
                  <Item name={field}>
                    <CustomSelect
                      placeholder="Chọn 1 trong 2 đk"
                      tagRender={tagRender}
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                    >
                      <CustomSelect.Option key="1" value="true">
                        Có chi phí
                      </CustomSelect.Option>
                      <CustomSelect.Option key="2" value="false">
                        Không chi phí
                      </CustomSelect.Option>
                    </CustomSelect>
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.tax_included:
            return (
              <Collapse key={field}>
                <Panel header={<FilterHeader title="VAT" />} key="1">
                  <Item name={field}>
                    <CustomSelect
                      placeholder="Chọn 1 trong 2 đk"
                      tagRender={tagRender}
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                    >
                      <CustomSelect.Option key="1" value="true">
                        Có VAT
                      </CustomSelect.Option>
                      <CustomSelect.Option key="2" value="false">
                        Không VAT
                      </CustomSelect.Option>
                    </CustomSelect>
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.expected_import_store:
            return (
              <Collapse key={field}>
                <Panel header="Kho nhận hàng dự kiến" key="1">
                  <Item name={field}>
                    <CustomSelect
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
                        <CustomSelect.Option key={item.id} value={item.id}>
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.note:
            return (
              <Collapse key={field}>
                <Panel header={<FilterHeader title="GHI CHÚ NỘI BỘ" />} key="1">
                  <Item name={field}>
                    <Input placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.supllier_note:
            return (
              <Collapse key={field}>
                <Panel
                  header={<FilterHeader title="GHI CHÚ NHÀ CUNG CẤP" />}
                  key="1"
                >
                  <Item name={field}>
                    <Input placeholder="Tìm kiếm theo nội dung ghi chú nhà cung cấp" />
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.tags:
            return (
              <Collapse key={field}>
                <Panel header={<FilterHeader title="TAG" />} key="1">
                  <Item name={field}>
                    <Input placeholder="Tìm kiếm theo tag" />
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.reference:
            return (
              <Collapse key={field}>
                <Panel header={<FilterHeader title="MÃ THAM CHIẾU" />} key="1">
                  <Item name={field}>
                    <Input placeholder="Tìm kiếm theo mã tham chiếu" />
                  </Item>
                </Panel>
              </Collapse>
            );
        }
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
    onClearFilter,
    onFilter,
  } = props;
  const [visible, setVisible] = useState(false);

  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();

  const [advanceFilters, setAdvanceFilters] = useState({});

  const resetField = useCallback((field: string) => {
    setAdvanceFilters({...advanceFilters, [field]: undefined});
  }, [formBaseFilter, formAdvanceFilter]);

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
    setVisible(false);
  }, [formAdvanceFilter]);
  const onResetFilter = useCallback(() => {
    debugger;
    formAdvanceFilter.resetFields();
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter]);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick]
  );

  const getAdvanceFields = useCallback(() => {
    let {infor, status, receive_status, financial_status, ...advancedFilters } = formBaseFilter.getFieldsValue(true);
    return advancedFilters;
  }, [formBaseFilter]);
  
  useEffect(() => {
    formAdvanceFilter.setFieldsValue(advanceFilters);
  }, [formAdvanceFilter, advanceFilters]);

  useEffect(() => {
    let advancedFilters= getAdvanceFields();
    setAdvanceFilters({...advancedFilters});
  }, [formBaseFilter]);
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
          let baseValues = formBaseFilter.getFieldsValue();
          let advanceValues = formAdvanceFilter?.getFieldsValue();
          let data = {...baseValues, ...advanceValues};
          let orderDate = data[filterFields.order_date],
              activatedDate = data[filterFields.activated_date],
            completedDate = data[filterFields.completed_date],
            cancelledDate = data[filterFields.cancelled_date],
            expectedImportDate = data[filterFields.expected_import_date];
          const [from_order_date, to_order_date] = orderDate ? orderDate : [],
            [from_activated_date, to_activated_date] = activatedDate ? activatedDate : [],
            [from_completed_date, to_completed_date] = completedDate ? completedDate : [],
            [from_cancelled_date, to_cancelled_date] = cancelledDate ? cancelledDate : [],
            [from_expect_import_date, to_expect_import_date] = expectedImportDate ? expectedImportDate : [];
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
            to_expect_import_date
          };
          formBaseFilter.setFieldsValue({ ...data });
          formAdvanceFilter?.setFieldsValue({
            ...data,
          });

          let advancedFilters = getAdvanceFields();
          setAdvanceFilters({...advancedFilters});
        }}
      >
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form
            form={formBaseFilter}
            name="formBaseFilter"
            onFinish={onBaseFinish}
            initialValues={params}
            layout="inline"

          >
            <Item name="info">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 350 }}
                placeholder="Tìm kiếm theo ID đơn mua, tên số điện thoại ncc"
              />
            </Item>
            <Item name={filterFields.status}>
              <CustomSelect
                placeholder="Chọn 1 hoặc nhiều trạng thái"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: 150 }}
                maxTagCount="responsive"
              >
                {listPOStatus?.map((poStatus, index) => (
                  <CustomSelect.Option key={index} value={poStatus.key}>
                    {poStatus.value}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Item>
            <Item name={filterFields.receive_status}>
              <CustomSelect
                placeholder="Chọn 1 hoặc nhiều trạng thái"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: 200 }}
                maxTagCount="responsive"
              >
                {listProcumentStatus?.map((procumentStatus, index) => (
                  <CustomSelect.Option key={index} value={procumentStatus.key}>
                    {procumentStatus.value}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Item>
            <Item name={filterFields.financial_status}>
              <CustomSelect
                placeholder="Chọn 1 hoặc nhiều trạng thái"
                mode="multiple"
                allowClear
                tagRender={tagRender}
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: 200 }}
                maxTagCount="responsive"
              >
                {listPaymentStatus?.map((paymentStatus, index) => (
                  <CustomSelect.Option key={index} value={paymentStatus.key}>
                    {paymentStatus.value}
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
              <Button onClick={openFilter}>Thêm bộ lọc</Button>
            </Item>
          </Form>
        </CustomFilter>
        <FilterList filters={advanceFilters} resetField={resetField}/>
        <BaseFilter
          onClearFilter={onResetFilter}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
        >
          <Form
            form={formAdvanceFilter}
            name="formAdvanceFilter"
            onFinish={onAdvanceFinish}
            initialValues={params}
            layout="vertical"
          >
            <AdvanceFormItems
              listSupplierAccount={listSupplierAccount}
              listStore={listStore}
              listRdAccount={listRdAccount}
            />
          </Form>
        </BaseFilter>
      </Form.Provider>
    </div>
  );
};

export default PurchaseOrderFilter;
