console.log("Loading renderer");

var _eventHandlers = {}; // somewhere global

const addListener = (node, event, handler, capture = false) => {
  if (!(event in _eventHandlers)) {
    _eventHandlers[event] = [];
  }
  _eventHandlers[event].push({
    node: node,
    handler: handler,
    capture: capture,
  });
  node.addEventListener(event, handler, capture);
};

const removeAllListeners = (targetNode, event) => {
  _eventHandlers[event]
    .filter(({ node }) => node === targetNode)
    .forEach(({ node, handler, capture }) =>
      node.removeEventListener(event, handler, capture)
    );

  _eventHandlers[event] = _eventHandlers[event].filter(
    ({ node }) => node !== targetNode
  );
};

const checked = document.createElementNS("http://www.w3.org/2000/svg", "svg");
const checkedPath = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);

checked.setAttribute("fill", "currentColor");
checked.setAttribute("viewBox", "0 0 20 20");
checked.setAttribute("xmlns", "http://www.w3.org/2000/svg");

checkedPath.setAttribute("aria-hidden", "true");
checkedPath.setAttribute("fill", "currentColor");
checkedPath.setAttribute("fill-rule", "evenodd");
checkedPath.setAttribute(
  "d",
  "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
);
checkedPath.setAttribute("clip-rule", "evenodd");
checked.classList.add("w-4");
checked.classList.add("h-4");
checked.classList.add("mr-2");
checked.classList.add("sm:w-5");
checked.classList.add("sm:h-5");

checked.appendChild(checkedPath);

