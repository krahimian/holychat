CORDOVA=cordova
CPLATFORM=$(CORDOVA) platform
CPLUGIN=$(CORDOVA) plugin
BOWER=./node_modules/bower/bin/bower

cordova:
	if [ ! -d './platforms/ios' ]; then $(CPLATFORM) add ios; fi
	if [ ! -d './platforms/android' ]; then $(CPLATFORM) add android; fi
	if [ ! -d './org.apache.cordova.device' ]; then $(CPLUGIN) add org.apache.cordova.device; fi
	if [ ! -d './org.apache.cordova.statusbar' ]; then $(CPLUGIN) add org.apache.cordova.statusbar; fi
	if [ ! -d './de.appplant.cordova.plugin.local-notification' ]; then $(CPLUGIN) add https://github.com/katzer/cordova-plugin-local-notifications.git; fi
	if [ ! -d './de.appplant.cordova.plugin.background-mode' ]; then $(CPLUGIN) add https://github.com/katzer/cordova-plugin-background-mode.git; fi
	$(CORDOVA) prepare

npm_bower:
	npm prune
	npm install -l
	$(BOWER) prune
	$(BOWER) install

emulate: build
	$(CORDOVA) emulate

build:	update
	grunt

update:	npm_bower cordova

sign_android:
	cordova build --release android
	jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore build/android-release-key.keystore platforms/android/ant-build/Durch-release-unsigned.apk alias_name
	rm -f build/Durch.apk
	zipalign -v 4 platforms/android/ant-build/Durch-release-unsigned.apk build/Durch.apk

publish_android: build sign_android
