
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
} from "antd";

import { MenuAction } from "component/table/ActionButton";
import React, { createRef, useCallback, useMemo, useState } from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { SettingOutlined, FilterOutlined } from "@ant-design/icons";
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
import { strForSearch } from "utils/RemoveDiacriticsString";

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

const { Panel } = Collapse;

type InventoryFilterProps = {
  params: InventoryTransferLogSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: Boolean;
  accounts: Array<AccountResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery| Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  stores?: Array<Store>;
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
  } = props;
  const initialValues = useMemo(() => {
    return {
      ...params,
      action: Array.isArray(params.action) ? params.action : [params.action],
      updated_by: Array.isArray(params.updated_by) ? params.updated_by : [params.updated_by],
  }}, [params])

  const [visible, setVisible] = useState(false);
  const [isFromCreatedDate, setIsFromCreatedDate] = useState(initialValues.from_created_date? moment(initialValues.from_created_date, "DD-MM-YYYY") : null);
  const [isToCreatedDate, setIsToCreatedDate] = useState(initialValues.to_created_date? moment(initialValues.to_created_date, "DD-MM-YYYY") : null);

  const loadingFilter = useMemo(() => {
    return isLoading ? true : false
  }, [isLoading])

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const onChangeRangeDate = useCallback(
    (dates, dateString, type) => {
      let fromDateString = null;
      let toDateString = null;

      if (dates) {
        fromDateString = dates[0].hours(0).minutes(0).seconds(0) ?? null;
        toDateString = dates[1].hours(23).minutes(59).seconds(59) ?? null;
      }
      switch(type) {
        case 'create_date':
          setCreateDateClick('')
          setIsFromCreatedDate(fromDateString)
          setIsToCreatedDate(toDateString)
          break;
        default: break
      }
    },
    []
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    formRef.current?.submit();
  }, [formRef]);

  const onClearFilterClick = useCallback(() => {
    onClearFilter && onClearFilter();

    setCreateDateClick('')
    setIsFromCreatedDate(null)
    setIsToCreatedDate(null)

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

  const [createDateClick, setCreateDateClick] = useState('');

  const clickOptionDate = useCallback(
    (type, value) => {
    let minValue = null;
    let maxValue = null;

    switch(value) {
      case 'today':
        minValue = moment().startOf('day')
        maxValue = moment().endOf('day')
        break
      case 'yesterday':
        minValue = moment().startOf('day').subtract(1, 'days')
        maxValue = moment().endOf('day').subtract(1, 'days')
        break
      case 'thisweek':
        minValue = moment().startOf('week')
        maxValue = moment().endOf('week')
        break
      case 'lastweek':
        minValue = moment().startOf('week').subtract(1, 'weeks')
        maxValue = moment().endOf('week').subtract(1, 'weeks')
        break
      case 'thismonth':
        minValue = moment().startOf('month')
        maxValue = moment().endOf('month')
        break
      case 'lastmonth':
        minValue = moment().startOf('month').subtract(1, 'months')
        maxValue = moment().endOf('month').subtract(1, 'months')
        break
      default:
        break
    }

    switch(type) {
      case 'create_date':
        if (createDateClick === value ) {
          setCreateDateClick('')
          setIsFromCreatedDate(null)
          setIsToCreatedDate(null)
        } else {
          setCreateDateClick(value)
          setIsFromCreatedDate(moment(minValue, 'DD-MM-YYYY'))
          setIsToCreatedDate(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      default:
        break
    }
  }, [createDateClick]);

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
          setCreateDateClick('');
          setIsFromCreatedDate(null);
          setIsToCreatedDate(null);
          onFilter && onFilter({...params, from_created_date: null, to_created_date: null});
          break;
        default: break
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
        from_created_date: isFromCreatedDate ? moment(isFromCreatedDate) : null,
        to_created_date: isToCreatedDate ? moment(isToCreatedDate) : null,

      }
      onFilter && onFilter(valuesForm);
    },
    [isFromCreatedDate, isToCreatedDate, onFilter]
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
      <CustomFilter onMenuClick={onActionClick} menu={actions}>
        <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
            <Item
              name="from_store_id"
              className="select-item"
            >
              <Select
                style={{width: '200px'}}
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
                style={{width: '180px'}}
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
          initialValues={params}
          layout="vertical"
        >
          <BaseFilterWrapper>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.updated_by.length ? ["1"]: []}>
                  <Panel header="Người sửa" key="1" className="header-filter">
                    <Item name="updated_by">
                      <AccountSearchPaging
                        mode="tags"
                        placeholder="Chọn người sửa"
                        fixedQuery={{ account_id: [AppConfig.WIN_DEPARTMENT],status: "active" }}
                      />
                    </Item>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.action.length ? ["1"]: []}>
                  <Panel header="Thao tác" key="1" className="header-filter">
                    <Item name="action" style={{ margin: "10px 0px" }}>
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
                  </Panel>

                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.from_created_date && initialValues.to_created_date ? ["1"]: []}>
                  <Panel header="Thời gian" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('create_date', 'yesterday')} className={createDateClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('create_date', 'today')} className={createDateClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('create_date', 'thisweek')} className={createDateClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('create_date', 'lastweek')} className={createDateClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('create_date', 'thismonth')} className={createDateClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('create_date', 'lastmonth')} className={createDateClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[isFromCreatedDate? moment(isFromCreatedDate, "DD-MM-YYYY") : null, isToCreatedDate? moment(isToCreatedDate, "DD-MM-YYYY") : null]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'create_date')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
          </BaseFilterWrapper>
        </Form>}
      </BaseFilter>
      <div className="order-filter-tags">
        {filters && filters.map((filter: any, index) => {
          return (
            <Tag className="tag" closable onClose={(e) => onCloseTag(e, filter)}>{filter.name}: {filter.value}</Tag>
          )
        })}
      </div>
    </InventoryFiltersWrapper>
  );
};

export default InventoryListLogFilters;
