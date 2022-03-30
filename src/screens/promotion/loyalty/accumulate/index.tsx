import { Card, Col, Input, Row, Switch, Form, Select, Button, FormInstance, Table, Tag } from 'antd';
import ContentContainer from 'component/container/content.container';
import CustomDatePicker from 'component/custom/date-picker.custom';
import CustomSelect from 'component/custom/select.custom';
import UrlConfig from 'config/url.config';
import { StoreGetListAction } from 'domain/actions/core/store.action';
import { getListSourceRequest } from 'domain/actions/product/source.action';
import { StoreResponse } from 'model/core/store.model';
import { SourceResponse } from 'model/response/order/source.response';
import moment from 'moment';
import React, { useState, useCallback, useMemo, useEffect, createRef } from 'react'
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import './loyalty-accumulate.scss'
import { ConvertDateToUtc, DATE_FORMAT } from 'utils/DateUtils';
import { ChannelResponse } from 'model/response/product/channel.response';
import { getListChannelRequest } from 'domain/actions/order/order.action';
import { CustomerGroups, CustomerTypes } from 'domain/actions/customer/customer.action';
import NumberInput from 'component/custom/number-input.custom';
import { showError, showSuccess } from 'utils/ToastUtils';
import Xclosebtn from "assets/icon/X_close.svg";
import _ from 'lodash';
import { searchVariantsRequestAction } from 'domain/actions/product/products.action';
import { VariantResponse } from 'model/product/product.model';
import { PageResponse } from 'model/base/base-metadata.response';
import { formatCurrency, replaceFormatString } from 'utils/AppUtils';
import { LoyaltyRankResponse } from 'model/response/loyalty/ranking/loyalty-rank.response';
import { LoyaltyRankSearch } from 'domain/actions/loyalty/rank/loyalty-rank.action';
import { createLoyaltyAccumulationProgram, getLoyaltyAccumulationProgram, updateLoyaltyAccumulationProgram } from 'domain/actions/loyalty/loyalty.action';
import { LoyaltyAccumulationProgramResponse } from 'model/response/loyalty/loyalty-accumulation.response';
import { useHistory, useParams } from 'react-router';
import BaseResponse from 'base/base.response';
import { LoyaltyProgramRuleItem, LoyaltyProgramRuleProductItem } from 'model/request/loyalty/create-loyalty-accumulation.request';
import { PlusOutlined } from '@ant-design/icons';
import CurrencyInput from '../component/currency-input';

class Rule {
  id: number | null = null
  order_amount_min: number = 0
  order_amount_max: number | null = null
  customer_group_id: number | null = null
  customer_ranking_id: number | null = null
  customer_type_id: number | null = null
  percent: number = 0

  constructor(fields?: {
    id?: number,
    order_amount_min?: number,
    order_amount_max?: number,
    customer_group_id?: number | null,
    customer_ranking_id?: number | null,
    customer_type_id?: number | null,
    percent?: number,
}) {
    if (fields) Object.assign(this, fields);
  }
}


const { Option } = Select;

const initFormValues = {
  name: '',
  priority: 0,
  start_time: null,
  end_time: null
}

