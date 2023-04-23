const auth = firebase.auth();
const db = firebase.firestore();

const provider = new firebase.auth.GoogleAuthProvider();

auth.onAuthStateChanged((user) => {
    if (user && "phone" in localStorage)
        window.location.href = "/profile";
});

provider.addScope("https://www.googleapis.com/auth/user.gender.read");
provider.addScope("https://www.googleapis.com/auth/user.phonenumbers.read");


function signIn() {
    auth.signInWithPopup(provider)
        .then(async (result) => {

            const user = result.user;
            checkMentor(user.uid).then(r => r && (window.location.href = "/mentor"));

            await getPeopleData(result.credential.accessToken);
            window.location.href = "/profile";
        })
        .catch((error) => {
            window.alert("Login Failed");
            console.log(error);
        });
}

async function getPeopleData(accessToken) {
    const apiKey = firebaseConfig.apiKey;
    const url = `https://people.googleapis.com/v1/people/me?personFields=genders%2CphoneNumbers&key=${apiKey}`;

    const res = await fetch(url, {
        headers: {Authorization: `Bearer ${accessToken}`, Accept: "application/json"}
    });

    const p_data = await res.json();

    if (p_data.error)
        throw new Error(p_data.error.message);

    const gender = p_data.genders.find((g) => g.metadata.primary).value;
    const phone = p_data.phoneNumbers.find((p) => p.metadata.primary).value;

    localStorage.setItem("gender", gender);
    localStorage.setItem("phone", phone);
}

document.getElementById("login").addEventListener("click", signIn);
