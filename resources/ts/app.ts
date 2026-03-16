// @ts-nocheck //

import "../css/app.css"
import Swal from "sweetalert2";

import $ from "jquery";


$(document).ready(function() {

    const message = $("#message").val();
    if (message) {
        Swal.fire({
            title: "Thank you for your application!",
            text: message,
            icon: "success",
        });
    }

});