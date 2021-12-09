import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Col, Divider, message, Modal, Row } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import WarningImport from "component/import/warning-import";
import { AppConfig } from "config/app.config";
import { EnumUploadStatus } from "config/enum.config";
import { useCallback, useState } from "react";
import { RiUpload2Line } from "react-icons/ri";
import {VscError} from "react-icons/all";
import { getToken } from "utils/LocalStorageUtils";
import _ from "lodash";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";

export interface ModalImportProps {
  visible?: boolean;
  onOk: (res: any) => void;
  onCancel: () => void;
  title: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  csvColumnMapping: Array<any>
};

type UploadStatus = "error" | "success" | "done" | "uploading" | "removed" | undefined;

const ModalImport: React.FC<ModalImportProps> = (
  props: ModalImportProps
) => {
  const { visible, onOk, onCancel, title, subTitle, okText, cancelText, csvColumnMapping } =
    props;

  const token = getToken() || "";
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>(undefined);
  const [importRes, setImportRes] = useState<
  Array<any>
>([]);
  const [uploadError, setUploadError] = useState<any>("");
  const [importTotal, setImportTotal] = useState(0);
  const [successCount, setSuccessCount] = useState(0);

  const ActionImport = {
    Ok: useCallback(onOk,[onOk]),
    Cancel: useCallback(onCancel,[onCancel]),
    OnChange: useCallback((info: UploadChangeParam<UploadFile<any>>)=>{
      const {status} = info.file;
         if (status === EnumUploadStatus.done) {
           const response = info.file.response;
           if (response.code === 20000000) {
             if (response.data.data.length > 0) {
               setImportRes(response.data.data);
             }
             if (response.data.errors.length > 0) {
               const errors: Array<any> = _.uniqBy(
                 response.data.errors,
                 "index"
               ).sort((a: any, b: any) => a.index - b.index);
               setImportRes([...errors]);
             } else {
               setImportRes([]);
             }
             setImportTotal(response.data.total);
             setSuccessCount(response.data.success_count);
             setUploadStatus(status);
           } else {
             setUploadStatus("error");
             setUploadError(response.errors);
             setImportRes([]);
           }
         } else if (status === EnumUploadStatus.error) {
           message.error(`${info.file.name} file upload failed.`);
           setUploadStatus(status);
           setImportRes([]);
         }
    },[])
  }

  return (
      <Modal
          onCancel={ActionImport.Cancel}
          width={650}
          visible={visible}
          title={title}
          footer={[
            <Button
              key="back"
              onClick={ActionImport.Cancel}
            >
              {cancelText}
            </Button>,
            <Button key="link" type="primary" onClick={ActionImport.Ok}>
              {okText}
            </Button>,
          ]}
        >
        <div
          style={{
            display:
              uploadStatus === undefined || uploadStatus === EnumUploadStatus.removed
                ? ""
                : "none",
          }}
        >
          <WarningImport link_template={AppConfig.ENTITLEMENTS_TEMPLATE_URL} />
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
                    setUploadStatus("error");
                    setUploadError(["Sai định dạng file. Chỉ upload file .xlsx"]);
                    setImportRes([]);
                    return false;
                  }
                  setUploadStatus("uploading");
                  setUploadError([]);
                  return true;
                }}
                multiple={false}
                showUploadList={false}
                action={``}
                headers={{Authorization: `Bearer ${token}`}}
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
            uploadStatus === EnumUploadStatus.done ||
            uploadStatus === EnumUploadStatus.uploading ||
            uploadStatus === EnumUploadStatus.success ||
            uploadStatus === EnumUploadStatus.error
              ? ""
              : "none",
        }}
      >
        <Row justify={"center"}>
          {uploadStatus === EnumUploadStatus.uploading ? (
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
          {uploadStatus === EnumUploadStatus.error ? (
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
          {uploadStatus === EnumUploadStatus.done ||
          uploadStatus === EnumUploadStatus.success ? (
            <Col span={24}>
              <Row justify={"center"}>
                <CheckCircleOutlined style={{fontSize: "78px", color: "#27AE60"}} />
              </Row>
              <Row justify={"center"}>
                <h2 style={{padding: "10px 30px"}}>
                  Xử lý file nhập toàn tất:{" "}
                  <strong style={{color: "#2A2A86"}}>
                    {successCount} / {importTotal}
                  </strong>{" "}
                  {subTitle} thành công
                </h2>
              </Row>
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
                            - Dòng {error.index + 2}: {csvColumnMapping[error.column]}{" "}
                            {csvColumnMapping[error.type.toLowerCase()]}
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

export default ModalImport;
