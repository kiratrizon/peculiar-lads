import $ from "jquery";

$(document).ready(async function () {
  const srchbtn = $("#search-button");

  srchbtn.click(function () {
    const pathname = window.location.pathname;
    const name = $("#search_name").val() || "";
    const discord = $("#search_discord").val() || "";
    window.location.href = `${pathname}?name=${name}&discord=${discord}`;
  });
});
