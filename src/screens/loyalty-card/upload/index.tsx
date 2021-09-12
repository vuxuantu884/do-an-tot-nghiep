import { Button, Card, Col, Input, Row,Form, FormInstance } from 'antd';
import ContentContainer from 'component/container/content.container';
import CustomSelect from 'component/custom/select.custom';
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

const UploadLoyaltyCardRelease = () => {
  const [file, setFile] = useState<File>()
  const uploadRef = useRef<any>()
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch()
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

  const onChangeUploadFile = useCallback((event: React.ChangeEvent<HTMLInputElement> | undefined) => {
    if (event && event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0])
    }
  }, [])

  const callback = useCallback((data: any) => {
    setLoading(false)
    if (data) {
      showSuccess('Tạo đợt phát hành thành công')
      formRef.current?.resetFields()
      setFile(undefined)
    }
  }, [formRef])

  const onFinish = useCallback((values) => {
    if (!file || !values.name) {
      showWarning('Thông tin đợt phát hành chưa đầy đủ')
      return;
    }
    setLoading(true)
    dispatch(uploadFileCreateLoyaltyCard(file, values.name, callback))
  },
    [callback, dispatch, file]
  );

  return (
    <ContentContainer
      title="Thẻ khách hàng"
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Khách hàng",
          path: `${UrlConfig.CUSTOMER}`,
        },
        {
          name: "Thẻ khách hàng",
          path: `${UrlConfig.CUSTOMER}/cards`,
        },
        {
          name: "Tạo mới đợt phát hành",
        },
      ]}
    >
      <Card
        title={
          <span>TẢI FILE MẪU</span>
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
                <div className="release-label">Doanh nghiệp</div>
                <div className="release-content">
                  <CustomSelect
                    mode="multiple"
                    showArrow
                    showSearch
                    placeholder="Doanh nghiệp"
                    notFoundContent="Không tìm thấy kết quả"
                    style={{
                      width: '100%'
                    }}
                    optionFilterProp="children"
                  >
                    <CustomSelect.Option value="Yody">
                      Yody
                    </CustomSelect.Option>
                  </CustomSelect>
                </div>
              </Col>
              <Col span={14}>
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
                        <img alt="" className="delete-icon" src={deleteIcon} />
                      </div>
                    )
                  }
                </div>
              </Col>
            </Row>
            <Row>
              <Button
                loading={loading}
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
    </ContentContainer>
  )
}

export default UploadLoyaltyCardRelease;