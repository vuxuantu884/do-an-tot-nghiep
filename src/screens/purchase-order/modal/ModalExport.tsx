import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Modal, Row } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import WarningImport from "component/import/warning-import";
import { EnumImportStatus, EnumJobStatus } from "config/enum.config";
import { useCallback, useEffect, useState } from "react";
import { RiUpload2Line } from "react-icons/ri";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { useDispatch } from "react-redux";
import { uploadFileAction } from "domain/actions/core/import.action";
import { ImportProcument } from "model/purchase-order/purchase-procument";
import {HttpStatus} from "config/http-status.config";
import { getJobImport } from "service/purchase-order/purchase-procument.service";
import { VscError } from "react-icons/vsc";
import { exportPOAction } from "domain/actions/po/po.action";
import BaseResponse from "base/base.response";

export interface ModalImportProps {
  visible?: boolean;
  onOk: (res: any) => void;
  onCancel: () => void;
  title: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  templateUrl?: string,
  forder: string,
  customParams?: any
};

type UploadStatus = "ERROR" | "SUCCESS" | "DONE" | "PROCESSING" | "REMOVED" | undefined;

const ModalExport: React.FC<ModalImportProps> = (
  props: ModalImportProps
) => {
  const { visible, onOk, onCancel, title, cancelText, templateUrl, forder, customParams } =
    props;

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
  const [jobExportStatus, setJobExportStatus] = useState<EnumJobStatus>();
  const [lstJob, setLstJob] = useState<Array<string>>([]);
  const [exportRes, setExportRes] = useState<
  Array<any>
>([]);
  const [uploadError, setUploadError] = useState<any>("");
  const [data, setData] = useState<BaseResponse<any>>();
  const dispatch = useDispatch();

  const checkExportFile = useCallback(() => {
    let getFilePromises = lstJob.map((code) => {
      return getJobImport(code);
    });

    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          
          if (response.data && response.data.status === EnumJobStatus.finish) { 
            setJobExportStatus(EnumJobStatus.finish);
            setData(response.data);
            const fileCode = response.data.code;
            const newListExportFile = lstJob.filter((item) => {
              return item !== fileCode;
            });
            
            var downLoad = document.createElement("a");
            downLoad.href = response.data.url;
            downLoad.download = "download";

            downLoad.click();

            setLstJob(newListExportFile);
            setExportRes([]);
            setUploadStatus(EnumJobStatus.success);
            return
          }else if (response.data && response.data.status === EnumJobStatus.error) {
            setJobExportStatus(EnumJobStatus.error);
            setUploadStatus(EnumJobStatus.error);
            return
          }
          setJobExportStatus(EnumJobStatus.processing);
        }
      });
    });
  }, [lstJob]);

  const onResultImport = useCallback((res)=>{
   if (res) {
    const {status, code} = res;  
          
    if (status === EnumImportStatus.processing) {
      setUploadStatus(status);
      setJobExportStatus(EnumJobStatus.processing);
      setLstJob([code]);
      
      checkExportFile();
   } 
  }
  },[checkExportFile, setLstJob]);

  const onResultChange = useCallback((res)=>{  
    if (res) { 
        const params: ImportProcument = {
          url: res[0],
          conditions: customParams?.conditions,
          type: customParams?.type,
          url_template: customParams.url_template
        }
        dispatch(exportPOAction(params, onResultImport))
    } 
 
  },[customParams,dispatch, onResultImport]);

  const ActionImport = {
    Ok: useCallback(()=>{
      onOk(data);
    },[onOk, data]),
    Cancel: useCallback(onCancel,[onCancel]),
    customRequest: useCallback((option: any)=>{
      dispatch(uploadFileAction([option.file],forder,onResultChange));
    },[dispatch, onResultChange, forder]),
    OnChange: useCallback((info: UploadChangeParam<UploadFile<any>>)=>{
      
    },[])
  }

  useEffect(() => {
    if (lstJob.length === 0 || jobExportStatus !== EnumJobStatus.processing) return;
    checkExportFile();
      
    const getFileInterval = setInterval(checkExportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [lstJob, checkExportFile, jobExportStatus]);

  return (
      <Modal
          onCancel={ActionImport.Cancel}
          width={650}
          visible={visible}
          title={title}
          footer={[
            <Button
              key="back"
              onClick={()=>{
                setUploadStatus(undefined);
                ActionImport.Cancel();
              }} 
            >
              {cancelText}
            </Button>
          ]}
        >
        <div
          style={{
            display:
              uploadStatus === undefined || uploadStatus === EnumImportStatus.removed
                ? ""
                : "none",
          }}
        >
          <WarningImport link_template={templateUrl} />
          <Row gutter={24}>
            <Col span={3}></Col>
            <Col span={19}>
              <Dragger
                accept=".xlsx"
                beforeUpload={(file) => {
                  if (
                    file.type !==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  ) {
                    setUploadStatus("ERROR");
                    setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                    setExportRes([]);
                    return false;
                  }
                  setUploadStatus(EnumImportStatus.processing);
                  setUploadError([]);
                  return true;
                }}
                multiple={false}
                showUploadList={false}
                customRequest = {(option)=>{
                  ActionImport.customRequest(option);
                }
                }
                onChange={ 
                  (info)=>{
                    ActionImport.OnChange(info);
                  } }
                > 
                <p className="ant-upload-drag-icon">
                  <RiUpload2Line size={48} />
                </p>
                <p className="ant-upload-hint">
                  Kéo file vào đây hoặc tải lên từ thiết bị
                </p>
              </Dragger>
            </Col>
          </Row>
        </div>
        <div
        style={{
          display:
            uploadStatus === EnumImportStatus.done ||
            uploadStatus === EnumImportStatus.processing ||
            uploadStatus === EnumImportStatus.success ||
            uploadStatus === EnumImportStatus.error
              ? ""
              : "NONE",
        }}
      >
        <Row justify={"center"}>
          {uploadStatus === EnumImportStatus.processing ? (
            <Col span={24}>
              <Row justify={"center"}>
                <LoadingOutlined style={{fontSize: "78px", color: "#E24343"}} />
              </Row>
              <Row justify={"center"}>
                <h2 style={{padding: "10px 30px"}}>Đang upload file...</h2>
              </Row>
            </Col>
          ) : (
            ""
          )}
          {uploadStatus === EnumImportStatus.error ? (
            <Col span={24}>
              <Row justify={"center"}>
                <VscError style={{fontSize: "78px", color: "#E24343"}} />
              </Row>
              <Row justify={"center"}>
                <h2 style={{padding: "10px 30px"}}>
                  <li>{uploadError || "Máy chủ đang bận"}</li>
                </h2>
              </Row>
            </Col>
          ) : (
            ""
          )}
          {uploadStatus === EnumImportStatus.done ||
           uploadStatus === EnumImportStatus.success || 
           uploadStatus === EnumImportStatus.error ? (
            <Col span={24}> 
              {
                uploadStatus === EnumImportStatus.success && 
                <>
                  <Row justify={"center"}>
                    <CheckCircleOutlined style={{fontSize: "78px", color: "#27AE60"}} />
                  </Row>
                  <Row justify={"center"}>
                      <h2 style={{padding: "10px 30px"}}>
                        Xử lý file thành công
                      </h2>
                  </Row>
                </>
              }
              <Divider />
              {exportRes?.length > 0 ? (
                <div>
                  <Row justify={"start"}>
                    <h3 style={{color: "#E24343"}}>Danh sách lỗi: </h3>
                  </Row>
                  <Row justify={"start"}>
                    <li style={{padding: "10px 30px"}}>
                      {exportRes?.map((error: any, index) => (
                        <ul key={index}>
                          <span>
                             {error}
                          </span>
                        </ul>
                      ))}
                    </li>
                  </Row>
                </div>
              ) : (
                ""
              )}
            </Col>
          ) : (
            ""
          )}
        </Row>
      </div>
     </Modal>
  );
};

export default ModalExport;
