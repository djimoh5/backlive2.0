{
    "targets": [
        {
            "target_name": "matrix",
            "sources": ["matrix.cpp"],
            "include_dirs": [
                "<!(node -e \"require('nan')\")"
            ]
        }
    ]
}