const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
   if(user)
       window.location.href = "/profile";
});


function signIn() {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
        .catch((error) => {
            window.alert("Login Failed");
            console.log(error);
        });
}


document.getElementById("login").addEventListener("click", signIn);
