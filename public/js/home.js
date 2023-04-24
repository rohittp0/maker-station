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
    db.doc(`users/${user.uid}`).onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (data.visited > 3) {
                document.getElementById('wrapperContainer').innerHTML =
                    `<a href="https://airtable.com/shrX6eup092tsqub7?prefill_User+ID=${user.uid}">
                        class="py-3 bg-red1 px-10 font-bold rounded-lg shadow-shadow1 shadow-inner1">
                        Get MakerStation wrapper
                    </a>`
            }
        }
    });
}
