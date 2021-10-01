/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect, useMemo, createRef } from "react";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { RefSelectProps } from "antd/lib/select";
import { Button, Form, Select, Input, Modal, Tooltip, AutoComplete } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import { AppConfig } from "config/app.config";

import CustomTable from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter"
import { showError, showSuccess,} from "utils/ToastUtils";
import {
  findAvatar,
  findPrice,
  formatCurrency
} from "utils/AppUtils";

import { ProductEcommerceQuery } from "model/query/ecommerce.query";
import { PageResponse } from "model/base/base-metadata.response";
import {
  VariantResponse,
  VariantSearchQuery,
} from "model/product/product.model";

import {
  getProductEcommerceList,
  getShopEcommerceList,
  deleteEcommerceItem,
  putConnectEcommerceItem
 } from "domain/actions/ecommerce/ecommerce.actions";

import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";

import circleDeleteIcon from "assets/icon/circle-delete.svg"
import filterIcon from "assets/icon/filter.svg"
import saveIcon from "assets/icon/save.svg"
import closeIcon from "assets/icon/X_close.svg"
import deleteIcon from "assets/icon/deleteIcon.svg"
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";
import imgdefault from "assets/icon/img-default.svg";

import { StyledComponent, StyledProductListDropdown, StyledYodyProductColumn } from "./styles";

  
type NotConnectedItemsProps = {
  categoryList?: Array<any>
};

