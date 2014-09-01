// defaultUrl, useful for test
var defaultUrl = "http://10.0.0.43:8888/YASVVM2/do_video.php";
// map data
var map = null;
var streetViewService = null;
var directionsDisplay = null;
var directionsService = null;
var startPositionMarker = null;
var endPositionMarker = null;
//var lastStartValidPosition;
//var lastEndValidPosition;
var routeMarker = [];
var total = null;
var used = null;
// control button
var homeControlDiv = null;

//var defaultLocation = new google.maps.LatLng(40.760510, -73.976063); //nymoma
var defaultLocation = new google.maps.LatLng(40.735307, -73.989793); //parkavenue
//var defaultLocation = new google.maps.LatLng(45.563944, 10.231333); //unibs

var startPositionMarkerIcon = "http://maps.google.com/mapfiles/kml/paddle/go.png";
var endPositionMarkerIcon = "http://maps.google.com/mapfiles/kml/paddle/stop.png";

var tempMarkerIcon = {
    url: "http://maps.google.com/mapfiles/kml/paddle/red-blank.png",
    scaledSize: new google.maps.Size(16, 16),
};

var normalMarkerIcon = {
    url: "http://maps.google.com/mapfiles/kml/paddle/blu-blank.png",
    scaledSize: new google.maps.Size(32, 32),
};

var disabledMarkerIcon = {
    url: "http://maps.google.com/mapfiles/kml/paddle/wht-blank.png",
    scaledSize: new google.maps.Size(32, 32),
};

// give stringfy to json
$.extend({
    stringify  : function stringify(obj) {         
        if ("JSON" in window) {
            return JSON.stringify(obj);
        }
        
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);
            
            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") {
                        v = '"' + v + '"';
                    } else if (t == "object" && v !== null){
                        v = jQuery.stringify(v);
                    }
                    
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }
            
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }
});

/*function roundFun(num, decimals)
{
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}*/

/*function lanLngDistance(latLngStart, latLngEnd)
{
  latDiff = latLngEnd.k - latLngStart.k;
  lngDiff = latLngEnd.B - latLngStart.B;
  return Math.sqrt((latDiff*latDiff)+(lngDiff*lngDiff));
}

function lanLngBetween(latLngStart, latLngEnd, numberOfSlice)
{
    latDiff = latLngEnd.k - latLngStart.k;
    lngDiff = latLngEnd.B - latLngStart.B;
    newLatLng = new google.maps.LatLng(latLngStart.k+(latDiff/numberOfSlice), latLngStart.B+(lngDiff/numberOfSlice));
    return newLatLng;
}*/

// Set CSS for the control border
function showSendAndCloseButton()
{
    if($("#homeControlDiv").length == 0)
    {
        homeControlDiv = document.createElement('div');
        homeControlDiv.setAttribute('id','homeControlDiv');
        homeControlDiv.index = 1;
        homeControlDiv.style.padding = '10px';
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(homeControlDiv);
        homeControlUI = document.createElement('div');
        homeControlUI.style.backgroundColor = 'white';
        homeControlUI.style.borderStyle = 'solid';
        homeControlUI.style.borderWidth = '2px';
        homeControlUI.style.cursor = 'pointer';
        homeControlUI.style.textAlign = 'center';
        homeControlUI.title = 'Click to \'Close window & start video generation\'';
        homeControlDiv.appendChild(homeControlUI);
        
        homeControlText = document.createElement('div');
        homeControlText.style.fontFamily = 'Arial,sans-serif';
        homeControlText.style.fontSize = '30px';
        homeControlText.style.paddingLeft = '4px';
        homeControlText.style.paddingRight = '4px';
        homeControlText.innerHTML = 'Close window & start video generation';
        homeControlUI.appendChild(homeControlText);
        
        // Setup the click event listeners
        google.maps.event.addDomListener(homeControlUI, 'click', function()
        {
            hideMapsAndSendVideoRequest();
        });
    }
    else
    {
        $("#homeControlDiv").show();
    }
}

function hideMapsCanvas()
{
    $("#map-canvas").hide(500, function(){$("#map-canvas").empty();});
}

function hideSendAndCloseButton()
{
    if($("#homeControlDiv").length != 0)
    {
        $("#homeControlDiv").hide();
    }
    /*if(document.getElementById('homeControlDiv'))
    {
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].pop(homeControlDiv);
    }*/
}

