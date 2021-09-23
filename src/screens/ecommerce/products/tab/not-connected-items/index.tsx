import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, Select, Input, Modal, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import CustomTable from "component/table/CustomTable";
import BaseFilter from "component/filter/base.filter"
import { showSuccess,} from "utils/ToastUtils";

import { ProductEcommerceQuery } from "model/query/ecommerce.query";
import { PageResponse } from "model/base/base-metadata.response";
import { getProductEcommerceList } from "domain/actions/ecommerce/ecommerce.actions";

import circleDeleteIcon from "assets/icon/circle-delete.svg"
import warningCircleIcon from "assets/icon/warning-circle.svg"
import filterIcon from "assets/icon/filter.svg"
import saveIcon from "assets/icon/save.svg"
import closeIcon from "assets/icon/X_close.svg"
import deleteIcon from "assets/icon/deleteIcon.svg"

import { StyledComponent } from "./styles";

const NotConnectedItems = () => {
  const [formAdvance] = Form.useForm();
  const dispatch = useDispatch();
  const { Option } = Select;

  const [visibleFilter, setVisibleFilter] = React.useState<boolean>(false);
  const [isShowDeleteItemModal, setIsShowDeleteItemModal] = React.useState(false);

  const [variantData, setVariantData] = React.useState<PageResponse<any>>({
    metadata: {
      limit: 30,
      page: 1,
      total: 0,
    },
    items: [],
  });

  const params: ProductEcommerceQuery = useMemo(
    () => ({
      page: 1,
      limit: 30,
      ecommerce_id: null,
      shop_id: null,
      category_id: null,
      connect_status: null,
      update_stock_status: null,
    }),
    []
  );

  const [query, setQuery] = React.useState<ProductEcommerceQuery>({
    page: 1,
    limit: 30,
    ecommerce_id: null,
    shop_id: null,
    category_id: null,
    connect_status: null,
    update_stock_status: null,
  });

  const updateVariantData = React.useCallback((result: PageResponse<any> | false) => {
    if (!!result) {
      setVariantData(result);
    }
  }, []);

  useEffect(() => {
    dispatch(getProductEcommerceList(query, updateVariantData));
  }, [dispatch, query, updateVariantData]);

  const handleDeleteItem = (item: any) => {
    setIsShowDeleteItemModal(true);
  };

  const cancelDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);
  };

  const okDeleteItemModal = () => {
    setIsShowDeleteItemModal(false);
    showSuccess("Xóa sản phẩm thành công");
    //thai need todo: call API
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
          <span>{l.core_variant || "-"}</span>
        );
      },
    },
    {
      title: "Ghép nối",
      visible: true,
      render: (l: any, v: any, i: any) => {
        return (
          <span>{l.connect_status || "-"}</span>
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
          <span>Đồng bộ tồn - chưa có</span>
        );
      },
    },
    {
      render: () => {
        return (
          <img
            src={closeIcon}
            className="delete-item-icon"
            alt=""
            onClick={handleDeleteItem}
          />
        )
      }
    }
    
  ]);

  const variantDataNotConnected = variantData && variantData.items && variantData.items.filter((item: any) => {
    return item.connect_status === false;
  });

  const onSearch = (value: ProductEcommerceQuery) => {
    if (value) {
      query.ecommerce_id = value.ecommerce_id;
      query.shop_id = value.shop_id;
      query.category_id = value.category_id;
      query.connect_status = value.connect_status;
      query.update_stock_status = value.update_stock_status;

      //thai need todo: search shopee, YODY
      // query.ecommerce_variant = value.ecommerce_variant;
      // query.core_variant = value.core_variant;
    }
    
    const querySearch: ProductEcommerceQuery = value;
    dispatch(getProductEcommerceList(querySearch, setVariantData));
  };

  const onPageChange = React.useCallback(
    (page, limit) => {
      setQuery({ ...query, page, limit });
    },[query]
  );

  //thai fake data 
  const LIST_STORE = [
    {
      id: 1,
      name: "store 1",
      value: "store_1"
    },
    {
      id: 2,
      name: "store 2",
      value: "store_2"
    }
  ]

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

  const savePairing = () => {
    showSuccess("Lưu các cặp đã ghép thành công");
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
                placeholder="Chọn sàn"
                allowClear
                optionFilterProp="children"
              >
                {LIST_STORE &&
                  LIST_STORE.map((c: any) => (
                    <Option key={c.value} value={c.value}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item name="shop_id" className="select-store-dropdown">
              <Select
                showSearch
                placeholder="Chọn gian hàng"
                allowClear
                optionFilterProp="children"
              >
                {LIST_STORE &&
                  LIST_STORE.map((c: any) => (
                    <Option key={c.value} value={c.value}>
                      {c.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item name="ecommerce_variant" className="shoppe-search">
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
          dataSource={variantData.items}
          // dataSource={variantDataNotConnected}
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
          className="save-pairing-button"
          type="primary"
          onClick={(e) => {savePairing()}}
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
                placeholder=""
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
              name="shop_id"
              label={<b>CHỌN GIAN HÀNG</b>}
            >
              <Select
                showSearch
                placeholder=""
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
              name="category_id"
              label={<b>DANH MỤC</b>}
            >
              <Select
                showSearch
                placeholder=""
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
                placeholder=""
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
              name="update_stock_status"
              label={<b>TRẠNG THÁI ĐỒNG BỘ TỒN KHO</b>}
            >
              <Select
                showSearch
                placeholder=""
                allowClear
              >
                {CATEGORY.map((item) => (
                  <Option key={item.id} value={item.value}>
                    {item.name}
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
