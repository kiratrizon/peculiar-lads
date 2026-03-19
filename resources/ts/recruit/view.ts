import $ from "jquery";
import Swal from "sweetalert2";

$(document).ready(async function () {
    const button = $(`button[id^="invite_"]`);
    button.click(async function () {
        button.attr("disabled", true);
        const id = $(this).attr("id")?.split("_")[1];

        const csrfToken = $("#csrf_token").val();

        const response = await fetch(`/admin/recruits/${id}/invite`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
                "Accept": "application/json",
            },
            body: JSON.stringify({
                _token: csrfToken,
            }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            Swal.fire({
                title: "Success",
                text: data.message,
                icon: "success",
                showConfirmButton: true,
                confirmButtonText: "OK",
            }).then((result) => {
                if (result.isConfirmed) {
                    globalThis.location.reload();
                }
            });
        } else {
            await Swal.fire({
                title: "Error",
                text: data.message,
                icon: "error",
                timer: 1500,
            });
        }
        button.attr("disabled", false);
    });

    const copyButton = $("#copy_invitation_link");

    copyButton.click(async function () {
        const value = $(this).val();
        // disable button
        $(this).attr("disabled", true);
        if (value) {
            navigator.clipboard.writeText(value);

            // change inner html to <i class="fa-solid fa-check"></i>
            $(this).html('<i class="fa-solid fa-check"></i>');
            setTimeout(() => {
                $(this).attr("disabled", false);
                $(this).html('<i class="fa-solid fa-copy"></i>');
            }, 3000);
        }
    });


    $(`button[id^="verify_"]`).click(async function () {
        const spinnerHtml = `<span class="px-5 py-2 rounded-lg bg-gray-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Verifying...
                </span>`;

        const verifiedHtml = `<span class="px-5 py-2 rounded-lg bg-green-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-circle-check"></i>
                    Verified
                </span>`;
        const notVerifiedHtml = `<button class="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-500/80 transition text-white font-semibold flex items-center gap-2" id="verify_{{ $recruit.ign }}">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    Verify
                </button>`;
        const blocklistedHtml = `<span class="px-5 py-2 rounded-lg bg-red-500 text-white font-semibold flex items-center gap-2">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    Blocklisted
                </span>`;
        $(`#verify_indicator`).html(spinnerHtml);
        const id = $(this).attr("id")?.split("_")[1];
        const csrfToken = $("#csrf_token").val();
        const response = await fetch(`/admin/recruits/${id}/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
                "Accept": "application/json",
            },
            body: JSON.stringify({
                _token: csrfToken,
            }),
        });
        const data = await response.json();
        if (response.ok) {
            if (data.verified === 1) {
                $(`#verify_indicator`).html(verifiedHtml);
            } else if (data.verified === 2) {
                $(`#verify_indicator`).html(blocklistedHtml);
            }
        } else {
            $(`#verify_indicator`).html(notVerifiedHtml);
        }
    });
});