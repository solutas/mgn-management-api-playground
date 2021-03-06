const AppHelper = require("./helper");

const app = async function () {
  const ROOT_URL = "http://localhost:8080/magnoliaAuthor/.rest/";

  const toursApp = new AppHelper(`${ROOT_URL}delivery/tours`);

  toursApp.on("removed-from-featured", async (item) => {
    console.log("removed from feature");
    console.log(item);
    // Tutorial: add code to change isFeature flag to false for given item
    const URL = `${ROOT_URL}nodes/v1/tours${item["@path"]}`;
    
    let data = {
      "properties": [
        {
          "name": "isFeatured",
          "type": "Boolean",
          "values": [
            false
          ]
        }  
      ]
    };

    let response = await fetch(URL, {
      mode: "cors",
      redirect: "follow",
      credentials: "include",
      method: "post",
      headers: new Headers({
        Authorization: "Basic " + toursApp.getCredentials(),
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });
    // end tutorial
  });

  toursApp.on("added-to-featured", async (item) => {
    console.log("added from feature");
    console.log(item);
    console.log(toursApp.getCredentials());
    // Tutorial: add code to change isFeature flag to true for given item
    const URL = `${ROOT_URL}nodes/v1/tours${item["@path"]}`;

    let data = {
      "properties": [
        {
          "name": "isFeatured",
          "type": "Boolean",
          "values": [
            true
          ]
        }  
      ]
    };

    let response = await fetch(URL, {
      mode: "cors",
      redirect: "follow",
      credentials: "include",
      method: "post",
      headers: new Headers({
        Authorization: "Basic " + toursApp.getCredentials(),
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    });
    // end tutorial
  });
};

document.addEventListener("DOMContentLoaded", app);