function hideMapsAndSendVideoRequest()
{
    jsonMarkerArray = [];
    for(i=0;i<routeMarker.length;i++)
    {
        if(i<=0)
        {
            console.log(routeMarker[i].svData);
            thisDistanceToPrevious = 0;
        }
        else
        {
            thisDistanceToPrevious = google.maps.geometry.spherical.computeDistanceBetween(routeMarker[i-1].position, routeMarker[i].position);
        }
        if(i>=routeMarker.length-1)
        {
            thisDistanceToNext = 0;
            thisHeading = jsonMarkerArray[i-1].h;
        }
        else
        {
            thisDistanceToNext = google.maps.geometry.spherical.computeDistanceBetween(routeMarker[i].position, routeMarker[i+1].position);
            thisHeading = google.maps.geometry.spherical.computeHeading(routeMarker[i].position, routeMarker[i+1].position);
        }
        jsonMarkerArray[i] = {
            l: routeMarker[i].position.k,
            b: routeMarker[i].position.B,
            h: thisHeading,
            dtp: thisDistanceToPrevious,
            dtn: thisDistanceToNext,
            pano: routeMarker[i].pano
        };
    }
    //test
    //jsonMarkerArray[jsonMarkerArray.length] = {
    //        l: 0.0,
    //        b: 0.0,
    //        h: 0,
    //        dtp: 0,
    //        dtn: 0,
    //        pano: 0
    //    };
    //end test
    thisData = {id: Math.floor(Math.random()*10000000000), points: jsonMarkerArray};
    console.log(thisData);
    $.ajax(
            {
                url: defaultUrl,
        type: "POST",                                                        
        data: {data: thisData},
        success: function(output)
        {
            hideMapsCanvas();
            console.log(output);
            //result = $.parseJSON(output);
            /*if(documents.status === "false")
                    {
                        alert(documents.error);
                    }
                    else
                    {
                        documentsList = documents.data.documentList;   
                        $('#preview').empty();
                        if ($("#ed").attr("href")!=="css/noedit.css"){
                            showUpload();
                        }
                        for (var k in documentsList)
                        {
                            var arr=new Array();
                            for(var h in documentsList[k].tags){
                                arr.push(documentsList[k].tags[h].name);
                            }
                            if(usr.type==="ADMIN")
                                title=documentsList[k].title+" - <i>"+documentsList[k].ownerName+"</i>";
                            else
                                title=documentsList[k].title;
                            addPreview(title, documentsList[k].description, documentsList[k].type,arr,documentsList[k].isPrivate,documentsList[k].owned,documentsList[k].id);
            
                        }
                        if(documents.data.numberOfDocument==0)
                            $('#preview').append("<h3>No results found!</h5>");
                        else
                            $('#preview').append("<div id='paginator'></div>");
                        refreshPaginator(documents.data.numberOfDocument,documents.data.documentPerPage,a);
                    }*/
        },
        error: function(output)
        {
            console.log(output);
            //result = $.parseJSON(output);
            alert("Errore");
        }
    });
    
    
    /*for(i=0;i<routeMarker.length;i++)
    {
    
    }
    emptyRouteMarker();*/
}

/*point.x = start.x + (final.x - start.x) * progress;
point.y = start.y + (final.y - start.y) * progress;*/

function yassvmInitializerShow()
{
    $("#map-canvas").show(500, function(){yassvmInitializer();});
}

function yassvmInitializer()
{
    mapOptions = {
        //center: new google.maps.LatLng(45.563944, 10.231333),
        center: defaultLocation,
        //center: new google.maps.LatLng(0, 0),
        zoom: 16,
        disableDefaultUI: true,
        //panControl: true,
        //scaleControl: true,
        //overviewMapControl: true
        /*zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
        },*/
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    
    polylineOptionsValue = new google.maps.Polyline({
        strokeColor: '#00FF00',
        strokeOpacity: 0.5,
        strokeWeight: 7,
    });
    
    rendererOptions = {
        //draggable: true, //per attivare draggable, bisogna aggiungere la gestione del trascinamento dei markers
        suppressMarkers: true,
        //suppressInfoWindows: true,
        polylineOptions: polylineOptionsValue
    };
    
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsService = new google.maps.DirectionsService();
    //geocoder = new google.maps.Geocoder();
    
    // HTML5 geolocation
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(position)
        {
            pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(pos);
            continueInizialization();
        }, 
        function()
        {
            // do nothing cause use default value, maybe an alert?
            alert("Impossible retrive position, move to default location");
            continueInizialization();
        });
    }
    else
    {
        // Browser doesn't support Geolocation
        // do nothing cause use default value, maybe an alert?
        alert("Browser not support geolocalization, move to default location");
        continueInizialization();
    }
}

function continueInizialization()
{
    streetViewService = new google.maps.StreetViewService();
    streetViewLayer = new google.maps.StreetViewCoverageLayer();
    streetViewLayer.setMap(map);
    directionsDisplay.setMap(map);
    //console.log(streetViewService);
    //console.log(streetViewLayer);
    initializeStartEndPosition();
}

function initializeStartEndPosition()
{
    checkStreetView(map.getCenter(), 5, 156, 25, addStartEndPosition, setDefaultPosition, null);
}

