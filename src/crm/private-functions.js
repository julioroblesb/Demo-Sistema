// A failed request is not evidence that the provider has been disconnected.
export async function invokePrivate(client, name, input) {
  const {data, error} = await client.functions.invoke(name, {body: input});
  if (!error && !data?.error) return data;
  let problem = data;
  if (error) {
    try { problem = await error.context?.clone().json(); } catch {}
  }
  let code = problem?.error?.code;
  let message = problem?.error?.message;
  const status = error?.context?.status;
  if (!message) {
    if (status === 401) {
      code = 'UNAUTHENTICATED';
      message = 'Tu sesión del CRM venció. Vuelve a iniciar sesión en este dispositivo.';
    } else if (status === 403) {
      code = 'FUNCTION_ACCESS_DENIED';
      message = 'No se autorizó el acceso al servicio de envíos. Abre https://nexoamedida.com/SKYROTE13/ e inicia sesión con tu cuenta personal.';
    } else if (status === 404) {
      code = 'FUNCTION_NOT_DEPLOYED';
      message = 'No se encontró la función de envíos. Revisa Envíos → Actualizar conexión.';
    } else if (status === 429) {
      code = 'FUNCTION_RATE_LIMITED';
      message = 'El servicio de envíos está limitando las solicitudes. Espera unos minutos.';
    } else if (status >= 500) {
      code = 'FUNCTION_SERVER_ERROR';
      message = 'El servicio de envíos no respondió correctamente. La vinculación con Zoho o WhatsApp no se pudo comprobar.';
    } else {
      code = 'FUNCTION_CONNECTION_FAILED';
      message = 'No se pudo conectar con el servicio de envíos. Revisa internet y vuelve a comprobar la conexión; esto no indica que Zoho o WhatsApp se hayan desvinculado.';
    }
    if (['send', 'submit', 'campaign-create', 'campaign-tick'].includes(input.action)) {
      message += ' Revisa el historial y las campañas antes de repetir el envío.';
    }
  }
  throw Object.assign(new Error(message), {code: code || 'FUNCTION_ERROR'});
}
