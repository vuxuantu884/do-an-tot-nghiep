import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Button, Form, Select, Input, Modal, Tooltip, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import UrlConfig from "config/url.config";
import CustomTable from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter"
import { showSuccess } from "utils/ToastUtils";
import { formatCurrency } from "utils/AppUtils";
import TotalItemActionColumn from "./TotalItemActionColumn";

import { RootReducerType } from "model/reducers/RootReducerType";
import { ProductEcommerceQuery } from "model/query/ecommerce.query";
import {
  getShopEcommerceList,
  deleteEcommerceItem,
  disconnectEcommerceItem,
  postSyncStockEcommerceProduct
 } from "domain/actions/ecommerce/ecommerce.actions";

import disconnectIcon from "assets/icon/disconnect.svg";
import warningCircleIcon from "assets/icon/warning-circle.svg";
import filterIcon from "assets/icon/filter.svg"
import deleteIcon from "assets/icon/deleteIcon.svg"
import circleDeleteIcon from "assets/icon/circle-delete.svg"
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";

import { StyledComponent } from "./styles";


type TotalItemsEcommerceProps = {
  categoryList?: Array<any>
  variantData: any
  getProductUpdated: any
  tableLoading: any
};

const TotalItemsEcommerce: React.FC<TotalItemsEcommerceProps> = (
  props: TotalItemsEcommerceProps
) => {

  const { categoryList, variantData, getProductUpdated, tableLoading } = props;
  const [formAdvance] = Form.useForm();
  const history = useHistory();
  const dispatch = useDispatch();
  const { Option } = Select;

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowModalDisconnect, setIsShowModalDisconnect] = useState(false);
  const [idDisconnectItem, setIdDisconnectItem] = useState(null);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [idDeleteItem, setIdDeleteItem] = useState(null);

  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [shopIdSelected, setShopIdSelected] = useState<Array<any>>([]);

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
    dispatch(getShopEcommerceList({}, updateEcommerceShopList));
  }, [dispatch, updateEcommerceShopList]);

  const reloadPage = () => {
    getProductUpdated(query);
  }

  //handle sync stock
  const handleSyncStock = (item: any) => {
    const requestSyncStock = {
      variant_ids: [item.id],
      all: false
    }

    dispatch(postSyncStockEcommerceProduct(requestSyncStock, (result) => {
      if (result) {
        showSuccess("Đồng bộ tồn kho sản phẩm thành công");
        reloadPage();
      }
    }));
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
      dispatch(deleteEcommerceItem([idDeleteItem], (result) => {
        if (result) {
          showSuccess("Xóa sản phẩm thành công");
          reloadPage();
        }
      }));
    }
  };

  //handle disconnect item
  const handleDisconnectItem = (item: any) => {
    setIsShowModalDisconnect(true);
    setIdDisconnectItem(item.id);
  };

  const cancelDisconnectModal = () => {
    setIsShowModalDisconnect(false);
  };

  const okDisconnectModal = () => {
    setIsShowModalDisconnect(false);
    
    dispatch(disconnectEcommerceItem({ids: [idDisconnectItem]}, (result) => {
      if (result) {
        showSuccess("Ngắt kết nối sản phẩm thành công");
        reloadPage();
      }
    }));
  };


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
      render: (l: any, v: any, i: any) => {
        const link = `https://dev.yody.io/unicorn/admin/products/${l.id}/variants/${l.core_variant_id}`;
        return (
          <div>
            <div onClick={() => window.open(link, "_blank")} className="link">{l.core_variant}</div>
            <div>{l.core_sku}</div>
          </div>
        );
      },
    },
    {
      title: "Giá bán (Yody)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>{formatCurrency(l.core_price)}</span>
        );
      },
    },
    {
      title: "Tồn",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>{l.stock || "-"}</span>
        );
      },
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
            {l.connect_status === "waiting" &&
              <span style={{color: '#FFA500'}}>Chưa ghép nối</span>
            }
          </div>
        );
      },
    },
    {
      title: () => {
        return (
          <div>
            <span>Đồng bộ tồn</span>
            <Tooltip overlay="Kết quả đồng bộ tồn kho lần gần nhất" placement="top" trigger="click">
              <img src={warningCircleIcon} style={{ marginLeft: 5, cursor: "pointer" }} alt="" />
            </Tooltip>
          </div>
        )
      },
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            {l.sync_stock_status === "done" &&
              <Tooltip title={l.updated_date}>
                <span style={{color: '#27AE60'}}>Thành công</span>
              </Tooltip>
            }

            {l.sync_stock_status === "error" &&
              <Tooltip title="error">
                <span style={{color: '#E24343'}}>Thất bại</span>
              </Tooltip>
            }

            {(l.sync_stock_status === "in_progress" || l.stock === null) &&
              <span style={{color: '#FFA500'}}>Đang xử lý</span>
            }
          </div>
        );
      },
    },

    TotalItemActionColumn(handleSyncStock, handleDeleteItem, handleDisconnectItem)
  ]);

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
    getProductUpdated(querySearch);
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

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  
  const STOCK_STATUS = bootstrapReducer.data?.stock_sync_status;
  const CONNECT_STATUS = bootstrapReducer.data?.connect_product_status;
  
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
                    <span className="name" style={isNewFilter ? {width: 270} : {width: 120}}>{item.name}</span>
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


  return (
    <StyledComponent>
      <div className="total-items-ecommerce">
        <div className="filter">
          <Form
            form={formAdvance}
            onFinish={onSearch}
            initialValues={params}
          >
            <Form.Item name="ecommerce_id" className="select-channel-dropdown">
              <Select
                showSearch
                disabled={tableLoading}
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
                disabled={tableLoading}
                placeholder={getPlaceholderSelectShop()}
                allowClear={shopIdSelected && shopIdSelected.length > 0}
                dropdownRender={() => renderShopList(false)}
                onClear={removeSelectedShop}
              />
            </Form.Item>

            <Form.Item name="sku_or_name_ecommerce" className="shoppe-search">
              <Input
                disabled={tableLoading}
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, tên sản phẩm sàn"
              />
            </Form.Item>

            <Form.Item name="sku_or_name_core" className="yody-search">
              <Input
                disabled={tableLoading}
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, Sản phẩm Yody"
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

        <CustomTable
          isLoading={tableLoading}
          columns={columns}
          dataSource={variantData.items}
          scroll={{ x: 1500 }}
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

            <Form.Item
              name="connect_status"
              label={<b>TRẠNG THÁI GHÉP NỐI</b>}
            >
              <Select
                showSearch
                placeholder="Chọn trạng thái ghép nối"
                allowClear
              >
                {CONNECT_STATUS && CONNECT_STATUS.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="update_stock_status"
              label={<b>TRẠNG THÁI ĐỒNG BỘ TỒN KHO</b>}
            >
              <Select
                showSearch
                placeholder="Chọn trạng thái đồng bộ tồn kho"
                allowClear
              >
                {STOCK_STATUS && STOCK_STATUS.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

          </Form>
        </BaseFilter>

        <Modal
          width="600px"
          visible={isShowModalDisconnect}
          okText="Đồng ý"
          cancelText="Hủy"
          onCancel={cancelDisconnectModal}
          onOk={okDisconnectModal}
        >
          <div>
            <img src={disconnectIcon} style={{ marginRight: 20 }} alt="" />
            <span>Bạn có chắc chắn muốn hủy liên kết sản phẩm không?</span>
          </div>
        </Modal>

        <Modal
          width="600px"
          visible={isShowDeleteItemModal}
          okText="Đồng ý"
          cancelText="Hủy"
          onCancel={cancelDeleteItemModal}
          onOk={okDeleteItemModal}
        >
          <div style={{margin: "20px 0"}}>
            <img src={circleDeleteIcon} style={{ marginRight: 20 }} alt="" />
            <span>Bạn có chắc chắn muốn xóa sản phẩm tải về không?</span>
          </div>
        </Modal>

      </div>
    </StyledComponent>
  );
};

export default TotalItemsEcommerce;
