import $ from "jquery";

$(document).ready(async function () {
    const table = $("#recruits-table-body");

    const response = await fetch("/admin/get-recruits", {
        headers: {
            Accept: "application/json",
        },
    });

    const data = await response.json();

    console.log(data);
});