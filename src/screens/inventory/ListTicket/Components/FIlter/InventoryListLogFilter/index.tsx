import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Tag,
} from "antd";

import { MenuAction } from "component/table/ActionButton";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { FilterOutlined } from "@ant-design/icons";
import CustomSelect from "component/custom/select.custom";
import { OrderSearchQuery } from "model/order/order.model";
import moment from "moment";
import BaseFilter from "component/filter/base.filter";
import { InventoryTransferLogSearchQuery, Store } from "model/inventory/transfer";
import { BaseFilterWrapper, InventoryFiltersWrapper } from "./styles";
import ButtonSetting from "component/table/ButtonSetting";
import "assets/css/custom-filter.scss";
import { AppConfig } from "config/app.config";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { strForSearch } from "utils/StringUtils";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";

const ACTIONS_STATUS_ARRAY = [
  {
    value: 'CREATE',
    name: 'Tạo phiếu chuyển kho',
  },
  {
    value: 'UPDATE',
    name: 'Sửa phiếu chuyển kho',
  },
  {
    value: 'CANCEL',
    name: 'Huỷ phiếu chuyển kho',
  },
  {
    value: 'CONFIRM_EXCEPTION',
    name: 'Xác nhận hàng thừa thiếu',
  },
  {
    value: 'CREATE_SHIPMENT',
    name: 'Tạo mới đơn vận chuyển',
  },
  {
    value: 'CANCEL_SHIPMENT',
    name: 'Huỷ đơn vận chuyển',
  },
  {
    value: 'EXPORT_SHIPMENT',
    name: 'Xuất hàng khỏi kho',
  },
  {
    value: 'RECEIVE',
    name: 'Nhận hàng',
  }
];

type InventoryFilterProps = {
  params: InventoryTransferLogSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: Boolean;
  accounts: Array<AccountResponse> | undefined;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery| Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  stores?: Array<Store>;
  accountStoresSelected?: any;
  setAccountStoresSelected?: (value: any) => void;
};

const { Item } = Form;
const { Option } = Select;

