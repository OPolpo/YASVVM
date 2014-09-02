//var defaultUrl = "http://10.0.0.43:8888/YASVVM2/do_video.php";
var defaultUrl = "http://localhost:80/YASVVM2/do_video.php";
// global variabiles
var map = null;
var streetViewService = null;
var directionsDisplay = null;
var directionsService = null;
var startPositionMarker = null;
var endPositionMarker = null;
var routeMarker = [];
var total = null;
var used = null;
// control button
var homeControlDiv = null;

// defaut location, in case of localization not present
var defaultLocation = new google.maps.LatLng(40.767383, -73.981711); //brodway

//markers icon
var startPositionMarkerIcon = "http://maps.google.com/mapfiles/kml/paddle/go.png";
var endPositionMarkerIcon = "http://maps.google.com/mapfiles/kml/paddle/stop.png";
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
}

function hideMapsAndSendVideoRequest()
{
    jsonImagePositionArray = [];
    for(i=0;i<routeMarker.length;i++)
    {
        if(i<=0)
        {
            thisDistanceToPrevious = 0;
        }
        else
        {
            thisDistanceToPrevious = google.maps.geometry.spherical.computeDistanceBetween(routeMarker[i-1].position, routeMarker[i].position);
        }
        if(i>=routeMarker.length-1)
        {
            thisDistanceToNext = 0;
            thisHeading = jsonImagePositionArray[i-1].h;
        }
        else
        {
            thisDistanceToNext = google.maps.geometry.spherical.computeDistanceBetween(routeMarker[i].position, routeMarker[i+1].position);
            thisHeading = google.maps.geometry.spherical.computeHeading(routeMarker[i].position, routeMarker[i+1].position);
        }
        jsonImagePositionArray[i] = {
            l: routeMarker[i].position.k,
            b: routeMarker[i].position.B,
            h: thisHeading,
            dtp: thisDistanceToPrevious,
            dtn: thisDistanceToNext,
            pano: routeMarker[i].pano
        };
    }
    //add some new Marker
    /*maxAngleBetweenPoints = 10;
    for(i=1;i<jsonImagePositionArray.length;i++)
    {
        angleBetweenPoints = jsonImagePositionArray[i-1].h - jsonImagePositionArray[i].h;
        if(angleBetweenPoints < -maxAngleBetweenPoints || angleBetweenPoints > maxAngleBetweenPoints) 
        {
            console.log(angleBetweenPoints, jsonImagePositionArray[i-1].h, jsonImagePositionArray[i].h);
            numberOfPoint = Math.ceil(angleBetweenPoints/maxAngleBetweenPoints);
            console.log(numberOfPoint);
            newPoint = jsonImagePositionArray[i];
            newPoint.h = jsonImagePositionArray[i-1].h + angleBetweenPoints/numberOfPoint;
            newPoint.nuovo = true;
            //newPoint.h = jsonImagePositionArray[i-1].h;//+(angleBetweenPoints/numberOfPoint);
            //newPoint.added = true;
            jsonImagePositionArray.splice(i+1, 0, newPoint);
            //console.log(newPoint.h);
            /*for(j=0;j<numberOfPoint; j++)
            {
                newPoint = jsonImagePositionArray[i];*/
                /*if(j<=(numberOfPoint/2))
                {
                    newPoint = jsonImagePositionArray[i-1];
                }
                else
                {
                    newPoint = jsonImagePositionArray[i];
                }*/
                /*newPoint.h = jsonImagePositionArray[i-1].h+(angleBetweenPoints/numberOfPoint);
                newPoint.added = true;
                jsonImagePositionArray.splice(i, 0, newPoint);
                i++;
                //newPoints[j] = newPoints[j].h+((angleBetweenPoints*j)/numberOfPoint);
            }
        }
    }*/
    
    //maxDistanceBetweenPoints = 10;
    maxAngleBetweenPoints = 10;
    //for(i=1;i<dataToElab.length;i++)
    for(i=1;i<jsonImagePositionArray.length;i++)
    {
        //trasform angle from [-180,180] to [0,360]
        startAngle = jsonImagePositionArray[i-1].h+180;
        endAngle = jsonImagePositionArray[i].h+180;
        angleBetweenPoints = endAngle - startAngle;
        if(Math.abs(angleBetweenPoints) > maxAngleBetweenPoints)
        {
            numberOfPoint = Math.ceil(Math.abs(angleBetweenPoints)/maxAngleBetweenPoints);
            newPoint = jsonImagePositionArray[i];
            newPoint.h = (startAngle + (angleBetweenPoints/numberOfPoint))-180; //go back to [-180,180] scale
            //console.log(newPoint);
            jsonImagePositionArray.splice(i, 0, newPoint);
        }
    }
    
    //test
    //jsonImagePositionArray[jsonImagePositionArray.length] = {
    //        l: 0.0,
    //        b: 0.0,
    //        h: 0,
    //        dtp: 0,
    //        dtn: 0,
    //        pano: 0
    //    };
    //end test
    thisData = {id: Math.floor(Math.random()*10000000000), points: jsonImagePositionArray};
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
    initializeStartEndPosition();
}

