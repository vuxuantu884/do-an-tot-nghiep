import React, {createRef, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import { useDispatch } from 'react-redux';
import {useHistory} from "react-router-dom";
import {Button, Card, Col, Input, Row, Form, FormInstance, Modal} from 'antd';
import {showError, showSuccess} from 'utils/ToastUtils';
import {isNullOrUndefined} from "utils/AppUtils";
import UrlConfig from 'config/url.config';
import {HttpStatus} from "config/http-status.config";
import BaseResponse from "base/base.response";
import ContentContainer from 'component/container/content.container';
import { uploadFileCreateLoyaltyCard } from 'domain/actions/loyalty/release/loyalty-release.action';
import {getLoyaltyCardReleaseJobsApi} from "service/loyalty/release/loyalty-card-release.service";
import ProcessCreateCardReleaseModal from "screens/customer/loyalty-card/upload/ProcessCreateCardReleaseModal";
import uploadIcon from "assets/icon/upload.svg";
import boldUploadIcon from "assets/icon/upload-2.svg";
import paperClip from "assets/icon/paper-clip.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import DeleteIcon from "assets/icon/ydDeleteIcon.svg";
import './upload-loyalty-cards.scss'

const UploadLoyaltyCardRelease = () => {
  const [file, setFile] = useState<File>()
  const uploadRef = useRef<any>()
  const dispatch = useDispatch()
  const history = useHistory();
  const { Item } = Form;
  const formRef = createRef<FormInstance>();
  const initFormValues = useMemo(() => {
    return {
      name: ''
    }
  }, [])

  const onClickUploadFile = useCallback(() => {
    uploadRef.current?.click()
  }, [])

  const onChangeUploadFile = (event: React.ChangeEvent<HTMLInputElement> | undefined) => {
    if (event && event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }

  // process export modal
  const [isVisibleProcessModal, setIsVisibleProcessModal] = useState(false);
  const [processId, setProcessId] = useState(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isInvalidFile, setIsInvalidFile] = useState<boolean>(false);

  const [processPercent, setProcessPercent] = useState<number>(0);
  const [processData, setProcessData] = useState<any>(null);

  const resetProgress = () => {
    setProcessId(null);
    setProcessPercent(0);
    setProcessData(null);
  }
  
  const onOKProgress = () => {
    resetProgress();
    setIsVisibleProcessModal(false);
    if (!isInvalidFile) {
      formRef.current?.resetFields();
      setFile(undefined);
      history.replace(`${UrlConfig.CUSTOMER_CARDS}`);
    }
  }
  
  const onCancelProcess = () => {
    setIsVisibleExitProcessModal(true);
  }

  const getProgressImportFile = useCallback(() => {
    let getImportProcessPromise: Promise<BaseResponse<any>> = getLoyaltyCardReleaseJobsApi(processId);

    Promise.all([getImportProcessPromise]).then((responses) => {
      responses.forEach((response) => {
        if (response.code === HttpStatus.SUCCESS && response.data && !isNullOrUndefined(response.data.total)) {
          setProcessData(response.data);
          if (response.data && response.data.finish) {
            if (response.data.api_error) {
              resetProgress();
              showError(`${response.data.api_error}`);
              setIsInvalidFile(true);
              setProcessData({...processData, errors_msg: `\n${response.data.api_error}`});
            } else {
              setProcessPercent(100);
              setProcessId(null);
              showSuccess("Hoàn thành tạo mới đợt phát hành!");
            }
            setProcessId(null);
            setIsDownloading(false);
          } else {
            if (response.data?.total > 0) {
              const percent = Math.floor((response.data.total_success + response.data.total_error) / response.data.total * 100);
              setProcessPercent(percent >= 100 ? 99 : percent);
            }
          }
        }
      });
    })
    .catch(() => {
      showError("Có lỗi xảy ra, vui lòng thử lại sau");
    });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processId]);

  useEffect(() => {
    if (processPercent === 100 || !processId) {
      return;
    }
    getProgressImportFile();
    const getFileInterval = setInterval(getProgressImportFile, 3000);
    return () => clearInterval(getFileInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProgressImportFile, processId]);

  // handle exit process modal
  const [isVisibleExitProcessModal, setIsVisibleExitProcessModal] = useState<boolean>(false);

  const onCancelExitProcess = () => {
    setIsVisibleExitProcessModal(false);
  }

  const onOkExitProcess = () => {
    resetProgress();
    setIsVisibleExitProcessModal(false);
    setIsVisibleProcessModal(false);
  };
  // end handle exit process modal

  const uploadFileCallback = useCallback((data: any) => {
    if (data) {
      setIsDownloading(true);
      setProcessId(data.id);
      setIsVisibleProcessModal(true);
    }
  }, [])

  const onFinish = useCallback((values) => {
    if (!values.name) {
      showError('Vui lòng nhập tên đợt phát hành.');
      return;
    }
    if (!file) {
      showError('Vui lòng chọn file tải lên.');
      return;
    }
    setIsInvalidFile(false);
    dispatch(uploadFileCreateLoyaltyCard(file, values.name, uploadFileCallback))
  },
    [uploadFileCallback, dispatch, file]
  );

  return (
    <ContentContainer
      title="Thêm mới đợt phát hành"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Phát hành thẻ",
          path: `${UrlConfig.CUSTOMER_CARDS}`,
        },
        {
          name: "Thêm mới đợt phát hành"
        },
      ]}
    >
      <Card
        title={
          <span>TẢI FILE</span>
        }
      >
        <Form
          onFinish={onFinish}
          initialValues={initFormValues}
          layout="vertical"
          ref={formRef}
        >
          <div className="upload-loyalty-cards">
            <Row style={{marginBottom: '20px'}}>
              <Col span={10}>
                <div className="release-label">Tên đợt phát hành <span className="text-error">*</span></div>
                <div className="release-content">
                  <Item
                    name="name"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên đợt phát hành",
                        whitespace: true
                      }
                    ]}
                  >
                    <Input placeholder="Tên đợt phát hành" />
                  </Item>
                </div>
              </Col>
              <Col span={14}>
                <div className="sample-file">
                  File mẫu tạo đợt phát hành: Click để tải <a href="https://loyalty-resource.s3.ap-southeast-1.amazonaws.com/sample.xlsx" rel="noreferrer" target="_blank">“File excel mẫu”</a>
                </div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <div className="upload-area">
                  <span className="title">File excel <span className="text-error">*</span></span>
                  <Button type="default" onClick={onClickUploadFile} className="upload-btn">
                    <img src={uploadIcon} alt="upload" className="upload-icon" />
                    <span>Chọn file</span>
                  </Button>
                  <input
                    type="file"
                    ref={uploadRef}
                    style={{display: 'none'}}
                    multiple={false}
                    onChange={onChangeUploadFile}
                    accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  />
                  {
                    file && (
                      <div className="file">
                        <img alt="" className="file-icon" src={paperClip} />
                        { file.name }
                        <img alt="" className="delete-icon" src={deleteIcon} onClick={() => setFile(undefined)} />
                      </div>
                    )
                  }
                </div>
              </Col>
            </Row>
            <Row>
              <Button
                type="primary"
                onClick={() => {
                  formRef.current?.submit();
                }}
              >
                <img alt="" src={boldUploadIcon} className="upload-icon" />
                <span>Import</span>
              </Button>
            </Row>
          </div>
        </Form>
      </Card>

      {isVisibleProcessModal &&
        <ProcessCreateCardReleaseModal
          visible={isVisibleProcessModal}
          onCancel={onCancelProcess}
          onOk={onOKProgress}
          processData={processData}
          progressPercent={processPercent}
          isDownloading={isDownloading}
        />
      }
      {isVisibleExitProcessModal &&
        <Modal
          width="600px"
          centered
          visible={isVisibleExitProcessModal}
          title=""
          maskClosable={false}
          onCancel={onCancelExitProcess}
          okText="Đồng ý"
          cancelText="Hủy"
          onOk={onOkExitProcess}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={DeleteIcon} alt="" />
            <div style={{ marginLeft: 15 }}>
              <strong style={{ fontSize: 16 }}>Bạn có chắc chắn muốn hủy tiến trình tạo mới đợt phát hành không?</strong>
            </div>
          </div>
        </Modal>
      }
    </ContentContainer>
  )
}

export default UploadLoyaltyCardRelease;