import { Button } from "antd";
import uploadIcon from "assets/img/upload.svg";
import imgDefIcon from "assets/img/img-def.svg";

type ImageProductProps = {
  onClick?: () => void;
  path?: string|null,
};

const ImageProduct: React.FC<ImageProductProps> = (
  props: ImageProductProps
) => {
  return (
    <Button onClick={props.onClick} className="prodcut-image">
      <img className="prodcut-image-upload" src={uploadIcon} alt="" />
      {(!props.path || props.path === null) && <img className="prodcut-image-default" src={imgDefIcon} alt="" />}
      {
        props.path && props.path !== null  && (
          <img className="prodcut-image-path" src={props.path} alt="" />
        )
      }
    </Button>
  );
};

export default ImageProduct;
