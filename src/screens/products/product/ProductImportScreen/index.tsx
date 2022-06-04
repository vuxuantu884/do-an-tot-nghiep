
import { Button, Card, Col, Modal, Progress, Row, Tabs, Typography, Upload } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import updateProductExampleImg from "assets/img/update_product_example.png";
import createProductExampleImg from "assets/img/create_product_example.png";
import { UploadOutlined } from "@ant-design/icons";
import { useCallback, useState } from "react";
import { showError } from "utils/ToastUtils";
import { ConAcceptImport, STATUS_IMPORT_EXPORT } from "utils/Constants";
import excelIcon from "assets/icon/icon-excel.svg";
import { HttpStatus } from "config/http-status.config";
import NumberFormat from "react-number-format";
import { isNullOrUndefined } from "utils/AppUtils";
import { StyledProgressDownloadModal } from "screens/web-app/common/commonStyle";

const urlTemplate = 'https://yody-media.s3.ap-southeast-1.amazonaws.com/yody-file/product-import_21ca2d13-8360-495e-bf57-859ffc4b60be_original.xlsx';

const ConExportImport = {
    IMPORT: "IMPORT_CREATE_PRODUCT",
  }
type process = {
    total: number,
    processed: number,
    success: number,
    error: number,
    percent: number
  }

const ProductImportScreen: React.FC = ()=>{
    const { TabPane } = Tabs;
    const [fileList, setFileList] = useState<Array<File>>([]);
    const [urlFileError, setUrlFileError] = useState<string>("");
    const [errorData, setErrorData] = useState<Array<any>>([]);
    const [statusImport, setStatusImport] = useState<number>(STATUS_IMPORT_EXPORT.NONE);
    const [importing, setImporting] = useState<boolean>(true);
    const [progressData, setProgressData] = useState<process>(
        {
        processed: 0,
        success: 0,
        error: 0,
        total: 0,
        percent: 0
        }
    );

    const resetFile = ()=>{
        setUrlFileError("");
        setErrorData([]);
        setFileList([]);
        setProgressData({
          processed: 0,
          success: 0,
          error: 0,
          total: 0,
          percent: 0
        });
      }

    const uploadProps = {
      beforeUpload: () => false,
      onChange: (obj: any) => {
        resetFile();
        const typeExcel = obj.file.type === ConAcceptImport;
        if (!typeExcel) {
          showError("Chỉ chọn file excel");
          return;
        }
        
        setFileList([obj.file]);
      },
      customRequest:()=>false
    }
    const ActionImport = {
      Ok: useCallback(async() => {
       setImporting(true);
       
      }, []),
      Cancel: useCallback(() => {
       setImporting(false);
      }, []),
    }

 return (
     <ContentContainer
        title="Quản lý sản phẩm"
        breadcrumb={[
        {
            name: "Sản phẩm",
        },
        {
            name: "Danh sách sản phẩm",
            path: `${UrlConfig.VARIANTS}`,
        },
        {
            name: "Nhập file sản phẩm"
         },
        ]}
     >
      <Card style={{ padding: 0 }} className="card-tab">
        <Tabs defaultActiveKey="1">
            <TabPane tab="Mẫu excel nhập mới" key="1">
                <img width="100%" src={createProductExampleImg} alt="" />
            </TabPane>
            <TabPane tab="Mẫu excel cập nhật thông tin" key="2">
                <img width="100%" src={updateProductExampleImg} alt="" />
            </TabPane>
        </Tabs>
      </Card>
       <Row gutter={25}>
         <Col span={16}>
            <Card title="Thông tin import">
            <Row>
                <div><b>Tải file lên</b>
                  <span style={{marginLeft: "20px"}}>
                    <Upload
                      onRemove={resetFile}
                      maxCount={1}
                      {...uploadProps}
                      accept={ConAcceptImport}
                    >
                      <Button icon={<UploadOutlined />}>Chọn file</Button>
                    </Upload>
                  </span>
                </div>
              </Row>
              <Row style={{marginTop: 20}}>
                <Col span={24}>
                 <Button type="primary"
                    onClick={ActionImport.Ok}
                    disabled={(fileList && fileList.length > 0 ? false:true)}>
                    Nhập file
                 </Button>
                </Col>
              </Row>
            </Card>
         </Col>
         <Col span={8}>
            <Card title="Link file excel mẫu">
                <Typography.Text>
                  <img src={excelIcon} alt="" /> <a href={urlTemplate}>Ấn để tải xuống file (.xlsx)</a>
                </Typography.Text>
            </Card>
         </Col>
       </Row>  
       <Modal
        title="Nhập file"
        footer={false}
        visible={importing}
        width={650}
        centered
        maskClosable={false}
        onCancel={ActionImport.Cancel}
       >
           {
                (statusImport === STATUS_IMPORT_EXPORT.NONE ) &&
                <StyledProgressDownloadModal>
                  <div>
                    <div className="progress-body" style={{marginTop: "30px"}}>
                      <div className="progress-count">
                        <div>
                          <div>Tổng cộng</div>
                          <div className="total-count">
                            {isNullOrUndefined(progressData?.total) ?
                              "--" :
                              <NumberFormat
                                value={progressData?.total}
                                displayType={"text"}
                                thousandSeparator={true}
                              />
                            }
                          </div>
                        </div>

                        <div>
                          <div>Đã xử lý</div>
                          <div style={{ fontWeight: "bold" }}>
                            {isNullOrUndefined(progressData?.processed) ?
                              "--" :
                              <NumberFormat
                                value={progressData?.processed}
                                displayType={"text"}
                                thousandSeparator={true}
                              />
                            }
                          </div>
                        </div>

                        <div>
                          <div>Thành công</div>
                          <div className="total-updated">
                            {isNullOrUndefined(progressData?.success) ?
                              "--" :
                              <NumberFormat
                                value={progressData?.success}
                                displayType={"text"}
                                thousandSeparator={true}
                              />
                            }
                          </div>
                        </div>

                        <div>
                          <div>Lỗi</div>
                          <div className="total-error">
                            {isNullOrUndefined(progressData?.error) ?
                              "--" :
                              <NumberFormat
                                value={progressData?.error}
                                displayType={"text"}
                                thousandSeparator={true}
                              />
                            }
                          </div>
                        </div>
                      </div>
                      <Progress
                          status={`${progressData.percent === 100 ? "normal" : "active"}`}
                          percent={progressData.percent}
                          style={{ marginTop: 20 }}
                          strokeColor="#2A2A86"
                        />
                    </div>
                    <div className="import-info">
                        <div className="content">
                            {errorData?.length ?
                                <div className="error-orders">
                                    <div className="error_message">
                                    <div style={{ backgroundColor: "#F5F5F5", padding: "20px 30px" }}>
                                        <ul style={{ color: "#E24343" }}>
                                        {errorData.map((error, index) => (
                                            <li key={index} style={{ marginBottom: "5px" }}>
                                            <span style={{ fontWeight: 500 }}>{error.split(":")[0]}</span>
                                            <span>:</span>
                                            <span>{error.split(":")[1]}</span>
                                            </li>
                                        ))}
                                        </ul>
                                    </div>
                                    </div>
                                </div>
                                : <div />
                            }
                        </div>
                    </div>
                  </div>
                </StyledProgressDownloadModal>
              }
       </Modal>
     </ContentContainer>
 )
}

export default ProductImportScreen