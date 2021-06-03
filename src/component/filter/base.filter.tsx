import { Button, Drawer, Row } from "antd";

type BaseFilterProps = {
  visible: boolean,
  children: React.ReactNode
  onCancel?: () => void,
  onFilter?: () => void,
  onClearFilter?: () => void,
}

const BaseFilter: React.FC<BaseFilterProps> = (props: BaseFilterProps) => {
  const {visible, children, onFilter, onClearFilter, onCancel} = props;
  return (
    <Drawer 
      placement="right"
      title="Thêm bộ lọc"
      width={396}
      closable={false}
      onClose={onCancel}
      visible={visible} 
      footer={(
        <div className="filter-footer">
          <Row className="row-filter" >
            <Button onClick={onFilter} className="btn-filter yody-search-button w-100">Lọc</Button>
          </Row>
          <Row className="row-filter">
            <Button onClick={onClearFilter} className="btn-filter yody-filter-button w-100">Xóa bộ lọc</Button>
          </Row>
        </div>
      )}>
     {children}
    </Drawer>
  )
};

export default BaseFilter;