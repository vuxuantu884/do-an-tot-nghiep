import { Button, Col, Form, Row, Space } from "antd";
import ContentContainer from "component/container/content.container";
import UrlConfig from "config/url.config";
import React, { useState } from "react";

import arrowLeft from "assets/icon/arrow-back.svg";
import BottomBarContainer from "component/container/bottom-bar.container";
import { useDispatch } from "react-redux";
import { StockInOutType } from "../constant";
import StockInOutWareHouseForm from "../components/StockInOutWareHouseForm";
import { callApiNative } from "utils/ApiUtils";
import { isEmpty } from "lodash";
import StockInOutInfoForm from "../components/StockInOutInfoForm";
import StockInOutProductForm from "../components/StockInOutProductForm";
import { useHistory } from "react-router-dom";
import { StockInOutOtherData } from "model/stock-in-out-other";
import { createStockInOutOthers } from "service/inventory/stock-in-out/index.service";
import { showError, showSuccess } from "utils/ToastUtils";

const StockOutOtherCreate: React.FC = () => {
  const [isRequireNote, setIsRequireNote] = useState<boolean>(false);
  const [formMain] = Form.useForm();

  const history = useHistory();
  const dispatch = useDispatch();

  const onFinish = async (data: StockInOutOtherData) => {
    const stockInOutItems = data.stock_in_out_other_items;
    if (isEmpty(stockInOutItems)) {
      showError("Vui lòng thêm sản phẩm");
      return;
    }
    delete data.account; // Xóa dữ liệu thừa
    const response = await callApiNative(
      { isShowError: true, isShowLoading: true },
      dispatch,
      createStockInOutOthers,
      data,
    );
    if (response) {
      history.push(`${UrlConfig.STOCK_IN_OUT_OTHERS}`);
      showSuccess("Tạo phiếu thành công");
    }
  };

  return (
    <ContentContainer
      title="Nhập xuất khác"
      breadcrumb={[
        {
          name: "Tạo phiếu xuất khác",
          path: UrlConfig.HOME,
        },
        {
          name: "Nhập xuất khác",
          path: UrlConfig.STOCK_IN_OUT_OTHERS,
        },
        {
          name: "Tạo phiếu xuất khác",
        },
      ]}
    >
      <Form form={formMain} onFinish={onFinish}>
        <Row gutter={24} style={{ paddingBottom: 30 }}>
          <Col span={18}>
            <StockInOutWareHouseForm
              title="THÔNG TIN XUẤT KHO"
              formMain={formMain}
              stockInOutType={StockInOutType.stock_out}
              setIsRequireNote={setIsRequireNote}
            />
            <StockInOutProductForm
              title="SẢN PHẨM XUẤT"
              formMain={formMain}
              inventoryType={StockInOutType.stock_out}
            />
          </Col>
          <Col span={6}>
            <StockInOutInfoForm
              title="THÔNG TIN PHIẾU XUẤT"
              formMain={formMain}
              isRequireNote={isRequireNote}
              stockInOutType={StockInOutType.stock_out}
            />
          </Col>
        </Row>

        <BottomBarContainer
          leftComponent={
            <div
              onClick={() => {
                history.push(`${UrlConfig.STOCK_IN_OUT_OTHERS}`);
                return;
                // }
              }}
              style={{ cursor: "pointer" }}
            >
              <img style={{ marginRight: "10px" }} src={arrowLeft} alt="" />
              {"Quay lại danh sách"}
            </div>
          }
          rightComponent={
            <Space>
              <Button type="primary" onClick={() => formMain.submit()}>
                Xuất kho
              </Button>
            </Space>
          }
        />
      </Form>
    </ContentContainer>
  );
};

export default StockOutOtherCreate;
