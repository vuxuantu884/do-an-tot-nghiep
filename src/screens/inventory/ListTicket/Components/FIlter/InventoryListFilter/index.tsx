import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Select,
  Tag,
  InputNumber,
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
import { InventoryTransferSearchQuery, Store } from "model/inventory/transfer";
import { BaseFilterWrapper, InventoryFiltersWrapper } from "./styles";
import { STATUS_INVENTORY_TRANSFER_ARRAY } from "screens/inventory/ListTicket/constants";
import ButtonSetting from "component/table/ButtonSetting";
import "assets/css/custom-filter.scss";
import { FormatTextMonney } from "utils/FormatMonney";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import { strForSearch } from "utils/StringUtils";
import CustomFilterDatePicker from "component/custom/filter-date-picker.custom";
import { formatDateFilter, getEndOfDayCommon, getStartOfDayCommon } from "utils/DateUtils";

type OrderFilterProps = {
  params: InventoryTransferSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: Boolean;
  accounts: Array<AccountResponse> | undefined;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery| Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void
  stores?: Array<Store>;
  accountStoresSelected?: any;
  setAccountStoresSelected?: (value: any) => void;
};

const { Item } = Form;
const { Option } = Select;

const InventoryFilters: React.FC<OrderFilterProps> = (
  props: OrderFilterProps
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
    status: Array.isArray(params.status) ? params.status : [params.status],
    created_by: Array.isArray(params.created_by) ? params.created_by : [params.created_by],
    from_created_date: formatDateFilter(params.from_created_date),
    to_created_date: formatDateFilter(params.to_created_date),
    from_transfer_date: formatDateFilter(params.from_transfer_date),
    to_transfer_date: formatDateFilter(params.to_transfer_date),
    from_receive_date: formatDateFilter(params.from_receive_date),
    to_receive_date: formatDateFilter(params.to_receive_date),
  };
  const initialValues = useMemo(() => {
    return filterFromParams;
  }, [filterFromParams])

  useEffect(() => {
    if (!accountStoresSelected) {
      formSearchRef.current?.setFieldsValue(params);
      return;
    }

    if (accountStoresSelected === 'SECOND_SEARCH') return;

    formSearchRef.current?.setFieldsValue({
      ...params,
      from_store_id: params.from_store_id ? params.from_store_id : String(accountStoresSelected.id)
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

    formSearchRef?.current?.setFieldsValue({
      condition: "",
      from_store_id: '',
      to_store_id: '',
    })

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
    [onMenuClick]
  );

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch(tag.key) {
        case 'status':
          onFilter && onFilter({...params, status: []});
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
        case 'created_by':
          onFilter && onFilter({...params, created_by: []});
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
        from_transfer_date: formAdv.getFieldValue('from_transfer_date')
          ? getStartOfDayCommon(formAdv.getFieldValue('from_transfer_date'))?.format()
          : null,
        to_transfer_date: formAdv.getFieldValue('to_transfer_date')
          ? getEndOfDayCommon(formAdv.getFieldValue('to_transfer_date'))?.format()
          : null,
        from_receive_date: formAdv.getFieldValue('from_receive_date')
          ? getStartOfDayCommon(formAdv.getFieldValue('from_receive_date'))?.format()
          : null,
        to_receive_date: formAdv.getFieldValue('to_receive_date')
          ? getEndOfDayCommon(formAdv.getFieldValue('to_receive_date'))?.format()
          : null,
      }
      setAccountStoresSelected && setAccountStoresSelected('SECOND_SEARCH');
      onFilter && onFilter(valuesForm);
    },
    [formAdv, onFilter, setAccountStoresSelected]
  );

  let filters = useMemo(() => {
    let list = []
    if (initialValues.status.length && initialValues.status[0]) {
      let textStatus = ""
      if (initialValues.status.length > 1) {
        initialValues.status.forEach((statusValue) => {
          const status = STATUS_INVENTORY_TRANSFER_ARRAY?.find(status => status.value === statusValue)
            textStatus = status ? textStatus + status.name + "; " : textStatus
        })
      } else if (initialValues.status.length === 1) {

        initialValues.status.forEach((statusValue) => {
          const status = STATUS_INVENTORY_TRANSFER_ARRAY?.find(status => status.value === statusValue)
            textStatus = status ? textStatus + status.name : textStatus
        })

      }

      list.push({
        key: 'status',
        name: 'Trạng thái',
        value: textStatus
      })
    }
    if (initialValues.from_total_variant || initialValues.to_total_variant) {
      let textTotalVariant = (initialValues.from_total_variant ? initialValues.from_total_variant : " ?? ") + " ~ " + (initialValues.to_total_variant ? initialValues.to_total_variant : " ?? ")
      list.push({
        key: 'total_variant',
        name: 'Sản phẩm',
        value: textTotalVariant
      })
    }
    if (initialValues.from_total_quantity || initialValues.to_total_quantity) {
      let textTotalQuantity = (initialValues.from_total_quantity ? initialValues.from_total_quantity : " ?? ") + " ~ " + (initialValues.to_total_quantity ? initialValues.to_total_quantity : " ?? ")
      list.push({
        key: 'total_quantity',
        name: 'Số lượng',
        value: textTotalQuantity
      })
    }
    if (initialValues.from_total_amount || initialValues.to_total_amount) {
      let textTotalAmount = (initialValues.from_total_amount ? FormatTextMonney(initialValues.from_total_amount) : " 0 ") + " ~ " + (initialValues.to_total_amount ? FormatTextMonney(initialValues.to_total_amount) : " 0 ")
      list.push({
        key: 'total_amount',
        name: 'Thành tiền',
        value: textTotalAmount
      })
    }
    if (initialValues.created_by.length && initialValues.created_by[0]) {
      let textAccount = ""
      if (initialValues.created_by.length > 1) {
        initialValues.created_by.forEach((i) => {
          const findAccount = accounts?.find(item => item.code === i)
            textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code + "; " : textAccount
        })
      } else if (initialValues.created_by.length === 1) {

        initialValues.created_by.forEach((i) => {
          const findAccount = accounts?.find(item => item.code === i)
          textAccount = findAccount ? textAccount + findAccount.full_name + " - " + findAccount.code : textAccount
        })

      }

      list.push({
        key: 'created_by',
        name: 'Người tạo',
        value: textAccount
      })
    }
    if (initialValues.from_created_date || initialValues.to_created_date) {
      let textCreatedDate = (initialValues.from_created_date ? moment(initialValues.from_created_date).format('DD-MM-YYYY') : '??') + " ~ " + (initialValues.to_created_date ? moment(initialValues.to_created_date).format('DD-MM-YYYY') : '??')
      list.push({
        key: 'created_date',
        name: 'Ngày tạo',
        value: textCreatedDate
      })
    }
    if (initialValues.from_transfer_date || initialValues.to_transfer_date) {
      let textTransferDate = (initialValues.from_transfer_date ? moment(initialValues.from_transfer_date).format('DD-MM-YYYY'): '??') + " ~ " + (initialValues.to_transfer_date ? moment(initialValues.to_transfer_date).format('DD-MM-YYYY') : '??')
      list.push({
        key: 'transfer_date',
        name: 'Ngày chuyển',
        value: textTransferDate
      })
    }
    if (initialValues.from_receive_date || initialValues.to_receive_date) {
      let textReceiveDate = (initialValues.from_receive_date ? moment(initialValues.from_receive_date).format('DD-MM-YYYY') : '??') + " ~ " + (initialValues.to_receive_date ? moment(initialValues.to_receive_date).format('DD-MM-YYYY') : '??')
      list.push({
        key: 'receive_date',
        name: 'Ngày nhận',
        value: textReceiveDate
      })
    }

    return list
  }, [initialValues, accounts]);

  return (
    <InventoryFiltersWrapper>
      <div className="custom-filter">
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
              <Item
                name="from_store_id"
                className="select-item"
              >
                <Select
                  style={{width: '200px'}}
                  optionFilterProp="children"
                  placeholder="Kho gửi"
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
                  style={{width: '200px'}}
                  placeholder="Kho nhận"
                  showArrow
                  showSearch
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
                  className="input-search"
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
        width={700}
      >
        {visible && <Form
          onFinish={onFinish}
          ref={formRef}
          form={formAdv}
          layout="vertical"
          initialValues={initialValues}
        >
          <BaseFilterWrapper>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={12}>
                <Item label="Trạng thái" name="status" style={{ margin: "10px 0px" }}>
                  <CustomSelect
                    maxTagCount="responsive"
                    mode="multiple"
                    style={{ width: '100%'}}
                    showArrow
                    placeholder="Chọn trạng thái"
                    notFoundContent="Không tìm thấy kết quả"
                    optionFilterProp="children"
                    getPopupContainer={trigger => trigger.parentNode}
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
              <Col span={12}>
                <div className="label">Sản phẩm</div>
                <Input.Group compact>
                  <Item name="from_total_variant" style={{ width: '45%', textAlign: 'center' }}>
                    <InputNumber
                      className="price_min"
                      placeholder="Từ"
                      min="0"
                      max="100000000"
                    />
                  </Item>
                  <div
                    className="site-input-split"
                  >~</div>
                  <Item name="to_total_variant" style={{width: '45%',textAlign: 'center'}}>
                    <InputNumber
                      className="site-input-right price_max"
                      placeholder="Đến"
                      min="0"
                      max="1000000000"
                    />
                  </Item>
                </Input.Group>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}} className="price">
              <Col span={12}>
                <div className="label">Số lượng</div>
                <Input.Group compact>
                  <Item name="from_total_quantity" style={{ width: '45%', textAlign: 'center' }}>
                    <InputNumber
                      className="price_min"
                      placeholder="Từ"
                      min="0"
                      max="100000000"
                    />
                  </Item>
                  <div
                    className="site-input-split"
                  >~</div>
                  <Item name="to_total_quantity" style={{width: '45%',textAlign: 'center'}}>
                    <InputNumber
                      className="site-input-right price_max"
                      placeholder="Đến"
                      min="0"
                      max="1000000000"
                    />
                  </Item>
                </Input.Group>
              </Col>
              <Col span={12}>
                <div className="label">Thành tiền</div>
                <Input.Group compact>
                  <Item name="from_total_amount" style={{ width: '45%', textAlign: 'center' }}>
                    <InputNumber
                      className="price_min"
                      placeholder="Từ"
                      formatter={value => FormatTextMonney(value ? parseInt(value) : 0)}
                      min="0"
                      max="100000000"
                    />
                  </Item>
                  <div
                    className="site-input-split"
                  >~</div>
                  <Item name="to_total_amount" style={{width: '45%',textAlign: 'center'}}>
                    <InputNumber
                      className="site-input-right price_max"
                      placeholder="Đến"
                      formatter={value => FormatTextMonney(value ? parseInt(value) : 0)}
                      min="0"
                      max="1000000000"
                    />
                  </Item>
                </Input.Group>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={12}>
                <Item label="Người tạo" name="created_by">
                  <AccountSearchPaging placeholder="Chọn người tạo" mode="multiple"/>
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
            <Row gutter={12} style={{marginTop: '10px'}}>
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

export default InventoryFilters;
