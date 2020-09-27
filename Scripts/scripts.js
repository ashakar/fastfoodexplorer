var searchTerm;
var id;

//function called if button is clicked
function searched(){
  document.getElementById("query-1").innerHTML = "";
  //points a reference to the element in the search
  var searchedWord = document.getElementById("searchTerm").value;
  searchTerm = searchedWord;
    document.getElementById("searchTerm").value ="";
    newElement("p", "You searched for '" + searchedWord +"'", 'result', 'query-1');

  //uses a function to receive search data from 2 different sources in API
  getResults(searchedWord, 0);
  }

//creates an element
//parameter: element - type of element
//elText - value of element/ thisname - name of element/ parentElement - parent reference
newElement = function(element, elText,thisname, parentElement){
  //points to new node
  var newEl = document.createElement(element);
  //creates a value
  var newContent = document.createTextNode(elText);
  //sets node's value to newContent
  newEl.appendChild(newContent);
  var parent = document.getElementById(parentElement);
  //sets a reference from the parent element to the new element(so it become a part of webpage)
  parent.appendChild(newEl);
  //sets the names
  newEl.id = thisname;
}

//gathers the data from the api and adds it to the page
getResults = function(searchedFood, queryStart){
    let j = queryStart;


    let url = "https://trackapi.nutritionix.com/v2/search/instant?query=" + searchedFood + "&branded_type=1"
    let headers = new Headers({'Content-Type':'application/json','x-app-id': 'd291e72b',
'x-app-key':'dc4a249c4c78d95a9b8341a773b8d5ce'})
//'x-remote-user-id':0})
    let req = new Request(url, { method: 'GET', headers: headers})
    fetch(req).then((response)=>{
    if (response.ok)
    {
        return (response.json)()
    }
    else
    {
        throw new Error('bad https')
    }}).then((jsonData) => 
    {
        console.log(jsonData.branded)
        for(var i = 0; i < jsonData.branded.length; i++)
        {
            newElement("p", jsonData.branded[i].brand_name + ': ' + jsonData.branded[i].food_name,'query'+j, 'query-1');
            var currElement = document.getElementById('query'+j);
            j++;
            //styling the page through javascript
            currElement.style.height = "175px";
            currElement.style.paddingTop = "12px";
            currElement.style.backgroundColor = "rgb(212,18,116)";
            currElement.style.float = "left";
            currElement.style.width = "49%";
            currElement.style.color = "white";
            //add a button to the search query that can be clicked and create a popup
            currElement.innerHTML+="<br>";
            currElement.innerHTML+="Calories: " + jsonData.branded[i].nf_calories
            currElement.innerHTML+="<br>";
            currElement.innerHTML+='<button type="submit" onclick = "dialog('+(j-1)+'); return false;" class = "magentabtn"><i class="fa fa-plus-square-o"></i></button>';
            //spacing between the elements
            currElement.style.marginLeft = "5px";
            
        }
    }).catch((err) => 
    {
        console.log("ERROR: ", err.message)
    });

  }

//opens the popup page if button is clicked
//parameter x - integer number identifier to find specific element
dialog = function(x){
  var searchKey = document.getElementById('query' + x + '');
  var term = searchKey.innerText;
  var modal = document.getElementById('popUp');
  modal.style.display = "block";
  var fixed = isolateName(term);
  let cals = term.indexOf("Calories");
  document.getElementById("innerText").innerText = "Menu Item: " + term.substring(0, cals);
  postToPopUp(fixed);
} 

//closes the popup page if 'x' is click
function exit(){
  var modal = document.getElementById('popUp');
  modal.style.display = "none";
}

//takes data from the API and adds it to the popup page
//parameter keyword  - name of the fast food branch
function postToPopUp(keyWord)
{
  let bodyText = document.getElementById("innerText");
  let headBanner = document.getElementById('banner');
  headBanner.innerText = keyWord;
  bodyText.innerHTML+="";
  getDetails(keyWord);
 
}

//uses the foursquare api to generate general venue details
//calls the method getInfo using the parameter place ID to provide specific detail
function getDetails(keyTerm){
  var placeId = "";
  let request = new XMLHttpRequest();
  let url = "https://api.foursquare.com/v2/venues/search/?near=Saratoga&query=";
  url+=keyTerm;
  url+="&limit=1&client_id=NBVZZZSD5QBEA2SWONO22JHPQ3YUDJAHT3N4U4JYUSDSP0D3&client_secret=KP5HBRJX2Z3R3FJFJSMFT0SEGBN4TFRCZETYLKANOL5UMLCF&v=20180522";
  request.onreadystatechange = function() {
    //when the API server is ready, receive and add the elements to the page
    if (request.readyState === 4 && request.status === 200) {
      let response = JSON.parse(request.responseText);
      if(response.response.venues.length != 0)
      {
        placeId = response.response.venues[0].id;
        getInfo(placeId);
      }
      else
      {
        let popUpText = document.getElementById('innerText');
        let text = "Unfortunately, there is no " + keyTerm + " near the provided area at this time. Please visit the " + keyTerm + " website for locations and/or products availible in stores." 
        popUpText.innerHTML+= '<p class = "loc_info" >' + text +'</p>';
      }
    }
  }
  request.open("GET", url, true);
  request.send();
  
}

