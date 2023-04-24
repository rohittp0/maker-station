const auth = firebase.auth();
const db = firebase.firestore();

const qr = new QRCode(document.getElementById('qrcode'), {
    width: 256,
    height: 256,
    colorDark : '#000000',
    colorLight : '#ffffff',
    correctLevel : QRCode.CorrectLevel.Q,
});


const user = new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
        if (!user) {
            reject("User not logged in");
            window.location.href = "/";
        } else
            resolve(user);
    });
});


user.then(async (user) => {
    qr.clear();
    qr.makeCode(JSON.stringify({uid: user.uid}));
});

async function addButton() {
    const {uid, displayName} = await user;

    const message = `Hey ${displayName} 👋
looks like you are enjoying the maker station 😍. 
We would love to hear your feedback. 
Would you like to fill a feedback form?`;

    const unsubscribe = db.doc(`users/${uid}`).onSnapshot((doc) => {
        const data = doc.data();

        if (data.visited > 10)
            unsubscribe();

        if (data.visited > 10 && !localStorage.getItem("feedback") && window.confirm(message)) {
            localStorage.setItem("feedback", "true");
            window.location.href = `https://airtable.com/shrX6eup092tsqub7?prefill_User+ID=${uid}`;
        }
        else if (data.visited > 10 && !localStorage.getItem("feedback")) {
            localStorage.setItem("feedback", "false");
        }
    });
}

addButton().catch(console.error);
