import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Modal, Row ,Upload} from "antd";
import Dragger from "antd/lib/upload/Dragger";
import WarningImport from "component/import/warning-import";
import { EnumImportStatus, EnumJobStatus } from "config/enum.config";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RiUpload2Line } from "react-icons/ri";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";
import { useDispatch } from "react-redux";
import { uploadFileAction } from "domain/actions/core/import.action";
import { importProcumentAction } from "domain/actions/po/po-procument.action";
import { ImportProcument } from "model/purchase-order/purchase-procument";
import {HttpStatus} from "config/http-status.config";
import { getJobImport } from "service/purchase-order/purchase-procument.service";
import { VscError } from "react-icons/vsc";

export interface ModalImportProps {
  visible?: boolean;
  onOk: (res: any) => void;
  onCancel: () => void;
  title: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  templateUrl?: string,
  forder: string,
  customParams?: any
};

export const CON_STATUS_IMPORT = {
  DEFAULT: 1,
  CHANGE_FILE: 2,
  CREATE_JOB_SUCCESS: 3,
  JOB_FINISH: 4,
  ERROR: 5,
};

type UploadStatus = "ERROR" | "SUCCESS" | "DONE" | "PROCESSING" | "REMOVED" | undefined;

const ModalImport: React.FC<ModalImportProps> = (
  props: ModalImportProps
) => {
  const { visible, onOk, onCancel, title, subTitle, okText, templateUrl, forder, customParams } =
    props;

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
  const [importRes, setImportRes] = useState<
  Array<any>
>([]);
  const [uploadError, setUploadError] = useState<any>("");
  const [statusImport, setStatusImport] = useState<number>(CON_STATUS_IMPORT.DEFAULT);
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [data, setData] = useState<any>();
  const dispatch = useDispatch();
  const [jobImportStatus, setJobImportStatus] = useState<EnumJobStatus>();
  const [lstJob, setLstJob] = useState<Array<string>>([]);
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [linkFileImport, setLinkFileImport] = useState<string>();

  const checkImportFile = useCallback(() => {
    let getFilePromises = lstJob.map((code) => {
      return getJobImport(code);
    });

    Promise.all(getFilePromises).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS) {
          if (response.data && response.data.message && response.data.message.length > 0) {
            setImportRes([...response.data.message]);
          } else {
            setImportRes([]);
            setData([]);
          }
          
          setImportTotal(response.data.processed);
          setSuccessCount(response.data.total_process); 
          
          if (response.data && response.data.status === EnumJobStatus.finish) {  
            setUploadStatus(EnumJobStatus.success);
            setJobImportStatus(EnumJobStatus.finish);
            setData(response.data);
            setStatusImport(CON_STATUS_IMPORT.JOB_FINISH);
            const fileCode = response.data.code;
            const newListExportFile = lstJob.filter((item) => {
              return item !== fileCode;
            }); 

            setLstJob(newListExportFile);
            setImportRes([]);
            return
          }else if (response.data && response.data.status === EnumJobStatus.error) {
            setJobImportStatus(EnumJobStatus.error);
            setUploadStatus(EnumJobStatus.error);
            setStatusImport(CON_STATUS_IMPORT.JOB_FINISH);
            return
          }
          setJobImportStatus(EnumJobStatus.processing);
        }
      });
    });
  }, [lstJob]);

  const onResultImport = useCallback((res)=>{
   if (res) {
    const {status, code} = res;  
    if (status === EnumImportStatus.processing) {
      setFileList([]);
      setUploadStatus(status);
      setJobImportStatus(EnumJobStatus.processing);
      setLstJob([code]);
      checkImportFile(); 
      onOk(data);
    }
   }
  },[checkImportFile,onOk, data]);

  const onResultChange = useCallback((res)=>{  
    if (res) {  
      fileList[0] = {...fileList[0],status: "done", url:res[0]};
      setFileList([...fileList]);
      setLinkFileImport(res[0]);
      setStatusImport(CON_STATUS_IMPORT.CREATE_JOB_SUCCESS); 
    } 
 
  },[fileList]);

  const ActionImport = {
    Ok: useCallback(()=>{
      onOk(data);
    },[onOk, data]),
    Cancel: useCallback(onCancel,[onCancel]),
    customRequest: useCallback((option: any)=>{
      dispatch(uploadFileAction([option.file],forder, onResultChange));
    },[dispatch, onResultChange, forder]),
    onChange: useCallback((info: UploadChangeParam<UploadFile<any>>)=>{
      setFileList([{...info.file}]);
    },[]),
    onImport: useCallback(()=>{ 
      if (linkFileImport && linkFileImport.length > 0) {
        setStatusImport(CON_STATUS_IMPORT.CHANGE_FILE);
        const params: ImportProcument = {
          url: linkFileImport,
          conditions: customParams?.conditions,
          type: customParams?.type
        }
        dispatch(importProcumentAction(params, onResultImport))
      }
    },[dispatch, customParams, onResultImport, linkFileImport])
  } 

  const renderModalFooter = useMemo(() => {
    return (
      <>
        {statusImport === CON_STATUS_IMPORT.CREATE_JOB_SUCCESS && (
          <Button
            key="cancel"
            type="primary"
            onClick={ActionImport.onImport}
          >
            Import
          </Button>
        )}
        {(statusImport === CON_STATUS_IMPORT.JOB_FINISH || statusImport === CON_STATUS_IMPORT.ERROR) && (
          <Button key="link" type="primary" onClick={()=>{
            setSuccessCount(0);
            setSuccessCount(0);
            setUploadStatus(undefined);
            setStatusImport(CON_STATUS_IMPORT.CHANGE_FILE);
            setFileList([]);
            ActionImport.Cancel(); 
          }}>
            {okText}
          </Button>
        )}
      </>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps,
  },[statusImport, ActionImport.Cancel, ActionImport.Ok, okText, ActionImport.onImport])

  useEffect(() => {
    if (lstJob.length === 0 || jobImportStatus !== EnumJobStatus.processing) return;
    checkImportFile();
    const getFileInterval = setInterval(checkImportFile, 3000);
    return () => clearInterval(getFileInterval);
  }, [lstJob, checkImportFile, jobImportStatus]); 

  return (
      <Modal
          onCancel={ActionImport.Cancel}
          width={650}
          visible={visible}
          title={title}
          afterClose={()=>{ 
            setSuccessCount(0); 
            setStatusImport(CON_STATUS_IMPORT.DEFAULT);
            setUploadStatus(undefined);
            setFileList([]);
            }  
          }
          footer={renderModalFooter}
        >
          <div
            style={{
              display:
                (uploadStatus === undefined || uploadStatus === EnumImportStatus.removed)
                && statusImport === CON_STATUS_IMPORT.DEFAULT
                  ? ""
                  : "none",
            }}
          >
            <WarningImport title="nhập hàng" link_template={templateUrl} />
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
                      setImportRes([]);
                      return false;
                    }
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
                      ActionImport.onChange(info);
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
         {
           statusImport !== CON_STATUS_IMPORT.DEFAULT &&
           <>
            <Upload showUploadList={{showRemoveIcon: false}} fileList={fileList} />
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
                              Xử lý file nhập hoàn tất:{" "}
                              <strong style={{color: "#2A2A86"}}>
                                {successCount} / {importTotal}
                              </strong>{" "}
                              {subTitle} thành công
                            </h2>
                          </Row>
                      </>
                    }
                    <Divider />
                    {importRes?.length > 0 ? (
                      <div>
                        <Row justify={"start"}>
                          <h3 style={{color: "#E24343"}}>Danh sách lỗi: </h3>
                        </Row>
                        <Row justify={"start"}>
                          <li style={{padding: "10px 30px"}}>
                            {importRes?.map((error: any, index) => (
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
           </> 
         }      
     </Modal>
  );
};

export default ModalImport;
