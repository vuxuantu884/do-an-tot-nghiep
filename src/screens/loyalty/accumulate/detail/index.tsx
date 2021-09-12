import { Card, Col, Row } from 'antd';
import ContentContainer from 'component/container/content.container'
import UrlConfig from 'config/url.config'
import React, { useEffect, useState } from 'react'
import editIcon from "assets/icon/edit.svg";
import { useParams } from 'react-router';
import './loyalty-accumulate-detail.scss'
import { Link } from 'react-router-dom';
import CustomTable from 'component/table/CustomTable';
import { useDispatch } from 'react-redux';
import { getLoyaltyAccumulationProgram } from 'domain/actions/loyalty/loyalty.action';
import { LoyaltyAccumulationProgramResponse, LoyaltyProgramRuleResponse } from 'model/response/loyalty/loyalty-accumulation.response';
import { formatCurrency } from 'utils/AppUtils';
import { CustomerGroups, CustomerTypes } from 'domain/actions/customer/customer.action';
import { LoyaltyRankSearch } from 'domain/actions/loyalty/rank/loyalty-rank.action';
import { PageResponse } from 'model/base/base-metadata.response';
import { LoyaltyRankResponse } from 'model/response/loyalty/ranking/loyalty-rank.response';

type PathParams = {
  id: string
}

const LoyaltyAccumulateDetail = () => {
  const { id } = useParams<PathParams>();
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyAccumulationProgramResponse>()
  const [groups, setGroups] = React.useState<Array<any>>([]);
  const [types, setTypes] = React.useState<Array<any>>([]);
  const [ranks, setRanks] = useState<Array<LoyaltyRankResponse>>([])
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getLoyaltyAccumulationProgram(Number(id), setLoyaltyProgram))
    dispatch(CustomerGroups(setGroups));
    dispatch(CustomerTypes(setTypes));
    dispatch(LoyaltyRankSearch({}, (data: PageResponse<LoyaltyRankResponse>) => {
      setRanks(data.items)
    }));
  }, [dispatch, id])

  const columns = [
    {
      title: "Hóa đơn tối thiểu",
      width: "17%",
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{formatCurrency(rule.order_amount_min)}</span>
        )
      },
    },
    {
      title: "Hóa đơn tối đa",
      width: "17%",
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{formatCurrency(rule.order_amount_max)}</span>
        )
      },
    },
    {
      title: "Nhóm khách hàng",
      width: "17%",
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{groups.filter(group => rule.customer_group_id === group.id)[0]?.name}</span>
        )
      },
    },
    {
      title: "Loại khách hàng",
      width: "17%",
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{types.filter(type => rule.customer_type_id === type.id)[0]?.name}</span>
        )
      },
    },
    {
      title: "Hạng khách hàng",
      width: "17%",
      render: (rule: LoyaltyProgramRuleResponse) => {
        return (
          <span>{ranks.filter(rank => rule.customer_ranking_id === rank.id)[0]?.name}</span>
        )
      },
    },
    {
      title: "Giá trị tích điểm",
      width: "17%",
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
          path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}`,
        },
        {
          name: "Chi tiết",
          path: `${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation/${id}`,
        },
      ]}
    >
      <Card
        title={
          <div className="d-flex">
            <span className="title-card">
              Thông tin chương trình
            </span>
            <Link to={`${UrlConfig.PROMOTION}${UrlConfig.LOYALTY}/accumulation/1/update`}>
              <img alt="edit-icon" src={editIcon} width="24px" height="24px" />
            </Link>
          </div>
        }
        className="loyalty-accumulation-detail"
      >
        <div className="program-info">
          <Row>
            <Col span={12} className="d-flex">
              <div className="info-label">Tên chương trình:</div>
              <div className="info-content">{loyaltyProgram?.name}</div>
            </Col>
            <Col span={12} className="d-flex">
              <div className="info-label">Ưu tiên:</div>
              <div className="priority">Số {loyaltyProgram?.priority}</div>
            </Col>
          </Row>
          <Row>
            <Col span={12} className="d-flex">
              <div className="info-label">Trạng thái:</div>
              <div className={`info-status`}>{loyaltyProgram?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</div>
            </Col>
            <Col span={12} className="d-flex">
              <div className="info-label">Cửa hàng:</div>
              <div className="info-content">{loyaltyProgram?.stores.map(store => store.name).join(', ')}</div>
            </Col>
          </Row>
          <Row>
            <Col span={12} className="d-flex">
              <div className="info-label">Nguồn hàng:</div>
              <div className="info-content">{loyaltyProgram?.sources.map(source => source.name).join(', ')}</div>
            </Col>
            <Col span={12} className="d-flex">
              <div className="info-label">Kênh bán hàng:</div>
              <div className="info-content">{loyaltyProgram?.channels.map(channel => channel.name).join(', ')}</div>
            </Col>
          </Row>
          <Row>
            <Col span={12} className="d-flex">
              <div className="info-label" style={{alignSelf: 'auto'}}>Điều kiện tích điểm:</div>
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
            <Col span={12} className="d-flex">
              <div className="info-label" style={{alignSelf: 'auto'}}>Thời hạn:</div>
              <div className="info-content" style={{alignSelf: 'auto'}}>{loyaltyProgram?.start_time} - {loyaltyProgram?.end_time}</div>
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
    </ContentContainer>
  )
}

export default LoyaltyAccumulateDetail;