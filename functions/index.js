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

firestore.collection("users")
    .where("emailSent", "==", false)
    .where("visited", ">", 5)
    .onSnapshot((snapshot) => {
        snapshot.docs.forEach((doc) => {
            const {name, email} = doc.data();

            const batch = firestore.batch();

            batch.create(firestore.collection("mail").doc(), {
                to: [email],
                template: {
                    name: "finish",
                    data: {
                        name,
                    },
                },
            });

            batch.update(doc.ref, {
                emailSent: true
            });

            return batch.commit();
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

    await firestore.collection("users").doc(user.uid).delete();

    return auth.setCustomUserClaims(user.uid, {mentor: true});
}

async function addMentors() {
    const {mentors} = require("./utils");

    return firestore.doc("mentors/mentor_list").set({
        mentors
    });
}

// addMentor("rohitrajesh5080@gmail.com").then(() => functions.logger.log("Mentor added"));

// addStalls();
// addVenues();

// addMentors().then(() => console.log("Mentors updated"));

