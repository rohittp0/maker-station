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


async function addStalls()
{
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

// addStalls();

