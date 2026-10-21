/* Khan Property Services — site behaviour.
   Progressive enhancement: every component renders fully without this file. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  // Navigation hook (lets automated tests capture the mailto URL instead of opening a mail app).
  window.KPS = window.KPS || {};
  if (typeof window.KPS.navigate !== 'function') window.KPS.navigate = function (url) { window.location.href = url; };

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------
     Header: scrolled state
     ------------------------------------------------------------------ */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mega menus (disclosure pattern)
     ------------------------------------------------------------------ */
  var triggers = $$('[data-mega-trigger]');
  var openTrigger = null;
  var closeTimer = null;
  var openedByHover = false;

  function panelFor(trigger) { return doc.getElementById(trigger.getAttribute('aria-controls')); }

  function openMega(trigger, viaHover) {
    clearTimeout(closeTimer);
    if (openTrigger && openTrigger !== trigger) closeMega(openTrigger);
    trigger.setAttribute('aria-expanded', 'true');
    panelFor(trigger).classList.add('is-open');
    if (header) header.classList.add('mega-is-open');
    openTrigger = trigger;
    openedByHover = !!viaHover;
  }

  function closeMega(trigger) {
    if (!trigger) return;
    trigger.setAttribute('aria-expanded', 'false');
    panelFor(trigger).classList.remove('is-open');
    if (openTrigger === trigger) {
      openTrigger = null;
      if (header) header.classList.remove('mega-is-open');
    }
  }

  triggers.forEach(function (trigger) {
    var item = trigger.closest('.nav__item');

    trigger.addEventListener('click', function () {
      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      if (expanded && openedByHover) { openedByHover = false; return; }
      if (expanded) closeMega(trigger); else openMega(trigger, false);
    });

    item.addEventListener('mouseenter', function () {
      if (!finePointer.matches) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { openMega(trigger, true); }, openTrigger ? 0 : 90);
    });
    item.addEventListener('mouseleave', function () {
      if (!finePointer.matches) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { closeMega(trigger); }, 180);
    });

    item.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !item.contains(e.relatedTarget)) closeMega(trigger);
    });
  });

  doc.addEventListener('click', function (e) {
    if (openTrigger && !openTrigger.closest('.nav__item').contains(e.target)) closeMega(openTrigger);
  });

  /* ------------------------------------------------------------------
     Mobile drawer with accordion groups and focus containment
     ------------------------------------------------------------------ */
  var drawer = doc.getElementById('site-drawer');
  var drawerToggle = $('[data-drawer-toggle]');
  var lastFocus = null;

  function focusables(container) {
    return $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter(function (el) { return el.offsetParent !== null || el === doc.activeElement; });
  }

  function openDrawer() {
    if (!drawer) return;
    lastFocus = doc.activeElement;
    drawer.classList.add('is-open');
    drawer.removeAttribute('aria-hidden');
    drawerToggle.setAttribute('aria-expanded', 'true');
    doc.body.classList.add('no-scroll');
    var close = $('.drawer__close', drawer);
    window.setTimeout(function () { close.focus(); }, 30);
  }

  function closeDrawer(restoreFocus) {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawerToggle.setAttribute('aria-expanded', 'false');
    doc.body.classList.remove('no-scroll');
    if (restoreFocus !== false) (lastFocus || drawerToggle).focus();
  }

  if (drawer && drawerToggle) {
    drawerToggle.addEventListener('click', function () {
      if (drawer.classList.contains('is-open')) closeDrawer(); else openDrawer();
    });
    $$('[data-drawer-close]', drawer).forEach(function (btn) { btn.addEventListener('click', function () { closeDrawer(); }); });
    $$('a[href]', drawer).forEach(function (a) {
      a.addEventListener('click', function () { closeDrawer(false); });
    });

    drawer.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var items = focusables($('.drawer__panel', drawer));
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    $$('[data-acc]', drawer).forEach(function (btn) {
      var panel = doc.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.hidden = open;
      });
    });

    // Close the drawer if the viewport grows into the desktop layout.
    var desktop = window.matchMedia('(min-width: 1100px)');
    var onDesktop = function () { if (desktop.matches) closeDrawer(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onDesktop);
  }

  /* Escape closes whichever layer is open */
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (drawer && drawer.classList.contains('is-open')) { closeDrawer(); return; }
    if (openTrigger) { var t = openTrigger; closeMega(t); t.focus(); }
  });

  /* ------------------------------------------------------------------
     Tabs (audience switcher, lifecycle diagram)
     Markup ships as plain buttons + sections; roles are added here so the
     no-JS version reads as a simple stacked list.
     ------------------------------------------------------------------ */
  $$('[data-tabs]').forEach(function (group) {
    var list = $('[data-tablist]', group);
    var tabs = $$('[data-tab]', group);
    var panels = tabs.map(function (t) { return doc.getElementById(t.getAttribute('aria-controls')); });
    if (!list || !tabs.length) return;

    list.setAttribute('role', 'tablist');
    if (list.dataset.label) list.setAttribute('aria-label', list.dataset.label);
    if (list.dataset.orientation) list.setAttribute('aria-orientation', list.dataset.orientation);

    function select(index, focus, animate) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
        if (on && animate && !reducedMotion.matches) {
          panels[i].removeAttribute('data-animate');
          void panels[i].offsetWidth; // restart the entry animation
          panels[i].setAttribute('data-animate', '');
        }
      });
      group.setAttribute('data-active', String(index));
      if (focus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.setAttribute('role', 'tab');
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('tabindex', '0');
      panels[i].setAttribute('aria-labelledby', tab.id);

      tab.addEventListener('click', function () { select(i, false, true); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        switch (e.key) {
          case 'ArrowRight': case 'ArrowDown': next = (i + 1) % tabs.length; break;
          case 'ArrowLeft': case 'ArrowUp': next = (i - 1 + tabs.length) % tabs.length; break;
          case 'Home': next = 0; break;
          case 'End': next = tabs.length - 1; break;
        }
        if (next !== null) { e.preventDefault(); select(next, true, true); }
      });
    });

    var initial = Math.max(0, tabs.findIndex(function (t) { return t.hasAttribute('data-default'); }));
    select(initial, false, false);
  });

  /* ------------------------------------------------------------------
     Reveal on scroll — content is visible by default; hidden only once
     this script runs, and never under reduced motion.
     ------------------------------------------------------------------ */
  var reveals = $$('[data-reveal]');
  if (reveals.length) {
    if (!('IntersectionObserver' in window) || reducedMotion.matches) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      root.classList.add('reveal-on');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ------------------------------------------------------------------
     Enquiry form: inline validation, error summary, then either POST to a
     configured endpoint (form action starting with http) or compose a
     pre-filled email to the office address.
     ------------------------------------------------------------------ */
  var form = $('[data-enquiry-form]');
  if (form) initForm(form);

  function initForm(form) {
    form.setAttribute('novalidate', '');
    var summary = $('[data-error-summary]', form);
    var summaryList = $('ul', summary);
    var statusOk = doc.getElementById('form-status-ok');
    var statusMail = doc.getElementById('form-status-mail');
    var statusFail = doc.getElementById('form-status-fail');
    var submitBtn = $('[type="submit"]', form);
    var attempted = false;

    var rules = {
      name: { test: function (v) { return v.trim().length >= 2; }, msg: 'Enter your name.' },
      email: {
        test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
        msg: function (v) { return v.trim() ? 'Enter an email address in the format name@example.com.' : 'Enter your email address.'; }
      },
      role: { test: function (v) { return !!v; }, msg: 'Select the option that best describes you.' },
      property_type: { test: function (v) { return !!v; }, msg: 'Select the type of property.' },
      message: { test: function (v) { return v.trim().length >= 15; }, msg: function (v) { return v.trim() ? 'Add a little more detail — a sentence or two is enough.' : 'Tell us briefly what the property needs.'; } }
    };

    function fieldEl(name) { return form.elements[name]; }
    function wrapperOf(el) { return el.closest('.field'); }

    function setError(name, message) {
      var el = fieldEl(name);
      var wrap = wrapperOf(el);
      var err = $('.field__error', wrap);
      if (message) {
        wrap.classList.add('has-error');
        el.setAttribute('aria-invalid', 'true');
        $('[data-msg]', err).textContent = message;
      } else {
        wrap.classList.remove('has-error');
        el.removeAttribute('aria-invalid');
        $('[data-msg]', err).textContent = '';
      }
    }

    function check(name) {
      var rule = rules[name];
      var value = fieldEl(name).value || '';
      if (rule.optional && !value.trim()) { setError(name, ''); return null; }
      if (rule.test(value)) { setError(name, ''); return null; }
      var msg = typeof rule.msg === 'function' ? rule.msg(value) : rule.msg;
      setError(name, msg);
      return msg;
    }

    Object.keys(rules).forEach(function (name) {
      var el = fieldEl(name);
      if (!el) return;
      el.addEventListener('blur', function () {
        if (attempted || (el.value && el.value.trim())) check(name);
      });
      el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', function () {
        if (wrapperOf(el).classList.contains('has-error')) check(name);
      });
    });

    function showSummary(errors) {
      summaryList.innerHTML = '';
      errors.forEach(function (e) {
        var li = doc.createElement('li');
        var a = doc.createElement('a');
        a.href = '#' + fieldEl(e.name).id;
        a.textContent = e.msg;
        a.addEventListener('click', function (ev) { ev.preventDefault(); fieldEl(e.name).focus(); });
        li.appendChild(a);
        summaryList.appendChild(li);
      });
      summary.hidden = false;
      summary.focus();
    }

    function collect() {
      var fd = new FormData(form);
      var services = fd.getAll('services');
      return {
        name: (fd.get('name') || '').trim(),
        email: (fd.get('email') || '').trim(),
        role: fd.get('role') || '',
        property_type: fd.get('property_type') || '',
        units: fd.get('units') || '',
        location: (fd.get('location') || '').trim(),
        services: services,
        next_step: fd.get('next_step') || '',
        message: (fd.get('message') || '').trim()
      };
    }

    function mailtoHref(d) {
      var to = form.getAttribute('data-mailto');
      var subject = 'Property enquiry: ' + d.role + ', ' + d.property_type.toLowerCase();
      var lines = [
        'Enquiry sent from the Khan Property Services website',
        '----------------------------------------------',
        'Name: ' + d.name,
        'Email: ' + d.email,
        '',
        'Role: ' + d.role,
        'Property type: ' + d.property_type,
        'Number of units: ' + (d.units || 'Not given'),
        'Property location: ' + (d.location || 'Not given'),
        'Services: ' + (d.services.length ? d.services.join(', ') : 'Not specified'),
        'Preferred next step: ' + (d.next_step || 'No preference'),
        '',
        'Message:',
        d.message
      ];
      return 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\r\n'));
    }

    function show(panel) {
      [statusOk, statusMail, statusFail].forEach(function (p) { if (p) p.hidden = p !== panel; });
      if (panel !== statusFail) form.hidden = true;
      var h = $('h2', panel);
      h.setAttribute('tabindex', '-1');
      h.focus();
      panel.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }

    $$('[data-form-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        [statusOk, statusMail, statusFail].forEach(function (p) { if (p) p.hidden = true; });
        form.hidden = false;
        fieldEl('name').focus();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      attempted = true;
      var errors = [];
      Object.keys(rules).forEach(function (name) {
        var msg = check(name);
        if (msg) errors.push({ name: name, msg: msg });
      });
      if (errors.length) { showSummary(errors); return; }
      summary.hidden = true;

      if (form.elements._gotcha && form.elements._gotcha.value) return; // likely automated

      var data = collect();
      var action = form.getAttribute('action') || '';

      if (/^https?:\/\//i.test(action)) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        var label = $('[data-label]', submitBtn);
        var original = label.textContent;
        label.textContent = 'Sending…';
        fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            form.reset();
            show(statusOk);
          })
          .catch(function () { show(statusFail); })
          .then(function () {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            label.textContent = original;
          });
      } else {
        window.KPS.navigate(mailtoHref(data));
        show(statusMail);
      }
    });
  }
})();
