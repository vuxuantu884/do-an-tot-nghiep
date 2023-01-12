import { Col, Row } from "antd";
import UrlConfig from "config/url.config";
import { SpecialOrderResponseModel } from "model/order/special-order.model";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, isNullOrUndefined } from "utils/AppUtils";
import { getArrayFromObject } from "utils/OrderUtils";
import { specialOrderTypes } from "../SideBarOrderSpecial/helper";
import { StyledComponent } from "./styles";

type Props = {
  specialOrder?: SpecialOrderResponseModel | null;
};

function SpecialOrderDetail(props: Props) {
  const { specialOrder } = props;

  const specialOrderTypesArr = getArrayFromObject(specialOrderTypes);

  const [variantSkus, setVariantSkus] = useState<string[]>([]);

  const renderVariants = () => {
    if (!specialOrder?.variant_skus) {
      return null;
    }

    return variantSkus.map((variantSku, index) => {
      return (
        <React.Fragment>
          {variantSku}
          {index + 1 < variantSkus.length && ", "}
        </React.Fragment>
      );
    });
  };

  const ordersSpecialDetail = [
    {
      title: "Loại",
      content: specialOrderTypesArr.find((type) => type.value === specialOrder?.type)?.title,
    },
    {
      title: "Nhân viên CSĐH",
      content: specialOrder?.order_carer_code
        ? `${specialOrder?.order_carer_code} - ${specialOrder?.order_carer_name}`
        : null,
    },
    {
      title: "Sàn",
      content: specialOrder?.ecommerce,
    },
    {
      title: "Đơn gốc",
      content: specialOrder?.order_original_code ? (
        <Link to={`${UrlConfig.ORDER}/${specialOrder?.order_original_code}`} target="_blank">
          {specialOrder?.order_original_code}
        </Link>
      ) : null,
    },
    {
      title: "Sản phẩm",
      content: renderVariants(),
    },
    {
      title: "Đơn trả",
      content: specialOrder?.order_return_code ? (
        <Link to={`${UrlConfig.ORDERS_RETURN}/${specialOrder?.order_return_code}`}>
          {specialOrder?.order_return_code}
        </Link>
      ) : null,
    },

    {
      title: "Số tiền",
      content: !isNullOrUndefined(specialOrder?.amount)
        ? formatCurrency(specialOrder?.amount || 0)
        : null,
    },
    {
      title: "Lý do",
      content: specialOrder?.reason,
    },
  ];

  useEffect(() => {
    if (!specialOrder?.variant_skus) {
      return;
    }
    const variantSkus = specialOrder?.variant_skus.split(",");

    if (variantSkus && variantSkus.length > 0) {
      setVariantSkus(variantSkus);
    } else {
      setVariantSkus([]);
    }
  }, [specialOrder?.variant_skus]);

  return (
    <StyledComponent>
      <React.Fragment>
        {ordersSpecialDetail.map(
          (single, index) =>
            single.content && (
              <Row className={`orders_special_detail`} gutter={5} key={index}>
                <Col span={10} className="orders_special_detail_title">
                  {single.title}:
                </Col>
                <Col span={14} className="orders_special_detail_content">
                  {single.content}
                </Col>
              </Row>
            ),
        )}
      </React.Fragment>
    </StyledComponent>
  );
}

export default SpecialOrderDetail;
