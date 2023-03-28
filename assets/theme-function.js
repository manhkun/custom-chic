$(document).ready(function(){
  $('.announcement-section').slick({
      slidesToShow: 1,
      autoplay: true,
      dots:false,
      arrow:false,
      autoplaySpeed: 5000,
  });
    
  var btn = $(".footer-block .heading-block");
  if($(window).width() < 768){
    // $('.footer-block .footer-block__details-content').slideUp(300);
    $('.footer-block .footer-block__details-content:not(.block-text)').slideUp();
    btn.on("click", function(e){
    e.preventDefault();
    
    var heading = $(this);
    
    if (heading.hasClass("active")) {
      $('.footer-block .heading-block.active + .footer-block__details-content:not(.block-text)').slideUp(300);
      heading.removeClass('active');
    } else {
      $('.footer-block .heading-block').removeClass('active');
      $('.footer-block .footer-block__details-content:not(.block-text)').slideUp(300);
      heading.addClass('active');
      $('.footer-block .heading-block.active + .footer-block__details-content:not(.block-text)').slideDown(300);
    }
  });
  }
  
  // Scroll to top 
  var btn = $('#scrollToTop');
  var btn2 = $('#checkout');
  var lastScrollTop = 0, delta = 5;
  var newsletter_height = $('#newsletter').height() || 0;
  var footerOffSet = $('footer').offset().top;
  $(window).scroll(function() {
    var newsletter_height = $('#newsletter').outerHeight() || 0;
    footerOffSets = $('footer').offset().top
    footerOffSet = $('footer').offset().top - newsletter_height;
    var nowScrollTop = $(this).scrollTop();
    if ((btn.offset().top + 52) >= footerOffSet) {
      btn.addClass('bg-black');
    } else {
      btn.removeClass('bg-black');
    }

    if (document.querySelector('#checkout')) {
      if ((btn2.offset().top + 52) >= footerOffSet) {
        btn2.addClass('bg-black');
      } else {
        btn2.removeClass('bg-black');
      }
    }
    if(Math.abs(lastScrollTop - nowScrollTop) >= delta){
      if (nowScrollTop > lastScrollTop){
        // SCROLLING DOWN 
        btn.removeClass('show');
      } else {
        // SCROLLING UP 
        if ($(window).scrollTop() > 300) {
          btn.addClass('show');
        } else {
          btn.removeClass('show');
        }
      }
      lastScrollTop = nowScrollTop;
    }
  });
  btn.on('click', function(e) {
    e.preventDefault();
    $('html, body').animate({scrollTop:0}, '300');
  });

  //share social
  var btnShare = $(".btn-popup-share");

  $('.popup-share').slideUp();
    btnShare.on("click", function(e){
    e.preventDefault();
    if (btnShare.hasClass("active")) {
      $('.popup-share').slideUp(300);
      btnShare.removeClass('active');
    } else {
      $('.footer-block .heading-block').removeClass('active');
      $('.popup-share').slideUp(300);
      btnShare.addClass('active');
      $('.popup-share').slideDown(300);
    }
  });

  // Copy url
  var $temp = $("<input>");
  var $url = $(location).attr('href');

  $('.list-social__item .clipboard').on('click', function(e) {
      e.preventDefault();
      $("body").append($temp);
      $temp.val($url).select();
      document.execCommand("copy");
      $temp.remove();
      $(".list-social__item.copy-item span").text("Copied!");
      $(".list-social__item.copy-item span").addClass("move");
  });

  //blog banner mobile
  var btnBlog = $(".menu-blog-top");
  $('.menu-blog-banner-mobile .menu-blog-bottom').slideUp();
  btnBlog.on("click", function(e) {

    if (btnBlog.hasClass("active")) {
      $('.menu-blog-banner-mobile .menu-blog-bottom').slideUp(300);
      btnBlog.removeClass('active');
    } else {
      $('.menu-blog-banner-mobile .menu-blog-bottom').slideUp(300);
      btnBlog.addClass('active');
      $('.menu-blog-banner-mobile .menu-blog-bottom').slideDown(300);
    }
  })
//datatab menu cate helpcenter
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
$('.tablist-section .tab-header ul li p:not(:first)').addClass('inactive');
$('.tab-main').hide();
$('.tab-main:first').show();
var c = getParameterByName('section');
$('p[data-handle="'+ c+'"]').ready(function() {
  $(document.querySelector('p[data-handle="'+ c+'"]')).trigger('click')
  });    
$('.tablist-section .tab-header ul li p').on('click', function(){
  var t = $(this).attr('id');
  if($(this).hasClass('inactive')){ 
    $('.tablist-section .tab-header ul li p').addClass('inactive');           
    $(this).removeClass('inactive');
    $('.tab-main').hide();
    $('#'+ t + 'Q').fadeIn('slow');
      window.history.pushState({}, '', '?section=' + $(this).attr('data-handle'))
  }
});

if($(window).width() < 768){
  //Tab contact us mobile
  $('.contact-main-head ul li:not(:first)').addClass('inactive');
  $('.contact-item').hide();
  $('.contact-item:first').show();
  $('.contact-main-head ul li').click(function(){
    var t = $(this).attr('id');
    if($(this).hasClass('inactive')){ 
      $('.contact-main-head ul li').addClass('inactive');           
      $(this).removeClass('inactive');
      $('.contact-item').hide();
      $('#'+ t + 'Q').fadeIn('slow');
    }
  });
}

if($(window).width() < 960){
  $(document).ready(function (){
    $("div.help-selected").on("click", function () {
        var hasActiveClass = $("div.help-select-box").hasClass("active");

        if (hasActiveClass === false) {
            var windowHeight = $(window).outerHeight();
            var dropdownPosition = $(this).offset().top;
            var dropdownHeight = 95; // dropdown height

            if (dropdownPosition + dropdownHeight + 50 > windowHeight) {
                $("div.help-select-box").addClass("drop-up");
            }
            else {
                $("div.help-select-box").removeClass("drop-up");
            }

            var currentUniversity = $(this).find('text').text().trim();

            $.each($("#title-list li"), function () {
                var university = $(this).text().trim();
                if (university === currentUniversity)
                    $(this).addClass("active");
                else
                    $(this).removeClass("active");
            });
        }

        $("div.help-select-box").toggleClass("active");
    });

    $("#title-list li").on("click", function () {
        var university = $(this).html();
        $("span.text").html(university);
        $(".help-select-box").removeClass("active");
    });

    $("#title-list li").hover(function () {
        $("#title-list li").removeClass("active");
    });

    $(document).click(function (event) {
       if ($(event.target).closest(".help-custom-select").length < 1) {
            $(".help-select-box").removeClass("active");
        }
    });
  });
}
  
const closestIndex = (num, arr) => {
   let curr = arr[0], diff = Math.abs(num - curr);
   let index = 0;
   for (let val = 0; val < arr.length; val++) {
      let newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
         diff = newdiff;
         curr = arr[val];
         index = val;
      };
   };
   return index;
};

//datatab post helpcenter
  // $('#title-list li:not(:first)').addClass('inactive');

  $('#title-list li:not(:first)').addClass('inactive');
  $('.tab-main-contentpost .content-item').hide();
  $('.tab-main-contentpost > .content-item:first-child').show();
  $('#title-list li').on('click', function(){
    var q = $(this).attr('data-post-content');
    if($(this).hasClass('inactive')){ 
      $(this).parent().find('li').addClass('inactive');
      $(this).removeClass('inactive');
      $('#'+ q ).parent().find('.content-item').hide();
      $('#'+ q ).show();
    }
  });

  //tab size guide

  
  $('#tabs li a:not(:first)').addClass('inactive');
  $('.size-popup').click(function(){
    $('.size-guide-section').removeClass('hidden');
    $('body').addClass('overflow-hidden');
  });
  $('.close-popup').click(function(){
    $('.size-guide-section').addClass('hidden');
    $('body').removeClass('overflow-hidden');
  });
  $('.close-popup-popup-cart').click(function(){
    $('.popup-image-cart-wrapper').removeClass('show');
  });
  $('#tabs li a').click(function(){
    var t = $(this).attr('id');
    $("#tab1Q").attr("data-id",t);
    
    if($('.size-chart').hasClass('show')){
      $('.size-chart').removeClass('show');
    }
    if(t == 'tab1'){
      $('.size-chart-tab1').addClass('show');
       $(".title-size p").html("Classic Tee");
    }else if (t == 'tab2'){
      $('.size-chart-tab2').addClass('show');
      $(".title-size p").html("Premium Tee");
    }else if (t == 'tab3'){
      $('.size-chart-tab3').addClass('show');
      $(".title-size p").html("Pullover Hoodie");
    }else{
      $('.size-chart-tab4').addClass('show');
      $(".title-size p").html("Sweatshirt");
    }
    if($(this).hasClass('inactive')){ //this is the start of our condition 
      $('#tabs li a').addClass('inactive');           
      $(this).removeClass('inactive');
    }
      $(".size-data").each(function(index) {
        switch($('.size-guide-section').attr('data-measure')) {
          case 'cm':
            $(this).html($(this).attr('data-cm'));
            break;
          case 'in':
            $(this).html($(this).attr('data-in'));
          default:
            $(this).html($(this).attr('data-cm'));      
          }
      });
  });
    $('.change-resize-cm').click(function(){
      $('.change-resize-in').removeClass('active');           
      $(this).addClass('active');
      $('.chest-waist-item span').html("cm");
      $('.size-guide-section').attr('data-measure', 'cm')
      $(".size-data").each(function(index) {
            $(this).html(parseFloat(parseFloat($(this).attr('data-in'))*2.54).toFixed(2)); 
      });
    });
  $('.change-resize-in').click(function(){
      $('.change-resize-cm').removeClass('active');           
      $(this).addClass('active');
      $('.chest-waist-item span').html("In");
      $('.size-guide-section').attr('data-measure', 'in')
      $(".size-data").each(function(index) {
            $(this).html($(this).attr('data-in'));    
      });
    });
    document.querySelector("#cal-submit-1").addEventListener("click", function () {
      var t = $(this).closest('#tab1Q').attr('data-id');
      console.log(t);
      
    var chest = document.getElementById('chest').value;
    var waist = document.getElementById('waist').value;
      switch($('.size-guide-section').attr('data-measure')) {
          case 'in':
            break;
          case 'cm':
            chest = parseFloat(chest)/2.54
            waist = parseFloat(waist)/2.54
          }
      if (chest >= 66 ||  chest < 36 || waist >= 38 | waist < 28) {
        document.getElementById("answer").innerHTML = "<p>Sorry, we don't stock products that match your size right now. We've made a note of this though, and we're working hard to create more sizes. Watch this space.</p>";
        return
      }

      function selected5XL () {
        document.getElementById("answer").innerHTML = "<p>WE THINK YOU'RE AN</p> <p>5XL</p>";
        $(".size-data").removeClass('selected')
        document.getElementById("size-15").classList.add('selected');
        document.getElementById("size-16").classList.add('selected');
      }

      function selected4XL () {
        $(".size-data").removeClass('selected')
        document.getElementById("answer").innerHTML = "<p>WE THINK YOU'RE AN</p> <p>4XL</p>";
        document.getElementById("size-13").classList.add('selected');
        document.getElementById("size-14").classList.add('selected');
      }

      function selected3XL () {
        document.getElementById("answer").innerHTML = "<p>WE THINK YOU'RE AN</p> <p>3XL</p>";
        $(".size-data").removeClass('selected')
        document.getElementById("size-11").classList.add('selected');
        document.getElementById("size-12").classList.add('selected');
      }

      function selected2XL () {
        document.getElementById("answer").innerHTML = "<p>WE THINK YOU'RE AN</p> <p>2XL</p>";
        $(".size-data").removeClass('selected')
        document.getElementById("size-9").classList.add('selected');
        document.getElementById("size-10").classList.add('selected');
      }

      function selectedXL () {
        document.getElementById("answer").innerHTML = "<p>WE THINK YOU'RE AN</p> <p>XL</p>";
        $(".size-data").removeClass('selected')
        document.getElementById("size-7").classList.add('selected');
        document.getElementById("size-8").classList.add('selected');
      }

      function selectedL () {
        document.getElementById("answer").innerHTML = "<p>WE THINK YOU'RE AN</p> <p>L</p>";
        $(".size-data").removeClass('selected')
        document.getElementById("size-5").classList.add('selected');
        document.getElementById("size-6").classList.add('selected');
      }

      function selectedM () {
        $(".size-data").removeClass('selected')
        document.getElementById("size-3").classList.add('selected');
        document.getElementById("size-4").classList.add('selected');
        document.getElementById("answer").innerHTML = "<p>WE THINK YOU'RE AN</p> <p>M</p>";
      }

      function selectedS () {
        $(".size-data").removeClass('selected')
        document.getElementById("answer").innerHTML = "<p>WE THINK YOU'RE AN</p> <p>S</p>";
        document.getElementById("size-1").classList.add('selected');
        document.getElementById("size-2").classList.add('selected');
      }
      
      if(chest >= 64 && waist >= 35 ){
        selected5XL()
      }else if (chest >= 60 && waist >= 34 ){
        if (chest == 60 && waist == 34) {
          selected4XL()
        } else {
          selected5XL()
        }
      }else if ( chest >= 56 && waist >= 33 ){
        if (chest == 56 && waist == 33) {
          selected3XL()
        } else {
          selected4XL()
        }
      }else if (  chest >= 52 && waist >= 32 ){
        if (chest == 52 && waist == 32) {
          selected2XL()
        } else {
          selected3XL()
        }
      }else if ( chest >= 48 && waist >= 31 ){
        if (chest == 48 && waist == 31) {
          selectedXL()
        } else {
          selected2XL()
        }
      }else if (  chest >= 44 && waist >= 30 ){
        if (chest == 44 && waist == 30) {
          selectedL()
        } else {
          selectedXL()
        }
      }else if ( chest >= 40 && waist >= 29 ){
        if (chest == 40 && waist == 29) {
          selectedM()
        } else {
          selectedL
        }
      }else if ( chest >= 36 && waist >= 28 ){
        if (chest == 36 && waist == 28) {
          selectedS()
        } else {
          selectedM()
        }
      }
  });




  //pagination
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
  const t = $('.jdgm-rev-widg').attr('data-number-of-reviews')
  if(t <= 0 ){
    $('.jdgm-rev-widg__sort-wrapper').addClass('hidden');
  }

});

// media product
$( ".slider-dots .grid__item" ).click(function(e) {
  e.preventDefault();
  if ($( ".slider-dots .grid__item" ).hasClass("selected")) {
    $( ".slider-dots .grid__item" ).removeClass('selected');
  }
  $(this).addClass('selected');
});

 var btn = $(".banner-blog-wrapper .blog-title-mb");
  if($(window).width() < 768){
    // $('.banner-blog-wrapper .menu-blog-list').slideUp(300);
    $('.banner-blog-wrapper .menu-blog-list:not(.block-text)').slideUp();
    btn.on("click", function(e){
    e.preventDefault();
    
    var heading = $(this);
    
    if (heading.hasClass("active")) {
      $('.banner-blog-wrapper .blog-title-mb.active + .menu-blog-list:not(.block-text)').slideUp(300);
      heading.removeClass('active');
    } else {
      $('.banner-blog-wrapper .blog-title-mb').removeClass('active');
      $('.banner-blog-wrapper .menu-blog-list:not(.block-text)').slideUp(300);
      heading.addClass('active');
      $('.banner-blog-wrapper .blog-title-mb.active + .menu-blog-list:not(.block-text)').slideDown(300);
    }
  });
  }