function addStartEndPosition(data, callbackData)
{
    startPositionMarker = new google.maps.Marker({
        position: data.location.latLng,
        lastValidPosition: data.location.latLng,
        pano: data.location.pano,
        draggable:true,
        icon: startPositionMarkerIcon,
        title:"StartPosition",
    });
    
    //lastValidStartPosition = startPositionMarker.position;
    
    endPositionMarker = new google.maps.Marker({
        position: data.location.latLng,
        lastValidPosition: data.location.latLng,
        pano: data.location.pano,
        draggable:true,
        icon: endPositionMarkerIcon,
        title:"EndPosition",
    });
    
    startPositionMarker.setMap(map);
    endPositionMarker.setMap(map);
    
    //animation and end animation
    endPositionMarker.setAnimation(google.maps.Animation.BOUNCE);
    
    google.maps.event.addListener(endPositionMarker, 'dragstart', function stopBounce()
    {
        endPositionMarker.setAnimation(null);
        //google.maps.event.clearListeners(endPositionMarker, 'dragstart');
    });
    
    // add listner on drop, check if is a street view location
    google.maps.event.addListener(startPositionMarker, 'dragend', streetViewCheckerStart);
    google.maps.event.addListener(endPositionMarker, 'dragend', streetViewCheckerEnd);
}

function setDefaultPosition(data, callbackData)
{
    map.setCenter(defaultLocation);
    initializeStartEndPosition();
}

function checkStreetView(location, startRange, endRange, stepRange, okCallback, errorCallback, callbackData)
{
    streetViewService.getPanoramaByLocation(location, startRange, function processSvData(data, status)
    {
        if(status === google.maps.StreetViewStatus.OK)
        {
            okCallback(data, callbackData);
        }
        else
        {
            if(status === google.maps.StreetViewStatus.UNKNOWN_ERROR)
            {
                console.log(location, startRange, callbackData);
            }
            if(startRange+stepRange<endRange)
            {
                checkStreetView(location, (startRange+stepRange), endRange, stepRange, okCallback, errorCallback, callbackData);
            }
            else
            {
                errorCallback(data, callbackData);
            }
        }
    });
}

function streetViewCheckerStart(data)
{
    streetViewChecker(data, startPositionMarker);
}

function streetViewCheckerEnd(data)
{
    streetViewChecker(data, endPositionMarker);
}

//function streetViewChecker(marker, data)
function streetViewChecker(data, marker)
{
    checkStreetView(data.latLng, 5, 25, 5, okStreetViewChecker, errorStreetViewChecker, marker);
}

function okStreetViewChecker(data, marker)
{
    marker.setPosition(data.location.latLng);
    marker.pano = data.location.pano,
            marker.lastValidPosition = marker.position;
    calculateRoute();
    /*if(marker == startPositionMarker)
    {
        lastValidStartPosition = startPositionMarker.position;
        //startPositionMarker.setMap(map);
        //startPositionMarker.setAnimation(google.maps.Animation.DROP);
        calculateRoute();
    }
    else
    {
        lastValidEndPosition = endPositionMarker.position;
        //endPositionMarker.setMap(map);
        //endPositionMarker.setAnimation(google.maps.Animation.DROP);
        calculateRoute();
    }*/
    
}

function errorStreetViewChecker(data, marker)
{
    marker.setPosition(marker.lastValidPosition);
    if(startPositionMarker.position == endPositionMarker.position)
    {
        endPositionMarker.setMap(map);
        endPositionMarker.setAnimation(google.maps.Animation.BOUNCE);
    }
    /*if(marker == startPositionMarker)
    {
        marker.setPosition(lastValidStartPosition);
        //startPositionMarker.setAnimation(google.maps.Animation.DROP);
    }
    else
    {
        marker.setPosition(lastValidEndPosition);
        if(startPositionMarker.position == endPositionMarker.position)
        {
            endPositionMarker.setMap(map);
            endPositionMarker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }*/
}

function lockMarkers()
{
    hideSendAndCloseButton();
    //startPositionMarker
    startPositionMarker.setDraggable(false);
    startPositionMarker.setMap(map);
    startPositionMarker.setAnimation(google.maps.Animation.BOUNCE);//sobstitute with tinking anim
    //endPositionMarker
    endPositionMarker.setDraggable(false);
    endPositionMarker.setMap(map);
    endPositionMarker.setAnimation(google.maps.Animation.BOUNCE);//sobstitute with tinking anim
    //thinking animation
    //bind onclick message!!!
    //endPositionMarker.setDraggable(false);
    //google.maps.event.clearListeners(startPositionMarker, 'dragstart');
    //google.maps.event.addListener(startPositionMarker, 'dragend', streetViewCheckerStart);
    //google.maps.event.addListener(endPositionMarker, 'dragend', streetViewCheckerEnd);
}

