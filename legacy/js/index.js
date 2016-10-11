/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// implement your decoding as you need it, this just does ASCII decoding
// function hex2a(hex) {
//     var str = '';
//     for (var i = 0; i < hex.length; i += 2) {
//         str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
//     }
//     return str;
// }

var formData,
    scanData,
    storedData = [],
    submissionBacklog = [],
    currentSurveySection,
    submitFired,
    entryMethod = 'Manual',
    triedblu,
    triedEcig,
    reformattedDOB,
    age,
    clickTimer = null,
    lockTimer = null,
    deviceFieldUnlocked = false,
    appCache = window.applicationCache;

function handleCacheEvent(e) {
  switch (appCache.status) {
    case appCache.UNCACHED: // UNCACHED == 0
        console.log('uncached')
      return 'UNCACHED';
      break;
    case appCache.IDLE: // IDLE == 1
      return 'IDLE';
      break;
    case appCache.CHECKING: // CHECKING == 2
      return 'CHECKING';
      break;
    case appCache.DOWNLOADING: // DOWNLOADING == 3
      return 'DOWNLOADING';
      break;
    case appCache.UPDATEREADY:  // UPDATEREADY == 4
      return 'UPDATEREADY';
      break;
    case appCache.OBSOLETE: // OBSOLETE == 5
      return 'OBSOLETE';
      break;
    default:
      return 'UNKNOWN CACHE STATUS';
      break;
  };
}

function handleCacheError(e) {
  console.log('OFFLINE: Cache failed to update.')
};

// Fired after the first cache of the manifest.
appCache.addEventListener('cached', handleCacheEvent, false);

// Checking for an update. Always the first event fired in the sequence.
appCache.addEventListener('checking', handleCacheEvent, false);

// An update was found. The browser is fetching resources.
appCache.addEventListener('downloading', handleCacheEvent, false);

// The manifest returns 404 or 410, the download failed,
// or the manifest changed while the download was in progress.
appCache.addEventListener('error', handleCacheError, false);

// Fired after the first download of the manifest.
appCache.addEventListener('noupdate', handleCacheEvent, false);

// Fired if the manifest file returns a 404 or 410.
// This results in the application cache being deleted.
appCache.addEventListener('obsolete', handleCacheEvent, false);

// Fired for each resource listed in the manifest as it is being fetched.
appCache.addEventListener('progress', handleCacheEvent, false);

// Fired when the manifest resources have been newly redownloaded.
appCache.addEventListener('updateready', handleCacheEvent, false);

$('document').ready(function() {
    updateDeviceID();
    updateEventID();
    getEvents();
    updateUnsubmitted();
    // Masking for form fields
    $('#bluForm-dob').mask('00-00-0000');
    $('#bluForm-zip').mask('00000');
    $('#bluForm-phone').mask('000-000-0000');
    $('#couponCode').mask('00000');
    $('#couponCodeKit').mask('00000');
    $('#couponCodeRepeat').mask('00000');
    $('.cep').mask('00000-000');
    $('.phone').mask('0000-0000');
    $('.phone_with_ddd').mask('(00) 0000-0000');
    $('.phone_us').mask('(000) 000-0000');

    $('.autotab').keyup(function () {
        if (this.value.length == this.maxLength) {
          $(this).next('input').focus();
        }
    });

});

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

