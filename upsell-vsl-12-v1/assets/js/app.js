/* =============================================================================
   Glyco Barrier — fa-fe6-gb — page logic
   Loaded with `defer`: parsed off the main thread, executed after HTML parsing
   and before DOMContentLoaded, so it never blocks FCP/LCP.
   ============================================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------------
     URL parameter propagation
     --------------------------------------------------------------------------- */
  function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }

  /**
   * Merges the parameters of the current URL into an existing href without
   * overwriting parameters the href already declares.
   */
  function combineParams(originalHref, currentParams) {
    if (!originalHref) return originalHref;

    var parts = originalHref.split("?");
    var baseUrl = parts[0];
    var originalParams = new URLSearchParams(parts[1] || "");

    currentParams.forEach(function (value, key) {
      if (!originalParams.has(key)) {
        originalParams.append(key, value);
      }
    });

    var finalParamsString = originalParams.toString();
    return finalParamsString ? baseUrl + "?" + finalParamsString : baseUrl;
  }

  function propagateParams() {
    var links = document.querySelectorAll(
      ".card a[href], .product-box a[href]"
    );
    var currentParams = getQueryParams();

    Array.prototype.forEach.call(links, function (link) {
      var originalHref = link.getAttribute("href");
      if (!originalHref || originalHref.charAt(0) === "#") return;
      link.setAttribute("href", combineParams(originalHref, currentParams));
    });
  }

  /* ---------------------------------------------------------------------------
     Countdown
     --------------------------------------------------------------------------- */
  function initCountdown() {
    var timerElement = document.querySelector(".timer .time");
    if (!timerElement) return;

    var duration = 17 * 60 + 20; // 17:20

    function updateDisplay() {
      var minutes = Math.floor(duration / 60);
      var seconds = duration % 60;
      timerElement.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
    }

    updateDisplay();

    var countdown = setInterval(function () {
      if (duration <= 0) {
        clearInterval(countdown);
        timerElement.textContent = "00:00";
        return;
      }
      duration--;
      updateDisplay();
    }, 1000);
  }

  /* ---------------------------------------------------------------------------
     VTurb thumbnail: the player injects an <img> with no alt text
     --------------------------------------------------------------------------- */
  function initPlayerThumbnailAlt() {
    var player = document.getElementById("vid-6a9ad63d364c7569e925a59a");
    if (!player) return;

    var ready = false;
    var observer;

    function applyAlt() {
      var thumbnail = player.querySelector("img.thumbnail-image");
      if (!thumbnail) return false;

      thumbnail.setAttribute(
        "alt",
        "Video preview showing a woman holding a bottle of Glyco Barrier."
      );

      if (ready && observer) observer.disconnect();
      return true;
    }

    observer = new MutationObserver(applyAlt);
    observer.observe(player, { childList: true, subtree: true });
    applyAlt();

    player.addEventListener("player:ready", function () {
      ready = true;
      applyAlt();
    });
  }

  /* ---------------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------------- */
  function boot() {
    propagateParams();
    initCountdown();
    initPlayerThumbnailAlt();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
