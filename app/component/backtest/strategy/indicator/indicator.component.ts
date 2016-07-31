import {Component, Input, OnInit} from '@angular/core';
import {Path} from 'backlive/config';
import {BaseComponent} from 'backlive/component/shared';

import {Common} from 'backlive/utility';

import {AppService, UserService} from 'backlive/service';
import {AppEvent, Indicator} from 'backlive/service/model';

@Component({
    selector: 'app-strategy',
    templateUrl: Path.ComponentView('backtest/strategy'),
    directives: []
})
export class IndicatorComponent extends BaseComponent {
    id: string = Common.uniqueId();
    compareOn: boolean = false;
    compare: number = 2;
    readonly: boolean = true;
    level: number = 0;
    
    @Input() collection: Indicator[];
    
    
    constructor(appService: AppService) {
        super(appService);
    }
    
    ngOnInit() {
        if(this.collection) {
            this.addTo(this.collection);
        }
    }
    
    getElement() {
        return $('.indicator[data-id="' + this.id + '"] .equation');
    }

    addTo(collection) {
        if(RM.reverseIndicator) {
            collection.push(this);
        }
        else {
            collection.splice(0, 0, this);
        }
        
        this.collection = collection;
        this.reindex();
        this.toggleReadOnly();
    }
    
    groupIndicator() {
        if(this.compareOn)
            this.compareOn = false;
        else {
            var found = false;
            
            for(var i = 0, len = this.collection.length; i < len; i++) {
                if(this.collection[i].compareOn) {
                    found = this.collection[i];
                    break;
                }
            }
            
            if(found) {
                var indGroup = new Indicator();
                
                this.parentId = indGroup.id;
                found.parentId = indGroup.id;
                this.readonly = false;
                this.toggleReadOnly(true);

                if(this.index < found.index) {
                    this.collection.splice(found.index, 1);
                    this.collection.splice(this.index, 1);
                    
                    indGroup.vars.push(this, found);
                    this.collection.splice(this.index, 0, indGroup);
                }
                else {
                    this.collection.splice(this.index, 1);
                    this.collection.splice(found.index, 1);
                    
                    indGroup.vars.push(found, this);
                    this.collection.splice(found.index, 0, indGroup);
                }

                indGroup.collection = this.collection;
                indGroup.isParent = true;
                indGroup.ops[0] = 0;
                
                this.reindex();
                this.relevel(indGroup.vars, 1);
                
                found.compareOn = false;
                this.compareOn = false;
            }
            else {
                this.compareOn = true;
            }
        }
    },
    
    toggleReadOnly(allReadOnly) {
        if(this.readonly || allReadOnly) {
            for(var i = 0, len = this.collection.length; i < len; i++) {
                this.collection[i].readonly = true;
                this.toggleChildren(this.collection[i].vars, true);
            }
        }
        
        this.readonly = !this.readonly;
        this.toggleChildren(this.vars, this.readonly);
    }
    
    toggleChildren(vars, toggleVal) {
        for(var i = vars.length - 1; i >= 0; i--) {
            vars[i].readonly = toggleVal;
            this.toggleChildren(vars[i].vars, toggleVal);
        }
    }
    
    clearEquation() {
        this.getElement().find('.field_container,.op_container').remove();
    },
    
    remove() {
        this.collection.splice(this.index, 1);
        this.reindex(this.collection);
        RM.ui.closeTray();
    },
    
    reindex() {
        for(var i = 0, len = this.collection.length; i < len; i++) {
            this.collection[i].index = i;
        }
    },
    
    relevel(vars, level) {
        for(var i = vars.length - 1; i >= 0; i--) {
            vars[i].level = level;
            
            if(vars[i].isParent) {
                this.relevel(vars[i].vars, (level + 1));
            }
            else {
                //child equations get blown away by angular during reshuffle, so reset
                this.resetFields(vars[i]);
            }
        }
    },
    
    resetFields(ind, fields) {
        ind.fields = ind.getElement().children('.field');
        setTimeout(function() {
            ind.fields.insertBefore(ind.getElement().find('.add_field_container'));
        }, 500);
    }
}