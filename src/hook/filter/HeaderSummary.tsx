import { formatCurrency } from "utils/AppUtils";

export const HeaderSummary = ( total: number | undefined, 
  header: string, )=>{
    let Component = () => <span>{header}</span>;
    if (total) { 
      Component = () => (
        <>
          <div>{header}</div>
          <div>{`(${formatCurrency(total,".")})`}</div>
        </>
      );
    }
    return Component;
}
 
