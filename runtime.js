﻿// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

var dic;

/////////////////////////////////////
// Plugin class
cr.plugins_.armaldio_translate = function (runtime) {
    this.runtime = runtime;
};

(function () {
    var isNWjs = false;
    var path = null;
    var fs = null;
    var gui = null;
    var child_process = null;
    var nw_appfolder = "";
    var nw_userfolder = "";
    var slash = "\\";
    var filelist = [];
    var droppedfile = "";
    var chosenpath = "";

    var pluginProto = cr.plugins_.armaldio_translate.prototype;

    /////////////////////////////////////
    // Object type class
    pluginProto.Type = function (plugin) {
        this.plugin = plugin;
        this.runtime = plugin.runtime;
    };

    var typeProto = pluginProto.Type.prototype;

    // called on startup for each object type
    typeProto.onCreate = function () {
        isNWjs = this.runtime.isNWjs;
        var self = this;

        if (isNWjs) {
            path = require("path");
            fs = require("fs");
            child_process = require("child_process");
            if (process["platform"] !== "win32")
                slash = "/";
            nw_appfolder = path["dirname"](process["execPath"]) + slash;
            nw_userfolder = (process["env"]["HOME"] || process["env"]["HOMEPATH"] || process["env"]["USERPROFILE"]) + slash;
            gui = require("nw.gui");
        }
    };

    /////////////////////////////////////
    // Instance class
    pluginProto.Instance = function (type) {
        this.type = type;
        this.runtime = type.runtime;
    };

    var instanceProto = pluginProto.Instance.prototype;

    // called whenever an instance is created
    instanceProto.onCreate = function () {
        this.dictionary = {};
        this.cur_key = ""; // current key in for-each loop
        this.key_count = 0;
    };

    instanceProto.saveToJSON = function () {
        return this.dictionary;
    };

    instanceProto.loadFromJSON = function (o) {
        this.dictionary = o;

        // Update the key count
        this.key_count = 0;

        for (var p in this.dictionary) {
            if (this.dictionary.hasOwnProperty(p))
                this.key_count++;
        }
    };

    /**BEGIN-PREVIEWONLY**/
    instanceProto.getDebuggerValues = function (propsections) {
        var props = [];
        props.push({
            "name": "Key count",
            "value": this.key_count,
            "readonly": true,
            "title": "NW.js",
            "properties": [{
                "name": "App folder",
                "value": nw_appfolder,
                "readonly": true
            }, {
                "name": "User folder",
                "value": nw_userfolder,
                "readonly": true
            }]
        });

        for (var p in this.dictionary) {
            if (this.dictionary.hasOwnProperty(p)) {
                props.push({
                    "name": p,
                    "value": this.dictionary[p]
                });
            }
        }

        propsections.push({
            "title": "Dictionary",
            "properties": props
        });
    };

    instanceProto.onDebugValueEdited = function (header, name, value) {
        this.dictionary[name] = value;
    };
    /**END-PREVIEWONLY**/

    //////////////////////////////////////
    // Conditions
    function Cnds() {
    };

    /**
     * @return {boolean}
     */
    Cnds.prototype.OnDictionaryLoaded = function () {
        return true;
    };

    Cnds.prototype.IsLanguageAvailable = function (language) {
        console.log(dic.availables[dic.availables.indexOf(language)]);
        return (dic.availables.indexOf(language) > -1)
    };

    pluginProto.cnds = new Cnds();

    //////////////////////////////////////
    // Actions
    function Acts() {
    };

    Acts.prototype.LoadDic = function (content) {
        dic = JSON.parse(content);
        console.log(dic);
    };

    Acts.prototype.SetLanguage = function (language) {
        console.log("Dic = " + dic);
        try {
            console.log(dic.availables.indexOf(language) > -1);

            if (dic.availables.indexOf(language) > -1) {

                dic.default_language = language;
                console.log("changing language to " + dic.default_language);

            }
        }
        catch (e) {
            console.log("Error in JSON");
        }
    };

    pluginProto.acts = new Acts();

    //////////////////////////////////////
    // Expressions
    // ret.set_float, ret.set_string, ret.set_any
    function Exps() {
    };

    /*
     ** TODO Not really replacing all ..
     */
    String.prototype.replaceAll = function (target, replacement) {
        return this.split(target).join(replacement);
    };

    Exps.prototype.GetValue = function (ret, value, replace) {
        console.log("default language " + dic.default_language);
        var finalStr = dic[value][dic.default_language];

        replace.split(";").forEach(function (repGroup) {
            var valkey = repGroup.split(":");
            finalStr = finalStr.replaceAll("$" + valkey[0] + "$", valkey[1]);
        });

        ret.set_any(finalStr);
    };

    Exps.prototype.GetLanguageValue = function (ret, value, replace, language) {
        console.log("default language " + dic.default_language);
        var finalStr = dic[value][language];

        replace.split(";").forEach(function (repGroup) {
            var valkey = repGroup.split(":");
            finalStr = finalStr.replaceAll("$" + valkey[0] + "$", valkey[1]);
        });

        ret.set_any(finalStr);
    };

    Exps.prototype.GetCurrentLanguage = function (ret) {
        ret.set_any(dic.default_language);
    };

    Exps.prototype.GetLangAt = function (ret, index) {
        ret.set_any(dic.availables[index]);
    };

    Exps.prototype.GetLangNumber = function (ret) {
        ret.set_int(dic.availables.length);
    };

    pluginProto.exps = new Exps();

}());