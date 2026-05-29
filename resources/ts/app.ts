// @ts-nocheck //

import "../css/app.css"

// add jquery

import $ from "jquery";

$(document).ready(function () {
    const body = $("body");
    const themeToggle = $("#themeToggleGuestDefault");
    themeToggle.click(function () {
        const next = body.attr("data-theme") === "dark" ? "light" : "dark";
        applyTheme(next);
    });
    applyTheme(localStorage.getItem("pecu:theme") || "dark");
    function applyTheme(next: string) {
        const normalized = next === "light" ? "light" : "dark";
        body.attr("data-theme", normalized);
        if (themeToggle) {
            themeToggle.text(normalized === "light" ? "☀️ Light" : "🌙 Dark");
        }
        localStorage.setItem("pecu:theme", normalized);
    }
    applyTheme(localStorage.getItem("pecu:theme") || "dark");
});