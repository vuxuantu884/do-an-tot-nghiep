import {
  Card,
  Button,
  Form,
  Input,
  Select
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import actionColumn from "./actions/action.column";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import search from "assets/img/search.svg";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import "./promo-code.scss";
import { FilterOutlined, PlusOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { DATE_FORMAT } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { getQueryParams, useQuery } from "../../../utils/useQuery";
import {
  deletePriceRulesById,
  getListDiscount,
  bulkDeletePriceRules,
  bulkDisablePriceRules,
  bulkEnablePriceRules
} from "domain/actions/promotion/discount/discount.action";
import { DiscountResponse } from "model/response/promotion/discount/list-discount.response";
import { PROMO_TYPE } from "utils/Constants";
import { showSuccess } from "utils/ToastUtils";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { ACTIONS_PROMO, STATUS_CODE } from "../constant";

const PromotionCode = () => {
  const dispatch = useDispatch();
  const query = useQuery();
  let dataQuery: any = {
    ...{
      type: PROMO_TYPE.MANUAL,
      request: "",
      state: ""
    },
    ...getQueryParams(query)
  }
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<PageResponse<DiscountResponse> | null>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  const [params, setParams] = useState<any>(dataQuery);
  const [isShowDeleteModal, setIsShowDeleteModal] = React.useState<boolean>(false);
  const [modalInfo, setModalInfo] = React.useState<any>();
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);

  const fetchData = useCallback((data: PageResponse<DiscountResponse> | null) => {
    dispatch(hideLoading());
    if (data) {
      setDataSource(data)
    }
    setTableLoading(false);
  }, [dispatch])

  useEffect(() => {
    dispatch(showLoading());
    dispatch(getListDiscount(params, fetchData));
  }, [dispatch, fetchData, params]);

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

  const handleUpdate = (item: any) => {
    console.log(item);
  };

  const handleShowDeleteModal = (item: any) => {
    setModalInfo(item);
    setIsShowDeleteModal(true);
  };

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      fixed: "left",
      width: "12%",
      render: (value: any, item: any, index: number) =>
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${item.id}`}
          style={{color: '#2A2A86', fontWeight: 500}}
        >
          {value.code}
        </Link>,
    },
    {
      title: "Tên đợt phát hành",
      visible: true,
      fixed: "left",
      dataIndex: "title",
      width: "20%",
    },
    {
      title: "SL mã",
      visible: true,
      fixed: "left",
      align: 'center',
      dataIndex: "number_of_discount_codes",
      width: "10%",
    },
    {
      title: "Đã sử dụng",
      visible: true,
      fixed: "left",
      align: 'center',
      dataIndex: "total_usage_count",
      width: "10%",
    },
    {
      title: "Thời gian",
      visible: true,
      fixed: "left",
      align: 'center',
      width: "20%",
      render: (value: any, item: any, index: number) =>
        <div>{`${item.starts_date && moment(item.starts_date).format(DATE_FORMAT.DDMMYY_HHmm)}`} - {item.ends_date ? moment(item.ends_date).format(DATE_FORMAT.DDMMYY_HHmm) : <span>&#8734;</span>}</div>,
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_by",
      fixed: "left",
      align: 'center',
      width: "10%",
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      dataIndex: 'state',
      align: 'center',
      width: '15%',
      render: (value: any, item: any, index: number) => {
        const status: any | null = STATUS_CODE.find(e => e.code === item.state);
        return (<div
          style={status?.style}
        >
          {status?.value}
        </div>)
      }
    },
    actionColumn(handleUpdate, handleShowDeleteModal),
  ];

  const statuses = [
    {
      code: 'ACTIVE',
      value: 'Đang áp dụng',
    },
    {
      code: 'DISABLED',
      value: 'Tạm ngưng',
    },
    {
      code: 'DRAFT',
      value: 'Chờ áp dụng' ,
    },
    {
      code: 'CANCELLED',
      value: 'Đã huỷ',
    },

  ]

  const handleCallback = useCallback((response) => {

    if (response) {
      setTimeout(() => {
        showSuccess("Thao tác thành công");
        dispatch(getListDiscount(params, fetchData));
      }, 1500)
    }
  }, [dispatch, params, fetchData]);


  const onMenuClick = useCallback(
    async (index: number) => {
      const body = {ids: selectedRowKey}
      switch (index) {
        case 1:
          dispatch(showLoading());
          dispatch(bulkEnablePriceRules(body, handleCallback));
          break;
        case 2:
          dispatch(showLoading());
          dispatch(bulkDisablePriceRules(body, handleCallback));
          break;
        case 3:
          break;
        case 4:
          dispatch(showLoading());
          dispatch(bulkDeletePriceRules(body, handleCallback));
          break;
      }
    },
    [dispatch, handleCallback, selectedRowKey]
  );

  const {Item} = Form;
  const {Option} = Select;

  const openFilter = useCallback(() => {
    // setVisible(true);
  }, [])

  return (
    <ContentContainer
      title="Danh sách đợt phát hành"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mãi",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
        },
        {
          name: "Đợt phát hành",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}`,
        },
      ]}
      extra={
        <>
          <Link to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/create`}>
            <Button
              className="ant-btn-outline ant-btn-primary"
              size="large"
              icon={<PlusOutlined />}
            >
              Thêm mới đợt phát hành
            </Button>
          </Link>
        </>
      }
    >
      <Card>
        <div className="promotion-code__search">
          <CustomFilter onMenuClick={onMenuClick}  menu={ACTIONS_PROMO}>
            <Form onFinish={onFilter} initialValues={params} layout="inline">
              <Item name="query" className="search">
                <Input
                  prefix={<img src={search} alt=""/>}
                  placeholder="Tìm kiếm theo mã, tên chương trình"
                />
              </Item>
              <Item name="state" >
                <Select
                  showArrow
                  showSearch
                  style={{minWidth: "200px"}}
                  optionFilterProp="children"
                  placeholder="Chọn trạng thái"
                  allowClear={true}
                >
                  {statuses?.map((item) => (
                    <Option key={item.code} value={item.code}>
                      {item.value}
                    </Option>
                  ))}
                </Select>
              </Item>
              <Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Item>
              <Item>
                <Button icon={<FilterOutlined />} onClick={openFilter}>Thêm bộ lọc</Button>
              </Item>
            </Form>
          </CustomFilter>

          {/* <Card style={{ position: "relative" }}> */}
          <CustomTable
            selectedRowKey={selectedRowKey}
            onChangeRowKey={(rowKey) => {setSelectedRowKey(rowKey)}}
            isRowSelection
            isLoading={tableLoading}
            sticky={{offsetScroll: 5}}
            pagination={{
              pageSize: dataSource?.metadata.limit || 0,
              total: dataSource?.metadata.total || 0,
              current: dataSource?.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={dataSource?.items}
            columns={columns}
            rowKey={(item: any) => item.id}
          />
        </div>
      </Card>
      <ModalDeleteConfirm
        onCancel={() => setIsShowDeleteModal(false)}
        onOk={() => {
          setIsShowDeleteModal(false);
          dispatch(showLoading());
          dispatch(deletePriceRulesById(modalInfo?.id, handleCallback));
        }}
        title="Xoá mã đợt giảm giá"
        subTitle="Bạn có chắc xoá mã đợt giảm giá?"
        visible={isShowDeleteModal}
      />
    </ContentContainer>
  );
};

export default PromotionCode;
