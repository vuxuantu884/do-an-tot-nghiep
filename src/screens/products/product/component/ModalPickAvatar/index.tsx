import { Checkbox, Col, Modal, Row } from "antd";
import variantdefault from "assets/icon/variantdefault.jpg";
import { VariantImage } from "model/product/product.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyledComponent } from "./style";

type ModalPickAvatarProps = {
  visible: boolean;
  variantImages: Array<VariantImage>;
  onCancel: () => void;
  onOk: (imageId: number, isReload?: boolean) => void;
};

const ModalPickAvatar: React.FC<ModalPickAvatarProps> = (props: ModalPickAvatarProps) => {
  const { visible, variantImages, onCancel, onOk } = props;
  const [selected, setSelected] = useState<number>(-1);

  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const onOkClick = useCallback(() => {
    onOk(selected, false);
  }, [onOk, selected]);

  const avatar = useMemo(() => {
    let index = variantImages.findIndex((item) => item.image_id === selected);
    return index === -1 ? "" : variantImages[index].url;
  }, [selected, variantImages]);

  useEffect(() => {
    if (visible) {
      variantImages.forEach((item, index) => {
        if (item.product_avatar) {
          setSelected(item.image_id);
        }
      });
    }
  }, [variantImages, visible]);

  return (
    <Modal
      onOk={onOkClick}
      onCancel={onCancelClick}
      title="Chọn ảnh đại diện"
      width={900}
      visible={visible}
    >
      <StyledComponent>
        <Row gutter={24}>
          <Col span={24} md={7}>
            <div className="avatar-show">
              {avatar ? <img src={avatar} alt="" /> : <img src={variantdefault} alt="" />}
            </div>
          </Col>
          <Col span={24} md={17}>
            <div className="avatar-list">
              {variantImages.map((item: VariantImage) => (
                <div
                  className="img-frame"
                  onClick={(e) => {
                    setSelected(item.image_id);
                  }}
                >
                  <img src={item.url} alt="" />
                  <Checkbox checked={item.image_id === selected} className="av-checkbox" />
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </StyledComponent>
    </Modal>
  );
};

export default ModalPickAvatar;
