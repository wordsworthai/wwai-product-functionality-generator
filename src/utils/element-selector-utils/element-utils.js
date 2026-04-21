export function disableAutocompleteOnInputs(inputs) {
    if (!inputs || inputs.length === 0) return;

    inputs.forEach(input => {
        if (!input.hasAttribute("autocomplete")) {
        input.setAttribute("autocomplete", "off");
        }
    });
}