import { Button, Table } from "antd";
import { DiscountValueType } from "model/promotion/price-rules.model";
import { CustomApplyDiscount } from "model/response/order/promotion.response";
import React from "react";
import { formatCurrency } from "utils/AppUtils";
import discountCoupon from "assets/icon/discount-coupon.svg";
type Props = {
  data: CustomApplyDiscount[];
  handClose?: () => void;
  handleApplyDiscountItem?: (v: CustomApplyDiscount) => void;
};

const TableSelectedPromotion: React.FC<Props> = (props: Props) => {
  return (
    <React.Fragment>
      <Table
        columns={[
          {
            title: "Tên chương trình",
            dataIndex: "title",
            width: "40%",
            render: (value) => {
              return (
                <div className="name-row">
                  <img src={discountCoupon} alt="" />
                  <span style={{ paddingLeft: 10 }}>{value}</span>
                </div>
              );
            },
          },
          {
            title: "Giá trị giảm",
            dataIndex: "value",
            width: "20%",
            render: (value, item: any) => {
              return (
                <div className="row-item-value">
                  <span>{formatCurrency(value)}</span>
                  <span>{item.value_type === DiscountValueType.PERCENTAGE ? "%" : "đ"}</span>
                </div>
              );
            },
          },
          {
            title: "Giá sau ck",
            dataIndex: "after_value",
            width: "20%",
            render: (value, item: any) => {
              return (
                <div className="row-item-value-after">
                  <span>{formatCurrency(value)} đ</span>
                </div>
              );
            },
          },
          {
            width: "20%",
            render: (text: string, item: any) => {
              return (
                <Button
                  key="submit"
                  type="primary"
                  ghost
                  onClick={() =>
                    props.handleApplyDiscountItem && props.handleApplyDiscountItem(item)
                  }
                >
                  Áp dụng
                </Button>
              );
            },
          },
        ]}
        dataSource={props.data}
        bordered
        pagination={false}
        locale={{
          emptyText: <p>Không có dữ liệu!</p>,
        }}
        className="table-discount"
        scroll={{ y: 240 }}
      ></Table>
    </React.Fragment>
  );
};

export default TableSelectedPromotion;