// Buttons & Actions
jQuery(function($) {
    /**
     * Use these scanner types
     * Available: "PDF417", "USDL", "Bar Decoder", "Zxing", "MRTD", "UKDL", "MyKad"
     */
    // var types = ["Bar Decoder", "USDL", "PDF417", "UKDL", "MRTD", "Zxing"];
    var types = ["USDL", "PDF417"];

    /* license associated with com.momentumww.bluScanner DEMO ONLY */
    var licenseiOs = "IZXZT3SI-BSSEETU3-OI7PX2JU-XCLIARHD-G6BL6LIY-CH7IMO6F-L7UTJOEW-RDXSFGTV";

    // Remove warning if necessary
    $('input').blur(function(){
        if ($(this).val()) {
            $(this).removeClass('warn');
        }
    });

    $('select').blur(function(){
        if ($(this).val()) {
            $(this).removeClass('warn');
        }
    });

    // Listen for opt in changes...
    // $('input[name="opt_in"]').change(function(e) {
    //     optIn = $('input[name="opt_in"]:checked', '#bluForm').val();

    //     if (optIn == 'true') {
    //         $('#email-address').fadeIn();
    //     } else if (optIn == 'false') {
    //         $('#email-address').fadeOut();
    //         $('input[name="email"]').val('');
    //     }
    // })

    // Listen for 'Tried Blu?' response changes...
    $('input[name="tried_blu"]').change(function(e) {
        triedBlu = $('input[name="tried_blu"]:checked', '#bluForm').val();

        if (triedBlu == 'No') {
            $('#whyNotBlu').fadeIn();
        } else if (triedBlu == 'Yes') {
            $('#whyNotBlu').fadeOut();
            $('textarea[name="blu_no_reason"]').val('');
        }
    });

    // Listen for 'Tried eCig?' response changes...
    $('input[name="tried_ecig"]').change(function(e) {
        triedEcig = $('input[name=tried_ecig]:checked', '#bluForm').val();

        if (triedEcig == 'Yes') {
            $('#pastBrands').fadeIn();
        } else if (triedEcig == 'No') {
            $('#pastBrands').fadeOut();
            // reset the previously hidden field
            $('input[name="ecig_brands_tried[]"]').prop('checked', false);
        }
    });

    // Listen for DOB changes...
    $('input[name="dob"]').blur(function(e) {
        checkAge();
    });

    // triple click to show hidden menu
    $('#bluLogo').on('tap', function(event) {
        event.preventDefault();
        if (clickTimer == null) {
            clickTimer = 1;
            setTimeout(function () {
                clickTimer = null;
            }, 500)
        } else if (clickTimer == 1) {
            clickTimer = 2;
        } else if (clickTimer == 2) {
            clearTimeout(clickTimer);
            clickTimer = null;
            $('#hiddenMenu').fadeIn();
        }
    });

    // hidden menu close button
    $('#closeButton').click(function() {
        $('#hiddenMenu').fadeOut();
    });

    // cache window close button
    $('#closeCache').click(function() {
        $('#cacheWindow').fadeOut();
    });

    // select text on click/tap
    $('#cacheText').click(function () {
       $(this).select();
    });

    // unlock icon
    $('#deviceLock').on('tap', function(event) {
        event.preventDefault();
        if (lockTimer == null) {
            lockTimer = 1;
            setTimeout(function () {
                lockTimer = null;
            }, 500)
        } else if (lockTimer == 1) {
            clearTimeout(lockTimer);
            lockTimer = null;
            if (deviceFieldUnlocked == true) {
                $('#deviceIDField').attr('disabled', true);
                $('#setDeviceID').fadeOut();
                deviceFieldUnlocked = false;
            } else if (deviceFieldUnlocked == false) {
                $('#deviceIDField').attr('disabled', false);
                $('#deviceIDField').focus();
                $('#setDeviceID').fadeIn();
                deviceFieldUnlocked = true;
            }
        }
    });

    $('#setDeviceID').click(function() {
        var deviceID = $('#deviceIDField').val();
        if (deviceFieldUnlocked) {
            if (!deviceID) {
                alert('Please enter a valid ID!')
            } else {
                localStorage['deviceID'] = deviceID.toUpperCase();;
                updateDeviceID();
                // Get list of events based on latest device ID
                getEvents();
                // clear Event ID
                localStorage['eventID'] = '';
                localStorage['eventName'] = '';
                updateEventID();
                // relock Device ID
                $('#deviceIDField').attr('disabled', true);
                deviceFieldUnlocked = false;
                $('#setDeviceID').fadeOut();
            }
        }
    });

    $('#setEventID').click(function() {
        var eventID = $('select[name="eventID"]').val(),
            eventName = $('select[name="eventID"]').find(':selected').text();
        if (!eventID) {
            alert('Please select an event!')
        } else {
            localStorage['eventID'] = eventID;
            localStorage['eventName'] = eventName;
        }

        updateEventID();
    });

    $('#clearStorage').click(function () {
        window.localStorage.deleteArray('data');
        console.log('Storage deleted');
    });

    $('#showCache').click(function () {
        updateUnsubmitted();
        $('#cacheWindow').fadeIn();
        storedData = window.localStorage.getArray('storedSubmissions');
        var cacheString = JSON.stringify(storedData);
        console.log(cacheString);
        $('#cacheText').html(cacheString);

        // for (var i = 0; i < (storedData.length); i++) {
        //     console.log(storedData[i]);
        //     storedData[i] {
        // }
    });

    $('#submitCache').click(function () {
        sendBacklog('manual');
    });

    $('#startSurvey').click(function() {
        if (validateForm()) {
            // $('#opt_in2').val($('#opt_in').val());
            $('#bluSurvey').fadeIn();
            prevSurveySection = 'form';
        }
    });

    // Next Buttons
    $('#next1').click(function() {
        currentSurveySection = 'start';
        goNext(currentSurveySection);
    });

    $('#nextVapeA').click(function() {
        currentSurveySection = 'vapeA';
        goNext(currentSurveySection);
    });

    $('#nextVapeB').click(function() {
        currentSurveySection = 'vapeB';
        goNext(currentSurveySection);
    });

    $('#nextVapeC').click(function() {
        currentSurveySection = 'vapeC';
        goNext(currentSurveySection);
    });

    $('#nextSmoke').click(function() {
        currentSurveySection = 'smoke';
        goNext(currentSurveySection);
    });

    // Previous Buttons
    $('#prev1').click(function() {
        prevSurveySection = 'form';
        goPrevious(prevSurveySection);
    });

    $('#prevVapeA').click(function() {
        prevSurveySection = 'start';
        goPrevious(prevSurveySection);
    });

    $('#prevVapeB').click(function() {
        prevSurveySection = 'vapeA';
        goPrevious(prevSurveySection);
    });

    $('#prevVapeC').click(function() {
        prevSurveySection = 'vapeB';
        goPrevious(prevSurveySection);
    });

    $('#prevSmoke').click(function() {
        prevSurveySection = 'start';
        goPrevious(prevSurveySection);
    });

    $('#prevFinal').click(function() {
        goPrevious(prevSurveySection);
    });

    function validateSurveySection(currentSurveySection) {
        var sectionValid = true;

        $('#bluSurvey').find('input.required').filter(function() {
        if( $(this).val().length === 0) {
            $(this).addClass('warn');
            valid = false;
        }
    });
    }
    
});

