import { Col, Row } from "antd"; 

type ImportConfig ={
    link_template: string|undefined
}

const WarningImport: React.FC<ImportConfig> = (props: ImportConfig) => {
  return (
    <Row gutter={12}>
    <Col span={3}>Chú ý:</Col>
    <Col span={19}>
      <p>- Kiểm tra đúng loại phương thức khuyến mại khi xuất nhập file</p>
      <p>- Chuyển đổi file dưới dạng .XSLX trước khi tải dữ liệu</p>
      <p>
        - Tải file mẫu <a href={props.link_template}>tại đây</a>
      </p>
      <p>- File nhập có dụng lượng tối đa là 2MB và 2000 bản ghi</p>
      <p>
        - Với file có nhiều bản ghi, hệ thống cần mất thời gian xử lý từ 3 đến 5
        phút. Trong lúc hệ thống xử lý không F5 hoặc tắt cửa sổ trình duyệt.
      </p>
    </Col>
  </Row>
  );
};

export default WarningImport;
