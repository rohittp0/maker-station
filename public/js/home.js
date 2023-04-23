const auth = firebase.auth();

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
