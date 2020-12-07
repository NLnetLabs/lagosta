export const LOCALSTORAGE_NAME = "krill_user";

export function authHeader() {
  let user = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME));
  let headers = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  if (user && user.authdata) {
    headers["Authorization"] = "Bearer " + user.authdata;
  }
  return headers;
}
