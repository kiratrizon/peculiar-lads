import $ from "jquery";

$(document).ready(function () {
  const srchbtn = $("#search-button");

  srchbtn.click(function () {
    const pathname = globalThis.location.pathname;
    globalThis.location.href = `${pathname}?search_ign=${$("#search_ign").val()}`;
  });
});
