import {test, expect} from '@playwright/test';
import ExcelJS from 'exceljs';

for (const width of [1440, 390]) test(`Exportar Excel descarga todas las empresas aunque haya filtros o selección en ${width}px`, async ({page}) => {
  await page.setViewportSize({width, height:900});
  await page.goto('/SKYROTE13/');
  await page.getByRole('button', {name:'Explorar con datos de prueba'}).click();
  await expect(page.locator('.workspace')).toBeVisible();
  const total = await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('nexo-crm-demo-v1'));
    data.companies.push({id:'excel-archived', name:'Archivo Perú', ruc:'00123456789', phone:'+51 936 755 465', notes:'=SUM(1,2)', status:'nueva', archived:true, version:1});
    localStorage.setItem('nexo-crm-demo-v1', JSON.stringify(data));
    return data.companies.length;
  });
  await page.reload();
  await page.goto('/SKYROTE13/#empresas');
  await page.getByRole('checkbox', {name:'Seleccionar Andina Equipos', exact:true}).check();
  await page.getByRole('searchbox', {name:'Buscar empresas', exact:true}).fill('No coincide con ninguna empresa');
  await expect(page.locator('.company-table')).toHaveCount(0);
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', {name:'Exportar Excel', exact:true}).click();
  const file = await downloading;
  expect(file.suggestedFilename()).toMatch(/^Nexo-empresas-\d{4}-\d{2}-\d{2}\.xlsx$/);
  const chunks = [];
  for await (const chunk of await file.createReadStream()) chunks.push(chunk);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.concat(chunks));
  const sheet = workbook.getWorksheet('Empresas');
  expect(sheet.rowCount).toBe(total + 1);
  expect(sheet.getCell(`A${total + 1}`).value).toBe('Archivo Perú');
  expect(sheet.getCell(`B${total + 1}`).value).toBe('00123456789');
  expect(workbook.getWorksheet('Contactos')).toBeTruthy();
  await expect(page.getByRole('button', {name:'Exportar Excel', exact:true})).toBeEnabled();
});
