// @ts-nocheck //
import $ from "jquery";
import Swal from "sweetalert2";

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