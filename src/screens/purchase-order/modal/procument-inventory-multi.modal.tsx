import { Button, Col, Modal, Row, Table, Upload } from "antd";
import {
  POProcumentLineItemField,
  PurchaseProcument,
  PurchaseProcumentLineItem,
} from "model/purchase-order/purchase-procument";
import imgDefIcon from "assets/img/img-def.svg";
import NumberInput from "component/custom/number-input.custom";
import { POUtils } from "utils/POUtils";

import { Fragment, ReactNode, useCallback, useEffect, useState } from "react";
import { PurchaseOrder } from "model/purchase-order/purchase-order.model";
import { formatCurrency, replaceFormatString } from "utils/AppUtils"; 
import RowDetail from "component/custom/RowDetail";
import { PhoneOutlined } from "@ant-design/icons";
import { ConvertUtcToLocalDate, DATE_FORMAT } from "utils/DateUtils";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch } from "react-redux";
import { getProcurementsMerge } from "service/purchase-order/purchase-procument.service";
import * as XLSX from 'xlsx';
import { showError } from "utils/ToastUtils";
import { PurchaseProcumentExportField } from "model/purchase-order/purchase-mapping";
import * as FileSaver from 'file-saver';

type ProcumentInventoryModalProps = { 
  visible: boolean;
  poData?: PurchaseOrder | undefined;
  onCancel: () => void;
  listProcurement: Array<PurchaseProcument> | undefined;
  onOk: (value: Array<PurchaseProcumentLineItem>) => void;
  loading: boolean;
  title: ReactNode
};

