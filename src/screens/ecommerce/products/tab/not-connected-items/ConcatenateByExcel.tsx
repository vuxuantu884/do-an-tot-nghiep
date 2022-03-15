import React, {useCallback, useEffect, useState} from "react";
import { useDispatch } from "react-redux";
import { Button, Modal, Upload, Form, Select, Row, Col} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {showSuccess, showWarning} from "utils/ToastUtils";
import {getShopEcommerceList} from "domain/actions/ecommerce/ecommerce.actions";
import { getEcommerceIcon } from "screens/ecommerce/common/commonAction";
import {concatenateByExcelAction} from "domain/actions/ecommerce/ecommerce.actions"
import ProgressConcatenateByExcelModal from "./ProgressConcatenateByExcel"
import {HttpStatus} from "config/http-status.config";
import BaseResponse from "base/base.response";
import {getEcommerceJobsApi} from "service/ecommerce/ecommerce.service";
import { isNullOrUndefined } from "utils/AppUtils";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";

type ConcatenateByExcelType = {
  onCancelConcatenateByExcel: () => void;
  onOkConcatenateByExcel: () => void;
};

const ConcatenateByExcel: React.FC<ConcatenateByExcelType> = (props:ConcatenateByExcelType) => {
  
  const {onCancelConcatenateByExcel, onOkConcatenateByExcel} = props
  
  const dispatch = useDispatch();
  
  const [isVisibleProgressModal, setIsVisibleProgressModal] = useState<boolean>(false);
  const [fileList, setFileList] = useState<Array<File>>([]);
  const [ecommerceShopList, setEcommerceShopList] = useState<Array<any>>([]);
  const [importProgressPercent, setImportProgressPercent] = useState<number>(0);
  const [processId, setProcessId] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isVisibleExitConcatenateByExcelModal, setIsVisibleExitConcatenateByExcelModal] = useState<boolean>(false);
  const [isVisibleImportModal, setIsVisibleImportModal] = useState(true);
  const [selectedShopId, setSelectedtShopId] = useState<number>(0);

  useEffect(() => {
    dispatch(getShopEcommerceList({}, setEcommerceShopList));
  }, [dispatch]);

  // Upload file
  const beforeUploadFile = useCallback((file) => {
    const isExcelFile = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel';
    if (!isExcelFile) {
      showWarning('Vui lòng chọn đúng định dạng file excel .xlsx .xls');
      return Upload.LIST_IGNORE;
    } else {
      setFileList([file]);
      return false;
    }
  }, [])

  const onRemoveFile = (file: any) => {
    setFileList([]);
  }

  const listShopOption = ecommerceShopList.map((shop: any) => (
    <Select.Option key={shop.id} value={shop.id}>
      <div>
      <img
        src={getEcommerceIcon(shop.ecommerce)}
        alt={shop.id}
        style={{ marginRight: "5px", height: "16px" }}
      />
      {shop.name }
      </div>
      
    </Select.Option>
  ))

  const onCancelConcatenateByExcelModal = () => {
    setIsVisibleImportModal(false);
    onCancelConcatenateByExcel && onCancelConcatenateByExcel();
  }

  const checkDisableOkButton = useCallback(() => {
    return !fileList.length || !selectedShopId;
  }, [fileList.length, selectedShopId]);

  
  const onOkImportModal = () => {
    if (fileList?.length) {
      const formData = new FormData();
      formData.append("file_upload", fileList[0]);
      formData.append("shop_id", selectedShopId.toString());
      dispatch(concatenateByExcelAction(formData,  callbackImportExcel));
    } else {
      showWarning("Vui lòng chọn file!")
    }
  }


  const callbackImportExcel = (response: any) => {
    setIsVisibleImportModal(false);
    if (response) {
      setProcessId(response.data.process_id);
      setIsVisibleProgressModal(true);
      setIsDownloading(true);
    } else {
      onCancelConcatenateByExcel && onCancelConcatenateByExcel();
    }
  }

  const resetProgress = () => {
    setProcessId(null);
    setImportProgressPercent(0);
    setProgressData(null);
  }

  const onCancelProgressConcatenateByExcel = () => {
    setIsVisibleExitConcatenateByExcelModal(true);
  }

  const onOKProgressConcatenateByExcel = () => {
    resetProgress();
    setIsVisibleProgressModal(false);
    onOkConcatenateByExcel && onOkConcatenateByExcel();
  }

  const getProgressImportFile = useCallback(() => {
    let getImportProgressPromise: Promise<BaseResponse<any>> = getEcommerceJobsApi(processId);

    Promise.all([getImportProgressPromise]).then((responses) => {
      responses.forEach((response) => {
        if (response.code=== HttpStatus.SUCCESS && response.data && !isNullOrUndefined(response.data.total)) {
          const processData = response.data;
          setProgressData(processData);
          const progressCount = processData.total_error + processData.total_success;
          if (processData.finish) {
            setImportProgressPercent(100);
            setProcessId(null);
            setIsDownloading(false);
            showSuccess("Tải file lên thành công!");
          } else {
            const percent = Math.floor(progressCount / processData.total * 100);
            setImportProgressPercent(percent);
          }
        }
      });
    });
  }, [processId]);

  useEffect(() => {
    if (importProgressPercent === 100 || !processId) {
      return;
    }
    getProgressImportFile();
    const getFileInterval = setInterval(getProgressImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [getProgressImportFile, importProgressPercent , processId]);

  const onCancelExitConcatenateByExcelModal = () => {
    setIsVisibleExitConcatenateByExcelModal(false);
  }

  const onOkExitConcatenateByExcelModal = () => {
    setIsVisibleExitConcatenateByExcelModal(false);
    onOKProgressConcatenateByExcel();
  }

  const getSelectedShop = (shop_id: number) => {
    setSelectedtShopId(shop_id)
  }

  return (
    <div>
      <Modal
        width="600px"
        centered
        visible={isVisibleImportModal}
        title=" Ghép nối sản phẩm"
        maskClosable={false}
        okText="Tải file lên"
        cancelText="Hủy"
        onCancel={onCancelConcatenateByExcelModal}
        okButtonProps={{ disabled: checkDisableOkButton() }}
        onOk={onOkImportModal}
        >
        <div>
          <Form
            layout="vertical"
            style={{height:80}}>
            <Form.Item 
              label={<b>Chọn gian hàng ghép nối:</b>}
              required={true}
              >
              <Select
                placeholder="Chọn gian hàng"
                onChange={getSelectedShop}
                >
                {listShopOption}
              </Select>
            </Form.Item>
          </Form> 
          <Form>
            <Form.Item
              required={true}
              >
              <Row>
                <Col span={10}>
                  <Upload
                    beforeUpload={beforeUploadFile}
                    onRemove={onRemoveFile}
                    maxCount={1}
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    >
                    <Button icon={<UploadOutlined />}>Chọn file</Button>
                  </Upload>
                </Col>
                <Col span={14}>
                  <div style={{width:"100%", marginTop:10}}>
                    <label>File mẫu chính là file tải xuống </label>
                  </div>
                </Col>
              </Row>
              
            </Form.Item>
          </Form> 
        </div>
      </Modal>
      {isVisibleProgressModal &&
        <ProgressConcatenateByExcelModal
          isVisibleProgressModal={isVisibleProgressModal}
          onCancelProgressConcatenateByExcel={onCancelProgressConcatenateByExcel}
          onOKProgressConcatenateByExcel={onOKProgressConcatenateByExcel}
          progressData={progressData}
          progressPercent={importProgressPercent}
          isDownloading={isDownloading}
        />
      }

      {isVisibleExitConcatenateByExcelModal &&
        <Modal
          width="600px"
          centered
          visible={isVisibleExitConcatenateByExcelModal}
          title=""
          maskClosable={false}
          onCancel={onCancelExitConcatenateByExcelModal}
          okText="Đồng ý"
          cancelText="Hủy"
          onOk={onOkExitConcatenateByExcelModal}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={DeleteIcon} alt="" />
            <div style={{ marginLeft: 15 }}>
              <strong style={{ fontSize: 16 }}>Bạn có chắc chắn muốn hủy ghép nối sản phẩm không?</strong>
              <div style={{ fontSize: 14 }}>Hệ thống sẽ dừng việc ghép nối sản phẩm, các sản phẩm ghép nối<br /> thành công sẽ được hiển thị ở màn hình "Sản phẩm đã ghép"</div>
            </div>
          </div>
        </Modal>
      }
      </div>
    
  
  );
};

export default ConcatenateByExcel;