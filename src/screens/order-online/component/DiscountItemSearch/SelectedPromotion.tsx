import { CloseOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import React from "react";
import { formatCurrency } from "utils/AppUtils";
import { StyledComponent } from "./styled";
import discountCoupon from "assets/icon/discount-coupon.svg";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { CustomApplyDiscount } from "model/response/order/promotion.response";

type Props = {
  id?: string;
  data: CustomApplyDiscount[];
  handClose?: () => void;
  handleApplyDiscountItem?: (v: CustomApplyDiscount) => void;
};

const SelectedPromotion: React.FC<Props> = (props: Props) => {
  return (
    <StyledComponent>
      <Card
        id={props.id}
        className="card-promotion"
        title={
          <React.Fragment>
            <div className="title-promotion-name">Tên chương trình</div>
            <div className="title-promotion-before">Giá trị giảm</div>
            <div className="title-promotion-after">Giá sau ck</div>
            <div className="title-promotion-close">
              <CloseOutlined onClick={() => props.handClose && props.handClose()} />
            </div>
          </React.Fragment>
        }
      >
        {props.data.length !== 0 ? (
          props.data.map((p) => (
            <React.Fragment>
              <div className="row-item">
                <div className="row-item-name">
                  <img src={discountCoupon} alt="" />
                  <span>{p.title} </span>
                </div>
                <div className="row-item-value-before">
                  {formatCurrency(p.calculate_discount ?? 0)}{" "}
                  <span>{p.value_type === DiscountValueType.PERCENTAGE ? "%" : "đ"}</span>
                </div>
                <div className="row-item-value-after">{formatCurrency(p.after_value || 0)}</div>
                <div className="row-item-apply">
                  <Button
                    type="primary"
                    ghost
                    onClick={() => {
                      props.handleApplyDiscountItem && props.handleApplyDiscountItem(p);
                    }}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            </React.Fragment>
          ))
        ) : (
          <div>không tìm thấy kết quả</div>
        )}
      </Card>
    </StyledComponent>
  );
};

export default SelectedPromotion;
