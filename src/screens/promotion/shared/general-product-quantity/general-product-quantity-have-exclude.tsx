import React, { useContext } from "react";
import { Button, Input, Radio } from "antd";
import CustomAutoComplete from "component/custom/autocomplete.cusom";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import _ from "lodash";
import { AiOutlineClose } from "react-icons/ai";
import { Link } from "react-router-dom";
import { formatCurrency } from "utils/AppUtils";
import { AllOrExcludeProductEnum } from "screens/promotion/constants";
import { IssueContext } from "screens/promotion/issue/components/issue-provider";

export interface IGeneralProductQuantityHaveExcludeProps {
  loadingDiscountVariant: boolean;
  onSearchVariant: (value: string) => void;
  onSelectVariant: (value: string) => void;
  listSearchVariant: any[];
  productSearchRef: any;
  setShowImportModal: (item: boolean) => void;
  listProductHaveExcludeForPagging: any;
  onDeleteItem: (item: any) => void;
  handlePageChange: (page: number, pageSize?: number) => void;
  handleSizeChange: (current: number, size: number) => void;
}

export default function GeneralProductQuantityHaveExclude(
  props: IGeneralProductQuantityHaveExcludeProps,
) {
  const {
    loadingDiscountVariant,
    onSearchVariant,
    onSelectVariant,
    listSearchVariant,
    productSearchRef,
    setShowImportModal,
    listProductHaveExcludeForPagging,
    onDeleteItem,
    handlePageChange,
    handleSizeChange,
  } = props;

  const {
    releaseWithExcludeOrAllProduct,
    setReleaseWithExcludeOrAllProduct,
  } = useContext(IssueContext);
  const handleChangeReleaseHaveExcludeOrAllProduct = (value: string) => {
    setReleaseWithExcludeOrAllProduct(value);
  };

  const columns: Array<ICustomTableColumType<any>> = [
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
              target="_blank"
              to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.variant_id}`}
            >
              {record.sku}
            </Link>
          </div>
        );
      },
    },
    {
      title: "Giá bán",
      align: "center",
      dataIndex: "retail_price",
      width: "40%",
      render: (retail_price: any) =>
        formatCurrency(retail_price) ? formatCurrency(retail_price) : 0,
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
  ];


  return (
    <div className="list-apply-product-promotion">
      <div style={{ display: "flex" }}>
        <span style={{ paddingLeft: 12 }}>
          <Radio.Group
            value={releaseWithExcludeOrAllProduct}
            onChange={(e) => handleChangeReleaseHaveExcludeOrAllProduct(e.target.value)}
          >
            <Radio value={AllOrExcludeProductEnum.ALL}>Tất cả sản phẩm</Radio>
            <Radio value={AllOrExcludeProductEnum.HAVE_EXCLUDE}>Danh sách loại trừ</Radio>
          </Radio.Group>
        </span>
      </div>

      {releaseWithExcludeOrAllProduct === AllOrExcludeProductEnum.HAVE_EXCLUDE && (
        <>
          <Input.Group style={{ marginTop: 20, display: "flex" }}>
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
            columns={columns}
            dataSource={listProductHaveExcludeForPagging.items ?? []}
            tableLayout="fixed"
            pagination={{
              pageSize: listProductHaveExcludeForPagging.metadata?.limit,
              total: listProductHaveExcludeForPagging.metadata?.total,
              current: listProductHaveExcludeForPagging.metadata?.page,
              onChange: handlePageChange,
              onShowSizeChange: handleSizeChange,
              showSizeChanger: true,
            }}
            scroll={{ y: 300 }}
            rowKey={listProductHaveExcludeForPagging.items.map(
              (item: any) => item.variant_id || item.product_id,
            )}
          />
        </>
      )}
    </div>
  );
}
