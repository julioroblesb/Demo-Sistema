import {test} from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {emptyData} from '../../src/crm/domain.js';
import {createCompaniesExcel} from '../../src/crm/excel-export.js';

test('Excel conserva todas las empresas, contactos múltiples, ceros, tildes y notas como texto', async () => {
  const data = emptyData();
  data.companies = [{id:'one', name:'Alquiler Perú', ruc:'00123456789', phone:'+51 936 755 465', email:'ventas@example.com', city:'Lima', address:'Jirón Tarapacá 670', need:'Unir reportes', notes:'=SUM(1,2)\nSegunda línea', status:'nueva'}, {id:'archived', name:'Empresa archivada', archived:true, status:'contactada'}];
  data.contacts = [{id:'c1', company_id:'one', name:'María', phone:'01234567', email:'maria@example.com'}, {id:'c2', company_id:'one', name:'José', phone:'+51987654321', role:'Gerencia', decision_maker:true}];
  data.activities = [{id:'a1', company_id:'one', kind:'contacto', channels:['correo','whatsapp'], occurred_at:'2026-10-22T14:30:00Z', body:'Primer contacto'}];
  data.settings = [{id:'camp', category:'outreach_campaign', name:'Campaña Lima'}, {category:'outreach_delivery', company_id:'one', campaign_id:'camp', channel:'correo', recipient:'ventas@example.com', status:'sent', sent_at:'2026-10-22T14:30:00Z'}];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await createCompaniesExcel(data));
  const sheet = workbook.getWorksheet('Empresas');
  const value = (row, header) => sheet.getRow(row).getCell(sheet.getRow(1).values.indexOf(header));
  assert.equal(sheet.rowCount, 3);
  assert.equal(value(2,'RUC').value, '00123456789');
  assert.equal(value(2,'Teléfono').value, '+51 936 755 465');
  assert.equal(value(2,'Notas de investigación').value, '=SUM(1,2)\nSegunda línea');
  assert.equal(value(2,'Notas de investigación').type, ExcelJS.ValueType.String);
  assert.equal(value(2,'Personas de contacto').value, 'María\nJosé');
  assert.match(value(2,'Último contacto (Lima)').value, /09:30:00/);
  assert.equal(value(2,'Canales del último contacto').value, 'Correo, WhatsApp');
  assert.equal(value(3,'Archivada').value, 'Sí');
  assert.equal(workbook.getWorksheet('Contactos').rowCount, 3);
  assert.equal(workbook.getWorksheet('Contactos').getCell('D2').value, '01234567');
  assert.equal(workbook.getWorksheet('Envíos de campañas').getCell('B2').value, 'Campaña Lima');
  assert.equal(workbook.worksheets.length, 6);
  assert.equal(sheet.views[0].ySplit, 1);
});

test('Una base vacía genera un Excel válido con encabezados, sin datos inventados', async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await createCompaniesExcel(emptyData()));
  assert.equal(workbook.worksheets.length, 6);
  for (const sheet of workbook.worksheets) assert.equal(sheet.rowCount, 1);
});
