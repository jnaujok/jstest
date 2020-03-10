/*
 * Payfone JavaScript API/SDK for Authentication
 *
 * This interface provides a means of calling the Payfone API using only
 * pure JavaScript interfaces. This allows any Web-Based interface that
 * has access to JavaScript, including those inside a WebView, to make
 * calls in a transparent matter, asynchronously, with full results
 * available to the caller.
 *
 * Author: Jeffrey R. Naujok
 * Created: March 2, 2020
 *
 * Copyright (c) 2020, Payfone. All Rights Reserved.
 */

 /**
  *     This class provides an interface to the Payfone Authentication
  * API from within a web page or webView object. It does so using only
  * pure JavaScript and a callback style notification for asynchronous
  * activity.
  *
  * @author: Jeffrey R. Naujok
  * @version: 1.0.0
  */
class Payfone
{
    /**
     * Creates an instance of the Payfone object
     *
     * @constructor
     * @author: Jeffrey R. Naujok
     */
    constructor()
    {
        /** @private */ this.deviceIp = null;
        /** @private */ this.authInProgress = false;
        /** @private */ this.startUrl = null;
        /** @private */ this.finishUrl = null;
        /** @private */ this.callback = null;
        /** @private */ this.targetUrl = null;
        /** @private */ this.vfp = null;
        /** @private */ this.isPostFlow = false;
        /** @private */ this.statusCallback = null;
        /** @private */ this.debugCallback = null;
        /** @private */ this.prodUrl = "http://device.payfone.com/mobileauth/2014/07/01/deviceAuthenticate";
        /** @private */ this.stagingUrl = "http://device.staging.payfone.com/mobileauth/2014/07/01/deviceAuthenticate";
        /** @private */ this.secureProd = "https://device.payfone.com:4443/mobileauth/2014/07/01/secureAuthStepDown";
        /** @private */ this.secureStage = "https://device.staging.payfone.com:4443/mobileauth/2014/07/01/secureAuthStepDown";
    }

    /**
     * This method gets the results of the call to "what's my IP"
     * and uses it to set the private value of the deviceIP within
     * the Payfone object. Since this is the first step of the
     * authentication flow, it then moves on to calling the
     * Start flow automatically.
     *
     * @private
     * @author: Jeffrey R. Naujok
     * @param {string} deviceIp - The device IP returned from the
     *                            remote call.
     */
    setDeviceIp( deviceIp )
    {
        this.deviceIp = deviceIp;
        this.callStartUrl();
    }

    /**
     * This method returns the device IP if a call to "what's my IP"
     * has been made successfully.
     *
     * @return {string} The device's IP address (IPv4 or IPv6).
     */
    getDeviceIp( )
    {
        return this.deviceIp;
    }

    /**
     * This method processes debugging messages and forwards them
     * to the debug callback method if one was provided. If not,
     * the messages are sent to the JavaScript console log.
     *
     * @private
     * @author: Jeffrey R. Naujok
     * @param {string} message - the debugging message to output.
     */
    debug( message )
    {
        if ( this.debugCallback != null )
        {
            this.debugCallback( message );
        }
        else
        {
            console.log( message );
        }
    }

    /**
     * This method updates the status callback with the current
     * percentage complete, and a short description of the current
     * activity. This can be used for conveying status to the user
     * or it can be ignored.
     * If no status callback is provided, then a message is logged
     * to the console.
     *
     * @private
     * @author: Jeffrey R. Naujok
     * @param {number} perc - The percentage complete. A number
     *                        between 0 and 100.
     * @param {string} message - A short description of the current
     *                           activity.
     */
    status( perc, message )
    {
        if ( this.statusCallback != null )
        {
            this.statusCallback( perc, message );
        }
        else
        {
            console.log( "STATUS: " + perc  + "% - " + message );
        }
    }

    /**
     * The notification callback used to return data from authentication back
     * to the calling JavaScript interface.
     *
     * @callback notificationCallback
     * @author: Jeffrey R. Naujok
     * @param {number} statusCode -
     *      The numeric status code signifying the result of the authentication.
     *      0 - Successful.
     *      Non-Zero - failure.
     * @param {string} statusMessage -
     *      A human-readable description of the status. "Success." if the call
     *      to authenticate was successful.
     * @param {boolean} isAuthenticated -
     *      A boolean specifying whether the authentication completed successfully.
     *      "true" means the deviceInformation parameter will be populated.
     * @param {deviceInfo} deviceInformation - An object containing the information
     *      about the device. If "isAuthenticated" is false, this value will be
     *      null.
     */

