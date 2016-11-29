import { BaseService } from './base.service';
import { IndicatorRepository } from '../repository/indicator.repository';

import { NodeService } from './node.service';
import { Session } from '../lib/session';

import { Indicator } from './model/indicator.model';

export class IndicatorService  extends NodeService<Indicator> {
    indicatorRepository: IndicatorRepository;

    constructor(session: Session) {
        super(session, IndicatorRepository);
        this.indicatorRepository = this.nodeRepository;
    }

    /*getIndicators() {
		var collection = this.database.collection('user_ind');
        
        collection.find({ uid: this.user.uid }).toArray((err, results) => {
            if(err) {
                console.log('Mongo Exception: ' + err.message);
                this.done({ success: 0 });
            }
            else {			
                if(!this.user.uid) {
                    this.done(results);
                }
                else {
                    //get global indicators (user = 0)
                    collection.find({ uid:0 }).toArray((err, gResults) => {
                        this.done(gResults.concat(results));
                    });
                }
            }
        });
        
        return this.promise;
    }
    
    saveIndicator(indicator) {
	    indicator.uid = this.user.name == 'v1user' ? 0 : this.user.uid;
            
        this.database.collection("user_ind").insert(indicator, () => {
            this.done({ "success": 1, "id": indicator._id });
        });
        
        return this.promise;
    }
    
	removeIndicator(indicatorId) {
        var oid = this.dbObjectId(indicatorId);
        var uid = this.user.name == 'v1user' ? 0 : this.user.uid;

        this.database.collection("user_ind").remove({ _id:oid, uid:uid }, () => {
            this.done({ "success":1 });
        });
        
        return this.promise;
    }
    
    getIndicatorsForTickern(tkr) {
		
        return this.promise;
    }*/
}