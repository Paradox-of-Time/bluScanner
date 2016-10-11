/*
    Dryrain Technologies Browser API list
*/

/* ************************************************** Outgoing Function calls ************************************************** */


/*
 Function Name:     DT_getRandom:
 Description:       Random number generator with variable length
 Inputs:            length: The desired length of the random number to be generated and returned
 Outputs:           function returns a random number of the length inputted
 */
var RandomNum = DT_getRandom(10);


/*
 Function Name:     DT_setViewPort
 Description:       Function to control the viewport ("zoom") of web pages loaded
 Inputs: length:    initial_scale = Float of initial scale
                    maximum_scale = Float of max scale
                    user_scalable = BOOL
 
 Outputs: none - viewport is changed immediately.  Developers should set this in HTML Head, but this function can control or over-ride it.
 */
DT_setViewPort(1,1,0);


/*
    Function Name:  DT_SetStatusBarDisplayRequest
    Description:    Function to set the iOS Status bar at the top of the screen ON or OFF
    Inputs:         boolean (true/false)
    Outputs:        None
    Notes:          Recomended to call this as early possible in program execution after DT_BrowserStatusResponse == true
*/
DT_SetStatusBarDisplayRequest(true);
        

/*
    Function Name:  SetAutoLockRequest
    Description:    Function to enable or disable the iOS Auto-lock feature
    Inputs:         boolean (true/false)
    Outputs:        None
    Notes:          Be careful about lowering battery life if the iOS device remains powered up at all times
*/
DT_SetAutoLockRequest(false);


/*
    Function Name:  DT_SetSupportedOrientationRequest
    Description:    Function to set allowed orientations for the WebApp 
    Inputs:         "portrait" : true,      //Optional, boolean, true will support this orientation
                    "upsideDown" : true,    //Optional, boolean, true will support this orientation
                    "landscape" : true      //Optional, boolean, true will support this orientation
    Outputs:        None
    Notes:          Note order of boolean values (portrait, upsideDown, landscape)
*/
DT_SetSupportedOrientationRequest(true, false, false);


/*
    Function Name:  DT_DecoderHardwarePowerRequest
    Description:    Function to power-up or power-down the hardware decoder
    Inputs:         boolean (true/false)
    Outputs:        None
    Notes:          Leaving the decoder powered up all the time will reduce the accessories battery life
*/
DT_DecoderHardwarePowerRequest(true);


/*
    Function Name:  DT_ScanningControlRequest
    Description:    Function to start or stop the scanner (LED's on, looking for barcodes)
    Inputs:         boolean (true/false)
    Outputs:        None
    Notes:          This is usually tied to a software scan button
*/
DT_ScanningControlRequest(true);


/*
    Function Name:  DT_LoadURLRequest
    Description:    Function to open a URL in the Safari App within iOS
    Inputs:         "url" : "http://www.coveridapp.com"    //Required, URL to load
    Outputs:        None
    Notes:          Program will enter background and Safari will open with this link in the foreground
*/
DT_LoadURLRequest(URL);


/*
    Function Name:  DT_PowerStatusRequest
    Description:    Function to request power information about the hardware accessory including chargeState, batteryStatus, lowBatteryWarning, and lowBatteryShutdown
    Inputs:         None
    Outputs:        None
    Notes:          Call back for this request goes to DT_PowerStatusResponse()
*/
DT_PowerStatusRequest();


/*
    Function Name:  DT_AlertBoxRequest
    Description:    Function to build a naitive iOS alert box to prompt the user
    Inputs:         "idNumber"      : 63,                           //Required, ID number for this current alert. This will be returned when the box is dismissed.
                    "title"         : "Title",                      //Optional, The title of the alert box.
                    "buttons"       : [ "B1" , "B2" ],              //Optional, 0-Inf buttons that will be displayed with the given name.
                    "message"       : "This is an alert box!",      //Optional, The message displayed in the alert box'
                    "cancelButton"  : "C1"                          //Optional, This button is called out and dismisses the alert without action.
    Outputs:        None
    Notes:          Button tap responses will be sent to DT_AlertBoxResponse()
*/
DT_AlertBoxRequest(AlertID, "title", 'message', ["Yes","No"],"Cancel");


