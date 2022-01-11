import { Card, Col, Row } from 'antd';
import ContentContainer from 'component/container/content.container'
import UrlConfig from 'config/url.config'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import './loyalty-accumulate-detail.scss'
import { Link } from 'react-router-dom';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import { useDispatch } from 'react-redux';
import { getLoyaltyAccumulationProgram } from 'domain/actions/loyalty/loyalty.action';
import { LoyaltyAccumulationProgramResponse, LoyaltyProgramRuleResponse } from 'model/response/loyalty/loyalty-accumulation.response';
import { formatCurrency } from 'utils/AppUtils';
import { CustomerGroups, CustomerTypes } from 'domain/actions/customer/customer.action';
import { LoyaltyRankSearch } from 'domain/actions/loyalty/rank/loyalty-rank.action';
import { PageResponse } from 'model/base/base-metadata.response';
import { LoyaltyRankResponse } from 'model/response/loyalty/ranking/loyalty-rank.response';
import LoyaltyProgramProducts from 'screens/promotion/loyalty/component/loyalty-program-products/LoyaltyProgramProducts';
import { ConvertUtcToLocalDate, DATE_FORMAT } from 'utils/DateUtils';
import { LoyaltyPermission } from 'config/permissions/loyalty.permission';
import AuthWrapper from 'component/authorization/AuthWrapper';
import NoPermission from 'screens/no-permission.screen';
import useAuthorization from 'hook/useAuthorization';

type PathParams = {
  id: string
}

const viewProgramDetailPermission = [LoyaltyPermission.programs_read];
const updateProgramPermission = [LoyaltyPermission.programs_update];

