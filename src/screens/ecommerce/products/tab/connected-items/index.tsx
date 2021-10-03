import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form,Select, Input, Modal, Tooltip, Radio, Space, Dropdown, Menu } from "antd";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";

import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter"
import { showSuccess,  } from "utils/ToastUtils";
import { formatCurrency } from "utils/AppUtils";
import ConnectedItemActionColumn from "./ConnectedItemActionColumn";

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
import warningCircleIcon from "assets/icon/warning-circle.svg"
import filterIcon from "assets/icon/filter.svg"
import deleteIcon from "assets/icon/deleteIcon.svg"
import circleDeleteIcon from "assets/icon/circle-delete.svg"
import tikiIcon from "assets/icon/e-tiki.svg";
import shopeeIcon from "assets/icon/e-shopee.svg";
import lazadaIcon from "assets/icon/e-lazada.svg";
import sendoIcon from "assets/icon/e-sendo.svg";

import { StyledComponent } from "./styles";

  
type ConnectedItemsProps = {
  categoryList?: Array<any>
};

const ConnectedItems: React.FC<ConnectedItemsProps> = (
  props: ConnectedItemsProps
) => {

  const { categoryList } = props;
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const [visibleFilter, setVisibleFilter] = useState<boolean>(false);
  const [isShowModalDisconnect, setIsShowModalDisconnect] = useState(false);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = useState(false);
  const [isShowSyncStockModal, setIsShowSyncStockModal] = useState(false);
  const [syncStockAll, setSyncStockAll] = useState(true);
  const [idsItemSelected, setIdsItemSelected] = useState<Array<any>>([]);
  
  const [selectedRow, setSelected] = useState<Array<any>>([]);
 
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
      sku_or_name_ecommerce: ""
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

  const handleSyncStockItemsSelected = () => {
    const itemSelected: any[] = [];
    if (selectedRow && selectedRow.length > 0) {
      selectedRow.forEach((item) => {
        itemSelected.push(item.id);
      });
      setSyncStockAll(false);
    }
    setIdsItemSelected(itemSelected);
    setIsShowSyncStockModal(true);
  };

  const onChangeSyncOption = (e: any) => {
    setSyncStockAll(e.target.value);
  };

  const cancelSyncStockModal = () => {
    setIsShowSyncStockModal(false);
    setSyncStockAll(true);
  };

  const okSyncStockModal = () => {
    setIsShowSyncStockModal(false);
    setSyncStockAll(true);

    const requestSyncStock = {
      variant_ids: idsItemSelected,
      all: syncStockAll
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
    setIdsItemSelected([item.id]);
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

  const cancelDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);
  };

  const okDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);
    
    if (idsItemSelected) {
      dispatch(deleteEcommerceItem(idsItemSelected, (result) => {
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
    setIdsItemSelected([item.id]);
  };

  const handleDisconnectItemsSelected = () => {
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
    setIsShowModalDisconnect(true);
  };

  const cancelDisconnectModal = () => {
    setIsShowModalDisconnect(false);
  };

  const okDisconnectModal = () => {
    setIsShowModalDisconnect(false);
    
    if (idsItemSelected) {
      dispatch(disconnectEcommerceItem({ids: idsItemSelected}, (result) => {
        if (result) {
          showSuccess("Ngắt kết nối sản phẩm thành công");
          reloadPage();
        }
      }));
    }
  };

  //thai need todo
  const [columns] = React.useState<
    Array<ICustomTableColumType<any>>
  >([
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
        return (
          <div>
            <div>{l.core_variant}</div>
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
    
    ConnectedItemActionColumn(handleSyncStock, handleDeleteItem, handleDisconnectItem),
  ]);

  const columnFinal = React.useMemo(
    () => columns.filter((item) => item.visible === true),
    [columns]
  );

  const variantConnectedItem = variantData && variantData.items && variantData.items.filter((item: any) => {
    return item.connect_status === "connected";
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

  const bootstrapReducer = useSelector(
    (state: RootReducerType) => state.bootstrapReducer
  );

  const STOCK_STATUS = bootstrapReducer.data?.stock_sync_status;

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

  const onSelectTable = React.useCallback(
    (selectedRow: Array<any>) => {
      setSelected(selectedRow);
    },
    []
  );

  const isDisableAction = () => {
    return !selectedRow || selectedRow.length === 0;
  }

  const actionList = (
    <Menu>
      <Menu.Item key="1">
        <span onClick={handleSyncStockItemsSelected}>Đồng bộ tồn kho lên sàn</span>
      </Menu.Item>

      <Menu.Item key="2" disabled={isDisableAction()}>
        <span onClick={handleDeleteItemsSelected}>Xóa sản phẩm lấy về</span>
      </Menu.Item>

      <Menu.Item key="3" disabled={isDisableAction()}>
        <span onClick={handleDisconnectItemsSelected}>Hủy liên kết</span>
      </Menu.Item>
      
    </Menu>
  );

  return (
    <StyledComponent>
      <div className="connected-items">
        <div className="filter">
          <Form
            form={formAdvance}
            onFinish={onSearch}
            initialValues={params}
          >
            <Form.Item name="action" className="action-dropdown">

              <Dropdown
                overlay={actionList}
                trigger={["click"]}
              >
                <Button className="action-button">
                  <div style={{ marginRight: 10 }}>Thao tác</div>
                  <DownOutlined />
                </Button>
              </Dropdown>
            </Form.Item>

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
                placeholder="SKU, tên sản phẩm sàn"
              />
            </Form.Item>

            <Form.Item name="sku_or_name_core" className="yody-search">
              <Input
                prefix={<SearchOutlined style={{ color: "#d4d3cf" }} />}
                placeholder="SKU, Sản phẩm Yody"
              />
            </Form.Item>

            <Form.Item className="filter-item">
              <Button type="primary" htmlType="submit">
                Lọc
              </Button>
            </Form.Item>

            <Form.Item>
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
          columns={columnFinal}
          dataSource={variantConnectedItem}
          scroll={{ x: 1500 }}
          pagination={{
            pageSize: variantData.metadata && variantData.metadata.limit,
            total: variantConnectedItem && variantConnectedItem.length,
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
                {categoryList && categoryList.map((item: any) => (
                  <Option key={item.category_id} value={item.category_id}>
                    {item.display_category_name}
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
          <div>
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

export default ConnectedItems;
