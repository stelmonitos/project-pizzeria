import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js'; 

class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      // console.log('new Cart', thisCart);
    }
    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }
    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault(); // guzik ORDER nie powoduje przeladowania strony
        thisCart.dom.wrapper.classList.toggle(classNames.menuProduct.cart.wrapperActive); // inaczej 'active' xd
      });
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct)
      });
      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      })
    }
    add(menuProduct) {
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }
    update() {
      const thisCart = this;

      let deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for (let product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
      if (totalNumber == 0) {
        deliveryFee = 0;
      }
      thisCart.totalPrice = deliveryFee + subtotalPrice;
      thisCart.deliveryFee = deliveryFee;
      thisCart.totalNumber = totalNumber;
      thisCart.subtotalPrice = subtotalPrice;

      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;

      for (let totalPrice of thisCart.dom.totalPrice) {
        totalPrice.innerHTML = thisCart.totalPrice;
      }

      // console.log('totalNumber',totalNumber);
      // console.log('subtotalPrice',subtotalPrice);
      // console.log('deliveryFee',deliveryFee);
      // console.log('thisCart.totalPrice',thisCart.totalPrice);

    }
    remove(cartProduct) {
      const thisCart = this;
      // delete HTML
      const cartProductIndex = thisCart.products.indexOf(cartProduct)
      if (cartProductIndex !== -1) {
        thisCart.products[cartProductIndex].dom.wrapper.remove();
      }
      // delete data in specisfic product in thisCart.products Array
      if (cartProductIndex !== -1) {
        thisCart.products.splice(cartProductIndex, 1);
      }
      // call update method
      thisCart.update()
    }
    sendOrder() {
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      }

      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      fetch(url, options)
        .then(function (response) {
          return response.json();
        }).then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });
    }
  }

  export default Cart;