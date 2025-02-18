const admin = require("./firebase-admin");

// Replace with an actual token from your database
const testToken =
  "dgrOcA6EC4fmSPnbSjAZ1A:APA91bFxsc73gS25CfBtFTrPG60qUC6786i4MflA9Cv_ZMsNzH5rHOZPicFgrBMbFw0DCFgyPXXi5pWHcdaiuO7e4YON0N8sbhFU-564g_bkELymuHfgSDc";

const message = {
  token: testToken,
  notification: {
    title: "Test Notification",
    body: "This is a test notification",
  },
};

admin
  .messaging()
  .send(message)
  .then((response) => {
    console.log("✅ Test Notification Sent Successfully:", response);
  })
  .catch((error) => {
    console.error("❌ Error Sending Test Notification:", error);
  });
