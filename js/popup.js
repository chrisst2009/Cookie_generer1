/** @type {Array} */
var _0x51f9 = ["error", "runtime", "paste", "addEventListener", "DOMContentLoaded", "getElementById", "click", "toast-bottom-right", "sendMessage", "copy", "success"];
(function(ql, opt_attributes) {
  /**
   * @param {number} object
   * @return {undefined}
   */
  var getEnumerableProperties = function(object) {
    for (;--object;) {
      ql.push(ql.shift());
    }
  };
  getEnumerableProperties(++opt_attributes);
})(_0x51f9, 293);
/**
 * @param {number} key
 * @param {?} dataAndEvents
 * @return {?}
 */
var _0x17f2 = function(key, dataAndEvents) {
  /** @type {number} */
  key = key - 0;
  var label = _0x51f9[key];
  return label;
};
toastr.options = {
  "debug" : false,
  "positionClass" : "toast-bottom-right",
  "onclick" : null,
  "fadeIn" : 300,
  "fadeOut" : 1E3,
  "timeOut" : 5E3,
  "extendedTimeOut" : 1E3
};
/**
 * @param {?} inSender
 * @return {undefined}
 */
function copyClick(inSender) {
  chrome.runtime.sendMessage({
    "click" : "copy"
  }, function(e) {
    if (e.success) {
      toastr.success(e.success);
    } else {
      toastr.error(e.error);
    }
  });
}
/**
 * @param {?} dataAndEvents
 * @return {undefined}
 */
function pasteClick(dataAndEvents) {
  chrome.runtime.sendMessage({
    "click" : "paste"
  }, function(dataAndEvents) {
  });
}
document.addEventListener("DOMContentLoaded", function() {
  console.log('Popup cargado');
  document.getElementById("copy")["addEventListener"]("click", copyClick);
  document.getElementById("paste").addEventListener("click", pasteClick);

  // Agregar funcionalidad 2FA
  document.getElementById('get-2fa').addEventListener('click', function () {
    var secret = document.getElementById('secret').value;
    if (secret) {
      var otp = generarOTP(secret);
      document.getElementById('otp').innerText = otp;
      document.getElementById('copy-2fa').style.display = 'inline-block';
      document.getElementById('updating').style.display = 'inline-block';

      iniciarContadorActualizacion();
    } else {
      toastr.error('Por favor, ingrese su clave 2FA.');
    }
  });

  document.getElementById('copy-2fa').addEventListener('click', function () {
    var otp = document.getElementById('otp').innerText;
    navigator.clipboard.writeText(otp).then(function () {
      toastr.success('Código 2FA copiado al portapapeles!');
    }, function (err) {
      toastr.error('Error al copiar: ' + err);
    });
  });

  // Nuevo event listener para obtener el token de Facebook
  document.getElementById('get-fb-token').addEventListener('click', function () {
    console.log('Botón clickeado');
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        console.log('Tab actual:', tabs[0].url);
        chrome.tabs.sendMessage(tabs[0].id, {action: "getEAABToken"}, function(response) {
          console.log('Respuesta recibida:', response);
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
          } else if (response && response.token) {
            document.getElementById('fb-token').value = response.token;
            console.log('Token EAAB establecido en el campo de entrada');
          } else if (response && response.error) {
            console.error('Error al obtener el token:', response.error);
            document.getElementById('fb-token').value = 'Error: ' + response.error;
          } else {
            console.log('No se recibió token en la respuesta');
            document.getElementById('fb-token').value = 'No se pudo obtener el token';
          }
        });
      } else {
        console.error('No se encontró una pestaña activa');
      }
    });
  });

  // Nuevo event listener para copiar el token de Facebook
  document.getElementById('copy-fb-token').addEventListener('click', function () {
    var token = document.getElementById('fb-token').value;
    if (token) {
      navigator.clipboard.writeText(token).then(function () {
        toastr.success('Token de Facebook copiado al portapapeles!');
      }, function (err) {
        toastr.error('Error al copiar: ' + err);
      });
    } else {
      toastr.error('No hay token para copiar. Obtenga el token primero.');
    }
  });

  // ... resto del código existente ...
});

function generarOTP(secret) {
  // Aquí deberías implementar la lógica real de generación de OTP basada en el secreto
  // Por ahora, usaremos un número aleatorio como ejemplo
  return Math.floor(100000 + Math.random() * 900000);
}

function iniciarContadorActualizacion() {
  var countdown = 30;
  var interval = setInterval(function () {
    countdown--;
    document.getElementById('updatingIn').innerText = countdown;
    if (countdown === 0) {
      clearInterval(interval);
      document.getElementById('get-2fa').click();
    }
  }, 1000);
}
