import { LoadingOutlined } from "@ant-design/icons";
import { AutoComplete, Col, Input, Row } from "antd";
import { RefSelectProps } from "rc-select";
import React, { createRef, useCallback, useEffect, useMemo, useState } from "react";
import search from "assets/img/search.svg";
import { VariantResponse } from "model/product/product.model";
import { shopeeShopProductSearchApi } from "service/ecommerce/ecommerce.service";
import imgDefault from "assets/icon/img-default.svg";
import { Styled } from "./styled";

type ProductsProps = {
  keySearch: string;
  setKeySearch: (keySearch: string) => void;
  shopID: string;
  id: string;
  onSelect: (selected: any) => void;
};

const SearchProductComponent: React.FC<ProductsProps> = (props: ProductsProps) => {
  const { keySearch, setKeySearch, shopID, onSelect, id } = props;
  const autoCompleteRef = createRef<RefSelectProps>();

  const [resultSearchVariant, setResultSearchVariant] = useState<VariantResponse[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);

  const onVariantSelect = useCallback(
    (value) => {
      const selected = resultSearchVariant.find((i: any) => i.ecommerce_product_id === value);

      onSelect(selected);
    },
    [onSelect, resultSearchVariant],
  );

  const handleSearchProductData = useCallback(
    async (value: string) => {
      setKeySearch(value);
      if (value.length >= 3) {
        setIsSearchingProducts(true);
        try {
          const productsSearch = await shopeeShopProductSearchApi(shopID, value);
          setResultSearchVariant(productsSearch.data);
        } catch {}
        setIsSearchingProducts(false);
      }
    },
    [setKeySearch, shopID],
  );

  const convertResultSearchVariant = useMemo(() => {
    const options = resultSearchVariant.map((item: any) => {
      return {
        label: (
          <Row
            style={{
              display: "flex",
              placeContent: "center space-between",
              height: "50px",
              padding: "10px 15px",
            }}
          >
            <Col span={4}>
              <img
                src={item.image ? item.image : imgDefault}
                alt=""
                placeholder={imgDefault}
                style={{ height: "40px", borderRadius: "3px" }}
              />
            </Col>
            <Col span={16}>
              <span
                className="text-ellipsis"
                style={{ display: "flex", alignItems: "center", color: "#37394D" }}
              >
                {item.ecommerce_product}
              </span>
            </Col>
            <Col span={4}>
              <span style={{ color: "#95a1ac", display: "flex", alignItems: "center" }}>
                {item.ecommerce_sku}
              </span>
            </Col>
          </Row>
        ),
        value: item.ecommerce_product_id,
      };
    });
    return options;
  }, [resultSearchVariant]);

  // const eventKeydownProduct = useCallback((event: any) => {
  //   if (event.key === "Enter") {
  //   }
  // }, []);

  // const handleBlur = useCallback(() => {
  //   setKeySearch(keySearch.trim());
  // }, []);

  useEffect(() => {
    if (keySearch.length < 3 && keySearch.length > 0) {
      setResultSearchVariant([]);
    }
  }, [handleSearchProductData, keySearch]);

  return (
    <Styled>
      <React.Fragment>
        <AutoComplete
          notFoundContent={keySearch.length >= 3 ? "Không tìm thấy sản phẩm" : undefined}
          value={keySearch}
          id={id}
          dropdownMatchSelectWidth={530}
          onSelect={onVariantSelect}
          onSearch={handleSearchProductData}
          // onKeyDown={eventKeydownProduct}
          // onBlur={handleBlur}
          options={convertResultSearchVariant}
          maxLength={255}
          defaultActiveFirstOption
          ref={autoCompleteRef}
          dropdownClassName="search-layout dropdown-search-header"
          style={{ width: "100%" }}
        >
          <Input
            size="middle"
            placeholder="Tìm kiếm theo tên sản phẩm/ sku trên sàn"
            prefix={
              isSearchingProducts ? (
                <LoadingOutlined style={{ color: "#2a2a86" }} />
              ) : (
                <img alt="" src={search} />
              )
            }
          />
        </AutoComplete>
      </React.Fragment>
    </Styled>
  );
};

export default SearchProductComponent;
