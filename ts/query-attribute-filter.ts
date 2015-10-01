/// <reference path="../typings/tsd.d.ts" />

interface QueryFilter {
	
	type: string;
	
	isReady(): boolean;
	getFilter(): string;
}

class SingleAttributeFilter implements QueryFilter {
	type: string = 'single';
	attributes: string[] = ['CARNUM', 'WEATHCON'];
	
	attribute: string = this.attributes[0];
	op: string = "eq";
	val: string = "";
	
	isReady() {
		return true; 
	}
	
	getFilter() {
		return this.isReady()
			? `${this.attribute} ${this.op} '${this.val}'`
			: ""; 
	}	
}

class GroupFilter implements QueryFilter {
	type: string = 'group';
	groupingOption: string = 'and';
	filters: QueryFilter[] = [];
	
	isReady() {
		return this.filters.every(f => f.isReady());
	}
	
	getFilter() {
		var body = this.filters
			.filter(f => f.isReady())
			.map(f => f.getFilter())
			.reduce((prev, curr) => {
				if(prev != '') {
					prev = prev + ' ' + this.groupingOption + ' ';
				}
			
				return prev + curr;
			}, '');
		
		return '(' + body + ')';
	}
}


class GroupFilterController {
	
	filter: GroupFilter;
	
	addFilter() {
		this.filter.filters.push(new SingleAttributeFilter());
	}
	
	addGroup() {
		this.filter.filters.push(new GroupFilter());
	}
	
}

class AttributeFilterController {
	
	rootGroup: GroupFilter = new GroupFilter();
	
}

var app = angular.module('sample', []);


app.factory('RecursionHelper', ['$compile', function($compile){
    return {
        /**
         * Manually compiles the element, fixing the recursion loop.
         * @param element
         * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
         * @returns An object containing the linking functions.
         */
        compile: function(element, link){
            // Normalize the link parameter
            if(angular.isFunction(link)){
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
                post: function(scope, element){
                    // Compile the contents
                    if(!compiledContents){
                        compiledContents = $compile(contents);
                    }
                    // Re-add the compiled contents to the element
                    compiledContents(scope, function(clone){
                        element.append(clone);
                    });

                    // Call the post-linking function, if any
                    if(link && link.post){
                        link.post.apply(null, arguments);
                    }
                }
            };
        }
    };
}]);


app.controller('AttributeFilterController', AttributeFilterController);
app.controller('FilterGroupController', GroupFilterController);

app.directive("filterSingle", () => {
		return {
		controller : 'FilterGroupController',        
        scope: {
			filter: "="	
		},
        name : "filterSingle",      
		replace: true,  
        restrict : "E",
        template : `
			<div class="filter-single">
				<select ng-model="filter.attribute">
					<option value="CARNUM">Crash Id</option>
					<option value="WEATHCON">Weather Condition</option>
				</select>
				
				<select ng-model="filter.op">
					<option value="eq">is</option>
					<option value="neq">is not</option>
				</select>
				
				<input type="text" placeholder="enter value here" ng-model="filter.val" />						
			</div>`
			};	

});

app.directive("filterGroup", (RecursionHelper) => {
	return {
		controller : 'FilterGroupController',
        controllerAs : "ctrl",
        bindToController : true,
        scope: { filter: "=" },
        name : "filterGroup",      
		replace: true,  
        restrict : "E",
        template : `
			<div class="filter-group">
				<div class="filter" ng-repeat="filter in ctrl.filter.filters">
					<select class="grouping-option" ng-model="ctrl.filter.groupingOption">
						<option value="and">and</option>
						<option value="or">or</option>
					</select>								
					
					<filter-single ng-if="filter.type === 'single'" filter="filter"></filter-single>
					<filter-group ng-if="filter.type === 'group'" filter="filter"></filter-group>										
	
				</div>
				<a href="#" ng-click="ctrl.addFilter()">add filter</a>
				<a href="#" ng-click="ctrl.addGroup()">add group</a>							
			
			</div>`,
		compile: (element) => {
			return RecursionHelper.compile(element);
		}
	};	
});