const LoyaltyPointAccumulate = () => {
  const [startDate, setStartDate] = useState<string>()
  const [endDate, setEndDate] = useState<string>()
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [listStore, setListStore] = useState<Array<StoreResponse>>([]);
  const [listChannel, setListChannel] = useState<Array<ChannelResponse>>([])
  const [listProduct, setListProduct] = useState<Array<any>>([])
  const [listRanking, setListRanking] = useState<Array<LoyaltyRankResponse>>([])
  const dispatch = useDispatch();
  const formRef = createRef<FormInstance>();
  const [rules, setRules] = useState<Array<Rule>>([])
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const params = useParams() as any;
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyAccumulationProgramResponse>()
  const [havingCardSwitch, setHavingCardSwitch] = useState<boolean>(false)
  const [notUsingPointSwitch, setNotUsingPointSwitch] = useState<boolean>(false)
  const [statusSwitch, setStatusSwitch] = useState<boolean>(false)
  const [prioritySelect, setPrioritySelect] = useState<number>(1)
  const [programName, setProgramName] = useState<string>()
  const [stores, setStores] = useState<LoyaltyProgramRuleItem[]>([])
  const [sources, setSources] = useState<LoyaltyProgramRuleItem[]>([])
  const [channels, setChannels] = useState<LoyaltyProgramRuleItem[]>([])
  const [products, setProducts] = useState<LoyaltyProgramRuleProductItem[]>([])
  const [loadingProduct, setLoadingProduct] = useState<boolean>(false)
  const history = useHistory();

  const rankFiltered = useMemo(() => {
    return listRanking.filter(rank => rank.status === 'ACTIVE')
  }, [listRanking])

  const columns = [
    {
      title: "Hóa đơn tối thiểu",
      width: "16%",
      className: "text-center",
      render: (rule: Rule, item: Rule, index: number) => {
        return (
          <NumberInput
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            value={rule.order_amount_min}
            onChange={(value) => onChangeOrderAmountMin(value, index)}
            max={999999999999999}
          />
        )
      },
    },
    {
      title: "Hóa đơn tối đa",
      width: "16%",
      className: "text-center",
      render: (rule: Rule, item: Rule, index: number) => {
        return (
          <NumberInput
            format={(a: string) => formatCurrency(a)}
            replace={(a: string) => replaceFormatString(a)}
            value={rule.order_amount_max || undefined}
            onChange={(value) => onChangeOrderAmountMax(value, index)}
            max={999999999999999}
          />
        )
      },
    },
    {
      title: "Nhóm khách hàng",
      width: "16%",
      className: "text-center",
      render: (rule: Rule, item: Rule, index: number) => {
        return (
          <Select
            className="rule-dropdown"
            placeholder="Chọn nhóm khách"
            value={rule.customer_group_id ? rule.customer_group_id : undefined}
            onChange={(value) => onChangeCustomerGroup(value, index)}
          >
            {
              groups.map(group => (
                <Option key={group.id} value={group.id}>{group.name}</Option>
              ))
            }
          </Select>
        )
      },
    },
    {
      title: "Loại khách hàng",
      width: "16%",
      className: "text-center",
      render: (rule: Rule, item: Rule, index: number) => {
        return (
          <Select
            className="rule-dropdown"
            placeholder="Chọn loại"
            value={rule.customer_type_id ? rule.customer_type_id : undefined}
            onChange={(value) => onChangeCustomerType(value, index)}
          >
            {
              types.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))
            }
          </Select>
        )
      },
    },
    {
      title: "Hạng khách hàng",
      width: "16%",
      className: "text-center",
      render: (rule: Rule, item: Rule, index: number) => {
        return (
          <Select
            className="rule-dropdown"
            placeholder="Chọn hạng"
            value={rule.customer_ranking_id ? rule.customer_ranking_id : undefined}
            onChange={(value) => onChangeCustomerRank(value, index)}
          >
            {
              rankFiltered.map(type => (
                <Option key={type.id} value={type.id}>{type.name}</Option>
              ))
            }
          </Select>
        )
      },
    },
    {
      title: "Giá trị tích điểm",
      width: "16%",
      className: "text-center",
      render: (rule: Rule, item: Rule, index: number) => {
        return (
          <CurrencyInput
            position="after"
            placeholder="Tỷ lệ tích điểm"
            currency={['%']}
            value={rule.percent}
            maxValue={100}
            onChange={(value) => onChangePercent(value, index)}
            style={{textAlign: 'left'}}
          />
        )
      },
    },
    {
      title: "",
      width: "48px",
      render: (rule: Rule, item: Rule, index: number) => {
        return (
          <div
            onClick={() => removeRule(index)}
            style={{cursor: 'pointer'}}
          >
            <img
              src={Xclosebtn}
              alt="x-icon"
              style={{ width: 20, height: 20, borderRadius: '50%', background: '#F2F2F2', padding: '2px' }}
            />
          </div>
        )
      },
    }
  ]

  const onChangeOrderAmountMin = (value: number | null, index: number) => {
    let _rules = [...rules];

    _rules[index].order_amount_min = Number(
      value == null ? "0" : value.toString()
    );
    setRules(_rules);
  }

  const onChangeOrderAmountMax = (value: any, index: number) => {
    let _rules = [...rules];

    _rules[index].order_amount_max = value == null ? null : Number(value.toString());
    setRules(_rules);
  }

  const onChangeCustomerGroup = (value: number | null, index: number) => {
    let _rules = [...rules];

    _rules[index].customer_group_id = Number(
      value == null ? "0" : value.toString()
    );
    setRules(_rules);
  }

  const onChangeCustomerRank = (value: number | null, index: number) => {
    let _rules = [...rules];

    _rules[index].customer_ranking_id = Number(
      value == null ? "0" : value.toString()
    );
    setRules(_rules);
  }

  const onChangeCustomerType = (value: number | null, index: number) => {
    let _rules = [...rules];

    _rules[index].customer_type_id = Number(
      value == null ? "0" : value.toString()
    );
    setRules(_rules);
  }

  const onChangePercent  = (value: number | null, index: number) => {
    let _rules = [...rules];

    _rules[index].percent = Number(
      value == null ? "0" : value.toString()
    );
    setRules(_rules);
  }

  const addRule = () => {
    setRules([...rules, new Rule()])
  }

  const handleChangeSource = (values: number[]) => {
    const _sources = listSource.filter(source => values.includes(source.id))
    setSources(_sources)
  }

  const handleChangeStore = (values: number[]) => {
    const _stores = listStore.filter(store => values.includes(store.id))
    setStores(_stores)
  }

  const handleChangeChannel = (values: number[]) => {
    const _channels = listChannel.filter(channel => values.includes(channel.id))
    setChannels(_channels)
  }

  const handleChangeProduct = (values: number[]) => {
    const removedProducts = products.filter(p => values.includes(p.id))
    const removeProductIds = removedProducts.map(p => p.id)
    const missingProductIds = values.filter(value => !removeProductIds.includes(value))
    let missingProducts = listProduct.filter(p => missingProductIds.includes(p.id)).map(p => {
      return {id: p.id, name: p.name, sku: p.sku, code: p.code}
    })
    setProducts([...removedProducts, ...missingProducts])
  }

  const isValidRules = () => {
    if (rules.length === 0) {
      showError('Không được để trống luật tích điểm')
      return false
    }
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      if (rule.order_amount_max !== null && rule.order_amount_min > rule.order_amount_max) {
        console.log(rule.order_amount_max)
        showError('Giá trị hóa đơn tối thiểu không được lớn hơn giá trị hóa đơn tối đa')
        return false
      }
      if (!rule.order_amount_min) {
        showError('Giá trị hóa đơn tối thiểu phải lớn hơn 0')
        return false
      }
      if (!rule.percent) {
        showError('Giá trị tích điểm phải lớn hơn 0')
        return false
      }
    }

    return true;
  }

  const removeRule = (index: number) => {
    let _rules = [...rules];
    _rules.splice(index, 1);
    setRules(_rules);
  }

  const handleChangeHavingCardSwitch = useCallback((checked: boolean) => {
    setHavingCardSwitch(checked)
  }, [])

  const handleChangeNotUsingPointSwitch = useCallback((checked: boolean) => {
    setNotUsingPointSwitch(checked)
  }, [])

  const onChangePrioritySelect = useCallback((value: number) => {
    setPrioritySelect(value)
  }, [])

  const onChangeStartDate = useCallback((date: string | undefined) => {
    if (!date) {
      setStartDate(undefined)
    } else {
      setStartDate(moment(date).toString())
    }
  }, [])

  const onChangeEndDate = useCallback((date: string | undefined) => {
    if (!date) {
      setEndDate(undefined)
    } else {
      setEndDate(moment(date).toString())
    }
  }, [])

  const listSources = useMemo(() => {
    return listSource.filter((item) => item.code !== "pos");
  }, [listSource]);

  useEffect(() => {
    dispatch(getListSourceRequest(setListSource));
    dispatch(StoreGetListAction(setListStore));
    dispatch(getListChannelRequest(setListChannel));
    dispatch(CustomerGroups(setGroups));
    dispatch(CustomerTypes(setTypes));
    dispatch(LoyaltyRankSearch({}, (data: PageResponse<LoyaltyRankResponse>) => {
      setListRanking(data.items)
    }));
    if (params.id) {
      dispatch(getLoyaltyAccumulationProgram(params.id, updateLoyaltyProgram))
    } else {
      setRules([new Rule()])
    }
  }, [dispatch, params]);

  const updateLoyaltyProgram = (loyaltyProgram: LoyaltyAccumulationProgramResponse) => {
    setLoyaltyProgram(loyaltyProgram)
    setRules(loyaltyProgram.rules)
    setHavingCardSwitch(loyaltyProgram.having_card)
    setNotUsingPointSwitch(loyaltyProgram.not_using_point)
    setProgramName(loyaltyProgram.name)
    setPrioritySelect(loyaltyProgram.priority)
    setListProduct(loyaltyProgram.items)
    setSources(loyaltyProgram.sources)
    setStores(loyaltyProgram.stores)
    setChannels(loyaltyProgram.channels)
    setProducts(loyaltyProgram.items)
    setStartDate(moment(loyaltyProgram.start_time).toString())
    setEndDate(loyaltyProgram.end_time ? moment(loyaltyProgram.end_time).toString() : undefined)
    setStatusSwitch(loyaltyProgram.status === 'ACTIVE')
  }

  const afterSubmit = useCallback((data: BaseResponse<LoyaltyAccumulationProgramResponse>) => {
    if (data) {
      showSuccess(loyaltyProgram ? 'Cập nhật thành công chương trình tích điểm' : 'Tạo thành công chương trình tích điểm')
      const redirectUrl = loyaltyProgram ? `${UrlConfig.LOYALTY}/accumulation/${loyaltyProgram.id}` : `${UrlConfig.LOYALTY}`
      history.push(redirectUrl)
    }
  }, [loyaltyProgram, history])

  const onFinish = () => {
    if (!programName || !startDate) {
      showError('Vui lòng điền đủ thông tin')
      return;
    }
    const trimmedProgramName = programName.trim()
    setProgramName(trimmedProgramName)
    if (trimmedProgramName.length === 0) {
      showError('Tên chương trình không được để trống')
      return;
    }
    const storeRequestParams = stores.map(store => {
      return {id: store.id, name: store.name, code: store.code}
    })
    const channelRequestParams = channels.map(channel => {
      return {id: channel.id, name: channel.name, code: channel.code}
    })
    const sourceRequestParams = sources.map(source => {
      return {id: source.id, name: source.name, code: source.code}
    })
    const params = {
      id: loyaltyProgram ? loyaltyProgram.id : null,
      start_time: startDate ? ConvertDateToUtc(startDate) : null,
      end_time: endDate ? ConvertDateToUtc(endDate) : null,
      status: statusSwitch ? 'ACTIVE' : 'INACTIVE',
      rules: rules,
      name: trimmedProgramName,
      note: null,
      not_using_point: notUsingPointSwitch,
      having_card: havingCardSwitch,
      priority: prioritySelect,
      stores: storeRequestParams,
      channels: channelRequestParams,
      items: products,
      sources: sourceRequestParams
    }
    const isValid = isValidRules()
    if (!isValid) {
      return;
    }
    if (loyaltyProgram) {
      dispatch(updateLoyaltyAccumulationProgram(loyaltyProgram.id, params, afterSubmit))
    } else {
      dispatch(createLoyaltyAccumulationProgram(params, afterSubmit))
    }
  }

  const onResultSuccess = useCallback(
    (result: PageResponse<VariantResponse> | false) => {
      if (result) {
        setListProduct(result.items);
      }
      setLoadingProduct(false)
    },
    []
  );

  const debouncedSearch = React.useMemo(() =>
    _.debounce((keyword: string) => {
      dispatch(searchVariantsRequestAction({ info: keyword }, onResultSuccess));
    }, 300),
    [dispatch, onResultSuccess]
  )

  const onSearchProduct = useCallback(
    (keyword: string) => {
      debouncedSearch(keyword)
    },
    [debouncedSearch]
  )

  const handleChangeProgramName = (event: React.FocusEvent<HTMLInputElement>) => {
    setProgramName(event.target.value)
  }

  const transformProduct = useMemo(() => {
    return listProduct.map(product => {
      return { label: product.name, value: product.id }
    })
  }, [listProduct])

  return (
    <ContentContainer
      title={loyaltyProgram ? "Sửa chương trình tích điểm" : "Thêm mới chương trình tích điểm"}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Tích điểm",
          path: `${UrlConfig.LOYALTY}`,
        },
        {
          name: loyaltyProgram ? "Sửa chương trình tích điểm" : "Thêm mới chương trình tích điểm",
          path: `${UrlConfig.LOYALTY}/accumulation`,
        },
      ]}
    >
      <Card
        title={
          <div className="d-flex">
            <span className="title-card">
              Cài đặt Tích điểm
            </span>
            <div className="program-status">
              <b>Trạng thái</b>
              <Switch
                checked={statusSwitch}
                onChange={(checked: boolean) => setStatusSwitch(checked)}
              />
              {statusSwitch ? 'Đang hoạt động' : 'Dừng hoạt động'}
            </div>
          </div>
        }
        className="loyalty-accumulate-wrapper"
      >
        <Form
          onFinish={onFinish}
          initialValues={initFormValues}
          layout="vertical"
          ref={formRef}
        >
          <div className="additional-option">
            <Row>
              <Col span={10}>
                <div className="option">
                  <Switch
                    className="switcher"
                    checked={havingCardSwitch}
                    onChange={handleChangeHavingCardSwitch}
                  />
                  <span>Yêu cầu có thẻ khách hàng mới được tích điểm</span>
                </div>
              </Col>
              <Col span={14}>
                <div className="option">
                  <Switch
                    className="switcher"
                    checked={notUsingPointSwitch}
                    onChange={handleChangeNotUsingPointSwitch}
                  />
                  <span>Không tích điểm cho hóa đơn có tiêu điểm tích lũy</span>
                </div>
              </Col>
            </Row>
          </div>
          <div className="require-rules">
            <Row>
              <Col span={10}>
                <div className="rule">
                  <label>Tên chương trình tích điểm <span className="text-error">*</span></label>
                  <Input placeholder="Tên chương trình" className="input-rule" value={programName} onChange={handleChangeProgramName} maxLength={255}/>
                </div>
              </Col>
              <Col span={14}>
                <div className="rule">
                  <label>Ưu tiên <span className="text-error">*</span></label>
                  <Select
                    placeholder="Chọn độ ưu tiên"
                    className="dropdown-rule"
                    value={prioritySelect}
                    onChange={onChangePrioritySelect}
                  >
                    <Option key={1} value={1}>1</Option>
                    <Option key={2} value={2}>2</Option>
                    <Option key={3} value={3}>3</Option>
                    <Option key={4} value={4}>4</Option>
                    <Option key={5} value={5}>5</Option>
                    <Option key={6} value={6}>6</Option>
                    <Option key={7} value={7}>7</Option>
                    <Option key={8} value={8}>8</Option>
                    <Option key={9} value={9}>9</Option>
                    <Option key={10} value={10}>10</Option>
                  </Select>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={10}>
                <div className="rule">
                  <label>Nguồn</label>
                  <CustomSelect
                    className="dropdown-rule"
                    mode="multiple"
                    maxTagCount="responsive"
                    showArrow
                    showSearch
                    allowClear
                    placeholder="Chọn nguồn hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    filterOption={(input, option) => {
                      if (option) {
                        return (
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        );
                      }
                      return false;
                    }}
                    value={sources.map(source => source.id)}
                    onChange={handleChangeSource}
                  >
                    {
                      listSources.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.id}
                        >
                          {item.name}
                        </CustomSelect.Option>
                      ))
                    }
                  </CustomSelect>
                </div>
              </Col>
              <Col span={14}>
                <div className="rule">
                  <label>Cửa hàng</label>
                  <CustomSelect
                    mode="multiple"
                    className="dropdown-rule"
                    maxTagCount="responsive"
                    showArrow
                    showSearch
                    allowClear
                    placeholder="Chọn cửa hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    filterOption={(input, option) => {
                      if (option) {
                        return (
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        );
                      }
                      return false;
                    }}
                    value={stores.map(store => store.id)}
                    onChange={handleChangeStore}
                  >
                    {
                      listStore.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.id}
                        >
                          {item.name}
                        </CustomSelect.Option>
                      ))
                    }
                  </CustomSelect>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={10}>
                <div className="rule">
                  <label>Kênh bán hàng</label>
                  <CustomSelect
                    className="dropdown-rule"
                    mode="multiple"
                    maxTagCount="responsive"
                    showArrow
                    showSearch
                    allowClear
                    placeholder="Chọn kênh bán hàng"
                    notFoundContent="Không tìm thấy kết quả"
                    filterOption={(input, option) => {
                      if (option) {
                        return (
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        );
                      }
                      return false;
                    }}
                    value={channels.map(channel => channel.id)}
                    onChange={handleChangeChannel}
                  >
                    {
                      listChannel.map((item, index) => (
                        <CustomSelect.Option
                          style={{ width: "100%" }}
                          key={index.toString()}
                          value={item.id}
                        >
                          {item.name}
                        </CustomSelect.Option>
                      ))
                    }
                  </CustomSelect>
                </div>
              </Col>
              <Col span={14}>
                <div className="rule">
                  <label>Sản phẩm</label>
                  <Select
                    mode="multiple"
                    className="dropdown-rule"
                    maxTagCount="responsive"
                    allowClear
                    placeholder="Tìm kiếm sản phẩm"
                    showArrow
                    tagRender={({ label, value, closable, onClose }) => (
                      <Tag
                        closable={closable}
                        onClose={onClose}
                        style={{ marginRight: 3, whiteSpace: 'pre-wrap' }}
                      >
                        {label}
                      </Tag>
                    )}
                    options={transformProduct}
                    onSearch={(value: string) => {
                      onSearchProduct(value)
                      setLoadingProduct(true)
                    }}
                    filterOption={false}
                    value={products.map(product => product.id)}
                    onChange={handleChangeProduct}
                    loading={loadingProduct}
                  />
                </div>
              </Col>
            </Row>
          </div>
          <div className="date-rule">
            <Row>
              <Col span={10}>
                <div className="rule">
                  <label>Từ ngày:  <span className="text-error">*</span></label>
                  <CustomDatePicker
                    value={startDate ? startDate : undefined}
                    className="datepicker"
                    disableDate={(date) => {
                      if (!endDate) {
                        return false
                      }

                      return date >= moment(endDate)
                    }}
                    placeholder="dd/mm/yyyy hh:mm"
                    onChange={onChangeStartDate}
                    format={DATE_FORMAT.DDMMYY_HHmm}
                    showTime={true}
                  />
                </div>
              </Col>
              <Col span={14}>
                <div className="rule">
                  <label>Đến ngày:</label>
                  <CustomDatePicker
                    value={endDate ? endDate : undefined}
                    className="datepicker"
                    disableDate={(date) => {
                      if (!startDate) {
                        return false
                      }

                      return date <= moment(startDate)
                    }}
                    placeholder="dd/mm/yyyy hh:mm"
                    onChange={onChangeEndDate}
                    format={DATE_FORMAT.DDMMYY_HHmm}
                    showTime={true}
                  />
                </div>
              </Col>
            </Row>
          </div>
          <div className="accumulate-point-rule">
            <Row>
              <Table
                columns={columns}
                dataSource={rules}
                tableLayout="fixed"
                pagination={false}
              />
            </Row>
            <Row>
              <div className="add-new-rule" onClick={addRule}>
                <PlusOutlined />
                Thêm dòng
              </div>
            </Row>
          </div>
          <Row
            gutter={24}
            className="footer-controller"
            style={{
              position: "fixed",
              textAlign: "right",
              width: "calc(100% - 240px)",
              height: "55px",
              bottom: "0%",
              backgroundColor: "#FFFFFF",
              marginLeft: "-30px"
            }}
          >
            <Col span={6} className="back">
              <div onClick={() => history.goBack()}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3281 6.33203H3.04317L9.19903 0.988281C9.29746 0.902148 9.2377 0.742188 9.10762 0.742188H7.55196C7.4834 0.742188 7.41836 0.766797 7.36739 0.810742L0.724614 6.57461C0.663774 6.62735 0.614981 6.69255 0.58154 6.76579C0.548099 6.83903 0.530792 6.91861 0.530792 6.99912C0.530792 7.07964 0.548099 7.15921 0.58154 7.23245C0.614981 7.3057 0.663774 7.37089 0.724614 7.42363L7.40606 13.2227C7.43243 13.2455 7.46407 13.2578 7.49746 13.2578H9.10586C9.23594 13.2578 9.29571 13.0961 9.19727 13.0117L3.04317 7.66797H13.3281C13.4055 7.66797 13.4688 7.60469 13.4688 7.52734V6.47266C13.4688 6.39531 13.4055 6.33203 13.3281 6.33203Z" fill="#666666"/>
                </svg>
                <span>Quay lại</span>
              </div>
            </Col>
            <Col span={18} className="action-group">
              <Link to={`${UrlConfig.LOYALTY}`}>
                <Button
                  type="default"
                  className="cancel-btn"
                >
                  Hủy
                </Button>
              </Link>
              <Button
                type="primary"
                className="save-btn"
                onClick={() => {
                  formRef.current?.submit();
                }}
              >
                {loyaltyProgram ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </ContentContainer>
  )
}

export default LoyaltyPointAccumulate