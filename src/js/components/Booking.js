import {templates, select, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;
    
        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();
        thisBooking.initTables();
        thisBooking.selectedTable = null;
        thisBooking.starters = [];
    }
    
    getData() {
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
        const notRepeatParam = settings.db.notRepeatParam;
        const repeatParam = settings.db.repeatParam;

        const params = {
            bookings: [
                startDateParam,
                endDateParam,    
            ],
            eventsCurrent: [
                notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                repeatParam,
                endDateParam,
            ],
        };

        // console.log('getData params', params);
        
        const urls = {
            bookings:       settings.db.url + '/' + settings.db.bookings
                                           + '?' + params.bookings.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events  
                                           + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.events  
                                           + '?' + params.eventsRepeat.join('&'),
        };

        // console.log('getData urls', urls);

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ]) 
            .then(function (allResponses) {
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            }) 
            .then(function ([booking, eventsCurrent, eventsRepeat]) {
                // console.log('bookings', booking);
                // console.log('eventsCurrent', eventsCurrent);
                // console.log('eventsRepeat', eventsRepeat);
                thisBooking.parseData(booking, eventsCurrent, eventsRepeat);
            });
    }  

    parseData(booking, eventsCurrent, eventsRepeat) {
        const thisBooking = this;

        thisBooking.booked = {};
        
        for(let item of booking){
                thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }   

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }
        // console.log('thisBooking.booked', thisBooking.booked);

        thisBooking.udapteDOM();
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
            // console.log('loop', hourBlock);

            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }
            thisBooking.booked[date][hourBlock].push(table);
        }

    }

    udapteDOM() {
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.dom.hourPicker.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }
        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);

            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
        for(let table of thisBooking.dom.tables){
            table.classList.remove(classNames.booking.selected);
        }
    }

    render(element) {
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();
        
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables); 
        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    }
    
    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.dom.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.udapteDOM();
        });
        thisBooking.dom.wrapper.addEventListener('submit', function(event){
            event.preventDefault();
            thisBooking.sendBooking();
        });
    }

    initTables() {
        const thisBooking = this;
        thisBooking.selectedTable = null;
        for(let table of thisBooking.dom.tables){
            const tableId = table.getAttribute(settings.booking.tableIdAttribute);
            table.addEventListener('click', function(){
                if(table.classList.contains(classNames.booking.tableBooked)){
                    alert('This table is already booked!');
                } else {
                    if(table.classList.contains(classNames.booking.selected)){
                        table.classList.remove(classNames.booking.selected);
                            thisBooking.selectedTable = null;
                    } else {
                        for(let table of thisBooking.dom.tables){
                            table.classList.remove(classNames.booking.selected);
                        }
                        table.classList.add(classNames.booking.selected);
                        thisBooking.selectedTable = tableId;
                    }
                }
            });
            
        }
    }

    sendBooking() {
        const thisBooking = this;

        const url = settings.db.url + '/' + settings.db.bookings;
        
        const payload = {
            date: thisBooking.datePicker.value,
            hour: thisBooking.dom.hourPicker.value,
            table: parseInt(thisBooking.selectedTable),
            duration: parseInt(thisBooking.hoursAmount.value),
            ppl: parseInt(thisBooking.peopleAmount.value),
            starters: [],
        };

        const starter = document.querySelectorAll('input[name="starter"]:checked');
        for(let item of starter){
            payload.starters.push(item.value);
        }

        // console.log('payload', payload);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload), 
        };

        fetch(url, options)
            .then(function(response){
                return response.json();
            }).then(function(parsedResponse){
                console.log('parsedResponse', parsedResponse);
            });

        if(thisBooking.selectedTable !== null){
            thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
            thisBooking.udapteDOM();
        }
    }

}

export default Booking; 
