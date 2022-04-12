import { Button, Card, Col, Form, Row } from "antd";
import ContentContainer from "component/container/content.container";
import NumberInput from "component/custom/number-input.custom";
import TagStatus from "component/tag/tag-status";
import UrlConfig from "config/url.config";
import { hideLoading, showLoading } from "domain/actions/loading.action";
import { WarrantyExpense, WarrantyModel, WarrantyStatus } from "model/warranty/warranty.model";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { RouterProps, useParams } from "react-router-dom";
import {
  getWarrantyDetailService,
  updateWarrantyDetailService,
} from "service/warranty/warranty.service";
import {
  formatCurrency,
  handleFetchApiError,
  isFetchApiSuccessful,
  replaceFormatString,
} from "utils/AppUtils";
import { DATE_FORMAT } from "utils/DateUtils";
import { showSuccess } from "utils/ToastUtils";
import { StyledComponent } from "./WarrantyDetail.style";

type PropTypes = RouterProps & {};

type TagStatusType = {
  status: WarrantyStatus;
  name: string;
  type: string;
};

type FormValueType = {
  fee: number | undefined;
  feeInformedToCustomer: number | undefined;
};

function ReadWarranty(props: PropTypes) {
  const formatDate = DATE_FORMAT.fullDate;
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch();
  const [textResult, setTextResult] = useState("Đang tải ...")
  const [warranty, setWarranty] = React.useState<WarrantyModel>();
  console.log("id", id);
  console.log("warranty", warranty);
  const [form] = Form.useForm();

  const tagStatusArr: TagStatusType[] = [
    {
      status: WarrantyStatus.NEW,
      name: "Mới nhận hàng",
      type: "success",
    },
    {
      status: WarrantyStatus.FINISH,
      name: "Hoàn thành",
      type: "success",
    },
  ];

  const getTotalAmountFee = useMemo(() => {
    let result = 0;
    if (warranty?.line_items && warranty.line_items.length > 0) {
      warranty?.line_items.forEach((single) => {
        result = result + single.customer_fee;
      });
    }
    return result;
  }, [warranty?.line_items]);

  console.log("getTotalAmountFee", getTotalAmountFee);

  const getTotalAmountFeeInformedToCustomer = useMemo(() => {
    let result = 0;
    if (warranty?.line_items && warranty.line_items.length > 0) {
      warranty?.line_items.forEach((single) => {
        result = result + single.price;
      });
    }
    return result;
  }, [warranty?.line_items]);

  const initialFormValue: FormValueType = {
    fee: undefined,
    feeInformedToCustomer: undefined,
  };

  const fetchWarranty = useCallback(
    async (id: string | number) => {
      getWarrantyDetailService(+id).then((response) => {
        if (isFetchApiSuccessful(response)) {
          setWarranty(response.data);
        } else {
          handleFetchApiError(response, "Chi tiết phiếu bảo hàng", dispatch);
          setTextResult("Không tìm thấy phiếu bảo hành!")
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
      const params: WarrantyModel = {
        ...warranty,
        line_items: warranty.line_items.map((lineItem) => {
          return {
            ...lineItem,
            customer_fee: values.fee,
            price: values.feeInformedToCustomer,
          };
        }),
      };
      dispatch(showLoading());
      updateWarrantyDetailService(+id, params)
        .then((response) => {
          if (isFetchApiSuccessful(response)) {
            console.log("response", response);
            showSuccess("Cập nhật phí sửa chữa thành công!");
          } else {
            handleFetchApiError(response, "Cập nhật chi tiết phiếu bảo hàng", dispatch);
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

  const renderWarrantyLineItemsHtml = () => {
    let html = null;
    if (warranty?.line_items?.length && warranty?.line_items.length > 0) {
      html = (
        <Row>
          {warranty?.line_items.map((lineItem, index) => {
            return (
              <React.Fragment key={index}>
                <Col span={8}>{lineItem.variant}</Col>
                <Col span={16}>Lý do: {renderReason(lineItem.expenses)}</Col>
              </React.Fragment>
            );
          })}
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
      fee: getTotalAmountFee,
      feeInformedToCustomer: getTotalAmountFeeInformedToCustomer,
    });
    // form.resetFields()
  }, [form, getTotalAmountFee, getTotalAmountFeeInformedToCustomer]);

  return (
    <ContentContainer
      title="Phiếu bảo hành"
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
      ]}>
      <StyledComponent>
        {warranty ? (
          <Row gutter={20}>
            {/* left column */}
            <Col span={12}>
              <Card
                title={<div>Khách hàng</div>}
                extra={<TagStatus type="success">{renderTagStatus()}</TagStatus>}>
                <div>{warranty?.customer}</div>
                <div>{warranty?.customer_mobile}</div>
                <div>{warranty?.customer_address}</div>
              </Card>
              <Card title={"Thông tin"}>
                <Row>
                  <Col span={8}>Cửa hàng:</Col>
                  <Col span={16}>
                    <b>{warranty?.store}</b>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Người tạo:</Col>
                  <Col span={16}>
                    <b>{warranty?.created_name}</b>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Nhân viên tiếp nhận:</Col>
                  <Col span={16}>
                    <b>{warranty?.assignee}</b>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Ngày mua hàng:</Col>
                  <Col span={16}>
                    <b>
                      {warranty?.purchase_date
                        ? moment(warranty?.purchase_date).format(formatDate)
                        : "-"}
                    </b>
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Ngày hẹn trả:</Col>
                  <Col span={16}>
                    <b>
                      {warranty?.appointment_date
                        ? moment(warranty?.appointment_date).format(formatDate)
                        : "-"}
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
                }>
                <Form
                  form={form}
                  name="form-order-processing-status"
                  layout="horizontal"
                  initialValues={initialFormValue}>
                  <Form.Item
                    label={"Chi phí sửa chữa"}
                    labelCol={{ span: 8 }}
                    labelAlign={"left"}
                    name="fee">
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
                    name="feeInformedToCustomer">
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
              <Card title="Sản phẩm">
                {warranty?.line_items && warranty.line_items.length > 0
                  ? renderWarrantyLineItemsHtml()
                  : "Không có sản phẩm nào!"}
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
