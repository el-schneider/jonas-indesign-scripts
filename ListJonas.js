//FindChangeList.txt
//A support file for the InDesign CC JavaScript FindChangeByList.jsx
//
//Modified by Jonas Schneider www.jonasschneider.de
//This data file is tab-delimited, with carriage returns separating records.
//
//The format of each record in the file is:
//findType<tab>findProperties<tab>changeProperties<tab>findChangeOptions<tab>description
//
//Where:
//<tab> is a tab character
//findType is "text", "grep", or "glyph" (this sets the type of find/change operation to use).
//findProperties is a properties record (as text) of the find preferences.
//changeProperties is a properties record (as text) of the change preferences.
//findChangeOptions is a properties record (as text) of the find/change options.
//description is a description of the find/change operation
//
//Very simple example:
//text	{findWhat:"--"}	{changeTo:"^_"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	Find all double dashes and replace with an em dash.
//
//More complex example:
//text	{findWhat:"^9^9.^9^9"}	{appliedCharacterStyle:"price"}	{include footnotes:true, include master pages:true, include hidden layers:true, whole word:false}	Find $10.00 to $99.99 and apply the character style "price".
//
//All InDesign search metacharacters are allowed in the "findWhat" and "changeTo" properties for findTextPreferences and changeTextPreferences.
//
//If you enter backslashes in the findWhat property of the findGrepPreferences object, they must be "escaped"
//as shown in the example below:
//
//{findWhat:"\\s+"}
//


//  2009 = Thin Space (Achtelgeviert)
//  200A = Hair Space (1/24 Geviert)

//  202F = Narrow No-Break Space 
// \\x{200B} = Breitenloses Leerzeichen
//  200C = Zero-width non-joiner
//  200D = Breitenloser Verbinder



// Find all double spaces and replace with single spaces.
grep	{findWhat:"  +"}	{changeTo:" "}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// Find all returns followed by a space And replace with single returns.
grep	{findWhat:"\r "}	{changeTo:"\r"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// Find all returns followed by a space And replace with single returns.
grep	{findWhat:"\\s?\n"}	{changeTo:"\r"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// Find all returns followed by a space and replace with single returns.
grep	{findWhat:" \r"}	{changeTo:"\r"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

//grep	{findWhat:"\t\t+"}	{changeTo:"\t"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	Find all double tab characters and replace with single tab characters.
//grep	{findWhat:"\r\t"}	{changeTo:"\r"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	Find all returns followed by a tab character and replace with single returns.
//grep	{findWhat:"\t\r"}	{changeTo:"\r"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	Find all returns followed by a tab character and replace with single returns.

// Find all double returns and replace with single returns.
grep	{findWhat:"\r\r+"}	{changeTo:"\r"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// // Find all space-dash-space and replace with an en dash.
// grep	{findWhat:" - "}	{changeTo:"\\x{A0}\\x{2013} "}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// Find all space-dash-space and replace with an en dash.
grep	{findWhat:"(\\d)\\s?-\\s?(\\d)"}	{changeTo:"\$1\\x{2009}\\x{2013}\\x{2009}$2"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// Find all dash-dash and replace with an em dash.
grep	{findWhat:"\\s?%"}	{changeTo:"\\x{2009}%"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	


// Findet Leerzeichen vor Interpunktion und löscht das LZ
grep	{findWhat:"\\s([.,;:!?])"}	{changeTo:"$1"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	


// Setzt Achtelgeviert vor große Interpunktion
grep	{findWhat:"([:;!?])"}	{changeTo:"\\x{200A}$1"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// Findet Leerzeichen am Absatzanfang und löscht diese.
grep	{findWhat:"^\\s+"}	{changeTo:""}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// // Ersetzt evtl. vorhandene Leerzeichen vor � durch Achtelgeviert.
// grep	{findWhat:"\\s?(?=�)"}	{changeTo:"\\x{2009}"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}

// Ersetzt Leerzeichen vor den Einheiten m, cm, mm durch Achtelgeviert.
grep	{findWhat:"(?<=\\d)\\s(?=m|cm|mm|km|ml|TL|EL)"}	{changeTo:"\\x{2009}"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}

// // Ersetzt Leerzeichen vor den Einheiten m, cm, mm durch Achtelgeviert.
// grep	{findWhat:"(\\d)(m|cm|mm|km)"}	{changeTo:"$1\\x{2009}$2"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}


// // Löscht alle Leerzeichen vor Schlußzeichen
// grep	{findWhat:"\\s+(?=\\z)"}	{changeTo:""}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// Ändert x zwischen Ziffern mit/ohne Leerräumen in mathematisches Mal
grep	{findWhat:"(?<=\\d)\\s?x\\s?(?=\\d)"}	{changeTo:"\\x{A0}\\x{D7\}\\x{A0}"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// ------------------------------------------------------
// ABKÜRZUNGEN
// ------------------------------------------------------

// Findet evtl. vorhandene Leerzeichen zwischen S. und folgender Zahl und setzt Achtelgeviert ein.
grep	{findWhat:"(S\.)\\s?(\\d)"}	{changeTo:"$1\\x{2009}$2"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	

// Find all dash-dash and replace with an em dash.
// grep	{findWhat:"z\\.\\s?B\\."}	{changeTo:"z.\\x{2009}B."}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	


// // Abkürzungen bekommen ein Achtelgeviert eingefügt
grep	{findWhat:"(\\w\\.)(\\w\\.)(\\w\\.)(\\w\\.)"}	{changeTo:"$1\\x{200A}$2\\x{200A}$3\\x{200A}$4"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	
grep	{findWhat:"(\\w\\.)(\\w\\.)(\\w\\.)"}	{changeTo:"$1\\x{200A}$2\\x{200A}$3"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	
grep	{findWhat:"(\\w\\.)(\\w\\.)"}	{changeTo:"$1\\x{200A}$2"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	


// ------------------------------------------------------
// GENDERING
// ------------------------------------------------------

// Fügt der Gender-Endung bedingte Trennzeichen hinzu

// grep	{findWhat:"([:*])(in)"}	{changeTo:"\\x{202F}$1\\x{00AD}$2\\x{00AD}"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	



