const admin = require("./firebase-admin");

// Replace with an actual token from your database
const testToken =
  "cmdAL51Xo0tWu8NYAMuXI3:APA91bFUdFTgVR4yqTi-7ivNb4ugnc-7c28eS6E7M8M1PB2fh-kKba_Ur74vMKbRuO6GX_k-58yCqVmh_wlW4akAXTuoYNwgVtExhxvryQaN8rzW9y0rN-Y";

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
