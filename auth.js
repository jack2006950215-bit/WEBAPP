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

function messageForFirestoreError(error) {
  if (error?.code === "permission-denied") return "Firestore 規則尚未允許此帳號存取自己的資料。";
  if (error?.code === "unavailable") return "Firestore 暫時無法連線，資料仍保存在本機。";
  return "Firestore 同步失敗，資料仍保存在本機，請稍後再試。";
}

if (location.protocol === "file:") {
  authButton.disabled = true;
  authButton.title = "請先透過 localhost 或 GitHub Pages 開啟網頁";
  setStatus("請先透過 localhost 或 GitHub Pages 開啟網頁，再使用 Google 登入與雲端同步。");
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
      setStatus("Firebase 設定尚未連接，Google 登入與雲端同步暫未啟用。");
    } else {
      const sdk = "https://www.gstatic.com/firebasejs/13.4.0";
      const [appSdk, authSdk, firestoreSdk] = await Promise.all([
        import(sdk + "/firebase-app.js"),
        import(sdk + "/firebase-auth.js"),
        import(sdk + "/firebase-firestore.js"),
      ]);
      const app = appSdk.initializeApp(firebaseConfig);
      const auth = authSdk.getAuth(app);
      const db = firestoreSdk.getFirestore(app);
      const provider = new authSdk.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      let activeUserId = null;
      let cloudReady = false;
      let pendingChangeBeforeCloudReady = false;
      let saveTimer = null;
      let statusTimer = null;

      function showTemporaryStatus(message) {
        clearTimeout(statusTimer);
        setStatus(message);
        statusTimer = setTimeout(() => setStatus(""), 2200);
      }

      async function savePlannerDocument(userId) {
        const snapshot = window.dailyPlanner?.getSnapshot?.();
        if (!snapshot) throw new Error("planner-not-ready");
        const payload = JSON.stringify(snapshot);
        if (new TextEncoder().encode(payload).length > 300000) throw new Error("planner-payload-too-large");
        const plannerRef = firestoreSdk.doc(db, "users", userId, "planner", "state");
        await firestoreSdk.setDoc(plannerRef, {
          uid: userId,
          payload,
          updatedAt: firestoreSdk.serverTimestamp(),
        });
      }

      authSdk.onAuthStateChanged(auth, async (user) => {
        showUser(user);
        clearTimeout(saveTimer);
        activeUserId = user?.uid || null;
        cloudReady = false;
        pendingChangeBeforeCloudReady = false;
        window.dailyPlanner?.switchUser?.(activeUserId);

        if (!user) {
          setStatus("");
          return;
        }
        if (!window.dailyPlanner) {
          setStatus("行程資料尚未準備好，請重新整理頁面。");
          return;
        }

        setStatus("正在從 Firestore 載入資料…");
        const userId = user.uid;
        try {
          const plannerRef = firestoreSdk.doc(db, "users", userId, "planner", "state");
          const snapshot = await firestoreSdk.getDoc(plannerRef);
          if (activeUserId !== userId) return;
          if (snapshot.exists()) {
            const stored = snapshot.data();
            if (stored.uid !== userId || typeof stored.payload !== "string" || new TextEncoder().encode(stored.payload).length > 300000) {
              throw new Error("invalid-planner-document");
            }
            const plannerData = JSON.parse(stored.payload);
            if (!plannerData || !Array.isArray(plannerData.events) || !Array.isArray(plannerData.tasks)) {
              throw new Error("invalid-planner-payload");
            }
            if (pendingChangeBeforeCloudReady) {
              await savePlannerDocument(userId);
              pendingChangeBeforeCloudReady = false;
            } else {
              window.dailyPlanner.applySnapshot(plannerData);
            }
          } else {
            await savePlannerDocument(userId);
            if (activeUserId !== userId) return;
            window.dailyPlanner.markGuestMigrated?.();
          }
          cloudReady = true;
          showTemporaryStatus("資料已同步到 Firestore");
        } catch (error) {
          if (activeUserId !== userId) return;
          setStatus(messageForFirestoreError(error));
        }
      }, () => {
        cloudReady = false;
        pendingChangeBeforeCloudReady = false;
        setStatus("無法讀取登入狀態，請重新整理頁面。");
      });

      window.addEventListener("daily-planner:changed", () => {
        if (!activeUserId) return;
        if (!cloudReady) { pendingChangeBeforeCloudReady = true; return; }
        clearTimeout(saveTimer);
        saveTimer = setTimeout(async () => {
          const userId = activeUserId;
          setStatus("正在同步到 Firestore…");
          try {
            await savePlannerDocument(userId);
            if (activeUserId === userId) showTemporaryStatus("資料已同步到 Firestore");
          } catch (error) {
            if (activeUserId === userId) setStatus(error?.message === "planner-payload-too-large"
              ? "資料量超過單筆同步限制，請刪除部分資料後再試。"
              : messageForFirestoreError(error));
          }
        }, 450);
      });

      authButton.addEventListener("click", async () => {
        authButton.disabled = true;
        setStatus("正在連接 Google 帳號…");
        try {
          await authSdk.signInWithPopup(auth, provider);
        } catch (error) {
          if (error?.code === "auth/popup-blocked") {
            try {
              await authSdk.signInWithRedirect(auth, provider);
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
          await authSdk.signOut(auth);
        } catch {
          setStatus("登出未完成，請再試一次。");
        }
      });
    }
  } catch {
    authButton.disabled = true;
    setStatus("Firebase 模組載入失敗，請檢查網路連線與 Firebase 設定。");
  }
}
