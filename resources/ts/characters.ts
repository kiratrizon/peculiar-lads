import $ from "jquery";

$(document).ready(async function () {
  const srchbtn = $('#search-button');

  srchbtn.click(function(){
    const pathname = window.location.pathname;
    window.location.href = `${pathname}?search_ign=${$('#search_ign').val()}`
  })
});
