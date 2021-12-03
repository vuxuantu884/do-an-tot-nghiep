import { Button, Dropdown, Menu } from 'antd';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import lockIcon from "assets/icon/lock.svg";
import assignIcon from "assets/icon/assign.svg";
import threeDot from "assets/icon/three-dot.svg";
import { useCallback, useEffect, useState } from 'react';
import { PageResponse } from 'model/base/base-metadata.response';
import { LoyaltyCardResponse } from 'model/response/loyalty/card/loyalty-card.response';
import moment from 'moment';
import { DATE_FORMAT } from 'utils/DateUtils';
import { useDispatch } from 'react-redux';
import { LoyaltyCardLock, LoyaltyCardSearch } from 'domain/actions/loyalty/card/loyalty-card.action';
import AssignCustomer from '../component/assign-customer/AssignCustomer';
import ModalConfirmLock from 'component/modal/ModalConfirmLock';
import AuthWrapper from 'component/authorization/AuthWrapper';
import NoPermission from 'screens/no-permission.screen';
import { LoyaltyPermission } from 'config/permissions/loyalty.permission';
import useAuthorization from 'hook/useAuthorization';

import CardListFilter from 'screens/customer/loyalty-card/card-list/CardListFilter';
import { LoyaltyCardReleaseResponse } from 'model/response/loyalty/release/loyalty-card-release.response';
import { LoyaltyCardReleaseSearch } from 'domain/actions/loyalty/release/loyalty-release.action';
import { CustomerCardListRequest } from 'model/request/customer.request';

const CARD_STATUS = [
  {
    title: 'Đã được gán',
    value: 'ASSIGNED'
  },
  {
    title: 'Kích hoạt',
    value: 'ACTIVE'
  },
  {
    title: 'Đã khóa',
    value: 'INACTIVE'
  }
]

const initParams: CustomerCardListRequest = {
  page: 1,
  limit: 30,
  sort_column: 'id',
  sort_type: 'desc',
  request: '',
  from_assigned_date: '',
  to_assigned_date: '',
  statuses: [],
  release_ids: []
};

const viewCardListPermission = [LoyaltyPermission.cards_read];
const assignCardPermission = [LoyaltyPermission.cards_assignment];
const lockCardPermission = [LoyaltyPermission.cards_lock];

const LoyaltyCards = () => {
  const [data, setData] = useState<PageResponse<LoyaltyCardResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [cardReleaseList, setCardReleaseList] = useState<any>([]);

  const getCard = (card: LoyaltyCardResponse) => {
    const cardFound = CARD_STATUS.find(item => item.value === card.status);
    return cardFound;
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
      align: "center",
      render: (value: any, item: any, index: number) => <div>{(data.metadata.page - 1) * data.metadata.limit + index + 1}</div>,
      width: "72px"
    },
    {
      title: "Mã thẻ",
      dataIndex: "card_number",
      visible: true,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer_name",
      visible: true,
    },
    {
      title: "Đợt phát hành",
      dataIndex: "release_name",
      visible: true,
    },
    {
      title: "Ngày gán",
      visible: true,
      render: (value: any) => <div>{value.assigned_date && moment(value.assigned_date).format(DATE_FORMAT.DDMMYY_HHmm)}</div>
    },
    {
      title: "Trạng thái",
      visible: true,
      align: "center",
      render: (value: any) => (
        <div className={`card card__${getCard(value)?.value}`}>{getCard(value)?.title}</div>
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

  const [params, setParams] = useState<CustomerCardListRequest>({ ...initParams });

  const dispatch = useDispatch()
  
  const [isLoading, setIsLoading] = useState(false);

  const [isShowAssignCustomerModal, setIsShowAssignCustomerModal] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<LoyaltyCardResponse>()
  const [isShowLockConfirmModal, setIsShowLockConfirmModal] = useState<boolean>(false)


  const onFilter = useCallback(
    (values) => {
      const filterParams = { ...params, ...values, page: 1 };
      setParams(filterParams);
    },
    [params]
  );

  const onClearFilter = useCallback(() => {
    setParams(initParams);
  }, []);

  const fetchData = useCallback((data: PageResponse<LoyaltyCardResponse>) => {
    setIsLoading(false);
    if (!!data) {
      setData(data);
    }
  }, [])



  const onPageChange = useCallback(
    (page, limit) => {
      setParams({ ...params, page, limit });
      window.scrollTo(0, 0);
    },
    [params]
  );

  const refreshData = useCallback(() => {
    setIsLoading(true);
    dispatch(LoyaltyCardSearch(params, fetchData));
  }, [dispatch, fetchData, params])

  useEffect(() => {
    setIsLoading(true);
    dispatch(LoyaltyCardSearch(params, fetchData));
  }, [dispatch, fetchData, params]);

  // Get card release list
  const updateCardRelease = useCallback((data: PageResponse<LoyaltyCardReleaseResponse>) => {
    setIsLoading(false);
    if (!!data) {
      setCardReleaseList(data.items);
    }
  }, [])

  useEffect(() => {
    const cardReleaseParams = {
      sort_column: 'id',
      sort_type: 'desc',
      limit: 100,
      page: 1,
    };
    setIsLoading(true);
    dispatch(LoyaltyCardReleaseSearch(cardReleaseParams, updateCardRelease));
  }, [dispatch, updateCardRelease]);
  // end

  return (
    <div className="loyalty-cards-list">
      <AuthWrapper acceptPermissions={viewCardListPermission} passThrough>
        {(allowed: boolean) => (allowed ?
          <>
            <CardListFilter
              isLoading={isLoading}
              params={params}
              initParams={initParams}
              onClearFilter={onClearFilter}
              onFilter={onFilter}
              cardReleaseList={cardReleaseList}
            />
            
            <CustomTable
              isLoading={isLoading}
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
          </>
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