import $ from "jquery";

$(document).ready(() => {
  const langSelect = $("#langSelect");
  langSelect.on("change", () => {
    // disable first
    langSelect.prop("disabled", true);
    const selectedLang = langSelect.val();
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    const routeLang = $('meta[name="language"]').attr("content") ?? "off";
    // get the value of this <html lang="{{ request().getLanguage() }}">
    if (selectedLang) {
      $.ajax({
        url: "/setup-lang",
        method: "post",
        data: { lang: selectedLang, route_lang: routeLang },
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
        },
        success: (data) => {
          if (data.redirect_url) {
            window.location.href = data.redirect_url;
          } else {
            window.location.href = window.location.href;
          }
        },
        error: (xhr, status, error) => {
          window.location.href = window.location.href;
        },
      });
    }
  });
});
