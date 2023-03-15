class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    $( ".filter-top-mobile .facets__display .facets__list li label input[type=radio]:checked" ).parents(".facet-checkbox-top").addClass('checked');
    $( ".filter-top-mobile .facets__display .facets__list li label input[type=radio]:checked" ).parents(".facets__list").addClass('active');
    $( ".facet-checkbox-top input[disabled]" ).parents(".list-menu__item").addClass('disabled');
    $( ".filter-desktop .facets__wrapper .list-menu__item:not(.facet-checkbox--disabled)" ).parents("details").removeClass('facet_checkbox-disabled');
    // $( ".mobile-facets__details .list-menu__item:not(.facet-checkbox--disabled)" ).parents("details").removeClass('facet_checkbox-disabled');
    

    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    if (!this.querySelector('price-range input').getAttribute("data-listener")) {
      this.bindEvents('form:not(#FacetFiltersFormMobile) price-range input, form:not(#FacetFiltersFormMobile) .facet-checkbox, .select-box .facet-checkbox, form:not(#FacetFiltersFormMobile) .facet-checkbox-top, form:not(#FacetFiltersFormMobile) .facet-submit')
    }
    this.setSortBy();
    
    this.querySelector('#toggle-filter')?.addEventListener('click', () => {
      document.querySelector('#toggle-filter').classList.toggle('active');
      document.querySelector('.collection-filter__wrapper').classList.toggle('active');
      document.querySelector('.collection').classList.toggle('active');
    });
    if(document.querySelector(".collection-filters__viewmode .icon-grid")){
      document.querySelector(".collection-filters__viewmode .icon-grid").addEventListener('click', () => {
        document.querySelector(".collection-filters__viewmode .icon-grid").classList.add("active");
        document.querySelector(".collection-filters__viewmode .icon-list").classList.remove("active");
        document.querySelector(".main-collection-product-grid").classList.remove("view-list");
        document.querySelectorAll(".card-wrapper").forEach((item) => {
          item.classList.add("product-grid");
          item.classList.remove("product-list");
        })
      })
    }
    if(document.querySelector(".collection-filters__viewmode .icon-list")){
      document.querySelector(".collection-filters__viewmode .icon-list").addEventListener('click', () => {
        document.querySelector(".collection-filters__viewmode .icon-grid").classList.remove("active");
        document.querySelector(".collection-filters__viewmode .icon-list").classList.add("active");
        document.querySelector(".main-collection-product-grid").classList.add("view-list");
        document.querySelectorAll(".card-wrapper").forEach((item) => {
          item.classList.add("product-list");
          item.classList.remove("product-grid");
        })
      })
    }
    if(document.querySelectorAll('.active-facets .active-facets-list .active-facets__button').length > 0) {
      document.querySelectorAll('.active-facets').forEach((show) => {
        show.style.display = 'flex';
      })
    } else {
      document.querySelectorAll('.active-facets').forEach((hide) => {
        hide.style.display = 'none';
      })
    }

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  bindEvents(selector) {        
    this.debounceSubmit = debounce((e) => {
      this.submitFilter(e)
    }, 500)
    document.querySelectorAll(selector).forEach((input) => {
      input.addEventListener('input', this.debounceSubmit.bind(this));
      input.setAttribute('data-listener', 'true')
    })
  }


  setSortBy() {
    $("div.selected").unbind("click")
    $("div.selected").on("click", function (e) {
        $("div.select-box").toggleClass("active");
        var hasActiveClass = $("div.select-box").hasClass("active");

        if (hasActiveClass === false) {
            var windowHeight = $(window).outerHeight();
            var dropdownPosition = $(this).offset().top;
            var dropdownHeight = 95; // dropdown height

            if (dropdownPosition + dropdownHeight + 50 > windowHeight) {
                $("div.select-box").addClass("drop-up");
            }
            else {
                $("div.select-box").removeClass("drop-up");
            }

            var currentUniversity = $(this).find('text').text().trim();

            $.each($("ul.select-list li"), function () {
                var university = $(this).text().trim();
                if (university === currentUniversity)
                    $(this).addClass("active");
                else
                    $(this).removeClass("active");
            });
        }

    });

    $("ul.select-list li").on("click", function () {
        var university = $(this).find('span').html();
        $("span.text").html(university);
        $("div.select-box").removeClass("active");
    });

    $("ul.select-list li").hover(function () {
        $("ul.select-list li").removeClass("active");
    });

    $(document).click(function (event) {
       if ($(event.target).closest("div.custom-select").length < 1) {
            $("div.select-box").removeClass("active");
        }
    });
  }

  async submitFilter(e) {
    await this.onSubmitHandler(e);
  
    this.bindEvents('.facet-checkbox')
    if(document.querySelector('.filter-mobile')) {
      document.querySelector('.filter-mobile').classList.remove('showfilter');
      document.querySelector('.filter-mobile .mobile-facets__disclosure').classList.remove('menu-opening');
      // document.querySelector('.filter-mobile .mobile-facets__disclosure').removeAttribute('open');
    }
    if(document.querySelector('.filter-top-mobile .active-facets__clear')) {
      document.querySelector('.filter-top-mobile .active-facets__clear').classList.remove('txt-inline');
    }
    
  }
  static checkDisabled() {
    document.querySelectorAll('.mobile-facets__details')?.forEach((ele) => {
      let checkDis = false;
      ele.querySelectorAll('.list-menu__item').forEach((item) => {
        if(!item.classList.contains('facet-checkbox--disabled')) {
          checkDis = true
        }
      })
      if(checkDis) {
        ele.classList.remove('facet_checkbox-disabled');
      } else {
        ele.classList.add('facet_checkbox-disabled');
      }
    })
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
      
    });
    document.body.classList.remove('overflow-hidden-mobile');

    if(document.querySelectorAll('.active-facets .active-facets-list .active-facets__button').length > 0) {
      document.querySelectorAll('.active-facets').forEach((show) => {
        show.style.display = 'flex';
      })
    } else {
      document.querySelectorAll('.active-facets').forEach((hide) => {
        hide.style.display = 'none';
      })
    }
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    document.getElementById('ProductGridContainer').querySelector('.collection')?.classList.add('loading');

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl) ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
      })
      .finally(() => {
        FacetFiltersForm.checkDisabled();
        var btnsidebar = $('.top-filter .button-filter-sidebar');
        var ftdesktop = $('.collection-wrapper');
        
        btnsidebar.on('click', function() {
          if(ftdesktop.hasClass("show")){
            ftdesktop.removeClass('show');
          }else{
            ftdesktop.addClass('show');
          };
          if ($(".button-filter-sidebar .button-label span").attr('data-show') == 'true') {
            $(".button-filter-sidebar .button-label span").text("Hide Filters");
            $(".button-filter-sidebar .button-label span").attr('data-show','false') ;
          } else {
            $(".button-filter-sidebar .button-label span").text("Show Filters");
            $(".button-filter-sidebar .button-label span").attr('data-show','true') ;
          }
        });
        $(document).ready(function (){
          $(".pa-selected").on("click", function () {
            var hasActiveClass = $("div.pa-select-box").hasClass("active");
      
            if (hasActiveClass === false) {
              var windowHeight = $(window).outerHeight();
              var dropdownPosition = $(this).offset().top;
              var dropdownHeight = 95; // dropdown height
      
              if (dropdownPosition + dropdownHeight + 50 > windowHeight) {
                  $(".pa-select-box").addClass("drop-up");
              }
              else {
                  $(".pa-select-box").removeClass("drop-up");
              }
      
              var currentUniversity = $(this).find('text').text().trim();
      
              $.each($(".pa-select-list li"), function () {
                var university = $(this).text().trim();
                if (university === currentUniversity)
                  $(this).addClass("active");
                else
                  $(this).removeClass("active");
              });
            }
            $(".pa-select-box").toggleClass("active");
          });
        
          $(".pa-select-list li").on("click", function () {
            var university = $(this).html();
            $("span.text").html(university);
            $(".pa-select-box").removeClass("active");
          });
        
          $(".pa-select-list li").hover(function () {
            $(".pa-select-list li").removeClass("active");
          });
        
          $(document).click(function (event) {
            if ($(event.target).closest(".pa-custom-select").length < 1) {
              $(".pa-select-box").removeClass("active");
            }
          });
        });
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    $(document).ready(function (){
      FacetFiltersForm.checkDisabled();
      this.querySelectorAll('.mobile-facets__details')?.forEach((ele) => {
        ele.querySelectorAll('.list-menu_item').forEach((item) => {
          if(!item.classList.contains('facet-checkbox--disabled')) {
            ele.classList.remove('facet_checkbox-disabled')
          }
        })
      })
    $(".pa-selected").on("click", function () {
      var hasActiveClass = $("div.pa-select-box").hasClass("active");

      if (hasActiveClass === false) {
        var windowHeight = $(window).outerHeight();
        var dropdownPosition = $(this).offset().top;
        var dropdownHeight = 95; // dropdown height

        if (dropdownPosition + dropdownHeight + 50 > windowHeight) {
            $(".pa-select-box").addClass("drop-up");
        }
        else {
            $(".pa-select-box").removeClass("drop-up");
        }

        var currentUniversity = $(this).find('text').text().trim();

        $.each($(".pa-select-list li"), function () {
          var university = $(this).text().trim();
          if (university === currentUniversity)
            $(this).addClass("active");
          else
            $(this).removeClass("active");
        });
      }
      $(".pa-select-box").toggleClass("active");
    });
  
    $(".pa-select-list li").on("click", function () {
      var university = $(this).html();
      $("span.text").html(university);
      $(".pa-select-box").removeClass("active");
    });
  
    $(".pa-select-list li").hover(function () {
      $(".pa-select-list li").removeClass("active");
    });
  
    $(document).click(function (event) {
      if ($(event.target).closest(".pa-custom-select").length < 1) {
        $(".pa-select-box").removeClass("active");
      }
    });
  });
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
    document.querySelector('.collection').classList.remove('loading');
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));


    facetsToRender.forEach((element) => {
      if(document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`)) {
        document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
      }
    });
    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);


  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  async onSubmitHandler(event) {
    event.preventDefault();
    
    var formData
    if (event.target.getAttribute("form") == "FacetFiltersFormMobile") {
      formData = new FormData(document.querySelector('#FacetFiltersFormMobile'))
    } else {
      this.form = event.target.closest('form') || document.querySelector('#FacetFiltersForm');
      console.log(event.target.closest('form'), this.form, event.target)
      formData = new FormData(this.form);
      if (event.target.name == "sort_by") formData.append("sort_by", event.target.value)
    }
    if (!formData.has('sort_by')) {
      formData.append("sort_by", document.querySelector('input[name="sort_by"]:checked').value)
    }
    const searchParams = new URLSearchParams(formData).toString();
    await FacetFiltersForm.renderPage(searchParams, event);
    
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.inputs = this.querySelectorAll('input');
    this.querySelectorAll('.min').forEach((min => {min.innerHTML = this.inputs[0].value;}));
    this.querySelectorAll('.max').forEach((max => {max.innerHTML = this.inputs[1].value;}));
    this.inputs.forEach(element => element.addEventListener('input', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
    this.querySelectorAll('.min').forEach((min => {min.innerHTML = this.inputs[0].value;}));
    this.querySelectorAll('.max').forEach((max => {max.innerHTML = this.inputs[1].value;}));
  }

  setMinAndMaxValues() {
    var minInput = this.inputs[0].value;
    var maxInput = this.inputs[1].value;
    var max = Number(this.inputs[1].getAttribute('max'));
    var minWidth = minInput / max * 100;
    var width = maxInput / max * 100;
    var widthMinIput = 'calc(' + width + '% + ' + (100 - width)*10/100 + 'px)';
    this.inputs[0].setAttribute('max', maxInput);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
    this.inputs[0].style.width = widthMinIput;
    if(this.querySelector('.blackline')) {
      var widthline = 'calc(' + (width - minInput / max * 100) + '% - ' + (20 - 20*(100 - (width - minWidth))/100) + 'px)';
      this.querySelector('.blackline').style.width = widthline;
      this.querySelector('.blackline').style.left = 'calc(' +  (minInput) / max * 100 + '% + ' + (10 - 10*(100 - (width - minWidth))/100) + 'px)';
    }
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));
    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    this.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();
      const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
      form.onActiveFilterClick(event);
      event.target?.classList?.add("active");
    });
  }
}

customElements.define('facet-remove', FacetRemove);

