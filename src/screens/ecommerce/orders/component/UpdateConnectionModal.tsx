import React, { createRef, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AutoComplete, Button, Input, Modal } from "antd";
import { RefSelectProps } from "antd/lib/select";
import { SearchOutlined } from "@ant-design/icons";

import { AppConfig } from "config/app.config";
import UrlConfig from "config/url.config";
import { findAvatar, findPrice, formatCurrency } from "utils/AppUtils";
import { showError, showSuccess } from "utils/ToastUtils";

import CustomTable from "component/table/CustomTable";

import { putConnectEcommerceItem } from "domain/actions/ecommerce/ecommerce.actions";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";

import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { PageResponse } from "model/base/base-metadata.response";

import imgdefault from "assets/icon/img-default.svg";

import { StyledProductListDropdown, StyledYodyProductColumn } from "screens/ecommerce/products/tab/not-connected-items/styles";
import { StyledUpdateConnectionModal } from "screens/ecommerce/orders/orderStyles";


type UpdateConnectionModalType = {
  visible: boolean;
  data: any;
  onOk: () => void;
  onCancel: () => void;
};


const UpdateConnectionModal: React.FC<UpdateConnectionModalType> = (
  props: UpdateConnectionModalType
) => {
  const { visible, data, onOk, onCancel } = props;
  const dispatch = useDispatch();

  const [tableLoading, setTableLoading] = useState(false);

  const RenderProductColumn = (item: any) => {
    const autoCompleteRef = createRef<RefSelectProps>();

    const [keySearchVariant, setKeySearchVariant] = useState("");
    const [isInputSearchProductFocus, setIsInputSearchProductFocus] = useState(false);
    const [productSelected, setProductSelected] = useState<any>();
    

    const saveConnectYodyProduct = (itemId: any) => {
      const connectProductSelected = {
        id: item.id,
        core_variant_id: productSelected.id,
        core_sku: productSelected.sku,
        core_variant: productSelected.name,
        core_price: productSelected.retail_price,
        core_product_id: productSelected.product_id,
        ecommerce_correspond_to_core: 1,
      }
  
      setProductSelected(null);

      const request = {
        variants: [connectProductSelected]
      }

      setTableLoading(true);
      dispatch(
        putConnectEcommerceItem(request, (result) => {
          setTableLoading(false);
          if (result) {
            onOk();
            showSuccess("Ghép nối sản phẩm thành công");
          } else {
            showError("Ghép nối sản phẩm thất bại");
          }
        })
      );
    }
    
    const cancelConnectYodyProduct = (itemId: any) => {
      setProductSelected(null);
    }

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
        setIsInputSearchProductFocus(false);
        setKeySearchVariant("");
        autoCompleteRef.current?.blur();
      }

    const renderSearchVariant = (item: VariantResponse) => {
      let avatar = findAvatar(item.variant_images);
      return (
        <StyledProductListDropdown style={{ paddingLeft: "20px"}}>
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
      const link = `${UrlConfig.PRODUCT}/${productSelected.product_id}/variants/${productSelected.id}`
      window.open(link, "_blank");
    }

    return (
      <StyledYodyProductColumn style={{ paddingLeft: "10px"}}>
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
            dropdownClassName=""
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
      title: "Sku/ itemID (Sàn)",
      visible: true,
      width: "150px",
      render: (item: any, v: any, i: any) => {
        return (
          <div>
            <div>{item.sku}</div>
            <div style={{color: "#737373"}}>{item.product_id}</div>
            <div style={{color: "#2a2a86"}}>({item.shop || "Cần thêm shop"})</div>
          </div>
        )
      },
    },
    {
      title: "Sản phẩm (Sàn)",
      visible: true,
      width: "200px",
      render: (item: any, v: any, i: any) => {
        return (
          <div>{item.product}</div>
        );
      },
    },
    {
      title: "Giá bán (Sàn)",
      visible: true,
      align: "center",
      width: "100px",
      render: (item: any, v: any, i: any) => {
        return (
          <span>{item.price ? formatCurrency(item.price) : "-"}</span>
        );
      },
    },
    {
      title: "Sản phẩm (Unicorn)",
      visible: true,
      render: (item: any, v: any, i: any) => RenderProductColumn(item)
    }
  ]);



  
  return (
    <Modal
      width="850px"
      className="ecommerce-order-list"
      visible={visible}
      title="Cập nhật ghép nối"
      maskClosable={false}
      onCancel={onCancel}
      footer={
        <Button onClick={onCancel}>Hủy</Button>
      }
    >
      <StyledUpdateConnectionModal>
        <CustomTable
          isLoading={tableLoading}
          dataSource={data}
          columns={columns}
          pagination={false}
          className="not-connected-item-list"
        />
      </StyledUpdateConnectionModal>
    </Modal>
  );
};

export default UpdateConnectionModal;
