import moment from "moment";
import { StoreByDepartment, StoreResponse } from "model/core/store.model";
import { SourceResponse } from "model/response/order/source.response";
import search from "assets/img/search.svg";
import { DiscountSearchQuery } from "model/query/discount.query";
import { Button, Col, Form, Input, Row, Select, Spin, Tag } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { DATE_FORMAT, formatDateFilter } from "utils/DateUtils";
import BaseFilter from "component/filter/base.filter";
import { FilterOutlined } from "@ant-design/icons";
import TreeStore from "component/CustomTreeSelect";
import { useDispatch } from "react-redux";
import { convertItemToArray, handleFetchApiError, isFetchApiSuccessful } from "utils/AppUtils";
import {
  getVariantApi,
  productDetailApi,
  searchProductWrapperApi,
  searchVariantsApi,
} from "service/product/product.service";
import debounce from "lodash/debounce";
import {
  GiftFilterFieldMapping,
  GiftFilterField,
  GIFT_METHOD_LIST,
} from "model/promotion/gift.model";
import SelectRangeDateCustom, {
  convertSelectedDateOption,
  handleSelectedDate,
} from "component/filter/SelectRangeDateCustom";
import AccountCustomSearchSelect from "component/custom/AccountCustomSearchSelect";
import { AccountResponse } from "model/account/account.model";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { PageResponse } from "model/base/base-metadata.response";
import TreeSource from "component/treeSource";
import { ChannelResponse } from "model/response/product/channel.response";
import { cloneDeep } from "lodash";
import { GiftListFilterStyled } from "screens/promotion/gift/gift.style";
import { StoreGetListAction } from "domain/actions/core/store.action";
import { getListChannelRequest } from "domain/actions/order/order.action";
import { getListAllSourceRequest } from "domain/actions/product/source.action";
import { STATE_LIST } from "screens/promotion/constants";


const { Item } = Form;
const { Option } = Select;

type DiscountFilterProps = {
  initQuery: DiscountSearchQuery;
  params: DiscountSearchQuery;
  onFilter?: (value: DiscountSearchQuery | Object) => void;
};

