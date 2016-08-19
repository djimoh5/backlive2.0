import {Network} from './network'

new Network({
    "_id":"53ff94906e8224b43df4de6a",
    "name":"Core 2010 - 2014",
    "date":1409258640400,
    "uid":"512ab2ae1755edcd55000001",
    "type":1,
    "live":1,
    
    "data":{
        "exclusions":[
            {"ops":[2],"vars":[[4,"avg. volume"],[4,"price"]],"allowNeg":0,"aggrType":"val","exclType":1,"exclOp":1,"excl":1000}
        ],
        "indicators": {
            "long":[
                {"ops":[3],"vars":[[8,"short interest"],[4,"shares out"]],"allowNeg":0,"aggrType":"val","exclType":0,"exclOp":2,"excl":0.7,"rankIndustry":0,"weight":0,"sortDesc":1,"exitType":null,"exitOp":1,"exit":0},
                {"ops":[],"vars":[[4,"Price Chng 26wk"]],"allowNeg":1,"aggrType":"val","exclType":-1,"exclOp":1,"excl":0,"rankIndustry":1,"weight":10,"sortDesc":1,"exitType":null,"exitOp":1,"exit":0},{"ops":[3],"vars":[{"ops":[0,0,0,1],"vars":[[4,"market cap"],[2,"short-term debt"],[2,"long-term debt"],[2,"preferred stock"],[2,"cash"]]},[1,"sales"]],"allowNeg":0,"aggrType":"val","exclType":-1,"exclOp":1,"excl":0,"rankIndustry":1,"weight":40,"sortDesc":0,"exitType":null,"exitOp":1,"exit":0},{"ops":[3],"vars":[[4,"eps est. next yr"],[4,"eps est. next yr month ago"]],"allowNeg":0,"aggrType":"val","exclType":1,"exclOp":1,"excl":1.05,"rankIndustry":0,"weight":40,"sortDesc":1,"exitType":1,"exitOp":1,"exit":1},{"ops":[1],"vars":[[4,"eps est. next yr"],[4,"eps est. next yr month ago"]],"allowNeg":0,"aggrType":"val","exclType":1,"exclOp":1,"excl":0.015,"rankIndustry":0,"weight":0,"sortDesc":1,"exitType":-1,"exitOp":1,"exit":0},{"ops":[3],"vars":[[4,"eps est. yr"],[4,"eps est. yr month ago"]],"allowNeg":0,"aggrType":"val","exclType":1,"exclOp":1,"excl":1,"rankIndustry":0,"weight":0,"sortDesc":1,"exitType":null,"exitOp":1,"exit":0},{"ops":[3],"vars":[[2,"current assets"],[2,"current liabilities"]],"allowNeg":0,"aggrType":"val","exclType":-1,"exclOp":1,"excl":0,"rankIndustry":1,"weight":10,"sortDesc":1,"exitType":null,"exitOp":1,"exit":0}
             ],
            "short":[
                {"ops":[],"vars":[[9,"sales growth"]],"allowNeg":0,"aggrType":"val","exclType":1,"exclOp":2,"excl":10,"rankIndustry":0,"weight":0,"sortDesc":0,"exitType":-1,"exitOp":1,"exit":0},{"ops":[3],"vars":[[8,"short interest"],[4,"shares out"]],"allowNeg":0,"aggrType":"val","exclType":0,"exclOp":2,"excl":0.5,"rankIndustry":0,"weight":0,"sortDesc":1,"exitType":null,"exitOp":1,"exit":0},{"ops":[],"vars":[[4,"Price Chng 26wk"]],"allowNeg":0,"aggrType":"val","exclType":-1,"exclOp":1,"excl":0,"rankIndustry":1,"weight":10,"sortDesc":0,"exitType":null,"exitOp":1,"exit":0},{"ops":[3],"vars":[{"ops":[0,0,0,1],"vars":[[4,"market cap"],[2,"short-term debt"],[2,"long-term debt"],[2,"preferred stock"],[2,"cash"]]},[1,"sales"]],"allowNeg":0,"aggrType":"val","exclType":-1,"exclOp":1,"excl":0,"rankIndustry":1,"weight":40,"sortDesc":1,"exitType":null,"exitOp":1,"exit":0},{"ops":[3],"vars":[[4,"eps est. next yr"],[4,"eps est. next yr month ago"]],"allowNeg":0,"aggrType":"val","exclType":1,"exclOp":2,"excl":0.95,"rankIndustry":0,"weight":40,"sortDesc":0,"exitType":1,"exitOp":2,"exit":1},{"ops":[1],"vars":[[4,"eps est. next yr month ago"],[4,"eps est. next yr"]],"allowNeg":0,"aggrType":"val","exclType":1,"exclOp":1,"excl":0.015,"rankIndustry":0,"weight":0,"sortDesc":1,"exitType":-1,"exitOp":1,"exit":0},{"ops":[3],"vars":[[4,"eps est. yr"],[4,"eps est. yr month ago"]],"allowNeg":0,"aggrType":"val","exclType":1,"exclOp":2,"excl":1,"rankIndustry":0,"weight":0,"sortDesc":0,"exitType":null,"exitOp":1,"exit":0},{"ops":[1],"vars":[[4,"# down eps est. next yr"],[4,"# up eps est. next yr"]],"allowNeg":1,"aggrType":"val","exclType":1,"exclOp":1,"excl":0,"rankIndustry":0,"weight":0,"sortDesc":1,"exitType":null,"exitOp":1,"exit":0},{"ops":[3],"vars":[[2,"current assets"],[2,"current liabilities"]],"allowNeg":0,"aggrType":"val","exclType":-1,"exclOp":1,"excl":0,"rankIndustry":1,"weight":10,"sortDesc":0,"exitType":null,"exitOp":1,"exit":0}
            ]
        },
        "exposure":{
            "long":[{"ops":[],"vars":[[6,"rsi"]],"allowNeg":1,"aggrType":"val","expOps":[0,-1],"expOp":1,"thresh":40,"threshOp":1,"exp":100,"expSh":0}],
            "short":[]
        },
        "startYr":20100101,
        "endYr":20141231,
        "universeType":"stock",
        "universeTkrs":{"incl":1,"tkrs":[]},
        "minMktCap":200,
        "adr":"1",
        "initCapt":585000,
        "numStocks":10,
        "weight":6,
        "rebalance":1,
        "sectNeutral":0,
        "leverage":1,
        "shortLeverage":1,
        "stopLoss":0,
        "posStopLoss":0,
        "friction":0,
        "frictionType":"1",
        "benchmark":"SPY",
        "date":20140822,
        "exclSectors":[]
    }
});