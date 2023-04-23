const auth = firebase.auth();
const db = firebase.firestore();

const phoneTextBox = document.getElementById("phone");
const genderTextBox = document.getElementById("gender");
const graduationYearTextBox = document.getElementById("graduationYear");
const venueTextBox = document.getElementById("venue");

const submit = document.getElementById("submit");

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

    console.log(data);

    phoneTextBox.value = phno || "";
    genderTextBox.value = gender || "";
    graduationYearTextBox.value = graduation_year;
    venueTextBox.value = venue || "";

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

async function saveProfile() {
    submit.disabled = true;

    const uid = (await user).uid;
    const docRef = db.collection("users").doc(uid);

    data.phno = phoneTextBox.value;
    data.gender = genderTextBox.value;
    data.graduation_year = parseInt(graduationYearTextBox.value);
    data.venue = venueTextBox.value;

    const u = await user;

    console.log(data, u);

    docRef.set(data)
        .then(() => window.location.href = "/flow")
        .catch((error) => {
            window.alert("Error saving details");
            console.error("Error writing document: ", error);
            submit.disabled = false;
        });
}

getProfile().catch(console.error);

submit.addEventListener("click", saveProfile);
