
import { CloseOutlined, StarOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import { primaryColor } from "utils/global-styles/variables";

type FilterConfigProps = {
  id: number;
  index: number;
  name: string;
  tagAcitve: number;
  onSelectFilterConfig: (index: number, id: number) => void;
  setIsShowConfirmDelete: (isShow: boolean)=> void;
};
 

const FilterConfigCom: React.FC<FilterConfigProps> = (props: FilterConfigProps) => {
  return (
    <span className="" style={{marginRight: 20, display: "inline-flex"}}>
      <Tag onClick={(e)=>{
          props.onSelectFilterConfig(props.index, props.id);  
          }} style={{cursor: "pointer", backgroundColor: props.tagAcitve === props.index ? primaryColor: '',
                color: props.tagAcitve === props.index ? "white": ''}} key={props.index} icon={<StarOutlined />} 
                closeIcon={<CloseOutlined className={props.tagAcitve === props.index ? "ant-tag-close-icon" : "ant-tag-close-icon-black"} />} closable={true} onClose={(e)=>{
                  e.preventDefault();
                  props.setIsShowConfirmDelete(true);
                }}>
          {props.name}  
        </Tag>  
  </span>
  );
};

export default FilterConfigCom;
