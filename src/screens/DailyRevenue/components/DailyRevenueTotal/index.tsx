import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Image, Row, Tag, Upload } from "antd";
import { UploadFile } from "antd/es/upload/interface";
import { RcFile, UploadProps } from "antd/lib/upload";
import CustomTable, { ICustomTableColumType } from "component/table/CustomTable";
import {
  DaiLyRevenuePermissionModel,
  DailyRevenueDetailModel,
  DailyRevenuePaymentStatusModel,
  DailyRevenueVisibleCardElementModel,
  ShopRevenueModel,
} from "model/order/daily-revenue.model";
import { useCallback, useEffect, useState } from "react";
import { DailyRevenuePaymentMethods, dailyRevenueStatus } from "screens/DailyRevenue/helper";
import { formatCurrency } from "utils/AppUtils";
import { getArrayFromObject, renderFormatCurrency } from "utils/OrderUtils";
import { showWarning } from "utils/ToastUtils";
import { StyledComponent } from "./styles";

type Props = {
  title: string;
  dailyRevenueDetail?: DailyRevenueDetailModel;
  visibleCardElement: DailyRevenueVisibleCardElementModel;
  handleClickPayMoney: (fileList: UploadFile<any>[]) => void;
  handleClickConfirmPayMoney: () => void;
  permissions: DaiLyRevenuePermissionModel;
  shopRevenueModel: ShopRevenueModel | undefined;
};

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

function DailyRevenueTotal(props: Props) {
  const {
    title,
    dailyRevenueDetail,
    visibleCardElement,
    handleClickPayMoney,
    handleClickConfirmPayMoney,
    permissions,
    shopRevenueModel,
  } = props;

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const separator = ";";

  const dailyRevenuePaymentStatusArr: DailyRevenuePaymentStatusModel[] =
    getArrayFromObject(dailyRevenueStatus);

  const initFileList = dailyRevenueDetail?.image_url
    ? dailyRevenueDetail?.image_url.split(separator)
    : [];

  const items: ShopRevenueModel[] = shopRevenueModel ? [shopRevenueModel] : [];

  const calculateTotal = (startNumber: number, otherPaymentType: string) => {
    let result = startNumber;
    dailyRevenueDetail?.other_payments.forEach((single) => {
      if (single?.method === otherPaymentType && single.payment > 0) {
        result = result + single.payment;
      }
    });
    return result;
  };

  /**
   * Phương thức quẹt thẻ có card, mPos và sPos
   */
  const calculateCardTotal = (startNumber: number) => {
    const cardArr = [
      DailyRevenuePaymentMethods.mpos_payment.value,
      DailyRevenuePaymentMethods.spos_payment.value,
      DailyRevenuePaymentMethods.card_payment.value,
    ] as string[];
    let result = startNumber;
    dailyRevenueDetail?.other_payments.forEach((single) => {
      if (single?.method && cardArr.includes(single.method) && single.payment > 0) {
        result = result + single.payment;
      }
    });
    return result;
  };

  const calculateCashTotal = () => {
    let result = shopRevenueModel?.cash_payments || 0;
    dailyRevenueDetail?.other_payments.forEach((single) => {
      if (single?.method === DailyRevenuePaymentMethods.cash_payment.value) {
        result = result + single.payment;
      }
    });
    result = result - (dailyRevenueDetail?.total_cost || 0);
    return result;
  };

  const calculateOtherTotal = () => {
    let result = shopRevenueModel?.unknown_payments || 0;
    return result;
  };

  /**
   * Tổng doanh thu + Tổng phụ thu - Tổng chi phí
   */
  const calculateTotalAmount = () => {
    const totalShopRevenueAmount = shopRevenueModel ? shopRevenueModel.total_revenue : 0;
    const totalOtherPayment = dailyRevenueDetail?.other_payment || 0;
    const totalOtherCost = dailyRevenueDetail?.other_cost || 0;
    let result = totalShopRevenueAmount + totalOtherPayment - totalOtherCost;
    return result;
  };

  const columnFinal: Array<ICustomTableColumType<ShopRevenueModel>> = [
    {
      title: "Tiền mặt",
      dataIndex: "cash_payments",
      key: "cash_payments",
      render: (value: string) => {
        const result = calculateCashTotal();
        return <span className="noWrap">{formatCurrency(result)}</span>;
      },
      visible: true,
      align: "right",
    },
    {
      title: "QR VNpay",
      dataIndex: "vnpay_payments",
      key: "vnpay_payments",
      render: (value: string) => {
        const result = calculateTotal(
          shopRevenueModel?.vnpay_payments || 0,
          DailyRevenuePaymentMethods.vnpay_payment.value,
        );
        return <span className="noWrap">{formatCurrency(result)}</span>;
      },
      visible: true,
      align: "right",
    },
    {
      title: "QR Momo",
      dataIndex: "momo_payments",
      key: "momo_payments",
      render: (value: string) => {
        const result = calculateTotal(
          shopRevenueModel?.momo_payments || 0,
          DailyRevenuePaymentMethods.momo_payment.value,
        );
        return <span className="noWrap">{formatCurrency(result)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: "QR VCB",
      dataIndex: "vcb_payments",
      key: "vcb_payments",
      render: (value: string) => {
        const result = calculateTotal(
          shopRevenueModel?.vcb_payments || 0,
          DailyRevenuePaymentMethods.vcb_payment.value,
        );
        return <span className="noWrap">{formatCurrency(result)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: "Chuyển khoản",
      dataIndex: "transfer_payments",
      key: "transfer_payments",
      render: (value: string) => {
        const result = calculateTotal(
          shopRevenueModel?.transfer_payments || 0,
          DailyRevenuePaymentMethods.transfer_payment.value,
        );
        return <span className="noWrap">{formatCurrency(result)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },

    {
      title: "Quẹt thẻ",
      dataIndex: "card_payments",
      key: "card_payments",
      render: (value: string) => {
        const result = calculateCardTotal(shopRevenueModel?.card_payments || 0);
        return <span className="noWrap">{formatCurrency(result)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
    {
      title: "Thanh toán khác",
      dataIndex: "unknown_payments",
      key: "unknown_payments",
      render: (value: string) => {
        const result = calculateOtherTotal();
        return <span className="noWrap">{formatCurrency(result)}</span>;
      },
      visible: true,
      align: "right",
      // width: "25%",
    },
  ];

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
        <div>
          <CustomTable
            showColumnSetting={false}
            dataSource={items}
            columns={columnFinal.filter((column) => column.visible)}
            pagination={false}
            rowKey={(item: ShopRevenueModel) => item.card_payments}
          />
          <div className="totalRow">
            {" "}
            <span className="title">Tổng:</span> {formatCurrency(calculateTotalAmount())}
          </div>
        </div>
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
