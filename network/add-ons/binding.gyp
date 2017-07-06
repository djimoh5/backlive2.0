{
    "targets": [
        {
            "target_name": "activate",
            "sources": ["activate.cpp"],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ]
        }
    ]
}