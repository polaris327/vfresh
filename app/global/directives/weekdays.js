appDirs.directive('weekdays', function () {
    return {
        restrict: 'E',
        scope: {
            weekdaysSelected: '=',
            weekdaysModal: '=',
            weekdaysSelection: '='
        },
        templateUrl: 'app/global/template/weekdays.html',
        controller: ['$scope', function ($scope) {
            $scope.days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
            $scope.weekDays = [];
            if (!$scope.weekdaysSelected)
                $scope.weekdaysSelected = [false, false, false, false, false, false, false];

            $scope.SelectDays = function (filter) {
                $scope.weekdaysSelection = filter;

                angular.forEach($scope.weekDays, function (val, key) {
                    val.selected = false;
                })

                switch (filter) {
                    case "all":
                        angular.forEach($scope.weekDays, function (val, key) {
                            val.selected = true;
                        })
                        break;
                    case "wd":
                        angular.forEach($scope.weekDays, function (val, key) {
                            if (val.day != "Sa" && val.day != "Su")
                                val.selected = true;
                        })
                        $scope.allDaysSelected = false;
                        $scope.weekDaysSelected = true;
                        $scope.weekEndSelected = false;
                        break;
                    case "we":
                        angular.forEach($scope.weekDays, function (val, key) {
                            if (val.day == "Sa" || val.day == "Su")
                                val.selected = true;
                        })
                        $scope.allDaysSelected = false;
                        $scope.weekDaysSelected = false;
                        $scope.weekEndSelected = true;
                        break;
                }
            }

            for (i = 0; i < $scope.days.length; i++) {
                var weekDay = { day: $scope.days[i], selected: $scope.weekdaysSelected[i] }
                $scope.weekDays.push(weekDay);
            }

            $scope.$watch("weekDays", function () {
                $scope.weekdaysModal = []
                angular.forEach($scope.weekDays, function (val, key) {
                    $scope.weekdaysModal.push(val.selected);
                })
            }, true)

            $scope.SelectDay = function (wd) {
                wd.selected = !wd.selected;
            }

        }]
    };
})