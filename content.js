console.log('Content script cargado');

function getUserInfo() {
  console.log('Intentando obtener información del usuario');
  let userInfo = {};
  
  // Intentar obtener el ID del usuario
  let userId = document.cookie.split(';').find(cookie => cookie.trim().startsWith('c_user='));
  if (userId) {
    userInfo.userId = userId.split('=')[1];
    console.log('ID de usuario encontrado:', userInfo.userId);
  }
  
  // Intentar obtener el nombre del usuario
  let nameElement = document.querySelector('[data-testid="fb-welcome-text"]');
  if (nameElement) {
    userInfo.name = nameElement.textContent;
    console.log('Nombre de usuario encontrado:', userInfo.name);
  }
  
  // Intentar obtener la URL de la foto de perfil
  let profilePicElement = document.querySelector('image[data-imgperflogname="profileCoverPhoto"]');
  if (profilePicElement) {
    userInfo.profilePicUrl = profilePicElement.getAttribute('xlink:href');
    console.log('URL de foto de perfil encontrada:', userInfo.profilePicUrl);
  }
  
  return userInfo;
}

function getEAABToken() {
  console.log('Intentando obtener token EAAB');
  try {
    let uid = /(?<=c_user=)(\d+)/.exec(document.cookie)?.[0];
    if (!uid) {
      console.error("No se encontró el uid en las cookies. ¿Has iniciado sesión?");
      return null;
    }
    
    let dtsg = require("DTSGInitialData").token || document.querySelector('[name="fb_dtsg"]').value;
    
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      let url = "//www.facebook.com/v1.0/dialog/oauth/confirm";
      let params =
        "fb_dtsg=" +
        dtsg +
        "&app_id=124024574287414&redirect_uri=fbconnect%3A%2F%2Fsuccess&display=page&access_token=&from_post=1&return_format=access_token&domain=&sso_device=ios&_CONFIRM=1&_user=" +
        uid;
      
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhr.onreadystatechange = function () {
        if (4 == xhr.readyState) {
          if (200 == xhr.status) {
            var a = xhr.responseText.match(/(?<=access_token=)(.*?)(?=\&)/);
            console.log('Respuesta completa:', xhr.responseText);
            if (a && a[0]) {
              console.log('Token obtenido:', a[0]);
              resolve(a[0]);
            } else {
              console.error("No se pudo obtener el token de acceso.");
              reject("No se pudo obtener el token de acceso.");
            }
          } else {
            console.error("Error en la solicitud:", xhr.status);
            reject("Error en la solicitud: " + xhr.status);
          }
        }
      };
      xhr.onerror = function () {
        console.error("Error de red al obtener el token de acceso.");
        reject("Error de red al obtener el token de acceso.");
      };
      xhr.send(params);
    });
  } catch (e) {
    console.error("ERROR:", e);
    return null;
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('Mensaje recibido en content script:', request);
    if (request.action === "getUserInfo") {
      let userInfo = getUserInfo();
      console.log('Información de usuario obtenida:', userInfo);
      sendResponse({userInfo: userInfo});
    } else if (request.action === "getEAABToken") {
      getEAABToken().then(token => {
        console.log('Token EAAB obtenido:', token);
        sendResponse({token: token});
      }).catch(error => {
        console.error('Error al obtener el token EAAB:', error);
        sendResponse({error: error});
      });
      return true;  // Indica que la respuesta se enviará de forma asíncrona
    } else if (request.action === "copyToClipboard") {
      // Copiar texto al portapapeles usando la API moderna
      navigator.clipboard.writeText(request.text).then(function() {
        console.log('Texto copiado al portapapeles');
        sendResponse({success: true});
      }).catch(function(err) {
        console.error('Error al copiar al portapapeles:', err);
        sendResponse({success: false, error: err.toString()});
      });
      return true;  // Indica que la respuesta se enviará de forma asíncrona
    } else if (request.action === "readFromClipboard") {
      // Leer texto del portapapeles usando la API moderna
      navigator.clipboard.readText().then(function(text) {
        console.log('Texto leído del portapapeles');
        sendResponse({text: text});
      }).catch(function(err) {
        console.error('Error al leer del portapapeles:', err);
        sendResponse({error: err.toString()});
      });
      return true;  // Indica que la respuesta se enviará de forma asíncrona
    }
  }
);
