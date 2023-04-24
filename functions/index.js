const admin = require('firebase-admin');
const functions = require('firebase-functions');
const {learning} = require("./utils");

admin.initializeApp();
const firestore = admin.firestore();
const auth = admin.auth();

exports.newUser = functions.auth.user().onCreate(async (user) => {
    const list = await firestore.collection("mentors").doc("mentor_list").get();

    if (!list.exists)
        return console.error("Mentor list not found");

    const mentors = list.data().mentors;

    if (!mentors || !mentors.includes(user.email))
        return console.log("User not a mentor", user.email);

    await firestore.collection("mentors").doc(user.uid).set({
        email: user.email,
        name: user.displayName,
        photo: user.photoURL
    });

    return auth.setCustomUserClaims(user.uid, {mentor: true});
});

exports.sendMail = functions.https.onCall(async (data, context) => {
    const uid = context.auth?.uid;

    if (!uid)
        throw new functions.https.HttpsError("unauthenticated", "User not authenticated");

    const user = await firestore.collection("users").doc(uid).get();

    if (!user.exists)
        throw new functions.https.HttpsError("not-found", "User not found");

    if(user.data().emailSent)
        throw new functions.https.HttpsError("already-exists", "Email already sent");

    const {name, email} = user.data();

    await firestore.collection("mail").add({
        to: [email],
        template: {
            name: "finish",
            data: {
                name,
            },
        },
    });

    await user.ref.update({
        emailSent: true
    });

});

async function addStalls() {
    const {learning, project} = require("./utils");

    const index = {
        learning: {},
        project: {}
    }

    const batch = firestore.batch();

    learning.forEach((name) => {
        const doc = firestore.collection("stalls").doc();
        batch.set(doc, {
            name,
            type: "learning"
        });

        index.learning[name] = doc.id;
    });

    project.forEach((name) => {
        const doc = firestore.collection("stalls").doc();
        batch.set(doc, {
            name,
            type: "project"
        });

        index.project[name] = doc.id;
    });

    batch.set(firestore.collection("stalls").doc("stall_list"), index);

    await batch.commit();
}

async function addVenues() {
    const {venues} = require("./utils");

    await firestore.collection("venues").doc("venue_list").set({
        venues
    });
}

async function addMentor(email) {
    const user = await auth.getUserByEmail(email);

    await firestore.collection("mentors").doc(user.uid).set({
        email: user.email,
        name: user.displayName,
        photo: user.photoURL
    });

    return auth.setCustomUserClaims(user.uid, {mentor: true});
}

addMentor("tprohit9@gmail.com")

// addStalls();
// addVenues();

