import { Button, Card, Col, Form, Row } from "antd";
import iconPerson from "assets/icon/person.png";
import iconCalendar from "assets/icon/calendar.png";
import iconPhone from "assets/icon/phone.png";
import iconAddress from "assets/icon/address.png";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import TagStatus from "component/tag/tag-status";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import {
  WarrantyExpense,
  WarrantyItemModel,
  WarrantyItemStatus,
} from "model/warranty/warranty.model";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, RouterProps, useParams } from "react-router-dom";
import {
  getWarrantyDetailService,
  updateWarrantyDetailFeeService,
} from "service/warranty/warranty.service";
import {
  formatCurrency,
  handleFetchApiError,
  isFetchApiSuccessful,
  replaceFormatString,
} from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./styles";
import {
  WARRANTY_ITEM_STATUS,
  WARRANTY_RETURN_STATUS,
  WARRANTY_TYPE,
} from "utils/Warranty.constants";

type PropTypes = RouterProps & {};

type TagStatusType = {
  status: WarrantyItemStatus;
  name: string;
  type: string;
};

type FormValueType = {
  fee: number | undefined;
  customer_fee: number | undefined;
};

function ReadWarranty(props: PropTypes) {
  const formatDate = DATE_FORMAT.fullDate;
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch();
  const [textResult, setTextResult] = useState("Đang tải ...");
  const [warranty, setWarranty] = React.useState<WarrantyItemModel>();
  console.log("id", id);
  console.log("warranty", warranty);
  const [form] = Form.useForm();

  const tagStatusArr: TagStatusType[] = [
    {
      status: WarrantyItemStatus.FINISH,
      name: "Mới nhận hàng",
      type: "success",
    },
    {
      status: WarrantyItemStatus.FIXED,
      name: "Hoàn thành",
      type: "success",
    },
  ];

  const initialFormValue: FormValueType = {
    fee: undefined,
    customer_fee: undefined,
  };

  const fetchWarranty = useCallback(
    async (id: string | number) => {
      getWarrantyDetailService(+id).then((response) => {
        if (isFetchApiSuccessful(response)) {
          setWarranty(response.data);
        } else {
          handleFetchApiError(response, "Chi tiết phiếu bảo hàng", dispatch);
          setTextResult("Không tìm thấy phiếu bảo hành!");
        }
      });
    },
    [dispatch]
  );

  const handleSubmitRepairFeeForm = () => {
    if (!warranty) {
      return;
    }
    form.validateFields().then(() => {
      const values = form.getFieldsValue();
      console.log("values", values);
      dispatch(showLoading());
      const params = {
        customer_fee: values.customer_fee,
        price: values.fee,
      };
      updateWarrantyDetailFeeService(warranty.warranty.id, warranty.id, params)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            console.log("response", response);
            showSuccess("Cập nhật phí sửa chữa thành công!");
          } else {
            handleFetchApiError(response, "Cập nhật phí sửa chữa", dispatch);
          }
        })
        .finally(() => {
          dispatch(hideLoading());
        });
    });
  };

  const renderTagStatus = () => {
    let html = null;
    const tagStatus = tagStatusArr.find((tag) => tag.status === warranty?.status);
    if (tagStatus) {
      html = tagStatus.name;
    }
    return html;
  };

  const renderReason = (expenses: WarrantyExpense[]) => {
    let html = null;
    if (expenses.length > 0) {
      const expensesArr = expenses.map((expense) => expense.reason);
      html = expensesArr.join(", ");
    }
    return html;
  };

  const renderWarrantyItemHtml = () => {
    let html = null;
    if (warranty?.variant && warranty.variant_id && warranty.product_id) {
      html = (
        <Row>
          <Col span={16}>
            <Link
              to={`${UrlConfig.PRODUCT}/${warranty.product_id}/variants/${warranty.variant_id}`}
            >
              {warranty?.variant}
            </Link>
          </Col>
          <Col span={8}>Lý do: {renderReason(warranty.expenses)}</Col>
        </Row>
      );
    }
    return html;
  };

  useEffect(() => {
    if (id) {
      fetchWarranty(id);
    }
  }, [id, fetchWarranty]);

  useEffect(() => {
    form.setFieldsValue({
      fee: warranty?.price,
      customer_fee: warranty?.customer_fee,
    });
  }, [form, warranty?.customer_fee, warranty?.price]);

  return (
    <ContentContainer
      title={`Phiếu bảo hành ID ${id}`}
      breadcrumb={[
        {
          name: "Tổng quan",
          path: UrlConfig.HOME,
        },
        {
          name: "Lịch sử bảo hành",
          path: UrlConfig.WARRANTY,
        },
        {
          name: "Chi tiết phiếu bảo hành",
        },
      ]}
    >
      <StyledComponent>
        {warranty ? (
          <Row gutter={20}>
            {/* left column */}
            <Col span={12}>
              <Card
                title={<div>Khách hàng</div>}
                className="cardCustomer"
                extra={<TagStatus type="success">{renderTagStatus()}</TagStatus>}
              >
                <div className="single">
                  {" "}
                  <img src={iconPerson} alt="" /> {warranty?.warranty?.customer}
                </div>
                <div className="single">
                  <img src={iconPhone} alt="" />
                  {warranty?.warranty?.customer_mobile}
                </div>
                <div className="single">
                  <img src={iconAddress} alt="" />
                  {warranty?.warranty?.customer_address}
                </div>
                <div className="single">
                  <img src={iconCalendar} alt="" />
                  Ngày mua hàng:{" "}
                  {warranty?.purchase_date
                    ? moment(warranty?.purchase_date).format(formatDate)
                    : "-"}
                </div>
                <div className="single">
                  <img src={iconCalendar} alt="" />
                  Ngày hẹn trả:{" "}
                  {warranty?.appointment_date
                    ? moment(warranty?.appointment_date).format(formatDate)
                    : "-"}
                </div>
              </Card>
              <Card title={"Thông tin"} className="cardInformation">
                <Row>
                  <Col span={8}>Cửa hàng:</Col>
                  <Col span={16}>
                    <b>{warranty?.warranty?.store}</b>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Người tạo:</Col>
                  <Col span={16}>
                    {warranty?.created_by && warranty?.created_name ? (
                      <Link to={`${UrlConfig.ACCOUNTS}/${warranty?.created_by}`}>
                        <b>{warranty?.created_name}</b>
                      </Link>
                    ) : (
                      "-"
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Nhân viên tiếp nhận:</Col>
                  <Col span={16}>
                    {warranty?.warranty?.assignee && warranty?.warranty?.assignee_code ? (
                      <Link to={`${UrlConfig.ACCOUNTS}/${warranty?.warranty?.assignee_code}`}>
                        <b>{warranty?.warranty?.assignee}</b>
                      </Link>
                    ) : (
                      "-"
                    )}
                  </Col>
                </Row>
              </Card>
              <Card title="Trạng thái sản phẩm" className="cardProduct">
                <Row>
                  <Col span={8}>Trạng thái xử lý sản phẩm:</Col>
                  <Col span={16}>
                    <b>
                      {WARRANTY_ITEM_STATUS.find((status) => status.code === warranty.status)
                        ?.name || "-"}
                    </b>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Trạng thái trả khách:</Col>
                  <Col span={16}>
                    <b>
                      {WARRANTY_RETURN_STATUS.find(
                        (status) => status.code === warranty.return_status
                      )?.name || "-"}
                    </b>
                  </Col>
                </Row>
              </Card>
            </Col>
            {/* right column */}
            <Col span={12}>
              <Card
                title="Phí sửa chữa"
                extra={
                  <Button type="primary" onClick={handleSubmitRepairFeeForm}>
                    Lưu
                  </Button>
                }
              >
                <Form
                  form={form}
                  name="form-order-processing-status"
                  layout="horizontal"
                  initialValues={initialFormValue}
                >
                  <Form.Item
                    label={"Chi phí sửa chữa"}
                    labelCol={{ span: 8 }}
                    labelAlign={"left"}
                    name="fee"
                    rules={[
                      () => ({
                        validator(_, value) {
                          if (value && value < 1000) {
                            return Promise.reject(new Error("Nhập 0 hoặc ít nhất 4 chữ số!"));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <NumberInput
                      format={(a: string) => formatCurrency(a)}
                      replace={(a: string) => replaceFormatString(a)}
                      placeholder="Nhập phí sửa chữa"
                      style={{
                        textAlign: "left",
                        width: "100%",
                        fontWeight: 500,
                        color: "#222222",
                      }}
                      maxLength={14}
                      minLength={0}
                    />
                  </Form.Item>
                  <Form.Item
                    label={"Phí sửa chữa báo khách"}
                    labelCol={{ span: 8 }}
                    labelAlign={"left"}
                    name="customer_fee"
                    rules={[
                      () => ({
                        validator(_, value) {
                          if (value && value < 1000) {
                            return Promise.reject(new Error("Nhập 0 hoặc ít nhất 4 chữ số!"));
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <NumberInput
                      format={(a: string) => formatCurrency(a)}
                      replace={(a: string) => replaceFormatString(a)}
                      placeholder="Nhập phí sửa chữa báo khách"
                      style={{
                        textAlign: "left",
                        width: "100%",
                        fontWeight: 500,
                        color: "#222222",
                      }}
                      maxLength={14}
                      minLength={0}
                    />
                  </Form.Item>
                </Form>
              </Card>
              <Card title="Sản phẩm" className="cardProduct">
                {warranty?.variant ? renderWarrantyItemHtml() : "Không có sản phẩm nào!"}
              </Card>
              <Card title="Loại bảo hành" className="cardProduct">
                <Row>
                  <Col span={8}>Loại bảo hành:</Col>
                  <Col span={16}>
                    <b>
                      {WARRANTY_TYPE.find((status) => status.code === warranty.type)?.name || "-"}
                    </b>
                  </Col>
                </Row>
              </Card>
              <Card title="Trung tâm bảo hành" className="cardProduct">
                <Row>
                  <Col span={8}>Trung tâm bảo hành:</Col>
                  <Col span={16}>
                    <b>{warranty.warranty_center || "-"}</b>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        ) : (
          textResult
        )}
      </StyledComponent>
    </ContentContainer>
  );
}

export default ReadWarranty;
