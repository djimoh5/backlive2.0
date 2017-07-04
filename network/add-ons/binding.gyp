{
    "targets": [
        {
            "target_name": "activate",
            "sources": ["activate.cpp"],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ]
        },
        {
            "target_name": "outputDelta",
            "sources": ["activate.cpp"],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ]
        },
        {
            "target_name": "backpropagate",
            "sources": ["activate.cpp"],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ]
        }
        ,
        {
            "target_name": "updateWeights",
            "sources": ["activate.cpp"],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ]
        }
    ]
}