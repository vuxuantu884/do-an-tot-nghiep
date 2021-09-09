import { Card, Menu, Button, Dropdown } from 'antd';
import ContentContainer from 'component/container/content.container';
import ButtonCreate from 'component/header/ButtonCreate';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import UrlConfig from 'config/url.config';
import { LoyaltyRankSearch } from 'domain/actions/loyalty/rank/loyalty-rank.action';
import { PageResponse } from 'model/base/base-metadata.response';
import { BaseQuery } from 'model/base/base.query';
import { LoyaltyRankResponse } from 'model/response/loyalty/ranking/loyalty-rank.response';
import moment from 'moment';
import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux';
import { formatCurrency } from 'utils/AppUtils';
import { DATE_FORMAT } from 'utils/DateUtils';
import './customer-ranking.scss'
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import threeDot from "assets/icon/three-dot.svg";
import { Link } from 'react-router-dom';

const CustomerRanking = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [data, setData] = useState<PageResponse<LoyaltyRankResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const pageColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      dataIndex: "code",
      visible: true,
      fixed: "left",
      render: (value: any, item: any, index: number) => <div>{(data.metadata.page - 1) * data.metadata.limit + index + 1}</div>,
      width: '72px'
    },
    {
      title: "Tên hạng",
      dataIndex: "name",
      visible: true,
      fixed: "left",
    },
    {
      title: "Tích lũy từ",
      visible: true,
      render: (value: any) => <div>{formatCurrency(value.accumulated_from)}</div>
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      render: (value: any) => <div>{value.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</div>
    },
    {
      title: "Ngày tạo",
      visible: true,
      fixed: "left",
      render: (value: any) => <div>{moment(value.created_date).format(DATE_FORMAT.DDMMYYY)}</div>
    },
    {
      title: "Người tạo",
      dataIndex: "code",
      visible: true,
      render: (value: any) => (
        <div>Admin</div>
      )
    },
    {
      title: "",
      visible: true,
      width: "72px",
      render: (value: any, i: any) => {
        const menu = (
          <Menu>
            <Menu.Item key="1">
              <Link to={`${UrlConfig.CUSTOMER}/rankings/${value.id}/update`}>
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
            <Menu.Item key="2">
              <Button
                icon={<img alt="" style={{ marginRight: 12 }} src={deleteIcon} />}
                type="text"
                className=""
                style={{
                  paddingLeft: 24,
                  background: "transparent",
                  border: "none",
                  color: "red",
                }}
              >
                Xóa
              </Button>
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
  const [query, setQuery] = React.useState<BaseQuery>({
    page: 1,
    limit: 30,
    sort_column: 'accumulated_from',
    sort_type: 'DESC'
  });

  const dispatch = useDispatch()

  const fetchData = useCallback((data: PageResponse<LoyaltyRankResponse>) => {
    setData(data)
    setTableLoading(false)
  }, [])

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },
    [query]
  );

  React.useEffect(() => {
    dispatch(LoyaltyRankSearch({...query, status: 'ACTIVE'}, fetchData));
  }, [dispatch, fetchData, query]);

  return (
    <ContentContainer
      title="Hạng thẻ"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: '/customers',
        },
        {
          name: "Hạng thẻ",
          path: `${UrlConfig.CUSTOMER}/rankings`,
        },
      ]}
      extra={
        <>
          <ButtonCreate path={`${UrlConfig.CUSTOMER}/rankings/create`} />
        </>
      }
    >
      <Card>
        <div className="customer-ranking padding-30">
          <CustomTable
            isLoading={tableLoading}
            sticky={{ offsetScroll: 5 }}
            pagination={{
              pageSize: data.metadata.limit,
              total: data.metadata.total,
              current: data.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={data.items}
            columns={pageColumns}
            rowKey={(item: any) => item.id}
          />
        </div>
      </Card>
    </ContentContainer>
  )
}

export default CustomerRanking