//returns data on a specific store(currently test case - near San Jose)
//parameter id - specific store id created by foursquare
function getInfo(id){
  let req = new XMLHttpRequest();
  let popUpText= document.getElementById('innerText');
  let link = "https://api.foursquare.com/v2/venues/" + id;
  link+="/?client_id=NBVZZZSD5QBEA2SWONO22JHPQ3YUDJAHT3N4U4JYUSDSP0D3&client_secret=KP5HBRJX2Z3R3FJFJSMFT0SEGBN4TFRCZETYLKANOL5UMLCF&v=20180522";
  req.onreadystatechange = function(){
    //when the API server is ready, receive and add the elements to the page
    if(req.readyState === 4 && req.status === 200){
      let resp = JSON.parse(req.responseText);
      let url = resp.response.venue.url;
      //transfer data from api tp popup
      if (resp.response.venue.url !== undefined)
      {
        popUpText.innerHTML+= '<p class = "loc_info" style = "font-weight: bold; text-decoration: underline; color: black;"><a href = "'+ url + '" >Go To Website</a></p>';
      //series of conditionals to prevent attempting to access null data
      }
      if (resp.response.venue.description !== undefined)
      {
        //desription by restaurant
        let desc = resp.response.venue.description;
        popUpText.innerHTML+= '<p class = "loc_info" >' + '<b style = "color:black ;">Description:</b> ' + desc +'</p>';
      }
      if (resp.response.venue.location.formattedAddress !== undefined){

        //address
        let address = resp.response.venue.location.formattedAddress;
        popUpText.innerHTML+= '<p class = "loc_info" >' + '<b style = "color:black;">Address:</b>' + address +'</p>';
    }
    if (resp.response.venue.hasMenu === true){

      //link to menu
      let menu = resp.response.venue.menu.url;
      popUpText.innerHTML+= '<p class = "loc_info" style = "font-weight: bold; text-decoration: underline; color: black;"><a href = "'+ menu + '" >View Menu</a></p>';
    }
    if (resp.response.venue.hours.status !== undefined){

      //status of open/closed
      let time = resp.response.venue.hours.status;
      popUpText.innerHTML+= '<p class = "loc_info" >' + '<b style = "color:black;">Store Status: </b> '+ time +'</p>';
    }
    if (resp.response.venue.price.currency !== undefined &&resp.response.venue.price.message !== undefined){

      //overall price rating
      let pricing = resp.response.venue.price.currency + " " + resp.response.venue.price.message;
      popUpText.innerHTML+= '<p class = "loc_info" >' + '<b style = "color:black;" >Pricing: </b>' + pricing+'</p>';
    }
    if (resp.response.venue.likes !== undefined){

      //likes by customers on foursquare
      let count = resp.response.venue.likes.summary;
      popUpText.innerHTML+= '<p class = "loc_info" >' + count +'</p>';
    }
    if (resp.response.venue.attributes !== undefined){

      //features of specfic location
      popUpText.innerHTML+= '<ul class = "loc_info" style = "-webkit-margin-before: 0; -webkit-margin-after: 0;">' + '<b style = "color:black;" >Features: </b>' + '</ul>';
      let i =0;
      while(resp.response.venue.attributes.groups[i] !== undefined){
        let feature = resp.response.venue.attributes.groups[i].type + " : " + resp.response.venue.attributes.groups[i].items[0].displayValue;
        for(var j = 1; j < resp.response.venue.attributes.groups[i].items.length; j++){
          feature+= ", " + resp.response.venue.attributes.groups[i].items[j].displayValue;
        }
        popUpText.innerHTML+= '<li class = "loc_info" >' + feature +'</li>';
        i++;
      }
    }
    if (resp.response.venue.delivery !== undefined){

      //online delivery provider
      let deliveryType = resp.response.venue.delivery.provider.name;
      let link = resp.response.venue.delivery.url;
      popUpText.innerHTML+= '<p class = "loc_info" style = "font-weight: bold; text-decoration: underline; color: black;"><a href = "'+ link + '" >' + deliveryType +'</a></p>';
    }
    if (resp.response.venue.contact.phone !== undefined){
      //phone number
      let number = resp.response.venue.contact.phone;
      popUpText.innerHTML+= '<p class = "loc_info" >' + '<b style = "color:black;" >Questions? Call </b>' + number+'</p>';
    }
  }
  }

  req.open("GET", link, true);
  req.send();
}



//isolates only the store brand name, not the food and the place - removes the " " and ,
function isolateName(keyWord){
let comma = keyWord.indexOf(":");
let newWord = keyWord.substring(0, comma);
return newWord;
}





