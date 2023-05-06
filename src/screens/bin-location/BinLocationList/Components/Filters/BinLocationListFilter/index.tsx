import { Button, Form, FormInstance, Input, Select, Tag } from "antd";

import { MenuAction } from "component/table/ActionButton";
import React, { createRef, useCallback, useEffect, useMemo, useRef } from "react";
import search from "assets/img/search.svg";
import { AccountResponse } from "model/account/account.model";
import CustomFilter from "component/table/custom.filter";
import { FilterOutlined } from "@ant-design/icons";
import { OrderSearchQuery } from "model/order/order.model";
import { BinLocationListFiltersWrapper } from "./styles";
import ButtonSetting from "component/table/ButtonSetting";
import "assets/css/custom-filter.scss";
import { StoreResponse } from "model/core/store.model";
import { PageResponse } from "model/base/base-metadata.response";
import { BinLocationTabUrl, INVENTORY_STATUSES } from "../../../../helper";
import { BinLocationSearchQuery } from "model/bin-location";

type OrderFilterProps = {
  accountStores?: Array<StoreResponse> | null;
  params: BinLocationSearchQuery;
  actions: Array<MenuAction>;
  isLoading?: Boolean;
  isLoadingAction?: boolean;
  accounts: Array<AccountResponse> | undefined;
  defaultAccountProps?: PageResponse<AccountResponse>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: OrderSearchQuery | Object) => void;
  onShowColumnSetting?: () => void;
  onClearFilter?: () => void;
  stores?: Array<StoreResponse>;
  activeTab?: string;
};

const { Item } = Form;

const BinLocationListFilter: React.FC<OrderFilterProps> = (props: OrderFilterProps) => {
  const {
    params,
    actions,
    isLoading,
    isLoadingAction,
    onMenuClick,
    onFilter,
    onShowColumnSetting,
    activeTab,
  } = props;
  const [formAdv] = Form.useForm();
  const [formSearch] = Form.useForm();
  const formSearchRef = createRef<FormInstance>();
  const inputSearchRef = useRef<Input | null>(null);
  // let status: string[] = [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filterFromParams = {
    ...params,
    filter_status: Array.isArray(params.filter_status)
      ? params.filter_status
      : params.filter_status
      ? [params.filter_status]
      : [],
  };
  const initialValues = useMemo(() => {
    return filterFromParams;
  }, [filterFromParams]);

  useEffect(() => {
    if (!inputSearchRef) return;
    if (activeTab === "") return;
    if (activeTab === `${BinLocationTabUrl.LIST}` || activeTab === BinLocationTabUrl.HISTORIES) {
      inputSearchRef?.current?.focus();
    }
  }, [activeTab, inputSearchRef]);

  useEffect(() => {
    formAdv.setFieldsValue(filterFromParams);
  }, [filterFromParams, formAdv, formSearchRef, params]);

  const loadingFilter = useMemo(() => {
    return !!isLoading;
  }, [isLoading]);

  const openFilter = useCallback(() => {
    // setVisible(true);
  }, []);
  const onActionClick = useCallback(
    (index: number) => {
      onMenuClick && onMenuClick(index);
    },
    [onMenuClick],
  );

  const onFinish = useCallback(
    (values) => {
      const valuesForm = {
        ...values,
        condition: values.condition ? values.condition.trim() : null,
      };
      onFilter && onFilter(valuesForm);
    },
    [onFilter],
  );

  let filters = useMemo(() => {
    let list = [];
    if (initialValues.filter_status.length && initialValues.filter_status[0]) {
      let textStatus = "";
      if (initialValues.filter_status.length > 1) {
        initialValues.filter_status.forEach((statusValue) => {
          const status = INVENTORY_STATUSES?.find((status) => status.value === statusValue);
          textStatus = status ? textStatus + status.name + "; " : textStatus;
        });
      } else if (initialValues.filter_status.length === 1) {
        initialValues.filter_status.forEach((statusValue) => {
          const status = INVENTORY_STATUSES?.find((status) => status.value === statusValue);
          textStatus = status ? textStatus + status.name : textStatus;
        });
      }

      list.push({
        key: "filter_status",
        name: "Trạng thái",
        value: textStatus,
      });
    }

    return list;
  }, [initialValues]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "filter_status":
          onFilter && onFilter({ ...params, filter_status: [] });
          formSearch.setFieldsValue({
            filter_status: [],
          });
          break;
      }
    },
    [formSearch, onFilter, params],
  );

  return (
    <BinLocationListFiltersWrapper>
      <div className="custom-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions} actionDisable>
          <Form
            form={formSearch}
            onFinish={onFinish}
            ref={formSearchRef}
            initialValues={initialValues}
            layout="inline"
          >
            <Item name="condition" className="input-search">
              <Input
                ref={inputSearchRef}
                className="input-search"
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã SKU, hoặc Tên sản phẩm, hoặc mã vạch"
                onBlur={(e) => {
                  formSearchRef?.current?.setFieldsValue({
                    condition: e.target.value.trim(),
                  });
                }}
                allowClear
              />
            </Item>
            <Item name="filter_status" className="select-item" style={{ width: 250 }}>
              <Select allowClear placeholder="Tình trạng tồn theo vị trí">
                {INVENTORY_STATUSES.map((status) => {
                  return <Select.Option value={status.value}>{status.name}</Select.Option>;
                })}
              </Select>
            </Item>
            <Item>
              <Button
                style={{ width: "80px" }}
                type="primary"
                loading={isLoadingAction}
                disabled={isLoadingAction}
                htmlType="submit"
              >
                Lọc
              </Button>
            </Item>
            <Item>
              <Button
                style={{ width: "180px" }}
                icon={<FilterOutlined />}
                onClick={openFilter}
                disabled
              >
                Thêm bộ lọc
              </Button>
            </Item>
            <ButtonSetting onClick={onShowColumnSetting} />
          </Form>
        </CustomFilter>
      </div>
      <div className="order-filter-tags">
        {filters &&
          filters.map((filter: any, index) => {
            return (
              <Tag key={index} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
      </div>
    </BinLocationListFiltersWrapper>
  );
};

export default BinLocationListFilter;
