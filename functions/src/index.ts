import * as functions from "firebase-functions";

// Simple HTTP function that returns a greeting message
export const helloWorld = functions.https.onRequest((req, res) => {
  res.status(200).send("Hello, World from Firebase!");
});