function initializeStartEndPosition()
{
    checkStreetView(map.getCenter(), 5, 106, 25, addStartEndPosition, setDefaultPosition, null);
}

function addStartEndPosition(data, callbackData)
{
    startPositionMarker = new google.maps.Marker({
        position: data.location.latLng,
        lastValidPosition: data.location.latLng,
        draggable:true,
        icon: startPositionMarkerIcon,
        title:"StartPosition",
    });
    
    //lastValidStartPosition = startPositionMarker.position;
    
    endPositionMarker = new google.maps.Marker({
        position: data.location.latLng,
        lastValidPosition: data.location.latLng,
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
    alert("No streetview near your position, move to default location");
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
            svData: svData,
            //and usefull to check if exist or not street view image in that way
            icon: normalMarkerIcon,
            title: "routeMarker"+routeMarker.length+"=>"+svData.location.pano,
            animation: google.maps.Animation.DROP,
        });
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
    
    request = {
        origin: startPositionMarker.lastValidPosition,
        destination: endPositionMarker.lastValidPosition,
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
            //log utile
            //console.log("Numero di elementi da elaborare: "+dataToElab.length);
            //maxDistanceBetweenPoints = 0.5;
            console.log("Number of points before expansion: "+dataToElab.length);
            maxDistanceBetweenPoints = 10;
            for(i=1;i<dataToElab.length;i++)
            {
                //console.log(dataToElab[i-1]);
                //console.log(lanLngBetween(dataToElab[i-1], dataToElab[i], 2));
                //console.log(dataToElab[i]);
                //return;
                distanceBetweenPoints = google.maps.geometry.spherical.computeDistanceBetween(dataToElab[i-1], dataToElab[i]);
                //distanceBetweenPoints = lanLngDistance(dataToElab[i-1], dataToElab[i]);
                //console.log(distanceBetweenPoints);
                if(distanceBetweenPoints > maxDistanceBetweenPoints) 
                {
                    numberOfPoint = Math.ceil(distanceBetweenPoints/maxDistanceBetweenPoints);
                    fraction = 1.0/numberOfPoint;
                    newPoint = google.maps.geometry.spherical.interpolate(dataToElab[i-1], dataToElab[i], fraction);
                    //newPoint = lanLngBetween(dataToElab[i-1], dataToElab[i], numberOfPoint);
                    dataToElab.splice(i, 0, newPoint);
                    // da togliere
                    /*new google.maps.Marker({
                        map: map,
                        position: newPoint, //move from direct position to street map position,
                        //pano: svData.location.pano,
                        //and usefull to check if exist or not street view image in that way
                        title: "StreetView Point Marker",
                        //animation: google.maps.Animation.DROP,
                    });*/
                }
                //alert("distanceBetweenPoints: "+distanceBetweenPoints+"\n"+
                //      "numberOfPoint: "+numberOfPoint+"\n"+
                //      "fraction: "+fraction+"\n"+
                //      "point[i-1]: "+dataToElab[i-1]+"\n"+
                //      "point[i]: "+dataToElab[i]+"\n"+
                //      "newPoint: "+newPoint+"\n");
                //if(newPoint == dataToElab[i-1]) //loop
                //{
                //    alert("distanceBetweenPoints: "+distanceBetweenPoints+"\n"+
                //      "numberOfPoint: "+numberOfPoint+"\n"+
                //      "fraction: "+fraction+"\n"+
                //      "point[i-1]: "+dataToElab[i-1]+"\n"+
                //      "point[i]: "+dataToElab[i]+"\n"+
                //      "newPoint: "+newPoint+"\n");
                //fraction = roundFun(fraction,2);
                //newPoint = google.maps.geometry.spherical.interpolate(dataToElab[i-1], dataToElab[i], fraction);
                //}
                //else
                //{
                //    dataToElab.splice(i, 0, newPoint);
                //}
                //console.log(google.maps.geometry.spherical.computeDistanceBetween(dataToElab[i-1], newPoint));
                //console.log(dataToElab[i-1], newPoint, dataToElab[i]);
                /*new google.maps.Marker({
                        map: map,
                        position: newPoint, //move from direct position to street map position,
                        title:"Marker2",
                        animation: google.maps.Animation.BOUNCE,
                    });*/
                //console.log(numberOfPoint);
                /*for(k=0;k<numberOfPoint;k++)
                    {
                        newPoint = google.maps.geometry.spherical.interpolate(dataToElab[i-1+k], dataToElab[i+k], numberOfPoint);
                        dataToElab.splice(i+k, 0, newPoint);
                    }
                }
                //console.log(google.maps.geometry.spherical.computeDistanceBetween(dataToElab[i-1], dataToElab[i]));
                //console.log(google.maps.geometry.spherical.computeDistanceBetween(dataToElab[i-1], dataToElab[i], 1000));
                //console.log(google.maps.geometry.spherical.interpolate(dataToElab[i-1], dataToElab[i], 2));*/
            }
            //log utile:
            //console.log("Numero di elementi da elaborare: "+dataToElab.length);
            total = 0;
            used = 0;
            //return; //da togliere
            console.log("Number of point to analyze: "+dataToElab.length);
            elaborateRoutes(dataToElab,0);
        }
    });
}

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