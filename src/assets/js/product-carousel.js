(function () {
  "use strict";

  var carouselRegistry = {};
  var lightboxState = null;

  initProductCarousels();
  initScreenshotLightbox();

  function initProductCarousels() {
    document.querySelectorAll(".product-carousel").forEach(function (carousel) {
      var controller = createCarouselController(carousel);
      var carouselId = carousel.getAttribute("data-carousel-id");
      if (carouselId) {
        carouselRegistry[carouselId] = controller;
      }
    });
  }

  function createCarouselController(carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".product-carousel__slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".product-carousel__dot"));
    var prevBtn = carousel.querySelector(".product-carousel__btn--prev");
    var nextBtn = carousel.querySelector(".product-carousel__btn--next");
    var viewport = carousel.querySelector(".product-carousel__viewport");
    var chrome = carousel.querySelector(".product-carousel__chrome");
    var intervalSeconds = parseInt(carousel.getAttribute("data-carousel-interval") || "10", 10);
    var currentIndex = 0;
    var timerId = null;
    var paused = false;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function showSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === currentIndex);
      });
      dots.forEach(function (dot, i) {
        var active = i === currentIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function setChromeInteractive(active) {
      if (!chrome) {
        return;
      }
      chrome.setAttribute("aria-hidden", active ? "false" : "true");
      chrome.querySelectorAll("button").forEach(function (btn) {
        btn.tabIndex = active ? 0 : -1;
      });
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    function prevSlide() {
      showSlide(currentIndex - 1);
    }

    function stopTimer() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    function startTimer() {
      stopTimer();
      if (slides.length <= 1 || reduceMotion || paused || document.hidden) {
        return;
      }
      timerId = window.setInterval(nextSlide, Math.max(intervalSeconds, 3) * 1000);
    }

    function pause() {
      paused = true;
      stopTimer();
    }

    function resume() {
      paused = false;
      startTimer();
    }

    function getSlideData(index) {
      var slide = slides[index];
      if (!slide) {
        return null;
      }
      var img = slide.querySelector(".product-shot__img");
      return {
        src: img ? img.getAttribute("src") : "",
        alt: img ? img.getAttribute("alt") || "" : "",
        label: slide.getAttribute("data-slide-label") || "",
      };
    }

    function getAllSlideData() {
      return slides.map(function (_, index) {
        return getSlideData(index);
      });
    }

    if (slides.length > 1) {
      if (nextBtn) {
        nextBtn.addEventListener("click", function (event) {
          event.stopPropagation();
          nextSlide();
          startTimer();
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function (event) {
          event.stopPropagation();
          prevSlide();
          startTimer();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function (event) {
          event.stopPropagation();
          showSlide(index);
          startTimer();
        });
      });

      carousel.addEventListener("mouseenter", function () {
        pause();
        setChromeInteractive(true);
      });
      carousel.addEventListener("mouseleave", function () {
        resume();
        setChromeInteractive(false);
      });
      carousel.addEventListener("focusin", function () {
        pause();
        setChromeInteractive(true);
      });
      carousel.addEventListener("focusout", function (event) {
        if (!carousel.contains(event.relatedTarget)) {
          resume();
          setChromeInteractive(false);
        }
      });

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          stopTimer();
        } else if (!paused) {
          startTimer();
        }
      });

      setChromeInteractive(false);
      startTimer();
    }

    if (viewport) {
      viewport.addEventListener("click", function (event) {
        if (event.target.closest(".product-carousel__chrome")) {
          return;
        }
        var carouselId = carousel.getAttribute("data-carousel-id");
        if (carouselId && typeof window.openScreenshotLightbox === "function") {
          window.openScreenshotLightbox(carouselId, currentIndex);
        }
      });

      viewport.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          var carouselId = carousel.getAttribute("data-carousel-id");
          if (carouselId && typeof window.openScreenshotLightbox === "function") {
            window.openScreenshotLightbox(carouselId, currentIndex);
          }
          return;
        }
        if (slides.length <= 1) {
          return;
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          nextSlide();
          startTimer();
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          prevSlide();
          startTimer();
        }
      });
    }

    return {
      element: carousel,
      showSlide: showSlide,
      getCurrentIndex: function () {
        return currentIndex;
      },
      getAllSlideData: getAllSlideData,
      pause: pause,
      resume: resume,
    };
  }

  function initScreenshotLightbox() {
    var lightbox = document.getElementById("screenshot-lightbox");
    if (!lightbox) {
      return;
    }

    var backdrop = lightbox.querySelector(".screenshot-lightbox__backdrop");
    var closeBtn = lightbox.querySelector(".screenshot-lightbox__close");
    var prevBtn = lightbox.querySelector(".screenshot-lightbox__nav--prev");
    var nextBtn = lightbox.querySelector(".screenshot-lightbox__nav--next");
    var img = lightbox.querySelector(".screenshot-lightbox__img");
    var titleEl = document.getElementById("screenshot-lightbox-title");
    var counterEl = lightbox.querySelector(".screenshot-lightbox__counter");
    var dotsEl = lightbox.querySelector(".screenshot-lightbox__dots");
    var lastFocused = null;

    function renderDots(slides, activeIndex) {
      if (!dotsEl) {
        return;
      }
      dotsEl.innerHTML = "";
      slides.forEach(function (slide, index) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "screenshot-lightbox__dot" + (index === activeIndex ? " is-active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", slide.label || "Slide " + (index + 1));
        dot.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
        dot.addEventListener("click", function () {
          showLightboxSlide(index);
        });
        dotsEl.appendChild(dot);
      });
    }

    function showLightboxSlide(index) {
      if (!lightboxState) {
        return;
      }
      var slides = lightboxState.slides;
      lightboxState.index = (index + slides.length) % slides.length;
      var slide = slides[lightboxState.index];
      if (img) {
        img.src = slide.src;
        img.alt = slide.alt;
      }
      if (titleEl) {
        titleEl.textContent = slide.label;
      }
      if (counterEl) {
        counterEl.textContent = lightboxState.index + 1 + " / " + slides.length;
      }
      renderDots(slides, lightboxState.index);
      if (lightboxState.controller) {
        lightboxState.controller.showSlide(lightboxState.index);
      }
    }

    function closeLightbox() {
      if (!lightboxState) {
        return;
      }
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("screenshot-lightbox-open");
      if (lightboxState.controller) {
        lightboxState.controller.resume();
      }
      lightboxState = null;
      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    function openLightbox(carouselId, index) {
      var controller = carouselRegistry[carouselId];
      if (!controller) {
        return;
      }
      var slides = controller.getAllSlideData();
      if (!slides.length) {
        return;
      }

      lastFocused = document.activeElement;
      controller.pause();
      lightboxState = {
        carouselId: carouselId,
        controller: controller,
        slides: slides,
        index: Math.max(0, Math.min(index, slides.length - 1)),
      };

      showLightboxSlide(lightboxState.index);
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("screenshot-lightbox-open");
      if (closeBtn) {
        closeBtn.focus();
      }
    }

    window.openScreenshotLightbox = openLightbox;

    if (backdrop) {
      backdrop.addEventListener("click", closeLightbox);
    }
    if (closeBtn) {
      closeBtn.addEventListener("click", closeLightbox);
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (lightboxState) {
          showLightboxSlide(lightboxState.index - 1);
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        if (lightboxState) {
          showLightboxSlide(lightboxState.index + 1);
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (!lightboxState || lightbox.hidden) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showLightboxSlide(lightboxState.index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showLightboxSlide(lightboxState.index + 1);
      }
    });
  }
})();