const InventoryListLogFilters: React.FC<InventoryFilterProps> = (
  props: InventoryFilterProps
) => {
  const {
    params,
    actions,
    isLoading,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting,
    stores,
    accounts,
    accountStoresSelected,
    setAccountStoresSelected
  } = props;
  const [formAdv] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterFromParams = {
    ...params,
    action: Array.isArray(params.action) ? params.action : [params.action],
    updated_by: Array.isArray(params.updated_by) ? params.updated_by : [params.updated_by],
    from_created_date: formatDateFilter(params.from_created_date),
    to_created_date: formatDateFilter(params.to_created_date),
  };
  const initialValues = useMemo(() => {
    return filterFromParams;
  }, [filterFromParams]);

  useEffect(() => {
    if (!accountStoresSelected) {
      formSearchRef.current?.setFieldsValue({
        ...params,
        from_store_id: params.from_store_id ? params.from_store_id : [],
        to_store_id: params.to_store_id ? params.to_store_id : []
      });
      return;
    }

    if (accountStoresSelected === 'SECOND_SEARCH') return;

    formSearchRef.current?.setFieldsValue({
      ...params,
      from_store_id: params.from_store_id ? params.from_store_id : String(accountStoresSelected.id),
      to_store_id: params.to_store_id ? params.to_store_id : []
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountStoresSelected])

  useEffect(() => {
    formAdv.setFieldsValue(filterFromParams);
  }, [filterFromParams, formAdv, formSearchRef, params]);

  const [visible, setVisible] = useState(false);
  const [dateClick, setDateClick] = useState('');

  const loadingFilter = useMemo(() => {
    return !!isLoading
  }, [isLoading])

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);

  const onClearFilterClick = useCallback(() => {
    onClearFilter && onClearFilter();

    setVisible(false);
  }, [onClearFilter]);

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
    [onMenuClick]
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();

      switch(tag.key) {
        case 'action':
          onFilter && onFilter({...params, action: []});
          break;
        case 'updated_by':
          onFilter && onFilter({...params, updated_by: []});
          break;
        case 'created_date':
          formAdv.resetFields(['from_created_date', 'to_created_date'])
          onFilter && onFilter({...params, from_created_date: null, to_created_date: null});
          break;
        default: break
      }
    },
    [formAdv, onFilter, params]
  );

  const onFinish = useCallback(
    (values) => {
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
          ? getStartOfDayCommon(formAdv.getFieldValue('from_created_date'))?.format()
          : null,
        to_created_date: formAdv.getFieldValue('to_created_date')
          ? getEndOfDayCommon(formAdv.getFieldValue('to_created_date'))?.format()
          : null,
      }

      setAccountStoresSelected && setAccountStoresSelected('SECOND_SEARCH')
      onFilter && onFilter(valuesForm);
    },
    [formAdv, onFilter, setAccountStoresSelected]
  );

  let filters = useMemo(() => {
    let list = []
    if (initialValues.action.length) {
      let textAction = ""

      if (initialValues.action.length > 1) {

        initialValues.action.forEach(actionValue => {
          const status = ACTIONS_STATUS_ARRAY?.find(status => status.value === actionValue)
          textAction = status ? textAction + status.name + "; " : textAction
        })

      } else if (initialValues.action.length === 1) {

        initialValues.action.forEach(actionValue => {
          const status = ACTIONS_STATUS_ARRAY?.find(status => status.value === actionValue)
          textAction = status ? textAction + status.name : textAction
        })

      }

      list.push({
        key: 'action',
        name: 'Trạng thái',
        value: textAction
      })
    }
    if (initialValues.updated_by.length) {
      let textAccount = ""

      if (initialValues.updated_by.length > 1) {

      initialValues.updated_by.forEach(i => {
        const findAccount = accounts?.find(item => item.code === i)
        textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
      })

      } else if (initialValues.updated_by.length === 1) {

        initialValues.updated_by.forEach(i => {
          const findAccount = accounts?.find(item => item.code === i)
          textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
        })

      }

      list.push({
        key: 'updated_by',
        name: 'Người sửa',
        value: textAccount
      })
    }
    if (initialValues.from_created_date || initialValues.to_created_date) {
      let textCreatedDate = (initialValues.from_created_date ? moment(initialValues.from_created_date).format('DD-MM-YYYY') : '??') + " ~ " + (initialValues.to_created_date ?  moment(initialValues.to_created_date).format('DD-MM-YYYY') : '??')
      list.push({
        key: 'created_date',
        name: 'Ngày tạo',
        value: textCreatedDate
      })
    }

    return list
  }, [initialValues, accounts]);

  return (
    <InventoryFiltersWrapper>
      <div className="custom-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions} actionDisable>
        <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
            <Item
              name="from_store_id"
              className="select-item"
            >
              <Select
                style={{width: '200px'}}
                placeholder="Kho gửi"
                maxTagCount={'responsive' as const}
                mode="multiple"
                showArrow
                showSearch
                allowClear
                onClear={() => formSearchRef?.current?.submit()}
                filterOption={(input: String, option: any) => {
                  if (option.props.value) {
                    return strForSearch(option.props.children).includes(strForSearch(input));
                  }

                  return false;
                }}
              >
                {Array.isArray(stores) &&
                  stores.length > 0 &&
                  stores.map((item, index) => (
                    <Option
                      key={"from_store_id" + index}
                      value={item.id.toString()}
                    >
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Item>
            <Item
              name="to_store_id"
              className="select-item"
            >
              <Select
                style={{width: '180px'}}
                placeholder="Kho nhận"
                showArrow
                showSearch
                maxTagCount={'responsive' as const}
                mode="multiple"
                optionFilterProp="children"
                allowClear
                onClear={() => formSearchRef?.current?.submit()}
                filterOption={(input: String, option: any) => {
                  if (option.props.value) {
                    return strForSearch(option.props.children).includes(strForSearch(input));
                  }

                  return false;
                }}
              >
                {Array.isArray(stores) &&
                  stores.length > 0 &&
                  stores.map((item, index) => (
                    <Option
                      key={"to_store_id" + index}
                      value={item.id.toString()}
                    >
                      {item.name}
                    </Option>
                  ))}
              </Select>
            </Item >
            <Item name="condition" className="input-search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo ID phiếu, tên sản phẩm"
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
              <Button style={{width: '180px'}} icon={<FilterOutlined />} onClick={openFilter}>Thêm bộ lọc</Button>
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
        width={500}
      >
        {visible && <Form
          onFinish={onFinish}
          ref={formRef}
          form={formAdv}
          // initialValues={initialValues}
          layout="vertical"
        >
          <BaseFilterWrapper>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={12}>
                <Item label="Người sửa" name="updated_by">
                  <AccountSearchPaging
                    mode="tags"
                    placeholder="Chọn người sửa"
                    fixedQuery={{ account_id: [AppConfig.WIN_DEPARTMENT],status: "active" }}
                  />
                </Item>
              </Col>
              <Col span={12}>
                <Item label="Thao tác" name="action">
                  <CustomSelect
                    mode="multiple"
                    style={{ width: '100%'}}
                    showArrow
                    placeholder="Chọn thao tác"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
                  >
                    {ACTIONS_STATUS_ARRAY.map((item, index) => (
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
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
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
    </InventoryFiltersWrapper>
  );
};

export default InventoryListLogFilters;
