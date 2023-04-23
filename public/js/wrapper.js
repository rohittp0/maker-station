function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {

    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y,
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");

    return d;
}

function fillProgress(percent) {
    degree = percent * 3.6
    document.getElementById("arc1").setAttribute("d", describeArc(100, 100, 45, 180, 180 + degree - 1));
    document.getElementById("arc2").setAttribute("d", describeArc(100, 100, 45, 180 + degree, 540));
};

window.onload = function () {

    // prpgress = 0
    // window.setInterval(() => {
    //     fillProgress(prpgress)
    //     prpgress = (prpgress + 1) % 100
    //     console.log(prpgress)
    // },100)
    fillProgress(60)
};