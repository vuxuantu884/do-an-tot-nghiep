import { Card, FormInstance, Image } from 'antd'
import { ColumnsType } from 'antd/lib/table';
import CustomTable from 'component/table/CustomTable';
import { PurchaseOrderLineItem } from 'model/purchase-order/purchase-item.model';
import React from 'react'
import {  formatCurrency } from 'utils/AppUtils';
import { Link } from 'react-router-dom';
import UrlConfig from 'config/url.config';
import ImageProduct from 'screens/products/product/component/image-product.component';
import NumberInput from 'component/custom/number-input.custom';
import { PurchaseProcumentLineItem } from 'model/purchase-order/purchase-procument';

interface LineItemsProps {
  formMain: FormInstance;
  line_items: Array<PurchaseOrderLineItem>;
  onQuantityChange: (quantity: any, index: any) => void;
  procurement_items: Array<PurchaseProcumentLineItem>;
}

const LineItems: React.FC<LineItemsProps> = (props: LineItemsProps) => {
  const { line_items, onQuantityChange, procurement_items } = props

  const getTotalQuantity = (): string => {
    let total = 0;
    line_items.forEach((element: PurchaseOrderLineItem) => {
      total += element.quantity;
    });

    return formatCurrency(total);
  }

  const getTotalReceivedQuantity = (): string => {
    let total = 0;
    line_items.forEach((element: PurchaseOrderLineItem) => {
      total += element.receipt_quantity;
    });

    return formatCurrency(total);
  }

  const getTotalRealQuantity = (): string => {
    let total = 0;
    procurement_items.forEach((element: PurchaseProcumentLineItem) => {
      total += element.real_quantity;
    });

    return formatCurrency(total);
  }

  const columns: ColumnsType<any> = [
    {
      title: "STT",
      align: "center",
      width: "40px",
      render: (value: string, record: PurchaseOrderLineItem, index: number) =>
        index + 1,
    },
    {
      title: "Ảnh",
      width: "60px",
      align: "center",
      dataIndex: "variant_images",
      render: (value: string | null) => {
        return (
          value ? <Image width={40} height={40} placeholder="Xem" src={value ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={value} />
        )
      }
    },
    {
      title: "Sản phẩm",
      width: "200px",
      className: "ant-col-info",
      align: "center",
      dataIndex: "variant",
      render: (value: string, record: PurchaseOrderLineItem) => (
        <div>
          <div>
            <div className="product-item-sku">
              <Link
                target="_blank"
                to={`${UrlConfig.PRODUCT}/${record.product_id}/variants/${record.id}`}
              >
                {record.sku}
              </Link>
            </div>
            <div className="product-item-name">
              <span className="product-item-name-detail">{value}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: <div>
        <div>SL đặt hàng
          (<span style={{ color: "#2A2A86" }} className="text-center">
            {getTotalQuantity()}
          </span>)
        </div>
      </div>,
      width: 100,
      align: "center",
      dataIndex: "quantity",
      render: (value, row, index) => value,
    },
    {
      title: <div>
        <div>SL đã nhận
          (<span style={{ color: "#2A2A86" }} className="text-center">
            {getTotalReceivedQuantity()}
          </span>)
        </div>
      </div>,
      width: 100,
      align: "center",
      dataIndex: "receipt_quantity",
      render: (value, row, index) => value,
    },
    {
      title: <div>
        <div>SL thực nhận (<span style={{ color: "#2A2A86" }} className="text-center">
          {getTotalRealQuantity()}
        </span>)

        </div>
      </div>,
      width: 100,
      align: "center",
      render: (_, item, index) => (
        <NumberInput
          placeholder="0"
          isFloat={false}
          maxLength={7}
          onChange={(quantity: number | null) => {
            if (quantity === null) return
            if (quantity > 1000000) {
              quantity = 1000000
            }
            onQuantityChange(quantity, index);
            getTotalRealQuantity()
          }}
          format={(value: string) => {
            if (Number(value) > 1000000) {
              return formatCurrency("1000000")
            }
            return formatCurrency(value ? value : 0, '')
          }}
        />
      ),
    },
  ];
  return (
    <Card
      title="THÔNG TIN SẢN PHẨM"
    >
      <CustomTable
        scroll={{ x: "max-content" }}
        className="inventory-table"
        rowClassName="product-table-row"
        tableLayout="fixed"
        pagination={false}
        columns={columns}
        dataSource={line_items}
        bordered={true}
        sticky
        footer={() =>
          line_items.length > 0 ? (
            <div style={{ background: '#f5f5f5' }} className="row-footer-custom">
              <div
                className="yody-foot-total-text"
                style={{
                  width: "32%",
                  float: "left",
                  fontWeight: 700,
                }}
              >
                TỔNG
              </div>

              <div
                style={{
                  width: "27.5%",
                  float: "left",
                  textAlign: "right",
                  fontWeight: 700,
                }}
              >
                {getTotalQuantity()}
              </div>

              <div
                style={{
                  width: "17%",
                  float: "left",
                  textAlign: "right",
                  fontWeight: 700,
                }}
              >
                {getTotalReceivedQuantity()}
              </div>

              <div
                style={{
                  width: "22%",
                  float: "left",
                  textAlign: "right",
                  color: "#000000",
                  fontWeight: 700,
                }}
              >
                {getTotalRealQuantity()}
              </div>
            </div>
          ) : (
            <div />
          )
        }
      />
    </Card>
  )
}

export default LineItems