function signupComplete() {
    console.log('signup complete');
}

function sendBacklog(pushCaller) {
    storedData = window.localStorage.getArray('storedSubmissions');

    console.log(storedData.length + ' backlogged entries to send.');

    var entriesSubmitted = 0,
        toBeDeleted = [];

    if (storedData.length > 0){
        for (var i = 0; i < (storedData.length); i++) {
            console.log(storedData[i]);
            //if (storedData[i] != formData) {
                // if data isn't a duplicate
                $.ajax({
                    type: "POST",
                    url: "http://blu.momentum.networkninja.com/api/v1/save",
                    dataType: "json",
                    async: false,
                    data: {data: storedData[i]},
                    success: function(result) {
                        console.log('backlog entry sent');
                        entriesSubmitted++;
                        toBeDeleted.push(i);
                    },
                    statusCode: {
                        200: function (response) {
                            console.log('200: Success!')
                        },
                        400: function (response) {
                            console.log('Bad Request');
                        },
                        400: function (response) {
                            console.log('Bad Request');
                        },
                        404: function (response) {
                            console.log('Unknown Method');
                        },
                        500: function (response) {
                            console.log('Error 500:' + response.responseText);  //MC 6-17
                        },
                        503: function (response) {
                            console.log('Service unavailable');
                        }
                    },
                    error: function (e) {
                        console.log('In error response for backlog ajax call');
                    }
                });
            //}
        }

        // console.log('backlogFired:' + backlogFired); //MC 6-17

        if (toBeDeleted.length > 0) {
            alert(entriesSubmitted + ' items submitted.');
            toBeDeleted.reverse();

            for (var d = 0; d < (toBeDeleted.length); d++) {
                storedData.splice(d, 1);
                console.log('deleted submission with index of: ' + d);
            }

            // reset array
            toBeDeleted = [];
            localStorage['storedSubmissions'] = JSON.stringify(storedData);
        } else {
            if (localStorage['oneTimeClearFired'] == undefined) {
                localStorage['oneTimeClearFired'] = 'false';
            }
            var instantDeviceID = localStorage['deviceID'],
                oneTimeClearFired = localStorage['oneTimeClearFired'];
            // delete the storedSubmissions cache from specific devices, one time.
            if (((instantDeviceID == 'BLU11') || (instantDeviceID == 'NSH1') || (instantDeviceID == 'NSH2') || (instantDeviceID == 'NSH3') || (instantDeviceID == 'NSH4') || (instantDeviceID == 'NSH25') || (instantDeviceID == 'NSH7') || (instantDeviceID == 'NSH9')) && oneTimeClearFired == 'false') {
                alert('Your bad data has been added manually. It will now be purged from your device.')
                window.localStorage.deleteArray('storedSubmissions');
                // once fired, it can't fire again unless this parameter gets reset.
                localStorage['oneTimeClearFired'] = true;
            } else if (pushCaller == 'manual') {
                alert('You have may have bad data in your cache. Please notify a field manager.');
            }
        }
        updateUnsubmitted();

    } 
    else {
        alert('No entries to submit.');
    }

}

