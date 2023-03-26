$(document).ready(function(){
    //open sidebar filter
    var filterBtn = $('.mobile-facets__open');
    var filtermb= $('.filter-mobile')
    var closefiltermb= $('.sidebar-filter-mb .btn-close')
    var submitmb = $('.sidebar-filter-mb .facet-submit')
    var faceFilterForm = $('facet-filters-form')

    faceFilterForm.on('click', function (e) {
      e.stopPropagation()
    })

    filterBtn.on('click', function(e) {
      filtermb.addClass('showfilter');
      $('body').addClass('overflow-hidden-filter-mobile');
      document.querySelector('.filter-mobile .mobile-facets__disclosure').setAttribute('open', true);
    });
    closefiltermb.on('click', function(e) {
      $('body').removeClass('overflow-hidden-filter-mobile');
    });
    submitmb.on('click', function(e) {
      $('body').removeClass('overflow-hidden-filter-mobile');
    });

    var btnClose = $('.btn-close');
    btnClose.on('click', function(e) {
        filtermb.removeClass('showfilter');
        document.querySelector('.filter-mobile .mobile-facets__disclosure').classList.remove('menu-opening'); 
        document.querySelector('.filter-mobile .mobile-facets__disclosure').removeAttribute('open');
        document.querySelector('body').classList.remove('overflow-hidden-tablet');
    });

    var btnCloses = $('.facet-submit');
    btnCloses.on('click', function(e) {
        filtermb.removeClass('showfilter');
    });
    // document.querySelector('body').classList.add('overflow-hidden-tablet');
    // Show hide sidebar left
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

    var btnFilterTop = $('.active-facets__clear');
    var btnFilterTop2 = $('.filter-top-mobile .facets__display .facets__list li');
    btnFilterTop.on('click', function() {
      btnFilterTop.addClass('show');
    });

    btnFilterTop2.on('click', function() {
      if(btnFilterTop.hasClass("show")){
        btnFilterTop.removeClass('show');
      }
    })
// fixed collections page
    if($(window).width() < 1024){
        $(window).scroll(function(){  
          if ($(window).scrollTop() >= 20) {
            $('.section-header').addClass('ohio');
          }else {
              $('.section-header').removeClass('ohio');
              $('.section-header').removeClass('shopify-section-header-hidden');
              document.body.classList.remove('header-hidden')
              
          }
          if ($(window).scrollTop() >= 54) {
              $('.filter-mobile').addClass('fixed');
              $('.header-mobile-bttom ').addClass('background');
          }else {
              $('.filter-mobile').removeClass('fixed');
              $('.header-mobile-bttom ').removeClass('background');
          }
      });
    }
    

});