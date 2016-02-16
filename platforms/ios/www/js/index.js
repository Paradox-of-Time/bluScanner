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
    
        /**
         * Use these scanner types
         * Available: "PDF417", "USDL", "Bar Decoder", "Zxing", "MRTD", "UKDL", "MyKad"
         */
        // var types = ["Bar Decoder", "USDL", "PDF417", "UKDL", "MRTD", "Zxing"];
        var types = ["USDL", "PDF417"];

        /* license associated with com.momentumww.bluScanner */
        var licenseiOs = "IZXZT3SI-BSSEETU3-OI7PX2JU-XCLIARHD-G6BL6LIY-CH7IMO6F-L7UTJOEW-RDXSFGTV";

        // Remove warning if necessary
        $('input').blur(function(){
            if($(this).val()) {
                $(this).removeClass('warn');
            }
        });

        $('select').blur(function(){
            if($(this).val()) {
                $(this).removeClass('warn');
            }
        });

        scanButton.addEventListener('click', function() { 
            // Remove previous warning labels, if any
            $('.warn').removeClass('warn');
            
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

                    // Set constants
                    var FNAME = '#bluForm-name',
                        LNAME = '#bluForm-lname',
                        STREET = '#bluForm-address',
                        CITY = '#bluForm-city',
                        STATE = '#bluForm-state',
                        ZIP = '#bluForm-zip',
                        YEAR = '#bluForm-dob-y',
                        MONTH = '#bluForm-dob-m',
                        DAY = '#bluForm-dob-d',
                        SEXF = '#bluForm-sex-f',
                        SEXM = '#bluForm-sex-m',
                        SEXN = '#bluForm-sex-n';
                    
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

                            var fields = recognizerResult.fields;
                            
                            if (fields[kPPCustomerFirstName]) {
                                $(FNAME).val(fields[kPPCustomerFirstName]);
                            } else {
                                console.log(FNAME + ' is undefined');
                                $(FNAME).toggleClass('warn');
                            }

                            if (fields[kPPCustomerFamilyName]) {
                                $(LNAME).val(fields[kPPCustomerFamilyName]);
                            } else {
                                console.log(LNAME + ' is undefined');
                                $(LNAME).toggleClass('warn');
                            }

                            if (fields[kPPAddressStreet]) {
                                $(STREET).val(fields[kPPAddressStreet]);
                            } else {
                                console.log(STREET + ' is undefined');
                                $(STREET).toggleClass('warn');
                            }

                            if (fields[kPPAddressCity]) {
                                $(CITY).val(fields[kPPAddressCity]);
                            } else {
                                console.log(CITY + ' is undefined');
                                $(CITY).toggleClass('warn');
                            }

                            if (fields[kPPAddressJurisdictionCode]) {
                                $(STATE).val(fields[kPPAddressJurisdictionCode]);
                            } else {
                                console.log(STATE + ' is undefined');
                                $(STATE).toggleClass('warn');
                            }

                            if (fields[kPPAddressPostalCode]) {
                                $(ZIP).val(fields[kPPAddressPostalCode]);
                            } else {
                                console.log(ZIP + ' is undefined');
                                $(ZIP).toggleClass('warn');
                            }

                            if (fields[kPPDateOfBirth]) {
                                str = (fields[kPPDateOfBirth]);
                                if (!/^(\d){8}$/.test(str)) {
                                    // invalid date handling
                                }

                                // $('#bluForm-email').val(fields[kPPDateOfBirth]);

                                var y = str.substr(4,4),
                                    m = str.substr(0,2),
                                    d = str.substr(2,2);

                                $(MONTH).val(m);
                                $(DAY).val(d);
                                $(YEAR).val(y);
                            }

                            if (fields[kPPSex]) {
                                sex = (fields[kPPSex]);

                                if (sex == '1') {
                                    $(SEXM).prop("checked", true);    
                                } else if (sex == '2') {
                                    $(SEXF).prop("checked", true);
                                } else {
                                    $(SEXN).prop("checked", true);
                                }
                            } else {
                                console.log(ZIP + ' is undefined')
                            }


                        }                  

                        // } else if (recognizerResult.resultType == "Zxing result") {
                            
                        //     var fields = recognizerResult.fields;

                        //     resultDiv.innerHTML = /** Personal information */
                        //                         "ID Type: " + fields[kPPmyKadDataType] + "; " +
                        //                         "NRIC Number: " + fields[kPPmyKadNricNumber] + "; " +
                        //                         "Address: " + fields[kPPmyKadAddress] + "; " +
                        //                         "Birth Date: " + fields[kPPmyKadBirthDate] + "; " +
                        //                         "Full Name: " + fields[kPPmyKadFullName] + "; " +
                        //                         "Religion: " + fields[kPPmyKadReligion] + "; " +
                        //                         "Sex: " + fields[kPPmyKadSex] + "; "; +
                        //                         "Data: " + recognizerResult.data + raw + " (Type: " + recognizerResult.type + ")";
                        // }

                        // } else if (recognizerResult.resultType == "MyKad result") {
                            
                        //     var fields = recognizerResult.fields;

                        //     resultDiv.innerHTML = /** Personal information */
                        //                         "ID Type: " + fields[kPPmyKadDataType] + "; " +
                        //                         "NRIC Number: " + fields[kPPmyKadNricNumber] + "; " +
                        //                         "Address: " + fields[kPPmyKadAddress] + "; " +
                        //                         "Birth Date: " + fields[kPPmyKadBirthDate] + "; " +
                        //                         "Full Name: " + fields[kPPmyKadFullName] + "; " +
                        //                         "Religion: " + fields[kPPmyKadReligion] + "; " +
                        //                         "Sex: " + fields[kPPmyKadSex] + "; ";
                        // }
                    }
                },
                
                // Register the error callback
                function errorHandler(err) {
                    alert('Error: ' + err);
                },

                types, licenseiOs
            );
        });

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }

    // Mandrill Code
    jQuery(function($)  
    {
        $("#enter").click(function ()
        {
            email = $("#email").val(); // get email field value

            if (isValidEmailAddress(email)) {

              $.ajax(
              {
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
                           "email": email, //$("#reg-form").serialize(),
                           "type": "to"
                          }
                        ],
                      "subject": "Get snacking with these Big Ritz Snack Truck Recipes."
                    }
                  }
              })
              .done(function() {
                mandrillFired = true;
                //console.log(mandrillFired);
                emails = window.localStorage.getArray('emails');
                arrayLength = emails.length;
                if (arrayLength > 0 ) {
                  sendBacklog();
                }
                signupComplete();
              })
            } else {
              // Set the email to red
              $('#email').css('color', 'red');
              // Then make it black again after a timeout
              setTimeout(function(){$('#email').css('color', 'black');}, 500);
              alert("Please enter a valid email address!");
            }

            setTimeout(function(){
              if (mandrillFired != true) {
                console.log('Error sending message.');
                // save the mail to localstorage, if offline
                window.localStorage.pushArrayItem('emails', email);
                signupComplete();
              }
            }, 1400);

            return false; // prevent page refresh
        });
    });

    function sendBacklog(emails) {
      // console.log("sending backlog...");

      emails = window.localStorage.getArray('emails');

      for (var i = 0; i < (emails.length); i++) {
        // console.log(email);
        // console.log(emails[i]);
        if (emails[i] != email) {
          $.ajax(
          {
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
          })
          .done(function(response) {
            console.log("Backlog email sent");
            backlogFired = true;
          })
          .fail(function(response) {
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

    function isValidEmailAddress(email) {
      var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
      return pattern.test(email);
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
};