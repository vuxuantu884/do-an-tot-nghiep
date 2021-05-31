import { Button, Drawer, Row } from "antd";

type SupplierFilterProps = {
  visible: boolean,
  children: React.ReactNode
}

const BaseFilter: React.FC<SupplierFilterProps> = (props: SupplierFilterProps) => {
  const {visible, children} = props;
  return (
    <Drawer 
      placement="right"
      title="Thêm bộ lọc"
      width={396} 
      visible={visible} 
      footer={(
        <div className="filter-footer">
          <Row className="row-filter" >
            <Button className="btn-filter yody-search-button w-100">Lọc</Button>
          </Row>
          <Row className="row-filter">
            <Button className="btn-filter yody-filter-button w-100">Xóa bộ lọc</Button>
          </Row>
        </div>
      )}>
     {children}
    </Drawer>
  )
};

export default BaseFilter;