import { Button, Row, Col, Form, Input, Collapse, Tag, Space } from "antd";

import { MenuAction } from "component/table/ActionButton";
import {
  useCallback,
  useLayoutEffect,
  useState,
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
  import_date: "import_date",
  activated_date: "activated_date",
  completed_date: "completed_date",
  canceled_date: "canceled_date_range",
  status: "status",
  import: "import",
  payments: "payments",
  merchandisers: "merchandisers",
  qc: "qc",
  cost: "cost",
  vat: "vat",
  expected_import_date: "expected_import_date",
  expected_import_store: "expected_import_store",
  note: "note",
  note_ncc: "note_ncc",
  tag: "tag",
  ref: "ref",
};

const filterFieldsMapping: any = {
  [filterFields.import_date]: "Ngày nhập kho",
  [filterFields.activated_date]: "Ngày duyệt đơn",
  [filterFields.completed_date]: "Ngày hoàn tất đơn",
  [filterFields.canceled_date]: "Ngày hủy đơn",
  [filterFields.status]: "Trạng thái đơn",
  [filterFields.import]: "Nhập kho",
  [filterFields.payments]: "Thanh toán",
  [filterFields.merchandisers]: "Merchandisers",
  [filterFields.qc]: "qc",
  [filterFields.cost]: "cost",
  [filterFields.vat]: "vat",
  [filterFields.expected_import_date]: "Ngày nhận hàng dự kiên",
  [filterFields.expected_import_store]: "Kho nhận hàng dự kiên",
  [filterFields.note]: "Ghi chú nội bộ",
  [filterFields.note_ncc]: "Ghi chú nhà cung cấp",
  [filterFields.tag]: "Tag",
  [filterFields.ref]: "Mã tham chiếu",
};

type FilterHeaderProps = {
  title?: string;
};
const FilterHeader = ({ title }: FilterHeaderProps) => {
  return <span>{title}</span>;
};

