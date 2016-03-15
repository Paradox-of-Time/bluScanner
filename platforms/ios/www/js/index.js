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
function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

var formData,
    scanData,
    data = [],
    currentSurveySection,
    submitFired,
    backlogFired,
    triedblu,
    triedEcig,
    clickTimer = null;

$('document').ready(function() {
    updateDeviceID();
    updateEventID();
    getEvents();
    $('#bluForm-dob').mask('0000-00-00');
    $('#bluForm-zip').mask('00000');
    $('#bluForm-phone').mask('000-000-0000');
    $('.cep').mask('00000-000');
    $('.phone').mask('0000-0000');
    $('.phone_with_ddd').mask('(00) 0000-0000');
    $('.phone_us').mask('(000) 000-0000');
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

    // Listen for 'Tried Blu?' response changes...
    $('input[name="tried_blu"]').change(function(e) {
        triedBlu = $('input[name=tried_blu]:checked', '#bluForm').val();

        if (triedBlu == 'No') {
            $('#whyNotBlu').fadeIn();
        } else if (triedBlu == 'Yes') {
            $('#whyNotBlu').fadeOut();
            $('textarea[name=blu_no_reason]').val('');
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

    $('#setDeviceID').click(function() {
        var deviceID = $('#deviceIDField').val();
        if (!deviceID) {
            alert('Please enter a valid ID!')
        } else {
            localStorage['deviceID'] = deviceID;
            updateDeviceID();
            // Get list of events based on latest device ID
            getEvents();
        }
    });

    $('#setEventID').click(function() {
        var eventID = $('select[name="eventID"]').val();
        if (!eventID) {
            alert('Please select an event!')
        } else {
            localStorage['eventID'] = eventID;
            updateEventID();
        }
    });

    $('#scanButton').click(function() {
        console.log('scan button clicked');
        // Remove previous warning labels, if any
        $('.warn').removeClass('warn');
        // Reset form fields
        $('#bluForm')[0].reset();
        
        cordova.plugins.blinkIdScanner.scan(
        
            // Register the callback handler
            function callback(scanningResult) {
                
                // handle cancelled scanning
                if (scanningResult.cancelled == true) {
                    resultDiv.innerHTML = "Cancelled!";
                    return;
                }
                
                // Obtain list of recognizer results
                var resultList = scanningResult.resultList;
                
                // Iterate through all results
                for (var i = 0; i < resultList.length; i++) {

                    // Get individual resilt
                    var recognizerResult = resultList[i];
                    // if (recognizerResult.resultType == "Barcode result") {
                    //     // handle Barcode scanning result

                    //     var raw = "";
                    //     if (typeof(recognizerResult.raw) != "undefined" && recognizerResult.raw != null) {
                    //         raw = " (raw: " + hex2a(recognizerResult.raw) + ")";
                    //     }
                    //     resultDiv.innerHTML = "Data: " + recognizerResult.data +
                    //                        raw +
                    //                        " (Type: " + recognizerResult.type + ")";

                    // }
                    if (recognizerResult.resultType == 'USDL result') {

                        // Camera Scanner Fields
                        // var fields = recognizerResult.fields,
                        //     FNAME = fields[kPPCustomerFirstName],
                        //     LNAME = fields[kPPCustomerFamilyName],
                        //     ADDRESS1 = fields[kPPAddressStreet],
                        //     CITY = fields[kPPAddressCity],
                        //     STATE = fields[kPPAddressJurisdictionCode],
                        //     ZIP = fields[kPPAddressPostalCode],
                        //     DOB = fields[kPPDateOfBirth],
                        //     SEX = fields[kPPSex];

                        // Hardware Scanner Fields
                        var FNAME = scanData.firstName,
                            LNAME = scanData.lastName,
                            ADDRESS1 = scanData.address1,
                            ADDRESS2 = scanData.address2,
                            CITY = scanData.city,
                            STATE = scanData.jurisdictionCode,
                            ZIP = scanData.postalCode,
                            DOB = scanData.birthdate,
                            SEX = scanData.gender;

                        var fields = recognizerResult.fields;
                        
                        if (FNAME) {
                            $('#bluForm-name').val(FNAME);
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
                            $('#bluForm-zip').val(ZIP);
                        } else {
                            console.log(ZIP + ' is undefined');
                            $('#bluForm-zip').toggleClass('warn');
                        }

                        if (DOB) {
                            str = (DOB);
                            if (!/^(\d){8}$/.test(str)) {
                                // invalid date handling
                            }

                            // $('#bluForm-email').val(fields[kPPDateOfBirth]);

                            var y = str.substr(4,4),
                                m = str.substr(0,2),
                                d = str.substr(2,2);

                            $('#bluForm-dob').val(y + '-' + m + '-' + d);
                        } else {
                            console.log(DOB + ' is undefined')
                        }

                        if (SEX) {
                            sex = (SEX);

                            if (sex == '1') {
                                $('#bluForm-sex-m').prop("checked", true);    
                            } else if (sex == '2') {
                                $('#bluForm-sex-f').prop("checked", true);
                            } else {
                                $('#bluForm-sex-n').prop("checked", true);
                            }
                        } else {
                            console.log('Gender is undefined')
                        }
                    }                  
                }
            },
            
            // Register the error callback
            function errorHandler(err) {
                alert('Error: ' + err);
            },

            types, licenseiOs
        );
    });

    $('#clearStorage').click(function () {
        window.localStorage.deleteArray('data');
        console.log('Storage deleted');
    });

    $('#startSurvey').click(function() {
        if (validateForm()) {
            // $('#opt_in2').val($('#opt_in').val());
            $('#bluSurvey').fadeIn();
        }
    });

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

function sendBacklog(emails) {
    // console.log("sending backlog...");

    data = window.localStorage.getArray('data');

    for (var i = 0; i < (data.length); i++) {
        console.log(data[i]);
        if (data[i] != formData) {
            // if data isn't a duplicate
            $.ajax({
                type: "POST",
                url: "https://mandrillapp.com/api/1.0/messages/send-template.json",
                data: {
                    "key": "vV0UyEfydJwLYC8XoC1NwA",
                        "template_name": "ritz-welcome-email-1", //ritz-welcome-email-1 for team 2 | ritz-test for testing
                        "template_content": [
                        {
                           "name": "example name",
                           "content": "example content"
                        }
                    ],
                    "message": {
                        "from_email": "snacks@ritzcrackers.com",
                        "to": [
                        {
                            "email": emails[i], //$("#reg-form").serialize(),
                            "type": "to"
                         }
                        ],
                        "subject": "Get snacking with these Big Ritz Snack Truck Recipes."
                    }
                }

            }).done(function(response) {
                console.log("Backlog sent");
                backlogFired = true;
            }).fail(function(response) {
                console.log("Backlog wasn't sent");
                backlogFired = false;
            });
        }
    }

    console.log("backlogFired = " + backlogFired);

    if (backlogFired != false) {
        console.log("emails array deleted");
        window.localStorage.deleteArray('emails');
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

    //We recomend using the "RAW" Base64 data and decoding it with the built-in "atob" function
        
    //Now you can call processing functions to handle the barcode scanner data however you'd like.
    // var ActiveObject = document.activeElement;
    // ActiveObject.value = scanData;
    // scanData = atob(dlParsedObject);
    
    // Alert the user with a naitive iOS alert box of the scan data
    // DT_AlertBoxRequest(12345, 'Scan Data', 'first name: ' + dlParsedObject.firstName, ['OK']);


    // fillFormFields(decoderData, rawDecoderData, msrData, msrDecoderData, symbologyType, dlParsedObject) 
    fillFormFields(decoderData, rawDecoderData, null, null, symbologyType, dlParsedObject);
}

function DT_MSRDataResponse(msrData, msrDecoderData, dlParsedObject) {
    fillFormFields(null, null, msrData, msrDecoderData, null, dlParsedObject);
}

// Get List of events
$('#updateEventList').click(function() {
    getEvents();
});

$('#submit').click(function (event) {
    event.preventDefault();
    updateTimestamp();
    updateEventID();
    formData = [$('#bluForm').serializeJSON()];

    // formData = [{
    //     "events_id": 481028,
    //     "first_name": "James",
    //     "last_name": "Bond",
    //     "address": "1600 Amphitheater Parkway",
    //     "address_2": "",
    //     "city": "Mountain View",
    //     "state": "CA",
    //     "zip": "94043",
    //     "gender": "male",
    //     "dob": "1980-02-22",
    //     "phone": "773-555-1212",
    //     "email": "user@email.com",
    //     "device_id": "ABCD",
    //     "timestamp": "2014-02-12 17:03:21",
    //     "opt_in": "false",
    //     "coupon_code": "A64",
    //     "communication_opt_in": "true",
    //     "sampling_flavor": "Express Kit",
    //     "current_product_use": "Both",
    //     "tried_ecig": "Yes",
    //     "ecig_brands_tried": [
    //         "BLU",
    //         "Mark10"
    //     ],
    //     "vape_use_duration": "6MO - 1YR",
    //     "mod_or_ecig": "MOD",
    //     "why_mod": "MORE POWERFUL",
    //     "current_ecig_brand": "VUSE",
    //     "tried_blu": "No",
    //     "blu_no_reason": "Free form response",
    //     "blu_nation_opt_in": "Yes",
    //     "liked_sample": "No",
    //     "liked_no_reason": "It tasted bad"
    // }];

    $.ajax({
        type: "POST",
        url: "http://blu.momentum.networkninja.com/api/v1/save",
        dataType: "json",
        data: {data : JSON.stringify(formData)},
        success: function(result) {

            alert('Data has been successfully submitted!');

            setTimeout(function(){
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
                alert('Invalid Device ID!');
            },
            503: function (response) {
                console.log('Service unavailable')
            }
        },
        error: function (e) {
            alert('Something went wrong when submitting.');
        }
    });

    // for (var i = 0; i < (data.length); i++) {
    //     console.log(data[i]);
    //     if (data[i] != formData) {
    //         // if data isn't a duplicate

    //         console.log('not a duplicate!');

    //         var jsonData = JSON.stringify(data[i]);

    //         console.log(jsonData);

    //         $.ajax({
    //             type: "POST",
    //             url: "http://blu.momentum-stage.networkninja.com.com/api/v1/api.php",
    //             data: jsonData
    //         }).done(function(response) {
    //             console.log("Successfully submitted: " + response);
    //             signupComplete();
    //             submitFired = true;
    //         }).fail(function(response) {
    //             console.log("Submitting failed:" + response);
    //             window.localStorage.pushArrayItem('data', formData);
    //             submitFired = false;
    //         });
    //     }
    // }

    // return false; // prevent page refresh
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

        $('#bluForm-dob').val(y + '-' + m + '-' + d);
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

function updateDeviceID() {
    var latestDeviceID = localStorage['deviceID'];
    if (latestDeviceID) {
        console.log('Device ID = ' + latestDeviceID);
        $('#currentDeviceID').html(latestDeviceID);
        $('#device_id').val(latestDeviceID);
        $('#deviceIDError').fadeOut();
    } else {
        $('#deviceIDError').fadeIn();
    }
}

function updateEventID() {
    var latestEventID = localStorage['eventID'];
    if (latestEventID) {
        console.log('Event ID = ' + latestEventID);
        $('#currentEventID').html(latestEventID);
        $('#events_id').val(latestEventID);
        $('#eventIDError').fadeOut();
    } else {
        $('#eventIDError').fadeIn();
    }
}

function getEvents() {
    deviceID = localStorage['deviceID'];

    if (deviceID) {
        var eventObject = [];

        $.ajax({
            type: 'POST',
            url: 'http://blu.momentum.networkninja.com/api/v1/events',
            data: {device_id : deviceID},
            dataType: 'json',
            success: function(response) {
                eventObject = response;
                if (eventObject[0]) {
                    console.log(eventObject[0].id);

                    for(var i=0;i<eventObject.length;i++) {
                        var option = $('<option value="'+ eventObject[i].id +'"></option>').text(eventObject[i].name + ' in ' + eventObject[i].city);
                        $('select#eventIDField').append(option);
                    }
                } else {
                    console.log('No events found!');
                }
            },
            statusCode: {
                200: function (response) {
                    console.log('Success! Events list updated.')
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
                    alert('Invalid Device ID!');
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
    switch (currentPage) {
        case 'start':
            console.log(currentPage);
            var smokerType = $('input[name=current_product_use]:checked', '#bluForm').val();
            console.log(smokerType);
            if ((smokerType == 'Vape') || (smokerType == 'Both')) {
                // currentPage = 'vapeA';
                $('section#start').fadeOut();
                setTimeout(function() {
                    $('section#vapeA').fadeIn();
                }, 800);
            } else if (smokerType == 'Smoke') {
                // currentPage = 'smoke';
                $('section#start').fadeOut();
                setTimeout(function() {
                    $('section#smoke').fadeIn();
                }, 800);
            } else if (smokerType == 'Neither') {
                // currentPage = 'final';
                $('section#start').fadeOut();
                setTimeout(function() {
                    $('section#final').fadeIn();
                }, 800);
            } else {
                // alert('Answer the question!')
                console.log('nothing chosen!');
            }
            break;

        case 'vapeA':
            console.log(currentPage);
            var usualBrand = $( "#usualBrand" ).val();
            console.log(usualBrand);
            if (usualBrand == 'blu') {
                // currentPage = 'final';
                $('section#vapeA').fadeOut();
                setTimeout(function() {
                    $('section#final').fadeIn();
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
                console.log('please choose a brand!')
            }
            break;

        case 'vapeB':
            console.log(currentPage);
            console.log(triedBlu);
            $('section#vapeB').fadeOut();
            setTimeout(function() {
                $('section#final').fadeIn();
            }, 800);
            break;

        case 'vapeC':
            console.log(currentPage);
            // currentPage = 'final';
            $('section#vapeC').fadeOut();
            setTimeout(function() {
                $('section#final').fadeIn();
            }, 800);
            break;

        case 'smoke':
            console.log(currentPage);
            // currentPage = 'final';
            $('section#smoke').fadeOut();
            setTimeout(function() {
                $('section#final').fadeIn();
            }, 800);
            break;

        default:
            console.log('Nothing was caught');
    }
}

function updateTimestamp() {
    var currentdate = new Date(); 
    var datetime = + currentdate.getFullYear() + "-"
                   + (currentdate.getMonth()+1)  + "-" 
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

    if (!isValidEmailAddress(bluEmail)) {
        console.log('email not valid');
        valid = false;
        $('#bluForm-email').toggleClass('warn');
    }

    $('#bluForm').find('input.required').filter(function() {
        if( $(this).val().length === 0 ) {
            $(this).addClass('warn');
            valid = false;
        }
    });

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

// Detect user keypress to hide iPad keyboard
$(document).keypress(function(e) {
    //if user presses go/return/enter
    if(e.which == 13) {
        //hide ipad keyboard
        document.activeElement.blur();
        $("input").blur();
    }
});