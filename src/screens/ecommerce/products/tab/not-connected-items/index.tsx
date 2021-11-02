import React, { useState, useMemo, createRef } from "react";
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
} from "antd";
import { SearchOutlined } from "@ant-design/icons";

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
} from "domain/actions/ecommerce/ecommerce.actions";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";

import ConfirmConnectProductModal from "./ConfirmConnectProductModal";

import circleDeleteIcon from "assets/icon/circle-delete.svg";
import filterIcon from "assets/icon/filter.svg";
import saveIcon from "assets/icon/save.svg";
import closeIcon from "assets/icon/X_close.svg";
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import imgdefault from "assets/icon/img-default.svg";

import {
  StyledComponent,
  StyledProductListDropdown,
  StyledYodyProductColumn,
} from "./styles";
import { StyledProductConnectStatus, StyledProductFilter } from "screens/ecommerce/products/styles";


type NotConnectedItemsProps = {
  variantData: any;
  getProductUpdated: any;
  tableLoading: any;
};

const NotConnectedItems: React.FC<NotConnectedItemsProps> = (
  props: NotConnectedItemsProps
) => {
  const { variantData, getProductUpdated, tableLoading } = props;
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;
  const history = useHistory();

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [diffPriceProductList, setDiffPriceProductList] = useState<Array<any>>([]);
  const [isVisibleConfirmConnectItemsModal, setIsVisibleConfirmConnectItemsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [idDeleteItem, setIdDeleteItem] = useState(null);

  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);

  let tempConnectItemList: any[] = [];
  let notMatchConnectItemList: any[] = [];
  const [connectItemList, setConnectItemList] = useState<Array<any>>([]);
  let notMatchSelectedRow: any[] = [];
  const [selectedRow, setSelectedRow] = useState<Array<any>>([]);

  const [connectedYodyProductsRequest, setConnectedYodyProductsRequest] = useState<any>({
    variants: null
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


  const reloadPage = () => {
    getProductUpdated(query);
  };

  //handle delete item
  const handleDeleteItem = (item: any) => {
    setIsShowDeleteItemModal(true);
    setIdDeleteItem(item.id);
  };

  const cancelDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);
  };

  const okDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);

    if (idDeleteItem) {
      dispatch(
        deleteEcommerceItem([idDeleteItem], (result) => {
          if (result) {
            showSuccess("Xóa sản phẩm thành công");
            reloadPage();
          }
        })
      );
    }
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

    const [keySearchVariant, setKeySearchVariant] = useState("");
    const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
    const [diffPriceProduct, setDiffPriceProduct] = useState<Array<any>>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isVisibleConfirmConnectModal, setIsVisibleConfirmConnectModal] = useState(false);
    const [productSelected, setProductSelected] = useState<any>();


    // handle save single connected Yody product
    const saveConnectYodyProduct = () => {
      const newConnectItemList =
        copyConnectItemList &&
        copyConnectItemList.filter((item: any) => {
          return item.core_variant_id !== productSelected.id;
        });

      const connectProductSelected = {
        id: ecommerceItem.id,
        core_variant_id: productSelected.id,
        core_sku: productSelected.sku,
        core_variant: productSelected.core_variant,
        core_price: productSelected.retail_price,
        core_product_id: productSelected.product_id,
        ecommerce_correspond_to_core: 1,
      };

      updateConnectItemList(newConnectItemList);
      const request = {
        variants: [connectProductSelected],
      };

      setIsSaving(true);
      dispatch(
        putConnectEcommerceItem(request, (result) => {
          setIsVisibleConfirmConnectModal(false);
          setIsSaving(false);
          if (result) {
            setProductSelected(null);
            showSuccess("Ghép nối sản phẩm thành công");
            reloadPage();
          } else {
            showError("Ghép nối sản phẩm thất bại");
          }
        })
      );
    };

    const handleSaveConnectYodyProduct = () => {
      if (ecommerceItem?.ecommerce_price === productSelected?.retail_price) {
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
        sku: itemSelected && itemSelected.sku,
        variant_prices: itemSelected && itemSelected.variant_prices,
        retail_price:
          itemSelected &&
          itemSelected.variant_prices &&
          itemSelected.variant_prices[0] &&
          itemSelected.variant_prices[0].retail_price,
        id: itemSelected && itemSelected.id,
        product_id: itemSelected && itemSelected.product_id,
      };

      setProductSelected(productSelectedData);

      const connectItem = {
        id: ecommerceItem.id,
        core_variant_id: productSelectedData.id,
        core_sku: productSelectedData.sku,
        core_variant: productSelectedData.core_variant,
        core_price: productSelectedData.retail_price,
        core_product_id: productSelectedData.product_id,
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
          <div>
            <ul>
              <li>
                <b>Tên sản phẩm: </b>
                <span>
                  <Link
                    target="_blank"
                    to={`${UrlConfig.PRODUCT}/${productSelected.product_id}/variants/${productSelected.id}`}
                  >
                    {productSelected.core_variant}
                  </Link>
                </span>
              </li>

              <li>
                <b>SKU: </b>
                <span style={{ color: "#737373" }}>{productSelected.sku}</span>
              </li>

              <li>
                <b>Giá bán: </b>
                <span>
                  {`${findPrice(
                    productSelected.variant_prices,
                    AppConfig.currency
                  )} `}
                  <span className="item-price-unit">đ</span>
                </span>
              </li>
            </ul>

            <div className="button">
              <Button
                type="primary"
                onClick={handleSaveConnectYodyProduct}
                loading={!isVisibleConfirmConnectModal && isSaving}
              >
                Lưu
              </Button>

              <Button
                disabled={isSaving}
                onClick={() => cancelConnectYodyProduct(productSelected.id)}
              >
                Hủy
              </Button>
            </div>
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
      </StyledYodyProductColumn>
    );
  };

  const [columns] = useState<any>([
    {
      title: "Ảnh",
      visible: true,
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
      visible: true,
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
      visible: true,
      width: "250px",
      render: (item: any, v: any, i: any) => {
        return <div>{item.ecommerce_variant}</div>;
      },
    },
    {
      title: "Giá bán (Sàn)",
      visible: true,
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
      visible: true,
      render: (l: any, v: any, i: any) =>
        RenderProductColumn(l, [...tempConnectItemList], updateConnectItemList),
    },
    {
      title: "Ghép nối",
      visible: true,
      align: "center",
      width: "150px",
      render: (item: any, v: any, i: any) => {
        return (
          <StyledProductConnectStatus>
            {item.connect_status === "waiting" && (
              <span className="not-connect-status">Chưa ghép nối</span>
            )}
          </StyledProductConnectStatus>
        );
      },
    },
    {
      width: "60px",
      render: (l: any, v: any, i: any) => {
        return (
          <img
            src={closeIcon}
            className="delete-item-icon"
            alt=""
            onClick={() => handleDeleteItem(l)}
          />
        );
      },
    },
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
      getProductUpdated({ ...query });
      window.scrollTo(0, 0);
    },
    [query, getProductUpdated]
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

  const ECOMMERCE_LIST = [
    {
      title: "Sàn Shopee",
      icon: shopeeIcon,
      id: "shopee",
      ecommerce_id: 1,
    },
    {
      title: "Sàn Tiki",
      icon: tikiIcon,
      id: "tiki",
      ecommerce_id: 2,
    },
    {
      title: "Sàn Lazada",
      icon: lazadaIcon,
      id: "lazada",
      ecommerce_id: 3,
    },
    {
      title: "Sàn Sendo",
      icon: sendoIcon,
      id: "sendo",
      isActive: false,
      ecommerce_id: 4,
    },
  ];

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

  const connectedYodyProducts = () => {
    setIsLoading(true);
    dispatch(
      putConnectEcommerceItem(connectedYodyProductsRequest, (result) => {
        setIsVisibleConfirmConnectItemsModal(false);
        setIsLoading(false);
        if (result) {
          setConnectItemList(notMatchConnectItemList);
          tempConnectItemList = notMatchConnectItemList;
          setSelectedRow(notMatchSelectedRow);

          showSuccess("Ghép nối sản phẩm thành công");
          history.replace(`${history.location.pathname}#connected-item`);
        } else {
          showError("Ghép nối sản phẩm thất bại");
        }
      })
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
          (item) => item.id !== rowData.id
        );
        if (rowMatch) {
          notMatchSelectedRow.push(rowData);
        }
      });
    }

    if (isSaveAble && yodyProductConnectCheck.length === 0) {
      showError("Vui lòng chọn sản phẩm (Yody) để ghép nối");
      isSaveAble = false;
    }

    if (isSaveAble) {
      const request = {
        variants: yodyProductConnectCheck,
      };

      setConnectedYodyProductsRequest(request);

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
                      src={shopeeIcon}
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
  const onSelectTable = React.useCallback((selectedRow: Array<any>) => {
    setSelectedRow(selectedRow);
  }, []);

  return (
    <StyledComponent>
      <Card>
        <StyledProductFilter>
          <div className="filter">
            <Form form={formAdvance} onFinish={onSearch} initialValues={initialFormValues}>
              <Form.Item name="ecommerce_id" className="select-channel-dropdown">
                <Select
                  showSearch
                  disabled={tableLoading}
                  placeholder="Chọn sàn"
                  allowClear
                  onSelect={(value) => handleSelectEcommerce(value)}
                  onClear={removeEcommerce}
                >
                  {ECOMMERCE_LIST &&
                    ECOMMERCE_LIST.map((item: any) => (
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
                    ))}
                </Select>
              </Form.Item>

              <Form.Item className="select-store-dropdown">
                {isEcommerceSelected && (
                  <Select
                    showSearch
                    disabled={tableLoading || !isEcommerceSelected}
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
                      dropdownRender={() => renderShopList(false)}
                      onClear={removeSelectedShop}
                    />
                  </Tooltip>
                )}
              </Form.Item>

              <Form.Item name="sku_or_name_ecommerce" className="shoppe-search">
                <Input
                  disabled={tableLoading}
                  prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                  placeholder="SKU, tên sản phẩm sàn"
                />
              </Form.Item>

              <Form.Item className="filter-item">
                <Button type="primary" htmlType="submit" disabled={tableLoading}>
                  Lọc
                </Button>
              </Form.Item>

              <Form.Item className="filter-item">
                <Button onClick={openFilter} disabled={tableLoading}>
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
                  {ECOMMERCE_LIST &&
                    ECOMMERCE_LIST.map((item: any) => (
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
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                className="select-store-dropdown"
                label={<b>CHỌN GIAN HÀNG</b>}
              >
                {isEcommerceSelected && (
                  <Select
                    showSearch
                    disabled={tableLoading || !isEcommerceSelected}
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
          isRowSelection
          isLoading={tableLoading}
          onSelectedChange={onSelectTable}
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

        <Button
          style={{ margin: "20px 0" }}
          type="primary"
          onClick={handleConnectedYodyProducts}
          disabled={disableSaveConnectedYodyProduct()}
          size="large"
          icon={<img src={saveIcon} style={{ marginRight: 10 }} alt="" />}
        >
          Lưu các cặp đã chọn
        </Button>
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
