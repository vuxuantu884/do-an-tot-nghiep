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
				<Col
					span={4}
					className="variant-img"
				>
					<img
						src={avatar === "" ? imgDefault : avatar}
						alt="anh"
						placeholder={imgDefault}
					/>
				</Col>
				<Col span={14}>
					<div className="variant-info">
						<span
							className="searchDropdown__productTitle"
							style={{ color: "#37394D" }}
							title={item.name}
						>
							{item.name}
						</span>
						<div className="variant-info-color-sku">{item.sku}</div>
					</div>
				</Col>
				<Col span={6}>
					<div style={{ textAlign: "right", padding: "0 20px" }}>
						<div style={{ display: "inline-block", textAlign: "right" }}>
							<Col style={{ color: "#222222" }}>
								{`${findPrice(item.variant_prices, AppConfig.currency)} `}
								<span
									style={{
										color: "#737373",
										textDecoration: "underline",
										textDecorationColor: "#737373",
									}}
								>
									đ
								</span>
							</Col>
							<div style={{ color: "#737373" }}>
								Có thể bán:
								<span
									style={{
										color:
											(item.available === null ? 0 : item.available) > 0
												? "#2A2A86"
												: "rgba(226, 67, 67, 1)",
									}}
								>
									{` ${item.available === null ? 0 : item.available}`}
								</span>
							</div>
						</div>
					</div>
				</Col>
			</Row>
		</StyledComponent>
	);
}

export default SearchedVariant;