/*
    Function Name:  DT_LogDataRequest
    Description:    Function to send data to the App's CONSOLE for logging/debugging
    Inputs:         None
    Outputs:        None
    Notes:          Use the CONSOLE in the XCODE Organizer window with the iOS device connected via USB to see the log messages
*/
DT_LogDataRequest('message');


/*
    Function Name:  DT_DecoderRawCommandRequest
    Description:    Function to program the accessory hardware via RAW pass-through commands
    Inputs:         Raw programming commands as a single string
    Outputs:        None
    Notes:          This is a specific programming string that will vary between hardware devices
*/
DT_DecoderRawCommandRequest('ProgrammingString');


/*
    Function Name:  DT_BrowserStatusRequest
    Description:    Function to request the ready status of the browser framework.  Will return true once framework as started and javascript API layer has been loaded and injected
    Inputs:         None
    Outputs:        None
    Notes:          The call back to this request goes to the function DT_BrowserStatusResponse()
*/
DT_BrowserStatusRequest();


/*
    Function Name:  DT_ReloadRequest
    Description:    Function to request a reload of the webapp within the iOS Framework
    Inputs:         None
    Outputs:        None
    Notes:          Often used to refresh WebApp after updates are installed
*/
DT_ReloadRequest();


/*
    Function Name:  DT_RuntimeInformationRequest
    Description:    Function to request a wide range of data about the runtime parameters
    Inputs:         None
    Outputs:        None
    Notes:          Gets things like hardware type, accessory type, supported features, etc
*/
DT_RuntimeInformationRequest();


/*
    Function Name:  DT_MSRHardwarePowerRequest
    Description:    Function to power up/power down the MSR hardware
    Inputs:         BOOLEAN (true/false)
    Outputs:        None
    Notes:          No return data back when hardware is started - it just happens
*/
DT_MSRHardwarePowerRequest(true);


/*
    Function Name:  DT_LocationRequest
    Description:    Function to request GPS/WiFi coordinates from iOS and return back lat, lon, and accuracy
    Inputs:         None
    Outputs:        None
    Notes:          Non-GPS devices (like iPod touches) get a best-guess from WiFi, or return 0,0,0 for lat, lon, and accuracy
*/
DT_LocationRequest();


/*
    Function        DT_BatteryStatusRequest:
    Description:    This message is used request the battery status.
    Inputs:         None
    Outputs:        None    Outputs: None
    Notes:          This message returns data by sending an DT_BatteryStatusResponse message.
*/
DT_BatteryStatusRequest();

/*
    Function        DT_ChargeStatusRequest:
    Description:    This message is used request the power status.
    Inputs:         None
    Outputs:        None    Outputs: None
    Notes:          This message returns data by sending an DT_ChargeStatusResponse message.
*/
DT_ChargeStatusRequest();


/*
 Function Name:  DT_SetEnableHIDModeRequest
 Description:    Function to enable/disable the HID MFi profile support on Gen-2 (and newer?) Captuvos
 Inputs:         BOOLEAN (true/false)
 Outputs:        None
 Notes:          No return data back when hardware is enabled - it just happens
 */
DT_SetEnableHIDModeRequest(true);


/*
 Function Name:  DT_SetEnableChargeModeRequest
 Description:    Function to enable/disable charging the iOS device from the MFi sled.
 Inputs:         BOOLEAN (true/false)
 Outputs:        None
 Notes:          No return data back when hardware is enabled - it just happens
 */
DT_SetEnableChargeModeRequest(true);


/*
 Function Name:  DT_SetTorchRequest
 Description:    This message is used to turn on and off the LED flash.
 Inputs:         BOOLEAN (true/false)
 Outputs:        None
 Notes:          No return data back when LED torch is toggled - it just happens
 */
DT_SetTorchRequest(true);