/*
    Function Name:  DT_DecoderDataResponse
    Description:    Function called when the scanner successfully reads a barcode.
    Inputs:         "decoderData": "123456789",    //Data read from barcode as a UTF8 string
                    "rawDecoderData": "XSDFSED"    //Raw data in base64 read from the barcode
    Outputs:        None
    Notes:          Returns scan data in both UTF8 and RAW base64 strings
*/

function DT_DecoderDataResponse(decoderData, rawDecoderData, symbologyType, dlParsedObject) {

    // We recomend using the "RAW" Base64 data and decoding it with the built-in "atob" function
        
    // Now you can call processing functions to handle the barcode scanner data however you'd like.
    // var ActiveObject = document.activeElement;
    // ActiveObject.value = scanData;
    // scanData = atob(dlParsedObject);
    
    // Alert the user with a naitive iOS alert box of the scan data
    // DT_AlertBoxRequest(12345, 'Scan Data', 'first name: ' + dlParsedObject.firstName, ['OK']);

    // Check if we're in the survey section
    if (currentSurveySection == 'final') {
        scanCoupon(decoderData);
    } else {
        entryMethod = 'Barcode';
        fillFormFields(decoderData, rawDecoderData, null, null, symbologyType, dlParsedObject);
    }
}   

function DT_MSRDataResponse(msrData, msrDecoderData, dlParsedObject) {
    entryMethod = 'Barcode';
    fillFormFields(null, null, msrData, msrDecoderData, null, dlParsedObject);
}

function checkAge(m, d, y) {

    // Make sure the date actually exists. Could definitely clean this up.
    if ($('#bluForm-dob').val()) {
        var str = $('#bluForm-dob').val(),
            y = str.substr(6,4),
            m = str.substr(0,2),
            d = str.substr(3,2);

        // fix date if only 2 digits
        if (y.length == 2) {
            y = '19' + y;
            $('#bluForm-dob').val(m + '-' + d + '-' + y);
        }

        if ((m > '12') || (d > '31')) {
            $('#bluForm-dob').toggleClass('warn');
        } else if ((m >= 1) && (d >= 1) && (y >= 1)) {
            var birthday = moment([y, (m - 1) , d]),
            now = moment();

            age = now.diff(birthday, 'years');

            if (age < 18) {
                alert('Sorry, you must be at least 18 to participate.');
            } else {
                // set the reformatted DOB for final submission
                reformattedDOB = y + '-' + m + '-' + d;
            }
        } else {
            $('#bluForm-dob').toggleClass('warn');
        }
    }
}

// Get List of events
$('#updateEventList').click(function() {
    getEvents();
});

$('#submit').click(function (event) {
    var sampleValid = $('input:radio[name="sampling_flavor"]').is(':checked'),
        kitValid = $('input:radio[name="sampling_kit"]').is(':checked');
    event.preventDefault();

    // Check if coupon is valid
    // if ($('#couponCode').val().length === 5) {
    //     couponValid = true;
    // } else {
    //     couponValid = false
    //     $('#couponCode').addClass('warn');
    // }


    // Sample & kit validation should be working now
    if (!sampleValid) {
        alert('Please choose a sample.')
    } else if (!kitValid) {
        alert('Did you give away a kit?')
    } else if (sampleValid && kitValid) { //add coupon valid check here if it becomes required again
        // ninja insert the date in the correct format
        $('#bluForm-dob').val(reformattedDOB);
        // still in testing. disable button after being clicked.
        $('#submit').attr('disabled', 'disabled');
        setTimeout(function() {
            $('#submit').removeAttr('disabled');
        }, 2000);
        updateTimestamp();
        updateEventID();
        formData = JSON.stringify([$('#bluForm').serializeJSON()]);

        console.log($('#optin').val());
        $.ajax({
            type: "POST",
            url: "http://blu.momentum.networkninja.com/api/v1/save",
            dataType: "json",
            data: {data : formData},
            success: function(result) {
                submissionBacklog = window.localStorage.getArray('storedSubmissions');
                console.log(submissionBacklog);
                arrayLength = submissionBacklog.length;
                console.log(arrayLength);
                if (arrayLength > 0 ) {
                    console.log('backlog found: ' + arrayLength + ' entries')
                    sendBacklog('automatic');
                }

                alert('Data has been successfully submitted!');

                setTimeout(function() {
                     window.location.reload();
                }, 2000);
            },
            statusCode: {
                200: function (response) {
                    console.log('Success!')
                },
                400: function (response) {
                    console.log('Bad Request')
                },
                400: function (response) {
                    console.log('Bad Request')
                },
                404: function (response) {
                    console.log('Unknown Method')
                },
                500: function (response) {
                    console.log(response.responseText);
                },
                503: function (response) {
                    console.log('Service unavailable')
                }
            },
            error: function (e) {
                alert('No network detected. Data has been cached.');
                window.localStorage.pushArrayItem('storedSubmissions', formData);
                setTimeout(function() {
                     offlineReset();
                }, 2000);
            }
        });

    }
});

