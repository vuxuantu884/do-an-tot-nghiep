import React, { Fragment, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Input, Tag } from "antd";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { PageResponse } from "model/base/base-metadata.response";
import { PriceRule } from "model/promotion/price-rules.model";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";
import { DISCOUNT_STATUS } from "screens/promotion/constants";
import DatePromotionColumn from "screens/promotion/shared/date-column";
import {
  getPromotionReleaseListAction,
} from "domain/actions/promotion/promo-code/promo-code.action";
import { PromotionCampaignContext } from "screens/promotion/campaign/components/PromotionCampaignProvider";
import { cloneDeep } from "lodash";
import search from "assets/img/search.svg";

const initQuery: any = {
  page: 1,
  limit: 30,
  type: "",
  query: "",
};
const PromotionReleaseListTab = () => {
  const dispatch = useDispatch();

  const promotionCampaignContext = useContext(PromotionCampaignContext);
  const {
    tempPromotionSelectedList,
    setTempPromotionSelectedList,
    tempSelectedRowKeys,
    setTempSelectedRowKeys,
  } = promotionCampaignContext;

  const [searchText, setSearchText] = useState<string>("");
  const [params, setParams] = useState<any>(initQuery);
  const [dataSource, setDataSource] = useState<PageResponse<PriceRule> | null>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  /** handle get promotion release list */
  const getPromotionReleaseListCallback = useCallback(
    (data: PageResponse<PriceRule> | null) => {
      dispatch(hideLoading());
      if (data) {
        setDataSource(data);
      }
    },
    [dispatch],
  );

  const getPromotionReleaseList = useCallback(
    (params) => {
      window.scrollTo(0, 0);
      dispatch(showLoading());
      dispatch(getPromotionReleaseListAction(params, getPromotionReleaseListCallback));
    },
    [dispatch, getPromotionReleaseListCallback],
  );

  useEffect(() => {
    setParams(initQuery);
    getPromotionReleaseList(initQuery);
  }, [getPromotionReleaseList]);
  
  const onPageChange = useCallback(
    (page, limit) => {
      const newParams = { ...params, page, limit };
      getPromotionReleaseList(newParams);
    },
    [getPromotionReleaseList, params],
  );
  /** end handle get promotion release list */

  /** handle search promotion release */
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
      getPromotionReleaseList(newParams);
      setSearchText(inputText?.trim());
    },
    [getPromotionReleaseList, params],
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
          getPromotionReleaseList(newParams);
          setSearchText("");
          break;
        default:
          break;
      }
    },
    [getPromotionReleaseList, params],
  );
  /** end handle search promotion release */

  /** table columns */
  const columns: Array<ICustomTableColumType<any>> = [
    {
      title: "Tên chương trình",
      render: (item: any) => (
        <Link
          to={`${UrlConfig.PROMOTION}${UrlConfig.PROMO_CODE}/${item.id}`}
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
          pageSize: dataSource?.metadata.limit || 0,
          total: dataSource?.metadata.total || 0,
          current: dataSource?.metadata.page,
          showSizeChanger: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }}
        isShowPaginationAtHeader
        dataSource={dataSource?.items}
        columns={columns}
      />
    </>
  );
};

export default PromotionReleaseListTab;
