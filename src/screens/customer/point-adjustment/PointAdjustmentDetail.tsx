import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import NumberFormat from "react-number-format";
import { Card } from "antd";
import { ConvertUtcToLocalDate } from "utils/DateUtils";
import ContentContainer from "component/container/content.container";
import CustomTable, { ICustomTableColumType, } from "component/table/CustomTable";
import { getPointAdjustmentDetailAction } from "domain/actions/loyalty/loyalty.action";
import { StyledPointAdjustmentDetail } from 'screens/customer/point-adjustment/StyledPointAdjustment';


const TYPE_ADJUSTMENT = [
  {
    title: "Tặng điểm",
    value: "ADD"
  },
  {
    title: "Trừ điểm",
    value: "SUBTRACT"
  }
]

const pointInfoColumns: Array<ICustomTableColumType<any>> = [
  {
    title: "STT",
    align: "center",
    width: "70px",
    render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
  },
  {
    title: "Mã phiếu",
    dataIndex: "id",
    width: "10%",
    render: (value: string, item: any) => (
      <div>{value}</div>
    ),
  },
  {
    title: "Số KH",
    width: "6%",
    render: (value: any, item: any) => (
      <div style={{ textAlign: "right" }}>{value.customers?.length}</div>
    ),
  },
  {
    title: "Kiểu điều chỉnh",
    dataIndex: "type",
    width: "10%",
    align: "center",
    render: (value: any, item: any) => {
      const type = TYPE_ADJUSTMENT.find(type => type.value === value);
      return (
        <div>{type?.title}</div>
      )
    },
  },
  {
    title: "Giá trị",
    dataIndex: "point_change",
    width: "10%",
    align: "center",
    render: (value: any, item: any) => (
      <div style={{ textAlign: "right" }}>
        <NumberFormat
          value={value}
          displayType={"text"}
          thousandSeparator={true}
        />
      </div>
    ),
  },
  {
    title: "Lý do điều chỉnh",
    dataIndex: "reason",
    width: "15%"
  },
  {
    title: "Người điều chỉnh",
    dataIndex: "created_by",
    width: "15%"
  },
  {
    title: "Ngày điều chỉnh",
    dataIndex: "created_date",
    align: "center",
    width: "12%",
    render: (value: any, item: any) => (
      <div>{ConvertUtcToLocalDate(value, "HH:mm DD/MM/YYYY")}</div>
    ),
  },
  {
    title: "Ghi chú",
    dataIndex: "note",
  },
]

const customerListColumns: Array<ICustomTableColumType<any>> = [
  {
    title: "STT",
    visible: true,
    align: "center",
    width: "70px",
    render: (value: any, item: any, index: number) => <div>{index + 1}</div>,
  },
  {
    title: "Tên khách hàng",
    dataIndex: "customer",
  },
  {
    title: "Số điện thoại",
    dataIndex: "phone",
  },
];

const PointAdjustmentDetail = () => {
  const dispatch = useDispatch();
  const params: any = useParams();

  const [detailData, setDetailData] = useState<any>();
  const [customersData, setCustomersData] = useState<Array<any>>([]);


  useEffect(() => {
    const adjustmentId = params.id;
    if (adjustmentId) {
      dispatch(
        getPointAdjustmentDetailAction(adjustmentId, (data) => {
          if (data) {
            setCustomersData(data.customers);
            setDetailData([data]);
          }
        })
      );
    }
  }, [dispatch, params.id]);


  return (
    <StyledPointAdjustmentDetail>
      <ContentContainer
        title="Thông tin phiếu điều chỉnh"
      >
        <Card
          title="THÔNG TIN ĐIỀU CHỈNH"
        >
          <CustomTable
            bordered
            dataSource={detailData}
            columns={pointInfoColumns}
            pagination={false}
            rowKey={(item: any) => item.id}
          />
        </Card>

        <Card
          title="DANH SÁCH KHÁCH HÀNG ÁP DỤNG"
        >
          <CustomTable
            bordered
            sticky={{ offsetScroll: 10, offsetHeader: 55 }}
            dataSource={customersData}
            columns={customerListColumns}
            pagination={false}
            rowKey={(item: any) => item.id}
          />
        </Card>
      </ContentContainer>
    </StyledPointAdjustmentDetail>
  );
};

export default PointAdjustmentDetail;