const ProducmentInventoryMultiModal: React.FC<ProcumentInventoryModalProps> = (
  props: ProcumentInventoryModalProps
) => {
  const {
    visible,  
    title,
    onCancel,
    onOk,
    listProcurement,
    poData
  } = props; 

  const [dataTable, setDataTable] = useState<Array<PurchaseProcumentLineItem>>([]); 
  const dispatch = useDispatch();
  const onQuantityChange = useCallback(
    (quantity, index: number, item: PurchaseProcumentLineItem) => {
      let cusData = [...dataTable];
      cusData.forEach((e)=>{
        if (e.sku=== item.sku) 
          e.real_quantity = quantity;
      });
      setDataTable(cusData);
    },
    [dataTable]
  );  

  const okModal  = useCallback(()=>{
    onOk(dataTable);
  },[dataTable, onOk]);

  const getProcurementItems = useCallback(async ()=>{
    if (listProcurement && listProcurement.length > 0) {
      const arrId = listProcurement?.map(e=>e.id) ?? [];
      const res: PurchaseProcument = await callApiNative({isShowLoading: false},dispatch,getProcurementsMerge, arrId.toString());
      if (res) {
        setDataTable(res.procurement_items)
      }
    }
  },[listProcurement, dispatch]);

  const exportExcel= useCallback(()=>{
    let dataExport:any = [];
    for (let i = 0; i < dataTable.length; i++) {
      const e = dataTable[i];
      let item = { [PurchaseProcumentExportField.sku]: e.sku,
        [PurchaseProcumentExportField.variant]: e.variant,
        [PurchaseProcumentExportField.sld]: e.ordered_quantity,
        [PurchaseProcumentExportField.sldduyet]: e.quantity,
        [PurchaseProcumentExportField.sl]: null,};

      dataExport.push(item);
    } 
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const fileName = poData?.code ?  `nhap_so_luong_phieu_nhap_kho_${poData?.code}.xlsx`:"nhap_so_luong_phieu_nhap_kho.xlsx";
    //XLSX.writeFile(workbook, fileName);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName);
},[poData,dataTable]);

  const uploadProps  = {
    beforeUpload: (file: any) => {
      const typeExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!typeExcel) {
        showError("Chỉ chọn file excel");
      }
      return typeExcel || Upload.LIST_IGNORE;
    },
    onChange: useCallback(async (e:any)=>{ 
      const file = e.file; 
      const data = await file.originFileObj.arrayBuffer();
      const workbook = XLSX.read(data);

      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any = XLSX.utils.sheet_to_json(workSheet);
      
      dataTable.forEach((e:PurchaseProcumentLineItem) => {
        const findItem = jsonData.find((item:any)=>(item.sku !== undefined && item.sku.toString() === e.sku.toString()));
        if (findItem && typeof(findItem.sl) === "number") {
            e.real_quantity = findItem.sl;
        }
      });
      setDataTable([...dataTable]);
    },[dataTable])
  } 

  useEffect(()=>{
    getProcurementItems();
  },[getProcurementItems, listProcurement]);

  if (visible) {  
    return ( 
      <Modal
        visible={visible}
        width={920}
        centered
        title={title}
        footer={
            <>
            <Button danger onClick={onCancel}>
              Hủy
            </Button>
            <Button onClick={exportExcel}>
              Export Excel
            </Button>
            <Button>
                <Upload {...uploadProps} maxCount={1} showUploadList={false}>
                    <>Import Excel</>
                 </Upload>
            </Button>
            <Button type="primary" onClick={okModal}>
              Xác nhận nhập
            </Button>
          </>
        }
        okText={undefined}
      >
         <Row gutter={50}>
              <Col span={12}>
                <RowDetail title="Ngày nhận dự kiến" value={listProcurement ? ConvertUtcToLocalDate(listProcurement[0].expect_receipt_date ?? "", DATE_FORMAT.DDMMYYY): ""} ></RowDetail>
              </Col>
              <Col span={12}>
                <RowDetail title="Kho nhận hàng" value={listProcurement ? listProcurement[0].store ?? "" : ""} ></RowDetail>
              </Col> 
         </Row>
         <Row gutter={50}>
              <Col span={12}>
                <RowDetail title="Nhà cung cấp" value={listProcurement ? listProcurement[0].purchase_order.supplier : ""} ></RowDetail>
              </Col>
              <Col span={12}>
                <div className="row-detail">
                  <div className="title"><PhoneOutlined/></div>
                  <div className="dot data">:</div>
                  <div className="row-detail-right data">{listProcurement ? listProcurement[0].purchase_order.phone : ""}</div>
                </div>
              </Col> 
         </Row>
         <Table
          className="product-table"
          rowKey={(record: PurchaseProcumentLineItem) =>
            record.line_item_id
          }
          rowClassName="product-table-row"
          dataSource={dataTable}
          tableLayout="fixed"
          scroll={{ y: 400, x: 845 }}
          pagination={false}
          columns={[
            {
              title: "STT",
              align: "center",
              width: 60,
              render: (value, record, index) => index + 1,
            },
            {
              title: "Ảnh",
              width: 60,
              dataIndex: POProcumentLineItemField.variant_image,
              render: (value) => (
                <div className="product-item-image">
                  <img
                    src={value === null ? imgDefIcon : value}
                    alt=""
                    className=""
                  />
                </div>
              ),
            },
            {
              title: "Sản phẩm",
              width: "99%",
              className: "ant-col-info",
              dataIndex: POProcumentLineItemField.variant,
              render: (
                value: string,
                item: PurchaseProcumentLineItem,
                index: number
              ) => (
                <div>
                  <div>
                    <div className="product-item-sku">{item.sku}</div>
                    <div className="product-item-name">
                      <span className="product-item-name-detail">
                        {value}
                      </span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: (
                <div
                  style={{
                    width: "100%",
                    textAlign: "right",
                    flexDirection: "column",
                    display: "flex",
                  }}
                >
                  SL Đặt hàng
                  <div style={{ color: "#2A2A86", fontWeight: "normal" }}>
                    ({formatCurrency(POUtils.totalOrderQuantityProcument(dataTable),".")})
                  </div>
                </div>
              ),
              width: 130,
              dataIndex: POProcumentLineItemField.ordered_quantity,
              render: (value, item, index) => (
                <div style={{ textAlign: "right" }}>{formatCurrency(value,".")}</div>
              ),
            },
            {
              title: (
                <div
                  style={{
                    width: "100%",
                    textAlign: "right",
                    flexDirection: "column",
                    display: "flex",
                  }}
                >
                  SL nhận được duyệt
                </div>
              ),
              width: 130,
              dataIndex: POProcumentLineItemField.quantity,
              render: (value, item, index) => (
                <div style={{ textAlign: "right" }}>{value}</div>
              ),
            },
            {
              title: (
                <div
                  style={{
                    width: "100%",
                    textAlign: "right",
                    flexDirection: "column",
                    display: "flex",
                  }}
                >
                  SL thực nhận
                </div>
              ),
              width: 150,
              dataIndex: POProcumentLineItemField.real_quantity,
              render: (value, item, index) => {
                return (
                <NumberInput
                  placeholder="SL thực nhận"
                  isFloat={false}
                  value={value}
                  min={0}
                  // max={item.quantity}
                  default={0}
                  maxLength={8}
                  onChange={(quantity: number | null) => {
                    onQuantityChange(quantity, index,item);
                  }}
                  format={(a: string) => formatCurrency(a)}
                  replace={(a: string) =>
                    replaceFormatString(a)
                  }
                />
              )},
            },
          ]}
         summary={(data) => {
           let ordered_quantity = 0;
           let quantity = 0;
           let real_quantity = 0;
           data.forEach((item) => {
             ordered_quantity = ordered_quantity + item.ordered_quantity;
             quantity = quantity + item.quantity;
             real_quantity = real_quantity + item.real_quantity;
           });
           return (
             <Table.Summary>
               <Table.Summary.Row>
                 <Table.Summary.Cell align="left" colSpan={3} index={0}>
                   <div style={{ fontWeight: 700 }}>Tổng</div>
                 </Table.Summary.Cell>
                 <Table.Summary.Cell align="right" index={1}>
                   <div style={{ fontWeight: 700 }}>
                     {formatCurrency(ordered_quantity,".")}
                   </div>
                 </Table.Summary.Cell>
                 <Table.Summary.Cell align="right" index={2}>
                   <div style={{ fontWeight: 700 }}>{formatCurrency(quantity,".")}</div>
                 </Table.Summary.Cell>
                 <Table.Summary.Cell align="right" index={3}>
                   <div style={{ fontWeight: 700, marginRight: 15 }}>
                     {formatCurrency(real_quantity,".")}
                   </div>
                 </Table.Summary.Cell>
               </Table.Summary.Row>
             </Table.Summary>
           );
         }}
        /> 
     </Modal> 
    );
  } else return <Fragment />;
};

export default ProducmentInventoryMultiModal;
