function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if(summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', this.onButtonClick.bind(this))
      }
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;
    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const parentMenusubElement = detailsElement.closest('.menu-drawer__inner-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);

      if (window.matchMedia('(max-width: 990px)')) {
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      }
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        parentMenusubElement && parentMenusubElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      if(!this.classList.contains('mobile-facets__wrapper')) {
        details.removeAttribute('open');
      }
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        document.querySelector('.filter-mobile .mobile-facets__disclosure').setAttribute('open','');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('[id^="ModalClose-"]').forEach(item => {
      item.addEventListener(
        'click',
        this.hide.bind(this, false)
      );
    })
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('ul');
    this.sliderItems = this.querySelectorAll('li');
    this.sliderItemsPreoduct = this.querySelectorAll('li.slider-li');
    this.pageCount = this.querySelector('.slider-counter--current');
    this.pageTotal = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');
    this.prevButtonAll = this.querySelectorAll('button[name="previous"]');
    this.nextButtonAll = this.querySelectorAll('button[name="next"]');
    this.slider.addEventListener('scroll', this.update.bind(this));
    this.buttonMiddle();

    this.dotActive = this.querySelector('button[name="dot"].active');
    
    this.dotButton = this.querySelectorAll('button[name="dot"]')
    this.dotButton?.forEach((dot) => {
      dot.addEventListener('click', this.onDotClick.bind(this));
    })
    if (!this.slider || !this.nextButton) return;
    const resizeObserver = new ResizeObserver(entries => {this.initPages();this.buttonMiddle();this.updateHeight()});
    resizeObserver.observe(this.slider);  

    this.slider.addEventListener('scroll', this.update.bind(this));

    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
    this.prevButtonAll?.forEach((prev) => {prev.addEventListener('click', this.onButtonClick.bind(this))});
    this.nextButtonAll?.forEach((next) => {next.addEventListener('click', this.onButtonClick.bind(this))});
  }

  buttonMiddle() {
    if (this.querySelector('.card-media') && (this.prevButton && this.nextButton)) {
      var img = this.querySelector('.card-media').clientHeight;
      var height = parseInt(img)/2 - this.prevButton.clientHeight/2;
      this.prevButton.style.top = height + 'px';
      this.nextButton.style.top = height + 'px';
    }
  }

  initPages() {
    if (!this.sliderItems.length === 0) return;
    this.slidesPerPage = Math.floor(this.slider.clientWidth / this.sliderItems[0].clientWidth);
    this.totalPages = this.sliderItems.length - this.slidesPerPage + 1;
    this.update();
  }

  update() {
    if (!this.pageCount || !this.pageTotal) return;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItems[0].clientWidth) + 1;
    if (this.prevButton) {
      if (this.currentPage === 1) {
        this.prevButton.setAttribute('disabled', true);
        this.prevButtonAll?.forEach((prev) => {prev.setAttribute('disabled', true)});
      } else {
        this.prevButton.removeAttribute('disabled');
        this.prevButtonAll?.forEach((prev) => {prev.removeAttribute('disabled')});
      }
    }
    if(this.nextButton) {
      this.totalPages = this.sliderItemsPreoduct.length - this.slidesPerPage + 1;
      if(this.querySelector('.next-2')) {
        this.sliderItemsPreoduct2 = document.querySelector('.gp-recently-viewed-products').getAttribute('viewed-products-length');
        if( this.sliderItemsPreoduct2 > 8) {
          this.totalPages2 = 8 - this.slidesPerPage + 1;
        }else {
          this.totalPages2 = this.sliderItemsPreoduct2 - this.slidesPerPage + 1;
        }
        if (this.currentPage === this.totalPages2) {
          this.nextButton.setAttribute('disabled', true);
          this.nextButtonAll?.forEach((next) => {next.setAttribute('disabled', true)});
        } else {
          this.nextButton.removeAttribute('disabled');
          this.nextButtonAll?.forEach((next) => {next.removeAttribute('disabled')});
        }
      }else {
        if (this.currentPage === this.totalPages) {
          this.nextButton.setAttribute('disabled', true);
          this.nextButtonAll?.forEach((next) => {next.setAttribute('disabled', true)});
        } else {
          this.nextButton.removeAttribute('disabled');
          this.nextButtonAll?.forEach((next) => {next.removeAttribute('disabled')});
        }
      }
    }
    
    this.pageCount.textContent = this.currentPage;
    this.pageTotal.textContent = this.totalPages;
    if(this.querySelector('.slider-dots')) {
      if(this.querySelector('.slider-dots').innerHTML == false) {
        var dotList = '';
        if(this.totalPages > 0) {
          for( var i =1 ; i <= this.totalPages ; i++) {
            if(i==1){ 
              var active = 'active';
            }
            var dotItem = '<button type="button" aria-label="Dots" name="dot" class="dotslide '+active+'" data-position="'+i+'"></button>'
            dotList += dotItem;
          }
        }
        this.querySelector('.slider-dots').innerHTML += dotList;
        this.dotActive = this.querySelector('button[name="dot"].active');
      
        this.dotButton = this.querySelectorAll('button[name="dot"]');
      }
    }
    this.dotButton?.forEach((dot) => {
      let dotPosition = dot.getAttribute("data-position");
      this.dotButton.forEach(dot => dot.classList.remove('active'))
      if(dotPosition == this.currentPage) {
        dot.classList.add("active");
      }
    })
    this.sliderItems?.forEach((sliderActive) => {
      sliderActive.classList.remove("product__media-item--full", "active");
      if(this.dotActive) {
        this.dotActive.classList.remove("active");
        this.dotButton?.forEach((dot) => {
          if(dot.getAttribute("data-position") == this.currentPage) {
            dot.classList.add("active");
          }
        })
      }
      var slidePosition = sliderActive.getAttribute("data-position");
      if(slidePosition == this.currentPage) {
        sliderActive.classList.add("product__media-item--full", "active");
      }
    })
    if(this.querySelector('.slider-vertical .product__media-list')) {
      var height_large_media = this.querySelector('.slider-vertical .product__modal-opener').clientHeight;
      if (height_large_media == 0) {
        var height_large_media = this.querySelector('.slider-vertical .deferred-media').clientHeight;
      }
      this.querySelector('.slider-dots').style.height = height_large_media + 'px';
    }
  }

  updateHeight() {
    if (this.querySelector('.slideshow .slider')){
      if(this.querySelector('.slide-content-inner')) {
        this.querySelectorAll('.slide-content-inner').forEach((content) => {
          content.closest(".slide-item").style.minHeight = content.clientHeight + 'px';
        })
      }
    }
  }

  onButtonClick(event) {
    event.preventDefault();
    const slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + this.sliderItems[0].clientWidth : this.slider.scrollLeft - this.sliderItems[0].clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
    if(event.currentTarget.name === 'next') {
      this.currentPage = this.currentPage + 1;

    } else {
      this.currentPage = this.currentPage - 1;
    }
  }
  onDotClick(event) {
    event.preventDefault();
    let number = parseInt(event.currentTarget.getAttribute("data-position"));
    this.dotActive.classList.remove("active");
    this.dotButton?.forEach((dot) => {
      dot.classList.remove("active");
    })
    let currentPosition = parseInt(this.dotActive.getAttribute("data-position"));
    this.dotActive = event.currentTarget;
    let slideScrollPosition = this.slider.scrollLeft + this.sliderItems[0].clientWidth * (number - currentPosition);
    this.dotButton.forEach((dot) => {
      if(dot.getAttribute("data-position") == this.currentPage) {
        dot.classList.add('active')
      }
  })
    this.slider.scrollTo({
      left: slideScrollPosition,
      behavior: 'smooth'
    });

  }
}

