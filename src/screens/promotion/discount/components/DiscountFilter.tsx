import moment from "moment";
import { StoreResponse } from "../../../../model/core/store.model";
import { SourceResponse } from "../../../../model/response/order/source.response";
import search from "assets/img/search.svg";
import {
  CustomerGroupModel,
} from "../../../../model/response/customer/customer-group.response";
import { DiscountSearchQuery } from "../../../../model/query/discount.query";
import { MenuAction } from "../../../../component/table/ActionButton";
import {Button, Col, Form, Input, Row, Select, Spin, Tag} from "antd";
import React, { useCallback, useEffect, useMemo, useState} from "react";
import { StyledComponent } from "./style";
import CustomFilter from "../../../../component/table/custom.filter";
import {
  DATE_FORMAT,
  formatDateFilter
} from "utils/DateUtils";
import { SearchVariantField, SearchVariantMapping } from "../../../../model/promotion/promotion-mapping";
import useAuthorization from "hook/useAuthorization";
import { PromoPermistion } from "config/permissions/promotion.permisssion";
import BaseFilter from "component/filter/base.filter";
import { FilterOutlined } from "@ant-design/icons";
import TreeStore from "../../../products/inventory/filter/TreeStore";
import {useDispatch} from "react-redux";
import {
  convertItemToArray,
  handleFetchApiError,
  isFetchApiSuccessful,
} from "utils/AppUtils";
import {
  getVariantApi,
  searchVariantsApi,
} from "service/product/product.service";
import debounce from "lodash/debounce";
import FilterDateCustomerCustom from "component/filter/FilterDateCustomerCustom";

type DiscountFilterProps = {
  initQuery: DiscountSearchQuery;
  params: DiscountSearchQuery;
  actions: Array<MenuAction>;
  listStore?: Array<StoreResponse>;
  listSource?: Array<SourceResponse>;
  listCustomerCategories?: Array<CustomerGroupModel>;
  // tableLoading: boolean;
  onMenuClick?: (index: number) => void;
  onFilter?: (value: DiscountSearchQuery | Object) => void;
}

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
    value: 'Chờ áp dụng',
  },
  {
    code: 'CANCELLED',
    value: 'Đã huỷ',
  },

]

const discount_methods = [
  {
    code: 'total_amount',
    value: 'Theo tổng giá trị đơn hàng',
  },
  {
    code: 'specific_item',
    value: 'Theo từng sản phẩm',
  },
  {
    code: 'parity',
    value: 'Đồng giá',
  },
  {
    code: 'quantity',
    value: 'Theo số lượng sản phẩm',
  },
  {
    code: 'item_category',
    value: 'Theo từng loại sản phẩm',
  },
]

const DATE_LIST_FORMAT = {
  todayFrom: moment().startOf('day').format('DD-MM-YYYY'),
  todayTo: moment().endOf('day').format('DD-MM-YYYY'),

  yesterdayFrom: moment().startOf('day').subtract(1, 'days').format('DD-MM-YYYY'),
  yesterdayTo: moment().endOf('day').subtract(1, 'days').format('DD-MM-YYYY'),

  thisWeekFrom: moment().startOf('week').format('DD-MM-YYYY'),
  thisWeekTo: moment().endOf('week').format('DD-MM-YYYY'),

  lastWeekFrom: moment().startOf('week').subtract(1, 'weeks').format('DD-MM-YYYY'),
  lastWeekTo: moment().endOf('week').subtract(1, 'weeks').format('DD-MM-YYYY'),

  thisMonthFrom: moment().startOf('month').format('DD-MM-YYYY'),
  thisMonthTo: moment().endOf('month').format('DD-MM-YYYY'),

  lastMonthFrom: moment().subtract(1, 'months').startOf('month').format('DD-MM-YYYY'),
  lastMonthTo: moment().subtract(1, 'months').endOf('month').format('DD-MM-YYYY'),
}

const { Item } = Form;
const { Option } = Select;

