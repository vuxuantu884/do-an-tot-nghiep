import moment from 'moment';

export const DATE_FORMAT = {
  DDMMYYY:"DD/MM/YYYY"
}

export const convertUtcToLocalDate = (date?: Date | string | number,format?:string) => {
  if(date!==undefined){
    let localDate = moment.utc(date).toDate();
    let dateFormat=moment(localDate).format(format?format:"DD/MM/YYYY HH:mm:ss");
    return dateFormat;
  }
  return '';  
}

export const convertDateToUtc = (date: Date | string | number) => {
  return moment(date).utc().format()
}