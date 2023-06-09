import React, { useState, useMemo, createRef, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { RefSelectProps } from "antd/lib/select";
import {
  Button,
  Form,
  Input,
  Modal,
  AutoComplete,
  Card,
  Dropdown,
  Menu,
  Radio,
  Space,
  Progress,
  Tag,
} from "antd";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";

import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import CustomTable from "component/table/CustomTable";
import { showError, showSuccess } from "utils/ToastUtils";
import { findAvatar, findPrice, formatCurrency, generateQuery } from "utils/AppUtils";

import { WebAppProductQuery, WebAppRequestExportExcelQuery } from "model/query/web-app.query";
import { PageResponse } from "model/base/base-metadata.response";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";

import {
  deleteWebAppProductAction,
  putConnectWebAppProductAction,
  getWebAppProductAction,
  exitWebAppJobsAction,
} from "domain/actions/web-app/web-app.actions";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";

import ConfirmConnectProductModal from "screens/web-app/products/tab/not-connected-items/ConfirmConnectProductModal";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import ResultConnectProductModal from "screens/web-app/products/tab/not-connected-items/ResultConnectProductModal";

import circleDeleteIcon from "assets/icon/circle-delete.svg";
import saveIcon from "assets/icon/save.svg";
import imgDefault from "assets/icon/img-default.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

import {
  StyledComponent,
  StyledProductListDropdown,
  StyledYodyProductColumn,
} from "screens/web-app/products/tab/not-connected-items/styles";
import { StyledProductFilter } from "screens/web-app/products/styles";
import { StyledStatus } from "screens/web-app/common/commonStyle";
import ConnectedItemActionColumn from "../connected-items/ConnectedItemActionColumn";
import BaseResponse from "base/base.response";

import { webAppExportFileProduct, webAppGetFileProduct } from "service/other/export.service";
import { HttpStatus } from "config/http-status.config";

import ConcatenateByExcel from "./ConcatenateByExcel";
import { EcommerceProductTabUrl } from "config/url.config";
import { getQueryParamsFromQueryString } from "utils/useQuery";
import queryString from "query-string";
import { OFFSET_HEADER_UNDER_NAVBAR } from "utils/Constants";

const productsDeletePermission = [EcommerceProductPermission.products_delete];
const productsConnectPermission = [EcommerceProductPermission.products_update];
let connectedYodyProductsRequest: object;
let suggestVariants = window.localStorage.getItem("suggest");

type NotConnectedItemsPropsType = {
  isReloadPage: boolean;
  handleMappingVariantJob: (x: any) => void;
};

const EXPORT_PRODUCT_OPTION = {
  SELECTED: "selected",
  FILTERED: "filtered",
};

const NotConnectedItems: React.FC<NotConnectedItemsPropsType> = (
  props: NotConnectedItemsPropsType,
) => {
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const { isReloadPage, handleMappingVariantJob } = props;

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

  let tempConnectItemList: any[] = [];
  let notMatchConnectItemList: any[] = [];
  const [connectItemList, setConnectItemList] = useState<Array<any>>([]);
  let notMatchSelectedRow: any[] = [];
  const [selectedRow, setSelectedRow] = useState<Array<any>>([]);

  const initialFormValues: WebAppProductQuery = useMemo(
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
    [],
  );

  const [query, setQuery] = useState<WebAppProductQuery>({
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
    suggest: suggestVariants,
  });

  const queryParamsParsed: {
    [key: string]: string | (string | null)[] | null;
  } = queryString.parse(location.search);

  const updateVariantData = useCallback((result: PageResponse<any> | false) => {
    setIsLoading(false);
    if (result) {
      setVariantData(result);
    }
  }, []);

  const getProductUpdated = useCallback(
    (queryRequest: any) => {
      setIsLoading(true);
      dispatch(getWebAppProductAction(queryRequest, updateVariantData));
    },
    [dispatch, updateVariantData],
  );

  // handle suggest item
  const handleSuggestItem = () => {
    if (window.localStorage.getItem("suggest")) {
      window.localStorage.setItem("suggest", "");
    } else {
      window.localStorage.setItem("suggest", "suggested");
    }
    window.location.reload();
  };

  const setTitleSuggest = () => {
    return window.localStorage.getItem("suggest") ? "Bỏ gợi ý ghép nối" : "Gợi ý ghép nối";
  };
  // end handle suggest item

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
      deleteWebAppProductAction(idsItemSelected, (result) => {
        if (result) {
          showSuccess("Xóa sản phẩm thành công");
          reloadPage();
        }
      }),
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
    updateConnectItemList: any,
  ) => {
    const autoCompleteRef = createRef<RefSelectProps>();

    const [allowProductsConnect] = useAuthorization({
      acceptPermissions: productsConnectPermission,
      not: false,
    });

    const [keySearchVariant, setKeySearchVariant] = useState("");
    const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
    const [diffPriceProduct, setDiffPriceProduct] = useState<Array<any>>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisibleConfirmConnectModal, setIsVisibleConfirmConnectModal] = useState(false);
    const [isShowResultConnectionModal, setIsShowResultConnectionModal] = useState(false);
    const [resultConnectionData] = useState<any>({
      total: 0,
      success_total: 0,
      error_total: 0,
      error_list: [],
    });

    const [productSelected, setProductSelected] = useState<any>(
      ecommerceItem?.core_sku
        ? {
            core_variant: ecommerceItem.core_variant,
            core_variant_id: ecommerceItem.core_variant_id,
            core_sku: ecommerceItem.core_sku,
            variant_prices: null,
            core_price: ecommerceItem.core_price,
            id: ecommerceItem.id,
            core_product_id: ecommerceItem.core_product_id,
          }
        : null,
    );

    const isExist = copyConnectItemList?.find((item: any) => item.id === ecommerceItem.id);
    if (productSelected && !isExist) {
      const connectItem = {
        id: ecommerceItem.id,
        core_variant_id: ecommerceItem.core_variant_id,
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
      const newConnectItemList =
        copyConnectItemList &&
        copyConnectItemList.filter((item: any) => {
          return item.core_variant_id !== productSelected.core_variant_id;
        });

      const connectProductSelected = {
        id: productSelected.id,
        core_variant_id: productSelected.core_variant_id,
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
      dispatch(putConnectWebAppProductAction(request, updateNotConnectedProductList));
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
    };

    const [resultSearchVariant, setResultSearchVariant] = React.useState<
      PageResponse<VariantResponse>
    >({
      metadata: {
        limit: 0,
        page: 1,
        total: 0,
      },
      items: [],
    });

    const updateProductResult = (result: any) => {
      setResultSearchVariant(result);
    };

    const onChangeProductSearch = (value: string) => {
      setKeySearchVariant(value);
      initQueryVariant.info = value;
      dispatch(searchVariantsOrderRequestAction(initQueryVariant, updateProductResult));
    };

    const onSearchVariantSelect = (idItemSelected: any) => {
      const itemSelected =
        resultSearchVariant &&
        resultSearchVariant.items &&
        resultSearchVariant.items.find((item) => item.id === idItemSelected);

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
      };

      setProductSelected(productSelectedData);

      const connectItem = {
        id: ecommerceItem.id,
        core_variant_id: productSelectedData.core_variant_id,
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
      setKeySearchVariant("");
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

              <div className="sku-and-stock">
                <span className="item-sku">{item.sku}</span>

                <span className="item-inventory">
                  {"Có thể bán: "}
                  <span style={{ color: item.inventory > 0 ? "#2A2A86" : "red" }}>
                    {item.inventory || "0"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </StyledProductListDropdown>
      );
    };

    const convertResultSearchVariant = useMemo(() => {
      let options: any[] = [];
      resultSearchVariant.items.forEach((item: VariantResponse) => {
        options.push({
          label: renderSearchVariant(item),
          value: item.id,
        });
      });
      return options;
    }, [resultSearchVariant]);

    return (
      <StyledYodyProductColumn>
        {(!productSelected || !productSelected.id) && (
          <AutoComplete
            notFoundContent={keySearchVariant.length >= 3 ? "Không tìm thấy sản phẩm" : undefined}
            id="search_product"
            value={keySearchVariant}
            ref={autoCompleteRef}
            onSelect={onSearchVariantSelect}
            dropdownClassName="search-layout dropdown-search-header"
            dropdownMatchSelectWidth={360}
            onSearch={onChangeProductSearch}
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
                  {productSelected.variant_prices
                    ? findPrice(productSelected.variant_prices, AppConfig.currency)
                    : formatCurrency(productSelected.core_price)}
                  <span className="item-price-unit">đ</span>
                </span>
              </li>
            </ul>

            {allowProductsConnect && (
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
            )}
          </div>
        )}

        {isVisibleConfirmConnectModal && (
          <ConfirmConnectProductModal
            isVisible={isVisibleConfirmConnectModal}
            isLoading={isSaving}
            dataSource={diffPriceProduct}
            okConfirmConnectModal={saveConnectYodyProduct}
            cancelConfirmConnectModal={cancelConfirmConnectModal}
          />
        )}

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

  const [columns] = useState<any>([
    {
      title: "Ảnh",
      align: "center",
      width: "70px",
      render: (item: any) => {
        return <img src={item.ecommerce_image_url} style={{ height: "40px" }} alt="" />;
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
            <div style={{ color: "#2a2a86" }}>({item.shop})</div>
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
        return <span>{item.ecommerce_price ? formatCurrency(item.ecommerce_price) : "-"}</span>;
      },
    },
    {
      title: "Sản phẩm (Unicorn)",
      render: (item: any) =>
        RenderProductColumn(item, [...tempConnectItemList], updateConnectItemList),
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

    ConnectedItemActionColumn(handleDeleteItem),
  ]);

  const onSearch = (value: WebAppProductQuery) => {
    let queryParam = generateQuery(value);
    history.push(`${location.pathname}?${queryParam}`);
  };

  useEffect(() => {
    let dataQuery: WebAppProductQuery = {
      ...initialFormValues,
      ...getQueryParamsFromQueryString(queryParamsParsed),
      suggest: window.localStorage.getItem("suggest"),
    };
    setFilterValueByQueryParam(dataQuery);
    setQuery(dataQuery);
    getProductUpdated(dataQuery);
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, location.search]);

  const setFilterValueByQueryParam = (dataquery: WebAppProductQuery) => {
    formAdvance.setFieldsValue(dataquery);
  };

  const onPageChange = React.useCallback(
    (page, limit) => {
      const newPrams = { ...query, page: page, limit: limit };
      const queryParam = generateQuery(newPrams);
      setQuery(newPrams);
      window.scrollTo(0, 0);
      history.push(`${location.pathname}?${queryParam}`);
    },
    [history, location.pathname, query],
  );

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
    dispatch(putConnectWebAppProductAction(connectedYodyProductsRequest, updateProductList));
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
        const itemMatch = tempSelectedRow.find((rowData) => rowData.id === item.id);
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
        const rowMatch = yodyProductConnectCheck.find((item) => item.id === rowData.id);
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
  };

  const handleExportExcelProduct = () => {
    const itemSelected: any[] = [];
    if (selectedRow && selectedRow.length > 0) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
    }

    setIdsItemSelected(itemSelected);
    setIsShowExportExcelModal(true);
  };

  const cancelExportExcelProductModal = () => {
    setIsShowExportExcelModal(false);
    setExportProductType("");
  };

  const onCancelProgressModal = () => {
    setIsVisibleExitProcessModal(true);
  };

  const okExportExcelProduct = () => {
    const RequestExportExcel: WebAppRequestExportExcelQuery = {
      ...query,
      category_id: null,
      core_variant_id: null,
      variant_ids: exportProductType === EXPORT_PRODUCT_OPTION.SELECTED ? idsItemSelected : [],
    };

    if (exportProductType === EXPORT_PRODUCT_OPTION.FILTERED) {
      const queryParam = { ...query };
      delete queryParam.page;
      delete queryParam.limit;
      const generateQueryParam = generateQuery(queryParam);
      if (!generateQueryParam) {
        showError("Chưa áp dụng bộ lọc sản phẩm. Vui lòng kiểm tra lại.");
        cancelExportExcelProductModal();
        return;
      }
    }

    webAppExportFileProduct(RequestExportExcel)
      .then((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          setExportProcessId(response.data.process_id);
          setIsVisibleProgressModal(true);
          cancelExportExcelProductModal();
        }
      })
      .catch(() => {
        showError("Có lỗi xảy ra, vui lòng thử lại sau");
      });

    setExportProgress(0);
  };

  const checkExportFile = useCallback(() => {
    let getProgressPromises: Promise<BaseResponse<any>> = webAppGetFileProduct(exportProcessId);

    Promise.all([getProgressPromises])
      .then((responses) => {
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
                const percent = Math.floor(
                  (response.data.total_success / response.data.total) * 100,
                );
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
  };

  const onOkExitProcessModal = () => {
    resetExportProductProcess();
    setIsVisibleExitProcessModal(false);
    setIsVisibleProgressModal(false);
    if (exportProcessId) {
      dispatch(
        exitWebAppJobsAction(exportProcessId, (responseData) => {
          if (responseData) {
            showSuccess(responseData);
          }
        }),
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
  };

  const onOkConcatenateByExcel = () => {
    setIsVisibleConcatenateByExcelModal(false);
  };

  const onCancelConcatenateByExcel = () => {
    setIsVisibleConcatenateByExcelModal(false);
  };

  // handle tag filter
  const initialValues = useMemo(() => {
    return {
      ...query,
    };
  }, [query]);

  const filters = useMemo(() => {
    let list = [];
    if (initialValues.sku_or_name_ecommerce) {
      list.push({
        key: "sku_or_name_ecommerce",
        name: "Sku, tên sản phẩm (Sapo)",
        value: initialValues.sku_or_name_ecommerce,
      });
    }

    return list;
  }, [initialValues.sku_or_name_ecommerce]);

  const onCloseTag = useCallback(
    (e, tag) => {
      e.preventDefault();
      let dataQuery: any;
      switch (tag.key) {
        default:
          dataQuery = {
            ...getQueryParamsFromQueryString(queryParamsParsed),
            ...{ [tag.key]: null },
          };
          break;
      }

      const queryParam = generateQuery(dataQuery);
      history.push(`${location.pathname}?${queryParam}`);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [history, location.search],
  );
  // end handle tag filter

  const actionList = (
    <Menu>
      {allowProductsDelete && (
        <Menu.Item key="1" onClick={handleDeleteItemsSelected} disabled={isDisableAction()}>
          <span>Xóa sản phẩm lấy về</span>
        </Menu.Item>
      )}
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
  );

  return (
    <StyledComponent>
      <Card>
        <StyledProductFilter>
          <div className="filter not-connected-items-filter">
            <Form form={formAdvance} onFinish={onSearch} initialValues={initialFormValues}>
              {isShowAction && (
                <div className="action-dropdown">
                  <Dropdown overlay={actionList} trigger={["click"]} disabled={isLoading}>
                    <Button className="action-button">
                      <div style={{ marginRight: 10 }}>Thao tác</div>
                      <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              )}

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
              {filters &&
                filters.map((filter: any, index: any) => {
                  return (
                    <Tag
                      key={index}
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
        </StyledProductFilter>

        <CustomTable
          bordered
          isRowSelection={allowProductsConnect}
          isLoading={isLoading}
          onSelectedChange={onSelectTableRow}
          columns={columns}
          dataSource={variantData.items}
          scroll={{ x: 1080 }}
          sticky={{ offsetScroll: 10, offsetHeader: OFFSET_HEADER_UNDER_NAVBAR }}
          pagination={{
            pageSize: variantData.metadata && variantData.metadata.limit,
            total: variantData.metadata && variantData.metadata.total,
            current: variantData.metadata && variantData.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          rowKey={(data) => data.id}
        />

        {allowProductsConnect && (
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
        )}
      </Card>

      {isVisibleConfirmConnectItemsModal && (
        <ConfirmConnectProductModal
          isVisible={isVisibleConfirmConnectItemsModal}
          isLoading={isLoading}
          dataSource={diffPriceProductList}
          okConfirmConnectModal={connectedYodyProducts}
          cancelConfirmConnectModal={() => setIsVisibleConfirmConnectItemsModal(false)}
        />
      )}

      {/* Import customer file */}
      {isVisibleConcatenateByExcelModal && (
        <ConcatenateByExcel
          onCancelConcatenateByExcel={onCancelConcatenateByExcel}
          onOkConcatenateByExcel={onOkConcatenateByExcel}
        />
      )}

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
            <Radio value={EXPORT_PRODUCT_OPTION.SELECTED} disabled={selectedRow.length <= 0}>
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
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 15 }}>Đang tạo file, vui lòng đợi trong giây lát</div>
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
            <div style={{ fontSize: 14 }}>
              Hệ thống sẽ dừng việc tải sản phẩm, bạn vẫn có thể tải lại sau nếu muốn.
            </div>
          </div>
        </div>
      </Modal>
    </StyledComponent>
  );
};

export default NotConnectedItems;
