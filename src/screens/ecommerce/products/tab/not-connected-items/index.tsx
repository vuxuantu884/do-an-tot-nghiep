import React, { useState, useEffect, useMemo, createRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { RefSelectProps } from "antd/lib/select";
import { Button, Form, Select, Input, Modal, Tooltip, AutoComplete, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import { AppConfig } from "config/app.config";

import CustomTable from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter"
import { showError, showSuccess } from "utils/ToastUtils";
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

  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);

  const [connectItemList, setConnectItemList] = useState<Array<any>>([]);
  const [selectedRow, setSelected] = useState<Array<any>>([]);

  const params: ProductEcommerceQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      ecommerce_id: null,
      shop_id: [],
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
    shop_id: [],
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
  
  const updateEcommerceShopList = React.useCallback((result) => {
    const shopList: any[] = [];
    if (result && result.length > 0) {
      result.forEach((item: any) => {
        shopList.push({
          id: item.id,
          name: item.name,
          isSelected: false
        });
      });
    }
    setEcommerceShopList(shopList);

  }, []);
  

  useEffect(() => {
    dispatch(getProductEcommerceList(query, updateVariantData));
    dispatch(getShopEcommerceList({}, updateEcommerceShopList));
  }, [dispatch, query, updateVariantData, updateEcommerceShopList]);
 
  const reloadPage = () => {
    dispatch(getProductEcommerceList(query, updateVariantData));
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


  const RenderProductColumn = (item: any, connectItemList: Array<any>, setConnectItemList: Function) => {
    const autoCompleteRef = createRef<RefSelectProps>();

    const [keySearchVariant, setKeySearchVariant] = useState("");
    const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
    const [productSelected, setProductSelected] = useState<any>();
    

    const saveConnectYodyProduct = (itemId: any) => {  
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
          } else {
            showError("Ghép nối sản phẩm thất bại");
          }
        })
      );
    }
    
    const cancelConnectYodyProduct = (itemId: any) => {
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
          variant_prices: itemSelected && itemSelected.variant_prices,
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

    const gotoProductDetail = () => {
      const link = `${UrlConfig.PRODUCT}/${productSelected.product_id}/variants/${productSelected.id}`;
      window.open(link, "_blank");
    }

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
                <span onClick={gotoProductDetail} className="link">{productSelected.name}</span>
              </li>

              <li>
                <b>SKU: </b>
                <span style={{color: "#737373"}}>{productSelected.sku}</span>
              </li>
              
              <li>
                <b>Giá bán: </b>
                <span>
                  {`${findPrice(productSelected.variant_prices, AppConfig.currency)} `}
                  <span className="item-price-unit">đ</span>
                </span>
              </li>
            </ul>

            <div className="button">
              <Button type="primary" onClick={() => saveConnectYodyProduct(productSelected.id)}>
                Lưu
              </Button>

              <Button onClick={() => cancelConnectYodyProduct(productSelected.id)}>
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
      title: "Sku/ itemID (Sàn)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            <div>{l.ecommerce_sku}</div>
            <div style={{color: "#737373"}}>{l.ecommerce_product_id}</div>
            <div style={{color: "#737373"}}>({l.ecommerce_variant_id})</div>
            <div style={{color: "#2a2a86"}}>({l.shop})</div>
          </div>
        )
      },
    },
    {
      title: "Sản phẩm (Sàn)",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <div>{l.ecommerce_variant}</div>
        );
      },
    },
    {
      title: "Giá bán (Sàn)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>{l.ecommerce_price ? formatCurrency(l.ecommerce_price) : "-"}</span>
        );
      },
    },
    {
      title: "Sản phẩm (Yody)",
      visible: true,
      render: (l: any, v: any, i: any) => RenderProductColumn(l, connectItemList, setConnectItemList)
    },
    {
      title: "Ghép nối",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            {l.connect_status === "waiting" &&
              <span style={{color: '#FFA500'}}>Chưa ghép nối</span>
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


  const getShopEcommerce = (ecommerceId: any) => {
    setShopIdSelected([]);
    dispatch(getShopEcommerceList({ecommerce_id: ecommerceId}, updateEcommerceShopList));
  }

  const removeEcommerce = () => {
    setShopIdSelected([]);
    dispatch(getShopEcommerceList({}, updateEcommerceShopList));
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


  //Save connected Yody product
  const disableSaveConnectedYodyProduct = () => {
    return connectItemList.length === 0;
  }

  const saveConnectedYodyProduct = () => {
    const yodyProductConnectCheck: any[] = [];
    let isSaveAble = true;
    if (selectedRow.length === 0) {
      showError("Vui lòng chọn ít nhất 1 sản phẩm để ghép nối");
      isSaveAble = false;
    } else {
      connectItemList.forEach((item) => {
        const itemMatch = selectedRow.find(rowData => rowData.id === item.id)
        if (itemMatch) {
          yodyProductConnectCheck.push(item);
        }
      });
    }

    if (isSaveAble && yodyProductConnectCheck.length === 0) {
      showError("Vui lòng chọn sản phẩm (Yody) để ghép nối");
      isSaveAble = false;
    }

    
    if (isSaveAble) {
      const request = {
        variants: yodyProductConnectCheck
      }
      dispatch(
        putConnectEcommerceItem(request, (result) => {
          if (result) {
            setConnectItemList([]);
            showSuccess("Ghép nối sản phẩm thành công");
            reloadPage();
            history.replace(`${history.location.pathname}#connected-item`)
          } else {
            showError("Ghép nối sản phẩm thất bại");
          }
        })
      );
    }

  }

  //select shop  
  const getPlaceholderSelectShop = () => {
    if (shopIdSelected && shopIdSelected.length > 0) {
      return (`Đã chọn: ${shopIdSelected.length} gian hàng`)
    } else {
      return ("Chọn gian hàng")
    }
  }

  const onCheckedChange = (shop: any, e: any) => {
    if (e.target.checked) {
      shop.isSelected = true;
      const shopSelected = [...shopIdSelected];
      shopSelected.push(shop.id);
      setShopIdSelected(shopSelected);
    } else {
      shop.isSelected = false;
      const shopSelected = shopIdSelected && shopIdSelected.filter((item: any) => {
        return item !== shop.id;
      });
      setShopIdSelected(shopSelected);
    }
  }

  const renderShopList = (isNewFilter: any) => {
    return (
      <StyledComponent>
        <div className="render-shop-list">
          {ecommerceShopList.map((item: any) => (
            <div key={item.id}  className="shop-name">
              <Checkbox onChange={(e) => onCheckedChange(item, e)} checked={item.isSelected} >
                <span className="check-box-name">
                  <span>
                    <img src={shopeeIcon} alt={item.id} style={{marginRight: "5px", height: "16px"}} />
                  </span>
                  <Tooltip title={item.name} color="#1890ff" placement="right">
                    <span className="name" style={isNewFilter ? {width: 270} : {width: 130}}>{item.name}</span>
                  </Tooltip>
                </span>
              </Checkbox>
            </div>
          ))}

          {ecommerceShopList.length === 0 &&
            <div style={{color: "#737373", padding: 10}}>Không có dữ liệu</div>
          }
        </div>
      </StyledComponent>
    )
  }
    
  const removeSelectedShop = () => {
    const copyEcommerceShopList = [...ecommerceShopList];
    copyEcommerceShopList.forEach((item: any) => {
      item.isSelected = false;
    });

    setEcommerceShopList(copyEcommerceShopList);
    setShopIdSelected([]);
  }
  
  //select row table
  const onSelectTable = React.useCallback(
    (selectedRow: Array<any>) => {
      setSelected(selectedRow);
    },
    []
  );


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
              <Select
                showSearch
                placeholder={getPlaceholderSelectShop()}
                allowClear={shopIdSelected && shopIdSelected.length > 0}
                dropdownRender={() => renderShopList(false)}
                onClear={removeSelectedShop}
              />
            </Form.Item>

            <Form.Item name="sku_or_name_ecommerce" className="shoppe-search">
              <Input
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, tên sản phẩm sàn"
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
          onSelectedChange={onSelectTable}
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
          onClick={saveConnectedYodyProduct}
          disabled={disableSaveConnectedYodyProduct()}
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
              <Select
                showSearch
                placeholder={getPlaceholderSelectShop()}
                allowClear={shopIdSelected && shopIdSelected.length > 0}
                dropdownRender={() => renderShopList(true)}
                onClear={removeSelectedShop}
              />
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
