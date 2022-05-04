import { Col, FormInstance, Image, Row, Tabs, Typography } from "antd";
import CustomTable from "component/table/CustomTable";
import UrlConfig from "config/url.config";
import { cloneDeep, isEmpty } from "lodash";
import { PurchaseOrderLineItem } from "model/purchase-order/purchase-item.model";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { PurchaseProcument, PurchaseProcumentLineItem } from "model/purchase-order/purchase-procument";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ICustomTableColumType } from "screens/ecommerce/table/CustomTable";
import ImageProduct from "screens/products/product/component/image-product.component";
import { formatCurrency } from "utils/AppUtils";
import { OFFSET_HEADER_TABLE } from "utils/Constants";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";

interface ProcurementFormProps {
  formMain: FormInstance;
  listPO: PurchaseOrder[];
}

const { TabPane } = Tabs;
const ProcurementResult: React.FC<ProcurementFormProps> = (props: ProcurementFormProps) => {
  const { listPO } = props

  const defaultColumn: ICustomTableColumType<any>[] = useMemo(() => {
    return ([
      {
        title: "STT",
        align: "center",
        fixed: "left",
        width: 50,
        render: (value, record, index) => index + 1,
      },
      {
        title: "Ảnh",
        align: "center",
        width: 60,
        dataIndex: 'variant_image',
        render: (url: string) => {
          return (
            <>
              {url ? <Image width={40} height={40} placeholder="Xem" src={url ?? ""} /> : <ImageProduct disabled={true} onClick={undefined} path={url} />}
            </>
          );
        },
        visible: true,
      },
      {
        title: "Mã Sản phẩm",
        align: "center",
        width: 120,
        dataIndex: "sku",
        render: (value: string, i: PurchaseOrderLineItem) => {
          return (
            <>
              <div>
                <Link to={`${UrlConfig.PRODUCT}/${i.product_id}${UrlConfig.VARIANTS}/${i.variant_id}`}>{value}</Link>
              </div>
            </>
          );
        },
        visible: true,
      },
      {
        title: "Tên Sản phẩm",
        align: "center",
        width: 120,
        dataIndex: "variant",
        render: (value: string, i: PurchaseOrderLineItem) => {
          return (
            <>
              <div>
                <Link to={`${UrlConfig.PRODUCT}/${i.product_id}${UrlConfig.VARIANTS}/${i.variant_id}`}>{value}</Link>
              </div>
            </>
          );
        },
        visible: true,
      },
      {
        title: "Giá bán",
        dataIndex: "price",
        align: "center",
        visible: true,
        width: 70,
        render: (value: number) => <div> {value !== null ? formatCurrency(value, ".") : "0"}</div>,
      },
      {
        title: "Số lượng đặt hàng",
        align: "center",
        dataIndex: "quantity",
        visible: true,
        width: 70,
        render: (value: number) => <div> {value !== null ? formatCurrency(value, ".") : "0"}</div>,
      },
      {
        title: "Số lượng thực nhận",
        dataIndex: "real_quantity",
        align: "center",
        width: 70,
        render: (value: string) => (
          value
        ),
        visible: true,
      },
    ])
  }, [])

  const renderTabTitle = (purchaseOrder: PurchaseOrder) => {
    return (
      <div style={{ textAlign: 'center' }}>
        <div>{purchaseOrder?.code}</div>
        <div style={{ fontSize: 12, fontWeight: 'bold' }}>{purchaseOrder?.reference}</div>
      </div>
    )
  }
  return (
    <Tabs defaultActiveKey={listPO[0].code}>
      
      {!isEmpty(listPO) && listPO.map((item: PurchaseOrder) => {
        const cloneProcurements = cloneDeep(item.procurements)
        const procurements = cloneProcurements.sort((a: PurchaseProcument, b: PurchaseProcument) => {
          let dateA: any = new Date(a.created_date as Date)
          let dateB: any = new Date(b.created_date as Date)
          return dateA - dateB
        })
        //Do hệ thống sẽ tự tạo procurement mới nên cần lấy ra procurement mới nhất đc tạo để hiển thị
        const latestProcurement: PurchaseProcument = procurements[procurements.length - 1]
        const procureMentMappingPrice = latestProcurement.procurement_items.map((el: PurchaseProcumentLineItem) => {
          for(let i =0; i< item.line_items.length; i++){
            if(el.sku === item.line_items[i].sku){
              return {...el, price: item.line_items[i].price}
            }
          }
          return {...el}
        })

        const calculatingReceiptQuantity = () => {
          const total = latestProcurement.procurement_items.map((el: PurchaseProcumentLineItem) => el.real_quantity).reduce((prev: number, current: number) =>
            prev + current, 0
          )
          return total
        }
        return (
          <TabPane tab={renderTabTitle(item)} key={item.code}>
            <Row gutter={50} style={{ marginTop: 15, marginBottom: 15 }}>
              <Col span={6}>Mã tham chiếu: {" "}
                <Typography.Text strong>{item?.reference}</Typography.Text>
              </Col>
              <Col span={6}>Ngày tạo đơn đặt hàng: {" "}
                <Typography.Text strong>{ConvertUtcToLocalDate(item.order_date, DATE_FORMAT.DDMMYYY)}</Typography.Text>
              </Col>
              <Col span={6}>Ngày nhận dự kiến: {" "}
                <Typography.Text strong>{ConvertUtcToLocalDate(latestProcurement.expect_receipt_date, DATE_FORMAT.DDMMYYY)}</Typography.Text>
              </Col>
              <Col span={6}>Tổng sản phẩm nhận: {" "}<Typography.Text strong>{calculatingReceiptQuantity()}</Typography.Text></Col>
            </Row>
            <CustomTable
              bordered
              scroll={{ x: 1200 }}
              sticky={{ offsetScroll: 5, offsetHeader: OFFSET_HEADER_TABLE }}
              pagination={false}
              dataSource={procureMentMappingPrice}
              columns={defaultColumn}
              className="yody-table-product-search small-padding"
            />
          </TabPane>
        )
      })}
    </Tabs>
  )
}

export default ProcurementResult
