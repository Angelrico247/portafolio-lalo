(function () {
    "use strict";

    // Aparición suave de cada bloque al entrar en pantalla.
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add("in"); });
    }

    // Píldora activa del menú según la sección visible.
    var links = Array.prototype.slice.call(document.querySelectorAll(".topnav__pills a"));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    if ("IntersectionObserver" in window) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) {
                    var on = a.getAttribute("href") === "#" + entry.target.id;
                    a.classList.toggle("is-active", on);
                    if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
                });
            });
        }, { rootMargin: "-40% 0px -55% 0px" });
        sections.forEach(function (s) { if (s) spy.observe(s); });
    }

    // Visor de proyectos (<dialog> nativo: Escape, foco y fondo ya vienen resueltos).
    var viewer = document.getElementById("viewer");
    var viewerImg = document.getElementById("viewerImg");
    document.querySelectorAll(".work").forEach(function (btn) {
        btn.setAttribute("aria-haspopup", "dialog");
        btn.addEventListener("click", function () {
            viewerImg.src = btn.dataset.img;
            viewerImg.alt = btn.dataset.title;
            document.getElementById("viewerTitle").textContent = btn.dataset.title;
            document.getElementById("viewerTag").textContent = btn.dataset.tag;
            viewer.showModal();
        });
    });
    viewer.addEventListener("click", function (e) { if (e.target === viewer) viewer.close(); });

    // Testimonios: flechas que avanzan una tarjeta.
    var slider = document.getElementById("slider");
    function step(dir) {
        var card = slider.querySelector(".quote");
        slider.scrollBy({ left: dir * (card.offsetWidth + 22), behavior: "smooth" });
    }
    document.getElementById("prev").addEventListener("click", function () { step(-1); });
    document.getElementById("next").addEventListener("click", function () { step(1); });
    slider.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });

    // Formulario de contacto (mismo servicio de correo que antes).
    var form = document.getElementById("contactForm");
    var status = document.getElementById("formStatus");
    var message = document.getElementById("message");
    var counter = document.getElementById("counter");
    var send = document.getElementById("send");
    message.addEventListener("input", function () { counter.textContent = message.value.length + " / 500"; });

    function say(text, kind) {
        status.textContent = text;
        status.className = "form__status " + kind;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var data = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            subject: form.subject.value.trim(),
            message: form.message.value.trim()
        };
        var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
        if (!data.name || !emailOk || !data.subject || !data.message) {
            say("Revisa que tu nombre, correo, asunto y mensaje estén completos.", "is-error");
            return;
        }
        send.disabled = true;
        say("Enviando…", "");
        fetch("https://lalo-contact-api.vercel.app/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(data).toString()
        }).then(function (res) {
            if (!res.ok) throw new Error("request failed");
            form.reset();
            counter.textContent = "0 / 500";
            say("¡Recibimos tu mensaje, te contactaremos pronto!", "is-ok");
        }).catch(function () {
            say("Ocurrió un error al enviar. Por favor intenta de nuevo.", "is-error");
        }).finally(function () { send.disabled = false; });
    });
})();
