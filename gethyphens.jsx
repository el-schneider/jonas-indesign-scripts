//#target indesign;
#targetengine "session";
// © 2009 Teus de Jong and Peter Kahrel
// First version Heiligabend/Christmas Eve 2009
// Routines to collect broken words and page/line numbers are based on
// the Hyphenation checker for Windows made by Teus de Jong (see http://www.teusdejong.nl)

//structure of an array element:
//w: broken word
//st_id: story id
//story_kind: 0 = normal story; 1 = footnote; 2 = tablecell
//fn_or_tb_num: footnote number or table number, depending on story_kind
//cel_num: cel number in table;
//i: line number;
//when page and line numbers are processed, these are added:
//page name
//linenumber on page (or in table, footnote, inline)
//ininline: 1: line in inline; 0: not in inline
//cell name 

if (app.documents.length == 0)
	exit();

// user definable variables
var hyphen_file_name = '{hyphens}.txt';
var do_prefs = true;

// debug variables
var debug = true;
var do_startoptions = true;

// global variables, some with default values
var do_numbers = false;
var fromfile = false;
var dosort = false;
var forscreen = true;
var done = 0;
var list_index = -1;
var sorted = false;
var zoom = 225;
var sch = '~';
var scrpos = [200, 40];
if (do_prefs)
	read_prefs('gethyphens');

var zoomar = [100, 150, 175, 200, 225, 250, 300];
for ( i = 0; i < zoomar.length; i++)
	if (zoomar[i] == zoom){ var zoomindex = i; break}

if (do_startoptions)
	{
	//array values used in startPanel
	var to_options = ['Screen', 'Document'];
	var displayitems = ['tilde', 'underscore', 'hyphen', 'emdash', 'endash'];
	var dropitems = ['~', '_', '-', '—', '–'];
	// because array.indexOf is not supported
	for ( i = 0; i < dropitems.length; i++)
		if (dropitems[i] == sch){ var schindex = i; break}
	}

