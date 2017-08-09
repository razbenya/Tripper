# Tripper
ATD Assignment4 Single Page Application

## Prerequisites
To run the app locally you need NodeJS installed and MongoDB running.
Start MongoDB server by running "mongod.exe" from the command line (located in "C:\Program Files\MongoDB\Server\[MONGODB VERSION]\bin").

## Running the app
* **Running the server**
    1. Ensure you have MongoDB installed and running
    1. Open a command line window and navigate to the "/server" folder below the project root folder
    1. Run `npm install` to install all required npm packages that are defined in the package.json file
    1. Run `node server.js` to start the server, by default it runs at http://localhost:4000
* **Running the client**
    1. Open a command line window and navigate to the "/client" folder below the project root folder
    1. Run `npm install` to install all required npm packages that are defined in the package.json file
    1. Run `npm start` to start the client, a browser window should automatically open to the application at http://localhost:3000


##Structure
```
├───client
│   ├───e2e
│   └───src
│       ├───app
│       │   ├───_components
│       │   │   ├───comment
│       │   │   ├───edit-post
│       │   │   ├───edit-profile
│       │   │   ├───home
│       │   │   ├───login
│       │   │   ├───main-navbar
│       │   │   ├───popular-posts
│       │   │   ├───popular-users
│       │   │   ├───post
│       │   │   ├───post-form
│       │   │   ├───posts-list
│       │   │   ├───profile
│       │   │   ├───register
│       │   │   ├───search
│       │   │   ├───text-form
│       │   │   └───user-card
│       │   ├───_directives
│       │   │   ├───alert
│       │   │   ├───gallery
│       │   │   ├───images-for-edit
│       │   │   └───userlist
│       │   ├───_guards
│       │   ├───_models
│       │   └───_services
│       ├───assets
│       └───environments
└───server
    ├───controllers
    └───services
```