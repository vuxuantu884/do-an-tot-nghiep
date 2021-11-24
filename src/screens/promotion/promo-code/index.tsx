import {FilterOutlined, PlusOutlined} from "@ant-design/icons";
import {Button, Card, Form, Input, Select} from "antd";
import search from "assets/img/search.svg";
import ContentContainer from "component/container/content.container";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import {MenuAction} from "component/table/ActionButton";
import CustomFilter from "component/table/custom.filter";
import CustomTable, {ICustomTableColumType} from "component/table/CustomTable";
import TagStatus, {TagStatusType} from "component/tag/tag-status";
import {PromoPermistion} from "config/permissions/promotion.permisssion";
import UrlConfig from "config/url.config";
import {hideLoading, showLoading} from "domain/actions/loading.action";
import {
  bulkDeletePriceRules,
  bulkDisablePriceRules,
  bulkEnablePriceRules,
  deletePriceRulesById,
  getListDiscount,
} from "domain/actions/promotion/discount/discount.action";
import useAuthorization from "hook/useAuthorization";
import {PageResponse} from "model/base/base-metadata.response";
import {DiscountResponse} from "model/response/promotion/discount/list-discount.response";
import moment from "moment";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {Link} from "react-router-dom";
import NoPermission from "screens/no-permission.screen";
import {OFFSET_HEADER_UNDER_NAVBAR, PROMO_TYPE} from "utils/Constants";
import {DATE_FORMAT} from "utils/DateUtils";
import {showSuccess} from "utils/ToastUtils";
import {getQueryParams, useQuery} from "../../../utils/useQuery";
import {ACTIONS_PROMO} from "../constant";
import actionColumn from "./actions/action.column";
import "./promo-code.scss";

