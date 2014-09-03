//var defaultUrl = "http://10.0.0.43:8888/YASVVM2/do_video.php";
//var defaultUrl = "http://localhost:80/YASVVM2/do_video.php";
var baseUrl = "http://localhost/YASVVM/";
var getIdUrl = baseUrl+"get_all_jobs_id.php";
var getProgressUrl = baseUrl+"get_progress.php";
var getNewIdUrl = baseUrl+"get_new_job_id.php";
var sendJobUrl = baseUrl+"set_job.php";
var startJobUrl = baseUrl+"start_video_elaboration.php";
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
var thisJobId = null;
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

function initializeSystem()
{
    hideMapsCanvas();
    loadJobData();
}

function loadJobData()
{
    $.ajax(
    {
        url: getIdUrl,
        type: "POST",
        success: function(output)
        {
            //console.log(output);
            result = $.parseJSON(output);
            $("#scheduler").empty();
            if(result.status === "false")
            {
                alert(result.error);
            }
            else
            {
                //console.log(result.data.id);
                if(result.data.id.length<1)
                {
                    $("#scheduler").append("<div>No scheduled Job</div>");
                }
                else
                {
                    for(i=0;i<result.data.id.length;i++)
                    {
                        $("#scheduler").append("<div id=\"job"+result.data.id[i]+"\">JobId: "+result.data.id[i]+", 0</div>");
                        checkJobData(result.data.id[i]);
                    }
                }
            }
        },
        error: function(output)
        {
            console.log("error:");
            console.log(output);
        }
    });
}

function checkJobData(id)
{
    $.ajax(
    {
        url: getProgressUrl,
        type: "POST",
        data: {id: id},
        success: function(output)
        {
            //console.log(output);
            result = $.parseJSON(output);
            if(result.status === "false")
            {
                alert(result.error);
            }
            else
            {
                //console.log(result.data);
                if(!result.data.isComplete)
                {
                    //console.log("ping: "+id);
                    $("#job"+id).empty().append("JobId: "+id+", "+result.data.executed+" scaricate su "+result.data.total+"</div>");
                    setTimeout(function(){checkJobData(id);}, 2000);
                }
                else
                {
                    $("#job"+id).empty().append("JobId: "+id+", completed [link]</div>");
                    //togliere set interval!!
                }
            }
        },
        error: function(output)
        {
            console.log("error:");
            console.log(output);
        }
    }); 
}

function hideMapsCanvas()
{
    $("#map-canvas").hide();
}

function hideMapsCanvasAndEmpty()
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
    maxAngleBetweenPoints = 10;
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
    thisData = {id: thisJobId, points: jsonImagePositionArray};
    console.log("Number of point to download, after expansion: "+ jsonImagePositionArray.length);
    $.ajax(
            {
                url: sendJobUrl,
                type: "POST",                                                        
                data: {data: thisData},
                success: function(output)
                {
                    $.ajax(
                    {
                        url: startJobUrl,
                        type: "POST",
                        data: {id: thisJobId},
                        success: function(output2)
                        {
                            console.log("ok:");
                            console.log(output2);
                            alert("finito");
                        },
                        error: function(output3)
                        {
                            console.log("error:");
                            console.log(output3);
                            alert("Errore");
                        }
                    });
                    hideMapsCanvasAndEmpty()
                    loadJobData();
                    $("#control-canvas").show(500, function(){yassvmInitializer();});
                },
                error: function(output)
                {
                    console.log("error:");
                    console.log(output);
                    alert("Errore");
                }
            });
}

function yassvmInitializerShow()
{
    $.ajax(
    {
        url: getNewIdUrl,
        type: "POST",
        success: function(output)
        {
            result = $.parseJSON(output);
            if(result.status === "false")
            {
                alert(result.error);
            }
            else
            {
                thisJobId = result.data;
                $("#control-canvas").hide();
                $("#map-canvas").show(500, function(){yassvmInitializer();});
            }
        },
        error: function(output)
        {
            console.log("error:");
            console.log(output);
        }
    });
}

function yassvmInitializer()
{
    mapOptions = {
        center: defaultLocation,
        zoom: 16,
        disableDefaultUI: true,
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    
    polylineOptionsValue = new google.maps.Polyline({
        strokeColor: '#00FF00',
        strokeOpacity: 0.5,
        strokeWeight: 7,
    });
    
    rendererOptions = {
        suppressMarkers: true,
        polylineOptions: polylineOptionsValue
    };
    
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsService = new google.maps.DirectionsService();
    
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

function streetViewChecker(data, marker)
{
    checkStreetView(data.latLng, 5, 25, 5, okStreetViewChecker, errorStreetViewChecker, marker);
}

function okStreetViewChecker(data, marker)
{
    marker.setPosition(data.location.latLng);
    marker.lastValidPosition = marker.position;
    calculateRoute();    
}

function errorStreetViewChecker(data, marker)
{
    marker.setPosition(marker.lastValidPosition);
    if(startPositionMarker.position == endPositionMarker.position)
    {
        endPositionMarker.setMap(map);
        endPositionMarker.setAnimation(google.maps.Animation.BOUNCE);
    }
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
        routeMarker[i].setDraggable(true);
        markerPosition = i;
        google.maps.event.addListener(routeMarker[markerPosition], 'dragend', function streetViewCheckMarker()
        {
            //colora di grigio
            lockMarkers();
            this.setIcon(disabledMarkerIcon);
            this.setDraggable(false);
            checkStreetView(this.position, 1, 21, 1, streetViewCheckMarkerOk, streetViewCheckMarkerError, this);
        });
        
        google.maps.event.addListener(routeMarker[markerPosition], 'dblclick', function streetViewEraseMarker()
        {
            this.setMap(null);
            for(i=1;i<routeMarker.length-1;i++)
            {
                if(routeMarker[i]==this)
                {
                    routeMarker.splice(i,1);
                    return;
                }
            }
        });
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
        total++;
        used++;
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
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(data, status)
    {
        if (status == google.maps.DirectionsStatus.OK)
        {
            lockMarkers();
            directionsDisplay.setDirections(data);
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
            console.log("Number of points before expansion: "+dataToElab.length);
            maxDistanceBetweenPoints = 10;
            for(i=1;i<dataToElab.length;i++)
            {
                distanceBetweenPoints = google.maps.geometry.spherical.computeDistanceBetween(dataToElab[i-1], dataToElab[i]);
                if(distanceBetweenPoints > maxDistanceBetweenPoints) 
                {
                    numberOfPoint = Math.ceil(distanceBetweenPoints/maxDistanceBetweenPoints);
                    fraction = 1.0/numberOfPoint;
                    newPoint = google.maps.geometry.spherical.interpolate(dataToElab[i-1], dataToElab[i], fraction);
                    dataToElab.splice(i, 0, newPoint);
                }
            }
            total = 0;
            used = 0;
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