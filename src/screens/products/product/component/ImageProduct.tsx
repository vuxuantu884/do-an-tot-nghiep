import { Button } from "antd";
import uploadIcon from "assets/img/upload.svg";
import imgDefIcon from "assets/img/img-def.svg";
import React from "react";

type ImageProductProps = {
  onClick?: () => void;
  path?: string | null;
  isUpload?: boolean;
  isDisabled?: boolean;
};

const ImageProduct: React.FC<ImageProductProps> = (props: ImageProductProps) => {
  const { onClick, path, isDisabled, isUpload } = props;

  return (
    <Button disabled={isDisabled} onClick={onClick} className="product-image">
      {isUpload && <img className="product-image-upload" src={uploadIcon} alt="" />}
      {(!path || path === null) && (
        <img className="product-image-default" src={imgDefIcon} alt="" />
      )}
      {path && path !== null && (
        <img className="product-image-path" src={path} alt="" />
      )}
    </Button>
  );
};

export default ImageProduct;
