# Comment Annotator - (Directed Research Sm17)
A web portal to help participants annotate comments using pre-defined labels
- Comments belong to various categories (eg, source code comments, Youtube viewer comments)
- Pre-defined labels for source code comments: useful, non-useful/discard
  
Use dummy data for testing:
Run `mongoimport -d dr -c amzreviews --type tsv --file <filename>.csv --headerline`

Developed using Node.js, Express, AngularJS, MongoDB or MEAN stack