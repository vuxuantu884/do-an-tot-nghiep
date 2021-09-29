import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Form, Select, Input, Modal, Tooltip, Radio, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import CustomTable from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter"
import { showSuccess } from "utils/ToastUtils";
import TotalItemActionColumn from "./TotalItemActionColumn";
import UrlConfig from "config/url.config";

import { RootReducerType } from "model/reducers/RootReducerType";
import { ProductEcommerceQuery } from "model/query/ecommerce.query";
import { PageResponse } from "model/base/base-metadata.response";
import {
  getProductEcommerceList,
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

const TotalItemsEcommerce = () => {
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowModalDisconnect, setIsShowModalDisconnect] = useState(false);
  const [idDisconnectItem, setIdDisconnectItem] = useState(null);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [idDeleteItem, setIdDeleteItem] = useState(null);
  const [isShowSyncStockModal, setIsShowSyncStockModal] = useState(false);
  const [syncStockAll, setSyncStockAll] = useState(null);
  const [syncStockId, setSyncStockId] = useState<Array<any>>([]); 
  
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

  //handle sync stock
  const handleSyncStock = (item: any) => {
    setIsShowSyncStockModal(true);
    setSyncStockId([item.id]);
  };

  const onChangeSyncOption = (e: any) => {
    setSyncStockAll(e.target.value);
  };

  const cancelSyncStockModal = () => {
    setIsShowSyncStockModal(false);
    setSyncStockAll(null);
  };
  
  const okSyncStockModal = () => {
    setIsShowSyncStockModal(false);
    setSyncStockAll(null);

    const requestSyncStock = {
      variant_ids: syncStockId,
      all: syncStockAll
    }

    dispatch(postSyncStockEcommerceProduct(requestSyncStock, (result) => {
      if (result) {
        showSuccess("Đồng bộ tồn kho sản phẩm thành công");
        reloadPage();
      }
    }));
  };

  const isDisableSyncStockOkButton = () => {
    return syncStockAll === null;
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

  //thai need todo
  const [columns] = useState<any>([
    {
      title: "Ảnh",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return <img src={l.ecommerce_image_url} style={{height: "40px"}} alt=""></img>;
      },
    },
    {
      title: "Sku/ itemID (Shopee)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return <span>{l.ecommerce_sku || l.ecommerce_product_id || "-"}</span>
      },
    },
    {
      title: "Sản phẩm (Shopee)",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <span>{l.ecommerce_variant || "-"}</span>
        );
      },
    },
    {
      title: "Giá bán (Shopee)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>{l.ecommerce_price || "-"}</span>
        );
      },
    },
    {
      title: "Sản phẩm (YODY)",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <div>
            {l.core_variant &&
              <Link to={`${UrlConfig.PRODUCT}/${l.ecommerce_id}/variants/${l.id}`}>
                {l.core_variant}
              </Link>
            }
            {!l.core_variant &&
              <span>-</span>
            }
          </div>
        );
      },
    },
    {
      title: "Giá bán (YODY)",
      visible: true,
      align: "center",
      render: (l: any, v: any, i: any) => {
        return (
          <span>{l.core_price || "-"}</span>
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
            {l.connect_status === "error" &&
              <span style={{color: '#E24343'}}>Thất bại</span>
            }
            {l.connect_status === "waiting" &&
              <span style={{color: '#FFA500'}}>Đang xử lý</span>
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
            {l.stock === "done" &&
              <Tooltip title={l.updated_date}>
                <span style={{color: '#27AE60'}}>Thành công</span>
              </Tooltip>
            }
            {l.stock === "error" &&
              <Tooltip title="error">
                <span style={{color: '#E24343'}}>Thất bại</span>
              </Tooltip>
            }
            {(l.stock === "in_progress" || l.stock === null) &&
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

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );
  const STOCK_STATUS = bootstrapReducer.data?.stock_sync_status;
  const CONNECT_STATUS = bootstrapReducer.data?.connect_product_status;
  
  //thai fake data
  const CATEGORY = [
    {
      id: 1,
      name: "category 1",
      value: "category_1"
    },
    {
      id: 2,
      name: "category 2",
      value: "category_2"
    }
  ]

  
  ////////////////////

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

            <Form.Item name="sku_or_name_core" className="yody-search">
              <Input
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, Sản phẩm YODY"
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
          columns={columns}
          dataSource={variantData.items}
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
                {CATEGORY.map((item) => (
                  <Option key={item.id} value={item.value}>
                    {item.name}
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

        <Modal
          width="600px"
          visible={isShowSyncStockModal}
          title="Đồng bộ tồn kho"
          okText="Đồng bộ"
          cancelText="Hủy"
          onCancel={cancelSyncStockModal}
          onOk={okSyncStockModal}
          okButtonProps={{disabled: isDisableSyncStockOkButton()}}
        >
          <Radio.Group onChange={onChangeSyncOption} value={syncStockAll}>
            <Space direction="vertical">
              <Radio value={false}>Đồng bộ các sản phẩm đã chọn</Radio>
              <Radio value={true}>Đồng bộ tất cả sản phẩm</Radio>
            </Space>
          </Radio.Group>
        </Modal>

        
      </div>
    </StyledComponent>
  );
};

export default TotalItemsEcommerce;