const DiscountFilter: React.FC<DiscountFilterProps> = (props: DiscountFilterProps) => {
  const {
    initQuery,
    params,
    actions,
    listStore,
    listSource,
    listCustomerCategories,
    // tableLoading,
    onMenuClick,
    onFilter,
  } = props;

  // useState
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  
  const [isLoading, setIsLoading] = useState(false);
  const [variantList, setVariantList] = useState<Array<any>>([]);
  const [initVariantList, setInitVariantList] = useState<Array<any>>([]);

  const initialValues = useMemo(() => {
    return {
      ...params,
      status: convertItemToArray(params.status),
      discount_method: convertItemToArray(params.discount_method),
      applied_shop: Array.isArray(params.applied_shop) ?
        params.applied_shop.map((item: any) => Number(item))
        : [Number(params.applied_shop)],
    };
  }, [params]);

  // handle get variant by filter param
  const getVariantDetailById = useCallback(
    async (variantId: string) => {
    let variants: any = [];
    try {
      variants = await getVariantApi(variantId)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            return [
              {
                label: response.data?.name,
                value: response.data?.id?.toString(),
                variantId: response.data?.id?.toString(),
                productId: response.data?.product_id,
              }
            ]
          } else {
            handleFetchApiError(response, "Danh sách tài khoản", dispatch);
          }
        }).catch((error) => {
          console.log('getVariantDetailById fail: ', error);
        })
    } catch {}
    setVariantList(variants);
    setInitVariantList(variants);
  }, [dispatch]);
  // end handle get variant by filter param

  // handle select date by filter param
  const handleDateFilterParam = (date_from: any, date_to: any, setDate: any) => {
    const dateFrom = formatDateFilter(date_from)?.format(DATE_FORMAT.DD_MM_YYYY);
    const dateTo = formatDateFilter(date_to)?.format(DATE_FORMAT.DD_MM_YYYY);

    if (dateFrom === DATE_LIST_FORMAT.todayFrom && dateTo === DATE_LIST_FORMAT.todayTo) {
      setDate("today");
    } else if (dateFrom === DATE_LIST_FORMAT.yesterdayFrom && dateTo === DATE_LIST_FORMAT.yesterdayTo) {
      setDate("yesterday");
    } else if (dateFrom === DATE_LIST_FORMAT.thisWeekFrom && dateTo === DATE_LIST_FORMAT.thisWeekTo) {
      setDate("thisWeek");
    } else if (dateFrom === DATE_LIST_FORMAT.lastWeekFrom && dateTo === DATE_LIST_FORMAT.lastWeekTo) {
      setDate("lastWeek");
    } else if(dateFrom === DATE_LIST_FORMAT.thisMonthFrom && dateTo === DATE_LIST_FORMAT.thisMonthTo) {
      setDate("thisMonth");
    } else if (dateFrom === DATE_LIST_FORMAT.lastMonthFrom && dateTo === DATE_LIST_FORMAT.lastMonthTo) {
      setDate("lastMonth");
    } else {
      setDate("");
    }
  }
  // end handle select date by filter param

  useEffect(() => {
    if (initialValues.variant_id) {
      getVariantDetailById(initialValues.variant_id);
    }
    handleDateFilterParam(initialValues.from_created_date, initialValues.to_created_date, setCreatedDateClick);
    setCreatedDateStart(initialValues.from_created_date);
    setCreatedDateEnd(initialValues.to_created_date);
    form.setFieldsValue({
      ...initialValues
    });
  }, [form, getVariantDetailById, initialValues]);
  
  // handle search variants
  const searchVariants = async (input: any) => {
    try {
      const result = await searchVariantsApi({info: input})
      return result?.data?.items?.map(item => {
        return {
          label: item.name,
          value: item.id?.toString(),
          variantId: item.id?.toString(),
          productId: item.product_id,
        }
      })
    } catch (error) {
      console.log(error);
    }
  }

  const onSearchVariants = useCallback((value: string) => {
    if (value?.trim()?.length >= 3) {
      setVariantList([]);
      setIsLoading(true);
      searchVariants(value)
        .then((newOptions: any) => {
          setVariantList(newOptions);
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  const handleSearchVariants = debounce((value: string) => {
    onSearchVariants(value);
  }, 800);
  // end handle search variants
  
  //handle create date filter
  const [createdDateClick, setCreatedDateClick] = useState("");
  const [createdDateStart, setCreatedDateStart] = useState<any>(params.from_created_date);
  const [createdDateEnd, setCreatedDateEnd] = useState<any>(params.to_created_date);

  const clearCreatedDate = () => {
    setCreatedDateClick("");
    setCreatedDateStart(null);
    setCreatedDateEnd(null);
  };
  
  const clickOptionDate = useCallback(
    (type, value) => {
      let startDateValue = null;
      let endDateValue = null;

      switch (value) {
        case "today":
          startDateValue = moment().utc().startOf("day");
          endDateValue = moment().utc().endOf("day");
          break;
        case "yesterday":
          startDateValue = moment().utc().startOf("day").subtract(1, "days");
          endDateValue = moment().utc().endOf("day").subtract(1, "days");
          break;
        case "thisWeek":
          startDateValue = moment().utc().startOf("week");
          endDateValue = moment().utc().endOf("week");
          break;
        case "lastWeek":
          startDateValue = moment().utc().startOf("week").subtract(1, "weeks");
          endDateValue = moment().utc().endOf("week").subtract(1, "weeks");
          break;
        case "thisMonth":
          startDateValue = moment().utc().startOf("month");
          endDateValue = moment().utc().endOf("month");
          break;
        case "lastMonth":
          startDateValue = moment().utc().subtract(1, "months").startOf("month");
          endDateValue = moment().utc().subtract(1, "months").endOf("month");
          break;
        default:
          break;
      }

      switch (type) {
        case "created_date":
          if (createdDateClick === value) {
            clearCreatedDate();
          } else {
            setCreatedDateClick(value);
            setCreatedDateStart(startDateValue?.toISOString());
            setCreatedDateEnd(endDateValue?.toISOString());
          }
          break;
        default:
          break;
      }
    },
    [createdDateClick]
  );
  
  const handleCreatedDateStart = (date: any) => {
    setCreatedDateClick("");
    if (!date) {
      setCreatedDateStart(null);
    } else {
      const startOfDate = date.utc().startOf("day");
      setCreatedDateStart(startOfDate?.toISOString());
    }
  }

  const handleCreatedDateEnd = (date: any) => {
    setCreatedDateClick("");
    if (!date) {
      setCreatedDateEnd(null);
    } else {
      const endOfDate = date.utc().endOf("day");
      setCreatedDateEnd(endOfDate?.toISOString());
    }
  }
  //end handle create date filter

  // useCallback
  const onFinish = useCallback((values: DiscountSearchQuery) => {
    if (values.variant_id) {
      const variants = variantList.find(item => item.variantId === values.variant_id);
      values.product_id = variants?.productId;
    } else {
      values.product_id = null;
    }
    const formValues = {
      ...values,
      from_created_date: createdDateStart,
      to_created_date: createdDateEnd,
      created_date: [createdDateStart, createdDateEnd],
    };
    onFilter && onFilter(formValues);
  }, [createdDateEnd, createdDateStart, onFilter, variantList])

  const onFilterClick = useCallback(() => {
    setVisible(false);
    form.submit();
  }, [form]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, [])

  const onActionClick = useCallback((index) => {
    onMenuClick && onMenuClick(index);
  }, [onMenuClick])

  const onClearFilterClick = useCallback(() => {
    onFilter && onFilter(initQuery);
    setVisible(false);
  }, [initQuery, onFilter]);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const [allowUpdateDiscount] = useAuthorization({ acceptPermissions: [PromoPermistion.UPDATE] })

  // handle tag filter
  let filters = useMemo(() => {
    let list = [];

    if (initialValues.query) {
      list.push({
        key: "query",
        name: "Chương trình",
        value: initialValues.query,
      });
    }
    
    if (initialValues.variant_id) {
      const variant = initVariantList.find(item => item.variantId?.toString() === initialValues.variant_id?.toString());
      list.push({
        key: "variant_id",
        name: "Sản phẩm",
        value: variant?.label || initialValues.variant_id,
      });
    }

    if (initialValues.state) {
      const status = statuses.find(item => item.code === initialValues.state);
      list.push({
        key: "state",
        name: "Trạng thái",
        value: status?.value || initialValues.state,
      });
    }

    if (initialValues.created_date?.length && (initialValues.created_date[0] ||initialValues.created_date[1])) {
      const [from_created_date, to_created_date] = initialValues.created_date;
      const startDate = formatDateFilter(from_created_date)?.format(DATE_FORMAT.DDMMYYY);
      const endDate = formatDateFilter(to_created_date)?.format(DATE_FORMAT.DDMMYYY);
      let createdDateTextFilter =
        (initialValues.from_created_date ? startDate : "")
        + " ~ " +
        (initialValues.to_created_date ? endDate : "")
      list.push({
        key: "created_date",
        name: "Ngày tạo",
        value: createdDateTextFilter,
      });
    }

    if (initialValues.status?.length) {
      let statusFiltered = "";
      initialValues.status.forEach((statusValue: string) => {
        const status = statuses.find(item => item.code === statusValue);
        statusFiltered = status
          ? statusFiltered + status.value + "; "
          : statusFiltered;
      });
      list.push({
        key: "status",
        name: "Trạng thái chương trình",
        value: statusFiltered,
      });
    }

    if (initialValues.applied_shop?.length) {
      let appliedStoreFiltered = "";
      initialValues.applied_shop.forEach((store_id: any) => {
        const appliedStore = listStore?.find(
          (item: any) => item.id?.toString() === store_id?.toString()
        );
        appliedStoreFiltered = appliedStore
          ? appliedStoreFiltered + appliedStore.name + "; "
          : appliedStoreFiltered;
      });
      list.push({
        key: "applied_shop",
        name: "Cửa hàng áp dụng",
        value: appliedStoreFiltered,
      });
    }

    if (initialValues.discount_method?.length) {
      let discountMethodFiltered = "";
      initialValues.discount_method.forEach((discountMethodValue: any) => {
        const discountMethod = discount_methods.find(
          (item: any) => item.code?.toString() === discountMethodValue?.toString()
        );
        discountMethodFiltered = discountMethod
          ? discountMethodFiltered + discountMethod.value + "; "
          : discountMethodFiltered;
      });
      if (discountMethodFiltered) {
        list.push({
          key: "discount_method",
          name: "Phương thức chiết khấu",
          value: discountMethodFiltered,
        });
      }
    }
    

    return list;
  }, [
    initialValues.query,
    initialValues.variant_id,
    initialValues.state,
    initialValues.created_date,
    initialValues.from_created_date,
    initialValues.to_created_date,
    initialValues.status,
    initialValues.applied_shop,
    initialValues.discount_method,
    initVariantList,
    listStore,
  ]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "query":
          onFilter && onFilter({ ...params, query: null });
          // formCustomerFilter?.setFieldsValue({ gender: null });
          break;
        case "variant_id":
          onFilter && onFilter({ ...params, variant_id: null, product_id: null });
          // formCustomerFilter?.setFieldsValue({ customer_group_ids: [] });
          break;
        case "state":
          onFilter && onFilter({ ...params, state: null });
          // formCustomerFilter?.setFieldsValue({ customer_group_ids: [] });
          break;
        case "created_date":
          clearCreatedDate();
          onFilter &&
          onFilter({
            ...params,
            from_created_date: null,
            to_created_date: null,
            created_date: null,
          });
          break;
        case "status":
          onFilter && onFilter({ ...params, status: [] });
          break;
        case "applied_shop":
          onFilter && onFilter({ ...params, applied_shop: [] });
          break;
        case "discount_method":
          onFilter && onFilter({ ...params, discount_method: [] });
          break;

        default:
          break;
      }
    },
    [
      onFilter,
      params,
    ]
  );
  // end handle tag filter

  
  return (
    <StyledComponent>
      <div className="discount-filter">
        <CustomFilter onMenuClick={onActionClick} menu={actions} actionDisable={!allowUpdateDiscount}>
          <Form onFinish={onFinish} initialValues={params} layout="inline" form={form}>
            <Item name="query" className="search">
              <Input
                prefix={<img src={search} alt="" />}
                placeholder="Tìm kiếm theo mã, tên chương trình"
                allowClear
                onBlur={(e) => { form.setFieldsValue({ query: e.target.value?.trim() || '' }) }}
              />
            </Item>

            <Form.Item
              name="variant_id"
              className="search-variant">
              <Select
                loading={isLoading}
                showSearch
                showArrow
                onSearch={handleSearchVariants}
                allowClear
                optionFilterProp="children"
                placeholder={"Tìm kiếm theo tên, mã, barcode sản phẩm"}
                notFoundContent={
                  isLoading ? <Spin size="small" /> : "Không tìm thấy kết quả"
                }
                getPopupContainer={trigger => trigger.parentNode}
                filterOption={false}
                options={variantList}
              />
            </Form.Item>
            
            <Item name="state">
              <Select
                style={{ minWidth: "200px" }}
                optionFilterProp="children"
                // mode="multiple"
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

        <div className="filter-tags">
          {filters?.map((filter: any) => {
            return (
              <Tag
                key={filter.key}
                className="tag"
                closable={!isLoading}
                onClose={(e) => onCloseTag(e, filter)}
              >
                {filter.name}: {filter.value}
              </Tag>
            );
          })}
        </div>
        
        <BaseFilter
          visible={visible}
          onClearFilter={onClearFilterClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          width={700}
        >
          <Form
            onFinish={onFinish}
            form={form}
            initialValues={params}
            layout="vertical"
          >
            <Row gutter={20}>
              {Object.keys(SearchVariantMapping).map((key) => {
                let component: any = null;
                switch (key) {
                  case SearchVariantField.created_date:
                    component =
                      <FilterDateCustomerCustom
                        dateType="created_date"
                        clickOptionDate={clickOptionDate}
                        dateSelected={createdDateClick}
                        startDate={createdDateStart}
                        endDate={createdDateEnd}
                        handleSelectDateStart={handleCreatedDateStart}
                        handleSelectDateEnd={handleCreatedDateEnd}
                      />;
                    break;
                  case SearchVariantField.status:
                    component = (
                      <Select
                        optionFilterProp="children"
                        mode="multiple"
                        maxTagCount={"responsive"}
                        placeholder="Chọn 1 hoặc nhiều trạng thái"
                      >
                        <Option value="">Tất cả trạng thái</Option>
                        {statuses?.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.value}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.discount_method:
                    component = (
                      <Select
                        optionFilterProp="children"
                        mode="multiple"
                        maxTagCount={"responsive"}
                        placeholder="Chọn 1 hoặc nhiều phương thức"
                      >
                        <Option value="">Tất cả phương thức</Option>
                        {discount_methods?.map((item) => (
                          <Option key={item.code} value={item.code}>
                            {item.value}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.applied_shop:
                    component = (
                      <TreeStore
                        name="applied_shop"
                        placeholder="Chọn 1 hoặc nhiều cửa hàng"
                        listStore={listStore}
                        getPopupContainer={(trigger: any) => trigger.parentElement}
                      />
                    );
                    break;
                  case SearchVariantField.applied_source:
                    component = (
                      <Select
                        optionFilterProp="children"
                        mode="multiple"
                        maxTagCount={"responsive"}
                        placeholder="Chọn 1 hoặc nhiều kênh bán hàng"
                      >
                        <Option value="">Tất cả kênh bán hàng</Option>
                        {listSource?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                  case SearchVariantField.customer_category:
                    component = (
                      <Select
                        optionFilterProp="children"
                        mode="multiple"
                        maxTagCount={"responsive"}
                        placeholder="Chọn 1 hoặc nhiều đối tượng khách hàng"
                      >
                        <Option value="">Tất cả khách hàng</Option>
                        {listCustomerCategories?.map((item) => (
                          <Option key={item.id} value={item.id}>
                            {item.name}
                          </Option>
                        ))}
                      </Select>
                    );
                    break;
                }
                return (
                  <Col span={12} key={key}>
                    <div style={{ marginBottom: 5 }}><b>{SearchVariantMapping[key]}</b></div>
                    <Item name={key}>{component}</Item>
                  </Col>
                );
              })
              }
            </Row>
          </Form>
        </BaseFilter>
      </div>
    </StyledComponent>
  )
}

export default DiscountFilter;
