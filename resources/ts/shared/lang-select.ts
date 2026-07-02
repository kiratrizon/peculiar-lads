import $ from "jquery";

$(document).ready(() => {
  const langSelect = $("#langSelect");
  langSelect.on("change", () => {
    const selectedLang = langSelect.val();
    const csrfToken = $('meta[name="csrf-token"]').attr("content");
    if (selectedLang) {
      $.ajax({
        url: "/setup-lang",
        method: "post",
        data: { lang: selectedLang },
        headers: {
          "X-CSRF-TOKEN": csrfToken,
          Accept: "application/json",
        },
        success: (data) => {
          console.log("Language set successfully:", data);
        },
        error: (xhr, status, error) => {
          console.error("Error setting language:", error);
        },
      });
    }
  });
});
