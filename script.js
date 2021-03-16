//API key
var APIKey = "1743d71cea491649f0bd96f06af46d71";
var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
//To store search cities
var city= "";
//Variables
var searchCity = $("#search-city");
var currentCity = $("#current-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentTemperature = $("#temperature");
var currentUvindex = $("#uv-index");
var currentWindSpeed = $("#wind-speed");
var currentHumidty = $("#humidity");
var searchedCities = [];
//Searching cities in storage
function find (c) {
    for (var i=0; i< searchedCities.length; i++) {
        if (c.toUpperCase() === searchedCities[i]) {
            return -1;
        }
    }
    return 1;
}
//Function for current and future weather
function displayWeather (event) {
    event.preventDefault();
    if(searchCity.val().trim() !=="") {
        city= searchCity.val().trim();
        currentWeather(city);
    }
}
function currentWeather(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    //using url to get data from api
    $.ajax({
        url:queryURL,
        method: "GET",
    }).then(function(response){
        //show data
        console.log(response);
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        //date format method via MDN
        var date= new Date (response.dt*1000).toLocaleDateString();
        $(currentCity).html(response.name +"("+date+")" + "<img src="+iconurl+">");
        //temp in Fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        //display temp, wind speed, humidity, and UV index
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWindSpeed).html(windsmph+"MPH");
        $(currentHumidty).html(response.main.humidity+"%");
        UVIndex(response.coord.lon,response.coord.lat);

        forecast(response.id);
        if(response.cod==200){
            searchedCities=JSON.parse(localStorage.getItem("cityname"));
            console.log(searchedCities);
            if (searchedCities==null){
                searchedCities=[];
                searchedCities.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(searchedCities));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    searchedCities.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(searchedCities));
                    addToList(city);
                }
            }
        }

    });
}
//url for uvindex
function UVIndex(ln,lt){
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvindex).html(response.value);
            });
}
//function for future forcast
function forecast(cityid){
    var dayover = false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempK= response.list[((i+1)*8)-1].main.temp;
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src="+iconurl+">");
            $("#fTemp"+i).html(tempF+"&#8457");
            $("#fHumidity"+i).html(humidity+"%");
        }
        
    });
}
//fuction to add city to search history
function addToList(c){
    var listEl= $("<li>"+c.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",c.toUpperCase());
    $(".list-group").append(listEl);
}
//function to show search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}
function loadlastCity(){
    $("ul").empty();
    var searchedCities = JSON.parse(localStorage.getItem("cityname"));
    if(searchedCities!==null){
        searchedCities=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<searchedCities.length;i++){
            addToList(searchedCities[i]);
        }
        city=searchedCities[i-1];
        currentWeather(city);
    }

}
//function to clear history
function clearHistory(event){
    event.preventDefault();
    searchedCities=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//for click events
$("#search-button").on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$("#clear-history").on("click",clearHistory);

