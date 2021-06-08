import moment from 'moment';


export const formatDate = (date: Date | string | number) => {
  let dateChange = moment.utc(date).format('DD/MM/YYYY HH:mm:ss');
  return dateChange;
}