function fillFormFields(decoderData, rawDecoderData, msrData, msrDecoderData, symbologyType, dlParsedObject) {

    var FNAME = dlParsedObject.firstName,
        LNAME = dlParsedObject.lastName,
        ADDRESS1 = dlParsedObject.address1,
        ADDRESS2 = dlParsedObject.address2,
        CITY = dlParsedObject.city,
        STATE = dlParsedObject.jurisdictionCode,
        ZIP = dlParsedObject.postalCode,
        DOB = dlParsedObject.birthdate,
        SEX = dlParsedObject.gender;

    // reset the form
    $('#bluForm')[0].reset();
    $('.warn').removeClass('warn');
    
    if (FNAME) {
        $('#bluForm-name').val(FNAME);
        // also fill data entry hidden field. still in testing.
        $('#entryMethod').val(entryMethod);
    } else {
        console.log(FNAME + ' is undefined');
        $('#bluForm-name').toggleClass('warn');
    }

    if (LNAME) {
        $('#bluForm-lname').val(LNAME);
    } else {
        console.log(LNAME + ' is undefined');
        $('#bluForm-lname').toggleClass('warn');
    }

    if (ADDRESS1) {
        $('#bluForm-address1').val(ADDRESS1);
    } else {
        console.log(ADDRESS1 + ' is undefined');
        $('#bluForm-address1').toggleClass('warn');
    }

    if (CITY) {
        $('#bluForm-city').val(CITY);
    } else {
        console.log(CITY + ' is undefined');
        $('#bluForm-city').toggleClass('warn');
    }

    if (STATE) {
        $('#bluForm-state').val(STATE);
    } else {
        console.log(STATE + ' is undefined');
        $('#bluForm-state').toggleClass('warn');
    }

    if (ZIP) {
        var parsedZIP = ZIP.substr(0,5);
        $('#bluForm-zip').val(parsedZIP);
    } else {
        console.log(ZIP + ' is undefined');
        $('#bluForm-zip').toggleClass('warn');
    }

    if (DOB) {
        str = (DOB);
        if (!/^(\d){8}$/.test(str)) {
            // invalid date handling
        }

        var d = str.substr(6,2),
            m = str.substr(4,2),
            y = str.substr(0,4);

        $('#bluForm-dob').val(m + '-' + d + '-' + y);
        checkAge(y, m, d);
    } else {
        console.log(DOB + ' is undefined')
    }

    if (SEX) {
        sex = (SEX);

        if ((sex == '1') || (sex == 'male') || (sex == 'MALE') || (sex == 'Male')) {
            $('#bluForm-sex-m').prop('checked', true);
        } else if (sex == '2' || (sex == 'female') || (sex == 'FEMALE') || (sex == 'Female')) {
            $('#bluForm-sex-f').prop('checked', true);
        } else {
            $('#bluForm-sex-n').prop('checked', true);
        }
    } else {
        console.log('Gender is undefined')
    }
}

function scanCoupon(decoderData) {
    $('#couponCode').val(decoderData);
}

