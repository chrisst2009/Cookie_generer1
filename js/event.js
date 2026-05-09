// Service Worker para Manifest V3
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.click === "copy") {
    // Obtener cookies de Facebook
    chrome.cookies.getAll({
      domain: ".facebook.com"
    }, function(cookies) {
      var cookieString = "";
      for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].name) {
          cookieString += cookies[i].name + "=" + cookies[i].value + "; ";
        }
      }
      
      if (cookieString) {
        // Enviar las cookies al content script para copiar
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "copyToClipboard",
              text: cookieString
            }, function(response) {
              if (chrome.runtime.lastError) {
                sendResponse({
                  error: "Failed to copy cookies data to clipboard"
                });
              } else {
                sendResponse({
                  success: "Successfully copied cookies to clipboard"
                });
              }
            });
          } else {
            sendResponse({
              error: "No active tab found"
            });
          }
        });
        return true; // Indica respuesta asíncrona
      } else {
        sendResponse({
          error: "Facebook Cookie is empty"
        });
      }
    });
    return true; // Indica respuesta asíncrona
  } 
  else if (request.click === "paste") {
    // Solicitar al content script que lea el clipboard
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "readFromClipboard"
        }, function(response) {
          if (chrome.runtime.lastError || !response || !response.text) {
            sendResponse({error: "Failed to read from clipboard"});
            return;
          }
          
          // Primero, eliminar cookies existentes
          chrome.cookies.getAll({domain: ".facebook.com"}, function(cookies) {
            for (var i = 0; i < cookies.length; i++) {
              chrome.cookies.remove({
                url: "https://facebook.com",
                name: cookies[i].name
              });
            }
            
            // Luego, agregar nuevas cookies
            var cookieString = decodeURIComponent(response.text.replace(/\+/g, " "));
            var expirationDate = Math.floor(new Date().getTime() / 1000) + 86400;
            var cookiePairs = cookieString.split(";");
            
            for (var j = 0; j < cookiePairs.length; j++) {
              var parts = cookiePairs[j].trim().split("=");
              var cookieName = parts[0];
              var cookieValue = parts[1];
              
              if (cookieName && cookieValue) {
                chrome.cookies.set({
                  url: "https://facebook.com/",
                  domain: ".facebook.com",
                  name: cookieName,
                  value: cookieValue,
                  expirationDate: expirationDate
                });
              }
            }
            
            // Redirigir a Facebook
            chrome.tabs.update(tabs[0].id, {
              url: "https://facebook.com/"
            });
            
            sendResponse({success: "Cookies pasted successfully"});
          });
        });
      }
    });
    return true; // Indica respuesta asíncrona
  }
});