function unlockMarkers()
{
    showSendAndCloseButton();
    //startPositionMarker
    startPositionMarker.setDraggable(true);
    startPositionMarker.setAnimation(null);
    //endPositionMarker
    endPositionMarker.setDraggable(true);
    endPositionMarker.setAnimation(null);
    //add information box to all marker
    for(i=1;i<routeMarker.length-1;i++)
    {
        /*google.maps.event.addListener(routeMarker[i], 'dblclick', function(e)
        {
            alert("doubleclicked: "+e);
        });*/
        routeMarker[i].setDraggable(true);
        markerPosition = i;
        google.maps.event.addListener(routeMarker[markerPosition], 'dragend', function streetViewCheckMarker()
        {
            //console.log(this);
            //colora di grigio
            lockMarkers();
            this.setIcon(disabledMarkerIcon);
            this.setDraggable(false);
            checkStreetView(this.position, 1, 21, 1, streetViewCheckMarkerOk, streetViewCheckMarkerError, this);
            //streetViewChecker(data, routeMarker[i]);
        });
        
        google.maps.event.addListener(routeMarker[markerPosition], 'dblclick', function streetViewEraseMarker()
        {
            //console.log("prima: "+routeMarker.length);
            this.setMap(null);
            //routeMarker.pop(this);
            for(i=1;i<routeMarker.length-1;i++)
            {
                if(routeMarker[i]==this)
                {
                    routeMarker.splice(i,1);
                    return;
                }
            }
            //console.log("dopo: "+routeMarker.length);
        });
        
        // add listner on drop, check if is a street view location
        //google.maps.event.addListener(startPositionMarker, 'dragend', streetViewCheckerStart);
        //google.maps.event.addListener(endPositionMarker, 'dragend', streetViewCheckerEnd);
        /*google.maps.event.addListener(endPositionMarker, 'dragstart', function stopBounce()
    {
        endPositionMarker.setAnimation(null);
        //google.maps.event.clearListeners(endPositionMarker, 'dragstart');
    });
        
    // add listner on drop, check if is a street view location
    google.maps.event.addListener(startPositionMarker, 'dragend', streetViewCheckerStart);
    google.maps.event.addListener(endPositionMarker, 'dragend', streetViewCheckerEnd);*/
    }
}

function streetViewCheckMarkerOk(data, marker)
{
    marker.position = data.location.latLng;
    marker.lastValidPosition = data.location.latLng;
    streetViewCheckMarkerEnd(data, marker);
}

function streetViewCheckMarkerError(data, marker)
{
    marker.position = marker.lastValidPosition;
    streetViewCheckMarkerEnd(data, marker);
}

function streetViewCheckMarkerEnd(data, marker)
{
    marker.setDraggable(true);
    marker.setIcon(normalMarkerIcon);
    marker.setMap(map);
    marker.setAnimation(google.maps.Animation.DROP);
    unlockMarkers();
}

function addUniqueSvMarker(svData)
{
    alreadyExist = false;
    for(k=1;k<=4&&routeMarker.length-k>=0;k++)
    {
        if(routeMarker[routeMarker.length-k].pano == svData.location.pano)
        {
            alreadyExist = true;
            break;
        }
    }
    if(alreadyExist)
    {
        total++;
        //console.log(total + " " + "already exist"+svData.location.pano);
    }
    else
    {
        routeMarker[routeMarker.length] = new google.maps.Marker({
            map: map,
            position: svData.location.latLng, //move from direct position to street map position,
            pano: svData.location.pano,
            lastValidPosition: svData.location.latLng,
            svData: svData, //and usefull to check if exist or not street view image in that way
            icon: normalMarkerIcon,
            title: "routeMarker "+routeMarker.length,
            animation: google.maps.Animation.DROP,
        });
        for(q=0;q<svData.liks.length;q++)
        {
            linksPosition = svData.links[q].pano;
            streetViewService.getPanoramaById(linksPosition, function(svData, status)
            {
                if(status == google.maps.StreetViewStatus.OK)
                {
                    new google.maps.Marker({
                        map: map,
                        position: svData.location.latLng, //move from direct position to street map position,
                        pano: svData.location.pano,
                        lastValidPosition: svData.location.latLng,
                        svData: svData, //and usefull to check if exist or not street view image in that way
                        icon: tempMarkerIcon,
                        title: "tempmarker of routeMarker "+routeMarker.length,
                        animation: google.maps.Animation.DROP,
                    });
                }
            });
        }
        //console.log(routeMarker[routeMarker.length-1]);
        //google.maps.event.addListener(routeMarker[routeMarker.length-1], 'dragend', function streetViewCheckerMarker(data)
        //{
        //    console.log(routeMarker.length-1);
        //checkStreetView(routeMarker[i].latLng, 1, 21, 1, streetViewCheckerMarkerOk, streetViewCheckerMarkerError, routeMarker[i]);
        //streetViewChecker(data, routeMarker[i]);
        //});
        //endPositionMarker.setAnimation(google.maps.Animation.DROP);
        total++;
        used++;
        //dDP = 0;
        //if(routeMarker.length>1)
        //{
        //    dDP = google.maps.geometry.spherical.computeDistanceBetween(routeMarker[routeMarker.length-2].position, routeMarker[routeMarker.length-1].position);
        //}
        // log utile
        //console.log(used+"("+total + ") " +  svData.location.latLng + " " + svData.location.pano + " distanza dal precedente: " +dDP);
    }
}

