import { Button, Dropdown, Menu } from 'antd';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import './loyalty-cards.scss';
import lockIcon from "assets/icon/lock.svg";
import assignIcon from "assets/icon/assign.svg";
import threeDot from "assets/icon/three-dot.svg";
import { useCallback, useEffect, useState } from 'react';
import { PageResponse } from 'model/base/base-metadata.response';
import { LoyaltyCardResponse } from 'model/response/loyalty/card/loyalty-card.response';
import moment from 'moment';
import { DATE_FORMAT } from 'utils/DateUtils';
import { BaseQuery } from 'model/base/base.query';
import { useDispatch } from 'react-redux';
import { LoyaltyCardLock, LoyaltyCardSearch } from 'domain/actions/loyalty/card/loyalty-card.action';
import AssignCustomer from '../component/assign-customer/AssignCustomer';
import ModalConfirmLock from 'component/modal/ModalConfirmLock';
import AuthWrapper from 'component/authorization/AuthWrapper';
import NoPermission from 'screens/no-permission.screen';
import { CustomerCardPermissions } from 'config/permissions/customer.permission';
import useAuthorization from 'hook/useAuthorization';

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
    title: 'Đã khóa',
    value: 'INACTIVE'
  }
}

const viewCardListPermission = [CustomerCardPermissions.VIEW_CARD];
const assignCardPermission = [CustomerCardPermissions.ASSIGN];
const lockCardPermission = [CustomerCardPermissions.LOCK];

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
      return CARD_STATUS.INACTIVE
    }
  }

  const RenderActionColumn = (value: any, row: any, index: number) => {
    const [allowLockCard] = useAuthorization({
      acceptPermissions: lockCardPermission,
      not: false,
    });

    const [allowAssignCard] = useAuthorization({
      acceptPermissions: assignCardPermission,
      not: false,
    });
    
    const isShowAction = allowAssignCard || allowLockCard;
    
    const menu = (
      <Menu className="yody-line-item-action-menu saleorders-product-dropdown">
        {allowAssignCard &&
          <Menu.Item key="1">
          <Button
            icon={<img alt="" style={{ marginRight: 12 }} src={assignIcon} />}
            type="text"
            style={{
              paddingLeft: 24,
              background: "transparent",
              border: "none",
              color: '#222222'
            }}
            onClick={() => {
              setSelectedItem(value)
              setIsShowAssignCustomerModal(true)
            }}
          >
            Gán
          </Button>
          </Menu.Item>
        }
        
        {allowLockCard && value.status !== 'INACTIVE' &&
          <Menu.Item key="2">
          <Button
            icon={<img alt="" style={{ marginRight: 12 }} src={lockIcon} />}
            type="text"
            style={{
              paddingLeft: 24,
              background: "transparent",
              border: "none",
              color: '#222222'
            }}
            onClick={() => {
              setSelectedItem(value)
              setIsShowLockConfirmModal(true)
            }}
          >
            Khóa
          </Button>
          </Menu.Item>
        }
      </Menu>
    );

    return (
      <>
        {isShowAction && value.status !== 'INACTIVE' &&
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
        }
      </>
    );
  }

  const pageColumns: Array<ICustomTableColumType<any>> = [
    {
      title: "STT",
      visible: true,
      fixed: "left",
      align: "center",
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
      dataIndex: "customer_name",
      visible: true,
      fixed: "left"
    },
    {
      title: "Đợt phát hành",
      dataIndex: "release_name",
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
      render: (value: any, row: any, index: number) => RenderActionColumn(value, row, index)
    }
  ]

  const [query, setQuery] = useState<BaseQuery>({
    page: 1,
    limit: 30,
    sort_column: 'id',
    sort_type: 'desc'
  });

  const dispatch = useDispatch()
  const [isShowAssignCustomerModal, setIsShowAssignCustomerModal] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<LoyaltyCardResponse>()
  const [isShowLockConfirmModal, setIsShowLockConfirmModal] = useState<boolean>(false)

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

  const refreshData = useCallback(() => {
    dispatch(LoyaltyCardSearch(query, fetchData));
  }, [dispatch, fetchData, query])

  useEffect(() => {
    dispatch(LoyaltyCardSearch(query, fetchData));
  }, [dispatch, fetchData, query]);

  return (
    <div className="loyalty-cards">
      <AuthWrapper acceptPermissions={viewCardListPermission} passThrough>
        {(allowed: boolean) => (allowed ?
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
          : <NoPermission />)
        }
      </AuthWrapper>
      
      <AssignCustomer
        visible={isShowAssignCustomerModal}
        onClose={() => {
          setIsShowAssignCustomerModal(false)
          setSelectedItem(undefined)
        }}
        card={selectedItem}
        onSaveSuccess={refreshData}
      />
      <ModalConfirmLock
        onCancel={() => {
          setIsShowLockConfirmModal(false)
          setSelectedItem(undefined)
        }}
        onOk={() => {
          setIsShowLockConfirmModal(false);
          if (selectedItem) {
            dispatch(LoyaltyCardLock(selectedItem.id, refreshData))
          }
        }}
        title={"Bạn có chắc chắn muốn khóa thẻ khách hàng này không?"}
        subTitle="Nếu khóa thì thẻ khách hàng này sẽ không còn hoạt động nữa."
        visible={isShowLockConfirmModal}
      />
    </div>
  )
}

export default LoyaltyCards;