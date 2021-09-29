import { Button } from "antd";
import uploadIcon from "assets/img/upload.svg";
import imgDefIcon from "assets/img/img-def.svg";

type ImageProductProps = {
  onClick?: () => void;
  path?: string|null,
  isUpload?: boolean,
};

const ImageProduct: React.FC<ImageProductProps> = (
  props: ImageProductProps
) => {
  return (
    <Button onClick={props.onClick} className="product-image">
      {props.isUpload && <img className="product-image-upload" src={uploadIcon} alt="" /> }
      {(!props.path || props.path === null) && <img className="product-image-default" src={imgDefIcon} alt="" />}
      {
        props.path && props.path !== null  && (
          <img className="product-image-path" src={props.path} alt="" />
        )
      }
    </Button>
  );
};

export default ImageProduct;
