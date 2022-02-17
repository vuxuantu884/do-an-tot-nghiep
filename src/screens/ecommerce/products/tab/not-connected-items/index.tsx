import React, { useState, useMemo, createRef, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { RefSelectProps } from "antd/lib/select";
import {
  Button,
  Form,
  Select,
  Input,
  Modal,
  Tooltip,
  AutoComplete,
  Checkbox,
  Card,
  Dropdown,
  Menu,
} from "antd";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";

import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";



import CustomTable from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter";
import { showError, showSuccess } from "utils/ToastUtils";
import { findAvatar, findPrice, formatCurrency } from "utils/AppUtils";

import { ProductEcommerceQuery } from "model/query/ecommerce.query";
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
  // postSyncStockEcommerceProduct,
} from "domain/actions/ecommerce/ecommerce.actions";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";

import ConfirmConnectProductModal from "screens/ecommerce/products/tab/not-connected-items/ConfirmConnectProductModal";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import ResultConnectProductModal from "screens/ecommerce/products/tab/not-connected-items/ResultConnectProductModal";

import circleDeleteIcon from "assets/icon/circle-delete.svg";
import filterIcon from "assets/icon/filter.svg";
import saveIcon from "assets/icon/save.svg";
import imgdefault from "assets/icon/img-default.svg";

import {
  StyledComponent,
  StyledProductListDropdown,
  StyledYodyProductColumn,
} from "screens/ecommerce/products/tab/not-connected-items/styles";
import { StyledProductFilter } from "screens/ecommerce/products/styles";
import { StyledStatus } from "screens/ecommerce/common/commonStyle";
import { ECOMMERCE_LIST, getEcommerceIcon } from "screens/ecommerce/common/commonAction";
import ConnectedItemActionColumn from "../connected-items/ConnectedItemActionColumn";

const productsDeletePermission = [EcommerceProductPermission.products_delete];
const productsConnectPermission = [EcommerceProductPermission.products_update];

let connectedYodyProductsRequest: object;

type NotConnectedItemsPropsType = {
  isReloadPage: boolean;
};

