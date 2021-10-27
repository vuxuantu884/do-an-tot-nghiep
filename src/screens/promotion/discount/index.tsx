import React, {useCallback, useEffect, useState} from "react";
import "./discount.scss";
import UrlConfig from "../../../config/url.config";
import ContentContainer from "../../../component/container/content.container";
import {Button, Card} from "antd";
import CustomTable, {ICustomTableColumType} from "../../../component/table/CustomTable";
import {PageResponse} from "../../../model/base/base-metadata.response";
import {ListDiscountResponse} from "../../../model/response/promotion/discount/list-discount.response";
import {Link} from "react-router-dom";
import {getListDiscount} from "../../../domain/actions/promotion/discount/discount.action";
import {useDispatch} from "react-redux";
import moment from "moment";
import {DATE_FORMAT} from "../../../utils/DateUtils";
import {PlusOutlined} from "@ant-design/icons";
import {MenuAction} from "../../../component/table/ActionButton";
import {DiscountSearchQuery} from "../../../model/query/discount.query";
import DiscountFilter from "./components/DiscountFilter";
import {getQueryParams, useQuery} from "../../../utils/useQuery";
import {StoreGetListAction} from "../../../domain/actions/core/store.action";
import {StoreResponse} from "../../../model/core/store.model";
import {SourceResponse} from "../../../model/response/order/source.response";
import {getListSourceRequest} from "../../../domain/actions/product/source.action";
import {actionFetchListCustomerGroup} from "../../../domain/actions/customer/customer.action";
import {CustomerGroupModel, CustomerGroupResponseModel} from "../../../model/response/customer/customer-group.response";

const DiscountPage = () => {
  const discountStatuses = [
    {
      code: 'APPLYING',
      value: 'Đang áp dụng',
      style: {
        background: "rgba(42, 42, 134, 0.1)",
        borderRadius: "100px",
        color: "rgb(42, 42, 134)",
        padding: "5px 10px"
      }
    },
    {
      code: 'TEMP_STOP',
      value: 'Tạm ngưng',
      style: {
        background: "rgba(252, 175, 23, 0.1)",
        borderRadius: "100px",
        color: "#FCAF17",
        padding: "5px 10px"
      }},
    {
      code: 'WAIT_FOR_START',
      value: 'Chờ áp dụng' ,
      style: {
        background: "rgb(245, 245, 245)",
        borderRadius: "100px",
        color: "rgb(102, 102, 102)",
        padding: "5px 10px"
      }},
    {
      code: 'ENDED',
      value: 'Kết thúc',
      style: {
        background: "rgba(39, 174, 96, 0.1)",
        borderRadius: "100px",
        color: "rgb(39, 174, 96)",
        padding: "5px 10px"
      }},
    {
      code: 'CANCELLED',
      value: 'Đã huỷ',
      style: {
        background: "rgba(226, 67, 67, 0.1)",
        borderRadius: "100px",
        color: "rgb(226, 67, 67)",
        padding: "5px 10px"
      }},
  ]
  const actions: Array<MenuAction> = [
    {
      id: 1,
      name: "Kich hoạt",
    },
    {
      id: 2,
      name: "Tạm ngừng",
    },
    {
      id: 3,
      name: "Xuất Excel",
    },
    {
      id: 4,
      name: "Huỷ",
    },
  ];
  const initQuery: DiscountSearchQuery = {
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
  const [discounts, setDiscounts] = useState<PageResponse<ListDiscountResponse>>({
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
  
  const fetchData = useCallback((data: PageResponse<ListDiscountResponse>) => {
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
  
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      fixed: "left",
      width: "7%",
      render: (value: any, item: any, index: number) =>
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}`}
          style={{color: '#2A2A86', fontWeight: 500}}
        >
          {value.code}
        </Link>,
    },
    {
      title: "Tên chương trình",
      visible: true,
      fixed: "left",
      dataIndex: "name"
    },
    {
      title: "Thời gian",
      visible: true,
      fixed: "left",
      align: 'center',
      render: (value: any, item: any, index: number) =>
        <div>{`${item.start_time && moment(item.start_time).format(DATE_FORMAT.DDMMYYY)} - ${item.end_time && moment(item.end_time).format(DATE_FORMAT.DDMMYYY)}`}</div>,
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_by",
      fixed: "left",
      align: 'center',
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      dataIndex: 'status',
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
  ]
  
  const onPageChange = useCallback(
    (page, limit) => {
      setParams({ ...params, page, limit });
    },
    [params]
  );
  
  const onFilter = useCallback(values => {
    let newParams = {...params, ...values, page: 1};
    setParams({...newParams})
  }, [params])
  
  
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
              icon={<PlusOutlined />}
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
            params={params}
            actions={actions}
            listStore={listStore}
            listSource={listSource}
            listCustomerCategories={customerGroups}
            onFilter={onFilter}
          />
          <CustomTable
            isRowSelection
            isLoading={tableLoading}
            sticky={{ offsetScroll: 5 }}
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
    </ContentContainer>)
}

export default DiscountPage;