import moment from 'moment';


export const convertUtcToLocalDate = (date?: Date | string | number) => {
  if(date!==undefined){
    let dateChange = moment.utc(date).format('DD/MM/YYYY HH:mm:ss');
    return dateChange;
  }
  return null;
  
}

export const convertDateToUtc = (date: Date | string | number) => {
  return moment(date).utc().format()
}