function emptyRouteMarker()
{
    while(routeMarker.length)
    {
        routeMarker[routeMarker.length-1].setMap(null);
        routeMarker.splice(routeMarker.length-1,1);
    }
}

function calculateRoute()
{
    emptyRouteMarker();
    calculateRouteWithData(startPositionMarker, endPositionMarker);
}

function calculateRouteWithData(routeStartPositionMarker, routeEndPositionMarker)
{   
    request = {
        origin: routeStartPositionMarker.lastValidPosition,
        destination: routeEndPositionMarker.lastValidPosition,
        // Note that Javascript allows us to access the constant
        // using square brackets and a string value as its
        // "property."
        travelMode: google.maps.TravelMode.DRIVING
        //travelMode: google.maps.TravelMode.WALKING
    };
    directionsService.route(request, function(data, status)
    {
        if (status == google.maps.DirectionsStatus.OK)
        {
            lockMarkers();
            //console.log(data);
            //aggiungere espansione dei numero di punti sul rettilinei.
            directionsDisplay.setDirections(data);
            // todo: insert here code to multiply number of steps
            dataToElab = [];
            k=0;
            for(i=0; i<data.routes[0].legs[0].steps.length; i++)
            {
                for(j=0; j<data.routes[0].legs[0].steps[i].path.length; j++)
                {
                    dataToElab[k] = data.routes[0].legs[0].steps[i].path[j];
                    k++;
                }
            }
            for(i=0;i<dataToElab.length;i++)
            {
                new google.maps.Marker({
                    map: map,
                    position: dataToElab[i], //move from direct position to street map position,
                    //pano: svData.location.pano,
                    //lastValidPosition: svData.location.latLng,
                    //svData: svData, //and usefull to check if exist or not street view image in that way
                    icon: normalMarkerIcon,
                    title: "tempmarker of routeMarker "+i,
                    animation: google.maps.Animation.DROP,
                });
            }
            //log utile:
            //console.log("Numero di elementi da elaborare: "+dataToElab.length);
            total = 0;
            used = 0;
            routeMarker[routeMarker.length] = new google.maps.Marker({
                map: map,
                position: routeStartPositionMarker.position, //move from direct position to street map position,
                pano: routeStartPositionMarker.pano,
                icon: tempMarkerIcon,
                title: routeStartPositionMarker.pano,
                animation: google.maps.Animation.DROP,
            });
            panoArray = [];
            positionArray = [];
            checkLinksAndPropagate(routeStartPositionMarker.pano, routeEndPositionMarker, data.routes[0].legs[0].distance.value, 0);
        }
    });
}

var panoArray = [];
var positionArray = [];

