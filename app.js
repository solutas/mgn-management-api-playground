(async function () {
const url =    "http://localhost:8080/magnoliaAuthor/.rest/nodes/v1/tours/magnolia-travels?includeMetadata=true&depth=1";
//const url = "http://localhost:8080/magnoliaAuthor/.rest/nodes/v1/website/react-minimal";
/*

fetch("http://localhost:8080/magnoliaAuthor/.rest/nodes/v1/website/react-minimal", { headers: new Headers({ Authenticate: "Basic 1c2VyOnN1cGVydXNlcg=="})})*/

  let title = document.getElementsByClassName("title")[0];
  setTitle("Mangament API");

  const loginButton = document.getElementById("loginButton");
  const toolbar = document.getElementById("toolbar");

  function setTitle(text) {
    title.innerHTML = text;
  }

  function showLoginDialog(error) {
    if (error) {
      setTitle(error);
      toolbar.classList.toggle("error");
    }

    let element = document.getElementById("login");
    element.classList.toggle("show");

    loginButton.addEventListener("click", () => {
      element.classList.toggle("show");
    });
  }

  async function getTours() {
    let response = await fetch(url, {
      credentials: "include",
      headers: new Headers({
        Authenticate: "Basic " +  Buffer.from('superuser:superuser').toString('base64'),
      }),
    });

    if (response.status == 401) {
      console.log(response);
      throw Error("Authentication Required");
    }
    let data = await response.json();
    return data;
  }

  try {
    let data = await getTours();
    title.innerHTML = " Authentication required";

    title.innerHTML = title.innerHTML + " (" + data.nodes.length + ")";
  } catch (e) {
    showLoginDialog(e);
  }
})();
