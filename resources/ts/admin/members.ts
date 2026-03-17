import $ from "jquery";
import { Grid } from "gridjs";

$(document).ready(async function () {
  const table = $("#table");

  const response = await fetch("/admin/get-members", {
    headers: {
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (response.ok) {
    const grid = new Grid({
      columns: [
        { name: "ID", id: "id" },
        { name: "Name", id: "name" },
        { name: "Email", id: "email" },
        { name: "Main Character", id: "main_character" },
      ],
      data: data.members, // works because we used `id` mapping
      search: true,
      pagination: true,
      sort: true,
    });

    grid.render(table[0]);
  }
});