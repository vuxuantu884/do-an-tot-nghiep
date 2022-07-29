import { RefSelectProps } from "antd/lib/select";
import { EcommerceProductPermission } from "config/permissions/ecommerce.permission";
import useAuthorization from "hook/useAuthorization";
import { VariantResponse, VariantSearchQuery } from "model/product/product.model";
import { createRef, useEffect, useState } from "react";
import { findAvatar, findPrice, formatCurrency } from "utils/AppUtils";
import { StyledProductListDropdown, StyledYodyProductColumn } from "../../styles";
import imgDefault from "assets/icon/img-default.svg";
import { Link, useHistory } from "react-router-dom";
import UrlConfig, { EcommerceProductTabUrl } from "config/url.config";
import { useDispatch } from "react-redux";
import { putConnectWebAppProductAction } from "domain/actions/web-app/web-app.actions";
import { PageResponse } from "model/base/base-metadata.response";
import { searchVariantsOrderRequestAction } from "domain/actions/product/products.action";
import { AppConfig } from "config/app.config";
import { AutoComplete, Button, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import ConfirmConnectProductModal from "./ConfirmConnectProductModal";
import ResultConnectProductModal from "./ResultConnectProductModal";

type AutoCompleteProductProps = {
  lineItem: any;
  updateSkuCoreToLineItem: (a: any) => void;
  handleMappingVariantJob: (a: any) => void;
};
const AutoCompleteProduct = (props: AutoCompleteProductProps) => {
  const { lineItem, updateSkuCoreToLineItem, handleMappingVariantJob } = props;

  const history = useHistory();
  const dispatch = useDispatch();

  //permission
  const productsConnectPermission = [EcommerceProductPermission.products_update];
  const [allowProductsConnect] = useAuthorization({
    acceptPermissions: productsConnectPermission,
    not: false,
  });

  //state
  const autoCompleteRef = createRef<RefSelectProps>();
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
  const [variantList, setVariantList] = useState<PageResponse<VariantResponse>>({
    metadata: {
      limit: 0,
      page: 1,
      total: 0,
    },
    items: [],
  });
  const [productSelected, setProductSelected] = useState<any>(null);

  useEffect(() => {
    let variant: any = null;
    if (lineItem.core_sku) {
      variant = {
        core_variant: lineItem.core_variant,
        core_variant_id: lineItem.core_variant_id,
        core_sku: lineItem.core_sku,
        variant_prices: null,
        core_price: lineItem.core_price,
        id: lineItem.id,
        core_product_id: lineItem.core_product_id,
      };
    }
    setProductSelected(variant);
  }, [lineItem]);

  const closeResultConnectionModal = () => {
    setIsShowResultConnectionModal(false);
    //reloadPage();
    history.replace(EcommerceProductTabUrl.CONNECTED);
  };

  // handle save single connected Yody product
  const saveConnectYodyProduct = () => {
    const variant = {
      id: productSelected.id,
      core_variant_id: productSelected.core_variant_id,
      core_sku: productSelected.core_sku,
      core_variant: productSelected.core_variant,
      core_price: productSelected.core_price,
      core_product_id: productSelected.core_product_id,
      ecommerce_correspond_to_core: 1,
    };
    const request = {
      variants: [variant],
    };
    setIsSaving(true);
    dispatch(putConnectWebAppProductAction(request, callbackSaveConnectProduct));
  };

  const callbackSaveConnectProduct = (data: any) => {
    setIsSaving(false);
    setIsVisibleConfirmConnectModal(false);

    if (data) {
      setProductSelected(null);
      handleMappingVariantJob(data.process_id);
    }
  };

  //
  const handleSaveConnectProduct = () => {
    if (lineItem?.ecommerce_price === productSelected?.core_price) {
      saveConnectYodyProduct();
    } else {
      setDiffPriceProduct([productSelected]);
      setIsVisibleConfirmConnectModal(true);
    }
  };

  const cancelConnectYodyProduct = (itemId: any) => {
    setProductSelected(null);
  };

  //get variant list
  const updateProductResult = (result: any) => {
    setVariantList(result);
  };

  const handleChangeProductSearch = (value: string) => {
    setKeySearchVariant(value);
    let initQueryVariant: VariantSearchQuery = {
      page: 1,
      info: value,
    };
    dispatch(searchVariantsOrderRequestAction(initQueryVariant, updateProductResult));
  };

  //handle select variant
  const handleSelectVariant = (id: any) => {
    const item =
      variantList && variantList.items && variantList.items.find((item) => item.id === id);
    if (item) {
      const variant = {
        core_variant: item.name,
        core_sku: item.sku,
        variant_prices: item.variant_prices,
        core_price:
          item.variant_prices && item.variant_prices[0] && item.variant_prices[0].retail_price,
        id: lineItem.id,
        core_variant_id: item && item.id,
        core_product_id: item && item.product_id,
      };
      setProductSelected(variant);
      updateSkuCoreToLineItem(variant);
    }
    setIsInputSearchProductFocus(false);
    setKeySearchVariant("");
    autoCompleteRef.current?.blur();
  };

  //render dropdown variant
  const convertResultSearchVariant = () => {
    let options: Array<any> = [];
    variantList.items.forEach((item: VariantResponse) => {
      options.push({
        label: renderSearchVariant(item),
        value: item.id,
      });
    });
    return options;
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

  return (
    <StyledYodyProductColumn>
      {(!productSelected || !productSelected.id) && (
        <AutoComplete
          notFoundContent={keySearchVariant.length >= 3 ? "Không tìm thấy sản phẩm" : undefined}
          id="search_product"
          value={keySearchVariant}
          ref={autoCompleteRef}
          onSelect={handleSelectVariant}
          dropdownClassName="search-layout dropdown-search-header"
          dropdownMatchSelectWidth={360}
          onSearch={handleChangeProductSearch}
          options={convertResultSearchVariant()}
          maxLength={255}
          open={isInputSearchProductFocus}
          onFocus={() => setIsInputSearchProductFocus(true)}
          onBlur={() => setIsInputSearchProductFocus(false)}
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
                onClick={handleSaveConnectProduct}
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
          onOk={saveConnectYodyProduct}
          onCancel={() => setIsVisibleConfirmConnectModal(false)}
        />
      )}
      {isShowResultConnectionModal && (
        <ResultConnectProductModal
          visible={isShowResultConnectionModal}
          onCancel={closeResultConnectionModal}
          onOk={closeResultConnectionModal}
          connectProductData={resultConnectionData}
        />
      )}
    </StyledYodyProductColumn>
  );
};
export default AutoCompleteProduct;
