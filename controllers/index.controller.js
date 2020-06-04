const photoPath = "photos";
const fs = require('fs');
function renderImage(req, res, next){

    //render grid template and pass image paths
    photoPaths = [];
    fs.readdir(photoPath, (err, photos)=>{
        photos.forEach( photoName => {
            photoPaths.push(photoName);
        })
        console.log(photoPaths);
    })

    res.render('index', {images: photoPaths, layout:false});
}


module.exports = {
    renderImage:renderImage
}
