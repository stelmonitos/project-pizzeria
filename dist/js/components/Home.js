import {templates} from '../settings.js';
import utils from '../utils.js';

class Home {
    constructor(container) {
        const thisHome = this;

        thisHome.element = container;

        thisHome.render(container);
        // thisHome.initWidgets();
    }

    render(container){
        const thisHome = this;

        const generatedHTML = templates.homePage();
        
        thisHome.elementDOM = utils.createDOMFromHTML(generatedHTML);

        container.appendChild(thisHome.elementDOM);

        console.log('thisHome.elementDOM', thisHome.elementDOM);
        
    }


}

export default Home;
