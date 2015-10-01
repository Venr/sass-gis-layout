/// <reference path="../typings/tsd.d.ts" />
var SingleAttributeFilter = (function () {
    function SingleAttributeFilter() {
        this.type = 'single';
        this.attributes = ['CARNUM', 'WEATHCON'];
        this.attribute = this.attributes[0];
        this.op = "eq";
        this.val = "";
    }
    SingleAttributeFilter.prototype.isReady = function () {
        return true;
    };
    SingleAttributeFilter.prototype.getFilter = function () {
        return this.isReady()
            ? this.attribute + " " + this.op + " '" + this.val + "'"
            : "";
    };
    return SingleAttributeFilter;
})();
var GroupFilter = (function () {
    function GroupFilter() {
        this.type = 'group';
        this.groupingOption = 'and';
        this.filters = [];
    }
    GroupFilter.prototype.isReady = function () {
        return this.filters.every(function (f) { return f.isReady(); });
    };
    GroupFilter.prototype.getFilter = function () {
        var _this = this;
        var body = this.filters
            .filter(function (f) { return f.isReady(); })
            .map(function (f) { return f.getFilter(); })
            .reduce(function (prev, curr) {
            if (prev != '') {
                prev = prev + ' ' + _this.groupingOption + ' ';
            }
            return prev + curr;
        }, '');
        return '(' + body + ')';
    };
    return GroupFilter;
})();
var GroupFilterController = (function () {
    function GroupFilterController() {
    }
    GroupFilterController.prototype.addFilter = function () {
        this.filter.filters.push(new SingleAttributeFilter());
    };
    GroupFilterController.prototype.addGroup = function () {
        this.filter.filters.push(new GroupFilter());
    };
    return GroupFilterController;
})();
var AttributeFilterController = (function () {
    function AttributeFilterController() {
        this.rootGroup = new GroupFilter();
    }
    return AttributeFilterController;
})();
var app = angular.module('sample', []);
app.factory('RecursionHelper', ['$compile', function ($compile) {
        return {
            /**
             * Manually compiles the element, fixing the recursion loop.
             * @param element
             * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
             * @returns An object containing the linking functions.
             */
            compile: function (element, link) {
                // Normalize the link parameter
                if (angular.isFunction(link)) {
                    link = { post: link };
                }
                // Break the recursion loop by removing the contents
                var contents = element.contents().remove();
                var compiledContents;
                return {
                    pre: (link && link.pre) ? link.pre : null,
                    /**
                     * Compiles and re-adds the contents
                     */
                    post: function (scope, element) {
                        // Compile the contents
                        if (!compiledContents) {
                            compiledContents = $compile(contents);
                        }
                        // Re-add the compiled contents to the element
                        compiledContents(scope, function (clone) {
                            element.append(clone);
                        });
                        // Call the post-linking function, if any
                        if (link && link.post) {
                            link.post.apply(null, arguments);
                        }
                    }
                };
            }
        };
    }]);
app.controller('AttributeFilterController', AttributeFilterController);
app.controller('FilterGroupController', GroupFilterController);
app.directive("filterSingle", function () {
    return {
        controller: 'FilterGroupController',
        scope: {
            filter: "="
        },
        name: "filterSingle",
        replace: true,
        restrict: "E",
        template: "\n\t\t\t<div class=\"filter-single\">\n\t\t\t\t<select ng-model=\"filter.attribute\">\n\t\t\t\t\t<option value=\"CARNUM\">Crash Id</option>\n\t\t\t\t\t<option value=\"WEATHCON\">Weather Condition</option>\n\t\t\t\t</select>\n\t\t\t\t\n\t\t\t\t<select ng-model=\"filter.op\">\n\t\t\t\t\t<option value=\"eq\">is</option>\n\t\t\t\t\t<option value=\"neq\">is not</option>\n\t\t\t\t</select>\n\t\t\t\t\n\t\t\t\t<input type=\"text\" placeholder=\"enter value here\" ng-model=\"filter.val\" />\t\t\t\t\t\t\n\t\t\t</div>"
    };
});
app.directive("filterGroup", function (RecursionHelper) {
    return {
        controller: 'FilterGroupController',
        controllerAs: "ctrl",
        bindToController: true,
        scope: { filter: "=" },
        name: "filterGroup",
        replace: true,
        restrict: "E",
        template: "\n\t\t\t<div class=\"filter-group\">\n\t\t\t\t<div class=\"filter\" ng-repeat=\"filter in ctrl.filter.filters\">\n\t\t\t\t\t<select class=\"grouping-option\" ng-model=\"ctrl.filter.groupingOption\">\n\t\t\t\t\t\t<option value=\"and\">and</option>\n\t\t\t\t\t\t<option value=\"or\">or</option>\n\t\t\t\t\t</select>\t\t\t\t\t\t\t\t\n\t\t\t\t\t\n\t\t\t\t\t<filter-single ng-if=\"filter.type === 'single'\" filter=\"filter\"></filter-single>\n\t\t\t\t\t<filter-group ng-if=\"filter.type === 'group'\" filter=\"filter\"></filter-group>\t\t\t\t\t\t\t\t\t\t\n\t\n\t\t\t\t</div>\n\t\t\t\t<a href=\"#\" ng-click=\"ctrl.addFilter()\">add filter</a>\n\t\t\t\t<a href=\"#\" ng-click=\"ctrl.addGroup()\">add group</a>\t\t\t\t\t\t\t\n\t\t\t\n\t\t\t</div>",
        compile: function (element) {
            return RecursionHelper.compile(element);
        }
    };
});
