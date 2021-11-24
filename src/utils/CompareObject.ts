export const CompareObject = (objOne: any, objecTwo: any): boolean => {
  if (objOne === objecTwo) return true;

  if (!(objOne instanceof Object) || !(objecTwo instanceof Object)) return false;

  if (objOne.constructor !== objecTwo.constructor) return false;

  for (var p in objOne) {
    if (!objOne.hasOwnProperty(p)) continue;

    if (!objecTwo.hasOwnProperty(p)) continue;
    
    //compare property
    //if (!objecTwo.hasOwnProperty(p)) return false;

    if (objOne[p] === objecTwo[p]) continue;

    if (typeof objOne[p] !== "object") {
      return false
    };

    if (!CompareObject(objOne[p], objecTwo[p])) return false;
  }

  // for (p in objecTwo)
  //   if (objecTwo.hasOwnProperty(p) && !objOne.hasOwnProperty(p)) return false;

  return true;
};
