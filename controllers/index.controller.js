const photoPath = "photos";
const fs = require('fs');
const crypto = require("crypto");
const config = require("../config");
const nodeCache = require("node-cache");
const requestPromise = require("request-promise");



let sessionCache = new nodeCache();

async function renderImage(req, res, next){

    let token = sessionCache.get("aTempTokenKey");

    if (token){
        let photoPaths = await fetchPhotoLinks(token);
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


async function fetchPhotoLinks(token){
    let imagePaths = await fetchImagePaths(token);

    let tempLinksResponse = await fetchTempLinksFromPaths(token, imagePaths.paths);
    let tempLinkList = tempLinksResponse.map(function(entry){
        return entry.link;
    })
    return tempLinkList;
}



async function fetchImagePaths(token){

    let options={
      url: config.DROPBOX_API_DOMAIN + config.DROPBOX_LIST_FOLDER_PATH, 
      headers:{"Authorization":"Bearer " + token},
      method: 'POST',
      json: true ,
      body: {"path":""}
    }
  
    try{
      //Make request to Dropbox to get list of file entry object
      let fileList = await requestPromise(options);
  

      // Retrive the lowercase paths
      let lowercasePaths = result.map(function (entry) {
        return entry.path_lower;
      });
  
      //return a cursor only if there are more files in the current folder
      let response= {};
      response.paths= lowercasePaths;       
      return response;
  
    }catch(error){
      return next(new Error('error listing folder. '+error.message));
    }        
} 
  
  
  //Returns an array with temporary links from an array with file paths
  function fetchTempLinksFromPaths(token,paths){
  
    var promises = [];
    let options={
      url: config.DROPBOX_API_DOMAIN + config.DROPBOX_GET_TEMPORARY_LINK_PATH, 
      headers:{"Authorization":"Bearer "+token},
      method: 'POST',
      json: true
    }
  
    //Create a promise for each path and push it to an array of promises
    paths.forEach((path_lower)=>{
      options.body = {"path":path_lower};
      promises.push(requestPromise(options));
    });
  
    //await till all promises are completed within the array of temp links
    return Promise.all(promises);
  }



module.exports = {
    renderImage:renderImage,
    login:login,
    oauthRedirect:oauthRedirect
}
