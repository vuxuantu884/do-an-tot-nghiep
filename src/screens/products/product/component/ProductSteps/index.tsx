import { CheckOutlined } from "@ant-design/icons";
import { Steps } from "antd";
import { ProductResponse, VariantResponse } from "model/product/product.model";
import { useMemo } from "react";
import "./index.scss";

export declare type Status = "error" | "process" | "finish" | "wait";
type ProductStepsProps = {
  data: ProductResponse | null;
};

type ProductStepStatus = {
  Material: Status;
  Price: Status;
  Image: Status;
  ProcessPrice: String;
  ProcessImage: String;
};

const { Step } = Steps;

const progressDot = (dot: any, { status, index }: any) => {
  console.log("index", index);
  let stt = 1;
  stt = index === 1 ? 2 : index === 2 ? 3 : 1;

  return (
    <div className="ant-steps-icon-dot">
      {status === "process" || status === "finish" ? <CheckOutlined /> : stt}
    </div>
  );
};

const ProductSteps: React.FC<ProductStepsProps> = (props: ProductStepsProps) => {
  const objProductSteps = useMemo(() => {
    const product = { ...props.data };

    let productStepStatus: ProductStepStatus = {
      Material: "wait",
      Price: "wait",
      Image: "wait",
      ProcessPrice: "",
      ProcessImage: "",
    };

    if (!product) return productStepStatus;

    if (
      product.material_component !== null &&
      product.material_advantages != null &&
      product.material_defect !== null
    )
      productStepStatus.Material = "finish";

    if (
      product.variants === undefined ||
      product.variants === null ||
      product.variants?.length === 0
    )
      return productStepStatus;

    let deficiencyImage = false,
      deficiencyPrice = false,
      processedPrice = 0,
      processedImage = 0;
    product.variants.forEach((e: VariantResponse) => {
      if (e.variant_prices.find((e) => e.cost_price === null || e.retail_price === null)) {
        deficiencyPrice = true;
      } else {
        processedPrice += 1;
      }
      if (e.variant_images.length === 0) {
        deficiencyImage = true;
      } else {
        processedImage += 1;
      }
    });
    productStepStatus.Price = deficiencyPrice ? "wait" : "finish";
    productStepStatus.Image = deficiencyImage ? "wait" : "finish";
    productStepStatus.ProcessPrice = `Giá thành (${processedPrice}/${product.variants.length})`;
    productStepStatus.ProcessImage = `Ảnh mẫu (${processedImage}/${product.variants.length})`;

    console.log("productStepStatus", productStepStatus);

    return productStepStatus;
  }, [props.data]);

  return (
    <Steps size="small" progressDot={progressDot}>
      <Step
        status={objProductSteps.Material}
        title="Thuộc tính	"
        description={
          <div>
            <div>Sản phẩm đã đầy đủ thông tin</div>
            <div>chất liệu, mô tả.</div>
          </div>
        }
      />
      <Step
        status={objProductSteps.Price}
        title={objProductSteps.ProcessPrice}
        description={
          <div>
            <div>Sản phẩm đã đầy đủ giá bán,</div>
            <div>giá vốn.</div>
          </div>
        }
      />
      <Step
        status={objProductSteps.Image}
        title={objProductSteps.ProcessImage}
        description="Sản phẩm đã được cập nhật ảnh marketing."
      />
    </Steps>
  );
};

export default ProductSteps;
