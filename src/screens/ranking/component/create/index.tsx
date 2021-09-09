import { Card, Col, Input, Row, Form, FormInstance, Select, Button, InputNumber } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/url.config';
import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom';
import './create-ranking.scss'
import IconBack from "../../../settings/third-party-logistics-integration/component/BottomBar/images/iconBack.svg";
import { useDispatch } from 'react-redux';
import { CreateLoyaltyRank, GetLoyaltyRankDetail, UpdateLoyaltyRank } from 'domain/actions/loyalty/rank/loyalty-rank.action';
import { LoyaltyRankResponse } from 'model/response/loyalty/ranking/loyalty-rank.response';
import { formatCurrency, replaceFormatString } from 'utils/AppUtils';
import NumberInput from 'component/custom/number-input.custom';
import { showError, showSuccess } from 'utils/ToastUtils';
import { useParams } from 'react-router';

const { Item } = Form;
const { Option } = Select;

const CreateCustomerRanking = () => {
  const formRef = createRef<FormInstance>();
  const dispatch = useDispatch()
  const params = useParams() as any;

  const initFormValues = useMemo(() => {
    return {
      name: '',
      type: 'CASH',
      accumulated_from: 0,
      note: '',
      status: 'ACTIVE'
    }
  }, [])

  const updateForm = useCallback((data: LoyaltyRankResponse) => {
    formRef.current?.setFieldsValue({
      status: data.status,
      name: data.name,
      note: data.note,
      method: data.method,
      accumulated_from: data.accumulated_from
    })
  }, [])

  useEffect(() => {
    if (params.id) {
      dispatch(GetLoyaltyRankDetail(params.id, updateForm))
      formRef.current?.setFieldsValue({
        status: 'INACTIVE'
      })
    }
  }, [params])

  const onCreateCallback = useCallback((data: LoyaltyRankResponse) => {
    formRef.current?.resetFields();
    showSuccess('Thành công')
  }, [])

  const onFinish = useCallback((values) => {
    if (!values.accumulated_from) {
      showError('Giá trị nhỏ nhất không được để trống và phải lớn hơn 0')
      return;
    }
    if (params.id) {
      dispatch(UpdateLoyaltyRank(params.id, values, (data: LoyaltyRankResponse) => showSuccess('Cập nhật thành công')))
    } else {
      dispatch(CreateLoyaltyRank(values, onCreateCallback))
    }
  },
    [dispatch]
  );
  return (
    <ContentContainer
      title={params.id ? "Cập nhật hạng thẻ khách hàng" : "Thêm hạng thẻ khách hàng"}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Hạng thẻ",
          path: `${UrlConfig.CUSTOMER}/rankings`,
        },
        {
          name: `${params.id ? "Cập nhật hạng thẻ" : "Thêm hạng thẻ"}`,
          path: `${params.id ? `${UrlConfig.CUSTOMER}/rankings/${params.id}/update` : `${UrlConfig.CUSTOMER}/rankings/create`}`,
        },
      ]}
    >
      <Form
        onFinish={onFinish}
        initialValues={initFormValues}
        layout="vertical"
        ref={formRef}
        className="create-customer-ranking"
      >
        <Row>
          <Col span={16} style={{marginRight: '10px'}}>
            <Card
              title={
                <div className="d-flex">
                  <span className="card-title">
                    THÔNG TIN HẠNG THẺ
                  </span>
                </div>
              }
            >
              <div className="general-info">
                <Row>
                  <Col span={11}>
                    <div className="row-label">Tên hạng thẻ <span className="text-error">*</span></div>
                    <Item
                      name="name"
                      rules={[
                        { transform: (value) => value.trim() },
                        {
                          required: true,
                          message: "Vui lòng điền tên hạng thẻ",
                          whitespace: true
                        },
                      ]}
                    >
                      <Input placeholder="Nhập tên hạng thẻ" />
                    </Item>
                  </Col>
                  <Col span={2}></Col>
                  <Col span={11}>
                    <div className="row-label">Kiểu điều kiện <span className="text-error">*</span></div>
                    <Item
                      name="type"
                    >
                      <Select>
                        <Option value="CASH">Theo tiền lũy kế</Option>
                        {/* <Option disabled value="POINT">Theo số điểm</Option> */}
                      </Select>
                    </Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={11}>
                    <div className="row-label">Giá trị nhỏ nhất <span className="text-error">*</span></div>
                    <Item
                      name="accumulated_from"
                      rules={[
                        {
                          required: true,
                          message: "Giá trị nhỏ nhất không được để trống",
                        },
                      ]}
                    >
                      <NumberInput
                        style={{width: '100%', textAlign: 'left'}}
                        placeholder="Nhập giá trị nhỏ nhất để lên hạng"
                        format={(a: string) => formatCurrency(a)}
                        replace={(a: string) =>
                          replaceFormatString(a)
                        }
                      />
                    </Item>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <div className="row-label">Ghi chú</div>
                    <Item
                      name="note"
                    >
                      <TextArea placeholder="Nhập ghi chú" style={{ width: '100vw', height: '104px' }}></TextArea>
                    </Item>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col span={7} style={{marginLeft: '10px'}}>
            <Card
              title={
                <div className="d-flex">
                  <span className="card-title">
                    THÔNG TIN KHÁC
                  </span>
                </div>
              }
            >
              <div className="general-info">
                <Row>
                  <Col span={24}>
                    <div className="row-label">Trạng thái <span className="text-error">*</span></div>
                    <Item
                      name="status"
                    >
                      <Select>
                        <Option value="ACTIVE">Đang hoạt động</Option>
                        <Option value="INACTIVE">Không hoạt động</Option>
                      </Select>
                    </Item>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>
        <Row
          gutter={24}
          className="footer-controller"
          style={{
            position: "fixed",
            textAlign: "right",
            width: "100%",
            height: "55px",
            bottom: "0%",
            backgroundColor: "#FFFFFF",
            marginLeft: "-30px",
          }}
        >
          <Col span={6} className="back">
            <Link to={`${UrlConfig.CUSTOMER}/rankings`}>
              <img src={IconBack} style={{ marginRight: 10 }} />
              <span>Quay lại danh sách hạng thẻ</span>
            </Link>
          </Col>
          <Col span={14} className="action-group">
            <Button
              type="default"
              className="cancel-btn"
            >
              <Link to={`${UrlConfig.CUSTOMER}/rankings`}>
                Hủy
              </Link>
            </Button>
            <Button
              type="primary"
              className="save-btn"
              onClick={() => {
                formRef.current?.submit();
              }}
            >
              Lưu hạng thẻ
            </Button>
          </Col>
        </Row>
      </Form>
    </ContentContainer>
  )
}

export default CreateCustomerRanking;