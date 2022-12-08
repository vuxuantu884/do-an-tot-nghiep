import { Card, Col, Form, Input, Radio, Row, Select } from "antd";
import { FormInstance } from "antd/es/form/Form";
import {
  PriceRule,
  PriceRuleMethod,
  ReleasePromotionListType,
} from "model/promotion/price-rules.model";
import { ReactElement, useContext } from "react";
import { PRICE_RULE_FIELDS } from "screens/promotion/constants";
import GeneralOrderThreshold from "screens/promotion/shared/general-order-threshold";
import GeneralProductQuantity from "screens/promotion/shared/general-product-quantity";
import { nonAccentVietnamese } from "utils/PromotionUtils";
import { IssueContext } from "./issue-provider";
import IssueTypeForm from "./issue-type-form";
const { Option } = Select;
interface Props {
  data?: PriceRule;
  form: FormInstance;
  isSetFormValues?: boolean;

  typeSelectPromotion: string;
  setTypeSelectPromotion: (item: string) => void;

  valueChangePromotion: number;
  setValueChangePromotion: (item: number) => void;

  promotionType: string;
  setPromotionType: (item: string) => void;
  defaultReleasePromotionListType?: string;

  releasePromotionListType: any;
  setReleasePromotionListType: any;

  releaseWithExlucdeOrAllProduct: any;
  setReleaseWithExlucdeOrAllProduct: (item: string) => void;

  listProductSelectImportNotExclude: any[];
  setListProductSelectImportNotExclude: (item: any) => void;

  listProductSelectImportHaveExclude: any[];
  setListProductSelectImportHaveExclude: (item: any) => void;

  listProductUpdate?: any;
  setListProductUpdate?: any;
  listProductUpdateNotExclude?: any;
  listProductUpdateHaveExclude?: any;
}

function IssueForm(props: Props): ReactElement {
  const {
    form,
    isSetFormValues,

    typeSelectPromotion,
    setTypeSelectPromotion,

    valueChangePromotion,
    setValueChangePromotion,

    promotionType,
    setPromotionType,
    defaultReleasePromotionListType,

    releasePromotionListType,
    setReleasePromotionListType,

    releaseWithExlucdeOrAllProduct,
    setReleaseWithExlucdeOrAllProduct,

    listProductSelectImportNotExclude,

    setListProductSelectImportNotExclude,
    listProductSelectImportHaveExclude,
    setListProductSelectImportHaveExclude,

    listProductUpdateNotExclude,
    listProductUpdateHaveExclude,
  } = props;
  const { priceRuleData } = useContext(IssueContext);

  const handleChangePromotionMethod = (value: string) => {
    setPromotionType(value);
  };

  const handleChangeReleasePromotionList = (value: string) => {
    setReleasePromotionListType(value);
  };

  const handleChangeRelaseHaveExcludeOrAllProduct = (value: string) => {
    setReleaseWithExlucdeOrAllProduct(value);
  };

  return (
    <div>
      <Card title={"THÔNG TIN CHUNG"}>
        <Row gutter={30}>
          <Col span={12}>
            <Form.Item
              name="title"
              label={"Tên đợt phát hành"}
              rules={[
                {
                  required: true,
                  message: "Cần nhập tên khuyến mãi",
                },
                {
                  max: 255,
                  message: "Tên khuyến mại không vượt quá 255 ký tự",
                },
              ]}
            >
              <Input placeholder="Nhập tên đợt phát hành" />
            </Form.Item>
            <Form.Item
              name="code"
              label="Mã đợt phát hành:"
              normalize={(value) => nonAccentVietnamese(value)}
            >
              <Input maxLength={20} disabled={true} placeholder="Mã hệ thống tạo tự động" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                {
                  max: 500,
                  message: "Mô tả không được vượt quá 500 ký tự",
                },
              ]}
            >
              <Input.TextArea
                placeholder="Nhập mô tả cho đợt phát hành"
                autoSize={{ minRows: 5, maxRows: 5 }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>
      <Card title="Loại khuyến mãi">
        <Row gutter={30}>
          {/* Loại khuyến mãi */}
          <Col span={24}>
            <Form.Item label="Chọn loại" name={PRICE_RULE_FIELDS.entitled_method}>
              <Select
                showArrow
                placeholder="Chọn loại mã khuyến mãi"
                value={promotionType}
                onChange={(value: string) => handleChangePromotionMethod(value)}
              >
                <Option
                  key={PriceRuleMethod.ORDER_THRESHOLD}
                  value={PriceRuleMethod.ORDER_THRESHOLD}
                >
                  Khuyến mãi theo đơn hàng
                </Option>
                {/*<Option*/}
                {/*  key={PriceRuleMethod.DISCOUNT_CODE_QTY}*/}
                {/*  value={PriceRuleMethod.DISCOUNT_CODE_QTY}*/}
                {/*>*/}
                {/*  Khuyến mãi theo sản phẩm*/}
                {/*</Option>*/}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <IssueTypeForm
              form={form}
              isSetFormValues={isSetFormValues}
              promotionType={promotionType}
              setValueChangePromotion={setValueChangePromotion}
              setTypeSelectPromotion={setTypeSelectPromotion}
            />
          </Col>
          <Col span={24}></Col>
        </Row>
      </Card>

      {promotionType === PriceRuleMethod.ORDER_THRESHOLD ? (
        <Card title="Điều kiện áp dụng">
          <GeneralOrderThreshold form={form} priceRuleData={priceRuleData} />
        </Card>
      ) : (
        <Card title="Danh sách áp dụng">
          <Form.Item name="operator">
            <Radio.Group
              defaultValue={
                defaultReleasePromotionListType
                  ? defaultReleasePromotionListType
                  : ReleasePromotionListType.EQUALS
              }
              value={releasePromotionListType}
              onChange={(e) => handleChangeReleasePromotionList(e.target.value)}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Radio value={ReleasePromotionListType.EQUALS}>Tìm kiếm/ Nhập file</Radio>
              <Radio value={ReleasePromotionListType.NOT_EQUAL_TO} style={{ padding: "10px 0" }}>
                Tất cả sản phẩm (kèm danh sách loại trừ)
              </Radio>
              <Radio value={ReleasePromotionListType.OTHER_CONDITION}>Danh sách có điều kiện</Radio>
            </Radio.Group>
          </Form.Item>

          <GeneralProductQuantity
            form={form}
            priceRuleData={priceRuleData}
            releasePromotionListType={releasePromotionListType}
            valueChangePromotion={valueChangePromotion}
            typeSelectPromotion={typeSelectPromotion}
            releaseWithExlucdeOrAllProduct={releaseWithExlucdeOrAllProduct}
            handleChangeRelaseHaveExcludeOrAllProduct={handleChangeRelaseHaveExcludeOrAllProduct}
            listProductSelectImportNotExclude={listProductSelectImportNotExclude}
            setListProductSelectImportNotExclude={setListProductSelectImportNotExclude}
            listProductSelectImportHaveExclude={listProductSelectImportHaveExclude}
            setListProductSelectImportHaveExclude={setListProductSelectImportHaveExclude}
            listProductUpdateNotExclude={listProductUpdateNotExclude}
            listProductUpdateHaveExclude={listProductUpdateHaveExclude}
          />
        </Card>
      )}
    </div>
  );
}

export default IssueForm;