function checkLinksAndPropagate(thisLinkPano, routeEndPositionMarker, routeLength, limit)
{
    //if(limit++>1000)
    //{
    //    return; //limit to 100 steps;
    //}
    if(thisLinkPano == routeEndPositionMarker.pano)
    {
        panoArray[panoArray.length] = routeEndPositionMarker.pano;
        positionArray[positionArray.length] = routeEndPositionMarker.position;
        routeMarker[routeMarker.length] = new google.maps.Marker({
            map: map,
            position: routeEndPositionMarker.position, //move from direct position to street map position,
            pano: routeEndPositionMarker.pano,
            icon: tempMarkerIcon,
            title: routeEndPositionMarker.pano,
            animation: google.maps.Animation.DROP,
        });
        //alert("arrivato alla fine");
        unlockMarkers();
        return;
    }
    else
    {
        streetViewService.getPanoramaById(thisLinkPano, function(svData, status)
        {
            if(status === google.maps.StreetViewStatus.OK)
            {
                /*if($.inArray(svData.location.latLng, routeData)<0)
                {
                    console.log(svData.location.latLng, routeData);
                    alert("male: "+svData.location.latLng);
                }
                else
                {
                    console.log(svData.location.latLng, routeData);
                    alert("bene: "+svData.location.latLng);
                }*/
                //subTripData = {origin: svData.location.latLng, destination: endPositionMarker.lastValidPosition, travelMode: google.maps.TravelMode.DRIVING};
                //directionsService.route(subTripData, function(data, status)
                //{
                //if(status == google.maps.DirectionsStatus.OK)
                //{
                /*dataToElab = [];
                        k=0;
                        for(i=0; i<data.routes[0].legs[0].steps.length; i++)
                        {
                            for(j=0; j<data.routes[0].legs[0].steps[i].path.length; j++)
                            {
                                dataToElab[k] = data.routes[0].legs[0].steps[i].path[j];
                                k++;
                            }
                        }
                        miss = 0;
                        if(dataToElab.length > (2*routeData.length))
                        {
                            // da scartare
                            //alert("aspettaaaaaaaaa");
                            console.log("aspettaaaaaaaaa2: "+dataToElab.lengt+">>"+routeData.length);
                            return;
                        }
                        for(i=0;i<dataToElab.length;i++)
                        {
                            /*if($.inArray(dataToElab[i].B, routeData.B)<0)
                        {
                            console.log(dataToElab[i]);
                            miss++;
                        }*/
                /*    hit = false;
                            for(j=0;j<routeData.length; j++)
                            {
                                if(dataToElab[i].B == routeData[j].B)
                                {
                                    hit = true;
                                    break;
                                }
                            }
                            if(hit == false)
                            {
                                miss++;
                            }
                        }
                        console.log("aspettaaaaaaaaa (miss): "+miss+"/"+dataToElab.length+" = "+miss/dataToElab.length);
                        if((miss/dataToElab.length)>1.0)
                        {
                            //alert("aspettaaaaaaaaa2: "+miss+"/"+dataToElab.length);
                            console.log((miss/dataToElab.length));
                            //console.log(routeData);
                            return;
                        }
                        else
                        {*/
                //console.log(routeData);
                //console.log(dataToElab);
                //console.log(miss+"/"+i);
                panoArray[panoArray.length] = svData.location.pano;
                positionArray[positionArray.length] = svData.location.latLng;
                routeMarker[routeMarker.length] = new google.maps.Marker({
                    map: map,
                    position: svData.location.latLng, //move from direct position to street map position,
                    pano: svData.location.pano,
                    icon: tempMarkerIcon,
                    title: svData.location.pano,
                    animation: google.maps.Animation.DROP,
                });
                validLinks = [];
                //h = google.maps.geometry.spherical.computeHeading(routeData[0], routeData[routeData.length-1]);
                //h+= 180;
                //h= 360-h;
                for(i=0;i<svData.links.length;i++)
                {
                    if($.inArray(svData.links[i].pano, panoArray)<0)
                    {
                        validLinks[validLinks.length] = {pano: svData.links[i].pano};
                        //heading_diff[i] = Math.abs(svData.links[i].heading-h);
                        //continueWithDiscontinuedRoute(validLinks, routeLength, 0, limit);
                    }
                }
                if(validLinks.length<1)
                {
                    console.log("nessun link valido: ", svData, panoArray);
                    //unlockMarkers();
                    //discontinued road, find closest pano?
                    
                }
                else{ 
                    if(validLinks.length<=1)
                    {
                        checkLinksAndPropagate(validLinks[0].pano, routeEndPositionMarker, routeLength, limit);
                    }
                    else
                    {
                        continueWithShortestRoute(validLinks, routeEndPositionMarker, routeLength, 0, limit);
                    }
                }
            }
        });
    }
}

function continueWithShortestRoute(panoToTestArray, routeEndPositionMarker, routeLength, actualLinkToTest, limit)
{
    //console.log(panoToTestArray.length, actualLinkToTest);
    if(actualLinkToTest >= panoToTestArray.length)
    {
        //seleziona migliore, scartando -1
        best = routeLength+1;
        bestId = -1;
        for(i=0;i<panoToTestArray.length;i++)
        {
            if(panoToTestArray[i].distanceLength < best)
            {
                best = panoToTestArray[i].distanceLength;
                bestId = i;
            }
        }
        if(bestId<0)
        {
            console.log("Something really BAD happend:");
            console.log("{");
            console.log(panoToTestArray);
            console.log(routeLength);
            console.log(actualLinkToTest);
            console.log(limit);
            console.log("}");
            //no best?
        }
        else
        {
            checkLinksAndPropagate(panoToTestArray[bestId].pano, routeEndPositionMarker, routeLength, limit);
        }
        return;
    }
    else
    {
        //console.log(panoToTestArray, panoToTestArray[actualLinkToTest].pano);
        streetViewService.getPanoramaById(panoToTestArray[actualLinkToTest].pano, function(svData, status)
        {
            subTripData = {origin: svData.location.latLng, destination: endPositionMarker.lastValidPosition, travelMode: google.maps.TravelMode.DRIVING};
            directionsService.route(subTripData, function(data, status)
            {
                if(status == google.maps.DirectionsStatus.OK)
                {
                    panoToTestArray[actualLinkToTest].distanceLength = data.routes[0].legs[0].distance.value;
                    continueWithShortestRoute(panoToTestArray, routeEndPositionMarker, routeLength, (actualLinkToTest+1), limit);
                }
                else
                {
                    if(status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT)
                    {
                        setTimeout(function(){continueWithShortestRoute(panoToTestArray, routeEndPositionMarker, routeLength, actualLinkToTest, limit)}, 500);
                    }
                    else
                    {
                        console.log("Something BAD happend: ", status, data);
                        panoToTestArray[actualLinkToTest].distanceLength = routeLength+2;
                        continueWithShortestRoute(panoToTestArray, routeEndPositionMarker, routeLength, (actualLinkToTest+1), limit);
                    }
                }
            });
        });
    }
}
/*
                            //maxValueInArray = Math.min.apply(Math, heading_diff);
                            //console.log(heading_diff, maxValueInArray);
                            heading_diff.sort();
                            console.log(heading_diff);
                            checkLinksAndPropagate(svData.links[heading_diff.length-1].pano, routeData, limit);

                                    //console.log(svData.links[i].pano, panoArray);
                                    //console.log(svData.links[i].pano, panoArray,$.inArray(svData.links[i].pano, panoArray));
                                    //console.log(svData.links[i].pano);
                                    //console.log(svData);
                                    //console.log(panoArray);
                                    //linkPano = svData.links[i].pano;
                                    //console.log(svData.)
                                    //thisDistanceToNext = google.maps.geometry.spherical.computeDistanceBetween(routeMarker[i].position, routeMarker[i+1].position);
                                    /*h = google.maps.geometry.spherical.computeHeading(routeData[0], routeData[routeData.length-1]);
                                    svData.links[i].heading;
                                    h+= 180;
                                    h= 360-h;
                                    //if((<=svData.links[i].heading<=h+30)
                                    //{
                                        console.log("heading calcolato:"+h);
                                        console.log("heading:"+svData.links[i].heading);
                                        checkLinksAndPropagate(svData.links[i].pano, routeData, limit);*/