// offline form resetting functionality
function offlineReset() {
    // reset variables
    prevSurveySection = null;
    submitFired = null;
    backlogFired = null;
    triedblu = null;
    triedEcig = null;
    reformattedDOB = null;
    age = null;

    $('#bluForm')[0].reset();
    $('#bluForm').trigger('reset');
    $('input#optin-y').prop('checked', true);
    $('.warn').removeClass('warn');
    // hide all of the initial stuff
    $('section#vapeA').fadeOut();
    $('section#vapeB').fadeOut();
    $('div#whyNotBlu').fadeOut();
    $('section#vapeC').fadeOut();
    $('section#smoke').fadeOut();
    $('div#pastBrands').fadeOut();
    $('section#final').fadeOut();
    $('#bluSurvey').fadeOut();
    updateUnsubmitted();
}

function updateDeviceID() {
    var latestDeviceID = localStorage['deviceID'];
    if (latestDeviceID) {
        console.log('Device ID = ' + latestDeviceID);
        $('#currentDeviceID').html(latestDeviceID);
        $('#deviceIDField').attr('placeholder', latestDeviceID); // change placeholder to current ID
        $('#deviceIDField').attr('disabled', true); // disable the device ID if there's a current ID
        $('#device_id').val(latestDeviceID);
        $('#deviceIDMsg').fadeOut();
    } else {
        $('#deviceIDMsg').html('No Device ID!');
        $('#deviceIDMsg').addClass('warn');
    }
}

function updateEventID() {
    var latestEventID = localStorage['eventID'],
        latestEventName = localStorage['eventName'];
    if (latestEventID != '') {
        console.log('Event ID = ' + latestEventID);
        $('#currentEventID').html(latestEventID);
        $('#events_id').val(latestEventID);
        $('#eventIDMsg').css('color', 'black');
        $('#eventIDMsg').html('Event: ' + latestEventName);
    } else {
        $('#eventIDMsg').html('No Event ID!');
        $('#eventIDMsg').css('color', 'red');
        $('#currentEventID').html('No Event ID');
    }
}

function updateUnsubmitted(){
    var entriesUnsent = window.localStorage.getArray('storedSubmissions').length;
    if (entriesUnsent > 0) {
        $('#unsubmittedEntries').html(window.localStorage.getArray('storedSubmissions').length);
    }
}

function getEvents() {
    deviceID = localStorage['deviceID'];

    if (deviceID) {
        var eventObject = [];

        $('select#eventIDField').empty();

        $.ajax({
            type: 'POST',
            url: 'http://blu.momentum.networkninja.com/api/v1/events',
            data: {device_id : deviceID},
            dataType: 'json',
            success: function(response) {
                eventObject = response;
                if (eventObject[0]) {
                    console.log(eventObject[0].id);
                    $('select#eventIDField').append('<option value="" disabled selected>' + eventObject.length + ' Events Found...</option>');

                    for(var i=0;i<eventObject.length;i++) {
                        // var eventM = eventObject[i].start_timestamp.substr(5, 2);
                        // var eventD = eventObject[i].start_timestamp.substr(8, 2);
                        // var option = $('<option value="'+ eventObject[i].id +'"></option>').text(eventObject[i].name + ' ' + eventM + '/' + eventD + ' in ' + eventObject[i].city);
                        var option = $('<option value="'+ eventObject[i].id +'"></option>').text(eventObject[i].name + ' in ' + eventObject[i].city);
                        $('select#eventIDField').append(option);
                    }
                } else {
                    $('select#eventIDField').append('<option value="" disabled selected>NO EVENTS FOUND</option>');
                }
            },
            statusCode: {
                200: function (response) {
                    console.log('Events list updated.');

                    //check current event id for expiration
                    if ($("#eventIDField option[value='"+ localStorage['eventID'] +"']").length == 0 ){
                        console.log('event ID expired');
                        $('#eventIDMsg').append('<br><span style="color:red">Event expired!</span>');
                    }
                },
                400: function (response) {
                    console.log('Bad Request')
                },
                400: function (response) {
                    console.log('Bad Request')
                },
                404: function (response) {
                    console.log('Unknown Method')
                },
                500: function (response) {
                    $('select#eventIDField').append('<option value="" disabled selected>INVALID DEVICE ID!</option>');
                },
                503: function (response) {
                    console.log('Service unavailable')
                }
            },
            error: function (e) {
                console.log("Server error - " + e.error);
            }
        })
    } else {
        alert('Please verify the device ID.');
    }
}

