export function getUrl() {
  return new URLSearchParams(window.location.search).get("url");
}
