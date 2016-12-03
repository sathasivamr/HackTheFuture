angular.module('starter')
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })
    .controller('ThirdVisionController', ['$scope', '$cordovaFile', '$cordovaFileTransfer', '$cordovaCamera', function ($scope, $cordovaFile, $cordovaFileTransfer, $cordovaCamera) {

        $scope.current_image = '';
        $scope.image_description = '';
        $scope.detection_type = 'LABEL_DETECTION';

        $scope.detection_types = {
            LABEL_DETECTION: 'label',
            TEXT_DETECTION: 'text',
            LOGO_DETECTION: 'logo',
            LANDMARK_DETECTION: 'landmark'
        };

        var api_key = 'YOUR_API_KEY';


        $scope.takePicture = function () {

            var options = {
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                targetWidth: 500,
                targetHeight: 500,
                correctOrientation: true,
                cameraDirection: 0,
                encodingType: Camera.EncodingType.JPEG
            };

            $cordovaCamera.getPicture(options).then(function (imagedata) {

                $scope.current_image = "data:image/jpeg;base64," + imagedata;
                $scope.image_description = '';
                $scope.locale = '';

                var vision_api_json = {
                    "requests": [{
                        "image": {
                            "content": imagedata
                        },
                        "features": [{
                            "type": "LABEL_DETECTION",
                            "maxResults": 1
                        },
                        {
                            "type": "TEXT_DETECTION",
                            "maxResults": 1
                        },
                        {
                            "type": "LOGO_DETECTION",
                            "maxResults": 1
                        },
                        {
                            "type": "LANDMARK_DETECTION",
                            "maxResults": 1
                        },
                        {
                            "type": "FACE_DETECTION",
                            "maxResults": 1
                        }]
                    }]
                };


                var file_contents = JSON.stringify(vision_api_json);

                $cordovaFile.writeFile(
                    cordova.file.applicationStorageDirectory,
                    'file.json',
                    file_contents,
                    true
                ).then(function (result) {

                    var headers = {
                        'Content-Type': 'application/json'
                    };

                    options.headers = headers;

                    var server = 'https://vision.googleapis.com/v1/images:annotate?key=' + api_key;
                    var filePath = cordova.file.applicationStorageDirectory + 'file.json';

                    $cordovaFileTransfer.upload(server, filePath, options, true)
                        .then(function (result) {

                            var res = JSON.parse(result.response);
                            console.log(res);
                            var key = $scope.detection_types[$scope.detection_type] + 'Annotations';

                            $scope.image_description = res.responses[0][key][0].description;

                            TTS.speak({
                                text: $scope.image_description,
                                locale: 'en-US',
                                rate: 0.75
                            }, function () {
                                console.log("success");
                            },
                                function (reason) {
                                    console.log(reason);
                                });
                        }, function (err) {
                            console.log(err);
                            console.log('An error occured while uploading the file');
                        });

                }, function (err) {
                    console.log('An error occured while writing to the file');
                });

            }, function (err) {
                console.log('An error occured getting the picture from the camera');
            });


        }

    }]);

