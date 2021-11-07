import React, {useCallback, useEffect, useState} from "react";
import "./discount.scss";
import UrlConfig from "../../../config/url.config";
import ContentContainer from "../../../component/container/content.container";
import {Button, Card, Col, Dropdown, Menu, Row} from "antd";
import CustomTable, {ICustomTableColumType} from "../../../component/table/CustomTable";
import {PageResponse} from "../../../model/base/base-metadata.response";
import {DiscountResponse} from "../../../model/response/promotion/discount/list-discount.response";
import {Link} from "react-router-dom";
import {getListDiscount} from "../../../domain/actions/promotion/discount/discount.action";
import {
  bulkDeletePriceRules,
  bulkDisablePriceRules,
  bulkEnablePriceRules,
  deletePriceRuleById
} from "../../../service/promotion/discount/discount.service"
import {useDispatch} from "react-redux";
import moment from "moment";
import {DATE_FORMAT} from "../../../utils/DateUtils";
import {DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";
import {DiscountSearchQuery} from "../../../model/query/discount.query";
import DiscountFilter from "./components/DiscountFilter";
import {getQueryParams, useQuery} from "../../../utils/useQuery";
import {StoreGetListAction} from "../../../domain/actions/core/store.action";
import {StoreResponse} from "../../../model/core/store.model";
import {SourceResponse} from "../../../model/response/order/source.response";
import {getListSourceRequest} from "../../../domain/actions/product/source.action";
import {actionFetchListCustomerGroup} from "../../../domain/actions/customer/customer.action";
import {CustomerGroupModel, CustomerGroupResponseModel} from "../../../model/response/customer/customer-group.response";
import {showError, showSuccess} from "../../../utils/ToastUtils";
import ModalDeleteConfirm from "../../../component/modal/ModalDeleteConfirm";
import { PROMO_TYPE } from "utils/Constants";
import { STATUS_CODE, ACTIONS_DISCOUNT } from "../constant";


const DiscountPage = () => {
  const discountStatuses = STATUS_CODE;
  const actions = ACTIONS_DISCOUNT;
  const initQuery: DiscountSearchQuery = {
    type: PROMO_TYPE.AUTOMATIC,
    request: "",
    from_created_date: "",
    to_created_date: "",
    status: "",
    applied_shop: "",
    applied_source: "",
    customer_category: "",
    discount_method: ""
  };
  const dispatch = useDispatch();
  const query = useQuery();

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [discounts, setDiscounts] = useState<PageResponse<DiscountResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  let dataQuery: DiscountSearchQuery = {
    ...initQuery,
    ...getQueryParams(query)
  }
  const [params, setParams] = useState<DiscountSearchQuery>(dataQuery);
  const [listStore, setStore] = useState<Array<StoreResponse>>();
  const [listSource, setListSource] = useState<Array<SourceResponse>>([]);
  const [customerGroups, setCustomerGroups] = useState<Array<CustomerGroupModel>>([]);
  const [isConfirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [selectedRowId, setSelectedRowId] = useState<number>(-1);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);

  const fetchData = useCallback((data: PageResponse<DiscountResponse>) => {
    setDiscounts(data)
    setTableLoading(false)
  }, [])

  useEffect(() => {
    dispatch(getListDiscount(params, fetchData));
    dispatch(StoreGetListAction(setStore));
    dispatch(getListSourceRequest(setListSource));
    dispatch(actionFetchListCustomerGroup({},
      (data: CustomerGroupResponseModel) => setCustomerGroups(data.items)
    ))
  }, [dispatch, fetchData, params]);

  useEffect(() => {
    dispatch(getListDiscount(params, fetchData));
  }, [dispatch, fetchData, params])

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      fixed: "left",
      width: "9%",
      render: (value: any, item: any, index: number) =>
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${value.id}`}
          style={{color: '#2A2A86', fontWeight: 500}}
        >
          {value.code}
        </Link>,
    },
    {
      title: "Tên chương trình",
      visible: true,
      fixed: "left",
      dataIndex: "title"
    },
    {
      title: "Ưu tiên",
      visible: true,
      dataIndex: "priority",
      align: 'center',
      render: (value: any) => (
        <Row justify="center">
          <Col>
            <div
              style={{
                background: "rgba(42, 42, 134, 0.1)",
                borderRadius: "5px",
                color: "#2A2A86",
                padding: "5px 10px",
                width: "fit-content"
              }}
            >
              {value}
            </div>
          </Col>
        </Row>)

    },
    {
      title: "Thời gian",
      visible: true,
      fixed: "left",
      align: 'center',
      render: (value: any, item: any, index: number) =>
        <div>{`${item.starts_date && moment(item.starts_date).format(DATE_FORMAT.DDMMYY_HHmm)} - ${item.ends_date ? moment(item.ends_date).format(DATE_FORMAT.DDMMYY_HHmm) : "∞"}`}</div>,
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_name",
      fixed: "left",
      align: 'center',
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      dataIndex: 'state',
      align: 'center',
      width: '12%',
      render: (value: any, item: any, index: number) => {
        const status: any | null = discountStatuses.find(e => e.code === value);
        return (<div
          style={status?.style}
        >
          {status?.value}
        </div>)
      }
    },
    {
      visible: true,
      fixed: "left",
      dataIndex: 'status',
      align: 'center',
      width: '12%',
      render: (value: any, item: any, index: number) => <Dropdown.Button overlay={(
        <Menu>
          <Menu.Item icon={<EditOutlined/>}>Chỉnh sửa</Menu.Item>
          <Menu.Item style={{color: "#E24343"}} icon={<DeleteOutlined/>}
                     onClick={() => {
                       setSelectedRowId(item.id);
                       setConfirmDelete(true)
                     }}>
            Huỷ
          </Menu.Item>
        </Menu>
      )}/>
    },
  ]

  const onPageChange = useCallback(
    (page, limit) => {
      setParams({...params, page, limit});
    },
    [params]
  );

  const onFilter = useCallback(values => {
    let newParams = {...params, ...values, page: 1};
    setParams({...newParams})
  }, [params])

  const onMenuClick = useCallback(
    async (index: number) => {
      const body = {ids: selectedRowKey}
      switch (index) {
        case 1:
          const bulkEnableResponse = await bulkEnablePriceRules(body);
          if (bulkEnableResponse.code === 20000000) {
            showSuccess('Thao tác thành công');
            dispatch(getListDiscount(params, fetchData));
          } else {
            showError(`${bulkEnableResponse.code} - ${bulkEnableResponse.message}`)
          }
          break;
        case 2:
          const bulkDisableResponse = await bulkDisablePriceRules(body);
          if (bulkDisableResponse.code === 20000000) {
            showSuccess('Thao tác thành công');
            dispatch(getListDiscount(params, fetchData));
          } else {
            showError(`${bulkDisableResponse.code} - ${bulkDisableResponse.message}`)
          }
          break;
        case 3:
          break;
        case 4:
          const bulkDeleteResponse = await bulkDeletePriceRules(body);
          if (bulkDeleteResponse.code === 20000000) {
            showSuccess('Thao tác thành công');
            dispatch(getListDiscount(params, fetchData));
          } else {
            showError(`${bulkDeleteResponse.code} - ${bulkDeleteResponse.message}`)
          }
          break;

      }
    },
    [dispatch, fetchData, params, selectedRowKey]
  );

  return (
    <ContentContainer
      title="Chiết khấu"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
        {
          name: "Chiết khấu",
          path: `${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`,
        },
      ]}
      extra={
        <>
          <Link to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/create`}>
            <Button
              className="ant-btn-outline ant-btn-primary"
              size="large"
              icon={<PlusOutlined/>}
            >
              Tạo mới khuyến mại
            </Button>
          </Link>
        </>
      }
    >
      <Card
        title={
          <div className="d-flex">
            <span className="tab-label">
              Danh sách chiết khấu
            </span>
          </div>
        }
      >
        <div>
          <DiscountFilter
            onMenuClick={onMenuClick}
            params={params}
            actions={actions}
            listStore={listStore}
            listSource={listSource}
            listCustomerCategories={customerGroups}
            onFilter={onFilter}
          />
          <CustomTable
            selectedRowKey={selectedRowKey}
            onChangeRowKey={(rowKey) => {
              console.log('CustomTable: ', rowKey)
              setSelectedRowKey(rowKey)
            }}
            isRowSelection
            isLoading={tableLoading}
            sticky={{offsetScroll: 5}}
            pagination={{
              pageSize: discounts.metadata.limit,
              total: discounts.metadata.total,
              current: discounts.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={discounts.items}
            columns={columns}
            rowKey={(item: any) => item.id}
          />
        </div>
      </Card>
      <ModalDeleteConfirm
        onCancel={() => setConfirmDelete(false)}
        onOk={async () => {
          const deleteResponse = await deletePriceRuleById(selectedRowId);
          if (deleteResponse.code === 20000000) {
            showSuccess('Thao tác thành công');
            dispatch(getListDiscount(params, fetchData));

          } else {
            showError(`${deleteResponse.code} - ${deleteResponse.message}`)
          }
          setConfirmDelete(false);
        }}
        title="Bạn có chắc muốn xoá chương trình?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isConfirmDelete}
      />
    </ContentContainer>)
}

export default DiscountPage;
