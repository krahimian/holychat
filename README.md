# Holy Chat

A chat application for [holy ship](http://www.holyship.com/) - built using express.js (node.js), redis, angular.js, and socket.io. The chat server runs on a static ip on the ships local area network. Clients (web or mobile) on the same network can connect to the server by either navigating to it's ip address or configuring it on the mobile (iOS & Android) app.

__Dependencies__
* Node.js
* Redis
* Imagemagick (needed only for building icons & splashscreens)
* Android SDK & Ant

## Running
```
node server.js
```

## Building

```
npm install -g cordova
npm install -g cordova-icon
npm install -g cordova-splash
make build
```

## Publishing iOS
Use the building instructions above, then open ```./platforms/ios``` in xcode. Follow these [instructions](https://developer.apple.com/library/ios/documentation/IDEs/Conceptual/AppDistributionGuide/TestingYouriOSApp/TestingYouriOSApp.html) to archive and export for distribution.

## Publishing Android
Install dependencies
```
brew install android-sdk
brew install ant
android
```
Install only the following packages:
  1. Android SDK Platform-tools [20]
  2. Android SDK Build-tools [20]
  3. Android SDK Build-tools [19.1]
  4. Android 4.4.2 (API 19)
  5. Support Library

Generate a key for signing releases
```
keytool -genkey -v -keystore ./android-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
```
```
make publish_android
```
Android app is now available at ```./HOLYCHAT.apk``` for distribution

## License

(The MIT License)

Copyright (c) 2015

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
