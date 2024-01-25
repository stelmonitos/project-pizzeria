import Flickity from 'vendor/flickity.pkgd.min.js';

class Carousel {
    constructor(element) {
        const thisCarousel = this;

        thisCarousel.element = element;

        thisCarousel.render();
        thisCarousel.initActions();
    }
    render(element) {
        const thisCarousel = this;

        thisCarousel.element = element;
    }

    initActions(){
        var element = document.querySelector('.main-carousel');
        new Flickity( element, {
            cellAlign: 'left',
            contain: true,
            prevNextButtons: false,
            autoPlay: true,
        });

    }
}
export default Carousel;