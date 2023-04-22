const auth = firebase.auth();

const phoneTextBox = document.getElementById("phone");
const genderTextBox = document.getElementById("gender");
const graduationYearTextBox = document.getElementById("graduationYear");
const venueTextBox = document.getElementById("venue");

let data = {};

const user = new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            reject("User not logged in");
            window.location.href = "/";
        } else
            resolve(user);
    });
});


function updateFields(){
    const {phno, gender, graduation_year, venue} = data;

    console.log(data);

    phoneTextBox.value = phno;
    genderTextBox.value = gender;
    graduationYearTextBox.value = graduation_year;
    venueTextBox.value = venue;

}


async function getProfile() {
    const uid = (await user).uid;

    const db = firebase.firestore();
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

    if(localStorage.getItem("phone"))
        data.phno = localStorage.getItem("phone");

    if(localStorage.getItem("gender"))
        data.gender = localStorage.getItem("gender");

    updateFields();
}


getProfile().catch(console.error);
