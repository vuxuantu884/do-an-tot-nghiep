import {
  Button,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Tag,
} from "antd";

import { MenuAction } from "component/table/ActionButton";
import { createRef, useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import BaseFilter from "./base.filter";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { SettingOutlined, FilterOutlined } from "@ant-design/icons";
import './order.filter.scss'
import CustomSelect from "component/custom/select.custom";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import { ReturnSearchQuery } from "model/order/return.model";
import { SourceResponse } from "model/response/order/source.response";
import { StoreResponse } from "model/core/store.model";
import TreeStore from "component/tree-node/tree-store";

type ReturnFilterProps = {
  params: ReturnSearchQuery;
  actions: Array<MenuAction>;
  listSource: Array<SourceResponse>;
  listStore: Array<StoreResponse>| undefined;
  accounts: Array<AccountResponse>;
  reasons: Array<{id: number; name: string}>;
  isLoading?: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: ReturnSearchQuery| Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
};

const { Item } = Form;

const ReturnFilter: React.FC<ReturnFilterProps> = (
  props: ReturnFilterProps
) => {
  const {
    params,
    actions,
    listStore,
    reasons,
    isLoading,
    onMenuClick,
    onClearFilter,
    onFilter,
    onShowColumnSetting
  } = props;
  const [visible, setVisible] = useState(false);
  const [rerender, setRerender] = useState(false);
  
  const loadingFilter = useMemo(() => {
    return isLoading ? true : false
  }, [isLoading])

  const formRef = createRef<FormInstance>();
  const formSearchRef = createRef<FormInstance>();

  const onFilterClick = useCallback(() => {
    formRef.current?.submit();
  }, [formRef]);
  const openFilter = useCallback(() => {
    setVisible(true);
    setRerender(true);
  }, []);
  const onCancelFilter = useCallback(() => {
    setVisible(false);
    // setRerender(false);
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
      setRerender(false)
      switch(tag.key) {
        case 'store':
          onFilter && onFilter({...params, store_ids: []});
          break;
        
        case 'created':
          setCreatedClick('')
          onFilter && onFilter({...params, created_on_min: null, created_on_max: null});
          break;
        case 'received':
          setReceivedClick('')
          onFilter && onFilter({...params, received_on_min: null, received_on_max: null});
          break;
        case 'reason_ids':
          onFilter && onFilter({...params, reason_ids: []});
          break;
        case 'is_received':
          onFilter && onFilter({...params, is_received: []});
          break;
        case 'payment_status':
          onFilter && onFilter({...params, payment_status: []});
          break;
         
        default: break
      }
      // const tags = filters.filter((tag: any) => tag.key !== key);
      // filters = tags
    },
    [onFilter, params]
  );
  const [createdClick, setCreatedClick] = useState('');
  const [receivedClick, setReceivedClick] = useState('');

  const initialValues = useMemo(() => {
    return {
      ...params,
      store_ids: Array.isArray(params.store_ids) ? params.store_ids : [params.store_ids],
      is_received: Array.isArray(params.is_received) ? params.is_received : [params.is_received],
      payment_status: Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status],
      reason_ids: Array.isArray(params.reason_ids) ? params.reason_ids : [params.reason_ids],
  }}, [params])
  
  const [isReceived, setIsReceived] = useState<any[]>(initialValues.is_received);
  const [paymentStatus, setPaymentStatus] = useState<any[]>(initialValues.payment_status);

  const changeIsReceived = useCallback((status) => {
    let newIsReceived = [...isReceived]
    switch (status) {
      case 'true':
        const index1 = newIsReceived.indexOf('true');
        if (index1 > -1) {
          newIsReceived.splice(index1, 1);
        } else {
          newIsReceived.push('true')
        }
        break;
      case 'false':
        const index2 = newIsReceived.indexOf('false');
        if (index2 > -1) {
          newIsReceived.splice(index2, 1);
        }  else {
          newIsReceived.push('false')
        }
        break;
      
      default: break;  
    }
    setIsReceived(newIsReceived)
  }, [isReceived]);

  const changePaymentStatus = useCallback((status) => {
    let newPaymentStatus = [...paymentStatus]
    
    switch (status) {
      case 'unpaid':
        const index1 = newPaymentStatus.indexOf('unpaid');
        if (index1 > -1) {
          newPaymentStatus.splice(index1, 1);
        } else {
          newPaymentStatus.push('unpaid')
        }
        break;
      case 'partial_paid':
        const index2 = newPaymentStatus.indexOf('partial_paid');
        if (index2 > -1) {
          newPaymentStatus.splice(index2, 1);
        }  else {
          newPaymentStatus.push('partial_paid')
        }
        break;
      case 'paid':
        const index = newPaymentStatus.indexOf('paid');
        if (index > -1) {
          newPaymentStatus.splice(index, 1);
        } else {
          newPaymentStatus.push('paid')
        }
        break
      default: break;  
    }
    setPaymentStatus(newPaymentStatus)

  }, [paymentStatus]);
  const onFinish = useCallback(
    (values) => {
      let error = false;
      formRef?.current?.getFieldsError([
        'created_on_min', 'created_on_max',
        'received_on_min', 'received_on_max'
      ]).forEach(field => {
        if (field.errors.length) {
          error = true
        }
      })
      if (!error) {
        setVisible(false);
        const valuesForm = {
          ...values,
          is_received: isReceived,
          payment_status: paymentStatus,
        }
        onFilter && onFilter(valuesForm);
        setRerender(false)
      }
      
    },
    [formRef, isReceived, paymentStatus, onFilter]
  );
  let filters = useMemo(() => {
    let list = []
    if (initialValues.store_ids.length) {
      let textStores = ""
      initialValues.store_ids.forEach(store_id => {
        const store = listStore?.find(store => store.id.toString() === store_id)
        textStores = store ? textStores + store.name + "; " : textStores
      })
      list.push({
        key: 'store',
        name: 'Cửa hàng',
        value: textStores
      })
    }
    if (initialValues.reason_ids.length) {
      let textReason = ""
      initialValues.reason_ids.forEach(reason_id => {
        const reason = reasons?.find(reason => reason.id.toString() === reason_id)
        textReason = reason ? textReason + reason.name + "; " : textReason
      })
      list.push({
        key: 'reason_ids',
        name: 'Lý do trả hàng',
        value: textReason
      })
    }
    if (initialValues.is_received.length) {
      let textReceived = ""
      initialValues.is_received.forEach(received => {
        const text = received === 'true' ? "Đã nhận hàng;" : "Chưa nhận hàng;"
        textReceived = textReceived + text
      })
      list.push({
        key: 'is_received',
        name: 'Trạng thái nhận hàng',
        value: textReceived
      })
    }
    if (initialValues.payment_status.length) {
      let paymentStt = ""
      const payments = [
        {name: "Chưa hoàn tiền", value: 'unpaid'},
        {name: "Hoàn tiền một phần", value: 'partial_paid'},
        {name: "Đã hoàn tiền", value: 'paid'},
      ]
      initialValues.payment_status.forEach(status => {
        const findStatus = payments.find(item => item.value === status)
        paymentStt = findStatus ? paymentStt + findStatus.name + "; " : paymentStt
      })
      list.push({
        key: 'payment_status',
        name: 'Trạng thái hoàn tiền',
        value: paymentStt
      })
    }
    if (initialValues.created_on_min || initialValues.created_on_max) {
      let textOrderCreatedDate = (initialValues.created_on_min ? initialValues.created_on_min : '??') + " ~ " + (initialValues.created_on_max ? initialValues.created_on_max : '??')
      list.push({
        key: 'created',
        name: 'Ngày tạo đơn',
        value: textOrderCreatedDate
      })
    }

    if (initialValues.received_on_min || initialValues.received_on_max) {
      let textOrderReceivedDate = (initialValues.received_on_min ? initialValues.received_on_min : '??') + " ~ " + (initialValues.received_on_max ? initialValues.received_on_max : '??')
      list.push({
        key: 'received',
        name: 'Ngày trả hàng',
        value: textOrderReceivedDate
      })
    }
    
    return list
  }, [initialValues.created_on_max, initialValues.created_on_min, initialValues.is_received, initialValues.payment_status, initialValues.reason_ids, initialValues.received_on_max, initialValues.received_on_min, initialValues.store_ids, listStore, reasons]);
  const widthScreen = () => {
    if (window.innerWidth >= 1600) {
      return 1400
    } else if (window.innerWidth < 1600 && window.innerWidth >=1200){
      return 1000
    } else {
      return 800
    }
  }
  const clearFilter = () => {
    onClearFilter && onClearFilter();
    setCreatedClick('')
    setReceivedClick('')
  
    setVisible(false);
    setRerender(false);
  };
  useLayoutEffect(() => {
    window.addEventListener('resize', () => setVisible(false))
  }, []);

  useEffect(() => {
    setIsReceived(Array.isArray(params.is_received) ? params.is_received : [params.is_received])
    setPaymentStatus(Array.isArray(params.payment_status) ? params.payment_status : [params.payment_status])
  }, [params.is_received, params.payment_status]);

  return (
    <div>
      <div className="order-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions}>
          <Form onFinish={onFinish} ref={formSearchRef} initialValues={initialValues} layout="inline">
            <Item name="search_term" className="input-search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã đơn trả hàng, tên, sđt khách hàng"
                onBlur={(e) => {
                  formSearchRef?.current?.setFieldsValue({
                    search_term: e.target.value.trim()
                  })
                }}
              />
            </Item>
            
            <Item>
              <Button type="primary" loading={loadingFilter} htmlType="submit">
                Lọc
              </Button>
            </Item>
            {/* <Item>
              <Tooltip overlay="Lưu bộ lọc" placement="top">
                <Button icon={<StarOutlined />} />
              </Tooltip>
            </Item> */}
            <Item>
              <Button icon={<FilterOutlined />} onClick={openFilter}>Thêm bộ lọc</Button>
            </Item>
            <Button icon={<SettingOutlined/>} onClick={onShowColumnSetting}></Button>
          </Form>
        </CustomFilter>

        <BaseFilter
          onClearFilter={() => clearFilter()}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visible}
          className="order-filter-drawer"
          width={widthScreen()}
        >
          {rerender && <Form
            onFinish={onFinish}
            ref={formRef}
            initialValues={params}
            layout="vertical"
          >
            <Row gutter={20}>
              <Col span={12}>
                <p>Kho cửa hàng</p>
                <Item name="store_ids">
                  {/* <CustomSelect
                    mode="multiple"
                    allowClear
                    showArrow
                    placeholder="Cửa hàng"
                    optionFilterProp="children"
                    style={{
                      width: '100%'
                    }}
                    notFoundContent="Không tìm thấy kết quả"
                    maxTagCount="responsive"
                  >
                    {listStore?.map((item) => (
                      <CustomSelect.Option key={item.id} value={item.id.toString()}>
                        {item.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect> */}
                  <TreeStore listStore={listStore} placeholder="Cửa hàng"/>
                </Item>
                <p>Lý do trả hàng</p>
                <Item name="reason_ids">
                  <CustomSelect
                    mode="multiple" showSearch placeholder="Chọn lý do trả hàng"
                    notFoundContent="Không tìm thấy kết quả" style={{width: '100%'}}
                    optionFilterProp="children" maxTagCount='responsive' showArrow
                    getPopupContainer={trigger => trigger.parentNode} allowClear
                  >
                    {reasons.map((reason) => (
                      <CustomSelect.Option key={reason.id.toString()} value={reason.id.toString()}>
                        {reason.name}
                      </CustomSelect.Option>
                    ))}
                  </CustomSelect>
                </Item>
              </Col>
              <Col span={12}>
                <p>Trạng thái nhận hàng</p>
                <div className="button-option-1" style={{marginBottom: '20px'}}>
                  <Button
                    onClick={() => changeIsReceived('true')}
                    className={isReceived.includes('true') ? 'active' : 'deactive'}
                  >
                    Đã nhận hàng
                  </Button>
                  
                  <Button
                    onClick={() => changeIsReceived('false')}
                    className={isReceived.includes('false') ? 'active' : 'deactive'}
                  >
                    Chưa nhận hàng
                  </Button>
                </div>
                <p>Trạng thái hoàn tiền</p>
                <div className="button-option-2">
                  <Button
                    onClick={() => changePaymentStatus('unpaid')}
                    className={paymentStatus.includes('unpaid') ? 'active' : 'deactive'}
                  >
                    Chưa hoàn tiền
                  </Button>
                  <Button
                    onClick={() => changePaymentStatus('partial_paid')}
                    className={paymentStatus.includes('partial_paid') ? 'active' : 'deactive'}
                  >
                    Hoàn tiền một phần
                  </Button>
                  <Button
                    onClick={() => changePaymentStatus('paid')}
                    className={paymentStatus.includes('paid') ? 'active' : 'deactive'}
                  >
                    Hoàn tiền toàn bộ
                  </Button>
                </div>
              </Col>
              <Col span={12}>
                <p>Ngày tạo đơn</p>
                <CustomRangeDatePicker
                  fieldNameFrom="created_on_min"
                  fieldNameTo="created_on_max"
                  activeButton={createdClick}
                  setActiveButton={setCreatedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>

              <Col span={12}>
                <p>Ngày trả hàng</p>
                <CustomRangeDatePicker
                  fieldNameFrom="received_on_min"
                  fieldNameTo="received_on_max"
                  activeButton={receivedClick}
                  setActiveButton={setReceivedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Col>
            </Row>
          </Form>}
        </BaseFilter>
      </div>
      <div className="order-filter-tags">
        {filters && filters.map((filter: any, index) => {
          return (
            <Tag className="tag" closable onClose={(e) => onCloseTag(e, filter)}>{filter.name}: {filter.value}</Tag>
          )
        })}
      </div>
    </div>
  );
};

export default ReturnFilter;
