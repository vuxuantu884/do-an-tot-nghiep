import { Modal, Button, Image, Upload, Tooltip, Checkbox, Spin } from "antd";
import { UploadOutlined, CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import noImage from "assets/img/no-image.png";
import { VariantImage } from "model/product/product.model";
import { showError } from "utils/ToastUtils";
import { useDispatch } from "react-redux";
import { productUploadAction } from "domain/actions/product/products.action";
import { ProductUploadModel } from "model/product/product-upload.model";
import { beforeUploadImage } from "../../helper";

export type VariantImageModel = {
  variant_id?: number;
  name: string;
  sku: string;
  variant_images: Array<VariantImage>;
}

type UploadImageModalProp = {
  visible: boolean;
  onCancel?: () => void;
  onSave?: (variant_images: Array<VariantImage>) => void;
  variant?: VariantImageModel | null;
};

const { Dragger } = Upload;

const UploadImageModal: React.FC<UploadImageModalProp> = (props: UploadImageModalProp) => {
  const dispatch = useDispatch();
  const { visible, onCancel, onSave, variant } = props;
  const [filedList, setFileList] = useState<Array<UploadFile>>([]);
  const [avatar, setAvatar] = useState<number>(-1);

  const handleBeforeUpload = useCallback((file: RcFile) => {
    beforeUploadImage(file, 5);
  }, []);

  const saveImage = useCallback(() => {
    if (onSave) {
      let newVariantImage = variant ? [...variant.variant_images] : [];
      variant?.variant_images.forEach((item, indexItem) => {
        let index = filedList.findIndex((file) => file.uid === item.image_id?.toString());
        if (index === -1) {
          newVariantImage.splice(indexItem, 1);
        }
      });

      filedList.forEach((file) => {
        let index = newVariantImage.findIndex((item) => file.uid === item.image_id?.toString());
        if (index === -1) {
          newVariantImage.push({
            variant_id: variant?.variant_id,
            url: file.url ? file.url : "",
            image_id: parseInt(file.name),
            position: null,
            product_avatar: false,
            variant_avatar: false,
          });
        }
      });

      newVariantImage.map((item, index) => {
        item.variant_avatar = avatar === index;
        return item;
      });

      onSave(newVariantImage);
    }
  }, [avatar, filedList, onSave, variant]);

  useEffect(() => {
    if (visible && variant) {
      let arr: Array<UploadFile> = [];
      if (variant.variant_images.length === 0) {
        setAvatar(-1);
        setFileList([]);
      } else {
        variant.variant_images.forEach((item, index) => {
          if (item.variant_avatar) {
            setAvatar(index);
          }
          arr.push({
            uid: item.image_id.toString(),
            name: item.image_id.toString(),
            url: item.url,
            status: "done",
          });
        });
        setFileList(arr);
      }
    }
  }, [variant, visible]);
  return (
    <Modal
      visible={visible}
      title="UPLOAD HÌNH ẢNH SẢN PHẨM"
      className="ant-modal-header-nostyle"
      width={950}
      onCancel={onCancel}
      footer={
        <div
          className="display-flex"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <i style={{ color: "#00000050" }}>
            Lưu ý: Các định dạng hình ảnh cho phép: .JPG, .JPEG, .PNG. Dung lượng không vượt quá
            5MB.
          </i>
          <div>
            <Button onClick={onCancel}>Huỷ</Button>
            <Button onClick={saveImage} type="primary">
              Lưu
            </Button>
          </div>
        </div>
      }
    >
      {variant && variant !== null && (
        <div className="upload-image">
          <div className="upload-image-left">
            <div className="upload-image-result">
              {avatar !== -1 && filedList[avatar] ? (
                <Image src={filedList[avatar].url} preview={false} />
              ) : (
                <div className="upload-image-result-noimg">
                  <img src={noImage} alt="Empty" width={180} />
                  <i className="margin-top-10" style={{ color: "#939393" }}>
                    Chưa có hình đại diện
                  </i>
                </div>
              )}
            </div>
          </div>
          <div className="upload-image-right">
            <div className="unpload-image-info">
              <b>{variant.name}</b>
              <p>{variant.sku}</p>
            </div>
            <Dragger
              accept=".jpg,.jpeg,.png,.jfif"
              multiple
              maxCount={6}
              className="upload-image-zone"
              listType="picture-card"
              fileList={filedList}
              onChange={(info) => {
                setFileList(info.fileList);
              }}
              customRequest={(options) => {
                let files: Array<File> = [];
                if (options.file instanceof File) {
                  let uuid = options.file.uid;
                  files.push(options.file);
                  dispatch(
                    productUploadAction(
                      files,
                      "variant",
                      (data: false | Array<ProductUploadModel>) => {
                        let index = filedList.findIndex((item) => item.uid === uuid);
                        if (!!data) {
                          if (index !== -1) {
                            filedList[index].status = "done";
                            filedList[index].url = data[0].path;
                            filedList[index].name = data[0].id.toString();
                            if (filedList.length > 0 && avatar === -1) {
                              setAvatar(0);
                            }
                          }
                        } else {
                          filedList.splice(index, 1);
                          showError("Upload ảnh không thành công");
                        }
                        setFileList([...filedList]);
                      },
                    ),
                  );
                }
              }}
              onRemove={(file) => {
                let index = filedList.findIndex((item) => item.uid === file.uid);
                let currentAvatarId: number = parseInt(avatar.toString());
                if (
                  currentAvatarId !== -1 &&
                  (filedList.length === 0 || filedList[avatar]?.uid === file.uid)
                ) {
                  currentAvatarId = -1;
                }
                if (index !== -1) {
                  filedList.splice(index, 1);
                }

                if (currentAvatarId === -1 && filedList.length > 0) {
                  currentAvatarId = 0;
                }

                setAvatar(currentAvatarId);

                setFileList([...filedList]);
              }}
              beforeUpload={handleBeforeUpload}
              itemRender={(
                originNode: ReactElement,
                file: UploadFile,
                fileList: UploadFile[],
                actions,
              ) => {
                let index = fileList.findIndex((item) => item.uid === file.uid);
                return (
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setAvatar(index);
                    }}
                  >
                    <Image
                      src={file.status === "uploading" ? file.thumbUrl : file.url}
                      preview={false}
                      fallback={noImage}
                    />
                    {file.status === "uploading" && (
                      <div className="upload-progress">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                      </div>
                    )}
                    <Tooltip overlay="Xoá ảnh sản phẩm" placement="top">
                      <Button
                        className="upload-image-list-item-delete"
                        icon={<CloseCircleOutlined />}
                        onClick={(e) => {
                          actions.remove();
                          e.stopPropagation();
                        }}
                      />
                    </Tooltip>
                    <Tooltip overlay="Chọn làm ảnh đại diện" placement="top">
                      <Checkbox
                        checked={fileList.findIndex((item) => item.uid === file.uid) === avatar}
                        className="upload-image-list-item-checkbox"
                      />
                    </Tooltip>
                  </div>
                );
              }}
            >
              <UploadOutlined className="upload-image-zone-icon" />
              <div className="upload-image-zone-text">
                <span>Kéo và thả ảnh vào đây hoặc</span>
                <Button type="primary" className="upload-image-zone-btn ant-btn-secondary">
                  Chọn ảnh
                </Button>
              </div>
            </Dragger>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default UploadImageModal;
