import { UploadOutlined } from "@ant-design/icons"
import exportIcon from "assets/icon/export.svg";
import { Button, Card, Upload } from "antd"
import { useEffect, useRef, useState } from "react";
import { UploadFile } from "antd/lib/upload/interface";
import { showError, showSuccess } from "utils/ToastUtils";
import { callApiNative } from "utils/ApiUtils";
import { useDispatch } from "react-redux";
import { getFileProductByCode, productImportFile } from "service/product/product.service";


const ImportFileProducts: React.FC = () => {

  const [fileList, setFileList] = useState<Array<UploadFile>>([]);
  const [loading, setLoading] = useState<boolean>(false)
  const dispatch = useDispatch()

  const onChangeFile = (info: any) => {
    if (info.file.status !== 'removed') {
      setFileList([info.file]);
    }
  };

  const getFileByCode = async (code: string) => {
    const response = await callApiNative({ isShowError: true }, dispatch, getFileProductByCode, code)
    return response
  }

  const ref: any = useRef()
  // Gọi api liên tục cho tới khi status trả về FINISH hoặc quá 90s
  const onUploadFile = async () => {
    setLoading(true)
    const fileUpload: any = fileList[0]
    const response = await callApiNative({ isShowError: true }, dispatch, productImportFile, fileUpload)
    if (response && response.code) {
      let num = 0
      ref.current = setInterval(async () => {
        num += 3000
        const data = await getFileByCode(response.code)
        if (data) {
          if (data.status === 'FINISH') {
            clearInterval(ref.current)
            showSuccess("Download file thành công")
            setLoading(false)
            var downLoad = document.createElement("a");
            downLoad.href = data.url;
            downLoad.download = "download";
            downLoad.click();
          } else if (num >= 90000 || data.status === 'ERROR') {
            clearInterval(ref.current)
            showError("Download file không thành công");
            setLoading(false)
          }
        } else {
          clearInterval(ref.current)
          showError("Download file không thành công");
          setLoading(false)
        }
      }, 3000)
    } else {
      showError("Download file không thành công");
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => clearInterval(ref.current)
  }, [ref])

  return (
    <Card style={{ marginTop: 20 }}>
      <Upload
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        maxCount={1}
        fileList={fileList}
        onChange={onChangeFile}
        onRemove={(file) => {
          const index = fileList.indexOf(file);
          const newFileList = [...fileList]
          newFileList.splice(index, 1);
          return setFileList(newFileList)
        }}
        beforeUpload={(file) => {
          return false;
        }}
      >
        <Button size="middle" icon={<UploadOutlined />}>Nhập file mã vạch</Button>
      </Upload>
      <div style={{ marginTop: 20 }}>
        <Button
          type="default"
          className="light"
          size="middle"
          icon={<img style={{ paddingRight: 15 }} src={exportIcon} alt="" />}
          loading={loading}
          onClick={() => {
            onUploadFile()
          }}
        >
          Tải file sản phẩm
        </Button>
      </div>
    </Card>
  )
}

export default ImportFileProducts
