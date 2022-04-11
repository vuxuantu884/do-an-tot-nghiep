import { Button, Card, Col, Form, Input, Row } from "antd";
import BaseResponse from "base/base.response";
import ContentContainer from "component/container/content.container";
import TagStatus from "component/tag/tag-status";
import UrlConfig from "config/url.config";
import { WarrantyModel } from "model/warranty/warranty.model";
import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProps, useParams } from "react-router-dom";
import { getWarrantyID } from "service/warranty/warranty.service";
import { callApiNative } from "utils/ApiUtils";
import { ReadWarrantyStyle } from "./index.style";

type PropTypes = RouterProps & {};

function ReadWarranty(props: PropTypes) {
  const { id } = useParams<{ id: string }>();

  const dispatch = useDispatch();
  const [warranty, setWarranty] = React.useState<WarrantyModel>();

  const fetchWarranty = useCallback(
    async (id: string | number) => {
      const response: BaseResponse<WarrantyModel> = await callApiNative(
        { notifyAction: "SHOW_ALL" },
        dispatch,
        getWarrantyID,
        +id
      );
      if (response.data) {
        // setWarranty(response.data);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    if (id) {
      fetchWarranty(id);
    }
  }, [id, fetchWarranty]);
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
          name: "Phiếu bảo hành",
        },
      ]}>
      <ReadWarrantyStyle>
        <Row gutter={20}>
          {/* left column */}
          <Col span={12}>
            <Card
              title={<div>Khách hàng</div>}
              extra={<TagStatus type="success">Đã nhận hàng</TagStatus>}>
              <div>{warranty?.customer || "Tên Khách hàng"}</div>
              <div>{warranty?.customer_mobile || "01234556777"}</div>
              <div>{warranty?.customer_address || "Địa chỉ khách hàng"}</div>
            </Card>
            <Card title={"Thông tin"}>
              <table className="table-info">
                <tbody>
                  <tr>
                    <td>Cửa hàng:</td>
                    <td>
                      <b>{warranty?.store || "Tên cửa hàng"}</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Người tạo:</td>
                    <td>
                      <b>Tên Người tạo</b>
                    </td>
                  </tr>
                  <tr>
                    <td>Nhân viên tiếp nhận:</td>
                    <td>
                      <b>Tên Nhân viên tiếp nhận</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </Col>
          {/* right column */}
          <Col span={12}>
            <Card title="Phí sửa chữa" extra={<Button type="primary">Lưu</Button>}>
              <Form.Item label={"Chi phí sửa chữa"} labelCol={{ span: 12 }} labelAlign={"left"}>
                <Input placeholder="Nhập phí sửa chữa" />
              </Form.Item>
              <Form.Item
                label={"Phí sửa chữa báo khách"}
                labelCol={{ span: 12 }}
                labelAlign={"left"}>
                <Input placeholder="Nhập phí sửa chữa báo khách" />
              </Form.Item>
            </Card>
            <Card title="Sản phẩm"></Card>
          </Col>
        </Row>
      </ReadWarrantyStyle>
    </ContentContainer>
  );
}

export default ReadWarranty;
