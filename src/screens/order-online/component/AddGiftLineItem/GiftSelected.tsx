import { Input, InputNumber, Space, Table, Tooltip } from "antd";
import { ColAddGift } from "./styled";
import { Link } from "react-router-dom";
import UrlConfig from "config/url.config";
import React, { useState, useEffect } from "react";
import { ApplyDiscountGiftsResponseModel } from "model/response/order/promotion.response";
import { ColumnsType } from "antd/lib/table";
import { SearchOutlined } from "@ant-design/icons";
import { fullTextSearch } from "utils/StringUtils";
import _ from "lodash";

type Props = {
  itemsGift?: ApplyDiscountGiftsResponseModel[];
  rowsSelected: number[];
  onChangeSelected: (rows: ApplyDiscountGiftsResponseModel[]) => void;
};
const GiftSelected: React.FC<Props> = (props: Props) => {
  const [search, setSearch] = useState("");
  const [dataSource, setDataSource] = useState<ApplyDiscountGiftsResponseModel[]>([]);
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
        <InputNumber
          disabled
          min={1}
          value={a.quantity}
          className="quantity-columns"
          onChange={(e) => {
            onChangeQuantity(index, e);
          }}
        />
      ),
    },
  ];

  const onChangeQuantity = (index: number, quantity: number) => {
    const dataSourceClone = _.cloneDeep(dataSource);
    dataSourceClone[index].quantity = quantity;
    setDataSource(dataSourceClone);

    const selectedVariant = dataSourceClone.filter((p) =>
      props.rowsSelected.includes(p.variant_id),
    );
    props.onChangeSelected(selectedVariant);
  };

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: ApplyDiscountGiftsResponseModel[]) => {
      props.onChangeSelected(selectedRows);
    },
  };

  useEffect(() => {
    setDataSource(props.itemsGift || []);
  }, [props.itemsGift]);

  console.log("dataSource gift", dataSource);
  return (
    <>
      <ColAddGift span={14}>
        <Space align="center" direction="horizontal" className="gift-item-title">
          <h4>Thêm quà tặng</h4>
          <Input
            style={{ width: "200px" }}
            size="small"
            placeholder="Tìm kiếm sản phẩm"
            suffix={<SearchOutlined />}
            onChange={(e) => {
              setSearch(e.target.value || "");
            }}
            onPressEnter={() => {
              const searchGift: any = document.getElementById("search-gift");
              searchGift?.select();
            }}
            id="search-gift"
          />
        </Space>

        <Table
          className="gift-table-order-online"
          rowSelection={{
            selectedRowKeys: props.rowsSelected,
            type: "checkbox",
            ...rowSelection,
          }}
          locale={{
            emptyText: "Quà tặng trống",
          }}
          pagination={false}
          dataSource={dataSource.filter(
            (p) =>
              fullTextSearch(search, p.name) ||
              fullTextSearch(search, p.sku) ||
              fullTextSearch(search, p.barcode),
          )}
          columns={columns}
          rowKey={(record) => record.variant_id}
          scroll={{ x: "auto", y: 500 }}
        />
      </ColAddGift>
    </>
  );
};

export default GiftSelected;