const LoyaltyAccumulateDetail = () => {
  const { id } = useParams<PathParams>();
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyAccumulationProgramResponse>()
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [ranks, setRanks] = useState<Array<LoyaltyRankResponse>>([])
  const [isShowProducts, setIsShowProducts] = useState<boolean>(false)
  const dispatch = useDispatch();

  const [allowViewProgramDetail] = useAuthorization({
    acceptPermissions: viewProgramDetailPermission,
    not: false,
  });

  const [allowUpdateProgram] = useAuthorization({
    acceptPermissions: updateProgramPermission,
    not: false,
  });

  useEffect(() => {
    if (!allowViewProgramDetail) {
      return;
    }
    dispatch(getLoyaltyAccumulationProgram(Number(id), setLoyaltyProgram))
    dispatch(CustomerGroups(setGroups));
    dispatch(CustomerTypes(setTypes));
    dispatch(LoyaltyRankSearch({}, (data: PageResponse<LoyaltyRankResponse>) => {
      setRanks(data.items)
    }));
  }, [allowViewProgramDetail, dispatch, id])

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Hóa đơn tối thiểu",
      width: "17%",
      visible: true,
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{formatCurrency(rule.order_amount_min)}</span>
        )
      },
    },
    {
      title: "Hóa đơn tối đa",
      width: "17%",
      visible: true,
      align: "center",
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{formatCurrency(rule.order_amount_max)}</span>
        )
      },
    },
    {
      title: "Nhóm khách hàng",
      width: "17%",
      visible: true,
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{groups.filter(group => rule.customer_group_id === group.id)[0]?.name}</span>
        )
      },
    },
    {
      title: "Loại khách hàng",
      width: "17%",
      visible: true,
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{types.filter(type => rule.customer_type_id === type.id)[0]?.name}</span>
        )
      },
    },
    {
      title: "Hạng khách hàng",
      width: "17%",
      visible: true,
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{ranks.filter(rank => rule.customer_ranking_id === rank.id)[0]?.name}</span>
        )
      },
    },
    {
      title: "Giá trị tích điểm",
      width: "17%",
      visible: true,
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{rule.percent} %</span>
        )
      },
    }
  ]

  return (
    <ContentContainer
      title="Chi tiết chương trình tích điểm"
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
          name: "Chi tiết chương trình tích điểm",
          path: `${UrlConfig.LOYALTY}/accumulation/${id}`,
        },
      ]}
    >
      <AuthWrapper acceptPermissions={viewProgramDetailPermission} passThrough>
          {(allowed: boolean) => (allowed ?
            <Card
              title={
                <div className="d-flex">
                  <span className="title-card">
                    Thông tin chương trình
                  </span>
                  {allowUpdateProgram &&
                    <Link
                      to={`${UrlConfig.LOYALTY}/accumulation/${id}/update`}
                      style={{color: '#5656A2', fontSize: '14px'}}
                    >
                      Cập nhật
                    </Link>
                  }
                </div>
              }
              className="loyalty-accumulation-detail"
            >
              <div className="program-info">
                <Row>
                  <Col span={12} className="row-item">
                    <div className="info-label align-center">Tên chương trình:</div>
                    <div className="info-content">{loyaltyProgram?.name}</div>
                  </Col>
                  <Col span={12} className="row-item">
                    <div className="info-label align-center">Ưu tiên:</div>
                    <div className={`priority priority__${loyaltyProgram?.priority === 1 ? 'HIGH' : 'LOW'} align-center`}>Số {loyaltyProgram?.priority}</div>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className="row-item">
                    <div className="info-label">Trạng thái:</div>
                    <div className={`info-status info-status__${loyaltyProgram?.status}`}>{loyaltyProgram?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</div>
                  </Col>
                  <Col span={12} className="row-item">
                    <div className="info-label">Sản phẩm:</div>
                    <div className="info-content">
                      {loyaltyProgram?.items.length ? loyaltyProgram.items.length + ' sản phẩm đã chọn' : ''}
                      {
                        loyaltyProgram?.items.length ? <span className="load-products" onClick={() => setIsShowProducts(true)}>Xem chi tiết</span> : <></>
                      }
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className="row-item" style={{marginBottom: '0'}}>
                    <div className="info-label">Điều kiện tích điểm:</div>
                    <div className="info-content">
                      <ul>
                        {
                          loyaltyProgram?.having_card && <li>Yêu cầu có thẻ khách hàng mới được tích điểm</li>
                        }
                        {
                          loyaltyProgram?.not_using_point && <li>Không tích điểm cho hóa đơn có tiêu điểm tích lũy</li>
                        }
                      </ul>
                    </div>
                  </Col>
                  <Col span={12} className="row-item" style={{alignSelf: 'flex-start'}}>
                    <div className="info-label">Kênh bán hàng:</div>
                    <div className="info-content">{loyaltyProgram?.channels.map(channel => channel.name).join(', ')}</div>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className="row-item"></Col>
                  <Col span={12} className="row-item">
                    <div className="info-label">Thời hạn:</div>
                    <div className="info-content">{ConvertUtcToLocalDate(loyaltyProgram?.start_time, DATE_FORMAT.DDMMYY_HHmm)} - {ConvertUtcToLocalDate(loyaltyProgram?.end_time, DATE_FORMAT.DDMMYY_HHmm)}</div>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} className="row-item">
                    <div className="info-label">Nguồn hàng:</div>
                    {
                      loyaltyProgram && loyaltyProgram.sources && loyaltyProgram.sources.length > 0 && (
                        <div className="scroll-box">
                          {
                            loyaltyProgram?.sources.map((source, idx) => (
                              <div className="scroll-box__item" key={source.id}>{idx + 1}. {source.name}</div>
                            ))
                          }
                        </div>
                      )
                    }
                  </Col>
                  <Col span={12} className="row-item">
                    <div className="info-label">Cửa hàng:</div>
                    {
                      loyaltyProgram && loyaltyProgram.stores && loyaltyProgram.stores.length > 0 && (
                        <div className="scroll-box">
                          {
                            loyaltyProgram?.stores.map((store, idx) => (
                              <div className="scroll-box__item" key={store.id}>{idx + 1}. {store.name}</div>
                            ))
                          }
                        </div>
                      )
                    }
                  </Col>
                </Row>
                <CustomTable
                  columns={columns}
                  dataSource={loyaltyProgram?.rules}
                  tableLayout="fixed"
                  className="rules"
                  pagination={false}
                />
              </div>
            </Card>
            : <NoPermission />)}
        </AuthWrapper>
      <LoyaltyProgramProducts visible={isShowProducts} onCancel={() => setIsShowProducts(false)} items={loyaltyProgram?.items || []} />
    </ContentContainer>
  )
}

export default LoyaltyAccumulateDetail;