import {
  Card,
  Button,
  Form,
  Input,
  // Tag
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import actionColumn from "./actions/action.column";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import CustomSelect from "component/custom/select.custom";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import "./promo-code.scss";
import { PlusOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { DATE_FORMAT } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { MenuAction } from "component/table/ActionButton";
import { getQueryParams, useQuery } from "../../../utils/useQuery";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";
import { deletePriceRulesById, getListDiscount } from "domain/actions/promotion/discount/discount.action";
import { DiscountResponse } from "model/response/promotion/discount/list-discount.response";
import { PROMO_TYPE } from "utils/Constants";
import { showError, showSuccess } from "utils/ToastUtils";
import { bulkDeletePriceRules, bulkDisablePriceRules, bulkEnablePriceRules } from "service/promotion/discount/discount.service";
import { hideLoading, showLoading } from "domain/actions/loading.action";


const PromotionCode = () => {
  const dispatch = useDispatch();
  const query = useQuery();
  let dataQuery: any = {
    ...{
      type: PROMO_TYPE.MANUAL,
      request: "",
      status: ""
    },
    ...getQueryParams(query)
  }
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<PageResponse<DiscountResponse>>({
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

  const promotionStatuses = [
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
      name: "Kích hoạt",
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
      name: "Xoá",
    },
  ];

  const fetchData = useCallback((data: PageResponse<DiscountResponse>) => {
    setDataSource(data)
    setTableLoading(false)
  }, [])

  useEffect(() => {
    dispatch(getListDiscount(params, fetchData));
  }, [dispatch, fetchData, params])

  const onPageChange = useCallback(
    (page, limit) => {
      setParams({ ...params, page, limit });
    },
    [params]
  );

  const onFilter = useCallback(values => {
    let newParams = {...params, ...values, page: 1};
    console.log("newParams", newParams);
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
      width: "7%",
      render: (value: any, item: any, index: number) =>
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${item.id}`}
          style={{color: '#2A2A86', fontWeight: 500}}
        >
          {value.id}
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
      dataIndex: "usage_limit_per_customer",
      width: "10%",
    },
    {
      title: "Đã sử dụng",
      visible: true,
      fixed: "left",
      dataIndex: "usage_limit",
      width: "10%",
    },
    {
      title: "Thời gian",
      visible: true,
      fixed: "left",
      align: 'center',
      width: "20%",
      render: (value: any, item: any, index: number) =>
        <div>{`${item.starts_date && moment(item.starts_date).format(DATE_FORMAT.DDMMYYY)} - ${item.ends_date && moment(item.ends_date).format(DATE_FORMAT.DDMMYYY)}`}</div>,
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
      dataIndex: 'status',
      align: 'center',
      width: '12%',
      render: (value: any, item: any, index: number) => {
        const status: any | null = promotionStatuses.find(e => e.code === item.type);
        return (<div
          style={status?.style}
        >
          {status?.item.type}
        </div>)
      }
    },
    actionColumn(handleUpdate, handleShowDeleteModal),
  ];

  // function tagRender(props: any) {
  //   const { label, closable, onClose } = props;
  //   const onPreventMouseDown = (event: any) => {
  //     event.preventDefault();
  //     event.stopPropagation();
  //   };
  //   return (
  //     <Tag
  //       className="primary-bg"
  //       onMouseDown={onPreventMouseDown}
  //       closable={closable}
  //       onClose={onClose}
  //     >
  //       {label}
  //     </Tag>
  //   );
  // }

  const listStatus: Array<BaseBootstrapResponse> = [
    {
      value: "APPLYING",
      name: "Đang áp dụng",
    },
    {
      value: "TEMP_STOP",
      name: "Tạm ngưng",
    },
    {
      value: "WAIT_FOR_START",
      name: "Chờ áp dụng",
    },
    {
      value: "ENDED",
      name: "Kết thúc",
    },
    {
      value: "CANCELLED",
      name: "Đã huỷ",
    }
  ]

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

  const onDeleteSuccess = useCallback(() => {
    dispatch(hideLoading());
    showSuccess("Xóa thành công");
    dispatch(getListDiscount(params, fetchData));
  }, [dispatch, fetchData, params]);

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
          <CustomFilter onMenuClick={onMenuClick} menu={actions}>
            <Form onFinish={onFilter} initialValues={params} layout="inline">
              <Form.Item name="request" className="search">
                <Input
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="Tìm kiếm theo mã, tên đợt phát hành"
                />
              </Form.Item>
              <Form.Item name="status" className="status">
                <CustomSelect
                  style={{ width: "100%", borderRadius: "6px" }}
                  showArrow
                  showSearch
                  placeholder="Nguồn đơn hàng"
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {listStatus.map((item, index) => (
                    <CustomSelect.Option
                      style={{ width: "100%" }}
                      key={(index + 1).toString()}
                      value={item.value}
                    >
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Form.Item>
              {/* style={{ display: "flex", justifyContent: "flex-end" }}> */}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Lọc
                </Button>
              </Form.Item>
              <Form.Item>
                <Button>Thêm bộ lọc</Button>
              </Form.Item>
            </Form>
          </CustomFilter>

          {/* <Card style={{ position: "relative" }}> */}
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
              pageSize: dataSource.metadata.limit,
              total: dataSource.metadata.total,
              current: dataSource.metadata.page,
              showSizeChanger: true,
              onChange: onPageChange,
              onShowSizeChange: onPageChange,
            }}
            dataSource={dataSource.items}
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
          dispatch(deletePriceRulesById(modalInfo?.id, onDeleteSuccess));
        }}
        title="Bạn có chắc muốn xoá không?"
        subTitle="Các tập tin, dữ liệu bên trong thư mục này cũng sẽ bị xoá."
        visible={isShowDeleteModal}
      />
    </ContentContainer>
  );
};

export default PromotionCode;