const GiftListFilter: React.FC<DiscountFilterProps> = (props: DiscountFilterProps) => {
  const {
    initQuery,
    params,
    onFilter,
  } = props;

  // useState
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [variantList, setVariantList] = useState<Array<any>>([]);
  const [variantIdSelected, setVariantIdSelected] = useState<string | null>("");
  const [isSearchingVariant, setIsSearchingVariant] = useState(false);

  const [productList, setProductList] = useState<Array<any>>([]);
  const [productIdSelected, setProductIdSelected] = useState<string | null>("");
  const [isSearchingProduct, setIsSearchingProduct] = useState(false);

  const [initProductVariantList, setInitProductVariantList] = useState<Array<any>>([]);
  const [productVariantList, setProductVariantList] = useState<Array<any>>([]);
  const [productVariantSelected, setProductVariantSelected] = useState<any>(null);

  const [initAccount, setInitAccount] = useState<Array<AccountResponse>>([]);
  const [accountData, setAccountData] = useState<Array<AccountResponse>>([]);
  const [accountDataFiltered, setAccountDataFiltered] = useState<Array<AccountResponse>>([]);

  const [listStore, setStore] = useState<Array<StoreResponse>>([]);
  const [channelList, setChannelList] = useState<Array<ChannelResponse>>([]);
  const [sourceList, setSourceList] = useState<Array<SourceResponse>>([]);

  /** get account, store, channel, source  */
  useEffect(() => {
    dispatch(
      searchAccountPublicAction({ limit: 30 }, (data: PageResponse<AccountResponse> | false) => {
        if (!data) {
          return;
        }
        setInitAccount(data.items);
        setAccountData(data.items);
      }),
    );
    dispatch(StoreGetListAction(setStore));
    dispatch(getListChannelRequest(setChannelList));
    dispatch(getListAllSourceRequest(setSourceList));
  }, [dispatch]);

  /** handle form value */
  const initialValues = useMemo(() => {
    return {
      ...params,
      states: convertItemToArray(params.states),
      entitled_methods: convertItemToArray(params.entitled_methods),
      creators: convertItemToArray(params.creators),
      store_ids: convertItemToArray(params.store_ids, "number"),
      channels: convertItemToArray(params.channels),
      source_ids: convertItemToArray(params.source_ids, "number"),
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
                  value: response.data?.product_id?.toString() + response.data?.id?.toString(),
                  variantId: response.data?.id?.toString(),
                  productId: response.data?.product_id?.toString(),
                },
              ];
            } else {
              handleFetchApiError(response, "Danh sách sản phẩm", dispatch);
            }
          })
          .catch((error) => {
            console.log("getVariantDetailById fail: ", error);
          });
      } catch {}
      setVariantList(variants);
      setInitProductVariantList(variants);
      if (variants?.length > 0) {
        setProductVariantSelected(variants[0].value);
        setVariantIdSelected(variants[0].variantId);
        setProductIdSelected(variants[0].productId);
      }
    },
    [dispatch],
  );

  const getProductDetailById = useCallback(
    async (productId: number) => {
      let products: any = [];
      try {
        products = await productDetailApi(productId)
          .then((response: any) => {
            if (isFetchApiSuccessful(response)) {
              return [
                {
                  label: response.data?.name,
                  value: response.data?.id?.toString(),
                  variantId: null,
                  productId: response.data?.id?.toString(),
                },
              ];
            } else {
              handleFetchApiError(response, "Danh sách sản phẩm", dispatch);
            }
          })
          .catch((error) => {
            console.log("getVariantDetailById fail: ", error);
          });
      } catch {}
      setProductList(products);
      setInitProductVariantList(products);
      if (products?.length > 0) {
        setProductVariantSelected(products[0].value);
        setVariantIdSelected(products[0].variantId);
        setProductIdSelected(products[0].productId);
      }
    },
    [dispatch],
  );
  // end handle get variant by filter param

  const updateAccountData = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) {
      return;
    }
    const accountList = cloneDeep(initAccount);
    data.items?.length && data.items.forEach(item => {
      if (!initAccount.some((account: any) => account.code === item.code)) {
        accountList.push(item);
      }
    })

    setAccountData(accountList);
    setAccountDataFiltered(data.items);
  }, [initAccount]);

  const getAccountByParams = useCallback((accountCodes: Array<string>) => {
    if (accountCodes?.length) {
      dispatch(
        searchAccountPublicAction({limit: 30, codes: accountCodes}, updateAccountData)
      );
    }

  },[dispatch, updateAccountData]);

  useEffect(() => {
    if (initialValues.variant_id) {
      getVariantDetailById(initialValues.variant_id).then();
    } else if (initialValues.product_id) {
      getProductDetailById(Number(initialValues.product_id)).then();
    }

    getAccountByParams(initialValues.creators);

    handleSelectedDate(
      initialValues?.starts_date_min,
      initialValues?.starts_date_max,
      setStartDateClick,
    );
    setStartDateFrom(initialValues?.starts_date_min);
    setStartDateTo(initialValues?.starts_date_max);

    handleSelectedDate(
      initialValues?.ends_date_min,
      initialValues?.ends_date_max,
      setEndDateClick,
    );
    setEndDateFrom(initialValues?.ends_date_min);
    setEndDateTo(initialValues?.ends_date_max);

    form.setFieldsValue({
      ...initialValues,
    });
  }, [form, getAccountByParams, getProductDetailById, getVariantDetailById, initialValues]);
  /** end handle form value */

  // handle search products, variants
  const onSearchVariants = async (value: string) => {
    let variants: any = [];
    try {
      setIsSearchingVariant(true);
      variants = await searchVariantsApi({
        info: value.trim(),
        page: 1,
        limit: 30,
      })
        .then((response) => {
          setIsSearchingVariant(false);
          if (isFetchApiSuccessful(response)) {
            return response.data?.items?.map((item) => {
              return {
                label: item.name,
                value: item.product_id?.toString() + item.id?.toString(),
                variantId: item.id?.toString(),
                productId: item.product_id?.toString(),
              };
            });
          } else {
            handleFetchApiError(response, "Danh sách sản phẩm", dispatch);
          }
        })
        .catch((error) => {
          setIsSearchingVariant(false);
          console.log("get Variant fail: ", error);
        });
    } catch {
      setIsSearchingVariant(false);
    }
    setVariantList(variants);
  };

  const onSearchProduct = async (value: string) => {
    let products: any = [];
    try {
      setIsSearchingProduct(true);
      products = await searchProductWrapperApi({
        info: value.trim(),
        page: 1,
        limit: 30,
      })
        .then((response) => {
          setIsSearchingProduct(false);
          if (isFetchApiSuccessful(response)) {
            return response.data?.items?.map((item) => {
              return {
                label: item.name,
                value: item.id?.toString(),
                variantId: null,
                productId: item.id?.toString(),
              };
            });
          } else {
            handleFetchApiError(response, "Danh sách sản phẩm", dispatch);
          }
        })
        .catch((error) => {
          setIsSearchingProduct(false);
          console.log("get Product fail: ", error);
        });
    } catch {
      setIsSearchingProduct(false);
    }
    setProductList(products);
  };

  const handleSearchVariants = debounce((value: string) => {
    if (value?.trim()?.length >= 3) {
      setProductVariantList([]);
      onSearchProduct(value);
      onSearchVariants(value);
    }
  }, 800);

  useEffect(() => {
    if (isSearchingProduct || isSearchingVariant) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
      const newProductVariantList = productList.concat(variantList).sort((a: any, b: any) => {
        return Number(b.productId) < Number(a.productId)
          ? -1
          : Number(b.productId) > Number(a.productId)
          ? 1
          : 0;
      });
      setProductVariantList(newProductVariantList);
    }
  }, [isSearchingProduct, isSearchingVariant, productList, variantList]);

  const onSelectProduct = (value: string, option: any) => {
    setProductVariantSelected(value);
    setVariantIdSelected(option.variantId);
    setProductIdSelected(option.productId);
  };

  const onClearVariants = () => {
    setProductVariantSelected(null);
    setVariantIdSelected(null);
    setProductIdSelected(null);
  };
  // end handle search products, variants

  /** handle apply date filter */
  const [startDateClick, setStartDateClick] = useState("");
  const [startDateFrom, setStartDateFrom] = useState<any>(params.starts_date_min);
  const [startDateTo, setStartDateTo] = useState<any>(params.starts_date_max);
  
  const [endDateClick, setEndDateClick] = useState("");
  const [endDateFrom, setEndDateFrom] = useState<any>(params.ends_date_min);
  const [endDateTo, setEndDateTo] = useState<any>(params.ends_date_max);

  const clearStartDate = () => {
    setStartDateClick("");
    setStartDateFrom(null);
    setStartDateTo(null);
  };

  const clearEndDate = () => {
    setEndDateClick("");
    setEndDateFrom(null);
    setEndDateTo(null);
  };

  const clickOptionDate = useCallback(
    (type, value) => {
      const selectedDateOption = convertSelectedDateOption(value);
      const { startDateValue, endDateValue } = selectedDateOption;

      switch (type) {
        case "starts_date":
          if (startDateClick === value) {
            clearStartDate();
          } else {
            setStartDateClick(value);
            setStartDateFrom(startDateValue);
            setStartDateTo(endDateValue);
          }
          break;
        case "ends_date":
          if (endDateClick === value) {
            clearEndDate();
          } else {
            setEndDateClick(value);
            setEndDateFrom(startDateValue);
            setEndDateTo(endDateValue);
          }
          break;
        default:
          break;
      }
    },
    [startDateClick, endDateClick],
  );

  const convertDateStringToDate = (dateString: string) => {
    const arrDate = dateString.split("-");
    const stringDate = arrDate[2] + "-" + arrDate[1] + "-" + arrDate[0];
    return new Date(stringDate);
  }

  const handleStartDateFrom = (dateString: string) => {
    setStartDateClick("");
    if (!dateString) {
      setStartDateFrom(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const startOfDate = moment(_date).utc().startOf("day");
      setStartDateFrom(startOfDate);
    }
  };

  const handleStartDateTo = (dateString: string) => {
    setStartDateClick("");
    if (!dateString) {
      setStartDateTo(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const endOfDate = moment(_date).utc().endOf("day");
      setStartDateTo(endOfDate);
    }
  };
  
  const handleEndDateFrom = (dateString: string) => {
    setEndDateClick("");
    if (!dateString) {
      setEndDateFrom(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const startOfDate = moment(_date).utc().startOf("day");
      setEndDateFrom(startOfDate);
    }
  };

  const handleEndDateTo = (dateString: string) => {
    setEndDateClick("");
    if (!dateString) {
      setEndDateTo(null);
    } else {
      const _date = convertDateStringToDate(dateString);
      const endOfDate = moment(_date).utc().endOf("day");
      setEndDateTo(endOfDate);
    }
  };
  /** end handle apply date filter */

  // useCallback
  const onFinish = useCallback(
    (values: DiscountSearchQuery) => {
      const formValues = {
        ...values,
        variant_id: variantIdSelected,
        product_id: productIdSelected,
        starts_date_min: startDateFrom,
        starts_date_max: startDateTo,
        ends_date_min: endDateFrom,
        ends_date_max: endDateTo,
      };
      onFilter && onFilter(formValues);
    },
    [
      variantIdSelected,
      productIdSelected,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      onFilter
    ],
  );

  const onFilterClick = useCallback(() => {
    setVisible(false);
    form.submit();
  }, [form]);

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onClearFilterClick = useCallback(() => {
    onFilter && onFilter(initQuery);
    setVisible(false);
  }, [initQuery, onFilter]);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

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

    if (initialValues.variant_id || initialValues.product_id) {
      let productVariant;
      if (initialValues.variant_id) {
        productVariant = initProductVariantList.find(
          (item) => item.variantId?.toString() === initialValues.variant_id?.toString(),
        );
      } else {
        productVariant = initProductVariantList.find(
          (item) => item.productId?.toString() === initialValues.product_id?.toString(),
        );
      }
      list.push({
        key: "product_variant_id",
        name: "Sản phẩm",
        value: productVariant?.label || initialValues.variant_id || initialValues.product_id,
      });
    }

    if (initialValues.states?.length) {
      let statesFiltered = "";
      initialValues.states.forEach((stateValue: string) => {
        const state = STATE_LIST.find(
          (item: any) => item.value === stateValue?.toUpperCase()
        );
        statesFiltered = state
          ? statesFiltered + state.name + "; "
          : statesFiltered + stateValue + "; ";
      });
      list.push({
        key: "states",
        name: "Trạng thái",
        value: statesFiltered,
      });
    }

    if (initialValues.entitled_methods?.length) {
      let giftMethodFiltered = "";
      initialValues.entitled_methods.forEach((giftMethodValue: string) => {
        const giftMethod = GIFT_METHOD_LIST.find(
          (item: any) => item.value?.toString() === giftMethodValue?.toString(),
        );
        giftMethodFiltered = giftMethod
          ? giftMethodFiltered + giftMethod.label + "; "
          : giftMethodFiltered + giftMethodValue + "; ";
      });
      if (giftMethodFiltered) {
        list.push({
          key: "entitled_methods",
          name: "Loại khuyến mại",
          value: giftMethodFiltered,
        });
      }
    }

    if (initialValues.creators?.length) {
      let createdByFiltered = "";
      initialValues.creators.forEach((accountCode: string) => {
        const staff = accountDataFiltered?.find(
          (item: any) => item.code?.toString() === accountCode?.toString()
        );
        createdByFiltered = staff
          ? createdByFiltered + staff.full_name + "; "
          : createdByFiltered;
      });
      if (createdByFiltered) {
        list.push({
          key: "creators",
          name: "Người tạo chương trình",
          value: createdByFiltered,
        });
      }
    }

    if (initialValues.store_ids?.length) {
      let appliedStoreFiltered = "";
      initialValues.store_ids.forEach((store_id: any) => {
        const appliedStore = listStore?.find(
          (item: any) => item.id?.toString() === store_id?.toString(),
        );
        appliedStoreFiltered = appliedStore
          ? appliedStoreFiltered + appliedStore.name + "; "
          : appliedStoreFiltered + store_id + "; ";
      });
      list.push({
        key: "store_ids",
        name: "Cửa hàng áp dụng",
        value: appliedStoreFiltered,
      });
    }

    if (initialValues.channels?.length) {
      let channelFiltered = "";
      initialValues.channels.forEach((channelCode: any) => {
        const appliedSource = channelList?.find(
          (item: any) => item.code?.toString().toUpperCase() === channelCode?.toString().toUpperCase(),
        );
        channelFiltered = appliedSource
          ? channelFiltered + appliedSource.name + "; "
          : channelFiltered + channelCode + "; ";
      });
      list.push({
        key: "channels",
        name: "Kênh bán hàng áp dụng",
        value: channelFiltered,
      });
    }

    if (initialValues.source_ids?.length) {
      let sourceFiltered = "";
      initialValues.source_ids.forEach((sourceId: any) => {
        const source = sourceList?.find(
          (item: any) => item.id?.toString() === sourceId?.toString(),
        );
        sourceFiltered = source
          ? sourceFiltered + source.name + "; "
          : sourceFiltered + sourceId + "; ";
      });
      list.push({
        key: "source_ids",
        name: "Nguồn áp dụng",
        value: sourceFiltered,
      });
    }

    if (initialValues.starts_date_min || initialValues.starts_date_max) {
      let startDateFiltered =
        (initialValues.starts_date_min
          ? formatDateFilter(initialValues.starts_date_min)?.format(DATE_FORMAT.DDMMYYY)
          : "") +
        " ~ " +
        (initialValues.starts_date_max
          ? formatDateFilter(initialValues.starts_date_max)?.format(DATE_FORMAT.DDMMYYY)
          : "");
      list.push({
        key: "starts_date",
        name: "Ngày bắt đầu áp dụng",
        value: startDateFiltered,
      });
    }

    if (initialValues.ends_date_min || initialValues.ends_date_max) {
      let endDateFiltered =
        (initialValues.ends_date_min
          ? formatDateFilter(initialValues.ends_date_min)?.format(DATE_FORMAT.DDMMYYY)
          : "") +
        " ~ " +
        (initialValues.ends_date_max
          ? formatDateFilter(initialValues.ends_date_max)?.format(DATE_FORMAT.DDMMYYY)
          : "");
      list.push({
        key: "ends_date",
        name: "Ngày kết thúc áp dụng",
        value: endDateFiltered,
      });
    }
    return list;
  }, [
    initialValues.query,
    initialValues.variant_id,
    initialValues.product_id,
    initialValues.states,
    initialValues.entitled_methods,
    initialValues.creators,
    initialValues.store_ids,
    initialValues.channels,
    initialValues.source_ids,
    initialValues.starts_date_min,
    initialValues.starts_date_max,
    initialValues.ends_date_min,
    initialValues.ends_date_max,
    initProductVariantList,
    listStore,
    channelList,
    sourceList,
    accountDataFiltered,
  ]);

  // close tag filter
  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      switch (tag.key) {
        case "query":
          onFilter && onFilter({ ...params, query: null });
          break;
        case "product_variant_id":
          onClearVariants();
          onFilter && onFilter({ ...params, variant_id: null, product_id: null });
          break;
        case "states":
          onFilter && onFilter({ ...params, states: [] });
          break;
        case "entitled_methods":
          onFilter && onFilter({ ...params, entitled_methods: [] });
          break;
        case "creators":
          onFilter && onFilter({ ...params, creators: [] });
          break;
        case "store_ids":
          onFilter && onFilter({ ...params, store_ids: [] });
          break;
        case "channels":
          onFilter && onFilter({ ...params, channels: [] });
          break;
        case "source_ids":
          onFilter && onFilter({ ...params, source_ids: [] });
          break;
        case "starts_date":
          setStartDateClick("");
          setStartDateFrom(null);
          setStartDateTo(null);
          onFilter &&
          onFilter({
            ...params,
            starts_date_min: null,
            starts_date_max: null,
          });
          break;
        case "ends_date":
          setEndDateClick("");
          setEndDateFrom(null);
          setEndDateTo(null);
          onFilter &&
          onFilter({
            ...params,
            ends_date_min: null,
            ends_date_max: null,
          });
          break;
        default:
          break;
      }
    },
    [onFilter, params],
  );
  // end handle tag filter
  

  return (
    <GiftListFilterStyled>
      <div className={"gift-list-filter"}>
        <Form onFinish={onFinish} initialValues={params} layout="inline" form={form}>
          <Item name="query" className="search">
            <Input
              prefix={<img src={search} alt="" />}
              placeholder="Tìm kiếm theo mã, tên chương trình"
              allowClear
              onBlur={(e) => {
                form.setFieldsValue({ query: e.target.value?.trim() || "" });
              }}
              style={{ minWidth: "150px" }}
            />
          </Item>

          <Form.Item className="search-variant">
            <Select
              autoClearSearchValue={false}
              loading={isLoading}
              showSearch
              showArrow
              onSearch={handleSearchVariants}
              dropdownMatchSelectWidth={500}
              allowClear
              onClear={onClearVariants}
              optionFilterProp="children"
              placeholder={"Tìm kiếm theo tên, mã, barcode sản phẩm"}
              notFoundContent={isLoading ? <Spin size="small" /> : "Không tìm thấy sản phẩm"}
              getPopupContainer={(trigger) => trigger.parentNode}
              filterOption={false}
              options={productVariantList}
              onSelect={onSelectProduct}
              value={productVariantSelected}
            />
          </Form.Item>

          <Item name="states" className="select-state">
            <Select
              showArrow
              allowClear
              mode="multiple"
              maxTagCount="responsive"
              optionFilterProp="children"
              placeholder="Chọn trạng thái"
            >
              {STATE_LIST?.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.name}
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
      </div>

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
        width={1000}
      >
        <Form onFinish={onFinish} form={form} initialValues={params} layout="vertical">
          <Row gutter={24}>
            {Object.keys(GiftFilterFieldMapping).map((key) => {
              let component: any = null;
              switch (key) {
                case GiftFilterField.entitled_methods:
                  component = (
                    <Select
                      showArrow
                      allowClear
                      optionFilterProp="children"
                      mode="multiple"
                      maxTagCount={"responsive"}
                      placeholder="Chọn 1 hoặc nhiều loại"
                      getPopupContainer={(trigger: any) => trigger.parentElement}
                      notFoundContent="Không tìm thấy loại khuyến mại phù hợp"
                    >
                      {GIFT_METHOD_LIST?.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                    </Select>
                  );
                  break;
                case GiftFilterField.creators:
                  component = (
                    <AccountCustomSearchSelect
                      placeholder="Tìm kiếm theo tên, mã nhân viên"
                      dataToSelect={accountData}
                      setDataToSelect={setAccountData}
                      initDataToSelect={initAccount}
                      mode="multiple"
                      maxTagCount="responsive"
                      getPopupContainer={(trigger: any) => trigger.parentNode}
                    />
                  );
                  break;
                case GiftFilterField.store_ids:
                  component = (
                    <TreeStore
                      placeholder="Chọn 1 hoặc nhiều cửa hàng"
                      storeByDepartmentList={listStore as unknown as StoreByDepartment[]}
                      getPopupContainer={(trigger: any) => trigger.parentElement}
                    />
                  );
                  break;
                case GiftFilterField.channels:
                  component = (
                    <Select
                      autoClearSearchValue={false}
                      mode="multiple"
                      maxTagCount="responsive"
                      showSearch
                      showArrow
                      allowClear
                      placeholder="Chọn kênh"
                      optionFilterProp="children"
                      getPopupContainer={(trigger: any) => trigger.parentElement}
                    >
                      {channelList?.map((item) => (
                        <Option key={item.code} value={item.code}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  );
                  break;
                case GiftFilterField.source_ids:
                  component = (
                    <TreeSource
                      placeholder="Chọn nguồn"
                      name="source_ids"
                      listSource={sourceList}
                    />
                  );
                  break;
                case GiftFilterField.starts_date:
                  component = (
                    <SelectRangeDateCustom
                      fieldNameFrom="starts_date_min"
                      fieldNameTo="starts_date_max"
                      dateType="starts_date"
                      clickOptionDate={clickOptionDate}
                      dateSelected={startDateClick}
                      startDate={startDateFrom}
                      endDate={startDateTo}
                      handleSelectDateStart={handleStartDateFrom}
                      handleSelectDateEnd={handleStartDateTo}
                    />
                  );
                  break;
                case GiftFilterField.ends_date:
                  component = (
                    <SelectRangeDateCustom
                      fieldNameFrom="ends_date_min"
                      fieldNameTo="ends_date_max"
                      dateType="ends_date"
                      clickOptionDate={clickOptionDate}
                      dateSelected={endDateClick}
                      startDate={endDateFrom}
                      endDate={endDateTo}
                      handleSelectDateStart={handleEndDateFrom}
                      handleSelectDateEnd={handleEndDateTo}
                    />
                  );
                  break;
              }
              return (
                <Col span={12} key={key}>
                  <div style={{ marginBottom: 5 }}>
                    <b>{GiftFilterFieldMapping[key]}</b>
                  </div>
                  <Item name={key}>{component}</Item>
                </Col>
              );
            })}
          </Row>
        </Form>
      </BaseFilter>
    </GiftListFilterStyled>
  );
};

export default GiftListFilter;