//break;
//}
//checkLinksAndPropagate(svData.links[i].pano, routeData, limit);
//break;
//validPano[validPano.length] = svData.links[i].pano;
//}
//}
//}
/*}
                    else
                    {
                        console.log("something bad happend here!(1): "+status);
                    }
                });*/
/*
                panoArray[panoArray.length] = svData.location.pano;
                positionArray[positionArray.length] = svData.location.latLng;
                new google.maps.Marker({
                    map: map,
                    position: svData.location.latLng, //move from direct position to street map position,
                    pano: svData.location.pano,
                    icon: tempMarkerIcon, 
                    animation: google.maps.Animation.DROP,
                });
                for(i=0;i<svData.links.length;i++)
                {
                    if($.inArray(svData.links[i].pano, panoArray)<0)
                    {
                        //console.log(svData.links[i].pano, panoArray);
                        //console.log(svData.links[i].pano, panoArray,$.inArray(svData.links[i].pano, panoArray));
                        //console.log(svData.links[i].pano);
                        //console.log(svData);
                        //console.log(panoArray);
                        //linkPano = svData.links[i].pano;
                        checkLinksAndPropagate(svData.links[i].pano, routeData, limit);
                        //validPano[validPano.length] = svData.links[i].pano;
                    }
                }
            }
            else
            {
                console.log("something bad happend here!(2): "+status);
            }
        });
    }
}*/
/*        request = {
                origin: panoArray[0].position,
                destination: svData.location.latLng,
                travelMode: google.maps.TravelMode.DRIVING
            };
        if(status == google.maps.StreetViewStatus.OK)
        {
            //check valid link
            validPano = [];
            for(i=0;i<svData.links.length;i++)
            {
                if($.inArray(svData.links[i].pano, panoArray)<0)
                {
                    //checkLinksAndPropagate(linkPano, svData.pano, routePolyline, i);
                    validPano[validPano.length] = svData.links[i].pano;
                }
            }


                /*linkPano = svData.links[q].pano;
                    if($.inArray(linkPano, panoArray)<0)
                    {
                        checkLinksAndPropagate(linkPano, svData.pano, routePolyline, i);
                    }
                }*/
/*}
        else
        {
            request = {
                origin: panoArray[panoArray.lenght-1].position,
                destination: svData.location.latLng,
                travelMode: google.maps.TravelMode.DRIVING
            };
            directionsService.route(request, function(data, status)
            {

                /*if (status == google.maps.DirectionsStatus.OK)
                {
                    for(q=0;q<svData.links.length;q++)
                    {
                    linkPano = svData.links[q].pano;
                    if($.inArray(linkPano, panoArray)<0)
                    {
                        checkLinksAndPropagate(linkPano, svData.pano, routePolyline, i);
                    }
                }
                }*/
/*});
            /*if(!google.maps.geometry.poly.isLocationOnEdge(svData.location.latLng, routePolyline, 0.001))
            {
                //alert("fuoristrada");
                console.log(svData.location.pano);
                return;
            }*//*
            if($.inArray(svData.location.pano, panoArray)<0)
            {
                panoArray[panoArray.length] = svData.location.pano;
                new google.maps.Marker({
                    map: map,
                    position: svData.location.latLng, //move from direct position to street map position,
                    pano: svData.location.pano,
                    icon: tempMarkerIcon,

                    animation: google.maps.Animation.DROP,
                });
                for(q=0;q<svData.links.length;q++)
                {
                    linkPano = svData.links[q].pano;
                    if($.inArray(linkPano, panoArray)<0)
                    {
                        checkLinksAndPropagate(linkPano, svData.pano, routePolyline, i);
                    }
                }
            }
            else
            {
                //console.log(panoArray);
                //alert($.inArray(svData.location.pano, panoArray) + svData.location.pano);
                return; //già presente, fermo la propagazione
            }*/
