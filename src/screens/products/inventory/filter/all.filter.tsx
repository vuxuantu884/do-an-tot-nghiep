import { CloseOutlined, FilterOutlined, InfoCircleOutlined, StarOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, InputNumber, Row, Tag } from "antd";
import search from "assets/img/search.svg";
import BaseResponse from "base/base.response";
import { FilterWrapper } from "component/container/filter.container";
import TextShowMore from "component/container/show-more/text-show-more";
import AccountSearchPaging from "component/custom/select-search/account-select-paging";
import CustomSelect from "component/custom/select.custom";
import BaseFilter from "component/filter/base.filter";
import CustomModal from "component/modal/CustomModal";
import ModalDeleteConfirm from "component/modal/ModalDeleteConfirm";
import { MenuAction } from "component/table/ActionButton";
import ButtonSetting from "component/table/ButtonSetting";
import { searchAccountPublicAction } from "domain/actions/account/account.action";
import { CountryGetAllAction } from "domain/actions/content/content.action";
import {
  createConfigInventoryAction,
  deleteConfigInventoryAction,
  getConfigInventoryAction,
  updateConfigInventoryAction,
} from "domain/actions/inventory/inventory.action";
import { getCategoryRequestAction } from "domain/actions/product/category.action";
import { AccountResponse } from "model/account/account.model";
import { PageResponse } from "model/base/base-metadata.response";
import { CountryResponse } from "model/content/country.model";
import { StoreResponse } from "model/core/store.model";
import { InventoryQuery } from "model/inventory";
import {
  AllInventoryMappingField,
  AvdAllFilter,
  AvdInventoryFilter,
  InventoryExportField,
  InventoryQueryField,
  InventoryRemainFields,
  InventoryRemainFieldsMapping,
  InventorySortTypeMapping,
} from "model/inventory/field";
import { modalActionType } from "model/modal/modal.model";
import { FilterConfig, FilterConfigRequest } from "model/other";
import { CategoryResponse, CategoryView } from "model/product/category.model";
import { RootReducerType } from "model/reducers/RootReducerType";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { convertCategory, formatCurrencyForProduct } from "screens/products/helper";
import { FILTER_CONFIG_TYPE } from "utils/Constants";
import { primaryColor } from "utils/global-styles/variables";
import { showSuccess } from "utils/ToastUtils";
import FormSaveFilter from "./components/FormSaveFilter";
import TreeStore from "component/CustomTreeSelect";
import { generateQuery } from "utils/AppUtils";
import { useHistory } from "react-router-dom";
import { InventoryTabUrl } from "config/url.config";
import CollectionSearchPaging from "component/custom/select-search/collection-select-paging";
import HashTag from "component/custom/hashtag";
import { CollectionResponse } from "model/product/collection.model";
import { getCollectionRequestAction } from "domain/actions/product/collection.action";
import ProductSearchPaging from "component/custom/select-search/product-select-paging";
import { ProductResponse, VariantSku3Response } from "model/product/product.model";
import { searchProductWrapperRequestAction } from "domain/actions/product/products.action";
import VariantSku3SearchPaging from "component/custom/select-search/variant-select-paging";
import { searchVariantSku3Api } from "service/product/product.service";
import { callApiNative } from "utils/ApiUtils";
import { SizeResponse } from "model/product/size.model";
import { sizeSearchAction } from "domain/actions/product/size.action";
import SizeSearchSelect from "component/custom/select-search/size-search";
import { cloneDeep } from "lodash";

export interface InventoryFilterProps {
  params: any;
  listStore: Array<StoreResponse>;
  actions: Array<MenuAction>;
  onMenuClick?: (index: number) => void;
  onFilter?: (values: InventoryQuery) => void;
  onClearFilter?: () => void;
  openColumn: () => void;
  onChangeKeySearch: (value: string, filters: any) => void;
}

