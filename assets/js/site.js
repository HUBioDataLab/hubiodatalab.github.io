// HU BioDataLab: small progressive enhancements. Every page works without this file.
(function () {
  "use strict";

  // Mobile navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
  }

  // Normalise a name for matching: strip accents/dots, lowercase, Turkish dotless i.
  function norm(s) {
    return String(s)
      .replace(/ı/g, "i").replace(/İ/g, "I")
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/\./g, " ").replace(/\s+/g, " ").trim().toLowerCase();
  }
  // "T Doğan", "Tunca Doğan" -> "t dogan"; keep first initial + surname.
  function key(name) {
    var parts = norm(name).split(" ");
    if (parts.length < 2) return parts[0];
    return parts[0].charAt(0) + " " + parts[parts.length - 1];
  }

  var base = document.querySelector('link[rel="stylesheet"][href*="main.css"]');
  var root = base ? base.getAttribute("href").replace(/assets\/css\/main\.css.*$/, "") : "/";

  function withMembers(cb) {
    fetch(root + "assets/data/members.json").then(function (r) { return r.json(); }).then(cb).catch(function (e) { console.error(e); });
  }

  // Bold lab members in author lists and link to their pages.
  function highlightAuthors(scope, members) {
    var map = {};
    members.forEach(function (m) {
      [].concat(m.aliases || [], [m.name]).forEach(function (a) { map[key(a)] = m; });
    });
    scope.querySelectorAll("[data-authors]").forEach(function (el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      var names = el.textContent.split(/,\s*/);
      el.textContent = "";
      names.forEach(function (n, i) {
        var m = map[key(n)];
        var node;
        if (m) {
          node = document.createElement("strong");
          var a = document.createElement("a");
          a.href = m.url; a.textContent = n.trim();
          node.appendChild(a);
        } else {
          node = document.createTextNode(n.trim());
        }
        el.appendChild(node);
        if (i < names.length - 1) el.appendChild(document.createTextNode(", "));
      });
    });
    return map;
  }

  var memberPubs = document.querySelector("[data-member-pubs]");
  var hasAuthors = document.querySelector("[data-authors]");

  if (hasAuthors || memberPubs) {
    withMembers(function (members) {
      var map = highlightAuthors(document, members);

      // Member page: list papers this person co-authored.
      if (memberPubs) {
        var tpl = document.getElementById("all-pubs");
        var aliases = [].concat(JSON.parse(memberPubs.getAttribute("data-member-pubs") || "[]") || []);
        var mine = {};
        aliases.forEach(function (a) { mine[key(a)] = true; });
        var list = memberPubs.querySelector("[data-list]");
        var frag = tpl.content.cloneNode(true);
        Array.prototype.forEach.call(frag.querySelectorAll(".pub"), function (li) {
          var names = li.querySelector("[data-authors]").textContent.split(/,\s*/);
          if (names.some(function (n) { return mine[key(n)]; })) list.appendChild(li);
        });
        if (list.children.length) {
          highlightAuthors(list, members);
          memberPubs.hidden = false;
        }
      }
    });
  }

  // Publications page: search + type filter.
  var filter = document.querySelector("[data-pub-filter]");
  if (filter) {
    var input = filter.querySelector("[data-search]");
    var chips = filter.querySelectorAll(".chip");
    var count = filter.querySelector("[data-count]");
    var empty = filter.querySelector("[data-empty]");
    var groups = filter.querySelectorAll("[data-year-group]");
    var type = "all";

    var apply = function () {
      var q = norm(input.value);
      var shown = 0;
      groups.forEach(function (g) {
        var visible = 0;
        g.querySelectorAll(".pub").forEach(function (li) {
          var isPre = li.classList.contains("is-preprint");
          var okType = type === "all" || (type === "preprint" ? isPre : !isPre);
          var okText = !q || norm(li.textContent + " " + li.dataset.year).indexOf(q) !== -1;
          var ok = okType && okText;
          li.hidden = !ok;
          if (ok) visible++;
        });
        g.hidden = visible === 0;
        shown += visible;
      });
      count.textContent = shown;
      empty.hidden = shown !== 0;
    };

    input.addEventListener("input", apply);
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (o) { o.setAttribute("aria-pressed", String(o === c)); });
        type = c.dataset.type;
        apply();
      });
    });
  }
})();
