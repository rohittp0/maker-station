const auth = firebase.auth();
const db = firebase.firestore();

// Listen for auth status changes
auth.onAuthStateChanged(user => {
    if(!user)
        window.location.href = "/";

    checkMentor(user.uid).then(r => !r && (window.location.href = "/profile"));
});