function goNext(currentPage) {
    console.log(currentPage);
    switch (currentPage) {
        case 'start':
            var smokerType = $('input[name="current_product_use"]:checked', '#bluForm').val();
            console.log(smokerType);
            if ((smokerType == 'Vape') || (smokerType == 'Both')) {
                $('section#start').fadeOut();
                setTimeout(function() {
                    $('section#vapeA').fadeIn();
                }, 800);
            } else if (smokerType == 'Smoke') {
                $('section#start').fadeOut();
                setTimeout(function() {
                    $('section#smoke').fadeIn();
                }, 800);
            } else if (smokerType == 'Neither') {
                $('section#start').fadeOut();
                setTimeout(function() {
                    $('section#final').fadeIn();
                    currentSurveySection = 'final';
                }, 800);
            } else {
                console.log('nothing chosen!');
            }

            prevSurveySection = 'start';

            break;

        case 'vapeA':
            console.log(currentPage);
            var usualBrand = $('input[name="current_ecig_brand"]:checked').val();
            console.log(usualBrand);
            if (usualBrand == 'blu') {
                // currentPage = 'final';
                $('section#vapeA').fadeOut();
                setTimeout(function() {
                    $('section#final').fadeIn();
                    currentSurveySection = 'final';
                }, 800);
            } else if (usualBrand == 'Refillable') {
                // currentPage = 'vapeC';
                $('section#vapeA').fadeOut();
                setTimeout(function() {
                    $('section#vapeC').fadeIn();
                }, 800);
            } else if (usualBrand != undefined) {
                // currentPage = 'vapeB';
                $('section#vapeA').fadeOut();
                setTimeout(function() {
                    $('section#vapeB').fadeIn();
                }, 800);
            } else {
                console.log(usualBrand);
                console.log('please choose a brand!');
                $('#usualBrand').addClass('warn');
            }

            prevSurveySection = 'vapeA';

            break;

        case 'vapeB':
            console.log(currentPage);
            console.log(triedBlu);
            $('section#vapeB').fadeOut();
            setTimeout(function() {
                $('section#final').fadeIn();
                currentSurveySection = 'final';
            }, 800);

            prevSurveySection = 'vapeB';

            break;

        case 'vapeC':
            console.log(currentPage);
            // currentPage = 'final';
            $('section#vapeC').fadeOut();
            setTimeout(function() {
                $('section#final').fadeIn();
                currentSurveySection = 'final';
            }, 800);

            prevSurveySection = 'vapeC';

            break;

        case 'smoke':
            console.log(currentPage);
            // currentPage = 'final';
            $('section#smoke').fadeOut();
            setTimeout(function() {
                $('section#final').fadeIn();
                currentSurveySection = 'final';
            }, 800);

            prevSurveySection = 'smoke';

            break;

        default:
            console.log('Nothing was caught');
    }
}

function goPrevious(previousPage) {
    console.log(previousPage);
    switch (previousPage) {
        case 'form':
            $('#bluSurvey').fadeOut();
            currentSurveySection = null;

            break;

        case 'start':
            $('section#vapeA').fadeOut();
            $('input[name="vape_use_duration"]').prop('checked', false);
            $('input[name="current_ecig_brand"]').prop('checked', false);
            $('section#smoke').fadeOut();
            $('input[name="tried_ecig"]').prop('checked', false);
            $('input:checkbox').attr('checked', false);
            $('section#final').fadeOut();
            $('input[name="sampling_flavor"]').prop('checked', false);
            $('input[name="sampling_kit"]').prop('checked', false);
            setTimeout(function() {
                $('section#start').fadeIn();
            }, 800);
            currentSurveySection = 'start';

            break;

        case 'vapeA':
            $('section#vapeB').fadeOut();
            $('input[name="tried_blu"]').prop('checked', false);
            $('input[name="blu_no_reason"]').prop('checked', false);
            setTimeout(function() {
                $('section#vapeA').fadeIn();
            }, 800);
            currentSurveySection = 'vapeA';

            break;

        case 'vapeB':
            $('section#vapeC').fadeOut();
            $('input[name="why_mod"]').prop('checked', false);
            setTimeout(function() {
                $('section#vapeB').fadeIn();
            }, 800);
            currentSurveySection = 'vapeB';

            break;

        case 'vapeC':
            $('section#final').fadeOut();
            $('input[name="sampling_flavor"]').prop('checked', false);
            $('input[name="sampling_kit"]').prop('checked', false);
            setTimeout(function() {
                $('section#vapeC').fadeIn();
            }, 800);
            
            currentSurveySection = 'vapeC';

            break;

        case 'smoke':
            $('section#final').fadeOut();
            $('input[name="sampling_flavor"]').prop('checked', false);
            $('input[name="sampling_kit"]').prop('checked', false);
            setTimeout(function() {
                $('section#smoke').fadeIn();
            }, 800);
            
            currentSurveySection = 'smoke';

            break;

        default:
            console.log('Nothing was caught');
    }
}

