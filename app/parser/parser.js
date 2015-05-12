var _ = require('lodash');

module.exports = {
    parseGemfile : function(content) {
      var parsed = content.split('\n');
      var lst = {};
      _.forEach(parsed, function(e) {
        var sp = e.replace(/[',\r]/ig, '').replace(/[\s]+/ig, ' ').split(' ');
        if (sp.length >= 2) {
          if (sp[0] === 'gem') {
            var name = sp[1].replace(/[',\r]/ig, '').replace(',', '');
            var version = "*";
            if (sp.length > 2 && sp[2] !== "\r") {
              version = sp[2];
            }
            lst[name] = version;
          } else if (sp[0] === 'ruby') {
            var name = 'ruby';
            var version = sp[1];

            var engine = null;
            var engineKey = null;

            var engineVersion = null;
            var engineVersionKey = null;

            _.each(sp.slice(2), function(l, k) {

              if (l === ':engine') {
                engineKey = k + 2;
              }

              if (engineKey && engineKey === k) {
                engine = l;
              }

              if (l === ':engine_version') {
                engineVersionKey = k + 2;
              }

              if (engineVersionKey && engineVersionKey === k) {
                engineVersion = l;
              }
            });

            if (engine) {
              version += ', engine: ' + engine;

              if (engineVersion) {
                version += '@' + engineVersion;
              }  
            }
            
            lst[name] = version;
          }
        }
      });
      if (_.size(lst) > 0) {
        return {name: ' Ruby dependencies', list: lst};
      }
      return null;
    },

    parsePackageJson : function (content) {
      var parsed = JSON.parse(content);

      return {name: "Node.js dependnecies", list: parsed.dependencies};
    },

    parseComposerJson : function(content) {
      var parsed = JSON.parse(content);

      return {name: "PHP dependencies", list: parsed.require};
    },

    parse : function(type, content) {
      if (type === 'package.json') {
        return this.parsePackageJson(content);
      }
      if (type === 'composer.json') {
        return this.parseComposerJson(content);
      }
      if (type === 'Gemfile') {
        return this.parseGemfile(content);
      }
      return null;
    }
}