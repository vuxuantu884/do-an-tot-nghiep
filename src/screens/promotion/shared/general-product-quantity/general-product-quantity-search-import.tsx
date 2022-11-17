import { Button, Input } from "antd";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import _ from "lodash";
import * as React from "react";
import { AiOutlineClose } from "react-icons/ai";
import { Link } from "react-router-dom";
import { DiscountUnitType } from "screens/promotion/constants";
import { formatCurrency } from "utils/AppUtils";

export interface IGeneralProductQuantitySearchImportProps {
  loadingDiscountVariant: boolean;
  onSearchVariant: (value: string) => void;
  onSelectVariant: (value: string) => void;
  listSearchVariant: any[];
  productSearchRef: any;
  setShowImportModal: (item: boolean) => void;
  typeSelectPromotion?: string;
  valueChangePromotion: number;
  listProductNotExcludeForPagging: any;
  onDeleteItem: (item: any) => void;
  handlePageChange: (page: number, pageSize?: number) => void;
  handleSizeChange: (current: number, size: number) => void;
}

export default function GeneralProductQuantitySearchImport(
  props: IGeneralProductQuantitySearchImportProps,
) {
  const {
    loadingDiscountVariant,
    onSearchVariant,
    onSelectVariant,
    listSearchVariant,
    productSearchRef,
    setShowImportModal,
    typeSelectPromotion,
    valueChangePromotion,
    listProductNotExcludeForPagging,
    onDeleteItem,
    handlePageChange,
    handleSizeChange,
  } = props;

  return (
    <div className="list-apply-product-promotion">
      <h4 style={{ fontWeight: 700 }}>Danh sách sản phẩm áp dụng:</h4>

      <Input.Group className="display-flex" style={{ marginTop: 20 }}>
        <CustomAutoComplete
          id="#product_search"
          dropdownClassName="product"
          placeholder="Thêm sản phẩm theo tên, mã SKU, mã vạch, ..."
          loading={loadingDiscountVariant}
          dropdownMatchSelectWidth={456}
          style={{ width: "100%" }}
          onSearch={_.debounce(onSearchVariant, 300)}
          onSelect={onSelectVariant}
          options={listSearchVariant}
          ref={productSearchRef}
          textEmpty={"Không tìm thấy sản phẩm"}
        />
        <Button style={{ width: 132, marginLeft: 10 }} onClick={() => setShowImportModal(true)}>
          Nhập file
        </Button>
      </Input.Group>

      <CustomTable
        className="product-table"
        style={{ marginTop: 20 }}
        bordered
        rowClassName="product-table-row"
        columns={[
          {
            title: "Sản phẩm",
            className: "ant-col-info",
            dataIndex: "",
            align: "left",
            width: "60%",
            render: (record) => {
              return (
                <div className="product-item-name">
                  <Link
                    to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
                  >
                    {record.sku ? record.sku : record.code}
                  </Link>
                </div>
              );
            },
          },
          {
            title: "Giá bán",
            align: "center",
            dataIndex: "retail_price",
            width: "20%",
            render: (retail_price: any) =>
              formatCurrency(retail_price) ? formatCurrency(retail_price) : 0,
          },

          {
            title: "Giá bán sau chiết khấu",
            align: "center",
            dataIndex: "retail_price",
            width: "20%",
            render: (retail_price: any) => {
              return (
                <>
                  {typeSelectPromotion === DiscountUnitType.PERCENTAGE.value && (
                    <span style={{ color: "#E24343" }}>
                      {formatCurrency(
                        valueChangePromotion === 0
                          ? retail_price
                          : retail_price - (retail_price * valueChangePromotion) / 100 > 0
                          ? retail_price - (retail_price * valueChangePromotion) / 100
                          : 0,
                      )}
                    </span>
                  )}

                  {typeSelectPromotion === DiscountUnitType.FIXED_AMOUNT.value && (
                    <span style={{ color: "#E24343" }}>
                      {formatCurrency(
                        valueChangePromotion === 0
                          ? retail_price
                          : retail_price - valueChangePromotion > 0
                          ? retail_price - valueChangePromotion
                          : 0,
                      )}
                    </span>
                  )}
                </>
              );
            },
          },
          {
            className: "ant-col-info",
            align: "right",
            width: "8%",
            render: (value: string, item) => (
              <Button
                style={{ margin: "0 auto" }}
                onClick={() => onDeleteItem(item)}
                className="product-item-delete"
                icon={<AiOutlineClose />}
              />
            ),
          },
        ]}
        dataSource={listProductNotExcludeForPagging.items ?? []}
        tableLayout="fixed"
        pagination={{
          pageSize: listProductNotExcludeForPagging?.metadata.limit,
          total: listProductNotExcludeForPagging?.metadata.total,
          current: listProductNotExcludeForPagging?.metadata.page,
          onChange: handlePageChange,
          onShowSizeChange: handleSizeChange,
          showSizeChanger: true,
        }}
        scroll={{ y: 300 }}
        rowKey={listProductNotExcludeForPagging.items.map(
          (item: any) => item.variant_id || item.product_id,
        )}
      />
    </div>
  );
}
