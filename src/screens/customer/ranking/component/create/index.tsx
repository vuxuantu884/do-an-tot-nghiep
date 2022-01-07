import { Card, Col, Input, Row, Form, FormInstance, Select, Button } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import ContentContainer from 'component/container/content.container';
import UrlConfig from 'config/url.config';
import React, { createRef, useCallback, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom';
import './create-ranking.scss'
import IconBack from "assets/icon/arrow-back.svg";
import { useDispatch } from 'react-redux';
import { CreateLoyaltyRank, GetLoyaltyRankDetail, UpdateLoyaltyRank } from 'domain/actions/loyalty/rank/loyalty-rank.action';
import { LoyaltyRankResponse } from 'model/response/loyalty/ranking/loyalty-rank.response';
import { formatCurrency, replaceFormatString } from 'utils/AppUtils';
import NumberInput from 'component/custom/number-input.custom';
import { showError, showSuccess } from 'utils/ToastUtils';
import { useHistory, useParams } from 'react-router';
import { CustomerLevelPermission } from 'config/permissions/customer.permission';
import useAuthorization from 'hook/useAuthorization';

const { Item } = Form;
const { Option } = Select;

const updateCustomerLevelPermission = [CustomerLevelPermission.levels_update];

const CreateCustomerRanking = () => {
  const formRef = createRef<FormInstance>();
  const dispatch = useDispatch()
  const params = useParams() as any;
  const history = useHistory();

  const [allowUpdateCustomerLevel] = useAuthorization({
    acceptPermissions: updateCustomerLevelPermission,
    not: false,
  });

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
  }, [formRef])

  useEffect(() => {
    if (params.id) {
      dispatch(GetLoyaltyRankDetail(params.id, updateForm))
      formRef.current?.setFieldsValue({
        status: 'INACTIVE'
      })
    }
  }, [dispatch, formRef, params, updateForm])

  const onCreateCallback = useCallback((data: LoyaltyRankResponse) => {
    formRef.current?.resetFields();
    showSuccess('Thành công')
    history.push(`${UrlConfig.CUSTOMER2}-rankings`)
  }, [formRef, history])

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
    [dispatch, onCreateCallback, params.id]
  );

  return (
    <ContentContainer
      title={params.id ? "Sửa hạng khách hàng" : "Thêm hạng khách hàng"}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Hạng khách hàng",
          path: `${UrlConfig.CUSTOMER2}-rankings`,
        },
        {
          name: `${params.id ? "Sửa hạng khách hàng" : "Thêm hạng khách hàng"}`,
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
        <Row style={{flexFlow: 'row'}}>
          <Col span={16} style={{marginRight: '10px', flex: '1'}}>
            <Card
              title={
                <div className="d-flex">
                  <span className="card-title">
                    THÔNG TIN HẠNG KHÁCH HÀNG
                  </span>
                </div>
              }
            >
              <div className="general-info">
                <Row>
                  <Col span={11}>
                    <div className="row-label">Tên hạng khách hàng <span className="text-error">*</span></div>
                    <Item
                      name="name"
                      rules={[
                        { transform: (value) => value.trim() },
                        {
                          required: true,
                          message: "Vui lòng điền tên hạng khách hàng",
                          whitespace: true
                        },
                      ]}
                    >
                      <Input placeholder="Nhập hạng khách hàng" disabled={params.id && !allowUpdateCustomerLevel}/>
                    </Item>
                  </Col>
                  <Col span={2}></Col>
                  <Col span={11}>
                    <div className="row-label">Kiểu điều kiện <span className="text-error">*</span></div>
                    <Item
                      name="type"
                    >
                      <Select disabled={params.id && !allowUpdateCustomerLevel}>
                        <Option value="CASH">Theo tiền tích lũy</Option>
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
                        max={999999999999999}
                        disabled={params.id && !allowUpdateCustomerLevel}
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
                      <TextArea disabled={params.id && !allowUpdateCustomerLevel} placeholder="Nhập ghi chú" style={{ width: '100vw', height: '104px' }}></TextArea>
                    </Item>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
          <Col style={{marginLeft: '10px', width: '100%'}}>
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
                      <Select disabled={params.id && !allowUpdateCustomerLevel}>
                        <Option value="ACTIVE">Đang hoạt động</Option>
                        <Option value="INACTIVE">Dừng hoạt động</Option>
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
            width: "calc(100% - 240px)",
            height: "55px",
            bottom: "0%",
            backgroundColor: "#FFFFFF",
            marginLeft: "-30px",
          }}
        >
          <Col span={8} className="back">
            <Link to={`${UrlConfig.CUSTOMER2}-rankings`}>
              <img src={IconBack} alt="" style={{ marginRight: 10 }} />
              <span>Quay lại danh sách hạng khách hàng</span>
            </Link>
          </Col>

          <Col span={16} className="action-group">
            {params.id ?
              (allowUpdateCustomerLevel &&
                <Button
                  type="primary"
                  className="save-btn"
                  onClick={() => {
                    formRef.current?.submit();
                  }}
                >
                  Lưu hạng khách hàng
                </Button>
              )
            : <Button
                type="primary"
                className="save-btn"
                onClick={() => {
                  formRef.current?.submit();
                }}
              >
                Tạo hạng khách hàng
              </Button>
            }
          </Col>
          
        </Row>
      </Form>
    </ContentContainer>
  )
}

export default CreateCustomerRanking;