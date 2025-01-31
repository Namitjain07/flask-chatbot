function newspage(){
    window.location.href='{{url_for("news")}}'
}
function dashboardpage(){
    window.location.href='{{url_for("dashboard")}}'
}
function pdfpage(){
    window.location.href='{{url_for("summary")}}'
}
function eventspage(){
    window.location.href='{{url_for("events")}}'
}