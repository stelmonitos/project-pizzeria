
class Carousel {
    constructor(element) {
        const thisCarousel = this;

        thisCarousel.element = element;

        thisCarousel.render(element);
        thisCarousel.initActions();
        
    }
    render(element) {
        const thisCarousel = this;

        thisCarousel.element = element;
    }

    initActions(){
        const elem = document.querySelector('.main-carousel');
        new Flickity( elem, {
            cellAlign: 'left',
            contain: true,
            prevNextButtons: false,
            autoPlay: true,
        });

    }
}
export default Carousel;