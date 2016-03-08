//Initial variable setup
var batteryTimer;                      //Initial global variable for the battery check interval timer
var hardwarePresent        = false;    //Initial setting of hardware status
var runtimeInformation     = {};       //Create the object to hold Runtime Information

/*
    Function Name:  DT_ApplicationWillResignActive
    Description:    Fires automatically when the app is temporaily put on hold while the multitasking bar is accessed, the sleep/lock button is pressed, etc
    Inputs:         None
    Outputs:        None
    Notes:          Called just before the App is sent into it's "Resign Active" state where it is still in the foreground, but not currently in-use by the user
*/
function DT_ApplicationWillResignActive()
{
    //Disable the scanning hardware
    DT_DecoderHardwarePowerRequest(false);
             
    //Disable the MSR hardware
    //DT_MSRHardwarePowerRequest(false);
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
    //Request ready status and re-start initial startup process
    DT_BrowserStatusRequest();
}
         
//When hardware is plugged in after app has started
function DT_DeviceConnectionEventResponse(boolConnectedStatus, deviceName)
{
    if (boolConnectedStatus)
    {
        //Perform the same actions as when it comes back from sleep
        DT_ApplicationDidBecomeActive();
    }
    else
    {
        //hardwarePresent = false;
        DT_BrowserStatusRequest();
    }
}
         
