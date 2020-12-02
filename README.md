# DICOM Web/App VIEWER

![fullscreen](https://user-images.githubusercontent.com/44565579/100818642-e57ade80-348d-11eb-9b5b-e9dd6bebb0d9.PNG)

DICOM Web/App Viewer 
- Can overlay CT IMAGE, DOSE, and RT STRUCTURE 
- This project based on TEST849 

## Getting Started 
1. Git Clone : https://github.com/choijinkyung/DICOM-RT-VIEWER
2. Installing Node.js
3. Installing npm or yarn
4. Run Scripts
  <br>  4-1) npm run install or yarn install
  <br>  -> install package json
5. For start
  <br>  5-1 ) npm run start or yarn start
  <br>  -> Create a Web page through the local host and port 3000

## Prerequisites 
1. Node.js 
<br> - version : 12.18.3
2. Package Manager 
<br> 2-1) yarn 
<br>    - version : 1.22.5
<br> 2-2) npm 
<br>    - version : 6.14.6

## Installing 
1. npm install cornerstone 
2. npm install cornerstone-core 
<br> version : "cornerstone-core": "^2.3.0"
3. npm install cornerstone-math 
<br> version : "cornerstone-math": "^0.1.9"
4. npm install cornetstone-tools 
<br> version : "cornerstone-tools": "^5.0.0"
5. npm install conrnerstone-wado-image-loader 
<br> version : "cornerstone-wado-image-loader": "^3.1.2"
6. npm install hammerjs 
<br> version :"hammerjs": "^2.0.8"
7. npm install mathjs 
<br> version :"mathjs": "^8.0.1"
8. npm install cross
<br> version : "cross": "^1.0.0"
9. npm install gh-pages 
<br> version : "gh-pages" : "^3.1.0"
10. npm install react 
<br> version : "react": "^16.14.0"
11. npm install react-dom 
<br> version : "react-dom": "^16.14.0"
12. npm install react-map-interatcion 
<br> version : "react-map-interaction": "^2.0.0"
13. npm install react scripts
<br> version : "react-scripts": "^3.4.3"
14. npm install webkit 
<br> version :"webkit": "^0.0.0"
15. npm install jsdoc docdash 
<br> version :"jsdoc" : "^3.6.6"
16. npm install jquery 
<br> version : "jquery" : "^3.5.1"
 
To install at once
<br>-> npm install or yarn install

## Deployment 
1. npm install gh-pages
2. In package.json, 
<br> "scripts": {
<br>    "build": "react-scripts build",
<br>    "deploy": "gh-pages -d build"
<br> }
<br> "devDependencies": {
<br>     "gh-pages": "^3.1.0"
<br>   },
  "homepage": "https://choijinkyung.github.io/DICOM-RT-VIEWER/"

## API documentation
Use JSDOC
Install : npm install jsdoc 
template : docdash
Update : npm run jsdoc

Add -> In package.json
<br>"scripts": {
<br>    "jsdoc": "jsdoc -c jsdoc.json"
<br>  }

How to open API docs?
<br> -> './API_document/index.html'
<br> -> open this use web browser
  
## Available Scripts
In the project directory, you can run:

### `npm run start`
Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`
Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### `yarn deploy`
Deploy the project on your github page
(Your Repository will be public)

npm install gh-pages 
In package.json
<br>  "scripts": {
<br>    "build": "react-scripts build",
<br>    "deploy": "gh-pages -d build"
<br>  }
<br>  "devDependencies": {
<br>     "gh-pages": "^3.1.0"
<br>  }, "homepage": "https://choijinkyung.github.io/DICOM-RT-VIEWER/"


### `npm run jsdoc`
Each code can be annotated into jsdoc.
Running this script updates.

## Modification Requirement
1. Modify Check Event
<br> -> Draw / reset as soon as check
2. Dose Overlay
<br> -> Find the contour point and trace it.
3. Modify the mouse button to activate the zoom event
<br> -> mouseButton = 3 on the wheel
4. Modifying the import of Contour Data
<br> -> import in class
5. Rotate 90 degrees, flip simultaneously and modify to make it possible
6. Import RT PLAN File
7. Separate each file using DB and import
8. Add Button for Reset x,y coords
9. DVH 
10. TreeView
## Contribution

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us. 
<br>[CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) 를 읽고 이에 맞추어 pull request 를 해주세요.

## Author
* [Choi Jin Kyung](https://github.com/choijinkyung)

## LICENSE
This project is licensed under the MIT License - see the [LICENSE.md]
```
 Copyright (c) 2020 j_iky

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
