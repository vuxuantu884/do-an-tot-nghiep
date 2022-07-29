import { Col, Row } from "antd";
import imgDefault from "assets/icon/img-default.svg";
import { AppConfig } from "config/app.config";
import { VariantResponse } from "model/product/product.model";
import React from "react";
import { findPrice, findVariantAvatar } from "utils/AppUtils";
import { StyledComponent } from "./style";

type PropTypes = {
  item: VariantResponse;
};
function SearchedVariant(props: PropTypes): JSX.Element {
  const { item } = props;

  let avatar = findVariantAvatar(item.variant_images);
  return (
    <StyledComponent>
      <Row className="selected-searched-variant">
        <Col span={3} className="variant-columns-1">
          <img src={avatar === "" ? imgDefault : avatar} alt="anh" placeholder={imgDefault} />
        </Col>
        <Col span={15} className="variant-columns-2">
          <span
            className="searchDropdown__productTitle yody-text-ellipsis"
            style={{ color: "#37394D" }}
            title={item.name}
          >
            {item.name}
          </span>
          <div className="variant-info-color-sku yody-text-ellipsis">{item.sku}</div>
        </Col>
        <Col span={6} className="variant-columns-3">
          <Col className="black-color">
            {`${findPrice(item.variant_prices, AppConfig.currency)} `}
            <span className="gray-color price">đ</span>
          </Col>
          <div className="gray-color yody-text-ellipsis">
            <span>Có thể bán:</span>
            <span
              style={{
                color:
                  (item.available === null ? 0 : item.available) > 0
                    ? "#2A2A86"
                    : "rgba(226, 67, 67, 1)",
              }}
            >
              {` ${item.available === null ? 0 : item.available}`}{" "}
            </span>
          </div>
        </Col>
      </Row>
    </StyledComponent>
  );
}

export default SearchedVariant;
