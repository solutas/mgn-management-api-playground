const EventEmitter = require("events");

module.exports = class MagnoliaApp extends EventEmitter {
  constructor(
    listToursApi = "http://localhost:8080/magnoliaAuthor/.rest/delivery/tours"
  ) {
    super();
    let initalTitle = "Mangament API";
    this.listToursApi = listToursApi;
    this.titleElement = document.getElementsByClassName("title")[0];
    this.toolbarElement = document.getElementById("toolbar");
    this.formElement = document.getElementById("loginForm");
    this.userNameField = document.getElementById("username");
    this.passwordField = document.getElementById("password");
    this.dialogElement = document.getElementById("login");
    this.tourListContainerElement = document.getElementById(
      "toursListContainer"
    );
    this.countFeaturedToursElement = document.getElementById(
      "count-featured-tours"
    );
    this.credentials = {
      token: localStorage.getItem("token"),
    };
    this.updateView = this.updateView.bind(this);
    this.getTours = this.getTours.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.updateTitle = this.updateTitle.bind(this);
    this.setTitle = this.setTitle.bind(this);
    this.init = this.init.bind(this);
    this.showLoginDialog = this.showLoginDialog.bind(this);
    this.toggleLoginDialog = this.toggleLoginDialog.bind(this);
    this.isInitialized = this.isInitialized.bind(this);
    this.setInitialized = this.setInitialized.bind(this);
    this.statusInit = false;
    this.tours = [];

    this.selected = [];
    this.featured = [];
    this.original = [];

    this.setTitle(initalTitle);
    this.init();
    this.getTours().catch((e) => {
      this.showLoginDialog(e);
    });

    this.on("newdata", (newdata) => {
      if (newdata.length !== this.original.length) {
        this.original = newdata.sort(this.sortByCreatedDate);

        this.tours = this.original.filter(
          (item) => !item.isFeatured && item.isFeatured !== "true"
        );

        this.featured = this.original.filter(
          (item) => item.isFeatured && item.isFeatured === "true"
        );

        if (!this.isInitialized()) {
          this.setInitialized(true);
          console.log("init call");
          let myNotification = new Notification("Tours are loaded", {
            body:
              this.featured.length +
              " Featured and " +
              this.tours.length +
              " Tours were loaded",
          });

          myNotification.onclick = () => {
            console.log("Notification clicked");
          };
        } else {
          let myNotification = new Notification("new tour added", {
            body: this.original[0].name,
          });

          myNotification.onclick = () => {
            console.log("Notification clicked");
          };
          console.log("send notification");
        }

        this.emit("dataupdate");
      }
    });
    this.on("dataupdate", this.updateView);
  }


  getCredentials() {
    return this.credentials.token;
  }

  setInitialized(value = false) {
    this.statusInit = value;
  }

  isInitialized() {
    return this.statusInit;
  }

  init() {
    document
      .getElementById("tours-featured-drops")
      .addEventListener("drop", (e) => {
        let id = e.dataTransfer.getData("id");
        if (!this.featured.find((item) => item["@id"] == id)) {
          this.tours = this.tours.filter((item) => {
            return item["@id"] !== id;
          });

          let obj = this.original.find((item) => item["@id"] == id);
          if (obj) {
            this.featured.push(obj);
            this.emit("added-to-featured", obj);
          }

          this.emit("dataupdate");
        }
      });
    document
      .getElementById("tours-featured-drops")
      .addEventListener("dragover", (e) => {
        e.dataTransfer.dropEffect = "move";
        e.preventDefault();
      });

    document
      .getElementById("toursListContainer")
      .addEventListener("drop", (e) => {
        let id = e.dataTransfer.getData("id");

        if (!this.tours.find((item) => item["@id"] == id)) {
          this.featured = this.featured.filter((item) => {
            return item["@id"] !== id;
          });

          let obj = this.original.find((item) => item["@id"] == id);
          if (obj) {
            this.tours.push(obj);
            this.emit("removed-from-featured", obj);
          }

          this.emit("dataupdate");
        }
      });
    document
      .getElementById("toursListContainer")
      .addEventListener("dragover", (e) => {
        e.dataTransfer.dropEffect = "move";
        e.preventDefault();
      });

    const { setInterval } = require("electron").remote.require("timers");

    setInterval(() => this.getTours(), 10000);
  }

  setTitle(title) {
    this.title = title;
    let partone =
      this.original.length > 0
        ? " - " + this.original.length + " Tours Found"
        : "";

    let parttwo =
      this.selected.length > 0
        ? " (" + this.selected.length + " Selected)"
        : "";

    this.titleElement.innerHTML = title + partone + parttwo;
  }

  updateTitle() {
    this.setTitle(this.title);
  }

  sortByCreatedDate(a, b) {
    let date1 = Date.parse(b["mgnl:created"]);
    let date2 = Date.parse(a["mgnl:created"]);
    return date1 - date2;
  }

  toggleLoginDialog() {
    this.dialogElement.classList.toggle("show");
  }

  updateApp() {}

  /**
   * initially show login dialog or in case of any errors
   * @param {*} error
   */
  showLoginDialog(error) {
    this.toggleLoginDialog();

    if (error) {
      this.setTitle(error);
      this.toolbarElement.classList.toggle("error");
    }
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      let username = this.userNameField.value;
      let password = this.passwordField.value;
      if (!username || !password) {
        alert("Username and Password are required");
        return;
      }
      this.credentials.token = Buffer.from(`${username}:${password}`).toString(
        "base64"
      );
      localStorage.setItem("token", this.credentials.token);

      this.toolbarElement.classList.toggle("error");
      this.toggleDialog();
      this.emit("dataupdate");
    });
  }

  async getTours() {
    if (!this.credentials.token) {
      throw Error("Please login first");
    }

    let response = await fetch(this.listToursApi, {
      mode: "cors",
      redirect: "follow",
      credentials: "include",
      headers: new Headers({
        Authorization: "Basic " + this.credentials.token,
        "User-Agent": "Magnolia-Mangement-Demo-App",
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
    });

    if (response.status == 401) {
      throw Error("Authentication Required");
    }
    let data = await response.json();

    this.emit("newdata", data.results);
  }

  renderItem(item) {
    const status =
      this.selected.indexOf(item["@id"]) === -1 ? "inactive" : "active";

    return `<div class='tour tour--${status}' draggable="true" data-id='${item["@id"]}'>
            <div class='tour__checkbox tour__checkbox--${status}'></div>
            <div class='tour__body'><h1>${item["name"]}</h1></div>
            </div>`;
  }

  updateView() {
    this.updateTitle();
    this.tourListContainerElement.innerHTML = this.tours
      .sort(this.sortByCreatedDate)
      .map(this.renderItem)
      .join("");

    document.getElementById(
      "tours-featured-drops"
    ).innerHTML = this.featured
      .sort(this.sortByCreatedDate)
      .map(this.renderItem)
      .join("");

    this.countFeaturedToursElement.innerHTML = this.featured.length;
    this.updateTitle();

    [...document.getElementsByClassName("tour")].forEach((touritem) => {
      touritem.addEventListener("click", (el) => {
        el.preventDefault();
        el.stopPropagation();
        if (this.selected.indexOf(touritem.dataset.id) === -1) {
          this.selected.push(touritem.dataset.id);
        } else {
          this.selected = this.selected.filter(
            (item) => item !== touritem.dataset.id
          );
        }
        this.emit("dataupdate");
      });

      touritem.addEventListener(
        "dragstart",
        (e) => {
          e.dataTransfer.setData("id", touritem.dataset.id);
        },
        false
      );
    });
  }
};
