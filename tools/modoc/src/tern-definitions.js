// jshint node:true
'use strict';

/*
 tern definition generator - shared a lot of code with modoc
 will have to refactor the common parts out
 */

/**
 Main file
 + parses comment line args
 + gets the source files to be processed
 + gets data for the index (nav bar)
 + gets the processed documentation
 + generates every -doc file
 + generates an index file (in this case Entity.js)
 + generates the changelog in a pretty format
 */

var fs = require('fs');
var glob = require('glob');
var _ = require('underscore');

var extractor = require('./extractor');
var jsdocProcessor = require('./jsdoc-processor');
var util = require('./util');


function processArguments() {
	if (process.argv.length < 4) {
		console.log('Usage: node tern.js <sourcePath> <outPath>');
	}

	return {
		sourcePath: process.argv[2],
		outPath: process.argv[3]
	};
}

var getFiles = function (sourcePath, ignore) {
	if (/\.js$/.test(sourcePath)) {
		return [sourcePath];
	}

	return glob.sync(sourcePath + '/**/*.js').filter(function (file) {
		return ignore.every(function (term) {
			return file.indexOf(term) === -1;
		});
	});
};

var args = processArguments();

var files = getFiles(args.sourcePath, ['goo.js', 'pack.js', 'logicpack', 'soundmanager', '+']);

function filterPrivates(class_) {
	var predicate = function (entry) {
		return entry.comment && !(entry.comment.private || entry.comment.hidden);
	};

	class_.members = class_.members.filter(predicate);
	class_.staticMembers = class_.staticMembers.filter(predicate);
	class_.methods = class_.methods.filter(predicate);
	class_.staticMethods = class_.staticMethods.filter(predicate);

	class_.hasMembers = class_.members.length > 0;
	class_.hasStaticMethods = class_.staticMethods.length > 0;
	class_.hasStaticMembers = class_.staticMembers.length > 0;
	class_.hasMethods = class_.methods.length > 0;
}

function compileDoc(files) {
	var classes = {};
	var extraComments = [];

	// extract information from classes
	files.forEach(function (file) {
		console.log('compiling doc for ' + util.getFileName(file));

		var source = fs.readFileSync(file, { encoding: 'utf8' });

		var class_ = extractor.extract(source, file);

		Array.prototype.push.apply(extraComments, class_.extraComments);

		if (class_.constructor) {
			jsdocProcessor.all(class_, files);

			filterPrivates(class_);

			class_.file = file;

			classes[class_.constructor.name] = class_;
		}
	});

	// --- should stay elsewhere
	var constructorFromComment = function (comment) {
		jsdocProcessor.link(comment);
		return {
			name: comment.targetClass.itemName,
			params: _.pluck(comment.param, 'name'),
			comment: comment
		};
	};

	var memberFromComment = function (comment) {
		jsdocProcessor.link(comment);
		return {
			name: comment.targetClass.itemName,
			comment: comment
		};
	};

	var methodFromComment = constructorFromComment;
	var staticMethodFromComment = constructorFromComment;
	var staticMemberFromComment = memberFromComment;
	// ---

	// copy over the extra info from other classes
	// adding extras mentioned in @target-class
	extraComments.map(jsdocProcessor.compileComment)
	.forEach(function (extraComment) {
		var targetClassName = extraComment.targetClass.className;
		var targetClass = classes[targetClassName];

		if (!targetClass) {
			targetClass = {
				constructor: null,
				staticMethods: [],
				staticMembers: [],
				methods: [],
				members: []
			};
			classes[targetClassName] = targetClass;
		}

		switch (extraComment.targetClass.itemType) {
			case 'constructor':
				targetClass.constructor = constructorFromComment(extraComment);
				targetClass.requirePath = extraComment.requirePath.requirePath;
				targetClass.group = extraComment.group.group;
				break;
			case 'member':
				targetClass.members.push(memberFromComment(extraComment));
				break;
			case 'method':
				targetClass.methods.push(methodFromComment(extraComment));
				break;
			case 'static-member':
				targetClass.staticMembers.push(staticMemberFromComment(extraComment));
				break;
			case 'static-method':
				targetClass.staticMethods.push(staticMethodFromComment(extraComment));
				break;
		}
	});

	return classes;
}

function buildClasses(classes) {
	var classesArray = Object.keys(classes).map(function (className) {
		return classes[className];
	});

	console.log(classes['Entity'].constructor.comment);

	//var result =

	//fs.writeFileSync(args.outPath + util.PATH_SEPARATOR + 'tern-defs.json', result);
}

(function () {
	var classes = compileDoc(files);

	buildClasses(classes);

	console.log('tern definitions built');
})();