customElements.define('slider-component', SliderComponent);


class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
    this.autoplaySpeed = this.slider.dataset.speed * 1000;

    this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    this.play();
    this.autoplayButtonIsSetToPlay = true;
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) return;

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
    this.play();
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play();
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const linkElements = item.querySelectorAll('a');
      if (index === this.currentPage - 1) {
        if (linkElements.length) linkElements.forEach(button => {
          button.removeAttribute('tabindex');
        });
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (linkElements.length) linkElements.forEach(button => {
          button.setAttribute('tabindex', '-1');
        });
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);


class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.init();
    this.querySelectorAll('fieldset').forEach(sector=> sector.addEventListener('change', this.onVariantChange.bind(this))) 
  }
  init() {
    this.checkOption(document.querySelector('#on-init').getAttribute("data-current-option"), document.querySelector('#on-init').getAttribute("data-current-value"))
  }

  checkOption (option_name, option_value) {
    
    var data = this.getVariantData();
    switch (parseInt(option_name)) {
      case 0:
        document.querySelectorAll(" .data-layer-1 label, .data-layer-1 input, .data-layer-2 label, .data-layer-2 input").forEach(el => el.classList.remove('active'));
        var available_products = data.filter(variant => {return variant.option1 == option_value});
        this.refresh= [...new Set(available_products.map(o => o.option2))]
        this.refresh.push(...new Set(available_products.map(o => o.option3)));
        this.changeValue('input[value="'+ available_products[0].option2 +'"')
        this.changeValue('input[value="'+ available_products[0].option3 +'"',false)
        document.querySelectorAll(".data-layer-1 .form__label .selected-value").forEach((item) => {
          item.innerHTML = available_products[0].option2 ;
        })
        document.querySelectorAll(".data-layer-2 .form__label .selected-value").forEach((item) => {
          item.innerHTML = available_products[0].option3 ;
        })
        document.querySelectorAll(".data-layer-2 label, .data-layer-2 input, .data-layer-1 label, .data-layer-1 input").forEach(el => el.classList.add('hidden'))
        break;
      case 1:
        document.querySelectorAll(".data-layer-1 label, .data-layer-1 input, .data-layer-2 label, .data-layer-2 input").forEach(el => el.classList.remove('active'))
        var available_products = data.filter(variant => {return variant.option2 == option_value});
        this.refresh = [...new Set(available_products.map(o => o.option3))];
        this.changeValue('input[value="'+ available_products[0].option3 +'"',false)
        document.querySelectorAll(".data-layer-2 .form__label .selected-value").forEach((item) => {
          item.innerHTML = available_products[0].option3 ;
        })
        document.querySelectorAll(".data-layer-2 label, .data-layer-2 input").forEach(el => el.classList.add('hidden'))
          break;
      case 2:
        document.querySelectorAll(".data-layer-2 label, .data-layer-2 input").forEach(el => el.classList.remove('active'))
        break;
      default:         
        document.querySelectorAll(".data-layer-0 label, .data-layer-0 input").forEach(el => el.classList.remove('active'))
        var available_products = data.filter(variant => {return variant.option1 == option_value})
        this.refresh= [...new Set(available_products.map(o => o.option2))]
        this.refresh.push(...new Set(available_products.map(o => o.option3)));
        this.changeValue('input[value="'+ available_products[0].option2 +'"')
        this.changeValue('input[value="'+ available_products[0].option3 +'"')
        document.querySelectorAll(".data-layer-2 label, .data-layer-2 input, .data-layer-1 label, .data-layer-1 input").forEach(el => el.classList.add('hidden'))
        break;
    }
    if (this.refresh) this.refresh.map(item => this.setDisable(item))
  }
  
  updateOptionsAvailable(evt) {
    this.target = evt.target;
    if(parseInt(evt.target.getAttribute('data-index')) == 0) document.querySelectorAll(".data-layer-0 label, .data-layer-0 input").forEach(el => el.classList.remove('active'));
    this.checkOption(evt.target.getAttribute('data-index'), evt.target.value)
    evt.target.classList.add('active');
    document.querySelector('label[for="'+ evt.target.id + '"]').classList.add('active');
  }
  changeValue(selector, last) {
    if (document.querySelector(selector)) {
      document.querySelector(selector).checked = true;
      document.querySelector('label[for="'+ document.querySelector(selector).id + '"]').classList.add('active')
    }
  }

  setDisable(item) {
    var el = document.querySelector('input[value="'+ item +'"]')
    if (el) {
      el.classList.remove("hidden");
      document.querySelector('label[for="'+ el.id + '"]').classList.remove('hidden')
    }
  }
  onVariantChange(evt) {
    
    this.updateOptionsAvailable(evt);
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
      var select = this.target.closest(".product-form__input");
      if (evt.target.closest("input") && select.querySelector(".selected-value")) {
        var it = evt.target.closest("input").getAttribute("value") ;
        select.querySelector(".selected-value").innerHTML = it;
        document.querySelector("#on-init").setAttribute('data-current-value', evt.target.closest("input").getAttribute("value"));
      }
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
    
  }

  updateMasterId() {

    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
    mediaGalleries.forEach(mediaGallery => mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true));

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant) return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}
customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      fetch(this.dataset.url)
        .then(response => response.text())
        .then(text => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('product-recommendations');

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }

          if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
            this.remove();
          }

          if (html.querySelector('.grid__item')) {
            this.classList.add('product-recommendations--loaded');
          }
        })
        .catch(e => {
          console.error(e);
        });
    }

    new IntersectionObserver(handleIntersection.bind(this), {rootMargin: '0px 0px 400px 0px'}).observe(this);
  }
}

