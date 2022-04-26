import { Button, Modal, Typography, Upload } from "antd";
import { useCallback, useEffect, useState } from "react";
import { showError } from "utils/ToastUtils";
import excelIcon from "assets/icon/icon-excel.svg";
import { UploadOutlined } from "@ant-design/icons";
import * as XLSX from 'xlsx';
import { callApiNative } from "utils/ApiUtils";
import { searchVariantsApi } from "service/product/product.service";
import { VariantResponse } from "model/product/product.model";
import { useDispatch } from "react-redux";

export interface ModalImportProps {
  visible?: boolean;
  onOk: (res: any) => void;
  onCancel: () => void;
  title: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  dataTable?: Array<VariantResponse>
};

type ImportProps = {
  barcode: string,
  quantity: number
}

let firstLoad = true;

const ImportExcel: React.FC<ModalImportProps> = (
  props: ModalImportProps
) => {
  const { visible, onOk, onCancel, title, dataTable } =
    props;
  const [fileList, setFileList] = useState<Array<File>>([]);
  const [data, setData] = useState<Array<VariantResponse>>(dataTable ? [...dataTable]:[]);
  const dispatch = useDispatch();

  const ActionImport = {
    Ok: useCallback(() => {
      
      onOk(data);
    }, [onOk,data]),
    Cancel: useCallback(()=>{
      firstLoad = true;
      setFileList([]);
      onCancel();
    }, [onCancel]),
  }

  const onRemoveFile = (file: any) => {
    setFileList([]);
  }

  const uploadProps  = {
    beforeUpload: (file: any) => {
      const typeExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (!typeExcel) {
        showError("Chỉ chọn file excel");
      }
      setFileList([file]);
      return typeExcel || Upload.LIST_IGNORE;
    },
    onChange: useCallback(async (e:any)=>{
      if (!firstLoad) {
        return;
      }
      firstLoad = false;
      const file = e.file;
      const dataExcel = await file.originFileObj.arrayBuffer();
      const workbook = XLSX.read(dataExcel);

      const workSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any = XLSX.utils.sheet_to_json(workSheet);
      if (jsonData && data && data.length > 0) {
        let convertData: Array<ImportProps> = [];
        for (let i = 0; i < jsonData.length; i++) {
          const element = jsonData[i];
          
          const findIndex = convertData.findIndex(e=>e.barcode && (e.barcode.toString() === element.barcode.toString()));
          if (findIndex >= 0) {
            convertData[findIndex].quantity += element.quantity ?? 1;
          }else{
            convertData.push({
              barcode :element.barcode,
              quantity :element.quantity ?? 1,
            });
          }
        }

        if (convertData && convertData.length > 0) {
          for (let i = 0; i < convertData.length; i++){ 
            const element = convertData[i];
            const fi = data?.findIndex((e:VariantResponse) =>e.barcode === element.barcode);

            if (fi >= 0) {
              data[fi].real_quantity = element.quantity;
            }else{
              //call api lấy sản phẩm vào phiếu
              let res = await callApiNative({isShowLoading: true},dispatch,searchVariantsApi,{barcode: element.barcode,store_ids: null});
              if (res && res.items && res.items.length > 0) {
                let newItem: VariantResponse = {
                  ...res.items[0],
                  id: null,
                  variant_id: res.items[0].id, 
                  transfer_quantity: 0,
                  real_quantity: null
                }

                const findIndex = convertData.findIndex(e=>e.barcode && (e.barcode.toString() === newItem.barcode.toString()));
                
                if (findIndex >= 0) {
                  newItem.real_quantity = convertData[findIndex].quantity;
                }

                data.push(newItem);
              }
            }
          }
        }
      }
      console.log('data',data);
    },[data, dispatch])
  }

  const exportTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{
      'barcode': null,
      'quantity': null,
    }]);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "data");
    const fileName = `import_so_luong_thuc_nhan.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }  

  const checkDisableOkButton = useCallback(() => {
    return !fileList.length;
  }, [fileList.length]);

  useEffect(() => {
    setData(dataTable ? [...dataTable]:[]);
  }, [dataTable]);

  return (
    <Modal
      onCancel={ActionImport.Cancel}
      onOk={ActionImport.Ok}
      width={650}
      centered
      visible={visible}
      title={title}
      okText="Nhập file"
      cancelText="Hủy bỏ"
      okButtonProps={{ disabled: checkDisableOkButton() }}
    >
      <div>
        <Typography.Text>
          <img src={excelIcon} alt="" /> <a href="/" onClick={exportTemplate}>file import thực nhận mẫu (.xlsx)</a>
        </Typography.Text>
        <div style={{ marginTop: "20px", marginBottom: "5px" }}><b>Tải file lên</b></div>
        <Upload
          onRemove={onRemoveFile}
          maxCount={1}
          {...uploadProps}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        >
          <Button icon={<UploadOutlined />}>Chọn file</Button>
        </Upload>
      </div>
    </Modal>
  );
};

export default ImportExcel;
