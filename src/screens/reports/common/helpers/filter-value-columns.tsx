export const filterValueColumns = (fullColumns: any[], displayColumns: any[]) => {
  return fullColumns.map((columnDetails: any) => {
    let children;
    if (columnDetails.children?.length) {
      children = [];
      columnDetails.children.forEach((child: any, index: number) => {
        if (child.children?.length) {
          children.push({
            ...child,
            children: child.children.filter((_: any, idx: number) => {
              return displayColumns.some((i) => i.visible && i.index === idx);
            }),
          });
        } else {
          if (displayColumns.some((i) => i.visible && i.index === index)) {
            children.push(child);
          }
        }
      });
    }
    return {
      ...columnDetails,
      children,
    };
  });
};
