const auth = firebase.auth();
const db = firebase.firestore();

// Listen for auth status changes
const user = new Promise((resolve) => {
    auth.onAuthStateChanged(user => {
        if (!user)
            window.location.href = "/";

        checkMentor(user.uid).then(r => !r && (window.location.href = "/profile"));
        resolve(user);
    });
});

async function getMentorStall() {
    const {uid} = await user;
    const mentor = await db.collection("mentors").doc(uid).get();

    if (!mentor?.data().stall)
        return window.location.href = "/stall";

    return await db.collection("stalls").doc(mentor.data().stall).get();
}

// Scan QR Code
const resultContainer = document.getElementById('qr-reader-results');
const mentorStall = getMentorStall();
let lastResult, count = 0;

async function handleQr(decodedText) {
    const {uid} = JSON.parse(decodedText);
    const stall = await mentorStall;

    await db.collection(`users/${uid}/stalls`).doc(stall.id).set({
        name: stall.data().name,
        time: firebase.firestore.FieldValue.serverTimestamp(),
        type: stall.data().type
    });

    db.doc(`users/${uid}`).update({
        visited: firebase.firestore.FieldValue.increment(1)
    });
}

function onScanSuccess(decodedText) {
    if (decodedText !== lastResult) {
        lastResult = decodedText;
        count++;
        resultContainer.innerHTML = `<p>Scanned <b>${count}</b> participants!</p>`;

        handleQr(decodedText).catch(console.error);
        navigator.vibrate(200);
    }
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader", {fps: 10, qrbox: 250});
html5QrcodeScanner.render(onScanSuccess);
