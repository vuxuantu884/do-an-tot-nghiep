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
import { DATE_FORMAT } from 'utils/DateUtils';
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
import { useParams } from 'react-router';
import BaseResponse from 'base/base.response';
import { LoyaltyProgramRuleItem } from 'model/request/loyalty/create-loyalty-accumulation.request';

class Rule {
  id: number | null = null
  order_amount_min: number = 0
  order_amount_max: number = 0
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
  const [isShowActionFooter, setIsShowActionFooter] = useState<boolean>(false);
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
  const [prioritySelect, setPrioritySelect] = useState<number>(1)
  const [programName, setProgramName] = useState<string>()
  const [stores, setStores] = useState<LoyaltyProgramRuleItem[]>([])
  const [sources, setSources] = useState<LoyaltyProgramRuleItem[]>([])
  const [channels, setChannels] = useState<LoyaltyProgramRuleItem[]>([])
  const [products, setProducts] = useState<LoyaltyProgramRuleItem[]>([])

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
            value={rule.order_amount_max}
            onChange={(value) => onChangeOrderAmountMax(value, index)}
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
          <NumberInput
            value={rule.percent}
            onChange={(value) => onChangePercent(value, index)}
          />
        )
      },
    },
    {
      title: "",
      width: "48px",
      render: (rule: Rule, item: Rule, index: number) => {
        return (
          <Button
              style={{ background: "transparent" }}
              type="text"
              className="p-0 ant-btn-custom"
              onClick={() => removeRule(index)}
          >
            <img src={Xclosebtn} alt="" style={{ width: 22 }} />
          </Button>
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

  const onChangeOrderAmountMax = (value: number | null, index: number) => {
    let _rules = [...rules];

    _rules[index].order_amount_max = Number(
      value == null ? "0" : value.toString()
    );
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
    const _products = listProduct.filter(product => values.includes(product.id))
    setProducts(_products)
  }

  const isValidRules = () => {
    if (rules.length === 0) {
      showError('Không được để trống luật tích điểm')
      return false
    }
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]
      // if (rule.order_amount_min > rule.order_amount_max) {
      //   showError('Giá trị hóa đơn tối thiểu không được lớn hơn giá trị hóa đơn tối đa')
      //   return false
      // }
      if (!rule.percent) {
        showError('Giá trị tích điểm không được để trống')
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

  const scroll = useCallback(() => {
    if (window.pageYOffset) {
      setIsShowActionFooter(true);
    } else {
      setIsShowActionFooter(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", scroll);
    return () => {
      window.removeEventListener("scroll", scroll);
    };
  }, [scroll]);

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
    setStartDate(loyaltyProgram.start_time)
    setEndDate(loyaltyProgram.end_time)
  }

  const afterSubmit = useCallback((data: BaseResponse<LoyaltyAccumulationProgramResponse>) => {
    if (data) {
      showSuccess(loyaltyProgram ? 'Cập nhật thành công chương trình tích điểm' : 'Tạo thành công chương trình tích điểm')
    }
  }, [loyaltyProgram])

  const onFinish = () => {
    if (!programName || !startDate || !endDate) {
      showError('Vui lòng điền đủ thông tin')
      return;
    }
    const trimmedProgramName = programName.trim()
    setProgramName(trimmedProgramName)
    if (trimmedProgramName.length === 0) {
      showError('Tên chương trình không được để trống')
      return;
    }
    const params = {
      id: loyaltyProgram ? loyaltyProgram.id : null,
      start_time: startDate ? moment(startDate)?.format(DATE_FORMAT.DDMMYY_HHmm) : null,
      end_time: endDate ? moment(endDate).format(DATE_FORMAT.DDMMYY_HHmm) : null,
      status: 'ACTIVE',
      rules: rules,
      name: trimmedProgramName,
      note: null,
      not_using_point: notUsingPointSwitch,
      having_card: havingCardSwitch,
      priority: prioritySelect,
      stores: stores,
      channels: channels,
      items: products,
      sources: sources,
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
    },
    []
  );

  const onSearchProduct = useCallback(() => _.debounce((keyword: string) => {
    dispatch(searchVariantsRequestAction({info: keyword}, onResultSuccess));
  }, 300), [dispatch, onResultSuccess])

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
      title={loyaltyProgram ? "Cập nhật chương trình tích điểm" : "Thêm mới chương trình tích điểm"}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Tích điểm",
          path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}`,
        },
        {
          name: "Thêm mới",
          path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation`,
        },
      ]}
    >
      <Card
        title={
          <div className="d-flex">
            <span className="title-card">
              <i
                className="icon-dot"
                style={{
                  fontSize: "8px",
                  marginRight: "10px",
                  color: "#fcaf17",
                }}
              ></i>
              Cài đặt Tích điểm
            </span>
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
                  <Input placeholder="Tên chương trình" className="input-rule" value={programName} onChange={handleChangeProgramName}/>
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
                    showArrow
                    showSearch
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
                    showArrow
                    showSearch
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
                    showArrow
                    showSearch
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
                    onSearch={onSearchProduct}
                    filterOption={false}
                    value={products.map(product => product.id)}
                    onChange={handleChangeProduct}
                  />
                </div>
              </Col>
            </Row>
          </div>
          <div className="date-rule">
            <Row>
              <Col span={10}>
                <div className="rule">
                  <label>Từ ngày: <span className="text-error">*</span></label>
                  <CustomDatePicker
                    value={startDate}
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
                  <label>Đến ngày: <span className="text-error">*</span></label>
                  <CustomDatePicker
                    value={endDate}
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
              <Button type="default" className="add-new-rule" onClick={addRule}>Thêm dòng</Button>
            </Row>
          </div>
          <Row
            gutter={24}
            className="footer-controller"
            style={{
              position: "fixed",
              textAlign: "right",
              width: "calc(100% + 30px)",
              height: "55px",
              bottom: "0%",
              backgroundColor: "#FFFFFF",
              marginLeft: "-30px",
              display: `${isShowActionFooter ? "" : "none"}`,
            }}
          >
            <Col span={6} className="back">
              <Link to={`${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3281 6.33203H3.04317L9.19903 0.988281C9.29746 0.902148 9.2377 0.742188 9.10762 0.742188H7.55196C7.4834 0.742188 7.41836 0.766797 7.36739 0.810742L0.724614 6.57461C0.663774 6.62735 0.614981 6.69255 0.58154 6.76579C0.548099 6.83903 0.530792 6.91861 0.530792 6.99912C0.530792 7.07964 0.548099 7.15921 0.58154 7.23245C0.614981 7.3057 0.663774 7.37089 0.724614 7.42363L7.40606 13.2227C7.43243 13.2455 7.46407 13.2578 7.49746 13.2578H9.10586C9.23594 13.2578 9.29571 13.0961 9.19727 13.0117L3.04317 7.66797H13.3281C13.4055 7.66797 13.4688 7.60469 13.4688 7.52734V6.47266C13.4688 6.39531 13.4055 6.33203 13.3281 6.33203Z" fill="#666666"/>
                </svg>
                <span>Quay lại</span>
              </Link>
            </Col>
            <Col span={14} className="action-group">
              <Button
                type="default"
                className="cancel-btn"
              >
                Hủy
              </Button>
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