     /**
      * The callback that receives status update messages as the authentication
      * is proceeding through its steps. This callback is optional to provide.
      *
      * @callback statusCallback
      * @author: Jeffrey R. Naujok
      * @param {number} percentageCompleted -
      *     A numeric value between 0 and 100 specifying how complete the
      *     authentication process is. This is a rough value and should not
      *     be used for anything other than a display of progress.
      * @param {string} currentActivity -
      *     A human-readable description of the activity currently being
      *     performed as part of the authentication process.
      */

     /**
      * The callback that receives debugging messages as the authentication is
      * running. This callback is optional to provide.
      *
      * @callback debugCallback
      * @author: Jeffrey R. Naujok
      * @param {string} message -
      *     A debugging message that can be used to glean insight into the
      *     ongoing authentication process.
      */

    /**
     * This method authenticates the device and returns the results of that
     * authentication via a callback mechanism. The entire authentication is
     * performed asynchronously, and a method of receiving both status updates
     * and debugging information is available also via the use of callbacks.
     *
     * @author: Jeffrey R. Naujok
     * @param {string} startUrl - The URL of a page or script on your server that
     *                            takes a URL parameter of "deviceIp" or optionally
     *                            can capture the device's IP address internally if
     *                            the "fetchDeviceIp" parameter is set to false.
     *                            This script makes a call to the "authenticateByRedirect"
     *                            API on the Payfone servers and returns the
     *                            "redirectTargetUrl" to the device. This can be done
     *                            by sending the entire payload, or a subset of the
     *                            needed fields.
     * @param {string} finishUrl - The URL of a page or script on your server that
     *                             takes a URL parameter of "vfp" and calls the
     *                             Payfone "authenticateByRedirectFinish" API to
     *                             get back the authentication data. It then returns
     *                             either that entire payload as the response, or
     *                             can strip it down to only the five fields that are
     *                             accessed.
     * @param {notificationCallback} notificationCallback -
     *                             A function that is called when authentication
     *                            is complete. This tells the caller whether the
     *                            authentication was successful and any other
     *                            information about the device as needed.
     * @param {boolean} [fetchDeviceIp=true] -
     *                            Whether to call the "what is my IP" remote service
     *                            to determine the world-facing IP address of the
     *                            device. If you have a server that can detect this
     *                            value, you do not need to call the remote service,
     *                            saving a step.
     * @param {statusCallback} [statusCallback=null] -
     *                            A callback function that can receive
     *                            status update messages while the authentication
     *                            is running. If no callback is provided, then the
     *                            status updates are simply logged to the console.log
     *                            function.
     * @param {debugCallback} [debugCallback=null] -
     *                            A callback function that can receive
     *                            messages during authentication that provide
     *                            insight for debugging problems or issues.
     *                            If no function is provided or the value is
     *                            set to null, then debug messages will be
     *                            sent to the console.log function.
     */
    authenticate( startUrl,
                  finishUrl,
                  notificationCallback,
                  fetchDeviceIp = true,
                  statCallback = null,
                  debCallback = null )
    {
        this.deviceIp = null;
        this.targetUrl = null;
        this.vfp = null;
        this.finalVfp = null;
        this.isPostFlow = false;
        this.authInProgress = true;
        this.startUrl = startUrl;
        this.finishUrl = finishUrl;
        this.callback = notificationCallback;
        this.statusCallback = statCallback;
        this.debugCallback = debCallback;

        this.debug( "Starting Authentication." );
        this.status( 5, "Starting Authentication." );

        if ( fetchDeviceIp )
        {
            this.debug( "Fetching device IP address -> started." );
            var xmlHttp = new XMLHttpRequest();
            var handler = this;

            // Start the process by kicking off getting the Device IP.
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                    handler.setDeviceIP(xmlHttp.responseText);
                else if ( xmlHttp.readyState == 4 )
                    handler.setHttpError( xmlHttp.status, xmlHttp.statusText );
            }
            xmlHttp.onerror = function() {
                handler.setHttpError( 500, "A network error occurred." );
            }

            xmlHttp.open("GET", "https://device.payfone.com:4443/whatismyip", true); // true for asynchronous
            xmlHttp.send( null );
            this.status( 16, "Getting Device IP." );
        }
        else
        {
            this.deviceIp = null;
            this.callStartUrl();
        }
    }

    /**
     * This private method is called when the remote response triggers
     * an error, resulting in the response being an HTTP error.
     * When this function is called, it terminates any authentication
     * that was in progress and notifies the caller of the final
     * error state.
     *
     * @private
     *
     * @author: Jeffrey R. Naujok
     * @param {number} statCode - The HTTP status code
     * @param {string} statDesc - The HTTP status description
     */
    setHttpError( statCode, statDesc )
    {
        this.debug( "HTTP Error Result received.  " + statCode + " - " + statDesc );
        this.finalStatus = statCode;
        this.finalDesc = statDesc;
        this.isAuthed = false;
        this.callNotification();
    }

    /**
     * Calls the provided Start URL to begin the authentication process
     * on the device. If the Device IP has been previously retrieved, then
     * it is passed to the start URL as a parameter. If not, only the
     * unadorned start URL is called. This call is made asynchronously.
     *
     * @private
     * @author: Jeffrey R. Naujok
     */
    callStartUrl( )
    {
        this.debug( "Fetching target URL from start call -> started." );
        var xmlHttp = new XMLHttpRequest();
        var handler = this;

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                handler.setTargetUrl(xmlHttp.responseText);
            else if ( xmlHttp.readyState == 4 )
                handler.setHttpError( xmlHttp.status, xmlHttp.statusText );
        }
        xmlHttp.onerror = function() {
            handler.setHttpError( 500, "A network error occurred." );
        }
        var remoteUrl = this.startUrl;
        var sepChar = '?';
        if ( remoteUrl.indexOf( '?' ) > 0 )
        {
            sepChar = '&';
        }

        if ( this.deviceIp != null )
        {
            remoteUrl = this.startUrl + sepChar + "deviceIp=" + this.deviceIp;
        }
        else
        {
            remoteUrl = this.startUrl;
        }

        xmlHttp.open("GET", remoteUrl, true); // true for asynchronous
        xmlHttp.send( null );
        this.status( 33, "Getting Authentication URL." );
    }

    /**
     * This method receives the result of calling the Start URL, which should
     * be a JSON payload. This is called by the handler from the callStartUrl
     * call.
     *
     * @private
     * @author: Jeffrey R. Naujok
     *
     * @param {string} responseText -
     *      This parameter represents a JSON string that contains fields
     *      which will be parsed to extract the target URL for authenticating
     *      the device.
     */
    setTargetUrl( responseText )
    {
        this.debug( "Fetching target URL from start call -> completed." );
        var obj = JSON.parse( responseText );
        if ( obj["status"] == 0 )
        {
            this.targetUrl = obj["targetUrl"];
            // This is an old Sprint URL. We need to bump it up to Secure.
            if ( this.targetUrl.includes( "http://oap7") )
            {
                this.debug( "Detected insecure Sprint call -> converting to secure." );
                this.targetUrl = "https" + this.targetUrl.substring(4);
            }
            else
            {
                if ( this.targetUrl.includes( "pfflow=" ) )
                {
                    // this is an ATT PFFlow URL. Don't alter it here.
                    this.debug( "Detected an AT&T SNAP url." );
                }
                else
                {
                    // This is a T-Mobile URL
                    if ( this.targetUrl.includes( this.prodUrl ) || this.targetUrl.includes( this.stagingUrl ) )
                    {
                        this.debug( "Detected insecure T-Mobile URL. Converting to Secure URL." );
                        // TMO Url
                        if ( this.targetUrl.includes( this.prodUrl ) )
                        {
                            this.targetUrl = this.secureProd + this.targetUrl.substring( this.prodUrl.length );
                        }
                        else
                        {
                            this.targetUrl = this.secureStage + this.targetUrl.substring( this.stagingUrl.length );
                        }
                        this.debug( "Modified T-Mobile URL:" );
                        this.debug( this.targetUrl );
                    }
                }
            }
            this.callAuthUrl();
        }
        else
        {
            this.debug( "Fetching target URL from start call -> Cannot authenticate device. " + obj["status"] + " - " + obj[ "description" ] );
            this.authInProgress = false;
            this.finalStatus = obj["status"];
            this.finalDesc = obj["description"];
            this.isAuthed = false;
            this.callNotification();
        }
    }

    /**
     * This method calls the authentication URL. If this is a "pfflow=2" URL
     * then this method converts the call into a POST rather than a GET call.
     * The call is made asynchronously, and the results are sent to the
     * "setAuthResponse" method.
     * @private
     * @author: Jeffrey R. Naujok
     */
    callAuthUrl()
    {
        this.debug( "Authentication call to " + this.targetUrl.substring(0,20) + "... -> started." );
        var urlBreakdown = this.parseURL( this.targetUrl );
        if ( "pfflow" in urlBreakdown.searchObject )
        {
            if ( urlBreakdown.searchObject["pfflow"] == 2 )
            {
                this.debug( "PFFlow=2 found, converting to POST call." );
                // We have a POST request -- go down the POST Flow Path.
                var encodedData = urlBreakdown.searchObject["data"];
                // Because we use URL-Safe data, we have to switch URL-Safe to standard Base64 before decoding.
                var decodedData = atob( encodedData.replace(/_/g, '/').replace(/-/g, '+'));
                var jsonData = JSON.parse(decodedData);
                var postUrl = jsonData["url"];
                this.targetUrl = postUrl;
                var postData = jsonData["data"];
                this.vfp = jsonData["vfp"];
                this.isPostFlow = true;
                var xmlHttp = new XMLHttpRequest();
                var handler = this;

                xmlHttp.withCredentials = true;

                xmlHttp.onreadystatechange = function() {
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200 )
                        handler.setAuthResponse( { status: xmlHttp.status, body: xmlHttp.responseText, location: xmlHttp.getResponseHeader("location") } );
                    else if ( xmlHttp.readyState == 4 )
                        handler.setHttpError( xmlHttp.status, xmlHttp.statusText );
                }
                xmlHttp.onerror = function() {
                    handler.setHttpError( 500, "A network error occurred." );
                }

                xmlHttp.open("POST", this.targetUrl, true); // true for asynchronous
                xmlHttp.send( postData );
                this.status( 55, "Calling Authentication URL (POST)" );
                return;
            }
        }

        this.debug( "Making GET call." );

        this.isPostFlow = false;
        if ( "vfp" in urlBreakdown.searchObject )
        {
            this.vfp = urlBreakdown.searchObject["vfp"];
            this.debug( "Found VFP in URL: " + this.vfp.substring(0,10) + "..." )
        }

        if ( this.targetUrl.includes( "?" ) )
        {
            this.targetUrl += "&r=f";
        }
        else
        {
            this.targetUrl += "?r=f";
        }

        this.debug( "Calling final target URL of: " + this.targetUrl.substring( 0, 20 ) + "..." );
        // We have a GET Request
        var xmlHttp = new XMLHttpRequest();
        var handler = this;

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200 )
                handler.setAuthResponse( { status: xmlHttp.status, body: xmlHttp.responseText, location: xmlHttp.getResponseHeader("location") } );
            else if ( xmlHttp.readyState == 4 )
                handler.setHttpError( xmlHttp.status, xmlHttp.statusText );
        }
        xmlHttp.onerror = function() {
            handler.setHttpError( 500, "A network error occurred." );
        }

        xmlHttp.open("GET", this.targetUrl, true); // true for asynchronous
        xmlHttp.send( null );
        this.status( 55, "Calling Authentication URL (GET)" );
    }

    /**
     * This method (shamelessly stolen from an answer on Stack Overflow) uses
     * the browser to parse a URL into its separate parts so that it can be
     * processed. It also breaks any URL parameters into individual name/value
     * pairs to be easily used.
     *
     * @private
     * @author: Stack Overflow
     * @param {string} url - The URL to be interpreted.
     *
     * @return {object} A breakdown of the URL composed of multiple fields:
     * <ul>
     *  <li><b>protocol</b> - The protocol (http/https)</li>
     *  <li><b>host</b> - The remote host being contacted</li>
     *  <li><b>hostname</b> - The host name FQDN being contacted.</li>
     *  <li><b>port</b> - The port for the connection (usually 80/443)</li>
     *  <li><b>pathname</b> - The URI portion of the path.</li>
     *  <li><b>search</b> - Parameters (if any) passed to the URL.</li>
     *  <li><b>searchObject</b> - A list of parameters searchable by name.</li>
     *  <li><b>hash</b> - The hash of the URL for caching.</li>
     * </ul>
     */
    parseURL(url) {
        var parser = document.createElement('a'),
            searchObject = {},
            queries, split, i;
        // Let the browser do the work
        parser.href = url;
        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');
        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchObject[split[0].toLowerCase()] = split[1];
        }
        return {
            protocol: parser.protocol,
            host: parser.host,
            hostname: parser.hostname,
            port: parser.port,
            pathname: parser.pathname,
            search: parser.search,
            searchObject: searchObject,
            hash: parser.hash
        };
    }

    /**
     * Given the result of the authentication call, this attempts to extract
     * the Verification Fingerprint from the response data.
     *
     * @private
     * @author: Jeffrey R. Naujok
     *
     * @param {object} responseObj - an object composed of the response body,
     *        the HTML status code, and any location header on the response.
     */
    setAuthResponse( responseObj )
    {
        this.debug( "Authentication response received -> " + responseObj.status );
        if ( responseObj.status != 200 )
        {
            // This was a redirect -- which shouldn't happen but -- we need to follow the redirect
            // so we can get to the result.
            this.targetUrl = responseObj.location;

            this.debug( "Redirect received -- chasing redirect URL." );
            this.callAuthUrl();
        }
        else
        {
            if ( responseObj.body == null || responseObj.body.length == 0 )
            {
                if ( this.isPostFlow )
                {
                    this.finalDesc = "Data was not returned from Authentcation call.";
                    this.finalStatus = 2;
                    this.isAuthed = false;
                    this.authInProgress = false;
                    this.callNotification();
                }
                else
                {
                    var vfpUrl = parseUrl( responseObj.location );
                    if ( "vfp" in vfpUrl.searchObject )
                    {
                        this.finalVfp = vfpUrl.searchObject["vfp"];
                        this.callFinishUrl();
                    }
                }
            }
            else
            {
                if ( this.isPostFlow )
                {
                    var combined = this.vfp + "___" + btoa( responseObj.body );
                    this.finalVfp = combined;
                    this.callFinishUrl();
                }
                else
                {
                    var jsonBody = JSON.parse(responseObj.body);
                    this.finalVfp = jsonBody["vfp"];
                    this.callFinishUrl();
                }
            }
        }
    }

    /**
     * This method calls the finish URL provided at the start of authentication.
     * It passes in the final determined VFP, which the finish URL should use
     * to call the "authenticateByRedirectFinish" API and return the data.
     * Like all other calls, this call is performed asynchronously, with the
     * result of the call being handled by the "setAuthData" function.
     *
     * @private
     * @author: Jeffrey R. Naujok
     */
    callFinishUrl( )
    {
        this.debug( "Fetching authentication results from finish call -> Started." );
        var xmlHttp = new XMLHttpRequest();
        var handler = this;

        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                handler.setAuthData(xmlHttp.responseText);
            else if ( xmlHttp.readyState == 4 )
                handler.setHttpError( xmlHttp.status, xmlHttp.statusText );
        }
        xmlHttp.onerror = function() {
            handler.setHttpError( 500, "A network error occurred." );
        }

        var remoteUrl = this.finishUrl + "?vfp=" + this.finalVfp;
        this.debug( "Calling finish URL: " + remoteUrl.substring(0,20) + "..." );

        xmlHttp.open("GET", remoteUrl, true); // true for asynchronous
        xmlHttp.send( null );
        this.status( 75, "Retrieving authentication data.")
    }

    /**
     * This method captures the result of the call to the Finish URL.
     * By default it is designed to expect the same raw JSON response
     * that is returned by "authenticateByRedirectFinish".
     *
     * @private
     * @author: Jeffrey R. Naujok
     *
     * @param {string} responseBody - The response body of the http call
     *         to the finish URL passed in the "authenticate" function.
     */
    setAuthData( responseBody )
    {
        this.debug( "Fetching authentication results from finish call -> Complete." );
        var jsonResponse = JSON.parse(responseBody);
        if ( ( "Status" in jsonResponse ) && ( jsonResponse["Status"] == 0 ) )
        {
            this.finalStatus = jsonResponse["Status"];
            this.finalDesc = jsonResponse["Description"];
            var innerResponse = jsonResponse["Response"];
            this.msisdn = innerResponse["MobileNumber"];
            this.carrier = innerResponse["MobileOperatorName"];
            this.payfoneAlias = innerResponse["PayfoneAlias"];
            this.isAuthed = true;
            this.debug( "Found mobile number " + this.msisdn + ", carrier: " + this.carrier );
            this.callNotification();
        }
        else
        {
            this.debug( "Fetching authentication results from finish call -> Failed.  " + jsonResponse["Description"] );
            this.finalStatus = jsonResponse["Status"];
            this.finalDesc = jsonResponse["Description"];
            isAuthed = false;
            this.callNotification();
        }
    }

    /**
     * This method takes the result of authentication and returns them
     * to the callback function provided in the "authenticate" call for
     * notification.
     *
     * @private
     * @author: Jeffrey R. Naujok
     */
    callNotification()
    {
        this.status( 98, "Notifying caller of results.")
        this.debug( "Notifying caller of results." );
        this.callback( this.finalStatus, this.finalDesc, this.isAuthed, this.isAuthed ? { number: this.msisdn, carrier: this.carrier, pfid: this.payfoneAlias } : null );
        this.authInProgress = false;
        this.status( 100, "Authentication complete.")
    }
}
