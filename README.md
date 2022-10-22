### BCRYPT MAC VERSION WORKAROUND

If you get this exception: 

`dyld: lazy symbol binding failed: Symbol not found: ____chkstk_darwin`

Attempt running this command:

`npm rebuild bcrypt --build-from-source`