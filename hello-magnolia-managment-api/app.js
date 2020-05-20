const AppHelper = require("./helper");

const app = async function () {
  const ROOT_URL = "http://localhost:8080/magnoliaAuthor/.rest/";

  const toursApp = new AppHelper(
    `${ROOT_URL}delivery/tours`,
    `${ROOT_URL}nodes/v1/tours`
  );

  toursApp.on("removed-from-featured", async (item) => {
    // Tutorial: add code to change isFeature flag to false for given item
    const URL = `${ROOT_URL}nodes/v1/tours${item["@path"]}`;

    let data = {
      properties: [
        {
          name: "isFeatured",
          type: "Boolean",
          values: [false],
        },
      ],
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
    if (response.status === 200) {
      toursApp.notify(
        "Tours Updated",
        `Removed ${item.name} from Featured Tours`
      );
    } else {
      toursApp.notify(
        "Tours Not Updated:" + response.status,
        `Could not update ${item.name} from Featured Tours`
      );
    }
    // end tutorial
  });

  toursApp.on("added-to-featured", async (item) => {
    // Tutorial: add code to change isFeature flag to true for given item
    const URL = `${ROOT_URL}nodes/v1/tours${item["@path"]}`;

    let data = {
      properties: [
        {
          name: "isFeatured",
          type: "Boolean",
          values: [true],
        },
      ],
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
    if (response.status === 200) {
      toursApp.notify(
        "Tours Updated",
        `Added ${item.name} to Featured Tours List`
      );
    } else {
      toursApp.notify(
        "Tours Not Updated:" + response.status,
        `Could not add ${item.name} to Featured Tours List`
      );
    }
    // end tutorial
  });
};

document.addEventListener("DOMContentLoaded", app);