const NotConnectedItems: React.FC<NotConnectedItemsPropsType> = (props: NotConnectedItemsPropsType) => {
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;
  const history = useHistory();

  const {isReloadPage} = props;

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

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [diffPriceProductList, setDiffPriceProductList] = useState<Array<any>>([]);
  const [isVisibleConfirmConnectItemsModal, setIsVisibleConfirmConnectItemsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [idsItemSelected, setIdsItemSelected] = useState<Array<any>>([]);



  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);

  let tempConnectItemList: any[] = [];
  let notMatchConnectItemList: any[] = [];
  const [connectItemList, setConnectItemList] = useState<Array<any>>([]);
  let notMatchSelectedRow: any[] = [];
  const [selectedRow, setSelectedRow] = useState<Array<any>>([]);

  const [isShowResultConnectProductModal, setIsShowResultConnectProductModal] = useState(false);
  const [connectProductData, setConnectProductData] = useState<any>({
    total: 0,
    success_total: 0,
    error_total: 0,
    error_list: []
  });

  const initialFormValues: ProductEcommerceQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      ecommerce_id: null,
      shop_ids: [],
      connect_status: "waiting",
      update_stock_status: null,
      sku_or_name_core: "",
      sku_or_name_ecommerce: "",
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
    sku_or_name_core: "",
    sku_or_name_ecommerce: "",
    connected_date_from: null,
    connected_date_to: null,
  });


  const updateVariantData = useCallback((result: PageResponse<any> | false) => {
    setIsLoading(false);
    if (!!result) {
      setVariantData(result);
    }
  }, []);

  const getProductUpdated = useCallback((queryRequest: any) => {
    setIsLoading(true);
    dispatch(getProductEcommerceList(queryRequest, updateVariantData));
  }, [dispatch, updateVariantData]);

  useEffect(() => {
    window.scrollTo(0, 0);
    getProductUpdated(query);
  }, [getProductUpdated, query, isReloadPage]);

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

    const [keySearchVariant, setKeySearchVariant] = useState("");
    const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
    const [diffPriceProduct, setDiffPriceProduct] = useState<Array<any>>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisibleConfirmConnectModal, setIsVisibleConfirmConnectModal] = useState(false);
    const [isShowResultConnectionModal, setIsShowResultConnectionModal] = useState(false);
    const [resultConnectionData, setResultConnectionData] = useState<any>({
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
      history.replace(`${history.location.pathname}#connected-item`);
    };

    const updateNotConnectedProductList = useCallback((data) => {
      setIsSaving(false);
      setIsVisibleConfirmConnectModal(false);

      if (data) {
        setProductSelected(null);
        setResultConnectionData(data);
        setIsShowResultConnectionModal(true);
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
      dispatch(
        searchVariantsOrderRequestAction(initQueryVariant, updateProductResult)
      );
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
                src={avatar === "" ? imgdefault : avatar}
                alt="anh"
                placeholder={imgdefault}
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
                  <span
                    style={{ color: item.inventory > 0 ? "#2A2A86" : "red" }}
                  >
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
      resultSearchVariant.items.forEach(
        (item: VariantResponse, index: number) => {
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
            notFoundContent={
              keySearchVariant.length >= 3
                ? "Không tìm thấy sản phẩm"
                : undefined
            }
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

  const [columns] = useState<any>([
    {
      title: "Ảnh",
      align: "center",
      width: "70px",
      render: (item: any, v: any, i: any) => {
        return (
          <img
            src={item.ecommerce_image_url}
            style={{ height: "40px" }}
            alt=""
          ></img>
        );
      },
    },
    {
      title: "Sku/ itemID (Sàn)",
      width: "150px",
      render: (item: any, v: any, i: any) => {
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
      width: "250px",
      render: (item: any, v: any, i: any) => {
        return <div>{item.ecommerce_variant}</div>;
      },
    },
    {
      title: "Giá bán (Sàn)",
      align: "center",
      width: "90px",
      render: (item: any, v: any, i: any) => {
        return (
          <span>
            {item.ecommerce_price ? formatCurrency(item.ecommerce_price) : "-"}
          </span>
        );
      },
    },
    {
      title: "Sản phẩm (Yody)",
      render: (item: any, row: any, index: any) => RenderProductColumn(item, [...tempConnectItemList], updateConnectItemList)
    },
    {
      title: "Ghép nối",
      align: "center",
      width: "150px",
      render: (item: any, v: any, i: any) => {
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

  const onSearch = (value: ProductEcommerceQuery) => {
    if (value) {
      value.shop_ids = shopIdSelected;

      query.ecommerce_id = value.ecommerce_id;
      query.shop_ids = value.shop_ids;
      query.connect_status = "waiting";
      query.update_stock_status = value.update_stock_status;
      query.sku_or_name_ecommerce = value.sku_or_name_ecommerce;
      query.sku_or_name_core = value.sku_or_name_core;
      query.connected_date_from = value.connected_date_from;
      query.connected_date_to = value.connected_date_to;
    }

    const querySearch: ProductEcommerceQuery = { ...query };
    getProductUpdated(querySearch);
  };

  const onPageChange = React.useCallback(
    (page, limit) => {
      query.page = page;
      query.limit = limit;
      setQuery({ ...query, page, limit });
      window.scrollTo(0, 0);
    },
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
    setIsEcommerceSelected(true);
    setShopIdSelected([]);
    getEcommerceShop(ecommerceId);
  };

  const removeEcommerce = () => {
    setIsEcommerceSelected(false);
    setShopIdSelected([]);
  };
  //end handle select ecommerce

  // handle filter
  const onFilterClick = React.useCallback(() => {
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance]);

  const onClearBaseFilter = React.useCallback(() => {
    removeEcommerce();
    setVisibleFilter(false);

    formAdvance.setFieldsValue(initialFormValues);
    formAdvance.submit();
  }, [formAdvance, initialFormValues]);

  const openFilter = React.useCallback(() => {
    setVisibleFilter(true);
  }, []);

  const onCancelFilter = React.useCallback(() => {
    setVisibleFilter(false);
  }, []);
  //end handle filter

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
      setConnectProductData(data);
      setIsShowResultConnectProductModal(true);
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
      showError("Vui lòng chọn sản phẩm (Yody) để ghép nối");
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

  // handle select shop
  const getPlaceholderSelectShop = () => {
    if (shopIdSelected && shopIdSelected.length > 0) {
      return `Đã chọn: ${shopIdSelected.length} gian hàng`;
    } else {
      return "Chọn gian hàng";
    }
  };

  const onCheckedChange = (shop: any, e: any) => {
    if (e.target.checked) {
      shop.isSelected = true;
      const shopSelected = [...shopIdSelected];
      shopSelected.push(shop.id);
      setShopIdSelected(shopSelected);
    } else {
      shop.isSelected = false;
      const shopSelected =
        shopIdSelected &&
        shopIdSelected.filter((item: any) => {
          return item !== shop.id;
        });
      setShopIdSelected(shopSelected);
    }
  };

  const renderShopList = (isNewFilter: any) => {
    return (
      <StyledProductFilter>
        <div className="render-shop-list">
          {ecommerceShopList.map((item: any) => (
            <div key={item.id} className="shop-name">
              <Checkbox
                onChange={(e) => onCheckedChange(item, e)}
                checked={item.isSelected}
              >
                <span className="check-box-name">
                  <span>
                    <img
                      src={getEcommerceIcon(item.ecommerce)}
                      alt={item.id}
                      style={{ marginRight: "5px", height: "16px" }}
                    />
                  </span>
                  <Tooltip title={item.name} color="#1890ff" placement="right">
                    <span
                      className="name"
                      style={isNewFilter ? { width: 270 } : { width: 130 }}
                    >
                      {item.name}
                    </span>
                  </Tooltip>
                </span>
              </Checkbox>
            </div>
          ))}

          {ecommerceShopList.length === 0 && (
            <div style={{ color: "#737373", padding: 10 }}>
              Không có dữ liệu
            </div>
          )}
        </div>
      </StyledProductFilter>
    );
  };

  const removeSelectedShop = () => {
    const copyEcommerceShopList = [...ecommerceShopList];
    copyEcommerceShopList.forEach((item: any) => {
      item.isSelected = false;
    });

    setEcommerceShopList(copyEcommerceShopList);
    setShopIdSelected([]);
  };
  // end handle select shop

  //select row table
  const onSelectTableRow = React.useCallback((selectedRow: Array<any>) => {
    const newSelectedRow = selectedRow.filter((row: any) => {
      return row !== undefined;
    });
    setSelectedRow(newSelectedRow);
  }, []);

  const closeResultConnectProductModal = () => {
    setIsShowResultConnectProductModal(false);
    history.replace(`${history.location.pathname}#connected-item`);
  };


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

  const handleSuggestItem = () => {
    reloadPage()
  }

  const actionList = (
    <Menu>
      {allowProductsDelete &&
        <Menu.Item key="2" disabled={isDisableAction()}>
          <span onClick={handleDeleteItemsSelected}>Xóa sản phẩm lấy về</span>
        </Menu.Item>
      }
      <Menu.Item key="3">
        <span onClick={handleSuggestItem}>Gợi ý ghép nối</span>
      </Menu.Item>
    </Menu>
  )


  return (
    <StyledComponent>
      <Card>
        <StyledProductFilter>
          <div className="filter">
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

              <Form.Item name="ecommerce_id" className="select-channel-dropdown">
                <Select
                  showSearch
                  disabled={isLoading}
                  placeholder="Chọn sàn"
                  allowClear
                  onSelect={(value) => handleSelectEcommerce(value)}
                  onClear={removeEcommerce}
                >
                  {
                    ECOMMERCE_LIST?.map((item: any) => (
                      <Option key={item.ecommerce_id} value={item.ecommerce_id}>
                        <div>
                          <img
                            src={item.icon}
                            alt={item.id}
                            style={{ marginRight: "10px" }}
                          />
                          <span>{item.title}</span>
                        </div>
                      </Option>
                    ))
                  }
                </Select>
              </Form.Item>

              <Form.Item className="select-store-dropdown">
                {isEcommerceSelected && (
                  <Select
                    showSearch
                    disabled={isLoading || !isEcommerceSelected}
                    placeholder={getPlaceholderSelectShop()}
                    allowClear={shopIdSelected && shopIdSelected.length > 0}
                    dropdownRender={() => renderShopList(false)}
                    onClear={removeSelectedShop}
                  />
                )}

                {!isEcommerceSelected && (
                  <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                    <Select
                      showSearch
                      disabled={true}
                      placeholder={getPlaceholderSelectShop()}
                      allowClear={shopIdSelected && shopIdSelected.length > 0}
                      dropdownRender={() => renderShopList(false)}
                      onClear={removeSelectedShop}
                    />
                  </Tooltip>
                )}
              </Form.Item>

              <Form.Item name="sku_or_name_ecommerce" className="shoppe-search">
                <Input
                  disabled={isLoading}
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="SKU, tên sản phẩm sàn"
                />
              </Form.Item>

              <Form.Item className="filter-item">
                <Button type="primary" htmlType="submit" disabled={isLoading}>
                  Lọc
                </Button>
              </Form.Item>

              <Form.Item className="filter-item">
                <Button onClick={openFilter} disabled={isLoading}>
                  <img src={filterIcon} style={{ marginRight: 10 }} alt="" />
                  <span>Thêm bộ lọc</span>
                </Button>
              </Form.Item>
            </Form>
          </div>

          <BaseFilter
            onClearFilter={onClearBaseFilter}
            onFilter={onFilterClick}
            onCancel={onCancelFilter}
            visible={visibleFilter}
            width={400}
          >
            <Form
              form={formAdvance}
              onFinish={onSearch}
              //ref={formRef}
              initialValues={initialFormValues}
              layout="vertical"
            >
              <Form.Item name="ecommerce_id" label={<b>CHỌN SÀN</b>}>
                <Select
                  showSearch
                  placeholder="Chọn sàn"
                  allowClear
                  onSelect={(value) => handleSelectEcommerce(value)}
                  onClear={removeEcommerce}
                >
                  {
                    ECOMMERCE_LIST?.map((item: any) => (
                      <Option key={item.ecommerce_id} value={item.ecommerce_id}>
                        <div>
                          <img
                            src={item.icon}
                            alt={item.id}
                            style={{ marginRight: "10px" }}
                          />
                          <span>{item.title}</span>
                        </div>
                      </Option>
                    ))
                  }
                </Select>
              </Form.Item>

              <Form.Item
                className="select-store-dropdown"
                label={<b>CHỌN GIAN HÀNG</b>}
              >
                {isEcommerceSelected && (
                  <Select
                    showSearch
                    disabled={isLoading || !isEcommerceSelected}
                    placeholder={getPlaceholderSelectShop()}
                    allowClear={shopIdSelected && shopIdSelected.length > 0}
                    dropdownRender={() => renderShopList(true)}
                    onClear={removeSelectedShop}
                  />
                )}

                {!isEcommerceSelected && (
                  <Tooltip title="Yêu cầu chọn sàn" color={"blue"}>
                    <Select
                      showSearch
                      disabled={true}
                      placeholder={getPlaceholderSelectShop()}
                      allowClear={shopIdSelected && shopIdSelected.length > 0}
                      dropdownRender={() => renderShopList(true)}
                      onClear={removeSelectedShop}
                    />
                  </Tooltip>
                )}
              </Form.Item>

            </Form>
          </BaseFilter>
        </StyledProductFilter>

        <CustomTable
          bordered
          isRowSelection={allowProductsConnect}
          isLoading={isLoading}
          onSelectedChange={onSelectTableRow}
          columns={columns}
          dataSource={variantData.items}
          scroll={{ x: 1100 }}
          sticky={{ offsetScroll: 10, offsetHeader: 55 }}
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

      <ResultConnectProductModal
        visible={isShowResultConnectProductModal}
        onCancel={closeResultConnectProductModal}
        onOk={closeResultConnectProductModal}
        connectProductData={connectProductData}
      />

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

    </StyledComponent>
  );
};

export default NotConnectedItems;
