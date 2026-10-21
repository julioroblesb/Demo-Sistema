@echo off
setlocal
cd /d "%~dp0"
echo Actualizar correo, WhatsApp y cola de campanas de Nexo
echo.
where npx.cmd >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js LTS desde https://nodejs.org y vuelve a abrir este archivo.
  pause
  exit /b 1
)
if not exist "supabase\config.toml" (
  echo Primero extrae TODO el ZIP en una carpeta. Despues abre Actualizar-Nexo.cmd.
  pause
  exit /b 1
)
echo Autoriza el acceso a tu proyecto en el navegador que abrira Supabase.
call npx.cmd --yes supabase@2.121.0 login
if errorlevel 1 goto failed
call npx.cmd --yes supabase@2.121.0 functions deploy crm-email crm-whatsapp --project-ref hwilhpcermjxsaplando --use-api --no-verify-jwt
if errorlevel 1 goto failed
echo.
echo Supabase confirmo el despliegue de las dos funciones.
echo Los secretos existentes se conservan. No se han ejecutado migraciones SQL.
echo Vuelve a Nexo, recarga y crea tu campana.
pause
exit /b 0
:failed
echo.
echo La actualizacion no se ha confirmado. Revisa el error anterior.
echo No cambies ni vuelvas a compartir tus secretos.
pause
exit /b 1
