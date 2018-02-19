function setHeight()
{
  var windowHeight=$(window).height();
  var windowWidth=$(window).width();
  $("#homePage,#aboutPage,.about-image,.about").css("height",windowHeight+'px');
  if(windowWidth<991)
    $(".altr").css("height",$(".mobile-header").height()+'px');
  else
      $(".altr").css("height",$(".pc-header").height()+'px');
}
function onScrollActivities()
{   
	var windowWidth=$(window).width();
	var x=$(window).scrollTop();
  var h=0;
    //var h=$("#aboutPage").offset().top;
	if(windowWidth<=991)
	{
		//$(".mobile-header").slideDown();
	    if(x>=10)
	    {
	      // $(".mobile-header").css({borderBottom:"1px solid #e7e7e7",backgroundColor:"white"});
	      // $(".ham i").css({color:"black"});
        $(".mobile-header").slideDown(200);
	    }
	    else
	    {
	      // $(".mobile-header").css({borderBottom:"0px",backgroundColor:"transparent",boxShadow:"none"});
	      // $(".ham i").css({color:"white"});
        $(".mobile-header").slideUp(200);
	    }
	}

    $(".pc-header").css({borderBottom:"1px solid #e7e7e7",backgroundColor:"#fff",marginTop:"0px",transition:"all 0.5s ease"});
    $(".pc-header a").css({color:"#222",transition:"all 0.5s ease"});
    if(x===0)
    {
      $(".pc-header a").css({color:"white",transition:"all 0.5s ease"});
      $(".pc-header").css({borderBottom:"0px",color:"white",backgroundColor:"transparent",marginTop:"25px",transition:"all 0.5s ease"});
    }
}
$(document).ready(function(){
  setHeight();
  $(window).on("scroll",function(){
    onScrollActivities();
  });
  	var h=$(window).height();
  	//$(".particle-network-animation").css("height",h+'px');
    //$(".home").css("height",h+'px');
    //$(".logo").fadeIn(2000);
  $(window).on("resize",function(){
    setHeight();
  	// var h=$(window).height();
  	// $(".particle-network-animation").css("height",h+'px');
  });
  });