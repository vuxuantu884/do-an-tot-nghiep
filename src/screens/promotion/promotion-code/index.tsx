import {
  Card,
  Button,
  Form,
  Input,
  Tag,
  Select
} from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import actionColumn from "./actions/action.column";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import CustomFilter from "component/table/custom.filter";
import CustomSelect from "component/custom/select.custom";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import "./promotion-code.scss";
import { PlusOutlined } from "@ant-design/icons";
import { SearchOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { DATE_FORMAT } from "utils/DateUtils";
import { PageResponse } from "model/base/base-metadata.response";
import { MenuAction } from "component/table/ActionButton";
import { getListPromotionCode } from "domain/actions/promotion/promotion-code/promotion-code.action";
import { ListPromotionCodeResponse } from "model/response/promotion/promotion-code/list-discount.response";
import { getQueryParams, useQuery } from "../../../utils/useQuery";
import { BaseBootstrapResponse } from "model/content/bootstrap.model";

const PromotionCode = () => {
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

  const initQuery: any = {
    request: "",
    status: ""
  };
  const dispatch = useDispatch();
  const query = useQuery();

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [data, setData] = useState<PageResponse<ListPromotionCodeResponse>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  })
  let dataQuery: any = {
    ...initQuery,
    ...getQueryParams(query)
  }
  const [params, setParams] = useState<any>(dataQuery);

  const fetchData = useCallback((data: PageResponse<ListPromotionCodeResponse>) => {
    setData(data)
    setTableLoading(false)
  }, [])

  useEffect(() => {
    dispatch(getListPromotionCode(params, fetchData));
  }, [dispatch, fetchData, params]);

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
    console.log(item);
  };
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      fixed: "left",
      width: "7%",
      render: (value: any, item: any, index: number) =>
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.PROMOTION_CODE}/${item.id}`}
          style={{color: '#2A2A86', fontWeight: 500}}
        >
          {value.id}
        </Link>,
    },
    {
      title: "Tên đợt phát hành",
      visible: true,
      fixed: "left",
      dataIndex: "name",
      width: "20%",
    },
    {
      title: "SL mã",
      visible: true,
      fixed: "left",
      dataIndex: "code_amount",
      width: "10%",
    },
    {
      title: "Đã sử dụng",
      visible: true,
      fixed: "left",
      dataIndex: "used_amount",
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
  const columnFinal = React.useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  function tagRender(props: any) {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        className="primary-bg"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
      >
        {label}
      </Tag>
    );
  }
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
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMOTION_CODE}`,
        },
        {
          name: "Đợt phát hành",
          path: `${UrlConfig.PROMOTION}${UrlConfig.PROMOTION_CODE}`,
        },
      ]}
      extra={
        <>
          <Link to={`${UrlConfig.PROMOTION}${UrlConfig.PROMOTION_CODE}/create`}>
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
          <CustomFilter menu={actions}>
            <Form onFinish={onFilter} initialValues={params} layout="inline">
              <Form.Item name="request" className="search">
                <Input
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="Tìm kiếm theo mã, tên đợt phát hành"
                />
              </Form.Item>
              <Form.Item name="status" className="store">
                <CustomSelect
                  showSearch
                  optionFilterProp="children"
                  showArrow
                  placeholder="Chọn trạng thái"
                  allowClear
                  tagRender={tagRender}
                  style={{
                    width: "100%",
                  }}
                  notFoundContent="Không tìm thấy kết quả"
                >
                  {listStatus?.map((item) => (
                    <CustomSelect.Option key={item.value} value={item.value}>
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
            isRowSelection
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
            columns={columnFinal}
            rowKey={(item: any) => item.id}
          />
        </div>
      </Card>
    </ContentContainer>
  );
};

export default PromotionCode;