function programSled(HWmanufacturer)
{
    /*
        Quick notes -- Programming commands for Honeywell Sled:
        DEFALT            = Activate Defaults
        DECHDR1           = Enable Decoder Headers (needed on Captuvo in SDK 1.2.6 and above)
        PLGFOE1           = Turn ON plugin in slot #1
        PLGFOE0           = Turn OFF plugin in slot #1
        PLGFONEasyDLConf  = Enable EasyDL plugin
        BEPPWR0           = Power Up Beeper = off
        ALLENA0           = Disable all Symbologies
        PDFDFT            = Default All PDF417 Settings
        PDFENA1           = PDF417 On
        ! means save settings for this session only
        . means save settings persistantly
    */
                
    var SYN                 = String.fromCharCode(22);  //Part of the programming prefix for Honeywell Scanners
    var CR                  = String.fromCharCode(13);  //Part of the programming prefix for Honeywell Scanners
    var ProgrammingHeader   = SYN+'M'+CR;               //The complete programming prefix for Honeywell Scanners
    var ProgrammingFooter   = '!';                      //The programming suffix for Honeywell Scanners
    
    //Program sled (according to manufacturer)
    switch (HWmanufacturer)
    {
        case 'Honeywell': //Program Captuvo for all code types
            //Defaults, Captuvo Headers, Disable EasyDL
            var ProgramScannerCode  = 'DEFALT;DECHDR1;PLGFOE0';
            var ProgrammingString   = ProgrammingHeader + ProgramScannerCode + ProgrammingFooter;
                     
            //Send programming string to device
            DT_DecoderRawCommandRequest(ProgrammingString, 'captuvo');
        break;
                     
        case 'Code':
            //Program for Code Sled
            //Defaults
            DT_DecoderRawCommandRequest('J', 'code4405');               //Recall Defaults
            //Enable all code types
            DT_DecoderRawCommandRequest('P(0A)1', 'code4405');          //Enable NEC 2 of 5 Symbology
            DT_DecoderRawCommandRequest('P(0B)1', 'code4405');          //Enable Matrix 2 of 5 Symbology
            DT_DecoderRawCommandRequest('P(16)1', 'code4405');          //Enable Data Matrix Rectangular Symbology
            DT_DecoderRawCommandRequest('P(19)1', 'code4405');          //Enable Data Matrix Symbology
            DT_DecoderRawCommandRequest('P(2B)1', 'code4405');          //Enable QR Code Symbology
            DT_DecoderRawCommandRequest('P(1A)1', 'code4405');          //Enable Straight 2 of 5 Symbology
            DT_DecoderRawCommandRequest('P(2A)1', 'code4405');          //Enable Micro PDF417 Symbology
            DT_DecoderRawCommandRequest('P(47)1', 'code4405');          //Enable Maxicode Symbology
            DT_DecoderRawCommandRequest('P(49)1', 'code4405');          //Enable Code 39 Symbology
            DT_DecoderRawCommandRequest('P(4A)1', 'code4405');          //Enable Composite Codes
            DT_DecoderRawCommandRequest('P(4B)1', 'code4405');          //Enable Postal Code Symbology
            DT_DecoderRawCommandRequest('P(4C)1', 'code4405');          //Enable GS1 DataBar Symbology
            DT_DecoderRawCommandRequest('P(4F)1', 'code4405');          //Enable MSI Plessey Symbology
            DT_DecoderRawCommandRequest('P(50)1', 'code4405');          //Enable Aztec Symbology
            DT_DecoderRawCommandRequest('P(6A)1', 'code4405');          //Enable UPC
            DT_DecoderRawCommandRequest('P(6B)1', 'code4405');          //Enable Code 39 Symbology
            DT_DecoderRawCommandRequest('P(6C)1', 'code4405');          //Enable Code 93 Symbology
            DT_DecoderRawCommandRequest('P(6D)1', 'code4405');          //Enable Code 128 Symbology
            DT_DecoderRawCommandRequest('P(6E)1', 'code4405');          //Enable Interleave 2 Of 5 Symbology
            DT_DecoderRawCommandRequest('P(6F)1', 'code4405');          //Enable Codabar Symbology
            DT_DecoderRawCommandRequest('P(F7)1', 'code4405');          //Enable Code 11 Symbology
            DT_DecoderRawCommandRequest('P(F8)1', 'code4405');          //Enable PharmaCode Symbology
            DT_DecoderRawCommandRequest('P(12D)1', 'code4405');         //Enable Hong Kong 2 Of 5 Symbology
            DT_DecoderRawCommandRequest('P(250)1', 'code4405');         //Enable ￼Korean Post Symbology
            DT_DecoderRawCommandRequest('P(29)1', 'code4405');          //Enable PDF417
            //Disable Javascript parsing & OCR
            DT_DecoderRawCommandRequest('P(125)1', 'code4405');         //Bypass JavaScript engine
            DT_DecoderRawCommandRequest('P(127)0', 'code4405');         //Disable OCR
            //Set iOS charge options from sled
            DT_DecoderRawCommandRequest('P(284)2', 'code4405');         //Managed Power Scheme” AKA Intelligent Charging mode (this is default)
            DT_DecoderRawCommandRequest('P(29D)#105', 'code4405');      //Sled Battery Reserve = 100%, only start charging if the iPhone drops below 0x29C value
            DT_DecoderRawCommandRequest('P(29C)#30', 'code4405');       //Sets iPhone critical level (start charge point) to 30%
            DT_DecoderRawCommandRequest('P(285)#15', 'code4405');       //Stop charging value - P(29C) value + P(285) value (30% + 15% = stop charging at 45%)
            //Disable sleep mode
            DT_DecoderRawCommandRequest('P(9F)7FFFFFFF', 'code4405');   //Disable the sled's sleep mode
        break;
                     
        case 'InfinitePeripherals':
            //Program for Linea Pro with Newland engine for all code types
            DT_DecoderRawCommandRequest('nls0001020', 'linearpro_newland'); //Allow all codes to scan
        break;
    }
} //end programSled function
         
