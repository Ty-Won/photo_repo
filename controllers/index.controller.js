const photoPath = "photos";
const fs = require('fs');
const crypto = require("crypto");
const config = require("../config");
const nodeCache = require("node-cache");
const requestPromise = require("request-promise");



let sessionCache = new nodeCache();

function renderImage(req, res, next){

    let token = sessionCache.get("aTempTokenKey");

    if (token){
        let photoPaths = [];
        fs.readdir(photoPath, (err, photos)=>{
            photos.forEach( photoName => {
                photoPaths.push(photoName);
            })
        })
        res.render('index', {images:photoPaths,  layout:false})
    }
    else{
        res.redirect('/login');
    }
}


function login(req, res, next) {
    let state = crypto.randomBytes(16).toString('hex');

    //Take the random generated key and store it for 30 minsmyc
    sessionCache.set(state, "aTempSessionValue", 1800);

    //API format is https://www.dropbox.com/developers/documentation/http/documentation
    let dropboxRedirect= config.DROPBOX_OAUTH_DOMAIN 
            + config.DROPBOX_OAUTH_PATH 
            + "?response_type=code&client_id="+config.DROPBOX_APP_KEY
            + "&redirect_uri="+config.DROPBOX_OAUTH_REDIRECT_URL 
            + "&state="+state;

    res.redirect(dropboxRedirect);
}


async function oauthRedirect(req, res, next) {
    let state = req.query.state

    //check for dropbox api authentication error
    if (req.query.error_description){
        return next(new Error(req.query.error_description));
    }

    // Expired session
    if(!sessionCache.get(state)){
        return next(new Error("Session State Expired"));
    }

    if (req.query.code){

        // Followed from https://github.com/request/request-promise
        let options={
            uri: config.DROPBOX_API_DOMAIN + config.DROPBOX_TOKEN_PATH, 
                //build query string
            qs: {'code': req.query.code, 
            'grant_type': 'authorization_code', 
            'client_id': config.DROPBOX_APP_KEY, 
            'client_secret':config.DROPBOX_APP_SECRET,
            'redirect_uri':config.DROPBOX_OAUTH_REDIRECT_URL}, 
            method: 'POST',
            json: true }
        

        requestPromise(options).then((response)=>{
            sessionCache.set("aTempTokenKey", response.access_token, 3600);
            res.redirect("/");
        }).catch((err)=>{
            return next(new Error(`Token Error: ${err.message}`));
        })


    }else{
        return next(new Error('Token Error'));
    }
}

module.exports = {
    renderImage:renderImage,
    login:login,
    oauthRedirect:oauthRedirect
}
