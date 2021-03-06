'use strict';

var secretEmptyKey = '[$empty$]';

angular.module('rebroApp', ['tg.dynamicDirective', 'ui.sortable', 'ui.bootstrap'])

    .controller('masterCtrl', function ($rootScope, CommandType, VarTable, Program, Character) {
        $rootScope.CmdType = CommandType;
        $rootScope.varTable = VarTable;
        $rootScope.drawer = {};
        $rootScope.model = {};
        $rootScope.model.character = new Character();
        $rootScope.model.program = new Program();
        $rootScope.inputStyle = function(str) {
            if (str === null || typeof str === 'undefined') {
                str = "";
            }
            return {
                "width": (String(str).length + 1) * 7 + "px"
            };
        };
    })

    .controller('headerCtrl', function ($scope, Program, Character, VarTable) {
         $scope.inputFileName = 'rebroCommands';
        $scope.newProgram = function () {
            $scope.model.character = new Character();
            $scope.model.program.stmtList = [];
            VarTable.clearTable();
        };
        $scope.createJPicker = function () {
            createPicker();
        };
        $scope.insertJFile = function () {
            insertFile(angular.toJson([VarTable.getUserVarNames(), $scope.model.program.stmtList], true),$scope.inputFileName);
        };
    })

    .controller('sortableController', function ($scope, VarTable, Compiler, Runner, StatementRepository, Expression, CommandType) {
        /******* INITIALIZATION ************/

        $scope.loadProgram = function (text) {
            VarTable.clearTable();
            var temp = angular.fromJson(text);
            for (var i = 0; i < temp[0].length; i++) {
                VarTable.addVarName(temp[0][i]);
            }

            $scope.$apply(function () {
                $scope.model.program.stmtList = angular.copy(temp[1]);
               $scope.traverse($scope.model.program.stmtList);

            });

        };

        $scope.traverse = function(stmtList){
             for(var i = 0;i < stmtList.length;i++){
                    if((stmtList[i].type === CommandType.WHILE) || (stmtList[i].type === CommandType.IF)){
                        stmtList[i].expressionList = stmtList[i].args[0];
                        $scope.traverse(stmtList[i].stmtList);
                    }else if(stmtList[i].type === CommandType.SET_VAR){
                        stmtList[i].expressionList = stmtList[i].args[1];
                    }

             }
        }

        $scope.deleteList = [];

        $scope.addVariable = function (args) {
            VarTable.addVarName(args);
        };

        $scope.deleteVariable = function (args) {
            VarTable.removeVarName(args);
        };

        $scope.hasArgs = function (args) {
            return args.length > 0;
        };

        $scope.onPlay = function () {
            if (!Runner.isRunning()) {
                VarTable.initValues();
                $scope.model.character.isVisible = true;
                var executable = Compiler.compile($scope.model.program, $scope.model.character);
                Runner.runProgram(executable);
            }
        };

        $scope.onStop = function () {
            Runner.stopProgram();
        };

        $scope.drawer.statements = StatementRepository.getStatementTemplates();
        $scope.mathOperators = Expression.getMathOperators();
        $scope.allOperators = Expression.getAllOperators();
        
        $scope.programVariables = function () {
            return VarTable.getAllVarNames();
        };

        $scope.costumeVariables = function () {
            return VarTable.getCostumeNames();
        };

        $scope.sortableOptions = {
            helper: "clone",
            connectWith: [".editor", ".repeat"],
            start: function (event, ui) {
                $(ui.item).show();
                $scope.drawer.statements = StatementRepository.getStatementTemplates();
            },
            stop: function (event, ui) {
                $(ui.item).remove();
            }
        };
        $scope.sortableOptions2 = {
            connectWith: [".editor", ".repeat", ".deleteBox"]
          
            
        };
          $scope.sortableOptions3 = {
            connectWith: []
          
            
        };
        $scope.getViewRepeat = function (item) {
            if (item) {
                return "nest_Item2.html";
            }
            return null;
        };
        $scope.getView = function (item) {
            if (item) {
                return "nest_Item.html";
            }
            return null;
        };
    })


    .directive('emptyTypeahead', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attrs, modelCtrl) {
// this parser run before typeahead's parser
                modelCtrl.$parsers.unshift(function (inputValue) {
                    var value = (inputValue ? inputValue : secretEmptyKey); // replace empty string with secretEmptyKey to bypass typeahead-min-length check
                    modelCtrl.$viewValue = value; // this $viewValue must match the inputValue pass to typehead directive
                    return value;
                });
// this parser run after typeahead's parser
                modelCtrl.$parsers.push(function (inputValue) {
                    return inputValue === secretEmptyKey ? '' : inputValue; // set the secretEmptyKey back to empty string
                });
            }
        }
    })

    .controller('TypeaheadCtrl', function ($scope, $http, $timeout, CommandType) {
        $scope.stateComparator = function (state, viewValue) {
            return viewValue === secretEmptyKey || ('' + state).toLowerCase().indexOf(('' + viewValue).toLowerCase()) > -1;
        };
        $scope.onFocus = function (e) {
            $timeout(function () {
                $(e.target).trigger('input');
                $(e.target).trigger('change'); // for IE
            });
        };
        // Assumption: Only 'assign' or 'if' can use this function
        $scope.addOperation = function (stmt) {
            console.log("adding");
            switch (stmt.type) {
                case CommandType.SET_VAR:
                case CommandType.IF:
                case CommandType.WHILE:
                    stmt.expressionList.push(null);
                    stmt.expressionList.push(null);
            }
        };
        // Assumption: Only 'assign' or 'if' can use this function
        $scope.removeOperation = function (stmt) {
            if (stmt.expressionList.length > 2) {
                switch (stmt.type) {
                    case CommandType.SET_VAR:
                    case CommandType.IF:
                    case CommandType.WHILE:
                        stmt.expressionList.pop();
                        stmt.expressionList.pop();
                }
            }
        };
    });
