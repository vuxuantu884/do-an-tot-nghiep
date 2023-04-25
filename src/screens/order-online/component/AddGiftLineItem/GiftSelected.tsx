import { Table, Tooltip } from "antd";
import { ColAddGift } from "./styled";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import React from "react";
import { ApplyDiscountGiftsResponseModel } from "model/response/order/promotion.response";
import { ColumnsType } from "antd/lib/table";

type Props = {
  itemsGift?: ApplyDiscountGiftsResponseModel[];
  rowsSelected: number[];
  onChangeSelected: (rows: ApplyDiscountGiftsResponseModel[]) => void;
};
const GiftSelected: React.FC<Props> = (props: Props) => {
  const columns: ColumnsType<ApplyDiscountGiftsResponseModel> = [
    {
      title: "Sản phẩm",
      render: (a: ApplyDiscountGiftsResponseModel, item: any, index: number) => (
        <>
          <div className="yody-pos-sku">
            <Link
              target="_blank"
              to={`${UrlConfig.PRODUCT}/${a.product_id}/variants/${a.variant_id}`}
            >
              {a.sku}
            </Link>
          </div>
          <div className="yody-pos-varian">
            <Tooltip title={a.name} className="yody-pos-varian-name">
              <span>{a.name}</span>
            </Tooltip>
          </div>
        </>
      ),
    },
    {
      title: "Số lượng",
      width: "100px",
      align: "center",
      render: (a: ApplyDiscountGiftsResponseModel, b: any, index: number) => (
        <div>{a.quantity}</div>
      ),
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: ApplyDiscountGiftsResponseModel[]) => {
      props.onChangeSelected(selectedRows);
    },
  };

  return (
    <>
      <ColAddGift span={14}>
        <h4>Thêm quà tặng</h4>
        <Table
          rowSelection={{
            selectedRowKeys: props.rowsSelected,
            type: "checkbox",
            ...rowSelection,
          }}
          locale={{
            emptyText: "Quà tặng trống",
          }}
          pagination={false}
          dataSource={props.itemsGift}
          columns={columns}
          rowKey={(record) => record.variant_id}
        />
      </ColAddGift>
    </>
  );
};

export default GiftSelected;