/* ************************************************** Incoming Function calls ************************************************** */




/*
    Function Name:  DT_BrowserStatusResponse
    Description:    Called when the framework has completed all loading and injection of Javascript into the WebApp/HTML page
    Inputs:         None
    Outputs:        Boolean (true/false) value of Browser Ready Status
    Notes:          Fired automatically when Browser framework's ready status changes, can also be requested with DT_BrowserStatusRequest()
*/
function DT_BrowserStatusResponse(browserReadyStatus)
{
    if (browserReadyStatus)
    {
        /* Below are sample commands to run when the Browser Status is READY */
        
        //Power up the decoder hardware
        DT_DecoderHardwarePowerRequest(true);
        
        //Set the Status Bar for the app
        DT_SetStatusBarDisplayRequest(true);
        
        //Set Auto-lock status for the app
        DT_SetAutoLockRequest(false);
        
        //Set allowed orientations for the app (portrait, upsideDown, landscape)
        DT_SetSupportedOrientationRequest(true, false, false);
    }
    else
    {
        return false;
    }
}


/*
    Function Name:  DT_AlertBoxResponse
    Description:    A function called when the user dismisses an alert box by tapping one of the buttons
    Inputs:         "buttonTitle" : "C1",   //Title of the button that was pressed.
                    "idNumber" : 63         //The id number of the alert box.
    Outputs:        An event is disbatched to the DOM with the user's response and the ID number of the alert
    Notes:          idNumber passed to this function matches the idNumber of the request send out in "DT_AlertBoxRequest()"
*/
function DT_AlertBoxResponse(idNumber, buttonTitle)
{
    //Create an "AlertResponse" event and pass it the data.
    //EventListeners in the app handle what to do (then delete themselves)
    
    var AlertEvent          = document.createEvent("Event");
    AlertEvent.response     = buttonTitle;
    
    AlertEvent.initEvent(idNumber,true,true);
    document.dispatchEvent(AlertEvent);
}


/*
    Function Name:  DT_DecoderDataResponse
    Description:    Function called when the scanner successfully reads a barcode.
    Inputs:         "decoderData": "123456789",    //Data read from barcode as a UTF8 string
                    "rawDecoderData": "XSDFSED"    //Raw data in base64 read from the barcode
    Outputs:        None
    Notes:          Returns scan data in both UTF8 and RAW base64 strings
*/
function DT_DecoderDataResponse(decoderData, rawDecoderData)
{    
    var AlertID = DT_getRandom(10);
    DT_AlertBoxRequest(AlertID, "Scan Data", decoderData, ["Done"]);
}

/*
    Function Name:  DT_DeviceConnectionEventResponse
    Description:    Function called when the status of the scanning sled changes
    Inputs:         "deviceConnected": true     //Token data as a boolean
                    "deviceName"                //string of device name that connected
    Outputs:        None
    Notes:          Used to perform some action when hardware disconnects/reconnects
*/
function DT_DeviceConnectionEventResponse(boolConnectedStatus,deviceName)
{
    //alert(boolConnectedStatus);
    // ******* Having problems with this when using real alertboxes, but ok when using javascript alert boxes *********** 
    var AlertID = DT_getRandom(10);
    DT_AlertBoxRequest(AlertID, "Sled Connected Status", boolConnectedStatus, ["OK"]);
}


