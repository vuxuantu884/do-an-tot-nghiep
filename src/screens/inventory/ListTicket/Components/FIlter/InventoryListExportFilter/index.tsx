import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Tag,
} from "antd";

import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import search from "assets/img/search.svg";
import { AccountResponse, AccountStoreResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { FilterOutlined } from "@ant-design/icons";
import { OrderSearchQuery } from "model/order/order.model";
import moment from "moment";
import BaseFilter from "component/filter/base.filter";
import {
  InventoryTransferImportExportSearchQuery,
  Store,
} from "model/inventory/transfer";
import { BaseFilterWrapper, InventoryExportFiltersWrapper } from "./styles";
import "assets/css/custom-filter.scss";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { formatDateFilter, formatDateTimeFilter } from "utils/DateUtils";
import TreeStore from "screens/products/inventory/filter/TreeStore";
import { useDispatch } from "react-redux";
import { StoreResponse } from "model/core/store.model";
import { callApiNative } from "utils/ApiUtils";
import { getStoreApi } from "service/inventory/transfer/index.service";

type InventoryExportFiltersProps = {
  accountStores?: Array<AccountStoreResponse>,
  params: InventoryTransferImportExportSearchQuery;
  isLoading?: Boolean;
  accounts: Array<AccountResponse> | undefined;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery| Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void
  stores?: Array<Store>;
  activeTab?: string;
};

const { Item } = Form;

const InventoryExportFilters: React.FC<InventoryExportFiltersProps> = (
  props: InventoryExportFiltersProps
) => {
  const {
    params,
    isLoading,
    onClearFilter,
    onFilter,
    accounts,
    activeTab,
    accountStores,
  } = props;
  const [formAdv] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();
  const dispatch = useDispatch();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterFromParams = {
    ...params,
    received_code: Array.isArray(params.received_code) ? params.received_code : [params.received_code],
    from_transfer_date: formatDateFilter(params.from_transfer_date),
    to_transfer_date: formatDateFilter(params.to_transfer_date),
    from_receive_date: formatDateFilter(params.from_receive_date),
    to_receive_date: formatDateFilter(params.to_receive_date),
    from_pending_date: formatDateFilter(params.from_pending_date),
    to_pending_date: formatDateFilter(params.to_pending_date),
  };
  const initialValues = useMemo(() => {
    return filterFromParams;
  }, [filterFromParams])

  useEffect(() => {
    if (activeTab === '') return;

    formSearchRef.current?.setFieldsValue({
      ...params,
      from_store_id: params.from_store_id && (Array.isArray(params.from_store_id) && params.from_store_id.length > 0) ? params.from_store_id.map((i) => Number(i)) : [],
      to_store_id: params.to_store_id && (Array.isArray(params.to_store_id) && params.to_store_id.length > 0) ? params.to_store_id.map((i) => Number(i)) : []
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, accountStores])

  useEffect(() => {
    formAdv.setFieldsValue(filterFromParams);
  }, [filterFromParams, formAdv, formSearchRef, params]);

  const [visible, setVisible] = useState(false);
  const [listStore, setListStore] = useState<Array<StoreResponse>>();
  const [dateClick, setDateClick] = useState('');

  const loadingFilter = useMemo(() => {
    return !!isLoading
  }, [isLoading])

  const onFilterClick = useCallback(() => {
    setVisible(false);
    let values = formAdv.getFieldsValue(true);

    if (values?.from_total_variant > values?.to_total_variant) {
      values = {
        ...values,
        from_total_variant: values?.to_total_variant,
        to_total_variant: values?.from_total_variant,
      }
    }
    if (values?.from_total_quantity > values?.to_total_quantity) {
      values = {
        ...values,
        from_total_quantity: values?.to_total_quantity,
        to_total_quantity: values?.from_total_quantity,
      }
    }
    if (values?.from_total_amount > values?.to_total_amount) {
      values = {
        ...values,
        from_total_amount: values?.to_total_amount,
        to_total_amount: values?.from_total_amount,
      }
    }
    const valuesForm = {
      ...values,
      condition: values.condition ? values.condition.trim() : null,
      from_created_date: formAdv.getFieldValue('from_created_date')
        ? formatDateTimeFilter(formAdv.getFieldValue('from_created_date'), 'DD/MM/YYYY HH:mm')?.format()
        : null,
      to_created_date: formAdv.getFieldValue('to_created_date')
        ? formatDateTimeFilter(formAdv.getFieldValue('to_created_date'), 'DD/MM/YYYY HH:mm')?.format()
        : null,
      from_transfer_date: formAdv.getFieldValue('from_transfer_date')
        ? formatDateTimeFilter(formAdv.getFieldValue('from_transfer_date'), 'DD/MM/YYYY HH:mm')?.format()
        : null,
      to_transfer_date: formAdv.getFieldValue('to_transfer_date')
        ? formatDateTimeFilter(formAdv.getFieldValue('to_transfer_date'), 'DD/MM/YYYY HH:mm')?.format()
        : null,
      from_receive_date: formAdv.getFieldValue('from_receive_date')
        ? formatDateTimeFilter(formAdv.getFieldValue('from_receive_date'), 'DD/MM/YYYY HH:mm')?.format()
        : null,
      to_receive_date: formAdv.getFieldValue('to_receive_date')
        ? formatDateTimeFilter(formAdv.getFieldValue('to_receive_date'), 'DD/MM/YYYY HH:mm')?.format()
        : null,
      from_cancel_date: formAdv.getFieldValue('from_cancel_date')
        ? formatDateTimeFilter(formAdv.getFieldValue('from_cancel_date'), 'DD/MM/YYYY HH:mm')?.format()
        : null,
      to_cancel_date: formAdv.getFieldValue('to_cancel_date')
        ? formatDateTimeFilter(formAdv.getFieldValue('to_cancel_date'), 'DD/MM/YYYY HH:mm')?.format()
        : null,
    }
    onFilter && onFilter(valuesForm);
  }, [formAdv, onFilter]);

  const onClearFilterClick = useCallback(() => {
    onClearFilter && onClearFilter();

    formSearchRef?.current?.setFieldsValue({
      condition: "",
      from_store_id: [],
      to_store_id: [],
    })

    setVisible(false);
  }, [formSearchRef, onClearFilter]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch(tag.key) {
        case 'status':
          onFilter && onFilter({...params, status: []});
          break;
        case 'note':
          onFilter && onFilter({...params, note: null});
          break;
        case 'total_variant':
          onFilter && onFilter({...params, from_total_variant: null, to_total_variant: null});
          break;
        case 'total_quantity':
          onFilter && onFilter({...params, from_total_quantity: null, to_total_quantity: null});
          break;
        case 'total_amount':
          onFilter && onFilter({...params, from_total_amount: null, to_total_amount: null});
          break;
        case 'received_code':
          onFilter && onFilter({...params, received_code: []});
          break;
        case 'created_date':
          onFilter && onFilter({...params, from_created_date: null, to_created_date: null});
          formAdv.resetFields(['from_created_date', 'to_created_date'])
          break;
        case 'transfer_date':
          onFilter && onFilter({...params, from_transfer_date: null, to_transfer_date: null});
          formAdv.resetFields(['from_transfer_date', 'to_transfer_date'])
          break;
        case 'receive_date':
          onFilter && onFilter({...params, from_receive_date: null, to_receive_date: null});
          formAdv.resetFields(['from_receive_date', 'to_receive_date'])
          break;
        case 'cancel_date':
          onFilter && onFilter({...params, from_cancel_date: null, to_cancel_date: null});
          formAdv.resetFields(['from_cancel_date', 'to_cancel_date'])
          break;
        default: break
      }
    },
    [formAdv, onFilter, params]
  );

  const onFinish = useCallback(
    (values) => {
      const valuesForm = {
        ...values,
        condition: values.condition ? values.condition.trim() : null,
      }
      onFilter && onFilter(valuesForm);
    },
    [onFilter]
  );

  let filters = useMemo(() => {
    let list = []
    if (initialValues.note && initialValues.note !== '') {
      list.push({
        key: 'note',
        name: 'Ghi chú',
        value: initialValues.note
      });
    }
    console.log(initialValues)
    if (initialValues.received_code.length && initialValues.received_code[0]) {
      let textAccount = ""
      if (initialValues.received_code.length > 1) {
        initialValues.received_code.forEach((i) => {
          const findAccount = accounts?.find(item => item.code === i)
          textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
        })
      } else if (initialValues.received_code.length === 1) {

        initialValues.received_code.forEach((i) => {
          const findAccount = accounts?.find(item => item.code === i)
          textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code : textAccount
        })

      }

      list.push({
        key: 'received_code',
        name: 'Người nhận',
        value: textAccount
      })
    }
    if (initialValues.from_transfer_date || initialValues.to_transfer_date) {
      let textTransferDate = (initialValues.from_transfer_date ? moment(initialValues.from_transfer_date)
        .format('DD-MM-YYYY HH:mm'): '??') + " ~ " + (initialValues.to_transfer_date ? moment(initialValues.to_transfer_date)
        .format('DD-MM-YYYY HH:mm') : '??')
      list.push({
        key: 'transfer_date',
        name: 'Ngày gửi',
        value: textTransferDate
      })
    }
    if (initialValues.from_receive_date || initialValues.to_receive_date) {
      let textReceiveDate = (initialValues.from_receive_date ? moment(initialValues.from_receive_date)
        .format('DD-MM-YYYY HH:mm') : '??') + " ~ " + (initialValues.to_receive_date ? moment(initialValues.to_receive_date)
        .format('DD-MM-YYYY HH:mm') : '??')
      list.push({
        key: 'receive_date',
        name: 'Ngày nhận',
        value: textReceiveDate
      })
    }
    if (initialValues.from_pending_date || initialValues.to_pending_date) {
      let textCancelDate = (initialValues.from_pending_date ? moment(initialValues.from_pending_date)
        .format('DD-MM-YYYY HH:mm') : '??') + " ~ " + (initialValues.to_pending_date ? moment(initialValues.to_pending_date)
        .format('DD-MM-YYYY HH:mm') : '??')
      list.push({
        key: 'cancel_date',
        name: 'Ngày hủy',
        value: textCancelDate
      })
    }

    return list
  }, [initialValues, accounts]);

  useEffect(() => {
    const getStores = async () => {
      const res = await callApiNative({ isShowError: true }, dispatch, getStoreApi, { status: "active", simple: true })
      if (res) {
        setListStore(res)
      }
    }
    getStores().then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InventoryExportFiltersWrapper>
      <div className="custom-filter-export">
        <CustomFilter>
          <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
            <Item
              name="from_store_id"
              className="select-item"
              style={{width: '170px'}}
            >
              <TreeStore
                name="from_store_id"
                placeholder="Kho gửi"
                listStore={listStore}
              />
            </Item>
            <Item
              name="to_store_id"
              className="select-item"
              style={{width: '170px'}}
            >
              <TreeStore
                name="to_store_id"
                placeholder="Kho nhận"
                listStore={listStore}
              />
            </Item >
            <Item style={{ width: 'calc(100% - 650px)' }} name="condition" className="input-search">
              <Input
                className="input-search"
                prefix={<img src={search} alt="" />}
                placeholder="Mã phiếu chuyển, mã sản phẩm, tên sản phẩm"
                onBlur={(e) => {
                  formSearchRef?.current?.setFieldsValue({
                    condition: e.target.value.trim()
                  })
                }}
              />
            </Item>
            <Item>
              <Button style={{width: '80px'}} type="primary" loading={loadingFilter} htmlType="submit">
                Lọc
              </Button>
            </Item>
            <Item>
              <Button style={{width: '150px'}} icon={<FilterOutlined />} onClick={openFilter}>Thêm bộ lọc</Button>
            </Item>
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
        {visible && <Form
          ref={formRef}
          form={formAdv}
          layout="vertical"
          initialValues={initialValues}
        >
          <BaseFilterWrapper>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={12}>
                <div className="label-date">Ngày gửi</div>
                <CustomFilterDatePicker
                  fieldNameFrom="from_transfer_date"
                  fieldNameTo="to_transfer_date"
                  activeButton={dateClick}
                  setActiveButton={setDateClick}
                  formRef={formRef}
                  format="DD/MM/YYYY HH:mm"
                  showTime
                />
              </Col>
              <Col span={12}>
                <div className="label-date">Ngày nhận</div>
                <CustomFilterDatePicker
                  fieldNameFrom="from_receive_date"
                  fieldNameTo="to_receive_date"
                  activeButton={dateClick}
                  setActiveButton={setDateClick}
                  formRef={formRef}
                  format="DD/MM/YYYY HH:mm"
                  showTime
                />
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={12}>
                <Item label="Người nhận" name="received_code">
                  <AccountSearchPaging placeholder="Chọn người nhận" mode="multiple"/>
                </Item>
              </Col>
              <Col span={12}>
                <Item name="note" label="Ghi chú">
                  <Input placeholder="Tìm kiếm theo nội dung ghi chú" className="w-100" />
                </Item>
              </Col>
            </Row>
          </BaseFilterWrapper>
        </Form>}
      </BaseFilter>
      <div className="order-filter-tags">
        {filters && filters.map((filter: any, index) => {
          return (
            <Tag key={index} className="tag mb-20" closable onClose={(e) => onCloseTag(e, filter)}>{filter.name}: {filter.value}</Tag>
          )
        })}
      </div>
    </InventoryExportFiltersWrapper>
  );
};

export default InventoryExportFilters;
