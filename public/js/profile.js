const auth = firebase.auth();
const db = firebase.firestore();

const phoneTextBox = document.getElementById("phone");
const genderSelect = document.getElementById("gender");
const graduationSelect = document.getElementById("graduationYear");
const venueSelect = document.getElementById("venue");

const form = document.getElementById("detailsForm");
const greeting = document.getElementById("greeting");

let data = {};

const user = new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            reject("User not logged in");
            window.location.href = "/";
        } else {
            resolve(user);
            checkMentor(user.uid).then(r => r && (window.location.href = "/mentor"));
        }
    });
});

function updateFields() {
    const {phno, gender, graduation_year, venue} = data;

    phoneTextBox.value = phno || "";
    genderSelect.value = gender || "";
    graduationSelect.value = graduation_year;
    venueSelect.value = venue || "";
}

async function getProfile() {
    const uid = (await user).uid;

    const docRef = db.collection("users").doc(uid);
    const doc = await docRef.get().catch(console.error);

    data = {
        name: (await user).displayName,
        email: (await user).email,
        photoURL: (await user).photoURL,
        uid: (await user).uid
    };

    if (doc?.exists)
        data = {...data, ...doc.data()};

    if (localStorage.getItem("phone"))
        data.phno = localStorage.getItem("phone");

    if (localStorage.getItem("gender"))
        data.gender = localStorage.getItem("gender");

    updateFields();
}

async function getVenues() {
    const venues = await db.collection("venue").doc("venues").get();
    venues.data().venue_list.forEach((venue) => {
        const option = document.createElement("option");
        option.value = venue;
        option.innerText = venue;
        option.style.color = "#888888"
        venueSelect.appendChild(option);
    });
}

async function saveProfile(e) {
    e.preventDefault();
    form.disabled = true;

    const uid = (await user).uid;
    const docRef = db.collection("users").doc(uid);

    data.phno = phoneTextBox.value;
    data.gender = genderSelect.value;
    data.graduation_year = parseInt(graduationSelect.value);
    data.venue = venueSelect.value;

    docRef.set(data)
        .then(() => window.location.href = "/flow")
        .catch((error) => {
            window.alert("Error saving details");
            console.error("Error writing document: ", error);
        });
}

user.then((u) => {
    const text = greeting.innerText;
    greeting.innerText = text.replace("{{AMAZING_HUMAN}}", u.displayName);
});

getProfile().catch(console.error);
getVenues().catch(console.error);

form.addEventListener("submit", saveProfile);
