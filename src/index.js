const { appendFileSync } = require("node:fs");
const electron = require("electron");

(async () => {
    electron.app.on("ready", async () => {
        const mainWindow = new electron.BrowserWindow({
            width: 1000,
            height: 800,
            webPreferences: {
                nodeIntegration: true,
                partition: "persist:main",
            }
        });

        mainWindow.loadURL("https://www.xbox.com/en-CA/auth/msa?action=logIn&returnUrl=https%3A%2F%2Fwww.xbox.com%2Fen-CA%2F");
        let currentAccount = { email: "", password: "" };
        let lastTitle;
        setInterval(async () => {
            const title = await getPage(mainWindow);
            if (title === lastTitle || title === "Unknown") return;
            lastTitle = title;
            console.log(title);
            switch (title) {
                case "Xbox Official Site: Consoles, Games, and Community | Xbox":
                    mainWindow.loadURL("https://www.xbox.com/en-CA/auth/msa?action=logIn&returnUrl=https%3A%2F%2Fwww.xbox.com%2Fen-CA%2F");
                    break;
                case "Sign in to your Microsoft account":
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#signup").click()`);
                    break;
                case "Create account":
                    const numbers = new Array(10).fill(0).map(() => Math.floor(Math.random() * 10)).join("");
                    const letters = new Array(5).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join("");
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=email]").value = "${letters}${numbers}@outlook.com";`);
                    currentAccount.email = `${letters}${numbers}@outlook.com`;
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=email]").dispatchEvent(new Event("input"));`);

                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=submit]").click();`);
                    console.log(`Created email: ${currentAccount.email}`);
                    break;
                case "Create a password":
                    const password = [2, 2, 2, 2].map((length, index) => {
                        switch (index) {
                            case 0:
                                return new Array(length).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join("");
                            case 1:
                                return new Array(length).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join("");
                            case 2:
                                return new Array(length).fill(0).map(() => Math.floor(Math.random() * 10)).join("");
                            case 3:
                                return new Array(length).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 15) + 33)).join("");
                        }
                    }).join("");
                    console.log(`Created password: ${password}`)
                    currentAccount.password = password;
                    await new Promise((r) => setTimeout(r, 500));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=password]").value = "${password}";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=password]").dispatchEvent(new Event("input"));`);
                    await new Promise((r) => setTimeout(r, 50));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=submit]").click();`);
                    break;
                case `What's your name?`:
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#FirstName").value = "Judge";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#FirstName").dispatchEvent(new Event("input"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#LastName").value = "Judy";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#LastName").dispatchEvent(new Event("input"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=submit]").click();`);
                    break;
                case `What's your date of birth?`:
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthMonth").value = "${Math.max(1, Math.floor(Math.random() * 12))}";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthMonth").dispatchEvent(new Event("change"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthDay").value = "${Math.max(1, Math.floor(Math.random() * 15))}";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthDay").dispatchEvent(new Event("change"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthYear").value = "2000";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthYear").dispatchEvent(new Event("input"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=submit]").click();`);
                    break;
                case "Microsoft account notice":
                    await new Promise((r) => setTimeout(r, 1000));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#StickyFooter > button").click();`);
                    break;
                case "Welcome to Xbox":
                    appendFileSync(__dirname + "/../accounts.txt", `${currentAccount.email}:${currentAccount.password}\n`);
                    console.log(`Account created: ${currentAccount.email}:${currentAccount.password}`);
                    await new Promise((r) => setTimeout(r, 2000));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#create-account-gamertag-suggestion-1").click();`);
                    await new Promise((r) => setTimeout(r, 2000));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#inline-continue-control").click();`);
                    break;
                case "Consent":
                    await new Promise((r) => setTimeout(r, 1000));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#inline-continue-control").click();`);
                    break;
            }
        }, 250);
    });
})();

const getPage = async (mainWindow) => {
    const pageMap = {
        "Sign in to your Microsoft account": "#usernameTitle",
        "Create a password": "input[type=password]",
        "What's your name?": "input#FirstName",
        "What's your date of birth?": "#BirthMonth",
        "Microsoft account notice": "#StickyFooter > button",
        "Welcome to Xbox": "#create-account-gamertag-suggestion-1",
        "Consent": "#inline-continue-control",
        "Create account": "#liveSwitch",
        "Xbox Official Site: Consoles, Games, and Community | Xbox": "#signup",
        "Add security info": "#hipEnforcementContainer"
    };

    for (let title in pageMap) {
        const selector = pageMap[title];
        const element = await mainWindow.webContents.executeJavaScript(`Boolean(document.querySelector("${selector}"))`);
        if (element) {
            return title;
        }
    }
    return "Unknown";
}
