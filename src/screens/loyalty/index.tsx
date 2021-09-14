import { Button, Card, Checkbox, Col, Dropdown, Menu, Row, Switch } from 'antd'
import ContentContainer from 'component/container/content.container'
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable'
import UrlConfig from 'config/url.config'
import './loyalty.scss'
import threeDot from "assets/icon/three-dot.svg";
import { Link } from 'react-router-dom'
import editIcon from "assets/icon/edit.svg";
import CurrencyInput from './component/currency-input'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { PageResponse } from 'model/base/base-metadata.response'
import { createLoyaltyRate, createLoyaltyUsage, getListLoyaltyAccumulationProgram, getLoyaltyRate, getLoyaltyUsage } from 'domain/actions/loyalty/loyalty.action'
import { LoyaltyRateResponse } from 'model/response/loyalty/loyalty-rate.response'
import { showSuccess } from 'utils/ToastUtils'
import { LoyaltyUsageResponse } from 'model/response/loyalty/loyalty-usage.response'
import { LoyaltyAccumulationProgramResponse } from 'model/response/loyalty/loyalty-accumulation.response'
import { BaseQuery } from 'model/base/base.query'
import moment from 'moment'
import { DATE_FORMAT } from 'utils/DateUtils'
import { PlusOutlined } from '@ant-design/icons'