document.addEventListener("DOMContentLoaded", async () => {
  let safeState = 0;
  const statusLogin = document.getElementById("screenStatusLogin");
  const statusVersion = document.getElementById("screenStatusVersion");
  const statusRun = document.getElementById("screenStatusRun");

  statusLogin.addEventListener("click", () => {
    if (safeState > 1) {
      switchView(currentView, "#welcome");
      if (safeState > 2) {
        statusVersion.childNodes[1].firstChild.remove();
      }
      setScreensState("login");
      statusLogin.childNodes[1].firstChild.remove();
    }
  });
  statusVersion.addEventListener("click", () => {
    if (safeState > 2) {
      switchView(currentView, "#versions");
      statusLogin.childNodes[1].firstChild.remove();
      setScreensState("version");
      statusVersion.childNodes[1].firstChild.remove();
    }
  });

  const setScreensState = (screen) => {
    switch (screen) {
      case "login":
        safeState = 1;
        statusLogin.classList.add("text-[#865DFF]");
        statusVersion.classList.remove("text-[#865DFF]");
        statusRun.classList.remove("text-[#865DFF]");
        break;
      case "version":
        safeState = 2;
        statusLogin.classList.remove("text-[#865DFF]");
        statusVersion.classList.add("text-[#865DFF]");
        statusRun.classList.remove("text-[#865DFF]");
        statusLogin.childNodes[1].prepend(checked.cloneNode(true));
        break;
      case "run":
        safeState = 3;
        statusLogin.classList.remove("text-[#865DFF]");
        statusVersion.classList.remove("text-[#865DFF]");
        statusRun.classList.add("text-[#865DFF]");
        statusVersion.childNodes[1].prepend(checked.cloneNode(true));
        break;
    }
  };

  switchView("#welcome", "#welcome");
  setScreensState("login");

  const runClientButton = document.getElementById("runClient");
  const openLoginMS = document.getElementById("openLoginMS");
  const accountsList = document.getElementById("accountsList");
  const dropdownAccountButton = document.getElementById(
    "dropdownAccountButton"
  );
  const versionsList = document.getElementById("versionsList");
  const dropdownVersionButton = document.getElementById(
    "dropdownVersionButton"
  );

  dropdownAccountButton.addEventListener("click", async () => {
    accountsList.innerHTML = "";
    // console.log(await window.electron.getAccounts());
    await window.electron.getAccounts().accounts.forEach((account) => {
      const li = document.createElement("li");
      li.innerHTML = `<a id="selectAccountTrigger" data-mc-uuid="${account.uuid}" class="block cursor-pointer font-bold px-4 py-2 select-text hover:bg-[#865DFF] dark:hover:text-white hover:transition-all transition-all duration-300"> ${account.displayName}</a>`;
      accountsList.appendChild(li);
    });

    const selectAccountTriggers = document.querySelectorAll(
      "#selectAccountTrigger"
    );
    selectAccountTriggers.forEach((selectAccountTrigger) => {
      selectAccountTrigger.addEventListener("click", () => {
        window.electron.selectAccount(selectAccountTrigger.dataset.mcUuid);
        switchView(currentView, "#versions");
        setScreensState("version");
      });
    });
  });

  dropdownVersionButton.addEventListener("click", async () => {
    versionsList.innerHTML = "";
    // console.log(await window.electron.getLastVersions());
    await window.electron.getLastVersions().forEach((version) => {
      const li = document.createElement("li");
      li.innerHTML = `<a id="selectVerionTrigger" data-mc-uuid="${version}" class="block font-bold px-4 py-2 select-text hover:bg-[#865DFF] dark:hover:text-white hover:transition-all transition-all duration-300"> ${version}</a>`;
      versionsList.appendChild(li);
    });

    const selectVersionTriggers = document.querySelectorAll(
      "#selectVerionTrigger"
    );
    selectVersionTriggers.forEach((selectVersionTrigger) => {
      selectVersionTrigger.addEventListener("click", () => {
        window.electron.selectVersion(selectVersionTrigger.dataset.mcUuid);
        switchView(currentView, "#run");
        setScreensState("run");
        const summary = window.electron.getSummary();
        document.getElementById(
          "dynamicVersion"
        ).innerText = `Uruchom ${summary.versionNameSelected}`;
        document.getElementById(
          "dynamicPlayer"
        ).innerText = `Uruchamiasz grę jako ${summary.accountObjSelected.displayName}`;
      });
    });
  });

  openLoginMS.addEventListener("click", () => {
    window.electron.openLoginMS();
  });

  runClientButton.addEventListener("click", () => {
    window.electron.runClient();
    statusRun.prepend(checked.cloneNode(true));
  });

  const openVersionModalButton = document.getElementById(
    "openVersionModalButton"
  );
  const firstTable = document.getElementById("firstTable");
  const secondTable = document.getElementById("secondTable");
  const installedCategoryButton = document.getElementById("instCategoryButton"),
    releaseCategoryButton = document.getElementById("releaseCategoryButton"),
    snapshotCategoryButton = document.getElementById("snapshotCategoryButton"),
    alphaCategoryButton = document.getElementById("alphaCategoryButton"),
    fabricCategoryButton = document.getElementById("fabricCategoryButton"),
    forgeCategoryButton = document.getElementById("forgeCategoryButton"),
    optifineCategoryButton = document.getElementById("optifineCategoryButton");

  openVersionModalButton.addEventListener("click", () => {
    changeFirstTable("installed");
  });
  installedCategoryButton.addEventListener("click", () => {
    changeFirstTable("installed");
  });
  releaseCategoryButton.addEventListener("click", () => {
    changeFirstTable("release");
  });
  snapshotCategoryButton.addEventListener("click", () => {
    changeFirstTable("snapshot");
  });
  alphaCategoryButton.addEventListener("click", () => {
    changeFirstTable("alpha");
  });
  fabricCategoryButton.addEventListener("click", () => {
    changeFirstTable("fabric");
  });
  forgeCategoryButton.addEventListener("click", () => {
    changeFirstTable("forge");
  });
  optifineCategoryButton.addEventListener("click", () => {
    changeFirstTable("optifine");
  });

  const addFirstTableVersion = (version, final = false) => {
    const button = document.createElement("button");
    firstTable.style.display = "block";
    button.className =
      "relative inline-flex items-center w-full px-4 py-2 text-sm first:rounded-t-lg last:rounded-b-lg font-medium border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-[#E384FF] dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white";
    button.innerText = `${version}`;
    if (final) {
      button.dataset.version = version;
      button.id = "finalVersionTrigger";
    } else {
      button.dataset.preVersion = version;
      button.id = "secondTableTrigger";
    }
    firstTable.appendChild(button);
  };

  const clearFirstTable = () => {
    firstTable.style.display = "none";
    firstTable.innerHTML = "";
  };

  const addSecondTableVersion = (version) => {
    const button = document.createElement("button");
    secondTable.style.display = "block";
    button.className =
      "relative inline-flex items-center w-full px-4 py-2 text-sm font-medium first:rounded-t-lg last:rounded-b-lg border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-[#E384FF] dark:border-gray-600 dark:hover:bg-gray-600 dark:hover:text-white dark:focus:ring-gray-500 dark:focus:text-white";
    button.innerText = `${version}`;
    button.dataset.version = version;
    button.id = "finalVersionTrigger";
    secondTable.appendChild(button);
  };

  const clearSecondTable = () => {
    secondTable.style.display = "none";
    secondTable.innerHTML = "";
  };

  const changeFirstTable = (category) => {
    switch (category) {
      case "installed":
        console.log("installed");
        clearFirstTable();
        clearSecondTable();
        window.electron.getInstalledVersions().forEach((version) => {
          addFirstTableVersion(version, true);
        });
        refreshSelectVersionTriggers();
        break;
      case "release":
        clearFirstTable();
        clearSecondTable();
        window.electron.getVersionsByType("release").forEach((version) => {
          addFirstTableVersion(version[version.length - 1]);
          version.forEach((test) => {
            console.log(version[version.length - 1], test);
          });
          document
            .querySelectorAll("#secondTableTrigger")
            .forEach((trigger) => {
              trigger.addEventListener("click", () => {
                (async () => {
                  clearSecondTable();
                  setTimeout(() => {
                    version.forEach((subVer) => {
                      if (
                        version[version.length - 1].includes(
                          trigger.dataset.preVersion
                        )
                      ) {
                        addSecondTableVersion(subVer);
                      }
                    });
                    refreshSelectVersionTriggers();
                  }, 100);
                })();
              });
            });
        });
        refreshSelectVersionTriggers();
        break;
      case "snapshot":
        console.log("snapshot");
        clearFirstTable();
        clearSecondTable();
        refreshSelectVersionTriggers();
        break;
      case "alpha":
        console.log("alpha");
        clearFirstTable();
        clearSecondTable();
        refreshSelectVersionTriggers();
        break;
      case "fabric":
        console.log("fabric");
        clearFirstTable();
        clearSecondTable();
        refreshSelectVersionTriggers();
        break;
      case "forge":
        console.log("forge");
        clearFirstTable();
        clearSecondTable();
        refreshSelectVersionTriggers();
        break;
      case "optifine":
        console.log("optifine");
        clearFirstTable();
        clearSecondTable();
        refreshSelectVersionTriggers();
        break;
    }
  };

  const refreshSelectVersionTriggers = () => {
    document
      .querySelectorAll("#finalVersionTrigger")
      .forEach((finalVersionTrigger) => {
        try {
          removeAllListeners(finalVersionTrigger, "click");
        } catch (error) {}
        addListener(finalVersionTrigger, "click", () => {
          if (finalVersionTrigger.dataset.version) {
            window.electron.selectVersion(finalVersionTrigger.dataset.version);
            document
              .querySelectorAll(`[data-modal-hide="staticModal"]`)
              .forEach((closeBtn) => {
                closeBtn.click();
              });
          }
        });
      });
  };
});
