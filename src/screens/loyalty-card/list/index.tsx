import { Button, Dropdown, Menu } from 'antd';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import './loyalty-cards.scss';
import editIcon from "assets/icon/edit.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import threeDot from "assets/icon/three-dot.svg";
import { useCallback, useEffect, useState } from 'react';
import { PageResponse } from 'model/base/base-metadata.response';
import { LoyaltyCardResponse } from 'model/response/loyalty/card/loyalty-card.response';
import moment from 'moment';
import { DATE_FORMAT } from 'utils/DateUtils';
import { BaseQuery } from 'model/base/base.query';
import { useDispatch } from 'react-redux';
import { LoyaltyCardSearch } from 'domain/actions/loyalty/card/loyalty-card.action';

const CARD_STATUS = {
  ASSIGNED: {
    title: 'Đã được gán',
    value: 'ASSIGNED'
  },
  ACTIVE: {
    title: 'Kích hoạt',
    value: 'ACTIVE'
  },
  INACTIVE: {
    title: 'Chưa kích hoạt',
    value: 'INACTIVE'
  },
  LOCKED: {
    title: 'Đã bị khóa',
    value: 'LOCKED'
  }
}

const LoyaltyCards = () => {
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [data, setData] = useState<PageResponse<LoyaltyCardResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const getCardStatus = (card: LoyaltyCardResponse) => {
    if (card.status === 'ACTIVE') {
      return card.customer_id ? CARD_STATUS.ASSIGNED : CARD_STATUS.ACTIVE
    } else {
      return card.customer_id ? CARD_STATUS.LOCKED : CARD_STATUS.INACTIVE
    }
  }
  const pageColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      visible: true,
      fixed: "left",
      render: (value: any, item: any, index: number) => <div>{(data.metadata.page - 1) * data.metadata.limit + index + 1}</div>,
      width: "72px"
    },
    {
      title: "Mã thẻ",
      dataIndex: "card_number",
      visible: true,
      fixed: "left"
    },
    {
      title: "Khách hàng",
      visible: true,
      fixed: "left"
    },
    {
      title: "Đợt phát hành",
      dataIndex: "card_release_id",
      visible: true,
      fixed: "left"
    },
    {
      title: "Ngày gán",
      visible: true,
      fixed: "left",
      render: (value: any) => <div>{value.assigned_date && moment(value.assigned_date).format(DATE_FORMAT.DDMMYY_HHmm)}</div>
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      align: "center",
      render: (value: any) => (
        <div className={`card card__${getCardStatus(value).value}`}>{getCardStatus(value).title}</div>
      ),
      width: "160px"
    },
    {
      title: "",
      visible: true,
      width: "72px",
      render: (value: string, i: any) => {
        const menu = (
          <Menu>
            <Menu.Item key="1">
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
                Gán
              </Button>
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
                Khóa
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

  const [query, setQuery] = useState<BaseQuery>({
    page: 1,
    limit: 30,
    sort_column: 'id',
    sort_type: 'DESC'
  });

  const dispatch = useDispatch()

  const fetchData = useCallback((data: PageResponse<LoyaltyCardResponse>) => {
    setData(data)
    setTableLoading(false)
  }, [])

  const onPageChange = useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },
    [query]
  );

  useEffect(() => {
    dispatch(LoyaltyCardSearch(query, fetchData));
  }, [dispatch, fetchData, query]);

  return (
    <div className="loyalty-cards">
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
  )
}

export default LoyaltyCards;