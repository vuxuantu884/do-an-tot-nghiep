
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

import { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useMemo, useState } from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { SettingOutlined, FilterOutlined } from "@ant-design/icons";
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
import { strForSearch } from "utils/RemoveDiacriticsString";

const { Panel } = Collapse;
type OrderFilterProps = {
  params: InventoryTransferSearchQuery;
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
  } = props;
  const initialValues = useMemo(() => {
    return {
      ...params,
      status: Array.isArray(params.status) ? params.status : [params.status],
      created_by: Array.isArray(params.created_by) ? params.created_by : [params.created_by],
  }}, [params])

  const [visible, setVisible] = useState(false);
  const [isFromCreatedDate, setIsFromCreatedDate] = useState(initialValues.from_created_date? moment(initialValues.from_created_date, "DD-MM-YYYY") : null);
  const [isToCreatedDate, setIsToCreatedDate] = useState(initialValues.to_created_date? moment(initialValues.to_created_date, "DD-MM-YYYY") : null);
  const [isFromTransferDate, setIsFromTransferDate] = useState(initialValues.from_transfer_date? moment(initialValues.from_transfer_date, "DD-MM-YYYY") : null);
  const [isToTransferDate, setIsToTransferDate] = useState(initialValues.to_transfer_date? moment(initialValues.to_transfer_date, "DD-MM-YYYY") : null);
  const [isFromReceiveDate, setIsFromReceiveDate] = useState(initialValues.from_receive_date? moment(initialValues.from_receive_date, "DD-MM-YYYY") : null);
  const [isToReceiveDate, setIsToReceiveDate] = useState(initialValues.to_receive_date? moment(initialValues.to_receive_date, "DD-MM-YYYY") : null);

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
        case 'transfer_date':
          setTransferDateClick('')
          setIsFromTransferDate(fromDateString)
          setIsToTransferDate(toDateString)
          break;
        case 'receive_date':
          setTransferDateClick('')
          setIsFromReceiveDate(fromDateString)
          setIsToReceiveDate(toDateString)
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
    setTransferDateClick('')
    setIsFromTransferDate(null)
    setIsToTransferDate(null)
    setReceiveDateClick('')
    setIsFromReceiveDate(null)
    setIsToReceiveDate(null)

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

  const [createDateClick, setCreateDateClick] = useState('');
  const [transferDateClick, setTransferDateClick] = useState('');
  const [receiveDateClick, setReceiveDateClick] = useState('');

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
      case 'transfer_date':
        if (transferDateClick === value ) {
          setTransferDateClick('')
          setIsFromTransferDate(null)
          setIsToTransferDate(null)
        } else {
          setTransferDateClick(value)
          setIsFromTransferDate(moment(minValue, 'DD-MM-YYYY'))
          setIsToTransferDate(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      case 'receive_date':
        if (receiveDateClick === value ) {
          setReceiveDateClick('')
          setIsFromReceiveDate(null)
          setIsToReceiveDate(null)
        } else {
          setReceiveDateClick(value)
          setIsFromReceiveDate(moment(minValue, 'DD-MM-YYYY'))
          setIsToReceiveDate(moment(maxValue, 'DD-MM-YYYY'))
        }
        break
      default:
        break
    }
  }, [createDateClick, receiveDateClick, transferDateClick]);

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
          setCreateDateClick('')
          setIsFromCreatedDate(null)
          setIsToCreatedDate(null)
          onFilter && onFilter({...params, from_created_date: null, to_created_date: null});
          break;
        case 'transfer_date':
          setTransferDateClick('')
          setIsFromTransferDate(null)
          setIsToTransferDate(null)
          onFilter && onFilter({...params, from_transfer_date: null, to_transfer_date: null});
          break;
        case 'receive_date':
          setReceiveDateClick('')
          setIsFromReceiveDate(null)
          setIsToReceiveDate(null)
          onFilter && onFilter({...params, from_receive_date: null, to_receive_date: null});
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
        from_transfer_date: isFromTransferDate ? moment(isFromTransferDate) : null,
        to_transfer_date: isToTransferDate ? moment(isToTransferDate) : null,
        from_receive_date: isFromReceiveDate ? moment(isFromReceiveDate) : null,
        to_receive_date: isToReceiveDate ? moment(isToReceiveDate) : null,

      }
      onFilter && onFilter(valuesForm);
    },
    [isFromCreatedDate, isFromReceiveDate, isFromTransferDate, isToCreatedDate, isToReceiveDate, isToTransferDate, onFilter]
  );

  let filters = useMemo(() => {
    let list = []
    if (initialValues.status.length) {
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
    if (initialValues.created_by.length) {
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
                <Collapse defaultActiveKey={initialValues.status.length ? ["1"]: []}>
                  <Panel header="Trạng thái" key="1" className="header-filter">
                    <Item name="status" style={{ margin: "10px 0px" }}>
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
                  </Panel>

                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}} className="price">
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.from_total_variant || initialValues.to_total_variant ? ["1"]: []}>
                  <Panel header="Sản phẩm" key="1" className="header-filter">
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
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}} className="price">
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.from_total_quantity || initialValues.to_total_quantity ? ["1"]: []}>
                  <Panel header="Số lượng" key="1" className="header-filter">
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
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}} className="price">
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.from_total_amount || initialValues.to_total_amount ? ["1"]: []}>
                  <Panel header="Thành tiền" key="1" className="header-filter">
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
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.created_by.length ? ["1"]: []}>
                  <Panel header="Người tạo" key="1" className="header-filter">
                    <Item name="created_by">
                      <Select
                        maxTagCount="responsive"
                        mode="multiple" showSearch placeholder="Chọn người tạo"
                        notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                        optionFilterProp="children"
                        getPopupContainer={trigger => trigger.parentNode}
                      >
                        {accounts.map((item, index) => (
                          <Option
                            style={{ width: "100%" }}
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
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.from_created_date && initialValues.to_created_date ? ["1"]: []}>
                  <Panel header="Ngày tạo" key="1" className="header-filter">
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
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.from_transfer_date && initialValues.to_transfer_date ? ["1"]: []}>
                  <Panel header="Ngày chuyển" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('transfer_date', 'yesterday')} className={transferDateClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('transfer_date', 'today')} className={transferDateClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('transfer_date', 'thisweek')} className={transferDateClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('transfer_date', 'lastweek')} className={transferDateClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('transfer_date', 'thismonth')} className={transferDateClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('transfer_date', 'lastmonth')} className={transferDateClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[
                        isFromTransferDate? moment(isFromTransferDate, "DD-MM-YYYY") : null,
                        isToTransferDate? moment(isToTransferDate, "DD-MM-YYYY") : null
                      ]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'transfer_date')}
                    />
                  </Panel>
                </Collapse>
              </Col>
            </Row>
            <Row gutter={12} style={{marginTop: '10px'}}>
              <Col span={24}>
                <Collapse defaultActiveKey={initialValues.from_receive_date && initialValues.to_receive_date ? ["1"]: []}>
                  <Panel header="Ngày nhận" key="1" className="header-filter">
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('receive_date', 'yesterday')} className={receiveDateClick === 'yesterday' ? 'active' : 'deactive'}>Hôm qua</Button>
                      <Button onClick={() => clickOptionDate('receive_date', 'today')} className={receiveDateClick === 'today' ? 'active' : 'deactive'}>Hôm nay</Button>
                      <Button onClick={() => clickOptionDate('receive_date', 'thisweek')} className={receiveDateClick === 'thisweek' ? 'active' : 'deactive'}>Tuần này</Button>
                    </div>
                    <div className="date-option">
                      <Button onClick={() => clickOptionDate('receive_date', 'lastweek')} className={receiveDateClick === 'lastweek' ? 'active' : 'deactive'}>Tuần trước</Button>
                      <Button onClick={() => clickOptionDate('receive_date', 'thismonth')} className={receiveDateClick === 'thismonth' ? 'active' : 'deactive'}>Tháng này</Button>
                      <Button onClick={() => clickOptionDate('receive_date', 'lastmonth')} className={receiveDateClick === 'lastmonth' ? 'active' : 'deactive'}>Tháng trước</Button>
                    </div>
                    <p><SettingOutlined style={{marginRight: "10px"}}/>Tuỳ chọn khoảng thời gian:</p>
                    <DatePicker.RangePicker
                      format="DD-MM-YYYY"
                      style={{width: "100%"}}
                      value={[
                        isFromReceiveDate? moment(isFromReceiveDate, "DD-MM-YYYY") : null,
                        isToReceiveDate? moment(isToReceiveDate, "DD-MM-YYYY") : null
                      ]}
                      onChange={(date, dateString) => onChangeRangeDate(date, dateString, 'receive_date')}
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

export default InventoryFilters;