customElements.define('product-recommendations', ProductRecommendations);
document.querySelectorAll('.field-wrapper').forEach((eye) => {
  if(eye.querySelector('.password-eye')) {
    eye.querySelector('.password-eye').addEventListener('click', (event) => {
      if(eye.querySelector('input').type == 'password'){
        eye.querySelector('input').type = 'text'
        eye.querySelector('.password-eye').classList.add('show');
      }else {
        eye.querySelector('input').type = 'password';
        eye.querySelector('.password-eye').classList.remove('show');
      }
    });
  }
});
class Accordion {
  constructor(el) {
    // Store the <details> element
    this.el = el;
    // Store the <summary> element
    this.summary = el.querySelector('summary');
    // Store the <div class="content"> element
    this.content = el.querySelector(':scope>div');

    // Store the animation object (so we can cancel it if needed)
    this.animation = null;
    // Store if the element is closing
    this.isClosing = false;
    // Store if the element is expanding
    this.isExpanding = false;
    // Detect user clicks on the summary element
    this.summary.addEventListener('click', (e) => this.onClick(e));
  }

  onClick(e) {
    // Stop default behaviour from the browser
    e.preventDefault();
    // Add an overflow on the <details> to avoid content overflowing
    this.el.style.overflow = 'hidden';
    // Check if the element is being closed or is already closed
    if (this.isClosing || !this.el.open) {
      this.open();
    // Check if the element is being openned or is already open
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  }

  shrink() {
    // Set the element as "being closed"
    this.isClosing = true;
    
    // Store the current height of the element
    const startHeight = `${this.el.offsetHeight}px`;
    // Calculate the height of the summary
    const endHeight = `${this.summary.offsetHeight}px`;
    
    // If there is already an animation running
    if (this.animation) {
      // Cancel the current animation
      this.animation.cancel();
    }
    
    // Start a WAAPI animation
    this.animation = this.el.animate({
      // Set the keyframes from the startHeight to endHeight
      height: [startHeight, endHeight]
    }, {
      duration: 300,
      easing: 'ease-out'
    });
    
    // When the animation is complete, call onAnimationFinish()
    this.animation.onfinish = () => this.onAnimationFinish(false);
    // If the animation is cancelled, isClosing variable is set to false
    this.animation.oncancel = () => this.isClosing = false;
  }

  open() {
    // Apply a fixed height on the element
    this.el.style.height = `${this.el.offsetHeight}px`;
    // Force the [open] attribute on the details element
    this.el.open = true;
    // Wait for the next frame to call the expand function
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    // Set the element as "being expanding"
    this.isExpanding = true;
    // Get the current fixed height of the element
    const startHeight = `${this.el.offsetHeight}px`;
    // Calculate the open height of the element (summary height + content height)
    const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;
    
    // If there is already an animation running
    if (this.animation) {
      // Cancel the current animation
      this.animation.cancel();
    }
    
    // Start a WAAPI animation
    this.animation = this.el.animate({
      // Set the keyframes from the startHeight to endHeight
      height: [startHeight, endHeight]
    }, {
      duration: 300,
      easing: 'ease-out'
    });
    // When the animation is complete, call onAnimationFinish()
    this.animation.onfinish = () => this.onAnimationFinish(true);
    // If the animation is cancelled, isExpanding variable is set to false
    this.animation.oncancel = () => this.isExpanding = false;
  }

  onAnimationFinish(open) {
    // Set the open attribute based on the parameter
    this.el.open = open;
    // Clear the stored animation
    this.animation = null;
    // Reset isClosing & isExpanding
    this.isClosing = false;
    this.isExpanding = false;
    // Remove the overflow hidden and the fixed height
    this.el.style.height = this.el.style.overflow = '';
  }
}

document.querySelectorAll('details').forEach((el) => {
  new Accordion(el);
});