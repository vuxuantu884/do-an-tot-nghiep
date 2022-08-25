import { DownOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Dropdown, Form, FormInstance, Input, Menu, Select, Tag } from "antd";
import { useDispatch } from "react-redux";
import CustomRangeDatePicker from "component/custom/new-date-range-picker";
import { ConvertUtcToLocalDate } from "utils/DateUtils";

import BaseFilter from "component/filter/base.filter";
import { WebAppGetOrdersMappingQuery } from "model/query/web-app.query";
import { SourceResponse } from "model/response/order/source.response";
import { createRef, useEffect, useState } from "react";
import { AbandonCartBaseFilterStyle, OrderCartListFilterStyle } from "./OrderCartFilter.style";
import search from "assets/img/search.svg";
import moment from "moment";

type OrderCartListFilterProps = {
  params: WebAppGetOrdersMappingQuery;
  isLoading: boolean;
  onFilter: (values: WebAppGetOrdersMappingQuery | Object) => void;
  initQuery: WebAppGetOrdersMappingQuery;
  handleDownloadOrderSelected: () => void;
  onClearFilter?: () => void;
  sourceList: Array<SourceResponse>;
  isSelectedRow: boolean;
};

const OrderCartListFilter = (props: any) => {
  const { params, isLoading, onFilter, initQuery, onClearFilter, sourceList } = props;
  const { Item } = Form;
  const { Option } = Select;
  const [formFilter] = Form.useForm();
  const formRef = createRef<FormInstance>();
  const dispatch = useDispatch();

  const [visibleBaseFilter, setVisibleBaseFilter] = useState(false);
  const [filterTags, setFilterTags] = useState<Array<any>>();
  const [createdClick, setCreatedClick] = useState("");

  //handle clear base filter
  const handleClearBaseFilter = () => {
    setVisibleBaseFilter(false);
    formFilter.setFieldsValue(initQuery);
    onClearFilter && onClearFilter();
  };

  //handle form
  const handleFinish = (values: any) => {
    onFilter && onFilter(values);
  };

  //handle tag
  useEffect(() => {
    let filters = [];

    if (params.searcher) {
      filters.push({
        key: "searcher",
        name: "Tên khách hàng, SĐT, Email",
        value: params.searcher,
      });
    }
    if (params.core_order_code) {
      filters.push({
        key: "core_order_id",
        name: "ID đơn hàng",
        value: params.core_order_code,
      });
    }

    if (params.updated_date_from || params.updated_date_to) {
      let textOrderCreateDate =
        (params.updated_date_from
          ? moment(params.updated_date_from, "DD-MM-YYYY").format("DD-MM-YYYY")
          : "??") +
        " ~ " +
        (params.updated_date_to
          ? moment(params.updated_date_to, "DD-MM-YYYY").format("DD-MM-YYYY")
          : "??");
      filters.push({
        key: "updated_date",
        name: "Ngày update đơn",
        value: textOrderCreateDate,
      });
    }

    setFilterTags(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, sourceList]);
  const handleRemoveTag = (e: any, tag: any) => {
    e.preventDefault();
    let newParams = { ...params };
    if (tag.key === "searcher") {
      newParams = {
        ...newParams,
        ...{ searcher: null },
      };
    } else if (tag.key === "updated_date") {
      newParams = {
        ...newParams,
        ...{ updated_date_from: null, updated_date_to: null },
      };
      setCreatedClick("");
    } else if (tag.key === "core_order_id") {
      newParams = { ...newParams, ...{ core_order_id: [] } };
      setCreatedClick("");
    } else {
      newParams = { ...newParams, ...{ [tag.key]: null } };
    }
    onFilter && onFilter(newParams);
  };

  //set params to form
  useEffect(() => {
    formRef.current?.setFieldsValue({
      core_order_id: params.core_order_id,
      searcher: params.searcher,
      updated_date_from: params.updated_date_from,
      updated_date_to: params.updated_date_to,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <OrderCartListFilterStyle>
      <div className="order-filter">
        <Form
          ref={formRef}
          className="default-filter"
          initialValues={params}
          onFinish={handleFinish}
        >
          <Item name="core_order_id" className="search-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="ID đơn hàng"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  core_order_id: e.target.value.trim(),
                });
              }}
              onPressEnter={(e: any) => {
                formFilter.setFieldsValue({
                  core_order_id: e.target.value.trim(),
                });
              }}
            />
          </Item>
          <Item name="searcher" className="search-input">
            <Input
              disabled={isLoading}
              prefix={<img src={search} alt="" />}
              placeholder="Tên khách hàng, SĐT, Email"
              onBlur={(e) => {
                formFilter?.setFieldsValue({
                  searcher: e.target.value.trim(),
                });
              }}
              onPressEnter={(e: any) => {
                formFilter.setFieldsValue({
                  searcher: e.target.value.trim(),
                });
              }}
            />
          </Item>
          <Item style={{ marginRight: "15px" }}>
            <Button type="primary" htmlType="submit" disabled={isLoading}>
              Lọc
            </Button>
          </Item>
          <Item>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setVisibleBaseFilter(true)}
              disabled={isLoading}
            >
              Thêm bộ lọc
            </Button>
          </Item>
        </Form>
        <div className="order-filter-tags">
          {filterTags &&
            filterTags.map((tag: any, index) => {
              return (
                <Tag key={index} className="tag" closable onClose={(e) => handleRemoveTag(e, tag)}>
                  {tag.name}: {tag.value}
                </Tag>
              );
            })}
        </div>
        <BaseFilter
          onClearFilter={handleClearBaseFilter}
          onFilter={() => {
            setVisibleBaseFilter(false);
            formRef?.current?.submit();
          }}
          onCancel={() => setVisibleBaseFilter(false)}
          visible={visibleBaseFilter}
          className="order-filter-drawer"
          width={500}
        >
          <AbandonCartBaseFilterStyle>
            <Form ref={formRef} onFinish={handleFinish} initialValues={params} layout="vertical">
              <Form.Item label={<b>Ngày update đơn</b>}>
                <CustomRangeDatePicker
                  fieldNameFrom="updated_date_from"
                  fieldNameTo="updated_date_to"
                  activeButton={createdClick}
                  setActiveButton={setCreatedClick}
                  format="DD-MM-YYYY"
                  formRef={formRef}
                />
              </Form.Item>
            </Form>
          </AbandonCartBaseFilterStyle>
        </BaseFilter>
      </div>
    </OrderCartListFilterStyle>
  );
};
export default OrderCartListFilter;