const FilterList = ({ filters }: any) => {
  let filtersKeys = Object.keys(filters);
  return (
    <Space style={{ marginBottom: 20 }}>
      {filtersKeys.map((filterKey) => {
        let value = filters[filterKey];
        if (!value) return;
        switch (filterKey) {
          case filterFields.import_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.canceled_date:
          case filterFields.expected_import_date:
            let [from, to] = value;
            from = moment.utc(from).format(DATE_FORMAT.DDMMYYY);
            to = moment.utc(to).format(DATE_FORMAT.DDMMYYY);
            return (
              <Tag
                key={filterKey}
                className="fade"
                closable
              >{`${filterFieldsMapping[filterKey]} : ${from} - ${to}`}</Tag>
            );
          default:
            return (
              <Tag
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

const AdvanceFormItems = ({
  listSupplierAccount,
  listRdAccount,
  listStore,
}: Partial<PurchaseOrderFilterProps>) => {
  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {Object.keys(filterFields).map((field) => {
        switch (field) {
          case filterFields.import_date:
          case filterFields.activated_date:
          case filterFields.completed_date:
          case filterFields.canceled_date:
          case filterFields.expected_import_date:
            return (
              <Collapse>
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
          case filterFields.status:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="TRẠNG THÁI ĐƠN" />} key="1">
                  <Item name={field}>
                    <CustomSelect
                      placeholder="Chọn 1 hoặc nhiều trạng thái"
                      mode="multiple"
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                    >
                      {listPOStatus?.map((poStatus, index) => (
                        <CustomSelect.Option key={index} value={poStatus.value}>
                          {poStatus.value}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.import:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="NHẬP KHO" />} key="1">
                  <Item name={field}>
                    <CustomSelect
                      placeholder="Chọn 1 hoặc nhiều trạng thái"
                      mode="multiple"
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                    >
                      {listProcumentStatus?.map((poStatus, index) => (
                        <CustomSelect.Option key={index} value={poStatus.value}>
                          {poStatus.value}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.payments:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="THANH TOÁN" />} key="1">
                  <Item name={field}>
                    <CustomSelect
                      placeholder="Chọn 1 hoặc nhiều trạng thái"
                      mode="multiple"
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                    >
                      {listPaymentStatus?.map((poStatus, index) => (
                        <CustomSelect.Option key={index} value={poStatus.value}>
                          {poStatus.value}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.merchandisers:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="MERCHANDISER" />} key="1">
                  <Item name={field}>
                    <CustomSelect
                      placeholder="Chọn 1 hoặc nhiều merchandiser"
                      mode="multiple"
                      style={{
                        width: "100%",
                      }}
                      notFoundContent="Không tìm thấy kết quả"
                      maxTagCount="responsive"
                    >
                      {listSupplierAccount?.map((item) => (
                        <CustomSelect.Option key={item.id} value={item.id}>
                          {item.full_name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Panel>
              </Collapse>
            );
          case filterFields.qc:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="QC" />} key="1">
                  <CustomSelect
                    placeholder="Chọn 1 hoặc nhiều qc"
                    mode="multiple"
                    style={{
                      width: "100%",
                    }}
                    notFoundContent="Không tìm thấy kết quả"
                    maxTagCount="responsive"
                  >
                    {listRdAccount?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id}>
                        {item.full_name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Panel>
              </Collapse>
            );
          case filterFields.cost:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="CHI PHÍ" />} key="1">
                  <CustomSelect
                    placeholder="Chọn 1 trong 2 đk"
                    style={{
                      width: "100%",
                    }}
                    notFoundContent="Không tìm thấy kết quả"
                  >
                    <CustomSelect.Option key="1" value="0">
                      Có chi phí
                    </CustomSelect.Option>
                    <CustomSelect.Option key="2" value="1">
                      Không chi phí
                    </CustomSelect.Option>
                  </CustomSelect>
                </Panel>
              </Collapse>
            );
          case filterFields.vat:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="VAT" />} key="1">
                  <CustomSelect
                    placeholder="Chọn 1 trong 2 đk"
                    style={{
                      width: "100%",
                    }}
                    notFoundContent="Không tìm thấy kết quả"
                  >
                    <CustomSelect.Option key="1" value="0">
                      Có VAT
                    </CustomSelect.Option>
                    <CustomSelect.Option key="2" value="1">
                      Không VAT
                    </CustomSelect.Option>
                  </CustomSelect>
                </Panel>
              </Collapse>
            );
          case filterFields.expected_import_store:
            return (
              <Collapse>
                <Panel header="Kho nhận hàng dự kiến" key="1">
                  <CustomSelect
                    placeholder="Kho nhận hàng dự kiến"
                    style={{
                      width: "100%",
                    }}
                    notFoundContent="Không tìm thấy kết quả"
                    mode="multiple"
                    maxTagCount="responsive"
                  >
                    {listStore?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Panel>
              </Collapse>
            );
          case filterFields.note:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="GHI CHÚ NỘI BỘ" />} key="1">
                  <Input placeholder="Tìm kiếm theo nội dung ghi chú nội bộ" />
                </Panel>
              </Collapse>
            );
          case filterFields.note_ncc:
            return (
              <Collapse>
                <Panel
                  header={<FilterHeader title="GHI CHÚ NHÀ CUNG CẤP" />}
                  key="1"
                >
                  <Input placeholder="Tìm kiếm theo nội dung ghi chú nhà cung cấp" />
                </Panel>
              </Collapse>
            );
          case filterFields.tag:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="TAG" />} key="1">
                  <Input placeholder="Tìm kiếm theo tag" />
                </Panel>
              </Collapse>
            );
          case filterFields.ref:
            return (
              <Collapse>
                <Panel header={<FilterHeader title="MÃ THAM CHIẾU" />} key="1">
                  <Input placeholder="Tìm kiếm theo mã tham chiếu" />
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
  const currentFilters = formBaseFilter.getFieldsValue(true);
  const onBaseFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      debugger;
      let data = formBaseFilter.getFieldsValue(true);
      onFilter && onFilter(data);
    },
    [formBaseFilter, onFilter]
  );
  console.log("huynvq::=============>", formAdvanceFilter);
  const onAdvanceFinish = useCallback(
    (values: PurchaseOrderQuery) => {
      debugger;
      let data = formAdvanceFilter.getFieldsValue(true);
      // let importDate = data[filterFields.import_date],
      //   activatedDate = data[filterFields.activated_date]
      // completedDate = data[filterFields.completed_date],
      // canceledDate = data[filterFields.canceled_date],
      // expectedImportDate = data[filterFields.expected_import_date];
      data = {
        ...data,
        // import_from_date: importDate ? importDate[0] : null,
        // import_to_date: importDate ? importDate[1] : null,
        // activate_from_date: activatedDate ? activatedDate[0] : null,
        // activate_to_date: activatedDate ? activatedDate[1] : null,
      };
      formAdvanceFilter.setFieldsValue(data);
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
          debugger;
          const { formBaseFilter, formAdvanceFilter } = forms;
          let baseValues = formBaseFilter.getFieldsValue();
          let advanceValues = formAdvanceFilter?.getFieldsValue();
          formBaseFilter.setFieldsValue({ ...baseValues, ...advanceValues });

          formAdvanceFilter?.setFieldsValue({
            ...baseValues,
            ...advanceValues,
          });
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
            <Item name="code">
              <Input
                prefix={<img src={search} alt="" />}
                style={{ width: 376 }}
                placeholder="Tìm kiếm theo ID đơn mua, tên số điện thoại ncc"
              />
            </Item>
            <Item name="status">
              <CustomSelect
                placeholder="Trạng thái đơn hàng"
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: 178 }}
              >
                <CustomSelect.Option value="">
                  Trạng thái đơn hàng
                </CustomSelect.Option>
                {listPOStatus?.map((poStatus, index) => (
                  <CustomSelect.Option key={index} value={poStatus.value}>
                    {poStatus.value}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Item>
            <Item name="receive_status">
              <CustomSelect
                placeholder="Nhập kho"
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: 178 }}
              >
                <CustomSelect.Option value="">Nhập kho</CustomSelect.Option>
                {listProcumentStatus?.map((poStatus, index) => (
                  <CustomSelect.Option key={index} value={poStatus.value}>
                    {poStatus.value}
                  </CustomSelect.Option>
                ))}
              </CustomSelect>
            </Item>
            <Item name="financial_status">
              <CustomSelect
                placeholder="Thanh toán"
                notFoundContent="Không tìm thấy kết quả"
                style={{ width: 178 }}
              >
                <CustomSelect.Option value="">Thanh toán</CustomSelect.Option>
                {listPaymentStatus?.map((poStatus, index) => (
                  <CustomSelect.Option key={index} value={poStatus.value}>
                    {poStatus.value}
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
        <FilterList filters={currentFilters} />
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