/* }
    });
}*/

function elaborateRoutes(data,n)
{
    checkStreetView(data[n], 1, 21, 1, elaborateRoutesOk, elaborateRoutesError, {data: data, n :n});
}

function elaborateRoutesOk(data, callbackData)
{
    addUniqueSvMarker(data);
    elaborateRouteNextStep(callbackData.data, callbackData.n);
}

function elaborateRoutesError(data, callbackData)
{
    //log utile
    //console.log("no street view near route: ", data);
    elaborateRouteNextStep(callbackData.data, callbackData.n);
}

function elaborateRouteNextStep(data, n)
{
    n++;
    if(n<data.length)
    {
        elaborateRoutes(data,n);
    }
    else
    {
        finishedElaboraRoutes(data,n);
    }
}

function finishedElaboraRoutes(data,n)
{
    routeMarker[0].setMap(null);
    routeMarker[routeMarker.length-1].setMap(null);
    console.log("Number of point to download: "+routeMarker.length);
    unlockMarkers();
}

/*
function addUniqueSvMarker(svData)
{
    alreadyExist = false;
    for(k=1;k<=4&&routeMarker.length-k>=0;k++)
    {
        if(routeMarker[routeMarker.length-k].pano == svData.location.pano)
        {
            alreadyExist = true;
            break;
        }
    }
    if(alreadyExist)
    {
        total++;
        //console.log(total + " " + "already exist"+svData.location.pano);
    }
    else
    {
        routeMarker[routeMarker.length] = new google.maps.Marker({
            map: map,
            position: svData.location.latLng, //move from direct position to street map position,
            pano: svData.location.pano,
            lastValidPosition: svData.location.latLng,
            //and usefull to check if exist or not street view image in that way
            icon: normalMarkerIcon,
            title: "StreetView Point Marker",
            animation: google.maps.Animation.DROP,
        });
        //endPositionMarker.setAnimation(google.maps.Animation.DROP);
        total++;
        used++;
        dDP = 0;
        if(routeMarker.length>1)
        {
            dDP = google.maps.geometry.spherical.computeDistanceBetween(routeMarker[routeMarker.length-2].position, routeMarker[routeMarker.length-1].position);
        }
        //log utile
        //console.log(used+"("+total + ") " +  svData.location.latLng + " " + svData.location.pano + " distanza dal precedente: " +dDP);
    }
}

    /*                //elaborateRoutes(data,i,0);
                routeMarker[routeMarker.length] = new google.maps.Marker({
                                map: map,
                                position: data.steps[i].path[j], //move from direct position to street map position,
                                //pano: svData.location.pano,
                                //and usefull to check if exist or not street view image in that way
                                title:"Step: ["+i+","+j+"]"
                            });
                            total++;
                            //console.log(total + " " +  data.steps[i].path[j]);
                            console.log("number: "+total+" => http://maps.googleapis.com/maps/api/streetview?size=400x400&location="+data.steps[i].path[j].k+","+data.steps[i].path[j].B);
                j++;
                if(j<data.steps[i].path.length)
        {
            elaborateRoutes(data,i,j);
        }
        else
        {
            i++;
            if(i<data.steps.length)
            {
                elaborateRoutes(data,i,0);
            }
        }
            }*/
/*streetViewService.getPanoramaByLocation(data.steps[i].path[j], 1, function processSVData(svData, status)
    {
        if(status == google.maps.StreetViewStatus.OK)
        {
            addSvMarker(svData);
        }
        else
        {
            console.log("no street view near route: "+status);
            //retry with 5
        }
        //prossimo punto
        j++;
        if(j<data.steps[i].path.length)
        {
            elaborateRoutes(data,i,j);
        }
        else
        {
            i++;
            if(i<data.steps.length)
            {
                elaborateRoutes(data,i,0);
            }
        }
    });
}*/
/*
function addSvMarker(svData)
{
    alreadyExist = false;
    for(k=1;k<=4&&routeMarker.length-k>=0;k++)
    {
        if(routeMarker[routeMarker.length-k].pano == svData.location.pano)
        {
            alreadyExist = true;
            break;
        }
    }
    if(alreadyExist)
    {
        //console.log("already exist"+svData.location.pano);
    }
    else
    {
        routeMarker[routeMarker.length] = new google.maps.Marker({
            map: map,
            position: svData.location.latLng, //move from direct position to street map position,
            pano: svData.location.pano,
            //and usefull to check if exist or not street view image in that way
            title: "StreetView Point Marker",
            animation: google.maps.Animation.DROP,
        });
        //endPositionMarker.setAnimation(google.maps.Animation.DROP);
        total++;
        console.log(total + " " +  svData.location.latLng + " " + svData.location.pano);
    }
}*/