function DT_RuntimeInformationResponse(appVersion,
                                        displayName,
                                        executableName,
                                        bundleID,
                                        iOSVersion,
                                        iOSPlatform,
                                        iOSDeviceIdentifier,
                                        platformVersion,
                                        platformBuildDate,
                                        platformSVNRevision,
                                        license,
                                        mfiData)
{
    //Set the common runtime information to global object. Populate HW items if HW exists
    runtimeInformation.appVersion           = appVersion;
    runtimeInformation.iOSVersion           = iOSVersion;
    runtimeInformation.iOSPlatform          = iOSPlatform;
    runtimeInformation.iOSDeviceIdentifier  = iOSDeviceIdentifier;
    runtimeInformation.mfiData              = mfiData;
    runtimeInformation.firmwareRevision     = 'Not Available';
    runtimeInformation.HardwareSN           = 'Not Available';
    runtimeInformation.HardwareModelNumber  = 'Not Available';
    runtimeInformation.HWmanufacturer       = 'Not Available';
                                                    
    //Create string of MFi Device information
    var mfiString = JSON.stringify(mfiData);
            
    //If no MFi devices or nowhere in the string do the words 'sled' or 'linea' exist
    if ((mfiData.length < 1) || ((mfiString.toLowerCase().indexOf('sled') == -1) && (mfiString.toLowerCase().indexOf('linea') == -1)))
    {
        hardwarePresent = false;
        
        //No MFi hardware present. Notify the user and give option to retry
        //*** Handle no sled hardware situation here -- alert user, write to console, do nothing, whatever... ***
    }
    else //MFi sled hardware exists
    {
        //Set hardwarePresent value (used for demo scan mode on/off)
        hardwarePresent = true;
                
        //Power up the decoder hardware
        DT_DecoderHardwarePowerRequest(true);
                                                        
        //Power up the MSR Hardware
        //DT_MSRHardwarePowerRequest(true);
                
        //************** Sled Battery Check Stuff ************************************************************************************
        //Place initial battery status calls immediately, then again after 10 seconds, and then start the battery check interval timer
        //Immediate battery status
        DT_ChargeStatusRequest();
        DT_BatteryStatusRequest();
        
        //Check battery after 10 second delay
        setTimeout(function()
        {
            DT_ChargeStatusRequest();
            DT_BatteryStatusRequest();
        }, 10000);
                
        //Check battery on regular intervals
        //Note - set "var batteryTimer" as a global variable anywhere OUTSIDE this 'DT_RuntimeInformationResponse' function
        clearInterval(batteryTimer);
        batteryTimer = setInterval(function()
        {
            DT_ChargeStatusRequest();
            DT_BatteryStatusRequest();
        }, 120000); //120 seconds between battery queries
        //************** END Sled Battery Check Stuff ************************************************************************************
                    
        //Starting value for device search loop
        var mfiDataSledIndex = 0;
        
        //Find the exact term 'sled' or 'Linea' in the MFi data string, telling us a scanning sled is present
        for (var i=0; i< mfiData.length; i++)
        {
            if ((mfiString.toLowerCase().indexOf('sled') != -1) || (mfiString.toLowerCase().indexOf('linea') != -1)) //product name must have 'sled' or 'linea' in it
                { mfiDataSledIndex = i; }
        }
                                                                                              
        //Set hardware specific runtime information to global object
        runtimeInformation.firmwareRevision     = mfiData[mfiDataSledIndex].firmwareRevision;
        runtimeInformation.HardwareSN           = mfiData[mfiDataSledIndex].serialNumber;
        runtimeInformation.HardwareModelNumber  = mfiData[mfiDataSledIndex].modelNumber;
        runtimeInformation.HWmanufacturer       = mfiData[mfiDataSledIndex].manufacturer;
                                                                                              
        //Program the connected sled for defaults
        if (runtimeInformation.HWmanufacturer.toLowerCase().indexOf('honeywell') != -1)
            { programSled('Honeywell'); }
        else if (runtimeInformation.HWmanufacturer.toLowerCase().indexOf('code') != -1)
            { programSled('Code'); }
        else if (runtimeInformation.HWmanufacturer.toLowerCase().indexOf('datecs') != -1)
            { programSled('InfinitePeripherals'); }
            
        //Set orientations based on device
        if (runtimeInformation.iOSPlatform.toLowerCase().indexOf("ipad") != -1) //iPad
        {
            //Set allowed orientations for the app (portrait, upsideDown, landscape)
            DT_SetSupportedOrientationRequest(true, true, true); //All orientations for iPad
        }
        else //Other iOS device sizes
        {
            //Set allowed orientations for the app (portrait, upsideDown, landscape)
            DT_SetSupportedOrientationRequest(true, false, false); //Portrait orientation only for non-iPad
        }
    }
} //end DT_RuntimeInformationResponse function
         
         

function DT_BrowserStatusResponse(browserReadyStatus) {
    if (browserReadyStatus) {
        /* Below are commands to run when the Browser Status is READY */
                     
        //Request runtime information about the environment the WebApp is running in
        DT_RuntimeInformationRequest();
            
        //Set the Status Bar for the app
        //DT_SetStatusBarDisplayRequest(true);

        //Set Auto-lock status for the app
        //DT_SetAutoLockRequest(false);
    }
    else {
        return false;
    }
}