const NotConnectedItems: React.FC<NotConnectedItemsProps> = (
  props: NotConnectedItemsProps
) => {

  const { categoryList } = props;
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;
  const history = useHistory();

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [idDeleteItem, setIdDeleteItem] = useState(null);
   
  const [variantData, setVariantData] = useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const [isEcommerceSelected, setIsEcommerceSelected] = useState(false);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState(null);

  const [connectItemList, setConnectItemList] = useState<Array<any>>([]);

  const params: ProductEcommerceQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      ecommerce_id: null,
      shop_id: null,
      category_id: null,
      connect_status: null,
      update_stock_status: null,
      sku_or_name_core: "",
      sku_or_name_ecommerce: "",
    }),
    []
  );

  const [query, setQuery] = useState<ProductEcommerceQuery>({
    page: 1,
    limit: 30,
    ecommerce_id: null,
    shop_id: null,
    category_id: null,
    connect_status: null,
    update_stock_status: null,
    sku_or_name_core: "",
    sku_or_name_ecommerce: "",
  });

  const updateVariantData = React.useCallback((result: PageResponse<any> | false) => {
    if (!!result) {
      setVariantData(result);
    }
  }, []);

  useEffect(() => {
    dispatch(getProductEcommerceList(query, updateVariantData));
  }, [dispatch, query, updateVariantData]);
 
  const reloadPage = () => {
    dispatch(getProductEcommerceList(query, setVariantData));
  }


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
      dispatch(deleteEcommerceItem([idDeleteItem], (result) => {
        if (result) {
          showSuccess("Xóa sản phẩm thành công");
          reloadPage();
        }
      }));
    }
  };


  const renderProductColumn = (item: any, connectItemList: Array<any>, setConnectItemList: Function) => {
    const autoCompleteRef = createRef<RefSelectProps>();

    const [keySearchVariant, setKeySearchVariant] = React.useState("");
    const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
    const [productSelected, setProductSelected] = useState<any>();
    

    const saveYodyProduct = (itemId: any) => {  
      const newConnectItemList = connectItemList && connectItemList.filter((item: any) => {
        return item.core_variant_id !== itemId;
      });

      const connectProductSelected = {
        id: item.id,
        core_variant_id: productSelected.id,
        core_sku: productSelected.sku,
        core_variant: productSelected.name,
        core_price: productSelected.retail_price,
        ecommerce_correspond_to_core: 1,
      }
  
      setProductSelected(null);
      setConnectItemList(newConnectItemList);
      const request = {
        variants: [connectProductSelected]
      }

      dispatch(
        putConnectEcommerceItem(request, (result) => {
          if (result) {
            showSuccess("Ghép nối sản phẩm thành công");
            reloadPage();
            history.replace(`${history.location.pathname}#connected-item`)
          } else {
            showError("Ghép nối sản phẩm thất bại");
          }
        })
      );
    }
    
    const cancelYodyProduct = (itemId: any) => {
      const newConnectItemList = connectItemList && connectItemList.filter((item: any) => {
        return item.core_variant_id !== itemId;
      });
  
      setConnectItemList(newConnectItemList);
      setProductSelected(null);
    }

    const onInputSearchProductFocus = () => {
      setIsInputSearchProductFocus(true);
    };

    const onInputSearchProductBlur = () => {
      setIsInputSearchProductFocus(false);
    };

    const initQueryVariant: VariantSearchQuery = {
      limit: 10,
      page: 1,
      status: "active",
      saleable: true,
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
        const itemSelected = resultSearchVariant && resultSearchVariant.items && resultSearchVariant.items.find(item => item.id === idItemSelected);

        const productSelectedData = {
          name: itemSelected && itemSelected.name,
          sku: itemSelected && itemSelected.sku,
          retail_price: itemSelected && itemSelected.variant_prices && itemSelected.variant_prices[0] && itemSelected.variant_prices[0].retail_price,
          id: itemSelected && itemSelected.id,
          product_id: itemSelected && itemSelected.product_id,
        }

        setProductSelected(productSelectedData);

        const connectItem = {
          id: item.id,
          core_variant_id: productSelectedData.id,
          core_sku: productSelectedData.sku,
          core_variant: productSelectedData.name,
          core_price: productSelectedData.retail_price,
          ecommerce_correspond_to_core: 1,
        }

        const newConnectItems = [...connectItemList];
        newConnectItems.push(connectItem);
        
        setConnectItemList(newConnectItems);
        setIsInputSearchProductFocus(false);
        setKeySearchVariant("");
        autoCompleteRef.current?.blur();
      }

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
                  <span className="item-name">
                    {item.name}
                  </span>

                  <span>
                    {`${findPrice(item.variant_prices, AppConfig.currency)} `}
                    <span className="item-price-unit">đ</span>
                  </span>

                </div>

                <div className="sku-and-stock">
                  <span className="item-sku">
                    {item.sku}
                  </span>

                  <span className="item-inventory">
                    {"Có thể bán: "}
                    <span style={{color: item.inventory > 0 ? "#2A2A86" : "red"}}>
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
        {(!productSelected || !productSelected.id) &&
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
            dropdownRender={(menu) => (
              <div>
                {menu}
              </div>
            )}
          >
            <Input
              style={{ width: 230 }}
              placeholder="SKU, tên sản phẩm Yody"
              prefix={<SearchOutlined style={{ color: "#ABB4BD" }} />}
            />
          </AutoComplete>
        }

        {productSelected && productSelected.id &&
          <div>
            <ul>
              <li>
                <b>Tên sản phẩm: </b>
                <Link to={`${UrlConfig.PRODUCT}/${productSelected.product_id}/variants/${productSelected.id}`}>
                  {productSelected.name}
                </Link>
              </li>

              <li>
                <b>SKU: </b>
                <span style={{color: "#737373"}}>{productSelected.sku}</span>
              </li>
              
              <li>
                <b>Giá bán: </b>
                <span>{formatCurrency(productSelected.retail_price)}</span>
              </li>
            </ul>

            <div className="button">
              <Button type="primary" onClick={() => saveYodyProduct(productSelected.id)}>
                Lưu
              </Button>

              <Button onClick={() => cancelYodyProduct(productSelected.id)}>
                Hủy          
              </Button>
            </div>
          </div>
        }
        
      </StyledYodyProductColumn>
    );
  }
  

  const [columns] = useState<any>([
    {
      title: "Ảnh",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return <img src={l.ecommerce_image_url} style={{height: "40px", width: "30px"}} alt=""></img>;
      },
    },
    {
      title: "Sku/ itemID (Shopee)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            <div>{l.ecommerce_sku}</div>
            <div style={{color: "#737373"}}>{l.ecommerce_product_id}</div>
            <div style={{color: "#737373"}}>({l.ecommerce_variant_id})</div>
            <div style={{color: "#2a2a86"}}>(YODY Việt Nam)</div>
          </div>
        )
      },
    },
    {
      title: "Sản phẩm (Shopee)",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            <div>{l.ecommerce_variant}</div>
            <div>{l.ecommerce_sku}</div>
          </div>
        );
      },
    },
    {
      title: "Giá bán (Shopee)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>{l.ecommerce_price ? formatCurrency(l.ecommerce_price) : "-"}</span>
        );
      },
    },
    {
      title: "Sản phẩm (YODY)",
      visible: true,
      render: (l: any, v: any, i: any) => renderProductColumn(l, connectItemList, setConnectItemList)
    },
    {
      title: "Ghép nối",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            {l.connect_status === "connected" &&
              <span style={{color: '#27AE60'}}>Thành công</span>
            }
            {l.connect_status === "error" &&
              <Tooltip title="error">
                <span style={{color: '#E24343'}}>Thất bại</span>
              </Tooltip>
            }
            {l.connect_status === "waiting" &&
              <span style={{color: '#FFA500'}}>Đang xử lý</span>
            }
          </div>
        );
      },
    },
    {
      render: (l: any, v: any, i: any) => {
        return (
          <img
            src={closeIcon}
            className="delete-item-icon"
            alt=""
            onClick={() => handleDeleteItem(l)}
          />
        )
      }
    }
    
  ]);

  const variantNotConnectedItem = variantData && variantData.items && variantData.items.filter((item: any) => {
    return item.connect_status !== "connected";
  });

  const onSearch = (value: ProductEcommerceQuery) => {
    if (value) {
      value.shop_id = shopIdSelected;
      query.ecommerce_id = value.ecommerce_id;
      query.shop_id = value.shop_id;
      query.category_id = value.category_id;
      query.connect_status = value.connect_status;
      query.update_stock_status = value.update_stock_status;
      query.sku_or_name_ecommerce = value.sku_or_name_ecommerce;
      query.sku_or_name_core = value.sku_or_name_core;
    }
    
    const querySearch: ProductEcommerceQuery = value;
    dispatch(getProductEcommerceList(querySearch, setVariantData));
  };

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },[query]
  );

  const updateEcommerceShopList = React.useCallback((result) => {
    setIsEcommerceSelected(true);
    setEcommerceShopList(result);
  }, []);

  const getShopEcommerce = (ecommerceId: any) => {
    setShopIdSelected(null);

    setIsEcommerceSelected(false);
    dispatch(getShopEcommerceList({ecommerce_id: ecommerceId}, updateEcommerceShopList));
  }

  const removeEcommerce = () => {
    setEcommerceShopList([]);
    setIsEcommerceSelected(false);
  }

  const selectShopEcommerce = (shop_id: any) => {
    setShopIdSelected(shop_id);
  }

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
    }
  ]

  const onFilterClick = React.useCallback(() => {
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance]);

  const onClearFilterAdvanceClick = React.useCallback(() => {
    formAdvance.setFieldsValue(params);
    setVisibleFilter(false);
    formAdvance.submit();
  }, [formAdvance, params]);

  const openFilter = React.useCallback(() => {
    setVisibleFilter(true);
  }, []);

  const onCancelFilter = React.useCallback(() => {
    setVisibleFilter(false);
  }, []);

  const savePairingConnectItems = () => {
    const request = {
      variants: connectItemList
    }
    dispatch(
      putConnectEcommerceItem(request, (result) => {
        if (result) {
          setConnectItemList([]);
          showSuccess("Ghép nối sản phẩm thành công");
          history.replace(`${history.location.pathname}#connected-item`)
        } else {
          showError("Ghép nối sản phẩm thất bại");
        }
      })
    );
  }

  return (
    <StyledComponent>
      <div className="not-connected-items">
        <div className="filter">
          <Form
            form={formAdvance}
            onFinish={onSearch}
            initialValues={params}
          >
            <Form.Item name="ecommerce_id" className="select-channel-dropdown">
              <Select
                showSearch
                placeholder="Chọn sàn"
                allowClear
                onSelect={(value) => getShopEcommerce(value)}
                onClear={removeEcommerce}
              >
                {ECOMMERCE_LIST &&
                  ECOMMERCE_LIST.map((item: any) => (
                    <Option key={item.ecommerce_id} value={item.ecommerce_id}>
                      <div>
                        <img src={item.icon} alt={item.id} style={{marginRight: "10px"}} />
                        <span>{item.title}</span>
                      </div>
                    </Option>
                  ))
                }
              </Select>
            </Form.Item>

            <Form.Item name="shop_id" className="select-store-dropdown">
               {!isEcommerceSelected &&
                <Tooltip title="Yêu cầu chọn sàn" color="#1890ff">
                  <Select
                    showSearch
                    placeholder="Chọn gian hàng"
                    allowClear
                    disabled={true}
                  />
                </Tooltip>
              }

              {isEcommerceSelected &&
                <Select
                  showSearch
                  placeholder="Chọn gian hàng"
                  allowClear
                  onSelect={(value) => selectShopEcommerce(value)}
                >
                  {ecommerceShopList &&
                    ecommerceShopList.map((shop: any) => (
                      <Option key={shop.id} value={shop.id}>
                        {shop.name}
                      </Option>
                    ))
                  }
                </Select>
              }
            </Form.Item>

            <Form.Item name="sku_or_name_ecommerce" className="shoppe-search">
              <Input
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, tên sản phẩm Shopee"
              />
            </Form.Item>

            <Form.Item className="filter-item">
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Form.Item>

            <Form.Item className="filter-item">
              <Button onClick={openFilter}>
                <img src={filterIcon} style={{ marginRight: 10 }} alt="" />
                <span>Thêm bộ lọc</span>
              </Button>
            </Form.Item>
          </Form>
        </div>

        <CustomTable
          isRowSelection
          columns={columns}
          dataSource={variantNotConnectedItem}
          pagination={{
            pageSize: variantData.metadata && variantData.metadata.limit,
            total: variantNotConnectedItem && variantNotConnectedItem.length,
            current: variantData.metadata && variantData.metadata.page,
            showSizeChanger: true,
            onChange: onPageChange,
            onShowSizeChange: onPageChange,
          }}
          rowKey={(data) => data.id}
        />

        <Button
          className="save-pairing-button"
          type="primary"
          onClick={savePairingConnectItems}
          disabled={connectItemList.length === 0}
          size="large"
          icon={<img src={saveIcon} style={{ marginRight: 10 }} alt="" />}
        >
          Lưu các cặp đã ghép
        </Button>

        <BaseFilter
          onClearFilter={onClearFilterAdvanceClick}
          onFilter={onFilterClick}
          onCancel={onCancelFilter}
          visible={visibleFilter}
          width={400}
          footerStyle={{
            display: "flex",
            flexDirection: "row-reverse",
            justifyContent: "space-between"
          }}
          confirmButtonTitle="Áp dụng bộ lọc"
          deleteButtonTitle={
            <div>
              <img src={deleteIcon} style={{ marginRight: 10 }} alt="" />
              <span style={{ color: "red" }}>Xóa bộ lọc</span>
            </div>
          }
        >
          <Form
            form={formAdvance}
            onFinish={onSearch}
            //ref={formRef}
            initialValues={params}
            layout="vertical"
          >
            <Form.Item
              name="ecommerce_id"
              label={<b>CHỌN SÀN</b>}
            >
              <Select
                showSearch
                placeholder="Chọn sàn"
                allowClear
                onSelect={(value) => getShopEcommerce(value)}
                onClear={removeEcommerce}
              >
                {ECOMMERCE_LIST &&
                  ECOMMERCE_LIST.map((item: any) => (
                    <Option key={item.ecommerce_id} value={item.ecommerce_id}>
                      <div>
                        <img src={item.icon} alt={item.id} style={{marginRight: "10px"}} />
                        <span>{item.title}</span>
                      </div>
                    </Option>
                  ))
                }
              </Select>
            </Form.Item>

            <Form.Item
              name="shop_id"
              className="select-store-dropdown"
              label={<b>CHỌN GIAN HÀNG</b>}
            >
              {!isEcommerceSelected &&
                <Tooltip title="Yêu cầu chọn sàn" color="#1890ff">
                  <Select
                    showSearch
                    placeholder="Chọn gian hàng"
                    allowClear
                    disabled={true}
                  />
                </Tooltip>
              }

              {isEcommerceSelected &&
                <Select
                  showSearch
                  placeholder="Chọn gian hàng"
                  allowClear
                  onSelect={(value) => selectShopEcommerce(value)}
                >
                  {ecommerceShopList &&
                    ecommerceShopList.map((shop: any) => (
                      <Option key={shop.id} value={shop.id}>
                        {shop.name}
                      </Option>
                    ))
                  }
                </Select>
              }
            </Form.Item>

            <Form.Item
              name="category_id"
              label={<b>DANH MỤC</b>}
            >
              <Select
                showSearch
                placeholder="Chọn danh mục"
                allowClear
              >
                {categoryList && categoryList.map((item: any) => (
                  <Option key={item.category_id} value={item.category_id}>
                    {item.display_category_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </BaseFilter>

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

      </div>
    </StyledComponent>
  );
};

export default NotConnectedItems;
