// ==UserScript==
// @name            Steam Community Moderation Tools
// @namespace       heffe.community
// @description     Moderation tools for the Steam Community
// @match           http://steamcommunity.com/sharedfiles/filedetails/*
// @match           http://steamcommunity.com/discussions/globalreports/*
// @match           http://steamcommunity.com/app/*/discussions/*
// @match           http://steamcommunity.com/discussions/forum/*/*
// @require         http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @version         1.0
// ==/UserScript==

// Configuration variables

// Important forums
var importantForums = [
    {
        type: "steam",
        board: 25 // Board 25 = French Steam forum
    },
    {
        type: "hub",
        appid: 440,
        board: 0
    }
];

// Excluded forums
var excludedForums = [
    {
        type: "steam",
        board: 24 // German Board
    },
    {
        type: "steam",
        board: 26 // Russian Board
    }
];

$jQ = jQuery.noConflict(true);

function setBanReason( event ) {
    $jQ('#BanDialogFormReason').val( event.data.reason );
}

var fileDetailsRegex = /\/filedetails\/\?id=([0-9]+)$/;
var globalReportsRegex = /^\/discussions\/globalreports\//;
var communityHubDiscussionRegex = /^\/app\/\d+\/discussions\/\d+\/\d+\//;
var steamDiscussionRegex = /^\/discussions\/forum\/\d+\/\d+\//;

if( fileDetailsRegex.test( window.location.pathname ) ) {
    var banDiv = $jQ('#BanDialog');
    var promptButtons = banDiv.find('.promptButtons');
    var banReasons = [ 'Content unrelated to game', 'Inappropriate content', 'User did not create this content' ];

    var reasonDiv = $jQ( document.createElement('div') );
    for( var z=0; z<banReasons.length; z++) {
        var reason = $jQ( document.createElement('a') );
        reason.on("click", { reason: banReasons[z] }, setBanReason);
        reason.text(banReasons[z]);

        reasonDiv.append( reason );
        if( z < banReasons.length - 1 ) {
            reasonDiv.append( document.createTextNode(' | ') );
        }
    }
    promptButtons.before( reasonDiv );
    promptButtons.before( document.createElement('p') );
} else if( globalReportsRegex.test( window.location.pathname ) ) {

    var nbExcluded = 0;

    $jQ(".report_content_line2").each( function( index ) {
            var linkEl = $jQ( this ).find( "a[class='whiteLink']" );
            if( linkEl.length == 1) {
                var target = linkEl.attr('href');

                // Processing exclusions
                for( var i=0; i < excludedForums.length; i++ ) {
                    var pattern = "";
                    if( excludedForums[i].type == "steam" ) {
                        pattern = "/discussions/forum/" + excludedForums[i].board + "/";
                    } else if ( excludedForums[i].type == "hub" ) {
                        pattern = "/app/" + excludedForums[i].appid + "/discussions/" + excludedForums[i].board + "/";
                    }

                    if(pattern.length > 0 && target.indexOf( pattern ) != -1) {
                        $jQ(this).parent().parent().remove();
                        //$jQ(this).parent().parent().hide();
                        nbExcluded++;
                        console.log("Hiding " + target);
                    }
                }



                // Processing important forums
                for( var i = 0; i < importantForums.length; i++ ) {
                    var pattern = "";
                    if( importantForums[i].type == "steam" ) {
                        // http://steamcommunity.com/discussions/forum/26/
                        pattern = "/discussions/forum/" + importantForums[i].board + "/";
                    } else if( importantForums[i].type == "hub" ) {
                        // http://steamcommunity.com/app/72850/discussions/0/
                        pattern = "/app/" + importantForums[i].appid + "/discussions/" + importantForums[i].board  + "/";
                    }

                    if( pattern.length > 0 && target.indexOf( pattern ) != -1){
                        var newStyle = "background-color: rgb(92, 120, 54);";
                        $jQ(this).parent().attr("style", newStyle);
                    }
                }


            }
        }
    );

    console.log("Removed " + nbExcluded + " reports from view");
} else if ( communityHubDiscussionRegex.test(window.location.pathname) ) {

    var appIdRegex = /\/app\/(\d+)\/discussions/;

    var result = appIdRegex.exec( window.location.href )
    if( result != null) {
        var appId = result[1];
        var reportForumURL = "http://steamcommunity.com/app/" + appId + "/reporteddiscussions/-1/";

        var divEl = $jQ("div[class='rightbox_content_header']");
        if(divEl.text() == "ADMIN TOOLS") {
            var newDivEl = $jQ( document.createElement('div') );
            newDivEl.attr('class', 'weblink');

            var linkEl = $jQ( document.createElement('a') );
            linkEl.attr('href', reportForumURL);
            linkEl.text("Reported posts");

            newDivEl.append( linkEl );

            divEl.next().next().append( newDivEl );
        }
    }
} else if ( steamDiscussionRegex.test(window.location.pathname) ) {

    var reportForumURL = "http://steamcommunity.com/discussions/reporteddiscussions/-1/";

    var divEl = $jQ("div[class='rightbox_content_header']");
    if(divEl.text() == "ADMIN TOOLS") {
        var newDivEl = $jQ( document.createElement('div') );
        newDivEl.attr('class', 'weblink');

        var linkEl = $jQ( document.createElement('a') );
        linkEl.attr('href', reportForumURL);
        linkEl.text('Reported posts');

        divEl.next().next().append( newDivEl );
    }

    newDivEl.append( linkEl );

}
