const VALID_ACCESSIBILITY_ROLES = new Set([
  "none",
  "button",
  "link",
  "search",
  "image",
  "img",
  "text",
  "adjustable",
  "header",
  "summary",
  "alert",
  "checkbox",
  "combobox",
  "menu",
  "menubar",
  "menuitem",
  "progressbar",
  "radio",
  "radiogroup",
  "scrollbar",
  "spinbutton",
  "switch",
  "tab",
  "tablist",
  "timer",
  "toolbar",
  "grid",
  "list",
  "imagebutton",
  "keyboardkey",
]);

export function safeRole(role) {
  return typeof role === "string" && VALID_ACCESSIBILITY_ROLES.has(role)
    ? role
    : undefined;
}
