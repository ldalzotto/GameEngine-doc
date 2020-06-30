var AdjustSizeToParent = function()
{
	$(".width-parent").each(function(index, element)
	{
		$(element).css("width", $(element).parent().width());
	})
}

window.addEventListener("resize", AdjustSizeToParent);
setTimeout(AdjustSizeToParent, 0);
setTimeout(function(){
$('.ui.sticky').sticky(); 
},0)
