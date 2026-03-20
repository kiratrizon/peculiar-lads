// @ts-nocheck //
import $ from "jquery";
import Swal from "sweetalert2";

$(document).ready(function () {

    const message = $("#message").val();
    if (message) {
        Swal.fire({
            title: "Thank you for your application!",
            text: message,
            icon: "success",
        });
    }

    const globalError = $("#globalError").val();
    if (globalError) {
        Swal.fire({
            title: "Error",
            text: globalError,
            icon: "error",
        });
    }

});