# Submission name

Mighty Morphin Power Rangers

# Submission track 

Covid-19

## Contents

1. [Short description](#short-description)
1. [Long description](#long-description)
1. [Project roadmap](#project-roadmap)
1. [Demo video](#demo-video)
1. [The architecture](#the-architecture)
1. [Running the application](#running-the-application)
1. [Live demo](#live-demo)
1. [Built with IBM services](#built-with-ibm)
1. [Team members](#team-members)

## Short description

A chat bot that brings together Covid-19 news and info

## Long description

This is a project that created a chat bot in order to bring together all of the latest information about this new and dangerous virus. This application will allow you to put this chat bot on your website or application and have information about this virus at your customer’s fingertips. Some of the ( things it can do ) is show you telehealth options so you can speak with a doctor before you go wait in line if you suspect you have the virus, find nearby testing locations where available, allow you to check your symptoms, connect with the CDC site for frequently asked questions, and let you look at the number of cases in your immediate area/a specified zip-code in case you absolutely have to make a trip outside of your residence. Our belief is that all this information in a chat box form factor makes it easy to digest and places information received from certified virologists at the tip of your customers’ fingertips. This idea can be extended upon for information around other common communicable diseases as well. So many sicknesses could be reduced or made less severe if there was a common way to spread information about prevention and reduction of exposure.

## Solution roadmap

### Chat-bot of Today:

* Symptom checker
* Covid news from Watson discover
* DC Frequently asked questions
* Nearby cases
* Cases for a specific zip code
* Nearby testing locations
* Telelheath/doctor on demand (is an app)

### Chat-bot of Tomorrow:

* How busy a target business is to determine risk of contact with others
* Open up dialog choices, fuzzier matching
* Influenza info, vaccination, remedies, symptom reducers
* Common cold info similar to above
* Functionality for chatbot if you want to share. Store text locally? Add an email functionality?
* NodeRED voice functionality

## Demo video

https://youtu.be/VdldbhIdPrs

## The architecture

![Crisis chatbot on a web site](https://developer.ibm.com/callforcode/img/Crisis-Chatbot-on-a-web-site.png)

1. The user visits a website with the COVID-19 chatbot and asks a question.
2. The Node.js web server calls Watson Assistant hosted in IBM Cloud.
3. Watson Assistant uses natural language understanding and machine learning to extract entities and intents of the user question.
4. The COVID-19 FAQ is sourced from trusted CDC data.
5. Watson Assistant invokes an OpenWhisk open source-powered IBM Cloud Function.
6. IBM Cloud Function calls Watson Discovery running in IBM Cloud.
7. Watson Discovery scans news articles and responds with relevant articles.
8. Watson Assistant invokes an OpenWhisk open source powered IBM Cloud Function.
9. IBM Cloud Function calls the COVID-19 APIs to get information for nearby testing locations/cases.
10. Watson Assistant replies to the user inquiry.
11. The Node.js web server displays the chat answer to the user.

## Running the application locally

1. Clone the repository, https://github.com/insunghan-cognizant/covid-assistant

1. Install the dependencies:

    ```
    npm install
    ```

1. Run the application:

    ```
    npm start
    ```

## Live demo

You can find a running system at [https://covid-simple.us-south.cf.appdomain.cloud/](https://covid-simple.us-south.cf.appdomain.cloud/)

## Built with IBM services

* [IBM Cloud Foundry](https://cloud.ibm.com/catalog?search=cloud%20foundry#search_results) - Deploy to IBM environment to run the application
* [IBM Watson Assistant](https://cloud.ibm.com/catalog/services/watson-assistant?location=eu-gb) - For chat and AI features
* [IBM Cloud Functions](https://cloud.ibm.com/functions/) - The compute platform for handing logic
* [IBM Discovery](https://cloud.ibm.com/catalog/services/discovery?location=eu-gb) - For finding news

## Team members
* Andres Inciarte: andres.inciarte@cognizant.com
* Hun Sub (Aaron) Lee: hunsub.lee@cognizant.com
* Insung Han: insung.han@cognizant.com
* James Jernigan: james.jernigan@cognizant.com
* Ovie Omene: Ogheneovie.Omene@cognizant.com
