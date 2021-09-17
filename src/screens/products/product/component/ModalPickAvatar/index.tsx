import { Col, Modal, Row, Image, List, Checkbox } from "antd";
import { VariantImage } from "model/product/product.model";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyledComponent } from "./style";
import variantdefault from "assets/icon/variantdefault.jpg";

type ModalPickAvatarProps = {
  visible: boolean;
  variantImages: Array<VariantImage>;
  onCancel: () => void;
  onOk: (imageId: number) => void;
};

const ModalPickAvatar: React.FC<ModalPickAvatarProps> = (
  props: ModalPickAvatarProps
) => {
  const { visible, variantImages, onCancel, onOk } = props;
  const [selected, setSelected] = useState<number>(-1);

  const onCancelClick = useCallback(() => {
    onCancel();
  }, [onCancel]);
  const onOkClick = useCallback(() => {
    onOk(selected);
  }, [onOk, selected]);
  const avatar = useMemo(() => {
    let index  = variantImages.findIndex((item) => item.image_id === selected);
    return index === -1 ? "" : variantImages[index].url;
  }, [selected, variantImages])
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
              {selected === -1 ? (
                <img src={variantdefault} alt="" />
              ) : (
                <Image preview={false} src={avatar} />
              )}
            </div>
          </Col>
          <Col span={24} md={17}>
            <List
              locale={{
                emptyText: "Danh sách ảnh trống"
              }}
              className="avatar-list"
              grid={{ column: 4 }}
              dataSource={variantImages}
              renderItem={(item, index) => (
                <List.Item>
                  <Image preview={false} src={item.url} />
                  <Checkbox
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(item.image_id);
                      } else {
                        if (item.image_id === selected) {
                          setSelected(-1);
                        }
                      }
                    }}
                    checked={item.image_id === selected}
                    className="av-checkbox"
                  />
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </StyledComponent>
    </Modal>
  );
};

export default ModalPickAvatar;
