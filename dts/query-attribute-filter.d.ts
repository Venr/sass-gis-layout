interface QueryFilter {
    type: string;
    isReady(): boolean;
    getFilter(): string;
}
declare class SingleAttributeFilter implements QueryFilter {
    type: string;
    attributes: string[];
    attribute: string;
    op: string;
    val: string;
    isReady(): boolean;
    getFilter(): string;
}
declare class GroupFilter implements QueryFilter {
    type: string;
    groupingOption: string;
    filters: QueryFilter[];
    isReady(): boolean;
    getFilter(): string;
}
declare class GroupFilterController {
    filter: GroupFilter;
    addFilter(): void;
    addGroup(): void;
}
declare class AttributeFilterController {
    rootGroup: GroupFilter;
}
declare var app: any;
