document.addEventListener('DOMContentLoaded', (event) => {

	var getFirstParent = function(p_element, p_parentElementName)
	{
		var l_currentParent = p_element.parentElement;
		while(l_currentParent != null)
		{
			if(l_currentParent.graphName == p_parentElementName)
			{
				return l_currentParent;
			}
			else
			{
				l_currentParent = l_currentParent.parentElement;
			}
		}
		return null;
	};

	var loadJS = function(url, location, p_onload){
		var scriptTag = document.createElement('script');
		scriptTag.src = url;
		scriptTag.onload = p_onload;
		location.appendChild(scriptTag);
	};

	var extractTableOfContent = function(articleElement){
		var extractedToc =
		{
			"root": {
				"tag": "ROOT",
				"childs": []
			},
			"tocGraph": []
		};
		var allSections = articleElement.querySelectorAll('section');

		for(i=0; i < allSections.length; i++)
		{
			var section = allSections[i];
			var tocEntry = 
			{
				"id": section.getAttribute('id'),
				"title": section.querySelector("h1, h2, h3, h4, h5, h6").innerText,
				"parent": -1,
				"childs": []
			};

			if(section.parentElement.nodeName != 'SECTION')
			{
				extractedToc.root.childs.push(i);
			}
			else
			{
				var l_parentElement = getFirstParent(section);
				if(l_parentElement != null)
				{
					var l_parentElementID = l_parentElement.getAttribute('id');
					var l_parentElementGraphIndex = -1;
					extractedToc.tocGraph.forEach(function(l_loopTocEntry, l_index){
						if(l_loopTocEntry.id == l_parentElementID)
						{
							tocEntry.parent = extractedToc.tocGraph[l_index].parent;
							extractedToc.tocGraph[l_index].childs.push(i);
						}
					});
				}
				
			}

			extractedToc.tocGraph.push(tocEntry);
		}

		return extractedToc;
	};

	var buildTocElementRec = function(tocElementHtml, toc, tocEntry)
	{
		if(tocEntry.tag != "ROOT")
		{
			tocElementHtml += "<li>";
			tocElementHtml += `<a href="#`+tocEntry.id+`">`+tocEntry.title+`</a>`;
		}
		
		if(tocEntry.childs.length > 0)
		{
			tocElementHtml += "<ul>";
			for(let i = 0; i < tocEntry.childs.length; i++)
			{
				tocElementHtml = buildTocElementRec(tocElementHtml, toc, toc.tocGraph[tocEntry.childs[i]]);
			}
			tocElementHtml += "</ul>";
		}
		if(tocEntry.tag != "ROOT")
		{
			tocElementHtml += "</li>";
		}
		return tocElementHtml;
	}

	var buildTocElement = function(tocElement, toc)
	{
	tocElement.innerHTML +=		buildTocElementRec("", toc, toc.root);
	};

	 var finalDOM = "";
	 var request = new XMLHttpRequest();
		request.open('GET', '/pages/PageLayout.html', false);  // `false` makes the request synchronous
		request.setRequestHeader("Access-Control-Allow-Origin", "*");

		request.send(null);

		if (request.status === 200) {
		  finalDOM = request.responseText;
		}

		var title = document.querySelector('title');
		var subtitle = document.querySelector('subtitle');
		var article = document.querySelector( 'article' );

		document.documentElement.innerHTML = finalDOM;

		if(title != null)
		{
			document.querySelectorAll('#title-slot')
				.forEach(function(l_element){
					l_element.innerHTML = title.innerHTML;
				});
		}

		if(subtitle != null)
		{
			document.querySelector('#subtitle-slot').innerHTML = subtitle.innerHTML;
		}

		if(article != null)
		{
			var extractedToc = extractTableOfContent(article);
			var articleHTML = article.outerHTML;
			document.querySelector("#article-slot").innerHTML = articleHTML;
			buildTocElement(document.querySelector(".toc"), extractedToc);
		}
		
		loadJS("https://code.jquery.com/jquery-3.5.1.min.js", document.body, 
			() => {
				loadJS("https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js", document.body, () => {
				// loadJS("/toc/toc.js", document.body);
				loadJS("/index.js", document.body);
			});
	 });
})