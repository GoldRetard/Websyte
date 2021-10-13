/*
 * jQuery FlexSlider v2.7.1
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */
;
(function ($) {

  var focused = true;

  //FlexSlider: Object Instance
  $.flexslider = function(el, options) {
    var slider = $(el);

    // making variables public

    //if rtl value was not passed and html is in rtl..enable it by default.
    if(typeof options.rtl=='undefined' && $('html').attr('dir')=='rtl'){
      options.rtl=true;
    }
    slider.vars = $.extend({}, $.flexslider.defaults, options);

    var namespace = slider.vars.namespace,
        msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
        touch = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
        // deprecating this idea, as devices are being released with both of these events
        eventType = "click touchend MSPointerUp keyup",
        watchedEvent = "",
        watchedEventClearTimer,
        vertical = slider.vars.direction === "vertical",
        reverse = slider.vars.reverse,
        carousel = (slider.vars.itemWidth > 0),
        fade = slider.vars.animation === "fade",
        asNav = slider.vars.asNavFor !== "",
        methods = {};

    // Store a reference to the slider object
    $.data(el, "flexslider", slider);

    // Private slider methods
    methods = {
      init: function() {
        slider.animating = false;
        // Get current slide and make sure it is a number
        slider.currentSlide = parseInt( ( slider.vars.startAt ? slider.vars.startAt : 0), 10 );
        if ( isNaN( slider.currentSlide ) ) { slider.currentSlide = 0; }
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
        slider.containerSelector = slider.vars.selector.substr(0,slider.vars.selector.search(' '));
        slider.slides = $(slider.vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SYNC:
        slider.syncExists = $(slider.vars.sync).length > 0;
        // SLIDE:
        if (slider.vars.animation === "slide") { slider.vars.animation = "swing"; }
        slider.prop = (vertical) ? "top" : ( slider.vars.rtl ? "marginRight" : "marginLeft" );
        slider.args = {};
        // SLIDESHOW:
        slider.manualPause = false;
        slider.stopped = false;
        //PAUSE WHEN INVISIBLE
        slider.started = false;
        slider.startTimeout = null;
        // TOUCH/USECSS:
        slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function() {
          var obj = document.createElement('div'),
              props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
          for (var i in props) {
            if ( obj.style[ props[i] ] !== undefined ) {
              slider.pfx = props[i].replace('Perspective','').toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        }());
        slider.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        slider.ensureAnimationEnd = '';
        // CONTROLSCONTAINER:
        if (slider.vars.controlsContainer !== "") slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
        // MANUAL:
        if (slider.vars.manualControls !== "") slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);

        // CUSTOM DIRECTION NAV:
        if (slider.vars.customDirectionNav !== "") slider.customDirectionNav = $(slider.vars.customDirectionNav).length === 2 && $(slider.vars.customDirectionNav);

        // RANDOMIZE:
        if (slider.vars.randomize) {
          slider.slides.sort(function() { return (Math.round(Math.random())-0.5); });
          slider.container.empty().append(slider.slides);
        }

        slider.doMath();

        // INIT
        slider.setup("init");

        // CONTROLNAV:
        if (slider.vars.controlNav) { methods.controlNav.setup(); }

        // DIRECTIONNAV:
        if (slider.vars.directionNav) { methods.directionNav.setup(); }

        // KEYBOARD:
        if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
          $(document).bind('keyup', function(event) {
            var keycode = event.keyCode;
            if (!slider.animating && (keycode === 39 || keycode === 37)) {
              var target = (slider.vars.rtl?
                                ((keycode === 37) ? slider.getTarget('next') :
                                (keycode === 39) ? slider.getTarget('prev') : false)
                                :
                                ((keycode === 39) ? slider.getTarget('next') :
                                (keycode === 37) ? slider.getTarget('prev') : false)
                                )
                                ;
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
          });
        }
        // MOUSEWHEEL:
        if (slider.vars.mousewheel) {
          slider.bind('mousewheel', function(event, delta, deltaX, deltaY) {
            event.preventDefault();
            var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, slider.vars.pauseOnAction);
          });
        }

        // PAUSEPLAY
        if (slider.vars.pausePlay) { methods.pausePlay.setup(); }

        //PAUSE WHEN INVISIBLE
        if (slider.vars.slideshow && slider.vars.pauseInvisible) { methods.pauseInvisible.init(); }

        // SLIDSESHOW
        if (slider.vars.slideshow) {
          if (slider.vars.pauseOnHover) {
            slider.hover(function() {
              if (!slider.manualPlay && !slider.manualPause) { slider.pause(); }
            }, function() {
              if (!slider.manualPause && !slider.manualPlay && !slider.stopped) { slider.play(); }
            });
          }
          // initialize animation
          //If we're visible, or we don't use PageVisibility API
          if(!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
            (slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
          }
        }

        // ASNAV:
        if (asNav) { methods.asNav.setup(); }

        // TOUCH
        if (touch && slider.vars.touch) { methods.touch(); }

        // FADE&&SMOOTHHEIGHT || SLIDE:
        if (!fade || (fade && slider.vars.smoothHeight)) { $(window).bind("resize orientationchange focus", methods.resize); }

        slider.find("img").attr("draggable", "false");

        // API: start() Callback
        setTimeout(function(){
          slider.vars.start(slider);
        }, 200);
      },
      asNav: {
        setup: function() {
          slider.asNav = true;
          slider.animatingTo = Math.floor(slider.currentSlide/slider.move);
          slider.currentItem = slider.currentSlide;
          slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
          if(!msGesture){
              slider.slides.on(eventType, function(e){
                e.preventDefault();
                var $slide = $(this),
                    target = $slide.index();
                var posFromX;
                if(slider.vars.rtl){
                  posFromX = -1*($slide.offset().right - $(slider).scrollLeft()); // Find position of slide relative to right of slider container
                }
                else
                {
                  posFromX = $slide.offset().left - $(slider).scrollLeft(); // Find position of slide relative to left of slider container
                }
                if( posFromX <= 0 && $slide.hasClass( namespace + 'active-slide' ) ) {
                  slider.flexAnimate(slider.getTarget("prev"), true);
                } else if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass(namespace + "active-slide")) {
                  slider.direction = (slider.currentItem < target) ? "next" : "prev";
                  slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                }
              });
          }else{
              el._slider = slider;
              slider.slides.each(function (){
                  var that = this;
                  that._gesture = new MSGesture();
                  that._gesture.target = that;
                  that.addEventListener("MSPointerDown", function (e){
                      e.preventDefault();
                      if(e.currentTarget._gesture) {
                        e.currentTarget._gesture.addPointer(e.pointerId);
                      }
                  }, false);
                  that.addEventListener("MSGestureTap", function (e){
                      e.preventDefault();
                      var $slide = $(this),
                          target = $slide.index();
                      if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
                          slider.direction = (slider.currentItem < target) ? "next" : "prev";
                          slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                      }
                  });
              });
          }
        }
      },
      controlNav: {
        setup: function() {
          if (!slider.manualControls) {
            methods.controlNav.setupPaging();
          } else { // MANUALCONTROLS:
            methods.controlNav.setupManual();
          }
        },
        setupPaging: function() {
          var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
              j = 1,
              item,
              slide;

          slider.controlNavScaffold = $('<ol class="'+ namespace + 'control-nav ' + namespace + type + '"></ol>');

          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              slide = slider.slides.eq(i);
              if ( undefined === slide.attr( 'data-thumb-alt' ) ) { slide.attr( 'data-thumb-alt', '' ); }
              var altText = ( '' !== slide.attr( 'data-thumb-alt' ) ) ? altText = ' alt="' + slide.attr( 'data-thumb-alt' ) + '"' : '';
              item = (slider.vars.controlNav === "thumbnails") ? '<img src="' + slide.attr( 'data-thumb' ) + '"' + altText + '/>' : '<a href="#">' + j + '</a>';
              if ( 'thumbnails' === slider.vars.controlNav && true === slider.vars.thumbCaptions ) {
                var captn = slide.attr( 'data-thumbcaption' );
                if ( '' !== captn && undefined !== captn ) { item += '<span class="' + namespace + 'caption">' + captn + '</span>'; }
              }
              slider.controlNavScaffold.append('<li>' + item + '</li>');
              j++;
            }
          }

          // CONTROLSCONTAINER:
          (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
          methods.controlNav.set();

          methods.controlNav.active();

          slider.controlNavScaffold.delegate('a, img', eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();

          });
        },
        setupManual: function() {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();

          slider.controlNav.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                  target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        set: function() {
          var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
          slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
        },
        active: function() {
          slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
        },
        update: function(action, pos) {
          if (slider.pagingCount > 1 && action === "add") {
            slider.controlNavScaffold.append($('<li><a href="#">' + slider.count + '</a></li>'));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find('li').remove();
          } else {
            slider.controlNav.eq(pos).closest('li').remove();
          }
          methods.controlNav.set();
          (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
        }
      },
      directionNav: {
        setup: function() {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li class="' + namespace + 'nav-prev"><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li class="' + namespace + 'nav-next"><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

          // CUSTOM DIRECTION NAV:
          if (slider.customDirectionNav) {
            slider.directionNav = slider.customDirectionNav;
          // CONTROLSCONTAINER:
          } else if (slider.controlsContainer) {
            $(slider.controlsContainer).append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
          } else {
            slider.append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
          }

          methods.directionNav.update();

          slider.directionNav.bind(eventType, function(event) {
            event.preventDefault();
            var target;

            if (watchedEvent === "" || watchedEvent === event.type) {
              target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function() {
          var disabledClass = namespace + 'disabled';
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
          } else if (!slider.vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
            } else {
              slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
            }
          } else {
            slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
          }
        }
      },
      pausePlay: {
        setup: function() {
          var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a href="#"></a></div>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
          } else {
            slider.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
          }

          methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

          slider.pausePlay.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              if ($(this).hasClass(namespace + 'pause')) {
                slider.manualPause = true;
                slider.manualPlay = false;
                slider.pause();
              } else {
                slider.manualPause = false;
                slider.manualPlay = true;
                slider.play();
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function(state) {
          (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
        }
      },
      touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          onTouchStart,
          onTouchMove,
          onTouchEnd,
          scrolling = false,
          localX = 0,
          localY = 0,
          accDx = 0;

        if(!msGesture){
            onTouchStart = function(e) {
              if (slider.animating) {
                e.preventDefault();
              } else if ( ( window.navigator.msPointerEnabled ) || e.touches.length === 1 ) {
                slider.pause();
                // CAROUSEL:
                cwidth = (vertical) ? slider.h : slider. w;
                startT = Number(new Date());
                // CAROUSEL:

                // Local vars for X and Y points.
                localX = e.touches[0].pageX;
                localY = e.touches[0].pageY;

                offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                         (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                         (carousel && slider.currentSlide === slider.last) ? slider.limit :
                         (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                         (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                startX = (vertical) ? localY : localX;
                startY = (vertical) ? localX : localY;
                el.addEventListener('touchmove', onTouchMove, false);
                el.addEventListener('touchend', onTouchEnd, false);
              }
            };

            onTouchMove = function(e) {
              // Local vars for X and Y points.

              localX = e.touches[0].pageX;
              localY = e.touches[0].pageY;

              dx = (vertical) ? startX - localY : (slider.vars.rtl?-1:1)*(startX - localX);
              scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));
              var fxms = 500;

              if ( ! scrolling || Number( new Date() ) - startT > fxms ) {
                e.preventDefault();
                if (!fade && slider.transitions) {
                  if (!slider.vars.animationLoop) {
                    dx = dx/((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx)/cwidth+2) : 1);
                  }
                  slider.setProps(offset + dx, "setTouch");
                }
              }
            };

            onTouchEnd = function(e) {
              // finish the touch by undoing the touch session
              el.removeEventListener('touchmove', onTouchMove, false);

              if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                var updateDx = (reverse) ? -dx : dx,
                    target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                  slider.flexAnimate(target, slider.vars.pauseOnAction);
                } else {
                  if (!fade) { slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true); }
                }
              }
              el.removeEventListener('touchend', onTouchEnd, false);

              startX = null;
              startY = null;
              dx = null;
              offset = null;
            };

            el.addEventListener('touchstart', onTouchStart, false);
        }else{
            el.style.msTouchAction = "none";
            el._gesture = new MSGesture();
            el._gesture.target = el;
            el.addEventListener("MSPointerDown", onMSPointerDown, false);
            el._slider = slider;
            el.addEventListener("MSGestureChange", onMSGestureChange, false);
            el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

            function onMSPointerDown(e){
                e.stopPropagation();
                if (slider.animating) {
                    e.preventDefault();
                }else{
                    slider.pause();
                    el._gesture.addPointer(e.pointerId);
                    accDx = 0;
                    cwidth = (vertical) ? slider.h : slider. w;
                    startT = Number(new Date());
                    // CAROUSEL:

                    offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                        (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                            (carousel && slider.currentSlide === slider.last) ? slider.limit :
                                (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                                    (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                }
            }

            function onMSGestureChange(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                var transX = -e.translationX,
                    transY = -e.translationY;

                //Accumulate translations.
                accDx = accDx + ((vertical) ? transY : transX);
                dx = (slider.vars.rtl?-1:1)*accDx;
                scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

                if(e.detail === e.MSGESTURE_FLAG_INERTIA){
                    setImmediate(function (){
                        el._gesture.stop();
                    });

                    return;
                }

                if (!scrolling || Number(new Date()) - startT > 500) {
                    e.preventDefault();
                    if (!fade && slider.transitions) {
                        if (!slider.vars.animationLoop) {
                            dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
                        }
                        slider.setProps(offset + dx, "setTouch");
                    }
                }
            }

            function onMSGestureEnd(e) {
                e.stopPropagation();
                var slider = e.target._slider;
                if(!slider){
                    return;
                }
                if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                    var updateDx = (reverse) ? -dx : dx,
                        target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                    if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth/2)) {
                        slider.flexAnimate(target, slider.vars.pauseOnAction);
                    } else {
                        if (!fade) { slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true); }
                    }
                }

                startX = null;
                startY = null;
                dx = null;
                offset = null;
                accDx = 0;
            }
        }
      },
      resize: function() {
        if (!slider.animating && slider.is(':visible')) {
          if (!carousel) { slider.doMath(); }

          if (fade) {
            // SMOOTH HEIGHT:
            methods.smoothHeight();
          } else if (carousel) { //CAROUSEL:
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          }
          else if (vertical) { //VERTICAL:
            slider.viewport.height(slider.h);
            slider.setProps(slider.h, "setTotal");
          } else {
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) { methods.smoothHeight(); }
            slider.newSlides.width(slider.computedW);
            slider.setProps(slider.computedW, "setTotal");
          }
        }
      },
      smoothHeight: function(dur) {
        if (!vertical || fade) {
          var $obj = (fade) ? slider : slider.viewport;
          (dur) ? $obj.animate({"height": slider.slides.eq(slider.animatingTo).innerHeight()}, dur) : $obj.innerHeight(slider.slides.eq(slider.animatingTo).innerHeight());
        }
      },
      sync: function(action) {
        var $obj = $(slider.vars.sync).data("flexslider"),
            target = slider.animatingTo;

        switch (action) {
          case "animate": $obj.flexAnimate(target, slider.vars.pauseOnAction, false, true); break;
          case "play": if (!$obj.playing && !$obj.asNav) { $obj.play(); } break;
          case "pause": $obj.pause(); break;
        }
      },
      uniqueID: function($clone) {
        // Append _clone to current level and children elements with id attributes
        $clone.filter( '[id]' ).add($clone.find( '[id]' )).each(function() {
          var $this = $(this);
          $this.attr( 'id', $this.attr( 'id' ) + '_clone' );
        });
        return $clone;
      },
      pauseInvisible: {
        visProp: null,
        init: function() {
          var visProp = methods.pauseInvisible.getHiddenProp();
          if (visProp) {
            var evtname = visProp.replace(/[H|h]idden/,'') + 'visibilitychange';
            document.addEventListener(evtname, function() {
              if (methods.pauseInvisible.isHidden()) {
                if(slider.startTimeout) {
                  clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
                } else {
                  slider.pause(); //Or just pause
                }
              }
              else {
                if(slider.started) {
                  slider.play(); //Initiated before, just play
                } else {
                  if (slider.vars.initDelay > 0) {
                    setTimeout(slider.play, slider.vars.initDelay);
                  } else {
                    slider.play(); //Didn't init before: simply init or wait for it
                  }
                }
              }
            });
          }
        },
        isHidden: function() {
          var prop = methods.pauseInvisible.getHiddenProp();
          if (!prop) {
            return false;
          }
          return document[prop];
        },
        getHiddenProp: function() {
          var prefixes = ['webkit','moz','ms','o'];
          // if 'hidden' is natively supported just return it
          if ('hidden' in document) {
            return 'hidden';
          }
          // otherwise loop over all the known prefixes until we find one
          for ( var i = 0; i < prefixes.length; i++ ) {
              if ((prefixes[i] + 'Hidden') in document) {
                return prefixes[i] + 'Hidden';
              }
          }
          // otherwise it's not supported
          return null;
        }
      },
      setToClearWatchedEvent: function() {
        clearTimeout(watchedEventClearTimer);
        watchedEventClearTimer = setTimeout(function() {
          watchedEvent = "";
        }, 3000);
      }
    };

    // public methods
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      if (!slider.vars.animationLoop && target !== slider.currentSlide) {
        slider.direction = (target > slider.currentSlide) ? "next" : "prev";
      }

      if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
        if (asNav && withSync) {
          var master = $(slider.vars.asNavFor).data('flexslider');
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = (slider.currentItem < target) ? "next" : "prev";
          master.direction = slider.direction;

          if (Math.ceil((target + 1)/slider.visible) - 1 !== slider.currentSlide && target !== 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            target = Math.floor(target/slider.visible);
          } else {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            return false;
          }
        }

        slider.animating = true;
        slider.animatingTo = target;

        // SLIDESHOW:
        if (pause) { slider.pause(); }

        // API: before() animation Callback
        slider.vars.before(slider);

        // SYNC:
        if (slider.syncExists && !fromNav) { methods.sync("animate"); }

        // CONTROLNAV
        if (slider.vars.controlNav) { methods.controlNav.active(); }

        // !CAROUSEL:
        // CANDIDATE: slide active class (for add/remove slide)
        if (!carousel) { slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide'); }

        // INFINITE LOOP:
        // CANDIDATE: atEnd
        slider.atEnd = target === 0 || target === slider.last;

        // DIRECTIONNAV:
        if (slider.vars.directionNav) { methods.directionNav.update(); }

        if (target === slider.last) {
          // API: end() of cycle Callback
          slider.vars.end(slider);
          // SLIDESHOW && !INFINITE LOOP:
          if (!slider.vars.animationLoop) { slider.pause(); }
        }

        // SLIDE:
        if (!fade) {
          var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
              margin, slideString, calcNext;

          // INFINITE LOOP / REVERSE:
          if (carousel) {
            margin = slider.vars.itemMargin;
            calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
            slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
          } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
            slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
          } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
            slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
          } else {
            slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
          }
          slider.setProps(slideString, "", slider.vars.animationSpeed);
          if (slider.transitions) {
            if (!slider.vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }

            // Unbind previous transitionEnd events and re-bind new transitionEnd event
            slider.container.unbind("webkitTransitionEnd transitionend");
            slider.container.bind("webkitTransitionEnd transitionend", function() {
              clearTimeout(slider.ensureAnimationEnd);
              slider.wrapup(dimension);
            });

            // Insurance for the ever-so-fickle transitionEnd event
            clearTimeout(slider.ensureAnimationEnd);
            slider.ensureAnimationEnd = setTimeout(function() {
              slider.wrapup(dimension);
            }, slider.vars.animationSpeed + 100);

          } else {
            slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function(){
              slider.wrapup(dimension);
            });
          }
        } else { // FADE:
          if (!touch) {
            slider.slides.eq(slider.currentSlide).css({"zIndex": 1}).animate({"opacity": 0}, slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.eq(target).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);
          } else {
            slider.slides.eq(slider.currentSlide).css({ "opacity": 0, "zIndex": 1 });
            slider.slides.eq(target).css({ "opacity": 1, "zIndex": 2 });
            slider.wrapup(dimension);
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) { methods.smoothHeight(slider.vars.animationSpeed); }
      }
    };
    slider.wrapup = function(dimension) {
      // SLIDE:
      if (!fade && !carousel) {
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpEnd");
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpStart");
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      // API: after() animation Callback
      slider.vars.after(slider);
    };

    // SLIDESHOW:
    slider.animateSlides = function() {
      if (!slider.animating && focused ) { slider.flexAnimate(slider.getTarget("next")); }
    };
    // SLIDESHOW:
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      slider.animatedSlides = null;
      slider.playing = false;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) { methods.pausePlay.update("play"); }
      // SYNC:
      if (slider.syncExists) { methods.sync("pause"); }
    };
    // SLIDESHOW:
    slider.play = function() {
      if (slider.playing) { clearInterval(slider.animatedSlides); }
      slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      slider.started = slider.playing = true;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) { methods.pausePlay.update("pause"); }
      // SYNC:
      if (slider.syncExists) { methods.sync("play"); }
    };
    // STOP:
    slider.stop = function () {
      slider.pause();
      slider.stopped = true;
    };
    slider.canAdvance = function(target, fromNav) {
      // ASNAV:
      var last = (asNav) ? slider.pagingCount - 1 : slider.last;
      return (fromNav) ? true :
             (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
             (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
             (target === slider.currentSlide && !asNav) ? false :
             (slider.vars.animationLoop) ? true :
             (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
             (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
             true;
    };
    slider.getTarget = function(dir) {
      slider.direction = dir;
      if (dir === "next") {
        return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
      }
    };

    // SLIDE:
    slider.setProps = function(pos, special, dur) {
      var target = (function() {
        var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
            posCalc = (function() {
              if (carousel) {
                return (special === "setTouch") ? pos :
                       (reverse && slider.animatingTo === slider.last) ? 0 :
                       (reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                       (slider.animatingTo === slider.last) ? slider.limit : posCheck;
              } else {
                switch (special) {
                  case "setTotal": return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                  case "setTouch": return (reverse) ? pos : pos;
                  case "jumpEnd": return (reverse) ? pos : slider.count * pos;
                  case "jumpStart": return (reverse) ? slider.count * pos : pos;
                  default: return pos;
                }
              }
            }());

            return (posCalc * ((slider.vars.rtl)?1:-1)) + "px";
          }());

      if (slider.transitions) {
        if (slider.isFirefox) {
          target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + (parseInt(target)+'px') + ",0,0)";
        } else {
          target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + ((slider.vars.rtl?-1:1)*parseInt(target)+'px') + ",0,0)";
        }
        dur = (dur !== undefined) ? (dur/1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", dur);
         slider.container.css("transition-duration", dur);
      }

      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) { slider.container.css(slider.args); }

      slider.container.css('transform',target);
    };

    slider.setup = function(type) {
      // SLIDE:
      if (!fade) {
        var sliderOffset, arr;

        if (type === "init") {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({"overflow": "hidden", "position": "relative"}).appendTo(slider).append(slider.container);
          // INFINITE LOOP:
          slider.cloneCount = 0;
          slider.cloneOffset = 0;
          // REVERSE:
          if (reverse) {
            arr = $.makeArray(slider.slides).reverse();
            slider.slides = $(arr);
            slider.container.empty().append(slider.slides);
          }
        }
        // INFINITE LOOP && !CAROUSEL:
        if (slider.vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          // clear out old clones
          if (type !== "init") { slider.container.find('.clone').remove(); }
          slider.container.append(methods.uniqueID(slider.slides.first().clone().addClass('clone')).attr('aria-hidden', 'true'))
                          .prepend(methods.uniqueID(slider.slides.last().clone().addClass('clone')).attr('aria-hidden', 'true'));
        }
        slider.newSlides = $(slider.vars.selector, slider);

        sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
        // VERTICAL:
        if (vertical && !carousel) {
          slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
          setTimeout(function(){
            slider.newSlides.css({"display": "block"});
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, "init");
          }, (type === "init") ? 100 : 0);
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
          slider.setProps(sliderOffset * slider.computedW, "init");
          setTimeout(function(){
            slider.doMath();
          if(slider.vars.rtl){
            if (slider.isFirefox) {
              slider.newSlides.css({"width": slider.computedW, "marginRight" : slider.computedM, "float": "right", "display": "block"});
            } else {
              slider.newSlides.css({"width": slider.computedW, "marginRight" : slider.computedM, "float": "left", "display": "block"});
            }
              
           }
            else{
              slider.newSlides.css({"width": slider.computedW, "marginRight" : slider.computedM, "float": "left", "display": "block"});
            }
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) { methods.smoothHeight(); }
          }, (type === "init") ? 100 : 0);
        }
      } else { // FADE:
        if(slider.vars.rtl){
          slider.slides.css({"width": "100%", "float": 'right', "marginLeft": "-100%", "position": "relative"});
        }
        else{
          slider.slides.css({"width": "100%", "float": 'left', "marginRight": "-100%", "position": "relative"});
        }
        if (type === "init") {
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeIn(slider.vars.animationSpeed, slider.vars.easing);
            if (slider.vars.fadeFirstSlide == false) {
              slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({"zIndex": 2}).css({"opacity": 1});
            } else {
              slider.slides.css({ "opacity": 0, "display": "block", "zIndex": 1 }).eq(slider.currentSlide).css({"zIndex": 2}).animate({"opacity": 1},slider.vars.animationSpeed,slider.vars.easing);
            }
          } else {
            slider.slides.css({ "opacity": 0, "display": "block", "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease", "zIndex": 1 }).eq(slider.currentSlide).css({ "opacity": 1, "zIndex": 2});
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) { methods.smoothHeight(); }
      }
      // !CAROUSEL:
      // CANDIDATE: active slide
      if (!carousel) { slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide"); }

      //FlexSlider: init() Callback
      slider.vars.init(slider);
    };

    slider.doMath = function() {
      var slide = slider.slides.first(),
          slideMargin = slider.vars.itemMargin,
          minItems = slider.vars.minItems,
          maxItems = slider.vars.maxItems;

      slider.w = (slider.viewport===undefined) ? slider.width() : slider.viewport.width();
      if (slider.isFirefox) { slider.w = slider.width(); }
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();

      // CAROUSEL:
      if (carousel) {
        slider.itemT = slider.vars.itemWidth + slideMargin;
        slider.itemM = slideMargin;
        slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
        slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
        slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1)))/minItems :
                       (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1)))/maxItems :
                       (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

        slider.visible = Math.floor(slider.w/(slider.itemW));
        slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible ) ? slider.vars.move : slider.visible;
        slider.pagingCount = Math.ceil(((slider.count - slider.visible)/slider.move) + 1);
        slider.last =  slider.pagingCount - 1;
        slider.limit = (slider.pagingCount === 1) ? 0 :
                       (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
      } else {
        slider.itemW = slider.w;
        slider.itemM = slideMargin;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }
      slider.computedW = slider.itemW - slider.boxPadding;
      slider.computedM = slider.itemM;
    };

    slider.update = function(pos, action) {
      slider.doMath();

      // update currentSlide and slider.animatingTo if necessary
      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }

      // update controlNav
      if (slider.vars.controlNav && !slider.manualControls) {
        if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update("add");
        } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update("remove", slider.last);
        }
      }
      // update directionNav
      if (slider.vars.directionNav) { methods.directionNav.update(); }

    };

    slider.addSlide = function(obj, pos) {
      var $obj = $(obj);

      slider.count += 1;
      slider.last = slider.count - 1;

      // append new slide
      if (vertical && reverse) {
        (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
      } else {
        (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.update(pos, "add");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      //FlexSlider: added() Callback
      slider.vars.added(slider);
    };
    slider.removeSlide = function(obj) {
      var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

      // update count
      slider.count -= 1;
      slider.last = slider.count - 1;

      // remove slide
      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        (vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.doMath();
      slider.update(pos, "remove");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      // FlexSlider: removed() Callback
      slider.vars.removed(slider);
    };

    //FlexSlider: Initialize
    methods.init();
  };

  // Ensure the slider isn't focussed if the window loses focus.
  $( window ).blur( function ( e ) {
    focused = false;
  }).focus( function ( e ) {
    focused = true;
  });

  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
    selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    animation: "fade",              //String: Select your animation type, "fade" or "slide"
    easing: "swing",                //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
    reverse: false,                 //{NEW} Boolean: Reverse the animation direction
    animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
    startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: true,                //Boolean: Animate slider automatically
    slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
    initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
    randomize: false,               //Boolean: Randomize slide order
    fadeFirstSlide: true,           //Boolean: Fade in the first slide when animation type is "fade"
    thumbCaptions: false,           //Boolean: Whether or not to put captions on thumbnails when using the "thumbnails" controlNav.

    // Usability features
    pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
    pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    pauseInvisible: true,       //{NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
    useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

    // Primary Controls
    controlNav: true,               //Boolean: Create navigation for paging control of each slide? Note: Leave true for manualControls usage
    directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
    prevText: "Previous",           //String: Set the text for the "previous" directionNav item
    nextText: "Next",               //String: Set the text for the "next" directionNav item

    // Secondary Navigation
    keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
    multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
    mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
    pausePlay: false,               //Boolean: Create pause/play dynamic element
    pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
    playText: "Play",               //String: Set the text for the "play" pausePlay item

    // Special properties
    controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
    manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
    customDirectionNav: "",         //{NEW} jQuery Object/Selector: Custom prev / next button. Must be two jQuery elements. In order to make the events work they have to have the classes "prev" and "next" (plus namespace)
    sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
    asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

    // Carousel Options
    itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
    minItems: 1,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
    allowOneSlide: true,           //{NEW} Boolean: Whether or not to allow a slider comprised of a single slide

    // Browser Specific
    isFirefox: false,             // {NEW} Boolean: Set to true when Firefox is the browser used.

    // Callback API
    start: function(){},            //Callback: function(slider) - Fires when the slider loads the first slide
    before: function(){},           //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function(){},            //Callback: function(slider) - Fires after each slider animation completes
    end: function(){},              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
    added: function(){},            //{NEW} Callback: function(slider) - Fires after a slide is added
    removed: function(){},           //{NEW} Callback: function(slider) - Fires after a slide is removed
    init: function() {},             //{NEW} Callback: function(slider) - Fires after the slider is initially setup
  rtl: false             //{NEW} Boolean: Whether or not to enable RTL mode
  };

  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    if (options === undefined) { options = {}; }

    if (typeof options === "object") {
      return this.each(function() {
        var $this = $(this),
            selector = (options.selector) ? options.selector : ".slides > li",
            $slides = $this.find(selector);

      if ( ( $slides.length === 1 && options.allowOneSlide === false ) || $slides.length === 0 ) {
          $slides.fadeIn(400);
          if (options.start) { options.start($this); }
        } else if ($this.data('flexslider') === undefined) {
          new $.flexslider(this, options);
        }
      });
    } else {
      // Helper strings to quickly perform functions on the slider
      var $slider = $(this).data('flexslider');
      switch (options) {
        case "play": $slider.play(); break;
        case "pause": $slider.pause(); break;
        case "stop": $slider.stop(); break;
        case "next": $slider.flexAnimate($slider.getTarget("next"), true); break;
        case "prev":
        case "previous": $slider.flexAnimate($slider.getTarget("prev"), true); break;
        default: if (typeof options === "number") { $slider.flexAnimate(options, true); }
      }
    }
  };
})(jQuery);
;
/*
 * jQuery doTimeout: Like setTimeout, but better! - v1.0 - 3/3/2010
 * http://benalman.com/projects/jquery-dotimeout-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($){var a={},c="doTimeout",d=Array.prototype.slice;$[c]=function(){return b.apply(window,[0].concat(d.call(arguments)))};$.fn[c]=function(){var f=d.call(arguments),e=b.apply(this,[c+f[0]].concat(f));return typeof f[0]==="number"||typeof f[1]==="number"?this:e};function b(l){var m=this,h,k={},g=l?$.fn:$,n=arguments,i=4,f=n[1],j=n[2],p=n[3];if(typeof f!=="string"){i--;f=l=0;j=n[1];p=n[2]}if(l){h=m.eq(0);h.data(l,k=h.data(l)||{})}else{if(f){k=a[f]||(a[f]={})}}k.id&&clearTimeout(k.id);delete k.id;function e(){if(l){h.removeData(l)}else{if(f){delete a[f]}}}function o(){k.id=setTimeout(function(){k.fn()},j)}if(p){k.fn=function(q){if(typeof p==="string"){p=g[p]}p.apply(m,d.call(n,i))===true&&!q?o():e()};o()}else{if(k.fn){j===undefined?e():k.fn(j===false);return true}else{e()}}}})(jQuery);;
// ==================================================
// fancyBox v3.5.7
//
// Licensed GPLv3 for open source use
// or fancyBox Commercial License for commercial use
//
// http://fancyapps.com/fancybox/
// Copyright 2019 fancyApps
//
// ==================================================
!function(t,e,n,o){"use strict";function i(t,e){var o,i,a,s=[],r=0;t&&t.isDefaultPrevented()||(t.preventDefault(),e=e||{},t&&t.data&&(e=h(t.data.options,e)),o=e.$target||n(t.currentTarget).trigger("blur"),(a=n.fancybox.getInstance())&&a.$trigger&&a.$trigger.is(o)||(e.selector?s=n(e.selector):(i=o.attr("data-fancybox")||"",i?(s=t.data?t.data.items:[],s=s.length?s.filter('[data-fancybox="'+i+'"]'):n('[data-fancybox="'+i+'"]')):s=[o]),r=n(s).index(o),r<0&&(r=0),a=n.fancybox.open(s,e,r),a.$trigger=o))}if(t.console=t.console||{info:function(t){}},n){if(n.fn.fancybox)return void console.info("fancyBox already initialized");var a={closeExisting:!1,loop:!1,gutter:50,keyboard:!0,preventCaptionOverlap:!0,arrows:!0,infobar:!0,smallBtn:"auto",toolbar:"auto",buttons:["zoom","slideShow","thumbs","close"],idleTime:3,protect:!1,modal:!1,image:{preload:!1},ajax:{settings:{data:{fancybox:!0}}},iframe:{tpl:'<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" allowfullscreen="allowfullscreen" allow="autoplay; fullscreen" src=""></iframe>',preload:!0,css:{},attr:{scrolling:"auto"}},video:{tpl:'<video class="fancybox-video" controls controlsList="nodownload" poster="{{poster}}"><source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos, <a href="{{src}}">download</a> and watch with your favorite video player!</video>',format:"",autoStart:!0},defaultType:"image",animationEffect:"zoom",animationDuration:366,zoomOpacity:"auto",transitionEffect:"fade",transitionDuration:366,slideClass:"",baseClass:"",baseTpl:'<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div><div class="fancybox-inner"><div class="fancybox-infobar"><span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span></div><div class="fancybox-toolbar">{{buttons}}</div><div class="fancybox-navigation">{{arrows}}</div><div class="fancybox-stage"></div><div class="fancybox-caption"><div class="fancybox-caption__body"></div></div></div></div>',spinnerTpl:'<div class="fancybox-loading"></div>',errorTpl:'<div class="fancybox-error"><p>{{ERROR}}</p></div>',btnTpl:{download:'<a download data-fancybox-download class="fancybox-button fancybox-button--download" title="{{DOWNLOAD}}" href="javascript:;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.62 17.09V19H5.38v-1.91zm-2.97-6.96L17 11.45l-5 4.87-5-4.87 1.36-1.32 2.68 2.64V5h1.92v7.77z"/></svg></a>',zoom:'<button data-fancybox-zoom class="fancybox-button fancybox-button--zoom" title="{{ZOOM}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.7 17.3l-3-3a5.9 5.9 0 0 0-.6-7.6 5.9 5.9 0 0 0-8.4 0 5.9 5.9 0 0 0 0 8.4 5.9 5.9 0 0 0 7.7.7l3 3a1 1 0 0 0 1.3 0c.4-.5.4-1 0-1.5zM8.1 13.8a4 4 0 0 1 0-5.7 4 4 0 0 1 5.7 0 4 4 0 0 1 0 5.7 4 4 0 0 1-5.7 0z"/></svg></button>',close:'<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 10.6L6.6 5.2 5.2 6.6l5.4 5.4-5.4 5.4 1.4 1.4 5.4-5.4 5.4 5.4 1.4-1.4-5.4-5.4 5.4-5.4-1.4-1.4-5.4 5.4z"/></svg></button>',arrowLeft:'<button data-fancybox-prev class="fancybox-button fancybox-button--arrow_left" title="{{PREV}}"><div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11.28 15.7l-1.34 1.37L5 12l4.94-5.07 1.34 1.38-2.68 2.72H19v1.94H8.6z"/></svg></div></button>',arrowRight:'<button data-fancybox-next class="fancybox-button fancybox-button--arrow_right" title="{{NEXT}}"><div><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4 12.97l-2.68 2.72 1.34 1.38L19 12l-4.94-5.07-1.34 1.38 2.68 2.72H5v1.94z"/></svg></div></button>',smallBtn:'<button type="button" data-fancybox-close class="fancybox-button fancybox-close-small" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 0 24 24"><path d="M13 12l5-5-1-1-5 5-5-5-1 1 5 5-5 5 1 1 5-5 5 5 1-1z"/></svg></button>'},parentEl:"body",hideScrollbar:!0,autoFocus:!0,backFocus:!0,trapFocus:!0,fullScreen:{autoStart:!1},touch:{vertical:!0,momentum:!0},hash:null,media:{},slideShow:{autoStart:!1,speed:3e3},thumbs:{autoStart:!1,hideOnClose:!0,parentEl:".fancybox-container",axis:"y"},wheel:"auto",onInit:n.noop,beforeLoad:n.noop,afterLoad:n.noop,beforeShow:n.noop,afterShow:n.noop,beforeClose:n.noop,afterClose:n.noop,onActivate:n.noop,onDeactivate:n.noop,clickContent:function(t,e){return"image"===t.type&&"zoom"},clickSlide:"close",clickOutside:"close",dblclickContent:!1,dblclickSlide:!1,dblclickOutside:!1,mobile:{preventCaptionOverlap:!1,idleTime:!1,clickContent:function(t,e){return"image"===t.type&&"toggleControls"},clickSlide:function(t,e){return"image"===t.type?"toggleControls":"close"},dblclickContent:function(t,e){return"image"===t.type&&"zoom"},dblclickSlide:function(t,e){return"image"===t.type&&"zoom"}},lang:"en",i18n:{en:{CLOSE:"Close",NEXT:"Next",PREV:"Previous",ERROR:"The requested content cannot be loaded. <br/> Please try again later.",PLAY_START:"Start slideshow",PLAY_STOP:"Pause slideshow",FULL_SCREEN:"Full screen",THUMBS:"Thumbnails",DOWNLOAD:"Download",SHARE:"Share",ZOOM:"Zoom"},de:{CLOSE:"Schlie&szlig;en",NEXT:"Weiter",PREV:"Zur&uuml;ck",ERROR:"Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es sp&auml;ter nochmal.",PLAY_START:"Diaschau starten",PLAY_STOP:"Diaschau beenden",FULL_SCREEN:"Vollbild",THUMBS:"Vorschaubilder",DOWNLOAD:"Herunterladen",SHARE:"Teilen",ZOOM:"Vergr&ouml;&szlig;ern"}}},s=n(t),r=n(e),c=0,l=function(t){return t&&t.hasOwnProperty&&t instanceof n},d=function(){return t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||function(e){return t.setTimeout(e,1e3/60)}}(),u=function(){return t.cancelAnimationFrame||t.webkitCancelAnimationFrame||t.mozCancelAnimationFrame||t.oCancelAnimationFrame||function(e){t.clearTimeout(e)}}(),f=function(){var t,n=e.createElement("fakeelement"),o={transition:"transitionend",OTransition:"oTransitionEnd",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd"};for(t in o)if(void 0!==n.style[t])return o[t];return"transitionend"}(),p=function(t){return t&&t.length&&t[0].offsetHeight},h=function(t,e){var o=n.extend(!0,{},t,e);return n.each(e,function(t,e){n.isArray(e)&&(o[t]=e)}),o},g=function(t){var o,i;return!(!t||t.ownerDocument!==e)&&(n(".fancybox-container").css("pointer-events","none"),o={x:t.getBoundingClientRect().left+t.offsetWidth/2,y:t.getBoundingClientRect().top+t.offsetHeight/2},i=e.elementFromPoint(o.x,o.y)===t,n(".fancybox-container").css("pointer-events",""),i)},b=function(t,e,o){var i=this;i.opts=h({index:o},n.fancybox.defaults),n.isPlainObject(e)&&(i.opts=h(i.opts,e)),n.fancybox.isMobile&&(i.opts=h(i.opts,i.opts.mobile)),i.id=i.opts.id||++c,i.currIndex=parseInt(i.opts.index,10)||0,i.prevIndex=null,i.prevPos=null,i.currPos=0,i.firstRun=!0,i.group=[],i.slides={},i.addContent(t),i.group.length&&i.init()};n.extend(b.prototype,{init:function(){var o,i,a=this,s=a.group[a.currIndex],r=s.opts;r.closeExisting&&n.fancybox.close(!0),n("body").addClass("fancybox-active"),!n.fancybox.getInstance()&&!1!==r.hideScrollbar&&!n.fancybox.isMobile&&e.body.scrollHeight>t.innerHeight&&(n("head").append('<style id="fancybox-style-noscroll" type="text/css">.compensate-for-scrollbar{margin-right:'+(t.innerWidth-e.documentElement.clientWidth)+"px;}</style>"),n("body").addClass("compensate-for-scrollbar")),i="",n.each(r.buttons,function(t,e){i+=r.btnTpl[e]||""}),o=n(a.translate(a,r.baseTpl.replace("{{buttons}}",i).replace("{{arrows}}",r.btnTpl.arrowLeft+r.btnTpl.arrowRight))).attr("id","fancybox-container-"+a.id).addClass(r.baseClass).data("FancyBox",a).appendTo(r.parentEl),a.$refs={container:o},["bg","inner","infobar","toolbar","stage","caption","navigation"].forEach(function(t){a.$refs[t]=o.find(".fancybox-"+t)}),a.trigger("onInit"),a.activate(),a.jumpTo(a.currIndex)},translate:function(t,e){var n=t.opts.i18n[t.opts.lang]||t.opts.i18n.en;return e.replace(/\{\{(\w+)\}\}/g,function(t,e){return void 0===n[e]?t:n[e]})},addContent:function(t){var e,o=this,i=n.makeArray(t);n.each(i,function(t,e){var i,a,s,r,c,l={},d={};n.isPlainObject(e)?(l=e,d=e.opts||e):"object"===n.type(e)&&n(e).length?(i=n(e),d=i.data()||{},d=n.extend(!0,{},d,d.options),d.$orig=i,l.src=o.opts.src||d.src||i.attr("href"),l.type||l.src||(l.type="inline",l.src=e)):l={type:"html",src:e+""},l.opts=n.extend(!0,{},o.opts,d),n.isArray(d.buttons)&&(l.opts.buttons=d.buttons),n.fancybox.isMobile&&l.opts.mobile&&(l.opts=h(l.opts,l.opts.mobile)),a=l.type||l.opts.type,r=l.src||"",!a&&r&&((s=r.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i))?(a="video",l.opts.video.format||(l.opts.video.format="video/"+("ogv"===s[1]?"ogg":s[1]))):r.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i)?a="image":r.match(/\.(pdf)((\?|#).*)?$/i)?(a="iframe",l=n.extend(!0,l,{contentType:"pdf",opts:{iframe:{preload:!1}}})):"#"===r.charAt(0)&&(a="inline")),a?l.type=a:o.trigger("objectNeedsType",l),l.contentType||(l.contentType=n.inArray(l.type,["html","inline","ajax"])>-1?"html":l.type),l.index=o.group.length,"auto"==l.opts.smallBtn&&(l.opts.smallBtn=n.inArray(l.type,["html","inline","ajax"])>-1),"auto"===l.opts.toolbar&&(l.opts.toolbar=!l.opts.smallBtn),l.$thumb=l.opts.$thumb||null,l.opts.$trigger&&l.index===o.opts.index&&(l.$thumb=l.opts.$trigger.find("img:first"),l.$thumb.length&&(l.opts.$orig=l.opts.$trigger)),l.$thumb&&l.$thumb.length||!l.opts.$orig||(l.$thumb=l.opts.$orig.find("img:first")),l.$thumb&&!l.$thumb.length&&(l.$thumb=null),l.thumb=l.opts.thumb||(l.$thumb?l.$thumb[0].src:null),"function"===n.type(l.opts.caption)&&(l.opts.caption=l.opts.caption.apply(e,[o,l])),"function"===n.type(o.opts.caption)&&(l.opts.caption=o.opts.caption.apply(e,[o,l])),l.opts.caption instanceof n||(l.opts.caption=void 0===l.opts.caption?"":l.opts.caption+""),"ajax"===l.type&&(c=r.split(/\s+/,2),c.length>1&&(l.src=c.shift(),l.opts.filter=c.shift())),l.opts.modal&&(l.opts=n.extend(!0,l.opts,{trapFocus:!0,infobar:0,toolbar:0,smallBtn:0,keyboard:0,slideShow:0,fullScreen:0,thumbs:0,touch:0,clickContent:!1,clickSlide:!1,clickOutside:!1,dblclickContent:!1,dblclickSlide:!1,dblclickOutside:!1})),o.group.push(l)}),Object.keys(o.slides).length&&(o.updateControls(),(e=o.Thumbs)&&e.isActive&&(e.create(),e.focus()))},addEvents:function(){var e=this;e.removeEvents(),e.$refs.container.on("click.fb-close","[data-fancybox-close]",function(t){t.stopPropagation(),t.preventDefault(),e.close(t)}).on("touchstart.fb-prev click.fb-prev","[data-fancybox-prev]",function(t){t.stopPropagation(),t.preventDefault(),e.previous()}).on("touchstart.fb-next click.fb-next","[data-fancybox-next]",function(t){t.stopPropagation(),t.preventDefault(),e.next()}).on("click.fb","[data-fancybox-zoom]",function(t){e[e.isScaledDown()?"scaleToActual":"scaleToFit"]()}),s.on("orientationchange.fb resize.fb",function(t){t&&t.originalEvent&&"resize"===t.originalEvent.type?(e.requestId&&u(e.requestId),e.requestId=d(function(){e.update(t)})):(e.current&&"iframe"===e.current.type&&e.$refs.stage.hide(),setTimeout(function(){e.$refs.stage.show(),e.update(t)},n.fancybox.isMobile?600:250))}),r.on("keydown.fb",function(t){var o=n.fancybox?n.fancybox.getInstance():null,i=o.current,a=t.keyCode||t.which;if(9==a)return void(i.opts.trapFocus&&e.focus(t));if(!(!i.opts.keyboard||t.ctrlKey||t.altKey||t.shiftKey||n(t.target).is("input,textarea,video,audio,select")))return 8===a||27===a?(t.preventDefault(),void e.close(t)):37===a||38===a?(t.preventDefault(),void e.previous()):39===a||40===a?(t.preventDefault(),void e.next()):void e.trigger("afterKeydown",t,a)}),e.group[e.currIndex].opts.idleTime&&(e.idleSecondsCounter=0,r.on("mousemove.fb-idle mouseleave.fb-idle mousedown.fb-idle touchstart.fb-idle touchmove.fb-idle scroll.fb-idle keydown.fb-idle",function(t){e.idleSecondsCounter=0,e.isIdle&&e.showControls(),e.isIdle=!1}),e.idleInterval=t.setInterval(function(){++e.idleSecondsCounter>=e.group[e.currIndex].opts.idleTime&&!e.isDragging&&(e.isIdle=!0,e.idleSecondsCounter=0,e.hideControls())},1e3))},removeEvents:function(){var e=this;s.off("orientationchange.fb resize.fb"),r.off("keydown.fb .fb-idle"),this.$refs.container.off(".fb-close .fb-prev .fb-next"),e.idleInterval&&(t.clearInterval(e.idleInterval),e.idleInterval=null)},previous:function(t){return this.jumpTo(this.currPos-1,t)},next:function(t){return this.jumpTo(this.currPos+1,t)},jumpTo:function(t,e){var o,i,a,s,r,c,l,d,u,f=this,h=f.group.length;if(!(f.isDragging||f.isClosing||f.isAnimating&&f.firstRun)){if(t=parseInt(t,10),!(a=f.current?f.current.opts.loop:f.opts.loop)&&(t<0||t>=h))return!1;if(o=f.firstRun=!Object.keys(f.slides).length,r=f.current,f.prevIndex=f.currIndex,f.prevPos=f.currPos,s=f.createSlide(t),h>1&&((a||s.index<h-1)&&f.createSlide(t+1),(a||s.index>0)&&f.createSlide(t-1)),f.current=s,f.currIndex=s.index,f.currPos=s.pos,f.trigger("beforeShow",o),f.updateControls(),s.forcedDuration=void 0,n.isNumeric(e)?s.forcedDuration=e:e=s.opts[o?"animationDuration":"transitionDuration"],e=parseInt(e,10),i=f.isMoved(s),s.$slide.addClass("fancybox-slide--current"),o)return s.opts.animationEffect&&e&&f.$refs.container.css("transition-duration",e+"ms"),f.$refs.container.addClass("fancybox-is-open").trigger("focus"),f.loadSlide(s),void f.preload("image");c=n.fancybox.getTranslate(r.$slide),l=n.fancybox.getTranslate(f.$refs.stage),n.each(f.slides,function(t,e){n.fancybox.stop(e.$slide,!0)}),r.pos!==s.pos&&(r.isComplete=!1),r.$slide.removeClass("fancybox-slide--complete fancybox-slide--current"),i?(u=c.left-(r.pos*c.width+r.pos*r.opts.gutter),n.each(f.slides,function(t,o){o.$slide.removeClass("fancybox-animated").removeClass(function(t,e){return(e.match(/(^|\s)fancybox-fx-\S+/g)||[]).join(" ")});var i=o.pos*c.width+o.pos*o.opts.gutter;n.fancybox.setTranslate(o.$slide,{top:0,left:i-l.left+u}),o.pos!==s.pos&&o.$slide.addClass("fancybox-slide--"+(o.pos>s.pos?"next":"previous")),p(o.$slide),n.fancybox.animate(o.$slide,{top:0,left:(o.pos-s.pos)*c.width+(o.pos-s.pos)*o.opts.gutter},e,function(){o.$slide.css({transform:"",opacity:""}).removeClass("fancybox-slide--next fancybox-slide--previous"),o.pos===f.currPos&&f.complete()})})):e&&s.opts.transitionEffect&&(d="fancybox-animated fancybox-fx-"+s.opts.transitionEffect,r.$slide.addClass("fancybox-slide--"+(r.pos>s.pos?"next":"previous")),n.fancybox.animate(r.$slide,d,e,function(){r.$slide.removeClass(d).removeClass("fancybox-slide--next fancybox-slide--previous")},!1)),s.isLoaded?f.revealContent(s):f.loadSlide(s),f.preload("image")}},createSlide:function(t){var e,o,i=this;return o=t%i.group.length,o=o<0?i.group.length+o:o,!i.slides[t]&&i.group[o]&&(e=n('<div class="fancybox-slide"></div>').appendTo(i.$refs.stage),i.slides[t]=n.extend(!0,{},i.group[o],{pos:t,$slide:e,isLoaded:!1}),i.updateSlide(i.slides[t])),i.slides[t]},scaleToActual:function(t,e,o){var i,a,s,r,c,l=this,d=l.current,u=d.$content,f=n.fancybox.getTranslate(d.$slide).width,p=n.fancybox.getTranslate(d.$slide).height,h=d.width,g=d.height;l.isAnimating||l.isMoved()||!u||"image"!=d.type||!d.isLoaded||d.hasError||(l.isAnimating=!0,n.fancybox.stop(u),t=void 0===t?.5*f:t,e=void 0===e?.5*p:e,i=n.fancybox.getTranslate(u),i.top-=n.fancybox.getTranslate(d.$slide).top,i.left-=n.fancybox.getTranslate(d.$slide).left,r=h/i.width,c=g/i.height,a=.5*f-.5*h,s=.5*p-.5*g,h>f&&(a=i.left*r-(t*r-t),a>0&&(a=0),a<f-h&&(a=f-h)),g>p&&(s=i.top*c-(e*c-e),s>0&&(s=0),s<p-g&&(s=p-g)),l.updateCursor(h,g),n.fancybox.animate(u,{top:s,left:a,scaleX:r,scaleY:c},o||366,function(){l.isAnimating=!1}),l.SlideShow&&l.SlideShow.isActive&&l.SlideShow.stop())},scaleToFit:function(t){var e,o=this,i=o.current,a=i.$content;o.isAnimating||o.isMoved()||!a||"image"!=i.type||!i.isLoaded||i.hasError||(o.isAnimating=!0,n.fancybox.stop(a),e=o.getFitPos(i),o.updateCursor(e.width,e.height),n.fancybox.animate(a,{top:e.top,left:e.left,scaleX:e.width/a.width(),scaleY:e.height/a.height()},t||366,function(){o.isAnimating=!1}))},getFitPos:function(t){var e,o,i,a,s=this,r=t.$content,c=t.$slide,l=t.width||t.opts.width,d=t.height||t.opts.height,u={};return!!(t.isLoaded&&r&&r.length)&&(e=n.fancybox.getTranslate(s.$refs.stage).width,o=n.fancybox.getTranslate(s.$refs.stage).height,e-=parseFloat(c.css("paddingLeft"))+parseFloat(c.css("paddingRight"))+parseFloat(r.css("marginLeft"))+parseFloat(r.css("marginRight")),o-=parseFloat(c.css("paddingTop"))+parseFloat(c.css("paddingBottom"))+parseFloat(r.css("marginTop"))+parseFloat(r.css("marginBottom")),l&&d||(l=e,d=o),i=Math.min(1,e/l,o/d),l*=i,d*=i,l>e-.5&&(l=e),d>o-.5&&(d=o),"image"===t.type?(u.top=Math.floor(.5*(o-d))+parseFloat(c.css("paddingTop")),u.left=Math.floor(.5*(e-l))+parseFloat(c.css("paddingLeft"))):"video"===t.contentType&&(a=t.opts.width&&t.opts.height?l/d:t.opts.ratio||16/9,d>l/a?d=l/a:l>d*a&&(l=d*a)),u.width=l,u.height=d,u)},update:function(t){var e=this;n.each(e.slides,function(n,o){e.updateSlide(o,t)})},updateSlide:function(t,e){var o=this,i=t&&t.$content,a=t.width||t.opts.width,s=t.height||t.opts.height,r=t.$slide;o.adjustCaption(t),i&&(a||s||"video"===t.contentType)&&!t.hasError&&(n.fancybox.stop(i),n.fancybox.setTranslate(i,o.getFitPos(t)),t.pos===o.currPos&&(o.isAnimating=!1,o.updateCursor())),o.adjustLayout(t),r.length&&(r.trigger("refresh"),t.pos===o.currPos&&o.$refs.toolbar.add(o.$refs.navigation.find(".fancybox-button--arrow_right")).toggleClass("compensate-for-scrollbar",r.get(0).scrollHeight>r.get(0).clientHeight)),o.trigger("onUpdate",t,e)},centerSlide:function(t){var e=this,o=e.current,i=o.$slide;!e.isClosing&&o&&(i.siblings().css({transform:"",opacity:""}),i.parent().children().removeClass("fancybox-slide--previous fancybox-slide--next"),n.fancybox.animate(i,{top:0,left:0,opacity:1},void 0===t?0:t,function(){i.css({transform:"",opacity:""}),o.isComplete||e.complete()},!1))},isMoved:function(t){var e,o,i=t||this.current;return!!i&&(o=n.fancybox.getTranslate(this.$refs.stage),e=n.fancybox.getTranslate(i.$slide),!i.$slide.hasClass("fancybox-animated")&&(Math.abs(e.top-o.top)>.5||Math.abs(e.left-o.left)>.5))},updateCursor:function(t,e){var o,i,a=this,s=a.current,r=a.$refs.container;s&&!a.isClosing&&a.Guestures&&(r.removeClass("fancybox-is-zoomable fancybox-can-zoomIn fancybox-can-zoomOut fancybox-can-swipe fancybox-can-pan"),o=a.canPan(t,e),i=!!o||a.isZoomable(),r.toggleClass("fancybox-is-zoomable",i),n("[data-fancybox-zoom]").prop("disabled",!i),o?r.addClass("fancybox-can-pan"):i&&("zoom"===s.opts.clickContent||n.isFunction(s.opts.clickContent)&&"zoom"==s.opts.clickContent(s))?r.addClass("fancybox-can-zoomIn"):s.opts.touch&&(s.opts.touch.vertical||a.group.length>1)&&"video"!==s.contentType&&r.addClass("fancybox-can-swipe"))},isZoomable:function(){var t,e=this,n=e.current;if(n&&!e.isClosing&&"image"===n.type&&!n.hasError){if(!n.isLoaded)return!0;if((t=e.getFitPos(n))&&(n.width>t.width||n.height>t.height))return!0}return!1},isScaledDown:function(t,e){var o=this,i=!1,a=o.current,s=a.$content;return void 0!==t&&void 0!==e?i=t<a.width&&e<a.height:s&&(i=n.fancybox.getTranslate(s),i=i.width<a.width&&i.height<a.height),i},canPan:function(t,e){var o=this,i=o.current,a=null,s=!1;return"image"===i.type&&(i.isComplete||t&&e)&&!i.hasError&&(s=o.getFitPos(i),void 0!==t&&void 0!==e?a={width:t,height:e}:i.isComplete&&(a=n.fancybox.getTranslate(i.$content)),a&&s&&(s=Math.abs(a.width-s.width)>1.5||Math.abs(a.height-s.height)>1.5)),s},loadSlide:function(t){var e,o,i,a=this;if(!t.isLoading&&!t.isLoaded){if(t.isLoading=!0,!1===a.trigger("beforeLoad",t))return t.isLoading=!1,!1;switch(e=t.type,o=t.$slide,o.off("refresh").trigger("onReset").addClass(t.opts.slideClass),e){case"image":a.setImage(t);break;case"iframe":a.setIframe(t);break;case"html":a.setContent(t,t.src||t.content);break;case"video":a.setContent(t,t.opts.video.tpl.replace(/\{\{src\}\}/gi,t.src).replace("{{format}}",t.opts.videoFormat||t.opts.video.format||"").replace("{{poster}}",t.thumb||""));break;case"inline":n(t.src).length?a.setContent(t,n(t.src)):a.setError(t);break;case"ajax":a.showLoading(t),i=n.ajax(n.extend({},t.opts.ajax.settings,{url:t.src,success:function(e,n){"success"===n&&a.setContent(t,e)},error:function(e,n){e&&"abort"!==n&&a.setError(t)}})),o.one("onReset",function(){i.abort()});break;default:a.setError(t)}return!0}},setImage:function(t){var o,i=this;setTimeout(function(){var e=t.$image;i.isClosing||!t.isLoading||e&&e.length&&e[0].complete||t.hasError||i.showLoading(t)},50),i.checkSrcset(t),t.$content=n('<div class="fancybox-content"></div>').addClass("fancybox-is-hidden").appendTo(t.$slide.addClass("fancybox-slide--image")),!1!==t.opts.preload&&t.opts.width&&t.opts.height&&t.thumb&&(t.width=t.opts.width,t.height=t.opts.height,o=e.createElement("img"),o.onerror=function(){n(this).remove(),t.$ghost=null},o.onload=function(){i.afterLoad(t)},t.$ghost=n(o).addClass("fancybox-image").appendTo(t.$content).attr("src",t.thumb)),i.setBigImage(t)},checkSrcset:function(e){var n,o,i,a,s=e.opts.srcset||e.opts.image.srcset;if(s){i=t.devicePixelRatio||1,a=t.innerWidth*i,o=s.split(",").map(function(t){var e={};return t.trim().split(/\s+/).forEach(function(t,n){var o=parseInt(t.substring(0,t.length-1),10);if(0===n)return e.url=t;o&&(e.value=o,e.postfix=t[t.length-1])}),e}),o.sort(function(t,e){return t.value-e.value});for(var r=0;r<o.length;r++){var c=o[r];if("w"===c.postfix&&c.value>=a||"x"===c.postfix&&c.value>=i){n=c;break}}!n&&o.length&&(n=o[o.length-1]),n&&(e.src=n.url,e.width&&e.height&&"w"==n.postfix&&(e.height=e.width/e.height*n.value,e.width=n.value),e.opts.srcset=s)}},setBigImage:function(t){var o=this,i=e.createElement("img"),a=n(i);t.$image=a.one("error",function(){o.setError(t)}).one("load",function(){var e;t.$ghost||(o.resolveImageSlideSize(t,this.naturalWidth,this.naturalHeight),o.afterLoad(t)),o.isClosing||(t.opts.srcset&&(e=t.opts.sizes,e&&"auto"!==e||(e=(t.width/t.height>1&&s.width()/s.height()>1?"100":Math.round(t.width/t.height*100))+"vw"),a.attr("sizes",e).attr("srcset",t.opts.srcset)),t.$ghost&&setTimeout(function(){t.$ghost&&!o.isClosing&&t.$ghost.hide()},Math.min(300,Math.max(1e3,t.height/1600))),o.hideLoading(t))}).addClass("fancybox-image").attr("src",t.src).appendTo(t.$content),(i.complete||"complete"==i.readyState)&&a.naturalWidth&&a.naturalHeight?a.trigger("load"):i.error&&a.trigger("error")},resolveImageSlideSize:function(t,e,n){var o=parseInt(t.opts.width,10),i=parseInt(t.opts.height,10);t.width=e,t.height=n,o>0&&(t.width=o,t.height=Math.floor(o*n/e)),i>0&&(t.width=Math.floor(i*e/n),t.height=i)},setIframe:function(t){var e,o=this,i=t.opts.iframe,a=t.$slide;t.$content=n('<div class="fancybox-content'+(i.preload?" fancybox-is-hidden":"")+'"></div>').css(i.css).appendTo(a),a.addClass("fancybox-slide--"+t.contentType),t.$iframe=e=n(i.tpl.replace(/\{rnd\}/g,(new Date).getTime())).attr(i.attr).appendTo(t.$content),i.preload?(o.showLoading(t),e.on("load.fb error.fb",function(e){this.isReady=1,t.$slide.trigger("refresh"),o.afterLoad(t)}),a.on("refresh.fb",function(){var n,o,s=t.$content,r=i.css.width,c=i.css.height;if(1===e[0].isReady){try{n=e.contents(),o=n.find("body")}catch(t){}o&&o.length&&o.children().length&&(a.css("overflow","visible"),s.css({width:"100%","max-width":"100%",height:"9999px"}),void 0===r&&(r=Math.ceil(Math.max(o[0].clientWidth,o.outerWidth(!0)))),s.css("width",r||"").css("max-width",""),void 0===c&&(c=Math.ceil(Math.max(o[0].clientHeight,o.outerHeight(!0)))),s.css("height",c||""),a.css("overflow","auto")),s.removeClass("fancybox-is-hidden")}})):o.afterLoad(t),e.attr("src",t.src),a.one("onReset",function(){try{n(this).find("iframe").hide().unbind().attr("src","//about:blank")}catch(t){}n(this).off("refresh.fb").empty(),t.isLoaded=!1,t.isRevealed=!1})},setContent:function(t,e){var o=this;o.isClosing||(o.hideLoading(t),t.$content&&n.fancybox.stop(t.$content),t.$slide.empty(),l(e)&&e.parent().length?((e.hasClass("fancybox-content")||e.parent().hasClass("fancybox-content"))&&e.parents(".fancybox-slide").trigger("onReset"),t.$placeholder=n("<div>").hide().insertAfter(e),e.css("display","inline-block")):t.hasError||("string"===n.type(e)&&(e=n("<div>").append(n.trim(e)).contents()),t.opts.filter&&(e=n("<div>").html(e).find(t.opts.filter))),t.$slide.one("onReset",function(){n(this).find("video,audio").trigger("pause"),t.$placeholder&&(t.$placeholder.after(e.removeClass("fancybox-content").hide()).remove(),t.$placeholder=null),t.$smallBtn&&(t.$smallBtn.remove(),t.$smallBtn=null),t.hasError||(n(this).empty(),t.isLoaded=!1,t.isRevealed=!1)}),n(e).appendTo(t.$slide),n(e).is("video,audio")&&(n(e).addClass("fancybox-video"),n(e).wrap("<div></div>"),t.contentType="video",t.opts.width=t.opts.width||n(e).attr("width"),t.opts.height=t.opts.height||n(e).attr("height")),t.$content=t.$slide.children().filter("div,form,main,video,audio,article,.fancybox-content").first(),t.$content.siblings().hide(),t.$content.length||(t.$content=t.$slide.wrapInner("<div></div>").children().first()),t.$content.addClass("fancybox-content"),t.$slide.addClass("fancybox-slide--"+t.contentType),o.afterLoad(t))},setError:function(t){t.hasError=!0,t.$slide.trigger("onReset").removeClass("fancybox-slide--"+t.contentType).addClass("fancybox-slide--error"),t.contentType="html",this.setContent(t,this.translate(t,t.opts.errorTpl)),t.pos===this.currPos&&(this.isAnimating=!1)},showLoading:function(t){var e=this;(t=t||e.current)&&!t.$spinner&&(t.$spinner=n(e.translate(e,e.opts.spinnerTpl)).appendTo(t.$slide).hide().fadeIn("fast"))},hideLoading:function(t){var e=this;(t=t||e.current)&&t.$spinner&&(t.$spinner.stop().remove(),delete t.$spinner)},afterLoad:function(t){var e=this;e.isClosing||(t.isLoading=!1,t.isLoaded=!0,e.trigger("afterLoad",t),e.hideLoading(t),!t.opts.smallBtn||t.$smallBtn&&t.$smallBtn.length||(t.$smallBtn=n(e.translate(t,t.opts.btnTpl.smallBtn)).appendTo(t.$content)),t.opts.protect&&t.$content&&!t.hasError&&(t.$content.on("contextmenu.fb",function(t){return 2==t.button&&t.preventDefault(),!0}),"image"===t.type&&n('<div class="fancybox-spaceball"></div>').appendTo(t.$content)),e.adjustCaption(t),e.adjustLayout(t),t.pos===e.currPos&&e.updateCursor(),e.revealContent(t))},adjustCaption:function(t){var e,n=this,o=t||n.current,i=o.opts.caption,a=o.opts.preventCaptionOverlap,s=n.$refs.caption,r=!1;s.toggleClass("fancybox-caption--separate",a),a&&i&&i.length&&(o.pos!==n.currPos?(e=s.clone().appendTo(s.parent()),e.children().eq(0).empty().html(i),r=e.outerHeight(!0),e.empty().remove()):n.$caption&&(r=n.$caption.outerHeight(!0)),o.$slide.css("padding-bottom",r||""))},adjustLayout:function(t){var e,n,o,i,a=this,s=t||a.current;s.isLoaded&&!0!==s.opts.disableLayoutFix&&(s.$content.css("margin-bottom",""),s.$content.outerHeight()>s.$slide.height()+.5&&(o=s.$slide[0].style["padding-bottom"],i=s.$slide.css("padding-bottom"),parseFloat(i)>0&&(e=s.$slide[0].scrollHeight,s.$slide.css("padding-bottom",0),Math.abs(e-s.$slide[0].scrollHeight)<1&&(n=i),s.$slide.css("padding-bottom",o))),s.$content.css("margin-bottom",n))},revealContent:function(t){var e,o,i,a,s=this,r=t.$slide,c=!1,l=!1,d=s.isMoved(t),u=t.isRevealed;return t.isRevealed=!0,e=t.opts[s.firstRun?"animationEffect":"transitionEffect"],i=t.opts[s.firstRun?"animationDuration":"transitionDuration"],i=parseInt(void 0===t.forcedDuration?i:t.forcedDuration,10),!d&&t.pos===s.currPos&&i||(e=!1),"zoom"===e&&(t.pos===s.currPos&&i&&"image"===t.type&&!t.hasError&&(l=s.getThumbPos(t))?c=s.getFitPos(t):e="fade"),"zoom"===e?(s.isAnimating=!0,c.scaleX=c.width/l.width,c.scaleY=c.height/l.height,a=t.opts.zoomOpacity,"auto"==a&&(a=Math.abs(t.width/t.height-l.width/l.height)>.1),a&&(l.opacity=.1,c.opacity=1),n.fancybox.setTranslate(t.$content.removeClass("fancybox-is-hidden"),l),p(t.$content),void n.fancybox.animate(t.$content,c,i,function(){s.isAnimating=!1,s.complete()})):(s.updateSlide(t),e?(n.fancybox.stop(r),o="fancybox-slide--"+(t.pos>=s.prevPos?"next":"previous")+" fancybox-animated fancybox-fx-"+e,r.addClass(o).removeClass("fancybox-slide--current"),t.$content.removeClass("fancybox-is-hidden"),p(r),"image"!==t.type&&t.$content.hide().show(0),void n.fancybox.animate(r,"fancybox-slide--current",i,function(){r.removeClass(o).css({transform:"",opacity:""}),t.pos===s.currPos&&s.complete()},!0)):(t.$content.removeClass("fancybox-is-hidden"),u||!d||"image"!==t.type||t.hasError||t.$content.hide().fadeIn("fast"),void(t.pos===s.currPos&&s.complete())))},getThumbPos:function(t){var e,o,i,a,s,r=!1,c=t.$thumb;return!(!c||!g(c[0]))&&(e=n.fancybox.getTranslate(c),o=parseFloat(c.css("border-top-width")||0),i=parseFloat(c.css("border-right-width")||0),a=parseFloat(c.css("border-bottom-width")||0),s=parseFloat(c.css("border-left-width")||0),r={top:e.top+o,left:e.left+s,width:e.width-i-s,height:e.height-o-a,scaleX:1,scaleY:1},e.width>0&&e.height>0&&r)},complete:function(){var t,e=this,o=e.current,i={};!e.isMoved()&&o.isLoaded&&(o.isComplete||(o.isComplete=!0,o.$slide.siblings().trigger("onReset"),e.preload("inline"),p(o.$slide),o.$slide.addClass("fancybox-slide--complete"),n.each(e.slides,function(t,o){o.pos>=e.currPos-1&&o.pos<=e.currPos+1?i[o.pos]=o:o&&(n.fancybox.stop(o.$slide),o.$slide.off().remove())}),e.slides=i),e.isAnimating=!1,e.updateCursor(),e.trigger("afterShow"),o.opts.video.autoStart&&o.$slide.find("video,audio").filter(":visible:first").trigger("play").one("ended",function(){Document.exitFullscreen?Document.exitFullscreen():this.webkitExitFullscreen&&this.webkitExitFullscreen(),e.next()}),o.opts.autoFocus&&"html"===o.contentType&&(t=o.$content.find("input[autofocus]:enabled:visible:first"),t.length?t.trigger("focus"):e.focus(null,!0)),o.$slide.scrollTop(0).scrollLeft(0))},preload:function(t){var e,n,o=this;o.group.length<2||(n=o.slides[o.currPos+1],e=o.slides[o.currPos-1],e&&e.type===t&&o.loadSlide(e),n&&n.type===t&&o.loadSlide(n))},focus:function(t,o){var i,a,s=this,r=["a[href]","area[href]",'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',"select:not([disabled]):not([aria-hidden])","textarea:not([disabled]):not([aria-hidden])","button:not([disabled]):not([aria-hidden])","iframe","object","embed","video","audio","[contenteditable]",'[tabindex]:not([tabindex^="-"])'].join(",");s.isClosing||(i=!t&&s.current&&s.current.isComplete?s.current.$slide.find("*:visible"+(o?":not(.fancybox-close-small)":"")):s.$refs.container.find("*:visible"),i=i.filter(r).filter(function(){return"hidden"!==n(this).css("visibility")&&!n(this).hasClass("disabled")}),i.length?(a=i.index(e.activeElement),t&&t.shiftKey?(a<0||0==a)&&(t.preventDefault(),i.eq(i.length-1).trigger("focus")):(a<0||a==i.length-1)&&(t&&t.preventDefault(),i.eq(0).trigger("focus"))):s.$refs.container.trigger("focus"))},activate:function(){var t=this;n(".fancybox-container").each(function(){var e=n(this).data("FancyBox");e&&e.id!==t.id&&!e.isClosing&&(e.trigger("onDeactivate"),e.removeEvents(),e.isVisible=!1)}),t.isVisible=!0,(t.current||t.isIdle)&&(t.update(),t.updateControls()),t.trigger("onActivate"),t.addEvents()},close:function(t,e){var o,i,a,s,r,c,l,u=this,f=u.current,h=function(){u.cleanUp(t)};return!u.isClosing&&(u.isClosing=!0,!1===u.trigger("beforeClose",t)?(u.isClosing=!1,d(function(){u.update()}),!1):(u.removeEvents(),a=f.$content,o=f.opts.animationEffect,i=n.isNumeric(e)?e:o?f.opts.animationDuration:0,f.$slide.removeClass("fancybox-slide--complete fancybox-slide--next fancybox-slide--previous fancybox-animated"),!0!==t?n.fancybox.stop(f.$slide):o=!1,f.$slide.siblings().trigger("onReset").remove(),i&&u.$refs.container.removeClass("fancybox-is-open").addClass("fancybox-is-closing").css("transition-duration",i+"ms"),u.hideLoading(f),u.hideControls(!0),u.updateCursor(),"zoom"!==o||a&&i&&"image"===f.type&&!u.isMoved()&&!f.hasError&&(l=u.getThumbPos(f))||(o="fade"),"zoom"===o?(n.fancybox.stop(a),s=n.fancybox.getTranslate(a),c={top:s.top,left:s.left,scaleX:s.width/l.width,scaleY:s.height/l.height,width:l.width,height:l.height},r=f.opts.zoomOpacity,
"auto"==r&&(r=Math.abs(f.width/f.height-l.width/l.height)>.1),r&&(l.opacity=0),n.fancybox.setTranslate(a,c),p(a),n.fancybox.animate(a,l,i,h),!0):(o&&i?n.fancybox.animate(f.$slide.addClass("fancybox-slide--previous").removeClass("fancybox-slide--current"),"fancybox-animated fancybox-fx-"+o,i,h):!0===t?setTimeout(h,i):h(),!0)))},cleanUp:function(e){var o,i,a,s=this,r=s.current.opts.$orig;s.current.$slide.trigger("onReset"),s.$refs.container.empty().remove(),s.trigger("afterClose",e),s.current.opts.backFocus&&(r&&r.length&&r.is(":visible")||(r=s.$trigger),r&&r.length&&(i=t.scrollX,a=t.scrollY,r.trigger("focus"),n("html, body").scrollTop(a).scrollLeft(i))),s.current=null,o=n.fancybox.getInstance(),o?o.activate():(n("body").removeClass("fancybox-active compensate-for-scrollbar"),n("#fancybox-style-noscroll").remove())},trigger:function(t,e){var o,i=Array.prototype.slice.call(arguments,1),a=this,s=e&&e.opts?e:a.current;if(s?i.unshift(s):s=a,i.unshift(a),n.isFunction(s.opts[t])&&(o=s.opts[t].apply(s,i)),!1===o)return o;"afterClose"!==t&&a.$refs?a.$refs.container.trigger(t+".fb",i):r.trigger(t+".fb",i)},updateControls:function(){var t=this,o=t.current,i=o.index,a=t.$refs.container,s=t.$refs.caption,r=o.opts.caption;o.$slide.trigger("refresh"),r&&r.length?(t.$caption=s,s.children().eq(0).html(r)):t.$caption=null,t.hasHiddenControls||t.isIdle||t.showControls(),a.find("[data-fancybox-count]").html(t.group.length),a.find("[data-fancybox-index]").html(i+1),a.find("[data-fancybox-prev]").prop("disabled",!o.opts.loop&&i<=0),a.find("[data-fancybox-next]").prop("disabled",!o.opts.loop&&i>=t.group.length-1),"image"===o.type?a.find("[data-fancybox-zoom]").show().end().find("[data-fancybox-download]").attr("href",o.opts.image.src||o.src).show():o.opts.toolbar&&a.find("[data-fancybox-download],[data-fancybox-zoom]").hide(),n(e.activeElement).is(":hidden,[disabled]")&&t.$refs.container.trigger("focus")},hideControls:function(t){var e=this,n=["infobar","toolbar","nav"];!t&&e.current.opts.preventCaptionOverlap||n.push("caption"),this.$refs.container.removeClass(n.map(function(t){return"fancybox-show-"+t}).join(" ")),this.hasHiddenControls=!0},showControls:function(){var t=this,e=t.current?t.current.opts:t.opts,n=t.$refs.container;t.hasHiddenControls=!1,t.idleSecondsCounter=0,n.toggleClass("fancybox-show-toolbar",!(!e.toolbar||!e.buttons)).toggleClass("fancybox-show-infobar",!!(e.infobar&&t.group.length>1)).toggleClass("fancybox-show-caption",!!t.$caption).toggleClass("fancybox-show-nav",!!(e.arrows&&t.group.length>1)).toggleClass("fancybox-is-modal",!!e.modal)},toggleControls:function(){this.hasHiddenControls?this.showControls():this.hideControls()}}),n.fancybox={version:"3.5.7",defaults:a,getInstance:function(t){var e=n('.fancybox-container:not(".fancybox-is-closing"):last').data("FancyBox"),o=Array.prototype.slice.call(arguments,1);return e instanceof b&&("string"===n.type(t)?e[t].apply(e,o):"function"===n.type(t)&&t.apply(e,o),e)},open:function(t,e,n){return new b(t,e,n)},close:function(t){var e=this.getInstance();e&&(e.close(),!0===t&&this.close(t))},destroy:function(){this.close(!0),r.add("body").off("click.fb-start","**")},isMobile:/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),use3d:function(){var n=e.createElement("div");return t.getComputedStyle&&t.getComputedStyle(n)&&t.getComputedStyle(n).getPropertyValue("transform")&&!(e.documentMode&&e.documentMode<11)}(),getTranslate:function(t){var e;return!(!t||!t.length)&&(e=t[0].getBoundingClientRect(),{top:e.top||0,left:e.left||0,width:e.width,height:e.height,opacity:parseFloat(t.css("opacity"))})},setTranslate:function(t,e){var n="",o={};if(t&&e)return void 0===e.left&&void 0===e.top||(n=(void 0===e.left?t.position().left:e.left)+"px, "+(void 0===e.top?t.position().top:e.top)+"px",n=this.use3d?"translate3d("+n+", 0px)":"translate("+n+")"),void 0!==e.scaleX&&void 0!==e.scaleY?n+=" scale("+e.scaleX+", "+e.scaleY+")":void 0!==e.scaleX&&(n+=" scaleX("+e.scaleX+")"),n.length&&(o.transform=n),void 0!==e.opacity&&(o.opacity=e.opacity),void 0!==e.width&&(o.width=e.width),void 0!==e.height&&(o.height=e.height),t.css(o)},animate:function(t,e,o,i,a){var s,r=this;n.isFunction(o)&&(i=o,o=null),r.stop(t),s=r.getTranslate(t),t.on(f,function(c){(!c||!c.originalEvent||t.is(c.originalEvent.target)&&"z-index"!=c.originalEvent.propertyName)&&(r.stop(t),n.isNumeric(o)&&t.css("transition-duration",""),n.isPlainObject(e)?void 0!==e.scaleX&&void 0!==e.scaleY&&r.setTranslate(t,{top:e.top,left:e.left,width:s.width*e.scaleX,height:s.height*e.scaleY,scaleX:1,scaleY:1}):!0!==a&&t.removeClass(e),n.isFunction(i)&&i(c))}),n.isNumeric(o)&&t.css("transition-duration",o+"ms"),n.isPlainObject(e)?(void 0!==e.scaleX&&void 0!==e.scaleY&&(delete e.width,delete e.height,t.parent().hasClass("fancybox-slide--image")&&t.parent().addClass("fancybox-is-scaling")),n.fancybox.setTranslate(t,e)):t.addClass(e),t.data("timer",setTimeout(function(){t.trigger(f)},o+33))},stop:function(t,e){t&&t.length&&(clearTimeout(t.data("timer")),e&&t.trigger(f),t.off(f).css("transition-duration",""),t.parent().removeClass("fancybox-is-scaling"))}},n.fn.fancybox=function(t){var e;return t=t||{},e=t.selector||!1,e?n("body").off("click.fb-start",e).on("click.fb-start",e,{options:t},i):this.off("click.fb-start").on("click.fb-start",{items:this,options:t},i),this},r.on("click.fb-start","[data-fancybox]",i),r.on("click.fb-start","[data-fancybox-trigger]",function(t){n('[data-fancybox="'+n(this).attr("data-fancybox-trigger")+'"]').eq(n(this).attr("data-fancybox-index")||0).trigger("click.fb-start",{$trigger:n(this)})}),function(){var t=null;r.on("mousedown mouseup focus blur",".fancybox-button",function(e){switch(e.type){case"mousedown":t=n(this);break;case"mouseup":t=null;break;case"focusin":n(".fancybox-button").removeClass("fancybox-focus"),n(this).is(t)||n(this).is("[disabled]")||n(this).addClass("fancybox-focus");break;case"focusout":n(".fancybox-button").removeClass("fancybox-focus")}})}()}}(window,document,jQuery),function(t){"use strict";var e={youtube:{matcher:/(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(watch\?(.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*))(.*)/i,params:{autoplay:1,autohide:1,fs:1,rel:0,hd:1,wmode:"transparent",enablejsapi:1,html5:1},paramPlace:8,type:"iframe",url:"https://www.youtube-nocookie.com/embed/$4",thumb:"https://img.youtube.com/vi/$4/hqdefault.jpg"},vimeo:{matcher:/^.+vimeo.com\/(.*\/)?([\d]+)(.*)?/,params:{autoplay:1,hd:1,show_title:1,show_byline:1,show_portrait:0,fullscreen:1},paramPlace:3,type:"iframe",url:"//player.vimeo.com/video/$2"},instagram:{matcher:/(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,type:"image",url:"//$1/p/$2/media/?size=l"},gmap_place:{matcher:/(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(((maps\/(place\/(.*)\/)?\@(.*),(\d+.?\d+?)z))|(\?ll=))(.*)?/i,type:"iframe",url:function(t){return"//maps.google."+t[2]+"/?ll="+(t[9]?t[9]+"&z="+Math.floor(t[10])+(t[12]?t[12].replace(/^\//,"&"):""):t[12]+"").replace(/\?/,"&")+"&output="+(t[12]&&t[12].indexOf("layer=c")>0?"svembed":"embed")}},gmap_search:{matcher:/(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(maps\/search\/)(.*)/i,type:"iframe",url:function(t){return"//maps.google."+t[2]+"/maps?q="+t[5].replace("query=","q=").replace("api=1","")+"&output=embed"}}},n=function(e,n,o){if(e)return o=o||"","object"===t.type(o)&&(o=t.param(o,!0)),t.each(n,function(t,n){e=e.replace("$"+t,n||"")}),o.length&&(e+=(e.indexOf("?")>0?"&":"?")+o),e};t(document).on("objectNeedsType.fb",function(o,i,a){var s,r,c,l,d,u,f,p=a.src||"",h=!1;s=t.extend(!0,{},e,a.opts.media),t.each(s,function(e,o){if(c=p.match(o.matcher)){if(h=o.type,f=e,u={},o.paramPlace&&c[o.paramPlace]){d=c[o.paramPlace],"?"==d[0]&&(d=d.substring(1)),d=d.split("&");for(var i=0;i<d.length;++i){var s=d[i].split("=",2);2==s.length&&(u[s[0]]=decodeURIComponent(s[1].replace(/\+/g," ")))}}return l=t.extend(!0,{},o.params,a.opts[e],u),p="function"===t.type(o.url)?o.url.call(this,c,l,a):n(o.url,c,l),r="function"===t.type(o.thumb)?o.thumb.call(this,c,l,a):n(o.thumb,c),"youtube"===e?p=p.replace(/&t=((\d+)m)?(\d+)s/,function(t,e,n,o){return"&start="+((n?60*parseInt(n,10):0)+parseInt(o,10))}):"vimeo"===e&&(p=p.replace("&%23","#")),!1}}),h?(a.opts.thumb||a.opts.$thumb&&a.opts.$thumb.length||(a.opts.thumb=r),"iframe"===h&&(a.opts=t.extend(!0,a.opts,{iframe:{preload:!1,attr:{scrolling:"no"}}})),t.extend(a,{type:h,src:p,origSrc:a.src,contentSource:f,contentType:"image"===h?"image":"gmap_place"==f||"gmap_search"==f?"map":"video"})):p&&(a.type=a.opts.defaultType)});var o={youtube:{src:"https://www.youtube.com/iframe_api",class:"YT",loading:!1,loaded:!1},vimeo:{src:"https://player.vimeo.com/api/player.js",class:"Vimeo",loading:!1,loaded:!1},load:function(t){var e,n=this;if(this[t].loaded)return void setTimeout(function(){n.done(t)});this[t].loading||(this[t].loading=!0,e=document.createElement("script"),e.type="text/javascript",e.src=this[t].src,"youtube"===t?window.onYouTubeIframeAPIReady=function(){n[t].loaded=!0,n.done(t)}:e.onload=function(){n[t].loaded=!0,n.done(t)},document.body.appendChild(e))},done:function(e){var n,o,i;"youtube"===e&&delete window.onYouTubeIframeAPIReady,(n=t.fancybox.getInstance())&&(o=n.current.$content.find("iframe"),"youtube"===e&&void 0!==YT&&YT?i=new YT.Player(o.attr("id"),{events:{onStateChange:function(t){0==t.data&&n.next()}}}):"vimeo"===e&&void 0!==Vimeo&&Vimeo&&(i=new Vimeo.Player(o),i.on("ended",function(){n.next()})))}};t(document).on({"afterShow.fb":function(t,e,n){e.group.length>1&&("youtube"===n.contentSource||"vimeo"===n.contentSource)&&o.load(n.contentSource)}})}(jQuery),function(t,e,n){"use strict";var o=function(){return t.requestAnimationFrame||t.webkitRequestAnimationFrame||t.mozRequestAnimationFrame||t.oRequestAnimationFrame||function(e){return t.setTimeout(e,1e3/60)}}(),i=function(){return t.cancelAnimationFrame||t.webkitCancelAnimationFrame||t.mozCancelAnimationFrame||t.oCancelAnimationFrame||function(e){t.clearTimeout(e)}}(),a=function(e){var n=[];e=e.originalEvent||e||t.e,e=e.touches&&e.touches.length?e.touches:e.changedTouches&&e.changedTouches.length?e.changedTouches:[e];for(var o in e)e[o].pageX?n.push({x:e[o].pageX,y:e[o].pageY}):e[o].clientX&&n.push({x:e[o].clientX,y:e[o].clientY});return n},s=function(t,e,n){return e&&t?"x"===n?t.x-e.x:"y"===n?t.y-e.y:Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2)):0},r=function(t){if(t.is('a,area,button,[role="button"],input,label,select,summary,textarea,video,audio,iframe')||n.isFunction(t.get(0).onclick)||t.data("selectable"))return!0;for(var e=0,o=t[0].attributes,i=o.length;e<i;e++)if("data-fancybox-"===o[e].nodeName.substr(0,14))return!0;return!1},c=function(e){var n=t.getComputedStyle(e)["overflow-y"],o=t.getComputedStyle(e)["overflow-x"],i=("scroll"===n||"auto"===n)&&e.scrollHeight>e.clientHeight,a=("scroll"===o||"auto"===o)&&e.scrollWidth>e.clientWidth;return i||a},l=function(t){for(var e=!1;;){if(e=c(t.get(0)))break;if(t=t.parent(),!t.length||t.hasClass("fancybox-stage")||t.is("body"))break}return e},d=function(t){var e=this;e.instance=t,e.$bg=t.$refs.bg,e.$stage=t.$refs.stage,e.$container=t.$refs.container,e.destroy(),e.$container.on("touchstart.fb.touch mousedown.fb.touch",n.proxy(e,"ontouchstart"))};d.prototype.destroy=function(){var t=this;t.$container.off(".fb.touch"),n(e).off(".fb.touch"),t.requestId&&(i(t.requestId),t.requestId=null),t.tapped&&(clearTimeout(t.tapped),t.tapped=null)},d.prototype.ontouchstart=function(o){var i=this,c=n(o.target),d=i.instance,u=d.current,f=u.$slide,p=u.$content,h="touchstart"==o.type;if(h&&i.$container.off("mousedown.fb.touch"),(!o.originalEvent||2!=o.originalEvent.button)&&f.length&&c.length&&!r(c)&&!r(c.parent())&&(c.is("img")||!(o.originalEvent.clientX>c[0].clientWidth+c.offset().left))){if(!u||d.isAnimating||u.$slide.hasClass("fancybox-animated"))return o.stopPropagation(),void o.preventDefault();i.realPoints=i.startPoints=a(o),i.startPoints.length&&(u.touch&&o.stopPropagation(),i.startEvent=o,i.canTap=!0,i.$target=c,i.$content=p,i.opts=u.opts.touch,i.isPanning=!1,i.isSwiping=!1,i.isZooming=!1,i.isScrolling=!1,i.canPan=d.canPan(),i.startTime=(new Date).getTime(),i.distanceX=i.distanceY=i.distance=0,i.canvasWidth=Math.round(f[0].clientWidth),i.canvasHeight=Math.round(f[0].clientHeight),i.contentLastPos=null,i.contentStartPos=n.fancybox.getTranslate(i.$content)||{top:0,left:0},i.sliderStartPos=n.fancybox.getTranslate(f),i.stagePos=n.fancybox.getTranslate(d.$refs.stage),i.sliderStartPos.top-=i.stagePos.top,i.sliderStartPos.left-=i.stagePos.left,i.contentStartPos.top-=i.stagePos.top,i.contentStartPos.left-=i.stagePos.left,n(e).off(".fb.touch").on(h?"touchend.fb.touch touchcancel.fb.touch":"mouseup.fb.touch mouseleave.fb.touch",n.proxy(i,"ontouchend")).on(h?"touchmove.fb.touch":"mousemove.fb.touch",n.proxy(i,"ontouchmove")),n.fancybox.isMobile&&e.addEventListener("scroll",i.onscroll,!0),((i.opts||i.canPan)&&(c.is(i.$stage)||i.$stage.find(c).length)||(c.is(".fancybox-image")&&o.preventDefault(),n.fancybox.isMobile&&c.parents(".fancybox-caption").length))&&(i.isScrollable=l(c)||l(c.parent()),n.fancybox.isMobile&&i.isScrollable||o.preventDefault(),(1===i.startPoints.length||u.hasError)&&(i.canPan?(n.fancybox.stop(i.$content),i.isPanning=!0):i.isSwiping=!0,i.$container.addClass("fancybox-is-grabbing")),2===i.startPoints.length&&"image"===u.type&&(u.isLoaded||u.$ghost)&&(i.canTap=!1,i.isSwiping=!1,i.isPanning=!1,i.isZooming=!0,n.fancybox.stop(i.$content),i.centerPointStartX=.5*(i.startPoints[0].x+i.startPoints[1].x)-n(t).scrollLeft(),i.centerPointStartY=.5*(i.startPoints[0].y+i.startPoints[1].y)-n(t).scrollTop(),i.percentageOfImageAtPinchPointX=(i.centerPointStartX-i.contentStartPos.left)/i.contentStartPos.width,i.percentageOfImageAtPinchPointY=(i.centerPointStartY-i.contentStartPos.top)/i.contentStartPos.height,i.startDistanceBetweenFingers=s(i.startPoints[0],i.startPoints[1]))))}},d.prototype.onscroll=function(t){var n=this;n.isScrolling=!0,e.removeEventListener("scroll",n.onscroll,!0)},d.prototype.ontouchmove=function(t){var e=this;return void 0!==t.originalEvent.buttons&&0===t.originalEvent.buttons?void e.ontouchend(t):e.isScrolling?void(e.canTap=!1):(e.newPoints=a(t),void((e.opts||e.canPan)&&e.newPoints.length&&e.newPoints.length&&(e.isSwiping&&!0===e.isSwiping||t.preventDefault(),e.distanceX=s(e.newPoints[0],e.startPoints[0],"x"),e.distanceY=s(e.newPoints[0],e.startPoints[0],"y"),e.distance=s(e.newPoints[0],e.startPoints[0]),e.distance>0&&(e.isSwiping?e.onSwipe(t):e.isPanning?e.onPan():e.isZooming&&e.onZoom()))))},d.prototype.onSwipe=function(e){var a,s=this,r=s.instance,c=s.isSwiping,l=s.sliderStartPos.left||0;if(!0!==c)"x"==c&&(s.distanceX>0&&(s.instance.group.length<2||0===s.instance.current.index&&!s.instance.current.opts.loop)?l+=Math.pow(s.distanceX,.8):s.distanceX<0&&(s.instance.group.length<2||s.instance.current.index===s.instance.group.length-1&&!s.instance.current.opts.loop)?l-=Math.pow(-s.distanceX,.8):l+=s.distanceX),s.sliderLastPos={top:"x"==c?0:s.sliderStartPos.top+s.distanceY,left:l},s.requestId&&(i(s.requestId),s.requestId=null),s.requestId=o(function(){s.sliderLastPos&&(n.each(s.instance.slides,function(t,e){var o=e.pos-s.instance.currPos;n.fancybox.setTranslate(e.$slide,{top:s.sliderLastPos.top,left:s.sliderLastPos.left+o*s.canvasWidth+o*e.opts.gutter})}),s.$container.addClass("fancybox-is-sliding"))});else if(Math.abs(s.distance)>10){if(s.canTap=!1,r.group.length<2&&s.opts.vertical?s.isSwiping="y":r.isDragging||!1===s.opts.vertical||"auto"===s.opts.vertical&&n(t).width()>800?s.isSwiping="x":(a=Math.abs(180*Math.atan2(s.distanceY,s.distanceX)/Math.PI),s.isSwiping=a>45&&a<135?"y":"x"),"y"===s.isSwiping&&n.fancybox.isMobile&&s.isScrollable)return void(s.isScrolling=!0);r.isDragging=s.isSwiping,s.startPoints=s.newPoints,n.each(r.slides,function(t,e){var o,i;n.fancybox.stop(e.$slide),o=n.fancybox.getTranslate(e.$slide),i=n.fancybox.getTranslate(r.$refs.stage),e.$slide.css({transform:"",opacity:"","transition-duration":""}).removeClass("fancybox-animated").removeClass(function(t,e){return(e.match(/(^|\s)fancybox-fx-\S+/g)||[]).join(" ")}),e.pos===r.current.pos&&(s.sliderStartPos.top=o.top-i.top,s.sliderStartPos.left=o.left-i.left),n.fancybox.setTranslate(e.$slide,{top:o.top-i.top,left:o.left-i.left})}),r.SlideShow&&r.SlideShow.isActive&&r.SlideShow.stop()}},d.prototype.onPan=function(){var t=this;if(s(t.newPoints[0],t.realPoints[0])<(n.fancybox.isMobile?10:5))return void(t.startPoints=t.newPoints);t.canTap=!1,t.contentLastPos=t.limitMovement(),t.requestId&&i(t.requestId),t.requestId=o(function(){n.fancybox.setTranslate(t.$content,t.contentLastPos)})},d.prototype.limitMovement=function(){var t,e,n,o,i,a,s=this,r=s.canvasWidth,c=s.canvasHeight,l=s.distanceX,d=s.distanceY,u=s.contentStartPos,f=u.left,p=u.top,h=u.width,g=u.height;return i=h>r?f+l:f,a=p+d,t=Math.max(0,.5*r-.5*h),e=Math.max(0,.5*c-.5*g),n=Math.min(r-h,.5*r-.5*h),o=Math.min(c-g,.5*c-.5*g),l>0&&i>t&&(i=t-1+Math.pow(-t+f+l,.8)||0),l<0&&i<n&&(i=n+1-Math.pow(n-f-l,.8)||0),d>0&&a>e&&(a=e-1+Math.pow(-e+p+d,.8)||0),d<0&&a<o&&(a=o+1-Math.pow(o-p-d,.8)||0),{top:a,left:i}},d.prototype.limitPosition=function(t,e,n,o){var i=this,a=i.canvasWidth,s=i.canvasHeight;return n>a?(t=t>0?0:t,t=t<a-n?a-n:t):t=Math.max(0,a/2-n/2),o>s?(e=e>0?0:e,e=e<s-o?s-o:e):e=Math.max(0,s/2-o/2),{top:e,left:t}},d.prototype.onZoom=function(){var e=this,a=e.contentStartPos,r=a.width,c=a.height,l=a.left,d=a.top,u=s(e.newPoints[0],e.newPoints[1]),f=u/e.startDistanceBetweenFingers,p=Math.floor(r*f),h=Math.floor(c*f),g=(r-p)*e.percentageOfImageAtPinchPointX,b=(c-h)*e.percentageOfImageAtPinchPointY,m=(e.newPoints[0].x+e.newPoints[1].x)/2-n(t).scrollLeft(),v=(e.newPoints[0].y+e.newPoints[1].y)/2-n(t).scrollTop(),y=m-e.centerPointStartX,x=v-e.centerPointStartY,w=l+(g+y),$=d+(b+x),S={top:$,left:w,scaleX:f,scaleY:f};e.canTap=!1,e.newWidth=p,e.newHeight=h,e.contentLastPos=S,e.requestId&&i(e.requestId),e.requestId=o(function(){n.fancybox.setTranslate(e.$content,e.contentLastPos)})},d.prototype.ontouchend=function(t){var o=this,s=o.isSwiping,r=o.isPanning,c=o.isZooming,l=o.isScrolling;if(o.endPoints=a(t),o.dMs=Math.max((new Date).getTime()-o.startTime,1),o.$container.removeClass("fancybox-is-grabbing"),n(e).off(".fb.touch"),e.removeEventListener("scroll",o.onscroll,!0),o.requestId&&(i(o.requestId),o.requestId=null),o.isSwiping=!1,o.isPanning=!1,o.isZooming=!1,o.isScrolling=!1,o.instance.isDragging=!1,o.canTap)return o.onTap(t);o.speed=100,o.velocityX=o.distanceX/o.dMs*.5,o.velocityY=o.distanceY/o.dMs*.5,r?o.endPanning():c?o.endZooming():o.endSwiping(s,l)},d.prototype.endSwiping=function(t,e){var o=this,i=!1,a=o.instance.group.length,s=Math.abs(o.distanceX),r="x"==t&&a>1&&(o.dMs>130&&s>10||s>50);o.sliderLastPos=null,"y"==t&&!e&&Math.abs(o.distanceY)>50?(n.fancybox.animate(o.instance.current.$slide,{top:o.sliderStartPos.top+o.distanceY+150*o.velocityY,opacity:0},200),i=o.instance.close(!0,250)):r&&o.distanceX>0?i=o.instance.previous(300):r&&o.distanceX<0&&(i=o.instance.next(300)),!1!==i||"x"!=t&&"y"!=t||o.instance.centerSlide(200),o.$container.removeClass("fancybox-is-sliding")},d.prototype.endPanning=function(){var t,e,o,i=this;i.contentLastPos&&(!1===i.opts.momentum||i.dMs>350?(t=i.contentLastPos.left,e=i.contentLastPos.top):(t=i.contentLastPos.left+500*i.velocityX,e=i.contentLastPos.top+500*i.velocityY),o=i.limitPosition(t,e,i.contentStartPos.width,i.contentStartPos.height),o.width=i.contentStartPos.width,o.height=i.contentStartPos.height,n.fancybox.animate(i.$content,o,366))},d.prototype.endZooming=function(){var t,e,o,i,a=this,s=a.instance.current,r=a.newWidth,c=a.newHeight;a.contentLastPos&&(t=a.contentLastPos.left,e=a.contentLastPos.top,i={top:e,left:t,width:r,height:c,scaleX:1,scaleY:1},n.fancybox.setTranslate(a.$content,i),r<a.canvasWidth&&c<a.canvasHeight?a.instance.scaleToFit(150):r>s.width||c>s.height?a.instance.scaleToActual(a.centerPointStartX,a.centerPointStartY,150):(o=a.limitPosition(t,e,r,c),n.fancybox.animate(a.$content,o,150)))},d.prototype.onTap=function(e){var o,i=this,s=n(e.target),r=i.instance,c=r.current,l=e&&a(e)||i.startPoints,d=l[0]?l[0].x-n(t).scrollLeft()-i.stagePos.left:0,u=l[0]?l[0].y-n(t).scrollTop()-i.stagePos.top:0,f=function(t){var o=c.opts[t];if(n.isFunction(o)&&(o=o.apply(r,[c,e])),o)switch(o){case"close":r.close(i.startEvent);break;case"toggleControls":r.toggleControls();break;case"next":r.next();break;case"nextOrClose":r.group.length>1?r.next():r.close(i.startEvent);break;case"zoom":"image"==c.type&&(c.isLoaded||c.$ghost)&&(r.canPan()?r.scaleToFit():r.isScaledDown()?r.scaleToActual(d,u):r.group.length<2&&r.close(i.startEvent))}};if((!e.originalEvent||2!=e.originalEvent.button)&&(s.is("img")||!(d>s[0].clientWidth+s.offset().left))){if(s.is(".fancybox-bg,.fancybox-inner,.fancybox-outer,.fancybox-container"))o="Outside";else if(s.is(".fancybox-slide"))o="Slide";else{if(!r.current.$content||!r.current.$content.find(s).addBack().filter(s).length)return;o="Content"}if(i.tapped){if(clearTimeout(i.tapped),i.tapped=null,Math.abs(d-i.tapX)>50||Math.abs(u-i.tapY)>50)return this;f("dblclick"+o)}else i.tapX=d,i.tapY=u,c.opts["dblclick"+o]&&c.opts["dblclick"+o]!==c.opts["click"+o]?i.tapped=setTimeout(function(){i.tapped=null,r.isAnimating||f("click"+o)},500):f("click"+o);return this}},n(e).on("onActivate.fb",function(t,e){e&&!e.Guestures&&(e.Guestures=new d(e))}).on("beforeClose.fb",function(t,e){e&&e.Guestures&&e.Guestures.destroy()})}(window,document,jQuery),function(t,e){"use strict";e.extend(!0,e.fancybox.defaults,{btnTpl:{slideShow:'<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.5 5.4v13.2l11-6.6z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.33 5.75h2.2v12.5h-2.2V5.75zm5.15 0h2.2v12.5h-2.2V5.75z"/></svg></button>'},slideShow:{autoStart:!1,speed:3e3,progress:!0}});var n=function(t){this.instance=t,this.init()};e.extend(n.prototype,{timer:null,isActive:!1,$button:null,init:function(){var t=this,n=t.instance,o=n.group[n.currIndex].opts.slideShow;t.$button=n.$refs.toolbar.find("[data-fancybox-play]").on("click",function(){t.toggle()}),n.group.length<2||!o?t.$button.hide():o.progress&&(t.$progress=e('<div class="fancybox-progress"></div>').appendTo(n.$refs.inner))},set:function(t){var n=this,o=n.instance,i=o.current;i&&(!0===t||i.opts.loop||o.currIndex<o.group.length-1)?n.isActive&&"video"!==i.contentType&&(n.$progress&&e.fancybox.animate(n.$progress.show(),{scaleX:1},i.opts.slideShow.speed),n.timer=setTimeout(function(){o.current.opts.loop||o.current.index!=o.group.length-1?o.next():o.jumpTo(0)},i.opts.slideShow.speed)):(n.stop(),o.idleSecondsCounter=0,o.showControls())},clear:function(){var t=this;clearTimeout(t.timer),t.timer=null,t.$progress&&t.$progress.removeAttr("style").hide()},start:function(){var t=this,e=t.instance.current;e&&(t.$button.attr("title",(e.opts.i18n[e.opts.lang]||e.opts.i18n.en).PLAY_STOP).removeClass("fancybox-button--play").addClass("fancybox-button--pause"),t.isActive=!0,e.isComplete&&t.set(!0),t.instance.trigger("onSlideShowChange",!0))},stop:function(){var t=this,e=t.instance.current;t.clear(),t.$button.attr("title",(e.opts.i18n[e.opts.lang]||e.opts.i18n.en).PLAY_START).removeClass("fancybox-button--pause").addClass("fancybox-button--play"),t.isActive=!1,t.instance.trigger("onSlideShowChange",!1),t.$progress&&t.$progress.removeAttr("style").hide()},toggle:function(){var t=this;t.isActive?t.stop():t.start()}}),e(t).on({"onInit.fb":function(t,e){e&&!e.SlideShow&&(e.SlideShow=new n(e))},"beforeShow.fb":function(t,e,n,o){var i=e&&e.SlideShow;o?i&&n.opts.slideShow.autoStart&&i.start():i&&i.isActive&&i.clear()},"afterShow.fb":function(t,e,n){var o=e&&e.SlideShow;o&&o.isActive&&o.set()},"afterKeydown.fb":function(n,o,i,a,s){var r=o&&o.SlideShow;!r||!i.opts.slideShow||80!==s&&32!==s||e(t.activeElement).is("button,a,input")||(a.preventDefault(),r.toggle())},"beforeClose.fb onDeactivate.fb":function(t,e){var n=e&&e.SlideShow;n&&n.stop()}}),e(t).on("visibilitychange",function(){var n=e.fancybox.getInstance(),o=n&&n.SlideShow;o&&o.isActive&&(t.hidden?o.clear():o.set())})}(document,jQuery),function(t,e){"use strict";var n=function(){for(var e=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],n={},o=0;o<e.length;o++){var i=e[o];if(i&&i[1]in t){for(var a=0;a<i.length;a++)n[e[0][a]]=i[a];return n}}return!1}();if(n){var o={request:function(e){e=e||t.documentElement,e[n.requestFullscreen](e.ALLOW_KEYBOARD_INPUT)},exit:function(){t[n.exitFullscreen]()},toggle:function(e){e=e||t.documentElement,this.isFullscreen()?this.exit():this.request(e)},isFullscreen:function(){return Boolean(t[n.fullscreenElement])},enabled:function(){return Boolean(t[n.fullscreenEnabled])}};e.extend(!0,e.fancybox.defaults,{btnTpl:{fullScreen:'<button data-fancybox-fullscreen class="fancybox-button fancybox-button--fsenter" title="{{FULL_SCREEN}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"/></svg></button>'},fullScreen:{autoStart:!1}}),e(t).on(n.fullscreenchange,function(){var t=o.isFullscreen(),n=e.fancybox.getInstance();n&&(n.current&&"image"===n.current.type&&n.isAnimating&&(n.isAnimating=!1,n.update(!0,!0,0),n.isComplete||n.complete()),n.trigger("onFullscreenChange",t),n.$refs.container.toggleClass("fancybox-is-fullscreen",t),n.$refs.toolbar.find("[data-fancybox-fullscreen]").toggleClass("fancybox-button--fsenter",!t).toggleClass("fancybox-button--fsexit",t))})}e(t).on({"onInit.fb":function(t,e){var i;if(!n)return void e.$refs.toolbar.find("[data-fancybox-fullscreen]").remove();e&&e.group[e.currIndex].opts.fullScreen?(i=e.$refs.container,i.on("click.fb-fullscreen","[data-fancybox-fullscreen]",function(t){t.stopPropagation(),t.preventDefault(),o.toggle()}),e.opts.fullScreen&&!0===e.opts.fullScreen.autoStart&&o.request(),e.FullScreen=o):e&&e.$refs.toolbar.find("[data-fancybox-fullscreen]").hide()},"afterKeydown.fb":function(t,e,n,o,i){e&&e.FullScreen&&70===i&&(o.preventDefault(),e.FullScreen.toggle())},"beforeClose.fb":function(t,e){e&&e.FullScreen&&e.$refs.container.hasClass("fancybox-is-fullscreen")&&o.exit()}})}(document,jQuery),function(t,e){"use strict";var n="fancybox-thumbs";e.fancybox.defaults=e.extend(!0,{btnTpl:{thumbs:'<button data-fancybox-thumbs class="fancybox-button fancybox-button--thumbs" title="{{THUMBS}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.59 14.59h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76H5.65v-3.76zm8.94-4.47h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76h-3.76v-3.76zm-4.47 0h3.76v3.76H5.65v-3.76zm8.94-4.47h3.76v3.76h-3.76V5.65zm-4.47 0h3.76v3.76h-3.76V5.65zm-4.47 0h3.76v3.76H5.65V5.65z"/></svg></button>'},thumbs:{autoStart:!1,hideOnClose:!0,parentEl:".fancybox-container",axis:"y"}},e.fancybox.defaults);var o=function(t){this.init(t)};e.extend(o.prototype,{$button:null,$grid:null,$list:null,isVisible:!1,isActive:!1,init:function(t){var e=this,n=t.group,o=0;e.instance=t,e.opts=n[t.currIndex].opts.thumbs,t.Thumbs=e,e.$button=t.$refs.toolbar.find("[data-fancybox-thumbs]");for(var i=0,a=n.length;i<a&&(n[i].thumb&&o++,!(o>1));i++);o>1&&e.opts?(e.$button.removeAttr("style").on("click",function(){e.toggle()}),e.isActive=!0):e.$button.hide()},create:function(){var t,o=this,i=o.instance,a=o.opts.parentEl,s=[];o.$grid||(o.$grid=e('<div class="'+n+" "+n+"-"+o.opts.axis+'"></div>').appendTo(i.$refs.container.find(a).addBack().filter(a)),o.$grid.on("click","a",function(){i.jumpTo(e(this).attr("data-index"))})),o.$list||(o.$list=e('<div class="'+n+'__list">').appendTo(o.$grid)),e.each(i.group,function(e,n){t=n.thumb,t||"image"!==n.type||(t=n.src),s.push('<a href="javascript:;" tabindex="0" data-index="'+e+'"'+(t&&t.length?' style="background-image:url('+t+')"':'class="fancybox-thumbs-missing"')+"></a>")}),o.$list[0].innerHTML=s.join(""),"x"===o.opts.axis&&o.$list.width(parseInt(o.$grid.css("padding-right"),10)+i.group.length*o.$list.children().eq(0).outerWidth(!0))},focus:function(t){var e,n,o=this,i=o.$list,a=o.$grid;o.instance.current&&(e=i.children().removeClass("fancybox-thumbs-active").filter('[data-index="'+o.instance.current.index+'"]').addClass("fancybox-thumbs-active"),n=e.position(),"y"===o.opts.axis&&(n.top<0||n.top>i.height()-e.outerHeight())?i.stop().animate({scrollTop:i.scrollTop()+n.top},t):"x"===o.opts.axis&&(n.left<a.scrollLeft()||n.left>a.scrollLeft()+(a.width()-e.outerWidth()))&&i.parent().stop().animate({scrollLeft:n.left},t))},update:function(){var t=this;t.instance.$refs.container.toggleClass("fancybox-show-thumbs",this.isVisible),t.isVisible?(t.$grid||t.create(),t.instance.trigger("onThumbsShow"),t.focus(0)):t.$grid&&t.instance.trigger("onThumbsHide"),t.instance.update()},hide:function(){this.isVisible=!1,this.update()},show:function(){this.isVisible=!0,this.update()},toggle:function(){this.isVisible=!this.isVisible,this.update()}}),e(t).on({"onInit.fb":function(t,e){var n;e&&!e.Thumbs&&(n=new o(e),n.isActive&&!0===n.opts.autoStart&&n.show())},"beforeShow.fb":function(t,e,n,o){var i=e&&e.Thumbs;i&&i.isVisible&&i.focus(o?0:250)},"afterKeydown.fb":function(t,e,n,o,i){var a=e&&e.Thumbs;a&&a.isActive&&71===i&&(o.preventDefault(),a.toggle())},"beforeClose.fb":function(t,e){var n=e&&e.Thumbs;n&&n.isVisible&&!1!==n.opts.hideOnClose&&n.$grid.hide()}})}(document,jQuery),function(t,e){"use strict";function n(t){var e={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};return String(t).replace(/[&<>"'`=\/]/g,function(t){return e[t]})}e.extend(!0,e.fancybox.defaults,{btnTpl:{share:'<button data-fancybox-share class="fancybox-button fancybox-button--share" title="{{SHARE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2.55 19c1.4-8.4 9.1-9.8 11.9-9.8V5l7 7-7 6.3v-3.5c-2.8 0-10.5 2.1-11.9 4.2z"/></svg></button>'},share:{url:function(t,e){return!t.currentHash&&"inline"!==e.type&&"html"!==e.type&&(e.origSrc||e.src)||window.location},
tpl:'<div class="fancybox-share"><h1>{{SHARE}}</h1><p><a class="fancybox-share__button fancybox-share__button--fb" href="https://www.facebook.com/sharer/sharer.php?u={{url}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m287 456v-299c0-21 6-35 35-35h38v-63c-7-1-29-3-55-3-54 0-91 33-91 94v306m143-254h-205v72h196" /></svg><span>Facebook</span></a><a class="fancybox-share__button fancybox-share__button--tw" href="https://twitter.com/intent/tweet?url={{url}}&text={{descr}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m456 133c-14 7-31 11-47 13 17-10 30-27 37-46-15 10-34 16-52 20-61-62-157-7-141 75-68-3-129-35-169-85-22 37-11 86 26 109-13 0-26-4-37-9 0 39 28 72 65 80-12 3-25 4-37 2 10 33 41 57 77 57-42 30-77 38-122 34 170 111 378-32 359-208 16-11 30-25 41-42z" /></svg><span>Twitter</span></a><a class="fancybox-share__button fancybox-share__button--pt" href="https://www.pinterest.com/pin/create/button/?url={{url}}&description={{descr}}&media={{media}}"><svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path d="m265 56c-109 0-164 78-164 144 0 39 15 74 47 87 5 2 10 0 12-5l4-19c2-6 1-8-3-13-9-11-15-25-15-45 0-58 43-110 113-110 62 0 96 38 96 88 0 67-30 122-73 122-24 0-42-19-36-44 6-29 20-60 20-81 0-19-10-35-31-35-25 0-44 26-44 60 0 21 7 36 7 36l-30 125c-8 37-1 83 0 87 0 3 4 4 5 2 2-3 32-39 42-75l16-64c8 16 31 29 56 29 74 0 124-67 124-157 0-69-58-132-146-132z" fill="#fff"/></svg><span>Pinterest</span></a></p><p><input class="fancybox-share__input" type="text" value="{{url_raw}}" onclick="select()" /></p></div>'}}),e(t).on("click","[data-fancybox-share]",function(){var t,o,i=e.fancybox.getInstance(),a=i.current||null;a&&("function"===e.type(a.opts.share.url)&&(t=a.opts.share.url.apply(a,[i,a])),o=a.opts.share.tpl.replace(/\{\{media\}\}/g,"image"===a.type?encodeURIComponent(a.src):"").replace(/\{\{url\}\}/g,encodeURIComponent(t)).replace(/\{\{url_raw\}\}/g,n(t)).replace(/\{\{descr\}\}/g,i.$caption?encodeURIComponent(i.$caption.text()):""),e.fancybox.open({src:i.translate(i,o),type:"html",opts:{touch:!1,animationEffect:!1,afterLoad:function(t,e){i.$refs.container.one("beforeClose.fb",function(){t.close(null,0)}),e.$content.find(".fancybox-share__button").click(function(){return window.open(this.href,"Share","width=550, height=450"),!1})},mobile:{autoFocus:!1}}}))})}(document,jQuery),function(t,e,n){"use strict";function o(){var e=t.location.hash.substr(1),n=e.split("-"),o=n.length>1&&/^\+?\d+$/.test(n[n.length-1])?parseInt(n.pop(-1),10)||1:1,i=n.join("-");return{hash:e,index:o<1?1:o,gallery:i}}function i(t){""!==t.gallery&&n("[data-fancybox='"+n.escapeSelector(t.gallery)+"']").eq(t.index-1).focus().trigger("click.fb-start")}function a(t){var e,n;return!!t&&(e=t.current?t.current.opts:t.opts,""!==(n=e.hash||(e.$orig?e.$orig.data("fancybox")||e.$orig.data("fancybox-trigger"):""))&&n)}n.escapeSelector||(n.escapeSelector=function(t){return(t+"").replace(/([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g,function(t,e){return e?"\0"===t?"�":t.slice(0,-1)+"\\"+t.charCodeAt(t.length-1).toString(16)+" ":"\\"+t})}),n(function(){!1!==n.fancybox.defaults.hash&&(n(e).on({"onInit.fb":function(t,e){var n,i;!1!==e.group[e.currIndex].opts.hash&&(n=o(),(i=a(e))&&n.gallery&&i==n.gallery&&(e.currIndex=n.index-1))},"beforeShow.fb":function(n,o,i,s){var r;i&&!1!==i.opts.hash&&(r=a(o))&&(o.currentHash=r+(o.group.length>1?"-"+(i.index+1):""),t.location.hash!=="#"+o.currentHash&&(s&&!o.origHash&&(o.origHash=t.location.hash),o.hashTimer&&clearTimeout(o.hashTimer),o.hashTimer=setTimeout(function(){"replaceState"in t.history?(t.history[s?"pushState":"replaceState"]({},e.title,t.location.pathname+t.location.search+"#"+o.currentHash),s&&(o.hasCreatedHistory=!0)):t.location.hash=o.currentHash,o.hashTimer=null},300)))},"beforeClose.fb":function(n,o,i){i&&!1!==i.opts.hash&&(clearTimeout(o.hashTimer),o.currentHash&&o.hasCreatedHistory?t.history.back():o.currentHash&&("replaceState"in t.history?t.history.replaceState({},e.title,t.location.pathname+t.location.search+(o.origHash||"")):t.location.hash=o.origHash),o.currentHash=null)}}),n(t).on("hashchange.fb",function(){var t=o(),e=null;n.each(n(".fancybox-container").get().reverse(),function(t,o){var i=n(o).data("FancyBox");if(i&&i.currentHash)return e=i,!1}),e?e.currentHash===t.gallery+"-"+t.index||1===t.index&&e.currentHash==t.gallery||(e.currentHash=null,e.close()):""!==t.gallery&&i(t)}),setTimeout(function(){n.fancybox.getInstance()||i(o())},50))})}(window,document,jQuery),function(t,e){"use strict";var n=(new Date).getTime();e(t).on({"onInit.fb":function(t,e,o){e.$refs.stage.on("mousewheel DOMMouseScroll wheel MozMousePixelScroll",function(t){var o=e.current,i=(new Date).getTime();e.group.length<2||!1===o.opts.wheel||"auto"===o.opts.wheel&&"image"!==o.type||(t.preventDefault(),t.stopPropagation(),o.$slide.hasClass("fancybox-animated")||(t=t.originalEvent||t,i-n<250||(n=i,e[(-t.deltaY||-t.deltaX||t.wheelDelta||-t.detail)<0?"next":"previous"]())))})}})}(document,jQuery);;
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none') {
			return true;
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());
;
/**
 * Swiper 5.3.6
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * http://swiperjs.com
 *
 * Copyright 2014-2020 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: February 29, 2020
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).Swiper=t()}(this,(function(){"use strict";var e="undefined"==typeof document?{body:{},addEventListener:function(){},removeEventListener:function(){},activeElement:{blur:function(){},nodeName:""},querySelector:function(){return null},querySelectorAll:function(){return[]},getElementById:function(){return null},createEvent:function(){return{initEvent:function(){}}},createElement:function(){return{children:[],childNodes:[],style:{},setAttribute:function(){},getElementsByTagName:function(){return[]}}},location:{hash:""}}:document,t="undefined"==typeof window?{document:e,navigator:{userAgent:""},location:{},history:{},CustomEvent:function(){return this},addEventListener:function(){},removeEventListener:function(){},getComputedStyle:function(){return{getPropertyValue:function(){return""}}},Image:function(){},Date:function(){},screen:{},setTimeout:function(){},clearTimeout:function(){}}:window,i=function(e){for(var t=0;t<e.length;t+=1)this[t]=e[t];return this.length=e.length,this};function s(s,a){var r=[],n=0;if(s&&!a&&s instanceof i)return s;if(s)if("string"==typeof s){var o,l,d=s.trim();if(d.indexOf("<")>=0&&d.indexOf(">")>=0){var h="div";for(0===d.indexOf("<li")&&(h="ul"),0===d.indexOf("<tr")&&(h="tbody"),0!==d.indexOf("<td")&&0!==d.indexOf("<th")||(h="tr"),0===d.indexOf("<tbody")&&(h="table"),0===d.indexOf("<option")&&(h="select"),(l=e.createElement(h)).innerHTML=d,n=0;n<l.childNodes.length;n+=1)r.push(l.childNodes[n])}else for(o=a||"#"!==s[0]||s.match(/[ .<>:~]/)?(a||e).querySelectorAll(s.trim()):[e.getElementById(s.trim().split("#")[1])],n=0;n<o.length;n+=1)o[n]&&r.push(o[n])}else if(s.nodeType||s===t||s===e)r.push(s);else if(s.length>0&&s[0].nodeType)for(n=0;n<s.length;n+=1)r.push(s[n]);return new i(r)}function a(e){for(var t=[],i=0;i<e.length;i+=1)-1===t.indexOf(e[i])&&t.push(e[i]);return t}s.fn=i.prototype,s.Class=i,s.Dom7=i;var r={addClass:function(e){if(void 0===e)return this;for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s]&&void 0!==this[s].classList&&this[s].classList.add(t[i]);return this},removeClass:function(e){for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s]&&void 0!==this[s].classList&&this[s].classList.remove(t[i]);return this},hasClass:function(e){return!!this[0]&&this[0].classList.contains(e)},toggleClass:function(e){for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s]&&void 0!==this[s].classList&&this[s].classList.toggle(t[i]);return this},attr:function(e,t){var i=arguments;if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(var s=0;s<this.length;s+=1)if(2===i.length)this[s].setAttribute(e,t);else for(var a in e)this[s][a]=e[a],this[s].setAttribute(a,e[a]);return this},removeAttr:function(e){for(var t=0;t<this.length;t+=1)this[t].removeAttribute(e);return this},data:function(e,t){var i;if(void 0!==t){for(var s=0;s<this.length;s+=1)(i=this[s]).dom7ElementDataStorage||(i.dom7ElementDataStorage={}),i.dom7ElementDataStorage[e]=t;return this}if(i=this[0]){if(i.dom7ElementDataStorage&&e in i.dom7ElementDataStorage)return i.dom7ElementDataStorage[e];var a=i.getAttribute("data-"+e);return a||void 0}},transform:function(e){for(var t=0;t<this.length;t+=1){var i=this[t].style;i.webkitTransform=e,i.transform=e}return this},transition:function(e){"string"!=typeof e&&(e+="ms");for(var t=0;t<this.length;t+=1){var i=this[t].style;i.webkitTransitionDuration=e,i.transitionDuration=e}return this},on:function(){for(var e,t=[],i=arguments.length;i--;)t[i]=arguments[i];var a=t[0],r=t[1],n=t[2],o=t[3];function l(e){var t=e.target;if(t){var i=e.target.dom7EventData||[];if(i.indexOf(e)<0&&i.unshift(e),s(t).is(r))n.apply(t,i);else for(var a=s(t).parents(),o=0;o<a.length;o+=1)s(a[o]).is(r)&&n.apply(a[o],i)}}function d(e){var t=e&&e.target&&e.target.dom7EventData||[];t.indexOf(e)<0&&t.unshift(e),n.apply(this,t)}"function"==typeof t[1]&&(a=(e=t)[0],n=e[1],o=e[2],r=void 0),o||(o=!1);for(var h,p=a.split(" "),c=0;c<this.length;c+=1){var u=this[c];if(r)for(h=0;h<p.length;h+=1){var v=p[h];u.dom7LiveListeners||(u.dom7LiveListeners={}),u.dom7LiveListeners[v]||(u.dom7LiveListeners[v]=[]),u.dom7LiveListeners[v].push({listener:n,proxyListener:l}),u.addEventListener(v,l,o)}else for(h=0;h<p.length;h+=1){var f=p[h];u.dom7Listeners||(u.dom7Listeners={}),u.dom7Listeners[f]||(u.dom7Listeners[f]=[]),u.dom7Listeners[f].push({listener:n,proxyListener:d}),u.addEventListener(f,d,o)}}return this},off:function(){for(var e,t=[],i=arguments.length;i--;)t[i]=arguments[i];var s=t[0],a=t[1],r=t[2],n=t[3];"function"==typeof t[1]&&(s=(e=t)[0],r=e[1],n=e[2],a=void 0),n||(n=!1);for(var o=s.split(" "),l=0;l<o.length;l+=1)for(var d=o[l],h=0;h<this.length;h+=1){var p=this[h],c=void 0;if(!a&&p.dom7Listeners?c=p.dom7Listeners[d]:a&&p.dom7LiveListeners&&(c=p.dom7LiveListeners[d]),c&&c.length)for(var u=c.length-1;u>=0;u-=1){var v=c[u];r&&v.listener===r?(p.removeEventListener(d,v.proxyListener,n),c.splice(u,1)):r&&v.listener&&v.listener.dom7proxy&&v.listener.dom7proxy===r?(p.removeEventListener(d,v.proxyListener,n),c.splice(u,1)):r||(p.removeEventListener(d,v.proxyListener,n),c.splice(u,1))}}return this},trigger:function(){for(var i=[],s=arguments.length;s--;)i[s]=arguments[s];for(var a=i[0].split(" "),r=i[1],n=0;n<a.length;n+=1)for(var o=a[n],l=0;l<this.length;l+=1){var d=this[l],h=void 0;try{h=new t.CustomEvent(o,{detail:r,bubbles:!0,cancelable:!0})}catch(t){(h=e.createEvent("Event")).initEvent(o,!0,!0),h.detail=r}d.dom7EventData=i.filter((function(e,t){return t>0})),d.dispatchEvent(h),d.dom7EventData=[],delete d.dom7EventData}return this},transitionEnd:function(e){var t,i=["webkitTransitionEnd","transitionend"],s=this;function a(r){if(r.target===this)for(e.call(this,r),t=0;t<i.length;t+=1)s.off(i[t],a)}if(e)for(t=0;t<i.length;t+=1)s.on(i[t],a);return this},outerWidth:function(e){if(this.length>0){if(e){var t=this.styles();return this[0].offsetWidth+parseFloat(t.getPropertyValue("margin-right"))+parseFloat(t.getPropertyValue("margin-left"))}return this[0].offsetWidth}return null},outerHeight:function(e){if(this.length>0){if(e){var t=this.styles();return this[0].offsetHeight+parseFloat(t.getPropertyValue("margin-top"))+parseFloat(t.getPropertyValue("margin-bottom"))}return this[0].offsetHeight}return null},offset:function(){if(this.length>0){var i=this[0],s=i.getBoundingClientRect(),a=e.body,r=i.clientTop||a.clientTop||0,n=i.clientLeft||a.clientLeft||0,o=i===t?t.scrollY:i.scrollTop,l=i===t?t.scrollX:i.scrollLeft;return{top:s.top+o-r,left:s.left+l-n}}return null},css:function(e,i){var s;if(1===arguments.length){if("string"!=typeof e){for(s=0;s<this.length;s+=1)for(var a in e)this[s].style[a]=e[a];return this}if(this[0])return t.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(s=0;s<this.length;s+=1)this[s].style[e]=i;return this}return this},each:function(e){if(!e)return this;for(var t=0;t<this.length;t+=1)if(!1===e.call(this[t],t,this[t]))return this;return this},html:function(e){if(void 0===e)return this[0]?this[0].innerHTML:void 0;for(var t=0;t<this.length;t+=1)this[t].innerHTML=e;return this},text:function(e){if(void 0===e)return this[0]?this[0].textContent.trim():null;for(var t=0;t<this.length;t+=1)this[t].textContent=e;return this},is:function(a){var r,n,o=this[0];if(!o||void 0===a)return!1;if("string"==typeof a){if(o.matches)return o.matches(a);if(o.webkitMatchesSelector)return o.webkitMatchesSelector(a);if(o.msMatchesSelector)return o.msMatchesSelector(a);for(r=s(a),n=0;n<r.length;n+=1)if(r[n]===o)return!0;return!1}if(a===e)return o===e;if(a===t)return o===t;if(a.nodeType||a instanceof i){for(r=a.nodeType?[a]:a,n=0;n<r.length;n+=1)if(r[n]===o)return!0;return!1}return!1},index:function(){var e,t=this[0];if(t){for(e=0;null!==(t=t.previousSibling);)1===t.nodeType&&(e+=1);return e}},eq:function(e){if(void 0===e)return this;var t,s=this.length;return new i(e>s-1?[]:e<0?(t=s+e)<0?[]:[this[t]]:[this[e]])},append:function(){for(var t,s=[],a=arguments.length;a--;)s[a]=arguments[a];for(var r=0;r<s.length;r+=1){t=s[r];for(var n=0;n<this.length;n+=1)if("string"==typeof t){var o=e.createElement("div");for(o.innerHTML=t;o.firstChild;)this[n].appendChild(o.firstChild)}else if(t instanceof i)for(var l=0;l<t.length;l+=1)this[n].appendChild(t[l]);else this[n].appendChild(t)}return this},prepend:function(t){var s,a;for(s=0;s<this.length;s+=1)if("string"==typeof t){var r=e.createElement("div");for(r.innerHTML=t,a=r.childNodes.length-1;a>=0;a-=1)this[s].insertBefore(r.childNodes[a],this[s].childNodes[0])}else if(t instanceof i)for(a=0;a<t.length;a+=1)this[s].insertBefore(t[a],this[s].childNodes[0]);else this[s].insertBefore(t,this[s].childNodes[0]);return this},next:function(e){return this.length>0?e?this[0].nextElementSibling&&s(this[0].nextElementSibling).is(e)?new i([this[0].nextElementSibling]):new i([]):this[0].nextElementSibling?new i([this[0].nextElementSibling]):new i([]):new i([])},nextAll:function(e){var t=[],a=this[0];if(!a)return new i([]);for(;a.nextElementSibling;){var r=a.nextElementSibling;e?s(r).is(e)&&t.push(r):t.push(r),a=r}return new i(t)},prev:function(e){if(this.length>0){var t=this[0];return e?t.previousElementSibling&&s(t.previousElementSibling).is(e)?new i([t.previousElementSibling]):new i([]):t.previousElementSibling?new i([t.previousElementSibling]):new i([])}return new i([])},prevAll:function(e){var t=[],a=this[0];if(!a)return new i([]);for(;a.previousElementSibling;){var r=a.previousElementSibling;e?s(r).is(e)&&t.push(r):t.push(r),a=r}return new i(t)},parent:function(e){for(var t=[],i=0;i<this.length;i+=1)null!==this[i].parentNode&&(e?s(this[i].parentNode).is(e)&&t.push(this[i].parentNode):t.push(this[i].parentNode));return s(a(t))},parents:function(e){for(var t=[],i=0;i<this.length;i+=1)for(var r=this[i].parentNode;r;)e?s(r).is(e)&&t.push(r):t.push(r),r=r.parentNode;return s(a(t))},closest:function(e){var t=this;return void 0===e?new i([]):(t.is(e)||(t=t.parents(e).eq(0)),t)},find:function(e){for(var t=[],s=0;s<this.length;s+=1)for(var a=this[s].querySelectorAll(e),r=0;r<a.length;r+=1)t.push(a[r]);return new i(t)},children:function(e){for(var t=[],r=0;r<this.length;r+=1)for(var n=this[r].childNodes,o=0;o<n.length;o+=1)e?1===n[o].nodeType&&s(n[o]).is(e)&&t.push(n[o]):1===n[o].nodeType&&t.push(n[o]);return new i(a(t))},filter:function(e){for(var t=[],s=0;s<this.length;s+=1)e.call(this[s],s,this[s])&&t.push(this[s]);return new i(t)},remove:function(){for(var e=0;e<this.length;e+=1)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this},add:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var i,a;for(i=0;i<e.length;i+=1){var r=s(e[i]);for(a=0;a<r.length;a+=1)this[this.length]=r[a],this.length+=1}return this},styles:function(){return this[0]?t.getComputedStyle(this[0],null):{}}};Object.keys(r).forEach((function(e){s.fn[e]=s.fn[e]||r[e]}));var n={deleteProps:function(e){var t=e;Object.keys(t).forEach((function(e){try{t[e]=null}catch(e){}try{delete t[e]}catch(e){}}))},nextTick:function(e,t){return void 0===t&&(t=0),setTimeout(e,t)},now:function(){return Date.now()},getTranslate:function(e,i){var s,a,r;void 0===i&&(i="x");var n=t.getComputedStyle(e,null);return t.WebKitCSSMatrix?((a=n.transform||n.webkitTransform).split(",").length>6&&(a=a.split(", ").map((function(e){return e.replace(",",".")})).join(", ")),r=new t.WebKitCSSMatrix("none"===a?"":a)):s=(r=n.MozTransform||n.OTransform||n.MsTransform||n.msTransform||n.transform||n.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,")).toString().split(","),"x"===i&&(a=t.WebKitCSSMatrix?r.m41:16===s.length?parseFloat(s[12]):parseFloat(s[4])),"y"===i&&(a=t.WebKitCSSMatrix?r.m42:16===s.length?parseFloat(s[13]):parseFloat(s[5])),a||0},parseUrlQuery:function(e){var i,s,a,r,n={},o=e||t.location.href;if("string"==typeof o&&o.length)for(r=(s=(o=o.indexOf("?")>-1?o.replace(/\S*\?/,""):"").split("&").filter((function(e){return""!==e}))).length,i=0;i<r;i+=1)a=s[i].replace(/#\S+/g,"").split("="),n[decodeURIComponent(a[0])]=void 0===a[1]?void 0:decodeURIComponent(a[1])||"";return n},isObject:function(e){return"object"==typeof e&&null!==e&&e.constructor&&e.constructor===Object},extend:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];for(var i=Object(e[0]),s=1;s<e.length;s+=1){var a=e[s];if(null!=a)for(var r=Object.keys(Object(a)),o=0,l=r.length;o<l;o+=1){var d=r[o],h=Object.getOwnPropertyDescriptor(a,d);void 0!==h&&h.enumerable&&(n.isObject(i[d])&&n.isObject(a[d])?n.extend(i[d],a[d]):!n.isObject(i[d])&&n.isObject(a[d])?(i[d]={},n.extend(i[d],a[d])):i[d]=a[d])}}return i}},o={touch:t.Modernizr&&!0===t.Modernizr.touch||!!(t.navigator.maxTouchPoints>0||"ontouchstart"in t||t.DocumentTouch&&e instanceof t.DocumentTouch),pointerEvents:!!t.PointerEvent&&"maxTouchPoints"in t.navigator&&t.navigator.maxTouchPoints>0,observer:"MutationObserver"in t||"WebkitMutationObserver"in t,passiveListener:function(){var e=!1;try{var i=Object.defineProperty({},"passive",{get:function(){e=!0}});t.addEventListener("testPassiveListener",null,i)}catch(e){}return e}(),gestures:"ongesturestart"in t},l=function(e){void 0===e&&(e={});var t=this;t.params=e,t.eventsListeners={},t.params&&t.params.on&&Object.keys(t.params.on).forEach((function(e){t.on(e,t.params.on[e])}))},d={components:{configurable:!0}};l.prototype.on=function(e,t,i){var s=this;if("function"!=typeof t)return s;var a=i?"unshift":"push";return e.split(" ").forEach((function(e){s.eventsListeners[e]||(s.eventsListeners[e]=[]),s.eventsListeners[e][a](t)})),s},l.prototype.once=function(e,t,i){var s=this;if("function"!=typeof t)return s;function a(){for(var i=[],r=arguments.length;r--;)i[r]=arguments[r];s.off(e,a),a.f7proxy&&delete a.f7proxy,t.apply(s,i)}return a.f7proxy=t,s.on(e,a,i)},l.prototype.off=function(e,t){var i=this;return i.eventsListeners?(e.split(" ").forEach((function(e){void 0===t?i.eventsListeners[e]=[]:i.eventsListeners[e]&&i.eventsListeners[e].length&&i.eventsListeners[e].forEach((function(s,a){(s===t||s.f7proxy&&s.f7proxy===t)&&i.eventsListeners[e].splice(a,1)}))})),i):i},l.prototype.emit=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var i,s,a,r=this;if(!r.eventsListeners)return r;"string"==typeof e[0]||Array.isArray(e[0])?(i=e[0],s=e.slice(1,e.length),a=r):(i=e[0].events,s=e[0].data,a=e[0].context||r);var n=Array.isArray(i)?i:i.split(" ");return n.forEach((function(e){if(r.eventsListeners&&r.eventsListeners[e]){var t=[];r.eventsListeners[e].forEach((function(e){t.push(e)})),t.forEach((function(e){e.apply(a,s)}))}})),r},l.prototype.useModulesParams=function(e){var t=this;t.modules&&Object.keys(t.modules).forEach((function(i){var s=t.modules[i];s.params&&n.extend(e,s.params)}))},l.prototype.useModules=function(e){void 0===e&&(e={});var t=this;t.modules&&Object.keys(t.modules).forEach((function(i){var s=t.modules[i],a=e[i]||{};s.instance&&Object.keys(s.instance).forEach((function(e){var i=s.instance[e];t[e]="function"==typeof i?i.bind(t):i})),s.on&&t.on&&Object.keys(s.on).forEach((function(e){t.on(e,s.on[e])})),s.create&&s.create.bind(t)(a)}))},d.components.set=function(e){this.use&&this.use(e)},l.installModule=function(e){for(var t=[],i=arguments.length-1;i-- >0;)t[i]=arguments[i+1];var s=this;s.prototype.modules||(s.prototype.modules={});var a=e.name||Object.keys(s.prototype.modules).length+"_"+n.now();return s.prototype.modules[a]=e,e.proto&&Object.keys(e.proto).forEach((function(t){s.prototype[t]=e.proto[t]})),e.static&&Object.keys(e.static).forEach((function(t){s[t]=e.static[t]})),e.install&&e.install.apply(s,t),s},l.use=function(e){for(var t=[],i=arguments.length-1;i-- >0;)t[i]=arguments[i+1];var s=this;return Array.isArray(e)?(e.forEach((function(e){return s.installModule(e)})),s):s.installModule.apply(s,[e].concat(t))},Object.defineProperties(l,d);var h={updateSize:function(){var e,t,i=this.$el;e=void 0!==this.params.width?this.params.width:i[0].clientWidth,t=void 0!==this.params.height?this.params.height:i[0].clientHeight,0===e&&this.isHorizontal()||0===t&&this.isVertical()||(e=e-parseInt(i.css("padding-left"),10)-parseInt(i.css("padding-right"),10),t=t-parseInt(i.css("padding-top"),10)-parseInt(i.css("padding-bottom"),10),n.extend(this,{width:e,height:t,size:this.isHorizontal()?e:t}))},updateSlides:function(){var e=this.params,i=this.$wrapperEl,s=this.size,a=this.rtlTranslate,r=this.wrongRTL,o=this.virtual&&e.virtual.enabled,l=o?this.virtual.slides.length:this.slides.length,d=i.children("."+this.params.slideClass),h=o?this.virtual.slides.length:d.length,p=[],c=[],u=[];function v(t){return!e.cssMode||t!==d.length-1}var f=e.slidesOffsetBefore;"function"==typeof f&&(f=e.slidesOffsetBefore.call(this));var m=e.slidesOffsetAfter;"function"==typeof m&&(m=e.slidesOffsetAfter.call(this));var g=this.snapGrid.length,b=this.snapGrid.length,w=e.spaceBetween,y=-f,x=0,T=0;if(void 0!==s){var E,S;"string"==typeof w&&w.indexOf("%")>=0&&(w=parseFloat(w.replace("%",""))/100*s),this.virtualSize=-w,a?d.css({marginLeft:"",marginTop:""}):d.css({marginRight:"",marginBottom:""}),e.slidesPerColumn>1&&(E=Math.floor(h/e.slidesPerColumn)===h/this.params.slidesPerColumn?h:Math.ceil(h/e.slidesPerColumn)*e.slidesPerColumn,"auto"!==e.slidesPerView&&"row"===e.slidesPerColumnFill&&(E=Math.max(E,e.slidesPerView*e.slidesPerColumn)));for(var C,M=e.slidesPerColumn,P=E/M,z=Math.floor(h/e.slidesPerColumn),k=0;k<h;k+=1){S=0;var $=d.eq(k);if(e.slidesPerColumn>1){var L=void 0,I=void 0,D=void 0;if("row"===e.slidesPerColumnFill&&e.slidesPerGroup>1){var O=Math.floor(k/(e.slidesPerGroup*e.slidesPerColumn)),A=k-e.slidesPerColumn*e.slidesPerGroup*O,G=0===O?e.slidesPerGroup:Math.min(Math.ceil((h-O*M*e.slidesPerGroup)/M),e.slidesPerGroup);L=(I=A-(D=Math.floor(A/G))*G+O*e.slidesPerGroup)+D*E/M,$.css({"-webkit-box-ordinal-group":L,"-moz-box-ordinal-group":L,"-ms-flex-order":L,"-webkit-order":L,order:L})}else"column"===e.slidesPerColumnFill?(D=k-(I=Math.floor(k/M))*M,(I>z||I===z&&D===M-1)&&(D+=1)>=M&&(D=0,I+=1)):I=k-(D=Math.floor(k/P))*P;$.css("margin-"+(this.isHorizontal()?"top":"left"),0!==D&&e.spaceBetween&&e.spaceBetween+"px")}if("none"!==$.css("display")){if("auto"===e.slidesPerView){var H=t.getComputedStyle($[0],null),B=$[0].style.transform,N=$[0].style.webkitTransform;if(B&&($[0].style.transform="none"),N&&($[0].style.webkitTransform="none"),e.roundLengths)S=this.isHorizontal()?$.outerWidth(!0):$.outerHeight(!0);else if(this.isHorizontal()){var X=parseFloat(H.getPropertyValue("width")),V=parseFloat(H.getPropertyValue("padding-left")),Y=parseFloat(H.getPropertyValue("padding-right")),F=parseFloat(H.getPropertyValue("margin-left")),W=parseFloat(H.getPropertyValue("margin-right")),R=H.getPropertyValue("box-sizing");S=R&&"border-box"===R?X+F+W:X+V+Y+F+W}else{var q=parseFloat(H.getPropertyValue("height")),j=parseFloat(H.getPropertyValue("padding-top")),K=parseFloat(H.getPropertyValue("padding-bottom")),U=parseFloat(H.getPropertyValue("margin-top")),_=parseFloat(H.getPropertyValue("margin-bottom")),Z=H.getPropertyValue("box-sizing");S=Z&&"border-box"===Z?q+U+_:q+j+K+U+_}B&&($[0].style.transform=B),N&&($[0].style.webkitTransform=N),e.roundLengths&&(S=Math.floor(S))}else S=(s-(e.slidesPerView-1)*w)/e.slidesPerView,e.roundLengths&&(S=Math.floor(S)),d[k]&&(this.isHorizontal()?d[k].style.width=S+"px":d[k].style.height=S+"px");d[k]&&(d[k].swiperSlideSize=S),u.push(S),e.centeredSlides?(y=y+S/2+x/2+w,0===x&&0!==k&&(y=y-s/2-w),0===k&&(y=y-s/2-w),Math.abs(y)<.001&&(y=0),e.roundLengths&&(y=Math.floor(y)),T%e.slidesPerGroup==0&&p.push(y),c.push(y)):(e.roundLengths&&(y=Math.floor(y)),(T-Math.min(this.params.slidesPerGroupSkip,T))%this.params.slidesPerGroup==0&&p.push(y),c.push(y),y=y+S+w),this.virtualSize+=S+w,x=S,T+=1}}if(this.virtualSize=Math.max(this.virtualSize,s)+m,a&&r&&("slide"===e.effect||"coverflow"===e.effect)&&i.css({width:this.virtualSize+e.spaceBetween+"px"}),e.setWrapperSize&&(this.isHorizontal()?i.css({width:this.virtualSize+e.spaceBetween+"px"}):i.css({height:this.virtualSize+e.spaceBetween+"px"})),e.slidesPerColumn>1&&(this.virtualSize=(S+e.spaceBetween)*E,this.virtualSize=Math.ceil(this.virtualSize/e.slidesPerColumn)-e.spaceBetween,this.isHorizontal()?i.css({width:this.virtualSize+e.spaceBetween+"px"}):i.css({height:this.virtualSize+e.spaceBetween+"px"}),e.centeredSlides)){C=[];for(var Q=0;Q<p.length;Q+=1){var J=p[Q];e.roundLengths&&(J=Math.floor(J)),p[Q]<this.virtualSize+p[0]&&C.push(J)}p=C}if(!e.centeredSlides){C=[];for(var ee=0;ee<p.length;ee+=1){var te=p[ee];e.roundLengths&&(te=Math.floor(te)),p[ee]<=this.virtualSize-s&&C.push(te)}p=C,Math.floor(this.virtualSize-s)-Math.floor(p[p.length-1])>1&&p.push(this.virtualSize-s)}if(0===p.length&&(p=[0]),0!==e.spaceBetween&&(this.isHorizontal()?a?d.filter(v).css({marginLeft:w+"px"}):d.filter(v).css({marginRight:w+"px"}):d.filter(v).css({marginBottom:w+"px"})),e.centeredSlides&&e.centeredSlidesBounds){var ie=0;u.forEach((function(t){ie+=t+(e.spaceBetween?e.spaceBetween:0)}));var se=(ie-=e.spaceBetween)-s;p=p.map((function(e){return e<0?-f:e>se?se+m:e}))}if(e.centerInsufficientSlides){var ae=0;if(u.forEach((function(t){ae+=t+(e.spaceBetween?e.spaceBetween:0)})),(ae-=e.spaceBetween)<s){var re=(s-ae)/2;p.forEach((function(e,t){p[t]=e-re})),c.forEach((function(e,t){c[t]=e+re}))}}n.extend(this,{slides:d,snapGrid:p,slidesGrid:c,slidesSizesGrid:u}),h!==l&&this.emit("slidesLengthChange"),p.length!==g&&(this.params.watchOverflow&&this.checkOverflow(),this.emit("snapGridLengthChange")),c.length!==b&&this.emit("slidesGridLengthChange"),(e.watchSlidesProgress||e.watchSlidesVisibility)&&this.updateSlidesOffset()}},updateAutoHeight:function(e){var t,i=[],s=0;if("number"==typeof e?this.setTransition(e):!0===e&&this.setTransition(this.params.speed),"auto"!==this.params.slidesPerView&&this.params.slidesPerView>1)if(this.params.centeredSlides)i.push.apply(i,this.visibleSlides);else for(t=0;t<Math.ceil(this.params.slidesPerView);t+=1){var a=this.activeIndex+t;if(a>this.slides.length)break;i.push(this.slides.eq(a)[0])}else i.push(this.slides.eq(this.activeIndex)[0]);for(t=0;t<i.length;t+=1)if(void 0!==i[t]){var r=i[t].offsetHeight;s=r>s?r:s}s&&this.$wrapperEl.css("height",s+"px")},updateSlidesOffset:function(){for(var e=this.slides,t=0;t<e.length;t+=1)e[t].swiperSlideOffset=this.isHorizontal()?e[t].offsetLeft:e[t].offsetTop},updateSlidesProgress:function(e){void 0===e&&(e=this&&this.translate||0);var t=this.params,i=this.slides,a=this.rtlTranslate;if(0!==i.length){void 0===i[0].swiperSlideOffset&&this.updateSlidesOffset();var r=-e;a&&(r=e),i.removeClass(t.slideVisibleClass),this.visibleSlidesIndexes=[],this.visibleSlides=[];for(var n=0;n<i.length;n+=1){var o=i[n],l=(r+(t.centeredSlides?this.minTranslate():0)-o.swiperSlideOffset)/(o.swiperSlideSize+t.spaceBetween);if(t.watchSlidesVisibility||t.centeredSlides&&t.autoHeight){var d=-(r-o.swiperSlideOffset),h=d+this.slidesSizesGrid[n];(d>=0&&d<this.size-1||h>1&&h<=this.size||d<=0&&h>=this.size)&&(this.visibleSlides.push(o),this.visibleSlidesIndexes.push(n),i.eq(n).addClass(t.slideVisibleClass))}o.progress=a?-l:l}this.visibleSlides=s(this.visibleSlides)}},updateProgress:function(e){if(void 0===e){var t=this.rtlTranslate?-1:1;e=this&&this.translate&&this.translate*t||0}var i=this.params,s=this.maxTranslate()-this.minTranslate(),a=this.progress,r=this.isBeginning,o=this.isEnd,l=r,d=o;0===s?(a=0,r=!0,o=!0):(r=(a=(e-this.minTranslate())/s)<=0,o=a>=1),n.extend(this,{progress:a,isBeginning:r,isEnd:o}),(i.watchSlidesProgress||i.watchSlidesVisibility||i.centeredSlides&&i.autoHeight)&&this.updateSlidesProgress(e),r&&!l&&this.emit("reachBeginning toEdge"),o&&!d&&this.emit("reachEnd toEdge"),(l&&!r||d&&!o)&&this.emit("fromEdge"),this.emit("progress",a)},updateSlidesClasses:function(){var e,t=this.slides,i=this.params,s=this.$wrapperEl,a=this.activeIndex,r=this.realIndex,n=this.virtual&&i.virtual.enabled;t.removeClass(i.slideActiveClass+" "+i.slideNextClass+" "+i.slidePrevClass+" "+i.slideDuplicateActiveClass+" "+i.slideDuplicateNextClass+" "+i.slideDuplicatePrevClass),(e=n?this.$wrapperEl.find("."+i.slideClass+'[data-swiper-slide-index="'+a+'"]'):t.eq(a)).addClass(i.slideActiveClass),i.loop&&(e.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+r+'"]').addClass(i.slideDuplicateActiveClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+r+'"]').addClass(i.slideDuplicateActiveClass));var o=e.nextAll("."+i.slideClass).eq(0).addClass(i.slideNextClass);i.loop&&0===o.length&&(o=t.eq(0)).addClass(i.slideNextClass);var l=e.prevAll("."+i.slideClass).eq(0).addClass(i.slidePrevClass);i.loop&&0===l.length&&(l=t.eq(-1)).addClass(i.slidePrevClass),i.loop&&(o.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+o.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicateNextClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+o.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicateNextClass),l.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+l.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicatePrevClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+l.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicatePrevClass))},updateActiveIndex:function(e){var t,i=this.rtlTranslate?this.translate:-this.translate,s=this.slidesGrid,a=this.snapGrid,r=this.params,o=this.activeIndex,l=this.realIndex,d=this.snapIndex,h=e;if(void 0===h){for(var p=0;p<s.length;p+=1)void 0!==s[p+1]?i>=s[p]&&i<s[p+1]-(s[p+1]-s[p])/2?h=p:i>=s[p]&&i<s[p+1]&&(h=p+1):i>=s[p]&&(h=p);r.normalizeSlideIndex&&(h<0||void 0===h)&&(h=0)}if(a.indexOf(i)>=0)t=a.indexOf(i);else{var c=Math.min(r.slidesPerGroupSkip,h);t=c+Math.floor((h-c)/r.slidesPerGroup)}if(t>=a.length&&(t=a.length-1),h!==o){var u=parseInt(this.slides.eq(h).attr("data-swiper-slide-index")||h,10);n.extend(this,{snapIndex:t,realIndex:u,previousIndex:o,activeIndex:h}),this.emit("activeIndexChange"),this.emit("snapIndexChange"),l!==u&&this.emit("realIndexChange"),(this.initialized||this.runCallbacksOnInit)&&this.emit("slideChange")}else t!==d&&(this.snapIndex=t,this.emit("snapIndexChange"))},updateClickedSlide:function(e){var t=this.params,i=s(e.target).closest("."+t.slideClass)[0],a=!1;if(i)for(var r=0;r<this.slides.length;r+=1)this.slides[r]===i&&(a=!0);if(!i||!a)return this.clickedSlide=void 0,void(this.clickedIndex=void 0);this.clickedSlide=i,this.virtual&&this.params.virtual.enabled?this.clickedIndex=parseInt(s(i).attr("data-swiper-slide-index"),10):this.clickedIndex=s(i).index(),t.slideToClickedSlide&&void 0!==this.clickedIndex&&this.clickedIndex!==this.activeIndex&&this.slideToClickedSlide()}};var p={getTranslate:function(e){void 0===e&&(e=this.isHorizontal()?"x":"y");var t=this.params,i=this.rtlTranslate,s=this.translate,a=this.$wrapperEl;if(t.virtualTranslate)return i?-s:s;if(t.cssMode)return s;var r=n.getTranslate(a[0],e);return i&&(r=-r),r||0},setTranslate:function(e,t){var i=this.rtlTranslate,s=this.params,a=this.$wrapperEl,r=this.wrapperEl,n=this.progress,o=0,l=0;this.isHorizontal()?o=i?-e:e:l=e,s.roundLengths&&(o=Math.floor(o),l=Math.floor(l)),s.cssMode?r[this.isHorizontal()?"scrollLeft":"scrollTop"]=this.isHorizontal()?-o:-l:s.virtualTranslate||a.transform("translate3d("+o+"px, "+l+"px, 0px)"),this.previousTranslate=this.translate,this.translate=this.isHorizontal()?o:l;var d=this.maxTranslate()-this.minTranslate();(0===d?0:(e-this.minTranslate())/d)!==n&&this.updateProgress(e),this.emit("setTranslate",this.translate,t)},minTranslate:function(){return-this.snapGrid[0]},maxTranslate:function(){return-this.snapGrid[this.snapGrid.length-1]},translateTo:function(e,t,i,s,a){var r;void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===i&&(i=!0),void 0===s&&(s=!0);var n=this,o=n.params,l=n.wrapperEl;if(n.animating&&o.preventInteractionOnTransition)return!1;var d,h=n.minTranslate(),p=n.maxTranslate();if(d=s&&e>h?h:s&&e<p?p:e,n.updateProgress(d),o.cssMode){var c=n.isHorizontal();return 0===t?l[c?"scrollLeft":"scrollTop"]=-d:l.scrollTo?l.scrollTo(((r={})[c?"left":"top"]=-d,r.behavior="smooth",r)):l[c?"scrollLeft":"scrollTop"]=-d,!0}return 0===t?(n.setTransition(0),n.setTranslate(d),i&&(n.emit("beforeTransitionStart",t,a),n.emit("transitionEnd"))):(n.setTransition(t),n.setTranslate(d),i&&(n.emit("beforeTransitionStart",t,a),n.emit("transitionStart")),n.animating||(n.animating=!0,n.onTranslateToWrapperTransitionEnd||(n.onTranslateToWrapperTransitionEnd=function(e){n&&!n.destroyed&&e.target===this&&(n.$wrapperEl[0].removeEventListener("transitionend",n.onTranslateToWrapperTransitionEnd),n.$wrapperEl[0].removeEventListener("webkitTransitionEnd",n.onTranslateToWrapperTransitionEnd),n.onTranslateToWrapperTransitionEnd=null,delete n.onTranslateToWrapperTransitionEnd,i&&n.emit("transitionEnd"))}),n.$wrapperEl[0].addEventListener("transitionend",n.onTranslateToWrapperTransitionEnd),n.$wrapperEl[0].addEventListener("webkitTransitionEnd",n.onTranslateToWrapperTransitionEnd))),!0}};var c={setTransition:function(e,t){this.params.cssMode||this.$wrapperEl.transition(e),this.emit("setTransition",e,t)},transitionStart:function(e,t){void 0===e&&(e=!0);var i=this.activeIndex,s=this.params,a=this.previousIndex;if(!s.cssMode){s.autoHeight&&this.updateAutoHeight();var r=t;if(r||(r=i>a?"next":i<a?"prev":"reset"),this.emit("transitionStart"),e&&i!==a){if("reset"===r)return void this.emit("slideResetTransitionStart");this.emit("slideChangeTransitionStart"),"next"===r?this.emit("slideNextTransitionStart"):this.emit("slidePrevTransitionStart")}}},transitionEnd:function(e,t){void 0===e&&(e=!0);var i=this.activeIndex,s=this.previousIndex,a=this.params;if(this.animating=!1,!a.cssMode){this.setTransition(0);var r=t;if(r||(r=i>s?"next":i<s?"prev":"reset"),this.emit("transitionEnd"),e&&i!==s){if("reset"===r)return void this.emit("slideResetTransitionEnd");this.emit("slideChangeTransitionEnd"),"next"===r?this.emit("slideNextTransitionEnd"):this.emit("slidePrevTransitionEnd")}}}};var u={slideTo:function(e,t,i,s){var a;void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===i&&(i=!0);var r=this,n=e;n<0&&(n=0);var o=r.params,l=r.snapGrid,d=r.slidesGrid,h=r.previousIndex,p=r.activeIndex,c=r.rtlTranslate,u=r.wrapperEl;if(r.animating&&o.preventInteractionOnTransition)return!1;var v=Math.min(r.params.slidesPerGroupSkip,n),f=v+Math.floor((n-v)/r.params.slidesPerGroup);f>=l.length&&(f=l.length-1),(p||o.initialSlide||0)===(h||0)&&i&&r.emit("beforeSlideChangeStart");var m,g=-l[f];if(r.updateProgress(g),o.normalizeSlideIndex)for(var b=0;b<d.length;b+=1)-Math.floor(100*g)>=Math.floor(100*d[b])&&(n=b);if(r.initialized&&n!==p){if(!r.allowSlideNext&&g<r.translate&&g<r.minTranslate())return!1;if(!r.allowSlidePrev&&g>r.translate&&g>r.maxTranslate()&&(p||0)!==n)return!1}if(m=n>p?"next":n<p?"prev":"reset",c&&-g===r.translate||!c&&g===r.translate)return r.updateActiveIndex(n),o.autoHeight&&r.updateAutoHeight(),r.updateSlidesClasses(),"slide"!==o.effect&&r.setTranslate(g),"reset"!==m&&(r.transitionStart(i,m),r.transitionEnd(i,m)),!1;if(o.cssMode){var w=r.isHorizontal();return 0===t?u[w?"scrollLeft":"scrollTop"]=-g:u.scrollTo?u.scrollTo(((a={})[w?"left":"top"]=-g,a.behavior="smooth",a)):u[w?"scrollLeft":"scrollTop"]=-g,!0}return 0===t?(r.setTransition(0),r.setTranslate(g),r.updateActiveIndex(n),r.updateSlidesClasses(),r.emit("beforeTransitionStart",t,s),r.transitionStart(i,m),r.transitionEnd(i,m)):(r.setTransition(t),r.setTranslate(g),r.updateActiveIndex(n),r.updateSlidesClasses(),r.emit("beforeTransitionStart",t,s),r.transitionStart(i,m),r.animating||(r.animating=!0,r.onSlideToWrapperTransitionEnd||(r.onSlideToWrapperTransitionEnd=function(e){r&&!r.destroyed&&e.target===this&&(r.$wrapperEl[0].removeEventListener("transitionend",r.onSlideToWrapperTransitionEnd),r.$wrapperEl[0].removeEventListener("webkitTransitionEnd",r.onSlideToWrapperTransitionEnd),r.onSlideToWrapperTransitionEnd=null,delete r.onSlideToWrapperTransitionEnd,r.transitionEnd(i,m))}),r.$wrapperEl[0].addEventListener("transitionend",r.onSlideToWrapperTransitionEnd),r.$wrapperEl[0].addEventListener("webkitTransitionEnd",r.onSlideToWrapperTransitionEnd))),!0},slideToLoop:function(e,t,i,s){void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===i&&(i=!0);var a=e;return this.params.loop&&(a+=this.loopedSlides),this.slideTo(a,t,i,s)},slideNext:function(e,t,i){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);var s=this.params,a=this.animating,r=this.activeIndex<s.slidesPerGroupSkip?1:s.slidesPerGroup;if(s.loop){if(a)return!1;this.loopFix(),this._clientLeft=this.$wrapperEl[0].clientLeft}return this.slideTo(this.activeIndex+r,e,t,i)},slidePrev:function(e,t,i){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);var s=this.params,a=this.animating,r=this.snapGrid,n=this.slidesGrid,o=this.rtlTranslate;if(s.loop){if(a)return!1;this.loopFix(),this._clientLeft=this.$wrapperEl[0].clientLeft}function l(e){return e<0?-Math.floor(Math.abs(e)):Math.floor(e)}var d,h=l(o?this.translate:-this.translate),p=r.map((function(e){return l(e)})),c=(n.map((function(e){return l(e)})),r[p.indexOf(h)],r[p.indexOf(h)-1]);return void 0===c&&s.cssMode&&r.forEach((function(e){!c&&h>=e&&(c=e)})),void 0!==c&&(d=n.indexOf(c))<0&&(d=this.activeIndex-1),this.slideTo(d,e,t,i)},slideReset:function(e,t,i){return void 0===e&&(e=this.params.speed),void 0===t&&(t=!0),this.slideTo(this.activeIndex,e,t,i)},slideToClosest:function(e,t,i,s){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0),void 0===s&&(s=.5);var a=this.activeIndex,r=Math.min(this.params.slidesPerGroupSkip,a),n=r+Math.floor((a-r)/this.params.slidesPerGroup),o=this.rtlTranslate?this.translate:-this.translate;if(o>=this.snapGrid[n]){var l=this.snapGrid[n];o-l>(this.snapGrid[n+1]-l)*s&&(a+=this.params.slidesPerGroup)}else{var d=this.snapGrid[n-1];o-d<=(this.snapGrid[n]-d)*s&&(a-=this.params.slidesPerGroup)}return a=Math.max(a,0),a=Math.min(a,this.slidesGrid.length-1),this.slideTo(a,e,t,i)},slideToClickedSlide:function(){var e,t=this,i=t.params,a=t.$wrapperEl,r="auto"===i.slidesPerView?t.slidesPerViewDynamic():i.slidesPerView,o=t.clickedIndex;if(i.loop){if(t.animating)return;e=parseInt(s(t.clickedSlide).attr("data-swiper-slide-index"),10),i.centeredSlides?o<t.loopedSlides-r/2||o>t.slides.length-t.loopedSlides+r/2?(t.loopFix(),o=a.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]:not(.'+i.slideDuplicateClass+")").eq(0).index(),n.nextTick((function(){t.slideTo(o)}))):t.slideTo(o):o>t.slides.length-r?(t.loopFix(),o=a.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]:not(.'+i.slideDuplicateClass+")").eq(0).index(),n.nextTick((function(){t.slideTo(o)}))):t.slideTo(o)}else t.slideTo(o)}};var v={loopCreate:function(){var t=this,i=t.params,a=t.$wrapperEl;a.children("."+i.slideClass+"."+i.slideDuplicateClass).remove();var r=a.children("."+i.slideClass);if(i.loopFillGroupWithBlank){var n=i.slidesPerGroup-r.length%i.slidesPerGroup;if(n!==i.slidesPerGroup){for(var o=0;o<n;o+=1){var l=s(e.createElement("div")).addClass(i.slideClass+" "+i.slideBlankClass);a.append(l)}r=a.children("."+i.slideClass)}}"auto"!==i.slidesPerView||i.loopedSlides||(i.loopedSlides=r.length),t.loopedSlides=Math.ceil(parseFloat(i.loopedSlides||i.slidesPerView,10)),t.loopedSlides+=i.loopAdditionalSlides,t.loopedSlides>r.length&&(t.loopedSlides=r.length);var d=[],h=[];r.each((function(e,i){var a=s(i);e<t.loopedSlides&&h.push(i),e<r.length&&e>=r.length-t.loopedSlides&&d.push(i),a.attr("data-swiper-slide-index",e)}));for(var p=0;p<h.length;p+=1)a.append(s(h[p].cloneNode(!0)).addClass(i.slideDuplicateClass));for(var c=d.length-1;c>=0;c-=1)a.prepend(s(d[c].cloneNode(!0)).addClass(i.slideDuplicateClass))},loopFix:function(){this.emit("beforeLoopFix");var e,t=this.activeIndex,i=this.slides,s=this.loopedSlides,a=this.allowSlidePrev,r=this.allowSlideNext,n=this.snapGrid,o=this.rtlTranslate;this.allowSlidePrev=!0,this.allowSlideNext=!0;var l=-n[t]-this.getTranslate();if(t<s)e=i.length-3*s+t,e+=s,this.slideTo(e,0,!1,!0)&&0!==l&&this.setTranslate((o?-this.translate:this.translate)-l);else if(t>=i.length-s){e=-i.length+t+s,e+=s,this.slideTo(e,0,!1,!0)&&0!==l&&this.setTranslate((o?-this.translate:this.translate)-l)}this.allowSlidePrev=a,this.allowSlideNext=r,this.emit("loopFix")},loopDestroy:function(){var e=this.$wrapperEl,t=this.params,i=this.slides;e.children("."+t.slideClass+"."+t.slideDuplicateClass+",."+t.slideClass+"."+t.slideBlankClass).remove(),i.removeAttr("data-swiper-slide-index")}};var f={setGrabCursor:function(e){if(!(o.touch||!this.params.simulateTouch||this.params.watchOverflow&&this.isLocked||this.params.cssMode)){var t=this.el;t.style.cursor="move",t.style.cursor=e?"-webkit-grabbing":"-webkit-grab",t.style.cursor=e?"-moz-grabbin":"-moz-grab",t.style.cursor=e?"grabbing":"grab"}},unsetGrabCursor:function(){o.touch||this.params.watchOverflow&&this.isLocked||this.params.cssMode||(this.el.style.cursor="")}};var m,g,b,w,y,x,T,E,S,C,M,P,z,k,$,L={appendSlide:function(e){var t=this.$wrapperEl,i=this.params;if(i.loop&&this.loopDestroy(),"object"==typeof e&&"length"in e)for(var s=0;s<e.length;s+=1)e[s]&&t.append(e[s]);else t.append(e);i.loop&&this.loopCreate(),i.observer&&o.observer||this.update()},prependSlide:function(e){var t=this.params,i=this.$wrapperEl,s=this.activeIndex;t.loop&&this.loopDestroy();var a=s+1;if("object"==typeof e&&"length"in e){for(var r=0;r<e.length;r+=1)e[r]&&i.prepend(e[r]);a=s+e.length}else i.prepend(e);t.loop&&this.loopCreate(),t.observer&&o.observer||this.update(),this.slideTo(a,0,!1)},addSlide:function(e,t){var i=this.$wrapperEl,s=this.params,a=this.activeIndex;s.loop&&(a-=this.loopedSlides,this.loopDestroy(),this.slides=i.children("."+s.slideClass));var r=this.slides.length;if(e<=0)this.prependSlide(t);else if(e>=r)this.appendSlide(t);else{for(var n=a>e?a+1:a,l=[],d=r-1;d>=e;d-=1){var h=this.slides.eq(d);h.remove(),l.unshift(h)}if("object"==typeof t&&"length"in t){for(var p=0;p<t.length;p+=1)t[p]&&i.append(t[p]);n=a>e?a+t.length:a}else i.append(t);for(var c=0;c<l.length;c+=1)i.append(l[c]);s.loop&&this.loopCreate(),s.observer&&o.observer||this.update(),s.loop?this.slideTo(n+this.loopedSlides,0,!1):this.slideTo(n,0,!1)}},removeSlide:function(e){var t=this.params,i=this.$wrapperEl,s=this.activeIndex;t.loop&&(s-=this.loopedSlides,this.loopDestroy(),this.slides=i.children("."+t.slideClass));var a,r=s;if("object"==typeof e&&"length"in e){for(var n=0;n<e.length;n+=1)a=e[n],this.slides[a]&&this.slides.eq(a).remove(),a<r&&(r-=1);r=Math.max(r,0)}else a=e,this.slides[a]&&this.slides.eq(a).remove(),a<r&&(r-=1),r=Math.max(r,0);t.loop&&this.loopCreate(),t.observer&&o.observer||this.update(),t.loop?this.slideTo(r+this.loopedSlides,0,!1):this.slideTo(r,0,!1)},removeAllSlides:function(){for(var e=[],t=0;t<this.slides.length;t+=1)e.push(t);this.removeSlide(e)}},I=(m=t.navigator.platform,g=t.navigator.userAgent,b={ios:!1,android:!1,androidChrome:!1,desktop:!1,iphone:!1,ipod:!1,ipad:!1,edge:!1,ie:!1,firefox:!1,macos:!1,windows:!1,cordova:!(!t.cordova&&!t.phonegap),phonegap:!(!t.cordova&&!t.phonegap),electron:!1},w=t.screen.width,y=t.screen.height,x=g.match(/(Android);?[\s\/]+([\d.]+)?/),T=g.match(/(iPad).*OS\s([\d_]+)/),E=g.match(/(iPod)(.*OS\s([\d_]+))?/),S=!T&&g.match(/(iPhone\sOS|iOS)\s([\d_]+)/),C=g.indexOf("MSIE ")>=0||g.indexOf("Trident/")>=0,M=g.indexOf("Edge/")>=0,P=g.indexOf("Gecko/")>=0&&g.indexOf("Firefox/")>=0,z="Win32"===m,k=g.toLowerCase().indexOf("electron")>=0,$="MacIntel"===m,!T&&$&&o.touch&&(1024===w&&1366===y||834===w&&1194===y||834===w&&1112===y||768===w&&1024===y)&&(T=g.match(/(Version)\/([\d.]+)/),$=!1),b.ie=C,b.edge=M,b.firefox=P,x&&!z&&(b.os="android",b.osVersion=x[2],b.android=!0,b.androidChrome=g.toLowerCase().indexOf("chrome")>=0),(T||S||E)&&(b.os="ios",b.ios=!0),S&&!E&&(b.osVersion=S[2].replace(/_/g,"."),b.iphone=!0),T&&(b.osVersion=T[2].replace(/_/g,"."),b.ipad=!0),E&&(b.osVersion=E[3]?E[3].replace(/_/g,"."):null,b.ipod=!0),b.ios&&b.osVersion&&g.indexOf("Version/")>=0&&"10"===b.osVersion.split(".")[0]&&(b.osVersion=g.toLowerCase().split("version/")[1].split(" ")[0]),b.webView=!(!(S||T||E)||!g.match(/.*AppleWebKit(?!.*Safari)/i)&&!t.navigator.standalone)||t.matchMedia&&t.matchMedia("(display-mode: standalone)").matches,b.webview=b.webView,b.standalone=b.webView,b.desktop=!(b.ios||b.android)||k,b.desktop&&(b.electron=k,b.macos=$,b.windows=z,b.macos&&(b.os="macos"),b.windows&&(b.os="windows")),b.pixelRatio=t.devicePixelRatio||1,b);function D(i){var a=this.touchEventsData,r=this.params,o=this.touches;if(!this.animating||!r.preventInteractionOnTransition){var l=i;l.originalEvent&&(l=l.originalEvent);var d=s(l.target);if(("wrapper"!==r.touchEventsTarget||d.closest(this.wrapperEl).length)&&(a.isTouchEvent="touchstart"===l.type,(a.isTouchEvent||!("which"in l)||3!==l.which)&&!(!a.isTouchEvent&&"button"in l&&l.button>0||a.isTouched&&a.isMoved)))if(r.noSwiping&&d.closest(r.noSwipingSelector?r.noSwipingSelector:"."+r.noSwipingClass)[0])this.allowClick=!0;else if(!r.swipeHandler||d.closest(r.swipeHandler)[0]){o.currentX="touchstart"===l.type?l.targetTouches[0].pageX:l.pageX,o.currentY="touchstart"===l.type?l.targetTouches[0].pageY:l.pageY;var h=o.currentX,p=o.currentY,c=r.edgeSwipeDetection||r.iOSEdgeSwipeDetection,u=r.edgeSwipeThreshold||r.iOSEdgeSwipeThreshold;if(!c||!(h<=u||h>=t.screen.width-u)){if(n.extend(a,{isTouched:!0,isMoved:!1,allowTouchCallbacks:!0,isScrolling:void 0,startMoving:void 0}),o.startX=h,o.startY=p,a.touchStartTime=n.now(),this.allowClick=!0,this.updateSize(),this.swipeDirection=void 0,r.threshold>0&&(a.allowThresholdMove=!1),"touchstart"!==l.type){var v=!0;d.is(a.formElements)&&(v=!1),e.activeElement&&s(e.activeElement).is(a.formElements)&&e.activeElement!==d[0]&&e.activeElement.blur();var f=v&&this.allowTouchMove&&r.touchStartPreventDefault;(r.touchStartForcePreventDefault||f)&&l.preventDefault()}this.emit("touchStart",l)}}}}function O(t){var i=this.touchEventsData,a=this.params,r=this.touches,o=this.rtlTranslate,l=t;if(l.originalEvent&&(l=l.originalEvent),i.isTouched){if(!i.isTouchEvent||"mousemove"!==l.type){var d="touchmove"===l.type&&l.targetTouches&&(l.targetTouches[0]||l.changedTouches[0]),h="touchmove"===l.type?d.pageX:l.pageX,p="touchmove"===l.type?d.pageY:l.pageY;if(l.preventedByNestedSwiper)return r.startX=h,void(r.startY=p);if(!this.allowTouchMove)return this.allowClick=!1,void(i.isTouched&&(n.extend(r,{startX:h,startY:p,currentX:h,currentY:p}),i.touchStartTime=n.now()));if(i.isTouchEvent&&a.touchReleaseOnEdges&&!a.loop)if(this.isVertical()){if(p<r.startY&&this.translate<=this.maxTranslate()||p>r.startY&&this.translate>=this.minTranslate())return i.isTouched=!1,void(i.isMoved=!1)}else if(h<r.startX&&this.translate<=this.maxTranslate()||h>r.startX&&this.translate>=this.minTranslate())return;if(i.isTouchEvent&&e.activeElement&&l.target===e.activeElement&&s(l.target).is(i.formElements))return i.isMoved=!0,void(this.allowClick=!1);if(i.allowTouchCallbacks&&this.emit("touchMove",l),!(l.targetTouches&&l.targetTouches.length>1)){r.currentX=h,r.currentY=p;var c=r.currentX-r.startX,u=r.currentY-r.startY;if(!(this.params.threshold&&Math.sqrt(Math.pow(c,2)+Math.pow(u,2))<this.params.threshold)){var v;if(void 0===i.isScrolling)this.isHorizontal()&&r.currentY===r.startY||this.isVertical()&&r.currentX===r.startX?i.isScrolling=!1:c*c+u*u>=25&&(v=180*Math.atan2(Math.abs(u),Math.abs(c))/Math.PI,i.isScrolling=this.isHorizontal()?v>a.touchAngle:90-v>a.touchAngle);if(i.isScrolling&&this.emit("touchMoveOpposite",l),void 0===i.startMoving&&(r.currentX===r.startX&&r.currentY===r.startY||(i.startMoving=!0)),i.isScrolling)i.isTouched=!1;else if(i.startMoving){this.allowClick=!1,a.cssMode||l.preventDefault(),a.touchMoveStopPropagation&&!a.nested&&l.stopPropagation(),i.isMoved||(a.loop&&this.loopFix(),i.startTranslate=this.getTranslate(),this.setTransition(0),this.animating&&this.$wrapperEl.trigger("webkitTransitionEnd transitionend"),i.allowMomentumBounce=!1,!a.grabCursor||!0!==this.allowSlideNext&&!0!==this.allowSlidePrev||this.setGrabCursor(!0),this.emit("sliderFirstMove",l)),this.emit("sliderMove",l),i.isMoved=!0;var f=this.isHorizontal()?c:u;r.diff=f,f*=a.touchRatio,o&&(f=-f),this.swipeDirection=f>0?"prev":"next",i.currentTranslate=f+i.startTranslate;var m=!0,g=a.resistanceRatio;if(a.touchReleaseOnEdges&&(g=0),f>0&&i.currentTranslate>this.minTranslate()?(m=!1,a.resistance&&(i.currentTranslate=this.minTranslate()-1+Math.pow(-this.minTranslate()+i.startTranslate+f,g))):f<0&&i.currentTranslate<this.maxTranslate()&&(m=!1,a.resistance&&(i.currentTranslate=this.maxTranslate()+1-Math.pow(this.maxTranslate()-i.startTranslate-f,g))),m&&(l.preventedByNestedSwiper=!0),!this.allowSlideNext&&"next"===this.swipeDirection&&i.currentTranslate<i.startTranslate&&(i.currentTranslate=i.startTranslate),!this.allowSlidePrev&&"prev"===this.swipeDirection&&i.currentTranslate>i.startTranslate&&(i.currentTranslate=i.startTranslate),a.threshold>0){if(!(Math.abs(f)>a.threshold||i.allowThresholdMove))return void(i.currentTranslate=i.startTranslate);if(!i.allowThresholdMove)return i.allowThresholdMove=!0,r.startX=r.currentX,r.startY=r.currentY,i.currentTranslate=i.startTranslate,void(r.diff=this.isHorizontal()?r.currentX-r.startX:r.currentY-r.startY)}a.followFinger&&!a.cssMode&&((a.freeMode||a.watchSlidesProgress||a.watchSlidesVisibility)&&(this.updateActiveIndex(),this.updateSlidesClasses()),a.freeMode&&(0===i.velocities.length&&i.velocities.push({position:r[this.isHorizontal()?"startX":"startY"],time:i.touchStartTime}),i.velocities.push({position:r[this.isHorizontal()?"currentX":"currentY"],time:n.now()})),this.updateProgress(i.currentTranslate),this.setTranslate(i.currentTranslate))}}}}}else i.startMoving&&i.isScrolling&&this.emit("touchMoveOpposite",l)}function A(e){var t=this,i=t.touchEventsData,s=t.params,a=t.touches,r=t.rtlTranslate,o=t.$wrapperEl,l=t.slidesGrid,d=t.snapGrid,h=e;if(h.originalEvent&&(h=h.originalEvent),i.allowTouchCallbacks&&t.emit("touchEnd",h),i.allowTouchCallbacks=!1,!i.isTouched)return i.isMoved&&s.grabCursor&&t.setGrabCursor(!1),i.isMoved=!1,void(i.startMoving=!1);s.grabCursor&&i.isMoved&&i.isTouched&&(!0===t.allowSlideNext||!0===t.allowSlidePrev)&&t.setGrabCursor(!1);var p,c=n.now(),u=c-i.touchStartTime;if(t.allowClick&&(t.updateClickedSlide(h),t.emit("tap click",h),u<300&&c-i.lastClickTime<300&&t.emit("doubleTap doubleClick",h)),i.lastClickTime=n.now(),n.nextTick((function(){t.destroyed||(t.allowClick=!0)})),!i.isTouched||!i.isMoved||!t.swipeDirection||0===a.diff||i.currentTranslate===i.startTranslate)return i.isTouched=!1,i.isMoved=!1,void(i.startMoving=!1);if(i.isTouched=!1,i.isMoved=!1,i.startMoving=!1,p=s.followFinger?r?t.translate:-t.translate:-i.currentTranslate,!s.cssMode)if(s.freeMode){if(p<-t.minTranslate())return void t.slideTo(t.activeIndex);if(p>-t.maxTranslate())return void(t.slides.length<d.length?t.slideTo(d.length-1):t.slideTo(t.slides.length-1));if(s.freeModeMomentum){if(i.velocities.length>1){var v=i.velocities.pop(),f=i.velocities.pop(),m=v.position-f.position,g=v.time-f.time;t.velocity=m/g,t.velocity/=2,Math.abs(t.velocity)<s.freeModeMinimumVelocity&&(t.velocity=0),(g>150||n.now()-v.time>300)&&(t.velocity=0)}else t.velocity=0;t.velocity*=s.freeModeMomentumVelocityRatio,i.velocities.length=0;var b=1e3*s.freeModeMomentumRatio,w=t.velocity*b,y=t.translate+w;r&&(y=-y);var x,T,E=!1,S=20*Math.abs(t.velocity)*s.freeModeMomentumBounceRatio;if(y<t.maxTranslate())s.freeModeMomentumBounce?(y+t.maxTranslate()<-S&&(y=t.maxTranslate()-S),x=t.maxTranslate(),E=!0,i.allowMomentumBounce=!0):y=t.maxTranslate(),s.loop&&s.centeredSlides&&(T=!0);else if(y>t.minTranslate())s.freeModeMomentumBounce?(y-t.minTranslate()>S&&(y=t.minTranslate()+S),x=t.minTranslate(),E=!0,i.allowMomentumBounce=!0):y=t.minTranslate(),s.loop&&s.centeredSlides&&(T=!0);else if(s.freeModeSticky){for(var C,M=0;M<d.length;M+=1)if(d[M]>-y){C=M;break}y=-(y=Math.abs(d[C]-y)<Math.abs(d[C-1]-y)||"next"===t.swipeDirection?d[C]:d[C-1])}if(T&&t.once("transitionEnd",(function(){t.loopFix()})),0!==t.velocity){if(b=r?Math.abs((-y-t.translate)/t.velocity):Math.abs((y-t.translate)/t.velocity),s.freeModeSticky){var P=Math.abs((r?-y:y)-t.translate),z=t.slidesSizesGrid[t.activeIndex];b=P<z?s.speed:P<2*z?1.5*s.speed:2.5*s.speed}}else if(s.freeModeSticky)return void t.slideToClosest();s.freeModeMomentumBounce&&E?(t.updateProgress(x),t.setTransition(b),t.setTranslate(y),t.transitionStart(!0,t.swipeDirection),t.animating=!0,o.transitionEnd((function(){t&&!t.destroyed&&i.allowMomentumBounce&&(t.emit("momentumBounce"),t.setTransition(s.speed),t.setTranslate(x),o.transitionEnd((function(){t&&!t.destroyed&&t.transitionEnd()})))}))):t.velocity?(t.updateProgress(y),t.setTransition(b),t.setTranslate(y),t.transitionStart(!0,t.swipeDirection),t.animating||(t.animating=!0,o.transitionEnd((function(){t&&!t.destroyed&&t.transitionEnd()})))):t.updateProgress(y),t.updateActiveIndex(),t.updateSlidesClasses()}else if(s.freeModeSticky)return void t.slideToClosest();(!s.freeModeMomentum||u>=s.longSwipesMs)&&(t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses())}else{for(var k=0,$=t.slidesSizesGrid[0],L=0;L<l.length;L+=L<s.slidesPerGroupSkip?1:s.slidesPerGroup){var I=L<s.slidesPerGroupSkip-1?1:s.slidesPerGroup;void 0!==l[L+I]?p>=l[L]&&p<l[L+I]&&(k=L,$=l[L+I]-l[L]):p>=l[L]&&(k=L,$=l[l.length-1]-l[l.length-2])}var D=(p-l[k])/$,O=k<s.slidesPerGroupSkip-1?1:s.slidesPerGroup;if(u>s.longSwipesMs){if(!s.longSwipes)return void t.slideTo(t.activeIndex);"next"===t.swipeDirection&&(D>=s.longSwipesRatio?t.slideTo(k+O):t.slideTo(k)),"prev"===t.swipeDirection&&(D>1-s.longSwipesRatio?t.slideTo(k+O):t.slideTo(k))}else{if(!s.shortSwipes)return void t.slideTo(t.activeIndex);t.navigation&&(h.target===t.navigation.nextEl||h.target===t.navigation.prevEl)?h.target===t.navigation.nextEl?t.slideTo(k+O):t.slideTo(k):("next"===t.swipeDirection&&t.slideTo(k+O),"prev"===t.swipeDirection&&t.slideTo(k))}}}function G(){var e=this.params,t=this.el;if(!t||0!==t.offsetWidth){e.breakpoints&&this.setBreakpoint();var i=this.allowSlideNext,s=this.allowSlidePrev,a=this.snapGrid;this.allowSlideNext=!0,this.allowSlidePrev=!0,this.updateSize(),this.updateSlides(),this.updateSlidesClasses(),("auto"===e.slidesPerView||e.slidesPerView>1)&&this.isEnd&&!this.params.centeredSlides?this.slideTo(this.slides.length-1,0,!1,!0):this.slideTo(this.activeIndex,0,!1,!0),this.autoplay&&this.autoplay.running&&this.autoplay.paused&&this.autoplay.run(),this.allowSlidePrev=s,this.allowSlideNext=i,this.params.watchOverflow&&a!==this.snapGrid&&this.checkOverflow()}}function H(e){this.allowClick||(this.params.preventClicks&&e.preventDefault(),this.params.preventClicksPropagation&&this.animating&&(e.stopPropagation(),e.stopImmediatePropagation()))}function B(){var e=this.wrapperEl;this.previousTranslate=this.translate,this.translate=this.isHorizontal()?-e.scrollLeft:-e.scrollTop,-0===this.translate&&(this.translate=0),this.updateActiveIndex(),this.updateSlidesClasses();var t=this.maxTranslate()-this.minTranslate();(0===t?0:(this.translate-this.minTranslate())/t)!==this.progress&&this.updateProgress(this.translate),this.emit("setTranslate",this.translate,!1)}var N=!1;function X(){}var V={init:!0,direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,cssMode:!1,updateOnWindowResize:!0,preventInteractionOnTransition:!1,edgeSwipeDetection:!1,edgeSwipeThreshold:20,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,freeModeMomentumVelocityRatio:1,freeModeSticky:!1,freeModeMinimumVelocity:.02,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",breakpoints:void 0,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,slidesPerGroupSkip:0,centeredSlides:!1,centeredSlidesBounds:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,normalizeSlideIndex:!0,centerInsufficientSlides:!1,watchOverflow:!1,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,allowTouchMove:!0,threshold:0,touchMoveStopPropagation:!1,touchStartPreventDefault:!0,touchStartForcePreventDefault:!1,touchReleaseOnEdges:!1,uniqueNavElements:!0,resistance:!0,resistanceRatio:.85,watchSlidesProgress:!1,watchSlidesVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,loopFillGroupWithBlank:!1,allowSlidePrev:!0,allowSlideNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",noSwipingSelector:null,passiveListeners:!0,containerModifierClass:"swiper-container-",slideClass:"swiper-slide",slideBlankClass:"swiper-slide-invisible-blank",slideActiveClass:"swiper-slide-active",slideDuplicateActiveClass:"swiper-slide-duplicate-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slideDuplicateNextClass:"swiper-slide-duplicate-next",slidePrevClass:"swiper-slide-prev",slideDuplicatePrevClass:"swiper-slide-duplicate-prev",wrapperClass:"swiper-wrapper",runCallbacksOnInit:!0},Y={update:h,translate:p,transition:c,slide:u,loop:v,grabCursor:f,manipulation:L,events:{attachEvents:function(){var t=this.params,i=this.touchEvents,s=this.el,a=this.wrapperEl;this.onTouchStart=D.bind(this),this.onTouchMove=O.bind(this),this.onTouchEnd=A.bind(this),t.cssMode&&(this.onScroll=B.bind(this)),this.onClick=H.bind(this);var r=!!t.nested;if(!o.touch&&o.pointerEvents)s.addEventListener(i.start,this.onTouchStart,!1),e.addEventListener(i.move,this.onTouchMove,r),e.addEventListener(i.end,this.onTouchEnd,!1);else{if(o.touch){var n=!("touchstart"!==i.start||!o.passiveListener||!t.passiveListeners)&&{passive:!0,capture:!1};s.addEventListener(i.start,this.onTouchStart,n),s.addEventListener(i.move,this.onTouchMove,o.passiveListener?{passive:!1,capture:r}:r),s.addEventListener(i.end,this.onTouchEnd,n),i.cancel&&s.addEventListener(i.cancel,this.onTouchEnd,n),N||(e.addEventListener("touchstart",X),N=!0)}(t.simulateTouch&&!I.ios&&!I.android||t.simulateTouch&&!o.touch&&I.ios)&&(s.addEventListener("mousedown",this.onTouchStart,!1),e.addEventListener("mousemove",this.onTouchMove,r),e.addEventListener("mouseup",this.onTouchEnd,!1))}(t.preventClicks||t.preventClicksPropagation)&&s.addEventListener("click",this.onClick,!0),t.cssMode&&a.addEventListener("scroll",this.onScroll),t.updateOnWindowResize?this.on(I.ios||I.android?"resize orientationchange observerUpdate":"resize observerUpdate",G,!0):this.on("observerUpdate",G,!0)},detachEvents:function(){var t=this.params,i=this.touchEvents,s=this.el,a=this.wrapperEl,r=!!t.nested;if(!o.touch&&o.pointerEvents)s.removeEventListener(i.start,this.onTouchStart,!1),e.removeEventListener(i.move,this.onTouchMove,r),e.removeEventListener(i.end,this.onTouchEnd,!1);else{if(o.touch){var n=!("onTouchStart"!==i.start||!o.passiveListener||!t.passiveListeners)&&{passive:!0,capture:!1};s.removeEventListener(i.start,this.onTouchStart,n),s.removeEventListener(i.move,this.onTouchMove,r),s.removeEventListener(i.end,this.onTouchEnd,n),i.cancel&&s.removeEventListener(i.cancel,this.onTouchEnd,n)}(t.simulateTouch&&!I.ios&&!I.android||t.simulateTouch&&!o.touch&&I.ios)&&(s.removeEventListener("mousedown",this.onTouchStart,!1),e.removeEventListener("mousemove",this.onTouchMove,r),e.removeEventListener("mouseup",this.onTouchEnd,!1))}(t.preventClicks||t.preventClicksPropagation)&&s.removeEventListener("click",this.onClick,!0),t.cssMode&&a.removeEventListener("scroll",this.onScroll),this.off(I.ios||I.android?"resize orientationchange observerUpdate":"resize observerUpdate",G)}},breakpoints:{setBreakpoint:function(){var e=this.activeIndex,t=this.initialized,i=this.loopedSlides;void 0===i&&(i=0);var s=this.params,a=this.$el,r=s.breakpoints;if(r&&(!r||0!==Object.keys(r).length)){var o=this.getBreakpoint(r);if(o&&this.currentBreakpoint!==o){var l=o in r?r[o]:void 0;l&&["slidesPerView","spaceBetween","slidesPerGroup","slidesPerGroupSkip","slidesPerColumn"].forEach((function(e){var t=l[e];void 0!==t&&(l[e]="slidesPerView"!==e||"AUTO"!==t&&"auto"!==t?"slidesPerView"===e?parseFloat(t):parseInt(t,10):"auto")}));var d=l||this.originalParams,h=s.slidesPerColumn>1,p=d.slidesPerColumn>1;h&&!p?a.removeClass(s.containerModifierClass+"multirow "+s.containerModifierClass+"multirow-column"):!h&&p&&(a.addClass(s.containerModifierClass+"multirow"),"column"===d.slidesPerColumnFill&&a.addClass(s.containerModifierClass+"multirow-column"));var c=d.direction&&d.direction!==s.direction,u=s.loop&&(d.slidesPerView!==s.slidesPerView||c);c&&t&&this.changeDirection(),n.extend(this.params,d),n.extend(this,{allowTouchMove:this.params.allowTouchMove,allowSlideNext:this.params.allowSlideNext,allowSlidePrev:this.params.allowSlidePrev}),this.currentBreakpoint=o,u&&t&&(this.loopDestroy(),this.loopCreate(),this.updateSlides(),this.slideTo(e-i+this.loopedSlides,0,!1)),this.emit("breakpoint",d)}}},getBreakpoint:function(e){if(e){var i=!1,s=Object.keys(e).map((function(e){if("string"==typeof e&&0===e.indexOf("@")){var i=parseFloat(e.substr(1));return{value:t.innerHeight*i,point:e}}return{value:e,point:e}}));s.sort((function(e,t){return parseInt(e.value,10)-parseInt(t.value,10)}));for(var a=0;a<s.length;a+=1){var r=s[a],n=r.point;r.value<=t.innerWidth&&(i=n)}return i||"max"}}},checkOverflow:{checkOverflow:function(){var e=this.params,t=this.isLocked,i=this.slides.length>0&&e.slidesOffsetBefore+e.spaceBetween*(this.slides.length-1)+this.slides[0].offsetWidth*this.slides.length;e.slidesOffsetBefore&&e.slidesOffsetAfter&&i?this.isLocked=i<=this.size:this.isLocked=1===this.snapGrid.length,this.allowSlideNext=!this.isLocked,this.allowSlidePrev=!this.isLocked,t!==this.isLocked&&this.emit(this.isLocked?"lock":"unlock"),t&&t!==this.isLocked&&(this.isEnd=!1,this.navigation.update())}},classes:{addClasses:function(){var e=this.classNames,t=this.params,i=this.rtl,s=this.$el,a=[];a.push("initialized"),a.push(t.direction),t.freeMode&&a.push("free-mode"),t.autoHeight&&a.push("autoheight"),i&&a.push("rtl"),t.slidesPerColumn>1&&(a.push("multirow"),"column"===t.slidesPerColumnFill&&a.push("multirow-column")),I.android&&a.push("android"),I.ios&&a.push("ios"),t.cssMode&&a.push("css-mode"),a.forEach((function(i){e.push(t.containerModifierClass+i)})),s.addClass(e.join(" "))},removeClasses:function(){var e=this.$el,t=this.classNames;e.removeClass(t.join(" "))}},images:{loadImage:function(e,i,s,a,r,n){var o;function l(){n&&n()}e.complete&&r?l():i?((o=new t.Image).onload=l,o.onerror=l,a&&(o.sizes=a),s&&(o.srcset=s),i&&(o.src=i)):l()},preloadImages:function(){var e=this;function t(){null!=e&&e&&!e.destroyed&&(void 0!==e.imagesLoaded&&(e.imagesLoaded+=1),e.imagesLoaded===e.imagesToLoad.length&&(e.params.updateOnImagesReady&&e.update(),e.emit("imagesReady")))}e.imagesToLoad=e.$el.find("img");for(var i=0;i<e.imagesToLoad.length;i+=1){var s=e.imagesToLoad[i];e.loadImage(s,s.currentSrc||s.getAttribute("src"),s.srcset||s.getAttribute("srcset"),s.sizes||s.getAttribute("sizes"),!0,t)}}}},F={},W=function(e){function t(){for(var i,a,r,l=[],d=arguments.length;d--;)l[d]=arguments[d];1===l.length&&l[0].constructor&&l[0].constructor===Object?r=l[0]:(a=(i=l)[0],r=i[1]),r||(r={}),r=n.extend({},r),a&&!r.el&&(r.el=a),e.call(this,r),Object.keys(Y).forEach((function(e){Object.keys(Y[e]).forEach((function(i){t.prototype[i]||(t.prototype[i]=Y[e][i])}))}));var h=this;void 0===h.modules&&(h.modules={}),Object.keys(h.modules).forEach((function(e){var t=h.modules[e];if(t.params){var i=Object.keys(t.params)[0],s=t.params[i];if("object"!=typeof s||null===s)return;if(!(i in r&&"enabled"in s))return;!0===r[i]&&(r[i]={enabled:!0}),"object"!=typeof r[i]||"enabled"in r[i]||(r[i].enabled=!0),r[i]||(r[i]={enabled:!1})}}));var p=n.extend({},V);h.useModulesParams(p),h.params=n.extend({},p,F,r),h.originalParams=n.extend({},h.params),h.passedParams=n.extend({},r),h.$=s;var c=s(h.params.el);if(a=c[0]){if(c.length>1){var u=[];return c.each((function(e,i){var s=n.extend({},r,{el:i});u.push(new t(s))})),u}var v,f,m;return a.swiper=h,c.data("swiper",h),a&&a.shadowRoot&&a.shadowRoot.querySelector?(v=s(a.shadowRoot.querySelector("."+h.params.wrapperClass))).children=function(e){return c.children(e)}:v=c.children("."+h.params.wrapperClass),n.extend(h,{$el:c,el:a,$wrapperEl:v,wrapperEl:v[0],classNames:[],slides:s(),slidesGrid:[],snapGrid:[],slidesSizesGrid:[],isHorizontal:function(){return"horizontal"===h.params.direction},isVertical:function(){return"vertical"===h.params.direction},rtl:"rtl"===a.dir.toLowerCase()||"rtl"===c.css("direction"),rtlTranslate:"horizontal"===h.params.direction&&("rtl"===a.dir.toLowerCase()||"rtl"===c.css("direction")),wrongRTL:"-webkit-box"===v.css("display"),activeIndex:0,realIndex:0,isBeginning:!0,isEnd:!1,translate:0,previousTranslate:0,progress:0,velocity:0,animating:!1,allowSlideNext:h.params.allowSlideNext,allowSlidePrev:h.params.allowSlidePrev,touchEvents:(f=["touchstart","touchmove","touchend","touchcancel"],m=["mousedown","mousemove","mouseup"],o.pointerEvents&&(m=["pointerdown","pointermove","pointerup"]),h.touchEventsTouch={start:f[0],move:f[1],end:f[2],cancel:f[3]},h.touchEventsDesktop={start:m[0],move:m[1],end:m[2]},o.touch||!h.params.simulateTouch?h.touchEventsTouch:h.touchEventsDesktop),touchEventsData:{isTouched:void 0,isMoved:void 0,allowTouchCallbacks:void 0,touchStartTime:void 0,isScrolling:void 0,currentTranslate:void 0,startTranslate:void 0,allowThresholdMove:void 0,formElements:"input, select, option, textarea, button, video, label",lastClickTime:n.now(),clickTimeout:void 0,velocities:[],allowMomentumBounce:void 0,isTouchEvent:void 0,startMoving:void 0},allowClick:!0,allowTouchMove:h.params.allowTouchMove,touches:{startX:0,startY:0,currentX:0,currentY:0,diff:0},imagesToLoad:[],imagesLoaded:0}),h.useModules(),h.params.init&&h.init(),h}}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var i={extendedDefaults:{configurable:!0},defaults:{configurable:!0},Class:{configurable:!0},$:{configurable:!0}};return t.prototype.slidesPerViewDynamic=function(){var e=this.params,t=this.slides,i=this.slidesGrid,s=this.size,a=this.activeIndex,r=1;if(e.centeredSlides){for(var n,o=t[a].swiperSlideSize,l=a+1;l<t.length;l+=1)t[l]&&!n&&(r+=1,(o+=t[l].swiperSlideSize)>s&&(n=!0));for(var d=a-1;d>=0;d-=1)t[d]&&!n&&(r+=1,(o+=t[d].swiperSlideSize)>s&&(n=!0))}else for(var h=a+1;h<t.length;h+=1)i[h]-i[a]<s&&(r+=1);return r},t.prototype.update=function(){var e=this;if(e&&!e.destroyed){var t=e.snapGrid,i=e.params;i.breakpoints&&e.setBreakpoint(),e.updateSize(),e.updateSlides(),e.updateProgress(),e.updateSlidesClasses(),e.params.freeMode?(s(),e.params.autoHeight&&e.updateAutoHeight()):(("auto"===e.params.slidesPerView||e.params.slidesPerView>1)&&e.isEnd&&!e.params.centeredSlides?e.slideTo(e.slides.length-1,0,!1,!0):e.slideTo(e.activeIndex,0,!1,!0))||s(),i.watchOverflow&&t!==e.snapGrid&&e.checkOverflow(),e.emit("update")}function s(){var t=e.rtlTranslate?-1*e.translate:e.translate,i=Math.min(Math.max(t,e.maxTranslate()),e.minTranslate());e.setTranslate(i),e.updateActiveIndex(),e.updateSlidesClasses()}},t.prototype.changeDirection=function(e,t){void 0===t&&(t=!0);var i=this.params.direction;return e||(e="horizontal"===i?"vertical":"horizontal"),e===i||"horizontal"!==e&&"vertical"!==e?this:(this.$el.removeClass(""+this.params.containerModifierClass+i).addClass(""+this.params.containerModifierClass+e),this.params.direction=e,this.slides.each((function(t,i){"vertical"===e?i.style.width="":i.style.height=""})),this.emit("changeDirection"),t&&this.update(),this)},t.prototype.init=function(){this.initialized||(this.emit("beforeInit"),this.params.breakpoints&&this.setBreakpoint(),this.addClasses(),this.params.loop&&this.loopCreate(),this.updateSize(),this.updateSlides(),this.params.watchOverflow&&this.checkOverflow(),this.params.grabCursor&&this.setGrabCursor(),this.params.preloadImages&&this.preloadImages(),this.params.loop?this.slideTo(this.params.initialSlide+this.loopedSlides,0,this.params.runCallbacksOnInit):this.slideTo(this.params.initialSlide,0,this.params.runCallbacksOnInit),this.attachEvents(),this.initialized=!0,this.emit("init"))},t.prototype.destroy=function(e,t){void 0===e&&(e=!0),void 0===t&&(t=!0);var i=this,s=i.params,a=i.$el,r=i.$wrapperEl,o=i.slides;return void 0===i.params||i.destroyed?null:(i.emit("beforeDestroy"),i.initialized=!1,i.detachEvents(),s.loop&&i.loopDestroy(),t&&(i.removeClasses(),a.removeAttr("style"),r.removeAttr("style"),o&&o.length&&o.removeClass([s.slideVisibleClass,s.slideActiveClass,s.slideNextClass,s.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-slide-index")),i.emit("destroy"),Object.keys(i.eventsListeners).forEach((function(e){i.off(e)})),!1!==e&&(i.$el[0].swiper=null,i.$el.data("swiper",null),n.deleteProps(i)),i.destroyed=!0,null)},t.extendDefaults=function(e){n.extend(F,e)},i.extendedDefaults.get=function(){return F},i.defaults.get=function(){return V},i.Class.get=function(){return e},i.$.get=function(){return s},Object.defineProperties(t,i),t}(l),R={name:"device",proto:{device:I},static:{device:I}},q={name:"support",proto:{support:o},static:{support:o}},j={isEdge:!!t.navigator.userAgent.match(/Edge/g),isSafari:function(){var e=t.navigator.userAgent.toLowerCase();return e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(t.navigator.userAgent)},K={name:"browser",proto:{browser:j},static:{browser:j}},U={name:"resize",create:function(){var e=this;n.extend(e,{resize:{resizeHandler:function(){e&&!e.destroyed&&e.initialized&&(e.emit("beforeResize"),e.emit("resize"))},orientationChangeHandler:function(){e&&!e.destroyed&&e.initialized&&e.emit("orientationchange")}}})},on:{init:function(){t.addEventListener("resize",this.resize.resizeHandler),t.addEventListener("orientationchange",this.resize.orientationChangeHandler)},destroy:function(){t.removeEventListener("resize",this.resize.resizeHandler),t.removeEventListener("orientationchange",this.resize.orientationChangeHandler)}}},_={func:t.MutationObserver||t.WebkitMutationObserver,attach:function(e,i){void 0===i&&(i={});var s=this,a=new(0,_.func)((function(e){if(1!==e.length){var i=function(){s.emit("observerUpdate",e[0])};t.requestAnimationFrame?t.requestAnimationFrame(i):t.setTimeout(i,0)}else s.emit("observerUpdate",e[0])}));a.observe(e,{attributes:void 0===i.attributes||i.attributes,childList:void 0===i.childList||i.childList,characterData:void 0===i.characterData||i.characterData}),s.observer.observers.push(a)},init:function(){if(o.observer&&this.params.observer){if(this.params.observeParents)for(var e=this.$el.parents(),t=0;t<e.length;t+=1)this.observer.attach(e[t]);this.observer.attach(this.$el[0],{childList:this.params.observeSlideChildren}),this.observer.attach(this.$wrapperEl[0],{attributes:!1})}},destroy:function(){this.observer.observers.forEach((function(e){e.disconnect()})),this.observer.observers=[]}},Z={name:"observer",params:{observer:!1,observeParents:!1,observeSlideChildren:!1},create:function(){n.extend(this,{observer:{init:_.init.bind(this),attach:_.attach.bind(this),destroy:_.destroy.bind(this),observers:[]}})},on:{init:function(){this.observer.init()},destroy:function(){this.observer.destroy()}}},Q={update:function(e){var t=this,i=t.params,s=i.slidesPerView,a=i.slidesPerGroup,r=i.centeredSlides,o=t.params.virtual,l=o.addSlidesBefore,d=o.addSlidesAfter,h=t.virtual,p=h.from,c=h.to,u=h.slides,v=h.slidesGrid,f=h.renderSlide,m=h.offset;t.updateActiveIndex();var g,b,w,y=t.activeIndex||0;g=t.rtlTranslate?"right":t.isHorizontal()?"left":"top",r?(b=Math.floor(s/2)+a+l,w=Math.floor(s/2)+a+d):(b=s+(a-1)+l,w=a+d);var x=Math.max((y||0)-w,0),T=Math.min((y||0)+b,u.length-1),E=(t.slidesGrid[x]||0)-(t.slidesGrid[0]||0);function S(){t.updateSlides(),t.updateProgress(),t.updateSlidesClasses(),t.lazy&&t.params.lazy.enabled&&t.lazy.load()}if(n.extend(t.virtual,{from:x,to:T,offset:E,slidesGrid:t.slidesGrid}),p===x&&c===T&&!e)return t.slidesGrid!==v&&E!==m&&t.slides.css(g,E+"px"),void t.updateProgress();if(t.params.virtual.renderExternal)return t.params.virtual.renderExternal.call(t,{offset:E,from:x,to:T,slides:function(){for(var e=[],t=x;t<=T;t+=1)e.push(u[t]);return e}()}),void S();var C=[],M=[];if(e)t.$wrapperEl.find("."+t.params.slideClass).remove();else for(var P=p;P<=c;P+=1)(P<x||P>T)&&t.$wrapperEl.find("."+t.params.slideClass+'[data-swiper-slide-index="'+P+'"]').remove();for(var z=0;z<u.length;z+=1)z>=x&&z<=T&&(void 0===c||e?M.push(z):(z>c&&M.push(z),z<p&&C.push(z)));M.forEach((function(e){t.$wrapperEl.append(f(u[e],e))})),C.sort((function(e,t){return t-e})).forEach((function(e){t.$wrapperEl.prepend(f(u[e],e))})),t.$wrapperEl.children(".swiper-slide").css(g,E+"px"),S()},renderSlide:function(e,t){var i=this.params.virtual;if(i.cache&&this.virtual.cache[t])return this.virtual.cache[t];var a=i.renderSlide?s(i.renderSlide.call(this,e,t)):s('<div class="'+this.params.slideClass+'" data-swiper-slide-index="'+t+'">'+e+"</div>");return a.attr("data-swiper-slide-index")||a.attr("data-swiper-slide-index",t),i.cache&&(this.virtual.cache[t]=a),a},appendSlide:function(e){if("object"==typeof e&&"length"in e)for(var t=0;t<e.length;t+=1)e[t]&&this.virtual.slides.push(e[t]);else this.virtual.slides.push(e);this.virtual.update(!0)},prependSlide:function(e){var t=this.activeIndex,i=t+1,s=1;if(Array.isArray(e)){for(var a=0;a<e.length;a+=1)e[a]&&this.virtual.slides.unshift(e[a]);i=t+e.length,s=e.length}else this.virtual.slides.unshift(e);if(this.params.virtual.cache){var r=this.virtual.cache,n={};Object.keys(r).forEach((function(e){var t=r[e],i=t.attr("data-swiper-slide-index");i&&t.attr("data-swiper-slide-index",parseInt(i,10)+1),n[parseInt(e,10)+s]=t})),this.virtual.cache=n}this.virtual.update(!0),this.slideTo(i,0)},removeSlide:function(e){if(null!=e){var t=this.activeIndex;if(Array.isArray(e))for(var i=e.length-1;i>=0;i-=1)this.virtual.slides.splice(e[i],1),this.params.virtual.cache&&delete this.virtual.cache[e[i]],e[i]<t&&(t-=1),t=Math.max(t,0);else this.virtual.slides.splice(e,1),this.params.virtual.cache&&delete this.virtual.cache[e],e<t&&(t-=1),t=Math.max(t,0);this.virtual.update(!0),this.slideTo(t,0)}},removeAllSlides:function(){this.virtual.slides=[],this.params.virtual.cache&&(this.virtual.cache={}),this.virtual.update(!0),this.slideTo(0,0)}},J={name:"virtual",params:{virtual:{enabled:!1,slides:[],cache:!0,renderSlide:null,renderExternal:null,addSlidesBefore:0,addSlidesAfter:0}},create:function(){n.extend(this,{virtual:{update:Q.update.bind(this),appendSlide:Q.appendSlide.bind(this),prependSlide:Q.prependSlide.bind(this),removeSlide:Q.removeSlide.bind(this),removeAllSlides:Q.removeAllSlides.bind(this),renderSlide:Q.renderSlide.bind(this),slides:this.params.virtual.slides,cache:{}}})},on:{beforeInit:function(){if(this.params.virtual.enabled){this.classNames.push(this.params.containerModifierClass+"virtual");var e={watchSlidesProgress:!0};n.extend(this.params,e),n.extend(this.originalParams,e),this.params.initialSlide||this.virtual.update()}},setTranslate:function(){this.params.virtual.enabled&&this.virtual.update()}}},ee={handle:function(i){var s=this.rtlTranslate,a=i;a.originalEvent&&(a=a.originalEvent);var r=a.keyCode||a.charCode;if(!this.allowSlideNext&&(this.isHorizontal()&&39===r||this.isVertical()&&40===r||34===r))return!1;if(!this.allowSlidePrev&&(this.isHorizontal()&&37===r||this.isVertical()&&38===r||33===r))return!1;if(!(a.shiftKey||a.altKey||a.ctrlKey||a.metaKey||e.activeElement&&e.activeElement.nodeName&&("input"===e.activeElement.nodeName.toLowerCase()||"textarea"===e.activeElement.nodeName.toLowerCase()))){if(this.params.keyboard.onlyInViewport&&(33===r||34===r||37===r||39===r||38===r||40===r)){var n=!1;if(this.$el.parents("."+this.params.slideClass).length>0&&0===this.$el.parents("."+this.params.slideActiveClass).length)return;var o=t.innerWidth,l=t.innerHeight,d=this.$el.offset();s&&(d.left-=this.$el[0].scrollLeft);for(var h=[[d.left,d.top],[d.left+this.width,d.top],[d.left,d.top+this.height],[d.left+this.width,d.top+this.height]],p=0;p<h.length;p+=1){var c=h[p];c[0]>=0&&c[0]<=o&&c[1]>=0&&c[1]<=l&&(n=!0)}if(!n)return}this.isHorizontal()?(33!==r&&34!==r&&37!==r&&39!==r||(a.preventDefault?a.preventDefault():a.returnValue=!1),(34!==r&&39!==r||s)&&(33!==r&&37!==r||!s)||this.slideNext(),(33!==r&&37!==r||s)&&(34!==r&&39!==r||!s)||this.slidePrev()):(33!==r&&34!==r&&38!==r&&40!==r||(a.preventDefault?a.preventDefault():a.returnValue=!1),34!==r&&40!==r||this.slideNext(),33!==r&&38!==r||this.slidePrev()),this.emit("keyPress",r)}},enable:function(){this.keyboard.enabled||(s(e).on("keydown",this.keyboard.handle),this.keyboard.enabled=!0)},disable:function(){this.keyboard.enabled&&(s(e).off("keydown",this.keyboard.handle),this.keyboard.enabled=!1)}},te={name:"keyboard",params:{keyboard:{enabled:!1,onlyInViewport:!0}},create:function(){n.extend(this,{keyboard:{enabled:!1,enable:ee.enable.bind(this),disable:ee.disable.bind(this),handle:ee.handle.bind(this)}})},on:{init:function(){this.params.keyboard.enabled&&this.keyboard.enable()},destroy:function(){this.keyboard.enabled&&this.keyboard.disable()}}};var ie={lastScrollTime:n.now(),lastEventBeforeSnap:void 0,recentWheelEvents:[],event:function(){return t.navigator.userAgent.indexOf("firefox")>-1?"DOMMouseScroll":function(){var t="onwheel"in e;if(!t){var i=e.createElement("div");i.setAttribute("onwheel","return;"),t="function"==typeof i.onwheel}return!t&&e.implementation&&e.implementation.hasFeature&&!0!==e.implementation.hasFeature("","")&&(t=e.implementation.hasFeature("Events.wheel","3.0")),t}()?"wheel":"mousewheel"},normalize:function(e){var t=0,i=0,s=0,a=0;return"detail"in e&&(i=e.detail),"wheelDelta"in e&&(i=-e.wheelDelta/120),"wheelDeltaY"in e&&(i=-e.wheelDeltaY/120),"wheelDeltaX"in e&&(t=-e.wheelDeltaX/120),"axis"in e&&e.axis===e.HORIZONTAL_AXIS&&(t=i,i=0),s=10*t,a=10*i,"deltaY"in e&&(a=e.deltaY),"deltaX"in e&&(s=e.deltaX),e.shiftKey&&!s&&(s=a,a=0),(s||a)&&e.deltaMode&&(1===e.deltaMode?(s*=40,a*=40):(s*=800,a*=800)),s&&!t&&(t=s<1?-1:1),a&&!i&&(i=a<1?-1:1),{spinX:t,spinY:i,pixelX:s,pixelY:a}},handleMouseEnter:function(){this.mouseEntered=!0},handleMouseLeave:function(){this.mouseEntered=!1},handle:function(e){var t=e,i=this,a=i.params.mousewheel;i.params.cssMode&&t.preventDefault();var r=i.$el;if("container"!==i.params.mousewheel.eventsTarged&&(r=s(i.params.mousewheel.eventsTarged)),!i.mouseEntered&&!r[0].contains(t.target)&&!a.releaseOnEdges)return!0;t.originalEvent&&(t=t.originalEvent);var o=0,l=i.rtlTranslate?-1:1,d=ie.normalize(t);if(a.forceToAxis)if(i.isHorizontal()){if(!(Math.abs(d.pixelX)>Math.abs(d.pixelY)))return!0;o=d.pixelX*l}else{if(!(Math.abs(d.pixelY)>Math.abs(d.pixelX)))return!0;o=d.pixelY}else o=Math.abs(d.pixelX)>Math.abs(d.pixelY)?-d.pixelX*l:-d.pixelY;if(0===o)return!0;if(a.invert&&(o=-o),i.params.freeMode){var h={time:n.now(),delta:Math.abs(o),direction:Math.sign(o)},p=i.mousewheel.lastEventBeforeSnap,c=p&&h.time<p.time+500&&h.delta<=p.delta&&h.direction===p.direction;if(!c){i.mousewheel.lastEventBeforeSnap=void 0,i.params.loop&&i.loopFix();var u=i.getTranslate()+o*a.sensitivity,v=i.isBeginning,f=i.isEnd;if(u>=i.minTranslate()&&(u=i.minTranslate()),u<=i.maxTranslate()&&(u=i.maxTranslate()),i.setTransition(0),i.setTranslate(u),i.updateProgress(),i.updateActiveIndex(),i.updateSlidesClasses(),(!v&&i.isBeginning||!f&&i.isEnd)&&i.updateSlidesClasses(),i.params.freeModeSticky){clearTimeout(i.mousewheel.timeout),i.mousewheel.timeout=void 0;var m=i.mousewheel.recentWheelEvents;m.length>=15&&m.shift();var g=m.length?m[m.length-1]:void 0,b=m[0];if(m.push(h),g&&(h.delta>g.delta||h.direction!==g.direction))m.splice(0);else if(m.length>=15&&h.time-b.time<500&&b.delta-h.delta>=1&&h.delta<=6){var w=o>0?.8:.2;i.mousewheel.lastEventBeforeSnap=h,m.splice(0),i.mousewheel.timeout=n.nextTick((function(){i.slideToClosest(i.params.speed,!0,void 0,w)}),0)}i.mousewheel.timeout||(i.mousewheel.timeout=n.nextTick((function(){i.mousewheel.lastEventBeforeSnap=h,m.splice(0),i.slideToClosest(i.params.speed,!0,void 0,.5)}),500))}if(c||i.emit("scroll",t),i.params.autoplay&&i.params.autoplayDisableOnInteraction&&i.autoplay.stop(),u===i.minTranslate()||u===i.maxTranslate())return!0}}else{var y={time:n.now(),delta:Math.abs(o),direction:Math.sign(o),raw:e},x=i.mousewheel.recentWheelEvents;x.length>=2&&x.shift();var T=x.length?x[x.length-1]:void 0;if(x.push(y),T?(y.direction!==T.direction||y.delta>T.delta)&&i.mousewheel.animateSlider(y):i.mousewheel.animateSlider(y),i.mousewheel.releaseScroll(y))return!0}return t.preventDefault?t.preventDefault():t.returnValue=!1,!1},animateSlider:function(e){return e.delta>=6&&n.now()-this.mousewheel.lastScrollTime<60||(e.direction<0?this.isEnd&&!this.params.loop||this.animating||(this.slideNext(),this.emit("scroll",e.raw)):this.isBeginning&&!this.params.loop||this.animating||(this.slidePrev(),this.emit("scroll",e.raw)),this.mousewheel.lastScrollTime=(new t.Date).getTime(),!1)},releaseScroll:function(e){var t=this.params.mousewheel;if(e.direction<0){if(this.isEnd&&!this.params.loop&&t.releaseOnEdges)return!0}else if(this.isBeginning&&!this.params.loop&&t.releaseOnEdges)return!0;return!1},enable:function(){var e=ie.event();if(this.params.cssMode)return this.wrapperEl.removeEventListener(e,this.mousewheel.handle),!0;if(!e)return!1;if(this.mousewheel.enabled)return!1;var t=this.$el;return"container"!==this.params.mousewheel.eventsTarged&&(t=s(this.params.mousewheel.eventsTarged)),t.on("mouseenter",this.mousewheel.handleMouseEnter),t.on("mouseleave",this.mousewheel.handleMouseLeave),t.on(e,this.mousewheel.handle),this.mousewheel.enabled=!0,!0},disable:function(){var e=ie.event();if(this.params.cssMode)return this.wrapperEl.addEventListener(e,this.mousewheel.handle),!0;if(!e)return!1;if(!this.mousewheel.enabled)return!1;var t=this.$el;return"container"!==this.params.mousewheel.eventsTarged&&(t=s(this.params.mousewheel.eventsTarged)),t.off(e,this.mousewheel.handle),this.mousewheel.enabled=!1,!0}},se={update:function(){var e=this.params.navigation;if(!this.params.loop){var t=this.navigation,i=t.$nextEl,s=t.$prevEl;s&&s.length>0&&(this.isBeginning?s.addClass(e.disabledClass):s.removeClass(e.disabledClass),s[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](e.lockClass)),i&&i.length>0&&(this.isEnd?i.addClass(e.disabledClass):i.removeClass(e.disabledClass),i[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](e.lockClass))}},onPrevClick:function(e){e.preventDefault(),this.isBeginning&&!this.params.loop||this.slidePrev()},onNextClick:function(e){e.preventDefault(),this.isEnd&&!this.params.loop||this.slideNext()},init:function(){var e,t,i=this.params.navigation;(i.nextEl||i.prevEl)&&(i.nextEl&&(e=s(i.nextEl),this.params.uniqueNavElements&&"string"==typeof i.nextEl&&e.length>1&&1===this.$el.find(i.nextEl).length&&(e=this.$el.find(i.nextEl))),i.prevEl&&(t=s(i.prevEl),this.params.uniqueNavElements&&"string"==typeof i.prevEl&&t.length>1&&1===this.$el.find(i.prevEl).length&&(t=this.$el.find(i.prevEl))),e&&e.length>0&&e.on("click",this.navigation.onNextClick),t&&t.length>0&&t.on("click",this.navigation.onPrevClick),n.extend(this.navigation,{$nextEl:e,nextEl:e&&e[0],$prevEl:t,prevEl:t&&t[0]}))},destroy:function(){var e=this.navigation,t=e.$nextEl,i=e.$prevEl;t&&t.length&&(t.off("click",this.navigation.onNextClick),t.removeClass(this.params.navigation.disabledClass)),i&&i.length&&(i.off("click",this.navigation.onPrevClick),i.removeClass(this.params.navigation.disabledClass))}},ae={update:function(){var e=this.rtl,t=this.params.pagination;if(t.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var i,a=this.virtual&&this.params.virtual.enabled?this.virtual.slides.length:this.slides.length,r=this.pagination.$el,n=this.params.loop?Math.ceil((a-2*this.loopedSlides)/this.params.slidesPerGroup):this.snapGrid.length;if(this.params.loop?((i=Math.ceil((this.activeIndex-this.loopedSlides)/this.params.slidesPerGroup))>a-1-2*this.loopedSlides&&(i-=a-2*this.loopedSlides),i>n-1&&(i-=n),i<0&&"bullets"!==this.params.paginationType&&(i=n+i)):i=void 0!==this.snapIndex?this.snapIndex:this.activeIndex||0,"bullets"===t.type&&this.pagination.bullets&&this.pagination.bullets.length>0){var o,l,d,h=this.pagination.bullets;if(t.dynamicBullets&&(this.pagination.bulletSize=h.eq(0)[this.isHorizontal()?"outerWidth":"outerHeight"](!0),r.css(this.isHorizontal()?"width":"height",this.pagination.bulletSize*(t.dynamicMainBullets+4)+"px"),t.dynamicMainBullets>1&&void 0!==this.previousIndex&&(this.pagination.dynamicBulletIndex+=i-this.previousIndex,this.pagination.dynamicBulletIndex>t.dynamicMainBullets-1?this.pagination.dynamicBulletIndex=t.dynamicMainBullets-1:this.pagination.dynamicBulletIndex<0&&(this.pagination.dynamicBulletIndex=0)),o=i-this.pagination.dynamicBulletIndex,d=((l=o+(Math.min(h.length,t.dynamicMainBullets)-1))+o)/2),h.removeClass(t.bulletActiveClass+" "+t.bulletActiveClass+"-next "+t.bulletActiveClass+"-next-next "+t.bulletActiveClass+"-prev "+t.bulletActiveClass+"-prev-prev "+t.bulletActiveClass+"-main"),r.length>1)h.each((function(e,a){var r=s(a),n=r.index();n===i&&r.addClass(t.bulletActiveClass),t.dynamicBullets&&(n>=o&&n<=l&&r.addClass(t.bulletActiveClass+"-main"),n===o&&r.prev().addClass(t.bulletActiveClass+"-prev").prev().addClass(t.bulletActiveClass+"-prev-prev"),n===l&&r.next().addClass(t.bulletActiveClass+"-next").next().addClass(t.bulletActiveClass+"-next-next"))}));else{var p=h.eq(i),c=p.index();if(p.addClass(t.bulletActiveClass),t.dynamicBullets){for(var u=h.eq(o),v=h.eq(l),f=o;f<=l;f+=1)h.eq(f).addClass(t.bulletActiveClass+"-main");if(this.params.loop)if(c>=h.length-t.dynamicMainBullets){for(var m=t.dynamicMainBullets;m>=0;m-=1)h.eq(h.length-m).addClass(t.bulletActiveClass+"-main");h.eq(h.length-t.dynamicMainBullets-1).addClass(t.bulletActiveClass+"-prev")}else u.prev().addClass(t.bulletActiveClass+"-prev").prev().addClass(t.bulletActiveClass+"-prev-prev"),v.next().addClass(t.bulletActiveClass+"-next").next().addClass(t.bulletActiveClass+"-next-next");else u.prev().addClass(t.bulletActiveClass+"-prev").prev().addClass(t.bulletActiveClass+"-prev-prev"),v.next().addClass(t.bulletActiveClass+"-next").next().addClass(t.bulletActiveClass+"-next-next")}}if(t.dynamicBullets){var g=Math.min(h.length,t.dynamicMainBullets+4),b=(this.pagination.bulletSize*g-this.pagination.bulletSize)/2-d*this.pagination.bulletSize,w=e?"right":"left";h.css(this.isHorizontal()?w:"top",b+"px")}}if("fraction"===t.type&&(r.find("."+t.currentClass).text(t.formatFractionCurrent(i+1)),r.find("."+t.totalClass).text(t.formatFractionTotal(n))),"progressbar"===t.type){var y;y=t.progressbarOpposite?this.isHorizontal()?"vertical":"horizontal":this.isHorizontal()?"horizontal":"vertical";var x=(i+1)/n,T=1,E=1;"horizontal"===y?T=x:E=x,r.find("."+t.progressbarFillClass).transform("translate3d(0,0,0) scaleX("+T+") scaleY("+E+")").transition(this.params.speed)}"custom"===t.type&&t.renderCustom?(r.html(t.renderCustom(this,i+1,n)),this.emit("paginationRender",this,r[0])):this.emit("paginationUpdate",this,r[0]),r[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](t.lockClass)}},render:function(){var e=this.params.pagination;if(e.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var t=this.virtual&&this.params.virtual.enabled?this.virtual.slides.length:this.slides.length,i=this.pagination.$el,s="";if("bullets"===e.type){for(var a=this.params.loop?Math.ceil((t-2*this.loopedSlides)/this.params.slidesPerGroup):this.snapGrid.length,r=0;r<a;r+=1)e.renderBullet?s+=e.renderBullet.call(this,r,e.bulletClass):s+="<"+e.bulletElement+' class="'+e.bulletClass+'"></'+e.bulletElement+">";i.html(s),this.pagination.bullets=i.find("."+e.bulletClass)}"fraction"===e.type&&(s=e.renderFraction?e.renderFraction.call(this,e.currentClass,e.totalClass):'<span class="'+e.currentClass+'"></span> / <span class="'+e.totalClass+'"></span>',i.html(s)),"progressbar"===e.type&&(s=e.renderProgressbar?e.renderProgressbar.call(this,e.progressbarFillClass):'<span class="'+e.progressbarFillClass+'"></span>',i.html(s)),"custom"!==e.type&&this.emit("paginationRender",this.pagination.$el[0])}},init:function(){var e=this,t=e.params.pagination;if(t.el){var i=s(t.el);0!==i.length&&(e.params.uniqueNavElements&&"string"==typeof t.el&&i.length>1&&1===e.$el.find(t.el).length&&(i=e.$el.find(t.el)),"bullets"===t.type&&t.clickable&&i.addClass(t.clickableClass),i.addClass(t.modifierClass+t.type),"bullets"===t.type&&t.dynamicBullets&&(i.addClass(""+t.modifierClass+t.type+"-dynamic"),e.pagination.dynamicBulletIndex=0,t.dynamicMainBullets<1&&(t.dynamicMainBullets=1)),"progressbar"===t.type&&t.progressbarOpposite&&i.addClass(t.progressbarOppositeClass),t.clickable&&i.on("click","."+t.bulletClass,(function(t){t.preventDefault();var i=s(this).index()*e.params.slidesPerGroup;e.params.loop&&(i+=e.loopedSlides),e.slideTo(i)})),n.extend(e.pagination,{$el:i,el:i[0]}))}},destroy:function(){var e=this.params.pagination;if(e.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var t=this.pagination.$el;t.removeClass(e.hiddenClass),t.removeClass(e.modifierClass+e.type),this.pagination.bullets&&this.pagination.bullets.removeClass(e.bulletActiveClass),e.clickable&&t.off("click","."+e.bulletClass)}}},re={setTranslate:function(){if(this.params.scrollbar.el&&this.scrollbar.el){var e=this.scrollbar,t=this.rtlTranslate,i=this.progress,s=e.dragSize,a=e.trackSize,r=e.$dragEl,n=e.$el,o=this.params.scrollbar,l=s,d=(a-s)*i;t?(d=-d)>0?(l=s-d,d=0):-d+s>a&&(l=a+d):d<0?(l=s+d,d=0):d+s>a&&(l=a-d),this.isHorizontal()?(r.transform("translate3d("+d+"px, 0, 0)"),r[0].style.width=l+"px"):(r.transform("translate3d(0px, "+d+"px, 0)"),r[0].style.height=l+"px"),o.hide&&(clearTimeout(this.scrollbar.timeout),n[0].style.opacity=1,this.scrollbar.timeout=setTimeout((function(){n[0].style.opacity=0,n.transition(400)}),1e3))}},setTransition:function(e){this.params.scrollbar.el&&this.scrollbar.el&&this.scrollbar.$dragEl.transition(e)},updateSize:function(){if(this.params.scrollbar.el&&this.scrollbar.el){var e=this.scrollbar,t=e.$dragEl,i=e.$el;t[0].style.width="",t[0].style.height="";var s,a=this.isHorizontal()?i[0].offsetWidth:i[0].offsetHeight,r=this.size/this.virtualSize,o=r*(a/this.size);s="auto"===this.params.scrollbar.dragSize?a*r:parseInt(this.params.scrollbar.dragSize,10),this.isHorizontal()?t[0].style.width=s+"px":t[0].style.height=s+"px",i[0].style.display=r>=1?"none":"",this.params.scrollbar.hide&&(i[0].style.opacity=0),n.extend(e,{trackSize:a,divider:r,moveDivider:o,dragSize:s}),e.$el[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](this.params.scrollbar.lockClass)}},getPointerPosition:function(e){return this.isHorizontal()?"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].clientX:e.clientX:"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].clientY:e.clientY},setDragPosition:function(e){var t,i=this.scrollbar,s=this.rtlTranslate,a=i.$el,r=i.dragSize,n=i.trackSize,o=i.dragStartPos;t=(i.getPointerPosition(e)-a.offset()[this.isHorizontal()?"left":"top"]-(null!==o?o:r/2))/(n-r),t=Math.max(Math.min(t,1),0),s&&(t=1-t);var l=this.minTranslate()+(this.maxTranslate()-this.minTranslate())*t;this.updateProgress(l),this.setTranslate(l),this.updateActiveIndex(),this.updateSlidesClasses()},onDragStart:function(e){var t=this.params.scrollbar,i=this.scrollbar,s=this.$wrapperEl,a=i.$el,r=i.$dragEl;this.scrollbar.isTouched=!0,this.scrollbar.dragStartPos=e.target===r[0]||e.target===r?i.getPointerPosition(e)-e.target.getBoundingClientRect()[this.isHorizontal()?"left":"top"]:null,e.preventDefault(),e.stopPropagation(),s.transition(100),r.transition(100),i.setDragPosition(e),clearTimeout(this.scrollbar.dragTimeout),a.transition(0),t.hide&&a.css("opacity",1),this.params.cssMode&&this.$wrapperEl.css("scroll-snap-type","none"),this.emit("scrollbarDragStart",e)},onDragMove:function(e){var t=this.scrollbar,i=this.$wrapperEl,s=t.$el,a=t.$dragEl;this.scrollbar.isTouched&&(e.preventDefault?e.preventDefault():e.returnValue=!1,t.setDragPosition(e),i.transition(0),s.transition(0),a.transition(0),this.emit("scrollbarDragMove",e))},onDragEnd:function(e){var t=this.params.scrollbar,i=this.scrollbar,s=this.$wrapperEl,a=i.$el;this.scrollbar.isTouched&&(this.scrollbar.isTouched=!1,this.params.cssMode&&(this.$wrapperEl.css("scroll-snap-type",""),s.transition("")),t.hide&&(clearTimeout(this.scrollbar.dragTimeout),this.scrollbar.dragTimeout=n.nextTick((function(){a.css("opacity",0),a.transition(400)}),1e3)),this.emit("scrollbarDragEnd",e),t.snapOnRelease&&this.slideToClosest())},enableDraggable:function(){if(this.params.scrollbar.el){var t=this.scrollbar,i=this.touchEventsTouch,s=this.touchEventsDesktop,a=this.params,r=t.$el[0],n=!(!o.passiveListener||!a.passiveListeners)&&{passive:!1,capture:!1},l=!(!o.passiveListener||!a.passiveListeners)&&{passive:!0,capture:!1};o.touch?(r.addEventListener(i.start,this.scrollbar.onDragStart,n),r.addEventListener(i.move,this.scrollbar.onDragMove,n),r.addEventListener(i.end,this.scrollbar.onDragEnd,l)):(r.addEventListener(s.start,this.scrollbar.onDragStart,n),e.addEventListener(s.move,this.scrollbar.onDragMove,n),e.addEventListener(s.end,this.scrollbar.onDragEnd,l))}},disableDraggable:function(){if(this.params.scrollbar.el){var t=this.scrollbar,i=this.touchEventsTouch,s=this.touchEventsDesktop,a=this.params,r=t.$el[0],n=!(!o.passiveListener||!a.passiveListeners)&&{passive:!1,capture:!1},l=!(!o.passiveListener||!a.passiveListeners)&&{passive:!0,capture:!1};o.touch?(r.removeEventListener(i.start,this.scrollbar.onDragStart,n),r.removeEventListener(i.move,this.scrollbar.onDragMove,n),r.removeEventListener(i.end,this.scrollbar.onDragEnd,l)):(r.removeEventListener(s.start,this.scrollbar.onDragStart,n),e.removeEventListener(s.move,this.scrollbar.onDragMove,n),e.removeEventListener(s.end,this.scrollbar.onDragEnd,l))}},init:function(){if(this.params.scrollbar.el){var e=this.scrollbar,t=this.$el,i=this.params.scrollbar,a=s(i.el);this.params.uniqueNavElements&&"string"==typeof i.el&&a.length>1&&1===t.find(i.el).length&&(a=t.find(i.el));var r=a.find("."+this.params.scrollbar.dragClass);0===r.length&&(r=s('<div class="'+this.params.scrollbar.dragClass+'"></div>'),a.append(r)),n.extend(e,{$el:a,el:a[0],$dragEl:r,dragEl:r[0]}),i.draggable&&e.enableDraggable()}},destroy:function(){this.scrollbar.disableDraggable()}},ne={setTransform:function(e,t){var i=this.rtl,a=s(e),r=i?-1:1,n=a.attr("data-swiper-parallax")||"0",o=a.attr("data-swiper-parallax-x"),l=a.attr("data-swiper-parallax-y"),d=a.attr("data-swiper-parallax-scale"),h=a.attr("data-swiper-parallax-opacity");if(o||l?(o=o||"0",l=l||"0"):this.isHorizontal()?(o=n,l="0"):(l=n,o="0"),o=o.indexOf("%")>=0?parseInt(o,10)*t*r+"%":o*t*r+"px",l=l.indexOf("%")>=0?parseInt(l,10)*t+"%":l*t+"px",null!=h){var p=h-(h-1)*(1-Math.abs(t));a[0].style.opacity=p}if(null==d)a.transform("translate3d("+o+", "+l+", 0px)");else{var c=d-(d-1)*(1-Math.abs(t));a.transform("translate3d("+o+", "+l+", 0px) scale("+c+")")}},setTranslate:function(){var e=this,t=e.$el,i=e.slides,a=e.progress,r=e.snapGrid;t.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((function(t,i){e.parallax.setTransform(i,a)})),i.each((function(t,i){var n=i.progress;e.params.slidesPerGroup>1&&"auto"!==e.params.slidesPerView&&(n+=Math.ceil(t/2)-a*(r.length-1)),n=Math.min(Math.max(n,-1),1),s(i).find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((function(t,i){e.parallax.setTransform(i,n)}))}))},setTransition:function(e){void 0===e&&(e=this.params.speed);this.$el.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((function(t,i){var a=s(i),r=parseInt(a.attr("data-swiper-parallax-duration"),10)||e;0===e&&(r=0),a.transition(r)}))}},oe={getDistanceBetweenTouches:function(e){if(e.targetTouches.length<2)return 1;var t=e.targetTouches[0].pageX,i=e.targetTouches[0].pageY,s=e.targetTouches[1].pageX,a=e.targetTouches[1].pageY;return Math.sqrt(Math.pow(s-t,2)+Math.pow(a-i,2))},onGestureStart:function(e){var t=this.params.zoom,i=this.zoom,a=i.gesture;if(i.fakeGestureTouched=!1,i.fakeGestureMoved=!1,!o.gestures){if("touchstart"!==e.type||"touchstart"===e.type&&e.targetTouches.length<2)return;i.fakeGestureTouched=!0,a.scaleStart=oe.getDistanceBetweenTouches(e)}a.$slideEl&&a.$slideEl.length||(a.$slideEl=s(e.target).closest("."+this.params.slideClass),0===a.$slideEl.length&&(a.$slideEl=this.slides.eq(this.activeIndex)),a.$imageEl=a.$slideEl.find("img, svg, canvas, picture, .swiper-zoom-target"),a.$imageWrapEl=a.$imageEl.parent("."+t.containerClass),a.maxRatio=a.$imageWrapEl.attr("data-swiper-zoom")||t.maxRatio,0!==a.$imageWrapEl.length)?(a.$imageEl.transition(0),this.zoom.isScaling=!0):a.$imageEl=void 0},onGestureChange:function(e){var t=this.params.zoom,i=this.zoom,s=i.gesture;if(!o.gestures){if("touchmove"!==e.type||"touchmove"===e.type&&e.targetTouches.length<2)return;i.fakeGestureMoved=!0,s.scaleMove=oe.getDistanceBetweenTouches(e)}s.$imageEl&&0!==s.$imageEl.length&&(o.gestures?i.scale=e.scale*i.currentScale:i.scale=s.scaleMove/s.scaleStart*i.currentScale,i.scale>s.maxRatio&&(i.scale=s.maxRatio-1+Math.pow(i.scale-s.maxRatio+1,.5)),i.scale<t.minRatio&&(i.scale=t.minRatio+1-Math.pow(t.minRatio-i.scale+1,.5)),s.$imageEl.transform("translate3d(0,0,0) scale("+i.scale+")"))},onGestureEnd:function(e){var t=this.params.zoom,i=this.zoom,s=i.gesture;if(!o.gestures){if(!i.fakeGestureTouched||!i.fakeGestureMoved)return;if("touchend"!==e.type||"touchend"===e.type&&e.changedTouches.length<2&&!I.android)return;i.fakeGestureTouched=!1,i.fakeGestureMoved=!1}s.$imageEl&&0!==s.$imageEl.length&&(i.scale=Math.max(Math.min(i.scale,s.maxRatio),t.minRatio),s.$imageEl.transition(this.params.speed).transform("translate3d(0,0,0) scale("+i.scale+")"),i.currentScale=i.scale,i.isScaling=!1,1===i.scale&&(s.$slideEl=void 0))},onTouchStart:function(e){var t=this.zoom,i=t.gesture,s=t.image;i.$imageEl&&0!==i.$imageEl.length&&(s.isTouched||(I.android&&e.preventDefault(),s.isTouched=!0,s.touchesStart.x="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,s.touchesStart.y="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY))},onTouchMove:function(e){var t=this.zoom,i=t.gesture,s=t.image,a=t.velocity;if(i.$imageEl&&0!==i.$imageEl.length&&(this.allowClick=!1,s.isTouched&&i.$slideEl)){s.isMoved||(s.width=i.$imageEl[0].offsetWidth,s.height=i.$imageEl[0].offsetHeight,s.startX=n.getTranslate(i.$imageWrapEl[0],"x")||0,s.startY=n.getTranslate(i.$imageWrapEl[0],"y")||0,i.slideWidth=i.$slideEl[0].offsetWidth,i.slideHeight=i.$slideEl[0].offsetHeight,i.$imageWrapEl.transition(0),this.rtl&&(s.startX=-s.startX,s.startY=-s.startY));var r=s.width*t.scale,o=s.height*t.scale;if(!(r<i.slideWidth&&o<i.slideHeight)){if(s.minX=Math.min(i.slideWidth/2-r/2,0),s.maxX=-s.minX,s.minY=Math.min(i.slideHeight/2-o/2,0),s.maxY=-s.minY,s.touchesCurrent.x="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,s.touchesCurrent.y="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,!s.isMoved&&!t.isScaling){if(this.isHorizontal()&&(Math.floor(s.minX)===Math.floor(s.startX)&&s.touchesCurrent.x<s.touchesStart.x||Math.floor(s.maxX)===Math.floor(s.startX)&&s.touchesCurrent.x>s.touchesStart.x))return void(s.isTouched=!1);if(!this.isHorizontal()&&(Math.floor(s.minY)===Math.floor(s.startY)&&s.touchesCurrent.y<s.touchesStart.y||Math.floor(s.maxY)===Math.floor(s.startY)&&s.touchesCurrent.y>s.touchesStart.y))return void(s.isTouched=!1)}e.preventDefault(),e.stopPropagation(),s.isMoved=!0,s.currentX=s.touchesCurrent.x-s.touchesStart.x+s.startX,s.currentY=s.touchesCurrent.y-s.touchesStart.y+s.startY,s.currentX<s.minX&&(s.currentX=s.minX+1-Math.pow(s.minX-s.currentX+1,.8)),s.currentX>s.maxX&&(s.currentX=s.maxX-1+Math.pow(s.currentX-s.maxX+1,.8)),s.currentY<s.minY&&(s.currentY=s.minY+1-Math.pow(s.minY-s.currentY+1,.8)),s.currentY>s.maxY&&(s.currentY=s.maxY-1+Math.pow(s.currentY-s.maxY+1,.8)),a.prevPositionX||(a.prevPositionX=s.touchesCurrent.x),a.prevPositionY||(a.prevPositionY=s.touchesCurrent.y),a.prevTime||(a.prevTime=Date.now()),a.x=(s.touchesCurrent.x-a.prevPositionX)/(Date.now()-a.prevTime)/2,a.y=(s.touchesCurrent.y-a.prevPositionY)/(Date.now()-a.prevTime)/2,Math.abs(s.touchesCurrent.x-a.prevPositionX)<2&&(a.x=0),Math.abs(s.touchesCurrent.y-a.prevPositionY)<2&&(a.y=0),a.prevPositionX=s.touchesCurrent.x,a.prevPositionY=s.touchesCurrent.y,a.prevTime=Date.now(),i.$imageWrapEl.transform("translate3d("+s.currentX+"px, "+s.currentY+"px,0)")}}},onTouchEnd:function(){var e=this.zoom,t=e.gesture,i=e.image,s=e.velocity;if(t.$imageEl&&0!==t.$imageEl.length){if(!i.isTouched||!i.isMoved)return i.isTouched=!1,void(i.isMoved=!1);i.isTouched=!1,i.isMoved=!1;var a=300,r=300,n=s.x*a,o=i.currentX+n,l=s.y*r,d=i.currentY+l;0!==s.x&&(a=Math.abs((o-i.currentX)/s.x)),0!==s.y&&(r=Math.abs((d-i.currentY)/s.y));var h=Math.max(a,r);i.currentX=o,i.currentY=d;var p=i.width*e.scale,c=i.height*e.scale;i.minX=Math.min(t.slideWidth/2-p/2,0),i.maxX=-i.minX,i.minY=Math.min(t.slideHeight/2-c/2,0),i.maxY=-i.minY,i.currentX=Math.max(Math.min(i.currentX,i.maxX),i.minX),i.currentY=Math.max(Math.min(i.currentY,i.maxY),i.minY),t.$imageWrapEl.transition(h).transform("translate3d("+i.currentX+"px, "+i.currentY+"px,0)")}},onTransitionEnd:function(){var e=this.zoom,t=e.gesture;t.$slideEl&&this.previousIndex!==this.activeIndex&&(t.$imageEl.transform("translate3d(0,0,0) scale(1)"),t.$imageWrapEl.transform("translate3d(0,0,0)"),e.scale=1,e.currentScale=1,t.$slideEl=void 0,t.$imageEl=void 0,t.$imageWrapEl=void 0)},toggle:function(e){var t=this.zoom;t.scale&&1!==t.scale?t.out():t.in(e)},in:function(e){var t,i,s,a,r,n,o,l,d,h,p,c,u,v,f,m,g=this.zoom,b=this.params.zoom,w=g.gesture,y=g.image;(w.$slideEl||(w.$slideEl=this.slides.eq(this.activeIndex),w.$imageEl=w.$slideEl.find("img, svg, canvas, picture, .swiper-zoom-target"),w.$imageWrapEl=w.$imageEl.parent("."+b.containerClass)),w.$imageEl&&0!==w.$imageEl.length)&&(w.$slideEl.addClass(""+b.zoomedSlideClass),void 0===y.touchesStart.x&&e?(t="touchend"===e.type?e.changedTouches[0].pageX:e.pageX,i="touchend"===e.type?e.changedTouches[0].pageY:e.pageY):(t=y.touchesStart.x,i=y.touchesStart.y),g.scale=w.$imageWrapEl.attr("data-swiper-zoom")||b.maxRatio,g.currentScale=w.$imageWrapEl.attr("data-swiper-zoom")||b.maxRatio,e?(f=w.$slideEl[0].offsetWidth,m=w.$slideEl[0].offsetHeight,s=w.$slideEl.offset().left+f/2-t,a=w.$slideEl.offset().top+m/2-i,o=w.$imageEl[0].offsetWidth,l=w.$imageEl[0].offsetHeight,d=o*g.scale,h=l*g.scale,u=-(p=Math.min(f/2-d/2,0)),v=-(c=Math.min(m/2-h/2,0)),(r=s*g.scale)<p&&(r=p),r>u&&(r=u),(n=a*g.scale)<c&&(n=c),n>v&&(n=v)):(r=0,n=0),w.$imageWrapEl.transition(300).transform("translate3d("+r+"px, "+n+"px,0)"),w.$imageEl.transition(300).transform("translate3d(0,0,0) scale("+g.scale+")"))},out:function(){var e=this.zoom,t=this.params.zoom,i=e.gesture;i.$slideEl||(i.$slideEl=this.slides.eq(this.activeIndex),i.$imageEl=i.$slideEl.find("img, svg, canvas, picture, .swiper-zoom-target"),i.$imageWrapEl=i.$imageEl.parent("."+t.containerClass)),i.$imageEl&&0!==i.$imageEl.length&&(e.scale=1,e.currentScale=1,i.$imageWrapEl.transition(300).transform("translate3d(0,0,0)"),i.$imageEl.transition(300).transform("translate3d(0,0,0) scale(1)"),i.$slideEl.removeClass(""+t.zoomedSlideClass),i.$slideEl=void 0)},enable:function(){var e=this.zoom;if(!e.enabled){e.enabled=!0;var t=!("touchstart"!==this.touchEvents.start||!o.passiveListener||!this.params.passiveListeners)&&{passive:!0,capture:!1},i=!o.passiveListener||{passive:!1,capture:!0},s="."+this.params.slideClass;o.gestures?(this.$wrapperEl.on("gesturestart",s,e.onGestureStart,t),this.$wrapperEl.on("gesturechange",s,e.onGestureChange,t),this.$wrapperEl.on("gestureend",s,e.onGestureEnd,t)):"touchstart"===this.touchEvents.start&&(this.$wrapperEl.on(this.touchEvents.start,s,e.onGestureStart,t),this.$wrapperEl.on(this.touchEvents.move,s,e.onGestureChange,i),this.$wrapperEl.on(this.touchEvents.end,s,e.onGestureEnd,t),this.touchEvents.cancel&&this.$wrapperEl.on(this.touchEvents.cancel,s,e.onGestureEnd,t)),this.$wrapperEl.on(this.touchEvents.move,"."+this.params.zoom.containerClass,e.onTouchMove,i)}},disable:function(){var e=this.zoom;if(e.enabled){this.zoom.enabled=!1;var t=!("touchstart"!==this.touchEvents.start||!o.passiveListener||!this.params.passiveListeners)&&{passive:!0,capture:!1},i=!o.passiveListener||{passive:!1,capture:!0},s="."+this.params.slideClass;o.gestures?(this.$wrapperEl.off("gesturestart",s,e.onGestureStart,t),this.$wrapperEl.off("gesturechange",s,e.onGestureChange,t),this.$wrapperEl.off("gestureend",s,e.onGestureEnd,t)):"touchstart"===this.touchEvents.start&&(this.$wrapperEl.off(this.touchEvents.start,s,e.onGestureStart,t),this.$wrapperEl.off(this.touchEvents.move,s,e.onGestureChange,i),this.$wrapperEl.off(this.touchEvents.end,s,e.onGestureEnd,t),this.touchEvents.cancel&&this.$wrapperEl.off(this.touchEvents.cancel,s,e.onGestureEnd,t)),this.$wrapperEl.off(this.touchEvents.move,"."+this.params.zoom.containerClass,e.onTouchMove,i)}}},le={loadInSlide:function(e,t){void 0===t&&(t=!0);var i=this,a=i.params.lazy;if(void 0!==e&&0!==i.slides.length){var r=i.virtual&&i.params.virtual.enabled?i.$wrapperEl.children("."+i.params.slideClass+'[data-swiper-slide-index="'+e+'"]'):i.slides.eq(e),n=r.find("."+a.elementClass+":not(."+a.loadedClass+"):not(."+a.loadingClass+")");!r.hasClass(a.elementClass)||r.hasClass(a.loadedClass)||r.hasClass(a.loadingClass)||(n=n.add(r[0])),0!==n.length&&n.each((function(e,n){var o=s(n);o.addClass(a.loadingClass);var l=o.attr("data-background"),d=o.attr("data-src"),h=o.attr("data-srcset"),p=o.attr("data-sizes");i.loadImage(o[0],d||l,h,p,!1,(function(){if(null!=i&&i&&(!i||i.params)&&!i.destroyed){if(l?(o.css("background-image",'url("'+l+'")'),o.removeAttr("data-background")):(h&&(o.attr("srcset",h),o.removeAttr("data-srcset")),p&&(o.attr("sizes",p),o.removeAttr("data-sizes")),d&&(o.attr("src",d),o.removeAttr("data-src"))),o.addClass(a.loadedClass).removeClass(a.loadingClass),r.find("."+a.preloaderClass).remove(),i.params.loop&&t){var e=r.attr("data-swiper-slide-index");if(r.hasClass(i.params.slideDuplicateClass)){var s=i.$wrapperEl.children('[data-swiper-slide-index="'+e+'"]:not(.'+i.params.slideDuplicateClass+")");i.lazy.loadInSlide(s.index(),!1)}else{var n=i.$wrapperEl.children("."+i.params.slideDuplicateClass+'[data-swiper-slide-index="'+e+'"]');i.lazy.loadInSlide(n.index(),!1)}}i.emit("lazyImageReady",r[0],o[0]),i.params.autoHeight&&i.updateAutoHeight()}})),i.emit("lazyImageLoad",r[0],o[0])}))}},load:function(){var e=this,t=e.$wrapperEl,i=e.params,a=e.slides,r=e.activeIndex,n=e.virtual&&i.virtual.enabled,o=i.lazy,l=i.slidesPerView;function d(e){if(n){if(t.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]').length)return!0}else if(a[e])return!0;return!1}function h(e){return n?s(e).attr("data-swiper-slide-index"):s(e).index()}if("auto"===l&&(l=0),e.lazy.initialImageLoaded||(e.lazy.initialImageLoaded=!0),e.params.watchSlidesVisibility)t.children("."+i.slideVisibleClass).each((function(t,i){var a=n?s(i).attr("data-swiper-slide-index"):s(i).index();e.lazy.loadInSlide(a)}));else if(l>1)for(var p=r;p<r+l;p+=1)d(p)&&e.lazy.loadInSlide(p);else e.lazy.loadInSlide(r);if(o.loadPrevNext)if(l>1||o.loadPrevNextAmount&&o.loadPrevNextAmount>1){for(var c=o.loadPrevNextAmount,u=l,v=Math.min(r+u+Math.max(c,u),a.length),f=Math.max(r-Math.max(u,c),0),m=r+l;m<v;m+=1)d(m)&&e.lazy.loadInSlide(m);for(var g=f;g<r;g+=1)d(g)&&e.lazy.loadInSlide(g)}else{var b=t.children("."+i.slideNextClass);b.length>0&&e.lazy.loadInSlide(h(b));var w=t.children("."+i.slidePrevClass);w.length>0&&e.lazy.loadInSlide(h(w))}}},de={LinearSpline:function(e,t){var i,s,a,r,n,o=function(e,t){for(s=-1,i=e.length;i-s>1;)e[a=i+s>>1]<=t?s=a:i=a;return i};return this.x=e,this.y=t,this.lastIndex=e.length-1,this.interpolate=function(e){return e?(n=o(this.x,e),r=n-1,(e-this.x[r])*(this.y[n]-this.y[r])/(this.x[n]-this.x[r])+this.y[r]):0},this},getInterpolateFunction:function(e){this.controller.spline||(this.controller.spline=this.params.loop?new de.LinearSpline(this.slidesGrid,e.slidesGrid):new de.LinearSpline(this.snapGrid,e.snapGrid))},setTranslate:function(e,t){var i,s,a=this,r=a.controller.control;function n(e){var t=a.rtlTranslate?-a.translate:a.translate;"slide"===a.params.controller.by&&(a.controller.getInterpolateFunction(e),s=-a.controller.spline.interpolate(-t)),s&&"container"!==a.params.controller.by||(i=(e.maxTranslate()-e.minTranslate())/(a.maxTranslate()-a.minTranslate()),s=(t-a.minTranslate())*i+e.minTranslate()),a.params.controller.inverse&&(s=e.maxTranslate()-s),e.updateProgress(s),e.setTranslate(s,a),e.updateActiveIndex(),e.updateSlidesClasses()}if(Array.isArray(r))for(var o=0;o<r.length;o+=1)r[o]!==t&&r[o]instanceof W&&n(r[o]);else r instanceof W&&t!==r&&n(r)},setTransition:function(e,t){var i,s=this,a=s.controller.control;function r(t){t.setTransition(e,s),0!==e&&(t.transitionStart(),t.params.autoHeight&&n.nextTick((function(){t.updateAutoHeight()})),t.$wrapperEl.transitionEnd((function(){a&&(t.params.loop&&"slide"===s.params.controller.by&&t.loopFix(),t.transitionEnd())})))}if(Array.isArray(a))for(i=0;i<a.length;i+=1)a[i]!==t&&a[i]instanceof W&&r(a[i]);else a instanceof W&&t!==a&&r(a)}},he={makeElFocusable:function(e){return e.attr("tabIndex","0"),e},addElRole:function(e,t){return e.attr("role",t),e},addElLabel:function(e,t){return e.attr("aria-label",t),e},disableEl:function(e){return e.attr("aria-disabled",!0),e},enableEl:function(e){return e.attr("aria-disabled",!1),e},onEnterKey:function(e){var t=this.params.a11y;if(13===e.keyCode){var i=s(e.target);this.navigation&&this.navigation.$nextEl&&i.is(this.navigation.$nextEl)&&(this.isEnd&&!this.params.loop||this.slideNext(),this.isEnd?this.a11y.notify(t.lastSlideMessage):this.a11y.notify(t.nextSlideMessage)),this.navigation&&this.navigation.$prevEl&&i.is(this.navigation.$prevEl)&&(this.isBeginning&&!this.params.loop||this.slidePrev(),this.isBeginning?this.a11y.notify(t.firstSlideMessage):this.a11y.notify(t.prevSlideMessage)),this.pagination&&i.is("."+this.params.pagination.bulletClass)&&i[0].click()}},notify:function(e){var t=this.a11y.liveRegion;0!==t.length&&(t.html(""),t.html(e))},updateNavigation:function(){if(!this.params.loop&&this.navigation){var e=this.navigation,t=e.$nextEl,i=e.$prevEl;i&&i.length>0&&(this.isBeginning?this.a11y.disableEl(i):this.a11y.enableEl(i)),t&&t.length>0&&(this.isEnd?this.a11y.disableEl(t):this.a11y.enableEl(t))}},updatePagination:function(){var e=this,t=e.params.a11y;e.pagination&&e.params.pagination.clickable&&e.pagination.bullets&&e.pagination.bullets.length&&e.pagination.bullets.each((function(i,a){var r=s(a);e.a11y.makeElFocusable(r),e.a11y.addElRole(r,"button"),e.a11y.addElLabel(r,t.paginationBulletMessage.replace(/{{index}}/,r.index()+1))}))},init:function(){this.$el.append(this.a11y.liveRegion);var e,t,i=this.params.a11y;this.navigation&&this.navigation.$nextEl&&(e=this.navigation.$nextEl),this.navigation&&this.navigation.$prevEl&&(t=this.navigation.$prevEl),e&&(this.a11y.makeElFocusable(e),this.a11y.addElRole(e,"button"),this.a11y.addElLabel(e,i.nextSlideMessage),e.on("keydown",this.a11y.onEnterKey)),t&&(this.a11y.makeElFocusable(t),this.a11y.addElRole(t,"button"),this.a11y.addElLabel(t,i.prevSlideMessage),t.on("keydown",this.a11y.onEnterKey)),this.pagination&&this.params.pagination.clickable&&this.pagination.bullets&&this.pagination.bullets.length&&this.pagination.$el.on("keydown","."+this.params.pagination.bulletClass,this.a11y.onEnterKey)},destroy:function(){var e,t;this.a11y.liveRegion&&this.a11y.liveRegion.length>0&&this.a11y.liveRegion.remove(),this.navigation&&this.navigation.$nextEl&&(e=this.navigation.$nextEl),this.navigation&&this.navigation.$prevEl&&(t=this.navigation.$prevEl),e&&e.off("keydown",this.a11y.onEnterKey),t&&t.off("keydown",this.a11y.onEnterKey),this.pagination&&this.params.pagination.clickable&&this.pagination.bullets&&this.pagination.bullets.length&&this.pagination.$el.off("keydown","."+this.params.pagination.bulletClass,this.a11y.onEnterKey)}},pe={init:function(){if(this.params.history){if(!t.history||!t.history.pushState)return this.params.history.enabled=!1,void(this.params.hashNavigation.enabled=!0);var e=this.history;e.initialized=!0,e.paths=pe.getPathValues(),(e.paths.key||e.paths.value)&&(e.scrollToSlide(0,e.paths.value,this.params.runCallbacksOnInit),this.params.history.replaceState||t.addEventListener("popstate",this.history.setHistoryPopState))}},destroy:function(){this.params.history.replaceState||t.removeEventListener("popstate",this.history.setHistoryPopState)},setHistoryPopState:function(){this.history.paths=pe.getPathValues(),this.history.scrollToSlide(this.params.speed,this.history.paths.value,!1)},getPathValues:function(){var e=t.location.pathname.slice(1).split("/").filter((function(e){return""!==e})),i=e.length;return{key:e[i-2],value:e[i-1]}},setHistory:function(e,i){if(this.history.initialized&&this.params.history.enabled){var s=this.slides.eq(i),a=pe.slugify(s.attr("data-history"));t.location.pathname.includes(e)||(a=e+"/"+a);var r=t.history.state;r&&r.value===a||(this.params.history.replaceState?t.history.replaceState({value:a},null,a):t.history.pushState({value:a},null,a))}},slugify:function(e){return e.toString().replace(/\s+/g,"-").replace(/[^\w-]+/g,"").replace(/--+/g,"-").replace(/^-+/,"").replace(/-+$/,"")},scrollToSlide:function(e,t,i){if(t)for(var s=0,a=this.slides.length;s<a;s+=1){var r=this.slides.eq(s);if(pe.slugify(r.attr("data-history"))===t&&!r.hasClass(this.params.slideDuplicateClass)){var n=r.index();this.slideTo(n,e,i)}}else this.slideTo(0,e,i)}},ce={onHashCange:function(){var t=e.location.hash.replace("#","");if(t!==this.slides.eq(this.activeIndex).attr("data-hash")){var i=this.$wrapperEl.children("."+this.params.slideClass+'[data-hash="'+t+'"]').index();if(void 0===i)return;this.slideTo(i)}},setHash:function(){if(this.hashNavigation.initialized&&this.params.hashNavigation.enabled)if(this.params.hashNavigation.replaceState&&t.history&&t.history.replaceState)t.history.replaceState(null,null,"#"+this.slides.eq(this.activeIndex).attr("data-hash")||"");else{var i=this.slides.eq(this.activeIndex),s=i.attr("data-hash")||i.attr("data-history");e.location.hash=s||""}},init:function(){if(!(!this.params.hashNavigation.enabled||this.params.history&&this.params.history.enabled)){this.hashNavigation.initialized=!0;var i=e.location.hash.replace("#","");if(i)for(var a=0,r=this.slides.length;a<r;a+=1){var n=this.slides.eq(a);if((n.attr("data-hash")||n.attr("data-history"))===i&&!n.hasClass(this.params.slideDuplicateClass)){var o=n.index();this.slideTo(o,0,this.params.runCallbacksOnInit,!0)}}this.params.hashNavigation.watchState&&s(t).on("hashchange",this.hashNavigation.onHashCange)}},destroy:function(){this.params.hashNavigation.watchState&&s(t).off("hashchange",this.hashNavigation.onHashCange)}},ue={run:function(){var e=this,t=e.slides.eq(e.activeIndex),i=e.params.autoplay.delay;t.attr("data-swiper-autoplay")&&(i=t.attr("data-swiper-autoplay")||e.params.autoplay.delay),clearTimeout(e.autoplay.timeout),e.autoplay.timeout=n.nextTick((function(){e.params.autoplay.reverseDirection?e.params.loop?(e.loopFix(),e.slidePrev(e.params.speed,!0,!0),e.emit("autoplay")):e.isBeginning?e.params.autoplay.stopOnLastSlide?e.autoplay.stop():(e.slideTo(e.slides.length-1,e.params.speed,!0,!0),e.emit("autoplay")):(e.slidePrev(e.params.speed,!0,!0),e.emit("autoplay")):e.params.loop?(e.loopFix(),e.slideNext(e.params.speed,!0,!0),e.emit("autoplay")):e.isEnd?e.params.autoplay.stopOnLastSlide?e.autoplay.stop():(e.slideTo(0,e.params.speed,!0,!0),e.emit("autoplay")):(e.slideNext(e.params.speed,!0,!0),e.emit("autoplay")),e.params.cssMode&&e.autoplay.running&&e.autoplay.run()}),i)},start:function(){return void 0===this.autoplay.timeout&&(!this.autoplay.running&&(this.autoplay.running=!0,this.emit("autoplayStart"),this.autoplay.run(),!0))},stop:function(){return!!this.autoplay.running&&(void 0!==this.autoplay.timeout&&(this.autoplay.timeout&&(clearTimeout(this.autoplay.timeout),this.autoplay.timeout=void 0),this.autoplay.running=!1,this.emit("autoplayStop"),!0))},pause:function(e){this.autoplay.running&&(this.autoplay.paused||(this.autoplay.timeout&&clearTimeout(this.autoplay.timeout),this.autoplay.paused=!0,0!==e&&this.params.autoplay.waitForTransition?(this.$wrapperEl[0].addEventListener("transitionend",this.autoplay.onTransitionEnd),this.$wrapperEl[0].addEventListener("webkitTransitionEnd",this.autoplay.onTransitionEnd)):(this.autoplay.paused=!1,this.autoplay.run())))}},ve={setTranslate:function(){for(var e=this.slides,t=0;t<e.length;t+=1){var i=this.slides.eq(t),s=-i[0].swiperSlideOffset;this.params.virtualTranslate||(s-=this.translate);var a=0;this.isHorizontal()||(a=s,s=0);var r=this.params.fadeEffect.crossFade?Math.max(1-Math.abs(i[0].progress),0):1+Math.min(Math.max(i[0].progress,-1),0);i.css({opacity:r}).transform("translate3d("+s+"px, "+a+"px, 0px)")}},setTransition:function(e){var t=this,i=t.slides,s=t.$wrapperEl;if(i.transition(e),t.params.virtualTranslate&&0!==e){var a=!1;i.transitionEnd((function(){if(!a&&t&&!t.destroyed){a=!0,t.animating=!1;for(var e=["webkitTransitionEnd","transitionend"],i=0;i<e.length;i+=1)s.trigger(e[i])}}))}}},fe={setTranslate:function(){var e,t=this.$el,i=this.$wrapperEl,a=this.slides,r=this.width,n=this.height,o=this.rtlTranslate,l=this.size,d=this.params.cubeEffect,h=this.isHorizontal(),p=this.virtual&&this.params.virtual.enabled,c=0;d.shadow&&(h?(0===(e=i.find(".swiper-cube-shadow")).length&&(e=s('<div class="swiper-cube-shadow"></div>'),i.append(e)),e.css({height:r+"px"})):0===(e=t.find(".swiper-cube-shadow")).length&&(e=s('<div class="swiper-cube-shadow"></div>'),t.append(e)));for(var u=0;u<a.length;u+=1){var v=a.eq(u),f=u;p&&(f=parseInt(v.attr("data-swiper-slide-index"),10));var m=90*f,g=Math.floor(m/360);o&&(m=-m,g=Math.floor(-m/360));var b=Math.max(Math.min(v[0].progress,1),-1),w=0,y=0,x=0;f%4==0?(w=4*-g*l,x=0):(f-1)%4==0?(w=0,x=4*-g*l):(f-2)%4==0?(w=l+4*g*l,x=l):(f-3)%4==0&&(w=-l,x=3*l+4*l*g),o&&(w=-w),h||(y=w,w=0);var T="rotateX("+(h?0:-m)+"deg) rotateY("+(h?m:0)+"deg) translate3d("+w+"px, "+y+"px, "+x+"px)";if(b<=1&&b>-1&&(c=90*f+90*b,o&&(c=90*-f-90*b)),v.transform(T),d.slideShadows){var E=h?v.find(".swiper-slide-shadow-left"):v.find(".swiper-slide-shadow-top"),S=h?v.find(".swiper-slide-shadow-right"):v.find(".swiper-slide-shadow-bottom");0===E.length&&(E=s('<div class="swiper-slide-shadow-'+(h?"left":"top")+'"></div>'),v.append(E)),0===S.length&&(S=s('<div class="swiper-slide-shadow-'+(h?"right":"bottom")+'"></div>'),v.append(S)),E.length&&(E[0].style.opacity=Math.max(-b,0)),S.length&&(S[0].style.opacity=Math.max(b,0))}}if(i.css({"-webkit-transform-origin":"50% 50% -"+l/2+"px","-moz-transform-origin":"50% 50% -"+l/2+"px","-ms-transform-origin":"50% 50% -"+l/2+"px","transform-origin":"50% 50% -"+l/2+"px"}),d.shadow)if(h)e.transform("translate3d(0px, "+(r/2+d.shadowOffset)+"px, "+-r/2+"px) rotateX(90deg) rotateZ(0deg) scale("+d.shadowScale+")");else{var C=Math.abs(c)-90*Math.floor(Math.abs(c)/90),M=1.5-(Math.sin(2*C*Math.PI/360)/2+Math.cos(2*C*Math.PI/360)/2),P=d.shadowScale,z=d.shadowScale/M,k=d.shadowOffset;e.transform("scale3d("+P+", 1, "+z+") translate3d(0px, "+(n/2+k)+"px, "+-n/2/z+"px) rotateX(-90deg)")}var $=j.isSafari||j.isUiWebView?-l/2:0;i.transform("translate3d(0px,0,"+$+"px) rotateX("+(this.isHorizontal()?0:c)+"deg) rotateY("+(this.isHorizontal()?-c:0)+"deg)")},setTransition:function(e){var t=this.$el;this.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),this.params.cubeEffect.shadow&&!this.isHorizontal()&&t.find(".swiper-cube-shadow").transition(e)}},me={setTranslate:function(){for(var e=this.slides,t=this.rtlTranslate,i=0;i<e.length;i+=1){var a=e.eq(i),r=a[0].progress;this.params.flipEffect.limitRotation&&(r=Math.max(Math.min(a[0].progress,1),-1));var n=-180*r,o=0,l=-a[0].swiperSlideOffset,d=0;if(this.isHorizontal()?t&&(n=-n):(d=l,l=0,o=-n,n=0),a[0].style.zIndex=-Math.abs(Math.round(r))+e.length,this.params.flipEffect.slideShadows){var h=this.isHorizontal()?a.find(".swiper-slide-shadow-left"):a.find(".swiper-slide-shadow-top"),p=this.isHorizontal()?a.find(".swiper-slide-shadow-right"):a.find(".swiper-slide-shadow-bottom");0===h.length&&(h=s('<div class="swiper-slide-shadow-'+(this.isHorizontal()?"left":"top")+'"></div>'),a.append(h)),0===p.length&&(p=s('<div class="swiper-slide-shadow-'+(this.isHorizontal()?"right":"bottom")+'"></div>'),a.append(p)),h.length&&(h[0].style.opacity=Math.max(-r,0)),p.length&&(p[0].style.opacity=Math.max(r,0))}a.transform("translate3d("+l+"px, "+d+"px, 0px) rotateX("+o+"deg) rotateY("+n+"deg)")}},setTransition:function(e){var t=this,i=t.slides,s=t.activeIndex,a=t.$wrapperEl;if(i.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),t.params.virtualTranslate&&0!==e){var r=!1;i.eq(s).transitionEnd((function(){if(!r&&t&&!t.destroyed){r=!0,t.animating=!1;for(var e=["webkitTransitionEnd","transitionend"],i=0;i<e.length;i+=1)a.trigger(e[i])}}))}}},ge={setTranslate:function(){for(var e=this.width,t=this.height,i=this.slides,a=this.$wrapperEl,r=this.slidesSizesGrid,n=this.params.coverflowEffect,l=this.isHorizontal(),d=this.translate,h=l?e/2-d:t/2-d,p=l?n.rotate:-n.rotate,c=n.depth,u=0,v=i.length;u<v;u+=1){var f=i.eq(u),m=r[u],g=(h-f[0].swiperSlideOffset-m/2)/m*n.modifier,b=l?p*g:0,w=l?0:p*g,y=-c*Math.abs(g),x=n.stretch;"string"==typeof x&&-1!==x.indexOf("%")&&(x=parseFloat(n.stretch)/100*m);var T=l?0:x*g,E=l?x*g:0;Math.abs(E)<.001&&(E=0),Math.abs(T)<.001&&(T=0),Math.abs(y)<.001&&(y=0),Math.abs(b)<.001&&(b=0),Math.abs(w)<.001&&(w=0);var S="translate3d("+E+"px,"+T+"px,"+y+"px)  rotateX("+w+"deg) rotateY("+b+"deg)";if(f.transform(S),f[0].style.zIndex=1-Math.abs(Math.round(g)),n.slideShadows){var C=l?f.find(".swiper-slide-shadow-left"):f.find(".swiper-slide-shadow-top"),M=l?f.find(".swiper-slide-shadow-right"):f.find(".swiper-slide-shadow-bottom");0===C.length&&(C=s('<div class="swiper-slide-shadow-'+(l?"left":"top")+'"></div>'),f.append(C)),0===M.length&&(M=s('<div class="swiper-slide-shadow-'+(l?"right":"bottom")+'"></div>'),f.append(M)),C.length&&(C[0].style.opacity=g>0?g:0),M.length&&(M[0].style.opacity=-g>0?-g:0)}}(o.pointerEvents||o.prefixedPointerEvents)&&(a[0].style.perspectiveOrigin=h+"px 50%")},setTransition:function(e){this.slides.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)}},be={init:function(){var e=this.params.thumbs,t=this.constructor;e.swiper instanceof t?(this.thumbs.swiper=e.swiper,n.extend(this.thumbs.swiper.originalParams,{watchSlidesProgress:!0,slideToClickedSlide:!1}),n.extend(this.thumbs.swiper.params,{watchSlidesProgress:!0,slideToClickedSlide:!1})):n.isObject(e.swiper)&&(this.thumbs.swiper=new t(n.extend({},e.swiper,{watchSlidesVisibility:!0,watchSlidesProgress:!0,slideToClickedSlide:!1})),this.thumbs.swiperCreated=!0),this.thumbs.swiper.$el.addClass(this.params.thumbs.thumbsContainerClass),this.thumbs.swiper.on("tap",this.thumbs.onThumbClick)},onThumbClick:function(){var e=this.thumbs.swiper;if(e){var t=e.clickedIndex,i=e.clickedSlide;if(!(i&&s(i).hasClass(this.params.thumbs.slideThumbActiveClass)||null==t)){var a;if(a=e.params.loop?parseInt(s(e.clickedSlide).attr("data-swiper-slide-index"),10):t,this.params.loop){var r=this.activeIndex;this.slides.eq(r).hasClass(this.params.slideDuplicateClass)&&(this.loopFix(),this._clientLeft=this.$wrapperEl[0].clientLeft,r=this.activeIndex);var n=this.slides.eq(r).prevAll('[data-swiper-slide-index="'+a+'"]').eq(0).index(),o=this.slides.eq(r).nextAll('[data-swiper-slide-index="'+a+'"]').eq(0).index();a=void 0===n?o:void 0===o?n:o-r<r-n?o:n}this.slideTo(a)}}},update:function(e){var t=this.thumbs.swiper;if(t){var i="auto"===t.params.slidesPerView?t.slidesPerViewDynamic():t.params.slidesPerView;if(this.realIndex!==t.realIndex){var s,a=t.activeIndex;if(t.params.loop){t.slides.eq(a).hasClass(t.params.slideDuplicateClass)&&(t.loopFix(),t._clientLeft=t.$wrapperEl[0].clientLeft,a=t.activeIndex);var r=t.slides.eq(a).prevAll('[data-swiper-slide-index="'+this.realIndex+'"]').eq(0).index(),n=t.slides.eq(a).nextAll('[data-swiper-slide-index="'+this.realIndex+'"]').eq(0).index();s=void 0===r?n:void 0===n?r:n-a==a-r?a:n-a<a-r?n:r}else s=this.realIndex;t.visibleSlidesIndexes&&t.visibleSlidesIndexes.indexOf(s)<0&&(t.params.centeredSlides?s=s>a?s-Math.floor(i/2)+1:s+Math.floor(i/2)-1:s>a&&(s=s-i+1),t.slideTo(s,e?0:void 0))}var o=1,l=this.params.thumbs.slideThumbActiveClass;if(this.params.slidesPerView>1&&!this.params.centeredSlides&&(o=this.params.slidesPerView),this.params.thumbs.multipleActiveThumbs||(o=1),o=Math.floor(o),t.slides.removeClass(l),t.params.loop||t.params.virtual&&t.params.virtual.enabled)for(var d=0;d<o;d+=1)t.$wrapperEl.children('[data-swiper-slide-index="'+(this.realIndex+d)+'"]').addClass(l);else for(var h=0;h<o;h+=1)t.slides.eq(this.realIndex+h).addClass(l)}}},we=[R,q,K,U,Z,J,te,{name:"mousewheel",params:{mousewheel:{enabled:!1,releaseOnEdges:!1,invert:!1,forceToAxis:!1,sensitivity:1,eventsTarged:"container"}},create:function(){n.extend(this,{mousewheel:{enabled:!1,enable:ie.enable.bind(this),disable:ie.disable.bind(this),handle:ie.handle.bind(this),handleMouseEnter:ie.handleMouseEnter.bind(this),handleMouseLeave:ie.handleMouseLeave.bind(this),animateSlider:ie.animateSlider.bind(this),releaseScroll:ie.releaseScroll.bind(this),lastScrollTime:n.now(),lastEventBeforeSnap:void 0,recentWheelEvents:[]}})},on:{init:function(){!this.params.mousewheel.enabled&&this.params.cssMode&&this.mousewheel.disable(),this.params.mousewheel.enabled&&this.mousewheel.enable()},destroy:function(){this.params.cssMode&&this.mousewheel.enable(),this.mousewheel.enabled&&this.mousewheel.disable()}}},{name:"navigation",params:{navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper-button-lock"}},create:function(){n.extend(this,{navigation:{init:se.init.bind(this),update:se.update.bind(this),destroy:se.destroy.bind(this),onNextClick:se.onNextClick.bind(this),onPrevClick:se.onPrevClick.bind(this)}})},on:{init:function(){this.navigation.init(),this.navigation.update()},toEdge:function(){this.navigation.update()},fromEdge:function(){this.navigation.update()},destroy:function(){this.navigation.destroy()},click:function(e){var t,i=this.navigation,a=i.$nextEl,r=i.$prevEl;!this.params.navigation.hideOnClick||s(e.target).is(r)||s(e.target).is(a)||(a?t=a.hasClass(this.params.navigation.hiddenClass):r&&(t=r.hasClass(this.params.navigation.hiddenClass)),!0===t?this.emit("navigationShow",this):this.emit("navigationHide",this),a&&a.toggleClass(this.params.navigation.hiddenClass),r&&r.toggleClass(this.params.navigation.hiddenClass))}}},{name:"pagination",params:{pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,renderFraction:null,renderCustom:null,progressbarOpposite:!1,type:"bullets",dynamicBullets:!1,dynamicMainBullets:1,formatFractionCurrent:function(e){return e},formatFractionTotal:function(e){return e},bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",modifierClass:"swiper-pagination-",currentClass:"swiper-pagination-current",totalClass:"swiper-pagination-total",hiddenClass:"swiper-pagination-hidden",progressbarFillClass:"swiper-pagination-progressbar-fill",progressbarOppositeClass:"swiper-pagination-progressbar-opposite",clickableClass:"swiper-pagination-clickable",lockClass:"swiper-pagination-lock"}},create:function(){n.extend(this,{pagination:{init:ae.init.bind(this),render:ae.render.bind(this),update:ae.update.bind(this),destroy:ae.destroy.bind(this),dynamicBulletIndex:0}})},on:{init:function(){this.pagination.init(),this.pagination.render(),this.pagination.update()},activeIndexChange:function(){this.params.loop?this.pagination.update():void 0===this.snapIndex&&this.pagination.update()},snapIndexChange:function(){this.params.loop||this.pagination.update()},slidesLengthChange:function(){this.params.loop&&(this.pagination.render(),this.pagination.update())},snapGridLengthChange:function(){this.params.loop||(this.pagination.render(),this.pagination.update())},destroy:function(){this.pagination.destroy()},click:function(e){this.params.pagination.el&&this.params.pagination.hideOnClick&&this.pagination.$el.length>0&&!s(e.target).hasClass(this.params.pagination.bulletClass)&&(!0===this.pagination.$el.hasClass(this.params.pagination.hiddenClass)?this.emit("paginationShow",this):this.emit("paginationHide",this),this.pagination.$el.toggleClass(this.params.pagination.hiddenClass))}}},{name:"scrollbar",params:{scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollbar-lock",dragClass:"swiper-scrollbar-drag"}},create:function(){n.extend(this,{scrollbar:{init:re.init.bind(this),destroy:re.destroy.bind(this),updateSize:re.updateSize.bind(this),setTranslate:re.setTranslate.bind(this),setTransition:re.setTransition.bind(this),enableDraggable:re.enableDraggable.bind(this),disableDraggable:re.disableDraggable.bind(this),setDragPosition:re.setDragPosition.bind(this),getPointerPosition:re.getPointerPosition.bind(this),onDragStart:re.onDragStart.bind(this),onDragMove:re.onDragMove.bind(this),onDragEnd:re.onDragEnd.bind(this),isTouched:!1,timeout:null,dragTimeout:null}})},on:{init:function(){this.scrollbar.init(),this.scrollbar.updateSize(),this.scrollbar.setTranslate()},update:function(){this.scrollbar.updateSize()},resize:function(){this.scrollbar.updateSize()},observerUpdate:function(){this.scrollbar.updateSize()},setTranslate:function(){this.scrollbar.setTranslate()},setTransition:function(e){this.scrollbar.setTransition(e)},destroy:function(){this.scrollbar.destroy()}}},{name:"parallax",params:{parallax:{enabled:!1}},create:function(){n.extend(this,{parallax:{setTransform:ne.setTransform.bind(this),setTranslate:ne.setTranslate.bind(this),setTransition:ne.setTransition.bind(this)}})},on:{beforeInit:function(){this.params.parallax.enabled&&(this.params.watchSlidesProgress=!0,this.originalParams.watchSlidesProgress=!0)},init:function(){this.params.parallax.enabled&&this.parallax.setTranslate()},setTranslate:function(){this.params.parallax.enabled&&this.parallax.setTranslate()},setTransition:function(e){this.params.parallax.enabled&&this.parallax.setTransition(e)}}},{name:"zoom",params:{zoom:{enabled:!1,maxRatio:3,minRatio:1,toggle:!0,containerClass:"swiper-zoom-container",zoomedSlideClass:"swiper-slide-zoomed"}},create:function(){var e=this,t={enabled:!1,scale:1,currentScale:1,isScaling:!1,gesture:{$slideEl:void 0,slideWidth:void 0,slideHeight:void 0,$imageEl:void 0,$imageWrapEl:void 0,maxRatio:3},image:{isTouched:void 0,isMoved:void 0,currentX:void 0,currentY:void 0,minX:void 0,minY:void 0,maxX:void 0,maxY:void 0,width:void 0,height:void 0,startX:void 0,startY:void 0,touchesStart:{},touchesCurrent:{}},velocity:{x:void 0,y:void 0,prevPositionX:void 0,prevPositionY:void 0,prevTime:void 0}};"onGestureStart onGestureChange onGestureEnd onTouchStart onTouchMove onTouchEnd onTransitionEnd toggle enable disable in out".split(" ").forEach((function(i){t[i]=oe[i].bind(e)})),n.extend(e,{zoom:t});var i=1;Object.defineProperty(e.zoom,"scale",{get:function(){return i},set:function(t){if(i!==t){var s=e.zoom.gesture.$imageEl?e.zoom.gesture.$imageEl[0]:void 0,a=e.zoom.gesture.$slideEl?e.zoom.gesture.$slideEl[0]:void 0;e.emit("zoomChange",t,s,a)}i=t}})},on:{init:function(){this.params.zoom.enabled&&this.zoom.enable()},destroy:function(){this.zoom.disable()},touchStart:function(e){this.zoom.enabled&&this.zoom.onTouchStart(e)},touchEnd:function(e){this.zoom.enabled&&this.zoom.onTouchEnd(e)},doubleTap:function(e){this.params.zoom.enabled&&this.zoom.enabled&&this.params.zoom.toggle&&this.zoom.toggle(e)},transitionEnd:function(){this.zoom.enabled&&this.params.zoom.enabled&&this.zoom.onTransitionEnd()},slideChange:function(){this.zoom.enabled&&this.params.zoom.enabled&&this.params.cssMode&&this.zoom.onTransitionEnd()}}},{name:"lazy",params:{lazy:{enabled:!1,loadPrevNext:!1,loadPrevNextAmount:1,loadOnTransitionStart:!1,elementClass:"swiper-lazy",loadingClass:"swiper-lazy-loading",loadedClass:"swiper-lazy-loaded",preloaderClass:"swiper-lazy-preloader"}},create:function(){n.extend(this,{lazy:{initialImageLoaded:!1,load:le.load.bind(this),loadInSlide:le.loadInSlide.bind(this)}})},on:{beforeInit:function(){this.params.lazy.enabled&&this.params.preloadImages&&(this.params.preloadImages=!1)},init:function(){this.params.lazy.enabled&&!this.params.loop&&0===this.params.initialSlide&&this.lazy.load()},scroll:function(){this.params.freeMode&&!this.params.freeModeSticky&&this.lazy.load()},resize:function(){this.params.lazy.enabled&&this.lazy.load()},scrollbarDragMove:function(){this.params.lazy.enabled&&this.lazy.load()},transitionStart:function(){this.params.lazy.enabled&&(this.params.lazy.loadOnTransitionStart||!this.params.lazy.loadOnTransitionStart&&!this.lazy.initialImageLoaded)&&this.lazy.load()},transitionEnd:function(){this.params.lazy.enabled&&!this.params.lazy.loadOnTransitionStart&&this.lazy.load()},slideChange:function(){this.params.lazy.enabled&&this.params.cssMode&&this.lazy.load()}}},{name:"controller",params:{controller:{control:void 0,inverse:!1,by:"slide"}},create:function(){n.extend(this,{controller:{control:this.params.controller.control,getInterpolateFunction:de.getInterpolateFunction.bind(this),setTranslate:de.setTranslate.bind(this),setTransition:de.setTransition.bind(this)}})},on:{update:function(){this.controller.control&&this.controller.spline&&(this.controller.spline=void 0,delete this.controller.spline)},resize:function(){this.controller.control&&this.controller.spline&&(this.controller.spline=void 0,delete this.controller.spline)},observerUpdate:function(){this.controller.control&&this.controller.spline&&(this.controller.spline=void 0,delete this.controller.spline)},setTranslate:function(e,t){this.controller.control&&this.controller.setTranslate(e,t)},setTransition:function(e,t){this.controller.control&&this.controller.setTransition(e,t)}}},{name:"a11y",params:{a11y:{enabled:!0,notificationClass:"swiper-notification",prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}"}},create:function(){var e=this;n.extend(e,{a11y:{liveRegion:s('<span class="'+e.params.a11y.notificationClass+'" aria-live="assertive" aria-atomic="true"></span>')}}),Object.keys(he).forEach((function(t){e.a11y[t]=he[t].bind(e)}))},on:{init:function(){this.params.a11y.enabled&&(this.a11y.init(),this.a11y.updateNavigation())},toEdge:function(){this.params.a11y.enabled&&this.a11y.updateNavigation()},fromEdge:function(){this.params.a11y.enabled&&this.a11y.updateNavigation()},paginationUpdate:function(){this.params.a11y.enabled&&this.a11y.updatePagination()},destroy:function(){this.params.a11y.enabled&&this.a11y.destroy()}}},{name:"history",params:{history:{enabled:!1,replaceState:!1,key:"slides"}},create:function(){n.extend(this,{history:{init:pe.init.bind(this),setHistory:pe.setHistory.bind(this),setHistoryPopState:pe.setHistoryPopState.bind(this),scrollToSlide:pe.scrollToSlide.bind(this),destroy:pe.destroy.bind(this)}})},on:{init:function(){this.params.history.enabled&&this.history.init()},destroy:function(){this.params.history.enabled&&this.history.destroy()},transitionEnd:function(){this.history.initialized&&this.history.setHistory(this.params.history.key,this.activeIndex)},slideChange:function(){this.history.initialized&&this.params.cssMode&&this.history.setHistory(this.params.history.key,this.activeIndex)}}},{name:"hash-navigation",params:{hashNavigation:{enabled:!1,replaceState:!1,watchState:!1}},create:function(){n.extend(this,{hashNavigation:{initialized:!1,init:ce.init.bind(this),destroy:ce.destroy.bind(this),setHash:ce.setHash.bind(this),onHashCange:ce.onHashCange.bind(this)}})},on:{init:function(){this.params.hashNavigation.enabled&&this.hashNavigation.init()},destroy:function(){this.params.hashNavigation.enabled&&this.hashNavigation.destroy()},transitionEnd:function(){this.hashNavigation.initialized&&this.hashNavigation.setHash()},slideChange:function(){this.hashNavigation.initialized&&this.params.cssMode&&this.hashNavigation.setHash()}}},{name:"autoplay",params:{autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDirection:!1}},create:function(){var e=this;n.extend(e,{autoplay:{running:!1,paused:!1,run:ue.run.bind(e),start:ue.start.bind(e),stop:ue.stop.bind(e),pause:ue.pause.bind(e),onVisibilityChange:function(){"hidden"===document.visibilityState&&e.autoplay.running&&e.autoplay.pause(),"visible"===document.visibilityState&&e.autoplay.paused&&(e.autoplay.run(),e.autoplay.paused=!1)},onTransitionEnd:function(t){e&&!e.destroyed&&e.$wrapperEl&&t.target===this&&(e.$wrapperEl[0].removeEventListener("transitionend",e.autoplay.onTransitionEnd),e.$wrapperEl[0].removeEventListener("webkitTransitionEnd",e.autoplay.onTransitionEnd),e.autoplay.paused=!1,e.autoplay.running?e.autoplay.run():e.autoplay.stop())}}})},on:{init:function(){this.params.autoplay.enabled&&(this.autoplay.start(),document.addEventListener("visibilitychange",this.autoplay.onVisibilityChange))},beforeTransitionStart:function(e,t){this.autoplay.running&&(t||!this.params.autoplay.disableOnInteraction?this.autoplay.pause(e):this.autoplay.stop())},sliderFirstMove:function(){this.autoplay.running&&(this.params.autoplay.disableOnInteraction?this.autoplay.stop():this.autoplay.pause())},touchEnd:function(){this.params.cssMode&&this.autoplay.paused&&!this.params.autoplay.disableOnInteraction&&this.autoplay.run()},destroy:function(){this.autoplay.running&&this.autoplay.stop(),document.removeEventListener("visibilitychange",this.autoplay.onVisibilityChange)}}},{name:"effect-fade",params:{fadeEffect:{crossFade:!1}},create:function(){n.extend(this,{fadeEffect:{setTranslate:ve.setTranslate.bind(this),setTransition:ve.setTransition.bind(this)}})},on:{beforeInit:function(){if("fade"===this.params.effect){this.classNames.push(this.params.containerModifierClass+"fade");var e={slidesPerView:1,slidesPerColumn:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!0};n.extend(this.params,e),n.extend(this.originalParams,e)}},setTranslate:function(){"fade"===this.params.effect&&this.fadeEffect.setTranslate()},setTransition:function(e){"fade"===this.params.effect&&this.fadeEffect.setTransition(e)}}},{name:"effect-cube",params:{cubeEffect:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94}},create:function(){n.extend(this,{cubeEffect:{setTranslate:fe.setTranslate.bind(this),setTransition:fe.setTransition.bind(this)}})},on:{beforeInit:function(){if("cube"===this.params.effect){this.classNames.push(this.params.containerModifierClass+"cube"),this.classNames.push(this.params.containerModifierClass+"3d");var e={slidesPerView:1,slidesPerColumn:1,slidesPerGroup:1,watchSlidesProgress:!0,resistanceRatio:0,spaceBetween:0,centeredSlides:!1,virtualTranslate:!0};n.extend(this.params,e),n.extend(this.originalParams,e)}},setTranslate:function(){"cube"===this.params.effect&&this.cubeEffect.setTranslate()},setTransition:function(e){"cube"===this.params.effect&&this.cubeEffect.setTransition(e)}}},{name:"effect-flip",params:{flipEffect:{slideShadows:!0,limitRotation:!0}},create:function(){n.extend(this,{flipEffect:{setTranslate:me.setTranslate.bind(this),setTransition:me.setTransition.bind(this)}})},on:{beforeInit:function(){if("flip"===this.params.effect){this.classNames.push(this.params.containerModifierClass+"flip"),this.classNames.push(this.params.containerModifierClass+"3d");var e={slidesPerView:1,slidesPerColumn:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!0};n.extend(this.params,e),n.extend(this.originalParams,e)}},setTranslate:function(){"flip"===this.params.effect&&this.flipEffect.setTranslate()},setTransition:function(e){"flip"===this.params.effect&&this.flipEffect.setTransition(e)}}},{name:"effect-coverflow",params:{coverflowEffect:{rotate:50,stretch:0,depth:100,modifier:1,slideShadows:!0}},create:function(){n.extend(this,{coverflowEffect:{setTranslate:ge.setTranslate.bind(this),setTransition:ge.setTransition.bind(this)}})},on:{beforeInit:function(){"coverflow"===this.params.effect&&(this.classNames.push(this.params.containerModifierClass+"coverflow"),this.classNames.push(this.params.containerModifierClass+"3d"),this.params.watchSlidesProgress=!0,this.originalParams.watchSlidesProgress=!0)},setTranslate:function(){"coverflow"===this.params.effect&&this.coverflowEffect.setTranslate()},setTransition:function(e){"coverflow"===this.params.effect&&this.coverflowEffect.setTransition(e)}}},{name:"thumbs",params:{thumbs:{multipleActiveThumbs:!0,swiper:null,slideThumbActiveClass:"swiper-slide-thumb-active",thumbsContainerClass:"swiper-container-thumbs"}},create:function(){n.extend(this,{thumbs:{swiper:null,init:be.init.bind(this),update:be.update.bind(this),onThumbClick:be.onThumbClick.bind(this)}})},on:{beforeInit:function(){var e=this.params.thumbs;e&&e.swiper&&(this.thumbs.init(),this.thumbs.update(!0))},slideChange:function(){this.thumbs.swiper&&this.thumbs.update()},update:function(){this.thumbs.swiper&&this.thumbs.update()},resize:function(){this.thumbs.swiper&&this.thumbs.update()},observerUpdate:function(){this.thumbs.swiper&&this.thumbs.update()},setTransition:function(e){var t=this.thumbs.swiper;t&&t.setTransition(e)},beforeDestroy:function(){var e=this.thumbs.swiper;e&&this.thumbs.swiperCreated&&e&&e.destroy()}}}];return void 0===W.use&&(W.use=W.Class.use,W.installModule=W.Class.installModule),W.use(we),W}));
//# sourceMappingURL=swiper.min.js.map;
//! moment.js
//! version : 2.17.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.moment=b()}(this,function(){"use strict";function a(){return od.apply(null,arguments)}
// This is done to register the method called with moment()
// without creating circular dependencies.
function b(a){od=a}function c(a){return a instanceof Array||"[object Array]"===Object.prototype.toString.call(a)}function d(a){
// IE8 will treat undefined and null as object if it wasn't for
// input != null
return null!=a&&"[object Object]"===Object.prototype.toString.call(a)}function e(a){var b;for(b in a)
// even if its not own property I'd still call it non-empty
return!1;return!0}function f(a){return"number"==typeof a||"[object Number]"===Object.prototype.toString.call(a)}function g(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function h(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function i(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function j(a,b){for(var c in b)i(b,c)&&(a[c]=b[c]);return i(b,"toString")&&(a.toString=b.toString),i(b,"valueOf")&&(a.valueOf=b.valueOf),a}function k(a,b,c,d){return rb(a,b,c,d,!0).utc()}function l(){
// We need to deep clone this object.
return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],meridiem:null}}function m(a){return null==a._pf&&(a._pf=l()),a._pf}function n(a){if(null==a._isValid){var b=m(a),c=qd.call(b.parsedDateParts,function(a){return null!=a}),d=!isNaN(a._d.getTime())&&b.overflow<0&&!b.empty&&!b.invalidMonth&&!b.invalidWeekday&&!b.nullInput&&!b.invalidFormat&&!b.userInvalidated&&(!b.meridiem||b.meridiem&&c);if(a._strict&&(d=d&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour),null!=Object.isFrozen&&Object.isFrozen(a))return d;a._isValid=d}return a._isValid}function o(a){var b=k(NaN);return null!=a?j(m(b),a):m(b).userInvalidated=!0,b}function p(a){return void 0===a}function q(a,b){var c,d,e;if(p(b._isAMomentObject)||(a._isAMomentObject=b._isAMomentObject),p(b._i)||(a._i=b._i),p(b._f)||(a._f=b._f),p(b._l)||(a._l=b._l),p(b._strict)||(a._strict=b._strict),p(b._tzm)||(a._tzm=b._tzm),p(b._isUTC)||(a._isUTC=b._isUTC),p(b._offset)||(a._offset=b._offset),p(b._pf)||(a._pf=m(b)),p(b._locale)||(a._locale=b._locale),rd.length>0)for(c in rd)d=rd[c],e=b[d],p(e)||(a[d]=e);return a}
// Moment prototype object
function r(b){q(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),
// Prevent infinite loop in case updateOffset creates new moment
// objects.
sd===!1&&(sd=!0,a.updateOffset(this),sd=!1)}function s(a){return a instanceof r||null!=a&&null!=a._isAMomentObject}function t(a){return a<0?Math.ceil(a)||0:Math.floor(a)}function u(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=t(b)),c}
// compare two arrays, return the number of differences
function v(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;d<e;d++)(c&&a[d]!==b[d]||!c&&u(a[d])!==u(b[d]))&&g++;return g+f}function w(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function x(b,c){var d=!0;return j(function(){if(null!=a.deprecationHandler&&a.deprecationHandler(null,b),d){for(var e,f=[],g=0;g<arguments.length;g++){if(e="","object"==typeof arguments[g]){e+="\n["+g+"] ";for(var h in arguments[0])e+=h+": "+arguments[0][h]+", ";e=e.slice(0,-2)}else e=arguments[g];f.push(e)}w(b+"\nArguments: "+Array.prototype.slice.call(f).join("")+"\n"+(new Error).stack),d=!1}return c.apply(this,arguments)},c)}function y(b,c){null!=a.deprecationHandler&&a.deprecationHandler(b,c),td[b]||(w(c),td[b]=!0)}function z(a){return a instanceof Function||"[object Function]"===Object.prototype.toString.call(a)}function A(a){var b,c;for(c in a)b=a[c],z(b)?this[c]=b:this["_"+c]=b;this._config=a,
// Lenient ordinal parsing accepts just a number in addition to
// number + (possibly) stuff coming from _ordinalParseLenient.
this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function B(a,b){var c,e=j({},a);for(c in b)i(b,c)&&(d(a[c])&&d(b[c])?(e[c]={},j(e[c],a[c]),j(e[c],b[c])):null!=b[c]?e[c]=b[c]:delete e[c]);for(c in a)i(a,c)&&!i(b,c)&&d(a[c])&&(
// make sure changes to properties don't modify parent config
e[c]=j({},e[c]));return e}function C(a){null!=a&&this.set(a)}function D(a,b,c){var d=this._calendar[a]||this._calendar.sameElse;return z(d)?d.call(b,c):d}function E(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function F(){return this._invalidDate}function G(a){return this._ordinal.replace("%d",a)}function H(a,b,c,d){var e=this._relativeTime[c];return z(e)?e(a,b,c,d):e.replace(/%d/i,a)}function I(a,b){var c=this._relativeTime[a>0?"future":"past"];return z(c)?c(b):c.replace(/%s/i,b)}function J(a,b){var c=a.toLowerCase();Dd[c]=Dd[c+"s"]=Dd[b]=a}function K(a){return"string"==typeof a?Dd[a]||Dd[a.toLowerCase()]:void 0}function L(a){var b,c,d={};for(c in a)i(a,c)&&(b=K(c),b&&(d[b]=a[c]));return d}function M(a,b){Ed[a]=b}function N(a){var b=[];for(var c in a)b.push({unit:c,priority:Ed[c]});return b.sort(function(a,b){return a.priority-b.priority}),b}function O(b,c){return function(d){return null!=d?(Q(this,b,d),a.updateOffset(this,c),this):P(this,b)}}function P(a,b){return a.isValid()?a._d["get"+(a._isUTC?"UTC":"")+b]():NaN}function Q(a,b,c){a.isValid()&&a._d["set"+(a._isUTC?"UTC":"")+b](c)}
// MOMENTS
function R(a){return a=K(a),z(this[a])?this[a]():this}function S(a,b){if("object"==typeof a){a=L(a);for(var c=N(a),d=0;d<c.length;d++)this[c[d].unit](a[c[d].unit])}else if(a=K(a),z(this[a]))return this[a](b);return this}function T(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}
// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
function U(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(Id[a]=e),b&&(Id[b[0]]=function(){return T(e.apply(this,arguments),b[1],b[2])}),c&&(Id[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function V(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function W(a){var b,c,d=a.match(Fd);for(b=0,c=d.length;b<c;b++)Id[d[b]]?d[b]=Id[d[b]]:d[b]=V(d[b]);return function(b){var e,f="";for(e=0;e<c;e++)f+=d[e]instanceof Function?d[e].call(b,a):d[e];return f}}
// format date using native date object
function X(a,b){return a.isValid()?(b=Y(b,a.localeData()),Hd[b]=Hd[b]||W(b),Hd[b](a)):a.localeData().invalidDate()}function Y(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Gd.lastIndex=0;d>=0&&Gd.test(a);)a=a.replace(Gd,c),Gd.lastIndex=0,d-=1;return a}function Z(a,b,c){$d[a]=z(b)?b:function(a,d){return a&&c?c:b}}function $(a,b){return i($d,a)?$d[a](b._strict,b._locale):new RegExp(_(a))}
// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function _(a){return aa(a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}))}function aa(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function ba(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),f(b)&&(d=function(a,c){c[b]=u(a)}),c=0;c<a.length;c++)_d[a[c]]=d}function ca(a,b){ba(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function da(a,b,c){null!=b&&i(_d,a)&&_d[a](b,c._a,c,a)}function ea(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function fa(a,b){return a?c(this._months)?this._months[a.month()]:this._months[(this._months.isFormat||ke).test(b)?"format":"standalone"][a.month()]:this._months}function ga(a,b){return a?c(this._monthsShort)?this._monthsShort[a.month()]:this._monthsShort[ke.test(b)?"format":"standalone"][a.month()]:this._monthsShort}function ha(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._monthsParse)for(
// this is not used
this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],d=0;d<12;++d)f=k([2e3,d]),this._shortMonthsParse[d]=this.monthsShort(f,"").toLocaleLowerCase(),this._longMonthsParse[d]=this.months(f,"").toLocaleLowerCase();return c?"MMM"===b?(e=je.call(this._shortMonthsParse,g),e!==-1?e:null):(e=je.call(this._longMonthsParse,g),e!==-1?e:null):"MMM"===b?(e=je.call(this._shortMonthsParse,g),e!==-1?e:(e=je.call(this._longMonthsParse,g),e!==-1?e:null)):(e=je.call(this._longMonthsParse,g),e!==-1?e:(e=je.call(this._shortMonthsParse,g),e!==-1?e:null))}function ia(a,b,c){var d,e,f;if(this._monthsParseExact)return ha.call(this,a,b,c);
// TODO: add sorting
// Sorting makes sure if one month (or abbr) is a prefix of another
// see sorting in computeMonthsParse
for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;d<12;d++){
// test the regex
if(
// make the regex if we don't have it already
e=k([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}
// MOMENTS
function ja(a,b){var c;if(!a.isValid())
// No op
return a;if("string"==typeof b)if(/^\d+$/.test(b))b=u(b);else
// TODO: Another silent failure?
if(b=a.localeData().monthsParse(b),!f(b))return a;return c=Math.min(a.date(),ea(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a}function ka(b){return null!=b?(ja(this,b),a.updateOffset(this,!0),this):P(this,"Month")}function la(){return ea(this.year(),this.month())}function ma(a){return this._monthsParseExact?(i(this,"_monthsRegex")||oa.call(this),a?this._monthsShortStrictRegex:this._monthsShortRegex):(i(this,"_monthsShortRegex")||(this._monthsShortRegex=ne),this._monthsShortStrictRegex&&a?this._monthsShortStrictRegex:this._monthsShortRegex)}function na(a){return this._monthsParseExact?(i(this,"_monthsRegex")||oa.call(this),a?this._monthsStrictRegex:this._monthsRegex):(i(this,"_monthsRegex")||(this._monthsRegex=oe),this._monthsStrictRegex&&a?this._monthsStrictRegex:this._monthsRegex)}function oa(){function a(a,b){return b.length-a.length}var b,c,d=[],e=[],f=[];for(b=0;b<12;b++)
// make the regex if we don't have it already
c=k([2e3,b]),d.push(this.monthsShort(c,"")),e.push(this.months(c,"")),f.push(this.months(c,"")),f.push(this.monthsShort(c,""));for(
// Sorting makes sure if one month (or abbr) is a prefix of another it
// will match the longer piece.
d.sort(a),e.sort(a),f.sort(a),b=0;b<12;b++)d[b]=aa(d[b]),e[b]=aa(e[b]);for(b=0;b<24;b++)f[b]=aa(f[b]);this._monthsRegex=new RegExp("^("+f.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+e.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+d.join("|")+")","i")}
// HELPERS
function pa(a){return qa(a)?366:365}function qa(a){return a%4===0&&a%100!==0||a%400===0}function ra(){return qa(this.year())}function sa(a,b,c,d,e,f,g){
//can't just apply() to create a date:
//http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
var h=new Date(a,b,c,d,e,f,g);
//the date constructor remaps years 0-99 to 1900-1999
return a<100&&a>=0&&isFinite(h.getFullYear())&&h.setFullYear(a),h}function ta(a){var b=new Date(Date.UTC.apply(null,arguments));
//the Date.UTC function remaps years 0-99 to 1900-1999
return a<100&&a>=0&&isFinite(b.getUTCFullYear())&&b.setUTCFullYear(a),b}
// start-of-first-week - start-of-year
function ua(a,b,c){var// first-week day -- which january is always in the first week (4 for iso, 1 for other)
d=7+b-c,
// first-week day local weekday -- which local weekday is fwd
e=(7+ta(a,0,d).getUTCDay()-b)%7;return-e+d-1}
//http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
function va(a,b,c,d,e){var f,g,h=(7+c-d)%7,i=ua(a,d,e),j=1+7*(b-1)+h+i;return j<=0?(f=a-1,g=pa(f)+j):j>pa(a)?(f=a+1,g=j-pa(a)):(f=a,g=j),{year:f,dayOfYear:g}}function wa(a,b,c){var d,e,f=ua(a.year(),b,c),g=Math.floor((a.dayOfYear()-f-1)/7)+1;return g<1?(e=a.year()-1,d=g+xa(e,b,c)):g>xa(a.year(),b,c)?(d=g-xa(a.year(),b,c),e=a.year()+1):(e=a.year(),d=g),{week:d,year:e}}function xa(a,b,c){var d=ua(a,b,c),e=ua(a+1,b,c);return(pa(a)-d+e)/7}
// HELPERS
// LOCALES
function ya(a){return wa(a,this._week.dow,this._week.doy).week}function za(){return this._week.dow}function Aa(){return this._week.doy}
// MOMENTS
function Ba(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function Ca(a){var b=wa(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}
// HELPERS
function Da(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Ea(a,b){return"string"==typeof a?b.weekdaysParse(a)%7||7:isNaN(a)?null:a}function Fa(a,b){return a?c(this._weekdays)?this._weekdays[a.day()]:this._weekdays[this._weekdays.isFormat.test(b)?"format":"standalone"][a.day()]:this._weekdays}function Ga(a){return a?this._weekdaysShort[a.day()]:this._weekdaysShort}function Ha(a){return a?this._weekdaysMin[a.day()]:this._weekdaysMin}function Ia(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],d=0;d<7;++d)f=k([2e3,1]).day(d),this._minWeekdaysParse[d]=this.weekdaysMin(f,"").toLocaleLowerCase(),this._shortWeekdaysParse[d]=this.weekdaysShort(f,"").toLocaleLowerCase(),this._weekdaysParse[d]=this.weekdays(f,"").toLocaleLowerCase();return c?"dddd"===b?(e=je.call(this._weekdaysParse,g),e!==-1?e:null):"ddd"===b?(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:null):(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null):"dddd"===b?(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null))):"ddd"===b?(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._minWeekdaysParse,g),e!==-1?e:null))):(e=je.call(this._minWeekdaysParse,g),e!==-1?e:(e=je.call(this._weekdaysParse,g),e!==-1?e:(e=je.call(this._shortWeekdaysParse,g),e!==-1?e:null)))}function Ja(a,b,c){var d,e,f;if(this._weekdaysParseExact)return Ia.call(this,a,b,c);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),d=0;d<7;d++){
// test the regex
if(
// make the regex if we don't have it already
e=k([2e3,1]).day(d),c&&!this._fullWeekdaysParse[d]&&(this._fullWeekdaysParse[d]=new RegExp("^"+this.weekdays(e,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[d]=new RegExp("^"+this.weekdaysShort(e,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[d]=new RegExp("^"+this.weekdaysMin(e,"").replace(".",".?")+"$","i")),this._weekdaysParse[d]||(f="^"+this.weekdays(e,"")+"|^"+this.weekdaysShort(e,"")+"|^"+this.weekdaysMin(e,""),this._weekdaysParse[d]=new RegExp(f.replace(".",""),"i")),c&&"dddd"===b&&this._fullWeekdaysParse[d].test(a))return d;if(c&&"ddd"===b&&this._shortWeekdaysParse[d].test(a))return d;if(c&&"dd"===b&&this._minWeekdaysParse[d].test(a))return d;if(!c&&this._weekdaysParse[d].test(a))return d}}
// MOMENTS
function Ka(a){if(!this.isValid())return null!=a?this:NaN;var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Da(a,this.localeData()),this.add(a-b,"d")):b}function La(a){if(!this.isValid())return null!=a?this:NaN;var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function Ma(a){if(!this.isValid())return null!=a?this:NaN;
// behaves the same as moment#day except
// as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
// as a setter, sunday should belong to the previous week.
if(null!=a){var b=Ea(a,this.localeData());return this.day(this.day()%7?b:b-7)}return this.day()||7}function Na(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysStrictRegex:this._weekdaysRegex):(i(this,"_weekdaysRegex")||(this._weekdaysRegex=ue),this._weekdaysStrictRegex&&a?this._weekdaysStrictRegex:this._weekdaysRegex)}function Oa(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(i(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=ve),this._weekdaysShortStrictRegex&&a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function Pa(a){return this._weekdaysParseExact?(i(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(i(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=we),this._weekdaysMinStrictRegex&&a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Qa(){function a(a,b){return b.length-a.length}var b,c,d,e,f,g=[],h=[],i=[],j=[];for(b=0;b<7;b++)
// make the regex if we don't have it already
c=k([2e3,1]).day(b),d=this.weekdaysMin(c,""),e=this.weekdaysShort(c,""),f=this.weekdays(c,""),g.push(d),h.push(e),i.push(f),j.push(d),j.push(e),j.push(f);for(
// Sorting makes sure if one weekday (or abbr) is a prefix of another it
// will match the longer piece.
g.sort(a),h.sort(a),i.sort(a),j.sort(a),b=0;b<7;b++)h[b]=aa(h[b]),i[b]=aa(i[b]),j[b]=aa(j[b]);this._weekdaysRegex=new RegExp("^("+j.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+i.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+h.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+g.join("|")+")","i")}
// FORMATTING
function Ra(){return this.hours()%12||12}function Sa(){return this.hours()||24}function Ta(a,b){U(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}
// PARSING
function Ua(a,b){return b._meridiemParse}
// LOCALES
function Va(a){
// IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
// Using charAt should be more compatible.
return"p"===(a+"").toLowerCase().charAt(0)}function Wa(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function Xa(a){return a?a.toLowerCase().replace("_","-"):a}
// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
function Ya(a){for(var b,c,d,e,f=0;f<a.length;){for(e=Xa(a[f]).split("-"),b=e.length,c=Xa(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=Za(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&v(e,c,!0)>=b-1)
//the next array item is better than a shallower substring of this one
break;b--}f++}return null}function Za(a){var b=null;
// TODO: Find a better way to register and load all the locales in Node
if(!Be[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=xe._abbr,require("./locale/"+a),
// because defineLocale currently also sets the global locale, we
// want to undo that for lazy loaded locales
$a(b)}catch(a){}return Be[a]}
// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
function $a(a,b){var c;
// moment.duration._locale = moment._locale = data;
return a&&(c=p(b)?bb(a):_a(a,b),c&&(xe=c)),xe._abbr}function _a(a,b){if(null!==b){var c=Ae;if(b.abbr=a,null!=Be[a])y("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),c=Be[a]._config;else if(null!=b.parentLocale){if(null==Be[b.parentLocale])return Ce[b.parentLocale]||(Ce[b.parentLocale]=[]),Ce[b.parentLocale].push({name:a,config:b}),null;c=Be[b.parentLocale]._config}
// backwards compat for now: also set the locale
// make sure we set the locale AFTER all child locales have been
// created, so we won't end up with the child locale set.
return Be[a]=new C(B(c,b)),Ce[a]&&Ce[a].forEach(function(a){_a(a.name,a.config)}),$a(a),Be[a]}
// useful for testing
return delete Be[a],null}function ab(a,b){if(null!=b){var c,d=Ae;
// MERGE
null!=Be[a]&&(d=Be[a]._config),b=B(d,b),c=new C(b),c.parentLocale=Be[a],Be[a]=c,
// backwards compat for now: also set the locale
$a(a)}else
// pass null for config to unupdate, useful for tests
null!=Be[a]&&(null!=Be[a].parentLocale?Be[a]=Be[a].parentLocale:null!=Be[a]&&delete Be[a]);return Be[a]}
// returns locale data
function bb(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return xe;if(!c(a)){if(
//short-circuit everything else
b=Za(a))return b;a=[a]}return Ya(a)}function cb(){return wd(Be)}function db(a){var b,c=a._a;return c&&m(a).overflow===-2&&(b=c[be]<0||c[be]>11?be:c[ce]<1||c[ce]>ea(c[ae],c[be])?ce:c[de]<0||c[de]>24||24===c[de]&&(0!==c[ee]||0!==c[fe]||0!==c[ge])?de:c[ee]<0||c[ee]>59?ee:c[fe]<0||c[fe]>59?fe:c[ge]<0||c[ge]>999?ge:-1,m(a)._overflowDayOfYear&&(b<ae||b>ce)&&(b=ce),m(a)._overflowWeeks&&b===-1&&(b=he),m(a)._overflowWeekday&&b===-1&&(b=ie),m(a).overflow=b),a}
// date from iso format
function eb(a){var b,c,d,e,f,g,h=a._i,i=De.exec(h)||Ee.exec(h);if(i){for(m(a).iso=!0,b=0,c=Ge.length;b<c;b++)if(Ge[b][1].exec(i[1])){e=Ge[b][0],d=Ge[b][2]!==!1;break}if(null==e)return void(a._isValid=!1);if(i[3]){for(b=0,c=He.length;b<c;b++)if(He[b][1].exec(i[3])){
// match[2] should be 'T' or space
f=(i[2]||" ")+He[b][0];break}if(null==f)return void(a._isValid=!1)}if(!d&&null!=f)return void(a._isValid=!1);if(i[4]){if(!Fe.exec(i[4]))return void(a._isValid=!1);g="Z"}a._f=e+(f||"")+(g||""),kb(a)}else a._isValid=!1}
// date from iso format or fallback
function fb(b){var c=Ie.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(eb(b),void(b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b))))}
// Pick the first defined of two or three arguments.
function gb(a,b,c){return null!=a?a:null!=b?b:c}function hb(b){
// hooks is actually the exported moment object
var c=new Date(a.now());return b._useUTC?[c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate()]:[c.getFullYear(),c.getMonth(),c.getDate()]}
// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
function ib(a){var b,c,d,e,f=[];if(!a._d){
// Default to current date.
// * if no year, month, day of month are given, default to today
// * if day of month is given, default month and year
// * if month is given, default only year
// * if year is given, don't default anything
for(d=hb(a),
//compute day of the year from weeks and weekdays
a._w&&null==a._a[ce]&&null==a._a[be]&&jb(a),
//if the day of the year is set, figure out what it is
a._dayOfYear&&(e=gb(a._a[ae],d[ae]),a._dayOfYear>pa(e)&&(m(a)._overflowDayOfYear=!0),c=ta(e,0,a._dayOfYear),a._a[be]=c.getUTCMonth(),a._a[ce]=c.getUTCDate()),b=0;b<3&&null==a._a[b];++b)a._a[b]=f[b]=d[b];
// Zero out whatever was not defaulted, including time
for(;b<7;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];
// Check for 24:00:00.000
24===a._a[de]&&0===a._a[ee]&&0===a._a[fe]&&0===a._a[ge]&&(a._nextDay=!0,a._a[de]=0),a._d=(a._useUTC?ta:sa).apply(null,f),
// Apply timezone offset from input. The actual utcOffset can be changed
// with parseZone.
null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[de]=24)}}function jb(a){var b,c,d,e,f,g,h,i;if(b=a._w,null!=b.GG||null!=b.W||null!=b.E)f=1,g=4,
// TODO: We need to take the current isoWeekYear, but that depends on
// how we interpret now (local, utc, fixed offset). So create
// a now version of current config (take local/utc/offset flags, and
// create now).
c=gb(b.GG,a._a[ae],wa(sb(),1,4).year),d=gb(b.W,1),e=gb(b.E,1),(e<1||e>7)&&(i=!0);else{f=a._locale._week.dow,g=a._locale._week.doy;var j=wa(sb(),f,g);c=gb(b.gg,a._a[ae],j.year),
// Default to current week.
d=gb(b.w,j.week),null!=b.d?(
// weekday -- low day numbers are considered next week
e=b.d,(e<0||e>6)&&(i=!0)):null!=b.e?(
// local weekday -- counting starts from begining of week
e=b.e+f,(b.e<0||b.e>6)&&(i=!0)):
// default to begining of week
e=f}d<1||d>xa(c,f,g)?m(a)._overflowWeeks=!0:null!=i?m(a)._overflowWeekday=!0:(h=va(c,d,e,f,g),a._a[ae]=h.year,a._dayOfYear=h.dayOfYear)}
// date from string and format string
function kb(b){
// TODO: Move this to another part of the creation flow to prevent circular deps
if(b._f===a.ISO_8601)return void eb(b);b._a=[],m(b).empty=!0;
// This array is used to make a Date, either with `new Date` or `Date.UTC`
var c,d,e,f,g,h=""+b._i,i=h.length,j=0;for(e=Y(b._f,b._locale).match(Fd)||[],c=0;c<e.length;c++)f=e[c],d=(h.match($(f,b))||[])[0],
// console.log('token', token, 'parsedInput', parsedInput,
//         'regex', getParseRegexForToken(token, config));
d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&m(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),j+=d.length),
// don't parse if it's not a known token
Id[f]?(d?m(b).empty=!1:m(b).unusedTokens.push(f),da(f,d,b)):b._strict&&!d&&m(b).unusedTokens.push(f);
// add remaining unparsed input length to the string
m(b).charsLeftOver=i-j,h.length>0&&m(b).unusedInput.push(h),
// clear _12h flag if hour is <= 12
b._a[de]<=12&&m(b).bigHour===!0&&b._a[de]>0&&(m(b).bigHour=void 0),m(b).parsedDateParts=b._a.slice(0),m(b).meridiem=b._meridiem,
// handle meridiem
b._a[de]=lb(b._locale,b._a[de],b._meridiem),ib(b),db(b)}function lb(a,b,c){var d;
// Fallback
return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&b<12&&(b+=12),d||12!==b||(b=0),b):b}
// date from string and array of format strings
function mb(a){var b,c,d,e,f;if(0===a._f.length)return m(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=q({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],kb(b),n(b)&&(
// if there is any input that was not parsed add a penalty for that format
f+=m(b).charsLeftOver,
//or tokens
f+=10*m(b).unusedTokens.length,m(b).score=f,(null==d||f<d)&&(d=f,c=b));j(a,c||b)}function nb(a){if(!a._d){var b=L(a._i);a._a=h([b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],function(a){return a&&parseInt(a,10)}),ib(a)}}function ob(a){var b=new r(db(pb(a)));
// Adding is smart enough around DST
return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function pb(a){var b=a._i,d=a._f;return a._locale=a._locale||bb(a._l),null===b||void 0===d&&""===b?o({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),s(b)?new r(db(b)):(g(b)?a._d=b:c(d)?mb(a):d?kb(a):qb(a),n(a)||(a._d=null),a))}function qb(b){var d=b._i;void 0===d?b._d=new Date(a.now()):g(d)?b._d=new Date(d.valueOf()):"string"==typeof d?fb(b):c(d)?(b._a=h(d.slice(0),function(a){return parseInt(a,10)}),ib(b)):"object"==typeof d?nb(b):f(d)?
// from milliseconds
b._d=new Date(d):a.createFromInputFallback(b)}function rb(a,b,f,g,h){var i={};
// object construction must be done this way.
// https://github.com/moment/moment/issues/1423
return f!==!0&&f!==!1||(g=f,f=void 0),(d(a)&&e(a)||c(a)&&0===a.length)&&(a=void 0),i._isAMomentObject=!0,i._useUTC=i._isUTC=h,i._l=f,i._i=a,i._f=b,i._strict=g,ob(i)}function sb(a,b,c,d){return rb(a,b,c,d,!1)}
// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
function tb(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return sb();for(d=b[0],e=1;e<b.length;++e)b[e].isValid()&&!b[e][a](d)||(d=b[e]);return d}
// TODO: Use [].sort instead?
function ub(){var a=[].slice.call(arguments,0);return tb("isBefore",a)}function vb(){var a=[].slice.call(arguments,0);return tb("isAfter",a)}function wb(a){var b=L(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;
// representation for dateAddRemove
this._milliseconds=+k+1e3*j+// 1000
6e4*i+// 1000 * 60
1e3*h*60*60,//using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
// Because of dateAddRemove treats 24 hours as different from a
// day when working around DST, we need to store them separately
this._days=+g+7*f,
// It is impossible translate months into days without knowing
// which months you are are talking about, so we have to store
// it separately.
this._months=+e+3*d+12*c,this._data={},this._locale=bb(),this._bubble()}function xb(a){return a instanceof wb}function yb(a){return a<0?Math.round(-1*a)*-1:Math.round(a)}
// FORMATTING
function zb(a,b){U(a,0,0,function(){var a=this.utcOffset(),c="+";return a<0&&(a=-a,c="-"),c+T(~~(a/60),2)+b+T(~~a%60,2)})}function Ab(a,b){var c=(b||"").match(a);if(null===c)return null;var d=c[c.length-1]||[],e=(d+"").match(Me)||["-",0,0],f=+(60*e[1])+u(e[2]);return 0===f?0:"+"===e[0]?f:-f}
// Return a moment from input, that is local/utc/zone equivalent to model.
function Bb(b,c){var d,e;
// Use low-level api, because this fn is low-level api.
return c._isUTC?(d=c.clone(),e=(s(b)||g(b)?b.valueOf():sb(b).valueOf())-d.valueOf(),d._d.setTime(d._d.valueOf()+e),a.updateOffset(d,!1),d):sb(b).local()}function Cb(a){
// On Firefox.24 Date#getTimezoneOffset returns a floating point.
// https://github.com/moment/moment/pull/1871
return 15*-Math.round(a._d.getTimezoneOffset()/15)}
// MOMENTS
// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
function Db(b,c){var d,e=this._offset||0;if(!this.isValid())return null!=b?this:NaN;if(null!=b){if("string"==typeof b){if(b=Ab(Xd,b),null===b)return this}else Math.abs(b)<16&&(b=60*b);return!this._isUTC&&c&&(d=Cb(this)),this._offset=b,this._isUTC=!0,null!=d&&this.add(d,"m"),e!==b&&(!c||this._changeInProgress?Tb(this,Ob(b-e,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?e:Cb(this)}function Eb(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Fb(a){return this.utcOffset(0,a)}function Gb(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Cb(this),"m")),this}function Hb(){if(null!=this._tzm)this.utcOffset(this._tzm);else if("string"==typeof this._i){var a=Ab(Wd,this._i);null!=a?this.utcOffset(a):this.utcOffset(0,!0)}return this}function Ib(a){return!!this.isValid()&&(a=a?sb(a).utcOffset():0,(this.utcOffset()-a)%60===0)}function Jb(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Kb(){if(!p(this._isDSTShifted))return this._isDSTShifted;var a={};if(q(a,this),a=pb(a),a._a){var b=a._isUTC?k(a._a):sb(a._a);this._isDSTShifted=this.isValid()&&v(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Lb(){return!!this.isValid()&&!this._isUTC}function Mb(){return!!this.isValid()&&this._isUTC}function Nb(){return!!this.isValid()&&(this._isUTC&&0===this._offset)}function Ob(a,b){var c,d,e,g=a,
// matching against regexp is expensive, do it on demand
h=null;// checks for null or undefined
return xb(a)?g={ms:a._milliseconds,d:a._days,M:a._months}:f(a)?(g={},b?g[b]=a:g.milliseconds=a):(h=Ne.exec(a))?(c="-"===h[1]?-1:1,g={y:0,d:u(h[ce])*c,h:u(h[de])*c,m:u(h[ee])*c,s:u(h[fe])*c,ms:u(yb(1e3*h[ge]))*c}):(h=Oe.exec(a))?(c="-"===h[1]?-1:1,g={y:Pb(h[2],c),M:Pb(h[3],c),w:Pb(h[4],c),d:Pb(h[5],c),h:Pb(h[6],c),m:Pb(h[7],c),s:Pb(h[8],c)}):null==g?g={}:"object"==typeof g&&("from"in g||"to"in g)&&(e=Rb(sb(g.from),sb(g.to)),g={},g.ms=e.milliseconds,g.M=e.months),d=new wb(g),xb(a)&&i(a,"_locale")&&(d._locale=a._locale),d}function Pb(a,b){
// We'd normally use ~~inp for this, but unfortunately it also
// converts floats to ints.
// inp may be undefined, so careful calling replace on it.
var c=a&&parseFloat(a.replace(",","."));
// apply sign while we're at it
return(isNaN(c)?0:c)*b}function Qb(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function Rb(a,b){var c;return a.isValid()&&b.isValid()?(b=Bb(b,a),a.isBefore(b)?c=Qb(a,b):(c=Qb(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c):{milliseconds:0,months:0}}
// TODO: remove 'name' arg after deprecation is removed
function Sb(a,b){return function(c,d){var e,f;
//invert the arguments, but complain about it
return null===d||isNaN(+d)||(y(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Ob(c,d),Tb(this,e,a),this}}function Tb(b,c,d,e){var f=c._milliseconds,g=yb(c._days),h=yb(c._months);b.isValid()&&(e=null==e||e,f&&b._d.setTime(b._d.valueOf()+f*d),g&&Q(b,"Date",P(b,"Date")+g*d),h&&ja(b,P(b,"Month")+h*d),e&&a.updateOffset(b,g||h))}function Ub(a,b){var c=a.diff(b,"days",!0);return c<-6?"sameElse":c<-1?"lastWeek":c<0?"lastDay":c<1?"sameDay":c<2?"nextDay":c<7?"nextWeek":"sameElse"}function Vb(b,c){
// We want to compare the start of today, vs this.
// Getting start-of-today depends on whether we're local/utc/offset or not.
var d=b||sb(),e=Bb(d,this).startOf("day"),f=a.calendarFormat(this,e)||"sameElse",g=c&&(z(c[f])?c[f].call(this,d):c[f]);return this.format(g||this.localeData().calendar(f,this,sb(d)))}function Wb(){return new r(this)}function Xb(a,b){var c=s(a)?a:sb(a);return!(!this.isValid()||!c.isValid())&&(b=K(p(b)?"millisecond":b),"millisecond"===b?this.valueOf()>c.valueOf():c.valueOf()<this.clone().startOf(b).valueOf())}function Yb(a,b){var c=s(a)?a:sb(a);return!(!this.isValid()||!c.isValid())&&(b=K(p(b)?"millisecond":b),"millisecond"===b?this.valueOf()<c.valueOf():this.clone().endOf(b).valueOf()<c.valueOf())}function Zb(a,b,c,d){return d=d||"()",("("===d[0]?this.isAfter(a,c):!this.isBefore(a,c))&&(")"===d[1]?this.isBefore(b,c):!this.isAfter(b,c))}function $b(a,b){var c,d=s(a)?a:sb(a);return!(!this.isValid()||!d.isValid())&&(b=K(b||"millisecond"),"millisecond"===b?this.valueOf()===d.valueOf():(c=d.valueOf(),this.clone().startOf(b).valueOf()<=c&&c<=this.clone().endOf(b).valueOf()))}function _b(a,b){return this.isSame(a,b)||this.isAfter(a,b)}function ac(a,b){return this.isSame(a,b)||this.isBefore(a,b)}function bc(a,b,c){var d,e,f,g;// 1000
// 1000 * 60
// 1000 * 60 * 60
// 1000 * 60 * 60 * 24, negate dst
// 1000 * 60 * 60 * 24 * 7, negate dst
return this.isValid()?(d=Bb(a,this),d.isValid()?(e=6e4*(d.utcOffset()-this.utcOffset()),b=K(b),"year"===b||"month"===b||"quarter"===b?(g=cc(this,d),"quarter"===b?g/=3:"year"===b&&(g/=12)):(f=this-d,g="second"===b?f/1e3:"minute"===b?f/6e4:"hour"===b?f/36e5:"day"===b?(f-e)/864e5:"week"===b?(f-e)/6048e5:f),c?g:t(g)):NaN):NaN}function cc(a,b){
// difference in months
var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),
// b is in (anchor - 1 month, anchor + 1 month)
f=a.clone().add(e,"months");
//check for negative zero, return zero if negative zero
// linear across the month
// linear across the month
return b-f<0?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)||0}function dc(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function ec(){var a=this.clone().utc();return 0<a.year()&&a.year()<=9999?z(Date.prototype.toISOString)?this.toDate().toISOString():X(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):X(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}/**
 * Return a human readable representation of a moment that can
 * also be evaluated to get a new moment which is the same
 *
 * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
 */
function fc(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var a="moment",b="";this.isLocal()||(a=0===this.utcOffset()?"moment.utc":"moment.parseZone",b="Z");var c="["+a+'("]',d=0<this.year()&&this.year()<=9999?"YYYY":"YYYYYY",e="-MM-DD[T]HH:mm:ss.SSS",f=b+'[")]';return this.format(c+d+e+f)}function gc(b){b||(b=this.isUtc()?a.defaultFormatUtc:a.defaultFormat);var c=X(this,b);return this.localeData().postformat(c)}function hc(a,b){return this.isValid()&&(s(a)&&a.isValid()||sb(a).isValid())?Ob({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function ic(a){return this.from(sb(),a)}function jc(a,b){return this.isValid()&&(s(a)&&a.isValid()||sb(a).isValid())?Ob({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function kc(a){return this.to(sb(),a)}
// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
function lc(a){var b;return void 0===a?this._locale._abbr:(b=bb(a),null!=b&&(this._locale=b),this)}function mc(){return this._locale}function nc(a){
// the following switch intentionally omits break keywords
// to utilize falling through the cases.
switch(a=K(a)){case"year":this.month(0);/* falls through */
case"quarter":case"month":this.date(1);/* falls through */
case"week":case"isoWeek":case"day":case"date":this.hours(0);/* falls through */
case"hour":this.minutes(0);/* falls through */
case"minute":this.seconds(0);/* falls through */
case"second":this.milliseconds(0)}
// weeks are a special case
// quarters are also special
return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function oc(a){
// 'date' is an alias for 'day', so it should be considered as such.
return a=K(a),void 0===a||"millisecond"===a?this:("date"===a&&(a="day"),this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms"))}function pc(){return this._d.valueOf()-6e4*(this._offset||0)}function qc(){return Math.floor(this.valueOf()/1e3)}function rc(){return new Date(this.valueOf())}function sc(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function tc(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function uc(){
// new Date(NaN).toJSON() === null
return this.isValid()?this.toISOString():null}function vc(){return n(this)}function wc(){return j({},m(this))}function xc(){return m(this).overflow}function yc(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function zc(a,b){U(0,[a,a.length],0,b)}
// MOMENTS
function Ac(a){return Ec.call(this,a,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)}function Bc(a){return Ec.call(this,a,this.isoWeek(),this.isoWeekday(),1,4)}function Cc(){return xa(this.year(),1,4)}function Dc(){var a=this.localeData()._week;return xa(this.year(),a.dow,a.doy)}function Ec(a,b,c,d,e){var f;return null==a?wa(this,d,e).year:(f=xa(a,d,e),b>f&&(b=f),Fc.call(this,a,b,c,d,e))}function Fc(a,b,c,d,e){var f=va(a,b,c,d,e),g=ta(f.year,0,f.dayOfYear);return this.year(g.getUTCFullYear()),this.month(g.getUTCMonth()),this.date(g.getUTCDate()),this}
// MOMENTS
function Gc(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}
// HELPERS
// MOMENTS
function Hc(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function Ic(a,b){b[ge]=u(1e3*("0."+a))}
// MOMENTS
function Jc(){return this._isUTC?"UTC":""}function Kc(){return this._isUTC?"Coordinated Universal Time":""}function Lc(a){return sb(1e3*a)}function Mc(){return sb.apply(null,arguments).parseZone()}function Nc(a){return a}function Oc(a,b,c,d){var e=bb(),f=k().set(d,b);return e[c](f,a)}function Pc(a,b,c){if(f(a)&&(b=a,a=void 0),a=a||"",null!=b)return Oc(a,b,c,"month");var d,e=[];for(d=0;d<12;d++)e[d]=Oc(a,d,c,"month");return e}
// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
function Qc(a,b,c,d){"boolean"==typeof a?(f(b)&&(c=b,b=void 0),b=b||""):(b=a,c=b,a=!1,f(b)&&(c=b,b=void 0),b=b||"");var e=bb(),g=a?e._week.dow:0;if(null!=c)return Oc(b,(c+g)%7,d,"day");var h,i=[];for(h=0;h<7;h++)i[h]=Oc(b,(h+g)%7,d,"day");return i}function Rc(a,b){return Pc(a,b,"months")}function Sc(a,b){return Pc(a,b,"monthsShort")}function Tc(a,b,c){return Qc(a,b,c,"weekdays")}function Uc(a,b,c){return Qc(a,b,c,"weekdaysShort")}function Vc(a,b,c){return Qc(a,b,c,"weekdaysMin")}function Wc(){var a=this._data;return this._milliseconds=Ze(this._milliseconds),this._days=Ze(this._days),this._months=Ze(this._months),a.milliseconds=Ze(a.milliseconds),a.seconds=Ze(a.seconds),a.minutes=Ze(a.minutes),a.hours=Ze(a.hours),a.months=Ze(a.months),a.years=Ze(a.years),this}function Xc(a,b,c,d){var e=Ob(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}
// supports only 2.0-style add(1, 's') or add(duration)
function Yc(a,b){return Xc(this,a,b,1)}
// supports only 2.0-style subtract(1, 's') or subtract(duration)
function Zc(a,b){return Xc(this,a,b,-1)}function $c(a){return a<0?Math.floor(a):Math.ceil(a)}function _c(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;
// if we have a mix of positive and negative values, bubble down first
// check: https://github.com/moment/moment/issues/2166
// The following code bubbles up values, see the tests for
// examples of what that means.
// convert days to months
// 12 months -> 1 year
return f>=0&&g>=0&&h>=0||f<=0&&g<=0&&h<=0||(f+=864e5*$c(bd(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=t(f/1e3),i.seconds=a%60,b=t(a/60),i.minutes=b%60,c=t(b/60),i.hours=c%24,g+=t(c/24),e=t(ad(g)),h+=e,g-=$c(bd(e)),d=t(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function ad(a){
// 400 years have 146097 days (taking into account leap year rules)
// 400 years have 12 months === 4800
return 4800*a/146097}function bd(a){
// the reverse of daysToMonths
return 146097*a/4800}function cd(a){var b,c,d=this._milliseconds;if(a=K(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+ad(b),"month"===a?c:c/12;switch(
// handle milliseconds separately because of floating point math errors (issue #1867)
b=this._days+Math.round(bd(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;
// Math.floor prevents floating point math errors here
case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}
// TODO: Use this.as('ms')?
function dd(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*u(this._months/12)}function ed(a){return function(){return this.as(a)}}function fd(a){return a=K(a),this[a+"s"]()}function gd(a){return function(){return this._data[a]}}function hd(){return t(this.days()/7)}
// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
function id(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function jd(a,b,c){var d=Ob(a).abs(),e=of(d.as("s")),f=of(d.as("m")),g=of(d.as("h")),h=of(d.as("d")),i=of(d.as("M")),j=of(d.as("y")),k=e<pf.s&&["s",e]||f<=1&&["m"]||f<pf.m&&["mm",f]||g<=1&&["h"]||g<pf.h&&["hh",g]||h<=1&&["d"]||h<pf.d&&["dd",h]||i<=1&&["M"]||i<pf.M&&["MM",i]||j<=1&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,id.apply(null,k)}
// This function allows you to set the rounding function for relative time strings
function kd(a){return void 0===a?of:"function"==typeof a&&(of=a,!0)}
// This function allows you to set a threshold for relative time strings
function ld(a,b){return void 0!==pf[a]&&(void 0===b?pf[a]:(pf[a]=b,!0))}function md(a){var b=this.localeData(),c=jd(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function nd(){
// for ISO strings we do not use the normal bubbling rules:
//  * milliseconds bubble up until they become hours
//  * days do not bubble at all
//  * months bubble up until they become years
// This is because there is no context-free conversion between hours and days
// (think of clock changes)
// and also not between days and months (28-31 days per month)
var a,b,c,d=qf(this._milliseconds)/1e3,e=qf(this._days),f=qf(this._months);
// 3600 seconds -> 60 minutes -> 1 hour
a=t(d/60),b=t(a/60),d%=60,a%=60,
// 12 months -> 1 year
c=t(f/12),f%=12;
// inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(m<0?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}var od,pd;pd=Array.prototype.some?Array.prototype.some:function(a){for(var b=Object(this),c=b.length>>>0,d=0;d<c;d++)if(d in b&&a.call(this,b[d],d,b))return!0;return!1};var qd=pd,rd=a.momentProperties=[],sd=!1,td={};a.suppressDeprecationWarnings=!1,a.deprecationHandler=null;var ud;ud=Object.keys?Object.keys:function(a){var b,c=[];for(b in a)i(a,b)&&c.push(b);return c};var vd,wd=ud,xd={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},yd={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},zd="Invalid date",Ad="%d",Bd=/\d{1,2}/,Cd={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Dd={},Ed={},Fd=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Gd=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Hd={},Id={},Jd=/\d/,Kd=/\d\d/,Ld=/\d{3}/,Md=/\d{4}/,Nd=/[+-]?\d{6}/,Od=/\d\d?/,Pd=/\d\d\d\d?/,Qd=/\d\d\d\d\d\d?/,Rd=/\d{1,3}/,Sd=/\d{1,4}/,Td=/[+-]?\d{1,6}/,Ud=/\d+/,Vd=/[+-]?\d+/,Wd=/Z|[+-]\d\d:?\d\d/gi,Xd=/Z|[+-]\d\d(?::?\d\d)?/gi,Yd=/[+-]?\d+(\.\d{1,3})?/,Zd=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,$d={},_d={},ae=0,be=1,ce=2,de=3,ee=4,fe=5,ge=6,he=7,ie=8;vd=Array.prototype.indexOf?Array.prototype.indexOf:function(a){
// I know
var b;for(b=0;b<this.length;++b)if(this[b]===a)return b;return-1};var je=vd;
// FORMATTING
U("M",["MM",2],"Mo",function(){return this.month()+1}),U("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),U("MMMM",0,0,function(a){return this.localeData().months(this,a)}),
// ALIASES
J("month","M"),
// PRIORITY
M("month",8),
// PARSING
Z("M",Od),Z("MM",Od,Kd),Z("MMM",function(a,b){return b.monthsShortRegex(a)}),Z("MMMM",function(a,b){return b.monthsRegex(a)}),ba(["M","MM"],function(a,b){b[be]=u(a)-1}),ba(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);
// if we didn't find a month name, mark the date as invalid.
null!=e?b[be]=e:m(c).invalidMonth=a});
// LOCALES
var ke=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,le="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),me="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),ne=Zd,oe=Zd;
// FORMATTING
U("Y",0,0,function(){var a=this.year();return a<=9999?""+a:"+"+a}),U(0,["YY",2],0,function(){return this.year()%100}),U(0,["YYYY",4],0,"year"),U(0,["YYYYY",5],0,"year"),U(0,["YYYYYY",6,!0],0,"year"),
// ALIASES
J("year","y"),
// PRIORITIES
M("year",1),
// PARSING
Z("Y",Vd),Z("YY",Od,Kd),Z("YYYY",Sd,Md),Z("YYYYY",Td,Nd),Z("YYYYYY",Td,Nd),ba(["YYYYY","YYYYYY"],ae),ba("YYYY",function(b,c){c[ae]=2===b.length?a.parseTwoDigitYear(b):u(b)}),ba("YY",function(b,c){c[ae]=a.parseTwoDigitYear(b)}),ba("Y",function(a,b){b[ae]=parseInt(a,10)}),
// HOOKS
a.parseTwoDigitYear=function(a){return u(a)+(u(a)>68?1900:2e3)};
// MOMENTS
var pe=O("FullYear",!0);
// FORMATTING
U("w",["ww",2],"wo","week"),U("W",["WW",2],"Wo","isoWeek"),
// ALIASES
J("week","w"),J("isoWeek","W"),
// PRIORITIES
M("week",5),M("isoWeek",5),
// PARSING
Z("w",Od),Z("ww",Od,Kd),Z("W",Od),Z("WW",Od,Kd),ca(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=u(a)});var qe={dow:0,// Sunday is the first day of the week.
doy:6};
// FORMATTING
U("d",0,"do","day"),U("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),U("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),U("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),U("e",0,0,"weekday"),U("E",0,0,"isoWeekday"),
// ALIASES
J("day","d"),J("weekday","e"),J("isoWeekday","E"),
// PRIORITY
M("day",11),M("weekday",11),M("isoWeekday",11),
// PARSING
Z("d",Od),Z("e",Od),Z("E",Od),Z("dd",function(a,b){return b.weekdaysMinRegex(a)}),Z("ddd",function(a,b){return b.weekdaysShortRegex(a)}),Z("dddd",function(a,b){return b.weekdaysRegex(a)}),ca(["dd","ddd","dddd"],function(a,b,c,d){var e=c._locale.weekdaysParse(a,d,c._strict);
// if we didn't get a weekday name, mark the date as invalid
null!=e?b.d=e:m(c).invalidWeekday=a}),ca(["d","e","E"],function(a,b,c,d){b[d]=u(a)});
// LOCALES
var re="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),se="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),te="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),ue=Zd,ve=Zd,we=Zd;U("H",["HH",2],0,"hour"),U("h",["hh",2],0,Ra),U("k",["kk",2],0,Sa),U("hmm",0,0,function(){return""+Ra.apply(this)+T(this.minutes(),2)}),U("hmmss",0,0,function(){return""+Ra.apply(this)+T(this.minutes(),2)+T(this.seconds(),2)}),U("Hmm",0,0,function(){return""+this.hours()+T(this.minutes(),2)}),U("Hmmss",0,0,function(){return""+this.hours()+T(this.minutes(),2)+T(this.seconds(),2)}),Ta("a",!0),Ta("A",!1),
// ALIASES
J("hour","h"),
// PRIORITY
M("hour",13),Z("a",Ua),Z("A",Ua),Z("H",Od),Z("h",Od),Z("HH",Od,Kd),Z("hh",Od,Kd),Z("hmm",Pd),Z("hmmss",Qd),Z("Hmm",Pd),Z("Hmmss",Qd),ba(["H","HH"],de),ba(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),ba(["h","hh"],function(a,b,c){b[de]=u(a),m(c).bigHour=!0}),ba("hmm",function(a,b,c){var d=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d)),m(c).bigHour=!0}),ba("hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d,2)),b[fe]=u(a.substr(e)),m(c).bigHour=!0}),ba("Hmm",function(a,b,c){var d=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d))}),ba("Hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[de]=u(a.substr(0,d)),b[ee]=u(a.substr(d,2)),b[fe]=u(a.substr(e))});var xe,ye=/[ap]\.?m?\.?/i,ze=O("Hours",!0),Ae={calendar:xd,longDateFormat:yd,invalidDate:zd,ordinal:Ad,ordinalParse:Bd,relativeTime:Cd,months:le,monthsShort:me,week:qe,weekdays:re,weekdaysMin:te,weekdaysShort:se,meridiemParse:ye},Be={},Ce={},De=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Ee=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Fe=/Z|[+-]\d\d(?::?\d\d)?/,Ge=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],
// YYYYMM is NOT allowed by the standard
["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],He=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Ie=/^\/?Date\((\-?\d+)/i;a.createFromInputFallback=x("value provided is not in a recognized ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),
// constant that refers to the ISO standard
a.ISO_8601=function(){};var Je=x("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=sb.apply(null,arguments);return this.isValid()&&a.isValid()?a<this?this:a:o()}),Ke=x("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=sb.apply(null,arguments);return this.isValid()&&a.isValid()?a>this?this:a:o()}),Le=function(){return Date.now?Date.now():+new Date};zb("Z",":"),zb("ZZ",""),
// PARSING
Z("Z",Xd),Z("ZZ",Xd),ba(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=Ab(Xd,a)});
// HELPERS
// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
var Me=/([\+\-]|\d\d)/gi;
// HOOKS
// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
a.updateOffset=function(){};
// ASP.NET json date format regex
var Ne=/^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,Oe=/^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;Ob.fn=wb.prototype;var Pe=Sb(1,"add"),Qe=Sb(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",a.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var Re=x("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});
// FORMATTING
U(0,["gg",2],0,function(){return this.weekYear()%100}),U(0,["GG",2],0,function(){return this.isoWeekYear()%100}),zc("gggg","weekYear"),zc("ggggg","weekYear"),zc("GGGG","isoWeekYear"),zc("GGGGG","isoWeekYear"),
// ALIASES
J("weekYear","gg"),J("isoWeekYear","GG"),
// PRIORITY
M("weekYear",1),M("isoWeekYear",1),
// PARSING
Z("G",Vd),Z("g",Vd),Z("GG",Od,Kd),Z("gg",Od,Kd),Z("GGGG",Sd,Md),Z("gggg",Sd,Md),Z("GGGGG",Td,Nd),Z("ggggg",Td,Nd),ca(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=u(a)}),ca(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),
// FORMATTING
U("Q",0,"Qo","quarter"),
// ALIASES
J("quarter","Q"),
// PRIORITY
M("quarter",7),
// PARSING
Z("Q",Jd),ba("Q",function(a,b){b[be]=3*(u(a)-1)}),
// FORMATTING
U("D",["DD",2],"Do","date"),
// ALIASES
J("date","D"),
// PRIOROITY
M("date",9),
// PARSING
Z("D",Od),Z("DD",Od,Kd),Z("Do",function(a,b){return a?b._ordinalParse:b._ordinalParseLenient}),ba(["D","DD"],ce),ba("Do",function(a,b){b[ce]=u(a.match(Od)[0],10)});
// MOMENTS
var Se=O("Date",!0);
// FORMATTING
U("DDD",["DDDD",3],"DDDo","dayOfYear"),
// ALIASES
J("dayOfYear","DDD"),
// PRIORITY
M("dayOfYear",4),
// PARSING
Z("DDD",Rd),Z("DDDD",Ld),ba(["DDD","DDDD"],function(a,b,c){c._dayOfYear=u(a)}),
// FORMATTING
U("m",["mm",2],0,"minute"),
// ALIASES
J("minute","m"),
// PRIORITY
M("minute",14),
// PARSING
Z("m",Od),Z("mm",Od,Kd),ba(["m","mm"],ee);
// MOMENTS
var Te=O("Minutes",!1);
// FORMATTING
U("s",["ss",2],0,"second"),
// ALIASES
J("second","s"),
// PRIORITY
M("second",15),
// PARSING
Z("s",Od),Z("ss",Od,Kd),ba(["s","ss"],fe);
// MOMENTS
var Ue=O("Seconds",!1);
// FORMATTING
U("S",0,0,function(){return~~(this.millisecond()/100)}),U(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),U(0,["SSS",3],0,"millisecond"),U(0,["SSSS",4],0,function(){return 10*this.millisecond()}),U(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),U(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),U(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),U(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),U(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),
// ALIASES
J("millisecond","ms"),
// PRIORITY
M("millisecond",16),
// PARSING
Z("S",Rd,Jd),Z("SS",Rd,Kd),Z("SSS",Rd,Ld);var Ve;for(Ve="SSSS";Ve.length<=9;Ve+="S")Z(Ve,Ud);for(Ve="S";Ve.length<=9;Ve+="S")ba(Ve,Ic);
// MOMENTS
var We=O("Milliseconds",!1);
// FORMATTING
U("z",0,0,"zoneAbbr"),U("zz",0,0,"zoneName");var Xe=r.prototype;Xe.add=Pe,Xe.calendar=Vb,Xe.clone=Wb,Xe.diff=bc,Xe.endOf=oc,Xe.format=gc,Xe.from=hc,Xe.fromNow=ic,Xe.to=jc,Xe.toNow=kc,Xe.get=R,Xe.invalidAt=xc,Xe.isAfter=Xb,Xe.isBefore=Yb,Xe.isBetween=Zb,Xe.isSame=$b,Xe.isSameOrAfter=_b,Xe.isSameOrBefore=ac,Xe.isValid=vc,Xe.lang=Re,Xe.locale=lc,Xe.localeData=mc,Xe.max=Ke,Xe.min=Je,Xe.parsingFlags=wc,Xe.set=S,Xe.startOf=nc,Xe.subtract=Qe,Xe.toArray=sc,Xe.toObject=tc,Xe.toDate=rc,Xe.toISOString=ec,Xe.inspect=fc,Xe.toJSON=uc,Xe.toString=dc,Xe.unix=qc,Xe.valueOf=pc,Xe.creationData=yc,
// Year
Xe.year=pe,Xe.isLeapYear=ra,
// Week Year
Xe.weekYear=Ac,Xe.isoWeekYear=Bc,
// Quarter
Xe.quarter=Xe.quarters=Gc,
// Month
Xe.month=ka,Xe.daysInMonth=la,
// Week
Xe.week=Xe.weeks=Ba,Xe.isoWeek=Xe.isoWeeks=Ca,Xe.weeksInYear=Dc,Xe.isoWeeksInYear=Cc,
// Day
Xe.date=Se,Xe.day=Xe.days=Ka,Xe.weekday=La,Xe.isoWeekday=Ma,Xe.dayOfYear=Hc,
// Hour
Xe.hour=Xe.hours=ze,
// Minute
Xe.minute=Xe.minutes=Te,
// Second
Xe.second=Xe.seconds=Ue,
// Millisecond
Xe.millisecond=Xe.milliseconds=We,
// Offset
Xe.utcOffset=Db,Xe.utc=Fb,Xe.local=Gb,Xe.parseZone=Hb,Xe.hasAlignedHourOffset=Ib,Xe.isDST=Jb,Xe.isLocal=Lb,Xe.isUtcOffset=Mb,Xe.isUtc=Nb,Xe.isUTC=Nb,
// Timezone
Xe.zoneAbbr=Jc,Xe.zoneName=Kc,
// Deprecations
Xe.dates=x("dates accessor is deprecated. Use date instead.",Se),Xe.months=x("months accessor is deprecated. Use month instead",ka),Xe.years=x("years accessor is deprecated. Use year instead",pe),Xe.zone=x("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",Eb),Xe.isDSTShifted=x("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",Kb);var Ye=C.prototype;Ye.calendar=D,Ye.longDateFormat=E,Ye.invalidDate=F,Ye.ordinal=G,Ye.preparse=Nc,Ye.postformat=Nc,Ye.relativeTime=H,Ye.pastFuture=I,Ye.set=A,
// Month
Ye.months=fa,Ye.monthsShort=ga,Ye.monthsParse=ia,Ye.monthsRegex=na,Ye.monthsShortRegex=ma,
// Week
Ye.week=ya,Ye.firstDayOfYear=Aa,Ye.firstDayOfWeek=za,
// Day of Week
Ye.weekdays=Fa,Ye.weekdaysMin=Ha,Ye.weekdaysShort=Ga,Ye.weekdaysParse=Ja,Ye.weekdaysRegex=Na,Ye.weekdaysShortRegex=Oa,Ye.weekdaysMinRegex=Pa,
// Hours
Ye.isPM=Va,Ye.meridiem=Wa,$a("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===u(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),
// Side effect imports
a.lang=x("moment.lang is deprecated. Use moment.locale instead.",$a),a.langData=x("moment.langData is deprecated. Use moment.localeData instead.",bb);var Ze=Math.abs,$e=ed("ms"),_e=ed("s"),af=ed("m"),bf=ed("h"),cf=ed("d"),df=ed("w"),ef=ed("M"),ff=ed("y"),gf=gd("milliseconds"),hf=gd("seconds"),jf=gd("minutes"),kf=gd("hours"),lf=gd("days"),mf=gd("months"),nf=gd("years"),of=Math.round,pf={s:45,// seconds to minute
m:45,// minutes to hour
h:22,// hours to day
d:26,// days to month
M:11},qf=Math.abs,rf=wb.prototype;
// Deprecations
// Side effect imports
// FORMATTING
// PARSING
// Side effect imports
return rf.abs=Wc,rf.add=Yc,rf.subtract=Zc,rf.as=cd,rf.asMilliseconds=$e,rf.asSeconds=_e,rf.asMinutes=af,rf.asHours=bf,rf.asDays=cf,rf.asWeeks=df,rf.asMonths=ef,rf.asYears=ff,rf.valueOf=dd,rf._bubble=_c,rf.get=fd,rf.milliseconds=gf,rf.seconds=hf,rf.minutes=jf,rf.hours=kf,rf.days=lf,rf.weeks=hd,rf.months=mf,rf.years=nf,rf.humanize=md,rf.toISOString=nd,rf.toString=nd,rf.toJSON=nd,rf.locale=lc,rf.localeData=mc,rf.toIsoString=x("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",nd),rf.lang=Re,U("X",0,0,"unix"),U("x",0,0,"valueOf"),Z("x",Vd),Z("X",Yd),ba("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),ba("x",function(a,b,c){c._d=new Date(u(a))}),a.version="2.17.0",b(sb),a.fn=Xe,a.min=ub,a.max=vb,a.now=Le,a.utc=k,a.unix=Lc,a.months=Rc,a.isDate=g,a.locale=$a,a.invalid=o,a.duration=Ob,a.isMoment=s,a.weekdays=Tc,a.parseZone=Mc,a.localeData=bb,a.isDuration=xb,a.monthsShort=Sc,a.weekdaysMin=Vc,a.defineLocale=_a,a.updateLocale=ab,a.locales=cb,a.weekdaysShort=Uc,a.normalizeUnits=K,a.relativeTimeRounding=kd,a.relativeTimeThreshold=ld,a.calendarFormat=Ub,a.prototype=Xe,a});;
"undefined"==typeof jwplayer&&(jwplayer=function(f){if(jwplayer.api)return jwplayer.api.selectPlayer(f)},jwplayer.version="6.11.4923",jwplayer.vid=document.createElement("video"),jwplayer.audio=document.createElement("audio"),jwplayer.source=document.createElement("source"),function(){var f={},c=Array.prototype,k=Object.prototype,d=c.slice,e=c.concat,b=k.toString,h=k.hasOwnProperty,n=c.map,a=c.forEach,g=c.filter,m=c.some,p=c.indexOf,k=Array.isArray,l=Object.keys,j=function(a){if(a instanceof j)return a;
if(!(this instanceof j))return new j(a)},t=j.each=j.forEach=function(r,g,b){if(null==r)return r;if(a&&r.forEach===a)r.forEach(g,b);else if(r.length===+r.length)for(var d=0,m=r.length;d<m;d++){if(g.call(b,r[d],d,r)===f)return}else for(var c=j.keys(r),d=0,m=c.length;d<m;d++)if(g.call(b,r[c[d]],c[d],r)===f)return;return r};j.map=j.collect=function(a,j,g){var b=[];if(null==a)return b;if(n&&a.map===n)return a.map(j,g);t(a,function(a,r,d){b.push(j.call(g,a,r,d))});return b};j.find=j.detect=function(a,j,
g){var b;v(a,function(a,r,d){if(j.call(g,a,r,d))return b=a,!0});return b};j.filter=j.select=function(a,j,b){var d=[];if(null==a)return d;if(g&&a.filter===g)return a.filter(j,b);t(a,function(a,g,r){j.call(b,a,g,r)&&d.push(a)});return d};var v=j.some=j.any=function(a,g,b){g||(g=j.identity);var d=!1;if(null==a)return d;if(m&&a.some===m)return a.some(g,b);t(a,function(a,j,r){if(d||(d=g.call(b,a,j,r)))return f});return!!d};j.size=function(a){return null==a?0:a.length===+a.length?a.length:j.keys(a).length};
j.after=function(a,j){return function(){if(1>--a)return j.apply(this,arguments)}};j.sortedIndex=function(a,g,b,d){b=null==b?j.identity:j.isFunction(b)?b:j.property(b);g=b.call(d,g);for(var m=0,c=a.length;m<c;){var l=m+c>>>1;b.call(d,a[l])<g?m=l+1:c=l}return m};j.find=j.detect=function(a,j,g){var b;v(a,function(a,d,m){if(j.call(g,a,d,m))return b=a,!0});return b};v=j.some=j.any=function(a,g,b){g||(g=j.identity);var d=!1;if(null==a)return d;if(m&&a.some===m)return a.some(g,b);t(a,function(a,j,m){if(d||
(d=g.call(b,a,j,m)))return f});return!!d};j.contains=j.include=function(a,g){if(null==a)return!1;a.length!==+a.length&&(a=j.values(a));return 0<=j.indexOf(a,g)};j.difference=function(a){var g=e.apply(c,d.call(arguments,1));return j.filter(a,function(a){return!j.contains(g,a)})};j.without=function(a){return j.difference(a,d.call(arguments,1))};j.indexOf=function(a,g,b){if(null==a)return-1;var d=0,m=a.length;if(b)if("number"==typeof b)d=0>b?Math.max(0,m+b):b;else return d=j.sortedIndex(a,g),a[d]===
g?d:-1;if(p&&a.indexOf===p)return a.indexOf(g,b);for(;d<m;d++)if(a[d]===g)return d;return-1};j.memoize=function(a,g){var b={};g||(g=j.identity);return function(){var d=g.apply(this,arguments);return j.has(b,d)?b[d]:b[d]=a.apply(this,arguments)}};j.keys=function(a){if(!j.isObject(a))return[];if(l)return l(a);var g=[],b;for(b in a)j.has(a,b)&&g.push(b);return g};j.pick=function(a){var j={},g=e.apply(c,d.call(arguments,1));t(g,function(g){g in a&&(j[g]=a[g])});return j};j.isArray=k||function(a){return"[object Array]"==
b.call(a)};j.isObject=function(a){return a===Object(a)};t("Arguments Function String Number Date RegExp".split(" "),function(a){j["is"+a]=function(g){return b.call(g)=="[object "+a+"]"}});j.isArguments(arguments)||(j.isArguments=function(a){return!(!a||!j.has(a,"callee"))});"function"!==typeof/./&&(j.isFunction=function(a){return"function"===typeof a});j.isFinite=function(a){return isFinite(a)&&!isNaN(parseFloat(a))};j.isNaN=function(a){return j.isNumber(a)&&a!=+a};j.isBoolean=function(a){return!0===
a||!1===a||"[object Boolean]"==b.call(a)};j.isNull=function(a){return null===a};j.isUndefined=function(a){return void 0===a};j.has=function(a,g){return h.call(a,g)};j.identity=function(a){return a};j.constant=function(a){return function(){return a}};j.property=function(a){return function(g){return g[a]}};this._=j}.call(jwplayer),function(f){function c(a){return function(){return h(a)}}function k(a,g,b,c,l){return function(){var j,e;if(l)b(a);else{try{if(j=a.responseXML)if(e=j.firstChild,j.lastChild&&
"parsererror"===j.lastChild.nodeName){c&&c("Invalid XML",g,a);return}}catch(h){}if(j&&e)return b(a);(j=d.parseXML(a.responseText))&&j.firstChild?(a=d.extend({},a,{responseXML:j}),b(a)):c&&c(a.responseText?"Invalid XML":g,g,a)}}}var d=f.utils={},e=f._;d.exists=function(a){switch(typeof a){case "string":return 0<a.length;case "object":return null!==a;case "undefined":return!1}return!0};d.styleDimension=function(a){return a+(0<a.toString().indexOf("%")?"":"px")};d.getAbsolutePath=function(a,g){d.exists(g)||
(g=document.location.href);if(d.exists(a)){var b;if(d.exists(a)){b=a.indexOf("://");var c=a.indexOf("?");b=0<b&&(0>c||c>b)}else b=void 0;if(b)return a;b=g.substring(0,g.indexOf("://")+3);var c=g.substring(b.length,g.indexOf("/",b.length+1)),l;0===a.indexOf("/")?l=a.split("/"):(l=g.split("?")[0],l=l.substring(b.length+c.length+1,l.lastIndexOf("/")),l=l.split("/").concat(a.split("/")));for(var j=[],e=0;e<l.length;e++)l[e]&&(d.exists(l[e])&&"."!==l[e])&&(".."===l[e]?j.pop():j.push(l[e]));return b+c+
"/"+j.join("/")}};d.extend=function(){var a=Array.prototype.slice.call(arguments,0);if(1<a.length){for(var g=a[0],b=function(a,b){void 0!==b&&null!==b&&(g[a]=b)},c=1;c<a.length;c++)d.foreach(a[c],b);return g}return null};var b=window.console=window.console||{log:function(){}};d.log=function(){var a=Array.prototype.slice.call(arguments,0);"object"===typeof b.log?b.log(a):b.log.apply(b,a)};var h=e.memoize(function(a){return null!==navigator.userAgent.toLowerCase().match(a)});d.isFF=c(/firefox/i);d.isChrome=
c(/chrome/i);d.isIPod=c(/iP(hone|od)/i);d.isIPad=c(/iPad/i);d.isSafari602=c(/Macintosh.*Mac OS X 10_8.*6\.0\.\d* Safari/i);d.isIETrident=function(a){return a?(a=parseFloat(a).toFixed(1),h(RegExp("trident/.+rv:\\s*"+a,"i"))):h(/trident/i)};d.isMSIE=function(a){return a?(a=parseFloat(a).toFixed(1),h(RegExp("msie\\s*"+a,"i"))):h(/msie/i)};d.isIE=function(a){return a?(a=parseFloat(a).toFixed(1),11<=a?d.isIETrident(a):d.isMSIE(a)):d.isMSIE()||d.isIETrident()};d.isSafari=function(){return h(/safari/i)&&
!h(/chrome/i)&&!h(/chromium/i)&&!h(/android/i)};d.isIOS=function(a){return a?h(RegExp("iP(hone|ad|od).+\\sOS\\s"+a,"i")):h(/iP(hone|ad|od)/i)};d.isAndroidNative=function(a){return d.isAndroid(a,!0)};d.isAndroid=function(a,b){return b&&h(/chrome\/[123456789]/i)&&!h(/chrome\/18/)?!1:a?(d.isInt(a)&&!/\./.test(a)&&(a=""+a+"."),h(RegExp("Android\\s*"+a,"i"))):h(/Android/i)};d.isMobile=function(){return d.isIOS()||d.isAndroid()};d.isIframe=function(){return window.frameElement&&"IFRAME"===window.frameElement.nodeName};
d.saveCookie=function(a,b){document.cookie="jwplayer."+a+"\x3d"+b+"; path\x3d/"};d.getCookies=function(){for(var a={},b=document.cookie.split("; "),d=0;d<b.length;d++){var c=b[d].split("\x3d");0===c[0].indexOf("jwplayer.")&&(a[c[0].substring(9,c[0].length)]=c[1])}return a};d.isInt=function(a){return 0===parseFloat(a)%1};d.typeOf=function(a){if(null===a)return"null";var b=typeof a;return"object"===b&&e.isArray(a)?"array":b};d.translateEventResponse=function(a,b){var c=d.extend({},b);if(a===f.events.JWPLAYER_FULLSCREEN&&
!c.fullscreen)c.fullscreen="true"===c.message,delete c.message;else if("object"===typeof c.data){var e=c.data;delete c.data;c=d.extend(c,e)}else"object"===typeof c.metadata&&d.deepReplaceKeyName(c.metadata,["__dot__","__spc__","__dsh__","__default__"],["."," ","-","default"]);d.foreach(["position","duration","offset"],function(a,b){c[b]&&(c[b]=Math.round(1E3*c[b])/1E3)});return c};d.flashVersion=function(){if(d.isAndroid())return 0;var a=navigator.plugins,b;try{if("undefined"!==a&&(b=a["Shockwave Flash"]))return parseInt(b.description.replace(/\D+(\d+)\..*/,
"$1"),10)}catch(c){}if("undefined"!==typeof window.ActiveXObject)try{if(b=new window.ActiveXObject("ShockwaveFlash.ShockwaveFlash"))return parseInt(b.GetVariable("$version").split(" ")[1].split(",")[0],10)}catch(e){}return 0};d.getScriptPath=function(a){for(var b=document.getElementsByTagName("script"),d=0;d<b.length;d++){var c=b[d].src;if(c&&0<=c.indexOf(a))return c.substr(0,c.indexOf(a))}return""};d.deepReplaceKeyName=function(a,b,c){switch(f.utils.typeOf(a)){case "array":for(var e=0;e<a.length;e++)a[e]=
f.utils.deepReplaceKeyName(a[e],b,c);break;case "object":d.foreach(a,function(d,j){var e;if(b instanceof Array&&c instanceof Array){if(b.length!==c.length)return;e=b}else e=[b];for(var h=d,r=0;r<e.length;r++)h=h.replace(RegExp(b[r],"g"),c[r]);a[h]=f.utils.deepReplaceKeyName(j,b,c);d!==h&&delete a[d]})}return a};var n=d.pluginPathType={ABSOLUTE:0,RELATIVE:1,CDN:2};d.getPluginPathType=function(a){if("string"===typeof a){a=a.split("?")[0];var b=a.indexOf("://");if(0<b)return n.ABSOLUTE;var c=a.indexOf("/");
a=d.extension(a);return 0>b&&0>c&&(!a||!isNaN(a))?n.CDN:n.RELATIVE}};d.getPluginName=function(a){return a.replace(/^(.*\/)?([^-]*)-?.*\.(swf|js)$/,"$2")};d.getPluginVersion=function(a){return a.replace(/[^-]*-?([^\.]*).*$/,"$1")};d.isYouTube=function(a,b){return"youtube"===b||/^(http|\/\/).*(youtube\.com|youtu\.be)\/.+/.test(a)};d.youTubeID=function(a){try{return/v[=\/]([^?&]*)|youtu\.be\/([^?]*)|^([\w-]*)$/i.exec(a).slice(1).join("").replace("?","")}catch(b){return""}};d.isRtmp=function(a,b){return 0===
a.indexOf("rtmp")||"rtmp"===b};d.foreach=function(a,b){var c,e;for(c in a)"function"===d.typeOf(a.hasOwnProperty)?a.hasOwnProperty(c)&&(e=a[c],b(c,e)):(e=a[c],b(c,e))};d.isHTTPS=function(){return 0===window.location.href.indexOf("https")};d.repo=function(){var a="http://p.jwpcdn.com/"+f.version.split(/\W/).splice(0,2).join("/")+"/";try{d.isHTTPS()&&(a=a.replace("http://","https://ssl."))}catch(b){}return a};d.versionCheck=function(a){a=("0"+a).split(/\W/);var b=f.version.split(/\W/),d=parseFloat(a[0]),
c=parseFloat(b[0]);return d>c||d===c&&parseFloat("0"+a[1])>parseFloat(b[1])?!1:!0};d.ajax=function(a,b,c,e){var h,j=!1;0<a.indexOf("#")&&(a=a.replace(/#.*$/,""));if(a&&0<=a.indexOf("://")&&a.split("/")[2]!==window.location.href.split("/")[2]&&d.exists(window.XDomainRequest))h=new window.XDomainRequest,h.onload=k(h,a,b,c,e),h.ontimeout=h.onprogress=function(){},h.timeout=5E3;else if(d.exists(window.XMLHttpRequest)){var f=h=new window.XMLHttpRequest,n=a;h.onreadystatechange=function(){if(4===f.readyState)switch(f.status){case 200:k(f,
n,b,c,e)();break;case 404:c("File not found",n,f)}}}else return c&&c("",a,h),h;h.overrideMimeType&&h.overrideMimeType("text/xml");var r=a,q=h;h.onerror=function(){c("Error loading file",r,q)};try{h.open("GET",a,!0)}catch(u){j=!0}setTimeout(function(){if(j)c&&c(a,a,h);else try{h.send()}catch(b){c&&c(a,a,h)}},0);return h};d.parseXML=function(a){var b;try{if(window.DOMParser){if(b=(new window.DOMParser).parseFromString(a,"text/xml"),b.childNodes&&b.childNodes.length&&"parsererror"===b.childNodes[0].firstChild.nodeName)return}else b=
new window.ActiveXObject("Microsoft.XMLDOM"),b.async="false",b.loadXML(a)}catch(c){return}return b};d.between=function(a,b,c){return Math.max(Math.min(a,c),b)};d.seconds=function(a){if(e.isNumber(a))return a;a=a.replace(",",".");var b=a.split(":"),c=0;"s"===a.slice(-1)?c=parseFloat(a):"m"===a.slice(-1)?c=60*parseFloat(a):"h"===a.slice(-1)?c=3600*parseFloat(a):1<b.length?(c=parseFloat(b[b.length-1]),c+=60*parseFloat(b[b.length-2]),3===b.length&&(c+=3600*parseFloat(b[b.length-3]))):c=parseFloat(a);
return c};d.serialize=function(a){return null===a?null:"true"===a.toString().toLowerCase()?!0:"false"===a.toString().toLowerCase()?!1:isNaN(Number(a))||5<a.length||0===a.length?a:Number(a)};d.addClass=function(a,b){var c=e.isString(a.className)?a.className.split(" "):[],h=e.isArray(b)?b:b.split(" ");e.each(h,function(a){e.contains(c,a)||c.push(a)});a.className=d.trim(c.join(" "))};d.removeClass=function(a,b){var c=e.isString(a.className)?a.className.split(" "):[],h=e.isArray(b)?b:b.split(" ");a.className=
d.trim(e.difference(c,h).join(" "))};d.indexOf=e.indexOf;d.noop=function(){};d.canCast=function(){var a=f.cast;return!(!a||!e.isFunction(a.available)||!a.available())}}(jwplayer),function(f){function c(a){var b=document.createElement("style");a&&b.appendChild(document.createTextNode(a));b.type="text/css";document.getElementsByTagName("head")[0].appendChild(b);return b}function k(a,c,d){if(!b.exists(c))return"";d=d?" !important":"";return"string"===typeof c&&isNaN(c)?/png|gif|jpe?g/i.test(c)&&0>c.indexOf("url")?
"url("+c+")":c+d:0===c||"z-index"===a||"opacity"===a?""+c+d:/color/i.test(a)?"#"+b.pad(c.toString(16).replace(/^0x/i,""),6)+d:Math.ceil(c)+"px"+d}function d(a,b){for(var c=0;c<a.length;c++){var d=a[c],g,e;if(void 0!==d&&null!==d)for(g in b){e=g;e=e.split("-");for(var h=1;h<e.length;h++)e[h]=e[h].charAt(0).toUpperCase()+e[h].slice(1);e=e.join("");d.style[e]!==b[g]&&(d.style[e]=b[g])}}}function e(b){var c=h[b].sheet,d,g,e;if(c){d=c.cssRules;g=m[b];e=b;var f=a[e];e+=" { ";for(var n in f)e+=n+": "+f[n]+
"; ";e+="}";if(void 0!==g&&g<d.length&&d[g].selectorText===b){if(e===d[g].cssText)return;c.deleteRule(g)}else g=d.length,m[b]=g;try{c.insertRule(e,g)}catch(k){}}}var b=f.utils,h={},n,a={},g=null,m={};b.cssKeyframes=function(a,b){var d=h.keyframes;d||(d=c(),h.keyframes=d);var d=d.sheet,e="@keyframes "+a+" { "+b+" }";try{d.insertRule(e,d.cssRules.length)}catch(g){}e=e.replace(/(keyframes|transform)/g,"-webkit-$1");try{d.insertRule(e,d.cssRules.length)}catch(f){}};var p=b.css=function(b,d,f){a[b]||(a[b]=
{});var m=a[b];f=f||!1;var r=!1,p,u;for(p in d)u=k(p,d[p],f),""!==u?u!==m[p]&&(m[p]=u,r=!0):void 0!==m[p]&&(delete m[p],r=!0);if(r){if(!h[b]){d=n&&n.sheet&&n.sheet.cssRules&&n.sheet.cssRules.length||0;if(!n||5E4<d)n=c();h[b]=n}null!==g?g.styleSheets[b]=a[b]:e(b)}};p.style=function(a,b,c){if(!(void 0===a||null===a)){void 0===a.length&&(a=[a]);var e={},h;for(h in b)e[h]=k(h,b[h]);if(null!==g&&!c){b=(b=a.__cssRules)||{};for(var f in e)b[f]=e[f];a.__cssRules=b;0>g.elements.indexOf(a)&&g.elements.push(a)}else d(a,
e)}};p.block=function(a){null===g&&(g={id:a,styleSheets:{},elements:[]})};p.unblock=function(a){if(g&&(!a||g.id===a)){for(var b in g.styleSheets)e(b);for(a=0;a<g.elements.length;a++)b=g.elements[a],d(b,b.__cssRules);g=null}};b.clearCss=function(b){for(var c in a)0<=c.indexOf(b)&&delete a[c];for(var d in h)0<=d.indexOf(b)&&e(d)};b.transform=function(a,b){var c={};b=b||"";c.transform=b;c["-webkit-transform"]=b;c["-ms-transform"]=b;c["-moz-transform"]=b;c["-o-transform"]=b;"string"===typeof a?p(a,c):
p.style(a,c)};b.dragStyle=function(a,b){p(a,{"-webkit-user-select":b,"-moz-user-select":b,"-ms-user-select":b,"-webkit-user-drag":b,"user-select":b,"user-drag":b})};b.transitionStyle=function(a,b){navigator.userAgent.match(/5\.\d(\.\d)? safari/i)||p(a,{"-webkit-transition":b,"-moz-transition":b,"-o-transition":b,transition:b})};b.rotate=function(a,c){b.transform(a,"rotate("+c+"deg)")};b.rgbHex=function(a){a=String(a).replace("#","");3===a.length&&(a=a[0]+a[0]+a[1]+a[1]+a[2]+a[2]);return"#"+a.substr(-6)};
b.hexToRgba=function(a,b){var c="rgb",d=[parseInt(a.substr(1,2),16),parseInt(a.substr(3,2),16),parseInt(a.substr(5,2),16)];void 0!==b&&100!==b&&(c+="a",d.push(b/100));return c+"("+d.join(",")+")"}}(jwplayer),function(f){var c=f.foreach,k={mp4:"video/mp4",ogg:"video/ogg",oga:"audio/ogg",vorbis:"audio/ogg",webm:"video/webm",aac:"audio/mp4",mp3:"audio/mpeg",hls:"application/vnd.apple.mpegurl"},d={mp4:k.mp4,f4v:k.mp4,m4v:k.mp4,mov:k.mp4,m4a:k.aac,f4a:k.aac,aac:k.aac,mp3:k.mp3,ogv:k.ogg,ogg:k.ogg,oga:k.vorbis,
vorbis:k.vorbis,webm:k.webm,m3u8:k.hls,m3u:k.hls,hls:k.hls},e=f.extensionmap={};c(d,function(b,c){e[b]={html5:c}});c({flv:"video",f4v:"video",mov:"video",m4a:"video",m4v:"video",mp4:"video",aac:"video",f4a:"video",mp3:"sound",smil:"rtmp",m3u8:"hls",hls:"hls"},function(b,c){e[b]||(e[b]={});e[b].flash=c});e.types=k;e.mimeType=function(b){var d;c(k,function(c,a){!d&&a==b&&(d=c)});return d};e.extType=function(b){return e.mimeType(d[b])}}(jwplayer.utils),function(f){var c=f.loaderstatus={NEW:0,LOADING:1,
ERROR:2,COMPLETE:3},k=document;f.scriptloader=function(d){function e(b){a=c.ERROR;n.sendEvent(h.ERROR,b)}function b(b){a=c.COMPLETE;n.sendEvent(h.COMPLETE,b)}var h=jwplayer.events,n=f.extend(this,new h.eventdispatcher),a=c.NEW;this.load=function(){if(a==c.NEW){var g=f.scriptloader.loaders[d];if(g&&(a=g.getStatus(),2>a)){g.addEventListener(h.ERROR,e);g.addEventListener(h.COMPLETE,b);return}var n=k.createElement("script");n.addEventListener?(n.onload=b,n.onerror=e):n.readyState&&(n.onreadystatechange=
function(a){("loaded"==n.readyState||"complete"==n.readyState)&&b(a)});k.getElementsByTagName("head")[0].appendChild(n);n.src=d;a=c.LOADING;f.scriptloader.loaders[d]=this}};this.getStatus=function(){return a}};f.scriptloader.loaders={}}(jwplayer.utils),function(f){f.trim=function(c){return c.replace(/^\s+|\s+$/g,"")};f.pad=function(c,f,d){for(d||(d="0");c.length<f;)c=d+c;return c};f.xmlAttribute=function(c,f){for(var d=0;d<c.attributes.length;d++)if(c.attributes[d].name&&c.attributes[d].name.toLowerCase()===
f.toLowerCase())return c.attributes[d].value.toString();return""};f.extension=function(c){if(!c||"rtmp"===c.substr(0,4))return"";var f;f=-1<c.indexOf("(format\x3dm3u8-")?"m3u8":!1;if(f)return f;c=c.substring(c.lastIndexOf("/")+1,c.length).split("?")[0].split("#")[0];if(-1<c.lastIndexOf("."))return c.substr(c.lastIndexOf(".")+1,c.length).toLowerCase()};f.stringToColor=function(c){c=c.replace(/(#|0x)?([0-9A-F]{3,6})$/gi,"$2");3===c.length&&(c=c.charAt(0)+c.charAt(0)+c.charAt(1)+c.charAt(1)+c.charAt(2)+
c.charAt(2));return parseInt(c,16)}}(jwplayer.utils),function(f){var c="touchmove",k="touchstart";f.touch=function(d){function e(d){d.type===k?(a=!0,m=h(l.DRAG_START,d)):d.type===c?a&&(p||(b(l.DRAG_START,d,m),p=!0),b(l.DRAG,d)):(a&&(p?b(l.DRAG_END,d):(d.cancelBubble=!0,b(l.TAP,d))),a=p=!1,m=null)}function b(a,b,c){if(g[a]&&(b.preventManipulation&&b.preventManipulation(),b.preventDefault&&b.preventDefault(),b=c?c:h(a,b)))g[a](b)}function h(a,b){var c=null;b.touches&&b.touches.length?c=b.touches[0]:
b.changedTouches&&b.changedTouches.length&&(c=b.changedTouches[0]);if(!c)return null;var d=n.getBoundingClientRect(),c={type:a,target:n,x:c.pageX-window.pageXOffset-d.left,y:c.pageY,deltaX:0,deltaY:0};a!==l.TAP&&m&&(c.deltaX=c.x-m.x,c.deltaY=c.y-m.y);return c}var n=d,a=!1,g={},m=null,p=!1,l=f.touchEvents;document.addEventListener(c,e);document.addEventListener("touchend",function(c){a&&p&&b(l.DRAG_END,c);a=p=!1;m=null});document.addEventListener("touchcancel",e);d.addEventListener(k,e);d.addEventListener("touchend",
e);this.addEventListener=function(a,b){g[a]=b};this.removeEventListener=function(a){delete g[a]};return this}}(jwplayer.utils),function(f){f.touchEvents={DRAG:"jwplayerDrag",DRAG_START:"jwplayerDragStart",DRAG_END:"jwplayerDragEnd",TAP:"jwplayerTap"}}(jwplayer.utils),function(f){f.key=function(c){var k,d,e;this.edition=function(){return e&&e.getTime()<(new Date).getTime()?"invalid":k};this.token=function(){return d};f.exists(c)||(c="");try{c=f.tea.decrypt(c,"36QXq4W@GSBV^teR");var b=c.split("/");
(k=b[0])?/^(free|pro|premium|enterprise|ads)$/i.test(k)?(d=b[1],b[2]&&0<parseInt(b[2])&&(e=new Date,e.setTime(String(b[2])))):k="invalid":k="free"}catch(h){k="invalid"}}}(jwplayer.utils),function(f){var c=f.tea={};c.encrypt=function(e,b){if(0==e.length)return"";var h=c.strToLongs(d.encode(e));1>=h.length&&(h[1]=0);for(var f=c.strToLongs(d.encode(b).slice(0,16)),a=h.length,g=h[a-1],m=h[0],p,l=Math.floor(6+52/a),j=0;0<l--;){j+=2654435769;p=j>>>2&3;for(var t=0;t<a;t++)m=h[(t+1)%a],g=(g>>>5^m<<2)+(m>>>
3^g<<4)^(j^m)+(f[t&3^p]^g),g=h[t]+=g}h=c.longsToStr(h);return k.encode(h)};c.decrypt=function(e,b){if(0==e.length)return"";for(var h=c.strToLongs(k.decode(e)),f=c.strToLongs(d.encode(b).slice(0,16)),a=h.length,g=h[a-1],m=h[0],p,l=2654435769*Math.floor(6+52/a);0!=l;){p=l>>>2&3;for(var j=a-1;0<=j;j--)g=h[0<j?j-1:a-1],g=(g>>>5^m<<2)+(m>>>3^g<<4)^(l^m)+(f[j&3^p]^g),m=h[j]-=g;l-=2654435769}h=c.longsToStr(h);h=h.replace(/\0+$/,"");return d.decode(h)};c.strToLongs=function(c){for(var b=Array(Math.ceil(c.length/
4)),d=0;d<b.length;d++)b[d]=c.charCodeAt(4*d)+(c.charCodeAt(4*d+1)<<8)+(c.charCodeAt(4*d+2)<<16)+(c.charCodeAt(4*d+3)<<24);return b};c.longsToStr=function(c){for(var b=Array(c.length),d=0;d<c.length;d++)b[d]=String.fromCharCode(c[d]&255,c[d]>>>8&255,c[d]>>>16&255,c[d]>>>24&255);return b.join("")};var k={code:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/\x3d",encode:function(c,b){var h,f,a,g,m=[],p="",l,j,t=k.code;j=("undefined"==typeof b?0:b)?d.encode(c):c;l=j.length%3;if(0<l)for(;3>
l++;)p+="\x3d",j+="\x00";for(l=0;l<j.length;l+=3)h=j.charCodeAt(l),f=j.charCodeAt(l+1),a=j.charCodeAt(l+2),g=h<<16|f<<8|a,h=g>>18&63,f=g>>12&63,a=g>>6&63,g&=63,m[l/3]=t.charAt(h)+t.charAt(f)+t.charAt(a)+t.charAt(g);m=m.join("");return m=m.slice(0,m.length-p.length)+p},decode:function(c,b){b="undefined"==typeof b?!1:b;var h,f,a,g,m,p=[],l,j=k.code;l=b?d.decode(c):c;for(var t=0;t<l.length;t+=4)h=j.indexOf(l.charAt(t)),f=j.indexOf(l.charAt(t+1)),g=j.indexOf(l.charAt(t+2)),m=j.indexOf(l.charAt(t+3)),
a=h<<18|f<<12|g<<6|m,h=a>>>16&255,f=a>>>8&255,a&=255,p[t/4]=String.fromCharCode(h,f,a),64==m&&(p[t/4]=String.fromCharCode(h,f)),64==g&&(p[t/4]=String.fromCharCode(h));g=p.join("");return b?d.decode(g):g}},d={encode:function(c){c=c.replace(/[\u0080-\u07ff]/g,function(b){b=b.charCodeAt(0);return String.fromCharCode(192|b>>6,128|b&63)});return c=c.replace(/[\u0800-\uffff]/g,function(b){b=b.charCodeAt(0);return String.fromCharCode(224|b>>12,128|b>>6&63,128|b&63)})},decode:function(c){c=c.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,
function(b){b=(b.charCodeAt(0)&15)<<12|(b.charCodeAt(1)&63)<<6|b.charCodeAt(2)&63;return String.fromCharCode(b)});return c=c.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g,function(b){b=(b.charCodeAt(0)&31)<<6|b.charCodeAt(1)&63;return String.fromCharCode(b)})}}}(jwplayer.utils),function(f){f.events={COMPLETE:"COMPLETE",ERROR:"ERROR",API_READY:"jwplayerAPIReady",JWPLAYER_READY:"jwplayerReady",JWPLAYER_FULLSCREEN:"jwplayerFullscreen",JWPLAYER_RESIZE:"jwplayerResize",JWPLAYER_ERROR:"jwplayerError",JWPLAYER_SETUP_ERROR:"jwplayerSetupError",
JWPLAYER_MEDIA_BEFOREPLAY:"jwplayerMediaBeforePlay",JWPLAYER_MEDIA_BEFORECOMPLETE:"jwplayerMediaBeforeComplete",JWPLAYER_COMPONENT_SHOW:"jwplayerComponentShow",JWPLAYER_COMPONENT_HIDE:"jwplayerComponentHide",JWPLAYER_MEDIA_BUFFER:"jwplayerMediaBuffer",JWPLAYER_MEDIA_BUFFER_FULL:"jwplayerMediaBufferFull",JWPLAYER_MEDIA_ERROR:"jwplayerMediaError",JWPLAYER_MEDIA_LOADED:"jwplayerMediaLoaded",JWPLAYER_MEDIA_COMPLETE:"jwplayerMediaComplete",JWPLAYER_MEDIA_SEEK:"jwplayerMediaSeek",JWPLAYER_MEDIA_TIME:"jwplayerMediaTime",
JWPLAYER_MEDIA_VOLUME:"jwplayerMediaVolume",JWPLAYER_MEDIA_META:"jwplayerMediaMeta",JWPLAYER_MEDIA_MUTE:"jwplayerMediaMute",JWPLAYER_AUDIO_TRACKS:"jwplayerAudioTracks",JWPLAYER_AUDIO_TRACK_CHANGED:"jwplayerAudioTrackChanged",JWPLAYER_MEDIA_LEVELS:"jwplayerMediaLevels",JWPLAYER_MEDIA_LEVEL_CHANGED:"jwplayerMediaLevelChanged",JWPLAYER_CAPTIONS_CHANGED:"jwplayerCaptionsChanged",JWPLAYER_CAPTIONS_LIST:"jwplayerCaptionsList",JWPLAYER_CAPTIONS_LOADED:"jwplayerCaptionsLoaded",JWPLAYER_PLAYER_STATE:"jwplayerPlayerState",
state:{BUFFERING:"BUFFERING",IDLE:"IDLE",PAUSED:"PAUSED",PLAYING:"PLAYING"},JWPLAYER_PLAYLIST_LOADED:"jwplayerPlaylistLoaded",JWPLAYER_PLAYLIST_ITEM:"jwplayerPlaylistItem",JWPLAYER_PLAYLIST_COMPLETE:"jwplayerPlaylistComplete",JWPLAYER_DISPLAY_CLICK:"jwplayerViewClick",JWPLAYER_PROVIDER_CLICK:"jwplayerProviderClick",JWPLAYER_VIEW_TAB_FOCUS:"jwplayerViewTabFocus",JWPLAYER_CONTROLS:"jwplayerViewControls",JWPLAYER_USER_ACTION:"jwplayerUserAction",JWPLAYER_INSTREAM_CLICK:"jwplayerInstreamClicked",JWPLAYER_INSTREAM_DESTROYED:"jwplayerInstreamDestroyed",
JWPLAYER_AD_TIME:"jwplayerAdTime",JWPLAYER_AD_ERROR:"jwplayerAdError",JWPLAYER_AD_CLICK:"jwplayerAdClicked",JWPLAYER_AD_COMPLETE:"jwplayerAdComplete",JWPLAYER_AD_IMPRESSION:"jwplayerAdImpression",JWPLAYER_AD_COMPANIONS:"jwplayerAdCompanions",JWPLAYER_AD_SKIPPED:"jwplayerAdSkipped",JWPLAYER_AD_PLAY:"jwplayerAdPlay",JWPLAYER_AD_PAUSE:"jwplayerAdPause",JWPLAYER_AD_META:"jwplayerAdMeta",JWPLAYER_CAST_AVAILABLE:"jwplayerCastAvailable",JWPLAYER_CAST_SESSION:"jwplayerCastSession",JWPLAYER_CAST_AD_CHANGED:"jwplayerCastAdChanged"}}(jwplayer),
function(f){var c=f.utils;f.events.eventdispatcher=function(k,d){function e(b,a,d){if(b)for(var e=0;e<b.length;e++){var h=b[e];if(h){null!==h.count&&0===--h.count&&delete b[e];try{h.listener(a)}catch(f){c.log('Error handling "'+d+'" event listener ['+e+"]: "+f.toString(),h.listener,a)}}}}var b,h;this.resetEventListeners=function(){b={};h=[]};this.resetEventListeners();this.addEventListener=function(d,a,g){try{c.exists(b[d])||(b[d]=[]),"string"===c.typeOf(a)&&(a=(new Function("return "+a))()),b[d].push({listener:a,
count:g||null})}catch(e){c.log("error",e)}return!1};this.removeEventListener=function(d,a){var g;if(b[d]){try{if(void 0===a){b[d]=[];return}for(g=0;g<b[d].length;g++)if(b[d][g].listener.toString()===a.toString()){b[d].splice(g,1);break}}catch(e){c.log("error",e)}return!1}};this.addGlobalListener=function(b,a){try{"string"===c.typeOf(b)&&(b=(new Function("return "+b))()),h.push({listener:b,count:a||null})}catch(d){c.log("error",d)}return!1};this.removeGlobalListener=function(b){if(b){try{for(var a=
h.length;a--;)h[a].listener.toString()===b.toString()&&h.splice(a,1)}catch(d){c.log("error",d)}return!1}};this.sendEvent=function(n,a){c.exists(a)||(a={});c.extend(a,{id:k,version:f.version,type:n});d&&c.log(n,a);e(b[n],a,n);e(h,a,n)}}}(window.jwplayer),function(f){var c={},k={};f.plugins=function(){};f.plugins.loadPlugins=function(d,e){k[d]=new f.plugins.pluginloader(new f.plugins.model(c),e);return k[d]};f.plugins.registerPlugin=function(d,e,b,h){var n=f.utils.getPluginName(d);c[n]||(c[n]=new f.plugins.plugin(d));
c[n].registerPlugin(d,e,b,h)}}(jwplayer),function(f){f.plugins.model=function(c){this.addPlugin=function(k){var d=f.utils.getPluginName(k);c[d]||(c[d]=new f.plugins.plugin(k));return c[d]};this.getPlugins=function(){return c}}}(jwplayer),function(f){var c=jwplayer.utils,k=jwplayer.events;f.pluginmodes={FLASH:0,JAVASCRIPT:1,HYBRID:2};f.plugin=function(d){function e(){switch(c.getPluginPathType(d)){case c.pluginPathType.ABSOLUTE:return d;case c.pluginPathType.RELATIVE:return c.getAbsolutePath(d,window.location.href)}}
function b(){p=setTimeout(function(){n=c.loaderstatus.COMPLETE;l.sendEvent(k.COMPLETE)},1E3)}function h(){n=c.loaderstatus.ERROR;l.sendEvent(k.ERROR,{url:d})}var n=c.loaderstatus.NEW,a,g,m,p,l=new k.eventdispatcher;c.extend(this,l);this.load=function(){if(n===c.loaderstatus.NEW)if(0<d.lastIndexOf(".swf"))a=d,n=c.loaderstatus.COMPLETE,l.sendEvent(k.COMPLETE);else if(c.getPluginPathType(d)===c.pluginPathType.CDN)n=c.loaderstatus.COMPLETE,l.sendEvent(k.COMPLETE);else{n=c.loaderstatus.LOADING;var g=new c.scriptloader(e());
g.addEventListener(k.COMPLETE,b);g.addEventListener(k.ERROR,h);g.load()}};this.registerPlugin=function(b,d,e,h){p&&(clearTimeout(p),p=void 0);m=d;e&&h?(a=h,g=e):"string"===typeof e?a=e:"function"===typeof e?g=e:!e&&!h&&(a=b);n=c.loaderstatus.COMPLETE;l.sendEvent(k.COMPLETE)};this.getStatus=function(){return n};this.getPluginName=function(){return c.getPluginName(d)};this.getFlashPath=function(){if(a)switch(c.getPluginPathType(a)){case c.pluginPathType.ABSOLUTE:return a;case c.pluginPathType.RELATIVE:return 0<
d.lastIndexOf(".swf")?c.getAbsolutePath(a,window.location.href):c.getAbsolutePath(a,e())}return null};this.getJS=function(){return g};this.getTarget=function(){return m};this.getPluginmode=function(){if("undefined"!==typeof a&&"undefined"!==typeof g)return f.pluginmodes.HYBRID;if("undefined"!==typeof a)return f.pluginmodes.FLASH;if("undefined"!==typeof g)return f.pluginmodes.JAVASCRIPT};this.getNewInstance=function(a,b,c){return new g(a,b,c)};this.getURL=function(){return d}}}(jwplayer.plugins),function(f){var c=
f.utils,k=f.events,d=f._,e=c.foreach;f.plugins.pluginloader=function(b,h){function f(){p||(p=!0,m=c.loaderstatus.COMPLETE,v.sendEvent(k.COMPLETE))}function a(){(!l||0===d.keys(l).length)&&f();if(!p){var a=b.getPlugins();t=d.after(j,f);c.foreach(l,function(b){b=c.getPluginName(b);var d=a[b];b=d.getJS();var e=d.getTarget(),d=d.getStatus();d===c.loaderstatus.LOADING||d===c.loaderstatus.NEW||(b&&!c.versionCheck(e)&&v.sendEvent(k.ERROR,{message:"Incompatible player version"}),t())})}}function g(a){v.sendEvent(k.ERROR,
{message:"File not found"});a.url&&c.log("File not found",a.url);t()}var m=c.loaderstatus.NEW,p=!1,l=h,j=d.size(l),t,v=new k.eventdispatcher;c.extend(this,v);this.setupPlugins=function(a,d,g){var h={length:0,plugins:{}},f=0,j={},m=b.getPlugins();e(d.plugins,function(b,e){var n=c.getPluginName(b),k=m[n],l=k.getFlashPath(),p=k.getJS(),v=k.getURL();l&&(h.plugins[l]=c.extend({},e),h.plugins[l].pluginmode=k.getPluginmode(),h.length++);try{if(p&&d.plugins&&d.plugins[v]){var t=document.createElement("div");
t.id=a.id+"_"+n;t.style.position="absolute";t.style.top=0;t.style.zIndex=f+10;j[n]=k.getNewInstance(a,c.extend({},d.plugins[v]),t);f++;a.onReady(g(j[n],t,!0));a.onResize(g(j[n],t))}}catch(M){c.log("ERROR: Failed to load "+n+".")}});a.plugins=j;return h};this.load=function(){if(!(c.exists(h)&&"object"!==c.typeOf(h))){m=c.loaderstatus.LOADING;e(h,function(d){c.exists(d)&&(d=b.addPlugin(d),d.addEventListener(k.COMPLETE,a),d.addEventListener(k.ERROR,g))});var d=b.getPlugins();e(d,function(a,b){b.load()})}a()};
this.destroy=function(){v&&(v.resetEventListeners(),v=null)};this.pluginFailed=g;this.getStatus=function(){return m}}}(jwplayer),function(f){f.parsers={localName:function(c){return c?c.localName?c.localName:c.baseName?c.baseName:"":""},textContent:function(c){return c?c.textContent?f.utils.trim(c.textContent):c.text?f.utils.trim(c.text):"":""},getChildNode:function(c,f){return c.childNodes[f]},numChildren:function(c){return c.childNodes?c.childNodes.length:0}}}(jwplayer),function(f){var c=f.parsers;
(c.jwparser=function(){}).parseEntry=function(k,d){for(var e=[],b=[],h=f.utils.xmlAttribute,n=0;n<k.childNodes.length;n++){var a=k.childNodes[n];if("jwplayer"==a.prefix){var g=c.localName(a);"source"==g?(delete d.sources,e.push({file:h(a,"file"),"default":h(a,"default"),label:h(a,"label"),type:h(a,"type")})):"track"==g?(delete d.tracks,b.push({file:h(a,"file"),"default":h(a,"default"),kind:h(a,"kind"),label:h(a,"label")})):(d[g]=f.utils.serialize(c.textContent(a)),"file"==g&&d.sources&&delete d.sources)}d.file||
(d.file=d.link)}if(e.length){d.sources=[];for(n=0;n<e.length;n++)0<e[n].file.length&&(e[n]["default"]="true"==e[n]["default"]?!0:!1,e[n].label.length||delete e[n].label,d.sources.push(e[n]))}if(b.length){d.tracks=[];for(n=0;n<b.length;n++)0<b[n].file.length&&(b[n]["default"]="true"==b[n]["default"]?!0:!1,b[n].kind=!b[n].kind.length?"captions":b[n].kind,b[n].label.length||delete b[n].label,d.tracks.push(b[n]))}return d}}(jwplayer),function(f){var c=jwplayer.utils,k=c.xmlAttribute,d=f.localName,e=f.textContent,
b=f.numChildren,h=f.mediaparser=function(){};h.parseGroup=function(f,a){var g,m,p=[];for(m=0;m<b(f);m++)if(g=f.childNodes[m],"media"==g.prefix&&d(g))switch(d(g).toLowerCase()){case "content":k(g,"duration")&&(a.duration=c.seconds(k(g,"duration")));0<b(g)&&(a=h.parseGroup(g,a));k(g,"url")&&(a.sources||(a.sources=[]),a.sources.push({file:k(g,"url"),type:k(g,"type"),width:k(g,"width"),label:k(g,"label")}));break;case "title":a.title=e(g);break;case "description":a.description=e(g);break;case "guid":a.mediaid=
e(g);break;case "thumbnail":a.image||(a.image=k(g,"url"));break;case "group":h.parseGroup(g,a);break;case "subtitle":var l={};l.file=k(g,"url");l.kind="captions";if(0<k(g,"lang").length){var j=l;g=k(g,"lang");var t={zh:"Chinese",nl:"Dutch",en:"English",fr:"French",de:"German",it:"Italian",ja:"Japanese",pt:"Portuguese",ru:"Russian",es:"Spanish"};g=t[g]?t[g]:g;j.label=g}p.push(l)}a.hasOwnProperty("tracks")||(a.tracks=[]);for(m=0;m<p.length;m++)a.tracks.push(p[m]);return a}}(jwplayer.parsers),function(f){function c(b){for(var a=
{},c=0;c<b.childNodes.length;c++){var e=b.childNodes[c],p=h(e);if(p)switch(p.toLowerCase()){case "enclosure":a.file=k.xmlAttribute(e,"url");break;case "title":a.title=d(e);break;case "guid":a.mediaid=d(e);break;case "pubdate":a.date=d(e);break;case "description":a.description=d(e);break;case "link":a.link=d(e);break;case "category":a.tags=a.tags?a.tags+d(e):d(e)}}a=f.mediaparser.parseGroup(b,a);a=f.jwparser.parseEntry(b,a);return new jwplayer.playlist.item(a)}var k=jwplayer.utils,d=f.textContent,
e=f.getChildNode,b=f.numChildren,h=f.localName;f.rssparser={};f.rssparser.parse=function(d){for(var a=[],g=0;g<b(d);g++){var f=e(d,g);if("channel"==h(f).toLowerCase())for(var k=0;k<b(f);k++){var l=e(f,k);"item"==h(l).toLowerCase()&&a.push(c(l))}}return a}}(jwplayer.parsers),function(f){var c=f.utils,k=f._;f.playlist=function(c){var b=[];c=k.isArray(c)?c:[c];k.each(c,function(c){b.push(new f.playlist.item(c))});return b};f.playlist.filterPlaylist=function(e,b){var h=[];k.each(e,function(e){e=c.extend({},
e);e.sources=d(e.sources,!1,b);if(e.sources.length){for(var a=0;a<e.sources.length;a++)e.sources[a].label=e.sources[a].label||a.toString();h.push(e)}});return h};var d=f.playlist.filterSources=function(d,b,h){var n,a=[],g=b?f.embed.flashCanPlay:f.embed.html5CanPlay;if(d)return k.each(d,function(b){if(!b||!b.file)b=void 0;else{var d=c.trim(""+b.file),e=b.type;e||(e=c.extension(d),e=c.extensionmap.extType(e));b=c.extend({},b,{file:d,type:e})}b&&g(b.file,b.type,h)&&(n=n||b.type,b.type===n&&a.push(b))}),
a}}(jwplayer),function(f){var c=f.item=function(k){var d=jwplayer.utils,e=d.extend({},c.defaults,k),b,h;e.tracks=k&&d.exists(k.tracks)?k.tracks:[];0===e.sources.length&&(e.sources=[new f.source(e)]);for(b=0;b<e.sources.length;b++)h=e.sources[b]["default"],e.sources[b]["default"]=h?"true"==h.toString():!1,e.sources[b]=new f.source(e.sources[b]);if(e.captions&&!d.exists(k.tracks)){for(k=0;k<e.captions.length;k++)e.tracks.push(e.captions[k]);delete e.captions}for(b=0;b<e.tracks.length;b++)e.tracks[b]=
new f.track(e.tracks[b]);return e};c.defaults={description:void 0,image:void 0,mediaid:void 0,title:void 0,sources:[],tracks:[]}}(jwplayer.playlist),function(f){var c=f.utils,k=f.events,d=f.parsers;f.playlist.loader=function(){function e(a){try{var b=a.responseXML.childNodes;a="";for(var c=0;c<b.length&&!(a=b[c],8!==a.nodeType);c++);"xml"===d.localName(a)&&(a=a.nextSibling);if("rss"!==d.localName(a))h("Not a valid RSS feed");else{var e=new f.playlist(d.rssparser.parse(a));n.sendEvent(k.JWPLAYER_PLAYLIST_LOADED,
{playlist:e})}}catch(l){h()}}function b(a){h(a.match(/invalid/i)?"Not a valid RSS feed":"")}function h(a){n.sendEvent(k.JWPLAYER_ERROR,{message:a?a:"Error loading file"})}var n=new k.eventdispatcher;c.extend(this,n);this.load=function(a){c.ajax(a,e,b)}}}(jwplayer),function(f){var c=jwplayer.utils,k={file:void 0,label:void 0,type:void 0,"default":void 0};f.source=function(d){var e=c.extend({},k);c.foreach(k,function(b){c.exists(d[b])&&(e[b]=d[b],delete d[b])});e.type&&0<e.type.indexOf("/")&&(e.type=
c.extensionmap.mimeType(e.type));"m3u8"==e.type&&(e.type="hls");"smil"==e.type&&(e.type="rtmp");return e}}(jwplayer.playlist),function(f){var c=jwplayer.utils,k={file:void 0,label:void 0,kind:"captions","default":!1};f.track=function(d){var e=c.extend({},k);d||(d={});c.foreach(k,function(b){c.exists(d[b])&&(e[b]=d[b],delete d[b])});return e}}(jwplayer.playlist),function(f){function c(b,c,a){var d=b.style;d.backgroundColor="#000";d.color="#FFF";d.width=k.styleDimension(a.width);d.height=k.styleDimension(a.height);
d.display="table";d.opacity=1;a=document.createElement("p");d=a.style;d.verticalAlign="middle";d.textAlign="center";d.display="table-cell";d.font="15px/20px Arial, Helvetica, sans-serif";a.innerHTML=c.replace(":",":\x3cbr\x3e");b.innerHTML="";b.appendChild(a)}var k=f.utils,d=f.events,e=f._,b=f.embed=function(h){function n(){if(!y){var c=j.playlist;if(e.isArray(c)){if(0===c.length){m();return}if(1===c.length&&(!c[0].sources||0===c[0].sources.length||!c[0].sources[0].file)){m();return}}if(!x)if(e.isString(c))w=
new f.playlist.loader,w.addEventListener(d.JWPLAYER_PLAYLIST_LOADED,function(a){j.playlist=a.playlist;x=!1;n()}),w.addEventListener(d.JWPLAYER_ERROR,function(a){x=!1;m(a)}),x=!0,w.load(j.playlist);else if(u.getStatus()===k.loaderstatus.COMPLETE){for(c=0;c<j.modes.length;c++){var g=j.modes[c],r=g.type;if(r&&b[r]){var l=k.extend({},j),g=new b[r](D,g,l,u,h);if(g.supportsConfig())return g.addEventListener(d.ERROR,a),g.embed(),k.css("object.jwswf, .jwplayer:focus",{outline:"none"}),k.css(".jw-tab-focus:focus",
{outline:"solid 2px #0B7EF4"}),h}}j.fallback?(c="No suitable players found and fallback enabled",p(c,!0),k.log(c),new b.download(D,j,m)):(c="No suitable players found and fallback disabled",p(c,!1),k.log(c),D.parentNode.replaceChild(C,D))}}}function a(a){l(r+a.message)}function g(a){h.dispatchEvent(d.JWPLAYER_ERROR,{message:"Could not load plugin: "+a.message})}function m(a){a&&a.message?l("Error loading playlist: "+a.message):l(r+"No playable sources found")}function p(a,b){clearTimeout(F);F=setTimeout(function(){h.dispatchEvent(d.JWPLAYER_SETUP_ERROR,
{message:a,fallback:b})},0)}function l(a){y||(j.fallback?(y=!0,c(D,a,j),p(a,!0)):p(a,!1))}var j=new b.config(h.config),t=j.width,v=j.height,r="Error loading player: ",q=document.getElementById(h.id),u=f.plugins.loadPlugins(h.id,j.plugins),w,x=!1,y=!1,F=-1,C=null;j.fallbackDiv&&(C=j.fallbackDiv,delete j.fallbackDiv);j.id=h.id;j.aspectratio?h.config.aspectratio=j.aspectratio:delete h.config.aspectratio;var E=h;k.foreach(j.events,function(a,b){var c=E[a];"function"===typeof c&&c.call(E,b)});var D=document.createElement("div");
D.id=q.id;D.style.width=0<t.toString().indexOf("%")?t:t+"px";D.style.height=0<v.toString().indexOf("%")?v:v+"px";q.parentNode.replaceChild(D,q);this.embed=function(){y||(u.addEventListener(d.COMPLETE,n),u.addEventListener(d.ERROR,g),u.load())};this.destroy=function(){u&&(u.destroy(),u=null);w&&(w.resetEventListeners(),w=null)};this.errorScreen=l;return this};f.embed.errorScreen=c}(jwplayer),function(f){function c(b){if(b.playlist)for(var c=0;c<b.playlist.length;c++)b.playlist[c]=new e(b.playlist[c]);
else{var f={};d.foreach(e.defaults,function(a){k(b,f,a)});f.sources||(b.levels?(f.sources=b.levels,delete b.levels):(c={},k(b,c,"file"),k(b,c,"type"),f.sources=c.file?[c]:[]));b.playlist=[new e(f)]}}function k(b,c,e){d.exists(b[e])&&(c[e]=b[e],delete b[e])}var d=f.utils,e=f.playlist.item;(f.embed.config=function(b){var e={fallback:!0,height:270,primary:"html5",width:480,base:b.base?b.base:d.getScriptPath("jwplayer.js"),aspectratio:""};b=d.extend({},e,f.defaults,b);var e={type:"html5",src:b.base+"jwplayer.html5.js"},
k={type:"flash",src:b.base+"jwplayer.flash.swf"};b.modes="flash"===b.primary?[k,e]:[e,k];b.listbar&&(b.playlistsize=b.listbar.size,b.playlistposition=b.listbar.position,b.playlistlayout=b.listbar.layout);b.flashplayer&&(k.src=b.flashplayer);b.html5player&&(e.src=b.html5player);c(b);k=b.aspectratio;if("string"!==typeof k||!d.exists(k))e=0;else{var a=k.indexOf(":");-1===a?e=0:(e=parseFloat(k.substr(0,a)),k=parseFloat(k.substr(a+1)),e=0>=e||0>=k?0:100*(k/e)+"%")}-1===b.width.toString().indexOf("%")?
delete b.aspectratio:e?b.aspectratio=e:delete b.aspectratio;return b}).addConfig=function(b,e){c(e);return d.extend(b,e)}}(jwplayer),function(f){var c=f.utils,k=f.utils.css;f.embed.download=function(d,e,b){function f(a,b,c){a=document.createElement(a);b&&(a.className="jwdownload"+b);c&&c.appendChild(a);return a}var n=c.extend({},e),a,g=n.width?n.width:480,m=n.height?n.height:320,p;e=e.logo?e.logo:{prefix:c.repo(),file:"logo.png",margin:10};var l,j,t,v,r,q;j=n.playlist;n=["mp4","aac","mp3"];if(j&&
j.length){t=j[0];v=t.sources;for(j=0;j<v.length;j++)r=v[j],r.file&&(q=r.type||c.extensionmap.extType(c.extension(r.file)),0<=c.indexOf(n,q)?(a=r.file,p=t.image):c.isYouTube(r.file,q)&&(l=r.file));a?(b=a,d&&(a=f("a","display",d),f("div","icon",a),f("div","logo",a),b&&a.setAttribute("href",c.getAbsolutePath(b))),b="#"+d.id+" .jwdownload",d.style.width="",d.style.height="",k(b+"display",{width:c.styleDimension(Math.max(320,g)),height:c.styleDimension(Math.max(180,m)),background:"black center no-repeat "+
(p?"url("+p+")":""),backgroundSize:"contain",position:"relative",border:"none",display:"block"}),k(b+"display div",{position:"absolute",width:"100%",height:"100%"}),k(b+"logo",{top:e.margin+"px",right:e.margin+"px",background:"top right no-repeat url("+e.prefix+e.file+")"}),k(b+"icon",{background:"center no-repeat url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgNJREFUeNrs28lqwkAYB/CZqNVDDj2r6FN41QeIy8Fe+gj6BL275Q08u9FbT8ZdwVfotSBYEPUkxFOoks4EKiJdaDuTjMn3wWBO0V/+sySR8SNSqVRKIR8qaXHkzlqS9jCfzzWcTCYp9hF5o+59sVjsiRzcegSckFzcjT+ruN80TeSlAjCAAXzdJSGPFXRpAAMYwACGZQkSdhG4WCzehMNhqV6vG6vVSrirKVEw66YoSqDb7cqlUilE8JjHd/y1MQefVzqdDmiaJpfLZWHgXMHn8F6vJ1cqlVAkEsGuAn83J4gAd2RZymQygX6/L1erVQt+9ZPWb+CDwcCC2zXGJaewl/DhcHhK3DVj+KfKZrMWvFarcYNLomAv4aPRSFZVlTlcSPA5fDweW/BoNIqFnKV53JvncjkLns/n/cLdS+92O7RYLLgsKfv9/t8XlDn4eDyiw+HA9Jyz2eyt0+kY2+3WFC5hluej0Ha7zQQq9PPwdDq1Et1sNsx/nFBgCqWJ8oAK1aUptNVqcYWewE4nahfU0YQnk4ntUEfGMIU2m01HoLaCKbTRaDgKtaVLk9tBYaBcE/6Artdr4RZ5TB6/dC+9iIe/WgAMYADDpAUJAxjAAAYwgGFZgoS/AtNNTF7Z2bL0BYPBV3Jw5xFwwWcYxgtBP5OkE8i9G7aWGOOCruvauwADALMLMEbKf4SdAAAAAElFTkSuQmCC)"})):
l?(e=l,d=f("iframe","",d),d.src="http://www.youtube.com/embed/"+c.youTubeID(e),d.width=g,d.height=m,d.style.border="none"):b()}}}(jwplayer),function(f){var c=f.utils,k=f.events,d={};(f.embed.flash=function(b,h,n,a,g){function m(a,b,c){var d=document.createElement("param");d.setAttribute("name",b);d.setAttribute("value",c);a.appendChild(d)}function p(a,b,c){return function(){try{c&&document.getElementById(g.id+"_wrapper").appendChild(b);var d=document.getElementById(g.id).getPluginConfig("display");
"function"===typeof a.resize&&a.resize(d.width,d.height);b.style.left=d.x;b.style.top=d.h}catch(e){}}}function l(a){if(!a)return{};var b={},d=[];c.foreach(a,function(a,e){var g=c.getPluginName(a);d.push(a);c.foreach(e,function(a,c){b[g+"."+a]=c})});b.plugins=d.join(",");return b}var j=new f.events.eventdispatcher,t=c.flashVersion();c.extend(this,j);this.embed=function(){n.id=g.id;if(10>t)return j.sendEvent(k.ERROR,{message:"Flash version must be 10.0 or greater"}),!1;var e,f,q=g.config.listbar,u=
c.extend({},n);if(b.id+"_wrapper"===b.parentNode.id)e=document.getElementById(b.id+"_wrapper");else{e=document.createElement("div");f=document.createElement("div");f.style.display="none";f.id=b.id+"_aspect";e.id=b.id+"_wrapper";e.style.position="relative";e.style.display="block";e.style.width=c.styleDimension(u.width);e.style.height=c.styleDimension(u.height);if(g.config.aspectratio){var w=parseFloat(g.config.aspectratio);f.style.display="block";f.style.marginTop=g.config.aspectratio;e.style.height=
"auto";e.style.display="inline-block";q&&("bottom"===q.position?f.style.paddingBottom=q.size+"px":"right"===q.position&&(f.style.marginBottom=-1*q.size*(w/100)+"px"))}b.parentNode.replaceChild(e,b);e.appendChild(b);e.appendChild(f)}e=a.setupPlugins(g,u,p);0<e.length?c.extend(u,l(e.plugins)):delete u.plugins;"undefined"!==typeof u["dock.position"]&&"false"===u["dock.position"].toString().toLowerCase()&&(u.dock=u["dock.position"],delete u["dock.position"]);e=u.wmode||(u.height&&40>=u.height?"transparent":
"opaque");f="height width modes events primary base fallback volume".split(" ");for(q=0;q<f.length;q++)delete u[f[q]];f=c.getCookies();c.foreach(f,function(a,b){"undefined"===typeof u[a]&&(u[a]=b)});f=window.location.href.split("/");f.splice(f.length-1,1);f=f.join("/");u.base=f+"/";d[b.id]=u;c.isMSIE()?(f='\x3cobject classid\x3d"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" " width\x3d"100%" height\x3d"100%"id\x3d"'+b.id+'" name\x3d"'+b.id+'" tabindex\x3d0""\x3e',f+='\x3cparam name\x3d"movie" value\x3d"'+
h.src+'"\x3e',f+='\x3cparam name\x3d"allowfullscreen" value\x3d"true"\x3e\x3cparam name\x3d"allowscriptaccess" value\x3d"always"\x3e',f+='\x3cparam name\x3d"seamlesstabbing" value\x3d"true"\x3e',f+='\x3cparam name\x3d"wmode" value\x3d"'+e+'"\x3e',f+='\x3cparam name\x3d"bgcolor" value\x3d"#000000"\x3e',f+="\x3c/object\x3e",b.outerHTML=f,e=document.getElementById(b.id)):(f=document.createElement("object"),f.setAttribute("type","application/x-shockwave-flash"),f.setAttribute("data",h.src),f.setAttribute("width",
"100%"),f.setAttribute("height","100%"),f.setAttribute("bgcolor","#000000"),f.setAttribute("id",b.id),f.setAttribute("name",b.id),f.className="jwswf",m(f,"allowfullscreen","true"),m(f,"allowscriptaccess","always"),m(f,"seamlesstabbing","true"),m(f,"wmode",e),b.parentNode.replaceChild(f,b),e=f);g.config.aspectratio&&(e.style.position="absolute");g.container=e;g.setPlayer(e,"flash")};this.supportsConfig=function(){if(t)if(n){if("string"===c.typeOf(n.playlist))return!0;try{var a=n.playlist[0].sources;
if("undefined"===typeof a)return!0;for(var b=0;b<a.length;b++)if(a[b].file&&e(a[b].file,a[b].type))return!0}catch(d){}}else return!0;return!1}}).getVars=function(b){return d[b]};var e=f.embed.flashCanPlay=function(b,d){if(c.isYouTube(b,d)||c.isRtmp(b,d)||"hls"===d)return!0;var e=c.extensionmap[d?d:c.extension(b)];return!e?!1:!!e.flash}}(jwplayer),function(f){var c=f.utils,k=c.extensionmap,d=f.events;f.embed.html5=function(e,b,h,k,a){function g(a,b,c){return function(){try{var d=document.querySelector("#"+
e.id+" .jwmain");c&&d.appendChild(b);"function"===typeof a.resize&&(a.resize(d.clientWidth,d.clientHeight),setTimeout(function(){a.resize(d.clientWidth,d.clientHeight)},400));b.left=d.style.left;b.top=d.style.top}catch(f){}}}function m(a){p.sendEvent(a.type,{message:"HTML5 player not found"})}var p=this,l=new d.eventdispatcher;c.extend(p,l);p.embed=function(){if(f.html5){k.setupPlugins(a,h,g);e.innerHTML="";var j=f.utils.extend({},h);delete j.volume;j=new f.html5.player(j);a.container=document.getElementById(a.id);
a.setPlayer(j,"html5")}else j=new c.scriptloader(b.src),j.addEventListener(d.ERROR,m),j.addEventListener(d.COMPLETE,p.embed),j.load()};p.supportsConfig=function(){if(f.vid.canPlayType)try{if("string"===c.typeOf(h.playlist))return!0;for(var a=h.playlist[0].sources,b=0;b<a.length;b++)if(f.embed.html5CanPlay(a[b].file,a[b].type,h.androidhls))return!0}catch(d){}return!1}};f.embed.html5CanPlay=function(d,b,h){if(null!==navigator.userAgent.match(/BlackBerry/i)||c.isIE(9))return!1;if(c.isYouTube(d,b))return!0;
var n=c.extension(d);b=b||k.extType(n);if("hls"===b)if(h){h=c.isAndroidNative;if(h(2)||h(3)||h("4.0"))return!1;if(c.isAndroid())return!0}else if(c.isAndroid())return!1;if(c.isRtmp(d,b))return!1;d=k[b]||k[n];if(!d||d.flash&&!d.html5)return!1;var a;a:if(d=d.html5){try{a=!!f.vid.canPlayType(d);break a}catch(g){}a=!1}else a=!0;return a}}(jwplayer),function(f){var c=f.embed,k=f.embed.html5CanPlay,d=f.utils,e=f._,b=/\.(js|swf)$/;f.cast=f.cast||{};f.embed=d.extend(function(e){function k(){w="Adobe SiteCatalyst Error: Could not find Media Module"}
var a=d.repo(),g=d.extend({},f.defaults),m=d.extend({},g,e.config),p=e.config,l=m.plugins,j=m.analytics,t=a+"jwpsrv.js",v=a+"sharing.js",r=a+"related.js",q=a+"gapro.js",g=f.key?f.key:g.key,u=(new f.utils.key(g)).edition(),w,l=l?l:{};"ads"==u&&m.advertising&&(b.test(m.advertising.client)?l[m.advertising.client]=m.advertising:l[a+m.advertising.client+".js"]=m.advertising);delete p.advertising;p.key=g;m.analytics&&b.test(m.analytics.client)&&(t=m.analytics.client);delete p.analytics;j&&!("ads"===u||
"enterprise"===u)&&delete j.enabled;if("free"==u||!j||!1!==j.enabled)l[t]=j?j:{};delete l.sharing;delete l.related;switch(u){case "ads":case "enterprise":if(p.sitecatalyst)try{window.s&&window.s.hasOwnProperty("Media")?new f.embed.sitecatalyst(e):k()}catch(x){k()}case "premium":m.related&&(b.test(m.related.client)&&(r=m.related.client),l[r]=m.related),m.ga&&(b.test(m.ga.client)&&(q=m.ga.client),l[q]=m.ga);case "pro":m.sharing&&(b.test(m.sharing.client)&&(v=m.sharing.client),l[v]=m.sharing),m.skin&&
(p.skin=m.skin.replace(/^(beelden|bekle|five|glow|modieus|roundster|stormtrooper|vapor)$/i,d.repo()+"skins/$1.xml"))}p.plugins=l;e.config=p;e=new c(e);w&&e.errorScreen(w);return e},f.embed);f.embed.html5CanPlay=function(b,c){var a;var d={file:b,type:c};a=f.html5&&f.html5.chooseProvider?f.html5.chooseProvider(d)!==f.html5.VideoProvider:e.any(f.unregisteredProviders,function(a){return a.supports(d)});return a?!0:k.apply(this,arguments)}}(jwplayer),function(f){var c=jwplayer.utils;f.sitecatalyst=function(f){function d(b){a.debug&&
c.log(b)}function e(a){a=a.split("/");a=a[a.length-1];a=a.split("?");return a[0]}function b(){if(!j){j=!0;var a=n.getPosition();d("stop: "+m+" : "+a);s.Media.stop(m,a)}}function h(){t||(b(),t=!0,d("close: "+m),s.Media.close(m),v=!0,l=0)}var n=f,a=c.extend({},n.config.sitecatalyst),g={onPlay:function(){if(!v){var a=n.getPosition();j=!1;d("play: "+m+" : "+a);s.Media.play(m,a)}},onPause:b,onBuffer:b,onIdle:h,onPlaylistItem:function(b){try{v=!0;h();l=0;var d;if(a.mediaName)d=a.mediaName;else{var f=n.getPlaylistItem(b.index);
d=f.title?f.title:f.file?e(f.file):f.sources&&f.sources.length?e(f.sources[0].file):""}m=d;p=a.playerName?a.playerName:n.id}catch(g){c.log(g)}},onTime:function(){if(v){var a=n.getDuration();if(-1==a)return;t=j=v=!1;d("open: "+m+" : "+a+" : "+p);s.Media.open(m,a,p);d("play: "+m+" : 0");s.Media.play(m,0)}a=n.getPosition();if(3<=Math.abs(a-l)){var b=l;d("seek: "+b+" to "+a);d("stop: "+m+" : "+b);s.Media.stop(m,b);d("play: "+m+" : "+a);s.Media.play(m,a)}l=a},onComplete:h},m,p,l,j=!0,t=!0,v;c.foreach(g,
function(a){n[a](g[a])})}}(jwplayer.embed),function(f){function c(b,c){b[c]&&(b[c]=k.getAbsolutePath(b[c]))}var k=f.utils,d=f._,e=window.location.href;f.cast.setupCastConfig=function(b,d){var f=k.extend({},b.config);f.cast=k.extend({pageUrl:e},d);for(var a="base autostart controls fallback fullscreen width height mobilecontrols modes playlistlayout playlistposition playlistsize primary stretching sharing related ga skin logo listbar".split(" "),g=a.length;g--;)delete f[a[g]];a=f.plugins;delete f.plugins;
for(var m in a)if(a.hasOwnProperty(m)){var p=a[m];if(p.client&&(/[\.\/]/.test(p.client)&&c(p,"client"),-1<p.client.indexOf("vast"))){g=f;p=k.extend({},p);p.client="vast";delete p.companiondiv;if(p.schedule){var l=void 0;for(l in p.schedule)p.schedule.hasOwnProperty(l)&&c(p.schedule[l].ad||p.schedule[l],"tag")}c(p,"tag");g.advertising=p}}b.position&&(f.position=b.position);0<b.item&&(f.item=b.item);f.captionLabel=k.getCookies().captionLabel;return f};f.cast.setupFlashCastConfig=function(b){var c=b.config;
c.playlist=b.getPlaylist();var e;(e=d.find(c.plugins,function(a,b){return 0<b.indexOf("vast.js")}))?(e.client="vast",e={advertising:e}):e={};c=d.pick(c,"id captionLabel cast key playlist repeat".split(" "));c.cast.pageUrl=window.location.href;k.extend(c,{captionLabel:k.getCookies().captionLabel,volume:b.getVolume(),mute:b.getMute(),id:b.id,position:b.getPosition(),item:b.getPlaylistIndex()},e);return c}}(window.jwplayer),function(f,c){function k(a,b){a[b]&&(a[b]=e.getAbsolutePath(a[b]))}var d=c.cast,
e=c.utils,b=c.events,h=b.state,n={};d.NS="urn:x-cast:com.longtailvideo.jwplayer";d.debug=!1;d.availability=null;d.available=function(a){a=a||d.availability;var b=f.chrome,c="available";b.cast&&b.cast.ReceiverAvailability&&(c=b.cast.ReceiverAvailability.AVAILABLE);return a===c};d.controller=function(a,g){var m,p;function l(a,b){d.log("send command",a,b);var c={command:a};void 0!==b&&(c.args=b);z.sendMessage(d.NS,c,M,function(a){d.log("error message",a);"Invalid namespace"===a.description&&w()})}function j(a){a=
!!d.available(a.availability);N.available!==a&&(N.available=a,q(b.JWPLAYER_CAST_AVAILABLE))}function t(a){d.log("existing session",a);!z&&!H&&(H=a.session,H.addMessageListener(d.NS,v))}function v(e,f){var j=JSON.parse(f);if(!j)throw"Message not proper JSON";if(j.reconcile){H.removeMessageListener(d.NS,v);var h=j.diff,k=H;if(!h.id||!j.appid||!j.pageUrl)h.id=c().id,j.appid=G.appid,j.pageUrl=O,H=z=null;h.id===a.id&&(j.appid===G.appid&&j.pageUrl===O)&&(z||(a.jwInstreamState()&&a.jwInstreamDestroy(!0),
y(k),g.sendEvent(b.JWPLAYER_PLAYER_STATE,{oldstate:h.oldstate,newstate:h.newstate})),J(j));H=null}}function r(a){N.active=!!a;a=N;var c;c=z&&z.receiver?z.receiver.friendlyName:"";a.deviceName=c;q(b.JWPLAYER_CAST_SESSION,{})}function q(a){var b=e.extend({},N);g.sendEvent(a,b)}function u(a){var b=f.chrome;a.code!==b.cast.ErrorCode.CANCEL&&(d.log("Cast Session Error:",a,z),a.code===b.cast.ErrorCode.SESSION_ERROR&&w())}function w(){z?(E(),z.stop(C,x)):C()}function x(a){d.error("Cast Session Stop error:",
a,z);C()}function y(j){d.log("Session started:",j);z=j;z.addMessageListener(d.NS,D);z.addUpdateListener(F);a.jwPause(!0);a.jwSetFullscreen(!1);L=g.getVideo();m=g.volume;p=g.mute;B=new d.provider(l);B.init();g.setVideoProvider(B);a.jwPlay=function(a){!1===a?B.pause():B.play()};a.jwPause=function(b){a.jwPlay(!!b)};a.jwLoad=function(a){"number"===e.typeOf(a)&&g.setItem(a);B.load(a)};a.jwPlaylistItem=function(a){"number"===e.typeOf(a)&&g.setItem(a);B.playlistItem(a)};a.jwPlaylistNext=function(){a.jwPlaylistItem(g.item+
1)};a.jwPlaylistPrev=function(){a.jwPlaylistItem(g.item-1)};a.jwSetVolume=function(a){e.exists(a)&&(a=Math.min(Math.max(0,a),100)|0,P(a)&&(a=Math.max(0,Math.min(a/100,1)),z.setReceiverVolumeLevel(a,K,function(a){d.error("set volume error",a);K()})))};a.jwSetMute=function(a){e.exists(a)||(a=!I.mute);Q(a)&&z.setReceiverMuted(!!a,K,function(a){d.error("set muted error",a);K()})};a.jwGetVolume=function(){return I.volume|0};a.jwGetMute=function(){return!!I.mute};a.jwIsBeforePlay=function(){return!1};var k=
a.jwSetCurrentCaptions;a.jwSetCurrentCaptions=function(a){k(a);B.sendCommand("caption",a)};a.jwSkipAd=function(a){A&&(A.skipAd(a),a=A.getAdModel(),a.complete=!0,g.sendEvent(b.JWPLAYER_CAST_AD_CHANGED,a))};a.jwClickAd=function(d){if(A&&300<A.timeSinceClick()&&(A.clickAd(d),g.state!==h.PAUSED)){var e={tag:d.tag};d.sequence&&(e.sequence=d.sequence);d.podcount&&(e.podcount=d.podcount);c(a.id).dispatchEvent(b.JWPLAYER_AD_CLICK,e);f.open(d.clickthrough)}};a.jwPlayAd=a.jwPauseAd=a.jwSetControls=a.jwForceState=
a.jwReleaseState=a.jwSetFullscreen=a.jwDetachMedia=a.jwAttachMedia=M;var n=c(a.id).plugins;n.vast&&n.vast.jwPauseAd!==M&&(R={jwPlayAd:n.vast.jwPlayAd,jwPauseAd:n.vast.jwPauseAd},n.vast.jwPlayAd=n.vast.jwPauseAd=M);K();r(!0);j!==H&&B.setup(S(),g)}function F(a){d.log("Cast Session status",a);a?K():(B.sendEvent(b.JWPLAYER_PLAYER_STATE,{oldstate:g.state,newstate:h.BUFFERING}),C())}function C(){d.log("_sessionStopped");z&&(E(),z=null);if(L){delete a.jwSkipAd;delete a.jwClickAd;a.initializeAPI();var f=
c(a.id).plugins;f.vast&&e.extend(f.vast,R);g.volume=m;g.mute=p;g.setVideoProvider(L);g.duration=0;B&&(B.destroy(),B=null);A&&(A.destroy(),A=null);g.state!==h.IDLE?e.isIPad()||e.isIPod()?(a.jwStop(!0),L.sendEvent(b.JWPLAYER_PLAYER_STATE,{oldstate:h.BUFFERING,newstate:h.IDLE})):(g.state=h.IDLE,a.jwPlay(!0),a.jwSeek(g.position)):L.sendEvent(b.JWPLAYER_PLAYER_STATE,{oldstate:h.BUFFERING,newstate:h.IDLE});L=null}r(!1)}function E(){z.removeUpdateListener(F);z.removeMessageListener(d.NS,D)}function D(a,
b){var c=JSON.parse(b);if(!c)throw"Message not proper JSON";J(c)}function J(c){if("state"===c.type){if(A&&(c.diff.newstate||c.diff.position))A.destroy(),A=null,g.setVideoProvider(B),g.sendEvent(b.JWPLAYER_CAST_AD_CHANGED,{done:!0});B.updateModel(c.diff,c.type);c=c.diff;void 0!==c.item&&g.item!==c.item&&(g.item=c.item,g.sendEvent(b.JWPLAYER_PLAYLIST_ITEM,{index:g.item}))}else if("ad"===c.type){null===A&&(A=new d.adprovider(d.NS,z),A.init(),g.setVideoProvider(A));A.updateModel(c.diff,c.type);var e=
A.getAdModel();c.diff.clickthrough&&(e.onClick=a.jwClickAd);c.diff.skipoffset&&(e.onSkipAd=a.jwSkipAd);g.sendEvent(b.JWPLAYER_CAST_AD_CHANGED,e);c.diff.complete&&A.resetAdModel()}else"connection"===c.type?!0===c.closed&&w():d.error("received unhandled message",c.type,c)}function S(){var a=e.extend({},g.config);a.cast=e.extend({pageUrl:O},G);for(var b="base autostart controls fallback fullscreen width height mobilecontrols modes playlistlayout playlistposition playlistsize primary stretching sharing related ga skin logo listbar".split(" "),
c=b.length;c--;)delete a[b[c]];b=a.plugins;delete a.plugins;for(var d in b)if(b.hasOwnProperty(d)){var f=b[d];if(f.client&&(/[\.\/]/.test(f.client)&&k(f,"client"),-1<f.client.indexOf("vast"))){c=a;f=e.extend({},f);f.client="vast";delete f.companiondiv;if(f.schedule){var j=void 0;for(j in f.schedule)f.schedule.hasOwnProperty(j)&&k(f.schedule[j].ad||f.schedule[j],"tag")}k(f,"tag");c.advertising=f}}g.position&&(a.position=g.position);0<g.item&&(a.item=g.item);a.captionLabel=e.getCookies().captionLabel;
return a}function K(){if(z&&z.receiver){var a=z.receiver.volume;if(a){var b=100*a.level|0;Q(!!a.muted);P(b)}}}function P(a){var c=I.volume!==a;c&&(I.volume=a,B.sendEvent(b.JWPLAYER_MEDIA_VOLUME,{volume:a}));return c}function Q(a){var c=I.mute!==a;c&&(I.mute=a,B.sendEvent(b.JWPLAYER_MEDIA_MUTE,{mute:a}));return c}function M(){}var z=null,N={available:!1,active:!1,deviceName:""},I={volume:null,mute:null},O=e.getAbsolutePath(f.location.href),G,B=null,A=null,L=null;m=g.volume;p=g.mute;var H=null,R=null;
G=e.extend({},n,g.cast);k(G,"loadscreen");k(G,"endscreen");k(G,"logo");if(G.appid&&(!f.cast||!f.cast.receiver))d.loader.addEventListener("availability",j),d.loader.addEventListener("session",t),d.loader.initialize(G.appid);this.startCasting=function(){z||a.jwInstreamState()||f.chrome.cast.requestSession(y,u)};this.stopCasting=w};d.log=function(){if(d.debug){var a=Array.prototype.slice.call(arguments,0);console.log.apply(console,a)}};d.error=function(){var a=Array.prototype.slice.call(arguments,0);
console.error.apply(console,a)}}(window,jwplayer),function(f){function c(a){p.log("existing session",a);!y&&!w&&(w=a.session,w.addMessageListener(p.NS,k))}function k(a,c){var d=JSON.parse(c),e=w;if(!d)throw"Message not proper JSON";if(d.reconcile){w.removeMessageListener(p.NS,k);d.receiverFriendlyName=w.receiver.friendlyName;if(!d.pageUrl||!d.diff.id||!d.appid)d.pageUrl=x,d.diff.id=f().id,d.appid=u,w=y=null;r[d.diff.id]&&(u===d.appid&&d.pageUrl===x)&&(v=d.diff.id,u=d.appid,g(v,"jwInstreamDestroy"),
b(e),g(v,q.message,d),w=null)}}function d(){y&&(y.removeUpdateListener(a),y.removeMessageListener(p.NS,h),y.stop(l.noop,n.bind(this)),y=null);g(v,q.cleanup)}function e(a,b){y.sendMessage(p.NS,{command:a,args:b},l.noop,function(a){p.error("message send error",a)})}function b(b){var c=f(v);y=b;y.addMessageListener(p.NS,h);y.addUpdateListener(a);c=f.cast.setupFlashCastConfig(c);w!==y&&e("setup",c);g(v,q.connected,{receiverFriendlyName:b.receiver.friendlyName})}function h(a,b){if(b){var c=JSON.parse(b);
if(!c)throw"Message not proper JSON";g(v,q.message,c)}}function n(a){g(v,q.error,a||{})}function a(a){a||d()}function g(a,b,c){c?f(a).callInternal(b,c):f(a).callInternal(b)}function m(){}var p=f.cast,l=f.utils,j=f._,t=window.chrome||{},v,r={},q={},u,w,x=l.getAbsolutePath(window.location.href),y;p.NS="urn:x-cast:com.longtailvideo.jwplayer";p.flash={checkAvailability:function(a,b,d){q=d;u=b;r[a]=!0;p.loader.addEventListener("availability",function(b){"available"===b.availability&&g(a,q.available,b)});
p.loader.addEventListener("session",c);p.loader.initialize(b)},startCasting:function(a){v=a;t.cast.requestSession(b.bind(this),n.bind(this))},stopCasting:d,mute:function(a){y.setReceiverMuted(a,m,function(a){p.error("set muted error",a)})},volume:function(a){a=Math.max(0,Math.min(a/100,1));y.setReceiverVolumeLevel(a,m,function(a){p.error("set volume error",a)})},messageReceiver:e,canCastItem:function(a){return j.any(a.levels,function(a){return f.embed.html5CanPlay(a.file,a.type)})}}}(window.jwplayer),
function(f,c){function k(){c&&c.cast&&c.cast.isAvailable&&!a.apiConfig?(a.apiConfig=new c.cast.ApiConfig(new c.cast.SessionRequest(j),h,n,c.cast.AutoJoinPolicy.ORIGIN_SCOPED),c.cast.initialize(a.apiConfig,b,e)):15>l++&&setTimeout(k,1E3)}function d(){p&&(p.resetEventListeners(),p=null)}function e(){a.apiConfig=null}function b(){}function h(b){t.sendEvent("session",{session:b});b.sendMessage(a.NS,{whoami:1})}function n(b){a.availability=b;t.sendEvent("availability",{availability:b})}window.chrome=c;
var a=f.cast,g=f.utils,m=f.events,p,l=0,j=null,t=g.extend({initialize:function(b){j=b;null!==a.availability?t.sendEvent("availability",{availability:a.availability}):c&&c.cast?k():p||(p=new g.scriptloader("https://www.gstatic.com/cv/js/sender/v1/cast_sender.js"),p.addEventListener(m.ERROR,d),p.addEventListener(m.COMPLETE,k),p.load())}},new m.eventdispatcher("cast.loader"));f.cast.loader=t}(window.jwplayer,window.chrome||{}),function(f,c){var k=[],d=f.utils,e=f.events,b=e.state,h="getBuffer getCaptionsList getControls getCurrentCaptions getCurrentQuality getCurrentAudioTrack getDuration getFullscreen getHeight getLockState getMute getPlaylistIndex getSafeRegion getPosition getQualityLevels getState getVolume getWidth isBeforeComplete isBeforePlay releaseState".split(" "),
n="playlistNext stop forceState playlistPrev seek setCurrentCaptions setControls setCurrentQuality setVolume setCurrentAudioTrack".split(" "),a={onBufferChange:e.JWPLAYER_MEDIA_BUFFER,onBufferFull:e.JWPLAYER_MEDIA_BUFFER_FULL,onError:e.JWPLAYER_ERROR,onSetupError:e.JWPLAYER_SETUP_ERROR,onFullscreen:e.JWPLAYER_FULLSCREEN,onMeta:e.JWPLAYER_MEDIA_META,onMute:e.JWPLAYER_MEDIA_MUTE,onPlaylist:e.JWPLAYER_PLAYLIST_LOADED,onPlaylistItem:e.JWPLAYER_PLAYLIST_ITEM,onPlaylistComplete:e.JWPLAYER_PLAYLIST_COMPLETE,
onReady:e.API_READY,onResize:e.JWPLAYER_RESIZE,onComplete:e.JWPLAYER_MEDIA_COMPLETE,onSeek:e.JWPLAYER_MEDIA_SEEK,onTime:e.JWPLAYER_MEDIA_TIME,onVolume:e.JWPLAYER_MEDIA_VOLUME,onBeforePlay:e.JWPLAYER_MEDIA_BEFOREPLAY,onBeforeComplete:e.JWPLAYER_MEDIA_BEFORECOMPLETE,onDisplayClick:e.JWPLAYER_DISPLAY_CLICK,onControls:e.JWPLAYER_CONTROLS,onQualityLevels:e.JWPLAYER_MEDIA_LEVELS,onQualityChange:e.JWPLAYER_MEDIA_LEVEL_CHANGED,onCaptionsList:e.JWPLAYER_CAPTIONS_LIST,onCaptionsChange:e.JWPLAYER_CAPTIONS_CHANGED,
onAdError:e.JWPLAYER_AD_ERROR,onAdClick:e.JWPLAYER_AD_CLICK,onAdImpression:e.JWPLAYER_AD_IMPRESSION,onAdTime:e.JWPLAYER_AD_TIME,onAdComplete:e.JWPLAYER_AD_COMPLETE,onAdCompanions:e.JWPLAYER_AD_COMPANIONS,onAdSkipped:e.JWPLAYER_AD_SKIPPED,onAdPlay:e.JWPLAYER_AD_PLAY,onAdPause:e.JWPLAYER_AD_PAUSE,onAdMeta:e.JWPLAYER_AD_META,onCast:e.JWPLAYER_CAST_SESSION,onAudioTrackChange:e.JWPLAYER_AUDIO_TRACK_CHANGED,onAudioTracks:e.JWPLAYER_AUDIO_TRACKS},g={onBuffer:b.BUFFERING,onPause:b.PAUSED,onPlay:b.PLAYING,
onIdle:b.IDLE};f.api=function(k){function p(a,b){d.foreach(a,function(a,c){q[a]=function(a){return b(c,a)}})}function l(a,b){var c="jw"+b.charAt(0).toUpperCase()+b.slice(1);q[b]=function(){var b=r.apply(this,[c].concat(Array.prototype.slice.call(arguments,0)));return a?q:b}}function j(a){F=[];E&&E.destroy&&E.destroy();f.api.destroyPlayer(a.id)}function t(a,b){try{a.jwAddEventListener(b,'function(dat) { jwplayer("'+q.id+'").dispatchEvent("'+b+'", dat); }')}catch(c){if("flash"===q.renderingMode){var e=
document.createElement("a");e.href=x.data;e.protocol!==location.protocol&&d.log("Warning: Your site ["+location.protocol+"] and JWPlayer ["+e.protocol+"] are hosted using different protocols")}d.log("Could not add internal listener")}}function v(a,b){u[a]||(u[a]=[],x&&y&&t(x,a));u[a].push(b);return q}function r(){if(y){if(x){var a=Array.prototype.slice.call(arguments,0),b=a.shift();if("function"===typeof x[b]){switch(a.length){case 6:return x[b](a[0],a[1],a[2],a[3],a[4],a[5]);case 5:return x[b](a[0],
a[1],a[2],a[3],a[4]);case 4:return x[b](a[0],a[1],a[2],a[3]);case 3:return x[b](a[0],a[1],a[2]);case 2:return x[b](a[0],a[1]);case 1:return x[b](a[0])}return x[b]()}}return null}F.push(arguments)}var q=this,u={},w={},x,y=!1,F=[],C,E,D={},J={};q.container=k;q.id=k.id;q.setup=function(a){if(f.embed){var b=document.getElementById(q.id);b&&(a.fallbackDiv=b);j(q);b=f(q.id);b.config=a;E=new f.embed(b);E.embed();return b}return q};q.getContainer=function(){return q.container};q.addButton=function(a,b,c,
e){try{J[e]=c,r("jwDockAddButton",a,b,'jwplayer("'+q.id+'").callback("'+e+'")',e)}catch(f){d.log("Could not add dock button"+f.message)}};q.removeButton=function(a){r("jwDockRemoveButton",a)};q.callback=function(a){if(J[a])J[a]()};q.getMeta=function(){return q.getItemMeta()};q.getPlaylist=function(){var a=r("jwGetPlaylist");"flash"===q.renderingMode&&d.deepReplaceKeyName(a,["__dot__","__spc__","__dsh__","__default__"],["."," ","-","default"]);return a};q.getPlaylistItem=function(a){d.exists(a)||(a=
q.getPlaylistIndex());return q.getPlaylist()[a]};q.getRenderingMode=function(){return q.renderingMode};q.setFullscreen=function(a){d.exists(a)?r("jwSetFullscreen",a):r("jwSetFullscreen",!r("jwGetFullscreen"));return q};q.setMute=function(a){d.exists(a)?r("jwSetMute",a):r("jwSetMute",!r("jwGetMute"));return q};q.lock=function(){return q};q.unlock=function(){return q};q.load=function(a){r("jwInstreamDestroy");f(q.id).plugins.googima&&r("jwDestroyGoogima");r("jwLoad",a);return q};q.playlistItem=function(a){r("jwPlaylistItem",
parseInt(a,10));return q};q.resize=function(a,b){if("flash"!==q.renderingMode)r("jwResize",a,b);else{var c=document.getElementById(q.id+"_wrapper"),e=document.getElementById(q.id+"_aspect");e&&(e.style.display="none");c&&(c.style.display="block",c.style.width=d.styleDimension(a),c.style.height=d.styleDimension(b))}return q};q.play=function(a){if(a!==c)return r("jwPlay",a),q;a=q.getState();var d=C&&C.getState();d&&(d===b.IDLE||d===b.PLAYING||d===b.BUFFERING?r("jwInstreamPause"):r("jwInstreamPlay"));
a===b.PLAYING||a===b.BUFFERING?r("jwPause"):r("jwPlay");return q};q.pause=function(a){a===c?(a=q.getState(),a===b.PLAYING||a===b.BUFFERING?r("jwPause"):r("jwPlay")):r("jwPause",a);return q};q.createInstream=function(){return new f.api.instream(this,x)};q.setInstream=function(a){return C=a};q.loadInstream=function(a,b){C=q.setInstream(q.createInstream()).init(b);C.loadItem(a);return C};q.destroyPlayer=function(){r("jwPlayerDestroy")};q.playAd=function(a){var b=f(q.id).plugins;b.vast?b.vast.jwPlayAd(a):
r("jwPlayAd",a)};q.pauseAd=function(){var a=f(q.id).plugins;a.vast?a.vast.jwPauseAd():r("jwPauseAd")};p(g,function(a,b){w[a]||(w[a]=[],v(e.JWPLAYER_PLAYER_STATE,function(b){var c=b.newstate;b=b.oldstate;if(c===a){var d=w[c];if(d)for(var e=0;e<d.length;e++){var f=d[e];"function"===typeof f&&f.call(this,{oldstate:b,newstate:c})}}}));w[a].push(b);return q});p(a,v);d.foreach(h,function(a,b){l(!1,b)});d.foreach(n,function(a,b){l(!0,b)});q.remove=function(){if(!y)throw"Cannot call remove() before player is ready";
j(this)};q.registerPlugin=function(a,b,c,d){f.plugins.registerPlugin(a,b,c,d)};q.setPlayer=function(a,b){x=a;q.renderingMode=b};q.detachMedia=function(){if("html5"===q.renderingMode)return r("jwDetachMedia")};q.attachMedia=function(a){if("html5"===q.renderingMode)return r("jwAttachMedia",a)};q.getAudioTracks=function(){return r("jwGetAudioTracks")};q.removeEventListener=function(a,b){var c=u[a];if(c)for(var d=c.length;d--;)c[d]===b&&c.splice(d,1)};q.dispatchEvent=function(a,b){var c=u[a];if(c)for(var c=
c.slice(0),f=d.translateEventResponse(a,b),g=0;g<c.length;g++){var j=c[g];if("function"===typeof j)try{a===e.JWPLAYER_PLAYLIST_LOADED&&d.deepReplaceKeyName(f.playlist,["__dot__","__spc__","__dsh__","__default__"],["."," ","-","default"]),j.call(this,f)}catch(h){d.log("There was an error calling back an event handler",h)}}};q.dispatchInstreamEvent=function(a){C&&C.dispatchEvent(a,arguments)};q.callInternal=r;q.playerReady=function(a){y=!0;x||q.setPlayer(document.getElementById(a.id));q.container=document.getElementById(q.id);
d.foreach(u,function(a){t(x,a)});v(e.JWPLAYER_PLAYLIST_ITEM,function(){D={}});v(e.JWPLAYER_MEDIA_META,function(a){d.extend(D,a.metadata)});v(e.JWPLAYER_VIEW_TAB_FOCUS,function(a){var b=q.getContainer();!0===a.hasFocus?d.addClass(b,"jw-tab-focus"):d.removeClass(b,"jw-tab-focus")});for(q.dispatchEvent(e.API_READY);0<F.length;)r.apply(this,F.shift())};q.getItemMeta=function(){return D};return q};f.playerReady=function(a){var b=f.api.playerById(a.id);b||(b=f.api.selectPlayer(a.id));b.playerReady(a)};
f.api.selectPlayer=function(a){var b;d.exists(a)||(a=0);a.nodeType?b=a:"string"===typeof a&&(b=document.getElementById(a));return b?(a=f.api.playerById(b.id))?a:f.api.addPlayer(new f.api(b)):"number"===typeof a?k[a]:null};f.api.playerById=function(a){for(var b=0;b<k.length;b++)if(k[b].id===a)return k[b];return null};f.api.addPlayer=function(a){for(var b=0;b<k.length;b++)if(k[b]===a)return a;k.push(a);return a};f.api.destroyPlayer=function(a){var b,e,f;d.foreach(k,function(c,d){d.id===a&&(b=c,e=d)});
if(b===c||e===c)return null;d.clearCss("#"+e.id);if(f=document.getElementById(e.id+("flash"===e.renderingMode?"_wrapper":""))){"html5"===e.renderingMode&&e.destroyPlayer();var g=document.createElement("div");g.id=e.id;f.parentNode.replaceChild(g,f)}k.splice(b,1);return null}}(window.jwplayer),function(f){var c=f.events,k=f.utils,d=c.state;f.api.instream=function(e,b){function f(a,c){m[a]||(m[a]=[],b.jwInstreamAddEventListener(a,'function(dat) { jwplayer("'+e.id+'").dispatchInstreamEvent("'+a+'", dat); }'));
m[a].push(c);return this}function n(a,b){p[a]||(p[a]=[],f(c.JWPLAYER_PLAYER_STATE,function(b){var c=b.newstate,d=b.oldstate;if(c===a){var e=p[c];if(e)for(var f=0;f<e.length;f++){var g=e[f];"function"===typeof g&&g.call(this,{oldstate:d,newstate:c,type:b.type})}}}));p[a].push(b);return this}var a,g,m={},p={},l=this;l.type="instream";l.init=function(){e.callInternal("jwInitInstream");return l};l.loadItem=function(b,c){a=b;g=c||{};"array"===k.typeOf(b)?e.callInternal("jwLoadArrayInstream",a,g):e.callInternal("jwLoadItemInstream",
a,g)};l.removeEvents=function(){m=p={}};l.removeEventListener=function(a,b){var c=m[a];if(c)for(var d=c.length;d--;)c[d]===b&&c.splice(d,1)};l.dispatchEvent=function(a,b){var c=m[a];if(c)for(var c=c.slice(0),d=k.translateEventResponse(a,b[1]),e=0;e<c.length;e++){var f=c[e];"function"===typeof f&&f.call(this,d)}};l.onError=function(a){return f(c.JWPLAYER_ERROR,a)};l.onMediaError=function(a){return f(c.JWPLAYER_MEDIA_ERROR,a)};l.onFullscreen=function(a){return f(c.JWPLAYER_FULLSCREEN,a)};l.onMeta=function(a){return f(c.JWPLAYER_MEDIA_META,
a)};l.onMute=function(a){return f(c.JWPLAYER_MEDIA_MUTE,a)};l.onComplete=function(a){return f(c.JWPLAYER_MEDIA_COMPLETE,a)};l.onPlaylistComplete=function(a){return f(c.JWPLAYER_PLAYLIST_COMPLETE,a)};l.onPlaylistItem=function(a){return f(c.JWPLAYER_PLAYLIST_ITEM,a)};l.onTime=function(a){return f(c.JWPLAYER_MEDIA_TIME,a)};l.onBuffer=function(a){return n(d.BUFFERING,a)};l.onPause=function(a){return n(d.PAUSED,a)};l.onPlay=function(a){return n(d.PLAYING,a)};l.onIdle=function(a){return n(d.IDLE,a)};l.onClick=
function(a){return f(c.JWPLAYER_INSTREAM_CLICK,a)};l.onInstreamDestroyed=function(a){return f(c.JWPLAYER_INSTREAM_DESTROYED,a)};l.onAdSkipped=function(a){return f(c.JWPLAYER_AD_SKIPPED,a)};l.play=function(a){b.jwInstreamPlay(a)};l.pause=function(a){b.jwInstreamPause(a)};l.hide=function(){e.callInternal("jwInstreamHide")};l.destroy=function(){l.removeEvents();e.callInternal("jwInstreamDestroy")};l.setText=function(a){b.jwInstreamSetText(a?a:"")};l.getState=function(){return b.jwInstreamState()};l.setClick=
function(a){b.jwInstreamClick&&b.jwInstreamClick(a)}}}(jwplayer),function(f){var c=f.api,k=c.selectPlayer,d=f._;c.selectPlayer=function(c){return(c=k(c))?c:{registerPlugin:function(b,c,d){"jwpsrv"!==b&&f.plugins.registerPlugin(b,c,d)}}};f.unregisteredProviders=[];c.registerProvider=function(c){f&&f.html5&&d.isFunction(f.html5.registerProvider)?f.html5.registerProvider(c):f.unregisteredProviders.push(c)}}(jwplayer));;
(function(d){d.html5={};d.html5.version="6.11.4923";d=d.utils.css;var k=" div span a img ul li video".split(" ").join(", .jwplayer ");d(".jwplayer ".slice(0,-1)+k+", .jwclick",{margin:0,padding:0,border:0,color:"#000000","font-size":"100%",font:"inherit","vertical-align":"baseline","background-color":"transparent","text-align":"left",direction:"ltr","line-height":20,"-webkit-tap-highlight-color":"rgba(255, 255, 255, 0)"});d(".jwplayer ul",{"list-style":"none"});d(".jwplayer .jwcontrols",{"pointer-events":"none"});
d(".jwplayer.jw-user-inactive .jwcontrols",{"pointer-events":"all"});d(".jwplayer .jwcontrols .jwdockbuttons, .jwplayer .jwcontrols .jwcontrolbar, .jwplayer .jwcontrols .jwskip, .jwplayer .jwcontrols .jwdisplayIcon, .jwplayer .jwcontrols .jwpreview, .jwplayer .jwcontrols .jwlogo",{"pointer-events":"all"})})(jwplayer);
(function(d){var k=document;d.parseDimension=function(a){return"string"==typeof a?""===a?0:-1<a.lastIndexOf("%")?a:parseInt(a.replace("px",""),10):a};d.timeFormat=function(a){if(0<a){var c=Math.floor(a/3600),e=Math.floor((a-3600*c)/60);a=Math.floor(a%60);return(c?c+":":"")+(10>e?"0":"")+e+":"+(10>a?"0":"")+a}return"00:00"};d.bounds=function(a){var c={left:0,right:0,width:0,height:0,top:0,bottom:0};if(!a||!k.body.contains(a))return c;if(a.getBoundingClientRect){a=a.getBoundingClientRect(a);var e=window.pageYOffset,
f=window.pageXOffset;if(!a.width&&!a.height&&!a.left&&!a.top)return c;c.left=a.left+f;c.right=a.right+f;c.top=a.top+e;c.bottom=a.bottom+e;c.width=a.right-a.left;c.height=a.bottom-a.top}else{c.width=a.offsetWidth|0;c.height=a.offsetHeight|0;do c.left+=a.offsetLeft|0,c.top+=a.offsetTop|0;while(a=a.offsetParent);c.right=c.left+c.width;c.bottom=c.top+c.height}return c};d.empty=function(a){if(a)for(;0<a.childElementCount;)a.removeChild(a.children[0])}})(jwplayer.utils);
(function(d){var k=d.stretching={NONE:"none",FILL:"fill",UNIFORM:"uniform",EXACTFIT:"exactfit"};d.scale=function(a,c,e,f,g){var h="";c=c||1;e=e||1;f|=0;g|=0;if(1!==c||1!==e)h="scale("+c+", "+e+")";if(f||g)h="translate("+f+"px, "+g+"px)";d.transform(a,h)};d.stretch=function(a,c,e,f,g,h){if(!c||!e||!f||!g||!h)return!1;a=a||k.UNIFORM;var b=2*Math.ceil(e/2)/g,p=2*Math.ceil(f/2)/h,j="video"===c.tagName.toLowerCase(),l=!1,r="jw"+a.toLowerCase();switch(a.toLowerCase()){case k.FILL:b>p?p=b:b=p;l=!0;break;
case k.NONE:b=p=1;case k.EXACTFIT:l=!0;break;default:b>p?0.95<g*p/e?(l=!0,r="jwexactfit"):(g*=p,h*=p):0.95<h*b/f?(l=!0,r="jwexactfit"):(g*=b,h*=b),l&&(b=2*Math.ceil(e/2)/g,p=2*Math.ceil(f/2)/h)}j?(a={left:"",right:"",width:"",height:""},l?(e<g&&(a.left=a.right=Math.ceil((e-g)/2)),f<h&&(a.top=a.bottom=Math.ceil((f-h)/2)),a.width=g,a.height=h,d.scale(c,b,p,0,0)):(l=!1,d.transform(c)),d.css.style(c,a)):c.className=c.className.replace(/\s*jw(none|exactfit|uniform|fill)/g,"")+" "+r;return l}})(jwplayer.utils);
(function(d){d.dfxp=function(){var k=jwplayer.utils.seconds;this.parse=function(a){var c=[{begin:0,text:""}];a=a.replace(/^\s+/,"").replace(/\s+$/,"");var e=a.split("\x3c/p\x3e"),f=a.split("\x3c/tt:p\x3e"),g=[];for(a=0;a<e.length;a++)0<=e[a].indexOf("\x3cp")&&(e[a]=e[a].substr(e[a].indexOf("\x3cp")+2).replace(/^\s+/,"").replace(/\s+$/,""),g.push(e[a]));for(a=0;a<f.length;a++)0<=f[a].indexOf("\x3ctt:p")&&(f[a]=f[a].substr(f[a].indexOf("\x3ctt:p")+5).replace(/^\s+/,"").replace(/\s+$/,""),g.push(f[a]));
e=g;for(a=0;a<e.length;a++){f=e[a];g={};try{var h=f.indexOf('begin\x3d"'),f=f.substr(h+7),h=f.indexOf('" end\x3d"');g.begin=k(f.substr(0,h));f=f.substr(h+7);h=f.indexOf('"');g.end=k(f.substr(0,h));h=f.indexOf('"\x3e');f=f.substr(h+2);g.text=f}catch(b){}f=g;f.text&&(c.push(f),f.end&&(c.push({begin:f.end,text:""}),delete f.end))}if(1<c.length)return c;throw{message:"Invalid DFXP file:"};}}})(jwplayer.parsers);
(function(d){d.srt=function(){var k=jwplayer.utils,a=k.seconds;this.parse=function(c,e){var f=e?[]:[{begin:0,text:""}];c=k.trim(c);var g=c.split("\r\n\r\n");1==g.length&&(g=c.split("\n\n"));for(var h=0;h<g.length;h++)if("WEBVTT"!=g[h]){var b,d=g[h];b={};var j=d.split("\r\n");1==j.length&&(j=d.split("\n"));try{d=1;0<j[0].indexOf(" --\x3e ")&&(d=0);var l=j[d].indexOf(" --\x3e ");0<l&&(b.begin=a(j[d].substr(0,l)),b.end=a(j[d].substr(l+5)));if(j[d+1]){b.text=j[d+1];for(d+=2;d<j.length;d++)b.text+="\x3cbr/\x3e"+
j[d]}}catch(r){}b.text&&(f.push(b),b.end&&!e&&(f.push({begin:b.end,text:""}),delete b.end))}if(1<f.length)return f;throw{message:"Invalid SRT file"};}}})(jwplayer.parsers);
(function(d){var k=d.utils.noop,a=d.events,c=d._.constant(!1);d.html5.DefaultProvider={supports:c,play:k,load:k,stop:k,volume:k,mute:k,seek:k,seekDrag:k,resize:k,remove:k,destroy:k,setVisibility:k,setFullscreen:c,getFullscreen:k,setContainer:c,getContainer:k,isAudioFile:c,supportsFullscreen:c,getQualityLevels:k,getCurrentQuality:k,setCurrentQuality:k,getAudioTracks:k,getCurrentAudioTrack:k,setCurrentAudioTrack:k,checkComplete:k,setControls:k,attachMedia:k,detachMedia:k,setState:function(c){if(c!==
this.state){var f=this.state||a.state.IDLE;this.state=c;this.sendEvent(a.JWPLAYER_PLAYER_STATE,{oldstate:f,newstate:c})}}}})(jwplayer);(function(d){d.html5.chooseProvider=function(k){return d._.isObject(k)&&d.html5.YoutubeProvider.supports(k)?d.html5.YoutubeProvider:d.html5.VideoProvider}})(jwplayer);
(function(d){function k(k){function s(){}function y(a){z(a);Z&&(n.state===f.PLAYING&&!T)&&(G=Math.floor(10*H.currentTime)/10,O=!0,n.sendEvent(e.JWPLAYER_MEDIA_TIME,{position:G,duration:I}))}function m(){n.sendEvent(e.JWPLAYER_MEDIA_META,{duration:H.duration,height:H.videoHeight,width:H.videoWidth})}function B(a){Z&&(O||(O=!0,u()),"loadedmetadata"===a.type&&(H.muted&&(H.muted=!1,H.muted=!0),m()))}function z(){O&&(0<Q&&!l)&&(b?setTimeout(function(){0<Q&&n.seek(Q)},200):n.seek(Q))}function u(){R||(R=
!0,n.sendEvent(e.JWPLAYER_MEDIA_BUFFER_FULL))}function q(b){Z&&!T&&(H.paused?H.currentTime===H.duration&&3<H.duration||n.pause():(!a.isFF()||!("play"===b.type&&n.state===f.BUFFERING))&&n.setState(f.PLAYING))}function w(){Z&&(T||n.setState(f.BUFFERING))}function v(b){var n;if("array"===a.typeOf(b)&&0<b.length){n=[];for(var c=0;c<b.length;c++){var f=b[c],e={};e.label=f.label&&f.label?f.label?f.label:0:c;n[c]=e}}return n}function C(b,c){M=ca[ha];n.setState(f.BUFFERING);g(U);U=setInterval(F,100);Q=0;
H.src!==M.file||p||j?(R=O=!1,I=c?c:-1,H.src=M.file,H.load()):(0===b&&(Q=-1,n.seek(b)),m(),H.play());G=H.currentTime;p&&u();a.isIOS()&&n.getFullScreen()&&(H.controls=!0);0<b&&n.seek(b)}function F(){if(Z){var a;a=H.buffered;a=!a||!H.duration||0===a.length?0:a.end(a.length-1)/H.duration;1<=a&&g(U);a!==aa&&(aa=a,n.sendEvent(e.JWPLAYER_MEDIA_BUFFER,{bufferPercent:Math.round(100*aa)}))}}function x(a){n.sendEvent("fullscreenchange",{target:a.target,jwstate:Da})}this.state=f.IDLE;var K=new d.events.eventdispatcher("provider."+
this.name);a.extend(this,K);var n=this,L={abort:s,canplay:B,canplaythrough:s,click:function(){n.sendEvent(e.JWPLAYER_PROVIDER_CLICK)},durationchange:function(){if(Z){var a=Math.floor(10*H.duration)/10;I!==a&&(I=a);l&&(0<Q&&a>Q)&&n.seek(Q);y()}},emptied:s,ended:function(){Z&&n.state!==f.IDLE&&(g(U),ha=-1,oa=!0,n.sendEvent(e.JWPLAYER_MEDIA_BEFORECOMPLETE),Z&&(n.setState(f.IDLE),oa=!1,n.sendEvent(e.JWPLAYER_MEDIA_COMPLETE)))},error:function(){Z&&(a.log("Error playing media: %o",H.error),n.sendEvent(e.JWPLAYER_MEDIA_ERROR,
{message:"Error loading media: File could not be played"}),n.setState(f.IDLE))},loadeddata:s,loadedmetadata:B,loadstart:s,pause:q,play:q,playing:q,progress:z,ratechange:s,readystatechange:s,seeked:function(){!T&&n.state!==f.PAUSED&&n.setState(f.PLAYING)},seeking:b?w:s,stalled:s,suspend:s,timeupdate:y,volumechange:function(){n.sendEvent(e.JWPLAYER_MEDIA_VOLUME,{volume:Math.round(100*H.volume)});n.sendEvent(e.JWPLAYER_MEDIA_MUTE,{mute:H.muted})},waiting:w,webkitbeginfullscreen:function(b){Da=!0;x(b);
a.isIOS()&&(H.controls=!1)},webkitendfullscreen:function(b){Da=!1;x(b);a.isIOS()&&(H.controls=!1)}},J,M,I,G,O=!1,R,Q=0,T=!1,D,U=-1,aa=-1,Z=!1,ca,ha=-1,oa=!1,Da=!1;this.sendEvent=function(){Z&&K.sendEvent.apply(this,arguments)};var H=document.getElementById(k).querySelector("video"),Fa=H=H||document.createElement("video");a.foreach(L,function(a,b){Fa.addEventListener(a,b,!1)});r||(H.controls=!0,H.controls=!1);H.setAttribute("x-webkit-airplay","allow");H.setAttribute("webkit-playsinline","");Z=!0;this.stop=
function(){Z&&(g(U),H.removeAttribute("src"),b||H.load(),ha=-1,this.setState(f.IDLE))};this.destroy=function(){var b=H;a.foreach(L,function(a,n){b.removeEventListener(a,n,!1)});this.remove()};this.load=function(b){if(Z){ca=b.sources;0>ha&&(ha=0);if(ca)for(var c=a.getCookies().qualityLabel,f=0;f<ca.length;f++)if(ca[f]["default"]&&(ha=f),c&&ca[f].label===c){ha=f;break}(c=v(ca))&&n.sendEvent(e.JWPLAYER_MEDIA_LEVELS,{levels:c,currentQuality:ha});C(b.starttime||0,b.duration)}};this.play=function(){Z&&
!T&&H.play()};this.pause=function(){Z&&(H.pause(),this.setState(f.PAUSED))};this.seekDrag=function(a){Z&&((T=a)?H.pause():H.play())};this.seek=function(a){if(Z)if(!T&&0===Q&&this.sendEvent(e.JWPLAYER_MEDIA_SEEK,{position:G,offset:a}),O){Q=0;try{H.currentTime=a}catch(b){Q=a}}else Q=a};this.volume=function(b){a.exists(b)&&(H.volume=Math.min(Math.max(0,b/100),1),D=100*H.volume)};this.mute=function(b){a.exists(b)||(b=!H.muted);b?(D=100*H.volume,H.muted=!0):(this.volume(D),H.muted=!1)};this.setState=function(a){a===
f.PAUSED&&this.state===f.IDLE||T||h.setState.apply(this,arguments)};this.checkComplete=function(){return oa};this.detachMedia=function(){g(U);Z=!1;return H};this.attachMedia=function(a){Z=!0;a||(O=!1);oa&&(this.setState(f.IDLE),this.sendEvent(e.JWPLAYER_MEDIA_COMPLETE),oa=!1)};this.setContainer=function(a){J=a;a.appendChild(H)};this.getContainer=function(){return J};this.remove=function(){H&&(H.removeAttribute("src"),b||H.load());g(U);ha=-1;J===H.parentNode&&J.removeChild(H)};this.setVisibility=function(b){b||
l?a.css.style(J,{visibility:"visible",opacity:1}):a.css.style(J,{visibility:"",opacity:0})};this.resize=function(b,n,c){return a.stretch(c,H,b,n,H.videoWidth,H.videoHeight)};this.setControls=function(a){H.controls=!!a};this.supportsFullscreen=c.constant(!0);this.setFullScreen=function(a){if(a=!!a){try{var b=H.webkitEnterFullscreen||H.webkitEnterFullScreen;b&&b.apply(H)}catch(c){return!1}return n.getFullScreen()}(b=H.webkitExitFullscreen||H.webkitExitFullScreen)&&b.apply(H);return a};n.getFullScreen=
function(){return Da||!!H.webkitDisplayingFullscreen};this.isAudioFile=function(){if(!ca)return!1;var a=ca[0].type;return"oga"===a||"aac"===a||"mp3"===a||"vorbis"===a};this.setCurrentQuality=function(b){if(ha!==b&&(b=parseInt(b,10),0<=b&&ca&&ca.length>b)){ha=b;a.saveCookie("qualityLabel",ca[b].label);this.sendEvent(e.JWPLAYER_MEDIA_LEVEL_CHANGED,{currentQuality:b,levels:v(ca)});b=Math.floor(10*H.currentTime)/10;var n=Math.floor(10*H.duration)/10;0>=n&&(n=I);C(b,n)}};this.getCurrentQuality=function(){return ha};
this.getQualityLevels=function(){return v(ca)}}var a=d.utils,c=d._,e=d.events,f=e.state,g=window.clearInterval,h=d.html5.DefaultProvider,b=a.isMSIE(),p=a.isMobile(),j=a.isSafari(),l=a.isAndroidNative(),r=a.isIOS(7),s=function(){};s.prototype=h;k.prototype=new s;k.supports=c.constant(!0);d.html5.VideoProvider=k})(jwplayer);
(function(d){function k(j){function k(){window.YT&&window.YT.loaded?(K=window.YT,s()):setTimeout(k,100)}function p(){h=null}function s(){var a;if(a=K)a=L&&L.parentNode,a||(I||(d(j).onReady(s),I=!0),a=!1);a&&G&&G.apply(x)}function t(){if(n&&n.getPlayerState){var a=n.getPlayerState();null!==a&&(void 0!==a&&a!==Q)&&z({data:a});var b=K.PlayerState;a===b.PLAYING?(y(),x.sendEvent(e.JWPLAYER_MEDIA_TIME,{position:A(n.getCurrentTime()),duration:n.getDuration()})):a===b.BUFFERING&&y()}}function A(a){return Math.round(10*
a)/10}function y(){var a=0;n&&n.getVideoLoadedFraction&&(a=Math.round(100*n.getVideoLoadedFraction()));M!==a&&(M=a,x.sendEvent(e.JWPLAYER_MEDIA_BUFFER,{bufferPercent:a}))}function m(){x.sendEvent(e.JWPLAYER_MEDIA_META,{duration:n.getDuration(),width:L.clientWidth,height:L.clientHeight})}function B(){O&&(O.apply(x),O=null)}function z(a){var b=K.PlayerState;Q=a.data;switch(Q){case b.ENDED:x.state!==f.IDLE&&(D=!0,x.sendEvent(e.JWPLAYER_MEDIA_BEFORECOMPLETE),x.setState(f.IDLE),D=!1,x.sendEvent(e.JWPLAYER_MEDIA_COMPLETE));
break;case b.PLAYING:U=!1;m();x.sendEvent(e.JWPLAYER_MEDIA_LEVELS,{levels:x.getQualityLevels(),currentQuality:x.getCurrentQuality()});x.setState(f.PLAYING);break;case b.PAUSED:x.setState(f.PAUSED);break;case b.BUFFERING:x.setState(f.BUFFERING);break;case b.CUED:x.setState(f.IDLE)}}function u(){x.play();x.sendEvent(e.JWPLAYER_MEDIA_LEVEL_CHANGED,{currentQuality:x.getCurrentQuality(),levels:x.getQualityLevels()})}function q(){x.sendEvent(e.JWPLAYER_MEDIA_ERROR,{message:"Error loading YouTube: Video could not be played"})}
function w(){b&&(x.setVisibility(!0),a.css("#"+j+" .jwcontrols",{display:"none"}))}function v(){clearInterval(R);if(n&&n.stopVideo)try{n.stopVideo(),n.clearVideo()}catch(a){}}function C(b){O=null;var c=a.youTubeID(b.sources[0].file);b.image||(b.image="http://i.ytimg.com/vi/"+c+"/0.jpg");x.setVisibility(!0);if(!K||!n)G=function(){if(!c)throw"invalid Youtube ID";if(L.parentNode){var b={height:"100%",width:"100%",videoId:c,playerVars:a.extend({autoplay:0,controls:0,showinfo:0,rel:0,modestbranding:0,
playsinline:1,origin:location.protocol+"//"+location.hostname},void 0),events:{onReady:B,onStateChange:z,onPlaybackQualityChange:u,onError:q}};x.setVisibility(!0);n=new K.Player(L,b);L=n.getIframe();G=null;w();F()}},s();else if(n.getPlayerState)if('functionDisabled'!==c){U?(v(),n.cueVideoById(c)):n.loadVideoById(c);var f=n.getPlayerState(),e=K.PlayerState;(f===e.UNSTARTED||f===e.CUED)&&w()}else 0<n.getCurrentTime()&&n.seekTo(0),m();else O=function(){F();x.load(b)}}function F(){n&&n.getVolume&&
(x.sendEvent(e.JWPLAYER_MEDIA_VOLUME,{volume:Math.round(n.getVolume())}),x.sendEvent(e.JWPLAYER_MEDIA_MUTE,{mute:n.isMuted()}))}this.state=f.IDLE;var x=a.extend(this,new d.events.eventdispatcher("provider."+this.name)),K=window.YT,n=null,L=document.createElement("div"),J,M=-1,I=!1,G=null,O=null,R=-1,Q=-1,T,D=!1,U=b;this.setState=function(b){clearInterval(R);b!==f.IDLE&&(R=setInterval(t,250),b===f.PLAYING?a.css("#"+j+" .jwcontrols",{display:""}):b===f.BUFFERING&&y());g.setState.apply(this,arguments)};
!K&&h&&(h.addEventListener(e.COMPLETE,k),h.addEventListener(e.ERROR,p),h.load());L.id=j+"_youtube";this.init=function(a){C(a)};this.destroy=function(){this.remove();J=L=K=x=null};this.load=function(a){this.setState(f.BUFFERING);C(a);x.play()};this.stop=function(){v();this.setState(f.IDLE)};this.play=function(){U||n.playVideo&&n.playVideo()};this.pause=function(){U||n.pauseVideo&&n.pauseVideo()};this.seek=function(a){U||n.seekTo&&n.seekTo(a)};this.volume=function(b){n&&n.getVolume&&a.exists(b)&&(T=
Math.min(Math.max(0,b),100),n.setVolume(T))};this.mute=function(b){n&&n.getVolume&&(a.exists(b)||(b=!n.isMuted()),b?(T=n.getVolume(),n.mute()):(this.volume(T),n.unMute()))};this.detachMedia=function(){return document.createElement("video")};this.attachMedia=function(){D&&(this.setState(f.IDLE),this.sendEvent(e.JWPLAYER_MEDIA_COMPLETE),D=!1)};this.setContainer=function(a){J=a;a.appendChild(L);this.setVisibility(!0)};this.getContainer=function(){return J};this.supportsFullscreen=function(){return!(!J||
!J.requestFullscreen&&!J.requestFullScreen&&!J.webkitRequestFullscreen&&!J.webkitRequestFullScreen&&!J.webkitEnterFullscreen&&!J.webkitEnterFullScreen&&!J.mozRequestFullScreen&&!J.msRequestFullscreen)};this.remove=function(){v();L&&(J&&J===L.parentNode)&&J.removeChild(L);G=O=n=null};this.setVisibility=function(c){c?(a.css.style(L,{display:"block"}),a.css.style(J,{visibility:"visible",opacity:1})):b||a.css.style(J,{opacity:0})};this.resize=function(b,c,n){return a.stretch(n,L,b,c,L.clientWidth,L.clientHeight)};
this.checkComplete=function(){return D};this.getCurrentQuality=function(){if(n){if(n.getAvailableQualityLevels){var a=n.getPlaybackQuality();return n.getAvailableQualityLevels().indexOf(a)}return-1}};this.getQualityLevels=function(){if(n){if(!c.isFunction(n.getAvailableQualityLevels))return[];var a=n.getAvailableQualityLevels();return 2===a.length&&c.contains(a,"auto")?{label:c.without(a,"auto")}:c.map(a,function(a){return{label:a}}).reverse()}};this.setCurrentQuality=function(a){if(n&&n.getAvailableQualityLevels){var b=
n.getAvailableQualityLevels();b.length&&n.setPlaybackQuality(b[b.length-a-1])}}}var a=d.utils,c=d._,e=d.events,f=e.state,g=d.html5.DefaultProvider,h=new a.scriptloader(window.location.protocol+"//www.youtube.com/iframe_api"),b=a.isMobile();window.onYouTubeIframeAPIReady=function(){h=null};var p=function(){};p.prototype=g;k.prototype=new p;k.supports=function(b){return a.isYouTube(b.file,b.type)};d.html5.YoutubeProvider=k})(jwplayer);
(function(d){var k=d.utils,a=k.css,c=d.events,e=80,f=30;d.html5.adskipbutton=function(g,h,b,d){function j(a){0>z||(a=b.replace(/xx/gi,Math.ceil(z-a)),s(a))}function l(a,b){if("number"===k.typeOf(w))z=w;else if("%"===w.slice(-1)){var c=parseFloat(w.slice(0,-1));b&&!isNaN(c)&&(z=b*c/100)}else"string"===k.typeOf(w)?z=k.seconds(w):isNaN(w)||(z=w)}function r(){u&&x.sendEvent(c.JWPLAYER_AD_SKIPPED)}function s(a){a=a||d;var b=B.getContext("2d");b.clearRect(0,0,e,f);A(b,0,0,e,f,5,!0,!1,!1);A(b,0,0,e,f,5,
!1,!0,!1);b.fillStyle="#979797";b.globalAlpha=1;var c=B.height/2,g=B.width/2;b.textAlign="center";b.font="Bold 12px Sans-Serif";a===d&&(g-=v.width,b.drawImage(v,B.width-(B.width-b.measureText(d).width)/2-4,(f-v.height)/2));b.fillText(a,g,c+4)}function t(a){a=a||d;var b=B.getContext("2d");b.clearRect(0,0,e,f);A(b,0,0,e,f,5,!0,!1,!0);A(b,0,0,e,f,5,!1,!0,!0);b.fillStyle="#FFFFFF";b.globalAlpha=1;var c=B.height/2,g=B.width/2;b.textAlign="center";b.font="Bold 12px Sans-Serif";a===d&&(g-=v.width,b.drawImage(C,
B.width-(B.width-b.measureText(d).width)/2-4,(f-v.height)/2));b.fillText(a,g,c+4)}function A(a,b,c,f,e,g,j,m,h){"undefined"===typeof m&&(m=!0);"undefined"===typeof g&&(g=5);a.beginPath();a.moveTo(b+g,c);a.lineTo(b+f-g,c);a.quadraticCurveTo(b+f,c,b+f,c+g);a.lineTo(b+f,c+e-g);a.quadraticCurveTo(b+f,c+e,b+f-g,c+e);a.lineTo(b+g,c+e);a.quadraticCurveTo(b,c+e,b,c+e-g);a.lineTo(b,c+g);a.quadraticCurveTo(b,c,b+g,c);a.closePath();m&&(a.strokeStyle="white",a.globalAlpha=h?1:0.25,a.stroke());j&&(a.fillStyle=
"#000000",a.globalAlpha=0.5,a.fill())}function y(a,b){var c=document.createElement(a);b&&(c.className=b);return c}var m,B,z=-1,u=!1,q,w=0,v,C,F=!1,x=k.extend(this,new c.eventdispatcher);x.updateSkipTime=function(b,c){l(b,c);0<=z&&(a.style(m,{visibility:q?"visible":"hidden"}),0<z-b?(j(b),u&&(u=!1,m.style.cursor="default")):u||(u||(u=!0,m.style.cursor="pointer"),F?t():s()))};this.reset=function(a){u=!1;w=a;l(0,0);j(0)};x.show=function(){q=!0;0<z&&a.style(m,{visibility:"visible"})};x.hide=function(){q=
!1;a.style(m,{visibility:"hidden"})};this.element=function(){return m};v=new Image;v.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAICAYAAAArzdW1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ODkzMWI3Ny04YjE5LTQzYzMtOGM2Ni0wYzdkODNmZTllNDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDI0OTcxRkE0OEM2MTFFM0I4MTREM0ZBQTFCNDE3NTgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDI0OTcxRjk0OEM2MTFFM0I4MTREM0ZBQTFCNDE3NTgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDA5ZGQxNDktNzdkMi00M2E3LWJjYWYtOTRjZmM2MWNkZDI0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQ4OTMxYjc3LThiMTktNDNjMy04YzY2LTBjN2Q4M2ZlOWU0NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqAZXX0AAABYSURBVHjafI2BCcAwCAQ/kr3ScRwjW+g2SSezCi0kYHpwKLy8JCLDbWaGTM+MAFzuVNXhNiTQsh+PS9QhZ7o9JuFMeUVNwjsamDma4K+3oy1cqX/hxyPAAAQwNKV27g9PAAAAAElFTkSuQmCC";
v.className="jwskipimage jwskipout";C=new Image;C.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAICAYAAAArzdW1AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo0ODkzMWI3Ny04YjE5LTQzYzMtOGM2Ni0wYzdkODNmZTllNDYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDI0OTcxRkU0OEM2MTFFM0I4MTREM0ZBQTFCNDE3NTgiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDI0OTcxRkQ0OEM2MTFFM0I4MTREM0ZBQTFCNDE3NTgiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NDA5ZGQxNDktNzdkMi00M2E3LWJjYWYtOTRjZmM2MWNkZDI0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQ4OTMxYjc3LThiMTktNDNjMy04YzY2LTBjN2Q4M2ZlOWU0NiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvgIj/QAAABYSURBVHjadI6BCcAgDAS/0jmyih2tm2lHSRZJX6hQQ3w4FP49LKraSHV3ZLDzAuAi3cwaqUhSfvft+EweznHneUdTzPGRmp5hEJFhAo3LaCnjn7blzCvAAH9YOSCL5RZKAAAAAElFTkSuQmCC";
C.className="jwskipimage jwskipover";m=y("div","jwskip");m.id=g+"_skipcontainer";B=y("canvas");m.appendChild(B);x.width=B.width=e;x.height=B.height=f;m.appendChild(C);m.appendChild(v);a.style(m,{visibility:"hidden",bottom:h});m.addEventListener("mouseover",function(){F=!0;u&&t()});m.addEventListener("mouseout",function(){F=!1;u&&s()});k.isMobile()?(new k.touch(m)).addEventListener(k.touchEvents.TAP,r):m.addEventListener("click",r)};a(".jwskip",{position:"absolute","float":"right",display:"inline-block",
width:e,height:f,right:10});a(".jwskipimage",{position:"relative",display:"none"})})(window.jwplayer);
(function(d){var k=d.html5,a=d.utils,c=d.events,e=c.state,f=d.parsers,g=a.css,h=a.isAndroid(4,!0),b="playing";k.captions=function(g,j){function k(b){a.log("CAPTIONS("+b+")")}function r(a){(I=a.fullscreen)?(s(),setTimeout(s,500)):m(!0)}function s(){var a=w.offsetHeight,b=w.offsetWidth;0!==a&&0!==b&&F.resize(b,Math.round(0.94*a))}function t(b,c){a.ajax(b,function(a){var b=a.responseXML?a.responseXML.firstChild:null;L++;if(b){"xml"===f.localName(b)&&(b=b.nextSibling);for(;b.nodeType===b.COMMENT_NODE;)b=
b.nextSibling}b=b&&"tt"===f.localName(b)?new d.parsers.dfxp:new d.parsers.srt;try{var g=b.parse(a.responseText);K<n.length&&(n[c].data=g);m(!1)}catch(e){k(e.message+": "+n[c].file)}L===n.length&&(0<J&&(z(J),J=-1),y())},A,!0)}function A(a){L++;k(a);L===n.length&&(0<J&&(z(J),J=-1),y())}function y(){for(var a=[],b=0;b<n.length;b++)a.push(n[b]);G.sendEvent(c.JWPLAYER_CAPTIONS_LOADED,{captionData:a})}function m(a){n.length?x===b&&0<M?(F.show(),I?r({fullscreen:!0}):(B(),a&&setTimeout(B,500))):F.hide():
F.hide()}function B(){F.resize()}function z(a){0<a?(K=a-1,M=Math.floor(a),K>=n.length||(n[K].data?F.populate(n[K].data):L===n.length?(k("file not loaded: "+n[K].file),0!==M&&u(c.JWPLAYER_CAPTIONS_CHANGED,n,0),M=0):J=a,m(!1))):(M=0,m(!1))}function u(a,b,c){G.sendEvent(a,{type:a,tracks:b,track:c})}function q(){for(var a=[{label:"Off"}],b=0;b<n.length;b++)a.push({label:n[b].label});return a}var w,v={back:!0,color:"#FFFFFF",fontSize:15,fontFamily:"Arial,sans-serif",fontOpacity:100,backgroundColor:"#000",
backgroundOpacity:100,edgeStyle:null,windowColor:"#FFFFFF",windowOpacity:0},C={fontStyle:"normal",fontWeight:"normal",textDecoration:"none"},F,x,K,n=[],L=0,J=-1,M=0,I=!1,G=new c.eventdispatcher;a.extend(this,G);this.element=function(){return w};this.getCaptionsList=function(){return q()};this.getCurrentCaptions=function(){return M};this.setCurrentCaptions=function(b){0<=b&&(M!==b&&b<=n.length)&&(z(b),b=q(),a.saveCookie("captionLabel",b[M].label),u(c.JWPLAYER_CAPTIONS_CHANGED,b,M))};w=document.createElement("div");
w.id=g.id+"_caption";w.className="jwcaptions";g.jwAddEventListener(c.JWPLAYER_PLAYER_STATE,function(a){switch(a.newstate){case e.IDLE:x="idle";m(!1);break;case e.PLAYING:x=b,m(!1)}});g.jwAddEventListener(c.JWPLAYER_PLAYLIST_ITEM,function(){K=0;n=[];F.update(0);L=0;for(var b=g.jwGetPlaylist()[g.jwGetPlaylistIndex()].tracks,f=[],e=0,j="",d=0,j="",e=0;e<b.length;e++)j=b[e].kind.toLowerCase(),("captions"===j||"subtitles"===j)&&f.push(b[e]);M=0;if(!h){for(e=0;e<f.length;e++)if(j=f[e].file)f[e].label||
(f[e].label=e.toString()),n.push(f[e]),t(n[e].file,e);for(e=0;e<n.length;e++)if(n[e]["default"]){d=e+1;break}b=a.getCookies();if(j=b.captionLabel){b=q();for(e=0;e<b.length;e++)if(j===b[e].label){d=e;break}}0<d&&z(d);m(!1);u(c.JWPLAYER_CAPTIONS_LIST,q(),M)}});g.jwAddEventListener(c.JWPLAYER_MEDIA_ERROR,k);g.jwAddEventListener(c.JWPLAYER_ERROR,k);g.jwAddEventListener(c.JWPLAYER_READY,function(){a.foreach(v,function(a,b){j&&(void 0!==j[a]?b=j[a]:void 0!==j[a.toLowerCase()]&&(b=j[a.toLowerCase()]));C[a]=
b});F=new d.html5.captions.renderer(C,w);m(!1)});g.jwAddEventListener(c.JWPLAYER_MEDIA_TIME,function(a){F.update(a.position)});g.jwAddEventListener(c.JWPLAYER_FULLSCREEN,r);g.jwAddEventListener(c.JWPLAYER_RESIZE,function(){m(!1)})};g(".jwcaptions",{position:"absolute",cursor:"pointer",width:"100%",height:"100%",overflow:"hidden"})})(jwplayer);
(function(d){var k=d.utils,a=k.css.style;d.html5.captions.renderer=function(c,e){function f(b){b=b||"";A="hidden";a(j,{visibility:A});r.innerHTML=b;b.length&&(A="visible",setTimeout(g,16))}function g(){if("visible"===A){var b=j.clientWidth,e=Math.pow(b/400,0.6),f=c.fontSize*e;a(r,{maxWidth:b+"px",fontSize:Math.round(f)+"px",lineHeight:Math.round(1.4*f)+"px",padding:Math.round(1*e)+"px "+Math.round(8*e)+"px"});c.windowOpacity&&a(l,{padding:Math.round(5*e)+"px",borderRadius:Math.round(5*e)+"px"});a(j,
{visibility:A})}}function d(){for(var a=-1,b=0;b<p.length;b++)if(p[b].begin<=t&&(b===p.length-1||p[b+1].begin>=t)){a=b;break}-1===a?f(""):a!==s&&(s=a,f(p[b].text))}function b(a,b,c){c=k.hexToRgba("#000000",c);"dropshadow"===a?b.textShadow="0 2px 1px "+c:"raised"===a?b.textShadow="0 0 5px "+c+", 0 1px 5px "+c+", 0 2px 5px "+c:"depressed"===a?b.textShadow="0 -2px 1px "+c:"uniform"===a&&(b.textShadow="-2px 0 1px "+c+",2px 0 1px "+c+",0 -2px 1px "+c+",0 2px 1px "+c+",-1px 1px 1px "+c+",1px 1px 1px "+
c+",1px -1px 1px "+c+",1px 1px 1px "+c)}var p,j,l,r,s,t,A="visible",y=-1;this.hide=function(){clearInterval(y);a(j,{display:"none"})};this.populate=function(a){s=-1;p=a;d()};this.resize=function(){g()};this.show=function(){a(j,{display:"block"});g();clearInterval(y);y=setInterval(g,250)};this.update=function(a){t=a;p&&d()};var m=c.fontOpacity,B=c.windowOpacity,z=c.edgeStyle,u=c.backgroundColor,q={display:"inline-block"},w={color:k.hexToRgba(k.rgbHex(c.color),m),display:"inline-block",fontFamily:c.fontFamily,
fontStyle:c.fontStyle,fontWeight:c.fontWeight,textAlign:"center",textDecoration:c.textDecoration,wordWrap:"break-word"};B&&(q.backgroundColor=k.hexToRgba(k.rgbHex(c.windowColor),B));b(z,w,m);c.back?w.backgroundColor=k.hexToRgba(k.rgbHex(u),c.backgroundOpacity):null===z&&b("uniform",w);j=document.createElement("div");l=document.createElement("div");r=document.createElement("span");a(j,{display:"block",height:"auto",position:"absolute",bottom:"20px",textAlign:"center",width:"100%"});a(l,q);a(r,w);l.appendChild(r);
j.appendChild(l);e.appendChild(j)}})(jwplayer);
(function(d,k,a){function c(a){return a?parseInt(a.width,10)+"px "+parseInt(a.height,10)+"px":"0 0"}var e=d.jwplayer,f=e.html5,g=e.utils,h=e._,b=e.events,p=b.state,j=g.css,l=g.transitionStyle,r=g.isMobile(),s=g.isAndroid(4,!0),t=d.top!==d.self,A="button",y="text",m="slider",B={display:"none"},z={display:"block"},u={display:""};f.controlbar=function(q,l){function v(a,b,c){return{name:a,type:b,className:c}}function C(a){j.block($);var b=a.duration===Number.POSITIVE_INFINITY,c=0===a.duration&&0!==a.position&&
g.isSafari()&&!r;b||c?(V.setText(q.jwGetPlaylist()[q.jwGetPlaylistIndex()].title||"Live broadcast"),D(!1)):(E.elapsed&&(b=g.timeFormat(a.position),E.elapsed.innerHTML=b),E.duration&&(b=g.timeFormat(a.duration),E.duration.innerHTML=b),0<a.duration?pa(a.position/a.duration):pa(0),la=a.duration,ma||V.setText())}function F(){var a=q.jwGetMute();Ma=q.jwGetVolume()/100;aa("mute",a||0===Ma);Ta(a?0:Ma)}function x(){j.style([E.hd,E.cc],B);$a();ba()}function K(a){Ga=Math.floor(a.currentQuality);E.hd&&(E.hd.querySelector("button").className=
2===ia.length&&0===Ga?"off":"");qa&&0<=Ga&&qa.setActive(a.currentQuality)}function n(a){da&&(Na=Math.floor(a.track),E.cc&&(E.cc.querySelector("button").className=2===da.length&&0===Na?"off":""),ra&&0<=Na&&ra.setActive(a.track))}function L(a){E.cast&&(g.canCast()?g.addClass(E.cast,"jwcancast"):g.removeClass(E.cast,"jwcancast"));J(a||Oa)}function J(a){Oa=a;aa("cast",a.active);ba()}function M(){ta=g.extend({},ea,Y.getComponentSettings("controlbar"),l);fa=S("background").height;var a=ua?0:ta.margin;j.style(W,
{height:fa,bottom:a,left:a,right:a,"max-width":ua?"":ta.maxwidth});j(I(".jwtext"),{font:ta.fontsize+"px/"+S("background").height+"px "+ta.font,color:ta.fontcolor,"font-weight":ta.fontweight});j(I(".jwoverlay"),{bottom:fa})}function I(a){return"#"+$+(a?" "+a:"")}function G(){return k.createElement("span")}function O(a,b,e,f,n){var m=G(),d=S(a);f=f?" left center":" center";var h=c(d);m.className="jw"+a;m.innerHTML="\x26nbsp;";if(d&&d.src)return e=e?{background:'url("'+d.src+'") repeat-x '+f,"background-size":h,
height:n?d.height:""}:{background:'url("'+d.src+'") no-repeat'+f,"background-size":h,width:d.width,height:n?d.height:""},m.skin=d,j(I((n?".jwvertical ":"")+".jw"+a),g.extend(e,b)),E[a]=m}function R(a,b,e,f){b&&b.src&&(j(a,{width:b.width,background:"url("+b.src+") no-repeat center","background-size":c(b)}),e.src&&!r&&j(a+":hover,"+a+".off:hover",{background:"url("+e.src+") no-repeat center","background-size":c(e)}),f&&f.src&&j(a+".off",{background:"url("+f.src+") no-repeat center","background-size":c(f)}))}
function Q(a){return function(c){rb[a]&&(rb[a](),r&&V.sendEvent(b.JWPLAYER_USER_ACTION));c.preventDefault&&c.preventDefault()}}function T(b){g.foreach(kb,function(c,e){c!==b&&("cc"===c&&(clearTimeout(Ha),Ha=a),"hd"===c&&(clearTimeout(Ia),Ia=a),e.hide())})}function D(b){W&&E.alt&&(b===a&&(b=W.parentNode&&320<=W.parentNode.clientWidth),b&&!ma?j.style(Ua,u):j.style(Ua,B))}function U(){!ua&&!ma&&(j.block($),na.show(),Ja("volume",na),T("volume"))}function aa(a,b){h.isBoolean(b)||(b=!fb[a]);E[a]&&(b?g.addClass(E[a],
"jwtoggle"):g.removeClass(E[a],"jwtoggle"),g.addClass(E[a],"jwtoggling"),setTimeout(function(){g.removeClass(E[a],"jwtoggling")},100));fb[a]=b}function Z(){ia&&2<ia.length&&(Ka&&(clearTimeout(Ka),Ka=a),j.block($),qa.show(),Ja("hd",qa),T("hd"))}function ca(){da&&2<da.length&&(lb&&(clearTimeout(lb),lb=a),j.block($),ra.show(),Ja("cc",ra),T("cc"))}function ha(b){0<=b&&b<ia.length&&(q.jwSetCurrentQuality(b),clearTimeout(Ia),Ia=a,qa.hide())}function oa(b){0<=b&&b<da.length&&(q.jwSetCurrentCaptions(b),clearTimeout(Ha),
Ha=a,ra.hide())}function Da(){2===da.length&&oa((Na+1)%2)}function H(){2===ia.length&&ha((Ga+1)%2)}function Fa(a){a.preventDefault();k.onselectstart=function(){return!1}}function za(a){Ca();Aa=a;d.addEventListener("mouseup",ab,!1);d.addEventListener("mousemove",ab,!1)}function Ca(){d.removeEventListener("mouseup",ab);d.removeEventListener("mousemove",ab);Aa=null}function Sa(){E.timeRail.className="jwrail";q.jwGetState()!==p.IDLE&&(q.jwSeekDrag(!0),za("time"),Va(),V.sendEvent(b.JWPLAYER_USER_ACTION))}
function jb(a){if(Aa){var c=E[Aa].querySelector(".jwrail"),c=g.bounds(c),c=a.x/c.width;100<c&&(c=100);a.type===g.touchEvents.DRAG_END?(q.jwSeekDrag(!1),E.timeRail.className="jwrail",Ca(),gb.time(c),Wa()):(pa(c),a=(new Date).getTime(),500<a-mb&&(mb=a,gb.time(c)));V.sendEvent(b.JWPLAYER_USER_ACTION)}}function pb(a){var c=E.time.querySelector(".jwrail"),c=g.bounds(c);a=a.x/c.width;100<a&&(a=100);q.jwGetState()!==p.IDLE&&(gb.time(a),V.sendEvent(b.JWPLAYER_USER_ACTION))}function Pa(a){return function(b){b.button||
(E[a+"Rail"].className="jwrail","time"===a?q.jwGetState()!==p.IDLE&&(q.jwSeekDrag(!0),za(a)):za(a))}}function ab(a){if(Aa&&!a.button){var b=E[Aa].querySelector(".jwrail"),c=g.bounds(b),b=Aa,c=Xa()?E[b].vertical?(100*c.bottom-a.pageY)/(100*c.height):(a.pageX-100*c.left)/(100*c.width):E[b].vertical?(c.bottom-a.pageY)/c.height:(a.pageX-c.left)/c.width;"mouseup"===a.type?("time"===b&&q.jwSeekDrag(!1),E[b+"Rail"].className="jwrail",Ca(),gb[b.replace("H","")](c)):("time"===Aa?pa(c):Ta(c),a=(new Date).getTime(),
500<a-mb&&(mb=a,gb[Aa.replace("H","")](c)));return!1}}function Va(a){a&&bb.apply(this,arguments);ja&&(la&&!ua&&!r)&&(j.block($),ja.show(),Ja("time",ja))}function Wa(){ja&&ja.hide()}function bb(a){xa=g.bounds(W);if((Qa=g.bounds(va))&&0!==Qa.width){var b;Xa()?(a=a.pageX?a.pageX-100*Qa.left:a.x,b=100*Qa.width):(a=a.pageX?a.pageX-Qa.left:a.x,b=Qa.width);ja.positionX(Math.round(a));qb(la*a/b)}}function P(){g.foreach(hb,function(a,b){var c={};"%"===b.position.toString().slice(-1)?c.left=b.position:0<la?
(c.left=(100*b.position/la).toFixed(2)+"%",c.display=null):(c.left=0,c.display="none");j.style(b.element,c)})}function Ea(){lb=setTimeout(ra.hide,500)}function sa(){Ka=setTimeout(qa.hide,500)}function cb(a,b,c,e){if(!r){var f=a.element();b.appendChild(f);b.addEventListener("mousemove",c,!1);e?b.addEventListener("mouseout",e,!1):b.addEventListener("mouseout",a.hide,!1);j.style(f,{left:"50%"})}}function Ya(c,e,f,n){if(r){var j=c.element();e.appendChild(j);(new g.touch(e)).addEventListener(g.touchEvents.TAP,
function(){var e=f;"cc"===n?(2===da.length&&(e=Da),Ha?(clearTimeout(Ha),Ha=a,c.hide()):(Ha=setTimeout(function(){c.hide();Ha=a},4E3),e()),V.sendEvent(b.JWPLAYER_USER_ACTION)):"hd"===n&&(2===ia.length&&(e=H),Ia?(clearTimeout(Ia),Ia=a,c.hide()):(Ia=setTimeout(function(){c.hide();Ia=a},4E3),e()),V.sendEvent(b.JWPLAYER_USER_ACTION))})}}function ya(a){var b=G();b.className="jwgroup jw"+a;Ba[a]=b;if(ka[a]){var b=ka[a],e=Ba[a];if(b&&0<b.elements.length)for(var n=0;n<b.elements.length;n++){var d;a:{d=b.elements[n];
var h=a;switch(d.type){case y:h=void 0;d=d.name;var h={},q=S(("alt"===d?"elapsed":d)+"Background");if(q.src){var l=G();l.id=$+"_"+d;"elapsed"===d||"duration"===d?(l.className="jwtext jw"+d+" jwhidden",Ua.push(l)):l.className="jwtext jw"+d;h.background="url("+q.src+") repeat-x center";h["background-size"]=c(S("background"));j.style(l,h);l.innerHTML="alt"!==d?"00:00":"";h=E[d]=l}else h=null;d=h;break a;case A:if("blank"!==d.name){d=d.name;q=h;if(!S(d+"Button").src||r&&("mute"===d||0===d.indexOf("volume"))||
s&&/hd|cc/.test(d))d=null;else{var h=G(),l=G(),t=void 0,t=ga,p=O(t.name);p||(p=G(),p.className="jwblankDivider");t.className&&(p.className+=" "+t.className);t=p;p=k.createElement("button");h.style+=" display:inline-block";h.className="jw"+d;"left"===q?(h.appendChild(l),h.appendChild(t)):(h.appendChild(t),h.appendChild(l));r?"hd"!==d&&"cc"!==d&&(new g.touch(p)).addEventListener(g.touchEvents.TAP,Q(d)):p.addEventListener("click",Q(d),!1);p.innerHTML="\x26nbsp;";p.tabIndex=-1;l.appendChild(p);q=S(d+
"Button");l=S(d+"ButtonOver");t=S(d+"ButtonOff");R(I(".jw"+d+" button"),q,l,t);(q=xb[d])&&R(I(".jw"+d+".jwtoggle button"),S(q+"Button"),S(q+"ButtonOver"));fb[d]?g.addClass(h,"jwtoggle"):g.removeClass(h,"jwtoggle");d=E[d]=h}break a}break;case m:h=void 0;t=d.name;if(r&&0===t.indexOf("volume"))h=void 0;else{d=G();var l="volume"===t,v=t+("time"===t?"Slider":"")+"Cap",q=l?"Top":"Left",h=l?"Bottom":"Right",p=O(v+q,null,!1,!1,l),x=O(v+h,null,!1,!1,l),K;K=t;var w=l,L=q,Z=h,u=G(),C=["Rail","Buffer","Progress"],
J=void 0,D=void 0;u.className="jwrail";for(var U=0;U<C.length;U++){var D="time"===K?"Slider":"",z=K+D+C[U],F=O(z,null,!w,0===K.indexOf("volume"),w),M=O(z+"Cap"+L,null,!1,!1,w),Ka=O(z+"Cap"+Z,null,!1,!1,w),H=S(z+"Cap"+L),T=S(z+"Cap"+Z);if(F){var N=G();N.className="jwrailgroup "+C[U];M&&N.appendChild(M);N.appendChild(F);Ka&&(N.appendChild(Ka),Ka.className+=" jwcap"+(w?"Bottom":"Right"));j(I(".jwrailgroup."+C[U]),{"min-width":w?"":H.width+T.width});N.capSize=w?H.height+T.height:H.width+T.width;j(I("."+
F.className),{left:w?"":H.width,right:w?"":T.width,top:w?H.height:"",bottom:w?T.height:"",height:w?"auto":""});2===U&&(J=N);2===U&&!w?(F=G(),F.className="jwprogressOverflow",F.appendChild(N),E[z]=F,u.appendChild(F)):(E[z]=N,u.appendChild(N))}}if(L=O(K+D+"Thumb",null,!1,!1,w))j(I("."+L.className),{opacity:"time"===K?0:1,"margin-top":w?L.skin.height/-2:""}),L.className+=" jwthumb",(w&&J?J:u).appendChild(L);r?(w=new g.touch(u),w.addEventListener(g.touchEvents.DRAG_START,Sa),w.addEventListener(g.touchEvents.DRAG,
jb),w.addEventListener(g.touchEvents.DRAG_END,jb),w.addEventListener(g.touchEvents.TAP,pb)):(J=K,"volume"===J&&!w&&(J+="H"),u.addEventListener("mousedown",Pa(J),!1));"time"===K&&!r&&(u.addEventListener("mousemove",Va,!1),u.addEventListener("mouseout",Wa,!1));K=E[K+"Rail"]=u;u=S(v+q);v=S(v+q);d.className="jwslider jw"+t;p&&d.appendChild(p);d.appendChild(K);x&&(l&&(x.className+=" jwcapBottom"),d.appendChild(x));j(I(".jw"+t+" .jwrail"),{left:l?"":u.width,right:l?"":v.width,top:l?u.height:"",bottom:l?
v.height:"",width:l?"100%":"",height:l?"auto":""});E[t]=d;d.vertical=l;"time"===t?(ja=new f.overlay($+"_timetooltip",Y),Ra=new f.thumbs($+"_thumb"),ib=k.createElement("div"),ib.className="jwoverlaytext",Za=k.createElement("div"),h=Ra.element(),Za.appendChild(h),Za.appendChild(ib),ja.setContents(Za),va=K,qb(0),h=ja.element(),K.appendChild(h),E.timeSliderRail||j.style(E.time,B),E.timeSliderThumb&&j.style(E.timeSliderThumb,{"margin-left":S("timeSliderThumb").width/-2}),h=S("timeSliderCue"),q={"z-index":1},
h&&h.src?(O("timeSliderCue"),q["margin-left"]=h.width/-2):q.display="none",j(I(".jwtimeSliderCue"),q),wa(0),pa(0),pa(0),wa(0)):0===t.indexOf("volume")&&(t=d,p="volume"+(l?"":"H"),x=l?"vertical":"horizontal",j(I(".jw"+p+".jw"+x),{width:S(p+"Rail",l).width+(l?0:S(p+"Cap"+q).width+S(p+"RailCap"+q).width+S(p+"RailCap"+h).width+S(p+"Cap"+h).width),height:l?S(p+"Cap"+q).height+S(p+"Rail").height+S(p+"RailCap"+q).height+S(p+"RailCap"+h).height+S(p+"Cap"+h).height:""}),t.className+=" jw"+x);h=d}d=h;break a}d=
void 0}d&&("volume"===b.elements[n].name&&d.vertical?(na=new f.overlay($+"_volumeOverlay",Y),na.setContents(d)):e.appendChild(d))}}}function Xa(){return t&&g.isIE()&&q.jwGetFullscreen()}function ba(){clearTimeout(sb);sb=setTimeout(V.redraw,0)}function $a(){!nb&&1<q.jwGetPlaylist().length&&(!k.querySelector("#"+q.id+" .jwplaylist")||q.jwGetFullscreen())?(j.style(E.next,u),j.style(E.prev,u)):(j.style(E.next,B),j.style(E.prev,B))}function Ja(a,b){xa||(xa=g.bounds(W));b.constrainX(xa,!0)}function wa(a){E.timeSliderBuffer&&
(a=Math.min(Math.max(0,a),1),j.style(E.timeSliderBuffer,{width:(100*a).toFixed(1)+"%",opacity:0<a?1:0}))}function La(a,b){if(E[a]){var c=E[a].vertical,e=a+("time"===a?"Slider":""),f=100*Math.min(Math.max(0,b),1)+"%",d=E[e+"Progress"],e=E[e+"Thumb"],g;d&&(g={},c?(g.height=f,g.bottom=0):g.width=f,"volume"!==a&&(g.opacity=0<b||Aa?1:0),j.style(d,g));e&&(g={},c?g.top=0:g.left=f,j.style(e,g))}}function Ta(a){La("volume",a);La("volumeH",a)}function pa(a){La("time",a)}function S(b){var c="controlbar",e=b;
0===b.indexOf("volume")&&(0===b.indexOf("volumeH")?e=b.replace("volumeH","volume"):c="tooltip");return(b=Y.getSkinElement(c,e))?b:{width:0,height:0,src:"",image:a,ready:!1}}function N(a){a=(new e.parsers.srt).parse(a.responseText,!0);if(!h.isArray(a))return X("Invalid data");V.addCues(a)}function X(a){g.log("Cues failed to load: "+a)}l=l||{};var Y,ga=v("divider","divider"),ea={margin:8,maxwidth:800,font:"Arial,sans-serif",fontsize:11,fontcolor:15658734,fontweight:"bold",layout:{left:{position:"left",
elements:[v("play",A),v("prev",A),v("next",A),v("elapsed",y)]},center:{position:"center",elements:[v("time",m),v("alt",y)]},right:{position:"right",elements:[v("duration",y),v("hd",A),v("cc",A),v("mute",A),v("volume",m),v("volumeH",m),v("cast",A),v("fullscreen",A)]}}},ta,ka,E,fa,W,$,la,ia,Ga,da,Na,Ma,Oa={},na,xa,va,Qa,ja,Za,Ra,ib,Ka,Ia,qa,lb,Ha,ra,sb,db=-1,ua=!1,ma=!1,nb=!1,ob=!1,Aa=null,mb=0,hb=[],eb,xb={play:"pause",mute:"unmute",cast:"casting",fullscreen:"normalscreen"},fb={play:!1,mute:!1,cast:!1,
fullscreen:l.fullscreen||!1},rb={play:function(){fb.play?q.jwPause():q.jwPlay()},mute:function(){var a=!fb.mute;q.jwSetMute(a);!a&&0===Ma&&q.jwSetVolume(20);F()},fullscreen:function(){q.jwSetFullscreen()},next:function(){q.jwPlaylistNext()},prev:function(){q.jwPlaylistPrev()},hd:H,cc:Da,cast:function(){Oa.active?q.jwStopCasting():q.jwStartCasting()}},gb={time:function(a){eb?(a=eb.position,a="%"===a.toString().slice(-1)?la*parseFloat(a.slice(0,-1))/100:parseFloat(a)):a*=la;q.jwSeek(a)},volume:function(a){Ta(a);
0.1>a&&(a=0);0.9<a&&(a=1);q.jwSetVolume(100*a)}},kb={},Ua=[],V=g.extend(this,new b.eventdispatcher),qb,tb,yb=function(a){j.style(ja.element(),{width:a});Ja("time",ja)};qb=function(a){var b=Ra.updateTimeline(a,yb);if(eb){if((a=eb.text)&&a!==tb)tb=a,j.style(ja.element(),{width:32<a.length?160:""})}else a=g.timeFormat(a),b||j.style(ja.element(),{width:""});ib.innerHTML!==a&&(ib.innerHTML=a);Ja("time",ja)};V.setText=function(a){j.block($);var b=E.alt,c=E.time;E.timeSliderRail?j.style(c,a?B:z):j.style(c,
B);b&&(j.style(b,a?z:B),b.innerHTML=a||"");ba()};var Ba={};V.redraw=function(a){j.block($);a&&V.visible&&V.show(!0);M();var b=t&&g.isMSIE();a=Oa.active;j.style(E.fullscreen,{display:ua||a||ob||b?"none":""});j.style(E.volumeH,{display:ua||ma?"block":"none"});(b=Math.floor(ta.maxwidth))&&W.parentNode&&g.isIE()&&(!ua&&W.parentNode.clientWidth>b+2*Math.floor(ta.margin)?j.style(W,{width:b}):j.style(W,{width:""}));na&&j.style(na.element(),{display:!ua&&!ma?"block":"none"});j.style(E.hd,{display:!ua&&!a&&
!ma&&ia&&1<ia.length&&qa?"":"none"});j.style(E.cc,{display:!ua&&!ma&&da&&1<da.length&&ra?"":"none"});P();j.unblock($);V.visible&&(a=S("capLeft"),b=S("capRight"),a=Xa()?{left:Math.round(g.parseDimension(62*Ba.left.offsetWidth)+a.width),right:Math.round(g.parseDimension(86*Ba.right.offsetWidth)+b.width)}:{left:Math.round(g.parseDimension(Ba.left.offsetWidth)+a.width),right:Math.round(g.parseDimension(Ba.right.offsetWidth)+b.width)},j.style(Ba.center,a))};V.audioMode=function(b){b!==a&&b!==ua&&(ua=!!b,
ba());return ua};V.instreamMode=function(b){b!==a&&b!==ma&&(ma=!!b,j.style(E.cast,ma?B:u));return ma};V.adMode=function(a){if(h.isBoolean(a)&&a!==nb){if(nb=a){var b=Ua,c=h.indexOf(b,E.elapsed);-1<c&&b.splice(c,1);b=Ua;c=h.indexOf(b,E.duration);-1<c&&b.splice(c,1)}else b=Ua,c=E.elapsed,-1===h.indexOf(b,c)&&b.push(c),b=Ua,c=E.duration,-1===h.indexOf(b,c)&&b.push(c);j.style([E.cast,E.elapsed,E.duration],a?B:u);$a()}return nb};V.hideFullscreen=function(b){b!==a&&b!==ob&&(ob=!!b,ba());return ob};V.element=
function(){return W};V.margin=function(){return parseInt(ta.margin,10)};V.height=function(){return fa};V.show=function(a){if(!V.visible||a)V.visible=!0,j.style(W,{display:"inline-block"}),xa=g.bounds(W),D(),j.block($),F(),ba(),clearTimeout(db),db=-1,db=setTimeout(function(){j.style(W,{opacity:1})},0)};V.showTemp=function(){this.visible||(W.style.opacity=0,W.style.display="inline-block")};V.hideTemp=function(){this.visible||(W.style.display="none")};V.addCues=function(a){g.foreach(a,function(a,b){if(b.text){var c=
b.begin,e=b.text;if(/^[\d\.]+%?$/.test(c.toString())){var f=O("timeSliderCue"),d=E.timeSliderRail,g={position:c,text:e,element:f};f&&d&&(d.appendChild(f),f.addEventListener("mouseover",function(){eb=g},!1),f.addEventListener("mouseout",function(){eb=null},!1),hb.push(g))}P()}})};V.hide=function(){if(V.visible&&(!ma||!r||!q.jwGetControls()))V.visible=!1,j.style(W,{opacity:0}),clearTimeout(db),db=-1,db=setTimeout(function(){j.style(W,{display:"none"})},250)};E={};$=q.id+"_controlbar";la=0;W=G();W.id=
$;W.className="jwcontrolbar";Y=q.skin;ka=Y.getComponentLayout("controlbar");ka||(ka=ea.layout);g.clearCss(I());j.block($+"build");M();var ub=O("capLeft"),vb=O("capRight"),wb=O("background",{position:"absolute",left:S("capLeft").width,right:S("capRight").width,"background-repeat":"repeat-x"},!0);wb&&W.appendChild(wb);ub&&W.appendChild(ub);ya("left");ya("center");ya("right");W.appendChild(Ba.left);W.appendChild(Ba.center);W.appendChild(Ba.right);E.hd&&(qa=new f.menu("hd",$+"_hd",Y,ha),r?Ya(qa,E.hd,
Z,"hd"):cb(qa,E.hd,Z,sa),kb.hd=qa);E.cc&&(ra=new f.menu("cc",$+"_cc",Y,oa),r?Ya(ra,E.cc,ca,"cc"):cb(ra,E.cc,ca,Ea),kb.cc=ra);E.mute&&(E.volume&&E.volume.vertical)&&(na=new f.overlay($+"_volumeoverlay",Y),na.setContents(E.volume),cb(na,E.mute,U),kb.volume=na);j.style(Ba.right,{right:S("capRight").width});vb&&W.appendChild(vb);j.unblock($+"build");q.jwAddEventListener(b.JWPLAYER_MEDIA_TIME,C);q.jwAddEventListener(b.JWPLAYER_PLAYER_STATE,function(a){switch(a.newstate){case p.BUFFERING:case p.PLAYING:E.timeSliderThumb&&
j.style(E.timeSliderThumb,{opacity:1});aa("play",!0);break;case p.PAUSED:Aa||aa("play",!1);break;case p.IDLE:aa("play",!1),E.timeSliderThumb&&j.style(E.timeSliderThumb,{opacity:0}),E.timeRail&&(E.timeRail.className="jwrail"),wa(0),C({position:0,duration:0})}});q.jwAddEventListener(b.JWPLAYER_PLAYLIST_ITEM,function(a){if(!ma){a=q.jwGetPlaylist()[a.index].tracks;var b=!1,c=E.timeSliderRail;g.foreach(hb,function(a,b){c.removeChild(b.element)});hb.length=0;if(h.isArray(a)&&!r)for(var e=0;e<a.length;e++)if(!b&&
(a[e].file&&a[e].kind&&"thumbnails"===a[e].kind.toLowerCase())&&(Ra.load(a[e].file),b=!0),a[e].file&&a[e].kind&&"chapters"===a[e].kind.toLowerCase()){var f=a[e].file;f?g.ajax(f,N,X,!0):hb.length=0}b||Ra.load()}});q.jwAddEventListener(b.JWPLAYER_MEDIA_MUTE,F);q.jwAddEventListener(b.JWPLAYER_MEDIA_VOLUME,F);q.jwAddEventListener(b.JWPLAYER_MEDIA_BUFFER,function(a){wa(a.bufferPercent/100)});q.jwAddEventListener(b.JWPLAYER_FULLSCREEN,function(a){aa("fullscreen",a.fullscreen);$a();V.visible&&V.show(!0)});
q.jwAddEventListener(b.JWPLAYER_PLAYLIST_LOADED,x);q.jwAddEventListener(b.JWPLAYER_MEDIA_LEVELS,function(a){ia=a.levels;if(!ma&&ia&&1<ia.length&&qa){j.style(E.hd,u);qa.clearOptions();for(var b=0;b<ia.length;b++)qa.addOption(ia[b].label,b);K(a)}else j.style(E.hd,B);ba()});q.jwAddEventListener(b.JWPLAYER_MEDIA_LEVEL_CHANGED,K);q.jwAddEventListener(b.JWPLAYER_CAPTIONS_LIST,function(a){da=a.tracks;if(!ma&&da&&1<da.length&&ra){j.style(E.cc,u);ra.clearOptions();for(var b=0;b<da.length;b++)ra.addOption(da[b].label,
b);n(a)}else j.style(E.cc,B);ba()});q.jwAddEventListener(b.JWPLAYER_CAPTIONS_CHANGED,n);q.jwAddEventListener(b.JWPLAYER_RESIZE,function(){xa=g.bounds(W);0<xa.width&&V.show(!0)});q.jwAddEventListener(b.JWPLAYER_CAST_AVAILABLE,L);q.jwAddEventListener(b.JWPLAYER_CAST_SESSION,J);r||(W.addEventListener("mouseover",function(){d.addEventListener("mousedown",Fa,!1)},!1),W.addEventListener("mouseout",function(){d.removeEventListener("mousedown",Fa);k.onselectstart=null},!1));setTimeout(F,0);x();V.visible=
!1;L()};j("span.jwcontrolbar",{position:"absolute",margin:"auto",opacity:0,display:"none"});j("span.jwcontrolbar span",{height:"100%"});g.dragStyle("span.jwcontrolbar span","none");j("span.jwcontrolbar .jwgroup",{display:"inline"});j("span.jwcontrolbar span, span.jwcontrolbar .jwgroup button,span.jwcontrolbar .jwleft",{position:"relative","float":"left"});j("span.jwcontrolbar .jwright",{position:"relative","float":"right"});j("span.jwcontrolbar .jwcenter",{position:"absolute"});j("span.jwcontrolbar button",
{display:"inline-block",height:"100%",border:"none",cursor:"pointer"});j("span.jwcontrolbar .jwcapRight,span.jwcontrolbar .jwtimeSliderCapRight,span.jwcontrolbar .jwvolumeCapRight",{right:0,position:"absolute"});j("span.jwcontrolbar .jwcapBottom",{bottom:0,position:"absolute"});j("span.jwcontrolbar .jwtime",{position:"absolute",height:"100%",width:"100%",left:0});j("span.jwcontrolbar .jwthumb",{position:"absolute",height:"100%",cursor:"pointer"});j("span.jwcontrolbar .jwrail",{position:"absolute",
cursor:"pointer"});j("span.jwcontrolbar .jwrailgroup",{position:"absolute",width:"100%"});j("span.jwcontrolbar .jwrailgroup span",{position:"absolute"});j("span.jwcontrolbar .jwdivider+.jwdivider",{display:"none"});j("span.jwcontrolbar .jwtext",{padding:"0 5px","text-align":"center"});j("span.jwcontrolbar .jwcast",{display:"none"});j("span.jwcontrolbar .jwcast.jwcancast",{display:"block"});j("span.jwcontrolbar .jwalt",{display:"none",overflow:"hidden"});j("span.jwcontrolbar .jwalt",{position:"absolute",
left:0,right:0,"text-align":"left"},!0);j("span.jwcontrolbar .jwoverlaytext",{padding:3,"text-align":"center"});j("span.jwcontrolbar .jwvertical *",{display:"block"});j("span.jwcontrolbar .jwvertical .jwvolumeProgress",{height:"auto"},!0);j("span.jwcontrolbar .jwprogressOverflow",{position:"absolute",overflow:"hidden"});l("span.jwcontrolbar","opacity .25s, background .25s, visibility .25s");l("span.jwcontrolbar button","opacity .25s, background .25s, visibility .25s");l("span.jwcontrolbar .jwtoggling",
"none")})(window,document);
(function(d){var k=d.utils,a=d.events,c=a.state,e=d.playlist;d.html5.controller=function(f,g){function h(){return f.getVideo()}function b(a){x.sendEvent(a.type,a)}function p(c){l(!0);switch(k.typeOf(c)){case "string":var g=new e.loader;g.addEventListener(a.JWPLAYER_PLAYLIST_LOADED,function(a){p(a.playlist)});g.addEventListener(a.JWPLAYER_ERROR,function(a){p([]);a.message="Could not load playlist: "+a.message;b(a)});g.load(c);break;case "object":case "array":f.setPlaylist(new d.playlist(c));break;
case "number":f.setItem(c)}}function j(b){if(k.exists(b)&&!b)return r();try{0<=u&&(p(u),u=-1);if(!q&&(q=!0,x.sendEvent(a.JWPLAYER_MEDIA_BEFOREPLAY),q=!1,C)){C=!1;w=null;return}if(s()){if(0===f.playlist.length)return!1;h().load(f.playlist[f.item])}else f.state===c.PAUSED&&h().play();return!0}catch(e){x.sendEvent(a.JWPLAYER_ERROR,e),w=null}return!1}function l(b){w=null;try{return s()?b||(v=!0):h().stop(),q&&(C=!0),!0}catch(c){x.sendEvent(a.JWPLAYER_ERROR,c)}return!1}function r(b){w=null;if(k.exists(b)&&
!b)return j();switch(f.state){case c.PLAYING:case c.BUFFERING:try{h().pause()}catch(e){return x.sendEvent(a.JWPLAYER_ERROR,e),!1}break;default:q&&(C=!0)}return!0}function s(){return f.state===c.IDLE}function t(a){k.css.block(f.id+"_next");p(a);j();k.css.unblock(f.id+"_next")}function A(){t(f.item+1)}function y(){s()&&(v?v=!1:(w=y,f.repeat?A():f.item===f.playlist.length-1?(u=0,l(!0),setTimeout(function(){x.sendEvent(a.JWPLAYER_PLAYLIST_COMPLETE)},0)):A()))}function m(a){return function(){var b=Array.prototype.slice.call(arguments,
0);z?B(a,b):F.push({method:a,arguments:b})}}function B(a,b){a.apply(this,b)}var z=!1,u=-1,q=!1,w,v=!1,C,F=[],x=k.extend(this,new a.eventdispatcher(f.id,f.config.debug));this.play=m(j);this.pause=m(r);this.seek=m(function(a){f.state!==c.PLAYING&&j(!0);h().seek(a)});this.stop=function(){s()&&(v=!0);m(l)()};this.load=m(p);this.next=m(A);this.prev=m(function(){t(f.item-1)});this.item=m(t);this.setVolume=m(f.setVolume);this.setMute=m(f.setMute);this.setFullscreen=m(function(a){g.fullscreen(a)});this.detachMedia=
function(){try{return f.getVideo().detachMedia()}catch(a){k.log("Error calling detachMedia",a)}return null};this.attachMedia=function(a){try{f.getVideo().attachMedia(a)}catch(b){k.log("Error calling detachMedia",b);return}"function"===typeof w&&w()};this.setCurrentQuality=m(function(a){h().setCurrentQuality(a)});this.getCurrentQuality=function(){return h()?h().getCurrentQuality():-1};this.getQualityLevels=function(){return h()?h().getQualityLevels():null};this.setCurrentAudioTrack=function(a){h().setCurrentAudioTrack(a)};
this.getCurrentAudioTrack=function(){return h()?h().getCurrentAudioTrack():-1};this.getAudioTracks=function(){return h()?h().getAudioTracks():null};this.setCurrentCaptions=m(function(a){g.setCurrentCaptions(a)});this.getCurrentCaptions=function(){return g.getCurrentCaptions()};this.getCaptionsList=function(){return g.getCaptionsList()};this.checkBeforePlay=function(){return q};this.playerReady=function(a){if(!z){g.completeSetup();x.sendEvent(a.type,a);d.utils.exists(d.playerReady)&&d.playerReady(a);
f.addGlobalListener(b);g.addGlobalListener(b);x.sendEvent(d.events.JWPLAYER_PLAYLIST_LOADED,{playlist:d(f.id).getPlaylist()});x.sendEvent(d.events.JWPLAYER_PLAYLIST_ITEM,{index:f.item});p();f.autostart&&!k.isMobile()&&j();for(z=!0;0<F.length;)a=F.shift(),B(a.method,a.arguments)}};f.addEventListener(a.JWPLAYER_MEDIA_BUFFER_FULL,function(){h().play()});f.addEventListener(a.JWPLAYER_MEDIA_COMPLETE,function(){setTimeout(y,25)});f.addEventListener(a.JWPLAYER_MEDIA_ERROR,function(b){b=k.extend({},b);b.type=
a.JWPLAYER_ERROR;x.sendEvent(b.type,b)})}})(jwplayer);(function(d){var k;d.html5.defaultskin=function(){return k=k||d.utils.parseXML('\x3c?xml version\x3d"1.0" ?\x3e\x3cskin author\x3d"JW Player" name\x3d"Six" target\x3d"6.7" version\x3d"3.0"\x3e\x3ccomponents\x3e\x3ccomponent name\x3d"controlbar"\x3e\x3csettings\x3e\x3csetting name\x3d"margin" value\x3d"10"/\x3e\x3csetting name\x3d"maxwidth" value\x3d"800"/\x3e\x3csetting name\x3d"fontsize" value\x3d"11"/\x3e\x3csetting name\x3d"fontweight" value\x3d"normal"/\x3e\x3csetting name\x3d"fontcase" value\x3d"normal"/\x3e\x3csetting name\x3d"fontcolor" value\x3d"0xd2d2d2"/\x3e\x3c/settings\x3e\x3celements\x3e\x3celement name\x3d"background" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAeCAYAAADtlXTHAAAANklEQVR4AWMUFRW/x2RiYqLI9O3bNwam////MzAxAAGcAImBWf9RuRAxnFyEUQgDCLKATLCDAFb+JfgLDLOxAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"capLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAeCAYAAAARgF8NAAAAr0lEQVR4AWNhAAJRUXEFIFUOxNZAzMOABFiAkkpAeh0fH5+IgoKCKBsQoCgA4lJeXl5ReXl5qb9//zJ8+/aNAV2Btbi4uOifP39gYhgKeFiBAEjjUAAFlCn4/5+gCf9pbwVhNwxhKxAm/KdDZA16E778/v37DwsLKwsuBUdfvXopISUlLYpLQc+vX78snz17yigqKibAAgQoCuTlFe4+fPggCKio9OnTJzZAMW5kBQAEFD9DdqDrQQAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"capRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAeCAYAAAARgF8NAAAArklEQVR4Ad2TMQrCQBBF/y5rYykEa++QxibRK3gr0dt4BPUSLiTbKMYUSlgt3IFxyogJsRHFB6/7/A+7jIqiYYZnvLgV56IzcRyPUOMuOOcGVVWNAcxUmk4ZNZRS0Fojz/O9936lkmTCaICIgrV2Z9CCMaYHoK/RQWfAMHcEAP7QxPsNAP/BBDN/+7N+uoEoEIBba0NRHM8A1i8vSUJZni4hhAOAZdPxXsWNuBCzB0E+V9jBVxF8AAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"playButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAQAAACcJxZuAAAAtElEQVR4AWOgLRgFnAyiDPwMzMRrkHuwuCSdQZ14Tbpv9v/cf2UN8ZoMHu5/uP/l/h9EazK4sx8Cn+7/RpQmg+v74RBo11eCmgwu7keFd/d/wavJ4PR+THhj/6f9N1ZODWTgxKLhyH7scMvK3iCsGvbtx4Tz1oZn4HTSjv2ocObakAy8nt60HwGnrA3KIBisa/dD4IS1/lDFBJLGiv0r9ves9YUpJpz4Ji72hiomNXnTH4wCAAxXpSnKMgKaAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"playButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAQAAACcJxZuAAAAtElEQVR4AWOgLRgFPAwyDCIMLMRr0Hhws6SLwYR4TTZv/v/8f+UZ8ZocHv5/+P/l/x9Ea3K48x8Cn/7/RpQmh+v/4RBo11eCmhwu/keFd/9/wavJ4fR/THjj/6f/Nx5OzWHgwaLhyH/scMuj3lysGvb9x4Tznod343TSjv+ocObzkG68nt70HwGnPA/qJhisa/9D4ITn/lDFBJLGiv8r/vc894UpJpz4Jt7yhiomNXnTH4wCAHC8wQF60KqlAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"pauseButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAQAAACcJxZuAAAAYElEQVR4AWOgNRgFPAwqDAZAqAJkofPhgBFJg8r/2VDBVIY7GHwoYEG24RmchcnHpoHhDxDj4WNq+I0m+ZvqGn6hSf6iuoafaJI/SbaB7hroHw9f/sBZ6HzSkzdtwSgAADNtJoABsotOAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"pauseButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAeCAQAAACcJxZuAAAAWklEQVR4AWOgNRgFAgwGDA5AaABkofOxAoP/UMBggMGHAxZkG57BWeh87BoY/gAxHj6mht9okr+pruEXmuQvqmv4iSb5k2Qb6K6B/vHw4Q+chc4nPXnTFowCADYgMi8+iyldAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"prevButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAeCAQAAACLBYanAAAAmElEQVR4AWMYMDAKeBgkgBgGmBn4GUQZONEVqfzfz6ACV6Bekv5gMYMcuiKDR/sZDGAKrqz5sf/lfgZdDEW39jPYQxR82/94/y0gZDDAUHR+f3rpjZWf99/efx4CsSk6sj+pbMvKI/vhEJuiXWDrQjNmr921HwyxKVoPd3hAxsS16/evx+JwleUoQeCbMRkRBIQDk/5gFAAAvD5I9xunLg8AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"prevButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAeCAQAAACLBYanAAAAmUlEQVR4AWMYMDAKBBgUgBgGWBhEGGQYeNAVGfz/z2AAV2BS0vXgJoMGuiKHR/8ZHGAKrjz78f/lfwYbDEW3/jOEQBR8+//4/y0gZHDAUHT+f/qcGw8//7/9/zwEYlN05H/S3C2PjvyHQ2yKdoGtC+2e/XzXfzDEpmg93OEB3ROfr/+/HovDDZajBIFv9+RbDBpEByb9wSgAAHeuVc8xgA8jAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"nextButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeCAQAAABgMj2kAAAAlUlEQVR4AWOgAxgFnAyiDPwMzHA+D4MEEKMAuQeLS9IZ1OHKVP7vZ1BBVaL7cv+P/VfWwJUZPNrPYICqxODW/lv7H+//BlNmfwtTyfn9EHh7/+f9N1aml57HVHJkPwJuWZlUdgRTya79EDh7bWgGyKJdGEp01+9fv3/i2oAMmHPXYyiRm7zYNwPZ08vBniYcdDQHowAA/MZI93f1cSkAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"nextButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAeCAQAAABgMj2kAAAAlUlEQVR4AWOgAxgFPAwyDCIMLHC+AIMCEKMAjQc3S7oYTODKDP7/ZzBAVWLz8v+P/1eewZU5PPrP4ICqxOHW/1v/H///BlMWcgtTyfn/EHj7/+f/Nx6mzzmPqeTIfwTc8ihp7hFMJbv+Q+Ds56HdIIt2YSixWf9//f+JzwO6Yc5dj6FEY/It325kTy8He5pw0NEcjAIAWP9Vz4mR7dgAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"elapsedBackground" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAeCAYAAAAPSW++AAAAD0lEQVQoU2NgGAWjYKQAAALuAAGL6/H9AAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"durationBackground" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAeCAYAAAAPSW++AAAAD0lEQVQoU2NgGAWjYKQAAALuAAGL6/H9AAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"timeSliderCapLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAeCAYAAADpYKT6AAAAFElEQVR42mP4//8/AwwzjHIGhgMAcFgNAkNCQTAAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"timeSliderCapRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAeCAYAAADpYKT6AAAAFElEQVR42mP4//8/AwwzjHIGhgMAcFgNAkNCQTAAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"timeSliderRail" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAeCAYAAADtlXTHAAAALklEQVQI12NgIBmIior/ZxIVFWNgAgI4wcjAxMgI4zIyMkJYYMUM////5yXJCgBxnwX/1bpOMAAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"timeSliderRailCapLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAnUlEQVR42t3NSwrCMBSF4TsQBHHaaklJKRTalKZJ+lAXoTPBDTlyUYprKo6PN4F2D3rgm/yQG/rfRdHuwp5smsNdCImiKKFUAx/OaSpR1xpNYwKK4/2rLBXa1s1CnIxxsLZbhGhtD+eGBSWJePt7fX9YUFXVVylzdN2IYTgGBGCVZfmDQWuDcTyB/ACsOdz8Kf7jQ/P8C7ZhW/rlfQGDz0pa/ncctQAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"timeSliderRailCapRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAn0lEQVR42t3MTwqCQBTH8bcIgmirJYoiCOowzh8ds0PULjpRqw5VdCZr/WueMJfwC5/NezOP1lcUHWbv5V0o1LYSVVUjTXP4xYM4KTWYEB2ybFlcSSmLoK4F4vj4JmN6BFpbHs5krUNgzMDDLw3DCQHfTZL0Q85NYH0/Is9LNI240Tie0XUaRVGyJ4AN+Rs//qKUuQPYEgdg7+2WF2voDzqVSl5A2koAAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"timeSliderBuffer" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAeCAYAAADtlXTHAAAAKElEQVQI12NgIA/IyMj9Z2JhYWFgAgIGJkZGRhDBwMDEwMAI5TKQDwCHIAF/C8ws/gAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"timeSliderBufferCapLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAY0lEQVR42uXJyxGAIAxFUfrgI5CgzajdqlWxQffxaeiCzJyZ5MYMNtb6zTl/OhfuP2BZQ4h1mpLEmOWPCMd3pESSM2vE0YiKdBqJuDEXUT0yzydIp7GUZYMKAhr7Y4cLHjPGvMB5JcRMsOVwAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"timeSliderBufferCapRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAYElEQVQoz+WLyxGAIAwF6YM/CdqMlCtdcRHvMSIw9sCb2ctuIsQaU8pUpfQppT6mdC6QtZ6McYUPUpMhIHkP9EYOuUmASAOOV5OIkQYAWLvc6Mf3HuNOncKkIW8mT7HOHpUUJcPzmTX0AAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"timeSliderProgress" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAeCAQAAABHnLxMAAAAH0lEQVQI12NgIAT+/2e6x8D0k4HpOxj9AJM/CWpjAACWQgi68LWdTgAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"timeSliderProgressCapLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAQAAABOdxw2AAAARUlEQVQYV2NkgANG+jP/+zJkMtgCmf99vi38KPQTJPpq6xsvqIKznxh4ocwjCOaebQyeUOZmX4YFDEJQw9b4QQ2DAfoyAVkTEmC7RwxJAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"timeSliderProgressCapRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAQAAABOdxw2AAAASklEQVQYV8XLIRKAMAxE0R4QbhrXoQqJxWJxCGZqaKs/m1yi+80TSUqzRmNjCd48jMoqXnhvEU+iTzyImrgT+UFG1exv1q2YY95+oTIxx/xENX8AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"timeSliderThumb" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAeCAQAAACP8FaaAAABMElEQVR4AeWSv0rzYBjFfy1NlU5RKC3dCjqZDwRXEapOuuik+BfbNLdUeg86pHSrm1Z3G3w7VAdbB+sNFFKIZ1FCjTjL95wQOOd3IC/vE/6vSZEmQ5Z5KUtGLhWjshYLbHCIKx2wLmcp/cJzOFTb/vtoGk7D8bDtc4GjNP2J/+ENzFv0FBnpORpHA4OnVBWwKFANTD96jKkfBYYqRVFyVC5bCr/pqsWmKDZHd8Okwv2IY1HyuL0wqRCE1EUp/lR4mFAT1XNym/iJ7pBTCpBnp5l4yGaLXVFsVqh1zCzuGGoiNuQoUcG7NjPYU1oSxVKrzDZuw+++BtPe5Oal4eOypdQWRVfNoswa+5xTl87YkysrjW3DpsQyDquSw5KcjXB83TlFeYoU9LbltO7ff5i/Mh+pOuncDFLYKwAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"timeSliderCue" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAeCAYAAAAl+Z4RAAAAcUlEQVQ4y2NgGAWjYBTgBaKi4llAfASKs0jWbGNj96S1tf03CIPYJBkCsrW6uu53bm7+fxAGsUFiJBmQlpbxOzMz5z8Ig9hAsaMkecHIyORJUlLq78TElN8gNlAsm9RwyAbZCsSHgDhzNFmNglGAHwAAo/gvURVBmFAAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"hdButtonOff" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAYAAADQBxWhAAABf0lEQVR42u2VvUoDQRSFA0awMIVCsv+z/1oE8yOE9MYmtb2P4AspSOyECFZqtU9gbZvK6CNoNZ6zMMuSQpxdEAJbHC737pz59mbmblpSyn9XA22gDXRLod2uMYfWkKwh+uc60LVtO9J1RWXBn4N1oNL3QxkEEcwuzYybOWMh07QJ4xqK/ryuBQ3DWEZRoowdx3FfhAgkI3NVp7IsO5xMpnPDsFae59NHvzaURgWlWpblPEOSkbmqQzfQK2DT8fj0HB0rrz40jlOqgA4Go1m/f3LJWIYC8uQ4nkSX94vF3S5qX8qrDU2SlCqgOMMrAK4Zy1B27nlCIj4i34G+lbcC9ChXuSNeFEbmpZe5RZdv+BU4ZjM8V159aJoe5yp3JIS/eaZcv7dcPhzghc6Qr3DZlLc6FOelRoTn9OvI4DKxw2rQXs/84KzRyLPhTSSQGzIyV2OBdYzIYz4rgKxjn88/Q4fD0QUNNT6BBL5zH50Pfhvahzo1RH+7+WtroA10O6E/bVCWtAEB8p4AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"hdButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAQAAAB6Dt0qAAABPUlEQVR4Ae2SsUrDUBiF/0EFfYK8Rl4g5BUUHGILRWghUHAQHJzaUcjSgB1EtCApliDoUApSKggZRFSUQsVAawspElz1OunxhwtZcm0Ht9LzQfLByVluLs145lkkjXQyyPwTg3uNv0tFKzuR+MAkIlF2eJyKPhBjRBMZYyBIp1SMEV6nMgIZlIoZQkJuIw7RiMll36XN5e31k0AkramYdiGhQjPsohlSgT13GTy8WXurR0mrmt5BQla+ZJ/mS2SxF8+GT7joLRRvvmWrnAaQULbi1R4rHmXZi/VhAO9laev6R7bKaQcSsv3+Lfw+2ey548B/t/Yz3pVs1dMWJORW4xaqfEzsfEwrO2te5ytpFVPjHJJntPnZ5jc708M9muwS1c/Ra8LHNGrKK6FlnENRxyQOPjcc0v5z/Wc68/wCXWlzVKUYIC4AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"ccButtonOff" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAYAAADQBxWhAAABzUlEQVR42u1Uu0oDQRQVTCMopMjmtZvdJPswKCQbC6tYCEqMBDUGrf2NCDF+gmXEyiZWiTb+gMTGxtrGwmh8IOKjUoLjueNGfCBk10rYC4eZOey5Z+7M3O1zww033Og5BCGQA9oAcw6uz9kxbYfDIpMk2TGg58Z2TJmixFg0GueIRBQWDIZ5BX5/kIli5AcfCIS6PIH0nLdlGoupLB7XmCxHyegymTSXa7UdoVBYHBVFqQEDMjozzfRCvd7w5fNzKfD74ElHevumEHKEQiJD4nmYz4JvwWirWt30YiO36fTYNKotgj8Hv1GprPvAP1obtm+qqjqBhC/l8toAkh18uqs7rK8ZY/0Yj8AT90o80LG09k01TQe48Bnw4O6asqzw5DjGXVR2Qt9iPLb4Dh07NnGvqhq0jkwNQvehTCYSI0tIeIWqtq1jfAA/bhiJFcxvcPzVUmlVwPwJVZLWvqmuD3MgGYlbGHPN5qE3m52JYU0PifhTGEwRn8lMaFjvYVNdrXNT7BjGX1tGkvgL/dYyxMv0vTNTahH02ocY1cBEpTbgeL8z41eeNKSn6+jZNJUyiyT4y28Q+gvK07MpWsEDDAJDzsH1nj433HDjX8YbqHFYmhICTLsAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"ccButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAeCAQAAAB6Dt0qAAABWElEQVR4AWMY5mAUsDJIMBgy2DE44IR2QHkJoDoMINHQ/eTbl//44JNvDd1AzRjA8N63p/+f4IVP/9/7BrQZA9g9/H+fIHz4H+hsDOBw6z8EnvqZsJ6vznDCkke3/h/9Hr2ap9Z08oqnMFkGByxaL/+HwMiVafNufFl+hWvmiR+BC/IX3/yy4Bz/nJN/wbLYtZ75D4In/3GV7n56/v+1/zd/H/rGkHPgJYh94/fp/2B57FqP/AfBg/84SlY/O/L/8P+JLze/Z8je8PrI/0P/Jrza+Rcsj13r3v8guO9/+LKEhZu+9lzmn7zrl++c9BWbv7WfE5iy/S9YHrvWbf8hcP+P0FVsVSo9y57s+L/vm/9ytiqtvhVANlgWq1a79f8hcDPQR9eBAbIHyN7y/yyQfQnEhkCskWM4/9uq/4TgfKxJQiK6e/a3pf/xwZlfo4AJkZLkP6zBKAAAGMt/2TouFxQAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"muteButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAQAAACY0sZTAAABZ0lEQVR4AWMYjGAUMDEwMzCSpoUxju+kDQMXAW1AaRYGdiCGsFjchd/OWmELFMGrhd1a4UUTAy+QzXLSdKMhA1+Z/tuF0qIMTLjdz9tp+27ly/0M4kBbWGdqv1/gJcMgdLz6YAA2u9gYhBgkGGR2pH3ZfWf/1f0Mshdsk8UZBDYlXMthEJhqfbuVgQ9Tk9D//SD4dv/F/eeBkEHuaNjjegYBT/k78xiEOcWuLWIQxtQkcWI/MmSQYhC/shioUPjUAhB5cgFWTQf3I0MGaQ6JwyBNIofBmsAkpvN27UeGDPI349dXMghEKu2byyAsKLZ/IYMQzoBoTNm4e8v+LcCA2GBoKsQgcDFjcRqDwBr7dU0MfLiDnCfaavHKdaAgZ2ZgXWd4cZ6eJIPQ5YYZXgzseCNXQ35GPSRyt+lVaTLwTTA9NJdTmIGJ2GTEzMCSKPZifoklpj14jTDj6jJj4CI5nYOzxkCCUQAAMVp+znQAUSsAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"muteButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAQAAACY0sZTAAABfUlEQVR4AWMYjGAUsDJwMLCQpoXRTnZZIoM0AzMBZQzcDCIMXEAWC5Dk0tZ6fK0uFyiCBzAziCh5Xd7PoAJkc64I7QxhUPWLf/yQ3xjoTByAjUExrvzB+5f/GewYOBn4cgOf3ddxYNDftH1OCza7BBgMGBwYfCas/fjnzv+r/xn8NiXYGTJoTZ25ZymDTn7W8UMMapiaDP6Dwdv/F/+fB0KGgJXtF3YyaGp7XLrLYMhqce4hgyGmJocT/5EhgxuD7ZknDEYMJgcfMBgzGB8AkZiaDv5HhgzuLPa7nwBNN90N1gQmMZ236z8yZAjcN3H+JgZNM+8tQOdxWm17yGCAMyBSV6//s+X/lv8Mvv2BChoM2hsXd89n0GnKn7+PQRV3kCvYlsx6v+4/gy0DOwNvU8SJO1LWDAb791bUMgjji1xhMc/u3QzKoMid6hPtxaCakrbzDqsBAytxyYgZmFQ5bfXu3Q1Lx7QHrxHykgWRDFJAA0gCLAzsQC0DCUYBAC3AlmbNhvr6AAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"unmuteButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAQAAACY0sZTAAAAiklEQVR4AWMYWWAUMDKwMLADMUla2K0VnjUx8BKvhYmBt83m3cp3+xnEiFHOxiDEIMEgsz3l6+5H++/sB7KJAEL/94Pgu/1X918GQuI0SZzcjwSJ1XRgPxIk1nnb9iNBoCYSAqI6ZdXOtfvXAjWREuQ84VZzVi4DBjmJkassN7GegZe8ZDQSwSgAAJ/LQok1XVtuAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"unmuteButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAeCAQAAACY0sZTAAAAjUlEQVR4AWMYWWAUMDJwM4gwcJGihZlBRMnr0l4GZeK1sDEoxpQ+eP/uP4MVMcoFGAwYHBh8+ld/+vPo/53/QDYRwOA/GLz7f/X/ZSAkTpPDyf9IkFhNB/4jQWKdt+0/EgRqIiEgElct/7P2/1qgJlKCXMG6eNL7Zf8ZLEmLXGFhj5bdDMrkJaORCEYBAOZEUGMjl+JZAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"castButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAABuUlEQVR42mNggAA2IBYCYgkKsBDUHDAQevr06X5KMdRQMJDYvXs3SECLTNdpQfVLwA3cuXMnigCJAEO/xPbt2ykyEF2/8NatW0ECwuQaCNUPNpAZiAVqamqsgTQXuQZu2rQJYqCXl5cQ0LkpjY2Nbuzs7BJQQ5lINXD9+vUQA8PDwyWPHz++4/Lly/uvXr26btmyZUkCAgKiQElWIGYk1sC1a9fCvczNwcEhHxER4T59+vTuEydO7APiqS4uLkpQQ4kycNWqVRADQ0JCxIAu7JgwYUI0CwuLWlpaWtDmzZu3AsVmqaurSwIVsRBj4IoVKyAGurm5iQKdO/fUqVP7Tp48Odfe3t4wNjbWG2jo3o0bN5YAFfES4XUJYFDBvQyKBBmgIX5r1qzZBHTZAh4eHrWOjo6GPXv27ARaqApVI4wvpyxZsgRiIDDsZM6cOTPT19fXLDIy0hvo2n3z5s1L8fT0tF66dOm+uXPnxldXV+vdunVrPz68aNEiSF4OCgqSBUU50GXTgQLSU6dOnbFt27YpIFfPnj17JdCCalA6JeBClNKGHYgFgZgfiDmhYcYL9SaI5iEyYsAAACZV+irLroZ6AAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"castButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAABuUlEQVR42mNggAAOIJYAYgUKsATUHDCQePr06X9KMdRQMFDYvXs3SMCCTNdZQPUrwA3cuXMnigCJAEO/wvbt2ykyEF2/1NatW0ECUuQaCNUPNpAFiEVramr8gTQfuQZu2rQJYqCXl5cE0LltjY2Ncezs7CAbeIGYmVQD169fDzEwPDxc8fjx498uX778/+rVqy+WLVvWLCAgIAOUZAdiRmINXLt2LdzL/BwcHFoRERHx06dP33nixIl/QHzcxcVFF2ooUQauWrUKYmBISIgs0IXbJkyYUMnCwmKclpaWt3nz5k9AsXPq6upKQEWsxBi4YsUKiIFubm4yQOdeOnXq1L+TJ09etLe3d4yNjU0BGvpn48aNs4GKBInwugIwqOBeBsWsGtCQjDVr1rwFuuwqDw+PcUdHx+o9e/Z8B1poBFUjiS+nLFmyBGIgMOxUzwCBr6+vR2RkZArQtf/mzZvX6unp6b906dJ/c+fOra+urra7devWf3x40aJFkLwcFBSkDopyoMtOAQVUpk6denrbtm3HQK6ePXv2I6AFS4BsMQIuRCltOIFYHIhFgJgHiIWgmBdKCxAZMWAAABFDD0iNkbKIAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"castingButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAAB60lEQVR42mNggAAOIJYAYgUKsATUHDCQ+E8FADUUDBRevXoFEnAAYgsoTSwGq4fqV4Ab+OLFC5CABZkus4DqRxj49OlTsAtBNKkYpg/ZQKmHDx+CBCxBNKkYZCCUBhvIDMQis2fP9gfSKjdv3vx07969/6RgkIFQGmwg35kzZ+omTpwYxcPDo6mmpmaybNmy6devX/9569at/8RgkIFQGmyg8Nu3b39++/bt/9evX1/u3r27lYuLSy87Ozvy1KlTz65du/afEAYZCKXBBvKKiIhol5WVpe3cuXMX0PB/z58/P+3u7m4dFxfnD3T9x0uXLv3Hh0EGQmmwgYJPnjzZvGTJkkpOTk6TysrKbKB3P718+fKKvLy8QUNDQ965c+f+48MgA6E02EChy5cv33z37t3/N2/eXA4ODnYrKipKuXr16s8LFy4sAsprAl1+6vTp0/9xYVA6hNIQLwOxWnFxcd7Zs2ffvn79+q6cnJz5ggULFj148OBXUFCQNVBeCYjN8eWU48ePww0Uef/+/en09HRfYESkAJ3+Z//+/f1OTk7uR44cAbG7qqurCeYgoFp4XhYDBSgwL14FpcNNmzYdunHjxkWQq4FevXb+/PmNQLY4EEsSW9pwQDWIAjEPKJJA4QoNCiEon5WBSAAAryiVoYy0dtoAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"castingButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAQCAYAAAAWGF8bAAAB60lEQVR42mNggAAOIJYAYgUKsATUHDCQ+E8FADUUDBRevXoFEnAAYgsoTSwGq4fqV4Ab+OLFC5CABZkus4DqRxj49OlTsAtBNKkYpg/ZQKmHDx+CBCxBNKkYZCCUBhvIDMQis2fP9gfSKjdv3vx07969/6RgkIFQGmwg35kzZ+omTpwYxcPDo6mmpmaybNmy6devX/9569at/8RgkIFQGmyg8Nu3b39++/bt/9evX1/u3r27lYuLSy87Ozvy1KlTz65du/afEAYZCKXBBvKKiIhol5WVpe3cuXMX0PB/z58/P+3u7m4dFxfnD3T9x0uXLv3Hh0EGQmmwgYJPnjzZvGTJkkpOTk6TysrKbKB3P718+fKKvLy8QUNDQ965c+f+48MgA6E02EChy5cv33z37t3/N2/eXA4ODnYrKipKuXr16s8LFy4sAsprAl1+6vTp0/9xYVA6hNIQLwOxWnFxcd7Zs2ffvn79+q6cnJz5ggULFj148OBXUFCQNVBeCYjN8eWU48ePww0Uef/+/en09HRfYESkAJ3+Z//+/f1OTk7uR44cAbG7qqurCeYgoFp4XhYDBSgwL14FpcNNmzYdunHjxkWQq4FevXb+/PmNQLY4EEsSW9pwQDWIAjEPKJJA4QoNCiEon5WBSAAAryiVoYy0dtoAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"trackButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAeCAYAAAA/xX6fAAAB3ElEQVR42u2VP0sCYRzHLwiFUm4oIcUGz4ZMsRqkhhan2hzyBWSvwMXhAsGlFxA46y2JeJpDIeEfDnV1UhdX/+Du5mS/LzyC2F09KDjdAx94nuf3fZ6PPj53CovFQtglgik0habwX+FasxDHhJfwM7xsDjUbcUZc6YB5G69wj7C7XK5AqVSSR6NRfj6f1wD6xWLxBTXKXNMazQhIeYX2SCQSnk6naqfTySYSiZgkSXcAfZpTUAuFQrHxeKwZwSu04NNPJhM1k8m80thHiMQ+A30fasPh8EMUxQiNw0SUeFrhgTjhER6pqio3Gg2FySzC74Y5H2WyyFL/Zpsj9Xa73Xw8Hn9m38aoiZSJIUv9+16vp63DKwz0+/2G2+1+pL6HONCRYc6DDLLUv2U3M7rJkQaazWY9l8u9z2azCo0lHaGEGjKtVquONezbbHSkF7TR52Aw0NrtNhYFdYRB1JCh7BfWYHP6TbVVeIX+arVaq1QqGmBHtd6ulnVk2Qth/SXA/eCf04NdK5fLGjASLuvIYo3RzeIROlOpVLpQKGiAxpc6+1wu68lk8g2XYxuh1eFwBGRZTiuK8m10aVBDhrI4Tus2QoFt4CROiUOdfQ5ZzfmXjEto/gGbQlO4c+EPA9e3TyseGL0AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"trackButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAeCAYAAAA/xX6fAAAB3ElEQVR42u2VvUsCYRzHj4awhq5AF3Mol5bSFjMSstYabGusuaVbHBwEsf9DpMDBF4QGB8FBhSYnvQahIfTEtsIg6AWevt94hLCzDoWm+8EHfi/fe74+j/eiCCGU/0SxDW1D2/BPw5FwgGXgBzsSv+xxtgg2wZ4J7C9aNZwBS263O1QoFC673e79qwzm+Xz+ijNo9sUvQVOrhkuRSOS43+8bjUZDj0ajSa/Xe0SYo3fLWSAQSBqGIcZh1dDBX9/r9YxUKnWNOgicYFbCPMhZp9N5UFX1DPUx0EDiG6dgxYqhO5fLXVYqlVtp5lB+BntBaHRqkR9Mc6T+ZrN5r2nahdzNuHBCk6QW+Umr1RKjWDUM6br+4fF4zpGvgwUTM/bWqaEW+aG8M7VJjjRUrVbfM5nM3WAweEa9YWK4wRk1tVrtndfI3Ux0pNtY6LHdbot6vc7GronhLmfUQPvEa7g4/lPxHauGO+Vy+a1UKgkij2o09oZzauULYfQlYPnB38KD/VosFgUZZzicU4s6MO7OsmK4mkgkbrLZrCCowybrhIfzeDxe5c0xjeG8y+UKxWKxm3Q6/YLaZ7KOjzNqoOVxzk1j+GXKnYI1oJqso8rZqtQqExvaH2Db0Db8d8NP8a/SZovcDd8AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"fullscreenButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAQAAACC7ibdAAAA5ElEQVR4Ae3KsUrzYBhH8RPIFAJ5O3/ig5COgVyHW7N09x7aXSrESafuHeLi0A6iGEX+Y3edLMqnpe7egfbFMZCMXfo762GH9gIijIx8W0rcMQ9tU/3oL9KOGXdYLOuNfOS0CrGLyVr/fZ1zMht9a6VXqV6JjFa9efmiZ43PDoqnCqMh8BGS4IjpT8vTMYY7NiIaooHhsNnovqRPTA9HSOCjwT6ro+Jy8qV3PZT0aJUt9VavdadbnY9IaJUv9KiF5jqZYIQd87V80/rfAEdAq/RKvht9VEPrmmNS8m0ZRkTAzuz9AlNJVl+tEWchAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"fullscreenButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAQAAACC7ibdAAAA5klEQVR4Ae3MIUzDUACE4b8VlU1FaQWEBPlQna+oxqHm0dTicShQcyWZwSBWEgohEIKcB8UKAZbhcZXHmsw1eZUz+357OdZow8HHkJItSwiwcodmUWuFpO852s2nzUJtZFh5mPNyrq+23nE4Lv4007templIsYon1ZtedXKzkz/XGDocXBw8QiICBqPq9JJ9ogODT4d/aIgw4+KhYkBAzBbe6qLD/NR7+UX5q089VsRYpVN9NHPd605nBSFWWaknlZroqMTg9Yyv1TZqto+JcLBKrtR2q+96aHCxCkjIlqUYfBzWZuMfAHJlDLF+xFEAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"normalscreenButton" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAQAAACC7ibdAAAA50lEQVR4Ae3KsU6DUBhA4QMNAtsNFcJLyKBx8mXYmNxkculDuJG4OOOmcbr/QNS1xKaJqxJjTJpUk84KuHW4d+nY76yHvV1zxlx8AiZYeJeHBKgmX14wte1qXZ1l98VG/8iyJMQo+ZJVvdGddPohx8co7eRThvWmQOFa5ncZWtSnRwQ4GEVvMvQh62oW2+YDItK+BIW3PTt4KJJxiPrVyJnF39Wv/EdkmQlOsqd6IUOkGLmou+JVv0ifdfabfKVbaXVTt0KCUfhczmWur4rj7LFCYTRhelte5yiC8xgPbHuIj4sztrdbfxJjV3K8mZ7yAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"normalscreenButtonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAeCAQAAACC7ibdAAAA7ElEQVR4Ae3Sr07DUBzF8e+daKaaiaYNAoH8uc43pK+AmsHimETxDAQBQZVkCQhAUFMBewkUCG4W/ib4haTykCYzmFszuc+xX3lYtw3HAEdEQsqQHvGekWKz6qFh3Jfbl9+Znta/WmrekBFU/GjRLvWuN11UJASVXh/yetVxjRH1xM/qNm+3D0lxBOVP6vaiTz8xBgSNyCkpKTBiHP84YoyiC8gZETSY2LfXCjlBjnRretk26kZJUISd1I+679YbJ7NqoTvd6Ly9FQVB2ay51pX262x65jGChoyPmoMKI901YujLMxKi1TnXa+MPEjlkhvYbWGMAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"volumeCapLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAeCAYAAADpYKT6AAAAFElEQVR42mP4//8/AwwzjHIGhgMAcFgNAkNCQTAAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"volumeCapRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAeCAYAAADpYKT6AAAAFElEQVR42mP4//8/AwwzjHIGhgMAcFgNAkNCQTAAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"volumeRail" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAeCAYAAABaKIzgAAAASElEQVRYCe3BsQ3AMAwDQRIW4Cqlkf031AZKVkg6An8nAQCAH3zOPQpQe28lqJcS1FpLCcpWhJKsBGVbCaq7lcAzcwkAAHz0AE0SB2llBfTtAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"volumeRailCapLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAeCAYAAAALvL+DAAAAeElEQVR42tWKQQqDMBBFB3cFt9oQQ0wniW51b5f2ti30ZLX1AN+ZQA/hhwfz/zw6eZrmmoWn8NUyCh9jLJzzoLY1L2sd+v6GEBikmh7MCTHmYvyYI1LKBeo69/Y+SBkKtCz3SaztPxKAal0fs5ry2Emjo3ARajpNDtqHL/b2HUUVAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"volumeRailCapRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAeCAYAAAALvL+DAAAAeUlEQVQYV9WKOw7CMBBEV3RItAmWYzlmbUMLfSjDbUHiZASFfpj1LTLSW+18RLarrjt+yZPUFoQQ4ZwHgw+5SEqKcTzB+4C+dy/JuUK1wAouVimlwlDNtvgxOMOIMWEYwrsFZtgu03S/Cp/Vmnl+3ADshOdA9s1sSn8goC/6ib5oHgAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"volumeProgress" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAeCAQAAADwIURrAAAALElEQVRIx2NgGAWjYBSMRMD4/z/1DWW5TQOXsnwdMoZ+GyouHQWjYBSMTAAAnO8GxIQ7mhMAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"volumeProgressCapLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAeCAQAAAChtXcIAAAANUlEQVQY02NkgAJGOjH+9zEkAxm/JrzJ/wYSufTxLx9Y6shHBghj10SGPKji9RMYkhjp6EIAcaIN1SJ2FnYAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"volumeProgressCapRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAeCAQAAAChtXcIAAAANklEQVQYV2NgoCP4//F/H5hx5/+z/78mABnn/5//f+kzkHHkPxCCGLv+A+FEIGP9p/UgFXQFAHkZGwN2fDIsAAAAAElFTkSuQmCC"/\x3e\x3c/elements\x3e\x3c/component\x3e\x3ccomponent name\x3d"display"\x3e\x3csettings\x3e\x3csetting name\x3d"bufferrotation" value\x3d"90"/\x3e\x3csetting name\x3d"bufferinterval" value\x3d"125"/\x3e\x3csetting name\x3d"fontcase" value\x3d"normal"/\x3e\x3csetting name\x3d"fontcolor" value\x3d"0xffffff"/\x3e\x3csetting name\x3d"fontsize" value\x3d"11"/\x3e\x3csetting name\x3d"fontweight" value\x3d"normal"/\x3e\x3c/settings\x3e\x3celements\x3e\x3celement name\x3d"background" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAA0CAYAAACQGfi1AAAAYklEQVR4Ae2VwQ2AMAwD/cgKVRbJuAyH+mOBfMMQyBKCuwWsxoaLtfKQkaiqtAZ0t5yEzMSMOUCa15+IAGZqgO+AFTFTSmZFnyyZv+kfjEYH+ABlIhz7Cx4n4GROtPd5ycgNe0AqrojABCoAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"backgroundOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAA0CAYAAACQGfi1AAAAY0lEQVR4Ae2VsQ2AQAwDXWSFF91Pkf1rxkAZIm0YAllCcF7Aiu3/i7WOU0ZFZm6rQXfLaiCzYkbuC+b1EWHATM3iHbAiZkrJrIiSP/ObQjQ6gAcg8w/AsV/w2AEmE1HVVTLqBmJaKtrlUvCnAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"capLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAA0CAYAAACHO2h8AAAA4UlEQVR4Ae2XwUoDMRRFT17GTscIMoWOqwF1WUSFIv6Autf/X5TuxG6FBkOeHfAHpk+GLnI+4HBzLzyI44/l8uoBeAVugJqRuIMA4L1t24+u685DCGci4hhJBdwPkr7vL3POLsaIqnKM6G2xaJuUksPAILquqtlMFayiuYhzYDMJIygi+2qonloi0CkTldXK/NOXXVYrZRs6UgyUjsrxL6d28sP2b4n0xJ62z1nVHbCutolx/4MRH8LFt6o+Nc28tqTyq9Xd5273RUrpVsSL915gvNCt188MbLebR+Dl2K/oL+WmRveI4jXNAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"capLeftOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAA0CAYAAACHO2h8AAAA5ElEQVR4Ae2XMU7DQBBF346sIDAUDoqprNBCm4Im3IPcAE7EEbgId6BF6akQjheZGTYSF7DXQi7mSdM+zf4vjbSBP1arqy2wA26BUwZSJAHAY1VVT3VdX5RluZDEYBGwPUqaprlUVYkxYmaMEe2Wy+q873shgwK4KYrFiRnkis5EgkCeScjHRQNaw2xuG4HNYiNvzeufPmxvzcPOz8jIwDPy4++n9t8P22Qb2cye1qqahhAkt7W3GLvvKep/+Uyo/igYY0fW6+vXtv16/kgcDl2nagkYOmGzuePIfv9+DzyM/Yr+AujSfWZZzzLnAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"capRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAA0CAYAAACHO2h8AAAA20lEQVR4Ae2XQUrEQBBFX4e29QJDVgFv4Cb7wSt4Ps8wLtw5B3A97mfmAFlkkbaZMpAynkBiBRGpd4Ci6j/4UGGzqR9ZjgBn4AV4A4ht29YsZJomzTnXXdfd9X2/A55iKYWlhJmU0nXTNAl4mIedwnZ7/4wBkcvH8Xh6jaqYiDFdAbcRFAtVFQJwU7ESPuh7zPrX3wj0T2zk1lz/+mG7NQ/bnpFixDPy8veq/dViW20j/W+drTOAmK2JXEbgbDrt628bhqEA+x+dpjMiMuY8lFLed8DB+orugQPAJ8i7bEsKl1PuAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"capRightOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAA0CAYAAACHO2h8AAAA2UlEQVR4Ae3XwUkEMRTG8X8eIaLgwYXF0xRgKYsVWIIVrR1sI3uwANkSvMxhDhOzRoZ5pgOZSZiDvF8Bjy/vgwdx+/3jO8tdgQtwAs4A7nB4/mShuYgx5r7v4zAMR+DNp5RYyjknIYTbrutugNcy7ENYQVUpoZimSXa7h3vgxatSxfsQgCcPdZNEnAB3QiM26G/V9bdPBLp9ImvN6t9y2daaLbtiR0ol25Edfzu1mx62Zon0v91sVZ2Bq1Ap5+8f4FL1tLkYC+C06mla5CLGcUzp6wicm31FfwHzmG90m7lXIAAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"bufferIcon" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAABGElEQVR4Ae3Rr0pEQRSA8Zl1b1uDQTAt4j8QES1qURZvEf8lfYJVsfoAisYFq9mgyfUFVptgMtk3CAaD6DN8HoYbFhk9w9x0Yc6XDsv8LrNj0vgnTZo05LzzyR7m/wxafQC+sDHQENkv6DsG2uFV2i62nDc+2C82SybVwqAX+tIzxlOdzBUEPTnosTy0wgM9lryQpS7pVwutetAiN3RZU481mJYaf0PX9KR7rALNMCtNaVC3PLTALXesYpSGlatFVDFonnNOmfQeGKHFOqNhUIcr6cwLtdiVNkIgy6WDLrxQ7qBNrApJy0J1mCu2CY6k4qKMCbJFM/TPHvzeASfS8cBvtbhXazvosPzzN2lL4/GQXoISlKAqQz+eXnU2Tp6C2QAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"bufferIconOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAABGElEQVR4Ae3Rr0pEQRSA8Zl1b1uDQTAt4j8QES1qURZvEf8lfYJVsfoAisYFq9mgyfUFVptgMtk3CAaD6DN8HoYbFhk9w9x0Yc6XDsv8LrNj0vgnTZo05LzzyR7m/wxafQC+sDHQENkv6DsG2uFV2i62nDc+2C82SybVwqAX+tIzxlOdzBUEPTnosTy0wgM9lryQpS7pVwutetAiN3RZU481mJYaf0PX9KR7rALNMCtNaVC3PLTALXesYpSGlatFVDFonnNOmfQeGKHFOqNhUIcr6cwLtdiVNkIgy6WDLrxQ7qBNrApJy0J1mCu2CY6k4qKMCbJFM/TPHvzeASfS8cBvtbhXazvosPzzN2lL4/GQXoISlKAqQz+eXnU2Tp6C2QAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"errorIcon" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAAB3ElEQVR42u2Tv0sCYRzGv5WFJIVgkEVLSy1ObWGDUE0OgdRYtBZC/QENFv0DDTW0FEYJGkgEBUZCEFxYlJpnEMSpUxpBNAkiT++rlb+uvNOpuOcz3Pt+j3vgeN8PkRYtWv5Z2qmb0d58kXl7ZXuFzM3W6E3jybfUW+8E6ZupaaXB3ZNnPGPnlAbZruF02ebTuRRSSOds89TVaE0bWYJiEhIjiaBIFjZpKKaF1TSePknDuUamRmo6dKPRzCNKRDO6UepQW9NCAxseCXHGlHvKzZ8SNjw0wN6oSqfFIWXvwSE72YsrKWtxkEHdsQ/5hRjuCpCNbMVVDEdXNKzmGhhnlqT8DYrwoq+1lJ9ZIqNyu0aERAhXn/Cir3UIQoJGlJpndm2KuPyGF5V2IlxbyszTmybi7xcowYvK9/H3/sn65hXsEnBeBi8q3wuKzGN2PeQCKIcff+Xkoa55zK4zMYCTCubcs+7KSQBn3DzdL3Ytrt3iuIpXRvXsFs516vnFruuMH8oI/Whewa4gDmsY8435aqfBH81jdoWzXtTi8Dm8cvOwrHkFu/zwyJDBi+yc/aCMecyuUH4f6rjOTy9Xm9cXiRxgTyX7iESor7LIQENk5XdYFVb2lYG0aNHyF/MB+x5LQiE6gt8AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"errorIconOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAAB3ElEQVR42u2Tv0sCYRzGv5WFJIVgkEVLSy1ObWGDUE0OgdRYtBZC/QENFv0DDTW0FEYJGkgEBUZCEFxYlJpnEMSpUxpBNAkiT++rlb+uvNOpuOcz3Pt+j3vgeN8PkRYtWv5Z2qmb0d58kXl7ZXuFzM3W6E3jybfUW+8E6ZupaaXB3ZNnPGPnlAbZruF02ebTuRRSSOds89TVaE0bWYJiEhIjiaBIFjZpKKaF1TSePknDuUamRmo6dKPRzCNKRDO6UepQW9NCAxseCXHGlHvKzZ8SNjw0wN6oSqfFIWXvwSE72YsrKWtxkEHdsQ/5hRjuCpCNbMVVDEdXNKzmGhhnlqT8DYrwoq+1lJ9ZIqNyu0aERAhXn/Cir3UIQoJGlJpndm2KuPyGF5V2IlxbyszTmybi7xcowYvK9/H3/sn65hXsEnBeBi8q3wuKzGN2PeQCKIcff+Xkoa55zK4zMYCTCubcs+7KSQBn3DzdL3Ytrt3iuIpXRvXsFs516vnFruuMH8oI/Whewa4gDmsY8435aqfBH81jdoWzXtTi8Dm8cvOwrHkFu/zwyJDBi+yc/aCMecyuUH4f6rjOTy9Xm9cXiRxgTyX7iESor7LIQENk5XdYFVb2lYG0aNHyF/MB+x5LQiE6gt8AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"playIcon" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAABHUlEQVR4Ae2Vu0oDQRRAB2xSWVmmtQncLzFREUUsnW/wJ0SCWgQV8TUQBBEsjlgIFoJFCsFCCT5QgwZFtPGtncUWIcTZnd2pAnNOf2Bn5t5VgUCge8mpPtWrevxD+cbi1KTq948VXvjlbMM/Jk2aPPPjHZM7Ip88Y3JLy0e+M8fkmnYfMsbkkk7v+Uodkzr/2+AzVUxOsXvDh3NMToj3inenmByT7AVviTGp4WadV85XK0WVs4SOcHd3rVyyhg5xc91M6NhPOyDZFTOuEw97n3iXzZh2uv497C6YUe38ILFQMSM61Yjs0Om8Gdaph3abdmfNkM60RrZoWTaDOvNi2yRyxpQsETcKVapMm6JHJCI/tzTgEfH4QXYxgUDgD+1pwmmFlV3oAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"playIconOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAABHklEQVR4Ae2VvUpDQRBGt7BMaekD5AEsU0zvL6KI76CdL6FDUItgIYJNEERIoVgIFoKFhWChBBNRYwwZRBv/tfostgghuXf37lSBPac/cHd35ppIJDK45MyIGTZDRk2+UVteNaP6WOEVf7hu62PUQgsv+FXHqAnrszJGD+go+AmO0R26bQfGqI5en/CdOUZV9LeBr0wxukKy9/j0jtEl0r3Fh1eMLuC2hndnjM7hZxVvuHksLZpcQugM/h42i0uJoVP4uSMLnPppJ3C7LfPsPOxjpLslc+x1/UdIdlNm2ftBHqC/JZnhTCNSQa8bMs2Zh3Yf3a7JFAetkT10LMokBy+2XVhZJgIjlkIZZazIuCJiya/Xx9QR/Q8yEokMFv9/Ax7UXjl24wAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"replayIcon" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAADOElEQVR4Ae2VUWhbVRjH/0nqdk0m0eTGITVZNsmiZCLTlooNPoWlbk27lzmGSIeyh7YgFSYaGO2yDZk4GMi65kG9d6kkbfCuyf1bqZmmlsYxCK51KwxkrpM4qBRla18cIngvw0qgN7ea1/z+L4fDn4/vO+c730G9NGjQQIALj8CKumn+afjIQWyDHRbUxTO/8w/Ojux9Bc0Q6gn27B3eoRZM5Zm2l7EVm/5bMAsEiPAjiFiFun7hXa5MjJ7Y1gI3mjYaxA5vZzSdmJeWlfvqz/xHFd7jr5+fP+rYgU0wpQlibE8peV+9yyVWeJuLVapwleU4tsCEh9B8sn8lt8SbBprJvHUEXrOMmuCVj61o9h81fXEhEY/GHAf09QOVlaF3N4fgNDsjCzxnBn7jDU3T2TfexE64IeC5G9Q1lz/7/vY2iBs5aHtndCm/wAXmUtvb8ShsD/pogdf46bm2CJ7Qr16THY87t0Iwzsf77ch1/sBCdmcYjrVuaZ4813UAPjwMC3SXsztS+ujqWTxp1E9CV8ct9Sq/56EeOGGpemtb1t6a9bXdq7nbvKV2dRjlJKaOl1lm+gICsME47x1jsu5LHYeIdfEXpCu8wsE43KiFezCu+woS/FiX4KxSYon7YhBQC2FfTPfNKghiXUIldYYzdLfChlpYxRbd952KkEGgr9Uii3z6JbNAnhbd941hoOBF5RIv8WC3SWmbuzt130XD0vyfSFOc4gfvwIVauD48qvs+Njxs8URikpOckmtevw2Br2Tdd9Lw+oVIR15VeZl91Q1Z3UXOvp7LVJlXI4YNaYHvdHKCE7ye3fXvE6l2OHaFr43rntNJ+IxHrj0czeQVFjifCrbDCRuqi3IG2+dTBSrM5MNR2GuOkcMD48xymotZrcAAXBBghQ0C3Aj09Sxmp5nlOA8PwAOLyWDrPZbhGL/kMufkkff2xx5rferFQ/vPx+fkZW13jBn2D8KrOc1H7av9ci7NNIu8yVX+xT95T1sVqe/J+dffhldzYUPD/4U9Q8lR9TNWa5RDyeej8BhkY/Qd7Y72Jk5Jw4qkSuqwckrqTbTuhc/44zb/IEOagtpK/N8fdoMGDf4G6kd7103/csoAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"replayIconOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAA0CAQAAABI31KIAAADTElEQVR4Ae2VX2xTZRjGH1iBzDMrU6lxLdOFhLJ/CepwTWCJiUSTDTdilikxJmAo2GlJ9I7EsCgkw6jRG5ALtZNJy7QDiwxK0dZllSypssqatCHIMKdzM4uEnUUrtj2P57uAULNzOtltf8/Nl3OevHnf73u/70WJxVKiRAWqcD/KsGjsvyScb6EBZizFoth4nX9zJNn6KtZCwhLcNU9NcpJasPw3o80vogbl/y/YUkiwoRHNcMsUSvMGlX/6zz3SCiuWLzSIGXVbnN5gXJ7566b6K29J5ix///PwMWk9ylGUZVj93M5o6qZ6g9OUeY0TBZI5x9ggKlGEFbDvP6Jkp3lFR8PX93yEOpQXy6a2L6Bo9suaTv/2tv/ZPdLey7ylWKZnYEULLFhWbG+q3/f8waSmiPLKB3gSVkh4OkmhsdyHkZoO2Bay0eYtzulcggl+PVXTiYdggmBjgpf42XjzDqwRRy+OAo/eVwNJP5+675Pj/JkhZW0XVt7uFvvQePte1ONezSFclo4d0fjFH7FOr9Ol9l1X1Yv8idt6Ybmj6SRUofL2XSt76Zm57DVeVdt36eVkO3o2xhi9k9gAE/TzXn88LXxHz8KGeWkMyaMc5T4/rDDCus8vfCEZjZgXx0gmyijb3JBghNTmFr6RDByYl5ZofpjDfKANJhhR9mCr8P2QR4tOoG/zYYa57vligVa1Ct93uoEcJzLneZ4vvIEKGHFPx+vCd0K3tMZP5SCDfNeLKhjx8HvHhO8T3c22vRMc4hCDaTQZFGdC07m08O3XPX5p8+6AeooX2F3QkAUsgaW79wJPMaBu3g1Jr9XqD6ZO8iTHlYY7rkhBmJUNXZdmhedgCvX6w8C8yenLDTLE+JS9ExaY/lOUxd4ZnwpxkL7cJifMhs/Ids8Av2SEE4pWYBOqIKEMJlTAiqbu3gklov0d4HYPqo2H03LUugI+HucZznAs/fFXW92VbWu2bnvzsH8sPcMz2h8fXzuNWs1Z/KntOtKX9dLLMK9wjnlmOautwhTf+nIvf446zYUFPf5P7OxJ9atfsFD97Ek97kS1TjZ64+gxpyt4QD6U8age9VDmgOwKbnChXn9wFxuQDrRocmir1ai4y+lfokSJfwEhAcqxd5L4JgAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3c/elements\x3e\x3c/component\x3e\x3ccomponent name\x3d"dock"\x3e\x3csettings\x3e\x3csetting name\x3d"iconalpha" value\x3d"1"/\x3e\x3csetting name\x3d"iconalphaactive" value\x3d"1"/\x3e\x3csetting name\x3d"iconalphaover" value\x3d"1"/\x3e\x3c/settings\x3e\x3celements\x3e\x3celement name\x3d"button" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAgCAYAAABpRpp6AAAAxklEQVR4Ae2YsQ3CMBBF7+yIximQSERSMgYNI1AxJgswAaMkLREpEnQ2Z6Chooqwpf+k65+evhtzXW8LIjrp7fUcpcmod9U7v2Sbpjm2bVtaa5kSRERC13V13/ePIpatqk05zzOHEChFWImOKnyIwk7EMyXMJyTrOUOZAeGlKd4byUtYCZjEN9gwCuPRYRKYBCbx18JLJ0bh3IQJk/gFHh0Ko3BWwqOID8YYpoTx3ofoap0r18y0WymspCo7DLf7NE2X7L5bnyz7UgI6sO7WAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"buttonOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAgCAYAAABpRpp6AAAAzklEQVR4Ae2YMU7FMBAFx04osQvyRQIX4nfcgRZOAxW3oMqRkhKbBkWyjVfiCiD7a0dKPxq9dZHxdLq9Al6AB8DRJl/ACryOwPM8z0/LsvhhGCwNklLK27bd7fv+LcLnabrxx3HYUgotYoyx4liFH0XYpZQtDfMb0orrSGeo8L8Il9Jd4dL5JFRYN6xHp5PQSegkLuwd/uPEWrg3YXQSenRaWAtfVOGYUs62QsPkiriK8Brj571z3ot0q7IxhgB8iPBbCMHU7wxcN/679f0HQzRYj4Eg/3AAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"buttonActive" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAgCAYAAABpRpp6AAAAwUlEQVR4Ae2YsQ3CMBBFD8e0CVESUcFMpGMKapgAKvagymKWiF3RxMe/IUDn6J70I5dPX98u4odhvyWiG3JCdqSTiEzI3eNz7fv+0nVdW1WVI4VkEEI4IB8RHjXLCg6II4TPXmbgADOTZhwQV0+F4ekPmDBzcQ2zTcKEC9+wXTqbhE3CJrGyd5jpp1jDxb0SNgm7dNawNbyqhudlydkBUkwG4irCU0rzsa6bVqt0BinFN44vEX7EGDfIiHOj/Hfr8wvCZ0/Xf6TpeQAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"divider" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAgCAYAAAA1zNleAAAAD0lEQVQoU2NgGAWjADcAAAIgAAEeEYatAAAAAElFTkSuQmCC"/\x3e\x3c/elements\x3e\x3c/component\x3e\x3ccomponent name\x3d"playlist"\x3e\x3csettings\x3e\x3csetting name\x3d"backgroundcolor" value\x3d"0x3c3c3e"/\x3e\x3csetting name\x3d"fontcolor" value\x3d"0x848489"/\x3e\x3csetting name\x3d"fontsize" value\x3d"11"/\x3e\x3csetting name\x3d"fontweight" value\x3d"normal"/\x3e\x3csetting name\x3d"activecolor" value\x3d"0xb2b2b6"/\x3e\x3csetting name\x3d"overcolor" value\x3d"0xb2b2b6"/\x3e\x3csetting name\x3d"titlecolor" value\x3d"0xb9b9be"/\x3e\x3csetting name\x3d"titlesize" value\x3d"12"/\x3e\x3csetting name\x3d"titleweight" value\x3d"bold"/\x3e\x3csetting name\x3d"titleactivecolor" value\x3d"0xececf4"/\x3e\x3csetting name\x3d"titleovercolor" value\x3d"0xececf4"/\x3e\x3c/settings\x3e\x3celements\x3e\x3celement name\x3d"item" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABMAQMAAAASt2oTAAAAA1BMVEU8PD44mUV6AAAAFklEQVR4AWMYMmAUjIJRMApGwSgYBQAHuAABIqNCjAAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"itemActive" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABMAQMAAAASt2oTAAAAA1BMVEUvLzHXqQRQAAAAFklEQVR4AWMYMmAUjIJRMApGwSgYBQAHuAABIqNCjAAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"itemImage" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAA2CAMAAAAPkWzgAAAAk1BMVEU0NDcVFRcWFhgXFxknJyozMzYyMjUlJSgrKy4jIyYZGRssLC8YGBobGx0kJCcuLjAiIiQaGhwjIyUpKSwkJCYaGh0nJykiIiUgICIwMDMqKi0cHB8lJScdHSAtLTAuLjEdHR8VFRgxMTQvLzIvLzEoKCsZGRwqKiwbGx4gICMoKCofHyImJigmJikhISMeHiAhISRWJqoOAAAA/klEQVR4Ae3VNYLDMBQG4X8kme2QwwzLfP/TbeO0qfQ6zQW+coRxQqYl4HEJSEACEvA8NQamRkCoF40kNUxMgC3gc0lrtiZAB1BKuSOPDIzcXroB0EtL3hQXuIHLNboDC+aRgRnQ6GUAjtBEBmrgdcwA/OCyuMATraOvBiB3HBQTOJ8KZp5QwwXoA3xFBdrVjpPnHVgBfQfjqMChZSoAugDMwCsqUMFeAHwEwMFnXKDkshGAz5YAEOIC2fpbAqhUAMDG4AcO3HUAahkAHYykOQATC6Bsf7M7UNotswLwmR2wAviTHVAAHA2BMXCWIaDC7642wIMSkIAEJCABxv0D1B4Kmtm5dvAAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"divider" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAAABCAIAAAAkUWeUAAAAEUlEQVR42mPQ1zccRaOIzggAmuR1T+nadMkAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"sliderRail" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAABCAYAAADErm6rAAAAHklEQVQI12NgIABERcX/Kymp/FdWVkXBIDGQHCH9AAmVCvfMHD66AAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"sliderCapTop" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAKCAYAAACuaZ5oAAAAEUlEQVQoU2NgGAWjYBQMfQAAA8oAAZphnjsAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"sliderCapBottom" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAKCAYAAACuaZ5oAAAAEUlEQVQoU2NgGAWjYBQMfQAAA8oAAZphnjsAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"sliderRailCapTop" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAECAYAAACUY/8YAAAAX0lEQVR42q2P4QqAIAyEewktLUy3pKevVwvpAdZO+q9Qgw+OO25jQ88YM2blUAp4dW71epfvyuXcLCGsFWh4yD4fsHY6vV8kRpKUGFQND9kfHxQsJNqEOYOq4Wl2t/oPXdoiX8vd60IAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"sliderRailCapBottom" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAECAYAAACUY/8YAAAAXElEQVQY02NgIADExCQ+KSmp/FdWVkXBIDGg3BcGSoG0tMxGWVl5DAtAYiA5ii2wsbE1ALr0A8hAkKtBGMQGiYHkKLbg////TK6uboYg1wIN/QzCIDZIDCRHSD8AB2YrZ5n2CLAAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"sliderThumb" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAABCAAAAADhxTF3AAAAAnRSTlMA/1uRIrUAAAAUSURBVHjaY/oPA49unT+yaz2cCwAcKhapymVMMwAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"sliderThumbCapBottom" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAECAQAAAA+ajeTAAAAMElEQVQI12NgwACPPt76f/7/kf+7/q//yEAMeNQH19DHQBy41Xf+/ZH3u4hVjh8AAJAYGojU8tLHAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"sliderThumbCapTop" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAECAQAAAA+ajeTAAAANUlEQVQI12NgoAbY2rf+49KPs/uIVH54wrH/h/7v+L/y//QJRGm4/PHa/7NALdv+L/6MKQsAZV8ZczFGWjAAAAAASUVORK5CYII\x3d"/\x3e\x3c/elements\x3e\x3c/component\x3e\x3ccomponent name\x3d"tooltip"\x3e\x3csettings\x3e\x3csetting name\x3d"fontcase" value\x3d"normal"/\x3e\x3csetting name\x3d"fontcolor" value\x3d"0xacacac"/\x3e\x3csetting name\x3d"fontsize" value\x3d"11"/\x3e\x3csetting name\x3d"fontweight" value\x3d"normal"/\x3e\x3csetting name\x3d"activecolor" value\x3d"0xffffff"/\x3e\x3csetting name\x3d"overcolor" value\x3d"0xffffff"/\x3e\x3c/settings\x3e\x3celements\x3e\x3celement name\x3d"background" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAACCAYAAABsfz2XAAAAEUlEQVR4AWOwtnV8RgomWQMAWvcm6W7AcF8AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"arrow" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAADCAYAAACnI+4yAAAAEklEQVR42mP4//8/AymYgeYaABssa5WUTzsyAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"capTop" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAECAYAAAC6Jt6KAAAAHUlEQVR42mMUFRU/wUACYHR1935GkgZrW0faagAAqHQGCWgiU9QAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"capBottom" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAECAYAAAC6Jt6KAAAAGElEQVR42mOwtnV8RgpmoL0GUVHxE6RgAO7IRsl4Cw8cAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"capLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAACCAYAAACUn8ZgAAAAFklEQVR42mMQFRU/YW3r+AwbZsAnCQBUPRWHq8l/fAAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"capRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAACCAYAAACUn8ZgAAAAFklEQVR42mOwtnV8hg2LioqfYMAnCQBwXRWHw2Rr1wAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"capTopLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAECAYAAABCxiV9AAAAPklEQVR4XmMQFRVnBeIiIN4FxCeQMQOQU6ijq3/VycXjiau79zNkDJLcZWvv9MTGzumZta0jCgZJnkAXhPEBnhkmTDF7/FAAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"capTopRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAECAYAAABCxiV9AAAAPklEQVR42mMQFRU/gYZ3A3ERELMyuLp7P0PGTi4eT3R09a8CJbMYrG0dnyFjGzunZ7b2Tk+AkrswJGEYZAUA8XwmRnLnEVMAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"capBottomLeft" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAECAYAAABCxiV9AAAAMUlEQVR4AWMQFRU/YW3r+AwbBknusrSye4JLslBdQ/uqpbX9E2ySrEBcBMS7QVYgYwAWViWcql/T2AAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"capBottomRight" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAECAYAAABCxiV9AAAANUlEQVR42mOwtnV8hg2LioqfYMAmYWll9wQouQtD0tLa/om6hvZVoGQ2A0g7Gt4NxEVAzAoAZzolltlSH50AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"menuOption" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAARCAYAAADkIz3lAAAAcklEQVQoz2NgGLFAVFRcDoh3AfFnKC2HVaGYmMQeSUnp/7Kycv9BNJB/AJeJn+XlFf8rKir/V1BQ+g/k/8SqEGjKPhkZuf/Kyqr/QTSQfwirQm9vX3WQYqCVX0G0p6e3BlaF////ZwJiLiDmgdJMwzr2ANEWKw6VGUzBAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"menuOptionOver" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAARCAYAAADkIz3lAAAAcklEQVQoz2NgGLFAVFRcDoh3AfFnKC2HVaGYmMQeSUnp/7Kycv9BNJB/AJeJn+XlFf8rKir/V1BQ+g/k/8SqEGjKPhkZuf/Kyqr/QTSQfwirQm9vX3WQYqCVX0G0p6e3BlaF////ZwJiLiDmgdJMwzr2ANEWKw6VGUzBAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"menuOptionActive" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAARCAQAAABOKvVuAAAAdElEQVR4AWOgJ5BhcGQIBWIZhJCsW+6jS7+/P7rklssgBxN0un/59f+n/1//f3SVwQUmGPrs+6P/IPj8N0M4TNBl/+Vr/0Hw4FUGN5igkm3ursvnf+y6bJ/LoAwTZGZQY/BgCANiNSCbASHMwcANxMy09DcAxqMsxkMxUYIAAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"volumeCapTop" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAFCAYAAAB1j90SAAAAE0lEQVR42mP4//8/AzmYYQRoBADgm9EvDrkmuwAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"volumeCapBottom" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAFCAYAAAB1j90SAAAAE0lEQVR42mP4//8/AzmYYQRoBADgm9EvDrkmuwAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"volumeRailCapTop" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAYAAAC+0w63AAAAXklEQVR42n2NWwqAIBRE3YSmJT4KafW1tZAWMN2RPkSojwPDPO5VAFSP1lMRDqG+UJexN4524bJ2hvehQU2P2efQGHs6tyCEhBhzg5oes7+PlcWUVuS8Nah5QLK77z7Bcm/CZuJM1AAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"volumeRailCapBottom" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAYAAAC+0w63AAAAWklEQVQI12NgQAJiYhKfVFXV/6upaaBgkBhQ7gsDLiAtLbNRXl4RQyNIDCSHU6ONja0B0OQPIIUgW0AYxAaJgeRwavz//z+Tq6ubIch0oOLPIAxig8RAcshqARVfK+sjJ8UzAAAAAElFTkSuQmCC"/\x3e\x3celement name\x3d"volumeRail" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAA0CAYAAAC6qQkaAAAAXklEQVR42mP5//8/AwyIiUn85+bmZmBkZGRABiA1X79+ZXj16gVcgoUBDaBrwiWGoZFYMCg0MpKnkZFxCPlxVONw0MjIyDgaOCM7AdC7lBuNjtGiY1TjqMbRwooijQBUhw3jnmCdzgAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"volumeProgress" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAA0CAAAAACfwlbGAAAAAnRSTlMA/1uRIrUAAAAmSURBVHgBY/gPBPdunT+yaw2IBeY+BHHXwbmPQNz1w5w7yh3lAgBeJpPWLirUWgAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"volumeProgressCapTop" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAQAAAAU2sY8AAAANElEQVQI12NgIA5s7Vv/cenH2X1YpA5POPb/0P8d/1f+nz4BQ/Lyx2v/zwKlt/1f/BkmBgDJshlzy7m4BgAAAABJRU5ErkJggg\x3d\x3d"/\x3e\x3celement name\x3d"volumeProgressCapBottom" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAECAQAAAAU2sY8AAAAL0lEQVQI12NggIJHH2/9P///yP9d/9d/ZkAHjybCJScyYIJbE85/OvJp1wQG4gAADBkams/Cpm0AAAAASUVORK5CYII\x3d"/\x3e\x3celement name\x3d"volumeThumb" src\x3d"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAQCAQAAACMnYaxAAAA/klEQVR4AYXQoW7CUBjF8f9IYWkgq2l2k8llrmJBTOBxsyQlJENs4236CDhEywNUIEGh12WZuYDC4W9A3B2zhTVLds8VJ+fnPv5/FzQIaHGptNQaWn4ooM0DA56VgVpbi1hEk2vSvNjbozu6vc0LUi1NCQFXDBflwW/9p7L1B78oGRJJCOnN8o3/OMvGz3J6EiLStdX0K2tLKiFm8n6qY3XiVYL5C98cLxL90dLWcWkZSYjpZ0Uds4K+hIg7nqblOU1LxlojCDF0GWfz1a5ylVvtsrmoi5EQ0OGGhEdNE2WslmjpSND5VAy3mu6VRM1o0fm+Dx8SEWOUWC3UIvoCCFqphCwr/x8AAAAASUVORK5CYII\x3d"/\x3e\x3c/elements\x3e\x3c/component\x3e\x3c/components\x3e\x3c/skin\x3e')}})(jwplayer);
(function(d){var k=d.html5,a=d.utils,c=d.events,e=c.state,f=a.css,g=a.isMobile(),h=".jwpreview",b={showicons:!0,bufferrotation:45,bufferinterval:100,fontcolor:"#ccc",overcolor:"#fff",fontsize:15,fontweight:""};k.display=function(d,j){function l(b){if(D&&(d.jwGetControls()||d.jwGetState()===e.PLAYING))D(b);else if((!g||!d.jwGetControls())&&T.sendEvent(c.JWPLAYER_DISPLAY_CLICK),d.jwGetControls()){var f=(new Date).getTime();U&&500>f-U?(d.jwSetFullscreen(),U=void 0):U=(new Date).getTime();var h=a.bounds(u.parentNode.querySelector(".jwcontrolbar")),
j=a.bounds(u),f=h.left-10-j.left,n=h.left+30-j.left,m=j.bottom-40,k=j.bottom,l=h.right-30-j.left,h=h.right+10-j.left;if(g&&!(b.x>=f&&b.x<=n&&b.y>=m&&b.y<=k)){if(b.x>=l&&b.x<=h&&b.y>=m&&b.y<=k){d.jwSetFullscreen();return}T.sendEvent(c.JWPLAYER_DISPLAY_CLICK);if(M)return}switch(d.jwGetState()){case e.PLAYING:case e.BUFFERING:d.jwPause();break;default:d.jwPlay()}}}function r(a,b){Q.showicons&&(a||b?(G.setRotation("buffer"===a?parseInt(Q.bufferrotation,10):0,parseInt(Q.bufferinterval,10)),G.setIcon(a),
G.setText(b)):G.hide())}function s(a){C!==a?(C&&z(h,!1),(C=a)?(a=new Image,a.addEventListener("load",y,!1),a.src=C):(f("#"+u.id+" "+h,{"background-image":""}),z(h,!1),F=x=0)):C&&!M&&z(h,!0);A(d.jwGetState())}function t(a){clearTimeout(aa);aa=setTimeout(function(){A(a.newstate)},100)}function A(a){a=O?O:d?d.jwGetState():e.IDLE;if(a!==R)switch(R=a,G&&G.setRotation(0),a){case e.IDLE:!L&&!J&&(C&&!K&&z(h,!0),a=!0,d._model&&!1===d._model.config.displaytitle&&(a=!1),r("play",v&&a?v.title:""));break;case e.BUFFERING:L=
!1;n.error&&n.error.setText();J=!1;r("buffer");break;case e.PLAYING:r();break;case e.PAUSED:r("play")}}function y(){F=this.width;x=this.height;A(d.jwGetState());B();C&&f("#"+u.id+" "+h,{"background-image":"url("+C+")"})}function m(a){L=!0;r("error",a.message)}function B(){0<u.clientWidth*u.clientHeight&&a.stretch(d.jwGetStretching(),q,u.clientWidth,u.clientHeight,F,x)}function z(a,b){f("#"+u.id+" "+a,{opacity:b?1:0,visibility:b?"visible":"hidden"})}var u,q,w,v,C,F,x,K=!1,n={},L=!1,J=!1,M,I,G,O,R,
Q=a.extend({},b,d.skin.getComponentSettings("display"),j),T=new c.eventdispatcher,D,U;a.extend(this,T);this.clickHandler=l;var aa;this.forceState=function(a){O=a;A(a);this.show()};this.releaseState=function(a){O=null;A(a);this.show()};this.hidePreview=function(a){K=a;z(h,!a);a&&(M=!0)};this.setHiding=function(){M=!0};this.element=function(){return u};this.redraw=B;this.show=function(a){if(G&&(a||(O?O:d?d.jwGetState():e.IDLE)!==e.PLAYING))clearTimeout(I),I=void 0,u.style.display="block",G.show(),M=
!1};this.hide=function(){G&&(G.hide(),M=!0)};this.setAlternateClickHandler=function(a){D=a};this.revertAlternateClickHandler=function(){D=null};u=document.createElement("div");u.id=d.id+"_display";u.className="jwdisplay";q=document.createElement("div");q.className="jwpreview jw"+d.jwGetStretching();u.appendChild(q);d.jwAddEventListener(c.JWPLAYER_PLAYER_STATE,t);d.jwAddEventListener(c.JWPLAYER_PLAYLIST_ITEM,function(){L=!1;n.error&&n.error.setText();var a=(v=d.jwGetPlaylist()[d.jwGetPlaylistIndex()])?
v.image:"";R=void 0;s(a)});d.jwAddEventListener(c.JWPLAYER_PLAYLIST_COMPLETE,function(){J=!0;r("replay");var a=d.jwGetPlaylist()[0];s(a.image)});d.jwAddEventListener(c.JWPLAYER_MEDIA_ERROR,m);d.jwAddEventListener(c.JWPLAYER_ERROR,m);d.jwAddEventListener(c.JWPLAYER_PROVIDER_CLICK,l);g?(w=new a.touch(u),w.addEventListener(a.touchEvents.TAP,l)):u.addEventListener("click",l,!1);w={font:Q.fontweight+" "+Q.fontsize+"px/"+(parseInt(Q.fontsize,10)+3)+"px Arial, Helvetica, sans-serif",color:Q.fontcolor};G=
new k.displayicon(u.id+"_button",d,w,{color:Q.overcolor});u.appendChild(G.element());t({newstate:e.IDLE})};f(".jwdisplay",{position:"absolute",width:"100%",height:"100%",overflow:"hidden"});f(".jwdisplay "+h,{position:"absolute",width:"100%",height:"100%",background:"#000 no-repeat center",overflow:"hidden",opacity:0});a.transitionStyle(".jwdisplay, .jwdisplay *","opacity .25s, color .25s")})(jwplayer);
(function(d){var k=d.utils,a=k.css,c=document,e="none",f="100%";d.html5.displayicon=function(g,h,b,p){function j(a,b,e,d){var f=c.createElement("div");f.className=a;b&&b.appendChild(f);m&&l(f,a,"."+a,e,d);return f}function l(b,c,e,d,f){var g=r(c);"replayIcon"===c&&!g.src&&(g=r("playIcon"));g.src?(d=k.extend({},d),0<c.indexOf("Icon")&&(x=g.width|0),d.width=g.width,d["background-image"]="url("+g.src+")",d["background-size"]=g.width+"px "+g.height+"px",d["float"]="none",f=k.extend({},f),g.overSrc&&(f["background-image"]=
"url("+g.overSrc+")"),k.isMobile()||a("#"+h.id+" .jwdisplay:hover "+e,f),a.style(m,{display:"table"})):a.style(m,{display:"none"});d&&a.style(b,d);F=g}function r(a){var b=y.getSkinElement("display",a);a=y.getSkinElement("display",a+"Over");return b?(b.overSrc=a&&a.src?a.src:"",b):{src:"",overSrc:"",width:0,height:0}}function s(){var b=q||0===x;a.style(w,{display:w.innerHTML&&b?"":e});n=b?30:0;t()}function t(){clearTimeout(K);0<n--&&(K=setTimeout(t,33));var b="px "+f,c=Math.ceil(Math.max(F.width,k.bounds(m).width-
u.width-z.width)),b={"background-size":[z.width+b,c+b,u.width+b].join(", ")};m.parentNode&&(b.left=1===m.parentNode.clientWidth%2?"0.5px":"");a.style(m,b)}function A(){M=(M+J)%360;k.rotate(v,M)}var y=h.skin,m,B,z,u,q,w,v,C={},F,x=0,K=-1,n=0;this.element=function(){return m};this.setText=function(a){var b=w.style;w.innerHTML=a?a.replace(":",":\x3cbr\x3e"):"";b.height="0";b.display="block";if(a)for(;2<Math.floor(w.scrollHeight/c.defaultView.getComputedStyle(w,null).lineHeight.replace("px",""));)w.innerHTML=
w.innerHTML.replace(/(.*) .*$/,"$1...");b.height="";b.display="";s()};this.setIcon=function(a){var b=C[a];b||(b=j("jwicon"),b.id=m.id+"_"+a);l(b,a+"Icon","#"+b.id);m.contains(v)?m.replaceChild(b,v):m.appendChild(b);v=b};var L,J=0,M;this.setRotation=function(a,b){clearInterval(L);M=0;J=a|0;0===J?A():L=setInterval(A,b)};var I=this.hide=function(){m.style.opacity=0;m.style.cursor=""};this.show=function(){m.style.opacity=1;m.style.cursor="pointer"};m=j("jwdisplayIcon");m.id=g;B=r("background");z=r("capLeft");
u=r("capRight");q=0<z.width*u.width;var G={"background-image":"url("+z.src+"), url("+B.src+"), url("+u.src+")","background-position":"left,center,right","background-repeat":"no-repeat",padding:"0 "+u.width+"px 0 "+z.width+"px",height:B.height,"margin-top":B.height/-2};a("#"+g,G);k.isMobile()||(B.overSrc&&(G["background-image"]="url("+z.overSrc+"), url("+B.overSrc+"), url("+u.overSrc+")"),a(".jw-tab-focus #"+g+", #"+h.id+" .jwdisplay:hover "+("#"+g),G));w=j("jwtext",m,b,p);v=j("jwicon",m);h.jwAddEventListener(d.events.JWPLAYER_RESIZE,
t);I();s()};a(".jwplayer .jwdisplayIcon",{display:"table",position:"relative","margin-left":"auto","margin-right":"auto",top:"50%","float":"none"});a(".jwplayer .jwdisplayIcon div",{position:"relative",display:"table-cell","vertical-align":"middle","background-repeat":"no-repeat","background-position":"center"});a(".jwplayer .jwdisplayIcon div",{"vertical-align":"middle"},!0);a(".jwplayer .jwdisplayIcon .jwtext",{color:"#fff",padding:"0 1px","max-width":"300px","overflow-y":"hidden","text-align":"center",
"-webkit-user-select":e,"-moz-user-select":e,"-ms-user-select":e,"user-select":e})})(jwplayer);
(function(d){var k=d.html5,a=d.utils,c=a.css,e=a.bounds,f=window.top!==window.self,g=".jwdockbuttons";k.dock=function(d,b){function p(a){return!a||!a.src?{}:{background:"url("+a.src+") center","background-size":a.width+"px "+a.height+"px"}}function j(b,e){var d=s(b);c(l("."+b),a.extend(p(d),{width:d.width}));return r("div",b,e)}function l(a){return"#"+y+" "+(a?a:"")}function r(a,b,c){a=document.createElement(a);b&&(a.className=b);c&&c.appendChild(a);return a}function s(a){return(a=m.getSkinElement("dock",
a))?a:{width:0,height:0,src:""}}function t(){c(g+" .capLeft, "+g+" .capRight",{display:B?"block":"none"})}var A=a.extend({},{iconalpha:0.75,iconalphaactive:0.5,iconalphaover:1,margin:8},b),y=d.id+"_dock",m=d.skin,B=0,z={},u={},q,w,v,C=this;C.redraw=function(){e(q)};C.element=function(){return q};C.offset=function(a){c(l(),{"margin-left":a})};C.hide=function(){C.visible&&(C.visible=!1,q.style.opacity=0,clearTimeout(v),v=setTimeout(function(){q.style.display="none"},250))};C.showTemp=function(){C.visible||
(q.style.opacity=0,q.style.display="block")};C.hideTemp=function(){C.visible||(q.style.display="none")};C.show=function(){!C.visible&&B&&(C.visible=!0,q.style.display="block",clearTimeout(v),v=setTimeout(function(){q.style.opacity=1},0))};C.addButton=function(b,g,j,l){if(!z[l]){var s=r("div","divider",w),v=r("div","button",w),x=r("div",null,v);x.id=y+"_"+l;x.innerHTML="\x26nbsp;";c("#"+x.id,{"background-image":b});"string"===typeof j&&(j=new Function(j));a.isMobile()?(new a.touch(v)).addEventListener(a.touchEvents.TAP,
function(a){j(a)}):v.addEventListener("click",function(a){j(a);a.preventDefault()});z[l]={element:v,label:g,divider:s,icon:x};if(g){var p=new k.overlay(x.id+"_tooltip",m,!0);b=r("div");b.id=x.id+"_label";b.innerHTML=g;c("#"+b.id,{padding:3});p.setContents(b);if(!a.isMobile()){var A;v.addEventListener("mouseover",function(){clearTimeout(A);var b=u[l],g,j;g=e(z[l].icon);b.offsetX(0);j=e(q);f&&a.isIE()&&d.jwGetFullscreen()?c("#"+b.element().id,{left:100*g.left+50+100*g.width/2}):c("#"+b.element().id,
{left:g.left-j.left+g.width/2});g=e(b.element());j.left>g.left&&b.offsetX(j.left-g.left+8);p.show();a.foreach(u,function(a,b){a!==l&&b.hide()})},!1);v.addEventListener("mouseout",function(){A=setTimeout(p.hide,100)},!1);q.appendChild(p.element());u[l]=p}}B++;t()}};C.removeButton=function(a){if(z[a]){w.removeChild(z[a].element);w.removeChild(z[a].divider);var b=document.getElementById(""+y+"_"+a+"_tooltip");b&&q.removeChild(b);delete z[a];B--;t()}};C.numButtons=function(){return B};C.visible=!1;q=
r("div","jwdock");w=r("div","jwdockbuttons");q.appendChild(w);q.id=y;var F=s("button"),x=s("buttonOver"),K=s("buttonActive");F&&(c(l(),{height:F.height,padding:A.margin}),c(g,{height:F.height}),c(l("div.button"),a.extend(p(F),{width:F.width,cursor:"pointer",border:"none"})),c(l("div.button:hover"),p(x)),c(l("div.button:active"),p(K)),c(l("div.button\x3ediv"),{opacity:A.iconalpha}),c(l("div.button:hover\x3ediv"),{opacity:A.iconalphaover}),c(l("div.button:active\x3ediv"),{opacity:A.iconalphaactive}),
c(l(".jwoverlay"),{top:A.margin+F.height}),j("capLeft",w),j("capRight",w),j("divider"));setTimeout(function(){e(q)})};c(".jwdock",{opacity:0,display:"none"});c(".jwdock \x3e *",{height:"100%","float":"left"});c(".jwdock \x3e .jwoverlay",{height:"auto","float":"none","z-index":99});c(g+" div.button",{position:"relative"});c(g+" \x3e *",{height:"100%","float":"left"});c(g+" .divider",{display:"none"});c(g+" div.button ~ .divider",{display:"block"});c(g+" .capLeft, "+g+" .capRight",{display:"none"});
c(g+" .capRight",{"float":"right"});c(g+" div.button \x3e div",{left:0,right:0,top:0,bottom:0,margin:5,position:"absolute","background-position":"center","background-repeat":"no-repeat"});a.transitionStyle(".jwdock","background .25s, opacity .25s");a.transitionStyle(".jwdock .jwoverlay","opacity .25s");a.transitionStyle(g+" div.button div","opacity .25s")})(jwplayer);
(function(d){var k=d.html5,a=d.utils,c=d._,e=d.events,f=e.state,g=d.playlist;k.instream=function(h,b,p,j){function l(a){z(a.type,a);I&&h.jwInstreamDestroy(!1,D)}function r(a){if(a.newstate!==I.state)switch(I.state=a.newstate,I.state){case f.PLAYING:D.jwInstreamPlay();break;case f.PAUSED:D.jwInstreamPause()}}function s(a){z(a.type,a);m()}function t(a){z(a.type,a)}function A(a){b.sendEvent(a.type,a);z(e.JWPLAYER_FULLSCREEN,{fullscreen:a.jwstate})}function y(){R&&R.releaseState(D.jwGetState());G.play()}
function m(){if(v&&C+1<v.length){C++;var b=v[C];w=new g.item(b);I.setPlaylist([b]);var c;F&&(c=F[C]);x=a.extend(q,c);G.load(I.playlist[0]);K.reset(x.skipoffset||-1);T=setTimeout(function(){z(e.JWPLAYER_PLAYLIST_ITEM,{index:C},!0)},0)}else T=setTimeout(function(){z(e.JWPLAYER_PLAYLIST_COMPLETE,{},!0);h.jwInstreamDestroy(!0,D)},0)}function B(a){a.width&&a.height&&(R&&R.releaseState(D.jwGetState()),p.resizeMedia())}function z(a,b){b=b||{};q.tag&&!b.tag&&(b.tag=q.tag);D.sendEvent(a,b)}function u(){O&&
O.redraw();R&&R.redraw()}var q={controlbarseekable:"never",controlbarpausable:!0,controlbarstoppable:!0,loadingmessage:"Loading ad",playlistclickable:!0,skipoffset:null,tag:null},w,v,C=0,F,x={controlbarseekable:"never",controlbarpausable:!1,controlbarstoppable:!1},K,n,L,J,M,I,G,O,R,Q,T=-1,D=a.extend(this,new e.eventdispatcher);h.jwAddEventListener(e.JWPLAYER_RESIZE,u);h.jwAddEventListener(e.JWPLAYER_FULLSCREEN,function(b){t(b);I&&(u(),!b.fullscreen&&a.isIPad()&&(I.state===f.PAUSED?R.show(!0):I.state===
f.PLAYING&&R.hide()))});D.init=function(){n=j.detachMedia();G=new (d.html5.chooseProvider({}))(b.id);G.addGlobalListener(t);G.addEventListener(e.JWPLAYER_MEDIA_META,B);G.addEventListener(e.JWPLAYER_MEDIA_COMPLETE,m);G.addEventListener(e.JWPLAYER_MEDIA_BUFFER_FULL,y);G.addEventListener(e.JWPLAYER_MEDIA_ERROR,l);G.addEventListener(e.JWPLAYER_PLAYER_STATE,r);G.addEventListener(e.JWPLAYER_MEDIA_TIME,function(a){K&&K.updateSkipTime(a.position,a.duration)});G.attachMedia();G.mute(b.mute);G.volume(b.volume);
I=new k.model({},G);I.setVolume(b.volume);I.setFullscreen(b.fullscreen);I.setMute(b.mute);I.addEventListener("fullscreenchange",A);M=b.playlist[b.item];L=n.currentTime;j.checkBeforePlay()||0===L?(L=0,J=f.PLAYING):J=h.jwGetState()===f.IDLE||b.getVideo().checkComplete()?f.IDLE:f.PLAYING;J===f.PLAYING&&n.pause();R=new k.display(D);R.forceState(f.BUFFERING);Q=document.createElement("div");Q.id=D.id+"_instream_container";a.css.style(Q,{width:"100%",height:"100%"});Q.appendChild(R.element());O=new k.controlbar(D,
{fullscreen:b.fullscreen});O.instreamMode(!0);Q.appendChild(O.element());h.jwGetControls()?(O.show(),R.show()):(O.hide(),R.hide());p.setupInstream(Q,O,R,I);u();D.jwInstreamSetText(q.loadingmessage)};D.load=function(b,d){if(a.isAndroid(2.3))l({type:e.JWPLAYER_ERROR,message:"Error loading instream: Cannot play instream on Android 2.3"});else{z(e.JWPLAYER_PLAYLIST_ITEM,{index:C},!0);var j=10+a.bounds(Q.parentNode).bottom-a.bounds(O.element()).top;c.isArray(b)&&(d&&(F=d,d=d[C]),v=b,b=v[C]);x=a.extend(q,
d);w=new g.item(b);I.setPlaylist([b]);K=new k.adskipbutton(h.id,j,x.skipMessage,x.skipText);K.addEventListener(e.JWPLAYER_AD_SKIPPED,s);K.reset(x.skipoffset||-1);h.jwGetControls()?K.show():K.hide();j=K.element();Q.appendChild(j);I.addEventListener(e.JWPLAYER_ERROR,l);R.setAlternateClickHandler(function(a){a=a||{};a.hasControls=!!h.jwGetControls();z(e.JWPLAYER_INSTREAM_CLICK,a);I.state===f.PAUSED?a.hasControls&&D.jwInstreamPlay():D.jwInstreamPause()});a.isMSIE()&&n.parentElement.addEventListener("click",
R.clickHandler);p.addEventListener(e.JWPLAYER_AD_SKIPPED,s);G.load(I.playlist[0])}};D.jwInstreamDestroy=function(c){if(I){I.removeEventListener("fullscreenchange",A);clearTimeout(T);T=-1;G.detachMedia();j.attachMedia();if(J!==f.IDLE){var d=a.extend({},M);d.starttime=L;b.getVideo().load(d)}else b.getVideo().stop();D.resetEventListeners();G.resetEventListeners();I.resetEventListeners();if(O)try{O.element().parentNode.removeChild(O.element())}catch(g){}R&&(n&&n.parentElement&&n.parentElement.removeEventListener("click",
R.clickHandler),R.revertAlternateClickHandler());z(e.JWPLAYER_INSTREAM_DESTROYED,{reason:c?"complete":"destroyed"},!0);J===f.PLAYING&&n.play();p.destroyInstream(G.isAudioFile());I=null}};D.jwInstreamAddEventListener=function(a,b){D.addEventListener(a,b)};D.jwInstreamRemoveEventListener=function(a,b){D.removeEventListener(a,b)};D.jwInstreamPlay=function(){G.play(!0);b.state=f.PLAYING;R.show()};D.jwInstreamPause=function(){G.pause(!0);b.state=f.PAUSED;h.jwGetControls()&&(R.show(),O.show())};D.jwInstreamSeek=
function(a){G.seek(a)};D.jwInstreamSetText=function(a){O.setText(a)};D.jwInstreamState=function(){return I.state};D.setControls=function(a){a?K.show():K.hide()};D.jwPlay=function(){"true"===x.controlbarpausable.toString().toLowerCase()&&D.jwInstreamPlay()};D.jwPause=function(){"true"===x.controlbarpausable.toString().toLowerCase()&&D.jwInstreamPause()};D.jwStop=function(){"true"===x.controlbarstoppable.toString().toLowerCase()&&(h.jwInstreamDestroy(!1,D),h.jwStop())};D.jwSeek=function(a){switch(x.controlbarseekable.toLowerCase()){case "always":D.jwInstreamSeek(a);
break;case "backwards":I.position>a&&D.jwInstreamSeek(a)}};D.jwSeekDrag=function(a){I.seekDrag(a)};D.jwGetPosition=function(){};D.jwGetDuration=function(){};D.jwGetWidth=h.jwGetWidth;D.jwGetHeight=h.jwGetHeight;D.jwGetFullscreen=h.jwGetFullscreen;D.jwSetFullscreen=h.jwSetFullscreen;D.jwGetVolume=function(){return b.volume};D.jwSetVolume=function(a){I.setVolume(a);h.jwSetVolume(a)};D.jwGetMute=function(){return b.mute};D.jwSetMute=function(a){I.setMute(a);h.jwSetMute(a)};D.jwGetState=function(){return!I?
f.IDLE:I.state};D.jwGetPlaylist=function(){return[w]};D.jwGetPlaylistIndex=function(){return 0};D.jwGetStretching=function(){return b.config.stretching};D.jwAddEventListener=function(a,b){D.addEventListener(a,b)};D.jwRemoveEventListener=function(a,b){D.removeEventListener(a,b)};D.jwSetCurrentQuality=function(){};D.jwGetQualityLevels=function(){return[]};D.jwGetControls=function(){return h.jwGetControls()};D.skin=h.skin;D.id=h.id+"_instream";return D}})(window.jwplayer);
(function(d){var k=d.utils,a=k.css,c=d.events.state,e=d.html5.logo=function(f,g){function h(a){k.exists(a)&&a.stopPropagation&&a.stopPropagation();if(!s||!j.link)b.jwGetState()===c.IDLE||b.jwGetState()===c.PAUSED?b.jwPlay():b.jwPause();s&&j.link&&(b.jwPause(),b.jwSetFullscreen(!1),window.open(j.link,j.linktarget))}var b=f,p=b.id+"_logo",j,l,r=e.defaults,s=!1;this.resize=function(){};this.element=function(){return l};this.offset=function(b){a("#"+p+" ",{"margin-bottom":b})};this.position=function(){return j.position};
this.margin=function(){return parseInt(j.margin,10)};this.hide=function(a){if(j.hide||a)s=!1,l.style.visibility="hidden",l.style.opacity=0};this.show=function(){s=!0;l.style.visibility="visible";l.style.opacity=1};var t="o";b.edition&&(t=b.edition(),t="pro"===t?"p":"premium"===t?"r":"ads"===t?"a":"free"===t?"f":"o");if("o"===t||"f"===t)r.link="http://www.longtailvideo.com/jwpabout/?a\x3dl\x26v\x3d"+d.version+"\x26m\x3dh\x26e\x3d"+t;j=k.extend({},r,g);j.hide="true"===j.hide.toString();l=document.createElement("img");
l.className="jwlogo";l.id=p;if(j.file){var r=/(\w+)-(\w+)/.exec(j.position),t={},A=j.margin;3===r.length?(t[r[1]]=A,t[r[2]]=A):t.top=t.right=A;a("#"+p+" ",t);l.src=(j.prefix?j.prefix:"")+j.file;k.isMobile()?(new k.touch(l)).addEventListener(k.touchEvents.TAP,h):l.onclick=h}else l.style.display="none";return this};e.defaults={prefix:k.repo(),file:"logo.png",linktarget:"_top",margin:8,hide:!1,position:"top-right"};a(".jwlogo",{cursor:"pointer",position:"absolute"})})(jwplayer);
(function(d){var k=d.html5,a=d.utils,c=a.css;k.menu=function(d,f,g,h){function b(a){return!a||!a.src?{}:{background:"url("+a.src+") no-repeat left","background-size":a.width+"px "+a.height+"px"}}function p(a,b){return function(){y(a);r&&r(b)}}function j(a,b){var c=document.createElement("div");a&&(c.className=a);b&&b.appendChild(c);return c}function l(a){return(a=g.getSkinElement("tooltip",a))?a:{width:0,height:0,src:void 0}}var r=h,s=new k.overlay(f+"_overlay",g);h=a.extend({fontcase:void 0,fontcolor:"#cccccc",
fontsize:11,fontweight:void 0,activecolor:"#ffffff",overcolor:"#ffffff"},g.getComponentSettings("tooltip"));var t,A=[];this.element=function(){return s.element()};this.addOption=function(b,c){var d=j("jwoption",t);d.id=f+"_option_"+c;d.innerHTML=b;a.isMobile()?(new a.touch(d)).addEventListener(a.touchEvents.TAP,p(A.length,c)):d.addEventListener("click",p(A.length,c));A.push(d)};this.clearOptions=function(){for(;0<A.length;)t.removeChild(A.pop())};var y=this.setActive=function(a){for(var b=0;b<A.length;b++){var c=
A[b];c.className=c.className.replace(" active","");b===a&&(c.className+=" active")}};this.show=s.show;this.hide=s.hide;this.offsetX=s.offsetX;this.positionX=s.positionX;this.constrainX=s.constrainX;t=j("jwmenu");t.id=f;var m=l("menuTop"+d);d=l("menuOption");var B=l("menuOptionOver"),z=l("menuOptionActive");if(m&&m.image){var u=new Image;u.src=m.src;u.width=m.width;u.height=m.height;t.appendChild(u)}d&&(m="#"+f+" .jwoption",c(m,a.extend(b(d),{height:d.height,color:h.fontcolor,"padding-left":d.width,
font:h.fontweight+" "+h.fontsize+"px Arial,Helvetica,sans-serif","line-height":d.height,"text-transform":"upper"===h.fontcase?"uppercase":void 0})),c(m+":hover",a.extend(b(B),{color:h.overcolor})),c(m+".active",a.extend(b(z),{color:h.activecolor})));s.setContents(t)};c("."+"jwmenu jwoption".replace(/ /g," ."),{cursor:"pointer","white-space":"nowrap",position:"relative"})})(jwplayer);
(function(d){var k=d.html5,a=d.utils,c=d.events;k.model=function(e,f){function g(a){var b=s[a.type];if(b&&b.length){for(var c=!1,d=0;d<b.length;d++){var e=b[d].split("-\x3e"),f=e[0],e=e[1]||f;h[e]!==a[f]&&(h[e]=a[f],c=!0)}c&&h.sendEvent(a.type,a)}else h.sendEvent(a.type,a)}var h=this,b,p=a.getCookies(),j={controlbar:{},display:{}},l=a.noop,r={autostart:!1,controls:!0,fullscreen:!1,height:320,mobilecontrols:!1,mute:!1,playlist:[],playlistposition:"none",playlistsize:180,playlistlayout:"extended",repeat:!1,
stretching:a.stretching.UNIFORM,width:480,volume:90},s={};s[c.JWPLAYER_MEDIA_MUTE]=["mute"];s[c.JWPLAYER_MEDIA_VOLUME]=["volume"];s[c.JWPLAYER_PLAYER_STATE]=["newstate-\x3estate"];s[c.JWPLAYER_MEDIA_BUFFER]=["bufferPercent-\x3ebuffer"];s[c.JWPLAYER_MEDIA_TIME]=["position","duration"];h.setVideoProvider=function(a){if(b){b.removeGlobalListener(g);var c=b.getContainer();c&&(b.remove(),a.setContainer(c))}b=a;b.volume(h.volume);b.mute(h.mute);b.addGlobalListener(g)};h.destroy=function(){b&&(b.removeGlobalListener(g),
b.destroy())};h.getVideo=function(){return b};h.seekDrag=function(a){b.seekDrag(a)};h.setFullscreen=function(a){a=!!a;a!==h.fullscreen&&(h.fullscreen=a,h.sendEvent(c.JWPLAYER_FULLSCREEN,{fullscreen:a}))};h.setPlaylist=function(a){h.playlist=d.playlist.filterPlaylist(a,h.androidhls);0===h.playlist.length?h.sendEvent(c.JWPLAYER_ERROR,{message:"Error loading playlist: No playable sources found"}):(h.sendEvent(c.JWPLAYER_PLAYLIST_LOADED,{playlist:d(h.id).getPlaylist()}),h.item=-1,h.setItem(0))};h.setItem=
function(a){var b=!1;a===h.playlist.length||-1>a?(a=0,b=!0):a=-1===a||a>h.playlist.length?h.playlist.length-1:a;if(b||a!==h.item)h.item=a,h.sendEvent(c.JWPLAYER_PLAYLIST_ITEM,{index:h.item}),b=h.playlist[a],a=k.chooseProvider(b&&b.sources&&b.sources[0]),l instanceof a||(l=f||new a(h.id),h.setVideoProvider(l)),l.init&&l.init(b)};h.setVolume=function(d){h.mute&&0<d&&h.setMute(!1);d=Math.round(d);h.mute||a.saveCookie("volume",d);g({type:c.JWPLAYER_MEDIA_VOLUME,volume:d});b.volume(d)};h.setMute=function(d){a.exists(d)||
(d=!h.mute);a.saveCookie("mute",d);g({type:c.JWPLAYER_MEDIA_MUTE,mute:d});b.mute(d)};h.componentConfig=function(a){return j[a]};a.extend(h,new c.eventdispatcher);var t=h,A=a.extend({},r,p,e);a.foreach(A,function(b,c){A[b]=a.serialize(c)});t.config=A;a.extend(h,{id:e.id,state:c.state.IDLE,duration:-1,position:0,buffer:0},h.config);h.playlist=[];h.setItem(0)}})(jwplayer);
(function(d){var k=d.utils,a=k.css,c=k.transitionStyle,e="top",f="bottom",g="right",h="left",b={fontcase:void 0,fontcolor:"#ffffff",fontsize:12,fontweight:void 0,activecolor:"#ffffff",overcolor:"#ffffff"};d.html5.overlay=function(c,d,l){function r(a){return"#"+B+(a?" ."+a:"")}function s(a,b){var c=document.createElement("div");a&&(c.className=a);b&&b.appendChild(c);return c}function t(b,c){var d;d=(d=z.getSkinElement("tooltip",b))?d:{width:0,height:0,src:"",image:void 0,ready:!1};var e=s(c,q);a.style(e,
A(d));return[e,d]}function A(a){return{background:"url("+a.src+") center","background-size":a.width+"px "+a.height+"px"}}function y(b,c){c||(c="");var d=t("cap"+b+c,"jwborder jw"+b+(c?c:"")),j=d[0],d=d[1],m=k.extend(A(d),{width:b===h||c===h||b===g||c===g?d.width:void 0,height:b===e||c===e||b===f||c===f?d.height:void 0});m[b]=b===f&&!u||b===e&&u?v.height:0;c&&(m[c]=0);a.style(j,m);j={};m={};d={left:d.width,right:d.width,top:(u?v.height:0)+d.height,bottom:(u?0:v.height)+d.height};c&&(j[c]=d[c],j[b]=
0,m[b]=d[b],m[c]=0,a(r("jw"+b),j),a(r("jw"+c),m),F[b]=d[b],F[c]=d[c])}var m=this,B=c,z=d,u=l,q,w,v,C;c=k.extend({},b,z.getComponentSettings("tooltip"));var F={};m.element=function(){return q};m.setContents=function(a){k.empty(w);w.appendChild(a)};m.positionX=function(b){a.style(q,{left:Math.round(b)})};m.constrainX=function(b,c){if(m.showing&&0!==b.width&&m.offsetX(0)){c&&a.unblock();var d=k.bounds(q);0!==d.width&&(d.right>b.right?m.offsetX(b.right-d.right):d.left<b.left&&m.offsetX(b.left-d.left))}};
m.offsetX=function(b){b=Math.round(b);var c=q.clientWidth;0!==c&&(a.style(q,{"margin-left":Math.round(-c/2)+b}),a.style(C,{"margin-left":Math.round(-v.width/2)-b}));return c};m.borderWidth=function(){return F.left};m.show=function(){m.showing=!0;a.style(q,{opacity:1,visibility:"visible"})};m.hide=function(){m.showing=!1;a.style(q,{opacity:0,visibility:"hidden"})};q=s(".jwoverlay".replace(".",""));q.id=B;d=t("arrow","jwarrow");C=d[0];v=d[1];a.style(C,{position:"absolute",bottom:u?void 0:0,top:u?0:
void 0,width:v.width,height:v.height,left:"50%"});y(e,h);y(f,h);y(e,g);y(f,g);y(h);y(g);y(e);y(f);d=t("background","jwback");a.style(d[0],{left:F.left,right:F.right,top:F.top,bottom:F.bottom});w=s("jwcontents",q);a(r("jwcontents")+" *",{color:c.fontcolor,font:c.fontweight+" "+c.fontsize+"px Arial,Helvetica,sans-serif","text-transform":"upper"===c.fontcase?"uppercase":void 0});u&&k.transform(r("jwarrow"),"rotate(180deg)");a.style(q,{padding:F.top+1+"px "+F.right+"px "+(F.bottom+1)+"px "+F.left+"px"});
m.showing=!1};a(".jwoverlay",{position:"absolute",visibility:"hidden",opacity:0});a(".jwoverlay .jwcontents",{position:"relative","z-index":1});a(".jwoverlay .jwborder",{position:"absolute","background-size":"100% 100%"},!0);a(".jwoverlay .jwback",{position:"absolute","background-size":"100% 100%"});c(".jwoverlay","opacity .25s, visibility .25s")})(jwplayer);
(function(d){var k=d.html5,a=d.utils;k.player=function(c){function e(){for(var a=p.playlist,b=[],c=0;c<a.length;c++)b.push(f(a[c]));return b}function f(b){var c={description:b.description,file:b.file,image:b.image,mediaid:b.mediaid,title:b.title};a.foreach(b,function(a,b){c[a]=b});c.sources=[];c.tracks=[];0<b.sources.length&&a.foreach(b.sources,function(a,b){c.sources.push({file:b.file,type:b.type?b.type:void 0,label:b.label,"default":b["default"]?!0:!1})});0<b.tracks.length&&a.foreach(b.tracks,function(a,
b){c.tracks.push({file:b.file,kind:b.kind?b.kind:void 0,label:b.label,"default":b["default"]?!0:!1})});!b.file&&0<b.sources.length&&(c.file=b.sources[0].file);return c}function g(){b.jwPlay=l.play;b.jwPause=l.pause;b.jwStop=l.stop;b.jwSeek=l.seek;b.jwSetVolume=l.setVolume;b.jwSetMute=l.setMute;b.jwLoad=l.load;b.jwPlaylistNext=l.next;b.jwPlaylistPrev=l.prev;b.jwPlaylistItem=l.item;b.jwSetFullscreen=l.setFullscreen;b.jwResize=j.resize;b.jwSeekDrag=p.seekDrag;b.jwGetQualityLevels=l.getQualityLevels;
b.jwGetCurrentQuality=l.getCurrentQuality;b.jwSetCurrentQuality=l.setCurrentQuality;b.jwGetAudioTracks=l.getAudioTracks;b.jwGetCurrentAudioTrack=l.getCurrentAudioTrack;b.jwSetCurrentAudioTrack=l.setCurrentAudioTrack;b.jwGetCaptionsList=l.getCaptionsList;b.jwGetCurrentCaptions=l.getCurrentCaptions;b.jwSetCurrentCaptions=l.setCurrentCaptions;b.jwGetSafeRegion=j.getSafeRegion;b.jwForceState=j.forceState;b.jwReleaseState=j.releaseState;b.jwGetPlaylistIndex=h("item");b.jwGetPosition=h("position");b.jwGetDuration=
h("duration");b.jwGetBuffer=h("buffer");b.jwGetWidth=h("width");b.jwGetHeight=h("height");b.jwGetFullscreen=h("fullscreen");b.jwGetVolume=h("volume");b.jwGetMute=h("mute");b.jwGetState=h("state");b.jwGetStretching=h("stretching");b.jwGetPlaylist=e;b.jwGetControls=h("controls");b.jwDetachMedia=l.detachMedia;b.jwAttachMedia=l.attachMedia;b.jwPlayAd=function(a){var c=d(b.id).plugins;c.vast&&c.vast.jwPlayAd(a)};b.jwPauseAd=function(){var a=d(b.id).plugins;a.googima&&a.googima.jwPauseAd()};b.jwDestroyGoogima=
function(){var a=d(b.id).plugins;a.googima&&a.googima.jwDestroyGoogima()};b.jwInitInstream=function(){b.jwInstreamDestroy();s=new k.instream(b,p,j,l);s.init()};b.jwLoadItemInstream=function(a,b){if(!s)throw"Instream player undefined";s.load(a,b)};b.jwLoadArrayInstream=function(a,b){if(!s)throw"Instream player undefined";s.load(a,b)};b.jwSetControls=function(a){j.setControls(a);s&&s.setControls(a)};b.jwInstreamPlay=function(){s&&s.jwInstreamPlay()};b.jwInstreamPause=function(){s&&s.jwInstreamPause()};
b.jwInstreamState=function(){return s?s.jwInstreamState():""};b.jwInstreamDestroy=function(a,b){if(b=b||s)b.jwInstreamDestroy(a||!1),b===s&&(s=void 0)};b.jwInstreamAddEventListener=function(a,b){s&&s.jwInstreamAddEventListener(a,b)};b.jwInstreamRemoveEventListener=function(a,b){s&&s.jwInstreamRemoveEventListener(a,b)};b.jwPlayerDestroy=function(){j&&j.destroy();p&&p.destroy();r&&r.resetEventListeners()};b.jwInstreamSetText=function(a){s&&s.jwInstreamSetText(a)};b.jwIsBeforePlay=function(){return l.checkBeforePlay()};
b.jwIsBeforeComplete=function(){return p.getVideo().checkComplete()};b.jwSetCues=j.addCues;b.jwAddEventListener=l.addEventListener;b.jwRemoveEventListener=l.removeEventListener;b.jwDockAddButton=j.addButton;b.jwDockRemoveButton=j.removeButton}function h(a){return function(){return p[a]}}var b=this,p,j,l,r,s;p=new k.model(c);b.id=p.id;b._model=p;a.css.block(b.id);j=new k.view(b,p);l=new k.controller(p,j);g();b.initializeAPI=g;r=new k.setup(p,j);r.addEventListener(d.events.JWPLAYER_READY,function(c){l.playerReady(c);
a.css.unblock(b.id)});r.addEventListener(d.events.JWPLAYER_ERROR,function(c){a.css.unblock(b.id);d(b.id).dispatchEvent(d.events.JWPLAYER_SETUP_ERROR,c)});r.start()}})(window.jwplayer);
(function(d){var k={size:180,backgroundcolor:"#333333",fontcolor:"#999999",overcolor:"#CCCCCC",activecolor:"#CCCCCC",titlecolor:"#CCCCCC",titleovercolor:"#FFFFFF",titleactivecolor:"#FFFFFF",fontweight:"normal",titleweight:"normal",fontsize:11,titlesize:13},a=d.html5,c=d.events,e=d.utils,f=e.css,g=e.isMobile();a.playlistcomponent=function(d,b){function p(a){return"#"+A.id+(a?" ."+a:"")}function j(a,b){var c=document.createElement(a);b&&(c.className=b);return c}function l(a){return function(){u=a;r.jwPlaylistItem(a);
r.jwPlay(!0)}}var r=d,s=r.skin,t=e.extend({},k,r.skin.getComponentSettings("playlist"),b),A,y,m,B,z=-1,u,q,w=76,v={background:void 0,divider:void 0,item:void 0,itemOver:void 0,itemImage:void 0,itemActive:void 0},C,F=this;F.element=function(){return A};F.redraw=function(){q&&q.redraw()};F.show=function(){e.show(A)};F.hide=function(){e.hide(A)};A=j("div","jwplaylist");A.id=r.id+"_jwplayer_playlistcomponent";C="basic"===r._model.playlistlayout;y=j("div","jwlistcontainer");A.appendChild(y);e.foreach(v,
function(a){v[a]=s.getSkinElement("playlist",a)});C&&(w=32);v.divider&&(w+=v.divider.height);var x=0,K=0,n=0;e.clearCss(p());f(p(),{"background-color":t.backgroundcolor});f(p("jwlist"),{"background-image":v.background?" url("+v.background.src+")":""});f(p("jwlist *"),{color:t.fontcolor,font:t.fontweight+" "+t.fontsize+"px Arial, Helvetica, sans-serif"});v.itemImage?(x=(w-v.itemImage.height)/2+"px ",K=v.itemImage.width,n=v.itemImage.height):(K=4*w/3,n=w);v.divider&&f(p("jwplaylistdivider"),{"background-image":"url("+
v.divider.src+")","background-size":"100% "+v.divider.height+"px",width:"100%",height:v.divider.height});f(p("jwplaylistimg"),{height:n,width:K,margin:x?x+"0 "+x+x:"0 5px 0 0"});f(p("jwlist li"),{"background-image":v.item?"url("+v.item.src+")":"",height:w,overflow:"hidden","background-size":"100% "+w+"px",cursor:"pointer"});x={overflow:"hidden"};""!==t.activecolor&&(x.color=t.activecolor);v.itemActive&&(x["background-image"]="url("+v.itemActive.src+")");f(p("jwlist li.active"),x);f(p("jwlist li.active .jwtitle"),
{color:t.titleactivecolor});f(p("jwlist li.active .jwdescription"),{color:t.activecolor});x={overflow:"hidden"};""!==t.overcolor&&(x.color=t.overcolor);v.itemOver&&(x["background-image"]="url("+v.itemOver.src+")");g||(f(p("jwlist li:hover"),x),f(p("jwlist li:hover .jwtitle"),{color:t.titleovercolor}),f(p("jwlist li:hover .jwdescription"),{color:t.overcolor}));f(p("jwtextwrapper"),{height:w,position:"relative"});f(p("jwtitle"),{overflow:"hidden",display:"inline-block",height:C?w:20,color:t.titlecolor,
"font-size":t.titlesize,"font-weight":t.titleweight,"margin-top":C?"0 10px":10,"margin-left":10,"margin-right":10,"line-height":C?w:20});f(p("jwdescription"),{display:"block","font-size":t.fontsize,"line-height":18,"margin-left":10,"margin-right":10,overflow:"hidden",height:36,position:"relative"});r.jwAddEventListener(c.JWPLAYER_PLAYLIST_LOADED,function(){y.innerHTML="";for(var b=r.jwGetPlaylist(),c=[],d=0;d<b.length;d++)b[d]["ova.hidden"]||c.push(b[d]);if(m=c){b=j("ul","jwlist");b.id=A.id+"_ul"+
Math.round(1E7*Math.random());B=b;for(b=0;b<m.length;b++){var h=b,c=m[h],d=j("li","jwitem"),k=void 0;d.id=B.id+"_item_"+h;0<h?(k=j("div","jwplaylistdivider"),d.appendChild(k)):(h=v.divider?v.divider.height:0,d.style.height=w-h+"px",d.style["background-size"]="100% "+(w-h)+"px");h=j("div","jwplaylistimg jwfill");k=void 0;c["playlist.image"]&&v.itemImage?k=c["playlist.image"]:c.image&&v.itemImage?k=c.image:v.itemImage&&(k=v.itemImage.src);k&&!C&&(f("#"+d.id+" .jwplaylistimg",{"background-image":k}),
d.appendChild(h));h=j("div","jwtextwrapper");k=j("span","jwtitle");k.innerHTML=c&&c.title?c.title:"";h.appendChild(k);c.description&&!C&&(k=j("span","jwdescription"),k.innerHTML=c.description,h.appendChild(k));d.appendChild(h);c=d;g?(new e.touch(c)).addEventListener(e.touchEvents.TAP,l(b)):c.onclick=l(b);B.appendChild(c)}z=r.jwGetPlaylistIndex();y.appendChild(B);q=new a.playlistslider(A.id+"_slider",r.skin,A,B)}});r.jwAddEventListener(c.JWPLAYER_PLAYLIST_ITEM,function(a){0<=z&&(document.getElementById(B.id+
"_item_"+z).className="jwitem",z=a.index);document.getElementById(B.id+"_item_"+a.index).className="jwitem active";a=r.jwGetPlaylistIndex();a!==u&&(u=-1,q&&q.visible()&&q.thumbPosition(a/(r.jwGetPlaylist().length-1)))});r.jwAddEventListener(c.JWPLAYER_RESIZE,function(){F.redraw()});return this};f(".jwplaylist",{position:"absolute",width:"100%",height:"100%"});e.dragStyle(".jwplaylist","none");f(".jwplaylist .jwplaylistimg",{position:"relative",width:"100%","float":"left",margin:"0 5px 0 0",background:"#000",
overflow:"hidden"});f(".jwplaylist .jwlist",{position:"absolute",width:"100%","list-style":"none",margin:0,padding:0,overflow:"hidden"});f(".jwplaylist .jwlistcontainer",{position:"absolute",overflow:"hidden",width:"100%",height:"100%"});f(".jwplaylist .jwlist li",{width:"100%"});f(".jwplaylist .jwtextwrapper",{overflow:"hidden"});f(".jwplaylist .jwplaylistdivider",{position:"absolute"});g&&e.transitionStyle(".jwplaylist .jwlist","top .35s")})(jwplayer);
(function(d){function k(){var a=[],b;for(b=0;b<arguments.length;b++)a.push(".jwplaylist ."+arguments[b]);return a.join(",")}var a=jwplayer.utils,c=a.touchEvents,e=a.css,f=document,g=window;d.playlistslider=function(d,b,k,j){function l(a){return"#"+w.id+(a?" ."+a:"")}function r(a,b,c,d){var g=f.createElement("div");a&&(g.className=a,b&&e(l(a),{"background-image":b.src?b.src:void 0,"background-repeat":d?"repeat-y":"no-repeat",height:d?void 0:b.height}));c&&c.appendChild(g);return g}function s(a){return(a=
u.getSkinElement("playlist",a))?a:{width:0,height:0,src:void 0}}function t(a){if(L)return a=a?a:g.event,aa(x-(a.detail?-1*a.detail:a.wheelDelta/40)/10),a.stopPropagation&&a.stopPropagation(),a.preventDefault?a.preventDefault():a.returnValue=!1,a.cancelBubble=!0,a.cancel=!0,!1}function A(a){0==a.button&&(F=!0);f.onselectstart=function(){return!1};g.addEventListener("mousemove",m,!1);g.addEventListener("mouseup",z,!1)}function y(a){aa(x-2*a.deltaY/q.clientHeight)}function m(b){if(F||"click"==b.type){var c=
a.bounds(v),d=C.clientHeight/2;aa((b.pageY-c.top-d)/(c.height-d-d))}}function B(a){return function(b){0<b.button||(aa(x+0.05*a),K=setTimeout(function(){n=setInterval(function(){aa(x+0.05*a)},50)},500))}}function z(){F=!1;g.removeEventListener("mousemove",m);g.removeEventListener("mouseup",z);f.onselectstart=void 0;clearTimeout(K);clearInterval(n)}var u=b,q=j,w,v,C,F,x=0,K,n;b=a.isMobile();var L=!0,J,M,I,G,O,R,Q,T,D;this.element=function(){return w};this.visible=function(){return L};var U=this.redraw=
function(){clearTimeout(D);D=setTimeout(function(){if(q&&q.clientHeight){var a=q.parentNode.clientHeight/q.clientHeight;0>a&&(a=0);1<a?L=!1:(L=!0,e(l("jwthumb"),{height:Math.max(v.clientHeight*a,O.height+R.height)}));e(l(),{visibility:L?"visible":"hidden"});q&&(q.style.width=L?q.parentElement.clientWidth-I.width+"px":"")}else D=setTimeout(U,10)},0)},aa=this.thumbPosition=function(a){isNaN(a)&&(a=0);x=Math.max(0,Math.min(1,a));e(l("jwthumb"),{top:Q+(v.clientHeight-C.clientHeight)*x});j&&(j.style.top=
Math.min(0,w.clientHeight-j.scrollHeight)*x+"px")};w=r("jwslider",null,k);w.id=d;d=new a.touch(q);b?d.addEventListener(c.DRAG,y):(w.addEventListener("mousedown",A,!1),w.addEventListener("click",m,!1));J=s("sliderCapTop");M=s("sliderCapBottom");I=s("sliderRail");d=s("sliderRailCapTop");k=s("sliderRailCapBottom");G=s("sliderThumb");O=s("sliderThumbCapTop");R=s("sliderThumbCapBottom");Q=J.height;T=M.height;e(l(),{width:I.width});e(l("jwrail"),{top:Q,bottom:T});e(l("jwthumb"),{top:Q});J=r("jwslidertop",
J,w);M=r("jwsliderbottom",M,w);v=r("jwrail",null,w);C=r("jwthumb",null,w);b||(J.addEventListener("mousedown",B(-1),!1),M.addEventListener("mousedown",B(1),!1));r("jwrailtop",d,v);r("jwrailback",I,v,!0);r("jwrailbottom",k,v);e(l("jwrailback"),{top:d.height,bottom:k.height});r("jwthumbtop",O,C);r("jwthumbback",G,C,!0);r("jwthumbbottom",R,C);e(l("jwthumbback"),{top:O.height,bottom:R.height});U();q&&!b&&(q.addEventListener("mousewheel",t,!1),q.addEventListener("DOMMouseScroll",t,!1));return this};e(k("jwslider"),
{position:"absolute",height:"100%",visibility:"hidden",right:0,top:0,cursor:"pointer","z-index":1,overflow:"hidden"});e(k("jwslider")+" *",{position:"absolute",width:"100%","background-position":"center","background-size":"100% 100%",overflow:"hidden"});e(k("jwslidertop","jwrailtop","jwthumbtop"),{top:0});e(k("jwsliderbottom","jwrailbottom","jwthumbbottom"),{bottom:0})})(jwplayer.html5);
(function(d){var k=jwplayer.utils,a=k.css,c=document,e="none";d.rightclick=function(a,g){function h(a){var b=c.createElement("div");b.className=a.replace(".","");return b}function b(){l||(r.style.display=e)}var p,j=k.extend({aboutlink:"http://www.longtailvideo.com/jwpabout/?a\x3dr\x26v\x3d"+d.version+"\x26m\x3dh\x26e\x3do",abouttext:"About JW Player "+d.version+"..."},g),l=!1,r,s;this.element=function(){return r};this.destroy=function(){c.removeEventListener("mousedown",b,!1)};p=c.getElementById(a.id);
r=h(".jwclick");r.id=a.id+"_menu";r.style.display=e;p.oncontextmenu=function(a){var b,c;l||(a=a||window.event,b=a.target||a.srcElement,c=k.bounds(p),b=k.bounds(b),r.style.display=e,r.style.left=(a.offsetX?a.offsetX:a.layerX)+b.left-c.left+"px",r.style.top=(a.offsetY?a.offsetY:a.layerY)+b.top-c.top+"px",r.style.display="block",a.preventDefault())};r.onmouseover=function(){l=!0};r.onmouseout=function(){l=!1};c.addEventListener("mousedown",b,!1);s=h(".jwclick_item");s.innerHTML=j.abouttext;s.onclick=
function(){window.top.location=j.aboutlink};r.appendChild(s);p.appendChild(r)};a(".jwclick",{"background-color":"#FFF","-webkit-border-radius":5,"-moz-border-radius":5,"border-radius":5,height:"auto",border:"1px solid #bcbcbc","font-family":"'MS Sans Serif', 'Geneva', sans-serif","font-size":10,width:320,"-webkit-box-shadow":"5px 5px 7px rgba(0,0,0,.10), 0px 1px 0px rgba(255,255,255,.3) inset","-moz-box-shadow":"5px 5px 7px rgba(0,0,0,.10), 0px 1px 0px rgba(255,255,255,.3) inset","box-shadow":"5px 5px 7px rgba(0,0,0,.10), 0px 1px 0px rgba(255,255,255,.3) inset",
position:"absolute","z-index":999},!0);a(".jwclick div",{padding:"8px 21px",margin:"0px","background-color":"#FFF",border:"none","font-family":"'MS Sans Serif', 'Geneva', sans-serif","font-size":10,color:"inherit"},!0);a(".jwclick_item",{padding:"8px 21px","text-align":"left",cursor:"pointer"},!0);a(".jwclick_item:hover",{"background-color":"#595959",color:"#FFF"},!0);a(".jwclick_item a",{"text-decoration":e,color:"#000"},!0);a(".jwclick hr",{width:"100%",padding:0,margin:0,border:"1px #e9e9e9 solid"},
!0)})(jwplayer.html5);
(function(d){var k=d.html5,a=d.utils,c=d.events,e=2,f=4;k.setup=function(g,h){function b(){for(var a=0;a<z.length;a++){var c=z[a],d;a:{if(d=c.depends){d=d.toString().split(",");for(var e=0;e<d.length;e++)if(!t[d[e]]){d=!1;break a}}d=!0}if(d){z.splice(a,1);try{c.method(),b()}catch(f){r(f.message)}return}}0<z.length&&!m&&setTimeout(b,500)}function p(){t[e]=!0}function j(a){r("Error loading skin: "+a)}function l(){B&&(B.onload=null,B=B.onerror=null);clearTimeout(u);t[f]=!0}function r(a){m=!0;y.sendEvent(c.JWPLAYER_ERROR,
{message:a});s.setupError(a)}var s=h,t={},A,y=new c.eventdispatcher,m=!1,B,z=[{name:1,method:function(){g.edition&&"invalid"===g.edition()?r("Error setting up player: Invalid license key"):t[1]=!0},depends:!1},{name:e,method:function(){A=new k.skin;A.load(g.config.skin,p,j)},depends:1},{name:3,method:function(){var b=a.typeOf(g.config.playlist);"array"===b?(b=new d.playlist(g.config.playlist),g.setPlaylist(b),0===g.playlist.length||0===g.playlist[0].sources.length?r("Error loading playlist: No playable sources found"):
t[3]=!0):r("Playlist type not supported: "+b)},depends:1},{name:f,method:function(){var a=g.playlist[g.item].image;a&&!g.config.autostart?(B=new Image,B.onload=l,B.onerror=l,B.src=a,clearTimeout(u),u=setTimeout(l,500)):l()},depends:3},{name:5,method:function(){s.setup(A);t[5]=!0},depends:f+","+e},{name:6,method:function(){t[6]=!0},depends:"5,3"},{name:7,method:function(){y.sendEvent(c.JWPLAYER_READY);t[7]=!0},depends:6}],u=-1;a.extend(this,y);this.start=b}})(jwplayer);
(function(d){d.skin=function(){var k={},a=!1;this.load=function(c,e,f){new d.skinloader(c,function(c){a=!0;k=c;"function"==typeof e&&e()},function(a){"function"==typeof f&&f(a)})};this.getSkinElement=function(c,d){c=c.toLowerCase();d=d.toLowerCase();if(a)try{return k[c].elements[d]}catch(f){jwplayer.utils.log("No such skin component / element: ",[c,d])}return null};this.getComponentSettings=function(c){c=c.toLowerCase();return a&&k&&k[c]?k[c].settings:null};this.getComponentLayout=function(c){c=c.toLowerCase();
if(a){var d=k[c].layout;if(d&&(d.left||d.right||d.center))return k[c].layout}return null}}})(jwplayer.html5);
(function(d){var k=jwplayer.utils,a=k.foreach,c="Skin formatting error";d.skinloader=function(e,f,g){function h(a){s=a;k.ajax(k.getAbsolutePath(B),function(a){try{k.exists(a.responseXML)&&p(a.responseXML)}catch(b){A(c)}},function(a){A(a)})}function b(a,b){return a?a.getElementsByTagName(b):null}function p(a){var c=b(a,"skin")[0];a=b(c,"component");var d=c.getAttribute("target"),c=parseFloat(c.getAttribute("pixelratio"));0<c&&(q=c);k.versionCheck(d)||A("Incompatible player version");if(0===a.length)t(s);
else for(d=0;d<a.length;d++){var e=r(a[d].getAttribute("name")),c={settings:{},elements:{},layout:{}},f=b(b(a[d],"elements")[0],"element");s[e]=c;for(var g=0;g<f.length;g++)l(f[g],e);if((e=b(a[d],"settings")[0])&&0<e.childNodes.length){e=b(e,"setting");for(f=0;f<e.length;f++){var g=e[f].getAttribute("name"),h=e[f].getAttribute("value");/color$/.test(g)&&(h=k.stringToColor(h));c.settings[r(g)]=h}}if((e=b(a[d],"layout")[0])&&0<e.childNodes.length){e=b(e,"group");for(f=0;f<e.length;f++){h=e[f];g={elements:[]};
c.layout[r(h.getAttribute("position"))]=g;for(var m=0;m<h.attributes.length;m++){var p=h.attributes[m];g[p.name]=p.value}h=b(h,"*");for(m=0;m<h.length;m++){p=h[m];g.elements.push({type:p.tagName});for(var u=0;u<p.attributes.length;u++){var z=p.attributes[u];g.elements[m][r(z.name)]=z.value}k.exists(g.elements[m].name)||(g.elements[m].name=p.tagName)}}}y=!1;j()}}function j(){clearInterval(m);z||(m=setInterval(function(){var b=!0;a(s,function(c,d){"properties"!=c&&a(d.elements,function(a){(s[r(c)]?
s[r(c)].elements[r(a)]:null).ready||(b=!1)})});b&&!y&&(clearInterval(m),t(s))},100))}function l(a,b){b=r(b);var c=new Image,d=r(a.getAttribute("name")),e=a.getAttribute("src");if(0!==e.indexOf("data:image/png;base64,"))var f=k.getAbsolutePath(B),e=[f.substr(0,f.lastIndexOf("/")),b,e].join("/");s[b].elements[d]={height:0,width:0,src:"",ready:!1,image:c};c.onload=function(){var a=b,e=s[r(a)]?s[r(a)].elements[r(d)]:null;e?(e.height=Math.round(c.height/q*u),e.width=Math.round(c.width/q*u),e.src=c.src,
e.ready=!0,j()):k.log("Loaded an image for a missing element: "+a+"."+d)};c.onerror=function(){z=!0;j();A("Skin image not found: "+this.src)};c.src=e}function r(a){return a?a.toLowerCase():""}var s={},t=f,A=g,y=!0,m,B=e,z=!1,u=(jwplayer.utils.isMobile(),1),q=1;"string"!=typeof B||""===B?p(d.defaultskin()):"xml"!=k.extension(B)?A("Skin not a valid file type"):new d.skinloader("",h,A)}})(jwplayer.html5);
(function(d){var k=d.utils,a=d.events,c=k.css;d.html5.thumbs=function(e){function f(a){l=null;try{a=(new d.parsers.srt).parse(a.responseText,!0)}catch(b){g(b.message);return}if("array"!==k.typeOf(a))return g("Invalid data");p=a}function g(a){l=null;k.log("Thumbnails could not be loaded: "+a)}function h(a,d,e){a.onload=null;d.width||(d.width=a.width,d.height=a.height);d["background-image"]=a.src;c.style(b,d);e&&e(d.width)}var b,p,j,l,r,s={},t,A=new a.eventdispatcher;k.extend(this,A);b=document.createElement("div");
b.id=e;this.load=function(a){c.style(b,{display:"none"});l&&(l.onload=null,l.onreadystatechange=null,l.onerror=null,l.abort&&l.abort(),l=null);t&&(t.onload=null);a?(j=a.split("?")[0].split("/").slice(0,-1).join("/"),l=k.ajax(a,f,g,!0)):(p=r=t=null,s={})};this.element=function(){return b};this.updateTimeline=function(a,b){if(p){for(var c=0;c<p.length&&a>p[c].end;)c++;c===p.length&&c--;c=p[c].text;a:{var d=c;if(d&&d!==r){r=d;0>d.indexOf("://")&&(d=j?j+"/"+d:d);var e={display:"block",margin:"0 auto",
"background-position":"0 0",width:0,height:0};if(0<d.indexOf("#xywh"))try{var f=/(.+)\#xywh=(\d+),(\d+),(\d+),(\d+)/.exec(d),d=f[1];e["background-position"]=-1*f[2]+"px "+-1*f[3]+"px";e.width=f[4];e.height=f[5]}catch(k){g("Could not parse thumbnail");break a}var l=s[d];l?h(l,e,b):(l=new Image,l.onload=function(){h(l,e,b)},s[d]=l,l.src=d);t&&(t.onload=null);t=l}}return c}}}})(jwplayer);
(function(d){var k=d.jwplayer,a=k.html5,c=k.utils,e=k.events,f=e.state,g=c.css,h=c.bounds,b=c.isMobile(),p=c.isIPad(),j=c.isIPod(),l="aspectMode",r=["fullscreenchange","webkitfullscreenchange","mozfullscreenchange","MSFullscreenChange"],s="hidden",t="none",A="block";a.view=function(y,m){function B(a){a=c.between(m.position+a,0,this.getDuration());this.seek(a)}function z(a){a=c.between(this.getVolume()+a,0,100);this.setVolume(a)}function u(a){var b;b=a.ctrlKey||a.metaKey?!1:m.controls?!0:!1;if(!b)return!0;
N.adMode()||(ca(),L());b=k(y.id);switch(a.keyCode){case 27:b.setFullscreen(!1);break;case 13:case 32:b.play();break;case 37:N.adMode()||B.call(b,-5);break;case 39:N.adMode()||B.call(b,5);break;case 38:z.call(b,10);break;case 40:z.call(b,-10);break;case 77:b.setMute();break;case 70:b.setFullscreen();break;default:if(48<=a.keyCode&&59>=a.keyCode){var c=(a.keyCode-48)/10*b.getDuration();b.seek(c)}}if(/13|32|37|38|39|40/.test(a.keyCode))return a.preventDefault(),!1}function q(){xa=!0;va.sendEvent(e.JWPLAYER_VIEW_TAB_FOCUS,
{hasFocus:!1})}function w(){var a=!xa;xa=!1;a&&va.sendEvent(e.JWPLAYER_VIEW_TAB_FOCUS,{hasFocus:!0});N.adMode()||(ca(),L())}function v(){xa=!1;va.sendEvent(e.JWPLAYER_VIEW_TAB_FOCUS,{hasFocus:!1})}function C(){var a=h(P),c=Math.round(a.width),f=Math.round(a.height);if(document.body.contains(P)){if(c&&f&&(c!==$a||f!==Ja))$a=c,Ja=f,X&&X.redraw(),clearTimeout(da),da=setTimeout(D,50),va.sendEvent(e.JWPLAYER_RESIZE,{width:c,height:f})}else d.removeEventListener("resize",C),b&&d.removeEventListener("orientationchange",
C);return a}function F(a){a&&(a.element().addEventListener("mousemove",M,!1),a.element().addEventListener("mouseout",I,!1))}function x(){}function K(){clearTimeout(ya);ya=setTimeout(za,Xa)}function n(a,b){var c=document.createElement(a);b&&(c.className=b);return c}function L(){clearTimeout(ya);ya=setTimeout(za,Xa)}function J(){clearTimeout(ya);var a=y.jwGetState();if(a===f.PLAYING||a===f.PAUSED||S)Ca(),Na||(ya=setTimeout(za,Xa))}function M(){clearTimeout(ya);Na=!0}function I(){Na=!1}function G(a){va.sendEvent(a.type,
a)}function O(a){if(a.done)R();else{if(!a.complete){N.adMode()||(N.instreamMode(!0),N.adMode(!0),N.show(!0));N.setText(a.message);var b=a.onClick;void 0!==b&&X.setAlternateClickHandler(function(){b(a)});void 0!==a.onSkipAd&&Y&&Y.setSkipoffset(a,a.onSkipAd)}Y&&Y.adChanged(a)}}function R(){N.setText("");N.adMode(!1);N.instreamMode(!1);N.show(!0);Y&&(Y.adsEnded(),Y.setState(y.jwGetState()));X.revertAlternateClickHandler()}function Q(a,b,d){var e=P.className,f,h,j=y.id+"_view";g.block(j);if(d=!!d)e=e.replace(/\s*aspectMode/,
""),P.className!==e&&(P.className=e),g.style(P,{display:A},d);c.exists(a)&&c.exists(b)&&(m.width=a,m.height=b);d={width:a};-1===e.indexOf(l)&&(d.height=b);g.style(P,d,!0);X&&X.redraw();N&&N.redraw(!0);ea&&(ea.offset(N&&0<=ea.position().indexOf("bottom")?N.height()+N.margin():0),setTimeout(function(){ga&&ga.offset("top-left"===ea.position()?ea.element().clientWidth+ea.margin():0)},500));T(b);f=m.playlistsize;h=m.playlistposition;if(E&&f&&("right"===h||"bottom"===h))E.redraw(),e={display:A},d={},e[h]=
0,d[h]=f,"right"===h?e.width=f:e.height=f,g.style(Ya,e),g.style(Ea,d);D(a,b);g.unblock(j)}function T(a){var b=h(P);fa=0<a.toString().indexOf("%")||0===b.height?!1:"bottom"===m.playlistposition?b.height<=40+m.playlistsize:40>=b.height;N&&(fa?(N.audioMode(!0),Ca(),X.hidePreview(!0),X&&X.hide(),Sa(!1)):(N.audioMode(!1),Va(y.jwGetState())));ea&&fa&&H();P.style.backgroundColor=fa?"transparent":"#000"}function D(a,b){if(!a||isNaN(Number(a))){if(!ba)return;a=ba.clientWidth}if(!b||isNaN(Number(b))){if(!ba)return;
b=ba.clientHeight}c.isMSIE(9)&&(document.all&&!d.atob)&&(a=b="100%");m.getVideo().resize(a,b,m.stretching)&&(clearTimeout(da),da=setTimeout(D,250))}function U(a){void 0!==a.jwstate?a=a.jwstate:na?(a=document.fullscreenElement||document.webkitCurrentFullScreenElement||document.mozFullScreenElement||document.msFullscreenElement,a=!!(a&&a.id===y.id)):a=S?pa.getVideo().getFullScreen():m.getVideo().getFullScreen();na?aa(P,a):Z(a)}function aa(a,b){c.removeClass(a,"jwfullscreen");b?(c.addClass(a,"jwfullscreen"),
g.style(document.body,{"overflow-y":s}),L()):g.style(document.body,{"overflow-y":""});N&&N.redraw();X&&X.redraw();ga&&ga.redraw();D();Z(b)}function Z(a){m.setFullscreen(a);pa&&pa.setFullscreen(a);a?(clearTimeout(da),da=setTimeout(D,200)):p&&y.jwGetState()===f.PAUSED&&setTimeout(Fa,500)}function ca(){N&&m.controls&&(S?La.show():N.show())}function ha(){!0!==la&&(N&&!fa&&!m.getVideo().isAudioFile())&&(S&&La.hide(),N.hide())}function oa(){ga&&(!fa&&m.controls)&&ga.show()}function Da(){ga&&(!ia&&!m.getVideo().isAudioFile())&&
ga.hide()}function H(){ea&&(!m.getVideo().isAudioFile()||fa)&&ea.hide(fa)}function Fa(){X&&m.controls&&!fa&&(!j||y.jwGetState()===f.IDLE)&&X.show();(!b||!m.fullscreen)&&m.getVideo().setControls(!1)}function za(){clearTimeout(ya);if(!0!==la){$=!1;var a=y.jwGetState();(!m.controls||a!==f.PAUSED)&&ha();m.controls||Da();a!==f.IDLE&&a!==f.PAUSED&&(Da(),H());c.addClass(P,"jw-user-inactive")}}function Ca(){if(!1!==la){$=!0;if(m.controls||fa)ca(),oa();ta.hide&&ea&&!fa&&ea.show();c.removeClass(P,"jw-user-inactive")}}
function Sa(a){a=a&&!fa;m.getVideo().setVisibility(a)}function jb(){ia=!0;Qa(!1);m.controls&&oa()}function pb(){Y&&Y.setState(y.jwGetState())}function Pa(a){ia=!1;clearTimeout(Za);Za=setTimeout(function(){Va(a.newstate)},100)}function ab(){ha()}function Va(a){if(m.getVideo().isCaster)X&&(X.show(),X.hidePreview(!1)),g.style(ba,{visibility:"visible",opacity:1}),N&&(N.show(),N.hideFullscreen(!0));else{switch(a){case f.PLAYING:la=!0!==m.getVideo().isCaster?null:!0;(S?pa:m).getVideo().isAudioFile()?(Sa(!1),
X.hidePreview(fa),X.setHiding(!0),N&&(Ca(),N.hideFullscreen(!0)),oa()):(Sa(!0),D(),X.hidePreview(!0),N&&N.hideFullscreen(!m.getVideo().supportsFullscreen()));break;case f.IDLE:Sa(!1);fa||(X.hidePreview(!1),Fa(),oa(),N&&N.hideFullscreen(!1));break;case f.BUFFERING:Fa();za();b&&Sa(!0);break;case f.PAUSED:Fa(),Ca()}ea&&!fa&&ea.show()}}function Wa(a){return"#"+y.id+(a?" ."+a:"")}function bb(a,b){g(a,{display:b?A:t})}var P,Ea,sa,cb,Ya,ya=-1,Xa=b?4E3:2E3,ba,$a,Ja,wa,La,Ta,pa,S=!1,N,X,Y,ga,ea,ta=c.extend({},
m.componentConfig("logo")),ka,E,fa,W=!1,$=!1,la=null,ia,Ga,da=-1,Na=!1,Ma,Oa,na=!1,xa=!1,va=c.extend(this,new e.eventdispatcher);this.getCurrentCaptions=function(){return ka.getCurrentCaptions()};this.setCurrentCaptions=function(a){ka.setCurrentCaptions(a)};this.getCaptionsList=function(){return ka.getCaptionsList()};this.setup=function(h){if(!W){y.skin=h;Ea=n("span","jwmain");Ea.id=y.id+"_view";ba=n("span","jwvideo");ba.id=y.id+"_media";sa=n("span","jwcontrols");wa=n("span","jwinstream");Ya=n("span",
"jwplaylistcontainer");cb=n("span","jwaspect");h=m.height;var s=m.componentConfig("controlbar"),p=m.componentConfig("display");T(h);ka=new a.captions(y,m.captions);ka.addEventListener(e.JWPLAYER_CAPTIONS_LIST,G);ka.addEventListener(e.JWPLAYER_CAPTIONS_CHANGED,G);ka.addEventListener(e.JWPLAYER_CAPTIONS_LOADED,x);sa.appendChild(ka.element());X=new a.display(y,p);X.addEventListener(e.JWPLAYER_DISPLAY_CLICK,function(a){G(a);b?$?za():Ca():Pa({newstate:y.jwGetState()});$&&L()});fa&&X.hidePreview(!0);sa.appendChild(X.element());
ea=new a.logo(y,ta);sa.appendChild(ea.element());ga=new a.dock(y,m.componentConfig("dock"));sa.appendChild(ga.element());y.edition&&!b?Ga=new a.rightclick(y,{abouttext:m.abouttext,aboutlink:m.aboutlink}):b||(Ga=new a.rightclick(y,{}));m.playlistsize&&(m.playlistposition&&m.playlistposition!==t)&&(E=new a.playlistcomponent(y,{}),Ya.appendChild(E.element()));N=new a.controlbar(y,s);N.addEventListener(e.JWPLAYER_USER_ACTION,L);sa.appendChild(N.element());j&&ha();c.canCast()&&va.forceControls(!0);P.onmousedown=
q;P.onfocusin=w;P.addEventListener("focus",w);P.onfocusout=v;P.addEventListener("blur",v);P.addEventListener("keydown",u);Ea.appendChild(ba);Ea.appendChild(sa);Ea.appendChild(wa);P.appendChild(Ea);P.appendChild(cb);P.appendChild(Ya);m.getVideo().setContainer(ba);m.addEventListener("fullscreenchange",U);for(h=r.length;h--;)document.addEventListener(r[h],U,!1);d.removeEventListener("resize",C);d.addEventListener("resize",C,!1);b&&(d.removeEventListener("orientationchange",C),d.addEventListener("orientationchange",
C,!1));k(y.id).onAdPlay(function(){N.adMode(!0);Va(f.PLAYING);L()});k(y.id).onAdSkipped(function(){N.adMode(!1)});k(y.id).onAdComplete(function(){N.adMode(!1)});k(y.id).onAdError(function(){N.adMode(!1)});y.jwAddEventListener(e.JWPLAYER_PLAYER_STATE,Pa);y.jwAddEventListener(e.JWPLAYER_MEDIA_ERROR,ab);y.jwAddEventListener(e.JWPLAYER_PLAYLIST_COMPLETE,jb);y.jwAddEventListener(e.JWPLAYER_PLAYLIST_ITEM,pb);y.jwAddEventListener(e.JWPLAYER_CAST_AVAILABLE,function(){c.canCast()?va.forceControls(!0):va.releaseControls()});
y.jwAddEventListener(e.JWPLAYER_CAST_SESSION,function(a){Y||(Y=new k.html5.castDisplay(y.id),Y.statusDelegate=function(a){Y.setState(a.newstate)});a.active?(g.style(ka.element(),{display:"none"}),va.forceControls(!0),Y.setState("connecting").setName(a.deviceName).show(),y.jwAddEventListener(e.JWPLAYER_PLAYER_STATE,Y.statusDelegate),y.jwAddEventListener(e.JWPLAYER_CAST_AD_CHANGED,O)):(y.jwRemoveEventListener(e.JWPLAYER_PLAYER_STATE,Y.statusDelegate),y.jwRemoveEventListener(e.JWPLAYER_CAST_AD_CHANGED,
O),Y.hide(),N.adMode()&&R(),g.style(ka.element(),{display:null}),Pa({newstate:y.jwGetState()}),C())});Pa({newstate:f.IDLE});b||(sa.addEventListener("mouseout",K,!1),sa.addEventListener("mousemove",J,!1),c.isMSIE()&&(ba.addEventListener("mousemove",J,!1),ba.addEventListener("click",X.clickHandler)));F(N);F(ga);F(ea);g("#"+P.id+"."+l+" .jwaspect",{"margin-top":m.aspectratio,display:A});h=c.exists(m.aspectratio)?parseFloat(m.aspectratio):100;s=m.playlistsize;g("#"+P.id+".playlist-right .jwaspect",{"margin-bottom":-1*
s*(h/100)+"px"});g("#"+P.id+".playlist-right .jwplaylistcontainer",{width:s+"px",right:0,top:0,height:"100%"});g("#"+P.id+".playlist-bottom .jwaspect",{"padding-bottom":s+"px"});g("#"+P.id+".playlist-bottom .jwplaylistcontainer",{width:"100%",height:s+"px",bottom:0});g("#"+P.id+".playlist-right .jwmain",{right:s+"px"});g("#"+P.id+".playlist-bottom .jwmain",{bottom:s+"px"});setTimeout(function(){Q(m.width,m.height)},0)}};var Qa=this.fullscreen=function(a){c.exists(a)||(a=!m.fullscreen);a=!!a;a!==m.fullscreen&&
(na?(a?Ma.apply(P):Oa.apply(document),aa(P,a)):c.isIE()?aa(P,a):(pa&&pa.getVideo().setFullScreen(a),m.getVideo().setFullScreen(a)))};this.resize=function(a,b){Q(a,b,!0);C()};this.resizeMedia=D;var ja=this.completeSetup=function(){g.style(P,{opacity:1});d.onbeforeunload=function(){m.getVideo().isCaster||y.jwStop()}},Za;this.setupInstream=function(a,b,c,d){g.unblock();bb(Wa("jwinstream"),!0);bb(Wa("jwcontrols"),!1);wa.appendChild(a);La=b;Ta=c;pa=d;Pa({newstate:f.PLAYING});S=!0;wa.addEventListener("mousemove",
J);wa.addEventListener("mouseout",K)};this.destroyInstream=function(){g.unblock();bb(Wa("jwinstream"),!1);bb(Wa("jwcontrols"),!0);wa.innerHTML="";wa.removeEventListener("mousemove",J);wa.removeEventListener("mouseout",K);S=!1};this.setupError=function(a){W=!0;k.embed.errorScreen(P,a,m);ja()};this.addButton=function(a,b,c,d){ga&&(ga.addButton(a,b,c,d),y.jwGetState()===f.IDLE&&oa())};this.removeButton=function(a){ga&&ga.removeButton(a)};this.setControls=function(a){var b=!!a;b!==m.controls&&(m.controls=
b,S?a?(La.show(),Ta.show()):(La.hide(),Ta.hide()):b&&Pa({newstate:y.jwGetState()}),b||(za(),X&&X.hide()),va.sendEvent(e.JWPLAYER_CONTROLS,{controls:b}))};this.forceControls=function(a){la=!!a;a?Ca():za()};this.releaseControls=function(){la=null;Va(y.jwGetState())};this.addCues=function(a){N&&N.addCues(a)};this.forceState=function(a){X.forceState(a)};this.releaseState=function(){X.releaseState(y.jwGetState())};this.getSafeRegion=function(a){var b={x:0,y:0,width:0,height:0};a=a||!c.exists(a);N.showTemp();
ga.showTemp();var d=h(Ea),e=d.top,f=S?h(document.getElementById(y.id+"_instream_controlbar")):h(N.element()),g=S?!1:0<ga.numButtons(),j=0===ea.position().indexOf("top"),k=h(ea.element());g&&m.controls&&(g=h(ga.element()),b.y=Math.max(0,g.bottom-e));j&&(b.y=Math.max(b.y,k.bottom-e));b.width=d.width;b.height=f.height&&a&&m.controls?(j?f.top:k.top)-e-b.y:d.height-b.y;N.hideTemp();ga.hideTemp();return b};this.destroy=function(){d.removeEventListener("resize",C);d.removeEventListener("orientationchange",
C);for(var a=r.length;a--;)document.removeEventListener(r[a],U,!1);m.removeEventListener("fullscreenchange",U);P.removeEventListener("keydown",u,!1);Ga&&Ga.destroy();Y&&(y.jwRemoveEventListener(e.JWPLAYER_PLAYER_STATE,Y.statusDelegate),Y.destroy(),Y=null);sa&&(sa.removeEventListener("mousemove",J),sa.removeEventListener("mouseout",K));ba&&(ba.removeEventListener("mousemove",J),ba.removeEventListener("click",X.clickHandler));S&&this.destroyInstream()};P=n("div","jwplayer playlist-"+m.playlistposition);
P.id=y.id;P.tabIndex=0;Ma=P.requestFullscreen||P.webkitRequestFullscreen||P.webkitRequestFullScreen||P.mozRequestFullScreen||P.msRequestFullscreen;Oa=document.exitFullscreen||document.webkitExitFullscreen||document.webkitCancelFullScreen||document.mozCancelFullScreen||document.msExitFullscreen;na=Ma&&Oa;m.aspectratio&&(g.style(P,{display:"inline-block"}),P.className=P.className.replace("jwplayer","jwplayer "+l));Q(m.width,m.height);var Ra=document.getElementById(y.id);Ra.parentNode.replaceChild(P,
Ra)};g(".jwplayer",{position:"relative",display:"block",opacity:0,"min-height":0,"-webkit-transition":"opacity .25s ease","-moz-transition":"opacity .25s ease","-o-transition":"opacity .25s ease"});g(".jwmain",{position:"absolute",left:0,right:0,top:0,bottom:0,"-webkit-transition":"opacity .25s ease","-moz-transition":"opacity .25s ease","-o-transition":"opacity .25s ease"});g(".jwvideo, .jwcontrols",{position:"absolute",height:"100%",width:"100%","-webkit-transition":"opacity .25s ease","-moz-transition":"opacity .25s ease",
"-o-transition":"opacity .25s ease"});g(".jwvideo",{overflow:s,visibility:s,opacity:0});g(".jwvideo video",{background:"transparent",height:"100%",width:"100%",position:"absolute",margin:"auto",right:0,left:0,top:0,bottom:0});g(".jwplaylistcontainer",{position:"absolute",height:"100%",width:"100%",display:t});g(".jwinstream",{position:"absolute",top:0,left:0,bottom:0,right:0,display:"none"});g(".jwaspect",{display:"none"});g(".jwplayer."+l,{height:"auto"});g(".jwplayer.jwfullscreen",{width:"100%",
height:"100%",left:0,right:0,top:0,bottom:0,"z-index":1E3,margin:0,position:"fixed"},!0);g(".jwplayer.jwfullscreen.jw-user-inactive",{cursor:"none","-webkit-cursor-visibility":"auto-hide"});g(".jwplayer.jwfullscreen .jwmain",{left:0,right:0,top:0,bottom:0},!0);g(".jwplayer.jwfullscreen .jwplaylistcontainer",{display:t},!0);g(".jwplayer .jwuniform",{"background-size":"contain !important"});g(".jwplayer .jwfill",{"background-size":"cover !important","background-position":"center"});g(".jwplayer .jwexactfit",
{"background-size":"100% 100% !important"})})(window);
(function(d,k){function a(a){return"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA"+r[a]}function c(a,b){var c=k.createElement(a);b&&e(c,b);return c}function e(a,b){p.isArray(b)||(b=[b]);b=p.map(b,function(a){return!a?"":"jwcast-"+a.toLowerCase()});a.className=b.join(" ")}function f(a,b){b.join||(b=[b]);for(var c=0;c<b.length;c++)a.appendChild(b[c])}var g=d.utils,h=d.html5,b=d.events,p=d._,j=b.state,l=g.css,r={wheel:"DgAAAA4CAYAAACohjseAAACiUlEQVR42u3aP2sTYRzAcZ87Md6mhE5GhRqli0NC22yNKO1iaStSY+ggdKggal6BDXRoUuwbEG1LpE4B30LAxEGbKYgO7SVoUhJD04hOusRv4ZlCwP5LevfDgw9kCnzD5Z4/95xqtVqideNLTQzjKV4gCxtNtNwaqBBGCg3UkcYz3EUIV+F1W6AHj7CFb1hAEIbbb1GFByjjAyZgSvkPXkMGW7gt7SETwQ8swpL0FFV4jjpuShsmTiOFz7gobRxUWEceXokDfQKf0CdxJhNFFT6JU7Ur2MUtiXNRhXdYlDrZnkERZyUGerCNcanLpYfISV0PGtjEpNTAGyjBkBq4ggWpWxYmGghIDRzEDgypgTG8lbyrtoZ5yYFZ3JccWMKg5MCfGJAcuHf5/ge6xwX8lnyLDmCn/SEzJChwCKX2YSIqKDCKbPtAHxcUGAdNOhBPkBYUmAZNOhDXUYMSEKdQBU06EAp1BAUEBnWLgg4EXmJJQOASXnVa0YdRcfma0NAN4U6BCpu44+LASd2g0BYIPEbexYHvdQOfOwdaqLh063AcFVj73bq3XBRnoYiZ/b58ySDposAkMlD/DNT8aGLUBXGjaMJ/0Beg9/Dd4etEH2qIHOUVdgHnHRh3DgUkjnoIIYUNh0V6sYHXUIcO1Eyso4BLDoi7jC94A/O4DgIZWEYdYycYN4YalmF04yjXNJpIwOrxOJdAE9PdPoznRxZFTPUgbgI2svD38jjlLMrI61DjmFcFU/iICmZhnMSB2DOYg41tJBGAOuSPFkASZdiYg8cpR5pHsIIGqkgjjghC6Eef1o8QIphHGlU0sIYRGE4/lB7DKnL4il/Yu/5gFzZyWEUMwzC7sXUv2l9q1CPRZSGkLwAAAABJRU5ErkJggg\x3d\x3d",display:"UAAAAC4AQMAAACo6KcpAAAABlBMVEV6enp6enqEWMsmAAAAAXRSTlMAQObYZgAAAEdJREFUeF7t2bEJACAMRcGAg7j/Fo6VTkvbIKSRe/XBH+DHLlaHK0qN7yAIgiAIgiAIgiAIgiAIgiAIgiAIgg0PZHfzbuUjPCPnO5qQcE/AAAAAAElFTkSuQmCC",
pause:"CoAAAA2CAQAAAAb3sMwAAAAMElEQVR4Ae3MMQEAMAzDsIY/6AxB9/aRfyvt7GX2Ph8UCoVCoVAo9AiFQqFQKBQKfdYvoctOjDeGAAAAAElFTkSuQmCC",play:"DYAAAA2BAMAAAB+a3fuAAAAFVBMVEX///////////////////////////9nSIHRAAAABnRSTlMAP79AwMFfxd6iAAAAX0lEQVR4Xn3JQQGAABAEoaliFiPYYftHMMHBl55uQw455JBDDjnkkEMOOeSQQw455JBDDjnkkEMOOeSQQ+5O3HffW6hQoUKFChUqVKhQoUKFChUqVKhQoUKFChUqVKgfWHsiYI6VycIAAAAASUVORK5CYII\x3d",replay:"DQAAAA8CAYAAAApK5mGAAADkklEQVRoBd3BW2iVBRwA8P/cWHMsv9QilLCITLCU0khpST6JCEXrQbKMCgrKFwsfZq/LMnRRIdkFvBQUvmShgg9iV02zB7FScyWlqNHNqbCJ7PKLkFHp952dnZ3tfOv3ixgGSLAVt8b/ARIX9WADJsVIhsR/daIV42MkQiJdO5ZjdIwkSBR2Ek+gJkYCJIpzEE2Rd0gMzB7MibxCojRbcEtUGsZgJu7HYixVuh6sx6QYLrgSD+Fd/GhodKIV42Ko4B68h07Dpx3NGB3lgnnYpbJOYFoMBm7ANpW3D3NjMPAgzqqsn7EIVVEqVGOtymrHMtTGYKAeWxSvB3vxIh7ANIzFNUpzAa0YF4OFWuxUnFNYjkmRAomB6cX7uDHKAdX4QP/asRRXRAFIFO8TzI5yQov+bcO1UQQk+ncITVFumIce2XqxHFVRJCSy/YolqIlyQwOOy9aNR2KAkLhcJ1agIYYKVsvWi6eiBEj8owfrMDEGAVVYiMcjDa7HBdlejhIhcdF2TI9BQiP2uOgsro5LYa1sX6M2SoQ6zItBwmRsdrnn498wDuel68aMqDBMQZd0v6Mu+mCJbBsiJ7BdtkXRB7ul68HNkRNolO3D+BvGoke6HZEz+Fa6c6gJNMn2WOQMmmW7K/CSbBMiZ3CbbM8EPpKuLXIIo3BWujcCh6TbEjmFr6TbGfhDulcip7BJugOBbulaIqfwlnRHQ7bnIqewVrpjgU7pVkZOYaN0hwOnpFsfOYWt0u0LfCnd55FT+EG6zYEN0p1BdeQMEnRLtzKwTLZZkTO4V7bFgTtka4mcwTrZrgtU47R0P6E6cgINOCfdkeiDjbItipzAs7K1Rh/Mle0gaqLC0IBTsk2PPhiFI7ItiwrDKtl2xaXwqGwdmBoVgrvRJdv8uBRq0CbbISQxzDARJ2TbG1kwX2GfoT6GCa7CN7J1Y0YUgk0K+wJjY4hhAg4o7LXoD8bjuMIOY1oMETTiuMIOoj6KgTvRobDzaEZtlAnq8QK6FHYGU2IgcB+69e97LEJNlAh1eBrH9K8DjVEKPIxuxTmJVZiFmugHajEHa/Cb4nRiQQwGmtBpYM7hU7yNFjSjGSuwDrvRYWD+RGOUA25Hm8rZj8lRThiDd9Br+PTgVdTFUMFcfGfo7cHMGA4YhYXYr/x2YQGqohIwG2vwi9Idw2pMjzzBVCzBm/gYR3EaXbiA02jDDryOJ3FTlNFfAO8ENqnn13UAAAAASUVORK5CYII\x3d"},
s=!1,t=316/176;h.castDisplay=function(r){function p(){if(M){var a=M.element();a.parentNode&&a.parentNode.removeChild(a);M.resetEventListeners();M=null}}function m(){G&&(G.parentNode&&G.parentNode.removeChild(G),G=null)}function B(){I&&(I.parentNode&&I.parentNode.removeChild(I),I=null)}s||(l(".jwplayer .jwcast-display",{display:"none",position:"absolute",width:"100%",height:"100%","background-repeat":"no-repeat","background-size":"auto","background-position":"50% 50%","background-image":a("display")}),
l(".jwplayer .jwcast-label",{position:"absolute",left:10,right:10,bottom:"50%","margin-bottom":100,"text-align":"center"}),l(".jwplayer .jwcast-label span",{"font-family":'"Karbon", "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',"font-size":20,"font-weight":300,color:"#7a7a7a"}),l(".jwplayer span.jwcast-name",{color:"#ccc"}),l(".jwcast-button",{position:"absolute",width:"100%",height:"100%",opacity:0,"background-repeat":"no-repeat",
"background-size":"auto","background-position":"50% 50%"}),l(".jwcast-wheel",{"background-image":a("wheel")}),l(".jwcast-pause",{"background-image":a("pause")}),l(".jwcast-play",{"background-image":a("play")}),l(".jwcast-replay",{"background-image":a("replay")}),l(".jwcast-paused .jwcast-play",{opacity:1}),l(".jwcast-playing .jwcast-pause",{opacity:1}),l(".jwcast-idle .jwcast-replay",{opacity:1}),g.cssKeyframes("spin","from {transform: rotate(0deg);} to {transform: rotate(360deg);}"),l(".jwcast-connecting .jwcast-wheel, .jwcast-buffering .jwcast-wheel",
{opacity:1,"-webkit-animation":"spin 1.5s linear infinite",animation:"spin 1.5s linear infinite"}),l(".jwcast-companion",{position:"absolute","background-position":"50% 50%","background-size":"316px 176px","background-repeat":"no-repeat",top:0,left:0,right:0,bottom:4}),l(".jwplayer .jwcast-click-label",{"font-family":'"Karbon", "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',"font-size":14,"font-weight":300,"text-align":"center",position:"absolute",
left:10,right:10,top:"50%",color:"#ccc","margin-top":100,"-webkit-user-select":"none","user-select":"none",cursor:"pointer"}),l(".jwcast-paused .jwcast-click-label",{color:"#7a7a7a",cursor:"default"}),s=!0);var z=k.getElementById(r+"_display_button"),u=c("div","display"),q=c("div",["pause","button"]),w=c("div",["play","button"]),v=c("div",["replay","button"]),C=c("div",["wheel","button"]),F=c("div","label"),x=c("span"),K=c("span","name"),n="#"+r+"_display.jwdisplay",L=-1,J=null,M=null,I=null,G=null;
f(u,[C,q,w,v,F]);f(F,[x,K]);z.parentNode.insertBefore(u,z);this.statusDelegate=null;this.setName=function(a){K.innerText=a||"Google Cast";return this};this.setState=function(a){var b="Casting on ";if(null===J)if("connecting"===a)b="Connecting to ";else if(a!==j.IDLE){var c=d(r).getPlaylistItem().title||"";c&&(b=b.replace("on",c+" on"))}x.innerText=b;clearTimeout(L);a===j.IDLE&&(L=setTimeout(function(){e(u,["display","idle"])},3E3),a="");e(u,["display",a||""]);return this};this.show=function(){l(n+
" .jwpreview",{"background-size":"316px 176px !important",opacity:0.6,"margin-top":-2});l(n+" .jwdisplayIcon",{display:"none !important"});l.style(u,{display:"block"});return this};this.hide=function(){g.clearCss(n+" .jwpreview");l(n+" .jwdisplayIcon",{display:""});l.style(u,{display:"none"});return this};this.setSkipoffset=function(a,c){if(null===M){var d=k.getElementById(r+"_controlbar"),e=10+g.bounds(u).bottom-g.bounds(d).top;M=new h.adskipbutton(r,e|0,a.skipMessage,a.skipText);M.addEventListener(b.JWPLAYER_AD_SKIPPED,
function(){c(a)});M.reset(a.skipoffset||-1);M.show();d.parentNode.insertBefore(M.element(),d)}else M.reset(a.skipoffset||-1)};this.setCompanions=function(a){var b,d,e,g=Number.MAX_VALUE,h=null;for(d=a.length;d--;)if(b=a[d],b.width&&b.height&&b.source)switch(b.type){case "html":case "iframe":case "application/x-shockwave-flash":break;default:e=Math.abs(b.width/b.height-t),e<g&&(g=e,0.75>e&&(h=b))}(a=h)?(null===I&&(I=c("div","companion"),f(u,I)),a.width/a.height>t?(b=316,d=a.height*b/a.width):(d=176,
b=a.width*d/a.height),l.style(I,{"background-image":a.source,"background-size":b+"px "+d+"px"})):B()};this.adChanged=function(a){if(a.complete)M&&M.reset(-1),J=null;else{M&&(void 0===a.skipoffset?p():(a.position||a.duration)&&M.updateSkipTime(a.position|0,a.duration|0));var b=a.tag+a.sequence;b!==J&&(l(n+" .jwpreview",{opacity:0}),a.companions?this.setCompanions(a.companions):B(),a.clickthrough?null===G&&(G=c("div","click-label"),G.innerText="Click here to learn more \x3e",f(u,G)):m(),J=b,this.setState(a.newstate))}};
this.adsEnded=function(){p();B();m();l(n+" .jwpreview",{opacity:0.6});J=null};this.destroy=function(){this.hide();u.parentNode&&u.parentNode.removeChild(u)}}})(jwplayer,document);
(function(d){var k=jwplayer.utils.extend,a=d.logo;a.defaults.prefix="";a.defaults.file="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHoAAAAyCAMAAACkjD/XAAACnVBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJCQkSEhIAAAAaGhoAAAAiIiIrKysAAAAxMTEAAAA4ODg+Pj4AAABEREQAAABJSUkAAABOTk5TU1NXV1dcXFxiYmJmZmZqamptbW1xcXF0dHR3d3d9fX2AgICHh4eKioqMjIyOjo6QkJCSkpKUlJSWlpaYmJidnZ2enp6ioqKjo6OlpaWmpqanp6epqamqqqqurq6vr6+wsLCxsbG0tLS1tbW2tra3t7e6urq7u7u8vLy9vb2+vr6/v7/AwMDCwsLFxcXFxcXHx8fIyMjJycnKysrNzc3Ozs7Ozs7Pz8/Pz8/Q0NDR0dHR0dHS0tLU1NTV1dXW1tbW1tbW1tbX19fX19fa2trb29vb29vc3Nzc3Nzf39/f39/f39/f39/g4ODh4eHj4+Pj4+Pk5OTk5OTk5OTk5OTl5eXn5+fn5+fn5+fn5+fn5+fo6Ojo6Ojq6urq6urq6urr6+vr6+vr6+vt7e3t7e3t7e3t7e3u7u7u7u7v7+/v7+/w8PDw8PDw8PDw8PDy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL09PT09PT09PT09PT09PT09PT09PT29vb29vb29vb29vb29vb29vb29vb29vb39/f39/f39/f39/f39/f4+Pj4+Pj4+Pj5+fn5+fn5+fn5+fn5+fn5+fn5+fn6+vr6+vr6+vr6+vr6+vr6+vr8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz9/f39/f39/f39/f39/f39/f39/f39/f39/f3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////9kpi5JAAAA33RSTlMAAQIDBAUGBwgJCgsMDQ4PEBESExQVFhYWFxcYGBgZGRoaGhsbHBwdHR4eHx8gISIiIyQmJicoKSoqKywtLi4uMDEyMjM0NTU2Njc5Ojo7Ozw9Pj5AQUJCQ0ZGSElKSktMTU5PUFFRUlRVVlZXWFpbXV5eX2BhYmVmZ2hpamtsbW5vcHFyc3R2d3h5enx9fn+BgoKDhIWGiYmKi4yNjo+QkZKTlJWWl5eYmZqbnJ2enp+goaKkpaamp6ipqqusra6vsLKzs7W2t7i5uru8vb6/wMHCwsPExcbHyMnJysvMVK8y+QAAB5FJREFUeNrFmP2f3EQdx8kmm2yy2WQzmZkjl3bJ2Rb12mtp8SiKiBUUxVKFVisIihV62CKCIoK0UvVK1bP07mitBeVJUVso0Duw1Xo9ET0f6JN47bV3u9+/xe83kyzr0+vlL7t8Xq9ubpLpvHfm+7i54P+UVkBp2gWdFpGNYtFA+NtALpYcxzZ1rSM0TSvgv5xse0wwu1joxDYLulE0dKTTSLcqfOvMQ1WzoHXAtCadsGXqBCsUnWDxNBzmlq51wLSuz0LmOcTWClZFfA1ghLUbrUwbdq396kAvK5s6HoFdlb8FuLONB66RlGnD5S8BwKkNoVMsFEw3XIOj97hmoX2updP5kml7jgLp/Ec8yzBKntwDMCnwa7TPtUrkWLrliW2gtC+0TdNhvdMAu1hJ19plYNcP0LGKiJp/HJTeEI5V8sjJ4PZ2mTp1rb7Pf5C5JbvCN0Cuha7jpE5WX9oeU6us8YlTUH8grFQC+QzkWuKVvdTJXuWO0Z5Nk2tNkWNdzgLed+4tdNWrkpPBI20ytVYwK+LrQLpPcHk3vIVm1ZCcDD7jt8fUGmYNoeLpJzKW+1vQYSjJyc72ZKbWSOqqhpn+99r/rn99WDDLbJViHZbJirkWtJDkZPArbhta2jFg7LdKV1ID9aWaz5CTzTD0pvB2aypB9xYPKtaUXEC7bKKjeA1dHyJTU+xbFgY/RiAKP2lYsm28RaJmAtfTs6c4xP9g0gycUqKpeDGLegZPl3MqTL6oWCdl9EIrOol20/U6zyzgVJzpeV6l7Dhl18VP1/N8v1r1vQoNSziH1nPKKMdBChbAiprheygfL65tZmxazguYXDoL8BcyqlhRb0W/M3Wy412YRTUd7SKEFIKzIBQ8DBhHewgSjkLB7GwS54wxwcoORqYQ+QyhFGA9VIYxnfCKq2VtE3k3wTB1taLx+FVCNTRyxnU4YQ/8WEY9M7PvkvJHsEsAam5srRRwH0YBhml14Zv7pRz62+LAD/jWE0vHINU6OUGXyc0Mt5GiLW/+6blV8eO4tY8B6t3qvBsZOnUy+HJgFaiuMELfhQ6RrAe4JZGvwxcFPLx69YZDZ1ciOrB03ayEd52vr0x6/zokhbxs+p5o7Oc3kfrkxFOrV392d+NWFaeaXvK652Cw+xTAo9cS5ar0vKcfy9BrgNRfMVN0SOh+gPfWtgN8L7kM6pcI2FSrJUtm7kc0KxlF2xcHd/1xWxxvmv1QLB9/5cJobDiKIxklcmI4ShJ5eJ/qOTSqU6/BBC4JN6boQSAN71Doi1Mnm+B0Rjlavgabo/GZ2V/LL8FRSehkkfzzYIouoqXf31jz3de7kq5DB6JP1a+vSUQnOXrRoujpn2XogumJpwCeBfhDV4qeAdK1QwqdOhkMqdAyyyk6HoHR3tmD4/UlI/DDBNFxHK1tDBDaNrHODU7KDzTW16Lr6nccHZGxHNt3Jao/RrSU8pPTeX+JPYj4NpAGkxsg16FoWP1xP5Bu8UwdYxSXJXRyJ0zeCtsegdsm4QsLBBwcHf3l+fF5hHbscnDh1LeSaGwvModnTl7ChVRuNiblxIkjR6bq+9+R9RzkO7cBadWCdZBroDaq/jgDqHMLMYtSr8jkpwl9aaOxF9bdDHsb9T5Ev/rkk6N398SIDj3X5zfDzi1bDpxdHNWWwcOchS27funeR+EOyTI0RcyKLIM20VPzyOObeh4LJsZ/hYnaRpgRsTwG9TPzLz5XhyOSDlzykDEKLsEYl08cG0W9eW+U4B1eZZmtY7J13PXCeHeg0MrPjlH8yLiJ/mYtfqIFvQVNTaez/cMrfwHHpJC7APZH0csAP5ARokPPwXyIoEjKaOnM7UIIOfKKrJEJvEAguhZHUY1sHb3vH1tCxyS0OvGtAL+/iMubQOlMXyKfA6U8i+I0PqWyecA3AmyVEmPhczxEdBUbOKwCsHsAtfNUDyZNdiNcLQld8cTYgQHScjExjNPvOf9RSsrZtt3uB3f2s0Dku35MyiY6z6LYjbMdx+HvO7pd11/egBtCvh7mFvs+P70Rl8L0yU8r7WROyXb5b77Dxemv+I7L82wmxoeY53U9+/K8HE1ZvBq4eGQfh1SNa0Keo5tZVCXwXs7KluUwIZjrMsrHTsB95f4B50JwztGURtHywsBjvGphtIUiFeb9Kn4pjzHXUOhmlXPI3Ug/5QH6BjS1uWpRRdLNku3YWPNw4RKVSSqfpKLq3k3bIZXMvFha+NjQqXqlhYxKa9EgFJGVqKCrqD2ZloJrql7Qgq4vw9DKfn0ahp73B+ln3hPQY/xKJEO1CC2P6T49UOP/fD+R5qphSBvAslttQb8YZr1os7/5ry0P8VDNoZK6T8pnZpdW4bb9ZWPQ2NPtlhxf/A5yPUApt+0/MP2uqy5nLkaKLyZycuOKCp13u9mWXXasol4staAPYyprN1p5CvkR1nD5pxz9jQDPu1Pvbii3yklQmr2U/LtDUr9Fngelp0NqwDsmirPtoLRWJdxOiQrp9Yr8XGiTk3XyxF2eFuw3+ju5aRJl1Yu+f+LMM1eiexc6/lK0QuWpYhkd3XT+UsfOXhd2WKpO6W/TO3BUO8H/BB7RwuB6W7b7AAAAAElFTkSuQmCC";d.logo=
function(c,d){"free"==c.edition()?d=null:(a.defaults.file="",a.defaults.prefix="");k(this,new a(c,d))}})(jwplayer.html5);(function(d){var k=d.html5,a=k.model;k.model=function(c,e){var f=new d.utils.key(c.key),g=new a(c,e),h=g.componentConfig;g.edition=function(){return f.edition()};g.componentConfig=function(a){return"logo"==a?g.logo:h(a)};return g}})(jwplayer);
(function(d){var k=d.html5,a=k.player;k.player=function(c){c=new a(c);var e;e=c._model.edition();if("enterprise"===e||"ads"===e)e=new d.cast.controller(c,c._model),c.jwStartCasting=e.startCasting,c.jwStopCasting=e.stopCasting;return c};a.prototype.edition=function(){return this._model.edition()}})(jwplayer);
(function(d){function k(e){if(!a.isFunction(e.supports))throw{message:"Tried to register a provider with an invalid object"};var f=function(){};f.prototype=d.html5.DefaultProvider;e.prototype=new f;c.unshift(e)}var a=d._,c=[d.html5.YoutubeProvider,d.html5.VideoProvider];a.each(d.unregisteredProviders,k);delete d.unregisteredProviders;d.html5.chooseProvider=function(d){d=a.isObject(d)?d:{};return a.find(c,function(a){return a.supports(d)})};d.html5.registerProvider=k})(jwplayer);
(function(d){var k=jwplayer.utils.extend,a=d.rightclick;d.rightclick=function(c,e){if("free"==c.edition())e.aboutlink="http://www.longtailvideo.com/jwpabout/?a\x3dr\x26v\x3d"+d.version+"\x26m\x3dh\x26e\x3df",delete e.abouttext;else{if(!e.aboutlink){var f="http://www.longtailvideo.com/jwpabout/?a\x3dr\x26v\x3d"+d.version+"\x26m\x3dh\x26e\x3d",g=c.edition();e.aboutlink=f+("pro"==g?"p":"premium"==g?"r":"enterprise"==g?"e":"ads"==g?"a":"f")}e.abouttext?e.abouttext+=" ...":(f=c.edition(),f=f.charAt(0).toUpperCase()+
f.substr(1),e.abouttext="About JW Player "+d.version+" ("+f+" edition)")}k(this,new a(c,e))}})(jwplayer.html5);
(function(d){var k=d.cast,a=d.utils;k.adprovider=function(c,e){function f(){p={message:j,position:0,duration:-1}}function g(b,d){var f={command:b};void 0!==d&&(f.args=d);e.sendMessage(c,f,a.noop,function(a){k.error("message send error",a)})}var h=new k.provider(c,e),b=a.extend(this,h),p,j="Loading ad",l=0;b.init=function(){h.init();f()};b.destroy=function(){h.destroy()};b.updateModel=function(a,b){(a.tag||a.newstate||a.sequence||a.companions)&&k.log("received ad change:",a);a.tag&&(p.tag&&a.tag!==
p.tag)&&(k.error("ad messages not received in order. new model:",a,"old model:",p),f());d.utils.extend(p,a);h.updateModel(a,b)};b.getAdModel=function(){var b=a.extend({},p);if(0<p.duration){var c=p,d=c.message.replace(/xx/gi,""+Math.min(c.duration|0,Math.ceil(c.duration-c.position)));c.podMessage&&1<c.podcount&&(d=c.podMessage.replace(/__AD_POD_CURRENT__/g,""+c.sequence).replace(/__AD_POD_LENGTH__/g,""+c.podcount)+d);b.message=d}else b.message=j;return b};b.resetAdModel=function(){f()};b.skipAd=function(a){g("skipAd",
{tag:a.tag})};b.clickAd=function(a){l=(new Date).getTime();g("clickAd",{tag:a.tag})};b.timeSinceClick=function(){return(new Date).getTime()-l}}})(window.jwplayer);
(function(d){var k=d.cast,a=d.utils,c=d.events,e=d._,f=c.state;k.provider=function(d){function h(a){j.oldstate=j.newstate;j.newstate=a;b.sendEvent(c.JWPLAYER_PLAYER_STATE,{oldstate:j.oldstate,newstate:j.newstate})}var b=a.extend(this,new c.eventdispatcher("cast.provider")),p=-1,j={newstate:f.IDLE,oldstate:f.IDLE,buffer:0,position:0,duration:-1,audioMode:!1},l=document.createElement("div");l.className="jwcast-screen";l.onclick=function(){b.sendEvent(c.JWPLAYER_PROVIDER_CLICK)};b.isCaster=!0;b.init=
function(){};b.destroy=function(){clearTimeout(p);_castSession=null};b.updateModel=function(a,d){a.newstate&&(j.newstate=a.newstate,j.oldstate=a.oldstate||j.oldstate,b.sendEvent(c.JWPLAYER_PLAYER_STATE,{oldstate:j.oldstate,newstate:j.newstate}));if("ad"!==d){if(void 0!==a.position||void 0!==a.duration)void 0!==a.position&&(j.position=a.position),void 0!==a.duration&&(j.duration=a.duration),b.sendEvent(c.JWPLAYER_MEDIA_TIME,{position:j.position,duration:j.duration});void 0!==a.buffer&&(j.buffer=a.buffer,
b.sendEvent(c.JWPLAYER_MEDIA_BUFFER,{bufferPercent:j.buffer}))}};b.supportsFullscreen=function(){return!1};b.setup=function(a,b){b.state&&(j.newstate=b.state);void 0!==b.buffer&&(j.buffer=b.buffer);void 0!==a.position&&(j.position=a.position);void 0!==a.duration&&(j.duration=a.duration);h(f.BUFFERING);d("setup",a)};b.playlistItem=function(a){h(f.BUFFERING);d("item",a)};b.load=function(a){h(f.BUFFERING);d("load",a)};b.stop=function(){clearTimeout(p);p=setTimeout(function(){h(f.IDLE);d("stop")},0)};
b.play=function(){d("play")};b.pause=function(){h(f.PAUSED);d("pause")};b.seek=function(a){h(f.BUFFERING);b.sendEvent(c.JWPLAYER_MEDIA_SEEK,{position:j.position,offset:a});d("seek",a)};b.audioMode=function(){return j.audioMode};b.sendCommand=function(a,b){d(a,b)};b.detachMedia=function(){k.error("detachMedia called while casting");return document.createElement("video")};b.attachMedia=function(){k.error("attachMedia called while casting")};var r;b.setContainer=function(a){a.appendChild(l);r=a};b.getContainer=
function(){return r};b.remove=function(){r.removeChild(l)};b.volume=b.mute=b.setControls=b.setCurrentQuality=b.resize=b.seekDrag=b.addCaptions=b.resetCaptions=b.setVisibility=b.fsCaptions=a.noop;b.setFullScreen=b.getFullScreen=b.checkComplete=e.constant(!1);b.getWidth=b.getHeight=b.getCurrentQuality=e.constant(0);b.getQualityLevels=e.constant(["Auto"])};a.css(".jwplayer .jwcast-screen",{width:"100%",height:"100%"})})(window.jwplayer);;
/*!
* Layout Engine v0.8.1
*
* Adds the rendering engine and browser names as a class on the html tag and returns a JavaScript object containing the vendor, version and browser name (where appropriate)
*
* Possible vendors: '.vendor-' + 'ie', 'khtml', 'mozilla', 'opera', 'webkit'
* '.vendor-ie' also adds the version: 'vendor-' + 'ie-11', 'ie-10', 'ie-9', 'ie-8', 'ie-7'
* '.vendor-opera-mini' is also detected
*
* Possible browsers: '.browser-' + 'android', 'chrome', 'wiiu'
*
* Copyright (c) 2013 Matt Stow
*
* http://mattstow.com
*
* Licensed under the MIT license
*/
;var layoutEngine=(function(){var j=document.documentElement,c=j.style,l=" vendor-",b="ie",f="khtml",m="mozilla",g="opera",k="webkit",i=" browser-",e="android",h="chrome",d="wiiu",n=l;if("WebkitAppearance" in c){n+=k;var a=navigator.userAgent;if(a.indexOf("Android")>=0&&a.indexOf("Chrome")===-1){j.className+=n+i+e;return{vendor:k,browser:e}}else{if(!!window.chrome||a.indexOf("OPR")>=0){j.className+=n+i+h;return{vendor:k,browser:h}}else{if(!!window.wiiu){j.className+=n+i+d;return{vendor:k,browser:d}}else{j.className+=n;return{vendor:k}}}}}else{if("MozAppearance" in c){j.className+=n+m;return{vendor:m}}else{if("-ms-scroll-limit" in c||"behavior" in c){n+=b+l+b;if("-ms-ime-align" in c){j.className+=n+"-11";return{vendor:b,version:11}}else{if("-ms-user-select" in c){j.className+=n+"-10";return{vendor:b,version:10}}else{if("fill" in c){j.className+=n+"-9";return{vendor:b,version:9}}else{if("widows" in c){j.className+=n+"-8";return{vendor:b,version:8}}else{j.className+=n+"-7";return{vendor:b,version:7}}}}}}else{if("OLink" in c||!!window.opera){n+=g;if("OMiniFold" in c){j.className+=n+"-mini";return{vendor:g,version:"mini"}}else{j.className+=n;return{vendor:g}}}else{if("KhtmlUserInput" in c){j.className+=n+f;return{vendor:f}}else{return false}}}}}})();;
jQuery.fn.isOnScreen=function(e,t){if(e==null||typeof e=="undefined"){e=1}if(t==null||typeof t=="undefined"){t=1}var n=jQuery(window);var r={top:n.scrollTop(),left:n.scrollLeft()};r.right=r.left+n.width();r.bottom=r.top+n.height();var i=this.outerHeight();var s=this.outerWidth();if(!s||!i){return false}var o=this.offset();o.right=o.left+s;o.bottom=o.top+i;var u=!(r.right<o.left||r.left>o.right||r.bottom<o.top||r.top>o.bottom);if(!u){return false}var a={top:Math.min(1,(o.bottom-r.top)/i),bottom:Math.min(1,(r.bottom-o.top)/i),left:Math.min(1,(o.right-r.left)/s),right:Math.min(1,(r.right-o.left)/s)};return a.left*a.right>=e&&a.top*a.bottom>=t};
/*! iFrame Resizer (iframeSizer.min.js ) - v3.5.3 - 2016-02-23
 *  Desc: Force cross domain iframes to size to content.
 *  Requires: iframeResizer.contentWindow.min.js to be loaded into the target frame.
 *  Copyright: (c) 2016 David J. Bradshaw - dave@bradshaw.net
 *  License: MIT
 */

!function(a){"use strict";function b(b,c,d){"addEventListener"in a?b.addEventListener(c,d,!1):"attachEvent"in a&&b.attachEvent("on"+c,d)}function c(b,c,d){"removeEventListener"in a?b.removeEventListener(c,d,!1):"detachEvent"in a&&b.detachEvent("on"+c,d)}function d(){var b,c=["moz","webkit","o","ms"];for(b=0;b<c.length&&!N;b+=1)N=a[c[b]+"RequestAnimationFrame"];N||h("setup","RequestAnimationFrame not supported")}function e(b){var c="Host page: "+b;return a.top!==a.self&&(c=a.parentIFrame&&a.parentIFrame.getId?a.parentIFrame.getId()+": "+b:"Nested host page: "+b),c}function f(a){return K+"["+e(a)+"]"}function g(a){return P[a]?P[a].log:G}function h(a,b){k("log",a,b,g(a))}function i(a,b){k("info",a,b,g(a))}function j(a,b){k("warn",a,b,!0)}function k(b,c,d,e){!0===e&&"object"==typeof a.console&&console[b](f(c),d)}function l(d){function e(){function a(){s(V),p(W)}g("Height"),g("Width"),t(a,V,"init")}function f(){var a=U.substr(L).split(":");return{iframe:P[a[0]].iframe,id:a[0],height:a[1],width:a[2],type:a[3]}}function g(a){var b=Number(P[W]["max"+a]),c=Number(P[W]["min"+a]),d=a.toLowerCase(),e=Number(V[d]);h(W,"Checking "+d+" is in range "+c+"-"+b),c>e&&(e=c,h(W,"Set "+d+" to min value")),e>b&&(e=b,h(W,"Set "+d+" to max value")),V[d]=""+e}function k(){function a(){function a(){var a=0,d=!1;for(h(W,"Checking connection is from allowed list of origins: "+c);a<c.length;a++)if(c[a]===b){d=!0;break}return d}function d(){var a=P[W].remoteHost;return h(W,"Checking connection is from: "+a),b===a}return c.constructor===Array?a():d()}var b=d.origin,c=P[W].checkOrigin;if(c&&""+b!="null"&&!a())throw new Error("Unexpected message received from: "+b+" for "+V.iframe.id+". Message was: "+d.data+". This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.");return!0}function l(){return K===(""+U).substr(0,L)&&U.substr(L).split(":")[0]in P}function w(){var a=V.type in{"true":1,"false":1,undefined:1};return a&&h(W,"Ignoring init message from meta parent page"),a}function y(a){return U.substr(U.indexOf(":")+J+a)}function z(a){h(W,"MessageCallback passed: {iframe: "+V.iframe.id+", message: "+a+"}"),N("messageCallback",{iframe:V.iframe,message:JSON.parse(a)}),h(W,"--")}function A(){var b=document.body.getBoundingClientRect(),c=V.iframe.getBoundingClientRect();return JSON.stringify({iframeHeight:c.height,iframeWidth:c.width,clientHeight:Math.max(document.documentElement.clientHeight,a.innerHeight||0),clientWidth:Math.max(document.documentElement.clientWidth,a.innerWidth||0),offsetTop:parseInt(c.top-b.top,10),offsetLeft:parseInt(c.left-b.left,10),scrollTop:a.pageYOffset,scrollLeft:a.pageXOffset})}function B(a,b){function c(){u("Send Page Info","pageInfo:"+A(),a,b)}x(c,32)}function C(){function d(b,c){function d(){P[g]?B(P[g].iframe,g):e()}["scroll","resize"].forEach(function(e){h(g,b+e+" listener for sendPageInfo"),c(a,e,d)})}function e(){d("Remove ",c)}function f(){d("Add ",b)}var g=W;f(),P[g].stopPageInfo=e}function D(){P[W]&&P[W].stopPageInfo&&(P[W].stopPageInfo(),delete P[W].stopPageInfo)}function E(){var a=!0;return null===V.iframe&&(j(W,"IFrame ("+V.id+") not found"),a=!1),a}function F(a){var b=a.getBoundingClientRect();return o(W),{x:Math.floor(Number(b.left)+Number(M.x)),y:Math.floor(Number(b.top)+Number(M.y))}}function G(b){function c(){M=g,H(),h(W,"--")}function d(){return{x:Number(V.width)+f.x,y:Number(V.height)+f.y}}function e(){a.parentIFrame?a.parentIFrame["scrollTo"+(b?"Offset":"")](g.x,g.y):j(W,"Unable to scroll to requested position, window.parentIFrame not found")}var f=b?F(V.iframe):{x:0,y:0},g=d();h(W,"Reposition requested from iFrame (offset x:"+f.x+" y:"+f.y+")"),a.top!==a.self?e():c()}function H(){!1!==N("scrollCallback",M)?p(W):q()}function I(b){function c(){var a=F(g);h(W,"Moving to in page link (#"+e+") at x: "+a.x+" y: "+a.y),M={x:a.x,y:a.y},H(),h(W,"--")}function d(){a.parentIFrame?a.parentIFrame.moveToAnchor(e):h(W,"In page link #"+e+" not found and window.parentIFrame not found")}var e=b.split("#")[1]||"",f=decodeURIComponent(e),g=document.getElementById(f)||document.getElementsByName(f)[0];g?c():a.top!==a.self?d():h(W,"In page link #"+e+" not found")}function N(a,b){return m(W,a,b)}function O(){switch(P[W].firstRun&&T(),V.type){case"close":n(V.iframe);break;case"message":z(y(6));break;case"scrollTo":G(!1);break;case"scrollToOffset":G(!0);break;case"pageInfo":B(P[W].iframe,W),C();break;case"pageInfoStop":D();break;case"inPageLink":I(y(9));break;case"reset":r(V);break;case"init":e(),N("initCallback",V.iframe),N("resizedCallback",V);break;default:e(),N("resizedCallback",V)}}function Q(a){var b=!0;return P[a]||(b=!1,j(V.type+" No settings for "+a+". Message was: "+U)),b}function S(){for(var a in P)u("iFrame requested init",v(a),document.getElementById(a),a)}function T(){P[W].firstRun=!1}var U=d.data,V={},W=null;"[iFrameResizerChild]Ready"===U?S():l()?(V=f(),W=R=V.id,!w()&&Q(W)&&(h(W,"Received: "+U),E()&&k()&&O())):i(W,"Ignored: "+U)}function m(a,b,c){var d=null,e=null;if(P[a]){if(d=P[a][b],"function"!=typeof d)throw new TypeError(b+" on iFrame["+a+"] is not a function");e=d(c)}return e}function n(a){var b=a.id;h(b,"Removing iFrame: "+b),a.parentNode.removeChild(a),m(b,"closedCallback",b),h(b,"--"),delete P[b]}function o(b){null===M&&(M={x:void 0!==a.pageXOffset?a.pageXOffset:document.documentElement.scrollLeft,y:void 0!==a.pageYOffset?a.pageYOffset:document.documentElement.scrollTop},h(b,"Get page position: "+M.x+","+M.y))}function p(b){null!==M&&(a.scrollTo(M.x,M.y),h(b,"Set page position: "+M.x+","+M.y),q())}function q(){M=null}function r(a){function b(){s(a),u("reset","reset",a.iframe,a.id)}h(a.id,"Size reset requested by "+("init"===a.type?"host page":"iFrame")),o(a.id),t(b,a,"reset")}function s(a){function b(b){a.iframe.style[b]=a[b]+"px",h(a.id,"IFrame ("+e+") "+b+" set to "+a[b]+"px")}function c(b){H||"0"!==a[b]||(H=!0,h(e,"Hidden iFrame detected, creating visibility listener"),y())}function d(a){b(a),c(a)}var e=a.iframe.id;P[e]&&(P[e].sizeHeight&&d("height"),P[e].sizeWidth&&d("width"))}function t(a,b,c){c!==b.type&&N?(h(b.id,"Requesting animation frame"),N(a)):a()}function u(a,b,c,d){function e(){var e=P[d].targetOrigin;h(d,"["+a+"] Sending msg to iframe["+d+"] ("+b+") targetOrigin: "+e),c.contentWindow.postMessage(K+b,e)}function f(){i(d,"["+a+"] IFrame("+d+") not found"),P[d]&&delete P[d]}function g(){c&&"contentWindow"in c&&null!==c.contentWindow?e():f()}d=d||c.id,P[d]&&g()}function v(a){return a+":"+P[a].bodyMarginV1+":"+P[a].sizeWidth+":"+P[a].log+":"+P[a].interval+":"+P[a].enablePublicMethods+":"+P[a].autoResize+":"+P[a].bodyMargin+":"+P[a].heightCalculationMethod+":"+P[a].bodyBackground+":"+P[a].bodyPadding+":"+P[a].tolerance+":"+P[a].inPageLinks+":"+P[a].resizeFrom+":"+P[a].widthCalculationMethod}function w(a,c){function d(){function b(b){1/0!==P[w][b]&&0!==P[w][b]&&(a.style[b]=P[w][b]+"px",h(w,"Set "+b+" = "+P[w][b]+"px"))}function c(a){if(P[w]["min"+a]>P[w]["max"+a])throw new Error("Value for min"+a+" can not be greater than max"+a)}c("Height"),c("Width"),b("maxHeight"),b("minHeight"),b("maxWidth"),b("minWidth")}function e(){var a=c&&c.id||S.id+F++;return null!==document.getElementById(a)&&(a+=F++),a}function f(b){return R=b,""===b&&(a.id=b=e(),G=(c||{}).log,R=b,h(b,"Added missing iframe ID: "+b+" ("+a.src+")")),b}function g(){h(w,"IFrame scrolling "+(P[w].scrolling?"enabled":"disabled")+" for "+w),a.style.overflow=!1===P[w].scrolling?"hidden":"auto",a.scrolling=!1===P[w].scrolling?"no":"yes"}function i(){("number"==typeof P[w].bodyMargin||"0"===P[w].bodyMargin)&&(P[w].bodyMarginV1=P[w].bodyMargin,P[w].bodyMargin=""+P[w].bodyMargin+"px")}function k(){var b=P[w].firstRun,c=P[w].heightCalculationMethod in O;!b&&c&&r({iframe:a,height:0,width:0,type:"init"})}function l(){Function.prototype.bind&&(P[w].iframe.iFrameResizer={close:n.bind(null,P[w].iframe),resize:u.bind(null,"Window resize","resize",P[w].iframe),moveToAnchor:function(a){u("Move to anchor","inPageLink:"+a,P[w].iframe,w)},sendMessage:function(a){a=JSON.stringify(a),u("Send Message","message:"+a,P[w].iframe,w)}})}function m(c){function d(){u("iFrame.onload",c,a),k()}b(a,"load",d),u("init",c,a)}function o(a){if("object"!=typeof a)throw new TypeError("Options is not an object")}function p(a){for(var b in S)S.hasOwnProperty(b)&&(P[w][b]=a.hasOwnProperty(b)?a[b]:S[b])}function q(a){return""===a||"file://"===a?"*":a}function s(b){b=b||{},P[w]={firstRun:!0,iframe:a,remoteHost:a.src.split("/").slice(0,3).join("/")},o(b),p(b),P[w].targetOrigin=!0===P[w].checkOrigin?q(P[w].remoteHost):"*"}function t(){return w in P&&"iFrameResizer"in a}var w=f(a.id);t()?j(w,"Ignored iFrame, already setup."):(s(c),g(),d(),i(),m(v(w)),l())}function x(a,b){null===Q&&(Q=setTimeout(function(){Q=null,a()},b))}function y(){function b(){function a(a){function b(b){return"0px"===P[a].iframe.style[b]}function c(a){return null!==a.offsetParent}c(P[a].iframe)&&(b("height")||b("width"))&&u("Visibility change","resize",P[a].iframe,a)}for(var b in P)a(b)}function c(a){h("window","Mutation observed: "+a[0].target+" "+a[0].type),x(b,16)}function d(){var a=document.querySelector("body"),b={attributes:!0,attributeOldValue:!1,characterData:!0,characterDataOldValue:!1,childList:!0,subtree:!0},d=new e(c);d.observe(a,b)}var e=a.MutationObserver||a.WebKitMutationObserver;e&&d()}function z(a){function b(){B("Window "+a,"resize")}h("window","Trigger event: "+a),x(b,16)}function A(){function a(){B("Tab Visable","resize")}"hidden"!==document.visibilityState&&(h("document","Trigger event: Visiblity change"),x(a,16))}function B(a,b){function c(a){return"parent"===P[a].resizeFrom&&P[a].autoResize&&!P[a].firstRun}for(var d in P)c(d)&&u(a,b,document.getElementById(d),d)}function C(){b(a,"message",l),b(a,"resize",function(){z("resize")}),b(document,"visibilitychange",A),b(document,"-webkit-visibilitychange",A),b(a,"focusin",function(){z("focus")}),b(a,"focus",function(){z("focus")})}function D(){function a(a,c){function d(){if(!c.tagName)throw new TypeError("Object is not a valid DOM element");if("IFRAME"!==c.tagName.toUpperCase())throw new TypeError("Expected <IFRAME> tag, found <"+c.tagName+">")}c&&(d(),w(c,a),b.push(c))}var b;return d(),C(),function(c,d){switch(b=[],typeof d){case"undefined":case"string":Array.prototype.forEach.call(document.querySelectorAll(d||"iframe"),a.bind(void 0,c));break;case"object":a(c,d);break;default:throw new TypeError("Unexpected data type ("+typeof d+")")}return b}}function E(a){a.fn.iFrameResize=function(a){return this.filter("iframe").each(function(b,c){w(c,a)}).end()}}var F=0,G=!1,H=!1,I="message",J=I.length,K="[iFrameSizer]",L=K.length,M=null,N=a.requestAnimationFrame,O={max:1,scroll:1,bodyScroll:1,documentElementScroll:1},P={},Q=null,R="Host Page",S={autoResize:!0,bodyBackground:null,bodyMargin:null,bodyMarginV1:8,bodyPadding:null,checkOrigin:!0,inPageLinks:!1,enablePublicMethods:!0,heightCalculationMethod:"bodyOffset",id:"iFrameResizer",interval:32,log:!1,maxHeight:1/0,maxWidth:1/0,minHeight:0,minWidth:0,resizeFrom:"parent",scrolling:!1,sizeHeight:!0,sizeWidth:!1,tolerance:0,widthCalculationMethod:"scroll",closedCallback:function(){},initCallback:function(){},messageCallback:function(){j("MessageCallback function not defined")},resizedCallback:function(){},scrollCallback:function(){return!0}};a.jQuery&&E(jQuery),"function"==typeof define&&define.amd?define([],D):"object"==typeof module&&"object"==typeof module.exports?module.exports=D():a.iFrameResize=a.iFrameResize||D()}(window||{});
//# sourceMappingURL=iframeResizer.map;
/*! npm.im/object-fit-images 3.2.4 */
var objectFitImages = (function () {
'use strict';

var OFI = 'bfred-it:object-fit-images';
var propRegex = /(object-fit|object-position)\s*:\s*([-.\w\s%]+)/g;
var testImg = typeof Image === 'undefined' ? {style: {'object-position': 1}} : new Image();
var supportsObjectFit = 'object-fit' in testImg.style;
var supportsObjectPosition = 'object-position' in testImg.style;
var supportsOFI = 'background-size' in testImg.style;
var supportsCurrentSrc = typeof testImg.currentSrc === 'string';
var nativeGetAttribute = testImg.getAttribute;
var nativeSetAttribute = testImg.setAttribute;
var autoModeEnabled = false;

function createPlaceholder(w, h) {
	return ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3C/svg%3E");
}

function polyfillCurrentSrc(el) {
	if (el.srcset && !supportsCurrentSrc && window.picturefill) {
		var pf = window.picturefill._;
		// parse srcset with picturefill where currentSrc isn't available
		if (!el[pf.ns] || !el[pf.ns].evaled) {
			// force synchronous srcset parsing
			pf.fillImg(el, {reselect: true});
		}

		if (!el[pf.ns].curSrc) {
			// force picturefill to parse srcset
			el[pf.ns].supported = false;
			pf.fillImg(el, {reselect: true});
		}

		// retrieve parsed currentSrc, if any
		el.currentSrc = el[pf.ns].curSrc || el.src;
	}
}

function getStyle(el) {
	var style = getComputedStyle(el).fontFamily;
	var parsed;
	var props = {};
	while ((parsed = propRegex.exec(style)) !== null) {
		props[parsed[1]] = parsed[2];
	}
	return props;
}

function setPlaceholder(img, width, height) {
	// Default: fill width, no height
	var placeholder = createPlaceholder(width || 1, height || 0);

	// Only set placeholder if it's different
	if (nativeGetAttribute.call(img, 'src') !== placeholder) {
		nativeSetAttribute.call(img, 'src', placeholder);
	}
}

function onImageReady(img, callback) {
	// naturalWidth is only available when the image headers are loaded,
	// this loop will poll it every 100ms.
	if (img.naturalWidth) {
		callback(img);
	} else {
		setTimeout(onImageReady, 100, img, callback);
	}
}

function fixOne(el) {
	var style = getStyle(el);
	var ofi = el[OFI];
	style['object-fit'] = style['object-fit'] || 'fill'; // default value

	// Avoid running where unnecessary, unless OFI had already done its deed
	if (!ofi.img) {
		// fill is the default behavior so no action is necessary
		if (style['object-fit'] === 'fill') {
			return;
		}

		// Where object-fit is supported and object-position isn't (Safari < 10)
		if (
			!ofi.skipTest && // unless user wants to apply regardless of browser support
			supportsObjectFit && // if browser already supports object-fit
			!style['object-position'] // unless object-position is used
		) {
			return;
		}
	}

	// keep a clone in memory while resetting the original to a blank
	if (!ofi.img) {
		ofi.img = new Image(el.width, el.height);
		ofi.img.srcset = nativeGetAttribute.call(el, "data-ofi-srcset") || el.srcset;
		ofi.img.src = nativeGetAttribute.call(el, "data-ofi-src") || el.src;

		// preserve for any future cloneNode calls
		// https://github.com/bfred-it/object-fit-images/issues/53
		nativeSetAttribute.call(el, "data-ofi-src", el.src);
		if (el.srcset) {
			nativeSetAttribute.call(el, "data-ofi-srcset", el.srcset);
		}

		setPlaceholder(el, el.naturalWidth || el.width, el.naturalHeight || el.height);

		// remove srcset because it overrides src
		if (el.srcset) {
			el.srcset = '';
		}
		try {
			keepSrcUsable(el);
		} catch (err) {
			if (window.console) {
				console.warn('https://bit.ly/ofi-old-browser');
			}
		}
	}

	polyfillCurrentSrc(ofi.img);

	el.style.backgroundImage = "url(\"" + ((ofi.img.currentSrc || ofi.img.src).replace(/"/g, '\\"')) + "\")";
	el.style.backgroundPosition = style['object-position'] || 'center';
	el.style.backgroundRepeat = 'no-repeat';
	el.style.backgroundOrigin = 'content-box';

	if (/scale-down/.test(style['object-fit'])) {
		onImageReady(ofi.img, function () {
			if (ofi.img.naturalWidth > el.width || ofi.img.naturalHeight > el.height) {
				el.style.backgroundSize = 'contain';
			} else {
				el.style.backgroundSize = 'auto';
			}
		});
	} else {
		el.style.backgroundSize = style['object-fit'].replace('none', 'auto').replace('fill', '100% 100%');
	}

	onImageReady(ofi.img, function (img) {
		setPlaceholder(el, img.naturalWidth, img.naturalHeight);
	});
}

function keepSrcUsable(el) {
	var descriptors = {
		get: function get(prop) {
			return el[OFI].img[prop ? prop : 'src'];
		},
		set: function set(value, prop) {
			el[OFI].img[prop ? prop : 'src'] = value;
			nativeSetAttribute.call(el, ("data-ofi-" + prop), value); // preserve for any future cloneNode
			fixOne(el);
			return value;
		}
	};
	Object.defineProperty(el, 'src', descriptors);
	Object.defineProperty(el, 'currentSrc', {
		get: function () { return descriptors.get('currentSrc'); }
	});
	Object.defineProperty(el, 'srcset', {
		get: function () { return descriptors.get('srcset'); },
		set: function (ss) { return descriptors.set(ss, 'srcset'); }
	});
}

function hijackAttributes() {
	function getOfiImageMaybe(el, name) {
		return el[OFI] && el[OFI].img && (name === 'src' || name === 'srcset') ? el[OFI].img : el;
	}
	if (!supportsObjectPosition) {
		HTMLImageElement.prototype.getAttribute = function (name) {
			return nativeGetAttribute.call(getOfiImageMaybe(this, name), name);
		};

		HTMLImageElement.prototype.setAttribute = function (name, value) {
			return nativeSetAttribute.call(getOfiImageMaybe(this, name), name, String(value));
		};
	}
}

function fix(imgs, opts) {
	var startAutoMode = !autoModeEnabled && !imgs;
	opts = opts || {};
	imgs = imgs || 'img';

	if ((supportsObjectPosition && !opts.skipTest) || !supportsOFI) {
		return false;
	}

	// use imgs as a selector or just select all images
	if (imgs === 'img') {
		imgs = document.getElementsByTagName('img');
	} else if (typeof imgs === 'string') {
		imgs = document.querySelectorAll(imgs);
	} else if (!('length' in imgs)) {
		imgs = [imgs];
	}

	// apply fix to all
	for (var i = 0; i < imgs.length; i++) {
		imgs[i][OFI] = imgs[i][OFI] || {
			skipTest: opts.skipTest
		};
		fixOne(imgs[i]);
	}

	if (startAutoMode) {
		document.body.addEventListener('load', function (e) {
			if (e.target.tagName === 'IMG') {
				fix(e.target, {
					skipTest: opts.skipTest
				});
			}
		}, true);
		autoModeEnabled = true;
		imgs = 'img'; // reset to a generic selector for watchMQ
	}

	// if requested, watch media queries for object-fit change
	if (opts.watchMQ) {
		window.addEventListener('resize', fix.bind(null, imgs, {
			skipTest: opts.skipTest
		}));
	}
}

fix.supportsObjectFit = supportsObjectFit;
fix.supportsObjectPosition = supportsObjectPosition;

hijackAttributes();

return fix;

}());
;
jQuery(document).ready(function ($) {

// Send event to google analytics
function send_ga_events(data_category,data_action,data_label){
    if(typeof ga !== 'undefined'){
        //console.log(data_category+' '+data_action+' '+data_label);
        ga('send', 'event', data_category, data_action, data_label);
    }
    else{
        //console.log('Tracking disabled in browser settings');
    }
}



var app2 = new Object;
app2.tracking = {
    init : function() {

        // GENERAL TRACKING THROUGH DATA-ATTRIBUTES ON LINKS
        $('a[data-ga-track="event"]').on('click', function(e) {
            var data_category = $(this).attr('data-ga-category');
            var data_action = $(this).attr('data-ga-action');
            var data_label = $(this).attr('data-ga-opt_label');
                // add page title in label, use swiftype page title
                page_title = $('meta[property="st:title"]').attr("content");
                data_label = data_label + ' / ' + page_title;
            send_ga_events(data_category,data_action,data_label );
        }); 

        // B1 - HEADER / Main navigation & Search toggle
        $('header.main a,#search-icon').on('click', function(e) {
            var data_category = 'Main navigation';
            var data_action = 'Click';
            var data_label = $(this).html();
            send_ga_events(data_category,data_action,data_label);
        }); 
    

        // B2 - FOOTER / SOCIAL MEDIA
        $('footer .social-media-menu a').on('click', function(e) {
            var data_label = $(this).html();
            send_ga_events('Social link','Click','Footer / '+data_label);
        }); 
        // Footer / Secondary menu
        $('footer .secondary-menu a').on('click', function(e) {
            var data_label = $(this).html();
            send_ga_events('Navigation','Click','Footer / '+data_label);
        }); 

        // B3 FEATURED CONTENT
        if ($('.front-page').length > 0) {
            // Slider links
             $('.flexslider a.button').on('click', function(e) {
                var title = $(this).text();
                send_ga_events('Featured content','Click','Slider / '+title);
             });            
            // Large featured content
            $('.featured-content.large-custom, .featured-content.large-standard, .featured-content.large-img ').on('click', function(e) {  
                var data_label = $(this).text();
                send_ga_events('Featured content','Click',data_label);
            });
            // Support links featured
             $('.featured-content.support-all .button').on('click', function(e) {
                var title = $(this).find('span:first-child').text();
                send_ga_events('Featured content','Click',title );
             });
        }
        // B3, B8 FEATURED POSITIONS / Main & Careers
        if ($('.page#page-careers,.front-page').length > 0) {
            $('.pane-featured-jobs .item[data-loc],.featured-content[data-loc] .container').on('click', function(e) {  
                var title = $(this).find('a').html();
                var secondary = $(this).find('.secondary-title').html();
                var location = $(this).find('.location').html();
                var data_label = title + ', ' + secondary + ', ' + location;
                send_ga_events('Featured position','Click',data_label);
            });
        }

        // CAREERS
        if ($('.page#page-careers').length > 0) {
            // B11 - JOB CATEGORIES selected
            $('ul.job-functions.tabbed li a').on('click', function(e){
                var title = $(this).html();
                send_ga_events('In-page navigation','Select','Job category: '+title);
            });

            // B12 APPLY LINKS clicked per category
            $('ul.job-positions li a').on('click', function(e){          
                var title = $(this).parents('.views-row').find('.views-field-title strong').html();
                var secondary = $(this).parents('.views-row').find('.views-field-secondary-title').html();
                var location = $(this).parents('.views-row').find('.views-field-field-location .field-content').html();
                var data_label = title + secondary + ', ' + location;
                var data_category = $('.job-functions.tabbed .active a').html();
                send_ga_events('Position applied / '+data_category,'Apply',data_label);
               
            });

        }
    }
}


$.fn.app2 = function(scope, method) {
    if (app2[scope][method]) {
        return app2[scope][method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
        return app2[scope].init.apply( this, arguments );
    } else {
        return false;
    }
};




$('body').app2('tracking');
});;
/*
 *
 *
 * SUPERCELL.COM
 *
 *
 */

var app = new Object;
app.debug = true;
app.is_mobile = false;
app.is_not_ipad = false;
app.players = {};
app.hash = '';
app.scrolled = false;
app.job_locations = [
  "helsinki-finland",
  "san-francisco-ca",
  "seoul-korea",
  "tokyo-japan",
  "finland-helsinki",
  "korea-republic-of",
  "korea-seoul",
  "japan-tokyo",
  "united-states-san-francisco"
];
// app.job_skip_cat = [];

// Ensure we never run with debugging on prod
if(window.location.hostname.indexOf("supercell.com") > -1) {
  app.debug = false;
} else {
  console.log("Location checked. Not on prod.")
}

if(app.debug) {
  console.log("%cDEBUGGING:ON", "background-color:#000; color:#f00; padding:10px 30px; border-radius:35px; font-weight:bold; font-size:32px;")
}

var skr = undefined;
var animateNums = false;

(function($, Drupal, undefined){

  jwplayer.key = "c65V3VVLDU4R729NbfMeJ3/LEU8WA2S3IdvsF9G91gk=";

  $('.hero-title .field, .hero-title h4, .hero-title h5, .hero-title img').addClass('visible');
  $('.hero-title .cross-slider, .hero-title, #main-content').addClass('visible');

  app.start = {
    init : function() {

      app.can_matchmedia = false;
      if (typeof window.matchMedia !== undefined && typeof window.matchMedia !== 'undefined') {
        app.can_matchmedia = true;
      }

      var $delay = 500;
      app.ui.check_is_mobile();
      if (app.is_mobile) {
        $delay = 1000;
      }

      app.resized = setTimeout(app.ui.check_dp, $delay);

      app.ui.init();
      app.nav.init();
      app.player.init();
      app.search.init();

      if ($('.page.front-page').length > 0) {
        app.frontpage.init();
      }
      if ($('body.section-games').length > 0) {
        app.games.init();
      }
      if ($('#page-careers').length > 0) {
        app.careers.init();
      }
      if($('#page-careersoffices').length > 0) {
        app.careersoffices.init();
      }
      if($('#page-careersloveit').length > 0) {
        app.careersloveit.init();
      }
      if ($('#page-careersjoin').length > 0) {
        app.careersjoin.init();
      }
      if ($('body.section-careers').length > 0) {
        app.job.init();
      }
      if($('#page-ourstory').length > 0) {
        app.story.init();
      }

      if ($('body.section-parents').length > 0) {
        $("a[href*=\\#]:not([href=\\#])").click(function() {
          if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') || location.hostname == this.hostname) {

            var target = $(this.hash),
              headerHeight = $("header").height() + 5; // Get fixed header height

            target = target.length ? target : $('[name=' + this.hash.slice(1) +']');

            if (target.length) {
              $('html,body').animate({
                scrollTop: target.offset().top - headerHeight*1.4
              }, 400);
              return false;
            }
          }
        });
      }

      $.doTimeout(3000, function() {
        $(window).on('resize orientationChanged', function(){
          clearTimeout(app.resized);
          app.resized = setTimeout(app.ui.check_dp, $delay);
        });
      });
    }
  };

  app.ui = {
    init : function() {

      // initiating sliders
      $('.flexslider').each(function() {
        var $anim = 'slide';
        var $anim_loop = false;
        var $anim_speed = 350;
        var $slideshow = false;
        var $pause_hover = false;
        var $selector = '.slides > li';
        var $randomize = false;

        if (app.is_mobile) {
          $anim_speed = 250;
        }

        if ($(this).hasClass('carousel')) {

          $slideshow = true;

          // no autoslide if video found
          if ($(this).find('video').length > 0) {
            $slideshow = false;
          }

          $anim_loop = true;
          $anim_speed = 800;
          $pause_hover = true;
          $anim = 'fade';
        }
        if ($(this).hasClass('slideshow')) {
          $slideshow = true;
          $anim_loop = true;
          $anim_speed = 800;
          $pause_hover = true;
          $anim = 'fade';
        }
        if ($(this).hasClass('two-to-one') || $(this).hasClass('three-to-one') || $(this).hasClass('four-to-one')) {
          if (app.can_matchmedia) {
            var $mq = window.matchMedia("screen and (max-width: 767px)");
            if ($mq.matches) {
              $selector = ".slides .item";
            }
          }
        }
        if($(this).hasClass('random-order')) {
          $randomize = false;
          $(this).randomize(".slides li div.links", "div.item");
        }
        $(this).flexslider({
          animation: $anim,
          animationLoop: $anim_loop,
          slideshow: $slideshow,
          animationSpeed: $anim_speed,
          pauseOnHover: $pause_hover,
          selector: $selector,
          useCSS: false,
          randomize: $randomize,

          start: function(slider){
            var event = new CustomEvent("flexSliderReady", slider);
            window.dispatchEvent(event);
          },
          after: function(slider){
            $article = slider.closest('article');
            if ($article.hasClass('m-videos') || $article.hasClass('m-fullvideo')) {
              app.player.pause_slider_siblings($article);
            }
          }
        });
      });

      $('.flexslider').on('touchmove', function (e) {
        // e.stopPropagation();

      });

      // Work around to prevent the 300ms delay for the click event for buttons
      FastClick.attach(document.body);

      // Polyfill for object-fit
      objectFitImages();

      // toggle main navigation on mobile
      $('.toggle-mobile').on('click', function(e) {
        if (e) {
          e.preventDefault();
        }

        $(this).toggleClass('visible');
        $('.main-menu').toggleClass('visible');
        if ($(this).hasClass('visible')) {
          $('html').addClass('no-scroll');
          // open sub nav if it contains an active page
          //$('nav.primary').find('.active-trail ul').addClass('active');
        }
        else {
          $('html').removeClass('no-scroll');
          $('nav.primary').find('.active-leaf').removeClass('active-leaf');
          $('nav.primary').find('ul.active').removeClass('active');
        }
      });
      $('.main-menu .menu>ul>li>span>a, .main-menu .menu>ul>li').each(function() {
        if($(this).hasClass('expanded') && !$(this).hasClass('dotdot')){
          var child = $(this);
          if(child.length > 0) {
            child = child.clone()
            child.find('ul').remove()
            child.removeClass('expanded');
            child.find('a').removeClass('active-trail');
            child.addClass('mobile-extra-link');
            $(this).find('ul').prepend(child);
          }

        }
      });

      // play button elements hover style
      $('.play a').on('hover', function() {
        $(this).next().toggleClass('hover');
      });

      $('.m-games-landing .device').on('click', function(e) {
        e.stopPropagation();
        $link = $(this).find('a').first();
        document.location.replace($link.attr('href'));
      });

      // in-page content language selector
      if ($('#content-language').length > 0) {

        // dropdown menu for language versions
        if (app.can_matchmedia) {
          var $mq = window.matchMedia("(max-width: 1203px)");
          if ($mq.matches) {
            var $select = '<select id="select-language">';
            var $count = 0;
            var $selected_txt = '';
            var $selected_class = '';

            var $curr = window.location.pathname;

            $('#content-language ul.dd a').each (function() {
              var $selected = '';

              if ($(this).attr('href') == $curr) {
                $selected = ' selected="selected"';
              }

              $select += '<option value="' + $(this).attr('href') + '"' + $selected + '>' + $(this).text() + '</option>';

              $count++;
            });
            $select += '</select>';
            $('#content-language ul.dd').after($select);

            $('#select-language').on('change blur', function() {
              var $val = $(this).val();
              $('#content-language ul.dd a').each(function() {
                if ($(this).attr('href') == $val) {
                  window.location.href = $val;
                }
              });
            });
          }
          else {
            $('html').on('click', function(e) {

              if ($(e.target).parent().attr('id') == 'active-language' | $(e.target).attr('id') == 'active-language') {
                $('#content-language ul.dd').toggleClass('open');
              }
              else if ($(e.target).parent().hasClass('views-row')) {
                return;
              }
              else {
                $('#content-language ul.dd').removeClass('open');
              }
            });

          }
        }


        $('#content-language ul li a').each(function() {
          var $curr = window.location.pathname;

          if ($(this).attr('href') == $curr) {
            $(this).parent().addClass('active');
            $('#content-language #active-language span').html($(this).html());
          }
        });
      }

      $('a[href^=#]').click(function(e){
        if(this.hash.length > 1 && $(this.hash).length > 0) {
          e.preventDefault();
          // no scrolling for job function tabs
          if ($(this).closest('ul').hasClass('job-functions tabbed')) {
            return false;
          }
          // no scrolling for job location tabs
          if ($(this).closest('ul').hasClass('job-locations tabbed')) {
            return false;
          }
          $('html,body').animate({ scrollTop: $(this.hash).offset().top - $('header.main').outerHeight() }, 500);
        }
      });

      // reveal animations
      if (app.can_matchmedia) {
        var $mq = window.matchMedia("(min-width: 1025px)");
        if ($mq.matches) {
          $.doTimeout('reveal', 250, function() {
            app.ui.reveal();
          });
          $(window).scroll(function(){
            app.ui.reveal();
          });
        }
      }

      // animate game page intro module, if window is high enough
      if($(window).height() > 900) {
        $('.page-games .m-introduction .content').addClass('animate');
      }
    },
    check_dp : function() {
      app.ui.check_is_mobile();

      if (!app.checked_dp) {
        app.checked_dp = 1;
        app.img.hero_load();
      }
      else {
        $('html').addClass('resized');
        app.hero.resize();
      }
    },
    check_is_mobile : function() {
      app.is_mobile = true;

      if (app.can_matchmedia) {
        var $mq = window.matchMedia("(min-width: 768px)");
        if ($mq.matches) {
          app.is_mobile = false;
          $mq = window.matchMedia("(min-width: 1025px)");
          if ($mq.matches) {
            app.is_not_ipad = true;
          }
        }
        else {
          app.is_not_ipad = true;
        }
      }
    },
    handle_anchor : function() {
      // if hashtag found, scroll to content with animation
      if (window.location.hash.length > 0 && !app.scrolled ) {
        var $hash = encodeURI(window.location.hash);
        window.scrollTo(0,0);
        $hash = $hash.replace("=", "");

        if ($($hash).length > 0) {
          //$(window).load(function(){
          $('#main-content, .hero-title').addClass('transit_none');
          $('html,body').animate({ scrollTop:  $($hash).offset().top - $('header.main').outerHeight() }, 1);
          //});
        }
      }
      if (window.location.hash === '#join') {
        $('.main-menu').removeClass('visible');
        $('.toggle-mobile').removeClass('visible');
        $('.js.flexbox.touch.backgroundsize').removeClass('no-scroll');
        window.location.hash = "#all";
      }
      app.scrolled = true; // Let's not scroll on resize
    },
    init_job_categories: function () {

      $('.job-functions li, .job-locations li').each(function(index) {
        var cat = $(this).children('a').attr('id');
        var pos_in_cat = $('#join .job-positions > li.' + cat).length;
        // console.log(cat, pos_in_cat);
        if (pos_in_cat == 0) {
          $(this).addClass('disabled');
        }
        else {
          $(this).addClass('not-empty');

          var selector = $('#join .job-positions > li.' + cat)[0];
          var loc = selector.dataset.location;
          var fun = selector.dataset.function;

          if(app.careers.all_functions.indexOf(fun) === -1) {
            app.careers.all_functions.push(fun);
          }
          if(app.careers.all_locations.indexOf(loc) === -1) {
            app.careers.all_locations.push(loc);
          }
        }
        //$(this).children('a').append(' (' + count + ')');
      });

      if (app.is_mobile) {
        $('.job-functions li').not('.disabled').last().addClass('last moo');
      }

      /* add count to "show all"
      var count = $('.job-functions li').length;
      $('#join .show-all a').append(' (' + count + ')');
      */

    },
    filter_jobs: function() {
      var active_func = [];
      var active_loc = [];

      // get the selected/active categories
      $('.job-functions li.active').each(function(index) {
        active_func.push('.' + $(this).children('a').attr('id'));
      });

      // Show every job for a location if no functions have been selected
      if (active_func.length === 0) {
        $('.job-functions li:not("disabled")').each(function(index) {
          active_func.push('.' + $(this).children('a').attr('id'));
        });
      }

      $('.job-locations li.active').each(function(index) {
        active_loc.push('.' + $(this).children('a').attr('id'));
      });

      // Show every selected function for all locations
      if (active_loc.length === 0) {
        $('.job-locations li:not("disabled")').each(function(index) {
          active_loc.push('.' + $(this).children('a').attr('id'));
        });
      }

      // if(app.debug) {
      //   console.log("filter_jobs", "func", active_func, "loc", active_loc);
      // }

      // hide all jobs and start filtering from scratch
      $('#join .job-positions > li, .open-applications > li').removeClass('visible');

      // job count
      var count = 0;

      // string of classes
      var loc_str = active_loc.join(', ');
      var func_str = active_func.join(', ');

      var matches = $('#join .job-positions > li').filter(function(index) {
        return $(this).is(func_str) && $(this).is(loc_str);
      }).addClass('visible');

      // loop the functions
      // $.each(active_func, function( index, value ) {
      //     if(app.debug) {
      //       console.log(index);
      //       console.log(value);
      //     }
      //     // loop the jobs
      //     $('#join .job-positions > li' + value).each(function(index) {
      //         $(this).addClass('visible');
      //         count++;
      //     });
      // });

      // 0 results
      if($('#join .job-positions > li').is('.visible')) {
        $('#join .view-footer').removeClass('visible');
        $('#join .view-footer .notice').removeClass('visible');
      }
      else {
        $('#join .view-footer').addClass('visible');
        $('#join .view-footer .notice').addClass('visible');
      }
    },
    select_job_function: function(id, txt) {
      if ($('#select-job-function').length > 0) {
        $('#selected-job-function').attr('class', id).find('span').text(txt);
      }
    },
    // select_job_location: function(id, txt) {
    //   if ($('#select-job-location').length > 0) {
    //     $('#selected-job-location').attr('class', id).find('span').text(txt);
    //   }
    // },
    sort_job_list: function(attr) {
      $("#join .job-positions").each(function(){
        $(this).html($(this).children('li').sort(function(a, b){
          return ($(b).data(attr)) < ($(a).data(attr)) ? 1 : -1;
        }));
      });
    },
    reveal: function() {
      // Game pages
      if($('.page-games').length) {
        if($('.page-games .m-introduction .content').isOnScreen(1, 0.1)){
          $('.page-games .m-introduction .content').addClass('animate');
        }

        if($('.page-games .m-gamewebsite').isOnScreen(1, 0.2)){
          $('.page-games .m-gamewebsite .content').addClass('animate');
        }

        if($('.page-games .m-timeline').isOnScreen(1, 0.2)){
          $('.page-games .m-timeline .game-screen').addClass('animate');
        }

        if($('.page-games .m-timeline .timeline-block:first-child').isOnScreen(1, 0.75)){
          $('.page-games .m-timeline .scroll-container .timeline-block .title').addClass('animate');
        }

        $('.page-games .m-story .quote blockquote:not(.animate)').each(function(i){
          if($(this).isOnScreen(1, 0.75) && $(this).is(':visible')){
            $(this).addClass('animate');
          }
        });
      }

      // Our story
      if($('#page-ourstory').length) {

        $('.m-beginning .timeline .event:not(.animate)').each(function(){
          if($(this).isOnScreen(1,1)) {
            $(this).addClass('animate');
          }
        });
      }

      // Careers
      if($('#page-careers').length) {
        $('.m-why .deco').addClass('animate');
      }

      // Support landing page
      if($('body.section-support').length) {
        $('.m-findsupport .deco').addClass('animate');
      }
    }
  }

  app.hero = {
    init : function() {

      //app.hero.resize();

      if ($('html').hasClass('video')) {
        var timeout = 0;
        if (!app.is_mobile && app.is_not_ipad) {
          timeout = 250;
        }
        $.doTimeout(timeout, function() {
          app.players['hero-bg-video'] = $('#hero-bg-video')[0];

          if (app.players['hero-bg-video']) {

            app.players['hero-bg-video'].load();
            $('#hero-bg-video').on("canplay", function(){
              if ($('.hero-title').hasClass('feature-video')) {
                return true;
              }
              app.players['hero-bg-video'].play();
              $('.hero-title').addClass('bg-video');
            });

            app.hero_bg_pos = $('.hero-title').height();

            // pause/play background video when its visibility in viewport changes
            $(window).scroll(function() {
              if ($(window).scrollTop() > app.hero_bg_pos) {
                if (!app.players['hero-bg-video'].paused) {
                  app.players['hero-bg-video'].pause();
                }
              }
              else {
                if (app.players['hero-bg-video'].paused && !$('.hero-title').hasClass('feature-video')) {
                  app.players['hero-bg-video'].play();
                }
              }
            });
          }
        });
      }
    },
    resize : function() {
      app.ui.handle_anchor();

    },
    play_feature: function() {

      if (app.players['hero-bg-video']) {
        app.players['hero-bg-video'].pause(true);
      }

      if(!app.players['hero-video']) {
        app.player.create($('#hero-video'), true);
      }

      $('.hero-title').addClass('feature-mode');
      $('header.main').addClass('hero-feature-mode');

      $.doTimeout(1500, function() {
        // pause background video once more
        if (app.players['hero-bg-video']) {
          app.players['hero-bg-video'].pause(true);
        }
        // play already paused
        if (app.players['hero-video']) {
          app.players['hero-video'].play(true);
        }
        $('.hero-title').addClass('feature-video');
      });
    },
    play_bg: function() {

      $('.hero-title').removeClass('feature-video feature-mode');
      $('header.main').removeClass('hero-feature-mode');

      if (app.players['hero-video']) {
        app.players['hero-video'].pause(true);
        if (app.players['hero-video'].getState() == 'PLAYING') {
          $.doTimeout(500, function() {
            app.players['hero-video'].pause(true);
          });
        }
      }
      if (!app.is_mobile && app.is_not_ipad) {
        $.doTimeout(1000, function() {
          app.players['hero-bg-video'].play();
        });
      }
    },
    is_parallax_browser: function() {

      if (app.can_matchmedia) {
        $mq = window.matchMedia("(min-width: 1400px)");
        $mq2 = window.matchMedia("(min-height: 600px)");
        if($mq.matches && $mq2.matches) {
          if (layoutEngine.vendor === 'ie' && layoutEngine.version == '9') {
            return false;
          }
          else {
            return true;
          }
        }
      }

      // iOS 8 support: waiting for chrome support
      /*
      if (/iP(hone|od|ad)/.test(navigator.platform)) { // If iOS
          var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
          ver = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];

          if(ver[0] >= 8) { // If iOS 8
              return true;
          }
      }
      */

      return false;
    }
  }

  app.player = {
    init : function() {

      $('.hero-title .v-close a').on('click', function(e) {
        if (e) {
          e.preventDefault();
        }
        app.hero.play_bg();
      });
      $('#main-content .v-close a').on('click', function(e) {

        if (e) {
          e.preventDefault();
        }

        var $article = $(this).closest('article');
        $article.removeClass('active-video');

        var $id = $article.find('.jwplayer').attr('id');
        if (!$id) {
          $id = $article.find('.jwswf').attr('id');
        }

        if (app.players[$id].getState() == 'PLAYING') {
          $.doTimeout(500, function() {
            app.players[$id].pause(true);
          });
        }
        $article.find('.video').removeClass('active');
      });
      $('.play a').on('click', function(e) {
        if (e) {
          e.preventDefault();
        }

        var $id = $(this).data('id');

        /*
         *  Hero title video
         */
        if ($id == 'hero-video') {
          app.hero.play_feature();
        }

        /*
         *  Content video
         */
        else {
          var $article = $(this).closest('article');
          $article.addClass('active-video');

          if (app.players[$id]) {
            app.players[$id].play(true);
          }
          else {
            app.player.create($('#'+$id), true);
          }

          $('#container-'+$id).addClass('active');
        }
      });
    },
    create : function(obj, play_mode) {

      if (!play_mode) {
        play_mode = false;
      }

      var $thumb = 'https://cdn.supercell.com/supercell.com/210923112516/all/themes/supercell/img/pixel.gif';

      var $primary = 'html5';
      // using flash as primary platform for safari (since play function has issues with youtube)
      if (/^((?!chrome).)*safari/i.test(navigator.userAgent) || $('html').hasClass('vendor-ie')) {
        $primary = 'flash';
      }

      var $skin = 'https://cdn.supercell.com/supercell.com/210923112516/all/themes/supercell/js/jwplayer/skins/supercell/supercell.xml';
      // if ($skin.indexOf("//cdn.supercell.com") > -1) {
      //   $skin = window.location.protocol + $skin;
      // }

      var $fp = 'https://cdn.supercell.com/supercell.com/210923112516/all/themes/supercell/js/jwplayer/jwplayer.flash.swf';
      // if ($fp.indexOf("//cdn.supercell.com") > -1) {
      //   $fp = window.location.protocol + $fp;
      // }

      app.players[obj.attr('id')] = jwplayer(obj.attr('id')).setup({
        file: obj.find('source').attr('src'),
        width: '100%',
        aspectratio: '16:9',
        image: $thumb,
        primary: $primary,
        skin: $skin,
        autostart: play_mode,
        flashplayer: 'https://cdn.supercell.com/supercell.com/210923112516/all/themes/supercell/js/jwplayer/jwplayer.flash.swf',
        ga: {}
      }).onComplete (
        function() {
          if (obj.attr('id') != 'hero-video') {
            var $article = $('#'+obj.attr('id')).closest('article');
            $article.removeClass('active-video');
            $article.find('.video').removeClass('active');
          }
        });
    },
    close : function(obj, mid) {
      $('header, footer, #main-content').css('display', 'block');
      $article = obj.closest('.hero-title');
      $article.removeClass('active-video').addClass('closing-video');
      app.mediaelement[mid].pause();
      obj.removeClass('active');
      obj.find('.v-close').remove();
    },
    pause_slider_siblings: function(slider) {
      slider.find('.slides li:not(.flex-active-slide)').each(function() {
        $id = $(this).find('.video .play a:first').data('id');
        if (app.players[$id]) {
          if (app.players[$id].getState() == 'PLAYING') {
            app.players[$id].pause(true);
          }
        }
      });
    }
  }

  app.clock = {
    init : function() {

      $tmpl = $('.clocks .clock-tmpl').html();

      $('.clocks .clock').each(function() {
        app.clock.create($(this));
        $(this).prepend($tmpl);
      });

      $('.clocks .clock').each(function() {
        app.clock.set_time($(this));
      });
      if (app.is_mobile) {
        $('.clock.seoultokyo').clone().insertAfter($('.clock.seoultokyo'));
        $('.clock.seoultokyo:last').attr('class', 'clock tokyo');
      }

      $.doTimeout(1000, function(){
        $('.clocks .clock').each(function() {
          app.clock.set_time($(this));
        });
        return true;
      });

    },
    create : function(obj) {
      obj.find('.title').show();
    },
    set_time : function(obj) {
      var d = new Date();
      var hours = d.getHours();
      var minute = d.getMinutes();
      var seconds = d.getSeconds();
      var hourRotate;
      var minRotate;
      var secRotate;

      var $tz = obj.data('tz');
      hours = moment().tz($tz).hours();
      minute = moment().tz($tz).minute();
      seconds = moment().tz($tz).seconds();

      hours = ((hours > 12) ? hours - 12 : hours);
      if (minute === 0){
        minRotate = 0;
      } else{
        minRotate = minute*6;
      }
      if (seconds === 0){
        secRotate = 0;
      } else{
        secRotate = seconds*6;
      }
      if (hours === 12){
        hourRotate = 0;
      } else{
        hourRotate = (hours*30) + (minute/2) ;

      }

      var srotate = "rotate(" + secRotate + "deg)";
      obj.find(".sechand").css({"-ms-transform" : srotate,"-moz-transform" : srotate, "-webkit-transform" : srotate, "transform" : srotate});
      var hrotate = "rotate(" + hourRotate + "deg)";
      obj.find(".hourhand").css({"-ms-transform" : hrotate,"-moz-transform" : hrotate, "-webkit-transform" : hrotate, "transform" : hrotate});
      var mrotate = "rotate(" + minRotate + "deg)";
      obj.find(".minhand").css({"-ms-transform" : mrotate,"-moz-transform" : mrotate, "-webkit-transform" : mrotate, "transform" : mrotate});
    }
  }

  app.nav = {
    // Note: uses http://benalman.com/code/projects/jquery-dotimeout/docs/files/jquery-ba-dotimeout-js.html
    init : function() {
      $('.main-menu ul ul').toggleClass('display');
      // 2ND LVL NAVIGATION
      $('.main-menu li:not(.expanded)').on('mouseover', function() {
        var classes = $(this)[0].className.split(' ');
        var classCategory = classes[1];
        // $.doTimeout('expand');
        $.doTimeout('expand-'+classCategory);
        $('.main-menu li.expanded').removeClass('open');
      });

      $('.main-menu li.expanded').on('mouseover', function() {
        // Use 'expand-'+classCategory to separate several 2nd levels from each other
        // Otherwise the dropdowns will lay on top of each other
        var classes = $(this)[0].className.split(' ');
        var classCategory = classes[1];

        // Outright cancel the preceding doTimeout.
        $.doTimeout('expand-'+classCategory);
        // $.doTimeout('expand');

        $(this).addClass('open');

      }).on('mouseout', function() {
        var $_exp = $(this);
        var classes = $_exp[0].className.split(' ');
        var classCategory = classes[1];

        // $.doTimeout('expand', 250, function() {
        $.doTimeout('expand-'+classCategory, 250, function() {
          $_exp.removeClass('open');
        });
      });

      $('.main-menu li.expanded > a').on('click', function() {
        $.doTimeout('expand');
        $('.main-menu li.expanded').removeClass('open');
      });

      // submenu behavior for mobile
      var $mq = window.matchMedia("(max-width: 1024px)");
      if ($mq.matches) {
        $('.main-menu li.expanded > span > a, .main-menu li.expanded > h1 > a').on('click', function(e) {

          if (e) {
            var ul = $(this).parent().parent().find('ul');
            if (ul.hasClass('active')) {
              e.preventDefault()
              e.stopPropagation();
              $('.main-menu .active-leaf').removeClass('active-leaf');
              ul.removeClass('active');
            }
            else {
              $('.main-menu .active').removeClass('active')
              $('.main-menu .active-leaf').removeClass('active-leaf');
              e.preventDefault();
              ul.addClass('active');
              ul.parent().parent().addClass('active-leaf');
              $(this).addClass('active-leaf');
            }
          }
        });
      }
    }
  }

  app.job = {
    init : function() {
      // init iframe resize
      $('#avt_form').iFrameResize();
      // after initialization, page load should move parent page to top anchor
      $('#avt_form').on('load', function() {

        $scroll_top = $('#avt_container').offset().top - $('header').height() + 2;

        $('html, body').stop().animate({'scrollTop': $scroll_top}, 0, 'swing', function() {

        });
      })
    }
  }

  app.story = {
    init : function() {

      // *** About us ***
      // +/- icon, default to plus since content should be collapsed
      $(".icon").addClass("plus");
      // Store the height of the content as data attributes
      setTimeout(()=>{
        $(".collapsible-button").each(function (index) {

          // var for storing the state
          $(this).siblings(".collapsible-content").data("collapsed", true);
          // add css and .answer class to answer divs
          let content = $(this).siblings(".collapsible-content");
          content.data("height", content.outerHeight());
          content.css("height", "0px");
        });
      }, 100)

      var animation_options = {
        duration: 1000,
        easing: "easeOutBack",
        complete: function () {
          // invert the state of collapsed
          $(this).data("collapsed", !$(this).data("collapsed"));
        },
      };

      // FAQ click handler
      $(".collapsible-button").on("click", function (e) {
        //If animated than we wait the animation to be over
        if ($(':animated').length) {
          return false;
        }

        var aHeight = $(this).siblings(".collapsible-content").data('height');

        // check if content is collapsed
        if ($(this).siblings(".collapsible-content").data("collapsed")) {
          // animate slide open
          animation_options.easing = "linear"; // use the default easing
          $(this).siblings(".collapsible-content").animate({height: (aHeight) + "px"}, animation_options);
        } else {
          // animate slide close
          animation_options.easing = "easeOutBack";
          $(this).siblings(".collapsible-content").animate({height: "0px"}, animation_options);
        }

        // Swap icon
        var icon = $(this).find("div:first-child");
        if (icon.hasClass("minus")) {
          icon.removeClass("minus").addClass("plus");
        } else {
          icon.removeClass("plus").addClass("minus");
        }
      })
    }
  }

  var previousSearch = '';
  var busy = false, nextPage = 2;
  var allLoaded = false, firstSearchDone = false;


  app.search = {
    init : function() {
      // If is search page
      if($('#search-page-results').length > 0) {
        $('#search-results').remove();
        $('#search-input').remove();
        $('#search-icon').remove();

        $('#search-page-results').attr('id', 'search-results').show();
        $('#search-input-mobile').attr('id', 'search-input');
        $('#search-icon-mobile').attr('id', 'search-icon');

        $('#search-input').attr('placeholder', '');
        $('#search-input').focus();
        $('#search-input').addClass('active');

        if($(window).width() < 768) {
          $(window).scroll(function(){
            if (jQuery(document).scrollTop() + jQuery(window).height() >= jQuery('#search-results').offset().top + jQuery('#search-results').outerHeight()) {
              if(!busy && !allLoaded && firstSearchDone) {
                busy = true;
                $('.search-loader').addClass('loading');
                app.search.run(nextPage, true);
                nextPage++;
              }
            }
          });
        }

      } else {
        $(document).click(function() {
          $('#search-results.active, #search-input, #search-icon').removeClass('active');
          $('#search-input').val('');
          $.doTimeout('scid_link', 200, function() {
            $('#nav-supercell-id').fadeIn(200);
          });
        });

        $('.search-close').click(function() {
          $('#search-results.active, #search-input, #search-icon').removeClass('active');
          $('#search-input').val('');
          $.doTimeout('scid_link', 200, function() {
            $('#nav-supercell-id').fadeIn(200);
          });
        });

        $('#search-results, #search-results *, #search-icon, #search-input').click(function(e) {
          e.stopPropagation();
        });
      }

      $('#search-icon').click(function(e){
        e.preventDefault();
        if($('#search-input').hasClass('active')) {



          if(!$('#search-input').val().length) {
            $('#search-input').removeClass('active');
            $(this).removeClass('active');

          } else {
            $('#search-input').addClass('loading');
            app.search.run();
          }

        } else {
          $('#nav-supercell-id').fadeOut(200, function() {

          });
          $(this).addClass('active');
          $('#search-input').addClass('active');
          $('#search-input').focus();
        }
      });

      $('#search-input').blur(function(){
        if(!$(this).val().length) {
          $(this).removeClass('active');
          $('#search-icon').removeClass('active');

          $.doTimeout('scid_link', 200, function() {
            if ($('#search-icon').hasClass('active')) {

            }
            else {
              $('#nav-supercell-id').fadeIn(200, function() {
              });
            }

          });
        }
      });

      $(document).keypress(function(e) {
        if(e.which == 13 && $('#search-input').is(':focus')) {
          e.preventDefault();
          $('#search-input').addClass('loading');
          app.search.run();
        }
      });


      $('.search-pagination a').click(function(e){
        e.preventDefault();
        $(this).addClass('loading');
        app.search.run($(this).data('page'));
      });
    },
    run : function(p, lazy) {

      p = typeof p !== 'undefined' ? p : 1;
      lazy = typeof lazy !== 'undefined' ? lazy : false;

      var query = $('#search-input').val();
      var items = [];

      if(query.length) {

        if(!lazy) {
          $('.results-wrapper .result').animate({ 'opacity' : 0 }, 300);
        }

        if(query != previousSearch) {
          nextPage = 2;
          allLoaded = false;
          firstSearchDone = false;
          $('.search-loader').removeClass('all-loaded');
        }

        previousSearch = query;

        $.getJSON('//api.swiftype.com/api/v1/public/engines/search.json?q=' + encodeURIComponent(query) + '&page=' + p + '&per_page=6&engine_key=hyyWh2j2ArdzLUTVJV4H&callback=?', function( data ) {

          if(data.info.page.total_result_count == 0) {

            var $nores_txt = 'Search results';
            if ($('body').hasClass('i18n-ja')) {
              $nores_txt = '結果が見つかりません。';
            }

            $('.search-summary').text($nores_txt);
            $('.search-pagination *').hide();

            $('.results-wrapper .result').slideUp();
            $('.results-wrapper').animate({ 'height': 0 }, 300);

            allLoaded = true;

          } else {

            var $res_txt = 'Search results';
            var $page_txt = 'Page';
            if ($('body').hasClass('i18n-ja')) {
              $res_txt = '検索結果';
              $page_txt = 'ページ';
            }

            $.each(data.records.page, function(key, val) {
              items.push('<a href="' + val.url.replace(/https?:\/\/[^\/]+/i, '') + '" class="result" style="opacity: 0;"><h3>' + val.title + '</h3><p class="metadata">' + val.body + '</p></a>');
            });

            if(lazy) {
              $('.results-wrapper').append(items.join(''));
            } else {
              $('.results-wrapper').html(items.join(''));
            }

            var height = 0;

            $('.results-wrapper a.result').each(function() {
              height += $(this).outerHeight();
            });

            $('.results-wrapper').animate({ 'height': height }, 300);
            $('.results-wrapper .result').animate({ 'opacity' : 1 }, 300);

            $('.search-summary').html($res_txt + ' ' + (data.info.page.num_pages > 1 ? '<span class="page-right">'+ $page_txt + ' ' + data.info.page.current_page + ' / ' + data.info.page.num_pages + '</span>' : ''));

            $('.search-pagination .prev').data('page', data.info.page.current_page - 1);
            $('.search-pagination .next').data('page', data.info.page.current_page + 1);

            $('.search-pagination *').show();

            if(data.info.page.current_page == 1) {
              $('.search-pagination .prev, .search-pagination .separator').hide();
            }

            if(data.info.page.current_page == data.info.page.num_pages || data.info.page.total_result_count < data.info.page.per_page) {
              $('.search-pagination .next, .search-pagination .separator').hide();
              $('.search-loader').addClass('all-loaded');
              allLoaded = true;
            }

          }

          $('#search-results').addClass('active');
          $('#search-input, .search-pagination a, .search-loader').removeClass('loading');
          busy = false;
          firstSearchDone = true;

        });
      }
    }
  }
  app.img = {
    hero_load : function() {

      var $timeout = 0;
      var $mq = window.matchMedia("(max-width: 1024px)");
      if ($mq.matches) {
        var $timeout = 150;
      }

      if ($('.hero-title img').length < 1) {
        return app.hero.init();
      }

      var $count = 0;

      // if hero image load suffers a delay, let's call hero.init anyway
      $.doTimeout('hero_load_delay', 5000, function() {
        if (!($('#main-content').hasClass('visible'))) {

          app.hero.init();
        }
      });

      return $('.hero-title img').each(function() {
        if (this.complete || /*for IE 10-*/ $(this).height() > 0 || this.readyState === 4) {
          $.doTimeout($timeout, function() {
            app.hero.init();
          });
        }
        else {
          $(this).on('load', function(){
            $.doTimeout($timeout, function() {
              app.hero.init();
            });
          });
        }
      });
    }
  }

  app.careers = {
    hash: window.location.hash,
    functions: [],
    locations: [],
    all_functions: [],
    all_locations: [],
    init : function() {

      window.addEventListener("hashchange", app.ui.handle_anchor);

      if (this.hash === '#all' || this.hash === '#join') {
        $('.loader').addClass('show');
      }
      /*
       * Open positions
       *
       */

      // scroll handling for featured jobs button to see all open positions
      $(".m-featured-jobs, #page-careers").find("a.button18-arrow[href=#all]").on("click", function() {
        window.scrollTo(0,$('#join').offset().top - $('header.main').outerHeight());
        $('#join .show-all a').click();
      });

      var begunLoading = false;
      window.addEventListener('flexSliderReady', function(slider) {
        if (begunLoading) {
          return;
        }

        begunLoading = true;

      // load position list
      $('#join').load('../careers/open-positions/', function() {

        // Initial category selection
        // disables categories without any jobs in them
        app.ui.init_job_categories();

        // if we have a #hash and it's not #join
        if(window.location.hash.length > 1 && window.location.hash != '#join') {
          // debugging scrollTop
          if(app.debug) {
            console.log("Before", window.location.hash, "top:", $('#join').offset().top, "outerHeight:", $('header.main').outerHeight());
          }

          if (window.location.hash == '#all') {
            // activate all function tabs
            $('#join .job-functions li').not('.disabled').addClass('active');
            // activate all location tabs
            $('#join .job-locations li').not('.disabled').addClass('active');
            var $category = 'all';
            app.ui.select_job_function($category, $(this).text());
            app.careers.updateFilterArrays();
            window.scrollTo(0,$('#join').offset().top - $('header.main').outerHeight());

          } else {
            // we have a hash different from #all or #join
            app.careers.parseHash();

            // activate selected items based on hash
            $('#join .job-functions li a, #join .job-locations li a').each(function(index, value) {
              var id = $(this)[0].id;
              var parent = $(this).parent();
              var grandparent = $(this).parent().parent();

              // check if the id (from li > a) is included in the arrays for functions/locations
              if(app.careers.functions.includes(id) || app.careers.locations.includes(id)) {
                parent.addClass("active");
              }

              // no functions selected in the hash, but we have location
              if(app.careers.functions.length == 0 && !grandparent.hasClass("job-locations") && parent.is(".not-empty")) {
                parent.addClass("active");
              }

              // no locations selected in the hash, but we have function
              if(app.careers.locations.length == 0 && !grandparent.hasClass("job-functions") && parent.is(".not-empty")) {
                parent.addClass("active");
              }
            });

            // in case we added .active to the functions/locations arrays, update them now
            app.careers.updateFilterArrays();

            // display the jobs according to filters
            app.ui.filter_jobs();
            window.scrollTo(0,$('#join').offset().top - $('header.main').outerHeight());

          }
        }
        else {
          // nothing is selected, default to first function and all locations
          $('#join .job-functions li.not-empty').addClass('active');
          $('#join .job-locations li.not-empty').addClass('active');
          app.careers.updateFilterArrays();
          if (window.location.hash.length > 0) {
            window.location.hash = "#all";
          }
          app.scrolled = true;
        }

        // shows jobs based on current filter
        app.ui.filter_jobs();
        $('.loader').removeClass('show');
        // setup click events on function and location tabs
        $('#join .job-functions a').on('click', function(e) {
          if (e) {
            e.preventDefault();
          }
          if ($(this).parent().hasClass('disabled')) {
            return false;
          }

          $(this).parent().toggleClass('active');

          var hashVal = $(this).attr("href").substring(1);
          if(app.careers.functions.includes(hashVal)) {
            app.careers.functions = app.careers.functions.filter(function(value, index, arr) {
              return value != hashVal;
            });
          } else {
            app.careers.functions.push(hashVal);
          }
          if(app.debug) {
            console.log("functions", app.careers.functions, "locations", app.careers.locations);
          }
          app.careers.updateHistory();
          app.ui.filter_jobs();

        });
        $('#join .job-locations a').on('click', function(e) {
          if (e) {
            e.preventDefault();
          }
          if ($(this).parent().hasClass('disabled')) {
            return false;
          }
          $(this).parent().toggleClass('active');

          var hashVal = $(this).attr("href").substring(1);
          if(app.careers.locations.includes(hashVal)) {
            app.careers.locations = app.careers.locations.filter(function(value, index, arr) {
              return value != hashVal;
            });
          } else {
            app.careers.locations.push(hashVal);
          }
          if(app.debug) {
            console.log("functions", app.careers.functions, "locations", app.careers.locations);
          }
          app.careers.updateHistory();
          app.ui.filter_jobs();
        });

        $('#join .show-all a').on('click', function(e) {
          if (e) {
            e.preventDefault();
          }
          $('#join .job-functions li, #join .job-locations li').not('.disabled').addClass('active');
          $(this).parent().addClass('active');

          var $category = 'all';

          app.ui.filter_jobs($category);
          app.ui.select_job_function($category, $(this).text());

          if(history.pushState) {
            history.pushState(null, null, '#' + $category);
          } else {
            location.hash = '#' + $category;
          }
          app.careers.updateFilterArrays();
        });

        /*
         * Job function filters
         */
        $('.views-field-field-function span').on('click', function(e) {
          $val = $(this).text();
          $('#join .job-functions li a, #join .job-locations li a').each(function() {
            if ($(this).text() == $val) {
              var $target = $(this);
              // scroll to bring navigation back to view
              // $('html, body').stop().animate({'scrollTop': $('.pane-open-positions').offset().top}, 150, 'swing', function() {
              $target.click();
              // });
            }
          })
        });

        /*
         * Job list sorting
         */

        $('.m-openpositions .th li span').on('click', function(e) {

          // remove custom sort
          if ($(this).hasClass('active')) {
            app.ui.sort_job_list('idx');
            $('.m-openpositions .th li span').removeClass('active');
            return true;
          }

          // sort by data value
          $val = $(this).text();
          app.ui.sort_job_list($val.toLowerCase());
          $('.m-openpositions .th li span').removeClass('active');
          $(this).addClass('active');

        });

        if (app.is_mobile) {
          $('#join .job-positions li').on('click', function(e) {
            var job_link = $(this).find('a.button18');
            window.location = job_link[0]['href'];
          });
        }

      });
      });

    },

    updateHistory: function() {
      var page = "#join"; // default value

      // if functions and locations has at least 1 selected
      if(app.careers.functions.length > 0 && app.careers.locations.length > 0) {
        page = '#/' + app.careers.functions.join('/') + '/' + app.careers.locations.join('/');
      }
      // only locations, no functions
      else if (app.careers.locations.length > 0 && app.careers.functions.length == 0) {
        page = '#/' + app.careers.locations.join('/');
      }
      // no locations, only functions
      else if (app.careers.locations.length == 0 && app.careers.functions.length > 0) {
        page = '#/' + app.careers.functions.join('/');
      }
      window.history.pushState(null, null, page);
    },

    parseHash: function() {
      if(app.careers.hash.length > 0) {
        var arr = app.careers.hash.substring(1).split('/');
        arr = arr.filter(x => x); // remove any empty items from the array
        if(app.debug) {
          console.log("parseHash", arr);
        }
        if(Array.isArray(arr)) {
          for(var i = 0;i < arr.length; i++) {
            switch(app.careers.findFilterType(arr[i])) {
              case ".job-functions":
                app.careers.functions.push(arr[i]);
                break;
              case ".job-locations":
                app.careers.locations.push(arr[i]);
                break;
            }
          }
        } else {
          // if the hash isn't an array
          console.log("hash, not array",app.careers.hash);
        }
      }
    },
    findFilterType: function(id) {
      var elf = $("#join .job-functions li").find('#' + id);
      var ell = $("#join .job-locations li").find('#' + id);
      if(elf.length > 0) {
        return ".job-functions";
      }
      if(ell.length > 0) {
        return ".job-locations"
      }
    },
    updateFilterArrays: function() {
      // loop active job-functions and add them to the array
      $("#join .job-functions li a").each(function(index, value) {
        var _id = $(this)[0].id;
        if($(this).parent().hasClass("active") && !app.careers.functions.includes(_id)) {
          app.careers.functions.push(_id);
        }
      });
      // loop active job-locations and add them to the array
      $("#join .job-locations li a").each(function(index, value) {
        var _id = $(this)[0].id;
        if($(this).parent().hasClass("active") && !app.careers.locations.includes(_id)) {
          app.careers.locations.push(_id);
        }
      });
    },
  }

  app.careersoffices = {
    init : function() {
      if(app.debug) {
        console.log('Debugging Our Offices');
      }

      /**
       * Setup images aspect ratio
       */
      $('.sidescroll img').each(function(index, value) {
        app.careersoffices.imageRatio(this);
      });
      $('.sidescroll img').first().addClass("first");
      $('.sidescroll img').last().addClass("last");


      /**
       * Side scroll top images
       */
      try {
        $('.sidescroll').sidescroll({
          scrollRatio: 100,
          range: [window.innerHeight * 0.65, window.innerHeight * 0.5 * -1],
          direction: 'left',
        });
      } catch (e) {
        console.log('sidescroll could not be applied', e);
      }

      /**
       * Mobile sidescroll
       */
      try {
        $('.mobile-sidescroll-helsinki').sidescroll({
          direction: 'left',
          scrollRatio: 100,
          range: [window.innerHeight - 200, -200],
        });
        $('.mobile-sidescroll-shanghai').sidescroll({
          direction: 'left',
          scrollRatio: 100,
          range: [window.innerHeight - 200, -200],
        });
        $('.mobile-sidescroll-sanfrancisco').sidescroll({
          direction: 'left',
          scrollRatio: 100,
          range: [window.innerHeight - 200, -200],
        });
        $('.mobile-sidescroll-seoul').sidescroll({
          direction: 'left',
          scrollRatio: 100,
          range: [window.innerHeight - 200, -200],
        });
      } catch (e) {
        console.log('sidescroll could not be applied on mobile', e);
      }
      /**
       * Office switcher
       */

      // hide all offices
      $('.m-offices .locations .tabcontent .office').removeClass("active");

      // show first office and activate first tab
      $('.m-offices .locations .tabcontent .office').first().addClass("active");
      $('.m-offices .locations .tabs ul li').first().addClass("active");

      // office tab clicks
      $('.m-offices .locations .tabs ul li').on("click", function(e) {
        // clear active and hide offices
        $('.m-offices .locations .tabs ul li').removeClass("active");
        $('.m-offices .locations .tabcontent .office').removeClass("active");

        // activate the clicked tab
        $(this).addClass("active");

        // get the office name of the tab
        var office = $(this)[0].className.replace(" active", "");

        // display the office
        $(".m-offices .locations .tabcontent .office." + office).addClass("active");
      });

    },

    imageRatio: function(image) {
      if(image.width > image.height) {
        $(image).addClass('landscape');
      } else if (image.width < image.height) {
        $(image).addClass('portrait');
      } else {
        $(image).addClass('square');
      }
    }
  },

    app.careersloveit = {
      story_readmore: false,
      init : function() {
        app.ui.handle_anchor();
        if (app.debug) {
          console.log("Why You Might Love It Here");
        }

        $(".swiper-container").each(function(index, element) {
          var $this = $(this);
          if(app.debug) {
            console.log("swiper-container", index, $this);
          }
          $this.addClass("swiper-instance-" + index);
          $this.find(".swiper-button-prev").addClass("swiper-btn-prev-" + index);
          $this.find(".swiper-button-next").addClass("swiper-btn-next-" + index);
          $this.find(".swiper-pagination").addClass("swiper-pagination-" + index);

          var swiper = new Swiper(".swiper-instance-" + index, {
            hashNavigation: true,
            speed: 500,
            pagination: {
              el: '.swiper-pagination-' + index,
              clickable: true,
              renderBullet: function (index, className) {
                return '<span class="' + className + '"></span>';
              },
            },
            navigation: {
              nextEl: '.swiper-btn-next-' + index,
              prevEl: '.swiper-btn-prev-' + index,
            },
            on: {
              resize: function () {
                swiper.updateSlides();
              }
            },
            slidesPerView: 1,
            spaceBetween: 0,
            centeredSlides: true,
          });
          if(app.debug) {
            console.log("swiper " + index, swiper);
          }
        });

        // slide down to swiper parent element
        if (window.location.hash.length > 0 && !app.scrolled ) {
          var hash = encodeURI(window.location.hash);
          hash = hash.replace("#", "");

          var swiperEl = $(`[data-hash='${hash}']`),
            swiperParent = swiperEl.parents('.swiper-container');

          if (swiperParent) {
            $('html, body').animate({ scrollTop: swiperParent.offset().top }, 500);
            app.scrolled = true; // Let's not scroll on resize
          }
        }

        if (app.is_mobile) {
          if (app.debug) {
            console.log("story_readmore", app.careersloveit.story_readmore);
          }

          // add down arrow to readmore on load
          $(".m-story .swiper-container .swiper-slide .copy .readmore").addClass("arrow-down");

          // hide all except the 1st paragraph on load
          $(".m-story .swiper-container .swiper-slide .copy").each(function (index, value) {
            // loop the paragraphs in the slide
            $(this).find("p").each(function (index, value) {
              if (index > 0) {
                // hide all except the first paragraph
                $(this).hide();
              }
            });
          });

          // click events on .readmore in story
          $(".m-story .swiper-container .swiper-slide .copy .readmore").on("click", function (e) {
            // var for holding value if we should be showing or hiding, invert it on every click
            app.careersloveit.story_readmore = !app.careersloveit.story_readmore;

            if (app.careersloveit.story_readmore) {
              // show all paragraphs on click
              $(".m-story .swiper-container .swiper-slide .copy p").show("fast");

              var rm = $(".m-story .swiper-container .swiper-slide .copy .readmore");
              rm.html("Read less");
              rm.addClass("arrow-up");
              rm.removeClass("arrow-down");

            }
            else {
              // loop the slides
              $(".m-story .swiper-container .swiper-slide .copy").each(function (index, value) {
                // loop the paragraphs in the slide
                $(this).find("p").each(function (index, value) {
                  if (index > 0) {
                    // hide all except the first paragraph
                    $(this).hide("fast");
                  }
                });
              });

              var rm = $(".m-story .swiper-container .swiper-slide .copy .readmore");
              rm.html("Read more");
              rm.addClass("arrow-down");
              rm.removeClass("arrow-up");
            }

            if (app.debug) {
              console.log("story_readmore", app.careersloveit.story_readmore);
            }
          });
        }
        else {
          $(".m-story .swiper-container .swiper-slide .copy p").each(function (index, value) {
            $(this).show();
          });
        }
        // });
      }
    },

    app.careersjoin = {
      hash: window.location.hash,
      resize : function() {
        app.ui.handle_anchor();
      },
      init: function() {
        // Fancy sidescroll
        $('.sidescroll').sidescroll({
          sticky: true,
          tween: true,
          stickyContainer: $('.step-by-step-process')[0],
          scrollContainer: $('.step-by-step-process .sbs__steps')[0],
          disabled: [0, 767],
        });

        setTimeout(function(){
          app.ui.handle_anchor();
        }, 1)

        // *** FAQ ***
        // +/- icon, default to plus since all answers should be closed
        $(".faq .question div:nth-child(odd)").addClass("icon plus");

        // Store the height of every question as data attributes
        $(".faq .question").each(function(index){
          var qHeight = $(this).find("div:nth-child(odd)").outerHeight() + 80; // .question padding-top/bottom: 40px
          var aHeight = $(this).find("div:nth-child(even)").outerHeight() + 32; // 32px margin-top

          // set the question block height to "closed"
          $(this).css("height",  qHeight + "px"); // closed
          // var for storing the state
          $(this).data("collapsed", true);
          // add css and .answer class to answer divs
          // $(this).find("div:nth-child(even)").css("display", "").addClass("answer").css("opacity", 0);
          $(this).find("div:nth-child(even)").css("display", "").addClass("answer");

          // console.log(index, "q", qHeight, "a", aHeight, "total", qHeight + aHeight);
        });

        var animation_options = {
          duration: 500,
          easing: "easeOutBack",
          complete: function() {
            // invert the state of collapsed
            $(this).data("collapsed", !$(this).data("collapsed"));
          },
        };

        // FAQ click handler
        $(".faq .question").on("click", function (e) {
          //If animated than we wait the animation to be over
          if ($(':animated').length) {
            return false;
          }

          var qHeight = $(this).find("div:nth-child(odd)").outerHeight() + 80; // .question padding-top/bottom: 40px
          var aHeight = $(this).find("div:nth-child(even)").outerHeight() + 32; // 32px margin-top

          // console.log("current", $(this).outerHeight(), "q", qHeight, "a", aHeight, "total", qHeight+aHeight);

          // check if question is collapsed
          if($(this).data("collapsed")) {
            // animate slide open
            animation_options.easing = "easeOutExpo"; // use the default easing
            $(this).animate({ height: (qHeight + aHeight) + "px" }, animation_options);
          } else {
            // animate slide close
            animation_options.easing = "easeOutBack";
            $(this).animate({ height: (qHeight) + "px" }, animation_options);
          }

          // Swap icon next to question
          var icon = $(this).find("div:first-child");
          if(icon.hasClass("minus")) {
            icon.removeClass("minus").addClass("plus");
          } else {
            icon.removeClass("plus").addClass("minus");
          }
        });
      },
    },

    app.frontpage = {
      init : function() {
        $('.link-more a').on('click', function(e) {

          // go to news archive
          if ($('.link-more').hasClass('archive')) {
            return true;
          };

          // show more and change button label and url
          e.stopPropagation();
          $('.field-name-field-featured-news .field-items').addClass('more');
          $(this).parent().addClass('archive');

          $.doTimeout(500, function() {
            $('.link-more a').text($('.link-more a').data('alt-text'));
            $('.link-more a').attr('href', $('.link-more a').data('alt-url'));
          });
        });
      }
    }

  app.games = {
    init : function() {
      /*
      $('.expand a').on('click', function(e) {
          if (e) {
              e.preventDefault();
          }
          $('.part.secondary').removeClass('secondary');
          $(this).parent().closest('.content').addClass('expanded');
          $(this).parent().addClass('hidden');
      });
      */

      // rearrange timeline character dom placement
      if (app.is_mobile) {
        var gs = $('.m-timeline').find('.game-screen');
        $('.m-timeline .scroll-container').append(gs);
      }
    }
  }


  $.fn.app = function(scope, method) {
    if (app[scope][method]) {
      return app[scope][method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return app[scope].init.apply( this, arguments );
    } else {
      return false;
    }
  };

  $(window).load(function () {
    $('body').app('start');
  });


// Avoid `console` errors in browsers that lack a console.
  (function() {
    var method;
    var noop = function noop() {};
    var methods = [
      'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
      'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
      'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
      'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
      method = methods[length];

      // Only stub undefined methods.
      if (!console[method]) {
        console[method] = noop;
      }
    }
  }());

  /**
   * Sidescroll functionality
   */
  (function($, window) {

    $.fn.sidescroll = function(options) {

      // Defaults.
      var ticking = false,
        opts = $.extend({
          lastY: null,
          sticky: false,
          scrollContainer: null,
          stickyPosition: 0,
          scrollRatio: 70,
          scrollLength: null,
          range: 'viewport',
          verticalSpace: 0,
          height: null,
          width: null,
          tween: false,
          direction: 'right',
          disabled: [],
        }, options );



      if (this.length > 1) {
        throw new Error('Only one root element allowed');
      }

      // If viewport is range we use entire window inner height
      if (opts.range === 'viewport') {
        opts.range = [
          window.innerHeight,
          0
        ];
      }

      $.each(this, function(index, elm) {
        // Calculate distance needed for slidescroll to finish
        calculateScrollDistance(opts, elm);

        // Sticky calculations
        if (opts.sticky) {
          calculateSticky(elm, opts);
        }

        // Tween
        if (opts.tween) {
          if (opts.scrollContainer) {
            opts.scrollContainer.classList.add('tween');
          } else {
            elm.classList.add('tween');
          }
        }

        // Events
        window.addEventListener('scroll', function(e) {
          updateLoop(opts, elm);
        });

        // Window resize listener to re calculate positions
        window.addEventListener('resize', function(e) {
          if (isDisabled(opts)) {
            reset(elm, opts);
          }

          calculateScrollDistance(opts, elm);

          if (opts.sticky) {
            calculateSticky(elm, opts);
          }
          updateLoop(opts, elm);

          render(elm, opts, true);
        });

        // Initially set the correct positions
        $( document ).ready(function() {
          opts.lastY = window.scrollY;
          render(elm, opts, true);
        });
      });

      return this;
    };

    function isDisabled(opts) {
      if (opts.disabled.length === 2) {
        return window.innerWidth > opts.disabled[0] && window.innerWidth < opts.disabled[1];
      }
      return false;
    }

    function reset(elm, opts) {
      opts.scrollContainer.style.transform = null;
      elm.parentNode.removeAttribute('style');
      elm.removeAttribute('style');
    }

    function isHidden(el) {
      var style = window.getComputedStyle(el);
      return (style.display === 'none')
    }

    function updateLoop(opts, elm) {
      if (opts.lastY === null || opts.lastY === 0) {
        opts.lastY = window.scrollY;
        render(elm, opts, true);
      }

      opts.lastY = window.scrollY;
      if (isHidden(elm)) {
        return;
      }

      window.requestAnimationFrame(function() {
        render(elm, opts);
      });
    }

    function calculateScrollDistance(opts, elm) {
      if (opts.scrollContainer) {
        opts.width = opts.scrollContainer.getBoundingClientRect().width;
        opts.scrollLength = opts.scrollContainer.getBoundingClientRect().width - opts.scrollContainer.parentNode.getBoundingClientRect().width;
        opts.height = opts.scrollContainer.getBoundingClientRect().height;
      } else {
        opts.width = elm.getBoundingClientRect().width;
        opts.scrollLength = elm.getBoundingClientRect().width - elm.parentNode.getBoundingClientRect().width;
        opts.height = elm.getBoundingClientRect().height;
      }
    }

    function calculateSticky(elm, opts) {
      if (isDisabled(opts)) {
        reset(elm, opts);
        return;
      }

      opts.scrollRatio = null; // not used in sticky
      opts.verticalSpace = opts.width;
      elm.parentNode.style.paddingBottom = 'calc(100vh + ' + opts.scrollLength + 'px)';
      elm.parentNode.style.position = 'relative';
      elm.style.width = '100%';
      elm.style.height = window.innerHeight + 'px';
    }

    function render(elm, opts, force) {
      if (isDisabled(opts)) {
        reset(elm, opts);
        return;
      }

      var start = null,
        end = null;

      if (typeof force === 'undefined') {
        force = false;
      }

      var progress = null;

      // Sticky
      if (opts.sticky) {
        start = Math.max(elm.parentNode.getBoundingClientRect().y + opts.lastY + opts.stickyPosition, 0);
        end = elm.parentNode.getBoundingClientRect().y + elm.parentNode.getBoundingClientRect().height + opts.lastY - window.innerHeight;

        // In sticky section
        if ((opts.lastY >= start && opts.lastY <= end)) {
          progress = (opts.lastY - start) * -1;
          elm.style.position = 'fixed';
          elm.style.top = opts.stickyPosition + 'px';
          elm.style.bottom = '0';
          opts.scrollContainer.style.transform = 'translateX('+ progress + 'px)';
        }

        // Past the sticky section
        else if (opts.lastY > end) {
          elm.style.top = 'auto';
          elm.style.bottom = '0px';
          elm.style.position = 'absolute';
          opts.scrollContainer.style.transform = 'translateX(-' + opts.scrollLength + 'px)';
        }

        // Before sticky section
        else {
          elm.style.position = 'absolute';
          opts.scrollContainer.style.transform = 'translateX(0px)';
        }

        // Not sticky
      } else {
        start = Math.max(elm.getBoundingClientRect().y - opts.range[0] + opts.lastY, 0);
        end = elm.getBoundingClientRect().y + elm.getBoundingClientRect().height + opts.range[1] + opts.lastY;

        // No need to sidescroll if content is smaller than window
        if (elm.firstElementChild.getBoundingClientRect().width < window.innerWidth) {
          return;
        }

        var xMovement = Math.round((opts.scrollRatio / 100) * (elm.firstElementChild.getBoundingClientRect().width - window.innerWidth));

        if ((opts.lastY >= start && opts.lastY <= end) || force) {
          progress = Math.max(0, (opts.lastY - start) / (end - start));
          progress = Math.min(1, progress);
          var calcMovement = Math.round(progress * xMovement);

          if (opts.direction !== 'right') {
            calcMovement *= -1;
          } else {
            xMovement = Math.max(1, calcMovement);
          }

          elm.style.transform = 'translateX(' + calcMovement + 'px)';
        } else if (opts.lastY < start) {
          elm.style.transform = 'translateX(0px)';
        } else if (opts.lastY > end) {
          elm.style.transform = xMovement;
        }
      }
    }

  })(jQuery, window);

// jQuery plugin to randomize order of elements (i.e. flexslider items)
// add "random-order" class to the flexslider to enable. See investments page for example.
  (function($) {
    $.fn.randomize = function(tree, childElem) {
      return this.each(function() {
        var $this = $(this);
        if (tree) $this = $(this).find(tree);
        var unsortedElems = $this.children(childElem);
        var elems = unsortedElems.clone();
        elems.sort(function() { return (Math.round(Math.random())-0.5); });
        for(var i=0; i < elems.length; i++) {
          unsortedElems.eq(i).replaceWith(elems[i]);
        }
      });
    };
  })(jQuery);

// jQuery fancybox, default values and options
// see https://fancyapps.com/fancybox/3/docs/#options
  (function($) {
    $.fancybox.defaults.keyboard = false;
    $.fancybox.defaults.arrows = false;
    $.fancybox.defaults.buttons = ["close"];
    $.fancybox.defaults.smallBtn = true;
    $.fancybox.defaults.infobar = false;
    $.fancybox.defaults.toolbar = false;
    $.fancybox.defaults.wheel = false;
  })(jQuery);

  /*
   * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
   *
   * Uses the built in easing capabilities added In jQuery 1.1
   * to offer multiple easing options
   *
   * TERMS OF USE - jQuery Easing
   *
   * Open source under the BSD License.
   *
   * Copyright 2008 George McGinley Smith
   * All rights reserved.
   *
   * Redistribution and use in source and binary forms, with or without modification,
   * are permitted provided that the following conditions are met:
   *
   * Redistributions of source code must retain the above copyright notice, this list of
   * conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above copyright notice, this list
   * of conditions and the following disclaimer in the documentation and/or other materials
   * provided with the distribution.
   *
   * Neither the name of the author nor the names of contributors may be used to endorse
   * or promote products derived from this software without specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
   * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
   * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
   * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
   * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
   * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
   * OF THE POSSIBILITY OF SUCH DAMAGE.
   *
  */
  // t: current time, b: begInnIng value, c: change In value, d: duration
  $.easing.jswing = $.easing.swing;
  $.extend($.easing, {
    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
      //alert($.easing.default);
      return $.easing[$.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
      return c*(t/=d)*t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
      return -c *(t/=d)*(t-2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t + b;
      return -c/2 * ((--t)*(t-2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
      return c*(t/=d)*t*t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
      return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t + b;
      return c/2*((t-=2)*t*t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
      return c*(t/=d)*t*t*t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
      return -c * ((t=t/d-1)*t*t*t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
      return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
      return c*(t/=d)*t*t*t*t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
      return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
      return c/2*((t-=2)*t*t*t*t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
      return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
      return c * Math.sin(t/d * (Math.PI/2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
      return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
      return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
      return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
      if (t==0) return b;
      if (t==d) return b+c;
      if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
      return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
      return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
      return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
      if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
      return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
      return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c*(t/=d)*t*((s+1)*t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
      return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
      return c - $.easing.easeOutBounce (x, d-t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
      if ((t/=d) < (1/2.75)) {
        return c*(7.5625*t*t) + b;
      } else if (t < (2/2.75)) {
        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
      } else if (t < (2.5/2.75)) {
        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
      } else {
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
      }
    },
    easeInOutBounce: function (x, t, b, c, d) {
      if (t < d/2) return $.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
      return $.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
    }
  });


})(jQuery, Drupal);
;
