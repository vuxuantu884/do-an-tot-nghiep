import React, { Fragment, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Input, Tag } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { PageResponse } from "model/base/base-metadata.response";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DISCOUNT_STATUS } from "screens/promotion/constants";
import DatePromotionColumn from "screens/promotion/shared/date-column";
import { GiftSearchQuery, PromotionGift } from "model/promotion/gift.model";
import { getPromotionGiftListAction } from "domain/actions/promotion/gift/gift.action";
import { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import { cloneDeep } from "lodash";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import search from "assets/img/search.svg";

const initQuery: GiftSearchQuery = {
  page: 1,
  limit: 30,
  type: "",
  query: "",
};
const GiftListTab = () => {
  const dispatch = useDispatch();

  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    tempPromotionSelectedList,
    setTempPromotionSelectedList,
    tempSelectedRowKeys,
    setTempSelectedRowKeys,
  } = promotionCampaignContext;

  const [searchText, setSearchText] = useState<string>("");
  const [params, setParams] = useState<GiftSearchQuery>(initQuery);
  const [giftListData, setGiftListData] = useState<PageResponse<PromotionGift>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  /** handle get promotion gift list */
  const getPromotionGiftListCallback = useCallback((data: PageResponse<PromotionGift> | null) => {
    dispatch(hideLoading());
    if (data) {
      setGiftListData(data);
    }
  }, [dispatch]);

  const getPromotionGiftList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      dispatch(showLoading());
      dispatch(getPromotionGiftListAction(params, getPromotionGiftListCallback));
    },
    [dispatch, getPromotionGiftListCallback],
  );

  useEffect(() => {
    setParams(initQuery);
    getPromotionGiftList(initQuery);
  }, [getPromotionGiftList]);
  
  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...params, page, limit };
      getPromotionGiftList(newParams);
    },
    [getPromotionGiftList, params],
  );
  /** end handle get promotion gift list */

  /** handle search discount */
  const onChangeSearchText = (e: any) => {
    setSearchText(e.target.value);
  };

  const onSearchDiscount = useCallback(
    (inputText) => {
      const newParams = {
        ...params,
        page: 1,
        query: inputText?.trim(),
      }
      setParams(newParams);
      getPromotionGiftList(newParams);
      setSearchText(inputText?.trim());
    },
    [getPromotionGiftList, params],
  );

  const onBlurInputSearch = (e: any) => {
    setSearchText(e.target.value?.trim());
  };

  const filters = useMemo(() => {
    let list = [];
    if (params.query) {
      list.push({
        key: "query",
        name: "Từ khóa",
        value: params.query,
      });
    }

    return list;
  }, [params.query]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "query":
          const newParams = { ...params, query: "" };
          setParams(newParams);
          getPromotionGiftList(newParams);
          setSearchText("");
          break;
        default:
          break;
      }
    },
    [getPromotionGiftList, params],
  );
  /** end handle search discount */

  /** table columns */
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Tên chương trình",
      render: (item: any) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.GIFT}/${item.id}`}
          style={{ color: "#2A2A86", fontWeight: 500 }}
          target="_blank"
        >
          {item.title}
        </Link>
      ),
    },
    {
      title: "Thời gian",
      align: "center",
      render: (item: any) => (
        <DatePromotionColumn startDate={item.starts_date} endDate={item.ends_date} />
      ),
    },
    {
      title: "Đăng ký BCT",
      align: "center",
      width: "150px",
      render: (item: any) => (
        <div>
          {item.is_registered ?
            <span>Đã đăng ký</span>
            :
            <span>Chưa đăng ký</span>
          }
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "state",
      align: "center",
      width: "150px",
      render: (state: string) => {
        const StatusTag: ReactNode = DISCOUNT_STATUS.find((e: any) => e.code === state)?.Component ?? (
          <Fragment />
        );
        return StatusTag;
      },
    },
  ];

  /** handle select promotion */
  const onSelectedChange = useCallback(
    (selectedRows, selected, changeRows) => {
      const _tempPromotionSelectedList = cloneDeep(tempPromotionSelectedList);
      const _tempSelectedRowKeys = cloneDeep(tempSelectedRowKeys);
      const rowKeysChange = changeRows?.map((row: any) => row.id) || [];
      if (selected) {
        setTempPromotionSelectedList([..._tempPromotionSelectedList, ...changeRows]);
        setTempSelectedRowKeys([..._tempSelectedRowKeys, ...rowKeysChange]);
      } else {
        const newPromotionSelectedList = _tempPromotionSelectedList.filter(
          (itemSelected: any) => !rowKeysChange.includes(itemSelected.id)
        );
        setTempPromotionSelectedList(newPromotionSelectedList);

        const newSelectedRowKeys = _tempSelectedRowKeys.filter(
          (rowKey: any) => !rowKeysChange.includes(rowKey)
        );
        setTempSelectedRowKeys(newSelectedRowKeys);
      }
    },
    [tempPromotionSelectedList, tempSelectedRowKeys, setTempPromotionSelectedList, setTempSelectedRowKeys],
  );
  
  return (
    <>
      <div className="search-component">
        <Input.Search
          allowClear
          placeholder="Tìm kiếm theo mã, tên chương trình"
          prefix={<img src={search} alt="" />}
          enterButton="Tìm kiếm"
          size="small"
          value={searchText}
          onSearch={onSearchDiscount}
          onChange={onChangeSearchText}
          onBlur={onBlurInputSearch}
          maxLength={255}
          className="input-search"
        />

        <div className="filter-tags">
          {filters?.map((filter: any) => {
            return (
              <Tag
                key={filter.key}
                className="tag"
                closable
                onClose={(e) => onCloseTag(e, filter)}
              >
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
        </div>
      </div>

      <CustomTable
        bordered
        isRowSelection
        selectedRowKey={tempSelectedRowKeys}
        onSelectedChange={onSelectedChange}
        rowKey={(item: any) => item.id}
        locale={{ emptyText: "Không có bản ghi" }}
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
        columns={columns}
      />
    </>
  );
};
export default GiftListTab;
