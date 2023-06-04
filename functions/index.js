const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { FieldValue } = require('firebase-admin/firestore');

admin.initializeApp();
const firestore = admin.firestore();
const auth = admin.auth();

exports.newUser = functions.auth.user().onCreate(async (user) => {
    const list = await firestore.collection("mentors").doc("mentor_list").get();

    if (!list.exists)
        return console.error("Mentor list not found");

    const mentors = list.data().mentors;

    if (!mentors || !mentors.includes(user.email))
        return firestore.collection("mail").doc().create({
            to: [user.email],
            template: {
                name: "finish",
                data: {
                    name: user.displayName,
                },
            },
        })

    await firestore.collection("mentors").doc(user.uid).set({
        email: user.email,
        name: user.displayName,
        photo: user.photoURL
    });

    return auth.setCustomUserClaims(user.uid, {mentor: true});
});

exports.data = functions.https.onRequest(async (req, res) => {
    const users = await firestore.collection("users").get();
    const stalls = await firestore.doc("stalls/stall_list").get();
    const stall_map = stalls.data();

    const user_writes = users.docs.map(async (user) => {
        const user_stalls = await user.ref.collection("stalls")
            .orderBy("time", "desc")
            .get();

        if(!user_stalls.docs?.length)
            return "No stalls found for " + user.data().email;

        const stall = user_stalls.docs.map((doc, i) => {
            if (i === 0 || doc.data().counted)
                return;

            const timeSpent =  user_stalls.docs[i - 1].data().time.seconds - doc.data().time.seconds;
            const stallName = doc.data().name;
            const stallId = stall_map[doc.data().type][stallName];

            const batch = firestore.batch();

            batch.update(doc.ref, {
                counted: true
            });

            batch.update(firestore.doc(`stalls/${stallId}`),{
                timeSpent: FieldValue.increment(timeSpent),
                visitorCount: FieldValue.increment(1)
            });

            return batch.commit();
        });

        return Promise.all(stall);
    });

    const results = await Promise.all(user_writes);

    results.forEach((result) => res.write(JSON.stringify(result) + "\n"));
    res.end();
});

exports.stalls = functions.https.onRequest(async (req, res) => {
    const stalls = await firestore.collection("stalls")
        .orderBy("visitorCount", "desc")
        .get();

    const totalLearning = stalls.docs
        .filter((doc) => doc.data().type === "learning")
        .reduce((acc, doc) => acc + doc.data().timeSpent, 0);

    const totalProject = stalls.docs
        .filter((doc) => doc.data().type === "project")
        .reduce((acc, doc) => acc + doc.data().timeSpent, 0);

    const totalTime = totalLearning + totalProject;

    res.write("Total time spent: " + totalTime + "\n\n");
    res.write("Total time spent in learning stalls: " + totalLearning + "\n");
    res.write("Total time spent in project stalls: " + totalProject + "\n\n");
    res.end()
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

// ["aravindbala2003@gmail.com", "abhimanyurbsa@gmail.com", "fidhaaaa18@gmail.com"].forEach(addMentor);
// addMentor("rohitrajesh5080@gmail.com").then(() => functions.logger.log("Mentor added"));

// addStalls();
// addVenues();

// addMentors().then(() => console.log("Mentors updated"));

// auth.setCustomUserClaims("QpCM5SREDxZqa6BzYq5mclsP6ei1", {mentor: true, admin: true});
