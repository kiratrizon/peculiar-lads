import $ from "jquery";
import Swal from "sweetalert2";

$(document).ready(function () {
  const modal = $("#editModal");
  let activeUpdateUrl = "";

  const openModal = function (button: ReturnType<typeof $>) {
    activeUpdateUrl = button.attr("data-update-url") || "";
    $("#edit_ign").val(button.attr("data-ign") || "");
    $("#edit_third_class_id").val(button.attr("data-third-class-id") || "");
    $("#edit_nstg_level_id").val(button.attr("data-nstg-level-id") || "");
    $("#edit_main").prop("checked", button.attr("data-main") === "true");

    const duration = parseInt(button.attr("data-duration") || "", 10);
    if (isNaN(duration)) {
      $("#edit_duration_minutes").val("");
      $("#edit_duration_seconds").val("");
    } else {
      $("#edit_duration_minutes").val(Math.floor(duration / 60));
      $("#edit_duration_seconds").val(duration % 60);
    }

    modal.removeClass("hidden");
  };

  const closeModal = function () {
    modal.addClass("hidden");
    activeUpdateUrl = "";
  };

  const addModal = $("#addModal");

  const openAddModal = function () {
    $("#add_ign").val("");
    $("#add_nstg_level_id").prop("selectedIndex", 0);
    $("#add_third_class_id").prop("selectedIndex", 0);
    $("#add_main").prop("checked", false);
    $("#add_duration_minutes").val("");
    $("#add_duration_seconds").val("");
    addModal.removeClass("hidden");
  };

  const closeAddModal = function () {
    addModal.addClass("hidden");
  };

  $("#addCharacterBtn").click(function () {
    openAddModal();
  });

  $("#addModalCancel").click(function () {
    closeAddModal();
  });

  $("#addModalSave").click(async function () {
    const saveButton = $(this);
    const storeUrl = saveButton.attr("data-store-url");
    if (!storeUrl) return;

    saveButton.attr("disabled", true);

    const csrfToken = $("#csrf_token").val();

    const response = await fetch(storeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
        Accept: "application/json",
      },
      body: JSON.stringify({
        _token: csrfToken,
        ign: $("#add_ign").val(),
        third_class_id: $("#add_third_class_id").val(),
        nstg_level_id: $("#add_nstg_level_id").val(),
        main: $("#add_main").is(":checked") ? "true" : "false",
        duration_minutes: $("#add_duration_minutes").val(),
        duration_seconds: $("#add_duration_seconds").val(),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      closeAddModal();
      Swal.fire({
        title: "Success",
        text: data.message || $("#save_success_message").val(),
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
        text: data.message || $("#save_error_message").val(),
        icon: "error",
        timer: 1500,
      });
    }

    saveButton.attr("disabled", false);
  });

  $(`button[id^="edit_"]`).click(function () {
    openModal($(this));
  });

  $("#editModalCancel").click(function () {
    closeModal();
  });

  $("#editModalSave").click(async function () {
    if (!activeUpdateUrl) return;

    const saveButton = $(this);
    saveButton.attr("disabled", true);

    const csrfToken = $("#csrf_token").val();

    const response = await fetch(activeUpdateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
        Accept: "application/json",
      },
      body: JSON.stringify({
        _token: csrfToken,
        ign: $("#edit_ign").val(),
        third_class_id: $("#edit_third_class_id").val(),
        nstg_level_id: $("#edit_nstg_level_id").val(),
        main: $("#edit_main").is(":checked") ? "true" : "false",
        duration_minutes: $("#edit_duration_minutes").val(),
        duration_seconds: $("#edit_duration_seconds").val(),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      closeModal();
      Swal.fire({
        title: "Success",
        text: data.message || $("#save_success_message").val(),
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
        text: data.message || $("#save_error_message").val(),
        icon: "error",
        timer: 1500,
      });
    }

    saveButton.attr("disabled", false);
  });

  $(`button[id^="delete_"]`).click(async function () {
    const deleteButton = $(this);
    const deleteUrl = deleteButton.attr("data-delete-url");
    if (!deleteUrl) return;

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: String($("#delete_confirmation_message").val()),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    deleteButton.attr("disabled", true);

    const csrfToken = $("#csrf_token").val();

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken,
        Accept: "application/json",
      },
      body: JSON.stringify({
        _token: csrfToken,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      Swal.fire({
        title: "Success",
        text: data.message || $("#delete_success_message").val(),
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
        text: data.message || $("#delete_error_message").val(),
        icon: "error",
        timer: 1500,
      });
      deleteButton.attr("disabled", false);
    }
  });
});