const LoyaltyPage = () => {
  const [accumulationRate, setAccumulationRate] = useState<number>(0)
  const [redemptionRate, setRedemptionRate] = useState<number>(0)
  const [enablePointUsage, setEnablePointUsage] = useState<boolean>(false)
  const [rules, setRules] = useState<Array<any>>([])
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<PageResponse<LoyaltyAccumulationProgramResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const dispatch = useDispatch();
  const [query, setQuery] = useState<BaseQuery>({
    page: 1,
    limit: 30,
    sort_column: 'id',
    sort_type: 'DESC'
  });
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      visible: true,
      fixed: "left",
      render: (value: any, item: any, index: number) => <div>{(loyaltyPrograms.metadata.page - 1) * loyaltyPrograms.metadata.limit + index + 1}</div>,
      width: '72px'
    },
    {
      title: "Chương trình",
      visible: true,
      fixed: "left",
      render: (value: any, item: any, index: number) => 
        <Link to={`${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation/${value.id}`}>{value.name}</Link>,
    },
    {
      title: "Ưu tiên",
      visible: true,
      fixed: "left",
      width: '120px',
      render: (value: any, item: any, index: number) => 
        <div className={`priority priority__${value.priority === 1 ? 'VERY_HIGH' : 'LOW'}`}>
          Số {value.priority}
        </div>,
    },
    {
      title: "Từ ngày",
      visible: true,
      fixed: "left",
      render: (value: any, item: any, index: number) => 
        <div>{value.start_time && moment(value.start_time).format(DATE_FORMAT.DDMMYYY)}</div>,
    },
    {
      title: "Đến ngày",
      visible: true,
      fixed: "left",
      render: (value: any, item: any, index: number) => 
        <div>{value.end_time && moment(value.end_time).format(DATE_FORMAT.DDMMYYY)}</div>,
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      align: 'center',
      render: (value: any, item: any, index: number) => 
        <div className={`status-col__${value.status}`}>{value.status === 'INACTIVE' ? 'Đang chạy' : 'Tạm dừng'}</div>
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_name",
      fixed: "left",
      width: '150px'
    },
    {
      title: "",
      width: "48px",
      visible: true,
      render: (value: any, i: any) => {
        const menu = (
          <Menu>
            <Menu.Item key="1">
              <Link to={`${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation/${value.id}/update`}>
                <Button
                  icon={<img alt="" style={{ marginRight: 12 }} src={editIcon} />}
                  type="text"
                  className=""
                  style={{
                    paddingLeft: 24,
                    background: "transparent",
                    border: "none",
                  }}
                >
                  Chỉnh sửa
                </Button>
              </Link>
            </Menu.Item>
          </Menu>
        );
        return (
          <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 4px",
          }}
        >
          <div
            className="action-group"
          >
            <Dropdown
              overlay={menu}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                className="p-0 ant-btn-custom"
                icon={<img src={threeDot} alt=""></img>}
              ></Button>
            </Dropdown>
          </div>
        </div>
        )
      }
    }
  ]

  useEffect(() => {
    dispatch(getLoyaltyRate((rates: LoyaltyRateResponse) => {
      setAccumulationRate(rates.adding_rate)
      setRedemptionRate(rates.usage_rate)
      setEnablePointUsage(rates.enable_using_point)
    }))
    dispatch(getLoyaltyUsage((data: Array<LoyaltyUsageResponse>) => {
      let _rules = [];
      for (let i = 0; i < data.length; i++) {
        _rules.push(data[i])
      }
      setRules(_rules)
    }))
  }, [dispatch])

  const fetchData = useCallback((data: PageResponse<LoyaltyAccumulationProgramResponse>) => {
    setLoyaltyPrograms(data)
    setTableLoading(false)
  }, [])

  const onPageChange = useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },
    [query]
  );

  useEffect(() => {
    dispatch(getListLoyaltyAccumulationProgram(query, fetchData));
  }, [dispatch, fetchData, query]);

  const handleChangeAccumulationRate = useCallback((value: number | null) => {
    setAccumulationRate(value || 0)
  }, [])

  const handleChangeRedemptionRate = useCallback((value: number | null) => {
    setRedemptionRate(value || 0)
  }, [])

  const updateRateCallback = useCallback((data: LoyaltyRateResponse) => {
    showSuccess('Cập nhật tỷ lệ tiêu / tích điểm thành công')
  }, [])

  const updateUsageCallback = useCallback((data: LoyaltyUsageResponse[]) => {
    showSuccess('Cập nhật điều kiện tiêu điểm thành công')
  }, [])

  const onFinish = useCallback(() => {
    dispatch(createLoyaltyRate(accumulationRate, redemptionRate, enablePointUsage, updateRateCallback))
    dispatch(createLoyaltyUsage(rules, updateUsageCallback))
  },
    [accumulationRate, dispatch, redemptionRate, rules, updateRateCallback, updateUsageCallback, enablePointUsage]
  );

  const handleChangePointUseType = (value: string, index: number) => {
    let _rules = [...rules];

    switch (value) {
      case '%':
        _rules[index].type = 'PERCENT'
        break;

      case 'đ':
        _rules[index].type = 'DIRECT'
        break;
    
      default:
        break;
    }
    setRules(_rules);
  }

  const handleChangePointUse = (v: number | null, index: number) => {
    let _rules = [...rules]
    _rules[index].limit_order_percent = v === null ? 0 : Number(v)
    setRules(_rules)
  }

  const onChangePreventDiscountOrder = (value: boolean, index: number) => {
    let _rules = [...rules]
    _rules[index].block_order_have_discount = value
    setRules(_rules)
  }

  return (
    <ContentContainer
      title="Thêm mới chương trình tích điểm"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Tích điểm",
          path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}`,
        },
      ]}
    >
      <div className="loyalty-programs-wrapper">
        <Card
          className="global-config"
          title={
            <div className="d-flex">
              <span className="config-title">
                <i
                  className="icon-dot"
                  style={{
                    fontSize: "8px",
                    marginRight: "10px",
                    color: "#fcaf17",
                  }}
                ></i>
                Cài đặt chung
              </span>
              <div className="status">
                Trạng thái
                <Switch
                  checked={enablePointUsage}
                  onChange={(checked: boolean) => setEnablePointUsage(checked)}
                />
                {
                  enablePointUsage ? 'Đang hoạt động' : 'Dừng hoạt động'
                }
              </div>
            </div>
          }
        >
          <div className="global-config__body">
            <Row className="conversion-rate">
              <Col span={10}>
                <div className="row-label">Tỷ lệ tích điểm</div>
                <div className="d-flex">
                  <CurrencyInput
                    position="after"
                    placeholder="Tỷ lệ tích điểm"
                    currency={['đ']}
                    value={accumulationRate}
                    onChange={handleChangeAccumulationRate}
                  />
                  <span className="conversion-note" style={{marginLeft: '12px'}}>= 1 điểm thưởng</span>
                </div>
              </Col>
              <Col span={14}>
                <div className="row-label">Tỷ lệ tiêu điểm</div>
                <div className="d-flex">
                  <span className="conversion-note" style={{marginRight: '12px'}}>1 điểm thưởng = </span>
                  <CurrencyInput
                    position="after"
                    placeholder="Tỷ lệ tiêu điểm"
                    currency={['đ']}
                    value={redemptionRate}
                    onChange={handleChangeRedemptionRate}
                  />
                </div>
              </Col>
            </Row>
            <Row>
              <div className="redemption-rules">
                <div className="row-label">Cấu hình tiêu điểm</div>
                <div className="overflow-table">
                  <table className="rules">
                    <thead>
                      <tr>
                        <th className="condition">Điều kiện</th>
                        {
                          rules.map((rule, index) => (
                            <th className="condition" key={index}>{rule.rank_name}</th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="condition">Số điểm có thể tiêu không quá giá trị đơn hàng</td>
                        {
                          rules.map((rule, index) => (
                            <td className="condition" key={index}>
                              <CurrencyInput
                                position="before"
                                currency={['%']}
                                value={rule.limit_order_percent}
                                onChangeCurrencyType={(value) => handleChangePointUseType(value, index)}
                                onChange={(value) => handleChangePointUse(value, index)}
                              />
                            </td>
                          ))
                        }
                      </tr>
                      <tr>
                        <td className="condition">Không tiêu điểm đơn hàng có chiết khấu</td>
                        {
                          rules.map((rule, index) => (
                            <td className="condition checkbox" key={index}>
                              <Checkbox
                                defaultChecked={rule.block_order_have_discount}
                                onChange={(e) => onChangePreventDiscountOrder(e.target.checked, index)}
                              />
                            </td>
                          ))
                        }
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Row>
            <Row>
              <Button
                type="primary"
                className="save-btn"
                onClick={onFinish}
              >
                Lưu cài đặt
              </Button>
            </Row>
          </div>
        </Card>
        <Card
          title={
            <div className="d-flex">
              <span className="tab-label">
                Danh sách chương trình
              </span>
              <Link to={`${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation`}>
                <div className="add-new-btn">
                  <PlusOutlined /> Thêm mới
                </div>
              </Link>
            </div>
          }
        >
          <div className="loyalty-programs padding-30">
            <CustomTable
              isLoading={tableLoading}
              sticky={{ offsetScroll: 5 }}
              pagination={{
                pageSize: loyaltyPrograms.metadata.limit,
                total: loyaltyPrograms.metadata.total,
                current: loyaltyPrograms.metadata.page,
                showSizeChanger: true,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }}
              dataSource={loyaltyPrograms.items}
              columns={columns}
              rowKey={(item: any) => item.id}
            />
          </div>
        </Card>
      </div>
    </ContentContainer>
  )
}

export default LoyaltyPage