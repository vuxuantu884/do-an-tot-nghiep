import { Button, Col, Form, FormInstance, Input, Row, Tag } from "antd";

import { MenuAction } from "component/table/ActionButton";
import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { FilterOutlined } from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import { OrderSearchQuery } from "model/order/order.model";
import moment from "moment";
import BaseFilter from "component/filter/base.filter";
import { InventoryTransferSearchQuery } from "model/inventory/transfer";
import { BaseFilterWrapper, InventoryFiltersWrapper } from "./styles";
import { STATUS_INVENTORY_TRANSFER, STATUS_INVENTORY_TRANSFER_ARRAY } from "screens/inventory/constants";
import ButtonSetting from "component/table/ButtonSetting";
import "assets/css/custom-filter.scss";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";
import { InventoryTransferTabUrl } from "config/url.config";
import { useQuery } from "utils/useQuery";
import TreeStore from "component/CustomTreeSelect";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { PageResponse } from "model/base/base-metadata.response";
import { RefTreeSelectProps } from "antd/es/tree-select";

type OrderFilterProps = {
  accountStores?: Array<StoreResponse> | null;
  params: InventoryTransferSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: Boolean;
  isLoadingAction?: boolean;
  accounts: Array<AccountResponse> | undefined;
  defaultAccountProps?: PageResponse<AccountResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  stores?: Array<StoreResponse>;
  activeTab?: string;
};

const { Item } = Form;

