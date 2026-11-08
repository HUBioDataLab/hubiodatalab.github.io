// Home page: highlighted-work slider with dot navigation. Without this file every slide is shown, stacked.
(function () {
  "use strict";

  var root = document.querySelector("[data-slider]");
  if (!root) return;
  var slides = root.querySelectorAll(".slide");
  var dotsWrap = root.querySelector("[data-dots]");
  if (slides.length < 2 || !dotsWrap) return;
  var dots = dotsWrap.querySelectorAll("[data-dot]");

  var index = 0;

  function show(i, focusDot) {
    index = (i + slides.length) % slides.length;
    for (var k = 0; k < slides.length; k++) {
      var on = k === index;
      slides[k].classList.toggle("is-active", on);
      slides[k].setAttribute("aria-hidden", String(!on));
      if ("inert" in slides[k]) slides[k].inert = !on;
    }
    for (var d = 0; d < dots.length; d++) {
      var active = d === index;
      dots[d].classList.toggle("is-active", active);
      dots[d].setAttribute("aria-pressed", String(active));
      if (active) dots[d].setAttribute("aria-current", "true");
      else dots[d].removeAttribute("aria-current");
    }
    if (focusDot && dots[index]) dots[index].focus();
  }

  root.classList.add("is-slider");
  dotsWrap.hidden = false;
  for (var n = 0; n < dots.length; n++) {
    dots[n].addEventListener("click", function () { show(Number(this.getAttribute("data-dot"))); });
  }

  // Left/right arrow keys while focus is inside the slider.
  root.addEventListener("keydown", function (e) {
    if (e.target.closest && e.target.closest("input, textarea")) return;
    var onDot = e.target.hasAttribute && e.target.hasAttribute("data-dot");
    if (e.key === "ArrowLeft") { show(index - 1, onDot); e.preventDefault(); }
    else if (e.key === "ArrowRight") { show(index + 1, onDot); e.preventDefault(); }
  });

  show(0);
})();
