// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true*/

var ConversationPanel = (function () {
  var settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.from-user',
      fromWatson: '.from-watson',
      latest: '.latest'
    },
    authorTypes: {
      user: 'user',
      watson: 'watson'
    }
  };

  var testCoords;

  // Publicly accessible methods defined
  return {
    init: init,
    inputKeyDown: inputKeyDown,
    sendMessage: sendMessage,
    askTestingLocationQuestion: askTestingLocationQuestion,
    askQuestion: askQuestion,
    askNearMeQuestion: askNearMeQuestion,
    checkSymptoms: checkSymptoms
  };

  // Initialize the module
  function init() {
    chatUpdateSetup();
    Api.getSessionId(function() {
      Api.sendRequest('', null);
    });
    setupInputBox();
  }
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup() {
    var currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function (newPayloadStr) {
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.user);
    };

    var currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function (newPayloadStr) {
      currentResponsePayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr).result, settings.authorTypes.watson);
    };

    Api.setErrorPayload = function (newPayload) {
      displayMessage(newPayload, settings.authorTypes.watson);
    };
  }

  // Set up the input box to underline text as it is typed
  // This is done by creating a hidden dummy version of the input box that
  // is used to determine what the width of the input text should be.
  // This value is then used to set the new width of the visible input box.
  function setupInputBox() {
    var input = document.getElementById('textInput');
    var dummy = document.getElementById('textInputDummy');
    var minFontSize = 14;
    var maxFontSize = 16;
    var minPadding = 4;
    var maxPadding = 6;

    // If no dummy input box exists, create one
    if (dummy === null) {
      var dummyJson = {
        'tagName': 'div',
        'attributes': [{
          'name': 'id',
          'value': 'textInputDummy'
        }]
      };

      dummy = Common.buildDomElement(dummyJson);
      document.body.appendChild(dummy);
    }

    function adjustInput() {
      if (input.value === '') {
        // If the input box is empty, remove the underline
        input.classList.remove('underline');
        input.setAttribute('style', 'width:' + '100%');
        input.style.width = '100%';
      } else {
        // otherwise, adjust the dummy text to match, and then set the width of
        // the visible input box to match it (thus extending the underline)
        input.classList.add('underline');
        var txtNode = document.createTextNode(input.value);
        ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height',
          'text-transform', 'letter-spacing'
        ].forEach(function (index) {
          dummy.style[index] = window.getComputedStyle(input, null).getPropertyValue(index);
        });
        dummy.textContent = txtNode.textContent;

        var padding = 0;
        var htmlElem = document.getElementsByTagName('html')[0];
        var currentFontSize = parseInt(window.getComputedStyle(htmlElem, null).getPropertyValue('font-size'), 10);
        if (currentFontSize) {
          padding = Math.floor((currentFontSize - minFontSize) / (maxFontSize - minFontSize) *
            (maxPadding - minPadding) + minPadding);
        } else {
          padding = maxPadding;
        }

        var widthValue = (dummy.offsetWidth + padding) + 'px';
        input.setAttribute('style', 'width:' + widthValue);
        input.style.width = widthValue;
      }
    }

    // Any time the input changes, or the window resizes, adjust the size of the input box
    input.addEventListener('input', adjustInput);
    window.addEventListener('resize', adjustInput);

    // Trigger the input event once to set up the input box and dummy element
    Common.fireEvent(input, 'input');



    //get local coords
    if(navigator.geolocation){
      //if geolocation successful
      const success=(pos)=>{
        testCoords={
          lat : pos.coords.latitude,
          lng : pos.coords.longitude
        }; 
      };
      const error=(err)=>{
        
        //maybe nothing, or figure out a different way to get coords
      };            
      navigator.geolocation.getCurrentPosition(success,error); 
    }  

  }

  // Display a user or Watson message that has just been sent/received
  function displayMessage(newPayload, typeValue) {
    var isUser = isUserMessage(typeValue);
    //var textExists = newPayload.generic;
    if ((newPayload.output && newPayload.output.generic) ||  newPayload.input){
      // Create new message generic elements
      var responses = buildMessageDomElements(newPayload, isUser);
      var chatBoxElement = document.querySelector(settings.selectors.chatBox);
      var previousLatest = chatBoxElement.querySelectorAll((isUser ? settings.selectors.fromUser : settings.selectors.fromWatson) +
        settings.selectors.latest);
      // Previous "latest" message is no longer the most recent
      if (previousLatest) {
        Common.listForEach(previousLatest, function (element) {
          element.classList.remove('latest');
        });
      }
      setResponse(responses, isUser, chatBoxElement, 0, true);
    }
  }

  // Recurisive function to add responses to the chat area
  function setResponse(responses, isUser, chatBoxElement, index, isTop) {
    if (index < responses.length) {
      var res = responses[index];
      if (res.type !== 'pause') {
        var currentDiv = getDivObject(res, isUser, isTop);
        chatBoxElement.appendChild(currentDiv);
        // Class to start fade in animation
        currentDiv.classList.add('load');
        // Move chat to the most recent messages when new messages are added
        setTimeout(function () {
          // wait a sec before scrolling
          scrollToChatBottom();
        }, 1000);
        setResponse(responses, isUser, chatBoxElement, index + 1, false);
      } else {
        var userTypringField = document.getElementById('user-typing-field');
        if (res.typing) {
          userTypringField.innerHTML = 'Watson Assistant Typing...';
        }
        setTimeout(function () {
          userTypringField.innerHTML = '';
          setResponse(responses, isUser, chatBoxElement, index + 1, isTop);
        }, res.time);
      }
    }
  }

  // Constructs new DOM element from a message
  function getDivObject(res, isUser, isTop) {
    var classes = [(isUser ? 'from-user' : 'from-watson'), 'latest', (isTop ? 'top' : 'sub')];
    var messageJson = {
      // <div class='segments'>
      'tagName': 'div',
      'classNames': ['segments'],
      'children': [{
        // <div class='from-user/from-watson latest'>
        'tagName': 'div',
        'classNames': classes,
        'children': [{
          // <div class='message-inner'>
          'tagName': 'div',
          'classNames': ['message-inner'],
          'children': [{
            // <p>{messageText}</p>
            'tagName': 'p',
            'text': res.innerhtml
          }]
        }]
      }]
    };
    return Common.buildDomElement(messageJson);
  }

  // Checks if the given typeValue matches with the user "name", the Watson "name", or neither
  // Returns true if user, false if Watson, and null if neither
  // Used to keep track of whether a message was from the user or Watson
  function isUserMessage(typeValue) {
    if (typeValue === settings.authorTypes.user) {
      return true;
    } else if (typeValue === settings.authorTypes.watson) {
      return false;
    }
    return null;
  }

  function getOptions(optionsList, preference) {
    var list = '';
    var i = 0;
    if (optionsList !== null) {
      if (preference === 'text') {
        list = '<ul>';
        for (i = 0; i < optionsList.length; i++) {
          if (optionsList[i].value) {
            list += '<li><div class="options-list" onclick="ConversationPanel.sendMessage(\'' +
            optionsList[i].value.input.text + '\');" >' + optionsList[i].label + '</div></li>';
          }
        }
        list += '</ul>';
      } else if (preference === 'button') {
        list = '<br>';
        for (i = 0; i < optionsList.length; i++) {
          if (optionsList[i].value) {
            var item = '<div class="options-button" onclick="ConversationPanel.sendMessage(\'' +
              optionsList[i].value.input.text + '\');" >' + optionsList[i].label + '</div>';
            list += item;
          }
        }
      }
    }
    return list;
  }

  function getResponse(responses, gen) {
    var title = '', description = '';
    if (gen.hasOwnProperty('title')) {
      title = gen.title;
    }
    if (gen.hasOwnProperty('description')) {
      description = '<div>' + gen.description + '</div>';
    }
    if (gen.response_type === 'image') {
      var img = '<div><img src="' + gen.source + '" width="300"></div>';
      responses.push({
        type: gen.response_type,
        innerhtml: title + description + img
      });
    } else if (gen.response_type === 'text') {
      var textToDisplay = getTextToDisplay(gen.text);
      responses.push({
        type: gen.response_type,
        innerhtml: textToDisplay
      });
    } else if (gen.response_type === 'pause') {
      responses.push({
        type: gen.response_type,
        time: gen.time,
        typing: gen.typing
      });
    } else if (gen.response_type === 'option') {
      var preference = 'text';
      if (gen.hasOwnProperty('preference')) {
        preference = gen.preference;
      }

      var list = getOptions(gen.options, preference);
      responses.push({
        type: gen.response_type,
        innerhtml: title + description + list
      });
    }
  }

  // get the innerText from the clickable search buttons and send a question to Watson
  function askTestingLocationQuestion(event) {
    const stateName = event.target.innerText;
   
    const questionToSend = `What are testing locations for the state of ${stateName}?`;

    sendMessage(questionToSend);
  }

  function askNearMeQuestion(event) {
    
    // TODO: replace lng and lat
    var lng;
    var lat;
    var coords;
    

    // if(navigator.geolocation){
    //   //if geolocation successful
    //   const success=(pos)=>{
    //     coords={
    //       lat : pos.coords.latitude,
    //       lng : pos.coords.longitude
    //     }; 
    //     lat=coords.lat;
    //     lng=coords.lng;
    //     //create and send msg
    //     const questionToSend = `Cases in longitude ${lng} and latitude ${lat}`;
    //     sendMessage(questionToSend);
    //   };
    //   const error=(err)=>{
        
    //     //get watson to ask for state name or zipcode
    //   };            
    //   navigator.geolocation.getCurrentPosition(success,error); 
    // }   
    // else{      
    //   //get Watson to ask for state name/zipcode and run appropriate query
    // }


    const questionToSend = `Cases in longitude ${testCoords.lng} and latitude ${testCoords.lat}`;
    sendMessage(questionToSend);

    const questionToSend2 = `Test second query`;
    sendMessage(questionToSend2);
  }


  function checkSymptoms(event){


  }

  // get the innerText from the clickable search buttons and send a question to Watson
  function askQuestion(event) {
    const questionToSend = event.target.innerText;
    
    sendMessage(questionToSend);
  }

  // convert response text (json formatted or plain) to plain text
  function getTextToDisplay(text) {
    var parsedObj;
    var textToDisplay = '';

    try {
      parsedObj = JSON.parse(text);
   
      if( parsedObj.type == "testing-location") {
      //use the lenght of the summary array to make each address display so that the google links can be created
        for (var i = 0; i < parsedObj.summary.length; i++) {
          var name = parsedObj.summary[i].name;
          var phone = parsedObj.summary[i].phones[0].number;
          var address = parsedObj.summary[i].physical_address[0].address_1;
          var city = parsedObj.summary[i].physical_address[0].city;
          var state = parsedObj.summary[i].physical_address[0].state_province;
          var postalCode = parsedObj.summary[i].physical_address[0].postal_code;
          var description = parsedObj.summary[i].description;

          //.replace removes spaces from the names so that they can be used on the url
          var term = address.replace(/ /g, '') + city.replace(/ /g, '') + state.replace(/ /g, '') + postalCode;
          
          var url = 'https://maps.google.com/?q=' + term;
        
          textToDisplay += '<a href=\''  + url + '\' target=\'_blank\'>' + name + '</a>' + ' | ' + phone + ' | ' 
                      + address + ' ' + city + ', ' + state + ' ' + postalCode   
                      + '<hr/>'
     
        } 
      } else if( parsedObj.type == "cases-coordinate") {
        for (var i = 0; i < parsedObj.summary.data.length; i++) {
          var county = parsedObj.summary.data[i].name
          var cases = parsedObj.summary.data[i].latestData.cases
          var deaths = parsedObj.summary.data[i].latestData.deaths
          var recovered = parsedObj.summary.data[i].latestData.recovered
          var date = parsedObj.summary.data[i].latestData.date
        
          textToDisplay += county +': ' + cases + ' cases, ' + deaths + ' deaths, ' + recovered + ' recovered, as of ' + date + '<hr/>'
     
        } 
      
      }

    } catch (e) {
      textToDisplay = text;
    }
    return textToDisplay;
  }


  // Constructs new generic elements from a message payload
  function buildMessageDomElements(newPayload, isUser) {
    var textArray = isUser ? newPayload.input.text : newPayload.output.text;
    if (Object.prototype.toString.call(textArray) !== '[object Array]') {
      textArray = [textArray];
    }

    var responses = [];

    if (newPayload.hasOwnProperty('output')) {
      if (newPayload.output.hasOwnProperty('generic')) {

        var generic = newPayload.output.generic;

        generic.forEach(function (gen) {
          getResponse(responses, gen);
        });
      }
    } else if (newPayload.hasOwnProperty('input')) {
      var input = '';
      textArray.forEach(function (msg) {
        input += msg + ' ';
      });
      input = input.trim()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      if (input.length !== 0) {
        responses.push({
          type: 'text',
          innerhtml: input
        });
      }
    }
    return responses;
  }

  // Scroll to the bottom of the chat window
  function scrollToChatBottom() {
    var scrollingChat = document.querySelector('#scrollingChat');
    scrollingChat.scrollTop = scrollingChat.scrollHeight;
  }

  function sendMessage(text) {
    // Send the user message
    Api.sendRequest(text);
  }

  // Handles the submission of input
  function inputKeyDown(event, inputBox) {
    // Submit on enter key, dis-allowing blank messages
    if (event.keyCode === 13 && inputBox.value) {
      sendMessage(inputBox.value);
      // Clear input box for further messages
      inputBox.value = '';
      Common.fireEvent(inputBox, 'input');
    }
  }

}());
