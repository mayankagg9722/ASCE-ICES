function openNav() {
  document.getElementById("mySidenav").style.width = "100%";
    document.getElementById("overlay").style.display="block";
  $(".ham img").css("opacity","0");
  $("body").css("overflowY","hidden");
}
function closeNav() {
    $(".ham img").css("opacity","1");
    $("body").css("overflowY","scroll");
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("overlay").style.display="none";
}
// $(document).ready(function(){
//   var h=$(".header").height();
//   $(".altr").css({height:h+'px'});
// });