//global regexes to speed up the script
var regex1 = /^.+[\s-]/;
var regex2 = /[\s-].+$/;
var regex3 = /['".,;:«»†‡®©‹›\[\]\{\}!?()0-9\u2018\u2019\u201C\u201D\uFEFF\uFFFC\u0004\u0016\/\r\n]/g;

// start
var startPanel = createStartPanel();
if (!do_startoptions)
	dotheScript(false);

function dotheScript(fromfile)
	{
	try  
		{
		collect_broken_words ({to_screen: forscreen, sort: dosort, from_file: fromfile})
		startPanel.close();
		}
	catch (e) {alert (e.message + "\r(line " + e.line + ")")};
	}

function collect_broken_words (options)
	{
	t0 = get_time ();
	if (options.from_file)
		broken_words = loadfile()
	else
		broken_words = find_broken_words (app.documents[0]);
	if (options.to_screen)
		{
		startText1.text = 'Preparing hyphenated words for display...';
		if (!options.from_file && options.sort)
			if (do_numbers)
				broken_words = broken_words.sort (sort_multi_m)
			else
				broken_words = broken_words.sort (sort_multi_0);
		var dlg = hyphen_dialog (broken_words);
		}
	else 
		{
		startText1.text = 'Placing hyphenated words in new document...';
		flow (broken_words, 2)
		}
	}


function find_broken_words (doc)
	{
	var broken = [];
	var fnotes, tables;
	var stories = app.documents[0].stories.everyItem ().getElements ();
	for (var i = 0; i < stories.length; i++)
		{
		if (stories[i].lines.length > 1)
			{
			broken = find_broken (stories[i], i, 0, 0, 0, broken); 
			if (do_numbers)
				getnumbers(stories[i], broken, 0, i);
			fnotes = stories[i].footnotes.everyItem().getElements();
			for (var j = 0; j < fnotes.length; j++)
				if (fnotes[j].lines.length > 1)
					broken = find_broken (fnotes[j], i, 1, j, 0, broken);
			if (do_numbers)
				getnumbers(stories[i], broken, 1, i);
			tables = stories[i].tables.everyItem().getElements();
			for (var j = 0; j < tables.length; j++)
				for (var k = 0; k < tables[j].cells.length; k++)
					if (tables[j].cells[k].lines.length > 1)
						broken = find_broken (tables[j].cells[k], i, 2, j, k, broken);
			if (do_numbers)
				getnumbers(stories[i], broken, 2, i);
			}
		}
	return broken
	}


function find_broken (obj, st_id, story_kind, fn_or_tb_num, cel_num, array)
	{
	var part_1, part_2, w;
	startText1.text = 'Fetching hyphenated words from story ' + st_id +'...';
	var lines_ = obj.lines.everyItem().contents;
	var stop = lines_.length-1;
	for (var i = 0; i < stop; i++)
		{
		if (broken_line (lines_[i]))
			{
			part_1 = lines_[i].replace (regex1, "");
			part_2 = lines_[i+1];//.replace(regex2, "");
			part_2 = lines_[i+1]; //.replace(regex2, "");
			if (part_2.indexOf('\n') > -1)
				part_2 = part_2.replace('\n', ' ').replace(regex2, "");
			else
				part_2 = part_2.replace(regex2, "");
			w = part_1+sch+part_2;
			w = w.replace (regex3, "");
			if ((w != sch) && (w.indexOf(sch) != 0) && (w.indexOf(sch) != w.length-1))
				if (do_numbers)
					array.push ([w, st_id, story_kind, fn_or_tb_num, cel_num, i, 0, 0, 0, ''] )
				else
					array.push ([w, st_id, story_kind, fn_or_tb_num, cel_num, i] )
			}
		}
	return array
	}

function broken_line (s)
	{
	return "- \u2013\u00AD\u05BE\r\n/".indexOf(s.slice (-1)) < 0;
	}

function getnumbers(obj, ar, type_, st_id)
	{
	var ver = Number(app.version.substr(0, 1) );
	var rec = [];
	var tf, aantal, totaantal, pname, lnnr, c;
	var ininline  = false;
	startText1.text = 'Getting page and line numbers for story ' + st_id +'...';
	switch (type_)
		{
		case 0:
			{
			var startlines =[];
			aantal = (ver > 4) ? obj.textContainers.length : obj.textFrames.length;
			totaantal = -1;
			for (var i = 0;  i < aantal; i++)
				{
				tf = (ver  > 4) ? obj.textContainers[i] : obj.textFrames[i];
				totaantal += tf.lines.length;
				try {pname = getParentPageName(tf, ver)}
					catch(e){ pname = '0'}
				ininline = ((aantal==1) && (tf.parent.constructor.name == 'Character'));
				if (ininline)
					{
					for (var j = ar.length - 1; j >= done; j--)
						{
						rec = ar[j];
						rec[6] = pname;
						rec[7] = rec[5]+1;
						rec[8] = 1;
						}
					break;
					}
				if ((startlines.count>0) && (startlines[startlines.length-1] [0] == pname))
					startlines[startlines.length-1][1] = totaantal
				else
					startlines.push([pname, totaantal]);
				}
			if (ininline)
				break;
			var j = startlines.length-1;
			for (i = ar.length - 1; i >= done; i--)
				{
				rec = ar[i];
				if (rec[2] != 0) continue;
				lnnr = rec[5];
				while ((startlines[j][1] >= lnnr) && (j>0))
					j--;
				rec[7] = (j>0) ? lnnr - startlines[j][1] : lnnr;
				if ((j==0) || (j==startlines.length-1))
					rec[6] =startlines[j][0]
				else
					rec[6] = startlines[j+1][0];
				}
			break;
			}
		case 1:
			{
			for (i = ar.length - 1; i >= done; i--)
				{
				rec = ar[i];
				rec[7] = rec[5]+1;
				tf = obj.footnotes[rec[3]].lines[rec[5]].words[-1].parentTextFrames[0];
				try {pname = getParentPageName(tf, ver)}
					catch(e){ pname = '0'}
				rec[6] = pname;
				}
			break;
			}
		case 2:
			{
			for (i = ar.length - 1; i >= done; i--)
				{
				rec = ar[i];
				rec[7] = rec[5]+1;
				c = obj.tables[rec[3]].cells[rec[4]]
				tf = c.lines[rec[5]].words[-1].parentTextFrames[0];
				try {pname = getParentPageName(tf, ver)}
					catch(e){ pname = '0'}
				rec[6] = pname;
				rec[9] = c.name.toString();
				}
			break;
			}
		}
	done = ar.length;
	}

function getParentPageName(obj, ver){
	if (ver > 6) return (obj.parentPage.name);
	//  this simple construction is sufficient here
	while (obj.constructor.name != 'Page')
		{
		if (obj.constructor.name == 'Character')
			obj = obj.parentTextFrames[0];
		obj = obj.parent;
		}
	return(obj).name;
}


// Write array in a new document (after sorting and deleting duplicates

function flow (inp, col)
	{
	var array = (do_numbers) ? ((dosort && !sorted) ? inp.sort (sort_multi_m) : inp)  : string_array (inp);
	if (do_numbers) array = getnumbered(array);
	var s = make_string(array);
	var doc = app.documents.add();
	doc.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
	var marg = doc.pages[0].marginPreferences;
	var gb = [marg.top, marg.left, 
		app.documentPreferences.pageHeight - marg.bottom, 
		app.documentPreferences.pageWidth - marg.right];
	doc.textFrames.add ({geometricBounds: gb, contents: s, textFramePreferences: {textColumnCount: col}});
	while (doc.pages[-1].textFrames[0].overflows)
		{
		doc.pages.add().textFrames.add ({geometricBounds: gb, textFramePreferences: {textColumnCount: col}});
		doc.pages[-1].textFrames[0].previousTextFrame = doc.pages[-2].textFrames[0];
		}
	}

function getnumbered(ar)
	{
	var rec = [];
	var arretje= [];
	for (var i = 0; i < ar.length; i++)
		{
		rec = ar[i];
		rec[1] = '\u2002p. '+rec[6] ;
		if (Number(rec[2]) == 1)
			rec[1] = rec[1] + '; in footnote'
		else if (Number(rec[2]) == 2)
			{
			arretje = rec[9].split(/\D+/);
			arretje[0]++; arretje[1]++;
			rec[1] = rec[1] + '; in table, cell[r.'+arretje[0]+';c.'+arretje[1]+']';
			}
		rec[1] = rec[1] + '; ln. '+rec[7];
		if (rec[8] == 1)
			rec[1] = rec[1] + '; in inline';
		rec.splice(2);
		}
	return(ar);
	}

function make_string(array)
	{
	var str  = (do_numbers) ?  array.join("\r")+"\r" : array.sort (nocase).join ("\r") +"\r";
	str = str.replace (/([^\r]+\r)(\1)+/g, "$1");
	if (do_numbers) str = str.replace(/,/g, "");
	return str.replace (/\r$/,"");
	}
	
function nocase (a, b)
	{
	return a.toLowerCase() > b.toLowerCase()
	}

function string_array (array)
	{
	var temp = [];
	for (var i = 0; i < array.length; i++)
			temp.push(array[i][0]);
	return temp;
	}

function sort_multi_0(a, b)
	{
	var x = a[0].toLowerCase();
	var y = b[0].toLowerCase ();
	if (x != y)
		return  x > y;
	else
		{
		x = a[1];
		y = b[1];
		if (x != y)
			return x > y
		else
			return a[5] > b[5];
		}
	}

function sort_multi_m(a, b)
	{
	var x = a[0].toLowerCase();
	var y = b[0].toLowerCase ();
	if (x == y)
		{
		if ((x = ("00000" + a[6]).slice (-6)) == (y = ("00000" + b[6]).slice (-6)))
			return (a[7] > b[7])
		else return(x > y);
		}
	else
		return(x > y);
	}

// interface routines

function createStartPanel()
	{
	try {
		var f = File(app.documents[0].filePath+'/'+hyphen_file_name);
		var f_iser = f.exists;
		} catch(e){f_iser = false}
	var startPanel = new Window('palette', 'Hyphenation checker'); 
		if (do_startoptions)
		{
		var topgroup = startPanel.add('group');
			topgroup.orientation = 'row';
			topgroup.alignment = 'top';
			toppanel0 = topgroup.add('panel', undefined, 'Output to');
				var to_box = toppanel0.add('dropdownlist', undefined, '', {items : to_options});
					to_box.items[0].selected = true;
				if (f_iser)
					{
					var toppanel1 = topgroup.add('panel', undefined, 'Load from file');
					var loadbtn = toppanel1.add('button', undefined, 'Load');
					var toppanel2 = topgroup.add('panel', undefined, 'Collect from document');
					}
				else
					var toppanel2 = topgroup.add('panel');
					toppanel2.orientation = 'row';
					toppanel2.add('statictext', undefined, 'Hyphen char:');
					var schbox = toppanel2.add('dropdownlist', undefined, '', {items: displayitems});
						schbox.items[schindex].selected = true;
					var sortcheck = toppanel2.add('checkBox', undefined, 'Sort');
						sortcheck.value=true;
					var nr_check = toppanel2.add('checkBox', undefined, 'With numbers');
					var startbtn = toppanel2.add('button', undefined, 'Start');
		}
		if (f_iser)
			startText1 = startPanel.add('statictext', undefined, 'Set your options and click Load or Start...');
		else
			startText1 = startPanel.add('statictext', undefined, 'Set your options and click Start...');
			with (startText1){justify = 'center'; minimumSize.width = 300}

	if (do_startoptions)
		{
		if (f_iser)
			{
			loadbtn.onClick = function ()  
				{ 
				dosort = false;
				forscreen = (to_box.selection.index == 0);
				do_numbers = nr_check.value;
				dotheScript(true);
				}
			}
		startbtn.onClick = function ()  
			{ 
			dosort = sortcheck.value;
			forscreen = (to_box.selection.index == 0);
			sch= dropitems[schbox.selection.index];
			do_numbers = nr_check.value;
			dotheScript(false);
			}
		}
	startPanel.show();
	return(startPanel);
	} 

function hyphen_dialog (array)
	{
	var path_accessable = true;
	try {
		var f = File(app.documents[0].filePath);
		}catch(e){path_accessable = false}
	var w = new Window ("palette", "Hyphenated words");
		w.frameLocation = scrpos;
		w.alignChildren = "center";
		var list = w.add ("listbox", undefined, string_array(array))
			list.minimumSize.width = 230;
			list.maximumSize.height = $.screens[0].bottom-200;
			try {list.graphics.font = "Segoe UI:16.0"} catch (_) {};
		var panel1 = w.add('panel');
			panel1.minimumSize.width = 230;
			var group1 = panel1.add('group');
				group1.orientation ='row';
				group1.add('statictext', undefined, 'Zoom:');
				var zoombox = group1.add('dropdownlist', undefined, '', {items : zoomar});
					zoombox.items[zoomindex].selected = true;
				var save_ = group1.add ("button", undefined, "Save");
					save_.maximumSize.width = 44;
					save_.enabled = path_accessable;
				var close_ = group1.add ("button", undefined, "Close", {name: "ok"});
					close_.maximumSize.width = 44;
			var group2 = panel1.add('group');
				group2.orientation ='row';
				group2.add('statictext', undefined, array.length + ' words');
				if (list.items.length > 2000)
					{
					var upbtn = group2.add ("button", undefined, "Up");
						upbtn.maximumSize = [30, 30];
					var dbtn = group2.add ("button", undefined, "Dn");
						dbtn.maximumSize = [30, 30];
					var do_btn = group2.add ("button", undefined, "Goto");
						with (do_btn) {maximumSize = [40, 30]; enabled = false}
					}
		if (debug)
			txt3 = w.add('statictext', undefined, 'Fetched in ' + time_diff(t0) + ' seconds');
  
	list.onDoubleClick = function ()  {  if (this.selection != null ) select_word (array [ this.selection.index] ) } 
	close_.onClick = function () {if (do_prefs) write_prefs('gethyphens', w); w.close ()}
	save_.onClick = function () {list_index = (list.selection == null) ? -1 : list.selection.index; save_list(array)}
	if (list.items.length > 2000)
		{
		upbtn.onClick = function() {go_next(list, false)}
		dbtn.onClick = function() {go_next(list, true)}
		do_btn.onClick = function() {list.onDoubleClick()}
		list.onChange = function ()  {do_btn.enabled = (this.selection != null )} 
		}
	zoombox.onChange = function() {zoom = zoomar[zoombox.selection.index]}

	zoom = zoomar[zoombox.selection.index];
	if (list_index != -1)
		list.selection = list.items[list_index];
	w.show ()
	}


function select_word (rec)
	{
	try
		{
		switch (Number(rec[2])) 
			{
			case 2:
				var word = app.documents[0].stories[rec[1]].tables[rec[3]].cells[rec[4]].lines[rec[5]].words[-1];
				break;
			case 1:
				var word = app.documents[0].stories[rec[1]].footnotes[rec[3]].lines[rec[5]].words[-1];
				break;
			case 0:
				var word = app.documents[0].stories[rec[1]].lines[rec[5]].words[-1];
			}
		if (word != null)
			{
			app.select (word, SelectionOptions.replaceWith );
			app.activeWindow.zoomPercentage = zoom;
			}
		}
	catch (_) {}
	}

function go_next(l, up)
	{
	var inc, j;
	j = (l.selection == null) ? -1 : l.selection.index;
	inc = up ? 1 : -1
	if ((!up && (j == 0)) || (up && (j == l.items.length - 1))) j = -1;
	j = (j  != -1)  ? j+inc : (up ? 0 : l.items.length - 1);
	l.selection = l.items[j];
	}

// timing and file routines

function get_time () {return new Date().getTime()}
function time_diff (start) {return (new Date() - start) / 1000}

function loadfile(){
	var arretje = [];
	var broken = [];
	startText1.text = 'Loading hyphenated words from file...';
	var f = File(app.documents[0].filePath+'/'+hyphen_file_name);
	f.open('r');
	list_index = f.readln();
	do_numbers = f.readln() == 1;
	sorted = f.readln() == 1;
	while (!f.eof){
		arretje =f.readln().split(',');
		broken.push(arretje);
	}
	f.close();
	return(broken);
}	

function save_list(l){
	var f = File(app.documents[0].filePath+'/'+hyphen_file_name);
	f.open('w');
	f.writeln(list_index);
	if (do_numbers) f.writeln(1) else f.writeln(0);
	if (dosort || sorted) f.writeln(1) else f.writeln(0);
	for (var i  = 0; i < l.length; i++){
		f.writeln(l[i]);
	}
	f.close();
}

function read_prefs(s)
	{
	var f = File (Folder(app.scriptPreferences.scriptsFolder).parent + "/" + s);
	if (f.exists)
		{
		f.open ("r");
		scrpos = f.readln().split (/\D+/);
		zoom = Number(f.readln());
		sch = f.readln();
		f.close ()
		}
	}

function write_prefs(s, w)
	{
	var f = File (Folder(app.scriptPreferences.scriptsFolder).parent + "/" + s);
	f.open ("w");
    // pos is an array, simply write it as a literal
	f.writeln(w.frameLocation);
	f.writeln(zoom);
	f.writeln(sch);
	f.close ()
	}
