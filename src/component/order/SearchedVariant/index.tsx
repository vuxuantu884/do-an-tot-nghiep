import { Col, Row } from "antd";
import imgDefault from "assets/icon/img-default.svg";
import { AppConfig } from "config/app.config";
import { VariantResponse } from "model/product/product.model";
import React from "react";
import { findPrice, findVariantAvatar } from "utils/AppUtils";

type PropTypes = {
  item: VariantResponse;
};
function SearchedVariant(props: PropTypes): JSX.Element {

	console.log('props', props)

  const {item} = props;

  let avatar = findVariantAvatar(item.variant_images);
		return (
			<Row>
				<Col
					span={4}
					style={{
						alignItems: "center",
						justifyContent: "center",
						display: "flex",
						padding: "4px 6px",
					}}
				>
					<img
						src={avatar === "" ? imgDefault : avatar}
						alt="anh"
						placeholder={imgDefault}
						style={{ width: "50%", borderRadius: 5 }}
					/>
				</Col>
				<Col span={14}>
					<div style={{ padding: "5px 0" }}>
						<span
							className="searchDropdown__productTitle"
							style={{ color: "#37394D" }}
							title={item.name}
						>
							{item.name}
						</span>
						<div style={{ color: "#95A1AC" }}>{item.sku}</div>
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
		);
}

export default SearchedVariant;
