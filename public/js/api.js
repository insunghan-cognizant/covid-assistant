// The Api module is designed to handle all interactions with the server

var Api = (function() {
  var requestPayload;
  var responsePayload;
  var messageEndpoint = '/api/message';

  var sessionEndpoint = '/api/session';

  var sessionId = null;

  // Publicly accessible methods defined
  return {
    sendRequest: sendRequest,
    getSessionId: getSessionId,

    // The request/response getters/setters are defined here to prevent internal methods
    // from calling the methods without any of the callbacks that are added elsewhere.
    getRequestPayload: function() {
      return requestPayload;
    },
    setRequestPayload: function(newPayloadStr) {
      requestPayload = JSON.parse(newPayloadStr);
    },
    getResponsePayload: function() {
      return responsePayload;
    },
    setResponsePayload: function(newPayloadStr) {
      responsePayload = JSON.parse(newPayloadStr).result;
    },
    setErrorPayload: function() {
    }
  };

  function getSessionId(callback) {
    var http = new XMLHttpRequest();
    http.open('GET', sessionEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function () {
      if (http.readyState === XMLHttpRequest.DONE) {
        let res = JSON.parse(http.response);
        sessionId = res.result.session_id;
        callback();
      }
    };
    http.send();
  }


  // Send a message request to the server
  function sendRequest(text) {
    // Build request payload
    var payloadToWatson = {
      session_id: sessionId
    };

    payloadToWatson.input = {
      message_type: 'text',
      text: text,
    };

    // note use this for google address https://maps.google.com/?q=term

    // Built http request
    var http = new XMLHttpRequest();
    http.open('POST', messageEndpoint, true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function() {
      if (http.readyState === XMLHttpRequest.DONE && http.status === 200 && http.responseText) {

        Api.setResponsePayload(http.responseText);
        
        //myObj is the obj that comes in the form of a string and needs to be parsed again
        var myObj = JSON.parse(http.responseText).result.output.generic[1].text;
        var parsedObj = JSON.parse(myObj);

        //use the lenght of the summary array to make each address display so that the google links can be created
        for (var i = 0; i < parsedObj.summary.length; i++) {
          
          var address = parsedObj.summary[i].physical_address[0].address_1;
          var city = parsedObj.summary[i].physical_address[0].city;
          var state = parsedObj.summary[i].physical_address[0].state_province;
          var postalCode = parsedObj.summary[i].physical_address[0].postal_code;

          //.replace removes spaces from the names so that they can be used on the url
          var term = address.replace(/ /g, '') + city.replace(/ /g, '') + state.replace(/ /g, '') + postalCode;
          
          var url = 'https://maps.google.com/?q=' + term;

          // eslint-disable-next-line no-console
          console.log(url);
        }
         
      } else if (http.readyState === XMLHttpRequest.DONE && http.status !== 200) {
        Api.setErrorPayload({
          'output': {
            'generic': [
              {
                'response_type': 'text',
                'text': 'I\'m having trouble connecting to the server, please refresh the page'
              }
            ],
          }
        });
      }
    };

    var params = JSON.stringify(payloadToWatson);
    // Stored in variable (publicly visible through Api.getRequestPayload)
    // to be used throughout the application
    if (Object.getOwnPropertyNames(payloadToWatson).length !== 0) {
      Api.setRequestPayload(params);
    }

    // Send request
    http.send(params);
  }
}());
