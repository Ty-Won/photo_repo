const photoPath = "photos";
const fs = require('fs');
const crypto = require("crypto");
const config = require("../config");
const nodeCache = require("node-cache");

let sessionCache = new nodeCache();

function renderImage(req, res, next){

    let token = sessionCache.get("aTempTokenKey");

    if (token){
        //render grid template and pass image paths
        let photoPaths = [];
        fs.readdir(photoPath, (err, photos)=>{
            photos.forEach( photoName => {
                photoPaths.push(photoName);
            })
        })
    }
    else{
        res.redirect('/login');
    }
}


function login(req, res, next) {
    let state = crypto.randomBytes(16).toString('hex');

    //Take the random generated key and store it for 30 minsmyc
    sessionCache.set(state, "aTempSessionValue", 1800);

    //API format is https://api.dropbox.com/oauth2/token + auth code + grant type + key
    let dropboxRedirect= config.DROPBOX_OAUTH_DOMAIN 
            + config.DROPBOX_OAUTH_PATH 
            + "?response_type=code&client_id="+config.DROPBOX_APP_KEY
            + "&redirect_uri="+config.DROPBOX_OAUTH_REDIRECT_URL 
            + "&state="+state;

    res.redirect(dropboxRedirect);
}

module.exports = {
    renderImage:renderImage,
    login:login
}
