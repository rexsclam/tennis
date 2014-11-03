/*
$(document).ready(function() {
	checkScroll()
})

function setupHistoryClicks() {
  addClicker(document.getElementById("next"));
  console.log("hi")
}

function addClicker(link) {
  link.addEventListener("click", function(e) {
  	e.preventDefault();
    viz(link.href);
    history.pushState(null, null, link.href);
  }, false);
}

function checkScroll() {
	window.addEventListener("scroll", function(e) {
		next = document.getElementById("next");
		e.preventDefault();
    	history.pushState(null, null, next.href);
    	viz(next.href);
	}, false);
}

function viz(href) {
  var req = new XMLHttpRequest();
  req.open("GET",
           "" +
             href.split("/").pop(),
           false);
  req.send(null);
  if (req.status == 200) {

    document.getElementById("court").innerHTML = req.responseText;
    setupHistoryClicks();
    init();
    return true;
  }
  return false;
}

window.addEventListener("popstate", function(e) {
    viz(location.pathname);
});
*/