function updateTimestamp() {
    var currentdate = new Date(); 
    var datetime = + currentdate.getFullYear() + "-"
                   + (currentdate.getMonth() + 1)  + "-"
                   + currentdate.getDate() + " "
                   + currentdate.getHours() + ":"
                   + currentdate.getMinutes() + ":"
                   + currentdate.getSeconds();
    $('#timestamp').val(datetime);
}

function validateForm() {

    var bluEmail = $('#bluForm-email').val(),
        deviceID = localStorage['deviceID'],
        eventID = localStorage['eventID'],
        valid = true;

    console.log(bluEmail);

    if (bluEmail) {
        if (!isValidEmailAddress(bluEmail)) {
            console.log('email not valid');
            valid = false;
            $('#bluForm-email').toggleClass('warn');
        }
    } else {
        valid = false;
        $('#bluForm-email').toggleClass('warn');
        console.log('no email set');
    }

    $('#bluForm').find('input.required').filter(function() {
        if( $(this).val().length === 0 ) {
            $(this).addClass('warn');
            valid = false;
        }
    });

    if ($("#bluForm-state :selected").val() == '') {
        valid = false;
        console.log('state not valid');
    }

    // if (!$('input[name="opt_in"]:checked').val()) {
    //     valid = false;
    // }

    if (!$('input[name="gender"]:checked').val()) {
        valid = false;
        console.log('no gender');
    }

    // Make sure the date actually exists
    if ($('#bluForm-dob').val()) {
        var str = $('#bluForm-dob').val(),
            y = str.substr(6,4),
            m = str.substr(0,2),
            d = str.substr(3,2);

        if ((m > '12') || (d > '31')) {
            $('#bluForm-dob').toggleClass('warn');
            valid = false;
        } else if (age < 18) {
            alert('Sorry, you must be at least 18 to participate.');
            $('#bluForm-dob').toggleClass('warn');
            valid = false;
        } else {
            console.log($('#bluForm-dob').val());
        }

    } else {
        valid = false;
    }

    if (!deviceID) {
        valid = false;
        alert('Please set a Device ID');
    } else if (!eventID) {
        valid = false;
        alert('Please set a Event ID');
    }

    console.log(valid);
    return valid;
}

// email validation
function isValidEmailAddress(bluEmail) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(bluEmail);
};

//Local Storage Extensions
Storage.prototype.getArray = function(arrayName) {
    var thisArray = [];
    var fetchArrayObject = this.getItem(arrayName);
    if (typeof fetchArrayObject !== 'undefined') {
        if (fetchArrayObject !== null) { thisArray = JSON.parse(fetchArrayObject); }
    }
    return thisArray;
}

Storage.prototype.pushArrayItem = function(arrayName,arrayItem) {
    var existingArray = this.getArray(arrayName);
    existingArray.push(arrayItem);
    this.setItem(arrayName,JSON.stringify(existingArray));
}

Storage.prototype.popArrayItem = function(arrayName) {
    var arrayItem = {};
    var existingArray = this.getArray(arrayName);
    if (existingArray.length > 0) {
        arrayItem = existingArray.pop();
        this.setItem(arrayName,JSON.stringify(existingArray));
    }
    return arrayItem;
}

Storage.prototype.shiftArrayItem = function(arrayName) {
    var arrayItem = {};
    var existingArray = this.getArray(arrayName);
    if (existingArray.length > 0) {
        arrayItem = existingArray.shift();
        this.setItem(arrayName,JSON.stringify(existingArray));
    }
    return arrayItem;
}

Storage.prototype.unshiftArrayItem = function(arrayName,arrayItem) {
    var existingArray = this.getArray(arrayName);
    existingArray.unshift(arrayItem);
    this.setItem(arrayName,JSON.stringify(existingArray));
}

Storage.prototype.deleteArray = function(arrayName) {
    this.removeItem(arrayName);
}

// Expanding local storage to deal with objects
Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}

// Detect user keypress to hide keyboard
$(document).keypress(function(e) {
    //if user presses go/return/enter
    if(e.which == 13) {
        //hide ipad keyboard
        document.activeElement.blur();
        $('input').blur();
    }
});