/*
    Function Name:  DT_PowerStatusResponse
    Description:    Function used to get power management data from the hardware accessory
    Inputs:         "chargeState": "Charging",      //This is the charging state {ChargingComplete, Charging, NotCharging, Undefined}
                    "batteryStatus": "4of4",        //Current status of the battery {ExternalPower, 4of4, 3of4, 2of4, 1of4, 0of4, Undefined}
                    "lowBatteryWarning" : false,    //If a low battery warning has been issued this will be true
                    "lowBatteryShutdown" : false    //If a low battery shutdown is pending this will be true
    Outputs:        None
    Notes:          Response from DT_PowerStatusRequest()
*/
function DT_PowerStatusResponse(chargeState, batteryStatus, lowBatteryWarning, lowBatteryShutdown)
{
    var BattStatus          = document.getElementById('BattStatus');
    var BattImage           = document.getElementById('BattStatus_inner_image');
    
    //Show the battery meter in the lower-left corner
    BattStatus.style.display = 'block';
    
    switch(batteryStatus)
    {
        case '4of4':
            BattImage.style.top = "0px";
            break;
        case '3of4':
            BattImage.style.top = "-11px";
            break;
        case '2of4':
            BattImage.style.top = "-22px";
            break;
        case '1of4':
            BattImage.style.top = "-33px";
            break;
        case '0of4':
            BattImage.style.top = "-44px";
            break;
        case 'ExternalPower':
            BattImage.style.top = "-55px";
            break;
        case 'Undefined':
            BattImage.style.top = "-66px";
            break;
        default: //default to the undefined case
            BattImage.style.top = "-66px";
            break;
    } //end case
}


/*
 ********* NEEDS UPDATE AS OF VER 2.3 ******************
 *****
 ****
 ***
 **
 *
 
    Function Name:  DT_RuntimeInformationResponse
    Description:    Function called when the MSR successfully reads a card strip.
    Inputs:         payload data:
                    "appVersion": "1.0.0",                                  //Version of the browser
                    "iOSVersion": "6.1",                                    //iOS software version number
                    "iOSPlatform": "iPhone(5,1)",                           //iOS platform code
                    "iOSDeviceIdentifier": "3454-2343-4264-2342-1468"       //Device id
                    "deviceName": "Captuvo",                            //Name of the device.
                    "deviceFeatures": [ "MSR", "Decoder" ],             //Features provided by the device.
                    "deviceSerialNumber": "XYZ123",                     //Serial number of the device
                    "deviceFirmware": "1.6.0",                          //Firmware version of the device
    Outputs:        None
    Notes:          Response from DT_RuntimeInformationRequest()
*/
function DT_RuntimeInformationResponse(appVersion,iOSVersion,iOSPlatform,iOSDeviceIdentifier,deviceName,deviceFeatures,deviceSerialNumber,deviceFirmware)
{
    //Do something with all the data passed in...
}


/*
    Function Name:  DT_MSRDataResponse
    Description:    Fires automatically when the browser application enters the background in iOS
    Inputs:         "msrData": "123409871234098765",    //Data read from barcode as a UTF8 string
                    "rawMSRData": "LAKSJFLKJOIUALJSDFKJQOIWEUFJA0::"    //Raw data in base64 read from the MSR
    Outputs:        None
    Notes:          Returns scan data in both UTF8 and RAW base64 strings
*/
function DT_MSRDataResponse(msrData,rawMSRData)
{
    var AlertID = DT_getRandom(10);
    DT_AlertBoxRequest(AlertID, "MSR Data", msrData, ["Done"]);
}


/*
    Function Name:  DT_LocationResponse
    Description:    Response from Browser Framework with GPS location data and accuracy
    Inputs:         "latitude" : 72.342123,     //Current Latitude
                    "longitude" : -123.443,     //Current Longitude
                    "precision" : 100           //Current precision
    Outputs:        None
    Notes:          Uses WiFi location on non-GPS devices and actual a-GPS when available
*/
function DT_LocationResponse(latitude, longitude, precision)
{
    //do stuff
}


/*
    Function Name:  DT_DecoderHardwarePowerReadyResponse
    Description:    This message is sent once the decoder is ready after it is powered on.
    Inputs:         None
    Outputs:        None
    Notes:          Triggered by the DecoderHardwarePowerRequest
*/
function DT_DecoderHardwarePowerReadyResponse()
{
    //do stuff
}


/*
    Function Name:  DT_MSRHardwarePowerReadyResponse
    Description:    This message is sent once the MSR is ready after it is powered on.
    Inputs:         None
    Outputs:        None
    Notes:          Triggered by MSRHardwarePowerRequest 
*/
function DT_MSRHardwarePowerReadyResponse()
{
    //do stuff
}


