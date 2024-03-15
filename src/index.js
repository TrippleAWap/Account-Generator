// asyncronous entry point
(async () => {
    const fs = require("fs");
    const electron = require("electron");
    electron.app.on("ready", async () => {
        const mainWindow = new electron.BrowserWindow({
            // was going to have dynamic resolution but I don't want to use another package ( I hate bloat... )
            width: 1000,
            height: 800,
            webPreferences: {
                nodeIntegration: true,
                partition: "persist:main",
            }
        });
        // page which redirects to the login page
        mainWindow.loadURL("https://www.xbox.com/en-CA/auth/msa?action=logIn&returnUrl=https%3A%2F%2Fwww.xbox.com%2Fen-CA%2F")
        let currentAccount = { email: "", password: "" };
        // gonna remake cause titles are region specific and I don't want to deal with that
        mainWindow.webContents.on("page-title-updated", async (_, title) => {
            const url = mainWindow.webContents.getURL();
            console.log(title, url, "\n\n")
            switch (title) {
                case "Xbox Official Site: Consoles, Games, and Community | Xbox":
                    mainWindow.loadURL("https://www.xbox.com/en-CA/auth/msa?action=logIn&returnUrl=https%3A%2F%2Fwww.xbox.com%2Fen-CA%2F")
                    break;
                case "Sign in to your Microsoft account":
                    // click the create account button
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#signup").click()`);
                    break;

                case "Create account":
                    const numbers = new Array(10).fill(0).map(() => Math.floor(Math.random() * 10)).join("");
                    const letters = new Array(5).fill(0).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join("");

                    // find the email input and fill it with a random email
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=email]").value = "${letters}${numbers}@outlook.com";`);
                    currentAccount.email = `${letters}${numbers}@outlook.com`;
                    // trigger update of the email input, this is required to trigger the next button;
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
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=submit]").click();`);
                    break;
                case `What's your name?`: 
                case `What\u2019s your name?`: // they have a weird apostrophe
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#FirstName").value = "Judge";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#FirstName").dispatchEvent(new Event("input"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#LastName").value = "Judy";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#LastName").dispatchEvent(new Event("input"));`);

                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=submit]").click();`);
                    break;
                case `What's your birthdate?`:
                case `What\u2019s birthdate?`:
                case `What's your date of birth?`:
                case `What\u2019s your date of birth?`: // they have a weird apostrophe
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthMonth").value = "${Math.max(1, Math.floor(Math.random() * 12))}";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthMonth").dispatchEvent(new Event("change"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthDay").value = "${Math.max(1, Math.floor(Math.random() * 15))}";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthDay").dispatchEvent(new Event("change"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthYear").value = "2000";`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#BirthYear").dispatchEvent(new Event("input"));`);
                    mainWindow.webContents.executeJavaScript(`document.querySelector("input[type=submit]").click();`);
                    break;
                case "Add security info":
                    console.log(`Awaiting captcha completion for ${currentAccount.email}`);
                    break;
                case "Microsoft account notice":
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#StickyFooter > button").click();`);
                    break;
                case "Welcome to Xbox":
                    fs.appendFileSync(__dirname + "/../accounts.txt", `${currentAccount.email}:${currentAccount.password}\n`);
                    console.log(`Account created: ${currentAccount.email}:${currentAccount.password}`);
                    await new Promise((r) => setTimeout(r, 2000));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#create-account-gamertag-suggestion-1").click();`);
                    await new Promise((r) => setTimeout(r, 2000));
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#inline-continue-control").click();`);
                    break;
                case "Consent":
                    mainWindow.webContents.executeJavaScript(`document.querySelector("#inline-continue-control").click();`);
                    break;
            }
        });
    });
})();