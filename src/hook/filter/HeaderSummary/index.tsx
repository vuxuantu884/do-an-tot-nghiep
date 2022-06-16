import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { formatCurrency } from "utils/AppUtils";
import { sortActionColor } from "utils/global-styles/variables";
import "./index.scss";
let fieldActive = "";
let sortType="";

export const HeaderSummary = ( 
  total: number | undefined, 
  header: string,
  field: string,
  onSortASC?: (sortColumn: string)=> void,
  onSortDESC?: (sortColumn: string)=> void)=>{
    let SortComponent = () => <div className="block-sort">
                        <CaretUpOutlined className={(sortType ==="asc" && fieldActive=== field)? 'field-active':''} style={{color: sortActionColor, fontSize: 12}} title="Sắp xếp tăng dần" size={5} onClick={()=>{
                          fieldActive = `${field}`;
                          sortType = "asc";
                          onSortASC && onSortASC(field)
                          }} />
                        <CaretDownOutlined className={(sortType ==="desc" && fieldActive=== field)? 'field-active':''} style={{color: sortActionColor, fontSize: 12}} title="Sắp xếp giảm dần" size={10} onClick={()=>{
                          fieldActive = `${field}`;
                          sortType = "desc";
                          onSortDESC && onSortDESC(field)
                          }} />
                      </div>
    let Component = () => <div className={fieldActive=== field? 'field-active':''} style={{display: "inline-flex",wordBreak: "initial"}}>{header} <SortComponent/></div>;
    if (total) { 
      Component = () => (
        <>
          <div className={fieldActive=== field? 'field-active':''} style={{display: "inline-flex",wordBreak: "initial"}}>{header} <SortComponent/></div>
          <div>{`(${formatCurrency(total,".")})`}</div>
        </>
      );
    }
    return Component;
}
 
