require('dotenv').config()

module.exports = {
        //https://www.dropbox.com/developers/documentation/http/documentation
        DROPBOX_API_DOMAIN: 'https://api.dropboxapi.com',
        DROPBOX_OAUTH_DOMAIN: 'https://www.dropbox.com',
        DROPBOX_OAUTH_PATH: '/oauth2/authorize',
        DROPBOX_TOKEN_PATH: '/oauth2/token',
        DROPBOX_APP_KEY:process.env.DROPBOX_APP_KEY,
        DROPBOX_APP_SECRET:process.env.DROPBOX_APP_SECRET,
        DROPBOX_OAUTH_REDIRECT_URL:"http://localhost:3000/oauthredirect",

        DROPBOX_LIST_FOLDER_PATH:'/2/files/list_folder',
        DROPBOX_LIST_FOLDER_CONTINUE_PATH:'/2/files/list_folder/continue',
        DROPBOX_GET_TEMPORARY_LINK_PATH:'/2/files/get_temporary_link',
        }