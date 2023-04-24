async function checkMentor(uid){
    const docRef = db.collection("mentors").doc(uid);
    const doc = await docRef.get().catch(console.error);

    return doc?.exists;
}

tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                Guminert: ["Guminert"],
            },
            boxShadow: {
                inner1: "0px 0px 24px 0px #2B60ED99;",
            },
            colors: {
                red1: "#FA1D1D",
                red2: "#F8A8A8",
                shadow1: "#2B60ED99",
                grey1: "#BFBFBF",
            },
        },
        animation: {
            marquee: "marquee 25s linear infinite",
            marquee2: "marquee2 25s linear infinite",
        },
        keyframes: {
            marquee: {
                "0%": { transform: "translateX(0%)" },
                "100%": { transform: "translateX(-100%)" },
            },
            marquee2: {
                "0%": { transform: "translateX(100%)" },
                "100%": { transform: "translateX(0%)" },
            },
        },
    },
};
