'use strict';

angular.module('rebroApp')

    .factory('StatementRepository', function (Statement) {

        var templates = [
            new Statement('setX', false, 0),
            new Statement('setY', false, 0),
            new Statement('moveX', false, 0),
            new Statement('moveY', false, 0),
            new Statement('hide', false),
            new Statement('show', false),
            new Statement('changeCostume', false, 'costume-brainy'),
            new Statement('repeat', true, '1'),
            new Statement('forever', true),
            new Statement('assign', false, undefined, [undefined]),
            new Statement('if', 'true', [undefined])
        ];

        templates[9].expressionList = templates[9].args[1];
        templates[10].expressionList = templates[10].args[0];

        return {
            getStatementTemplates: function() {
                return angular.copy(templates);
            }
        };

    });
