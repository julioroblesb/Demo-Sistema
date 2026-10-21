import {emailHtml,emailSubject,OUTREACH} from './templates.mjs';

export const ZOHO_DEFAULTS=Object.freeze({
  accountsUrl:'https://accounts.zoho.com/oauth/v2/token',
  apiUrl:'https://mail.zoho.com/api/accounts',
});
export function prepareZohoEmail(companyName,to){
  if(typeof to!=='string'||!/^\S+@\S+\.\S+$/.test(to.trim()))throw new Error('Registra un correo válido para esta empresa.');
  return {fromAddress:OUTREACH.senderEmail,toAddress:to.trim(),subject:emailSubject(companyName),content:emailHtml(companyName),mailFormat:'html'};
}
