import { Button, Card, Col, Input, Row,Form, FormInstance } from 'antd';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/url.config';
import React, { createRef, useCallback, useMemo, useRef, useState } from 'react'
import './upload-loyalty-cards.scss'
import uploadIcon from "assets/icon/upload.svg";
import boldUploadIcon from "assets/icon/upload-2.svg";
import paperClip from "assets/icon/paper-clip.svg";
import deleteIcon from "assets/icon/deleteIcon.svg";
import {  showSuccess, showWarning } from 'utils/ToastUtils';
import { useDispatch } from 'react-redux';
import { uploadFileCreateLoyaltyCard } from 'domain/actions/loyalty/release/loyalty-release.action';
import ErrorLogs from '../component/error-logs/ErrorLogs';
import { LoyaltyCardReleaseResponse } from 'model/response/loyalty/release/loyalty-card-release.response';
import { hideLoading, showLoading } from 'domain/actions/loading.action';

const UploadLoyaltyCardRelease = () => {
  const [file, setFile] = useState<File>()
  const uploadRef = useRef<any>()
  const dispatch = useDispatch()
  const { Item } = Form;
  const formRef = createRef<FormInstance>();
  const [response, setResponse] = useState<LoyaltyCardReleaseResponse>()
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

  const callback = useCallback((data: any) => {
    dispatch(hideLoading())
    if (data) {
      showSuccess('Tạo đợt phát hành thành công')
      formRef.current?.resetFields()
      setFile(undefined)
      setResponse(data)
    }
  }, [formRef, dispatch])

  const onCloseErrorLogModal = useCallback(() => {
    setResponse(undefined)
  }, [])

  const onFinish = useCallback((values) => {
    if (!file || !values.name) {
      showWarning('Thông tin đợt phát hành chưa đầy đủ')
      return;
    }
    dispatch(showLoading())
    dispatch(uploadFileCreateLoyaltyCard(file, values.name, callback))
  },
    [callback, dispatch, file]
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
          path: `${UrlConfig.CUSTOMER2}-cards`,
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
      <ErrorLogs
        visible={response !== undefined}
        onOk={onCloseErrorLogModal}
        okText="Thoát"
        errors={response?.errors}
        success={response?.success || 0}
        fail={response?.fail || 0}
        onCancel={onCloseErrorLogModal}
      />
    </ContentContainer>
  )
}

export default UploadLoyaltyCardRelease;