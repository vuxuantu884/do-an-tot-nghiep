export const formatData = (data: any[]) => {
  const groupLevel: any[] = [];
  data.forEach((item: any) => {
    groupLevel[item.level - 1] = groupLevel[item.level - 1] || [];
    groupLevel[item.level - 1].push(item);
  });
  for (let index = 5; index > 0; index--) {
    if (groupLevel[index]?.length) {
      groupLevel[index].forEach((childItem: any) => {
        groupLevel[index - 1].forEach((parentItem: any) => {
          if (childItem.parent === parentItem.key) {
            parentItem.children = parentItem.children || [];
            parentItem.children.push(childItem);
          }
        });
      });
    }
  }
  return groupLevel[0];
};
