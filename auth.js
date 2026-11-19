const authButton = document.getElementById("googleSignIn");
const signOutButton = document.getElementById("googleSignOut");
const signedInProfile = document.getElementById("signedInProfile");
const authName = document.getElementById("authName");
const authPhoto = document.getElementById("authPhoto");
const authStatus = document.getElementById("authStatus");

function setStatus(message = "") {
  authStatus.textContent = message;
  authStatus.hidden = !message;
}

function showUser(user) {
  authButton.hidden = Boolean(user);
  signedInProfile.hidden = !user;
  if (!user) return;
  authName.textContent = user.displayName || user.email || "已登入";
  if (user.photoURL) {
    authPhoto.src = user.photoURL;
    authPhoto.alt = authName.textContent + " 的 Google 個人圖片";
    authPhoto.hidden = false;
  } else {
    authPhoto.removeAttribute("src");
    authPhoto.hidden = true;
  }
}

function messageForAuthError(error) {
  if (error?.code === "auth/unauthorized-domain") return "此網站網域尚未加入 Firebase 授權網域。";
  if (error?.code === "auth/operation-not-allowed") return "Firebase 專案尚未啟用 Google 登入。";
  if (error?.code === "auth/popup-closed-by-user") return "Google 登入視窗已關閉。";
  return "Google 登入暫時無法完成，請稍後再試。";
}

if (location.protocol === "file:") {
  authButton.disabled = true;
  authButton.title = "請先透過 localhost 或 Firebase Hosting 開啟網頁";
  setStatus("請先透過 localhost 或 Firebase Hosting 開啟網頁，再使用 Google 登入。");
} else {
  try {
    const configModule = await import("./firebase-config.js").catch(() => null);
    const firebaseConfig = configModule?.firebaseConfig;
    const configured = firebaseConfig && ["apiKey", "authDomain", "projectId", "appId"].every((key) =>
      typeof firebaseConfig[key] === "string" && firebaseConfig[key].trim() && !firebaseConfig[key].startsWith("YOUR_"),
    );
    if (!configured) {
      authButton.disabled = true;
      authButton.title = "Firebase 尚未連接設定";
      setStatus("Firebase 設定尚未連接，Google 登入暫未啟用。");
    } else {
      const sdk = "https://www.gstatic.com/firebasejs/11.10.0";
      const [{ initializeApp }, { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut }] = await Promise.all([
        import(sdk + "/firebase-app.js"),
        import(sdk + "/firebase-auth.js"),
      ]);
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      onAuthStateChanged(auth, (user) => {
        showUser(user);
        setStatus("");
      }, () => setStatus("無法讀取登入狀態，請重新整理頁面。"));
      authButton.addEventListener("click", async () => {
        authButton.disabled = true;
        setStatus("正在連接 Google 帳號…");
        try {
          await signInWithPopup(auth, provider);
        } catch (error) {
          if (error?.code === "auth/popup-blocked") {
            try {
              await signInWithRedirect(auth, provider);
              return;
            } catch (redirectError) {
              setStatus(messageForAuthError(redirectError));
            }
          } else {
            setStatus(messageForAuthError(error));
          }
        } finally {
          authButton.disabled = false;
        }
      });
      signOutButton.addEventListener("click", async () => {
        try {
          await signOut(auth);
        } catch {
          setStatus("登出未完成，請再試一次。" );
        }
      });
    }
  } catch {
    authButton.disabled = true;
    setStatus("Firebase 登入模組載入失敗，請檢查網路連線與 Firebase 設定。" );
  }
}
