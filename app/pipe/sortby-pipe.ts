import {Pipe, PipeTransform} from 'angular2/angular2';

@Pipe({
    name: 'sortBy',
    pure: true
})
export class SortByPipe implements PipeTransform  {
    transform(value: any[], args: any[]) : any[] {
        var sortBy = args[0], sortDesc = 1;
        
        if(sortBy) {
            if(sortBy.substring(0, 1) == '-') {
                sortDesc = -1;
                sortBy = sortBy.substring(1);
            }
            
            value.sort((a, b) => {
                return (this.valueFromKeyString(a, sortBy) <= this.valueFromKeyString(b, sortBy) ? -1 : 1) * sortDesc;
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
                return;
            }
        }
        
        return obj;
    }
}