import { Spin, Upload } from "antd";
import uploadIcon from "assets/img/upload.svg";
import imgDefIcon from "assets/img/img-def.svg";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { productUploadAction } from "domain/actions/product/products.action";
import { ProductUploadModel } from "model/product/product-upload.model";
import { LoadingOutlined } from "@ant-design/icons";
import React from "react";
import { RcFile } from "antd/lib/upload";
import { beforeUploadImage } from "../helper";

type ColorUploadProps = {
  value?: number;
  url?: string | null;
  onChange?: (value: number) => void;
};

const ColorUpload: React.FC<ColorUploadProps> = (props: ColorUploadProps) => {
  const { onChange, url } = props;
  const dispatch = useDispatch();
  const [imageUrl, setImageUrl] = useState<string | null>(url ? url : null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onUpload = useCallback(
    (data: false | Array<ProductUploadModel>) => {
      setIsLoading(false);
      if (!!data && data.length > 0) {
        setImageUrl(data[0].path);
        onChange && onChange(data[0].id);
      }
    },
    [onChange],
  );

  const beforeUpload = useCallback((file: RcFile) => {
    beforeUploadImage(file, 5);
  }, []);

  return (
    <Upload
      customRequest={(options) => {
        let files: Array<File> = [];
        if (options.file instanceof File) {
          files.push(options.file);
        }
        if (files.length > 0) {
          setIsLoading(true);
          dispatch(productUploadAction(files, "color", onUpload));
        }
      }}
      beforeUpload={beforeUpload}
      listType="picture"
      maxCount={1}
      showUploadList={false}
      className="upload-v"
    >
      {imageUrl !== null && <img src={imageUrl} alt="" />}

      <div className="upload-view">
        {isLoading ? (
          <div>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          </div>
        ) : (
          <React.Fragment>
            <img className="img-upload" src={uploadIcon} alt="" />
            <img className="img-default" src={imgDefIcon} alt="" />
          </React.Fragment>
        )}
      </div>
    </Upload>
  );
};

export default ColorUpload;
