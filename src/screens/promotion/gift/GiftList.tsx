import React, { Fragment, ReactNode, useCallback, useEffect, useState } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Menu } from "antd";
import UrlConfig from "config/url.config";
import ContentContainer from "component/container/content.container";
import threeDot from "assets/icon/three-dot.svg";
import { PROMOTION_GIFT_PERMISSIONS } from "config/permissions/promotion.permisssion";
import useAuthorization from "hook/useAuthorization";
import { GiftSearchQuery, PromotionGift } from "model/promotion/gift.model";
import { useDispatch } from "react-redux";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";

import { PageResponse } from "model/base/base-metadata.response";
import { showError, showSuccess } from "utils/ToastUtils";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import { DISCOUNT_STATUS } from "../constants";
import DatePromotionColumn from "screens/promotion/shared/date-column";
import { generateQuery } from "utils/AppUtils";
import queryString from "query-string";
import { FiCheckCircle } from "react-icons/fi";
import { RiDeleteBin2Fill } from "react-icons/ri";
import {
  disablePromotionGiftAction,
  enablePromotionGiftAction,
  getPromotionGiftListAction,
} from "domain/actions/promotion/gift/gift.action";
import GiftListFilter from "screens/promotion/gift/components/GiftListFilter";

const GiftList = () => {
  const initQuery: GiftSearchQuery = {
    page: 1,
    limit: 30,
    query: "",
    variant_id: null,
    product_id: null,
    states: [],
    entitled_methods: [],
    creators: [],
    store_ids: [],
    channels: [],
    source_ids: [],
    starts_date_min: "",
    starts_date_max: "",
    ends_date_min: "",
    ends_date_max: "",
  };

  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  const queryParamsParsed: any = queryString.parse(location.search);

  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [giftListData, setGiftListData] = useState<PageResponse<PromotionGift>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [params, setParams] = useState<GiftSearchQuery>(initQuery);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);

  //phân quyền
  const [allowUpdateGift] = useAuthorization({
    acceptPermissions: [PROMOTION_GIFT_PERMISSIONS.UPDATE],
  });

  /** handle get promotion gift list */
  const getPromotionGiftListCallback = useCallback((data: PageResponse<PromotionGift> | null) => {
    setTableLoading(false);
    if (data) {
      setGiftListData(data);
    }
  }, []);

  const getPromotionGiftList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      setTableLoading(true);
      dispatch(getPromotionGiftListAction(params, getPromotionGiftListCallback));
    },
    [dispatch, getPromotionGiftListCallback],
  );

  useEffect(() => {
    const dataQuery: any = {
      ...initQuery,
      ...getQueryParamsFromQueryString(queryParamsParsed),
    };
    setParams(dataQuery);
    getPromotionGiftList(dataQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);
  /** end handle get promotion gift list */

  const onChangePromotionGiftStatus = (successNumber: number) => {
    if (successNumber) {
      showSuccess("Cập nhật trạng thái chương trình quà tặng thành công");
      dispatch(getPromotionGiftListAction(params, setGiftListData));
    } else {
      showError("Cập nhật trạng thái chương trình quà tặng thất bại");
    }
    setTableLoading(false);
  }

  const handleDeactivatePromotionGift = (idNumber: number) => {
    setTableLoading(true);
    dispatch(
      disablePromotionGiftAction(idNumber, (successNumber: number) =>
        onChangePromotionGiftStatus(successNumber),
      ),
    );
  };

  const handleActivatePromotionGift = (idNumber: number) => {
    setTableLoading(true);
    dispatch(
      enablePromotionGiftAction(idNumber, (successNumber: number) =>
        onChangePromotionGiftStatus(successNumber),
      ),
    );
  };

  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Mã",
      visible: true,
      render: (value: any) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.GIFT}/${value.id}`}
          style={{ color: "#2A2A86", fontWeight: 500 }}
        >
          {value.code}
        </Link>
      ),
    },
    {
      title: "Tên chương trình",
      visible: true,
      dataIndex: "title",
    },
    {
      title: "Thời gian",
      visible: true,
      align: "center",
      render: (value: any, item: any) => (
        <DatePromotionColumn startDate={item.starts_date} endDate={item.ends_date} />
      ),
    },
    {
      title: "Người tạo",
      visible: true,
      dataIndex: "created_name",
      align: "center",
    },
    {
      title: "Trạng thái",
      visible: true,
      dataIndex: "state",
      align: "center",
      render: (state: string) => {
        const StatusTag: ReactNode = DISCOUNT_STATUS.find((e) => e.code === state)?.Component ?? (
          <Fragment />
        );
        return StatusTag;
      },
    },
    {
      visible: false, //@Todo Thái Tạm ẩn thao tác
      dataIndex: "id",
      align: "center",
      render: (id: number, item: any) => (
        <Dropdown.Button
          disabled={!allowUpdateGift}
          overlay={
            <Menu>
              <Menu.Item icon={<EditOutlined />} key={1}>
                <Link to={`${UrlConfig.GIFT}/${id}/update`}>Chỉnh sửa</Link>
              </Menu.Item>
              {item.state === "DISABLED" ? (
                <Menu.Item
                  key={3}
                  icon={<FiCheckCircle />}
                  onClick={() => {
                    handleActivatePromotionGift(id);
                  }}
                >
                  Kích hoạt
                </Menu.Item>
              ) : (
                <Menu.Item
                  key={3}
                  icon={<RiDeleteBin2Fill />}
                  onClick={() => {
                    handleDeactivatePromotionGift(id);
                  }}
                >
                  Tạm ngừng
                </Menu.Item>
              )}
            </Menu>
          }
          icon={<img src={threeDot} alt="" style={{ verticalAlign: "super" }} />}
        />
      ),
    },
  ];

  // Tạm ẩn thao tác
  const tableColumns = columns.filter(column => column.visible);

  const onPageChange = (page: number, limit?: number) => {
    const newParams = { ...params, page, limit };
    const queryParam = generateQuery(newParams);
    history.push(`${location.pathname}?${queryParam}`);
  };

  const onFilter = (values: GiftSearchQuery | Object) => {
    const newParams = { ...params, ...values, page: 1 };
    const queryParam = generateQuery(newParams);
    const currentParam = generateQuery(params);
    if (currentParam === queryParam) {
      getPromotionGiftList(newParams);
    } else {
      history.push(`${location.pathname}?${queryParam}`);
    }
  };


  return (
    <ContentContainer
      title="Quà tặng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khuyến mại",
        },
        {
          name: "Quà tặng",
          path: `${UrlConfig.PROMOTION}${UrlConfig.GIFT}`,
        },
      ]}
      extra={
        <Link to={`${UrlConfig.PROMOTION}${UrlConfig.GIFT}/create`}>
          <Button
            className="ant-btn-outline ant-btn-primary"
            size="large"
            icon={<PlusOutlined />}

          >
            Thêm chương trình quà tặng
          </Button>
        </Link>
      }
    >
      <Card title={"Danh sách quà tặng"}>
        <GiftListFilter
          initQuery={initQuery}
          params={params}
          onFilter={onFilter}
        />
        <CustomTable
          bordered={true}
          selectedRowKey={selectedRowKey}
          onChangeRowKey={(rowKey) => setSelectedRowKey(rowKey)}
          // isRowSelection //Tạm ẩn thao tác
          isLoading={tableLoading}
          sticky={{
            offsetScroll: 5,
            offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
          }}
          pagination={{
            pageSize: giftListData?.metadata.limit || 0,
            total: giftListData?.metadata.total || 0,
            current: giftListData?.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          isShowPaginationAtHeader
          dataSource={giftListData?.items}
          // columns={columns} //Tạm ẩn thao tác
          columns={tableColumns}
          rowKey={(item: any) => item.id}
        />
      </Card>
    </ContentContainer>
  );
};

export default GiftList;
