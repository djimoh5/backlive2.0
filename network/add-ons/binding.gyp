{
    "targets": [
        {
            "target_name": "tensorflow",
            "sources": ["tensorflow.cpp"],
            "include_dirs": [
                "<!(node -e \"require('nan')\")",
                "C:\Users\dejij\AppData\Local\Programs\Python\Python35\include"
            ],
            "libraries": [
                "C:\Users\dejij\AppData\Local\Programs\Python\Python35\libs\python35.lib",
                "C:\Users\dejij\AppData\Local\Programs\Python\Python35\libs\python35_d.lib"
            ]
        }
    ]
}