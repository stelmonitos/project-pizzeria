import {templates} from '../settings.js';
import utils from '../utils.js';
import Carousel from './Carousel.js';

class Home {
    constructor(container) {
        const thisHome = this;

        thisHome.element = container;

        thisHome.render(container);
        thisHome.initWidgets();
    }

    render(container){
        const thisHome = this;

        const generatedHTML = templates.homePage();
        
        thisHome.elementDOM = utils.createDOMFromHTML(generatedHTML);

        container.appendChild(thisHome.elementDOM);

    }
    
    initWidgets(){
        const thisHome = this;

        thisHome.Carousel = new Carousel(thisHome.elementDOM.querySelector('.main-carousel'));
    }

}

export default Home;