const InventoryFilters: React.FC<OrderFilterProps> = (props: OrderFilterProps) => {
  const {
    params,
    actions,
    isLoading,
    isLoadingAction,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
    stores,
    accounts,
    defaultAccountProps,
    activeTab,
    accountStores,
  } = props;
  const [formAdv] = Form.useForm();
  const [formSearch] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();
  const inputSearchRef = useRef<Input | null>(null);
  const fromStoreSelectRef = useRef<RefTreeSelectProps | undefined>(undefined);
  const toStoreSelectRef = useRef<RefTreeSelectProps | undefined>(undefined);
  let status: string[] = [];
  const query: any = useQuery();
  if (!query?.status) {
    switch (activeTab) {
      case InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER:
        status = [STATUS_INVENTORY_TRANSFER.TRANSFERRING.status, STATUS_INVENTORY_TRANSFER.CONFIRM.status];
        break;
      case InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE:
        status = [STATUS_INVENTORY_TRANSFER.TRANSFERRING.status];
        break;
      default:
        break;
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterFromParams = {
    ...params,
    status: Array.isArray(params.status)
      ? params.status.length > 0
        ? params.status
        : status
      : [params.status],
    created_by: Array.isArray(params.created_by) ? params.created_by : [params.created_by],
    transfer_by: Array.isArray(params.transfer_by) ? params.transfer_by : [params.transfer_by],
    received_by: Array.isArray(params.received_by) ? params.received_by : [params.received_by],
    cancel_by: Array.isArray(params.cancel_by) ? params.cancel_by : [params.cancel_by],
    from_created_date: formatDateFilter(params.from_created_date),
    to_created_date: formatDateFilter(params.to_created_date),
    from_transfer_date: formatDateFilter(params.from_transfer_date),
    to_transfer_date: formatDateFilter(params.to_transfer_date),
    from_receive_date: formatDateFilter(params.from_receive_date),
    to_receive_date: formatDateFilter(params.to_receive_date),
    from_cancel_date: formatDateFilter(params.from_cancel_date),
    to_cancel_date: formatDateFilter(params.to_cancel_date),
    from_pending_date: formatDateFilter(params.from_pending_date),
    to_pending_date: formatDateFilter(params.to_pending_date),
  };
  const initialValues = useMemo(() => {
    return filterFromParams;
  }, [filterFromParams]);

  useEffect(() => {
    if (!inputSearchRef) return;
    if (activeTab === "") return;
    if (activeTab === `${InventoryTransferTabUrl.LIST}/` || activeTab === InventoryTransferTabUrl.HISTORIES) {
      inputSearchRef?.current?.focus();
    }
  }, [activeTab, inputSearchRef]);

  useEffect(() => {
    if (!toStoreSelectRef) return;
    if (activeTab === "") return;
    if (activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER) {
      toStoreSelectRef?.current?.focus();
    }
  }, [activeTab, toStoreSelectRef]);

  useEffect(() => {
    if (!fromStoreSelectRef) return;
    if (activeTab === "") return;
    if (activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE) {
      fromStoreSelectRef?.current?.focus();
    }
  }, [activeTab, fromStoreSelectRef]);

  useEffect(() => {
    if (activeTab === "") return;

    const accountStoreSelected =
      accountStores && accountStores.length > 0 ? accountStores.map((i) => i.id) : [];

    if (activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE) {
      formSearchRef.current?.setFieldsValue({
        ...params,
        to_store_id:
          params.to_store_id && Array.isArray(params.to_store_id) && params.to_store_id.length > 0
            ? params.to_store_id.map((storeId) => Number(storeId))
            : accountStoreSelected,
        from_store_id:
          params.from_store_id &&
          Array.isArray(params.from_store_id) &&
          params.from_store_id.length > 0
            ? params.from_store_id.map((storeId) => Number(storeId))
            : [],
      });
    } else {
      formSearchRef.current?.setFieldsValue({
        ...params,
        from_store_id:
          params.from_store_id &&
          Array.isArray(params.from_store_id) &&
          params.from_store_id.length > 0
            ? params.from_store_id.map((storeId) => Number(storeId))
            : accountStoreSelected,
        to_store_id:
          params.to_store_id && Array.isArray(params.to_store_id) && params.to_store_id.length > 0
            ? params.to_store_id.map((storeId) => Number(storeId))
            : [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, accountStores]);

  useEffect(() => {
    formAdv.setFieldsValue(filterFromParams);
  }, [filterFromParams, formAdv, formSearchRef, params]);

  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState("");

  const loadingFilter = useMemo(() => {
    return !!isLoading;
  }, [isLoading]);

  const onFilterClick = useCallback(() => {
    setVisible(false);
    let values = formAdv.getFieldsValue(true);

    const valuesForm = {
      ...values,
      condition: formSearch.getFieldValue("condition") !== "" ? formSearch.getFieldValue("condition").trim() : "",
      from_created_date: formAdv.getFieldValue("from_created_date")
        ? getStartOfDayCommon(formAdv.getFieldValue("from_created_date"))?.format()
        : null,
      to_created_date: formAdv.getFieldValue("to_created_date")
        ? getEndOfDayCommon(formAdv.getFieldValue("to_created_date"))?.format()
        : null,
      from_transfer_date: formAdv.getFieldValue("from_transfer_date")
        ? getStartOfDayCommon(formAdv.getFieldValue("from_transfer_date"))?.format()
        : null,
      to_transfer_date: formAdv.getFieldValue("to_transfer_date")
        ? getEndOfDayCommon(formAdv.getFieldValue("to_transfer_date"))?.format()
        : null,
      from_receive_date: formAdv.getFieldValue("from_receive_date")
        ? getStartOfDayCommon(formAdv.getFieldValue("from_receive_date"))?.format()
        : null,
      to_receive_date: formAdv.getFieldValue("to_receive_date")
        ? getEndOfDayCommon(formAdv.getFieldValue("to_receive_date"))?.format()
        : null,
      from_cancel_date: formAdv.getFieldValue("from_cancel_date")
        ? getStartOfDayCommon(formAdv.getFieldValue("from_cancel_date"))?.format()
        : null,
      to_cancel_date: formAdv.getFieldValue("to_cancel_date")
        ? getEndOfDayCommon(formAdv.getFieldValue("to_cancel_date"))?.format()
        : null,
      from_pending_date: formAdv.getFieldValue("from_pending_date")
        ? getStartOfDayCommon(formAdv.getFieldValue("from_pending_date"))?.format()
        : null,
      to_pending_date: formAdv.getFieldValue("to_pending_date")
        ? getEndOfDayCommon(formAdv.getFieldValue("to_pending_date"))?.format()
        : null,
      from_store_id: formSearch.getFieldValue("from_store_id").join(','),
      to_store_id: formSearch.getFieldValue("to_store_id").join(',')
    };
    onFilter && onFilter(valuesForm);
  }, [formAdv, formSearch, onFilter]);

  const onClearFilterClick = useCallback(() => {
    onClearFilter && onClearFilter();

    formSearchRef?.current?.setFieldsValue({
      condition: "",
      from_store_id: [],
      to_store_id: [],
    });

    setVisible(false);
  }, [formSearchRef, onClearFilter]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "status":
          onFilter && onFilter({ ...params, status: [] });
          break;
        case "note":
          onFilter && onFilter({ ...params, note: null });
          break;
        case "created_by":
          onFilter && onFilter({ ...params, created_by: [] });
          break;
        case "transfer_by":
          onFilter && onFilter({ ...params, transfer_by: [] });
          break;
        case "received_by":
          onFilter && onFilter({ ...params, received_by: [] });
          break;
        case "cancel_by":
          onFilter && onFilter({ ...params, cancel_by: [] });
          break;
        case "created_date":
          onFilter &&
            onFilter({
              ...params,
              from_created_date: null,
              to_created_date: null,
            });
          formAdv.resetFields(["from_created_date", "to_created_date"]);
          break;
        case "transfer_date":
          onFilter &&
            onFilter({
              ...params,
              from_transfer_date: null,
              to_transfer_date: null,
            });
          formAdv.resetFields(["from_transfer_date", "to_transfer_date"]);
          break;
        case "receive_date":
          onFilter &&
            onFilter({
              ...params,
              from_receive_date: null,
              to_receive_date: null,
            });
          formAdv.resetFields(["from_receive_date", "to_receive_date"]);
          break;
        case "cancel_date":
          onFilter &&
            onFilter({
              ...params,
              from_cancel_date: null,
              to_cancel_date: null,
            });
          formAdv.resetFields(["from_cancel_date", "to_cancel_date"]);
          break;
        case "pending_date":
          onFilter &&
            onFilter({
              ...params,
              from_pending_date: null,
              to_pending_date: null,
            });
          formAdv.resetFields(["from_pending_date", "to_pending_date"]);
          break;
        default:
          break;
      }
    },
    [formAdv, onFilter, params],
  );

  const onFinish = useCallback(
    (values) => {
      const valuesForm = {
        ...values,
        condition: values.condition ? values.condition.trim() : null,
      };
      onFilter && onFilter(valuesForm);
    },
    [onFilter],
  );

  let filters = useMemo(() => {
    let list = [];
    if (initialValues.status.length && initialValues.status[0]) {
      let textStatus = "";
      if (initialValues.status.length > 1) {
        initialValues.status.forEach((statusValue) => {
          const status = STATUS_INVENTORY_TRANSFER_ARRAY?.find(
            (status) => status.value === statusValue,
          );
          textStatus = status ? textStatus + status.name + "; " : textStatus;
        });
      } else if (initialValues.status.length === 1) {
        initialValues.status.forEach((statusValue) => {
          const status = STATUS_INVENTORY_TRANSFER_ARRAY?.find(
            (status) => status.value === statusValue,
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
    if (initialValues.note && initialValues.note !== "") {
      list.push({
        key: "note",
        name: "Ghi chú",
        value: initialValues.note,
      });
    }
    if (initialValues.created_by.length && initialValues.created_by[0]) {
      let textAccount = "";
      if (initialValues.created_by.length > 1) {
        initialValues.created_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code + "; "
            : textAccount;
        });
      } else if (initialValues.created_by.length === 1) {
        initialValues.created_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code
            : textAccount;
        });
      }

      list.push({
        key: "created_by",
        name: "Người tạo",
        value: textAccount,
      });
    }
    if (initialValues.from_created_date || initialValues.to_created_date) {
      let textCreatedDate =
        (initialValues.from_created_date
          ? moment(initialValues.from_created_date).format("DD-MM-YYYY HH:mm")
          : "??") +
        " ~ " +
        (initialValues.to_created_date
          ? moment(initialValues.to_created_date).format("DD-MM-YYYY HH:mm")
          : "??");
      list.push({
        key: "created_date",
        name: "Ngày tạo",
        value: textCreatedDate,
      });
    }
    if (initialValues.transfer_by.length && initialValues.transfer_by[0]) {
      let textAccount = "";
      if (initialValues.transfer_by.length > 1) {
        initialValues.transfer_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code + "; "
            : textAccount;
        });
      } else if (initialValues.transfer_by.length === 1) {
        initialValues.transfer_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code
            : textAccount;
        });
      }

      list.push({
        key: "transfer_by",
        name: "Người chuyển",
        value: textAccount,
      });
    }
    if (initialValues.from_transfer_date || initialValues.to_transfer_date) {
      let textTransferDate =
        (initialValues.from_transfer_date
          ? moment(initialValues.from_transfer_date).format("DD-MM-YYYY HH:mm")
          : "??") +
        " ~ " +
        (initialValues.to_transfer_date
          ? moment(initialValues.to_transfer_date).format("DD-MM-YYYY HH:mm")
          : "??");
      list.push({
        key: "transfer_date",
        name: "Ngày chuyển",
        value: textTransferDate,
      });
    }
    if (initialValues.received_by.length && initialValues.received_by[0]) {
      let textAccount = "";
      if (initialValues.received_by.length > 1) {
        initialValues.received_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code + "; "
            : textAccount;
        });
      } else if (initialValues.received_by.length === 1) {
        initialValues.received_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code
            : textAccount;
        });
      }

      list.push({
        key: "received_by",
        name: "Người nhận",
        value: textAccount,
      });
    }
    if (initialValues.from_receive_date || initialValues.to_receive_date) {
      let textReceiveDate =
        (initialValues.from_receive_date
          ? moment(initialValues.from_receive_date).format("DD-MM-YYYY HH:mm")
          : "??") +
        " ~ " +
        (initialValues.to_receive_date
          ? moment(initialValues.to_receive_date).format("DD-MM-YYYY HH:mm")
          : "??");
      list.push({
        key: "receive_date",
        name: "Ngày nhận",
        value: textReceiveDate,
      });
    }
    if (initialValues.cancel_by.length && initialValues.cancel_by[0]) {
      let textAccount = "";
      if (initialValues.cancel_by.length > 1) {
        initialValues.cancel_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code + "; "
            : textAccount;
        });
      } else if (initialValues.cancel_by.length === 1) {
        initialValues.cancel_by.forEach((i) => {
          const findAccount = accounts?.find((item) => item.code === i);
          textAccount = findAccount
            ? textAccount + findAccount.full_name + " - " + findAccount.code
            : textAccount;
        });
      }

      list.push({
        key: "cancel_by",
        name: "Người hủy",
        value: textAccount,
      });
    }
    if (initialValues.from_cancel_date || initialValues.to_cancel_date) {
      let textCancelDate =
        (initialValues.from_cancel_date
          ? moment(initialValues.from_cancel_date).format("DD-MM-YYYY HH:mm")
          : "??") +
        " ~ " +
        (initialValues.to_cancel_date
          ? moment(initialValues.to_cancel_date).format("DD-MM-YYYY HH:mm")
          : "??");
      list.push({
        key: "cancel_date",
        name: "Ngày hủy",
        value: textCancelDate,
      });
    }

    if (initialValues.from_pending_date || initialValues.to_pending_date) {
      let textPendingDate =
        (initialValues.from_pending_date
          ? moment(initialValues.from_pending_date).format("DD-MM-YYYY HH:mm")
          : "??") +
        " ~ " +
        (initialValues.to_pending_date
          ? moment(initialValues.to_pending_date).format("DD-MM-YYYY HH:mm")
          : "??");
      list.push({
        key: "pending_date",
        name: "Ngày chờ xử lý",
        value: textPendingDate,
      });
    }

    return list;
  }, [initialValues, accounts]);

  return (
    <InventoryFiltersWrapper>
      <div className="custom-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions} actionDisable={isLoadingAction}>
          <Form
            form={formSearch}
            onFinish={onFinish}
            ref={formSearchRef}
            initialValues={initialValues}
            layout="inline"
          >
            <Item name="from_store_id" className="select-item">
              <TreeStore
                defaultOpen={activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_RECEIVE}
                ref={fromStoreSelectRef}
                placeholder="Kho gửi"
                storeByDepartmentList={stores as unknown as StoreByDepartment[]}
                style={{ width: 280 }}
              />
            </Item>
            <Item name="to_store_id" className="select-item">
              <TreeStore
                defaultOpen={activeTab === InventoryTransferTabUrl.LIST_TRANSFERRING_SENDER}
                ref={toStoreSelectRef}
                placeholder="Kho nhận"
                storeByDepartmentList={stores as unknown as StoreByDepartment[]}
                style={{ width: 280 }}
              />
            </Item>
            <Item name="condition" className="input-search">
              <Input
                ref={inputSearchRef}
                className="input-search"
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã phiếu chuyển, SKU"
                onBlur={(e) => {
                  formSearchRef?.current?.setFieldsValue({
                    condition: e.target.value.trim(),
                  });
                }}
              />
            </Item>
            <Item>
              <Button
                style={{ width: "80px" }}
                type="primary"
                loading={loadingFilter}
                disabled={isLoadingAction}
                htmlType="submit"
              >
                Lọc
              </Button>
            </Item>
            <Item>
              <Button style={{ width: "180px" }} icon={<FilterOutlined />} onClick={openFilter}>
                Thêm bộ lọc
              </Button>
            </Item>
            <ButtonSetting onClick={onShowColumnSetting} />
          </Form>
        </CustomFilter>
      </div>
      <BaseFilter
        onClearFilter={onClearFilterClick}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        className="order-filter-drawer"
        width={800}
      >
        {visible && (
          <Form ref={formRef} form={formAdv} layout="vertical" initialValues={initialValues}>
            <BaseFilterWrapper>
              <Row gutter={12} style={{ marginTop: "10px" }}>
                <Col span={12}>
                  <Item label="Trạng thái" name="status" style={{ margin: "10px 0px" }}>
                    <CustomSelect
                      maxTagCount="responsive"
                      mode="multiple"
                      style={{ width: "100%" }}
                      showArrow
                      placeholder="Chọn trạng thái"
                      notFoundContent="Không tìm thấy kết quả"
                      optionFilterProp="children"
                      getPopupContainer={(trigger) => trigger.parentNode}
                    >
                      {STATUS_INVENTORY_TRANSFER_ARRAY.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.value}
                        >
                          {item.name}
                        </CustomSelect.Option>
                      ))}
                    </CustomSelect>
                  </Item>
                </Col>
                <Col span={12} />
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Item label="Người tạo" name="created_by">
                    <AccountSearchPaging defaultAccountProps={defaultAccountProps} placeholder="Chọn người tạo" mode="multiple" />
                  </Item>
                </Col>
                <Col span={12}>
                  <div className="label-date">Ngày tạo</div>
                  <CustomFilterDatePicker
                    fieldNameFrom="from_created_date"
                    fieldNameTo="to_created_date"
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Item label="Người chuyển" name="transfer_by">
                    <AccountSearchPaging defaultAccountProps={defaultAccountProps} placeholder="Chọn người chuyển" mode="multiple" />
                  </Item>
                </Col>
                <Col span={12}>
                  <div className="label-date">Ngày chuyển</div>
                  <CustomFilterDatePicker
                    fieldNameFrom="from_transfer_date"
                    fieldNameTo="to_transfer_date"
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Item label="Người nhận" name="received_by">
                    <AccountSearchPaging defaultAccountProps={defaultAccountProps} placeholder="Chọn người nhận" mode="multiple" />
                  </Item>
                </Col>
                <Col span={12}>
                  <div className="label-date">Ngày nhận</div>
                  <CustomFilterDatePicker
                    fieldNameFrom="from_receive_date"
                    fieldNameTo="to_receive_date"
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Item label="Người hủy" name="cancel_by">
                    <AccountSearchPaging defaultAccountProps={defaultAccountProps} placeholder="Chọn người hủy" mode="multiple" />
                  </Item>
                </Col>
                <Col span={12}>
                  <div className="label-date">Ngày hủy</div>
                  <CustomFilterDatePicker
                    fieldNameFrom="from_cancel_date"
                    fieldNameTo="to_cancel_date"
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Item name="note" label="Ghi chú">
                    <Input className="w-100" placeholder="Nhập ghi chú để tìm kiếm" />
                  </Item>
                </Col>
                <Col span={12}>
                  <div className="label-date">Ngày chờ xử lý</div>
                  <CustomFilterDatePicker
                    fieldNameFrom="from_pending_date"
                    fieldNameTo="to_pending_date"
                    activeButton={dateClick}
                    setActiveButton={setDateClick}
                    formRef={formRef}
                  />
                </Col>
              </Row>
            </BaseFilterWrapper>
          </Form>
        )}
      </BaseFilter>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index) => {
            return (
              <Tag key={index} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </InventoryFiltersWrapper>
  );
};

export default InventoryFilters;
