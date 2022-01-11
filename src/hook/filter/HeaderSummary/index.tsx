import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import { formatCurrency } from "utils/AppUtils";
import { sortActionColor } from "utils/global-styles/variables";
import "./index.scss"

export const HeaderSummary = ( 
  total: number | undefined, 
  header: string,
  field: string,
  onSortASC?: (sortColumn: string)=> void,
  onSortDESC?: (sortColumn: string)=> void )=>{
    let SortComponent = () => <div className="block-sort">
                        <CaretUpOutlined style={{color: sortActionColor, fontSize: 12}} title="Sắp xếp tăng dần" size={5} onClick={()=>{onSortASC && onSortASC(field)}} />
                        <CaretDownOutlined style={{color: sortActionColor, fontSize: 12}} title="Sắp xếp giảm dần" size={10} onClick={()=>{onSortDESC && onSortDESC(field)}} />
                      </div>
    let Component = () => <div style={{display: "inline-flex"}}>{header} <SortComponent/></div>;
    if (total) { 
      Component = () => (
        <>
          <div style={{display: "inline-flex"}}>{header} <SortComponent/></div>
          <div>{`(${formatCurrency(total,".")})`}</div>
        </>
      );
    }
    return Component;
}
 
