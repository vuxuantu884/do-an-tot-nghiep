import React, { Fragment, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Input, Tag } from "antd";
import { PriceRule } from "model/promotion/price-rules.model";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import {
  getListDiscountAction,
} from "domain/actions/promotion/discount/discount.action";
import { PageResponse } from "model/base/base-metadata.response";
import { DiscountSearchQuery } from "model/query/discount.query";
import { DISCOUNT_STATUS } from "screens/promotion/constants";
import DatePromotionColumn from "screens/promotion/shared/date-column";
import { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import { cloneDeep } from "lodash";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import search from "assets/img/search.svg";

const initQuery: DiscountSearchQuery = {
  page: 1,
  limit: 30,
  query: "",
};

const DiscountListTab = () => {
  const dispatch = useDispatch();
  
  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    tempPromotionSelectedList,
    setTempPromotionSelectedList,
    tempSelectedRowKeys,
    setTempSelectedRowKeys,
  } = promotionCampaignContext;

  const [searchText, setSearchText] = useState<string>("");
  const [params, setParams] = useState<DiscountSearchQuery>(initQuery);
  const [discounts, setDiscounts] = useState<PageResponse<PriceRule>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  /** handle get discount list */
  const getDiscountListCallback = useCallback((data: PageResponse<PriceRule> | null) => {
    dispatch(hideLoading());
    if (data) {
      setDiscounts(data);
    }
  }, [dispatch]);

  const getDiscountList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      dispatch(showLoading());
      dispatch(getListDiscountAction(params, getDiscountListCallback));
    },
    [dispatch, getDiscountListCallback],
  );

  useEffect(() => {
    setParams(initQuery);
    getDiscountList(initQuery);
  }, [getDiscountList]);

  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...params, page, limit };
      getDiscountList(newParams);
    },
    [getDiscountList, params],
  );
  /** end handle get discount list */

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
      getDiscountList(newParams);
      setSearchText(inputText?.trim());
    },
    [getDiscountList, params],
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
          getDiscountList(newParams);
          setSearchText("");
          break;
        default:
          break;
      }
    },
    [getDiscountList, params],
  );
  /** end handle search discount */
  
  /** table columns */
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Tên chương trình",
      render: (item: any) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.DISCOUNT}/${item.id}`}
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
        sticky={{
          offsetScroll: 5,
          offsetHeader: OFFSET_HEADER_UNDER_NAVBAR,
        }}
        pagination={{
          pageSize: discounts?.metadata.limit || 0,
          total: discounts?.metadata.total || 0,
          current: discounts?.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        isShowPaginationAtHeader
        dataSource={discounts?.items}
        columns={columns}
      />
    </>
  );
};

export default DiscountListTab;
