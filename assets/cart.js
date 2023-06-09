class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.key, 0);
    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]'))
      .reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);
    
    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 500);
    this.preview = this.querySelectorAll('.preview_img')
    this.preview.forEach(a => a.addEventListener('click', this.previewDesign.bind(this)));

    this.addEventListener('change', this.debouncedOnChange.bind(this));
    this.addEventListener('click',function (e) {
    if (e.target.classList.contains('preview_img') === false && e.target.classList.contains('main_priview_img') === false) {
      document.querySelector('.priview-image-section').classList.remove('show');
    }
  });  
  }

  previewDesign(evt){
    const previewSrc = evt.target.getAttribute('data-src');
    document.querySelector('.priview-image-section').classList.add('show');
    document.querySelector('.main_priview_img img').setAttribute('src',previewSrc);
  }

  
  onChange(event) {
    this.updateQuantity(event.target.dataset.key, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-shipping-bar',
        section: 'free-shipping',
        selector: '.js-shipping-bar',
      }
    ];
  }

  updateQuantity(key, quantity, name) {
    this.enableLoading(key);

    const body = JSON.stringify({
      id: key,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
      quantity
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML =
            this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
        }));

        parsedState.items.forEach(this.updateLineItem.bind(this))
        this.updateTotalPrice(parsedState.total_price)
        this.updateCartCount(parsedState.item_count)
        const lineItem = document.querySelector(`[data-key="${key}"]`) || document.querySelector(`[data-key="${key}"]`);
        if (parseInt(quantity) === 0) {
          lineItem.remove()
        }
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`)) : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'))
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'))
        }
        this.disableLoading();
        $('.close-popup-popup-cart').click(function(){
          $('.popup-image-cart-wrapper').removeClass('show');
        });
      }).catch(() => {
        this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
        this.disableLoading();
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        if(errors) {
          errors.textContent = window.cartStrings.error;
        }
      });
  }

  updateCartCount (count) {
    const countEls = document.querySelectorAll('.cart-count-bubble span')

    if (countEls.length > 0) {
      countEls.forEach(countEl => countEl.innerHTML = count)
    }
  }

  updateTotalPrice(total) {
    const totalEl = document.querySelector('.totals__subtotal-value')

    totalEl.innerHTML = Shopify.formatMoney(total, Shopify.currency_format)
  }

  updateLineItem(item) {
    const itemEl = this.querySelector(`[data-key="${item.key}"]`)
    if (itemEl) {
      const itemPrices = itemEl.querySelectorAll('.price')
      itemPrices.forEach(itemPrice => itemPrice.innerHTML = Shopify.formatMoney(item.final_line_price, Shopify.currency_format))
    }
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
      const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
      lineItemError
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');
    const cartItemElements = this.querySelectorAll(`[data-key="${line}"] .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`[data-key="${line}"] .loading-overlay`);
    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define('cart-note', class CartNote extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
      }, 300))
    }
  });
};

function openPreview(url){
  $('.popup-image-cart-wrapper .popup-image img').attr("src", url);
  $('.popup-image-cart-wrapper').addClass('show');
}