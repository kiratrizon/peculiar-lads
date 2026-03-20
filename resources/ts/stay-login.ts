import $ from "jquery";
import Swal from "sweetalert2";

$(document).ready(function () {
    Swal.fire({
        title: "Stay Login",
        text: "You are logged in. Would you like to stay logged in?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Stay Logged In",
        cancelButtonText: "Logout",
    }).then((result) => {
        if (result.isConfirmed) {
            // stay logged in
            window.location.href = "/home";
        } else {
            // logout
            window.location.href = "/logout";
        }
    });
});