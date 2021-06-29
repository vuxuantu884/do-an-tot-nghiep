import { Modal, Button, Image, Upload, Tooltip, Checkbox } from "antd";
import { UploadOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { ReactElement } from "react";
import { UploadFile } from "antd/lib/upload/interface";
import noImage from "assets/img/no-image.png";
import { VariantRequestView } from "model/product/product.model";

type UploadImageModalProp = {
  visible: boolean;
  onCancle?: () => void;
  onSave?: () => void;
  variant?: VariantRequestView | null;
};

const { Dragger } = Upload;

const UploadImageModal: React.FC<UploadImageModalProp> = (
  props: UploadImageModalProp
) => {
  const { visible, onCancle, onSave, variant } = props;
  return (
    <Modal
      visible={visible}
      title="UPLOAD HÌNH ẢNH SẢN PHẨM"
      className="ant-modal-header-nostyle"
      width={950}
      onCancel={onCancle}
      footer={
        <div
          className="display-flex"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <i style={{ color: "#00000050" }}>
            Lưu ý: Các định dạng hình ảnh cho phép: .JPG, .JPEG, .PNG. Dung
            lượng không vượt quá 5MB.
          </i>
          <div>
            <Button onClick={onCancle}>Huỷ</Button>
            <Button type="primary">Lưu</Button>
          </div>
        </div>
      }
    >
      {variant && variant !== null && (
        <div className="upload-image">
          <div className="upload-image-left">
            <div className="upload-image-result">
              {false ? (
                <Image />
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
              multiple
              maxCount={6}
              className="upload-image-zone"
              listType="picture-card"
              itemRender={(
                originNode: ReactElement,
                file: UploadFile,
                fileList: object[],
                actions
              ) => (
                <>
                  <Image src={file.url} fallback={noImage} />
                  <Tooltip overlay="Xoá ảnh sản phẩm" placement="top">
                    <Button
                      className="upload-image-list-item-delete"
                      icon={<CloseCircleOutlined />}
                      onClick={() => actions.remove()}
                    />
                  </Tooltip>
                  <Tooltip overlay="Chọn làm ảnh đại diện" placement="top">
                    <Checkbox className="upload-image-list-item-checkbox" />
                  </Tooltip>
                </>
              )}
            >
              <UploadOutlined className="upload-image-zone-icon" />
              <div className="upload-image-zone-text">
                <span>Kéo và thả ảnh vào đây hoặc</span>
                <Button
                  type="primary"
                  className="upload-image-zone-btn ant-btn-secondary"
                >
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
