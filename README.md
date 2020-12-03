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

1.	PreKnowledge <br/>
        1) Coordinate transformation
<br>	We can get two matrices. 
<br>			1-1) Dose - > Patient matrix
<br>			1-2) CT -> Patient matrix	
<br>	<br>	즉, Dose -> CT 로 좌표를 변환하기 위해서는 Dose -> Patient -> CT를 			해야 한다.
<br>->	Patient -> CT를 구하기 위해선 CT -> Patient matrix를 inverse 해야 한다. 
<br>->	Dose2CT 변환 매트릭스 = (Dose 2Patient) * (Patinet2CT) 
<br>->	Dose2CT * ( x, y, z, 1 ) 를 하면 (x,y,z)좌표가 변환된다.
<br>->	이때 1은 vector, 0은 포인트를 가르킨다.
<br>->	자세한 내용은 DICOM standard의 c.7.6.2.1.1 를 참조
<br>( 3차원 행렬의 transform 또는 scaling쪽 지식이 필요 )

        2) Obtain Dose Value
<br>->	RT DOSE의 pixelData(x7fe00010)
<br>->	RT DOSE의 Dose Grid Scaling (x3004000e)
<br>->	선량값 = pixelData * DoseGridScaling 

		3) Import Sub-Data in DICOM file
<br>->	Original :  class로 묶어서 가져와야 함
<br>->  Present : cornerstone.js (GitHub) - > dicomParser -> liveExample -> DICOM DUMP
<br>->	https://rawgit.com/cornerstonejs/dicomParser/master/examples/index.html
<br>->	마우스 오른쪽 클릭 후 페이지 소스보기
<br>->	이 소스를 분석하여 계층구조에 있는 data를 import 했다. 
<br>->	Project에서 getROIList -> structFile , ROIListHierarchy , getContourData 코드 참조 
<br> (output에 출력하면 계층구조로 보임)

		4) Cornerstone
<br>->	Github : https://github.com/cornerstonejs
<br>->	Example : https://cornerstonejs.org/	

		5) Zoom, pan event
<br>->	React-map-interaction라는 opensource 사용
<br>->	추후 마우스 휠 이벤트 분리해야 함

		6) Open Source
<br>->	Dcmjs : cornerstone과 비슷한 DICOM parser
<br>->	Mathjs :" matrix 연산 시 python처럼 사용 가능
<br>->	Jsdoc : Documentation Tool

		7) Document
<br>->	Word : WebViewer_API_document
<br>->	JSDOC API documentation (권장)
<br>: 개발 진행 시 보기 더 편함

2.	개발 환경 setting
        1) Window
        2) Webstorm 
        3) Node.js
<br>	- Version :12.18.3
        4) Package Manager 
            1) yarn
<br>		- version : 1.22.5
        	2) npm
<br>		- version : 6.14.6



## Module install 
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

In package.json
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

## Modification Requirements
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
* Name : [Choi Jin Kyung](https://github.com/choijinkyung)
* E-mail : twin7014@naver.com
* GitHub : [https://github.com/choijinkyung](https://github.com/choijinkyung)

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
