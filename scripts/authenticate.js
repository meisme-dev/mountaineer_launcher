const ygg = require('yggdrasil')({
  host: 'https://authserver.mojang.com'
});
const fs = require("fs");
const microsoftLoginURL = "https://login.live.com/oauth20_authorize.srf?client_id=000000004C12AE6F&redirect_uri=https://login.live.com/oauth20_desktop.srf&scope=service::user.auth.xboxlive.com::MBI_SSL&display=touch&response_type=token&locale=en";

var responseJSON;
var authWindow;

function validateToken(){
  var accessToken = fs.readFileSync('creds.txt', 'utf8');
  ygg.validate(accessToken).then(
    ({accessToken, clientToken, user}) => {
      console.log(user);
    },
    (error) => {
      console.log(error);
    }
  );
}

function authenticateMojangAccount(){
  var username = document.getElementById("emailBox").value;
  var password = document.getElementById("passwordBox").value;
  ygg.auth({
      agent: 'Minecraft',
      version: 1,
      user: username,
      pass: password,
      requestUser: false
    }).then(
      (response) => {
        responseJSON = JSON.parse(JSON.stringify(response));
        fs.truncate("creds.txt", 0, function() {
          fs.writeFile('creds.txt', responseJSON.accessToken, function(err) {
            if (err) {
              return console.error(err);
            }
            console.log("Written to file.");
          });
      });
      },
      (error) => {
        console.log(error);
      }
    );
}

function authenticateMicrosoftAccount(){
  function createBrowserWindow() {
      const remote = require('electron').remote;
      const BrowserWindow = remote.BrowserWindow;
      authWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
          nodeIntegration: false,
          webSecurity: false
        }
      });
      authWindow.webContents.on('did-finish-load', function () { getOauthURL(); });
      authWindow.loadURL(microsoftLoginURL);
    }
    createBrowserWindow();
}

async function getOauthURL(){
  sleep(1000);
  authURL = authWindow.webContents.getURL();
  console.log(authURL);
  checkForAccessToken();
}

function checkForAccessToken(){
  if(authURL.includes("access_token")){
    console.log("Access Token Found");
    var accessToken = authURL.match(new RegExp("access_token=" + "(.*)" + "&"));
    accessToken = accessToken[1];
    console.log(accessToken);
    fs.truncate("creds.txt", 0, function() {
      fs.writeFile('creds.txt', accessToken, function(err) {
        if (err) {
          return console.error(err);
        }
        console.log("Written to file.");
      });
    });
  }
}

//Refresh yggdrasil token
function refreshToken(){
  ygg.refreshToken().then(
    (response) => {
      responseJSON = JSON.parse(JSON.stringify(response));
      fs.truncate("creds.txt", 0, function() {
        fs.writeFile('creds.txt', responseJSON.accessToken, function(err) {
          if (err) {
            return console.error(err);
          }
          console.log("Written to file.");
        });
      });
    },
    (error) => {
      console.log(error);
    }
  );
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}