const ArrRemain = [
  {
    key: InventoryRemainFields.total_stock,
    value: InventoryRemainFieldsMapping[InventoryRemainFields.total_stock],
  },
  {
    key: InventoryRemainFields.available,
    value: InventoryRemainFieldsMapping[InventoryRemainFields.available],
  },
  {
    key: InventoryRemainFields.on_hand,
    value: InventoryRemainFieldsMapping[InventoryRemainFields.on_hand],
  },
];

const { Item } = Form;

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

const AllInventoryFilter: React.FC<InventoryFilterProps> = (props: InventoryFilterProps) => {
  const { params, listStore, onFilter, openColumn } = props;
  const [advanceFilters, setAdvanceFilters] = useState<any>({});
  const userReducer = useSelector((state: RootReducerType) => state.userReducer);
  const { account } = userReducer;
  const [lstConfigFilter, setLstConfigFilter] = useState<Array<FilterConfig>>();
  const [formBaseFilter] = Form.useForm();
  const [formAdvanceFilter] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [showModalSaveFilter, setShowModalSaveFilter] = useState(false);
  const dispatch = useDispatch();
  const [listCategory, setListCategory] = useState<Array<CategoryView>>([]);
  const [modalAction, setModalAction] = useState<modalActionType>("create");
  const [tagAcitve, setTagActive] = useState<number | null>();
  const [configId, setConfigId] = useState<number>();
  const [lstCollection, setLstCollection] = useState<Array<CollectionResponse>>([]);
  const setDataCategory = useCallback((arr: Array<CategoryResponse>) => {
    let temp: Array<CategoryView> = convertCategory(arr);
    setListCategory(temp);
  }, []);
  const [messageErrorQuality, setMessageErrorQuality] = useState("");

  const [listCountry, setListCountry] = useState<Array<CountryResponse>>([]);
  const [accounts, setAccounts] = useState<PageResponse<AccountResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [sizes, setSizes] = useState<PageResponse<SizeResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [products, setProducts] = useState<PageResponse<ProductResponse>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const [variants, setVariants] = useState<PageResponse<VariantSku3Response>>({
    items: [],
    metadata: { limit: 20, page: 1, total: 0 },
  });
  const history = useHistory();
  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);

  const setDataCollection = useCallback((data: PageResponse<CollectionResponse>) => {
    setLstCollection(data.items);
  }, []);

  const setDataAccounts = useCallback((data: PageResponse<AccountResponse> | false) => {
    if (!data) return;
    setAccounts((accounts) => {
      return {
        ...accounts,
        items: [...accounts.items, ...data.items],
        metadata: data.metadata,
      };
    });
  }, []);

  const setDataSizes = useCallback((data: PageResponse<SizeResponse>) => {
    if (!data) {
      return false;
    }
    setSizes((sizes) => {
      return {
        ...sizes,
        items: [...sizes.items, ...data.items],
        metadata: data.metadata,
      };
    });
  }, []);

  const setDataProducts = useCallback((data: PageResponse<ProductResponse> | false) => {
    if (!data) {
      return false;
    }
    setProducts((products) => {
      return {
        ...products,
        items: [...products.items, ...data.items],
        metadata: data.metadata,
      };
    });
  }, []);

  const setDataVariants = useCallback((data: PageResponse<VariantSku3Response> | false) => {
    if (!data) {
      return false;
    }
    setVariants((variants) => {
      return {
        ...variants,
        items: [...variants.items, ...data.items],
        metadata: data.metadata,
      };
    });
  }, []);

  const getAccounts = useCallback(
    (code: string, page: number) => {
      dispatch(searchAccountPublicAction({ codes: code, page: page }, setDataAccounts));
    },
    [dispatch, setDataAccounts],
  );

  const getCollections = useCallback(
    (code: string, page: number) => {
      dispatch(getCollectionRequestAction({ codes: code, page: page }, setDataCollection));
    },
    [dispatch, setDataCollection],
  );

  const getSizes = useCallback(
    (ids: string, page: number) => {
      dispatch(
        sizeSearchAction({ ids: ids, page: page }, (res) => {
          setDataSizes(res);
        }),
      );
    },
    [dispatch, setDataSizes],
  );

  const getProducts = useCallback(
    (codes: string, page: number) => {
      dispatch(
        searchProductWrapperRequestAction({ codes: codes, page: page }, (res) => {
          setDataProducts(res);
        }),
      );
    },
    [dispatch, setDataProducts],
  );

  const getVariantSku3 = useCallback(
    async (codes: string, page: number) => {
      await callApiNative({ isShowLoading: false }, dispatch, searchVariantSku3Api, {
        codes: codes,
        page: page,
      }).then((res) => {
        setDataVariants(res);
      });
    },
    [dispatch, setDataVariants],
  );

  useEffect(() => {
    const {
      designer_codes,
      merchandiser_codes,
      store_ids,
      collections,
      sizes,
      products,
      variants,
    } = params;

    const filter = {
      ...params,
      sizes: sizes
        ? Array.isArray(sizes)
          ? sizes.map((i: string) => Number(i))
          : [Number(sizes)]
        : [],
      store_ids: store_ids
        ? Array.isArray(store_ids)
          ? store_ids.map((i: string) => Number(i))
          : [Number(store_ids)]
        : [],
    };

    let codes = null;

    if (designer_codes && designer_codes !== "") {
      codes = designer_codes;
    }

    if (merchandiser_codes && merchandiser_codes !== "") {
      codes =
        designer_codes && designer_codes !== ""
          ? codes + "," + merchandiser_codes
          : merchandiser_codes;
    }

    if (codes) {
      getAccounts(codes, 1);
    }

    if (sizes && sizes !== "") getSizes(sizes, 1);
    if (products && products !== "") getProducts(products, 1);
    if (variants && variants !== "") getVariantSku3(variants, 1);

    if (collections) {
      getCollections(collections, 1);
    }

    formAdvanceFilter.setFieldsValue(filter);
    formBaseFilter.setFieldsValue(filter);
    setAdvanceFilters(filter);

    if (!designer_codes || designer_codes.length === 0)
      formAdvanceFilter.resetFields(["designer_codes"]);
    if (!merchandiser_codes || merchandiser_codes.length === 0)
      formAdvanceFilter.resetFields(["merchandiser_codes"]);
    if (!collections || collections.length === 0) formAdvanceFilter.resetFields(["collections"]);
    if (!sizes || sizes.length === 0) formAdvanceFilter.resetFields(["sizes"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const FilterList = useCallback(
    ({
      filters,
      resetField,
      listCategory,
      listCountry,
      listStore,
      accounts,
      sizes,
      lstCollection,
    }: any) => {
      let filtersKeys = Object.keys(filters);
      let renderTxt: string;

      return (
        <div style={{ wordBreak: "break-word" }}>
          {filtersKeys.map((filterKey) => {
            let value = filters[filterKey];

            if (!value && value !== 0) return null;
            if (value && Array.isArray(value) && value.length === 0) return null;
            if (!AllInventoryMappingField[filterKey]) return null;

            let newValues = Array.isArray(value) ? value : [value];

            switch (filterKey) {
              case AvdAllFilter.category:
              case AvdAllFilter.category_ids:
                let categoryTag = "";
                newValues.forEach((item: number) => {
                  const category = listCategory?.find((e: any) => e.id === Number(item));

                  categoryTag = category ? categoryTag + category.name + "; " : categoryTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${categoryTag}`;
                break;
              case AvdAllFilter.made_in_ids:
                let madeinTag = "";
                newValues.forEach((item: number) => {
                  const madein = listCountry?.find((e: any) => e.id === Number(item));

                  madeinTag = madein ? madeinTag + madein.name + "; " : madeinTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${madeinTag}`;
                break;
              case AvdAllFilter.collections:
                let collectionTag = "";
                newValues.forEach((item: string) => {
                  const colection = lstCollection?.find((e: any) => e.code === item);

                  collectionTag = colection ? collectionTag + colection.name + "; " : collectionTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${collectionTag}`;
                break;
              case AvdAllFilter.designer_codes:
                let designerTag = "";
                newValues.forEach((item: string) => {
                  const designer = accounts.items?.find((e: any) => e.code === item);

                  designerTag = designer ? designerTag + designer.full_name + "; " : designerTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${designerTag}`;
                break;
              case AvdAllFilter.merchandiser_codes:
                let merchandiserTag = "";
                newValues.forEach((item: string) => {
                  const win = accounts.items?.find((e: any) => e.code === item);

                  merchandiserTag = win ? merchandiserTag + win.full_name + "; " : merchandiserTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${merchandiserTag}`;
                break;
              case AvdAllFilter.store_ids:
                let storeTag = "";
                newValues.forEach((item: number) => {
                  const store = listStore?.find((e: any) => e.id === Number(item));

                  storeTag = store ? storeTag + store.name + "; " : storeTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${storeTag}`;
                break;
              case AvdAllFilter.sizes:
                let sizesTag = "";
                newValues.forEach((item: number) => {
                  const size = sizes.items?.find((e: any) => e.id === Number(item));

                  sizesTag = size ? sizesTag + size.code + "; " : sizesTag;
                });
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${sizesTag}`;
                break;
              case AvdAllFilter.variant_sku7:
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${newValues.toString()}`;
                break;
              case AvdAllFilter.variant_sku3:
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${newValues.toString()}`;
                break;
              case AvdAllFilter.tags:
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${newValues.toString()}`;
                break;
              case AvdAllFilter.from_price:
                renderTxt = `Giá bán từ: ${formatCurrencyForProduct(filters.from_price)}`;
                break;
              case AvdAllFilter.to_price:
                renderTxt = `Giá bán đến: ${formatCurrencyForProduct(filters.to_price)}`;
                break;
              case AvdAllFilter.info:
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${newValues.toString()}`;
                break;
              case AvdAllFilter.remain:
                renderTxt = `${AllInventoryMappingField[filterKey]} : ${
                  InventoryRemainFieldsMapping[newValues.toString()]
                }`;
                break;
              case AvdAllFilter.sort_column:
                renderTxt = `${InventoryExportField[filters.sort_column]} : ${
                  InventorySortTypeMapping[filters.sort_type]
                }`;
                break;
              default:
                break;
            }

            return (
              <Tag
                onClose={() => resetField(filterKey)}
                key={filterKey}
                className="fade"
                closable
                style={{ marginBottom: 20, whiteSpace: "unset" }}
              >
                <TextShowMore>{`${renderTxt}`}</TextShowMore>
              </Tag>
            );
          })}
        </div>
      );
    },
    [],
  );

  const openFilter = useCallback(() => {
    setVisible(true);
  }, []);

  const onCancelFilter = useCallback(() => {
    setVisible(false);
  }, []);

  const onShowSaveFilter = useCallback(() => {
    setModalAction("create");
    setShowModalSaveFilter(true);
  }, []);

  const getConfigInventory = useCallback(() => {
    if (account && account.code) {
      dispatch(
        getConfigInventoryAction(account.code, (res) => {
          if (res) {
            if (res.data && res.data.length > 0) {
              const configFilters = res.data.filter(
                (e) => e.type === FILTER_CONFIG_TYPE.FILTER_INVENTORY,
              );
              setLstConfigFilter(configFilters);
            } else {
              setLstConfigFilter([]);
            }
          }
        }),
      );
    }
  }, [account, dispatch]);

  const onResult = useCallback(
    (res: BaseResponse<FilterConfig>) => {
      if (res) {
        showSuccess(`Lưu bộ lọc thành công`);
        setShowModalSaveFilter(false);
        getConfigInventory();
      }
    },
    [getConfigInventory],
  );

  const onSaveFilter = useCallback(
    (request: FilterConfigRequest) => {
      if (request) {
        let json_content = JSON.stringify(formAdvanceFilter.getFieldsValue(), function (k, v) {
          return v === undefined ? null : v;
        });
        request.type = FILTER_CONFIG_TYPE.FILTER_INVENTORY;
        request.json_content = json_content;

        if (request.id) {
          const config = lstConfigFilter?.find((e) => e.id.toString() === request.id.toString());
          if (lstConfigFilter && config) {
            request.name = config.name;
          }
          dispatch(updateConfigInventoryAction(request, onResult));
        } else {
          dispatch(createConfigInventoryAction(request, onResult));
        }
      }
    },
    [dispatch, formAdvanceFilter, onResult, lstConfigFilter],
  );

  const onBaseFinish = useCallback(() => {
    let data = formBaseFilter.getFieldsValue(true);
    onFilter && onFilter(data);
  }, [formBaseFilter, onFilter]);

  const onAdvanceFinish = useCallback(() => {
    let data = formAdvanceFilter.getFieldsValue(true);

    onFilter && onFilter(data);
  }, [formAdvanceFilter, onFilter]);

  const onFilterClick = useCallback(() => {
    if (messageErrorQuality !== "") return;
    setVisible(false);
    formAdvanceFilter.submit();
  }, [formAdvanceFilter, messageErrorQuality]);

  const resetField = useCallback(
    (field: string) => {
      let newFieldsValue = {
        ...formBaseFilter.getFieldsValue(true),
        [field]: undefined,
      };
      if (field === AvdAllFilter.from_price) {
        newFieldsValue = {
          ...formBaseFilter.getFieldsValue(true),
          [field]: undefined,
          [AvdAllFilter.to_price]: undefined,
        };
      }
      if (field === AvdAllFilter.sort_column) {
        newFieldsValue = {
          ...formBaseFilter.getFieldsValue(true),
          [field]: undefined,
          [AvdAllFilter.sort_type]: undefined,
        };
      }
      formBaseFilter.setFieldsValue({
        ...newFieldsValue,
      });
      formAdvanceFilter.setFieldsValue({
        ...newFieldsValue,
      });
      formBaseFilter.submit();
    },
    [formBaseFilter, formAdvanceFilter],
  );

  const onSelectFilterConfig = useCallback(
    (index: number, id: number) => {
      setTagActive(index);
      const filterConfig = lstConfigFilter?.find((e) => e.id === id);
      if (filterConfig) {
        let json_content = JSON.parse(filterConfig.json_content);

        Object.keys(json_content).forEach(function (key) {
          if (json_content[key] == null) json_content[key] = undefined;
        }, json_content);
        formAdvanceFilter.setFieldsValue(json_content);
      }
    },
    [lstConfigFilter, formAdvanceFilter],
  );

  const onCloseFilterConfig = useCallback(() => {
    setTagActive(null);
  }, []);

  const onResultDeleteConfig = useCallback(
    (res: BaseResponse<FilterConfig>) => {
      if (res) {
        showSuccess(`Xóa bộ lọc thành công`);
        setIsShowConfirmDelete(false);
        getConfigInventory();
      }
    },
    [getConfigInventory],
  );

  const onMenuDeleteConfigFilter = useCallback(() => {
    if (configId) {
      dispatch(deleteConfigInventoryAction(configId, onResultDeleteConfig));
    }
  }, [dispatch, configId, onResultDeleteConfig]);

  const FilterConfigCom = (props: any) => {
    return (
      <span style={{ marginRight: 20, display: "inline-flex" }}>
        <Tag
          onClick={() => {
            onSelectFilterConfig(props.index, props.id);
          }}
          style={{
            cursor: "pointer",
            backgroundColor: tagAcitve === props.index ? primaryColor : "",
            color: tagAcitve === props.index ? "white" : "",
          }}
          key={props.index}
          icon={<StarOutlined />}
          closeIcon={
            <CloseOutlined
              className={
                tagAcitve === props.index ? "ant-tag-close-icon" : "ant-tag-close-icon-black"
              }
            />
          }
          closable={true}
          onClose={(e) => {
            e.preventDefault();
            setConfigId(props.id);
            setIsShowConfirmDelete(true);
          }}
        >
          {props.name}
        </Tag>
      </span>
    );
  };

  const onResetFilter = useCallback(() => {
    let fields = formAdvanceFilter.getFieldsValue(true);
    for (let key in fields) {
      if (fields[key] instanceof Array) {
        fields[key] = [];
      } else {
        fields[key] = undefined;
      }
    }
    formAdvanceFilter.setFieldsValue(fields);
    formAdvanceFilter.resetFields(["merchandiser_codes, designer_codes"]);
    formAdvanceFilter.submit();
    setVisible(false);
    onCloseFilterConfig();
  }, [formAdvanceFilter, onCloseFilterConfig]);

  // const onChangeStore = useCallback(
  //   (e: Array<number>) => {
  //     if (e) {
  //       let newParams = {
  //         ...params,
  //         store_ids: e.length === 0 ? undefined : e.toString(),
  //       };
  //       let queryParam = generateQuery({ ...newParams });

  //       history.push(`${InventoryTabUrl.ALL}?${queryParam}`);
  //     }
  //   },
  //   [history, params],
  // );

  const onChangeRemain = useCallback(
    (e: string) => {
      if (e) {
        let newParams = { ...params, remain: e };
        let queryParam = generateQuery({ ...newParams });

        history.push(`${InventoryTabUrl.ALL}?${queryParam}`);
      }
    },
    [history, params],
  );

  useEffect(() => {
    setAdvanceFilters({ ...params });
    dispatch(getCategoryRequestAction({}, setDataCategory));
    if (params.collections) {
      dispatch(getCollectionRequestAction({}, setDataCollection));
    }
    dispatch(CountryGetAllAction(setListCountry));
    getConfigInventory();
  }, [params, dispatch, getConfigInventory, setDataCategory, setDataCollection]);

  const validateFromQuality = (e: any) => {
    formAdvanceFilter.setFieldsValue({
      from_price: e,
    });
    const toPrice = formAdvanceFilter.getFieldValue("to_price");
    if (e > toPrice) {
      setMessageErrorQuality("Giá bán từ lớn hơn số Giá bán đến.");
      return;
    }

    setMessageErrorQuality("");
  };

  const validateToQuality = (e: any) => {
    formAdvanceFilter.setFieldsValue({
      to_price: e,
    });
    const fromPrice = formAdvanceFilter.getFieldValue("from_price");
    if (e < fromPrice) {
      setMessageErrorQuality("Giá bán từ lớn hơn giá bán đến.");
      return;
    }

    setMessageErrorQuality("");
  };

  return (
    <div className="inventory-filter">
      <Form
        onFinish={onBaseFinish}
        initialValues={advanceFilters}
        form={formBaseFilter}
        name={"baseInventory"}
        layout="inline"
      >
        <FilterWrapper>
          <Item name="info" className="search">
            <Input
              prefix={<img src={search} alt="" />}
              style={{ width: "100%" }}
              placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
              maxLength={255}
              allowClear
              autoFocus
              autoComplete="off"
            />
          </Item>
          <Item name="remain" style={{ minWidth: 250 }}>
            <CustomSelect
              autoClearSearchValue={false}
              showSearch
              allowClear
              showArrow
              placeholder="Chọn trạng thái tồn"
              style={{ width: "100%" }}
              optionFilterProp="children"
              getPopupContainer={(trigger) => trigger.parentNode}
              onChange={onChangeRemain}
              maxTagCount="responsive"
            >
              {ArrRemain?.map((item) => (
                <CustomSelect.Option key={item.key} value={item.key}>
                  {item.value}
                </CustomSelect.Option>
              ))}
            </CustomSelect>
          </Item>
          <Item name={InventoryQueryField.store_ids} className="store" style={{ minWidth: 300 }}>
            <TreeStore
              placeholder="Chọn cửa hàng"
              autoClearSearchValue={false}
              storeByDepartmentList={listStore}
              // onChange={onChangeStore}
            />
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
          <Item>
            <ButtonSetting onClick={openColumn} />
          </Item>
        </FilterWrapper>
      </Form>
      <FilterList
        accounts={accounts}
        filters={advanceFilters}
        resetField={resetField}
        listCategory={listCategory}
        listCountry={listCountry}
        listStore={listStore}
        sizes={sizes}
        variants={variants}
        products={products}
        lstCollection={lstCollection}
      />
      <BaseFilter
        onClearFilter={onResetFilter}
        onFilter={onFilterClick}
        onCancel={onCancelFilter}
        visible={visible}
        width={700}
        className="order-filter-drawer"
        allowSave={true}
        onSaveFilter={onShowSaveFilter}
      >
        <Form
          name={`avdHistoryInventory`}
          onFinish={onAdvanceFinish}
          layout="vertical"
          form={formAdvanceFilter}
        >
          {/* filters tag */}
          {lstConfigFilter && lstConfigFilter.length > 0 && (
            <Row>
              <Item>
                <Col span={24} className="tag-filter">
                  {lstConfigFilter?.map((e, index) => {
                    return <FilterConfigCom key={index} id={e.id} index={index} name={e.name} />;
                  })}
                </Col>
              </Item>
            </Row>
          )}
          <Row gutter={25}>
            <Col span={24}>
              <Item name={AvdInventoryFilter.info} className="search">
                <Input
                  allowClear
                  prefix={<img src={search} alt="" />}
                  style={{ width: "100%" }}
                  placeholder="Tìm kiếm sản phẩm theo Tên, Mã vạch, SKU"
                />
              </Item>
            </Col>
          </Row>
          <Row gutter={25}>
            <Col span={12}>
              <Item name={AvdInventoryFilter.store_ids} className="store" label="Cửa hàng">
                <TreeStore
                  autoClearSearchValue={false}
                  placeholder="Chọn cửa hàng"
                  storeByDepartmentList={listStore}
                  // onChange={onChangeStore}
                />
              </Item>
            </Col>
            <Col span={12}>
              <Item name={AvdInventoryFilter.made_in_ids} label="Xuất xứ">
                <CustomSelect
                  autoClearSearchValue={false}
                  showSearch
                  optionFilterProp="children"
                  showArrow
                  placeholder="Chọn xuất xứ"
                  mode="multiple"
                  allowClear
                  tagRender={tagRender}
                  notFoundContent="Không tìm thấy kết quả"
                  maxTagCount="responsive"
                >
                  {listCountry?.map((item) => (
                    <CustomSelect.Option key={item.id} value={String(item.id)}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Item>
            </Col>
          </Row>
          <Row gutter={25}>
            <Col span={12}>
              <Item name={AvdInventoryFilter.designer_codes} label="Nhà thiết kế">
                <AccountSearchPaging mode="multiple" placeholder="Chọn nhà thiết kế" />
              </Item>
            </Col>
            <Col span={12}>
              <Item name={AvdInventoryFilter.merchandiser_codes} label="Merchandiser">
                <AccountSearchPaging mode="multiple" placeholder="Chọn Merchandiser" />
              </Item>
            </Col>
          </Row>
          <Row gutter={25}>
            <Col span={12}>
              <Item name="remain" style={{ minWidth: 250 }} label="Trạng thái tồn">
                <CustomSelect
                  autoClearSearchValue={false}
                  showSearch
                  allowClear
                  showArrow
                  placeholder="Chọn trạng thái tồn"
                  style={{ width: "100%" }}
                  optionFilterProp="children"
                  getPopupContainer={(trigger) => trigger.parentNode}
                  maxTagCount="responsive"
                >
                  {ArrRemain?.map((item) => (
                    <CustomSelect.Option key={item.key} value={item.key}>
                      {item.value}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Item>
            </Col>
            <Col span={12}>
              <Item name={AvdInventoryFilter.category_ids} label="Danh mục">
                <CustomSelect
                  autoClearSearchValue={false}
                  showSearch
                  optionFilterProp="children"
                  showArrow
                  placeholder="Chọn danh mục"
                  mode="multiple"
                  allowClear
                  tagRender={tagRender}
                  notFoundContent="Không tìm thấy kết quả"
                  maxTagCount="responsive"
                >
                  {listCategory?.map((item) => (
                    <CustomSelect.Option key={item.id} value={String(item.id)}>
                      {item.name}
                    </CustomSelect.Option>
                  ))}
                </CustomSelect>
              </Item>
            </Col>
          </Row>
          <Row gutter={25}>
            <Col span={12}>
              <Item name={AvdInventoryFilter.collections} label="Nhóm hàng">
                <CollectionSearchPaging mode="multiple" placeholder="Chọn chọn nhóm hàng" />
              </Item>
            </Col>
            <Col span={12}>
              <Item name={AvdInventoryFilter.sizes} label="Kích thước">
                <SizeSearchSelect mode="multiple" />
              </Item>
            </Col>
          </Row>
          <Row gutter={25}>
            <Col span={12}>
              <Item name={AvdInventoryFilter.variant_sku3} label="Mã 3">
                <VariantSku3SearchPaging mode="multiple" />
              </Item>
            </Col>
            <Col span={12}>
              <Item name={AvdInventoryFilter.variant_sku7} label="Mã 7">
                <ProductSearchPaging mode="multiple" />
              </Item>
            </Col>
          </Row>
          <Row gutter={25}>
            <Col span={12}>
              <Item label="Giá bán">
                <Input.Group compact style={{ height: 38, display: "flex", alignItems: "center" }}>
                  <Item hidden={true} name="variant_prices" />
                  <Item
                    name="from_price"
                    style={{
                      width: "45%",
                      textAlign: "center",
                      marginBottom: 0,
                    }}
                  >
                    <InputNumber
                      onChange={validateFromQuality}
                      style={{ width: "94%" }}
                      className="price_min"
                      placeholder="Từ"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      min="0"
                      max="100000000"
                    />
                  </Item>
                  <div className="site-input-split">~</div>
                  <Item
                    name="to_price"
                    style={{
                      width: "45%",
                      textAlign: "center",
                      marginBottom: 0,
                    }}
                  >
                    <InputNumber
                      onChange={validateToQuality}
                      style={{ width: "94%" }}
                      className="site-input-right price_max"
                      placeholder="Đến"
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      min="0"
                      max="1000000000"
                    />
                  </Item>
                </Input.Group>
                <div style={{ color: "#e24343" }}>{messageErrorQuality}</div>
              </Item>
            </Col>
            <Col span={12}>
              <Item
                tooltip={{
                  title: "Tìm kiếm sản phẩm theo tags",
                  icon: <InfoCircleOutlined />,
                }}
                name="tags"
                label="Từ khóa"
              >
                <HashTag />
              </Item>
            </Col>
          </Row>
        </Form>
      </BaseFilter>
      <CustomModal
        createText="Lưu lại"
        updateText="Lưu lại"
        visible={showModalSaveFilter}
        onCreate={(formValues) => {
          onSaveFilter(formValues);
        }}
        onEdit={() => {}}
        onDelete={() => {}}
        onCancel={() => setShowModalSaveFilter(false)}
        modalAction={modalAction}
        lstConfigFilter={lstConfigFilter}
        componentForm={FormSaveFilter}
        formItem={null}
        modalTypeText="bộ lọc"
      />
      <ModalDeleteConfirm
        visible={isShowConfirmDelete}
        onOk={onMenuDeleteConfigFilter}
        onCancel={() => setIsShowConfirmDelete(false)}
        title="Xác nhận"
        subTitle={"Bạn có chắc muốn xóa bộ lọc này?"}
      />
    </div>
  );
};
export default AllInventoryFilter;
