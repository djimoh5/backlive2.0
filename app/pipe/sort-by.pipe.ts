import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'sortBy',
    pure: true
})
export class SortByPipe implements PipeTransform  {
    transform(value: any, sortBy: string) : any[] {
        var sortAscFlag = 1;

        if(sortBy) {
            if(sortBy.substring(0, 1) == '-') {
                sortAscFlag = -1;
                sortBy = sortBy.substring(1);
            }
            
            value.sort((a, b) => {
                var valA = this.valueFromKeyString(a, sortBy),
                    valB = this.valueFromKeyString(b, sortBy);
                
                if(valB == null) {
                    return -1;
                }
                else if(valA == null) {
                    return 1;
                }
                else {
                    return (valA <= valB ? -1 : 1) * sortAscFlag;
                }
            });
        }
        
        return value;
    }
    
    valueFromKeyString(obj: any , key: string) {
        var keys = key.split('.');
        
        for(var i = 0, len = keys.length; i < len; i++) {
            var k = keys[i];
            
            if(obj[k]) {
                obj = obj[k];
            }
            else {
                return null;
            }
        }
        
        return obj;
    }
}