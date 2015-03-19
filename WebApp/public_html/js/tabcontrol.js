$('#tabControl a').click(function (e) {
  e.preventDefault();
  stopPreviousWork = false;
  $(this).tab('show');
});

$('#tabControl a[href="#new"]').on('shown.bs.tab', function(e)
{
    //e.target // activated tab
    //e.relatedTarget // previous tab
    $('#map-canvas').height(($('html').height()*85/100)-80);
    yassvmInitializerShow();
});

$(window).resize(function(){
  $('#map-canvas').height(($('html').height()*85/100)-80);
  $('#scheduler-canvas').css("max-height", ($('html').height()*85/100)-80);
});

$('#tabControl a[href="#works"]').on('shown.bs.tab', function(e)
{   
    //$('#scheduler-canvas').height(($('html').height()*85/100)-80);
    $('#scheduler-canvas').css("max-height", ($('html').height()*85/100)-80);
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
                if(result.data.id.length<1)
                {
                    $("#scheduler").append("<p class='works-list'><div>No scheduled Job</p>");
                }
                else
                {
                    result.data.id.reverse();
                    for(i=0;i<result.data.id.length;i++)
                    {
                        $("#scheduler").append(
                            '<div class="col-lg-4" id="job'+result.data.id[i]+'"><a href="#">'
                            //'<div id="job'+result.data.id[i]+'"><a href="#">'
                            +'<div class="progress"><div class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">'
                            +'</div></div></a></div>'
                        );
                        $("#job"+result.data.id[i]+" .progress-bar").width('100%').text('[NOT-STARTED] Job '+result.data.id[i]);
                        if(i>0) //the first is shown also if it's not started
                        {
                            $("#job"+result.data.id[i]).hide();
                        }
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
});

function clicked(tab)
{
    $('a[href="#'+tab+'"]').trigger('click');
}

/*$("#links a").click(function(event)
{
    event.preventDefault(); 
});*/

function checkJobData(id)
{
    $.ajax(
    {
        url: getProgressUrl,
        type: "POST",
        data: {id: id},
        success: function(output)
        {
            result = $.parseJSON(output);
            if(result.status === "false")
            {
                alert(result.error);
            }
            else
            {
                if(result.data.unused === "true")
                {
                    //do nothing
                    $("#job"+id+" .progress-bar").addClass("progress-bar-warning");
                    setTimeout(function(){checkJobData(id);}, 2000);
                }
                else
                {
                    if(result.data.isComplete === "false")
                    {
                        $("#job"+id).show();
                        $("#job"+id+" .progress-bar").addClass("active");
                        $("#job"+id+" .progress-bar").removeClass("progress-bar-warning");
                        $("#job"+id+" .progress-bar").removeClass("progress-bar-success");
                        $("#job"+id+" .progress-bar").width((result.data.executed*100.0/result.data.total)+"%");
                        $("#job"+id+" .progress-bar").text('Job '+id+': '+result.data.executed+'/'+result.data.total);
                        setTimeout(function(){checkJobData(id);}, 500);
                    }
                    else
                    {
                        $("#job"+id).show();
                        $("#job"+id+" .progress-bar").removeClass("progress-bar-warning");
                        $("#job"+id+" .progress-bar").removeClass("active");
                        $("#job"+id+" .progress-bar").addClass("progress-bar-success");
                        $("#job"+id+" .progress-bar").width((result.data.executed*100.0/result.data.total)+"%");
                        $("#job"+id+" .progress-bar").text('[FINISHED] Job '+id+': '+result.data.executed+'/'+result.data.total+' [CLICK TO DOWNLOAD]');
                        $.ajax(
                        {
                            url: getDownloadUrl,
                            type: "POST",
                            data: {id: id},
                            success: function(output)
                            {
                                result = $.parseJSON(output);
                                if(result.status === "false")
                                {
                                    $("#job"+id+" .progress-bar").addClass("progress-bar-error");
                                    console.log(result.error);
                                    $("#job"+id+" a").prop("href", "#");
                                }
                                else
                                {
                                    //alert("sono qui: "+id);
                                    $("#job"+id+" a").prop("href", result.data);
                                    //console.log($("#job"+id+" a")); 
                                }
                            }
                        });
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