const PromotionCode = () => {
  const dispatch = useDispatch();
  const query = useQuery();
  let dataQuery: any = {
    ...{
      type: PROMO_TYPE.MANUAL,
      request: "",
      state: null,
    },
    ...getQueryParams(query),
  };
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<PageResponse<DiscountResponse> | null>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [form] = Form.useForm();

  const [params, setParams] = useState<any>(dataQuery);
  const [isShowDeleteModal, setIsShowDeleteModal] = React.useState<boolean>(false);
  const [modalInfo, setModalInfo] = React.useState<any>();
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);

  //phân quyền
  const [actionsPromo, setAcionsPromo] = useState<Array<MenuAction>>(ACTIONS_PROMO);
  const [allowReadPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.READ],
  });
  const [allowCreatePromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CREATE],
  });
  const [allowCancelPromoCode] = useAuthorization({
    acceptPermissions: [PromoPermistion.CANCEL],
  });

  const fetchData = useCallback(
    (data: PageResponse<DiscountResponse> | null) => {
      dispatch(hideLoading());
      if (data) {
        setDataSource(data);
      }
      setTableLoading(false);
    },
    [dispatch]
  );

  useEffect(() => {
    setTableLoading(true);
    dispatch(getListDiscount(params, fetchData));
  }, [dispatch, fetchData, params]);

  useEffect(() => {
    setAcionsPromo([...ACTIONS_PROMO]);
    if (!allowCancelPromoCode)
      setAcionsPromo([...ACTIONS_PROMO.filter((e) => e.id !== 1 && e.id !== 2)]);
  }, [allowCancelPromoCode]);

  const onPageChange = useCallback(
    (page, limit) => {
      setParams({...params, page, limit});
    },
    [params]
  );

  const onFilter = useCallback(
    (values) => {
      let newParams = {...params, ...values, page: 1};
      setParams({...newParams});
    },
    [params]
  );

  const handleUpdate = (item: any) => {
    console.log(item);
  };

  const handleShowDeleteModal = (item: any) => {
    setModalInfo(item);
    setIsShowDeleteModal(true);
  };

  const statuses = [
    {
      code: "ACTIVE",
      value: "Đang áp dụng",
    },
    {
      code: "DISABLED",
      value: "Tạm ngưng",
    },
    {
      code: "DRAFT",
      value: "Chờ áp dụng",
    },
    {
      code: "CANCELLED",
      value: "Đã huỷ",
    },
  ];

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      fixed: "left",
      width: "12%",
      render: (value: any, item: any, index: number) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${item.id}`}
          style={{color: "#2A2A86", fontWeight: 500}}
        >
          {value.code}
        </Link>
      ),
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
      align: "center",
      dataIndex: "number_of_discount_codes",
      width: "10%",
    },
    {
      title: "Đã sử dụng",
      visible: true,
      fixed: "left",
      align: "center",
      dataIndex: "total_usage_count",
      width: "10%",
    },
    {
      title: "Thời gian",
      visible: true,
      fixed: "left",
      align: "center",
      width: "20%",
      render: (value: any, item: any, index: number) => (
        <div>
          {`${
            item.starts_date && moment(item.starts_date).format(DATE_FORMAT.DDMMYY_HHmm)
          }`}{" "}
          -{" "}
          {item.ends_date ? (
            moment(item.ends_date).format(DATE_FORMAT.DDMMYY_HHmm)
          ) : (
            <span>&#8734;</span>
          )}
        </div>
      ),
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_by",
      fixed: "left",
      align: "center",
      width: "10%",
    },
    {
      title: "Trạng thái",
      visible: true,
      fixed: "left",
      dataIndex: "state",
      align: "center",
      width: "15%",
      render: (value: string) => {
        const status = statuses.find((e) => e.code === value)?.value || "";
        let type = TagStatusType.nomarl;
        switch (value) {
          case statuses[0].code:
            type = TagStatusType.primary;
            break;
          case statuses[1].code:
            type = TagStatusType.warning;
            break;
          case statuses[2].code:
            type = TagStatusType.nomarl;
            break;
          case statuses[3].code:
            type = TagStatusType.danger;
            break;
          default:
            break;
        }
        return <TagStatus type={type}>{status}</TagStatus>;
      },
    },
    actionColumn(handleUpdate, handleShowDeleteModal),
  ];

  const handleCallback = useCallback(
    (response) => {
      if (response) {
        setTimeout(() => {
          showSuccess("Thao tác thành công");
          dispatch(getListDiscount(params, fetchData));
        }, 1500);
      }
    },
    [dispatch, params, fetchData]
  );

  const onMenuClick = useCallback(
    async (index: number) => {
      const body = {ids: selectedRowKey};
      switch (index) {
        case 1:
          setTableLoading(true);
          dispatch(bulkEnablePriceRules(body, handleCallback));
          break;
        case 2:
          setTableLoading(true);
          dispatch(bulkDisablePriceRules(body, handleCallback));
          break;
        case 3:
          break;
        case 4:
          setTableLoading(true);
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
  }, []);

  return (
    <>
      {allowReadPromoCode ? (
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
            allowCreatePromoCode ? (
              <Link to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/create`}>
                <Button
                  className="ant-btn-outline ant-btn-primary"
                  size="large"
                  icon={<PlusOutlined />}
                >
                  Thêm mới đợt phát hành
                </Button>
              </Link>
            ) : null
          }
        >
          <Card>
            <div className="promotion-code__search">
              <CustomFilter onMenuClick={onMenuClick} menu={actionsPromo}>
                <Form
                  onFinish={onFilter}
                  initialValues={params}
                  layout="inline"
                  form={form}
                >
                  <Item name="query" className="search">
                    <Input
                      prefix={<img src={search} alt="" />}
                      placeholder="Tìm kiếm theo mã, tên chương trình"
                      onBlur={(e) => {
                        form.setFieldsValue({query: e.target.value?.trim()});
                      }}
                    />
                  </Item>
                  <Item name="state">
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
                    <Button icon={<FilterOutlined />} onClick={openFilter}>
                      Thêm bộ lọc
                    </Button>
                  </Item>
                </Form>
              </CustomFilter>

              <CustomTable
                selectedRowKey={selectedRowKey}
                onChangeRowKey={(rowKey) => {
                  setSelectedRowKey(rowKey);
                }}
                isRowSelection
                isLoading={tableLoading}
                sticky={{offsetScroll: 5, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR}}
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
      ) : (
        <NoPermission />
      )}
    </>
  );
};

export default PromotionCode;
