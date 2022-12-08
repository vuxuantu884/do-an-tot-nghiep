import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Upload } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { UploadChangeParam, UploadFile } from "antd/lib/upload/interface";
import { showError, showSuccess } from "utils/ToastUtils";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch } from "react-redux";
import { getFileProductByCode, productImportFile } from "service/product/product.service";
import "./index.scss"

const ImportFileProducts: React.FC = () => {
  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatch = useDispatch();

  const changeFile = (info: UploadChangeParam) => {
    if (info.file.status !== "removed") {
      setFileList([info.file]);
    }
  };

  const getFileByCode = async (code: string) => {
    return await callApiNative(
      {isShowError: true},
      dispatch,
      getFileProductByCode,
      code,
    );
  };

  const ref: any = useRef();
  // Gọi api liên tục cho tới khi status trả về FINISH hoặc quá 90s
  const uploadFile = async () => {
    setIsLoading(true);
    const fileUpload: any = fileList[0];
    const response = await callApiNative(
      { isShowError: true },
      dispatch,
      productImportFile,
      fileUpload,
    );
    if (response && response.code) {
      let num = 0;
      ref.current = setInterval(async () => {
        num += 3000;
        const data = await getFileByCode(response.code);
        if (data) {
          if (data.status === "FINISH") {
            clearInterval(ref.current);
            showSuccess("Download file thành công");
            setIsLoading(false);
            let downLoad = document.createElement("a");
            downLoad.href = data.url;
            downLoad.download = "download";
            downLoad.click();
          } else if (num >= 90000 || data.status === "ERROR") {
            clearInterval(ref.current);
            showError("Download file không thành công");
            setIsLoading(false);
          }
        } else {
          clearInterval(ref.current);
          showError("Download file không thành công");
          setIsLoading(false);
        }
      }, 3000);
    } else {
      showError("Download file không thành công");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => clearInterval(ref.current);
  }, [ref]);

  return (
    <Card style={{ marginTop: 20 }}>
      <Upload
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        maxCount={1}
        fileList={fileList}
        onChange={changeFile}
        onRemove={(file) => {
          const index = fileList.indexOf(file);
          const newFileList = [...fileList];
          newFileList.splice(index, 1);
          return setFileList(newFileList);
        }}
        beforeUpload={() => {
          return false;
        }}
      >
        <Button size="middle" type="text" icon={<UploadOutlined className="btn-view-icon"/>}>
          Nhập file mã vạch
        </Button>
      </Upload>
      <div style={{ marginTop: 20 }}>
        <Button
          className="light"
          type="text"
          size="middle"
          icon={<DownloadOutlined className="btn-view-icon"/>}
          loading={isLoading}
          onClick={() => {
            uploadFile();
          }}
        >
          Tải file sản phẩm
        </Button>
      </div>
    </Card>
  );
};

export default ImportFileProducts;
