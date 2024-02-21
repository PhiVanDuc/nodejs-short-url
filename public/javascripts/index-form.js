const checkbox_custom_id = document.querySelector('#custom-id');
const toggle = document.querySelector(".toggle");
const label = toggle.querySelector('label');
const input_custom_id = toggle.querySelector('#input-custom-id');
let checked = false;

checkbox_custom_id.addEventListener("input", function(event) {
    checked = event.target.checked;

    if (checked) {
        toggle.style.display = "block";
        input_custom_id.style.paddingLeft = label.offsetWidth + 12 + "px";
        input_custom_id.disabled = false;
    } else {
        toggle.style.display = "none";
        input_custom_id.disabled = true;
    }
});