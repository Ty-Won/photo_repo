function renderImage(req, res, next){

    //render grid template and pass image paths
    //TODO pass paths
    // res.render('grid', {images: paths});

    res.render('grid');
}


module.exports = {
    renderImage:renderImage
}