import { BasicNode } from './basic.node'
import { HiddenLayers } from '../../../core/service/model/hidden-layers.model';

export class HiddenNode extends BasicNode {

    constructor(node: HiddenLayers) {
        super(node);
    }
}