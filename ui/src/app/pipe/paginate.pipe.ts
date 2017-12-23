import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'paginate',
    pure: true
})
export class PaginatePipe implements PipeTransform  {
    numPages: number;
    temp: any[] = [];
    
    transform(value: any, itemsPerPage: number, pageNum: number = 0, ..._refreshers: any[]) : any[] {
        if (value) {
            var numItems = value.length;
            this.numPages = Math.ceil(numItems / itemsPerPage);

            var startIndex = pageNum * itemsPerPage,
                endIndex = startIndex + itemsPerPage,
                totCount = endIndex - startIndex,
                newValue = [];

            for (var i = startIndex; i < numItems; i++) {
                var val = value[i];
                newValue.push(val);

                if (!val.hidden && !val.isFiltered) {
                    totCount--;
                }

                if (totCount == 0) {
                    break;
                }
            }

            return newValue;
        }
    }
}