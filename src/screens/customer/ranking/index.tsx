import { Card, Menu, Button, Dropdown } from 'antd';
import ContentContainer from 'component/container/content.container';
import CustomTable, { ICustomTableColumType } from 'component/table/CustomTable';
import UrlConfig from 'config/url.config';
import { DeleteLoyaltyRank, LoyaltyRankSearch } from 'domain/actions/loyalty/rank/loyalty-rank.action';
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
import ModalDeleteConfirm from 'component/modal/ModalDeleteConfirm';
import ButtonCreate from 'component/header/ButtonCreate';
import AuthWrapper from 'component/authorization/AuthWrapper';
import NoPermission from 'screens/no-permission.screen';
import { CustomerLevelPermission } from 'config/permissions/customer.permission';
import useAuthorization from 'hook/useAuthorization';


const viewCustomerLevelPermission = [CustomerLevelPermission.levels_read];
const createCustomerLevelPermission = [CustomerLevelPermission.levels_create];
const updateCustomerLevelPermission = [CustomerLevelPermission.levels_update];
const deleteCustomerLevelPermission = [CustomerLevelPermission.levels_delete];


const CustomerRanking = () => {

  const [allowCreateCustomerLevel] = useAuthorization({
    acceptPermissions: createCustomerLevelPermission,
    not: false,
  });

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [data, setData] = useState<PageResponse<LoyaltyRankResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const RenderActionColumn = (value: any, row: any) => {
    const [allowUpdateCustomerLevel] = useAuthorization({
      acceptPermissions: updateCustomerLevelPermission,
      not: false,
    });

    const [allowDeleteCustomerLevel] = useAuthorization({
      acceptPermissions: deleteCustomerLevelPermission,
      not: false,
    });
    
    const isShowAction = allowUpdateCustomerLevel || allowDeleteCustomerLevel;
    
    const menu = (
      <Menu>
        {allowUpdateCustomerLevel &&
          <Menu.Item key="1">
            <Link to={`${UrlConfig.CUSTOMER2}-rankings/${value.id}/update`}>
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
        }
        
        {allowDeleteCustomerLevel &&
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
              onClick={() => {
                setSelectedDeleteItem(value)
                setIsShowConfirmDelete(true)
              }}
            >
              Xóa
            </Button>
          </Menu.Item>
        }
      </Menu>
    );

    return (
      <>
        {isShowAction &&
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
      render: (value: any, item: any, index: number) => <div>{(data.metadata.page - 1) * data.metadata.limit + index + 1}</div>,
      width: '150px'
    },
    {
      title: "Tên hạng khách hàng",
      dataIndex: "name",
      visible: true,
      fixed: "left",
      render: (value, row, index) => {
        return (
          <Link to={`${UrlConfig.CUSTOMER2}-rankings/${row.id}/update`}>
            {value}
          </Link>
        )
      },
    },
    {
      title: "Giá trị nhỏ nhất",
      visible: true,
      align: 'right',
      render: (value: any) => <div>{formatCurrency(value.accumulated_from)}</div>
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      align: 'center',
      render: (value: any) => <div className={`status status__${value.status}`}>{value.status === 'ACTIVE' ? 'Đang hoạt động' : 'Dừng hoạt động'}</div>
    },
    {
      title: "Ngày tạo",
      visible: true,
      fixed: "left",
      align: 'center',
      width: '120px',
      render: (value: any) => <div>{moment(value.created_date).format(DATE_FORMAT.DDMMYYY)}</div>
    },
    {
      title: "Người tạo",
      dataIndex: "created_by",
      visible: true,
      align: 'center'
    },
    {
      title: "",
      visible: true,
      width: "72px",
      render: (value: any, i: any) => RenderActionColumn(value, i)
    }
  ]
  const [query, setQuery] = React.useState<BaseQuery>({
    page: 1,
    limit: 30,
    sort_column: 'accumulated_from',
    sort_type: 'desc'
  });
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState<boolean>(false)
  const [selectedDeleteItem, setSelectedDeleteItem] = useState<LoyaltyRankResponse>()

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

  const afterDeleted = React.useCallback(() => {
    dispatch(LoyaltyRankSearch({...query}, fetchData));
    setIsShowConfirmDelete(false)
  }, [dispatch, query, fetchData])

  const onConfirmDelete = React.useCallback(() => {
    if (selectedDeleteItem) {
      dispatch(DeleteLoyaltyRank(selectedDeleteItem.id, afterDeleted))
    }
  }, [selectedDeleteItem, dispatch, afterDeleted])

  const onCancel = React.useCallback(() => {
    setIsShowConfirmDelete(false)
    setSelectedDeleteItem(undefined)
  }, [])

  React.useEffect(() => {
    dispatch(LoyaltyRankSearch({...query}, fetchData));
  }, [dispatch, fetchData, query]);

  return (
    <ContentContainer
      title="Hạng khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Hạng khách hàng"
        },
      ]}
      extra={
        <>
          {allowCreateCustomerLevel &&
            <ButtonCreate
              child="Thêm mới"
              path={`${UrlConfig.CUSTOMER2}-rankings/create`}
            />
          }
        </>
      }
    >
      <AuthWrapper acceptPermissions={viewCustomerLevelPermission} passThrough>
        {(allowed: boolean) => (allowed ?
          <Card>
            <div className="customer-ranking">
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
          : <NoPermission />)}
      </AuthWrapper>
      
      <ModalDeleteConfirm
        visible={isShowConfirmDelete}
        onOk={onConfirmDelete}
        onCancel={onCancel}
        title="Bạn có chắc chắn xóa hạng khách hàng này không?"
        subTitle="Bạn sẽ không khôi phục lại hạng khách hàng này nếu đã xóa."
        okText="Xóa"
        cancelText="Thoát"
      />
    </ContentContainer>
  )
}

export default CustomerRanking