/*
    Function Name:  DT_CaptuvoDecoderSerialNumberResponse
    Description:    This message returns the Captuvo's decoder serial number.
    Inputs:         Decoder Serial Number from the framework
    Outputs:        None
    Notes:          Triggered by DT_CaptuvoDecoderSerialNumberRequest
*/
function DT_CaptuvoDecoderSerialNumberResponse(DecoderSN)
{
    var AlertID = DT_getRandom(10);
    DT_AlertBoxRequest(AlertID, "CaptuvoSN", DecoderSN, ["OK"]);
}


/*
    Function Name:  DT_BatteryStatusResponse
    Description:    This message is sent when requested by DT_BatteryStatusRequest. A response will be received from every device that is connected.
    Inputs:         batteryStatus: percentage from framework
                    deviceName: device name from framework
    Outputs:        None
    Notes:          Triggered by DT_BatteryStatusRequest
 */
function DT_BatteryStatusResponse(batteryStatus, deviceName)
{
    //batteryStatus
    //deviceName
}


/*
    Function Name:  DT_ChargeStatusResponse
    Description:    This message is sent when requested by DT_ChargeStatusRequest. A response will be received from every device that is connected.
    Inputs:         chargeStatus: String from framework
                    deviceName: device name from framework
    Outputs:        None
    Notes:          Triggered by DT_ChargeStatusRequest
 */
function DT_ChargeStatusResponse(chargeStatus, deviceName);
{
    //chargeStatus
    //deviceName
}


/*
    Function Name:  DT_ApplicationDidEnterBackground
    Description:    Fires automatically when the browser application enters the background in iOS
    Inputs:         None
    Outputs:        None
    Notes:          Called just before App is backgrounded and put "on hold"
*/
function DT_ApplicationDidEnterBackground()
{
    var AlertID = DT_getRandom(10);
    //DT_AlertBoxRequest(AlertID, "App Status Change", 'DT_ApplicationDidEnterBackground', ["OK"]);
}


/*
    Function Name:  DT_ApplicationWillEnterForeground
    Description:    Fires automatically when the browser application is entering the foreground from it's previously backgrounded state
    Inputs:         None
    Outputs:        None
    Notes:          Called just before the App is brought back into view from background status
*/
function DT_ApplicationWillEnterForeground()
{
    var AlertID = DT_getRandom(10);
    //DT_AlertBoxRequest(AlertID, "App Status Change", 'DT_ApplicationWillEnterForeground', ["OK"]);
}


/*
    Function Name:  DT_ApplicationWillResignActive
    Description:    Fires automatically when the app is temporaily put on hold while the multitasking bar is accessed, the sleep/lock button is pressed, etc
    Inputs:         None
    Outputs:        None
    Notes:          Called just before the App is sent into it's "Resign Active" state where it is still in the foreground, but not currently in-use by the user
*/
function DT_ApplicationWillResignActive()
{
    var AlertID = DT_getRandom(10);
    //DT_AlertBoxRequest(AlertID, "App Status Change", 'DT_ApplicationWillResignActive', ["OK"]);
    
    //****** CURRENTLY ED IS DOING THIS - I NEED TO GET CONTROL OVER THIS ****************
    //Disable the scanning hardware
    DT_DecoderHardwarePowerRequest(false);
}


/*
    Function Name:  DT_ApplicationDidBecomeActive
    Description:    Fires automatically when the App once again becomes active after sleep, multi-tasking bar goes away, etc
    Inputs:         None
    Outputs:        None
    Notes:          Called immediately after the App returns from "Resigned Active" state where it was in the foreground, but not currently in-use by the user
*/
function DT_ApplicationDidBecomeActive()
{
    //var AlertID = DT_getRandom(10);
    //DT_AlertBoxRequest(AlertID, "App Status Change", 'DT_ApplicationDidBecomeActive', ["OK"]);
    
    //Check if the browser is ready.  If it is, it will re-program the scanner now.
    DT_BrowserStatusRequest();
}

