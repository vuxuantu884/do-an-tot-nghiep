import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Image, Row, Tag, Upload } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import { RcFile, UploadProps } from "antd/lib/upload";
import {
  DailyRevenueDetailModel,
  DailyRevenuePaymentStatusModel,
  DaiLyRevenuePermissionModel,
  DailyRevenueVisibleCardElementModel,
} from "model/order/daily-revenue.model";
import React, { useCallback, useEffect, useState } from "react";
import { dailyRevenueStatus } from "screens/DailyRevenue/helper";
import { getArrayFromObject, renderFormatCurrency } from "utils/OrderUtils";
import { showWarning } from "utils/ToastUtils";
import costIcon from "./../../images/costIcon.svg";
import revenueIcon from "./../../images/revenueIcon.svg";
import surchargeIcon from "./../../images/surchargeIcon.svg";
import { StyledComponent } from "./styles";

type PropTypes = {
  title: string;
  dailyRevenueDetail?: DailyRevenueDetailModel;
  visibleCardElement: DailyRevenueVisibleCardElementModel;
  handleClickPayMoney: (fileList: UploadFile<any>[]) => void;
  handleClickConfirmPayMoney: () => void;
  permissions: DaiLyRevenuePermissionModel;
};

enum MinusOrPlusType {
  minus = "minus",
  plus = "plus",
}

