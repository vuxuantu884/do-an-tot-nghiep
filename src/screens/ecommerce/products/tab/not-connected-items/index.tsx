import React, { useState, useMemo, createRef, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { RefSelectProps } from "antd/lib/select";
import {
  Button,
  Form,
  Select,
  Input,
  Modal,
  Tooltip,
  AutoComplete,
  Card,
  Dropdown,
  Menu,
  Radio,
  Space,
  Progress,
  TreeSelect,
  Tag,
  Spin,
} from "antd";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";

import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import CustomTable from "component/table/CustomTable";
import { showError, showSuccess } from "utils/ToastUtils";
import { findAvatar, findPrice, formatCurrency, generateQuery } from "utils/AppUtils";
import {fullTextSearch} from "utils/StringUtils";

import { ProductEcommerceQuery, RequestExportExcelQuery } from "model/query/ecommerce.query";
import { PageResponse } from "model/base/base-metadata.response";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";

import {
  getShopEcommerceList,
  deleteEcommerceItem,
  putConnectEcommerceItem,
  getProductEcommerceList,
  exitEcommerceJobsAction,
  // postSyncStockEcommerceProduct,
} from "domain/actions/ecommerce/ecommerce.actions";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";

import ConfirmConnectProductModal from "screens/ecommerce/products/tab/not-connected-items/ConfirmConnectProductModal";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import ResultConnectProductModal from "screens/ecommerce/products/tab/not-connected-items/ResultConnectProductModal";

import circleDeleteIcon from "assets/icon/circle-delete.svg";
import saveIcon from "assets/icon/save.svg";
import imgDefault from "assets/icon/img-default.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

import {
  StyledComponent,
  StyledProductListDropdown,
  StyledYodyProductColumn,
} from "screens/ecommerce/products/tab/not-connected-items/styles";
import { StyledProductFilter } from "screens/ecommerce/products/styles";
import { StyledStatus } from "screens/ecommerce/common/commonStyle";
import { ECOMMERCE_LIST, getEcommerceIcon } from "screens/ecommerce/common/commonAction";
import ConnectedItemActionColumn from "../connected-items/ConnectedItemActionColumn";
import BaseResponse from "base/base.response";

import { exportFileProduct, getFileProduct } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";

import ConcatenateByExcel from "./ConcatenateByExcel";
import { EcommerceProductTabUrl } from "config/url.config";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import queryString from "query-string";
import {debounce} from "lodash";

const productsDeletePermission = [EcommerceProductPermission.products_delete];
const productsConnectPermission = [EcommerceProductPermission.products_update];
let connectedYodyProductsRequest: object;
let suggestVariants = window.localStorage.getItem("suggest")

type NotConnectedItemsPropsType = {
  isReloadPage: boolean;
  handleMappingVariantJob: (x: any) => void;
};

const EXPORT_PRODUCT_OPTION = {
  SELECTED: "selected",
  FILTERED: "filtered",
}

const NotConnectedItems: React.FC<NotConnectedItemsPropsType> = (props: NotConnectedItemsPropsType) => {
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const {isReloadPage, handleMappingVariantJob} = props;

  const [allowProductsConnect] = useAuthorization({
    acceptPermissions: productsConnectPermission,
    not: false,
  });

  const [variantData, setVariantData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [diffPriceProductList, setDiffPriceProductList] = useState<Array<any>>([]);
  const [isVisibleConfirmConnectItemsModal, setIsVisibleConfirmConnectItemsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [idsItemSelected, setIdsItemSelected] = useState<Array<any>>([]);
  const [isVisibleConcatenateByExcelModal, setIsVisibleConcatenateByExcelModal] = useState(false);

  //export file excel
  const [isShowExportExcelModal, setIsShowExportExcelModal] = useState(false);
  const [exportProcessId, setExportProcessId] = useState<any>(null);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState(false);
  const [exportProcessPercent, setExportProcessPercent] = useState<number>(0);

  const [exportProductType, setExportProductType] = useState<string>("");


  const [ecommerceIdSelected, setEcommerceIdSelected] = useState<number | null>(null);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);

  let tempConnectItemList: any[] = [];
  let notMatchConnectItemList: any[] = [];
  const [connectItemList, setConnectItemList] = useState<Array<any>>([]);
  let notMatchSelectedRow: any[] = [];
  const [selectedRow, setSelectedRow] = useState<Array<any>>([]);
  
  const initialFormValues: ProductEcommerceQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      ecommerce_id: null,
      shop_ids: [],
      connect_status: "waiting",
      update_stock_status: null,
      sku_or_name_core: null,
      sku_or_name_ecommerce: null,
      connected_date_from: null,
      connected_date_to: null,
    }),
    []
  );

  const [query, setQuery] = useState<ProductEcommerceQuery>({
    page: 1,
    limit: 30,
    ecommerce_id: null,
    shop_ids: [],
    connect_status: "waiting",
    update_stock_status: null,
    sku_or_name_core: null,
    sku_or_name_ecommerce: null,
    connected_date_from: null,
    connected_date_to: null,
    suggest: suggestVariants
  });

  const queryParamsParsed: { [key: string]: string | (string | null)[] | null; } = queryString.parse(
    location.search
  );

  const updateVariantData = useCallback((result: PageResponse<any> | false) => {
    setIsLoading(false);
    if (result) {
      setVariantData(result);
    }
  }, []);

  const getProductUpdated = useCallback((queryRequest: any) => {
    setIsLoading(true);
    dispatch(getProductEcommerceList(queryRequest, updateVariantData));
  }, [dispatch, updateVariantData]);

  const handleSuggestItem = () => {
    if (window.localStorage.getItem("suggest")) {
      window.localStorage.setItem("suggest", "");
    } else {
      window.localStorage.setItem("suggest", "suggested");
    }
    let dataQuery: ProductEcommerceQuery = {
      ...initialFormValues,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      suggest: window.localStorage.getItem("suggest")
    };
    getProductUpdated(dataQuery);
    window.location.reload();
  }

  useEffect(() => {
    if (isReloadPage) {
      window.scrollTo(0, 0);
      getProductUpdated(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProductUpdated, isReloadPage]);

  const reloadPage = () => {
    getProductUpdated(query);
  };

  const cancelDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);
  };

  const okDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);

    dispatch(
      deleteEcommerceItem(idsItemSelected, (result) => {
        if (result) {
          showSuccess("Xóa sản phẩm thành công");
          reloadPage();
        }
      })
    );
  };
  //end handle delete item

  //handle update connect item
  const updateConnectItemList = (newConnectItemList: any) => {
    tempConnectItemList = newConnectItemList;
    setConnectItemList(newConnectItemList);
  };

  const RenderProductColumn = (
    ecommerceItem: any,
    copyConnectItemList: any,
    updateConnectItemList: any
  ) => {
    const autoCompleteRef = createRef<RefSelectProps>();

    const [allowProductsConnect] = useAuthorization({
      acceptPermissions: productsConnectPermission,
      not: false,
    });

    const [isSearching, setIsSearching] = React.useState<boolean>(false);
    const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
    const [diffPriceProduct, setDiffPriceProduct] = useState<Array<any>>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisibleConfirmConnectModal, setIsVisibleConfirmConnectModal] = useState(false);
    const [isShowResultConnectionModal, setIsShowResultConnectionModal] = useState(false);
    const [resultConnectionData,] = useState<any>({
      total: 0,
      success_total: 0,
      error_total: 0,
      error_list: []
    });

    const [productSelected, setProductSelected] = useState<any>(
      ecommerceItem?.core_sku ?
        {
          core_variant: ecommerceItem.core_variant,
          core_variant_id: ecommerceItem.core_variant_id,
          variant_barcode: ecommerceItem.variant_barcode,
          core_sku: ecommerceItem.core_sku,
          variant_prices: null,
          core_price: ecommerceItem.core_price,
          id: ecommerceItem.id,
          core_product_id: ecommerceItem.core_product_id,
        }
        : null
    );

    const isExist = copyConnectItemList?.find((item: any) => item.id === ecommerceItem.id)
    if (productSelected && !isExist) {
      const connectItem = {
        id: ecommerceItem.id,
        core_variant_id: ecommerceItem.core_variant_id,
        variant_barcode: ecommerceItem.variant_barcode,
        core_sku: ecommerceItem.core_sku,
        core_variant: ecommerceItem.core_variant,
        core_price: ecommerceItem.core_price,
        core_product_id: ecommerceItem.core_product_id,
        ecommerce_correspond_to_core: 1,
      };

      copyConnectItemList.push(connectItem);
      updateConnectItemList(copyConnectItemList);
    }

    const closeResultConnectionModal = () => {
      setIsShowResultConnectionModal(false);
      reloadPage();
      history.replace(EcommerceProductTabUrl.CONNECTED);
    };

    const updateNotConnectedProductList = useCallback((data) => {
      setIsSaving(false);
      setIsVisibleConfirmConnectModal(false);

      if (data) {
        setProductSelected(null);
        handleMappingVariantJob(data.process_id);
      }
    }, []);

    // handle save single connected Yody product
    const saveConnectYodyProduct = () => {
      const newConnectItemList = copyConnectItemList && copyConnectItemList.filter((item: any) => {
        return item.core_variant_id !== productSelected.core_variant_id;
      });

      const connectProductSelected = {
        id: productSelected.id,
        core_variant_id: productSelected.core_variant_id,
        variant_barcode: productSelected.variant_barcode,
        core_sku: productSelected.core_sku,
        core_variant: productSelected.core_variant,
        core_price: productSelected.core_price,
        core_product_id: productSelected.core_product_id,
        ecommerce_correspond_to_core: 1,
      };

      updateConnectItemList(newConnectItemList);
      const request = {
        variants: [connectProductSelected],
      };

      setIsSaving(true);
      dispatch(
        putConnectEcommerceItem(request, updateNotConnectedProductList)
      );
    };

    const handleSaveConnectYodyProduct = () => {
      if (ecommerceItem?.ecommerce_price === productSelected?.core_price) {
        saveConnectYodyProduct();
      } else {
        setDiffPriceProduct([productSelected]);
        setIsVisibleConfirmConnectModal(true);
      }
    };

    const cancelConfirmConnectModal = () => {
      setIsVisibleConfirmConnectModal(false);
    };

    const cancelConnectYodyProduct = (itemId: any) => {
      const newConnectItemList =
        copyConnectItemList &&
        copyConnectItemList.filter((item: any) => {
          return item.core_variant_id !== itemId;
        });

      updateConnectItemList(newConnectItemList);
      setProductSelected(null);
    };

    // end handle save connect Yody product

    const onInputSearchProductFocus = () => {
      setIsInputSearchProductFocus(true);
    };

    const onInputSearchProductBlur = () => {
      setIsInputSearchProductFocus(false);
    };

    const initQueryVariant: VariantSearchQuery = {
      page: 1,
      status: "active",
    };

    const [resultSearchVariant, setResultSearchVariant] = React.useState<Array<VariantResponse>>([]);

    const updateProductResult = (result: any) => {
      setIsSearching(false);
      if (result?.items) {
        setResultSearchVariant(result.items);
      }
    };

    const handleErrorSearchProduct = () => {
      setIsSearching(false);
    };

    const onChangeProductSearch = (value: string) => {
      if (value?.length >= 3) {
        initQueryVariant.info = value;
        setIsSearching(true);
        setResultSearchVariant([]);
        dispatch(
          searchVariantsOrderRequestAction(initQueryVariant, updateProductResult, handleErrorSearchProduct)
        );
      }
    };

    const handleOnSearchProduct = debounce((value: string) => {
      onChangeProductSearch(value);
    }, 800);

    const onSearchVariantSelect = (idItemSelected: any) => {
      const itemSelected = resultSearchVariant?.find((item) => item.id === idItemSelected);

      const productSelectedData = {
        core_variant: itemSelected && itemSelected.name,
        core_sku: itemSelected && itemSelected.sku,
        variant_prices: itemSelected && itemSelected.variant_prices,
        core_price:
          itemSelected &&
          itemSelected.variant_prices &&
          itemSelected.variant_prices[0] &&
          itemSelected.variant_prices[0].retail_price,
        id: ecommerceItem.id,
        core_variant_id: itemSelected && itemSelected.id,
        core_product_id: itemSelected && itemSelected.product_id,
        variant_barcode: itemSelected?.barcode,
      };

      setProductSelected(productSelectedData);

      const connectItem = {
        id: ecommerceItem.id,
        core_variant_id: productSelectedData.core_variant_id,
        variant_barcode: productSelectedData.variant_barcode,
        core_sku: productSelectedData.core_sku,
        core_variant: productSelectedData.core_variant,
        core_price: productSelectedData.core_price,
        core_product_id: productSelectedData.core_product_id,
        ecommerce_correspond_to_core: 1,
      };

      const newConnectItems = [...copyConnectItemList];
      newConnectItems.push(connectItem);

      updateConnectItemList(newConnectItems);
      setIsInputSearchProductFocus(false);
      autoCompleteRef.current?.blur();
    };

    const renderSearchVariant = (item: VariantResponse) => {
      let avatar = findAvatar(item.variant_images);
      return (
        <StyledProductListDropdown>
          <div className="item-searched-list">
            <div className="item-img">
              <img
                src={avatar === "" ? imgDefault : avatar}
                alt="anh"
                placeholder={imgDefault}
                style={{ width: "40px", height: "40px", borderRadius: 5 }}
              />
            </div>

            <div className="item-info">
              <div className="name-and-price">
                <span className="item-name">{item.name}</span>

                <span>
                  {`${findPrice(item.variant_prices, AppConfig.currency)} `}
                  <span className="item-price-unit">đ</span>
                </span>
              </div>

              <div className="item-sku">{item.sku}</div>
            </div>
          </div>
        </StyledProductListDropdown>
      );
    };

    const convertResultSearchVariant = useMemo(() => {
      let options: any[] = [];
      resultSearchVariant?.forEach(
        (item: VariantResponse) => {
          options.push({
            label: renderSearchVariant(item),
            value: item.id,
          });
        }
      );
      return options;
    }, [resultSearchVariant]);

    return (
      <StyledYodyProductColumn>
        {(!productSelected || !productSelected.id) && (
          <AutoComplete
            notFoundContent={isSearching ? <Spin size="small"/> : "Không tìm thấy sản phẩm"}
            id="search_product"
            ref={autoCompleteRef}
            onSelect={onSearchVariantSelect}
            dropdownClassName="search-layout dropdown-search-header"
            dropdownMatchSelectWidth={360}
            onSearch={handleOnSearchProduct}
            options={convertResultSearchVariant}
            maxLength={255}
            open={isInputSearchProductFocus}
            onFocus={onInputSearchProductFocus}
            onBlur={onInputSearchProductBlur}
            dropdownRender={(menu) => <div>{menu}</div>}
          >
            <Input
              style={{ width: 230 }}
              placeholder="SKU, tên sản phẩm Yody"
              prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
            />
          </AutoComplete>
        )}

        {productSelected && productSelected.id && (
          <div className="yody-product-info">
            <ul>
              <li>
                <b>Tên sản phẩm: </b>
                <span>
                  <Link
                    target="_blank"
                    to={`${UrlConfig.PRODUCT}/${productSelected.core_product_id}/variants/${productSelected.id}`}
                  >
                    {productSelected.core_variant}
                  </Link>
                </span>
              </li>

              <li>
                <b>SKU: </b>
                <span style={{ color: "#737373" }}>{productSelected.core_sku}</span>
              </li>

              <li>
                <b>Giá bán: </b>
                <span>
                  {productSelected.variant_prices ?
                    findPrice(productSelected.variant_prices, AppConfig.currency)
                    : formatCurrency(productSelected.core_price)
                  }
                  <span className="item-price-unit">đ</span>
                </span>
              </li>
            </ul>

            {allowProductsConnect &&
              <div className="yody-product-button">
                <Button
                  type="primary"
                  onClick={handleSaveConnectYodyProduct}
                  loading={!isVisibleConfirmConnectModal && isSaving}
                  className="save-button"
                >
                  Lưu
                </Button>

                <Button
                  disabled={isSaving}
                  onClick={() => cancelConnectYodyProduct(productSelected.id)}
                >
                  Huỷ
                </Button>
              </div>
            }
          </div>
        )}

        {isVisibleConfirmConnectModal &&
          <ConfirmConnectProductModal
            isVisible={isVisibleConfirmConnectModal}
            isLoading={isSaving}
            dataSource={diffPriceProduct}
            okConfirmConnectModal={saveConnectYodyProduct}
            cancelConfirmConnectModal={cancelConfirmConnectModal}
          />
        }

        <ResultConnectProductModal
          visible={isShowResultConnectionModal}
          onCancel={closeResultConnectionModal}
          onOk={closeResultConnectionModal}
          connectProductData={resultConnectionData}
        />
      </StyledYodyProductColumn>
    );
  };

  //handle delete item
  const handleDeleteItem = (item: any) => {
    setIsShowDeleteItemModal(true);
    setIdsItemSelected([item.id]);
  };

  const [columns,] = useState<any>([
    {
      title: "Ảnh",
      align: "center",
      width: "70px",
      render: (item: any) => {
        return (
          <img
            src={item.ecommerce_image_url}
            style={{ height: "40px" }}
            alt=""
          />
        );
      },
    },
    {
      title: "Sku/ itemID (Sàn)",
      width: "13%",
      render: (item: any) => {
        return (
          <div>
            <div>{item.ecommerce_sku}</div>
            <div style={{ color: "#737373" }}>{item.ecommerce_product_id}</div>
            <div style={{ color: "#737373", fontStyle: "italic" }}>({item.ecommerce_variant_id})</div>
            <div style={{ color: "#2a2a86", fontWeight: 500 }}>({item.shop})</div>
          </div>
        );
      },
    },
    {
      title: "Sản phẩm (Sàn)",
      width: "24%",
      render: (item: any) => {
        return <div>{item.ecommerce_variant}</div>;
      },
    },
    {
      title: "Giá bán (Sàn)",
      align: "center",
      width: "10%",
      render: (item: any) => {
        return (
          <span>
            {item.ecommerce_price ? formatCurrency(item.ecommerce_price) : "-"}
          </span>
        );
      },
    },
    {
      title: "Sản phẩm (Unicorn)",
      render: (item: any) => RenderProductColumn(item, [...tempConnectItemList], updateConnectItemList)
    },
    {
      title: "Ghép nối",
      align: "center",
      width: "150px",
      render: (item: any) => {
        return (
          <StyledStatus>
            {item.connect_status === "waiting" && (
              <span className="blue-status">Chưa ghép nối</span>
            )}
          </StyledStatus>
        );
      },
    },

    ConnectedItemActionColumn(
      handleDeleteItem,
    ),
  ]);

  let initialValues = useMemo(() => {
    return {
      ...query,
      shop_ids: Array.isArray(query.shop_ids)
        ? query.shop_ids
        : [query.shop_ids],
    };
  }, [query]);

  let filters = useMemo(() => {
    let list = [];

    if (initialValues.ecommerce_id !== null) {
      list.push({
        key: "ecommerce_id",
        name: "Sàn",
        value: ECOMMERCE_LIST[initialValues.ecommerce_id - 1].title ,
      });
    }

    if (initialValues.shop_ids.length) {
      let shopNameList = "";
      initialValues.shop_ids.forEach((shopId: any) => {
        const findStatus = ecommerceShopList?.find(
          (item) => +item.id === +shopId
        );
        shopNameList = findStatus
          ? shopNameList + findStatus.name + "; "
          : shopNameList;
      });
      list.push({
        key: "shop_ids",
        name: "Gian hàng",
        value: shopNameList,
      });
    }

    if (initialValues.sku_or_name_ecommerce) {
      list.push({
        key: "sku_or_name_ecommerce",
        name: "Sku, tên sản phẩm sàn",
        value: initialValues.sku_or_name_ecommerce
      });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialValues.shop_ids,
    // initialValues.connected_status,
    // initialValues.created_date_from,
    // initialValues.created_date_to,
    // initialValues.ecommerce_order_statuses,
    ecommerceShopList,
  ]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      let dataQuery :any;
      switch (tag.key) {
        case "shop_ids":
          dataQuery = {
            ...getQueryParamsFromQueryString(queryParamsParsed),
            ...{[tag.key]: []}
          };
          break;
        case "ecommerce_id":
          dataQuery = {
            ...getQueryParamsFromQueryString(queryParamsParsed),
            ...{[tag.key]: [], shop_ids: []}
          };
          break;
        default:
          dataQuery = {
            ...getQueryParamsFromQueryString(queryParamsParsed),
            ...{[tag.key]: null}
          };
          break;
      }
      
      let queryParam = generateQuery(dataQuery);
      history.push(`${location.pathname}?${queryParam}`);
      
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, formAdvance]
  );


  const onSearch = (value: ProductEcommerceQuery) => {
    const dataQuery: ProductEcommerceQuery = {
      ...initialFormValues,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      ...value
    }
    let queryParam = generateQuery(dataQuery);
    history.push(`${location.pathname}?${queryParam}`);
  };

  useEffect(() => {
    let dataQuery: ProductEcommerceQuery = {
      ...initialFormValues,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      suggest: window.localStorage.getItem("suggest")
    };
    setFilterValueByQueryParam(dataQuery)
    setQuery(dataQuery);
    getProductUpdated(dataQuery);
    window.scrollTo(0, 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search])

  const setFilterValueByQueryParam = (dataquery: ProductEcommerceQuery)=> {
    let checkEcommerceShop = Array.isArray(dataquery.shop_ids)
    ? dataquery.shop_ids
    : [dataquery.shop_ids];
    formAdvance.setFieldsValue(dataquery);
    setEcommerceIdSelected(dataquery.ecommerce_id);
    getEcommerceShop(dataquery.ecommerce_id);
    if (dataquery.ecommerce_id === null){
      removeEcommerce();
    } else if (dataquery.ecommerce_id in [1, 2, 3, 4]) {
      formAdvance.setFieldsValue({ecommerce_id: ECOMMERCE_LIST[dataquery.ecommerce_id-1].ecommerce_id})
      if (dataquery.shop_ids !== null){
        formAdvance.setFieldsValue({shop_ids: checkEcommerceShop.map(item => +item)})
      }
      
    } else {
      formAdvance.setFieldsValue({ecommerce_id: null})
      removeEcommerce();
    }
  }

  const onPageChange = React.useCallback(
    (page, limit) => {
      const dataQuery: ProductEcommerceQuery = {
        ...initialFormValues,
        ...getQueryParamsFromQueryString(queryParamsParsed),
        page: page,
        limit: limit,
      }
      let queryParam = generateQuery(dataQuery);
      history.push(`${location.pathname}?${queryParam}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query]
  );
  // get ecommerce shop list
  const updateEcommerceShopList = React.useCallback((result) => {
    const shopList: any[] = [];
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        shopList.push({
          id: item.id,
          name: item.name,
          isSelected: false,
          ecommerce: item.ecommerce,
        });
      });
    }
    setEcommerceShopList(shopList);
  }, []);

  const getEcommerceShop = (ecommerceId: any) => {
    dispatch(
      getShopEcommerceList(
        { ecommerce_id: ecommerceId },
        updateEcommerceShopList
      )
    );
  }
  // end get ecommerce shop list

  //handle select ecommerce
  const handleSelectEcommerce = (ecommerceId: any) => {
    if (ecommerceId !== ecommerceIdSelected) {
      formAdvance?.setFieldsValue({
        shop_ids: []
      });

      setEcommerceIdSelected(ecommerceId);
      getEcommerceShop(ecommerceId);
    }
  };

  const removeEcommerce = () => {
    setEcommerceIdSelected(null);
    formAdvance?.setFieldsValue({ shop_ids: [] });
  };
  //end handle select ecommerce

  //handle save connected Yody product
  const disableSaveConnectedYodyProduct = () => {
    return connectItemList.length === 0;
  };

  const updateProductList = (data: any) => {
    setIsLoading(false);
    setIsVisibleConfirmConnectItemsModal(false);

    if (data) {
      updateConnectItemList(notMatchConnectItemList);
      setConnectItemList(tempConnectItemList);
      setSelectedRow(notMatchSelectedRow);
      handleMappingVariantJob(data.process_id);
      // setIsShowResultConnectProductModal(true);
    }
  };

  const connectedYodyProducts = () => {
    setIsLoading(true);
    dispatch(
      putConnectEcommerceItem(connectedYodyProductsRequest, updateProductList)
    );
  };

  const handleConnectedYodyProducts = () => {
    const yodyProductConnectCheck: any[] = [];
    let isSaveAble = true;
    let isNotEqualPrice = false;
    let diffPriceProductListData: any[] = [];

    let tempSelectedRow: any[] = [];
    selectedRow.forEach((rowData) => {
      if (!!rowData) {
        tempSelectedRow.push(rowData);
      }
    });

    if (tempSelectedRow.length === 0) {
      showError("Vui lòng chọn ít nhất 1 sản phẩm để ghép nối");
      isSaveAble = false;
    } else {
      connectItemList.forEach((item) => {
        const itemMatch = tempSelectedRow.find(
          (rowData) => rowData.id === item.id
        );
        if (itemMatch) {
          yodyProductConnectCheck.push(item);
          if (itemMatch.ecommerce_price !== item.core_price) {
            isNotEqualPrice = true;
            diffPriceProductListData.push(item);
          }
        } else {
          notMatchConnectItemList.push(item);
        }
      });

      tempSelectedRow.forEach((rowData) => {
        const rowMatch = yodyProductConnectCheck.find(
          (item) => item.id === rowData.id
        );
        if (!rowMatch) {
          notMatchSelectedRow.push(rowData);
        }
      });
    }

    if (isSaveAble && yodyProductConnectCheck.length === 0) {
      showError("Vui lòng chọn Sản phẩm (Unicorn) để ghép nối");
      isSaveAble = false;
    }

    if (isSaveAble) {
      connectedYodyProductsRequest = {
        variants: yodyProductConnectCheck,
      };

      if (isNotEqualPrice) {
        setDiffPriceProductList(diffPriceProductListData);
        setIsVisibleConfirmConnectItemsModal(true);
      } else {
        connectedYodyProducts();
      }
    }
  };
  //end handle save connected Yody product

  //select row table
  const onSelectTableRow = React.useCallback((selectedRow: Array<any>) => {
    const newSelectedRow = selectedRow.filter((row: any) => {
      return row !== undefined;
    });
    setSelectedRow(newSelectedRow);
  }, []);

  


  //handle export file
  const resetExportProductProcess = () => {
    setExportProcessId(null);
    setExportProcessPercent(0);
  }

  const handleExportExcelProduct = () => {
    const itemSelected: any[] = [];
    if (selectedRow && selectedRow.length > 0) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
    }

    setIdsItemSelected(itemSelected);
    setIsShowExportExcelModal(true)
  }

  const cancelExportExcelProductModal = () => {
    setIsShowExportExcelModal(false);
    setExportProductType("");
  }

  const onCancelProgressModal = () => {
    setIsVisibleExitProcessModal(true);
  }

  const okExportExcelProduct = () => {
    const RequestExportExcel: RequestExportExcelQuery = {
      ...query,
      shop_ids: Array.isArray(query.shop_ids) ? query.shop_ids : [query.shop_ids],
      category_id: null,
      core_variant_id: null,
      variant_ids: exportProductType === EXPORT_PRODUCT_OPTION.SELECTED ? idsItemSelected : [],
    }

    if (exportProductType === EXPORT_PRODUCT_OPTION.FILTERED) {
      const queryParam = {...query};
      delete queryParam.page;
      delete queryParam.limit;
      const generateQueryParam = generateQuery(queryParam);
      if (!generateQueryParam) {
        showError("Chưa áp dụng bộ lọc sản phẩm. Vui lòng kiểm tra lại.");
        cancelExportExcelProductModal();
        return;
      }
    }

    exportFileProduct(RequestExportExcel)
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProcessId(response.data.process_id)
          setIsVisibleProgressModal(true);
          cancelExportExcelProductModal();
        }
      })
      .catch(() => {
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });

    setExportProgress(0);
  }

  const checkExportFile = useCallback(() => {
    let getProgressPromises: Promise<BaseResponse<any>> = getFileProduct(exportProcessId);

    Promise.all([getProgressPromises]).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.finish) {
            if (response.data.api_error) {
              setExportProcessPercent(0);
              showError(`${response.data.api_error}`);
            } else {
              if (response.data.url) {
                setExportProcessPercent(100);
                showSuccess("Xuất file dữ liệu sản phẩm thành công!");
                window.open(response.data.url);
              }
            }
            setExportProcessId(null);
            setIsVisibleProgressModal(false);
          } else {
            if (response.data.total > 0) {
              const percent = Math.floor(response.data.total_success / response.data.total * 100);
              setExportProcessPercent(percent >= 100 ? 99 : percent);
            }
          }
        }
      });
    })
    .catch(() => {
      showError("Có lỗi xảy ra, vui lòng thử lại sau");
    });
  }, [exportProcessId]);

  useEffect(() => {
    if (exportProgress === 100 || !exportProcessId) return;

    checkExportFile();

    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkExportFile, exportProcessId]);

  const onChangeExportProductOption = (e: any) => {
    setExportProductType(e.target.value);
  };
  //end handle export file

  // handle exit export product
  const [isVisibleExitProcessModal, setIsVisibleExitProcessModal] = useState<boolean>(false);

  const onCancelExitProcessModal = () => {
    setIsVisibleExitProcessModal(false);
  }

  const onOkExitProcessModal = () => {
    resetExportProductProcess();
    setIsVisibleExitProcessModal(false);
    setIsVisibleProgressModal(false);
    if (exportProcessId) {
      dispatch(
        exitEcommerceJobsAction(exportProcessId, (responseData) => {
          if (responseData) {
            showSuccess(responseData);
          }
        })
      );
    }
  };
  // end handle exit process modal

  const [allowProductsDelete] = useAuthorization({
    acceptPermissions: productsDeletePermission,
    not: false,
  });

  const isShowAction = allowProductsDelete;

  const isDisableAction = () => {
    return !selectedRow || selectedRow.length === 0;
  };

  const handleDeleteItemsSelected = () => {
    if (isDisableAction()) {
      return;
    }

    const itemSelected: any[] = [];
    if (selectedRow) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
    }
    setIdsItemSelected(itemSelected);
    setIsShowDeleteItemModal(true);
  };

  const handleConcatenateByExcel = () => {
    setIsVisibleConcatenateByExcelModal(true);
  }

  const onOkConcatenateByExcel = () => {
    setIsVisibleConcatenateByExcelModal(false);
  }
  
  const onCancelConcatenateByExcel = () => {
    setIsVisibleConcatenateByExcelModal(false);
  }

  const setTitleSuggest = () => {
    return window.localStorage.getItem("suggest") ? "Bỏ gợi ý ghép nối" : "Gợi ý ghép nối"
  }

  const actionList = (
    <Menu>
      {allowProductsDelete &&
        <Menu.Item key="1" onClick={handleDeleteItemsSelected} disabled={isDisableAction()}>
          <span>Xóa sản phẩm lấy về</span>
        </Menu.Item>
      }
      <Menu.Item
        key="export"
        onClick={handleExportExcelProduct}
        disabled={!variantData.metadata || !variantData.metadata.total}
      >
        <span>Xuất excel sản phẩm</span>
      </Menu.Item>
      <Menu.Item key="4" onClick={handleSuggestItem}>
        <span>{setTitleSuggest()}</span>
      </Menu.Item>
      <Menu.Item key="5" onClick={handleConcatenateByExcel}>
        <span>Ghép nối bằng excel</span>
      </Menu.Item>
    </Menu>
  )


  return (
    <StyledComponent>
      <Card>
        <StyledProductFilter>
          <div className="filter not-connected-items-filter">
            <Form form={formAdvance} onFinish={onSearch} initialValues={initialFormValues}>

              {isShowAction &&
                <div className="action-dropdown">
                  <Dropdown
                    overlay={actionList}
                    trigger={["click"]}
                    disabled={isLoading}
                  >
                    <Button className="action-button">
                      <div style={{ marginRight: 10 }}>Thao tác</div>
                      <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              }

              <Form.Item
                name="ecommerce_id"
                className="select-channel-dropdown">
                <Select
                  disabled={isLoading}
                  placeholder="Chọn sàn"
                  allowClear
                  onSelect={(value) => handleSelectEcommerce(value)}
                  onClear={removeEcommerce}>
                  {ECOMMERCE_LIST?.map((item: any) => (
                    <Select.Option key={item.ecommerce_id} value={item.ecommerce_id}>
                      <div>
                        <img
                          src={item.icon}
                          alt={item.id}
                          style={{ marginRight: "10px" }}
                        />
                        <span>{item.title}</span>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                className="select-store-dropdown"
                name="shop_ids"
              >
                {ecommerceIdSelected ?
                  <TreeSelect
                    placeholder="Chọn gian hàng"
                    treeDefaultExpandAll
                    className="selector"
                    allowClear
                    showArrow
                    showSearch
                    multiple
                    treeCheckable
                    treeNodeFilterProp="title"
                    maxTagCount="responsive"
                    filterTreeNode={(textSearch: any, item: any) => {
                      const treeNodeTitle = item?.title?.props?.children[1];
                      return fullTextSearch(textSearch, treeNodeTitle);
                    }}
                  >
                    {ecommerceShopList?.map((shopItem: any) => (
                      <TreeSelect.TreeNode
                        key={shopItem.id}
                        value={shopItem.id}
                        title={
                          <span>
                      <img
                        src={getEcommerceIcon(shopItem.ecommerce)}
                        alt={shopItem.id}
                        style={{ marginRight: "5px", height: "16px" }}
                      />
                            {shopItem.name}
                    </span>
                        }
                      />
                    ))}
                  </TreeSelect>
                  :
                  <Tooltip title="Yêu cầu chọn sàn" color={"gold"}>
                    <Select
                      showSearch
                      disabled={true}
                      placeholder="Chọn gian hàng"
                    />
                  </Tooltip>
                }
              </Form.Item>

              <Form.Item name="sku_or_name_ecommerce" className="search-ecommerce-product">
                <Input
                  disabled={isLoading}
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="SKU, tên sản phẩm sàn"
                />
              </Form.Item>

              <div>
                <Button type="primary" htmlType="submit" disabled={isLoading}>
                  Lọc
                </Button>
              </div>
            </Form>
            <div className="order-filter-tags">
              {filters && filters.map((filter: any, index:any) => {
                return (
                  <Tag key={index} className="tag" closable onClose={(e) => onCloseTag(e, filter)}>{filter.name}: {filter.value}</Tag>
                )
              })}
            </div>

          </div>
        </StyledProductFilter>

        <CustomTable
          bordered
          isRowSelection={allowProductsConnect}
          isLoading={isLoading}
          onSelectedChange={onSelectTableRow}
          columns={columns}
          dataSource={variantData.items}
          scroll={{ x: 1080 }}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
          pagination={{
            pageSize: variantData.metadata && variantData.metadata.limit,
            total: variantData.metadata && variantData.metadata.total,
            current: variantData.metadata && variantData.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          isShowPaginationAtHeader
          rowKey={(data) => data.id}
        />

        {allowProductsConnect &&
          <Button
            style={{ margin: "20px 0" }}
            type="primary"
            onClick={handleConnectedYodyProducts}
            disabled={disableSaveConnectedYodyProduct()}
            size="large"
            icon={<img src={saveIcon} style={{ marginRight: 10 }} alt="" />}
            loading={isLoading}
          >
            Lưu các cặp đã chọn
          </Button>
        }

      </Card>

      {isVisibleConfirmConnectItemsModal &&
        <ConfirmConnectProductModal
          isVisible={isVisibleConfirmConnectItemsModal}
          isLoading={isLoading}
          dataSource={diffPriceProductList}
          okConfirmConnectModal={connectedYodyProducts}
          cancelConfirmConnectModal={() => setIsVisibleConfirmConnectItemsModal(false)}
        />
      }

      {/* Import customer file */}
      {isVisibleConcatenateByExcelModal &&
          <ConcatenateByExcel
            onCancelConcatenateByExcel={onCancelConcatenateByExcel}
            onOkConcatenateByExcel={onOkConcatenateByExcel}
          />
        }

      {/*<ResultConnectProductModal*/}
      {/*  visible={isShowResultConnectProductModal}*/}
      {/*  onCancel={closeResultConnectProductModal}*/}
      {/*  onOk={closeResultConnectProductModal}*/}
      {/*  connectProductData={connectProductData}*/}
      {/*/>*/}

      {/*<ProgressDownloadProductsModal*/}
      {/*    visible={isShowResultConnectProductModal}*/}
      {/*    isDownloading={false}*/}
      {/*    onOk={closeResultConnectProductModal}*/}
      {/*    onCancel={closeResultConnectProductModal}*/}
      {/*    progressData={connectProductData}*/}
      {/*    progressPercent={100}*/}
      {/*    processType="sync-variant"*/}
      {/*/>*/}

      <Modal
        width="600px"
        visible={isShowDeleteItemModal}
        okText="Đồng ý"
        cancelText="Hủy"
        onCancel={cancelDeleteItemModal}
        onOk={okDeleteItemModal}
      >
        <div>
          <img src={circleDeleteIcon} style={{ marginRight: 20 }} alt="" />
          <span>Bạn có chắc chắn muốn xóa sản phẩm tải về không?</span>
        </div>
      </Modal>

      {/*Export product modal*/}
      <Modal
        width="600px"
        visible={isShowExportExcelModal}
        title="Xuất excel sản phẩm"
        okText="Tải về"
        cancelText="Hủy"
        onCancel={cancelExportExcelProductModal}
        onOk={okExportExcelProduct}
        okButtonProps={{ disabled: !exportProductType }}
      >
        <Radio.Group onChange={onChangeExportProductOption} value={exportProductType}>
          <Space direction="vertical">
            <Radio
              value={EXPORT_PRODUCT_OPTION.SELECTED}
              disabled={selectedRow.length <= 0}
            >
              Tải sản phẩm đã chọn
            </Radio>
            <Radio value={EXPORT_PRODUCT_OPTION.FILTERED}>
              Tải toàn bộ sản phẩm(toàn bộ sản phẩm trong các trang được lọc)
            </Radio>
          </Space>
        </Radio.Group>
      </Modal>

      {/*Process export product modal*/}
      <Modal
        onCancel={onCancelProgressModal}
        visible={isVisibleProgressModal}
        title="Xuất file"
        centered
        width={600}
        footer={[
          <Button key="cancel" danger onClick={onCancelProgressModal}>
            Thoát
          </Button>,
        ]}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 15 }}>
            Đang tạo file, vui lòng đợi trong giây lát
          </div>
          <Progress
            type="circle"
            strokeColor={{
              "0%": "#108ee9",
              "100%": "#87d068",
            }}
            percent={exportProcessPercent}
          />
        </div>
      </Modal>

      {/*Exit export product process modal*/}
      <Modal
        width="600px"
        centered
        visible={isVisibleExitProcessModal}
        title=""
        okText="Xác nhận"
        cancelText="Hủy"
        onCancel={onCancelExitProcessModal}
        onOk={onOkExitProcessModal}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={DeleteIcon} alt="" />
          <div style={{ marginLeft: 15 }}>
            <strong style={{ fontSize: 16 }}>Bạn có chắc chắn muốn hủy tải sản phẩm không?</strong>
            <div style={{ fontSize: 14 }}>Hệ thống sẽ dừng việc tải sản phẩm, bạn vẫn có thể tải lại sau nếu muốn.</div>
          </div>
        </div>
      </Modal>

    </StyledComponent>
  );
};

export default NotConnectedItems;

