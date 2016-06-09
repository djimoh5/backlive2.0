import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'sortBy',
    pure: true
})
export class SortByPipe implements PipeTransform  {
    transform(value: any, sortBy: string) : any[] {
        var sortDesc = 1;

        if(sortBy) {
            if(sortBy.substring(0, 1) == '-') {
                sortDesc = -1;
                sortBy = sortBy.substring(1);
            }
            
            value.sort((a, b) => {
                var valA = this.valueFromKeyString(a, sortBy),
                    valB = this.valueFromKeyString(b, sortBy);
                
                if(valA == null) {
                    return -1 * sortDesc;
                }
                else if(valB == null) {
                    return 1 * sortDesc;
                }
                else {
                    return (valA <= valB ? -1 : 1) * sortDesc;
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