import {Modal, Button, Image, Upload, Tooltip, Checkbox, Spin} from 'antd';
import {
  UploadOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {ReactElement, useCallback, useEffect, useState} from 'react';
import {RcFile, UploadFile} from 'antd/lib/upload/interface';
import noImage from 'assets/img/no-image.png';
import {VariantImage} from 'model/product/product.model';
import {showError, showWarning} from 'utils/ToastUtils';
import {useDispatch} from 'react-redux';
import {productUploadAction} from 'domain/actions/product/products.action';
import {ProductUploadModel} from 'model/product/product-upload.model';

export interface VariantImageModel {
  variant_id?: number;
  name: string;
  sku: string;
  variant_images: Array<VariantImage>;
}

type UploadImageModalProp = {
  visible: boolean;
  onCancle?: () => void;
  onSave?: (variant_images: Array<VariantImage>) => void;
  variant?: VariantImageModel | null;
};

const {Dragger} = Upload;

interface AvatarFile {
  id: string;
  avatar: string;
}

const UploadImageModal: React.FC<UploadImageModalProp> = (
  props: UploadImageModalProp
) => {
  const dispatch = useDispatch();
  const {visible, onCancle, onSave, variant} = props;
  const [filedList, setFileList] = useState<Array<UploadFile>>([]);
  const [avatar, setAvatar] = useState<AvatarFile | null>(null);
  const beforeUpload = useCallback((file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      showWarning('Vui lòng chọn đúng định dạng file JPG, PNG');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      showWarning('Cần chọn ảnh nhỏ hơn 5mb');
    }
    return isJpgOrPng && isLt2M;
  }, []);
  const onClickSave = useCallback(() => {
    if (onSave) {
      let newVariantImage = variant ? [...variant.variant_images] : [];
      variant?.variant_images.forEach((item, indexItem) => {
        let index = filedList.findIndex(
          (file) => file.uid === item.id?.toString()
        );
        if (index === -1) {
          newVariantImage.splice(indexItem, 1);
        }
      });
      filedList.forEach((file) => {
        let index = newVariantImage.findIndex(
          (item) => file.uid === item.id?.toString()
        );
        if (index === -1) {
          newVariantImage.push({
            variant_id: variant?.variant_id,
            url: file.url ? file.url : '',
            image_id: parseInt(file.name),
            position: null,
            product_avatar: false,
            variant_avatar: avatar === null ? false : avatar.id === file.uid,
          });
        }
      });
      onSave(newVariantImage);
    }
  }, [avatar, filedList, onSave, variant]);
  useEffect(() => {
    if (visible && variant) {
      let arr: Array<UploadFile> = [];
      if (variant.variant_images.length === 0) {
        setAvatar(null);
        setFileList([]);
      } else {
        variant.variant_images.forEach((item, index) => {
          if (item.variant_avatar) {
            setAvatar({
              id: index.toString(),
              avatar: item.url,
            });
          }
          arr.push({
            uid: index.toString(),
            name: item.image_id.toString(),
            url: item.url,
            status: 'done',
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
      onCancel={onCancle}
      footer={
        <div
          className="display-flex"
          style={{justifyContent: 'space-between', alignItems: 'center'}}
        >
          <i style={{color: '#00000050'}}>
            Lưu ý: Các định dạng hình ảnh cho phép: .JPG, .JPEG, .PNG. Dung
            lượng không vượt quá 5MB.
          </i>
          <div>
            <Button onClick={onCancle}>Huỷ</Button>
            <Button onClick={onClickSave} type="primary">
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
              {avatar !== null ? (
                <Image src={avatar.avatar} preview={false} />
              ) : (
                <div className="upload-image-result-noimg">
                  <img src={noImage} alt="Empty" width={180} />
                  <i className="margin-top-10" style={{color: '#939393'}}>
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
              fileList={filedList}
              onChange={(info) => {
                setFileList(info.fileList);
              }}
              customRequest={(options) => {
                console.log(options);
                let files: Array<File> = [];
                if (options.file instanceof File) {
                  let uuid = options.file.uid;
                  files.push(options.file);
                  dispatch(
                    productUploadAction(
                      files,
                      'variant',
                      (data: false | Array<ProductUploadModel>) => {
                        let index = filedList.findIndex(
                          (item) => item.uid === uuid
                        );
                        if (!!data) {
                          if (index !== -1) {
                            filedList[index].status = 'done';
                            filedList[index].url = data[0].path;
                            filedList[index].name = data[0].id.toString();
                          }
                        } else {
                          filedList.splice(index, 1);
                          showError('Upload ảnh không thành công');
                        }
                        setFileList([...filedList]);
                      }
                    )
                  );
                }
              }}
              onRemove={(file) => {
                let index = filedList.findIndex(
                  (item) => item.uid === file.uid
                );
                if (index !== -1) {
                  filedList.splice(index, 1);
                }
                if (avatar?.id === file.uid) {
                  setAvatar(null);
                }
                setFileList([...filedList]);
              }}
              beforeUpload={beforeUpload}
              itemRender={(
                originNode: ReactElement,
                file: UploadFile,
                fileList: object[],
                actions
              ) => (
                <>
                  <Image
                    src={file.status === 'uploading' ? file.thumbUrl : file.url}
                    preview={file.status === 'done'}
                    fallback={noImage}
                  />
                  {file.status === 'uploading' && (
                    <div className="upload-progress">
                      <Spin
                        indicator={
                          <LoadingOutlined style={{fontSize: 24}} spin />
                        }
                      />
                    </div>
                  )}
                  <Tooltip overlay="Xoá ảnh sản phẩm" placement="top">
                    <Button
                      className="upload-image-list-item-delete"
                      icon={<CloseCircleOutlined />}
                      onClick={() => actions.remove()}
                    />
                  </Tooltip>
                  <Tooltip overlay="Chọn làm ảnh đại diện" placement="top">
                    <Checkbox
                      checked={file.uid === avatar?.id}
                      onChange={() => {
                        setAvatar({
                          id: file.uid,
                          avatar: file.url ? file.url : '',
                        });
                      }}
                      className="upload-image-list-item-checkbox"
                    />
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
