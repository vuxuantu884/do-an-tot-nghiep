import React, { ReactElement } from "react";
import {
  Card,
  Form,
  FormInstance,
  Input,
  Row,
  Col,
} from "antd";
import PromotionCampaignConditionForm from "screens/promotion/campaign/components/PromotionCampaignConditionForm";
import { PromotionCampaignFormStyled } from "screens/promotion/campaign/campaign.style";

interface Props {
  form: FormInstance;
  isAllStore?: boolean;
  isAllChannel?: boolean;
  isAllSource?: boolean;
  isAllCustomer?: boolean;
}

function PromotionCampaignForm(props: Props): ReactElement {
  const {
    form,
    isAllChannel,
    isAllSource,
    isAllStore,
    isAllCustomer
  } = props;

  const onPressEnterNameInput = () => {
    let element: any = document.getElementById("name");
    element.blur();
  };
  const onBlurNameInput = (e: any) => {
    const nameValue = e.target.value.trim();
    form.setFieldsValue({
      name: nameValue,
    });
  };

  return (
    <PromotionCampaignFormStyled>
      <Row gutter={24}>
        <Col span={18}>
          <Card title="THÔNG TIN CHƯƠNG TRÌNH KHUYẾN MẠI">
            <div className="form-name">
              <div className="name-description">Tên chương trình/ Thông điệp: <span style={{ color: "red" }}>*</span></div>
              <Form.Item
                name="name"
                label=""
                rules={[
                  {
                    required: true,
                    message: "Bạn cần bổ sung tên chương trình KM",
                  },
                  {
                    max: 255,
                    message: "Tên chương trình KM không được vượt quá 255 ký tự",
                  },
                ]}
                className={"name-input"}
              >
                <Input
                  id="name"
                  placeholder="Nhập tên chương trình KM"
                  onPressEnter={onPressEnterNameInput}
                  onBlur={onBlurNameInput}
                />
              </Form.Item>
            </div>

            <Row gutter={24}>
              <Col span={12}>
                <div className="content">Nội dung chương trình khuyến mại: <span style={{ color: "red" }}>*</span></div>
                <Form.Item
                  name="description"
                  label=""
                  rules={[
                    {
                      required: true,
                      message: "Bạn cần bổ sung nội dung chương trình KM",
                    },
                    {
                      max: 500,
                      message: "Nội dung không được vượt quá 500 ký tự",
                    },
                  ]}
                >
                  <Input.TextArea
                    id="description"
                    placeholder="Nhập nội dung chương trình khuyến mại"
                    style={{ minHeight: "200px" }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="note"
                  label="Ghi chú:"
                  rules={[
                    {
                      max: 500,
                      message: "Ghi chú không được vượt quá 500 ký tự",
                    },
                  ]}
                >
                  <Input.TextArea placeholder="Nhập ghi chú" style={{ minHeight: "200px" }} />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={6}>
          <PromotionCampaignConditionForm
            form={form}
            isAllChannel={isAllChannel}
            isAllCustomer={isAllCustomer}
            isAllSource={isAllSource}
            isAllStore={isAllStore}
          />
        </Col>
      </Row>
    </PromotionCampaignFormStyled>
  );
}
export default PromotionCampaignForm;