type ElementType = {
  title: string;
  iconUrl: string;
  value?: number;
  type: MinusOrPlusType;
};

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function DailyRevenueTotal(props: PropTypes) {
  const {
    title,
    dailyRevenueDetail,
    visibleCardElement,
    handleClickPayMoney,
    handleClickConfirmPayMoney,
    permissions,
  } = props;

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  console.log("fileList", fileList);

  const separator = ";";

  const initFileList = dailyRevenueDetail?.image_url
    ? dailyRevenueDetail?.image_url.split(separator)
    : [];

  const elementArr: ElementType[] = [
    {
      title: "Tổng tiền mặt",
      iconUrl: revenueIcon,
      value: dailyRevenueDetail?.cash_payment,
      type: MinusOrPlusType.plus,
    },
    {
      title: "Tổng phụ thu",
      iconUrl: surchargeIcon,
      value: dailyRevenueDetail?.other_payment,
      type: MinusOrPlusType.plus,
    },
    {
      title: "Tổng chi phí",
      iconUrl: costIcon,
      value: dailyRevenueDetail?.other_cost,
      type: MinusOrPlusType.minus,
    },
  ];

  const dailyRevenuePaymentStatusArr: DailyRevenuePaymentStatusModel[] =
    getArrayFromObject(dailyRevenueStatus);

  const renderMinusOrPlus = (single: ElementType, index: number) => {
    if (index === 0 && single.type === MinusOrPlusType.plus) {
      return null;
    }
    return <div className="separator">{single.type === MinusOrPlusType.plus ? "+" : "-"}</div>;
  };

  const renderSingleElement = (single: ElementType) => {
    return (
      <div className="singleElement">
        <div className="singleElement__img">
          <img src={single.iconUrl} alt="" />
        </div>
        <div className="singleElement__content">
          <h4 className="title">{single.title}</h4>
          <div className="amount">
            <strong>{renderFormatCurrency(single.value)}</strong>
          </div>
        </div>
      </div>
    );
  };

  const getTagPaymentStatusClassName = (status: string | undefined) => {
    if (!status) {
      return "";
    }
    const getClassName = {
      [dailyRevenueStatus.paying.value]: "warning",
      [dailyRevenueStatus.paid.value]: "warning",
      [dailyRevenueStatus.finished.value]: "success",
      default: "",
    };
    return getClassName[status] || getClassName.default;
  };

  const renderPaymentStatusText = () => {
    if (!dailyRevenueDetail) {
      return "";
    }
    return (
      dailyRevenuePaymentStatusArr?.find((status) => status.value === dailyRevenueDetail?.state)
        ?.title || ""
    );
  };

  const renderSectionPayMoney = () => {
    if (
      visibleCardElement.totalRevenueCard.payMoneyButton ||
      visibleCardElement.totalRevenueCard.confirmMoneyButton
    ) {
      return (
        <div className="sectionPayMoney__buttons">
          {visibleCardElement.totalRevenueCard.payMoneyButton &&
            permissions.allowDailyPaymentsSubmit && (
              <Button type="primary" onClick={() => handleClickPayMoney(fileList)}>
                {dailyRevenueDetail?.state === dailyRevenueStatus.paid.value
                  ? "Cập nhật"
                  : "Nộp tiền"}
              </Button>
            )}
          {visibleCardElement.totalRevenueCard.confirmMoneyButton &&
            permissions.allowDailyPaymentsConfirm && (
              <Button
                type="primary"
                onClick={() => {
                  handleClickConfirmPayMoney();
                }}
              >
                Xác nhận nộp tiền
              </Button>
            )}
        </div>
      );
    }
  };

  const beforeUpload = useCallback((file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      showWarning("Vui lòng chọn đúng định dạng file JPG, PNG");
      return Upload.LIST_IGNORE;
    }
    const isSmallThan5M = file.size / 1024 / 1024 < 5;
    if (!isSmallThan5M) {
      showWarning("Cần chọn ảnh nhỏ hơn 5mb");
      return Upload.LIST_IGNORE;
    }
    return false;
  }, []);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    newFileList.forEach(async (file) => {
      if (!file.url) {
        file.url = await getBase64(file.originFileObj as RcFile);
      }
    });
    setFileList(newFileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  useEffect(() => {
    setFileList([]);
  }, [dailyRevenueDetail]);

  return (
    <StyledComponent>
      <Card title={title}>
        <Row gutter={30} className="dailyRevenueTotal__calculator">
          <Col span={6}>
            <div className="totalWrapper">
              <h4 className="title">Tổng phải nộp</h4>
              <div className="amount">
                <strong>{renderFormatCurrency(dailyRevenueDetail?.amount)}</strong>
              </div>
              <div className="separator">=</div>
            </div>
          </Col>
          {elementArr.map((single, index) => {
            return (
              <React.Fragment key={index}>
                <Col span={6} className="singleElement__wrapper">
                  {renderMinusOrPlus(single, index)}
                  {renderSingleElement(single)}
                </Col>
              </React.Fragment>
            );
          })}
        </Row>
        {visibleCardElement.totalRevenueCard.result && (
          <div className="sectionPayResult">
            <Row gutter={30}>
              <Col span={12}>
                <div className="sectionPayResult__left">
                  <div className="sectionPayResult__title">
                    <h3>Thanh toán</h3>
                    <Tag className={getTagPaymentStatusClassName(dailyRevenueDetail?.state)}>
                      {renderPaymentStatusText()}
                    </Tag>
                  </div>
                  <div className="sectionPayResult__detail">
                    <div className="sectionPayResult__single">
                      <h4 className="sectionPayResult__label">Kế toán xác nhận:</h4>
                      <span className="sectionPayResult__value">
                        {renderFormatCurrency(dailyRevenueDetail?.net_payment)}
                      </span>
                    </div>
                    <div className="sectionPayResult__single">
                      <h4 className="sectionPayResult__label">Còn phải nộp:</h4>
                      <span
                        className={`sectionPayResult__value ${
                          (dailyRevenueDetail?.remaining_amount || 0) > 0
                            ? "dangerColor"
                            : "successColor"
                        }`}
                      >
                        {renderFormatCurrency(dailyRevenueDetail?.remaining_amount)}
                      </span>
                    </div>
                    {dailyRevenueDetail?.image_url && (
                      <div className="sectionPayResult__single">
                        <h4 className="sectionPayResult__label">Hình ảnh:</h4>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="gallery">
                  {initFileList.map((file) => {
                    return (
                      <div className="single ">
                        <div className="inner">
                          <Image src={file} />
                        </div>
                      </div>
                    );
                  })}
                  <div className="single">
                    <Form.Item
                      name="uploadFile33"
                      rules={[
                        () => ({
                          validator(_, value) {
                            console.log("value", value);
                            if (value && value?.file && value?.fileList?.length > 0) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error(`Vui lòng chọn ảnh nếu cập nhật!`));
                          },
                        }),
                      ]}
                      hidden={dailyRevenueDetail?.state !== dailyRevenueStatus.paid.value}
                    >
                      <Upload
                        maxCount={1}
                        accept=".jpg,.jpeg,.png"
                        beforeUpload={beforeUpload}
                        listType="picture-card"
                        // itemRender={(originNode, file, currFileList) => <Image src={file.url} />}
                        onChange={handleChange}
                        onPreview={handlePreview}
                        fileList={fileList}
                      >
                        {fileList.length >= 1 ? null : uploadButton}
                      </Upload>
                    </Form.Item>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {visibleCardElement.totalRevenueCard.uploadPayment && permissions.allowDailyPaymentsSubmit && (
          <div className="sectionUploadPayment">
            <Row gutter={30}>
              <Col span={12}>
                <div className="abc">
                  <Form.Item
                    label="Hóa đơn chứng từ"
                    name="uploadFile"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Vui lòng chọn ảnh!",
                    //   },
                    // ]}
                    rules={[
                      () => ({
                        validator(_, value) {
                          console.log("value", value);
                          if (value && value?.file && value?.fileList?.length > 0) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error(`Vui lòng chọn ảnh!`));
                        },
                      }),
                    ]}
                  >
                    <Upload
                      maxCount={1}
                      accept=".jpg,.jpeg,.png"
                      beforeUpload={beforeUpload}
                      listType="picture-card"
                      // itemRender={(originNode, file, currFileList) => <Image src={file.url} />}
                      onChange={handleChange}
                      onPreview={handlePreview}
                      fileList={fileList}
                    >
                      {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                  </Form.Item>
                </div>
              </Col>
            </Row>
          </div>
        )}
        {renderSectionPayMoney()}
        <Image
          src={previewImage}
          hidden
          preview={{
            visible: previewOpen,
            src: previewImage,
            onVisibleChange: (value) => {
              setPreviewOpen(value);
            },
          }}
        />
      </Card>
    </StyledComponent>
  );
}

export default DailyRevenueTotal;
